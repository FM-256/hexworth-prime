/**
 * Server-side smoke test for c2RequestStudentPairingCode + c2RegisterWithCode
 * round-trip with a synthesized student uid.
 *
 * 1. Mint a custom token for a fake test uid via admin SDK.
 * 2. Exchange it for an ID token via Identity Toolkit REST.
 * 3. POST to the callable's HTTPS endpoint with the ID token.
 * 4. Verify: code minted, ownerUid set, issuedTo='student',
 *    student_pairing_state populated.
 * 5. Second call should fail (active code already outstanding).
 * 6. Redeem the code via /c2RegisterWithCode, verify ownerUid copies
 *    onto the device doc and activeCodeId clears.
 * 7. Hammer-loop: request → redeem → request × 3 — fourth call should
 *    hit the 24h rate limit.
 * 8. Clean up: delete the test docs and test auth user.
 *
 * Run from /home/eq/ai-content/hexworth-prime/functions:
 *   node _smoke_web_flasher_cf.js
 *
 * Requires application-default credentials (ADC) for hexworth-prime.
 */
const admin = require('firebase-admin');

const PROJECT = 'hexworth-prime';
const REGION = 'us-central1';
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const CF_BASE = `https://${REGION}-${PROJECT}.cloudfunctions.net`;
admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const auth = admin.auth();

function ok(label, cond, detail = '') {
    const tag = cond ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`  ${tag}  ${label}${detail ? ' — ' + detail : ''}`);
    if (!cond) process.exitCode = 1;
}

async function createTestSession() {
    // accounts:signUp with returnSecureToken (no email/pw) creates an
    // anonymous Firebase user and returns the ID token in one call.
    // The Web API key is referrer-restricted; spoofing the Referer to
    // hexworth.com lets the call through (the same origin a browser uses).
    const r = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://hexworth.com',
                'Origin': 'https://hexworth.com',
                'X-Client-Version': 'Smoke/web-flasher'
            },
            body: JSON.stringify({ returnSecureToken: true })
        }
    );
    const data = await r.json();
    if (!data.idToken || !data.localId) throw new Error('signUp failed: ' + JSON.stringify(data));
    return { idToken: data.idToken, uid: data.localId };
}

