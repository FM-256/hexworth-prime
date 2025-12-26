/**
 * Hexworth Prime - Category Property Audit Script
 *
 * Purpose: Verify all SAMPLE_MODULES entries have required properties
 * Detects: Pattern B (Content missing from category filter)
 *
 * Usage:
 *   node scripts/audit-categories.js           # Audit all houses
 *   node scripts/audit-categories.js shield    # Audit single house
 *   node scripts/audit-categories.js --fix     # Show fix suggestions
 *
 * Created: December 26, 2025
 */

const fs = require('fs');
const path = require('path');

const HOUSES = ['web', 'shield', 'cloud', 'forge', 'script', 'code', 'key', 'eye'];
const args = process.argv.slice(2);
const targetHouse = args.find(a => !a.startsWith('--'));
const showFix = args.includes('--fix') || args.includes('-f');

// Colors for terminal output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract SAMPLE_MODULES entries from index.html
 */
function extractModuleEntries(indexPath) {
    if (!fs.existsSync(indexPath)) return { entries: [], categories: [] };

    const content = fs.readFileSync(indexPath, 'utf8');

    // Extract CATEGORIES array to get valid category IDs
    const categoriesMatch = content.match(/const CATEGORIES\s*=\s*\[([\s\S]*?)\];/);
    const validCategories = [];
    if (categoriesMatch) {
        const catMatches = categoriesMatch[1].matchAll(/id:\s*['"]([^'"]+)['"]/g);
        for (const match of catMatches) {
            validCategories.push(match[1]);
        }
    }

    // Extract individual module entries
    // Match patterns like: {id: 'xxx', title: 'xxx', ... }
    const entries = [];
    const moduleLines = content.split('\n');

    for (let i = 0; i < moduleLines.length; i++) {
        const line = moduleLines[i];

        // Look for lines that start a module entry
        if (line.includes("{id:") || line.includes("{ id:")) {
            const entry = {
                line: i + 1,
                raw: line.trim(),
                properties: {}
            };

            // Extract id
            const idMatch = line.match(/id:\s*['"]([^'"]+)['"]/);
            if (idMatch) entry.properties.id = idMatch[1];

            // Extract title
            const titleMatch = line.match(/title:\s*['"]([^'"]+)['"]/);
            if (titleMatch) entry.properties.title = titleMatch[1];

            // Extract category
            const categoryMatch = line.match(/category:\s*['"]([^'"]+)['"]/);
            if (categoryMatch) entry.properties.category = categoryMatch[1];

            // Extract href
            const hrefMatch = line.match(/href:\s*['"]([^'"]+)['"]/);
            if (hrefMatch) entry.properties.href = hrefMatch[1];

            // Extract status
            const statusMatch = line.match(/status:\s*['"]([^'"]+)['"]/);
            if (statusMatch) entry.properties.status = statusMatch[1];

            // Check if it's a multi-line entry (look for category on next lines)
            if (!entry.properties.category) {
                // Check next few lines for category
                for (let j = 1; j <= 5 && i + j < moduleLines.length; j++) {
                    const nextLine = moduleLines[i + j];
                    const catMatch = nextLine.match(/category:\s*['"]([^'"]+)['"]/);
                    if (catMatch) {
                        entry.properties.category = catMatch[1];
                        break;
                    }
                    // Stop if we hit another entry or closing bracket
                    if (nextLine.includes("{id:") || nextLine.trim() === '},' || nextLine.trim() === '}') {
                        break;
                    }
                }
            }

            if (entry.properties.id) {
                entries.push(entry);
            }
        }
    }

    return { entries, categories: validCategories };
}

/**
 * Audit a single house
 */
function auditHouse(houseName) {
    const indexPath = path.join('./houses', houseName, 'index.html');

    if (!fs.existsSync(indexPath)) {
        log('red', `  Index not found: ${indexPath}`);
        return null;
    }

    const { entries, categories } = extractModuleEntries(indexPath);

    const missingCategory = entries.filter(e => !e.properties.category);
    const invalidCategory = entries.filter(e =>
        e.properties.category && !categories.includes(e.properties.category)
    );
    const missingStatus = entries.filter(e => !e.properties.status);
    const missingHref = entries.filter(e => !e.properties.href);

    return {
        house: houseName,
        totalEntries: entries.length,
        validCategories: categories,
        issues: {
            missingCategory,
            invalidCategory,
            missingStatus,
            missingHref
        },
        status: missingCategory.length === 0 && invalidCategory.length === 0 ? 'OK' : 'ISSUES'
    };
}

/**
 * Suggest category based on href path
 */
