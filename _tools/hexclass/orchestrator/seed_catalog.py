#!/usr/bin/env python3
"""
seed_catalog.py - ingest the Hexworth Observatory course tree into pgvector.

This is the "ContentCatalog entries" future source noted in rag_seed.py's
module docstring (Option A). It makes Dr. Hex content-aware of the courses,
chapters, labs, quizzes, presentations, and interactive applets that make up
the sixteen scheduled courses surfaced in the Hexworth Observatory.

Data source (pure file reads, no browser JS imported)
-----------------------------------------------------
- _app/data/course-trees/manifest.json      : maps each crawled hub (a page
  path like "houses/cloud/modules/wsa/index.html") to a per-hub tree JSON file.
- _app/data/course-trees/<hub>.json          : the crawl tree for that hub.
  Each node has: path, title (the destination page's real <title>), status,
  depth, linkType (href / course-home / returnUrl / prev / next / redirect),
  linkText. The trees are a site crawl snapshot (see each file's "generated").

Scope: the sixteen Observatory course cards. The authoritative list is
OBSERVATORY_CONFIG.paths in _app/houses/observatory/index.html (see the card
table at index.html lines 264-279). Each card has an id (e.g. obs-wsa) and a
content-root href (e.g. /houses/cloud/modules/wsa/index.html). We transcribe
that table into OBSERVATORY_CARDS below and cite the source; if a card is
added, moved, or removed in index.html, update OBSERVATORY_CARDS to match.

Ownership rule (avoids cross-course misattribution)
---------------------------------------------------
A course's tree crawl also links out to sibling courses and house-index pages.
Attributing those to the linking course would misinform Dr. Hex. So:

  1. Collect every unique content node (dedup by path) from the tree file(s)
     mapped to the sixteen cards. Skip pure-navigation linkTypes
     (returnUrl, redirect, course-home, prev, next) so back-links and
     next/prev edges do not become chunks.
  2. Assign each unique path to the Observatory card whose configured root is
     the LONGEST prefix of that path. Longest-prefix means a lesson under
     houses/script/modules/linux-mastery is owned by Linux Mastery even when
     the Command Line Hacker course links to it.
  3. SECONDARY_ROOTS adds a small, explicit, documented extra root where a
     card's href is a thin launcher page but the course's real lessons live at
     a sibling path. Only obs-clh needs this today: its card points at
     houses/script/courses/clh (a launcher) while its numbered lessons live at
     houses/script/clh/script-clh-*.applet.html (confirmed in the crawl).
  4. A node under NO configured root is dropped as an out-of-scope cross-link
     (e.g. a link from a Network+ page to a sibling web-house course, or from
     CLH to the House of Script index). This keeps every chunk correctly
     attributed to exactly one course.

Chunking: one chunk per owned node (the course home, plus each chapter,
presentation, lab, quiz, and interactive applet under it). The course-home
node's body is enriched with a per-type count so "what is in course X?"
retrieves a useful overview.

Title format (dedup / upsert key)
---------------------------------
- Course home:  "Catalog: <course name> - Course Overview"
- Other node:   "Catalog: <course name> - <destination page title>"
- On a title collision within a course, a " [<filename>]" suffix disambiguates.

The "Catalog: " prefix is namespaced so a full reseed (or removal of this
corpus) is one line: DELETE FROM hexworth_docs WHERE title LIKE 'Catalog: %'.
Mirrors the "KBA: " prefix convention in seed_kba.py and "Onboarding: " in
seed_onboarding.py.

Idempotency: each run deletes all Catalog: rows up front, then re-inserts.
Schema, embedding model, PG connection, and password handling all mirror
seed_kba.py / seed_onboarding.py exactly.

Source-freshness caveats (be honest with the operator)
------------------------------------------------------
- The trees are a crawl SNAPSHOT (see each file's "generated" timestamp, around
  2026-03-29). A course whose content root was never reached by that crawl
  produces ZERO chunks here. That is NOT the same as the course having no
  content: at the time of writing, six of the sixteen cards (Python for IT,
  Ethics in IT, Principles of Information Security, Projects Hub, Bug Hunting,
  Advanced Linux Administration) have live pages on disk but no hub in the
  crawl, so they seed nothing. The dry-run report calls these out explicitly.
  To cover them, re-crawl those roots into the manifest first, then reseed.
- Any page whose <title> changed since the crawl will seed a chunk with the
  title as it was crawled, which may differ slightly from the live page. Titles
  are used for retrieval context, not as navigation, so mild drift is tolerable;
  a reseed after a fresh crawl corrects it.
- Broken-status crawl nodes (dead links, often with a null title) are skipped so
  they never enter the corpus as confidently-wrong hits.

Run on hexclass:
    cd /opt/hexclass/orchestrator && .venv/bin/python seed_catalog.py [--dry-run]

--dry-run does NOT connect to the DB or embed. It writes every generated chunk
(title + body) to catalog-chunks.sample.json and prints total + per-course
counts so the output can be reviewed off the box.

Dependencies: stdlib only for chunking; psycopg for the live insert path.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time

# NOTE: psycopg is imported lazily inside the live-insert branch of main() (not
# at module top like the sibling seeders) so that --dry-run can run off the
# hexclass box, where psycopg may not be installed. The live path still uses it.

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
PG_DSN = os.environ.get(
    "PG_DSN",
    "postgresql://hexclass@127.0.0.1:5432/hexclass",
)

# Where the course-tree crawl lives. On a dev checkout the repo path works; on
# the hexclass box the operator copies _app/data/course-trees next to the
# orchestrator (or sets CATALOG_TREES_DIR). Mirrors rag_seed.py's multi-path
# probe for boxes.json.
_TREE_DIR_CANDIDATES = [
    os.environ.get("CATALOG_TREES_DIR", ""),
    os.path.expanduser("~/ai-content/hexworth-prime/_app/data/course-trees"),
    "/opt/hexclass/orchestrator/course-trees",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "course-trees"),
]


def resolve_tree_dir() -> str:
    for cand in _TREE_DIR_CANDIDATES:
        if cand and os.path.isfile(os.path.join(cand, "manifest.json")):
            return cand
    raise FileNotFoundError(
        "course-trees manifest.json not found. Set CATALOG_TREES_DIR to the "
        "directory holding manifest.json and the per-hub tree JSONs "
        "(repo path: _app/data/course-trees)."
    )


# --------------------------------------------------------------------------
# Observatory card table
# --------------------------------------------------------------------------
# Verbatim transcription of OBSERVATORY_CONFIG.paths in
# _app/houses/observatory/index.html (lines 264-279). Each card is a scheduled
# course surfaced in the Observatory; "root" is the card's href with the
# leading slash and any trailing "index.html" / "/" removed. Keep in sync with
# index.html: if a card is added, moved, or removed there, update this table.
#
# Fields: id, root, name, cert, house.
OBSERVATORY_CARDS = [
    {"id": "obs-aplus-core1",     "root": "houses/forge/applets/comptia-aplus/core-1", "name": "A+ Core 1",                          "cert": "CompTIA 220-1101", "house": "forge"},
    {"id": "obs-aplus-core2",     "root": "houses/forge/applets/comptia-aplus/core-2", "name": "A+ Core 2",                          "cert": "CompTIA 220-1102", "house": "forge"},
    {"id": "obs-md-100",          "root": "houses/forge/md-100",                       "name": "MD-100: Windows Client",             "cert": "Microsoft MD-100", "house": "forge"},
    {"id": "obs-md-101",          "root": "houses/forge/md-101",                       "name": "MD-101: Modern Desktops",            "cert": "Microsoft MD-101", "house": "forge"},
    {"id": "obs-network-plus",    "root": "houses/web/network-plus",                   "name": "Network+",                           "cert": "CompTIA N10-009",  "house": "web"},
    {"id": "obs-wsa",             "root": "houses/cloud/modules/wsa",                  "name": "Windows Server Administration",      "cert": "CTS1328C",         "house": "cloud"},
    {"id": "obs-python-it",       "root": "houses/code/python-for-it",                 "name": "Python for IT",                      "cert": "COP1034C",         "house": "code"},
    {"id": "obs-ethics-it",       "root": "houses/divergent/ethics-it",                "name": "Ethics in IT",                       "cert": "CIS4253",          "house": "divergent"},
    {"id": "obs-cis2350c",        "root": "houses/shield/infosec",                     "name": "Principles of Information Security", "cert": "CIS2350C",         "house": "shield"},
    {"id": "obs-projects",        "root": "projects",                                  "name": "Projects Hub",                       "cert": "Hands-On Projects","house": "projects"},
    {"id": "obs-ethical-hacking", "root": "houses/dark-arts/feh",                      "name": "Foundations of Ethical Hacking",     "cert": "Offensive Security","house": "dark-arts"},
    {"id": "obs-clh",             "root": "houses/script/courses/clh",                 "name": "Command Line Hacker (CLH)",          "cert": "Command-Line / Offensive", "house": "script"},
    {"id": "obs-linux-mastery",   "root": "houses/script/modules/linux-mastery",       "name": "Linux Mastery",                      "cert": "Linux",            "house": "script"},
    {"id": "obs-linux-admin",     "root": "houses/script/linux",                       "name": "Linux Administration",               "cert": "Linux",            "house": "script"},
    {"id": "obs-bug-hunting",     "root": "dark-arts/vault/bug-hunting",               "name": "Bug Hunting",                        "cert": "Offensive Security","house": "dark-arts"},
    {"id": "obs-adv-linux",       "root": "houses/matrix/adv-linux",                   "name": "Advanced Linux Administration",      "cert": "CTS4321C",         "house": "matrix"},
]

# Explicit extra content roots for cards whose href is a launcher page while
# the real lessons live at a sibling path. Documented per entry. Keep minimal.
SECONDARY_ROOTS = {
    # CLH's card points at the launcher houses/script/courses/clh, but its
    # numbered lessons are applets at houses/script/clh/script-clh-*.applet.html
    # (observed directly in script--courses--clh.json). Without this the course
    # would seed only its launcher page.
    "obs-clh": ["houses/script/clh"],
    # FEH's card points at the launcher houses/dark-arts/feh, but its 10 modules
    # (presentation + lab + quiz each) live at houses/dark-arts/{presentations,labs,
    # quizzes}/dark-arts-feh-*.html (the launcher builds cards from those relative
    # paths). Those three dirs are FEH-only (10 files each), so scoping to them does
    # not pull in other content.
    "obs-ethical-hacking": [
        "houses/dark-arts/presentations",
        "houses/dark-arts/labs",
        "houses/dark-arts/quizzes",
    ],
}

# Navigation linkTypes carry no new content; their targets are reached as
# content nodes elsewhere in the crawl (via href) or are house-index / course
# back-links. Excluding them keeps chunk count to real content pages.
NAV_LINKTYPES = {"returnUrl", "redirect", "course-home", "prev", "next"}


# --------------------------------------------------------------------------
# Manifest + tree loading
# --------------------------------------------------------------------------

def _norm_hub(hub: str) -> str:
    """Normalize a manifest hub path to a bare root (drop index.html / slash)."""
    return hub.replace("/index.html", "").rstrip("/")


def load_hub_files(tree_dir: str) -> dict[str, str]:
    """Return {normalized hub path: tree filename} from the manifest."""
    with open(os.path.join(tree_dir, "manifest.json")) as f:
        manifest = json.load(f)
    out: dict[str, str] = {}
    for h in manifest.get("hubs", []):
        out[_norm_hub(h["hub"])] = h["file"]
    return out


def trees_for_card(card: dict, hub_files: dict[str, str]) -> list[str]:
    """Tree filenames whose hub is at or below this card's primary root."""
    root = card["root"]
    files: list[str] = []
    for hub, fname in hub_files.items():
        if hub == root or hub.startswith(root + "/"):
            files.append(fname)
    return sorted(set(files))


