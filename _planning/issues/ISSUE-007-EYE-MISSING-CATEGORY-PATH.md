# ISSUE-007: Eye House Missing Category Path Property

**Created:** December 29, 2025
**Status:** CLOSED - Already Fixed
**Closed:** December 29, 2025
**Severity:** High (Feature broken)
**Source:** Structural Audit

---

## Problem

Eye house CATEGORIES array objects are missing the `path` property. The code uses `category.path` for filtering, but the property doesn't exist. Result: category filtering always returns 0 results.

## Location

File: `_app/houses/eye/index.html`
Section: CATEGORIES array

## Current State

```javascript
const CATEGORIES = [
    { id: 'log-analysis', name: 'Log Analysis', icon: '📊' },
    // missing path property
];
```

## Required Fix

```javascript
const CATEGORIES = [
    { id: 'log-analysis', name: 'Log Analysis', icon: '📊', path: 'presentations/' },
    // add path to each category
];
```

---

*Awaiting assignment*
