#!/usr/bin/env node
'use strict';
/**
 * @catalog what    Blocks a deploy when a CHANGED quiz has the correct answer as the longest option, or when ANY server-graded quiz words two options in one question identically
 * @catalog run     node _tools/eduscan/answer-balance-gate.js [--base <ref>] [--all] [--check <paths>] [--selftest]
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 *   `_docs/operations/assessment-testing-standard.md` section 1 says the correct answer must
 *   not be identifiable by any signal other than being correct, and names LENGTH first. The
 *   standard exists because an A+ midterm draft had the correct answer as the longest option
 *   in 49 of 60 questions: a student could beat it well above chance without opening the book.
 *
 *   Nothing enforced it. Measured 2026-08-07 across 407 quizzes and 5,261 questions, the
 *   correct answer is the longest option 61.2% of the time against 25% by chance, and TWENTY
 *   quizzes sit at a flat 100%. On those, reading the question is optional.
 *
 * WHY "CHANGED" AND NOT "ALL"
 *   ~248 quizzes are already over the bar and the standard's own migration note grandfathers
 *   shipped content ("Do not rush-change working shipped content without direction"). A gate
 *   that blocks every deploy on day one is a gate someone permanently --forces past, which is
 *   worse than no gate. This blocks what CHANGED and reports the rest. `--all` never blocks.
 *
 *   The comparison includes the working tree and untracked files, because deploy ships the
 *   working directory rather than the commit
 *   (memory `feedback_review_receipt_covers_the_tree_not_the_commit`).
 *
 * WHY LENGTH AND NOT POSITION
 *   Authored answer POSITIONS are skewed far worse (B carries 55.7% platform-wide; some keys
 *   are literally all-B). No student sees it: QuizEngine enforces a Fisher-Yates shuffle of
 *   the options every attempt and ignores randomize:false (QuizEngine.js:30-31,139-145).
 *   Length survives shuffling untouched, because moving the longest option from B to D does
 *   not make it shorter. Position skew is reported as LATENT by answer-balance-audit.js and
 *   tracked in taskboard #299; blocking on it would be blocking on something invisible.
 *
 * AND WHY DUPLICATE OPTION TEXT IS GATED, THOUGH POSITION IS NOT
 *   Both were raised together (NP-18). They are not the same kind of defect. Position is
 *   masked by the shuffle; duplicate option text is EXPOSED by it, and it mis-grades. When a
 *   quiz grades server-side, QuizEngine resolves the student's shuffled choice back to its
 *   authored index with `_originalOptions.indexOf(selectedText)` (QuizEngine.js:484), and
 *   indexOf returns the FIRST match. Two options in one question worded identically therefore
 *   collapse onto one index: a student who clicks the second copy is submitted, and graded, as
 *   having clicked the first. Client grading compares remapped indices and never does that
 *   lookup, so the block is scoped to server-graded quizzes and the rest is reported only.
 *
 *   This one is scanned across ALL of _app, not just what changed. The changed-only scope
 *   exists because ~248 quizzes are already over the LENGTH bar and the standard grandfathers
 *   shipped content. Neither reason transfers: a duplicate pair is not a bar being migrated
 *   toward, it is a live mis-grade on whatever carries it, and there are currently ZERO across
 *   407 parsed configs. So scanning everything costs ~0.6s and blocks nothing today, which is
 *   the point of adding it before a case exists rather than after one grades someone wrongly.
 *
 * THE MEASUREMENT LIVES IN ONE PLACE
 *   Extraction, the HTML-to-quiz_keys join and the thresholds all come from
 *   `answer-balance-audit.js`, which EduScan HEUR-042 also calls. Three copies of a rule is
 *   how `functions/tests/gradeQuiz.test.js` ended up green on logic that existed nowhere.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SCOPE_DIR = '_app/';
const audit = require('./answer-balance-audit.js');

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const MIN_Q = 8;

function sh(cmd) {
    try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
    catch { return ''; }
}

function resolveBase() {
    const i = args.indexOf('--base');
    const cands = i !== -1 && args[i + 1] ? [args[i + 1]] : ['origin/master', 'master'];
    for (const ref of cands) if (sh(`git rev-parse --verify --quiet ${ref}`)) return ref;
    return null;
}

function changedFiles() {
    const base = resolveBase();
    const out = new Set();
    if (base) {
        const mb = sh(`git merge-base HEAD ${base}`) || base;
        sh(`git diff --name-only ${mb} -- ${SCOPE_DIR}`).split('\n').forEach(f => f && out.add(f));
    }
    sh(`git diff --name-only HEAD -- ${SCOPE_DIR}`).split('\n').forEach(f => f && out.add(f));
    sh(`git ls-files --others --exclude-standard -- ${SCOPE_DIR}`).split('\n').forEach(f => f && out.add(f));
    return [...out];
}

function allFiles(dir, acc = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/node_modules|_archive/.test(p)) allFiles(p, acc); }
        else acc.push(path.relative(ROOT, p));
    }
    return acc;
}

/** Over the bar = at least MIN_Q questions AND correct-is-longest at twice chance or worse. */
function overBar(q) {
    if (!q || q.unparseable || !q.questions || q.questions < MIN_Q) return false;
    const chancePct = (1 / (q.options || 4)) * 100;
    return q.correctIsLongestPct >= chancePct * 2;
}

