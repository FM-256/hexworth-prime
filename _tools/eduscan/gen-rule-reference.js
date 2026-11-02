#!/usr/bin/env node
/**
 * gen-rule-reference.js — the EduScan rule definitions, generated from the code that emits them.
 *
 * @catalog what    Parses every EduScan validator, lists each rule code it can emit with its
 * @catalog what    severity, description, fix and source line, and joins the latest run's counts.
 * @catalog run     node _tools/eduscan/gen-rule-reference.js [--check]
 * @catalog status  GATE
 *
 * GATE: _tools/nexus/nexus.js runs this after every scan, publishes the JSON to Firestore
 * `_quality_reports/rules` (the admin console's Rule Catalog renders from it), and the Markdown is
 * re-pushed to Confluence by _tools/confluence/sync-published-docs.sh on each deploy.
 *
 * WHY THIS EXISTS. On 2026-10-31 the admin console's hand-written Rule Catalog listed 38 codes
 * while the scan emitted 47, and 38 of the 47 were missing from it, including the four that
 * produce most findings. The Confluence Rule Reference was six months stale. A list of rules
 * typed by hand is a snapshot of the day someone typed it; the code is the only thing that knows
 * what the scanner checks today. So this reads the code.
 *
 * WHAT COUNTS AS A RULE. An object literal with a `code` property naming a code AND a `severity`
 * or `message` property: the shape every validator pushes as a finding. A bare mention of a code
 * (a comment, a fix template, a lookup table) is not a definition and does not create one. A few
 * validators pass the code in through an option (`orphanCode: 'HTML-011'`) and push
 * `{ code: opts.orphanCode, ... }`; those option values are listed as rules with the severity
 * the run observed, and say so.
 *
 * WHERE THE DESCRIPTION COMES FROM, in order: a doc comment in the emitting file that names the
 * code (`- HEUR-022: Over-deep relative ...`), then the safety-net architecture table for BOX and
 * META rules, then the finding's own message with each interpolation shown as "…". The source
 * says which, so a reader knows whether a sentence was written to describe the rule or is just
 * what one finding looked like.
 *
 * SEVERITY is the literal in the code. Where the code computes it, the field says "computed" and
 * the run's observed severities are the only evidence; the generator never guesses.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const ROOT = path.resolve(__dirname, '../..');
const EDUSCAN = path.join(ROOT, '_tools/eduscan');
const REPORTS = path.join(ROOT, '_tools/reports');
const SAFETY_NET_DOC = path.join(ROOT, '_docs/operations/safety-net-architecture.md');
const OUT_JSON = path.join(REPORTS, 'EDUSCAN_RULES.json');
const OUT_MD = path.join(REPORTS, 'EDUSCAN_RULE_REFERENCE.md');

/* A rule code has a family and at least one hyphenated part: HEUR-035, BOX-002c, META-001-NO-CODE,
   HEUR-RESULT-BUTTON-STANDARD. This keeps out the placeholders that sit in comments and examples
   (`CODE`, `X`, `XXX`). */
const CODE_RE = /^[A-Z][A-Z0-9]*-[A-Za-z0-9]+(?:[-.][A-Za-z0-9]+)*$/;   // XREF-003.A has a dotted sub-code
/* The same pattern as source text, for building the doc-comment and doc-table regexes below. */
const CODE_SRC = '[A-Z][A-Z0-9]*-[A-Za-z0-9]+(?:[-.][A-Za-z0-9]+)*';
const SEVERITIES = ['critical', 'high', 'medium', 'low', 'warning', 'suspect', 'info'];

/* Directories that hold no validators: fixers rewrite files, fixtures are test inputs, reports are
   output. Tests are skipped by name. Everything else under _tools/eduscan is read. */
const SKIP_DIRS = /^(node_modules|reports|fixtures|fixers|fixes|__pycache__|tests?|config|hooks)$/;

/* Every .js file under `dir` that could hold a validator, skipping SKIP_DIRS, *.test.js and hidden
   files (a dotfile is a scratch copy or editor artefact, never a validator, and reading one would list
   every rule in it a second time). */
function walk(dir, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.')) continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!SKIP_DIRS.test(e.name)) walk(p, out); }
        else if (/\.js$/.test(e.name) && !/\.test\.js$/.test(e.name)) out.push(p);
    }
    return out;
}

/* Parses one file as a script (most of EduScan is CommonJS), falling back to a module. Comments
   are pushed into `comments`, which is emptied before the fallback so they are not doubled. */
function parse(src, comments) {
    const opts = { ecmaVersion: 'latest', locations: true, allowHashBang: true, onComment: comments };
    try {
        return acorn.parse(src, { ...opts, sourceType: 'script', allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true });
    } catch (e) {
        comments.length = 0;
        return acorn.parse(src, { ...opts, sourceType: 'module' });
    }
}

