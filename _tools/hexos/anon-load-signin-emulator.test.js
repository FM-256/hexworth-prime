#!/usr/bin/env node
/**
 * anon-load-signin-emulator.test.js — task 372, the arm that closes the NOT MEASURED gap.
 *
 * @catalog what   Answers the one question anon-load-signin.test.js cannot: does any page
 *                 actually NEED the load-time anonymous session? Runs every page twice against
 *                 LOCAL auth+firestore emulators carrying the real firestore.rules — once with
 *                 the session (authed) and once without (unauthed) — and reads the denials from
 *                 the EMULATOR'S OWN LOG, server-side, where a page cannot swallow them.
 * @catalog run    firebase emulators:start --only auth,firestore --project hexworth-prime
 *                 node _tools/hexos/anon-load-signin-emulator.test.js [--pages N]
 * @catalog status TOOL
 * @catalog note   Exit 0 = compared and clean, 1 = a real dependent found, 2 = could not compare.
 *                 NEVER collapse 2 into 0.
 *
 * ── WHY AN EMULATOR, AND WHY ONLY TWO OF THEM ───────────────────────────────────────────────
 * The sibling harness proved the patch stops account creation, but could not prove nothing broke:
 * Firestore streams its refusal over a long-lived gRPC-web channel that returns HTTP 200, and a
 * page that catches its own error emits nothing observable. Driver-side detection is a dead end.
 * The emulator inverts the problem — it is the SERVER, so it records every denial with the exact
 * rule line (verified: "false for 'get' @ L335" for observatory_classes).
 *
 * ONLY auth and firestore are started. NEVER functions: that emulator loads functions/.env and
 * has fired live Discord webhooks at real students before. If this script ever detects the
 * functions emulator listening, it refuses to run.
 *
 * ── PRODUCTION MUST BE UNREACHABLE, AND THAT IS ASSERTED, NOT ASSUMED ───────────────────────
 * The SDK is redirected to the emulators by shimming the gstatic module URLs. If a shim ever
 * fails, the page would silently fall back to the LIVE project and start minting the very
 * accounts under investigation. So every request to identitytoolkit / firestore.googleapis.com
 * is aborted AND counted, and a non-zero count FAILS the run as a compromised measurement rather
 * than being quietly tolerated.
 */
'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const net = require('net');

const ROOT = path.resolve(__dirname, '../..');
const APP = path.join(ROOT, '_app');
const TARGET = path.join(APP, 'arena/firebase-init.js');
const FS_LOG = path.join(ROOT, 'firestore-debug.log');
const AUTH_PORT = 9099, FS_PORT = 8181, FUNCTIONS_PORT = 5001;

let puppeteer;
try { puppeteer = require(path.join(ROOT, 'node_modules/puppeteer')); }
catch (e) { console.error('SKIPPED (puppeteer unavailable): ' + e.message); process.exit(2); }

const argv = process.argv.slice(2);
const argOf = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const LIMIT = parseInt(argOf('--pages', '0'), 10) || 0;
const SELFTEST = !argv.includes('--no-selftest');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
    '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
    '.map': 'application/json', '.txt': 'text/plain', '.wasm': 'application/wasm' };

const portOpen = (port) => new Promise((res) => {
    const s = net.connect({ host: '127.0.0.1', port }, () => { s.destroy(); res(true); });
    s.on('error', () => res(false));
    s.setTimeout(1200, () => { s.destroy(); res(false); });
});

