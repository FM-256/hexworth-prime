#!/usr/bin/env node
'use strict';

/**
 * smoke-lab-content-leaks.js
 *
 * Standing regression smoke for CTF lab content. Loads each lab in the
 * CHECKS array on production (or a preview channel), waits for its config
 * global to attach, and asserts that known answer-leak vectors are absent
 * and known fix strings are present. Originally seeded with the 6 fixes
 * from commit 61994e05 (2026-05-13); grow over time as future lab-content
 * regressions are caught.
 *
 * Does NOT play through each lab end-to-end — that's a different test.
 * This is a deploy-correctness smoke: did the right bytes ship.
 *
 * Exit codes:
 *   0 — all assertions passed
 *   1 — one or more assertions failed (regression detected)
 *   2 — infrastructure failure (puppeteer launch, network, missing deps)
 *
 * Usage:
 *   node _tools/smoke-lab-content-leaks.js
 *   BASE=https://master--hexworth-prime.web.app node _tools/smoke-lab-content-leaks.js   (preview channel)
 */

const puppeteer = require('puppeteer');

const BASE = process.env.BASE || 'https://hexworth.com';
const NAV_TIMEOUT = 30000;
// Separate budget from navigation. The config global attaches from a script that has already
// been fetched by the time DOMContentLoaded fires, so this should resolve in milliseconds; a
// long wait here means the page genuinely did not initialise, not that the network was slow.
const CONFIG_TIMEOUT = 20000;

const CHECKS = [
    {
        lab: 'pis-l09-outbreak-detection',
        config: 'PISL09Config',
        url: '/houses/shield/infosec/labs/pis-l09-outbreak-detection/index.html',
        assertions: [
            { type: 'absent', cmd: 'help',
              needle: 'Focus on: ALT-023, ALT-071, ALT-158',
              label: 'L09 help no longer leaks answer IDs' }
        ]
    },
    {
        lab: 'pis-l12-full-facility-inspection',
        config: 'PISL12Config',
        url: '/houses/shield/infosec/labs/pis-l12-full-facility-inspection/index.html',
        assertions: [
            { type: 'present', path: 'lore.intro',
              needle: 'five domains',
              label: 'L12 intro says "five domains"' },
            { type: 'absent', path: 'lore.intro',
              needle: 'four domains',
              label: 'L12 intro no longer says "four domains"' }
        ]
    },
    {
        lab: 'pis-l02-human-vector-drill',
        config: 'PISL02Config',
        url: '/houses/shield/infosec/labs/pis-l02-human-vector-drill/index.html',
        assertions: [
            { type: 'toolkit-sample-includes', toolkitName: 'flag',
              needle: 'phishing',
              label: 'L02 toolkit flag sample includes technique arg' }
        ]
    },
    {
        lab: 'pis-l06-vault-seal-operations',
        config: 'PISL06Config',
        url: '/houses/shield/infosec/labs/pis-l06-vault-seal-operations/index.html',
        assertions: [
            { type: 'absent-cmd', cmd: 'sha256sum', cmdArgs: ['-c', '/vault/manifest-hashes.txt'],
              needle: 'DAMAGED_HASH_PLACEHOLDER',
              label: 'L06 sha256sum -c output no longer contains DAMAGED_HASH_PLACEHOLDER' },
            { type: 'present-fs', path: '/vault/manifest-hashes.txt',
              needle: '8f3e4d2a916b5c7e0d8a4f9b3c2e1f0a6d5b8e7c9a4f3b1e2d6c0a5f8b9e3c2d',
              label: 'L06 manifest-hashes.txt has new realistic SHA-256' }
        ]
    }
];

