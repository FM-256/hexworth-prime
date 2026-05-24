"""
tools.registry — central tool registry + @register_tool decorator.

The registry is a process-global dict populated at import time by the
decorator. Modules under tools/ that define tools call @register_tool at
module scope; importing the tools package (see __init__.py) triggers
registration via side-effect import.
"""
from __future__ import annotations

import inspect
import logging
from dataclasses import dataclass, field
from typing import Any, Callable

log = logging.getLogger("hex_ai.tools")


class ToolError(Exception):
    """Raised by dispatch_tool_call for any failure: unknown tool, exposure
    violation, schema mismatch, handler exception. Distinct exception type
    so callers can catch specifically."""
    def __init__(self, message: str, code: str = "tool_error"):
        super().__init__(message)
        self.code = code


@dataclass
class ToolMetadata:
    """All facts about a single registered tool. Immutable after registration.

    Note: `returns_schema` was present in v0.6.0a's first draft but removed
    per Nancy review — there is no result-validation code path yet, so the
    field was dead weight that gave tool authors a false promise of
    enforcement. Re-adding in v0.6.0d alongside actual handler-output
    validation."""
    name: str
    description: str
    parameters_schema: dict[str, Any]
    exposure_rules: dict[str, Any]
    handler: Callable[..., Any]
    is_async: bool

    def to_ollama_format(self) -> dict[str, Any]:
        """Render as the dict shape ollama's /api/chat expects in `tools`."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters_schema,
            },
        }


# Process-global registry. Read by callers via tools.TOOL_REGISTRY; written
# only by @register_tool. Convention: do not mutate from outside the registry
# module — tests can patch a fresh dict if they need isolation.
#
# Invariant (Nancy 2026-05-24): APPEND-ONLY AFTER STARTUP. The orchestrator
# does not currently support deregistration or hot-reload of tools. The
# dispatch path re-reads TOOL_REGISTRY via _is_visible() on every call;
# concurrent deregistration would create a TOCTOU window where filter_tools_for_context
# included a tool that dispatch then refused. If hot-reload becomes a need,
# snapshot the registry at request start and use the snapshot through dispatch.
TOOL_REGISTRY: dict[str, ToolMetadata] = {}


def _default_exposure_rules() -> dict[str, Any]:
    """The conservative default: visible to no one until rules are set.

    Both `min_help_level` (high) AND `allowed_personas` (empty allowlist)
    default to "block" — per Nancy review 2026-05-23, an asymmetric default
    (one axis restrictive, the other permissive) creates a footgun: an
    author who provides partial exposure_rules and forgets allowed_personas
    silently gets a tool exposed to every persona.

    Semantics of allowed_personas:
        []     — explicit empty allowlist; no persona sees this tool
        None   — explicit no-allowlist constraint; all personas allowed
                 (must be passed EXPLICITLY by the tool author)
        [...]  — only listed personas see this tool

    Semantics of audit (Nancy 2026-05-24):
        True   — intent: every invocation written to Firestore
                 tool_invocations collection for instructor review.
                 As of v0.6.0b the WRITE PATH IS NOT IMPLEMENTED —
                 invocations land in the in-memory tool_invocations
                 list and (for instructor/operator role) the
                 show_thinking response. Firestore audit log lands
                 in v0.6.0c-3 via the CF callback.
        False  — explicit "do not audit" (e.g. operator-self probes
                 like hex_ai_version where audit storage isn't worth it)
    """
    return {
        "min_help_level": 99,        # high — silent unless overridden
        "allowed_personas": [],      # empty allowlist — invisible unless overridden
        "denied_personas": [],
        "instructor_only": False,
        "audit": True,               # default to auditing — safer than silent
    }


def register_tool(
    *,
    name: str,
    description: str,
    parameters_schema: dict[str, Any],
    exposure_rules: dict[str, Any] | None = None,
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """
    Decorator registering an async function as a tool callable by the model.

    Required arguments — keyword-only by design (positional would be ambiguous):
        name              — the function name the model will use in tool_calls
        description       — what the tool does, shown to the model
        parameters_schema — JSON Schema dict for tool's input
        exposure_rules    — per the design doc; defaults are deliberately
                            restrictive (min_help_level=99 + empty allowlist
                            = invisible to everyone unless overridden)

    The decorated function must accept `ctx` as the first parameter (a dict
    carrying uid, role, persona_slug, help_level — set by dispatch_tool_call).
    Additional parameters must match parameters_schema. The function may be
    sync or async; dispatch awaits async functions and wraps sync ones in
    asyncio.to_thread. Sync handlers trigger a log.warning at registration
    time (per Nancy review) — sync should only be used for pure-function
    handlers like version probes; any I/O belongs in an async handler.

    Returns the original function unchanged (registration is the side effect).
    """
    rules = _default_exposure_rules()
    if exposure_rules:
        rules.update(exposure_rules)

    def decorator(fn: Callable[..., Any]) -> Callable[..., Any]:
        if name in TOOL_REGISTRY:
            raise ValueError(
                f"register_tool: name {name!r} already registered "
                f"(existing handler: {TOOL_REGISTRY[name].handler.__qualname__})"
            )
        # Lightweight schema sanity: parameters_schema must be a JSON Schema
        # object — not a list, not None. We don't run a full schema validator
        # at registration; that happens at dispatch time on the actual input.
        if not isinstance(parameters_schema, dict) or parameters_schema.get("type") != "object":
            raise ValueError(
                f"register_tool({name!r}): parameters_schema must be a JSON Schema "
                f"with type='object'; got {parameters_schema!r}"
            )
        is_async = inspect.iscoroutinefunction(fn)
        TOOL_REGISTRY[name] = ToolMetadata(
            name=name,
            description=description,
            parameters_schema=parameters_schema,
            exposure_rules=rules,
            handler=fn,
            is_async=is_async,
        )
        log.info(
            "register_tool: %s (min_help_level=%d, instructor_only=%s, is_async=%s)",
            name, rules["min_help_level"], rules["instructor_only"], is_async,
        )
        if not is_async:
            log.warning(
                "register_tool: %s is SYNC — only use sync for pure functions. "
                "Tools that do I/O (Firestore, HTTP, file) must be async to avoid "
                "blocking the event loop in asyncio.to_thread's bounded pool.",
                name,
            )
        return fn

    return decorator
