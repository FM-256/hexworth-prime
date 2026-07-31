// Rewrites the 4 OpenStack quizzes to grade server-side with shuffled options.
// BUG-065 (answer key shipped in page source) + BUG-067 (fixed option order, always-pick-B passes).
//
// Applied as a script, not 4 hand-edits, because the 4 files carry the SAME logic block modulo
// whitespace, and a hand-edit that diverges on one file is exactly the kind of silent per-file
// drift that gets shipped. Per-file values (STORE_KEY, result messages, ModuleProgress id) are
// extracted from the file and carried through, never retyped.
//
// DEFAULTS TO DRY RUN. --apply writes. Archives originals first (we do not destroy).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const APPLY = process.argv.includes('--apply');
const DIR = path.resolve(__dirname, '../_app/houses/cloud/openstack/quizzes');
const ARCHIVE = path.resolve(__dirname, '../_archive/openstack-quizzes-pre-server-grading-2026-07-31');

const FILES = [
  { file: 'cloud-openstack-intro-quiz.quiz.html', id: 'cloud-openstack-intro-quiz' },
  { file: 'cloud-openstack-install-quiz.quiz.html', id: 'cloud-openstack-install-quiz' },
  { file: 'cloud-openstack-operation-quiz.quiz.html', id: 'cloud-openstack-operation-quiz' },
  { file: 'cloud-openstack-projects-quiz.quiz.html', id: 'cloud-openstack-projects-quiz' },
];

// Balanced, string-aware bracket scan. A regex over these hand-authored literals (em-dashes,
// apostrophes, brackets inside explanation prose) mis-splits silently.
function sliceBalanced(src, marker, oc, cc) {
  const start = src.indexOf(marker);
  if (start === -1) return null;
  const open = src.indexOf(oc, start);
  if (open === -1) return null;
  let depth = 0, inStr = null, esc = false;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (inStr) { if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === oc) depth++;
    else if (c === cc) { depth--; if (depth === 0) return { start, open, end: i }; }
  }
  return null;
}
const sliceArray = (src, marker) => sliceBalanced(src, marker, '[', ']');

