# Lessons Learned

Running log of discoveries, bugs, and insights found during development.

---

## 2025-12-28: Audit Tool - Coming Soon Detection Gaps

### Problem Statement
The audit tool's "Incomplete Content" scan claims to detect "coming soon" banners, but fails to find known instances in the Code house.

### Known Failures
| House | Section | Item | Status |
|-------|---------|------|--------|
| Code | Learning Paths | DevOps Fundamentals | Has "coming soon" popup - NOT detected |
| Code | Learning Paths | AWS Developer Associate | Has "coming soon" popup - NOT detected |

### How These Items Work
The learning path cards trigger a popup on click:

**HTML (lines 579, 593 in code/index.html):**
```html
<div class="path-card" onclick="openPath('devops-fundamentals')">
    <div class="path-icon">🔄</div>
    <div class="path-info">
        <div class="path-name">DevOps Fundamentals</div>
        <div class="path-cert">Primary Learning Path</div>
    </div>
    ...
</div>
```

**JavaScript (lines 1209-1213 in code/index.html):**
```javascript
function openPath(pathId) {
    console.log('Opening path:', pathId);
    alert(`Learning Path: ${pathId}\n\nPath navigation coming soon!`);
}
```

### Current Detection Logic (audit-tool.html lines 2415-2434)
```javascript
const isPlaceholder = funcBody.includes('alert(') &&
    (funcBody.includes('coming soon') ||
     funcBody.includes('Coming Soon') ||
     funcBody.includes('Coming soon'));
```

### Why Detection Is Failing - ROOT CAUSE FOUND

**Confirmed: Regex extraction bug with template literals**

The regex used to extract function body:
```javascript
/function\s+openPath\s*\([^)]*\)\s*\{([\s\S]*?)\}/
```

The non-greedy `([\s\S]*?)` stops at the FIRST `}` character it finds.

**The problem:**
```javascript
alert(`Learning Path: ${pathId}\n\nPath navigation coming soon!`);
//                           ↑
//                    This } ends the capture early!
```

**What gets captured:**
```javascript
// Would navigate to the learning path view
console.log('Opening path:', pathId);
alert(`Learning Path: ${pathId    // TRUNCATED HERE
```

**What gets missed:**
```
}\n\nPath navigation coming soon!`);
```

The "coming soon" text is AFTER `${pathId}`, so the detection check for `funcBody.includes('coming soon')` returns FALSE.

**Verified via test:**
```
Contains alert(: true
Contains "coming soon": false  ← BUG!
=== IS PLACEHOLDER: false ===
```

**Scope of bug:** Any house using template literals `${var}` in their openPath function will have this same failure.

### Diagnosis Process (2025-12-28)

**Step 1: Verify house is in scan list**
- Checked `CONFIG.houses` at line 812 of audit-tool.html
- Result: Code house IS included ✓

**Step 2: Test regex extraction**
- Ran Node.js test against actual code/index.html
- Used same regex as audit tool: `/function\s+openPath\s*\([^)]*\)\s*\{([\s\S]*?)\}/`
- Result: Regex DOES match, but captures truncated content

**Step 3: Analyze captured content**
```
Captured:
    // Would navigate to the learning path view
    console.log('Opening path:', pathId);
    alert(`Learning Path: ${pathId

NOT captured:
    }\n\nPath navigation coming soon!`);
}
```

**Step 4: Test string matching**
```
funcBody.includes('alert(') → true
funcBody.includes('coming soon') → false  ← FAILURE POINT
funcBody.includes('Coming Soon') → false
funcBody.includes('Coming soon') → false
```

**Step 5: Root cause identification**
- The `}` inside `${pathId}` triggers end of regex capture
- Non-greedy `*?` stops at first `}` found
- "coming soon" text appears AFTER the `}` in template interpolation

### Technical Details

**Failing regex pattern:**
```javascript
/function\s+openPath\s*\([^)]*\)\s*\{([\s\S]*?)\}/
//                                        ↑↑
//                              Non-greedy stops at first }
```

**Actual Code house function (lines 1209-1213):**
```javascript
function openPath(pathId) {
    // Would navigate to the learning path view
    console.log('Opening path:', pathId);
    alert(`Learning Path: ${pathId}\n\nPath navigation coming soon!`);
}
```

**Character position analysis:**
- Position of `${pathId}` closing brace: character ~95 in function body
- Position of "coming soon": character ~110 in function body
- Regex capture stops at: character ~95

