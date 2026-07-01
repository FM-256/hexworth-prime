#!/usr/bin/env node
// reviewgames-health.mjs
//
// Whole-arcade quality + coverage snapshot for the admin console's "Arcade Fixes"
// cockpit (Phase 0). Audits EVERY live canonical game file under
// _app/_games-lab/data/<type>/*.json (all four engines) with deterministic
// quality checks, computes per-course engine coverage, and writes a single
// deployed snapshot at _app/_games-lab/reviewgames-health.json that the panel fetches.
//
// This is the arcade-wide sibling of lint.mjs: lint.mjs audits the 13 legacy
// clones being CONVERTED (staged data-extracted/); this audits the whole LIVE
// arcade for the cockpit. Check codes/severities are kept aligned with lint.mjs
// so the vocabulary is consistent. (Consolidating the two into one shared
// checks module is a Phase 1 follow-up.)
//
// Usage:  node _tools/game-forge/reviewgames-health.mjs
// Output: _app/_games-lab/reviewgames-health.json  (git add -f is NOT needed; it lives under _app)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAMES_LAB = path.resolve(HERE, '../../_app/_games-lab');
const DATA_DIR = path.join(GAMES_LAB, 'data');
const OUT = path.join(GAMES_LAB, 'reviewgames-health.json');
const ENGINES = ['jeopardy', 'kahoot', 'wheel', 'fifth'];

// Emoji / pictograph detection (any char in the common emoji blocks).
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
// Jeopardy responses should be phrased as a question.
const QWORD_RE = /^(what|who|where|when|why|how|which)\b/i;
// Common function words ignored by the wheel hint-leak check (they are not answer give-aways).
const STOPWORDS = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'by', 'as', 'is', 'are', 'be', 'it', 'that', 'this', 'for', 'with', 'from', 'into', 'you', 'your', 'its', 'has', 'can']);

/** Push a structured finding onto a list (mirrors lint.mjs's issue() shape). */
function issue(list, severity, code, msg, where) {
    list.push({ severity, code, msg, where });
}

/** True if a string is missing or only whitespace. */
function empty(s) {
    return typeof s !== 'string' || s.trim() === '';
}

/** Deterministic quality checks for a Jeopardy game object. */
function lintJeopardy(d, L) {
    const cats = Array.isArray(d.categories) ? d.categories : [];
    if (!cats.length) { issue(L, 'error', 'EMPTY_GAME', 'no categories', 'root'); return; }
    const seenClue = new Map(), seenResp = new Map();
    const counts = cats.map(c => (Array.isArray(c.clues) ? c.clues.length : 0));
    if (new Set(counts).size > 1) issue(L, 'warn', 'RAGGED_BOARD', 'categories have unequal clue counts (' + counts.join('/') + ')', 'board');
    cats.forEach(c => {
        const where = c && c.name ? c.name : '(unnamed)';
        if (empty(c && c.name)) issue(L, 'error', 'EMPTY_CAT_NAME', 'category has no name', where);
        const clues = Array.isArray(c && c.clues) ? c.clues : [];
        let lastVal = 0;
        clues.forEach(cl => {
            const at = where + ' / $' + (cl && cl.value != null ? cl.value : '?');
            if (typeof (cl && cl.value) !== 'number') issue(L, 'error', 'BAD_VALUE', 'clue value is not a number', at);
            else { if (cl.value <= lastVal) issue(L, 'warn', 'VALUE_LADDER', 'clue values not strictly ascending', at); lastVal = cl.value; }
            if (empty(cl && cl.clue)) issue(L, 'error', 'EMPTY_CLUE', 'clue text is empty', at);
            if (empty(cl && cl.response)) issue(L, 'error', 'EMPTY_RESPONSE', 'response is empty', at);
            else {
                const r = cl.response.trim();
                if (!QWORD_RE.test(r) || !r.endsWith('?')) issue(L, 'info', 'RESPONSE_FORMAT', 'response not phrased as a question', at);
                const rk = r.toLowerCase();
                if (seenResp.has(rk)) issue(L, 'info', 'DUP_RESPONSE', 'response duplicates ' + seenResp.get(rk), at);
                else seenResp.set(rk, at);
            }
            if (!empty(cl && cl.clue)) {
                const ck = cl.clue.trim().toLowerCase();
                if (seenClue.has(ck)) issue(L, 'warn', 'DUP_CLUE', 'clue duplicates ' + seenClue.get(ck), at);
                else seenClue.set(ck, at);
            }
            if (EMOJI_RE.test(JSON.stringify(cl))) issue(L, 'warn', 'EMOJI', 'clue contains emoji', at);
        });
    });
}