function suggestCategory(href, validCategories) {
    if (!href) return 'fundamentals';

    const pathLower = href.toLowerCase();

    // Map common path patterns to categories
    const mappings = [
        { patterns: ['threat', 'attack', 'malware', 'phishing', 'injection', 'xss', 'osint', 'pentest'], category: 'threats' },
        { patterns: ['crypto', 'hash', 'encrypt', 'pki', 'rsa', 'block', 'stego'], category: 'cryptography' },
        { patterns: ['network', 'firewall', 'vpn', 'ids', 'ips', 'wireless', 'protocol'], category: 'network-security' },
        { patterns: ['access', 'auth', 'kerberos', 'biometric', 'mfa'], category: 'access-control' },
        { patterns: ['risk', 'compliance', 'cmmc', 'policy', 'incident', 'config'], category: 'risk-management' },
        { patterns: ['fundamental', 'career', 'ethics', 'control', 'privacy', 'game'], category: 'fundamentals' }
    ];

    for (const mapping of mappings) {
        for (const pattern of mapping.patterns) {
            if (pathLower.includes(pattern)) {
                // Verify this category exists in the house
                if (validCategories.includes(mapping.category)) {
                    return mapping.category;
                }
            }
        }
    }

    // Default to first available category
    return validCategories[0] || 'fundamentals';
}

/**
 * Main execution
 */
function main() {
    console.log('\n' + colors.bold + '=== HEXWORTH PRIME - CATEGORY PROPERTY AUDIT ===' + colors.reset + '\n');

    const housesToAudit = targetHouse ? [targetHouse] : HOUSES;
    const results = [];
    let totalMissingCategory = 0;
    let totalInvalidCategory = 0;

    for (const house of housesToAudit) {
        if (!HOUSES.includes(house)) {
            log('red', `Unknown house: ${house}`);
            continue;
        }

        const result = auditHouse(house);
        if (result) {
            results.push(result);
            totalMissingCategory += result.issues.missingCategory.length;
            totalInvalidCategory += result.issues.invalidCategory.length;
        }
    }

    // Summary table
    console.log('| House  | Entries | Missing Cat | Invalid Cat | Status |');
    console.log('|--------|---------|-------------|-------------|--------|');

    for (const r of results) {
        const statusColor = r.status === 'OK' ? 'green' : 'red';
        const statusIcon = r.status === 'OK' ? '✓' : '✗';
        const missingColor = r.issues.missingCategory.length > 0 ? 'yellow' : 'reset';
        const invalidColor = r.issues.invalidCategory.length > 0 ? 'red' : 'reset';

        console.log(
            `| ${r.house.padEnd(6)} | ${String(r.totalEntries).padStart(7)} | ` +
            `${colors[missingColor]}${String(r.issues.missingCategory.length).padStart(11)}${colors.reset} | ` +
            `${colors[invalidColor]}${String(r.issues.invalidCategory.length).padStart(11)}${colors.reset} | ` +
            `${colors[statusColor]}${statusIcon} ${r.status.padEnd(4)}${colors.reset} |`
        );
    }

    console.log('');

    // Detailed output
    for (const r of results) {
        const hasIssues = r.issues.missingCategory.length > 0 || r.issues.invalidCategory.length > 0;

        if (hasIssues) {
            log('cyan', `\n--- ${r.house.toUpperCase()} HOUSE ---`);
            log('blue', `Valid categories: ${r.validCategories.join(', ')}`);

            if (r.issues.missingCategory.length > 0) {
                log('yellow', `\nEntries MISSING category property (${r.issues.missingCategory.length}):`);
                for (const entry of r.issues.missingCategory) {
                    console.log(`  Line ${entry.line}: ${entry.properties.id || 'unknown'}`);
                    if (entry.properties.title) {
                        console.log(`    Title: "${entry.properties.title}"`);
                    }
                    if (showFix && entry.properties.href) {
                        const suggested = suggestCategory(entry.properties.href, r.validCategories);
                        log('magenta', `    Suggested: category: '${suggested}'`);
                    }
                }
            }

            if (r.issues.invalidCategory.length > 0) {
                log('red', `\nEntries with INVALID category (${r.issues.invalidCategory.length}):`);
                for (const entry of r.issues.invalidCategory) {
                    console.log(`  Line ${entry.line}: ${entry.properties.id}`);
                    console.log(`    Has: "${entry.properties.category}" (not in CATEGORIES array)`);
                }
            }
        }
    }

    // Final summary
    console.log('\n' + colors.bold + '=== SUMMARY ===' + colors.reset);
    console.log(`Houses audited: ${results.length}`);
    console.log(`Missing category: ${colors[totalMissingCategory > 0 ? 'yellow' : 'green']}${totalMissingCategory}${colors.reset}`);
    console.log(`Invalid category: ${colors[totalInvalidCategory > 0 ? 'red' : 'green']}${totalInvalidCategory}${colors.reset}`);

    if (totalMissingCategory === 0 && totalInvalidCategory === 0) {
        log('green', '\n✅ ALL ENTRIES HAVE VALID CATEGORIES!\n');
    } else {
        log('yellow', '\n⚠️  Issues found - see details above');
        if (!showFix) {
            log('cyan', 'Run with --fix flag to see suggested category assignments\n');
        } else {
            console.log('');
        }
    }
}

// Run from _app directory
if (!fs.existsSync('./houses')) {
    log('red', 'Error: Must run from _app directory');
    log('yellow', 'Usage: cd _app && node scripts/audit-categories.js');
    process.exit(1);
}

main();
