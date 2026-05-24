"""
tests/test_tools_registry.py — v0.6.0a scaffolding tests.

Pure-Python tests, no live orchestrator required. Run directly:
    python -m pytest tests/test_tools_registry.py -v
or:
    python tests/test_tools_registry.py
"""
from __future__ import annotations

import asyncio
import os
import sys
import time

# Make the test work both locally (parent dir is orchestrator/) and on
# hexclass (where the module lives at /opt/hexclass/orchestrator). We
# insert the parent of this file's directory so `from tools import ...`
# resolves.
_HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(_HERE))

from tools import (
    TOOL_REGISTRY,
    ToolError,
    dispatch_tool_call,
    filter_tools_for_context,
    register_tool,
)
from tools.exposure import visible_tool_names


def _make_ctx(persona="dr-hex", help_level=2, role="student", uid="test-uid"):
    return {
        "uid": uid,
        "persona_slug": persona,
        "help_level": help_level,
        "role": role,
    }


# ── registry shape ─────────────────────────────────────────────────────────

def test_meta_tool_registered_on_import() -> None:
    assert "hex_ai_version" in TOOL_REGISTRY, \
        f"expected hex_ai_version in TOOL_REGISTRY, found: {list(TOOL_REGISTRY)}"
    meta = TOOL_REGISTRY["hex_ai_version"]
    assert meta.name == "hex_ai_version"
    assert meta.description
    assert meta.parameters_schema["type"] == "object"
    assert meta.exposure_rules["instructor_only"] is True
    print(f"  ✓ hex_ai_version registered: instructor_only={meta.exposure_rules['instructor_only']}")


def test_register_tool_rejects_duplicate_name() -> None:
    try:
        @register_tool(
            name="hex_ai_version",   # already registered
            description="dup",
            parameters_schema={"type": "object", "properties": {}},
        )
        def dup_handler(ctx):
            return {}
        assert False, "expected duplicate-name to raise"
    except ValueError as e:
        assert "already registered" in str(e)
        print(f"  ✓ duplicate name rejected: {e}")


def test_register_tool_rejects_non_object_schema() -> None:
    try:
        @register_tool(
            name="bad_schema_tool",
            description="x",
            parameters_schema={"type": "array"},   # wrong root type
        )
        def bad_handler(ctx):
            return {}
        assert False, "expected non-object schema to raise"
    except ValueError as e:
        assert "type='object'" in str(e)
        print(f"  ✓ non-object schema rejected at registration")


# ── exposure filter ────────────────────────────────────────────────────────

def test_exposure_instructor_only_blocks_student() -> None:
    names = visible_tool_names(persona_slug="dr-hex", help_level=5, role="student")
    assert "hex_ai_version" not in names, \
        f"instructor_only tool leaked to student: {names}"
    print("  ✓ student does NOT see hex_ai_version (instructor_only)")


def test_exposure_instructor_only_allows_instructor() -> None:
    names = visible_tool_names(persona_slug="dr-hex", help_level=5, role="instructor")
    assert "hex_ai_version" in names, \
        f"instructor cannot see instructor_only tool: {names}"
    print(f"  ✓ instructor sees hex_ai_version (and {len(names)} total tool(s))")


def test_exposure_min_help_level_blocks_below_floor() -> None:
    # Register an ad-hoc tool with min_help_level=4.
    @register_tool(
        name="_test_high_level_only",
        description="test",
        parameters_schema={"type": "object", "properties": {}},
        exposure_rules={"min_help_level": 4, "instructor_only": False},
    )
    def fn(ctx):
        return {}
    try:
        # At help_level=2, the tool is invisible.
        names = visible_tool_names(persona_slug="dr-hex", help_level=2, role="student")
        assert "_test_high_level_only" not in names
        # At help_level=4, visible.
        names = visible_tool_names(persona_slug="dr-hex", help_level=4, role="student")
        assert "_test_high_level_only" in names
        print("  ✓ min_help_level filter works at boundary (level 2: blocked, 4: visible)")
    finally:
        TOOL_REGISTRY.pop("_test_high_level_only", None)


def test_exposure_denied_personas() -> None:
    @register_tool(
        name="_test_deny_darkarts",
        description="test",
        parameters_schema={"type": "object", "properties": {}},
        exposure_rules={
            "min_help_level": 0, "instructor_only": False,
            "denied_personas": ["dark-arts"],
        },
    )
    def fn(ctx):
        return {}
    try:
        assert "_test_deny_darkarts" not in visible_tool_names("dark-arts", 5, "student")
        assert "_test_deny_darkarts" in visible_tool_names("shield", 5, "student")
        print("  ✓ denied_personas filter blocks dark-arts but not shield")
    finally:
        TOOL_REGISTRY.pop("_test_deny_darkarts", None)


