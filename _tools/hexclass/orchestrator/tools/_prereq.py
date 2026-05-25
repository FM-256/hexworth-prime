"""
tools._prereq — check_prerequisite (v0.6.0c-4).

Second Firestore-backed tool (after get_student_progress). Tells the model
which flag in the current mission the student should be working on NEXT
based on the mission's `flagOrder` and the student's captures so far.

Why this is pedagogically useful:
    Many missions require flags to be captured in order (validateGate3
    enforces this server-side at functions/index.js:3375-3383). When a
    student asks Dr. Hex "what should I do?" the model benefits from
    knowing exactly which flag is the current target rather than guessing
    from progress percentages.

Mechanism (CF side — see TOOL_DISPATCH_HANDLERS['check_prerequisite']
in functions/hex-ai-bridge.js):
    1. Read flag_registry/{mission_id}.flagOrder (the canonical ordering).
    2. Read users/{uid}/flag_captures filtered by boxId == mission_id.
    3. Walk flagOrder and find the first uncaptured flag.
    4. Return: next_flag_id, prior captures, total flags, ready_for_next.

If flag_registry/{mission_id} doesn't exist OR has no flagOrder:
    Return ready_for_next=True, has_ordering=False — there are no
    prerequisites to gate. The model can still answer; it just won't
    be able to name the "next" flag.

Exposure rules (matches _progress.py for consistency across "what does
this student have done" tools):
    - min_help_level: 2     (Directional — at L1 the model should be
                            naming topic areas, not querying registry)
    - allowed_personas: [dr-hex, shield, code, script, matrix]
    - denied_personas: [dark-arts]  (offensive house — different teaching
                                     paradigm, no progress-style lookup)
    - instructor_only: False
    - audit: True
"""
from __future__ import annotations

import logging
from typing import Any

from .registry import register_tool
from ._progress import _is_enabled, _call_cf_dispatch

log = logging.getLogger("hex_ai.tools.prereq")


@register_tool(
    name="check_prerequisite",
    description=(
        "Check whether the student has completed prior flags in a multi-flag "
        "mission and identify which flag is the next target. Use this when "
        "the student asks 'what should I do next?' or seems stuck — it lets "
        "you ground guidance in the specific flag they should be focused on, "
        "not generic advice about the mission as a whole. Returns the next "
        "uncaptured flag in the canonical order, or signals that the mission "
        "has no enforced ordering. Never use this to skip past flags the "
        "student hasn't earned."
    ),
    parameters_schema={
        "type": "object",
        "properties": {
            "mission_id": {
                "type": "string",
                "description": "The lab/box ID. Same as the orchestrator's mission_id context.",
            },
        },
        "required": ["mission_id"],
        "additionalProperties": False,
    },
    exposure_rules={
        "min_help_level": 2,
        "allowed_personas": ["dr-hex", "shield", "code", "script", "matrix"],
        "denied_personas": ["dark-arts"],
        "instructor_only": False,
        "audit": True,
    },
)
async def check_prerequisite(ctx: dict[str, Any], mission_id: str) -> dict[str, Any]:
    """Wrap the CF dispatch. Returns a soft "unavailable" result if the
    CF endpoint is not configured — same pattern as get_student_progress."""
    if not _is_enabled():
        return {
            "mission_id": mission_id,
            "available": False,
            "reason": (
                "Prerequisite lookup is not enabled in this environment. "
                "The Cloud Function dispatch endpoint has not been configured."
            ),
        }

    response = await _call_cf_dispatch(
        "check_prerequisite",
        {"mission_id": mission_id},
        ctx,
    )
    if response.get("ok"):
        return response["result"]
    return {
        "mission_id": mission_id,
        "available": False,
        "reason": response.get("error", "Unknown error"),
        "error_code": response.get("code"),
    }
