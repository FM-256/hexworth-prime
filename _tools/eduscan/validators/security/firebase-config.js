/**
 * EduScan — Firebase Config Validator (CONFIG-001)
 *
 * Static-analysis validator that ensures Firebase client config is consistent
 * and complete across the multiple JS files that initialize Firebase in
 * different parts of the platform.
 *
 * Background: the platform has Firebase config in two places (at minimum):
 *   _app/components/FirebaseAuth.js  (main auth init)
 *   _app/arena/firebase-init.js      (arena hub init)
 *
 * Drift between these would mean different parts of the platform connect
 * to different Firebase projects or use stale API keys — a class of bug
 * that manifests as silent auth/Firestore failures in production.
 *
 * Rules:
 *   CONFIG-001 (HIGH) — Firebase config field missing or inconsistent
 *
 * v0.5 scope (this file):
 *   Static checks only — extract config field values via regex, verify
 *   all required fields present in each file, verify cross-file equality
 *   for shared fields.
 *
 * v1 scope (future): runtime check — test API key against Firebase Auth REST
 *   API with custom-domain Referer headers to detect production-blocking
 *   referrer restrictions. Requires cataloging deployed domains and
 *   accepting that EduScan does live HTTP requests.
 *
 * Excluded from validation:
 *   - The validator only inspects the explicit FILES listed below; new
 *     Firebase init files (if any are added) must be added to FILES.
 */

const fs = require('fs');
const path = require('path');

const FILES = [
    '_app/components/FirebaseAuth.js',
    '_app/arena/firebase-init.js'
];

// Required Firebase config fields per the Firebase Web SDK docs.
// measurementId is optional (Analytics — only one of the two files uses it).
const REQUIRED_FIELDS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const OPTIONAL_FIELDS = ['measurementId'];

class FirebaseConfigValidator {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.profile = options.profile || 'ci';
    }

    validateGlobal() {
        if (this.profile === 'inventory') return [];
        const issues = [];
        const repoRoot = path.resolve(this.rootPath, '..');
        const configs = {};

        for (const rel of FILES) {
            const abs = path.join(repoRoot, rel);
            if (!fs.existsSync(abs)) {
                issues.push({
                    code: 'CONFIG-001',
                    severity: 'high',
                    category: 'config',
                    message: `Expected Firebase config file not found: ${rel}`,
                    file: rel,
                    fix: `Create ${rel} or remove from FirebaseConfigValidator FILES list`
                });
                continue;
            }
            const content = fs.readFileSync(abs, 'utf8');
            configs[rel] = this.extractConfig(content);

            // Per-file: required-field presence
            for (const field of REQUIRED_FIELDS) {
                if (!(field in configs[rel])) {
                    issues.push({
                        code: 'CONFIG-001',
                        severity: 'high',
                        category: 'config',
                        message: `Firebase config missing required field "${field}"`,
                        file: rel,
                        fix: `Add ${field}: "..." to the firebase config object`
                    });
                }
            }
        }

        // Cross-file: required-field value equality
        // (skip cross-file checks if any file is missing — already flagged above)
        if (Object.keys(configs).length === FILES.length) {
            const reference = FILES[0];
            for (let i = 1; i < FILES.length; i++) {
                const target = FILES[i];
                for (const field of REQUIRED_FIELDS) {
                    const refVal = configs[reference][field];
                    const tgtVal = configs[target][field];
                    if (refVal && tgtVal && refVal !== tgtVal) {
                        issues.push({
                            code: 'CONFIG-001',
                            severity: 'high',
                            category: 'config',
                            message: `Firebase config field "${field}" differs: ${reference} has "${refVal}", ${target} has "${tgtVal}". Drift between init files means parts of the platform connect to different projects.`,
                            file: target,
                            fix: `Align ${field} value across ${FILES.join(' and ')}`
                        });
                    }
                }
            }
        }

        return issues;
    }

    /**
     * Extract config field values from a JS source file.
     * Looks for `<field>: "..."` or `<field>: '...'` patterns inside an object
     * literal that contains apiKey (used as anchor to find the right block).
     */
    extractConfig(content) {
        const config = {};
        // Find a config block that contains apiKey
        const blockStart = content.indexOf('apiKey:');
        if (blockStart === -1) return config;
        // Walk back to the nearest `{` and forward to the matching `}`
        let braceStart = content.lastIndexOf('{', blockStart);
        if (braceStart === -1) return config;
        let depth = 1, i = braceStart + 1;
        while (i < content.length && depth > 0) {
            const c = content[i];
            if (c === '{') depth++;
            else if (c === '}') depth--;
            i++;
        }
        const block = content.substring(braceStart, i);
        for (const field of [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]) {
            const re = new RegExp(`\\b${field}\\s*:\\s*['"]([^'"]+)['"]`);
            const m = block.match(re);
            if (m) config[field] = m[1];
        }
        return config;
    }
}

module.exports = FirebaseConfigValidator;
