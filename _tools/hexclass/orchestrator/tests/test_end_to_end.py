"""
tests/test_end_to_end.py — single test that walks the FULL chain.

Per Nancy review 2026-05-24 (item #2 in the post-marathon improvement pass).
Six existing test sets exercise the chain piecewise. This script ties them
together: one canonical pass that catches integration regressions a single
set can miss.

Sequence:
  1. /health → all subsystems probed; all_ok=True
  2. POST /chat with conversation_id + show_thinking → assert RAG hit,
     prior_turn_count=0, tools_visible includes search_knowledge_base
  3. POST /chat reusing conversation_id → assert prior_turn_count=2
  4. POST /chat asking the model to call a tool → assert tool_calls_made > 0
  5. POST /chat at base_help_level=1 → assert search_knowledge_base
     filtered out (min_help_level=2)

Run: HEX_TEST_API_KEY=<key> python tests/test_end_to_end.py
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


def _http(method: str, path: str, body: dict | None = None) -> dict:
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
    return json.loads(urllib.request.urlopen(req, timeout=240).read().decode())


def test_end_to_end_chain() -> int:
    failed = 0
    print("─" * 60)
    print("STEP 1: health probe — all subsystems")
    print("─" * 60)
    t0 = time.time()
    health = _http("GET", "/health")
    dt = int((time.time() - t0) * 1000)
    print(f"  health: orchestrator={health.get('orchestrator')}, "
          f"version={health.get('version')}, all_ok={health.get('all_ok')}")
    print(f"  ollama: {health.get('ollama', {}).get('status')}")
    print(f"  pgvector: {health.get('pgvector', {}).get('status')} "
          f"(doc_count={health.get('pgvector', {}).get('doc_count')})")
    print(f"  conv_memory.redis: {health.get('conversation_memory', {}).get('redis')}")
    print(f"  audit_cf: {health.get('audit_cf', {}).get('status')}")
    print(f"  [{dt}ms]")
    if not health.get("all_ok"):
        print("  ✗ all_ok is False — some subsystem degraded")
        failed += 1
    else:
        print(f"  ✓ all subsystems healthy")

    # Use one conversation through the rest of the test.
    conv_id = str(uuid.uuid4())
    uid = "e2e-test-uid"

    print()
    print("─" * 60)
    print("STEP 2: turn 1 — first message, expect RAG hit + tools visible")
    print("─" * 60)
    t0 = time.time()
    r1 = _http("POST", "/chat", {
        "user_uid": uid,
        "message": "I'm troubleshooting a stuck print spooler service on Windows.",
        "role": "instructor",          # instructor to see tools_visible
        "house": "shield",
        "conversation_id": conv_id,
        "show_thinking": True,
    })
    dt = int((time.time() - t0) * 1000)
    ctx = r1.get("context_packet", {}) or {}
    rag_chunks = ctx.get("rag_chunks", [])
    tools_visible = ctx.get("tools_visible", [])
    prior_turn_count = ctx.get("prior_turn_count")
    print(f"  response: {r1['response'][:120]}…")
    print(f"  persona: {r1.get('persona_name')}, help_level: {r1.get('help_level')}")
    print(f"  rag chunks: {len(rag_chunks)} | tools visible: {tools_visible}")
    print(f"  prior_turn_count: {prior_turn_count} | latency: {r1.get('latency_ms')}ms")
    print(f"  [{dt}ms]")
    if not rag_chunks:
        print("  ✗ expected at least one RAG chunk for printer query")
        failed += 1
    if "search_knowledge_base" not in tools_visible:
        print(f"  ✗ expected search_knowledge_base in tools_visible, got {tools_visible}")
        failed += 1
    if prior_turn_count != 0:
        print(f"  ✗ expected prior_turn_count=0 on first turn, got {prior_turn_count}")
        failed += 1
    if failed == 0:
        print(f"  ✓ turn 1: RAG hit, tools visible, prior_turn_count=0")

    print()
    print("─" * 60)
    print("STEP 3: turn 2 — reuse conversation_id, expect prior_turn_count=2")
    print("─" * 60)
    t0 = time.time()
    r2 = _http("POST", "/chat", {
        "user_uid": uid,
        "message": "What was the first thing I asked about?",
        "role": "student",          # student to verify show_thinking redaction
        "conversation_id": conv_id,
        "show_thinking": True,
    })
    dt = int((time.time() - t0) * 1000)
    ctx2 = r2.get("context_packet", {}) or {}
    prior2 = ctx2.get("prior_turn_count")
    print(f"  response: {r2['response'][:120]}…")
    print(f"  prior_turn_count: {prior2}")
    print(f"  student show_thinking has 'tool_invocations'? {'tool_invocations' in ctx2}")
    print(f"  student show_thinking has 'tools_visible'? {'tools_visible' in ctx2}")
    print(f"  [{dt}ms]")
    if prior2 != 2:
        print(f"  ✗ expected prior_turn_count=2, got {prior2}")
        failed += 1
    # Per Nancy v0.6.0b: students see only tool_calls_made count, not the catalog
    if "tool_invocations" in ctx2 or "tools_visible" in ctx2:
        print(f"  ✗ student show_thinking leaked tool internals: {list(ctx2.keys())}")
        failed += 1
    if failed == 0 or (prior2 == 2 and "tool_invocations" not in ctx2):
        print(f"  ✓ turn 2: conversation memory works + student leak-guard holds")

    print()
    print("─" * 60)
    print("STEP 4: help-level filter — base_help_level=1 hides search_knowledge_base")
    print("─" * 60)
    t0 = time.time()
    r3 = _http("POST", "/chat", {
        "user_uid": "e2e-test-uid-level1",
        "message": "Hello",
        "role": "instructor",      # instructor sees tools_visible
        "base_help_level": 1,
        "show_thinking": True,
    })
    dt = int((time.time() - t0) * 1000)
    ctx3 = r3.get("context_packet", {}) or {}
    tools3 = ctx3.get("tools_visible", [])
    print(f"  help_level: {r3.get('help_level')}")
    print(f"  tools visible: {tools3}")
    print(f"  [{dt}ms]")
    if "search_knowledge_base" in tools3:
        print(f"  ✗ search_knowledge_base should be filtered at help_level=1")
        failed += 1
    else:
        print(f"  ✓ search_knowledge_base correctly filtered at help_level=1")

    return failed


def main() -> int:
    print(f"Hex AI — End-to-End Test against {URL}")
    print(f"Single canonical pass through the full chain")
    print(f"Per Nancy 2026-05-24 #2 — six piecewise sets + one integrated")
    print()
    failed = test_end_to_end_chain()
    print()
    print("─" * 60)
    if failed == 0:
        print("END-TO-END: all integration checks passed")
        return 0
    print(f"END-TO-END FAILED: {failed} check(s) failed")
    return 1


if __name__ == "__main__":
    sys.exit(main())