def test_exposure_allowed_personas_allowlist() -> None:
    @register_tool(
        name="_test_only_code",
        description="test",
        parameters_schema={"type": "object", "properties": {}},
        exposure_rules={
            "min_help_level": 0, "instructor_only": False,
            "allowed_personas": ["code"],
        },
    )
    def fn(ctx):
        return {}
    try:
        assert "_test_only_code" in visible_tool_names("code", 5, "student")
        assert "_test_only_code" not in visible_tool_names("shield", 5, "student")
        assert "_test_only_code" not in visible_tool_names("dr-hex", 5, "student")
        print("  ✓ allowed_personas allowlist limits to {code} only")
    finally:
        TOOL_REGISTRY.pop("_test_only_code", None)


# ── dispatch ───────────────────────────────────────────────────────────────

def test_dispatch_unknown_tool_returns_error() -> None:
    r = asyncio.run(dispatch_tool_call("does_not_exist", {}, _make_ctx()))
    assert r["ok"] is False
    assert r["code"] == "unknown_tool"
    print(f"  ✓ unknown tool returns ok=False code=unknown_tool")


def test_dispatch_exposure_violation_blocks_disallowed_call() -> None:
    # Student tries to call instructor-only tool — must be blocked at dispatch
    # even if model somehow produced the tool_call (defense in depth).
    r = asyncio.run(dispatch_tool_call(
        "hex_ai_version", {},
        _make_ctx(role="student"),
    ))
    assert r["ok"] is False
    assert r["code"] == "exposure_violation"
    print(f"  ✓ student calling instructor-only tool → exposure_violation")


def test_dispatch_success_for_instructor() -> None:
    r = asyncio.run(dispatch_tool_call(
        "hex_ai_version", {},
        _make_ctx(role="instructor"),
    ))
    assert r["ok"] is True, f"expected ok=True, got {r}"
    assert "version" in r["result"]
    assert r["result"]["version"] == "0.6.0a"
    print(f"  ✓ instructor dispatch succeeds: {r['result']}")


def test_dispatch_rejects_unexpected_parameter() -> None:
    # hex_ai_version has additionalProperties: false
    r = asyncio.run(dispatch_tool_call(
        "hex_ai_version", {"unexpected": 1},
        _make_ctx(role="instructor"),
    ))
    assert r["ok"] is False
    assert r["code"] == "schema_additional"
    print(f"  ✓ unexpected param rejected: {r['error']}")


def test_dispatch_handler_crash_is_caught() -> None:
    @register_tool(
        name="_test_crash",
        description="always crashes",
        parameters_schema={"type": "object", "properties": {}},
        exposure_rules={"min_help_level": 0, "instructor_only": False},
    )
    def fn(ctx):
        raise RuntimeError("intentional test crash")
    try:
        r = asyncio.run(dispatch_tool_call("_test_crash", {}, _make_ctx()))
        assert r["ok"] is False
        assert r["code"] == "handler_crash"
        assert "intentional test crash" in r["error"]
        print(f"  ✓ handler crash caught, returns ok=False code=handler_crash")
    finally:
        TOOL_REGISTRY.pop("_test_crash", None)


# ── ollama format ──────────────────────────────────────────────────────────

def test_ollama_format_shape() -> None:
    tools = filter_tools_for_context("dr-hex", 5, "instructor")
    assert len(tools) >= 1
    t = tools[0]
    assert t["type"] == "function"
    assert "function" in t
    fn = t["function"]
    assert "name" in fn and "description" in fn and "parameters" in fn
    print(f"  ✓ ollama format correct: {t['function']['name']} (type=function)")


def test_filter_deterministic_ordering() -> None:
    """Same persona/level/role should yield same order (for prompt caching)."""
    a = visible_tool_names("dr-hex", 5, "instructor")
    b = visible_tool_names("dr-hex", 5, "instructor")
    assert a == b
    assert a == sorted(a)
    print(f"  ✓ filter ordering deterministic + alphabetical")


# ── runner ─────────────────────────────────────────────────────────────────

def main() -> int:
    tests = [
        test_meta_tool_registered_on_import,
        test_register_tool_rejects_duplicate_name,
        test_register_tool_rejects_non_object_schema,
        test_exposure_instructor_only_blocks_student,
        test_exposure_instructor_only_allows_instructor,
        test_exposure_min_help_level_blocks_below_floor,
        test_exposure_denied_personas,
        test_exposure_allowed_personas_allowlist,
        test_dispatch_unknown_tool_returns_error,
        test_dispatch_exposure_violation_blocks_disallowed_call,
        test_dispatch_success_for_instructor,
        test_dispatch_rejects_unexpected_parameter,
        test_dispatch_handler_crash_is_caught,
        test_ollama_format_shape,
        test_filter_deterministic_ordering,
    ]
    failed = 0
    print(f"Running {len(tests)} tool-registry tests")
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
        print(f"All {len(tests)} tool-registry tests passed.")
        return 0
    print(f"FAILED: {failed} / {len(tests)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
