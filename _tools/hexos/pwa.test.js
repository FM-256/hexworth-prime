#!/usr/bin/env node
/**
 * pwa.test.js
 *
 * @catalog what    Proves the Hex OS PWA installs, and proves the thing that nearly shipped
 * @catalog what    broken: that NO service worker is registered at /hex/, so tenant-sw.js keeps
 * @catalog what    control of those pages and keeps injecting the white-label shell.
 * @catalog run     node _tools/hexos/pwa.test.js
 * @catalog status  GATE
 *
 * WHY THIS IS A GATE, AND WHY THE CENTRAL ASSERTION IS AN ABSENCE
 * --------------------------------------------------------------
 * HEXOS-5 makes /hex/ installable. The first cut did that with a service worker scoped to
 * '/hex/' for offline launch. That was wrong in a way no diff review would catch.
 *
 * tenant-sw.js registers at scope '/' and injects TenantRouter + TenantShell into every
 * navigation outside /tenant/ and /admin/. That injection IS the white-label guarantee. Scope
 * matching prefers the LONGEST match, so a worker at '/hex/' becomes the controller for the two
 * Hex OS pages and tenant-sw stops seeing those navigations entirely. It stops even if the
 * narrower worker's fetch handler does nothing: the controller is chosen by SCOPE, not by what
 * the handler does. A tenant's students would have quietly started seeing raw Hexworth branding
 * inside a product sold as white-labelled.
 *
 * A load-time guard was tried and cannot work. The controller for a navigation is resolved
 * BEFORE the destination document's scripts run, so on the very load where such a guard detects
 * a tenant, the page had already been served uninjected; it only protects the NEXT load. The
 * cross-tab half could not fire either, because hexworth_tenant reaches localStorage from
 * exactly one of twelve writers (_app/lobby.html) while the ten tenant dashboards and
 * tenant/index.html write sessionStorage only.
 *
 * So the fix is removal, and the invariant this file defends is that the removal stays removed.
 * Nothing was traded away for it: Chrome's own Page.getInstallabilityErrors returns [] for /hex/
 * with no worker at all, which is asserted below rather than assumed.
 *
 * EVERY ASSERTION HERE MUST BE ABLE TO FAIL. Two in an earlier revision could not: one checked
 * fs.existsSync on a file whose readFileSync three lines above would already have thrown, and one
 * regex-tested for the token "inScope" in source, which passes on a comment and passes on
 * inverted logic. Both are gone. A test that cannot go red is a decoration.
 *
 * REAL ORIGIN, NOT 127.0.0.1. Registration requires a secure context; `localhost` qualifies and
 * `127.0.0.1` is refused by the page-side gate. An earlier harness served from 127.0.0.1 and
 * passed 11/11 while never starting a worker at all.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
/* PORT 0: the OS assigns a free port at listen time, set in the listen callback below.
   These suites each hardcoded a port, which makes them unsafe to run concurrently with
   each other or with themselves. Two of them were already colliding on 9311. Reproduced
   directly: two instances of one suite at once, one passed and the other died with
   EADDRINUSE. Phantom failures are worse than no test, because they train whoever sees
   them to re-run until green. */
let PORT = 0;

let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; cannot verify installability or workers without a browser. Refusing to fake a pass.');
    process.exit(2);
}

const TYPES = {
    '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
    '.webmanifest': 'application/manifest+json', '.png': 'image/png',
    '.webp': 'image/webp', '.css': 'text/css', '.svg': 'image/svg+xml'
};

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
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

const HEX_PAGES = ['hex/index.html', 'hex/apps.html'];