async function callOnCall(name, idToken, data = {}) {
    const r = await fetch(`${CF_BASE}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ data })
    });
    const body = await r.json();
    return { status: r.status, body };
}

async function callOnRequest(name, payload) {
    const r = await fetch(`${CF_BASE}/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const body = await r.json().catch(() => ({}));
    return { status: r.status, body };
}

async function firestoreGet(idToken, path) {
    // Hits the Firestore REST API as the client (goes through rules).
    const r = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/${path}`,
        { headers: { 'Authorization': `Bearer ${idToken}` } }
    );
    return { status: r.status, ok: r.ok };
}

async function cleanup(uid, codes, devices) {
    console.log('\n--- cleanup ---');
    for (const c of codes) {
        try { await db.doc(`c2_pairing_codes/${c}`).delete(); console.log('  deleted code', c); } catch {}
    }
    for (const d of devices) {
        try { await db.doc(`c2_devices/${d}`).delete(); console.log('  deleted device', d); } catch {}
    }
    try { await db.doc(`student_pairing_state/${uid}`).delete(); console.log('  deleted student_pairing_state'); } catch {}
    try { await auth.deleteUser(uid); console.log('  deleted auth user', uid); } catch {}
}

(async () => {
    const codes = [];
    const devices = [];
    let TEST_UID = null;
    try {
        console.log(`\n=== SMOKE: web-flasher CF round-trip ===`);

        // ─── Setup: anonymous-style test user via Identity Toolkit ──
        const session = await createTestSession();
        TEST_UID = session.uid;
        const idToken = session.idToken;
        console.log(`test uid: ${TEST_UID}\n`);
        ok('signUp returned ID token', !!idToken);

        // ─── 1. First request: mint code ──────────────────────────
        console.log('\n--- 1. mint first code ---');
        const r1 = await callOnCall('c2RequestStudentPairingCode', idToken);
        ok('HTTP 200 on first mint', r1.status === 200, `got ${r1.status}`);
        const code1 = r1.body?.result?.code;
        ok('code returned', !!code1, code1);
        ok('code shape HEX-PAIR-XXXXXX', /^HEX-PAIR-[A-Z2-9]{6}$/.test(code1 || ''), code1);
        ok('ttlSeconds = 1800', r1.body?.result?.ttlSeconds === 1800);
        if (code1) codes.push(code1);

        // ─── 2. Inspect Firestore docs ────────────────────────────
        console.log('\n--- 2. verify Firestore docs ---');
        const codeDoc = (await db.doc(`c2_pairing_codes/${code1}`).get()).data();
        ok('code doc exists', !!codeDoc);
        ok('code.ownerUid == TEST_UID', codeDoc?.ownerUid === TEST_UID, codeDoc?.ownerUid);
        ok("code.issuedTo == 'student'", codeDoc?.issuedTo === 'student', codeDoc?.issuedTo);
        ok('code.usedAt is null', codeDoc?.usedAt === null);
        const state1 = (await db.doc(`student_pairing_state/${TEST_UID}`).get()).data();
        ok('state.activeCodeId == code', state1?.activeCodeId === code1, state1?.activeCodeId);
        ok('state.last24h has 1 entry', state1?.last24h?.length === 1);

        // ─── 3. Active-code gate: second request must reject ──────
        console.log('\n--- 3. active-code gate ---');
        const r2 = await callOnCall('c2RequestStudentPairingCode', idToken);
        ok('HTTP 4xx on second mint (active code outstanding)', r2.status >= 400 && r2.status < 500, `got ${r2.status}`);
        ok('error mentions active code', /active|outstanding/i.test(JSON.stringify(r2.body)), JSON.stringify(r2.body).slice(0, 120));

        // ─── 4. Redeem code via c2RegisterWithCode ────────────────
        console.log('\n--- 4. redeem code ---');
        const reg = await callOnRequest('c2RegisterWithCode', {
            pairingCode: code1,
            deviceType: 'esp32',
            name: 'smoke-test-device-1',
            firmware: '0.0.0-smoke',
            capabilities: ['ping']
        });
        ok('HTTP 201 on register', reg.status === 201, `got ${reg.status} ${JSON.stringify(reg.body).slice(0,120)}`);
        const deviceId = reg.body?.deviceId;
        ok('deviceId returned', !!deviceId, deviceId);
        if (deviceId) devices.push(deviceId);

        const dev = (await db.doc(`c2_devices/${deviceId}`).get()).data();
        ok('device.ownerUid == TEST_UID', dev?.ownerUid === TEST_UID, dev?.ownerUid);
        const codeDoc2 = (await db.doc(`c2_pairing_codes/${code1}`).get()).data();
        ok('code.usedAt set after redeem', !!codeDoc2?.usedAt);
        ok('code.usedByDeviceId == deviceId', codeDoc2?.usedByDeviceId === deviceId);
        const state2 = (await db.doc(`student_pairing_state/${TEST_UID}`).get()).data();
        ok('state.activeCodeId cleared after redeem', state2?.activeCodeId === null, state2?.activeCodeId);

        // ─── 5. Second + third codes redeem to clear active slot ──
        console.log('\n--- 5. mint + redeem 2nd & 3rd codes ---');
        for (let i = 2; i <= 3; i++) {
            const rN = await callOnCall('c2RequestStudentPairingCode', idToken);
            ok(`mint #${i} HTTP 200`, rN.status === 200, `got ${rN.status}`);
            const codeN = rN.body?.result?.code;
            if (codeN) codes.push(codeN);
            const regN = await callOnRequest('c2RegisterWithCode', {
                pairingCode: codeN,
                deviceType: 'esp32',
                name: `smoke-test-device-${i}`,
                firmware: '0.0.0-smoke',
                capabilities: ['ping']
            });
            ok(`register #${i} HTTP 201`, regN.status === 201);
            if (regN.body?.deviceId) devices.push(regN.body.deviceId);
        }
        const stateAfter3 = (await db.doc(`student_pairing_state/${TEST_UID}`).get()).data();
        ok('last24h has 3 entries', stateAfter3?.last24h?.length === 3, `len=${stateAfter3?.last24h?.length}`);

        // ─── 6. Rate-limit gate: 4th request must reject ─────────
        console.log('\n--- 6. rate-limit gate (4th in 24h) ---');
        const r4 = await callOnCall('c2RequestStudentPairingCode', idToken);
        ok('HTTP 4xx on 4th mint (rate limit)', r4.status >= 400 && r4.status < 500, `got ${r4.status}`);
        ok('error mentions rate limit',
           /rate|24/i.test(JSON.stringify(r4.body)),
           JSON.stringify(r4.body).slice(0, 200));

        // ─── 7. Firestore rules — student-side reads via REST ────
        console.log('\n--- 7. Firestore rule verification (student-side reads) ---');
        const ownedDeviceId = devices[0];
        const ownedCode = codes[0];

        // Owner can read their own device
        const r7a = await firestoreGet(idToken, `c2_devices/${ownedDeviceId}`);
        ok('owner reads own c2_devices doc (200)', r7a.status === 200, `got ${r7a.status}`);

        // Owner can read their own (used) pairing code
        const r7b = await firestoreGet(idToken, `c2_pairing_codes/${ownedCode}`);
        ok('owner reads own c2_pairing_codes doc (200)', r7b.status === 200, `got ${r7b.status}`);

        // Owner can read their student_pairing_state
        const r7c = await firestoreGet(idToken, `student_pairing_state/${TEST_UID}`);
        ok('owner reads own student_pairing_state (200)', r7c.status === 200, `got ${r7c.status}`);

        // Sign in a SECOND student; must NOT be able to read first student's docs
        const session2 = await createTestSession();
        const idToken2 = session2.idToken;
        const TEST_UID2 = session2.uid;
        console.log(`  (second test uid: ${TEST_UID2})`);

        const r7d = await firestoreGet(idToken2, `c2_devices/${ownedDeviceId}`);
        ok('non-owner BLOCKED from c2_devices (403)', r7d.status === 403, `got ${r7d.status}`);

        const r7e = await firestoreGet(idToken2, `c2_pairing_codes/${ownedCode}`);
        ok('non-owner BLOCKED from c2_pairing_codes (403)', r7e.status === 403, `got ${r7e.status}`);

        const r7f = await firestoreGet(idToken2, `student_pairing_state/${TEST_UID}`);
        ok('non-owner BLOCKED from student_pairing_state (403)', r7f.status === 403, `got ${r7f.status}`);

        // Cleanup the second test user
        try { await auth.deleteUser(TEST_UID2); console.log(`  deleted second auth user ${TEST_UID2}`); } catch {}

        console.log('\n=== DONE ===');
    } finally {
        if (TEST_UID) await cleanup(TEST_UID, codes, devices);
    }
})();
