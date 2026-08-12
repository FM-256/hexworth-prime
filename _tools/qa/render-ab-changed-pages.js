#!/usr/bin/env node
/*
 * @catalog what    Renders every changed _app page in a browser and A/Bs it against the SAME
 * @catalog what    page served from git HEAD, so a regression is separated from a pre-existing bug.
 * @catalog run     node _tools/qa/render-ab-changed-pages.js [--limit N]
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. A sweep across 116 files broke 3 of them, and every structural check passed:
 * the tags were in <head>, the counts balanced, no duplicate script src, no syntax error. The
 * pages were blank anyway. Structure is not render.
 *
 * ⚠ AND WHY IT IS AN A/B. My first render pass found 4 failures and I was one edit away from
 * "fixing" a ModuleProgress.init bug that was already broken at HEAD and had nothing to do with
 * my change. A render check without a control tells you a page is broken; it cannot tell you
 * that YOU broke it. The B side is served straight out of `git show HEAD:<path>`, so both sides
 * see identical URLs, identical relative paths, identical components -- the only variable is the
 * working tree.
 *
 * VERDICTS: REGRESSION (worked at HEAD, broken now) is the only one that blocks. PRE-EXISTING is
 * reported and not blamed on this change. FIXED means the working tree repaired something.
 */
'use strict';
const puppeteer = require('puppeteer');
const http = require('http'), fs = require('fs'), path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
               '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const ctype = p => MIME[path.extname(p)] || 'application/octet-stream';

/* Working-tree server. */
function liveServer() {
    return http.createServer((req, res) => {
        let p = decodeURIComponent(req.url.split('?')[0]);
        if (p.endsWith('/')) p += 'index.html';
        fs.readFile(path.join(APP, p), (e, buf) => {
            if (e) { res.writeHead(404); return res.end('404'); }
            res.writeHead(200, { 'Content-Type': ctype(p) }); res.end(buf);
        });
    });
}

/* HEAD server: same URL space, contents resolved from git. A file that does not exist at HEAD
   (genuinely new page) 404s, and the runner reports it as NEW rather than as a regression. */
function headServer() {
    return http.createServer((req, res) => {
        let p = decodeURIComponent(req.url.split('?')[0]);
        if (p.endsWith('/')) p += 'index.html';
        const rel = '_app' + p;
        try {
            const buf = execSync(`git show HEAD:"${rel}"`, { cwd: REPO, maxBuffer: 64 * 1024 * 1024 });
            res.writeHead(200, { 'Content-Type': ctype(p) }); res.end(buf);
        } catch (e) { res.writeHead(404); res.end('404'); }
    });
}

/* WHO IS VISITING. The gate takes a completely different path per role, and the default
   'sorted' student never reaches the staff bypasses at all. Nancy, 2026-08-12: the three
   functions this harness was written to protect (addGodModeBadge, showMasterKeyIndicator,
   addFirebaseAdminBadge) are UNREACHABLE under a sorted-student fixture, so "0 regressions"
   said nothing about the guards that were the point of the change. Roles are A/B'd the same
   way, so a role that breaks only in the working tree is still separable from one that was
   already broken at HEAD. */
const ROLES = {
    /* try/catch on every setter: a browser with storage blocked must not turn into a page
       error, because errors are now part of the verdict and that one would be the harness's
       own noise showing up as a finding. */
    sorted: () => {
        try {
            localStorage.setItem('hexworth_house', 'cloud');
            localStorage.setItem('hexworth_sorted', 'true');
        } catch (e) {}
    },
    'god-mode': () => {
        try {
            localStorage.setItem('hexworth_house', 'cloud');
            sessionStorage.setItem('hexworth_god_mode', 'true');
        } catch (e) {}
    },
    'master-key': () => {
        try {
            localStorage.setItem('hexworth_house', 'cloud');
            sessionStorage.setItem('hexworth_master_key', 'true');
            sessionStorage.setItem('hexworth_master_key_expiry', String(2000000000000));
        } catch (e) {}
    }
};

/* One page, one verdict input: how much text the body actually renders, plus hard errors.
   innerText is deliberate: it returns '' for a hidden body, which is the exact failure mode
   this was written to catch (a leftover visibility:hidden style nothing removes). */
