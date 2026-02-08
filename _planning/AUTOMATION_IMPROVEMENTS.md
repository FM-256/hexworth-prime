# Hexworth Prime - Automation & Audit Improvements

**Purpose:** Track lessons learned from bugs/broken paths and continuously improve our troubleshooting and audit processes.
**Created:** December 26, 2025
**Status:** Active - Update after each discovery

---

## Current Script Inventory

### Implemented Scripts (`_app/scripts/`)

| Script | Status | Purpose | Last Updated |
|--------|--------|---------|--------------|
| `audit-registry.js` | Working | Verify content-registry.js paths exist | Dec 22, 2025 |
| `house-summary.js` | Working | Generate house content inventory tables | Dec 22, 2025 |

### Documented but Not Yet Scripted

| Audit Type | Current Method | Target Script | Priority |
|------------|----------------|---------------|----------|
| House Index vs Files Audit | Manual grep/diff | `audit-house-indexes.js` | HIGH |
| Category Property Audit | Manual grep | `audit-categories.js` | HIGH |
| Broken Link Scanner | Bash one-liners | `scan-broken-links.js` | MEDIUM |
| Branding Audit | Manual grep | `audit-branding.js` | LOW |
| Dark Arts Gate Validator | Bash one-liners | `validate-gates.js` | LOW |

---

## Lessons Learned Log

### Issue #1: CSE Presentations Not Visible (Dec 25, 2025)

**Symptoms:** EC-Council CSE presentations existed as files but weren't visible in Cloud House

**Root Cause:** Files existed in `presentations/` folder but were NOT added to `SAMPLE_MODULES` array in house `index.html`

**Pattern Identified:**
- Content files can exist without being displayed
- The `SAMPLE_MODULES` array is the single source of truth for what appears in UI
- Creating files is not enough - must add to index

**Automation Gap:**
- No script to compare files-on-disk vs entries-in-index
- Audit only checked `content-registry.js`, not house indexes

**Fix Applied:** Added CSE entries to Cloud and Shield house indexes

**Future Prevention:**
- [ ] Create `audit-house-indexes.js` script
- [ ] Run after any content addition
- [ ] Add to pre-deploy checklist

---

### Issue #2: CSE Quizzes 404 (Dec 25, 2025)

**Symptoms:** CSE presentation pages had links to quiz files that didn't exist

**Root Cause:** Presentations were created with quiz links, but quiz files were never generated

**Pattern Identified:**
- Content with internal links can reference non-existent files
- Presentations → Quizzes dependency not tracked

**Automation Gap:**
- No script to validate internal href links resolve to real files

**Fix Applied:** Created 8 CSE quiz files (5 for Cloud, 3 for Shield)

**Future Prevention:**
- [ ] Add link validation to audit process
- [ ] Create `validate-internal-links.js` script

---

### Issue #3: Career Exploration Not Visible in Category (Dec 26, 2025)

**Symptoms:** Career Exploration existed in Shield House but didn't appear when clicking "Security Fundamentals" category

**Root Cause:** Entry in `SAMPLE_MODULES` was missing the `category: 'fundamentals'` property

**Pattern Identified:**
- Shield House had TWO entry formats:
  - Multi-line format (top 13 entries) - HAD category property
  - Compact single-line format (remaining 87 entries) - MISSING category property
- Category filtering requires `category` property on every entry
- Entries without `category` only appear in "All" view, not in category views

**Automation Gap:**
- No script to verify all SAMPLE_MODULES entries have required properties
- No schema validation for module entries

**Fix Applied:** Added `category` property to all 90 entries missing it

**Future Prevention:**
- [ ] Create `audit-categories.js` to verify all entries have category
- [ ] Consider adding schema validation for SAMPLE_MODULES entries
- [ ] Document required properties for module entries

---

## Bug/Issue Patterns Catalog

### Pattern A: "File Exists but Not Displayed"
**Cause:** File not in SAMPLE_MODULES array
**Detection:** Compare `find` output vs `grep href` from index
**Script Needed:** `audit-house-indexes.js`

### Pattern B: "Link Goes to 404"
**Cause:** href references non-existent file
**Detection:** Extract all hrefs, validate file existence
**Script Needed:** `validate-internal-links.js`

### Pattern C: "Content Missing from Category Filter"
**Cause:** Missing `category` property in SAMPLE_MODULES entry
**Detection:** Parse SAMPLE_MODULES, check for category on each entry
**Script Needed:** `audit-categories.js`

