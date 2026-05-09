#!/usr/bin/env node
/**
 * sync-helper.js — Bridget's static companion (v1.0 — Confluence-aware)
 *
 * Three-source sync verifier for the platform's quiz infrastructure.
 * Runs mechanical checks across all quizzes in functions/quiz_keys.json
 * comparing HTML option arrays vs Firestore quiz_keys arrays vs Confluence
 * solution-page Verified Answer Index.
 *
 * v0.5 scope (HTML ↔ Firestore — always on):
 *   C3a — HTML.questions.length matches Firestore.questionCount
 *   C5  — Firestore.answers.length matches Firestore.questionCount
 *   C6  — Firestore.answers values are integers in [0..3] (MC) or
 *         object-wrapped per gradeQuiz contract (MS/ORDER)
 *   Extra — flags placeholder distributions matching project_placeholder_keys_audit
 *
 * v1.0 scope (adds Confluence — gated on --with-confluence flag):
 *   C7  — Confluence "Verified Answer Index" array == Firestore.answers
 *         (closes fw-w4-data hand-copy drift bug class)
 *   C9  — Cross-quiz duplicate answer arrays (bonus — catches the case where
 *         one quiz's answer array got pasted into another. Triggered without
 *         --with-confluence; runs whenever registry size >= 2.)
 *   C0_CONF_NOT_MAPPED — quiz registered but no Confluence page mapped
 *   C0_CONF_PAGE_MISSING — pageId in registry but page no longer exists
 *   C0_CONF_NO_VAI — page exists but no Verified Answer Index found
 *
 * Quiz→Confluence page mapping lives in _tools/quiz-sync/quiz-pages.json.
 * Use --discover-confluence to auto-populate by title CQL search.
 *
 * On detected drift, the operator can either fix the local source directly
 * or invoke the Bridget agent for source-of-truth judgment per her
 * timestamp-aware hierarchy.
 *
 * USAGE:
 *   node _tools/quiz-sync/sync-helper.js                # HTML ↔ Firestore (default)
 *   node _tools/quiz-sync/sync-helper.js --quiz <id>    # single quiz
 *   node _tools/quiz-sync/sync-helper.js --json         # machine-readable output
 *   node _tools/quiz-sync/sync-helper.js --skip-firestore  # static-only
 *   node _tools/quiz-sync/sync-helper.js --with-confluence # full 3-source check
 *   node _tools/quiz-sync/sync-helper.js --discover-confluence # auto-map quizIds → pageIds
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
const CONF_REGISTRY_PATH = path.join(__dirname, 'quiz-pages.json');
const CONF_CREDS_PATH = path.join(require('os').homedir(), '.config/confluence/credentials.json');

const args = process.argv.slice(2);
const SINGLE_QUIZ = (() => {
    const i = args.indexOf('--quiz');
    return i !== -1 ? args[i + 1] : null;
})();
const JSON_MODE = args.includes('--json');
const SKIP_FIRESTORE = args.includes('--skip-firestore');
const WITH_CONFLUENCE = args.includes('--with-confluence');
const DISCOVER_CONFLUENCE = args.includes('--discover-confluence');

// ─── HTML option-array extraction ─────────────────────────────────────

const QUESTION_BLOCK_PAT = new RegExp(
    String.raw`\{\s*(?:question|q)\s*:\s*` +
    String.raw`("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*,\s*` +
    String.raw`(?:options|opts|a)\s*:\s*\[(.*?)\]`,
    's'
);

const OPTION_STRING_PAT = /"((?:[^"\\]|\\.)*)"/g;

// One-time deep walk under _app/. Builds two indexes:
//   byBasename: {quizId}.quiz.html or {quizId}.exam.html → fullpath
//   byDirName:  parent directory containing a *.quiz.html or *.exam.html → fullpath
// byBasename is canonical; byDirName is fallback for courses that use generic
// filenames inside per-quiz directories (e.g., script/courses/clh/modules/clh-001/script-quiz.quiz.html
// where the quiz ID matches the parent directory name). Built lazily on first call.
let _htmlIndex = null;
function buildHtmlIndex() {
    if (_htmlIndex) return _htmlIndex;
    const byBasename = new Map();
    const byDirName = new Map();
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
                if (m) {
                    byBasename.set(m[1], full);
                    // Also index by parent dir name for courses with generic filenames
                    // inside per-quiz directories (e.g., script/courses/clh/modules/clh-001/script-quiz.quiz.html
                    // where quiz ID matches parent dir name). Only set if not
                    // already present (basename match wins on collision). Hyphen
                    // filter rejects generic container dirs (quizzes/, labs/,
                    // exams/, modules/, presentations/) that would false-resolve
                    // when a quiz ID happens to share that name (e.g., the quiz
                    // ID literally named "quizzes" in quiz_keys.json).
                    const parentDirName = path.basename(dir);
                    if (parentDirName.includes('-') && !byDirName.has(parentDirName)) {
                        byDirName.set(parentDirName, full);
                    }
                }
            }
        }
    }
    _htmlIndex = { byBasename, byDirName };
    return _htmlIndex;
}

function findHtmlForQuiz(quizId) {
    const { byBasename, byDirName } = buildHtmlIndex();
    if (byBasename.has(quizId)) return byBasename.get(quizId);
    // Common transformations: strip -quiz suffix; strip house prefix
    const tries = [
        quizId.replace(/-quiz$/, ''),
        quizId.replace(/^(shield|web|forge|matrix|cloud|code|eye|script|key|signal|divergent|dark-arts|ai)-/, ''),
        quizId.replace(/^(shield|web|forge|matrix|cloud|code|eye|script|key|signal|divergent|dark-arts|ai)-/, '').replace(/-quiz$/, ''),
    ];
    for (const t of tries) {
        if (t && byBasename.has(t)) return byBasename.get(t);
    }
    // Fallback: parent-directory-name index (clh-NNN/script-quiz.quiz.html style).
    // Basename match was preferred above; only consult dir-name if all basename
    // attempts failed. Tick 34: catches ~52 of the prior 277 HTML-not-found FPs.
    if (byDirName.has(quizId)) return byDirName.get(quizId);
    for (const t of tries) {
        if (t && byDirName.has(t)) return byDirName.get(t);
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

// ─── Confluence client (lazy, only when --with-confluence) ────────────

let _confCreds = null;
let _confRegistry = null;

function loadConfluenceCreds() {
    if (_confCreds) return _confCreds;
    try {
        _confCreds = JSON.parse(fs.readFileSync(CONF_CREDS_PATH, 'utf8'));
        return _confCreds;
    } catch (e) {
        return null;
    }
}

function loadConfluenceRegistry() {
    if (_confRegistry) return _confRegistry;
    try {
        _confRegistry = JSON.parse(fs.readFileSync(CONF_REGISTRY_PATH, 'utf8'));
    } catch (e) {
        _confRegistry = { _meta: { version: 1 } };
    }
    return _confRegistry;
}

function saveConfluenceRegistry(reg) {
    reg._meta = reg._meta || { version: 1 };
    reg._meta.lastUpdated = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(CONF_REGISTRY_PATH, JSON.stringify(reg, null, 2));
}

async function confluenceFetch(pathStr) {
    const creds = loadConfluenceCreds();
    if (!creds) throw new Error('No Confluence credentials at ' + CONF_CREDS_PATH);
    const site = creds.site.replace(/\/$/, '');
    const auth = Buffer.from(`${creds.email}:${creds.token}`).toString('base64');
    const https = require('https');
    const url = new URL(site + pathStr);
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            method: 'GET',
            headers: { Authorization: 'Basic ' + auth, Accept: 'application/json' },
        }, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(body)); }
                    catch (e) { reject(new Error(`Confluence parse error: ${e.message}`)); }
                } else {
                    reject(new Error(`Confluence HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
                }
            });
        });
        req.on('error', reject);
        req.setTimeout(30000, () => { req.destroy(new Error('Confluence timeout')); });
        req.end();
    });
}

/**
 * Extract the Verified Answer Index array from a Confluence page's storage
 * format. Recognizes the canonical form: `Verified Answer Index (vN)</th>`
 * followed by the literal array `[0, 0, 2, ...]`. Returns the int array
 * or null if not found.
 */
