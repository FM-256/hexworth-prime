#!/usr/bin/env node
/**
 * EduScan — Strict Quiz-Key Orphan Audit (XREF-002 v2 candidate)
 *
 * Companion to quiz-key-callsite-audit.js (XREF-002). XREF-002 marks an ID as
 * LIVE if any literal-string match exists in _app/**\/*.html. That's
 * conservative — but it false-LIVEs on:
 *   - JS/HTML comments mentioning the ID (e.g., `// Core 1 chapters: aplus-core1-ch01...`)
 *   - Hub data structures listing IDs without leading to a quiz file
 *     (e.g., `'forge-aplus-core1-prep-r1', 'forge-aplus-core1-prep-r2', ...`
 *     in LearningPaths arrays where the routing exists but the quiz file
 *     uses a different moduleId)
 *   - Body text mentioning the literal word (e.g., the ID "quizzes" matches
 *     the word "quizzes" in any prose)
 *
 * STRICT MODE requires the ID to appear in a recognized GRADING-CALLSITE
 * shape. If no shape matches, the ID is a CANDIDATE ORPHAN even if XREF-002
 * marked it LIVE.
 *
 * Recognized callsite shapes (case-sensitive literal match within shape):
 *   1. gradeQuiz("xx") or gradeQuiz('xx')        — direct CF arg
 *   2. quizId: "xx" or quizId: 'xx'               — object property
 *   3. quizId = "xx" or quizId = 'xx'             — assignment
 *   4. QUIZ_ID = "xx" or QUIZ_ID = 'xx'           — const declaration
 *   5. moduleId: "xx" or moduleId: 'xx'           — object property
 *   6. completeQuiz(*, "xx", *) or completeQuiz(*, 'xx', *) — ModuleProgress
 *   7. data-module="xx" or data-module='xx'       — HTML attribute
 *   8. data-quiz-id="xx" or data-quiz-id='xx'     — HTML attribute
 *
 * Read-only. No edits. No Firestore. Outputs JSON report.
 *
 * Usage:
 *   node _tools/eduscan/quiz-key-strict-orphan-audit.js
 *
 * Output:
 *   _tools/reports/QUIZ_KEY_STRICT_ORPHAN_AUDIT.json
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const KEYS_FILE = path.join(ROOT, 'functions/quiz_keys.json');
const APP_DIR = path.join(ROOT, '_app');
const REPORTS_DIR = path.join(ROOT, '_tools/reports');
const OUT_FILE = path.join(REPORTS_DIR, 'QUIZ_KEY_STRICT_ORPHAN_AUDIT.json');

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Build a single "any-callsite-shape" regex per ID that captures all 8 shapes.
function buildShapeRegex(id) {
    const e = escapeRegex(id);
    const q = '["\']' + e + '["\']';
    const patterns = [
        'gradeQuiz\\(\\s*' + q,                  // 1
        'quizId\\s*:\\s*' + q,                   // 2
        'quizId\\s*=\\s*' + q,                   // 3
        'QUIZ_ID\\s*=\\s*' + q,                  // 4
        'moduleId\\s*:\\s*' + q,                 // 5
        'completeQuiz\\([^)]*' + q,              // 6 (loose; allows other args)
        'data-module\\s*=\\s*' + q,              // 7
        'data-quiz-id\\s*=\\s*' + q,             // 8
    ];
    return new RegExp('(?:' + patterns.join('|') + ')', 'g');
}

function listHtmlFiles(dir) {
    const out = [];
    const stack = [dir];
    while (stack.length > 0) {
        const d = stack.pop();
        let entries;
        try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch (e) { continue; }
        for (const e of entries) {
            if (e.name.startsWith('.') || e.name === 'node_modules') continue;
            if (e.name === '_archive' || e.name === '_source') continue;
            const full = path.join(d, e.name);
            if (e.isDirectory()) { stack.push(full); }
            else if (e.isFile() && e.name.endsWith('.html')) { out.push(full); }
        }
    }
    return out;
}

function main() {
    const startMs = Date.now();
    const keys = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    const ids = Object.keys(keys);
    const htmlFiles = listHtmlFiles(APP_DIR);

    // O(files) not O(ids × files): read each file ONCE, build a single
    // mega-regex matching ANY callsite shape for ANY id, then per-match
    // extract the captured ID. ID-set lookup confirms it's a registered
    // quiz_keys entry before counting.
    const idSet = new Set(ids);
    const result = {};
    for (const id of ids) result[id] = { hits: 0, files: [] };

    // Single regex with capture groups per shape. The captured ID is
    // group 1..8 depending on shape; combine into a single capture-or-alt.
    // Use a literal-quoted-string capture: '([A-Za-z0-9_-]+)' or "..."
    // within the surrounding shape syntax.
    const shapeRe = new RegExp(
        '(?:' + [
            'gradeQuiz\\(\\s*["\\\']([A-Za-z0-9_-]+)["\\\']',         // 1
            'quizId\\s*:\\s*["\\\']([A-Za-z0-9_-]+)["\\\']',           // 2
            'quizId\\s*=\\s*["\\\']([A-Za-z0-9_-]+)["\\\']',           // 3
            'QUIZ_ID\\s*=\\s*["\\\']([A-Za-z0-9_-]+)["\\\']',          // 4
            'moduleId\\s*:\\s*["\\\']([A-Za-z0-9_-]+)["\\\']',         // 5
            'completeQuiz\\([^)]*?["\\\']([A-Za-z0-9_-]+)["\\\']',     // 6
            'data-module\\s*=\\s*["\\\']([A-Za-z0-9_-]+)["\\\']',      // 7
            'data-quiz-id\\s*=\\s*["\\\']([A-Za-z0-9_-]+)["\\\']',     // 8
        ].join('|') + ')',
        'g'
    );

    for (const f of htmlFiles) {
        let content;
        try { content = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
        const seenInFile = new Set();
        for (const m of content.matchAll(shapeRe)) {
            // Find first non-undefined capture group (the matched id)
            const id = m[1] || m[2] || m[3] || m[4] || m[5] || m[6] || m[7] || m[8];
            if (!id || !idSet.has(id) || seenInFile.has(id)) continue;
            seenInFile.add(id);
            result[id].hits++;
            if (result[id].files.length < 3) {
                result[id].files.push(path.relative(ROOT, f));
            }
        }
    }

    // Cross-reference with XREF-002 audit
    const xref002 = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, 'QUIZ_KEY_CALLSITE_AUDIT.json'), 'utf8'));
    const xref002Orphans = new Set(xref002.orphanIds || []);

    const candidates = []; // LIVE per XREF-002 but no strict shape match
    const confirmedOrphan = []; // Already orphan per XREF-002 (sanity check)
    const liveStrict = []; // Has strict shape match
    for (const id of ids) {
        const r = result[id];
        if (xref002Orphans.has(id)) {
            confirmedOrphan.push(id);
        } else if (r.hits === 0) {
            candidates.push({ id, shapes: r.hits });
        } else {
            liveStrict.push(id);
        }
    }

    const report = {
        generatedAt: new Date().toISOString(),
        totals: {
            totalKeys: ids.length,
            xref002Orphans: confirmedOrphan.length,
            strictLive: liveStrict.length,
            candidateOrphan: candidates.length,
            htmlFilesScanned: htmlFiles.length,
            durationMs: Date.now() - startMs,
        },
        candidateOrphanIds: candidates.map(c => c.id).sort(),
    };

    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log('Strict Orphan Audit (XREF-002 v2 candidate)');
    console.log('============================================');
    console.log('  Total keys:           ' + ids.length);
    console.log('  XREF-002 orphans:     ' + confirmedOrphan.length);
    console.log('  Strict-LIVE:          ' + liveStrict.length);
    console.log('  CANDIDATE orphans:    ' + candidates.length + ' (LIVE per XREF-002 but no callsite shape)');
    console.log('  Duration:             ' + (Date.now() - startMs) + 'ms');
    console.log('  Output:               ' + path.relative(ROOT, OUT_FILE));
    if (candidates.length > 0) {
        console.log('---');
        console.log('Candidate orphan IDs (alphabetical):');
        candidates.map(c => c.id).sort().forEach(id => console.log('  ' + id));
    }
}

main();
