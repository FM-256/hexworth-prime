/**
 * EduScan - Engine/Global Validator (ES-7 Refinements)
 *
 * Detects missing required engines, libraries, and globals that would
 * cause undefined errors and blank screens.
 *
 * ES-7 Refinements:
 * - Global engine scope detection (AccessGuard, ProgressTracker, etc.)
 * - Shell inheritance detection for house content
 * - Profile support (ci, strict)
 * - Severity remapping (QuizEngine/LabEngine = high, others = medium/low)
 */

const path = require('path');

class EngineValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'default'; // 'ci', 'strict', or 'default'
    }

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL ENGINES - Loaded by dashboard/shell, inherited by content
    // ═══════════════════════════════════════════════════════════════
    globalEngines = new Set([
        'AccessGuard',
        'ProgressTracker',
        'PageTransition',
        'ThemeManager',
        'ProgressManager',
        'ModuleProgress',
        'AchievementSystem',
        'AchievementManager'
    ]);

    // ═══════════════════════════════════════════════════════════════
    // CRITICAL ENGINES - Always flag when missing (CI profile)
    // ═══════════════════════════════════════════════════════════════
    criticalEngines = new Set([
        'QuizEngine',
        'LabEngine',
        'PresentationEngine'
    ]);

    // Known engines and their script paths
    engines = {
        // Core Hexworth engines
        'AccessGuard': {
            patterns: ['AccessGuard', 'access-guard'],
            files: ['components/AccessGuard.js', 'utils/AccessGuard.js'],
            critical: false, // Loaded globally by dashboard
            global: true,
            description: 'Access control and sorting enforcement'
        },
        'ProgressTracker': {
            patterns: ['ProgressTracker', 'progress-tracker', 'trackProgress'],
            files: ['components/ProgressTracker.js', 'utils/ProgressTracker.js'],
            critical: false, // Loaded globally
            global: true,
            description: 'Student progress tracking'
        },
        'PageTransition': {
            patterns: ['PageTransition', 'page-transition'],
            files: ['components/PageTransition.js', 'utils/PageTransition.js'],
            critical: false,
            global: true,
            description: 'Page transition animations'
        },
        'ThemeManager': {
            patterns: ['ThemeManager', 'theme-manager'],
            files: ['components/ThemeManager.js', 'styles/ThemeManager.js'],
            critical: false,
            global: true,
            description: 'Theme/color management'
        },
        'ProgressManager': {
            patterns: ['ProgressManager', 'ProgressManager.completeModule'],
            files: ['components/ProgressManager.js'],
            critical: false,
            global: true,
            description: 'Progress manager for module completion'
        },
        'ModuleProgress': {
            patterns: ['ModuleProgress', 'ModuleProgress.complete'],
            files: ['components/ModuleProgress.js'],
            critical: false,
            global: true,
            description: 'Module progress tracking'
        },
        'AchievementSystem': {
            patterns: ['AchievementSystem'],
            files: ['components/AchievementSystem.js'],
            critical: false,
            global: true,
            description: 'Achievement system'
        },
        'AchievementManager': {
            patterns: ['AchievementManager'],
            files: ['components/AchievementManager.js'],
            critical: false,
            global: true,
            description: 'Achievement manager'
        },
        'SortingValidator': {
            patterns: ['SortingValidator', 'sorting-validator'],
            files: ['components/SortingValidator.js'],
            critical: false,
            description: 'Sorting status validation'
        },
        'HouseProgress': {
            patterns: ['HouseProgress', 'house-progress'],
            files: ['components/HouseProgress.js'],
            critical: false,
            description: 'House-specific progress tracking'
        },
        'QuizEngine': {
            patterns: ['QuizEngine', 'quiz-engine', 'new QuizEngine'],
            files: ['components/QuizEngine.js', 'quiz/engine.js'],
            critical: true,
            contentType: 'quiz',
            description: 'Quiz functionality and scoring'
        },
        'LabEngine': {
            patterns: ['LabEngine', 'lab-engine', 'new LabEngine'],
            files: ['components/LabEngine.js', 'lab/engine.js'],
            critical: true,
            contentType: 'lab',
            description: 'Lab environment functionality'
        },
        'PresentationEngine': {
            patterns: ['PresentationEngine', 'SlideEngine', 'Presentation'],
            files: ['components/PresentationEngine.js', 'presentation/engine.js'],
            critical: true,
            contentType: 'presentation',
            description: 'Presentation slide navigation'
        },

        // Common libraries
        'Chart': {
            patterns: ['Chart', 'new Chart'],
            files: ['lib/chart.js', 'vendor/chart.min.js'],
            critical: false,
            library: true,
            description: 'Chart.js visualization library'
        },
        'Prism': {
            patterns: ['Prism', 'Prism.highlightAll'],
            files: ['lib/prism.js', 'vendor/prism.min.js'],
            critical: false,
            library: true,
            description: 'Syntax highlighting'
        },
        'marked': {
            patterns: ['marked', 'marked.parse'],
            files: ['lib/marked.js', 'vendor/marked.min.js'],
            critical: false,
            library: true,
            description: 'Markdown parser'
        },
        'hljs': {
            patterns: ['hljs', 'highlight.js', 'highlightAll'],
            files: ['lib/highlight.js', 'vendor/highlight.min.js'],
            critical: false,
            library: true,
            description: 'Highlight.js syntax highlighting'
        }
    };

    /**
     * Validate engine/global usage
     * @param {Object} file - Parsed file object with content
     * @returns {Array} Issues found
     */
    validate(file) {
        const issues = [];
        const content = file.content;
        const filePath = file.path;

        // Determine file context
        const context = this.analyzeFileContext(filePath, content);

        // Find all script includes
        const includes = this.extractScriptIncludes(content);
        const includedPaths = new Set(includes.map(i => i.src.toLowerCase()));

        // Find engine usage in inline scripts
        const usages = this.findEngineUsage(content);

        for (const usage of usages) {
            const engine = this.engines[usage.engine];
            if (!engine) continue;

            // Skip global engines if file inherits from shell
            if (engine.global && context.inheritsFromShell) {
                if (this.verbose) {
                    console.log(`[ENGINE] Skipping global engine "${usage.engine}" in shell-inherited file: ${filePath}`);
                }
                continue;
            }

            // Skip based on profile
            if (!this.shouldValidateForProfile(usage.engine, context)) {
                continue;
            }

            // Check if any expected file is included
            const isIncluded = engine.files.some(f =>
                Array.from(includedPaths).some(inc =>
                    inc.includes(f.toLowerCase()) ||
                    inc.includes(path.basename(f).toLowerCase())
                )
            );

            if (!isIncluded) {
                const severity = this.determineSeverity(usage.engine, engine, context);

                // In CI profile, only flag critical engines
                if (this.profile === 'ci' && severity !== 'high') {
                    continue;
                }

                issues.push({
                    code: 'ENG-001',
                    severity,
                    category: 'engine',
                    message: `Engine "${usage.engine}" is used but not included`,
                    file: file.path,
                    line: usage.line,
                    engine: usage.engine,
                    description: engine.description,
                    expectedFiles: engine.files,
                    context: {
                        inheritsFromShell: context.inheritsFromShell,
                        isStandalone: context.isStandalone,
                        contentType: context.contentType,
                        inHouse: context.inHouse
                    },
                    fix: `Add <script src="${engine.files[0]}"></script> before usage`,
                    autoFixable: true,
                    confidence: context.isStandalone ? 0.95 : 0.75
                });
            }
        }

        // Check for undefined global usage
        issues.push(...this.checkUndefinedGlobals(file, context));

        // Check for engine load order issues
        issues.push(...this.checkLoadOrder(file, includes));

        return issues;
    }

    /**
     * Analyze file context to determine shell inheritance and content type
     */
    analyzeFileContext(filePath, content) {
        const context = {
            inheritsFromShell: false,
            isStandalone: false,
            contentType: null,
            inHouse: null,
            hasAccessGuard: false
        };

        const pathLower = filePath.toLowerCase();

        // Check if file is in houses directory (inherits from house shell)
        const houseMatch = pathLower.match(/houses\/(\w+)\//);
        if (houseMatch) {
            context.inHouse = houseMatch[1];
            context.inheritsFromShell = true;
        }

        // Check if file has AccessGuard usage (indicates shell inheritance)
        if (content.includes('AccessGuard.require') || content.includes('AccessGuard.js')) {
            context.hasAccessGuard = true;
            context.inheritsFromShell = true;
        }

        // Determine content type from path
        if (pathLower.includes('/quizzes/') || pathLower.includes('-quiz')) {
            context.contentType = 'quiz';
        } else if (pathLower.includes('/labs/') || pathLower.includes('-lab')) {
            context.contentType = 'lab';
        } else if (pathLower.includes('/presentations/') || pathLower.includes('-presentation')) {
            context.contentType = 'presentation';
        } else if (pathLower.includes('/applets/')) {
            context.contentType = 'applet';
        } else if (pathLower.includes('/modules/')) {
            context.contentType = 'module';
        }

        // Standalone files - not in houses, not in main shell
        const standalonePatterns = [
            /dark-arts\/gates\//,
            /dark-arts\/vault\//,
            /standalone\//,
            /tools\//
        ];

        if (standalonePatterns.some(p => p.test(pathLower))) {
            context.isStandalone = true;
            context.inheritsFromShell = false;
        }

        // Files directly in _app/ are typically shell/framework files
        if (/^[^/]+\.html$/.test(filePath) && !context.inHouse) {
            context.inheritsFromShell = false; // These ARE the shell
        }

        return context;
    }

    /**
     * Determine if engine should be validated based on profile
     */
    shouldValidateForProfile(engineName, context) {
        if (this.profile === 'ci') {
            // CI mode: Only validate critical engines for their content types
            const engine = this.engines[engineName];
            if (!engine) return false;

            // Critical engines should be validated
            if (this.criticalEngines.has(engineName)) {
                // Only if the content type matches
                if (engine.contentType && context.contentType) {
                    return engine.contentType === context.contentType;
                }
                return true;
            }
            return false;
        }

        if (this.profile === 'strict') {
            // Strict mode: validate everything
            return true;
        }

        // Default mode: skip global engines in shell-inherited files
        const engine = this.engines[engineName];
        if (engine && engine.global && context.inheritsFromShell) {
            return false;
        }

        return true;
    }

    /**
     * Determine severity based on engine type and context
     */
    determineSeverity(engineName, engine, context) {
        // Critical engines for their content types = HIGH
        if (engine.contentType && context.contentType === engine.contentType) {
            return 'high';
        }

        // Critical engines in standalone files = HIGH
        if (this.criticalEngines.has(engineName) && context.isStandalone) {
            return 'high';
        }

        // Libraries = LOW
        if (engine.library) {
            return 'low';
        }

        // Global engines in non-shell files = MEDIUM
        if (engine.global && !context.inheritsFromShell) {
            return 'medium';
        }

        // Default
        return 'medium';
    }

    /**
     * Extract script includes from HTML
     */
    extractScriptIncludes(content) {
        const includes = [];
        const scriptPattern = /<script[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const line = this.getLineNumber(content, match.index);
            includes.push({
                src: match[1],
                line,
                position: match.index
            });
        }

        return includes;
    }

    /**
     * Find engine usage in content
     */
    findEngineUsage(content) {
        const usages = [];

        // Extract inline script content
        const scriptPattern = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const scriptContent = match[1];
            const scriptStart = match.index;

            for (const [engineName, engine] of Object.entries(this.engines)) {
                for (const pattern of engine.patterns) {
                    // Use word boundary to avoid partial matches
                    const regex = new RegExp(`\\b${this.escapeRegex(pattern)}\\b`, 'g');
                    let patternMatch;

                    while ((patternMatch = regex.exec(scriptContent)) !== null) {
                        const absolutePos = scriptStart + patternMatch.index;
                        const line = this.getLineNumber(content, absolutePos);

                        // Avoid duplicates for same engine on same line
                        const existing = usages.find(u =>
                            u.engine === engineName && u.line === line
                        );

                        if (!existing) {
                            usages.push({
                                engine: engineName,
                                pattern,
                                line,
                                position: absolutePos
                            });
                        }
                    }
                }
            }
        }

        return usages;
    }

    /**
     * Check for common undefined global patterns
     */
    checkUndefinedGlobals(file, context) {
        const issues = [];
        const content = file.content;

        // Common globals that might be missing
        const commonGlobals = {
            '$': {
                library: 'jQuery',
                files: ['jquery.min.js', 'jquery.js'],
                severity: 'high'
            },
            'jQuery': {
                library: 'jQuery',
                files: ['jquery.min.js', 'jquery.js'],
                severity: 'high'
            },
            'axios': {
                library: 'Axios',
                files: ['axios.min.js', 'axios.js'],
                severity: 'high'
            },
            'moment': {
                library: 'Moment.js',
                files: ['moment.min.js', 'moment.js'],
                severity: 'medium'
            },
            'gsap': {
                library: 'GSAP',
                files: ['gsap.min.js', 'gsap.js'],
                severity: 'medium'
            },
            'THREE': {
                library: 'Three.js',
                files: ['three.min.js', 'three.js'],
                severity: 'high'
            }
        };

        const includes = this.extractScriptIncludes(content);
        const includedPaths = includes.map(i => i.src.toLowerCase()).join(' ');

        // Extract inline script content
        const scriptPattern = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const scriptContent = match[1];
            const scriptStart = match.index;

            for (const [globalName, info] of Object.entries(commonGlobals)) {
                const regex = new RegExp(`\\b${this.escapeRegex(globalName)}\\s*[.([]`, 'g');
                let globalMatch;

                while ((globalMatch = regex.exec(scriptContent)) !== null) {
                    // Check if library is included
                    const isIncluded = info.files.some(f =>
                        includedPaths.includes(f.toLowerCase())
                    );

                    if (!isIncluded) {
                        const line = this.getLineNumber(content, scriptStart + globalMatch.index);
                        issues.push({
                            code: 'ENG-002',
                            severity: info.severity,
                            category: 'engine',
                            message: `Global "${globalName}" used but ${info.library} not included`,
                            file: file.path,
                            line,
                            library: info.library,
                            expectedFiles: info.files,
                            context: {
                                inheritsFromShell: context.inheritsFromShell,
                                isStandalone: context.isStandalone
                            },
                            fix: `Add ${info.library} script before usage`
                        });

                        // Only report once per global
                        break;
                    }
                }
            }
        }

        return issues;
    }

    /**
     * Check for script load order issues
     */
    checkLoadOrder(file, includes) {
        const issues = [];

        // Check for jQuery plugins before jQuery
        const jqueryIndex = includes.findIndex(i =>
            i.src.toLowerCase().includes('jquery') &&
            !i.src.toLowerCase().includes('jquery-ui') &&
            !i.src.toLowerCase().includes('jquery.')
        );

        if (jqueryIndex === -1) return issues;

        for (let i = 0; i < jqueryIndex; i++) {
            const include = includes[i];
            const lower = include.src.toLowerCase();

            // Common jQuery plugins
            if (lower.includes('jquery-ui') ||
                lower.includes('bootstrap') ||
                lower.includes('slick') ||
                lower.includes('owl')) {
                issues.push({
                    code: 'ENG-003',
                    severity: 'high',
                    category: 'engine',
                    message: `jQuery plugin "${path.basename(include.src)}" loaded before jQuery`,
                    file: file.path,
                    line: include.line,
                    fix: 'Move jQuery script before plugin scripts'
                });
            }
        }

        return issues;
    }

    /**
     * Escape string for use in regex
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Get line number for a position in content
     */
    getLineNumber(content, position) {
        const before = content.substring(0, position);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = EngineValidator;
