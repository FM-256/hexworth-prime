#!/usr/bin/env node
/**
 * EduScan — Box Walkthrough Audit (BOX-002a)
 *
 * For every BoxEngine-driven box (any directory with index.html invoking
 * BoxEngine.init), verify that a corresponding walkthrough document
 * exists in the operator's Solutions tree.
 *
 * This rule does NOT check content. It checks existence only. Content
 * checks (does walkthrough document flag values per scenario, do those
 * values match box_flags.json, etc.) are downstream rules (BOX-002b,
 * BOX-002c) layered on top of this one.
 *
 * Why this rule matters:
 *   On 2026-05-21, while preparing PIS-FINAL for deploy, the operator
 *   asked "are flags placed in the serverside database and is the bridge
 *   activated?" Investigation surfaced that 90 dispatch boxes are
 *   deployed-on-disk but never seeded. Deeper investigation surfaced
 *   that those 90 boxes also have walkthroughs that document scenarios
 *   but DO NOT document flag values. The bug class is "incomplete
 *   content shipped to production." BOX-001 caught the seed gap; this
 *   rule (BOX-002a) catches the upstream walkthrough-existence gap.
 *
 *   A box without a walkthrough is unteachable: students hit a scenario
 *   with no instructor reference, no canonical solution, no source of
 *   truth for what the flag should even be.
 *
 * Issue codes:
 *   BOX-002a-MISSING-WALKTHROUGH    No walkthrough .md or .docx found
 *                                   in the expected Solutions directory
 *                                   for the box's house.
 *   BOX-002a-UNKNOWN-HOUSE          Box config exists at a path the
 *                                   validator cannot map to a Solutions
 *                                   directory. Path mapping table needs
 *                                   to be extended.
 *
 * Scope:
 *   INPUT:   _app/**\/{index.html,config.js} where BoxEngine.init is invoked
 *   SCANNED: ${HEXWORTH_SOLUTIONS_DIR || ~/hexworth-shared/Solutions}/
 *            for matching walkthrough files
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/box-walkthrough-audit.js
 *   HEXWORTH_SOLUTIONS_DIR=/path/to/Solutions node _tools/eduscan/box-walkthrough-audit.js
 *
 * Output:
 *   _tools/reports/BOX_WALKTHROUGH_AUDIT.json  — per-box verdicts
 *   stdout                                       — summary + findings
 *
 * Exit codes:
 *   0 if no MISSING findings (or --report-only)
 *   1 if any MISSING findings (deploy-gate signal)
 *   2 if self-validation fails (regex/scope broken — refuse to publish)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '../..');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'BOX_WALKTHROUGH_AUDIT.json');

const SOLUTIONS_DIR = process.env.HEXWORTH_SOLUTIONS_DIR
    || path.join(os.homedir(), 'hexworth-shared', 'Solutions');

const REPORT_ONLY = process.argv.includes('--report-only');

// House mapping — box config path prefix → Solutions house directory name
// AND the box-ID extraction regex for that house. The ID is the leading
// portion of the box directory name that identifies the box uniquely
// (e.g., 'nt003', 'pis-l01'). The walkthrough filename in Solutions/
// starts with this ID but may have additional title words that don't
// appear in the box directory name (e.g., box 'vpn001-tunnel-down' has
// walkthrough 'VPN001-VPN-Tunnel-Down_WALKTHROUGH.md' — note the extra
// 'VPN' in the title that the box name doesn't have).
//
// idPattern: regex that captures the ID prefix from the box's directory
//   name. Used to derive the case-insensitive prefix to search for in
//   the Solutions house directory.
// New houses can be added without code changes elsewhere; if a box's
// path doesn't match any mapping, the validator emits BOX-002a-UNKNOWN-HOUSE.
const HOUSE_MAP = [
    { appPrefix: '_app/dispatch/boxes/',                             solutionsDir: 'Dispatch',                          idPattern: /^([a-z]+\d+)/ },
    { appPrefix: '_app/arena/boxes/',                                solutionsDir: 'CTF',                               idPattern: /^([a-z]+-?\d+)/ },
    { appPrefix: '_app/houses/shield/infosec/labs/',                 solutionsDir: 'Principles of Iformation Security', idPattern: /^(pis-[a-z0-9]+)/ },
    { appPrefix: '_app/houses/shield/security-plus/labs/',           solutionsDir: 'Security+',                         idPattern: /^(shield-sp-blueteam-[a-z0-9-]+)/ },
    { appPrefix: '_app/houses/shield/cyber-framework/labs/',         solutionsDir: 'Shield-FW',                         idPattern: /^([a-z]+-[a-z0-9]+)/ },
    { appPrefix: '_app/houses/matrix/adv-linux/labs/',               solutionsDir: 'Advanced Linux Administration',    idPattern: /^(ala-[a-z0-9]+)/ },
    { appPrefix: '_app/houses/divergent/cybersecurity-ethics/labs/', solutionsDir: 'Ethics in IT',                      idPattern: /^([a-z]+-[a-z0-9]+)/ },
    { appPrefix: '_app/houses/code/python-for-it/labs/',             solutionsDir: 'Python for IT',                     idPattern: /^([a-z0-9]+-[a-z0-9]+)/ },
    { appPrefix: '_app/houses/code/web-security-arts/labs/',         solutionsDir: 'WSA',                               idPattern: /^([a-z]+-[a-z0-9]+)/ },
    { appPrefix: '_app/houses/forge/clh/labs/',                      solutionsDir: 'CLH',                               idPattern: /^(clh-\d+)/ },
    { appPrefix: '_app/houses/forge/md-100/labs/',                   solutionsDir: 'MD-100',                            idPattern: /^([a-z]\d+)/ }
];

// Walkthrough filename suffixes the validator accepts as valid.
// Matched case-insensitively against files in the Solutions house dir.
// MD is canonical; DOCX/PDF accepted as evidence of intent even though
// they are not directly machine-checkable for content (handled in BOX-002b).
const WALKTHROUGH_SUFFIXES = [
    '_walkthrough.md', '_walkthrough.docx',
    '-solution.md',    '-solution.docx', '-solution.pdf',
    '_answers.md'      // MD-100 / Shield-FW convention
];

// Self-validation: these 4 boxes are KNOWN to have walkthroughs at the
// time this validator is built. If the validator fails to find them,
// the discovery logic is wrong and the report MUST NOT be published.
const KNOWN_HAS_WALKTHROUGH = [
    'nt003-slow-connection',     // Dispatch — NT003-Slow-Connection_WALKTHROUGH.md (verified 2026-05-22)
    'pis-final-patient-zero',    // PIS      — PIS-FINAL-Patient-Zero-SOLUTION.md   (verified 2026-05-22)
    'a1-ancient-ledger',         // CTF      — A1-Ancient-Ledger_WALKTHROUGH.md     (verified 2026-05-22)
    'pis-m2-vault-breach'        // PIS      — PIS-M2-Vault-Breach-SOLUTION.md      (verified 2026-05-22)
];

// ─── Helpers ────────────────────────────────────────────────────────────

function findBoxConfigs(root) {
    const out = [];
    const stack = [root];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); }
        catch (e) { continue; }

        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            if (e.isDirectory()) stack.push(path.join(d, e.name));
        }

        const fileNames = entries.filter(e => e.isFile()).map(e => e.name);
        if (fileNames.includes('index.html') && fileNames.includes('config.js')) {
            const indexFile = path.join(d, 'index.html');
            try {
                const idxContent = fs.readFileSync(indexFile, 'utf8');
                if (/BoxEngine\.init/.test(idxContent)) {
                    out.push({
                        dir: d,
                        relDir: path.relative(ROOT, d) + path.sep,  // trailing sep for prefix match
                        boxName: path.basename(d),
                        indexFile,
                        configFile: path.join(d, 'config.js')
                    });
                }
            } catch (e) { /* skip unreadable */ }
        }
    }
    return out;
}

