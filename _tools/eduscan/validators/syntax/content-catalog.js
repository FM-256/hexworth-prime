/**
 * EduScan - ContentCatalog Validator
 *
 * Validates that all hrefs in ContentCatalog.js resolve to existing files on disk.
 * Uses Node's vm module to safely execute the browser IIFE in a sandbox.
 *
 * Issue types detected:
 * - CAT-001: Module status 'available' but href file doesn't exist on disk (CRITICAL)
 * - CAT-002: HTML file in house directory not declared in any catalog module (MEDIUM)
 * - CAT-003: Module status 'available' with empty/missing href (HIGH)
 * - CAT-004: Module status not 'available' but href doesn't exist on disk (WARNING)
 * - CAT-005: Duplicate module IDs in ContentCatalog (HIGH)
 * - CAT-006: Suffix-polluted module ID (CAT-002 deriveModuleId artifact).
 *            Catalog id ends with .module/.tool/.lab/.quiz/.applet — these
 *            are file-extension fragments leaked into ID generation. Hub
 *            inline arrays use the clean form (no suffix). Mismatch causes
 *            scanner Mech 4 to miss matches without suffix-stripping
 *            workaround. Added 2026-04-30 (Stragglers branch). MEDIUM.
 * - CAT-007: Duplicate (house, href) — multiple catalog entries point to
 *            the same content file. Examples found in Stragglers audit:
 *            clh-001 + script-clh-001 (CLH parent dual-naming), web-ip-*
 *            triples for subnetting practice. Either dual-naming was
 *            intentional (legacy id + new id during migration) or one of
 *            the entries is dead code. Operator decision needed —
 *            validator flags but doesn't auto-resolve. Added 2026-04-30. MEDIUM.
 *
 * Created: 2026-02-13 (after pod-crossing 404 bug)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// File patterns that indicate navigable content (for CAT-002 reverse check)
const CONTENT_PATTERNS = [
    /\.presentation\.html$/,
    /\.quiz\.html$/,
    /\.lab\.html$/,
    /\.applet\.html$/,
    /\.tool\.html$/,
    /\.module\.html$/
];

class ContentCatalogValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        // appRoot is the APP ROOT (the directory holding config/ and components/), which is
        // fixed regardless of which subtree a scan walks. Defaults to rootPath so a canonical
        // full scan behaves exactly as before. Global, app-wide assets MUST resolve against
        // this, not rootPath: doing otherwise made every scoped scan report app-root files as
        // missing at severity critical, which then blocked deploys (2026-08-04).
        this.appRoot = options.appRoot || this.rootPath;
        this.catalogFile = options.catalogFile || 'components/ContentCatalog.js';
    }

    /**
     * Main entry point — validate all ContentCatalog hrefs
     * @returns {Object} { issues, summary }
     */
    validate() {
        const issues = [];
        const summary = {
            totalModules: 0,
            available: 0,
            missingHrefs: 0,
            undeclared: 0,
            emptyHrefs: 0,
            skipped: 0
        };

        // Load catalog via VM sandbox
        const catalog = this._loadCatalog();
        if (!catalog) {
            issues.push({
                code: 'CAT-001',
                severity: 'critical',
                category: 'content-catalog',
                message: 'Failed to load ContentCatalog.js — cannot validate hrefs',
                file: this.catalogFile,
                fix: 'Ensure ContentCatalog.js exists and is valid JavaScript'
            });
            return { issues, summary };
        }

        // Check all module hrefs (CAT-001 + CAT-003)
        this._checkHrefs(catalog, issues, summary);

        // Reverse check: HTML files in house dirs not in catalog (CAT-002)
        this._checkUndeclared(catalog, issues, summary);

        // CAT-006: Suffix-polluted module IDs
        this._checkSuffixPollution(catalog, issues, summary);

        // CAT-007: Duplicate (house, href) — multiple ids for same file
        this._checkDuplicateHrefs(catalog, issues, summary);

        return { issues, summary };
    }

    /**
     * CAT-007: Multiple catalog entries pointing to the same (house, href).
     * Indicates dual-naming (legacy + new id during migration) OR dead code
     * (one entry is unused). Operator must decide which id to keep — validator
     * flags but doesn't auto-resolve.
     */
    _checkDuplicateHrefs(catalog, issues, summary) {
        const byHref = {};
        for (const m of catalog.MODULES || []) {
            if (!m.href || !m.house) continue;
            const k = m.house + '::' + m.href;
            if (!byHref[k]) byHref[k] = [];
            byHref[k].push(m.id);
        }
        const dups = Object.entries(byHref).filter(([_, ids]) => ids.length > 1);
        if (dups.length === 0) return;
        summary.duplicateHrefs = dups.length;
        summary.duplicateHrefModules = dups.reduce((s, [_, ids]) => s + ids.length, 0);
        for (const [k, ids] of dups) {
            const [house, href] = k.split('::');
            issues.push({
                code: 'CAT-007',
                severity: 'medium',
                category: 'content-catalog',
                message: `${ids.length} catalog ids point to (${house}, ${href}): ${ids.join(', ')}. Either dual-naming or dead code.`,
                file: this.catalogFile,
                fix: `Decide which id to keep (typically the more recent / more descriptive). Remove duplicate(s) from MODULES array.`,
            });
        }
    }

    /**
     * CAT-006: Module IDs ending in file-type suffixes (.module/.tool/.lab/.quiz/.applet).
     * These are CAT-002 deriveModuleId artifacts — file extensions leaked into ID
     * generation. Hub inline arrays use the clean form (no suffix), so Mech 4 of the
     * strict-orphan-scanner only matches via a suffix-stripping workaround. Cleaning
     * the catalog removes the workaround dependency and aligns IDs with hub registrations.
     */
    _checkSuffixPollution(catalog, issues, summary) {
        const SUFFIX_RE = /\.(module|tool|lab|quiz|applet)$/;
        const polluted = [];
        for (const m of catalog.MODULES || []) {
            if (m.id && SUFFIX_RE.test(m.id)) {
                polluted.push(m.id);
            }
        }
        if (polluted.length === 0) return;
        summary.suffixPolluted = polluted.length;
        // Group by suffix for cleaner reporting
        const bySuffix = {};
        for (const id of polluted) {
            const m = id.match(SUFFIX_RE);
            const sfx = m[0];
            if (!bySuffix[sfx]) bySuffix[sfx] = [];
            bySuffix[sfx].push(id);
        }
        for (const [sfx, ids] of Object.entries(bySuffix)) {
            const sample = ids.slice(0, 5).map(i => `  - ${i}`).join('\n');
            const more = ids.length > 5 ? `\n  ... (${ids.length - 5} more)` : '';
            issues.push({
                code: 'CAT-006',
                severity: 'medium',
                category: 'content-catalog',
                message: `${ids.length} catalog id(s) carry trailing '${sfx}' suffix (CAT-002 deriveModuleId artifact). Hub inline arrays use the clean form. Strict-orphan-scanner Mech 4 currently strips this suffix in matching as a workaround. Sample:\n${sample}${more}`,
                file: this.catalogFile,
                fix: `Rename catalog ids to drop trailing '${sfx}'. Verify no runtime consumers reference the suffix-form id (typical: only the scanner does — STR-28).`,
            });
        }
    }

    /**
     * Load ContentCatalog.js in a VM sandbox
     * @returns {Object|null} { HOUSES, MODULES } or null on failure
     */
    _loadCatalog() {
        const absolutePath = path.resolve(this.appRoot, this.catalogFile);

        if (!fs.existsSync(absolutePath)) {
            if (this.verbose) {
                console.log(`[CAT] ContentCatalog.js not found at ${absolutePath}`);
            }
            return null;
        }

        try {
            const code = fs.readFileSync(absolutePath, 'utf8');
            const context = vm.createContext({ window: {} });
            vm.runInContext(code, context);

            const catalog = context.window.ContentCatalog;
            if (!catalog || !catalog.HOUSES || !catalog.MODULES) {
                if (this.verbose) {
                    console.log('[CAT] ContentCatalog loaded but missing HOUSES or MODULES');
                }
                return null;
            }

            if (this.verbose) {
                console.log(`[CAT] Loaded ${catalog.MODULES.length} modules across ${Object.keys(catalog.HOUSES).length} houses`);
            }

            return catalog;
        } catch (err) {
            if (this.verbose) {
                console.log(`[CAT] Failed to execute ContentCatalog.js: ${err.message}`);
            }
            return null;
        }
    }

    /**
     * Check all module hrefs resolve to existing files
     * Emits CAT-001 (missing file), CAT-003 (empty href), CAT-005 (duplicate IDs)
     */
    _checkHrefs(catalog, issues, summary) {
        // CAT-005: Detect duplicate module IDs
        const seenIds = new Map(); // id -> { index, house, title }
        for (let i = 0; i < catalog.MODULES.length; i++) {
            const module = catalog.MODULES[i];
            if (!module.id) continue;

            if (seenIds.has(module.id)) {
                const first = seenIds.get(module.id);
                issues.push({
                    code: 'CAT-005',
                    severity: 'high',
                    category: 'content-catalog',
                    message: `Duplicate module ID '${module.id}' — first in '${first.house}' (${first.title}), duplicate in '${module.house}' (${module.title})`,
                    file: this.catalogFile,
                    moduleId: module.id,
                    firstHouse: first.house,
                    duplicateHouse: module.house,
                    fix: `Give module '${module.id}' a unique ID in one of its occurrences`
                });
            } else {
                seenIds.set(module.id, { index: i, house: module.house, title: module.title });
            }
        }

        for (const module of catalog.MODULES) {
            summary.totalModules++;

            const isAvailable = module.status === 'available';

            if (isAvailable) {
                summary.available++;
            }

            // CAT-003: available module with empty/missing href
            if (!module.href || !module.href.trim()) {
                if (isAvailable) {
                    summary.emptyHrefs++;
                    issues.push({
                        code: 'CAT-003',
                        severity: 'high',
                        category: 'content-catalog',
                        message: `Module '${module.id}' (${module.title}) has empty/missing href`,
                        file: this.catalogFile,
                        moduleId: module.id,
                        house: module.house,
                        fix: 'Add a valid href path to this module'
                    });
                }
                continue;
            }

            // Skip external URLs
            if (module.href.startsWith('http://') || module.href.startsWith('https://')) {
                summary.skipped++;
                continue;
            }

            // Resolve href to absolute disk path
            const house = catalog.HOUSES[module.house];
            if (!house) {
                summary.skipped++;
                continue;
            }

            // Full path = _app/{house.basePath}/{module.href}
            // path.join handles ../ navigation (e.g., dark-arts vault hrefs)
            const resolvedPath = path.resolve(this.appRoot, house.basePath, module.href);

            if (!fs.existsSync(resolvedPath)) {
                if (isAvailable) {
                    // CAT-001: available module with dead href (CRITICAL)
                    summary.missingHrefs++;
                    issues.push({
                        code: 'CAT-001',
                        severity: 'critical',
                        category: 'content-catalog',
                        message: `Module '${module.id}' href '${module.href}' does not exist on disk`,
                        file: this.catalogFile,
                        moduleId: module.id,
                        house: module.house,
                        href: module.href,
                        expectedPath: resolvedPath.replace(path.resolve(this.appRoot) + '/', ''),
                        fix: `Create the file or fix the href for module '${module.id}'`
                    });
                } else {
                    // CAT-004: non-available module with dead href (WARNING)
                    issues.push({
                        code: 'CAT-004',
                        severity: 'warning',
                        category: 'content-catalog',
                        message: `Module '${module.id}' (status: ${module.status}) href '${module.href}' does not exist on disk`,
                        file: this.catalogFile,
                        moduleId: module.id,
                        house: module.house,
                        status: module.status,
                        href: module.href,
                        expectedPath: resolvedPath.replace(path.resolve(this.appRoot) + '/', ''),
                        fix: `Create the file before setting status to 'available', or remove the dead href`
                    });
                }
            }
        }
    }

    /**
     * Reverse check: find HTML files in house dirs that aren't declared in the catalog
     * Scoped to known content patterns to avoid noise from index pages, helpers, etc.
     * Emits CAT-002
     */
    _checkUndeclared(catalog, issues, summary) {
        // Build a set of all resolved catalog paths for fast lookup
        const catalogPaths = new Set();
        for (const module of catalog.MODULES) {
            if (!module.href || module.href.startsWith('http')) continue;
            const house = catalog.HOUSES[module.house];
            if (!house) continue;
            const resolved = path.resolve(this.appRoot, house.basePath, module.href);
            catalogPaths.add(resolved);
        }

        // Scan each house directory for content HTML files
        const housesDir = path.resolve(this.appRoot, 'houses');
        if (!fs.existsSync(housesDir)) return;

        for (const houseId of Object.keys(catalog.HOUSES)) {
            const houseDir = path.resolve(housesDir, houseId);
            if (!fs.existsSync(houseDir)) continue;

            const htmlFiles = this._findHtmlFiles(houseDir);

            for (const filePath of htmlFiles) {
                // Skip archived and source-only content directories
                if (filePath.includes('/_archive/') || filePath.includes('/_source/')) continue;

                // Only check files matching content patterns
                if (!CONTENT_PATTERNS.some(p => p.test(filePath))) continue;

                if (!catalogPaths.has(filePath)) {
                    summary.undeclared++;
                    const relativePath = path.relative(path.resolve(this.appRoot), filePath);
                    issues.push({
                        code: 'CAT-002',
                        severity: 'medium',
                        category: 'content-catalog',
                        message: `Content file '${relativePath}' not declared in ContentCatalog`,
                        file: relativePath,
                        house: houseId,
                        fix: `Add this file as a module in ContentCatalog.js under house '${houseId}'`
                    });
                }
            }
        }
    }

    /**
     * Recursively find all .html files under a directory
     * @param {string} dir - Directory to scan
     * @returns {string[]} Array of absolute file paths
     */
    _findHtmlFiles(dir) {
        const results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    results.push(...this._findHtmlFiles(fullPath));
                } else if (entry.isFile() && entry.name.endsWith('.html')) {
                    results.push(fullPath);
                }
            }
        } catch (err) {
            // Skip unreadable directories
        }
        return results;
    }
}

module.exports = ContentCatalogValidator;
