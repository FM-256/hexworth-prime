#!/usr/bin/env node
/**
 * EduScan — Box Walkthrough/Registry Flag Drift Audit (BOX-002c)
 *
 * For each box that is BOTH (a) seeded in functions/box_flags.json AND
 * (b) has a walkthrough with a Flag Manifest table, verify that the
 * scenarioId→flag-value mappings agree across the two sources.
 *
 * Why this rule matters:
 *   The PIS-FINAL marathon (2026-05-22) discovered a class of drift bug:
 *   the Class C processor's token-overlap mapping algorithm produced
 *   wrong scenarioId→flag-value pairings for 27 of 30 config-embedded
 *   dispatch boxes. Walkthrough Flag Manifests claimed one mapping,
 *   box_flags.json had another, and the live terminal output displayed
 *   yet a third. Students submitted what terminal showed → server expected
 *   different value → rejection. Three sources, three disagreements.
 *
 *   This rule catches drift between two of the three sources (walkthrough
 *   and box_flags.json). Terminal-output drift requires runtime inspection
 *   and is a future rule. For now, walkthrough is treated as the
 *   instructor-facing source of truth; box_flags.json is treated as the
 *   server-authoritative source. They MUST agree.
 *
 * Issue codes:
 *   BOX-002c-DRIFT-SCENARIO       Walkthrough names a scenarioId that
 *                                 box_flags.json does not seed (or vice versa).
 *   BOX-002c-DRIFT-VALUE          Both sources have the scenarioId but the
 *                                 flag values disagree (after case-insensitive
 *                                 normalization per validateFlag CF).
 *   BOX-002c-NO-MANIFEST          Walkthrough exists but has no parseable
 *                                 Flag Manifest table — drift detection
 *                                 cannot run. Severity: low (informational).
 *
 * Detection logic per box:
 *   1. From BOX-002a's report: skip boxes without walkthroughs.
 *   2. Load walkthrough .md (fall back to .md sibling if BOX-002a matched .docx).
 *   3. Parse Flag Manifest section — look for HEXWORTH FLAG MANIFEST marker,
 *      then extract the per-scenario table rows: | `<sid>` | `<flag_val>` |.
 *      Fallback: also accept the alternate-format table with three columns:
 *      | <flag_id> | <points> | `<flag_val>` |.
 *   4. Look up box in functions/box_flags.json. Get flags dict.
 *   5. Compare:
 *      - Scenarios in walkthrough not in seed → DRIFT-SCENARIO finding
 *      - Scenarios in seed not in walkthrough → DRIFT-SCENARIO finding (other direction)
 *      - Both sides have same scenarioId but different values → DRIFT-VALUE
 *
 * Comparison uses .trim().toLowerCase() to mirror validateFlag CF
 * normalization. This avoids false positives on case differences that
 * are functionally equivalent at submission time.
 *
 * Scope:
 *   INPUT:   _tools/reports/BOX_WALKTHROUGH_AUDIT.json (has-walkthrough verdicts)
 *            functions/box_flags.json
 *            Walkthrough .md content (read at scan time)
 *   SCANNED: ${HEXWORTH_SOLUTIONS_DIR || ~/hexworth-shared/Solutions}/
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/box-walkthrough-flag-drift.js [--report-only]
 *
 * Output:
 *   _tools/reports/BOX_WALKTHROUGH_FLAG_DRIFT.json
 *   stdout summary
 *
 * Exit codes:
 *   0 if no findings (or --report-only)
 *   1 if any DRIFT-SCENARIO or DRIFT-VALUE findings
 *   2 if self-validation fails
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const WALKTHROUGH_REPORT = path.join(REPORTS_DIR, 'BOX_WALKTHROUGH_AUDIT.json');
const BOX_FLAGS = path.join(ROOT, 'functions/box_flags.json');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_WALKTHROUGH_FLAG_DRIFT.json');

const SOLUTIONS_DIR = process.env.HEXWORTH_SOLUTIONS_DIR
    || path.join(os.homedir(), 'hexworth-shared', 'Solutions');

const REPORT_ONLY = process.argv.includes('--report-only');

// Flag Manifest table parsing patterns:
// Pattern 1 (Hexworth Flag Manifest format): | `<scenarioId>` | `<flag_value>` |
const MANIFEST_ROW_2COL = /^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/gm;
// Pattern 2 (Solution-doc format used by PR001/Class A): | <flag_id> | <points> | `<flag_value>` |
const SOLUTION_ROW_3COL = /^\|\s*(\w+)\s*\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/gm;

// Self-validation: these boxes should produce no DRIFT findings as of 2026-05-22.
// pis-final-patient-zero: walkthrough Flag Values table maps each flag to its
//   exact value; box_flags.json has the same values keyed by flag1..flag7.
// nt1-network-troubleshoot: original PR001-style box, walkthrough has Flag
//   Manifest section, box_flags.json mirrors.
// a1-ancient-ledger: CTF Arena box, .docx walkthrough — drift detection
//   skipped (handled as NO-MANIFEST).
// vpn001-tunnel-down: post-marathon corrected mapping, manifest rewritten
//   to match box_flags.json.
const SELF_VALIDATION = {
    'pis-final-patient-zero':   { expectClean: true },
    'nt1-network-troubleshoot': { expectClean: true },
    'vpn001-tunnel-down':       { expectClean: true }
};

function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function normalize(s) { return s == null ? '' : String(s).trim().toLowerCase(); }

function loadWalkthroughContent(wtRelative) {
    if (!wtRelative) return null;
    let p = path.join(SOLUTIONS_DIR, wtRelative);
    if (!fs.existsSync(p)) return null;
    if (!/\.(md|txt)$/i.test(p)) {
        // Try .md sibling
        const mdSibling = p.replace(/\.[^./]+$/, '.md');
        if (fs.existsSync(mdSibling)) p = mdSibling;
        else return null;
    }
    try { return fs.readFileSync(p, 'utf8'); }
    catch (e) { return null; }
}

/**
 * Parse Flag Manifest table from walkthrough.
 *
 * GATED PARSER: only parses tables that appear inside an explicit Flag
 * Values / Flag Manifest scope. This prevents false positives from
 * unrelated tables (hint tables, attack-chain tables, Common Mistakes
 * tables with backticked filenames, etc.).
 *
 * Recognized scope markers (any of these starts an in-scope region;
 * region ends at next ## heading or --- divider):
 *   - `<!-- HEXWORTH FLAG MANIFEST -->` (Hexworth manifest convention)
 *   - `## Flag Values` heading
 *   - `## Flag Manifest` heading
 *   - `## Solution Flag Values` heading (PIS-FINAL solution doc)
 *
 * Inside the scope, recognized row formats:
 *   - 2-col Hexworth: | `<sid>` | `<flag_value>` |
 *   - 3-col solution doc: | <flag_id> | <points> | `<flag_value>` |
 *   - 6-col PR001 style: | <scenario_name> | ... | `<flag_value>` |
 *     (extracts last-column backticked value, paired with first-column key)
 *
 * Returns { sid: flagValue, ... } or null if no parseable in-scope table.
 */
