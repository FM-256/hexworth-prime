# Browser-Based Admin Console / Troubleshooting Tool

**Created:** December 27, 2025
**Status:** Planning / Design Phase
**Priority:** TBD

---

## Purpose

Design a browser-based admin console that runs directly within Hexworth, providing live content auditing and troubleshooting capabilities without requiring terminal access.

---

## The Core Problem

### What is an "Orphaned File"?

A file that:
- Exists on disk in a house folder (e.g., `shield/applets/operations/some-tool.html`)
- Is **NOT** listed in the house's `SAMPLE_MODULES` array in `index.html`
- Therefore **cannot be accessed** by users through the UI
- Content exists but is invisible = **catastrophic failure**

### Why This Matters

- Educational content is created but students can't reach it
- No easy way to discover these gaps without manual auditing
- Current CLI tool works but requires terminal access and context-switching

---

## Current Solution: CLI Audit Tool

**Location:** `_app/scripts/generate-audit-report.js`

### What It Does
- Scans all 8 houses
- Compares files on disk vs SAMPLE_MODULES entries
- Checks for missing properties (category, status, href)
- Generates HTML report with dashboard

### Pros
| Pro | Details |
|-----|---------|
| Already built | 770 lines, functional |
| Full file system access | Can scan directories directly |
| Comprehensive | Catches multiple issue types |
| Nice HTML output | Visual, easy to scan |

### Cons
| Con | Details |
|-----|---------|
| Requires terminal | Must leave the app to run it |
| Not live | Generates static report, needs re-run |
| Regex parsing | Parses JS with regex - fragile if format changes |
| No write capability | Can only report, not fix |

---

## Proposed Solution: Browser-Based Console

### Core Concept
An HTML page accessible from the Hexworth dashboard (footer link) that provides live content auditing.

### Key Benefits
- **Live** - See issues in real-time as you browse
- **In-app** - No terminal, no context-switching
- **Accessible** - Anyone with access can use it, not just developers
- **Interactive** - Could provide fix suggestions and helpers

---

## Technical Challenge

### The Problem
Browsers cannot scan directories. JavaScript running in the browser has no way to ask "what files exist in this folder?"

### The Solution: Manifest File
Generate a JSON file listing all content files. The browser console reads this manifest and compares against SAMPLE_MODULES.

```json
// content-manifest.json
{
  "generated": "2025-12-27T12:00:00Z",
  "houses": {
    "shield": [
      "applets/operations/pentest-plus-toolkit.html",
      "applets/operations/cysa-analyst-toolkit.html",
      "presentations/cia-triad.html",
      ...
    ],
    "web": [...],
    "cloud": [...],
    ...
  }
}
```

---

## Manifest Generation Options

### Option A: Every Deploy
**How:** Add `node generate-manifest.js` before `firebase deploy`
| Pros | Cons |
|------|------|
| Production always accurate | Extra step to remember |
| Simple workflow | Manifest could be stale during dev |

### Option B: Git Pre-Commit Hook
**How:** Auto-runs when you commit
| Pros | Cons |
|------|------|
| Always in sync with code | Adds to commit time |
| Automatic | Requires hook setup |

### Option C: Manually
**How:** Run when you want to audit
| Pros | Cons |
|------|------|
| Full control | Easy to forget |
| No automation overhead | Can get stale |

### Option D: File Watcher (Dev Mode)
**How:** Watches folders, regenerates on file changes
| Pros | Cons |
|------|------|
| Real-time during development | Complex setup |
| Great for active development | Only works locally |

### Recommendation
**Option A (Every Deploy)** - Practical balance. Already running `firebase deploy`, adding one command is minimal friction.

---

## Manifest Location Options

**Constraint:** Must be deployed with the app so browser can fetch it.

| Location | Reasoning |
|----------|-----------|
| `_app/config/content-manifest.json` | Alongside version.json and other config - **RECOMMENDED** |
| `_app/admin/content-manifest.json` | Dedicated admin folder |
| `_app/data/content-manifest.json` | Generic data folder |

**Note:** `_planning/` will NOT work - it's gitignored and not deployed.

### Recommendation
**`_app/config/content-manifest.json`** - Consistent with existing config file location.

---

## Console Features

