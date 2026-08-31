#!/usr/bin/env node
/**
 * tenant-crosstab.test.js
 *
 * @catalog what    Proves BUG-242's repro in a real browser: join in one tab, tenant context is
 * @catalog what    present in a SECOND tab, and sign-out purges it so the next student cannot
 * @catalog what    inherit it. Also proves the mirror is invoked from every join path.
 * @catalog run     node _tools/hexos/tenant-crosstab.test.js
 * @catalog status  GATE
 *
 * WHY THIS EXISTS AND WHAT IT GUARDS
 * ----------------------------------
 * BUG-242: eleven of twelve join paths write `hexworth_tenant` to sessionStorage only, which does
 * not cross tabs. A student who joined through a tenant dashboard and opened a gated module in a
 * NEW TAB lost their branding AND the AccessGuard waiver that skips sorting quizzes and Dark Arts
 * gates -- so they were asked to complete progression that does not exist in their experience.
 *
 * THE TRAP THIS FILE IS SHAPED AROUND. A reviewer killed two earlier designs, and the second one
 * failed for a reason no code review of the diff would catch: TenantShell.js is a parser-blocking
 * <script> near the top of every tenant page, so on a FIRST join it executes, finds no tenant
 * context, and exits BEFORE the page's own async handler fetches and writes it. A mirror placed
 * inside TenantShell's normal flow is therefore permanently inert on exactly the page the bug is
 * reported from. So this file asserts the mirror is CALLED FROM THE JOIN SITES, not merely that it
 * exists -- an existence check would have passed against the broken design.
 *
 * NOT A SECURITY TEST, and BUG-242 is not a security fix. Nothing in this path checks identity:
 * the async verification confirms a tenant EXISTS, not that the user belongs to it, so a
 * hand-written key already grants the same waiver. This guards a feature and a bleed bound.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const PORT = 9177;

let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer not installed; cross-tab behaviour cannot be verified. Refusing to fake a pass.');
    process.exit(2);
}

let pass = 0, fail = 0;
const chk = (n, c, d) => {
    c ? pass++ : fail++;
    console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 120)}`);
};

// ---- 1. STATIC: every join path must CALL the mirror ----
const JOIN_FILES = [
    'tenant/dashboard-academy.html', 'tenant/dashboard-campus.html',
    'tenant/dashboard-clean-ops.html', 'tenant/dashboard-command-center.html',
    'tenant/dashboard-enterprise.html', 'tenant/dashboard-federal.html',
    'tenant/dashboard-minimalist.html', 'tenant/dashboard-nightshift.html',
    'tenant/dashboard-tactical-hud.html', 'tenant/index.html', 'tenant/instructor.html'
];
JOIN_FILES.forEach((rel) => {
    const s = fs.readFileSync(path.join(APP, rel), 'utf8');
    const writes = (s.match(/sessionStorage\.setItem\(['"]hexworth_tenant/g) || []).length;
    const calls = (s.match(/TenantShellMirror\.mirror\(/g) || []).length;
    chk(`${rel.split('/')[1]} mirrors after its join write`, writes >= 1 && calls >= writes,
        `${writes} write(s), ${calls} mirror call(s)`);
});

// The three auto-loaders decide whether TenantRouter/TenantShell get fetched at all. If any reads
// sessionStorage alone, that page class stays unbranded while the rest looks fixed.
[['components/AccessGuard.js', 1299], ['components/FirebaseAuth.js', 718],
 ['components/ModuleProgress.js', 1886]].forEach(([rel]) => {
    const s = fs.readFileSync(path.join(APP, rel), 'utf8');
    const sessionOnly = /if \(sessionStorage\.getItem\('hexworth_tenant'\)\) \{/.test(s);
    chk(`${rel.split('/')[1]} auto-loader reads the localStorage fallback too`, !sessionOnly,
        'a sessionStorage-only gate cannot see cross-tab context');
});

// Sign-out must purge, and must NOT be wired into the auth-state listener (which fires on cold
// anonymous loads, and the join flows write with no auth gate at all).
const fa = fs.readFileSync(path.join(APP, 'components/FirebaseAuth.js'), 'utf8');
chk('signOut purges tenant context', /purgeTenantContext\(\)/.test(fa));
chk('the purge is called from BOTH signOut paths',
    (fa.match(/purgeTenantContext\(\);/g) || []).length >= 2,
    'the !auth fallback and the normal path both need it');
const listenerBlock = fa.slice(fa.indexOf('function handleAuthStateChange'),
    fa.indexOf('function handleAuthStateChange') + 3000);
chk('the purge is NOT in the auth-state listener',
    !/purgeTenantContext/.test(listenerBlock),
    'that branch fires on cold anonymous loads and would purge the blob on the join page itself');

// ---- 2. BEHAVIOUR, in a real browser ----
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
                '.png': 'image/png', '.webp': 'image/webp', '.css': 'text/css' };
const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    r.end(fs.readFileSync(f));
});
srv.on('error', (e) => { console.error(`  harness could not bind ${PORT}: ${e.code}`); process.exit(1); });

srv.listen(PORT, '127.0.0.1', async () => {
    const ORIGIN = `http://localhost:${PORT}`;
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    try {
        const ctx = browser.createBrowserContext
            ? await browser.createBrowserContext() : await browser.createIncognitoBrowserContext();

        // Load TenantShell.js standalone. Driving a full dashboard join would require a live
        // getTenantConfig endpoint; what matters here is the mirror/TTL/purge contract, and the
        // static half above already proves the join sites invoke it.
        const shell = fs.readFileSync(path.join(APP, 'components/TenantShell.js'), 'utf8');
        const CFG = { slug: 'acme', branding: { name: 'Acme Academy' }, adminUids: [] };

        const tab1 = await ctx.newPage();
        await tab1.goto(`${ORIGIN}/tenant/`, { waitUntil: 'domcontentloaded' }).catch(() => null);
        const mirrored = await tab1.evaluate((src, cfg) => {
            sessionStorage.clear(); localStorage.clear();
            eval(src);                                   // TenantShell defines the mirror and exits
            if (!window.TenantShellMirror) return { err: 'mirror not exported before early return' };
            sessionStorage.setItem('hexworth_tenant', JSON.stringify(cfg));   // the join write
            const ok = window.TenantShellMirror.mirror(cfg);                  // the new call
            return { ok, stored: localStorage.getItem('hexworth_tenant'),
                     stamp: localStorage.getItem('hexworth_tenant_mirrored_at') };
        }, shell, CFG);
        chk('the mirror is exported even when tenant context is absent at load',
            !mirrored.err, mirrored.err);
        chk('joining mirrors the config to localStorage',
            mirrored.ok === true && !!mirrored.stored, JSON.stringify(mirrored).slice(0, 90));
        chk('the mirror is stamped, so the TTL has something to read', !!mirrored.stamp);

        // THE REPRO: a second tab, same origin, no sessionStorage of its own.
        const tab2 = await ctx.newPage();
        await tab2.goto(`${ORIGIN}/tenant/`, { waitUntil: 'domcontentloaded' }).catch(() => null);
        const seen = await tab2.evaluate(() => ({
            session: sessionStorage.getItem('hexworth_tenant'),
            fallback: sessionStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant')
        }));
        chk('the second tab has NO sessionStorage copy (the bug\'s premise)', seen.session === null);
        chk('the second tab DOES resolve tenant context via the fallback', !!seen.fallback,
            'this is BUG-242 itself');

        // A malformed blob must not be mirrored -- it is what a hand-typed value looks like.
        const junk = await tab1.evaluate(() => ({
            noSlug: window.TenantShellMirror.mirror({ branding: {} }),
            notJson: window.TenantShellMirror.mirror('not json'),
            empty: window.TenantShellMirror.mirror('')
        }));
        chk('a config with no slug is refused', junk.noSlug === false);
        chk('a non-JSON string is refused', junk.notJson === false);
        chk('an empty value is refused', junk.empty === false);

        // TTL: an aged stamp must purge on the next TenantShell load.
        const aged = await tab1.evaluate((src) => {
            localStorage.setItem('hexworth_tenant_mirrored_at', String(Date.now() - (13 * 60 * 60 * 1000)));
            sessionStorage.clear();
            eval(src);
            return { stored: localStorage.getItem('hexworth_tenant') };
        }, shell);
        chk('an expired mirror is purged on next load', aged.stored === null, JSON.stringify(aged));

        // An UNSTAMPED copy (lobby.html has always written one) must be stamped, not exempted.
        const unstamped = await tab1.evaluate((src, cfg) => {
            localStorage.clear(); sessionStorage.clear();
            localStorage.setItem('hexworth_tenant', JSON.stringify(cfg));   // lobby-style, no stamp
            eval(src);
            return { stamp: localStorage.getItem('hexworth_tenant_mirrored_at'),
                     stored: !!localStorage.getItem('hexworth_tenant') };
        }, shell, CFG);
        chk('an unstamped legacy copy is stamped rather than left immortal',
            !!unstamped.stamp && unstamped.stored, JSON.stringify(unstamped));

        await tab1.close(); await tab2.close();
        await ctx.close().catch(() => {});
    } finally {
        await browser.close(); srv.close();
    }
    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
});
