#!/usr/bin/env node
/**
 * mdfinal-session.test.js — the session service (mdfinal-exam.js) against the in-memory store.
 *
 * @catalog what    MD-100 final session service: R2 window gate, end-to-end replay of the perfect
 * @catalog what    walk through the service (12 classes, 100 each), R3 caps and size guard, resets
 * @catalog what    (13.5 item 6), provision (2.5), submit/expiry/races, disclosure refusal.
 * @catalog run     node _tools/mdfinal/mdfinal-session.test.js
 * @catalog status  TOOL
 *
 * THE REPLAY IS THE CENTRAL PROOF. The walk drives the engine directly; this records every
 * top-level engine call it makes (gui.act, shell.exec, handover, answers.save) and replays the same
 * calls through the service and the store, as a student's page would. The service must reproduce
 * the walk's grade exactly (100 on every class). A service that dropped ctx.key, lost a write
 * between calls, mis-serialised a field or refused a legitimate call shows up as a different total.
 */
const kit = require('./mdfinal-test-kit.js');
const W = require('./mdfinal-walk.js');
const EXAM = kit.req('mdfinal-exam.js');
const EXAMS = kit.req('mdfinal-exams.js');
const CORE = kit.req('mdfinal-core.js');
const GRADE = kit.req('mdfinal-grade.js');
const GUI = kit.req('mdfinal-gui.js');
const VIEWS = kit.req('mdfinal-views.js');
const LIM = kit.req('mdfinal-limits.js');
const t = kit.harness('mdfinal-session');

const EX = 'md100-final-2026', RH = 'md100-final-rehearsal';
const W0 = EXAMS.WINDOWS[EX];
const ADMINS = ['ops@example.test'];
const ADMIN_TOKEN = { admin: true, email: 'someone@example.test' };
const OPERATOR_TOKEN = { email: 'ops@example.test', email_verified: true };

const SK = require('./mdfinal-svc-kit.js');
const { clock, opts, storeFor, record, naturalUid } = SK;

/* Expect a promise to reject with a code; returns the error. */
async function rejects(p, code, label) {
    try { await p; t.check(false, label + ': expected ' + code); return null; }
    catch (e) { t.check(e.code === code, label + ': code ' + e.code + ' (want ' + code + ')'); return e; }
}