/* Every node of the tree, depth first. Small and dependency-free on purpose. */
function visit(node, fn) {
    if (!node || typeof node.type !== 'string') return;
    fn(node);
    for (const k of Object.keys(node)) {
        if (k === 'loc' || k === 'start' || k === 'end') continue;
        const v = node[k];
        if (Array.isArray(v)) v.forEach((c) => visit(c, fn));
        else if (v && typeof v.type === 'string') visit(v, fn);
    }
}

/* The plain name of an object property (`code`, `severity`), or null for spreads and computed keys. */
function keyName(prop) {
    if (prop.type !== 'Property' || prop.computed) return null;
    return prop.key.type === 'Identifier' ? prop.key.name : prop.key.type === 'Literal' ? String(prop.key.value) : null;
}

/* All string literals anywhere in an expression: `isCtf ? 'BOX-011-FLAG-LEAK-CTF' : '...'` names
   two codes, `big ? 'high' : 'medium'` two severities. */
function stringLiterals(node) {
    const out = [];
    visit(node, (n) => {
        if (n.type === 'Literal' && typeof n.value === 'string') out.push(n.value);
        if (n.type === 'TemplateLiteral' && n.expressions.length === 0) out.push(n.quasis[0].value.cooked);
    });
    return out;
}

/* A message or fix as a reader-facing sentence: literal text kept, each interpolation shown as
   "…". Returns null for anything that is not text built from literals (a variable, a call). */
function textOf(node) {
    if (!node) return null;
    if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
    if (node.type === 'TemplateLiteral') {
        let s = '';
        node.quasis.forEach((q, i) => { s += q.value.cooked; if (i < node.expressions.length) s += '…'; });
        return s;
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
        const l = textOf(node.left), r = textOf(node.right);
        return (l === null ? '…' : l) + (r === null ? '…' : r);
    }
    return null;
}

