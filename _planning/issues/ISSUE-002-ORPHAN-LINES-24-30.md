# ISSUE-002: Orphaned Content at Lines 24-30

**Created:** December 29, 2025
**Status:** Pending Assignment
**Severity:** Critical (Blocks ISSUE-001-RESCUE)
**Discovered During:** ISSUE-001-RESCUE investigation

---

## Problem

Lines 24-30 of content-registry.js contain orphaned properties that appear outside any valid entry object.

## Location

File: `_app/config/content-registry.js`
Lines: 24-30

## Current State

```javascript
20:    content: {
21:        // ─────────────────────────────────────────────────────────────
22:        // FORGE HOUSE - Hardware & Systems
23:        // ─────────────────────────────────────────────────────────────
24:            prerequisites: [],
25:            objectives: [
26:                'Identify the four main Windows editions',
27:                'Explain key feature differences (BitLocker, domain join)',
28:                'Recommend appropriate editions for scenarios'
29:            ]
30:        },
31:
32:        'forge-windows-editions': {
```

## Problem Analysis

- Lines 24-29: `prerequisites` and `objectives` appear with 12-space indentation (as if inside an entry), but no entry was opened
- Line 30: `},` closes something that was never opened
- This corrupts the structure of the entire `content:` object

## Impact

This corruption may be causing the parser error at line 9130 (ISSUE-001-RESCUE). The structural damage cascades through the file.

## Proposed Fix

Remove lines 24-30 (the orphaned fragment):

```javascript
// AFTER FIX:
20:    content: {
21:        // ─────────────────────────────────────────────────────────────
22:        // FORGE HOUSE - Hardware & Systems
23:        // ─────────────────────────────────────────────────────────────
24:
25:        'forge-windows-editions': {
```

## Dependency

ISSUE-001-RESCUE is blocked until this is resolved.

---

*Awaiting assignment*
