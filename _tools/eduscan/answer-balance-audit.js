#!/usr/bin/env node
'use strict';
/**
 * answer-balance-audit.js — measure the two test-wiseness tells that let a student beat a
 * quiz without knowing the material.
 *
 * @catalog what   Audits every QuizEngine quiz for correct-answer LENGTH bias and POSITION
 *                 clustering (assessment-testing-standard.md section 1).
 * @catalog run    node _tools/eduscan/answer-balance-audit.js [--json] [--min N] [--all]
 * @catalog status TOOL
 *
 * WHY
 * `_docs/operations/assessment-testing-standard.md` exists because a first draft of the A+
 * midterm had the correct answer as the LONGEST option in 49 of 60 questions. A student who
 * had never opened the book could beat that well above chance by picking the wordiest option.
 * The standard sets two falsifiable bars:
 *
 *   LENGTH    correct-is-longest stays near chance, about 1 in 4.
 *   POSITION  correct answers spread across A/B/C/D. Options are NOT shuffled at runtime
 *             (that rule exists because shuffling desynced answer keys), so the AUTHORED
 *             spread is the FINAL spread. Cluster them at B and B is the safe guess forever.
 *
 * Both are properties of the authored HTML, which is why this reads the page rather than
 * quiz_keys.json: the key doc holds indices but not option TEXT, and length bias is invisible
 * without the text.
 *
 * WHAT "FLAGGED" MEANS
 * A flag is a signal to LOOK, not a verdict. Small quizzes swing wildly by chance — 8 questions
 * with 4 at position B is unremarkable. Thresholds scale with n and the tool prints the counts
 * so a human can judge. It never edits a quiz: re-keying an assessment changes what students
 * are graded against and is an operator decision.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');
const APP = path.join(REPO, '_app');
const AS_JSON = process.argv.includes('--json');
const SHOW_ALL = process.argv.includes('--all');
const minIdx = process.argv.indexOf('--min');
const MIN_Q = minIdx !== -1 && process.argv[minIdx + 1] ? Number(process.argv[minIdx + 1]) : 8;

// ── Config extraction (shared shape with verify-quiz-keys.js --pool-draw) ──────────
// Comment-stripping runs over SCRIPT BODIES ONLY. Over raw HTML an apostrophe in prose
// ("don't") opens a phantom string that swallows the rest of the file.
function stripJsComments(src) {
    let out = '', i = 0, quote = null;
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

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p, out);
        else if (ent.isFile() && p.endsWith('.html')) out.push(p);
    }
    return out;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const AOTA = /^\s*(all of the above|none of the above)/i;

/** Visible length of an option: strip tags and entities so markup does not inflate it. */
function visibleLen(s) {
    return String(s).replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim().length;
}

/**
 * Resolve the correct index for every question.
 *
 * TWO SOURCES, and missing this is why the first run of this tool reported "0 quizzes".
 * A client-graded quiz carries `correct` on the question. A SERVER-GRADED one does not —
 * shipping the key to the browser is the exact thing server grading exists to prevent — so
 * its key lives in quiz_keys.json under the moduleId, in AUTHORED question order. Length
 * and position bias are properties of the authored pairing, so the two must be joined or
 * the 415 server-graded quizzes (the ones the standard most cares about) go unmeasured.
 */
function resolveCorrect(qs, cfgObj, registry) {
    const key = cfgObj.moduleId && registry[cfgObj.moduleId] ? registry[cfgObj.moduleId] : null;
    const keyAnswers = key && Array.isArray(key.answers) ? key.answers : null;
    return qs.map((q, i) => {
        if (typeof q.correct === 'number') return q.correct;
        if (keyAnswers && typeof keyAnswers[i] === 'number') return keyAnswers[i];
        return null;   // multi-select/order/terminal wrappers, or no key: not a position/length item
    });
}

