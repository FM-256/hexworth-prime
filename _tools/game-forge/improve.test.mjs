#!/usr/bin/env node
// Unit tests for improve.mjs deterministic guarantees — no API key required.
// Run: node improve.test.mjs
import { extractJson, validateJeopardy, validateKahoot, diffStats } from './improve.mjs';

let pass = 0, fail = 0;
// Test assertion helper — logs PASS/FAIL and updates the pass/fail counters.
function ok(name, cond) { if (cond) { pass++; console.log('  PASS ' + name); } else { fail++; console.log('  FAIL ' + name); } }

// ---- extractJson ----
ok('extract raw array', extractJson('[{"a":1}]').length === 1);
ok('extract fenced', extractJson('```json\n[{"a":1},{"b":2}]\n```').length === 2);
ok('extract with prose around', extractJson('Here you go:\n```\n[{"x":"]nested]"}]\n```\nDone!')[0].x === ']nested]');
ok('extract object with bracket in string', extractJson('{"clue":"array[0] is first"}').clue === 'array[0] is first');
try { extractJson('no json here'); ok('throws on no-json', false); } catch { ok('throws on no-json', true); }

// ---- jeopardy answer-lock ----
const jOrig = [{ name: 'Cat', clues: [{ value: 100, clue: 'old clue', response: 'What is X?' }] }];
ok('jeopardy: clue improved, answer locked -> OK',
  validateJeopardy(jOrig, [{ name: 'Cat', clues: [{ value: 100, clue: 'a clearer clue', response: 'What is X?' }] }]).ok);
ok('jeopardy: response changed -> LOCK VIOLATION',
  !validateJeopardy(jOrig, [{ name: 'Cat', clues: [{ value: 100, clue: 'c', response: 'What is Y?' }] }]).ok);
ok('jeopardy: value changed -> rejected',
  !validateJeopardy(jOrig, [{ name: 'Cat', clues: [{ value: 200, clue: 'c', response: 'What is X?' }] }]).ok);
ok('jeopardy: clue count changed -> rejected',
  !validateJeopardy(jOrig, [{ name: 'Cat', clues: [] }]).ok);

// ---- kahoot answer-lock ----
const kOrig = [{ q: 'Q?', options: ['Right', 'w1', 'w2', 'w3'], answer: 0, note: 'n' }];
ok('kahoot: distractors improved, correct held -> OK',
  validateKahoot(kOrig, [{ q: 'Q clearer?', options: ['Right', 'better1', 'better2', 'better3'], answer: 0, note: 'better' }]).ok);
ok('kahoot: answer index moved -> LOCK VIOLATION',
  !validateKahoot(kOrig, [{ q: 'Q?', options: ['Right', 'w1', 'w2', 'w3'], answer: 2, note: 'n' }]).ok);
ok('kahoot: correct option text changed -> LOCK VIOLATION',
  !validateKahoot(kOrig, [{ q: 'Q?', options: ['Rewritten', 'w1', 'w2', 'w3'], answer: 0, note: 'n' }]).ok);
ok('kahoot: not 4 options -> rejected',
  !validateKahoot(kOrig, [{ q: 'Q?', options: ['Right', 'w1', 'w2'], answer: 0, note: 'n' }]).ok);
ok('kahoot: duplicate options -> rejected',
  !validateKahoot(kOrig, [{ q: 'Q?', options: ['Right', 'w1', 'w1', 'w3'], answer: 0, note: 'n' }]).ok);

// ---- diffStats ----
const ds = diffStats('kahoot', kOrig, [{ q: 'Q changed?', options: ['Right', 'NEW1', 'w2', 'w3'], answer: 0, note: 'n' }]);
ok('diffStats counts changed fields', ds.changed === 2 && ds.total === 6); // q + options[1]

console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