async function runOne(browser, check) {
    const page = await browser.newPage();

    // ⚠ ABORT THE WIDGET THAT DEMONSTRABLY HANGS. Caught in the act 2026-08-19: navigation
    // stalled with /_lib/HexAIButton.js STILL PENDING at 24.9s, while curl fetched that exact
    // file 6/6 times in under 0.45s. Chrome caps connections per host, so one hung request
    // queues the others behind it — including the lab's own config script, which is why the
    // failure then re-surfaced as "config global never attached".
    //
    // This smoke asserts on lab CONTENT — config globals and command-handler output. The AI
    // button contributes nothing to any assertion, so refusing to fetch it removes a failure
    // mode without removing coverage. If a future assertion ever depends on it, this block must
    // go, and the flake must be solved a different way.
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        // FULFIL with an empty module rather than abort(). Aborting raises a generic
        // "net::ERR_FAILED" console error whose text does NOT contain the URL, so it cannot be
        // filtered from the js-error assertion without also masking real failures. Serving an
        // empty 200 produces no error at all — the page simply gets a module that does nothing.
        if (req.url().includes('/_lib/HexAIButton.js')) {
            return req.respond({ status: 200, contentType: 'application/javascript', body: '' });
        }
        req.continue();
    });

    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push('console.error: ' + msg.text()); });

    /* TELLING "BROKEN" APART FROM "STILL LOADING". The config-global timeout below used to report
       both as the same thing, and they demand opposite responses: a 404 on config.js is a
       regression to revert, an unfinished download is a slow network to wait out. Recording which
       requests actually FAILED is what makes that distinction possible, so the gate can say which
       one it saw instead of leaving a human to work it out on every red run. */
    /* SCOPED TO THE LAB'S OWN ASSETS, and the scoping is the whole trick. A first version recorded
       every failed request and fired on every single run, because two things fail routinely and
       neither means the lab is broken:
         - identitytoolkit.googleapis.com/v1/accounts:signUp returns 403 whenever the origin is not
           an allowlisted Firebase domain, which is true of every local run and every preview
           channel. Third-party auth failing is not this lab failing to load its config.
         - net::ERR_ABORTED arrives for requests WE cancel: a navigation that outran its timeout, or
           the second load in the retry below tearing down the first. Counting our own cancellations
           as evidence of a broken page would make the retry impossible to reach.
       So: same-origin only, real HTTP error statuses, aborts excluded, deduplicated. */
    const failedAssets = [];
    const sameOrigin = (u) => { try { return new URL(u).origin === new URL(BASE).origin; } catch { return false; } };
    const noteFailure = (s) => { if (!failedAssets.includes(s)) failedAssets.push(s); };
    page.on('response', (r) => {
        if (r.status() >= 400 && sameOrigin(r.url())) noteFailure(r.status() + ' ' + r.url());
    });
    page.on('requestfailed', (r) => {
        const why = r.failure() ? r.failure().errorText : 'unknown';
        if (why === 'net::ERR_ABORTED') return;
        if (sameOrigin(r.url())) noteFailure(why + ' ' + r.url());
    });

    const url = BASE + check.url;
    const results = [];
    let navNote = '';

    try {
        // 'domcontentloaded', NOT 'load', and NOT 'networkidle2'. Each was tried in turn:
        //
        //   networkidle2 — never settles. These pages hold a persistent Firestore connection,
        //                  so the network is never idle. Replaced for that reason.
        //   load         — waits for EVERY subresource: images, fonts, lore artwork. On a cold
        //                  CDN edge right after a deploy that exceeds 30s. Measured 2026-08-19:
        //                  three DIFFERENT labs timed out across repeated runs while the same
        //                  pages served in under 0.5s to curl. The failures moved around, which
        //                  is the signature of a resource wait rather than a broken page.
        //   domcontentloaded — STILL HOSTAGE TO THE MODULE GRAPH. Every lab loads
        //                  <script type="module" src="/_lib/HexAIButton.js">, and module scripts
        //                  block DOMContentLoaded even though they do not block parsing. Caught
        //                  it in the act 2026-08-19: navigation timed out with that request
        //                  STILL PENDING at 24.9s, while curl fetched the same file 6/6 times in
        //                  under 0.45s. An unrelated widget could therefore fail the content
        //                  smoke for every lab, which is why the failures wandered between labs.
        //   commit       — resolves as soon as the navigation commits, before any subresource.
        //                  The waitForFunction below is then the ONLY readiness gate, which is
        //                  what it was always meant to be.
        //
        // ⚠ THIS LOSES NO COVERAGE. The waitForFunction below is the real readiness gate — it
        // blocks until the lab config global is attached, and every assertion reads that global
        // or invokes a command handler on it. None of them touch an image or a font. Waiting on
        // subresources was never testing anything; it was only adding ways to fail.
        // ⚠ NAME THE STEP. The outer catch labelled every failure 'load', so a config-global
        // timeout was indistinguishable from a navigation timeout. That ambiguity sent an
        // investigation at the CDN when the failing step was not even known.
        //
        // RETRY ONCE, and only navigation. Measured 2026-08-19 on this deploy host: the same
        // URL timed out at 31.7s and then loaded in 254ms on the very next attempt, in the same
        // browser, with the failures moving randomly between labs. That is network-level
        // intermittency, not a page defect.
        //
        // ⚠ WHY A RETRY IS LEGITIMATE HERE AND WOULD NOT BE ELSEWHERE. It retries ONLY the
        // transport, never an assertion. A genuinely broken or missing page fails BOTH attempts
        // and still reports; the content assertions are untouched and un-retried. What this
        // suppresses is exactly one class of event — a dropped connection — which is not
        // something this smoke is meant to detect. Retrying a failing ASSERTION would be
        // hiding a regression; retrying a failed TCP connection is not.
        // Navigate, but do NOT treat the navigation event as the readiness gate. If the wait
        // expires we carry on: the config-global check below decides whether the page is usable.
        // A page that genuinely failed to load has no config global and fails there, with a
        // message that says so.
        //
        // ⚠ 'commit' would be the exact right waitUntil here and PUPPETEER DOES NOT HAVE IT —
        // that is a Playwright option. Tried it, every run failed with "Unknown value for
        // options.waitUntil". Loudly, at least.
        /* ⚠ THE RETRY DESCRIBED ABOVE WAS NEVER IMPLEMENTED. The doctrine block was accurate about
           what SHOULD happen and the code did a single `page.goto` with no second attempt, so the
           file asserted a resilience it did not have. Implemented below, on the terms the doctrine
           already set: the TRANSPORT is retried, the assertions never are.

           WHY IT MATTERS, measured on a real deploy 2026-09-03. post-verify reported
           `CONFIG-GLOBAL "PISL09Config" never attached within 20000ms` and the same run passed
           10/0 minutes later with nothing changed. Cause: pis-l09 is the FIRST lab visited so it
           absorbs browser cold-start; its page loads 11 external scripts with no defer/async, so
           they run serially; config.js is the 10th of the 11; and ~443KB of blocking script must
           download AND execute before the global exists. This gate runs immediately after
           `firebase deploy`, which is the one moment every asset is a guaranteed cold CDN miss.
           Warm, config.js fetches in 0.33s. A fixed 20s budget spent at the worst possible moment
           is not a defect detector, it is a coin flip.

           NOT FIXED BY RAISING THE TIMEOUT. A bigger number moves the coin flip, it does not
           remove it, and it slows every honest failure down. The fix is to answer the question the
           old message could not: did the page FAIL to fetch what it needed, or had it simply not
           finished? A failed asset is a real defect and still fails on the FIRST attempt with the
           status and URL named. Only the "everything fetched, nothing broke, it just wasn't done
           yet" case gets a second attempt, and if that one also comes up empty it fails for real. */
        const attemptLoad = async () => {
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
            } catch (e) {
                navNote = 'navigation wait expired (' + e.message.slice(0, 40) + ') — '
                        + 'continuing to the config-global gate';
            }
            try {
                await page.waitForFunction(
                    (cfgName) => {
                        try { return typeof eval(cfgName) === 'object' && eval(cfgName) !== null; }
                        catch { return false; }
                    },
                    { timeout: CONFIG_TIMEOUT },
                    check.config
                );
                return null;
            } catch (e) {
                return e.message;
            }
        };

        let cfgErr = await attemptLoad();

        if (cfgErr) {
            // BROKEN: something the page needed did not arrive. Name it and fail now. Retrying
            // this would be retrying an assertion, which the doctrine above forbids for good
            // reason -- it is how a real regression gets waited out until it passes.
            if (failedAssets.length) {
                throw new Error('CONFIG-GLOBAL "' + check.config + '" never attached, and '
                    + failedAssets.length + ' request(s) FAILED: '
                    + failedAssets.slice(0, 3).join(' | '));
            }
            // SLOW: every request succeeded, the chain just had not finished. Transport only.
            const firstWait = CONFIG_TIMEOUT;
            failedAssets.length = 0;
            /* Drop the abandoned attempt's console noise too. A load that never finished defining
               the config emits the obvious downstream wreckage ("PISL09Config is not defined"),
               and the assertions below judge the page we RETRIED, not the one we threw away.
               This loses no coverage: a page that genuinely errors does it again on the second
               load and is recorded fresh. Keeping them would fail `no js errors` for every lab
               that was merely slow, which is the same false alarm one layer down. */
            errors.length = 0;
            cfgErr = await attemptLoad();
            if (cfgErr) {
                throw new Error('CONFIG-GLOBAL "' + check.config + '" never attached within '
                    + firstWait + 'ms on TWO separate loads, with no failed requests either time. '
                    + 'That is not a cold cache: ' + cfgErr);
            }
            results.push({
                label: 'load (slow)',
                pass: true,
                detail: 'config global needed a second load (cold CDN after deploy); all requests '
                      + 'succeeded both times'
            });
        }

        if (navNote) results.push({ label: 'load (slow)', pass: true, detail: navNote });

        for (const a of check.assertions) {
            let pass = false;
            let detail = '';

            if (a.type === 'absent' && a.cmd) {
                // Invoke a command handler in-page and check its output string
                const output = await page.evaluate((cfgName, cmd) => {
                    const cfg = eval(cfgName);
                    const fn = cfg.commands && cfg.commands[cmd];
                    if (!fn) return '__NO_CMD__';
                    try {
                        // Mock engine: provide config back-reference
                        const mockEngine = { config: cfg, awardFlag: () => {}, terminal: null };
                        return fn([], null, mockEngine);
                    } catch (e) { return '__ERR__: ' + e.message; }
                }, check.config, a.cmd);
                pass = typeof output === 'string' && !output.includes(a.needle);
                detail = pass ? `output ok (len=${output.length})` : `LEAK: ${a.needle} found in ${a.cmd} output`;
            }
            else if (a.type === 'present' && a.path) {
                const val = await page.evaluate((cfgName, path) => {
                    const parts = path.split('.');
                    let v = eval(cfgName);
                    for (const p of parts) v = v && v[p];
                    return v;
                }, check.config, a.path);
                pass = typeof val === 'string' && val.includes(a.needle);
                detail = pass ? `present in ${a.path}` : `MISSING: "${a.needle}" not in ${a.path}`;
            }
            else if (a.type === 'absent' && a.path) {
                const val = await page.evaluate((cfgName, path) => {
                    const parts = path.split('.');
                    let v = eval(cfgName);
                    for (const p of parts) v = v && v[p];
                    return v;
                }, check.config, a.path);
                pass = typeof val === 'string' && !val.includes(a.needle);
                detail = pass ? `not present in ${a.path}` : `STILL THERE: "${a.needle}" still in ${a.path}`;
            }
            else if (a.type === 'toolkit-sample-includes') {
                const sample = await page.evaluate((cfgName, toolkitName) => {
                    const cfg = eval(cfgName);
                    const tk = (cfg.lore && cfg.lore.toolkit) || [];
                    const entry = tk.find(t => t.name === toolkitName);
                    return entry ? entry.sample : null;
                }, check.config, a.toolkitName);
                pass = typeof sample === 'string' && sample.includes(a.needle);
                detail = pass ? `sample="${sample}"` : `BAD SAMPLE: "${sample}" missing "${a.needle}"`;
            }
            else if (a.type === 'absent-cmd') {
                const output = await page.evaluate((cfgName, cmd, args) => {
                    const cfg = eval(cfgName);
                    const fn = cfg.commands && cfg.commands[cmd];
                    if (!fn) return '__NO_CMD__';
                    try {
                        const mockEngine = { config: cfg, awardFlag: () => {}, terminal: null };
                        return fn(args, null, mockEngine);
                    } catch (e) { return '__ERR__: ' + e.message; }
                }, check.config, a.cmd, a.cmdArgs);
                pass = typeof output === 'string' && !output.includes(a.needle);
                detail = pass ? `output ok (len=${output.length})` : `LEAK: ${a.needle} still in ${a.cmd} output`;
            }
            else if (a.type === 'present-fs') {
                // Walk the in-lab filesystem object to find the file content
                const content = await page.evaluate((cfgName, target) => {
                    const cfg = eval(cfgName);
                    const fs = cfg.filesystem || {};
                    // Filesystem root is keyed under '/'. Walk from there.
                    let node = fs['/'];
                    const segments = target.split('/').filter(Boolean);
                    for (const seg of segments) {
                        node = node && node.children && node.children[seg];
                        if (!node) return null;
                    }
                    return node && node.content;
                }, check.config, a.path);
                pass = typeof content === 'string' && content.includes(a.needle);
                detail = pass ? `found in ${a.path}` : `NOT FOUND in ${a.path}`;
            }

            results.push({ label: a.label, pass, detail });
        }
    } catch (e) {
        results.push({ label: 'load', pass: false, detail: 'EXCEPTION: ' + e.message });
    }

    if (errors.length > 0) {
        results.push({ label: 'no js errors', pass: false, detail: errors.slice(0, 3).join(' | ') });
    } else {
        results.push({ label: 'no js errors', pass: true, detail: '' });
    }

    await page.close();
    return { lab: check.lab, results };
}

(async () => {
    console.log(`\n══ LAB CONTENT-LEAK SMOKE ══`);
    console.log(`Base: ${BASE}\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let totalPass = 0, totalFail = 0;

    for (const check of CHECKS) {
        const { lab, results } = await runOne(browser, check);
        console.log(`[${lab}]`);
        for (const r of results) {
            const mark = r.pass ? '  PASS' : '  FAIL';
            console.log(`${mark}  ${r.label}${r.detail ? ' — ' + r.detail : ''}`);
            if (r.pass) totalPass++; else totalFail++;
        }
        console.log('');
    }

    await browser.close();

    console.log(`══ ${totalPass} PASS / ${totalFail} FAIL ══`);
    process.exit(totalFail === 0 ? 0 : 1);
})().catch(e => { console.error('SMOKE ERROR:', e); process.exit(2); });
