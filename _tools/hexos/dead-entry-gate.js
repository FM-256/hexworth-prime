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

/** Every .html file under _app, so inbound links can be scanned once rather than per app. */
function allHtml(dir, out) {
    out = out || [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_archive') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) allHtml(p, out);
        else if (e.name.endsWith('.html')) out.push(p);
    }
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
    for (const f of allHtml(APP)) {
        const html = fs.readFileSync(f, 'utf8');
        // BOTH quote styles: 709 hrefs in _app use single quotes, and a scanner that misses
        // them manufactures unreachability.
        const re = /href\s*=\s*["']([^"']+)["']/g;
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
        fs.writeFileSync(BASELINE, JSON.stringify({
            note: 'Apps that exist but nothing links to. NEW ones fail the gate; these are the ' +
                  'population that predates it. Shrinking this list is the point; growing it is a bug.',
            known: unreached.map(a => a.id).sort(),
            count: unreached.length
        }, null, 2) + '\n');
        console.log(`wrote baseline: ${unreached.length} unreached app(s)`);
        return;
    }

    let known = [];
    if (fs.existsSync(BASELINE)) known = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).known || [];
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
