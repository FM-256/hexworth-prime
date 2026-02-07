/**
 * EduScan - Reorganization Mapper
 *
 * Analyzes files with directory/suffix mismatch and plans moves
 * to proper directories.
 *
 * Usage:
 *   node reorg-mapper.js [--dry-run] [--output FILE]
 *
 * Created: 2026-02-07
 */

const fs = require('fs');
const path = require('path');

// Content type to directory mapping
const TYPE_TO_DIR = {
    presentation: 'presentations',
    quiz: 'quizzes',
    lab: 'labs',
    applet: 'applets',
    module: 'modules',
    tool: 'tools',
    simulator: 'simulators',
    reference: 'references',
    exam: 'exams'
};

// Valid houses
const VALID_HOUSES = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];

class ReorgMapper {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.outputPath = options.outputPath || './_tools/reports/REORG_MAP.json';
    }

    /**
     * Extract file type from filename suffix
     */
    extractTypeFromFilename(filename) {
        const match = filename.match(/\.([a-z]+)\.html$/i);
        return match ? match[1].toLowerCase() : null;
    }

    /**
     * Extract type from directory path
     */
    extractTypeFromPath(filePath) {
        const patterns = {
            presentation: /\/presentations?\//i,
            quiz: /\/quizzes?\//i,
            lab: /\/labs?\//i,
            applet: /\/applets?\//i,
            module: /\/modules?\//i,
            tool: /\/tools?\//i,
            simulator: /\/simulators?\//i,
            reference: /\/references?\//i,
            exam: /\/exams?\//i
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(filePath)) {
                return type;
            }
        }
        return null;
    }

    /**
     * Extract house from path
     */
    extractHouse(filePath) {
        const match = filePath.match(/houses\/([^/]+)\//);
        if (match && VALID_HOUSES.includes(match[1])) {
            return match[1];
        }
        return null;
    }

    /**
     * Calculate new path for a file based on its actual type
     */
    calculateNewPath(filePath, fileType, house) {
        const filename = path.basename(filePath);
        const targetDir = TYPE_TO_DIR[fileType];

        if (!targetDir || !house) {
            return null;
        }

        // New path: houses/{house}/{type-dir}/{filename}
        return `houses/${house}/${targetDir}/${filename}`;
    }

    /**
     * Scan for files with directory/suffix mismatch
     */
    scan() {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║           EDUSCAN - Reorganization Mapper                     ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log('');

        const moves = [];
        const issues = [];
        const stats = {
            scanned: 0,
            mismatched: 0,
            byType: {}
        };

        // Find all HTML files in houses
        const findFiles = (dir) => {
            const results = [];
            const items = fs.readdirSync(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                if (item.isDirectory()) {
                    results.push(...findFiles(fullPath));
                } else if (item.name.endsWith('.html')) {
                    results.push(fullPath);
                }
            }
            return results;
        };

        const housesDir = path.join(this.rootPath, 'houses');
        const files = findFiles(housesDir);
        stats.scanned = files.length;

        console.log(`[SCAN] Found ${files.length} HTML files in houses/\n`);

        for (const fullPath of files) {
            // Remove ./_app/ or _app/ prefix to get path relative to _app
            const relativePath = fullPath.replace(/^\.?\/?_app\//, '');
            const filename = path.basename(fullPath);

            const fileType = this.extractTypeFromFilename(filename);
            const pathType = this.extractTypeFromPath(relativePath);
            const house = this.extractHouse(relativePath);

            // Skip if no type suffix or types match
            if (!fileType || !pathType || fileType === pathType) {
                continue;
            }

            // Found a mismatch
            stats.mismatched++;
            const key = `${pathType} → ${fileType}`;
            stats.byType[key] = (stats.byType[key] || 0) + 1;

            const newPath = this.calculateNewPath(relativePath, fileType, house);

            if (newPath && newPath !== relativePath) {
                moves.push({
                    oldPath: relativePath,
                    newPath: newPath,
                    filename: filename,
                    house: house,
                    fromType: pathType,
                    toType: fileType,
                    reason: `File suffix .${fileType}.html doesn't match ${pathType}/ directory`
                });

                if (this.verbose) {
                    console.log(`  [MOVE] ${relativePath}`);
                    console.log(`      → ${newPath}`);
                }
            }
        }

        // Summary
        console.log('════════════════════════════════════════════════════════════════');
        console.log('SUMMARY');
        console.log('════════════════════════════════════════════════════════════════');
        console.log(`  Files Scanned:    ${stats.scanned}`);
        console.log(`  Mismatches Found: ${stats.mismatched}`);
        console.log(`  Moves Planned:    ${moves.length}`);
        console.log('');
        console.log('By Type Migration:');
        Object.entries(stats.byType)
            .sort((a, b) => b[1] - a[1])
            .forEach(([key, count]) => {
                console.log(`    ${count.toString().padStart(3)}x ${key}`);
            });

        // Group by house
        const byHouse = {};
        moves.forEach(m => {
            byHouse[m.house] = (byHouse[m.house] || 0) + 1;
        });

        console.log('');
        console.log('By House:');
        Object.entries(byHouse)
            .sort((a, b) => b[1] - a[1])
            .forEach(([house, count]) => {
                console.log(`    ${count.toString().padStart(3)}x ${house}`);
            });

        // Save map
        const output = {
            generated: new Date().toISOString(),
            stats: stats,
            moves: moves
        };

        fs.writeFileSync(this.outputPath, JSON.stringify(output, null, 2));
        console.log(`\n[SAVED] ${this.outputPath}`);
        console.log(`        ${moves.length} moves ready to apply`);

        return output;
    }
}

// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const verbose = args.includes('--verbose') || args.includes('-v');

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
EduScan Reorganization Mapper

Usage: node reorg-mapper.js [options]

Options:
  -v, --verbose    Show each planned move
  -h, --help       Show this help message

This tool analyzes files with directory/suffix mismatch and plans moves.
Output is saved to _tools/reports/REORG_MAP.json
        `);
        process.exit(0);
    }

    const mapper = new ReorgMapper({ verbose });
    mapper.scan();
}

module.exports = ReorgMapper;