function analyseQuiz(cfgObj, rel, registry) {
    const qs = Array.isArray(cfgObj.questions) ? cfgObj.questions : [];
    const correctIdx = resolveCorrect(qs, cfgObj, registry);
    const mc = qs
        .map((q, i) => ({ ...q, correct: correctIdx[i] }))
        .filter(q => Array.isArray(q.options) && typeof q.correct === 'number'
            && q.correct >= 0 && q.correct < q.options.length);
    if (!mc.length) return null;

    const pos = {};
    let longest = 0, tiedLongest = 0, aotaTotal = 0, aotaCorrect = 0, aotaNotLast = 0;

    for (const q of mc) {
        const key = LETTERS[q.correct] || String(q.correct);
        pos[key] = (pos[key] || 0) + 1;

        const lens = q.options.map(visibleLen);
        const max = Math.max(...lens);
        const correctLen = lens[q.correct];
        const winners = lens.filter(l => l === max).length;
        // Strict wins only: if three options tie at the maximum, "longest" carries no signal.
        if (correctLen === max && winners === 1) longest++;
        else if (correctLen === max) tiedLongest++;

        const aotaIdx = q.options.findIndex(o => AOTA.test(String(o)));
        if (aotaIdx !== -1) {
            aotaTotal++;
            if (aotaIdx === q.correct) aotaCorrect++;
            if (aotaIdx !== q.options.length - 1) aotaNotLast++;
        }
    }

    const n = mc.length;
    const optCounts = mc.map(q => q.options.length);
    const typicalOpts = optCounts.sort((a, b) => a - b)[Math.floor(optCounts.length / 2)] || 4;
    const chance = 1 / typicalOpts;

    const longestPct = longest / n;
    const topPos = Object.entries(pos).sort((a, b) => b[1] - a[1])[0] || ['-', 0];
    const topPosPct = topPos[1] / n;
    const missing = LETTERS.slice(0, typicalOpts).filter(l => !pos[l]);

    // Thresholds scale with n: a small quiz swings by chance and must not cry wolf.
    // 2x chance for length, and for position a band that tightens as n grows.
    const posBar = n >= 40 ? 0.40 : n >= 20 ? 0.45 : 0.55;

    // THE TWO TELLS ARE NOT EQUALLY REAL, and reporting them at equal weight would send
    // someone re-keying hundreds of quizzes for a non-issue.
    //
    // POSITION is neutralised at runtime for anything QuizEngine renders: QC-8 enforces a
    // Fisher-Yates shuffle on the options every attempt and remaps the correct index
    // (QuizEngine.js:139-145), and it IGNORES randomize:false with a warning
    // (QuizEngine.js:30-31). So an authored key of all-B never reaches a student as all-B.
    // It stays worth recording as LATENT: a static export, a future non-shuffling renderer,
    // or a page that hand-rolls its own render would expose the authored spread instantly.
    //
    // LENGTH survives shuffling untouched. Moving the longest option from B to D does not
    // make it shorter. This is the tell a student can actually use today, which is why it
    // is the one ranked first.
    const flags = [];      // exploitable by a student today
    const latent = [];     // real defects, currently masked by the runtime shuffle

    if (n >= MIN_Q && longestPct >= chance * 2) {
        flags.push(`LENGTH: correct is the longest option in ${longest}/${n} (${Math.round(longestPct * 100)}%), chance is ~${Math.round(chance * 100)}%`);
    }
    if (n >= MIN_Q && topPosPct >= posBar) {
        latent.push(`POSITION: ${topPos[1]}/${n} (${Math.round(topPosPct * 100)}%) of answers are ${topPos[0]}`);
    }
    if (n >= 12 && missing.length) {
        latent.push(`POSITION: ${missing.join('/')} never used as a correct answer across ${n} questions`);
    }
    // NOT latent: the shuffle cannot mask this one. If anything the shuffle causes it —
    // an "All of the above" that renders in position B, with two more options under it,
    // is incoherent on screen no matter where it was authored.
    if (aotaNotLast) flags.push(`AOTA/NOTA not authored last in ${aotaNotLast} item(s)`);
    if (aotaTotal >= 4 && (aotaCorrect === 0 || aotaCorrect === aotaTotal)) {
        flags.push(`AOTA/NOTA correct in ${aotaCorrect}/${aotaTotal} — presence signals the answer regardless of position`);
    }

    return {
        file: rel,
        moduleId: cfgObj.moduleId || null,
        serverGraded: cfgObj.serverGrading === true,
        questions: n,
        options: typicalOpts,
        positions: pos,
        correctIsLongest: longest,
        correctIsLongestPct: Math.round(longestPct * 1000) / 10,
        tiedLongest,
        aota: { total: aotaTotal, correct: aotaCorrect, notLast: aotaNotLast },
        flags,
        latent
    };
}

// ── Run ───────────────────────────────────────────────────────────────────────────
// The answer keys for server-graded quizzes. Missing file is not fatal — client-graded
// quizzes still analyse fine — but it IS reported, because a silent {} would quietly drop
// every server-graded quiz from the audit and still print a confident summary.
let REGISTRY = {};
const REGISTRY_PATH = path.join(REPO, 'functions', 'quiz_keys.json');
let registryNote = '';
try {
    REGISTRY = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
} catch (e) {
    registryNote = `WARNING: could not read functions/quiz_keys.json (${e.message.slice(0, 60)}). Server-graded quizzes will be UNMEASURED.`;
}

const files = walk(APP);
const results = [];
const unparseable = [];

