#!/usr/bin/env node
/**
 * merge-registry.js
 *
 * Merges migrated entries into the main content-registry.js
 *
 * Usage: node scripts/merge-registry.js
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..');
const REGISTRY_PATH = path.join(APP_DIR, 'config', 'content-registry.js');
const MIGRATED_PATH = path.join(APP_DIR, 'config', 'content-registry-migrated.js');
const OUTPUT_PATH = path.join(APP_DIR, 'config', 'content-registry-merged.js');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Merging ContentRegistry');
console.log('═══════════════════════════════════════════════════════════\n');

// Read both files
const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
const migratedContent = fs.readFileSync(MIGRATED_PATH, 'utf8');

// Extract the migrated entries (between MIGRATED_ENTRIES = { and };)
const migratedMatch = migratedContent.match(/MIGRATED_ENTRIES\s*=\s*\{([\s\S]*)\};/);
if (!migratedMatch) {
    console.error('<img src="/assets/images/icons/icon-crossmark.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Could not extract migrated entries');
    process.exit(1);
}

const newEntriesCode = migratedMatch[1].trim();

// Find the end of the content object in the original registry
// Look for the pattern: closing brace followed by the next section (paths or methods)
const insertPoint = registryContent.search(/\n\s*\},\s*\n\s*\/\/\s*═+\s*\n\s*\/\/\s*LEARNING PATHS/);

if (insertPoint === -1) {
    console.error('<img src="/assets/images/icons/icon-crossmark.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Could not find insertion point in content-registry.js');
    console.log('   Looking for the LEARNING PATHS section...');
    process.exit(1);
}

// Build the merged content
const beforeInsert = registryContent.substring(0, insertPoint);
const afterInsert = registryContent.substring(insertPoint);

// Add a comma after the last existing entry and insert new entries
const mergedContent = beforeInsert + ',\n\n' + newEntriesCode + afterInsert;

// Write merged file
fs.writeFileSync(OUTPUT_PATH, mergedContent);

console.log(`<img src="/assets/images/icons/icon-checkbox.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Merged file written to: ${OUTPUT_PATH}`);
console.log('\n<img src="/assets/images/icons/icon-clipboard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Next steps:');
console.log('   1. Review content-registry-merged.js');
console.log('   2. Replace content-registry.js with the merged version');
console.log('   3. Deploy and verify');
console.log('');

// Count entries in merged file
const entryCount = (mergedContent.match(/'[a-z]+-[a-z0-9-]+':\s*\{/g) || []).length;
console.log(`<img src="/assets/images/icons/icon-barchart.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Total entries in merged file: ${entryCount}`);
