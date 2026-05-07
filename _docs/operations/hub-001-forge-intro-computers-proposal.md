# HUB-001 — `forge/intro-computers` proposal (split into two work units)

## TL;DR — split the work

This hub is the only confirmed Class E (mostly dead refs) finding remaining. **23 of 26 cards reference content files that do not exist.** The git history confirms why: commit `63179a5b` (Apr 28) created the hub structurally with "8 presentations + 8 labs + 8 quizzes + 2 exams (26 content files pending)" — the hub was always a curriculum scaffold awaiting content build-out.

The right approach is two independent work units with different risk profiles:

| Work unit | Scope | Risk | Operator decision |
|---|---|---|---|
| **Unit 1 — Real-content patch (3 entries)** | Add catalog entries with `status: 'available'` for the 3 existing presentations | LOW. File-stem mismatches verified via hub hrefs. | Approve paste-and-deploy |
| **Unit 2 — Placeholder patch (23 entries)** | Add catalog entries with `status: 'coming-soon'` for the 23 unbuilt cards | MEDIUM. Requires curriculum titles, descriptions, and a UX decision (see below). | Curriculum review → operator picks UX path |

Lead with Unit 1. Unit 2 needs operator input to decide the UX path before any catalog edits.

## Why the split matters: the UX question

`coming-soon` makes the 23 cards visible-but-inert (the renderer at `HouseRenderer.js:1732` already handles this). That replaces the current "broken/empty/silent-skip" state with explicit "under construction" messaging.

**This is not unambiguously better.** Showing students 23 locked tiles for a course with 3 working modules signals different things to different audiences:

- Faculty/curriculum view: scaffolding for ongoing build (positive — work in progress)
- Student/enrollee view: 88% empty product (negative — abandoned or not-ready)