srv.listen(0, '127.0.0.1', async () => {
    PORT = srv.address().port;
    let pass = 0, fail = 0;
    const chk = (n, c, d) => {
        c ? pass++ : fail++;
        console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 120)}`);
    };
    const ORIGIN = `http://localhost:${PORT}`;
    const stubGuard = (pg) => {
        // AccessGuard gates /hex/ on an entitled signed-in user. Stubbing it keeps this file
        // testing the PWA instead of re-testing auth, which has its own coverage.
        pg.on('request', (r) => {
            if (/AccessGuard\.js$/.test(r.url())) {
                return r.respond({
                    status: 200, contentType: 'text/javascript',
                    body: 'window.AccessGuard={require:function(){}};'
                });
            }
            r.continue();
        });
    };

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage();
        const pageErrors = [];
        page.on('pageerror', (e) => pageErrors.push(e.message));
        await page.setRequestInterception(true);
        stubGuard(page);
        await page.goto(`${ORIGIN}/hex/`, { waitUntil: 'networkidle0' });

        // ---- 1. THE MANIFEST, as the browser parses it ----
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
        chk('manifest scope is /hex/', man && man.scope === '/hex/', man && man.scope);
        chk('start_url is /hex/', man && man.start_url === '/hex/', man && man.start_url);

        const icons = (man && man.icons) || [];
        chk('more than one icon size is offered, so a taskbar does not decode 428KB for a 32px slot',
            icons.length > 1, `${icons.length} icon(s)`);
        for (const ic of icons) {
            const got = await page.evaluate(async (src) => {
                const r = await fetch(src);
                return { ok: r.ok, status: r.status, type: r.headers.get('content-type') };
            }, ic.src);
            chk(`icon ${ic.sizes} resolves to a real image`,
                got.ok && /^image\//.test(got.type || ''), JSON.stringify(got));
        }
        for (const sc of (man && man.shortcuts) || []) {
            const got = await page.evaluate(async (u) => (await fetch(u)).status, sc.url);
            chk(`shortcut ${sc.url} is not a 404`, got === 200, 'HTTP ' + got);
        }
        chk('apple-touch-icon present, so iOS add-to-home is not a blank tile',
            await page.evaluate(() => !!document.querySelector('link[rel="apple-touch-icon"]')));
        chk('theme-color set', await page.evaluate(() => !!document.querySelector('meta[name="theme-color"]')));
        chk('the page throws nothing on load', pageErrors.length === 0, pageErrors[0]);

        // ---- 2. CHROME'S OWN VERDICT ON INSTALLABILITY ----
        // This is the claim "it installs", asked of the component that decides it, rather than
        // inferred from the manifest being well-formed. It is also what makes the absence of a
        // service worker defensible instead of merely convenient.
        const cdp = await page.target().createCDPSession();
        const inst = await cdp.send('Page.getInstallabilityErrors').catch((e) => ({ error: e.message }));
        const instErrs = (inst && inst.installabilityErrors) || [];
        chk('Chrome reports NO installability errors', !inst.error && instErrs.length === 0,
            JSON.stringify(inst));

        // ---- 3. THE INVARIANT: NO WORKER AT /hex/ ----
        // getRegistrations() is per-ORIGIN and shared across every tab of one browser profile, so
        // this assertion is only meaningful in a context where nothing else has registered
        // anything. Reading it on the shared default page would make it depend on running before
        // section 4 registers tenant-sw -- true today, silently wrong after any reorder. An
        // isolated context makes the guarantee independent of the order of this file.
        const cleanCtx = browser.createBrowserContext
            ? await browser.createBrowserContext()
            : await browser.createIncognitoBrowserContext();
        const cleanPage = await cleanCtx.newPage();
        try {
            await cleanPage.setRequestInterception(true);
            stubGuard(cleanPage);
            await cleanPage.goto(`${ORIGIN}/hex/`, { waitUntil: 'networkidle0' });
            await new Promise((r) => setTimeout(r, 1500));   // ample time for a registration to land
            const liveScopes = await cleanPage.evaluate(async () =>
                (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope));
            chk('loading /hex/ registers NO service worker at all', liveScopes.length === 0,
                JSON.stringify(liveScopes));
        } finally {
            await cleanPage.close();
            await cleanCtx.close().catch(() => {});
        }

        for (const rel of HEX_PAGES) {
            const src = fs.readFileSync(path.join(APP, rel), 'utf8');
            chk(`${rel} contains no serviceWorker.register call`,
                !/serviceWorker\s*\.\s*register/.test(src),
                'a worker here would take these pages away from tenant-sw.js');
        }
        // hex-sw.js is kept on disk for HEXOS-5b under the never-destroy rule, so assert it stays
        // INERT rather than assuming nobody will wire it up. Whole-tree, not just /hex/.
        //
        // Match the EXECUTABLE forms only. A first cut forbade the mere string "hex-sw.js" and so
        // went red against a correct tree, because both Hex OS pages name the file in the comment
        // explaining why it is deliberately not registered. Prose about a hazard is not the
        // hazard. Deciding "is this mention live code or a comment?" by stripping comments is the
        // trap this repo has repeatedly fallen into, so instead these patterns match only how the
        // file could actually be ACTIVATED: passed to register(), or pulled in by src/href.
        const ACTIVATION = [
            /serviceWorker\s*\.\s*register\s*\(\s*['"`][^'"`]*hex-sw\.js/,
            /(?:src|href)\s*=\s*['"][^'"]*hex-sw\.js/
        ];
        const wired = [];
        (function walk(dir) {
            for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
                const f = path.join(dir, e.name);
                if (e.isDirectory()) { walk(f); continue; }
                if (!/\.(html|js)$/.test(e.name)) continue;
                if (f === path.join(APP, 'hex', 'hex-sw.js')) continue;   // the file itself
                const src = fs.readFileSync(f, 'utf8');
                if (ACTIVATION.some((re) => re.test(src))) wired.push(path.relative(APP, f));
            }
        })(APP);
        chk('nothing anywhere in _app activates hex-sw.js', wired.length === 0, wired.join(', '));

        // ---- 4. THE POSITIVE CASE: tenant injection actually reaches /hex/ ----
        // The three checks above are absences. On their own they would still pass if tenant-sw
        // were broken for some unrelated reason, so this drives the real tenant worker and
        // demands the real injected markers on a real /hex/ navigation. Without this, the gate
        // would be asserting "we did not do the bad thing" and never "the good thing happens".
        const ctx = browser.createBrowserContext
            ? await browser.createBrowserContext()
            : await browser.createIncognitoBrowserContext();
        const tp = await ctx.newPage();
        try {
            await tp.setRequestInterception(true);
            stubGuard(tp);
            await tp.goto(`${ORIGIN}/tenant/`, { waitUntil: 'domcontentloaded' }).catch(() => null);
            const activated = await tp.evaluate(async () => {
                try {
                    const reg = await navigator.serviceWorker.register('/tenant-sw.js', { scope: '/' });
                    await navigator.serviceWorker.ready;
                    const sw = reg.active || navigator.serviceWorker.controller;
                    if (sw) sw.postMessage({ type: 'TENANT_ACTIVATE' });
                    await new Promise((r) => setTimeout(r, 400));
                    return { scope: reg.scope };
                } catch (e) { return { err: e.message }; }
            });
            chk('tenant-sw.js registers at scope /', activated && !activated.err && /\/$/.test(activated.scope || ''),
                JSON.stringify(activated));

            await tp.goto(`${ORIGIN}/hex/`, { waitUntil: 'networkidle0' });
            const injected = await tp.evaluate(() => ({
                router: !!document.querySelector('script[src="/components/TenantRouter.js"]'),
                shell: !!document.querySelector('script[src="/components/TenantShell.js"]'),
                controller: navigator.serviceWorker.controller
                    && navigator.serviceWorker.controller.scriptURL
            }));
            chk('tenant-sw still CONTROLS /hex/ (nothing narrower stole it)',
                /tenant-sw\.js$/.test(injected.controller || ''), JSON.stringify(injected));
            chk('TenantRouter.js is injected into /hex/', injected.router, JSON.stringify(injected));
            chk('TenantShell.js is injected into /hex/', injected.shell, JSON.stringify(injected));

            // A SECOND navigation, because the first one cannot show the damage. Injecting a
            // competing worker was verified to leave this page's markers INTACT on the load that
            // registers it -- tenant-sw served the HTML before the new worker activated and
            // claimed. The uninjected page is what the student gets NEXT. That one-load delay is
            // also precisely why a load-time guard cannot prevent this, so the gate has to look
            // where the harm actually lands rather than only where it originates.
            await tp.goto(`${ORIGIN}/hex/apps.html`, { waitUntil: 'networkidle0' });
            const second = await tp.evaluate(() => ({
                router: !!document.querySelector('script[src="/components/TenantRouter.js"]'),
                shell: !!document.querySelector('script[src="/components/TenantShell.js"]'),
                controller: navigator.serviceWorker.controller
                    && navigator.serviceWorker.controller.scriptURL
            }));
            chk('and on the NEXT navigation the tenant shell is STILL injected',
                second.router && second.shell && /tenant-sw\.js$/.test(second.controller || ''),
                JSON.stringify(second));
        } finally {
            await tp.close();
            await ctx.close().catch(() => {});
        }
    } finally {
        await browser.close();
        srv.close();
    }

    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
});
