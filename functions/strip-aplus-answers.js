#!/usr/bin/env node
/**
 * strip-aplus-answers.js  <quiz-file.html>
 *
 * Removes answer data from an A+ Core 1 prep quiz's client source so the answers are no longer
 * readable in page source (grading moves server-side to gradeQuiz). Strips the five single-line
 * answer fields from each question (correct / correctId / accepted / expectedDisplay / explanation),
 * deletes any "correct answer" leak comment in the mockup builders, and neutralizes the
 * practice-mode "answers visible in source" banner text. KEEPS everything needed to render or to
 * display the review non-revealingly: options text, mockup id, the hotspots label-map, prompt.
 * Idempotent-ish: re-running just finds nothing to strip. Prints a summary of what it removed.
 */
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage: strip-aplus-answers.js <quiz.html>'); process.exit(1); }

let html = fs.readFileSync(file, 'utf8');
const before = html.split('\n').length;

// 1. Drop the five single-line answer fields (each sits on its own line inside a question object).
const FIELD_RE = /^[ \t]*(correct|correctId|accepted|expectedDisplay|explanation):.*\n/gm;
const removedFields = (html.match(FIELD_RE) || []).length;
html = html.replace(FIELD_RE, '');

// 2. Remove mockup-builder comments that reveal the answer (e.g. "// Disk 1: ... the correct answer").
const COMMENT_RE = /^[ \t]*\/\/.*correct answer.*\n/gim;
const removedComments = (html.match(COMMENT_RE) || []).length;
html = html.replace(COMMENT_RE, '');

// 3. Neutralize any practice-mode banner that advertises source-visible answers.
let bannerFixed = 0;
html = html.replace(/Answers are visible in page source[^<'"]*/gi, (m) => { bannerFixed++; return 'Server-graded. Your answers are checked securely.'; });

fs.writeFileSync(file, html);
console.log(`${file.split('/').pop()}: removed ${removedFields} answer-field lines, ${removedComments} leak comment(s), ${bannerFixed} banner fix(es). Lines ${before} -> ${html.split('\n').length}.`);
