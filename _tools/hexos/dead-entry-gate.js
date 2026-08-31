#!/usr/bin/env node
/**
 * dead-entry-gate.js  —  HEXOS-3
 *
 * @catalog what    Fails if any app in hex-apps.json points at a file that does not exist, or is
 * @catalog what    reachable from nowhere. Makes the dead-entry class impossible, not findable.
 * @catalog run     node _tools/hexos/dead-entry-gate.js [--baseline] [--json]
 * @catalog status  GATE
 *
 * WHY, and why it comes BEFORE the launcher grid
 * ----------------------------------------------
 * The scope doc pins the order (`_docs/architecture/hex-os-scope.md`), and taskboard #323/#324
 * say it outright: "a launcher over unverified entries is a prettier version of the current
 * problem." I built the grid first anyway, without reading it. A reviewer caught that. This gate
 * is the thing that should have existed already.
 *
 * It subsumes two items being triaged by hand today: #272 (a final exam students cannot reach
 * from its own hub) and #277 (551 catalog entries with no inbound href). Triage finds instances;
 * a gate makes the class impossible.
 *
 * TWO SEPARATE FAILURES, deliberately not merged
 * ----------------------------------------------
 *   BROKEN     the entry resolves to no file on disk. Always fatal: `run <app>` would 404.
 *   UNREACHED  the file exists but nothing links to it, so only someone typing the URL or using
 *              the shell can arrive. Baselined, because the platform starts with a known
 *              population of these and failing on all of them on day one would just get the gate
 *              disabled. NEW ones fail.
 *
 * WHAT THIS CANNOT DO, stated because a gate that overstates itself is worse than none:
 *   - It cannot prove a page RENDERS. A file can exist, be linked, and still be broken.
 *   - It checks inbound links by scanning href attributes in _app HTML. A link built at runtime
 *     by JS is invisible to it, so a page reachable only through a JS-constructed link will be
 *     reported UNREACHED. That is a false positive, and the baseline is where it goes.
 *   - It does not check HTTP status against a running server; it checks the filesystem the deploy
 *     actually ships. That is closer to the truth for a static host, not further from it.
 */

'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const MANIFEST = path.join(APP, 'data/hex-apps.json');
const BASELINE = path.join(REPO, '_tools/hexos/unreached-baseline.json');

/**
 * Every .html AND .js file under _app.
 *
 * The .js half is not optional and its absence was not a small gap. An earlier version scanned
 * HTML only, and a reviewer traced the result: LearningPaths.js, HouseRenderer.js, HubRegistry.js
 * and ArcticData.js build the platform's dominant navigation for the `course` and `cert-prep`
 * categories, and dashboard.html loads LearningPaths.js directly. So about 18 of the 21 entries
 * this gate called "unreached" were scanner blindness, and I wrote them into a baseline file
 * whose own text asserts "nothing links to" them.
 *
 * The second-order damage was worse than the mislabelling. Baselining a false positive removes
 * regression protection for that entry permanently: delete aws-ccp from LearningPaths.js next
 * month and the gate reports no change, because it was already "known unreached" for an
 * unrelated reason. The category most likely to break was the category with zero coverage.
 *
 * Literal string sweep, not execution. A href assembled from variables at runtime is still
 * invisible, and that residue is what the baseline is legitimately for.
 */
function allSource(dir, out) {
    out = out || [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_archive') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) allSource(p, out);
        else if (e.name.endsWith('.html') || e.name.endsWith('.js')) out.push(p);
    }
    return out;
}


