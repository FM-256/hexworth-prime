#!/usr/bin/env node
/**
 * mdfinal-adversarial.test.js — a student with devtools against the session service.
 *
 * @catalog what    MD-100 final adversarial suite: prototype keys and wrong types on every entry
 * @catalog what    point, ReDoS and pipeline caps within budget, window bypass, racing writes, P8
 * @catalog what    replies identical for right and wrong answers, refused calls write nothing.
 * @catalog run     node _tools/mdfinal/mdfinal-adversarial.test.js
 * @catalog status  TOOL
 *
 * Covered elsewhere and not repeated: forged session ids and the staff gate (mdfinal-results),
 * expiry, double submit, self-reset limits and size caps (mdfinal-session), Reset this PC scoring
 * 7.1 at 0 (mdfinal-p678), disclosure and lockout (mdfinal-leak).
 */
const kit = require('./mdfinal-test-kit.js');
const SK = require('./mdfinal-svc-kit.js');
const W = require('./mdfinal-walk.js');
const EXAM = kit.req('mdfinal-exam.js');
const GUI = kit.req('mdfinal-gui.js');
const t = kit.harness('mdfinal-adversarial');

/* The stored document, serialised. */
const raw = async (f) => JSON.stringify(await f.st.get(f.sid));
/* The code a promise rejects with, or 'ok'. */
const code = async (p) => { try { await p; return 'ok'; } catch (e) { return e.code || 'throw:' + e.message; } };

