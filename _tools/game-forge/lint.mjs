#!/usr/bin/env node
// Game Forge linter — deterministic quality audit of staged game data.
// Usage: node lint.mjs    # lint every staged data-extracted/ file, write reports + fold into manifest
//
// Severities: error (breaks engine / factually empty), warn (quality), info (style).
// This is the AUDIT layer. Fixing the findings (the actual content improvement)
// is a separate, human/AI-reviewed step — see the improvement pass.

import fs from 'node:fs';
import path from 'node:path';
import { REPO, STAGE_DATA, MANIFEST, LINT_DIR, REGISTRY, ENGINE_TYPES } from './config.mjs';

// emoji / pictographs (mirrors the platform's no-emoji rule; dingbats like ✓✗ excluded)
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
const norm = s => String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ');

// push one finding onto a game's issue list
function issue(list, severity, code, msg, where) { list.push({ severity, code, msg, where }); }

// ---- per-type linters -------------------------------------------------------
// Audit a jeopardy game (expects {categories:[{name, clues:[{value,clue,response}]}]}),
// appending board-shape, empty-field, duplicate, and style findings to L.
function lintJeopardy(data, L) {
  const cats = data.categories || [];
  if (cats.length === 0) { issue(L, 'error', 'EMPTY_GAME', 'no categories', 'categories'); return; }
  if (cats.length !== 5) issue(L, 'info', 'BOARD_WIDTH', `${cats.length} categories (standard board is 5)`, 'categories');

  const counts = cats.map(c => (c.clues || []).length);
  if (new Set(counts).size > 1) issue(L, 'warn', 'RAGGED_BOARD', `uneven clues per category: ${counts.join('/')}`, 'categories');

  // value-ladder consistency: every category should share the same value sequence
  const ladders = cats.map(c => (c.clues || []).map(cl => cl.value).join(','));
  if (new Set(ladders).size > 1) issue(L, 'warn', 'VALUE_LADDER', 'categories use different value ladders', 'categories');

  const seenClue = new Map(), seenResp = new Map();
  cats.forEach((c, ci) => {
    if (!c.name || !String(c.name).trim()) issue(L, 'error', 'EMPTY_CAT_NAME', 'category has no name', `categories[${ci}]`);
    (c.clues || []).forEach((cl, ri) => {
      const at = `${c.name} / $${cl.value}`;
      if (!cl.clue || !String(cl.clue).trim()) issue(L, 'error', 'EMPTY_CLUE', 'empty clue text', at);
      if (!cl.response || !String(cl.response).trim()) issue(L, 'error', 'EMPTY_RESPONSE', 'empty response', at);
      if (!Number.isFinite(cl.value)) issue(L, 'error', 'BAD_VALUE', `non-numeric value: ${cl.value}`, at);
      if (!/^(what|who|where|when|why|how)\b/i.test(String(cl.response).trim()))
        issue(L, 'info', 'RESPONSE_FORMAT', 'response not phrased as a question', at);
      if (EMOJI.test(cl.clue) || EMOJI.test(cl.response)) issue(L, 'warn', 'EMOJI', 'emoji in clue/response', at);
      const k = norm(cl.clue);
      if (k && seenClue.has(k)) issue(L, 'warn', 'DUP_CLUE', `duplicate clue (also ${seenClue.get(k)})`, at); else seenClue.set(k, at);
      const r = norm(cl.response);
      if (r && seenResp.has(r)) issue(L, 'info', 'DUP_RESPONSE', `duplicate response (also ${seenResp.get(r)})`, at); else seenResp.set(r, at);
    });
  });
}

