"""
quality_log.py, AI-26 sink for AI response-quality observations.

Parallel to tools/security_log.py but writes to a different Firestore
collection (dr_hex_quality_observations vs dr_hex_security_events) and
carries the operator-quality-dashboard schema (category, observation,
studentQueryFirst60, modelResponseFirst200, etc.).

Architecture (mirrors security_log):
 - Bounded retry deque (200 events). Drop-oldest on overflow.
 - Same X-API-Key auth (HEX_AI_API_KEY) shared with the rest of the
   orchestrator -> CF chain.
 - Fire-and-forget. Caller never awaits this. Failure is silent except
   for the drops_total counter.

Write path: HTTP POST -> hexAiQualityObservation CF -> Firestore Admin SDK
write to dr_hex_quality_observations.

Key shape:
    HEX_AI_QUALITY_URL  - env var, full CF URL for hexAiQualityObservation
    HEX_AI_API_KEY      - env var, shared X-API-Key

Voice_linter code to drhex-q-* category mapping (from
_docs/operations/dr-hex-quality-log.md):
    no_flag_value             -> drhex-q-help-ceiling (P1, security)
    no_walkthrough_paste      -> drhex-q-help-ceiling (P1, security)
    no_forbidden_disclosure   -> drhex-q-help-ceiling (P1, security)
    no_lived_experience       -> drhex-q-persona-drift (P3)
    no_emoji                  -> drhex-q-persona-drift (P3)
    no_fake_casual            -> drhex-q-persona-drift (P3)
    help_level_present        -> drhex-q-persona-drift (P3)
"""
from __future__ import annotations

import asyncio
import collections
import logging
import os
from typing import Any, Optional

import httpx

log = logging.getLogger("hex_ai.quality_log")

CF_URL = os.environ.get("HEX_AI_QUALITY_URL", "")
API_KEY = os.environ.get("HEX_AI_API_KEY", "")
TIMEOUT_S = float(os.environ.get("HEX_QUALITY_LOG_TIMEOUT_S", "5.0"))

_QUEUE_MAX = 200
_queue: collections.deque[dict[str, Any]] = collections.deque(maxlen=_QUEUE_MAX)
_drainer_started = False
_drops_total = 0


# Mapping from voice_linter LintViolation.code to (category, default_priority).
# Used by main.py when bridging voice_linter findings into quality observations.
VOICE_LINTER_CODE_TO_CATEGORY: dict[str, tuple[str, str]] = {
    "no_flag_value":           ("drhex-q-help-ceiling", "P1"),
    "no_walkthrough_paste":    ("drhex-q-help-ceiling", "P1"),
    "no_forbidden_disclosure": ("drhex-q-help-ceiling", "P1"),
    "no_lived_experience":     ("drhex-q-persona-drift", "P3"),
    "no_emoji":                ("drhex-q-persona-drift", "P3"),
    "no_fake_casual":          ("drhex-q-persona-drift", "P3"),
    "help_level_present":      ("drhex-q-persona-drift", "P3"),
}


def is_enabled() -> bool:
    return bool(CF_URL and API_KEY)


def drops_total() -> int:
    return _drops_total


def _build_observation(
    *,
    category: str,
    observation: str,
    student_query_first60: str,
    model_response_first200: str,
    conversation_id: Optional[str] = None,
    mission_id: Optional[str] = None,
    persona: Optional[str] = None,
    help_level: Optional[int] = None,
    priority: Optional[str] = None,
    tool_invocation_doc_ids: Optional[list[str]] = None,
    flagged_by_source: str = "voice_linter",
    notes: Optional[str] = None,
) -> dict[str, Any]:
    return {
        "category": category,
        "observation": observation[:500],
        "studentQueryFirst60": (student_query_first60 or "")[:60],
        "modelResponseFirst200": (model_response_first200 or "")[:200],
        "conversationId": conversation_id,
        "missionId": mission_id,
        "persona": persona,
        "helpLevel": help_level,
        "priority": priority,
        "toolInvocationDocIds": tool_invocation_doc_ids or [],
        "flaggedBySource": flagged_by_source,
        "notes": notes,
    }