(async () => {
    /* ═══ prototype keys and wrong types: refused, never a crash, nothing written ══════════════ */
    {
        const f = await SK.started('adv-1');
        const before = await raw(f);
        const weird = ['__proto__', 'constructor', 'prototype', 'hasOwnProperty', 'toString', '', ' ', 'hyperv/x', null, 7, {}, [], true];
        let crashes = 0;
        for (const w of weird) {
            const c1 = await code(EXAM.renderWindow(f.st, { sessionId: f.sid, window: w }, f.o));
            const c2 = await code(EXAM.runAction(f.st, { sessionId: f.sid, window: w, action: w, params: {} }, f.o));
            const c3 = await code(EXAM.runCommand(f.st, { sessionId: f.sid, console: w, line: 'Get-VM' }, f.o));
            const c4 = await code(EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: w, value: 'x' }, f.o));
            [c1, c2, c3, c4].forEach((c) => { if (/^throw:/.test(c) || c === 'internal') { crashes++; console.log('  crash on ' + JSON.stringify(w) + ': ' + c); } });
        }
        t.check(crashes === 0, 'odd window/action/console/field names never crash or reach internal (' + crashes + ')');
        const protoParams = JSON.parse('{"__proto__": {"admin": true}, "name": "x"}');
        const r = await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: protoParams }, f.o);
        t.check(r.result.ok === false && r.result.msg === GUI.GENERIC, 'an own __proto__ key in params is refused generically');
        t.check(({}).admin === undefined && Object.prototype.admin === undefined, 'Object.prototype unchanged');
        for (const bad of [null, 'x', 7, [], { a: { b: { c: { d: { e: 1 } } } } }]) {
            const rr = await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: bad }, f.o).catch((e) => ({ thrown: e.code }));
            t.check(rr.thrown || (rr.result && rr.result.ok === false), 'params ' + JSON.stringify(bad).slice(0, 40) + ' refused');
        }
        for (const line of [null, 7, {}, ['Get-VM']]) {
            t.check((await code(EXAM.runCommand(f.st, { sessionId: f.sid, console: 'hyperv-ps', line }, f.o))) === 'invalid-argument', 'line ' + JSON.stringify(line) + ' refused');
        }
        for (const v of [7, null, {}, ['a'], true]) {
            t.check((await code(EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: 'B1', value: v }, f.o))) === 'invalid-argument', 'answer value ' + JSON.stringify(v) + ' refused');
        }
        t.check((await code(EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'hyperv', params: { key: 'x' } }, f.o))) === 'invalid-argument', 'a window parameter the window does not take is refused');
        t.check((await code(EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'hyperv', params: JSON.parse('{"__proto__":{"x":1}}') }, f.o))) === 'invalid-argument', 'a __proto__ window parameter is refused');
        /* a refused write never lands: only the generic-refusal ACTIONS above bump rev, so compare
         * the lab state, which no refusal may change */
        const now = JSON.parse(await raw(f)), was = JSON.parse(before);
        const labNow = JSON.parse(now.stateJson), labWas = JSON.parse(was.stateJson);
        delete labNow.shell; delete labWas.shell;
        t.check(JSON.stringify(labNow) === JSON.stringify(labWas), 'no refused call changed the lab');
        for (const sid of ['', null, 7, 'adv-1::md100-final-2026x', '__proto__']) {
            const c = await code(EXAM.runCommand(f.st, { sessionId: sid, console: 'hyperv-ps', line: 'Get-VM' }, f.o));
            t.check(c === 'invalid-argument' || c === 'not-found', 'session id ' + JSON.stringify(sid) + ' refused (' + c + ')');
        }
    }

    /* ═══ R4: ReDoS and pipeline caps return within budget ════════════════════════════════════ */
    {
        const uid = SK.naturalUid(0, 0, 'adv-redos-');
        const rec = SK.record(() => { const { state, key } = W.sitting(uid); W.p1Gui(state, key); return null; });
        const f = await SK.started(uid);
        await SK.replayInto(f.st, f.sid, rec.calls, f.o, f.c);
        const evil = [
            'Get-Service | Where-Object Name -like "' + '*a'.repeat(30) + '*b"',
            'Get-Process | Where-Object Name -like "' + 'a*'.repeat(60) + '"',
            'Get-Service | Select-String "(a+)+$"',
            'Get-Service | Where-Object DisplayName -match "(a+)+$"',
            'Get-Service ' + 'x '.repeat(70),
            'Get-Service | Sort-Object | Select-Object Name | Format-Table | Out-String',
            'Get-Service | ForEach-Object { $_ }',
            '1..100000 | ForEach-Object { 1 }',
            'Get-ChildItem D:\\ -Recurse -Include ' + '*'.repeat(400),
            '"' + 'a'.repeat(490) + '"'
        ];
        let slow = 0;
        for (const line of evil) {
            const t0 = Date.now();
            const r = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: line.slice(0, 500) }, f.o).catch((e) => ({ out: 'THREW ' + e.code }));
            const ms = Date.now() - t0;
            if (ms > 1000) { slow++; console.log('  slow (' + ms + ' ms): ' + line.slice(0, 60)); }
            t.check(typeof r.out === 'string' && r.out.indexOf('THREW') < 0, 'hostile line answered, not thrown: ' + line.slice(0, 50));
        }
        t.check(slow === 0, 'every hostile line returns within 1 s');
    }

    /* ═══ window bypass: actions the current screen does not offer ═════════════════════════════ */
    {
        const f = await SK.started('adv-2');
        const pre = JSON.parse((await f.st.get(f.sid)).stateJson);
        for (const [w, a, p] of [['settings', 'rename', { name: 'X' }], ['setup', 'install', { disk: 0, part: 1 }], ['oobe', 'account', { name: 'a', password: 'b' }],
                                 ['winre', 'reset', { mode: 'remove' }], ['asbuilt', 'save', { field: 'I1', value: 'driver' }], ['lusrmgr', 'user-new', { name: 'x', password: 'y' }]]) {
            const r = await EXAM.runAction(f.st, { sessionId: f.sid, window: w, action: a, params: p }, f.o);
            t.check(r.result.ok === false && r.result.msg === GUI.GENERIC, 'before the VM exists, ' + w + '/' + a + ' is refused generically');
        }
        const post = JSON.parse((await f.st.get(f.sid)).stateJson);
        delete pre.shell; delete post.shell;
        t.check(JSON.stringify(pre) === JSON.stringify(post), 'the bypass attempts changed nothing');
        for (const c of ['ps', 'setup-cmd', 'oobe-cmd', 'winre-cmd', 'diskpart']) {
            const r = await EXAM.runCommand(f.st, { sessionId: f.sid, console: c, line: 'whoami' }, f.o);
            t.check(r.context === null && /not available/.test(r.out), 'console ' + c + ' is unavailable on the host screen');
        }
    }

    /* ═══ racing writes: one lands, the other is told to retry; nothing is lost silently ════════ */
    {
        const f = await SK.started('adv-3');
        const vm = (name) => EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: { name, generation: 2, memoryMB: 4096, dynamicMemory: false, vhdxGB: 127, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' } }, f.o);
        const out = await Promise.allSettled([vm('RACE-A'), vm('RACE-B')]);
        const ok = out.filter((x) => x.status === 'fulfilled' && x.value.result.ok).length;
        const aborted = out.filter((x) => x.status === 'rejected' && x.reason.code === 'aborted').length;
        const lab = JSON.parse((await f.st.get(f.sid)).stateJson);
        t.check(ok + aborted === 2 && ok >= 1, 'racing actions: each either landed or was told to retry (' + ok + ' landed, ' + aborted + ' aborted)');
        t.check(lab.vm && (lab.vm.name === 'RACE-A' || lab.vm.name === 'RACE-B'), 'the stored lab has the winner\'s VM');
        const both = await Promise.allSettled([EXAM.handover(f.st, { sessionId: f.sid, confirm: true }, f.o), EXAM.runCommand(f.st, { sessionId: f.sid, console: 'hyperv-ps', line: 'Get-VM' }, f.o)]);
        t.check(both.every((x) => x.status === 'fulfilled' || x.reason.code === 'aborted'), 'handover racing a command: no other error');
    }

    /* ═══ P8: no feedback. Right and wrong answers get the same reply ══════════════════════════ */
    {
        const uid = SK.naturalUid(0, 2, 'adv-p8-');
        const rec = SK.record(() => W.perfect(uid, null, { skipP8: true }));
        const key = rec.out.key;
        const f = await SK.started(uid);
        await SK.replayInto(f.st, f.sid, rec.calls, f.o, f.c);
        const right = await EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: 'I1', value: 'runaway process' }, f.o);
        const wrong = await EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: 'I1', value: 'driver' }, f.o);
        delete right.remainingMs; delete wrong.remainingMs;
        t.check(JSON.stringify(right) === JSON.stringify(wrong), 'P8: the reply to a right answer equals the reply to a wrong one');
        t.check(key.variant === 'V3', '(fixture) the right answer above is right for this variant');
        const w1 = await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'asbuilt' }, f.o);
        t.check(JSON.stringify(w1.view).indexOf('correct') < 0 && JSON.stringify(w1.view).indexOf('score') < 0, 'the as-built window says nothing about correctness');
        const many = [];
        for (const v of ['driver', 'update', 'runaway process', 'name resolution']) {
            const r = await EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: 'I1', value: v }, f.o);
            delete r.remainingMs; many.push(JSON.stringify(r));
        }
        t.check(new Set(many).size === 1, 'P8: cycling every option gives one identical reply');
    }

    t.done();
})().catch((e) => { console.log('FATAL ' + (e && e.stack)); process.exitCode = 2; });
