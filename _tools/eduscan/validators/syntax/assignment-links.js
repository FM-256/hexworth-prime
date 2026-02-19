/**
 * EduScan - Assignment Link Validator
 *
 * Simulates exactly what happens when a student clicks an assignment link
 * on the dashboard. Replays resolveAssignmentHref() logic from dashboard.html
 * for every module and path in LearningPaths.js, verifies the resolved URL
 * points to a real file, and cross-checks PATH_HOUSE_MAP consistency.
 *
 * This does NOT replace the LP validator. LP validates href→file for every
 * module. ASGN validates the assignment resolution pipeline specifically.
 *
 * Issue codes:
 * - ASGN-001: Item-type assignment resolves to nonexistent file
 * - ASGN-002: Path-type assignment can't derive index.html (contentId not in first module href)
 * - ASGN-003: Path-type assignment index.html doesn't exist on disk
 * - ASGN-004: PATH_HOUSE_MAP entry points to nonexistent house directory
 * - ASGN-005: Certification path in LearningPaths has no PATH_HOUSE_MAP entry
 * - ASGN-006: PATH_HOUSE_MAP has entry for path not in LearningPaths (stale mapping)
 *
 * Created: 2026-02-08
 */

const fs = require('fs');
const path = require('path');
const LearningPathsValidator = require('./learning-paths');

// Known house folders (actual directories under houses/)
const HOUSE_FOLDERS = ['shield', 'web', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];

class AssignmentLinkValidator {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.learningPathsFile = options.learningPathsFile || './components/LearningPaths.js';
        this.handlerDashboardFile = options.handlerDashboardFile || './handler-dashboard.html';

