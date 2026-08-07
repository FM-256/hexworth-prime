#!/usr/bin/env node
/**
 * verify-quiz-keys.js — Verify the bridge between exam HTML and live Firestore quiz_keys.
 *
 * Server-graded exams call gradeQuiz Cloud Function which reads quiz_keys/{quizId}
 * from Firestore. EduScan validates against the static functions/quiz_keys.json
 * registry — but live Firestore is the source of truth at runtime.
 *
 * This tool reads live Firestore directly to confirm:
 *   1. The expected key documents exist
 *   2. They have the right format (answers array, questionCount, passingScore)
 *   3. answers.length matches questionCount
 *   4. The static registry (functions/quiz_keys.json) matches live state
 *
 * USAGE (from functions/ directory):
 *   node verify-quiz-keys.js                            # verify ALL static-registry IDs against live Firestore
 *   node verify-quiz-keys.js <quizId> [<quizId> ...]    # verify specific IDs
 *   node verify-quiz-keys.js --missing                  # list IDs in static but not Firestore (and vice versa)
 *   node verify-quiz-keys.js --static-only              # check static registry format only (no Firestore call)
 *   node verify-quiz-keys.js --pool-draw                # drawn-subset gate: page poolSize vs key-doc poolSize (offline)
 *
 * EXIT CODES (CI-friendly):
 *   0 = all verified IDs OK
 *   1 = one or more verification failures
 *   2 = script error (Firebase Admin failure, missing file, etc.)
 *
 * EXAMPLES:
 *   # Pre-deploy gate for new server-graded exam
 *   node verify-quiz-keys.js divergent-cse-midterm divergent-cse-final
 *
 *   # Find platform-wide bridge gaps
 *   node verify-quiz-keys.js --missing
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --registry lets the fixtures supply their own key docs instead of the real 621-entry
// registry, so proving the gate falsifiable never means writing fake ids into production
// data. Resolved below, after args are parsed.
const DEFAULT_STATIC_REGISTRY = path.join(__dirname, 'quiz_keys.json');

const args = process.argv.slice(2);

// --app-root lets the gate be pointed at a fixture tree so it can be proven falsifiable.
// A scanner that has only ever reported "0 problems" over the real repo has not been
// shown to detect anything; see the fixtures under _tools/quiz-gate-fixtures/.
const appRootIdx = args.indexOf('--app-root');
const APP_ROOT = appRootIdx !== -1 && args[appRootIdx + 1]
    ? path.resolve(args[appRootIdx + 1])
    : path.join(__dirname, '..', '_app');
const MODE_MISSING = args.includes('--missing');
const MODE_STATIC_ONLY = args.includes('--static-only');
const MODE_POOL_DRAW = args.includes('--pool-draw');
// --registry <path>: same purpose as --app-root. Lets the fixtures bring their own key
// docs so proving this gate falsifiable never writes fake ids into the real registry.
const registryIdx = args.indexOf('--registry');
const STATIC_REGISTRY = registryIdx !== -1 && args[registryIdx + 1]
    ? path.resolve(args[registryIdx + 1])
    : DEFAULT_STATIC_REGISTRY;

// Excludes the VALUES of --app-root and --registry, which are paths and not quizIds.
const OPTION_VALUE_POSITIONS = new Set(
    [appRootIdx, registryIdx].filter(i => i !== -1).map(i => i + 1)
);
const QUIZ_IDS = args.filter((a, i) => !a.startsWith('--') && !OPTION_VALUE_POSITIONS.has(i));

function loadStaticRegistry() {
    if (!fs.existsSync(STATIC_REGISTRY)) {
        console.error(`ERROR: static registry not found at ${STATIC_REGISTRY}`);
        process.exit(2);
    }
    return JSON.parse(fs.readFileSync(STATIC_REGISTRY, 'utf8'));
}

/**
 * Validate a key doc's poolSize (drawn-subset delivery, taskboard #295).
 *
 * gradeQuiz reads poolSize as the SERVED question count and uses it as the scoring
 * denominator (quiz-grading.js resolveServedCount). A malformed value is silently
 * ignored there and falls back to the full bank — which is safe, but silent, and
 * silence is how a quiz goes back to scoring a perfect student 60%. So it is a hard
 * failure here rather than a shrug at runtime.
 *
 * Returns an array of human-readable problems (empty = fine).
 */
