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

        // Load allowlist for known-intentional pairs (see _loadAllowlist).
        const allowlist = this._loadAllowlist();
        let suppressed = 0;
        let drifted = 0;

        // Report collisions
        for (const [key, sites] of callSitesByKey) {
            // Distinct files only (a file with multiple identical calls is fine)
            const uniqueFiles = Array.from(new Set(sites.map(s => s.file)));
            if (uniqueFiles.length < 2) continue;
            const [houseId, moduleId] = key.split('::');

            // Allowlist check: if this (house, moduleId) is allowlisted AND the
            // exact file set matches, suppress the issue. If the (house,
            // moduleId) is allowlisted but the file set has DRIFTED (e.g., a
            // new file accidentally adopted the same key), emit PROG-003-DRIFT
            // instead — loud signal that the intentional pair has changed.
            const allowEntry = allowlist.get(key);
            if (allowEntry) {
                const actualSorted = uniqueFiles.slice().sort();
                const expectedSorted = allowEntry.files.slice().sort();
                if (actualSorted.length === expectedSorted.length &&
                    actualSorted.every((f, i) => f === expectedSorted[i])) {
                    suppressed++;
                    continue;
                }
                // Drift: emit a distinct code so it's unambiguous in reports.
                drifted++;
                const expectedList = expectedSorted.map(f => `  expected: ${f}`).join('\n');
                const actualList = actualSorted.map(f => `  actual:   ${f}`).join('\n');
                issues.push({
                    code: 'PROG-003-DRIFT',
                    severity: 'medium',
                    category: 'progress-keys',
                    message: `Allowlisted progress-key pair has drifted. The (${houseId}, ${moduleId}) collision was previously approved as intentional, but the file set no longer matches the allowlist entry.\n${expectedList}\n${actualList}\n\nIf the new file set is intentional, update _tools/eduscan/config/prog003-allowlist.json (and document why). If unintentional, fix the new collision via the rename + copyLegacyKey pattern (see _docs/operations/prog003-rename-plan-2026-05-04.md).`,
                    file: actualSorted[0],
                    line: sites.find(s => s.file === actualSorted[0]).line,
                    allowlistReason: allowEntry.reason
                });
                continue;
            }

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
            console.log(`[PROG-003] Scanned ${htmlFiles.length} files, found ${issues.length} shared-key collisions (suppressed ${suppressed} via allowlist, ${drifted} drifted)`);
        }
        return { issues };
    }

    /**
     * Load the PROG-003 allowlist from
     * _tools/eduscan/config/prog003-allowlist.json. Returns a Map keyed by
     * `houseId::moduleId` with values { files[], reason, addedDate }.
     *
     * Schema:
     *   {
     *     "schema": "hexworth.eduscan.prog003-allowlist/v1",
     *     "entries": [
     *       {
     *         "house": "cloud",
     *         "module": "cloud-cloud",
     *         "files": ["houses/cloud/presentations/X.html", "houses/cloud/tools/X.html"],
     *         "reason": "Same module, two delivery modes — pres + tool",
     *         "addedDate": "2026-05-05"
     *       }
     *     ]
     *   }
     *
     * Failure modes (all silent — return empty allowlist, log if verbose):
     *   - file missing                → no allowlisting (default)
     *   - JSON parse error            → no allowlisting (don't break scans)
     *   - missing required fields     → that entry skipped, others kept
     */
    _loadAllowlist() {
        const map = new Map();
        const allowlistPath = path.join(__dirname, '..', '..', 'config', 'prog003-allowlist.json');
        if (!fs.existsSync(allowlistPath)) return map;
        try {
            const data = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
            for (const entry of (data.entries || [])) {
                if (!entry.house || !entry.module || !Array.isArray(entry.files)) continue;
                map.set(`${entry.house}::${entry.module}`, {
                    files: entry.files,
                    reason: entry.reason || '(no reason given)',
                    addedDate: entry.addedDate || ''
                });
            }
            if (this.verbose) {
                console.log(`[PROG-003] Loaded ${map.size} allowlist entries from ${allowlistPath}`);
            }
        } catch (e) {
            if (this.verbose) {
                console.log(`[PROG-003] Allowlist load failed (${e.message}); proceeding without allowlist`);
            }
        }
        return map;
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
