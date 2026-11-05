#!/usr/bin/env node
/**
 * mdfinal-results.test.js — the MD-100 final callables, loaded from the REAL functions/index.js.
 *
 * @catalog what    Loads functions/index.js with firebase stubbed and an in-memory Firestore, then
 * @catalog what    drives the eleven mdfinal* callables: R2 control and window, R7 staff gate
 * @catalog what    (admin / class handler / student), R6 reset rule incl. the mutation case, the
 * @catalog what    gradebook entry (sat/passed, rehearsal never recorded), sweep, mismatch flags,
 * @catalog what    and static checks on the MDFINAL block and the rules.
 * @catalog run     node _tools/mdfinal/mdfinal-results.test.js
 * @catalog note    No network, no emulator, no functions/.env: nothing here can reach production.
 * @catalog status  TOOL
 *
 * Same harness as _tools/netfinal/netfinal-results.test.js (copied, not shared, so netfinal's suite
 * is not modified during this window: spec 1.1).
 */
const path = require('path');
const fs = require('fs');
const Module = require('module');
const REPO = path.resolve(__dirname, '../..');

/* chk records one assertion; section prints a heading. */
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
const SECRET = { value: 'mdfinal-results-test-secret-7f3a91c2e05b' };
const CLAIMS = {};   /* custom claims the code under test writes */
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
    /* a 40-character test secret: the engine refuses anything shorter than 32 (R1) */
    'firebase-functions/params': { defineSecret: () => ({ value: () => SECRET.value }), defineString: () => ({ value: () => '' }) },
    'firebase-admin/app': { initializeApp: () => ({}) },
    /* Real per-user claims, because the gradebook write checks the CLASS OWNER's claims. */
    'firebase-admin/auth': { getAuth: () => ({ setCustomUserClaims: async (uid, c) => { CLAIMS[uid] = JSON.parse(JSON.stringify(c)); }, getUser: async (uid) => {
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

const MD = require(path.join(REPO, 'functions/mdfinal/mdfinal-exam.js'));
const MDX = require(path.join(REPO, 'functions/mdfinal/mdfinal-exams.js'));
const NETFINAL = require(path.join(REPO, 'functions/netfinal/netfinal-exam.js'));
const ADMIN_EMAILS = require(path.join(REPO, 'functions/admin-emails.js'));
const EX = 'md100-final-2026', RH = 'md100-final-rehearsal';
const CID = MDX.catalogId(EX);

/* Callers: a student, a class handler (claim), an admin (claim), a self-made "instructor" with no
   claims. caught returns the error a promise rejects with, or null; call mutes the callable's logs. */
const student = (uid) => ({ auth: { uid, token: { email: uid + '@students.example' } } });
const handler = (uid) => ({ auth: { uid, token: { handler: true, email: uid + '@staff.example' } } });
const admin = (uid) => ({ auth: { uid, token: { admin: true, email: uid + '@staff.example' } } });
const caught = async (p) => { try { await p; return null; } catch (e) { return e; } };
const call = (fn, req, data) => {
    const was = console.log, wasErr = console.error; console.log = () => {}; console.error = () => {};
    return Promise.resolve(fn(Object.assign({}, req, { data: data || {} })))
        .finally(() => { console.log = was; console.error = wasErr; });
};
const code = async (p) => { const e = await caught(p); return e ? e.code : 'ok'; };

(async () => {
section('the harness is real: index.js exports exactly the eleven mdfinal callables');
const NAMES = ['mdfinalStart', 'mdfinalCommand', 'mdfinalWindow', 'mdfinalAction', 'mdfinalAnswer', 'mdfinalHandover', 'mdfinalSubmit',
               'mdfinalReset', 'mdfinalProvision', 'mdfinalResults', 'mdfinalControl'];
const exported = Object.keys(F).filter((k) => /^mdfinal/.test(k)).sort();
chk('the mdfinal* exports are the eleven in spec 1.2', JSON.stringify(exported) === JSON.stringify(NAMES.slice().sort()), exported.join(','));

docs.set('classes/c-md', { name: 'CTS1156C', handlerUid: 'teach', memberUids: ['stu', 'bob', 'late'] });
docs.set('classes/c-md/assignments/a1', { contentId: CID, isActive: true });
docs.set('classes/c-md/progress/stu', { uid: 'stu', completions: { 'forge-md100-m01': { completed: true, score: 90 } } });
docs.set('classes/c-none', { name: 'Not assigned', handlerUid: 'teach', memberUids: ['stu'] });
docs.set('classes/c-evil', { name: 'Evil', handlerUid: 'evil', memberUids: ['stu', 'evil'] });
docs.set('classes/c-evil/assignments/a2', { contentId: CID, isActive: true });
docs.set('users/stu', { displayName: 'Stu Dent', email: 'stu@students.example' });

section('R2: nothing opens until the control document says so');
chk('unauthenticated start refused', (await code(call(F.mdfinalStart, {}, { examId: EX }))) === 'unauthenticated');
chk('an unknown exam id is refused', (await code(call(F.mdfinalStart, student('stu'), { examId: 'attempt2' }))) === 'invalid-argument');
chk('a student cannot start before the window is armed', (await code(call(F.mdfinalStart, student('stu'), { examId: EX }))) === 'failed-precondition');
chk('nothing was created by the refused start', !docs.has('mdfinal_sessions/stu::' + EX));
chk('a student cannot arm the exam', (await code(call(F.mdfinalControl, student('stu'), { examId: EX, armed: true }))) === 'permission-denied');
chk('a class handler cannot arm the exam', (await code(call(F.mdfinalControl, handler('teach'), { examId: EX, armed: true }))) === 'permission-denied');
const ctl = await call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { add: ['stu', 'bob'] } });
chk('an admin allowlists two students', ctl.allowUids.length === 2 && ctl.armed === false);
chk('the allowlist refuses a malformed uid', (await code(call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { add: ['a/b'] } }))) === 'invalid-argument');
const many = Array.from({ length: 19 }, (_, i) => 'u' + i);
chk('the allowlist is capped at 20', (await code(call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { add: many } }))) === 'invalid-argument');
chk('a student on the rehearsal id is refused', (await code(call(F.mdfinalStart, student('stu'), { examId: RH }))) === 'failed-precondition');
const anon = { auth: { uid: 'anon1', token: { firebase: { sign_in_provider: 'anonymous' } } } };
await call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { add: ['anon1'] } });
/* students join classes anonymously (dashboard.html), so an anonymous account must be able to sit */
chk('an allowlisted anonymous account starts the real exam (anonymous class members must not be locked out)', (await call(F.mdfinalStart, anon, { examId: EX })).resumed === false);
chk('and resumes it', (await call(F.mdfinalStart, anon, { examId: EX })).resumed === true);
await call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { remove: ['anon1'] } });
const unverified = { auth: { uid: 'fake', token: { email: ADMIN_EMAILS[0], email_verified: false } } };
chk('an unverified allowlisted email cannot arm the exam (Mallory F4)', (await code(call(F.mdfinalControl, unverified, { examId: EX, armed: true }))) === 'permission-denied');
chk('nor provision', (await code(call(F.mdfinalProvision, unverified, { examId: EX, uid: 'stu' }))) === 'permission-denied');
chk('nor start the rehearsal as admin', (await code(call(F.mdfinalStart, unverified, { examId: RH }))) === 'failed-precondition');

