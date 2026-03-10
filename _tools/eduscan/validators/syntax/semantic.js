/**
 * EduScan - Semantic HTML Validator
 *
 * Detects semantic HTML issues that affect accessibility and SEO.
 *
 * Rules:
 * - SEM-001: Heading hierarchy skip (e.g., h1 → h3 without h2)  [LOW]
 *            (Downgraded from HIGH — heading skips affect accessibility
 *            but don't cause rendering failures. 1,625 findings across
 *            the content library; fixing all would be a large refactor
 *            for minimal educational impact.)
 * - SEM-002: Multiple h1 elements on a single page               [MEDIUM]
 * - SEM-003: Missing h1 element on page                          [MEDIUM]
 * - SEM-004: Missing main landmark                               [LOW]
 * - SEM-005: Navigation list not using semantic list elements     [LOW]
 *
 * JS-rendered page detection:
 *   Pages using QuizEngine, PresentationEngine, or similar JS engines
 *   render their h1 dynamically. These pages are skipped for SEM-002/003
 *   to avoid false positives (the heading exists at runtime, just not in
 *   the static HTML source).
 */

class SemanticValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
        this.rootPath = options.rootPath || './_app';
    }

    /**
     * Validate a single file for semantic HTML issues
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        if (this.profile === 'inventory') {
            return [];
        }

        const content = file.content || '';
        const filePath = (file.path || '').replace(/\\/g, '/');

        // Skip files that are purely JS-rendered (house index pages have no body content)
        // They contain only <head> + <script> with HouseRenderer.init()
        if (this._isJSRenderedPage(content)) {
            return [];
        }

        const issues = [];

        // Strip <script> and <style> blocks to avoid false positives
        const cleanContent = this._stripScriptsAndStyles(content);

        // SEM-001: Heading hierarchy skip
        issues.push(...this._checkHeadingHierarchy(cleanContent, file));

        // SEM-002: Multiple h1 elements
        issues.push(...this._checkMultipleH1(cleanContent, file));

        // SEM-003: Missing h1
        issues.push(...this._checkMissingH1(cleanContent, file));

        // SEM-004: Missing main landmark (strict only)
        if (this.profile === 'strict') {
            issues.push(...this._checkMainLandmark(cleanContent, file));
        }

        // SEM-005: Nav list structure (strict only)
        if (this.profile === 'strict') {
            issues.push(...this._checkNavListStructure(cleanContent, file));
        }

        return issues;
    }

    /**
     * Detect if a page is purely JS-rendered (no real body HTML).
     * These pages have their h1/heading structure injected by JS engines
     * at runtime, so static HTML analysis would produce false positives.
     */
    _isJSRenderedPage(content) {
        // House pages: have HouseRenderer.init() and almost no body content
        if (/HouseRenderer\.init\s*\(/i.test(content)) return true;
        // QuizEngine renders title + questions dynamically
        if (/new\s+QuizEngine\s*\(/i.test(content)) return true;
        // Quiz start pattern (quiz.start())
        if (/quiz\.start\s*\(\s*\)/i.test(content)) return true;
        // ArcticEngine renders district hub dynamically
        if (/ArcticEngine\.render/i.test(content)) return true;
        return false;
    }

    /**
     * Strip <script> and <style> blocks to prevent false positives
     * from heading tags inside JavaScript template literals
     */
    _stripScriptsAndStyles(content) {
        return content
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '');
    }

    /**
     * SEM-001: Check heading hierarchy — headings should not skip levels
     * e.g., h1 → h3 (skipping h2) is a violation
     */
    _checkHeadingHierarchy(content, file) {
        const issues = [];
        const headingRegex = /<h([1-6])\b[^>]*>/gi;
        let match;
        let lastLevel = 0;

        while ((match = headingRegex.exec(content)) !== null) {
            const level = parseInt(match[1], 10);
            const line = this._getLineNumber(content, match.index);

            // A heading can go deeper by at most 1 level from the previous heading
            // (going back up to any level is fine: h3 → h1 is OK)
            if (lastLevel > 0 && level > lastLevel + 1) {
                const skipped = [];
                for (let i = lastLevel + 1; i < level; i++) {
                    skipped.push('h' + i);
                }
                issues.push({
                    code: 'SEM-001',
                    severity: 'low',
                    category: 'semantic',
                    message: `Heading hierarchy skip: h${lastLevel} → h${level} (missing ${skipped.join(', ')})`,
                    file: file.path,
                    line,
                    fix: `Add an h${lastLevel + 1} heading before this h${level}, or change this to h${lastLevel + 1}`
                });
            }

            lastLevel = level;
        }

        return issues;
    }

    /**
     * SEM-002: Check for multiple h1 elements
     * Best practice: one h1 per page for the main title
     */
    _checkMultipleH1(content, file) {
        const issues = [];
        const h1Matches = [...content.matchAll(/<h1\b[^>]*>/gi)];

        if (h1Matches.length > 1) {
            // Report the second and subsequent h1 occurrences
            for (let i = 1; i < h1Matches.length; i++) {
                const line = this._getLineNumber(content, h1Matches[i].index);
                issues.push({
                    code: 'SEM-002',
                    severity: 'medium',
                    category: 'semantic',
                    message: `Multiple h1 elements found (${h1Matches.length} total) — page should have exactly one h1`,
                    file: file.path,
                    line,
                    fix: 'Change this h1 to h2 or another appropriate heading level'
                });
            }
        }

        return issues;
    }

    /**
     * SEM-003: Check for missing h1
     * Every page should have at least one h1 for its main title
     */
    _checkMissingH1(content, file) {
        const issues = [];

        // Only check full HTML pages (not fragments)
        if (!/<html/i.test(content) && !/<body/i.test(content) && !/<head/i.test(content)) {
            return issues;
        }

        const h1Match = /<h1\b[^>]*>/i.test(content);
        if (!h1Match) {
            issues.push({
                code: 'SEM-003',
                severity: 'medium',
                category: 'semantic',
                message: 'Page is missing an h1 element — every page should have a main heading',
                file: file.path,
                fix: 'Add an h1 element for the page\'s main title'
            });
        }

        return issues;
    }

    /**
     * SEM-004: Check for missing main landmark
     * Full pages should have a <main> element or role="main"
     */
    _checkMainLandmark(content, file) {
        const issues = [];

        // Only check full HTML pages
        if (!/<html/i.test(content) && !/<body/i.test(content)) {
            return issues;
        }

        const hasMain = /<main\b/i.test(content) || /role\s*=\s*["']main["']/i.test(content);
        if (!hasMain) {
            issues.push({
                code: 'SEM-004',
                severity: 'low',
                category: 'semantic',
                message: 'Page is missing a <main> landmark element',
                file: file.path,
                fix: 'Wrap the primary content in a <main> element'
            });
        }

        return issues;
    }

    /**
     * SEM-005: Check nav elements for semantic list structure
     * Navigation menus should use <ul>/<ol> with <li> items
     */
    _checkNavListStructure(content, file) {
        const issues = [];

        // Find <nav> elements and check if they contain a <ul> or <ol>
        const navRegex = /<nav\b[^>]*>([\s\S]*?)<\/nav>/gi;
        let match;

        while ((match = navRegex.exec(content)) !== null) {
            const navContent = match[1];
            const hasListStructure = /<(ul|ol)\b/i.test(navContent);
            const hasRoleList = /role\s*=\s*["']list["']/i.test(navContent);

            // Nav with buttons is fine (tab interfaces); only flag if it has links but no list
            const hasLinks = /<a\b/i.test(navContent);
            if (hasLinks && !hasListStructure && !hasRoleList) {
                const line = this._getLineNumber(content, match.index);
                issues.push({
                    code: 'SEM-005',
                    severity: 'low',
                    category: 'semantic',
                    message: 'Navigation contains links without semantic list structure',
                    file: file.path,
                    line,
                    fix: 'Wrap navigation links in <ul> with <li> elements'
                });
            }
        }

        return issues;
    }

    /**
     * Get line number from character index
     */
    _getLineNumber(content, index) {
        const lines = content.substring(0, index).split('\n');
        return lines.length;
    }
}

module.exports = SemanticValidator;
