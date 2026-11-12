#!/usr/bin/env node
/**
 * site-notice.test.js — the site-wide banner (components/SiteNotice.js) in a real Chrome.
 *
 * @catalog what    Drives SiteNotice.js in headless Chrome with _app/ served from disk and the
 * @catalog what    Firestore REST reply mocked: show/hide/expiry/errors/XSS/dismissal/cache/iframes,
 * @catalog what    one copy on real pages that load AccessGuard and FirebaseAuth, and the API-key drift.
 * @catalog run     node _tools/site-notice/site-notice.test.js
 * @catalog status  TOOL
 *
 * Nothing leaves the machine: every request is intercepted. Pages come from _app/, the
 * Firestore document read is answered by the test, everything else external is aborted.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '../../node_modules/puppeteer'));

const APP = path.join(__dirname, '../../_app');
const ORIGIN = 'http://hx.test';
const FS_DOC = 'firestore.googleapis.com/v1/projects/hexworth-prime/databases/(default)/documents/site_notice/current';
const NOW = Date.now();

let pass = 0, fail = 0;
/* records one assertion */
function check(name, cond, extra) { if (cond) { pass++; console.log('ok   ' + name); } else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); } }

/* A Firestore REST document for the notice fields. */
function restDoc(n) {
    const f = { active: { booleanValue: n.active }, level: { stringValue: n.level }, message: { stringValue: n.message },
        endsAt: n.endsAt === null ? { nullValue: null } : { integerValue: String(n.endsAt) }, updatedAt: { integerValue: String(n.updatedAt) } };
    return JSON.stringify({ name: 'projects/hexworth-prime/databases/(default)/documents/site_notice/current', fields: f });
}
const ON = { active: true, level: 'warning', message: 'Maintenance tonight 9:00 to 9:30 pm Eastern.', endsAt: null, updatedAt: 1001 };

const FIXTURE = '<!doctype html><html><head><meta charset="utf-8"><title>t</title></head><body><main style="height:3000px">page</main>' +
    '<script src="/components/SiteNotice.js"></script></body></html>';
/* loads BOTH shared scripts, with no access requirement, so nothing redirects: the two loaders must yield one copy */
const BOTH = '<!doctype html><html><head><meta charset="utf-8"><script src="/components/AccessGuard.js"></script></head><body><main>page</main>' +
    '<script src="/components/FirebaseAuth.js"></script></body></html>';
const FRAMED = '<!doctype html><html><head><meta charset="utf-8"></head><body><iframe id="f" src="/__fixture.html"></iframe>' +
    '<script src="/components/SiteNotice.js"></script></body></html>';
/* a sticky header (26 of 64 sampled pages have one) under a body filter (CLAUDE.md rule 5) */
const STICKY = '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;filter:saturate(1.1)"><header id="h" style="position:sticky;top:0;height:60px;background:#333">hdr</header><main style="height:3000px">page</main>' +
    '<script src="/components/SiteNotice.js"></script></body></html>';
