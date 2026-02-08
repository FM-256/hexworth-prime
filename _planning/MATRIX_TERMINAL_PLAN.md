# Matrix Terminal Enhancement Plan

**Created:** December 29, 2025
**Last Updated:** December 29, 2025
**Status:** ✅ COMPLETE (6/6 sprints complete)
**Sprint Series:** MX-1 through MX-6

---

## Implementation Progress

| Sprint | Status | Date |
|--------|--------|------|
| MX-1: Tab Infrastructure | ✅ Complete | Dec 29, 2025 |
| MX-2: Skill Tree Integration | ✅ Complete | Dec 29, 2025 |
| MX-3: Explore Basic | ✅ Complete | Dec 29, 2025 |
| MX-4: Certification Filter | ✅ Complete | Dec 29, 2025 |
| MX-5: Additional Filters | ✅ Complete | Dec 29, 2025 |
| MX-6: Cert Mapping | ✅ Complete | Dec 29, 2025 |

---

## Problem Statement

The Matrix (Operator) path is missing two of its three core sections:
1. **Dashboard/Hub** - `terminal.html` (EXISTS)
2. **Skill Tree** - FF7-inspired FileTreeExplorer (EXISTS in Factionless, NOT LINKED in Matrix)
3. **Explore All** - Certification paths + search (DOES NOT EXIST)

The Factionless path has full access to the skill tree, but the Matrix path (Operators) does not.

---

## Discovery Process

**How we found this:**
1. User reported missing sections after mobile responsive testing
2. Searched for "fantasy" (case-insensitive) across planning, archive, git
3. Found: `_planning/FACTIONLESS_SKILL_TREE.md` and git commit `594f13f`
4. Confirmed FileTreeExplorer.js exists at `_app/components/FileTreeExplorer.js`
5. Feature works in Factionless path but not wired to Matrix path

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Pattern | Option A: Tabs within terminal.html | Single page, content swaps based on tab |
| Tab Memory | Option 2A: Always start on PROGRAMS | Simple, predictable, no localStorage |
| Styling | Matrix green for all content | Consistent operator aesthetic |
| Search Behavior | Like house search + certification filter | Familiar UX pattern |

---

## Architecture

### Tab Structure

```
terminal.html
┌──────────────────────────────────────────────────┐
│  HEXWORTH PRIME v0.1.0 // TERMINAL               │
├──────────────────────────────────────────────────┤
│   [PROGRAMS]    [SKILL TREE]    [EXPLORE ALL]    │
├──────────────────────────────────────────────────┤
│                                                  │
│   (content area - shows active tab content)      │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Tab Definitions

| Tab | Content | Source |
|-----|---------|--------|
| PROGRAMS | 9 program cards (house access) | Already exists in terminal.html |
| SKILL TREE | FileTreeExplorer component | `_app/components/FileTreeExplorer.js` |
| EXPLORE ALL | Cert paths + search + filters | New component to build |

---

## EXPLORE ALL Specification

### Search Box
- Keyword search on module names, descriptions
- Matches existing house search behavior

### Filter: By Certification
- Dropdown enumerates all available certification paths
- Selecting a cert shows all content mapped to that certification
- **Note:** Content-to-cert mapping is incomplete (tracked in MX-6)

### Filter: By House
- Show content by originating house
- Even though Matrix users reject houses, content still comes from them

### Filter: By Type
- Presentation
- Lab
- Quiz
- Applet

### Filter: By Difficulty
- Beginner
- Intermediate
- Advanced
- (Requires difficulty data in content registry)

---

## Files to Modify

| File | Changes |
|------|---------|
| `_app/terminal.html` | Add tab navigation, content containers, tab switching JS |
| `_app/components/FileTreeExplorer.js` | Add Matrix theme support (green variant) |
| `_app/components/ExploreAll.js` | NEW: Search + filter component |
| `_app/styles/matrix-theme.css` | NEW or extend: Matrix green styling |

---

## Dependencies

```
MX-1 (Tab Infrastructure)
  │
  ├── MX-2 (Skill Tree Integration)
  │
  └── MX-3 (Explore Basic)
        │
        ├── MX-4 (Certification Filter)
        │
        └── MX-5 (Additional Filters)

