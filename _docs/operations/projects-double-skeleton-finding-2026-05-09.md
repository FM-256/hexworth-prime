# Projects Pages — Double HTML-Skeleton Bug (2026-05-09)

**Source detection:** Whole-file div + section + head + body counts, marathon tick (this session).
**Status:** Pattern identified across 10 `_app/projects/*.html` files. NOT fixed — operator surgery required.
**Severity:** All 10 pages currently render structurally broken HTML (browser auto-recovery in play). Layout is likely tolerated; CSS scope and JS query-selector behavior may be subtly affected.

## The pattern

All 10 affected files have IDENTICAL line numbers for HTML skeleton boundaries:

```
L3:  <head>
L630: </head>          ← legitimate close
L631: <body>           ← legitimate open
L632-L656: stray cf-* content + STRAY skeleton
L654: </head>          ← stray (head already closed at L630)
L655: <body>           ← stray (body already opened at L631)
L657+: real cf-page content
L833+: </body>
```

Result: **2 `</head>` + 2 `<body>` opens** in every file. Each file also has 3 unclosed `<div>` (`cf-content`, `cf-cover`, `cf-meta-row`) that the browser auto-closes at the next surprise.

## Affected files (all delta=-3)

| File | Notes |
|---|---|
| `_app/projects/cloud-ec2-first-server.html` | Cloud track |
| `_app/projects/cloud-oracle-free-vm.html` | Cloud track |
| `_app/projects/forge-home-lab.html` | Forge track |
| `_app/projects/forge-virtualbox-first-vm.html` | Forge track |
| `_app/projects/forge-vmware-first-vm.html` | Forge track |
| `_app/projects/shield-firewall-iptables.html` | Shield track |
| `_app/projects/starter-calculator.html` | Starter track |
| `_app/projects/starter-first-repo.html` | Starter track |
| `_app/projects/starter-github-profile.html` | Starter track |
| `_app/projects/starter-portfolio-site.html` | Starter track |

Two more files in the same directory have **delta=-8** (cloud-s3-static-site.html, darkarts-kali-setup.html) and may share a similar but more severe pattern. They were excluded from the count-of-10 only because their delta is different.

## Root cause hypothesis

A page-generation template appears to have been pasted twice — once at L631-L656 (truncated header preamble for the Case File design) and once at L657+ (the actual full case file content). The two `</head>` and `<body>` boundaries inside the first half are stray skeleton tokens that should have been deleted when the second case-file content was inserted.

## Why I did NOT apply this fix

Per CLAUDE.md "Precision Over Speed" rule and the html-div-mismatch finding doc, structural HTML changes need visual verification before deploy. This is content surgery (delete L631-L656 OR repair the truncated section), not a mechanical token swap.

The two viable surgeries differ:

- **Option A — delete the stray skeleton.** Remove lines 654-655 and close the unclosed `cf-content`/`cf-cover`/`cf-meta-row` at L656. Preserves the L631-L653 prelude content (nav + header + cf-cover with case-file metadata).
- **Option B — delete the entire first half.** Remove L631-L656 entirely. The L657+ content becomes the sole body. May lose unique prelude content (need to compare visually to verify L657+ has equivalent header).

Operator must visually compare a rendered page to determine whether L631-L653 content is duplicated by L657+ (Option B safe) or unique (Option A required).

## Verification methodology after apply

1. Re-run `node` div-balance scan on the file. Expect delta=0.
2. Re-run `node` head/body grep. Expect 1 `</head>`, 1 `<body>`.
3. Visual smoke: open each page in browser. Confirm no layout regression. The Case File design has many CSS rules; broken HTML scope can subtly disrupt them.
4. EduScan HTML-011/HTML-012 should drop to 0 for these files.

## Why this matters

10 production-deployed project pages have malformed HTML. While browsers auto-recover, the auto-recovery behavior is implementation-defined. CSS rules scoped to `body` may apply twice, `document.body` JS references may behave unexpectedly, and assistive technologies (screen readers) may report duplicate landmarks.

These pages are linked from the projects landing page and student-facing.

## Out of scope

- The 6 cyberops applets (separate doc: `cyberops-section-tag-fix-2026-05-09.md`)
- The 2 -8 delta files (cloud-s3-static-site, darkarts-kali-setup) — deserve their own investigation
- The 2 -9/-12 delta dark-arts presentations
- The 7 single-line -1 delta files

## Detection script (reusable)

```bash
for f in _app/projects/*.html; do
  hc=$(grep -c "</head>" "$f")
  bc=$(grep -c "<body" "$f")
  [ "$hc" != "1" ] || [ "$bc" != "1" ] && echo "$f  head-close: $hc  body-open: $bc"
done
```

## Architecture refs

- Source detection: `_docs/operations/html-div-mismatch-finding-2026-05-09.md`
- Companion finding: `_docs/operations/cyberops-section-tag-fix-2026-05-09.md`
- EduScan HTML-011/HTML-012 in `_tools/eduscan/validators/syntax/html.js` (already detects this; severity=medium; below TRIAGE_SEVERITY_GATE per design)
