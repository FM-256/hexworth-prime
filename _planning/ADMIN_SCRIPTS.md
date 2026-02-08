# Hexworth Prime - Admin Scripts & Console Ideas

**Created:** December 22, 2025
**Purpose:** Track useful scripts, audit commands, and ideas for future Admin Console

---

## Quick Reference

| Script | File | Purpose | Usage |
|--------|------|---------|-------|
| Content Registry Audit | `_app/scripts/audit-registry.js` | Verify all content paths exist | `node scripts/audit-registry.js` |
| House Summary (All) | `_app/scripts/house-summary.js` | Show all houses inventory | `node scripts/house-summary.js` |
| House Summary (Single) | `_app/scripts/house-summary.js` | Show single house detail | `node scripts/house-summary.js shield` |
| House Index Audit | (bash/TODO script) | Compare files vs SAMPLE_MODULES | See Pattern A below |
| Category Property Audit | (bash/TODO script) | Verify entries have category | See Pattern C below |
| Broken Link Scanner | (bash commands below) | Find 404 references | Pre-release QA |
| Branding Audit | (bash commands below) | Find legacy "Academy" refs | After imports |

**See Also:** `AUTOMATION_IMPROVEMENTS.md` for lessons learned and script roadmap

---

## SAVED SCRIPTS (in `_app/scripts/`)

### `audit-registry.js`
Verifies all file paths in content-registry.js exist on disk.
```bash
cd _app && node scripts/audit-registry.js
```

### `house-summary.js`
Shows content inventory tables.
```bash
# All houses summary table
cd _app && node scripts/house-summary.js

# Single house detailed view
cd _app && node scripts/house-summary.js shield
cd _app && node scripts/house-summary.js web
cd _app && node scripts/house-summary.js cloud
# etc.
```

---

## SCRIPTS

### 1. Content Registry Audit
**Purpose:** Verify all file paths in content-registry.js actually exist on disk.
**When to use:** After adding new content, before releases, when Factionless links break.

```javascript
// Run from _app/ directory: node audit-registry.js
const fs = require('fs');
const path = require('path');

const registryContent = fs.readFileSync('./config/content-registry.js', 'utf8');
const pathMatches = registryContent.matchAll(/(?:presentation|applet|lab|quiz):\s*['"]([^'"]+)['"]/g);

const paths = [];
for (const match of pathMatches) {
    paths.push(match[1]);
}

const missing = [];
const exists = [];

paths.forEach(p => {
    const fullPath = path.join('.', p);
    if (fs.existsSync(fullPath)) {
        exists.push(p);
    } else {
        if (p.endsWith('/')) {
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
                exists.push(p);
            } else {
                missing.push(p);
            }
        } else {
            missing.push(p);
        }
    }
});

console.log('\n=== CONTENT REGISTRY AUDIT ===\n');
console.log(`Total paths: ${paths.length}`);
console.log(`Existing: ${exists.length}`);
console.log(`MISSING: ${missing.length}`);

if (missing.length > 0) {
    console.log('\n=== MISSING FILES ===\n');
    missing.forEach(p => console.log('❌ ' + p));
} else {
    console.log('\n✅ ALL PATHS VERIFIED!');
}
```

---

### 2. House Content Summary (All Houses)
**Purpose:** Generate inventory table of all content across all houses.
**When to use:** Planning, documentation, progress tracking.

```javascript
// Run from _app/ directory
const fs = require('fs');

// Load content registry
const registryContent = fs.readFileSync('./config/content-registry.js', 'utf8');

// Parse houses directory for actual files
const houses = ['web', 'shield', 'cloud', 'forge', 'script', 'code', 'key', 'eye'];
const categories = ['presentations', 'applets', 'labs', 'quizzes', 'tools', 'simulators', 'games'];

const summary = {};

houses.forEach(house => {
    summary[house] = {};
    categories.forEach(cat => {
        const dirPath = `./houses/${house}/${cat}`;
        if (fs.existsSync(dirPath)) {
            const countFiles = (dir) => {
                let count = 0;
                const items = fs.readdirSync(dir, { withFileTypes: true });
                items.forEach(item => {
                    if (item.isDirectory()) {
                        count += countFiles(`${dir}/${item.name}`);
                    } else if (item.name.endsWith('.html')) {
                        count++;
                    }
                });
                return count;
            };
            summary[house][cat] = countFiles(dirPath);
        } else {
            summary[house][cat] = 0;
        }
    });
});

// Output table
console.log('\n=== HOUSE CONTENT SUMMARY ===\n');
console.log('| House | Presentations | Applets | Labs | Quizzes | Tools | Games | TOTAL |');
console.log('|-------|---------------|---------|------|---------|-------|-------|-------|');

let grandTotal = 0;
houses.forEach(house => {
    const s = summary[house];
    const total = Object.values(s).reduce((a, b) => a + b, 0);
    grandTotal += total;
    console.log(`| ${house.padEnd(5)} | ${String(s.presentations || 0).padStart(13)} | ${String(s.applets || 0).padStart(7)} | ${String(s.labs || 0).padStart(4)} | ${String(s.quizzes || 0).padStart(7)} | ${String(s.tools || 0).padStart(5)} | ${String(s.games || 0).padStart(5)} | ${String(total).padStart(5)} |`);
});
console.log(`\nGRAND TOTAL: ${grandTotal} content items`);
```

---

### 3. Single House Content Summary
**Purpose:** Get detailed content breakdown for one house.
**Usage:** Pass house name as argument.

