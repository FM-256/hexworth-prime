# Session Handoff — 2026-06-27/28

Summary of work this session + what remains for the next marathon. All work is committed + pushed to
`origin/master` and deployed to production (16 commits this session).

## ✅ DONE + LIVE

### Security+ hub (MARA-SECPLUS-HUB) — complete
- **Side quick-links rail** + full-width two-column layout (`_app/houses/shield/security-plus/index.html`).
- **SY0-701 Acronym Reference** (321 entries, `reference/sy0-701-acronyms.reference.html`), searchable.
- **Practice gap CLOSED 8/8** — 8 new PBQ labs (Wave 1 malware/social-network/threat-actor; Wave 2
  change-mgmt/governance/AAA; Wave 3 design-principles/PKI-diagnosis). All Chris-passed, drive-QC'd, in manifest + ContentCatalog.
- **Nancy refinements** — 3 domain-wide quizzes → "Domain Challenge" block; de-listed a mislabeled Network+ deck
  masquerading as a 2nd "Security Fundamentals".
- Doc: `_docs/operations/security-plus-hub-overhaul-2026-06-27.md`.

### Applet renderer fixes (4 shared renderers, 25 pages)
- Literal `‹`/`▶` escapes → glyphs; icon webp PATHS → `<img>` (were rendering as text);
  full-width all-visible layout redesign (no tabs, multi-column). Renderers: SecurityFundamentals/NetworkSecurity/
  AccessControl/RiskManagement.

### MARA-SEARCH-1 — DONE (sprint marked done)
- Real scan: **595** content pages not in ContentCatalog (vs the lazy 14). Auto-generated entries (hrefs via
  relpath, all resolve), operator-approved all 595, verified live on hexworth.com. Catalog 2719→3314.
- Doc: `_docs/operations/searchability-tree-marathon-2026-06-27.md`.

### Critical backlog — 4 closed
ES-1122 (false positive), ES-1130/1131 (resolved by the A+ command-line Core1→Core2 move), ES-1096 (archived
progress-key bleed — isolated 12 `_archive/` keys with `-archive` suffix).

## 🔄 IN PROGRESS — QC-57 (client-graded → server-graded) — the main continuation thread

**Status: Exams 13/13 DONE+live · Quizzes 8/94 DONE (cloud-essentials) · ~86 quizzes + 8 Family-4 + 7 reviews remain.**

The pattern, the proven converter, the exact remaining tracks, the per-wave recipe, and the gotchas are fully
documented in **`_docs/operations/qc-57-client-grading-inventory.md` → "CONTINUATION — NEXT MARATHON"**. Start there.

Key facts: answer keys moved to `quiz_keys/{moduleId}` (Firestore) + `gradeQuiz` per-question validation, instant
feedback PRESERVED (operator's call). Firestore seeding is Rule-#10 gated → **per-wave operator authorization,
master only**. Always reconcile each page's `QUIZ_ID` == seeded key (QC-54 0/N trap). Read each track's structure
before converting (per-track UI bits: TOPICS / live scoreLabel / submit text vary).

## Other open (not started this session)
- Remaining 9 critical sprint items: Neon Server (NE-1/2/3), HEX-Board (HB-10/11/13/16), QC-60 (500 hub-catalog
  mismatches). QC-57 is the one in progress.