MX-6 (Cert Mapping) - Independent backlog item
```

---

## Sprint Breakdown

### Sprint MX-1: Tab Infrastructure
**Status:** Planned
**Files:** terminal.html

| Task | Description |
|------|-------------|
| Add tab navigation UI | Three tabs: PROGRAMS, SKILL TREE, EXPLORE ALL |
| Create content containers | Div for each tab's content |
| Implement tab switching JS | Click handler, show/hide logic |
| Wrap existing PROGRAMS content | Move current grid into PROGRAMS container |
| Matrix styling | Green terminal aesthetic for tabs |
| Default to PROGRAMS | Always start on first tab |

**Acceptance Criteria:**
- [ ] Three tabs visible in terminal.html
- [ ] Clicking tabs switches visible content
- [ ] PROGRAMS tab shows existing 9 program cards
- [ ] Other tabs show placeholder content
- [ ] Matrix green styling applied

---

### Sprint MX-2: Skill Tree Integration
**Status:** Planned
**Depends on:** MX-1
**Files:** terminal.html, FileTreeExplorer.js

| Task | Description |
|------|-------------|
| Load FileTreeExplorer | Script tag and initialization |
| Create skill tree container | Target div for component |
| Matrix theme for FileTreeExplorer | Green color scheme variant |
| Verify SkillTree data loads | Check data source compatibility |

**Acceptance Criteria:**
- [ ] SKILL TREE tab shows FileTreeExplorer
- [ ] Component styled in Matrix green
- [ ] Three perspectives work (Fundamentals, Tools, Skills)
- [ ] Folder expand/collapse works

---

### Sprint MX-3: Explore Basic
**Status:** Planned
**Depends on:** MX-1
**Files:** terminal.html, ExploreAll.js (NEW)

| Task | Description |
|------|-------------|
| Create ExploreAll component | New JS component |
| Add search box | Text input with search icon |
| Implement keyword search | Search module names, descriptions |
| Display results | List/grid of matching content |
| Matrix styling | Green terminal aesthetic |

**Acceptance Criteria:**
- [ ] EXPLORE ALL tab shows search interface
- [ ] Typing in search box filters content
- [ ] Results display with module name, description, type
- [ ] Clicking result navigates to content

---

### Sprint MX-4: Certification Filter
**Status:** Planned
**Depends on:** MX-3
**Files:** ExploreAll.js

| Task | Description |
|------|-------------|
| Add certification dropdown | "By Certification" filter |
| Enumerate cert paths | Pull from content registry |
| Filter by certification | Show content mapped to selected cert |
| Handle unmapped content | Show "Unmapped" or exclude |

**Acceptance Criteria:**
- [ ] Dropdown shows all available certifications
- [ ] Selecting cert filters results
- [ ] Can combine with keyword search
- [ ] Clear filter returns all results

**Known Limitation:** Content-to-cert mapping is incomplete. Tracked in MX-6.

---

### Sprint MX-5: Additional Filters
**Status:** Planned
**Depends on:** MX-4
**Files:** ExploreAll.js

| Task | Description |
|------|-------------|
| Add "By House" filter | Filter by originating house |
| Add "By Type" filter | Presentation, Lab, Quiz, Applet |
| Add "By Difficulty" filter | Beginner, Intermediate, Advanced |
| Multi-filter support | Combine filters with AND logic |

**Acceptance Criteria:**
- [ ] All four filter types work
- [ ] Filters can be combined
- [ ] Clear all filters option
- [ ] Filter state shown visually

---

### Sprint MX-6: Certification Mapping Completion
**Status:** Backlog
**Priority:** Medium
**Depends on:** MX-4 (to see what's missing)

| Task | Description |
|------|-------------|
| Audit current mappings | List all content, check cert assignments |
| Identify gaps | Content without cert mapping |
| Map remaining content | Assign certifications |
| Verify coverage | All certs have content, all content has cert |

**Acceptance Criteria:**
- [ ] All content mapped to at least one certification
- [ ] All certifications have at least one content item
- [ ] Mapping documented in content registry

---

## Context Recovery Instructions

If this session ends and a new Claude instance continues:

1. **Read this file first** - contains all decisions and specifications
2. **Check PROJECT_STATE.md** - for current sprint status
3. **Check SPRINT_BACKLOG.md** - for MX-series sprint list
4. **Review terminal.html** - current state of implementation
5. **Review FileTreeExplorer.js** - existing skill tree component

**Key files:**
- `_app/terminal.html` - Main Matrix hub
- `_app/components/FileTreeExplorer.js` - Skill tree component (542 lines)
- `_app/components/SkillTree.js` - Data for skill tree (if exists)
- `_planning/FACTIONLESS_SKILL_TREE.md` - Original design doc

**Do NOT:**
- Start implementing without user approval
- Modify files without explicit instruction
- Assume decisions - ask if unclear

---

## Related Documents

- `_planning/FACTIONLESS_SKILL_TREE.md` - Original FF7-inspired design
- `_planning/PROJECT_STATE.md` - Current project status
- `_planning/SPRINT_BACKLOG.md` - All sprints
- Git commit `594f13f` - Original skill tree implementation

---

*Last Updated: December 29, 2025*
