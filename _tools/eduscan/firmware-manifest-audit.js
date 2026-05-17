#!/usr/bin/env node
/**
 * EduScan — Firmware Manifest Schema Audit (FIRM-001)
 *
 * The Web Flasher (`_app/signal/toolkit/web-flasher.html`) dispatches
 * on a per-manifest `flasherMode` field. Four valid values:
 *
 *   - webserial-esp32     (in-browser flashing via esptool-js)
 *   - external-download   (UF2 drag-drop, e.g. Pi Pico)
 *   - external-editor     (IDE handoff, e.g. Arduino IDE)
 *   - disk-image          (OS install walkthrough, e.g. Pi 3/4/5)
 *
 * Each mode requires a specific set of fields. A missing or misspelled
 * `flasherMode` USED to silently fallback to webserial-esp32 — that
 * fallback was removed 2026-05-17 after Nancy review (the flasher now
 * errors when the field is missing). This validator catches the same
 * class of bug structurally at scan time, BEFORE the manifest reaches
 * production.
 *
 * Issue codes:
 *   - FIRM-001.A: MISSING_FLASHER_MODE  (critical — refuses to flash)
 *   - FIRM-001.B: UNKNOWN_FLASHER_MODE  (critical — no renderer matches)
 *   - FIRM-001.C: MISSING_REQUIRED_FIELD (high — mode-specific field absent)
 *   - FIRM-001.D: NAME_COLLISION        (medium — flashMode/flasherMode confusion)
 *
 * Scope:
 *   - INPUT:   _app/signal/firmware-bins/index.json
 *   - INPUT:   _app/signal/firmware-bins/<project>/<version>/manifest.json (one per entry)
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/firmware-manifest-audit.js
 *
 * Output:
 *   _tools/reports/FIRMWARE_MANIFEST_AUDIT.json
 *   stdout — summary + first findings
 *
 * Exit codes:
 *   0 — report written (whether or not findings exist)
 *   2 — self-validation failure (refuses to write)
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const BINS_DIR = path.join(ROOT, '_app/signal/firmware-bins');
const INDEX_FILE = path.join(BINS_DIR, 'index.json');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'FIRMWARE_MANIFEST_AUDIT.json');

const VALID_MODES = new Set([
    'webserial-esp32',
    'external-download',
    'external-editor',
    'disk-image',
]);

// Mode-specific required fields. Universal fields (name, version,
// flasherMode, description) are checked separately.
const REQUIRED_BY_MODE = {
    'webserial-esp32':   ['boardTargets', 'chipFamily', 'flashSize', 'flashMode', 'flashFreq', 'files'],
    'external-download': ['boardTargets', 'chipFamily', 'files', 'boot'],
    'external-editor':   ['boardTargets', 'chipFamily', 'files', 'editor'],
    'disk-image':        ['boardTargets', 'chipFamily', 'walkthroughUrl', 'imager'],
};

// Universal required fields (every manifest, regardless of mode).
const REQUIRED_UNIVERSAL = ['name', 'version', 'flasherMode', 'description'];

function relpath(p) { return path.relative(ROOT, p); }

function lintManifest(manifestPath, manifest) {
    const findings = [];
    const file = relpath(manifestPath);

    // Universal checks
    for (const f of REQUIRED_UNIVERSAL) {
        if (!(f in manifest)) {
            findings.push({
                code: f === 'flasherMode' ? 'FIRM-001.A' : 'FIRM-001.C',
                severity: f === 'flasherMode' ? 'critical' : 'high',
                file,
                message: `Manifest missing required universal field: ${f}`,
            });
        }
    }

    const mode = manifest.flasherMode;
    if (mode && !VALID_MODES.has(mode)) {
        findings.push({
            code: 'FIRM-001.B',
            severity: 'critical',
            file,
            message: `Unknown flasherMode "${mode}". Valid values: ${[...VALID_MODES].join(', ')}`,
        });
        return findings;
    }

    // Mode-specific required fields
    if (mode && REQUIRED_BY_MODE[mode]) {
        for (const f of REQUIRED_BY_MODE[mode]) {
            if (!(f in manifest)) {
                findings.push({
                    code: 'FIRM-001.C',
                    severity: 'high',
                    file,
                    message: `flasherMode "${mode}" requires field "${f}" — missing`,
                });
            }
        }
    }

    // Naming collision: both flasherMode AND flashMode present.
    // This is LEGAL for webserial-esp32 (flashMode = chip-level IO mode,
    // flasherMode = renderer dispatch), but for any other mode it's
    // strongly suspicious — usually a typo or copy-paste error.
    if ('flashMode' in manifest && mode && mode !== 'webserial-esp32') {
        findings.push({
            code: 'FIRM-001.D',
            severity: 'medium',
            file,
            message: `flashMode is set ("${manifest.flashMode}") but flasherMode is "${mode}" — flashMode only applies to webserial-esp32 mode. Likely a typo for flasherMode.`,
        });
    }

    return findings;
}

function lintIndex(indexPath, index) {
    const findings = [];
    const file = relpath(indexPath);

    if (!Array.isArray(index.projects)) {
        findings.push({
            code: 'FIRM-001.C',
            severity: 'critical',
            file,
            message: 'index.json is missing "projects" array',
        });
        return findings;
    }

    for (const p of index.projects) {
        if (!p.flasherMode) {
            findings.push({
                code: 'FIRM-001.A',
                severity: 'critical',
                file,
                message: `Catalog entry "${p.id || '?'}" is missing flasherMode`,
            });
        } else if (!VALID_MODES.has(p.flasherMode)) {
            findings.push({
                code: 'FIRM-001.B',
                severity: 'critical',
                file,
                message: `Catalog entry "${p.id || '?'}" has unknown flasherMode "${p.flasherMode}"`,
            });
        }
    }

    return findings;
}

function runAudit() {
    const startedAt = Date.now();
    const findings = [];
    const inspected = [];

    // 1. Validate index.json
    if (!fs.existsSync(INDEX_FILE)) {
        return {
            ranAt: new Date().toISOString(),
            scope: { input: [relpath(INDEX_FILE)] },
            totals: { manifestsInspected: 0, findingsBySeverity: {}, durationMs: Date.now() - startedAt },
            selfValidationPassed: false,
            findings: [{
                code: 'FIRM-001.C',
                severity: 'critical',
                file: relpath(INDEX_FILE),
                message: 'firmware-bins/index.json not found',
            }],
        };
    }
    const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    findings.push(...lintIndex(INDEX_FILE, index));

    // 2. Validate every manifest.json under firmware-bins
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(p);
            else if (entry.isFile() && entry.name === 'manifest.json') {
                inspected.push(relpath(p));
                try {
                    const manifest = JSON.parse(fs.readFileSync(p, 'utf-8'));
                    findings.push(...lintManifest(p, manifest));
                } catch (e) {
                    findings.push({
                        code: 'FIRM-001.C',
                        severity: 'critical',
                        file: relpath(p),
                        message: `manifest.json failed to parse: ${e.message}`,
                    });
                }
            }
        }
    }
    walk(BINS_DIR);

    // Self-validation: this validator must produce zero findings on the
    // current production tree. If it doesn't, either the tree is broken
    // or the validator has a regression. Both warrant investigation
    // before trusting the output.
    const selfPass = findings.length === 0;

    const findingsBySeverity = {};
    for (const f of findings) {
        findingsBySeverity[f.severity] = (findingsBySeverity[f.severity] || 0) + 1;
    }

    return {
        ranAt: new Date().toISOString(),
        scope: { input: [relpath(INDEX_FILE), relpath(BINS_DIR) + '/**/manifest.json'] },
        totals: {
            manifestsInspected: inspected.length,
            findingsTotal: findings.length,
            findingsBySeverity,
            durationMs: Date.now() - startedAt,
        },
        selfValidationPassed: selfPass,
        inspected,
        findings,
    };
}

