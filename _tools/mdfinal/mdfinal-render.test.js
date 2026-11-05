#!/usr/bin/env node
/**
 * mdfinal-render.test.js — the MD-100 final exam page, PAINTED, in a real browser.
 *
 * @catalog what    Serves the real exam page to headless Chrome against the real session service
 * @catalog what    over a local bridge: brief, windows, a GUI action through its form, a console
 * @catalog what    command, every window after a full build, XSS inertness, reload-resume,
 * @catalog what    two-step handover, submit and the aggregates-only report.
 * @catalog run     node _tools/mdfinal/mdfinal-render.test.js
 * @catalog note    No Firestore, no Cloud Functions, no emulator, no functions/.env: nothing here can
 * @catalog note    reach production. The store is the service's memoryStore().
 * @catalog status  TOOL
 *
 * Same method as _tools/netfinal/netfinal-render.test.js: exactly three component scripts are
 * stubbed BY INTERCEPTING THEIR REQUESTS (no global is assigned on the page), and the bridge maps
 * each callable to the service the way the MDFINAL block in functions/index.js does.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const SK = require('./mdfinal-svc-kit.js');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const MD = kit.req('mdfinal-exam.js');
const MDX = kit.req('mdfinal-exams.js');
const GR = kit.req('mdfinal-grade.js');
const PAGE_URL = '/houses/forge/md-100/exams/md100-final.exam.html';
const UID = SK.naturalUid(0, 2, 'render-');
const EX = 'md100-final-2026';
const t = kit.harness('mdfinal-render');

/* The three component scripts the page loads, served as stubs: AccessGuard and telemetry as no-ops,
 * FirebaseAuth with the two methods the page uses, pointed at the local bridge. */
const STUBS = {
    'AccessGuard.js': 'window.AccessGuard = { require: function () {} };',
    /* the real component's shape: init only (it beacons page views itself; the page calls nothing on it) */
    'ObservatoryTelemetry.js': 'window.ObservatoryTelemetry = { init: function () {} };',
    'FirebaseAuth.js': [
        'window.FirebaseAuth = {',
        '  waitForAuth: function () { return Promise.resolve({ uid: ' + JSON.stringify(UID) + ' }); },',
        '  callFunction: function (name, data) {',
        '    return fetch("/__call/" + encodeURIComponent(name), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data || {}) })',
        '      .then(function (r) { return r.json(); }).then(function (j) {',
        '        if (j && j.__error) { var e = new Error(j.__error.message); e.code = j.__error.code; throw e; }',
        '        return { data: j };',
        '      });',
        '  }',
        '};'
    ].join('\n')
};

const store = MD.memoryStore();
const clock = SK.clock(MDX.WINDOWS[EX].opensAt - 86400000);
const OPTS = { secret: kit.TEST_SECRET, now: clock.now };
const requested = [];
const calls = [];

/* The callable mapping of the MDFINAL block, field for field (examId allowlisted, session derived). */
async function dispatch(name, data) {
    calls.push(name);
    const examId = MDX.resolveExamId(data.examId);
    if (!examId) { throw Object.assign(new Error('Unknown examId.'), { code: 'invalid-argument' }); }
    const sid = MD.sessionIdFor(UID, examId);
    clock.add(1000);
    switch (name) {
        case 'mdfinalStart': return MD.startExam(store, { studentId: UID, examId, isAdmin: false }, OPTS);
        case 'mdfinalCommand': return MD.runCommand(store, { sessionId: sid, console: data.console, line: data.line }, OPTS);
        case 'mdfinalWindow': return MD.renderWindow(store, { sessionId: sid, window: data.window, params: data.params }, OPTS);
        case 'mdfinalAction': return MD.runAction(store, { sessionId: sid, window: data.window, action: data.action, params: data.params }, OPTS);
        case 'mdfinalAnswer': return MD.saveAnswer(store, { sessionId: sid, fieldId: data.fieldId, value: data.value }, OPTS);
        case 'mdfinalHandover': return MD.handover(store, { sessionId: sid, confirm: data.confirm === true }, OPTS);
        case 'mdfinalSubmit': {
            const res = await MD.submitExam(store, { sessionId: sid }, OPTS);
            return { submitted: !res.alreadySubmitted, alreadySubmitted: !!res.alreadySubmitted, submittedAt: res.submittedAt, report: GR.studentReport(res.report) };
        }
        case 'mdfinalReset': return MD.resetSession(store, { sessionId: sid, callerUid: UID, targetUid: UID, token: {}, adminEmails: [] }, OPTS);
        default: throw Object.assign(new Error('No such callable: ' + name), { code: 'not-found' });
    }
}

