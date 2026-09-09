#!/usr/bin/env node
/**
 * anon-load-signin.test.js — task 372
 *
 * @catalog what    Proves, in a real browser, that removing the load-time anonymous sign-in from
 *                  _app/arena/firebase-init.js breaks nothing. Loads every page that includes that
 *                  file, in two arms (baseline = shipped code, patched = sign-in deferred), and
 *                  measures: anonymous-signup attempts at load, Firestore permission failures
 *                  during load, uncaught page errors, and whether the page still renders.
 * @catalog run     node _tools/hexos/anon-load-signin.test.js [--pages N] [--arm both|baseline|patched]
 * @catalog status  TOOL
 * @catalog note    Exit 0 = compared and identical/clean, 1 = a real dependent found,
 *                  2 = could not run (puppeteer/env). NEVER collapse 2 into 0 — the repo-wide
 *                  convention shared with safe-entry.test.js and doc-examples.test.js.
 *
 * ── WHY THIS CANNOT TOUCH PRODUCTION ────────────────────────────────────────────────────────
 * The defect under investigation IS unintended account creation. A probe that let the page
 * complete a real anonymous sign-in would mint the very rows it is counting, against the live
 * project. So every request to identitytoolkit.googleapis.com is ABORTED at the network layer.
 * That is a hard guarantee, not a convention: the browser is physically unable to create an
 * account. Attempts are still COUNTED, and that count is the primary measurement — baseline
 * should attempt a signup on load, patched should not.
 *
 * Firestore is left reachable so real rule outcomes are observed. Reads are reads; any write a
 * page attempts unauthenticated is refused by firestore.rules, so no production state changes.
 *
 * ── WHAT WOULD FALSIFY THE CLAIM ────────────────────────────────────────────────────────────
 * A page that, in the PATCHED arm, either (a) issues a Firestore request during load that comes
 * back 401/403, or (b) throws an uncaught error it does not throw in baseline, or (c) renders
 * materially less content than baseline. Any of those is a real dependent on the load-time
 * sign-in and blocks the change.
 *
 * ── THE DETECTOR IS PROVEN BEFORE IT IS TRUSTED ─────────────────────────────────────────────
 * --selftest injects a synthetic page that performs an authenticated Firestore read at load with
 * no session. If the harness does not FLAG that page, the harness is broken and says so. A clean
 * run means nothing until the detector has been shown to go red on a known-bad input.
 */
'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '../..');
const APP = path.join(ROOT, '_app');
const TARGET = path.join(APP, 'arena/firebase-init.js');

let puppeteer;
try { puppeteer = require(path.join(ROOT, 'functions/node_modules/puppeteer')); }
catch (e) {
    try { puppeteer = require('puppeteer'); }
    catch (e2) {
        console.error('SKIPPED (puppeteer unavailable): ' + e2.message);
        process.exit(2);
    }
}

const argv = process.argv.slice(2);
const argOf = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const LIMIT = parseInt(argOf('--pages', '0'), 10) || 0;
const ARM = argOf('--arm', 'both');
const SELFTEST = argv.includes('--selftest');
const CONCURRENCY = parseInt(argOf('--concurrency', '4'), 10);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
    '.map': 'application/json', '.txt': 'text/plain', '.wasm': 'application/wasm' };

// ── THE PATCH UNDER TEST ────────────────────────────────────────────────────────────────────
// Generated here rather than applied to _app, so nothing ships before this proves it. The
// anchor is the awaited call inside init(); _ensureSignedIn itself is left intact and exposed
// as ensureAuth() so a caller that genuinely needs a uid can still ask for one.
const PATCH_ANCHOR = 'await _ensureSignedIn(_auth, signInAnonymously, onAuthStateChanged);';
const PATCH_REPLACEMENT =
    '/* TASK 372 (under test): the load-time anonymous sign-in is REMOVED. Opening a page must\n' +
    '   not create an account. _ensureSignedIn is retained and exposed as ensureAuth() for the\n' +
    '   call sites that genuinely need a uid (CoOpSync.js:103 already does its own). */\n' +
    '            _lazyAuth = function () {\n' +
    '                return _ensureSignedIn(_auth, signInAnonymously, onAuthStateChanged);\n' +
    '            };';

