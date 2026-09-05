#!/usr/bin/env node
/**
 * safe-entry.test.js
 *
 * @catalog what    Permanent coverage for safeEntry: proves the two copies have not drifted, and
 * @catalog what    proves in a real browser that a control character cannot smuggle an offsite link.
 * @catalog run     node _tools/hexos/safe-entry.test.js
 * @catalog status  GATE
 *
 * WHY
 * ---
 * `safeEntry` decides whether a manifest row becomes a clickable link, and it exists byte-identical
 * in two files: the shell (`_app/hex/index.html`) and the launcher grid (`_app/hex/apps.html`).
 * One reviewer flagged the duplication as drift risk; a second then found the function itself was
 * WRONG in both copies. One bug, two places, one of them deployed.
 *
 * The evidence that found it was a real browser reading `a.href`, not a regex `.test()`. That
 * distinction is the whole point of this file: the parser normalises the string BEFORE deciding
 * scheme-relativity, so reasoning about the raw string is reasoning about the wrong artefact.
 *
 * TWO THINGS ARE CHECKED, and both were separately missing:
 *   1. DRIFT   the two copies must remain textually identical. Nothing enforced this before.
 *   2. ESCAPE  no vector may resolve off-origin, verified by assigning to an <a> and reading
 *              .hostname over a real HTTP origin. about:blank gives FALSE NEGATIVES here, because
 *              opaque-origin URL resolution fails silently.
 *
 * TAB, LF and CR are the vectors actually shown to escape: WHATWG removes those anywhere in the
 * string. FF, VT, SPACE and NUL pass the old shape check but percent-encode into the path and stay
 * same-origin; they are asserted blocked as a defensive superset, and this file does NOT claim they
 * were exploitable. An earlier comment did claim that, having checked only the regex.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const FILES = ['hex/index.html', 'hex/apps.html'];
/* PORT 0: the OS assigns a free port at listen time, set in the listen callback below.
   These suites each hardcoded a port, which makes them unsafe to run concurrently with
   each other or with themselves. Two of them were already colliding on 9311. Reproduced
   directly: two instances of one suite at once, one passed and the other died with
   EADDRINUSE. Phantom failures are worse than no test, because they train whoever sees
   them to re-run until green. */
let PORT = 0;

let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; cannot verify in a browser. Refusing to fake a pass.');
    process.exit(2);
}

/** Pull the shipped implementation out of a file, so the test exercises code that ships. */
function extract(rel) {
    const src = fs.readFileSync(path.join(APP, rel), 'utf8');
    const m = src.match(/function safeEntry\(e\) \{[\s\S]*?\n {4}\}/);
    if (!m) throw new Error('safeEntry not found in ' + rel);
    return m[0];
}

const srv = http.createServer((q, r) => {
    r.writeHead(200, { 'Content-Type': 'text/html' });
    r.end('<!doctype html><title>t</title>');
});

srv.on('error', (e) => {
    console.error(`  harness could not bind port ${PORT}: ${e.code || e.message}. Nothing was verified.`);
    process.exit(1);
});

srv.listen(0, '127.0.0.1', async () => {
    PORT = srv.address().port;
    let pass = 0, fail = 0;
    const chk = (n, c, d) => { c ? pass++ : fail++; console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 90)}`); };

    // 1. DRIFT
    const impls = FILES.map(extract);
    chk('the two safeEntry copies have not drifted', impls[0] === impls[1],
        'index.html and apps.html differ; one bug would now need fixing twice');

    // 2. ESCAPE, in a browser, against the shipped source of each file.
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    await pg.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });

    const VECTORS = [
        { name: 'TAB', ch: '\t', escapes: true }, { name: 'LF', ch: '\n', escapes: true },
        { name: 'CR', ch: '\r', escapes: true }, { name: 'FF', ch: '\f', escapes: false },
        { name: 'VT', ch: '\v', escapes: false }, { name: 'SPACE', ch: ' ', escapes: false },
        { name: 'NUL', ch: '\0', escapes: false }
    ];

    for (let i = 0; i < FILES.length; i++) {
        const res = await pg.evaluate((src, vecs) => {
            eval(src);
            const out = [];
            vecs.forEach(function (v) {
                const allowed = safeEntry('/' + v.ch + '/evil.example.com');
                const a = document.createElement('a');
                a.href = allowed === null ? '/blocked' : allowed;
                out.push({ name: v.name, allowed: allowed !== null, host: a.hostname });
            });
            const ok = document.createElement('a');
            ok.href = safeEntry('/houses/matrix/adv-linux/index.html') || '/REJECTED';
            out.push({ name: 'legit', allowed: true, host: ok.hostname, path: ok.pathname });
            return out;
        }, impls[i], VECTORS);

        res.forEach(function (r) {
            if (r.name === 'legit') {
                chk(`${FILES[i]}: a real manifest entry still resolves same-origin`,
                    r.host === '127.0.0.1' && r.path.indexOf('/houses/matrix/') === 0, JSON.stringify(r));
            } else {
                chk(`${FILES[i]}: ${r.name} cannot reach another origin`,
                    !r.allowed && r.host === '127.0.0.1', JSON.stringify(r));
            }
        });
    }

    // 3. No regression against the real data the shell actually loads.
    const apps = JSON.parse(fs.readFileSync(path.join(APP, 'data/hex-apps.json'), 'utf8')).apps || [];
    const rejected = await pg.evaluate((src, entries) => {
        eval(src);
        return entries.filter(function (e) { return safeEntry(e) === null; });
    }, impls[0], apps.map(a => a.entry));
    chk('no real manifest entry is rejected', rejected.length === 0, rejected.slice(0, 3).join(', '));

    console.log(`\n  ${pass}/${pass + fail} passed`);
    await b.close(); srv.close();
    process.exitCode = fail ? 1 : 0;
});
