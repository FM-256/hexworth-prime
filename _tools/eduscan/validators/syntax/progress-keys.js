/**
 * EduScan - ProgressKeys Validator
 *
 * Detects broken progress tracking patterns that cause progress bars to
 * permanently read 0%. These bugs are invisible — no JS errors, no blank
 * screens — students complete work but the index page never reflects it.
 *
 * Rules:
 * - PROG-001: localStorage.getItem('hexworth_progress_' + ...) — individual
 *             key reads. Nothing writes these keys; ModuleProgress.complete()
 *             and ProgressManager.completeModule() both write to the nested
 *             hexworth_progress[houseId][moduleId] blob. Progress bar stuck at 0%.
 *
 * - PROG-002: ModuleProgress.complete('moduleId', 'url') — 2-arg call missing
 *             houseId. The API is complete(houseId, moduleId, options). With 2
 *             args, moduleId lands in houseId position and the URL in moduleId,
 *             writing to a nonsense key like hexworth_progress['cloud-openstack-intro']['../index.html'].
 */

class ProgressKeysValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
    }

    /**
     * Validate a single file for broken progress key patterns
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        if (this.profile === 'inventory') return [];

        const content = file.content;
        if (!content) return [];

        // Only check HTML files
        if (!file.path.endsWith('.html')) return [];

        const issues = [];

        issues.push(...this.checkIndividualKeyReads(file));
        issues.push(...this.checkTwoArgComplete(file));

        return issues;
    }

    /**
     * PROG-001: localStorage.getItem('hexworth_progress_' + ...)
     *
     * Individual hexworth_progress_ keys are never written by any component.
     * ModuleProgress.complete() writes to hexworth_progress (a JSON blob) at
     * [houseId][moduleId]. Reading hexworth_progress_ + id always returns null.
     */
    checkIndividualKeyReads(file) {
        const issues = [];

        // Match patterns like:
        //   localStorage.getItem('hexworth_progress_' + id)
        //   localStorage.getItem("hexworth_progress_" + id)
        //   localStorage.getItem(`hexworth_progress_${id}`)
        const regex = /localStorage\.getItem\s*\(\s*['"`]hexworth_progress_/g;
        let match;
        let count = 0;

        while ((match = regex.exec(file.content)) !== null) {
            count++;
            if (count === 1) {
                const line = file.content.substring(0, match.index).split('\n').length;
                issues.push({
                    code: 'PROG-001',
                    severity: 'critical',
                    category: 'progress-keys',
                    message: `Reads individual localStorage key 'hexworth_progress_...' — these keys are never written. ModuleProgress.complete() writes to nested hexworth_progress[houseId][moduleId]. Progress bar stuck at 0%.`,
                    file: file.path,
                    line,
                    fix: "Read from the nested blob: JSON.parse(localStorage.getItem('hexworth_progress') || '{}')[houseId][moduleId]"
                });
            }
        }

        // Report count if multiple occurrences
        if (count > 1 && issues.length > 0) {
            issues[0].message = `${count}x reads of individual localStorage key 'hexworth_progress_...' — these keys are never written. ModuleProgress.complete() writes to nested hexworth_progress[houseId][moduleId]. Progress bar stuck at 0%.`;
        }

        return issues;
    }

    /**
     * PROG-002: ModuleProgress.complete('moduleId', 'url') — 2-arg form
     *
     * The correct API is: ModuleProgress.complete(houseId, moduleId, options)
     * With 2 string args, the first arg (intended moduleId) lands in the
     * houseId position, and the second (intended URL) lands in moduleId.
     * This writes to hexworth_progress['cloud-openstack-intro']['../index.html']
     * instead of hexworth_progress['cloud']['cloud-openstack-intro'].
     */
    checkTwoArgComplete(file) {
        const issues = [];

        // Must include ModuleProgress to be relevant
        if (!file.content.includes('ModuleProgress')) return [];

        // Match: ModuleProgress.complete('string', 'string')
        // where second arg looks like a URL (contains / or . or .html)
        // This distinguishes the broken 2-arg pattern from the valid 3-arg pattern
        const regex = /ModuleProgress\.complete\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/g;
        let match;

        while ((match = regex.exec(file.content)) !== null) {
            const arg1 = match[1];
            const arg2 = match[2];

            // If arg2 looks like a URL or path (contains / or ends with .html),
            // this is the broken 2-arg pattern: complete(moduleId, returnUrl)
            // instead of correct: complete(houseId, moduleId, { returnUrl })
            if (arg2.includes('/') || arg2.endsWith('.html')) {
                const line = file.content.substring(0, match.index).split('\n').length;
                issues.push({
                    code: 'PROG-002',
                    severity: 'critical',
                    category: 'progress-keys',
                    message: `ModuleProgress.complete('${arg1}', '${arg2}') — 2-arg call missing houseId. API is complete(houseId, moduleId, options). '${arg1}' is in houseId position, '${arg2}' (a URL) is in moduleId position.`,
                    file: file.path,
                    line,
                    fix: `ModuleProgress.complete('HOUSE_ID', '${arg1}', { returnUrl: '${arg2}' })`
                });
            }
        }

        return issues;
    }
}

module.exports = ProgressKeysValidator;
