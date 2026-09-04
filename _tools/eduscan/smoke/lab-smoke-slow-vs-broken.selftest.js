#!/usr/bin/env node
/**
 * @catalog what    Self-test: the lab smoke must tell a SLOW load apart from a BROKEN one
 * @catalog run     node _tools/eduscan/smoke/lab-smoke-slow-vs-broken.selftest.js
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS
 * ---------------
 * On a real deploy (2026-09-03) post-verify failed with
 * `CONFIG-GLOBAL "PISL09Config" never attached within 20000ms`, and the identical run passed 10/0
 * minutes later with nothing changed. Not a regression: pis-l09 is the FIRST lab visited so it
 * absorbs browser cold-start, its page loads 11 blocking scripts with no defer/async, config.js is
 * the 10th of them, and the whole ~443KB chain has to execute before the global exists. The gate
 * runs immediately after `firebase deploy`, the one moment every asset is a guaranteed cold miss.
 *
 * The old code could not distinguish "the page could not fetch what it needed" (a regression to
 * revert) from "the page had not finished loading yet" (a slow network to wait out), and reported
 * both with the same message. A gate whose red means two opposite things trains people to re-run
 * it until green, which is how a real answer-key leak eventually ships unnoticed.
 *
 * This drives the REAL smoke script against a local server that serves the real _app tree, with
 * ONLY pis-l09's config.js doctored. Three fixtures, because one of them passing proves nothing:
 *
 *   broken -> config.js 404s              -> must FAIL on the FIRST attempt, naming the request
 *   slow   -> empty on load 1, real on 2  -> must PASS, reporting `load (slow)`
 *   absent -> empty on every load         -> must FAIL, saying it is NOT a cold cache
 *
 * `slow` uses an empty-then-real body rather than a real 25-second stall on purpose: it exercises
 * the exact control flow (nothing attached on attempt one, attached on attempt two, no failed
 * requests either time) without adding a minute of sleeping to the suite.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const APP = path.join(ROOT, '_app');
const SMOKE = path.join(ROOT, '_tools', 'smoke-lab-content-leaks.js');
const CFG = '/houses/shield/infosec/labs/pis-l09-outbreak-detection/config.js';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
               '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

let pass = 0, fail = 0;

function serve(mode, port) {
    let cfgHits = 0;
    const srv = http.createServer((q, r) => {
        let p = decodeURIComponent(q.url.split('?')[0]);
        /* Stub FirebaseAuth. Against 127.0.0.1 the real one attempts an anonymous sign-in that
           Firebase refuses with `requests-from-referer-...-are-blocked`, producing a 403 and two
           console errors that fail `no js errors` for reasons that have nothing to do with what
           these fixtures test. Production is an allowlisted origin, which is why the live run is
           clean. Stubbing here keeps the fixture measuring the slow-vs-broken logic and nothing
           else. */
        if (p === '/components/FirebaseAuth.js') {
            r.writeHead(200, { 'Content-Type': 'text/javascript' });
            // The surface the arena engine and lab pages actually call, grepped rather than
            // guessed: an incomplete stub is worse than none, because a missing method throws
            // inside firebase-init and fails `no js errors` on EVERY lab, which is a louder
            // false alarm than the one being removed.
            return r.end(
                'window.FirebaseAuth={' +
                'waitForAuth(){return Promise.resolve(null);},' +
                'signInAnonymously(){return Promise.resolve(null);},' +
                'isSignedIn(){return false;},' +
                'getUser(){return null;},' +
                'uid(){return null;},' +
                'callFunction(){return Promise.resolve({});},' +
                'onAuthStateChanged(){},signOut(){return Promise.resolve();}' +
                '};'
            );
        }
        if (p === CFG) {
            cfgHits++;
            if (mode === 'broken') { r.writeHead(404); return r.end('not found'); }
            // An empty 200 parses fine and simply never defines the global, which is what an
            // unfinished blocking-script chain looks like to the waitForFunction gate.
            if (mode === 'absent' || (mode === 'slow' && cfgHits === 1)) {
                r.writeHead(200, { 'Content-Type': 'text/javascript' });
                return r.end('/* deliberately defines nothing */');
            }
        }
        if (p.endsWith('/')) p += 'index.html';
        const f = path.join(APP, p);
        if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
            r.writeHead(404); return r.end();
        }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
        r.end(fs.readFileSync(f));
    });
    srv.listen(port, '127.0.0.1');
    return srv;
}

/* MUST be async. The first version used execFileSync, which blocks Node's event loop -- so the
   fixture server in THIS process could never accept a connection and every case failed with
   net::ERR_CONNECTION_REFUSED. The harness was measuring its own deadlock, not the smoke. */
function runSmoke(port) {
    return new Promise((resolve) => {
        const child = execFile('node', [SMOKE], {
            env: { ...process.env, BASE: `http://127.0.0.1:${port}` },
            encoding: 'utf8', timeout: 300000, maxBuffer: 10 * 1024 * 1024
        }, (err, stdout, stderr) => {
            resolve({
                code: err ? (err.code === undefined ? -1 : err.code) : 0,
                out: (stdout || '') + (stderr || '')
            });
        });
        child.on('error', () => resolve({ code: -1, out: 'spawn error' }));
    });
}

// Wait until the fixture server actually accepts a connection before driving the smoke at it.
function listening(srv) {
    return new Promise((resolve) => (srv.listening ? resolve() : srv.once('listening', resolve)));
}

function check(label, cond, detail) {
    if (cond) { pass++; console.log('  ok   ' + label); }
    else { fail++; console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')); }
}

(async () => {
    const cases = [
        {
            mode: 'broken', port: 9411,
            // A failed request is a real defect. It must fail immediately and say WHAT failed, so
            // nobody re-runs it hoping for green.
            want: (r) => /request\(s\) FAILED/.test(r.out) && /404/.test(r.out) && r.code !== 0,
            label: 'BROKEN (config.js 404s) fails on the first attempt and names the failed request'
        },
        {
            mode: 'slow', port: 9412,
            want: (r) => /load \(slow\)/.test(r.out) && /0 FAIL/.test(r.out) && r.code === 0,
            label: 'SLOW (empty then real) passes, and is reported as load (slow) not as a pass in disguise'
        },
        {
            mode: 'absent', port: 9413,
            // Two clean loads with nothing attached is a real failure and must NOT be retried away.
            want: (r) => /TWO separate loads/.test(r.out) && /not a cold cache/.test(r.out) && r.code !== 0,
            label: 'ABSENT (never defined) still FAILS after the retry, and says it is not a cold cache'
        }
    ];

    for (const c of cases) {
        const srv = serve(c.mode, c.port);
        await listening(srv);            // never drive the smoke at a socket that is not up yet
        const r = await runSmoke(c.port);
        srv.close();
        const evidence = (r.out.match(/CONFIG-GLOBAL[^\n]*|load \(slow\)[^\n]*|══[^\n]*/g) || [])
            .slice(0, 2).join(' // ');
        check(c.label, c.want(r), `exit=${r.code} :: ${evidence.slice(0, 200)}`);
    }

    console.log(`\n  ${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
})();