        // Reuse LearningPathsValidator for parsing
        this.lpValidator = new LearningPathsValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            learningPathsFile: this.learningPathsFile
        });
    }

    /**
     * Run all assignment link validation checks
     * @returns {Object} { issues, stats }
     */
    validate() {
        const issues = [];
        const stats = {
            itemAssignmentsChecked: 0,
            itemAssignmentsBroken: 0,
            pathAssignmentsChecked: 0,
            pathAssignmentsBroken: 0,
            pathHouseMapEntries: 0,
            pathHouseMapIssues: 0
        };

        // Load and parse LearningPaths.js
        const lpAbsolutePath = path.resolve(this.rootPath, this.learningPathsFile);
        if (!fs.existsSync(lpAbsolutePath)) {
            if (this.verbose) {
                console.log('[ASGN] LearningPaths.js not found, skipping assignment link validation');
            }
            return { issues, stats };
        }

        const lpContent = fs.readFileSync(lpAbsolutePath, 'utf8');
        const paths = this.lpValidator.parseLearningPaths(lpContent);

        if (!paths) {
            if (this.verbose) {
                console.log('[ASGN] Could not parse LearningPaths.js PATHS object');
            }
            return { issues, stats };
        }

        // Load and parse PATH_HOUSE_MAP from handler-dashboard.html
        const handlerAbsPath = path.resolve(this.rootPath, this.handlerDashboardFile);
        let pathHouseMap = {};
        if (fs.existsSync(handlerAbsPath)) {
            const handlerContent = fs.readFileSync(handlerAbsPath, 'utf8');
            pathHouseMap = this.parsePathHouseMap(handlerContent);
            if (this.verbose) {
                console.log(`[ASGN] PATH_HOUSE_MAP: ${Object.keys(pathHouseMap).length} entries`);
            }
        } else if (this.verbose) {
            console.log('[ASGN] handler-dashboard.html not found, PATH_HOUSE_MAP checks skipped');
        }

        // Check 1: Simulate item-type assignments
        const itemIssues = this.simulateItemAssignments(paths, pathHouseMap);
        issues.push(...itemIssues.issues);
        stats.itemAssignmentsChecked = itemIssues.checked;
        stats.itemAssignmentsBroken = itemIssues.broken;

        // Check 2: Simulate path-type assignments
        const pathIssues = this.simulatePathAssignments(paths);
        issues.push(...pathIssues.issues);
        stats.pathAssignmentsChecked = pathIssues.checked;
        stats.pathAssignmentsBroken = pathIssues.broken;

        // Check 3: Cross-check PATH_HOUSE_MAP consistency
        const mapIssues = this.crossCheckPathHouseMap(paths, pathHouseMap);
        issues.push(...mapIssues.issues);
        stats.pathHouseMapEntries = Object.keys(pathHouseMap).length;
        stats.pathHouseMapIssues = mapIssues.issues.length;

        if (this.verbose) {
            console.log(`[ASGN] Items: ${stats.itemAssignmentsChecked} checked, ${stats.itemAssignmentsBroken} broken`);
            console.log(`[ASGN] Paths: ${stats.pathAssignmentsChecked} checked, ${stats.pathAssignmentsBroken} broken`);
            console.log(`[ASGN] MAP:   ${stats.pathHouseMapEntries} entries, ${stats.pathHouseMapIssues} issues`);
        }

        return { issues, stats };
    }

    /**
     * Check 1: Simulate item-type assignment resolution
     *
     * Mirrors dashboard.html:5130-5139:
     *   const mod = LearningPaths.getModule(assignment.contentId);
     *   if (mod.href.startsWith('houses/')) return mod.href;
     *   return 'houses/' + (mod.houseId || assignment.house) + '/' + mod.href;
     *
     * The key insight: getModule() returns { ...module, houseId } where houseId
     * is the PATHS key the module was found under. For cert paths like 'comptia-linux',
     * houseId would be 'comptia-linux' (not a real house dir). The fallback
     * assignment.house comes from PATH_HOUSE_MAP when the instructor assigns it.
     */
    simulateItemAssignments(paths, pathHouseMap) {
        const issues = [];
        let checked = 0;
        let broken = 0;

        for (const [pathId, pathData] of Object.entries(paths)) {
            if (!pathData.modules || !Array.isArray(pathData.modules)) continue;

            const isHouseFolder = HOUSE_FOLDERS.includes(pathId);

            for (const mod of pathData.modules) {
                if (!mod.href) continue;
                checked++;

                // Simulate getModule() — houseId is the pathId key
                const houseId = pathId;

                // Simulate resolveAssignmentHref for item type
                // assignment.house = PATH_HOUSE_MAP[pathId] || pathId
                const assignmentHouse = pathHouseMap[pathId] || pathId;

                let resolvedHref;
                if (mod.href.startsWith('houses/')) {
                    // Full path — use as-is
                    resolvedHref = mod.href;
                } else {
                    // Relative href — prepend house path
                    // Dashboard uses: mod.houseId || assignment.house
                    // mod.houseId = pathId (from getModule), assignment.house = PATH_HOUSE_MAP[pathId] || pathId
                    const house = houseId || assignmentHouse;
                    resolvedHref = 'houses/' + house + '/' + mod.href;
                }

                // Verify file exists on disk
                const absolutePath = path.resolve(this.rootPath, resolvedHref);
                if (!fs.existsSync(absolutePath)) {
                    broken++;

                    // Provide context about why it failed
                    let detail = '';
                    if (!isHouseFolder && !pathHouseMap[pathId]) {
                        detail = ` (houseId='${houseId}' is not a real house dir, and no PATH_HOUSE_MAP entry exists)`;
                    } else if (!isHouseFolder) {
                        detail = ` (houseId='${houseId}' used over PATH_HOUSE_MAP house '${pathHouseMap[pathId]}')`;
                    }

                    issues.push({
                        code: 'ASGN-001',
                        severity: 'critical',
                        category: 'assignment-links',
                        message: `Item assignment for '${mod.id}' resolves to nonexistent file: ${resolvedHref}${detail}`,
                        file: this.learningPathsFile,
                        pathId,
                        moduleId: mod.id,
                        href: mod.href,
                        resolvedHref,
                        fix: mod.href.startsWith('houses/')
                            ? `Fix the href — file does not exist at ${resolvedHref}`
                            : `Either change href to a full path starting with 'houses/', or ensure the file exists at ${resolvedHref}`
                    });
                }
            }
        }

        return { issues, checked, broken };
    }

    /**
     * Check 2: Simulate path-type assignment resolution
     *
     * Mirrors dashboard.html resolveAssignmentHref() for path-type assignments:
     *   1. If pathData.courseHref exists, return it directly
     *   2. Otherwise derive from first module href (strip filename, add index.html)
     *   3. Fallback: 'houses/' + contentId + '/index.html'
     */
    simulatePathAssignments(paths) {
        const issues = [];
        let checked = 0;
        let broken = 0;

        for (const [pathId, pathData] of Object.entries(paths)) {
            if (!pathData.modules || !Array.isArray(pathData.modules) || pathData.modules.length === 0) continue;
            checked++;

            // Step 1: If courseHref is defined, the dashboard uses it directly — skip derivation
            if (pathData.courseHref) {
                const absolutePath = path.resolve(this.rootPath, pathData.courseHref);
                if (!fs.existsSync(absolutePath)) {
                    broken++;
                    issues.push({
                        code: 'ASGN-003',
                        severity: 'high',
                        category: 'assignment-links',
                        message: `Path '${pathId}' courseHref does not exist: ${pathData.courseHref} (latent 404 if instructor assigns this path)`,
                        file: this.learningPathsFile,
                        pathId,
                        resolvedHref: pathData.courseHref,
                        derivedFrom: 'courseHref',
                        fix: `Create ${pathData.courseHref}, or fix the courseHref value in LearningPaths.js`
                    });
                }
                continue;
            }

            // Step 2: No courseHref — derive from first module href
            const firstModule = pathData.modules[0];
            if (!firstModule.href) {
                broken++;
                issues.push({
                    code: 'ASGN-002',
                    severity: 'critical',
                    category: 'assignment-links',
                    message: `Path '${pathId}' first module has no href — can't derive index.html`,
                    file: this.learningPathsFile,
                    pathId,
                    moduleId: firstModule.id,
                    fix: 'Add an href to the first module of this path, or add a courseHref to the path definition'
                });
                continue;
            }

            const parts = firstModule.href.split('/');
            const cidIndex = parts.indexOf(pathId);
            const isHouseFolder = HOUSE_FOLDERS.includes(pathId);
            let resolvedHref;

            if (cidIndex !== -1) {
                // contentId found in href parts — derive index.html via primary path
                resolvedHref = parts.slice(0, cidIndex + 1).join('/') + '/index.html';
            } else {
                // contentId NOT found in first module's href
                // Dashboard falls through to fallback: houses/{contentId}/index.html
                // For house paths this is expected (relative hrefs don't contain house name as segment)
                // For cert paths without courseHref this is a real problem
                issues.push({
                    code: 'ASGN-002',
                    severity: isHouseFolder ? 'info' : 'medium',
                    category: 'assignment-links',
                    message: isHouseFolder
                        ? `Path '${pathId}': resolver uses fallback branch (expected for house paths — relative hrefs don't contain '${pathId}' as path segment)`
                        : `Path '${pathId}': resolver uses fallback branch — contentId not found in first module href '${firstModule.href}', will resolve to 'houses/${pathId}/index.html'`,
                    file: this.learningPathsFile,
                    pathId,
                    moduleId: firstModule.id,
                    firstModuleHref: firstModule.href,
                    branch: 'fallback-used',
                    fix: isHouseFolder
                        ? null
                        : `Add a courseHref to the '${pathId}' path definition, or ensure first module's href contains '${pathId}' as a path segment`
                });

                // Use the fallback path for ASGN-003 check
                resolvedHref = 'houses/' + pathId + '/index.html';
            }

            // Verify derived index.html exists on disk
            const absolutePath = path.resolve(this.rootPath, resolvedHref);
            if (!fs.existsSync(absolutePath)) {
                broken++;
                issues.push({
                    code: 'ASGN-003',
                    severity: 'high',
                    category: 'assignment-links',
                    message: `Path '${pathId}' assignment index.html does not exist: ${resolvedHref} (latent 404 if instructor assigns this path)`,
                    file: this.learningPathsFile,
                    pathId,
                    resolvedHref,
                    derivedFrom: firstModule.href,
                    fix: `Create ${resolvedHref}, or add a courseHref to the '${pathId}' path definition in LearningPaths.js`
                });
            }
        }

        return { issues, checked, broken };
    }

    /**
     * Check 3: Cross-check PATH_HOUSE_MAP against LearningPaths and disk
     */
    crossCheckPathHouseMap(paths, pathHouseMap) {
        const issues = [];

        // Check each PATH_HOUSE_MAP entry
        for (const [mapPathId, houseFolder] of Object.entries(pathHouseMap)) {
            // ASGN-004: Does the house directory exist?
            const houseDirPath = path.resolve(this.rootPath, 'houses', houseFolder);
            if (!fs.existsSync(houseDirPath)) {
                issues.push({
                    code: 'ASGN-004',
                    severity: 'high',
                    category: 'assignment-links',
                    message: `PATH_HOUSE_MAP entry '${mapPathId}' → '${houseFolder}': house directory does not exist at houses/${houseFolder}/`,
                    file: this.handlerDashboardFile,
                    pathId: mapPathId,
                    houseFolder,
                    fix: `Fix PATH_HOUSE_MAP in handler-dashboard.html — '${houseFolder}' is not a valid house directory`
                });
            }

            // ASGN-006: Does the pathId exist in LearningPaths?
            if (!paths[mapPathId]) {
                issues.push({
                    code: 'ASGN-006',
                    severity: 'medium',
                    category: 'assignment-links',
                    message: `PATH_HOUSE_MAP has entry '${mapPathId}' → '${houseFolder}' but '${mapPathId}' is not a path in LearningPaths.js (stale mapping)`,
                    file: this.handlerDashboardFile,
                    pathId: mapPathId,
                    houseFolder,
                    fix: `Remove stale '${mapPathId}' entry from PATH_HOUSE_MAP in handler-dashboard.html, or add the path to LearningPaths.js`
                });
            }
        }

        // ASGN-005: Check cert paths have PATH_HOUSE_MAP entries
        for (const pathId of Object.keys(paths)) {
            // Skip actual house folders — they don't need MAP entries
            if (HOUSE_FOLDERS.includes(pathId)) continue;

            // This is a certification/course path — it should have a MAP entry
            if (!pathHouseMap[pathId]) {
                issues.push({
                    code: 'ASGN-005',
                    severity: 'high',
                    category: 'assignment-links',
                    message: `Certification path '${pathId}' in LearningPaths has no PATH_HOUSE_MAP entry — instructors can't properly assign it`,
                    file: this.handlerDashboardFile,
                    pathId,
                    fix: `Add '${pathId}': '<parent-house>' to PATH_HOUSE_MAP in handler-dashboard.html`
                });
            }
        }

        return { issues };
    }

    /**
     * Parse PATH_HOUSE_MAP from handler-dashboard.html content
     * @param {string} content - handler-dashboard.html file content
     * @returns {Object} { pathId: houseFolder } map
     */
    parsePathHouseMap(content) {
        const map = {};

        // Match the PATH_HOUSE_MAP object: const PATH_HOUSE_MAP = { ... };
        const mapMatch = content.match(/(?:const|let|var)\s+PATH_HOUSE_MAP\s*=\s*\{([^}]+)\}/);
        if (!mapMatch) {
            if (this.verbose) {
                console.log('[ASGN] Could not find PATH_HOUSE_MAP in handler-dashboard.html');
            }
            return map;
        }

        const mapContent = mapMatch[1];

        // Extract key-value pairs: 'key': 'value' or "key": "value"
        const entryPattern = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
        let entryMatch;
        while ((entryMatch = entryPattern.exec(mapContent)) !== null) {
            map[entryMatch[1]] = entryMatch[2];
        }

        return map;
    }
}

module.exports = AssignmentLinkValidator;
