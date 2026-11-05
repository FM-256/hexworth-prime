#!/usr/bin/env node
/**
 * mdfinal-load.js — the MD-100 final D11 load check (spec D11): concurrent synthetic sittings
 * through the REAL exported callables against the Firestore and Auth emulators.
 *
 * @catalog what    30 concurrent perfect sittings (about 90 writes each, think time compressed 10x)
 * @catalog what    through the shipped mdfinal callables; checks 0 lost ledger entries against an
 * @catalog what    in-memory replay, aborted rate and its one-retry recovery, p95 latency, max doc size.
 * @catalog run     firebase emulators:exec --only firestore,auth "node _tools/mdfinal/mdfinal-load.js"
 * @catalog note    Options: --sittings N (30), --think MS (2200 mean), --dup N (3 sittings get a
 * @catalog note    forced concurrent pair, so the abort path is exercised and cannot pass by absence).
 * @catalog status  TOOL
 *
 * WHY NOT THE FUNCTIONS EMULATOR. The spec names it, but in this repo it loads functions/.env and
 * has fired real Discord webhooks (memory: tests must not reach production side effects). The
 * callables are invoked in-process with .run(), the submit-class-progress.test.js discipline. What
 * that leaves out: cold starts, instance concurrency and the network hop, which only production
 * shows. Latency here is the service plus the Firestore emulator's transaction round trips.
 *
 * WHAT "0 LOST" MEANS. Each sitting's recorded calls are also replayed through the service on an
 * in-memory store, sequentially. The emulator document must end with the same ledger kinds in the
 * same order, and the same graded total. A write lost under contention shows as a shorter ledger.
 */
const path = require('path');
const REPO = path.resolve(__dirname, '../..');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const SITTINGS = parseInt(arg('--sittings', '30'), 10);
const THINK = parseInt(arg('--think', '2200'), 10);
const DUP = parseInt(arg('--dup', '3'), 10);

