#!/usr/bin/env node
// Game Forge converter — extract legacy clone data literals -> shared data-driven JSON (STAGING).
// Usage: node forge.mjs            # convert all engine-typed clones to staging + write manifest
//        node forge.mjs <id>       # convert one (e.g. jeopardy/pis)
//
// Extraction is done with a string-aware bracket scanner (so brackets/quotes
// inside clue text never miscount) + vm.runInNewContext to parse the isolated
// literal with the real JS engine (handles all escaping). NEVER writes to the
// live data/ path — only data-extracted/ staging. Promotion is a separate step.

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  REPO, APP, LIVE_DATA, STAGE_DATA, MANIFEST,
  COURSES, GRADE_LABELS, REGISTRY, ENGINE_TYPES,
  jeopardyTheme, kahootTheme,
} from './config.mjs';

// ---- string-aware bracket scan ---------------------------------------------
// From the `=` after `var/const NAME`, find the balanced [...] (or {...}),
// skipping over ' " ` strings and their escapes. Returns the literal text.
function extractLiteral(src, varName) {
  const decl = new RegExp(`(?:const|let|var)\\s+${varName}\\s*=\\s*`);
  const m = decl.exec(src);
  if (!m) throw new Error(`declaration for '${varName}' not found`);
  let i = m.index + m[0].length;
  const open = src[i];
  if (open !== '[' && open !== '{') throw new Error(`'${varName}' is not an array/object literal (got '${open}')`);
  const close = open === '[' ? ']' : '}';
  let depth = 0, str = null, esc = false;
  const start = i;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (str) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === str) str = null;
      continue;
    }
    // skip comments so brackets/quotes inside them (e.g. /* Kant's ... */) don't desync the scan
    if (ch === '/' && src[i + 1] === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i++; continue; }
    if (ch === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { str = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error(`unbalanced literal for '${varName}'`);
}

function parseLiteral(literalText) {
  // real JS engine parses it — apostrophes, nested quotes, unicode all safe.
  return vm.runInNewContext('(' + literalText + ')', Object.create(null), { timeout: 2000 });
}

// ---- metadata base ----------------------------------------------------------
// For courses with a curated live file, reuse its non-content metadata so we
// never regress a working themed picker. Otherwise build from COURSES config.
function metaBase(type, course) {
  const live = path.join(LIVE_DATA, type, `${course}.json`);
  if (fs.existsSync(live)) {
    try {
      const cur = JSON.parse(fs.readFileSync(live, 'utf8'));
      const { categories, questions, ...meta } = cur; // strip content, keep presentation
      return { meta, source: 'curated-live' };
    } catch { /* fall through */ }
  }
  const c = COURSES[course];
  if (!c) throw new Error(`no COURSES config for '${course}'`);
  // default hero subtitle + duration per game type (covers jeopardy/kahoot/wheel/fifth)
  const SUBTITLE = {
    jeopardy: 'Jeopardy Review',
    kahoot: 'Rapid-fire review — faster correct answers score more',
    wheel: 'Guess the hidden phrases — spin for consonants, buy vowels, solve the puzzle',
    fifth: 'Climb the money ladder — one question per grade level',
  };
  const DURATION = { jeopardy: '~30 min', kahoot: '~15 min', wheel: '~20 min', fifth: '~15 min' };
  const meta = {
    title: c.title,
    subtitle: SUBTITLE[type] || 'Review',
    icon: c.icon, badge: c.badge, duration: DURATION[type] || '~20 min',
    gradeLabels: { ...GRADE_LABELS },
    theme: type === 'jeopardy' ? jeopardyTheme(c) : kahootTheme(c),
  };
  return { meta, source: 'config' };
}

// ---- per-type mappers (legacy literal -> engine schema) ---------------------
function mapJeopardy(categories) {
  // two legacy dialects:
  //   A: {name, clues:[{value, clue, response}]}        (eth/pis/ala/devops)
  //   B: {name, questions:[{points, question, answer}]} (forge-aplus/netplus)
  return categories.map(cat => {
    const rows = cat.clues || cat.questions || [];
    return {
      name: String(cat.name),
      clues: rows.map(cl => ({
        value: Number(cl.value ?? cl.points),
        clue: String(cl.clue ?? cl.question),
        response: String(cl.response ?? cl.answer),
      })),
    };
  });
}
function mapKahoot(QUESTIONS) {
  // legacy {q, opts[4], ans, exp} -> {q, options[4], answer, note}
  return QUESTIONS.map(q => ({
    q: String(q.q),
    options: (q.opts || q.options || []).map(String),
    answer: Number(q.ans ?? q.answer),
    note: q.exp != null ? String(q.exp) : (q.note != null ? String(q.note) : ''),
  }));
}
// legacy Wheel {phrase, category, hint} maps 1:1
function mapWheel(PUZZLES) {
  return PUZZLES.map(p => ({
    phrase: String(p.phrase),
    category: String(p.category),
    hint: p.hint != null ? String(p.hint) : '',
  }));
}
// legacy 5th-Grader {value, gradeTag, q, opts[4], ans, exp, milestone} -> options/answer/note
function mapFifth(QUESTIONS) {
  return QUESTIONS.map(q => ({
    value: Number(q.value),
    gradeTag: String(q.gradeTag || ''),
    q: String(q.q),
    options: (q.opts || q.options || []).map(String),
    answer: Number(q.ans ?? q.answer),
    note: q.exp != null ? String(q.exp) : (q.note != null ? String(q.note) : ''),
    milestone: !!q.milestone,
  }));
}

// ---- convert one ------------------------------------------------------------
function convertOne(entry) {
  const abs = path.join(APP, entry.file);
  const src = fs.readFileSync(abs, 'utf8');
  const literal = extractLiteral(src, entry.varName);
  const data = parseLiteral(literal);

  const { meta, source } = metaBase(entry.type, entry.course);
  let out, itemCount;
  if (entry.type === 'jeopardy') {
    const categories = mapJeopardy(data);
    itemCount = categories.reduce((n, c) => n + c.clues.length, 0);
    out = { ...meta, categories };
  } else if (entry.type === 'kahoot') {
    const questions = mapKahoot(data);
    itemCount = questions.length;
    out = { ...meta, questions };
  } else if (entry.type === 'wheel') {
    const puzzles = mapWheel(data);
    itemCount = puzzles.length;
    out = { ...meta, puzzles };
  } else if (entry.type === 'fifth') {
    const questions = mapFifth(data);
    itemCount = questions.length;
    out = { ...meta, questions };
  } else {
    throw new Error(`no mapper for type '${entry.type}'`);
  }

  const dest = path.join(STAGE_DATA, entry.type, `${entry.course}.json`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
  return { id: entry.id, itemCount, metaSource: source, dest: path.relative(REPO, dest) };
}

// ---- main -------------------------------------------------------------------
const only = process.argv[2];
const targets = REGISTRY.filter(e => ENGINE_TYPES.has(e.type) && (!only || e.id === only));
const results = [];
const manifestGames = [];

for (const entry of REGISTRY) {
  const engine = ENGINE_TYPES.has(entry.type);
  const abs = path.join(APP, entry.file);
  const exists = fs.existsSync(abs);
  let converted = false, itemCount = null, error = null, metaSource = null;

  if (engine && exists && (!only || entry.id === only)) {
    try {
      const r = convertOne(entry);
      converted = true; itemCount = r.itemCount; metaSource = r.metaSource;
      results.push(r);
      console.log(`  converted ${entry.id.padEnd(18)} ${String(itemCount).padStart(3)} items  (meta: ${metaSource})`);
    } catch (e) {
      error = e.message;
      console.error(`  FAILED    ${entry.id.padEnd(18)} ${error}`);
    }
  }

  manifestGames.push({
    id: entry.id, type: entry.type, course: entry.course,
    courseTitle: (COURSES[entry.course] || {}).title || entry.course,
    sourceFile: entry.file, engineExists: engine, sourceExists: exists,
    converted, itemCount, metaSource, error,
    stagedPath: converted ? `data-extracted/${entry.type}/${entry.course}.json` : null,
    livePath: `data/${entry.type}/${entry.course}.json`,
  });
}

const manifest = {
  generated: 'forge.mjs',
  totals: {
    clones: REGISTRY.length,
    engineTyped: REGISTRY.filter(e => ENGINE_TYPES.has(e.type)).length,
    converted: manifestGames.filter(g => g.converted).length,
    needsEngine: REGISTRY.filter(e => !ENGINE_TYPES.has(e.type)).length,
  },
  games: manifestGames,
};
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n  manifest -> ${path.relative(REPO, MANIFEST)}  (${manifest.totals.converted}/${manifest.totals.engineTyped} engine-typed converted, ${manifest.totals.needsEngine} need engine)`);
