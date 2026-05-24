#!/usr/bin/env python3
"""
seed_onboarding.py — ingest Hexworth onboarding chunks into pgvector.

Fixes dr_hex_quality_observations/uNaLPclpME8ECYf5mFv9 — a drhex-q-rag-relevance
issue where the model answered "what is the very first course I should explore
in Hexworth?" with tactical lab descriptions (Intermittent Connectivity, Supply
Chain Alert) because retrieval keyword-matched "first" / "explore" / "course"
against the only content in the corpus: dispatch boxes.

This script adds 12 onboarding-specific chunks:
- 1 chunk: the Sorting Hat (operator-canonical entry point at /sorting.html)
- 11 chunks: one per archetype house, sourced verbatim from sorting.html's
  own house-description dictionary so the embedding matches the canonical
  voice the site already uses with sorted students.

Each chunk's text deliberately includes "new student" / "starting point" /
"first" / "where to begin" vocabulary so semantic similarity surfaces it
for onboarding queries.

Schema, ingest pattern, and embedding model all mirror rag_seed.py. Idempotent:
upserts by title.

Run on hexclass:
    cd /opt/hexclass/orchestrator && .venv/bin/python seed_onboarding.py [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request

import psycopg


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
PG_DSN = os.environ.get(
    "PG_DSN",
    "postgresql://hexclass@127.0.0.1:5432/hexclass",
)


def embed(text: str) -> list[float]:
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


# Authoritative house data sourced from _app/sorting.html (the Sorting Hat).
# Each entry mirrors the site's canonical voice — these are the descriptions
# a student sees AFTER they sort into a house. Reusing this prose keeps the
# corpus consistent with the actual site experience.
HOUSES = [
    {
        "slug": "web",
        "name": "House of the Web",
        "domain": "Networking & Connections",
        "description": (
            "Networking and connections are your domain. You see the routes "
            "between systems, the handshakes between hosts, the paths data "
            "travels. You build, troubleshoot, and secure the wires and "
            "wireless that connect everything."
        ),
    },
    {
        "slug": "shield",
        "name": "House of the Shield",
        "domain": "Security & Defense",
        "description": (
            "Protection is your calling. You stand as the guardian between "
            "systems and those who would breach them. Your mind naturally "
            "fortifies, anticipates threats, and builds walls that others "
            "cannot see until they fail to penetrate them."
        ),
    },
    {
        "slug": "forge",
        "name": "House of the Forge",
        "domain": "Hardware & Systems",
        "description": (
            "Hardware and operating systems are your forge. You understand "
            "what physical machines actually do, how the silicon meets the "
            "software, and how to make rooms full of metal serve your "
            "intent."
        ),
    },
    {
        "slug": "script",
        "name": "House of the Script",
        "domain": "Automation & Efficiency",
        "description": (
            "Automation is your craft. You write the small, sharp programs "
            "that do the work humans would never finish. Linux, shells, "
            "schedulers, pipelines — you make computers carry out the "
            "repetition for you."
        ),
    },
    {
        "slug": "cloud",
        "name": "House of the Cloud",
        "domain": "Infrastructure & Scale",
        "description": (
            "Infrastructure at scale is your medium. You think in regions, "
            "zones, availability, and elasticity. AWS, Azure, GCP — you "
            "design systems that grow without breaking and shrink without "
            "waste."
        ),
    },
    {
        "slug": "code",
        "name": "House of the Code",
        "domain": "Development & DevOps",
        "description": (
            "Building software is your nature. You write, test, ship, "
            "iterate. Your tools are languages and frameworks; your habit "
            "is version control; your goal is code that runs reliably for "
            "other people."
        ),
    },
    {
        "slug": "key",
        "name": "House of the Key",
        "domain": "Cryptography & Identity",
        "description": (
            "Cryptography and identity are your domain. You think in keys, "
            "certificates, and proofs. You understand that trust is a "
            "constructed thing — built from math, not assumption."
        ),
    },
    {
        "slug": "eye",
        "name": "House of the Eye",
        "domain": "Monitoring & Analysis",
        "description": (
            "Observation is your discipline. You watch the logs, the "
            "metrics, the patterns. You can read what a system is doing "
            "from its emissions, and you know when normal stops being "
            "normal."
        ),
    },
    {
        "slug": "dark-arts",
        "name": "House of the Dark Arts",
        "domain": "Offensive Security & Research",
        "description": (
            "Offensive security and research are your calling. You think "
            "like the attacker — not to harm, but to find what defenders "
            "missed. Penetration testing, vulnerability research, and red "
            "teaming are your tradecraft."
        ),
    },
    {
        "slug": "matrix",
        "name": "House of the Matrix",
        "domain": "Mechanics & Operations",
        "description": (
            "Systems and their mechanics are your study. You understand "
            "how the machine works from the inside — the kernel, the "
            "scheduler, the memory model — and you build with that "
            "knowledge."
        ),
    },
    {
        "slug": "divergent",
        "name": "The Factionless",
        "domain": "All Domains",
        "description": (
            "You don't belong to one house. The Factionless move between "
            "domains — exploring whatever catches the eye, sampling skills "
            "across all of Hexworth without committing to a single path. "
            "The Warehouse is your home; the whole platform is your "
            "playground."
        ),
    },
]


def build_chunks() -> list[tuple[str, str]]:
    """Return (title, chunk_text) tuples. Title is the dedup/upsert key.

    Content corrections from Nancy review 2026-05-24:
    - Two entry paths exist (browse + invite). Original chunk falsely
      implied every new student starts at the Sorting Hat.
    - House pages do NOT designate an "introductory module". They show
      Complete Module badges + Incubator (parking-lot) sections. Don't
      claim labels that don't exist on the page.
    - Divergent ("The Factionless") is framed by the Divergent landing
      page as the house for those who skipped or refused sorting, NOT a
      normal sorting outcome. Treat it as the opt-out path.
    """
    chunks: list[tuple[str, str]] = []

    # ─── Sorting Hat + the two entry paths (browse vs invite) ─────
    sorting_chunk = (
        "Where new students start in Hexworth Prime — two entry paths. "
        "Path one (open browse): a student arriving at hexworth.com on "
        "their own follows the 'I'm a Student' button to the Sorting Hat "
        "at /sorting.html. The Sorting Hat is a 20-question quiz scoring "
        "the student across eleven archetype houses and routes them to "
        "the house whose domain best matches their interests; there are "
        "no wrong answers. Students who do not want to commit to one "
        "house can choose 'Browse Freely' to explore all content without "
        "sorting. Path two (invite-gated): a student arriving via a class "
        "or tenant invitation link lands on /accept-invite.html. After "
        "accepting the invite they are redirected to /dashboard.html, "
        "where their tenant's curriculum is presented and they can "
        "choose to take the Sorting quiz later. The recommended first "
        "step for any student without a class invite is the Sorting Hat. "
        "Students with an invite should accept it first; the dashboard "
        "then guides them to their assigned content."
    )
    chunks.append((
        "Onboarding: where new students start (Sorting Hat + invite paths)",
        sorting_chunk,
    ))

    # ─── One chunk per archetype house ────────────────────────────
    for h in HOUSES:
        if h["slug"] == "divergent":
            # Divergent is framed by its own landing page as the
            # destination for those who SKIPPED or REFUSED sorting —
            # not a normal sorting outcome. Frame accordingly.
            text = (
                f"{h['name']} — domain: {h['domain']}. "
                f"{h['description']} "
                f"The Warehouse / Divergent is at /houses/divergent/. "
                f"It is the destination for students who chose 'Browse "
                f"Freely' instead of taking the Sorting quiz, or who "
                f"want to sample skills across many houses without "
                f"committing to one. Students who want a curated path "
                f"should take the Sorting Hat instead; students who "
                f"prefer to explore broadly will find Divergent's "
                f"workbench fits that style."
            )
        else:
            text = (
                f"{h['name']} — domain: {h['domain']}. "
                f"{h['description']} "
                f"The house's landing page is at /houses/{h['slug']}/. "
                f"That page lists this house's completed course paths "
                f"(marked 'Complete Module') and an Incubator section "
                f"of additional modules awaiting curriculum placement. "
                f"A student sorted into {h['name']} — or one browsing "
                f"freely who wants to focus on {h['domain'].lower()} — "
                f"should open this house's landing page and choose a "
                f"course path from the list to begin. Students "
                f"interested in {h['domain'].lower()} should consider "
                f"this house when taking the Sorting quiz."
            )
        title = f"Onboarding: {h['name']} ({h['domain']})"
        chunks.append((title, text))

    return chunks


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    chunks = build_chunks()
    print(f"seed_onboarding: built {len(chunks)} chunks "
          f"(1 Sorting Hat + {len(chunks)-1} houses)")
    print(f"  ollama: {OLLAMA_URL}")
    print(f"  postgres: {PG_DSN}")

    if args.dry_run:
        for title, text in chunks:
            print(f"\n[DRY] {title}")
            print(f"      {text[:140]}...")
        return 0

    # Load PG password (mirrors rag_seed.py pattern)
    pg_password = None
    try:
        with open("/opt/hexclass/.env") as f:
            for line in f:
                if line.startswith("POSTGRES_PASSWORD="):
                    pg_password = line.split("=", 1)[1].strip()
                    break
    except Exception:
        pass
    conn_kwargs = {"password": pg_password} if pg_password else {}

    with psycopg.connect(PG_DSN, **conn_kwargs) as conn:
        with conn.cursor() as cur:
            # Orphan cleanup (Nancy 2026-05-24): every onboarding chunk
            # shares the 'Onboarding: ' title prefix. Each run fully
            # regenerates the set, so deleting all prefix matches before
            # upsert prevents stale chunks from surviving a retitle. The
            # set is small (12) and prefix-namespaced, so this is not
            # aggressive — it's exactly the chunks we own.
            cur.execute(
                "DELETE FROM hexworth_docs WHERE title LIKE 'Onboarding: %%'"
            )
            print(f"  cleaned {cur.rowcount} existing onboarding chunk(s)")

            for title, text in chunks:
                vec = embed(text)
                cur.execute(
                    "INSERT INTO hexworth_docs (title, chunk, embedding) "
                    "VALUES (%s, %s, %s::vector)",
                    (title, text, str(vec)),
                )
                print(f"  inserted: {title}")
        conn.commit()
    print(f"\n  ✓ seeded {len(chunks)} onboarding chunks")
    return 0


if __name__ == "__main__":
    sys.exit(main())
