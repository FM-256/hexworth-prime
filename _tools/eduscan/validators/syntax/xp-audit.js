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
        if (basename !== 'XPCalculator.js') {
            for (let i = 0; i < lines.length; i++) {
                if (RATE_CONST_RE.test(lines[i])) {
                    const match = lines[i].match(/XP_(?:BY_TYPE|REWARDS|VALUES)/);
                    issues.push({
                        code: 'XP-001',
                        severity: 'high',
                        category: 'xp-audit',
                        message: `Duplicate XP rate constant "${match[0]}" — should reference XPCalculator.XP_RATES instead`,
                        file: filePath,
                        line: i + 1,
                        fix: `Remove local ${match[0]} definition and import from XPCalculator.js`
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

        // XP-003: quiz perfect threshold === 100
        // Only flag in files with quiz/XP relevance
        const hasQuizContext = /quiz|score|xp/i.test(content);
        if (hasQuizContext) {
            for (let i = 0; i < lines.length; i++) {
                if (PERFECT_THRESHOLD_RE.test(lines[i])) {
                    issues.push({
                        code: 'XP-003',
                        severity: 'high',
                        category: 'xp-audit',
                        message: 'Quiz perfect threshold uses === 100 — should be >= 90 to match platform standard',
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
                // Scan this line and next 5 lines for xp: without Math.max
                const block = lines.slice(i, Math.min(i + 6, lines.length)).join('\n');
                if (/\bxp\s*:/.test(block) && !/Math\.max/.test(block)) {
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
        const componentsDir = path.join(this.rootPath, 'components');
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
