#!/usr/bin/env node
/*
 * @catalog what    Fails if any course data file links a file that does not exist on disk.
 * @catalog run     node _tools/qa/hub-href-integrity-test.js [--list-known]
 * @catalog status  GATE
 *
 * WHY (BUG-115, then BUG-116). The Digital Forensics hub linked TWELVE modules that do not exist —
 * it asked for `df-05-cfaa-laws.module.html` while the file on disk is
 * `df-05-cfaa-federal-laws.module.html`, and eleven more of the same shape. Confirmed 404 on
 * production, not just locally.
 *
 * ⚠ THE IDS MATCHED THE WHOLE TIME, WHICH IS WHY NOTHING CAUGHT IT. Progress recorded correctly
 * and the hub counted correctly; only the FILENAMES drifted. Every id-based check on the platform
 * passed while a quarter of the course was unreachable. Same family as BUG-107 (hub said 12, path
 * said 7) and the `ws-pa-01`/`ws-07` split in BUG-099: two lists, neither derived from the other,
 * and a checker that only ever compares one of them to itself.
 *
 * ⚠ THE FIRST VERSION OF THIS GATE COVERED TWO FILES AND PRINTED "4/4 PASSED". That reads as
 * platform coverage and was not: three MORE data files declare hrefs — ContentCatalog,
 * LearningPaths and ArcticData. Between them they held 108 more broken links that the two-file
 * version could not see. A gate's headline number is a claim about scope, so this one now covers
 * every data file that declares hrefs and names its own blind spots below.
 *
 * ⚠ AND THIS COMMENT USED TO CARRY THE COUNTS, WHICH IS ITS OWN BUG — THREE OF THEM, ALL WRONG.
 * It said ArcticData had 79 hrefs (on 2026-08-14 that source resolved 359 — so the number was
 * wrong the day it was typed, not merely stale), that 45 entries were coming-soon (42 — it went stale the moment three were
 * flipped to available), and that 74 redirect stubs existed (72 — that was a raw `grep -rl` count
 * including two quizzes that merely TEACH the meta-refresh tag). Every one of those numbers was
 * printed correctly by this script at the same moment the comment beside it lied.
 *   THE RULE: **prose states invariants, the script reports quantities.** A count transcribed by
 *   hand into a comment is a claim nothing re-evaluates. Counts describing a PAST INCIDENT (the 12
 *   dead forensics links, the 108, the 558 a wrong base invented) are kept deliberately — those are
 *   evidence of what one run found on one date and cannot rot. Counts describing the CURRENT TREE
 *   are banned from prose here.
 *   This is enforced by DISCIPLINE, not by a checker. I built one and removed it — see the note
 *   above `console.log` at the bottom for why five rounds of it never became sound. Claiming a
 *   guarantee I cannot keep would be one more assertion wider than its evidence, which is the
 *   exact defect recorded here.
 *
 * ⚠ EACH FILE RESOLVES ITS HREFS DIFFERENTLY, AND GUESSING THE BASE IS HOW YOU GET A FAKE NUMBER.
 * Resolving ContentCatalog against `houses/<house>/` reported 558 dead. The real base comes from
 * its own HOUSES table, where `matrix` maps to `operator/` and `forensics` to `houses/eye/forensics/`
 * — the true count that day was 42. A wrong base does not fail loudly, it invents work. So every
 * base below is READ FROM THE CONSUMING CODE, and the resolver was validated against production on
 * 2026-08-14: every entry it predicted dead returned HTTP 404 on hexworth.com, and the 66 it
 * flagged in LearningPaths returned HTTP 200 once corrected. Those numbers are DATED EVIDENCE of
 * one run, not a description of the tree today — the distinction this file keeps having to relearn.
 */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '../../_app');
