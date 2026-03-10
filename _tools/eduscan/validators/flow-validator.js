/**
 * EduScan - Flow Validator (FLOW-001)
 *
 * Detects pedagogically orphaned content — files that exist in isolation
 * with no "before" or "after" in any learning progression.
 *
 * This is DIFFERENT from OrphanDetector which checks file *reachability*
 * (can a file be reached from entry points via links). FlowValidator checks
 * *pedagogical connectivity* — is the file part of a defined learning path?
 *
 * A content file is considered "chained" if ANY of these is true:
 *   1. LP-direct: Its path appears as an href in LearningPaths.js
 *   2. Registry-via-LP: It's a component of a ContentRegistry entry whose
 *      paths[] references a learning path that exists in LearningPaths.js
 *   3. Course directory: It lives inside a course directory (courses/)
 *
 * Issue codes:
 *   FLOW-001: Unchained content — not part of any learning progression
 */

const fs = require('fs');
const path = require('path');
const LearningPathsValidator = require('./syntax/learning-paths');
const ContentCatalogValidator = require('./syntax/content-catalog');

// Known house folders (mirrors learning-paths.js)
const HOUSE_FOLDERS = ['shield', 'web', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];

// Content file extensions that are trackable
const TRACKABLE_EXTENSIONS = [
    '.presentation.html',
    '.lab.html',
    '.quiz.html',
    '.applet.html',
    '.tool.html',
    '.module.html'
];

// Course directory patterns (files here are chained by structure)
const COURSE_DIR_PATTERN = /\/courses\//;

// Dark-arts exclusion (intentionally gated, different philosophy)
const DARK_ARTS_PATTERN = /(?:^|\/|\\)dark-arts(?:\/|\\)/i;

class FlowValidator {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;

        // Reuse LearningPathsValidator for parsing LP data
        this.lpValidator = new LearningPathsValidator({
            rootPath: this.rootPath,
            verbose: this.verbose
        });

