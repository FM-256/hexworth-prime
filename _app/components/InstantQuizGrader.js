/**
 * InstantQuizGrader — server-graded quizzes that keep INSTANT per-question feedback.
 *
 * WHY A THIRD SHUFFLE MECHANISM EXISTS (rationale, per this project's design-note convention —
 * see _docs/operations/instant-quiz-grader-design-2026-07-31.md):
 *
 *   QuizEngine.js         server-graded + Fisher-Yates, but grades in ONE full call at the end.
 *                         Feedback is a review screen. Migrating an instant-feedback quiz to it
 *                         changes the pedagogy.
 *   InlineQuizShuffler.js index-based Fisher-Yates for client-graded inline quizzes. It THROWS
 *                         on any document containing `gradeQuiz(` or `serverGrading: true`
 *                         (:101) — deliberately, because shuffling a display whose key lives on
 *                         the server desynchronises them. Do NOT include it on a page that calls
 *                         gradeQuiz; it will take the quiz down at load.
 *   InstantQuizGrader     this file: server-held key AND per-question feedback, via gradeQuiz's
 *                         `partial: true` mode. Fills the gap the other two leave.
 *
 * THE INVARIANT EVERYTHING DEPENDS ON: the student sees a SHUFFLED option order; the server only
 * ever knows ORIGINAL indices. Every crossing of that boundary goes through the permutation:
 *     display -> original :  perm[displayIndex]
 *     original -> display :  perm.indexOf(originalIndex)
 * If those ever disagree, every student is graded wrong — far worse than the leak this replaces.
 * That is what the harness exists to prove.
 *
 * Remap is INDEX-based, not text-based. QuizEngine matches by option text
 * (`_originalOptions.indexOf(selectedText)`), which collides when two options share text — and
 * these quizzes do have short duplicate-prone options. An index permutation cannot collide.
 *
 * The permutation is built ONCE PER QUESTION and cached. Re-rendering the same question must
 * reuse it, or a student who returns to a question sees options move under them and the stored
 * answer points at the wrong option.
 */
(function (root) {
    'use strict';

    /**
     * Resolve the FirebaseAuth singleton.
     *
     * FirebaseAuth.js:9 declares `const FirebaseAuth = (function(){...})()` at the top level of
     * a classic script. A top-level `const` creates a binding in the global LEXICAL environment
     * and does NOT become a property of window — so `window.FirebaseAuth` is undefined in
     * production even though the bare identifier resolves fine. Reading it off `root` made every
     * gradeOne() throw, get swallowed by its own .catch, and render "Could not verify" on all 15
     * questions. Caught by the render probe, which is why it drives the real page.
     *
     * The bare identifier is resolved through the IIFE's scope chain. window is a fallback so a
     * test can inject a stub when no real one is loaded.
     */
    function fbAuth() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth) return FirebaseAuth;
        if (root && root.FirebaseAuth) return root.FirebaseAuth;
        throw new Error('InstantQuizGrader: FirebaseAuth is not loaded on this page');
    }

    function shuffledPermutation(n) {
        // Fisher-Yates over indices. Same algorithm as InlineQuizShuffler (which is
        // Nancy-reviewed with a 1000-trial distribution test); copied rather than imported,
        // because that file refuses to load on a gradeQuiz page by design.
        var perm = [];
        for (var i = 0; i < n; i++) perm.push(i);
        for (var j = perm.length - 1; j > 0; j--) {
            var k = Math.floor(Math.random() * (j + 1));
            var t = perm[j]; perm[j] = perm[k]; perm[k] = t;
        }
        return perm;
    }

    function create(config) {
        if (!config || !config.quizId) throw new Error('InstantQuizGrader: quizId required');
        var quizId = config.quizId;
        var questions = config.questions || [];
        var perms = {};   // questionIndex -> permutation, built once and cached

        function permFor(qIndex) {
            if (!perms[qIndex]) {
                var opts = (questions[qIndex] && questions[qIndex].opts) || [];
                perms[qIndex] = shuffledPermutation(opts.length);
            }
            return perms[qIndex];
        }

        return {
            /** Options in the order the STUDENT should see them. */
            displayOptions: function (qIndex) {
                var q = questions[qIndex] || {};
                var perm = permFor(qIndex);
                return perm.map(function (orig) { return (q.opts || [])[orig]; });
            },

            /** display index -> original index (what the server must receive). */
            toOriginal: function (qIndex, displayIndex) {
                return permFor(qIndex)[displayIndex];
            },

            /** original index -> display index (to highlight the server's correct answer). */
            toDisplay: function (qIndex, originalIndex) {
                return permFor(qIndex).indexOf(originalIndex);
            },

            /** Exposed for the harness only — asserting the permutation is stable per question. */
            _perm: permFor,

            /**
             * Grade ONE question. Returns { correct, correctDisplayIndex, explanation } or null
             * when the call fails.
             *
             * Requires the quiz_keys doc to carry `revealToAll: true`. Without it gradeQuiz
             * reveals nothing on a partial call — a partial submits 1 of N so it scores ~7% and
             * never satisfies `passed`, and `revealForReview` is !isPartial-guarded. The feedback
             * box would silently render empty on every question.
             */
            gradeOne: function (qIndex, displayIndex) {
                var answers = {};
                answers[String(qIndex)] = this.toOriginal(qIndex, displayIndex);
                var self = this;
                return fbAuth().callFunction('gradeQuiz', { quizId: quizId, answers: answers, partial: true })
                    .then(function (res) {
                        var data = (res && res.data) ? res.data : res;
                        var r = (data && data.results) ? data.results[qIndex] : null;
                        if (!r) return null;
                        return {
                            correct: !!r.correct,
                            correctDisplayIndex: (typeof r.correctAnswer === 'number')
                                ? self.toDisplay(qIndex, r.correctAnswer) : -1,
                            explanation: r.explanation || ''
                        };
                    })
                    .catch(function () { return null; });   // caller must render an honest "couldn't verify" state
            },

            /** Final submission: full (non-partial) call, records the attempt and returns the score. */
            gradeAll: function (displayAnswers) {
                var answers = {};
                for (var i = 0; i < questions.length; i++) {
                    if (displayAnswers[i] === undefined || displayAnswers[i] === null) continue;
                    answers[String(i)] = this.toOriginal(i, displayAnswers[i]);
                }
                return fbAuth().callFunction('gradeQuiz', { quizId: quizId, answers: answers })
                    .then(function (res) { return (res && res.data) ? res.data : res; });
            }
        };
    }

    root.InstantQuizGrader = { create: create, _shuffledPermutation: shuffledPermutation };
})(typeof window !== 'undefined' ? window : this);
