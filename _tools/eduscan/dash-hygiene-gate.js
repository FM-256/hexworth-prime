#!/usr/bin/env node
/**
 * @catalog what    Blocks a deploy when CHANGED _app content introduces an em-dash or a " -- " substitute
 * @catalog run     node _tools/eduscan/dash-hygiene-gate.js [--base <ref>] [--all] [--check <paths>] [--selftest]
 * @catalog status  GATE
 *
 * WHY THIS EXISTS
 *   The style rule (memory `feedback_no_em_dashes`) has been in force since 2026-05-26 and
 *   was already automated as EduScan HEUR-035. It still could not stop anything: HEUR-035
 *   fired at LOW, `deploy.sh --strict` blocks on CRITICAL/HIGH only, and the Nexus triage
 *   gate publishes ['critical','high']. On 2026-08-06 an A+ Core 2 deck reached production
 *   carrying 24 em-dashes, and the lab written the same day carried 72 em-dashes and " -- ".
 *   HEUR-035 is now HIGH, which gives platform-wide visibility. This gate is the part that
 *   actually blocks, and it is deliberately scoped to what CHANGED so that ~1587 files of
 *   legacy debt cannot make the gate permanent noise that someone disables.
 *
 * WHAT IT CHECKS
 *   Every changed/untracked file under _app/ with a content extension, in FULL (not just
 *   rendered prose): HTML comments and inline JS/CSS ship to the browser, and the operator
 *   confirmed on 2026-07-04 that comment double-hyphens are in scope.
 *
 *   Five forms, because a grep for the literal character is not a detector. On 2026-08-06 a
 *   source grep for `—` returned 0 on a deck that was visibly rendering six em-dashes, which
 *   an SVG <text> carried as `&#8212;`:
 *     literal U+2014, &mdash;, &#8212;, &#x2014;, and " -- " (space on BOTH sides)
 *
 *   The space-on-both-sides requirement for the double hyphen is what keeps `<!--`, `-->`,
 *   `i--`, `--flag` and `var(--muted)` out of the match without an exclusion list.
 *
 * WHY "CHANGED" AND NOT "ALL"
 *   `--all` exists for reporting and never blocks. The blocking path compares against the
 *   merge-base with the base ref AND includes the working tree, because deploy ships the
 *   working directory, not the commit (memory `feedback_review_receipt_covers_the_tree_not_the_commit`).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SCOPE_DIR = '_app/';
const EXTS = new Set(['.html', '.htm', '.md']);

/* Paths that are ALLOWED to contain the forms, because their job is to contain them. */
const EXEMPT = [
    /_archive/,
    /node_modules/,
    /_tools\/eduscan\/tests\/fixtures\//
];

const FORMS = [
    { re: /—/g,         label: 'literal em-dash (—)' },
    { re: /&mdash;/gi,  label: '&mdash;' },
    { re: /&#8212;/g,   label: '&#8212;' },
    { re: /&#x2014;/gi, label: '&#x2014;' },
    { re: / -- /g,      label: '" -- "' }
];

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const QUIET = args.includes('--quiet');
const baseIdx = args.indexOf('--base');
const BASE = baseIdx >= 0 ? args[baseIdx + 1] : null;

function sh(cmd) {
    try { return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
    catch (e) { return ''; }
}

/* Resolve a base to diff against. Never invent one: if none of these exist we fall back to
   scanning the working tree's uncommitted changes only, which is still a real signal. */
function resolveBase() {
    if (BASE) return BASE;
    for (const ref of ['origin/master', 'master', 'origin/main', 'main']) {
        if (sh(`git rev-parse --verify --quiet ${ref}`)) return ref;
    }
    return null;
}

function changedFiles() {
    const base = resolveBase();
    const out = new Set();
    if (base) {
        const mb = sh(`git merge-base HEAD ${base}`) || base;
        sh(`git diff --name-only ${mb} -- ${SCOPE_DIR}`).split('\n').forEach(f => f && out.add(f));
    }
    /* deploy ships the working directory, so uncommitted and untracked count too */
    sh(`git diff --name-only HEAD -- ${SCOPE_DIR}`).split('\n').forEach(f => f && out.add(f));
    sh(`git ls-files --others --exclude-standard -- ${SCOPE_DIR}`).split('\n').forEach(f => f && out.add(f));
    return [...out];
}

function allFiles(dir, acc = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/node_modules|_archive/.test(p)) allFiles(p, acc); }
        else acc.push(path.relative(ROOT, p));
    }
    return acc;
}

function inScope(f) {
    if (!f.startsWith(SCOPE_DIR)) return false;
    if (!EXTS.has(path.extname(f).toLowerCase())) return false;
    if (EXEMPT.some(re => re.test(f))) return false;
    return fs.existsSync(path.join(ROOT, f));
}