        // Reuse ContentCatalogValidator for loading catalog data
        this.catalogValidator = new ContentCatalogValidator({
            rootPath: this.rootPath,
            verbose: this.verbose
        });
    }

    /**
     * Detect unchained content files
     * @param {Array} contentFiles - Array of content file objects from parser
     * @param {Object} registry - Parsed registry object
     * @returns {Object} { issues, unchained, chained, summary }
     */
    detect(contentFiles, registry) {
        const results = {
            issues: [],
            unchained: [],
            chained: [],
            summary: {
                totalTrackable: 0,
                chained: 0,
                unchained: 0,
                byHouse: {},
                byType: {}
            }
        };

        // Build the set of chained paths
        const chainedSet = this._buildChainedSet(registry);

        if (this.verbose) {
            console.log(`[FLOW] Chained set contains ${chainedSet.size} paths`);
        }

        // Check each content file
        for (const file of contentFiles) {
            // Only check trackable content types
            if (!this._isTrackable(file.path)) continue;

            // Exclude dark-arts content
            if (DARK_ARTS_PATTERN.test(file.path)) continue;

            results.summary.totalTrackable++;

            // Normalize path for comparison
            const normalizedPath = this._normalizePath(file.path);
            const house = this._inferHouse(file.path);
            const contentType = this._inferContentType(file.path);

            // Check if chained
            if (this._isChained(normalizedPath, file.path, chainedSet)) {
                results.chained.push({
                    path: file.path,
                    house,
                    contentType
                });
                results.summary.chained++;
            } else {
                results.unchained.push({
                    path: file.path,
                    house,
                    contentType
                });

                results.issues.push({
                    code: 'FLOW-001',
                    severity: 'low',  // Informational — content works, just not in a structured path
                    category: 'flow',
                    message: `Unchained content: '${file.path}' is not part of any learning progression`,
                    file: file.path,
                    house,
                    contentType,
                    fix: 'Add to a LearningPaths.js path, reference from a registry entry with paths[], or place in a course directory'
                });

                results.summary.unchained++;

                // Track by house
                if (house) {
                    results.summary.byHouse[house] = (results.summary.byHouse[house] || 0) + 1;
                }
                // Track by type
                if (contentType) {
                    results.summary.byType[contentType] = (results.summary.byType[contentType] || 0) + 1;
                }
            }
        }

        if (this.verbose) {
            console.log(`[FLOW] ${results.summary.chained} chained, ${results.summary.unchained} unchained out of ${results.summary.totalTrackable} trackable files`);
        }

        return results;
    }

    /**
     * Build a Set of normalized paths that are considered "chained"
     * @param {Object} registry - Parsed registry object
     * @returns {Set<string>}
     */
    _buildChainedSet(registry) {
        const chained = new Set();

        // === Source 1: LearningPaths.js direct hrefs ===
        this._addLearningPathHrefs(chained);

        // === Source 2: Registry entries with paths[] referencing LP ===
        this._addRegistryLinkedPaths(chained, registry);

        // === Source 3: Course directory paths (added during check, not here) ===
        // Course directory membership is checked at query time in _isChained()

        // === Source 4: ArcticData.js module hrefs ===
        // Arctic Linux districts (LM, CLH, LA) use ArcticData.js for their
        // learning progression instead of LearningPaths.js. Without this,
        // all 359 Arctic modules appear as FLOW-001 false positives.
        this._addArcticDataHrefs(chained);

        return chained;
    }

    /**
     * Parse LearningPaths.js and add all module hrefs to the chained set
     */
    _addLearningPathHrefs(chained) {
        const lpFile = path.resolve(this.rootPath, 'components/LearningPaths.js');

        if (!fs.existsSync(lpFile)) {
            if (this.verbose) {
                console.log('[FLOW] LearningPaths.js not found');
            }
            return;
        }

        const lpContent = fs.readFileSync(lpFile, 'utf8');
        const paths = this.lpValidator.parseLearningPaths(lpContent);

        if (!paths) {
            if (this.verbose) {
                console.log('[FLOW] Could not parse LearningPaths.js');
            }
            return;
        }

        // Store path IDs for registry-via-LP check
        this._lpPathIds = new Set(Object.keys(paths));

        let count = 0;
        for (const [pathId, pathData] of Object.entries(paths)) {
            if (!pathData.modules) continue;

            for (const mod of pathData.modules) {
                if (!mod.href) continue;

                const resolved = this._resolveLPHref(mod.href, pathId);
                if (resolved) {
                    chained.add(resolved);
                    count++;
                }
            }
        }

        if (this.verbose) {
            console.log(`[FLOW] Added ${count} hrefs from ${Object.keys(paths).length} learning paths`);
        }
    }

    /**
     * Check registry entries: if an entry has paths[] that reference a
     * known LP path, all its componentPaths are chained
     */
    _addRegistryLinkedPaths(chained, registry) {
        if (!registry || !registry.entries) return;
        if (!this._lpPathIds || this._lpPathIds.size === 0) return;

        let count = 0;
        for (const entry of registry.entries) {
            // Extract paths[] from the raw entry text
            const entryPaths = this._extractRegistryPaths(entry);

            if (entryPaths.length === 0) continue;

            // Check if any path ID matches a known LP path
            const hasLPLink = entryPaths.some(p => this._lpPathIds.has(p));
            if (!hasLPLink) continue;

            // This entry is LP-linked — add all component paths
            const componentPaths = this._extractComponentPaths(entry);
            for (const cp of componentPaths) {
                const normalized = this._normalizeRegistryPath(cp);
                if (normalized) {
                    chained.add(normalized);
                    count++;
                }
            }
        }

        if (this.verbose) {
            console.log(`[FLOW] Added ${count} component paths from registry-via-LP entries`);
        }
    }

    /**
     * Parse ArcticData.js and add all module hrefs to the chained set.
     * ArcticData.js contains 16 districts with ~359 modules, each with
     * relative hrefs like '../../../houses/script/linux/...'
     */
    _addArcticDataHrefs(chained) {
        const arcticFile = path.resolve(this.rootPath, 'arctic/ArcticData.js');
        if (!fs.existsSync(arcticFile)) {
            if (this.verbose) console.log('[FLOW] ArcticData.js not found');
            return;
        }

        const content = fs.readFileSync(arcticFile, 'utf8');

        // Extract all href values from ArcticData module definitions
        const hrefPattern = /href:\s*['"]([^'"]+\.html)['"]/g;
        let match;
        let count = 0;

        while ((match = hrefPattern.exec(content)) !== null) {
            let href = match[1];
            // ArcticData hrefs are relative to district pages: ../../../houses/...
            // Strip leading ../ segments to get the houses/... canonical form
            href = href.replace(/^(?:\.\.\/)+/, '');
            const normalized = this._normalizePath(href);
            if (normalized) {
                chained.add(normalized);
                count++;
            }
        }

        if (this.verbose) {
            console.log(`[FLOW] Added ${count} hrefs from ArcticData.js`);
        }
    }

    /**
     * Resolve an LP href to a canonical houses/... form
     * Parser paths use format: houses/{house}/... (no _app/ prefix)
     * @param {string} href - The href from LearningPaths.js
     * @param {string} pathId - The path ID (e.g., 'shield', 'comptia-linux')
     * @returns {string|null} Normalized canonical path
     */
    _resolveLPHref(href, pathId) {
        let canonical;

        if (href.startsWith('houses/')) {
            // Already canonical
            canonical = href;
        } else if (HOUSE_FOLDERS.includes(pathId)) {
            // House path — prepend houses/{pathId}/
            canonical = `houses/${pathId}/${href}`;
        } else {
            // Cert path — hrefs should already be full houses/... paths
            // If not, try to use the href as-is (some cert paths use full paths)
            canonical = href;
        }

        return this._normalizePath(canonical);
    }

    /**
     * Extract the paths[] array values from a registry entry's raw text
     * e.g., paths: ['comptia-aplus', 'windows-admin'] → ['comptia-aplus', 'windows-admin']
     */
    _extractRegistryPaths(entry) {
        if (!entry.raw) return [];

        const match = entry.raw.match(/paths:\s*\[([^\]]*)\]/);
        if (!match) return [];

        const pathIds = [];
        const idPattern = /['"]([^'"]+)['"]/g;
        let m;
        while ((m = idPattern.exec(match[1])) !== null) {
            pathIds.push(m[1]);
        }

        return pathIds;
    }

    /**
     * Extract all component file paths from a registry entry
     */
    _extractComponentPaths(entry) {
        const paths = [];

        // Extract from components object
        if (entry.raw) {
            const componentPattern = /(?:presentation|lab|quiz|applet|tool|module|index|href):\s*['"]([^'"]+\.html)['"]/gi;
            let match;
            while ((match = componentPattern.exec(entry.raw)) !== null) {
                paths.push(match[1]);
            }
        }

        // Also include the entry's main path if present
        if (entry.path && entry.path.endsWith('.html')) {
            paths.push(entry.path);
        }

        return paths;
    }

    /**
     * Normalize a registry component path to the canonical form used for comparison
     * Registry paths are relative to _app/, like 'houses/forge/labs/...'
     * Parser paths also use this format (no _app/ prefix)
     */
    _normalizeRegistryPath(componentPath) {
        // Strip _app/ prefix if present (registry paths shouldn't have it, but be safe)
        let normalized = componentPath.replace(/^_app\//, '');
        return this._normalizePath(normalized);
    }

    /**
     * Check if a file is considered chained
     */
    _isChained(normalizedPath, originalPath, chainedSet) {
        // Check 1: Direct membership in chained set
        if (chainedSet.has(normalizedPath)) return true;

        // Check 2: Course directory membership
        if (COURSE_DIR_PATTERN.test(originalPath)) return true;

        return false;
    }

    /**
     * Check if a file path represents trackable content
     */
    _isTrackable(filePath) {
        const lower = filePath.toLowerCase();
        return TRACKABLE_EXTENSIONS.some(ext => lower.endsWith(ext));
    }

    /**
     * Normalize a path for consistent comparison
     * Strips leading ./ and _app/, lowercases, forward-slashes
     */
    _normalizePath(filePath) {
        return filePath
            .replace(/\\/g, '/')
            .replace(/^\.\//, '')
            .toLowerCase();
    }

    /**
     * Infer house from file path
     */
    _inferHouse(filePath) {
        const match = filePath.match(/houses\/(\w+)\//);
        return match ? match[1] : null;
    }

    /**
     * Infer content type from file extension
     */
    _inferContentType(filePath) {
        const lower = filePath.toLowerCase();
        for (const ext of TRACKABLE_EXTENSIONS) {
            if (lower.endsWith(ext)) {
                return ext.replace(/^\./, '').replace(/\.html$/, '');
            }
        }
        return 'unknown';
    }
}

module.exports = FlowValidator;
