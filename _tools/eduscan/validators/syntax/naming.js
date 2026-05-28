/**
 * EduScan - Naming Convention Validator
 *
 * Validates that files follow the naming convention: {house}-{name}.{type}.html
 * This ensures consistent naming across the codebase for easier discovery,
 * maintenance, and automated processing.
 *
 * Issue codes:
 * - NAME-001: File doesn't follow naming convention (HIGH)
 * - NAME-002: File has wrong type suffix (MEDIUM)
 * - NAME-003: File missing house prefix (MEDIUM)
 * - NAME-004: File uses wrong case (camelCase/PascalCase instead of kebab-case) (LOW)
 *
 * Created: 2026-02-07
 */

const path = require('path');
const fs = require('fs');
const vm = require('vm');

// Valid house prefixes (all 12 houses including AI and secret/special)
const VALID_HOUSES = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye', 'ai', 'dark-arts', 'matrix', 'divergent'];

// Content type suffixes (all recognized types in the codebase)
const CONTENT_TYPES = ['presentation', 'quiz', 'lab', 'applet', 'module', 'tool', 'simulator', 'reference', 'exam'];

// Path patterns that indicate content type
const PATH_TYPE_PATTERNS = {
    presentation: /\/presentations?\//i,
    quiz: /\/quizzes?\//i,
    lab: /\/labs?\//i,
    applet: /\/applets?\//i,
    module: /\/modules?\//i,
    tool: /\/tools?\//i
};

// Filename suffix patterns that indicate content type
// Supports both dot-separator ({name}.{type}.html) and dash-separator ({name}-{type}.html)
const FILENAME_TYPE_PATTERNS = {
    presentation: /[.-]presentation\.html$/i,
    quiz: /[.-]quiz\.html$/i,
    lab: /[.-]lab\.html$/i,
    applet: /[.-]applet\.html$/i,
    tool: /[.-]tool\.html$/i,
    module: /[.-]module\.html$/i,
    simulator: /[.-]simulator\.html$/i,
    reference: /[.-]reference\.html$/i,
    exam: /[.-]exam\.html$/i
};

