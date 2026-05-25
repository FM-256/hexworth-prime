#!/usr/bin/env python3
"""
seed_kba.py — ingest the Hexworth Confluence KBA space into pgvector.

Closes Dr. Hex RAG corpus gap #2. Pre-run state: hexworth_docs = 107 rows
(95 dispatch + 12 onboarding). KBA space contains 584 current pages of
operator/instructor documentation that should ground Dr. Hex answers.

Chunking strategy
-----------------
- Page < 2000 chars (post-strip)            → 1 chunk for whole page.
- Page >= 2000 chars                        → split on <h2> boundaries.
- Single <h2> section >= 4000 chars         → soft-split on <h3>; if still
                                              > 4000, hard-split at paragraph
                                              breaks ~3500 chars each.
- Each chunk text is prepended with the page title so embeddings have full
  context even when the section heading alone ("Overview") is ambiguous.

Title format (dedup/upsert key)
-------------------------------
- Single-chunk page:    "KBA: <page title>"
- Multi-chunk page:     "KBA: <page title> — <section heading>"
- Hard-split shard N>1: "KBA: <page title> — <section heading> (part N)"

The "KBA: " prefix is namespaced so a full reseed (or trivial removal of
this corpus) is a one-liner: DELETE FROM hexworth_docs WHERE title LIKE
'KBA: %%'. Mirrors the "Onboarding: " prefix convention from
seed_onboarding.py.

Idempotency
-----------
Each run deletes all KBA: %% rows up front, then re-ingests. Per-page
commit means a mid-run failure leaves the table empty for KBA (cleaned
already, no inserts yet), which is fine — re-run completes the job. We
never end in a half-current/half-stale state.

Skip rules
----------
- type != page (blogposts, attachments) — already filtered via API param.
- status != current — drafts and archived omitted (API default).
- Empty body after HTML strip — skipped with a warning.

Run on hexclass:
    cd /opt/hexclass/orchestrator && .venv/bin/python seed_kba.py [--dry-run] [--limit N]

Dependencies
------------
Stdlib only. HTMLParser handles Confluence XHTML well enough for the
text we need; no BeautifulSoup install required on the orchestrator venv.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from html.parser import HTMLParser

import psycopg


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
PG_DSN = os.environ.get(
    "PG_DSN",
    "postgresql://hexclass@127.0.0.1:5432/hexclass",
)
CONFLUENCE_CREDS = os.environ.get(
    "CONFLUENCE_CREDS",
    os.path.expanduser("~/.config/confluence/credentials.json"),
)
SPACE_KEY = os.environ.get("KBA_SPACE_KEY", "KBA")

# Chunking thresholds (chars, post-strip).
WHOLE_PAGE_MAX = 2000     # below this, no splitting at all
SECTION_MAX = 4000        # above this in one section, sub-split
HARD_SPLIT_TARGET = 3500  # aim each shard near but below this size


# ────────────────────────────────────────────────────────────────────
# Confluence client
# ────────────────────────────────────────────────────────────────────

def load_confluence_creds() -> tuple[str, str, str]:
    """Return (site, email, token) from credentials file."""
    with open(CONFLUENCE_CREDS) as f:
        c = json.load(f)
    return c["site"], c["email"], c["token"]


def confluence_get(site: str, auth_header: str, path: str) -> dict:
    """GET against the Confluence Cloud REST API. path includes leading /."""
    url = f"{site}/wiki/rest/api{path}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": auth_header,
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def list_kba_pages(site: str, auth_header: str, limit: int | None = None) -> list[dict]:
    """List all current pages in the KBA space with body.storage expanded.

    Returns raw page dicts: id, title, status, body.storage.value, version.
    Paginates limit=100 per request. Stops at `limit` total if given.
    """
    pages: list[dict] = []
    start = 0
    page_size = 100
    while True:
        path = (
            f"/content?spaceKey={SPACE_KEY}&type=page&limit={page_size}"
            f"&start={start}&expand=body.storage,version"
        )
        data = confluence_get(site, auth_header, path)
        batch = data.get("results", [])
        if not batch:
            break
        # API only returns current pages by default — defense-in-depth filter.
        for p in batch:
            if p.get("status") != "current":
                continue
            if p.get("type") != "page":
                continue
            pages.append(p)
        if len(batch) < page_size:
            break
        start += page_size
        if limit is not None and len(pages) >= limit:
            pages = pages[:limit]
            break
        # Gentle pacing: 6 batches × ~1s each is nothing vs 5000/hr cap.
        time.sleep(0.2)
    return pages


# ────────────────────────────────────────────────────────────────────
# HTML stripping (Confluence storage XHTML → plain text with H2 markers)
# ────────────────────────────────────────────────────────────────────

class ConfluenceStripper(HTMLParser):
    """Convert Confluence storage XHTML to plain text.

    Behavior:
      - Emits a literal "\\n@@H2:<text>\\n" sentinel where each <h2> starts,
        so the chunker can split deterministically without re-parsing HTML.
      - Emits "\\n@@H3:<text>\\n" similarly for <h3> for soft-split fallback.
      - Block elements (p, li, br, td/tr, h1-h6, hr, div) get newlines.
      - Tables flattened: cells separated by " | ", rows by "\\n".
      - <ac:*> macros: their text content is preserved but the tag is
        ignored. Most KBA pages have no macros; if they do, this prevents
        accidental loss of useful prose.
      - <ri:*> references are skipped (resource identifiers, not content).
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.out: list[str] = []
        self._capture_heading: str | None = None  # 'h2' or 'h3' or None
        self._heading_buf: list[str] = []
        self._in_skip = 0  # for ri: tags and other skippable wrappers

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        t = tag.lower()
        if t.startswith("ri:"):
            self._in_skip += 1
            return
        if t == "h2":
            self._capture_heading = "h2"
            self._heading_buf = []
            self.out.append("\n@@H2:")
        elif t == "h3":
            self._capture_heading = "h3"
            self._heading_buf = []
            self.out.append("\n@@H3:")
        elif t in ("h1", "h4", "h5", "h6"):
            self.out.append("\n")
        elif t in ("br",):
            self.out.append("\n")
        elif t in ("p", "li", "tr", "div", "hr"):
            self.out.append("\n")
        elif t == "td" or t == "th":
            # Cell separator; suppress leading separator at row start
            if self.out and not self.out[-1].endswith("\n"):
                self.out.append(" | ")

    def handle_endtag(self, tag: str) -> None:
        t = tag.lower()
        if t.startswith("ri:"):
            if self._in_skip > 0:
                self._in_skip -= 1
            return
        if t in ("h2", "h3") and self._capture_heading:
            self._capture_heading = None
            self.out.append("\n")
        elif t in ("p", "li", "tr", "div"):
            self.out.append("\n")

    def handle_data(self, data: str) -> None:
        if self._in_skip:
            return
        if self._capture_heading:
            # Heading text goes inline with the @@HN: sentinel.
            self._heading_buf.append(data)
            self.out.append(data)
            return
        self.out.append(data)

    def get_text(self) -> str:
        return "".join(self.out)