// ── the patch under test (same anchor as the sibling harness) ───────────────────────────────
const PATCH_ANCHOR = 'await _ensureSignedIn(_auth, signInAnonymously, onAuthStateChanged);';
function buildPatched(src) {
    if (!src.includes(PATCH_ANCHOR)) throw new Error('PATCH ANCHOR NOT FOUND — file changed');
    return src.replace(PATCH_ANCHOR,
        '_lazyAuth = function () { return _ensureSignedIn(_auth, signInAnonymously, onAuthStateChanged); };')
        .replace(/(\n\s*let\s+_ready\s*=)/, '\n    let _lazyAuth = null;$1');
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
        const cp = require('child_process');
        const prev = cp.execSync('git show HEAD:_app/arena/firebase-init.js',
            { cwd: ROOT, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
        if (!prev.includes(PATCH_ANCHOR)) {
            throw new Error('fix is applied on disk AND committed at HEAD — no baseline to ' +
                'compare against. Check out the parent commit to re-verify.');
        }
        return { baseline: prev, patched: diskSrc, state: 'applied-on-disk' };
    }
    throw new Error('PATCH ANCHOR NOT FOUND and no _lazyAuth marker — file is unrecognised');
}

/* ── SDK SHIMS ───────────────────────────────────────────────────────────────────────────────
   Pages hardcode the production project and call getAuth()/getFirestore() directly, so the only
   place to intervene without editing 276 pages is the module itself. An ES module's explicitly
   declared export shadows a matching name from `export *`, which lets a shim re-export the whole
   real SDK while replacing exactly one function. The inner import carries __real=1 so the
   interceptor passes it through instead of shimming itself forever. */
/* The shim does TWO jobs, and the second one is the whole reason this harness exists.
   (1) point getFirestore at the emulator;
   (2) WRAP every read/write export so a denial is recorded even when the calling page swallows
       it in its own catch. This is the instrument that driver-side observation could not
       provide: neither CDP (the refusal streams inside a 200 gRPC-web channel) nor the emulator
       log (which records REST denials only — verified, it logs a curl but not the SDK channel)
       can see a swallowed error. The module boundary can, because we record BEFORE rethrowing
       and the page's catch runs afterwards on an unchanged error. */
const WRAPPED_OPS = ['getDoc', 'getDocs', 'setDoc', 'updateDoc', 'addDoc', 'deleteDoc',
    'runTransaction', 'getCountFromServer', 'getAggregateFromServer'];
function firestoreShim(realUrl) {
    return `export * from '${realUrl}';
import * as R from '${realUrl}';
import { getFirestore as _gf, connectFirestoreEmulator } from '${realUrl}';

if (!window.__fsDenied) window.__fsDenied = [];
const DENY = /permission-denied|PERMISSION_DENIED|insufficient permissions|unauthenticated/i;
function record(op, e) {
    try {
        const msg = (e && (e.code || '') + ' ' + (e.message || '')) || String(e);
        if (DENY.test(msg)) window.__fsDenied.push(op + ': ' + msg.replace(/\\s+/g, ' ').slice(0, 120));
    } catch (_) {}
}
function wrapPromise(op, fn) {
    return function () {
        let out;
        try { out = fn.apply(this, arguments); }
        catch (e) { record(op, e); throw e; }
        if (out && typeof out.then === 'function') {
            return out.then(null, function (e) { record(op, e); throw e; });
        }
        return out;
    };
}
${WRAPPED_OPS.map(op =>
`export const ${op} = typeof R.${op} === 'function' ? wrapPromise('${op}', R.${op}) : R.${op};`
).join('\n')}

/* onSnapshot never rejects — it delivers failures to an error callback that most call sites
   simply omit, so a denied listener is the QUIETEST failure Firestore has. Both call shapes are
   handled: (ref, onNext, onError, onDone) and (ref, {next, error, complete}). */
export function onSnapshot(...a) {
    for (let i = 1; i < a.length; i++) {
        const v = a[i];
        if (v && typeof v === 'object' && !Array.isArray(v) &&
            (typeof v.next === 'function' || typeof v.error === 'function')) {
            const origErr = v.error;
            a[i] = Object.assign({}, v, {
                error: function (e) { record('onSnapshot', e); if (origErr) return origErr.apply(this, arguments); }
            });
            return R.onSnapshot.apply(this, a);
        }
    }
    const fns = [];
    for (let i = 1; i < a.length; i++) if (typeof a[i] === 'function') fns.push(i);
    if (fns.length >= 2) {
        const ei = fns[1], origErr = a[ei];
        a[ei] = function (e) { record('onSnapshot', e); return origErr.apply(this, arguments); };
    } else if (fns.length === 1) {
        // only onNext supplied — insert an error handler that would otherwise not exist
        a.splice(fns[0] + 1, 0, function (e) { record('onSnapshot', e); });
    }
    return R.onSnapshot.apply(this, a);
}

const _seen = new WeakSet();
export function getFirestore(...a) {
    const d = _gf(...a);
    if (!_seen.has(d)) { _seen.add(d);
        try { connectFirestoreEmulator(d, '127.0.0.1', ${FS_PORT}); }
        catch (e) { (window.__emuFail = window.__emuFail || []).push('firestore: ' + e.message); } }
    return d;
}`;
}
function authShim(realUrl) {
    return `export * from '${realUrl}';
import { getAuth as _ga, connectAuthEmulator } from '${realUrl}';
const _seen = new WeakSet();
export function getAuth(...a) {
    const x = _ga(...a);
    if (!_seen.has(x)) { _seen.add(x);
        try { connectAuthEmulator(x, 'http://127.0.0.1:${AUTH_PORT}', { disableWarnings: true }); }
        catch (e) { (window.__emuFail = window.__emuFail || []).push('auth: ' + e.message); } }
    return x;
}`;
}

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/node_modules|_archive|\.git/.test(p)) walk(p, out); }
        else if (e.name.endsWith('.html')) out.push(p);
    }
    return out;
}

