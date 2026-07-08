#!/usr/bin/env node
/**
 * extract-aplus-core1-keys.js
 *
 * Extracts the multi-modal answer key from each A+ Core 1 prep quiz's client CONFIG, in ORIGINAL
 * question + option order, and emits it in the server-grading seed shape:
 *   answers[i]  = mc: original correct option index (number)
 *               = gui: correctId (string)
 *               = terminal: { terminal: [accepted...] }  (object-wrapped; Firestore forbids nested arrays)
 *   types[i]    = 'mc' | 'gui' | 'terminal'
 *   explanations[i] = the per-question explanation
 * Read-only: parses the HTML, evaluates the QUESTIONS array in a sandbox, prints JSON. Seeds nothing.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.resolve(__dirname, '../_app/houses/forge/applets/comptia-aplus/core-1/quizzes');
const ROUNDS = ['1', '2', '3', '4'];

// Pull `const QUESTIONS = [ ... ];` by balanced-bracket scan (strings + nested arrays safe).
function extractQuestionsArray(html) {
  const start = html.indexOf('const QUESTIONS = [');
  if (start < 0) throw new Error('QUESTIONS not found');
  let i = html.indexOf('[', start), depth = 0, inStr = null, out = '';
  for (; i < html.length; i++) {
    const c = html[i], prev = html[i - 1];
    out += c;
    if (inStr) { if (c === inStr && prev !== '\\') inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) break; }
  }
  return out;
}

for (const r of ROUNDS) {
  const file = path.join(DIR, `forge-aplus-core1-prep-round-${r}.quiz.html`);
  const html = fs.readFileSync(file, 'utf8');
  const moduleId = (html.match(/moduleId: '([^']+)'/) || [])[1];
  const passingScore = parseInt((html.match(/passingScore:\s*(\d+)/) || [])[1], 10) || 70;
  const arrSrc = extractQuestionsArray(html);
  const QUESTIONS = vm.runInNewContext(arrSrc);

  // Build the parallel answers/types/explanations arrays in original order, one entry per question,
  // routing each question type to its server-grading representation.
  const answers = [], types = [], explanations = [];
  for (const q of QUESTIONS) {
    types.push(q.type);
    explanations.push(q.explanation || '');
    if (q.type === 'mc') answers.push(q.correct);                       // original correct option index
    else if (q.type === 'gui') answers.push(q.correctId);              // correct hotspot id
    else if (q.type === 'terminal') answers.push({ terminal: q.accepted }); // object-wrapped accepted list
    else throw new Error(`${moduleId}: unknown type ${q.type}`);
  }

  // Assemble the full Firestore key doc (revealToAll: formative prep quiz; multiModal marker).
  const key = { answers, types, explanations, questionCount: QUESTIONS.length, passingScore, revealToAll: true, multiModal: true };
  console.log(`\n=== ${moduleId} (${QUESTIONS.length} q: ${types.filter(t => t === 'mc').length}mc/${types.filter(t => t === 'gui').length}gui/${types.filter(t => t === 'terminal').length}terminal) ===`);
  // Print a human-readable per-question summary so the extracted key can be eyeballed for sanity.
  QUESTIONS.forEach((q, i) => {
    const a = q.type === 'mc' ? `idx ${q.correct} = "${(q.options[q.correct] || '').replace(/<[^>]*>/g, '').slice(0, 40)}"`
      : q.type === 'gui' ? `id "${q.correctId}"`
      : `accepted ${JSON.stringify(q.accepted)}`;
    console.log(`  Q${i + 1} [${q.type}] ${a}`);
  });
  // Emit the seed object to disk for the (later, Nancy-approved) live seed step.
  fs.writeFileSync(path.join(__dirname, `aplus-core1-key-${moduleId}.json`), JSON.stringify(key, null, 2));
}
console.log('\nWrote aplus-core1-key-*.json seed objects.');
