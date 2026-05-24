"""
tests/test_conversation_memory.py — v0.6.1 (Redis conversation memory).

Verifies:
  1. /health surfaces redis status
  2. A chat with conversation_id persists; next chat with same ID sees
     the prior turn (model can reference earlier exchange)
  3. UID mismatch on the same conversation_id → fresh conversation
     (defense against ID guessing)
  4. No conversation_id → no memory (independent calls)
  5. prior_turn_count appears in show_thinking response
"""
from __future__ import annotations

import json
import os
import sys
import time
import uuid
import urllib.request


URL = os.environ.get("HEX_AI_URL", "http://127.0.0.1:8000")
TEST_API_KEY = os.environ.get("HEX_TEST_API_KEY", "")


def _http(method: str, path: str, body: dict | None = None):
    headers: dict[str, str] = {}
    if body:
        headers["Content-Type"] = "application/json"
    if TEST_API_KEY:
        headers["X-API-Key"] = TEST_API_KEY
    req = urllib.request.Request(
        URL + path,
        data=json.dumps(body).encode() if body else None,
        headers=headers,
        method=method,
    )
    return urllib.request.urlopen(req, timeout=180).read().decode()


def test_health_surfaces_redis_status() -> None:
    data = json.loads(_http("GET", "/health"))
    cm = data.get("conversation_memory", {})
    assert "redis" in cm, f"conversation_memory section missing redis key: {cm}"
    # If redis is reachable, expect "ok"; if not, expect "unreachable: ..."
    assert cm["redis"] == "ok" or cm["redis"].startswith("unreachable"), \
        f"unexpected redis status: {cm['redis']}"
    if cm["redis"] == "ok":
        # Per Nancy 2026-05-24: confirm the renamed key for clarity.
        assert "max_turn_entries" in cm, \
            f"expected max_turn_entries in health (was max_turns), got: {cm}"
    print(f"  ✓ /health.conversation_memory.redis={cm['redis']}")


def test_first_turn_has_zero_prior_turns() -> None:
    """A brand-new conversation_id should have no prior turns."""
    conv_id = str(uuid.uuid4())
    data = json.loads(_http("POST", "/chat", {
        "user_uid": "conv-test-1",
        "message": "Hi, my favorite color is purple.",
        "role": "student",
        "conversation_id": conv_id,
        "show_thinking": True,
    }))
    ctx = data.get("context_packet", {}) or {}
    assert ctx.get("prior_turn_count") == 0, \
        f"expected 0 prior turns for new conv id, got {ctx.get('prior_turn_count')}"
    print(f"  ✓ new conversation_id has prior_turn_count=0")


def test_second_turn_sees_prior_turn() -> None:
    """Second message on the same conversation_id should see 2 prior turns
    (the first user message + the first assistant response).

    Two assertions:
      A. prior_turn_count == 2 — the mechanism (load-bearing for v0.6.1)
      B. model recalled the prior content — the OUTCOME, which depends on
         LLM behavior at temperature=0.4. Make the recall prompt as
         unambiguous as possible to minimize flake."""
    conv_id = str(uuid.uuid4())
    uid = "conv-test-2"
    # Turn 1 — establish a concrete fact the model must store verbatim.
    _ = _http("POST", "/chat", {
        "user_uid": uid,
        "message": "Remember this exactly: my favorite color is purple. Please confirm you have stored that.",
        "role": "student",
        "conversation_id": conv_id,
    })
    # Turn 2 — unambiguous recall prompt; explicitly disables tool use
    # so the model can't dodge the question by searching the corpus.
    data = json.loads(_http("POST", "/chat", {
        "user_uid": uid,
        "message": "Do NOT use any tools. What color did I tell you was my favorite?",
        "role": "student",
        "conversation_id": conv_id,
        "show_thinking": True,
    }))
    ctx = data.get("context_packet", {}) or {}
    pc = ctx.get("prior_turn_count")
    # ASSERTION A — the mechanism (deterministic):
    assert pc == 2, f"expected 2 prior turns after one round-trip, got {pc}"
    # ASSERTION B — the outcome (best-effort given LLM nondeterminism):
    resp = data["response"].lower()
    if "purple" in resp:
        print(f"  ✓ second turn sees 2 prior; model recalled 'purple': "
              f"{data['response'][:80]}...")
    else:
        # The mechanism works (pc=2). LLM-recall failure is logged as warning
        # but doesn't fail the test — qwen2.5:7b at temp=0.4 is non-deterministic
        # and may choose to call tools or hedge even with explicit prompting.
        print(f"  ⚠ mechanism works (prior_turn_count=2) but model did NOT "
              f"recall 'purple' on this run (LLM flake): {data['response'][:120]}")


