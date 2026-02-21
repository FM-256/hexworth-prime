/**
 * EduScan - Navigation Validator
 *
 * Detects content pages missing back/return navigation and
 * house/course index pages missing dashboard links.
 *
 * Rules:
 * - NAV-001: Content page has no back/return navigation
 * - NAV-002: House/course index page has no dashboard link
 */

class NavigationValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
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
            return issues;
        }

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

        // Pattern 3: href pointing to parent index or dashboard
        if (/href\s*=\s*["'][^"']*(\.\.\/index\.html|\.\.\/\.\.\/index\.html|dashboard\.html)/i.test(content)) {
            return [];
        }

        // Pattern 4: Text content indicating back navigation
        if (/←\s*Back|Return to|Go\s*Back|Exit\s*Lab/i.test(content)) {
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
}

module.exports = NavigationValidator;