### Implications
If 2 known items are missed, there are likely more across other houses. The audit tool is giving false confidence that "all content is complete."

### Recommended Improvements

**Layer 1: Multi-pattern detection**
- Don't rely on one regex
- Check for: `coming soon`, `Coming Soon`, `placeholder`, `not yet`, `under construction`

**Layer 2: Behavioral detection**
- Find all `onclick` handlers
- Trace to their function definitions
- Flag any function that ONLY contains `alert()` with no navigation

**Layer 3: Visual banner detection**
- Scan HTML for banner classes: `.coming-soon`, `.placeholder`, `.disabled`
- Check for inline "Coming Soon" text in card badges

**Layer 4: Cross-reference**
- Compare paths referenced in `onclick` handlers against actual implemented routes
- Any path with no real destination = incomplete

### Action Items
- [x] Diagnose exact cause of detection failure (template literal `${}` breaks regex)
- [x] Create standalone scanner for validation (coming-soon-scanner.js)
- [x] Re-scan all houses to identify scope (24 items found)
- [x] **FIX THE AUDIT TOOL** - Applied Design Option A (Full-Text Search) to audit-tool.html
- [ ] Update lab-qa-qc.md with detection patterns

### Implementation Complete (2025-12-28)

**Changes made to `audit-tool.html`:**

1. **Lines 1023-1098**: Added helper functions
   - `categorizeComingSoon(line, context)` - Categorizes matches by type
   - `extractComingSoonIdentifier(context, category)` - Extracts path/module IDs and names

2. **Lines 2492-2521**: Replaced broken regex extraction with full-text search
   - Uses `html.matchAll(/coming\s*soon/gi)` to find all occurrences
   - Calculates line numbers for each match
   - Extracts context for categorization
   - Populates `houseResult.placeholderPaths` with enriched data

3. **Lines 2638-2651**: Updated render function
   - Changed label from "Placeholder Paths" to "Coming Soon Content"
   - Added category badges (Learning Path, Quiz Feature, etc.)
   - Added line number display for easy code navigation

**Verified working**: Test confirms detection of `devops-fundamentals` path with correct category and name extraction.

### Enhancement: Caller Tracing (2025-12-28)

**Problem solved:** When "coming soon" text is inside a function definition (like `openPath()`), the tool now traces all callers of that function to identify exactly which modules are affected.

**New functions added:**
1. `detectFunctionDefinition(context)` - Detects if a match is inside a function, returns function name
2. `findFunctionCallers(html, funcName, lines)` - Finds all calls to that function with their arguments

**New output format:**
```
• DevOps Fundamentals [Learning Path] [Line 579]
  ↳ via openPath() defined at line 1212
• AWS Developer Associate [Learning Path] [Line 593]
  ↳ via openPath() defined at line 1212
```

**Data structure enrichment:**
- `viaFunction`: Name of the function containing the "coming soon" text
- `definedAt`: Line number where the function is defined

---

## DESIGN: Audit Tool Improvements Needed

The goal is to make `audit-tool.html` find "coming soon" content reliably. Here's what needs to change:

### Problem Summary

The current "Incomplete Content" audit in audit-tool.html (lines 2415-2436) uses regex extraction that fails on template literals. We need to replace this approach.

### Design Option A: Full-Text Search (Recommended)

**Change:** Don't extract function bodies. Just search the entire HTML file for "coming soon" text.

**Why it works:**
- No parsing required
- Immune to JavaScript syntax variations
- Catches ALL instances, not just openPath()

**Implementation:**
```javascript
// REPLACE the current openPath regex extraction (lines 2416-2420)
// WITH simple text search:

const comingSoonMatches = [...html.matchAll(/coming\s*soon/gi)];

for (const match of comingSoonMatches) {
    // Get line number
    const beforeMatch = html.substring(0, match.index);
    const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;

    // Get context (the line containing the match)
    const lines = html.split('\n');
    const contextLine = lines[lineNumber - 1];

    // Categorize based on context
    const category = categorizeMatch(contextLine, lines.slice(lineNumber - 3, lineNumber + 2));

    // Extract identifier (path name, module id, etc.)
    const identifier = extractIdentifier(contextLine);

    houseResult.comingSoon.push({
        line: lineNumber,
        category: category,
        identifier: identifier,
        text: contextLine.trim()
    });
}
```

### Design Option B: Fix the Regex (Not Recommended)

**Change:** Use brace-counting instead of non-greedy match.

**Why it's risky:**
- Still fragile - other syntax could break it
- Doesn't catch "coming soon" outside of openPath()
- More complex to maintain

