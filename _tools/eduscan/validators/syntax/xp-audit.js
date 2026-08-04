/**
 * EduScan — XP Audit Validator
 *
 * Detects XP pipeline inconsistencies that cause rate drift, silent overwrites,
 * and incorrect scoring. These are the verified bugs from the XP pipeline audit.
 *
 * Issue codes:
 *   XP-001  (high)     Duplicate XP rate constant — file defines own rate table instead of referencing XPCalculator.XP_RATES
 *   XP-002  (high)     Hardcoded XP in FieldValue.increment() — bypasses central rate config
 *   XP-003  (high)     Quiz perfect threshold === 100 (should be >= 90)
 *   XP-004  (critical) setUserProfile writing xp: without Math.max guard — can overwrite higher values
 */

const fs = require('fs');
const path = require('path');

// XP-001: rate constant definitions that should only live in XPCalculator.js
const RATE_CONST_RE = /(?:const|static|let|var)\s+(?:XP_(?:BY_TYPE|REWARDS|VALUES))\s*=\s*\{/;

// XP-002: hardcoded XP values in FieldValue.increment()
const FIELD_INCREMENT_RE = /FieldValue\.increment\(\s*(?:25|100|200|500|1000)\s*\)/;

// XP-003: quiz perfect threshold using strict equality to 100
const PERFECT_THRESHOLD_RE = /(?:score|numScore)\s*===\s*100/;

// XP-004: setUserProfile call
const SET_PROFILE_RE = /setUserProfile\s*\(/;

class XPAuditValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        // appRoot: the APP ROOT (holds components/, config/, houses/, arctic/). Fixed regardless
        // of which subtree a scan walks; defaults to rootPath so full scans are unchanged.
        // App-wide assets resolved against a scan subtree either vanish (silently disabling the
        // check) or fabricate findings. See _tools/eduscan/index.js for the 2026-08-04 incident.
        this.appRoot = options.appRoot || this.rootPath;
        this.profile = options.profile || 'ci';
    }

    /**
     * Per-file validation — checks any JS file passed to it.
     * Used by the test harness (fixtures pass through here).
     */
    validate(file) {
        const issues = [];
        const { content, path: filePath } = file;

        if (!content) return issues;
        if (!filePath.endsWith('.js')) return issues;

        const lines = content.split('\n');
        const basename = path.basename(filePath);

        // XP-001: rate constant defs in files OTHER than XPCalculator.js
        // Skip files that guard with typeof XPCalculator (intentional fallback duplication)
        // Skip constants whose keys don't overlap canonical XP_RATES (domain-specific)
        if (basename !== 'XPCalculator.js') {
            const hasXPCalcGuard = /typeof\s+XPCalculator\s*!==/.test(content);
            for (let i = 0; i < lines.length; i++) {
                if (RATE_CONST_RE.test(lines[i])) {
                    const match = lines[i].match(/XP_(?:BY_TYPE|REWARDS|VALUES)/);

                    // Check if this constant block uses canonical keys
                    // Scan up to 15 lines for the closing brace to capture all keys
                    const constBlock = lines.slice(i, Math.min(i + 15, lines.length)).join('\n');
                    const canonicalKeys = /PRESENTATION_VIEW|QUIZ_PASS|QUIZ_PERFECT|LAB_COMPLETE|MODULE_COMPLETE|COURSE_COMPLETE|DAILY_LOGIN/;
                    const hasCanonicalKeys = canonicalKeys.test(constBlock);

                    // Skip domain-specific constants (e.g. RING_CLAIMED) that don't overlap
                    if (!hasCanonicalKeys) continue;

                    // Downgrade to low severity if file has typeof XPCalculator guard
                    // (intentional duplication for load-order safety)
                    const severity = hasXPCalcGuard ? 'low' : 'high';

                    issues.push({
                        code: 'XP-001',
                        severity,
                        category: 'xp-audit',
                        message: `Duplicate XP rate constant "${match[0]}" — should reference XPCalculator.XP_RATES instead`,
                        file: filePath,
                        line: i + 1,
                        fix: hasXPCalcGuard
                            ? `Values are intentionally duplicated for load-order safety — ensure they stay aligned with XPCalculator.XP_RATES`
                            : `Remove local ${match[0]} definition and import from XPCalculator.js`
                    });
                }
            }
        }

        // XP-002: hardcoded XP in FieldValue.increment()
        for (let i = 0; i < lines.length; i++) {
            if (FIELD_INCREMENT_RE.test(lines[i])) {
                const match = lines[i].match(/FieldValue\.increment\(\s*(\d+)\s*\)/);
                issues.push({
                    code: 'XP-002',
                    severity: 'high',
                    category: 'xp-audit',
                    message: `Hardcoded XP value ${match[1]} in FieldValue.increment() — use XP_RATES constant instead`,
                    file: filePath,
                    line: i + 1,
                    fix: `Replace hardcoded ${match[1]} with reference to XP_RATES`
                });
            }
        }

        // XP-003: quiz perfect threshold === 100 used to gate XP awards
        // Only flag when the surrounding context involves XP/bonus rewards,
        // NOT for achievement unlocks or UI messages (which correctly use === 100)
        for (let i = 0; i < lines.length; i++) {
            if (PERFECT_THRESHOLD_RE.test(lines[i])) {
                // Check 5 lines around the match for XP-award context
                const nearby = lines.slice(Math.max(0, i - 3), Math.min(i + 4, lines.length)).join('\n');
                if (/\bxp\b|bonus.*xp|xp.*bonus|increment|XP_|awardXP|addXP/i.test(nearby)) {
                    issues.push({
                        code: 'XP-003',
                        severity: 'high',
                        category: 'xp-audit',
                        message: 'Quiz perfect threshold uses === 100 to gate XP — should be >= 90 to match platform standard',
                        file: filePath,
                        line: i + 1,
                        fix: 'Change === 100 to >= 90 for perfect score threshold'
                    });
                }
            }
        }

        // XP-004: setUserProfile writing xp: without Math.max guard
        for (let i = 0; i < lines.length; i++) {
            if (SET_PROFILE_RE.test(lines[i])) {
                // Scan 20 lines before and 6 lines after for xp: without Math.max
                const blockStart = Math.max(0, i - 20);
                const blockEnd = Math.min(i + 6, lines.length);
                const block = lines.slice(blockStart, blockEnd).join('\n');
                const callAndAfter = lines.slice(i, blockEnd).join('\n');
                if (/\bxp\s*:/.test(callAndAfter) && !/Math\.max/.test(block)) {
                    issues.push({
                        code: 'XP-004',
                        severity: 'critical',
                        category: 'xp-audit',
                        message: 'setUserProfile() writes xp: without Math.max guard — can overwrite higher XP values',
                        file: filePath,
                        line: i + 1,
                        fix: 'Wrap xp value with Math.max(currentXP, newXP) before writing'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Global validation — scans components/*.js and functions/index.js
     * for XP pipeline issues across the codebase.
     */
    validateGlobal() {
        const issues = [];

        // Scan components/*.js
        const componentsDir = path.join(this.appRoot, 'components');
        if (fs.existsSync(componentsDir)) {
            const jsFiles = this._findJSFiles(componentsDir);
            for (const filePath of jsFiles) {
                let content;
                try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }
                const relPath = path.relative(this.rootPath, filePath);
                const fileIssues = this.validate({ path: relPath, content });
                issues.push(...fileIssues);
            }
        }

        // Scan functions/index.js (Cloud Functions)
        const functionsPath = path.resolve(this.rootPath, '../../functions/index.js');
        if (fs.existsSync(functionsPath)) {
            let content;
            try { content = fs.readFileSync(functionsPath, 'utf8'); } catch { content = null; }
            if (content) {
                const relPath = path.relative(this.rootPath, functionsPath);
                const fileIssues = this.validate({ path: relPath, content });
                issues.push(...fileIssues);
            }
        }

        if (this.verbose) {
            console.log(`[XP-AUDIT] Found ${issues.length} XP pipeline issues`);
        }

        return issues;
    }

    /**
     * Find all .js files in a directory (non-recursive — components/ is flat)
     */
    _findJSFiles(dir) {
        const results = [];
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith('.js')) {
                    results.push(path.join(dir, entry.name));
                }
            }
        } catch { /* skip unreadable dirs */ }
        return results;
    }
}

module.exports = XPAuditValidator;
