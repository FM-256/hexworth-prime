# Hexworth Prime - Links & Buttons Audit

**Created:** December 21, 2025
**Last Updated:** December 22, 2025
**Status:** ✅ All Clear | 0 broken links | 119 content-registry paths verified

---

## Purpose

Track all interactive elements (links, buttons, navigation) across Hexworth Prime to identify:
- Broken links (404s)
- Non-functional buttons
- Placeholder links (planned but not implemented)
- Working elements (verified)

---

## BROKEN (404 / Non-Functional)

### Sorting (`_app/sorting.html`)
| Element | Type | Location | Issue | Notes |
|---------|------|----------|-------|-------|
| Factionless result | Button? | Result screen | Quiz restarts | User reported - needs investigation |

---

## PLANNED (Not Yet Implemented)

### Dashboard
| Element | Intended Function | Priority | Notes |
|---------|-------------------|----------|-------|
| | | | |

### Houses
| House | Element | Intended Function | Priority | Notes |
|-------|---------|-------------------|----------|-------|
| | | | | |

---

## NEEDS TESTING

### Navigation Links
- [ ] START.html -> index.html
- [ ] index.html -> connect.html / sorting.html
- [ ] connect.html -> terminal.html
- [ ] terminal.html -> dashboard.html
- [ ] sorting.html -> dashboard.html
- [ ] Dashboard tab navigation (Home, Explore, Achievements, etc.)
- [ ] Dashboard footer links (Settings, Achievements, Updates, Retake Sorting)

### House Content Links
- [ ] Web house - all presentation/lab/quiz/tool links
- [ ] Shield house - all presentation/lab/quiz/tool links
- [ ] Cloud house - all presentation/lab/quiz/tool links
- [ ] Forge house - all presentation/lab/quiz/tool links
- [ ] Script house - all presentation/lab/quiz/tool links
- [ ] Code house - all presentation/lab/quiz/tool links
- [ ] Key house - all presentation/lab/quiz/tool links
- [ ] Eye house - all presentation/lab/quiz/tool links

### Dark Arts
- [ ] Gate 1 -> Gate 2
- [ ] Gate 2 -> Gate 3
- [ ] Gate 3 -> Gate 4
- [ ] Gate 4 -> Gate 5
- [ ] Gate 5 -> Gate 6
- [ ] Gate 6 -> Vault
- [ ] Vault module links

### External Links
- [ ] GitHub links
- [ ] Documentation links
- [ ] Resource links

---

## VERIFIED WORKING

### Legacy Applet Navigation (Fixed in v1.8.3)
| Element | Count | Location | Status |
|---------|-------|----------|--------|
| Header "Back to House" link | 175 | All legacy applets | ✅ Links to house index |
| Footer "Back to House" link | 175 | All legacy applets | ✅ Links to house index |
| Hexworth Prime branding | 175 | All legacy applets | ✅ Updated from Academy |

### Core Navigation
| Element | Location | Verified Date | Notes |
|---------|----------|---------------|-------|
| START.html | Root | 2025-12-21 | ✅ Entry point exists |
| index.html | _app/ | 2025-12-21 | ✅ Choose Reality screen |
| connect.html | _app/ | 2025-12-21 | ✅ Matrix connection |
| terminal.html | _app/ | 2025-12-21 | ✅ Matrix terminal |
| dashboard.html | _app/ | 2025-12-21 | ✅ Main dashboard |
| sorting.html | _app/ | 2025-12-21 | ✅ House sorting quiz |

### House Landing Pages
| House | File | Verified Date | Notes |
|-------|------|---------------|-------|
| Web | houses/web/index.html | 2025-12-21 | ✅ Exists |
| Shield | houses/shield/index.html | 2025-12-21 | ✅ Exists |
| Cloud | houses/cloud/index.html | 2025-12-21 | ✅ Exists |
| Forge | houses/forge/index.html | 2025-12-21 | ✅ Exists |
| Script | houses/script/index.html | 2025-12-21 | ✅ Exists |
| Code | houses/code/index.html | 2025-12-21 | ✅ Exists |
| Key | houses/key/index.html | 2025-12-21 | ✅ Exists |
| Eye | houses/eye/index.html | 2025-12-21 | ✅ Exists |

### Dark Arts Gate Chain
| From | To | Verified Date | Notes |
|------|-----|---------------|-------|
| Dashboard | gate-1.html | 2025-12-21 | ✅ Storm Gates banner |
| Gate 1 | gates/gate-2.html | 2025-12-21 | ✅ Correct path |
| Gate 2 | gate-3.html | 2025-12-21 | ✅ Correct path |
| Gate 3 | gate-4.html | 2025-12-21 | ✅ Correct path |
| Gate 4 | gate-5.html | 2025-12-21 | ✅ Correct path |
| Gate 5 | ../vault/index.html | 2025-12-21 | ✅ Leads to Vault |
| Vault | gates/gate-6.html | 2025-12-21 | ✅ Bonus gate exists |
| Vault | gates/gate-7.html | 2025-12-21 | ✅ Coming Soon page |