section('the student surface');
const st = await call(F.mdfinalStart, student('stu'), { examId: EX });
chk('an allowlisted student starts', st.resumed === false && st.sessionId === 'stu::' + EX && st.remainingMs > 149 * 60000);
chk('the reply carries no key, fault, snapshot or ledger', !/"answerKey"|"fault"|"snapshot"|"ledger"|"answerKeyJson"/.test(JSON.stringify(st)));
const stored = docs.get('mdfinal_sessions/stu::' + EX);
chk('the session document stores JSON strings, the key included', typeof stored.stateJson === 'string' && typeof stored.answerKeyJson === 'string');
chk('a second start resumes', (await call(F.mdfinalStart, student('stu'), { examId: EX })).resumed === true);
const cmd = await call(F.mdfinalCommand, student('stu'), { examId: EX, console: 'hyperv-ps', line: 'Get-VM' });
chk('a console line runs', typeof cmd.out === 'string' && cmd.context === 'hyperv-ps');
const win = await call(F.mdfinalWindow, student('stu'), { examId: EX, window: 'hyperv' });
chk('a window renders', win.view && Array.isArray(win.view.isoLibrary));
const act = await call(F.mdfinalAction, student('stu'), { examId: EX, window: 'hyperv', action: 'new-vm',
    params: { name: 'MER-WS', generation: 2, memoryMB: 4096, dynamicMemory: false, vhdxGB: 127, switch: 'Meridian-LAN', iso: 'Win11_24H2_Business_x64.iso' } });