function buildPatched(src) {
    if (!src.includes(PATCH_ANCHOR)) {
        throw new Error('PATCH ANCHOR NOT FOUND in arena/firebase-init.js — the file changed. ' +
            'Re-derive the patch rather than testing a stale one.');
    }
    let out = src.replace(PATCH_ANCHOR, PATCH_REPLACEMENT);
    // declare the lazy slot alongside the other module-scope handles
    out = out.replace(/(\n\s*let\s+_ready\s*=)/, '\n    let _lazyAuth = null;$1');
    if (!/_lazyAuth\s*=\s*null/.test(out)) out = out.replace(/^\s*'use strict';/m,
        "'use strict';\n    let _lazyAuth = null;");
    // expose it on the public API next to init
    out = out.replace(/(\n\s*init\s*\n\s*\};)/,
        '\n        ensureAuth: function () { return _lazyAuth ? _lazyAuth() : Promise.resolve(); },$1');
    return out;
}

/* Once the fix is APPLIED to _app, the anchor is gone and these harnesses would exit 2 forever —
   losing the ability to re-verify the very change they proved. So: if the anchor is absent but
   the applied marker (_lazyAuth) is present, the file on disk IS the patched arm, and the
   BASELINE is recovered from git HEAD. If neither is true the file is unrecognised and we still
   refuse, because silently comparing two identical arms would print green while testing nothing. */
function resolveArms(diskSrc) {
    if (diskSrc.includes(PATCH_ANCHOR)) {
        return { baseline: diskSrc, patched: buildPatched(diskSrc), state: 'not-yet-applied' };
    }
    if (diskSrc.includes('_lazyAuth')) {
        /* WALK BACK to the last revision that still has the anchor, rather than assuming HEAD
           is pre-fix. Once the fix is COMMITTED, `git show HEAD:` returns the patched file and
           there is no control arm — the harness then either compares two identical arms (green,
           testing nothing) or refuses. It refused, correctly, which is how this was caught.
           Searching the file's own history makes the harness survive the commit instead of
           depending on the order operations happened to occur in. */
        const cp = require('child_process');
        const revs = cp.execSync('git rev-list -n 40 HEAD -- _app/arena/firebase-init.js',
            { cwd: ROOT, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
            .trim().split('\n').filter(Boolean);
        for (const rev of revs) {
            let src;
            try {
                src = cp.execSync('git show ' + rev + ':_app/arena/firebase-init.js',
                    { cwd: ROOT, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
            } catch (e) { continue; }
            if (src.includes(PATCH_ANCHOR)) {
                return { baseline: src, patched: diskSrc,
                         state: 'applied-on-disk (baseline from ' + rev.slice(0, 9) + ')' };
            }
        }
        throw new Error('fix is applied but NO revision in the last 40 touching this file still ' +
            'contains the pre-fix anchor — cannot build a control arm.');
    }
    throw new Error('PATCH ANCHOR NOT FOUND and no _lazyAuth marker — file is unrecognised');
}

// ── page population ─────────────────────────────────────────────────────────────────────────
function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/node_modules|_archive|\.git/.test(p)) walk(p, out); }
        else if (e.name.endsWith('.html')) out.push(p);
    }
    return out;
}

const SELFTEST_ROUTE = '/__selftest_authed_read__.html';
/* The fixture must use the REAL project config. A dummy apiKey fails as an invalid-key 400,
   which is a DIFFERENT failure from the permission-denied this harness exists to detect —
   the detector would be validated against the wrong wrong-answer. Config is lifted from the
   file under test so it cannot drift, and is never printed. */
function selftestHtml(cfgLiteral) {
    return `<!doctype html><meta charset="utf-8"><title>selftest</title>
<body><h1>selftest</h1><script type="module">
/* Known-bad input: an AUTHENTICATED Firestore read at load with no session.
   observatory_classes requires request.auth != null (firestore.rules:335), so this MUST come
   back PERMISSION_DENIED. The catch is deliberate — real pages swallow their errors too, and a
   detector that only works on UNCAUGHT errors would miss every one of them. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js';
const app = initializeApp(${cfgLiteral});
try { await getDoc(doc(getFirestore(app), 'observatory_classes', 'probe')); } catch (e) {}
</script></body>`;
}
function extractConfig(src) {
    const m = src.match(/const FIREBASE_CONFIG = (\{[\s\S]*?\n\s*\});/);
    if (!m) throw new Error('FIREBASE_CONFIG not found in arena/firebase-init.js');
    return m[1];
}

