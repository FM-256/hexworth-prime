#!/usr/bin/env node
/**
 * pwa.test.js
 *
 * @catalog what    Proves the Hex OS PWA in a real browser: the manifest parses, the worker
 * @catalog what    registers scoped to /hex/, it never claims the site root, and it is
 * @catalog what    network-first so a deployed fix is never outlived by a cached bug.
 * @catalog run     node _tools/hexos/pwa.test.js
 * @catalog status  GATE
 *
 * WHY THIS IS A GATE AND NOT A PROBE
 * ----------------------------------
 * A service worker's blast radius is its scope, and scope is one string. `tenant-sw.js` already
 * registers at scope '/' (see _app/tenant/index.html). If this worker is ever moved to the web
 * root, or registered with scope '/', it evicts that one and tenant routing goes down for every
 * tenant on the platform. Nothing about that failure is visible in a diff review: the line still
 * reads `register(...)`, the page still loads, and the damage shows up on somebody else's site.
 *
 * The second failure this guards is subtler. A cache-first worker is how a PWA ships a bug that
 * survives its own fix -- students keep getting yesterday's shell no matter how many times we
 * deploy, and the deploy log says success every time. `hex-sw.js` is deliberately network-first;
 * ASSERT_NETWORK_FIRST below proves that by changing a file on the server and demanding the
 * browser see the new bytes, which is the only form of evidence that distinguishes the two designs.
 *
 * REAL ORIGIN, NOT 127.0.0.1. Service worker registration requires a secure context, and
 * `localhost` qualifies while `127.0.0.1` does NOT resolve to the same treatment for the
 * https-or-localhost gate in the page. A harness on 127.0.0.1 verifies that the GATE skipped
 * registration -- it cannot see the worker at all. This file serves over `localhost` for that
 * reason; an earlier run of this same check passed 11/11 without ever starting a worker.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const PORT = 9174;

let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; cannot verify a service worker without a browser. Refusing to fake a pass.');
    process.exit(2);
}

const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
    '.webmanifest': 'application/manifest+json', '.png': 'image/png',
    '.webp': 'image/webp', '.css': 'text/css', '.svg': 'image/svg+xml'
};

// Lets ASSERT_NETWORK_FIRST swap a response body without touching the working tree.
const overrides = new Map();

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    if (overrides.has(p)) {
        r.writeHead(200, { 'Content-Type': 'text/html' });
        return r.end(overrides.get(p));
    }
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        r.writeHead(404); return r.end();
    }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});

srv.on('error', (e) => {
    console.error(`  harness could not bind port ${PORT}: ${e.code || e.message}. Nothing was verified.`);
    process.exit(1);
});

srv.listen(PORT, '127.0.0.1', async () => {
    let pass = 0, fail = 0;
    const chk = (n, c, d) => {
        c ? pass++ : fail++;
        console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 110)}`);
    };
    const ORIGIN = `http://localhost:${PORT}`;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

    try {
        const page = await browser.newPage();
        const pageErrors = [];
        page.on('pageerror', (e) => pageErrors.push(e.message));

        // AccessGuard gates /hex/ on a signed-in entitled user. Stubbing it keeps this file
        // testing the PWA rather than re-testing auth, which has its own coverage.
        await page.setRequestInterception(true);
        page.on('request', (r) => {
            if (/AccessGuard\.js$/.test(r.url())) {
                return r.respond({
                    status: 200, contentType: 'text/javascript',
                    body: 'window.AccessGuard={require:function(){}};'
                });
            }
            r.continue();
        });

        await page.goto(`${ORIGIN}/hex/`, { waitUntil: 'networkidle0' });

        // ---- 1. MANIFEST, as the browser parses it, not as the file reads ----
        const man = await page.evaluate(async () => {
            const l = document.querySelector('link[rel=manifest]');
            if (!l) return null;
            const r = await fetch(l.href);
            if (!r.ok) return { httpError: r.status };
            try { return await r.json(); } catch (e) { return { parseError: e.message }; }
        });
        chk('the browser fetches and parses the manifest', man && !man.httpError && !man.parseError,
            JSON.stringify(man));
        chk('display is standalone, so an installed Hex OS has no browser chrome',
            man && man.display === 'standalone', man && man.display);
        chk('manifest scope is /hex/, not the site root', man && man.scope === '/hex/', man && man.scope);
        chk('start_url is /hex/', man && man.start_url === '/hex/', man && man.start_url);

        const icons = (man && man.icons) || [];
        chk('at least one icon is declared', icons.length > 0, JSON.stringify(icons));
        for (const ic of icons) {
            const got = await page.evaluate(async (src) => {
                const r = await fetch(src);
                return { ok: r.ok, status: r.status, type: r.headers.get('content-type') };
            }, ic.src);
            chk(`icon ${ic.src} resolves to a real image`,
                got.ok && /^image\//.test(got.type || ''), JSON.stringify(got));
        }
        for (const sc of (man && man.shortcuts) || []) {
            const got = await page.evaluate(async (u) => (await fetch(u)).status, sc.url);
            chk(`shortcut ${sc.url} is not a 404`, got === 200, 'HTTP ' + got);
        }

        chk('apple-touch-icon present, so iOS add-to-home is not a blank tile',
            await page.evaluate(() => !!document.querySelector('link[rel="apple-touch-icon"]')));
        chk('theme-color set', await page.evaluate(() => !!document.querySelector('meta[name="theme-color"]')));
        chk('the PWA wiring throws nothing on load', pageErrors.length === 0, pageErrors[0]);

        // ---- 2. THE WORKER ACTUALLY RUNS, and only where it should ----
        // Observe the registration THE PAGE performed. An earlier version of this file called
        // register() itself, which silently made the next three assertions meaningless: they
        // described the harness's own registration and stayed green even when index.html was
        // mutated to a root scope. Never hand the probe the key it is supposed to be testing for.
        // `ready` never rejects -- with no registration it simply hangs, which would make this gate
        // hang instead of fail. Race it so "no worker" is a red assertion, not a stuck run.
        const reg = await page.evaluate(async () => {
            try {
                const r = await Promise.race([
                    navigator.serviceWorker.ready,               // resolves only once the PAGE registered
                    new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 8s')), 8000))
                ]);
                return { scope: r.scope };
            } catch (e) { return { err: 'the page registered no worker: ' + e.message }; }
        });
        chk('the PAGE\'s own registration produces a live worker', reg && !reg.err, JSON.stringify(reg));
        chk('the scope the page asked for is /hex/', reg && /\/hex\/$/.test(reg.scope || ''), reg && reg.scope);

        const scopes = await page.evaluate(async () =>
            (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope));
        chk('exactly one worker is registered from a Hex OS page', scopes.length === 1, JSON.stringify(scopes));
        chk('NO worker claims the site root -- tenant-sw.js keeps scope /',
            !scopes.some((s) => new URL(s).pathname === '/'), JSON.stringify(scopes));

        // Source-level backstop for the same rule. The live check above can only see what this
        // run happened to register; this one fails even if the bad scope is on an untaken branch.
        const swSrc = fs.readFileSync(path.join(APP, 'hex/hex-sw.js'), 'utf8');
        const shellSrc = fs.readFileSync(path.join(APP, 'hex/index.html'), 'utf8');
        const gridSrc = fs.readFileSync(path.join(APP, 'hex/apps.html'), 'utf8');
        for (const [name, src] of [['index.html', shellSrc], ['apps.html', gridSrc]]) {
            chk(`${name} registers with scope '/hex/' verbatim`, /scope:\s*'\/hex\/'/.test(src));
            chk(`${name} never registers a root scope`, !/scope:\s*['"]\/['"]/.test(src));
        }
        chk('hex-sw.js lives under /hex/, so it CANNOT claim a wider scope',
            fs.existsSync(path.join(APP, 'hex/hex-sw.js')));
        chk('the worker ignores requests outside its scope', /inScope/.test(swSrc));

        // ---- 2b. A TENANT SESSION MUST WIN THE PAGE ----
        // tenant-sw.js registers at scope '/' and injects TenantRouter + TenantShell into every
        // navigation outside /tenant/ and /admin/ -- that injection IS the white-label guarantee.
        // Scope matching prefers the LONGEST match, so a worker at '/hex/' outranks '/' on these
        // two pages and would silently switch that injection off for tenant students. This was a
        // real defect in the first cut of the PWA, found by reading tenant-sw rather than by any
        // assertion, so it gets a permanent one.
        // ISOLATED CONTEXT, DELIBERATELY. Service worker registrations are per-origin and shared
        // across tabs of one profile, so a plain newPage() would inherit the worker section 2
        // just registered. That made the "a tenant session registers NO worker" assertion unable
        // to tell "never registered" apart from "stood down" -- it went red for the wrong reason
        // under a mutant that only broke the stand-down path. A fresh context starts with no
        // registrations, so the two cases below test two different things.
        const ctx = browser.createBrowserContext
            ? await browser.createBrowserContext()
            : await browser.createIncognitoBrowserContext();
        const tenantPage = await ctx.newPage();
        try {
            await tenantPage.setRequestInterception(true);
            tenantPage.on('request', (r) => {
                if (/AccessGuard\.js$/.test(r.url())) {
                    return r.respond({
                        status: 200, contentType: 'text/javascript',
                        body: 'window.AccessGuard={require:function(){}};'
                    });
                }
                r.continue();
            });
            // Seed a tenant session on the origin BEFORE /hex/ ever loads. The shape here is the
            // one _saveEnrollment actually writes (_app/lobby.html:700-706) -- the full config
            // under BOTH sessionStorage and localStorage, not a {slug, name} subset that no
            // writer produces. A fixture in a shape the product never creates can pass or fail
            // for reasons that have nothing to do with the rule it claims to test.
            await tenantPage.evaluateOnNewDocument(() => {
                const cfg = JSON.stringify({
                    slug: 'acme',
                    branding: { name: 'Acme Academy', primaryColor: '#123456' },
                    adminUids: []
                });
                try {
                    sessionStorage.setItem('hexworth_tenant', cfg);
                    localStorage.setItem('hexworth_tenant', cfg);
                    localStorage.setItem('hexworth_tenant_slug', 'acme');
                } catch (e) { /* storage blocked; the guard treats that as no tenant */ }
            });
            await tenantPage.goto(`${ORIGIN}/hex/`, { waitUntil: 'networkidle0' });
            await new Promise((r) => setTimeout(r, 2500));   // give any registration time to land

            const tenantScopes = await tenantPage.evaluate(async () =>
                (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope));
            chk('a tenant session registers NO Hex OS worker, so tenant-sw keeps injecting',
                !tenantScopes.some((s) => s.indexOf('/hex/') !== -1), JSON.stringify(tenantScopes));

            // And the reverse order: installed the PWA first, joined a tenant afterwards. The
            // stale worker from before must be stood down, not merely left unregistered.
            const standDown = await tenantPage.evaluate(async () => {
                await navigator.serviceWorker.register('/hex/hex-sw.js', { scope: '/hex/' });
                await new Promise((r) => setTimeout(r, 300));
                location.reload();
            }).catch(() => null);
            void standDown;
            await tenantPage.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => null);
            await new Promise((r) => setTimeout(r, 2500));
            const after = await tenantPage.evaluate(async () =>
                (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope));
            chk('a pre-existing Hex OS worker is unregistered once a tenant session exists',
                !after.some((s) => s.indexOf('/hex/') !== -1), JSON.stringify(after));
        } finally {
            await tenantPage.close();
            await ctx.close().catch(() => {});
        }

        // ---- 3. NETWORK-FIRST, proven by changing the server out from under the cache ----
        // Warm the cache, then serve different bytes for the same URL. A cache-first worker
        // returns the stale copy and this fails; network-first must show the new one.
        await page.goto(`${ORIGIN}/hex/apps.html`, { waitUntil: 'networkidle0' });
        await new Promise((r) => setTimeout(r, 800));
        overrides.set('/hex/apps.html', '<!doctype html><title>t</title><p id="fresh">SERVED-FRESH</p>');
        await page.goto(`${ORIGIN}/hex/apps.html`, { waitUntil: 'networkidle0' });
        const fresh = await page.evaluate(() => document.body.innerText.indexOf('SERVED-FRESH') !== -1);
        chk('network-first: a changed page is served fresh, not from cache', fresh,
            'the worker served a cached copy -- a shipped fix would never reach students');
        overrides.delete('/hex/apps.html');

        // ---- 4. OFFLINE, which is the entire reason the cache exists ----
        await page.goto(`${ORIGIN}/hex/`, { waitUntil: 'networkidle0' });
        await new Promise((r) => setTimeout(r, 800));
        await page.setOfflineMode(true);
        let offlineOk = false;
        try {
            await page.goto(`${ORIGIN}/hex/`, { waitUntil: 'domcontentloaded', timeout: 10000 });
            offlineOk = await page.evaluate(() => document.body.innerText.trim().length > 0);
        } catch (e) { offlineOk = false; }
        chk('the shell still opens with the network down', offlineOk, 'offline navigation failed');
        await page.setOfflineMode(false);
    } finally {
        await browser.close();
        srv.close();
    }

    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
});
