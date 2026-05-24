"""
tools._kb — search_knowledge_base, the first real (student-facing) tool.

Wraps the orchestrator-local RAG retrieval (rag.retrieve from pgvector
hexworth_docs) and exposes it as a tool the model can deliberately call
when its automatic always-on RAG didn't surface the right material.

The automatic RAG runs unconditionally on every chat turn at k=3 with a
0.55 distance threshold. This tool lets the model do a targeted query
with operator-configured k and threshold — e.g., "actually let me check
the knowledge base for boxes about printer spooling" rather than the
implicit retrieval from the user's verbatim message.

Why this is the first real tool (vs get_student_progress per the design):
    1. No external dependencies — pgvector + nomic-embed-text already work.
    2. No CF chain prerequisite — tests the dispatch loop on hexclass alone.
    3. Read-only and safe — search-only, no mutation.
    4. Exercises the same code path get_student_progress will (parameters,
       schema validation, exposure filter, async handler, result shape)
       without waiting for the Firestore connector.

get_student_progress lands in v0.6.0c after the CF deploy chain is live.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from .registry import register_tool, redact_uid

log = logging.getLogger("hex_ai.tools.kb")


@register_tool(
    name="search_knowledge_base",
    description=(
        "Search the Hexworth knowledge base for content relevant to a query. "
        "Use this when the automatic context retrieval didn't surface the "
        "material you need, or when you want to look up a specific topic by "
        "name (e.g., 'printer spooler troubleshooting', 'CMMC domain access "
        "control'). Returns up to 5 chunks with relevance scores."
    ),
    parameters_schema={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "What to look up. Be specific — 'TCP three-way handshake' beats 'networking'.",
            },
            "max_results": {
                "type": "integer",
                "description": "How many chunks to return (1-5; default 3).",
            },
        },
        "required": ["query"],
        "additionalProperties": False,
    },
    exposure_rules={
        # Visible from Level 2 (Directional) upward — at Level 1 (Conceptual)
        # the model should be naming topic areas, not searching for them.
        "min_help_level": 2,
        # All houses + Dr. Hex can call this. Even Dark Arts — searching
        # the knowledge base is the same defensive/offensive duality as
        # the rest of the persona system; the corpus itself is curated.
        "allowed_personas": None,
        "instructor_only": False,
        "audit": True,
    },
)
async def search_knowledge_base(ctx: dict[str, Any], query: str, max_results: int = 3) -> dict[str, Any]:
    """Async wrapper around rag.retrieve. Returns ollama-friendly shape:
    {chunks: [{title, snippet, relevance}, ...], query: str}."""
    # Clamp max_results to a sensible range. The model could in principle
    # request 1000; we don't trust LLM-supplied numerics.
    k = max(1, min(5, int(max_results)))

    # Import locally to avoid loading pgvector dependencies at module-load
    # time (in case tests want to skip RAG-dependent code paths).
    from rag import retrieve as rag_retrieve

    # rag_retrieve is sync (uses urllib + psycopg internally); wrap in
    # to_thread so we don't block the event loop.
    chunks = await asyncio.to_thread(rag_retrieve, query, k)

    log.info(
        "search_knowledge_base: uid=%s query=%r k=%d → %d chunks",
        redact_uid(ctx.get("uid")), query[:80], k, len(chunks),
    )

    return {
        "query": query,
        "chunks": [
            {
                "title": c["title"],
                "snippet": c["chunk"][:500],     # cap chunk length in tool result
                "relevance": round(1 - c["distance"], 2),
            }
            for c in chunks
        ],
        "match_count": len(chunks),
    }
