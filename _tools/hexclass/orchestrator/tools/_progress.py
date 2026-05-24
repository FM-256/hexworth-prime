"""
tools._progress — get_student_progress (v0.6.0c-2).

First Firestore-backed tool. Calls back to the hexAiToolDispatch CF
(Cloud Function bridge) which runs the Admin SDK query and returns
the result. The orchestrator does NOT have firebase-admin installed
locally — per the v0.6.0c design (Path B), Firestore access is
centralized in functions/.

Tool is DORMANT until both:
  1. HEX_AI_TOOL_DISPATCH_URL env var is set (points to the CF)
  2. HEX_AI_API_KEY env var is set (shared secret matching the
     hexAiToolDispatch CF's expected key)

When either is missing, the handler returns an error result that the
model sees in its context — it can choose to apologize or try a
different approach. The chat path is not broken; the tool just isn't
useful until the CF is deployed.

Exposure rules (from the v0.6.0c design doc):
  - min_help_level: 1     (Conceptual — student needs to have asked
                          for any help before progress lookup is
                          considered)
  - allowed_personas: [dr-hex, shield, code, script, matrix]
                          (the houses where progress-aware tutoring
                          makes pedagogical sense)
  - denied_personas: [dark-arts]
                          (offensive-house persona doesn't get
                          progress lookups — different teaching
                          paradigm)
  - instructor_only: False
  - audit: True
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from typing import Any

import httpx

from .registry import register_tool

log = logging.getLogger("hex_ai.tools.progress")

TOOL_DISPATCH_URL = os.environ.get("HEX_AI_TOOL_DISPATCH_URL", "")
API_KEY = os.environ.get("HEX_AI_API_KEY", "")
DISPATCH_TIMEOUT_S = float(os.environ.get("HEX_AI_TOOL_DISPATCH_TIMEOUT_S", "15.0"))


def _is_enabled() -> bool:
    return bool(TOOL_DISPATCH_URL and API_KEY)


async def _call_cf_dispatch(tool: str, parameters: dict[str, Any], ctx: dict[str, Any]) -> dict[str, Any]:
    """Post to the CF dispatch endpoint. Returns the parsed JSON response
    OR a synthesized error dict on failure (so the dispatch loop never
    sees an exception). Failures are logged but never propagate."""
    body = {"tool": tool, "parameters": parameters, "ctx": ctx}
    try:
        async with httpx.AsyncClient(timeout=DISPATCH_TIMEOUT_S) as client:
            r = await client.post(
                TOOL_DISPATCH_URL,
                json=body,
                headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
            )
            if r.status_code >= 400:
                try:
                    return r.json()
                except (ValueError, json.JSONDecodeError):
                    return {
                        "ok": False,
                        "error": f"CF returned {r.status_code}: {r.text[:200]}",
                        "code": "cf_error",
                    }
            return r.json()
    except (httpx.HTTPError, asyncio.TimeoutError) as e:
        log.warning("tool dispatch CF call failed for tool=%s: %s", tool, e)
        return {"ok": False, "error": f"CF unreachable: {e}", "code": "cf_unreachable"}


@register_tool(
    name="get_student_progress",
    description=(
        "Look up the student's progress on a specific mission/lab — how many "
        "flags they've captured out of the total, how many failed attempts "
        "in the last 30 minutes, and the timestamp of their last attempt. "
        "Use this to ground hints in concrete progress, NOT to reveal "
        "answers. Never use this to lecture the student on what they "
        "should have done — use it to ask the right next question."
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
        "min_help_level": 1,
        "allowed_personas": ["dr-hex", "shield", "code", "script", "matrix"],
        "denied_personas": ["dark-arts"],
        "instructor_only": False,
        "audit": True,
    },
)
async def get_student_progress(ctx: dict[str, Any], mission_id: str) -> dict[str, Any]:
    """Wrapper around the CF callback. Returns the tool result dict OR a
    structured error if the CF is not configured / unreachable.

    Tool handlers can throw or return error shapes — dispatch wraps either
    into a {"ok": False, ...} response. We choose the return-error path so
    the model sees a concrete message in its context."""
    if not _is_enabled():
        return {
            "mission_id": mission_id,
            "available": False,
            "reason": (
                "Progress lookup is not enabled in this environment. "
                "The Cloud Function dispatch endpoint has not been configured."
            ),
        }

    response = await _call_cf_dispatch(
        "get_student_progress",
        {"mission_id": mission_id},
        ctx,
    )
    # The CF returns {"ok": bool, "result": ...} OR {"ok": false, "error": ...}
    if response.get("ok"):
        return response["result"]
    # On error, surface a soft "couldn't look it up" rather than crash —
    # the model can apologize and continue.
    return {
        "mission_id": mission_id,
        "available": False,
        "reason": response.get("error", "Unknown error"),
        "error_code": response.get("code"),
    }
