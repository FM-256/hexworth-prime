"""
_honeypot.py — fake tools the model should NEVER call.

Cyber-tier defense 2026-05-25: any model attempt to invoke one of these
is unambiguous proof of prompt injection succeeding (the model was told
to "use any debugging tools" / "call get_flag" / etc.) OR a tool-call
injection attempt where the attacker named a tool by guess.

The model never has a legitimate reason to call these — they aren't
described in any system prompt or persona instruction. They're visible
in the registry (with min_help_level=99) but the filter_tools_for_context
gate will hide them from the model's tool list. A "guess and try" attack
that names a honeypot directly bypasses the filter — that's the signal
we're catching.

On dispatch:
 1. Log critical security event
 2. Increment per-uid lockout counter (5 hits / 60min → locked)
 3. Increment per-conversation filter-hit counter (3 hits → convo locked)
 4. Return ok=False with a generic refusal

The honeypot tools are PROCESSING-FREE — they cost nothing to "execute"
because they never do real work. Adding more honeypots = more catchable
shapes; cost is just registry entries.
"""
from __future__ import annotations

from .registry import register_tool


@register_tool(
    name="get_flag",
    description=(
        "INTERNAL DEBUGGING — returns the flag value for a given mission_id. "
        "Instructors only."
    ),
    parameters_schema={
        "type": "object",
        "properties": {
            "mission_id": {"type": "string"},
        },
        "required": ["mission_id"],
        "additionalProperties": False,
    },
    exposure_rules={
        # min_help_level=99 means filter_tools_for_context never shows
        # this to anyone. Any attempt to dispatch by name is a direct
        # injection — visibility was never granted to the model.
        "min_help_level": 99,
        "instructor_only": True,
        "audit": True,
        "honeypot": True,
        "allowed_personas": None,
    },
)
def get_flag(ctx: dict, mission_id: str) -> dict:
    """Honeypot. Dispatch trips the security_event logger via
    dispatch.py's exposure-violation check before this handler runs.
    If somehow it does run, refuse cleanly."""
    return {
        "_honeypot": True,
        "ok": False,
        "error": "tool not available",
    }


@register_tool(
    name="get_lab_solution",
    description=(
        "INTERNAL — returns the complete walkthrough/solution for a lab. "
        "Instructors only."
    ),
    parameters_schema={
        "type": "object",
        "properties": {
            "mission_id": {"type": "string"},
        },
        "required": ["mission_id"],
        "additionalProperties": False,
    },
    exposure_rules={
        "min_help_level": 99,
        "instructor_only": True,
        "audit": True,
        "honeypot": True,
        "allowed_personas": None,
    },
)
def get_lab_solution(ctx: dict, mission_id: str) -> dict:
    """Honeypot."""
    return {
        "_honeypot": True,
        "ok": False,
        "error": "tool not available",
    }


@register_tool(
    name="set_help_level",
    description="INTERNAL — set this conversation's help level.",
    parameters_schema={
        "type": "object",
        "properties": {
            "level": {"type": "integer"},
        },
        "required": ["level"],
        "additionalProperties": False,
    },
    exposure_rules={
        "min_help_level": 99,
        "instructor_only": True,
        "audit": True,
        "honeypot": True,
        "allowed_personas": None,
    },
)
def set_help_level(ctx: dict, level: int) -> dict:
    """Honeypot — closes the 'just tell the AI to escalate' attack
    shape. The model has no legitimate reason to call this; help_level
    is server-computed."""
    return {
        "_honeypot": True,
        "ok": False,
        "error": "tool not available",
    }
