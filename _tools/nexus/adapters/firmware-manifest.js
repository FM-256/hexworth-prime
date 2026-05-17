#!/usr/bin/env node
'use strict';

const path = require('path');

/**
 * Firmware-Manifest Schema Spoke Adapter (FIRM-001)
 *
 * Surfaces firmware-manifest-audit.js findings into the Nexus pipeline.
 * The validator catches structural defects in
 * `_app/signal/firmware-bins/<project>/<version>/manifest.json` files
 * and the catalog at `_app/signal/firmware-bins/index.json`.
 *
 * The Web Flasher dispatches on `flasherMode`. A missing or unknown
 * value used to silently fall back to `webserial-esp32` — that
 * fallback was removed 2026-05-17. This validator is the structural
 * defense at scan time so the class of bug never resurfaces.
 *
 *   FIRM-001.A  MISSING_FLASHER_MODE   critical
 *   FIRM-001.B  UNKNOWN_FLASHER_MODE   critical
 *   FIRM-001.C  MISSING_REQUIRED_FIELD high
 *   FIRM-001.D  NAME_COLLISION         medium
 *
 * Adapter reuses the standalone validator's runAudit() so a future
 * detection-logic change updates both CLI and adapter together.
 *
 * Nexus integration:
 *   nexus firmware-manifest        Pretty-printed report
 *   nexus firmware-manifest --json Machine-readable report
 *   alias: nexus fm
 */
module.exports = function createFirmwareManifestAdapter({ name, dataPath, projectRoot }) {

    const validatorPath = path.join(projectRoot, '_tools/eduscan/firmware-manifest-audit.js');
    const { runAudit } = require(validatorPath);

    function runReport() {
        try {
            return runAudit();
        } catch (e) {
            return null;
        }
    }

    function getFindings() {
        const report = runReport();
        if (!report || !report.findings) return [];
        return report.findings.map((f, i) => ({
            id: f.code.replace('.', '_') + '_' + (f.file || '').replace(/[^a-z0-9]+/gi, '_') + '_' + i,
            code: f.code,
            severity: f.severity,
            category: 'firmware',
            source: 'firmware-manifest',
            file: f.file,
            message: f.message,
            fix:
                f.code === 'FIRM-001.A' ? `Add "flasherMode": "<mode>" to the manifest. Valid: webserial-esp32, external-download, external-editor, disk-image.` :
                f.code === 'FIRM-001.B' ? `Fix the flasherMode value. Valid: webserial-esp32, external-download, external-editor, disk-image.` :
                f.code === 'FIRM-001.C' ? `Add the missing field per the manifest schema (see _app/signal/firmware-bins/README.md).` :
                f.code === 'FIRM-001.D' ? `Likely a typo — you may mean "flasherMode" (renderer dispatch), not "flashMode" (ESP32 chip-level IO mode).` :
                                          `Inspect the manifest against the schema.`,
        }));
    }

    function getStatus() {
        const report = runReport();
        if (!report) {
            return { available: false, reason: 'validator failed to run' };
        }
        const t = report.totals;
        return {
            available: true,
            name: 'Firmware-Manifest Schema (FIRM-001)',
            issueCount: t.findingsTotal,
            bySeverity: {
                critical: t.findingsBySeverity.critical || 0,
                high:     t.findingsBySeverity.high     || 0,
                medium:   t.findingsBySeverity.medium   || 0,
                low:      t.findingsBySeverity.low      || 0,
                info:     0,
            },
            manifestsInspected: t.manifestsInspected,
        };
    }

    return {
        name,
        getStatus,
        commands: {
            '': (args, flags) => {
                const C = {
                    red:    '\x1b[31m',
                    yellow: '\x1b[33m',
                    cyan:   '\x1b[36m',
                    green:  '\x1b[32m',
                    bold:   '\x1b[1m',
                    dim:    '\x1b[2m',
                    reset:  '\x1b[0m'
                };

                const report = runReport();
                if (!report) {
                    console.log(`  ${C.red}validator failed to load${C.reset}`);
                    return null;
                }

                if (flags.json) {
                    console.log(JSON.stringify(report, null, 2));
                    return report;
                }

                const t = report.totals;
                console.log('');
                console.log(`${C.bold}FIRMWARE-MANIFEST SCHEMA (FIRM-001)${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                console.log(`  Manifests inspected:       ${t.manifestsInspected}`);
                console.log(`  ${C.red}critical:${C.reset}                  ${t.findingsBySeverity.critical || 0}`);
                console.log(`  ${C.yellow}high:${C.reset}                      ${t.findingsBySeverity.high     || 0}`);
                console.log(`  ${C.dim}medium:${C.reset}                    ${t.findingsBySeverity.medium   || 0}`);
                console.log(`  Self-validation:           ${report.selfValidationPassed ? C.green + 'PASS' : C.red + 'FAIL'}${C.reset}`);

                const findings = report.findings || [];
                if (findings.length === 0) {
                    console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                    console.log(`  ${C.green}Schema clean.${C.reset} All manifests have valid flasherMode + mode-specific required fields.`);
                    console.log('');
                    return report;
                }

                console.log('');
                console.log(`  ${C.bold}Findings:${C.reset}`);
                findings.slice(0, 20).forEach(f => {
                    const tag =
                        f.severity === 'critical' ? `${C.red}[${f.code}]${C.reset}` :
                        f.severity === 'high'     ? `${C.yellow}[${f.code}]${C.reset}` :
                                                    `${C.dim}[${f.code}]${C.reset}`;
                    console.log(`    ${tag} ${f.file}  ${f.message}`);
                });
                if (findings.length > 20) {
                    console.log(`    ${C.dim}... and ${findings.length - 20} more (run --json for full)${C.reset}`);
                }
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                console.log('');
                return report;
            }
        },
        getFindings,
    };
};
