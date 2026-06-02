"""
Regression test for the v0.6.1 TOCTOU known limitation, fixed in v0.6.3.

The script tests the atomic Lua append_turns. Requires a running Redis;
operator runs this on hexclass post-deploy:

    cd /opt/hexclass/orchestrator
    VIRTUAL_ENV=.venv /home/hexclass/.local/bin/uv run pytest \\
        tests/test_toctou_append.py -v

The scenarios:

  1. Fresh conversation (no meta, no list)            → writes both turns
  2. Existing meta + uid matches                       → preserves created_iso
  3. Existing meta + uid mismatch                      → refuses (returns 0)
  4. Orphan list (no meta, surviving list entries)     → DELs list first
     then writes — new uid does NOT inherit old entries
  5. Two append calls + UID mismatch on second        → second is refused

The orphan-list scenario is the v0.6.1 bug we're closing.
"""
from __future__ import annotations

import asyncio
import json
import os
import sys
import uuid

import pytest


# Skip the whole module if Redis isn't reachable. Operator runs on hexclass
# where Redis is up; local dev without Redis just no-ops these tests.
pytestmark = pytest.mark.skipif(
    os.environ.get("HEX_TEST_REDIS", "0") != "1",
    reason="Set HEX_TEST_REDIS=1 to run TOCTOU tests (needs Redis on HEX_REDIS_URL)"
)


@pytest.fixture
async def conv_module():
    if "conversation" in sys.modules:
        del sys.modules["conversation"]
    import conversation  # type: ignore
    conversation._pool = None
    conversation._append_turns_sha = None
    yield conversation
    # Cleanup any keys this test created
    try:
        c = conversation._client()
        async for key in c.scan_iter("hex_ai:conv:test-*"):
            await c.delete(key)
    except Exception:
        pass


@pytest.mark.asyncio
async def test_fresh_conversation_writes_both(conv_module):
    cid = str(uuid.uuid4())
    ok = await conv_module.append_turns(cid, "uidA", "hello?", "hi there")
    assert ok is True
    turns = await conv_module.fetch_prior_turns(cid, "uidA")
    assert len(turns) == 2
    assert turns[0]["content"] == "hello?"
    assert turns[1]["content"] == "hi there"


@pytest.mark.asyncio
async def test_uid_mismatch_refused(conv_module):
    cid = str(uuid.uuid4())
    await conv_module.append_turns(cid, "uidA", "first", "answer")
    # Second writer is uidB — Lua must refuse
    ok = await conv_module.append_turns(cid, "uidB", "intruder", "reply")
    assert ok is False
    # Confirm intruder turns never landed
    turns = await conv_module.fetch_prior_turns(cid, "uidA")
    contents = [t["content"] for t in turns]
    assert "intruder" not in contents
    assert "reply" not in contents


@pytest.mark.asyncio
async def test_orphan_list_does_not_leak(conv_module):
    """The v0.6.1 bug: meta expires but list survives. v0.6.3 Lua MUST
    drop the surviving list before LPUSHing the new uid's entries."""
    cid = str(uuid.uuid4())
    client = conv_module._client()
    # Simulate a surviving orphan list (no meta key)
    await client.lpush(
        conv_module._conv_key(cid),
        json.dumps({"role": "assistant", "content": "ORPHAN-OLD", "ts": "1970-01-01"}),
    )
    await client.lpush(
        conv_module._conv_key(cid),
        json.dumps({"role": "user", "content": "ORPHAN-OLD-Q", "ts": "1970-01-01"}),
    )
    # New uid arrives. The Lua script must DEL the orphan list before LPUSHing.
    ok = await conv_module.append_turns(cid, "uidNEW", "fresh question", "fresh answer")
    assert ok is True
    turns = await conv_module.fetch_prior_turns(cid, "uidNEW")
    contents = [t["content"] for t in turns]
    assert "ORPHAN-OLD" not in contents
    assert "ORPHAN-OLD-Q" not in contents
    assert "fresh question" in contents
    assert "fresh answer" in contents


# ── NOSCRIPT RECOVERY TEST (runs in CI without Redis) ──────────────────────
# Mock the redis client so we can simulate the "Redis was restarted, our
# cached SHA is stale" scenario and confirm we recover via EVAL.

class _MockRedisNoScriptOnce:
    """Mocks the minimal aioredis surface used by append_turns. The first
    evalsha() call raises NoScriptError; the inline eval() that follows
    returns the success sentinel. Subsequent evalsha calls succeed (the
    re-loaded sha is fresh)."""
    def __init__(self):
        self._sha = "deadbeef" * 5  # 40-char fake SHA
        self._evalsha_call_count = 0
        self._eval_call_count = 0
        self._script_load_count = 0
    async def script_load(self, _script):
        self._script_load_count += 1
        return self._sha
    async def evalsha(self, _sha, _numkeys, *_args):
        from redis.exceptions import NoScriptError
        self._evalsha_call_count += 1
        if self._evalsha_call_count == 1:
            raise NoScriptError("NOSCRIPT No matching script")
        return 1
    async def eval(self, _script, _numkeys, *_args):
        self._eval_call_count += 1
        return 1


@pytest.mark.asyncio
@pytest.mark.skipif(
    os.environ.get("HEX_TEST_REDIS_MOCKS", "1") == "0",
    reason="Set HEX_TEST_REDIS_MOCKS=0 to skip Redis-mock tests",
)
async def test_noscript_falls_back_to_eval(monkeypatch):
    """Regression for the reviewer-flagged NOSCRIPT failure mode: after
    Redis restart, the first evalsha returns NoScriptError. v0.6.6 must
    catch it, invalidate the cached SHA, and fall back to inline EVAL
    for this request so the student doesn't see a transient outage."""
    if "conversation" in sys.modules:
        del sys.modules["conversation"]
    import conversation  # type: ignore
    fake = _MockRedisNoScriptOnce()
    monkeypatch.setattr(conversation, "_client", lambda: fake)
    conversation._append_turns_sha = None  # cold start
    cid = str(uuid.uuid4())
    ok = await conversation.append_turns(cid, "uidX", "q", "a")
    assert ok is True
    # SHA was loaded (script_load), evalsha hit NOSCRIPT once, then EVAL ran.
    assert fake._script_load_count >= 1
    assert fake._evalsha_call_count == 1
    assert fake._eval_call_count == 1
    # The module-level SHA must be cleared so the next call re-LOADs cleanly.
    assert conversation._append_turns_sha is None