/** Find the house mapping for a given config path. */
function mapToHouse(relDir) {
    // Normalize to forward slashes for cross-platform matching.
    const norm = relDir.split(path.sep).join('/');
    for (const m of HOUSE_MAP) {
        if (norm.startsWith(m.appPrefix)) return m;
    }
    return null;
}

/**
 * Search Solutions/{houseDir}/ for a walkthrough file matching the box ID.
 *
 * Match logic:
 *   1. Extract the ID prefix from boxName via the house's idPattern regex.
 *      (e.g., 'vpn001-tunnel-down' -> 'vpn001'; 'pis-l01-specimen-classification' -> 'pis-l01')
 *   2. Case-insensitive search for files starting with `<id>-` (ID prefix + hyphen).
 *      The trailing hyphen prevents `vpn001-*` from matching `vpn0011-*`.
 *   3. File must end with an accepted walkthrough suffix.
 *
 * Returns the absolute path of the first matching walkthrough, or null.
 * If the boxName doesn't match the house's idPattern, returns null with
 * an explicit error code so the caller can flag it.
 */
function findWalkthrough(boxName, house) {
    const idMatch = boxName.match(house.idPattern);
    if (!idMatch) {
        return { matched: null, dirReadError: null, idExtractFailed: true };
    }
    const id = idMatch[1].toLowerCase();

    const dir = path.join(SOLUTIONS_DIR, house.solutionsDir);
    let entries;
    try { entries = fs.readdirSync(dir); }
    catch (e) { return { matched: null, dirReadError: e.code, idExtractFailed: false }; }

    for (const name of entries) {
        const lc = name.toLowerCase();
        // Must start with ID prefix followed by hyphen or underscore (CLH uses underscore)
        if (!lc.startsWith(id + '-') && !lc.startsWith(id + '_')) continue;
        // Must end with an accepted walkthrough suffix
        for (const suffix of WALKTHROUGH_SUFFIXES) {
            if (lc.endsWith(suffix)) {
                return { matched: path.join(dir, name), dirReadError: null, idExtractFailed: false, idUsed: id };
            }
        }
    }
    return { matched: null, dirReadError: null, idExtractFailed: false, idUsed: id };
}

