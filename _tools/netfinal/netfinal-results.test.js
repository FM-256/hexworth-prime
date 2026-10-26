#!/usr/bin/env node
/**
 * netfinal-results.test.js — where a Meridian final grade GOES after the grader computes it.
 *
 * @catalog what    Loads the REAL functions/index.js with firebase stubbed and an in-memory
 * @catalog what    Firestore, then drives the real exported callables: submit records the grade to
 * @catalog what    the student's profile and to every class that ASSIGNED the exam (and no other);
 * @catalog what    the latest attempt wins; results and marking are staff only; marking Q45
 * @catalog what    re-totals the report and the gradebook follows.
 * @catalog run     node _tools/netfinal/netfinal-results.test.js
 * @catalog note    No network, no emulator, no functions/.env: nothing here can reach production.
 * @catalog status  TOOL
 *
 * WHY THIS EXISTS. The exam graded on the server and then told nobody: no gradebook entry, no
 * profile record, and the student saw the score once. The fix writes from the server, inside
 * functions/index.js, which no other netfinal suite can load because it needs firebase. Reading the
 * write is not testing it, so this loads it for real with the two firebase modules stubbed, the same
 * pattern Mallory used to audit the restart callable.
 */
const path = require('path');
const Module = require('module');
const REPO = path.resolve(__dirname, '../..');

/* chk records one assertion; section prints a heading. Same shape as every other netfinal suite. */
let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + String(detail).slice(0, 300) : '')); }
};
const section = (t) => console.log('\n' + t);

/* ── an in-memory Firestore with the semantics the code under test relies on ─────────────────────
   set with merge DEEP-merges maps (so one completion key never wipes another), where() supports
   '==' and 'array-contains', documents have subcollections, and a transaction serializes. */
const docs = new Map();                       // full path -> plain object
const AUTH = {                                // uid -> { email, customClaims }
    teach: { email: 'teach@staff.example', customClaims: { handler: true } },
    evil: { email: 'evil@students.example', customClaims: {} },
    stu: { email: 'stu@students.example', customClaims: {} }
};
const TS = { __serverTimestamp: true };
/* clone copies like Firestore does (no shared references); isPlain says whether a value is a map
   that merge should descend into; deepMerge is Firestore's set-with-merge on nested maps. */
const clone = (v) => JSON.parse(JSON.stringify(v));
const isPlain = (v) => v && typeof v === 'object' && !Array.isArray(v) && !v.__serverTimestamp;
function deepMerge(a, b) {
    const out = isPlain(a) ? clone(a) : {};
    Object.keys(b).forEach((k) => { out[k] = isPlain(b[k]) && isPlain(out[k]) ? deepMerge(out[k], b[k]) : clone(b[k]); });
    return out;
}
/* A document reference: get, set (with merge), create (fails if present), delete, subcollections. */
class DocRef {
    constructor(p) { this.path = p; this.id = p.split('/').pop(); }
    collection(c) { return new ColRef(this.path + '/' + c); }
    async get() { const d = docs.get(this.path); return { exists: !!d, id: this.id, ref: this, data: () => d && clone(d) }; }
    async set(v, o) { docs.set(this.path, o && o.merge ? deepMerge(docs.get(this.path), v) : clone(v)); }
    async create(v) {
        if (docs.has(this.path)) { const e = new Error('6 ALREADY_EXISTS'); e.code = 6; throw e; }
        docs.set(this.path, clone(v));
    }
    async delete() { docs.delete(this.path); }
}
/* A collection or query: doc, where ('==' and 'array-contains'), limit, and get over direct children. */
class ColRef {
    constructor(p, filters, lim) { this.path = p; this.filters = filters || []; this.lim = lim; }
    doc(id) { return new DocRef(this.path + '/' + id); }
    where(f, op, v) { return new ColRef(this.path, this.filters.concat([[f, op, v]]), this.lim); }
    limit(n) { return new ColRef(this.path, this.filters, n); }
    async get() {
        /* FAIL_PATHS makes one collection's read throw, to prove one failing class does not stop
           the others being recorded. */
        if (FAIL_PATHS.has(this.path)) { throw new Error('injected failure reading ' + this.path); }
        const depth = this.path.split('/').length + 1;
        let out = [...docs.keys()].filter((k) => k.indexOf(this.path + '/') === 0 && k.split('/').length === depth)
            .map((k) => ({ id: k.split('/').pop(), ref: new DocRef(k), data: () => clone(docs.get(k)) }))
            .filter((d) => this.filters.every(([f, op, v]) => {
                const x = d.data()[f];
                return op === '==' ? x === v : op === 'array-contains' ? Array.isArray(x) && x.indexOf(v) >= 0 : false;
            }));
        if (this.lim) { out = out.slice(0, this.lim); }
        return { docs: out, size: out.length, empty: out.length === 0 };
    }
}
/* The db handle index.js receives; runTransaction runs one transaction at a time, as a real one
   serializes conflicting writers. */