/** Shared checks for the MCQ engines (kahoot + fifth). `ladder` enables fifth-only rules. */
function lintMcq(d, L, ladder) {
    const qs = Array.isArray(d.questions) ? d.questions : [];
    if (!qs.length) { issue(L, 'error', 'EMPTY_GAME', 'no questions', 'root'); return; }
    const seenQ = new Map();
    const answerPositions = [];
    const milestoneIdx = [];
    let lastVal = 0;
    qs.forEach((q, i) => {
        const at = 'Q' + (i + 1);
        if (empty(q && q.q)) issue(L, 'error', 'EMPTY_Q', 'question stem is empty', at);
        const opts = Array.isArray(q && q.options) ? q.options : [];
        if (opts.length !== 4) issue(L, 'warn', 'OPT_COUNT', 'expected 4 options, found ' + opts.length, at);
        if (opts.some(empty)) issue(L, 'error', 'EMPTY_OPTION', 'an option is empty', at);
        if (new Set(opts.map(o => (o || '').trim().toLowerCase())).size !== opts.length) issue(L, 'warn', 'DUP_OPTION', 'duplicate option text', at);
        if (typeof (q && q.answer) !== 'number' || q.answer < 0 || q.answer >= opts.length) issue(L, 'error', 'BAD_ANSWER', 'answer index out of range', at);
        else answerPositions.push(q.answer);
        // explain.wrong[] must be index-aligned: "" at the answer index, non-empty elsewhere.
        const ex = q && q.explain;
        if (!ex || (empty(ex.correct) && !Array.isArray(ex.wrong))) issue(L, 'warn', 'NO_EXPLANATION', 'no explanation provided', at);
        else if (Array.isArray(ex.wrong)) {
            if (ex.wrong.length !== opts.length) issue(L, 'warn', 'WRONG_ALIGN', 'explain.wrong length != options', at);
            else if (typeof q.answer === 'number' && q.answer >= 0 && q.answer < opts.length) {
                if (!empty(ex.wrong[q.answer])) issue(L, 'warn', 'WRONG_ALIGN', 'explain.wrong[answer] should be empty', at);
                if (ex.wrong.some((w, wi) => wi !== q.answer && empty(w))) issue(L, 'warn', 'WRONG_ALIGN', 'a non-answer explain.wrong entry is empty', at);
            }
        }
        if (!empty(q && q.q)) {
            const qk = q.q.trim().toLowerCase();
            if (seenQ.has(qk)) issue(L, 'warn', 'DUP_Q', 'question duplicates ' + seenQ.get(qk), at);
            else seenQ.set(qk, at);
        }
        if (EMOJI_RE.test(JSON.stringify(q))) issue(L, 'warn', 'EMOJI', 'question contains emoji', at);
        if (ladder) {
            if (typeof (q && q.value) === 'number') { if (q.value <= lastVal) issue(L, 'warn', 'VALUE_LADDER', 'value not strictly ascending', at); lastVal = q.value; }
            if (q && q.milestone) milestoneIdx.push(i); // collect flagged rungs; validated once per game below
        }
    });
    // Milestone convention (info, once per game): safe-haven rungs should sit on q3/q6/q9/q11 (0-based 2/5/8/10).
    if (ladder) {
        const want = [2, 5, 8, 10].join(',');
        if (milestoneIdx.sort((a, b) => a - b).join(',') !== want) {
            issue(L, 'info', 'MILESTONE', 'milestones not on the q3/q6/q9/q11 convention', 'ladder');
        }
    }
    // Answer-position skew: any single index used in > 50% of questions is predictable.
    if (answerPositions.length) {
        const tally = {};
        answerPositions.forEach(a => { tally[a] = (tally[a] || 0) + 1; });
        const worst = Math.max(...Object.values(tally));
        if (worst / answerPositions.length > 0.5) issue(L, 'info', 'ANSWER_SKEW', 'correct answer clusters on one position (' + worst + '/' + answerPositions.length + ')', 'board');
    }
}

