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
 *
 * WHY IT BLOCKS ON ADDED LINES, NOT ON WHOLE FILES  (2026-08-12)
 *   The unit of scope used to be the FILE: touch a file at all, and every dash already in it
 *   became yours. That is right for content work, where editing a deck means you can clean its
 *   punctuation. It is wrong for a MECHANICAL SWEEP, and the security fix for Mallory's finding
 *   2 is what proved it: moving one <script> tag into <head> on 119 pages put 86 files of
 *   untouched student-facing prose into scope and reported 1213 occurrences, ZERO of them
 *   written by the change. cx-dl-01.html is the specimen: its entire diff was the script hoist,
 *   it carried 7 dashes, it carried the same 7 at HEAD, and every dash-bearing line in it was
 *   byte-identical to HEAD.
 *
 *   A gate that fires on 1213 things nobody did is a gate someone disables, which is the exact
 *   fate the "scoped to changed" design was written to avoid. So the scope is now the ADDED
 *   LINE. Dashes on lines this branch introduces BLOCK. Dashes already on disk in a file you
 *   merely touched are REPORTED and never block.
 *
 *   THIS DOES NOT WEAKEN THE CASE THE GATE WAS BUILT FOR. The A+ Core 2 deck that reached
 *   production with 24 em-dashes was NEW content, and every line of a new or untracked file is
 *   an added line, so it is still caught in full. What is given up is only "you edited a legacy
 *   file, so you own its backlog", which was never the rule the memory states. The rule is
 *   `feedback_no_em_dashes`: do not WRITE them.
 *
 *   `--whole-file` restores the old behaviour for anyone who wants the stricter sweep.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SCOPE_DIR = '_app/';
/* ⚠ BUG-098: `.js` and `.css` HAVE NEVER BEEN SCANNED. Both ship to the browser and both can
   render text, so the no-em-dash rule is simply unenforced there. Chris proved it on 2026-08-12
   by appending `-- with a real dash` to _app/components/AccessGuard.js: the gate never saw the
   file and reported clean. Adding the extensions is one line, but it pulls in an unmeasured
   backlog, so it is a deliberate follow-up rather than a drive-by. Now that blocking is scoped
   to ADDED lines, that backlog would report without blocking, which is what makes the change
   safe to make. Do not "fix" this without measuring first. */
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
const WHOLE_FILE = args.includes('--whole-file');
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

/* Parse `git diff -U0` into file -> Set(line numbers that are NEW in the post-image).
   Kept pure and separate from git so --selftest can prove the hunk arithmetic without a
   repository fixture. The @@ header is the only source of truth here: `@@ -a,b +c,d @@` means
   d lines starting at c exist in the new file, and an omitted d means exactly 1. A pure
   deletion has d === 0 and must contribute nothing. */