const FAIL_PATHS = new Set();
let chain = Promise.resolve();
/* holdTx: pause the Nth transaction from now until `release` is called, to force a write to land
   late. Checked BEFORE taking the serialization lock, so other writers proceed meanwhile. */
let txCount = 0, holdAt = 0, holdGate = null, release = null;
function holdTx(n) { txCount = 0; holdAt = n; holdGate = new Promise((r) => { release = r; }); }
const db = {
    collection: (c) => new ColRef(c),
    doc: (p) => new DocRef(p),
    runTransaction: async (fn) => {
        txCount++;
        if (holdAt && txCount === holdAt) { holdAt = 0; await holdGate; }
        const prev = chain; let rel; chain = new Promise((r) => { rel = r; }); await prev;
        try {
            return await fn({
                get: async (r) => r.get(),
                /* Transaction.set honours {merge:true} as DocumentReference.set does. Ignoring it
                   here made a correct merging write look like it wiped the row. */
                set: (r, v, o) => { docs.set(r.path, o && o.merge ? deepMerge(docs.get(r.path), v) : clone(v)); },
                delete: (r) => { docs.delete(r.path); }
            });
        } finally { rel(); }
    }
};
class HttpsError extends Error { constructor(c, m) { super(m); this.code = c; } }
const STUBS = {
    'firebase-functions/v2/https': { onCall: (o, h) => h || o, onRequest: (o, h) => h || o, HttpsError },
    'firebase-functions/params': { defineSecret: () => ({ value: () => 'results-test-secret' }), defineString: () => ({ value: () => '' }) },
    'firebase-admin/app': { initializeApp: () => ({}) },
    /* Real per-user claims, because the gradebook write checks the CLASS OWNER's claims. */
    'firebase-admin/auth': { getAuth: () => ({ getUser: async (uid) => {
        if (uid === 'flaky') { const q = new Error('quota exceeded'); q.code = 'auth/internal-error'; throw q; }
        if (!AUTH[uid]) { const e = new Error('no user'); e.code = 'auth/user-not-found'; throw e; }
        return AUTH[uid];
    } }) },
    'firebase-admin/firestore': { getFirestore: () => db, FieldValue: { serverTimestamp: () => TS, arrayUnion: () => [], increment: () => 0, delete: () => null }, Timestamp: { now: () => ({}) } }
};
/* Route index.js's firebase requires to the stubs above; everything else loads for real. */
const origLoad = Module._load;
Module._load = function (req, ...a) {
    if (STUBS[req]) { return STUBS[req]; }
    try { return origLoad.call(this, req, ...a); }
    catch (e) {
        /* Any other external module index.js happens to require is irrelevant to these callables. */
        if (/Cannot find module/.test(e.message) && !req.startsWith('.')) {
            return new Proxy(function () {}, { get: (t, k) => (k === 'then' ? undefined : () => ({})), apply: () => ({}) });
        }
        throw e;
    }
};
const quiet = console.log;
console.log = () => {};
const F = require(path.join(REPO, 'functions/index.js'));
console.log = quiet;
/* Stubs are for index.js only. Left in place they also intercept puppeteer's own requires, which is
   how its launch timed out with no clue in the error. */
Module._load = origLoad;
const EXAMS = require(path.join(REPO, 'functions/netfinal/netfinal-exams.js'));

const EXAM = 'net-final-2026';
const CID = EXAMS.catalogId(EXAM);
/* Callers: a student (no claims) and an instructor (the handler claim). caught returns the error a
   promise rejects with, or null; call invokes a callable handler with its logging muted. */
