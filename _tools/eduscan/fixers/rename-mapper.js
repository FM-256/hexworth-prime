#!/usr/bin/env node

/**
 * EduScan - Rename Mapper Tool
 *
 * Scans HTML files in _app/houses/ and generates a rename mapping to
 * standardize file naming using the convention:
 *   {house}-{name}.{type}.html
 *
 * All names are lowercase, kebab-case.
 *
 * Types detected: presentation, quiz, lab, applet, tool, module, exam, simulator
 *
 * Usage:
 *   node rename-mapper.js [--dry-run] [--verbose] [--output <path>]
 *
 * Created: 2026-02-07
 */

const fs = require('fs');
const path = require('path');

class RenameMapper {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.dryRun = options.dryRun || false;
        this.rootPath = options.rootPath || './_app';
        this.housesPath = options.housesPath || 'houses';
        this.outputPath = options.outputPath || './_tools/reports/RENAME_MAP.json';

        // Known houses (from directory structure)
        this.knownHouses = ['cloud', 'code', 'dark-arts', 'eye', 'forge', 'key', 'script', 'shield', 'web'];

        // Type detection patterns (priority order)
        this.typePatterns = [
            { type: 'presentation', patterns: [/presentations?[\/\\]/i, /-presentation\.html$/i, /_presentation\.html$/i] },
            { type: 'quiz', patterns: [/quizzes?[\/\\]/i, /-quiz\.html$/i, /_quiz\.html$/i, /quiz\.html$/i] },
            { type: 'lab', patterns: [/labs?[\/\\]/i, /-lab\.html$/i, /_lab\.html$/i, /lab\.html$/i] },
            { type: 'exam', patterns: [/exams?[\/\\]/i, /-exam\.html$/i, /_exam\.html$/i, /exam[_-]?/i] },
            { type: 'tool', patterns: [/tools?[\/\\]/i, /-training\.html$/i, /-calculator\.html$/i, /-visualizer\.html$/i, /-explorer\.html$/i, /-analyzer\.html$/i, /-simulator\.html$/i, /-inspector\.html$/i, /-workbench\.html$/i, /-engine\.html$/i] },
            { type: 'simulator', patterns: [/simulators?[\/\\]/i, /-simulator\.html$/i] },
            { type: 'module', patterns: [/modules?[\/\\]/i, /-module\.html$/i, /-immersive-/i, /-flashcards\.html$/i] },
            { type: 'applet', patterns: [/applets?[\/\\]/i] },
            { type: 'reference', patterns: [/-reference\.html$/i, /-guide\.html$/i] },
            { type: 'textbook', patterns: [/textbook[\/\\]/i, /-textbook\.html$/i] }
        ];

