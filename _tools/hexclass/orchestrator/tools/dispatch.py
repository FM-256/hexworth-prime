"""
tools.dispatch — validate + execute a tool_call from ollama.

Validation chain (any failure → ToolError, nothing executes):
    1. Tool exists in registry
    2. Tool is currently visible to this persona/level/role (defense in depth —
       the model shouldn't see disallowed tools, but enforce again)
    3. parameters dict satisfies parameters_schema (structural — required keys,
       no extra keys when additionalProperties is false, type checks)

Execution:
    4. Build ctx dict from caller-supplied context — handlers receive ctx as
       the first positional argument, never read UID/role from LLM-supplied
       parameters
    5. Await (or run sync) the handler
    6. Return {"ok": True, "result": ...} or {"ok": False, "error": ..., "code": ...}

v0.6.0a does NOT yet:
    - Apply result-shaping per help-level (planned for v0.6.0d hint tool)
    - Write audit log to Firestore (planned for v0.6.0e)
    - Enforce per-conversation max_tool_calls cap (planned for v0.6.0b when
      the registry is actually wired into /chat)
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from .exposure import _is_visible
from .registry import TOOL_REGISTRY, ToolError, ToolMetadata

log = logging.getLogger("hex_ai.tools.dispatch")


def _validate_parameters(meta: ToolMetadata, parameters: dict[str, Any]) -> None:
    """
    Minimal structural validation against parameters_schema.

    Does NOT use the jsonschema library (deliberately — keeping the
    scaffolding's dependency surface tight). v0.6.0a checks:
        - parameters is a dict
        - required keys are present
        - no unexpected keys when additionalProperties is False
        - type of each named property matches schema's `type` (string/number/boolean/object/array)

    Real JSON Schema validation (oneOf, pattern, enum, etc.) lands in
    v0.6.0b alongside the first real student-facing tool. The current
    scope is "prevent a misbehaving model from sending obviously-wrong
    inputs" — not "validate every JSON Schema construct".
    """
    if not isinstance(parameters, dict):
        raise ToolError(
            f"parameters must be a dict, got {type(parameters).__name__}",
            code="schema_type",
        )

    schema = meta.parameters_schema
    properties = schema.get("properties", {})
    required = schema.get("required", [])
    additional_allowed = schema.get("additionalProperties", True)

    for key in required:
        if key not in parameters:
            raise ToolError(f"missing required parameter: {key}", code="schema_required")

    if additional_allowed is False:
        for key in parameters:
            if key not in properties:
                raise ToolError(f"unexpected parameter: {key}", code="schema_additional")

    type_to_python = {
        "string": str,
        "number": (int, float),
        "integer": int,
        "boolean": bool,
        "object": dict,
        "array": list,
    }
    for key, prop_schema in properties.items():
        if key not in parameters:
            continue
        expected_type = prop_schema.get("type")
        if expected_type and expected_type in type_to_python:
            if not isinstance(parameters[key], type_to_python[expected_type]):
                raise ToolError(
                    f"parameter {key!r} expected type {expected_type}, "
                    f"got {type(parameters[key]).__name__}",
                    code="schema_type",
                )


async def dispatch_tool_call(
    name: str,
    parameters: dict[str, Any],
    ctx: dict[str, Any],
) -> dict[str, Any]:
    """
    Validate and execute a tool_call.

    ctx is the SOURCE OF TRUTH for uid/role/persona/help_level. Tool
    handlers must read identity from ctx, never from parameters. This
    closes the "model crafts parameters that bypass identity" surface.

    Returns:
        {"ok": True,  "result": <handler return>}   on success
        {"ok": False, "error": <message>, "code": <classifier>}  on failure
    """
    if name not in TOOL_REGISTRY:
        return {"ok": False, "error": f"unknown tool: {name}", "code": "unknown_tool"}

    meta = TOOL_REGISTRY[name]

    # Defense in depth: filter said this tool was visible when the request
    # started. Re-check at dispatch time in case the request crossed a
    # config-reload boundary (rare, but cheap to verify).
    if not _is_visible(meta, ctx.get("persona_slug", ""), ctx.get("help_level", 0), ctx.get("role", "")):
        return {
            "ok": False,
            "error": f"tool {name} not allowed for current persona/level/role",
            "code": "exposure_violation",
        }

    try:
        _validate_parameters(meta, parameters)
    except ToolError as e:
        return {"ok": False, "error": str(e), "code": e.code}

    try:
        if meta.is_async:
            result = await meta.handler(ctx, **parameters)
        else:
            # Run sync handlers in a thread so they don't block the event loop.
            # Tools that do I/O should be async; this is a fallback for pure
            # functions like the hex_ai_version probe.
            result = await asyncio.to_thread(meta.handler, ctx, **parameters)
    except ToolError as e:
        return {"ok": False, "error": str(e), "code": e.code}
    except Exception as e:
        # NOTE: catching `Exception` (not `BaseException`) is intentional.
        # `asyncio.CancelledError` and `KeyboardInterrupt` inherit from
        # BaseException, NOT Exception, in Python 3.8+. They are deliberately
        # left to propagate so the parent request can cancel cleanly. Do NOT
        # widen this to `BaseException` "to be safe" — that would break the
        # cancellation invariant.
        log.exception("tool %s raised unexpected exception", name)
        return {"ok": False, "error": f"handler crashed: {e}", "code": "handler_crash"}

    log.info("tool dispatched: name=%s uid=%s persona=%s level=%d",
             name, ctx.get("uid"), ctx.get("persona_slug"), ctx.get("help_level"))
    return {"ok": True, "result": result}
