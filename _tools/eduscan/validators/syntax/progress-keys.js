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
 *
 * - PROG-003: Cross-file shared (houseId, moduleId) keys. Multiple distinct
 *             content files call ModuleProgress.complete('HOUSE', 'KEY', ...)
 *             with the same KEY. Harm: ModuleProgress.isFirstCompletion uses
 *             bare moduleId (without house), so only the first file's
 *             completion pushes XP/badges to Firestore — subsequent
 *             completions are silently suppressed. Confirmed bugs:
 *             WSA cloud-guilab (17 files), cloud-pslab (17 files);
 *             A+ Core 2 'forge'/'index' (12 chapter applets — template
 *             leftover, each chapter is distinct content).
 *             Severity: medium at 2-4 files (review for legitimacy),
 *             critical at 5+ files (almost certainly broken).
 *             Cross-file analysis — runs as global validator.
 *             Skips dynamic-key calls (e.g., complete('h', PREFIX + var)).
 */

const fs = require('fs');
const path = require('path');

class ProgressKeysValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
        this.rootPath = options.rootPath || './_app';
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

    /**
     * PROG-003: Cross-file shared (houseId, moduleId) progress keys.
     *
     * Walks ALL .html files under rootPath, extracts every literal-string
     * `ModuleProgress.complete('houseId', 'moduleId', ...)` call, groups by
     * the (houseId, moduleId) pair, and reports collisions.
     *
     * Skips dynamic concatenation calls — `complete('h', PREFIX + id)` etc.
     * Otherwise the regex captures the partial literal `'PREFIX-'` from
     * `'PREFIX-' + variable` and produces false positives.
     *
     * Severity tiers (per Nancy round-3 audit):
     *   2-4 files share key  → medium  (review for legitimacy: e.g., a
     *                          tool page and presentation page intentionally
     *                          marking the same module complete)
     *   5+ files share key   → critical (overwhelmingly likely a template
     *                          leftover or copy-paste bug)
     *
     * This is a GLOBAL validator (cross-file). Loads its own content via
     * fs.readFileSync — does not receive pre-loaded file objects. Reads each
     * .html file once during the global pass.
     */
    validateAll() {
        if (this.profile === 'inventory') return { issues: [] };

        const issues = [];
        const callSitesByKey = new Map();  // 'house::module' -> [{file, line}, ...]
        const htmlFiles = this._collectHtmlFiles(this.rootPath);

        // Match: ModuleProgress.complete('houseId', 'moduleId'...
        // Capture the trailing context (after second arg) to detect concatenation.
        const COMPLETE_RE = /ModuleProgress\.complete\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"](\s*[,)+])/g;

        for (const file of htmlFiles) {
            let content;
            try { content = fs.readFileSync(file, 'utf8'); } catch (e) { continue; }
            if (!content.includes('ModuleProgress.complete')) continue;
            COMPLETE_RE.lastIndex = 0;
            let m;
            while ((m = COMPLETE_RE.exec(content)) !== null) {
                const houseId = m[1];
                const moduleId = m[2];
                const trail = m[3];
                // Skip dynamic-key calls — if next non-whitespace after the
                // closing quote is `+`, the literal is being concatenated with
                // a variable. The captured `moduleId` is only the static prefix.
                if (trail.includes('+')) continue;
                // Skip the 2-arg URL pattern — that's PROG-002's territory
                // (fingerprint: arg2 contains / or ends in .html)
                if (moduleId.includes('/') || moduleId.endsWith('.html')) continue;

                const key = `${houseId}::${moduleId}`;
                const line = content.substring(0, m.index).split('\n').length;
                const relFile = path.relative(this.rootPath, file);
                if (!callSitesByKey.has(key)) callSitesByKey.set(key, []);
                callSitesByKey.get(key).push({ file: relFile, line });
            }
        }

        // Report collisions
        for (const [key, sites] of callSitesByKey) {
            // Distinct files only (a file with multiple identical calls is fine)
            const uniqueFiles = Array.from(new Set(sites.map(s => s.file)));
            if (uniqueFiles.length < 2) continue;
            const [houseId, moduleId] = key.split('::');
            const severity = uniqueFiles.length >= 5 ? 'critical' : 'medium';
            const sample = uniqueFiles.slice(0, 6).map(f => `  - ${f}`).join('\n');
            const more = uniqueFiles.length > 6 ? `\n  ... (${uniqueFiles.length - 6} more)` : '';
            issues.push({
                code: 'PROG-003',
                severity,
                category: 'progress-keys',
                message: `Shared progress key — ${uniqueFiles.length} files all call ModuleProgress.complete('${houseId}', '${moduleId}', ...). ModuleProgress.isFirstCompletion uses bare moduleId, so only the first file's completion pushes XP/badges to Firestore; subsequent completions across these ${uniqueFiles.length} files are silently suppressed. Files:\n${sample}${more}`,
                file: uniqueFiles[0],
                line: sites.find(s => s.file === uniqueFiles[0]).line,
                fix: `Use module-scoped keys per file. Pattern: '${houseId}-COURSE-PARENT-MODULE' where each parent module has a unique slug. E.g., 'cloud-wsa-m04-guilab' instead of shared 'cloud-guilab'.`,
            });
        }

        if (this.verbose) {
            console.log(`[PROG-003] Scanned ${htmlFiles.length} files, found ${issues.length} shared-key collisions`);
        }
        return { issues };
    }

    _collectHtmlFiles(root) {
        const out = [];
        const walk = (d) => {
            let entries;
            try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { return; }
            for (const e of entries) {
                if (e.name.startsWith('_') || e.name === 'node_modules') continue;
                const full = path.join(d, e.name);
                if (e.isDirectory()) walk(full);
                else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
            }
        };
        walk(root);
        return out;
    }
}

module.exports = ProgressKeysValidator;
