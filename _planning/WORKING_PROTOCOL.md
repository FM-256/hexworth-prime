# Hexworth Prime - Working Protocol

**Established:** February 5, 2026
**Status:** ACTIVE - Mandatory for all development sessions
**Purpose:** Prevent regressions, ensure quality, maintain audit trail

---

## Core Principles

1. **Document as we move forward** — No undocumented changes
2. **Ask, don't assume** — When uncertain, stop and discuss
3. **Insights are mandatory** — Every sprint phase ends with documented learnings
4. **Future audits matter** — Write for the person debugging this in 6 months

---

## Documentation Requirements

### During Development

| Action | Documentation Required |
|--------|------------------------|
| Code change | Comment explaining WHY (not just what) |
| Bug fix | Note the root cause in code comment |
| New function | JSDoc-style header with purpose |
| Config change | Inline comment with rationale |
| File creation | Header comment with purpose and date |

### Example Code Documentation

```javascript
/**
 * Syncs local progress to Firestore for Handler Dashboard visibility.
 *
 * IMPORTANT: Only checks hexworth_progress.{house}['{moduleId}'] format.
 * Other formats (hexworth_quiz_stats, completedModules array) are NOT synced.
 *
 * @see HANDLER_DASHBOARD_AUDIT.md Issue 1 for format details
 * @modified Feb 5, 2026 - Added dual-write to ProgressManager as partial fix
 */
function syncProgressToFirestore() {
    // ...
}
```

---

## Decision Protocol

### When to STOP and CONSULT

- [ ] Unsure about the correct approach
- [ ] Multiple valid solutions exist
- [ ] Change affects sync/storage logic
- [ ] Change touches multiple files
- [ ] Fixing one thing might break another
- [ ] The "why" behind existing code is unclear
- [ ] Edge cases are not fully understood

### When to PROCEED

- [ ] Clear, isolated fix
- [ ] User has explicitly approved the approach
- [ ] Change is additive (doesn't modify existing behavior)
- [ ] Documentation exists explaining the current behavior

### Decision Template

Before making uncertain changes, present:

```
**Proposed Change:** [What I want to do]
**Rationale:** [Why I think this is the fix]
**Risk:** [What could go wrong]
**Alternative:** [Other approaches considered]
**Question:** [What I need clarified before proceeding]
```

---

## Sprint Phase Wrap-Up

At the end of each sprint phase, document:

### 1. Changes Made
- Files modified with line references
- What was changed and why

### 2. Insights (MANDATORY)
- What we learned
- Unexpected discoveries
- Patterns identified
- Technical debt noted

### 3. Testing Performed
- What was tested
- Test results
- Known limitations

### 4. Outstanding Items
- What's still broken
- What needs follow-up
- Dependencies on other fixes

### 5. Next Steps
- Clear action items
- Priority order
- Blockers identified

---

## Audit Trail Format

For tracking changes across sessions:

```markdown
## Session: [Date]

### Context
- Sprint: [Sprint ID]
- Focus: [What we're working on]

### Changes
1. `path/to/file.js` - [Description of change]
   - Lines affected: X-Y
   - Reason: [Why]

### Insights
- [Insight 1]
- [Insight 2]

### Blockers/Questions
- [Item needing discussion]

### Next Session
- [What to pick up next]
```

---

## File Locations

| Document | Purpose |
|----------|---------|
| `_planning/WORKING_PROTOCOL.md` | This file - how we work |
| `_planning/PROJECT_STATE.md` | Current progress, what's next |
| `_planning/SPRINT_BACKLOG.md` | All planned sprints |
| `_planning/HANDLER_DASHBOARD_AUDIT.md` | Current critical issue tracking |
| `_planning/IDEAS_BACKLOG.md` | Future features and improvements |

---

## Recovery

If a session goes off track:

1. Stop current work
2. Read this protocol
3. Read `PROJECT_STATE.md` for context
4. Discuss with user before resuming

---

## Protocol Violations

If you notice I'm:
- Making assumptions without asking
- Skipping documentation
- Not providing insights
- Moving too fast without discussion

**Say:** "Check the protocol" — I'll stop and realign.

---

*This protocol exists because we learned the hard way: undocumented changes and assumptions led to the Handler Dashboard sync issues documented in HANDLER_DASHBOARD_AUDIT.md.*
