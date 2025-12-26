/**
 * Hexworth Prime - House Index Audit Script
 *
 * Purpose: Compare files on disk vs SAMPLE_MODULES entries in house index.html
 * Detects: Pattern A (Files exist but not displayed) and broken hrefs
 *
 * Usage:
 *   node scripts/audit-house-indexes.js           # Audit all houses
 *   node scripts/audit-house-indexes.js shield    # Audit single house
 *   node scripts/audit-house-indexes.js --verbose # Show all details
 *
 * Created: December 26, 2025
 */

const fs = require('fs');
const path = require('path');

const HOUSES = ['web', 'shield', 'cloud', 'forge', 'script', 'code', 'key', 'eye'];
const args = process.argv.slice(2);
const targetHouse = args.find(a => !a.startsWith('--'));
const verbose = args.includes('--verbose') || args.includes('-v');

// Colors for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir, baseDir = dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...findHtmlFiles(fullPath, baseDir));
        } else if (item.name.endsWith('.html') && item.name !== 'index.html') {
            // Get relative path from house directory
            const relativePath = path.relative(baseDir, fullPath);
            files.push(relativePath);
        }
    }
    return files;
}

/**
 * Extract href values from SAMPLE_MODULES in index.html
 */
function extractIndexHrefs(indexPath) {
    if (!fs.existsSync(indexPath)) return [];

    const content = fs.readFileSync(indexPath, 'utf8');

    // Match href: 'path' or href: "path" patterns
    const hrefMatches = content.matchAll(/href:\s*['"]([^'"]+)['"]/g);
    const hrefs = [];

    for (const match of hrefMatches) {
        hrefs.push(match[1]);
    }

    return hrefs;
}

/**
 * Audit a single house
 */
function auditHouse(houseName) {
    const houseDir = path.join('./houses', houseName);
    const indexPath = path.join(houseDir, 'index.html');

    if (!fs.existsSync(houseDir)) {
        log('red', `  House directory not found: ${houseDir}`);
        return null;
    }

    // Get files on disk (excluding index.html)
    const filesOnDisk = findHtmlFiles(houseDir);

    // Get hrefs from index.html
    const indexHrefs = extractIndexHrefs(indexPath);

    // Find orphaned files (on disk but not in index)
    const orphanedFiles = filesOnDisk.filter(file => !indexHrefs.includes(file));

    // Find broken refs (in index but not on disk)
    const brokenRefs = indexHrefs.filter(href => {
        const fullPath = path.join(houseDir, href);
        return !fs.existsSync(fullPath);
    });

    return {
        house: houseName,
        filesOnDisk: filesOnDisk.length,
        indexEntries: indexHrefs.length,
        orphanedFiles,
        brokenRefs,
        status: orphanedFiles.length === 0 && brokenRefs.length === 0 ? 'OK' : 'ISSUES'
    };
}

/**
 * Main execution
 */
function main() {
    console.log('\n' + colors.bold + '=== HEXWORTH PRIME - HOUSE INDEX AUDIT ===' + colors.reset + '\n');

    const housesToAudit = targetHouse ? [targetHouse] : HOUSES;
    const results = [];
    let totalOrphaned = 0;
    let totalBroken = 0;

    for (const house of housesToAudit) {
        if (!HOUSES.includes(house)) {
            log('red', `Unknown house: ${house}`);
            log('yellow', `Valid houses: ${HOUSES.join(', ')}`);
            continue;
        }

        const result = auditHouse(house);
        if (result) {
            results.push(result);
            totalOrphaned += result.orphanedFiles.length;
            totalBroken += result.brokenRefs.length;
        }
    }

    // Summary table
    console.log('| House  | Files | Index | Orphaned | Broken | Status |');
    console.log('|--------|-------|-------|----------|--------|--------|');

    for (const r of results) {
        const statusColor = r.status === 'OK' ? 'green' : 'red';
        const statusIcon = r.status === 'OK' ? '✓' : '✗';
        console.log(
            `| ${r.house.padEnd(6)} | ${String(r.filesOnDisk).padStart(5)} | ${String(r.indexEntries).padStart(5)} | ` +
            `${colors[r.orphanedFiles.length > 0 ? 'yellow' : 'reset']}${String(r.orphanedFiles.length).padStart(8)}${colors.reset} | ` +
            `${colors[r.brokenRefs.length > 0 ? 'red' : 'reset']}${String(r.brokenRefs.length).padStart(6)}${colors.reset} | ` +
            `${colors[statusColor]}${statusIcon} ${r.status}${colors.reset} |`
        );
    }

    console.log('');

    // Detailed output for issues
    for (const r of results) {
        if (r.orphanedFiles.length > 0 || r.brokenRefs.length > 0 || verbose) {
            log('cyan', `\n--- ${r.house.toUpperCase()} HOUSE ---`);

            if (r.orphanedFiles.length > 0) {
                log('yellow', `\nOrphaned files (exist but not in SAMPLE_MODULES):`);
                for (const file of r.orphanedFiles) {
                    console.log(`  📄 ${file}`);
                }
            }

            if (r.brokenRefs.length > 0) {
                log('red', `\nBroken references (in index but file missing):`);
                for (const ref of r.brokenRefs) {
                    console.log(`  ❌ ${ref}`);
                }
            }

            if (verbose && r.orphanedFiles.length === 0 && r.brokenRefs.length === 0) {
                log('green', '  All files properly indexed!');
            }
        }
    }

    // Final summary
    console.log('\n' + colors.bold + '=== SUMMARY ===' + colors.reset);
    console.log(`Houses audited: ${results.length}`);
    console.log(`Total orphaned files: ${colors[totalOrphaned > 0 ? 'yellow' : 'green']}${totalOrphaned}${colors.reset}`);
    console.log(`Total broken refs: ${colors[totalBroken > 0 ? 'red' : 'green']}${totalBroken}${colors.reset}`);

    if (totalOrphaned === 0 && totalBroken === 0) {
        log('green', '\n✅ ALL HOUSES PASS AUDIT!\n');
    } else {
        log('yellow', '\n⚠️  Issues found - see details above\n');
        log('cyan', 'To fix orphaned files: Add entries to SAMPLE_MODULES in house index.html');
        log('cyan', 'To fix broken refs: Create missing files or remove invalid entries\n');
    }
}

// Run from _app directory
if (!fs.existsSync('./houses')) {
    log('red', 'Error: Must run from _app directory');
    log('yellow', 'Usage: cd _app && node scripts/audit-house-indexes.js');
    process.exit(1);
}

main();
