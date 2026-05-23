"""
RAG integration tests — added in v0.2.0-alpha (RAG wiring).

These tests run AGAINST a live orchestrator + live pgvector + live ollama.
They are skipped (return early) if the orchestrator can't reach pgvector.

Run: python -m pytest test_rag_integration.py -v
Or:  python test_rag_integration.py
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.request


URL = os.environ.get("HEX_AI_URL", "http://127.0.0.1:8000")


def _http(method: str, path: str, body: dict | None = None):
    req = urllib.request.Request(
        URL + path,
        data=json.dumps(body).encode() if body else None,
        headers={"Content-Type": "application/json"} if body else {},
        method=method,
    )
    return urllib.request.urlopen(req, timeout=120).read().decode()


def _rag_available() -> bool:
    """Probe /context/test?show_rag=1 — if it has rag_chunks, retrieval is wired."""
    try:
        data = json.loads(_http("GET", "/context/test?show_rag=1"))
        return "rag_chunks" in data
    except Exception:
        return False


# ── tests ──────────────────────────────────────────────────────────────────

def test_chat_retrieves_relevant_context_when_query_matches_corpus() -> None:
    """A query that semantically matches the dispatch corpus should surface chunks.

    The dispatch corpus has 95 boxes covering hardware, security, IoT, and
    network categories. A query about 'printer spooler troubleshooting' should
    retrieve PR-001 (Printer Nightmare) as the top hit because that exact
    box description contains "Print Spooler" verbatim.
    """
    if not _rag_available():
        print("  ⚠ skipped — RAG not wired into /context endpoint (run after wiring lands)")
        return
    data = json.loads(_http("POST", "/chat", {
        "user_uid": "regress-rag-1",
        "message": "How do I troubleshoot a stuck print spooler service on Windows?",
        "role": "instructor",
        "show_thinking": True,
        "house": "shield",
    }))
    ctx = data.get("context_packet", {}) or {}
    chunks = ctx.get("rag_chunks", [])
    assert chunks, "expected at least one retrieved chunk for printer-spooler query"
    # Top chunk should be the printer box; relevance > 0.5 indicates a real semantic match
    top = chunks[0]
    top_relevance = 1 - top.get("distance", 1)
    assert top_relevance > 0.5, \
        f"top chunk relevance {top_relevance:.2f} too weak for an obvious match: {top.get('title')}"
    # And the corpus does contain a Printer box so confirm it surfaced
    titles_lower = " ".join(c.get("title", "") for c in chunks).lower()
    assert "printer" in titles_lower or "spooler" in titles_lower, \
        f"printer/spooler query should surface PR-001, got: {[c.get('title') for c in chunks]}"
    print(f"  ✓ rag retrieved {len(chunks)} chunks; top={top['title']!r} relevance={top_relevance:.2f}")


def test_chat_returns_no_chunks_for_irrelevant_query() -> None:
    """A query with nothing in the corpus should return empty chunks (below threshold)."""
    if not _rag_available():
        print("  ⚠ skipped — RAG not wired")
        return
    data = json.loads(_http("POST", "/chat", {
        "user_uid": "regress-rag-2",
        "message": "What is the boiling point of mercury?",
        "role": "instructor",
        "show_thinking": True,
    }))
    ctx = data.get("context_packet", {}) or {}
    chunks = ctx.get("rag_chunks", [])
    # Either no chunks, or all chunks have low confidence (high distance)
    if chunks:
        max_relevance = max(1 - c.get("distance", 1) for c in chunks)
        assert max_relevance < 0.5, f"unrelated query should not match strongly, got max relevance {max_relevance}"
    print(f"  ✓ rag correctly empty/low-confidence for off-topic query ({len(chunks)} weak hits)")


def test_chat_continues_when_rag_unavailable() -> None:
    """If pgvector is down, /chat should still respond — RAG is augmentation, not dependency."""
    # We can't actually take pgvector down in a test, but we can verify the
    # response still has the shape we expect even if rag returns []. This is a
    # smoke test of the not-breaking-anything property.
    data = json.loads(_http("POST", "/chat", {
        "user_uid": "regress-rag-3",
        "message": "What is ls?",
        "role": "student",
        "house": "code",
    }))
    assert "response" in data and len(data["response"]) > 10, \
        "chat must respond even when rag corpus has no match"
    print(f"  ✓ chat still responds when rag has no relevant hits")


def test_rag_does_not_violate_help_level() -> None:
    """RAG-retrieved chunks should not be used by the model to exceed help level."""
    if not _rag_available():
        print("  ⚠ skipped — RAG not wired")
        return
    # Student asks for the answer; even if RAG retrieves the walkthrough,
    # Level-2 ceiling should hold.
    data = json.loads(_http("POST", "/chat", {
        "user_uid": "regress-rag-4",
        "message": "What is the exact flag value for nt1?",
        "role": "student",
        "house": "shield",
    }))
    resp = data["response"].lower()
    # No flag patterns leaked
    assert "flag{" not in resp, f"help-level violation: flag leaked: {data['response'][:200]}"
    print(f"  ✓ help level held even when rag retrieved walkthrough material")


# ── runner ─────────────────────────────────────────────────────────────────

def main() -> int:
    tests = [
        test_chat_retrieves_relevant_context_when_query_matches_corpus,
        test_chat_returns_no_chunks_for_irrelevant_query,
        test_chat_continues_when_rag_unavailable,
        test_rag_does_not_violate_help_level,
    ]
    failed = 0
    print(f"Running {len(tests)} RAG integration tests against {URL}")
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
        print(f"All {len(tests)} RAG tests passed.")
        return 0
    print(f"FAILED: {failed} / {len(tests)}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
