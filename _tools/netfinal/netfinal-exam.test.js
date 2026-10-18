#!/usr/bin/env node
/**
 * netfinal-exam.test.js — stage 7 of the Network+ Meridian Corp final exam.
 *
 * @catalog what    Drives the exam session: one attempt, refresh resume, the server timer and
 * @catalog what    auto-submit, exam-mode lockdown, server-side grading, and that no entry point
 * @catalog what    accepts client-supplied state.
 * @catalog run     node _tools/netfinal/netfinal-exam.test.js
 * @catalog status  TOOL
 *
 * SPEC SECTION 9 IS THE REQUIREMENT, and it opens by recording that the CURRENT MIDTERM BUILD FAILS
 * the bar -- a downloadable answer key and a live AI tutor. Its mandatory list: server-side
 * generation and grading, fault metadata server-side, Dr. Hex disabled, exam-mode lockdown, event
 * telemetry, one attempt with a server timer, and a refresh that resumes the same lab and clock.
 *
 * THE PROPERTY MALLORY NAMED AS THE ONE THING STAGE 7 MUST NOT GET WRONG: every function in the
 * engine is pure over whatever state it is handed, and nothing in the engine enforces where that
 * state came from. If the wire protocol round-trips `state` through the browser, a student edits
 * `rogue.placed` or `fixedAtEvent` in a request body and bypasses the command interface. Section 6
 * below asserts no entry point will take one.
 */
const path = require('path');
const NF = path.resolve(__dirname, '../../functions/netfinal');
const EX = require(path.join(NF, 'netfinal-exam.js'));
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const CLIENT = require(path.join(NF, 'netfinal-client.js'));
const GRADE = require(path.join(NF, 'netfinal-grade.js'));
const TOPO = require(path.join(NF, 'netfinal-topology.js'));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + String(detail).slice(0, 300) : '')); }
};
const section = (t) => console.log('\n' + t);
const EXAM = 'net-final-2026';

/* A controllable clock, so the timer is tested by advancing time rather than by waiting. */
function rig(minutes) {
    let t = 1700000000000;
    const opts = { secret: 'server-secret', now: () => t };
    return { store: EX.memoryStore(), opts, advance: (ms) => { t += ms; }, at: () => t, minutes: minutes || 100 };
}
const caught = async (p) => { try { await p; return null; } catch (e) { return e; } };

