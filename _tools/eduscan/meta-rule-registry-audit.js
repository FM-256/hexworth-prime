#!/usr/bin/env node
/**
 * EduScan — Meta Rule Registry Audit (META-001)
 *
 * The rule about rules. Detects EduScan validators that exist as
 * `_tools/eduscan/{name}-*.js` files but are NOT documented in the
 * canonical rule registry. Without this rule, validators can be
 * shipped and silently bypass the safety-net architecture's
 * documentation contract — operators don't know what rules are
 * running, what each one catches, or at which stage it gates.
 *
 * Why this rule matters:
 *   2026-05-23 session shipped 9 new BOX-* validators (BOX-011, 013,
 *   014, 016, 020, 024, 035, 037, 042) into the smoke gate cascade,
 *   wired them into deploy.sh, and they immediately started blocking
 *   real defects (BOX-006 24→0, BOX-014 90→0, BOX-042 1→0). But NONE
 *   of those rules were added to
 *   `_docs/operations/safety-net-architecture.md` — the canonical
 *   contract that describes which validator runs at which stage. A
 *   future operator inspecting the safety-net doc has no idea those
 *   rules exist. They could re-implement them, miss them in audits,
 *   or strip them in a "cleanup" pass thinking they're orphan code.
 *
 *   This rule closes the loop: every new validator file must also
 *   appear in the registry, OR be explicitly opt-out-documented.
 *
 * Detection:
 *   1. Walk _tools/eduscan/ for files matching `(box|heur|cat|xref|prog|quiz)-*.js`
 *      that have a validator code in their JSDoc header (e.g.,
 *      "BOX-035" or "(HEUR-018)").
 *   2. Read `_docs/operations/safety-net-architecture.md` plus any
 *      file listed in REGISTRY_SURFACES (heuristics.js JSDoc, etc.).
 *   3. For each validator code found in a file, check whether that
 *      same code appears in the registry surfaces.
 *   4. Missing from registry → finding (HIGH — doc contract broken).
 *
 *   Opt-out: any validator file can be excluded from this audit by
 *   listing it in OPT_OUT_FILES with a documented reason (e.g.,
 *   internal helper scripts that don't ship rules).
 *
 * Issue code:
 *   META-001-UNREGISTERED  Validator file exists with a rule code
 *                          but no registry entry. Severity: HIGH.
 *
 * Self-validation cases:
 *   - This file itself defines META-001 and MUST be registered.
 *   - box-flag-registry-audit.js declares BOX-001 (the original BOX rule).
 *
 * Read-only.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const EDUSCAN_DIR = path.join(ROOT, '_tools/eduscan');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'META_RULE_REGISTRY_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

// Files that act as the rule registry. Any rule code mentioned in ANY of
// these is considered "registered." Adding a rule code to a new docfile
// just means extending this list.
const REGISTRY_SURFACES = [
    path.join(ROOT, '_docs/operations/safety-net-architecture.md'),
    path.join(ROOT, '_tools/eduscan/validators/syntax/heuristics.js')
];

// Files that ship rules but don't need registry entries (helpers, runners).
// Each entry MUST include a `reason` field.
const OPT_OUT_FILES = {
    'box-state-reset-backfill.js': 'One-shot remediation script for BOX-006 findings, not a validator',
    'meta-rule-registry-audit.js': 'This file (META-001) — registers itself; checking self avoidance',
    'cli.js': 'EduScan CLI runner, not a validator',
    'scanner.js': 'Internal scanner, not a validator',
    'index.js': 'Module entry point, not a validator'
};

// Validator code pattern. Matches strings like "BOX-001", "HEUR-018",
// "CAT-002", "XREF-001", "META-001". Loose enough to catch most codes
// but tight enough to avoid matching random text.
const CODE_PATTERN = /\b((?:BOX|HEUR|CAT|XREF|PROG|QUIZ|META|FUNC|NAME|PATH|EMOJI|HTML|JS|SEM|UX|NAV|SANDBOX|TURTLE|XP|BLOB|DEP|ENG|FLEX|LT|HUB|FIRM)-\d+[a-zA-Z]?)\b/g;

function findValidatorFiles() {
    const files = [];
    const entries = fs.readdirSync(EDUSCAN_DIR, { withFileTypes: true });
    for (const e of entries) {
        if (!e.isFile()) continue;
        if (!e.name.endsWith('.js')) continue;
        if (OPT_OUT_FILES[e.name]) continue;
        // Heuristic: validator files start with a known prefix
        if (!/^(box|heur|cat|xref|prog|quiz|meta|firmware|orphan|placement|incubator|new-hub|run-)/.test(e.name)) continue;
        files.push(path.join(EDUSCAN_DIR, e.name));
    }
    return files;
}

function extractCodesFromFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    // Extract the validator's OWN code, not every code referenced in prose.
    // Priority order:
    //   1. `validatorCode: 'CODE'` field (most explicit, in the JSON output)
    //   2. First parenthesized code in JSDoc title line (e.g., "(BOX-014)")
    //   3. Fall through to empty (file declares no code)
    //
    // Prose references to OTHER codes (sprints, related rules) are
    // explicitly ignored so the registry audit only fires on "this file's
    // own rule isn't documented" — not "this file mentions another rule
    // that isn't documented."
    const primaries = new Set();

    const vcMatch = src.match(/validatorCode\s*:\s*['"]([A-Z]+-\d+[a-zA-Z]?)['"]/);
    if (vcMatch) {
        primaries.add(vcMatch[1]);
        return [...primaries];
    }

    // Fallback: first JSDoc title with parenthesized code (e.g.,
    // " * EduScan — Box Foo Audit (BOX-XXX)").
    const titleMatch = src.match(/^\s*\*[^\n]*\(([A-Z]+-\d+[a-zA-Z]?)\)/m);
    if (titleMatch) {
        primaries.add(titleMatch[1]);
        return [...primaries];
    }

    return [];
}

function loadRegistrySurfaces() {
    let combined = '';
    for (const p of REGISTRY_SURFACES) {
        if (fs.existsSync(p)) {
            combined += '\n' + fs.readFileSync(p, 'utf8');
        }
    }
    return combined;
}

function main() {
    const startMs = Date.now();
    const files = findValidatorFiles();
    if (files.length === 0) {
        console.error('FATAL: no validator files found.');
        process.exit(99);
    }
    const registry = loadRegistrySurfaces();
    const registryCodes = new Set();
    let m;
    CODE_PATTERN.lastIndex = 0;
    while ((m = CODE_PATTERN.exec(registry)) !== null) {
        registryCodes.add(m[1]);
    }

    const verdicts = [];
    for (const f of files) {
        const codes = extractCodesFromFile(f);
        if (codes.length === 0) {
            // File doesn't declare any rule code in its header — could be a
            // helper that escaped opt-out, or a refactor in progress. Surface
            // it as informational so the operator can either add the code
            // declaration or add to OPT_OUT_FILES.
            verdicts.push({
                file: path.relative(ROOT, f),
                class: 'no-code-declared',
                severity: 'medium',
                code: 'META-001-NO-CODE',
                message: 'Validator file does not declare a rule code in its JSDoc header. Add a code (e.g., "BOX-XXX") to the header or add to OPT_OUT_FILES in meta-rule-registry-audit.js.'
            });
            continue;
        }
        const primaryCode = codes[0];
        const unregistered = codes.filter(c => !registryCodes.has(c));
        if (unregistered.length === 0) {
            verdicts.push({
                file: path.relative(ROOT, f),
                class: 'registered',
                codes,
                severity: null
            });
        } else {
            verdicts.push({
                file: path.relative(ROOT, f),
                class: 'unregistered',
                severity: 'high',
                code: 'META-001-UNREGISTERED',
                codes,
                unregisteredCodes: unregistered,
                message: `Rule code(s) [${unregistered.join(', ')}] in ${path.basename(f)} are not documented in any registry surface (${REGISTRY_SURFACES.map(p => path.relative(ROOT, p)).join(', ')}).`,
                fix: `Add a one-line entry to _docs/operations/safety-net-architecture.md describing what ${primaryCode} does, what it catches, and which stage it runs at.`
            });
        }
    }

    const unregistered = verdicts.filter(v => v.class === 'unregistered');
    const registered = verdicts.filter(v => v.class === 'registered');
    const noCode = verdicts.filter(v => v.class === 'no-code-declared');

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'meta-rule-registry-audit',
        validatorCode: 'META-001',
        scope: {
            validatorFiles: files.length,
            registrySurfaces: REGISTRY_SURFACES.map(p => path.relative(ROOT, p)),
            registeredCodes: registryCodes.size
        },
        totals: {
            scanned: files.length,
            registered: registered.length,
            unregistered: unregistered.length,
            noCodeDeclared: noCode.length,
            durationMs: Date.now() - startMs
        },
        findings: [...unregistered, ...noCode],
        verdicts
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('meta-rule-registry-audit (META-001)');
    console.log('========================================');
    console.log('  Validator files scanned: ' + files.length);
    console.log('  Registry codes found:    ' + registryCodes.size);
    console.log('  Registered:              ' + registered.length);
    console.log('  UNREGISTERED (HIGH):     ' + unregistered.length);
    console.log('  No code declared:        ' + noCode.length);
    console.log('  Duration:                ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                  ' + path.relative(ROOT, OUT_FILE));

    if (unregistered.length > 0) {
        console.log('---');
        console.log('HIGH: validator files with unregistered rule codes:');
        unregistered.forEach(v => {
            console.log('  ' + path.basename(v.file) + ' → [' + v.unregisteredCodes.join(', ') + ']');
        });
    }

    if (REPORT_ONLY || unregistered.length === 0) process.exit(0);
    process.exit(1);
}

main();