/** Deterministic quality checks for a Wheel-of-Fortune game object. */
function lintWheel(d, L) {
    const ps = Array.isArray(d.puzzles) ? d.puzzles : [];
    if (!ps.length) { issue(L, 'error', 'EMPTY_GAME', 'no puzzles', 'root'); return; }
    const seen = new Map();
    ps.forEach((p, i) => {
        const at = 'P' + (i + 1);
        const phrase = p && p.phrase;
        if (empty(phrase)) { issue(L, 'error', 'EMPTY_PHRASE', 'phrase is empty', at); return; }
        if (!/^[A-Z ]+$/.test(phrase)) issue(L, 'error', 'PHRASE_CHARS', 'phrase has non A-Z/space characters', at + ' "' + phrase + '"');
        if (empty(p.hint)) issue(L, 'warn', 'NO_HINT', 'puzzle has no hint', at);
        else {
            // Hint must not leak a content word of the answer phrase (stopwords are not give-aways).
            const hintWords = new Set(p.hint.toLowerCase().split(/[^a-z]+/).filter(Boolean));
            const leak = phrase.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !STOPWORDS.has(w) && hintWords.has(w));
            if (leak.length) issue(L, 'warn', 'HINT_LEAK', 'hint contains phrase word(s): ' + leak.join(', '), at);
        }
        if (empty(p.explain)) issue(L, 'info', 'NO_EXPLANATION', 'no explanation provided', at);
        const pk = phrase.trim().toUpperCase();
        if (seen.has(pk)) issue(L, 'warn', 'DUP_PHRASE', 'phrase duplicates ' + seen.get(pk), at);
        else seen.set(pk, at);
        if (EMOJI_RE.test(JSON.stringify(p))) issue(L, 'warn', 'EMOJI', 'puzzle contains emoji', at);
    });
}

/** Route a loaded game object to the right linter by engine type; return findings. */
function lintGame(type, data) {
    const L = [];
    if (type === 'jeopardy') lintJeopardy(data, L);
    else if (type === 'kahoot') lintMcq(data, L, false);
    else if (type === 'fifth') lintMcq(data, L, true);
    else if (type === 'wheel') lintWheel(data, L);
    return L;
}

/** Count findings by severity into a {error,warn,info} tally. */
function tally(findings) {
    const t = { error: 0, warn: 0, info: 0 };
    findings.forEach(f => { if (t[f.severity] != null) t[f.severity]++; });
    return t;
}

/** Number of items in a game object, by engine type. */
function itemCount(type, data) {
    if (type === 'jeopardy') return (data.categories || []).reduce((n, c) => n + ((c.clues || []).length), 0);
    if (type === 'wheel') return (data.puzzles || []).length;
    return (data.questions || []).length;
}

// ---- Scan every live canonical game file, per engine ----------------------
const byCourse = new Map(); // course slug -> { title, badge, games: {type: {...}} }

for (const type of ENGINES) {
    const dir = path.join(DATA_DIR, type);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.json')) continue;
        const stem = file.slice(0, -'.json'.length);
        if (stem.includes('.')) continue; // skip edition files like pis.practice-b.json
        const course = stem;
        let data;
        try { data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')); }
        catch (e) {
            if (!byCourse.has(course)) byCourse.set(course, { title: course, badge: '', games: {} });
            byCourse.get(course).games[type] = { exists: true, items: 0, findings: [{ severity: 'error', code: 'BAD_JSON', msg: 'file does not parse: ' + e.message, where: 'file' }] };
            continue;
        }
        if (!byCourse.has(course)) byCourse.set(course, { title: course, badge: '', games: {} });
        const rec = byCourse.get(course);
        if (data.title) rec.title = data.title;
        if (data.badge) rec.badge = data.badge;
        rec.games[type] = { exists: true, items: itemCount(type, data), findings: lintGame(type, data) };
    }
}

// ---- Assemble the snapshot ------------------------------------------------
const courses = [...byCourse.keys()].sort().map(course => {
    const rec = byCourse.get(course);
    const games = {};
    let coverage = 0;
    for (const type of ENGINES) {
        if (rec.games[type]) { games[type] = rec.games[type]; coverage++; }
        else games[type] = { exists: false, items: 0, findings: [] };
    }
    return { course, title: rec.title, badge: rec.badge, coverage, games };
});

const summary = { error: 0, warn: 0, info: 0 };
let totalGames = 0, coverageComplete = 0;
for (const c of courses) {
    if (c.coverage === ENGINES.length) coverageComplete++;
    for (const type of ENGINES) {
        const g = c.games[type];
        if (!g.exists) continue;
        totalGames++;
        const t = tally(g.findings);
        summary.error += t.error; summary.warn += t.warn; summary.info += t.info;
    }
}

const snapshot = {
    generated: 'reviewgames-health.mjs',
    generatedAt: new Date().toISOString(),
    engines: ENGINES,
    summary: {
        courses: courses.length,
        games: totalGames,
        coverageComplete,
        findings: summary,
    },
    courses,
};

fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
console.log('reviewgames-health -> ' + path.relative(process.cwd(), OUT));
console.log('  ' + courses.length + ' courses, ' + totalGames + ' games, coverage-complete ' + coverageComplete);
console.log('  findings: ' + summary.error + ' error / ' + summary.warn + ' warn / ' + summary.info + ' info');
