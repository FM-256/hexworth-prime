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
const { doc, getDoc, getDocs, collection, setDoc, serverTimestamp } = require('firebase/firestore');
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
    global._firestoreModule = { doc, getDoc, getDocs, collection, setDoc, serverTimestamp };
    global.db = adminDb;
    global._ctfEditingId = T;
    global.escHtml = (v) => String(v);

    eval(extractShipped(CONSOLE, 'saveBoxPoolEntry'));
    eval(extractShipped(CONSOLE, 'listBoxPool'));
    eval(extractShipped(CONSOLE, 'wirePoolToTeams'));
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
    chk('full pool: no two teams share a box', new Set(full.rows.map(r => r.fromPool)).size === TEAMS.length);

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

    await testEnv.cleanup();
    console.log(`\n  ${pass} passed, ${fail} failed\n`);
    process.exitCode = fail === 0 ? 0 : 1;
})().catch(e => { console.error('SUITE FAILED:', e); process.exit(1); });
