/**
 * EduScan - Engine/Global Validator
 *
 * Detects missing required engines, libraries, and globals that would
 * cause undefined errors and blank screens.
 */

const path = require('path');

class EngineValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
    }

    // Known engines and their script paths
    engines = {
        // Core Hexworth engines
        'AccessGuard': {
            patterns: ['AccessGuard', 'access-guard'],
            files: ['components/AccessGuard.js', 'utils/AccessGuard.js'],
            critical: true,
            description: 'Access control and sorting enforcement'
        },
        'ProgressTracker': {
            patterns: ['ProgressTracker', 'progress-tracker', 'trackProgress'],
            files: ['components/ProgressTracker.js', 'utils/ProgressTracker.js'],
            critical: true,
            description: 'Student progress tracking'
        },
        'PageTransition': {
            patterns: ['PageTransition', 'page-transition'],
            files: ['components/PageTransition.js', 'utils/PageTransition.js'],
            critical: false,
            description: 'Page transition animations'
        },
        'ThemeManager': {
            patterns: ['ThemeManager', 'theme-manager'],
            files: ['components/ThemeManager.js', 'styles/ThemeManager.js'],
            critical: false,
            description: 'Theme/color management'
        },
        'SortingValidator': {
            patterns: ['SortingValidator', 'sorting-validator'],
            files: ['components/SortingValidator.js'],
            critical: true,
            description: 'Sorting status validation'
        },
        'HouseProgress': {
            patterns: ['HouseProgress', 'house-progress'],
            files: ['components/HouseProgress.js'],
            critical: true,
            description: 'House-specific progress tracking'
        },
        'QuizEngine': {
            patterns: ['QuizEngine', 'quiz-engine', 'initQuiz'],
            files: ['components/QuizEngine.js', 'quiz/engine.js'],
            critical: true,
            description: 'Quiz functionality and scoring'
        },
        'PresentationEngine': {
            patterns: ['PresentationEngine', 'SlideEngine', 'Presentation'],
            files: ['components/PresentationEngine.js', 'presentation/engine.js'],
            critical: true,
            description: 'Presentation slide navigation'
        },

        // Common libraries
        'Chart': {
            patterns: ['Chart', 'new Chart'],
            files: ['lib/chart.js', 'vendor/chart.min.js'],
            critical: false,
            description: 'Chart.js visualization library'
        },
        'Prism': {
            patterns: ['Prism', 'Prism.highlightAll'],
            files: ['lib/prism.js', 'vendor/prism.min.js'],
            critical: false,
            description: 'Syntax highlighting'
        },
        'marked': {
            patterns: ['marked', 'marked.parse'],
            files: ['lib/marked.js', 'vendor/marked.min.js'],
            critical: false,
            description: 'Markdown parser'
        },
        'hljs': {
            patterns: ['hljs', 'highlight.js', 'highlightAll'],
            files: ['lib/highlight.js', 'vendor/highlight.min.js'],
            critical: false,
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

        // Find all script includes
        const includes = this.extractScriptIncludes(content);
        const includedPaths = new Set(includes.map(i => i.src.toLowerCase()));

        // Find engine usage in inline scripts
        const usages = this.findEngineUsage(content);

        for (const usage of usages) {
            const engine = this.engines[usage.engine];
            if (!engine) continue;

            // Check if any expected file is included
            const isIncluded = engine.files.some(f =>
                Array.from(includedPaths).some(inc =>
                    inc.includes(f.toLowerCase()) ||
                    inc.includes(path.basename(f).toLowerCase())
                )
            );

            if (!isIncluded) {
                const severity = engine.critical ? 'high' : 'medium';
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
                    fix: `Add <script src="${engine.files[0]}"></script> before usage`,
                    autoFixable: true,
                    confidence: 0.85
                });
            }
        }

        // Check for undefined global usage
        issues.push(...this.checkUndefinedGlobals(file));

        // Check for engine load order issues
        issues.push(...this.checkLoadOrder(file, includes));

        return issues;
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
    checkUndefinedGlobals(file) {
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
