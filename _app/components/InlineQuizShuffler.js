/**
 * InlineQuizShuffler — Fisher-Yates option shuffle for inline-pattern quizzes.
 *
 * Status: Phase 1 (component only — no quiz integrations yet). See
 * _docs/operations/inline-quiz-shuffler-design-2026-05-09.md for the
 * rationale and integration plan.
 *
 * Bug class addressed: structural cheatability where multiple quizzes
 * happen to share the same answer-position pattern. Bridget audit
 * 2026-05-09 confirmed 4 PIS quizzes (pis-w1/w2/w3/w4) share the
 * pattern [0,0,2,3,2,3,1,0,3,2,1,3,1,0,1] across 60 questions of
 * disjoint subject domains. A student who memorizes W1's positions
 * gets 100% on W2/W3/W4 without reading.
 *
 * Scope: Use ONLY for client-graded inline-pattern quizzes (those
 * that use a custom `var questions = [{q,opts,ans}, ...]` array
 * + custom render function). Do NOT use with QuizEngine quizzes —
 * QuizEngine.js:138-148 already performs Fisher-Yates option shuffle
 * on every render and tracks `_originalIndex`/`_originalOptions` for
 * server-grading mapping. Double-shuffling would not break correctness
 * but is wasteful.
 *
 * Server-graded conflict: This shuffler mutates `question.ans` to a
 * new index after shuffling `question.opts`. If the quiz is server-
 * graded, the gradeQuiz Cloud Function compares the student's chosen
 * index to the Firestore key's answer index — which references the
 * ORIGINAL HTML option order. Mutating `ans` for a server-graded
 * quiz would NOT affect server grading (server grades the chosen
 * index against its own key), but the student would see the option
 * at shuffled position N as "correct" while the server grades it
 * as if at position M. This silent disagreement is dangerous.
 *
 * The runtime guard below throws on any quiz that has `serverGrading`
 * or `gradeQuiz` markers detectable in the calling document. Operators
 * wiring this in must either (a) confirm the quiz is purely client-
 * graded, or (b) accept the thrown error and route to QuizEngine.
 *
 * Type contract:
 *   - `question.opts` MUST be an array (length >= 2 to be useful)
 *   - `question.ans` MUST be a single integer in [0..opts.length-1]
 *   - Multi-select (ans as array), text-match (ans as string), and
 *     boolean (ans as bool) are NOT supported and will throw.
 */

(function (root) {
    'use strict';

    function fisherYates(arr) {
        // Standard unbiased Fisher-Yates. Mutates in place.
        // Math.random is not crypto-secure — sufficient threat model
        // is "students memorize position pattern", not "students
        // reverse-engineer the PRNG."
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
    }

    function shuffleQuestion(question) {
        if (!question || typeof question !== 'object') {
            throw new Error('InlineQuizShuffler: question must be an object');
        }
        if (!Array.isArray(question.opts) || question.opts.length < 2) {
            // Quietly return for degenerate cases; nothing to shuffle.
            return question;
        }
        if (typeof question.ans !== 'number' || !Number.isInteger(question.ans)) {
            throw new Error(
                'InlineQuizShuffler: question.ans must be a single integer ' +
                '(received ' + typeof question.ans + '). Multi-select / text / ' +
                'boolean answers are not supported.'
            );
        }
        if (question.ans < 0 || question.ans >= question.opts.length) {
            throw new Error(
                'InlineQuizShuffler: question.ans (' + question.ans + ') is ' +
                'out of range for opts of length ' + question.opts.length
            );
        }

        var indices = question.opts.map(function (_, i) { return i; });
        fisherYates(indices);
        question.opts = indices.map(function (origIdx) { return question.opts[origIdx]; });
        question.ans = indices.indexOf(question.ans);
        return question;
    }

    function shuffleQuiz(questions) {
        if (!Array.isArray(questions)) {
            throw new Error('InlineQuizShuffler: shuffleQuiz expects an array');
        }
        // Server-graded sniff test: if the calling document has a serverGrading
        // marker or a gradeQuiz callable, refuse to shuffle. This protects
        // operators from accidentally wiring this into a QuizEngine quiz or a
        // server-graded inline quiz where mutating `ans` would silently
        // disagree with the Firestore answer key.
        if (typeof root !== 'undefined' && root.document) {
            var docHtml = root.document.documentElement && root.document.documentElement.outerHTML;
            if (docHtml && /serverGrading\s*:\s*true|gradeQuiz\s*\(/.test(docHtml)) {
                throw new Error(
                    'InlineQuizShuffler: detected serverGrading or gradeQuiz in document. ' +
                    'This shuffler is for client-graded inline quizzes only. ' +
                    'For server-graded quizzes, use QuizEngine which handles shuffling internally.'
                );
            }
        }
        questions.forEach(shuffleQuestion);
        return questions;
    }

    var InlineQuizShuffler = {
        shuffleQuestion: shuffleQuestion,
        shuffleQuiz: shuffleQuiz
    };

    if (typeof root !== 'undefined') {
        root.InlineQuizShuffler = InlineQuizShuffler;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = InlineQuizShuffler;
    }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
