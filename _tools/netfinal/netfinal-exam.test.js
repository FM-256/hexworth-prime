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
const EXAMS = require(path.join(NF, 'netfinal-exams.js'));
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

/* ─── ONE ATTEMPT MEANS ONE LAB, NOT ONE LAB PER STRING THE CALLER INVENTS ──────────────────────
 *
 * The session is addressed as uid + '::' + examId and the seed is secret|studentId|examId, so a new
 * examId is a whole new exam: new faults, new clock, new answer key, under an id that cannot collide
 * with the real session. The callable validated examId with a FORMAT regex, which decides whether a
 * string is well-formed and nothing about whether that exam exists -- so `{examId:'attempt2'}` from
 * devtools bought a second attempt, 'attempt3' a third.
 *
 * This suite could not see it: every call here passed the one EXAM constant, so "a second start
 * returns the same session" was only ever tested for callers who cooperate. The rule now lives in
 * netfinal-exams.js, which is why it can be tested at all. */
section('one attempt is enforced on the exam IDENTITY, not on the caller’s goodwill');
{
    chk('the allowlist names exactly one exam today',
        EXAMS.EXAM_IDS.length === 1 && EXAMS.EXAM_IDS[0] === 'net-final-2026',
        JSON.stringify(EXAMS.EXAM_IDS));
    chk('the canonical id resolves to itself',
        EXAMS.resolveExamId('net-final-2026') === 'net-final-2026');
    chk('an omitted id falls back to the default rather than failing',
        EXAMS.resolveExamId(undefined) === EXAMS.DEFAULT_EXAM_ID
        && EXAMS.resolveExamId('') === EXAMS.DEFAULT_EXAM_ID);
    /* The exact strings that bought extra attempts. */
    ['attempt2', 'attempt3', 'net-final-2027', 'NET-FINAL-2026', 'net final 2026', 'x'].forEach(bad => {
        chk('a fabricated examId is refused: ' + JSON.stringify(bad), EXAMS.resolveExamId(bad) === null);
    });
    chk('a format-valid but unknown id is refused, which is the whole point',
        /^[A-Za-z0-9_-]{1,64}$/.test('attempt2') && EXAMS.resolveExamId('attempt2') === null,
        'attempt2 passes the old regex, so the regex was never the rule');

    /* And the engine still gives ONE session per (student, allowed exam). */
    const r = rig();
    const a = await EX.startExam(r.store, { studentId: 'one-shot', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    const b = await EX.startExam(r.store, { studentId: 'one-shot', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    chk('a second start on the allowed id resumes rather than regenerating',
        b.resumed === true && b.sessionId === a.sessionId, JSON.stringify([a.sessionId, b.sessionId]));
    chk('and only one session exists in the store', Object.keys(r.store.all()).length === 1,
        JSON.stringify(Object.keys(r.store.all())));

    /* THE CONTROL. The engine itself will happily build a second lab for a second examId -- it has
     * no opinion about which exams exist. That is exactly why the allowlist sits at the callable,
     * and this asserts the engine's behaviour so nobody later "fixes" the wrong layer. */
    const two = await EX.startExam(r.store, { studentId: 'one-shot', examId: 'some-other-exam' }, r.opts);
    chk('the ENGINE does build a separate lab for a different examId (hence the allowlist above)',
        two.resumed === false && two.sessionId !== a.sessionId, two.sessionId);
}

/* ─── CONCURRENCY: a lost write loses graded evidence ───────────────────────────────────────────── */
section('two calls on one session cannot silently overwrite each other');
{
    const r = rig();
    const s0 = await EX.startExam(r.store, { studentId: 'race', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    const sid = s0.sessionId;

    /* Both read the SAME revision, then both write. Under the old read-modify-write this passed
     * silently and the first mutation vanished -- including, potentially, a verify command the
     * student watched echo in their terminal and which never reached the event log the grader reads
     * for Q39-42. */
    const before = (await r.store.get(sid)).state.events.length;
    const [first, second] = await Promise.allSettled([
        EX.runCommand(r.store, { sessionId: sid, line: 'ipconfig' }, r.opts),
        EX.runCommand(r.store, { sessionId: sid, line: 'arp -a' }, r.opts)
    ]);
    const outcomes = [first, second];
    const fulfilled = outcomes.filter(o => o.status === 'fulfilled');
    const rejected = outcomes.filter(o => o.status === 'rejected');
    chk('exactly one of two concurrent commands wins',
        fulfilled.length === 1 && rejected.length === 1,
        JSON.stringify(outcomes.map(o => o.status)));
    chk('the loser is told to retry, not given a false success',
        rejected.length === 1 && rejected[0].reason && rejected[0].reason.code === 'aborted',
        rejected.length ? String(rejected[0].reason && rejected[0].reason.code) : 'nothing rejected');
    const afterSession = await r.store.get(sid);
    chk('the winner’s work is in the stored event log',
        afterSession.state.events.length > before,
        before + ' -> ' + afterSession.state.events.length);
    /* `rev` lives on the SESSION, not on the lab state inside it. */
    chk('the revision advanced exactly once', Number(afterSession.rev) === 1, String(afterSession.rev));

    /* Sequentially, both must land -- the guard must not cost a student their work under normal use.
     * A fix that made every second command fail would also pass the assertions above. */
    const r2 = rig();
    const s2 = await EX.startExam(r2.store, { studentId: 'serial', examId: EXAMS.DEFAULT_EXAM_ID }, r2.opts);
    await EX.runCommand(r2.store, { sessionId: s2.sessionId, line: 'ipconfig' }, r2.opts);
    await EX.runCommand(r2.store, { sessionId: s2.sessionId, line: 'arp -a' }, r2.opts);
    await EX.saveAnswer(r2.store, { sessionId: s2.sessionId, questionId: 'q46', value: 'smf' }, r2.opts);
    const st2 = await r2.store.get(s2.sessionId);
    chk('three sequential calls all landed, and the revision counted all three',
        Number(st2.rev) === 3, 'rev=' + st2.rev);
    chk('and the answer survived', !!(st2.state.answers && st2.state.answers.q46),
        JSON.stringify(st2.state.answers));

    /* A double-clicked Submit must grade once and report the same score twice, never regrade. */
    const r3 = rig();
    const s3 = await EX.startExam(r3.store, { studentId: 'dbl', examId: EXAMS.DEFAULT_EXAM_ID }, r3.opts);
    const subs = await Promise.allSettled([
        EX.submitExam(r3.store, { sessionId: s3.sessionId }, r3.opts),
        EX.submitExam(r3.store, { sessionId: s3.sessionId }, r3.opts)
    ]);
    const ok = subs.filter(x => x.status === 'fulfilled').map(x => x.value);
    chk('a double submit never rejects: one submits, the other reports it already was',
        subs.every(x => x.status === 'fulfilled')
        && ok.filter(v => v.submitted).length === 1
        && ok.filter(v => v.alreadySubmitted).length === 1,
        JSON.stringify(subs.map(x => x.status === 'fulfilled'
            ? (x.value.submitted ? 'submitted' : 'already') : 'rejected:' + (x.reason && x.reason.code))));
    chk('and both report the same score, so nothing was regraded',
        ok[0].report && ok[1].report && ok[0].report.total === ok[1].report.total,
        JSON.stringify(ok.map(v => v.report && v.report.total)));
}

/* ─── a read is not a write ─────────────────────────────────────────────────────────────────────── */
section('rendering a window claims no revision, because it changes nothing');
{
    /* GUI.render is pure, but renderWindow went through the WRITING path: every window the student
     * opened, and the refresh the page fires after every single action, bumped `rev` and ran a full
     * transactional write. Reads contended with real writes for a revision they had no reason to
     * hold, widening the collision surface the compare-and-set exists to narrow. */
    const r = rig();
    const s0 = await EX.startExam(r.store, { studentId: 'reads', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    const sid = s0.sessionId;
    const revOf = async () => Number((await r.store.get(sid)).rev || 0);

    const start = await revOf();
    for (const w of ['noc', 'firewall', 'rack', 'wireless', 'incident-log', 'change-requests']) {
        await EX.renderWindow(r.store, { sessionId: sid, window: w }, r.opts);
    }
    chk('six window renders moved the revision not at all',
        (await revOf()) === start, start + ' -> ' + (await revOf()));

    /* THE CONTROL: a write still does move it, so the check above is not passing because nothing
     * writes at all. */
    await EX.runCommand(r.store, { sessionId: sid, line: 'ipconfig' }, r.opts);
    chk('a command still advances it, so reads are what is exempt',
        (await revOf()) === start + 1, start + ' -> ' + (await revOf()));

    /* And reads must not conflict -- with each other, or with a concurrent write. */
    const mixed = await Promise.allSettled([
        EX.renderWindow(r.store, { sessionId: sid, window: 'noc' }, r.opts),
        EX.renderWindow(r.store, { sessionId: sid, window: 'rack' }, r.opts),
        EX.renderWindow(r.store, { sessionId: sid, window: 'firewall' }, r.opts),
        EX.runCommand(r.store, { sessionId: sid, line: 'arp -a' }, r.opts)
    ]);
    chk('three concurrent reads and one write all succeed',
        mixed.every(x => x.status === 'fulfilled'),
        JSON.stringify(mixed.map(x => x.status === 'fulfilled' ? 'ok' : String(x.reason && x.reason.code))));

    /* A read still enforces the gates that are not about writing. */
    const expiredRig = rig(1);
    const se = await EX.startExam(expiredRig.store,
        { studentId: 'reads-exp', examId: EXAMS.DEFAULT_EXAM_ID, minutes: 1 }, expiredRig.opts);
    expiredRig.advance(61 * 1000);
    const late = await (async () => {
        try { await EX.renderWindow(expiredRig.store, { sessionId: se.sessionId, window: 'noc' }, expiredRig.opts); return null; }
        catch (e) { return e; }
    })();
    chk('a read after the clock expires is refused and auto-submits, like any other call',
        !!late && late.code === 'deadline-exceeded', late ? late.code : 'no error');
    chk('and that auto-submission was recorded',
        !!(await expiredRig.store.get(se.sessionId)).submittedAt);
}

/* ─── a refresh must resume the ANSWERS, not just the lab and the clock ─────────────────────────── */
section('a resume carries the student’s saved answers back');
{
    /* Spec section 9: "a browser refresh resumes the same lab and the same clock". The lab and the
     * clock resumed. The answers were never sent back -- they were safe in state.answers the whole
     * time, but the page had nothing to restore from, so every field came up blank.
     *
     * For a single text box that was re-entry. For Q24's two fields it was DATA LOSS: both controls
     * post together, so re-picking the ACL after a refresh posted the name with a BLANK sequence and
     * overwrote a complete, credited answer with a half-credit one. */
    const r = rig();
    const a = await EX.startExam(r.store, { studentId: 'resume-ans', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    chk('a fresh start returns an answers map, empty but present',
        !!a.answers && typeof a.answers === 'object' && Object.keys(a.answers).length === 0,
        JSON.stringify(a.answers));

    await EX.saveAnswer(r.store, { sessionId: a.sessionId, questionId: 'q46', value: 'smf' }, r.opts);
    await EX.saveAnswer(r.store, { sessionId: a.sessionId, questionId: 'q24',
        value: { name: 'GUEST-IN', seq: '10' } }, r.opts);

    const b = await EX.startExam(r.store, { studentId: 'resume-ans', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    chk('the refresh resumed rather than regenerating', b.resumed === true);
    /* GUARDED, so a MISSING answers map reports as a failed assertion rather than crashing the
     * suite on a property of undefined. Removing the resume path's `answers:` line was caught -- the
     * suite died -- but it died as a harness fault, which reads like a broken test rather than a
     * caught defect, and a mutation run counting FAIL lines scored it as missed. */
    chk('the resume envelope carries an answers map at all',
        !!b.answers && typeof b.answers === 'object', JSON.stringify(b.answers));
    chk('a single-value answer comes back',
        !!b.answers && b.answers.q46 === 'smf', JSON.stringify(b.answers));
    /* THE SCENARIO THAT COST HALF A QUESTION: both halves of the pair must survive the refresh, or
     * the page cannot put them back and the next edit posts a blank beside the one just touched. */
    chk('BOTH halves of the two-field answer come back',
        !!(b.answers && b.answers.q24) && b.answers.q24.name === 'GUEST-IN'
        && b.answers.q24.seq === '10', JSON.stringify(b.answers && b.answers.q24));
    chk('the answers map covers every question answered and nothing else',
        Object.keys(b.answers || {}).sort().join(',') === 'q24,q46',
        JSON.stringify(Object.keys(b.answers || {})));

    /* It is the STUDENT'S value, not the key: an answer they got wrong comes back exactly as wrong. */
    await EX.saveAnswer(r.store, { sessionId: a.sessionId, questionId: 'q24',
        value: { name: 'SERVERS-OUT', seq: '999' } }, r.opts);
    const c = await EX.startExam(r.store, { studentId: 'resume-ans', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    chk('a wrong answer resumes as the wrong answer, uncorrected',
        !!(c.answers && c.answers.q24) && c.answers.q24.name === 'SERVERS-OUT'
        && c.answers.q24.seq === '999', JSON.stringify(c.answers && c.answers.q24));
    chk('and the resumed envelope still discloses nothing',
        CLIENT.findDisclosures(c, 'resume').length === 0,
        JSON.stringify(CLIENT.findDisclosures(c, 'resume').slice(0, 3)));

    /* savedAnswers is exported and is the one place this projection happens. */
    chk('savedAnswers is exported and returns values, not the stored wrapper', (() => {
        const st = { answers: { q1: { value: 'x', atEvent: 3 }, q2: { value: { a: 1 }, atEvent: 4 } } };
        const out = EX.savedAnswers(st);
        return out.q1 === 'x' && JSON.stringify(out.q2) === '{"a":1}' && !('atEvent' in out);
    })(), JSON.stringify(EX.savedAnswers({ answers: { q1: { value: 'x', atEvent: 3 } } })));
    chk('and it is empty, not undefined, for a lab with no answers',
        JSON.stringify(EX.savedAnswers({})) === '{}' && JSON.stringify(EX.savedAnswers({ answers: {} })) === '{}');
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
})().catch(e => { console.error('harness fault:', e && e.stack ? e.stack : e); process.exit(2); });
