#!/usr/bin/env node
// task.js — durable Hexworth task board (replacement for the harness Tasks API,
// which is server-side gated out of current sessions and silos its storage
// per-session-id under ~/.claude/tasks/<session>/, so every restart shows empty).
//
// Data: one JSON file per task in _tools/marathon/upload/taskboard/, same schema
// as the native files ({id, subject, description, activeForm, status, blocks,
// blockedBy, owner?, ...}) so either side can consume the other's output.
//
// Design constraints (Nancy review 2026-07-23):
// - Writer is read-mutate-passthrough: load the full object, mutate only the
//   keys a command owns, re-serialize the rest untouched. Unknown/future native
//   fields (e.g. `owner`) survive every write.
// - No delete command. Status transitions append to `history`; un-completing
//   requires an explicit `reopen <id> "<reason>"`.
// - Import content-compares on id collision: identical => duplicate skip;
//   different => remap to a fresh id (loud), stamp `importedFrom`, and rewrite
//   blocks/blockedBy references within the imported batch. NOTE: blocks/
//   blockedBy are empty on all records seen so far; if the native tool starts
//   populating them, cross-SESSION references (not just intra-batch) would need
//   a remap table — revisit then.
// - Import archives pristine copies of the source dir under _archive/ first.
// - Writes are temp-file + rename (atomic on same filesystem).
//
// Board is the authoritative backlog. SITREP.md stays the narrative NOW-cursor.

const fs = require('fs');
const path = require('path');

const DATA = path.resolve(__dirname, '..', 'marathon', 'upload', 'taskboard');
fs.mkdirSync(DATA, { recursive: true });

const STATUSES = ['pending', 'in_progress', 'completed'];

function die(msg) { console.error('ERROR: ' + msg); process.exit(1); }
function stamp() { return new Date().toISOString().slice(0, 16).replace('T', ' '); }

function taskFiles(dir) {
  return fs.readdirSync(dir).filter(f => /^\d+\.json$/.test(f));
}
function taskPath(id) { return path.join(DATA, id + '.json'); }
function load(id) {
  if (!fs.existsSync(taskPath(id))) die('no task ' + id);
  return JSON.parse(fs.readFileSync(taskPath(id), 'utf8'));
}
function loadAll() {
  return taskFiles(DATA)
    .map(f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')))
    .sort((a, b) => Number(a.id) - Number(b.id));
}
function save(t) {
  const p = taskPath(t.id);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(t, null, 2) + '\n');
  fs.renameSync(tmp, p);
}
function nextIdFrom(ids) { return String(ids.length ? Math.max(...ids.map(Number)) + 1 : 1); }
function pushHistory(t, entry) {
  if (!Array.isArray(t.history)) t.history = [];
  t.history.push(stamp() + ' ' + entry);
}

function setStatus(id, status, opts) {
  opts = opts || {};
  const t = load(id);
  if (t.status === status) { console.log(id + ' already ' + status); return; }
  if (t.status === 'completed' && !opts.reopen) {
    die('task ' + id + ' is completed; use: task.js reopen ' + id + ' "<reason>" ' +
        '(completion evidence is never silently overwritten)');
  }
  pushHistory(t, 'status ' + t.status + ' -> ' + status + (opts.reason ? ' — ' + opts.reason : ''));
  t.status = status;
  save(t);
  console.log(id + ' -> ' + status + ': ' + t.subject);
}

function printList(tasks, showAll) {
  const open = tasks.filter(t => t.status !== 'completed');
  const done = tasks.filter(t => t.status === 'completed');
  const rows = showAll ? tasks : open.sort((a, b) =>
    (a.status === 'in_progress' ? 0 : 1) - (b.status === 'in_progress' ? 0 : 1) ||
    Number(a.id) - Number(b.id));
  for (const t of rows) {
    const mark = t.status === 'completed' ? '[x]' : t.status === 'in_progress' ? '[>]' : '[ ]';
    console.log(mark + ' ' + String(t.id).padStart(4) + '  ' + t.subject);
  }
  console.log('\n' + open.length + ' open (' +
    open.filter(t => t.status === 'in_progress').length + ' in progress, ' +
    open.filter(t => t.status === 'pending').length + ' pending), ' +
    done.length + ' completed, ' + tasks.length + ' total');
}

// Content identity for import dedup: ignore board-added bookkeeping fields.
function sameContent(a, b) {
  const strip = t => {
    const c = Object.assign({}, t);
    delete c.history; delete c.importedFrom;
    return JSON.stringify(c, Object.keys(c).sort());
  };
  return strip(a) === strip(b);
}

