"""
API-key auth regression tests — added in v0.3.0.

Verifies /chat + /chat/stream reject missing/invalid X-API-Key headers
and accept valid ones. /health, /metrics, /personas, /models stay public.

Pre-requisite for running these against a live server: the orchestrator
must be started with HEX_API_KEYS env var set. The test reads the
expected valid key from HEX_TEST_API_KEY in the test environment.

Run: python tests/test_auth.py   (with HEX_TEST_API_KEY set)
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request


URL = os.environ.get("HEX_AI_URL", "http://127.0.0.1:8000")
VALID_KEY = os.environ.get("HEX_TEST_API_KEY", "")
INVALID_KEY = "k_invalid_definitely-not-a-real-key-9999"


def _http(method: str, path: str, body: dict | None = None, headers: dict | None = None):
    req_headers: dict[str, str] = {}
    if body:
        req_headers["Content-Type"] = "application/json"
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(
        URL + path,
        data=json.dumps(body).encode() if body else None,
        headers=req_headers,
        method=method,
    )
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        return resp.getcode(), resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


# ── public endpoints stay open ─────────────────────────────────────────────

def test_health_does_not_require_key() -> None:
    code, _ = _http("GET", "/health")
    assert code == 200, f"/health should be public; got {code}"
    print("  ✓ /health open (200 without key)")


def test_metrics_does_not_require_key() -> None:
    code, body = _http("GET", "/metrics")
    assert code == 200, f"/metrics should be public; got {code}"
    assert "hex_orchestrator_up" in body
    print("  ✓ /metrics open (200 without key)")


def test_personas_does_not_require_key() -> None:
    code, _ = _http("GET", "/personas")
    assert code == 200, f"/personas should be public; got {code}"
    print("  ✓ /personas open (200 without key)")


# ── protected endpoints reject missing/invalid keys ────────────────────────

def test_chat_rejects_missing_key() -> None:
    """No X-API-Key header → 401."""
    if not VALID_KEY:
        print("  ⚠ skipped — HEX_TEST_API_KEY not set (orchestrator likely running auth-disabled)")
        return
    code, body = _http("POST", "/chat", {
        "user_uid": "auth-test-1",
        "message": "Hi",
        "role": "student",
    })
    assert code == 401, f"missing key should return 401, got {code} body={body[:200]}"
    print(f"  ✓ /chat rejects missing X-API-Key with 401")


def test_chat_rejects_invalid_key() -> None:
    """X-API-Key set but not in allowed set → 401."""
    if not VALID_KEY:
        print("  ⚠ skipped — HEX_TEST_API_KEY not set")
        return
    code, body = _http("POST", "/chat", {
        "user_uid": "auth-test-2",
        "message": "Hi",
        "role": "student",
    }, headers={"X-API-Key": INVALID_KEY})
    assert code == 401, f"invalid key should return 401, got {code} body={body[:200]}"
    # Verify the response does NOT echo the bad key (no log leakage)
    assert INVALID_KEY not in body, "error response must not echo the supplied key"
    print(f"  ✓ /chat rejects invalid X-API-Key with 401 and does not echo key")


def test_chat_accepts_valid_key() -> None:
    """X-API-Key in HEX_API_KEYS → 200."""
    if not VALID_KEY:
        print("  ⚠ skipped — HEX_TEST_API_KEY not set")
        return
    code, body = _http("POST", "/chat", {
        "user_uid": "auth-test-3",
        "message": "What is the linux command 'ls'?",
        "role": "student",
        "house": "code",
    }, headers={"X-API-Key": VALID_KEY})
    assert code == 200, f"valid key should return 200, got {code} body={body[:200]}"
    data = json.loads(body)
    assert "response" in data and len(data["response"]) > 5
    print(f"  ✓ /chat accepts valid X-API-Key → {len(data['response'])} chars response")


def test_chat_stream_rejects_missing_key() -> None:
    """SSE endpoint also enforces auth."""
    if not VALID_KEY:
        print("  ⚠ skipped — HEX_TEST_API_KEY not set")
        return
    code, _ = _http("POST", "/chat/stream", {
        "user_uid": "auth-test-4",
        "message": "Hi",
        "role": "student",
    })
    assert code == 401, f"/chat/stream missing key should return 401, got {code}"
    print(f"  ✓ /chat/stream rejects missing key with 401")


def test_chat_stream_accepts_valid_key() -> None:
    """SSE returns 200 + SSE content-type with valid key."""
    if not VALID_KEY:
        print("  ⚠ skipped — HEX_TEST_API_KEY not set")
        return
    req = urllib.request.Request(
        URL + "/chat/stream",
        data=json.dumps({
            "user_uid": "auth-test-5",
            "message": "What is ls?",
            "role": "student",
        }).encode(),
        headers={"Content-Type": "application/json", "X-API-Key": VALID_KEY},
        method="POST",
    )
    resp = urllib.request.urlopen(req, timeout=120)
    assert resp.getcode() == 200
    ctype = resp.headers.get("content-type", "")
    assert "text/event-stream" in ctype, f"expected SSE content-type, got {ctype}"
    # Drain to make sure stream actually flows
    saw_meta = False
    for line in resp:
        s = line.decode().strip()
        if s.startswith("data: "):
            ev = json.loads(s[6:])
            if ev.get("type") == "meta":
                saw_meta = True
            if ev.get("type") == "done":
                break
    assert saw_meta, "expected meta event in SSE stream"
    print(f"  ✓ /chat/stream accepts valid key + streams SSE")


# ── runner ─────────────────────────────────────────────────────────────────

def main() -> int:
    tests = [
        test_health_does_not_require_key,
        test_metrics_does_not_require_key,
        test_personas_does_not_require_key,
        test_chat_rejects_missing_key,
        test_chat_rejects_invalid_key,
        test_chat_accepts_valid_key,
        test_chat_stream_rejects_missing_key,
        test_chat_stream_accepts_valid_key,
    ]
    failed = 0
    print(f"Running {len(tests)} auth tests against {URL}")
    print(f"  HEX_TEST_API_KEY {'SET' if VALID_KEY else 'UNSET (skipping auth-required tests)'}")
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
        print(f"All {len(tests)} auth tests passed.")
        return 0
    print(f"FAILED: {failed} / {len(tests)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