        // Files to skip (index pages, special files)
        this.skipPatterns = [
            /^index\.html$/i,
            /^evaluation\.html$/i,
            /README/i
        ];
    }

    /**
     * Scan all HTML files in the houses directory
     * @returns {Array} List of file objects
     */
    scanFiles() {
        const housesDir = path.resolve(this.rootPath, this.housesPath);
        const files = [];

        if (!fs.existsSync(housesDir)) {
            console.error(`[ERROR] Houses directory not found: ${housesDir}`);
            return files;
        }

        this.walkDirectory(housesDir, files, housesDir);
        return files;
    }

    /**
     * Recursively walk directory and collect HTML files
     */
    walkDirectory(dir, files, baseDir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                this.walkDirectory(fullPath, files, baseDir);
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                const relativePath = path.relative(baseDir, fullPath);
                files.push({
                    absolutePath: fullPath,
                    relativePath: relativePath,
                    fileName: entry.name,
                    directory: path.dirname(relativePath)
                });
            }
        }
    }

    /**
     * Determine the house from the file path
     * @param {string} relativePath Path relative to houses/
     * @returns {string|null} House name or null
     */
    detectHouse(relativePath) {
        const parts = relativePath.split(path.sep);
        if (parts.length > 0 && this.knownHouses.includes(parts[0])) {
            return parts[0];
        }
        return null;
    }

    /**
     * Determine the content type from path and filename
     * @param {string} relativePath Full relative path
     * @param {string} fileName Just the filename
     * @returns {string} Detected type
     */
    detectType(relativePath, fileName) {
        const fullPath = relativePath.toLowerCase();
        const name = fileName.toLowerCase();

        // Check each type pattern
        for (const { type, patterns } of this.typePatterns) {
            for (const pattern of patterns) {
                if (pattern.test(fullPath) || pattern.test(name)) {
                    return type;
                }
            }
        }

        // Default fallback
        return 'applet';
    }

    /**
     * Convert a filename to kebab-case
     * @param {string} name The filename (without extension)
     * @returns {string} Kebab-case version
     */
    toKebabCase(name) {
        return name
            // Handle transitions from lowercase/digit to uppercase (camelCase, or after number)
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            // Handle transitions from uppercase letters to lowercase (for acronyms like HTTPServer -> HTTP-Server)
            // But NOT for short acronyms followed by version (ACv2 -> acv2, not a-cv2)
            .replace(/([A-Z]{2,})([A-Z][a-z])/g, '$1-$2')
            // Replace underscores and spaces with dashes
            .replace(/[_\s]+/g, '-')
            // Remove any non-alphanumeric except dashes
            .replace(/[^a-zA-Z0-9-]/g, '')
            // Replace multiple dashes with single dash
            .replace(/-+/g, '-')
            // Remove leading/trailing dashes
            .replace(/^-|-$/g, '')
            // Lowercase
            .toLowerCase();
    }

    /**
     * Extract the base name from a filename (removing type suffixes, etc.)
     * @param {string} fileName The filename
     * @param {string} type The detected type
     * @param {string} house Optional house name to strip from prefix
     * @returns {string} Clean base name
     */
    extractBaseName(fileName, type, house = null) {
        // Remove .html extension
        let name = fileName.replace(/\.html$/i, '');

        // Remove type suffix if present (including .type pattern)
        const typeSuffixes = [
            '.presentation', '.quiz', '.lab', '.exam', '.applet', '.tool',
            '.module', '.simulator', '.reference', '.textbook',
            '-presentation', '_presentation',
            '-quiz', '_quiz',
            '-lab', '_lab',
            '-exam', '_exam',
            '-applet', '_applet',
            '-visualizer', '_visualizer',
            '-explorer', '_explorer',
            '-simulator', '_simulator',
            '-training', '_training',
            '-calculator', '_calculator',
            '-analyzer', '_analyzer',
            '-reference', '_reference',
            '-guide', '_guide',
            '-module', '_module',
            '-textbook', '_textbook',
            '-inspector', '_inspector',
            '-workbench', '_workbench',
            '-engine', '_engine'
        ];

        for (const suffix of typeSuffixes) {
            if (name.toLowerCase().endsWith(suffix)) {
                name = name.slice(0, -suffix.length);
                break;
            }
        }

        let result = this.toKebabCase(name);

        // Remove house prefix if it exists
        if (house && result.startsWith(`${house}-`)) {
            result = result.substring(house.length + 1);
        }

        return result;
    }

    /**
     * Check if a file should be skipped
     * @param {string} fileName The filename
     * @returns {boolean} True if should skip
     */
    shouldSkip(fileName) {
        return this.skipPatterns.some(pattern => pattern.test(fileName));
    }

    /**
     * Check if a filename already follows the convention
     * @param {string} fileName Current filename
     * @param {string} house House name
     * @param {string} type Content type
     * @returns {boolean} True if compliant
     */
    isCompliant(fileName, house, type) {
        // Pattern: {house}-{name}.{type}.html
        const pattern = new RegExp(`^${house}-[a-z0-9-]+\\.${type}\\.html$`);
        return pattern.test(fileName);
    }

    /**
     * Generate the new filename following the convention
     * @param {Object} file File object
     * @param {string} house House name
     * @param {string} type Content type
     * @returns {string} New filename
     */
    generateNewName(file, house, type) {
        const cleanName = this.extractBaseName(file.fileName, type, house);

        // Handle empty name edge case
        if (!cleanName) {
            // Use parent directory name as fallback
            const parts = file.directory.split(path.sep);
            return `${house}-${this.toKebabCase(parts[parts.length - 1])}.${type}.html`;
        }

        return `${house}-${cleanName}.${type}.html`;
    }

    /**
     * Generate the module ID for a file
     * @param {string} fileName The filename
     * @param {string} house House name
     * @param {string} type Content type
     * @returns {string} Module ID in format house-name
     */
    generateModuleId(fileName, house, type) {
        const baseName = this.extractBaseName(fileName, type, house);
        return baseName ? `${house}-${baseName}` : house;
    }

    /**
     * Main mapping function
     * @returns {Object} Mapping results
     */
    generateMapping() {
        const results = {
            generated: new Date().toISOString(),
            stats: {
                total: 0,
                needsRename: 0,
                alreadyCompliant: 0,
                skipped: 0,
                conflicts: 0
            },
            renames: [],
            compliant: [],
            skipped: [],
            conflicts: []
        };

        const files = this.scanFiles();
        results.stats.total = files.length;

        if (this.verbose) {
            console.log(`[MAPPER] Found ${files.length} HTML files in houses/`);
        }

        // Track new names for conflict detection
        const newNameMap = new Map(); // newName -> [files that would have this name]

        for (const file of files) {
            // Check if should skip
            if (this.shouldSkip(file.fileName)) {
                results.stats.skipped++;
                results.skipped.push({
                    path: file.relativePath,
                    reason: 'Special file (index, evaluation, etc.)'
                });
                continue;
            }

            const house = this.detectHouse(file.relativePath);
            if (!house) {
                results.stats.skipped++;
                results.skipped.push({
                    path: file.relativePath,
                    reason: 'Could not detect house'
                });
                continue;
            }

            const type = this.detectType(file.relativePath, file.fileName);
            const newName = this.generateNewName(file, house, type);
            const newPath = path.join(file.directory, newName);

            // Track for conflict detection
            const newNameKey = newPath.toLowerCase();
            if (!newNameMap.has(newNameKey)) {
                newNameMap.set(newNameKey, []);
            }
            newNameMap.get(newNameKey).push({
                file: file,
                house: house,
                type: type,
                newName: newName,
                newPath: newPath
            });

            const moduleId = this.generateModuleId(file.fileName, house, type);

            // Check if already compliant
            if (this.isCompliant(file.fileName, house, type)) {
                results.stats.alreadyCompliant++;
                results.compliant.push({
                    path: file.relativePath,
                    name: file.fileName,
                    moduleId: moduleId,
                    type: type,
                    house: house
                });
            } else if (file.fileName.toLowerCase() === newName.toLowerCase()) {
                // Already correct except for case (or trivially different)
                results.stats.alreadyCompliant++;
                results.compliant.push({
                    path: file.relativePath,
                    name: file.fileName,
                    moduleId: moduleId,
                    type: type,
                    house: house
                });
            } else {
                results.stats.needsRename++;
                results.renames.push({
                    oldPath: file.relativePath,
                    newPath: newPath,
                    oldName: file.fileName,
                    newName: newName,
                    moduleId: moduleId,
                    type: type,
                    house: house
                });
            }
        }

        // Detect conflicts
        for (const [newPath, entries] of newNameMap) {
            if (entries.length > 1) {
                results.stats.conflicts++;
                results.conflicts.push({
                    proposedNewPath: entries[0].newPath,
                    conflictingFiles: entries.map(e => ({
                        oldPath: e.file.relativePath,
                        oldName: e.file.fileName,
                        house: e.house,
                        type: e.type
                    }))
                });
            }
        }

        // Remove conflicts from renames (they need manual resolution)
        const conflictPaths = new Set();
        for (const conflict of results.conflicts) {
            for (const file of conflict.conflictingFiles) {
                conflictPaths.add(file.oldPath);
            }
        }
        results.renames = results.renames.filter(r => !conflictPaths.has(r.oldPath));
        results.stats.needsRename = results.renames.length;

        return results;
    }

    /**
     * Write results to output file
     * @param {Object} results Mapping results
     */
    writeResults(results) {
        const outputDir = path.dirname(this.outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(this.outputPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`[MAPPER] Results written to: ${this.outputPath}`);
    }

    /**
     * Run the mapper
     * @returns {Object} Mapping results
     */
    run() {
        console.log('[MAPPER] Starting file rename mapping...');

        if (this.dryRun) {
            console.log('[MAPPER] DRY RUN - No files will be written');
        }

        const results = this.generateMapping();

        // Print summary
        console.log('\n=== Rename Mapping Summary ===');
        console.log(`Total files scanned:  ${results.stats.total}`);
        console.log(`Already compliant:    ${results.stats.alreadyCompliant}`);
        console.log(`Needs rename:         ${results.stats.needsRename}`);
        console.log(`Skipped:              ${results.stats.skipped}`);
        console.log(`Conflicts:            ${results.stats.conflicts}`);

        if (this.verbose) {
            if (results.renames.length > 0) {
                console.log('\n--- Proposed Renames (first 20) ---');
                for (const rename of results.renames.slice(0, 20)) {
                    console.log(`  ${rename.oldName} -> ${rename.newName}`);
                }
                if (results.renames.length > 20) {
                    console.log(`  ... and ${results.renames.length - 20} more`);
                }
            }

            if (results.conflicts.length > 0) {
                console.log('\n--- Conflicts (require manual resolution) ---');
                for (const conflict of results.conflicts) {
                    console.log(`  Would become: ${conflict.proposedNewPath}`);
                    for (const file of conflict.conflictingFiles) {
                        console.log(`    - ${file.oldPath}`);
                    }
                }
            }
        }

        if (!this.dryRun) {
            this.writeResults(results);
        } else {
            console.log('\n[MAPPER] Dry run complete. Use without --dry-run to write results.');
        }

        return results;
    }
}

