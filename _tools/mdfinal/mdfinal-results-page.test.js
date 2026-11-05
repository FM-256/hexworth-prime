#!/usr/bin/env node
/**
 * mdfinal-results-page.test.js — the MD-100 final staff results page, rendered in headless Chrome.
 *
 * @catalog what    MD-100 final results page: roster statuses (expired not swept, minutes left),
 * @catalog what    the class-id box, restart disabled after handover/submit, sweep and CSV, text
 * @catalog what    rendering of planted HTML, admin-only controls hidden for a handler.
 * @catalog run     node _tools/mdfinal/mdfinal-results-page.test.js
 * @catalog note    The bridge answers with canned staff replies built from real sittings; the server
 * @catalog note    gate itself is mdfinal-results.test.js's job. Nothing reaches production.
 * @catalog status  TOOL
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const kit = require('./mdfinal-test-kit.js');
const SK = require('./mdfinal-svc-kit.js');
const MD = kit.req('mdfinal-exam.js');
const t = kit.harness('mdfinal-results-page');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const PAGE_URL = '/houses/forge/md-100/exams/md100-final-results.html';
let ROLE = 'admin';
const sent = [];

/* The two component scripts, stubbed by intercepting their requests. */
const STUBS = {
    'AccessGuard.js': 'window.AccessGuard = { require: function () {} };',
    'FirebaseAuth.js': 'window.FirebaseAuth = { waitForAuth: function () { return Promise.resolve({ uid: "staff" }); }, callFunction: function (n, d) {'
        + ' return fetch("/__call/" + n, { method: "POST", body: JSON.stringify(d || {}) }).then(function (r) { return r.json(); }).then(function (j) {'
        + ' if (j && j.__error) { var e = new Error(j.__error.message); e.code = j.__error.code; throw e; } return { data: j }; }); } };'
};