// Audit a kahoot game (expects {questions:[{q, options[4], answer, note}]}),
// appending option-count, answer-range, explanation, duplicate, and skew findings to L.
function lintKahoot(data, L) {
  const qs = data.questions || [];
  if (qs.length === 0) { issue(L, 'error', 'EMPTY_GAME', 'no questions', 'questions'); return; }
  const ansDist = {}, seenQ = new Map();
  qs.forEach((q, i) => {
    const at = `Q${i + 1}`;
    if (!q.q || !String(q.q).trim()) issue(L, 'error', 'EMPTY_Q', 'empty question text', at);
    const opts = q.options || [];
    if (opts.length !== 4) issue(L, 'warn', 'OPT_COUNT', `${opts.length} options (expected 4)`, at);
    if (opts.some(o => !String(o).trim())) issue(L, 'error', 'EMPTY_OPTION', 'an option is blank', at);
    if (new Set(opts.map(norm)).size !== opts.length) issue(L, 'warn', 'DUP_OPTION', 'duplicate options', at);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= opts.length)
      issue(L, 'error', 'BAD_ANSWER', `answer index ${q.answer} out of range 0..${opts.length - 1}`, at);
    else ansDist[q.answer] = (ansDist[q.answer] || 0) + 1;
    if (!q.note || !String(q.note).trim()) issue(L, 'warn', 'NO_EXPLANATION', 'missing explanation/note', at);
    if (EMOJI.test(q.q) || opts.some(o => EMOJI.test(o))) issue(L, 'warn', 'EMOJI', 'emoji in question/options', at);
    const k = norm(q.q);
    if (k && seenQ.has(k)) issue(L, 'warn', 'DUP_Q', `duplicate question (also ${seenQ.get(k)})`, at); else seenQ.set(k, at);
  });
  // answer-position skew (a too-predictable correct slot is a quality smell)
  const n = qs.length, max = Math.max(0, ...Object.values(ansDist));
  if (n >= 8 && max / n > 0.5) issue(L, 'info', 'ANSWER_SKEW', `correct answer is index with ${max}/${n} of answers — predictable`, 'distribution');
}

// ---- cross-game duplicate detection ----------------------------------------
// Returns [{text, games:[idA,idB]}] for clue/question text that repeats across
// DIFFERENT courses (same-course repetition is handled by the per-game linters).
function crossGameDups(loaded) {
  const seen = new Map(); // norm text -> first game id
  const dups = [];
  for (const { id, type, data } of loaded) {
    const texts = type === 'jeopardy'
      ? (data.categories || []).flatMap(c => (c.clues || []).map(cl => cl.clue))
      : (data.questions || []).map(q => q.q);
    for (const t of texts) {
      const k = norm(t);
      if (!k) continue;
      if (seen.has(k) && seen.get(k).split('/')[0] !== id.split('/')[0]) {
        dups.push({ text: t.slice(0, 70), games: [seen.get(k), id] });
      } else if (!seen.has(k)) seen.set(k, id);
    }
  }
  return dups;
}

// ---- main -------------------------------------------------------------------
fs.mkdirSync(LINT_DIR, { recursive: true });
const loaded = [];
for (const e of REGISTRY.filter(e => ENGINE_TYPES.has(e.type))) {
  const f = path.join(STAGE_DATA, e.type, `${e.course}.json`);
  if (!fs.existsSync(f)) continue;
  loaded.push({ id: e.id, type: e.type, course: e.course, data: JSON.parse(fs.readFileSync(f, 'utf8')) });
}

const reports = {};
for (const g of loaded) {
  const L = [];
  if (g.type === 'jeopardy') lintJeopardy(g.data, L);
  else if (g.type === 'kahoot') lintKahoot(g.data, L);
  const summary = { error: 0, warn: 0, info: 0 };
  L.forEach(x => summary[x.severity]++);
  const report = { id: g.id, type: g.type, course: g.course, summary, issues: L };
  reports[g.id] = report;
  fs.writeFileSync(path.join(LINT_DIR, g.id.replace('/', '__') + '.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`  ${g.id.padEnd(18)} E:${summary.error} W:${summary.warn} I:${summary.info}`);
}

const xdups = crossGameDups(loaded);
fs.writeFileSync(path.join(LINT_DIR, '_cross-game-dups.json'), JSON.stringify(xdups, null, 2) + '\n');
console.log(`\n  cross-game duplicate texts: ${xdups.length}`);

// fold lint summary into the manifest
if (fs.existsSync(MANIFEST)) {
  const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  man.games.forEach(g => { if (reports[g.id]) g.lint = reports[g.id].summary; });
  man.lint = { crossGameDups: xdups.length, totalIssues: Object.values(reports).reduce((n, r) => n + r.issues.length, 0) };
  fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
  console.log(`  manifest lint summary updated -> ${path.relative(REPO, MANIFEST)}`);
}
