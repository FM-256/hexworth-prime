#!/usr/bin/env node
/**
 * EduScan — Signal Guides Coverage Audit (XREF-003)
 *
 * The Signal hub renders project pages from a thin HTML wrapper that
 * loads SignalData.js (project metadata) and the section's guides.js
 * (project content: intro, wiring SVG, steps, troubleshooting, etc.).
 * When a project is declared in SignalData.js but has no matching key
 * in its section's guides.js, the rendered page silently shows an
 * "Under Construction" placeholder — visible to students, invisible
 * to the deploy pipeline. The reverse (a key in guides.js with no
 * matching project) is dead code.
 *
 * This validator runs both directions:
 *
 *   - MISSING_GUIDE: a project in SignalData.js with no corresponding
 *     entry in the section's guides.js. Renders as "Under Construction"
 *     to students.
 *
 *   - DEAD_GUIDE: a key in guides.js with no corresponding project in
 *     SignalData.js. Unused content; either remove or wire up a project.
 *
 *   - THIN_GUIDE (informational): a guide entry that has only `intro`
 *     and nothing else. Engine will render but the project page lacks
 *     wiring diagrams / steps / troubleshooting. Not a failure, just a
 *     completeness signal.
 *
 * Issue codes:
 *   - XREF-003.A: MISSING_GUIDE (high — student-visible)
 *   - XREF-003.B: DEAD_GUIDE   (medium — dead code, not student-visible)
 *   - XREF-003.C: THIN_GUIDE   (low — informational)
 *
 * Scope:
 *   - INPUT:   _app/signal/SignalData.js (sections array, project entries)
 *   - INPUT:   _app/signal/sections/{section-id}/guides.js (for each section
 *              that has a guides.js file)
 *   - SKIPPED: ducky-course-NN.html (full-page courses, not project-pattern)
 *   - SKIPPED: sections without a guides.js file (legitimately absent)
 *
 * Read-only. No edits. No Firestore. No production write.
 *
 * Usage:
 *   node _tools/eduscan/signal-guides-coverage-audit.js
 *
 * Output:
 *   _tools/reports/SIGNAL_GUIDES_COVERAGE.json — full findings
 *   stdout — summary + first findings
 *
 * Exit codes:
 *   0 — report written (whether or not findings exist)
 *   2 — self-validation failure (regex broke or scope is wrong)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DATA_FILE = path.join(ROOT, '_app/signal/SignalData.js');
const SECTIONS_DIR = path.join(ROOT, '_app/signal/sections');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'SIGNAL_GUIDES_COVERAGE.json');

// Self-validation: these projects are known to be properly wired in
// esp32-s3-arsenal/guides.js. If the tool reports any of them as
// MISSING_GUIDE, the regex is broken.
const KNOWN_WIRED = ['sg-103', 'sg-107', 'sg-112'];


// ============================================================
//  Extract project IDs from SignalData.js, grouped by section
// ============================================================
function extractSignalDataProjects(src) {
    // Walk character-by-character tracking brace depth. We are looking
    // for top-level section objects inside the `sections: [...]` array.
    // Each section opens with `id: 'kebab-case'` at depth 2 (inside the
    // SignalData wrapper + inside the sections array), and contains a
    // `projects: [...]` array with `{ id: 'sg-NN', ... }` entries.
    //
    // We do this with a simpler approach: find the start of `sections: [`,
    // then iterate line by line, tracking the current section by its
    // declared `id:` field at a known indent level.
    const lines = src.split('\n');
    const startIdx = lines.findIndex(l => /^\s*sections:\s*\[/.test(l));
    if (startIdx < 0) throw new Error('sections: [ not found in SignalData.js');

    const sections = {};   // sectionId -> Set of project ids
    let currentSection = null;

    for (let i = startIdx + 1; i < lines.length; i++) {
        const line = lines[i];
        // Top-level section id: appears at 12-space indent based on existing format
        const secMatch = line.match(/^            id:\s*'([a-z][a-z0-9-]+)'\s*,/);
        if (secMatch && !secMatch[1].startsWith('sg-')) {
            currentSection = secMatch[1];
            if (!sections[currentSection]) sections[currentSection] = new Set();
            continue;
        }
        // Project id inside a section (anywhere on the line)
        const projMatch = line.match(/id:\s*'(sg-\d+)'\s*,/);
        if (projMatch && currentSection) {
            sections[currentSection].add(projMatch[1]);
        }
    }

    // Return as plain objects with sorted ID arrays for stable diffing
    const out = {};
    for (const [sid, ids] of Object.entries(sections)) {
        out[sid] = Array.from(ids).sort(
            (a, b) => parseInt(a.slice(3), 10) - parseInt(b.slice(3), 10)
        );
    }
    return out;
}


// ============================================================
//  Extract project IDs from a section's guides.js
//
// Hexworth Signal convention: every top-level guide entry lives at
// 4-space indent inside `window.SignalGuides = { ... }`:
//
//     'sg-NN': {
//         intro: '...',
//         ...
//     },
//
// We match line-start + 4 spaces + 'sg-NN': { to identify the start of
// each entry, then walk the file to the next 4-space-indent key (or
// the closing `};`) to get the entry's body for the THIN check.
// ============================================================
function extractGuidesKeys(guidesSrc) {
    const lines = guidesSrc.split('\n');
    // Two conventions seen in the codebase:
    //   A.  4-space-indented key inside the SignalGuides object literal
    //       (esp32-s3-arsenal, red-team-hw, etc.)
    //   B.  Top-level assignment per entry
    //       window.SignalGuides['sg-NN'] = { ... }
    //       (network-recon, privacy-builds, security-tools)
    const keyLineReA = /^    '(sg-\d+)':\s*\{/;
    const keyLineReB = /^window\.SignalGuides\[['"](sg-\d+)['"]\]\s*=\s*\{/;

    // First pass: collect (id, lineIndex) tuples
    const entries = [];
    for (let i = 0; i < lines.length; i++) {
        const mA = keyLineReA.exec(lines[i]);
        if (mA) { entries.push({ id: mA[1], startLine: i }); continue; }
        const mB = keyLineReB.exec(lines[i]);
        if (mB) { entries.push({ id: mB[1], startLine: i }); }
    }

    const keys = entries.map(e => e.id);

    // Second pass: for each entry, look at the body slice (from startLine
    // to the next entry's startLine, or end-of-file) and count top-level
    // fields. THIN = only `intro:` present and nothing else.
    const thin = [];
    for (let i = 0; i < entries.length; i++) {
        const start = entries[i].startLine + 1;
        const end = i + 1 < entries.length ? entries[i + 1].startLine : lines.length;
        const body = lines.slice(start, end).join('\n');
        // Top-level fields: <name>: at 8-space indent (one level inside
        // the entry's object literal). Stop matching beyond the entry's
        // closing brace by counting nesting in the body slice.
        let depth = 0;
        const topFields = new Set();
        // Track depth char-by-char; capture identifiers at depth 0 followed by ':'
        for (let k = 0; k < body.length; k++) {
            const c = body[k];
            if (c === '{' || c === '[') depth++;
            else if (c === '}' || c === ']') depth--;
            else if (depth === 0 && c === ':') {
                const back = body.slice(Math.max(0, k - 80), k);
                const fm = /([a-zA-Z_][a-zA-Z0-9_]*)\s*$/.exec(back);
                if (fm && fm[1] !== 'http' && fm[1] !== 'https') {
                    topFields.add(fm[1]);
                }
            }
            if (depth < 0) break;  // out of entry's object
        }
        if (topFields.size === 1 && topFields.has('intro')) {
            thin.push(entries[i].id);
        }
    }

    return { keys, thin };
}


// ============================================================
//  Main
// ============================================================
function main() {
    const startMs = Date.now();
    const findings = [];

    // ---- Load SignalData ----
    const dataSrc = fs.readFileSync(DATA_FILE, 'utf8');
    const sectionProjects = extractSignalDataProjects(dataSrc);
    const allKnownProjects = new Set();
    for (const ids of Object.values(sectionProjects)) {
        for (const id of ids) allKnownProjects.add(id);
    }

    // ---- Walk sections and load guides.js if present ----
    const perSection = {};

    for (const sectionId of Object.keys(sectionProjects).sort()) {
        const guidesPath = path.join(SECTIONS_DIR, sectionId, 'guides.js');
        const expected = sectionProjects[sectionId];
        const row = {
            section: sectionId,
            guidesFile: fs.existsSync(guidesPath)
                ? path.relative(ROOT, guidesPath)
                : null,
            declaredProjects: expected,
            guideKeys: [],
            missingGuides: [],
            deadGuides: [],
            thinGuides: [],
        };

        if (row.guidesFile) {
            const guideSrc = fs.readFileSync(guidesPath, 'utf8');
            const { keys, thin } = extractGuidesKeys(guideSrc);
            row.guideKeys = keys.slice().sort(
                (a, b) => parseInt(a.slice(3), 10) - parseInt(b.slice(3), 10)
            );
            row.thinGuides = thin.slice().sort();

            for (const id of expected) {
                if (!keys.includes(id)) row.missingGuides.push(id);
            }
            for (const id of keys) {
                if (!expected.includes(id)) row.deadGuides.push(id);
            }
        } else {
            // No guides.js for this section. All projects render the
            // Under Construction placeholder. Flag all as MISSING_GUIDE
            // unless the section legitimately has no projects.
            row.missingGuides = expected.slice();
        }

        // Materialize findings
        for (const id of row.missingGuides) {
            findings.push({
                code: 'XREF-003.A',
                severity: 'high',
                section: sectionId,
                projectId: id,
                file: row.guidesFile || `${path.relative(ROOT, path.dirname(guidesPath))}/ (no guides.js)`,
                message: `Project ${id} declared in SignalData.js but has no entry in ${sectionId}/guides.js. Renders as "Under Construction" placeholder to students.`,
            });
        }
        for (const id of row.deadGuides) {
            findings.push({
                code: 'XREF-003.B',
                severity: 'medium',
                section: sectionId,
                projectId: id,
                file: row.guidesFile,
                message: `Guide entry ${id} in ${sectionId}/guides.js has no matching project in SignalData.js. Dead code.`,
            });
        }
        for (const id of row.thinGuides) {
            findings.push({
                code: 'XREF-003.C',
                severity: 'low',
                section: sectionId,
                projectId: id,
                file: row.guidesFile,
                message: `Guide entry ${id} in ${sectionId}/guides.js has only "intro" defined. Page renders but lacks wiringSvg / steps / troubleshooting.`,
            });
        }

        perSection[sectionId] = row;
    }

    // ---- Self-validation ----
    const arsenalRow = perSection['esp32-s3-arsenal'];
    const selfPass =
        arsenalRow &&
        KNOWN_WIRED.every(id => arsenalRow.guideKeys.includes(id)) &&
        KNOWN_WIRED.every(id => !arsenalRow.missingGuides.includes(id));

    if (!selfPass) {
        console.error('SELF-VALIDATION FAILURE: known-wired projects not detected as wired:');
        console.error('  esp32-s3-arsenal guideKeys =',
            arsenalRow ? arsenalRow.guideKeys : '(no row)');
        console.error('  expected to include:', KNOWN_WIRED);
        console.error('Refusing to write report. Investigate scope/regex.');
        process.exit(2);
    }

    // ---- Output ----
    const totals = {
        sectionsScanned: Object.keys(perSection).length,
        sectionsWithGuides: Object.values(perSection).filter(r => r.guidesFile).length,
        totalProjects: allKnownProjects.size,
        missingGuideCount: findings.filter(f => f.code === 'XREF-003.A').length,
        deadGuideCount: findings.filter(f => f.code === 'XREF-003.B').length,
        thinGuideCount: findings.filter(f => f.code === 'XREF-003.C').length,
        durationMs: Date.now() - startMs,
    };

    const report = {
        generatedAt: new Date().toISOString(),
        tool: 'signal-guides-coverage-audit',
        validatorCode: 'XREF-003',
        scope: {
            input: ['_app/signal/SignalData.js', '_app/signal/sections/*/guides.js'],
        },
        totals,
        selfValidationPassed: selfPass,
        perSection,
        findings,
    };

    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    // ---- Stdout ----
    console.log('signal-guides-coverage-audit (XREF-003)');
    console.log('========================================');
    console.log('  Sections scanned:           ' + totals.sectionsScanned);
    console.log('  Sections with guides.js:    ' + totals.sectionsWithGuides);
    console.log('  Total projects declared:    ' + totals.totalProjects);
    console.log('  MISSING_GUIDE (high):       ' + totals.missingGuideCount);
    console.log('  DEAD_GUIDE (medium):        ' + totals.deadGuideCount);
    console.log('  THIN_GUIDE (low):           ' + totals.thinGuideCount);
    console.log('  Self-validation:            ' + (selfPass ? 'PASS' : 'FAIL'));
    console.log('  Duration:                   ' + totals.durationMs + 'ms');
    console.log('  Output:                     ' + path.relative(ROOT, OUT_FILE));
    if (findings.length) {
        console.log('---');
        console.log('First 20 findings:');
        for (const f of findings.slice(0, 20)) {
            console.log('  [' + f.code + '] ' + f.section + ' / ' + f.projectId);
        }
        if (findings.length > 20) {
            console.log('  ... and ' + (findings.length - 20) + ' more in the report.');
        }
    }
}

main();