/**
 * Remove text that contains paths which are NOT links.
 *
 * Comments were only half of it, and saying "all four shapes are fixed" after stripping comments
 * was wrong: a reviewer proved it by breaking the real inbound link to /wall-of-shame/, dropping
 * a file containing only an `if (false)` branch and an EXCLUDE_LIST array, and watching the gate
 * still call the page reachable. `if (false) { ... }` and `const EXCLUDE_LIST = [...]` are live,
 * syntactically valid code; no comment regex can touch them.
 *
 * Over-matching is the dangerous direction for this gate. Under-matching yields noise a human
 * triages; over-matching silently reports an unreachable page as reached and removes the only
 * coverage that exists.
 *
 * WHAT THIS STILL CANNOT DO. Real residue, not formality, and listed in both directions because
 * an earlier version of this note disclosed only the harmless one:
 *
 *   UNDER-matching (safe: produces noise a human triages)
 *     A path inside a function nothing ever calls, or behind a condition false at runtime but not
 *     literally `false`, still counts as a link. That needs reachability analysis, not text. If
 *     this gate ever reports zero unreached platform-wide, suspect this first.
 *
 *   OVER-matching (dangerous: silently removes coverage)
 *     The dead-block scan is text, not a parser. It skips string and template literals when
 *     depth-counting, and bails without deleting anything if the depth never balances, but a
 *     regex literal containing a brace is NOT skipped and could still desync it.
 *     The EXCLUDE/DENY/IGNORE/SKIP name list is a CONVENTION, not a guarantee. An array named
 *     LEGACY_HOUSES holding a route that is still served would be stripped, and that page would
 *     drop out of coverage with no error and nothing to grep for. Whole-word SCREAMING_CASE
 *     matching narrows this; it does not close it. Prefer renaming such an array over trusting
 *     this gate to be clever about it.
 */