# --------------------------------------------------------------------------
# Ownership (longest configured-root prefix wins; unrooted is dropped)
# --------------------------------------------------------------------------

def build_owner_index() -> list[tuple[str, str]]:
    """Return (root, card_id) pairs for every primary and secondary root."""
    pairs: list[tuple[str, str]] = []
    for card in OBSERVATORY_CARDS:
        pairs.append((card["root"], card["id"]))
        for sec in SECONDARY_ROOTS.get(card["id"], []):
            pairs.append((sec, card["id"]))
    return pairs


def _under(path: str, root: str) -> bool:
    return path == root or path.startswith(root + "/")


def owner_of(path: str, owner_index: list[tuple[str, str]]) -> str | None:
    """Card id whose configured root is the longest prefix of path, or None."""
    best: str | None = None
    best_len = -1
    for root, card_id in owner_index:
        if _under(path, root) and len(root) > best_len:
            best = card_id
            best_len = len(root)
    return best


# --------------------------------------------------------------------------
# Node text helpers + type classifier
# --------------------------------------------------------------------------

_ARROW_RE = re.compile(r"[←-⇿⤀-⥿]")  # arrows (glyph forms)


def clean_text(s: str) -> str:
    """Unescape HTML entities, drop arrow glyphs, normalize dashes, collapse WS.

    Em-dash (U+2014) and en-dash (U+2013) that appear in crawled page titles are
    normalized to a spaced hyphen so no output carries them (platform style is
    hyphen-only). Written with unicode escapes so this source stays dash-clean.
    """
    if not s:
        return ""
    s = html.unescape(s)
    # Common textual arrow entities survive as glyphs after unescape; also drop
    # the literal ASCII arrow sequences used in link labels.
    s = _ARROW_RE.sub("", s)
    s = s.replace("->", "").replace("<-", "")
    # Em / en dash from source titles -> spaced hyphen. The dash chars are built
    # from unicode escapes so this source file itself stays dash-clean.
    em_en = chr(0x2014) + chr(0x2013)  # em-dash, en-dash
    s = re.sub(r"\s*[" + em_en + r"]\s*", " - ", s)
    s = re.sub(r"\s+", " ", s).strip()
    # Collapse any hyphen run the substitutions may have produced down to one,
    # so no output carries a double-hyphen sequence.
    s = re.sub(r"-{2,}", "-", s)
    s = re.sub(r" -(?: -)+ ", " - ", s)
    return s.strip()


