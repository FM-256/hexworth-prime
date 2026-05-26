#!/usr/bin/env node
/**
 * NIST standard supersession audit
 *
 * Scans the codebase for references to NIST Special Publications and
 * other publicly-maintained standards documents, and flags references
 * that point to KNOWN-SUPERSEDED revisions (or that omit a revision
 * qualifier where one is now expected).
 *
 * Why this exists:
 *   Karl found two superseded-NIST citations in pis-w4-lecture
 *   on 2026-05-25: "NIST SP 800-63B" (withdrawn 2025-08-01, superseded
 *   by SP 800-63B-4) and "NIST SP 800-61" without the r3 revision
 *   qualifier (r2 was the prior canonical revision; r3 shipped 2025-04).
 *   This audit codifies the pattern so the next CompTIA cycle of
 *   slide updates doesn't reintroduce the same drift.
 *
 * Standards tracked (extend the SUPERSESSION_TABLE below):
 *   SP 800-63B  → withdrawn 2025-08-01, replaced by SP 800-63B-4
 *   SP 800-37   → current revision is Rev. 2 (December 2018)
 *   SP 800-61   → current revision is r3 (April 2025); r2 (2012) is
 *                 still valid academic reference for legacy material
 *                 but slides citing "SP 800-61" without revision
 *                 qualifier are ambiguous
 *
 * Output: list of file:line refs that match a SUPERSEDED or AMBIGUOUS
 *   pattern. Exit code 0 if clean, 1 if findings.
 *
 * Usage:
 *   node _tools/eduscan/nist-standard-supersession-audit.js
 *   node _tools/eduscan/nist-standard-supersession-audit.js --json
 *
 * Not currently in the EduScan pipeline — run on demand or as part of
 * a citation audit. Promotion to a HEUR-NNN rule depends on FP rate
 * across the codebase.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');

// Each entry: pattern of concern + diagnosis.
// `bareRefRegex`: matches a reference to the standard WITHOUT a current revision qualifier
// `currentRevisionRegex`: matches a reference with the current revision (used to skip lines that are already correct)
// `note`: shown in the report
const SUPERSESSION_TABLE = [
    {
        standard: 'SP 800-63B',
        bareRefRegex: /\bSP[\s\-]?800[\-\s]?63B\b(?!-4)/i,
        currentRevisionRegex: /\bSP[\s\-]?800[\-\s]?63B-4\b/i,
        note: 'SP 800-63B was withdrawn 2025-08-01 and replaced by SP 800-63B-4 (July 2025). Update references to the -4 revision.',
    },
    {
        standard: 'SP 800-37',
        // SP 800-37 without Rev. 1 / Rev. 2 / r2 / etc.
        bareRefRegex: /\bSP[\s\-]?800[\-\s]?37\b(?!\s*(Rev|r)\.?\s*\d)/i,
        currentRevisionRegex: /\bSP[\s\-]?800[\-\s]?37\s*(Rev\.?\s*2|r2|Revision\s*2)\b/i,
        note: 'SP 800-37 current revision is Rev. 2 (December 2018). Ambiguous references should qualify the revision.',
    },
    {
        standard: 'SP 800-61',
        bareRefRegex: /\bSP[\s\-]?800[\-\s]?61\b(?!\s*r\d|\s*Rev)/i,
        currentRevisionRegex: /\bSP[\s\-]?800[\-\s]?61\s*(r3|Rev\.?\s*3|Revision\s*3)\b/i,
        note: 'SP 800-61 current revision is r3 (April 2025). r2 (2012) is still useful academic reference but slide citations should be explicit.',
    },
];

const SKIP_DIRS = new Set([
    'node_modules', '.git', '_archive', '_drafts',
    'firebase-debug.log', '.firebase',
]);

const TEXT_EXTS = new Set(['.html', '.md', '.js', '.json', '.yaml', '.yml', '.txt']);

function walk(dir, hits) {
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
        return;
    }
    for (const ent of entries) {
        if (SKIP_DIRS.has(ent.name)) continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            walk(full, hits);
        } else if (ent.isFile() && TEXT_EXTS.has(path.extname(ent.name))) {
            scanFile(full, hits);
        }
    }
}

function scanFile(filePath, hits) {
    let content;
    try {
        content = fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
        return;
    }
    // Skip this very file (otherwise we self-match every pattern below)
    if (filePath === __filename) return;
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const entry of SUPERSESSION_TABLE) {
            // If the line already contains the current revision somewhere, skip
            // (avoids false-positive on lines like "from SP 800-63B to SP 800-63B-4").
            if (entry.currentRevisionRegex.test(line)) continue;
            if (entry.bareRefRegex.test(line)) {
                hits.push({
                    file: path.relative(REPO, filePath),
                    line: i + 1,
                    standard: entry.standard,
                    snippet: line.trim().slice(0, 160),
                    note: entry.note,
                });
            }
        }
    }
}

function main() {
    const wantJson = process.argv.includes('--json');
    const hits = [];
    walk(APP, hits);
    if (wantJson) {
        console.log(JSON.stringify(hits, null, 2));
        process.exit(hits.length ? 1 : 0);
        return;
    }
    if (hits.length === 0) {
        console.log('clean — no superseded NIST standard references found under _app/');
        process.exit(0);
        return;
    }
    console.log(`Found ${hits.length} references to potentially superseded or ambiguous NIST standards:\n`);
    const byStandard = {};
    for (const h of hits) {
        if (!byStandard[h.standard]) byStandard[h.standard] = [];
        byStandard[h.standard].push(h);
    }
    for (const [std, list] of Object.entries(byStandard)) {
        console.log(`\n=== ${std} (${list.length} matches) ===`);
        console.log(list[0].note);
        console.log('');
        for (const h of list) {
            console.log(`  ${h.file}:${h.line}`);
            console.log(`    ${h.snippet}`);
        }
    }
    console.log(`\nTotal: ${hits.length} matches`);
    process.exit(1);
}

main();
