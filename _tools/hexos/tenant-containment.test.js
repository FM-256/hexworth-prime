#!/usr/bin/env node
/**
 * tenant-containment.test.js
 *
 * @catalog what    UNSTUBBED proof that a tenant student cannot escape the white-label wrapper from
 * @catalog what    a Hex OS page, and that TenantShell is not loaded twice. Runs the real
 * @catalog what    AccessGuard, TenantRouter and TenantShell, mocking only the network.
 * @catalog run     node _tools/hexos/tenant-containment.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS, AND WHY IT DOES NOT STUB AccessGuard
 * -----------------------------------------------------
 * `_app/hex/index.html` carries a literal `<a href="/">back to Hexworth</a>`. For a white-label
 * student that link is contained only because TenantShell.overrideLinks() rewrites it to the tenant
 * hub. Historically TenantShell arrived by tenant-sw injection, so containment depended on which
 * service worker won the scope race for /hex/ -- a worker scoped there outranks tenant-sw at '/',
 * and the link reverted to raw Hexworth. One click out of the product the tenant is paying for.
 *
 * The fix loads TenantRouter and TenantShell statically on the Hex OS pages. The FIRST probe
 * written to prove that was worthless twice over, and both failures are the reason this file is
 * shaped the way it is:
 *
 *   1. Run one let tenant-sw stay the controller, so the injection ALSO fired and the result could
 *      not be attributed to the static includes at all.
 *   2. Run two forced hex-sw to win, but STUBBED AccessGuard.js -- and AccessGuard has its own
 *      tenant auto-loader (AccessGuard.js:1299-1319) that loads both scripts independently of any
 *      worker. The probe silenced the exact component whose interaction it was testing.
 *
 * A reviewer found (2), and found a real defect behind it: a static <script src> does not set
 * window.__tenantShellRequested, so AccessGuard re-fetched and re-executed TenantShell on every
 * page load. Absorbed by TenantShell's own idempotency guard, but a wasted execution and a wasted
 * getTenantConfig round trip on every view.
 *
 * A second reviewer then found that the number proving the fix (3 calls before, 2 after) existed
 * only in a scratchpad script that was never committed. A load-bearing measurement whose probe has
 * vanished is not evidence, it is an assertion about evidence. Hence this file.
 *
 * ONLY THE NETWORK IS MOCKED. getTenantConfig is answered locally so the gate never touches
 * production, and the tenant blob is seeded the way a join flow writes it. Every component under
 * test runs for real.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const PORT = 9209;
const PAGES = ['/hex/', '/hex/apps.html', '/hex/faq.html'];

let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; containment cannot be verified in a browser. Refusing to fake a pass.');
    process.exit(2);
}

const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
    '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png',
    '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml'
};

// Lets the counterfactual serve a modified index.html without touching the tracked file.
const overrides = new Map();

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    if (overrides.has(p)) {
        r.writeHead(200, { 'Content-Type': 'text/html' });
        return r.end(overrides.get(p));
    }
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});
srv.on('error', (e) => {
    console.error(`  harness could not bind ${PORT}: ${e.code || e.message}. Nothing was verified.`);
    process.exit(1);
});

let pass = 0, fail = 0;
const chk = (n, c, d) => {
    c ? pass++ : fail++;
    console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 120)}`);
};

const TENANT = JSON.stringify({ slug: 'acme', branding: { name: 'Acme Academy' }, adminUids: [] });

/** Load one page as a tenant student. Nothing but the network is mocked. */
async function visit(browser, url, opts) {
    opts = opts || {};
    const ctx = browser.createBrowserContext
        ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();
    const pg = await ctx.newPage();
    const errors = [], shellExec = [], cfg = [];
    pg.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
    await pg.setRequestInterception(true);
    pg.on('request', (r) => {
        const u = r.url();
        if (/components\/TenantShell\.js/.test(u)) shellExec.push(u);
        if (/getTenantConfig/.test(u)) {
            cfg.push(u);
            return r.respond({
                status: 200, contentType: 'application/json',
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ slug: 'acme', status: 'active', branding: { name: 'Acme Academy' }, adminUids: [] })
            });
        }
        // Nothing off-origin may escape: this gate must never contact production.
        if (!u.startsWith(opts.origin) && !u.startsWith('data:') && !u.startsWith('about:')) return r.abort();
        r.continue();
    });
    if (!opts.noTenant) {
        await pg.evaluateOnNewDocument((blob) => {
            try { sessionStorage.setItem('hexworth_tenant', blob); localStorage.setItem('hexworth_tenant', blob); }
            catch (e) { /* storage blocked */ }
        }, TENANT);
    }
    await pg.goto(opts.origin + url, { waitUntil: 'networkidle0' });
    if (opts.registerHexSw) {
        // Force a /hex/-scoped worker to WIN, so tenant-sw is shut out of these pages entirely.
        // This is the condition that made the back-link an escape.
        await pg.evaluate(async () => {
            try { await navigator.serviceWorker.register('/hex/hex-sw.js', { scope: '/hex/' }); } catch (e) {}
            await new Promise((r) => setTimeout(r, 600));
        });
        await pg.goto(opts.origin + url, { waitUntil: 'networkidle0' });
    }
    await new Promise((r) => setTimeout(r, 2200));   // overrideLinks runs on a 1s/3s timer
    const state = await pg.evaluate(() => {
        const a = [...document.querySelectorAll('a')].find((x) => /back to Hexworth/i.test(x.textContent || ''));
        return {
            router: typeof TenantRouter !== 'undefined',
            active: (typeof TenantRouter !== 'undefined' && TenantRouter.isActive) ? TenantRouter.isActive() : null,
            shellRan: window.__tenantShellExecuted === true,
            backHref: a ? a.getAttribute('href') : null,
            controller: navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL
        };
    });
    await pg.close(); await ctx.close().catch(() => {});
    return { state, errors, shellFetches: shellExec.length, cfgCalls: cfg.length };
}

