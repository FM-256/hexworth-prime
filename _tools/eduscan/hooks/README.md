# EduScan Git Hooks

Pre-commit hook for Stage 1 of the safety net (per `_docs/operations/safety-net-architecture.md`).

## Install

```bash
cp _tools/eduscan/hooks/pre-commit.sample .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

`.git/hooks/` is per-clone and not version-controlled, so each developer installs explicitly. The sample lives in `_tools/eduscan/hooks/` so it travels with the repo.

## Uninstall

```bash
rm .git/hooks/pre-commit
```

## What it does

On every `git commit`:
1. Collects staged files via `git diff --cached --name-only -z` (null-delimited)
2. Filters to `.html`, `.js`, `.css`, `.json` extensions
3. Calls `node _tools/eduscan/staged.js <files>` against the staged list
4. **Blocks the commit** if any critical/high severity issue is found
5. **Allows the commit** with stderr warnings if only medium/low/info issues are found
6. Skips silently if no scannable files are staged

Latency target: under 2 seconds for typical commits. Measured: 30-340ms for 1-3 files.

## Override (emergency only)

```bash
PRECOMMIT_BYPASS=1 PRECOMMIT_BYPASS_REASON="hotfix — fixing X breaks Y baseline" git commit ...
```

The reason is logged to stderr. Do not bypass without one — that's the audit trail.

## What this hook does NOT cover

Per the staged architecture (`safety-net-architecture.md`):

- **PROG-003** (cross-file shared progress keys) — runs at Stage 2 (pre-merge), not pre-commit
- **HUB-001** / **XREF-001** / **content-catalog** — same, Stage 2
- **CSP / palette / tags** — Stage 2
- **Heuristics renderer-link / overlay sweeps** (HEUR-006, HEUR-008) — Stage 2 (cross-file)
- **Sandbox / xp-audit global sweeps** — Stage 2
- **Smoke gate / Nexus** — Stage 3 (`./deploy.sh`)
- **Runtime monitor** — Stage 4 (Cloud Run)

The pre-commit hook is the FAST first line. Slower, more comprehensive checks layer on top.

## Validators run at this stage

See the per-validator stage-assignment matrix in `safety-net-architecture.md`. Eighteen per-file validators are wired:

```
emoji, naming, paths, heuristics (per-file rules only),
html, js, progress-keys (PROG-001/002 only), dependency-check,
engine, flex-overflow, navigation, semantic, ux, linux-terminal,
sandbox (.validate() only), turtle, xp-audit (.validate() only),
content-blob
```

## Troubleshooting

**Hook doesn't fire** — Check `ls -la .git/hooks/pre-commit` exists and is executable.

**Hook always passes** — Confirm staged files include `.html/.js/.css/.json`. Other extensions skip silently.

**False positive on a legitimate file** — Don't bypass. File a ticket against the validator. The hook's value is its accuracy.

**Hook is slow (>5 sec)** — You probably staged a massive file (e.g., a generated content blob). Consider whether that file should be staged at all.

**Renames** — `git diff --cached` returns post-rename paths. The runner reads from disk, which has the new content. Renames work correctly.