### Pattern D: "Legacy Branding Present"
**Cause:** Old "Hexworth Academy" text in migrated content
**Detection:** grep for "Academy" in HTML files
**Script Needed:** `audit-branding.js`

### Pattern E: "Incomplete Migration"
**Cause:** Applet/tool references missing assets or dependencies
**Detection:** Check for 404s on images, scripts, stylesheets
**Script Needed:** `audit-assets.js`

---

## Audit Process Improvements

### Current Process (Manual)
```
1. User reports issue
2. Investigate manually
3. Find root cause
4. Fix individual issue
5. Hope we catch similar issues
```

### Target Process (Automated)
```
1. Pre-deploy: Run full audit suite
2. Audit suite checks:
   - Files vs Index sync
   - Internal link validation
   - Category property completeness
   - Required asset existence
   - Branding consistency
3. Report generated with all issues
4. Fix all issues before deploy
5. Post-deploy: Quick smoke test
```

---

## Script Roadmap

### Phase 1: Core Audits (Priority: HIGH)

#### `audit-house-indexes.js`
**Purpose:** Compare files on disk vs SAMPLE_MODULES entries
**Input:** House name (or "all")
**Output:**
- Files not in index (orphaned files)
- Index entries with bad paths (broken references)
```bash
node scripts/audit-house-indexes.js shield
node scripts/audit-house-indexes.js all
```

#### `audit-categories.js`
**Purpose:** Verify all SAMPLE_MODULES entries have required properties
**Checks:**
- `id` - required, unique
- `title` - required
- `href` - required, valid path
- `category` - required for filtering
- `status` - required (available/coming-soon/locked)
```bash
node scripts/audit-categories.js shield
```

### Phase 2: Link Validation (Priority: MEDIUM)

#### `validate-internal-links.js`
**Purpose:** Crawl HTML files, validate all href/src attributes
**Checks:**
- Internal links resolve to real files
- No orphaned anchors
- Image sources exist
- Script sources exist
```bash
node scripts/validate-internal-links.js
```

### Phase 3: Quality Assurance (Priority: LOW)

#### `audit-branding.js`
**Purpose:** Find legacy branding references
**Checks:**
- "Hexworth Academy" → should be "Hexworth Prime"
- Old logo references
- Legacy navigation links

#### `audit-assets.js`
**Purpose:** Verify all referenced assets exist
**Checks:**
- Images in `assets/` folders
- CSS files
- JS dependencies
- Audio/video files

---

## Pre-Deploy Checklist

### Before Any Deploy
- [ ] Run `node scripts/audit-house-indexes.js all`
- [ ] Run `node scripts/audit-categories.js all` (when created)
- [ ] Check for console errors on major pages
- [ ] Test category filtering on at least one house

### After Content Addition
- [ ] Verify new files appear in relevant house
- [ ] Test any links in new content
- [ ] Run content audit for affected house

### After Major Migration
- [ ] Full audit suite
- [ ] Branding audit
- [ ] Asset validation
- [ ] Cross-browser smoke test

---

## Metrics to Track

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Files vs Index Gap | 0 (fixed) | 0 | After Dec 25 fixes |
| Missing Category Props | 0 (fixed) | 0 | After Dec 26 fixes |
| Audit Scripts Implemented | 2 | 6 | Need 4 more core scripts |
| Pre-deploy Audit Time | Manual | <2 min | Automation target |

---

## Quick Commands Reference

### Find files not in index (bash)
```bash
# For Shield House
cd _app/houses/shield
comm -23 <(find . -name "*.html" -type f | sed 's|^\./||' | sort) \
         <(grep -o "href: '[^']*'" index.html | sed "s/href: '//;s/'$//" | sort)
```

### Count category properties
```bash
grep -c "category:" _app/houses/shield/index.html
```

### Find entries missing category
```bash
grep "{id:" _app/houses/shield/index.html | grep -v "category:"
```

### Validate all internal links exist
```bash
grep -roh "href=['\"][^'\"]*\.html['\"]" _app/houses/ | \
  sed "s/href=['\"]//;s/['\"]$//" | sort -u | \
  while read link; do
    [ ! -f "_app/houses/$link" ] && echo "BROKEN: $link"
  done
```

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| Dec 26, 2025 | Created document | Claude Code |
| Dec 26, 2025 | Added Issues #1-3 from session | Claude Code |
| Dec 26, 2025 | Defined script roadmap | Claude Code |

---

*This document should be updated after each bug discovery to capture lessons learned and improve our processes.*