async function render(browser, url, role) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message).slice(0, 120)));
    await page.evaluateOnNewDocument(`(${ROLES[role].toString()})()`);
    let out = { len: -1, vis: 'n/a', errors, status: 0 };
    try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        out.status = resp ? resp.status() : 0;
        await new Promise(r => setTimeout(r, 1100));
        Object.assign(out, await page.evaluate(() => ({
            len: (document.body && document.body.innerText || '').trim().length,
            vis: document.body ? getComputedStyle(document.body).visibility : 'no-body'
        })));
    } catch (e) { out.errors.push('NAV: ' + e.message.slice(0, 90)); }
    await page.close();
    return out;
}

(async () => {
    const limitArg = process.argv.indexOf('--limit');
    const limit = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

    /* --only <substring> exists so this harness can be mutation-tested: break one page on
       purpose, run --only that page, and confirm the verdict flips to REGRESSION. A checker
       nobody has ever seen fail is not evidence. */
    const onlyArg = process.argv.indexOf('--only');
    const only = onlyArg > -1 ? process.argv[onlyArg + 1] : null;

    const changed = execSync('git diff HEAD --name-only -- _app', { cwd: REPO })
        .toString().split('\n')
        .filter(f => f.endsWith('.html'))
        .filter(f => fs.existsSync(path.join(REPO, f)))
        .filter(f => !only || f.includes(only))
        .slice(0, limit);

    if (!changed.length) { console.log('No changed _app pages.'); process.exit(0); }

    const live = liveServer(), head = headServer();
    await new Promise(r => live.listen(0, '127.0.0.1', r));
    await new Promise(r => head.listen(0, '127.0.0.1', r));
    const lp = live.address().port, hp = head.address().port;

    const browser = await puppeteer.launch({ headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    /* --role <name> runs one role; default is all of them. */
    const roleArg = process.argv.indexOf('--role');
    const roles = roleArg > -1 ? [process.argv[roleArg + 1]] : Object.keys(ROLES);
    for (const r of roles) {
        if (!ROLES[r]) { console.error(`unknown role "${r}"; known: ${Object.keys(ROLES).join(', ')}`); process.exit(2); }
    }

    console.log(`\nRender A/B over ${changed.length} changed pages x ${roles.length} role(s) `
              + `[${roles.join(', ')}] (working tree vs git HEAD)\n`);
    const regressions = [], preexisting = [], fixed = [], newErrors = [];
    let ok = 0, done = 0;

    for (const role of roles) {
        console.log(`  --- role: ${role} ---`);
        for (const f of changed) {
            const url = '/' + f.replace(/^_app\//, '');
            const now = await render(browser, `http://127.0.0.1:${lp}${url}`, role);
            const before = await render(browser, `http://127.0.0.1:${hp}${url}`, role);
            done++;
            const nowBad = now.len === 0, beforeBad = before.len === 0 || before.status === 404;
            const rec = { f, role, now, before };

            /* ERRORS ARE PART OF THE VERDICT, not decoration. They were collected and then
               never read, which meant this harness could not have caught its own author's
               most recent bug: addGodModeBadge() threw on a null document.body, but
               showContent() had already run, so the page still had text and the verdict said
               "ok" while an exception sat unread in the array (Nancy, 2026-08-12).
               A/B'd like everything else -- an exception that also throws at HEAD is the
               page's pre-existing bug, not this change's. */
            const beforeSet = new Set(before.errors);
            const fresh = [...new Set(now.errors.filter(e => !beforeSet.has(e)))];

            if (nowBad && !beforeBad) { regressions.push(rec); console.log(`  REGRESSION  ${f}\n              HEAD len=${before.len} -> now len=${now.len} (body ${now.vis})`); }
            else if (nowBad && beforeBad) { preexisting.push(rec); console.log(`  pre-existing ${f} (blank at HEAD too)`); }
            else if (!nowBad && beforeBad && before.status !== 404) { fixed.push(rec); console.log(`  FIXED       ${f}  0 -> ${now.len}`); }
            else if (fresh.length) { newErrors.push({ ...rec, fresh }); console.log(`  NEW ERROR   ${f}\n              ${fresh[0]}`); }
            else ok++;
            if (done % 50 === 0) console.log(`  ... ${done}/${changed.length * roles.length}`);
        }
    }

    console.log(`\n--- ${ok} render, ${regressions.length} REGRESSION, ${newErrors.length} NEW ERROR, `
              + `${preexisting.length} pre-existing, ${fixed.length} fixed ---`);
    await browser.close(); live.close(); head.close();
    process.exit((regressions.length + newErrors.length) ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR: ' + e.message); process.exit(1); });