function parseAddedLines(diffText) {
    const map = new Map();
    let cur = null;
    for (const line of String(diffText).split('\n')) {
        if (line.startsWith('+++ ')) {
            const p = line.slice(4).trim();
            cur = (p === '/dev/null') ? null : p.replace(/^b\//, '');
            if (cur && !map.has(cur)) map.set(cur, new Set());
            continue;
        }
        if (line.startsWith('@@') && cur) {
            const m = /@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
            if (!m) continue;
            const start = Number(m[1]);
            const count = m[2] === undefined ? 1 : Number(m[2]);
            for (let i = 0; i < count; i++) map.get(cur).add(start + i);
        }
    }
    return map;
}

/* Added lines across everything this branch introduces, with line numbers valid in the
   WORKING TREE. `git diff <commit>` (no second commit) compares that commit to the working
   tree, so committed-on-branch and uncommitted edits land in one pass and the numbers refer
   to the file as it will actually deploy. */
function addedLines() {
    const base = resolveBase();
    if (!base) return new Map();
    const mb = sh(`git merge-base HEAD ${base}`) || base;
    return parseAddedLines(sh(`git diff -U0 ${mb} -- ${SCOPE_DIR}`));
}

/* An untracked file has no post-image to diff against, and every line in it is new. */
function untrackedFiles() {
    return new Set(sh(`git ls-files --others --exclude-standard -- ${SCOPE_DIR}`)
        .split('\n').filter(Boolean));
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
    /* ── ATTRIBUTION ARITHMETIC ────────────────────────────────────────────────────────
       The forms above decide WHAT a dash is; this decides WHOSE it is, and an off-by-one here
       does not throw, it silently stops blocking a dash somebody really did add. Proven on
       synthetic diff text so it needs no repository fixture and cannot rot. */
    const DIFF = [
        'diff --git a/_app/x.html b/_app/x.html',
        '--- a/_app/x.html',
        '+++ b/_app/x.html',
        '@@ -10 +10 @@',                       // 1 line replaced at 10, count omitted means 1
        '-old',
        '+new',
        '@@ -20,0 +21,3 @@',                   // 3 lines inserted starting at 21
        '+a', '+b', '+c',
        '@@ -40,2 +44,0 @@',                   // pure deletion: contributes NOTHING
        '-gone', '-also gone',
        'diff --git a/_app/y.html b/_app/y.html',
        '--- a/_app/y.html',
        '+++ /dev/null',                       // file deleted: never attributed
        '@@ -1,2 +0,0 @@',
        '-x', '-y'
    ].join('\n');
    const parsed = parseAddedLines(DIFF);
    const xs = parsed.get('_app/x.html') || new Set();
    const CASES = [
        ['single-line hunk with omitted count', xs.has(10)],
        ['inserted block start',                xs.has(21)],
        ['inserted block middle',               xs.has(22)],
        ['inserted block end',                  xs.has(23)],
        ['does NOT over-run the block',        !xs.has(24)],
        ['does NOT claim the line before',     !xs.has(20)],
        ['pure deletion adds nothing',         !xs.has(44)],
        ['exact added-line count is 4',         xs.size === 4],
        ['deleted file is not attributed',     !parsed.has('_app/y.html')]
    ];
    for (const [name, ok] of CASES) {
        console.log(`  ${ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  attribution: ${name}`);
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
/* WHOSE DASH IS IT. `--all`, `--check` and `--whole-file` keep the old every-line behaviour:
   the first two are explicitly asking about whole files, and the third is the opt-in sweep.
   The default blocking path attributes each hit to the line it sits on. */
const ATTRIBUTE = !ALL && !WHOLE_FILE && !(EXPLICIT && EXPLICIT.length);
const added = ATTRIBUTE ? addedLines() : new Map();
const untracked = ATTRIBUTE ? untrackedFiles() : new Set();

const offenders = [];      // dashes this branch WROTE. These block.
const inherited = [];      // dashes already on disk in a file we merely touched. Reported.
let total = 0, inheritedTotal = 0;
for (const f of files) {
    const hits = scan(f);
    if (!hits.length) continue;
    if (!ATTRIBUTE) {
        offenders.push({ file: f, hits });
        total += hits.reduce((s, h) => s + h.n, 0);
        continue;
    }
    /* A file with no entry in the diff map and no untracked marker is one the working tree
       changed in a way git did not report as added lines (a pure deletion, or a mode change).
       Nothing was introduced there, so nothing there blocks. */
    const isNew = untracked.has(f);
    const addedSet = added.get(f);
    const mine = hits.filter(h => isNew || (addedSet && addedSet.has(h.line)));
    const theirs = hits.filter(h => !(isNew || (addedSet && addedSet.has(h.line))));
    if (mine.length)   { offenders.push({ file: f, hits: mine }); total += mine.reduce((s, h) => s + h.n, 0); }
    if (theirs.length) { inherited.push({ file: f, hits: theirs }); inheritedTotal += theirs.reduce((s, h) => s + h.n, 0); }
}

const mode = EXPLICIT && EXPLICIT.length ? 'explicit --check list'
    : ALL ? 'ALL _app content (reporting only, never blocks)'
    : WHOLE_FILE ? `every line of changed files vs ${resolveBase() || 'working tree'}`
    : `lines ADDED vs ${resolveBase() || 'working tree'}`;
if (!QUIET) console.log(`dash-hygiene-gate: ${files.length} file(s) in scope [${mode}]`);

/* The inherited backlog is stated EVERY run, pass or fail. It is not a finding against this
   change, but silence would let it grow invisibly, and "the gate went quiet" must never be the
   thing that hides it. Run with --whole-file to see it in full. */
function reportInherited() {
    if (!inherited.length) return;
    console.log(`\x1b[2m  (${inheritedTotal} pre-existing occurrence(s) across ${inherited.length} `
              + `touched file(s), not introduced by this change and not blocking. `
              + `See them with --whole-file.)\x1b[0m`);
}

if (!offenders.length) {
    /* The success line must describe THE MODE THAT JUST RAN. Only the default path is scoped to
       added lines; --whole-file, --all and --check all read every line, and a message claiming
       "ADDED" there would have the gate lying about its own coverage in exactly the direction
       that makes a clean result look stronger than it is (Chris, 2026-08-12). */
    console.log(`\x1b[32m✓\x1b[0m no em-dashes, entities or " -- " `
              + `${ATTRIBUTE ? 'ADDED to' : 'in'} _app content`);
    reportInherited();
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
console.log(`${total} occurrence(s) across ${offenders.length} file(s)`
          + `${ATTRIBUTE ? ', on lines this change ADDED' : ''}.`);
reportInherited();

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
