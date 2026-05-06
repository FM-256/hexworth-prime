#!/usr/bin/env node
/**
 * sync-helper.js — Bridget's static companion (v0.5)
 *
 * Two-source sync verifier for the platform's quiz infrastructure.
 * Runs mechanical checks across all quizzes in functions/quiz_keys.json
 * comparing HTML option arrays vs Firestore quiz_keys arrays.
 *
 * v0.5 scope (HTML ↔ Firestore):
 *   C3a — HTML.questions.length matches Firestore.questionCount
 *   C5  — Firestore.answers.length matches Firestore.questionCount
 *   C6  — Firestore.answers values are integers in [0..3] (MC) or
 *         object-wrapped per gradeQuiz contract (MS/ORDER)
 *   Extra — flags placeholder distributions matching project_placeholder_keys_audit
 *
 * Future v1 scope (adds Confluence — needs quizId→pageId registry):
 *   C1  — HTML question text matches Confluence h3 text
 *   C2  — HTML options length == 4
 *   C3  — HTML[options][Firestore.answers[i]] matches Confluence-stated correct
 *   C4  — counts agree across all three sources
 *   C7  — Confluence "Verified Answer Index" array == Firestore.answers
 *   C8  — architecture rule 6 distribution
 *
 * On detected drift, the operator can either fix the local source directly
 * or invoke the Bridget agent for source-of-truth judgment.
 *
 * USAGE:
 *   node _tools/quiz-sync/sync-helper.js                # all 449 registered quizzes
 *   node _tools/quiz-sync/sync-helper.js --quiz <id>    # single quiz
 *   node _tools/quiz-sync/sync-helper.js --json         # machine-readable output
 *   node _tools/quiz-sync/sync-helper.js --skip-firestore  # static-only (no Firestore reads)
 *
 * EXIT CODES:
 *   0 — all checked quizzes PASS
 *   1 — one or more DRIFT findings
 *   2 — script error
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.join(REPO_ROOT, 'functions/quiz_keys.json');
const APP_ROOT = path.join(REPO_ROOT, '_app');

const args = process.argv.slice(2);
const SINGLE_QUIZ = (() => {
    const i = args.indexOf('--quiz');
    return i !== -1 ? args[i + 1] : null;
})();
const JSON_MODE = args.includes('--json');
const SKIP_FIRESTORE = args.includes('--skip-firestore');

// ─── HTML option-array extraction ─────────────────────────────────────

const QUESTION_BLOCK_PAT = new RegExp(
    String.raw`\{\s*(?:question|q)\s*:\s*` +
    String.raw`("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*,\s*` +
    String.raw`(?:options|opts|a)\s*:\s*\[(.*?)\]`,
    's'
);

const OPTION_STRING_PAT = /"((?:[^"\\]|\\.)*)"/g;

// One-time deep walk under _app/ to map basename → fullpath for all
// {quizId}.quiz.html and {quizId}.exam.html files. Built lazily on first call.
let _htmlIndex = null;
function buildHtmlIndex() {
    if (_htmlIndex) return _htmlIndex;
    _htmlIndex = new Map();
    const stack = [APP_ROOT];
    while (stack.length) {
        const dir = stack.pop();
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { continue; }
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                if (ent.name.startsWith('_archive') || ent.name.startsWith('_source')) continue;
                stack.push(full);
            } else if (ent.isFile()) {
                const m = ent.name.match(/^(.+)\.(quiz|exam)\.html$/);
                if (m) _htmlIndex.set(m[1], full);
            }
        }
    }
    return _htmlIndex;
}

function findHtmlForQuiz(quizId) {
    const idx = buildHtmlIndex();
    if (idx.has(quizId)) return idx.get(quizId);
    // Common transformations: strip -quiz suffix; strip house prefix
    const tries = [
        quizId.replace(/-quiz$/, ''),
        quizId.replace(/^(shield|web|forge|matrix|cloud|code|eye|script|key|signal|divergent|dark-arts|ai)-/, ''),
        quizId.replace(/^(shield|web|forge|matrix|cloud|code|eye|script|key|signal|divergent|dark-arts|ai)-/, '').replace(/-quiz$/, ''),
    ];
    for (const t of tries) {
        if (t && idx.has(t)) return idx.get(t);
    }
    return null;
}

function parseHtmlQuestions(htmlPath) {
    const content = fs.readFileSync(htmlPath, 'utf8');
    const blocks = [];
    const re = new RegExp(QUESTION_BLOCK_PAT.source, 'gs');
    let m;
    while ((m = re.exec(content)) !== null) {
        const optsBlob = m[2];
        const opts = [];
        let om;
        const optRe = new RegExp(OPTION_STRING_PAT.source, 'g');
        while ((om = optRe.exec(optsBlob)) !== null) opts.push(om[1]);
        if (opts.length === 4) blocks.push({ opts });
    }
    return blocks;
}

// ─── Distribution suspicion check ──────────────────────────────────────

function distributionAnalysis(answers) {
    const n = answers.length;
    if (n === 0) return { suspicious: false, reason: 'empty' };
    const counts = [0, 0, 0, 0];
    for (const v of answers) {
        if (Number.isInteger(v) && v >= 0 && v <= 3) counts[v]++;
    }
    const pcts = counts.map(c => c * 100 / n);
    const max = Math.max(...pcts);
    const min = Math.min(...pcts);
    if (n >= 10) {
        if (max >= 70) return { suspicious: true, reason: `${max.toFixed(1)}% on one index (placeholder pattern)`, counts };
        if (n >= 15 && (min < 15 || max > 35)) return { suspicious: true, reason: `index distribution outside 15-35% (${counts.join('/')})`, counts };
    }
    const allSame = answers.every(v => v === answers[0]);
    if (allSame && n > 1) return { suspicious: true, reason: `all-${answers[0]} pattern`, counts };
    return { suspicious: false, counts };
}

// ─── Per-quiz check ────────────────────────────────────────────────────

async function checkQuiz(quizId, registryEntry, db) {
    const findings = [];
    const expectedCount = registryEntry.questionCount;
    const expectedAnswers = registryEntry.answers;
    const result = {
        quizId,
        registry: { questionCount: expectedCount, answers: expectedAnswers },
        html: null,
        firestore: null,
        findings,
        verdict: 'PASS'
    };

    // Find HTML
    const htmlPath = findHtmlForQuiz(quizId);
    if (!htmlPath) {
        result.findings.push({ check: 'C0_HTML_NOT_FOUND', detail: `No HTML file matches ${quizId}` });
        result.verdict = 'BLOCK_HTML_NOT_FOUND';
        return result;
    }
    result.html = { path: path.relative(REPO_ROOT, htmlPath) };

    // Parse HTML questions
    const htmlBlocks = parseHtmlQuestions(htmlPath);
    result.html.questionCount = htmlBlocks.length;

    // C5 — Firestore answers length matches questionCount
    if (Array.isArray(expectedAnswers) && expectedAnswers.length !== expectedCount) {
        result.findings.push({
            check: 'C5_LENGTH_MISMATCH',
            detail: `Registry questionCount=${expectedCount} but answers.length=${expectedAnswers.length}`
        });
    }

    // C6 — values in range
    if (Array.isArray(expectedAnswers)) {
        const bad = [];
        expectedAnswers.forEach((v, i) => {
            if (typeof v === 'object' && v !== null && (Array.isArray(v.ms) || Array.isArray(v.order))) return;
            if (!Number.isInteger(v) || v < 0 || v > 3) bad.push(i);
        });
        if (bad.length) {
            result.findings.push({
                check: 'C6_INVALID_VALUE',
                detail: `Indices ${bad.join(',')} have values out of [0..3]`
            });
        }
    }

    // C3a — HTML question count vs Firestore questionCount
    if (htmlBlocks.length > 0 && htmlBlocks.length !== expectedCount) {
        result.findings.push({
            check: 'C3a_COUNT_MISMATCH',
            detail: `HTML has ${htmlBlocks.length} questions; registry says ${expectedCount}`
        });
    }

    // Distribution suspicion (placeholder-pattern detection)
    const dist = distributionAnalysis(expectedAnswers);
    if (dist.suspicious) {
        result.findings.push({
            check: 'DIST_SUSPICIOUS',
            detail: dist.reason,
            counts: dist.counts
        });
    }

    // Live Firestore check
    if (!SKIP_FIRESTORE && db) {
        try {
            const doc = await db.doc(`quiz_keys/${quizId}`).get();
            if (!doc.exists) {
                result.firestore = { exists: false };
                result.findings.push({
                    check: 'C0_FIRESTORE_NOT_FOUND',
                    detail: 'Quiz key in static registry but missing from Firestore (bridge gap)'
                });
            } else {
                const data = doc.data();
                result.firestore = {
                    exists: true,
                    answersLength: Array.isArray(data.answers) ? data.answers.length : null,
                    questionCount: data.questionCount,
                    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null
                };
                if (Array.isArray(data.answers) && Array.isArray(expectedAnswers)) {
                    const sameLen = data.answers.length === expectedAnswers.length;
                    const sameVals = sameLen && data.answers.every((v, i) => JSON.stringify(v) === JSON.stringify(expectedAnswers[i]));
                    if (!sameVals) {
                        const diffPositions = [];
                        for (let i = 0; i < Math.min(data.answers.length, expectedAnswers.length); i++) {
                            if (JSON.stringify(data.answers[i]) !== JSON.stringify(expectedAnswers[i])) diffPositions.push(i);
                        }
                        result.findings.push({
                            check: 'C7_REGISTRY_VS_FIRESTORE',
                            detail: `Static registry differs from live Firestore at ${diffPositions.length} positions: ${diffPositions.slice(0, 10).join(',')}${diffPositions.length > 10 ? '...' : ''}`
                        });
                    }
                }
            }
        } catch (e) {
            result.findings.push({ check: 'FIRESTORE_ERROR', detail: e.message });
        }
    }

    if (result.findings.length > 0) {
        if (result.findings.some(f => f.check.startsWith('BLOCK') || f.check === 'C0_HTML_NOT_FOUND' || f.check === 'C0_FIRESTORE_NOT_FOUND')) {
            result.verdict = 'BLOCK';
        } else {
            result.verdict = 'DRIFT';
        }
    }
    return result;
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        console.error(`ERROR: registry not found at ${REGISTRY_PATH}`);
        process.exit(2);
    }
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

    let db = null;
    if (!SKIP_FIRESTORE) {
        try {
            // firebase-admin is in functions/, so resolve relative
            const admin = require(path.join(REPO_ROOT, 'functions/node_modules/firebase-admin'));
            if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
            db = admin.firestore();
        } catch (e) {
            console.error(`WARN: firebase-admin unavailable (${e.message}); continuing with --skip-firestore semantics`);
        }
    }

    const quizIds = SINGLE_QUIZ ? [SINGLE_QUIZ] : Object.keys(registry).sort();
    if (SINGLE_QUIZ && !registry[SINGLE_QUIZ]) {
        console.error(`ERROR: ${SINGLE_QUIZ} not in static registry`);
        process.exit(2);
    }

    const results = [];
    let counts = { PASS: 0, DRIFT: 0, BLOCK: 0, BLOCK_HTML_NOT_FOUND: 0 };
    for (const quizId of quizIds) {
        const r = await checkQuiz(quizId, registry[quizId], db);
        results.push(r);
        counts[r.verdict] = (counts[r.verdict] || 0) + 1;
        if (!JSON_MODE && r.verdict !== 'PASS') {
            console.log(`[${r.verdict}] ${quizId}`);
            for (const f of r.findings) {
                console.log(`    ${f.check}: ${f.detail}`);
            }
        }
    }

    if (JSON_MODE) {
        console.log(JSON.stringify({ results, counts }, null, 2));
    } else {
        console.log('');
        console.log('─── Summary ───');
        console.log(`Total quizzes: ${quizIds.length}`);
        for (const [k, v] of Object.entries(counts)) {
            console.log(`  ${k}: ${v}`);
        }
    }

    const exitCode = (counts.DRIFT || 0) + (counts.BLOCK || 0) + (counts.BLOCK_HTML_NOT_FOUND || 0) > 0 ? 1 : 0;
    process.exit(exitCode);
}

main().catch(err => {
    console.error('Sync helper failed:', err.message);
    console.error(err.stack);
    process.exit(2);
});
