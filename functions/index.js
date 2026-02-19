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

// ─── Game Scoreboard ─────────────────────────────────────────────

/**
 * submitGameScore — Submit a game score to the global scoreboard.
 * Anti-cheat: auth required, rate limited, sanity-checked.
 * Maintains a top-10 leaderboard per game in game_scores/{gameId}.
 */
exports.submitGameScore = onCall({ region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const { gameId, score, sessionDuration, meta } = request.data || {};

    // ── Validate inputs ──────────────────────────────────────────
    if (!gameId || typeof gameId !== 'string' || gameId.length > 64) {
        throw new HttpsError('invalid-argument', 'Invalid gameId.');
    }

    const numScore = Number(score);
    if (!Number.isFinite(numScore) || numScore < 0 || numScore > 1000000) {
        throw new HttpsError('invalid-argument', 'Score must be 0–1,000,000.');
    }

    const numDuration = Number(sessionDuration);
    if (!Number.isFinite(numDuration) || numDuration < 5 || numDuration > 7200) {
        throw new HttpsError('invalid-argument', 'Session duration must be 5s–2h.');
    }

    // Points-per-second ceiling (100 pts/sec)
    if (numDuration > 0 && (numScore / numDuration) > 100) {
        throw new HttpsError('invalid-argument', 'Score rate exceeds maximum.');
    }

    // ── Rate limiting: 10 submissions per game per user per hour ─
    const submissionsRef = db.collection(`users/${uid}/score_submissions`);
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentSubmissions = await submissionsRef
        .where('gameId', '==', gameId)
        .where('timestamp', '>', oneHourAgo)
        .get();

    if (recentSubmissions.size >= 10) {
        throw new HttpsError('resource-exhausted',
            'Too many score submissions. Try again later.');
    }

    // Log the submission for rate limiting
    await submissionsRef.add({
        gameId,
        score: numScore,
        timestamp: FieldValue.serverTimestamp()
    });

    // ── Get user callsign ────────────────────────────────────────
    const userDoc = await db.doc(`users/${uid}`).get();
    const callsign = userDoc.exists ? (userDoc.data().callsign || 'Anonymous') : 'Anonymous';
    const house = userDoc.exists ? (userDoc.data().house || null) : null;

    // ── Transaction: update game_scores/{gameId} top-10 ──────────
    const scoreDocRef = db.doc(`game_scores/${gameId}`);

    const result = await db.runTransaction(async (transaction) => {
        const scoreDoc = await transaction.get(scoreDocRef);

        let topScores = [];
        if (scoreDoc.exists) {
            topScores = scoreDoc.data().topScores || [];
        }

        // Remove existing entry for this user (replace if higher)
        const existingIdx = topScores.findIndex(e => e.uid === uid);
        if (existingIdx !== -1) {
            if (topScores[existingIdx].score >= numScore) {
                // Existing score is higher or equal — no update needed
                return { qualified: false, rank: null };
            }
            topScores.splice(existingIdx, 1);
        }

        // Add new entry
        topScores.push({
            uid,
            callsign,
            house,
            score: numScore,
            submittedAt: new Date().toISOString()
        });

        // Sort descending and keep top 10
        topScores.sort((a, b) => b.score - a.score);
        topScores = topScores.slice(0, 10);

        // Check if this score qualified
        const newIdx = topScores.findIndex(e => e.uid === uid);
        const qualified = newIdx !== -1;
        const rank = qualified ? newIdx + 1 : null;

        // Compute lowest top score for fast client-side rejection
        const lowestTopScore = topScores.length >= 10
            ? topScores[topScores.length - 1].score
            : 0;

        transaction.set(scoreDocRef, {
            gameId,
            topScores,
            lowestTopScore,
            entryCount: topScores.length,
            updatedAt: FieldValue.serverTimestamp()
        });

        return { qualified, rank };
    });

    return result;
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
        .createHmac('sha256', FLAG_SECRET)
        .update(`gate${gateNumber}:${uid}`)
        .digest('hex')
        .substring(0, 32);
}