/* Collapses whitespace and runs of "…", and trims to `max` characters with a trailing "…". */
function clean(s, max) {
    if (s == null) return null;
    s = String(s).replace(/\s+/g, ' ').replace(/(…\s*){2,}/g, '… ').trim();
    return max && s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

/* Doc comments that define a code. Two layouts occur in the source, one line each, first wins:
     ` * - HEUR-022: Over-deep ...`  /  ` * HEUR-035 (dash rule) — ...`   (a separator)
     ` *   DEP-001  trackProgress: true → ProgressSystem.js`            (aligned columns) */
function docDescriptions(comments) {
    const out = {};
    /* A title names the audit, not what it checks, so it is kept apart and used only when nothing
       more specific describes the code (see build()). */
    const titles = {};
    const sep = new RegExp('^[\\s*/-]*(' + CODE_SRC + ')(?![-.\\w])\\s*(?:\\([^)]*\\))?\\s*(?::|—|–|-)\\s+(\\S.*)$');
    const cols = new RegExp('^[\\s*/-]*(' + CODE_SRC + ') {2,}(\\S.*)$');
    /* A file's title line names the rule it implements: `EduScan — Signal Guides Coverage Audit (XREF-003)`. */
    const title = new RegExp('^[\\s*]*(?:EduScan\\s*[—–-]\\s*)?([A-Z][^()]{3,}?)\\s*\\((' + CODE_SRC + ')\\)\\s*$');
    const starts = new RegExp('^[\\s*/]*(?:[-•@]|' + CODE_SRC + ')');
    for (const c of comments) {
        const lines = c.value.split('\n');
        lines.forEach((raw, i) => {
            const t = title.exec(raw);
            if (t && CODE_RE.test(t[2])) {
                if (!titles[t[2]]) titles[t[2]] = { text: clean(t[1], 300), line: c.loc ? c.loc.start.line + i : null };
                return;
            }
            const m = sep.exec(raw) || cols.exec(raw);
            if (!m || !CODE_RE.test(m[1]) || out[m[1]]) return;
            /* A definition that wraps continues on the following lines until a blank line, a new
               bullet, or the next code; up to eight lines are joined. */
            let text = m[2];
            for (let j = i + 1; j < lines.length && j <= i + 8; j++) {
                const next = lines[j].replace(/^[\s*/]*/, '');
                if (!next || starts.test(lines[j])) break;
                text += ' ' + next;
            }
            out[m[1]] = clean(text, 400);
        });
    }
    return { lines: out, titles };
}

/* The safety-net architecture doc's tables, in their two layouts:
     `| **BOX-011** | `file.js` | HIGH (CTF flag) / INFO (narrative) | description |`
     `| `meta-rule-registry-audit.js` (META-001) | description |`
   Severity is every severity word in the severity column, so a split rule keeps both. */
function safetyNetDescriptions() {
    const out = {};
    if (!fs.existsSync(SAFETY_NET_DOC)) return out;
    for (const line of fs.readFileSync(SAFETY_NET_DOC, 'utf8').split('\n')) {
        let m = new RegExp('^\\|\\s*\\*\\*(' + CODE_SRC + ')\\*\\*\\s*\\|[^|]*\\|([^|]*)\\|\\s*(.+?)\\s*\\|\\s*$').exec(line);
        if (m && !out[m[1]]) {
            const sev = SEVERITIES.filter((s) => new RegExp('\\b' + s + '\\b', 'i').test(m[2]));
            out[m[1]] = { severity: sev, description: clean(m[3].replace(/`/g, ''), 300) };
            continue;
        }
        m = new RegExp('^\\|\\s*`[^`|]+`\\s*\\((' + CODE_SRC + ')\\)\\s*\\|\\s*(.+?)\\s*\\|\\s*$').exec(line);
        if (m && !out[m[1]]) out[m[1]] = { severity: [], description: clean(m[2].replace(/`/g, ''), 300) };
    }
    return out;
}

/* Severity words written into a description: a leading `(high)`, a parenthetical `(MEDIUM)`, or
   `Severity: HIGH.`. They are taken out of the sentence and returned separately, so the reference
   can state them as what the COMMENT says and compare that with what the CODE sets (BLOB-001's
   comment says MEDIUM while its code emits low). */
function splitSeverityNote(text) {
    if (!text) return { text, stated: [] };
    const stated = [];
    const word = '(' + SEVERITIES.join('|') + ')';
    let t = text
        .replace(new RegExp('^\\(' + word + '\\)\\s*', 'i'), (m, w) => { stated.push(w.toLowerCase()); return ''; })
        .replace(new RegExp('\\s*\\(' + word + '\\)', 'gi'), (m, w) => { stated.push(w.toLowerCase()); return ''; })
        .replace(new RegExp('\\s*Severity:\\s*' + word + '\\b\\.?', 'gi'), (m, w) => { stated.push(w.toLowerCase()); return ''; });
    return { text: t.trim(), stated: [...new Set(stated)] };
}

/* The note shown when a rule's own comment states a severity its code never sets, or null. Both
   arguments are lists of severity words; the code's list is what the finding can actually carry. */
function severityNote(codeSev, stated) {
    if (!codeSev.length || !stated.length || stated.every((x) => codeSev.includes(x))) return null;
    const bySev = (a, b) => SEVERITIES.indexOf(a) - SEVERITIES.indexOf(b);
    return `The source comment says ${stated.join('/')}; the code sets ${codeSev.slice().sort(bySev).join('/')}.`;
}

/* The rule a sub-code belongs to: BOX-011-FLAG-LEAK-CTF -> BOX-011, META-003-NOT-WIRED -> META-003.
   The longest prefix that is itself a described rule; null when there is none. */
function parentOf(code, described) {
    for (let p = code.replace(/[-.][A-Za-z0-9]+$/, ''); CODE_RE.test(p); p = p.replace(/[-.][A-Za-z0-9]+$/, '')) {
        if (p !== code && described(p)) return p;
    }
    return null;
}

/* The modules the DEFAULT scan loads (`node _tools/eduscan/cli.js`, what Nexus runs): everything
   reachable by require() from the five orchestrators the EduScan class builds unconditionally in
   _tools/eduscan/index.js. Functional, impact, coverage and rules-bypass checks load only behind CLI
   flags and the standalone audits run on their own, so none of them is in this set. Derived by
   following require() rather than listed, so a new validator wired into syntax/index.js is counted
   the day it is wired. */
const DEFAULT_SCAN_ENTRIES = ['parsers/index.js', 'validators/index.js', 'validators/syntax/index.js',
    'validators/orphans.js', 'validators/flow-validator.js'];
function defaultScanModules() {
    const seen = new Set();
    const queue = DEFAULT_SCAN_ENTRIES.map((e) => path.join(EDUSCAN, e));
    while (queue.length) {
        const f = queue.shift();
        if (seen.has(f) || !fs.existsSync(f)) continue;
        seen.add(f);
        let ast;
        try { ast = parse(fs.readFileSync(f, 'utf8'), []); } catch (e) { continue; }
        visit(ast, (n) => {
            if (n.type !== 'CallExpression' || n.callee.type !== 'Identifier' || n.callee.name !== 'require') return;
            const a = n.arguments[0];
            if (!a || a.type !== 'Literal' || typeof a.value !== 'string' || !/^\./.test(a.value)) return;
            const base = path.resolve(path.dirname(f), a.value);
            for (const c of [base, base + '.js', path.join(base, 'index.js')]) {
                if (fs.existsSync(c) && fs.statSync(c).isFile()) { queue.push(c); break; }
            }
        });
    }
    return new Set([...seen].map((f) => path.relative(ROOT, f)));
}

/* ── 1. Definitions, from the source ─────────────────────────────────────────────────────── */
function collectDefinitions() {
    const rules = {};
    const titleDecls = [];   // codes a file names in its title line: `Guard Registry Audit (GUARD-001)`
    const files = walk(EDUSCAN, []).sort();
    for (const file of files) {
        const rel = path.relative(ROOT, file);
        const src = fs.readFileSync(file, 'utf8');
        const comments = [];
        let ast;
        /* A file that will not parse is a hard failure: silently skipping it would drop every rule
           it defines from the reference while the totals still looked complete. */
        try { ast = parse(src, comments); }
        catch (e) { throw new Error(`cannot parse ${rel}: ${e.message}`); }
        const described = docDescriptions(comments);
        const docs = described.lines;
        const optionSites = [];   // codes passed in through an option, joined to their template below
        const templates = {};     // option name -> the finding template that consumes it

        /* Values assigned to each variable name in this file (`const sev = big ? 'high' : 'low'`,
           `sev = 'medium'`), so a finding written `{ code, severity: sev }` or `{ code, severity }`
           still shows the severities the code can choose between instead of "computed". */
        const assigned = {};
        visit(ast, (n) => {
            if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init) (assigned[n.id.name] = assigned[n.id.name] || []).push(n.init);
            if (n.type === 'AssignmentExpression' && n.left.type === 'Identifier') (assigned[n.left.name] = assigned[n.left.name] || []).push(n.right);
        });
        titleDecls.push(...Object.keys(described.titles).map((code) => ({ code, file: rel, line: described.titles[code].line, title: described.titles[code].text, doc: docs[code] })));

        visit(ast, (node) => {
            if (node.type !== 'ObjectExpression') return;
            const props = {};
            for (const p of node.properties) { const k = keyName(p); if (k) props[k] = p; }

            /* Option-passed codes: `orphanCode: 'HTML-011'`. Severity is set where the option is
               consumed, so it is left to the run. */
            for (const k of Object.keys(props)) {
                if (k === 'code' || !/Code$/.test(k)) continue;
                for (const code of stringLiterals(props[k].value)) {
                    if (!CODE_RE.test(code)) continue;
                    optionSites.push({ option: k, code, site: { file: rel, line: props[k].loc.start.line, via: 'option `' + k + '`', severities: [], doc: docs[code], title: (described.titles[code] || {}).text } });
                }
            }

            if (!props.code || !(props.severity || props.message)) return;

            /* The template that consumes an option: `code: opts.unclosedCode || 'HTML-005'`. Its
               message and fix describe every code passed through that option. */
            visit(props.code.value, (n) => {
                if (n.type === 'MemberExpression' && !n.computed && /Code$/.test(n.property.name)) {
                    templates[n.property.name] = templates[n.property.name] || {
                        message: clean(textOf(props.message && props.message.value), 300),
                        fix: clean(textOf(props.fix && props.fix.value), 300),
                        category: props.category ? stringLiterals(props.category.value)[0] || null : null,
                    };
                }
            });
            const codes = stringLiterals(props.code.value).filter((c) => CODE_RE.test(c));
            if (!codes.length) return;
            const sevOf = (node) => stringLiterals(node).map((x) => x.toLowerCase()).filter((x) => SEVERITIES.includes(x));
            let sev = props.severity ? sevOf(props.severity.value) : [];
            let severityVia = null;
            if (props.severity && !sev.length && props.severity.value.type === 'Identifier') {
                const name = props.severity.value.name;
                sev = [...new Set((assigned[name] || []).flatMap(sevOf))];
                if (sev.length) severityVia = 'variable `' + name + '`';
            }
            const category = props.category ? stringLiterals(props.category.value)[0] || null : null;
            /* `code: isCtf ? 'BOX-011-...-CTF' : '...-NARRATIVE'` beside `severity: isCtf ? 'high' : 'info'`:
               the same test picks both, so each code gets its own branch's severity, not the pair. */
            const paired = {};
            const cv = props.code.value, sv = props.severity && props.severity.value;
            if (cv.type === 'ConditionalExpression' && sv && sv.type === 'ConditionalExpression'
                && src.slice(cv.test.start, cv.test.end) === src.slice(sv.test.start, sv.test.end)) {
                for (const [c, s] of [[cv.consequent, sv.consequent], [cv.alternate, sv.alternate]]) {
                    const sl = stringLiterals(s).map((x) => x.toLowerCase()).filter((x) => SEVERITIES.includes(x));
                    for (const code of stringLiterals(c)) paired[code] = sl;
                }
            }
            for (const code of codes) {
                add(rules, code, {
                    file: rel,
                    line: props.code.loc.start.line,
                    severities: paired[code] || sev,
                    severityComputed: !!props.severity && sev.length === 0,
                    category,
                    message: clean(textOf(props.message && props.message.value), 300),
                    fix: clean(textOf(props.fix && props.fix.value), 300),
                    doc: docs[code],
                    title: (described.titles[code] || {}).text,
                    severityVia,
                });
            }
        });

        /* An option code takes its template's message and fix; its severity is computed there. */
        for (const o of optionSites) {
            const t = templates[o.option];
            add(rules, o.code, t ? { ...o.site, ...t, severityComputed: true } : o.site);
        }
    }

    /* A validator that names its code only in its title, and reports it some other way (printed,
       or as a gate exit), is still a rule: GUARD-001 is one. It is added from the title line, and
       only when nothing else in the tree emits the code. */
    for (const d of titleDecls) {
        if (rules[d.code]) continue;
        add(rules, d.code, { file: d.file, line: d.line, via: 'file title', severities: [], doc: d.doc, title: d.title });
    }
    return { rules, filesRead: files.length };
}

/* Records one place in the source that emits `code`; the same file and line is kept once. */
function add(rules, code, site) {
    const r = rules[code] || (rules[code] = { code, sites: [] });
    if (!r.sites.some((s) => s.file === site.file && s.line === site.line)) r.sites.push(site);
}

/* ── 2. The latest run ───────────────────────────────────────────────────────────────────── */
/* How far an audit report may be from the scan and still count as part of the same run. Nexus and
   the smoke gate rewrite the BOX/META reports on every deploy; a report older than this is evidence
   that the audit ran ONCE, not that it ran now, and is shown as "last ran <date>". */
const FRESH_MS = 24 * 60 * 60 * 1000;

/* Every rule code inside one report finding: its own `code` (or the audit's code when it has none),
   plus any code on objects nested in it. BOX-011 reports one finding per box with the individual
   leaks, each carrying BOX-011-FLAG-LEAK-CTF or -NARRATIVE, nested in `leaks`. */
function nestedCodes(x, depth, out) {
    if (!x || typeof x !== 'object' || depth > 3) return out;
    for (const v of Object.values(x)) {
        const items = Array.isArray(v) ? v : [v];
        for (const it of items) {
            if (!it || typeof it !== 'object') continue;
            if (typeof it.code === 'string' && CODE_RE.test(it.code)) out.push(it);
            nestedCodes(it, depth + 1, out);
        }
    }
    return out;
}

/* The latest run: counts per code from TREASURE_MAP.json (the main scan) and from every audit
   report that declares a `validatorCode`, plus which audits ran and whether that was this run. */
function collectRun(reportsDir) {
    const run = { byCode: {}, sources: [], audits: {}, scanAt: null };
    const bump = (code, sev, file, message, source) => {
        const r = run.byCode[code] || (run.byCode[code] = { count: 0, files: new Set(), severities: {}, sample: null, source });
        r.count++;
        if (file) r.files.add(file);
        if (sev) r.severities[sev] = (r.severities[sev] || 0) + 1;
        if (!r.sample && message) r.sample = clean(message, 240);
    };

    const tm = path.join(reportsDir, 'TREASURE_MAP.json');
    if (fs.existsSync(tm)) {
        const t = JSON.parse(fs.readFileSync(tm, 'utf8'));
        for (const i of t.issues || []) bump(i.code, i.severity, i.file, i.message, 'TREASURE_MAP.json');
        run.scanAt = (t.meta && t.meta.scannedAt) || null;
        run.sources.push({ report: 'TREASURE_MAP.json', at: run.scanAt, findings: (t.issues || []).length,
            filesScanned: (t.summary && t.summary.totalFilesScanned) || null });
    }
    const scanMs = Date.parse(run.scanAt) || Date.now();

    /* A report with zero findings proves its audit ran clean, but only if it was written with this
       scan. An old one is recorded with its date and its findings are NOT counted as this run's. */
    for (const f of fs.readdirSync(reportsDir).filter((n) => /\.json$/.test(n) && n !== 'TREASURE_MAP.json' && n !== 'EDUSCAN_RULES.json').sort()) {
        let j;
        try { j = JSON.parse(fs.readFileSync(path.join(reportsDir, f), 'utf8')); } catch (e) { continue; }
        if (!j || typeof j.validatorCode !== 'string' || !Array.isArray(j.findings)) continue;
        const vc = j.validatorCode;
        const atMs = Date.parse(j.generatedAt);
        const fresh = !!atMs && Math.abs(scanMs - atMs) <= FRESH_MS;
        if (!run.audits[vc] || (fresh && !run.audits[vc].fresh)) run.audits[vc] = { report: f, at: j.generatedAt || null, fresh };
        run.sources.push({ report: f, at: j.generatedAt || null, findings: j.findings.length, validatorCode: vc, fresh });
        if (!fresh) continue;
        for (const x of j.findings) {
            const top = typeof x.code === 'string' && CODE_RE.test(x.code) ? x.code : vc;
            const where = x.file || x.relDir || x.dirname;
            bump(top, x.severity, where, x.message, f);
            for (const n of nestedCodes(x, 0, [])) if (n.code !== top) bump(n.code, n.severity, where, n.message, f);
        }
    }
    return run;
}

/* ── 3. Join and write ───────────────────────────────────────────────────────────────────── */
/* opts.reportsDir points the run half at another directory (the test's fixtures). */
function build(opts) {
    const { rules, filesRead } = collectDefinitions();
    const run = collectRun((opts && opts.reportsDir) || REPORTS);
    const net = safetyNetDescriptions();

    /* A code the run produced that no source defines is still a rule: list it, and say the source
       could not be located, rather than drop the finding count on the floor. */
    for (const code of Object.keys(run.byCode)) if (!rules[code] && CODE_RE.test(code)) rules[code] = { code, sites: [] };

    /* The doc-comment description of a code from any of its emitting sites, used for parents. */
    const docOf = (code) => rules[code] && (rules[code].sites.find((s) => s.doc) || {}).doc;
    /* The title line of a file that implements `code`, the weakest description short of a sample. */
    const titleOf = (code) => rules[code] && (rules[code].sites.find((s) => s.title) || {}).title;

    const inDefaultScan = defaultScanModules();

    const list = Object.values(rules).map((r) => {
        const sites = r.sites.slice().sort((a, b) => (a.file + a.line).localeCompare(b.file + b.line));
        const first = sites.find((s) => !s.via) || sites[0] || {};
        const doc = (sites.find((s) => s.doc) || {}).doc;
        const literalSev = [...new Set(sites.flatMap((s) => s.severities || []))];
        const computed = sites.some((s) => s.severityComputed);
        const seen = run.byCode[r.code];
        /* The audit that covers this code: its own, or its parent's (BOX-016-MISSING-ENGINE is
           checked whenever BOX-016 runs). */
        const auditCode = run.audits[r.code] ? r.code : parentOf(r.code, (p) => !!run.audits[p]);
        const audit = auditCode ? run.audits[auditCode] : null;
        const loadedByScan = sites.some((s) => inDefaultScan.has(s.file));

        let description = null, descriptionSource = null;
        if (doc) { description = doc; descriptionSource = 'doc comment'; }
        else if (net[r.code]) { description = net[r.code].description; descriptionSource = 'safety-net-architecture.md'; }
        else if (first.message) { description = first.message; descriptionSource = 'finding message'; }
        else if (titleOf(r.code)) { description = titleOf(r.code); descriptionSource = 'file title'; }
        else if (seen && seen.sample) { description = seen.sample; descriptionSource = 'latest finding'; }
        else {
            /* A sub-code with nothing of its own says what its parent rule checks, and names it. */
            const parent = parentOf(r.code, (p) => !!(docOf(p) || net[p]));
            if (parent) { description = docOf(parent) || net[parent].description; descriptionSource = 'parent rule ' + parent; }
        }

        const split = splitSeverityNote(description);
        description = split.text || description;

        /* Severity, never a guess: the code's literals; else the safety-net doc's; else what the
           rule's own comment states. When the comment and the code disagree, say so. */
        const docSev = net[r.code] ? net[r.code].severity : [];
        const bySev = (a, b) => SEVERITIES.indexOf(a) - SEVERITIES.indexOf(b);
        const severity = (literalSev.length ? literalSev : docSev.length ? docSev : split.stated).slice().sort(bySev);
        const severitySource = literalSev.length ? (sites.find((s) => s.severityVia) ? 'code (' + sites.find((s) => s.severityVia).severityVia + ')' : 'code')
            : docSev.length ? 'safety-net-architecture.md' : split.stated.length ? 'source comment' : null;
        return {
            code: r.code,
            family: r.code.split('-')[0],
            severity,
            severitySource,
            severityComputed: computed && literalSev.length === 0,
            note: severityNote(literalSev, split.stated),
            statedSeverity: split.stated,
            category: (sites.find((s) => s.category) || {}).category || null,
            description,
            descriptionSource,
            message: first.message || null,
            fix: (sites.find((s) => s.fix) || {}).fix || null,
            sources: sites.map((s) => s.file + ':' + s.line + (s.via ? ' (' + s.via + ')' : '')),
            /* status, strongest evidence first:
                 fired        findings in this run
                 clean        its audit (or its parent's) wrote a report with this scan, and none of
                              them were this code
                 no-findings  the default scan LOADS the code but reported nothing; whether it ran
                              depends on profile and options (HTML-005 runs only under --profile
                              strict), so this is not called clean
                 stale        the only evidence is an audit report from an earlier day
                 not-run      nothing loads it by default and no report shows it ran */
            run: seen ? {
                status: 'fired',
                count: seen.count,
                files: seen.files.size,
                severities: seen.severities,
                sample: seen.sample,
                report: seen.source,
            } : {
                status: audit && audit.fresh ? 'clean' : loadedByScan ? 'no-findings' : audit ? 'stale' : 'not-run',
                count: 0, files: 0, severities: {}, sample: null,
                report: audit ? audit.report : loadedByScan ? 'TREASURE_MAP.json' : null,
                lastRanAt: audit && !audit.fresh ? audit.at : null,
            },
        };
    }).sort((a, b) => a.family.localeCompare(b.family) || a.code.localeCompare(b.code, 'en', { numeric: true }));

    const tmSrc = run.sources.find((s) => s.report === 'TREASURE_MAP.json') || {};
    return {
        generatedAt: new Date().toISOString(),
        generator: '_tools/eduscan/gen-rule-reference.js',
        sourceFilesRead: filesRead,
        scan: { scannedAt: tmSrc.at || null, filesScanned: tmSrc.filesScanned || null, findings: tmSrc.findings || 0, profile: 'ci' },
        reports: run.sources.length,
        totals: {
            rules: list.length,
            fired: list.filter((r) => r.run.status === 'fired').length,
            clean: list.filter((r) => r.run.status === 'clean').length,
            noFindings: list.filter((r) => r.run.status === 'no-findings').length,
            stale: list.filter((r) => r.run.status === 'stale').length,
            notRun: list.filter((r) => r.run.status === 'not-run').length,
            noSource: list.filter((r) => r.sources.length === 0).length,
            computedSeverity: list.filter((r) => r.severityComputed).length,
        },
        rules: list,
    };
}

/* Makes text safe inside a table cell for _tools/confluence/publish-solution.py's converter, which
   splits rows on EVERY "|" (it has no escape for one) and escapes "<", so "<br>" would print as
   text. A pipe in rule text becomes "¦" and newlines become spaces; there is no markup in cells. */
function cell(s) { return String(s == null ? '' : s).replace(/\|/g, '¦').replace(/\s*\n\s*/g, ' ').trim(); }

/* How the latest run left a rule, as a few words for a table cell. */
function runCell(run) {
    switch (run.status) {
        case 'fired': return `${run.count} in ${run.files} file${run.files === 1 ? '' : 's'}`;
        case 'clean': return 'ran clean';
        case 'no-findings': return 'no findings';
        case 'stale': return 'last ran ' + (run.lastRanAt || '').slice(0, 10);
        default: return 'not run';
    }
}

/* The Confluence page: a TLDR, a family summary, then one table per family. Only the scan DAY is
   printed, not the time. The page still changes whenever counts or line numbers do, so expect a
   Confluence version on most deploys; that is the record of the scanner changing. */
function toMarkdown(ref) {
    const day = (iso) => (iso ? iso.slice(0, 10) : 'unknown');
    const t = ref.totals;
    const fams = {};
    for (const r of ref.rules) (fams[r.family] = fams[r.family] || []).push(r);
    const L = [];
    L.push('# EduScan Rule Reference');
    L.push('');
    L.push('> **Generated, do not edit.** Written by `_tools/eduscan/gen-rule-reference.js` from the validator');
    L.push('> source after each Nexus scan, and re-published here on each deploy. Edit the validator, not this page.');
    L.push('');
    L.push('## TLDR');
    L.push('');
    L.push(`- **${t.rules} rule codes** defined in ${ref.sourceFilesRead} EduScan source files, in ${Object.keys(fams).length} families.`);
    L.push(`- **Latest scan:** ${day(ref.scan.scannedAt)}, ${ref.scan.filesScanned || '?'} files, ${ref.scan.findings} findings, profile \`${ref.scan.profile}\`.`);
    L.push(`- **Latest run:** ${t.fired} fired, ${t.clean} ran clean, ${t.noFindings} reported nothing, ${t.stale} last ran on an earlier day, ${t.notRun} did not run.`);
    L.push('- **Severity** is what the code sets. "computed" means the code decides per finding. A note says when the rule\'s own comment states a different severity.');
    L.push('- Live findings: the admin console Quality panel. To run: `node _tools/nexus/nexus.js scan`.');
    L.push('');
    L.push('## What the run column means');
    L.push('');
    L.push('| Run | Meaning |');
    L.push('|---|---|');
    L.push('| N in M files | The rule reported N findings in the latest run. |');
    L.push('| ran clean | Its audit wrote a report within 24 hours of this scan and found none of this kind. |');
    L.push('| no findings | The default scan loads this check and reported nothing. Some checks run only under another profile (for example `--profile strict`), so this does not prove it ran. |');
    L.push('| last ran DATE | The only evidence is an audit report from that day. Its findings are not counted here. |');
    L.push('| not run | Nothing runs it by default (functional, coverage, impact and some audits need a flag or their own command) and no report shows it ran. |');
    L.push('');
    L.push('## Families');
    L.push('');
    /* A finding reported under a parent code AND under its nested sub-codes (one BOX-011 finding per
       box, one BOX-011-FLAG-LEAK-* per leak inside it) would be counted twice in a family total, in
       mixed units. The total counts only the most specific code: a code with a fired sub-code is left
       out. */
    const firedCodes = ref.rules.filter((r) => r.run.status === 'fired').map((r) => r.code);
    const hasFiredChild = (code) => firedCodes.some((c) => c !== code && (c.startsWith(code + '-') || c.startsWith(code + '.')));
    L.push('| Family | Rules | Findings in latest run (most specific code) |');
    L.push('|---|---|---|');
    for (const f of Object.keys(fams).sort()) {
        const n = fams[f].reduce((a, r) => a + (r.run.status === 'fired' && !hasFiredChild(r.code) ? r.run.count : 0), 0);
        L.push(`| ${f} | ${fams[f].length} | ${n} |`);
    }
    for (const f of Object.keys(fams).sort()) {
        L.push('');
        L.push(`## ${f}`);
        L.push('');
        L.push('| Code | Severity | What it checks | How to fix | Latest run | Source |');
        L.push('|---|---|---|---|---|---|');
        for (const r of fams[f]) {
            const sev = r.severity.length ? r.severity.join(', ') + (r.severitySource === 'source comment' ? ' (per comment)' : '')
                : r.severityComputed ? 'computed' : 'not stated';
            const what = cell(r.description || '(no description in source)') + (r.note ? ' Note: ' + cell(r.note) : '');
            const src = r.sources.length
                ? r.sources.slice(0, 2).map((x) => '`' + x.replace(/ \(.*\)$/, '') + '`').join(', ') + (r.sources.length > 2 ? `, +${r.sources.length - 2} more` : '')
                : 'not located';
            L.push(`| **${r.code}** | ${sev} | ${what} | ${cell(r.fix || '')} | ${runCell(r.run)} | ${src} |`);
        }
    }
    L.push('');
    return L.join('\n');
}

if (require.main === module) {
    const ref = build();
    const json = JSON.stringify(ref, null, 2) + '\n';
    const md = toMarkdown(ref);
    if (process.argv.includes('--check')) {
        /* Writes nothing. Fails when a rule the run reported cannot be traced to source, or a rule
           has no description: either means the reference would mislead the person reading it. */
        console.log(`rules ${ref.totals.rules}, fired ${ref.totals.fired}, clean ${ref.totals.clean}, no findings ${ref.totals.noFindings}, stale ${ref.totals.stale}, not run ${ref.totals.notRun}, no source ${ref.totals.noSource}, computed severity ${ref.totals.computedSeverity}`);
        const untraced = ref.rules.filter((r) => r.sources.length === 0).map((r) => r.code);
        const blank = ref.rules.filter((r) => !r.description).map((r) => r.code);
        if (untraced.length) console.log('FAIL no source located for: ' + untraced.join(' '));
        if (blank.length) console.log('FAIL no description for: ' + blank.join(' '));
        process.exit(untraced.length || blank.length ? 1 : 0);
    }
    fs.writeFileSync(OUT_JSON, json);
    fs.writeFileSync(OUT_MD, md);
    console.log(`EduScan rule reference: ${ref.totals.rules} rules (${ref.totals.fired} fired in the latest run) -> ${path.relative(ROOT, OUT_JSON)}, ${path.relative(ROOT, OUT_MD)}`);
}

module.exports = { build, toMarkdown, OUT_JSON, OUT_MD,
    // exported for gen-rule-reference.test.js
    docDescriptions, textOf, parentOf, parse, CODE_RE, splitSeverityNote, severityNote, FRESH_MS };