def classify(path: str, title: str) -> str:
    """Human-readable node type from the filename and title.

    The crawl uses compound extensions (.quiz.html, .lab.html, .module.html,
    .applet.html, .presentation.html) and filename tokens (guilab, pslab,
    quizquiz, sim, review) that identify what each page is.
    """
    base = path.rsplit("/", 1)[-1].lower()
    low = title.lower()
    if base == "index.html":
        # A section / chapter landing page. The true course-home node is
        # identified separately in build_chunks() by matching the card root,
        # so a bare index.html here is an interior section, not the course home.
        return "Section"
    if base.endswith(".quiz.html") or "quiz" in base:
        return "Quiz"
    if "guilab" in base or "gui lab" in low:
        return "GUI lab"
    if "pslab" in base or "powershell lab" in low:
        return "PowerShell lab"
    if base.endswith(".lab.html") or "sim" in base or "lab" in base:
        return "Lab"
    if "review" in base or "review" in low or "midterm" in base or "final" in base or "gauntlet" in base:
        return "Review"
    if "exam" in base or "exam" in low:
        return "Exam"
    if base.endswith(".presentation.html") or "presentation" in base:
        return "Presentation"
    if base.endswith(".applet.html"):
        return "Interactive lab"
    if base.endswith(".module.html") or "module" in base:
        return "Module page"
    return "Page"