function newLogic(vals) {
  return `        // ── State ──
        // The answer key is NOT in this page. It lives in Firestore quiz_keys/${vals.id} and is
        // checked by the gradeQuiz Cloud Function (BUG-065 — this quiz used to ship its own key
        // in page source). Option order is shuffled per student (BUG-067 — the order was fixed,
        // so clicking B every time passed). InstantQuizGrader owns the display<->original remap;
        // if that remap is ever wrong, every student is graded wrong, so it has its own harness:
        // _tools/instant-quiz-grader-test.js. Design note:
        // _docs/operations/instant-quiz-grader-design-2026-07-31.md
        let currentQ   = 0;
        let score      = 0;
        let selected   = null;    // DISPLAY index of the student's pick — never an original index
        let answered   = [];
        let picks      = [];      // display index per question, for the final full submission
        let shown      = [];      // options of the current question, in display order
        let grader     = null;
        let grading    = false;   // a verdict is in flight; ignore clicks until it lands
        let failStreak = 0;       // consecutive grading failures on the CURRENT question
        let ungraded   = [];      // question numbers the server never managed to grade
        // Matches the button's markup label. Set via textContent, so the arrow is the decoded
        // character, not the &rarr; entity — textContent does not decode entities.
        const NEXT_LABEL = 'Next Question \\u2192';
        const PASS_PCT  = ${vals.passPct};
        const STORE_KEY = ${vals.storeKey};
        const QUIZ_ID   = '${vals.id}';

        async function startQuiz() {
            // gradeQuiz rejects an unauthenticated caller. Check BEFORE question 1 — otherwise a
            // signed-out student answers all ${vals.count} and every one comes back unverifiable.
            let user = null;
            try { user = await FirebaseAuth.waitForAuth(); } catch (e) { user = null; }
            if (!user) { document.getElementById('signInNotice').style.display = 'block'; return; }
            document.getElementById('signInNotice').style.display = 'none';

            currentQ = 0;
            score    = 0;
            selected = null;
            answered = [];
            picks    = [];
            grading  = false;
            failStreak = 0;
            ungraded   = [];
            grader   = InstantQuizGrader.create({ quizId: QUIZ_ID, questions: questions });
            document.getElementById('startScreen').style.display = 'none';
            document.getElementById('quizScreen').style.display  = 'block';
            renderQuestion();
        }

        function renderQuestion() {
            const q = questions[currentQ];
            document.getElementById('questionNum').textContent  = \`Question \${currentQ + 1} of \${questions.length}\`;
            document.getElementById('qLabel').textContent       = \`Question \${currentQ + 1} of \${questions.length}\`;
            document.getElementById('qScore').textContent       = \`Score: \${score}\`;
            document.getElementById('questionText').textContent = q.q;

            // Progress fill
            const pct = ((currentQ + 1) / questions.length) * 100;
            document.getElementById('progressFill').style.width = pct + '%';

            // Build options IN DISPLAY ORDER. Everything below indexes the shuffled order; the
            // original order only ever exists inside the grader.
            shown = grader.displayOptions(currentQ);
            const wrap = document.getElementById('optionsWrap');
            wrap.innerHTML = '';
            shown.forEach((opt, i) => {
                const div = document.createElement('div');
                div.className = 'option';
                div.innerHTML = \`<span class="opt-label">\${String.fromCharCode(65 + i)}.</span><span>\${opt}</span>\`;
                div.addEventListener('click', () => selectOpt(i));
                wrap.appendChild(div);
            });

            // Reset feedback and buttons
            const fb = document.getElementById('feedback');
            fb.className = 'feedback';
            document.getElementById('submitBtn').disabled      = true;
            document.getElementById('submitBtn').style.display = 'inline-block';
            // Reset the Next button's LABEL and skip flag too, not just its visibility — the
            // skip affordance below relabels it, and a stale label would leak onto every later
            // question and mislabel a normal Next as an ungraded skip.
            const nb = document.getElementById('nextBtn');
            nb.style.display = 'none';
            nb.textContent   = NEXT_LABEL;
            delete nb.dataset.skip;
            selected   = null;
            failStreak = 0;
        }

        function selectOpt(idx) {
            // Prevent changing answer after submission, or while a verdict is in flight —
            // otherwise the answer that comes back gets applied to a different option.
            if (grading) return;
            if (document.getElementById('submitBtn').style.display === 'none') return;
            const opts = document.querySelectorAll('.option');
            opts.forEach(o => o.classList.remove('selected'));
            opts[idx].classList.add('selected');
            selected = idx;
            document.getElementById('submitBtn').disabled = false;
        }

        async function submitAnswer() {
            if (selected === null || grading) return;
            const q    = questions[currentQ];
            const opts = document.querySelectorAll('.option');
            const submitBtn = document.getElementById('submitBtn');
            const fb   = document.getElementById('feedback');

            // Grading is a network round trip. Lock input and say so.
            grading = true;
            opts.forEach(o => o.classList.add('disabled'));
            submitBtn.disabled = true;
            fb.className = 'feedback show';
            document.getElementById('fbTitle').textContent = 'Checking your answer\\u2026';
            document.getElementById('fbBody').textContent  = '';

            const v = await grader.gradeOne(currentQ, selected);
            grading = false;

            if (!v) {
                // Honest failure. Do NOT score an answer we could not verify — a silent miscount
                // is worse than an error message. Unlock and let the student submit again.
                //
                // After two failed attempts, offer a way FORWARD. Retry-only would strand a
                // student behind a dead network on question 3 with no path to the end — a way to
                // make the quiz un-completable that did not exist when grading was local. The
                // skipped question is recorded as ungraded and surfaced on the results screen,
                // never quietly folded into the score.
                failStreak++;
                opts.forEach(o => o.classList.remove('disabled'));
                submitBtn.disabled = false;
                fb.className = 'feedback show incorrect';
                document.getElementById('fbTitle').textContent = 'Could not verify your answer';
                document.getElementById('fbBody').textContent  = failStreak >= 2
                    ? 'Still cannot reach the grading service. This answer has not been counted either way. Press Submit to try again, or continue — the question will be reported as not graded.'
                    : 'This answer was not graded, so it has not been counted either way. Check your connection and press Submit again.';
                if (failStreak >= 2) {
                    const nb = document.getElementById('nextBtn');
                    nb.style.display = 'inline-block';
                    nb.textContent = 'Continue without grading this question';
                    nb.dataset.skip = '1';
                }
                return;
            }
            failStreak = 0;

            if (v.correct) score++;
            if (v.correctDisplayIndex >= 0) opts[v.correctDisplayIndex].classList.add('correct');
            if (!v.correct) opts[selected].classList.add('incorrect');

            fb.className = \`feedback show \${v.correct ? 'correct' : 'incorrect'}\`;
            document.getElementById('fbTitle').textContent = v.correct ? 'Correct!' : 'Incorrect';
            document.getElementById('fbBody').textContent  = v.explanation || '';

            // Record in DISPLAY terms — what the student actually saw on screen.
            picks[currentQ] = selected;
            answered.push({
                q:       q.q,
                yours:   shown[selected],
                correct: v.correctDisplayIndex >= 0 ? shown[v.correctDisplayIndex] : '',
                isOk:    v.correct
            });

            submitBtn.style.display = 'none';
            document.getElementById('nextBtn').style.display   = 'inline-block';
        }

        function nextQuestion() {
            // Arriving here with the skip flag means the grading service never answered for this
            // question. Record it as UNGRADED and show it as such in the review — it is not a
            // wrong answer, and pretending otherwise would misreport the student's work.
            const nb = document.getElementById('nextBtn');
            if (nb.dataset.skip) {
                ungraded.push(currentQ + 1);
                answered.push({
                    q:        questions[currentQ].q,
                    yours:    selected !== null ? shown[selected] : '(no answer submitted)',
                    correct:  '',
                    isOk:     false,
                    notGraded: true
                });
            }
            selected = null;
            currentQ++;
            if (currentQ < questions.length) {
                renderQuestion();
            } else {
                showResults();
            }
        }

        async function showResults() {
            document.getElementById('quizScreen').style.display = 'none';
            const rs = document.getElementById('resultsScreen');
            rs.classList.add('show');

            // An INCOMPLETE run is never scored or recorded.
            //
            // gradeQuiz always computes total = answerKey.length (all 15). A question the
            // service could not grade is simply absent from the answers object, so the server
            // scores it isCorrect:false and it drags the percentage down exactly as if the
            // student had got it wrong — which could tip a pass into a fail. Submitting anyway
            // and calling the result "not counted" would be a lie told by the score itself.
            //
            // So: if anything went ungraded, do not submit, do not record an attempt, do not
            // award progress. Show the student what they got on the questions that WERE graded,
            // say plainly that it is not a recorded score, and let them retake.
            const graded = questions.length - ungraded.length;
            const incomplete = ungraded.length > 0;
            let pct = graded > 0 ? Math.round((score / graded) * 100) : 0;
            if (!incomplete) {
                try {
                    const res = await grader.gradeAll(picks);
                    if (res && typeof res.percentage === 'number') pct = res.percentage;
                } catch (e) { /* keep the tally, which came from server verdicts anyway */ }
            }
            const passed = !incomplete && pct >= PASS_PCT;

            // Score ring (CSS conic gradient needs the percentage as a custom property)
            const ring = document.getElementById('scoreRing');
            ring.style.setProperty('--pct', pct + '%');
            document.getElementById('scorePct').textContent  = pct + '%';
            document.getElementById('statCorrect').textContent = score;
            // Wrong means answered-and-wrong. An ungraded question is neither correct nor wrong,
            // so it must not inflate this count.
            document.getElementById('statWrong').textContent   = graded - score;
            document.getElementById('statPct').textContent     = pct + '%';

            const badge = document.getElementById('passBadge');
            badge.textContent = passed ? 'PASSED' : 'NOT PASSED';
            badge.className   = \`pass-badge \${passed ? 'pass' : 'fail'}\`;

            const msgs = ${vals.msgs};
            const msgKey = pct === 100 ? 'perfect' : pct >= 85 ? 'high' : passed ? 'pass' : 'fail';
            // Say plainly when part of the quiz could not be graded, rather than presenting a
            // score that quietly treats unreachable-server questions as wrong answers.
            document.getElementById('resultMsg').textContent = incomplete
                ? \`This attempt is incomplete and has NOT been recorded. Question\${ungraded.length > 1 ? 's' : ''} \${ungraded.join(', ')} could not be graded because the grading service was unreachable. The figure below is only how you did on the \${graded} question\${graded === 1 ? '' : 's'} that were graded — it is not a quiz score and it does not count toward your progress. Retake the quiz when your connection is stable.\`
                : msgs[msgKey];

            // Build review list. Texts come from the display order the student saw, with the
            // correct option mapped back through the permutation by the grader.
            const rw = document.getElementById('reviewWrap');
            rw.innerHTML = '';
            answered.forEach((a, i) => {
                const d = document.createElement('div');
                // An ungraded question gets neither the green nor the red treatment — styling it
                // 'incorrect' would tell the student they got it wrong, which is not known.
                d.className = 'review-item' + (a.notGraded ? '' : (a.isOk ? ' correct' : ' incorrect'));
                d.innerHTML = \`
                    <div class="review-q"><strong>Q\${i + 1}:</strong> \${a.q}</div>
                    <div class="review-a">
                        <strong>Your answer:</strong> \${a.yours}<br>
                        \${a.notGraded ? '<strong>Not graded</strong> — the grading service was unreachable for this question.' : ''}
                        \${!a.isOk && a.correct ? \`<strong>Correct answer:</strong> \${a.correct}\` : ''}
                    </div>\`;
                rw.appendChild(d);
            });

            // Persist score to localStorage — but not for an incomplete run, or the hub would
            // read back a score the student was just told does not count.
            try {
                if (!incomplete) {
                    localStorage.setItem(STORE_KEY + '_score',   pct);
                    localStorage.setItem(STORE_KEY + '_answers', JSON.stringify(answered));
                    localStorage.setItem(STORE_KEY + '_passed',  passed ? '1' : '0');
                }
            } catch(e) { /* storage unavailable */ }

            // Notify progress system if available — but NEVER for an incomplete run. pct is
            // computed over graded questions only, so recording it would credit a student with
            // a score they did not complete (13 of 13 graded reads as 100%).
            if (!incomplete && typeof ModuleProgress !== 'undefined') {
                ModuleProgress.completeQuiz('cloud', '${vals.mpId}', pct, {
                    maxScore: 100,
                    showNotification: true
                });
            }
        }

`;
}

