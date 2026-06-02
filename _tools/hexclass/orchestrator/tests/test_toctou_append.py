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


# NOSCRIPT recovery test moved to tests/test_noscript_recovery.py so it
# runs in CI without the live-Redis gating that the file-level pytestmark
# above imposes on the rest of these tests. Nancy pre-deploy review
# 2026-06-02 flagged the original co-location as a silent-skip risk.