// CLI handling
function parseArgs(args) {
    const options = {
        dryRun: false,
        verbose: false,
        rootPath: './_app',
        outputPath: './_tools/reports/RENAME_MAP.json',
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--dry-run':
            case '-n':
                options.dryRun = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--output':
            case '-o':
                if (nextArg && !nextArg.startsWith('-')) {
                    options.outputPath = nextArg;
                    i++;
                }
                break;
            case '--path':
            case '-p':
                if (nextArg && !nextArg.startsWith('-')) {
                    options.rootPath = nextArg;
                    i++;
                }
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    return options;
}

function showHelp() {
    console.log(`
EduScan Rename Mapper - Generate file rename mapping for standardization

Usage:
  node rename-mapper.js [options]

Options:
  -n, --dry-run          Show what would be done without writing output
  -v, --verbose          Show detailed output including proposed renames
  -o, --output <path>    Output JSON file (default: ./_tools/reports/RENAME_MAP.json)
  -p, --path <dir>       Root app directory (default: ./_app)
  -h, --help             Show this help

Convention:
  Files are renamed to: {house}-{name}.{type}.html

  Types: presentation, quiz, lab, applet, tool, exam, module, simulator, reference

Examples:
  node rename-mapper.js --dry-run --verbose
  node rename-mapper.js -o ./custom-output.json
  node rename-mapper.js --path /path/to/_app
`);
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (options.help) {
        showHelp();
        process.exit(0);
    }

    const mapper = new RenameMapper(options);
    const results = mapper.run();

    // Exit code based on conflicts
    if (results.conflicts.length > 0) {
        console.log('\n[WARN] Conflicts detected. Review RENAME_MAP.json before proceeding.');
        process.exit(1);
    }

    process.exit(0);
}

module.exports = RenameMapper;