### Core Features (v1)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Orphan Detection** | Files on disk not in SAMPLE_MODULES | CRITICAL |
| **Component Type Mismatch** | ContentRegistry entries with empty/misaligned components | CRITICAL |
| **Broken Link Detection** | SAMPLE_MODULES entries pointing to missing files | HIGH |
| **Property Validation** | Missing category, status, href properties | HIGH |
| **Health Dashboard** | At-a-glance view of all houses | HIGH |
| **Per-House Drill-down** | Detailed view of one house's issues | HIGH |
| **Password Protection** | Restrict access to admin console | HIGH |

### Enhanced Features (v2+)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Copy/Paste Helper** | Generate SAMPLE_MODULES entry for orphaned files | MEDIUM |
| **Quick Fix Suggestions** | Show exactly what code to add | MEDIUM |
| **Exclusion List** | Mark files as "intentionally not cataloged" | MEDIUM |
| **Audit History** | Track when audits were run, what changed | LOW |
| **Dark Arts Audit** | Extend to cover dark-arts/vault | LOW |

---

## Write Capability Options

Browsers cannot write files directly. Options for enabling "fixes":

### Level 1: Copy/Paste Helper (Simplest)
**How it works:**
- Console detects orphaned file
- Generates the SAMPLE_MODULES entry
- User clicks "Copy Code"
- User pastes into index.html manually

```javascript
// Console generates:
{id: 'shield-pentest-toolkit', title: 'PenTest+ Toolkit',
 href: 'applets/operations/pentest-plus-toolkit.html',
 status: 'available', category: 'operations'}
```

| Pros | Cons |
|------|------|
| Simple to build | Still requires manual paste |
| No special APIs needed | User must edit file |
| Works in all browsers | Could introduce errors |

### Level 2: Download Modified File
**How it works:**
- Console generates new index.html with entry added
- User downloads and replaces old file

| Pros | Cons |
|------|------|
| More convenient | Still manual file replacement |
| Less error-prone | Larger download |

### Level 3: File System Access API
**How it works:**
- Browser requests folder access permission
- Can read AND write directly
- User grants permission once per session

| Pros | Cons |
|------|------|
| Direct file editing | Chrome/Edge only (not Firefox) |
| Seamless experience | Requires user permission |
| No copy/paste needed | Newer API, less familiar |

### Level 4: Backend Service
**How it works:**
- Firebase Function or small Node.js server
- Console sends "add this entry" request
- Server modifies the file

| Pros | Cons |
|------|------|
| Most seamless | Requires backend infrastructure |
| Works everywhere | More complex deployment |
| Could do more (git commit, etc.) | Security considerations |

### Recommendation
**Start with Level 1 (Copy/Paste Helper)** - Gets 80% of the value with minimal complexity. Can upgrade to Level 3 later if copy/paste feels tedious.

---

## Password Protection Options

### Option 1: Simple Password Gate
- Prompt on page load
- Check against stored hash
- Store auth in sessionStorage

### Option 2: Use Existing AccessGuard
- Already have this for Dark Arts
- Add an "admin" access level
- Consistent with existing security model

### Option 3: God Mode Integration
- Already have HexworthAdmin / God Mode system
- Could tie console access to God Mode activation

### Recommendation
**Option 2 or 3** - Leverage existing security systems rather than building new ones.

---

## Time Estimate

| Component | Estimate |
|-----------|----------|
| Manifest Generator Script | 30-45 min |
| Admin Console - Core (HTML, layout, fetch) | 1.5-2 hours |
| Orphan Detection Logic | 45 min - 1 hour |
| Broken Link Checker | 30-45 min |
| Copy/Paste Helper (Level 1) | 30-45 min |
| Styling (Hexworth aesthetic) | 30-45 min |
| Integration (footer link, password) | 15-30 min |
| Testing | 30-45 min |
| **TOTAL** | **5-7 hours** |

Could be done in one long session or spread across 2-3 sessions.

---

## Open Questions / Decisions Pending

| Question | Options | Decision |
|----------|---------|----------|
| When to regenerate manifest? | Every deploy / Git hook / Manual | Leaning: Every deploy |
| Where to store manifest? | config/ / admin/ / data/ | Leaning: `_app/config/` |
| Password mechanism? | Simple / AccessGuard / God Mode | TBD |
| v1 scope? | Full feature set / Core only | TBD |
| Priority vs other work? | Now / After courses / When time | TBD |
| What password to use? | TBD | TBD |

---

## Discussion Log

### December 27, 2025

**Context:** Reviewing existing CLI audit tool (`generate-audit-report.js`). Found 281 issues across all houses - mostly orphaned files.

