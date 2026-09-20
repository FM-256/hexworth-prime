#!/usr/bin/env node
/**
 * ctf-box-pool.test.js
 *
 * @catalog what   Runs the SHIPPED box-pool functions against a rules-enforced emulator: the pool
 *                 is admin-only, wiring writes one assignment per team from pinned boxes first, a
 *                 pool too small REFUSES and writes NOTHING, and an existing assignment is left.
 * @catalog run    firebase emulators:exec --only firestore --project=demo-hexworth "NODE_PATH=$(pwd)/node_modules node _tools/rules-test/ctf-box-pool.test.js"
 * @catalog status TOOL
 *
 * WHY IT EXISTS. Wiring six per-team machines by hand before every event is a pre-event manual step,
 * and a pre-event manual step is one that gets skipped before some event. The pool records each box
 * ONCE (credentials belong to the machine, not the event) and wires a whole tournament in one click.
 *
 * THE PROPERTY THIS SUITE EXISTS FOR is the refusal. A pool that cannot cover every team must write
 * NOTHING: four of six teams holding a machine is not a partly-ready tournament, it is an unfair
 * one, and the operator would learn about it from a student rather than from the panel. A test that
 * only checked the happy path would let that regress silently, so the short-pool case asserts BOTH
 * that it refuses AND that zero documents were created.
 *
 * THE ALL-OR-NOTHING PROPERTY IS PROTECTED TWICE, which the mutation testing revealed rather than
 * the code reading. Defeating only the explicit `pool.length < teams.length` check does NOT produce
 * a partial wiring, because the function builds the whole plan BEFORE writing anything and a
 * per-row guard bails if any team came up empty. So a single-guard mutant leaves "wrote ZERO"
 * passing, and that looked at first like the assertion had no teeth. Defeating BOTH guards produces
 * 2 partial writes and the assertion fails, which is how it was confirmed to discriminate. Worth
 * knowing before anyone "simplifies" either guard on the grounds that the other one covers it: they
 * cover different things, and only the pair makes the property hold.
 *
 * ALSO ASSERTS PROVENANCE. Each written assignment records `fromPool`, so an assignment can be
 * traced back to the machine it came from without reading credentials.
 */
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { doc, getDoc, getDocs, collection, setDoc, writeBatch, runTransaction, deleteField, deleteDoc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const { extractShipped } = require('./lib/extract-shipped');

const CONSOLE = process.env.CONSOLE_PATH || path.join(__dirname, '..', '..', '_app', 'admin', 'console.html');
let pass = 0, fail = 0;
const chk = (n, ok, d) => { console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`); ok ? pass++ : fail++; };

const TEAMS = [
    { id: 'team-blue', name: 'Blue Shield' }, { id: 'team-cyan', name: 'Cyan Storm' },
    { id: 'team-gold', name: 'Gold Strike' }, { id: 'team-green', name: 'Green Ops' },
    { id: 'team-purple', name: 'Purple Haze' }, { id: 'team-red', name: 'Red Cell' },
];

(async () => {
    console.log('\n== ctf box pool (shipped code, rules enforced) ==');
    const testEnv = await initializeTestEnvironment({
        projectId: 'demo-hexworth',
        firestore: { rules: fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8') },
    });
    const adminDb = testEnv.authenticatedContext('adminUser', { admin: true }).firestore();
    const studentDb = testEnv.authenticatedContext('someStudent').firestore();

    const T = 't-pool';
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        await setDoc(doc(d, `tournaments/${T}`), { name: 'Pool Event', status: 'lobby' });
        for (const t of TEAMS) await setDoc(doc(d, `tournaments/${T}/teams/${t.id}`), { name: t.name, members: [] });
        await setDoc(doc(d, `tournaments/${T}/challenges/ch-01`), { title: 'The Real Box', order: 1, points: 100 });
    });

    /* Shims: one report element per id is enough because each function reads one. The DOM inputs are
     * the only browser surface these functions touch besides the firestore module. */
    const fields = {};
    const report = { textContent: '' };
    global.document = { getElementById: (id) => (id.endsWith('Report') ? report : (fields[id] = fields[id] || { value: '' })) };
    global.showToast = () => {};
    global.window = global;
    global._firestoreModule = { doc, getDoc, getDocs, collection, setDoc, writeBatch, runTransaction, deleteField, deleteDoc, serverTimestamp };
    global.db = adminDb;
    global._ctfEditingId = T;
    global.escHtml = (v) => String(v);

    eval(extractShipped(CONSOLE, 'saveBoxPoolEntry'));
    eval(extractShipped(CONSOLE, 'listBoxPool'));
    eval(extractShipped(CONSOLE, 'wirePoolToTeams'));
    eval(extractShipped(CONSOLE, 'releasePoolFromTournament'));
    global.confirm = () => true;
    chk('extracted all three shipped pool functions', typeof global.wirePoolToTeams === 'function'
        && typeof global.saveBoxPoolEntry === 'function' && typeof global.listBoxPool === 'function');

    const setFields = (o) => { for (const k of ['bpLabel', 'bpTeamId', 'bpUrl', 'bpUser', 'bpPass', 'bpNote', 'rbChallenge']) fields[k] = { value: o[k] || '' }; };
    const assignments = async () => {
        let n = 0, rows = [];
        await testEnv.withSecurityRulesDisabled(async (c) => {
            for (const t of TEAMS) {
                const s = await getDocs(collection(c.firestore(), `tournaments/${T}/teams/${t.id}/assignments`));
                n += s.size;
                s.docs.forEach(d => rows.push({ team: t.id, id: d.id, ...d.data() }));
            }
        });
        return { n, rows };
    };

    // ── An empty pool cannot wire anything ───────────────────────────────────
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    chk('empty pool: refuses and says so', /pool is EMPTY/i.test(report.textContent), report.textContent.slice(0, 60));
    chk('empty pool: wrote nothing', (await assignments()).n === 0);

    // ── A pool SHORTER than the team count must write NOTHING ────────────────
    for (const b of [['engine1-red-cell', 'team-red'], ['engine1-blue-shield', 'team-blue']]) {
        setFields({ bpLabel: b[0], bpTeamId: b[1], bpUrl: 'https://engine1.example.test/t/tok-' + b[0] + '/', bpUser: 'player', bpPass: 'pw-' + b[0] });
        await global.saveBoxPoolEntry();
    }
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    const shortState = await assignments();
    chk('short pool: REFUSES', /REFUSED/.test(report.textContent), report.textContent.split('\n')[0].slice(0, 80));
    chk('short pool: says how many short', /4 more box/.test(report.textContent));
    chk('short pool: wrote ZERO assignments (all or none)', shortState.n === 0, `found ${shortState.n}`);

    // ── A full pool wires every team, pinned boxes to their named team ────────
    for (const b of [['engine1-cyan-storm', 'team-cyan'], ['engine1-gold-strike', 'team-gold'],
                     ['engine1-green-ops', 'team-green'], ['engine1-purple-haze', 'team-purple']]) {
        setFields({ bpLabel: b[0], bpTeamId: b[1], bpUrl: 'https://engine1.example.test/t/tok-' + b[0] + '/', bpUser: 'player', bpPass: 'pw-' + b[0] });
        await global.saveBoxPoolEntry();
    }
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    const full = await assignments();
    chk('full pool: one assignment per team', full.n === TEAMS.length, `${full.n} of ${TEAMS.length}`);
    const blue = full.rows.find(r => r.team === 'team-blue');
    chk('full pool: a PINNED box landed on its named team', blue && blue.fromPool === 'engine1-blue-shield', blue && blue.fromPool);
    chk('full pool: the credential came with it', blue && blue.username === 'player' && /tok-engine1-blue-shield/.test(blue.url || ''));
    chk('full pool: every assignment records provenance', full.rows.every(r => !!r.fromPool));
    chk('full pool: challengeId set on every assignment', full.rows.every(r => r.challengeId === 'ch-01'));
    /* Was `new Set(fromPool).size`, which is DOC ID uniqueness and therefore guaranteed by Firestore
     * for free: it proved nothing. Nancy caught that two pool entries can hold the same URL, which is
     * two teams on one physical machine. Measure the thing that matters. */
    chk('full pool: no two teams share a MACHINE (url, not doc id)', new Set(full.rows.map(r => r.url)).size === TEAMS.length,
        `${new Set(full.rows.map(r => r.url)).size} distinct urls for ${TEAMS.length} teams`);
    chk('full pool: every box is CLAIMED after wiring', await (async () => {
        let ok = true;
        await testEnv.withSecurityRulesDisabled(async (c) => {
            const snap = await getDocs(collection(c.firestore(), 'box_pool'));
            const claimed = snap.docs.filter(d => (d.data().assignedTo || {}).tournamentId === T);
            ok = claimed.length === TEAMS.length;
        });
        return ok;
    })());

    // ── An existing assignment is left alone, not clobbered ──────────────────
    await testEnv.withSecurityRulesDisabled(async (c) => {
        await setDoc(doc(c.firestore(), `tournaments/${T}/teams/team-red/assignments/ch-01`),
            { challengeId: 'ch-01', url: 'https://HAND-PLACED.example.test/', fromPool: 'hand' });
    });
    report.textContent = '';
    await global.wirePoolToTeams();
    let red = null;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        red = (await getDoc(doc(c.firestore(), `tournaments/${T}/teams/team-red/assignments/ch-01`))).data();
    });
    chk('existing assignment: NOT overwritten', red.url === 'https://HAND-PLACED.example.test/', red.url);
    chk('existing assignment: reported as left alone', /already assigned/.test(report.textContent));

    // ── The pool is admin-only, and the panel withholds secrets ──────────────
    let studentRead = 'ALLOWED';
    try { const s = await getDocs(collection(studentDb, 'box_pool')); studentRead = s.size + ' docs'; }
    catch (e) { studentRead = 'DENIED'; }
    chk('a signed-in student CANNOT read the pool', studentRead === 'DENIED', studentRead);

    report.textContent = '';
    await global.listBoxPool();
    chk('listing shows the boxes', /6 box\(es\) in the pool/.test(report.textContent), report.textContent.split('\n')[0]);
    chk('listing NEVER prints a password', !/pw-engine1/.test(report.textContent));
    chk('listing NEVER prints a token URL', !/tok-engine1/.test(report.textContent));

    /* ── MALLORY'S FINDING 1: the same box must not be handed to two tournaments ───────────
     * She wired one pool to two tournaments and both succeeded silently, leaving t-fixD1/team-blue
     * and t-fixD2/team-blue with the same fromPool AND the same url. Two unrelated teams on one live
     * Windows box, each believing it is theirs, either able to sabotage the other. */
    const T2 = 't-pool-second';
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        await setDoc(doc(d, `tournaments/${T2}`), { name: 'Second Event', status: 'lobby' });
        for (const t of TEAMS) await setDoc(doc(d, `tournaments/${T2}/teams/${t.id}`), { name: t.name, members: [] });
        await setDoc(doc(d, `tournaments/${T2}/challenges/ch-01`), { title: 'Also The Real Box', order: 1 });
    });
    global._ctfEditingId = T2;
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    let secondCount = 0;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        for (const t of TEAMS) {
            const snap = await getDocs(collection(c.firestore(), `tournaments/${T2}/teams/${t.id}/assignments`));
            secondCount += snap.size;
        }
    });
    chk('second tournament: REFUSED, boxes already claimed', /already wired to a live tournament/.test(report.textContent),
        report.textContent.split('\n')[0].slice(0, 80));
    chk('second tournament: wrote ZERO (no shared machine)', secondCount === 0, `found ${secondCount}`);

    // ── RELEASE frees them, without deleting anyone's assignment ─────────────
    global._ctfEditingId = T;
    report.textContent = '';
    await global.releasePoolFromTournament();
    chk('release: reports what it freed', /released 6 box\(es\)/.test(report.textContent), report.textContent.split('\n')[0]);
    const afterRelease = await assignments();
    chk('release: per-team assignments NOT deleted', afterRelease.n === TEAMS.length, `${afterRelease.n} remain`);

    global._ctfEditingId = T2;
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    let secondAfter = 0;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        for (const t of TEAMS) secondAfter += (await getDocs(collection(c.firestore(), `tournaments/${T2}/teams/${t.id}/assignments`))).size;
    });
    chk('after release: the second tournament CAN be wired', secondAfter === TEAMS.length, `${secondAfter} of ${TEAMS.length}`);

    /* ── NANCY AND MALLORY BOTH PROVED THIS: a throw mid-write left a PARTIAL wiring ───────
     * The writes are now one batch, so a failing commit must leave nothing. This is the test the
     * original 18/0 did not contain: my mutation testing covered the two PLANNING guards and never
     * threw during the write phase, which is exactly where the gap was. */
    const T3 = 't-pool-atomic';
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        await setDoc(doc(d, `tournaments/${T3}`), { name: 'Atomic Event', status: 'lobby' });
        for (const t of TEAMS) await setDoc(doc(d, `tournaments/${T3}/teams/${t.id}`), { name: t.name, members: [] });
        await setDoc(doc(d, `tournaments/${T3}/challenges/ch-01`), { title: 'Atomic', order: 1 });
        const snap = await getDocs(collection(c.firestore(), 'box_pool'));
        for (const dd of snap.docs) await setDoc(doc(c.firestore(), 'box_pool', dd.id), { label: dd.id, teamId: dd.data().teamId, url: dd.data().url, username: dd.data().username, password: dd.data().password }, { merge: false });
    });
    global._ctfEditingId = T3;
    /* THE MECHANISM CHANGED, THE PROPERTY DID NOT. This shim used to intercept `writeBatch` and throw
     * on commit. The wiring now uses `runTransaction` (to close the race), so a writeBatch shim would
     * intercept nothing and the test would pass while proving nothing: repairing a test around a
     * changed implementation is how coverage gets silently dropped. It now lets the REAL transaction
     * run the function's callback, queueing every write, and then throws inside it so Firestore
     * aborts. Same assertion, same property: a failed write leaves nothing behind. */
    global._firestoreModule = {
        doc, getDoc, getDocs, collection, setDoc, writeBatch, deleteField, deleteDoc, serverTimestamp,
        runTransaction: async (dbArg, fn) => runTransaction(dbArg, async (tx) => {
            await fn(tx);
            throw new Error('SIMULATED commit failure');
        }),
    };
    eval(extractShipped(CONSOLE, 'wirePoolToTeams'));
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    let atomicCount = 0;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        for (const t of TEAMS) atomicCount += (await getDocs(collection(c.firestore(), `tournaments/${T3}/teams/${t.id}/assignments`))).size;
    });
    /* Capture BEFORE the control below re-runs the function: the shared `report` object is mutated by
     * every call, and asserting on it after the control had already overwritten it is how this test
     * briefly claimed the failure message was wrong when it was fine. Same shape as a harness
     * carrying state between cases. */
    const failureReport = report.textContent;
    chk('commit failure: wrote ZERO assignments (genuinely atomic)', atomicCount === 0, `found ${atomicCount}`);
    /* POSITIVE CONTROL for the line above. Zero writes could mean "atomic" or it could mean "nothing
     * was ever planned", and those look identical in the assertion. Re-run the SAME fixture with a
     * working commit: if it writes 6, then the 0 above was caused by the failure and not by an empty
     * plan. Without this, the atomicity test could pass on a fixture that does nothing. */
    global._firestoreModule = { doc, getDoc, getDocs, collection, setDoc, writeBatch, runTransaction, deleteField, deleteDoc, serverTimestamp };
    eval(extractShipped(CONSOLE, 'wirePoolToTeams'));
    report.textContent = '';
    await global.wirePoolToTeams();
    let atomicControl = 0;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        for (const t of TEAMS) atomicControl += (await getDocs(collection(c.firestore(), `tournaments/${T3}/teams/${t.id}/assignments`))).size;
    });
    chk('control: the SAME fixture writes 6 when commit works (so the 0 above was the failure)',
        atomicControl === TEAMS.length, `${atomicControl} of ${TEAMS.length}`);
    chk('commit failure: the operator is TOLD nothing was written', /NOTHING was written/.test(failureReport),
        failureReport.slice(0, 90));

    /* ── THE SAME MACHINE RECORDED TWICE under two labels ─────────────────────────────────── */
    global._firestoreModule = { doc, getDoc, getDocs, collection, setDoc, writeBatch, runTransaction, deleteField, deleteDoc, serverTimestamp };
    eval(extractShipped(CONSOLE, 'wirePoolToTeams'));
    const T4 = 't-pool-dup';
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        await setDoc(doc(d, `tournaments/${T4}`), { name: 'Dup Event', status: 'lobby' });
        for (const t of TEAMS.slice(0, 2)) await setDoc(doc(d, `tournaments/${T4}/teams/${t.id}`), { name: t.name, members: [] });
        await setDoc(doc(d, `tournaments/${T4}/challenges/ch-01`), { title: 'Dup', order: 1 });
        const snap = await getDocs(collection(c.firestore(), 'box_pool'));
        for (const dd of snap.docs) await setDoc(doc(c.firestore(), 'box_pool', dd.id), { assignedTo: deleteField() }, { merge: true });
        /* Two labels, ONE machine: the copy-paste an operator makes at 8am before an event. */
        await setDoc(doc(d, 'box_pool/typo-copy'), { label: 'typo-copy', teamId: 'team-cyan', url: 'https://engine1.example.test/t/tok-engine1-blue-shield/', username: 'player', password: 'x' });
    });
    global._ctfEditingId = T4;
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    let dupCount = 0;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        for (const t of TEAMS.slice(0, 2)) dupCount += (await getDocs(collection(c.firestore(), `tournaments/${T4}/teams/${t.id}/assignments`))).size;
    });
    chk('duplicate URL: REFUSED', /SAME machine/.test(report.textContent), report.textContent.split('\n')[0].slice(0, 70));
    chk('duplicate URL: wrote ZERO', dupCount === 0, `found ${dupCount}`);
    chk('duplicate URL: the URL itself is not printed', !/tok-engine1-blue-shield/.test(report.textContent));

    /* ── NANCY'S BACK DOOR: a claimed box plus an UNCLAIMED twin sharing its URL ───────────
     * My earlier duplicate-URL fixture cleared every claim first, so both copies were free and
     * landed in one plan together: it only ever tested same-call duplication. Her scenario is doc A
     * (url X, claimed by tournament-1) beside doc B (url X, free). A second tournament selecting B
     * passes the claim check (B is free) and passes the in-plan duplicate check (only one entry with
     * url X is in ITS plan), and is wired to the machine tournament-1 is using. */
    const T5 = 't-pool-twin';
    const TWIN_URL = 'https://engine1.example.test/t/tok-engine1-blue-shield/';
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        await setDoc(doc(d, `tournaments/${T5}`), { name: 'Twin Event', status: 'lobby' });
        for (const t of TEAMS.slice(0, 1)) await setDoc(doc(d, `tournaments/${T5}/teams/${t.id}`), { name: t.name, members: [] });
        await setDoc(doc(d, `tournaments/${T5}/challenges/ch-01`), { title: 'Twin', order: 1 });
        const snap = await getDocs(collection(d, 'box_pool'));
        for (const dd of snap.docs) await setDoc(doc(d, 'box_pool', dd.id), { assignedTo: deleteField() }, { merge: true });
        /* A is CLAIMED elsewhere; B is free and shares A's url. Only B is pinned to this team. */
        await setDoc(doc(d, 'box_pool/twin-a'), { label: 'twin-a', url: TWIN_URL, username: 'player', password: 'x',
            assignedTo: { tournamentId: 'some-other-tournament', teamId: 'team-blue', challengeId: 'ch-01' } });
        await setDoc(doc(d, 'box_pool/twin-b'), { label: 'twin-b', teamId: 'team-blue', url: TWIN_URL, username: 'player', password: 'x' });
    });
    global._ctfEditingId = T5;
    setFields({ rbChallenge: 'ch-01' });
    report.textContent = '';
    await global.wirePoolToTeams();
    let twinCount = 0;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        twinCount = (await getDocs(collection(c.firestore(), `tournaments/${T5}/teams/team-blue/assignments`))).size;
    });
    chk('twin via back door: REFUSED', /DUPLICATE of a machine already in use/.test(report.textContent),
        report.textContent.split('\n')[0].slice(0, 76));
    chk('twin via back door: wrote ZERO', twinCount === 0, `found ${twinCount}`);
    chk('twin via back door: the shared URL is not printed', !/tok-engine1-blue-shield/.test(report.textContent));

    /* ── MALLORY'S RACE: two concurrent wirings must not both win ──────────────────────────
     * She proved the writeBatch version let both commit: 12 assignments over 6 machines. Two
     * genuinely isolated instances, each with its OWN window/db/_ctfEditingId, started without
     * awaiting the first, is the only way to reproduce two browser tabs; sharing globals would test
     * nothing. A transaction re-reads the claim, so exactly one side must win. */
    function isolatedWire(tournamentId) {
        const win = {};
        const localFields = { rbChallenge: { value: 'ch-01' }, bpReport: { textContent: '' } };
        const fn = new Function('window', 'document', 'db', '_ctfEditingId', '_firestoreModule', 'showToast', 'confirm', 'escHtml',
            extractShipped(CONSOLE, 'wirePoolToTeams') + '; return window.wirePoolToTeams;')(
            win,
            { getElementById: (id) => localFields[id] || (localFields[id] = { value: '' }) },
            adminDb, tournamentId,
            { doc, getDoc, getDocs, collection, setDoc, writeBatch, runTransaction, deleteField, serverTimestamp },
            () => {}, () => true, (v) => String(v));
        return { run: fn, report: () => localFields.bpReport.textContent };
    }
    const R1 = 't-race-a', R2 = 't-race-b';
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const d = c.firestore();
        const snap = await getDocs(collection(d, 'box_pool'));
        for (const dd of snap.docs) await setDoc(doc(d, 'box_pool', dd.id), { assignedTo: deleteField() }, { merge: true });
        for (const dd of snap.docs) if (dd.id.startsWith('twin-') || dd.id === 'typo-copy') await deleteDoc(doc(d, 'box_pool', dd.id));
        for (const tid of [R1, R2]) {
            await setDoc(doc(d, `tournaments/${tid}`), { name: tid, status: 'lobby' });
            for (const t of TEAMS) await setDoc(doc(d, `tournaments/${tid}/teams/${t.id}`), { name: t.name, members: [] });
            await setDoc(doc(d, `tournaments/${tid}/challenges/ch-01`), { title: 'Race', order: 1 });
        }
    });
    const w1 = isolatedWire(R1), w2 = isolatedWire(R2);
    await Promise.allSettled([w1.run(), w2.run()]);
    const countFor = async (tid) => {
        let n = 0;
        await testEnv.withSecurityRulesDisabled(async (c) => {
            for (const t of TEAMS) n += (await getDocs(collection(c.firestore(), `tournaments/${tid}/teams/${t.id}/assignments`))).size;
        });
        return n;
    };
    const n1 = await countFor(R1), n2 = await countFor(R2);
    chk('concurrent wiring: exactly ONE tournament won', (n1 === 0) !== (n2 === 0), `${R1}=${n1} ${R2}=${n2}`);
    chk('concurrent wiring: the winner got all 6', (n1 === TEAMS.length || n2 === TEAMS.length), `${n1}/${n2}`);
    chk('concurrent wiring: no machine serves both tournaments', await (async () => {
        let urls1 = [], urls2 = [];
        await testEnv.withSecurityRulesDisabled(async (c) => {
            for (const t of TEAMS) {
                (await getDocs(collection(c.firestore(), `tournaments/${R1}/teams/${t.id}/assignments`))).docs.forEach(d => urls1.push(d.data().url));
                (await getDocs(collection(c.firestore(), `tournaments/${R2}/teams/${t.id}/assignments`))).docs.forEach(d => urls2.push(d.data().url));
            }
        });
        return urls1.filter(u => urls2.includes(u)).length === 0;
    })(), 'overlap must be 0');

    /* ── DELETE RELEASES ITS BOXES, and the sweep catches what was stranded earlier ────────── */
    const winner = n1 > 0 ? R1 : R2;
    global._ctfEditingId = winner;
    global.confirm = () => true;
    eval(extractShipped(CONSOLE, 'deleteTournament'));
    eval(extractShipped(CONSOLE, 'releaseOrphanedClaims'));
    global.loadTournaments = () => {};
    await global.deleteTournament(winner, 'Race Winner');
    let stillClaimed = 0;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        const snap = await getDocs(collection(c.firestore(), 'box_pool'));
        stillClaimed = snap.docs.filter(d => (d.data().assignedTo || {}).tournamentId === winner).length;
    });
    chk('delete: released its boxes instead of stranding them', stillClaimed === 0, `${stillClaimed} still claimed`);

    /* Now strand one deliberately, the way a pre-fix delete would have, and sweep it. */
    await testEnv.withSecurityRulesDisabled(async (c) => {
        await setDoc(doc(c.firestore(), 'box_pool/engine1-red-cell'),
            { assignedTo: { tournamentId: 'tournament-that-was-deleted', teamId: 'team-red', challengeId: 'ch-01' } }, { merge: true });
        await setDoc(doc(c.firestore(), 'box_pool/engine1-blue-shield'),
            { assignedTo: { tournamentId: T, teamId: 'team-blue', challengeId: 'ch-01' } }, { merge: true });
    });
    report.textContent = '';
    await global.releaseOrphanedClaims();
    let orphanGone = false, liveKept = false;
    await testEnv.withSecurityRulesDisabled(async (c) => {
        orphanGone = !((await getDoc(doc(c.firestore(), 'box_pool/engine1-red-cell'))).data().assignedTo);
        liveKept = !!((await getDoc(doc(c.firestore(), 'box_pool/engine1-blue-shield'))).data().assignedTo);
    });
    chk('sweep: cleared the claim whose tournament is gone', orphanGone);
    chk('sweep: LEFT a claim whose tournament still exists', liveKept);
    chk('sweep: reported what it did', /swept 1 orphaned claim/.test(report.textContent), report.textContent.split('\n')[0]);

    await testEnv.cleanup();
    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('SUITE FAILED:', e); process.exit(1); });