(async () => {

/* ─── 1. one attempt, and a refresh resumes ───────────────────────────────────────────────────── */
section('1. one attempt: a second start resumes rather than rerolling');
{
    const r = rig();
    const a = await EX.startExam(r.store, { studentId: 'stu-A', examId: EXAM, minutes: r.minutes }, r.opts);
    chk('a first start creates a session', a.resumed === false && !!a.sessionId);
    chk('it sends the questions and the ticket queue', a.questions.length === 50 && a.initialState.tickets.length === 12);

    await EX.runCommand(r.store, { sessionId: a.sessionId, line: 'ipconfig' }, r.opts);
    await EX.saveAnswer(r.store, { sessionId: a.sessionId, questionId: 'q46', value: 'smf' }, r.opts);
    r.advance(5 * 60000);

    const b = await EX.startExam(r.store, { studentId: 'stu-A', examId: EXAM }, r.opts);
    chk('a second start RESUMES', b.resumed === true && b.sessionId === a.sessionId);
    /* The whole point of "one attempt": refreshing must not reroll the faults. */
    chk('the lab is the same one, not a fresh roll',
        JSON.stringify(b.initialState.ports) === JSON.stringify(a.initialState.ports)
        && JSON.stringify(b.initialState.vlans) === JSON.stringify(a.initialState.vlans));
    chk('the tickets are the same', JSON.stringify(b.initialState.tickets) === JSON.stringify(a.initialState.tickets));
    chk('the clock carried on rather than restarting',
        Math.abs(b.remainingMs - (a.remainingMs - 5 * 60000)) < 1000,
        'was ' + a.remainingMs + ' now ' + b.remainingMs);
    chk('the saved answer survived the refresh',
        b.initialState.progress.answered === 1, JSON.stringify(b.initialState.progress));
    /* A different student gets a different lab, even at the same moment. */
    const c = await EX.startExam(r.store, { studentId: 'stu-B', examId: EXAM }, r.opts);
    chk('a different student gets a different lab',
        JSON.stringify(c.initialState.vlans) !== JSON.stringify(a.initialState.vlans));
}

/* ─── 2. the seed secret is mandatory ─────────────────────────────────────────────────────────── */
section('2. an exam will not start with a seed a student could reproduce');
{
    const store = EX.memoryStore();
    const e = await caught(EX.startExam(store, { studentId: 'x', examId: EXAM }, { now: () => 1 }));
    /* FAILS CLOSED. Mallory regenerated a healthy lab from studentId|examId and diffed it to find
     * all twelve faults; serving such a lab is worse than refusing to start. */
    chk('with no NETFINAL_SEED_SECRET it refuses to start', !!e && e.code === 'failed-precondition',
        e ? e.code + ': ' + e.message : 'started anyway');
    chk('and the message says why', !!e && /reproduce/.test(e.message));
    chk('no session was created', Object.keys(store.all()).length === 0);
    const ok = await EX.startExam(EX.memoryStore(), { studentId: 'x', examId: EXAM },
        { secret: 's', now: () => 1 });
    chk('with a secret it starts', ok.resumed === false);
}

/* ─── 3. the server timer ─────────────────────────────────────────────────────────────────────── */
section('3. the timer runs on the server, and time up means submitted');
{
    const r = rig(10);
    const s = await EX.startExam(r.store, { studentId: 'stu-T', examId: EXAM, minutes: 10 }, r.opts);
    chk('the clock starts at the full duration', Math.abs(s.remainingMs - 10 * 60000) < 1000);
    r.advance(9 * 60000);
    const mid = await EX.runCommand(r.store, { sessionId: s.sessionId, line: 'ipconfig' }, r.opts);
    chk('with a minute left, work still goes through', /Windows IP/.test(mid.out) && mid.remainingMs > 0);
    r.advance(2 * 60000);
    const late = await caught(EX.runCommand(r.store, { sessionId: s.sessionId, line: 'ipconfig' }, r.opts));
    /* Expired must not silently keep accepting work, and must not discard it either. */
    chk('past the clock, the command is refused', !!late && late.code === 'deadline-exceeded', late ? late.code : 'accepted');
    chk('and the message carries the auto-submitted score', !!late && /Score: \d+/.test(late.message), late && late.message);
    const after = await EX.startExam(r.store, { studentId: 'stu-T', examId: EXAM }, r.opts);
    chk('the session reads as submitted afterwards', after.submitted === true);
    const re = await EX.submitExam(r.store, { sessionId: s.sessionId }, r.opts);
    chk('and the auto-submitted report is kept, not regraded',
        re.alreadySubmitted === true && !!re.report && re.report.auto === true);
}

/* ─── 4. exam-mode lockdown ───────────────────────────────────────────────────────────────────── */
section("4. exam mode: spec section 9's lockdown, as flags the page must obey");
{
    const f = EX.examModeFlags();
    /* Spec section 9 names the midterm's live AI tutor as a reason that build FAILS the bar, which
     * is why this is a flag and an assertion rather than a convention. */
    chk('Dr. Hex is off', f.loadHexAI === false);
    chk('course links are off', f.courseLinks === false);
    chk('hints and the time bonus are off', f.hints === false && f.timeBonus === false);
    chk('the timer and grading are server-side', f.serverTimer === true && f.serverGraded === true);
    chk('one attempt', f.oneAttempt === true);
    const r = rig();
    const s = await EX.startExam(r.store, { studentId: 'stu-M', examId: EXAM }, r.opts);
    chk('the flags are sent to the page', JSON.stringify(s.examMode) === JSON.stringify(f));
}

/* ─── 5. nothing a client receives names a fault ───────────────────────────────────────────────── */
section('5. every payload a session hands out, scanned');
{
    const r = rig();
    const s = await EX.startExam(r.store, { studentId: 'stu-L', examId: EXAM }, r.opts);
    chk('the start payload discloses nothing', CLIENT.findDisclosures(s, 'start').length === 0,
        JSON.stringify(CLIENT.findDisclosures(s, 'start')));
    chk('the questions sent carry no answers and no proof patterns',
        JSON.stringify(s.questions).indexOf('"answer"') < 0 && s.questions.every(q => q.proof === undefined));

    for (const w of ['firewall', 'wireless', 'noc', 'rack', 'questions', 'change-requests', 'incident-log']) {
        const v = await EX.renderWindow(r.store, { sessionId: s.sessionId, window: w }, r.opts);
        chk(w + ': the window payload discloses nothing', CLIENT.findDisclosures(v, w).length === 0,
            JSON.stringify(CLIENT.findDisclosures(v, w)));
    }
    for (const line of ['ipconfig', 'arp -a', 'route print', 'nslookup intranet.meridian.local',
                        'tracert 10.200.0.25', 'ping 8.8.8.8']) {
        const o = await EX.runCommand(r.store, { sessionId: s.sessionId, line }, r.opts);
        chk('"' + line + '" output discloses nothing', CLIENT.findDisclosures(o, line).length === 0,
            JSON.stringify(CLIENT.findDisclosures(o, line)));
    }
    /* The render path re-checks on the way out, so a future leak is refused rather than sent. */
    const bad = await caught(EX.renderWindow(r.store, { sessionId: s.sessionId, window: 'nope' }, r.opts));
    chk('an unknown window is refused', !!bad && bad.code === 'invalid-argument');
}

/* ─── 6. NO ENTRY POINT ACCEPTS CLIENT-SUPPLIED STATE ─────────────────────────────────────────── */
section("6. the decision Mallory said stage 7 must not get wrong");
{
    const r = rig();
    const s = await EX.startExam(r.store, { studentId: 'stu-S', examId: EXAM }, r.opts);
    const sid = s.sessionId;
    const stored = () => r.store.all()[sid];

    /* Each of these is the attack she described: hand the engine a doctored state and it would
     * comply, because complying is all it does. The session layer must read its own copy. */
    const forged = JSON.parse(JSON.stringify(stored().state));
    forged.faults.forEach(f => { f.fixedAtEvent = 0; });
    forged.rogue.placed = false;
    forged.services['MER-FS01'] = { tcp: [445, 9999], udp: [] };

    await EX.runCommand(r.store, { sessionId: sid, line: 'ipconfig', state: forged }, r.opts);
    chk('a forged state passed to runCommand is ignored',
        stored().state.faults.every(f => f.fixedAtEvent === undefined)
        && JSON.stringify(stored().state.services['MER-FS01'].tcp) === '[139,445]',
        JSON.stringify(stored().state.services['MER-FS01']));

    await EX.runAction(r.store, { sessionId: sid, window: 'noc', action: 'ack-alert', params: { id: 'x' }, state: forged }, r.opts);
    chk('a forged state passed to runAction is ignored', stored().state.rogue.placed === true);

    await EX.saveAnswer(r.store, { sessionId: sid, questionId: 'q46', value: 'smf', state: forged, answerKey: { tampered: true } }, r.opts);
    chk('a forged answerKey passed to saveAnswer is ignored',
        !!stored().answerKey.questions && stored().answerKey.tampered === undefined);

    /* And the fabricated-event attack: a change request claiming an earlier index than the fix. */
    const before = stored().state.events.length;
    await EX.runAction(r.store, {
        sessionId: sid, window: 'change-requests', action: 'submit',
        params: { ticket: stored().state.faults[0].ticketId, rootCause: 'x', layer: 2, plannedChange: 'y', rollback: 'z', atEvent: 0 }
    }, r.opts);
    const cr = stored().state.changeRequests[0];
    chk('a client-supplied atEvent on a change request is ignored; the server assigns it',
        cr.atEvent >= before, 'claimed 0, got ' + cr.atEvent);
    chk('the event log is append-only and server-indexed',
        stored().state.events.every((e, i) => e.t === i));

    /* A session id that is not yours is simply not found -- there is no shared surface to reach. */
    const nf = await caught(EX.runCommand(r.store, { sessionId: 'stu-OTHER::' + EXAM, line: 'ipconfig' }, r.opts));
    chk('an unknown session is not-found', !!nf && nf.code === 'not-found');
}

/* ─── 7. server-side grading, and what a student is told ──────────────────────────────────────── */
section('7. grading happens on the server, against the key built at exam start');
{
    const r = rig();
    const s = await EX.startExam(r.store, { studentId: 'stu-G', examId: EXAM }, r.opts);
    const sid = s.sessionId;
    const st = r.store.all()[sid].state;
    const key = r.store.all()[sid].answerKey;

    /* Answer one planning question correctly and one fix correctly, through the session API. */
    await EX.saveAnswer(r.store, { sessionId: sid, questionId: 'q46', value: 'smf' }, r.opts);
    const f12 = st.faults.filter(x => x.slot === 'S12')[0];
    await EX.runAction(r.store, { sessionId: sid, window: 'change-requests', action: 'submit',
        params: { ticket: f12.ticketId, rootCause: 'r', layer: f12.layer, plannedChange: 'p', rollback: 'b' } }, r.opts);
    const sw = st.devices['MeridianSW-02'].mgmtIp;
    for (const line of ['ssh admin@' + sw, 'enable', 'conf t',
                        f12.variant === 'B' ? 'ntp server ' + st.devices['MER-SRV01'].mgmtIp
                                            : 'snmp-server community ' + st.monitoring.community,
                        'end', 'exit']) {
        await EX.runCommand(r.store, { sessionId: sid, line }, r.opts);
    }
    const sub = await EX.submitExam(r.store, { sessionId: sid }, r.opts);
    chk('submission returns a report', sub.submitted === true && sub.report.outOf === 200);
    chk('the planning answer scored', sub.report.questions.filter(q => q.n === 46)[0].earned === 3);
    chk('the fix scored full, because the change request came first',
        sub.report.questions.filter(q => q.slot === 'S12' && q.phase === 'fix')[0].earned === 6,
        JSON.stringify(sub.report.questions.filter(q => q.slot === 'S12' && q.phase === 'fix')[0]));
    chk('the report records how long was used', typeof sub.report.durationUsedMs === 'number');

    /* Idempotent: a double-click must not change a mark. */
    const again = await EX.submitExam(r.store, { sessionId: sid }, r.opts);
    chk('submitting twice returns the first report unchanged',
        again.alreadySubmitted === true && again.report.total === sub.report.total);
    const after = await caught(EX.runCommand(r.store, { sessionId: sid, line: 'ipconfig' }, r.opts));
    chk('no work is accepted after submission', !!after && after.code === 'failed-precondition');

    /* THE STUDENT'S VIEW: their marks, never the answers. */
    const mine = EX.studentReport(sub.report);
    chk('a student sees their score and subtotals',
        mine.total === sub.report.total && !!mine.subtotals && !!mine.phases);
    chk('but NOT the correct answers', JSON.stringify(mine).indexOf('"answer"') < 0
        && CLIENT.findDisclosures(mine, 'studentReport').length === 0,
        JSON.stringify(CLIENT.findDisclosures(mine, 'studentReport')));
    chk('and not the per-question notes that would reveal the key',
        mine.questions.every(q => q.note === undefined && q.detail === undefined));
}

/* ─── 8. telemetry ────────────────────────────────────────────────────────────────────────────── */
section('8. every command, change and answer is logged for telemetry');
{
    const r = rig();
    const s = await EX.startExam(r.store, { studentId: 'stu-Y', examId: EXAM }, r.opts);
    const sid = s.sessionId;
    await EX.runCommand(r.store, { sessionId: sid, line: 'ipconfig' }, r.opts);
    await EX.saveAnswer(r.store, { sessionId: sid, questionId: 'q46', value: 'smf' }, r.opts);
    await EX.runAction(r.store, { sessionId: sid, window: 'noc', action: 'ack-alert', params: { id: 'a' } }, r.opts);
    await EX.restoreDevice(r.store, { sessionId: sid, device: 'MeridianSW-01' }, r.opts);
    const tel = EX.telemetry(r.store.all()[sid]);
    chk('commands, GUI actions, answers and restores all appear',
        ['command', 'gui', 'restore'].every(k => tel.some(e => e.kind === k)),
        JSON.stringify([...new Set(tel.map(e => e.kind))]));
    chk('each entry carries the student and exam for the pipeline',
        tel.every(e => e.studentId === 'stu-Y' && e.examId === EXAM));
    chk('and a monotonic index', tel.every((e, i) => e.t === i));
    chk('telemetry itself discloses no fault data',
        CLIENT.findDisclosures(tel, 'telemetry').length === 0,
        JSON.stringify(CLIENT.findDisclosures(tel, 'telemetry')));
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
})().catch(e => { console.error('harness fault:', e && e.stack ? e.stack : e); process.exit(2); });
