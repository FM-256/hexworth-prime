/**
 * EduScan - Parser Orchestrator
 *
 * Coordinates all content parsers to analyze files.
 */

const quizParser = require('./quiz');
const presentationParser = require('./presentation');
const labParser = require('./lab');
const appletParser = require('./applet');
const { PATTERNS, extractFirst } = require('../utils/patterns');

class ParserOrchestrator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;

        // Parser priority order (first match wins for primary type)
        this.parsers = [
            { name: 'quiz', parser: quizParser },
            { name: 'lab', parser: labParser },
            { name: 'presentation', parser: presentationParser },
            { name: 'applet', parser: appletParser }
        ];
    }

    /**
     * Parse a single file
     * @param {Object} file - File object from scanner
     * @returns {Object} Parsed content information
     */
    parse(file) {
        if (!file.content) {
            return {
                ...file,
                contentType: 'unknown',
                error: 'No content to parse'
            };
        }

        const result = {
            name: file.name,
            path: file.path,
            extension: file.extension,
            size: file.size,
            lines: file.lines,
            contentType: 'html', // default
            subTypes: [],
            config: {},
            components: [],
            house: null,
            issues: []
        };

        // Extract house from path
        result.house = this.extractHouse(file.path);

        // Extract HTML title
        result.title = extractFirst(file.content, PATTERNS.general.htmlTitle);

        // Extract included components
        result.components = this.extractComponents(file.content);

        // Run each parser
        for (const { name, parser } of this.parsers) {
            try {
                const parseResult = parser.parse(file.content, file.path);

                if (parseResult.detected) {
                    // Primary type is first detection
                    if (result.contentType === 'html') {
                        result.contentType = name;
                    } else {
                        result.subTypes.push(name);
                    }

                    // Merge configuration
                    result.config = {
                        ...result.config,
                        ...parseResult.config
                    };

                    // Collect issues from parser
                    if (parseResult.issues) {
                        result.issues.push(...parseResult.issues);
                    }
                }
            } catch (err) {
                result.issues.push({
                    code: 'PARSE-ERR',
                    severity: 'warning',
                    message: `Parser '${name}' failed: ${err.message}`
                });
            }
        }

        // Classify file role based on path
        result.role = this.classifyRole(file.path, result.contentType);

        // Remove raw content from result (too large)
        delete result.content;

        return result;
    }

    /**
     * Parse all files
     * @param {Array} files - Array of file objects from scanner
     * @returns {Array} Array of parsed content
     */
    parseAll(files) {
        const results = [];
        let parsed = 0;

        for (const file of files) {
            const result = this.parse(file);
            results.push(result);
            parsed++;

            if (this.verbose && parsed % 20 === 0) {
                console.log(`[PARSE] ${parsed}/${files.length} files parsed`);
            }
        }

        return results;
    }

    /**
     * Extract house from file path
     */
    extractHouse(filePath) {
        const match = filePath.match(PATTERNS.general.housePath);
        return match ? match[1] : null;
    }

    /**
     * Extract included components from file
     */
    extractComponents(content) {
        const components = [];
        const matches = content.matchAll(PATTERNS.general.componentInclude);

        for (const match of matches) {
            const component = match[1].replace('.js', '');
            if (!components.includes(component)) {
                components.push(component);
            }
        }

        return components;
    }

    /**
     * Classify file role based on path and content type
     */
    classifyRole(filePath, contentType) {
        const pathLower = filePath.toLowerCase();

        // Special files
        if (pathLower.endsWith('index.html')) {
            if (pathLower.includes('/houses/') && pathLower.split('/').length === 3) {
                return 'house-index';
            }
            if (pathLower.includes('/courses/')) {
                return 'course-index';
            }
            return 'index';
        }

        // Core application files
        if (pathLower === 'dashboard.html') return 'core-dashboard';
        if (pathLower === 'handler-dashboard.html') return 'core-handler';
        if (pathLower === 'sorting.html') return 'core-sorting';
        if (pathLower === 'connect.html') return 'core-connect';

        // Content based on type and path
        if (contentType === 'quiz') return 'content-quiz';
        if (contentType === 'lab') return 'content-lab';
        if (contentType === 'presentation') return 'content-presentation';
        if (contentType === 'applet') return 'content-applet';

        return 'other';
    }
}

module.exports = ParserOrchestrator;
