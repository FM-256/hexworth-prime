/**
 * Content Registry Audit Script
 * Usage: node scripts/audit-registry.js
 *
 * Verifies all file paths in content-registry.js exist on disk.
 */

const fs = require('fs');
const path = require('path');

// Read content-registry.js
const registryPath = './config/content-registry.js';
if (!fs.existsSync(registryPath)) {
    console.error('ERROR: content-registry.js not found!');
    console.error('Run this from the _app/ directory.');
    process.exit(1);
}

const registryContent = fs.readFileSync(registryPath, 'utf8');

// Extract all file paths from components sections
const pathMatches = registryContent.matchAll(/(?:presentation|applet|lab|quiz):\s*['"]([^'"]+)['"]/g);

const paths = [];
for (const match of pathMatches) {
    paths.push(match[1]);
}

// Check each path
const missing = [];
const exists = [];

paths.forEach(p => {
    const fullPath = path.join('.', p);
    if (fs.existsSync(fullPath)) {
        exists.push(p);
    } else {
        // Check if it's a directory reference
        if (p.endsWith('/')) {
            const dirPath = path.join('.', p);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                exists.push(p);
            } else {
                missing.push(p);
            }
        } else {
            missing.push(p);
        }
    }
});

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║              CONTENT REGISTRY AUDIT REPORT                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('Total paths referenced: ' + paths.length);
console.log('Existing:               ' + exists.length);
console.log('MISSING:                ' + missing.length);

if (missing.length > 0) {
    console.log('');
    console.log('══════════════ MISSING FILES ══════════════');
    console.log('');
    missing.forEach(p => console.log('  ❌ ' + p));
    console.log('');
    console.log('ACTION REQUIRED: Fix content-registry.js or create missing files.');
    process.exit(1);
} else {
    console.log('');
    console.log('✅ ALL PATHS VERIFIED - No broken references!');
    console.log('');
    process.exit(0);
}