**If we must use regex:**
```javascript
// Count braces to find real function end
function extractFunctionBody(html, funcName) {
    const startMatch = html.match(new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{`));
    if (!startMatch) return null;

    const startIndex = startMatch.index + startMatch[0].length;
    let braceCount = 1;
    let endIndex = startIndex;

    while (braceCount > 0 && endIndex < html.length) {
        if (html[endIndex] === '{') braceCount++;
        if (html[endIndex] === '}') braceCount--;
        endIndex++;
    }

    return html.substring(startIndex, endIndex - 1);
}
```

### Design Option C: Hybrid Approach

**Change:** Use both methods:
1. Full-text search for "coming soon" (catches everything)
2. Cross-reference with onclick handlers (identifies what it belongs to)

**Implementation outline:**
1. Find all "coming soon" occurrences in file
2. For each occurrence, look backwards for nearest onclick handler
3. Extract the function/path name from that handler
4. Report: "Line X: [path-name] has coming soon popup"

### Categorization Logic

Add this helper to categorize matches:
```javascript
function categorizeMatch(line, context) {
    const fullContext = context.join('\n').toLowerCase();

    if (fullContext.includes('openpath') || fullContext.includes('learning path')) {
        return 'learningPath';
    }
    if (fullContext.includes('quiz')) {
        return 'quizFeature';
    }
    if (fullContext.includes('module') && fullContext.includes('onclick')) {
        return 'moduleHandler';
    }
    if (line.includes('<h') || line.includes('<p')) {
        return 'staticHtml';
    }
    return 'other';
}
```

### Files to Modify

| File | Section | Change |
|------|---------|--------|
| `audit-tool.html` | Lines 2415-2436 | Replace regex extraction with full-text search |
| `audit-tool.html` | Lines 2500-2560 | Update renderIncompleteResults() for new data structure |
| `audit-tool.html` | New | Add categorizeMatch() helper function |
| `audit-tool.html` | New | Add extractIdentifier() helper function |

### Expected Outcome

After implementing these changes:

| Before | After |
|--------|-------|
| Detects: 0 learning paths | Detects: 6 learning paths |
| Detects: 0 quiz features | Detects: 7 quiz features |
| Misses template literals | Catches all syntax |
| Single pattern only | Multiple categories |

### Validation

After implementing, run the standalone scanner and compare:
```bash
node coming-soon-scanner.js --json > scanner-results.json
```

The audit tool should find the same 24 items (or more).

---

## Solution Implemented: coming-soon-scanner.js

**Location:** `_app/admin/scripts/coming-soon-scanner.js`

### Design Principles

1. **Full-text search instead of regex extraction**
   - Don't try to parse JavaScript function bodies
   - Just search for "coming soon" text anywhere in file
   - Avoids template literal parsing bugs

2. **Exclude noise sources**
   - jQuery/vendor libraries
   - .hyperesources directories
   - Minified JavaScript

3. **Categorize by context**
   - learningPaths: Contains "openPath" or "learning path"
   - moduleHandlers: Contains "module" + "onclick"
   - quizFeatures: Contains "quiz", "animation", or "feature"
   - staticHtml: HTML tags like `<h>`, `<p>`, `<div>`
   - other: Everything else

### Usage

```bash
# Scan all houses
node coming-soon-scanner.js

# Output as JSON (for integration)
node coming-soon-scanner.js --json

# Scan specific house
node coming-soon-scanner.js code
```

### Scan Results (2025-12-28)

| House | Matches | Notable Items |
|-------|---------|---------------|
| shield | 2 | 1 module handler, 1 learning path |
| web | 4 | 2 index.html, 2 simulators |
| cloud | 3 | 1 quiz feature in cloud-concepts.html |
| forge | 1 | Module handler only |
| script | 3 | 1 quiz button in scripting-basics.html |
| code | 3 | DevOps + AWS learning paths found! |
| key | 6 | ECC visualizer has 4 feature alerts |
| eye | 2 | Log basics quiz button |

**Total: 24 "coming soon" items across 15 files**

### Key Insight

The original audit tool tried to be clever with regex parsing:
```javascript
// FRAGILE: Breaks on template literals
/function\s+openPath\s*\([^)]*\)\s*\{([\s\S]*?)\}/
```

The new scanner uses brute force text search:
```javascript
// ROBUST: Works regardless of JavaScript syntax
/coming\s*soon/i
```

Sometimes simple is better.

---

*Add new lessons above this line*