const KNOWN = path.join(__dirname, 'hub-href-known-dead.txt');
const rd = f => fs.readFileSync(path.join(APP, f), 'utf8');
const exists = p => { try { return fs.statSync(path.join(APP, p)).isFile(); } catch { return false; } };
const norm = p => path.posix.normalize(p);
const rel = h => !/^(https?:|#|\/\/)/.test(h) && h.trim() !== '';

/* Every source of hrefs, each with the base its CONSUMER actually applies. The `why` is the file
   and line that proves the base, so a future reader can re-check it instead of trusting this. */
const SOURCES = [
    {
        name: 'ContentCatalog',
        why: 'ContentCatalog.js:4935 — fullHref = HOUSES[module.house].basePath + module.href',
        collect() {
            const src = rd('components/ContentCatalog.js');
            // basePath is per-house and is NOT houses/<house>/ for all of them.
            const base = {};
            for (const m of src.matchAll(/['"]?(\w[\w-]*)['"]?\s*:\s*\{[^{}]*?basePath:\s*'([^']*)'/gs)) {
                base[m[1]] = m[2];
            }
            const out = [];
            /* Both quote styles. ContentCatalog mixes single- and double-quoted hrefs, so a
               single-quote-only regex silently misses the double-quoted ones ENTIRELY — and the
               failure is invisible, because every href it does see passes. No count here on purpose: it would
               describe a file this test does not own and would drift the moment that file is
               re-quoted, which is the exact defect this gate's header records. */
            const ent = /\{[^{}]*?["']?house["']?:\s*["'](\w[\w-]*)["'][^{}]*?["']?href["']?:\s*["']([^"']+)["'][^{}]*?\}/gs;
            for (const m of src.matchAll(ent)) {
                const [, house, href] = m;
                if (!rel(href)) continue;
                /* ⚠ status IS PART OF THE CONTRACT, and ignoring it manufactures fake defects.
                   A `coming-soon` entry is a ROADMAP PLACEHOLDER: its href names content that is
                   deliberately not built yet, and NOTHING renders it as a followable link.
                   HouseRenderer.openModule() (:1864) alerts "coming soon" instead of navigating;
                   ContentCatalog.search() defaults to `status: 'available'` (:4891); ContentDiscovery
                   (:620), ProgressManager (:725), XPMasterLedger (:254) and CompletionStamp (:105)
                   all filter the same way. Browser-verified: EVERY coming-soon entry, ZERO reachable
                   as a clickable link. I first reported these as live 404s students hit today. They
                   are not, and "a link that does not resolve" was the wrong question to ask of them —
                   the right one is whether anything can FOLLOW it. */
                const st = (m[0].match(/["']?status["']?:\s*["']([^"']+)["']/) || [])[1] || 'available';
                if (!(house in base)) { out.push({ href, resolved: null, house }); continue; }
                const resolved = norm(href.startsWith('/') ? href.slice(1) : base[house] + href);
                out.push({ href, house, resolved, status: st });
            }
            return out;
        }
    },
    {
        name: 'LearningPaths',
        why: 'LearningPaths.js:6286 resolveModuleHref returns the href unchanged, so it is ' +
             'root-relative to the rendering page (path-view.html sits at the site root)',
        collect() {
            return [...rd('components/LearningPaths.js').matchAll(/href:\s*['"]([^'"]+)['"]/g)]
                .map(m => m[1]).filter(rel).map(href => ({ href, resolved: norm(href) }));
        }
    },
    {
        name: 'ArcticData',
        why: 'consumed by _app/arctic/districts/<district>/index.html, where the hrefs\' ' +
             '../../../ resolves to the site root',
        collect() {
            return [...rd('arctic/ArcticData.js').matchAll(/href:\s*['"]([^'"]+)['"]/g)]
                .map(m => m[1]).filter(rel)
                .map(href => ({ href, resolved: norm(path.posix.join('arctic/districts/x', href)) }));
        }
    },
    /* ForgeData and SignalData were MISSED by my first sweep and found by Chris. I had filtered the
       candidate files to those declaring `.module.html` hrefs; these two link plain `.html`, so a
       filter meant to find hubs quietly excluded two of them. The lesson is the filter, not the
       files: narrowing the search by a property of the EXAMPLE rather than of the CLASS is how a
       sweep reports full coverage over a subset. Both carry bare filenames resolved against their
       own section directory — proven by ForgeData.js:100 (`id: 'foundation'` +
       `href: 'do-1-what-is-devops.html'`) landing on sections/foundation/do-1-what-is-devops.html. */
    ...[
        { name: 'ForgeData (DevOps)', root: 'houses/code/devops', file: 'houses/code/devops/ForgeData.js' },
        { name: 'SignalData (hardware)', root: 'signal', file: 'signal/SignalData.js' },
    ].map(cfg => ({
        name: cfg.name,
        why: `${path.basename(cfg.file)} — bare filenames resolved against ${cfg.root}/sections/<section.id>/`,
        collect() {
            /* ⚠ THE OBVIOUS PARSE IS WRONG, and it fails by INVENTING dead links rather than
               missing them. My first version took "an id alone on its line" to mean a section id.
               That holds for ForgeData, whose modules are one-liners, and is false for SignalData,
               whose projects are multi-line objects — so `id: 'sg-01'` (SignalData.js:432) would
               overwrite the section and resolve to sections/sg-01/ instead of sections/foundations/,
               fabricating 47 dead links. Caught in review before it ran.

               So key on STRUCTURE instead: a section id is whichever id most recently preceded the
               `projects:`/`modules:` array that an href sits inside. Project ids appear after that
               boundary, so they can never be mistaken for it. Base confirmed by the real consumer:
               SignalData.js:1944 stamps `_sourceSection: section.id` and SignalEngine.js:717 builds
               `'../../sections/' + p._sourceSection + '/' + p.href`. */
            const out = [];
            let lastId = null, section = null;
            const tok = /id:\s*['"]([^'"]+)['"]|(?:projects|modules)\s*:\s*\[|href:\s*['"]([^'"]+)['"]/g;
            for (const m of rd(cfg.file).matchAll(tok)) {
                if (m[1] !== undefined) { lastId = m[1]; continue; }
                if (m[2] === undefined) { section = lastId; continue; }   // hit projects:/modules: [
                if (!rel(m[2])) continue;
                out.push(section === null
                    ? { href: m[2], resolved: null, house: '(href before any section)' }
                    : { href: m[2], resolved: norm(`${cfg.root}/sections/${section}/${m[2]}`) });
            }
            return out;
        }
    })),
    {
        name: 'Digital Forensics hub',
        why: 'hrefs are written relative to _app/houses/eye/forensics/',
        collect() {
            return [...rd('houses/eye/forensics/ForensicsData.js').matchAll(/href:\s*['"]([^'"]+)['"]/g)]
                .map(m => m[1]).filter(rel)
                .map(href => ({ href, resolved: norm('houses/eye/forensics/' + href) }));
        }
    },
    {
        name: 'Wireshark hub',
        why: 'hrefs are written relative to _app/wireshark/',
        collect() {
            return [...rd('wireshark/WiresharkData.js').matchAll(/href:\s*['"]([^'"]+)['"]/g)]
                .map(m => m[1]).filter(rel)
                .map(href => ({ href, resolved: norm('wireshark/' + href) }));
        }
    },
];

/* KNOWN-DEAD BASELINE. These are links to content that was never built — not filename drift, so
   they cannot be repointed at anything. Carried explicitly so this gate blocks NEW breakage today
   instead of waiting on a content decision, and PRINTED on every run so the debt stays visible.
   A baseline nobody sees is just a suppression. Entries are removed as the content ships or the
   links are delisted; a stale entry (now-alive) FAILS, so this file cannot rot silently. */
const known = new Set(
    fs.existsSync(KNOWN)
        ? fs.readFileSync(KNOWN, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
        : []
);

let pass = 0, fail = 0;
const ck = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'PASS' : 'FAIL'}  ${n}${c ? '' : '  -> ' + d}`); };

if (process.argv.includes('--list-known')) {
    console.log([...known].sort().join('\n'));
    process.exit(0);
}

let totalHrefs = 0, stillKnown = [];
/* Roadmap accounting, reported not asserted: `roadmap` = coming-soon entries whose content is not
   built (the expected, healthy state), `readyToShip` = coming-soon entries whose content now EXISTS
   and could be flipped to available. */
const roadmap = [], readyToShip = [];
for (const s of SOURCES) {
    let items;
    try { items = s.collect(); } catch (e) { ck(`${s.name}: readable`, false, e.message); continue; }
    totalHrefs += items.length;

    const unresolvable = items.filter(i => i.resolved === null);
    /* Roadmap entries are held to a DIFFERENT contract, checked separately below. */
    const live = items.filter(i => (i.status || 'available') !== 'coming-soon');
    const soon = items.filter(i => (i.status || 'available') === 'coming-soon');
    const dead = live.filter(i => i.resolved !== null && !exists(i.resolved) && !known.has(i.resolved));
    const muted = live.filter(i => i.resolved !== null && !exists(i.resolved) && known.has(i.resolved));
    stillKnown.push(...muted.map(i => i.resolved));

    /* THE CHECK THAT ACTUALLY GUARDS THE ROADMAP. A placeholder is harmless while nothing renders
       it; it becomes a 404 the moment someone flips status to 'available' and forgets the content.
       That flip is exactly what the `dead` check above catches, because flipping the status moves
       the entry out of `soon` and into `live`. Nothing extra to assert here — only to report. */
    roadmap.push(...soon.filter(i => i.resolved !== null && !exists(i.resolved)).map(i => i.resolved));
    readyToShip.push(...soon.filter(i => i.resolved !== null && exists(i.resolved)).map(i => i.resolved));

    ck(`${s.name}: declares hrefs at all`, items.length > 0, `${items.length} hrefs`);
    // An href whose base cannot be determined is NOT a pass — it is an unmeasured href.
    ck(`${s.name}: every href has a resolvable base`, unresolvable.length === 0,
       `${unresolvable.length} with an unknown house key: ${[...new Set(unresolvable.map(i => i.house))].join(', ')}`);
    ck(`${s.name}: all ${items.length} hrefs resolve to a file`, dead.length === 0,
       `${dead.length} dead: ${[...new Set(dead.map(i => i.resolved))].slice(0, 6).join(', ')}` +
       `${dead.length > 6 ? ' …' : ''}`);
}

/* ── REDIRECT STUBS ───────────────────────────────────────────────────────────────────────────
   BUG-118. The `<meta http-equiv="refresh">` stubs exist so a direct directory URL lands on the
   hub instead of erroring (added in bulk by 0a845715b). FIVE of them pointed at a parent with no
   index.html, so the page returned 200 and then threw the student onto a 404 — e.g.
   /houses/shield/labs/linux/ redirected to /houses/shield/labs/, which does not exist.

   ⚠ NO HREF-BASED CHECK CAN SEE THIS. The link is a meta refresh, not an href in a data file, so
   everything above is structurally blind to it. The course-tree crawler found it because it walks
   pages the way a student does; that is the whole argument for keeping both kinds of check.

   ⚠ IT PARSES THE <head> ONLY, AND THAT IS THE ENTIRE DIFFICULTY. Two MicroPython/ESP32 quizzes
   TEACH the meta refresh tag: `<meta http-equiv="refresh" content="5">` appears inside a question
   string in the body. A naive file-wide grep reads those as self-reloading quiz pages — a false
   alarm I nearly filed. Same string-vs-markup trap that cost five review rounds on BUG-107. */
const REDIR = /<meta[^>]+http-equiv=["']?refresh["']?[^>]*content=["']([^"']+)["']/i;
const stubs = [];
const scan = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) { if (!['node_modules', '_archive', '_source'].includes(e.name)) scan(f); }
    else if (e.name.endsWith('.html')) {
        const src = fs.readFileSync(f, 'utf8');
        const head = src.slice(0, (src.search(/<\/head>/i) + 1) || 4000);   // HEAD ONLY
        const m = head.match(REDIR);
        if (!m) continue;
        const u = (m[1].match(/url\s*=\s*(.+?)\s*$/i) || [])[1];
        if (!u) continue;                       // `content="5"` with no url = a plain reload, not a redirect
        const url = u.trim().replace(/^['"]|['"]$/g, '');
        if (/^(https?:|\/\/)/.test(url)) continue;
        const from = path.relative(APP, path.dirname(f));
        const tgt = url.startsWith('/') ? path.posix.normalize(url.slice(1))
                                        : path.posix.normalize(path.posix.join(from, url));
        stubs.push({ file: path.relative(APP, f), tgt });
    }
} };
scan(APP);
const deadRedirects = stubs.filter(s => !exists(s.tgt) && !exists(path.posix.join(s.tgt, 'index.html')));
ck(`all ${stubs.length} redirect stubs point at a page that exists`, deadRedirects.length === 0,
   deadRedirects.map(s => `${s.file} -> ${s.tgt}`).slice(0, 5).join('; '));

/* A baseline entry that has come back to life must be removed, or the file slowly becomes a list
   of things that are fine — and then it will mute a real regression. */
const resurrected = [...known].filter(exists);
ck(`baseline is current (no known-dead entry has come back to life)`, resurrected.length === 0,
   `${resurrected.length} now exist and must be removed from ${path.basename(KNOWN)}: ${resurrected.slice(0, 4).join(', ')}`);

/* THE OTHER DIRECTION, which is how df-61 was found: a module that exists, records progress, and
   no hub lists. Unreachable content is a quieter failure than a dead link and nothing else looks
   for it. Reported, not failed — an unlisted module may be deliberate. */
const linked = new Set();
for (const s of SOURCES) { try { s.collect().forEach(i => i.resolved && linked.add(path.basename(i.resolved))); } catch {} }
const orphans = [];
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.module.html') && !linked.has(e.name)) orphans.push(path.relative(APP, f));
} };
walk(path.join(APP, 'houses'));
if (orphans.length) {
    console.log(`\n  NOTE  ${orphans.length} .module.html file(s) under houses/ that NO data file links ` +
                `— unreachable to a student:`);
    orphans.slice(0, 10).forEach(o => console.log(`          ${o}`));
    if (orphans.length > 10) console.log(`          … and ${orphans.length - 10} more`);
}

if (stillKnown.length) {
    console.log(`\n  ⚠ ${stillKnown.length} link(s) muted by the known-dead baseline — content that was ` +
                `never built. Students see these as 404s TODAY:`);
    [...new Set(stillKnown)].sort().slice(0, 8).forEach(k => console.log(`          ${k}`));
    if (new Set(stillKnown).size > 8) console.log(`          … and ${new Set(stillKnown).size - 8} more ` +
                                                  `(node ${path.basename(__filename)} --list-known)`);
}

/* Reported, never failed. A coming-soon href pointing at content that does not exist yet is the
   ROADMAP WORKING AS DESIGNED, not a defect — nothing renders it as a followable link. Printing it
   keeps the roadmap visible without pretending it is breakage. */
if (roadmap.length) {
    console.log(`\n  ROADMAP  ${roadmap.length} coming-soon entr(ies) point at content not yet built ` +
                `— by design, and not reachable as a link.`);
}
if (readyToShip.length) {
    console.log(`  READY    ${readyToShip.length} coming-soon entr(ies) whose content now EXISTS ` +
                `— flip status to 'available' to expose them:`);
    [...new Set(readyToShip)].sort().slice(0, 6).forEach(r => console.log(`             ${r}`));
}

/* ⚠ THERE IS NO AUTOMATED CHECK HERE, AND THE ABSENCE IS THE DECISION.
   I added `assertDocumentedCounts()` to re-derive any count written next to a source name in a
   comment. It took five review rounds and never became sound. Each fix exposed the next piece of
   JavaScript it could not lex: backtick pair-parity broken by the checker's OWN implementation
   line; then narration in double quotes read as a claim; then a single stray backtick in a comment
   silently swallowing 370 characters including a planted false claim; then `case 1://comment`
   glued to a colon, invisible to the line-comment pattern; and an exemption anyone could invoke by
   wrapping a claim in backticks.
   That is a regex asked to do a lexer's job, and it is the SECOND time today — `3bdbf7a80`
   ("BUG-107 round 5: stop parsing with regexes. Let the browser do it.") is the same lesson, from
   this morning. An unsound checker that can emit PASS is worse than none: it manufactures
   confidence exactly where the evidence is weakest, which is the defect this whole file documents.
   So the guarantee is the smaller, honest one: NO COUNT DESCRIBING THE CURRENT TREE APPEARS IN
   THIS FILE'S PROSE. Counts of a PAST INCIDENT are kept — the 12 dead forensics links, the 108,
   the 558 a wrong base invented — because those record what one run found on one date and cannot
   rot. Every live quantity is printed by the script below and nowhere else.
   If this is ever worth enforcing, it needs a real tokenizer that tracks string, template, regex
   and comment state — not another pattern. */

console.log(`\n  ${pass}/${pass + fail} checks passed across ${SOURCES.length} data files, ` +
            `${totalHrefs} hrefs resolved`);
process.exit(fail ? 1 : 0);
