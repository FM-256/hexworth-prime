// Harness for InstantQuizGrader. Proves the display<->original permutation cannot desync.
//
// WHY THIS IS THE LOAD-BEARING TEST: the student sees shuffled options; the server only knows
// original indices. If those disagree by even one position, EVERY student is graded wrong —
// worse than the answer-key leak this change replaces.
//
// Ends with an ABLATION: it deliberately breaks the remap and requires the assertions to FAIL.
// A harness that passes against broken code proves nothing — that happened earlier today with
// a grep test that passed against a deliberately ablated engine.
//
// usage: node _tools/instant-quiz-grader-test.js
const vm = require('vm');
const fs = require('fs');
const path = require('path');

function load(ablate) {
    let src = fs.readFileSync(path.resolve(__dirname, '../_app/components/InstantQuizGrader.js'), 'utf8');
    if (ablate) {
        // Off-by-one on the display->original crossing: the exact failure this harness exists for.
        src = src.replace(
            'return permFor(qIndex)[displayIndex];',
            'return permFor(qIndex)[(displayIndex + 1) % permFor(qIndex).length];'
        );
    }
    const ctx = vm.createContext({ window: {}, Math, console });
    vm.runInContext(src, ctx);
    return ctx.window.InstantQuizGrader;
}

const QUESTIONS = [
    { q: 'q0', opts: ['A', 'B', 'C', 'D'] },
    { q: 'q1', opts: ['W', 'X', 'Y', 'Z'] },
    { q: 'q2', opts: ['1', '2', '2', '3'] },   // DUPLICATE text on purpose: a text-based remap
    { q: 'q3', opts: ['same', 'same', 'other'] }, // collides here; an index permutation must not
];

function run(IQG, label) {
    const fails = [];
    for (let seed = 0; seed < 200; seed++) {
        const g = IQG.create({ quizId: 'test', questions: QUESTIONS });
        for (let qi = 0; qi < QUESTIONS.length; qi++) {
            const shown = g.displayOptions(qi);
            const opts = QUESTIONS[qi].opts;

            // 1. shuffle is a PERMUTATION: same multiset, nothing lost or duplicated
            if ([...shown].sort().join('|') !== [...opts].sort().join('|')) {
                fails.push(`seed${seed} q${qi}: displayOptions is not a permutation`);
            }
            // 2. round trip: what the student clicked is what the server is told
            for (let d = 0; d < shown.length; d++) {
                const orig = g.toOriginal(qi, d);
                if (opts[orig] !== shown[d]) {
                    fails.push(`seed${seed} q${qi} d${d}: submitted original ${orig} ("${opts[orig]}") != clicked "${shown[d]}"`);
                }
                // 3. reverse map: server's original index highlights the right ROW
                if (g.toDisplay(qi, orig) !== d) {
                    fails.push(`seed${seed} q${qi} d${d}: toDisplay(toOriginal(d)) != d`);
                }
            }
            // 4. permutation is CACHED per question, not regenerated per render
            const a = g.displayOptions(qi).join('|');
            const b = g.displayOptions(qi).join('|');
            if (a !== b) fails.push(`seed${seed} q${qi}: re-render regenerated the permutation`);
        }
    }
    return fails;
}

const IQG = load(false);
const fails = run(IQG, 'normal');
console.log(`normal build : ${fails.length ? fails.length + ' FAILURES' : 'PASS'} (200 seeds x 4 questions)`);
fails.slice(0, 5).forEach(f => console.log('   ' + f));

const IQGa = load(true);
const failsA = run(IQGa, 'ablated');
console.log(`ABLATED build: ${failsA.length ? failsA.length + ' failures (EXPECTED)' : 'PASS  <-- HARNESS IS A FALSE ORACLE'}`);

// Distribution check: every option must reach every position across many shuffles, or the
// "shuffle defeats always-pick-B" claim is not actually true.
const g = IQG.create({ quizId: 'test', questions: QUESTIONS });
const counts = [0, 0, 0, 0];
for (let i = 0; i < 4000; i++) {
    const gg = IQG.create({ quizId: 't', questions: QUESTIONS });
    counts[gg.toOriginal(0, 0)]++;   // which ORIGINAL option lands in display slot 0
}
const pct = counts.map(c => Math.round(100 * c / 4000));
console.log(`distribution : original option in display-slot-0 across 4000 shuffles = ${pct.join('% / ')}%  (want ~25 each)`);
const skewed = pct.some(p => p < 20 || p > 30);

const ok = fails.length === 0 && failsA.length > 0 && !skewed;
console.log(ok ? '\nALL PASSED — remap is sound, harness proven able to fail, shuffle is uniform'
               : '\nFAILED');
process.exit(ok ? 0 : 1);