/** Server-graded AND two options in one question share identical text: an active mis-grade. */
function hasDupOptions(q) {
    return !!(q && !q.unparseable && q.serverGraded
        && Array.isArray(q.duplicateOptionItems) && q.duplicateOptionItems.length);
}

function scan(files, registry, pred = overBar) {
    const findings = [];
    for (const rel of files) {
        if (!rel.endsWith('.html')) continue;
        const abs = path.join(ROOT, rel);
        let raw;
        try { raw = fs.readFileSync(abs, 'utf8'); } catch { continue; }
        let quizzes;
        try { quizzes = audit.analyseFile(raw, rel, registry); } catch { continue; }
        for (const q of quizzes) if (pred(q)) findings.push(q);
    }
    return findings;
}

/* --selftest: prove the gate can fail before trusting it to pass. Two fixtures, one that
   MUST be caught and one that MUST NOT, because a detector that has only ever returned
   clean has not been shown to detect anything. */
function selfTest() {
    const mk = (opts) => `<html><body><script>
const quiz = new QuizEngine({ moduleId: 'selftest', questions: [
${opts.map(o => `  { question: 'q', options: [${o.map(t => `'${t}'`).join(', ')}], correct: ${o.indexOf(o.slice().sort((a, b) => b.length - a.length)[0])} }`).join(',\n')}
]});
</script></body></html>`;

    // 10 questions where the correct answer is ALWAYS much the longest.
    const biased = mk(Array.from({ length: 10 }, () => ['aa', 'b'.repeat(90), 'cc', 'dd']));
    // 10 questions where all options are the same length, so length carries no signal.
    const even = mk(Array.from({ length: 10 }, () => ['aaaa', 'bbbb', 'cccc', 'dddd']));

    /* Duplicate-option fixtures. Both options sets are deliberately length-TIED so the length
       rule cannot fire and confuse which check caught what. serverGrading:true because the
       block is scoped to the server path. */
    const mkDup = (dup) => `<html><body><script>
const quiz = new QuizEngine({ moduleId: 'selftest-dup', serverGrading: true, questions: [
${Array.from({ length: 10 }, (_, i) => `  { question: 'q${i}', options: ['alpha', 'beta', ${dup ? "'beta'" : "'gamma'"}, 'delta'], correct: 0 }`).join(',\n')}
]});
</script></body></html>`;
    /* Same duplicate pair, client-graded: must NOT block, because no text lookup happens. */
    const dupClient = mkDup(true).replace('serverGrading: true, ', '');

    const cases = [
        ['biased quiz is CAUGHT', biased, true, overBar],
        ['even-length quiz is IGNORED', even, false, overBar],
        ['duplicate option text is CAUGHT', mkDup(true), true, hasDupOptions],
        ['distinct options are IGNORED', mkDup(false), false, hasDupOptions],
        ['duplicate text on a CLIENT-graded quiz does not block', dupClient, false, hasDupOptions],
        ['the length rule does not fire on the duplicate fixtures', mkDup(true), false, overBar]
    ];
    let pass = 0, fail = 0;
    for (const [name, html, mustCatch, pred] of cases) {
        const got = audit.analyseFile(html, 'selftest.html', {}).some(pred);
        const ok = got === mustCatch;
        console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${name}`);
        ok ? pass++ : fail++;
    }
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
}
if (args.includes('--selftest')) selfTest();

// ── Run ───────────────────────────────────────────────────────────────────────────
const registry = audit.loadRegistry(ROOT);
if (registry === null) {
    // Not silent: without the key registry every server-graded quiz is unmeasurable, and a
    // gate that reports clean over unmeasured data is worse than one that admits it cannot see.
    console.log('\x1b[31mANSWER-BALANCE GATE ERROR\x1b[0m: functions/quiz_keys.json unreadable.');
    console.log('Server-graded quizzes cannot be measured without it. Refusing to report a pass.');
    process.exit(1);
}

const checkIdx = args.indexOf('--check');
const explicit = checkIdx !== -1 ? args.slice(checkIdx + 1).filter(a => !a.startsWith('--')) : null;
const targets = explicit
    ? explicit
    : (ALL ? allFiles(path.join(ROOT, '_app')) : changedFiles());

const findings = scan(targets, registry);

// Duplicate option text is scanned over ALL of _app regardless of what changed. See the
// header: it is a live mis-grade rather than a bar being migrated toward, and it currently
// matches nothing, so the full sweep blocks nothing while it stays that way.
// .html only, so the count printed below is the number of files actually examined rather
// than the number walked. scan() skips the rest anyway; an inflated figure in gate output is
// the kind of number someone later quotes as evidence.
const dupTargets = (explicit ? explicit : allFiles(path.join(ROOT, '_app'))).filter(f => f.endsWith('.html'));
const dupFindings = scan(dupTargets, registry, hasDupOptions);

const scopeLabel = explicit ? `${explicit.length} named file(s)`
    : ALL ? 'ALL _app content (reporting only)'
        : `changed vs ${resolveBase() || 'working tree'}`;

console.log(`answer-balance-gate: ${targets.length} file(s) in scope [${scopeLabel}]`);
console.log(`  length bias      : ${targets.length} file(s) [${scopeLabel}]`);
console.log(`  duplicate options: ${dupTargets.length} file(s) [${explicit ? 'named files' : 'always all of _app'}]`);

if (!findings.length && !dupFindings.length) {
    console.log('\x1b[32m✓\x1b[0m no changed quiz has a correct-is-longest bias, and no server-graded quiz has duplicate option text');
    process.exit(0);
}

for (const q of findings) {
    const chancePct = Math.round((1 / (q.options || 4)) * 100);
    console.log(`\n  \x1b[31mX\x1b[0m ${q.file}`);
    console.log(`      correct is the longest option in ${q.correctIsLongest}/${q.questions} (${q.correctIsLongestPct}%), chance is ~${chancePct}%`);
}

for (const q of dupFindings) {
    const items = q.duplicateOptionItems.slice(0, 4)
        .map(d => `Q${d.q} "${String(d.text).slice(0, 40)}"`).join(', ');
    console.log(`\n  \x1b[31mX\x1b[0m ${q.file}`);
    console.log(`      duplicate option text in ${q.duplicateOptionItems.length} item(s): ${items}${q.duplicateOptionItems.length > 4 ? ', …' : ''}`);
}

if (ALL) {
    console.log(`\n${findings.length} quiz(zes) over the length bar, ${dupFindings.length} with duplicate option text. --all is reporting only; not blocking.`);
    process.exit(0);
}

if (findings.length) {
    console.log(`\n\x1b[31mDEPLOY BLOCKED\x1b[0m: ${findings.length} changed quiz(zes) let a student score above chance by picking the longest option.`);
    console.log('Rebalance per assessment-testing-standard.md section 1: pad distractors with equally');
    console.log('specific but WRONG justifications, and trim the verbose correct answer. Do not simply');
    console.log('shorten the correct option until it is shortest, which only inverts the tell.');
    console.log('Measure: node _tools/eduscan/answer-balance-audit.js');
}

if (dupFindings.length) {
    console.log(`\n\x1b[31mDEPLOY BLOCKED\x1b[0m: ${dupFindings.length} server-graded quiz(zes) word two options in one question identically.`);
    console.log('Server grading resolves a choice back to its authored index by TEXT');
    console.log('(QuizEngine.js:484, indexOf returns the FIRST match), so a student who picks the');
    console.log('later copy is submitted and graded as having picked the earlier one.');
    console.log('FIX BY REWORDING one of the pair so every option in the question is distinct.');
    console.log('Do NOT delete an option: quiz_keys stores an INDEX, so dropping one shifts every');
    console.log('later index and regrades everyone who already took it. Prove the edit is safe with');
    console.log('node _tools/eduscan/verify-quiz-edit.js <before.html> <after.html>');
}
process.exit(1);
