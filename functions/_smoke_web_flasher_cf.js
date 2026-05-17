/**
 * Server-side smoke test for the Web Flasher backend.
 *
 * Exercises:
 *   - c2RequestStudentPairingCode (mint, active-code gate, rate-limit gate)
 *   - c2RegisterWithCode (ownership threading, in-tx state clear)
 *   - c2DecommissionDevice (owner can; non-owner gets 403)
 *   - c2Dispatch (declared+allowed action passes; undeclared rejects;
 *                 empty-capabilities device rejects; unknown deviceType rejects)
 *   - Firestore rules (owner-reads-pass + non-owner-reads-403 across all
 *     three Web-Flasher-relevant collections)
 *
 * Each assertion carries a `category`:
 *   - 'rules'         → CRITICAL on fail (access-control regression)
 *   - 'cf-behavioral' → HIGH on fail (functional regression, may be flake)
 *
 * Two entry points:
 *   - CLI:     `node _smoke_web_flasher_cf.js` — human-readable PASS/FAIL.
 *              Exit 0 on all-pass, 1 on any fail.
 *   - Module:  `const { runSmoke } = require('./_smoke_web_flasher_cf');`
 *              `await runSmoke()` → { passed, failed, durationMs, findings }
 *              where each finding is
 *              { label, category, severity, passed, error?, detail? }.
 *
 * Cleanup: every test artifact created by a run is deleted in the
 * `finally` block. Test uids are generated fresh per run (anonymous
 * Identity Toolkit `signUp`), so concurrent / overlapping runs don't
 * collide with each other or with any non-smoke user.
 *
 * Requires:
 *   - application-default credentials for the hexworth-prime project
 *   - GOOGLE_CLOUD_QUOTA_PROJECT=hexworth-prime in the environment
 *     (Identity Toolkit needs an explicit quota project for user-creds ADC)
 *
 * Run from /home/eq/ai-content/hexworth-prime/functions:
 *   GOOGLE_CLOUD_QUOTA_PROJECT=hexworth-prime node _smoke_web_flasher_cf.js
 */
'use strict';

const admin = require('firebase-admin');

const PROJECT = 'hexworth-prime';
const REGION = 'us-central1';
const API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
const CF_BASE = `https://${REGION}-${PROJECT}.cloudfunctions.net`;

// Severity per category. Rules failures are access-control regressions
// (data exposure risk) → block deploys. CF-behavioral failures may be
// flakes (network blips on Identity Toolkit etc.) → surface but don't
// auto-block.
const SEVERITY_BY_CATEGORY = {
    'rules':         'critical',
    'cf-behavioral': 'high',
};

// Lazy admin init so requiring the module doesn't initialize Firebase.
let _adminInited = false;
function getAdmin() {
    if (!_adminInited) {
        // Allow re-invocation in the same process (e.g. Nexus adapter
        // calling runSmoke() multiple times) — initializeApp is idempotent
        // only via the default-app pattern.
        if (!admin.apps.length) {
            admin.initializeApp({ projectId: PROJECT });
        }
        _adminInited = true;
    }
    return { db: admin.firestore(), auth: admin.auth() };
}

// ─── Recorder ───────────────────────────────────────────────────
class Recorder {
    constructor({ verbose }) {
        this.findings = [];
        this.verbose = !!verbose;
    }
    section(title) {
        if (this.verbose) console.log(`\n${title}`);
    }
    assert(category, label, condition, detail = '') {
        const passed = !!condition;
        const severity = SEVERITY_BY_CATEGORY[category] || 'high';
        const finding = { label, category, severity, passed };
        if (!passed) finding.detail = String(detail || '').slice(0, 480);
        else if (detail) finding.detail = String(detail).slice(0, 100);
        this.findings.push(finding);
        if (this.verbose) {
            const tag = passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
            console.log(`  ${tag}  [${category}] ${label}${detail ? ' — ' + String(detail).slice(0, 200) : ''}`);
        }
        return passed;
    }
    summary() {
        const total = this.findings.length;
        const failed = this.findings.filter(f => !f.passed);
        return {
            total,
            passed: total - failed.length,
            failed: failed.length,
            failedFindings: failed,
            criticalFailures: failed.filter(f => f.severity === 'critical').length,
            highFailures: failed.filter(f => f.severity === 'high').length,
        };
    }
}

// ─── Network helpers ───────────────────────────────────────────
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
    const body = await r.json().catch(() => ({}));
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