const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
    if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        console.error('  refusing to run: FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST must be set (emulators:exec --only firestore,auth).');
        return 2;
    }
    if (process.env.DISCORD_WEBHOOK_URL) {
        console.error('  refusing to run: DISCORD_WEBHOOK_URL is set and this loads functions/index.js.');
        return 2;
    }
    process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'hexworth-mdfinal-load';
    process.env.FIREBASE_CONFIG = process.env.FIREBASE_CONFIG || JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

    const kit = require('./mdfinal-test-kit.js');
    const SK = require('./mdfinal-svc-kit.js');
    const W = require('./mdfinal-walk.js');
    const MD = kit.req('mdfinal-exam.js');
    process.env.NETFINAL_SEED_SECRET = kit.TEST_SECRET;   /* the bound secret's .value() reads the env */
    const t = kit.harness('mdfinal-load');

    const admin = require(path.join(REPO, 'functions/node_modules/firebase-admin'));
    const fns = require(path.join(REPO, 'functions/index.js'));
    const db = admin.firestore();
    const EX = SK.EX;
    const CATALOG = 'forge-md100-final';

    /* the cohort: one class, a staff handler (admin claim in the Auth emulator), the final assigned */
    const uids = []; for (let i = 0; i < SITTINGS; i++) { uids.push('mdload-' + String(i).padStart(3, '0')); }
    const HANDLER = 'mdload-handler', CLASS = 'mdload-class';
    try { await admin.auth().createUser({ uid: HANDLER, email: 'mdload-handler@hexworth-smoke.local', emailVerified: true }); } catch (e) { if (!/already/.test(String(e.message))) { throw e; } }
    await admin.auth().setCustomUserClaims(HANDLER, { handler: true });
    await db.doc('classes/' + CLASS).set({ handlerUid: HANDLER, memberUids: uids, memberCount: uids.length, name: 'MD load' });
    await db.doc('classes/' + CLASS + '/assignments/a1').set({ contentId: CATALOG, isActive: true });
    await db.doc('mdfinal_control/' + EX).set({ armed: false, allowUids: uids });

    /* each sitting's calls, recorded from the canonical perfect walk for that uid */
    const plans = uids.map((u, i) => {
        const calls = SK.record(() => W.perfect(u)).calls;
        if (i < DUP) {
            /* a forced concurrent pair just before handover, in the last console the walk used */
            const h = calls.findIndex((c) => c[0] === 'handover');
            const lastExec = calls.slice(0, h).reverse().find((c) => c[0] === 'exec');
            calls.splice(h, 0, ['dup', lastExec[1], 'hostname']);
        }
        return { uid: u, calls };
    });

    const lat = [], slow = [], kinds = {}; let calls = 0, aborted = 0, abortRecovered = 0, abortUnrecovered = 0, refused = 0;
    const auth = (uid) => ({ uid, token: { email_verified: false } });
    /* one callable invocation, as `uid`, timed into `lat` */
    async function timed(fn, uid, data) {
        const t0 = process.hrtime.bigint();
        try { return await fn.run({ data: Object.assign({ examId: EX }, data), auth: auth(uid), rawRequest: { headers: {} } }); }
        finally { const ms = Number(process.hrtime.bigint() - t0) / 1e6; lat.push(ms); slow.push([ms, Object.keys(fns).find((k) => fns[k] === fn) || '?', calls]); calls++; }
    }
    /* the page's rule (md100-final.exam.html call()): an 'aborted' is retried once */
    async function call(fn, uid, data) {
        try { return await timed(fn, uid, data); }
        catch (e) {
            if (!/aborted/.test(String(e.code))) { throw e; }
            aborted++;
            try { const r = await timed(fn, uid, data); abortRecovered++; return r; }
            catch (e2) { abortUnrecovered++; throw e2; }
        }
    }
    /* routes one recorded call [kind, ...args] to its callable */
    function send(uid, c) {
        if (c[0] === 'act') { return call(fns.mdfinalAction, uid, { window: c[1], action: c[2], params: c[3] }); }
        if (c[0] === 'exec') { return call(fns.mdfinalCommand, uid, { console: c[1], line: c[2] }); }
        if (c[0] === 'handover') { return call(fns.mdfinalHandover, uid, { confirm: true }); }
        if (c[0] === 'save') { return call(fns.mdfinalAnswer, uid, { fieldId: c[1], value: c[2] }); }
        throw new Error('unknown call ' + c[0]);
    }

    /* one sitting: start, every recorded call with think time between, then submit */
    async function drive(p) {
        await sleep(Math.random() * THINK);
        await call(fns.mdfinalStart, p.uid, {});
        for (const c of p.calls) {
            kinds[c[0]] = (kinds[c[0]] || 0) + 1;
            try {
                if (c[0] === 'dup') {
                    await Promise.all([send(p.uid, ['exec', c[1], c[2]]), send(p.uid, ['exec', c[1], c[2]])]);
                } else {
                    const r = await send(p.uid, c);
                    if (c[0] === 'act' && r && r.result && r.result.ok === false) { refused++; }
                }
            } catch (e) { refused++; console.log('  ' + p.uid + ' ' + c[0] + ' ' + JSON.stringify(c.slice(1)).slice(0, 100) + ' -> ' + e.code + ' ' + e.message); }
            await sleep(THINK * (0.5 + Math.random()));
        }
        return call(fns.mdfinalSubmit, p.uid, {});
    }

    console.log('  ' + SITTINGS + ' sittings, ' + plans.reduce((a, p) => a + p.calls.length, 0) + ' planned calls, think ~' + THINK + ' ms, ' + DUP + ' forced pairs');
    const T0 = Date.now();
    const subs = await Promise.allSettled(plans.map(drive));
    const wall = Date.now() - T0;

    /* the reference: the same calls, sequentially, through the service on an in-memory store */
    let lost = 0, maxBytes = 0, gradeDiff = 0, recorded = 0;
    for (let i = 0; i < plans.length; i++) {
        const p = plans[i];
        const st = await SK.storeFor([p.uid]);
        const c = SK.clock(Date.now()), o = SK.opts(c);
        const s0 = await MD.startExam(st, { studentId: p.uid, examId: EX }, o);
        const ref = p.calls.flatMap((x) => x[0] === 'dup' ? [['exec', x[1], x[2]], ['exec', x[1], x[2]]] : [x]);
        await SK.replayInto(st, s0.sessionId, ref, o, c);
        const refSub = await MD.submitExam(st, { sessionId: s0.sessionId }, o);
        const refDoc = MD.fromDocument(await st.get(s0.sessionId));

        const snap = await db.doc('mdfinal_sessions/' + MD.sessionIdFor(p.uid, EX)).get();
        const live = snap.exists ? MD.fromDocument(snap.data()) : null;
        const bytes = snap.exists ? Buffer.byteLength(JSON.stringify(snap.data())) : 0;
        maxBytes = Math.max(maxBytes, bytes);
        const a = live ? live.state.ledger.map((e) => e.k).join('|') : '', b = refDoc.state.ledger.map((e) => e.k).join('|');
        if (!live || a !== b) { lost++; console.log('  LEDGER DIFFERS ' + p.uid + ': live ' + (live ? live.state.ledger.length : 'missing') + ' vs reference ' + refDoc.state.ledger.length); }
        const sub = subs[i].status === 'fulfilled' ? subs[i].value : null;
        if (!sub || !sub.report || sub.report.total !== MD.gradebookEntry(refDoc).total) {
            gradeDiff++; console.log('  GRADE DIFFERS ' + p.uid + ': ' + JSON.stringify(sub && sub.report && sub.report.total) + ' vs ' + MD.gradebookEntry(refDoc).total + (subs[i].reason ? ' (' + subs[i].reason.message + ')' : ''));
        }
        void refSub;
        const prog = await db.doc('classes/' + CLASS + '/progress/' + p.uid).get();
        if (prog.exists && prog.data().completions && prog.data().completions[CATALOG]) { recorded++; }
    }

    const rate = calls ? aborted / calls : 0;
    const p50 = pct(lat, 0.5), p95 = pct(lat, 0.95), p99 = pct(lat, 0.99), mx = pct(lat, 1);
    console.log('\n  LOAD REPORT');
    console.log('  wall ' + (wall / 1000).toFixed(1) + ' s; ' + calls + ' callable invocations (' + JSON.stringify(kinds) + ')');
    console.log('  latency ms: p50 ' + p50.toFixed(0) + ', p95 ' + p95.toFixed(0) + ', p99 ' + p99.toFixed(0) + ', max ' + mx.toFixed(0));
    slow.sort((x, y) => y[0] - x[0]);
    console.log('  slowest: ' + slow.slice(0, 6).map((x) => x[1] + ' ' + x[0].toFixed(0) + ' ms (call #' + x[2] + ')').join(', '));
    console.log('  aborted ' + aborted + ' (' + (rate * 100).toFixed(2) + '%), recovered by one retry ' + abortRecovered + ', unrecovered ' + abortUnrecovered);
    console.log('  refused or thrown calls ' + refused + '; ledgers differing from reference ' + lost + '; grades differing ' + gradeDiff);
    console.log('  max document ' + (maxBytes / 1024).toFixed(1) + ' KB; grades recorded to the class ' + recorded + '/' + SITTINGS);

    t.check(lost === 0, '0 lost ledger entries (' + lost + ' sittings differ)');
    t.check(gradeDiff === 0, 'every graded total equals its sequential reference (' + gradeDiff + ' differ)');
    t.check(rate < 0.01, 'aborted rate under 1% (' + (rate * 100).toFixed(2) + '%)');
    t.check(abortUnrecovered === 0, 'every abort recovered by the single retry');
    t.check(DUP === 0 || aborted >= 1, 'the forced concurrent pairs produced at least one abort, so the retry path ran (' + aborted + ')');
    t.check(p95 < 1500, 'p95 latency under 1.5 s (' + p95.toFixed(0) + ' ms)');
    t.check(maxBytes > 0 && maxBytes < 700 * 1024, 'max document under 700 KB (' + (maxBytes / 1024).toFixed(1) + ' KB)');
    t.check(refused === 0, 'no call refused or thrown on the canonical route (' + refused + ')');
    t.check(recorded === SITTINGS, 'every sitting graded into the class gradebook (' + recorded + '/' + SITTINGS + ')');
    t.done();
    return process.exitCode;
}

main().then((c) => process.exit(c || 0)).catch((e) => { console.error(e); process.exit(1); });