// ─── Main ───────────────────────────────────────────────────────────────

function main() {
    const startMs = Date.now();

    // Sanity check Solutions dir exists
    if (!fs.existsSync(SOLUTIONS_DIR)) {
        console.error('FATAL: Solutions directory does not exist at: ' + SOLUTIONS_DIR);
        console.error('Set HEXWORTH_SOLUTIONS_DIR or ensure ~/hexworth-shared/Solutions/ exists.');
        process.exit(99);
    }

    const boxes = findBoxConfigs(APP_DIR);
    if (boxes.length === 0) {
        console.error('FATAL: no BoxEngine configs found under _app/. Refusing to proceed.');
        process.exit(99);
    }

    const verdicts = [];
    for (const box of boxes) {
        const house = mapToHouse(box.relDir);
        if (!house) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'unknown-house',
                severity: 'medium',
                code: 'BOX-002a-UNKNOWN-HOUSE',
                message: `Box config exists at unmapped path '${box.relDir}'. House mapping table needs to be extended.`,
                fix: 'Add an entry to HOUSE_MAP in box-walkthrough-audit.js mapping this config path prefix to its Solutions/{house}/ directory.'
            });
            continue;
        }

        const result = findWalkthrough(box.boxName, house);
        if (result.matched) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'has-walkthrough',
                house: house.solutionsDir,
                idUsed: result.idUsed,
                walkthrough: path.relative(SOLUTIONS_DIR, result.matched),
                severity: null
            });
        } else if (result.idExtractFailed) {
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'id-extract-failed',
                house: house.solutionsDir,
                severity: 'medium',
                code: 'BOX-002a-ID-EXTRACT-FAILED',
                message: `Box name '${box.boxName}' does not match the house's ID pattern (${house.idPattern}). Validator cannot derive a walkthrough search prefix.`,
                fix: `Either rename the box directory to match the house convention, or extend HOUSE_MAP idPattern to accept this naming style.`
            });
        } else {
            const reason = result.dirReadError
                ? `cannot read Solutions/${house.solutionsDir}/ (${result.dirReadError})`
                : `no file matching '${result.idUsed}-*' with walkthrough suffix found in Solutions/${house.solutionsDir}/`;
            verdicts.push({
                boxName: box.boxName,
                relDir: box.relDir,
                class: 'missing-walkthrough',
                house: house.solutionsDir,
                idUsed: result.idUsed,
                severity: 'critical',
                code: 'BOX-002a-MISSING-WALKTHROUGH',
                message: `No walkthrough found for box '${box.boxName}' (ID prefix '${result.idUsed}') — ${reason}.`,
                fix: `Author a walkthrough at Solutions/${house.solutionsDir}/${(result.idUsed || box.boxName).toUpperCase()}-<KebabTitle>_WALKTHROUGH.md (or -SOLUTION.md depending on house convention). The walkthrough documents the scenario(s), the fix path, and the canonical flag value per scenario for the seed.`
            });
        }
    }

    // ─── Self-validation gate ──────────────────────────────────────────
    const selfFailures = [];
    for (const expected of KNOWN_HAS_WALKTHROUGH) {
        const v = verdicts.find(x => x.boxName === expected);
        if (!v) {
            selfFailures.push({ box: expected, reason: 'not discovered by walker' });
            continue;
        }
        if (v.class !== 'has-walkthrough') {
            selfFailures.push({
                box: expected,
                reason: 'expected has-walkthrough, got ' + v.class,
                relDir: v.relDir,
                message: v.message
            });
        }
    }
    if (selfFailures.length > 0) {
        console.error('SELF-VALIDATION FAILURE: validator could not find known walkthroughs.');
        for (const f of selfFailures) {
            console.error('  ' + f.box + ': ' + f.reason);
            if (f.message) console.error('    ' + f.message);
        }
        console.error('Refusing to write report. Investigate discovery logic.');
        process.exit(2);
    }

    // ─── Report ────────────────────────────────────────────────────────
    const missing = verdicts.filter(v => v.class === 'missing-walkthrough');
    const unknownHouse = verdicts.filter(v => v.class === 'unknown-house');
    const has = verdicts.filter(v => v.class === 'has-walkthrough');

    // Group missing by house for triage
    const missingByHouse = {};
    for (const v of missing) {
        if (!missingByHouse[v.house]) missingByHouse[v.house] = [];
        missingByHouse[v.house].push(v.boxName);
    }

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'box-walkthrough-audit',
        validatorCode: 'BOX-002a',
        solutionsDir: SOLUTIONS_DIR,
        scope: {
            input: '_app/**/{index.html,config.js} with BoxEngine.init',
            scanned: `${SOLUTIONS_DIR}/<house>/<box>-*{_WALKTHROUGH,-SOLUTION,_ANSWERS}.{md,docx,pdf}`,
            houseMap: HOUSE_MAP.length,
            walkthroughSuffixes: WALKTHROUGH_SUFFIXES
        },
        totals: {
            boxesScanned: boxes.length,
            hasWalkthrough: has.length,
            missingWalkthrough: missing.length,
            unknownHouse: unknownHouse.length,
            durationMs: Date.now() - startMs
        },
        selfValidation: {
            cases: KNOWN_HAS_WALKTHROUGH.length,
            failures: 0,
            verdict: 'PASS'
        },
        missingByHouse,
        findings: verdicts.filter(v => v.severity !== null),
        verdicts
    };

    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    // ─── Stdout summary ───────────────────────────────────────────────
    console.log('box-walkthrough-audit (BOX-002a)');
    console.log('================================');
    console.log('  Solutions dir:           ' + SOLUTIONS_DIR);
    console.log('  Boxes scanned:           ' + boxes.length);
    console.log('  Has walkthrough:         ' + has.length);
    console.log('  MISSING walkthrough:     ' + missing.length);
    console.log('  Unknown house:           ' + unknownHouse.length);
    console.log('  Self-validation:         PASS (' + KNOWN_HAS_WALKTHROUGH.length + ' test cases)');
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (missing.length > 0) {
        console.log('---');
        console.log('MISSING walkthroughs by house:');
        for (const [house, names] of Object.entries(missingByHouse)) {
            console.log('  ' + house + ': ' + names.length + ' boxes');
            for (const n of names.slice(0, 5)) console.log('    - ' + n);
            if (names.length > 5) console.log('    ... and ' + (names.length - 5) + ' more (see JSON report)');
        }
    }

    if (unknownHouse.length > 0) {
        console.log('---');
        console.log('Unknown-house boxes (HOUSE_MAP needs extending):');
        for (const v of unknownHouse.slice(0, 10)) {
            console.log('  ' + v.boxName + ' → ' + v.relDir);
        }
        if (unknownHouse.length > 10) console.log('  ... and ' + (unknownHouse.length - 10) + ' more');
    }

    if (REPORT_ONLY || missing.length === 0) {
        process.exit(0);
    }
    process.exit(1);
}

main();
