/**
 * EduScan - Coverage Analyzer
 *
 * Analyzes curriculum coverage metrics to identify gaps:
 * - Modules without quizzes
 * - Houses with low assessment density
 * - Courses/paths with incomplete coverage
 *
 * Coverage Metrics:
 * - Per-module: has quiz, has lab, has presentation, assessment count
 * - Per-house: modules, quiz density, lab density, overall score
 * - Per-course/path: same as house but scoped to learning path
 * - Platform-wide: totals, rankings, gap lists
 */

const path = require('path');

class CoverageAnalyzer {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';

        // Content types that count as assessments
        this.assessmentTypes = ['quiz', 'lab'];

        // All trackable content types
        this.contentTypes = ['quiz', 'lab', 'presentation', 'applet'];

        // Known learning paths/courses (prefixes that group content)
        this.knownPaths = [
            { id: 'wsa', name: 'Web Security Analyst', pattern: /wsa[-_]/i },
            { id: 'clh', name: 'Command Line Hero', pattern: /clh[-_]/i },
            { id: 'aplus-core1', name: 'CompTIA A+ Core 1', pattern: /core[-_]?1|aplus[-_]?core[-_]?1/i },
            { id: 'aplus-core2', name: 'CompTIA A+ Core 2', pattern: /core[-_]?2|aplus[-_]?core[-_]?2/i },
            { id: 'network-plus', name: 'CompTIA Network+', pattern: /net(work)?[-_]?plus|n10[-_]/i },
            { id: 'security-plus', name: 'CompTIA Security+', pattern: /sec(urity)?[-_]?plus|sy0[-_]/i },
            { id: 'cyberops', name: 'Cisco CyberOps', pattern: /cyberops/i },
            { id: 'ccna', name: 'Cisco CCNA', pattern: /ccna/i }
        ];