// Content detection patterns (in file content)
const CONTENT_DETECTION_PATTERNS = {
    quiz: /new\s+QuizEngine\s*\(/,
    lab: /new\s+LabEngine\s*\(|class\s*=\s*["'][^"']*lab-container/i,
    presentation: /new\s+PresentationEngine|class\s*=\s*["'][^"']*slide[^"']*["']/i,
    applet: /<canvas|<svg[^>]*class|d3\.(select|json)|new\s+Chart/i
};

// Files/paths to exclude from naming validation
const EXCLUDE_PATTERNS = [
    /\/index\.html$/,            // Index files are special
    /\/intro\.html$/,            // Generic intro files
    /\/overview\.html$/,         // Generic overview files
    /\/lab\.html$/,              // Simple lab.html files
    /\/quiz\.html$/,             // Simple quiz.html files
    /\/styles\//,                // Style directories
    /\/components\//,            // Component directories
    /\/config\//,                // Config directories
    /\/assets\//,                // Asset directories
    /\/vendor\//,                // Vendor directories
    /\/lib\//,                   // Library directories
    /\/templates?\//,            // Template directories
    /^templates?\//,             // Top-level templates
    /\.barricade\.html$/,        // Dark Arts gate barricade files
    /^dark-arts\//,              // Dark Arts has its own naming convention
    /^hive\//,                   // Hive dungeon files
    /^dashboard\.html$/,         // System: main dashboard
    /^games\.html$/,             // System: game hub
    /^handler-dashboard\.html$/, // System: handler dashboard
    /^sorting\.html$/,           // System: house sorting
    /^terminal\.html$/,          // System: matrix terminal
    /^connect\.html$/,           // System: connection page
    /^(quiz|lab)-template\.html$/ // File templates
];

// Patterns that indicate wrong case (camelCase or PascalCase)
const WRONG_CASE_PATTERNS = [
    /[a-z][A-Z]/,                // lowercase followed by uppercase (camelCase)
    /^[A-Z]/                     // starts with uppercase (PascalCase)
];

class NamingValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.strictMode = options.strictMode || false; // If true, validate ALL files
        // Optional Set of file paths (relative to rootPath, e.g.
        // 'houses/matrix/adv-linux/ala-r1.html') that are registered in
        // ContentCatalog.js. Files in this set get NAME-003 skipped because
        // their identity is established via the catalog id, making the
        // filename convention informational rather than authoritative.
        // If null/undefined, falls back to today's strict-prefix behavior
        // (used by `tests/run.js` against synthetic fixtures).
        this.catalogHrefs = options.catalogHrefs || null;
    }

    /**
     * Validate a single file's naming convention
     * @param {Object} file - Parsed file object with path and optional content
     * @returns {Array} Issues found
     */
    validate(file) {
        const issues = [];
        const filePath = file.path;
        const filename = path.basename(filePath);

        // Skip non-HTML files
        if (!filename.endsWith('.html')) {
            return issues;
        }

        // Skip excluded patterns (unless in strict mode)
        if (!this.strictMode && this.shouldExclude(filePath)) {
            return issues;
        }

        // Extract house from path
        const houseFromPath = this.extractHouseFromPath(filePath);
        const detectedType = this.detectContentType(filePath, file.content);

        // Check for case issues first (most specific)
        const caseIssue = this.checkCase(filename, filePath, houseFromPath, detectedType);
        if (caseIssue) {
            issues.push(caseIssue);
        }

        // Check for missing house prefix
        const prefixIssue = this.checkHousePrefix(filename, filePath, houseFromPath, detectedType);
        if (prefixIssue) {
            issues.push(prefixIssue);
        }

        // Check for wrong/missing type suffix
        const suffixIssue = this.checkTypeSuffix(filename, filePath, houseFromPath, detectedType);
        if (suffixIssue) {
            issues.push(suffixIssue);
        }

        // Check overall naming convention compliance
        const conventionIssue = this.checkNamingConvention(filename, filePath, houseFromPath, detectedType);
        if (conventionIssue && !prefixIssue && !suffixIssue) {
            // Only add convention issue if we haven't already flagged more specific issues
            issues.push(conventionIssue);
        }

        return issues;
    }

    /**
     * Check if file should be excluded from validation
     */
    shouldExclude(filePath) {
        return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
    }

    /**
     * Extract house name from file path
     * @param {string} filePath - File path
     * @returns {string|null} House name or null
     */
    extractHouseFromPath(filePath) {
        const match = filePath.match(/houses\/([\w-]+)\//);
        if (match && VALID_HOUSES.includes(match[1])) {
            return match[1];
        }
        return null;
    }

    /**
     * Detect content type from path, filename, and content
     * @param {string} filePath - File path
     * @param {string} content - Optional file content
     * @returns {string|null} Detected content type or null
     */
    detectContentType(filePath, content) {
        const filename = path.basename(filePath);

        // 1. Check filename suffix FIRST — if a file explicitly declares its type
        //    via .lab.html, .quiz.html, .tool.html etc., that takes priority over
        //    the directory it lives in (e.g. a .lab.html inside /modules/ is still a lab)
        for (const [type, pattern] of Object.entries(FILENAME_TYPE_PATTERNS)) {
            if (pattern.test(filename)) {
                return type;
            }
        }

        // 2. Check path patterns (directory-based detection)
        for (const [type, pattern] of Object.entries(PATH_TYPE_PATTERNS)) {
            if (pattern.test(filePath)) {
                return type;
            }
        }

        // 3. Check content patterns (if content available)
        if (content) {
            for (const [type, pattern] of Object.entries(CONTENT_DETECTION_PATTERNS)) {
                if (pattern.test(content)) {
                    return type;
                }
            }
        }

        return null;
    }

    /**
     * Check for case issues (camelCase/PascalCase instead of kebab-case)
     */
    checkCase(filename, filePath, house, detectedType) {
        // Remove extension for checking
        const nameWithoutExt = filename.replace(/\.html$/, '');

        // Check for camelCase or PascalCase
        if (WRONG_CASE_PATTERNS.some(pattern => pattern.test(nameWithoutExt))) {
            const corrected = this.toKebabCase(nameWithoutExt);
            const suggestedFilename = corrected + '.html';

            return {
                code: 'NAME-004',
                severity: 'low',
                category: 'naming',
                message: `File uses wrong case convention: '${filename}' (should be kebab-case)`,
                file: filePath,
                currentFilename: filename,
                suggestedFilename,
                autoFixable: true,
                fix: `Rename to: ${suggestedFilename}`,
                details: {
                    house,
                    detectedType,
                    issue: 'wrong-case'
                }
            };
        }

        return null;
    }

    /**
     * Check if filename has proper house prefix.
     *
     * If the file is registered in ContentCatalog.js (this.catalogHrefs Set,
     * populated by the caller), this check is skipped: the catalog id is the
     * authoritative identity, and the filename convention is informational.
     * The 1913 platform-wide NAME-003 fires include 1251 catalog-registered
     * files that follow course-prefix convention (e.g., `ala-`, `pis-`, `eth-`)
     * rather than house-prefix; those are intentional content with established
     * identity. The remaining 662 catalog-orphans still fire — those are the
     * actual bug class (typo'd/draft files that should either be catalogued
     * or renamed). Decided 2026-05-28 after two Nancy review rounds; see
     * `_docs/operations/name-003-catalog-aware-skip.md` (TODO).
     */
    checkHousePrefix(filename, filePath, house, detectedType) {
        // Only validate files in house directories
        if (!house) {
            return null;
        }

        // Catalog-aware skip: this.catalogHrefs holds normalized paths
        // (e.g., 'houses/matrix/adv-linux/ala-r1.html'). The scanner already
        // passes filePath in that form (relative to rootPath, no leading
        // '_app/' or '../').
        if (this.catalogHrefs && this.catalogHrefs.has(filePath)) {
            return null;
        }

        const nameWithoutExt = filename.replace(/\.html$/, '');

        // Check if filename starts with house prefix
        if (!nameWithoutExt.startsWith(house + '-')) {
            // Generate suggested filename
            const suggestedFilename = this.generateSuggestedFilename(nameWithoutExt, house, detectedType);

            return {
                code: 'NAME-003',
                severity: 'low',  // Naming convention, doesn't affect functionality
                category: 'naming',
                message: `File missing house prefix: '${filename}' (should start with '${house}-')`,
                file: filePath,
                currentFilename: filename,
                suggestedFilename,
                autoFixable: true,
                fix: `Rename to: ${suggestedFilename}`,
                details: {
                    house,
                    detectedType,
                    issue: 'missing-house-prefix'
                }
            };
        }

        return null;
    }

    /**
     * Check if filename has proper type suffix
     * Supports both dot-separator ({name}.{type}.html) and dash-separator ({name}-{type}.html)
     */
    checkTypeSuffix(filename, filePath, house, detectedType) {
        // Only validate if we detected a content type
        if (!detectedType) {
            return null;
        }

        // Only enforce type-suffix naming on COURSE CONTENT files inside
        // houses/<house>/. Files outside that hierarchy (admin/, components/,
        // signal/toolkit/, tenant/, top-level utility pages) are platform
        // infrastructure / UI scaffolding — they don't follow course-naming
        // conventions. Detection by JS content (e.g., interactive UI looking
        // like an "applet") falsely flags admin consoles, settings pages, etc.
        const normalized = filePath.replace(/\\/g, '/');
        if (!/(?:^|\/)houses\/[a-z-]+\//.test(normalized)) {
            return null;
        }

        const nameWithoutExt = filename.replace(/\.html$/, '');

        // Check for both dot-separator and dash-separator formats
        const hasDotSuffix = nameWithoutExt.endsWith(`.${detectedType}`);
        const hasDashSuffix = nameWithoutExt.endsWith(`-${detectedType}`);

        // If either format is correct, we're good
        if (hasDotSuffix || hasDashSuffix) {
            return null;
        }

        // Check if it ends with a different type suffix (wrong type)
        const hasDifferentSuffix = CONTENT_TYPES.some(type =>
            type !== detectedType && (
                nameWithoutExt.endsWith(`.${type}`) ||
                nameWithoutExt.endsWith(`-${type}`)
            )
        );

        if (hasDifferentSuffix) {
            // Wrong type suffix - more severe
            const suggestedFilename = this.generateSuggestedFilename(nameWithoutExt, house, detectedType);

            return {
                code: 'NAME-002',
                severity: 'medium',
                category: 'naming',
                message: `File has wrong type suffix: '${filename}' (detected as ${detectedType}, but has different suffix)`,
                file: filePath,
                currentFilename: filename,
                suggestedFilename,
                autoFixable: true,
                fix: `Rename to: ${suggestedFilename}`,
                details: {
                    house,
                    detectedType,
                    issue: 'wrong-type-suffix'
                }
            };
        }

        // Missing type suffix
        const suggestedFilename = this.generateSuggestedFilename(nameWithoutExt, house, detectedType);

        return {
            code: 'NAME-002',
            severity: 'medium',
            category: 'naming',
            message: `File missing type suffix: '${filename}' (should end with '.${detectedType}')`,
            file: filePath,
            currentFilename: filename,
            suggestedFilename,
            autoFixable: true,
            fix: `Rename to: ${suggestedFilename}`,
            details: {
                house,
                detectedType,
                issue: 'missing-type-suffix'
            }
        };
    }

    /**
     * Check overall naming convention compliance
     * Expected format: {house}-{name}.{type}.html or {house}-{name}-{type}.html
     *
     * MUST mirror checkHousePrefix's catalog-aware skip. NAME-001 is the
     * umbrella check that fires when NAME-003 (prefix) doesn't fire. If we
     * skip NAME-003 for catalog-registered files without also skipping
     * NAME-001 here, the convention check fires on the same files at HIGH
     * severity. Bug discovered 2026-05-28 post-deploy: ~1198 files unmasked
     * NAME-001 after the NAME-003 catalog-aware skip landed in 820286853.
     */
    checkNamingConvention(filename, filePath, house, detectedType) {
        // Only validate files in house directories with detected type
        if (!house || !detectedType) {
            return null;
        }

        // Catalog-aware skip: mirrors checkHousePrefix. See docstring above.
        if (this.catalogHrefs && this.catalogHrefs.has(filePath)) {
            return null;
        }

        const nameWithoutExt = filename.replace(/\.html$/, '');
        // Support both dot-separator ({house}-{name}.{type}.html) and dash-separator ({house}-{name}-{type}.html)
        const expectedPattern = new RegExp(
            `^${house}-[a-z0-9]+(?:-[a-z0-9]+)*[.-]${detectedType}$`,
            'i'
        );

        if (!expectedPattern.test(nameWithoutExt)) {
            const suggestedFilename = this.generateSuggestedFilename(nameWithoutExt, house, detectedType);

            return {
                code: 'NAME-001',
                severity: 'high',
                category: 'naming',
                message: `File doesn't follow naming convention: '${filename}' (expected: {house}-{name}.{type}.html)`,
                file: filePath,
                currentFilename: filename,
                suggestedFilename,
                autoFixable: true,
                fix: `Rename to: ${suggestedFilename}`,
                details: {
                    house,
                    detectedType,
                    expectedPattern: `${house}-{name}.${detectedType}.html`,
                    issue: 'convention-violation'
                }
            };
        }

        return null;
    }

    /**
     * Generate a suggested filename following the convention
     * @param {string} currentName - Current filename without extension
     * @param {string} house - House prefix
     * @param {string} type - Content type
     * @returns {string} Suggested filename with extension
     */
    generateSuggestedFilename(currentName, house, type) {
        // Convert to kebab-case
        let name = this.toKebabCase(currentName);

        // Remove existing house prefix if present
        for (const h of VALID_HOUSES) {
            if (name.startsWith(h + '-')) {
                name = name.substring(h.length + 1);
                break;
            }
        }

        // Remove existing type suffix if present (both dot and dash separators)
        for (const t of CONTENT_TYPES) {
            if (name.endsWith('.' + t)) {
                name = name.substring(0, name.length - t.length - 1);
                break;
            }
            if (name.endsWith('-' + t)) {
                name = name.substring(0, name.length - t.length - 1);
                break;
            }
        }

        // Clean up any double dashes
        name = name.replace(/--+/g, '-').replace(/^-|-$/g, '');

        // Build suggested filename (using dot-separator for type)
        if (house && type) {
            return `${house}-${name}.${type}.html`;
        } else if (house) {
            return `${house}-${name}.html`;
        } else if (type) {
            return `${name}.${type}.html`;
        } else {
            return `${name}.html`;
        }
    }

    /**
     * Convert string to kebab-case
     * Preserves dots that separate type suffixes (e.g. script-lab.lab stays as-is)
     * @param {string} str - Input string
     * @returns {string} kebab-case string
     */
    toKebabCase(str) {
        return str
            // Insert hyphen before uppercase letters
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            // Replace underscores and spaces with hyphens
            .replace(/[_\s]+/g, '-')
            // Convert to lowercase
            .toLowerCase()
            // Remove any non-alphanumeric characters except hyphens and dots
            .replace(/[^a-z0-9.\-]/g, '')
            // Remove consecutive hyphens
            .replace(/--+/g, '-')
            // Remove leading/trailing hyphens
            .replace(/^-|-$/g, '');
    }

    /**
     * Validate all files in a directory (batch mode)
     * @param {Array} files - Array of file objects
     * @returns {Object} Validation results
     */
    validateAll(files) {
        const startTime = Date.now();
        const issues = [];

        for (const file of files) {
            const fileIssues = this.validate(file);
            issues.push(...fileIssues);
        }

        // Sort by severity
        issues.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return (order[a.severity] || 3) - (order[b.severity] || 3);
        });

        return {
            issues,
            summary: {
                totalFiles: files.length,
                totalIssues: issues.length,
                bySeverity: {
                    high: issues.filter(i => i.severity === 'high').length,
                    medium: issues.filter(i => i.severity === 'medium').length,
                    low: issues.filter(i => i.severity === 'low').length
                },
                byCode: {
                    'NAME-001': issues.filter(i => i.code === 'NAME-001').length,
                    'NAME-002': issues.filter(i => i.code === 'NAME-002').length,
                    'NAME-003': issues.filter(i => i.code === 'NAME-003').length,
                    'NAME-004': issues.filter(i => i.code === 'NAME-004').length
                },
                duration: Date.now() - startTime
            }
        };
    }

    /**
     * Build the Set of catalog-registered href paths (relative to rootPath)
     * by parsing ContentCatalog.js. Pass the result into the constructor as
     * `catalogHrefs` to enable the NAME-003 skip for catalog-registered files.
     *
     * Centralized here so the scanner (syntax/index.js), the fixer
     * (fixers/naming-fixer.js), and any future caller share one
     * implementation; otherwise they drift and the fixer proposes renames
     * the scanner suppresses (Nancy review afac09a... HIGH #3).
     *
     * Returns null if the catalog can't be loaded — callers should fall back
     * to today's strict-prefix behavior in that case.
     */
    static buildCatalogHrefSet(rootPath) {
        const catalogPath = path.resolve(rootPath, 'components', 'ContentCatalog.js');
        if (!fs.existsSync(catalogPath)) return null;
        try {
            const code = fs.readFileSync(catalogPath, 'utf8');
            const context = vm.createContext({ window: {} });
            vm.runInContext(code, context);
            const catalog = context.window.ContentCatalog;
            if (!catalog || !catalog.HOUSES || !catalog.MODULES) return null;
            const set = new Set();
            for (const mod of catalog.MODULES) {
                const house = catalog.HOUSES[mod.house];
                if (!house || !mod.href) continue;
                const resolved = NamingValidator._resolveCatalogHref(house.basePath, mod.href);
                if (resolved && resolved.endsWith('.html')) set.add(resolved);
            }
            return set;
        } catch (e) {
            return null;
        }
    }

    /**
     * Resolve a catalog module's href into a path relative to rootPath.
     *
     * The catalog has two href styles in active use:
     *   - Style A (cloud, eye, etc.):  'quizzes/cloud-cse-06.quiz.html'
     *                                   relative to the house's basePath
     *   - Style B (matrix, dark-arts): '../houses/matrix/adv-linux/.../index.html'
     *                                   path-from-root with a stray leading '..'
     *                                   (carryover from when the catalog lived
     *                                   in a different directory)
     * Both must resolve to the same `houses/{house}/...` form so the Set
     * lookup against scanner file paths matches.
     */
    static _resolveCatalogHref(basePath, href) {
        if (!href) return null;
        if (href.startsWith('../') || href.startsWith('/')) {
            return href.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
        }
        if (href.startsWith('houses/')) {
            return href;
        }
        return (basePath || '').replace(/\/?$/, '/') + href;
    }
}

// Export constants for external use
NamingValidator.VALID_HOUSES = VALID_HOUSES;
NamingValidator.CONTENT_TYPES = CONTENT_TYPES;
NamingValidator.EXCLUDE_PATTERNS = EXCLUDE_PATTERNS;

module.exports = NamingValidator;
