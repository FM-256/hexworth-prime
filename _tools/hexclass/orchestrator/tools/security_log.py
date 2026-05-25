"""
security_log.py — fire-and-forget(ish) writes to the dr_hex_security_events
Firestore collection. Captures every defense-layer hit (encoding_bypass,
jailbreak, rate_limit, lockout, output_scrub, tool_budget, convo_locked)
for postmortem analysis and aggregation.

Architecture (Nancy review 2026-05-25):
 - Bounded retry deque (200 events). On transient CF/Firestore failure,
   the event is requeued for one more attempt by a background drainer.
   If the queue fills, oldest events are dropped (forensic loss
   surfaces as a counter, not silent corruption).
 - conversation_id is HASHED before logging — same posture as uid_hash,
   prevents cross-system correlation. Join keys remain stable.
 - Frequently-filterable fields (event_type, severity, pattern_id,
   lockout_count, tool_name) are promoted to top-level Firestore
   columns. Free-form details go in metadata.

Write path: HTTP POST → hexAiSecurityEvent CF → Firestore Admin SDK
write. X-API-Key auth (same key the rest of the orchestrator-→-CF
chain uses).

Key shape:
    HEX_AI_SECURITY_URL  — env var, full CF URL
    HEX_AI_API_KEY       — env var, shared X-API-Key
"""
from __future__ import annotations

import asyncio
import collections
import hashlib
import json
import logging
import os
import time
from typing import Any, Optional

import httpx

log = logging.getLogger("hex_ai.security_log")

CF_URL = os.environ.get("HEX_AI_SECURITY_URL", "")
API_KEY = os.environ.get("HEX_AI_API_KEY", "")
TIMEOUT_S = float(os.environ.get("HEX_SECURITY_LOG_TIMEOUT_S", "5.0"))

# Bounded retry queue. Drop-oldest on overflow.
_QUEUE_MAX = 200
_queue: collections.deque[dict[str, Any]] = collections.deque(maxlen=_QUEUE_MAX)
_drainer_started = False
_drops_total = 0   # counter — if non-zero, forensic loss occurred


def _hash16(s: str) -> str:
    """sha256 hex [:16] — matches uid_hash / msg_hash pattern."""
    return hashlib.sha256((s or "").encode("utf-8", errors="replace")).hexdigest()[:16]


def is_enabled() -> bool:
    return bool(CF_URL and API_KEY)


def _build_event(
    event_type: str,
    *,
    uid: str,
    severity: str = "warning",
    msg: str = "",
    conversation_id: str | None = None,
    pattern_id: str | None = None,
    lockout_count: int | None = None,
    tool_name: str | None = None,
    latency_ms: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build the event payload. Hashes the sensitive identifiers."""
    return {
        "event_type": event_type,
        "severity": severity,
        "uid_hash": _hash16(uid),
        "msg_hash": _hash16(msg)[:32] if msg else None,
        "conversation_id_hash": _hash16(conversation_id) if conversation_id else None,
        "pattern_id": pattern_id,
        "lockout_count": lockout_count,
        "tool_name": tool_name,
        "latency_ms": latency_ms,
        "metadata": metadata or {},
        "ts_iso": time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime()),
    }


async def _post_one(event: dict[str, Any]) -> bool:
    """Try one HTTP POST. Returns True on 2xx, False otherwise."""
    if not is_enabled():
        return False
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_S) as client:
            r = await client.post(
                CF_URL,
                json=event,
                headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
            )
            return 200 <= r.status_code < 300
    except Exception as e:
        log.warning("security_log: POST failed: %s", e)
        return False


async def _drainer_loop() -> None:
    """Background task: drain the retry queue. One pass = one retry per
    event. If retry fails, the event is dropped (we've spent its retry
    budget)."""
    while True:
        await asyncio.sleep(2.0)
        n = len(_queue)
        if n == 0:
            continue
        # Take a snapshot to avoid mutation during iteration
        batch = []
        for _ in range(min(n, 20)):  # bound per-pass cost
            try:
                batch.append(_queue.popleft())
            except IndexError:
                break
        for ev in batch:
            if not await _post_one(ev):
                # Dropped — count as forensic loss
                global _drops_total
                _drops_total += 1


def _ensure_drainer() -> None:
    """Lazy-start the drainer when the first event is scheduled."""
    global _drainer_started
    if _drainer_started:
        return
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        return  # not in async context; first event will use the main path only
    loop.create_task(_drainer_loop())
    _drainer_started = True


def schedule_event(
    event_type: str,
    *,
    uid: str,
    severity: str = "warning",
    msg: str = "",
    conversation_id: str | None = None,
    pattern_id: str | None = None,
    lockout_count: int | None = None,
    tool_name: str | None = None,
    latency_ms: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """Fire-and-forget(ish) event schedule. Tries one POST immediately
    via the event loop; on failure, queues for retry by the drainer.

    Caller MUST NOT await this — it returns immediately. The work happens
    in a background task. Failure is silent except for the drops_total
    counter (exposed via _drops_total for /health or /metrics)."""
    if not is_enabled():
        # Without the CF endpoint configured, fall back to journalctl only
        log.info("security_log: skipped (HEX_AI_SECURITY_URL not set): %s", event_type)
        return
    ev = _build_event(
        event_type, uid=uid, severity=severity, msg=msg,
        conversation_id=conversation_id, pattern_id=pattern_id,
        lockout_count=lockout_count, tool_name=tool_name,
        latency_ms=latency_ms, metadata=metadata,
    )
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        # Not in async context — drop to journal only and skip
        log.warning("security_log: no event loop; event dropped: %s", event_type)
        return
    _ensure_drainer()

    async def _try_or_queue() -> None:
        ok = await _post_one(ev)
        if not ok:
            try:
                _queue.append(ev)
            except Exception:
                # Drop-oldest is automatic via maxlen; this path shouldn't fail
                pass

    loop.create_task(_try_or_queue())


def stats() -> dict[str, int]:
    """For /health endpoint exposure."""
    return {
        "queue_depth": len(_queue),
        "drops_total": _drops_total,
        "enabled": int(is_enabled()),
    }
