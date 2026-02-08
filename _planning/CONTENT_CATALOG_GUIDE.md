# Content Catalog & Global Search Guide

**File:** `_app/components/ContentCatalog.js`
**Purpose:** Unified index for cross-house search functionality

---

## Quick Reference

### Adding a New Module

```javascript
{
    house: 'script',                    // REQUIRED: House ID (see House IDs below)
    id: 'script-linux-basics',          // REQUIRED: Unique module identifier
    title: 'Linux Command Line Basics', // REQUIRED: Display title (searchable)
    description: 'Essential Linux...',  // REQUIRED: Brief description (searchable)
    icon: '🐧',                         // REQUIRED: Emoji icon
    status: 'available',                // REQUIRED: 'available' | 'coming-soon'
    components: ['presentation', 'lab'], // REQUIRED: Content types (array)
    href: 'applets/linux/simulator.html', // REQUIRED: Path relative to house folder
    tags: ['linux', 'cli', 'terminal'], // OPTIONAL: Search keywords (searchable)
    category: 'linux-fundamentals',     // OPTIONAL: Category for filtering
    featured: true                      // OPTIONAL: Highlight in "Start Here"
}
```

---

## House IDs

| House | ID | Icon | Color | Base Path |
|-------|-----|------|-------|-----------|
| Eye | `eye` | 👁️ | #c084fc | `houses/eye/` |
| Code | `code` | 💻 | #4ade80 | `houses/code/` |
| Key | `key` | 🔑 | #f472b6 | `houses/key/` |
| Shield | `shield` | 🛡️ | #f87171 | `houses/shield/` |
| Script | `script` | 📜 | #a78bfa | `houses/script/` |
| Cloud | `cloud` | ☁️ | #38bdf8 | `houses/cloud/` |
| Forge | `forge` | ⚒️ | #fbbf24 | `houses/forge/` |
| Web | `web` | 🕸️ | #60a5fa | `houses/web/` |

---

## Component Types

Use these values in the `components` array:

| Type | Icon | Description |
|------|------|-------------|
| `presentation` | 📊 | Slide decks, lectures |
| `lab` | 🧪 | Hands-on exercises |
| `quiz` | 📝 | Knowledge assessments |
| `applet` | 🎮 | Interactive tools/simulators |
| `guide` | 📖 | Study guides, references |
| `tool` | 🔧 | Utilities, calculators |
| `module` | 📚 | Multi-part learning modules |
| `exam` | 📋 | Full assessments |
| `textbook` | 📖 | Reference textbooks |

---

## Search Behavior

### What Gets Searched

The search function indexes these fields (in order of priority):

1. **title** - Module title (highest weight)
2. **description** - Module description
3. **id** - Module identifier
4. **tags** - Custom keywords (if provided)

### Search Algorithm

```
User types: "linux permissions"

1. Query split into terms: ["linux", "permissions"]
2. Each module's searchText built: title + description + id + tags
3. ALL terms must match (AND logic)
4. Results sorted: title matches rank higher
5. Current house results shown locally
6. Other house results shown in "Found in Other Houses" section
```

### Minimum Query Length

- Global search activates at **2+ characters**
- Shorter queries only filter local house content

---

## Tags Strategy

Tags improve search discoverability. Use them for:

### Synonyms & Abbreviations
```javascript
tags: ['cli', 'command line', 'terminal', 'shell', 'bash']
```

### Technology Names
```javascript
tags: ['docker', 'containers', 'containerization']
```

### Certification References
```javascript
tags: ['comptia', 'aplus', 'a+', '220-1101']
```

### Skill Levels
```javascript
tags: ['beginner', 'fundamentals', 'basics']
tags: ['advanced', 'expert', 'deep-dive']
```

### Common Misspellings (optional)
```javascript
tags: ['linux', 'linix', 'linus']  // Catches typos
```

---

## Recommended Tags by Topic

### Linux/Unix
```javascript
['linux', 'unix', 'cli', 'terminal', 'bash', 'shell', 'command line']
```

### Windows
```javascript
['windows', 'microsoft', 'powershell', 'cmd', 'registry']
```

### Networking
```javascript
['networking', 'network', 'tcp', 'ip', 'tcpip', 'osi', 'routing', 'switching']
```

### Security
```javascript
['security', 'cybersecurity', 'infosec', 'hacking', 'pentesting']
```

### Cloud
```javascript
['cloud', 'aws', 'azure', 'gcp', 'iaas', 'paas', 'saas']
```

