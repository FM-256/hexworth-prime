#!/usr/bin/env node
'use strict';

const path = require('path');

/**
 * Signal-Guides Coverage Spoke Adapter (XREF-003)
 *
 * Surfaces signal-guides-coverage-audit.js findings into the Nexus
 * pipeline. The validator catches three classes of drift between
 * SignalData.js project declarations and per-section guides.js
 * content modules:
 *
 *   XREF-003.A  MISSING_GUIDE — project declared, no guide entry
 *               (page renders "Under Construction" to students).
 *               Severity: high.
 *
 *   XREF-003.B  DEAD_GUIDE — guide entry, no matching project.
 *               Dead code in guides.js. Severity: medium.
 *
 *   XREF-003.C  THIN_GUIDE — guide has only `intro:` and nothing
 *               else (no wiringSvg / steps / troubleshooting).
 *               Severity: low.
 *
 * Adapter reuses the standalone validator's runAudit() so a future
 * detection-logic change updates both CLI and adapter together.
 *
 * Nexus integration:
 *   nexus signal-guides           Pretty-printed coverage report
 *   nexus signal-guides --json    Machine-readable report
 */
module.exports = function createSignalGuidesAdapter({ name, dataPath, projectRoot }) {

    // Validator lives next to other EduScan tools. Resolve relative to
    // the project root so the adapter works regardless of where Nexus
    // is invoked from.
    const validatorPath = path.join(projectRoot, '_tools/eduscan/signal-guides-coverage-audit.js');
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
        return report.findings.map(f => ({
            id: f.code.replace('.', '_') + '_' + f.section + '_' + f.projectId,
            code: f.code,
            severity: f.severity,
            category: 'signal',
            source: 'signal-guides',
            file: f.file || ('_app/signal/sections/' + f.section + '/guides.js'),
            message: f.message,
            fix: f.code === 'XREF-003.A'
                ? `Add a guide entry for ${f.projectId} in _app/signal/sections/${f.section}/guides.js, OR remove the project from SignalData.js if it should not be public.`
                : f.code === 'XREF-003.B'
                ? `Remove the orphan guide entry for ${f.projectId} from _app/signal/sections/${f.section}/guides.js, OR declare the project in SignalData.js sections[].projects[].`
                : `Expand the guide entry for ${f.projectId} with wiringSvg / steps / troubleshooting, OR keep as-is if intentionally minimal.`,
            metadata: {
                section: f.section,
                projectId: f.projectId,
            }
        }));
    }

    function getStatus() {
        const report = runReport();
        if (!report) {
            return { available: false, reason: 'validator failed to run' };
        }
        if (!report.selfValidationPassed) {
            return { available: false, reason: 'validator self-validation FAILED — parser broken' };
        }
        const t = report.totals;
        return {
            available: true,
            name: 'Signal-Guides Coverage (XREF-003)',
            issueCount: t.missingGuideCount + t.deadGuideCount + t.thinGuideCount,
            bySeverity: {
                critical: 0,
                high: t.missingGuideCount,
                medium: t.deadGuideCount,
                low: t.thinGuideCount,
                info: 0,
            },
            projectsTotal: t.totalProjects,
            sectionsScanned: t.sectionsScanned,
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
                console.log(`${C.bold}SIGNAL-GUIDES COVERAGE (XREF-003)${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                console.log(`  Sections scanned:          ${t.sectionsScanned}`);
                console.log(`  Sections with guides.js:   ${t.sectionsWithGuides}`);
                console.log(`  Total projects declared:   ${t.totalProjects}`);
                console.log(`  ${C.red}MISSING_GUIDE (high):${C.reset}      ${t.missingGuideCount}`);
                console.log(`  ${C.yellow}DEAD_GUIDE (medium):${C.reset}       ${t.deadGuideCount}`);
                console.log(`  ${C.dim}THIN_GUIDE (low):${C.reset}          ${t.thinGuideCount}`);
                console.log(`  Self-validation:           ${report.selfValidationPassed ? C.green + 'PASS' : C.red + 'FAIL'}${C.reset}`);

                const findings = report.findings || [];
                if (findings.length === 0) {
                    console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);
                    console.log(`  ${C.green}Coverage clean.${C.reset} Every declared project has a guide entry; every guide entry maps to a project.`);
                    console.log('');
                    return report;
                }

                console.log('');
                console.log(`  ${C.bold}Findings:${C.reset}`);
                findings.slice(0, 20).forEach(f => {
                    const tag =
                        f.code === 'XREF-003.A' ? `${C.red}[MISSING]${C.reset}` :
                        f.code === 'XREF-003.B' ? `${C.yellow}[DEAD]${C.reset}` :
                                                  `${C.dim}[THIN]${C.reset}`;
                    console.log(`    ${tag} ${f.section} / ${f.projectId}`);
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