# --------------------------------------------------------------------------
# Chunk building
# --------------------------------------------------------------------------

def collect_owned_nodes(tree_dir: str, hub_files: dict[str, str]):
    """Return {card_id: {path: (title, linkType, linkText)}} of owned content
    nodes, deduped by path, with navigation linkTypes skipped and unrooted
    cross-links dropped."""
    owner_index = build_owner_index()
    # path -> (title, linkType, linkText); first non-empty title wins.
    node_info: dict[str, tuple[str, str, str]] = {}
    for card in OBSERVATORY_CARDS:
        for fname in trees_for_card(card, hub_files):
            fpath = os.path.join(tree_dir, fname)
            if not os.path.isfile(fpath):
                continue
            with open(fpath) as f:
                data = json.load(f)
            root = data.get("tree")

            def walk(node):
                if not node:
                    return
                p = node.get("path")
                lt = node.get("linkType")
                # Skip navigation edges, and skip broken links (they point at
                # pages that 404 or error, so they must not become RAG chunks).
                # Broken nodes are also the source of the title:null cases in the
                # crawl; excluding them removes both problems at once.
                if p and lt not in NAV_LINKTYPES and node.get("status") != "broken":
                    prev = node_info.get(p)
                    title = node.get("title") or ""
                    if prev is None or (not prev[0] and title):
                        node_info[p] = (title, lt or "", node.get("linkText") or "")
                for child in (node.get("children") or []):
                    walk(child)

            if root:
                walk(root)

    owned: dict[str, dict[str, tuple[str, str, str]]] = {c["id"]: {} for c in OBSERVATORY_CARDS}
    for p, info in node_info.items():
        cid = owner_of(p, owner_index)
        if cid is not None:
            owned[cid][p] = info
    return owned