function extractVerifiedAnswerIndex(storage) {
    if (!storage) return null;
    // Locate the Verified Answer Index marker first
    const marker = /Verified\s+Answer\s+Index/i.exec(storage);
    if (!marker) return null;
    // Search forward from marker for first integer-array literal
    const after = storage.slice(marker.index);
    const arrPat = /\[\s*(\d+(?:\s*,\s*\d+)+)\s*\]/;
    const m = arrPat.exec(after);
    if (!m) return null;
    const ints = m[1].split(',').map(s => parseInt(s.trim(), 10));
    return ints.every(n => Number.isInteger(n)) ? ints : null;
}

async function discoverConfluencePageForQuiz(quizId) {
    // Try a few title patterns: exact, uppercase, with spaces, with "Quiz Solutions" suffix
    const candidates = [
        quizId,
        quizId.toUpperCase().replace(/-/g, ' '),
        quizId.replace(/-/g, ' '),
    ];
    for (const cand of candidates) {
        try {
            const cql = `title ~ "${cand}"`;
            const resp = await confluenceFetch(`/wiki/rest/api/content/search?cql=${encodeURIComponent(cql)}&limit=5`);
            if (resp && Array.isArray(resp.results) && resp.results.length > 0) {
                // Prefer titles containing "Solutions" or matching the quizId loosely
                const sorted = resp.results.slice().sort((a, b) => {
                    const aS = /solutions?/i.test(a.title || '') ? 0 : 1;
                    const bS = /solutions?/i.test(b.title || '') ? 0 : 1;
                    return aS - bS;
                });
                return { pageId: sorted[0].id, title: sorted[0].title };
            }
        } catch (e) {
            // try next candidate
        }
    }
    return null;
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

    // Confluence three-source verification (gated on --with-confluence)
    if (WITH_CONFLUENCE) {
        const confReg = loadConfluenceRegistry();
        const mapping = confReg[quizId];
        if (!mapping || !mapping.pageId) {
            result.findings.push({
                check: 'C0_CONF_NOT_MAPPED',
                detail: `No quizId→pageId mapping in quiz-pages.json for "${quizId}". Run --discover-confluence to auto-populate.`
            });
        } else {
            try {
                const pageData = await confluenceFetch(`/wiki/api/v2/pages/${mapping.pageId}?body-format=storage`);
                const storage = pageData && pageData.body && pageData.body.storage && pageData.body.storage.value;
                if (!storage) {
                    result.findings.push({
                        check: 'C0_CONF_PAGE_MISSING',
                        detail: `Confluence page ${mapping.pageId} returned no storage body`
                    });
                } else {
                    const vai = extractVerifiedAnswerIndex(storage);
                    result.confluence = {
                        pageId: mapping.pageId,
                        title: mapping.title || pageData.title,
                        verifiedAnswerIndex: vai,
                    };
                    if (!vai) {
                        result.findings.push({
                            check: 'C0_CONF_NO_VAI',
                            detail: `Confluence page exists but no "Verified Answer Index" array found in storage`
                        });
                    } else if (Array.isArray(expectedAnswers)) {
                        // C7: Confluence VAI vs Firestore registry answers
                        // Only compare for pure-MC quizzes (integer arrays); skip MS/ORDER quizzes
                        const allInt = expectedAnswers.every(v => Number.isInteger(v));
                        if (allInt) {
                            if (vai.length !== expectedAnswers.length) {
                                result.findings.push({
                                    check: 'C7_CONF_LENGTH_MISMATCH',
                                    detail: `Confluence VAI length=${vai.length} but registry answers length=${expectedAnswers.length}`
                                });
                            } else {
                                const diff = [];
                                for (let i = 0; i < vai.length; i++) {
                                    if (vai[i] !== expectedAnswers[i]) diff.push(i);
                                }
                                if (diff.length > 0) {
                                    result.findings.push({
                                        check: 'C7_CONF_VS_REGISTRY_DRIFT',
                                        detail: `${diff.length} positions differ between Confluence VAI and registry: ${diff.slice(0, 10).join(',')}${diff.length > 10 ? '...' : ''}. Confluence: ${JSON.stringify(vai)}, Registry: ${JSON.stringify(expectedAnswers)}`
                                    });
                                }
                            }
                        }
                    }
                }
            } catch (e) {
                result.findings.push({
                    check: 'CONFLUENCE_ERROR',
                    detail: `Fetch failed for page ${mapping.pageId}: ${e.message}`
                });
            }
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

async function runDiscover(registryEntries) {
    const reg = loadConfluenceRegistry();
    let found = 0, skipped = 0, missing = 0;
    console.log(`Discovering Confluence pages for ${registryEntries.length} quizzes...`);
    for (const quizId of registryEntries) {
        if (reg[quizId] && reg[quizId].pageId) { skipped++; continue; }
        try {
            const m = await discoverConfluencePageForQuiz(quizId);
            if (m) {
                reg[quizId] = m;
                found++;
                console.log(`  + ${quizId} → ${m.pageId} (${m.title})`);
            } else {
                missing++;
            }
        } catch (e) {
            missing++;
        }
    }
    saveConfluenceRegistry(reg);
    console.log(`\nDiscover complete. Found: ${found}, already-mapped: ${skipped}, no-match: ${missing}`);
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

    // Discovery mode — auto-map quizIds to Confluence pages, then exit
    if (DISCOVER_CONFLUENCE) {
        await runDiscover(quizIds);
        process.exit(0);
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

    // ─── C9: Cross-quiz duplicate detection ───────────────────────────
    // If two different quizIds in the registry have identical answer arrays
    // of length >= 8 (min threshold to avoid coincidence on short quizzes),
    // flag as suspicious. This catches the hand-copy class where one quiz's
    // answer array gets pasted into another by mistake. Bug class confirmed
    // 2026-05-07: fw-w4-soho and fw-w4-mobile both shipped with the same
    // 15-element array, identical on Firestore AND Confluence (drift was
    // upstream of the per-quiz sync check).
    if (!SINGLE_QUIZ) {
        const fingerprints = new Map();  // arrayKey → [quizIds]
        for (const [qid, entry] of Object.entries(registry)) {
            if (!Array.isArray(entry.answers)) continue;
            // Only fingerprint pure-MC (integer) arrays, length >= 8
            if (!entry.answers.every(v => Number.isInteger(v))) continue;
            if (entry.answers.length < 8) continue;
            const key = entry.answers.join(',');
            if (!fingerprints.has(key)) fingerprints.set(key, []);
            fingerprints.get(key).push(qid);
        }
        const dups = [];
        for (const [key, qids] of fingerprints) {
            if (qids.length >= 2) dups.push({ key, qids });
        }
        if (dups.length > 0) {
            counts.DUPLICATE_ANSWER_ARRAYS = dups.length;
            if (!JSON_MODE) {
                console.log('');
                console.log(`─── C9: Cross-Quiz Duplicate Answer Arrays (${dups.length}) ───`);
                for (const d of dups) {
                    console.log(`  Same array [${d.key.split(',').slice(0, 8).join(',')}${d.key.split(',').length > 8 ? '...' : ''}] (length ${d.key.split(',').length}) shared by:`);
                    for (const q of d.qids) console.log(`    - ${q}`);
                }
            }
            // Tag results for those quizzes
            for (const d of dups) {
                for (const r of results) {
                    if (d.qids.includes(r.quizId)) {
                        r.findings.push({
                            check: 'C9_CROSS_QUIZ_DUPLICATE',
                            detail: `Answer array identical to: ${d.qids.filter(q => q !== r.quizId).join(', ')}`
                        });
                        if (r.verdict === 'PASS') r.verdict = 'DRIFT';
                    }
                }
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