chk('an action runs', act.result.ok === true);
chk('a forged sessionId in the request is ignored (the session is the caller\'s)',
    (await call(F.mdfinalCommand, student('bob'), { examId: EX, sessionId: 'stu::' + EX, console: 'hyperv-ps', line: 'Get-VM' }).catch((e) => e)).code === 'not-found');
chk('an answer field not offered is refused', (await code(call(F.mdfinalAnswer, student('stu'), { examId: EX, fieldId: 'I1', value: 'driver' }))) === 'invalid-argument');
chk('handover needs confirm:true', (await code(call(F.mdfinalHandover, student('stu'), { examId: EX }))) === 'invalid-argument');

section('R6 and 13.5 item 6: who may restart');
const selfReset = await call(F.mdfinalReset, student('stu'), { examId: EX });
chk('a student restarts their own build before handover', selfReset.kind === 'self' && selfReset.attempt === 1);
chk('the attempt is archived', [...docs.keys()].some((k) => k.indexOf('mdfinal_sessions_archive/stu::' + EX) === 0));
chk('a student cannot restart another student', (await code(call(F.mdfinalReset, student('bob'), { examId: EX, uid: 'stu' }))) === 'permission-denied');
chk('a class handler cannot restart a student', (await code(call(F.mdfinalReset, handler('teach'), { examId: EX, uid: 'stu' }))) === 'permission-denied');
chk('an admin restart needs a platform fault code', (await code(call(F.mdfinalReset, admin('boss'), { examId: EX, uid: 'stu', reason: 'asked' }))) === 'invalid-argument');
chk('a self-made instructor cannot restart, provision or sweep',
    (await code(call(F.mdfinalReset, student('evil'), { examId: EX, uid: 'stu' }))) === 'permission-denied'
    && (await code(call(F.mdfinalProvision, student('evil'), { examId: EX, uid: 'stu' }))) === 'permission-denied'
    && (await code(call(F.mdfinalResults, student('evil'), { examId: EX, classId: 'c-evil', sweep: true }))) === 'permission-denied');
chk('a self-made instructor cannot read results for the class they built', (await code(call(F.mdfinalResults, student('evil'), { examId: EX, classId: 'c-evil' }))) === 'permission-denied');
chk('a class handler cannot provision', (await code(call(F.mdfinalProvision, handler('teach'), { examId: EX, uid: 'stu' }))) === 'permission-denied');

section('submit, the gradebook entry, and where it goes');
const sub = await call(F.mdfinalSubmit, student('stu'), { examId: EX });
chk('submit returns aggregates only', sub.submitted === true && typeof sub.report.total === 'number' && !sub.report.rows && !sub.report.penalties);
const row = ((docs.get('classes/c-md/progress/stu') || {}).completions || {})[CID];
chk('the assigning class gets the R7 entry', row && row.sat === true && row.passed === false && row.completed === false && row.completedAt === null && row.source === 'mdfinal', JSON.stringify(row));
chk('without wiping the other completion on that row', ((docs.get('classes/c-md/progress/stu') || {}).completions || {})['forge-md100-m01'].score === 90);
chk('a class that did not assign the final gets nothing', !docs.has('classes/c-none/progress/stu'));
chk('a class owned by a non-staff user gets nothing (Mallory\'s planted class)', !docs.has('classes/c-evil/progress/stu'));
chk('a second submit is idempotent', (await call(F.mdfinalSubmit, student('stu'), { examId: EX })).alreadySubmitted === true);
chk('a student cannot restart after submit', (await code(call(F.mdfinalReset, student('stu'), { examId: EX }))) === 'permission-denied');
/* 13.19 item 1, on a disposable student so the sections below keep stu's sitting */
await call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { add: ['nl'] } });
await call(F.mdfinalStart, student('nl'), { examId: EX });
await call(F.mdfinalSubmit, student('nl'), { examId: EX });
const nlBefore = JSON.parse(docs.get('mdfinal_sessions/nl::' + EX).answerKeyJson);
const nlReset = await call(F.mdfinalReset, admin('boss'), { examId: EX, uid: 'nl', reason: 'outage', evidence: 'INC-1' });
const nlAfter = docs.get('mdfinal_sessions/nl::' + EX);
chk('an admin restart of a submitted sitting deals a new lab (seed 1) through the callable',
    nlReset.kind === 'admin' && JSON.parse(nlAfter.lineageJson).seed === 1 && !nlAfter.submittedAt && JSON.stringify(JSON.parse(nlAfter.answerKeyJson)) !== JSON.stringify(nlBefore));