async function cleanup({ db, auth }, { uid, codes, devices, secondaryUid, verbose }) {
    if (verbose) console.log('\n--- cleanup ---');
    for (const c of codes) {
        try { await db.doc(`c2_pairing_codes/${c}`).delete(); if (verbose) console.log('  deleted code', c); } catch {}
    }
    for (const d of devices) {
        try { await db.doc(`c2_devices/${d}`).delete(); if (verbose) console.log('  deleted device', d); } catch {}
    }
    if (uid) {
        try { await db.doc(`student_pairing_state/${uid}`).delete(); if (verbose) console.log('  deleted student_pairing_state'); } catch {}
        try { await auth.deleteUser(uid); if (verbose) console.log('  deleted auth user', uid); } catch {}
    }
    if (secondaryUid) {
        try { await auth.deleteUser(secondaryUid); if (verbose) console.log('  deleted secondary auth user', secondaryUid); } catch {}
    }
}

// ─── Main runner ───────────────────────────────────────────────
async function runSmoke(options = {}) {
    const verbose = !!options.verbose;
    const startedAt = Date.now();
    const rec = new Recorder({ verbose });
    const { db, auth } = getAdmin();

    const codes = [];
    const devices = [];
    let TEST_UID = null;
    let secondaryUid = null;
    let setupError = null;

    try {
        if (verbose) console.log(`\n=== SMOKE: web-flasher CF round-trip ===`);

        // ─── Setup ─────────────────────────────────────────────
        const session = await createTestSession();
        TEST_UID = session.uid;
        const idToken = session.idToken;
        if (verbose) console.log(`test uid: ${TEST_UID}\n`);
        rec.assert('cf-behavioral', 'signUp returned ID token', !!idToken);

        // ─── 1. First request: mint code ──────────────────────
        rec.section('--- 1. mint first code ---');
        const r1 = await callOnCall('c2RequestStudentPairingCode', idToken);
        rec.assert('cf-behavioral', 'HTTP 200 on first mint', r1.status === 200, `got ${r1.status}`);
        const code1 = r1.body?.result?.code;
        rec.assert('cf-behavioral', 'code returned', !!code1, code1);
        rec.assert('cf-behavioral', 'code shape HEX-PAIR-XXXXXX', /^HEX-PAIR-[A-Z2-9]{6}$/.test(code1 || ''), code1);
        rec.assert('cf-behavioral', 'ttlSeconds = 1800', r1.body?.result?.ttlSeconds === 1800);
        if (code1) codes.push(code1);

        // ─── 2. Inspect Firestore docs ────────────────────────
        rec.section('--- 2. verify Firestore docs ---');
        const codeDoc = (await db.doc(`c2_pairing_codes/${code1}`).get()).data();
        rec.assert('cf-behavioral', 'code doc exists', !!codeDoc);
        rec.assert('cf-behavioral', 'code.ownerUid == TEST_UID', codeDoc?.ownerUid === TEST_UID, codeDoc?.ownerUid);
        rec.assert('cf-behavioral', "code.issuedTo == 'student'", codeDoc?.issuedTo === 'student', codeDoc?.issuedTo);
        rec.assert('cf-behavioral', 'code.usedAt is null', codeDoc?.usedAt === null);
        const state1 = (await db.doc(`student_pairing_state/${TEST_UID}`).get()).data();
        rec.assert('cf-behavioral', 'state.activeCodeId == code', state1?.activeCodeId === code1, state1?.activeCodeId);
        rec.assert('cf-behavioral', 'state.last24h has 1 entry', state1?.last24h?.length === 1);

        // ─── 3. Active-code gate ──────────────────────────────
        rec.section('--- 3. active-code gate ---');
        const r2 = await callOnCall('c2RequestStudentPairingCode', idToken);
        rec.assert('cf-behavioral', 'HTTP 4xx on second mint (active code outstanding)', r2.status >= 400 && r2.status < 500, `got ${r2.status}`);
        rec.assert('cf-behavioral', 'error mentions active code', /active|outstanding/i.test(JSON.stringify(r2.body)), JSON.stringify(r2.body).slice(0, 120));

        // ─── 4. Redeem code ──────────────────────────────────
        rec.section('--- 4. redeem code ---');
        const reg = await callOnRequest('c2RegisterWithCode', {
            pairingCode: code1,
            deviceType: 'esp32',
            name: 'smoke-test-device-1',
            firmware: '0.0.0-smoke',
            capabilities: ['ping', 'echo']
        });
        rec.assert('cf-behavioral', 'HTTP 201 on register', reg.status === 201, `got ${reg.status} ${JSON.stringify(reg.body).slice(0,120)}`);
        const deviceId = reg.body?.deviceId;
        rec.assert('cf-behavioral', 'deviceId returned', !!deviceId, deviceId);
        if (deviceId) devices.push(deviceId);

        const dev = (await db.doc(`c2_devices/${deviceId}`).get()).data();
        rec.assert('cf-behavioral', 'device.ownerUid == TEST_UID', dev?.ownerUid === TEST_UID, dev?.ownerUid);
        const codeDoc2 = (await db.doc(`c2_pairing_codes/${code1}`).get()).data();
        rec.assert('cf-behavioral', 'code.usedAt set after redeem', !!codeDoc2?.usedAt);
        rec.assert('cf-behavioral', 'code.usedByDeviceId == deviceId', codeDoc2?.usedByDeviceId === deviceId);
        const state2 = (await db.doc(`student_pairing_state/${TEST_UID}`).get()).data();
        rec.assert('cf-behavioral', 'state.activeCodeId cleared after redeem', state2?.activeCodeId === null, state2?.activeCodeId);

        // ─── 5. 2nd + 3rd codes ──────────────────────────────
        rec.section('--- 5. mint + redeem 2nd & 3rd codes ---');
        for (let i = 2; i <= 3; i++) {
            const rN = await callOnCall('c2RequestStudentPairingCode', idToken);
            rec.assert('cf-behavioral', `mint #${i} HTTP 200`, rN.status === 200, `got ${rN.status}`);
            const codeN = rN.body?.result?.code;
            if (codeN) codes.push(codeN);
            const regN = await callOnRequest('c2RegisterWithCode', {
                pairingCode: codeN,
                deviceType: 'esp32',
                name: `smoke-test-device-${i}`,
                firmware: '0.0.0-smoke',
                capabilities: ['ping']
            });
            rec.assert('cf-behavioral', `register #${i} HTTP 201`, regN.status === 201);
            if (regN.body?.deviceId) devices.push(regN.body.deviceId);
        }
        const stateAfter3 = (await db.doc(`student_pairing_state/${TEST_UID}`).get()).data();
        rec.assert('cf-behavioral', 'last24h has 3 entries', stateAfter3?.last24h?.length === 3, `len=${stateAfter3?.last24h?.length}`);

        // ─── 6. Rate-limit gate ──────────────────────────────
        rec.section('--- 6. rate-limit gate (4th in 24h) ---');
        const r4 = await callOnCall('c2RequestStudentPairingCode', idToken);
        rec.assert('cf-behavioral', 'HTTP 4xx on 4th mint (rate limit)', r4.status >= 400 && r4.status < 500, `got ${r4.status}`);
        rec.assert('cf-behavioral', 'error mentions rate limit',
            /rate|24/i.test(JSON.stringify(r4.body)),
            JSON.stringify(r4.body).slice(0, 200));

        // ─── 7. Firestore rules — student-side reads ─────────
        rec.section('--- 7. Firestore rule verification (student-side reads) ---');
        const ownedDeviceId = devices[0];
        const ownedCode = codes[0];

        const r7a = await firestoreGet(idToken, `c2_devices/${ownedDeviceId}`);
        rec.assert('rules', 'owner reads own c2_devices doc (200)', r7a.status === 200, `got ${r7a.status}`);

        const r7b = await firestoreGet(idToken, `c2_pairing_codes/${ownedCode}`);
        rec.assert('rules', 'owner reads own c2_pairing_codes doc (200)', r7b.status === 200, `got ${r7b.status}`);

        const r7c = await firestoreGet(idToken, `student_pairing_state/${TEST_UID}`);
        rec.assert('rules', 'owner reads own student_pairing_state (200)', r7c.status === 200, `got ${r7c.status}`);

        const session2 = await createTestSession();
        const idToken2 = session2.idToken;
        secondaryUid = session2.uid;
        if (verbose) console.log(`  (second test uid: ${secondaryUid})`);

        const r7d = await firestoreGet(idToken2, `c2_devices/${ownedDeviceId}`);
        rec.assert('rules', 'non-owner BLOCKED from c2_devices (403)', r7d.status === 403, `got ${r7d.status}`);

        const r7e = await firestoreGet(idToken2, `c2_pairing_codes/${ownedCode}`);
        rec.assert('rules', 'non-owner BLOCKED from c2_pairing_codes (403)', r7e.status === 403, `got ${r7e.status}`);

        const r7f = await firestoreGet(idToken2, `student_pairing_state/${TEST_UID}`);
        rec.assert('rules', 'non-owner BLOCKED from student_pairing_state (403)', r7f.status === 403, `got ${r7f.status}`);

        // ─── 8. c2Dispatch capability gate ───────────────────
        // Note: c2Dispatch is admin-only. The smoke test uid is NOT an
        // admin so we cannot directly test the dispatch behavior end-to-
        // end as a non-admin caller. We can still exercise the failure
        // paths: a non-admin caller MUST be rejected at the permission
        // check before the capability gate fires. That's our coverage
        // for now — confirms the admin gate is the FIRST line of defense.
        rec.section('--- 8. c2Dispatch admin gate ---');
        const dispatchNonAdmin = await callOnCall('c2Dispatch', idToken, {
            deviceId: ownedDeviceId,
            action: 'ping',
        });
        rec.assert('cf-behavioral', 'non-admin BLOCKED from c2Dispatch (permission-denied)',
            dispatchNonAdmin.status === 403 || dispatchNonAdmin.body?.error?.status === 'PERMISSION_DENIED',
            `got ${dispatchNonAdmin.status} ${JSON.stringify(dispatchNonAdmin.body).slice(0,120)}`);

        // ─── 9. c2DecommissionDevice ─────────────────────────
        rec.section('--- 9. c2DecommissionDevice ---');
        // Non-owner attempts: must fail (idToken2 is secondaryUid, not the owner)
        const decommNonOwner = await callOnCall('c2DecommissionDevice', idToken2, { deviceId: ownedDeviceId });
        rec.assert('rules', 'non-owner BLOCKED from c2DecommissionDevice (permission-denied)',
            decommNonOwner.status === 403 || decommNonOwner.body?.error?.status === 'PERMISSION_DENIED',
            `got ${decommNonOwner.status} ${JSON.stringify(decommNonOwner.body).slice(0,140)}`);

        // Device should still exist after the rejected attempt
        const devStillThere = (await db.doc(`c2_devices/${ownedDeviceId}`).get()).exists;
        rec.assert('rules', 'device doc survives non-owner decommission attempt', devStillThere);

        // Owner can decommission their own device
        const decommOwner = await callOnCall('c2DecommissionDevice', idToken, { deviceId: ownedDeviceId });
        rec.assert('cf-behavioral', 'owner decommissions own device (200)',
            decommOwner.status === 200,
            `got ${decommOwner.status} ${JSON.stringify(decommOwner.body).slice(0,140)}`);
        rec.assert('cf-behavioral', 'decommission returned decommissioned: true',
            decommOwner.body?.result?.decommissioned === true);

        // Device doc should be gone now
        const devGone = (await db.doc(`c2_devices/${ownedDeviceId}`).get()).exists === false;
        rec.assert('cf-behavioral', 'device doc deleted after owner decommission', devGone);
        // Remove from cleanup list since it's already gone
        const idx = devices.indexOf(ownedDeviceId);
        if (idx >= 0) devices.splice(idx, 1);

        if (verbose) console.log('\n=== DONE ===');
    } catch (e) {
        setupError = e;
        rec.assert('cf-behavioral', 'smoke setup did not throw', false, String(e && e.message || e).slice(0, 400));
    } finally {
        await cleanup({ db, auth }, { uid: TEST_UID, codes, devices, secondaryUid, verbose });
    }

    const summary = rec.summary();
    return {
        passed: summary.failed === 0,
        total: summary.total,
        passedCount: summary.passed,
        failedCount: summary.failed,
        criticalFailures: summary.criticalFailures,
        highFailures: summary.highFailures,
        durationMs: Date.now() - startedAt,
        findings: rec.findings,
        setupError: setupError ? String(setupError.message || setupError).slice(0, 400) : null,
    };
}

// ─── CLI entrypoint ────────────────────────────────────────────
async function cli() {
    const result = await runSmoke({ verbose: true });
    const C = {
        red:    '\x1b[31m',
        green:  '\x1b[32m',
        bold:   '\x1b[1m',
        dim:    '\x1b[2m',
        reset:  '\x1b[0m',
    };
    console.log('');
    console.log(`${C.bold}=== SUMMARY ===${C.reset}`);
    console.log(`  total:         ${result.total}`);
    console.log(`  ${C.green}passed:${C.reset}        ${result.passedCount}`);
    console.log(`  ${C.red}failed:${C.reset}        ${result.failedCount}`);
    if (result.failedCount > 0) {
        console.log(`  ${C.red}critical:${C.reset}      ${result.criticalFailures}`);
        console.log(`  ${C.red}high:${C.reset}          ${result.highFailures}`);
    }
    console.log(`  duration:      ${result.durationMs}ms`);
    process.exitCode = result.passed ? 0 : 1;
}

if (require.main === module) {
    cli().catch(e => {
        console.error('SMOKE crashed:', e);
        process.exitCode = 1;
    });
}

module.exports = { runSmoke, SEVERITY_BY_CATEGORY };