const SIGN_IN_NOTICE = `                <div id="signInNotice" style="display:none;margin-top:18px;padding:16px 20px;border-radius:10px;background:rgba(255,71,87,0.08);border:1px solid rgba(255,71,87,0.35);color:#fca5a5;line-height:1.6;">
                    <strong>Sign in to take this quiz.</strong><br>
                    Answers are checked on the server so the key is never exposed in this page. That
                    requires a signed-in account, and it is also what lets your score count toward
                    your progress. Sign in, then press Begin Quiz again.
                </div>
`;

let changed = 0, problems = 0;
for (const f of FILES) {
  const p = path.join(DIR, f.file);
  let src = fs.readFileSync(p, 'utf8');
  const before = src;
  const note = [];

  // ── 1. Strip the answer key out of the questions array ──
  const qs = sliceArray(src, 'const questions = [');
  if (!qs) { console.error(`${f.file}: cannot locate questions array`); problems++; continue; }
  const arr = vm.runInNewContext('(' + src.slice(qs.open, qs.end + 1) + ')');
  const bad = arr.filter((x) => typeof x.correct !== 'number' || !x.q || !(x.opts || []).length);
  if (bad.length) { console.error(`${f.file}: ${bad.length} malformed question(s)`); problems++; continue; }
  const stripped = '[\n' + arr.map((x) =>
    '            {\n                q: ' + JSON.stringify(x.q) + ',\n' +
    '                opts: [\n' + x.opts.map((o) => '                    ' + JSON.stringify(o)).join(',\n') + '\n                ]\n' +
    '            }'
  ).join(',\n') + '\n        ]';
  src = src.slice(0, qs.open) + stripped + src.slice(qs.end + 1);
  note.push(`stripped ${arr.length} correct: fields + ${arr.filter(x => x.explanation).length} explanations`);

  // The comment above the array documented the old client-side key; it is now wrong.
  src = src.replace(
    /        \/\/ ── Question bank[^\n]*\n(        \/\/[^\n]*\n)*/,
    '        // ── Question bank ──\n' +
    '        // Question text and options ONLY. The correct answers and explanations are held in\n' +
    '        // Firestore quiz_keys/' + f.id + ' and returned by gradeQuiz after each\n' +
    '        // submission — they are deliberately absent from this page (BUG-065).\n'
  );

  // ── 2. Swap the logic block ──
  const logicStart = src.indexOf('        // ── State ──');
  const logicEnd = src.indexOf('        function retakeQuiz() {');
  if (logicStart === -1 || logicEnd === -1 || logicEnd < logicStart) {
    console.error(`${f.file}: cannot locate logic block`); problems++; continue;
  }
  const oldBlock = src.slice(logicStart, logicEnd);
  const storeKey = (oldBlock.match(/const STORE_KEY\s*=\s*('[^']*')/) || [])[1];
  const passPct = (oldBlock.match(/const PASS_PCT\s*=\s*(\d+)/) || [])[1];
  const mpId = (oldBlock.match(/completeQuiz\('cloud',\s*'([^']+)'/) || [])[1];
  // Balanced scan, not a regex — the four files indent this object differently and the result
  // messages contain apostrophes and braces-adjacent prose.
  // The object is named `msgs` in one file and `msgMap` in the other three.
  const ms = sliceBalanced(oldBlock, 'const msgs = ', '{', '}')
          || sliceBalanced(oldBlock, 'const msgMap = ', '{', '}');
  if (!storeKey || !passPct || !mpId || !ms) {
    console.error(`${f.file}: could not extract per-file values (storeKey=${!!storeKey} passPct=${!!passPct} mpId=${!!mpId} msgs=${!!ms})`);
    problems++; continue;
  }
  const msgs = oldBlock.slice(ms.open, ms.end + 1);
  // Parse it: proves we extracted a real object with all four keys, not a truncated string.
  const parsed = vm.runInNewContext('(' + msgs + ')');
  for (const k of ['perfect', 'high', 'pass', 'fail']) {
    if (!parsed[k]) { console.error(`${f.file}: msgs missing '${k}'`); problems++; }
  }
  src = src.slice(0, logicStart) + newLogic({
    id: f.id, storeKey, passPct, mpId, msgs, count: arr.length,
  }) + src.slice(logicEnd);
  note.push(`logic block swapped (STORE_KEY=${storeKey}, mpId=${mpId})`);

  // ── 3. Script includes ──
  if (!src.includes('components/FirebaseAuth.js')) {
    src = src.replace(
      '    <script src="../../../../components/ModuleProgress.js"></script>',
      '    <script src="../../../../components/ModuleProgress.js"></script>\n' +
      '    <script src="../../../../components/FirebaseAuth.js"></script>\n' +
      '    <script src="../../../../components/InstantQuizGrader.js"></script>'
    );
    note.push('added FirebaseAuth + InstantQuizGrader includes');
  }

  // ── 4. Sign-in notice on the start screen ──
  if (!src.includes('id="signInNotice"')) {
    const btn = /(\s*)<button class="btn btn-primary" onclick="startQuiz\(\)">([^<]*)<\/button>/;
    if (!btn.test(src)) { console.error(`${f.file}: no start button to anchor the sign-in notice`); problems++; continue; }
    src = src.replace(btn, (m) => m + '\n' + SIGN_IN_NOTICE.replace(/\n$/, ''));
    note.push('added sign-in notice');
  }

  console.log(`${f.file}`);
  note.forEach((n) => console.log(`   - ${n}`));
  console.log(`   ${before.length} -> ${src.length} bytes`);

  if (APPLY) {
    fs.mkdirSync(ARCHIVE, { recursive: true });
    fs.writeFileSync(path.join(ARCHIVE, f.file), before);   // archive BEFORE overwrite
    fs.writeFileSync(p, src);
    changed++;
  }
}

if (problems) { console.error(`\n${problems} file(s) had problems.`); process.exit(1); }
console.log(APPLY ? `\nWROTE ${changed} files. Originals archived to ${ARCHIVE}`
                  : '\nDRY RUN — pass --apply to write.');
