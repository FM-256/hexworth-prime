"""
conversation.py — Redis-backed bounded conversation memory (v0.5.0b).

Per _docs/architecture/hex-ai-conversation-memory-design.md.

Bounded: 30-min TTL, 10-turn cap (5 user + 5 assistant pairs). Past that,
the slate clears. This is the "mid-conversation" semantic — not a long-term
knowledge base (RAG handles that), not a permanent transcript.

Key shape in Redis:
    hex_ai:conv:<id>      → JSON list, LPUSH order (newest first)
    hex_ai:conv:<id>:meta → JSON {uid, created_iso, last_used_iso}

The UID-match defense: every read verifies the conversation's stored uid
matches the caller's. Two students cannot share a conversation by guessing
each other's IDs — the read returns empty if the uid doesn't match.

Failure modes:
    Redis down              → empty prior turns (chat works without memory)
    No conversation_id      → independent call (no memory at all)
    UID mismatch            → empty prior turns + log.warning
    Invalid stored JSON     → empty prior turns + log.warning
    Malformed conversation_id → empty prior turns + log.warning (UUID regex guard)
    LTRIM cap hit           → oldest pairs dropped silently

This is augmentation, not a hard dependency. The orchestrator must remain
functional when Redis is unreachable.

KNOWN LIMITATION (Nancy v0.6.1 review 2026-05-24):
The meta GET in append_turns is a separate round-trip BEFORE the write
pipeline. In a tight TOCTOU window where the :meta key expires between
the GET and the pipeline write (low-probability since both have the same
TTL and were last written together), a new student starting a fresh
write inherits an orphaned list whose old entries belong to no owner.
The student's history starts mid-list with stale orphaned entries above.
NOT a security breach (UID-mismatch defense still gates reads), but a
degraded-conversation possibility. Fix would require a Lua script for
atomic check-meta-then-append. Deferred — accepted as documented edge
case for v0.6.1.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

import redis.asyncio as aioredis

log = logging.getLogger("hex_ai.conversation")

REDIS_URL = os.environ.get("HEX_REDIS_URL", "redis://127.0.0.1:6379/0")
TTL_SECONDS = int(os.environ.get("HEX_CONV_TTL_S", "1800"))         # 30 min
# MAX_TURN_ENTRIES is the TOTAL number of role-tagged entries stored AND
# retrieved. Each round-trip writes 2 entries (one user, one assistant),
# so MAX_TURN_ENTRIES=10 means 5 round-trips of memory.
#
# Per Nancy review 2026-05-24: prior versions had asymmetric caps (LTRIM
# stored 20 entries, LRANGE read only 10). That silently dropped half the
# stored history on read — older turns were invisible even though they
# remained in Redis. The single MAX_TURN_ENTRIES constant fixes that.
MAX_TURN_ENTRIES = int(os.environ.get("HEX_CONV_MAX_TURNS", "10"))
# Per-Redis-call timeout — keeps a hung Redis from stalling the chat path.
# At sub-ms LAN latency, 1.5s is generous; the rare cold pool may take longer.
TIMEOUT_S = float(os.environ.get("HEX_CONV_TIMEOUT_S", "1.5"))

# UUID v4 format pattern. Applied at the Pydantic boundary in main.py;
# duplicated here as a defensive guard against direct API calls bypassing
# the request model.
_UUID_RE = __import__("re").compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")

# Lazy singleton — built on first use so a missing Redis at import time
# doesn't crash module load. Reconnected automatically by redis-py on
# transient failures.
_pool: aioredis.Redis | None = None


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


def _conv_key(conversation_id: str) -> str:
    return f"hex_ai:conv:{conversation_id}"


def _meta_key(conversation_id: str) -> str:
    return f"hex_ai:conv:{conversation_id}:meta"


def _redact_id(conversation_id: str) -> str:
    """Log-friendly shortened ID. Full IDs never appear in logs."""
    return f"{conversation_id[:8]}…" if conversation_id else "<empty>"


async def fetch_prior_turns(conversation_id: str, uid: str) -> list[dict[str, str]]:
    """
    Returns prior conversation turns in CHRONOLOGICAL order (oldest first),
    capped at MAX_TURNS entries. Validates the UID matches the conversation's
    stored owner. Returns empty list on any failure or mismatch.

    Suitable for direct insertion into an ollama messages array between the
    system prompt and the new user message.
    """
    if not conversation_id or not uid:
        return []
    # UUID format guard (Nancy 2026-05-24): defends against malformed IDs
    # like "foo:bar" that would collide with the :meta key namespace, or
    # path-traversal-style strings used to probe Redis key structure.
    if not _UUID_RE.match(conversation_id):
        log.warning("conv: fetch rejected non-UUID id: %s", _redact_id(conversation_id))
        return []
    try:
        client = _client()
        # Read meta + list in parallel via pipeline for one round-trip.
        async with client.pipeline(transaction=False) as pipe:
            pipe.get(_meta_key(conversation_id))
            pipe.lrange(_conv_key(conversation_id), 0, MAX_TURN_ENTRIES - 1)
            meta_raw, turns_raw = await asyncio.wait_for(pipe.execute(), timeout=TIMEOUT_S)
    except (asyncio.TimeoutError, Exception) as e:
        log.warning("conv: fetch failed for %s: %s", _redact_id(conversation_id), e)
        return []

    if not meta_raw:
        # Conversation doesn't exist yet — first call. Caller will create.
        return []

    try:
        meta = json.loads(meta_raw)
    except (ValueError, TypeError) as e:
        log.warning("conv: meta json invalid for %s: %s", _redact_id(conversation_id), e)
        return []

    stored_uid = meta.get("uid")
    if stored_uid != uid:
        # SECURITY: refuse to return another user's conversation. This is
        # the load-bearing check Nancy will care about — a UUID v4 collision
        # is astronomically unlikely, but client-supplied IDs are not trusted.
        log.warning(
            "conv: UID mismatch on %s (stored=%s requesting=%s) — refusing read",
            _redact_id(conversation_id), stored_uid, uid,
        )
        return []

    # turns_raw is newest-first because LPUSH puts at head; reverse to
    # chronological order for ollama messages array.
    turns: list[dict[str, str]] = []
    for raw in reversed(turns_raw):
        try:
            obj = json.loads(raw)
            role = obj.get("role")
            content = obj.get("content")
            if role in ("user", "assistant") and isinstance(content, str):
                turns.append({"role": role, "content": content})
        except (ValueError, TypeError):
            continue        # skip corrupt entries silently

    return turns


async def append_turns(
    conversation_id: str,
    uid: str,
    user_message: str,
    assistant_response: str,
) -> bool:
    """
    Atomically append both turns and refresh TTL on the conversation. Creates
    or updates the meta key. LTRIM keeps the list capped at 2*MAX_TURNS
    entries (each pair = 2 LPUSH calls).

    Returns True on success, False on any failure (Redis down, etc.).
    Failures are logged but never propagated — conversation memory is
    augmentation, not a hard dependency.
    """
    if not conversation_id or not uid:
        return False
    # Same UUID-format guard as fetch_prior_turns.
    if not _UUID_RE.match(conversation_id):
        log.warning("conv: append rejected non-UUID id: %s", _redact_id(conversation_id))
        return False
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        client = _client()
        # Build new meta — either fresh or refresh the last_used_iso.
        # Read the existing meta first; on mismatch refuse the write.
        existing_meta_raw = await asyncio.wait_for(
            client.get(_meta_key(conversation_id)),
            timeout=TIMEOUT_S,
        )
        if existing_meta_raw:
            try:
                existing_meta = json.loads(existing_meta_raw)
                if existing_meta.get("uid") != uid:
                    log.warning(
                        "conv: UID mismatch on append %s (stored=%s writing=%s) — refusing write",
                        _redact_id(conversation_id), existing_meta.get("uid"), uid,
                    )
                    return False
                created_iso = existing_meta.get("created_iso", now_iso)
            except (ValueError, TypeError):
                created_iso = now_iso
        else:
            created_iso = now_iso

        meta_payload = json.dumps({
            "uid": uid,
            "created_iso": created_iso,
            "last_used_iso": now_iso,
        })

        # Pipeline:
        #   LPUSH the assistant message (newest)
        #   LPUSH the user message     (just below it, so listed before in LRANGE)
        #
        # Wait — LPUSH puts at head. If we LPUSH user first, then LPUSH
        # assistant, the order in the list head-first is: [assistant, user, ...].
        # When we reversed() in fetch, we get [user, assistant, ...] chronological.
        # That's correct.
        user_turn = json.dumps({"role": "user", "content": user_message, "ts": now_iso})
        assistant_turn = json.dumps({"role": "assistant", "content": assistant_response, "ts": now_iso})

        async with client.pipeline(transaction=False) as pipe:
            pipe.lpush(_conv_key(conversation_id), user_turn)
            pipe.lpush(_conv_key(conversation_id), assistant_turn)
            # Cap at MAX_TURN_ENTRIES. Storage AND fetch use the same cap
            # so older turns aren't silently invisible. LTRIM 0..N-1 is
            # INCLUSIVE on both ends so this preserves the most-recent N
            # entries (= N/2 round-trips of memory).
            #
            # Per Nancy review 2026-05-24: prior code stored 2*MAX_TURNS
            # but fetched only MAX_TURNS, silently dropping half the
            # history on read. Aligned to a single cap.
            pipe.ltrim(_conv_key(conversation_id), 0, MAX_TURN_ENTRIES - 1)
            pipe.set(_meta_key(conversation_id), meta_payload, ex=TTL_SECONDS)
            pipe.expire(_conv_key(conversation_id), TTL_SECONDS)
            await asyncio.wait_for(pipe.execute(), timeout=TIMEOUT_S)
        log.info(
            "conv: appended turn pair to %s (uid=%s, ttl=%ds)",
            _redact_id(conversation_id), uid, TTL_SECONDS,
        )
        return True
    except (asyncio.TimeoutError, Exception) as e:
        log.warning("conv: append failed for %s: %s", _redact_id(conversation_id), e)
        return False


async def health() -> dict[str, Any]:
    """Probe Redis. Used by /health endpoint to surface conversation-memory status."""
    try:
        client = _client()
        await asyncio.wait_for(client.ping(), timeout=TIMEOUT_S)
        return {
            "redis": "ok",
            "ttl_seconds": TTL_SECONDS,
            "max_turn_entries": MAX_TURN_ENTRIES,
        }
    except (asyncio.TimeoutError, Exception) as e:
        return {"redis": f"unreachable: {e}"}
