/**
 * EduScan - Cross-Layer ID Coupling Validator
 *
 * Catches the bug class where IDs drift between coupled layers:
 *   - Course progress.js MODULES array
 *   - Course hub index.html data-module attributes
 *
 * When these get out of sync (typically from a rename in one layer that wasn't
 * propagated to the other), the progress display silently fails — student
 * progress is preserved in storage under old keys but never displayed because
 * the hub queries the new keys.
 *
 * Real-world example: Stragglers branch renamed WSA hub data-module="m01"
 * to data-module="wsa-module01" but left progress.js MODULES array as
 * ['m01'..'m20']. WSA hub then displays every module as "not-started" for
 * every student regardless of actual progress.
 *
 * Issue codes:
 * - XREF-001: ID mismatch between progress.js MODULES and hub data-module attrs
 *
 * Created: 2026-05-03
 */

const fs = require('fs');
const path = require('path');

class XRefValidator {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
    }

    /**
     * Main entry point — scan all course pairs (progress.js + sibling index.html)
     * and cross-reference IDs.
     */
    validate() {
        const issues = [];
        const summary = {
            coursesChecked: 0,
            mismatchedIds: 0,
            coursesWithMismatches: 0
        };

        const pairs = this._findCoursePairs(this.rootPath);

        for (const pair of pairs) {
            summary.coursesChecked++;
            const progressIds = this._extractProgressKeys(pair.progressJs);
            const hubIds = this._extractDataModuleAttrs(pair.indexHtml);

            // Skip pairs where extraction failed (fallback safety)
            if (progressIds === null || hubIds === null) {
                if (this.verbose) {
                    console.log(`[XREF] Skipping ${pair.course} — extraction failed`);
                }
                continue;
            }

            // Skip courses whose hub doesn't use data-module pattern at all.
            // (e.g., python hubs render progress via a different mechanism.)
            // Only courses that DO use data-module attrs are subject to the coupling check.
            if (hubIds.size === 0) {
                if (this.verbose) {
                    console.log(`[XREF] Skipping ${pair.course} — hub uses no data-module attrs (different progress pattern)`);
                }
                continue;
            }

            // IDs in progress.js but not in hub HTML
            const missingFromHub = [...progressIds].filter(id => !hubIds.has(id));
            // IDs in hub HTML but not in progress.js
            const missingFromProgress = [...hubIds].filter(id => !progressIds.has(id));

            const courseHasIssues = missingFromHub.length > 0 || missingFromProgress.length > 0;
            if (courseHasIssues) summary.coursesWithMismatches++;

            for (const id of missingFromHub) {
                summary.mismatchedIds++;
                issues.push({
                    code: 'XREF-001',
                    severity: 'high',
                    category: 'xref',
                    message: `Course '${pair.course}': '${id}' in progress.js MODULES but no data-module="${id}" in hub HTML — progress key orphaned`,
                    file: pair.progressJsRel,
                    course: pair.course,
                    moduleId: id,
                    direction: 'progress-orphan',
                    fix: `Either remove '${id}' from MODULES in ${pair.progressJsRel}, or add a card with data-module="${id}" to ${pair.indexHtmlRel}`
                });
            }

            for (const id of missingFromProgress) {
                summary.mismatchedIds++;
                issues.push({
                    code: 'XREF-001',
                    severity: 'high',
                    category: 'xref',
                    message: `Course '${pair.course}': data-module="${id}" in hub HTML but not in progress.js MODULES — progress display will silently fail for students`,
                    file: pair.indexHtmlRel,
                    course: pair.course,
                    moduleId: id,
                    direction: 'hub-orphan',
                    fix: `Add '${id}' to MODULES array in ${pair.progressJsRel}, or rename data-module attr in ${pair.indexHtmlRel} to match an existing key`
                });
            }
        }

        return { issues, summary };
    }

    /**
     * Find all directories that contain BOTH progress.js and index.html.
     * These are course-hub pairs subject to ID coupling.
     */
    _findCoursePairs(rootDir) {
        const pairs = [];
        const stack = [rootDir];

        while (stack.length > 0) {
            const dir = stack.pop();
            let entries;
            try {
                entries = fs.readdirSync(dir, { withFileTypes: true });
            } catch (e) { continue; }

            const names = new Set(entries.filter(e => e.isFile()).map(e => e.name));
            if (names.has('progress.js') && names.has('index.html')) {
                const courseName = path.basename(dir);
                pairs.push({
                    course: courseName,
                    progressJs: path.join(dir, 'progress.js'),
                    indexHtml: path.join(dir, 'index.html'),
                    progressJsRel: path.relative(this.rootPath, path.join(dir, 'progress.js')),
                    indexHtmlRel: path.relative(this.rootPath, path.join(dir, 'index.html'))
                });
            }

            for (const e of entries) {
                if (!e.isDirectory()) continue;
                if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_archive') continue;
                stack.push(path.join(dir, e.name));
            }
        }

        return pairs;
    }

    /**
     * Extract IDs from a `const MODULES = [ 'a', 'b', ... ];` declaration.
     * Returns Set<string> or null if extraction fails.
     */
    _extractProgressKeys(progressJsPath) {
        let content;
        try {
            content = fs.readFileSync(progressJsPath, 'utf8');
        } catch (e) {
            return null;
        }

        // Match: const MODULES = [ ... ];
        // Tolerant of whitespace, multi-line arrays, comments mixed in.
        const m = content.match(/\bconst\s+MODULES\s*=\s*\[([\s\S]*?)\]\s*;/);
        if (!m) return null;

        const arrayBody = m[1];
        // Extract single- or double-quoted string literals
        const ids = new Set();
        const stringRe = /['"]([^'"\n]+)['"]/g;
        let sm;
        while ((sm = stringRe.exec(arrayBody)) !== null) {
            ids.add(sm[1]);
        }
        return ids;
    }

    /**
     * Extract all data-module attribute values from an HTML file.
     * Returns Set<string> or null if read fails.
     */
    _extractDataModuleAttrs(indexHtmlPath) {
        let content;
        try {
            content = fs.readFileSync(indexHtmlPath, 'utf8');
        } catch (e) {
            return null;
        }

        const ids = new Set();
        const re = /\bdata-module\s*=\s*["']([^"']+)["']/g;
        let m;
        while ((m = re.exec(content)) !== null) {
            ids.add(m[1]);
        }
        return ids;
    }
}

module.exports = XRefValidator;