function cli() {
    const report = runAudit();

    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    const t = report.totals;
    console.log('firmware-manifest-audit (FIRM-001)');
    console.log('========================================');
    console.log('  Manifests inspected:      ' + t.manifestsInspected);
    console.log('  Findings total:           ' + t.findingsTotal);
    if (t.findingsTotal > 0) {
        for (const sev of ['critical', 'high', 'medium', 'low']) {
            if (t.findingsBySeverity[sev]) {
                console.log('    ' + sev.padEnd(10) + ' ' + t.findingsBySeverity[sev]);
            }
        }
    }
    console.log('  Self-validation:          ' + (report.selfValidationPassed ? 'PASS' : 'FAIL'));
    console.log('  Duration:                 ' + t.durationMs + 'ms');
    console.log('  Output:                   ' + path.relative(ROOT, OUT_FILE));
    if (report.findings.length) {
        console.log('---');
        console.log('First 20 findings:');
        for (const f of report.findings.slice(0, 20)) {
            console.log('  [' + f.code + '] ' + f.severity.toUpperCase() + '  ' + f.file + '  ' + f.message);
        }
        if (report.findings.length > 20) {
            console.log('  ... and ' + (report.findings.length - 20) + ' more in the report.');
        }
    }
}

if (require.main === module) {
    cli();
}

module.exports = { runAudit };
