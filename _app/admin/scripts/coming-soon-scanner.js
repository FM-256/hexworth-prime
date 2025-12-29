/**
 * Coming Soon Scanner - Multi-Layer Detection
 *
 * Scans the Hexworth Prime codebase for "coming soon" content.
 * Uses full-text search instead of fragile regex extraction.
 *
 * Usage:
 *   node coming-soon-scanner.js           # Scan all houses
 *   node coming-soon-scanner.js --json    # Output as JSON
 *   node coming-soon-scanner.js code      # Scan specific house
 *
 * Created: 2025-12-28
 * Reason: Fix detection bug where template literals broke regex extraction
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    housesDir: path.join(__dirname, '../../houses'),
    houses: ['shield', 'web', 'cloud', 'forge', 'script', 'code', 'key', 'eye'],

    // Patterns to detect (case-insensitive)
    // Focused on ACTUAL "coming soon" content, not generic placeholders
    patterns: [
        /coming\s*soon/i,
        /not\s*yet\s*(available|implemented)/i
    ],

    // Files/directories to exclude (vendor libraries, etc.)
    excludePatterns: [
        /jquery/i,
        /\.hyperesources/i,
        /node_modules/i,
        /vendor/i,
        /\.min\.js$/i
    ],

    // File extensions to scan
    extensions: ['.html'],  // Only HTML for now - JS libraries cause too much noise

    // Context extraction (lines before/after match)
    contextLines: 3
};

// Results storage
const results = {
    summary: {
        totalFiles: 0,
        filesWithMatches: 0,
        totalMatches: 0,
        byHouse: {},
        byCategory: {
            learningPaths: 0,
            moduleHandlers: 0,
            quizFeatures: 0,
            staticHtml: 0,
            other: 0
        }
    },
    matches: []
};

/**
 * Categorize a match based on context
 */
function categorizeMatch(line, context) {
    const fullContext = context.join('\n').toLowerCase();

    if (fullContext.includes('openpath') || fullContext.includes('learning path')) {
        return 'learningPaths';
    }
    if (fullContext.includes('module') && fullContext.includes('onclick')) {
        return 'moduleHandlers';
    }
    if (fullContext.includes('quiz') || fullContext.includes('animation') || fullContext.includes('feature')) {
        return 'quizFeatures';
    }
    if (line.includes('<h') || line.includes('<p') || line.includes('<div')) {
        return 'staticHtml';
    }
    return 'other';
}

/**
 * Extract identifier from context (module name, path id, etc.)
 */
function extractIdentifier(context) {
    const fullContext = context.join('\n');

    // Try to find openPath('id')
    const pathMatch = fullContext.match(/openPath\(['"]([^'"]+)['"]\)/);
    if (pathMatch) return { type: 'path', id: pathMatch[1] };

    // Try to find path-name class content
    const pathNameMatch = fullContext.match(/class="path-name">([^<]+)</);
    if (pathNameMatch) return { type: 'path', id: pathNameMatch[1] };

    // Try to find module id
    const moduleIdMatch = fullContext.match(/id:\s*['"]([^'"]+)['"]/);
    if (moduleIdMatch) return { type: 'module', id: moduleIdMatch[1] };

    // Try to find title
    const titleMatch = fullContext.match(/title:\s*['"]([^'"]+)['"]/);
    if (titleMatch) return { type: 'module', id: titleMatch[1] };

    // Try to find button text
    const buttonMatch = fullContext.match(/<button[^>]*>([^<]+)</);
    if (buttonMatch) return { type: 'button', id: buttonMatch[1].trim() };

    return { type: 'unknown', id: null };
}

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath) {
    for (const pattern of CONFIG.excludePatterns) {
        if (pattern.test(filePath)) {
            return true;
        }
    }
    return false;
}

/**
 * Scan a single file for patterns
 */
