#!/usr/bin/env node
/**
 * verify-live-hexos.js
 *
 * @catalog what    Drives the LIVE Hex OS shell in Chrome and proves the eight case-sensitivity
 * @catalog what    fixes are actually in the deployed build. Runs a lowercase CONTROL first.
 * @catalog run     NODE_PATH=$(pwd)/node_modules node _tools/hexos/verify-live-hexos.js https://hexworth.com
 * @catalog status  TOOL
 *
 * Point it at a preview channel before a deploy and at production after. It verifies the SERVED
 * bytes, which is the only thing that matters post-deploy: a local suite passing tells you the
 * tree is right, not that the release is. Preview channels can also serve Chrome a different
 * build than curl gets, so this uses a real browser deliberately.
 *
 * Only AccessGuard is neutralised, because an unauthenticated headless browser is redirected off
 * /hex/ before the shell renders. Everything else is the real deployed page.
 *
 * The CONTROL assertions are not padding: without them, a Tab handler that offered everything to
 * everyone would pass every capitalised case.
 */
'use strict';
let puppeteer; try { puppeteer = require('puppeteer'); } catch (e) {
    console.error('puppeteer missing'); process.exit(2);
}
const BASE = process.argv[2];
if (!BASE) { console.error('usage: verify-preview.js <baseUrl>'); process.exit(2); }

let pass = 0, fail = 0;
const chk = (n, c, d) => { c ? pass++ : fail++;
    console.log(`  ${c ? 'ok  ' : 'FAIL'} ${n}${c ? '' : '  <- ' + String(d).slice(0, 150)}`); };

(async () => {
    const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(e.message.split('\n')[0]));
    await pg.setRequestInterception(true);
    pg.on('request', r => {
        if (/AccessGuard\.js$/.test(r.url())) {
            return r.respond({ status: 200, contentType: 'text/javascript',
                body: 'window.AccessGuard={require:function(){},redirect:function(){}};' });
        }
        r.continue();
    });
    await pg.goto(BASE + '/hex/', { waitUntil: 'networkidle0', timeout: 45000 });
    await new Promise(r => setTimeout(r, 2500));

    // The manifest must actually load, or every assertion below passes vacuously on an empty shell.
    const ready = await pg.evaluate(() => document.getElementById('out').innerText.length > 0);
    chk('the deployed shell rendered something', ready, 'empty #out');

    async function run(s) {
        await pg.evaluate(() => { document.getElementById('out').innerHTML = '';
                                  document.getElementById('cmd').value = ''; });
        await pg.click('#cmd'); await pg.type('#cmd', s); await pg.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 900));
        return pg.evaluate(() => document.getElementById('out').innerText.trim());
    }
    async function tab(s) {
        await pg.evaluate(() => { document.getElementById('out').innerHTML = '';
                                  document.getElementById('cmd').value = ''; });
        await pg.click('#cmd'); await pg.type('#cmd', s); await pg.keyboard.press('Tab');
        await new Promise(r => setTimeout(r, 500));
        const res = await pg.evaluate(() => ({ value: document.getElementById('cmd').value,
                                               out: document.getElementById('out').innerText.trim() }));
        await pg.evaluate(() => { document.getElementById('cmd').value = ''; });
        return res;
    }

    // CONTROL first. If lowercase were broken the capitalised results would be meaningless.
    let o = await run('ls');
    chk('CONTROL: lowercase `ls` lists groups', /categor|house/i.test(o), o.slice(0, 100));
    o = await run('LS');
    chk('`LS` works (site 3)', /categor|house/i.test(o), o.slice(0, 100));
    o = await run('INFO arena');
    chk('`INFO arena` works (site 2)', !/no app called/i.test(o) && /arena/i.test(o), o.slice(0, 100));
    o = await run('man RUN');
    chk('`man RUN` returns the page (site 7)', /SYNOPSIS/.test(o), o.slice(0, 100));
    chk('  -> and prints the canonical lowercase NAME', /NAME\s*\n?\s*run\b/.test(o), o.slice(0, 80));
    o = await run('man ST');
    chk('a capitalised prefix still suggests', /did you mean/i.test(o) && /stop/.test(o), o.slice(0, 110));
    o = await run('CD cloud');
    chk('`CD cloud` enters the house (site 4)', !/no such place/i.test(o), o.slice(0, 110));
    o = await run('cd /');

    // Site 8, the one that shipped silent.
    let t = await tab('run ar');
    const lower = /arctic|arena|armory/.test(t.out) || /arctic|arena|armory/.test(t.value);
    chk('CONTROL: lowercase `run ar` + Tab completes', lower, JSON.stringify(t));
    t = await tab('RUN ar');
    chk('`RUN ar` + Tab completes (site 8, was SILENT)',
        /arctic|arena|armory/.test(t.out) || /arctic|arena|armory/.test(t.value), JSON.stringify(t));
    t = await tab('CD cl');
    chk('`CD cl` + Tab offers places', /cloud/.test(t.out) || /cloud/.test(t.value), JSON.stringify(t));
    t = await tab('Man r');
    chk('`Man r` + Tab offers manual pages', /run/.test(t.out) || /run/.test(t.value), JSON.stringify(t));

    // The message that replaced the silence, and its split.
    t = await tab('ps ');
    chk('a pool-less verb says so instead of going silent', /nothing to complete/i.test(t.out), JSON.stringify(t));
    t = await tab('cd cloud extra');
    chk('past the first argument reports POSITION', /nothing more to complete/i.test(t.out), JSON.stringify(t));

    // The operator's original bug.
    o = await run('run incubator');
    chk('`run incubator` explains that it is a category', /categor/i.test(o) && /ls incubator/i.test(o), o.slice(0, 130));

    chk('no uncaught page errors on the deployed build', errs.length === 0, errs[0]);

    // The FAQ and launcher must be reachable too.
    for (const p of ['/hex/apps.html', '/hex/faq.html', '/home.html']) {
        const r2 = await pg.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
        chk(`${p} serves ${r2.status()}`, r2.status() === 200, r2.status());
    }

    await b.close();
    console.log(`\n  ${pass}/${pass + fail} passed`);
    process.exitCode = fail ? 1 : 0;
})();
