# ISSUE-012: Add Divergent House to Houses Section

**Created:** December 29, 2025
**Status:** CLOSED - Complete
**Closed:** December 29, 2025
**Severity:** Medium (House definition missing)
**Source:** ISSUE-005 follow-up

---

## Problem

The `divergent` house definition was commented out during ISSUE-005 fix. It needs to be properly added to the `houses:` section of ContentRegistry.

## Location

Currently commented at end of file:
```javascript
// ORPHAN - commented out during ISSUE-005 fix (Dec 29, 2025)
// 'divergent': { ... }
```

Should be added to `houses:` section (around line 9497, after dark-arts).

## Divergent Definition

```javascript
'divergent': {
    id: 'divergent',
    name: 'The Factionless',
    shortName: 'Factionless',
    icon: '⚡',
    domain: 'All Domains',
    color: '#ff00ff',
    description: 'You cannot be contained. All houses are open to you.',
    hidden: true  // Don't show in house lists
}
```

---

*Awaiting assignment*
