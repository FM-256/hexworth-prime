#!/usr/bin/env python3
"""
RAG seed — populate pgvector hexworth_docs with Hexworth content.

Phase 1 corpus: dispatch boxes.json metadata. Each box becomes one
chunk: title + subtitle + description + ticket category + tags.
Embedded via ollama nomic-embed-text (768 dim), inserted into pgvector.

Future phases:
- Confluence Solutions Manual pages (HTML strip → chunks)
- BoxEngine config.js docstrings
- ContentCatalog entries
- Walkthroughs at ~/hexworth-shared/Solutions/

Run: python rag_seed.py [--source dispatch] [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request

import psycopg
from psycopg.rows import dict_row


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
PG_DSN = os.environ.get(
    "PG_DSN",
    "postgresql://hexclass@127.0.0.1:5432/hexclass",
)


def embed(text: str) -> list[float]:
    """Ollama /api/embed → 768-dim vector."""
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/embed",
        data=json.dumps({"model": "nomic-embed-text", "input": text}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode())
    embeddings = data.get("embeddings", [])
    if not embeddings:
        raise RuntimeError(f"empty embedding for: {text[:80]}")
    return embeddings[0]


def seed_dispatch_boxes(conn, dry_run: bool = False) -> int:
    """Each dispatch box → one chunk."""
    src = os.path.expanduser("~/ai-content/hexworth-prime/_app/dispatch/boxes.json")
    # On hexclass, the path is different — accept either
    if not os.path.exists(src):
        # Try local-to-script
        local_alt = "/opt/hexclass/orchestrator/boxes.json"
        if os.path.exists(local_alt):
            src = local_alt
        else:
            raise FileNotFoundError(f"boxes.json not found at {src} or {local_alt}")
    with open(src) as f:
        manifest = json.load(f)
    boxes = manifest.get("boxes", [])
    inserted = 0
    with conn.cursor() as cur:
        for box in boxes:
            chunk_text = (
                f"{box['title']} ({box['ticketId']}). "
                f"{box.get('subtitle', '')}. "
                f"{box.get('description', '')} "
                f"Category: {box.get('categoryLabel', '')}. "
                f"Difficulty: {box.get('difficulty', '')}. "
                f"Tags: {', '.join(box.get('tags', []))}."
            ).strip()
            title = f"Dispatch box {box['ticketId']}: {box['title']}"
            if dry_run:
                print(f"  [DRY] {title} | {len(chunk_text)} chars")
                inserted += 1
                continue
            vec = embed(chunk_text)
            # Check for existing entry by title (idempotent reseed)
            cur.execute("SELECT id FROM hexworth_docs WHERE title = %s", (title,))
            existing = cur.fetchone()
            if existing:
                cur.execute(
                    "UPDATE hexworth_docs SET chunk = %s, embedding = %s::vector WHERE id = %s",
                    (chunk_text, str(vec), existing[0]),
                )
            else:
                cur.execute(
                    "INSERT INTO hexworth_docs (title, chunk, embedding) VALUES (%s, %s, %s::vector)",
                    (title, chunk_text, str(vec)),
                )
            inserted += 1
            if inserted % 10 == 0:
                print(f"  seeded {inserted}/{len(boxes)}")
    if not dry_run:
        conn.commit()
    return inserted


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--source", default="dispatch", choices=["dispatch"])
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    print(f"RAG seed: source={args.source} dry-run={args.dry_run}")
    print(f"  ollama: {OLLAMA_URL}")
    print(f"  postgres: {PG_DSN}")

    pg_password = None
    try:
        with open("/opt/hexclass/.env") as f:
            for line in f:
                if line.startswith("POSTGRES_PASSWORD="):
                    pg_password = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass

    conn_kwargs = {}
    if pg_password:
        conn_kwargs["password"] = pg_password

    with psycopg.connect(PG_DSN, **conn_kwargs, row_factory=dict_row) as conn:
        n = seed_dispatch_boxes(conn, dry_run=args.dry_run)
    print(f"\n  ✓ seeded {n} dispatch chunks into hexworth_docs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