(async () => {
    /* three real sittings: in progress, expired (unswept), submitted */
    const a = await SK.started('rp-live'), b = await SK.started('rp-exp'), c = await SK.started('rp-sub');
    b.c.add(151 * 60000);
    await MD.submitExam(c.st, { sessionId: c.sid }, c.o);
    const view = async (f, uid, name) => ({ uid, name, email: uid + '@x.test', attempts: 0, flags: uid === 'rp-sub' ? ['progress differs from the session'] : [],
        sitting: MD.instructorView(MD.fromDocument(await f.st.get(f.sid)), { now: f.c.now }) });
    const students = [await view(a, 'rp-live', '<img src=x onerror="window.__pwned=1">'), await view(b, 'rp-exp', 'Expired Student'), await view(c, 'rp-sub', 'Submitted Student')];
    const classReply = { examId: 'md100-final-2026', class: { id: 'c-1', name: '<b>CTS1156C</b>' }, memberCount: 3, students, csv: 'studentId,total\nrp-sub,' + students[2].sitting.report.display };

    /* canned staff replies: what the page renders is under test, not who may ask */
    function reply(name, d) {
        sent.push({ name, d });
        if (name === 'mdfinalResults') {
            if (d.classId) { return classReply; }
            return ROLE === 'admin' ? { examId: d.examId, students: [], classes: [{ id: 'c-1', name: 'CTS1156C', memberCount: 3 }], csv: '' } : { examId: d.examId, classes: [{ id: 'c-1', name: 'CTS1156C', memberCount: 3 }] };
        }
        if (name === 'mdfinalControl') { return { examId: d.examId, armed: d.armed === true, allowUids: (d.allowUids && d.allowUids.add) || [] }; }
        return { ok: true };
    }
    const srv = http.createServer((q, r) => {
        if (q.method === 'POST' && q.url.indexOf('/__call/') === 0) {
            let body = ''; q.on('data', (x) => { body += x; });
            q.on('end', () => { r.writeHead(200, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(reply(q.url.slice(8), body ? JSON.parse(body) : {}))); });
            return;
        }
        const url = decodeURIComponent(q.url.split('?')[0]), base = path.basename(url);
        if (STUBS[base]) { r.writeHead(200, { 'Content-Type': 'application/javascript' }); r.end(STUBS[base]); return; }
        const f = path.join(APP, url);
        if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': 'text/html' }); fs.createReadStream(f).pipe(r);
    });
    await new Promise((res) => srv.listen(0, '127.0.0.1', res));
    const base = 'http://127.0.0.1:' + srv.address().port;
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e.message)));
    page.on('dialog', (d) => d.accept());
    try {
        await page.goto(base + PAGE_URL, { waitUntil: 'networkidle0' });
        t.check(await page.$eval('#controlCard', (e) => !e.hidden) && await page.$eval('#btnSweep', (e) => !e.hidden), 'admin: window control and sweep are shown');
        /* the class-id box opens a class the picker does not list */
        await page.type('#classId', 'c-1');
        await page.click('#btnClassId');
        await page.waitForFunction(() => document.querySelectorAll('#roster tr').length === 4, { timeout: 5000 });
        t.check(sent.some((s) => s.name === 'mdfinalResults' && s.d.classId === 'c-1'), 'the class-id box asks for that class');
        const rows = await page.$$eval('#roster tr', (tr) => tr.slice(1).map((r) => [...r.children].map((c) => c.textContent)));
        t.check(/in progress, \d+ min left/.test(rows[0][2]), 'a live sitting shows minutes left (' + rows[0][2] + ')');
        t.check(rows[1][2] === 'expired, not swept', 'an expired unswept sitting is marked for the sweep (' + rows[1][2] + ')');
        t.check(/^submitted/.test(rows[2][2]) && rows[2][8] === 'progress differs from the session', 'a submitted sitting shows its flag');
        t.check(rows[0][0] === '<img src=x onerror="window.__pwned=1">' && await page.evaluate(() => window.__pwned === undefined && !document.querySelector('#roster img')), 'a planted name is shown as text and is inert');
        t.check(/<b>CTS1156C<\/b>/.test(await page.$eval('#rosterTitle', (e) => e.textContent)) && !(await page.$('#rosterTitle b')), 'a planted class name is inert text');
        /* restart is disabled, with a reason, after submit */
        await page.evaluate(() => document.querySelectorAll('#roster tr')[3].click());
        await page.waitForFunction(() => !document.getElementById('detailCard').hidden, { timeout: 3000 });
        const rs = await page.evaluate(() => { const b = [...document.querySelectorAll('#detail button')].find((x) => x.textContent === 'Restart sitting'); return b && { d: b.disabled, t: b.title }; });
        t.check(rs && rs.d === true && /seed policy/.test(rs.t), 'restart is disabled after submit, with the reason');
        const before = sent.length;
        await page.evaluate(() => [...document.querySelectorAll('#detail button')].find((x) => x.textContent === 'Restart sitting').click());
        t.check(!sent.slice(before).some((s) => s.name === 'mdfinalReset'), 'and clicking it sends nothing');
        /* on a live sitting it sends the reason and evidence */
        await page.evaluate(() => document.querySelectorAll('#roster tr')[1].click());
        await page.evaluate(() => { const d = document.getElementById('detail'); d.querySelector('input').value = 'INC-42'; [...d.querySelectorAll('button')].find((x) => x.textContent === 'Restart sitting').click(); });
        await new Promise((r) => setTimeout(r, 300));
        const rr = sent.find((s) => s.name === 'mdfinalReset');
        t.check(rr && rr.d.uid === 'rp-live' && rr.d.reason === 'vm_unreachable' && rr.d.evidence === 'INC-42', 'restart on a live sitting sends uid, fault code and evidence');
        /* sweep sends sweep:true for the open class */
        await page.click('#btnSweep');
        await new Promise((r) => setTimeout(r, 300));
        t.check(sent.some((s) => s.name === 'mdfinalResults' && s.d.sweep === true && s.d.classId === 'c-1'), 'sweep asks for the open class with sweep:true');
        t.check(await page.$eval('#btnCsv', (e) => !e.hidden), 'the CSV download is offered');
        /* a handler sees no admin controls */
        ROLE = 'handler';
        await page.reload({ waitUntil: 'networkidle0' });
        t.check(await page.$eval('#controlCard', (e) => e.hidden) && await page.$eval('#btnSweep', (e) => e.hidden) && await page.$eval('#btnAll', (e) => e.hidden), 'handler: no window control, sweep or all-sittings');
        t.check(errors.length === 0, 'no page errors: ' + errors.join(' | '));
    } catch (e) { t.check(false, 'threw: ' + e.message); }
    finally { await browser.close(); srv.close(); t.done(); }
})();