const SELFTEST_ROUTE = '/__selftest_authed_read__.html';
function extractConfig(src) {
    const m = src.match(/const FIREBASE_CONFIG = (\{[\s\S]*?\n\s*\});/);
    if (!m) throw new Error('FIREBASE_CONFIG not found');
    return m[1];
}
/* Known-bad fixture: an authenticated read with no session. observatory_classes requires
   request.auth != null (firestore.rules:335). The emulator MUST log a denial for this page in
   the unauthed arm. If it does not, the log channel is broken and every clean result is void. */
function selftestHtml(cfg, ver) {
    return `<!doctype html><meta charset="utf-8"><title>selftest</title><body><h1>selftest</h1>
<script type="module">
import { initializeApp } from 'https://www.gstatic.com/firebasejs/${ver}/firebase-app.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/${ver}/firebase-firestore.js';
const app = initializeApp(${cfg});
try { await getDoc(doc(getFirestore(app), 'observatory_classes', 'probe')); } catch (e) {}
</script></body>`;
}

// ── emulator log reader: server-side truth, immune to the page swallowing its error ─────────
function logSize() { try { return fs.statSync(FS_LOG).size; } catch (e) { return 0; } }
function logSince(offset) {
    try {
        const fd = fs.openSync(FS_LOG, 'r');
        const size = fs.fstatSync(fd).size;
        if (size <= offset) { fs.closeSync(fd); return ''; }
        const buf = Buffer.alloc(size - offset);
        fs.readSync(fd, buf, 0, size - offset, offset);
        fs.closeSync(fd);
        return buf.toString('utf8');
    } catch (e) { return ''; }
}
function denialsIn(chunk) {
    const out = [];
    const re = /PERMISSION_DENIED[:\s]*\n?\s*(false for '[^']+' @ L\d+|[^\n]*)/g;
    let m;
    while ((m = re.exec(chunk))) out.push((m[1] || '').trim().slice(0, 80));
    return out;
}