(async () => {
    /* ═══ R2: the release window ═══════════════════════════════════════════════════════════════ */
    {
        const st = EXAM.memoryStore();
        const c = clock(W0.opensAt - 60000);
        await rejects(EXAM.startExam(st, { studentId: 'gate-1', examId: EX }, opts(c)), 'failed-precondition', 'R2 before window, not armed');
        await st.putControl(EX, { armed: true, allowUids: [] });
        await rejects(EXAM.startExam(st, { studentId: 'gate-1', examId: EX }, opts(c)), 'failed-precondition', 'R2 armed, before opensAt');
        c.set(W0.opensAt);
        const r = await EXAM.startExam(st, { studentId: 'gate-1', examId: EX }, opts(c));
        t.check(r.resumed === false && r.remainingMs === 150 * 60000, 'R2 armed inside window creates a 150-minute sitting');
        await st.putControl(EX, { armed: false, allowUids: [] });
        await rejects(EXAM.startExam(st, { studentId: 'gate-2', examId: EX }, opts(c)), 'failed-precondition', 'R2 control re-read on every create (disarmed)');
        await st.putControl(EX, { armed: true, allowUids: [] });
        c.set(W0.closesAt);
        await rejects(EXAM.startExam(st, { studentId: 'gate-3', examId: EX }, opts(c)), 'failed-precondition', 'R2 new start at closesAt refused');
        const res = await EXAM.startExam(st, { studentId: 'gate-1', examId: EX }, opts(c));
        t.check(res.resumed === true && res.sessionId === 'gate-1::' + EX, 'R2 resume after closesAt allowed');
        await rejects(EXAM.startExam(st, { studentId: 'gate-4', examId: RH }, opts(c)), 'failed-precondition', 'R2 student on rehearsal refused');
        const adm = await EXAM.startExam(st, { studentId: 'gate-4', examId: RH, isAdmin: true }, opts(c));
        t.check(adm.resumed === false, 'R2 admin on rehearsal allowed');
        await st.putControl(EX, { armed: false, allowUids: ['gate-5'] });
        c.set(W0.opensAt - 86400000);
        t.check((await EXAM.startExam(st, { studentId: 'gate-5', examId: EX }, opts(c))).resumed === false, 'R2 allowUids starts outside the window');
        await rejects(EXAM.startExam(st, { studentId: 'a/b', examId: EX }, opts(c)), 'invalid-argument', 'uid with a slash refused');
        await rejects(EXAM.startExam(st, { studentId: 'x::y', examId: EX }, opts(c)), 'invalid-argument', 'uid with :: refused');
        await rejects(EXAM.startExam(st, { studentId: 'ok', examId: 'attempt2' }, opts(c)), 'invalid-argument', 'unknown exam id refused');
        await rejects(EXAM.startExam(EXAM.memoryStore(), { studentId: 'nosecret', examId: RH, isAdmin: true }, { now: c.now }), 'failed-precondition', 'start without a secret fails closed');
        /* the reply carries no key and no fault */
        const j = JSON.stringify(adm);
        t.check(!/"answerKey"|"fault"|"snapshot"|"ledger"/.test(j), 'start reply carries no key, fault, snapshot or ledger');
    }

    /* ═══ the replay: the perfect walk through the service ═════════════════════════════════════ */
    /* Starts a sitting for uid, replays the recorded calls through the service, submits. */
    async function replay(uid, calls) {
        const f = await SK.started(uid);
        const refused = await SK.replayInto(f.st, f.sid, calls, f.o, f.c);
        const sub = await EXAM.submitExam(f.st, { sessionId: f.sid }, f.o);
        return { report: sub.report, refused };
    }
    let replays = 0, replayMismatch = 0;
    for (let p = 0; p < 3; p++) {
        for (let v = 0; v < 4; v++) {
            const uid = naturalUid(p, v);
            if (!uid) { t.check(false, 'replay: no natural uid for class ' + p + v); continue; }
            const rec = record(() => W.perfect(uid, null));
            const direct = GRADE.grade(rec.out.snapshot, rec.out.key, rec.out.state);
            const got = await replay(uid, rec.calls);
            replays++;
            const same = got.report.display === direct.display && JSON.stringify(got.report.rows.map((r) => r.score)) === JSON.stringify(direct.rows.map((r) => r.score));
            if (!same || got.report.display !== 100) { replayMismatch++; console.log('  replay ' + uid + ': service ' + got.report.display + ' direct ' + direct.display); }
            t.check(got.refused === 0, 'replay ' + uid + ' (class ' + p + v + '): no call refused (' + rec.calls.length + ' calls)');
        }
    }
    t.check(replays === 12 && replayMismatch === 0, 'replay: all 12 classes score 100 through the service, equal to direct grading (' + replays + ', ' + replayMismatch + ' mismatched)');

    /* ═══ a short sitting for the unit checks below ════════════════════════════════════════════ */
    /* A started sitting on its own store, allowlisted, three days before the window. */
    async function fresh(uid, examId) {
        const st = await storeFor([uid], examId || EX);
        const c = clock(W0.opensAt - 3 * 86400000);
        const graded = [];
        const o = opts(c, graded);
        const r = await EXAM.startExam(st, { studentId: uid, examId: examId || EX }, o);
        return { st, c, o, sid: r.sessionId, graded, start: r };
    }
    /* The stored document, serialised, for byte-identical comparisons. */
    const raw = async (st, sid) => JSON.stringify(await st.get(sid));

    /* ═══ R3: caps, size guard, ledger, refused writes leave the document byte-identical ════════ */
    {
        const f = await fresh('cap-1');
        await rejects(EXAM.runCommand(f.st, { sessionId: f.sid, console: 'hyperv-ps', line: 'x'.repeat(501) }, f.o), 'invalid-argument', 'R3 501-char line refused');
        const before = await raw(f.st, f.sid);
        const big = await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: { name: 'x'.repeat(5000) } }, f.o).catch((e) => e);
        t.check(big && big.result && big.result.ok === false && big.result.msg === GUI.GENERIC, 'R3 oversized params refused with the generic message');
        /* an action that changes nothing still bumps rev; a THROWN refusal must not */
        const b2 = await raw(f.st, f.sid);
        await rejects(EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: 'B1', value: 'x' }, f.o), 'invalid-argument', 'R3 field not offered before the desktop');
        t.check((await raw(f.st, f.sid)) === b2, 'R3 refused answer leaves the document byte-identical');
        t.check(before !== b2, '(control) an accepted action does write');
        /* size guard: inflate the stored lab to just under the limit through the store (the honest
         * maximum is far below it; this proves the guard itself), then any write is refused */
        const doc = await f.st.get(f.sid);
        const s = JSON.parse(doc.stateJson);
        s.regScratch = { pad: { key: 'HKLM\\SOFTWARE\\PAD', name: 'pad', type: 'REG_SZ', data: 'p'.repeat(EXAM.WRITE_LIMIT - EXAM.documentBytes(EXAM.fromDocument(doc)) - 200) } };
        doc.stateJson = JSON.stringify(s);
        f.st.raw()[f.sid] = doc;
        const pre = await raw(f.st, f.sid);
        const e = await rejects(EXAM.runCommand(f.st, { sessionId: f.sid, console: 'hyperv-ps', line: 'Get-VM' + ' '.repeat(300) }, f.o), 'failed-precondition', 'R3 size guard refuses a write that would pass the limit');
        t.check(e && e.message === LIM.STORAGE_MESSAGE, 'R3 size guard uses the storage message');
        t.check((await raw(f.st, f.sid)) === pre, 'R3 size-guard refusal leaves the document byte-identical (rev unchanged)');
        const sub = await EXAM.submitExam(f.st, { sessionId: f.sid }, f.o);
        t.check(sub.submitted === true && typeof sub.report.total === 'number', 'R3 submit is exempt from the size guard');
        t.check(Buffer.byteLength(JSON.stringify(await f.st.get(f.sid))) <= LIM.LIMITS.storage.documentBytes, 'R3 the graded document stays within 700,000 bytes');
        /* ledger cap: a write that takes the ledger past the cap is refused, submit still grades */
        const g = await fresh('cap-2');
        const d2 = await g.st.get(g.sid);
        const s2 = JSON.parse(d2.stateJson);
        while (s2.ledger.length < LIM.LIMITS.ledger.maxEntries) { s2.ledger.push({ i: s2.ledger.length, k: 'pad', ref: '' }); }
        d2.stateJson = JSON.stringify(s2); g.st.raw()[g.sid] = d2;
        const r = await EXAM.runAction(g.st, { sessionId: g.sid, window: 'hyperv', action: 'new-vm', params: { name: 'MER-WS', generation: 2, memoryMB: 4096, dynamicMemory: false, vhdxGB: 127, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' } }, g.o);
        t.check(r.result.ok === false && r.result.msg === LIM.STORAGE_MESSAGE, 'R3 ledger cap refuses a state-changing action');
        t.check((await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o)).submitted === true, 'R3 a full ledger still submits');
    }

    /* ═══ handover, answers, submit, expiry ═══════════════════════════════════════════════════ */
    {
        const f = await fresh('flow-1');
        await rejects(EXAM.handover(f.st, { sessionId: f.sid }, f.o), 'invalid-argument', 'handover needs confirm:true');
        const h = await EXAM.handover(f.st, { sessionId: f.sid, confirm: true }, f.o);
        t.check(h.handedOver === true && h.applied === false, 'handover with no OS: snapshot, no fault');
        const h2 = await EXAM.handover(f.st, { sessionId: f.sid, confirm: true }, f.o);
        t.check(h2.already === true, 'handover is idempotent');
        const [a, b] = await Promise.all([EXAM.submitExam(f.st, { sessionId: f.sid }, f.o), EXAM.submitExam(f.st, { sessionId: f.sid }, f.o)]);
        t.check([a, b].filter((x) => x.submitted).length === 1 && [a, b].filter((x) => x.alreadySubmitted).length === 1, 'racing submits: exactly one grades');
        t.check(f.graded.length === 1, 'onGraded runs once');
        await rejects(EXAM.runCommand(f.st, { sessionId: f.sid, console: 'hyperv-ps', line: 'Get-VM' }, f.o), 'failed-precondition', 'writes after submit refused');
        const res = await EXAM.startExam(f.st, { studentId: 'flow-1', examId: EX }, f.o);
        t.check(res.submitted === true && res.report && res.report.total === 0 && !res.report.rows, 'resume after submit: aggregates-only report');
        t.check(res.report.p7Reason === undefined && JSON.stringify(res.report).indexOf('parts') < 0, 'student report carries no rows, parts or reasons');
        t.check(res.report.objectives === undefined && Object.keys(res.report).sort().join(',') === 'outOf,phases,total', 'student report is total and phases only (Mallory R5 L2: some objectives are one check)');

        const g = await fresh('flow-2');
        g.c.add(150 * 60000);
        await rejects(EXAM.runCommand(g.st, { sessionId: g.sid, console: 'hyperv-ps', line: 'Get-VM' }, g.o), 'deadline-exceeded', 'a call after expiry auto-submits');
        const gs = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(!!gs.submittedAt && gs.autoSubmitted === true, 'expiry marks the sitting auto-submitted');

        const s3 = await fresh('flow-3');
        s3.c.add(151 * 60000);
        const sw = await EXAM.sweepExpired(s3.st, [s3.sid, 'nobody::' + EX], s3.o);
        t.check(sw[0].swept === true && sw[1].why === 'no session', 'sweep auto-submits an expired sitting, reports a missing one');
        t.check((await EXAM.sweepExpired(s3.st, [s3.sid], s3.o))[0].swept === false, 'a second sweep changes nothing');
    }

    /* ═══ generator version: a 1.0.0 key is refused ═══════════════════════════════════════════ */
    {
        const f = await fresh('ver-1');
        const d = await f.st.get(f.sid);
        const k = JSON.parse(d.answerKeyJson); k.version = '1.0.0'; d.answerKeyJson = JSON.stringify(k); f.st.raw()[f.sid] = d;
        await rejects(EXAM.runCommand(f.st, { sessionId: f.sid, console: 'hyperv-ps', line: 'Get-VM' }, f.o), 'failed-precondition', 'a 1.0.0 key is refused');
    }

    /* ═══ windows and the disclosure backstop ═════════════════════════════════════════════════ */
    {
        const f = await fresh('win-1');
        const w = await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'hyperv' }, f.o);
        t.check(w.view && Array.isArray(w.view.isoLibrary), 'hyperv window renders');
        const pre = await raw(f.st, f.sid);
        await rejects(EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'settings' }, f.o), 'invalid-argument', 'a window the screen does not offer is refused');
        /* eventvwr would render cleanly on any screen, so only the screen gate refuses it here */
        t.check(VIEWS.render(EXAM.fromDocument(await f.st.get(f.sid)).state, 'eventvwr', {}).refused === 'screen', 'the screen gate (not a render fault) refuses a desktop window on the host');
        await rejects(EXAM.renderWindow(f.st, { sessionId: f.sid, window: '__proto__' }, f.o), 'invalid-argument', '__proto__ window refused');
        await rejects(EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'regedit', params: { key: 'HKLM' } }, f.o), 'invalid-argument', 'regedit before the desktop refused');
        t.check((await raw(f.st, f.sid)) === pre, 'renders write nothing');
        /* an unscrubbed key trips the backstop, and the refusal names no value */
        const realRender = VIEWS.render;
        VIEWS.render = () => ({ ok: true, view: { name: 'x', fault: { variant: 'V2', kb: 'KB5099999' } } });
        const e = await rejects(EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'hyperv' }, f.o), 'internal', 'a forbidden key in a view is refused');
        VIEWS.render = realRender;
        t.check(e && e.message.indexOf('KB5099999') < 0 && e.message.indexOf('V2') < 0 && e.message.indexOf('fault') < 0, 'the refusal message names nothing it refused');
        /* lockout: a student who types forbidden tokens still gets their windows and actions */
        const r = await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: { name: 'mdf-v1 mdp-a hexworth/mdfinal', generation: 2, memoryMB: 4096, dynamicMemory: false, vhdxGB: 127, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' } }, f.o);
        t.check(r.result.ok === true, 'lockout: a VM named with forbidden tokens is created');
        const wv = await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'hyperv' }, f.o);
        t.check(wv.view.vm.name.$s === 'mdf-v1 mdp-a hexworth/mdfinal', 'lockout: the window renders the name as student text');
        const r2 = await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: { name: 'mdf-v1 again', generation: 2, memoryMB: 4096, dynamicMemory: false, vhdxGB: 127, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' } }, f.o);
        t.check(r2.result && typeof r2.result.msg === 'string', 'lockout: an error message echoing the token is still returned');
    }

    /* ═══ resets (13.5 item 6) ════════════════════════════════════════════════════════════════ */
    {
        const f = await fresh('rs-1');
        const before = EXAM.fromDocument(await f.st.get(f.sid));
        await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: { name: 'MER-WS', generation: 2, memoryMB: 4096, dynamicMemory: false, vhdxGB: 127, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' } }, f.o);
        const stale = EXAM.fromDocument(await f.st.get(f.sid));
        f.c.add(10 * 60000);
        const r1 = await EXAM.resetSession(f.st, { sessionId: f.sid, callerUid: 'rs-1', targetUid: 'rs-1', token: {}, adminEmails: ADMINS }, f.o);
        const after = EXAM.fromDocument(await f.st.get(f.sid));
        t.check(r1.kind === 'self' && after.attempt === 1 && after.lineage.selfResets === 1, 'self-reset before handover: attempt 1');
        t.check(after.startedAt === before.startedAt && after.expiresAt === before.expiresAt, 'self-reset keeps startedAt and expiresAt verbatim');
        t.check(JSON.stringify(after.state) === JSON.stringify(CORE.generate('rs-1', EX, { secret: kit.TEST_SECRET })) && JSON.stringify(after.answerKey) === JSON.stringify(before.answerKey), 'self-reset brings back the same lab and key');
        t.check(Object.keys(f.st.archived()).length === 1, 'self-reset archives the prior attempt');
        t.check(JSON.stringify(r1).indexOf('stateJson') < 0 && JSON.stringify(r1).indexOf('report') < 0, 'reset reply returns nothing from the archive');
        /* a request that read the old attempt cannot write over the new one */
        const wrote = await f.st.putIfRev(f.sid, EXAM.toDocument(Object.assign({}, stale, { rev: stale.rev + 1 })), stale.rev);
        t.check(wrote === false, 'a stale write across a reset is refused (attempt differs)');
        await EXAM.resetSession(f.st, { sessionId: f.sid, callerUid: 'rs-1', targetUid: 'rs-1', token: {}, adminEmails: ADMINS }, f.o);
        await rejects(EXAM.resetSession(f.st, { sessionId: f.sid, callerUid: 'rs-1', targetUid: 'rs-1', token: {}, adminEmails: ADMINS }, f.o), 'permission-denied', 'third self-reset denied');
        await rejects(EXAM.resetSession(f.st, { sessionId: f.sid, callerUid: 'other', targetUid: 'rs-1', token: { handler: true }, adminEmails: ADMINS }, f.o), 'permission-denied', 'a class handler cannot reset');

        const g = await fresh('rs-2');
        await EXAM.handover(g.st, { sessionId: g.sid, confirm: true }, g.o);
        await rejects(EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'rs-2', targetUid: 'rs-2', token: {}, adminEmails: ADMINS }, g.o), 'permission-denied', 'self-reset after handover denied');
        /* 13.19 item 1: an admin reset after handover deals a NEW lab with a fresh clock */
        const seed0 = EXAM.fromDocument(await g.st.get(g.sid));
        g.c.add(30 * 60000);
        const ra = await EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'adm', targetUid: 'rs-2', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-1' }, g.o);
        const seed1 = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(ra.kind === 'admin' && seed1.lineage.seed >= 1 && seed1.attempt === 1 && !seed1.handedOverAt && !seed1.submittedAt && seed1.answerKey.variant !== seed0.answerKey.variant, 'admin reset after handover: a new sitting on a new seed, with a different fault variant');
        t.check(JSON.stringify(seed1.answerKey) !== JSON.stringify(seed0.answerKey) && seed1.state.wo.hostname + seed1.answerKey.fault.kb !== seed0.state.wo.hostname + seed0.answerKey.fault.kb, 'the new sitting is a different lab (key and work order differ)');
        t.check(JSON.stringify(seed1.answerKey) === JSON.stringify(CORE.buildAnswerKey('rs-2', EX, { secret: kit.TEST_SECRET, seed: seed1.lineage.seed })) && JSON.stringify(seed1.state) === JSON.stringify(CORE.generate('rs-2', EX, { secret: kit.TEST_SECRET, seed: seed1.lineage.seed })), 'and it is exactly that seed\'s derivation');
        t.check(seed1.startedAt === g.c.now() && seed1.expiresAt === g.c.now() + 150 * 60000, 'with a fresh clock');
        t.check(Object.values(g.st.archived()).some((a) => a.newLab === true && a.kind === 'admin'), 'the old attempt is archived, marked newLab');
        /* a self-reset of the new sitting keeps its seed (same lab as this sitting, not the original) */
        await EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'rs-2', targetUid: 'rs-2', token: {}, adminEmails: ADMINS }, g.o);
        const self1 = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(self1.lineage.seed === 1 && JSON.stringify(self1.answerKey) === JSON.stringify(seed1.answerKey), 'a self-reset afterwards keeps the new lab');
        await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        await rejects(EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'adm', targetUid: 'rs-2', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-1' }, g.o), 'permission-denied', 'a second admin reset needs the operator, after submit too');
        /* retakes (operator, 2026-11-09): after submit the owner may start a new lab while a new start
         * is allowed; the latest submitted attempt is the grade */
        const preRetake = EXAM.fromDocument(await g.st.get(g.sid));
        const rt = await EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'rs-2', targetUid: 'rs-2', token: {}, adminEmails: ADMINS }, g.o);
        const postRetake = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(rt.kind === 'retake' && !postRetake.submittedAt && postRetake.lineage.retakes === 1 && postRetake.lineage.seed > preRetake.lineage.seed &&
            postRetake.answerKey.variant !== preRetake.answerKey.variant && postRetake.expiresAt - postRetake.startedAt === postRetake.durationMs && postRetake.startedAt === g.c.now(),
            'a retake after submit deals a new lab (different fault) on a fresh clock and counts the retake');
        t.check(Object.values(g.st.archived()).some((a) => a.kind === 'retake' && a.newLab === true), 'the submitted attempt is archived, marked retake');
        await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        await g.st.putControl(EX, { armed: false, allowUids: [] });
        await rejects(EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'rs-2', targetUid: 'rs-2', token: {}, adminEmails: ADMINS }, g.o), 'failed-precondition', 'a retake is refused once a new start is not allowed (not armed, not allowlisted)');
        await rejects(EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'rs-x', targetUid: 'rs-2', token: {}, adminEmails: ADMINS }, g.o), 'permission-denied', 'another student cannot retake this sitting');
        const ro = await EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'op', targetUid: 'rs-2', token: OPERATOR_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-2' }, g.o);
        const seed2 = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(ro.kind === 'admin' && seed2.lineage.seed > seed1.lineage.seed && !seed2.submittedAt, 'the operator resets a submitted sitting: a later seed, unsubmitted');
        /* provision of a reset sitting rebuilds the same (seed-2) lab */
        await EXAM.provision(g.st, { sessionId: g.sid, staffUid: 'staff-1' }, g.o);
        t.check(EXAM.fromDocument(await g.st.get(g.sid)).state.wo.hostname === CORE.generate('rs-2', EX, { secret: kit.TEST_SECRET, seed: seed2.lineage.seed }).wo.hostname, 'provision rebuilds the sitting\'s own seed');

        const h = await fresh('rs-3');
        h.c.add(151 * 60000);
        await rejects(EXAM.resetSession(h.st, { sessionId: h.sid, callerUid: 'rs-3', targetUid: 'rs-3', token: {}, adminEmails: ADMINS }, h.o), 'failed-precondition', 'reset after expiry auto-submits instead');
        t.check(!!EXAM.fromDocument(await h.st.get(h.sid)).submittedAt, 'the expired sitting was submitted, not reset');
        await rejects(EXAM.resetSession(h.st, { sessionId: 'nobody::' + EX, callerUid: 'nobody', targetUid: 'nobody', token: {}, adminEmails: ADMINS }, h.o), 'not-found', 'reset never creates a sitting');
        /* a stranger cannot auto-submit someone's expired sitting or probe for one (Mallory F5) */
        const hs = await fresh('rs-3b');
        hs.c.add(151 * 60000);
        await rejects(EXAM.resetSession(hs.st, { sessionId: hs.sid, callerUid: 'evil', targetUid: 'rs-3b', token: {}, adminEmails: ADMINS }, hs.o), 'permission-denied', 'a stranger\'s reset of an expired sitting is denied');
        t.check(!EXAM.fromDocument(await hs.st.get(hs.sid)).submittedAt, 'and submits nothing');
        await rejects(EXAM.resetSession(hs.st, { sessionId: 'ghost::' + EX, callerUid: 'evil', targetUid: 'ghost', token: {}, adminEmails: ADMINS }, hs.o), 'permission-denied', 'and a missing sitting looks the same to a stranger');

        const a = await fresh('rs-4');
        await rejects(EXAM.resetSession(a.st, { sessionId: a.sid, callerUid: 'adm', targetUid: 'rs-4', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'student asked', evidence: 'x' }, a.o), 'invalid-argument', 'admin reset needs a platform fault code');
        await rejects(EXAM.resetSession(a.st, { sessionId: a.sid, callerUid: 'adm', targetUid: 'rs-4', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: '' }, a.o), 'invalid-argument', 'admin reset needs an evidence reference');
        const st0 = EXAM.fromDocument(await a.st.get(a.sid));
        a.c.add(60 * 60000);
        const ar = await EXAM.resetSession(a.st, { sessionId: a.sid, callerUid: 'adm', targetUid: 'rs-4', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-7', freshClock: true, faultAt: st0.startedAt + 30 * 60000 }, a.o);
        const st1 = EXAM.fromDocument(await a.st.get(a.sid));
        t.check(ar.kind === 'admin' && st1.lineage.adminResets === 1, 'admin reset before handover');
        t.check(st1.expiresAt === a.c.now() + 120 * 60000, 'freshClock: now + the time left at the fault (' + (st1.expiresAt - a.c.now()) / 60000 + ' min)');
        t.check(st1.expiresAt > st0.expiresAt, 'freshClock gave time back');
        await rejects(EXAM.resetSession(a.st, { sessionId: a.sid, callerUid: 'adm', targetUid: 'rs-4', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-8' }, a.o), 'permission-denied', 'second admin reset needs the operator');
        t.check((await EXAM.resetSession(a.st, { sessionId: a.sid, callerUid: 'op', targetUid: 'rs-4', token: OPERATOR_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-8' }, a.o)).kind === 'admin', 'the operator may reset again');
        await rejects(EXAM.resetSession(a.st, { sessionId: a.sid, callerUid: 'adm', targetUid: 'rs-4', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-9', freshClock: true, faultAt: 0 }, a.o), 'permission-denied', '(cap still holds for a non-operator admin)');

        /* freshClock never takes time and never pre-expires (Nancy D6 #4): her two real-window cases */
        const W17 = W0.opensAt;
        for (const [start, fault, reset, label] of [[W17, W17 + 15 * 60000, W17 + 30 * 60000, '17:30 start, fault 17:45, reset 18:00'],
                                                    [W0.closesAt - 5 * 60000, W0.closesAt + 10 * 60000, W0.closesAt + 40 * 60000, '18:25 start, fault 18:40, reset 19:10']]) {
            const lw = EXAM.memoryStore(); await lw.putControl(EX, { armed: true, allowUids: [] });
            const lc = clock(start); const lo = opts(lc);
            const ls = (await EXAM.startExam(lw, { studentId: 'fc-' + start, examId: EX }, lo)).sessionId;
            const was = EXAM.fromDocument(await lw.get(ls)).expiresAt;
            lc.set(reset);
            await EXAM.resetSession(lw, { sessionId: ls, callerUid: 'adm', targetUid: 'fc-' + start, token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-2', freshClock: true, faultAt: fault }, lo);
            const now2 = EXAM.fromDocument(await lw.get(ls)).expiresAt;
            t.check(now2 >= was && now2 > reset && now2 === reset + (was - fault), 'freshClock (' + label + '): never shorter, never expired, the time left at the fault (' + (now2 - was) / 60000 + ' min back)');
        }
        /* the cap: the latest any sitting could end, plus the grace */
        const lw2 = EXAM.memoryStore(); await lw2.putControl(EX, { armed: true, allowUids: [] });
        const lc2 = clock(W0.closesAt - 60000); const lo2 = opts(lc2);
        const ls2 = (await EXAM.startExam(lw2, { studentId: 'fc-cap', examId: EX }, lo2)).sessionId;
        lc2.add(140 * 60000);
        await EXAM.resetSession(lw2, { sessionId: ls2, callerUid: 'adm', targetUid: 'fc-cap', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-3', freshClock: true, faultAt: W0.closesAt }, lo2);
        t.check(EXAM.fromDocument(await lw2.get(ls2)).expiresAt === W0.closesAt + 150 * 60000 + EXAMS.ADMIN_RESET_GRACE_MINUTES * 60000, 'freshClock never runs past the last start + duration + grace');

        /* races: exactly one of submit and reset wins */
        const rc = await fresh('rs-6');
        const out = await Promise.allSettled([EXAM.submitExam(rc.st, { sessionId: rc.sid }, rc.o),
            EXAM.resetSession(rc.st, { sessionId: rc.sid, callerUid: 'rs-6', targetUid: 'rs-6', token: {}, adminEmails: ADMINS }, rc.o)]);
        const end = EXAM.fromDocument(await rc.st.get(rc.sid));
        const subWon = out[0].status === 'fulfilled' && out[0].value.submitted === true;
        const rsWon = out[1].status === 'fulfilled';
        t.check(subWon !== rsWon && (subWon ? !!end.submittedAt && end.attempt === 0 : !end.submittedAt && end.attempt === 1), 'submit racing reset: exactly one outcome');

        /* penalties carry across a self-reset: damage the archive, reset, build clean, submit */
        const pc = await fresh('rs-7');
        const nat = CORE.buildAnswerKey('rs-7', EX, { secret: kit.TEST_SECRET });
        const rec = record(() => { const { state, key } = W.sitting('rs-7'); W.p1Gui(state, key, { installOnArchive: true }); return null; });
        for (const call of rec.calls) {
            if (call[0] === 'act') { await EXAM.runAction(pc.st, { sessionId: pc.sid, window: call[1], action: call[2], params: call[3] }, pc.o); }
            else if (call[0] === 'exec') { await EXAM.runCommand(pc.st, { sessionId: pc.sid, console: call[1], line: call[2] }, pc.o); }
        }
        const damaged = EXAM.fromDocument(await pc.st.get(pc.sid));
        const pens = GRADE.appliedPenalties(damaged.state, damaged.answerKey);
        t.check(pens.length > 0, '(fixture) installing on the archive incurs a P1 penalty: ' + pens.join(','));
        await EXAM.resetSession(pc.st, { sessionId: pc.sid, callerUid: 'rs-7', targetUid: 'rs-7', token: {}, adminEmails: ADMINS }, pc.o);
        const sub = await EXAM.submitExam(pc.st, { sessionId: pc.sid }, pc.o);
        t.check(pens.every((id) => sub.report.penalties.some((p) => p.id === id && p.applied)), 'a penalty from the attempt before a self-reset still applies');
        t.check(nat.version === CORE.GENERATOR_VERSION, '(fixture) key version current');
    }

    /* ═══ provision (2.5) ═════════════════════════════════════════════════════════════════════ */
    {
        const f = await fresh('pv-1');
        await rejects(EXAM.provision(f.st, { sessionId: f.sid }, f.o), 'invalid-argument', 'provision needs a staff identity');
        await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: { name: 'BROKEN', generation: 1, memoryMB: 2048, dynamicMemory: true, vhdxGB: 60, switch: 'Default Switch', iso: 'Win10_22H2_x64.iso' } }, f.o);
        const asStood = EXAM.fromDocument(await f.st.get(f.sid)).state;
        const pv = await EXAM.provision(f.st, { sessionId: f.sid, staffUid: 'staff-1' }, f.o);
        t.check(pv.provisioned === true && pv.screen === 'desktop', 'provision lands on the desktop');
        const s = EXAM.fromDocument(await f.st.get(f.sid));
        t.check(JSON.stringify(s.p1Snapshot) === JSON.stringify(asStood) && s.provisionedBy === 'staff-1', 'provision keeps the PC as it stood');
        const b = s.state;
        t.check(b.vm.generation === 2 && b.vm.vtpm === true && b.vm.secureBoot.on === true, 'baseline: Gen2, vTPM, Secure Boot');
        t.check(b.os.edition === 'Pro' && b.os.activation.status !== 'Licensed', 'baseline: Windows 11 Pro, unactivated');
        t.check(b.identity.users[b.wo.technician] && b.identity.groups.Administrators.members.indexOf(b.wo.technician) >= 0, 'baseline: the seeded technician is a local admin');
        t.check(Object.keys(b.os.oobe.privacy).every((k) => b.os.oobe.privacy[k] === true || b.os.oobe.privacy[k] === 'Optional'), 'baseline: default OOBE privacy');
        t.check(Math.round(b.disks.find((d) => d.role === 'os').partitions.find((x) => x.letter === 'C').mb / 1024) === b.wo.disks.cGB, 'baseline: C: at the WO size');
        t.check(b.ledger.some((l) => l.k === 'provisioned'), 'baseline: a provisioned ledger event');
        await EXAM.provision(f.st, { sessionId: f.sid, staffUid: 'staff-2' }, f.o);
        t.check(JSON.stringify(EXAM.fromDocument(await f.st.get(f.sid)).p1Snapshot) === JSON.stringify(asStood), 'a second provision keeps the first p1Snapshot');
        const sub = await EXAM.submitExam(f.st, { sessionId: f.sid }, f.o);
        const p1 = sub.report.rows.filter((r) => r.phase === 'P1').reduce((a, r) => a + r.score, 0);
        const p1Direct = GRADE.grade(asStood, s.answerKey, asStood).rows.filter((r) => r.phase === 'P1').reduce((a, r) => a + r.score, 0);
        t.check(p1 === p1Direct && sub.report.provisioned === true, 'a provisioned sitting grades P1 as it stood (' + p1 + ' = ' + p1Direct + ')');
        t.check(EXAM.gradebookEntry(EXAM.fromDocument(await f.st.get(f.sid))).provisioned === true, 'the gradebook entry carries provisioned:true');
        const g = await fresh('pv-2');
        await EXAM.handover(g.st, { sessionId: g.sid, confirm: true }, g.o);
        await rejects(EXAM.provision(g.st, { sessionId: g.sid, staffUid: 'staff-1' }, g.o), 'failed-precondition', 'provision after handover refused');
    }

    /* ═══ the clock, the ledger cap on a multi-entry call, the V2 console gate (mutation survivors) ═ */
    {
        const uid = SK.naturalUid(0, 1, 'clk-');
        const rec = record(() => { const { state, key } = W.sitting(uid); W.p1Gui(state, key); return null; });
        const f = await SK.started(uid);
        await SK.replayInto(f.st, f.sid, rec.calls, f.o, f.c);
        await EXAM.runAction(f.st, { sessionId: f.sid, window: 'sysprops', action: 'protection', params: { on: true } }, f.o);
        const c1 = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'Checkpoint-Computer -Description "Before P2"' }, f.o);
        const pts = () => f.st.get(f.sid).then((d) => JSON.parse(d.stateJson).sys.restorePoints.length);
        t.check((await pts()) === 1 && !/could not be created/.test(c1.out), 'the server clock reaches the engine: Checkpoint-Computer creates a point');
        f.c.add(60 * 60000);
        const c2 = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'Checkpoint-Computer -Description "Again"' }, f.o);
        t.check((await pts()) === 1 && /1440 minutes/.test(c2.out), 'an hour later the throttle (which needs the clock) refuses a second point');
        /* a restart adds two ledger entries; at cap - 1 the engine accepts it and the service refuses the result */
        const d = await f.st.get(f.sid);
        const s = JSON.parse(d.stateJson);
        while (s.ledger.length < LIM.LIMITS.ledger.maxEntries - 1) { s.ledger.push({ i: s.ledger.length, k: 'pad', ref: '' }); }
        d.stateJson = JSON.stringify(s); f.st.raw()[f.sid] = d;
        const pre = JSON.stringify(await f.st.get(f.sid));
        const e = await EXAM.runAction(f.st, { sessionId: f.sid, window: 'desktop', action: 'restart', params: {} }, f.o).catch((x) => x);
        t.check(e && e.code === 'failed-precondition' && e.message === LIM.STORAGE_MESSAGE, 'a call that would take the ledger past the cap is refused by the service');
        t.check(JSON.stringify(await f.st.get(f.sid)) === pre, 'and writes nothing');
    }
    {
        const uid = SK.naturalUid(0, 1, 'v2c-');
        const rec = record(() => W.perfect(uid, null, { skipRepair: true, skipP8: true }));
        const cut = rec.calls.findIndex((c) => c[0] === 'handover');
        const f = await SK.started(uid);
        await SK.replayInto(f.st, f.sid, rec.calls.slice(0, cut + 1), f.o, f.c);
        const r1 = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'Get-HotFix' }, f.o);
        t.check(r1.context === null && r1.consoles.indexOf('ps') < 0, 'V2: while Explorer crash-loops the desktop console is unavailable');
        await EXAM.runAction(f.st, { sessionId: f.sid, window: 'taskmgr', action: 'run', params: { target: 'powershell' } }, f.o);
        const r2 = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'Get-HotFix' }, f.o);
        t.check(r2.context === 'ps' && r2.consoles.indexOf('ps') >= 0, 'V2: Task Manager > Run new task opens it');
    }
    {
        const f = await fresh('exp-r');
        f.c.add(151 * 60000);
        const r = await EXAM.startExam(f.st, { studentId: 'exp-r', examId: EX }, f.o);
        t.check(r.resumed === true && r.submitted === true && r.report && typeof r.report.total === 'number' && r.remainingMs === 0, 'resuming an expired sitting submits it and returns the report');
        t.check(f.graded.length === 1, 'and records the grade');
        const open = { submittedAt: null, handedOverAt: null, expiresAt: 1000, lineage: { selfResets: 0 } };
        t.check(EXAM.mayReset('u', 'u', {}, [], open, 1000) === false && EXAM.mayReset('u', 'u', {}, [], open, 999) === 'self', 'mayReset: an expired sitting is not self-resettable');
        const a = { rev: 3, startedAt: 10, attempt: 0 };
        t.check(EXAM.sameSitting(a, { startedAt: 10, attempt: 0 }, 3) && !EXAM.sameSitting(a, { startedAt: 10, attempt: 1 }, 3)
            && !EXAM.sameSitting(a, { startedAt: 11, attempt: 0 }, 3) && !EXAM.sameSitting(a, { startedAt: 10, attempt: 0 }, 2) && !EXAM.sameSitting(null, a, 3),
            'sameSitting: rev, startedAt and attempt must all match');
    }

    /* ═══ what the walk hard-codes, a student can find (Nancy D6 #2, #3) ═════════════════════════ */
    {
        const uid = SK.naturalUid(0, 0, 'disc-');
        const rec = record(() => { const { state, key } = W.sitting(uid); W.p1Gui(state, key, { skipActivation: true }); return null; });
        const f = await SK.started(uid);
        await SK.replayInto(f.st, f.sid, rec.calls, f.o, f.c);
        const dir = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'dir C:\\LabFiles' }, f.o);
        t.check(/LedgerSync_2\.4_x64\.msi/.test(dir.out) && /LedgerSync_2\.4_x86\.msi/.test(dir.out), 'dir C:\\LabFiles lists both packages');
        const ex = await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'explorer', params: { path: 'C:\\LabFiles' } }, f.o);
        t.check(ex.view.files && ex.view.files.some((x) => x.name === 'LedgerSync_2.4_x64.msi'), 'Explorer at C:\\LabFiles lists the x64 package');
        /* the brief prints the archive SHA-256 values; the student can check them (non-author run) */
        const man = EXAM.fromDocument(await f.st.get(f.sid)).state.wo.disks.archiveManifest;
        const fh = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'Get-FileHash E:\\' + man[0].name + ' | Format-List' }, f.o);
        t.check(fh.out.indexOf(man[0].sha256.toUpperCase()) >= 0, 'Get-FileHash shows the archive file\'s SHA-256 from the brief');
        /* the startup list is there before anything else touched the apps area (non-author run) */
        const sv = await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'settings' }, f.o);
        t.check(sv.view.startup.length >= 5 && sv.view.apps.length > 0, 'Settings lists the startup and installed apps right after setup');
        const ed = EXAM.fromDocument(await f.st.get(f.sid)).state.os.edition;
        const kt = f.start.initialState.keyTable;
        t.check(kt.some((k) => k.edition === 'Windows 11 ' + ed && k.key === kit.req('mdfinal-pc.js').GVLK[ed]), 'the key table carries the GVLK for the installed edition (' + ed + ')');
        /* and with the key from the table, activation through the service works */
        await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'slmgr /ipk ' + kt.find((k) => k.edition === 'Windows 11 ' + ed).key }, f.o);
        const wo = EXAM.fromDocument(await f.st.get(f.sid)).state.wo;
        await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'slmgr /skms ' + wo.network.kms.ip }, f.o);
        await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'ps', line: 'slmgr /ato' }, f.o);
        t.check(EXAM.fromDocument(await f.st.get(f.sid)).state.os.activation.status === 'Licensed', 'activating with the table\'s key licenses the PC');
    }
    /* ═══ Gen1: VM Settings renders (Nancy D6 #1); a reset after provision keeps P1 penalties (#5) ═ */
    {
        const f = await fresh('gen1');
        await EXAM.runAction(f.st, { sessionId: f.sid, window: 'hyperv', action: 'new-vm', params: { name: 'G1', generation: 1, memoryMB: 8192, dynamicMemory: false, vhdxGB: 200, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' } }, f.o);
        const v = await EXAM.renderWindow(f.st, { sessionId: f.sid, window: 'vm-settings' }, f.o);
        t.check(v.view.vm.generation === 1 && v.view.vm.secureBoot === null, 'VM Settings renders a Generation 1 VM (no Secure Boot)');
        const g = await fresh('pv-rs');
        const rec = record(() => { const { state, key } = W.sitting('pv-rs'); W.p1Gui(state, key, { installOnArchive: true }); return null; });
        for (const c of rec.calls) {
            if (c[0] === 'act') { await EXAM.runAction(g.st, { sessionId: g.sid, window: c[1], action: c[2], params: c[3] }, g.o); }
            else if (c[0] === 'exec') { await EXAM.runCommand(g.st, { sessionId: g.sid, console: c[1], line: c[2] }, g.o); }
        }
        await EXAM.provision(g.st, { sessionId: g.sid, staffUid: 'staff-1' }, g.o);
        await EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'pv-rs', targetUid: 'pv-rs', token: {}, adminEmails: ADMINS }, g.o);
        const sub = await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        t.check(sub.report.penalties.some((p) => p.id === 'P1-archive' && p.applied), 'a reset after a provision still applies the P1 archive penalty');
    }

    /* ═══ handover at the ledger cap, saved answers tagged, provision P1 penalty, entry details ════ */
    {
        const uid = SK.naturalUid(0, 2, 'hocap-');
        const rec = record(() => { const { state, key } = W.sitting(uid); W.p1Gui(state, key); return null; });
        const f = await SK.started(uid);
        await SK.replayInto(f.st, f.sid, rec.calls, f.o, f.c);
        await EXAM.saveAnswer(f.st, { sessionId: f.sid, fieldId: 'B1', value: 'ABCD1234' }, f.o);
        const res = await EXAM.startExam(f.st, { studentId: uid, examId: EX }, f.o);
        t.check(res.answers.B1 && res.answers.B1.$s === 'ABCD1234', 'a resumed typed answer comes back as student text');
        const d = await f.st.get(f.sid);
        const s = JSON.parse(d.stateJson);
        while (s.ledger.length < LIM.LIMITS.ledger.maxEntries) { s.ledger.push({ i: s.ledger.length, k: 'pad', ref: '' }); }
        d.stateJson = JSON.stringify(s); f.st.raw()[f.sid] = d;
        const h = await EXAM.handover(f.st, { sessionId: f.sid, confirm: true }, f.o).catch((e) => e);
        t.check(h && h.handedOver === true && h.applied === true, 'a sitting at the ledger cap can still hand over');
        const c = await EXAM.runCommand(f.st, { sessionId: f.sid, console: 'hyperv-ps', line: 'Get-VM' }, f.o);
        t.check(Array.isArray(c.windows), 'command replies carry the windows the screen offers');

        const g = await fresh('pv-pen');
        const rec2 = record(() => { const { state, key } = W.sitting('pv-pen'); W.p1Gui(state, key, { installOnArchive: true }); return null; });
        for (const cl of rec2.calls) {
            if (cl[0] === 'act') { await EXAM.runAction(g.st, { sessionId: g.sid, window: cl[1], action: cl[2], params: cl[3] }, g.o); }
            else if (cl[0] === 'exec') { await EXAM.runCommand(g.st, { sessionId: g.sid, console: cl[1], line: cl[2] }, g.o); }
        }
        await EXAM.provision(g.st, { sessionId: g.sid, staffUid: 'staff-1' }, g.o);
        const sub = await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        t.check(sub.report.penalties.some((p) => p.id === 'P1-archive' && p.applied), 'a provisioned sitting keeps the P1 penalty of the PC as it stood');

        const base = { submittedAt: Date.parse('2026-11-19T23:00:00Z'), report: { total: 71.234, rows: [], phases: { P1: { score: 10, max: 15 } }, durationUsedMs: 1000 },
                       lineage: { selfResets: 0, adminResets: 1 }, provisionedAt: null, autoSubmitted: false };
        const e = EXAM.gradebookEntry(base);
        t.check(e.score === 71.23 && e.flagged === true, 'entry: score rounded to 0.01; flagged after an admin reset');
        t.check(EXAM.isOperator({ email: ADMINS[0], email_verified: false }, ADMINS) === false && EXAM.isOperator({ email: ADMINS[0] }, ADMINS) === false && EXAM.isOperator({ email: ADMINS[0], email_verified: true }, ADMINS) === true,
            'operator: an unverified allowlisted email is not the operator');
    }

    /* ═══ gradebook entry shape (R7) ══════════════════════════════════════════════════════════ */
    {
        const sess = { submittedAt: Date.parse('2026-11-19T23:00:00Z'), report: { total: 69.995, rows: [], phases: { P1: { score: 10, max: 15 } }, durationUsedMs: 61000 },
                       lineage: { selfResets: 1, adminResets: 0 }, provisionedAt: null, autoSubmitted: false };
        const realSR = GRADE.studentReport;
        const e = EXAM.gradebookEntry(Object.assign({}, sess, { report: Object.assign({}, sess.report) }));
        t.check(e.sat === true && e.passed === true && e.completed === true && e.source === 'mdfinal', 'entry: 69.995 rounds to 70.00 and passes');
        const e2 = EXAM.gradebookEntry(Object.assign({}, sess, { report: Object.assign({}, sess.report, { total: 69.98 }) }));
        t.check(e2.passed === false && e2.completed === false && e2.completedAt === null && e2.score === 69.98, 'entry: a fail is sat, scored, never completed');
        t.check(e.flagged === true && e.duration === 61, 'entry: flagged after a self-reset, duration in seconds');
        t.check(realSR === GRADE.studentReport, '(no patching)');
    }

    /* ═══ retakes: the grade of record (operator, 2026-11-09) ════════════════════════════════════
     * the latest attempt the student submits is the grade; while a retake runs, and after one runs out
     * unsubmitted, the attempt before it stands; each retake has its own build restarts */
    {
        const g = await fresh('rt-a');
        const me = { sessionId: g.sid, callerUid: 'rt-a', targetUid: 'rt-a', token: {}, adminEmails: ADMINS };
        await EXAM.resetSession(g.st, me, g.o);                      /* a build restart on attempt 0 */
        await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        const first = EXAM.fromDocument(await g.st.get(g.sid));
        const gradedBefore = g.graded.length;
        await EXAM.resetSession(g.st, Object.assign({ retake: true }, me), g.o);
        const mid = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(mid.lineage.selfResets === 0 && mid.lineage.retakes === 1, 'a retake gives back the build restarts');
        const midRec = EXAM.recordOf(mid);
        t.check(midRec && midRec.submittedAt === first.submittedAt && midRec.attempt === first.attempt && midRec.standingOnly === 'attemptInProgress',
            'while the retake runs, the submitted attempt stands');
        t.check(/attemptInProgress/.test(EXAM.resultsCsv([mid])) && EXAM.totalsCsv([mid]).split('\n').length === 2, 'mid-retake the student stays in both CSVs, flagged');
        t.check(EXAM.instructorView(mid, {}).entry && EXAM.instructorView(mid, {}).entry.satAt === new Date(first.submittedAt).toISOString(), 'mid-retake the staff view carries the standing entry');
        /* a second click from a stale tab must not spend a build restart */
        await rejects(EXAM.resetSession(g.st, Object.assign({ retake: true }, me), g.o), 'failed-precondition', 'a retake request on a running retake is refused, not turned into a build restart');
        t.check(EXAM.fromDocument(await g.st.get(g.sid)).lineage.selfResets === 0, 'and no build restart was spent');
        /* a build restart during the retake keeps the standing attempt (same lab, nothing submitted) */
        await EXAM.resetSession(g.st, me, g.o);
        const restarted = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(restarted.lineage.selfResets === 1 && restarted.standing && restarted.standing.submittedAt === first.submittedAt, 'a build restart in a retake keeps the standing attempt');
        /* abandoned: the clock runs out and the sweep submits it */
        g.c.set(mid.expiresAt + 1000);
        await EXAM.sweepExpired(g.st, [g.sid], g.o);
        const gone = EXAM.fromDocument(await g.st.get(g.sid));
        const rec = EXAM.recordOf(gone);
        t.check(gone.submittedAt && gone.autoSubmitted && rec.submittedAt === first.submittedAt && rec.standingOnly === 'attemptAbandoned',
            'an abandoned retake (auto-submitted) does not replace the submitted attempt');
        t.check(g.graded.length === gradedBefore, 'and it never reaches the gradebook writer');
        t.check(/attemptAbandoned/.test(EXAM.resultsCsv([gone])), 'the CSV row is the standing attempt, flagged attemptAbandoned');
        t.check(!/selfReset/.test(EXAM.resultsCsv([gone])), 'the standing row does not carry the abandoned attempt\'s restart counts');
        const shown = await EXAM.startExam(g.st, { studentId: 'rt-a', examId: EX }, g.o);
        t.check(shown.submitted && shown.standing && shown.standing.why === 'attemptAbandoned' && shown.standing.attempt === first.attempt + 1 &&
            typeof shown.standing.report.total === 'number', 'the student is shown which attempt is their grade after an abandoned retake');
        /* a retake from an abandoned one still stands on the student's submitted attempt */
        g.c.set(gone.submittedAt + 1000);
        await EXAM.resetSession(g.st, Object.assign({ retake: true }, me), g.o);
        const again = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(again.standing && again.standing.submittedAt === first.submittedAt && again.lineage.retakes === 2, 'retaking after an abandoned retake keeps the same standing attempt');
        /* a retake the student submits is the new grade */
        await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        const done = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(EXAM.recordOf(done) === done && g.graded.length === gradedBefore + 1, 'a submitted retake is the grade and reaches the gradebook');
        t.check((await EXAM.startExam(g.st, { studentId: 'rt-a', examId: EX }, g.o)).standing === null, 'and the student is shown no other standing grade');
        /* the page submits itself at zero: that is the clock's submit, not the student's (Nancy B) */
        g.c.set(done.submittedAt + 1000);
        await EXAM.resetSession(g.st, Object.assign({ retake: true }, me), g.o);
        const late = EXAM.fromDocument(await g.st.get(g.sid));
        g.c.set(late.expiresAt);
        const zero = await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        const zs = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(zs.autoSubmitted && EXAM.recordOf(zs).submittedAt === done.submittedAt && zero.standing && zero.standing.why === 'attemptAbandoned',
            'a submit at the clock\'s end is not the student\'s: the earlier grade stands, and the submit reply says so');
        const again2 = await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        t.check(again2.alreadySubmitted && again2.standing && again2.standing.why === 'attemptAbandoned', 'an already-submitted reply carries the standing grade too');
    }
    {
        /* an admin new lab voids a submitted attempt for a platform fault: it never stands (Nancy #3) */
        const g = await fresh('rt-b');
        await EXAM.submitExam(g.st, { sessionId: g.sid }, g.o);
        await EXAM.resetSession(g.st, { sessionId: g.sid, callerUid: 'adm', targetUid: 'rt-b', token: ADMIN_TOKEN, adminEmails: ADMINS, reason: 'outage', evidence: 'INC-9' }, g.o);
        const v = EXAM.fromDocument(await g.st.get(g.sid));
        t.check(!v.submittedAt && !v.standing && EXAM.recordOf(v) === null, 'an admin void leaves no standing grade from the voided attempt');
    }

    /* ═══ mayReset (R6) ═══════════════════════════════════════════════════════════════════════ */
    {
        const open = { submittedAt: null, handedOverAt: null, expiresAt: 2e12, lineage: { selfResets: 0 } };
        t.check(EXAM.mayReset('u', 'u', {}, ADMINS, open, 1e12) === 'self', 'mayReset: own open sitting');
        t.check(EXAM.mayReset('u', 'u', {}, ADMINS, Object.assign({}, open, { submittedAt: 1 }), 1e12) === 'retake', 'mayReset: own submitted sitting is a retake');
        t.check(EXAM.mayReset('u', 'u', ADMIN_TOKEN, ADMINS, Object.assign({}, open, { submittedAt: 1 }), 1e12) === 'retake', 'mayReset: an admin\'s own submitted sitting is a retake, not an admin reset');
        t.check(EXAM.mayReset('v', 'u', {}, ADMINS, Object.assign({}, open, { submittedAt: 1 }), 1e12) === false, 'mayReset: someone else\'s submitted sitting denied');
        t.check(EXAM.mayReset('u', 'v', { handler: true }, ADMINS, open, 1e12) === false, 'mayReset: handler denied');
        t.check(EXAM.mayReset('u', 'v', ADMIN_TOKEN, ADMINS, open, 1e12) === 'admin', 'mayReset: admin');
        t.check(EXAM.mayReset('u', 'v', OPERATOR_TOKEN, ADMINS, open, 1e12) === 'admin', 'mayReset: a verified allowlisted email is admin');
        t.check(EXAM.mayReset('u', 'v', { email: 'ops@example.test', email_verified: false }, ADMINS, open, 1e12) === false
            && EXAM.mayReset('u', 'v', { email: 'ops@example.test' }, ADMINS, open, 1e12) === false, 'mayReset: an unverified allowlisted email is not admin (Mallory F4)');
        t.check(EXAM.mayReset('', '', ADMIN_TOKEN, ADMINS, open, 1e12) === false, 'mayReset: empty uids denied');
    }

    t.done();
})().catch((e) => { console.log('FATAL ' + (e && e.stack)); process.exitCode = 2; });
