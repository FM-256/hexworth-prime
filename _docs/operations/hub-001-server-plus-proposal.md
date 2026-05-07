# HUB-001 — server-plus alias proposal (operator decision required)

## The finding

`_app/houses/cloud/server-plus/index.html` references 21 module IDs not in `ContentCatalog.js`:

```
wsa-m01-pres   wsa-m02-pres   wsa-m03-pres   wsa-m04-pres   wsa-m05-pres
wsa-m06-pres   wsa-m07-pres   wsa-m08-pres   wsa-m09-pres   wsa-m10-pres
wsa-m10-sec    wsa-m11-pres   wsa-m12-pres   wsa-m13-pres   wsa-m14-pres
wsa-m15-pres   wsa-m16-pres   wsa-m17-pres   wsa-m18-pres   wsa-m19-pres
wsa-m20-pres
```

The pattern is `wsa-m{NN}-pres` (and one `wsa-m10-sec`). **All 21 follow a consistent naming.**

## The catalog has these as `wsa-module{NN}` (different naming):

```js
{ house: 'cloud', id: 'wsa-module01', title: 'WSA M01: Windows Server Fundamentals',
  components: ['presentation', 'lab', 'quiz'],
  href: 'modules/wsa/m01-fundamentals/cloud-presentation.module.html', category: 'wsa' }
```

20+ similar entries. The catalog covers ALL components (presentation + lab + quiz), while the hub is naming presentation-specific IDs.

## Three resolution options

### Option A — add presentation-only catalog aliases (21 new entries)
Add minimal entries with `components: ['presentation']` only, pointing to the same hrefs:

```js
{ house: 'cloud', id: 'wsa-m01-pres', title: 'WSA M01 Presentation',
  components: ['presentation'],
  href: 'modules/wsa/m01-fundamentals/cloud-presentation.module.html',
  category: 'wsa', aliasOf: 'wsa-module01' }
```

**Pros:** preserves authorial intent (hub really does want presentation-only); catalog now describes both naming styles.
**Cons:** 21 new catalog entries; future content additions need to maintain both styles; potential confusion about which to use.

### Option B — rename hub IDs to match catalog (`wsa-m01-pres` → `wsa-module01`)
Edit `index.html` data-module values to use the existing catalog IDs.

**Pros:** single source of truth; smaller catalog; matches MD-101 / Server+ / others' pattern.
**Cons:** hub now references full-module entries when only presentation is shown; ContentRegistry-derived progress tracking may double-count or under-count.
**Question:** does the hub's renderer respect a "show presentation only" flag, or does it pull all components from the catalog entry?

### Option C — add a single full-component alias entry per module (legacy-rename style)
Add `wsa-m01-pres` as a full alias of `wsa-module01` (components: ['presentation','lab','quiz']) — same shape as MD-101 aliases:

```js
{ house: 'cloud', id: 'wsa-m01-pres', title: 'WSA M01 (Server+ alias)',
  components: ['presentation', 'lab', 'quiz'],
  href: 'modules/wsa/m01-fundamentals/cloud-presentation.module.html',
  category: 'wsa', aliasOf: 'wsa-module01' }
```

**Pros:** matches existing alias pattern in catalog (`forge-md101-m*` style).
**Cons:** masks the presentation-only intent; if hub is supposed to be presentation-only and progress display reflects all components, students see lab/quiz as "available here" when the hub doesn't actually link them.

## What I need from operator

Two questions:
1. **Was the hub author intending presentation-only access**, or is the `-pres` suffix vestigial naming that should map to full modules?
2. **Does Server+ as a course track include the WSA labs and quizzes**, or is it presentation-only?

Answers determine the correct option:
- A if presentation-only intended
- B if full modules acceptable AND hub renderer is aware
- C if matching MD-101 pattern is preferred for consistency

## What I won't do autonomously

Add 21 catalog entries. Each is a real content-graph node that affects:
- ContentRegistry progress tracking
- Search/discovery results
- LearningPaths curriculum mapping
- Any future EduScan validators that check catalog→hub coverage

A wrong choice here multiplies across all of those surfaces.

## Recommended action

Operator picks A/B/C. If A or C, I can write the 21-entry diff in <2 minutes. If B, I edit the 21 data-module values in the hub HTML.

Either way: HIGH severity finding clears immediately upon merge.

## Cross-references

- Existing similar pattern: `forge-md101-m*` aliases (Option C-style)
- EduScan finding: `HUB-001` in `houses/cloud/server-plus/index.html`
- Triage queue: surfaced via `nexus quiz-sync` style flow but for HUB-001 (already in `_triage_queue/`)
- Catalog file: `_app/components/ContentCatalog.js`
- Hub file: `_app/houses/cloud/server-plus/index.html`
