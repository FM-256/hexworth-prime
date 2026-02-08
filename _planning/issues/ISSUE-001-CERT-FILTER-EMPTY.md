# ISSUE-001: Certification Filter Dropdown Empty After MX-6

**Created:** December 29, 2025
**Status:** RESOLVED ✅
**Resolved:** December 29, 2025
**Severity:** High (Feature broken in production)
**Discovered By:** User testing
**Sprint:** Post MX-6 (Certification Mapping)

---

## Problem Statement

The certification filter dropdown in the Matrix Terminal EXPLORE ALL tab is empty. No certification options appear in the dropdown, making the certification filter unusable.

---

## Timeline

| When | What |
|------|------|
| MX-4 Complete | Certification filter working, dropdown populated |
| MX-5 Complete | User tested, confirmed working |
| MX-6 Complete | Certification mapping script ran, updated 433 entries |
| Post MX-6 Deploy | User reports dropdown is empty |

---

## Symptoms

1. Certification dropdown shows no options (empty `<select>`)
2. Other filters (House, Type, Difficulty) status unknown
3. Search functionality status unknown

---

## Root Cause Hypothesis

The MX-6 certification mapping script modified `content-registry.js` to replace 433 instances of `paths: []` with populated arrays like `paths: ['comptia-security', 'security-fundamentals']`.

**Hypothesis:** The script introduced a JavaScript syntax error in `content-registry.js`, causing the entire file to fail to load. When `ContentRegistry` is undefined, the `populateCertFilter()` function has no data to populate the dropdown.

### Why This Breaks the Feature

```
content-registry.js fails to parse
       ↓
ContentRegistry object is undefined
       ↓
populateCertFilter() reads ContentRegistry.content[].paths
       ↓
Returns empty/undefined
       ↓
Dropdown has no options
```

---

## Suspected Cause Details

The batch modification script used string/regex replacement to modify 433 entries:

```javascript
// Script replaced lines like:
paths: [],

// With lines like:
paths: ['comptia-security', 'security-fundamentals'],
```

**Potential syntax errors introduced:**
- Missing trailing comma after paths array
- Quote character mismatch (single vs double)
- Malformed array syntax
- Line break or whitespace issues
- Indentation inconsistency breaking JS parsing

---

## Impact

| Component | Impact |
|-----------|--------|
| Certification Filter | Broken - no options |
| EXPLORE ALL Search | Unknown |
| Skill Tree Tab | Unknown |
| Programs Tab | Unknown |
| Other Houses | Potentially affected if they use ContentRegistry |

---

## Files Involved

| File | Role |
|------|------|
| `_app/config/content-registry.js` | Source of truth, likely contains syntax error |
| `_app/terminal.html` | Contains `populateCertFilter()` function |

---

## Verification Steps (To Be Executed)

1. Check browser console for JavaScript errors
2. Run `node --check content-registry.js` to detect syntax errors
3. Identify specific line number of error
4. Compare pre/post MX-6 file structure

---

## Resolution Plan

1. **Discovery Phase:** Create script to detect JavaScript syntax errors in content-registry.js
2. **Audit Integration:** Add detection to audit tool for future prevention
3. **Rescue Phase:** Fix the syntax error(s) in content-registry.js
4. **Prevention:** Add validation step before deploying modified JS files

---

## Investigation Progress Log

### Step 1: Document the Problem ✅
**Completed:** December 29, 2025
**Action:** Created this issue document (ISSUE-001-CERT-FILTER-EMPTY.md)
**Output:** Full problem documentation with hypothesis, timeline, and resolution plan

---

### Step 2: Create Discovery Script ✅
**Completed:** December 29, 2025
**Action:** Created `_app/admin/scripts/js-syntax-checker.js`

**Script Features:**
| Function | Purpose |
|----------|---------|
| `checkSyntax(code, filename)` | Check JS string for syntax errors |
| `checkFile(filePath)` | Check a JS file for syntax errors |
| `checkFiles(filePaths)` | Batch check multiple files |
| `formatResult(result)` | Console-friendly output |
| `toAuditFormat(result)` | Audit-tool compatible format |

**Output Format:**
```javascript
{
    valid: false,
    error: "Unexpected token '}'",
    line: 2187,
    column: 12,
    filename: 'content-registry.js',
    context: [/* surrounding lines */]
}
```

**Usage:**
```bash
node js-syntax-checker.js ../config/content-registry.js
```

---

### Step 3: Test Discovery Script ✅
**Completed:** December 29, 2025
**Result:** SUCCESS - Error detected!

**Command Run:**
```bash
node js-syntax-checker.js ../../config/content-registry.js
```

**Output:**
```
❌ SYNTAX ERROR: content-registry.js
   Error: Missing initializer in const declaration
   Location: Line 9130

   Context:
       9128:     // ═══════════════════════════════════════════════════════════════
       9129:
   >>> 9130:     paths: {
       9131:         'eye-soc-simulator': {
       9132:             id: 'eye-soc-simulator',
```