function scanFile(filePath, house) {
    // Skip excluded files
    if (shouldExclude(filePath)) {
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(CONFIG.housesDir, filePath);

    results.summary.totalFiles++;
    let fileHasMatch = false;

    lines.forEach((line, index) => {
        for (const pattern of CONFIG.patterns) {
            if (pattern.test(line)) {
                fileHasMatch = true;
                results.summary.totalMatches++;

                // Get context
                const startLine = Math.max(0, index - CONFIG.contextLines);
                const endLine = Math.min(lines.length - 1, index + CONFIG.contextLines);
                const context = lines.slice(startLine, endLine + 1);

                // Categorize
                const category = categorizeMatch(line, context);
                results.summary.byCategory[category]++;

                // Extract identifier
                const identifier = extractIdentifier(context);

                // Store match
                results.matches.push({
                    house: house,
                    file: relativePath,
                    line: index + 1,
                    category: category,
                    identifier: identifier,
                    matchedPattern: pattern.toString(),
                    text: line.trim(),
                    context: context.map(l => l.trim())
                });

                break; // Only count each line once
            }
        }
    });

    if (fileHasMatch) {
        results.summary.filesWithMatches++;
    }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir, house) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullPath, house);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (CONFIG.extensions.includes(ext)) {
                scanFile(fullPath, house);
            }
        }
    }
}

/**
 * Main scan function
 */
function scan(targetHouse = null) {
    const housesToScan = targetHouse
        ? [targetHouse]
        : CONFIG.houses;

    console.log('Coming Soon Scanner');
    console.log('===================\n');

    for (const house of housesToScan) {
        const houseDir = path.join(CONFIG.housesDir, house);
        if (fs.existsSync(houseDir)) {
            console.log(`Scanning ${house}...`);
            results.summary.byHouse[house] = 0;

            const beforeCount = results.summary.totalMatches;
            scanDirectory(houseDir, house);
            results.summary.byHouse[house] = results.summary.totalMatches - beforeCount;
        }
    }

    return results;
}

/**
 * Format results for console output
 */
function formatResults(results) {
    let output = '\n';
    output += '=== SCAN COMPLETE ===\n\n';

    output += 'Summary:\n';
    output += `  Files scanned: ${results.summary.totalFiles}\n`;
    output += `  Files with matches: ${results.summary.filesWithMatches}\n`;
    output += `  Total matches: ${results.summary.totalMatches}\n\n`;

    output += 'By House:\n';
    for (const [house, count] of Object.entries(results.summary.byHouse)) {
        if (count > 0) {
            output += `  ${house}: ${count}\n`;
        }
    }

    output += '\nBy Category:\n';
    for (const [category, count] of Object.entries(results.summary.byCategory)) {
        if (count > 0) {
            output += `  ${category}: ${count}\n`;
        }
    }

    output += '\n=== DETAILED MATCHES ===\n';

    // Group by house
    const byHouse = {};
    for (const match of results.matches) {
        if (!byHouse[match.house]) byHouse[match.house] = [];
        byHouse[match.house].push(match);
    }

    for (const [house, matches] of Object.entries(byHouse)) {
        output += `\n[${house.toUpperCase()}] ${matches.length} matches:\n`;

        for (const match of matches) {
            output += `  Line ${match.line}: ${match.file}\n`;
            output += `    Category: ${match.category}\n`;
            if (match.identifier.id) {
                output += `    Identifier: ${match.identifier.type} = "${match.identifier.id}"\n`;
            }
            output += `    Text: ${match.text.substring(0, 80)}${match.text.length > 80 ? '...' : ''}\n`;
        }
    }

    return output;
}

// CLI execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const jsonOutput = args.includes('--json');
    const targetHouse = args.find(a => CONFIG.houses.includes(a));

    const results = scan(targetHouse);

    if (jsonOutput) {
        console.log(JSON.stringify(results, null, 2));
    } else {
        console.log(formatResults(results));
    }
}

module.exports = { scan, CONFIG };
