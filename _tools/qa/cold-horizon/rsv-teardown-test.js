#!/usr/bin/env node
/*
 * @catalog what    Proves createRSV().destroy() removes every listener, so mounting a second
 * @catalog what    flying mission without a page reload cannot double-apply thrust (#307).
 * @catalog run     node _tools/qa/cold-horizon/rsv-teardown-test.js
 * @catalog status  GATE
 *
 * WHY. createRSV registers five listeners (keydown, keyup, blur, mousemove on window, click on
 * the canvas) and returned no teardown. Inert today: every mission is its own page, navigation
 * forces a reload, and the factory runs once per page life. But the module exists precisely so
 * a SECOND flying mission is a config rather than a copy, and the first time one mounts without
 * a reload the listeners stack. Two keydown handlers means one press queues two commands, [X]
 * queues two cancel burns, and the vehicle accelerates at double the documented rate. Nancy
 * raised it on the extraction review as a landmine aimed at the exact use case the extraction
 * was for.
 *
 * A destroy() nobody exercises is a comment. This asserts the behaviour that matters:
 *   - one instance, one press, ONE queued command
 *   - two live instances, one press, TWO commands (the bug, reproduced deliberately)
 *   - destroy the first, one press, ONE command again (the fix)
 *   - destroy is idempotent and leaves no key stuck down
 *
 * Runs against a real page so the listeners are real DOM listeners, not a mock of them.
 */
'use strict';
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.resolve(__dirname, '../../../_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
/* The harness page is served BY THIS SERVER rather than injected with setContent. A
   setContent page has no origin, so the importmap's "/vendor/three/..." resolved against
   about:blank and the module never loaded: the first run of this test died waiting for
   window.__ready with no other symptom. Same-origin is the fix. */
const HARNESS = `<!DOCTYPE html><html><body><script type="importmap">
  { "imports": { "three": "/vendor/three/three.module.min.js" } }</script>
  <script type="module">
    import * as THREE from 'three';
    import { createRSV } from '/houses/cloud/games/lib/rsv-flight.js';
    const cfg = { maxFuel:100, thrust:5.2, boostMul:2.35, fuelPerSec:3.1, tickMs:150,
                  baseTicks:4, approachRange:40, collideDmg:17 };
    const camera = new THREE.PerspectiveCamera(66, 1, 0.1, 1000);
    // createRSV only needs an EventTarget for renderer.domElement here.
    const fakeRenderer = { domElement: document.createElement('canvas') };
    window.__mk = () => createRSV({ THREE, cfg, camera, renderer: fakeRenderer,
                                    isRunning: () => true, obstacles: () => [] });
    window.__ready = true;
  </script></body></html>`;

const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/__rsv-harness.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(HARNESS);
    }
    if (p.endsWith('/')) p += 'index.html';
    fs.readFile(path.join(ROOT, p), (e, buf) => {
        if (e) { res.writeHead(404); return res.end('404'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        res.end(buf);
    });
});

let pass = 0, fail = 0;
const t = (n, c, d) => { c ? (pass++, console.log('  PASS  ' + n + (d ? '  -> ' + d : '')))
                           : (fail++, console.log('  FAIL  ' + n + (d ? '  -> ' + d : ''))); };

(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const port = server.address().port;
    const browser = await puppeteer.launch({ headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle',
               '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message).slice(0, 140)));

    await page.goto(`http://127.0.0.1:${port}/__rsv-harness.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction('window.__ready === true', { timeout: 20000 });

    // Helper: press W, let issueCommands run once per instance, count queued commands.
    async function pressAndCount(instances) {
        return page.evaluate((n) => {
            const list = window.__rsvs.slice(0, n);
            list.forEach(r => { r.cmdQueue.length = 0; });
            // A real keydown on window, which is where the module listens.
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
            list.forEach(r => r.issueCommands(performance.now()));
            const total = list.reduce((sum, r) => sum + r.cmdQueue.length, 0);
            window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
            return total;
        }, instances);
    }

    console.log('\n--- createRSV teardown (#307) ---\n');

    await page.evaluate(() => { window.__rsvs = [window.__mk()]; });
    t('one instance: one press queues ONE command', await pressAndCount(1) === 1);

    /* Reproduce the bug on purpose. Without destroy this is what a second mission mounting on
       a live page does, and it is why the landmine was worth defusing before it was stepped on. */
    await page.evaluate(() => { window.__rsvs.push(window.__mk()); });
    const doubled = await pressAndCount(2);
    t('two live instances: one press queues TWO commands (the bug)', doubled === 2, String(doubled));

    /* Now the fix: tear the first one down. Its listener must stop firing, so the surviving
       instance sees the press once. If destroy did nothing this stays at 2. */
    await page.evaluate(() => { window.__rsvs[0].destroy(); });
    const afterDestroy = await pressAndCount(2);
    t('after destroy: the same press queues ONE command', afterDestroy === 1, String(afterDestroy));

    t('the destroyed instance no longer reacts at all', await page.evaluate(() => {
        window.__rsvs[0].cmdQueue.length = 0;
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        window.__rsvs[0].issueCommands(performance.now());
        const n = window.__rsvs[0].cmdQueue.length;
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
        return n === 0;
    }));

    // Idempotent: an unmount path that defensively calls destroy twice must not throw.
    t('destroy is idempotent', await page.evaluate(() => {
        try { window.__rsvs[0].destroy(); window.__rsvs[0].destroy(); return true; }
        catch (e) { return false; }
    }));

    /* A key held at teardown must not stay latched, or a remounted mission inherits a stuck
       throttle from the one before it. */
    t('destroy leaves no key stuck down', await page.evaluate(() => {
        const r = window.__mk();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
        const before = !!r.keys['w'];
        r.destroy();
        return before && !r.keys['w'];
    }));

    console.log(`\n  page errors: ${errors.length ? errors.join(' | ') : 'none'}`);
    console.log(`\n${pass}/${pass + fail} checks passed`);
    await browser.close(); server.close();
    process.exit(fail || errors.length ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