/* Content types for the static files the page pulls from _app. */
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
/* The local server: POST /__call/<name> runs a callable through dispatch(); everything else is a
 * static file from _app, except the stubbed component scripts. */
const srv = http.createServer(async (q, r) => {
    if (q.method === 'POST' && q.url.indexOf('/__call/') === 0) {
        const name = decodeURIComponent(q.url.slice('/__call/'.length));
        let body = '';
        q.on('data', (c) => { body += c; });
        q.on('end', async () => {
            let data = {};
            try { data = body ? JSON.parse(body) : {}; } catch (e) { data = {}; }
            try { const out = await dispatch(name, data); r.writeHead(200, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(out === undefined ? null : out)); }
            catch (e) { r.writeHead(200, { 'Content-Type': 'application/json' }); r.end(JSON.stringify({ __error: { code: e.code || 'internal', message: e.message } })); }
        });
        return;
    }
    const url = decodeURIComponent(q.url.split('?')[0]);
    requested.push(url);
    const base = path.basename(url);
    if (STUBS[base]) { r.writeHead(200, { 'Content-Type': 'application/javascript' }); r.end(STUBS[base]); return; }
    const f = path.join(APP, url);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(r);
});

/* A short pause for the page to repaint between clicks. */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
    await store.putControl(EX, { armed: false, allowUids: [UID] });
    await new Promise((res) => srv.listen(0, '127.0.0.1', res));
    const base = 'http://127.0.0.1:' + srv.address().port;
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e.message)));
    await page.setViewport({ width: 1400, height: 1000 });
    try {
        /* ── load and paint ── */
        await page.goto(base + PAGE_URL, { waitUntil: 'networkidle0' });
        await page.waitForFunction(() => !document.getElementById('layout').hidden, { timeout: 10000 });
        ['AccessGuard.js', 'FirebaseAuth.js', 'ObservatoryTelemetry.js'].forEach((s) => t.check(requested.some((u) => u.endsWith('/' + s)), 'the page requested ' + s));
        t.check(calls[0] === 'mdfinalStart', 'the first call is mdfinalStart, after sign-in');
        const brief = await page.$$eval('#sideBrief li', (l) => l.length);
        t.check(brief >= 40, 'the brief paints its rules and tasks (' + brief + ' items)');
        const box = await page.$eval('#layout', (e) => { const r = e.getBoundingClientRect(); return r.width * r.height; });
        t.check(box > 100000, 'the layout has a real box');
        const clockText = await page.$eval('#clock', (e) => e.textContent);
        t.check(/^1(4[0-9]|50):[0-5][0-9]$/.test(clockText), 'the server clock is shown (' + clockText + ')');

        /* ── a window, a GUI action through its form, the console ── */
        const windows = await page.$$eval('#launcher button', (b) => b.map((x) => x.textContent));
        t.check(windows.indexOf('Hyper-V Manager') >= 0, 'the launcher offers Hyper-V Manager: ' + windows.join(', '));
        await page.evaluate(() => [...document.querySelectorAll('#launcher button')].find((b) => b.textContent === 'Hyper-V Manager').click());
        await page.waitForFunction(() => /Iso library/.test(document.getElementById('view').textContent), { timeout: 5000 });
        t.check(true, 'Hyper-V Manager renders its view');
        /* create a VM named with an HTML payload: it must arrive and stay inert text */
        const evil = '<img src=x onerror="window.__pwned=1">';
        await page.evaluate((evilName) => {
            const d = document.querySelector('details.action[data-action="hyperv/new-vm"]');
            d.open = true;
            const set = (k, v) => { const i = d.querySelector('[data-param="' + k + '"]'); i.value = String(v); };
            set('name', evilName); set('generation', 2); set('memoryMB', 4096); set('dynamicMemory', 'false'); set('vhdxGB', 127);
            set('switch', 'Meridian-LAN'); set('iso', 'Win11_24H2_Business_x64.iso');
            d.querySelector('button[type="submit"]').click();
        }, evil);
        await page.waitForFunction(() => /created/.test(document.getElementById('output').textContent), { timeout: 5000 });
        await sleep(300);
        const viewText = await page.$eval('#view', (e) => e.textContent);
        t.check(viewText.indexOf(evil) >= 0, 'the typed VM name is shown verbatim as text');
        t.check(await page.evaluate(() => window.__pwned === undefined && !document.querySelector('#view img')), 'and is inert (no element, no script ran)');
        await page.select('#consoleSel', 'hyperv-ps');
        await page.type('#termInput', 'Get-VM');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => /Generation/.test(document.getElementById('term').textContent), { timeout: 5000 });
        t.check(true, 'a console command runs and prints');
        t.check(await page.evaluate(() => { const i = document.querySelector('details.action[data-action="hyperv/new-vm"] [data-param="iso"]'); const dl = i && i.getAttribute('list') && document.getElementById(i.getAttribute('list')); return !!dl && dl.options.length === 3; }),
            'the ISO field offers the three ISOs the window lists');
        t.check(/Host PowerShell/.test(await page.$eval('#termMode', (e) => e.textContent)), 'the console shows which console and prompt it is on');
        /* Restart build: nothing of the old attempt stays on screen (Nancy R5 #1) */
        await page.click('#btnReset');
        await page.waitForFunction(() => !document.getElementById('modal').hidden, { timeout: 3000 });
        await page.click('#modalYes');
        await page.waitForFunction(() => /Build restarted/.test(document.getElementById('term').textContent) && !/Generation/.test(document.getElementById('term').textContent), { timeout: 5000 });
        t.check(await page.evaluate(() => document.getElementById('windowPanel').hidden && document.getElementById('view').textContent === '' && document.getElementById('output').hidden),
            'Restart build clears the window, the output and the console');

        /* ── every window renders after a full build (built server-side by the walk) ── */
        await MD.resetSession(store, { sessionId: MD.sessionIdFor(UID, EX), callerUid: UID, targetUid: UID, token: {}, adminEmails: [] }, OPTS);
        const rec = SK.record(() => W.perfect(UID, null, { skipRepair: true, skipP8: true }));
        const cut = rec.calls.findIndex((c) => c[0] === 'handover');
        const f = { st: store, sid: MD.sessionIdFor(UID, EX), o: OPTS, c: clock };
        const refused = await SK.replayInto(f.st, f.sid, rec.calls.slice(0, cut), f.o, f.c);
        t.check(refused === 0, '(fixture) the build replayed through the service');
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForFunction(() => !document.getElementById('layout').hidden, { timeout: 10000 });
        t.check(/session resumed/.test(await page.$eval('#term', (e) => e.textContent)), 'a reload resumes the same sitting');
        const names = await page.$$eval('#launcher button', (b) => b.map((x) => x.textContent));
        t.check(names.length >= 24, 'the desktop offers its windows (' + names.length + ')');
        const bad = [];
        for (const n of names) {
            await page.evaluate((nm) => [...document.querySelectorAll('#launcher button')].find((b) => b.textContent === nm).click(), n);
            await page.waitForFunction(() => document.getElementById('view').childElementCount > 0, { timeout: 5000 }).catch(() => {});
            await sleep(120);
            const v = await page.$eval('#view', (e) => ({ text: e.textContent, err: !!e.querySelector('.bad') }));
            if (v.err || !v.text.trim()) { bad.push(n); }
        }
        t.check(bad.length === 0, 'every window renders without an error: ' + bad.join(', '));
        /* an emptied required text field is sent as '' (Nancy R5: an emptied hosts file was refused) */
        await page.evaluate(() => [...document.querySelectorAll('#launcher button')].find((b) => b.textContent === 'Notepad').click());
        await page.waitForFunction(() => document.querySelector('details.action[data-action="notepad/hosts-save"]'), { timeout: 5000 });
        await page.evaluate(() => {
            const d = document.querySelector('details.action[data-action="notepad/hosts-save"]'); d.open = true;
            d.querySelector('[data-param="text"]').value = '';
            d.querySelector('button[type="submit"]').click();
        });
        await page.waitForFunction(() => !document.getElementById('output').hidden || document.querySelector('details.action[data-action="notepad/hosts-save"] button[type="submit"]').disabled === false, { timeout: 5000 });
        await sleep(300);
        const hostsOut = await page.$eval('#output', (e) => e.textContent);
        t.check(!/not available/.test(hostsOut), 'saving an emptied hosts file is accepted (' + hostsOut.slice(0, 60) + ')');
        if (process.env.MDFINAL_SHOTS) {
            await page.evaluate(() => [...document.querySelectorAll('#launcher button')].find((b) => b.textContent === 'Settings').click());
            await sleep(400);
            await page.screenshot({ path: path.join(process.env.MDFINAL_SHOTS, 'settings.png'), fullPage: true });
            await page.evaluate(() => [...document.querySelectorAll('#launcher button')].find((b) => b.textContent === 'Local Users and Groups').click());
            await sleep(400);
            await page.screenshot({ path: path.join(process.env.MDFINAL_SHOTS, 'lusrmgr.png'), fullPage: false });
        }

        /* ── the record, handover (two steps), ticket, submit ── */
        await page.click('[data-side="record"]');
        await page.waitForFunction(() => document.querySelectorAll('#sideRecord label.field').length >= 2, { timeout: 5000 });
        t.check(true, 'the as-built record shows its fields');
        await page.click('#btnHandover');
        await page.waitForFunction(() => !document.getElementById('modal').hidden, { timeout: 3000 });
        t.check(/Phases 1-6 are recorded as they stand now/.test(await page.$eval('#modalText', (e) => e.textContent)), 'handover asks with the 2.4 text');
        await page.click('#modalYes');
        await page.waitForFunction(() => /cannot be undone/.test(document.getElementById('modalText').textContent), { timeout: 3000 });
        await page.click('#modalYes');
        await page.waitForFunction(() => document.getElementById('btnHandover').hidden, { timeout: 5000 });
        t.check(/Ticket INC/.test(await page.$eval('#sideTicket', (e) => e.textContent)), 'after the second confirmation the ticket is shown');
        t.check(await page.$eval('#btnReset', (e) => e.hidden), 'restart is no longer offered after handover');
        await page.click('#btnSubmit');
        await page.waitForFunction(() => !document.getElementById('modal').hidden, { timeout: 3000 });
        await page.click('#modalYes');
        await page.waitForFunction(() => !document.getElementById('reportPanel').hidden, { timeout: 5000 });
        const rep = await page.$eval('#reportPanel', (e) => e.textContent);
        t.check(/Total: [0-9.]+ \/ 100/.test(rep) && /Phase 1/.test(rep), 'submit shows the total and the phase totals');
        t.check(!/1\.1|1\.2|parts|Correct/.test(rep), 'and no per-check marks');
        t.check(pageErrors.length === 0, 'no page errors: ' + pageErrors.slice(0, 3).join(' | '));
    } catch (e) {
        const out = await page.$eval('#output', (x) => x.textContent).catch(() => '?');
        t.check(false, 'render run threw: ' + (e && e.message) + ' | page errors: ' + pageErrors.join(' | ') + ' | output: ' + out.slice(0, 200));
    } finally {
        await browser.close();
        srv.close();
        t.done();
    }
})();