function scan(file) {
    const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const lines = text.split('\n');
    const hits = [];
    lines.forEach((line, i) => {
        for (const f of FORMS) {
            f.re.lastIndex = 0;
            const n = (line.match(f.re) || []).length;
            if (n) hits.push({ line: i + 1, form: f.label, n, text: line.trim().slice(0, 110) });
        }
    });
    return hits;
}

/* SELF-TEST. A gate that has only ever returned "clean" has not been shown to work, and a
   clean 0 from a detector that cannot see the encoding is not a pass. This proves both
   directions in memory, so it costs nothing and cannot rot: every banned form is caught,
   and every look-alike that legitimately appears in real code is left alone. */
function selfTest() {
    const MUST_CATCH = [
        ['literal',     'a sentence — with a dash'],
        ['named',       'a sentence &mdash; with a dash'],
        ['decimal',     '<text>TYPE 1 &#8212; Bare Metal</text>'],
        ['hex',         'a sentence &#x2014; with a dash'],
        ['substitute',  'a sentence -- with a double hyphen'],
        ['svg text',    '<text x="1" y="2">GUEST &#8212; assume hostile</text>']
    ];
    const MUST_IGNORE = [
        ['css var',       'color: var(--muted); border: 1px solid var(--line);'],
        ['decrement',     'for (let i = n; i--;) { total += i; }'],
        ['html comment',  '<!-- a perfectly ordinary comment -->'],
        ['long flag',     'run ./deploy.sh --strict --skip-smoke to bypass'],
        ['hyphen word',   'a real-time multi-factor check on a well-known host'],
        ['en dash',       'pages 10–14 use an en dash, which is allowed'],
        ['minus in js',   'const d = a - b; const e = a-- - --b;']
    ];
    const hit = (s) => FORMS.some(f => { f.re.lastIndex = 0; return f.re.test(s); });
    let pass = 0, fail = 0;
    for (const [name, s] of MUST_CATCH) {
        const ok = hit(s);
        console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  catches ${name}`);
        ok ? pass++ : fail++;
    }
    for (const [name, s] of MUST_IGNORE) {
        const ok = !hit(s);
        console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ignores ${name}${ok ? '' : '  <- FALSE POSITIVE'}`);
        ok ? pass++ : fail++;
    }
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
}
if (args.includes('--selftest')) selfTest();

/* --check <paths...>: scan exactly these files and block on findings, skipping the scope
   and exemption filters. Lets CI (or a proof run) point the real blocking path at a known
   file without writing a throwaway into _app. */
const checkIdx = args.indexOf('--check');
const EXPLICIT = checkIdx >= 0 ? args.slice(checkIdx + 1).filter(a => !a.startsWith('--')) : null;

const files = EXPLICIT && EXPLICIT.length
    ? EXPLICIT.filter(f => fs.existsSync(path.join(ROOT, f)))
    : (ALL ? allFiles(path.join(ROOT, '_app')) : changedFiles()).filter(inScope);
const offenders = [];
let total = 0;
for (const f of files) {
    const hits = scan(f);
    if (hits.length) { offenders.push({ file: f, hits }); total += hits.reduce((s, h) => s + h.n, 0); }
}

const mode = EXPLICIT && EXPLICIT.length ? 'explicit --check list'
    : ALL ? 'ALL _app content (reporting only, never blocks)'
    : `changed vs ${resolveBase() || 'working tree'}`;
if (!QUIET) console.log(`dash-hygiene-gate: ${files.length} file(s) in scope [${mode}]`);

if (!offenders.length) {
    console.log(`\x1b[32m✓\x1b[0m no em-dashes, entities or " -- " in changed _app content`);
    process.exit(0);
}

console.log('');
for (const o of offenders) {
    console.log(`\x1b[31m${o.file}\x1b[0m`);
    for (const h of o.hits.slice(0, 12)) {
        console.log(`  line ${String(h.line).padStart(5)}  ${h.n} × ${h.form}   ${h.text}`);
    }
    if (o.hits.length > 12) console.log(`  ... and ${o.hits.length - 12} more line(s) in this file`);
}
console.log('');
console.log(`${total} occurrence(s) across ${offenders.length} file(s).`);

if (ALL) {
    console.log('\x1b[2m--all is a report. Run without it to gate the deploy.\x1b[0m');
    process.exit(0);
}

console.log('');
console.log('\x1b[31mDEPLOY BLOCKED\x1b[0m: fix the punctuation, do not swap one dash form for another.');
console.log('  clause separation      ", "');
console.log('  introducing a reason   ": "');
console.log('  two full sentences     ". "');
console.log('\x1b[2mAll five forms are flagged, including &#8212; inside SVG <text>.\x1b[0m');
process.exit(1);