```javascript
// Run: node house-summary.js shield
const fs = require('fs');
const house = process.argv[2] || 'shield';

const walkDir = (dir, depth = 0) => {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    items.forEach(item => {
        const prefix = '  '.repeat(depth);
        if (item.isDirectory()) {
            console.log(`${prefix}📁 ${item.name}/`);
            walkDir(`${dir}/${item.name}`, depth + 1);
        } else if (item.name.endsWith('.html')) {
            console.log(`${prefix}📄 ${item.name}`);
        }
    });
};

console.log(`\n=== ${house.toUpperCase()} HOUSE CONTENT ===\n`);
walkDir(`./houses/${house}`);
```

---

### 4. Broken Link Scanner (catalog.html style)
**Purpose:** Find specific broken link patterns across all HTML files.
**When to use:** After importing legacy content, pre-release QA.

```bash
# Find catalog.html references (legacy broken links)
grep -r "catalog\.html" --include="*.html" _app/houses/ | wc -l

# Find Hexworth Academy branding (should be 0)
grep -r "Hexworth Academy" --include="*.html" _app/houses/ | wc -l

# Find empty href="#" (usually intentional JS handlers)
grep -r 'href="#"' --include="*.html" _app/ | wc -l

# Find potential 404s - external links
grep -roh 'href="http[^"]*"' _app/ | sort | uniq
```

---

### 5. Dark Arts Gate Chain Validator
**Purpose:** Verify all gate navigation paths work correctly.

```bash
# Check gate files exist
ls -la _app/dark-arts/gates/
ls -la _app/dark-arts/vault/
ls -la _app/dark-arts/vault/gates/

# Verify gate chain references
grep -o 'href="[^"]*gate[^"]*"' _app/dark-arts/gates/*.html
grep -o 'href="[^"]*gate[^"]*"' _app/dark-arts/vault/*.html
```

---

### 6. File Count by Extension
**Purpose:** Quick inventory of file types in the project.

```bash
# Count HTML files
find _app -name "*.html" -type f | wc -l

# Count JS files
find _app -name "*.js" -type f | wc -l

# Count CSS files
find _app -name "*.css" -type f | wc -l

# Count by house
for house in web shield cloud forge script code key eye; do
  echo "$house: $(find _app/houses/$house -name '*.html' -type f | wc -l) HTML files"
done
```

---

## ADMIN CONSOLE IDEAS

### Phase 1: Read-Only Dashboard
- [ ] Content inventory summary (all houses)
- [ ] Single house deep-dive view
- [ ] Broken link report
- [ ] User progress statistics
- [ ] Achievement unlock rates

### Phase 2: Content Management
- [ ] Add/edit content-registry entries
- [ ] Validate paths before saving
- [ ] Generate placeholder files for new modules
- [ ] Bulk update file references

### Phase 3: System Tools
- [ ] Run audit scripts from UI
- [ ] Version bump utility
- [ ] Changelog generator
- [ ] Export/import user data
- [ ] Clear cache/localStorage

### Phase 4: Developer Mode
- [ ] Live content-registry editor
- [ ] Path validation on save
- [ ] Generate module templates
- [ ] Hot-reload preview
- [ ] Debug console

---

## USAGE PATTERNS

### "Show me summary tables for all houses"
→ Run Script #2 (House Content Summary - All Houses)

### "Show me the summary table for Shield house"
→ Run Script #3 (Single House Content Summary) with `shield` argument

### "Audit the content registry"
→ Run Script #1 (Content Registry Audit)

### "Check for broken links"
→ Run Script #4 (Broken Link Scanner)

---

## DISCOVERED BUG PATTERNS (Dec 2025)

### Pattern A: Files Exist But Not Displayed
**Symptom:** Content files exist but don't appear in house UI
**Cause:** File not added to SAMPLE_MODULES array in house index.html
**Quick Check:**
```bash
# Compare files on disk vs entries in index
cd _app/houses/shield
find . -name "*.html" -type f | wc -l          # Files on disk
grep -c "{id:" index.html                       # Entries in array
# If numbers don't match, there's a gap
```

### Pattern B: Content Missing from Category Filter
**Symptom:** Item appears in "All" view but not when clicking category card
**Cause:** Entry missing `category` property in SAMPLE_MODULES
**Quick Check:**
```bash
# Count entries vs category properties
grep -c "{id:" _app/houses/shield/index.html
grep -c "category:" _app/houses/shield/index.html
# These should be equal (or categories = entries + CATEGORIES definitions)

# Find entries WITHOUT category property
grep "{id:" _app/houses/shield/index.html | grep -v "category:" | head -10
```

### Pattern C: Internal Links 404
**Symptom:** Clicking link in content leads to 404 error
**Cause:** href references file that doesn't exist
**Quick Check:**
```bash
# Extract all internal HTML links and check existence
grep -roh "href='[^']*\.html'" _app/houses/shield/ | \
  sed "s/href='//;s/'$//" | sort -u | head -20
# Manually verify suspicious paths exist
```

### Pattern D: Orphaned Assets
**Symptom:** Broken images or missing styles
**Cause:** Asset files missing from expected location
**Quick Check:**
```bash
# Find image references
grep -roh "src='[^']*\.\(png\|jpg\|gif\|svg\)'" _app/houses/ | \
  sed "s/src='//;s/'$//" | sort -u | head -20
```

---

## PRE-DEPLOY CHECKLIST

```
[ ] Run: cd _app && node scripts/audit-registry.js
[ ] Run: cd _app && node scripts/house-summary.js
[ ] Check category counts match entry counts (Pattern B)
[ ] Test category filtering on modified houses
[ ] Check for console errors on key pages
[ ] Verify new content appears in correct house
```

---

## NOTES

- All scripts assume working directory is `_app/`
- Node.js required for JavaScript scripts
- Bash scripts work on Linux/macOS/WSL
- Future: Convert these to browser-runnable admin console
- **See `AUTOMATION_IMPROVEMENTS.md`** for full lessons learned log and script roadmap

---

*Last Updated: December 26, 2025*
