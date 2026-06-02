"""
conversation.py — Redis-backed bounded conversation memory (v0.6.3).

Per _docs/architecture/hex-ai-conversation-memory-design.md.

v0.6.3 closes the TOCTOU window flagged in v0.6.1:
  append_turns now runs as a single atomic Redis Lua script.
  Read-meta + UID-check + list-cleanup + LPUSH + LTRIM + SET-meta +
  EXPIRE all execute inside one server-side call. No interleavable
  state windows; no orphan-list inheritance possible.

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
    Meta TTL expires (30-min idle gap) → prior list dropped on next append
        by the Lua orphan-DEL path (by design, v0.6.3 — preventing orphan
        inheritance is preferred over preserving a list whose owner is
        ambiguous; student sees a fresh conversation on resume)

This is augmentation, not a hard dependency. The orchestrator must remain
functional when Redis is unreachable.

FIXED IN v0.6.3 (was KNOWN LIMITATION in v0.6.1):
The append_turns path used to GET meta then run a non-transactional
pipeline. Between those two ops, the :meta key could expire, making
a new student inherit any orphaned list entries that survived the
gap. The probability was low (both keys had the same TTL) but real.

v0.6.3 replaces the GET-then-pipeline pattern with a single Lua
script (_APPEND_TURNS_SCRIPT) that runs as one atomic Redis op.
No commands interleave inside a script execution. The script also
explicitly DELs the list when meta is absent (fresh conversation),
so orphan entries cannot survive into a new uid's history.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from typing import Any

import redis.asyncio as aioredis
from redis.exceptions import NoScriptError

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


# ── ATOMIC APPEND-TURNS SCRIPT (Lua, v0.6.3) ───────────────────────────────
# Replaces the v0.6.1 GET-then-pipeline pattern to close the TOCTOU window
# documented in the module docstring. Inside a Lua script all commands run
# without interleaving, so the meta check + list cleanup + writes are
# guaranteed atomic.
#
# Contract:
#   KEYS[1] = meta key   (hex_ai:conv:<id>:meta)
#   KEYS[2] = list key   (hex_ai:conv:<id>)
#   ARGV[1] = writer uid
#   ARGV[2] = now_iso
#   ARGV[3] = user_turn   (JSON)
#   ARGV[4] = assistant_turn (JSON)
#   ARGV[5] = max_entries (string int)
#   ARGV[6] = ttl_seconds (string int)
# Returns:
#   1  → wrote both turns + meta + refreshed TTL
#   0  → refused due to UID mismatch (no writes happened)
_APPEND_TURNS_SCRIPT = """
local meta_key = KEYS[1]
local conv_key = KEYS[2]
local writer_uid    = ARGV[1]
local now_iso       = ARGV[2]
local user_turn     = ARGV[3]
local assistant_turn = ARGV[4]
local cap = tonumber(ARGV[5])
local ttl = tonumber(ARGV[6])

local existing = redis.call('GET', meta_key)
local created_iso = now_iso
if existing then
    local ok, parsed = pcall(cjson.decode, existing)
    if ok and type(parsed) == 'table' then
        if parsed.uid and parsed.uid ~= writer_uid then
            -- UID mismatch: refuse write entirely. No turns inserted.
            return 0
        end
        if parsed.created_iso then
            created_iso = parsed.created_iso
        end
    else
        -- Meta is non-nil but failed to decode (corrupted JSON OR
        -- non-table top-level). Ownership is unverifiable, so any
        -- surviving list entries cannot be safely inherited. Treat
        -- this the same as meta-absent: DEL the list before LPUSH.
        -- Closes Nancy pre-deploy concern #9 (2026-06-02).
        redis.call('DEL', conv_key)
    end
else
    -- Meta is missing. If the list survived the meta's TTL it's an
    -- orphan; drop it before LPUSH so a new conversation cannot
    -- inherit a previous owner's history.
    redis.call('DEL', conv_key)
end