        // Houses in the platform
        this.houseNames = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];
    }

    /**
     * Analyze coverage across all parsed content
     * @param {Array} contentFiles - Parsed content from ParserOrchestrator
     * @param {Object} registry - Optional registry object for additional context
     * @returns {Object} Coverage analysis results
     */
    analyze(contentFiles, registry = null) {
        const startTime = Date.now();

        if (this.verbose) {
            console.log('[COVERAGE] Analyzing curriculum coverage...');
        }

        // Initialize results structure
        const results = {
            summary: {
                totalModules: 0,
                modulesWithAssessments: 0,
                modulesWithoutAssessments: 0,
                modulesWithQuizzes: 0,
                modulesWithLabs: 0,
                modulesWithPresentations: 0,
                overallCoverage: 0,
                quizDensity: 0,
                labDensity: 0
            },
            byHouse: {},
            byPath: {},
            byContentType: {
                quiz: 0,
                lab: 0,
                presentation: 0,
                applet: 0,
                html: 0  // Other HTML content
            },
            gaps: {
                noAssessments: [],
                noQuizzes: [],
                noLabs: [],
                lowCoverageHouses: [],
                lowCoveragePaths: []
            },
            modules: {},  // Detailed per-module data
            issues: [],
            meta: {
                analyzedAt: new Date().toISOString(),
                duration: 0,
                filesAnalyzed: contentFiles.length
            }
        };

        // Initialize house data
        for (const house of this.houseNames) {
            results.byHouse[house] = this.createHouseStats(house);
        }

        // Initialize path data
        for (const pathInfo of this.knownPaths) {
            results.byPath[pathInfo.id] = this.createPathStats(pathInfo);
        }

        // Process each content file
        for (const file of contentFiles) {
            this.processFile(file, results);
        }

        // Calculate derived metrics
        this.calculateMetrics(results);

        // Identify gaps
        this.identifyGaps(results);

        // Generate issues for gaps
        this.generateIssues(results);

        // Finalize
        results.meta.duration = Date.now() - startTime;

        if (this.verbose) {
            console.log(`[COVERAGE] Analysis complete in ${results.meta.duration}ms`);
            console.log(`[COVERAGE] Overall coverage: ${(results.summary.overallCoverage * 100).toFixed(1)}%`);
        }

        return results;
    }

    /**
     * Create initial stats structure for a house
     */
    createHouseStats(houseName) {
        return {
            name: houseName,
            modules: 0,
            quizzes: 0,
            labs: 0,
            presentations: 0,
            applets: 0,
            modulesWithAssessments: 0,
            modulesWithQuizzes: 0,
            modulesWithLabs: 0,
            quizDensity: 0,
            labDensity: 0,
            coverage: 0,
            moduleIds: [],
            contentItems: []
        };
    }

    /**
     * Create initial stats structure for a learning path
     */
    createPathStats(pathInfo) {
        return {
            id: pathInfo.id,
            name: pathInfo.name,
            pattern: pathInfo.pattern,
            modules: 0,
            quizzes: 0,
            labs: 0,
            presentations: 0,
            applets: 0,
            modulesWithAssessments: 0,
            modulesWithQuizzes: 0,
            modulesWithLabs: 0,
            quizDensity: 0,
            labDensity: 0,
            coverage: 0,
            moduleIds: [],
            contentItems: []
        };
    }

    /**
     * Process a single content file
     */
    processFile(file, results) {
        const contentType = file.contentType || 'html';
        const house = file.house;
        const moduleId = this.extractModuleId(file);

        // Count by content type
        if (results.byContentType[contentType] !== undefined) {
            results.byContentType[contentType]++;
        } else {
            results.byContentType.html++;
        }

        // Skip non-content files (indexes, core files)
        if (!this.isTrackableContent(file)) {
            return;
        }

        // Initialize or update module record
        if (moduleId && !results.modules[moduleId]) {
            results.modules[moduleId] = {
                id: moduleId,
                house: house,
                path: file.path,
                hasQuiz: false,
                hasLab: false,
                hasPresentation: false,
                hasApplet: false,
                assessmentCount: 0,
                contentTypes: [],
                files: []
            };
            results.summary.totalModules++;

            // Update house module count
            if (house && results.byHouse[house]) {
                results.byHouse[house].modules++;
                results.byHouse[house].moduleIds.push(moduleId);
            }

            // Check for learning path membership
            this.updatePathMembership(moduleId, file.path, results);
        }

        // Update module with this content
        if (moduleId && results.modules[moduleId]) {
            const module = results.modules[moduleId];
            module.files.push(file.path);

            if (!module.contentTypes.includes(contentType)) {
                module.contentTypes.push(contentType);
            }

            // Track content types
            if (contentType === 'quiz') {
                module.hasQuiz = true;
                module.assessmentCount++;
            }
            if (contentType === 'lab') {
                module.hasLab = true;
                module.assessmentCount++;
            }
            if (contentType === 'presentation') {
                module.hasPresentation = true;
            }
            if (contentType === 'applet') {
                module.hasApplet = true;
            }
        }

        // Update house content counts
        if (house && results.byHouse[house]) {
            const houseStats = results.byHouse[house];
            houseStats.contentItems.push({
                path: file.path,
                type: contentType,
                moduleId: moduleId
            });

            if (contentType === 'quiz') houseStats.quizzes++;
            if (contentType === 'lab') houseStats.labs++;
            if (contentType === 'presentation') houseStats.presentations++;
            if (contentType === 'applet') houseStats.applets++;
        }

        // Update path content counts
        for (const pathInfo of this.knownPaths) {
            if (this.matchesPath(file.path, moduleId, pathInfo.pattern)) {
                const pathStats = results.byPath[pathInfo.id];
                pathStats.contentItems.push({
                    path: file.path,
                    type: contentType,
                    moduleId: moduleId
                });

                if (contentType === 'quiz') pathStats.quizzes++;
                if (contentType === 'lab') pathStats.labs++;
                if (contentType === 'presentation') pathStats.presentations++;
                if (contentType === 'applet') pathStats.applets++;
            }
        }
    }

    /**
     * Extract module ID from file
     */
    extractModuleId(file) {
        // Try from parser config first
        if (file.config && file.config.moduleId) {
            return file.config.moduleId;
        }

        // Try to derive from path
        const pathParts = file.path.replace(/\\/g, '/').split('/');
        const filename = path.basename(file.path, '.html');

        // Pattern: houses/{house}/{type}/{module}/... or houses/{house}/{type}/{module}.html
        const houseIndex = pathParts.findIndex(p => p === 'houses');
        if (houseIndex >= 0 && pathParts.length > houseIndex + 3) {
            const house = pathParts[houseIndex + 1];
            const contentDir = pathParts[houseIndex + 2];

            // If there's a subdirectory, use it as module name
            if (pathParts.length > houseIndex + 4) {
                const moduleName = pathParts[houseIndex + 3];
                return `${house}-${moduleName}`;
            }

            // Otherwise use filename (without common suffixes)
            const cleanName = filename
                .replace(/-quiz$/, '')
                .replace(/-lab$/, '')
                .replace(/-presentation$/, '')
                .replace(/-slides$/, '');
            return `${house}-${cleanName}`;
        }

        // For courses, use course path
        if (file.path.includes('/courses/')) {
            const courseMatch = file.path.match(/courses\/([^/]+)/);
            if (courseMatch) {
                return `course-${courseMatch[1]}-${filename}`;
            }
        }

        // Fallback to filename with house prefix
        if (file.house) {
            return `${file.house}-${filename}`;
        }

        return filename;
    }

    /**
     * Check if file is trackable content (not an index or core file)
     */
    isTrackableContent(file) {
        const role = file.role || '';

        // Skip indexes and core files
        if (role.includes('index') || role.includes('core')) {
            return false;
        }

        // Skip if no recognized content type
        if (!this.contentTypes.includes(file.contentType) && file.contentType !== 'html') {
            return false;
        }

        // Skip files in config, components, utils
        const skipDirs = ['/config/', '/components/', '/utils/', '/styles/', '/assets/'];
        for (const dir of skipDirs) {
            if (file.path.includes(dir)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update learning path membership for a module
     */
    updatePathMembership(moduleId, filePath, results) {
        for (const pathInfo of this.knownPaths) {
            if (this.matchesPath(filePath, moduleId, pathInfo.pattern)) {
                const pathStats = results.byPath[pathInfo.id];
                if (!pathStats.moduleIds.includes(moduleId)) {
                    pathStats.modules++;
                    pathStats.moduleIds.push(moduleId);
                }
            }
        }
    }

    /**
     * Check if a file/module matches a learning path pattern
     */
    matchesPath(filePath, moduleId, pattern) {
        return pattern.test(filePath) || (moduleId && pattern.test(moduleId));
    }

    /**
     * Calculate derived metrics after processing all files
     */
    calculateMetrics(results) {
        // Calculate module-level metrics
        let modulesWithAssessments = 0;
        let modulesWithQuizzes = 0;
        let modulesWithLabs = 0;
        let modulesWithPresentations = 0;

        for (const moduleId in results.modules) {
            const module = results.modules[moduleId];

            if (module.assessmentCount > 0) {
                modulesWithAssessments++;
            }
            if (module.hasQuiz) {
                modulesWithQuizzes++;
            }
            if (module.hasLab) {
                modulesWithLabs++;
            }
            if (module.hasPresentation) {
                modulesWithPresentations++;
            }

            // Update house stats
            if (module.house && results.byHouse[module.house]) {
                const houseStats = results.byHouse[module.house];
                if (module.assessmentCount > 0) {
                    houseStats.modulesWithAssessments++;
                }
                if (module.hasQuiz) {
                    houseStats.modulesWithQuizzes++;
                }
                if (module.hasLab) {
                    houseStats.modulesWithLabs++;
                }
            }
        }

        // Update summary
        results.summary.modulesWithAssessments = modulesWithAssessments;
        results.summary.modulesWithoutAssessments = results.summary.totalModules - modulesWithAssessments;
        results.summary.modulesWithQuizzes = modulesWithQuizzes;
        results.summary.modulesWithLabs = modulesWithLabs;
        results.summary.modulesWithPresentations = modulesWithPresentations;

        // Calculate densities
        if (results.summary.totalModules > 0) {
            results.summary.overallCoverage = modulesWithAssessments / results.summary.totalModules;
            results.summary.quizDensity = modulesWithQuizzes / results.summary.totalModules;
            results.summary.labDensity = modulesWithLabs / results.summary.totalModules;
        }

        // Calculate house metrics
        for (const house in results.byHouse) {
            const stats = results.byHouse[house];
            if (stats.modules > 0) {
                stats.coverage = stats.modulesWithAssessments / stats.modules;
                stats.quizDensity = stats.quizzes / stats.modules;
                stats.labDensity = stats.labs / stats.modules;
            }
        }

        // Calculate path metrics
        for (const pathId in results.byPath) {
            const stats = results.byPath[pathId];

            // Recalculate modules with assessments for this path
            let pathModulesWithAssessments = 0;
            let pathModulesWithQuizzes = 0;
            let pathModulesWithLabs = 0;

            for (const moduleId of stats.moduleIds) {
                const module = results.modules[moduleId];
                if (module) {
                    if (module.assessmentCount > 0) pathModulesWithAssessments++;
                    if (module.hasQuiz) pathModulesWithQuizzes++;
                    if (module.hasLab) pathModulesWithLabs++;
                }
            }

            stats.modulesWithAssessments = pathModulesWithAssessments;
            stats.modulesWithQuizzes = pathModulesWithQuizzes;
            stats.modulesWithLabs = pathModulesWithLabs;

            if (stats.modules > 0) {
                stats.coverage = stats.modulesWithAssessments / stats.modules;
                stats.quizDensity = stats.quizzes / stats.modules;
                stats.labDensity = stats.labs / stats.modules;
            }
        }
    }

    /**
     * Identify coverage gaps
     */
    identifyGaps(results) {
        // Find modules with no assessments
        for (const moduleId in results.modules) {
            const module = results.modules[moduleId];

            if (module.assessmentCount === 0) {
                results.gaps.noAssessments.push({
                    moduleId,
                    house: module.house,
                    path: module.path,
                    contentTypes: module.contentTypes
                });
            }

            if (!module.hasQuiz) {
                results.gaps.noQuizzes.push({
                    moduleId,
                    house: module.house,
                    path: module.path,
                    hasLab: module.hasLab
                });
            }

            if (!module.hasLab) {
                results.gaps.noLabs.push({
                    moduleId,
                    house: module.house,
                    path: module.path,
                    hasQuiz: module.hasQuiz
                });
            }
        }

        // Find low coverage houses (below 50%)
        const coverageThreshold = 0.5;
        for (const house in results.byHouse) {
            const stats = results.byHouse[house];
            if (stats.modules > 0 && stats.coverage < coverageThreshold) {
                results.gaps.lowCoverageHouses.push({
                    house,
                    modules: stats.modules,
                    coverage: stats.coverage,
                    modulesWithAssessments: stats.modulesWithAssessments,
                    quizzes: stats.quizzes,
                    labs: stats.labs
                });
            }
        }

        // Find low coverage paths (below 50%)
        for (const pathId in results.byPath) {
            const stats = results.byPath[pathId];
            if (stats.modules > 0 && stats.coverage < coverageThreshold) {
                results.gaps.lowCoveragePaths.push({
                    pathId,
                    name: stats.name,
                    modules: stats.modules,
                    coverage: stats.coverage,
                    modulesWithAssessments: stats.modulesWithAssessments,
                    quizzes: stats.quizzes,
                    labs: stats.labs
                });
            }
        }

        // Sort gaps by severity (largest gaps first)
        results.gaps.lowCoverageHouses.sort((a, b) => a.coverage - b.coverage);
        results.gaps.lowCoveragePaths.sort((a, b) => a.coverage - b.coverage);
    }

    /**
     * Generate issues for identified gaps
     */
    generateIssues(results) {
        // Issues for modules without any assessments
        for (const gap of results.gaps.noAssessments) {
            results.issues.push({
                code: 'COV-001',
                severity: 'medium',
                category: 'coverage',
                message: `Module '${gap.moduleId}' has no assessments (no quiz or lab)`,
                moduleId: gap.moduleId,
                house: gap.house,
                file: gap.path,
                fix: 'Add a quiz or lab to assess student understanding',
                action: 'add_assessment'
            });
        }

        // Issues for houses with very low coverage (below 25%)
        for (const gap of results.gaps.lowCoverageHouses) {
            if (gap.coverage < 0.25) {
                results.issues.push({
                    code: 'COV-002',
                    severity: 'high',
                    category: 'coverage',
                    message: `House '${gap.house}' has critical assessment gap: ${(gap.coverage * 100).toFixed(0)}% coverage (${gap.modulesWithAssessments}/${gap.modules} modules)`,
                    house: gap.house,
                    coverage: gap.coverage,
                    fix: `Add assessments to ${gap.modules - gap.modulesWithAssessments} modules`,
                    action: 'improve_house_coverage'
                });
            }
        }

        // Issues for learning paths with low coverage
        for (const gap of results.gaps.lowCoveragePaths) {
            if (gap.coverage < 0.5) {
                results.issues.push({
                    code: 'COV-003',
                    severity: gap.coverage < 0.25 ? 'high' : 'medium',
                    category: 'coverage',
                    message: `Learning path '${gap.name}' needs more assessments: ${(gap.coverage * 100).toFixed(0)}% coverage`,
                    pathId: gap.pathId,
                    pathName: gap.name,
                    coverage: gap.coverage,
                    fix: `Add assessments to ${gap.modules - gap.modulesWithAssessments} modules in this path`,
                    action: 'improve_path_coverage'
                });
            }
        }
    }

    /**
     * Generate a simplified report object matching the requested format
     */
    getSimpleReport(results) {
        const byHouse = {};
        for (const house in results.byHouse) {
            const stats = results.byHouse[house];
            if (stats.modules > 0) {  // Only include houses with content
                byHouse[house] = {
                    modules: stats.modules,
                    quizzes: stats.quizzes,
                    labs: stats.labs,
                    coverage: parseFloat(stats.coverage.toFixed(2))
                };
            }
        }

        return {
            summary: {
                totalModules: results.summary.totalModules,
                modulesWithAssessments: results.summary.modulesWithAssessments,
                modulesWithoutAssessments: results.summary.modulesWithoutAssessments,
                overallCoverage: parseFloat(results.summary.overallCoverage.toFixed(2))
            },
            byHouse,
            gaps: {
                noAssessments: results.gaps.noAssessments.map(g => g.moduleId),
                noQuizzes: results.gaps.noQuizzes.map(g => g.moduleId),
                noLabs: results.gaps.noLabs.map(g => g.moduleId)
            }
        };
    }

    /**
     * Format results for console output
     * @param {Object} results - Analysis results
     * @param {Function} colorFn - Color function (text, ...colors) => string
     * @returns {string} Formatted output
     */
    formatForConsole(results, colorFn = (text) => text) {
        const c = colorFn;
        const lines = [];

        lines.push(c('=' .repeat(60), 'dim'));
        lines.push(c(' CURRICULUM COVERAGE REPORT', 'bright', 'cyan'));
        lines.push(c('='.repeat(60), 'dim'));
        lines.push('');

        // Summary
        lines.push(c('  SUMMARY', 'bright'));
        lines.push(c('  ' + '-'.repeat(40), 'dim'));
        lines.push(`  Total Modules:           ${results.summary.totalModules}`);
        lines.push(`  With Assessments:        ${results.summary.modulesWithAssessments}`);
        lines.push(`  Without Assessments:     ${c(String(results.summary.modulesWithoutAssessments), results.summary.modulesWithoutAssessments > 0 ? 'yellow' : 'green')}`);
        lines.push(`  Overall Coverage:        ${this.formatCoverage(results.summary.overallCoverage, c)}`);
        lines.push(`  Quiz Density:            ${(results.summary.quizDensity * 100).toFixed(0)}%`);
        lines.push(`  Lab Density:             ${(results.summary.labDensity * 100).toFixed(0)}%`);
        lines.push('');

        // Content type breakdown
        lines.push(c('  CONTENT BY TYPE', 'bright'));
        lines.push(c('  ' + '-'.repeat(40), 'dim'));
        lines.push(`  Quizzes:        ${results.byContentType.quiz}`);
        lines.push(`  Labs:           ${results.byContentType.lab}`);
        lines.push(`  Presentations:  ${results.byContentType.presentation}`);
        lines.push(`  Applets:        ${results.byContentType.applet}`);
        lines.push('');

        // House coverage (only houses with content)
        lines.push(c('  COVERAGE BY HOUSE', 'bright'));
        lines.push(c('  ' + '-'.repeat(40), 'dim'));

        const housesWithContent = Object.entries(results.byHouse)
            .filter(([_, stats]) => stats.modules > 0)
            .sort((a, b) => b[1].coverage - a[1].coverage);

        for (const [house, stats] of housesWithContent) {
            const coverageBar = this.createCoverageBar(stats.coverage, 20);
            lines.push(`  ${house.padEnd(8)} ${coverageBar} ${this.formatCoverage(stats.coverage, c)} (${stats.modulesWithAssessments}/${stats.modules})`);
        }

        if (housesWithContent.length === 0) {
            lines.push(c('  No house content found', 'dim'));
        }
        lines.push('');

        // Learning paths (only paths with content)
        const pathsWithContent = Object.entries(results.byPath)
            .filter(([_, stats]) => stats.modules > 0)
            .sort((a, b) => b[1].coverage - a[1].coverage);

        if (pathsWithContent.length > 0) {
            lines.push(c('  COVERAGE BY LEARNING PATH', 'bright'));
            lines.push(c('  ' + '-'.repeat(40), 'dim'));

            for (const [pathId, stats] of pathsWithContent) {
                const coverageBar = this.createCoverageBar(stats.coverage, 20);
                lines.push(`  ${stats.name.substring(0, 20).padEnd(20)} ${coverageBar} ${this.formatCoverage(stats.coverage, c)}`);
            }
            lines.push('');
        }

        // Gaps summary
        if (results.gaps.noAssessments.length > 0 ||
            results.gaps.lowCoverageHouses.length > 0) {

            lines.push(c('  COVERAGE GAPS', 'bright', 'yellow'));
            lines.push(c('  ' + '-'.repeat(40), 'dim'));

            if (results.gaps.noAssessments.length > 0) {
                lines.push(`  ${c('Naked modules:', 'yellow')} ${results.gaps.noAssessments.length} modules with no assessments`);

                // Show first few
                const sample = results.gaps.noAssessments.slice(0, 5);
                for (const gap of sample) {
                    lines.push(c(`    - ${gap.moduleId}`, 'dim'));
                }
                if (results.gaps.noAssessments.length > 5) {
                    lines.push(c(`    ... and ${results.gaps.noAssessments.length - 5} more`, 'dim'));
                }
            }

            if (results.gaps.lowCoverageHouses.length > 0) {
                lines.push('');
                lines.push(`  ${c('Low coverage houses:', 'yellow')}`);
                for (const gap of results.gaps.lowCoverageHouses) {
                    lines.push(`    - ${gap.house}: ${(gap.coverage * 100).toFixed(0)}% coverage`);
                }
            }

            lines.push('');
        }

        lines.push(c('='.repeat(60), 'dim'));
        lines.push('');

        return lines.join('\n');
    }

    /**
     * Create a visual coverage bar
     */
    createCoverageBar(coverage, width) {
        const filled = Math.round(coverage * width);
        const empty = width - filled;
        return '[' + '#'.repeat(filled) + '-'.repeat(empty) + ']';
    }

    /**
     * Format coverage percentage with color
     */
    formatCoverage(coverage, colorFn) {
        const percent = (coverage * 100).toFixed(0) + '%';
        if (coverage >= 0.8) return colorFn(percent.padStart(4), 'green');
        if (coverage >= 0.5) return colorFn(percent.padStart(4), 'yellow');
        return colorFn(percent.padStart(4), 'red');
    }
}

module.exports = CoverageAnalyzer;