Operator must pick:
- **Path A** — Ship `coming-soon` placeholders. Honest, makes the gap visible. Best if the course is on an active build path.
- **Path B** — Suppress the 23 placeholder cards entirely (don't render unbuilt content). Best if the course is not on an active build path; revisit when content lands.
- **Path C** — Hide the hub entirely from house navigation until ≥80% built. Best if there's no near-term plan.

I won't make this call autonomously.

## Verified state (catalog-aware audit + git history)

```
houses/forge/intro-computers/index.html
  refs: 26  |  live: 0  broken: 0  fileNoCatalog: 1  dead: 25
  (auditor's "fileNoCatalog: 1" undercounts because it stem-matches inside
   the hub directory; verifying via hrefs gives 3 real + 23 unbuilt.)
```

Files on disk in `_app/houses/forge/intro-computers/`:
- `presentations/fb-w1-fundamentals.presentation.html` ✓
- `presentations/fb-w1-word-basics.presentation.html` ✓
- `presentations/fb-w2-word-advanced.presentation.html` ✓

Hub hrefs verified to match real files:
- `data-module="fb-w1-fundamentals-pres"` → `href="presentations/fb-w1-fundamentals.presentation.html"` ✓
- `data-module="fb-w1-word-pres"` → `href="presentations/fb-w1-word-basics.presentation.html"` ✓
- `data-module="fb-w2-word-adv-pres"` → `href="presentations/fb-w2-word-advanced.presentation.html"` ✓

**The auditor undercounts by treating data-module as a stem-match; the actual hub hrefs prove the data-module/file mapping is intentional (progress-tracking ID convention with `-pres` suffix).**

## Unit 1 — Real-content patch (3 entries, paste-ready)

Insert into `_app/components/ContentCatalog.js` near other `house: 'forge'` entries:

```js
        // CGS1000C First Boot — Intro to Computers (3 of 26 built; remaining as Unit 2)
        { house: 'forge', id: 'fb-w1-fundamentals-pres', title: 'Computer Fundamentals (Week 1)', description: 'Hardware, software, OS basics; introduction to computer systems', icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'intro-computers/presentations/fb-w1-fundamentals.presentation.html', category: 'cgs1000c' },
        { house: 'forge', id: 'fb-w1-word-pres', title: 'Microsoft Word: Basics (Week 1)', description: 'Document creation, formatting, basic Word skills', icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'intro-computers/presentations/fb-w1-word-basics.presentation.html', category: 'cgs1000c' },
        { house: 'forge', id: 'fb-w2-word-adv-pres', title: 'Microsoft Word: Advanced (Week 2)', description: 'Advanced Word features — styles, references, mail merge', icon: '/assets/images/icons/icon-desktop.webp', status: 'available', components: ['presentation'], href: 'intro-computers/presentations/fb-w2-word-advanced.presentation.html', category: 'cgs1000c' },
```

**Verification before merge:**
- `node _tools/eduscan/cli.js --files _app/components/ContentCatalog.js,_app/houses/forge/intro-computers/index.html`
- Expect: HUB-001 finding count drops from 26 to 23 broken refs (3 newly resolved)

**Effect on student-facing state:** 3 cards switch from broken-empty to live. UX for the other 23 cards unchanged until Unit 2 lands.

## Unit 2 — Placeholder patch (23 entries, awaits curriculum decision)

Operator must decide:
1. **UX path** — A (coming-soon visible) / B (suppress) / C (hide hub)
2. **Curriculum titles + descriptions** — I cannot invent these in good faith. They define what a future course module will be ABOUT.
3. **Build timeline** — does the course have a sprint to fill these in, or is it indefinitely paused?

The 23 unbuilt IDs:

```
fb-midterm-exam            fb-final-exam
fb-w1-fundamentals-lab     fb-w1-fundamentals-quiz
fb-w1-word-lab             fb-w1-word-quiz
fb-w2-excel-pres           fb-w2-excel-lab           fb-w2-excel-quiz
fb-w2-word-adv-lab         fb-w2-word-adv-quiz
fb-w3-access-pres          fb-w3-access-lab          fb-w3-access-quiz
fb-w3-excel-adv-pres       fb-w3-excel-adv-lab       fb-w3-excel-adv-quiz
fb-w4-integration-pres     fb-w4-integration-lab     fb-w4-integration-quiz
fb-w4-ppt-pres             fb-w4-ppt-lab             fb-w4-ppt-quiz
```

Pattern: 4-week MS Office curriculum (Word, Excel, Access, PowerPoint, Integration) plus midterm + final.

If operator picks Path A (coming-soon visible), I can pre-generate stub catalog entries for review:
```js
{ house: 'forge', id: '<id>', title: '<curriculum-defined>', description: '<curriculum-defined>', icon: '/assets/images/icons/icon-desktop.webp', status: 'coming-soon', components: ['<presentation|lab|quiz|exam>'], href: 'intro-computers/<dir>/<id>.<kind>.html', category: 'cgs1000c' }
```

But the title and description fields require operator-author input.

## What I will not do autonomously

- Pick the UX path (A/B/C) for Unit 2.
- Invent curriculum titles or descriptions for unbuilt content.
- Apply Unit 1 without operator approval (consistent with all HUB-001 work this cycle).

## Cross-references

- Audit tool: `_tools/audit-hub-deadrefs-v2.js`
- Renderer support for coming-soon: `_app/components/HouseRenderer.js:1732`
- Existing precedent for `coming-soon`: `clh-001` (script house), `forge-backup-or-bust`, `key-hashing`, `code-pod-crossing`
- Sister proposals: `hub-001-ccna-catalog-patch.md` (Class A — paste-and-deploy ready), `hub-001-pfi-catalog-patch.md` (4-option naming-drift analysis)
- Strategy umbrella: `sym-8-hub001-fix-proposal.md`
- Course origin commit: `63179a5b` "feat: CGS1000C First Boot — index page (partial, agent crashed)"
