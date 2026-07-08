// Unit test for the QuizEngine server-graded review mapping fix (2026-07-08).
// Replicates the exact logic added to the server-response handler + renderReview and
// asserts, under a deliberately-shuffled question AND option order, that:
//   (a) each server result (ORIGINAL order) attaches to the right DISPLAY-order question (#3),
//   (b) the revealed correct answer maps to the right shuffled option index (#1),
//   (c) knowsCorrectIdx treats -1 (no reveal) as unknown so the fallback fires (#2).
// No Firestore, no browser. Run: node test-quizengine-server-review-mapping.js

let failures = 0;
const assert = (cond, msg) => { if (!cond) { console.error('  FAIL: ' + msg); failures++; } else { console.log('  ok: ' + msg); } };

// --- Fixture: 3 questions, correct answers in ORIGINAL option order = [2, 0, 1].
const original = [
  { question: 'Q-A', options: ['a0', 'a1', 'a2', 'a3'], correctOrig: 2 },
  { question: 'Q-B', options: ['b0', 'b1', 'b2'], correctOrig: 0 },
  { question: 'Q-C', options: ['c0', 'c1', 'c2'], correctOrig: 1 },
];

// Simulate QuizEngine.start(): tag _originalIndex, then shuffle questions AND options.
// Display order chosen so it is NOT identity (exercises the #3 realignment).
const questionPerm = [2, 0, 1]; // display slot -> original question index
const optionPerms = {           // per original-question: display option order (indices into original options)
  0: [3, 2, 0, 1],
  1: [1, 2, 0],
  2: [2, 0, 1],
};
const questions = questionPerm.map((origQ) => {
  const oq = original[origQ];
  const dispOptions = optionPerms[origQ].map(i => oq.options[i]);
  return {
    question: oq.question,
    _originalIndex: origQ,
    _originalOptions: oq.options.slice(),   // original option order (what the key indexes)
    options: dispOptions,                   // shuffled display order
    correct: dispOptions.indexOf(undefined) // server mode: -1 (start() remap of an undefined correct)
  };
});

// The student answers each DISPLAY question with the CORRECT option (to test attribution).
// state.answers is append-only in DISPLAY order.
const stateAnswers = questions.map((q) => {
  const origQ = q._originalIndex;
  const correctText = original[origQ].options[original[origQ].correctOrig];
  return { selected: q.options.indexOf(correctText), isCorrect: null, correct: null };
});

// Server grades in ORIGINAL order and (revealToAll) returns correctAnswer in ORIGINAL option order.
const serverResults = original.map(oq => ({ correct: true, correctAnswer: oq.correctOrig, explanation: 'why-' + oq.question }));

// ===== Replicate the shipped handler logic (QuizEngine.js server-response handler) =====
const origToDisplay = {};
questions.forEach((q, dispIdx) => {
  const oi = (q._originalIndex !== undefined) ? q._originalIndex : dispIdx;
  origToDisplay[oi] = dispIdx;
});
serverResults.forEach((r, origIdx) => {
  const dispIdx = origToDisplay[origIdx];
  if (dispIdx === undefined || !stateAnswers[dispIdx]) return;
  const q = questions[dispIdx];
  stateAnswers[dispIdx].isCorrect = r.correct;
  if (typeof r.correctAnswer === 'number' && q._originalOptions) {
    const correctText = q._originalOptions[r.correctAnswer];
    const displayOptIdx = q.options.indexOf(correctText);
    if (displayOptIdx !== -1) { q.correct = displayOptIdx; stateAnswers[dispIdx].correct = displayOptIdx; }
  }
  if (r.explanation && !q.explanation) q.explanation = r.explanation;
});

// ===== Assertions =====
console.log('#3 question-order realignment + #1 correct-option mapping:');
questions.forEach((q, dispIdx) => {
  const origQ = q._originalIndex;
  const expectedText = original[origQ].options[original[origQ].correctOrig];
  // The highlighted correct option (q.correct) must be the true correct text for THIS question.
  assert(q.options[q.correct] === expectedText,
    `display slot ${dispIdx} (${q.question}) highlights correct option "${expectedText}"`);
  // isCorrect must be attached to the question the student actually saw in this slot.
  assert(stateAnswers[dispIdx].isCorrect === true,
    `display slot ${dispIdx} (${q.question}) isCorrect attributed to the right question`);
  // Explanation surfaced from server.
  assert(q.explanation === 'why-' + q.question, `display slot ${dispIdx} explanation surfaced`);
});

// #2: knowsCorrectIdx must read a real index as known, and -1 (no reveal) as unknown.
console.log('#2 knowsCorrectIdx semantics:');
const knows = (c) => typeof c === 'number' && c >= 0;
assert(knows(0) && knows(2), 'valid index (0, 2) => known');
assert(!knows(-1), '-1 (server no-reveal) => unknown (fallback marks student answer)');
assert(!knows(undefined) && !knows(null), 'undefined/null => unknown');

console.log(`\n${failures === 0 ? 'ALL PASS' : failures + ' FAILURE(S)'}`);
process.exit(failures === 0 ? 0 : 1);
