# Dr. Hex Catalog Seeding (Observatory content-awareness)

Makes Dr. Hex aware of every Observatory course/chapter/lab by embedding the course catalog
into its retrieval corpus. This is the "Option A" path noted as a future phase in
`rag_seed.py`. Zero frontend or prompt changes: once seeded, the catalog is surfaced
automatically by `rag.retrieve()` and the `search_knowledge_base` tool.

First run: 2026-07-05 — 918 chunks across 16/16 Observatory courses.

## Architecture (why this is a box step, not a website deploy)

Dr. Hex's LLM orchestrator runs off-repo on the **hexclass GPU box** (`ssh hexclass`,
`/opt/hexclass/orchestrator`). It retrieves context from a Postgres + pgvector table
`hexworth_docs`, embedding with ollama `nomic-embed-text`. Catalog rows live under the
`Catalog: ` title prefix, alongside `KBA: ` / `Onboarding: ` / dispatch rows (untouched by
this process). A website (`firebase deploy`) does not touch any of this.

## When to reseed

- New Observatory course or a course's content changes materially.
- The Observatory course list (`OBSERVATORY_CONFIG.paths` in
  `_app/houses/observatory/index.html`) changes.

## Files

| File | Role |
|---|---|
| `_tools/hexclass/orchestrator/seed_catalog.py` | The seeder. Reads `course-trees/manifest.json` + trees, builds one chunk per course/chapter/lab, embeds, upserts into `hexworth_docs`. Idempotent: wipes `Catalog: %` rows then inserts. `--dry-run` writes `catalog-chunks.sample.json` and touches no DB. |
| `_tools/observatory/recrawl-6-roots.js` | Crawls the Observatory roots the standard `--tree --all` crawler misses (its `discoverHubs` only scans `houses/`, so `projects/` and `dark-arts/` are skipped), merging their trees + manifest entries. |
| `_tools/observatory/fstree-roots.js` | Builds filesystem-derived trees for roots whose hub renders content dynamically (`data-path-href` launcher pattern, e.g. Projects and Bug Hunting), which the static link-crawler cannot follow. Emits the same node shape the crawler does. |
| `_app/data/course-trees/*.json` | The crawl trees + `manifest.json` the seeder consumes. |

## Procedure

```
# 1. (repo) Refresh course trees for all 16 Observatory roots.
#    Standard crawler covers houses/-based hubs:
node _tools/eduscan/cli.js --tree --all           # regenerates houses/ trees + manifest
#    Then the two helpers for the roots the crawler cannot reach:
node _tools/observatory/recrawl-6-roots.js         # python-it, ethics-it, infosec, adv-linux (+ stubs for the 2 below)
node _tools/observatory/fstree-roots.js            # projects, bug-hunting, FEH (dynamic/launcher hubs -> filesystem enumeration)

# 2. (repo) Sanity dry-run: confirm 16/16 courses covered.
CATALOG_TREES_DIR="$(pwd)/_app/data/course-trees" python3 _tools/hexclass/orchestrator/seed_catalog.py --dry-run

# 3. Copy seeder + trees to the box.
scp _tools/hexclass/orchestrator/seed_catalog.py hexclass:/opt/hexclass/orchestrator/seed_catalog.py
scp -r _app/data/course-trees/*.json hexclass:/opt/hexclass/orchestrator/course-trees/

# 4. Dry-run on the box, then seed live.
ssh hexclass 'cd /opt/hexclass/orchestrator && CATALOG_TREES_DIR=/opt/hexclass/orchestrator/course-trees .venv/bin/python seed_catalog.py --dry-run'
ssh hexclass 'cd /opt/hexclass/orchestrator && CATALOG_TREES_DIR=/opt/hexclass/orchestrator/course-trees .venv/bin/python seed_catalog.py'

# 5. Verify (row count + real retrieval path).
ssh hexclass 'cd /opt/hexclass/orchestrator && .venv/bin/python -c "import sys;sys.path.insert(0,\".\");import rag;print([ (r.get(\"title\") if isinstance(r,dict) else str(r))[:60] for r in rag.retrieve(\"how do I find an XSS bug\")])"'
```

Live seed embeds via ollama (~45s for 889 chunks). Requires ollama up, Postgres + pgvector
reachable, and `POSTGRES_PASSWORD` in `/opt/hexclass/.env` (all standard on the box).

## Rollback

```sql
DELETE FROM hexworth_docs WHERE title LIKE 'Catalog: %';
```

Catalog rows are namespaced, so this removes only the catalog corpus and leaves KBA /
onboarding / dispatch rows intact. Re-running the seeder is also safe (it wipes then
re-inserts).

## Launcher/content splits (SECONDARY_ROOTS)

Some cards point at a launcher `index.html` that builds its lesson cards from `data-path-href`
or relative paths, so the real content lives at a sibling path the crawler never reaches.
For these, `fstree-roots.js` enumerates the content files into a tree, and `SECONDARY_ROOTS`
in `seed_catalog.py` maps those content paths to the card so the seeder attributes them:

- **FEH** (`obs-ethical-hacking`): launcher `houses/dark-arts/feh`, content at
  `houses/dark-arts/{presentations,labs,quizzes}/dark-arts-feh-*.html` (10 modules =
  30 files, those dirs are FEH-only). Yields 30 chunks.
- **CLH** (`obs-clh`): launcher `houses/script/courses/clh`, content at `houses/script/clh`.

When adding a course, check whether its card root actually holds the content; if not, add an
`fstree-roots.js` spec plus a `SECONDARY_ROOTS` entry.

Note on retrieval: catalog chunks are thin pointers (title + course + path), so for a
topic-specific query a richer `KBA:` page on the same topic will often outrank them in
top-K. That is expected and desirable. The catalog's job is corpus-level awareness (every
course/lab exists in Dr. Hex's memory), not to win every query.

Related: `_docs/operations/dr-hex-orchestrator.md`, `_tools/hexclass/orchestrator/rag_seed.py`,
`_docs/operations/observatory-activity-codebook.md`.
