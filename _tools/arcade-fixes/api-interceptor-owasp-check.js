#!/usr/bin/env node
/**
 * api-interceptor-owasp-check.js
 *
 * Self-verification harness for _app/houses/web/reviews/web-api-interceptor.html
 *
 * What it does:
 *   1. Reads the HTML file.
 *   2. Extracts the inline <script> block and new Function()-parses it (syntax check,
 *      same technique the browser uses — if this throws, the page is broken).
 *   3. Extracts just the `const rounds = [ ... ];` array literal and evaluates it in
 *      isolation via new Function() to get real JS objects (no eval() of the whole
 *      script, no DOM access needed).
 *   4. For each of the 10 rounds prints:
 *        - a one-line scenario summary (method + URL, derived from the round's own
 *          request data — not hand-typed, so it can't drift from the actual scenario)
 *        - the OWASP category the game NOW asserts (round.owaspReference)
 *        - an internal-consistency check: does round.correctAnswer actually appear in
 *          round.vulnerabilities (the MCQ options), and does round.explanation embed
 *          any "APIx" OWASP token that CONTRADICTS the one(s) named in owaspReference.
 *   5. Exits non-zero if any round fails a hard check (missing correctAnswer from
 *      options, or a contradicting APIx token in the explanation).
 *
 * This does not judge whether the OWASP mapping is factually correct — that verification
 * was done by hand against the live owasp.org API Security Top 10 2023 pages (see the
 * chat transcript / commit message for the citations). This script only confirms the
 * file parses and that each round is internally self-consistent after the edits.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '../../_app/houses/web/reviews/web-api-interceptor.html');

function fail(msg) {
    console.error(`FAIL: ${msg}`);
    process.exitCode = 1;
}

const html = fs.readFileSync(FILE, 'utf8');

// ---------------------------------------------------------------------------
// Step 1: pull out the inline <script> that is NOT a src= reference, and that
// contains the game logic (identified by "const rounds =").
// ---------------------------------------------------------------------------
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const gameScript = scriptMatches.find(s => s.includes('const rounds ='));

if (!gameScript) {
    fail('Could not locate the inline <script> containing "const rounds =" in the file.');
    process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 2: new Function()-parse the WHOLE inline script for a syntax check.
// We don't execute DOM calls (there is no DOM here), we only need the parser
// to accept it without throwing a SyntaxError. Wrapping in a function body is
// enough to force a full parse without running document.* calls at the top
// level (they're all inside function declarations, which are safe to define
// without calling).
// ---------------------------------------------------------------------------
try {
    new Function(gameScript);
    console.log('PARSE OK: inline <script> block parses with new Function() (no SyntaxError).');
} catch (e) {
    fail(`inline <script> failed to parse: ${e.message}`);
    process.exit(1);
}

// ---------------------------------------------------------------------------
// Step 3: extract JUST the rounds array literal and evaluate it in isolation.
// ---------------------------------------------------------------------------
const roundsMatch = gameScript.match(/const rounds = (\[[\s\S]*?\n {8}\]);/);
if (!roundsMatch) {
    fail('Could not extract "const rounds = [ ... ];" array literal via regex.');
    process.exit(1);
}

let rounds;
try {
    rounds = new Function(`return ${roundsMatch[1]};`)();
} catch (e) {
    fail(`rounds array literal failed to evaluate: ${e.message}`);
    process.exit(1);
}

if (!Array.isArray(rounds) || rounds.length !== 10) {
    fail(`Expected 10 rounds, got ${Array.isArray(rounds) ? rounds.length : typeof rounds}.`);
    process.exit(1);
}

console.log(`PARSE OK: extracted ${rounds.length} rounds from the array literal.\n`);

// ---------------------------------------------------------------------------
// Step 4: per-round report + internal-consistency assertions.
// ---------------------------------------------------------------------------
function summarize(round, idx) {
    const req = round.request;
    const res = round.response;
    return `${req.method} ${req.url}  ->  ${res.status}`;
}

function apiTokens(str) {
    // Matches "API1", "API10", etc. (word-boundary safe against "API1" vs "API10")
    const found = [...str.matchAll(/API(\d{1,2})/g)].map(m => Number(m[1]));
    return [...new Set(found)];
}

const NEGATION_RE = /\bnot\b|\bisn't\b|\bdoesn't\b|\bdoes not\b|\bno\b|\brather than\b|\binstead of\b/i;

// Check 2 is sentence-aware: an explanation is allowed to NAME an off-citation
// APIx category as an explicit, negated contrast (e.g. "API4 ... is not about
// login brute force" to explain why a plausible distractor is wrong). That is
// pedagogically useful and not a contradiction. What IS a contradiction is an
// APIx token appearing with no negation nearby - i.e. the explanation silently
// asserting a different official category than the one actually cited.
function findContradictions(explanation, refTokens) {
    const sentences = explanation.split(/(?<=[.!?])\s+/);
    const contradictions = [];
    sentences.forEach(sentence => {
        const tokens = apiTokens(sentence);
        const off = tokens.filter(t => !refTokens.includes(t));
        if (off.length === 0) return;
        if (NEGATION_RE.test(sentence)) return; // explicit, negated contrast - OK
        contradictions.push(...off);
    });
    return [...new Set(contradictions)];
}

let hardFailures = 0;
const report = [];

rounds.forEach((round, idx) => {
    const n = idx + 1;
    const scenario = summarize(round, idx);
    const category = round.owaspReference;

    // Check 1: correctAnswer must be one of the offered options.
    const optionsOk = Array.isArray(round.vulnerabilities) && round.vulnerabilities.includes(round.correctAnswer);
    if (!optionsOk) {
        fail(`Round ${n}: correctAnswer "${round.correctAnswer}" is not present in vulnerabilities options.`);
        hardFailures++;
    }

    // Check 2: any APIx token embedded in the explanation must not CONTRADICT
    // the APIx token(s) named in owaspReference (i.e. explanation shouldn't
    // silently assert a different official category number than the citation)
    // unless it's an explicit negated contrast (see findContradictions above).
    const refTokens = apiTokens(category);
    const contradiction = findContradictions(round.explanation, refTokens);
    const consistent = contradiction.length === 0;
    if (!consistent) {
        fail(`Round ${n}: explanation references API${contradiction.join(', API')} which is not named in owaspReference ("${category}") and is not clearly negated as a contrast.`);
        hardFailures++;
    }

    report.push({
        round: n,
        scenario,
        correctAnswer: round.correctAnswer,
        category,
        optionsOk,
        consistent
    });
});

// ---------------------------------------------------------------------------
// Step 5: print the table.
// ---------------------------------------------------------------------------
console.log('='.repeat(100));
console.log('ROUND-BY-ROUND REPORT (post-fix)');
console.log('='.repeat(100));
report.forEach(r => {
    console.log(`\nRound ${r.round}: ${r.scenario}`);
    console.log(`  Correct answer (MCQ label): ${r.correctAnswer}`);
    console.log(`  OWASP category asserted:    ${r.category}`);
    console.log(`  Options contain correctAnswer: ${r.optionsOk ? 'OK' : 'FAIL'}`);
    console.log(`  Explanation/citation consistent: ${r.consistent ? 'OK' : 'FAIL'}`);
});

console.log('\n' + '='.repeat(100));
if (hardFailures === 0) {
    console.log(`ALL CHECKS PASSED — ${rounds.length}/${rounds.length} rounds internally consistent.`);
} else {
    console.log(`${hardFailures} HARD FAILURE(S) — see FAIL lines above.`);
}
console.log('='.repeat(100));

process.exit(hardFailures === 0 ? 0 : 1);
