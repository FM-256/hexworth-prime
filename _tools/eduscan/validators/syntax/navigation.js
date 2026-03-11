/**
 * EduScan - Navigation Validator
 *
 * Detects content pages missing back/return navigation and
 * house/course index pages missing dashboard links.
 *
 * Rules:
 * - NAV-001: Content page has no back/return navigation
 * - NAV-002: House/course index page has no dashboard link
 * - NAV-003: Content page inside a course subdirectory has returnUrl that skips course home
 * - NAV-004: Path card in house index has no href but a hub directory exists for it
 */

const fs = require('fs');
const path = require('path');

class NavigationValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
        this.rootPath = options.rootPath || './_app';
    }

    /**
     * Validate a single file for navigation issues
     * @param {Object} file - { path, content, role, house, contentType }
     * @returns {Array} Issues found
     */
    validate(file) {
        if (this.profile === 'inventory') {
            return [];
        }

        const issues = [];
        const role = file.role || '';
        const filePath = (file.path || '').replace(/\\/g, '/');

        // NAV-002: index pages missing dashboard link
        // Also detect house indexes by path pattern (houses/*/index.html)
        // because the parser's house-index role has a path-matching quirk
        const isHouseIndex = role === 'house-index' ||
            /^houses\/[^/]+\/index\.html$/i.test(filePath);
        const isCourseIndex = role === 'course-index';

        if (isHouseIndex || isCourseIndex) {
            issues.push(...this._checkDashboardLink(file));
            if (isHouseIndex) {
                issues.push(...this._checkPathCardHrefs(file));
            }
            return issues;
        }

        // NAV-003: content inside course subdirectory with returnUrl skipping course home
        // Pattern: houses/{house}/{course}/{subdir}/file.html where {course} has its own index.html
        // e.g., houses/forge/md-100/presentations/file.html with returnUrl: '../../index.html'
        // should use '../index.html' to return to the course home, not the house index
        issues.push(...this._checkCourseReturnUrl(file));

        // NAV-001: content pages missing back navigation
        const isContentRole = role.startsWith('content-');
        const isToolOrModule = /\.(tool|module)\.html$/i.test(filePath);

        if (isContentRole || isToolOrModule) {
            // Skip dark-arts vault files (gated content, different nav philosophy)
            if (/dark-arts\/vault\//i.test(filePath)) {
                return issues;
            }

            issues.push(...this._checkBackNavigation(file));
        }

        return issues;
    }

    /**
     * NAV-001: Check if a content page has any back/return navigation
     * @param {Object} file - File object with content
     * @returns {Array} Issues found
     */
    _checkBackNavigation(file) {
        const content = file.content || '';

        // Pattern 1: CSS class names related to back navigation
        if (/class\s*=\s*["'][^"']*\b(back-btn|back-link|nav-back|back-button|return-btn|return-link)\b/i.test(content)) {
            return [];
        }

        // Pattern 2: onclick handlers with navigation functions
        if (/onclick\s*=\s*["'][^"']*(goBack\s*\(|history\.back\s*\(|returnTo)/i.test(content)) {
            return [];
        }

        // Pattern 3: href pointing to parent index, same-directory index, or dashboard
        if (/href\s*=\s*["'][^"']*(\.\.\/index\.html|\.\.\/\.\.\/index\.html|dashboard\.html)/i.test(content)) {
            return [];
        }

        // Pattern 3b: href="index.html" (same-directory index, e.g., projects/index.html)
        if (/href\s*=\s*["']index\.html["']/i.test(content)) {
            return [];
        }

        // Pattern 4: Text content indicating back navigation
        // Includes ← (literal), &larr; (HTML entity), &lt; (< as back indicator)
        if (/←\s*\w|&larr;\s*\w|&lt;\s*\w|Return to|Go\s*Back|Exit\s*Lab/i.test(content)) {
            return [];
        }

        // Pattern 5: returnUrl in completeModule() config (ModuleProgress redirects on completion)
        if (/returnUrl\s*:/i.test(content)) {
            return [];
        }

        // Pattern 6: goBack or history.back defined as a function (not just in onclick)
        if (/function\s+goBack\s*\(|history\.back\s*\(\)/i.test(content)) {
            return [];
        }

        // Pattern 7: Back link class on an <a> element (broader class check)
        if (/<a\b[^>]*class\s*=\s*["'][^"']*\bback\b/i.test(content)) {
            return [];
        }

        return [{
            code: 'NAV-001',
            severity: 'medium',
            category: 'navigation',
            message: `Content page has no back/return navigation: '${file.path}'`,
            file: file.path,
            house: file.house,
            contentType: file.contentType,
            fix: 'Add a back button linking to the parent house index (e.g., href="../index.html")'
        }];
    }

    /**
     * NAV-002: Check if an index page has a dashboard link
     * @param {Object} file - File object with content
     * @returns {Array} Issues found
     */
    _checkDashboardLink(file) {
        const content = file.content || '';

        // HouseRenderer.js / CertPathRenderer.js generate dashboard links dynamically
        if (/HouseRenderer\.js|CertPathRenderer\.js/i.test(content)) {
            return [];
        }

        // Pattern 1: href containing dashboard.html
        if (/href\s*=\s*["'][^"']*dashboard\.html/i.test(content)) {
            return [];
        }

        // Pattern 2: href to parent index (course index → house index counts)
        if (/href\s*=\s*["'][^"']*\.\.\/index\.html/i.test(content)) {
            return [];
        }

        // Pattern 3: Text content referencing dashboard/home navigation
        if (/>[\s\S]*?\b(Dashboard|Main\s*Menu)\b/i.test(content)) {
            return [];
        }

        // Pattern 4: onclick navigating to dashboard
        if (/onclick\s*=\s*["'][^"']*dashboard/i.test(content)) {
            return [];
        }

        return [{
            code: 'NAV-002',
            severity: 'medium',
            category: 'navigation',
            message: `Index page has no dashboard link: '${file.path}'`,
            file: file.path,
            house: file.house,
            fix: 'Add a link back to the dashboard (e.g., href="../../dashboard.html")'
        }];
    }
    /**
     * NAV-003: Check if content inside a course subdirectory has a returnUrl
     * that skips the course home and goes directly to the house index.
     *
     * Detects: houses/{house}/{course}/{subdir}/file.html with returnUrl: '../../index.html'
     * The correct returnUrl should be '../index.html' (course home).
     *
     * Only triggers when the course directory actually contains an index.html.
     *
     * @param {Object} file - File object with content and path
     * @returns {Array} Issues found
     */
    _checkCourseReturnUrl(file) {
        const content = file.content || '';
        const filePath = (file.path || '').replace(/\\/g, '/');

        // Match files at depth: houses/{house}/{course}/{subdir}/file.html
        // where {course} is not a standard flat directory (presentations, labs, quizzes, etc.)
        const courseMatch = filePath.match(
            /^houses\/([^/]+)\/([^/]+)\/(presentations|labs|quizzes|applets|modules|games|reviews|tools)\/[^/]+\.html$/i
        );
        if (!courseMatch) return [];

        const house = courseMatch[1];
        const courseDir = courseMatch[2];

        // Standard house-level directories are not course subdirectories
        const standardDirs = [
            'presentations', 'labs', 'quizzes', 'applets',
            'modules', 'games', 'reviews', 'tools', 'courses'
        ];
        if (standardDirs.includes(courseDir.toLowerCase())) return [];

        // Check if the course directory has its own index.html
        const rootPath = this.rootPath || './_app';
        const courseIndexPath = path.resolve(rootPath, 'houses', house, courseDir, 'index.html');
        if (!fs.existsSync(courseIndexPath)) return [];

        const issues = [];

        // Check 1: returnUrl in JS config that skips the course home
        // Pattern: returnUrl: '../../index.html' (goes to house index, not course home)
        if (/returnUrl\s*:\s*['"]\.\.\/\.\.\/index\.html['"]/i.test(content)) {
            issues.push({
                code: 'NAV-003',
                severity: 'high',
                category: 'navigation',
                message: `returnUrl skips course home — goes to house index instead of ${courseDir}/index.html`,
                file: filePath,
                house: file.house,
                courseDir: courseDir,
                fix: `Change returnUrl from '../../index.html' to '../index.html' to return to the course home`
            });
        }

        // Check 2: <a href> back buttons that skip the course home
        // Pattern: <a href="../../index.html" ...> (goes to house index, not course home)
        if (/<a\b[^>]*href\s*=\s*["']\.\.\/\.\.\/index\.html["']/i.test(content)) {
            issues.push({
                code: 'NAV-003',
                severity: 'high',
                category: 'navigation',
                message: `Back button href skips course home — links to house index instead of ${courseDir}/index.html`,
                file: filePath,
                house: file.house,
                courseDir: courseDir,
                fix: `Change href from '../../index.html' to '../index.html' to link to the course home`
            });
        }

        return issues;
    }

    /**
     * NAV-004: Check if path cards in a house index have missing hrefs
     * when a hub directory (modules/{pathId}/index.html) exists.
     *
     * A path card without an href falls back to path-view.html, which
     * produces a 404 if the path has its own hub page.
     *
     * @param {Object} file - File object with content and path
     * @returns {Array} Issues found
     */
    _checkPathCardHrefs(file) {
        const content = file.content || '';
        const filePath = (file.path || '').replace(/\\/g, '/');
        const issues = [];

        // Extract the house directory from the file path
        // Pattern: houses/{house}/index.html
        const houseMatch = filePath.match(/^houses\/([^/]+)\/index\.html$/);
        if (!houseMatch) return issues;

        const house = houseMatch[1];

        // Find paths: [...] blocks, then parse entries within them
        const pathsBlockRegex = /paths\s*:\s*\[([\s\S]*?)\]/g;
        let blockMatch;

        while ((blockMatch = pathsBlockRegex.exec(content)) !== null) {
            const blockContent = blockMatch[1];

            // Find individual path entries within this block
            const entryRegex = /\{\s*id:\s*'([^']+)'[^}]*\}/g;
            let entryMatch;

            while ((entryMatch = entryRegex.exec(blockContent)) !== null) {
                const fullEntry = entryMatch[0];
                const pathId = entryMatch[1];

                // Skip if this entry already has an href
                if (/href\s*:/.test(fullEntry)) continue;

                // Check if a hub directory exists: modules/{pathId}/index.html
                const rootPath = this.rootPath || './_app';
                const hubPath = path.resolve(rootPath, 'houses', house, 'modules', pathId, 'index.html');

                if (fs.existsSync(hubPath)) {
                    issues.push({
                        code: 'NAV-004',
                        severity: 'high',
                        category: 'navigation',
                        message: `Path card '${pathId}' has no href but hub exists at modules/${pathId}/index.html — clicking this card will 404`,
                        file: filePath,
                        house: house,
                        pathId: pathId,
                        fix: `Add href: 'modules/${pathId}/index.html' to the path entry`
                    });
                }
            }
        }

        return issues;
    }
}

module.exports = NavigationValidator;