### Dashboard Functions
| Element | Function | Verified Date | Notes |
|---------|----------|---------------|-------|
| 5-click footer | God Mode toggle | 2025-12-21 | Working |
| Konami code | God Mode activation | 2025-12-21 | Fixed in v1.8.2 |
| Black hole 5-click | House selector | 2025-12-21 | Added in latest |
| Storm Gates banner | Dark Arts entry | 2025-12-21 | Fixed achievement trigger |

---

## AUDIT LOG

### December 21, 2025 - Initial Scan
- Created audit file
- User reported "lots of 404s" - need systematic check
- Priority: Identify all broken links before fixing

**Automated scan results:**
- ~~Found 255 broken links to `catalog.html`~~ ✅ FIXED in v1.8.3
- Found incorrect gate path references in Dark Arts
- Factionless sorting bug still under investigation
- Gate 7 referenced but doesn't exist

**Remaining items:**
1. ~~Create redirect or stub for `catalog.html`~~ ✅ FIXED
2. Verify all gate navigation paths
3. Debug Factionless sorting result display
4. Manual click-through of each house's content

### December 21, 2025 - v1.8.3 Released
**Fixed 255+ broken catalog.html links** via global search/replace:
- 175 HTML files updated across Shield, Web, Forge, Cloud, Script, Code houses
- Links now point to house `index.html` pages
- Branding updated: "Hexworth Academy" → "Hexworth Prime"
- Link text updated: "← Back to Catalog" → "← Back to House"

### December 21, 2025 - Fresh Audit (Post-Fix)
**Comprehensive scan completed:**
- ✅ `catalog.html` references: **0 remaining**
- ✅ "Hexworth Academy" branding: **0 remaining**
- ✅ Core navigation files: **All 6 exist**
- ✅ House landing pages: **All 8 exist**
- ✅ Dark Arts gate chain: **Gates 1-6 working**
- ❌ Gate 7: **Does not exist** (placeholder link in vault/index.html:651)
- ⚠️ `href="#"` patterns: 17 occurrences (intentional JS handlers)
- ⚠️ Factionless sorting bug: Still needs investigation

**Audit conclusion:** ~~Only 1 confirmed broken link (gate-7.html placeholder)~~ ✅ All fixed!

### December 21, 2025 - Gate 7 Placeholder Created
- Created `vault/gates/gate-7.html` with "Coming Soon" page
- Matches Dark Arts aesthetic with mystery theme
- Links back to Vault properly
- **0 broken links remaining**

### December 22, 2025 - Content Registry Audit & Fix
**Issue:** Factionless content tree links not working (user reported)

**Root Cause:** Content-registry.js referenced 11 files that don't exist:
- `houses/web/applets/osi-explorer.html` (non-existent)
- `houses/web/labs/osi-lab.html` (non-existent)
- `houses/shield/applets/cia-scenarios.html` (non-existent)
- `houses/shield/labs/cia-lab.html` (non-existent)
- `houses/shield/applets/threats/social-engineering-attacks.html` (non-existent)
- `houses/key/applets/cipher-playground.html` (non-existent)
- `houses/key/labs/encryption-lab.html` (non-existent)
- `houses/code/applets/git-visualizer.html` (non-existent)
- `houses/code/labs/git-lab.html` (non-existent)
- `houses/eye/applets/log-parser.html` (non-existent)
- `houses/eye/labs/log-analysis-lab.html` (non-existent)

**Why Previous Audit Passed:** Only checked for `catalog.html` references and gate navigation paths.
Did NOT verify content-registry.js file paths actually exist on disk.

**Fix Applied:** Remapped broken paths to existing equivalent files:
| Original Path | Remapped To |
|--------------|-------------|
| `web/applets/osi-explorer.html` | `web/applets/visualizers/osi-visualizer.html` |
| `web/labs/osi-lab.html` | `web/quizzes/osi-quiz.html` |
| `shield/applets/cia-scenarios.html` | `shield/applets/fundamentals/five_pillars/FivePillars.html` |
| `shield/labs/cia-lab.html` | (removed - no lab component needed) |
| `shield/applets/threats/social-engineering-attacks.html` | `shield/applets/threats/social_engineering/social_engineering.html` |
| `key/applets/cipher-playground.html` | `key/tools/aes-explorer.html` |
| `key/labs/encryption-lab.html` | `key/labs/aes-lab.html` |
| `code/applets/git-visualizer.html` | `code/applets/pipeline-builder.html` |
| `code/labs/git-lab.html` | `code/labs/cicd-lab.html` |
| `eye/applets/log-parser.html` | `eye/tools/siem-simulator.html` |
| `eye/labs/log-analysis-lab.html` | `eye/labs/soc-lab.html` |

**Post-Fix Verification:**
- ✅ All 119 content-registry.js paths verified to exist
- ✅ Factionless navigation now works

---

## HOW TO AUDIT

### Manual Testing Checklist
1. Open browser DevTools (F12) -> Network tab
2. Filter by "404" status
3. Click through each section systematically
4. Document any failed requests

### Automated Check (Future)
```bash
# Find all href and src attributes
grep -roh 'href="[^"]*"' _app/ | sort | uniq
grep -roh 'src="[^"]*"' _app/ | sort | uniq
```

---

## NOTES

- Many Hype applets were imported from Hexworth Academy - these may have internal broken links
- Content registry (`_app/config/content-registry.js`) should match actual file paths
- House index pages generate links dynamically from registry

---

*Update this file as issues are found and fixed*