def _plural(word: str, n: int) -> str:
    """Pluralize a content-type word for the inventory line (quiz -> quizzes)."""
    if n == 1:
        return word
    if word.endswith("z"):
        return word + "zes"
    if word.endswith(("s", "x", "ch", "sh")):
        return word + "es"
    return word + "s"


def build_chunks(tree_dir: str, hub_files: dict[str, str]):
    """Return (chunks, per_course_counts).

    chunks: list of dicts {title, body, course, type, path}.
    per_course_counts: {card_id: int}.
    """
    owned = collect_owned_nodes(tree_dir, hub_files)
    card_by_id = {c["id"]: c for c in OBSERVATORY_CARDS}

    chunks: list[dict] = []
    per_course: dict[str, int] = {}

    for card in OBSERVATORY_CARDS:
        cid = card["id"]
        nodes = owned.get(cid, {})
        per_course[cid] = len(nodes)
        if not nodes:
            continue

        name = card["name"]
        cert = card["cert"]
        house = card["house"]

        # The true course home is the node whose path is the card's own root
        # (optionally with a trailing /index.html). Interior index.html pages
        # are sections, classified as "Section", not homes.
        home_candidates = {card["root"], card["root"] + "/index.html"}
        home_path = None

        # Per-type tally for the course-overview enrichment.
        type_counts: dict[str, int] = {}
        classified: dict[str, tuple[str, str, str, str]] = {}  # path -> (ntype,title,lt,linkText)
        for p, (title, lt, link) in nodes.items():
            if p in home_candidates and home_path is None:
                ntype = "Course home"
                home_path = p
            else:
                ntype = classify(p, title)
                type_counts[ntype] = type_counts.get(ntype, 0) + 1
            classified[p] = (ntype, title, lt, link)

        # Titles already used within this course, for collision disambiguation.
        used_titles: set[str] = set()

        def make_title(node_title: str, path: str, is_home: bool) -> str:
            if is_home:
                stub = "Course Overview"
            else:
                stub = clean_text(node_title) or classify(path, node_title)
            title = f"Catalog: {name} - {stub}"
            if title in used_titles:
                base = path.rsplit("/", 1)[-1]
                title = f"{title} [{base}]"
                n = 2
                while title in used_titles:
                    title = f"Catalog: {name} - {stub} [{base}] ({n})"
                    n += 1
            used_titles.add(title)
            return title

        # Emit the course-home chunk first, enriched with a content inventory.
        if home_path is not None:
            _, htitle, _, _ = classified[home_path]
            inv = ", ".join(f"{cnt} {_plural(t.lower(), cnt)}"
                            for t, cnt in sorted(type_counts.items()))
            # Front-load the distinctive terms (course name, "overview", the content
            # inventory) so the embedding is dominated by what a "what is in course X?"
            # query actually matches, not by the shared Observatory boilerplate.
            body = (
                f"{name} ({cert}) - Course Overview. "
                f"Contents: " + (inv if inv else "landing page only") + ". "
                + (f'Landing page titled "{clean_text(htitle)}". ' if clean_text(htitle) else "")
                + f"The {name} course in the Hexworth Observatory, House of "
                f"{house.title()}. Course home path: {home_path}."
            )
            chunks.append({
                "title": make_title(htitle, home_path, True),
                "body": body,
                "course": name,
                "type": "Course home",
                "path": home_path,
            })

        # Emit one chunk per remaining node.
        for p in sorted(nodes.keys()):
            if p == home_path:
                continue
            ntype, title, lt, link = classified[p]
            ctitle = clean_text(title)
            link_clean = clean_text(link)
            # Front-load the page's own title and the course name so the discriminating
            # terms (e.g. "Reconnaissance & OSINT Lab", the course) lead the embedding
            # instead of the repeated "in the Hexworth Observatory" boilerplate that made
            # every catalog chunk look alike to the retriever.
            lead = f"{ctitle}. " if ctitle else ""
            body = (
                f"{lead}"
                f"{ntype} in {name} ({cert})."
                + (f' Also linked as "{link_clean}".'
                   if link_clean and link_clean.lower() not in ctitle.lower() else "")
                + f" Part of the {name} course in the Hexworth Observatory, House of "
                f"{house.title()}. Page path: {p}."
            )
            chunks.append({
                "title": make_title(title, p, False),
                "body": body,
                "course": name,
                "type": ntype,
                "path": p,
            })

    return chunks, per_course