function parseManifest(content) {
    // 1. Find every Flag-section scope start.
    // Allow optional numeric "N." or "N)" prefix in heading (PIS-FINAL uses "## 7. Solution Flag Values").
    const scopeStartRe = /(?:<!--\s*HEXWORTH FLAG MANIFEST\s*-->|^##\s+(?:\d+\.?\s+)?(?:Flag (?:Values|Manifest)|Solution Flag Values))/gim;
    const sections = [];
    let m;
    while ((m = scopeStartRe.exec(content)) !== null) {
        const start = m.index;
        // End: next ## heading OR --- divider (line of dashes) — whichever comes first
        const rest = content.substring(m.index + m[0].length);
        const endMatch = rest.match(/\n##\s|\n---\n/);
        const end = endMatch ? m.index + m[0].length + endMatch.index : content.length;
        sections.push(content.substring(start, end));
    }
    if (sections.length === 0) return null;

    const result = {};
    for (const section of sections) {
        // 2-col format: | `<sid>` | `<val>` |
        const re2 = /^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|/gm;
        while ((m = re2.exec(section)) !== null) {
            const sid = m[1].trim();
            const val = m[2].trim();
            if (/^scenario\s*id$/i.test(sid) || /^flag/i.test(sid)) continue;
            result[sid] = val;
        }

        // 3-col format: | id | points | `value` |
        const re3 = /^\|\s*(\w[\w-]*)\s*\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/gm;
        while ((m = re3.exec(section)) !== null) {
            const fid = m[1].trim();
            const val = m[2].trim();
            if (/^id$/i.test(fid)) continue;
            if (!result[fid]) result[fid] = val;  // don't overwrite a 2-col match
        }

        // 6+ col format (PR001 style): | <name> | ... | `<value>` |
        // Match any row that contains at least one backticked value cell at the END,
        // capture the FIRST cell as the scenario key
        const re6 = /^\|\s*([^|`]+?)\s*\|.*?\|\s*`([^`]+)`\s*\|\s*$/gm;
        while ((m = re6.exec(section)) !== null) {
            const fid = m[1].trim();
            const val = m[2].trim();
            // Skip header rows
            if (/^scenario$/i.test(fid) || /^flag/i.test(fid) || /^-+$/.test(fid)) continue;
            // Skip rows where the first cell looks like a divider
            if (/^[-]+$/.test(fid)) continue;
            // Don't overwrite earlier matches
            if (!result[fid]) result[fid] = val;
        }
    }

    return Object.keys(result).length === 0 ? null : result;
}

function main() {
    const startMs = Date.now();

    if (!fs.existsSync(WALKTHROUGH_REPORT)) {
        console.error('FATAL: BOX-002a report not found. Run box-walkthrough-audit.js first.');
        process.exit(99);
    }
    if (!fs.existsSync(BOX_FLAGS)) {
        console.error('FATAL: functions/box_flags.json not found.');
        process.exit(99);
    }

    const wtReport = readJSON(WALKTHROUGH_REPORT);
    const registry = readJSON(BOX_FLAGS);

    const candidates = wtReport.verdicts.filter(v => v.class === 'has-walkthrough');
    if (candidates.length === 0) {
        console.error('FATAL: no boxes with walkthroughs found.');
        process.exit(99);
    }

    const verdicts = [];
    for (const v of candidates) {
        const seed = registry[v.boxName];
        if (!seed) {
            // Box has walkthrough but no seed entry (auto-award subtype or not seeded).
            // Not BOX-002c's concern — BOX-001 handles seed coverage.
            verdicts.push({
                boxName: v.boxName,
                walkthrough: v.walkthrough,
                class: 'not-seeded',
                severity: null
            });
            continue;
        }
        const seedFlags = seed.flags || {};
        const content = loadWalkthroughContent(v.walkthrough);
        if (!content) {
            verdicts.push({
                boxName: v.boxName,
                walkthrough: v.walkthrough,
                class: 'walkthrough-unreadable',
                severity: 'low',
                code: 'BOX-002c-NO-MANIFEST',
                message: `Walkthrough not readable (likely .docx without .md sibling). Drift detection skipped.`
            });
            continue;
        }
        const manifest = parseManifest(content);
        if (manifest === null) {
            verdicts.push({
                boxName: v.boxName,
                walkthrough: v.walkthrough,
                class: 'no-manifest',
                severity: 'low',
                code: 'BOX-002c-NO-MANIFEST',
                message: `Walkthrough exists but no parseable Flag Manifest table found. Drift detection cannot run for this box.`
            });
            continue;
        }

        // Compare
        const seedKeys = new Set(Object.keys(seedFlags));
        const manifestKeys = new Set(Object.keys(manifest));
        const findings = [];

        // Scenarios in manifest not in seed
        for (const sid of manifestKeys) {
            if (!seedKeys.has(sid)) {
                findings.push({
                    type: 'walkthrough-only',
                    scenarioId: sid,
                    walkthroughValue: manifest[sid]
                });
            }
        }
        // Scenarios in seed not in manifest
        for (const sid of seedKeys) {
            if (!manifestKeys.has(sid)) {
                findings.push({
                    type: 'seed-only',
                    scenarioId: sid,
                    seedValue: seedFlags[sid]
                });
            }
        }
        // Common scenarios — compare values
        for (const sid of manifestKeys) {
            if (!seedKeys.has(sid)) continue;
            if (normalize(manifest[sid]) !== normalize(seedFlags[sid])) {
                findings.push({
                    type: 'value-mismatch',
                    scenarioId: sid,
                    walkthroughValue: manifest[sid],
                    seedValue: seedFlags[sid]
                });
            }
        }

        if (findings.length === 0) {
            verdicts.push({
                boxName: v.boxName,
                walkthrough: v.walkthrough,
                class: 'agrees',
                severity: null,
                scenarioCount: seedKeys.size
            });
        } else {
            const hasMismatch = findings.some(f => f.type === 'value-mismatch');
            const hasMissing = findings.some(f => f.type !== 'value-mismatch');
            verdicts.push({
                boxName: v.boxName,
                walkthrough: v.walkthrough,
                class: 'drift',
                severity: 'critical',
                code: hasMismatch && hasMissing
                    ? 'BOX-002c-DRIFT-BOTH'
                    : hasMismatch
                        ? 'BOX-002c-DRIFT-VALUE'
                        : 'BOX-002c-DRIFT-SCENARIO',
                message: `Walkthrough and box_flags.json disagree on ${findings.length} item(s) for this box.`,
                driftDetails: findings
            });
        }
    }

    // Self-validation
    const selfFailures = [];
    for (const [box, exp] of Object.entries(SELF_VALIDATION)) {
        const v = verdicts.find(x => x.boxName === box);
        if (!v) {
            selfFailures.push({ box, reason: 'not in BOX-002a report' });
            continue;
        }
        if (exp.expectClean) {
            if (v.class === 'drift') {
                selfFailures.push({
                    box, reason: 'expected clean, got drift',
                    drift: v.driftDetails
                });
            }
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE:');
        for (const f of selfFailures) console.error('  ' + JSON.stringify(f));
        console.error('Refusing to write report.');
        process.exit(2);
    }

    const drift = verdicts.filter(v => v.class === 'drift');
    const noManifest = verdicts.filter(v => v.class === 'no-manifest' || v.class === 'walkthrough-unreadable');
    const agrees = verdicts.filter(v => v.class === 'agrees');
    const notSeeded = verdicts.filter(v => v.class === 'not-seeded');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-walkthrough-flag-drift',
        validatorCode: 'BOX-002c',
        scope: {
            input: 'BOX_WALKTHROUGH_AUDIT.json + functions/box_flags.json',
            comparison: 'walkthrough Flag Manifest table vs box_flags.json[boxId].flags'
        },
        totals: {
            boxesAudited: candidates.length,
            agrees: agrees.length,
            drift: drift.length,
            noManifest: noManifest.length,
            notSeeded: notSeeded.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: { cases: Object.keys(SELF_VALIDATION).length, failures: 0, verdict: 'PASS' },
        findings: verdicts.filter(v => v.severity === 'critical'),
        infos: verdicts.filter(v => v.severity === 'low'),
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('box-walkthrough-flag-drift (BOX-002c)');
    console.log('======================================');
    console.log('  Boxes audited:           ' + candidates.length);
    console.log('  AGREES (clean):          ' + agrees.length);
    console.log('  DRIFT (critical):        ' + drift.length);
    console.log('  No-manifest (info):      ' + noManifest.length);
    console.log('  Not seeded (skipped):    ' + notSeeded.length);
    console.log('  Self-validation:         PASS (' + Object.keys(SELF_VALIDATION).length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (drift.length > 0) {
        console.log('---');
        console.log('DRIFT findings (walkthrough ↔ box_flags disagree):');
        drift.slice(0, 10).forEach(v => {
            console.log('  ' + v.boxName + ' (' + v.code + '): ' + v.driftDetails.length + ' item(s)');
            v.driftDetails.slice(0, 3).forEach(d => {
                if (d.type === 'value-mismatch') {
                    console.log(`    ${d.scenarioId}: wt="${d.walkthroughValue}" seed="${d.seedValue}"`);
                } else {
                    console.log(`    ${d.type}: ${d.scenarioId}`);
                }
            });
        });
        if (drift.length > 10) console.log('  ... and ' + (drift.length - 10) + ' more (see JSON report)');
    }

    if (REPORT_ONLY || drift.length === 0) process.exit(0);
    process.exit(1);
}

main();