function poolSizeIssues(d) {
    const issues = [];
    if (d.poolSize === undefined || d.poolSize === null) return issues;   // not pooled: nothing to check

    const count = typeof d.questionCount === 'number' ? d.questionCount
        : (Array.isArray(d.answers) ? d.answers.length : null);

    if (!Number.isInteger(d.poolSize) || d.poolSize <= 0) {
        issues.push(`poolSize must be a positive integer, got ${JSON.stringify(d.poolSize)} (gradeQuiz would ignore it and grade against the full bank)`);
    } else if (count !== null && d.poolSize > count) {
        issues.push(`poolSize ${d.poolSize} exceeds questionCount ${count} — cannot serve more questions than exist`);
    }

    // POOLING + revealToAll IS THE DANGEROUS COMBINATION. revealToAll hands back the
    // correct answer for every submitted index, including on a {partial:true} call
    // (index.js reveal block). On a full-bank quiz that is the intended instant-feedback
    // pedagogy. On a DRAWN SUBSET the student can retake against a fresh draw
    // (assessment-testing-standard.md:47), so revealing turns the pool into a
    // harvestable list. gradeQuiz already withholds the undrawn remainder, but the
    // questions the student WAS asked still come back, so a few attempts still walk the
    // bank. Refuse the combination until taskboard #297 lands a served-set record.
    if (d.revealToAll === true) {
        issues.push('poolSize combined with revealToAll — a drawn subset must not reveal answers (see taskboard #297)');
    }
    return issues;
}

function checkRegistryFormat(staticRegistry) {
    let problems = 0;
    for (const [id, d] of Object.entries(staticRegistry)) {
        const issues = [];
        if (!Array.isArray(d.answers)) issues.push('answers not array');
        if (typeof d.questionCount !== 'number') issues.push('missing questionCount');
        if (typeof d.passingScore !== 'number') issues.push('missing passingScore');
        if (Array.isArray(d.answers) && d.answers.length !== d.questionCount) {
            issues.push(`length mismatch: answers=${d.answers.length} count=${d.questionCount}`);
        }
        issues.push(...poolSizeIssues(d));
        if (issues.length) {
            console.log(`  X ${id}: ${issues.join('; ')}`);
            problems++;
        }
    }
    console.log(`\nStatic registry: ${Object.keys(staticRegistry).length} entries, ${problems} format problems.`);
    return problems === 0;
}

