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
 * - LP-004: Broken prerequisite reference (prereq ID not found in any path)
 * - LP-005: Circular prerequisite chain (DFS cycle detected)
 * - LP-006: LearningPaths module not found in ContentCatalog
 * - LP-007: ContentCatalog course module not in any LearningPath
 * - LP-008: Module type/href mismatch (e.g., type: 'quiz' but href in presentations/)
 * - LP-009: courseHref points to non-existent file
 * - LP-010: Prerequisite module has non-available catalog status (blocks progression)
 *
 * Created: 2026-02-07 (after comptia-linux 404 bug)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const PathValidator = require('./paths');
const ModuleRegistryGenerator = require('../../registry/module-registry');

// Known house folders (actual directories under houses/)
const HOUSE_FOLDERS = ['shield', 'web', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];

// Certification paths that are NOT actual house folders
const CERTIFICATION_PATHS = ['comptia-linux', 'linux-mastery', 'wsa', 'devops-fundamentals', 'aplus-core1', 'aplus-core2'];

class LearningPathsValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.learningPathsFile = options.learningPathsFile || './components/LearningPaths.js';
        this.registryPath = options.registryPath || './_tools/reports/MODULE_REGISTRY.json';

        this.catalogFile = options.catalogFile || 'components/ContentCatalog.js';
        this._catalogCache = null;

        // Reuse PathValidator's file indexing capability
        this.pathValidator = new PathValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });

        // Load module registry if available
        this.registry = this.loadRegistry();
    }

    /**
     * Load the module registry for moduleId lookups
     */
    loadRegistry() {
        const absolutePath = path.resolve(this.registryPath);
        if (fs.existsSync(absolutePath)) {
            try {
                return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
            } catch (e) {
                if (this.verbose) {
                    console.log('[LP] Could not load module registry:', e.message);
                }
            }
        }
        return null;
    }

    /**
     * Find a file in registry by searching for similar moduleIds
     * @param {string} href - The broken href to match
     * @param {string} house - The expected house
     * @returns {Object|null} Match info or null
     */
    findInRegistry(href, house) {
        if (!this.registry || !this.registry.modules) return null;

        const filename = path.basename(href, '.html');
        const searchTerms = filename.toLowerCase()
            .replace(/[-_]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);

        // Detect expected type from href path
        const expectedType = this.detectExpectedType(href);

        // Build potential moduleId patterns to search for
        // Include type suffix variations
        const potentialIds = [];
        if (house) {
            // Try with type suffix first (e.g., web-ospf-presentation)
            if (expectedType) {
                potentialIds.push(`${house}-${filename.toLowerCase().replace(/[_\s]+/g, '-')}-${expectedType}`);
            }
            potentialIds.push(`${house}-${filename.toLowerCase().replace(/[_\s]+/g, '-')}`);
        }
        if (expectedType) {
            potentialIds.push(`${filename.toLowerCase().replace(/[_\s]+/g, '-')}-${expectedType}`);
        }
        potentialIds.push(filename.toLowerCase().replace(/[_\s]+/g, '-'));

        // First: exact moduleId match
        for (const id of potentialIds) {
            if (this.registry.modules[id]) {
                const regPath = this.registry.modules[id].path;
                return {
                    path: regPath.startsWith('houses/') ? regPath : 'houses/' + regPath,
                    moduleId: id,
                    confidence: 0.98,
                    reason: `Exact registry match: ${id}`,
                    source: 'registry'
                };
            }
        }

        // Second: partial moduleId match with type preference
        const matches = [];
        for (const [moduleId, info] of Object.entries(this.registry.modules)) {
            // Skip if different house (strict house matching)
            if (house && info.house && info.house !== house) continue;

            // Check if moduleId contains search terms
            const moduleIdLower = moduleId.toLowerCase();
            const matchedTerms = searchTerms.filter(term => moduleIdLower.includes(term));

            if (matchedTerms.length >= Math.ceil(searchTerms.length * 0.6)) {
                const regPath = info.path;

                // Type matching bonus: boost score if types align
                let typeBonus = 0;
                if (expectedType && info.type === expectedType) {
                    typeBonus = 0.3;  // Significant boost for type match
                } else if (expectedType && info.type !== expectedType) {
                    typeBonus = -0.2;  // Penalty for type mismatch
                }

                matches.push({
                    moduleId,
                    path: regPath.startsWith('houses/') ? regPath : 'houses/' + regPath,
                    house: info.house,
                    type: info.type,
                    matchScore: (matchedTerms.length / searchTerms.length) + typeBonus,
                    typeMatch: expectedType === info.type
                });
            }
        }

        if (matches.length > 0) {
            // Sort by match score
            matches.sort((a, b) => b.matchScore - a.matchScore);
            const best = matches[0];

            return {
                path: best.path,
                moduleId: best.moduleId,
                confidence: best.matchScore * 0.9,
                reason: `Registry partial match: ${best.moduleId}`,
                source: 'registry',
                alternatives: matches.slice(1, 4).map(m => ({
                    moduleId: m.moduleId,
                    path: m.path
                }))
            };
        }

        return null;
    }

    /**
     * Detect expected content type from href path
     * @param {string} href - The href to analyze
     * @returns {string|null} Expected type or null
     */
    detectExpectedType(href) {
        const hrefLower = href.toLowerCase();

        // Check for path patterns (with or without leading slash)
        if (hrefLower.includes('presentations/') || hrefLower.startsWith('presentations/') ||
            hrefLower.includes('-presentation.') || hrefLower.includes('_presentation.')) {
            return 'presentation';
        }
        if (hrefLower.includes('quizzes/') || hrefLower.startsWith('quizzes/') ||
            hrefLower.includes('-quiz.') || hrefLower.includes('_quiz.')) {
            return 'quiz';
        }
        if (hrefLower.includes('labs/') || hrefLower.startsWith('labs/') ||
            hrefLower.includes('-lab.') || hrefLower.includes('_lab.')) {
            return 'lab';
        }
        if (hrefLower.includes('applets/') || hrefLower.startsWith('applets/') ||
            hrefLower.includes('visualizers/') || hrefLower.startsWith('visualizers/')) {
            return 'applet';
        }

        return null;
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
            housePaths: 0,
            brokenPrereqs: 0,
            circularChains: 0,
            missingFromCatalog: 0,
            unchainedModules: 0
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

                // LP-008: Module type/href mismatch
                if (module.type && module.href) {
                    const expectedType = this.detectExpectedType(module.href);
                    if (expectedType && module.type !== expectedType) {
                        issues.push({
                            code: 'LP-008',
                            severity: 'medium',
                            category: 'learning-paths',
                            message: `Module '${module.id}' declares type '${module.type}' but href points to ${expectedType} content: '${module.href}'`,
                            file: this.learningPathsFile,
                            pathId,
                            moduleId: module.id,
                            declaredType: module.type,
                            detectedType: expectedType,
                            href: module.href,
                            fix: `Change type to '${expectedType}' or move the file to the correct directory`
                        });
                    }
                }
            }
        }

        // LP-009: courseHref points to non-existent file
        for (const [pathId, pathData] of Object.entries(paths)) {
            if (!pathData.courseHref) continue;

            const courseHref = pathData.courseHref;
            const resolvedPath = path.resolve(this.rootPath, courseHref);

            if (!fs.existsSync(resolvedPath)) {
                issues.push({
                    code: 'LP-009',
                    severity: 'high',
                    category: 'learning-paths',
                    message: `Path '${pathId}' courseHref '${courseHref}' does not resolve to an existing file`,
                    file: this.learningPathsFile,
                    pathId,
                    courseHref,
                    expectedPath: resolvedPath.replace(path.resolve(this.rootPath) + '/', ''),
                    fix: `Create the file at '${courseHref}' or fix the courseHref path`
                });
            }
        }

        // LP-004: Broken prerequisite references
        const prereqGraph = this._buildPrerequisiteGraph(paths);
        for (const [moduleId, prereqs] of prereqGraph) {
            for (const prereqId of prereqs) {
                if (!seenIds.has(prereqId)) {
                    stats.brokenPrereqs++;
                    issues.push({
                        code: 'LP-004',
                        severity: 'high',
                        category: 'learning-paths',
                        message: `Module '${moduleId}' lists prerequisite '${prereqId}' which does not exist in any learning path`,
                        file: this.learningPathsFile,
                        moduleId,
                        prerequisiteId: prereqId,
                        pathId: seenIds.get(moduleId),
                        fix: `Fix the prerequisite ID '${prereqId}' in module '${moduleId}' or add the missing module`
                    });
                }
            }
        }

        // LP-005: Circular prerequisite chains
        const cycles = this._detectCycles(prereqGraph);
        for (const cycle of cycles) {
            stats.circularChains++;
            issues.push({
                code: 'LP-005',
                severity: 'high',
                category: 'learning-paths',
                message: `Circular prerequisite chain detected: ${cycle.join(' -> ')}`,
                file: this.learningPathsFile,
                cycle,
                fix: `Break the circular dependency in the chain: ${cycle.join(' -> ')}`
            });
        }

        // LP-006 & LP-007: Cross-reference with ContentCatalog
        const catalog = this._loadContentCatalog();
        if (catalog) {
            const catalogIds = new Set(catalog.MODULES.map(m => m.id));

            // Build prefix-tolerant lookup: catalog often house-prefixes ids
            // (e.g., 'code-pyh-graphics-01') while LP references the bare form
            // ('pyh-graphics-01'). Match either way to avoid false positives.
            const catalogIdsByStripped = new Map();  // stripped -> [houseId-prefixed ids]
            for (const m of catalog.MODULES) {
                if (!m.id) continue;
                const houseStripPattern = /^([a-z-]+?)-(.+)$/;
                const match = m.id.match(houseStripPattern);
                if (match) {
                    const stripped = match[2];
                    if (!catalogIdsByStripped.has(stripped)) catalogIdsByStripped.set(stripped, []);
                    catalogIdsByStripped.get(stripped).push(m.id);
                }
            }

            // LP-006: LP module not in ContentCatalog (with prefix-tolerant matching)
            for (const [moduleId] of seenIds) {
                if (catalogIds.has(moduleId)) continue;
                // Try house-prefixed forms (catalog has e.g. 'code-pyh-...' for LP 'pyh-...')
                if (catalogIdsByStripped.has(moduleId)) continue;
                stats.missingFromCatalog++;
                issues.push({
                    code: 'LP-006',
                    severity: 'low',  // Informational: module works fine, just not in ContentCatalog
                    category: 'learning-paths',
                    message: `LearningPaths module '${moduleId}' has no matching entry in ContentCatalog`,
                    file: this.learningPathsFile,
                    moduleId,
                    pathId: seenIds.get(moduleId),
                    fix: `Add module '${moduleId}' to ContentCatalog.js or remove it from LearningPaths`
                });
            }

            // LP-007: ContentCatalog course module not in any LP
            // Only flag modules with a category (course-structured content)
            // Exclude non-sequential content: review games, standalone games, index pages, tools, certificates
            const NON_SEQUENTIAL_COMPONENTS = ['review', 'game', 'reference'];
            for (const module of catalog.MODULES) {
                if (!module.category) continue;
                // Skip modules whose components are entirely non-sequential
                if (module.components && module.components.length > 0 &&
                    module.components.every(c => NON_SEQUENTIAL_COMPONENTS.includes(c))) {
                    continue;
                }
                // Skip house index pages and certificate modules
                if (module.href && (module.href.endsWith('index.html') || module.id.endsWith('-certificate'))) {
                    continue;
                }
                if (!seenIds.has(module.id)) {
                    stats.unchainedModules++;
                    issues.push({
                        code: 'LP-007',
                        severity: 'low',
                        category: 'learning-paths',
                        message: `ContentCatalog module '${module.id}' (${module.house}) is not in any learning path`,
                        file: this.learningPathsFile,
                        moduleId: module.id,
                        house: module.house,
                        catalogCategory: module.category,
                        fix: `Add module '${module.id}' to the appropriate learning path or mark it as standalone`
                    });
                }
            }
            // LP-010: Prerequisite module has non-available catalog status (blocks progression)
            const catalogStatusMap = new Map();
            for (const mod of catalog.MODULES) {
                catalogStatusMap.set(mod.id, mod.status);
            }

            // Find modules referenced as prerequisites whose catalog status is not 'available'
            const prereqGraphForStatus = this._buildPrerequisiteGraph(paths);
            for (const [moduleId, prereqs] of prereqGraphForStatus) {
                for (const prereqId of prereqs) {
                    const status = catalogStatusMap.get(prereqId);
                    if (status && status !== 'available') {
                        issues.push({
                            code: 'LP-010',
                            severity: 'medium',
                            category: 'learning-paths',
                            message: `Prerequisite '${prereqId}' has catalog status '${status}' — blocks progression for '${moduleId}'`,
                            file: this.learningPathsFile,
                            moduleId,
                            prerequisiteId: prereqId,
                            catalogStatus: status,
                            fix: `Set module '${prereqId}' status to 'available' in ContentCatalog or remove it from the prerequisite chain`
                        });
                    }
                }
            }
        } else if (this.verbose) {
            console.log('[LP] ContentCatalog not available, skipping LP-006/LP-007/LP-010');
        }

        // Sort by severity
        issues.sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3, warning: 4, suspect: 5, info: 6 };
            return (order[a.severity] || 7) - (order[b.severity] || 7);
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
                    const pathEntry = { modules };

                    // Capture courseHref if defined (used by dashboard for path-type resolution)
                    const beforeModules = afterKey.slice(0, modulesStart);
                    const courseHrefMatch = beforeModules.match(/courseHref:\s*['"]([^'"]+)['"]/);
                    if (courseHrefMatch) {
                        pathEntry.courseHref = courseHrefMatch[1];
                    }

                    paths[pathId] = pathEntry;
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

            // Extract prerequisites array
            const prereqMatch = block.match(/prerequisites:\s*\[([^\]]*)\]/);
            const prerequisites = prereqMatch
                ? prereqMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || []
                : [];

            // Extract type field (e.g., type: 'quiz')
            const typeMatch = block.match(/type:\s*['"]([^'"]+)['"]/);
            const type = typeMatch ? typeMatch[1] : null;

            if (idMatch && hrefMatch) {
                modules.push({
                    id: idMatch[1],
                    href: hrefMatch[1],
                    type,
                    prerequisites
                });
            } else if (hrefMatch) {
                // Some modules might have href but different id format
                const titleMatch = block.match(/title:\s*['"]([^'"]+)['"]/);
                modules.push({
                    id: titleMatch ? titleMatch[1] : 'unknown',
                    href: hrefMatch[1],
                    type,
                    title: titleMatch ? titleMatch[1] : undefined,
                    prerequisites
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
                // Try to find the file using registry
                const suggestion = this.findActualFile(href, null);
                return {
                    valid: false,
                    message: `Certification path '${pathId}' uses relative href '${href}' but no houseFolder specified`,
                    expectedPath: `houses/${pathId}/${href} (doesn't exist)`,
                    suggestion,
                    fix: suggestion
                        ? `Change href to: '${suggestion.path}'`
                        : `Change href to full path starting with 'houses/'. Use EduScan to find the correct path.`
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

        // File doesn't exist - try to find it using registry and file index
        // Pass the house context for better matching
        const houseHint = isHousePath ? pathId : this.guessHouseFolder(href);
        const suggestion = this.findActualFile(href, houseHint);

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
     * Try to find the actual file location
     * Priority: 1. Registry lookup  2. File index  3. Fuzzy matching
     */
    findActualFile(href, house = null) {
        const filename = path.basename(href);
        const ext = path.extname(href) || '.html';
        const baseName = path.basename(filename, ext);

        // First: Try registry-based lookup (most accurate)
        const registryMatch = this.findInRegistry(href, house);
        if (registryMatch && registryMatch.confidence >= 0.9) {
            return registryMatch;
        }

        // Second: Use PathValidator's existing file index for exact filename match
        let matches = this.pathValidator.findFileInCodebase(filename, ext);

        // If exact match found, use it
        if (matches.length > 0) {
            const hrefDir = path.dirname(href);
            let bestMatch = matches[0];

            // Prefer matches that share directory structure hints
            for (const match of matches) {
                if (match.path.includes(hrefDir) || hrefDir.split('/').some(d => match.path.includes(d))) {
                    bestMatch = match;
                    break;
                }
            }

            const relativePath = path.relative(this.rootPath, bestMatch.path).replace(/\\/g, '/');
            return {
                path: relativePath,
                confidence: 0.95,
                reason: `Exact filename match at ${bestMatch.subtree}`,
                source: 'file-index',
                allMatches: matches.slice(0, 5).map(m => ({
                    path: path.relative(this.rootPath, m.path).replace(/\\/g, '/'),
                    subtree: m.subtree
                }))
            };
        }

        // Third: If registry had a lower-confidence match, use it
        if (registryMatch) {
            return registryMatch;
        }

        // Fourth: Fall back to fuzzy matching (least reliable)
        matches = this.findSimilarFiles(baseName, ext);

        if (matches.length === 0) {
            return null;
        }

        // Find best match - prefer same subtree pattern
        const hrefDir = path.dirname(href);
        let bestMatch = matches[0];

        for (const match of matches) {
            if (match.path.includes(hrefDir) || hrefDir.split('/').some(d => match.path.includes(d))) {
                bestMatch = match;
                break;
            }
        }

        const relativePath = path.relative(this.rootPath, bestMatch.path).replace(/\\/g, '/');

        return {
            path: relativePath,
            confidence: 0.6,  // Lower confidence for fuzzy matches
            reason: `Fuzzy match: ${path.basename(bestMatch.path)}`,
            source: 'fuzzy',
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
     * Load ContentCatalog.js in a VM sandbox (cached)
     * @returns {Object|null} { HOUSES, MODULES } or null on failure
     */
    _loadContentCatalog() {
        if (this._catalogCache !== null) return this._catalogCache;

        const absolutePath = path.resolve(this.rootPath, this.catalogFile);

        if (!fs.existsSync(absolutePath)) {
            if (this.verbose) {
                console.log(`[LP] ContentCatalog.js not found at ${absolutePath}`);
            }
            this._catalogCache = false;
            return null;
        }

        try {
            const code = fs.readFileSync(absolutePath, 'utf8');
            const context = vm.createContext({ window: {} });
            vm.runInContext(code, context);

            const catalog = context.window.ContentCatalog;
            if (!catalog || !catalog.HOUSES || !catalog.MODULES) {
                if (this.verbose) {
                    console.log('[LP] ContentCatalog loaded but missing HOUSES or MODULES');
                }
                this._catalogCache = false;
                return null;
            }

            if (this.verbose) {
                console.log(`[LP] Loaded ContentCatalog: ${catalog.MODULES.length} modules`);
            }

            this._catalogCache = catalog;
            return catalog;
        } catch (err) {
            if (this.verbose) {
                console.log(`[LP] Failed to load ContentCatalog: ${err.message}`);
            }
            this._catalogCache = false;
            return null;
        }
    }

    /**
     * Build a prerequisite graph from parsed learning paths
     * @param {Object} paths - Parsed paths object from parseLearningPaths()
     * @returns {Map} moduleId -> [prerequisiteIds]
     */
    _buildPrerequisiteGraph(paths) {
        const graph = new Map();
        for (const pathData of Object.values(paths)) {
            if (!pathData.modules) continue;
            for (const module of pathData.modules) {
                if (module.id && module.prerequisites && module.prerequisites.length > 0) {
                    graph.set(module.id, module.prerequisites);
                }
            }
        }
        return graph;
    }

    /**
     * Detect cycles in a prerequisite graph using DFS
     * @param {Map} graph - moduleId -> [prerequisiteIds]
     * @returns {Array} Array of cycle paths (e.g., ['a', 'b', 'c', 'a'])
     */
    _detectCycles(graph) {
        const cycles = [];
        const visited = new Set();
        const inStack = new Set();

        const dfs = (node, pathStack) => {
            if (inStack.has(node)) {
                // Found a cycle — extract it from where the repeat starts
                const cycleStart = pathStack.indexOf(node);
                cycles.push([...pathStack.slice(cycleStart), node]);
                return;
            }
            if (visited.has(node)) return;

            visited.add(node);
            inStack.add(node);
            pathStack.push(node);

            const prereqs = graph.get(node) || [];
            for (const prereq of prereqs) {
                // Only follow edges that exist in the graph (valid module IDs)
                if (graph.has(prereq) || inStack.has(prereq)) {
                    dfs(prereq, pathStack);
                }
            }

            pathStack.pop();
            inStack.delete(node);
        };

        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        }

        return cycles;
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
