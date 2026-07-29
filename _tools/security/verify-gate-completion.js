#!/usr/bin/env node
/**
 * verify-gate-completion.js -- BUG-044 regression test.
 *
 * WHY THIS EXISTS: completeGate used to check the caller's proof only when the proof was
 * non-empty AND the gate was <= 5, so an EMPTY proof skipped validation for every gate.
 * Prerequisites are checked against the caller's own documents, so a signed-in caller could
 * loop gateNumber 1,2,3... from the browser console and mint a fully server-blessed vault
 * without solving anything. See BUG-044 in _docs/operations/BUG_TRACKER.md.
 *
 * HOW IT TESTS: it extracts the LIVE completeGate body out of functions/index.js and executes
 * it over an in-memory Firestore double. It is deliberately not a re-implementation -- if
 * someone edits the real function back into a permissive shape, this test runs that edited
 * code and fails. Nothing here talks to production.
 *
 * Run: node _tools/security/verify-gate-completion.js     (exit 0 = safe, 1 = regressed)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SRC = path.resolve(__dirname, '../../functions/index.js');

function loadCompleteGate() {
    const src = fs.readFileSync(SRC, 'utf8');
    const start = src.indexOf('exports.completeGate = onCall(cfOptions, async (request) => {');
    if (start < 0) throw new Error('completeGate not found in ' + SRC);
    const end = src.indexOf('\n});', start) + 4;
    const body = src.slice(start, end)
        .replace('exports.completeGate = onCall(cfOptions, async (request) => {', '(async (request) => {')
        .replace(/\}\);\s*$/, '})');

    // Stand-ins for the module scope the real function closes over.
    const FLAG_SECRET = crypto.randomBytes(32).toString('hex');   // same shape as index.js:35
    function generateGateProof(gateNumber, uid) {
        return crypto.createHmac('sha256', FLAG_SECRET).update(`gate${gateNumber}:${uid}`).digest('hex').substring(0, 32);
    }
    class HttpsError extends Error { constructor(code, message) { super(message); this.code = code; } }
    const FieldValue = { serverTimestamp: () => 'TS' };
    const store = {};
    const db = { doc: (p) => ({
        get: async () => ({ exists: Object.prototype.hasOwnProperty.call(store, p), data: () => store[p] }),
        set: async (d) => { store[p] = d; }
    }) };
    // eslint-disable-next-line no-eval
    const fn = eval(body);
    return { fn, store };
}

const checks = [];
function check(name, pass, detail) { checks.push({ name, pass, detail }); }

(async () => {
    // 1. THE EXPLOIT: ascending loop, empty proof, nothing solved.
    {
        const { fn, store } = loadCompleteGate();
        const outcomes = [];
        for (let g = 1; g <= 8; g++) {
            try { await fn({ auth: { uid: 'attacker' }, data: { gateNumber: g, proof: '' } }); outcomes.push(g + ':WROTE'); }
            catch (e) { outcomes.push(g + ':' + e.code); }
        }
        check('exploit loop writes no gate documents', Object.keys(store).length === 0, outcomes.join(' '));
        check('exploit is stopped at gate 1 (not merely later)', outcomes[0] === '1:permission-denied', outcomes[0]);
    }

    // 2. Legitimate play still works: gates 1-5 arrive server-validated, then 6-8 attest.
    {
        const { fn, store } = loadCompleteGate();
        for (let g = 1; g <= 5; g++) {
            store[`users/student/gates/gate${g}`] = { completed: true, gateNumber: g, verified: true, source: 'server' };
        }
        const outcomes = [];
        for (let g = 6; g <= 8; g++) {
            try { await fn({ auth: { uid: 'student' }, data: { gateNumber: g, proof: '' } }); outcomes.push(g + ':' + store[`users/student/gates/gate${g}`].source); }
            catch (e) { outcomes.push(g + ':' + e.code); }
        }
        check('gates 6-8 still complete for a legitimate student',
            outcomes.every((o) => o.endsWith(':client-attested')), outcomes.join(' '));
        check('gates 6-8 are recorded as client-attested, not as server-verified',
            store['users/student/gates/gate6'].verified === false, JSON.stringify(store['users/student/gates/gate6']));
    }

    // 3. Fails CLOSED for a gate nobody allowlisted (a future gate must not inherit the hole).
    {
        const { fn, store } = loadCompleteGate();
        for (let g = 1; g <= 8; g++) store[`users/x/gates/gate${g}`] = { completed: true };
        let outcome;
        try { await fn({ auth: { uid: 'x' }, data: { gateNumber: 9, proof: '' } }); outcome = 'WROTE'; }
        catch (e) { outcome = e.code; }
        check('an unlisted future gate is rejected, not waved through', outcome === 'permission-denied', outcome);
    }

    // 4. Unauthenticated callers never reach the write path.
    {
        const { fn } = loadCompleteGate();
        let outcome;
        try { await fn({ data: { gateNumber: 6, proof: '' } }); outcome = 'WROTE'; }
        catch (e) { outcome = e.code; }
        check('unauthenticated call is refused', outcome === 'unauthenticated', outcome);
    }

    let failed = 0;
    for (const c of checks) {
        if (!c.pass) failed++;
        console.log((c.pass ? 'PASS  ' : 'FAIL  ') + c.name + '   [' + c.detail + ']');
    }
    console.log(failed ? `RESULT: ${failed} FAILURE(S) -- gate completion has regressed` : 'RESULT: gate completion is safe (BUG-044 closed)');
    process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('HARNESS ERROR:', e.message); process.exit(2); });