const student = (uid) => ({ auth: { uid, token: { email: uid + '@students.example' } } });
const staff = (uid) => ({ auth: { uid, token: { handler: true, email: uid + '@staff.example' } } });
const caught = async (p) => { try { await p; return null; } catch (e) { return e; } };
const call = (fn, req, data) => {
    const was = console.log, wasErr = console.error; console.log = () => {}; console.error = () => {};
    return Promise.resolve(fn(Object.assign({}, req, { data: data || {} })))
        .finally(() => { console.log = was; console.error = wasErr; });
};

(async () => {
section('the harness is real: index.js loaded and exports the callables');
chk('netfinalSubmit, netfinalResults and netfinalMarkNarratives are exported',
    typeof F.netfinalSubmit === 'function' && typeof F.netfinalResults === 'function'
    && typeof F.netfinalMarkNarratives === 'function');
chk('the exam has a catalog id, which is what the gradebook is keyed by', CID === 'web-netplus-meridian-final');
chk('and the completion registry knows that id, so a strict check would accept it',
    require(path.join(REPO, 'functions/completion-registry.json')).ids.indexOf(CID) >= 0);

/* Three classes: one that ASSIGNED the exam, one the student is in that did not, one the student is
   not in. Plus another completion already on the student's row, which a write must not wipe. */
docs.set('classes/c-assigned', { name: 'Assigned', handlerUid: 'teach', memberUids: ['stu', 'bob'] });
docs.set('classes/c-assigned/assignments/a1', { contentId: CID, assignmentType: 'item', isActive: true });
docs.set('classes/c-assigned/progress/stu', { uid: 'stu', displayName: 'Stu', completions: { 'web-other': { completed: true, score: 80 } } });
docs.set('classes/c-unassigned', { name: 'Not assigned', handlerUid: 'teach', memberUids: ['stu'] });
docs.set('classes/c-unassigned/assignments/a2', { contentId: 'web-something-else', isActive: true });
docs.set('classes/c-retired', { name: 'Retired', handlerUid: 'teach', memberUids: ['stu'] });
docs.set('classes/c-retired/assignments/a3', { contentId: CID, isActive: false });
docs.set('classes/c-other', { name: 'Other', handlerUid: 'teach', memberUids: ['zed'] });
docs.set('classes/c-other/assignments/a4', { contentId: CID, isActive: true });
/* Mallory's attack: any signed-in user can create a class, list a victim, and assign the exam. */
docs.set('classes/c-evil', { name: 'Evil', handlerUid: 'evil', memberUids: ['stu'] });
docs.set('classes/c-evil/assignments/a5', { contentId: CID, isActive: true });
/* Assigned only AFTER the student submits: the first real use of this feature. */
docs.set('classes/c-late', { name: 'Late', handlerUid: 'teach', memberUids: ['stu'] });
docs.set('users/stu', { displayName: 'Stu Dent' });

section('a submit records the grade where people look for it, and nowhere else');
await call(F.netfinalStart, student('stu'), { examId: EXAM });
const sub = await call(F.netfinalSubmit, student('stu'), { examId: EXAM });
const sess = docs.get('netfinal_sessions/stu::' + EXAM);
const rep = JSON.parse(sess.reportJson);
chk('no profile copy: users/{uid} is readable by any signed-in user and nothing read it',
    !('examResults' in (docs.get('users/stu') || {})));
const row = (docs.get('classes/c-assigned/progress/stu') || {}).completions || {};
chk('the class that ASSIGNED the exam gets a completion in the shape the dashboard reads',
    row[CID] && row[CID].completed === true && typeof row[CID].score === 'number'
    && row[CID].score === Math.round(rep.total / rep.outOf * 100) && typeof row[CID].completedAt === 'string',
    JSON.stringify(row[CID]));
chk('without wiping the completion already on that row', row['web-other'] && row['web-other'].score === 80,
    JSON.stringify(row));
chk('a class the student is in that did NOT assign it gets nothing', !docs.has('classes/c-unassigned/progress/stu'));
chk('a class whose assignment was retired gets nothing', !docs.has('classes/c-retired/progress/stu'));
chk('a class the student is not in gets nothing', !docs.has('classes/c-other/progress/stu'));
chk('a class a NON-STAFF user created, listing the student and assigning the exam, gets nothing',
    !docs.has('classes/c-evil/progress/stu'));
chk('and a class that assigns it only later has nothing yet', !docs.has('classes/c-late/progress/stu'));
chk('and the student still got their own aggregates-only report back',
    sub && sub.report && sub.report.total === rep.total && !('questions' in sub.report));

section('the LATEST attempt is what the gradebook holds (operator, 2026-10-21)');
const firstAt = row[CID].completedAt;
await call(F.netfinalReset, student('stu'), { examId: EXAM });
chk('after a restart the gradebook still shows the last SUBMITTED attempt, not a blank',
    ((docs.get('classes/c-assigned/progress/stu') || {}).completions || {})[CID].completedAt === firstAt);
await new Promise((r) => setTimeout(r, 15));
await call(F.netfinalStart, student('stu'), { examId: EXAM });
await call(F.netfinalSubmit, student('stu'), { examId: EXAM });
const row2 = ((docs.get('classes/c-assigned/progress/stu') || {}).completions || {})[CID];
chk('the next submission replaces it', row2 && row2.completedAt !== firstAt, JSON.stringify(row2));

section('an exam assigned AFTER students sat it is filled in when staff open the class');
docs.set('classes/c-late/assignments/a6', { contentId: CID, isActive: true });
const lateRes = await call(F.netfinalResults, staff('teach'), { examId: EXAM, classId: 'c-late' });
const lateRow = ((docs.get('classes/c-late/progress/stu') || {}).completions || {})[CID];
const liveRep = JSON.parse(docs.get('netfinal_sessions/stu::' + EXAM).reportJson);
chk('opening the class records the already-submitted attempt into it',
    lateRow && lateRow.total === liveRep.total && lateRow.completed === true, JSON.stringify(lateRow));
chk('and the results page is told so', lateRes.students[0].gradebook === 'recorded', JSON.stringify(lateRes.students[0].gradebook));
docs.set('classes/c-flaky', { name: 'Flaky', handlerUid: 'flaky', memberUids: ['stu'] });
docs.set('classes/c-flaky/assignments/a7', { contentId: CID, isActive: true });
const flakyRes = await call(F.netfinalResults, staff('teach'), { examId: EXAM, classId: 'c-flaky' });
chk('an owner lookup that FAILS says it could not check, not that the owner is not staff',
    /could not check the class owner/.test(flakyRes.students[0].gradebook || '') && !docs.has('classes/c-flaky/progress/stu'),
    JSON.stringify(flakyRes.students[0].gradebook));
const evilRes = await call(F.netfinalResults, staff('teach'), { examId: EXAM, classId: 'c-evil' });
chk('opening the hostile class records nothing, and says why',
    !docs.has('classes/c-evil/progress/stu') && evilRes.students[0].gradebook === 'class owner is not staff',
    JSON.stringify(evilRes.students[0].gradebook));

section('results are staff only, and list what an instructor needs');
const denied = await caught(call(F.netfinalResults, student('stu'), { examId: EXAM, classId: 'c-assigned' }));
chk('a student asking for results is refused', denied && denied.code === 'permission-denied', denied && denied.message);
const deniedAnon = await caught(call(F.netfinalResults, { auth: null }, { examId: EXAM }));
chk('a signed-out caller is refused', deniedAnon && deniedAnon.code === 'unauthenticated');
const list = await call(F.netfinalResults, staff('teach'), { examId: EXAM });
chk('an instructor\'s class list is the classes they own that ASSIGNED the exam',
    JSON.stringify(list.classes.map((c) => c.id).sort()) === JSON.stringify(['c-assigned', 'c-late', 'c-other']),
    JSON.stringify(list.classes));
const res = await call(F.netfinalResults, staff('teach'), { examId: EXAM, classId: 'c-assigned' });
const stuRow = res.students.filter((s) => s.uid === 'stu')[0];
chk('each member appears, by name', res.students.length === 2 && stuRow && stuRow.name === 'Stu Dent',
    JSON.stringify(res.students.map((s) => s.name)));
chk('with the FULL report for staff: every question and its note',
    stuRow.sitting && stuRow.sitting.report && stuRow.sitting.report.questions.length === 50
    && typeof stuRow.sitting.report.questions[0].note === 'string');
chk('with the earlier attempt from the archive, its score and who restarted it',
    stuRow.attempts.length === 1 && stuRow.attempts[0].total === rep.total && stuRow.attempts[0].resetBy === 'stu',
    JSON.stringify(stuRow.attempts));
chk('and the Q45 narratives to mark', stuRow.sitting.narratives && stuRow.sitting.narratives.items.length === 3,
    JSON.stringify(stuRow.sitting.narratives));
const bobRow = res.students.filter((s) => s.uid === 'bob')[0];
chk('a member who never started shows as no sitting, not an error', bobRow && bobRow.sitting === null);
const badClass = await caught(call(F.netfinalResults, staff('teach'), { examId: EXAM, classId: '../users' }));
chk('a classId that is a path is refused before it reaches Firestore', badClass && badClass.code === 'invalid-argument');

section('marking Q45 re-totals the report, and the gradebook follows');
const before = JSON.parse(docs.get('netfinal_sessions/stu::' + EXAM).reportJson);
const noMark = await caught(call(F.netfinalMarkNarratives, student('stu'), { examId: EXAM, uid: 'stu', marks: [3, 3, 3] }));
chk('a student cannot mark their own narratives', noMark && noMark.code === 'permission-denied');
const badMarks = await caught(call(F.netfinalMarkNarratives, staff('teach'), { examId: EXAM, uid: 'stu', marks: [4, 0, 0] }));
chk('a mark outside 0-3 is refused', badMarks && badMarks.code === 'invalid-argument');
const shortMarks = await caught(call(F.netfinalMarkNarratives, staff('teach'), { examId: EXAM, uid: 'stu', marks: [3, 3] }));
chk('two marks instead of three is refused', shortMarks && shortMarks.code === 'invalid-argument');
await call(F.netfinalMarkNarratives, staff('teach'), { examId: EXAM, uid: 'stu', marks: [3, 2, 1] });
const after = JSON.parse(docs.get('netfinal_sessions/stu::' + EXAM).reportJson);
const q45 = after.questions.filter((q) => q.n === 45)[0];
chk('Q45 now carries 6 of 9, nothing pending, and who marked it',
    q45.earned === 6 && q45.pending === 0 && q45.markedBy === 'teach' && JSON.stringify(q45.marks) === '[3,2,1]',
    JSON.stringify(q45));
chk('the total rose by exactly the marks and nothing is pending',
    after.total === Math.round((before.total + 6) * 100) / 100 && after.pendingInstructorMarks === 0,
    before.total + ' -> ' + after.total + ', pending ' + after.pendingInstructorMarks);
chk('the verify phase and the reasoning subtotal moved with it',
    after.phases.verify.earned === Math.round((before.phases.verify.earned + 6) * 100) / 100
    && after.subtotals.reasoning.earned === Math.round((before.subtotals.reasoning.earned + 6) * 100) / 100);
const gb = ((docs.get('classes/c-assigned/progress/stu') || {}).completions || {})[CID];
chk('the gradebook entry now holds the marked total with nothing pending',
    gb && gb.total === after.total && gb.pendingInstructorMarks === 0
    && gb.score === Math.round(after.total / after.outOf * 100), JSON.stringify(gb));
await call(F.netfinalMarkNarratives, staff('teach'), { examId: EXAM, uid: 'stu', marks: [0, 0, 0] });
const remark = JSON.parse(docs.get('netfinal_sessions/stu::' + EXAM).reportJson);
chk('re-marking REPLACES the marks rather than adding to them', remark.total === before.total,
    before.total + ' expected, got ' + remark.total);
const notSub = await caught(call(F.netfinalMarkNarratives, staff('teach'), { examId: EXAM, uid: 'bob', marks: [1, 1, 1] }));
chk('a student with no sitting cannot be marked', notSub && notSub.code === 'not-found');

section('a staff restart from the results page reaches the student\'s sitting');
await call(F.netfinalReset, staff('teach'), { examId: EXAM, uid: 'stu', reason: 'test' });
chk('the sitting is archived and gone from the live path', !docs.has('netfinal_sessions/stu::' + EXAM));
const res2 = await call(F.netfinalResults, staff('teach'), { examId: EXAM, classId: 'c-assigned' });
chk('and the results page now shows two earlier attempts, the latest restarted by staff',
    res2.students.filter((s) => s.uid === 'stu')[0].attempts.length === 2
    && res2.students.filter((s) => s.uid === 'stu')[0].attempts[1].resetBy === 'teach');

section('an older attempt\'s delayed write cannot replace a newer score');
{
    /* Mallory's race, forced: staff marks attempt A, its gradebook transaction is held, the student
       restarts and submits attempt B, then A's write is released. B must stand. */
    await call(F.netfinalStart, student('stu'), { examId: EXAM });
    await call(F.netfinalSubmit, student('stu'), { examId: EXAM });
    holdTx(3);                                              // putIfRev(1), recordGrade c-assigned(2)... hold c-late(3)
    const marking = call(F.netfinalMarkNarratives, staff('teach'), { examId: EXAM, uid: 'stu', marks: [3, 3, 3] });
    await new Promise((r) => setTimeout(r, 30));
    await call(F.netfinalReset, student('stu'), { examId: EXAM });
    await new Promise((r) => setTimeout(r, 15));
    await call(F.netfinalStart, student('stu'), { examId: EXAM });
    await call(F.netfinalSubmit, student('stu'), { examId: EXAM });
    const bAt = ((docs.get('classes/c-late/progress/stu') || {}).completions || {})[CID].completedAt;
    release();
    await marking;
    const finalRow = ((docs.get('classes/c-late/progress/stu') || {}).completions || {})[CID];
    chk('the newer attempt is still the one recorded after the stale write is released',
        finalRow.completedAt === bAt && finalRow.pendingInstructorMarks === 9, JSON.stringify(finalRow));
}

section('one class failing to record does not stop the others');
{
    FAIL_PATHS.add('classes/c-assigned/assignments');
    await call(F.netfinalReset, student('stu'), { examId: EXAM });
    await new Promise((r) => setTimeout(r, 15));
    await call(F.netfinalStart, student('stu'), { examId: EXAM });
    const was = console.error; console.error = () => {};
    const sub3 = await caught(call(F.netfinalSubmit, student('stu'), { examId: EXAM }));
    console.error = was;
    FAIL_PATHS.clear();
    const now = new Date(docs.get('netfinal_sessions/stu::' + EXAM).submittedAt).toISOString();
    chk('the submit itself still succeeds', sub3 === null);
    chk('the class whose read failed is left behind',
        (((docs.get('classes/c-assigned/progress/stu') || {}).completions || {})[CID] || {}).completedAt !== now);
    chk('but the next class was still recorded with this attempt',
        (((docs.get('classes/c-late/progress/stu') || {}).completions || {})[CID] || {}).completedAt === now);
    const healed = await call(F.netfinalResults, staff('teach'), { examId: EXAM, classId: 'c-assigned' });
    chk('and opening the failed class on the results page heals it',
        (((docs.get('classes/c-assigned/progress/stu') || {}).completions || {})[CID] || {}).completedAt === now
        && healed.students.filter((x) => x.uid === 'stu')[0].gradebook === 'recorded');
}

section('two restarts deep: a delayed write from A cannot land over B once C is open');
{
    /* Mallory R3: the live-session check alone was one attempt deep. A marked and held; the student
       submits B, then restarts into an UNSUBMITTED C; A's write is released. The live sitting is C,
       which is not submitted, so only the ARCHIVE says B is newer than A. */
    holdTx(3);
    const markingA = call(F.netfinalMarkNarratives, staff('teach'), { examId: EXAM, uid: 'stu', marks: [3, 3, 3] });
    await new Promise((r) => setTimeout(r, 30));
    await call(F.netfinalReset, student('stu'), { examId: EXAM });
    await new Promise((r) => setTimeout(r, 15));
    await call(F.netfinalStart, student('stu'), { examId: EXAM });
    await call(F.netfinalSubmit, student('stu'), { examId: EXAM });
    const bRow = ((docs.get('classes/c-late/progress/stu') || {}).completions || {})[CID];
    await call(F.netfinalReset, student('stu'), { examId: EXAM });
    await new Promise((r) => setTimeout(r, 15));
    await call(F.netfinalStart, student('stu'), { examId: EXAM });
    release();
    await markingA;
    const cRow = ((docs.get('classes/c-late/progress/stu') || {}).completions || {})[CID];
    chk('B, the latest SUBMITTED attempt, still stands after A\'s write lands with C open',
        cRow.completedAt === bRow.completedAt && cRow.total === bRow.total,
        'B ' + JSON.stringify(bRow) + ' now ' + JSON.stringify(cRow));
    await call(F.netfinalSubmit, student('stu'), { examId: EXAM });
}

/* ─── THE RESULTS PAGE, PAINTED ─────────────────────────────────────────────────────────────────
   The real page in headless Chrome, its FirebaseAuth stubbed by a served script that posts to a
   local bridge, and the bridge calling the REAL callables above as the chosen caller. A page that
   renders the right numbers from a fixture proves nothing about the callables, so it reads these. */
section('the results page in a real browser: roster, details, marking, and a student refused');
{
    const http = require('http');
    const fs = require('fs');
    const puppeteer = require('puppeteer');
    await call(F.netfinalStart, student('stu'), { examId: EXAM });
    await call(F.netfinalSubmit, student('stu'), { examId: EXAM });
    let as = staff('teach');
    const APP = path.join(REPO, '_app');
    const srv = http.createServer((q, r) => {
        if (q.method === 'POST' && q.url.indexOf('/__call/') === 0) {
            const name = decodeURIComponent(q.url.slice(8));
            let body = '';
            q.on('data', (c) => { body += c; });
            q.on('end', async () => {
                try {
                    const out = await call(F[name], as, body ? JSON.parse(body) : {});
                    r.writeHead(200, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(out));
                } catch (e) {
                    r.writeHead(200, { 'Content-Type': 'application/json' });
                    r.end(JSON.stringify({ __error: { code: e.code, message: e.message } }));
                }
            });
            return;
        }
        const clean = q.url.split('?')[0];
        if (/AccessGuard\.js$/.test(clean)) { r.writeHead(200); r.end('window.AccessGuard={require:function(){}};'); return; }
        if (/FirebaseAuth\.js$/.test(clean)) {
            r.writeHead(200);
            r.end('window.FirebaseAuth={waitForAuth:function(){return Promise.resolve({uid:"x"});},'
                + 'callFunction:function(n,d){return fetch("/__call/"+encodeURIComponent(n),{method:"POST",body:JSON.stringify(d||{})})'
                + '.then(function(r){return r.json();}).then(function(j){if(j&&j.__error){var e=new Error(j.__error.message);e.code=j.__error.code;throw e;}return {data:j};});}};');
            return;
        }
        const f = path.join(APP, clean);
        if (f.indexOf(APP) !== 0 || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
        r.writeHead(200, { 'Content-Type': /\.html$/.test(f) ? 'text/html' : 'application/octet-stream' });
        r.end(fs.readFileSync(f));
    });
    await new Promise((res) => srv.listen(0, res));
    const base = 'http://127.0.0.1:' + srv.address().port + '/houses/web/network-plus/exams/network-final-results.html';
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'], protocolTimeout: 120000 });
    try {
        const pg = await browser.newPage();
        const errors = [];
        pg.on('pageerror', (e) => errors.push(e.message));
        pg.on('dialog', (d) => d.dismiss());
        await pg.goto(base, { waitUntil: 'networkidle0' });
        const opts = await pg.$$eval('#classpick option', (os) => os.map((o) => o.value).filter(Boolean));
        chk('the class picker lists the instructor\'s classes that assigned the exam',
            JSON.stringify(opts.sort()) === JSON.stringify(['c-assigned', 'c-late', 'c-other']), JSON.stringify(opts));
        await pg.goto(base + '?class=c-assigned', { waitUntil: 'networkidle0' });
        await pg.waitForSelector('#roster:not([hidden])', { timeout: 8000 }).catch(() => {});
        const rosterText = await pg.$eval('#roster', (el) => el.innerText);
        const live = JSON.parse(docs.get('netfinal_sessions/stu::' + EXAM).reportJson);
        chk('the roster paints every member, with the submitted student\'s real score',
            /Stu Dent/.test(rosterText) && /bob/.test(rosterText)
            && new RegExp(live.total + '\\s*/\\s*' + live.outOf).test(rosterText) && /9 to mark/.test(rosterText),
            rosterText.slice(0, 300));
        await pg.click('button[data-act="detail"]');
        await pg.waitForSelector('tr.detail', { timeout: 5000 }).catch(() => {});
        const qRows = await pg.$$eval('tr.detail .box table tbody tr', (rs) => rs.length);
        const narr = await pg.$$eval('tr.detail .narr', (ns) => ns.length);
        chk('details show every question row and the three Q45 narratives', qRows >= 50 && narr === 3,
            'rows ' + qRows + ', narratives ' + narr);
        const sels = await pg.$$('tr.detail select[data-mark]');
        for (const [k, v] of [[0, '3'], [1, '2'], [2, '2']]) { await sels[k].select(v); }
        await pg.click('button[data-act="mark"]');
        /* Saving reloads the roster; wait until it repaints without the outstanding-marks note. */
        await pg.waitForFunction(() => !/to mark/.test(document.getElementById('roster').innerText),
            { timeout: 8000 }).catch(() => {});
        const marked = JSON.parse(docs.get('netfinal_sessions/stu::' + EXAM).reportJson);
        const rosterAfter = await pg.$eval('#roster', (el) => el.innerText);
        chk('Save marks reached the server: Q45 is 7 of 9 and nothing is pending',
            marked.total === Math.round((live.total + 7) * 100) / 100 && marked.pendingInstructorMarks === 0,
            live.total + ' -> ' + marked.total);
        chk('and the roster repainted with the new total and no marks outstanding',
            new RegExp(marked.total + '\\s*/\\s*' + marked.outOf).test(rosterAfter) && !/to mark/.test(rosterAfter),
            rosterAfter.slice(0, 300));
        chk('no uncaught page error', errors.length === 0, errors.join(' | '));

        /* THE DASHBOARD CAN ASSIGN IT. The real InstructorDashboard.js, with a spy in place of the
           Firestore writer, opened at Assign Content: the Exams card must exist and must create an
           ITEM assignment keyed by the catalog id, which is the key the gradebook write looks for. */
        const dp = await browser.newPage();
        await dp.goto('http://127.0.0.1:' + srv.address().port + '/houses/web/network-plus/exams/network-final-results.html',
            { waitUntil: 'domcontentloaded' });
        await dp.evaluate(() => {
            window.ContentRegistry = { paths: {} };
            window.AssignmentManager = {
                createAssignment: async (cid, p) => { window.__assigned = p; return 'spy'; },
                getClassAssignments: async () => []
            };
        });
        await dp.addScriptTag({ content: fs.readFileSync(path.join(APP, 'components/InstructorDashboard.js'), 'utf8')
            + '\nwindow.__ID = InstructorDashboard;' });
        await dp.evaluate(() => window.__ID.openContentBrowser());
        const examCard = await dp.$$eval('#idContentBrowser .id-cb-card', (cs) => cs.map((c) => c.innerText)
            .filter((t) => /Meridian Corp/.test(t)));
        chk('Assign Content offers the final under Exams', examCard.length === 1, JSON.stringify(examCard));
        await dp.evaluate(() => {
            const card = Array.from(document.querySelectorAll('#idContentBrowser .id-cb-card'))
                .filter((c) => /Meridian Corp/.test(c.innerText))[0];
            if (card) { card.click(); }
        });
        await dp.waitForFunction(() => !!window.__assigned, { timeout: 5000 }).catch(() => {});
        const assigned = await dp.evaluate(() => window.__assigned || null);
        chk('clicking it creates an ITEM assignment keyed by the catalog id, house web, type exam',
            !!assigned && assigned.assignmentType === 'item' && assigned.contentId === CID
            && assigned.house === 'web' && assigned.contentType === 'exam', JSON.stringify(assigned));

        as = student('stu');
        const sp = await browser.newPage();
        await sp.goto(base + '?class=c-assigned', { waitUntil: 'networkidle0' });
        const sMsg = await sp.$eval('#msg', (el) => el.innerText);
        const sRoster = await sp.$eval('#roster', (el) => el.hidden);
        chk('a STUDENT opening the page sees only the server\'s refusal, and no roster',
            /Only an instructor or admin/.test(sMsg) && sRoster === true, JSON.stringify(sMsg));
    } finally { await browser.close(); srv.close(); }
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
})().catch((e) => { console.log = quiet; console.error('harness fault:', e && e.stack ? e.stack : e); process.exit(2); });