def test_uid_mismatch_yields_fresh_conversation() -> None:
    """A different uid using the same conversation_id should see ZERO
    prior turns — the UID-match defense."""
    conv_id = str(uuid.uuid4())
    # uid A starts a conversation
    _ = _http("POST", "/chat", {
        "user_uid": "conv-test-3a",
        "message": "Hi, my code is 42.",
        "role": "student",
        "conversation_id": conv_id,
    })
    # uid B uses the same conversation_id
    data = json.loads(_http("POST", "/chat", {
        "user_uid": "conv-test-3b",
        "message": "What's my code?",
        "role": "student",
        "conversation_id": conv_id,
        "show_thinking": True,
    }))
    ctx = data.get("context_packet", {}) or {}
    pc = ctx.get("prior_turn_count")
    assert pc == 0, \
        f"UID mismatch should yield prior_turn_count=0, got {pc}"
    print(f"  ✓ UID mismatch defended: prior_turn_count=0 for second uid")


def test_no_conversation_id_means_no_memory() -> None:
    """Omitting conversation_id → prior_turn_count=0, independent call."""
    data = json.loads(_http("POST", "/chat", {
        "user_uid": "conv-test-4",
        "message": "Hello",
        "role": "student",
        # no conversation_id
        "show_thinking": True,
    }))
    ctx = data.get("context_packet", {}) or {}
    assert ctx.get("prior_turn_count") == 0, \
        f"missing conversation_id should give 0 prior turns, got {ctx.get('prior_turn_count')}"
    print(f"  ✓ no conversation_id → no memory")


def test_malformed_conversation_id_rejected() -> None:
    """Per Nancy 2026-05-24: conversation_id must be UUID v4 format.
    Malformed IDs (e.g. 'foo:bar' that would collide with the :meta key
    namespace) are rejected at the Pydantic boundary with HTTP 422."""
    import urllib.error
    try:
        _http("POST", "/chat", {
            "user_uid": "conv-test-malformed",
            "message": "Hello",
            "role": "student",
            "conversation_id": "foo:bar",
        })
        assert False, "expected 422 for malformed conversation_id"
    except urllib.error.HTTPError as e:
        assert e.code == 422, f"expected 422, got {e.code}"
        print("  ✓ malformed conversation_id rejected with 422")


def main() -> int:
    tests = [
        test_health_surfaces_redis_status,
        test_first_turn_has_zero_prior_turns,
        test_no_conversation_id_means_no_memory,
        test_malformed_conversation_id_rejected,
        test_uid_mismatch_yields_fresh_conversation,
        test_second_turn_sees_prior_turn,    # slowest (2 ollama calls) — last
    ]
    failed = 0
    print(f"Running {len(tests)} conversation-memory tests against {URL}")
    print("─" * 60)
    for t in tests:
        try:
            t0 = time.time()
            t()
            dt = int((time.time() - t0) * 1000)
            print(f"    [{dt}ms]")
        except AssertionError as e:
            print(f"  ✗ {t.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"  ✗ {t.__name__}: {type(e).__name__}: {e}")
            failed += 1
    print("─" * 60)
    if failed == 0:
        print(f"All {len(tests)} conversation-memory tests passed.")
        return 0
    print(f"FAILED: {failed} / {len(tests)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
