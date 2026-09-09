#!/usr/bin/env node
/**
 * verify-372-production.js — READ-ONLY. Post-deploy verification for task 372.
 *
 * @catalog what   Answers "did the fix actually work in production", which is a different claim
 *                 from "the deploy exited 0". Two independent checks: (1) the file hexworth.com
 *                 is really serving carries the fix, (2) the anonymous account-creation RATE has
 *                 collapsed, measured against a pre-deploy baseline.
 * @catalog run    node _tools/anon/verify-372-production.js [--baseline-count N] [--baseline-iso T]
 * @catalog status TOOL
 *
 * WRITES NOTHING. Reads the deployed asset over HTTPS and lists Firebase Auth accounts read-only.
 *
 * WHY BOTH CHECKS. Serving the right file proves the deploy landed; it does not prove the defect
 * is gone, because the mint could have another source. The rate is the claim that matters, and it
 * is the one the operator cares about. Conversely the rate alone is ambiguous right after a deploy
 * (low traffic looks like a fix), so the served-file check pins WHY the rate moved.
 *
 * BASELINE, established 2026-09-09 before the fix shipped:
 *   6,309 anonymous accounts at 2026-09-09T02:31Z, growing ~45/day, flat around the clock
 *   (no diurnal curve, so a quiet hour is NOT an explanation for a drop).
 */
'use strict';

const https = require('https');
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
process.env.GOOGLE_CLOUD_QUOTA_PROJECT = 'hexworth-prime';

const argv = process.argv.slice(2);
const argOf = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const BASE_COUNT = parseInt(argOf('--baseline-count', '6309'), 10);
const BASE_ISO = argOf('--baseline-iso', '2026-09-09T02:31:00Z');
const URL = 'https://hexworth.com/arena/firebase-init.js';

const get = (url) => new Promise((res, rej) => {
    https.get(url, { headers: { 'Cache-Control': 'no-cache' } }, (r) => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res({ status: r.statusCode, body: d }));
    }).on('error', rej);
});

(async () => {
    let pass = 0, fail = 0;
    const chk = (l, c, d) => { c ? (pass++, console.log('  ok   ' + l))
        : (fail++, console.log('  FAIL ' + l + (d ? '\n         ' + d : ''))); };

    console.log('=== task 372 production verification (read-only) ===');
    console.log('checked at:', new Date().toISOString(), '\n');

    // ── 1. What is hexworth.com ACTUALLY serving? ───────────────────────────────────────────
    console.log('[1/2] the deployed asset');
    let served;
    try { served = await get(URL); }
    catch (e) { console.log('  FAIL could not fetch ' + URL + ': ' + e.message); process.exit(1); }
    chk('HTTP 200 from ' + URL, served.status === 200, 'got ' + served.status);
    chk('deployed file carries the fix (_lazyAuth present)',
        served.body.includes('_lazyAuth'),
        'the served file does NOT contain _lazyAuth — the deploy did not land, or a CDN edge is ' +
        'still serving the old build. Committed is not shipped.');
    chk('deployed file no longer awaits the load-time sign-in',
        !served.body.includes('await _ensureSignedIn(_auth, signInAnonymously, onAuthStateChanged);'),
        'the old awaited call is STILL in the served file');
    chk('ensureAuth() is exposed', served.body.includes('ensureAuth'), 'missing from served file');

    // ── 2. Has the account-creation rate collapsed? ─────────────────────────────────────────
    console.log('\n[2/2] the account-creation rate — the claim that actually matters');
    const users = [];
    let tok = null;
    do {
        const r = await admin.auth().listUsers(1000, tok || undefined);
        r.users.forEach(u => users.push(u));
        tok = r.pageToken;
    } while (tok);

    const isAnon = (u) => (!u.providerData || u.providerData.length === 0) && !u.email;
    const anon = users.filter(isAnon);
    const baseMs = new Date(BASE_ISO).getTime();
    const sinceBaseline = anon.filter(u => new Date(u.metadata.creationTime).getTime() > baseMs);
    const hoursElapsed = (Date.now() - baseMs) / 3600000;
    const ratePerDay = hoursElapsed > 0 ? (sinceBaseline.length / hoursElapsed) * 24 : 0;

    console.log('  anonymous accounts now      :', anon.length);
    console.log('  baseline                    :', BASE_COUNT, 'at', BASE_ISO);
    console.log('  created since baseline      :', sinceBaseline.length,
        '(over ' + hoursElapsed.toFixed(1) + 'h)');
    console.log('  implied rate                :', ratePerDay.toFixed(1),
        '/day   (pre-fix baseline was ~45/day)');

    // Only meaningful once enough time has passed to distinguish a fix from a quiet window.
    if (hoursElapsed < 2) {
        console.log('\n  ??   NOT MEASURED: only ' + hoursElapsed.toFixed(1) + 'h since baseline. ' +
            'Too short to separate a fix from ordinary variance — re-run later.');
        console.log('\n' + pass + ' passed, ' + fail + ' failed, 1 NOT MEASURED');
        process.exit(fail > 0 ? 1 : 2);
    }
    chk('anonymous account creation has collapsed (< 10/day vs ~45/day)',
        ratePerDay < 10,
        'still creating ' + ratePerDay.toFixed(1) + '/day — the fix is serving but accounts are ' +
        'still being minted, so there is a SECOND source this task did not find');

    console.log('\n' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('FAILED: ' + e.message); process.exit(1); });
