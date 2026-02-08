# ISSUE-008: URL Mismatches Between SAMPLE_MODULES and ContentRegistry

**Created:** December 29, 2025
**Status:** CLOSED - Complete (8 real fixes, 23 false positives)
**Closed:** December 29, 2025
**Severity:** Medium (Content may not load correctly)
**Source:** Content Audit

---

## Problem

31 content items have different URLs in SAMPLE_MODULES vs ContentRegistry. This can cause navigation issues.

## Affected Houses

| House | Count |
|-------|-------|
| shield | 9 |
| web | 11 |
| cloud | 1 |
| forge | 7 |
| script | 1 |
| key | 1 |
| eye | 1 |
| **Total** | **31** |

## Example

```
ID: shield-cia-triad
SAMPLE_MODULES: presentations/cia-triad.html
ContentRegistry: houses/shield/applets/fundamentals/five_pillars/FivePillars.html
```

## Fix Required

For each mismatch, determine which URL is correct and update the other location.

## Full List

See `Test imports/audit-results-2025-12-30.json` for complete list with all 31 items.

---

*Awaiting assignment*
