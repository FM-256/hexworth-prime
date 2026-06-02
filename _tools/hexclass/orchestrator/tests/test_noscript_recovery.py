"""
NOSCRIPT recovery test for append_turns (v0.6.6).

Lives in its own file (NOT test_toctou_append.py) because that file has a
module-level pytestmark that skips on `HEX_TEST_REDIS != "1"`. This test
uses a mocked async-redis client so it must run in CI without a live
Redis instance. Nancy's pre-deploy gate flagged that the mock test was
silently skipped behind the module-level mark — this file fixes that.

Scenario: Redis is restarted between two append_turns calls. The
server-side script cache is flushed; our cached SHA is stale. The first
EVALSHA returns NoScriptError. v0.6.6's behavior MUST be:

  1. Catch NoScriptError specifically (NOT just the broad Exception).
  2. Invalidate _append_turns_sha so the next call re-LOADs cleanly.
  3. Fall through to an inline EVAL for THIS request so the student
     doesn't see a transient outage.
"""
from __future__ import annotations

import sys
import uuid

import pytest


class _MockRedisNoScriptOnce:
    """Minimal aioredis surface used by append_turns. First evalsha()
    raises NoScriptError; the subsequent inline eval() returns 1."""
    def __init__(self):
        self._sha = "deadbeef" * 5
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
async def test_noscript_falls_back_to_eval(monkeypatch):
    """Regression for the v0.6.6 NOSCRIPT recovery path. Runs in CI
    without live Redis (mocked _client + monkeypatched module state)."""
    if "conversation" in sys.modules:
        del sys.modules["conversation"]
    import conversation  # type: ignore
    fake = _MockRedisNoScriptOnce()
    monkeypatch.setattr(conversation, "_client", lambda: fake)
    conversation._append_turns_sha = None  # cold start
    cid = str(uuid.uuid4())
    ok = await conversation.append_turns(cid, "uidX", "q", "a")
    assert ok is True
    # SCRIPT LOAD ran (lazy-init), evalsha hit NOSCRIPT once, then EVAL ran.
    assert fake._script_load_count >= 1
    assert fake._evalsha_call_count == 1
    assert fake._eval_call_count == 1
    # Module-level SHA must be cleared so the next call re-LOADs cleanly.
    assert conversation._append_turns_sha is None
