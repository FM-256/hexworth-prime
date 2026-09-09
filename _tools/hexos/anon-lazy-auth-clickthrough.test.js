#!/usr/bin/env node
/**
 * anon-lazy-auth-clickthrough.test.js — task 372, the interaction arm.
 *
 * @catalog what   The two sibling harnesses only ever measured PAGE LOAD. This one clicks. It
 *                 drives the three flows that could plausibly depend on the removed load-time
 *                 anonymous sign-in — start Co-Op, start VS, and return with an existing
 *                 anonymous session — in both arms, against local emulators.
 * @catalog run    firebase emulators:start --only auth,firestore --project hexworth-prime
 *                 node _tools/hexos/anon-lazy-auth-clickthrough.test.js
 * @catalog status TOOL
 * @catalog note   Exit 0 = compared and clean, 1 = a flow broke under the patch, 2 = could not run.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────────────────────
 * "Nothing depends on the load-time session" was established for page load and then EXTENDED to
 * interaction by READING the code: CoOpSync.js:103 signs in for itself, VS sits behind
 * _launchVsMode(), HatRating is guarded by isSignedIn(). Reading is how two wrong conclusions
 * were already reached on this task. The claim that matters to a student is that co-op still
 * WORKS, and that a returning anonymous student still has their account — so click it.
 *
 * The session-restore case is the one with real stakes: ~30 anonymous accounts carry substantial
 * coursework (the largest: 173 modules, 129 labs). If removing the load-time call cost them their
 * session, the patch would destroy real student work. That must be demonstrated, never assumed.
 */
'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const net = require('net');

const ROOT = path.resolve(__dirname, '../..');
const APP = path.join(ROOT, '_app');
const TARGET = path.join(APP, 'arena/firebase-init.js');
const AUTH_PORT = 9099, FS_PORT = 8181, FUNCTIONS_PORT = 5001;
const BOX = '/arena/boxes/a1-ancient-ledger/index.html';

let puppeteer;
try { puppeteer = require(path.join(ROOT, 'node_modules/puppeteer')); }
catch (e) { console.error('SKIPPED (puppeteer unavailable): ' + e.message); process.exit(2); }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.woff2': 'font/woff2',
    '.woff': 'font/woff', '.ico': 'image/x-icon', '.map': 'application/json', '.txt': 'text/plain' };

const portOpen = (p) => new Promise((res) => {
    const s = net.connect({ host: '127.0.0.1', port: p }, () => { s.destroy(); res(true); });
    s.on('error', () => res(false));
    s.setTimeout(1200, () => { s.destroy(); res(false); });
});

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

// Same shims as the emulator arm: redirect the SDK at the module boundary.
function firestoreShim(u) {
    return `export * from '${u}';
import { getFirestore as _gf, connectFirestoreEmulator } from '${u}';
const _s = new WeakSet();
export function getFirestore(...a) { const d = _gf(...a);
  if (!_s.has(d)) { _s.add(d); try { connectFirestoreEmulator(d, '127.0.0.1', ${FS_PORT}); } catch (e) {} }
  return d; }`;
}
function authShim(u) {
    return `export * from '${u}';
import { getAuth as _ga, connectAuthEmulator } from '${u}';
const _s = new WeakSet();
export function getAuth(...a) { const x = _ga(...a);
  if (!_s.has(x)) { _s.add(x); try { connectAuthEmulator(x, 'http://127.0.0.1:${AUTH_PORT}', { disableWarnings: true }); } catch (e) {} }
  return x; }`;
}

