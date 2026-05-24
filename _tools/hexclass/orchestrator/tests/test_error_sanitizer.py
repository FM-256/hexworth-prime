"""
tests/test_error_sanitizer.py — defense-in-depth coverage for the
tool-error sanitizer. Verifies the contract:

  - ok=True results pass through unchanged
  - ok=False results have `error` replaced with code-mapped safe message
  - The raw internal error string (URLs, IDs, stack traces) is NEVER
    visible in the sanitized output
  - The browser sanitizer reduces error to a single canonical string
    regardless of code
  - Sanitizers do not mutate the input dict
  - "Temporarily" is NOT in any message (Nancy 2026-05-24 retry-trigger
    concern)

Run:
    python -m pytest tests/test_error_sanitizer.py -v
or:
    python tests/test_error_sanitizer.py
"""
from __future__ import annotations

import copy
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from tools.error_sanitizer import (  # noqa: E402
    sanitize_tool_error_for_model,
    sanitize_tool_error_for_browser,
)


# ── Pass-through on ok=True ──────────────────────────────────────────

def test_ok_true_passthrough_model():
    src = {"ok": True, "result": {"flags_captured": 3, "flags_total": 5}}
    out = sanitize_tool_error_for_model(src)
    assert out is src or out == src
    assert out["result"]["flags_captured"] == 3


def test_ok_true_passthrough_browser():
    src = {"ok": True, "result": {"flags_captured": 3}}
    out = sanitize_tool_error_for_browser(src)
    assert out is src or out == src


# ── ok=False maps to safe message ───────────────────────────────────

def test_model_handler_crash_safe_message():
    raw = {
        "ok": False,
        "code": "handler_crash",
        "error": "9 FAILED_PRECONDITION: The query requires an index. "
                 "You can create it here: https://console.firebase.google.com/...",
    }
    out = sanitize_tool_error_for_model(raw)
    assert out["ok"] is False
    assert out["code"] == "handler_crash"
    assert "console.firebase.google.com" not in out["error"]
    assert "FAILED_PRECONDITION" not in out["error"]
    assert "Could not retrieve" in out["error"]


def test_model_schema_required_safe_message():
    raw = {"ok": False, "code": "schema_required", "error": "missing required: mission_id"}
    out = sanitize_tool_error_for_model(raw)
    assert out["code"] == "schema_required"
    assert "Skip and proceed" in out["error"]
    # Internal phrasing should be replaced; the canonical message has no internals.


def test_model_unknown_code_default():
    raw = {"ok": False, "code": "future_code_we_havent_seen", "error": "blah blah"}
    out = sanitize_tool_error_for_model(raw)
    # Unknown code preserved (for audit/debug), default safe message applied
    assert out["code"] == "future_code_we_havent_seen"
    assert "Could not retrieve" in out["error"]


def test_model_missing_code_defaults_to_handler_crash():
    raw = {"ok": False, "error": "something exploded"}
    out = sanitize_tool_error_for_model(raw)
    assert out["code"] == "handler_crash"
    assert "Could not retrieve" in out["error"]


# ── Browser sanitizer reduces to single string ──────────────────────

def test_browser_handler_crash():
    raw = {
        "ok": False, "code": "handler_crash",
        "error": "9 FAILED_PRECONDITION: ... https://console.firebase.google.com/...",
    }
    out = sanitize_tool_error_for_browser(raw)
    assert out["error"] == "Tool unavailable"
    assert "FAILED_PRECONDITION" not in out["error"]


def test_browser_schema_error():
    raw = {"ok": False, "code": "schema_required", "error": "missing required: mission_id"}
    out = sanitize_tool_error_for_browser(raw)
    # Browser message is identical regardless of code — minimum info to end user
    assert out["error"] == "Tool unavailable"


# ── No mutation of input ────────────────────────────────────────────

def test_input_not_mutated_on_failure_model():
    raw = {"ok": False, "code": "handler_crash", "error": "internal stack trace ..."}
    raw_copy = copy.deepcopy(raw)
    _ = sanitize_tool_error_for_model(raw)
    assert raw == raw_copy, "sanitizer must not mutate input dict"


def test_input_not_mutated_on_failure_browser():
    raw = {"ok": False, "code": "auth", "error": "API key not configured"}
    raw_copy = copy.deepcopy(raw)
    _ = sanitize_tool_error_for_browser(raw)
    assert raw == raw_copy


# ── "Temporarily" anti-pattern check (Nancy 2026-05-24) ─────────────

def test_no_temporarily_in_any_model_message():
    """The word 'temporarily' triggers model retry loops on errors that
    will not self-heal in-session. None of our messages should use it."""
    from tools.error_sanitizer import _MODEL_MESSAGES_BY_CODE, _MODEL_DEFAULT
    for code, msg in _MODEL_MESSAGES_BY_CODE.items():
        assert "temporar" not in msg.lower(), (
            f"code '{code}' has a transient-suggesting word; will trigger retries: {msg!r}"
        )
    assert "temporar" not in _MODEL_DEFAULT.lower()


# ── Specific code-to-message mappings ───────────────────────────────

def test_all_known_codes_have_safe_messages():
    """Each registered code maps to a non-empty safe message that
    doesn't contain obvious internals."""
    from tools.error_sanitizer import _MODEL_MESSAGES_BY_CODE
    BANNED_SUBSTRINGS = [
        "http://", "https://",        # URLs are leaks
        "console.firebase", "firestore.googleapis",  # specific known leak surfaces
        "FAILED_PRECONDITION", "PERMISSION_DENIED",  # GRPC codes
        "Traceback", "  at ",         # stack-trace fragments
    ]
    for code, msg in _MODEL_MESSAGES_BY_CODE.items():
        assert msg, f"code '{code}' has empty message"
        for banned in BANNED_SUBSTRINGS:
            assert banned not in msg, f"code '{code}' message contains banned substring '{banned}'"


def test_permanent_codes_use_skip_wording():
    """Permanent structural errors should explicitly say 'Skip' so the
    model doesn't waste budget retrying. Per Nancy 2026-05-24."""
    from tools.error_sanitizer import _MODEL_MESSAGES_BY_CODE
    PERMANENT = ["unknown_tool", "schema_required", "schema_additional",
                 "schema_type", "exposure_violation"]
    for code in PERMANENT:
        msg = _MODEL_MESSAGES_BY_CODE[code]
        assert "Skip" in msg, f"permanent code '{code}' should say 'Skip': {msg!r}"


if __name__ == "__main__":
    # Run all tests directly (no pytest required).
    import inspect
    tests = [(n, f) for n, f in globals().items()
             if n.startswith("test_") and inspect.isfunction(f)]
    failed = []
    for name, fn in tests:
        try:
            fn()
            print(f"  PASS  {name}")
        except AssertionError as e:
            print(f"  FAIL  {name}: {e}")
            failed.append(name)
    print(f"\n{len(tests) - len(failed)}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
