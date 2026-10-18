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

/* Did this session's clock run out? Asked by driving a real call and reading the error code, rather
 * than recomputing the arithmetic the code under test uses. */
async function expired(r, sessionId) {
    try { await EX.renderWindow(r.store, { sessionId: sessionId, window: 'noc' }, r.opts); return false; }
    catch (e) { return e && e.code === 'deadline-exceeded'; }
}
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

/* ─── THE CLOCK'S LENGTH IS NOT THE CLIENT'S TO CHOOSE ─────────────────────────────────────────── */
section('the exam duration is server-declared, and clamped whatever a caller sends');
{
    /* `netfinalStart` forwarded `c.data.minutes` into startExam, which multiplied it by 60000 and
     * stored it as durationMs -- the field the expiry check reads on every later call. No ceiling.
     * A student calling the callable from devtools before the page's own call got:
     *
     *   startExam(store, { studentId, examId, minutes: 999999999 })
     *     -> remainingMs 59999999939998, durationMs stored 59999999940000   (694,444 days)
     *
     * permanently, because resume returns the same session with the duration fixed at creation. Spec
     * section 9 says the timer runs on the SERVER; a timer whose length the client picks does not.
     *
     * Same defect as the examId format check, in the same file, found by a different reviewer hours
     * later: a client value trusted into session state. Same remedy -- which exams exist and how long
     * they run are both server knowledge, so they live together. */
    chk('the server declares a duration for the real exam',
        EXAMS.durationMinutes(EXAMS.DEFAULT_EXAM_ID) === 120,
        String(EXAMS.durationMinutes(EXAMS.DEFAULT_EXAM_ID)));
    chk('and an unknown id still gets a finite fallback rather than undefined',
        EXAMS.durationMinutes('no-such-exam') === EXAMS.FALLBACK_MINUTES);

    /* THE EXACT PAYLOAD FROM THE AUDIT, plus the neighbours that break naive clamps. */
    const cases = [
        [999999999, EXAMS.MAX_MINUTES, 'the reproduced exploit'],
        [1e12, EXAMS.MAX_MINUTES, 'bigger still'],
        [EXAMS.MAX_MINUTES + 1, EXAMS.MAX_MINUTES, 'one over the ceiling'],
        [EXAMS.MAX_MINUTES, EXAMS.MAX_MINUTES, 'exactly the ceiling is allowed'],
        [100, 100, 'the spec pilot length passes through'],
        [1, 1, 'the floor is allowed, for the expiry tests'],
        [0, EXAMS.FALLBACK_MINUTES, 'zero is not a duration'],
        [-5, EXAMS.FALLBACK_MINUTES, 'negative is not a duration'],
        [NaN, EXAMS.FALLBACK_MINUTES, 'NaN'],
        [Infinity, EXAMS.FALLBACK_MINUTES, 'Infinity'],
        ['600', EXAMS.MAX_MINUTES, 'a numeric STRING is still clamped, not concatenated'],
        [undefined, EXAMS.FALLBACK_MINUTES, 'omitted'],
        [null, EXAMS.FALLBACK_MINUTES, 'null'],
        [{}, EXAMS.FALLBACK_MINUTES, 'an object']
    ];
    cases.forEach(([given, want, why]) => {
        chk('clampMinutes(' + JSON.stringify(given) + ') === ' + want + '  (' + why + ')',
            EXAMS.clampMinutes(given) === want, String(EXAMS.clampMinutes(given)));
    });

    /* END TO END: the engine stores a clamped duration no matter what it is handed, because a guard
     * that only exists at the callable is one a new caller removes without noticing. */
    const r = rig();
    const forged = await EX.startExam(r.store,
        { studentId: 'clock-forger', examId: EXAMS.DEFAULT_EXAM_ID, minutes: 999999999 }, r.opts);
    const stored = await r.store.get(forged.sessionId);
    chk('a forged minutes value does not reach the stored session',
        stored.durationMs === EXAMS.MAX_MINUTES * 60000,
        stored.durationMs + 'ms = ' + (stored.durationMs / 86400000).toFixed(2) + ' days');
    chk('and the envelope it returns agrees with what was stored',
        forged.remainingMs <= EXAMS.MAX_MINUTES * 60000, String(forged.remainingMs));
    chk('the forged exam still EXPIRES, which is the property that was lost', (() => {
        r.advance(EXAMS.MAX_MINUTES * 60000 + 1000);
        return expired(r, forged.sessionId);
    })(), 'it did not expire after the maximum duration');

    /* AND THE CALLABLE DOES NOT FORWARD A CLIENT VALUE AT ALL -- the first layer. Asserted against
     * the source, because this suite cannot invoke onCall wrappers. */
    const idx = require('fs').readFileSync(path.join(NF, '..', 'index.js'), 'utf8');
    chk('netfinalStart does not read minutes from the request',
        !/minutes: c\.data\.minutes/.test(idx),
        'c.data.minutes is back in the start callable');
    chk('it passes the SERVER-declared duration instead',
        /minutes: NETFINAL_EXAMS\.durationMinutes\(c\.examId\)/.test(idx));
    chk('and no other callable forwards a numeric client field into session state',
        (idx.match(/c\.data\.(minutes|durationMs|rev|startedAt)/g) || []).length === 0,
        JSON.stringify(idx.match(/c\.data\.[a-zA-Z]+/g) || []));
}