### Programming
```javascript
['python', 'programming', 'coding', 'scripting', 'development']
```

### Hardware
```javascript
['hardware', 'cpu', 'ram', 'storage', 'motherboard', 'troubleshooting']
```

### Cryptography
```javascript
['crypto', 'cryptography', 'encryption', 'hashing', 'pki', 'certificates']
```

---

## Adding Content Checklist

When adding a new module to ContentCatalog.js:

- [ ] **house** - Correct house ID
- [ ] **id** - Unique, follows naming convention (`house-topic-name`)
- [ ] **title** - Clear, descriptive (users see this in search)
- [ ] **description** - Concise but informative (50-100 chars ideal)
- [ ] **icon** - Relevant emoji
- [ ] **status** - Set to 'available' only if content exists
- [ ] **components** - Accurate list of content types
- [ ] **href** - Valid path relative to house folder
- [ ] **tags** - Include synonyms, abbreviations, related terms
- [ ] **Verify file exists** - Test the href path before deploying

---

## Module ID Naming Convention

Format: `{house}-{topic}-{specifics}`

### Examples

```
script-linux-basics       // House: script, Topic: linux, Specifics: basics
forge-aplus-core1-ch01    // House: forge, Topic: aplus, Specifics: core1-ch01
web-osi-model             // House: web, Topic: osi, Specifics: model
shield-yara-training      // House: shield, Topic: yara, Specifics: training
```

### Rules

1. All lowercase
2. Hyphens for word separation
3. House prefix required
4. Keep concise but descriptive
5. Match the id used in house SAMPLE_MODULES

---

## Bulk Import Template

Use this template when adding multiple modules:

```javascript
// ═══════════════════════════════════════════════════════════════════
// [SECTION NAME] - Brief description
// ═══════════════════════════════════════════════════════════════════

{ house: '', id: '', title: '', description: '', icon: '', status: 'available', components: [], href: '', tags: [] },
{ house: '', id: '', title: '', description: '', icon: '', status: 'available', components: [], href: '', tags: [] },
{ house: '', id: '', title: '', description: '', icon: '', status: 'available', components: [], href: '', tags: [] },
```

---

## ContentCatalog.js Structure

```javascript
const ContentCatalog = (function() {

    // House metadata
    const HOUSES = {
        eye: { id, name, icon, color, description, basePath },
        // ... other houses
    };

    // Global module index
    const MODULES = [
        // All modules from all houses
    ];

    // Public API
    return {
        search(query, options),      // Main search function
        getHouseModules(houseId),    // Get modules for one house
        getAllModules(),             // Get all modules
        getHouse(houseId),           // Get house metadata
        getAllHouses(),              // Get all house metadata
        getStats(),                  // Get module counts
        HOUSES,                      // Direct access to houses
        MODULES                      // Direct access to modules
    };
})();
```

---

## Search Options

```javascript
ContentCatalog.search('linux', {
    house: 'script',        // Filter to specific house (null for all)
    status: 'available',    // Filter by status (null for all)
    type: 'lab',            // Filter by component type (null for all)
    limit: 50               // Max results (default: 50)
});
```

---

## Testing Search

Open browser console on any house page and test:

```javascript
// Search all houses
ContentCatalog.search('python')

// Search specific house
ContentCatalog.search('subnetting', { house: 'web' })

// Search for labs only
ContentCatalog.search('linux', { type: 'lab' })

// Get stats
ContentCatalog.getStats()
```

---

## Sync with House SAMPLE_MODULES

The ContentCatalog is a **separate index** from house SAMPLE_MODULES arrays.

**When adding new content:**

1. Add to house's `SAMPLE_MODULES` array in `houses/{house}/index.html`
2. Add to `ContentCatalog.js` MODULES array for global search

**Why separate?**
- House SAMPLE_MODULES controls what appears on house page
- ContentCatalog controls global search results
- Some content may be house-only (not in global search)
- Global search can include curated "best of" content

---

## Priority Content for Global Search

Focus on indexing:

1. **Foundational modules** - Basics, fundamentals, introductions
2. **Popular/flagship content** - Zero to Python, A+ Course, etc.
3. **Unique tools** - Simulators, calculators, labs
4. **Cross-domain content** - Content relevant to multiple houses

Lower priority:
- Individual quiz questions
- Minor variations of same content
- Highly specialized niche content

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-28 | Initial ContentCatalog.js created with ~100 modules |
| | Global search enabled across all 8 houses |
| | ContentDiscovery.js updated for cross-house results |

---

*Last Updated: January 28, 2026*