# --------------------------------------------------------------------------
# Embedding + DB (mirrors seed_kba.py / seed_onboarding.py)
# --------------------------------------------------------------------------

def embed(text: str) -> list[float]:
    import urllib.request
    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/embed",
        data=json.dumps({"model": "nomic-embed-text", "input": text}).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.loads(r.read().decode())
    embeddings = data.get("embeddings", [])
    if not embeddings:
        raise RuntimeError(f"empty embedding for: {text[:80]}")
    return embeddings[0]


def load_pg_password() -> str | None:
    try:
        with open("/opt/hexclass/.env") as f:
            for line in f:
                if line.startswith("POSTGRES_PASSWORD="):
                    return line.split("=", 1)[1].strip()
    except Exception:
        return None
    return None


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def main() -> int:
    p = argparse.ArgumentParser(
        description="Seed Observatory course-tree chunks into hexworth_docs."
    )
    p.add_argument("--dry-run", action="store_true",
                   help="Build chunks, write catalog-chunks.sample.json, print "
                        "counts. No DB connection, no embedding.")
    p.add_argument("--verbose", action="store_true",
                   help="Print every chunk title as it is inserted.")
    args = p.parse_args()

    tree_dir = resolve_tree_dir()
    hub_files = load_hub_files(tree_dir)

    print(f"seed_catalog: dry_run={args.dry_run}")
    print(f"  trees:    {tree_dir}")
    print(f"  ollama:   {OLLAMA_URL}")
    print(f"  postgres: {PG_DSN}")

    print("\n[1/2] Building chunks from Observatory course trees...")
    t0 = time.time()
    chunks, per_course = build_chunks(tree_dir, hub_files)
    print(f"      {len(chunks)} chunks built in {time.time()-t0:.1f}s")

    print("\n      per-course chunk counts:")
    zero_courses = []
    for card in OBSERVATORY_CARDS:
        n = per_course.get(card["id"], 0)
        flag = "" if n else "   <- not crawled (see note below)"
        if not n:
            zero_courses.append(card["id"])
        print(f"        {card['id']:22s} {n:4d}{flag}")
    print(f"      total: {len(chunks)} chunks across "
          f"{len(OBSERVATORY_CARDS) - len(zero_courses)}/{len(OBSERVATORY_CARDS)} courses")
    if zero_courses:
        print(f"\n      NOTE: {len(zero_courses)} course(s) produced 0 chunks: "
              f"{', '.join(zero_courses)}.")
        print("      This does NOT mean the course has no content. It means the "
              "course's content root")
        print("      has no hub in the course-tree crawl this seeder reads. The "
              "live course pages exist")
        print("      on disk; they were never crawled from the Observatory root, "
              "so there is no tree to")
        print("      chunk. To cover them, re-run the course-tree crawler against "
              "these roots, then reseed.")

    if args.dry_run:
        out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                "catalog-chunks.sample.json")
        with open(out_path, "w") as f:
            json.dump({
                "generated_by": "seed_catalog.py --dry-run",
                "tree_dir": tree_dir,
                "total_chunks": len(chunks),
                "per_course": per_course,
                "zero_chunk_courses": zero_courses,
                "chunks": chunks,
            }, f, indent=2)
        print(f"\n[2/2] DRY RUN - wrote {len(chunks)} chunks to {out_path}")
        print("      (no DB writes, no embedding)")
        return 0

    print("\n[2/2] Embedding + upserting into hexworth_docs...")
    import psycopg  # lazy: keeps --dry-run runnable where psycopg is absent
    pg_password = load_pg_password()
    conn_kwargs = {"password": pg_password} if pg_password else {}

    inserted = 0
    with psycopg.connect(PG_DSN, **conn_kwargs) as conn:
        with conn.cursor() as cur:
            # Orphan cleanup: every catalog chunk shares the 'Catalog: ' title
            # prefix. Each run fully regenerates the set, so wipe-then-insert
            # prevents stale chunks surviving a retitle or a moved course.
            # Exact SQL (single %): DELETE FROM hexworth_docs WHERE title LIKE 'Catalog: %'
            cur.execute("DELETE FROM hexworth_docs WHERE title LIKE 'Catalog: %%'")
            print(f"      cleaned {cur.rowcount} existing Catalog chunk(s)")
            conn.commit()

            for idx, ch in enumerate(chunks):
                try:
                    vec = embed(ch["body"])
                except Exception as e:
                    print(f"  [EMBED FAIL] {ch['title']}: {e}")
                    continue
                try:
                    cur.execute(
                        "INSERT INTO hexworth_docs (title, chunk, embedding) "
                        "VALUES (%s, %s, %s::vector)",
                        (ch["title"], ch["body"], str(vec)),
                    )
                    inserted += 1
                except Exception as e:
                    print(f"  [DB FAIL] {ch['title']}: {e}")
                    conn.rollback()
                    continue
                if args.verbose:
                    print(f"  [{ch['title']}]")
                if (idx + 1) % 50 == 0:
                    conn.commit()
                    print(f"      progress: {idx+1}/{len(chunks)}")
            conn.commit()

    print(f"\n  done: inserted {inserted}/{len(chunks)} catalog chunks "
          f"in {time.time()-t0:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