async function checkFirestoreLive(db, ids, staticRegistry) {
    let allGood = true;
    let mismatches = 0;
    for (const id of ids) {
        const doc = await db.doc(`quiz_keys/${id}`).get();
        if (!doc.exists) {
            console.log(`  X ${id}: NOT FOUND in Firestore`);
            allGood = false;
            continue;
        }
        const d = doc.data();
        const ansLen = Array.isArray(d.answers) ? d.answers.length : 'NOT_ARRAY';
        const poolIssues = poolSizeIssues(d);
        const ok = Array.isArray(d.answers) && ansLen === d.questionCount && poolIssues.length === 0;
        const status = ok ? 'OK' : 'MALFORMED';
        const poolNote = d.poolSize !== undefined ? `, poolSize=${JSON.stringify(d.poolSize)}` : '';
        console.log(`  ${ok ? 'OK' : 'X'} ${id}: answers=${ansLen}, questionCount=${d.questionCount}, passingScore=${d.passingScore}${poolNote} [${status}]`);
        poolIssues.forEach(m => console.log(`     ! ${m}`));
        if (!ok) allGood = false;

        // Cross-check against static registry
        const stat = staticRegistry[id];
        if (stat && Array.isArray(stat.answers) && Array.isArray(d.answers)) {
            const sameLen = stat.answers.length === d.answers.length;
            // Deep-compare each answer: mc/gui answers are primitives, but ms/order/terminal answers are
            // single-key wrapper objects ({ms|order|terminal:[...]}). Bare === on two structurally-equal
            // objects is always false by reference, which false-flagged every object-wrapped answer as a
            // static-vs-live mismatch. JSON.stringify compares primitives identically to === (2 vs "2"
            // still differ) and correctly deep-compares the wrappers. Residual: JSON.stringify is
            // order-sensitive, so an ms answer (order-insensitive at grading time per index.js) whose
            // static and live arrays hold the same set in a different order would still report DIFFERS;
            // low-probability since the same seed writes both stores in one pass, but not eliminated.
            const sameVals = sameLen && stat.answers.every((v, i) => JSON.stringify(v) === JSON.stringify(d.answers[i]));
            if (!sameVals) {
                console.log(`     ! static registry differs from live Firestore`);
                mismatches++;
            }
            // poolSize parity (taskboard #295). The --pool-draw gate compares the PAGE against
            // the static registry and never opens Firestore, so a poolSize written straight to
            // a live doc — a console edit, a one-off script that does not route through
            // push-quiz-keys.js — is invisible to it. gradeQuiz reads the LIVE doc, so that
            // value is the one that actually decides the denominator. This is the check that
            // sees it. A live poolSize the registry does not declare is the false-PASS case.
            const statPool = stat.poolSize === undefined ? null : stat.poolSize;
            const livePool = d.poolSize === undefined ? null : d.poolSize;
            if (JSON.stringify(statPool) !== JSON.stringify(livePool)) {
                console.log(`     ! poolSize differs: static=${JSON.stringify(statPool)} live=${JSON.stringify(livePool)} — the LIVE value is what gradeQuiz scores against`);
                mismatches++;
            }
        } else if (!stat) {
            console.log(`     ! id present in Firestore but missing from static registry — EduScan will not see it`);
            mismatches++;
        }
    }
    if (mismatches) console.log(`\n${mismatches} static-vs-live mismatches detected.`);
    return allGood && mismatches === 0;
}

/**
 * Strip JS comments so a config scan reads CODE, not prose.
 *
 * This is not cosmetic. forge-ch25.quiz.html carries a 7-line comment explaining why it
 * does NOT set poolSize; a scanner that greps the raw text flags it as a pooled quiz and
 * the gate starts crying wolf on the one file that documents the bug. Strings are tracked
 * so a `//` inside a URL or an apostrophe in prose does not eat the rest of the file.
 */
function stripJsComments(src) {
    let out = '';
    let i = 0;
    let quote = null;
    while (i < src.length) {
        const c = src[i], d = src[i + 1];
        if (quote) {
            if (c === '\\') { out += c + (d || ''); i += 2; continue; }
            if (c === quote) quote = null;
            out += c; i++; continue;
        }
        if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i++; continue; }
        if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); i = e === -1 ? src.length : e + 2; out += ' '; continue; }
        if (c === '/' && d === '/') { const e = src.indexOf('\n', i); i = e === -1 ? src.length : e; out += ' '; continue; }
        out += c; i++;
    }
    return out;
}

