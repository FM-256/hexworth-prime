/**
 * EduScan - Syntax Validator Orchestrator
 *
 * Coordinates syntax validation across HTML, JS, engines, and paths.
 * Designed to catch "blank screen" failures before students see them.
 */

const fs = require('fs');
const path = require('path');
const HTMLValidator = require('./html');
const JSValidator = require('./js');
const EngineValidator = require('./engine');
const PathValidator = require('./paths');
const LearningPathsValidator = require('./learning-paths');
const AssignmentLinkValidator = require('./assignment-links');
const NamingValidator = require('./naming');
const HeuristicsValidator = require('./heuristics');
const ContentCatalogValidator = require('./content-catalog');
const DependencyCheckValidator = require('./dependency-check');
const CSPValidator = require('./csp');
const NavigationValidator = require('./navigation');
const EmojiValidator = require('./emoji');
const PaletteValidator = require('./palette');
const ContentBlobValidator = require('./content-blob');
const SemanticValidator = require('./semantic');

class SyntaxValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'ci';  // 'ci', 'strict', or 'inventory'

        // Initialize sub-validators with profile
        this.htmlValidator = new HTMLValidator({
            verbose: this.verbose,
            profile: this.profile
        });
        this.jsValidator = new JSValidator({
            verbose: this.verbose,
            profile: this.profile
        });
        this.engineValidator = new EngineValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            profile: this.profile
        });
        this.pathValidator = new PathValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            profile: this.profile
        });
        this.learningPathsValidator = new LearningPathsValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.assignmentLinkValidator = new AssignmentLinkValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.namingValidator = new NamingValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.heuristicsValidator = new HeuristicsValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            profile: this.profile
        });
        this.contentCatalogValidator = new ContentCatalogValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.dependencyCheckValidator = new DependencyCheckValidator({
            verbose: this.verbose,
            profile: this.profile
        });
        this.cspValidator = new CSPValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.navigationValidator = new NavigationValidator({
            verbose: this.verbose,
            profile: this.profile,
            rootPath: this.rootPath
        });
        this.emojiValidator = new EmojiValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            profile: this.profile
        });
        this.paletteValidator = new PaletteValidator({
            verbose: this.verbose,
            rootPath: this.rootPath
        });
        this.contentBlobValidator = new ContentBlobValidator({
            verbose: this.verbose,
            profile: this.profile
        });
        this.semanticValidator = new SemanticValidator({
            verbose: this.verbose,
            rootPath: this.rootPath,
            profile: this.profile
        });
    }

    /**
     * Validate all content files for syntax issues
     * @param {Array} contentFiles - Parsed content from scanner (without raw content)
     * @returns {Object} Validation results
     */
    validate(contentFiles) {
        const startTime = Date.now();

        const results = {
            issues: [],
            summary: {
                profile: this.profile,
                filesChecked: 0,
                htmlErrors: 0,
                jsErrors: 0,
                engineErrors: 0,
                pathErrors: 0,
                learningPathErrors: 0,
                assignmentLinkErrors: 0,
                namingErrors: 0,
                heuristicErrors: 0,
                contentCatalogErrors: 0,
                dependencyErrors: 0,
                navigationErrors: 0,
                emojiErrors: 0,
                paletteErrors: 0,
                blobErrors: 0,
                semanticErrors: 0,
                // Severity counts (populated at end)
                bySeverity: {
                    critical: 0,
                    high: 0,
                    medium: 0,
                    low: 0,
                    suspect: 0
                }
            }
        };

        // Run LearningPaths validation (global, not per-file)
        const lpResults = this.learningPathsValidator.validate();
        if (lpResults.issues.length > 0) {
            results.issues.push(...lpResults.issues);
            results.summary.learningPathErrors = lpResults.issues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] LearningPaths: ${lpResults.issues.length} issues`);
            }
        }

        // Run Assignment Link validation (global, not per-file)
        const alResults = this.assignmentLinkValidator.validate();
        if (alResults.issues.length > 0) {
            results.issues.push(...alResults.issues);
            results.summary.assignmentLinkErrors = alResults.issues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] AssignmentLinks: ${alResults.issues.length} issues`);
            }
        }

        // Run ContentCatalog validation (global, not per-file)
        const catResults = this.contentCatalogValidator.validate();
        if (catResults.issues.length > 0) {
            results.issues.push(...catResults.issues);
            results.summary.contentCatalogErrors = catResults.issues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] ContentCatalog: ${catResults.issues.length} issues`);
            }
        }
        results.summary.contentCatalog = catResults.summary;

        // Run Heuristic renderer link validation (global, scans .js files)
        const rendererLinkResults = this.heuristicsValidator.validateRendererLinks();
        if (rendererLinkResults.length > 0) {
            results.issues.push(...rendererLinkResults);
            results.summary.heuristicErrors += rendererLinkResults.length;
            if (this.verbose) {
                console.log(`[SYNTAX] RendererLinks: ${rendererLinkResults.length} issues`);
            }
        }

        // Run CSP validation (global, cross-references firebase.json)
        const cspResults = this.cspValidator.validate();
        if (cspResults.issues.length > 0) {
            results.issues.push(...cspResults.issues);
            if (!results.summary.cspErrors) results.summary.cspErrors = 0;
            results.summary.cspErrors += cspResults.issues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] CSP: ${cspResults.issues.length} issues`);
            }
        }

        // Run Emoji validation on global JS/config files (not per-file)
        const emojiGlobalIssues = this.emojiValidator.validateGlobal();
        if (emojiGlobalIssues.length > 0) {
            results.issues.push(...emojiGlobalIssues);
            results.summary.emojiErrors += emojiGlobalIssues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] Emoji (global): ${emojiGlobalIssues.length} issues`);
            }
        }

        // Run Palette validation (global, checks house index pages)
        const paletteResults = this.paletteValidator.validate();
        if (paletteResults.issues.length > 0) {
            results.issues.push(...paletteResults.issues);
            results.summary.paletteErrors = paletteResults.issues.length;
            if (this.verbose) {
                console.log(`[SYNTAX] Palette: ${paletteResults.issues.length} issues`);
            }
        }

        for (const file of contentFiles) {
            // Only validate HTML files
            if (!file.path.endsWith('.html')) {
                continue;
            }

            // Load file content if not present (parser strips it for memory)
            let content = file.content;
            if (!content) {
                content = this.loadFileContent(file.path);
                if (!content) continue;
            }

            const fileWithContent = { ...file, content };
            results.summary.filesChecked++;

            // Run all validators
            const htmlIssues = this.htmlValidator.validate(fileWithContent);
            const jsIssues = this.jsValidator.validate(fileWithContent);
            const engineIssues = this.engineValidator.validate(fileWithContent);
            const pathIssues = this.pathValidator.validate(fileWithContent);
            const namingIssues = this.namingValidator.validate(fileWithContent);
            const heuristicIssues = this.heuristicsValidator.validate(fileWithContent);
            const dependencyIssues = this.dependencyCheckValidator.validate(fileWithContent);
            const navIssues = this.navigationValidator.validate(fileWithContent);
            const emojiIssues = this.emojiValidator.validate(fileWithContent);
            const blobIssues = this.contentBlobValidator.validate(fileWithContent);
            const semanticIssues = this.semanticValidator.validate(fileWithContent);

            // Collect issues
            results.issues.push(...htmlIssues);
            results.issues.push(...jsIssues);
            results.issues.push(...engineIssues);
            results.issues.push(...pathIssues);
            results.issues.push(...namingIssues);
            results.issues.push(...heuristicIssues);
            results.issues.push(...dependencyIssues);
            results.issues.push(...navIssues);
            results.issues.push(...emojiIssues);
            results.issues.push(...blobIssues);
            results.issues.push(...semanticIssues);

            // Update counts
            results.summary.htmlErrors += htmlIssues.length;
            results.summary.jsErrors += jsIssues.length;
            results.summary.engineErrors += engineIssues.length;
            results.summary.pathErrors += pathIssues.length;
            results.summary.namingErrors += namingIssues.length;
            results.summary.heuristicErrors += heuristicIssues.length;
            results.summary.dependencyErrors += dependencyIssues.length;
            results.summary.navigationErrors += navIssues.length;
            results.summary.emojiErrors += emojiIssues.length;
            results.summary.blobErrors += blobIssues.length;
            results.summary.semanticErrors += semanticIssues.length;
        }

        // Post-scan: check for content directories missing index.html
        const idxIssues = this.checkMissingDirectoryIndexes(contentFiles);
        results.issues.push(...idxIssues);
        results.summary.pathErrors += idxIssues.length;

        // Sort by severity
        results.issues.sort((a, b) => {
            const order = { critical: 0, high: 1, medium: 2, low: 3, warning: 4, suspect: 5, info: 6 };
            return (order[a.severity] || 7) - (order[b.severity] || 7);
        });

        results.summary.totalIssues = results.issues.length;
        results.summary.duration = Date.now() - startTime;

        // Count by severity
        for (const issue of results.issues) {
            const sev = issue.severity || 'low';
            if (results.summary.bySeverity[sev] !== undefined) {
                results.summary.bySeverity[sev]++;
            }
        }

        if (this.verbose) {
            console.log(`[SYNTAX] Profile: ${this.profile}`);
            console.log(`[SYNTAX] Checked ${results.summary.filesChecked} files in ${results.summary.duration}ms`);
            console.log(`[SYNTAX] Found ${results.summary.totalIssues} syntax issues`);
        }

        return results;
    }

    /**
     * PATH-IDX-001: Check for content directories missing index.html
     *
     * Scans all directories under houses/ and dark-arts/ that contain .html files
     * and flags any directory that lacks an index.html. These directories produce
     * 404 errors when users navigate to the directory URL directly.
     *
     * @param {Array} contentFiles - All content files from scanner
     * @returns {Array} Issues found
     */
    checkMissingDirectoryIndexes(contentFiles) {
        const issues = [];

        // Leaf directory patterns that don't need index.html
        // (content folders that users don't navigate to directly)
        const leafPatterns = [
            /\/presentations\/?$/,
            /\/labs\/?$/,
            /\/quizzes\/?$/,
            /\/tools\/?$/,
            /\/games\/?$/,
            /\/applets\/[^/]+\/?$/,  // applets/subfolder
            /\/modules\/[^/]+\/?$/,  // modules/subfolder (e.g., wsa/m01-...)
            /\/courses\/[^/]+\/?$/,  // courses/subfolder
            /\/chapters\/[^/]+\/?$/, // chapters/subfolder
            /\/gates\/?$/,
            /\/assets\/?$/,
            /\/styles\/?$/,
            /\/config\/?$/,
            /\/components\/?$/
        ];

        // Collect all unique directories containing HTML content
        const contentDirs = new Set();
        for (const file of contentFiles) {
            if (!file.path.endsWith('.html')) continue;
            const dir = path.dirname(file.path);
            // Only check navigable content directories (houses, dark-arts, and their subdirs)
            if (/^(houses\/|dark-arts\/)/.test(dir)) {
                // Skip leaf content directories that users don't navigate to directly
                if (!leafPatterns.some(p => p.test(dir))) {
                    contentDirs.add(dir);
                }
            }
        }

        // Check each directory for index.html
        for (const dir of contentDirs) {
            const absoluteDir = path.isAbsolute(dir)
                ? dir
                : path.resolve(this.rootPath, dir);
            const indexPath = path.join(absoluteDir, 'index.html');

            if (!fs.existsSync(indexPath)) {
                // Count HTML files in this directory to gauge importance
                const htmlCount = contentFiles.filter(f =>
                    path.dirname(f.path) === dir && f.path.endsWith('.html')
                ).length;

                // Only flag directories with 3+ HTML files (likely section hubs)
                // or top-level directories (depth ≤ 3, e.g. houses/web/, dark-arts/vault/)
                const depth = dir.split('/').length;
                if (htmlCount >= 3 || depth <= 3) {
                    issues.push({
                        code: 'PATH-IDX-001',
                        severity: 'medium',
                        category: 'path',
                        message: `Content directory missing index.html: ${dir}/ (${htmlCount} HTML files, no index)`,
                        file: dir + '/',
                        fix: `Create ${dir}/index.html or add a redirect`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Load file content from disk
     * @param {string} filePath - Relative path to file (relative to rootPath)
     * @returns {string|null} File content or null if failed
     */
    loadFileContent(filePath) {
        // Handle both relative and absolute paths
        let absolutePath = filePath;
        if (!path.isAbsolute(filePath)) {
            // Paths from parser are relative to rootPath (e.g., 'houses/web/...')
            absolutePath = path.resolve(this.rootPath, filePath);
        }

        try {
            return fs.readFileSync(absolutePath, 'utf8');
        } catch (err) {
            if (this.verbose) {
                console.warn(`[SYNTAX] Cannot read file: ${absolutePath}`);
            }
            return null;
        }
    }

    /**
     * Quick validation of a single file
     * @param {Object} file - Parsed file object
     * @returns {Array} Issues found
     */
    validateFile(file) {
        if (!file.path.endsWith('.html')) {
            return [];
        }

        // Load content if needed
        let content = file.content;
        if (!content) {
            content = this.loadFileContent(file.path);
            if (!content) return [];
        }

        const fileWithContent = { ...file, content };

        return [
            ...this.htmlValidator.validate(fileWithContent),
            ...this.jsValidator.validate(fileWithContent),
            ...this.engineValidator.validate(fileWithContent),
            ...this.pathValidator.validate(fileWithContent)
        ];
    }
}

module.exports = SyntaxValidator;
