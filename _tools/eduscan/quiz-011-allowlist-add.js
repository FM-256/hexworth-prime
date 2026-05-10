#!/usr/bin/env node
/**
 * quiz-011-allowlist-add.js — Operator helper to add a Karl-PASS entry to
 * the QUIZ-011 allowlist after a verbatim Confluence audit.
 *
 * Computes the answer-array hash using the SAME function the validator uses
 * (functions/placeholder-detector.getAnswerHash), then prints or writes the
 * entry block.
 *
 * Usage:
 *   node _tools/eduscan/quiz-011-allowlist-add.js <quizId> <confluencePage> <karlAuditPath>
 *     [--commit]
 *
 *   --commit  : write the entry into _tools/eduscan/config/quiz-011-allowlist.json
 *               (default: dry-run, prints to stdout only)
 *
 * Examples:
 *   node _tools/eduscan/quiz-011-allowlist-add.js fw-final 9469954 _docs/operations/karl-quiz-011-mode2-batch-2026-05-09.md
 *   node _tools/eduscan/quiz-011-allowlist-add.js fw-final 9469954 _docs/operations/karl-quiz-011-mode2-batch-2026-05-09.md --commit
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const QUIZ_KEYS = path.join(ROOT, 'functions/quiz_keys.json');
const ALLOWLIST = path.join(ROOT, '_tools/eduscan/config/quiz-011-allowlist.json');
const PlaceholderDetector = require(path.join(ROOT, 'functions/placeholder-detector.js'));

const args = process.argv.slice(2);
const commit = args.includes('--commit');
const positional = args.filter(a => !a.startsWith('--'));

if (positional.length < 3) {
    console.error('Usage: node quiz-011-allowlist-add.js <quizId> <confluencePage> <karlAuditPath> [--commit]');
    process.exit(1);
}

const [quizId, confluencePage, karlAuditPath] = positional;

const keys = JSON.parse(fs.readFileSync(QUIZ_KEYS, 'utf8'));
const entry = keys[quizId];
if (!entry || !Array.isArray(entry.answers)) {
    console.error(`Quiz "${quizId}" not found in functions/quiz_keys.json or has no answers array.`);
    process.exit(1);
}

const cls = PlaceholderDetector.classify(entry.answers);
if (cls !== 'CLASSIC-CYCLING') {
    console.warn(`Note: "${quizId}" is classified as ${cls}, not CLASSIC-CYCLING. Allowlist suppresses only CLASSIC-CYCLING fires; this entry will have no effect on QUIZ-011.`);
}

const today = new Date().toISOString().slice(0, 10);
const newEntry = {
    id: quizId,
    answerHash: PlaceholderDetector.getAnswerHash(entry.answers),
    verifiedAt: today,
    karlAuditPath,
    confluencePage,
};

console.log('New allowlist entry:');
console.log(JSON.stringify(newEntry, null, 2));

if (!commit) {
    console.log('\n(dry-run — pass --commit to write into _tools/eduscan/config/quiz-011-allowlist.json)');
    process.exit(0);
}

const allowlist = JSON.parse(fs.readFileSync(ALLOWLIST, 'utf8'));
const existingIdx = (allowlist.entries || []).findIndex(e => e.id === quizId);
if (existingIdx >= 0) {
    console.log(`Replacing existing entry for "${quizId}".`);
    allowlist.entries[existingIdx] = newEntry;
} else {
    allowlist.entries = allowlist.entries || [];
    allowlist.entries.push(newEntry);
    allowlist.entries.sort((a, b) => a.id.localeCompare(b.id));
}

fs.writeFileSync(ALLOWLIST, JSON.stringify(allowlist, null, 2) + '\n');
console.log(`\nWrote to ${path.relative(ROOT, ALLOWLIST)}.`);
console.log(`Total entries: ${allowlist.entries.length}.`);
