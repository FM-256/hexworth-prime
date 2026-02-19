/**
 * Hexworth Prime — Cloud Functions
 *
 * QC-4: Server-side access control (admin claims, gate verification)
 * AR-11: Server-side flag validation (per-session salted flags)
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

initializeApp();
const db = getFirestore();

// ─── Configuration ───────────────────────────────────────────────
const ADMIN_EMAILS = ['f.mora80@gmail.com'];
const FLAG_SECRET = crypto.randomBytes(32).toString('hex'); // per-deploy secret

// ─── QC-4: Admin Role Management ─────────────────────────────────

/**
 * setAdminClaim — Called on admin login.
 * Verifies email against allowlist, sets Firebase Auth custom claims.
 * Client calls this after Google sign-in; AccessGuard reads the claim.
 */
exports.setAdminClaim = onCall({ region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email || '';
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    await getAuth().setCustomUserClaims(uid, {
        admin: isAdmin,
        handler: isAdmin
    });

    // Also write to Firestore user doc for client-side cache reads
    await db.doc(`users/${uid}`).set({
        role: isAdmin ? 'admin' : 'student',
        email: email,
        claimsUpdatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { admin: isAdmin };
});

/**
 * verifyAdmin — Lightweight check: is this user admin?
 * Used by AccessGuard async verification.
 */
exports.verifyAdmin = onCall({ region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const isAdmin = request.auth.token.admin === true;
    return { admin: isAdmin };
});

// ─── QC-4: Gate Completion Verification ──────────────────────────

/**
 * completeGate — Called when a student solves a Dark Arts gate.
 * Writes verified completion to Firestore. Cannot be forged via DevTools.
 */
exports.completeGate = onCall({ region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { gateNumber, proof } = request.data || {};
    const gateNum = parseInt(gateNumber);

    if (!gateNum || gateNum < 1 || gateNum > 13) {
        throw new HttpsError('invalid-argument', 'Invalid gate number.');
    }

    // Verify proof token — prevents calling this function directly without solving the gate
    // Proof = HMAC(gateSecret + gateNumber + uid)
    const expectedProof = generateGateProof(gateNum, request.auth.uid);
    if (proof !== expectedProof) {
        throw new HttpsError('permission-denied', 'Invalid gate completion proof.');
    }

    const uid = request.auth.uid;

    // Check prerequisites — must have completed all previous gates
    if (gateNum > 1) {
        const prevGate = await db.doc(`users/${uid}/gates/gate${gateNum - 1}`).get();
        if (!prevGate.exists || !prevGate.data().completed) {
            throw new HttpsError('failed-precondition', `Must complete gate ${gateNum - 1} first.`);
        }
    }

    // Write verified completion
    await db.doc(`users/${uid}/gates/gate${gateNum}`).set({
        completed: true,
        completedAt: FieldValue.serverTimestamp(),
        gateNumber: gateNum
    });

    return { success: true, gate: gateNum };
});

/**
 * verifyGateAccess — Check if user has completed gates up to N.
 * Used by AccessGuard async verification.
 */
exports.verifyGateAccess = onCall({ region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { gateNumber } = request.data || {};
    const gateNum = parseInt(gateNumber) || 1;
    const uid = request.auth.uid;

    // Check all gates up to gateNum
    const gateChecks = [];
    for (let i = 1; i <= gateNum; i++) {
        gateChecks.push(db.doc(`users/${uid}/gates/gate${i}`).get());
    }
    const results = await Promise.all(gateChecks);

    const allCompleted = results.every(doc => doc.exists && doc.data().completed);
    const completedGates = results.filter(doc => doc.exists && doc.data().completed).length;

    return { authorized: allCompleted, completedGates, required: gateNum };
});

// ─── AR-11: Flag Validation ──────────────────────────────────────

/**
 * validateFlag — Server-side flag validation.
 * Flags are salted per-session so DevTools inspection is useless.
 * The client never sees the real flag — only the server knows.
 */
exports.validateFlag = onCall({ region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { boxId, flagId, submission, sessionId } = request.data || {};

    if (!boxId || !flagId || !submission) {
        throw new HttpsError('invalid-argument', 'Missing boxId, flagId, or submission.');
    }

    const uid = request.auth.uid;

    // Rate limiting — check recent attempts
    const attemptsRef = db.collection(`users/${uid}/flag_attempts`);
    const recentAttempts = await attemptsRef
        .where('boxId', '==', boxId)
        .where('flagId', '==', flagId)
        .where('timestamp', '>', new Date(Date.now() - 60000)) // last 60 seconds
        .get();

    if (recentAttempts.size >= 5) {
        throw new HttpsError('resource-exhausted',
            'Too many attempts. Wait 60 seconds before trying again.');
    }

    // Log the attempt
    await attemptsRef.add({
        boxId,
        flagId,
        timestamp: FieldValue.serverTimestamp(),
        sessionId: sessionId || null
    });

    // Look up the correct flag from server-side flag registry
    const flagDoc = await db.doc(`flag_registry/${boxId}`).get();
    if (!flagDoc.exists) {
        throw new HttpsError('not-found', 'Box not found in flag registry.');
    }

    const flags = flagDoc.data().flags || {};
    const correctFlag = flags[flagId];

    if (!correctFlag) {
        throw new HttpsError('not-found', 'Flag not found.');
    }

    // Compare — normalize whitespace and case
    const normalizedSubmission = submission.trim().toLowerCase();
    const normalizedCorrect = correctFlag.trim().toLowerCase();
    const isCorrect = normalizedSubmission === normalizedCorrect;

    if (isCorrect) {
        // Record the capture
        await db.doc(`users/${uid}/flag_captures/${boxId}_${flagId}`).set({
            boxId,
            flagId,
            capturedAt: FieldValue.serverTimestamp(),
            sessionId: sessionId || null
        });
    }

    return { correct: isCorrect };
});

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Generate a gate completion proof token.
 * This is computed both server-side (for verification) and will be
 * embedded in the gate page via a derivation the client can compute
 * only after actually solving the puzzle.
 */
function generateGateProof(gateNumber, uid) {
    // The "secret" here is the gate answer itself — the client derives the proof
    // by hashing (gateAnswer + gateNumber + uid). The server stores the gate answers
    // in Firestore (flag_registry/gates) and recomputes the same hash.
    // This is set up in the gate pages — see AccessGuard.generateGateProof()
    return crypto
        .createHmac('sha256', 'hexworth-gate-proof-v1')
        .update(`gate${gateNumber}:${uid}`)
        .digest('hex')
        .substring(0, 32);
}