/** Slice a balanced {...} starting at the first '{' at or after `from`. */
function balancedBraceSlice(src, from) {
    const start = src.indexOf('{', from);
    if (start === -1) return null;
    let depth = 0, quote = null;
    for (let i = start; i < src.length; i++) {
        const c = src[i];
        if (quote) {
            if (c === '\\') { i++; continue; }
            if (c === quote) quote = null;
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
    }
    return null;
}

/**
 * POOL-DRAW BRIDGE GATE (taskboard #295).
 *
 * A quiz declares poolSize in its QuizEngine config; gradeQuiz learns the served count
 * ONLY from quiz_keys/{id}.poolSize. If the page pools and the key doc does not say so,
 * the server grades the drawn subset against the FULL bank and a perfect student scores
 * 12/20 = 60% and fails — silently, on every attempt, with nothing in any log to say why.
 * That is the exact defect #295 was opened for, and nothing structural stops it recurring.
 * This is the check that does.
 *
 * quizId === config.moduleId for the QuizEngine path (QuizEngine.js:490 passes
 * this.config.moduleId straight through as the gradeQuiz quizId).
 */
function checkPoolDrawBridge(staticRegistry, appRoot) {
    const files = [];
    (function walk(dir) {
        for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, ent.name);
            if (ent.isDirectory()) walk(p);
            else if (ent.isFile() && ent.name.endsWith('.html')) files.push(p);
        }
    })(appRoot);

    let pooled = 0, problems = 0, unparseable = 0, indirect = 0;
    const pagesThatPool = new Set();   // moduleIds whose PAGE declares a draw
    for (const f of files) {
        const raw = fs.readFileSync(f, 'utf8');
        if (!raw.includes('serverGrading')) continue;

        // SCRIPT BODIES ONLY. Comment-stripping must never run over HTML prose: an
        // apostrophe in ordinary text ("don't") opens a string state that swallows the
        // rest of the file and makes every config after it unparseable. Inside a script
        // the quote tracking is correct, because there every quote really is a string.
        const src = stripJsComments(
            [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n;\n')
        );

        let idx = src.indexOf('new QuizEngine(');
        while (idx !== -1) {
            const rel = path.relative(appRoot, f);
            // `new QuizEngine(someVar)` carries no inspectable literal. Report it rather
            // than pretend it was checked, but only FAIL if it might actually pool.
            const afterParen = src.slice(idx + 'new QuizEngine('.length).replace(/^\s+/, '');
            if (!afterParen.startsWith('{')) {
                const mightPool = /(?:poolSize|displayCount)\s*:/.test(src);
                console.log(`  ${mightPool ? 'X' : '-'} ${rel}: QuizEngine built from a variable, not an inline literal${mightPool ? ' AND the script mentions a draw — check by hand' : ' (no draw mentioned)'}`);
                if (mightPool) problems++;
                indirect++;
                idx = src.indexOf('new QuizEngine(', idx + 1);
                continue;
            }
            const cfg = balancedBraceSlice(src, idx);
            if (!cfg) {
                console.log(`  ? ${rel}: could not parse a QuizEngine config block`);
                unparseable++;
                break;
            }
            const server = /serverGrading\s*:\s*true/.test(cfg);
            const poolM = cfg.match(/(?:poolSize|displayCount)\s*:\s*(\d+)/);
            const idM = cfg.match(/moduleId\s*:\s*['"]([^'"]+)['"]/);

            if (server && poolM) {
                pooled++;
                if (!idM) {
                    console.log(`  X ${rel}: pools ${poolM[1]} but has no moduleId — gradeQuiz cannot resolve a key doc`);
                    problems++;
                } else {
                    const id = idM[1];
                    pagesThatPool.add(id);
                    const key = staticRegistry[id];
                    const declared = Number(poolM[1]);
                    if (!key) {
                        console.log(`  X ${rel}: pools ${declared}, quizId '${id}' NOT in the key registry`);
                        problems++;
                    } else if (key.poolSize === undefined) {
                        console.log(`  X ${rel}: pools ${declared} but quiz_keys/${id} has NO poolSize — server would grade the drawn subset against all ${key.questionCount} questions (the #295 60% bug)`);
                        problems++;
                    } else if (key.poolSize !== declared) {
                        console.log(`  X ${rel}: page pools ${declared}, quiz_keys/${id}.poolSize is ${key.poolSize} — denominator disagrees with delivery`);
                        problems++;
                    } else {
                        console.log(`  OK ${rel}: pools ${declared}, quiz_keys/${id}.poolSize matches`);
                    }
                }
            }
            idx = src.indexOf('new QuizEngine(', idx + 1);
        }
    }

    // THE REVERSE DIRECTION, and it is the more dangerous one. A key doc carrying
    // poolSize whose page does NOT pool is not a loud failure — the page submits the
    // whole bank only if the student finishes it. A student who answers 12 of 20 and
    // runs out of time submits 12, the server sees 12 <= servedCount 12, and grades them
    // 12/12 = 100%. A false PASS is worse than the false fail #295 started as, and
    // nothing about it looks wrong in any log. The other 415 server-graded pages do not
    // pool, so any poolSize that appears on their key docs is a mistake by construction.
    for (const [id, d] of Object.entries(staticRegistry)) {
        if (d.poolSize === undefined || d.poolSize === null) continue;
        if (!pagesThatPool.has(id)) {
            console.log(`  X quiz_keys/${id}: declares poolSize ${JSON.stringify(d.poolSize)} but NO page draws a subset for it — a partial attempt would be scored out of ${d.poolSize} and could false-PASS`);
            problems++;
        }
    }

    // Report the denominator of the search too. "0 problems" out of 0 inspected files is
    // a broken scanner, not a clean bill of health.
    console.log(`\nScanned ${files.length} HTML files; ${pooled} server-graded QuizEngine config(s) declare a draw.`);
    if (indirect) console.log(`${indirect} config(s) built from a variable — reported above, not silently skipped.`);
    if (unparseable) console.log(`${unparseable} config block(s) could not be parsed — treated as FAILURES, not skipped.`);
    console.log(`${problems} pool-draw bridge problem(s).`);
    return problems === 0 && unparseable === 0;
}

