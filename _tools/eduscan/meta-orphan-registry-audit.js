#!/usr/bin/env node
/**
 * EduScan — Meta Orphan Registry Audit (META-002)
 *
 * The inverse of META-001. Detects rule codes that ARE documented in
 * the safety-net architecture or heuristics.js JSDoc but have NO
 * corresponding implementation file under `_tools/eduscan/`. Catches:
 *
 *   - Renamed validator file (old code still in doc)
 *   - Deleted validator (doc not cleaned up)
 *   - Aspirational doc entries (code planned but never implemented)
 *   - Copy-paste errors in the registry table
 *
 * Why this rule matters:
 *   META-001 (rule-about-rules) closes the "new file, no doc entry"
 *   direction. The opposite direction is just as toxic: an operator
 *   reads the doc, sees a rule listed (e.g., "BOX-099 catches X"),
 *   tries to find the implementation, and discovers it doesn't exist.
 *   The doc lies. Trust in the registry collapses. Without META-002,
 *   stale doc entries accumulate silently as validators are renamed
 *   or removed.
 *
 * Detection:
 *   1. Scan REGISTRY_SURFACES for every rule-code occurrence.
 *   2. Walk `_tools/eduscan/` (top level + validators/ subtree) and
 *      build a CODE → FILE map by:
 *        a. validatorCode: 'CODE' field
 *        b. JSDoc title parenthetical (CODE)
 *        c. Literal 'CODE' string anywhere in file body (catches
 *           multi-rule validators like heuristics.js which implements
 *           HEUR-001..030 via if/switch on code constants)
 *   3. For each registered code, check the map.
 *   4. Not implemented → finding (META-002-ORPHAN-DOC-ENTRY, HIGH).
 *
 *   Some codes in the doc are aspirational / planned. Suppressible
 *   via PLANNED_CODES map with a documented reason.
 *
 * Issue code:
 *   META-002-ORPHAN-DOC-ENTRY  Code documented but no implementation.
 *                              Severity: HIGH.
 *
 * Self-validation:
 *   - META-001 must be implemented (in meta-rule-registry-audit.js)
 *   - META-002 must be implemented (this file)
 *
 * Read-only.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const EDUSCAN_DIR = path.join(ROOT, '_tools/eduscan');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'META_ORPHAN_REGISTRY_AUDIT.json');

const REPORT_ONLY = process.argv.includes('--report-only');

const REGISTRY_SURFACES = [
    path.join(ROOT, '_docs/operations/safety-net-architecture.md'),
    path.join(ROOT, '_tools/eduscan/validators/syntax/heuristics.js')
];

// Codes intentionally documented before implementation. Each entry needs
// a `reason` and an `eta` so this list doesn't accumulate forever.
const PLANNED_CODES = {
    // Currently empty — populate when documenting roadmap items.
};

const CODE_PATTERN = /\b((?:BOX|HEUR|CAT|XREF|PROG|QUIZ|META|FUNC|NAME|PATH|EMOJI|HTML|JS|SEM|UX|NAV|SANDBOX|TURTLE|XP|BLOB|DEP|ENG|FLEX|LT|HUB|FIRM|LP|ASGN|CSP|PALETTE|TAG|REG|NAME)-\d+[a-zA-Z]?)\b/g;

function walkDir(dir, out = []) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
    for (const e of entries) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'cache') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walkDir(p, out);
        else if (e.name.endsWith('.js') && !e.name.includes('.bak')) out.push(p);
    }
    return out;
}

function buildCodeToFileMap() {
    const map = new Map();   // code → array of files implementing it
    const files = walkDir(EDUSCAN_DIR);
    for (const f of files) {
        let src;
        try { src = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
        const seen = new Set();
        // Strategy 1: validatorCode field
        const vcMatch = src.match(/validatorCode\s*:\s*['"]([A-Z]+-\d+[a-zA-Z]?)['"]/);
        if (vcMatch) seen.add(vcMatch[1]);
        // Strategy 2: parenthesized code in JSDoc title
        const titleMatch = src.match(/^\s*\*[^\n]*\(([A-Z]+-\d+[a-zA-Z]?)\)/m);
        if (titleMatch) seen.add(titleMatch[1]);
        // Strategy 3: any code referenced as a literal string (covers
        // multi-rule validators like heuristics.js which implements
        // HEUR-001..030 via case branches and string constants).
        CODE_PATTERN.lastIndex = 0;
        let m;
        while ((m = CODE_PATTERN.exec(src)) !== null) seen.add(m[1]);
        for (const code of seen) {
            if (!map.has(code)) map.set(code, []);
            map.get(code).push(path.relative(ROOT, f));
        }
    }
    return map;
}

function loadRegisteredCodes() {
    const codes = new Set();
    for (const p of REGISTRY_SURFACES) {
        if (!fs.existsSync(p)) continue;
        const src = fs.readFileSync(p, 'utf8');
        CODE_PATTERN.lastIndex = 0;
        let m;
        while ((m = CODE_PATTERN.exec(src)) !== null) codes.add(m[1]);
    }
    return codes;
}

function main() {
    const startMs = Date.now();
    const codeToFile = buildCodeToFileMap();
    const registered = loadRegisteredCodes();
    if (registered.size === 0) {
        console.error('FATAL: no codes found in registry surfaces.');
        process.exit(99);
    }

    const orphans = [];
    const implemented = [];
    for (const code of registered) {
        if (PLANNED_CODES[code]) {
            implemented.push({ code, class: 'planned', reason: PLANNED_CODES[code].reason });
            continue;
        }
        const files = codeToFile.get(code);
        if (!files || files.length === 0) {
            orphans.push({
                code,
                class: 'orphan',
                severity: 'high',
                issueCode: 'META-002-ORPHAN-DOC-ENTRY',
                message: `Code ${code} appears in the rule registry but no file in _tools/eduscan/ implements it.`,
                fix: `Either implement ${code} as a validator, remove the registry entry, or add to PLANNED_CODES with a reason + ETA.`
            });
        } else {
            implemented.push({ code, files });
        }
    }

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'meta-orphan-registry-audit',
        validatorCode: 'META-002',
        scope: {
            registrySurfaces: REGISTRY_SURFACES.map(p => path.relative(ROOT, p)),
            registeredCodes: registered.size,
            implementationFiles: [...new Set([].concat(...[...codeToFile.values()]))].length
        },
        totals: {
            registered: registered.size,
            implemented: implemented.length,
            orphans: orphans.length,
            planned: Object.keys(PLANNED_CODES).length,
            durationMs: Date.now() - startMs
        },
        findings: orphans,
        codeToFile: Object.fromEntries(codeToFile)
    };
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('meta-orphan-registry-audit (META-002)');
    console.log('========================================');
    console.log('  Registered codes:          ' + registered.size);
    console.log('  Implemented (file found):  ' + implemented.length);
    console.log('  ORPHAN (doc but no file):  ' + orphans.length);
    console.log('  Planned (suppressed):      ' + Object.keys(PLANNED_CODES).length);
    console.log('  Duration:                  ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:                    ' + path.relative(ROOT, OUT_FILE));

    if (orphans.length > 0) {
        console.log('---');
        console.log('HIGH: registry orphans (doc entries with no implementation):');
        orphans.slice(0, 20).forEach(o => console.log('  ' + o.code));
        if (orphans.length > 20) console.log('  ... and ' + (orphans.length - 20) + ' more');
    }

    if (REPORT_ONLY || orphans.length === 0) process.exit(0);
    process.exit(1);
}

main();
