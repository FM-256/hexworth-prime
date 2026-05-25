"""
rate_limit.py — Redis-backed abuse-prevention defenses (v1).

Two functions, both keyed on `user_uid` with bounded Redis storage:

 1. check_rate_limit(uid, is_instructor) — sliding-window per-user
    request cap. Default 50/hr for students, 200/hr for instructors.
    On exceed: returns (allowed=False, retry_after_s, current).

 2. record_filter_hit / is_locked_out — counter of times a uid has
    tripped the request_filter (encoding-bypass, etc.) in the last
    60 minutes. After 5 hits, the user is "locked out" — next /chat
    returns the lockout refusal. The lockout key has a 60-min TTL
    so it auto-unlocks (Nancy review 2026-05-25 — no permanent
    lockout / grading-dispute risk).

Failure mode (Redis down): both functions return permissive defaults
(allow=True, locked=False). The orchestrator stays operational without
Redis; the defenses simply disengage rather than hard-failing the chat.
This mirrors the conversation memory layer's soft-dependency posture.

Key shape:
    hex_ai:rl:<uid>            ZSET of unix-ms timestamps
    hex_ai:lockout:<uid>       INT counter with EXPIRE
"""
from __future__ import annotations

import logging
import os
import time
from typing import Optional

import redis.asyncio as aioredis

log = logging.getLogger("hex_ai.rate_limit")

REDIS_URL = os.environ.get("HEX_REDIS_URL", "redis://127.0.0.1:6379/0")
TIMEOUT_S = float(os.environ.get("HEX_REDIS_TIMEOUT_S", "0.5"))

# Rate-limit window. Sliding 1-hour. Limits are per uid.
RATE_LIMIT_WINDOW_S = int(os.environ.get("HEX_RATE_LIMIT_WINDOW_S", "3600"))
RATE_LIMIT_STUDENT = int(os.environ.get("HEX_RATE_LIMIT_STUDENT", "50"))
RATE_LIMIT_INSTRUCTOR = int(os.environ.get("HEX_RATE_LIMIT_INSTRUCTOR", "200"))

# Filter-hit lockout. Counter increments on every request_filter match
# (drhex-q-policy detections). Lockout fires at threshold and auto-clears
# after window (no operator-unlock requirement; mitigates grading-dispute
# risk per Nancy 2026-05-25).
LOCKOUT_WINDOW_S = int(os.environ.get("HEX_FILTER_LOCKOUT_WINDOW_S", "3600"))  # 60 min
LOCKOUT_THRESHOLD = int(os.environ.get("HEX_FILTER_LOCKOUT_THRESHOLD", "5"))

LOCKOUT_REFUSAL = (
    "Too many blocked requests in a short window. This conversation is "
    "paused for the next hour. If you think this is wrong, contact your "
    "instructor — they can review the activity log and clear the pause."
)

_pool: Optional[aioredis.Redis] = None


def _client() -> aioredis.Redis:
    global _pool
    if _pool is None:
        _pool = aioredis.from_url(
            REDIS_URL,
            decode_responses=True,
            socket_timeout=TIMEOUT_S,
            socket_connect_timeout=TIMEOUT_S,
            max_connections=20,
        )
    return _pool


# ─── Rate limit ──────────────────────────────────────────────────────

async def check_rate_limit(uid: str, *, is_instructor: bool = False) -> tuple[bool, int, int]:
    """
    Returns (allowed, retry_after_s, current_count).

    - `allowed` is False when the user has exceeded the per-window cap.
    - `retry_after_s` is the seconds until the OLDEST entry in the
      window expires (0 if allowed).
    - `current_count` is the count INCLUDING the current request, so
      callers can log "this was request N of M for the window".
    """
    if not uid:
        return (True, 0, 0)
    cap = RATE_LIMIT_INSTRUCTOR if is_instructor else RATE_LIMIT_STUDENT
    key = f"hex_ai:rl:{uid}"
    now_ms = int(time.time() * 1000)
    window_start_ms = now_ms - (RATE_LIMIT_WINDOW_S * 1000)
    try:
        client = _client()
        # Pipeline: drop expired entries, add current, count, set TTL.
        async with client.pipeline(transaction=False) as p:
            p.zremrangebyscore(key, "-inf", window_start_ms)
            p.zadd(key, {str(now_ms): now_ms})
            p.zcard(key)
            p.expire(key, RATE_LIMIT_WINDOW_S + 60)
            results = await p.execute()
        count = int(results[2])
        if count > cap:
            # Oldest entry's score tells us when it'll fall out of the
            # window; that's the earliest the cap could relax.
            oldest = await client.zrange(key, 0, 0, withscores=True)
            retry_s = 60  # safe default
            if oldest:
                _, oldest_ms = oldest[0]
                retry_s = max(1, int((oldest_ms + RATE_LIMIT_WINDOW_S * 1000 - now_ms) / 1000))
            return (False, retry_s, count)
        return (True, 0, count)
    except Exception as e:
        log.warning("rate_limit: redis unreachable, fail-open: %s", e)
        return (True, 0, 0)  # fail-open per soft-dependency posture


# ─── Filter-hit lockout ──────────────────────────────────────────────

async def record_filter_hit(uid: str) -> int:
    """Increment the filter-hit counter for this uid. Returns the new
    count (1-based). The TTL is reset on first increment only — keeping
    a constant window from the first hit, not a moving window from
    the last."""
    if not uid:
        return 0
    key = f"hex_ai:lockout:{uid}"
    try:
        client = _client()
        # INCR + EXPIRE-if-not-set. EXPIRE NX is Redis 7+; for portability
        # we set TTL only when count == 1 (first increment in window).
        count = int(await client.incr(key))
        if count == 1:
            await client.expire(key, LOCKOUT_WINDOW_S)
        return count
    except Exception as e:
        log.warning("rate_limit: redis unreachable on record_filter_hit, returning 0: %s", e)
        return 0


async def is_locked_out(uid: str) -> tuple[bool, int]:
    """Returns (locked, current_count). `locked` is True when the
    counter is at or above LOCKOUT_THRESHOLD."""
    if not uid:
        return (False, 0)
    key = f"hex_ai:lockout:{uid}"
    try:
        client = _client()
        val = await client.get(key)
        count = int(val) if val else 0
        return (count >= LOCKOUT_THRESHOLD, count)
    except Exception as e:
        log.warning("rate_limit: redis unreachable on is_locked_out, fail-open: %s", e)
        return (False, 0)


async def lockout_remaining_s(uid: str) -> int:
    """Seconds until the lockout key expires. Returns 0 if not locked."""
    if not uid:
        return 0
    key = f"hex_ai:lockout:{uid}"
    try:
        ttl = int(await _client().ttl(key))
        return max(0, ttl) if ttl > 0 else 0
    except Exception:
        return 0
