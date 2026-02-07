/**
 * EduScan - LearningPaths Validator
 *
 * Validates that all hrefs in LearningPaths.js resolve to existing files.
 * This catches the exact bug where certification paths reference files
 * that don't exist at the expected location.
 *
 * Issue types detected:
 * - LP-001: Module href points to non-existent file
 * - LP-002: Path has no houseFolder and uses relative hrefs (design issue)
 * - LP-003: Duplicate module IDs across paths
 *
 * Created: 2026-02-07 (after comptia-linux 404 bug)
 */

const fs = require('fs');
const path = require('path');
const PathValidator = require('./paths');

// Known house folders (actual directories under houses/)
const HOUSE_FOLDERS = ['shield', 'web', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];

// Certification paths that are NOT actual house folders
const CERTIFICATION_PATHS = ['comptia-linux', 'linux-mastery', 'wsa', 'devops-fundamentals', 'aplus-core1', 'aplus-core2'];

class LearningPathsValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.learningPathsFile = options.learningPathsFile || './components/LearningPaths.js';

        // Reuse PathValidator's file indexing capability
        this.pathValidator = new PathValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
    }

    /**
     * Validate LearningPaths.js
     * @returns {Object} Validation results with issues array
     */
    validate() {
        const issues = [];
        const absolutePath = path.resolve(this.rootPath, this.learningPathsFile);

        if (!fs.existsSync(absolutePath)) {
            issues.push({
                code: 'LP-000',
                severity: 'critical',
                category: 'learning-paths',
                message: `LearningPaths.js not found at ${absolutePath}`,
                file: this.learningPathsFile,
                fix: 'Ensure LearningPaths.js exists in components/'
            });
            return { issues, stats: {} };
        }

        const content = fs.readFileSync(absolutePath, 'utf8');
        const paths = this.parseLearningPaths(content);

        if (!paths) {
            issues.push({
                code: 'LP-000',
                severity: 'critical',
                category: 'learning-paths',
                message: 'Failed to parse LearningPaths.js - PATHS object not found',
                file: this.learningPathsFile,
                fix: 'Ensure LearningPaths.js exports a valid PATHS object'
            });
            return { issues, stats: {} };
        }

        const stats = {
            totalPaths: 0,
            totalModules: 0,
            validModules: 0,
            invalidModules: 0,
            certificationPaths: 0,
            housePaths: 0
        };

        const seenIds = new Map(); // For duplicate detection

        for (const [pathId, pathData] of Object.entries(paths)) {
            stats.totalPaths++;

            const isCertPath = CERTIFICATION_PATHS.includes(pathId);
            const isHousePath = HOUSE_FOLDERS.includes(pathId);

            if (isCertPath) stats.certificationPaths++;
            if (isHousePath) stats.housePaths++;

            if (!pathData.modules || !Array.isArray(pathData.modules)) {
                issues.push({
                    code: 'LP-002',
                    severity: 'warning',
                    category: 'learning-paths',
                    message: `Path '${pathId}' has no modules array`,
                    file: this.learningPathsFile,
                    pathId
                });
                continue;
            }

            for (const module of pathData.modules) {
                stats.totalModules++;

                // Check for duplicate IDs
                if (module.id) {
                    if (seenIds.has(module.id)) {
                        issues.push({
                            code: 'LP-003',
                            severity: 'warning',
                            category: 'learning-paths',
                            message: `Duplicate module ID '${module.id}' found in '${pathId}' (also in '${seenIds.get(module.id)}')`,
                            file: this.learningPathsFile,
                            moduleId: module.id,
                            pathId,
                            duplicateIn: seenIds.get(module.id)
                        });
                    } else {
                        seenIds.set(module.id, pathId);
                    }
                }

                if (!module.href) {
                    issues.push({
                        code: 'LP-002',
                        severity: 'warning',
                        category: 'learning-paths',
                        message: `Module '${module.id || module.title}' in path '${pathId}' has no href`,
                        file: this.learningPathsFile,
                        pathId,
                        moduleId: module.id
                    });
                    continue;
                }

                // Validate the href resolves to an existing file
                const validation = this.validateModuleHref(pathId, module, isCertPath, isHousePath);

                if (validation.valid) {
                    stats.validModules++;
                } else {
                    stats.invalidModules++;
                    issues.push({
                        code: 'LP-001',
                        severity: 'high',
                        category: 'learning-paths',
                        message: validation.message,
                        file: this.learningPathsFile,
                        pathId,
                        moduleId: module.id,
                        moduleTitle: module.title,
                        href: module.href,
                        expectedPath: validation.expectedPath,
                        suggestion: validation.suggestion,
                        autoFixable: !!validation.suggestion,
                        fix: validation.fix
                    });
                }
            }
        }

        // Sort by severity
        issues.sort((a, b) => {
            const order = { critical: 0, high: 1, warning: 2, info: 3 };
            return (order[a.severity] || 4) - (order[b.severity] || 4);
        });

        return { issues, stats };
    }

    /**
     * Parse LearningPaths.js to extract PATHS object
     */
    parseLearningPaths(content) {
        try {
            const paths = {};

            // Find all path definitions: 'pathId': { ... modules: [ ... ] }
            // We'll use a simpler approach: find each path key and extract its modules

            // Match path keys like: shield: {, 'comptia-linux': {, etc.
            const pathKeyPattern = /['"]?([a-z][-a-z0-9]*)['"']?\s*:\s*\{\s*\n\s+name:/gi;
            let keyMatch;

            while ((keyMatch = pathKeyPattern.exec(content)) !== null) {
                const pathId = keyMatch[1];
                const startIndex = keyMatch.index;

                // Find the modules array for this path
                const afterKey = content.slice(startIndex);
                const modulesStart = afterKey.indexOf('modules:');

                if (modulesStart === -1) continue;

                // Find the opening [ and closing ] of the modules array
                const arrayStart = afterKey.indexOf('[', modulesStart);
                if (arrayStart === -1) continue;

                // Find matching closing bracket (handle nested objects)
                let bracketCount = 1;
                let arrayEnd = arrayStart + 1;
                while (bracketCount > 0 && arrayEnd < afterKey.length) {
                    if (afterKey[arrayEnd] === '[') bracketCount++;
                    if (afterKey[arrayEnd] === ']') bracketCount--;
                    arrayEnd++;
                }

                const modulesContent = afterKey.slice(arrayStart + 1, arrayEnd - 1);
                const modules = this.parseModules(modulesContent);

                if (modules.length > 0) {
                    paths[pathId] = { modules };
                }
            }

            return Object.keys(paths).length > 0 ? paths : null;
        } catch (err) {
            if (this.verbose) console.error('[LP] Parse error:', err.message);
            return null;
        }
    }

    /**
     * Parse modules array from content
     */
    parseModules(modulesContent) {
        const modules = [];

        // Find each module object with id and href
        // Pattern: { id: '...', ... href: '...' } or { ... href: '...', ... id: '...' }
        const idPattern = /id:\s*['"]([^'"]+)['"]/g;
        const hrefPattern = /href:\s*['"]([^'"]+)['"]/g;

        // Split by opening braces to find individual module objects
        const moduleBlocks = modulesContent.split(/\{\s*(?=id:|title:)/);

        for (const block of moduleBlocks) {
            if (!block.trim()) continue;

            const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/);
            const hrefMatch = block.match(/href:\s*['"]([^'"]+)['"]/);

            if (idMatch && hrefMatch) {
                modules.push({
                    id: idMatch[1],
                    href: hrefMatch[1]
                });
            } else if (hrefMatch) {
                // Some modules might have href but different id format
                const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
                modules.push({
                    id: titleMatch ? titleMatch[1] : 'unknown',
                    href: hrefMatch[1],
                    title: titleMatch ? titleMatch[1] : undefined
                });
            }
        }

        return modules;
    }

    /**
     * Validate a module's href resolves to an existing file
     */
    validateModuleHref(pathId, module, isCertPath, isHousePath) {
        const href = module.href;

        // Determine the expected file path based on href format
        let expectedPath;
        let resolveMethod;

        if (href.startsWith('houses/')) {
            // Full path - use as-is (relative to _app/)
            expectedPath = path.join(this.rootPath, href);
            resolveMethod = 'absolute';
        } else if (isHousePath) {
            // House path with relative href - prepend house folder
            expectedPath = path.join(this.rootPath, 'houses', pathId, href);
            resolveMethod = 'house-relative';
        } else if (isCertPath) {
            // Certification path with relative href - THIS IS THE BUG CASE
            // We don't know which house folder to use!
            // Try to guess based on href content

            const guessedHouse = this.guessHouseFolder(href);
            if (guessedHouse) {
                expectedPath = path.join(this.rootPath, 'houses', guessedHouse, href);
                resolveMethod = 'guessed';
            } else {
                // Can't resolve - this is a design issue
                return {
                    valid: false,
                    message: `Certification path '${pathId}' uses relative href '${href}' but no houseFolder specified`,
                    expectedPath: `houses/${pathId}/${href} (doesn't exist)`,
                    suggestion: this.findActualFile(href),
                    fix: `Change href to full path starting with 'houses/'. Use EduScan to find the correct path.`
                };
            }
        } else {
            // Unknown path type - try relative to _app
            expectedPath = path.join(this.rootPath, href);
            resolveMethod = 'root-relative';
        }

        // Check if file exists
        if (fs.existsSync(expectedPath)) {
            return { valid: true };
        }

        // File doesn't exist - try to find it
        const suggestion = this.findActualFile(href);

        return {
            valid: false,
            message: `Module '${module.id}' href '${href}' does not resolve to an existing file`,
            expectedPath: expectedPath.replace(this.rootPath, '_app'),
            suggestion,
            fix: suggestion
                ? `Change href to: '${suggestion.path}'`
                : `File not found. Create the file or fix the href.`
        };
    }

    /**
     * Guess which house folder a relative href belongs to
     */
    guessHouseFolder(href) {
        // Check for path hints
        if (href.includes('linux') || href.includes('bash') || href.includes('powershell') || href.includes('python')) {
            return 'script';
        }
        if (href.includes('aws') || href.includes('azure') || href.includes('cloud') || href.includes('wsa')) {
            return 'cloud';
        }
        if (href.includes('comptia-aplus') || href.includes('hardware') || href.includes('windows')) {
            return 'forge';
        }
        if (href.includes('network') || href.includes('osi') || href.includes('subnet')) {
            return 'web';
        }
        if (href.includes('security') || href.includes('cia-triad') || href.includes('threat')) {
            return 'shield';
        }
        if (href.includes('crypto') || href.includes('encryption') || href.includes('aes')) {
            return 'key';
        }
        if (href.includes('siem') || href.includes('log') || href.includes('soc')) {
            return 'eye';
        }
        if (href.includes('git') || href.includes('docker') || href.includes('cicd') || href.includes('pipeline')) {
            return 'code';
        }

        return null;
    }

    /**
     * Try to find the actual file location using PathValidator's file index
     */
    findActualFile(href) {
        const filename = path.basename(href);
        const ext = path.extname(href) || '.html';
        const baseName = path.basename(filename, ext);

        // Use PathValidator's existing file index (same one used for path validation)
        let matches = this.pathValidator.findFileInCodebase(filename, ext);

        // If no exact match, try fuzzy matching
        if (matches.length === 0) {
            matches = this.findSimilarFiles(baseName, ext);
        }

        if (matches.length === 0) {
            return null;
        }

        // Find best match - prefer same subtree pattern
        const hrefDir = path.dirname(href);
        let bestMatch = matches[0];

        for (const match of matches) {
            // Prefer matches that share directory structure hints
            if (match.path.includes(hrefDir) || hrefDir.split('/').some(d => match.path.includes(d))) {
                bestMatch = match;
                break;
            }
        }

        // Calculate the correct relative path from _app root
        const relativePath = path.relative(this.rootPath, bestMatch.path).replace(/\\/g, '/');

        return {
            path: relativePath,
            confidence: bestMatch.exactMatch ? 0.95 : 0.7,
            reason: bestMatch.exactMatch
                ? `Exact match found at ${bestMatch.subtree}`
                : `Similar file found: ${path.basename(bestMatch.path)}`,
            allMatches: matches.slice(0, 5).map(m => ({
                path: path.relative(this.rootPath, m.path).replace(/\\/g, '/'),
                subtree: m.subtree,
                similarity: m.similarity
            }))
        };
    }

    /**
     * Find files with similar names (fuzzy matching)
     */
    findSimilarFiles(baseName, ext) {
        const matches = [];
        const index = this.pathValidator.getFileIndex();

        // Normalize the search term - extract key words
        const searchTerms = baseName.toLowerCase()
            .replace(/[-_]/g, ' ')  // Replace separators with spaces
            .split(/\s+/)           // Split into words
            .filter(w => w.length > 2);  // Filter short words

        for (const [filePath, info] of index.entries()) {
            const fileExt = path.extname(filePath);

            // Only match same extension (HTML files for HTML hrefs)
            if (ext === '.html' && fileExt !== '.html') continue;

            const fileBasename = path.basename(filePath, fileExt);
            const normalizedFile = fileBasename.toLowerCase().replace(/[-_]/g, ' ');

            // Check if search terms are contained in filename
            const matchedTerms = searchTerms.filter(term =>
                normalizedFile.includes(term) || term.includes(normalizedFile.split(' ')[0])
            );

            if (matchedTerms.length === 0) continue;

            // Calculate match quality based on how many terms matched
            const matchQuality = matchedTerms.length / searchTerms.length;

            // Also use string similarity for overall match
            const similarity = this.stringSimilarity(
                baseName.toLowerCase().replace(/[-_]/g, ''),
                fileBasename.toLowerCase().replace(/[-_]/g, '')
            );

            // Require at least 50% of terms to match AND reasonable similarity
            if (matchQuality >= 0.5 && similarity > 0.4) {
                matches.push({
                    path: filePath,
                    subtree: info.subtree,
                    exactMatch: false,
                    similarity: Math.round((matchQuality * 0.6 + similarity * 0.4) * 100),
                    matchedTerms
                });
            }
        }

        // Sort by similarity
        matches.sort((a, b) => b.similarity - a.similarity);

        return matches.slice(0, 10);
    }

    /**
     * Simple string similarity (Dice coefficient)
     */
    stringSimilarity(str1, str2) {
        if (str1 === str2) return 1;
        if (str1.length < 2 || str2.length < 2) return 0;

        const getBigrams = s => {
            const bigrams = new Set();
            for (let i = 0; i < s.length - 1; i++) {
                bigrams.add(s.substring(i, i + 2));
            }
            return bigrams;
        };

        const b1 = getBigrams(str1);
        const b2 = getBigrams(str2);

        let intersection = 0;
        for (const bigram of b1) {
            if (b2.has(bigram)) intersection++;
        }

        return (2 * intersection) / (b1.size + b2.size);
    }
}

module.exports = LearningPathsValidator;