**Key Realization:** User clarified that "orphaned files" (content that exists but isn't accessible) is the CRITICAL problem. This is a catastrophic failure for an educational platform.

**User Preferences:**
- Wants **live** checking, not generated reports
- Wants it to run **directly from the app**
- Interested in **write capability** if possible
- Likes the idea of password protection via footer link

**Recommendations Made:**
- Use manifest file approach for file discovery
- Store manifest in `_app/config/`
- Regenerate manifest on every deploy
- Start with Level 1 (Copy/Paste Helper) for write capability
- Leverage existing security systems (AccessGuard or God Mode)

**Estimated Build Time:** 5-7 hours

---

## Orphan File Analysis (December 27, 2025)

### Audit Results

Running `audit-house-indexes.js` found only **23 orphaned files**, all in **Script House**:

| Category | Count | Files |
|----------|-------|-------|
| CLH Intro Files | 15 | `clh/clh-001-intro.html` through `clh/clh-015-intro.html` |
| Python Presentations | 8 | `presentations/python/python-chapter1.html` through `python-chapter8.html` |

**Note:** The other audit tool (`generate-audit-report.js`) reported 281 issues, but it counts differently (includes quiz files, missing properties, etc.). The 23 orphans are the TRUE content gaps.

---

### Root Cause Analysis

#### Discovery: TWO Different Learning Formats

Upon deeper content analysis, the orphaned files are **NOT duplicates** - they are **different pedagogical approaches** to the same material:

| Format | Style | Purpose |
|--------|-------|---------|
| **Presentations** | Reading-focused, explanatory | Conceptual understanding |
| **Applets** | Interactive, hands-on | Practice and application |

---

#### CLH Files: Two Teaching Styles

| Aspect | `clh/` (Orphaned) | `applets/linux/` (Linked) |
|--------|-------------------|---------------------------|
| **Format** | Reading presentation with checkable objectives | Interactive terminal simulation with missions |
| **Teaching Approach** | Read → Understand → Check objectives | Do → Get feedback → Earn XP |
| **Layout** | Single-column article format | Two-column: terminal + intel panel |
| **Gamification** | Checkbox objectives | XP rewards, mission completion modals |
| **AccessGuard** | ❌ **MISSING** (security gap) | ✅ Present |
| **Date** | Dec 25 | Dec 26 (newer) |

**Content comparison (CLH-001):**
- **clh/**: "Why Command Line?" section with CLI vs GUI comparison table, "Hacker Mindset" philosophy, static command examples
- **applets/linux/**: "RECON: Identify Operator" mission-based approach, live terminal where users type commands, OPSEC notes

**These teach the SAME material (whoami, pwd, ls) but in COMPLETELY different ways.**

---

#### Python Files: Two Teaching Styles

| Aspect | `presentations/python/` (Orphaned) | `applets/python/` (Linked) |
|--------|-------------------------------------|----------------------------|
| **Format** | Reading presentation | Interactive tabbed applet |
| **Theme** | Light theme (white background) | Dark theme (green gradient) |
| **Structure** | Linear sections | Tabs: Playground, Explorer, Quiz |
| **Interactivity** | Static code examples | Live Python playground |
| **Assessment** | None visible | Built-in Chapter Quiz tab |
| **AccessGuard** | ✅ Present | ✅ Present |
| **Size** | ~29KB (text-focused) | ~65KB (interactive features) |

**Content comparison (Chapter 1):**
- **presentations/**: "What is Python?" overview, IDE options, "Your First Program" walkthrough, data types explained
- **applets/**: Python Playground for live coding, Data Types Explorer with interactive cards, Chapter Quiz

**These serve DIFFERENT learning preferences - some students want to read first, others want to dive in.**

---

#### The Real Question

These aren't orphaned by mistake - they appear to be **intentional alternative formats**. The question is:

1. **Were they meant to be accessible?** → If yes, they need to be linked in SAMPLE_MODULES
2. **Were they deprecated during development?** → If yes, they should be deleted
3. **Is "read then do" a valid learning path?** → If yes, presentations could be linked as prerequisites or alternatives

The CLH files in `clh/` folder have a security issue regardless (missing AccessGuard), so those need attention either way.

---

### Pattern Recognition for New Audit Tool

Based on this analysis, the new browser-based console should detect:

#### 1. Duplicate Content Detection
- Files with similar names in different folders
- Example: `clh-001` appearing in both `clh/` and `applets/linux/`
- Alert: "Possible duplicate or superseded version detected"

#### 2. AccessGuard Consistency Check
- Scan files for AccessGuard script inclusion
- Alert when content files LACK access control
- This was a security issue with the orphaned CLH files

#### 3. Folder Convention Validation
- Define standard content folders: `applets/`, `presentations/`
- Flag files in non-standard locations (like root `clh/` folder)
- Help enforce consistent organization

#### 4. Size Discrepancy Alerts
- When duplicate-named files exist, compare sizes
- Large size differences (2x+) indicate different content levels
- Could indicate "lite vs full" versions

#### 5. Exclusion List (v2 Feature - now higher priority)
- Allow marking files as "intentionally not cataloged"
- Use cases: deprecated files awaiting deletion, draft content, alternative versions
- Prevents repeat audit noise

#### 6. Internal Link Validation (v2 Feature)
- Scan content files for `href` attributes pointing to relative paths
- Verify those paths resolve to actual files
- **Pattern detected**: Visualizers linking to `xxx-presentation.html` (same folder) when file is at `../../presentations/xxx-presentation.html`
- Alert: "Broken internal link - file not found at relative path"
- This catches 404s that users encounter but SAMPLE_MODULES doesn't track

#### 7. Component Type Mismatch Detection (CRITICAL)
- **Issue discovered December 27, 2025**: After mass migration, cards showed "not available" popups
- **Root cause**: Dashboard's `openContent()` defaulted to `componentType = 'presentation'`
- But migrated entries had component types like `{ applet: '...' }`, `{ quiz: '...' }`, `{ lab: '...' }`
- The key mismatch caused `content.components['presentation']` to be undefined

**Audit checks needed:**
1. **Missing component key**: ContentRegistry entry has `components: {}` (empty)
2. **Unreachable component**: Entry has component but Dashboard doesn't know how to open it
3. **Type/key mismatch**: Entry has `type: 'quiz'` but component key is `presentation`
4. **Path validation**: Component path exists but file doesn't exist at that path

**Example of problematic entry:**
```javascript
// BAD - type says quiz but no quiz component
'shield-example': {
    type: 'quiz',
    components: {
        applet: 'houses/shield/applets/...'  // ← mismatch!
    }
}

// GOOD - type matches component key
'shield-example': {
    type: 'quiz',
    components: {
        quiz: 'houses/shield/quizzes/...'  // ← aligned
    }
}
```

**Dashboard fix applied (v2.37.1):**
- `openContent()` now has fallback logic: tries requested type first, then searches `['applet', 'presentation', 'lab', 'quiz', 'tool', 'project']`
- This is a **runtime workaround** - the audit tool should still flag these for proper cleanup
- Ideally, `type` and primary `component` key should match for clarity

**Alert levels:**
- 🔴 **Error**: Empty components object (content can never open)
- 🟡 **Warning**: Type doesn't match component key (works with fallback, but confusing)
- 🟢 **Info**: Multiple component types available (intentional, like presentation + quiz)

---

### Fix Strategy

**RESOLVED - December 27, 2025**

User decision: **Keep all files and make them accessible** with clear type labels (presentation/lab/quiz).

#### Actions Taken:

1. **CLH Presentations (15 files):**
   - ✅ Added AccessGuard to all 15 files (`clh/clh-001-intro.html` through `clh/clh-015-intro.html`)
   - ✅ Added 15 entries to SAMPLE_MODULES with `components: ['presentation']`
   - ✅ Icon: 📖, Title format: "CLH-XXX Reading"

2. **Python Presentations (8 files):**
   - ✅ Already had AccessGuard (no changes needed)
   - ✅ Added 8 entries to SAMPLE_MODULES with `components: ['presentation']`
   - ✅ Icon: 📖, Title format: "Python Ch.X Reading"

3. **Verification:**
   - ✅ Ran `audit-house-indexes.js` - Script House now shows 0 orphaned files
   - ✅ All 89 content files properly linked

#### Card Labels
The `components` array determines the label shown on each card:
- `['presentation']` → 📖 Reading
- `['lab']` → 🧪 Lab
- `['quiz']` → 📝 Quiz
- `['applet']` → 🎮 Interactive

---

## Related Documents

- `ADMIN_SCRIPTS.md` - Current CLI scripts documentation
- `AUTOMATION_IMPROVEMENTS.md` - Lessons learned from content bugs
- `SECRET_FEATURES.md` - God Mode and admin features documentation

---

## Next Steps

1. Finalize decisions on open questions
2. Design UI mockup (optional)
3. Build manifest generator
4. Build console page
5. Test across all houses
6. Add to dashboard footer
7. Document in ADMIN_SCRIPTS.md

---

## CRITICAL FINDING: Dual Content Systems (December 27, 2025)

### Discovery

While adding the Cyber Arts Bootcamp module, a **major architectural issue** was uncovered:

**Hexworth has TWO separate content catalog systems that are NOT synchronized:**

| System | Location | Purpose | Shield Modules |
|--------|----------|---------|----------------|
| `SAMPLE_MODULES` | `houses/*/index.html` | Admin/Distribution view | 139 |
| `ContentRegistry` | `config/content-registry.js` | **User-facing catalog** | 10 |

### The Problem

1. **Users access content through the Dashboard**, which reads from `ContentRegistry.js`
2. **The audit tools check `SAMPLE_MODULES`** in each house's index.html
3. **The house index.html pages are NOT accessible to users** - they're admin/distribution views
4. **Result:** 129 Shield modules exist in SAMPLE_MODULES but are **completely inaccessible to users**

### Impact

- The audit report showing "orphaned files" was **technically correct**
- But the orphans aren't just "not linked" - they're in a system users can't even reach
- **This is worse than originally thought** - content exists but is locked away from users
- Every house likely has the same problem (SAMPLE_MODULES >> ContentRegistry entries)

### Module Count Comparison (ALL Houses)

| House | ContentRegistry | SAMPLE_MODULES | Gap | % Inaccessible |
|-------|-----------------|----------------|-----|----------------|
| Shield | 10 | 139 | 129 | 93% |
| Web | 14 | 84 | 70 | 83% |
| Cloud | 19 | 32 | 13 | 41% |
| Forge | 10 | 47 | 37 | 79% |
| Script | 34 | 36 | 2 | 6% |
| Code | 7 | 31 | 24 | 77% |
| Key | 1 | 38 | 37 | 97% |
| Eye | 1 | 22 | 21 | 95% |
| **TOTAL** | **96** | **429** | **333** | **78%** |

**78% of all cataloged content is inaccessible to users.**

Script House is the closest to parity (only 2 missing). Key and Eye houses are almost entirely locked away.

### Root Cause

The architecture evolved over time:
1. Originally, house index.html pages were the UI (SAMPLE_MODULES was the source)
2. Later, Dashboard was built with ContentRegistry.js as a centralized catalog
3. The two systems were never synchronized
4. House index.html became "admin view" but SAMPLE_MODULES kept growing
5. ContentRegistry.js was never updated with new content

### Revised Understanding of Architecture

The dual-system architecture was **accidental**, not intentional:

| System | Role | What Happened |
|--------|------|---------------|
| `SAMPLE_MODULES` | Per-house content catalog | Kept growing with new content |
| `ContentRegistry` | Centralized catalog for Dashboard | Was created later, never fully populated |

**The 78% gap is a BUG, not a feature.**

- ALL house content should be accessible to users
- The only intentionally gated content is **Dark Arts** (requires CTF gates)
- Regular houses (Shield, Web, Cloud, etc.) should show ALL their modules
- The 333 missing modules need to be added to ContentRegistry

### Content Visibility Rules

| House | Visibility | Gating |
|-------|------------|--------|
| Shield | ALL modules visible | None |
| Web | ALL modules visible | None |
| Cloud | ALL modules visible | None |
| Forge | ALL modules visible | None |
| Script | ALL modules visible | None |
| Code | ALL modules visible | None |
| Key | ALL modules visible | None |
| Eye | ALL modules visible | None |
| **Dark Arts** | Gated by CTF | 5 Gates challenge required |

### The Real Problem

333 modules are accidentally hidden because:
1. Dashboard reads from ContentRegistry (96 entries)
2. SAMPLE_MODULES has 429 entries
3. Nobody migrated the content when Dashboard was built
4. New content kept going to SAMPLE_MODULES, never to ContentRegistry

### Implications for Admin Console

The browser-based admin console should:

1. **Show BOTH catalogs** - Display SAMPLE_MODULES (master) and ContentRegistry (published)
2. **Highlight discrepancies** - Show what's unpublished (in master, not in published)
3. **Toggle on/off** - Click to publish/unpublish modules without editing code
4. **Bulk operations** - Select multiple modules to publish/unpublish at once
5. **Status indicators** - Visual badges showing Published ✅ / Unpublished ⏸️ / Draft 📝

### Toggle Feature Design

#### UI Concept
```
┌─────────────────────────────────────────────────────────┐
│ Shield House Content Manager                    [Save]  │
├─────────────────────────────────────────────────────────┤
│ Filter: [All ▼] [Published ▼] Search: [________]        │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [✅] CIA Triad                           Published  │ │
│ │ [✅] Security Fundamentals               Published  │ │
│ │ [✅] Cyber Arts Bootcamp                 Published  │ │
│ │ [⏸️] YARA Rule Training                 Unpublished │ │
│ │ [⏸️] PenTest+ Toolkit                   Unpublished │ │
│ │ [⏸️] IR Forensics Lab                   Unpublished │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Published: 10 | Unpublished: 129 | Total: 139          │
└─────────────────────────────────────────────────────────┘
```

#### How Toggle Works

**Publish (turn ON):**
1. User clicks checkbox next to unpublished module
2. Console generates ContentRegistry entry from SAMPLE_MODULES data
3. Entry is added to ContentRegistry.js
4. Module becomes visible to users on Dashboard

**Unpublish (turn OFF):**
1. User unchecks checkbox next to published module
2. Entry is removed from ContentRegistry.js
3. Module disappears from Dashboard but stays in SAMPLE_MODULES
4. Content file is NOT deleted - can be republished anytime

#### Technical Implementation Options

**Option 1: Copy/Paste Helper (Simple)**
- Console shows what to add/remove from ContentRegistry.js
- User manually edits file
- Pro: No write access needed
- Con: Manual process

**Option 2: Download Modified File**
- Console generates new ContentRegistry.js with changes
- User downloads and replaces file
- Pro: Less error-prone
- Con: Still requires file replacement

**Option 3: File System Access API (Chrome/Edge)**
- Console directly modifies ContentRegistry.js
- User grants folder permission once
- Pro: Seamless toggle experience
- Con: Browser-specific

**Option 4: LocalStorage "Override" Layer**
- Store publish/unpublish state in localStorage
- Dashboard checks localStorage before rendering
- Pro: Instant, no file changes needed
- Con: Per-device, not persistent across deploys

**Recommendation:** Start with **Option 1** for MVP, upgrade to **Option 4** for live preview, then **Option 3** for permanent saves.

### Recommended Strategy (Revised)

**Priority 1: Mass Migration**
- Migrate all 333 missing SAMPLE_MODULES entries to ContentRegistry
- This is a one-time bulk operation to fix the gap
- Admin Console should help generate these entries

**Priority 2: Prevent Future Drift**
- When adding new content, add to BOTH systems
- Or: Build automation to sync SAMPLE_MODULES → ContentRegistry on deploy
- Or: Deprecate SAMPLE_MODULES entirely, use only ContentRegistry

**Priority 3: Toggle for Dark Arts Only**
- The toggle on/off feature is really only needed for Dark Arts gating
- Regular house content should always be visible
- Toggle could be used for "coming soon" or maintenance situations

### Admin Console Primary Use Case

**Bulk Migration Tool:**
1. Show all SAMPLE_MODULES entries not in ContentRegistry
2. Auto-generate ContentRegistry entries from SAMPLE_MODULES data
3. Output complete ContentRegistry.js file with all entries
4. One-click to copy or download

**Future Use: Content Status Toggle**
- Mark modules as "Coming Soon" (visible but not clickable)
- Mark modules as "Maintenance" (temporarily hidden)
- But default should be: ALL content visible

### Immediate Fix Options

**Option A: Script-based migration (Fastest)**
- Write a Node.js script to read all SAMPLE_MODULES
- Generate ContentRegistry entries automatically
- Output new content-registry.js
- Review and deploy

**Option B: Admin Console does migration**
- Build the console first
- Use it to do the bulk migration
- Then use it for ongoing management

**Option C: Manual migration (Slowest)**
- Copy entries one by one
- 333 entries = many hours of work
- Not recommended

**Recommendation: Option A first**, then build Admin Console for ongoing management.

### Immediate Actions Taken

1. ✅ Added `shield-cyber-arts-bootcamp` to ContentRegistry.js
2. ✅ Documented this finding in planning docs
3. ⏳ Need to audit all houses for ContentRegistry gaps
4. ⏳ Need to decide on long-term consolidation strategy

---

*This document will be updated as design decisions are made.*
