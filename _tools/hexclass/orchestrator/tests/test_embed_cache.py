"""
Unit tests for rag.py embedding cache (v0.6.2).

Validates:
  - Same query → same cache key (idempotent normalization)
  - Different embed models → different keys (model swap invalidates)
  - Whitespace + case normalization
  - Soft Redis dependency: cache miss when client is None
  - JSON corruption in cache → fresh embed, no crash

Tests use monkey-patching to mock both Redis and _embed so they can run
without ollama or Redis running. Operator runs this on hexclass before
restart to confirm the cache wiring is wired correctly.

    cd /opt/hexclass/orchestrator
    VIRTUAL_ENV=.venv /home/hexclass/.local/bin/uv run pytest \\
        tests/test_embed_cache.py -v
"""
from __future__ import annotations

import importlib
import json
import sys

import pytest


@pytest.fixture
def rag_module(monkeypatch):
    """Reload rag with caching enabled + Redis stubbed."""
    # Default env: cache enabled
    monkeypatch.setenv("HEX_EMBED_CACHE", "1")
    monkeypatch.setenv("HEX_EMBED_MODEL", "nomic-embed-text")
    # Reset module-level state
    if "rag" in sys.modules:
        del sys.modules["rag"]
    import rag  # type: ignore
    rag._redis_client = None
    rag._redis_init_attempted = False
    return rag


def test_key_is_model_aware(rag_module):
    k1 = rag_module._embed_cache_key("what is sql injection")
    rag_module.EMBED_MODEL = "different-model"
    k2 = rag_module._embed_cache_key("what is sql injection")
    assert k1 != k2, "swapping EMBED_MODEL must change the cache key"


def test_normalize_whitespace_and_case(rag_module):
    a = rag_module._normalize_query("What\tIS  Sql Injection?\n")
    b = rag_module._normalize_query("what is sql injection?")
    assert a == b


def test_cache_miss_when_redis_unavailable(rag_module, monkeypatch):
    """If _get_redis() returns None, _cached_embed falls through to _embed."""
    monkeypatch.setattr(rag_module, "_get_redis", lambda: None)
    called = []
    monkeypatch.setattr(rag_module, "_embed", lambda text: called.append(text) or [0.1, 0.2])
    out = rag_module._cached_embed("test query for embedding")
    assert out == [0.1, 0.2]
    assert called == ["test query for embedding"]


def test_cache_hit_skips_embed(rag_module, monkeypatch):
    fake = {}
    class FakeRedis:
        def get(self, key): return fake.get(key)
        def set(self, key, value, ex=None): fake[key] = value
        def ping(self): return True
    monkeypatch.setattr(rag_module, "_get_redis", lambda: FakeRedis())
    embed_called = []
    monkeypatch.setattr(rag_module, "_embed", lambda text: embed_called.append(text) or [1.0, 2.0])

    # First call: miss → embeds and stores
    v1 = rag_module._cached_embed("what is the cia triad?")
    # Second call (different whitespace/case): should hit, no new embed
    v2 = rag_module._cached_embed("WHAT IS  the cia triad?\n")
    assert v1 == v2 == [1.0, 2.0]
    assert len(embed_called) == 1, f"expected 1 embed, got {len(embed_called)}"


def test_corrupted_cache_falls_through(rag_module, monkeypatch):
    """If Redis returns malformed JSON, we still get a fresh embed."""
    class BadJSON:
        def get(self, key): return b"not-valid-json"
        def set(self, key, value, ex=None): pass
        def ping(self): return True
    monkeypatch.setattr(rag_module, "_get_redis", lambda: BadJSON())
    monkeypatch.setattr(rag_module, "_embed", lambda text: [9.9])
    out = rag_module._cached_embed("any query here with enough chars")
    assert out == [9.9]


def test_redis_get_failure_falls_through(rag_module, monkeypatch):
    """Redis throwing on GET must not break embedding."""
    class Boom:
        def get(self, key): raise RuntimeError("redis exploded")
        def set(self, key, value, ex=None): pass
        def ping(self): return True
    monkeypatch.setattr(rag_module, "_get_redis", lambda: Boom())
    monkeypatch.setattr(rag_module, "_embed", lambda text: [3.14])
    out = rag_module._cached_embed("any query here with enough chars")
    assert out == [3.14]