section('R6 mutation: swapping in netfinal\'s rule must be visible to this suite');
/* on a disposable student, because the swapped rule really does reset the sitting */
await call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { add: ['mut'] } });
await call(F.mdfinalStart, student('mut'), { examId: EX });
await call(F.mdfinalSubmit, student('mut'), { examId: EX });
chk('(baseline) the after-submit self-reset is denied', (await code(call(F.mdfinalReset, student('mut'), { examId: EX }))) === 'permission-denied');
const realMay = MD.mayReset;
MD.mayReset = NETFINAL.mayReset;
const swapped = await code(call(F.mdfinalReset, student('mut'), { examId: EX }));
MD.mayReset = realMay;
chk('with NETFINAL.mayReset swapped in, the after-submit self-reset is NO LONGER denied (the suite would go red)', swapped !== 'permission-denied', swapped);
await call(F.mdfinalSubmit, student('mut'), { examId: EX });
chk('restored: denied again', (await code(call(F.mdfinalReset, student('mut'), { examId: EX }))) === 'permission-denied');

section('rehearsal: never recorded');
await call(F.mdfinalControl, admin('boss'), { examId: RH, allowUids: { add: ['bob'] } });
await call(F.mdfinalStart, student('bob'), { examId: RH });
await call(F.mdfinalSubmit, student('bob'), { examId: RH });
chk('a submitted rehearsal writes no gradebook entry', !docs.has('classes/c-md/progress/bob'));
chk('an admin starts the rehearsal without the allowlist', (await call(F.mdfinalStart, admin('boss'), { examId: RH })).resumed === false);

section('R7 results: who sees what, sweep, mismatch flags');
chk('a student cannot read results', (await code(call(F.mdfinalResults, student('stu'), { examId: EX, classId: 'c-md' }))) === 'permission-denied');
const hr = await call(F.mdfinalResults, handler('teach'), { examId: EX, classId: 'c-md' });
chk('the class handler reads their assigning class', hr.students && hr.students.length === 3 && typeof hr.csv === 'string');
chk('the handler sees totals and phases, never the per-check report (13.19 item 4)', (() => { const r = hr.students.find((s) => s.uid === 'stu').sitting.report; return r && typeof r.display === 'number' && r.phases && !r.rows && !r.penalties; })());
chk('the handler CSV carries totals only', /^studentId,total,result,flags\n/.test(hr.csv) && hr.csv.indexOf('row1.1') < 0, hr.csv.slice(0, 80));
const ar = await call(F.mdfinalResults, admin('boss'), { examId: EX, classId: 'c-md' });
chk('an admin still sees the full report and the per-row CSV', ar.students.find((s) => s.uid === 'stu').sitting.report.rows.length === 24 && /row1\.1/.test(ar.csv));
chk('the handler cannot sweep', (await code(call(F.mdfinalResults, handler('teach'), { examId: EX, classId: 'c-md', sweep: true }))) === 'permission-denied');
chk('a handler without the claim is refused', (await code(call(F.mdfinalResults, { auth: { uid: 'teach', token: {} } }, { examId: EX, classId: 'c-md' }))) === 'permission-denied');
chk('a handler cannot read a class they do not own', (await code(call(F.mdfinalResults, handler('other'), { examId: EX, classId: 'c-md' }))) === 'permission-denied');
chk('a student gets the same answer for a real class and a missing one (Mallory R5 L3)',
    (await code(call(F.mdfinalResults, student('stu'), { examId: EX, classId: 'c-md' }))) === 'permission-denied'
    && (await code(call(F.mdfinalResults, student('stu'), { examId: EX, classId: 'no-such-class' }))) === 'permission-denied');