/* a full-width nav pinned with position absolute at top 0 (the landing page's), plus a small absolute dot and a full-screen fixed overlay that must NOT move */
const PINNED = '<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0"><nav id="n" style="position:absolute;top:0;left:0;right:0;height:68px">nav</nav>' +
    '<div id="dot" style="position:absolute;top:0;left:10px;width:4px;height:4px"></div><div id="ov" style="position:fixed;top:0;left:0;right:0;bottom:0;pointer-events:none"></div><main style="height:2000px;padding-top:80px">page</main>' +
    '<script src="/components/SiteNotice.js"></script></body></html>';

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let reply = { status: 200, body: restDoc(ON) }, fsHits = 0, scriptHits = 0, pageErrors = [], stubGuard = false;
    /* An AccessGuard that lets everyone in but keeps the real file's site-notice loader, so a
     * protected page renders for a signed-out test visitor exactly as it would for a student. */
    const AG = fs.readFileSync(path.join(APP, 'components/AccessGuard.js'), 'utf8');
    const GUARD_STUB = 'window.AccessGuard = new Proxy({}, { get: function () { return function () { return true; }; } });\n' +
        AG.slice(AG.indexOf('// ── Site Notice Auto-Loader'), AG.indexOf('// ── Tenant Auto-Loaders'));
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        const u = req.url();
        if (u.indexOf(FS_DOC) >= 0) {
            fsHits++;
            if (reply.abort) { return req.abort('failed'); }
            return req.respond({ status: reply.status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: reply.body });
        }
        if (u.startsWith(ORIGIN)) {
            const p = decodeURIComponent(new URL(u).pathname);
            if (stubGuard && p === '/components/AccessGuard.js') { return req.respond({ status: 200, contentType: 'application/javascript', body: GUARD_STUB }); }
            if (p === '/__fixture.html') { return req.respond({ status: 200, contentType: 'text/html', body: FIXTURE }); }
            if (p === '/__both.html') { return req.respond({ status: 200, contentType: 'text/html', body: BOTH }); }
            if (p === '/__blank.html') { return req.respond({ status: 200, contentType: 'text/html', body: '<!doctype html><title>blank</title>' }); }
            if (p === '/__framed.html') { return req.respond({ status: 200, contentType: 'text/html', body: FRAMED }); }
            if (p === '/__sticky.html') { return req.respond({ status: 200, contentType: 'text/html', body: STICKY }); }
            if (p === '/__pinned.html') { return req.respond({ status: 200, contentType: 'text/html', body: PINNED }); }
            if (p === '/components/SiteNotice.js') { scriptHits++; }
            const file = path.join(APP, p);
            if (file.startsWith(APP) && fs.existsSync(file) && fs.statSync(file).isFile()) {
                const ext = path.extname(file);
                const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' }[ext] || 'application/octet-stream';
                return req.respond({ status: 200, contentType: type, body: fs.readFileSync(file) });
            }
            return req.respond({ status: 404, body: '' });
        }
        return req.abort('blockedbyclient');
    });
    /* loads a page fresh: storage cleared unless keep, counters reset */
    async function load(p, opts) {
        opts = opts || {};
        fsHits = 0; scriptHits = 0; pageErrors = [];
        /* storage is cleared on a page that does not load the banner, so no read is in flight */
        if (!opts.keepStorage) { await page.goto(ORIGIN + '/__blank.html'); await page.evaluate(() => localStorage.clear()); fsHits = 0; scriptHits = 0; }
        await page.goto(ORIGIN + p, { waitUntil: 'load' });
        await new Promise((r) => setTimeout(r, opts.wait || 700));
    }
    const bars = () => page.$$eval('#hx-site-notice', (els) => els.map((e) => ({ text: e.textContent, cls: e.className, role: e.getAttribute('role'), first: e === document.body.firstElementChild, vis: getComputedStyle(e).visibility })));

    /* 1. active notice shows, once, as the first element, text only */
    reply = { status: 200, body: restDoc(ON) }; await load('/__fixture.html');
    let b = await bars();
    check('active warning notice shows exactly once', b.length === 1, JSON.stringify(b));
    check('it is the first element of body', b[0] && b[0].first);
    check('warning style and role=alert', b[0] && b[0].cls === 'warning' && b[0].role === 'alert');
    check('shows the message', b[0] && b[0].text.indexOf(ON.message) >= 0, b[0] && b[0].text);
    check('one Firestore read', fsHits === 1, fsHits);
    check('no page errors', pageErrors.length === 0, pageErrors.join(' | '));

    /* 2. info style */
    reply = { status: 200, body: restDoc(Object.assign({}, ON, { level: 'info' })) }; await load('/__fixture.html');
    b = await bars(); check('info notice: info style, role=status', b.length === 1 && b[0].cls === 'info' && b[0].role === 'status');

    /* 3-6. the cases that must show nothing */
    for (const [name, r] of [['inactive', { status: 200, body: restDoc(Object.assign({}, ON, { active: false })) }],
        ['expired', { status: 200, body: restDoc(Object.assign({}, ON, { endsAt: NOW - 60000 })) }],
        ['blank message', { status: 200, body: restDoc(Object.assign({}, ON, { message: '   ' })) }],
        ['no document (404)', { status: 404, body: '{"error":{"code":404}}' }],
        ['server error (500)', { status: 500, body: 'x' }],
        ['malformed JSON', { status: 200, body: '{not json' }],
        ['network failure', { abort: true }]]) {
        reply = r; await load('/__fixture.html');
        b = await bars(); check(name + ': no banner, no page error', b.length === 0 && pageErrors.length === 0, JSON.stringify(b) + ' ' + pageErrors.join('|'));
    }
    /* a failed read is not cached: the next page reads again */
    reply = { status: 500, body: 'x' }; await load('/__fixture.html'); await load('/__fixture.html', { keepStorage: true });
    check('a failed read is not cached (next page reads again)', fsHits === 1, fsHits);

    /* 7. a future end time shows, with "until" */
    reply = { status: 200, body: restDoc(Object.assign({}, ON, { endsAt: NOW + 3600000 })) }; await load('/__fixture.html');
    b = await bars(); check('future end time: shows with "(until ...)"', b.length === 1 && /\(until /.test(b[0].text), b[0] && b[0].text);

    /* 8. HTML in the message is text */
    reply = { status: 200, body: restDoc(Object.assign({}, ON, { message: '<img src=x onerror="window.__pwned=1"><b>bold</b>' })) }; await load('/__fixture.html');
    const xss = await page.evaluate(() => ({ imgs: document.querySelectorAll('#hx-site-notice img, #hx-site-notice b').length, pwned: !!window.__pwned, text: document.getElementById('hx-site-notice').textContent }));
    check('HTML in the message is shown as text, never run', xss.imgs === 0 && !xss.pwned && xss.text.indexOf('<img') >= 0, JSON.stringify(xss));

    /* 9. dismissal, and a new version showing again */
    reply = { status: 200, body: restDoc(ON) }; await load('/__fixture.html');
    await page.click('#hx-site-notice button');
    check('Dismiss removes the bar', (await bars()).length === 0);
    await load('/__fixture.html', { keepStorage: true });
    check('stays dismissed on the next page', (await bars()).length === 0);
    reply = { status: 200, body: restDoc(Object.assign({}, ON, { updatedAt: 1002, message: 'Edited notice.' })) };
    await page.evaluate((k) => localStorage.removeItem(k), 'hexworth_site_notice_v1');
    await load('/__fixture.html', { keepStorage: true });
    b = await bars(); check('an edited notice (new updatedAt) shows again', b.length === 1 && b[0].text.indexOf('Edited notice.') >= 0);

    /* 10. cache: the next page within 5 minutes does not read again */
    reply = { status: 200, body: restDoc(ON) }; await load('/__fixture.html'); await load('/__fixture.html', { keepStorage: true });
    check('cached for the next page: no second read', fsHits === 0, fsHits);
    check('cached notice still shows', (await bars()).length === 1);
    /* an old cache entry is refetched */
    await page.evaluate((k) => { const c = JSON.parse(localStorage.getItem(k)); c.at -= 6 * 60 * 1000; localStorage.setItem(k, JSON.stringify(c)); }, 'hexworth_site_notice_v1');
    await load('/__fixture.html', { keepStorage: true });
    check('a cache older than 5 minutes is read again', fsHits === 1, fsHits);

    /* 12. iframes: only the top window shows it */
    reply = { status: 200, body: restDoc(ON) }; await load('/__framed.html', { wait: 1200 });
    const inFrame = await page.evaluate(() => document.getElementById('f').contentDocument.querySelectorAll('#hx-site-notice').length);
    check('top window shows it, the iframe does not', (await bars()).length === 1 && inFrame === 0, 'frame=' + inFrame);

    /* 13. in normal flow: seen on arrival, scrolls away, never covers a sticky header */
    reply = { status: 200, body: restDoc(ON) }; await load('/__sticky.html');
    const atLoad = await page.evaluate(() => ({ bar: Math.round(document.getElementById('hx-site-notice').getBoundingClientRect().top), hdr: Math.round(document.getElementById('h').getBoundingClientRect().top), h: Math.round(document.getElementById('hx-site-notice').getBoundingClientRect().height) }));
    check('on arrival: banner at the top, the sticky header just below it', atLoad.bar === 0 && atLoad.hdr === atLoad.h, JSON.stringify(atLoad));
    await page.evaluate(() => window.scrollTo(0, 1500)); await new Promise((r) => setTimeout(r, 100));
    const scrolled = await page.evaluate(() => { const h = document.getElementById('h').getBoundingClientRect(); const at = document.elementFromPoint(20, Math.round(h.top + 10)); return { hdr: Math.round(h.top), barBottom: Math.round(document.getElementById('hx-site-notice').getBoundingClientRect().bottom), topIsHeader: at && at.id === 'h' }; });
    check('scrolled (under a body filter): the banner is gone and the sticky header is uncovered at the top', scrolled.hdr === 0 && scrolled.barBottom <= 0 && scrolled.topIsHeader, JSON.stringify(scrolled));

    /* 13b. a full-width bar pinned at top 0 moves below the banner, and back on dismiss; others stay */
    await load('/__pinned.html');
    const pin = await page.evaluate(() => ({ bar: Math.round(document.getElementById('hx-site-notice').getBoundingClientRect().height), nav: Math.round(document.getElementById('n').getBoundingClientRect().top), dot: Math.round(document.getElementById('dot').getBoundingClientRect().top), ov: Math.round(document.getElementById('ov').getBoundingClientRect().top) }));
    check('a pinned full-width nav moves to just below the banner', pin.nav === pin.bar && pin.bar > 0, JSON.stringify(pin));
    check('a small pinned element and a full-screen overlay do not move', pin.dot === 0 && pin.ov === 0, JSON.stringify(pin));
    await page.click('#hx-site-notice button');
    const back = await page.evaluate(() => ({ nav: Math.round(document.getElementById('n').getBoundingClientRect().top), inline: document.getElementById('n').style.top, mark: document.getElementById('n').getAttribute('data-hx-sn-shifted') }));
    check('dismiss puts the nav back exactly (its own inline top:0 restored)', back.nav === 0 && back.inline === '0px' && back.mark === null, JSON.stringify(back));

    /* 14. real pages: one script load, one bar */
    for (const p of ['/index.html', '/login.html', '/sorting.html', '/dashboard.html']) {
        if (!fs.existsSync(path.join(APP, p))) { continue; }
        reply = { status: 200, body: restDoc(ON) }; await load(p, { wait: 500 });
        /* a signed-out redirect may still be under way: wait until the URL holds still for 1.5 s and the page has loaded */
        for (let i = 0, last = page.url(), still = 0; i < 40 && still < 3; i++) {
            await new Promise((r) => setTimeout(r, 500));
            const ready = await page.evaluate(() => document.readyState).catch(() => 'loading');
            if (page.url() === last && ready === 'complete') { still++; } else { still = 0; last = page.url(); }
        }
        await new Promise((r) => setTimeout(r, 700));
        const landed = new URL(page.url()).pathname;
        /* counted inside the final document: a signed-out redirect loads a second page, which loads its own copy */
        const loads = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\/components\/SiteNotice\.js$/.test(e.name)).length);
        b = await bars();
        check(p + ' (landed on ' + landed + '): SiteNotice.js loaded once, one bar', loads === 1 && b.length === 1, 'loads=' + loads + ' bars=' + b.length);
    }

    /* 14b. both loaders on one page: one copy */
    reply = { status: 200, body: restDoc(ON) }; await load('/__both.html', { wait: 2500 });
    {
        const loads = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\/components\/SiteNotice\.js$/.test(e.name)).length);
        b = await bars();
        check('AccessGuard + FirebaseAuth on one page: SiteNotice.js loaded once, one bar', loads === 1 && b.length === 1 && new URL(page.url()).pathname === '/__both.html', 'loads=' + loads + ' bars=' + b.length + ' at ' + page.url());
    }

    /* 14c. storage that throws (blocked site data): the banner still shows, no page error */
    {
        const p3 = await browser.newPage();
        const errs = [];
        p3.on('pageerror', (e) => errs.push(String(e)));
        await p3.evaluateOnNewDocument(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); });
        await p3.setRequestInterception(true);
        p3.on('request', (req) => {
            const u = req.url();
            if (u.indexOf(FS_DOC) >= 0) { return req.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: restDoc(ON) }); }
            if (u === ORIGIN + '/__fixture.html') { return req.respond({ status: 200, contentType: 'text/html', body: FIXTURE }); }
            if (u === ORIGIN + '/components/SiteNotice.js') { return req.respond({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(path.join(APP, 'components/SiteNotice.js')) }); }
            return req.abort('blockedbyclient');
        });
        await p3.goto(ORIGIN + '/__fixture.html'); await new Promise((r) => setTimeout(r, 700));
        const n = await p3.$$eval('#hx-site-notice', (e) => e.length);
        await p3.click('#hx-site-notice button').catch(() => {});
        const after = await p3.$$eval('#hx-site-notice', (e) => e.length);
        check('blocked storage: shows, dismisses for this page, no page error', n === 1 && after === 0 && errs.length === 0, 'n=' + n + ' after=' + after + ' ' + errs.join('|'));
        await p3.close();
    }

    /* 14d. server-graded assessment pages: no banner and no read (content must not move mid-question) */
    stubGuard = true;
    for (const p of ['/houses/forge/md-100/exams/md100-final.exam.html', '/houses/eye/applets/cyberops/week1/eye-evaluation.applet.html', '/dark-arts/vault/bug-hunting/quizzes/bh-quiz-xssi.html']) {
        if (!fs.existsSync(path.join(APP, p))) { check(p + ' exists', false); continue; }
        reply = { status: 200, body: restDoc(ON) }; await load(p, { wait: 2500 });
        const here = new URL(page.url()).pathname === p;
        const loads = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\/components\/SiteNotice\.js$/.test(e.name)).length);
        b = await bars();
        /* must stay on the page (else nothing was tested), must have loaded the script, and must show nothing */
        check('assessment page ' + p.split('/').pop() + ': stays, loads the script, no banner, no read', here && loads === 1 && b.length === 0 && fsHits === 0, 'at=' + new URL(page.url()).pathname + ' loads=' + loads + ' bars=' + b.length + ' reads=' + fsHits);
    }
    /* control: the same stubbed guard on an ordinary page still shows the banner */
    reply = { status: 200, body: restDoc(ON) }; await load('/houses/web/index.html', { wait: 2500 });
    b = await bars();
    check('control: an ordinary protected page with the same stub shows the banner', new URL(page.url()).pathname === '/houses/web/index.html' && b.length === 1, 'at=' + page.url() + ' bars=' + b.length);
    stubGuard = false;

    /* 14e. parity: the browser-side check finds every server-graded page the repo search finds */
    {
        const SN = fs.readFileSync(path.join(APP, 'components/SiteNotice.js'), 'utf8');
        const re = new RegExp(SN.match(/var ASSESSMENT_RE = \/(.+)\/;/)[1]);
        const all = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const q = path.join(d, f); const st = fs.statSync(q); if (st.isDirectory()) walk(q); else if (f.endsWith('.html')) all.push(q); } })(APP);
        const inFile = all.filter((f) => re.test(fs.readFileSync(f, 'utf8')));
        const inline = (f) => (fs.readFileSync(f, 'utf8').match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g) || []).some((x) => re.test(x));
        /* a page may differ only when the match is prose (text or an HTML comment), never in a script tag or a script src */
        const inAnyScript = (f) => (fs.readFileSync(f, 'utf8').match(/<script[^>]*>[\s\S]*?<\/script>/g) || []).some((x) => re.test(x));
        const prose = inFile.filter((f) => !inline(f) && !inAnyScript(f));
        const missed = inFile.filter((f) => !inline(f) && inAnyScript(f)).map((f) => path.relative(APP, f));
        const caught = inFile.length - prose.length;
        check('parity: all ' + caught + ' pages with a grading call in a script are caught (' + prose.length + ' only mention it in prose: ' + prose.map((f) => path.basename(f)).join(', ') + ')', caught > 150 && missed.length === 0, 'missed: ' + missed.slice(0, 5).join(', '));
    }

    /* 15. the API key matches FirebaseAuth.js */
    const sn = fs.readFileSync(path.join(APP, 'components/SiteNotice.js'), 'utf8').match(/API_KEY = '([^']+)'/);
    const fa = fs.readFileSync(path.join(APP, 'components/FirebaseAuth.js'), 'utf8').match(/apiKey: "([^"]+)"/);
    check('API key matches FirebaseAuth.js', sn && fa && sn[1] === fa[1]);

    await browser.close();
    console.log('\nsite-notice: ' + pass + ' passed, ' + fail + ' failed');
    process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('ERROR', e); process.exit(2); });
