# ISSUE-003: Missing Comma at Line 9484

**Created:** December 29, 2025
**Status:** Pending Assignment
**Severity:** Critical (Syntax error)
**Discovered During:** ISSUE-002 verification

---

## Problem

Missing comma before `'dark-arts':` entry in houses section.

## Location

File: `_app/config/content-registry.js`
Line: 9484

## Current State

```javascript
9482:             ]
9483:         }
9484:         'dark-arts': {
```

## Proposed Fix

Add comma after closing brace on line 9483:

```javascript
9482:             ]
9483:         },
9484:         'dark-arts': {
```

---

*Awaiting assignment*
