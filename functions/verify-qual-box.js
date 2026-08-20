#!/usr/bin/env node
/*
 * @catalog what    READ-ONLY. Verifies a seeded competition box: registry has deliveryDisabled,
 * @catalog what    the mission gate is armed, and the LIVE gate doc refuses/permits correctly.
 * @catalog run     node functions/verify-qual-box.js [boxId]
 * @catalog status  TOOL
 *
 * Evaluates the gate document fetched FROM FIRESTORE, not the local JSON file. The local file
 * passing its tests proves the file is right; it does not prove what was seeded is right, and
 * those differ the moment a seed half-succeeds or an old document lingers underneath a merge.
 *
 * Also asserts le-01-cold-horizon is still armed. Seeding a second box and quietly disarming the
 * first is the specific accident this whole --spec change could have caused.
 */
const admin = require('firebase-admin');
const mg = require('./mission-gates.js');

const BOX = process.argv[2] || 'qual-w1-lockout';
if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });

(async () => {
    const db = admin.firestore();
    let bad = 0;
    const check = (label, got, want) => {
        const ok = String(got) === String(want);
        if (!ok) bad++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${label.padEnd(34)} ${got}`);
    };

    const reg = await db.doc(`flag_registry/${BOX}`).get();
    check('flag_registry exists', reg.exists, true);
    check('deliveryDisabled is live', reg.exists && reg.data().deliveryDisabled, true);
    check('flag ids seeded', reg.exists ? Object.keys(reg.data().flags || {}).join(',') : '-', 'source-host');

    const gateDoc = await db.doc(`mission_gates/${BOX}`).get();
    check('mission_gates armed', gateDoc.exists, true);

    const g = gateDoc.exists ? (gateDoc.data().gates || {})['source-host'] : null;
    /* Report a missing gate as a FAILED CHECK, never as a crash. Dereferencing g.sources when
     * the gates map lacks this key throws a TypeError, which the outer catch turns into exit 2
     * ("verify failed") — indistinguishable from Firestore being unreachable, and it fires in
     * exactly the half-seeded case this script exists to catch. The tool must be loudest, not
     * quietest, in the situation it was written for. */
    check('gate "source-host" present', !!g, true);

    if (g) {
        const S = g.sources;
        // The two states that decide whether a ranked flag means anything.
        check('LIVE gate refuses with no work', mg.evaluateGate(g, {}, S).satisfied, false);
        check('LIVE gate refuses findings-only',
            mg.evaluateGate(g, { findings: { 'failures-share-one-origin': true, 'origin-confirmed-off-log-path': true } }, S).satisfied,
            false);
        check('LIVE gate permits full work',
            mg.evaluateGate(g, {
                findings: { 'failures-share-one-origin': true, 'origin-confirmed-off-log-path': true },
                corroborators: { 'scanner-netcfg': true }
            }, S).satisfied,
            true);
        // The decoy must still be refused by the LIVE spec, not just the local one.
        check('LIVE spec still rejects the decoy',
            mg.verifyFinding(g.findings['failures-share-one-origin'],
                { sources: ['vpn-gateway-log', 'evt-4625-grace', 'evt-4625-harold'] }, S).ok,
            false);
    }

    /* A competition flag must not equal any value the gate handles.
     *
     * qual-w1-lockout's flag WAS its shared-axis value, so verifyFinding's success reason
     * ("all share sourceIp=192.168.1.150") returned the answer to anyone who made one valid
     * claim. The echo is fixed at source, but the underlying design error was making the secret
     * identical to a value the system passes around in several places — and the next box would
     * repeat it. Check the property, not just the one instance.
     */
    if (g && reg.exists) {
        const flagVals = Object.values(reg.data().flags || {}).map(v => String(v).toLowerCase());
        const axisVals = [];
        Object.values(g.sources || {}).forEach(s =>
            Object.values(s.axes || {}).forEach(v => axisVals.push(String(v).toLowerCase())));
        Object.values(g.findings || {}).forEach(f => {
            if (f.value !== undefined) axisVals.push(String(f.value).toLowerCase());
        });
        const collide = flagVals.filter(f => axisVals.includes(f));
        check('flag value is not a gate axis value', collide.length ? collide.join(',') : 'no collision', 'no collision');
    }

    const le = await db.doc('mission_gates/le-01-cold-horizon').get();
    check('le-01 gate untouched', le.exists, true);

    console.log(bad ? `\n  ${bad} CHECK(S) FAILED` : '\n  all checks passed');
    process.exit(bad ? 1 : 0);
})().catch(e => { console.error('  verify failed:', e.message); process.exit(2); });