function importDir(src) {
  src = path.resolve(src);
  if (!fs.existsSync(src)) die('no such dir: ' + src);
  const srcNames = taskFiles(src);
  if (!srcNames.length) die('no task files in ' + src);

  // Never-destroy: pristine snapshot of the source before anything else.
  const arch = path.join(DATA, '_archive', path.basename(src));
  fs.mkdirSync(arch, { recursive: true });
  for (const f of srcNames) {
    const dest = path.join(arch, f);
    if (!fs.existsSync(dest)) fs.copyFileSync(path.join(src, f), dest);
  }

  const batch = srcNames
    .map(f => JSON.parse(fs.readFileSync(path.join(src, f), 'utf8')))
    .sort((a, b) => Number(a.id) - Number(b.id));

  // Pass 1: decide each task's fate (import as-is / duplicate skip / remap).
  const boardIds = taskFiles(DATA).map(f => f.replace('.json', ''));
  const taken = boardIds.map(Number);
  const remap = {}; // source id -> new board id (collision-with-different-content)
  const plan = [];
  for (const t of batch) {
    if (boardIds.indexOf(t.id) !== -1) {
      const existing = load(t.id);
      if (sameContent(existing, t)) { plan.push({ t: t, action: 'dup' }); continue; }
      const nid = nextIdFrom(taken);
      taken.push(Number(nid));
      remap[t.id] = nid;
      plan.push({ t: t, action: 'remap', nid: nid });
    } else {
      taken.push(Number(t.id));
      plan.push({ t: t, action: 'add' });
    }
  }

  // Pass 2: write, rewriting intra-batch blocks/blockedBy refs through the remap.
  let added = 0, dups = 0;
  for (const p of plan) {
    if (p.action === 'dup') { dups++; continue; }
    const t = p.t;
    for (const key of ['blocks', 'blockedBy']) {
      if (Array.isArray(t[key])) t[key] = t[key].map(ref => remap[ref] || ref);
    }
    if (p.action === 'remap') {
      console.log('COLLISION: source id ' + t.id + ' ("' + t.subject + '") differs from board task ' +
        t.id + ' ("' + load(t.id).subject + '") — imported as ' + p.nid);
      t.importedFrom = { dir: path.basename(src), originalId: t.id };
      t.id = p.nid;
    }
    save(t);
    added++;
  }
  console.log('imported ' + added + ' (' + Object.keys(remap).length + ' remapped), skipped ' +
    dups + ' identical duplicates; originals archived in ' + arch);
}

const argv = process.argv.slice(2);
const cmd = argv[0];

switch (cmd) {
  case 'list':
    printList(loadAll(), argv.indexOf('--all') !== -1);
    break;
  case 'show': {
    if (!argv[1]) die('usage: task.js show <id>');
    console.log(JSON.stringify(load(argv[1]), null, 2));
    break;
  }
  case 'add': {
    const subject = argv[1];
    if (!subject) die('usage: task.js add "subject" [-d "description"]');
    const di = argv.indexOf('-d');
    const t = {
      id: nextIdFrom(taskFiles(DATA).map(f => Number(f.replace('.json', '')))),
      subject: subject,
      description: di !== -1 ? (argv[di + 1] || '') : '',
      activeForm: 'Working on: ' + subject,
      status: 'pending',
      blocks: [],
      blockedBy: []
    };
    pushHistory(t, 'created');
    save(t);
    console.log('added ' + t.id + ': ' + t.subject);
    break;
  }
  case 'start': setStatus(argv[1] || die('usage: task.js start <id>'), 'in_progress'); break;
  case 'done': setStatus(argv[1] || die('usage: task.js done <id>'), 'completed'); break;
  case 'pend': setStatus(argv[1] || die('usage: task.js pend <id>'), 'pending'); break;
  case 'reopen': {
    if (!argv[1] || !argv[2]) die('usage: task.js reopen <id> "<reason>"');
    setStatus(argv[1], 'pending', { reopen: true, reason: 'REOPENED: ' + argv[2] });
    break;
  }
  case 'note': {
    if (!argv[1] || !argv[2]) die('usage: task.js note <id> "text"');
    const t = load(argv[1]);
    t.description = (t.description ? t.description + '\n' : '') + '[' + stamp() + '] ' + argv[2];
    save(t);
    console.log('noted on ' + t.id);
    break;
  }
  case 'import': {
    if (!argv[1]) die('usage: task.js import <native-session-task-dir>');
    importDir(argv[1]);
    break;
  }
  default:
    console.log('usage: task.js <list [--all] | show <id> | add "subject" [-d "desc"] | ' +
      'start|done|pend <id> | reopen <id> "reason" | note <id> "text" | import <dir>>');
    if (cmd) process.exit(1);
}