def strip_html_to_text(xhtml: str) -> str:
    """Convert Confluence storage XHTML to plain text with H2/H3 sentinels."""
    if not xhtml:
        return ""
    # Decode any remaining entities
    s = html.unescape(xhtml)
    parser = ConfluenceStripper()
    try:
        parser.feed(s)
        parser.close()
    except Exception:
        # On parser failure, fall back to a stripped-tags regex (best effort).
        s = re.sub(r"<[^>]+>", " ", s)
        return re.sub(r"\s+", " ", s).strip()
    text = parser.get_text()
    # Collapse runs of blank lines and trailing whitespace per line.
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ────────────────────────────────────────────────────────────────────
# Chunking
# ────────────────────────────────────────────────────────────────────

# Match the sentinel whether it appears at start-of-text or after a newline.
# Earlier code required a leading "\n" which failed when the H2 was the very
# first content on the page (preamble-empty case), yielding one giant chunk.
H2_SPLIT_RE = re.compile(r"(?:^|\n)@@H2:")
H3_SPLIT_RE = re.compile(r"(?:^|\n)@@H3:")


def _clean_section(text: str) -> str:
    """Drop @@H3: sentinels (we only split on H2 by default) and normalize."""
    # Remove any remaining H3 sentinels (they're embedded in body text).
    text = text.replace("\n@@H3:", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _hard_split(text: str, target: int = HARD_SPLIT_TARGET) -> list[str]:
    """Split a too-large blob at paragraph breaks, near `target` chars each."""
    paragraphs = re.split(r"\n\n+", text)
    shards: list[str] = []
    buf: list[str] = []
    buf_len = 0
    for p in paragraphs:
        p = p.strip()
        if not p:
            continue
        plen = len(p) + 2  # account for the joining \n\n
        if buf and buf_len + plen > target:
            shards.append("\n\n".join(buf).strip())
            buf = [p]
            buf_len = plen
        else:
            buf.append(p)
            buf_len += plen
    if buf:
        shards.append("\n\n".join(buf).strip())
    # If a single paragraph itself exceeds target, accept the oversized shard
    # — embedding model truncates safely. Better than mid-sentence cuts.
    return [s for s in shards if s]


def chunk_page(page_title: str, raw_xhtml: str) -> list[tuple[str, str]]:
    """Return list of (chunk_title, chunk_text) for a single page.

    chunk_title is the dedup/upsert key passed to the DB.
    chunk_text is what gets embedded (page title is prepended for context).
    """
    text = strip_html_to_text(raw_xhtml)
    if not text:
        return []

    # Page short enough → one chunk for the entire body.
    if len(text) < WHOLE_PAGE_MAX:
        body = _clean_section(text)
        if not body:
            return []
        chunk_text = f"{page_title}\n\n{body}"
        return [(f"KBA: {page_title}", chunk_text)]

    # Page is long → split on H2 boundaries.
    # If there are no H2 sentinels at all, treat whole body as one section.
    if "@@H2:" not in text:
        body = _clean_section(text)
        if len(body) < SECTION_MAX:
            return [(f"KBA: {page_title}", f"{page_title}\n\n{body}")]
        # No headings AND huge → hard split.
        shards = _hard_split(body)
        return [
            (
                f"KBA: {page_title} (part {i+1})",
                f"{page_title}\n\n{shard}",
            )
            for i, shard in enumerate(shards)
        ]

    # Anything before the first @@H2: is "preamble"; emit it as its own
    # chunk if substantive (else discard).
    parts = H2_SPLIT_RE.split(text)
    preamble = parts[0]
    sections = parts[1:]

    chunks: list[tuple[str, str]] = []

    pre_clean = _clean_section(preamble)
    if len(pre_clean) > 200:  # ignore tiny preambles (page summary boilerplate)
        chunks.append((
            f"KBA: {page_title} — Overview",
            f"{page_title}\n\n{pre_clean}",
        ))

    for section in sections:
        # First line is the heading text (was captured inline with sentinel).
        section = section.lstrip("\n")
        nl_idx = section.find("\n")
        if nl_idx == -1:
            heading = section.strip()
            body = ""
        else:
            heading = section[:nl_idx].strip()
            body = section[nl_idx + 1:]
        heading = heading or "Section"
        body_clean = _clean_section(body)
        # A heading with no real body adds noise (e.g., "Architecture" alone
        # or a literal "text" placeholder) — these inflate row count without
        # contributing retrievable content. 20 chars is enough to keep
        # legitimate short sections (a single sentence) but drops stubs.
        if len(body_clean) < 20:
            continue
        section_text = f"{heading}\n\n{body_clean}".strip()

        if len(section_text) < SECTION_MAX:
            chunks.append((
                f"KBA: {page_title} — {heading}",
                f"{page_title}\n\n{section_text}",
            ))
            continue

        # Section too big → try H3 split (the H3 sentinels are still in body).
        if "@@H3:" in body:
            h3_parts = H3_SPLIT_RE.split(body)
            h3_pre = h3_parts[0]
            h3_secs = h3_parts[1:]
            # Optionally emit the H3 preamble as the H2 chunk itself.
            if len(_clean_section(h3_pre)) > 200:
                chunks.append((
                    f"KBA: {page_title} — {heading}",
                    f"{page_title}\n\n{heading}\n\n{_clean_section(h3_pre)}",
                ))
            for h3_section in h3_secs:
                h3_section = h3_section.lstrip("\n")
                h3_nl = h3_section.find("\n")
                if h3_nl == -1:
                    h3_heading = h3_section.strip()
                    h3_body = ""
                else:
                    h3_heading = h3_section[:h3_nl].strip()
                    h3_body = _clean_section(h3_section[h3_nl + 1:])
                h3_heading = h3_heading or "Subsection"
                if len(h3_body) < 20:
                    continue
                h3_full = f"{heading} / {h3_heading}\n\n{h3_body}".strip()
                if len(h3_full) < SECTION_MAX:
                    chunks.append((
                        f"KBA: {page_title} — {heading} / {h3_heading}",
                        f"{page_title}\n\n{h3_full}",
                    ))
                else:
                    # Still too big — hard split.
                    shards = _hard_split(h3_full)
                    for i, shard in enumerate(shards):
                        chunks.append((
                            f"KBA: {page_title} — {heading} / {h3_heading} (part {i+1})",
                            f"{page_title}\n\n{shard}",
                        ))
        else:
            # No H3 to split on — hard split this section.
            shards = _hard_split(section_text)
            for i, shard in enumerate(shards):
                chunks.append((
                    f"KBA: {page_title} — {heading} (part {i+1})",
                    f"{page_title}\n\n{shard}",
                ))

    # Drop any empties that crept through and dedup identical titles within
    # one page (defensive — shouldn't happen but H2 collisions theoretically can).
    seen: set[str] = set()
    final: list[tuple[str, str]] = []
    for title, content in chunks:
        if not content.strip():
            continue
        if title in seen:
            # Append a disambiguator instead of dropping the content.
            n = 2
            while f"{title} ({n})" in seen:
                n += 1
            title = f"{title} ({n})"
        seen.add(title)
        final.append((title, content))
    return final


# ────────────────────────────────────────────────────────────────────
# Embedding + DB
# ────────────────────────────────────────────────────────────────────

def embed(text: str) -> list[float]:
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


# ────────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────────

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[1] if __doc__ else "")
    p.add_argument("--dry-run", action="store_true",
                   help="Fetch pages and chunk; print plan, no embed/insert.")
    p.add_argument("--limit", type=int, default=None,
                   help="Cap number of pages fetched (debug aid).")
    p.add_argument("--verbose", action="store_true",
                   help="Print every chunk title as it is processed.")
    args = p.parse_args()

    # Confluence auth (Basic email:token).
    site, email, token = load_confluence_creds()
    import base64
    auth_header = "Basic " + base64.b64encode(f"{email}:{token}".encode()).decode()

    print(f"seed_kba: space={SPACE_KEY} dry_run={args.dry_run} limit={args.limit}")
    print(f"  confluence: {site}")
    print(f"  ollama:     {OLLAMA_URL}")
    print(f"  postgres:   {PG_DSN}")

    print("\n[1/3] Fetching KBA pages...")
    t0 = time.time()
    pages = list_kba_pages(site, auth_header, limit=args.limit)
    print(f"      {len(pages)} pages fetched in {time.time()-t0:.1f}s")

    print("\n[2/3] Chunking...")
    all_chunks: list[tuple[str, str, str]] = []  # (chunk_title, chunk_text, page_title)
    pages_with_no_chunks = 0
    for page in pages:
        body = page.get("body", {}).get("storage", {}).get("value", "") or ""
        title = page.get("title", "Untitled")
        page_chunks = chunk_page(title, body)
        if not page_chunks:
            pages_with_no_chunks += 1
            if args.verbose:
                print(f"  [SKIP empty] {title}")
            continue
        for ct, txt in page_chunks:
            all_chunks.append((ct, txt, title))
            if args.verbose:
                print(f"  [{ct}] {len(txt)} chars")

    avg_chars = sum(len(t) for _, t, _ in all_chunks) / max(len(all_chunks), 1)
    print(f"      {len(all_chunks)} chunks built from {len(pages)} pages")
    print(f"      skipped {pages_with_no_chunks} empty pages")
    print(f"      avg chunk size: {avg_chars:.0f} chars")

    # Sample
    print("\n      sample chunk titles:")
    sample_idxs = [0, len(all_chunks)//4, len(all_chunks)//2,
                   3*len(all_chunks)//4, len(all_chunks)-1]
    for i in sample_idxs:
        if 0 <= i < len(all_chunks):
            print(f"        - {all_chunks[i][0]} ({len(all_chunks[i][1])} chars)")

    if args.dry_run:
        print(f"\n[3/3] DRY RUN — no DB writes. Estimated upsert: {len(all_chunks)} rows.")
        return 0

    print(f"\n[3/3] Embedding + upserting into hexworth_docs...")
    pg_password = load_pg_password()
    conn_kwargs = {"password": pg_password} if pg_password else {}

    t_embed = 0.0
    t_db = 0.0
    inserted = 0

    with psycopg.connect(PG_DSN, **conn_kwargs) as conn:
        with conn.cursor() as cur:
            # Orphan cleanup: every KBA chunk shares the 'KBA: ' title prefix.
            # Re-runs are full regenerations, so wipe-then-insert prevents
            # stale chunks (e.g., a Confluence page that was renamed).
            cur.execute("DELETE FROM hexworth_docs WHERE title LIKE 'KBA: %%'")
            cleaned = cur.rowcount
            print(f"      cleaned {cleaned} existing KBA chunk(s)")
            conn.commit()

            for idx, (ctitle, ctext, ptitle) in enumerate(all_chunks):
                te = time.time()
                try:
                    vec = embed(ctext)
                except Exception as e:
                    print(f"  [EMBED FAIL] {ctitle}: {e}")
                    continue
                t_embed += time.time() - te

                td = time.time()
                try:
                    cur.execute(
                        "INSERT INTO hexworth_docs (title, chunk, embedding) "
                        "VALUES (%s, %s, %s::vector)",
                        (ctitle, ctext, str(vec)),
                    )
                    inserted += 1
                except Exception as e:
                    print(f"  [DB FAIL] {ctitle}: {e}")
                    conn.rollback()
                    continue
                t_db += time.time() - td

                if (idx + 1) % 50 == 0:
                    conn.commit()
                    print(f"      progress: {idx+1}/{len(all_chunks)} "
                          f"(embed_avg={t_embed/(idx+1)*1000:.0f}ms)")
            conn.commit()

    elapsed = time.time() - t0
    print(f"\n  done: inserted {inserted}/{len(all_chunks)} chunks in {elapsed:.1f}s")
    print(f"        embed total: {t_embed:.1f}s   db total: {t_db:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
