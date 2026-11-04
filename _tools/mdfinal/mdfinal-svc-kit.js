/**
 * mdfinal-svc-kit.js — drive sittings through the session service (mdfinal-exam.js), for the suites.
 *
 * @catalog what    Record the engine calls a walk makes and replay them through the MD-100 final
 * @catalog what    session service and an in-memory store; clocks, options and natural-class uids.
 * @catalog run     (library; required by the mdfinal session, leak and adversarial suites)
 * @catalog status  TOOL
 *
 * The walk (mdfinal-walk.js) drives the engine directly. record() wraps the four engine entry points
 * a page reaches through the service (gui.act, shell.exec, handover, answers.save) while a walk runs
 * and keeps the TOP-LEVEL calls; replay() sends the same calls through the service, as the page
 * would. The service generates labs by uid and never forces a class, so naturalUid() finds a uid
 * whose own HMAC draw is the class wanted.
 */
const kit = require('./mdfinal-test-kit.js');
const EXAM = kit.req('mdfinal-exam.js');
const EXAMS = kit.req('mdfinal-exams.js');
const CORE = kit.req('mdfinal-core.js');
const GUI = kit.req('mdfinal-gui.js');
const SH = kit.req('mdfinal-shell.js');
const HO = kit.req('mdfinal-handover.js');
const ANS = kit.req('mdfinal-answers.js');

const EX = 'md100-final-2026';
const W0 = EXAMS.WINDOWS[EX];

/* A clock the test moves. */
function clock(t0) { let now = t0; return { now: () => now, set: (v) => { now = v; }, add: (ms) => { now += ms; } }; }

/* Service options: the test secret, a clock, and an onGraded that records graded session ids. */
function opts(c, graded) { return { secret: kit.TEST_SECRET, now: c.now, onGraded: async (s) => { if (graded) { graded.push(s.sessionId); } } }; }

/* A memory store with the exam allowlisted for these uids. */
async function storeFor(uids, examId) {
    const st = EXAM.memoryStore();
    await st.putControl(examId || EX, { armed: false, allowUids: uids });
    return st;
}

const orig = { act: GUI.act, exec: SH.exec, handover: HO.handover, save: ANS.save };

/* Runs fn with the engine entry points wrapped; returns { calls, out }. Each call is
 * [kind, ...args without the state], deep-copied when made. Nested calls are not recorded. */
function record(fn) {
    const calls = []; let depth = 0;
    const wrap = (kind, f) => function () {
        if (depth === 0) { calls.push([kind].concat(JSON.parse(JSON.stringify(Array.prototype.slice.call(arguments, 1, kind === 'act' ? 4 : 3))))); }
        depth++; try { return f.apply(this, arguments); } finally { depth--; }
    };
    GUI.act = wrap('act', orig.act); SH.exec = wrap('exec', orig.exec); HO.handover = wrap('handover', orig.handover); ANS.save = wrap('save', orig.save);
    let out;
    try { out = fn(); } finally { GUI.act = orig.act; SH.exec = orig.exec; HO.handover = orig.handover; ANS.save = orig.save; }
    return { calls, out };
}

/* A uid whose own draw is class (p, v), or null. */
function naturalUid(p, v, prefix) {
    for (let i = 0; i < 2000; i++) {
        const u = (prefix || 'replay-') + p + v + '-' + i;
        const k = CORE.buildAnswerKey(u, EX, { secret: kit.TEST_SECRET });
        if (k.profile === CORE.PROFILES[p].id && k.variant === CORE.VARIANTS[v]) { return u; }
    }
    return null;
}

/* Sends recorded calls through the service, one second apart. `each` (optional) sees every reply.
 * Returns the number of calls the service refused or threw on. */
async function replayInto(st, sid, calls, o, c, each) {
    let refused = 0;
    for (const call of calls) {
        c.add(1000);
        try {
            let r;
            if (call[0] === 'act') { r = await EXAM.runAction(st, { sessionId: sid, window: call[1], action: call[2], params: call[3] }, o); if (!r.result.ok) { refused++; } }
            else if (call[0] === 'exec') { r = await EXAM.runCommand(st, { sessionId: sid, console: call[1], line: call[2] }, o); }
            else if (call[0] === 'handover') { r = await EXAM.handover(st, { sessionId: sid, confirm: true }, o); }
            else if (call[0] === 'save') { r = await EXAM.saveAnswer(st, { sessionId: sid, fieldId: call[1], value: call[2] }, o); }
            if (each) { each(call, r); }
        } catch (e) { refused++; console.log('  replay ' + sid + ' ' + call[0] + ' ' + JSON.stringify(call.slice(1)).slice(0, 120) + ' -> ' + e.code + ' ' + e.message); }
    }
    return refused;
}

/* A started sitting for `uid` on its own store, a week before the window. */
async function started(uid, examId) {
    const st = await storeFor([uid], examId);
    const c = clock(W0.opensAt - 7 * 86400000);
    const graded = [];
    const o = opts(c, graded);
    const r = await EXAM.startExam(st, { studentId: uid, examId: examId || EX }, o);
    return { st, c, o, sid: r.sessionId, graded, start: r };
}

module.exports = { EX, W0, clock, opts, storeFor, record, naturalUid, replayInto, started };
