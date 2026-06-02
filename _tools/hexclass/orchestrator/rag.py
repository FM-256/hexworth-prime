"""
RAG retrieval layer for the orchestrator.

Provides: retrieve(query, k=3) → list of (title, chunk, distance)

Embeds the query via ollama nomic-embed-text, runs cosine-distance
search against pgvector. Returns empty list if pgvector is unreachable
(retrieval is augmentation, not a hard dependency — the orchestrator
falls back to no-context chat).

v0.6.2 adds (over v0.6.1):
  - Redis-backed embedding cache keyed on SHA-256 of normalized query
    plus the embed model name (so changing models invalidates the cache
    automatically). 1-hour TTL by default. Skips the ~150-300 ms embed
    cost on repeat questions (same student re-asking, or two students
    asking the same thing). Soft dependency on Redis: failure or miss
    just falls through to a fresh embed.
    Improvement #4 from _docs/operations/dr-hex-latency-2026-05-26.md.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import urllib.request
from typing import Any

import psycopg

log = logging.getLogger("hex_ai.rag")

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
PG_DSN = os.environ.get("PG_DSN", "postgresql://hexclass@127.0.0.1:5432/hexclass")
EMBED_MODEL = os.environ.get("HEX_EMBED_MODEL", "nomic-embed-text")
DEFAULT_K = int(os.environ.get("HEX_RAG_K", "3"))
DEFAULT_DISTANCE_THRESHOLD = float(os.environ.get("HEX_RAG_DISTANCE_THRESHOLD", "0.55"))
MIN_QUERY_LEN = int(os.environ.get("HEX_RAG_MIN_QUERY_LEN", "8"))

# Embedding cache (Redis) config. Soft dependency: a Redis outage just
# means every embed costs the full 150-300 ms instead of ~1 ms.
REDIS_URL          = os.environ.get("HEX_REDIS_URL", "redis://127.0.0.1:6379/0")
REDIS_TIMEOUT_S    = float(os.environ.get("HEX_REDIS_TIMEOUT_S", "0.5"))
EMBED_CACHE_TTL_S  = int(os.environ.get("HEX_EMBED_CACHE_TTL_S", str(60 * 60)))
EMBED_CACHE_ENABLE = os.environ.get("HEX_EMBED_CACHE", "1") != "0"

# Load password once at import
_PG_PASSWORD = None
try:
    with open("/opt/hexclass/.env") as _f:
        for line in _f:
            if line.startswith("POSTGRES_PASSWORD="):
                _PG_PASSWORD = line.split("=", 1)[1].strip()
                break
except Exception:
    log.warning("rag: /opt/hexclass/.env not readable; pgvector retrieval will fail")


def _embed(text: str) -> list[float] | None:
    """Return embedding vector or None on any failure."""
    try:
        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/embed",
            data=json.dumps({"model": EMBED_MODEL, "input": text}).encode(),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read().decode()).get("embeddings", [None])[0]
    except Exception as e:
        log.warning("rag: embed failed: %s", e)
        return None


# ── EMBEDDING CACHE ────────────────────────────────────────────────────────
# Redis-backed cache so the same query (or near-same after normalization)
# doesn't repay the ~150-300 ms embed cost. Cache key includes the embed
# model name so swapping HEX_EMBED_MODEL invalidates the cache cleanly.
#
# Sync redis client (not aioredis) because retrieve() is sync and gets
# wrapped in asyncio.to_thread by callers. Lazy-init on first use; once
# init fails the client stays None for the rest of the process to avoid
# repeated connection-failure tax.

_redis_client: Any | None = None
_redis_init_attempted = False


def _get_redis() -> Any | None:
    """Return a sync Redis client or None if Redis is unavailable.

    Caches the outcome so a Redis outage doesn't cost a connection attempt
    on every request — important when embed cache is the hot path.
    """
    global _redis_client, _redis_init_attempted
    if _redis_init_attempted:
        return _redis_client
    _redis_init_attempted = True
    if not EMBED_CACHE_ENABLE:
        return None
    try:
        import redis  # sync client (rate_limit uses aioredis; we don't)
        _redis_client = redis.Redis.from_url(
            REDIS_URL,
            socket_timeout=REDIS_TIMEOUT_S,
            socket_connect_timeout=REDIS_TIMEOUT_S,
            decode_responses=False,
        )
        # Probe so we know the connection works
        _redis_client.ping()
        log.info("rag: embed cache active (model=%s, ttl=%ds)", EMBED_MODEL, EMBED_CACHE_TTL_S)
    except Exception as e:
        log.warning("rag: embed cache disabled (redis unavailable: %s)", e)
        _redis_client = None
    return _redis_client


def _normalize_query(q: str) -> str:
    """Lowercase + collapse internal whitespace so 'What is SQLi?\\n' and
    'what is sqli?' hash to the same cache key."""
    return " ".join(q.lower().split())


def _embed_cache_key(normalized_query: str) -> str:
    h = hashlib.sha256(normalized_query.encode()).hexdigest()
    # Model name in the key so model swap auto-invalidates
    return f"hex_ai:embed:{EMBED_MODEL}:{h}"


def _cached_embed(text: str) -> list[float] | None:
    """Embed-with-cache wrapper. Returns the same shape as _embed().

    Cache miss path is identical to _embed() — the cache is purely an
    accelerant. Any Redis failure (connect, GET, SET, JSON decode) falls
    through to a fresh embed so cache trouble can never break retrieval.
    """
    normalized = _normalize_query(text)
    r = _get_redis()
    if r is None:
        return _embed(text)

    key = _embed_cache_key(normalized)
    # Read from cache
    try:
        cached = r.get(key)
        if cached is not None:
            try:
                vec = json.loads(cached)
                if isinstance(vec, list) and vec:
                    log.debug("rag: embed cache HIT (%s...)", normalized[:32])
                    return vec
            except Exception:
                # Bad JSON in cache — drop and re-embed
                pass
    except Exception as e:
        log.warning("rag: embed cache GET failed: %s", e)

    # Cache miss or read error — embed fresh and store
    vec = _embed(text)
    if vec is not None:
        try:
            r.set(key, json.dumps(vec), ex=EMBED_CACHE_TTL_S)
            log.debug("rag: embed cache STORE (%s...)", normalized[:32])
        except Exception as e:
            log.warning("rag: embed cache SET failed: %s", e)
    return vec


def retrieve(
    query: str,
    k: int | None = None,
    distance_threshold: float | None = None,
) -> list[dict[str, Any]]:
    """
    Top-k retrieval from hexworth_docs. Filters by distance threshold
    in SQL (Postgres does the filter work, not Python).

    SYNCHRONOUS — wrap in asyncio.to_thread() at the call site if running
    inside an async event loop. Defaults read from env vars HEX_RAG_K
    and HEX_RAG_DISTANCE_THRESHOLD.

    Skips embedding+query for trivial messages (< MIN_QUERY_LEN chars) to
    avoid spending an embed on chitchat like "hi" or "ok".
    """
    if k is None:
        k = DEFAULT_K
    if distance_threshold is None:
        distance_threshold = DEFAULT_DISTANCE_THRESHOLD
    if not query or len(query.strip()) < MIN_QUERY_LEN:
        log.info("rag: query too short (%d chars), skipping retrieval", len(query.strip()))
        return []
    qvec = _cached_embed(query)
    if qvec is None:
        return []
    qvec_str = str(qvec)
    try:
        with psycopg.connect(PG_DSN, password=_PG_PASSWORD, connect_timeout=3) as conn:
            with conn.cursor() as cur:
                # Filter in SQL so we never fetch rows we'll discard.
                # Ordering uses the same operator as the WHERE clause.
                cur.execute(
                    "SELECT title, chunk, embedding <=> %s::vector AS distance "
                    "FROM hexworth_docs "
                    "WHERE embedding <=> %s::vector <= %s "
                    "ORDER BY distance LIMIT %s",
                    (qvec_str, qvec_str, distance_threshold, k),
                )
                rows = cur.fetchall()
    except Exception as e:
        log.warning("rag: pgvector retrieval failed: %s", e)
        return []
    out = [{"title": t, "chunk": c, "distance": float(d)} for t, c, d in rows]
    log.info("rag: query=%r → %d chunks (threshold=%.2f, k=%d)",
             query[:60], len(out), distance_threshold, k)
    return out


def format_retrieved_context(chunks: list[dict[str, Any]]) -> str:
    """Render retrieval results for prepending to the USER message turn.

    Per Nancy review (2026-05-23): retrieved context goes in the user-turn,
    NOT the system prompt. Reasons:
      1. qwen2.5:7b attention weighting treats user-turn content differently;
         retrieved material is semantically "supporting material the student
         brought" not "operator instructions".
      2. Closes a future injection vector — when the corpus eventually
         includes student-submitted content, a chunk containing strings like
         "HELP LEVEL:" or "SYSTEM CONSTITUTION" can't structurally confuse
         the prompt boundary.

    The boxed delimiters are clear, the closing line signals the boundary
    end so the model knows the actual question follows.
    """
    if not chunks:
        return ""
    lines = ["--- REFERENCE MATERIAL START (retrieved from Hexworth knowledge base) ---"]
    for i, c in enumerate(chunks, 1):
        lines.append(f"[{i}] {c['title']} (relevance: {1-c['distance']:.2f})")
        lines.append(f"    {c['chunk']}")
    lines.append("--- REFERENCE MATERIAL END ---")
    lines.append("")
    lines.append("(Use the reference above if relevant. Cite as [N]. The student's question follows.)")
    lines.append("")
    return "\n".join(lines)