redis.call('LPUSH', conv_key, user_turn)
redis.call('LPUSH', conv_key, assistant_turn)
redis.call('LTRIM', conv_key, 0, cap - 1)

local new_meta = cjson.encode({
    uid = writer_uid,
    created_iso = created_iso,
    last_used_iso = now_iso,
})
redis.call('SET', meta_key, new_meta, 'EX', ttl)
redis.call('EXPIRE', conv_key, ttl)
return 1
"""

# SHA-1 of the script is computed by redis-py on first eval and cached.
# Subsequent calls use EVALSHA which avoids re-sending the script body.
_append_turns_sha: str | None = None


async def _ensure_script_loaded() -> str | None:
    """Load the Lua script into Redis if we haven't already this process.

    Returns the SHA or None if Redis is unreachable. Soft dependency mirrors
    the rest of this module: a Redis outage just means append_turns logs
    + returns False, never raises.
    """
    global _append_turns_sha
    if _append_turns_sha is not None:
        return _append_turns_sha
    try:
        client = _client()
        sha = await asyncio.wait_for(
            client.script_load(_APPEND_TURNS_SCRIPT),
            timeout=TIMEOUT_S,
        )
        _append_turns_sha = sha
        log.info("conv: append-turns Lua script loaded (sha=%s)", sha)
        return sha
    except Exception as e:
        log.warning("conv: append-turns SCRIPT LOAD failed: %s", e)
        return None


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
    Atomically append both turns and refresh TTL on the conversation.

    v0.6.3: implementation is now a single Lua EVAL. No GET-then-pipeline
    pattern; no interleaving window. See _APPEND_TURNS_SCRIPT for the
    server-side logic.

    Returns True on success, False on any failure or UID-mismatch refusal.
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
    user_turn = json.dumps({"role": "user", "content": user_message, "ts": now_iso})
    assistant_turn = json.dumps({"role": "assistant", "content": assistant_response, "ts": now_iso})

    try:
        client = _client()
        eval_args = (
            2,
            _meta_key(conversation_id),
            _conv_key(conversation_id),
            uid,
            now_iso,
            user_turn,
            assistant_turn,
            str(MAX_TURN_ENTRIES),
            str(TTL_SECONDS),
        )

        # Try the cached EVALSHA path first. If Redis was restarted since
        # we cached the SHA, the server drops its script cache and we get
        # NoScriptError. redis-py does NOT auto-recover from this on the
        # raw evalsha() call (the Script helper class does, but we don't
        # use it because we want explicit control). Handle it ourselves:
        # invalidate the cached SHA so the next caller re-LOADs, and
        # retry this request with an inline EVAL so the student doesn't
        # see a transient outage.
        sha = await _ensure_script_loaded()
        result = None
        if sha is not None:
            try:
                result = await asyncio.wait_for(
                    client.evalsha(sha, *eval_args),
                    timeout=TIMEOUT_S,
                )
            except NoScriptError:
                # Server-side cache was flushed (Redis restart). Invalidate
                # our SHA so the next request re-LOADs the script, and
                # fall through to the inline EVAL below for this request.
                global _append_turns_sha
                log.info("conv: NOSCRIPT on evalsha — server restart suspected, re-LOADing")
                _append_turns_sha = None
                result = None
        if result is None:
            # SCRIPT LOAD never succeeded (Redis cold) OR we just hit
            # NOSCRIPT. Either way an inline EVAL with the full script
            # body completes the request.
            result = await asyncio.wait_for(
                client.eval(_APPEND_TURNS_SCRIPT, *eval_args),
                timeout=TIMEOUT_S,
            )
        # Lua returns 1 on success, 0 on UID mismatch refusal.
        if result == 1 or result == "1":
            log.info(
                "conv: appended turn pair to %s (uid=%s, ttl=%ds)",
                _redact_id(conversation_id), uid, TTL_SECONDS,
            )
            return True
        log.warning(
            "conv: UID mismatch on append %s (writing=%s) — refused by Lua",
            _redact_id(conversation_id), uid,
        )
        return False
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
