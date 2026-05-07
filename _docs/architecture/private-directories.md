# Private/Sensitive Files Convention

**Last Updated:** 2026-05-07
**Status:** Active platform convention (codifying tribal knowledge)

---

## Overview

Hexworth Prime treats four top-level directories as **gitignored local-only working surfaces**, grouped under the `# Private/Sensitive Files` header in `.gitignore`:

| Dir | Files | Purpose | Risk if leaked |
|-----|-------|---------|----------------|
| [`_hex/`](#_hex--operator-vault) | 6 | Operator vault — CTF flags, secrets, handler dashboards | **HIGH** — leaks break CTF integrity, expose credentials |
| [`_planning/`](#_planning--active-design-workspace) | ~2900 | Active planning workspace — course mappings, syllabi, build guides, work-in-progress design docs | **MEDIUM** — exposes in-progress curricular work, client-facing roadmaps |
| [`_archive/`](#_archive--deprecated-content-retained-for-retrieval) | ~5800 | Deprecated content kept for retrieval (Hype/EMATE applets, lower-version labs/quizzes, replaced presentations) | **LOW** — already deprecated, not deployed |
| [`_spellbook/`](#_spellbook--change-manifests--ai-tooling-reference) | 150 | Change manifests, AI/dev tooling reference (MANIFEST_OF_CHANGES_*.md) | **LOW** |

These four dirs share the same gitignore mechanism but have **different semantics**. They are not interchangeable. Treat each according to its row above.

### Out of scope

`_tools/` is also gitignored but lives under a different convention header (`# Internal tooling`). It has its own discipline: gitignored by default, but specific files are `git add -f`'d into version control (EduScan, Nexus, Sprint Master scanners). For `_tools/` discipline see [`_tools/INTRO.md`](../../_tools/INTRO.md). It is **not** part of this document's scope.

---

## Why gitignored

Each directory is gitignored for its own reason:

- **`_hex/`** — Security. Leaking CTF flags or operator-only data into git history is hard to undo. The threat model includes both external attackers with repo access and student contributors with read access. Gitignored at the directory level so accidental adds (`git add .`) cannot leak the vault.
- **`_planning/`** — Workspace hygiene. ~2900 working files (drafts, mappings, design docs that get superseded) would dominate commit signal-to-noise if tracked. Active design work moves to `_docs/` once stable.
- **`_archive/`** — Repo size + Hype tooling decoupling. The big restructure of 2026-02-18 (commit `7c524596`) moved 5613 EMATE/Hype 4.0 files (181 MB) to `_archive/emates/` after replacing them with native HTML/JS. Tracking that 181 MB would inflate every clone and re-introduce Hype build dependencies into CI even though nothing on master uses them.
- **`_spellbook/`** — Local-only dev reference. Change-log manifests and AI tooling notes are useful for the writer but not authoritative. Promoted content lives in `_docs/`.

---

## `_hex/` — Operator Vault

**Provenance:** Commit `16ff650e` — "Gitignore _hex/ directory (operator vault — flags, secrets, solutions)"

**Top-level inventory** (this machine, may vary):
- `CTF_SOLUTIONS.md` — flag values for CTF Arena boxes
- `FEATURES.md` — operator-only feature notes
- `HANDLER_DASHBOARD.md` — handler workflow reference
- `README.md` — local-only orientation
- `SECRETS.md` — credentials / API keys / operator secrets
- `STATS_PIPELINE.md` — operator analytics reference

**Retrieval:** Filesystem only. There is no "preservation branch" for `_hex/`. Each operator's machine holds their own working copy. If you lose your local `_hex/`, recover from your own backups or ask the platform owner.

**Security implications:**
- Do not document specific flag values, secret values, or credential strings outside `_hex/`.
- This file (`private-directories.md`) names the directory and its file inventory because that information is already implied by the gitignore comment. It does **not** enumerate values.
- If `_hex/` ever needs to be migrated to a true secrets manager (1Password, Vault, GCP Secret Manager), that is a separate architectural decision and should not be done in-place inside the repo.

---

## `_planning/` — Active Design Workspace

**Top-level inventory** (sample, ~2900 files total):
- `30_DAY_SYLLABUS.md`
- `A+ Core 1 Mapping.md`
- `A+ Core 2 Mapping.md`
- `ACHIEVEMENT_GAPS.md`
- `ADD_IRONCLAD_PLAN.md`
- `ADMIN_SCRIPTS.md`
- `ADV_LINUX_BUILD_GUIDE.md`
- `ADV_LINUX_COURSE_DESIGN.md`
- … and ~2880 more

**Retrieval:** Filesystem only. Some `_planning/` content has been promoted to `_docs/` over time (notably architecture docs and operations runbooks). If you need an old planning doc that has been superseded by a `_docs/` version, the `_docs/` version is canonical.

**Note on the gitignore history:** Commit `dc074b1a` ("chore: Narrow _planning/ gitignore to only _planning/.private/") attempted to narrow this gitignore at one point. The current `.gitignore` reverts to ignoring all of `_planning/`. If you want to track a specific subdirectory of `_planning/`, use `git add -f` on individual files or revisit the gitignore decision via a tracked architecture doc.

---

## `_archive/` — Deprecated Content Retained for Retrieval

**Top-level inventory** (this machine, ~5760 files):
- `emates/` — 5719 files: Hype 4.0 EMATE applets across all houses (shield, web, code, forge, key, eye, script, cloud) — moved here by commit `7c524596` (2026-02-18) "Archive all EMATE/Hype 4.0 external applets — 81 bundles, 59 HTML loaders removed"
- `python-for-it-old-labs/` — pre-restructure PFI labs
- `gpm-labs-standalone/` — older GPM labs
- `arena-improvised/` — early CTF arena prototypes (c6-poisoned-update, c7-wire-transfer, c8-shadow-admin)
- `wip-2026-02-09/` — 2026-02-09 work-in-progress snapshot
- Standalone HTML files: `connect.html`, `forge-admin-tools.presentation.html`, `forge-control-panel.presentation.html`, `forge-lab-macos-linux.lab.html`, `forge-macos-linux-basics.presentation.html`, `forge-system-tools.presentation.html`, `forge-windows-editions.presentation.html`, `forge-windows-settings.presentation.html`, `gate-8-barricade.html`, `index.html`, `pfi-w3-functions-toolkit.presentation.html`, `root-forge-core2-roleplay.lab.html`, `root-forge-lab-macos-linux.lab.html`

**Why these are not used on master:** Two restructure events:
1. **2026-02-07 (commit `0df44e86`)** — "Rename 992 files to standard naming convention." Renames at scale; git rename detection failed for some files, so they appear as deletions in tree-diff but content lives elsewhere on master under standardized names.
2. **2026-02-18 (commit `7c524596`)** — Full deprecation of EMATE/Hype 4.0 toolchain. Native HTML/CSS/JS replacements were built; old applets moved to `_archive/emates/` so they remain retrievable but no longer ship.

**Retrieval — filesystem first:**
```
ls _archive/emates/houses/<house>/applets/
# directly browse / open / copy back to live tree if reviving
```

**Retrieval — git fallback:**
The two preservation branches `pre-restructure-backup-branch` and `feature/clh-terminal` hold the **same content** as `_archive/emates/` plus the rest of the pre-restructure tree state. If your local `_archive/` is missing or corrupted:
```
git checkout pre-restructure-backup-branch -- _app/houses/<house>/applets/<applet>/
```

**Preservation status — tags are in place.** As of 2026-05-07, both branch tips are tagged with annotated tags so the git-history copy is prune-safe even if the branches themselves are eventually deleted:

- `legacy/pre-restructure-2026-02-07` → tip `f6221313` of `pre-restructure-backup-branch`
- `legacy/clh-terminal-2026-01-18` → tip `69205b26` of `origin/feature/clh-terminal`

Tags pushed to origin. **The filesystem `_archive/` is the canonical retrieval source.** The tags + branches are belt-and-suspenders backup.

**Tag-based retrieval recipe:**
```
git checkout legacy/pre-restructure-2026-02-07 -- <path/to/file>
git checkout legacy/clh-terminal-2026-01-18 -- <path/to/file>
```

**Validator/tooling integration:** The following all explicitly skip `_archive/` paths:
- `_tools/eduscan/scanner.js:17` — main scanner
- `_tools/eduscan/validators/runtime/tree-mapper.js:84`
- `_tools/eduscan/validators/syntax/content-catalog.js:342`
- `_tools/nexus/adapters/deploy-check.js` — lines 187, 299, 551, 678
- `firebase.json` hosting `ignore` glob `**/_archive/**` (verified matches all `_app/_archive/` and top-level `_archive/` paths)

The smoke gate (`_tools/eduscan/smoke/run.js`) does not walk `_archive/` because it scans only a hardcoded 15-target list of high-blast-radius pages.

**Adding new content to `_archive/`:** Move to the appropriate subfolder (`emates/`, or a new dated subfolder for fresh deprecations). Add a one-line entry to this doc. Do not commit the moved files (they are gitignored).

---

## `_spellbook/` — Change Manifests + AI Tooling Reference

**Top-level inventory:**
- `AI_README.md`
- `CONSOLE_INVENTORY.md`
- `INDEX.md`
- `MANIFEST_OF_CHANGES_2026-01-07_to_2026-02-11.md`
- `MANIFEST_OF_CHANGES_2026-02-11_to_2026-02-14.md`
- `MANIFEST_OF_CHANGES_2026-02-15_to_2026-02-15.md`
- `README.md`
- `SPELLBOOK.md`
- … 142 more

**Retrieval:** Filesystem only. If a manifest has been promoted to `_docs/`, the `_docs/` version is canonical.

---

## Discoverability

To make this doc findable from a fresh clone:
- `_tools/INTRO.md` includes a one-line pointer in its orientation section (single source of truth for "where to look first").
- `CLAUDE.md` is **gitignored** and so cannot be the discovery surface for cloned repos. (Hence: this doc, not CLAUDE.md, is canonical.)

---

## Cross-references

- Branch merger investigation that surfaced this convention: [`_docs/operations/branch-merger-2026-05-07.md`](../operations/branch-merger-2026-05-07.md)
- EMATE/Hype 4.0 deprecation rationale: commit `7c524596` (2026-02-18)
- Original `_hex/` gitignore decision: commit `16ff650e`
- `_planning/` gitignore narrowing attempt: commit `dc074b1a`
- "We Do Not Destroy" memory rule (related principle): see operator memory index
