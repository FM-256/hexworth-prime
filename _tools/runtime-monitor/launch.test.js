#!/usr/bin/env node
/**
 * launch.test.js — the runtime monitor's Chrome launch retry (run.js launchBrowser).
 *
 * @catalog what    Proves a stalled Chrome launch is retried, gives up after the set attempts and
 * @catalog what    reports how many it took; one real launch checks the flags Chrome accepts.
 * @catalog run     NODE_PATH=$PWD/node_modules node _tools/runtime-monitor/launch.test.js
 * @catalog status  TOOL
 *
 * No network, no Firestore: requiring run.js does not run the monitor (require.main guard), and
 * every case but the last uses a fake launcher.
 */
const assert = require('assert');
const { launchBrowser } = require('./run.js');

let pass = 0, fail = 0;
/* Runs one named case and counts it; a thrown assertion is a failure, never a crash. */
async function t(name, fn) {
    try { await fn(); pass++; console.log('ok   ' + name); }
    catch (e) { fail++; console.log('FAIL ' + name + ': ' + e.message); }
}
/* A fake puppeteer whose launch() fails the first `bad` times, then returns a browser. */
function fake(bad) {
    const calls = [];
    return { calls, launch: async (opts) => { calls.push(opts); if (calls.length <= bad) { throw new Error('Timed out after ' + opts.timeout + ' ms while waiting for the WS endpoint URL'); } return { fake: true }; } };
}

(async () => {
    await t('first launch works: 1 attempt', async () => {
        const p = fake(0); const r = await launchBrowser(p, 3, 60000);
        assert.strictEqual(r.attempts, 1); assert.strictEqual(p.calls.length, 1);
    });
    await t('stalls once, then starts: 2 attempts', async () => {
        const p = fake(1); const r = await launchBrowser(p, 3, 60000);
        assert.strictEqual(r.attempts, 2); assert.ok(r.browser.fake);
    });
    await t('stalls twice, then starts on the last allowed attempt', async () => {
        const r = await launchBrowser(fake(2), 3, 60000); assert.strictEqual(r.attempts, 3);
    });
    await t('never starts: throws after exactly 3, error carries attempts', async () => {
        const p = fake(99); let err = null;
        try { await launchBrowser(p, 3, 60000); } catch (e) { err = e; }
        assert.ok(err, 'did not throw'); assert.strictEqual(err.attempts, 3); assert.strictEqual(p.calls.length, 3);
        assert.ok(/Chrome did not start after 3 attempts: Timed out/.test(err.message), err.message);
    });
    await t('each attempt gets the timeout and the /dev/shm flag', async () => {
        const p = fake(1); await launchBrowser(p, 3, 60000);
        p.calls.forEach((o) => { assert.strictEqual(o.timeout, 60000); assert.ok(o.args.includes('--disable-dev-shm-usage')); assert.ok(o.args.includes('--no-sandbox')); });
    });
    await t('attempts = 1 means no retry', async () => {
        const p = fake(1); let err = null;
        try { await launchBrowser(p, 1, 1000); } catch (e) { err = e; }
        assert.ok(err); assert.strictEqual(p.calls.length, 1); assert.ok(/after 1 attempt:/.test(err.message), err.message);
    });
    /* the flags must be ones a real Chrome starts with */
    await t('real Chrome starts with these flags', async () => {
        const r = await launchBrowser(require('puppeteer'), 1, 60000);
        const v = await r.browser.version(); await r.browser.close();
        assert.ok(/Chrome/.test(v), v);
    });
    console.log(pass + ' passed, ' + fail + ' failed');
    process.exitCode = fail ? 1 : 0;
})();