(async () => {
    if (await portOpen(FUNCTIONS_PORT)) {
        console.error('REFUSING TO RUN: functions emulator is up on ' + FUNCTIONS_PORT +
            ' — it loads functions/.env and has fired live Discord webhooks.');
        process.exit(2);
    }
    if (!(await portOpen(AUTH_PORT)) || !(await portOpen(FS_PORT))) {
        console.error('SKIPPED (emulators not running): firebase emulators:start --only auth,firestore');
        process.exit(2);
    }

    const origSrc = fs.readFileSync(TARGET, 'utf8');
    let patchedSrc, baselineSrc, armState;
    try { const a = resolveArms(origSrc); patchedSrc = a.patched; baselineSrc = a.baseline; armState = a.state; }
    catch (e) { console.error('SKIPPED: ' + e.message); process.exit(2); }
    console.log('arm source:', armState);

    let serveMode = 'baseline';
    const srv = http.createServer((q, r) => {
        let p = decodeURIComponent(q.url.split('?')[0]);
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
        const base = 'http://127.0.0.1:' + port;
        let pass = 0, fail = 0;
        const chk = (l, c, d) => { c ? (pass++, console.log('  ok   ' + l))
            : (fail++, console.log('  FAIL ' + l + (d ? '\n         ' + String(d).slice(0, 300) : ''))); };

        console.log('=== interaction arm: do the click flows survive the patch? (task 372) ===');
        console.log('box       :', BOX);
        console.log('emulators : auth ' + AUTH_PORT + ', firestore ' + FS_PORT + ' (functions NOT running)\n');

        async function newCtx(browser) {
            const ctx = await browser.createBrowserContext();
            const pg = await ctx.newPage();
            await pg.setRequestInterception(true);
            pg.on('request', (r) => {
                const u = r.url();
                const mFs = u.match(/^(https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-firestore\.js)$/);
                const mAu = u.match(/^(https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-auth\.js)$/);
                if (mFs) return r.respond({ status: 200, contentType: 'text/javascript',
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: firestoreShim(mFs[1] + '?__real=1') }).catch(() => {});
                if (mAu) return r.respond({ status: 200, contentType: 'text/javascript',
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: authShim(mAu[1] + '?__real=1') }).catch(() => {});
                // host-based, so the emulator's host-prefixed proxy path is not mistaken for prod
                let host = ''; try { host = new URL(u).host; } catch (e) {}
                const local = host.startsWith('127.0.0.1') || host.startsWith('localhost');
                if (!local && /(identitytoolkit|securetoken|firestore)\.googleapis\.com$/.test(host)) {
                    return r.abort().catch(() => {});
                }
                r.continue().catch(() => {});
            });
            return { ctx, pg };
        }

        const clickIf = async (pg, sel, ms = 6000) => {
            try { await pg.waitForSelector(sel, { visible: true, timeout: ms }); await pg.click(sel); return true; }
            catch (e) { return false; }
        };
        /* Read BOTH auth holders. v1 read only ArenaFirebase.auth.currentUser and reported "no
           session" on a run that had just created a co-op room — i.e. a Firestore write had
           demonstrably succeeded, so a session plainly existed. On box pages FirebaseAuth.js owns
           the session and ArenaFirebase defers to it (_ensureSignedIn returns early when
           FirebaseAuth is defined), so the probe was looking at the wrong object and would have
           been reported as the patch failing to acquire auth. */
        const uidOf = (pg) => pg.evaluate(() => {
            try {
                if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
                    const u = FirebaseAuth.getUser();
                    if (u && u.uid) return u.uid;
                }
            } catch (e) {}
            try {
                if (window.ArenaFirebase && ArenaFirebase.auth && ArenaFirebase.auth.currentUser) {
                    return ArenaFirebase.auth.currentUser.uid;
                }
            } catch (e) {}
            return null;
        }).catch(() => null);

        const browser = await puppeteer.launch({ headless: 'new',
            args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });

        // ── FLOW 1 + 2: start Co-Op, and start VS ───────────────────────────────────────────
        for (const mode of ['baseline', 'patched']) {
            serveMode = mode;
            for (const [label, modeBtn] of [['Co-Op', '#coopBtnCoop'], ['VS', '#coopBtnVs']]) {
                const { ctx, pg } = await newCtx(browser);
                const errs = [];
                pg.on('pageerror', (e) => errs.push(String(e.message).slice(0, 140)));
                await pg.goto(base + BOX, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
                await new Promise(r => setTimeout(r, 1200));

                const uidAtLoad = await uidOf(pg);
                await clickIf(pg, '.bp-launch-btn', 8000);
                await new Promise(r => setTimeout(r, 900));
                const openedLobby = await clickIf(pg, modeBtn, 8000);
                await new Promise(r => setTimeout(r, 900));
                /* An intermediate SQUAD-SIZE step sits between the mode button and the
                   create/join stage (_showSquadSelect -> _showCoOpOptions, CoOpLobby.js:110).
                   The first version of this harness clicked straight for #coopCreate, never
                   reached it, and reported create=false in BOTH arms — which then read as
                   "the patch broke co-op" when in fact the flow had never been driven at all. */
                const isVs = label === 'VS';
                const sizeSel = isVs ? '.vs-format-btn[data-size="1"]' : '.coop-squad-btn[data-size="2"]';
                const createSel = isVs ? '#vsCreate' : '#coopCreate';
                const pickedSquad = await clickIf(pg, sizeSel, 8000);
                await new Promise(r => setTimeout(r, 700));
                const created = await clickIf(pg, createSel, 8000);
                await new Promise(r => setTimeout(r, 3500));

                const roomCode = await pg.evaluate(() => {
                    const el = document.querySelector('#coopRoomCode');
                    return el ? (el.textContent || '').trim().slice(0, 20) : null;
                }).catch(() => null);
                const uidAfter = await uidOf(pg);

                console.log('  [' + mode + '/' + label + '] uid@load=' + (uidAtLoad ? 'present' : 'none') +
                    ' lobby=' + openedLobby + ' squad=' + pickedSquad + ' create=' + created +
                    ' room=' + (roomCode ? 'YES' : 'no') + ' uid@after=' + (uidAfter ? 'present' : 'none') +
                    ' errors=' + errs.length);

                if (mode === 'baseline') {
                    global['__base_' + label] = { roomCode: !!roomCode, errs: errs.length };
                } else {
                    const b = global['__base_' + label] || {};
                    // Guard against the failure above: if the flow did not execute in BASELINE,
                    // there is nothing to compare and the arm proves nothing. Say so.
                    if (!b.roomCode) {
                        console.log('  ---- ' + label + ': FLOW DID NOT RUN IN BASELINE — ' +
                            'nothing to compare, these results are void, not green.');
                        fail++;
                    }
                    chk(label + ': room still created under the patch',
                        !!roomCode === !!b.roomCode,
                        'baseline room=' + b.roomCode + ' patched room=' + !!roomCode);
                    chk(label + ': a session is acquired lazily when the flow needs one',
                        !uidAtLoad && !!uidAfter,
                        'uid at load=' + uidAtLoad + ' (must be null) / after=' + uidAfter + ' (must be set)');
                    chk(label + ': no new page errors vs baseline', errs.length <= (b.errs || 0),
                        'baseline ' + b.errs + ' vs patched ' + errs.length + ': ' + errs.join(' | '));
                }
                await ctx.close().catch(() => {});
            }
        }

        // ── FLOW 3: a returning student who already has an anonymous session ────────────────
        // This is the one with real stakes: ~30 anonymous accounts hold substantial coursework.
        serveMode = 'patched';
        {
            const { ctx, pg } = await newCtx(browser);
            // First visit: establish a session the way a student would have one already.
            await pg.goto(base + BOX, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
            await new Promise(r => setTimeout(r, 1200));
            const seeded = await pg.evaluate(async () => {
                try {
                    if (typeof FirebaseAuth === 'undefined') return null;
                    await FirebaseAuth.waitForAuth();
                    const u = await FirebaseAuth.signInAnonymously();
                    return (FirebaseAuth.getUser() && FirebaseAuth.getUser().uid) || (u && u.uid) || null;
                } catch (e) { return 'ERR ' + e.message; }
            }).catch((e) => 'ERR ' + e.message);
            await new Promise(r => setTimeout(r, 2000));

            // Return visit, same browser context — persistence must carry the session.
            await pg.goto(base + BOX, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
            await new Promise(r => setTimeout(r, 2500));
            const restored = await pg.evaluate(async () => {
                try {
                    if (typeof FirebaseAuth === 'undefined') return null;
                    await FirebaseAuth.waitForAuth();
                    const u = FirebaseAuth.getUser();
                    return u ? u.uid : null;
                } catch (e) { return 'ERR ' + e.message; }
            }).catch(() => null);

            console.log('\n  [patched/restore] seeded=' + (seeded ? String(seeded).slice(0, 12) + '…' : 'null') +
                ' restored=' + (restored ? String(restored).slice(0, 12) + '…' : 'null'));
            chk('an EXISTING anonymous session survives the patch (same uid after reload)',
                !!seeded && !String(seeded).startsWith('ERR') && restored === seeded,
                'seeded=' + seeded + ' restored=' + restored +
                ' — if these differ, the patch would orphan every anonymous student\'s work');
            await ctx.close().catch(() => {});
        }

        await browser.close().catch(() => {});
        srv.close();
        console.log('\n' + pass + ' passed, ' + fail + ' failed');
        process.exit(fail > 0 ? 1 : 0);
    });
})();