chk('a handler cannot read their own class that did not assign the final', (await code(call(F.mdfinalResults, handler('teach'), { examId: EX, classId: 'c-none' }))) === 'permission-denied');
const list = await call(F.mdfinalResults, handler('teach'), { examId: EX });
chk('without a class, a handler gets their assigning classes', list.classes.length === 1 && list.classes[0].id === 'c-md');
docs.set('classes/c-md/progress/late', { uid: 'late', completions: { [CID]: { sat: true, passed: true, completed: true, score: 100, total: 100, source: 'mdfinal' } } });
docs.set('classes/c-md/progress/bob', { uid: 'bob', completions: { [CID]: { sat: true, passed: true, completed: true, score: 100, total: 100, source: 'student' } } });
const fl = await call(F.mdfinalResults, admin('boss'), { examId: EX, classId: 'c-md' });
const flags = (u) => fl.students.find((s) => s.uid === u).flags;
chk('flag (a): a progress row with no session', flags('late').indexOf('progress row present, no session') >= 0, JSON.stringify(flags('late')));
chk('flag (c): a progress row from another source', flags('bob').indexOf('progress source is not mdfinal') >= 0, JSON.stringify(flags('bob')));
chk('flag (d): a row claiming a pass with no submitted sitting (Mallory F2)', flags('late').indexOf('progress claims a sitting that is not submitted') >= 0, JSON.stringify(flags('late')));
docs.set('classes/c-md/progress/stu', { uid: 'stu', completions: { [CID]: { sat: true, passed: true, completed: true, score: 99, total: 99, source: 'mdfinal' } } });
const fl2 = await call(F.mdfinalResults, admin('boss'), { examId: EX, classId: 'c-md' });
const stuRow = fl2.students.find((s) => s.uid === 'stu');
chk('opening the class rebuilds a tampered entry from the session', ((docs.get('classes/c-md/progress/stu') || {}).completions || {})[CID].score === row.score);
chk('flag (b): the tampered row is flagged as differing from the session', stuRow.flags.indexOf('progress differs from the session') >= 0, JSON.stringify(stuRow.flags));
chk('(could fail) an honest row carries no flag', fl.students.find((s) => s.uid === 'stu').flags.length === 0, JSON.stringify(fl.students.find((s) => s.uid === 'stu').flags));
/* sweep: a sitting left open past its clock is auto-submitted only on an admin's sweep:true */
await call(F.mdfinalControl, admin('boss'), { examId: EX, allowUids: { add: ['late'] } });
await call(F.mdfinalStart, student('late'), { examId: EX });
const realNow = Date.now;
Date.now = () => realNow() + 151 * 60000;
await call(F.mdfinalResults, admin('boss'), { examId: EX, classId: 'c-md' });
chk('results without sweep:true never submit', !JSON.parse(JSON.stringify(docs.get('mdfinal_sessions/late::' + EX))).submittedAt);
await call(F.mdfinalResults, admin('boss'), { examId: EX, classId: 'c-md', sweep: true });
Date.now = realNow;
const lateDoc = docs.get('mdfinal_sessions/late::' + EX);
chk('an admin sweep auto-submits the expired sitting', !!lateDoc.submittedAt && lateDoc.autoSubmitted === true);
const all = await call(F.mdfinalResults, admin('boss'), { examId: EX });
chk('an admin without a class also gets the classes that assigned the final', Array.isArray(all.classes) && all.classes.some((c) => c.id === 'c-md') && !all.classes.some((c) => c.id === 'c-none'), JSON.stringify(all.classes));
chk('an admin without a class gets every sitting of the exam (stu, late, mut, anon1, nl)', all.students.length === 5 && /studentId,total/.test(all.csv), all.students.map((s) => s.uid).join(','));

section('secret: a weak bound secret fails closed');
const keep = SECRET.value; SECRET.value = 'too-short';
chk('a start with a short secret is refused', (await code(call(F.mdfinalStart, admin('boss2'), { examId: RH }))) === 'failed-precondition');
SECRET.value = keep;

section('platform requireAdmin (13.19 item 5b): the allowlist route needs a verified email');
/* adminSearchUsers checks requireAdmin first, then refuses an empty query: the code shows which gate answered */
chk('an unverified allowlisted email is refused by requireAdmin', (await code(call(F.adminSearchUsers, { auth: { uid: 'fake', token: { email: ADMIN_EMAILS[0], email_verified: false } } }, { query: '' }))) === 'permission-denied');
chk('a token with no email_verified is refused too', (await code(call(F.adminSearchUsers, { auth: { uid: 'fake', token: { email: ADMIN_EMAILS[0] } } }, { query: '' }))) === 'permission-denied');
chk('(could fail) a verified allowlisted email passes the gate', (await code(call(F.adminSearchUsers, { auth: { uid: 'real', token: { email: ADMIN_EMAILS[0], email_verified: true } } }, { query: '' }))) === 'invalid-argument');
chk('(could fail) the admin claim passes the gate', (await code(call(F.adminSearchUsers, admin('boss'), { query: '' }))) === 'invalid-argument');