// ── run one arm ─────────────────────────────────────────────────────────────────────────────
async function runArm(armName, serveFirebaseInit, pages, port) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    });
    const results = [];
    let idx = 0;

    async function worker() {
        while (idx < pages.length) {
            const myIdx = idx++;
            const rel = pages[myIdx];
            const rec = { page: rel, signupAttempts: 0, fsRequests: 0, fsDenied: [],
                          pageErrors: [], textLen: 0, timedOut: false };
            let pg;
            try {
                pg = await browser.newPage();

                /* IN-PAGE BODY READER. CDP cannot give us the Firestore denial: the SDK speaks
                   gRPC-web over a long-lived Listen/channel, so response.text() from the driver
                   returns only the opening handshake chunk and the refusal never appears. Proven
                   against the fixture — the page's own catch saw `permission-denied` while all
                   three driver-side channels reported nothing.
                   Inside the page we can clone() the response and read it whole without consuming
                   it, which catches the payload even when the page swallows the error in a catch.
                   XHR is wrapped too: the SDK falls back to it when fetch is unavailable. */
                await pg.evaluateOnNewDocument(() => {
                    window.__fsDenied = [];
                    const RE = /PERMISSION_DENIED|Missing or insufficient permissions|permission-denied|UNAUTHENTICATED/;
                    const isFs = (u) => typeof u === 'string' && u.indexOf('firestore.googleapis.com') > -1;
                    const of = window.fetch;
                    window.fetch = function (input, init) {
                        const url = typeof input === 'string' ? input : (input && input.url) || '';
                        return of.apply(this, arguments).then((res) => {
                            if (isFs(url)) {
                                try {
                                    res.clone().text().then((t) => {
                                        if (RE.test(t)) window.__fsDenied.push('fetch ' + url.slice(0, 90));
                                    }).catch(() => {});
                                } catch (e) { /* opaque/streamed — nothing readable */ }
                            }
                            return res;
                        });
                    };
                    const os = XMLHttpRequest.prototype.send;
                    const oo = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function (m, u) { this.__u = u; return oo.apply(this, arguments); };
                    XMLHttpRequest.prototype.send = function () {
                        this.addEventListener('load', () => {
                            try {
                                if (isFs(this.__u) && RE.test(this.responseText || '')) {
                                    window.__fsDenied.push('xhr ' + String(this.__u).slice(0, 90));
                                }
                            } catch (e) { /* responseType not text */ }
                        });
                        return os.apply(this, arguments);
                    };
                });

                await pg.setRequestInterception(true);
                pg.on('request', (r) => {
                    const u = r.url();
                    // HARD BLOCK: no account can be created by this probe, in either arm.
                    if (u.includes('identitytoolkit.googleapis.com') ||
                        u.includes('securetoken.googleapis.com')) {
                        if (/accounts:signUp|accounts:signInWithoutIdentifier|signupNewUser/.test(u)) {
                            rec.signupAttempts++;
                        }
                        return r.abort().catch(() => {});
                    }
                    if (u.includes('firestore.googleapis.com')) rec.fsRequests++;
                    r.continue().catch(() => {});
                });
                /* DETECTOR, v2. v1 checked res.status() for 401/403 and was BLIND: the Firestore
                   SDK talks gRPC-web over a Listen/channel endpoint that returns HTTP 200 and
                   carries the refusal in the PAYLOAD. The selftest fixture caught this — v1
                   reported "no permission failure" on a page doing nothing but a denied read.
                   Three independent channels now, because each one alone has a known blind spot:
                     (a) status  — catches plain REST denials
                     (b) body    — catches gRPC-web 200s carrying PERMISSION_DENIED
                     (c) console — catches SDK-reported denials on listeners whose bodies stream
                   A page that SWALLOWS its error in a catch still trips (b). */
                const DENY_RE = /PERMISSION_DENIED|Missing or insufficient permissions|permission-denied|UNAUTHENTICATED/;
                pg.on('response', async (res) => {
                    const u = res.url();
                    if (!u.includes('firestore.googleapis.com')) return;
                    const s = res.status();
                    if (s === 401 || s === 403) { rec.fsDenied.push('status ' + s + ' ' + u.slice(0, 100)); return; }
                    try {
                        const body = await res.text();
                        if (DENY_RE.test(body)) rec.fsDenied.push('body ' + s + ' ' + u.slice(0, 100));
                    } catch (e) { /* streaming/aborted body — console channel is the backstop */ }
                });
                pg.on('console', (m) => {
                    const t = m.text();
                    if (DENY_RE.test(t)) rec.fsDenied.push('console ' + t.slice(0, 140));
                });
                pg.on('pageerror', (e) => {
                    const t = String(e.message);
                    if (DENY_RE.test(t)) rec.fsDenied.push('pageerror ' + t.slice(0, 140));
                    rec.pageErrors.push(t.slice(0, 160));
                });

                const url = 'http://127.0.0.1:' + port +
                    (rel === SELFTEST_ROUTE ? rel : '/' + rel);
                await pg.goto(url, { waitUntil: 'networkidle2', timeout: 15000 })
                    .catch(() => { rec.timedOut = true; });
                // let deferred load-time work settle (Firestore listeners, lazy imports)
                await new Promise(r => setTimeout(r, 1500));
                /* RENDER SAMPLING, v2. v1 took ONE innerText snapshot and diffed the arms. That
                   reported six dispatch boxes as render regressions; all six were false. Those
                   pages run a timed boot animation (GRUB -> Windows -> login banner), so the two
                   arms were photographed at different FRAMES — the patched arm skips the auth
                   round-trip and is simply earlier in the sequence. Baseline itself measured 410
                   then 392 chars on separate runs of the SAME code, which is the tell.
                   So: sample twice and let the page declare itself. If its text changes between
                   samples it is animated, and a single-snapshot comparison cannot say anything
                   about it — compare a structural signature instead of a moving picture. */
                const sample1 = await pg.evaluate(() => ({
                    len: (document.body && document.body.innerText || '').length,
                    els: document.querySelectorAll('*').length
                })).catch(() => ({ len: -1, els: -1 }));
                await new Promise(r => setTimeout(r, 1600));
                const sample2 = await pg.evaluate(() => ({
                    len: (document.body && document.body.innerText || '').length,
                    els: document.querySelectorAll('*').length
                })).catch(() => ({ len: -1, els: -1 }));
                rec.animated = sample1.len !== sample2.len;
                rec.textLen = sample2.len;
                rec.elCount = sample2.els;
                // harvest what only the page could see
                const inPage = await pg.evaluate(() => window.__fsDenied || []).catch(() => []);
                inPage.forEach(d => rec.fsDenied.push('inpage ' + d));
            } catch (e) {
                rec.pageErrors.push('HARNESS: ' + e.message.slice(0, 160));
            } finally {
                if (pg) await pg.close().catch(() => {});
            }
            results.push(rec);
            if (results.length % 25 === 0) {
                console.log('    [' + armName + '] ' + results.length + '/' + pages.length);
            }
        }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    await browser.close().catch(() => {});
    return results;
}

