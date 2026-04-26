# Nexus Spoke Adapters

Each adapter bridges an external tool into the Nexus hub-and-spoke system.

## Adapter Interface

Every adapter exports a factory function that returns:

```js
{
    name,             // string: spoke identifier
    getFindings(),    // returns array of finding objects
    getStatus(),      // returns { available, name, counts?, ... }
    acceptFinding(),  // accepts a finding for action (or returns read-only)
}
```

## Adapters

| File | Spoke | Purpose |
|------|-------|---------|
| `eduscan.js` | EduScan | Code scanner findings from TREASURE_MAP.json |
| `sprint-master.js` | Sprint Master | Sprint backlog items, accepts findings as new sprint items |
| `hed.js` | HED | Handler Error Dashboard exports |
| `audit.js` | Audit | Planning report findings |
| `spellbook.js` | Spellbook | Prompt recipe inventory |
| `todo.js` | ToDo | Personal task list |
| `hexcontent.js` | HexContent | bc1 cold storage and workbench inventory |
| `hexcontent-adapter.js` | HexContent Adapter | Content shuttle bridge: fetch, classify, stage, import pipeline |
| `functions.js` | Functions | Cloud Functions deploy gate: test, diff, deploy (targeted) |
| `scan-history.js` | History | Scan snapshot tracking and comparison |
| `deploy-check.js` | Deploy Check | 20-check pre-deploy safety gate (`nexus dc`) |
| `quiz-report.js` | Quiz Report | Quiz coverage: keys, engines, placeholders (`nexus qr`) |
| `dead-code.js` | Dead Code | Finds unused JS components and orphaned files |
| `auto-fix.js` | Auto-Fix | Safe mechanical fixes for known patterns (`nexus fix`) |
| `changelog.js` | Changelog | Git changelog grouped by category (`nexus cl`) |
| `smoke-test.js` | Smoke Test | Post-deploy production health check (`nexus smoke`) |

## hexcontent-adapter.js (NXS-1)

Connects Nexus to HexContent shuttle output. Full content pipeline:

```bash
node hexcontent-adapter.js fetch       # Scan source directory for new content
node hexcontent-adapter.js classify    # Classify items by house
node hexcontent-adapter.js stage       # Stage for review queue
node hexcontent-adapter.js import      # Import approved items to _app/houses/
node hexcontent-adapter.js pipeline    # Run full pipeline (fetch -> classify -> stage)
node hexcontent-adapter.js report      # Review queue summary
```

**Config:** Edit the `CONFIG` object at top of file to set source path, review queue path, and project root.

## Registration

Add new adapters to `nexus.config.json`:

```json
{
    "spokes": {
        "my-spoke": {
            "adapter": "./adapters/my-adapter.js",
            "dataPath": "path/to/data.json",
            "enabled": true
        }
    }
}
```
