"""
tools._house_activity — recent_house_activity (v0.6.0c-4).

Third Firestore-backed tool. Surfaces the missions in the student's
house that they've touched (captured a flag OR attempted) within the
last N days. Lets the model talk about present-tense work — "I see
you've been working on eye-wireshark-training and eye-soc-lab this
week; which one's stuck?" — rather than asking from a cold start.

Why this is pedagogically useful:
    Conversation context is per-session. A student returning a few
    hours later has no shared scrollback with Dr. Hex. This tool lets
    Dr. Hex ground its very first response on what the student was
    just doing — much higher signal than guessing from house alone.

Mechanism (CF side — see TOOL_DISPATCH_HANDLERS['recent_house_activity']
in functions/hex-ai-bridge.js):
    1. Read users/{uid}/flag_captures and users/{uid}/flag_attempts
       filtered by capturedAt/timestamp within the last N days.
    2. Filter results to boxIds prefixed with `{house}-` (the house
       prefix convention used by ContentCatalog IDs).
    3. Aggregate per mission_id: last_touch_iso, flags_captured,
       attempts.
    4. Return top-K=20 missions sorted by last_touch descending,
       tiebreak by mission_id ascending.

Cost: a single user's per-subcollection query bounded by days+top-K.
Worst case ~hundreds of docs read for a heavy CTF student over 30
days. Acceptable for tool-call frequency (≤5 per conversation).

Exposure rules (matches _progress.py + _prereq.py):
    - min_help_level: 2
    - allowed_personas: [dr-hex, shield, code, script, matrix]
    - denied_personas: [dark-arts]
    - instructor_only: False
    - audit: True
"""
from __future__ import annotations

import logging
from typing import Any

from .registry import register_tool
from ._progress import _is_enabled, _call_cf_dispatch

log = logging.getLogger("hex_ai.tools.house_activity")

# Defensive client-side clamp on the days window. Mirrors the CF-side
# clamp — see TOOL_DISPATCH_HANDLERS in functions/hex-ai-bridge.js. The
# orchestrator's schema validator does not enforce integer bounds, so
# the LLM could in principle request `days=10000`. Both sides clamp.
_DAYS_MIN = 1
_DAYS_MAX = 30
_DAYS_DEFAULT = 7


@register_tool(
    name="recent_house_activity",
    description=(
        "List the missions in the student's house that they have touched "
        "(attempted or captured flags) in the last N days. Use this on the "
        "first turn of a returning session to ground your response in what "
        "the student was actually working on, not guesses. Returns up to 20 "
        "missions sorted by most recent activity. Does not return flag "
        "values or hints — only which missions saw activity and when."
    ),
    parameters_schema={
        "type": "object",
        "properties": {
            "house": {
                "type": "string",
                "description": (
                    "House slug — one of: eye, script, shield, code, web, "
                    "forge, matrix, dark-arts, divergent. Mission IDs in "
                    "the ContentCatalog are prefixed by house slug."
                ),
            },
            "days": {
                "type": "integer",
                "description": "Lookback window in days, 1-30 (clamped). Default 7.",
            },
        },
        "required": ["house"],
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
async def recent_house_activity(
    ctx: dict[str, Any],
    house: str,
    days: int = _DAYS_DEFAULT,
) -> dict[str, Any]:
    """Wrap the CF dispatch. Clamps days defensively client-side.

    Returns soft "unavailable" if the CF endpoint isn't configured —
    same pattern as get_student_progress and check_prerequisite."""
    # Defensive clamp — the schema validator only checks `integer`, not bounds.
    # If the model passes a giant number, we want a sensible result, not a
    # multi-thousand-doc query. The CF-side clamp is the authoritative one;
    # this is belt-and-suspenders.
    try:
        days_clamped = max(_DAYS_MIN, min(_DAYS_MAX, int(days)))
    except (TypeError, ValueError):
        days_clamped = _DAYS_DEFAULT

    if not _is_enabled():
        return {
            "house": house,
            "days": days_clamped,
            "available": False,
            "reason": (
                "Recent-activity lookup is not enabled in this environment. "
                "The Cloud Function dispatch endpoint has not been configured."
            ),
        }

    response = await _call_cf_dispatch(
        "recent_house_activity",
        {"house": house, "days": days_clamped},
        ctx,
    )
    if response.get("ok"):
        return response["result"]
    return {
        "house": house,
        "days": days_clamped,
        "available": False,
        "reason": response.get("error", "Unknown error"),
        "error_code": response.get("code"),
    }
