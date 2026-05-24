"""
error_sanitizer.py — translate internal tool errors into safe shapes for
model and browser consumption.

Threat model
------------
Tools occasionally fail with errors that contain internal details — Firebase
console URLs, Firestore index-building messages, stack-trace fragments,
internal IDs. These are useful to operators (logged to the audit collection
verbatim) but UNSAFE to:

 - The model (it parrots them back to students; see drhex-q-leak in
   _docs/operations/dr-hex-quality-log.md)
 - The browser (raw error strings reach client JS via SSE tool_call_done
   events; even if the current test page doesn't render them, the wire
   is open)

This module never sees the audit-log path. It returns new dicts; the
original `result` is untouched and gets fired to Firestore unchanged via
tools.audit.schedule_invocation.

Two output paths, two sanitizers
--------------------------------
The model needs enough signal to decide whether to retry, rephrase, or
continue. The browser only needs a minimal display string. Conflating
them either over-informs the browser or under-informs the model — Nancy
review 2026-05-24.

Messaging principles
--------------------
- Transient codes (handler_crash, auth) use inert wording ("Could not
  retrieve this data"). Avoid "temporarily" — that word triggers model
  retry loops on errors that will not self-heal mid-session.
- Permanent structural codes (schema_*, unknown_tool, exposure_violation)
  use explicit "Skip and proceed" — never suggest the model retry.
- Browser gets a single canonical "Tool unavailable" regardless of code.
- Tool name CAN appear in messages (tool names are public). Field names
  in schema errors are also safe in principle (Nancy), but extracting
  them from dispatch.py's free-form error strings is brittle. Future
  work: add a structured `detail` field to dispatch return shapes so
  the sanitizer can include `detail.field` for schema_required cases.
"""
from typing import Any

# Messages the model sees. Keep them inert (no "temporarily") to avoid
# retry-loop behavior on errors that will not self-heal.
_MODEL_MESSAGES_BY_CODE: dict[str, str] = {
    # Transient — external dependency could recover; don't suggest retry though.
    "handler_crash": "Could not retrieve this data. Continue with what you have.",
    "auth":          "Tool authentication unavailable. Continue without this data.",
    # Permanent structural — will not succeed on retry.
    "unknown_tool":      "Tool not registered. Skip and proceed.",
    "schema_required":   "Tool call was missing a required field. Skip and proceed.",
    "schema_additional": "Tool call had unexpected fields. Skip and proceed.",
    "schema_type":       "Tool call had an argument of the wrong type. Skip and proceed.",
    "exposure_violation": "Tool not available at this help level. Skip.",
}

_MODEL_DEFAULT = "Could not retrieve this data. Continue with what you have."
_BROWSER_MESSAGE = "Tool unavailable"


def sanitize_tool_error_for_model(result: dict[str, Any]) -> dict[str, Any]:
    """Pass-through on ok=True. On ok=False, replace `error` with the
    code-mapped model-safe message. Returns a new dict; input is never
    mutated."""
    if result.get("ok") is True:
        return result
    code = result.get("code") or "handler_crash"
    return {
        "ok": False,
        "code": code,
        "error": _MODEL_MESSAGES_BY_CODE.get(code, _MODEL_DEFAULT),
    }


def sanitize_tool_error_for_browser(result: dict[str, Any]) -> dict[str, Any]:
    """For SSE tool_call_done payloads going to client JS. Reduces error
    detail to a minimal display string regardless of code. Returns a new
    dict."""
    if result.get("ok") is True:
        return result
    return {
        "ok": False,
        "code": result.get("code") or "handler_crash",
        "error": _BROWSER_MESSAGE,
    }