for (const f of files) {
    const raw = fs.readFileSync(f, 'utf8');
    if (!raw.includes('new QuizEngine(')) continue;
    const rel = path.relative(REPO, f);
    const src = stripJsComments(
        [...raw.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n;\n')
    );
    let idx = src.indexOf('new QuizEngine(');
    while (idx !== -1) {
        const cfg = balancedBraceSlice(src, idx);
        if (!cfg) { unparseable.push(`${rel} (no config literal)`); break; }
        let obj = null;
        try {
            // Our own repo content, and a literal by construction — but any config that
            // references a variable will throw here and is REPORTED, never skipped silently.
            obj = new Function('"use strict"; return (' + cfg + ');')();
        } catch (e) {
            unparseable.push(`${rel} (${e.message.slice(0, 60)})`);
            idx = src.indexOf('new QuizEngine(', idx + 1);
            continue;
        }
        const r = analyseQuiz(obj, rel, REGISTRY);
        if (r) results.push(r);
        idx = src.indexOf('new QuizEngine(', idx + 1);
    }
}

const flagged = results.filter(r => r.flags.length);
const latentOnly = results.filter(r => !r.flags.length && r.latent.length);
const totalQ = results.reduce((a, r) => a + r.questions, 0);
const totalLongest = results.reduce((a, r) => a + r.correctIsLongest, 0);
const posAll = {};
for (const r of results) for (const [k, v] of Object.entries(r.positions)) posAll[k] = (posAll[k] || 0) + v;

if (AS_JSON) {
    console.log(JSON.stringify({ results, flagged: flagged.map(f => f.file), unparseable, totals: { quizzes: results.length, questions: totalQ, correctIsLongest: totalLongest, positions: posAll } }, null, 2));
} else {
    console.log('Answer-balance audit (assessment-testing-standard.md section 1)');
    console.log('='.repeat(66));
    if (registryNote) console.log(registryNote + '\n');
    console.log(`Quizzes analysed: ${results.length}   Questions: ${totalQ}`);
    if (totalQ) {
        console.log(`\nPLATFORM-WIDE`);
        console.log(`  correct-is-longest: ${totalLongest}/${totalQ} (${(totalLongest / totalQ * 100).toFixed(1)}%)  [chance ~25%]`);
        const posLine = LETTERS.filter(l => posAll[l]).map(l => `${l}=${posAll[l]} (${(posAll[l] / totalQ * 100).toFixed(1)}%)`).join('  ');
        console.log(`  position spread:    ${posLine}`);
    }
    const show = SHOW_ALL ? results : flagged;
    console.log(`\n${SHOW_ALL ? 'ALL QUIZZES' : 'EXPLOITABLE TODAY'}: ${show.length}`);
    show.sort((a, b) => b.correctIsLongestPct - a.correctIsLongestPct || b.flags.length - a.flags.length);
    for (const r of show) {
        const posStr = LETTERS.filter(l => r.positions[l]).map(l => `${l}:${r.positions[l]}`).join(' ');
        console.log(`\n  ${r.file}${r.serverGraded ? '  [server-graded]' : ''}`);
        console.log(`    ${r.questions} questions, ${r.options} options   positions ${posStr}   longest ${r.correctIsLongest}/${r.questions} (${r.correctIsLongestPct}%)`);
        r.flags.forEach(fl => console.log(`    ! ${fl}`));
        r.latent.forEach(fl => console.log(`    ~ (latent) ${fl}`));
    }
    // Printed, never dropped: these quizzes have a real authored defect that the runtime
    // option shuffle currently hides. They become live the moment anything renders these
    // questions without shuffling.
    console.log(`\nLATENT ONLY (authored defect, masked today by the QuizEngine option shuffle): ${latentOnly.length}`);
    if (!SHOW_ALL) {
        latentOnly.slice(0, 10).forEach(r => {
            const posStr = LETTERS.filter(l => r.positions[l]).map(l => `${l}:${r.positions[l]}`).join(' ');
            console.log(`  ~ ${r.file}  (${r.questions}q, ${posStr})`);
            r.latent.forEach(fl => console.log(`      ${fl}`));
        });
        if (latentOnly.length > 10) console.log(`  ... and ${latentOnly.length - 10} more (use --json for the full list)`);
    }
    if (unparseable.length) {
        console.log(`\nNOT ANALYSED (${unparseable.length}) — reported, not silently skipped:`);
        unparseable.slice(0, 15).forEach(u => console.log(`  ? ${u}`));
        if (unparseable.length > 15) console.log(`  ... and ${unparseable.length - 15} more`);
    }
    console.log('');
}

// Exit 0 always: this is a REPORT, not a gate. Re-keying a live assessment changes what
// students are graded against, so a human decides. Wire it as a gate only for NEW quizzes.
process.exit(0);