section('every allowlist check needs a verified email (13.20)');
AUTH.fake = { email: ADMIN_EMAILS[0], customClaims: {} };
await caught(call(F.setAdminClaim, { auth: { uid: 'fake', token: { email: ADMIN_EMAILS[0], email_verified: false } } }, {}));
chk('setAdminClaim does not make an unverified allowlisted account an admin', !CLAIMS.fake || CLAIMS.fake.admin !== true, JSON.stringify(CLAIMS.fake));
AUTH.real = { email: ADMIN_EMAILS[0], customClaims: {} };
await caught(call(F.setAdminClaim, { auth: { uid: 'real', token: { email: ADMIN_EMAILS[0], email_verified: true } } }, {}));
chk('(could fail) setAdminClaim does make a verified allowlisted account an admin', CLAIMS.real && CLAIMS.real.admin === true, JSON.stringify(CLAIMS.real));
const unv = { auth: { uid: 'fake', token: { email: ADMIN_EMAILS[0], email_verified: false } } };
for (const fn of ['getCohortComparison', 'c2GeneratePairingCode', 'c2ListDevices', 'postPatchNote', 'createTournamentChannels', 'announceNewContent']) {
    if (typeof F[fn] !== 'function') { chk('callable exists: ' + fn, false); continue; }
    chk(fn + ' refuses an unverified allowlisted email', (await code(call(F[fn], unv, {}))) === 'permission-denied');
}
const rulesText = fs.readFileSync(path.join(REPO, 'firestore.rules'), 'utf8');
chk('rules isAdmin needs email_verified for the allowlist route', /function isAdmin\(\) \{[\s\S]{0,400}email_verified == true && \(/.test(rulesText));
const idx2 = fs.readFileSync(path.join(REPO, 'functions/index.js'), 'utf8');
const loose = idx2.split('\n').filter((l) => /ADMIN_EMAILS\.includes\(/.test(l) && !/email_verified/.test(l));
chk('the only allowlist check without email_verified is netfinal\'s frozen block', loose.length === 1 && /String\(request\.auth\.token\.email/.test(loose[0]), loose.join(' | '));

section('static checks on the MDFINAL block and the rules');
const src = fs.readFileSync(path.join(REPO, 'functions/index.js'), 'utf8');
const a = src.indexOf('/* ═══ MDFINAL BEGIN'), b = src.indexOf('/* ═══ MDFINAL END');
const block = a >= 0 && b > a ? src.slice(a, b) : '';
chk('the block is delimited once', a >= 0 && b > a && src.indexOf('/* ═══ MDFINAL BEGIN', a + 1) < 0);
chk('the block never uses netfinal\'s reset or staff rule for a reset', !/NETFINAL\.(mayReset|resetSession|isStaff)/.test(block));
chk('the reset callable goes through the MD service', /MD\.resetSession\(/.test(block));
chk('index.js never references generateForced (13.6 item 12)', src.indexOf('generateForced') < 0);
chk('the service is required lazily (no top-level require of mdfinal-exam.js)', !/^const .*require\('\.\/mdfinal\/mdfinal-exam\.js'\)/m.test(block) && /function mdfinalService\(\)/.test(block));
chk('every callable passes the secret', (block.match(/netfinalSeedSecret\.value\(\)/g) || []).length >= 4);
const rules = fs.readFileSync(path.join(REPO, 'firestore.rules'), 'utf8');
['mdfinal_sessions/{sessionId}', 'mdfinal_sessions_archive/{archiveId}', 'mdfinal_control/{examId}'].forEach((m) => {
    const i = rules.indexOf('match /' + m);
    chk('rules: ' + m + ' denies all client access', i >= 0 && /^\s*\{\s*allow read, write: if false;\s*\}/.test(rules.slice(i + ('match /' + m).length)));
});
chk('admin allowlist is loaded from the shared module', Array.isArray(ADMIN_EMAILS));

console.log('\nmdfinal-results: ' + pass + ' passed, ' + fail + ' failed');
process.exitCode = fail ? 1 : 0;
})().catch((e) => { console.log('FATAL ' + (e && e.stack)); process.exitCode = 2; });