**Analysis:**
The error "Missing initializer in const declaration" at line 9130 indicates that `paths: {` appears outside of a valid object context. This suggests:
- The `content:` section may have been prematurely closed
- A `paths:` property is floating outside any entry object
- The batch script likely corrupted the file structure around line 9130

**Root Cause Confirmed:** Structural corruption in content-registry.js, not just a missing comma

---

### Step 4: Add to Audit Tool ✅
**Completed:** December 29, 2025
**Result:** SUCCESS - JS Syntax Check added to audit tool

**Files Modified:**
- `_app/admin/audit-tool.html` - Added Phase 6: JS Syntax Check

**Features Added:**
| Component | Description |
|-----------|-------------|
| Button | "🧪 JS Syntax Check" in Audit Actions |
| `runJsSyntaxAudit()` | Main audit function |
| `checkJsSyntax(file)` | Checks individual file using `new Function()` |
| `renderJsSyntaxResults()` | Displays results with error context |
| `exportJsSyntaxResults()` | Export to JSON |

**Critical Files Checked:**
1. `content-registry.js` (CRITICAL)
2. `skill-tree.js` (CRITICAL)
3. `FileTreeExplorer.js` (non-critical)

**UI Features:**
- Summary cards (Passed/Failed/Skipped)
- Error line highlighting with context
- CRITICAL badge for critical files
- Export results button

---

### Step 5: Iterate on Script ⏳
**Status:** Pending (if Step 3 fails)

---

### Step 6: Test Audit Tool Detection ✅
**Completed:** December 29, 2025
**Result:** SUCCESS - Audit tool detected the error!

**Test Method:**
1. Deployed updated audit-tool.html to Firebase
2. User accessed https://hexworth-prime.web.app/admin/audit-tool.html
3. Clicked "🧪 JS Syntax Check" button
4. Exported results to JSON

**Exported Results:**
```json
{
  "summary": { "passed": 2, "failed": 1, "skipped": 0 },
  "files": [
    {
      "name": "Content Registry",
      "status": "fail",
      "error": "Missing initializer in const declaration",
      "critical": true
    },
    { "name": "Skill Tree", "status": "pass" },
    { "name": "File Tree Explorer", "status": "pass" }
  ]
}
```

**Conclusion:** The audit tool correctly identifies the broken content-registry.js file

---

### Step 7: Request Rescue Permission ✅
**Completed:** December 29, 2025

**Discovery Phase Summary:**

| Deliverable | Status | Location |
|-------------|--------|----------|
| Issue Documentation | ✅ Created | `_planning/issues/ISSUE-001-CERT-FILTER-EMPTY.md` |
| CLI Discovery Script | ✅ Created | `_app/admin/scripts/js-syntax-checker.js` |
| Audit Tool Integration | ✅ Added | `_app/admin/audit-tool.html` (Phase 6) |
| Error Detection | ✅ Verified | Line 9130, structural corruption |

**Root Cause Confirmed:**
- File: `content-registry.js`
- Error: `paths: {` appearing outside object context at line 9130
- Cause: MX-6 batch script corrupted file structure

**Rescue Phase Plan:**
1. Examine corrupted area around line 9130
2. Determine proper structure restoration
3. Apply fix
4. Verify syntax check passes (both CLI and audit tool)
5. Deploy to Firebase
6. Confirm cert filter works

**Permission Requested:** Proceed to Step 8 (Rescue Phase)

---

### Step 8: Rescue Phase ⏳
**Status:** Pending

---

## Resolution Summary

**Fixed via ticketing system:**

| Ticket | Issue | Fix |
|--------|-------|-----|
| ISSUE-002 | Orphan lines 24-30 | Commented out, mapped objectives to correct entry |
| ISSUE-003 | Missing comma line 9483 | Added comma before dark-arts |
| ISSUE-004 | Orphan eye-soc-simulator lines 9132-9144 | Commented out |
| ISSUE-005 | Orphan divergent lines 9639-9648 | Commented out |

**Deployed:** December 29, 2025
**Verified:** Certification filter dropdown now populates correctly

---

## Lessons Learned

1. **Change requests before edits** - Never edit without documented approval
2. **One ticket at a time** - Check in before checking out new work
3. **Comment orphans, don't delete** - Preserve data for review
4. **Transaction logging** - Document each step before/during/after
5. **Verify after each fix** - Run syntax checker after every change
6. **Batch scripts are dangerous** - MX-6 batch modification caused structural corruption

---

## Related Documents

- `_planning/MATRIX_TERMINAL_PLAN.md` - MX-6 sprint details
- `_planning/SPRINT_BACKLOG.md` - Sprint history
- `_app/admin/scripts/js-syntax-checker.js` - Discovery script (created Step 2)

---

## Files Created/Modified During Investigation

| File | Action | Step |
|------|--------|------|
| `_planning/issues/ISSUE-001-CERT-FILTER-EMPTY.md` | Created | 1 |
| `_app/admin/scripts/js-syntax-checker.js` | Created | 2 |
| `_app/admin/audit-tool.html` | Modified | 4 |

---

*Last Updated: December 29, 2025*
