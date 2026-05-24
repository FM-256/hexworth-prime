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
    """All facts about a single registered tool. Immutable after registration."""
    name: str
    description: str
    parameters_schema: dict[str, Any]
    returns_schema: dict[str, Any] | None
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
TOOL_REGISTRY: dict[str, ToolMetadata] = {}


def _default_exposure_rules() -> dict[str, Any]:
    """The conservative default: visible to no one until rules are set."""
    return {
        "min_help_level": 99,        # deliberately high — silent unless overridden
        "allowed_personas": None,    # None = "all allowed if min_help_level / other gates pass"
        "denied_personas": [],
        "instructor_only": False,
        "audit": True,               # default to auditing — safer than silent
    }


def register_tool(
    *,
    name: str,
    description: str,
    parameters_schema: dict[str, Any],
    returns_schema: dict[str, Any] | None = None,
    exposure_rules: dict[str, Any] | None = None,
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """
    Decorator registering an async function as a tool callable by the model.

    Required arguments — keyword-only by design (positional would be ambiguous):
        name              — the function name the model will use in tool_calls
        description       — what the tool does, shown to the model
        parameters_schema — JSON Schema dict for tool's input
        returns_schema    — JSON Schema dict for tool's output (optional)
        exposure_rules    — per the design doc; defaults are deliberately
                            restrictive (min_help_level=99 = invisible)

    The decorated function must accept `ctx` as the first parameter (a dict
    carrying uid, role, persona_slug, help_level — set by dispatch_tool_call).
    Additional parameters must match parameters_schema. The function may be
    sync or async; dispatch awaits async functions and wraps sync ones.

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
        TOOL_REGISTRY[name] = ToolMetadata(
            name=name,
            description=description,
            parameters_schema=parameters_schema,
            returns_schema=returns_schema,
            exposure_rules=rules,
            handler=fn,
            is_async=inspect.iscoroutinefunction(fn),
        )
        log.info(
            "register_tool: %s (min_help_level=%d, instructor_only=%s, is_async=%s)",
            name, rules["min_help_level"], rules["instructor_only"],
            inspect.iscoroutinefunction(fn),
        )
        return fn

    return decorator