function stripDead(src) {
    let out = src
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

    // `if (false) { ... }` and `if (0) { ... }`, brace-matched so nested blocks survive intact.
    out = out.replace(/\bif\s*\(\s*(?:false|0)\s*\)\s*\{/g, 'if(0){\u0000');
    let i;
    while ((i = out.indexOf('\u0000')) !== -1) {
        // Depth counting must SKIP string and template literals. Counting every literal brace
        // desyncs on `if (false) { const s = "{"; }`: the counter never finds its close, runs off
        // the end, and the removal eats every live link after it. A reviewer reproduced exactly
        // that and it over-matches, which this file calls the dangerous direction. Stray braces in
        // error messages, templates and CSS-in-JS are ordinary, not adversarial.
        let depth = 1, j = i + 1, quote = null;
        while (j < out.length && depth > 0) {
            const c = out[j];
            if (quote) {
                if (c === '\\') { j += 2; continue; }
                if (c === quote) quote = null;
            } else if (c === '"' || c === "'" || c === '`') {
                quote = c;
            } else if (c === '{') depth++;
            else if (c === '}') depth--;
            j++;
        }
        // Unbalanced after skipping literals means the parse is untrustworthy. Drop only the
        // marker and keep the text, because a wrong guess here DELETES real links.
        out = depth === 0 ? out.slice(0, i) + out.slice(j)
                          : out.slice(0, i) + out.slice(i + 1);
    }

    // Declarations whose NAME says the contents are not navigation targets.
    // WHOLE-WORD trigger, not substring. `.*EXCLUDE.*` also swallowed `legacyHouses`,
    // `skipNavTargets` and `blockedUsersRedirect`, and this codebase already contains
    // SYNC_EXCLUDED_PREFIXES, BLOCKED_GLOBALS and skipPrefixes. The day one of those holds a real
    // route, the page drops out of coverage with no error and nothing to grep for. Requiring the
    // trigger to be a whole word in SCREAMING_CASE keeps the convention while refusing to guess.
    out = out.replace(
        /\b(?:const|let|var)\s+(?:[A-Z0-9_$]*_)?(?:EXCLUDE|EXCLUDED|EXCLUDE_LIST|DENY|DENYLIST|IGNORE|SKIP|BLOCKED|BLOCKLIST|DEPRECATED|LEGACY|REMOVED)(?:_[A-Z0-9_$]*)?\s*=\s*\[[\s\S]*?\]/g,
        '');
    return out;
}

/** Resolve a manifest entry to a path on disk, applying the same directory-index rule Firebase uses. */
function resolveEntry(entry) {
    if (typeof entry !== 'string' || !entry.startsWith('/')) return null;
    const clean = entry.split('?')[0].split('#')[0];
    const direct = path.join(APP, clean);
    if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
    const asIndex = path.join(direct, 'index.html');
    if (fs.existsSync(asIndex)) return asIndex;
    return null;
}

function main() {
    const args = process.argv.slice(2);
    const apps = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')).apps || [];

    // One pass over every page's hrefs. Normalised to a path so /x/, /x/index.html and
    // /x/index.html?a=1 all count as reaching the same entry: a link that works in a browser
    // must count as a link here, or the gate manufactures unreachability that does not exist.
    const linked = new Set();
    for (const f of allSource(APP)) {
        // Comments stripped FIRST, in both file types. Without this the sweep counts a path
        // inside a commented-out block, an `if (false)` branch, or an EXCLUDE_LIST as a real
        // inbound link, marking an app reachable when nothing reaches it. A reviewer proved all
        // four shapes match. This is the same comment-stripping already applied to the prose
        // detector in hex-manual-check during this same round; not applying it here was the
        // lesson learned one file away and not carried across.
        // Over-matching is the DANGEROUS direction for this gate: under-matching produces noisy
        // false positives someone must triage, while over-matching silently reports an
        // unreachable page as reached and removes the very coverage the gate exists to give.
        const html = stripDead(fs.readFileSync(f, 'utf8'));
        // BOTH quote styles: 709 hrefs in _app use single quotes, and a scanner that misses
        // them manufactures unreachability.
        // In .js, a path lives in a string literal or an object field (courseHref, entry, url),
        // not in an href= attribute. Sweep quoted strings that look like site paths as well.
        const re = f.endsWith('.js')
            ? /["'`]((?:\/|(?:houses|labs|games|arcade|dark-arts|cloud|signal|career)\/)[^"'`\s]*\.html|\/[A-Za-z0-9_\-\/]+\/)["'`]/g
            : /href\s*=\s*["']([^"']+)["']/g;
        let m;
        while ((m = re.exec(html))) {
            let h = m[1].split('?')[0].split('#')[0];
            if (!h || /^[a-z]+:/i.test(h) || h.startsWith('#')) continue;
            // RELATIVE hrefs are 88% of _app (17,981 vs 2,459 absolute). An earlier version of
            // this scanner dropped them, flagged 151 of 189 apps unreached, and instructed the
            // operator to baseline the lot -- after which the gate would have reported OK
            // forever while checking nothing. A gate that defeats its own purpose is worse than
            // no gate. Resolve against the linking file's directory and normalise to an
            // _app-root path so a link that works in a browser counts as a link here.
            if (!h.startsWith('/')) {
                const abs = path.resolve(path.dirname(f), h);
                if (!abs.startsWith(APP)) continue;      // escapes the web root; not a valid link
                h = '/' + path.relative(APP, abs).split(path.sep).join('/');
            }
            linked.add(h);
            if (h.endsWith('/')) linked.add(h + 'index.html');
            if (h.endsWith('/index.html')) linked.add(h.slice(0, -'index.html'.length));
        }
    }

    const broken = [], unreached = [];
    for (const a of apps) {
        if (!resolveEntry(a.entry)) { broken.push(a); continue; }
        const e = a.entry.split('?')[0].split('#')[0];
        const alt = e.endsWith('/') ? e + 'index.html'
                  : e.endsWith('/index.html') ? e.slice(0, -'index.html'.length) : null;
        if (!linked.has(e) && !(alt && linked.has(alt))) unreached.push(a);
    }

    if (args.includes('--json')) {
        console.log(JSON.stringify({ broken: broken.map(a => a.id), unreached: unreached.map(a => a.id) }, null, 2));
        return;
    }

    if (args.includes('--baseline')) {
        // PRESERVE the per-entry justifications and refuse to bulk-baseline blind.
        // An earlier version rewrote this file wholesale with a weaker note and dropped the
        // `confirmed` object entirely, so running the tool's own documented recovery command
        // reverted the review discipline that the note asked for. A reviewer found that the
        // safety documentation did not survive the tool's normal use path, which is worse than
        // it being unenforced: it actively undid itself.
        const prev = fs.existsSync(BASELINE)
            ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : { confirmed: {} };
        const confirmed = prev.confirmed || {};
        const added = unreached.map(a => a.id).filter(id => !(id in confirmed));
        if (added.length && !args.includes('--i-have-checked-each')) {
            console.error(`refusing to baseline ${added.length} entr(ies) with no justification:`);
            added.forEach(id => console.error(`  ${id}`));
            console.error('\nEach one is either a real orphan to FIX or a by-design page. Confirm');
            console.error('individually, add a line per id under "confirmed" in');
            console.error(`  ${path.relative(REPO, BASELINE)}`);
            console.error('then re-run with --i-have-checked-each.');
            console.error('\nBulk-baselining is how 19 scanner false positives were once recorded');
            console.error('as fact, which silently removed regression cover for every one of them.');
            process.exitCode = 1;
            return;
        }
        added.forEach(id => { confirmed[id] = 'UNJUSTIFIED: added with --i-have-checked-each.'; });
        fs.writeFileSync(BASELINE, JSON.stringify({
            note: prev.note || ('Apps deliberately reachable only by a typed URL or the hex shell. '
                + 'Each entry must be INDIVIDUALLY confirmed by-design, not swept in because a '
                + 'scan reported it. Baselining a false positive silently removes regression '
                + 'protection for that entry forever.'),
            known: unreached.map(a => a.id).sort(),
            count: unreached.length,
            confirmed
        }, null, 2) + '\n');
        console.log(`wrote baseline: ${unreached.length} unreached app(s)`);
        return;
    }

    let known = [], confirmedNow = {};
    if (fs.existsSync(BASELINE)) {
        const b = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
        known = b.known || [];
        confirmedNow = b.confirmed || {};
    }
    // The UNJUSTIFIED marker is CONSUMED, not decorative. A reviewer's point: --i-have-checked-each
    // writes that string whether or not anyone looked, so without something reading it back a
    // baseline full of placeholders would pass forever. It now fails the gate, which is the whole
    // difference between a marker and a speed bump.
    const placeholder = Object.keys(confirmedNow)
        .filter(id => /^UNJUSTIFIED/.test(String(confirmedNow[id])));
    if (placeholder.length) {
        console.error('baseline entr(ies) recorded with a placeholder instead of a reason:');
        placeholder.forEach(id => console.error(`  ${id}`));
        console.error('\nReplace each with why that page is deliberately unlinked, or fix the page');
        console.error('so it is reachable. A baseline of placeholders passes forever and covers nothing.');
        process.exit(1);
    }
    const newlyUnreached = unreached.filter(a => known.indexOf(a.id) === -1);

    console.log(`swept ${apps.length} apps: ${broken.length} broken, ${unreached.length} unreached ` +
                `(${known.length} baselined, ${newlyUnreached.length} new)`);

    let bad = false;
    if (broken.length) {
        bad = true;
        console.error('\nBROKEN: the manifest points at files that do not exist. `run <id>` would 404:');
        broken.forEach(a => console.error(`  ${a.id}  ->  ${a.entry}`));
    }
    if (newlyUnreached.length) {
        bad = true;
        console.error('\nUNREACHED (new): these exist but nothing in _app links to them, so only');
        console.error('someone typing the URL or using the hex shell can arrive:');
        newlyUnreached.forEach(a => console.error(`  ${a.id}  ->  ${a.entry}`));
        console.error('\nLink it from its house or hub, or if it is deliberately unlinked, run');
        console.error('  node _tools/hexos/dead-entry-gate.js --baseline');
        console.error('which records the decision instead of leaving it to be rediscovered.');
    }
    if (bad) process.exit(1);
    console.log('OK: every app resolves to a real file, and no NEW app is unreachable.');
}

if (require.main === module) main();
module.exports = { resolveEntry };