/* ─── A CLIENT STRING MUST NEVER REACH A PROTOTYPE ─────────────────────────────────────────────── */
section('prototype keys, swept across every entry point and every position');
{
    /* THE WORST DEFECT IN THIS BUILD, found by the security audit. The GUI dispatch tables were
     * plain objects indexed directly by the request's `window` and `action`:
     *
     *     var fn = RENDERERS[window];   if (!fn) { reject }
     *     var set = ACTIONS[window];    var fn = set[action];
     *
     * `RENDERERS['constructor']` is not falsy -- it is the inherited Object constructor -- so the
     * guard passed and `fn(state)` became `Object(state)`, returning the state itself. In `act`,
     * `ACTIONS['constructor'].assign` is the real `Object.assign`, so the call became
     * `Object.assign(state, params)`. One ordinary netfinalAction returned all twelve faults with
     * their exact target host/switch/port, the exam-start baseline and `meta.seedStr`, AND persisted
     * an attacker-chosen key into the session document. `window:'firewall', action:'constructor'`
     * worked on its own, so allowlisting the window alone would not have closed it.
     *
     * THIS SWEEP IS DERIVED, not a list of the combinations that were tried. Every entry point, every
     * string position, every prototype-reachable name -- because the next one of these will be in a
     * position nobody thought of, which is exactly how this one survived seven review rounds. */
    const PROTO_KEYS = ['constructor', '__proto__', 'prototype', 'toString', 'valueOf',
        'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString',
        'assign', 'keys', 'create', 'defineProperty', 'freeze'];

    /* A response discloses if ANY of the key's protected shapes appear anywhere in it. Checked with
     * the real scanner AND by looking for the state's own top-level fields, because the scanner is
     * one of the things under test here. */
    const looksLikeState = (v) => {
        const j = JSON.stringify(v || {});
        return /"faults"|"baseline"|"answerKey"|"seedStr"|"deviceConfigs"|"violatedAtStart"/.test(j);
    };

    const r = rig();
    const s0 = await EX.startExam(r.store, { studentId: 'proto-sweep', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    const sid = s0.sessionId;

    let tried = 0;
    const leaked = [], persisted = [], polluted = [];
    const builtinsBefore = JSON.stringify([Object.keys(Object.assign), Object.keys(Object.keys)]);

    for (const k of PROTO_KEYS) {
        /* runAction: the window position, the action position, and both at once. */
        const shots = [
            { window: k, action: 'assign', params: { pwned: 'x' } },
            { window: 'firewall', action: k, params: {} },
            { window: k, action: k, params: { pwned: 'x' } },
            /* and the two client keys inside params that index state directly */
            { window: 'rack', action: 'replace-cable', params: { device: k, port: 'assign' } },
            { window: 'rack', action: 'reseat-cable', params: { device: k, port: k } },
            { window: 'wireless', action: 'ap-set-channel', params: { ap: k, channel: 6 } },
            { window: 'noc', action: 'ack-alert', params: { id: k } }
        ];
        for (const shot of shots) {
            tried++;
            let out = null;
            try { out = await EX.runAction(r.store, Object.assign({ sessionId: sid }, shot), r.opts); }
            catch (e) { out = { threw: e.code }; }
            if (looksLikeState(out) || CLIENT.findDisclosures(out, 'sweep').length) {
                leaked.push(JSON.stringify(shot));
            }
        }
        /* renderWindow and restoreDevice take one string each. */
        for (const call of [
            () => EX.renderWindow(r.store, { sessionId: sid, window: k }, r.opts),
            () => EX.restoreDevice(r.store, { sessionId: sid, device: k }, r.opts)
        ]) {
            tried++;
            let out = null;
            try { out = await call(); } catch (e) { out = { threw: e.code }; }
            if (looksLikeState(out) || CLIENT.findDisclosures(out, 'sweep').length) {
                leaked.push(k + ' (render/restore)');
            }
        }
        /* saveAnswer's question id. */
        tried++;
        try { await EX.saveAnswer(r.store, { sessionId: sid, questionId: k, value: 'x' }, r.opts); }
        catch (e) { /* refusal is the expected outcome */ }
    }

    const after = await r.store.get(sid);
    ['pwned'].forEach((bad) => {
        if (Object.prototype.hasOwnProperty.call(after.state, bad)) { persisted.push(bad); }
    });
    Object.keys(after.state.answers || {}).forEach((qid) => {
        if (PROTO_KEYS.indexOf(qid) >= 0) { persisted.push('answers.' + qid); }
    });
    if (JSON.stringify([Object.keys(Object.assign), Object.keys(Object.keys)]) !== builtinsBefore) {
        polluted.push('a global builtin gained properties');
    }

    chk('the sweep actually ran across every position (' + tried + ' calls)',
        tried === PROTO_KEYS.length * 10, String(tried));
    chk('NOTHING disclosed the lab state through any entry point or position',
        leaked.length === 0, leaked.slice(0, 4).join(' | '));
    chk('nothing a prototype key carried was persisted into the session',
        persisted.length === 0, persisted.join(', '));
    chk('no global builtin was mutated (the rack handler set properties on Object.assign)',
        polluted.length === 0, polluted.join(', '));
    chk('and the session is still usable afterwards, not wedged',
        (await EX.runCommand(r.store, { sessionId: sid, line: 'ipconfig' }, r.opts)).out.length > 0);

    /* THE CONTROL. If `runAction` started refusing everything, every assertion above would pass for
     * the wrong reason. */
    const good = await EX.runAction(r.store,
        { sessionId: sid, window: 'noc', action: 'ack-alert', params: { id: 'noc-d1' } }, r.opts);
    chk('a legitimate action still works, so the sweep is not passing vacuously',
        good.result && good.result.ok === true, JSON.stringify(good.result));
    const win = await EX.renderWindow(r.store, { sessionId: sid, window: 'firewall' }, r.opts);
    chk('and a legitimate window still renders', !!(win.view && win.view.title), JSON.stringify(win.view && win.view.title));

    /* THE SECOND SURFACE. renderWindow had the belt-and-braces disclosure check and runAction did
     * not, so the identical payload was refused by one and returned by the other. Both now have it,
     * and this plants a disclosure to prove the check FIRES rather than merely exists. */
    chk('runAction refuses a result that discloses, not just a window that does', (() => {
        const GUI = require(path.join(NF, 'netfinal-gui.js'));
        const hits = CLIENT.findDisclosures({ ok: true, faults: [{ id: 'S7B' }] }, 'planted');
        return hits.length > 0 && typeof GUI.own === 'function';
    })(), 'the scanner must fire on a planted fault list, and own() must exist');
}

/* ─── NOTHING A STUDENT SENDS MAY TOUCH A SHARED PROTOTYPE ─────────────────────────────────────── */
section('prototype pollution, swept across every entry point including the shell');
{
    /* THE DEFECT THIS EXISTS FOR, and why it is a RUNTIME sweep rather than a code-pattern check.
     *
     * The dispatch-confusion CRITICAL was fixed in netfinal-gui.js and netfinal-core.js, and the
     * commit said "fixed at the root, not the edge". `restoreDevice` lives in netfinal-faults.js --
     * same defect, same family, one file over -- and was never touched. `device:'__proto__'` made
     * `deviceConfigs['__proto__']` resolve to Object.prototype (truthy, so the guard passed) and the
     * three unconditional assignments landed `.snmp`, `.ntp` and `.files` ON THE SHARED PROTOTYPE:
     *
     *   for (var k in {})   ->   ['snmp', 'ntp', 'files']
     *
     * on a brand-new object, for the life of that warm instance, across every student it went on to
     * serve. Values were always undefined, so it was enumeration noise rather than injected data --
     * but process-wide reach is worse than the session-scoped bugs beside it.
     *
     * A grep for `[clientKey] =` would have found it. It would also have found forty legitimate
     * writes and been turned off. So this measures the PROPERTY instead: after driving every entry
     * point with every prototype-reachable key, are the shared prototypes exactly as they were. That
     * holds whatever file the next one is in, which is the whole point -- the last two instances of
     * this were in files the previous fix did not visit. */
    const PROTO_KEYS = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf',
        'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable'];
    const snapshot = () => JSON.stringify({
        obj: Object.getOwnPropertyNames(Object.prototype).sort(),
        arr: Object.getOwnPropertyNames(Array.prototype).sort(),
        fn: Object.getOwnPropertyNames(Function.prototype).sort(),
        str: Object.getOwnPropertyNames(String.prototype).sort(),
        assign: Object.getOwnPropertyNames(Object.assign).sort()
    });

    const before = snapshot();
    const r = rig();
    const s0 = await EX.startExam(r.store, { studentId: 'pollute', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    const sid = s0.sessionId;
    let calls = 0;

    for (const k of PROTO_KEYS) {
        const attempts = [
            () => EX.restoreDevice(r.store, { sessionId: sid, device: k }, r.opts),
            () => EX.renderWindow(r.store, { sessionId: sid, window: k }, r.opts),
            () => EX.saveAnswer(r.store, { sessionId: sid, questionId: k, value: 'x' }, r.opts),
            () => EX.runAction(r.store, { sessionId: sid, window: k, action: k, params: { pwned: 1 } }, r.opts),
            () => EX.runAction(r.store, { sessionId: sid, window: 'rack', action: 'replace-cable',
                params: { device: k, port: k } }, r.opts),
            () => EX.runAction(r.store, { sessionId: sid, window: 'wireless', action: 'ap-set-channel',
                params: { ap: k, channel: 6 } }, r.opts),
            () => EX.runAction(r.store, { sessionId: sid, window: 'noc', action: 'ack-alert',
                params: { id: k } }, r.opts),
            /* THE SHELL, which the earlier sweep never touched: a student-typed file path and a
             * student-named ACL are both written with a key they chose. */
            () => EX.runCommand(r.store, { sessionId: sid, line: 'sudo vi /etc/' + k }, r.opts),
            () => EX.runCommand(r.store, { sessionId: sid, line: 'ip access-list extended ' + k }, r.opts),
            () => EX.runCommand(r.store, { sessionId: sid, line: 'ssh admin@' + k }, r.opts)
        ];
        for (const attempt of attempts) {
            calls++;
            try { await attempt(); } catch (e) { /* a refusal is a fine outcome; pollution is not */ }
        }
    }

    chk('the sweep drove every entry point with every prototype key (' + calls + ' calls)',
        calls === PROTO_KEYS.length * 10, String(calls));
    chk('NO shared prototype or builtin was modified', snapshot() === before,
        'before/after differ -- something wrote through a client key');
    chk('and a fresh object enumerates nothing', (() => {
        const leaked = [];
        for (const k in {}) { leaked.push(k); }
        return leaked.length === 0;
    })(), 'for..in on {} is polluted');

    /* THE CONTROL. If every one of those calls had thrown before reaching any write, the assertions
     * above would hold for the wrong reason -- so prove the engine is still working, and that a
     * REAL restore still succeeds through the same code path the exploit used. */
    const real = await EX.restoreDevice(r.store, { sessionId: sid, device: 'MeridianSW-01' }, r.opts);
    chk('a real device restore still works, through the same function',
        real.result && real.result.ok === true, JSON.stringify(real.result));
    chk('and the session still responds to an ordinary command',
        (await EX.runCommand(r.store, { sessionId: sid, line: 'ipconfig' }, r.opts)).out.length > 0);

    /* setOwn is the shared primitive; assert it refuses rather than trusting its callers. */
    const CORE2 = require(path.join(NF, 'netfinal-core.js'));
    chk('setOwn refuses every unsafe key and allows an ordinary one', (() => {
        const o = {};
        const refused = CORE2.UNSAFE_WRITE_KEYS.every(k => CORE2.setOwn(o, k, { x: 1 }) === false);
        return refused && Object.getPrototypeOf(o) === Object.prototype
            && CORE2.setOwn(o, 'ordinary', 1) === true && o.ordinary === 1;
    })(), JSON.stringify(CORE2.UNSAFE_WRITE_KEYS));
    /* An ARRAY target with key 'length' is not a prototype attack, but it truncates the array through
     * ordinary JS semantics -- a silent data loss if a future call site ever points setOwn at an
     * array with a client-chosen key. No current call site does; the audit flagged it forward and it
     * is one line, so it is refused rather than remembered. */
    /* A GUARD'S REFUSAL MUST REACH THE CALLER. Two sites asked setOwn to write and ignored its
     * answer, so the student was told their work landed when it had not: `ack-alert` replied "Alert
     * constructor acknowledged" with nothing recorded (its hand-written check listed only
     * `__proto__`, so it was always going to be the stale copy of setOwn's rules), and `vi
     * constructor` + :wq replied "applied: written" with the files map still empty. Telling a student
     * a save succeeded is the worst of the cosmetic bugs, because they have no reason to check. */
    {
        const g = rig();
        const gs = await EX.startExam(g.store, { studentId: 'refusals', examId: EXAMS.DEFAULT_EXAM_ID }, g.opts);
        const gsid = gs.sessionId;
        const ack = async (id) => (await EX.runAction(g.store,
            { sessionId: gsid, window: 'noc', action: 'ack-alert', params: { id } }, g.opts)).result;

        const refusedAcks = [];
        for (const id of ['constructor', 'prototype', '__proto__']) {
            const res = await ack(id);
            if (res.ok !== false) { refusedAcks.push(id); }
        }
        chk('ack-alert refuses every key setOwn would refuse, not just the one it hand-listed',
            refusedAcks.length === 0, 'reported success for: ' + refusedAcks.join(', '));
        const realAlert = (await EX.renderWindow(g.store, { sessionId: gsid, window: 'noc' }, g.opts))
            .view.alerts[0];
        chk('and a real alert is still acknowledged', (await ack(realAlert.id)).ok === true, realAlert.id);
        chk('only the real acknowledgement was recorded',
            Object.keys((await g.store.get(gsid)).state.ackedAlerts || {}).join(',') === realAlert.id,
            JSON.stringify(Object.keys((await g.store.get(gsid)).state.ackedAlerts || {})));

        /* The same shape in saveFile: the refusal must appear in what the student reads. */
        const srvIp = (await g.store.get(gsid)).state.devices['MER-SRV01'].mgmtIp;
        await EX.runCommand(g.store, { sessionId: gsid, line: 'ssh admin@' + srvIp }, g.opts);
        await EX.runCommand(g.store, { sessionId: gsid, line: 'sudo vi constructor' }, g.opts);
        const wrote = await EX.runCommand(g.store, { sessionId: gsid, line: ':wq' }, g.opts);
        chk('a refused file write SAYS it was refused instead of reporting a save',
            /cannot write to a file named constructor/.test(String(wrote.out)),
            JSON.stringify(String(wrote.out).slice(0, 90)));
        chk('and nothing was stored under that name',
            Object.keys((await g.store.get(gsid)).state.devices['MER-SRV01'].files || {}).length === 0,
            JSON.stringify(Object.keys((await g.store.get(gsid)).state.devices['MER-SRV01'].files || {})));
    }

    /* matchedSecrets walked objects while implementing only ONE of findDisclosures' three checks, so
     * a future caller pointing it at something richer than command text would have passed a
     * {faults:[...]} leak. That is how this function came to exist -- someone pointed a scanner at a
     * new surface -- so it now covers keys and shapes as well as string patterns. */
    chk('matchedSecrets covers forbidden KEYS and fault-target SHAPES, not only text', (() => {
        const k = CLIENT.matchedSecrets({ faults: [{ id: 'x' }] });
        const b = CLIENT.matchedSecrets({ baseline: {} });
        const t = CLIENT.matchedSecrets({ target: { host: 'H', switch: 'SW', port: 'Fa0/1' } });
        const txt = CLIENT.matchedSecrets('host S7B down');
        const innocent = CLIENT.matchedSecrets({ vlan: 10, name: 'Sales' });
        return k.indexOf('faults') >= 0 && b.indexOf('baseline') >= 0 && t.indexOf('target') >= 0
            && txt.join(',') === 'S7B' && innocent.length === 0;
    })(), JSON.stringify({
        keys: CLIENT.matchedSecrets({ faults: [] }),
        shape: CLIENT.matchedSecrets({ target: { host: 'H', switch: 'S', port: 'P' } }),
        innocent: CLIENT.matchedSecrets({ vlan: 10 })
    }));

    chk('setOwn refuses to write length on an array, but still writes an ordinary index', (() => {
        const arr = [1, 2, 3];
        const refused = CORE2.setOwn(arr, 'length', 0) === false && arr.length === 3;
        const allowed = CORE2.setOwn(arr, 1, 9) === true && arr[1] === 9;
        /* and 'length' on a plain object is an ordinary key, so the guard is scoped to arrays */
        const plain = {};
        return refused && allowed && CORE2.setOwn(plain, 'length', 5) === true && plain.length === 5;
    })());
    chk('and own/setOwn are defined in ONE place, required by the rest', (() => {
        const GUI2 = require(path.join(NF, 'netfinal-gui.js'));
        return typeof CORE2.own === 'function' && GUI2.own === CORE2.own;
    })(), 'gui must use core’s definition, not a copy of it -- a copy is how the last one survived');
}

/* ─── THE FOURTH EMITTING SURFACE ───────────────────────────────────────────────────────────────── */
section('command output is scanned too, without refusing the student their own words');
{
    /* renderWindow, runAction and restoreDevice were scanned; runCommand returns engine-generated
     * TEXT to the client and never was. The audit swept it and found nothing it would have caught --
     * but "I looked and found nothing" is not "something is looking", and that distinction is the
     * whole lesson of the rounds before this one.
     *
     * THE ECHO EXEMPTION IS THE HARD PART. `ssh S7B` replies "ssh: connect to host S7B port 22: No
     * route to host" -- which contains a fault id because the STUDENT typed it. A plain scan refuses
     * that and hands them a 500 for typing a hostname: the change-request lockout again, through a
     * different door. So a matched token that appears in the submitted line is their own words
     * coming back; only a token that does not is a disclosure. */
    const r = rig();
    const s0 = await EX.startExam(r.store, { studentId: 'cmd-scan', examId: EXAMS.DEFAULT_EXAM_ID }, r.opts);
    const sid = s0.sessionId;
    const run = async (line) => {
        try { return { ok: true, out: (await EX.runCommand(r.store, { sessionId: sid, line }, r.opts)).out }; }
        catch (e) { return { ok: false, code: e.code, msg: e.message }; }
    };

    /* A student may type a fault id. They must get an ordinary answer, not a 500. */
    for (const line of ['ssh S7B', 'ping S12B', 'nslookup S3A', 'ping S11A']) {
        const res = await run(line);
        chk('a student typing "' + line + '" gets output, not a refusal',
            res.ok === true, res.ok ? '' : res.code + ': ' + String(res.msg).slice(0, 70));
    }
    /* And the surface is genuinely scanned: a token the student did NOT type must be refused. */
    chk('matchedSecrets finds the token, which is what makes the echo test possible',
        JSON.stringify(CLIENT.matchedSecrets('ssh: connect to host S7B port 22')) === '["S7B"]',
        JSON.stringify(CLIENT.matchedSecrets('ssh: connect to host S7B port 22')));
    chk('a token NOT present in the submitted line counts as a disclosure', (() => {
        /* The rule the callable applies, exercised directly: the output names S9B, the line does not.
         * NOT using the word "slot" in the fixture -- `/\bslot\b/i` is itself one of the forbidden
         * patterns, so "slot S9B" yields TWO tokens and my first version of this assertion expected
         * one and failed. The test was wrong, not the code, which is worth saying because the
         * instinct on a red assertion is to look at the product first. */
        const tokens = CLIENT.matchedSecrets('internal note: S9B is active');
        const line = 'show vlan brief';
        return tokens.length === 1
            && tokens.filter(t => line.toLowerCase().indexOf(t.toLowerCase()) < 0).length === 1;
    })(), JSON.stringify(CLIENT.matchedSecrets('internal note: S9B is active')));
    chk('and the same token IS exempt when the line contains it', (() => {
        const tokens = CLIENT.matchedSecrets('ssh: connect to host S7B port 22');
        const line = 'ssh S7B';
        return tokens.filter(t => line.toLowerCase().indexOf(t.toLowerCase()) < 0).length === 0;
    })());
    /* THE CONTROL, and the thing that would catch this check going wrong in the OTHER direction.
     * `/\bslot\b/i` is a forbidden pattern, and plenty of network output could plausibly contain
     * the word -- a chassis slot, say -- so a scan on command text can refuse LEGITIMATE output just
     * as easily as it can catch a leak. Every real command a student can type, swept: a single
     * refusal here means the check has started eating the exam. */
    const realCommands = [
        'ipconfig', 'arp -a', 'ping 10.0.0.1', 'nslookup intranet.meridiancorp.local', 'tracert 8.8.8.8'
    ];
    const iosCommands = [
        'show vlan brief', 'show interfaces trunk', 'show ip route', 'show running-config',
        'show logging', 'show ip access-lists', 'show mac address-table', 'show cdp neighbors detail',
        'show interfaces', 'show ntp status', 'show snmp community', 'show clock',
        'show ip interface brief', 'show access-lists', 'show arp', 'show ip arp', 'show vlan',
        'show lldp neighbors detail'
    ];
    const refusals = [];
    for (const c of realCommands) {
        const res = await run(c);
        if (!res.ok) { refusals.push(c + ': ' + res.code); }
    }
    const rtrIp = (await r.store.get(sid)).state.devices['MeridianRTR-01'].mgmtIp;
    await run('ssh admin@' + rtrIp);
    await run('enable');
    for (const c of iosCommands) {
        const res = await run(c);
        if (!res.ok) { refusals.push(c + ': ' + res.code); }
    }
    chk('no real command is refused by the new scan (' + (realCommands.length + iosCommands.length) + ' swept)',
        refusals.length === 0, refusals.slice(0, 3).join(' | '));
    chk('and the sweep covers the output-heavy ones, so it could fail',
        iosCommands.indexOf('show running-config') >= 0 && iosCommands.indexOf('show logging') >= 0);

    /* AND THAT runCommand ACTUALLY APPLIES THE RULE, not merely that the rule is correct. Removing
     * the scan from runCommand passed every assertion above, because they exercise matchedSecrets
     * and the filter directly -- the rule was tested, the WIRING was not. Tenth time in this build a
     * check of mine held while the thing it was meant to protect was gone.
     *
     * No real command discloses -- that is the point of the engine -- so the disclosure is PLANTED
     * into a value the shell echoes, and the student does not type it. */
    {
        const planted = rig();
        const p0 = await EX.startExam(planted.store,
            { studentId: 'planted', examId: EXAMS.DEFAULT_EXAM_ID }, planted.opts);
        const psid = p0.sessionId;
        const sess = await planted.store.get(psid);
        const swIp = sess.state.devices['MeridianSW-01'].mgmtIp;
        /* A fault id where `show snmp community` will read it back out. */
        sess.state.devices['MeridianSW-01'].snmp.community = 'S7B';
        await planted.store.put(psid, sess);

        const step = async (line) => {
            try { return { ok: true, out: (await EX.runCommand(planted.store, { sessionId: psid, line }, planted.opts)).out }; }
            catch (e) { return { ok: false, code: e.code, msg: e.message }; }
        };
        await step('ssh admin@' + swIp);
        await step('enable');
        const shown = await step('show snmp community');
        chk('runCommand REFUSES output that discloses a fault id the student never typed',
            shown.ok === false && shown.code === 'internal' && /discloses fault data/.test(shown.msg),
            shown.ok ? 'it returned: ' + JSON.stringify(String(shown.out).slice(0, 70)) : String(shown.msg).slice(0, 80));
        /* And the same session is not wedged: an ordinary command still answers. */
        const after = await step('show clock');
        chk('and the session still works afterwards', after.ok === true, String(after.msg || '').slice(0, 60));
    }
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
})().catch(e => { console.error('harness fault:', e && e.stack ? e.stack : e); process.exit(2); });