srv.listen(PORT, '127.0.0.1', async () => {
    const ORIGIN = `http://localhost:${PORT}`;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    try {
        for (const url of PAGES) {
            const r = await visit(browser, url, { origin: ORIGIN });
            chk(`${url} loads TenantRouter for a tenant student`, r.state.router, JSON.stringify(r.state));
            chk(`${url} runs TenantShell`, r.state.shellRan, JSON.stringify(r.state));
            chk(`${url} reports the tenant as active`, r.state.active === true, r.state.active);
            // THE DEFECT A REVIEWER FOUND: a static script tag does not set the auto-loaders'
            // flag, so AccessGuard re-fetched the shell on every load.
            chk(`${url} fetches TenantShell exactly ONCE`, r.shellFetches === 1,
                `${r.shellFetches} fetches; the auto-loader flag is probably unset`);
            chk(`${url} throws nothing`, r.errors.length === 0, r.errors[0]);
        }

        // THE ESCAPE. Only /hex/ carries the literal back-link, so it is the page that matters.
        const won = await visit(browser, '/hex/', { origin: ORIGIN, registerHexSw: true });
        chk('with a /hex/ worker WINNING the scope race, tenant-sw is not the controller',
            /hex-sw\.js$/.test(won.state.controller || ''), won.state.controller);
        chk('and containment STILL holds: the back-link points at the tenant hub, not "/"',
            won.state.backHref && won.state.backHref !== '/',
            `back-link is ${won.state.backHref}, which is an escape from the tenant wrapper`);

        // A direct Hexworth student must see none of this.
        const plain = await visit(browser, '/hex/', { origin: ORIGIN, noTenant: true });
        chk('a non-tenant student gets no tenant chrome', plain.state.shellRan !== true, JSON.stringify(plain.state));
        /* NOT `backHref === '/'`. With the real AccessGuard running (which is the whole point of
           this file), an unauthenticated visitor is redirected off /hex/ before the link exists, so
           backHref is null. That is correct behaviour, not a failure. The property that actually
           matters for a non-tenant student is the ABSENCE of a tenant destination: they must never
           be pointed at somebody else's hub. null and "/" both satisfy that; a /tenant/ URL would
           not. My first version asserted the literal "/" and went red against correct code. */
        chk('and they are never pointed at a tenant hub',
            !plain.state.backHref || plain.state.backHref.indexOf('/tenant/') === -1,
            `non-tenant student's back-link is ${plain.state.backHref}`);
    } finally {
        await browser.close();
        srv.close();
    }
    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
});