async function checkMissingDelta(db, staticRegistry) {
    const staticIds = Object.keys(staticRegistry);
    const liveSnap = await db.collection('quiz_keys').get();
    const liveIds = new Set(liveSnap.docs.map(d => d.id));
    const inStaticNotLive = staticIds.filter(id => !liveIds.has(id));
    const inLiveNotStatic = [...liveIds].filter(id => !staticRegistry[id]);
    console.log(`\nStatic registry: ${staticIds.length} entries`);
    console.log(`Live Firestore:   ${liveIds.size} entries`);
    console.log(`\nIn static but NOT in Firestore (${inStaticNotLive.length}):`);
    inStaticNotLive.forEach(id => console.log(`  - ${id}`));
    console.log(`\nIn Firestore but NOT in static registry (${inLiveNotStatic.length}):`);
    inLiveNotStatic.forEach(id => console.log(`  + ${id}`));
    return inStaticNotLive.length === 0 && inLiveNotStatic.length === 0;
}

async function main() {
    console.log('verify-quiz-keys.js');
    console.log('===================');
    const staticRegistry = loadStaticRegistry();

    if (MODE_POOL_DRAW) {
        // Offline by design: registry + repo only, no Firestore. That keeps it usable as a
        // pre-deploy gate on a machine with no admin credentials.
        const fmtOk = checkRegistryFormat(staticRegistry);
        console.log('\nPool-draw bridge (page poolSize vs quiz_keys poolSize):');
        const bridgeOk = checkPoolDrawBridge(staticRegistry, APP_ROOT);
        console.log(fmtOk && bridgeOk ? '\nPool-draw verification PASSED.' : '\nPool-draw verification FAILED.');
        process.exit(fmtOk && bridgeOk ? 0 : 1);
    }

    if (MODE_STATIC_ONLY) {
        const ok = checkRegistryFormat(staticRegistry);
        process.exit(ok ? 0 : 1);
    }

    if (!admin.apps.length) {
        admin.initializeApp({ projectId: 'hexworth-prime' });
    }
    const db = admin.firestore();

    if (MODE_MISSING) {
        const ok = await checkMissingDelta(db, staticRegistry);
        process.exit(ok ? 0 : 1);
    }

    const idsToVerify = QUIZ_IDS.length > 0 ? QUIZ_IDS : Object.keys(staticRegistry);
    console.log(`Verifying ${idsToVerify.length} quizId${idsToVerify.length === 1 ? '' : 's'}:\n`);
    const ok = await checkFirestoreLive(db, idsToVerify, staticRegistry);
    console.log(ok ? '\nVerification PASSED.' : '\nVerification FAILED.');
    process.exit(ok ? 0 : 1);
}

main().catch(err => {
    console.error('verify-quiz-keys error:', err.message);
    process.exit(2);
});