async def _post_one(payload: dict[str, Any]) -> bool:
    if not is_enabled():
        return False
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            r = await client.post(
                CF_URL,
                json=payload,
                headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
            )
            return 200 <= r.status_code < 300
    except Exception as e:
        log.warning("quality_log: POST failed: %s", e)
        return False


async def _drainer_loop() -> None:
    """Drain queue. One pass = one retry per event. Drops on second fail."""
    while True:
        await asyncio.sleep(2.0)
        n = len(_queue)
        if n == 0:
            continue
        batch = []
        for _ in range(min(n, 20)):
            try:
                batch.append(_queue.popleft())
            except IndexError:
                break
        for ev in batch:
            if not await _post_one(ev):
                global _drops_total
                _drops_total += 1


def _ensure_drainer() -> None:
    global _drainer_started
    if _drainer_started:
        return
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return
    loop.create_task(_drainer_loop())
    _drainer_started = True


def schedule_observation(
    *,
    category: str,
    observation: str,
    student_query_first60: str,
    model_response_first200: str,
    conversation_id: Optional[str] = None,
    mission_id: Optional[str] = None,
    persona: Optional[str] = None,
    help_level: Optional[int] = None,
    priority: Optional[str] = None,
    tool_invocation_doc_ids: Optional[list[str]] = None,
    flagged_by_source: str = "voice_linter",
    notes: Optional[str] = None,
) -> None:
    """Fire-and-forget observation schedule. Same posture as
    security_log.schedule_event but routes to dr_hex_quality_observations.

    Caller MUST NOT await this. Returns immediately. Background task
    handles the HTTP POST. Failures land in drops_total (silently)."""
    if not is_enabled():
        log.info("quality_log: skipped (HEX_AI_QUALITY_URL not set): category=%s", category)
        return
    payload = _build_observation(
        category=category,
        observation=observation,
        student_query_first60=student_query_first60,
        model_response_first200=model_response_first200,
        conversation_id=conversation_id,
        mission_id=mission_id,
        persona=persona,
        help_level=help_level,
        priority=priority,
        tool_invocation_doc_ids=tool_invocation_doc_ids,
        flagged_by_source=flagged_by_source,
        notes=notes,
    )
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        log.warning("quality_log: no event loop; observation dropped: category=%s", category)
        return
    _ensure_drainer()
    # Immediate attempt as a task; failure routes to retry queue.
    async def _try_then_queue() -> None:
        if not await _post_one(payload):
            try:
                _queue.append(payload)
            except Exception:
                pass
    loop.create_task(_try_then_queue())


def schedule_for_voice_linter(
    *,
    code: str,
    observation: str,
    student_query_first60: str,
    model_response_first200: str,
    conversation_id: Optional[str] = None,
    mission_id: Optional[str] = None,
    persona: Optional[str] = None,
    help_level: Optional[int] = None,
    notes: Optional[str] = None,
) -> None:
    """Convenience wrapper. Maps a voice_linter code to the right
    drhex-q-* category and default priority via VOICE_LINTER_CODE_TO_CATEGORY.
    Codes without a mapping are silently dropped (no observation written).
    """
    mapping = VOICE_LINTER_CODE_TO_CATEGORY.get(code)
    if mapping is None:
        log.debug("quality_log: no mapping for voice_linter code %s, skipping observation", code)
        return
    category, priority = mapping
    schedule_observation(
        category=category,
        observation=observation,
        student_query_first60=student_query_first60,
        model_response_first200=model_response_first200,
        conversation_id=conversation_id,
        mission_id=mission_id,
        persona=persona,
        help_level=help_level,
        priority=priority,
        tool_invocation_doc_ids=None,
        flagged_by_source=f"voice_linter:{code}",
        notes=notes,
    )