// ── main ────────────────────────────────────────────────────────────────────────────────────
(async () => {
    const origSrc = fs.readFileSync(TARGET, 'utf8');
    let patchedSrc, baselineSrc, armState;
    try { const a = resolveArms(origSrc); patchedSrc = a.patched; baselineSrc = a.baseline; armState = a.state; }
    catch (e) { console.error('SKIPPED (cannot build patch): ' + e.message); process.exit(2); }
    console.log('arm source:', armState);

    // sanity: the patch must be syntactically valid before a browser ever sees it
    try { new (require('vm').Script)(patchedSrc, { filename: 'firebase-init.patched.js' }); }
    catch (e) { console.error('PATCH IS NOT VALID JS: ' + e.message); process.exit(2); }

    let pages = walk(APP)
        .filter(p => { try { return fs.readFileSync(p, 'utf8').includes('firebase-init.js'); }
                       catch { return false; } })
        .map(p => p.replace(APP + '/', ''));
    if (LIMIT) pages = pages.slice(0, LIMIT);
    if (SELFTEST) pages = [SELFTEST_ROUTE].concat(pages);

    console.log('=== anon load-time sign-in: dynamic proof (task 372) ===');
    console.log('pages under test :', pages.length);
    console.log('arms             :', ARM);
    console.log('account creation : BLOCKED at the network layer (identitytoolkit aborted)');
    console.log();

    let serveMode = 'baseline';
    const srv = http.createServer((q, r) => {
        let p = decodeURIComponent(q.url.split('?')[0]);
        if (p === SELFTEST_ROUTE) {
            r.writeHead(200, { 'Content-Type': 'text/html' });
            return r.end(selftestHtml(extractConfig(origSrc)));
        }
        if (p.endsWith('/')) p += 'index.html';
        if (p === '/arena/firebase-init.js') {
            r.writeHead(200, { 'Content-Type': 'text/javascript' });
            return r.end(serveMode === 'patched' ? patchedSrc : baselineSrc);
        }
        const f = path.join(APP, p);
        if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
            r.writeHead(404); return r.end();
        }
        r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
        r.end(fs.readFileSync(f));
    });

    srv.listen(0, '127.0.0.1', async () => {
        const port = srv.address().port;
        let base = [], patch = [];
        try {
            if (ARM === 'both' || ARM === 'baseline') {
                serveMode = 'baseline';
                console.log('  running BASELINE arm (shipped firebase-init.js)...');
                base = await runArm('baseline', 'orig', pages, port);
            }
            if (ARM === 'both' || ARM === 'patched') {
                serveMode = 'patched';
                console.log('  running PATCHED arm (load-time sign-in removed)...');
                patch = await runArm('patched', 'patched', pages, port);
            }
        } catch (e) {
            console.error('HARNESS FAULT — NOTHING WAS VERIFIED: ' + e.message);
            srv.close(); process.exit(2);
        }
        srv.close();

        const byPage = (arr) => Object.fromEntries(arr.map(r => [r.page, r]));
        const B = byPage(base), P = byPage(patch);
        let pass = 0, fail = 0;
        const chk = (label, cond, detail) => {
            cond ? (pass++, console.log('  ok   ' + label))
                 : (fail++, console.log('  FAIL ' + label + (detail ? '\n         ' + detail : '')));
        };

        console.log('\n--- RESULTS ---');

        /* 0. DETECTOR PROOF, and what happens when it fails.
           If the synthetic known-bad page is NOT flagged, the denial channel is blind. The
           harness must then refuse to report "no permission failure" as a PASS — a green tick
           from a blind instrument is worse than no tick, because it reads as evidence. That
           assertion is downgraded to NOT MEASURED and the run exits 2 (could not verify),
           never 0. The other assertions are unaffected: they measure signup attempts, uncaught
           errors and render, none of which depend on this channel. */
        let denialChannelWorks = true;
        if (SELFTEST) {
            const s = P[SELFTEST_ROUTE] || B[SELFTEST_ROUTE];
            denialChannelWorks = !!s && s.fsDenied.length > 0;
            if (denialChannelWorks) {
                pass++; console.log('  ok   DETECTOR: synthetic authed-read page is flagged');
            } else {
                console.log('  ---- DETECTOR IS BLIND to a swallowed gRPC-web denial.');
                console.log('       The fixture DOES get permission-denied (its own catch sees it),');
                console.log('       but Firestore streams the refusal over a long-lived Listen/channel:');
                console.log('       CDP response.text() yields only the handshake chunk, and a page that');
                console.log('       catches its own error logs nothing. Driver-side observation cannot');
                console.log('       close this. Closing it needs an auth+firestore EMULATOR arm, where an');
                console.log('       authed control can be compared against an unauthed one for real.');
                console.log('       => the permission-failure assertion below is NOT MEASURED, not passed.');
            }
        }

        // 1. the measurement that isolates the change
        if (base.length) {
            const baseAttempts = base.filter(r => r.signupAttempts > 0).length;
            console.log('\n  baseline pages attempting anonymous signup at load: ' +
                baseAttempts + '/' + base.length);
            chk('BASELINE reproduces the defect (pages do mint accounts at load)',
                baseAttempts > 0,
                'if this is 0 the probe is not exercising the behaviour under test');
        }
        if (patch.length) {
            const patchAttempts = patch.filter(r => r.signupAttempts > 0);
            console.log('  patched  pages attempting anonymous signup at load: ' +
                patchAttempts.length + '/' + patch.length);
            chk('PATCHED creates no account at load on any page',
                patchAttempts.length === 0,
                patchAttempts.slice(0, 8).map(r => r.page + ' (' + r.signupAttempts + ')').join(', '));
        }

        // 2. did anything actually need the session?
        if (patch.length) {
            const denied = patch.filter(r => r.fsDenied.length > 0);
            if (!denialChannelWorks) {
                // Blind instrument: an empty fsDenied proves nothing, so do not score it.
                console.log('  ??   NOT MEASURED: Firestore permission failures during load ' +
                    '(detector blind — see above; 0 findings here is an artefact, not a result)');
            } else {
                chk('PATCHED: no Firestore permission failure during load',
                    denied.length === 0,
                    denied.slice(0, 10).map(r => r.page + ' -> ' + r.fsDenied[0]).join('\n         '));
            }
        }

        // 3. regressions introduced by the patch, page by page
        if (base.length && patch.length) {
            const newErrors = [], shrunk = [];
            for (const pg of pages) {
                const b = B[pg], p = P[pg];
                if (!b || !p) continue;
                if (p.pageErrors.length > b.pageErrors.length) {
                    newErrors.push(pg + ' -> ' + (p.pageErrors.find(e => !b.pageErrors.includes(e)) || p.pageErrors[0]));
                }
                /* An animated page (in EITHER arm) cannot be judged by a text snapshot — see the
                   sampling note above. Fall back to its DOM structure, which the animation grows
                   but does not gut: a page that genuinely failed to render loses most of its
                   elements, not a few animation lines. Static pages keep the stricter text test. */
                if (b.animated || p.animated) {
                    if (b.elCount > 20 && p.elCount < b.elCount * 0.7) {
                        shrunk.push(pg + ' [animated] (' + b.elCount + ' -> ' + p.elCount + ' elements)');
                    }
                } else if (b.textLen > 200 && p.textLen < b.textLen * 0.9) {
                    shrunk.push(pg + ' (' + b.textLen + ' -> ' + p.textLen + ' chars)');
                }
            }
            chk('PATCHED introduces no new uncaught page error', newErrors.length === 0,
                newErrors.slice(0, 10).join('\n         '));
            chk('PATCHED renders the same content as baseline', shrunk.length === 0,
                shrunk.slice(0, 10).join('\n         '));
        }

        // 4. pages that still sign in on their own — expected, and worth naming
        if (patch.length) {
            const selfSigners = patch.filter(r => r.signupAttempts > 0).map(r => r.page);
            if (selfSigners.length) {
                console.log('\n  pages that still request a sign-in after the patch (their own call sites):');
                selfSigners.forEach(p => console.log('    ' + p));
            }
        }

        const out = path.join(ROOT, '_tools/hexos/anon-load-signin-report.json');
        fs.writeFileSync(out, JSON.stringify({ pages: pages.length, baseline: base, patched: patch }, null, 1));
        console.log('\n  full per-page record -> ' + out);

        console.log('\n' + pass + ' passed, ' + fail + ' failed' +
            (denialChannelWorks ? '' : ', 1 NOT MEASURED'));
        if (fail > 0) console.log('FAIL: a real dependent on the load-time sign-in was found.');
        if (!fail && !denialChannelWorks) {
            console.log('INCOMPLETE: every scored check passed, but the permission-failure question ' +
                'was NOT ANSWERED. Exit 2 — do not read this as a green run.');
        }
        // 0 only when everything was both measured and clean. Never collapse 2 into 0.
        process.exit(fail > 0 ? 1 : (denialChannelWorks ? 0 : 2));
    });
})();