(async () => {
    // ── refuse to run in an unsafe or incomplete environment ────────────────────────────────
    if (await portOpen(FUNCTIONS_PORT)) {
        console.error('REFUSING TO RUN: the functions emulator is listening on ' + FUNCTIONS_PORT + '.');
        console.error('It loads functions/.env and has fired live Discord webhooks. Stop it first.');
        process.exit(2);
    }
    if (!(await portOpen(AUTH_PORT)) || !(await portOpen(FS_PORT))) {
        console.error('SKIPPED (emulators not running). Start them with:');
        console.error('  firebase emulators:start --only auth,firestore --project hexworth-prime');
        process.exit(2);
    }
    if (!fs.existsSync(FS_LOG)) {
        console.error('SKIPPED: ' + FS_LOG + ' not found — cannot read denials server-side.');
        process.exit(2);
    }

    const origSrc = fs.readFileSync(TARGET, 'utf8');
    let patchedSrc, baselineSrc, armState;
    try { const a = resolveArms(origSrc); patchedSrc = a.patched; baselineSrc = a.baseline; armState = a.state; }
    catch (e) { console.error('SKIPPED (cannot build patch): ' + e.message); process.exit(2); }
    console.log('arm source:', armState);

    let pages = walk(APP)
        .filter(p => { try { return fs.readFileSync(p, 'utf8').includes('firebase-init.js'); }
                       catch { return false; } })
        .map(p => p.replace(APP + '/', ''));
    if (LIMIT) pages = pages.slice(0, LIMIT);
    if (SELFTEST) pages = [SELFTEST_ROUTE].concat(pages);

    console.log('=== emulator arm: does any page NEED the load-time session? (task 372) ===');
    console.log('pages     :', pages.length);
    console.log('emulators : auth ' + AUTH_PORT + ', firestore ' + FS_PORT + ' (functions NOT running)');
    console.log('denials   : read from the emulator log, server-side\n');

    let serveMode = 'authed';
    const cfg = extractConfig(origSrc);
    const srv = http.createServer((q, r) => {
        let p = decodeURIComponent(q.url.split('?')[0]);
        if (p === SELFTEST_ROUTE) {
            r.writeHead(200, { 'Content-Type': 'text/html' });
            return r.end(selftestHtml(cfg, '12.7.0'));
        }
        if (p.endsWith('/')) p += 'index.html';
        if (p === '/arena/firebase-init.js') {
            r.writeHead(200, { 'Content-Type': 'text/javascript' });
            return r.end(serveMode === 'unauthed' ? patchedSrc : baselineSrc);
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
        const browser = await puppeteer.launch({
            headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });

        async function runArm(mode) {
            serveMode = mode;
            const res = {};
            for (let i = 0; i < pages.length; i++) {
                const rel = pages[i];
                const rec = { denials: [], prodLeak: 0, errors: 0 };
                const before = logSize();
                let pg;
                try {
                    pg = await browser.newPage();
                    await pg.setRequestInterception(true);
                    pg.on('request', (r) => {
                        const u = r.url();
                        // shim the SDK onto the emulators
                        const mFs = u.match(/^(https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-firestore\.js)$/);
                        const mAu = u.match(/^(https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-auth\.js)$/);
                        if (mFs) return r.respond({ status: 200, contentType: 'text/javascript',
                            headers: { 'Access-Control-Allow-Origin': '*' },
                            body: firestoreShim(mFs[1] + '?__real=1') }).catch(() => {});
                        if (mAu) return r.respond({ status: 200, contentType: 'text/javascript',
                            headers: { 'Access-Control-Allow-Origin': '*' },
                            body: authShim(mAu[1] + '?__real=1') }).catch(() => {});
                        /* INTEGRITY: production must be unreachable. Count any attempt.
                           MUST match on the HOST, not the substring: the Auth emulator proxies by
                           PREFIXING the real host into its own local path, so a perfectly correct
                           emulator call reads
                             http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp
                           A substring test flags that as a production leak and — worse — aborts it,
                           which silently de-authenticates the AUTHED arm and makes the whole
                           comparison meaningless while every check still looks like it ran. */
                        let host = '';
                        try { host = new URL(u).host; } catch (e) { host = ''; }
                        const isLocal = host.startsWith('127.0.0.1') || host.startsWith('localhost');
                        if (!isLocal && (host.endsWith('identitytoolkit.googleapis.com') ||
                            host.endsWith('securetoken.googleapis.com') ||
                            host.endsWith('firestore.googleapis.com'))) {
                            rec.prodLeak++;
                            if (!rec.leakUrls) rec.leakUrls = [];
                            if (rec.leakUrls.length < 4) rec.leakUrls.push(u.slice(0, 110));
                            return r.abort().catch(() => {});
                        }
                        r.continue().catch(() => {});
                    });
                    pg.on('pageerror', () => rec.errors++);
                    const url = 'http://127.0.0.1:' + port + (rel === SELFTEST_ROUTE ? rel : '/' + rel);
                    await pg.goto(url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
                    await new Promise(r => setTimeout(r, 2200));
                    // Read what only the module boundary could see. The emulator log is kept as
                    // a SECOND channel below: it catches REST-path denials the SDK wrapper misses.
                    rec.denials = await pg.evaluate(() => (window.__fsDenied || []).slice())
                        .catch(() => []);
                    rec.emuFail = await pg.evaluate(() => (window.__emuFail || []).slice())
                        .catch(() => []);
                } catch (e) {
                    rec.errors++;
                } finally { if (pg) await pg.close().catch(() => {}); }
                // sequential on purpose: the emulator log has no request ids, so attribution
                // depends on this page being the only thing talking to it right now.
                denialsIn(logSince(before)).forEach(d => rec.denials.push('emulator-log: ' + d));
                res[rel] = rec;
                if ((i + 1) % 25 === 0) console.log('    [' + mode + '] ' + (i + 1) + '/' + pages.length);
            }
            return res;
        }

        console.log('  running AUTHED arm (session present, as shipped)...');
        const authed = await runArm('authed');
        console.log('  running UNAUTHED arm (load-time sign-in removed)...');
        const unauthed = await runArm('unauthed');

        await browser.close().catch(() => {});
        srv.close();

        let pass = 0, fail = 0;
        const chk = (l, c, d) => { c ? (pass++, console.log('  ok   ' + l))
            : (fail++, console.log('  FAIL ' + l + (d ? '\n         ' + d : ''))); };

        console.log('\n--- RESULTS ---');

        // 0. the measurement is only worth anything if production was never reached
        const leaks = Object.entries(unauthed).concat(Object.entries(authed))
            .filter(([, r]) => r.prodLeak > 0).map(([p]) => p);
        chk('production was unreachable throughout (emulator redirect held)',
            leaks.length === 0,
            'LEAKED to the live project on: ' + leaks.slice(0, 6).join(', ') +
            ' — the SDK shim failed, so this run measured the WRONG SYSTEM and is void');

        // 1. detector proof — the fixture must be denied in the unauthed arm
        let channelWorks = true;
        if (SELFTEST) {
            const s = unauthed[SELFTEST_ROUTE];
            channelWorks = !!s && s.denials.length > 0;
            chk('DETECTOR: emulator logs the synthetic unauthed read as denied',
                channelWorks,
                'the known-bad fixture produced NO logged denial — the log channel is blind and ' +
                'every clean result below is meaningless');
        }

        // 2. THE QUESTION: denied without a session, fine with one
        const dependents = [];
        for (const p of pages) {
            if (p === SELFTEST_ROUTE) continue;
            const a = authed[p], u = unauthed[p];
            if (!a || !u) continue;
            if (u.denials.length > a.denials.length) {
                dependents.push(p + '  (' + a.denials.length + ' -> ' + u.denials.length +
                    ' denials) e.g. ' + (u.denials.find(d => !a.denials.includes(d)) || u.denials[0]));
            }
        }
        if (!channelWorks) {
            console.log('  ??   NOT MEASURED: dependents (detector blind — 0 findings is an artefact)');
        } else {
            chk('NO page is denied at load without the session',
                dependents.length === 0, dependents.slice(0, 12).join('\n         '));
        }

        const totalAuthed = Object.values(authed).reduce((s, r) => s + r.denials.length, 0);
        const totalUnauth = Object.values(unauthed).reduce((s, r) => s + r.denials.length, 0);
        console.log('\n  total logged denials — authed: ' + totalAuthed + ', unauthed: ' + totalUnauth);

        const out = path.join(ROOT, '_tools/hexos/anon-load-signin-emulator-report.json');
        fs.writeFileSync(out, JSON.stringify({ authed, unauthed }, null, 1));
        console.log('  full per-page record -> ' + out);

        console.log('\n' + pass + ' passed, ' + fail + ' failed' + (channelWorks ? '' : ', 1 NOT MEASURED'));
        process.exit(fail > 0 ? 1 : (channelWorks ? 0 : 2));
    });
})();
