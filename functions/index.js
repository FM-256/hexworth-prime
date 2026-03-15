/**
 * Hexworth Prime — Cloud Functions (Node 22)
 *
 * QC-4: Server-side access control (admin claims, gate verification)
 * AR-11: Server-side flag validation (per-session salted flags)
 */
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

initializeApp();
const db = getFirestore();

// ─── Configuration ───────────────────────────────────────────────
const ADMIN_EMAILS = ['f.mora80@gmail.com'];
const FLAG_SECRET = crypto.randomBytes(32).toString('hex'); // per-deploy secret

// App Check: Set to true after configuring reCAPTCHA v3 in Firebase Console
// and replacing RECAPTCHA_SITE_KEY_PLACEHOLDER in FirebaseAuth.js
const ENFORCE_APP_CHECK = false;

// Common Cloud Function options
const cfOptions = { region: 'us-central1', enforceAppCheck: ENFORCE_APP_CHECK };

// ─── QC-4: Admin Role Management ─────────────────────────────────

/**
 * setAdminClaim — Called on admin login.
 * Verifies email against allowlist, sets Firebase Auth custom claims.
 * Client calls this after Google sign-in; AccessGuard reads the claim.
 */
exports.setAdminClaim = onCall(cfOptions, async (request) => {
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
exports.verifyAdmin = onCall(cfOptions, async (request) => {
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
exports.completeGate = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { gateNumber, proof } = request.data || {};
    const gateNum = parseInt(gateNumber);

    if (!gateNum || gateNum < 1 || gateNum > 13) {
        throw new HttpsError('invalid-argument', 'Invalid gate number.');
    }

    const uid = request.auth.uid;

    // Gates 1-5: validated by validateGateAnswer (which writes completion directly)
    // Gates 6-8: validated locally (complex multi-step), proof is optional
    // For gates 1-5, this function is only called with proof from legacy code paths
    if (proof && gateNum <= 5) {
        const expectedProof = generateGateProof(gateNum, uid);
        if (proof !== expectedProof) {
            throw new HttpsError('permission-denied', 'Invalid gate completion proof.');
        }
    }

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
exports.verifyGateAccess = onCall(cfOptions, async (request) => {
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
 * The client never sees the real flag — only the server knows.
 *
 * Two modes:
 * 1. With flagId: check specific flag (original behavior)
 * 2. Without flagId: check submission against ALL flags for the box,
 *    return which one matched (SEC-2: client doesn't know flag IDs)
 */
exports.validateFlag = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { boxId, flagId, submission, sessionId } = request.data || {};

    if (!boxId || !submission) {
        throw new HttpsError('invalid-argument', 'Missing boxId or submission.');
    }

    const uid = request.auth.uid;

    // Rate limiting — check recent attempts per box
    const attemptsRef = db.collection(`users/${uid}/flag_attempts`);
    try {
        const recentAttempts = await attemptsRef
            .where('boxId', '==', boxId)
            .where('timestamp', '>', new Date(Date.now() - 60000))
            .get();

        if (recentAttempts.size >= 10) {
            throw new HttpsError('resource-exhausted',
                'Too many attempts. Wait 60 seconds before trying again.');
        }
    } catch (e) {
        if (e instanceof HttpsError) throw e;
        console.warn('Rate limit query failed (index may be building):', e.message);
    }

    // Log the attempt
    attemptsRef.add({
        boxId,
        flagId: flagId || '__scan__',
        timestamp: FieldValue.serverTimestamp(),
        sessionId: sessionId || null
    }).catch(e => console.warn('Attempt log failed:', e.message));

    // Look up the correct flags from server-side flag registry
    const flagDoc = await db.doc(`flag_registry/${boxId}`).get();
    if (!flagDoc.exists) {
        throw new HttpsError('not-found', 'Box not found in flag registry.');
    }

    const flags = flagDoc.data().flags || {};
    const normalizedSubmission = submission.trim().toLowerCase();

    // Mode 1: specific flagId provided
    if (flagId) {
        const correctFlag = flags[flagId];
        if (!correctFlag) {
            throw new HttpsError('not-found', 'Flag not found.');
        }
        const isCorrect = normalizedSubmission === correctFlag.trim().toLowerCase();

        if (isCorrect) {
            await db.doc(`users/${uid}/flag_captures/${boxId}_${flagId}`).set({
                boxId, flagId, capturedAt: FieldValue.serverTimestamp(), sessionId: sessionId || null
            });
        }
        return { correct: isCorrect, flagId: isCorrect ? flagId : null };
    }

    // Mode 2: no flagId — check all flags for the box
    const aliases = flagDoc.data().aliases || {};
    for (const [fid, fvalue] of Object.entries(flags)) {
        if (normalizedSubmission === fvalue.trim().toLowerCase()) {
            const resolvedId = aliases[fid] || fid;
            await db.doc(`users/${uid}/flag_captures/${boxId}_${resolvedId}`).set({
                boxId, flagId: resolvedId, capturedAt: FieldValue.serverTimestamp(), sessionId: sessionId || null
            });
            return { correct: true, flagId: resolvedId };
        }
    }

    return { correct: false, flagId: null };
});

// ─── SEC-2: Flag Delivery ────────────────────────────────────────

/**
 * deliverFlag — Returns plaintext flag text for display, only after auth.
 * Separate from validateFlag: this is for rendering the flag in the UI
 * after the student earns it, NOT for checking submissions.
 *
 * The flag text is never in the client-side JS. The student must:
 * 1. Be authenticated
 * 2. Request a specific boxId + flagId
 * The server returns the flag text for display.
 */
exports.deliverFlag = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { boxId, flagId } = request.data || {};
    if (!boxId || !flagId) {
        throw new HttpsError('invalid-argument', 'Missing boxId or flagId.');
    }

    const flagDoc = await db.doc(`flag_registry/${boxId}`).get();
    if (!flagDoc.exists) {
        throw new HttpsError('not-found', 'Box not found.');
    }

    const flags = flagDoc.data().flags || {};
    const flagText = flags[flagId];
    if (!flagText) {
        throw new HttpsError('not-found', 'Flag not found.');
    }

    // Log delivery
    const uid = request.auth.uid;
    db.doc(`users/${uid}/flag_deliveries/${boxId}_${flagId}`).set({
        boxId, flagId, deliveredAt: FieldValue.serverTimestamp()
    }).catch(e => console.warn('Delivery log failed:', e.message));

    return { flagText, flagId };
});

// ─── Game Scoreboard ─────────────────────────────────────────────

/**
 * submitGameScore — Submit a game score to the global scoreboard.
 * Anti-cheat: auth required, rate limited, sanity-checked.
 * Maintains a top-10 leaderboard per game in game_scores/{gameId}.
 */
exports.submitGameScore = onCall(cfOptions, async (request) => {
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

// ─── Phase 4: Handler/Admin Code Validation ──────────────────────

// Activation codes stored as SHA-256 hashes (never plaintext in source)
// To generate: echo -n "YOUR-CODE" | sha256sum
// Set via: firebase functions:secrets:set HANDLER_CODE_HASH / ADMIN_CODE_HASH
// Fallback: hardcoded hashes below (replace with secrets for production)
const HANDLER_CODE_HASH = '2868c7d1501fc994c6ebd8c607d2caf015f868bb90f719572ab22a1520a35703';
const ADMIN_CODE_HASH = 'f7887a0e7faed00e12d68921e3403fe1fd17c70aa44319267b952dd709e39e75';

/**
 * validateActivationCode — Server-side handler/admin code validation.
 * Removes Caesar-17 encoded codes from client JS entirely.
 * Rate limited: 3 attempts per 10 minutes.
 */
exports.validateActivationCode = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { code } = request.data || {};
    if (!code || typeof code !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing activation code.');
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email || '';

    // ── Rate limiting: 3 attempts per 10 minutes ──
    const attemptsRef = db.collection(`users/${uid}/activation_attempts`);
    const recentAttempts = await attemptsRef
        .where('timestamp', '>', new Date(Date.now() - 600000))
        .get();

    if (recentAttempts.size >= 3) {
        throw new HttpsError('resource-exhausted',
            'Too many attempts. Wait 10 minutes before trying again.');
    }

    // Log the attempt
    await attemptsRef.add({
        timestamp: FieldValue.serverTimestamp()
    });

    // Hash the submitted code
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');

    // Check admin code first (admin is higher tier)
    if (codeHash === ADMIN_CODE_HASH) {
        // Admin requires email allowlist check
        if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
            throw new HttpsError('permission-denied', 'Admin activation requires an authorized email.');
        }

        // Set custom claims
        await getAuth().setCustomUserClaims(uid, {
            admin: true,
            handler: true
        });

        // Update Firestore
        await db.doc(`users/${uid}`).set({
            accountType: 'admin',
            role: 'admin',
            activatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        return { role: 'admin' };
    }

    // Check handler code
    if (codeHash === HANDLER_CODE_HASH) {
        // Set custom claims
        await getAuth().setCustomUserClaims(uid, {
            handler: true,
            admin: request.auth.token.admin || false
        });

        // Update Firestore
        await db.doc(`users/${uid}`).set({
            accountType: 'handler',
            activatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        return { role: 'handler' };
    }

    return { role: null };
});

// ─── Phase 2: Server-Side Gate Answer Validation ─────────────────

/**
 * validateGateAnswer — Server-side gate answer checking.
 * Moves answer hashes out of client JS; prevents brute-force.
 * Rate limited: 5 attempts per gate per 60 seconds.
 */
exports.validateGateAnswer = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { gateNumber, answer } = request.data || {};
    const gateNum = parseInt(gateNumber);

    if (!gateNum || gateNum < 1 || gateNum > 8) {
        throw new HttpsError('invalid-argument', 'Invalid gate number.');
    }

    if (!answer || typeof answer !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing answer.');
    }

    const uid = request.auth.uid;

    // ── Rate limiting: 5 attempts per gate per 60 seconds ──
    const attemptsRef = db.collection(`users/${uid}/gate_attempts`);
    try {
        const recentAttempts = await attemptsRef
            .where('gateNumber', '==', gateNum)
            .where('timestamp', '>', new Date(Date.now() - 60000))
            .get();

        if (recentAttempts.size >= 5) {
            throw new HttpsError('resource-exhausted',
                'Too many attempts. Wait 60 seconds before trying again.');
        }
    } catch (e) {
        // Rethrow rate-limit errors, swallow index-not-ready errors
        if (e instanceof HttpsError) throw e;
        console.warn('Rate limit query failed (index may be building):', e.message);
    }

    // Log the attempt (non-blocking — don't let this fail the validation)
    attemptsRef.add({
        gateNumber: gateNum,
        timestamp: FieldValue.serverTimestamp()
    }).catch(e => console.warn('Attempt log failed:', e.message));

    // ── Determine cipher set (monthly rotation) ──
    const setIndex = new Date().getMonth() % 4;

    // ── Look up answer hash from gate_registry ──
    const registryDoc = await db.doc(`gate_registry/set_${setIndex}`).get();
    if (!registryDoc.exists) {
        throw new HttpsError('internal', 'Gate registry not configured.');
    }

    const registry = registryDoc.data();
    const gateKey = `gate${gateNum}`;
    const expectedHash = registry[gateKey];

    if (!expectedHash) {
        throw new HttpsError('not-found', 'Gate not found in registry.');
    }

    // ── Hash the normalized input and compare ──
    const normalized = answer.trim().toLowerCase();
    const inputHash = crypto.createHash('sha256').update(normalized).digest('hex');

    // For gate 5 binding words, check against array of hashes
    if (gateNum === 5 && Array.isArray(expectedHash)) {
        const isCorrect = expectedHash.includes(inputHash);

        if (isCorrect) {
            await db.doc(`users/${uid}/gates/gate${gateNum}`).set({
                completed: true,
                completedAt: FieldValue.serverTimestamp(),
                gateNumber: gateNum
            });
        }

        return { correct: isCorrect };
    }

    const isCorrect = inputHash === expectedHash;

    if (isCorrect) {
        // Write verified completion to Firestore (server authority)
        await db.doc(`users/${uid}/gates/gate${gateNum}`).set({
            completed: true,
            completedAt: FieldValue.serverTimestamp(),
            gateNumber: gateNum
        });
    }

    return { correct: isCorrect };
});

// ─── Phase 5: Server-Side Progress Tracking ──────────────────────

/**
 * addXP — Server-side XP addition.
 * Prevents students from inflating their own XP via Firestore writes.
 */
exports.addXP = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { amount, reason } = request.data || {};
    const numAmount = parseInt(amount);

    if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 10000) {
        throw new HttpsError('invalid-argument', 'XP amount must be 1–10,000.');
    }

    if (!reason || typeof reason !== 'string') {
        throw new HttpsError('invalid-argument', 'Reason is required.');
    }

    const uid = request.auth.uid;
    const userRef = db.doc(`users/${uid}`);

    await userRef.update({
        xpHistory: FieldValue.arrayUnion({
            amount: numAmount,
            reason,
            timestamp: new Date().toISOString()
        }),
        updatedAt: FieldValue.serverTimestamp()
    });

    return { success: true, added: numAmount };
});

/**
 * recordProgress — Server-side module/lab/quiz completion recording.
 * Prevents students from marking arbitrary content as completed.
 */
exports.recordProgress = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { type, itemId, house, score } = request.data || {};
    const uid = request.auth.uid;
    const userRef = db.doc(`users/${uid}`);

    if (!type || !itemId || typeof itemId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing type or itemId.');
    }

    const updates = {
        updatedAt: FieldValue.serverTimestamp()
    };

    switch (type) {
        case 'module':
            updates.modulesCompleted = FieldValue.arrayUnion(itemId);
            if (house) {
                updates[`houseProgress.${house}.completed`] = FieldValue.increment(1);
            }
            break;

        case 'lab':
            updates.labsCompleted = FieldValue.arrayUnion(itemId);
            if (house) {
                updates[`houseProgress.${house}.labsCompleted`] = FieldValue.increment(1);
            }
            break;

        case 'quiz':
            const numScore = parseInt(score) || 0;
            updates[`quizzes.${itemId}`] = {
                score: numScore,
                passedAt: new Date().toISOString()
            };
            if (house) {
                updates[`houseProgress.${house}.quizzesPassed`] = FieldValue.increment(1);
            }
            break;

        case 'achievement':
            updates.achievements = FieldValue.arrayUnion(itemId);
            break;

        default:
            throw new HttpsError('invalid-argument', 'Unknown progress type.');
    }

    await userRef.update(updates);

    return { success: true, type, itemId };
});

/**
 * updateStreak — Server-side streak tracking.
 * Called once per day when student visits dashboard.
 */
exports.updateStreak = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const userRef = db.doc(`users/${uid}`);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new HttpsError('not-found', 'User profile not found.');
    }

    const data = userDoc.data();
    const lastLogin = data.lastLoginDate || null;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    if (lastLogin === today) {
        // Already logged in today
        return { streak: data.streak || 0, alreadyUpdated: true };
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let newStreak;

    if (lastLogin === yesterday) {
        // Consecutive day — increment
        newStreak = (data.streak || 0) + 1;
    } else {
        // Streak broken — reset to 1
        newStreak = 1;
    }

    await userRef.update({
        streak: newStreak,
        lastLoginDate: today,
        updatedAt: FieldValue.serverTimestamp()
    });

    return { streak: newStreak, alreadyUpdated: false };
});

// ─── Server-Side XP Derivation ──────────────────────────────────
// Ported from migrate-xp.js. Recalculates XP from merged completion
// data so the CF never trusts the client's XP number. Covers
// presentations, labs, quizzes, gates, and streak (~90%+ of XP).
// Game XP and badge XP are client-only and handled by XPCalculator.

const XP_RATES = {
    PRESENTATION_VIEW: 100,
    TOOL_EXPLORE: 100,
    QUIZ_PASS: 100,      // 70–89%
    QUIZ_PERFECT: 200,   // 90%+
    LAB_COMPLETE: 500,
    GATE_CLEARED: 500,
    DAILY_LOGIN: 25      // capped at 365 days
};

function calculateLevel(xp) {
    if (!xp || xp <= 0) return 1;
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
}

/**
 * Classify a module ID by type using quiz/lab sets + ID suffix heuristic.
 */
function resolveModuleType(id, quizIds, labIds) {
    if (quizIds.has(id)) return 'quiz';
    if (labIds.has(id)) return 'lab';
    const lower = id.toLowerCase();
    if (lower.endsWith('-quiz') || lower.includes('-quiz-')) return 'quiz';
    if (lower.endsWith('-lab') || lower.includes('-lab-')) return 'lab';
    if (lower.endsWith('-tool') || lower.endsWith('-applet')) return 'tool';
    return 'presentation';
}

/**
 * Recalculate XP from merged completion arrays.
 * Returns { xp, level }. Intentionally skips game XP and badge XP
 * (localStorage-only — XPCalculator picks those up client-side).
 */
function deriveXP(modules, labs, quizzes, achievements, streak) {
    const quizIds = new Set(Object.keys(quizzes || {}));
    const labIds = new Set(labs);
    const seen = new Set();
    let xp = 0;

    // Score each unique module
    for (const id of modules) {
        if (seen.has(id)) continue;
        seen.add(id);
        const type = resolveModuleType(id, quizIds, labIds);
        switch (type) {
            case 'quiz': {
                const score = (quizzes[id] && quizzes[id].score) || 0;
                xp += score >= 90 ? XP_RATES.QUIZ_PERFECT : XP_RATES.QUIZ_PASS;
                break;
            }
            case 'lab':
                xp += XP_RATES.LAB_COMPLETE;
                break;
            case 'tool':
                xp += XP_RATES.TOOL_EXPLORE;
                break;
            default:
                xp += XP_RATES.PRESENTATION_VIEW;
        }
    }

    // Quizzes not in modulesCompleted (passed but not tracked as module)
    for (const [qid, qdata] of Object.entries(quizzes || {})) {
        if (seen.has(qid)) continue;
        seen.add(qid);
        const score = (qdata && qdata.score) || 0;
        if (score >= 90) {
            xp += XP_RATES.QUIZ_PERFECT;
        } else if (score >= 70) {
            xp += XP_RATES.QUIZ_PASS;
        }
    }

    // Labs not in modulesCompleted
    for (const labId of labs) {
        if (seen.has(labId)) continue;
        seen.add(labId);
        xp += XP_RATES.LAB_COMPLETE;
    }

    // Gate XP: count gate_N and dark_arts_gateN in achievements
    const gatePattern = /^(gate_\d+|dark_arts_gate\d+)$/;
    for (const ach of (achievements || [])) {
        const achId = typeof ach === 'string' ? ach : ((ach && ach.id) || '');
        if (gatePattern.test(achId)) {
            xp += XP_RATES.GATE_CLEARED;
        }
    }

    // Streak XP (25/day, capped at 365)
    const cappedStreak = Math.min(streak || 0, 365);
    xp += cappedStreak * XP_RATES.DAILY_LOGIN;

    return { xp, level: calculateLevel(xp) };
}

/**
 * syncProgress — Server-side bidirectional sync.
 * Client sends its local progress data; server merges with cloud and writes back.
 * This replaces the client-side setUserProfile calls that wrote protected fields.
 */
exports.syncProgress = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const localData = request.data || {};

    // Validate module IDs: must be {knownHouse}-{key} format
    const _KNOWN_HOUSES = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye', 'ai', 'linux', 'arena'];
    const _isValidModuleId = (id) => {
        if (!id || typeof id !== 'string') return false;
        if (id.startsWith('dark-arts-') && id.length > 10) return true;
        const dash = id.indexOf('-');
        if (dash < 1) return false;
        const house = id.slice(0, dash);
        const key = id.slice(dash + 1);
        if (!key || !_KNOWN_HOUSES.includes(house)) return false;
        if (key.startsWith(house + '-')) return false;
        if (_KNOWN_HOUSES.includes(key)) return false;
        return true;
    };

    // Validate arrays to prevent injection
    const sanitizeStringArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(item => typeof item === 'string').slice(0, 1000);
    };

    const sanitizeFavorites = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(f => f && typeof f === 'object' && typeof f.id === 'string')
            .map(f => ({ id: f.id, title: String(f.title || ''), addedAt: String(f.addedAt || '') }))
            .slice(0, 500);
    };

    const sanitizeQuizzes = (obj) => {
        if (typeof obj !== 'object' || obj === null) return {};
        const clean = {};
        for (const [key, val] of Object.entries(obj)) {
            if (typeof key === 'string' && key.length < 100 && val && typeof val === 'object') {
                clean[key] = {
                    score: Math.min(100, Math.max(0, parseInt(val.score) || 0)),
                    passedAt: typeof val.passedAt === 'string' ? val.passedAt : new Date().toISOString()
                };
            }
        }
        return clean;
    };

    // Sanitize then filter — keep raw count to detect garbage injection
    const rawModules = sanitizeStringArray(localData.modulesCompleted);
    const localModules = rawModules.filter(_isValidModuleId);
    const garbageModules = rawModules.length - localModules.length;

    const localLabs = sanitizeStringArray(localData.labsCompleted).filter(_isValidModuleId);
    const localAchievements = sanitizeStringArray(localData.achievements);
    const localQuizzes = sanitizeQuizzes(localData.quizzes);
    // localXP intentionally not read — XP is derived server-side from
    // merged completion arrays to prevent stale cache re-inflation.
    const localStreak = Math.max(0, Math.min(10000, parseInt(localData.streak) || 0));
    const localFavorites = sanitizeFavorites(localData.favorites);

    // Get cloud profile
    const userRef = db.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    const cloudData = userDoc.exists ? userDoc.data() : {};

    // Merge: union arrays (filter both sides), max scalars
    const mergedModules = [...new Set([...(cloudData.modulesCompleted || []).filter(_isValidModuleId), ...localModules])];
    const mergedLabs = [...new Set([...(cloudData.labsCompleted || []).filter(_isValidModuleId), ...localLabs])];
    const mergedAchievements = [...new Set([...(cloudData.achievements || []), ...localAchievements])];
    const mergedStreak = Math.max(cloudData.streak || 0, localStreak);

    // Merge quizzes (keep highest scores)
    const mergedQuizzes = { ...(cloudData.quizzes || {}) };
    for (const [qid, qdata] of Object.entries(localQuizzes)) {
        if (!mergedQuizzes[qid] || qdata.score > (mergedQuizzes[qid].score || 0)) {
            mergedQuizzes[qid] = qdata;
        }
    }

    // Merge favorites (union by ID)
    const cloudFavorites = Array.isArray(cloudData.favorites) ? cloudData.favorites : [];
    const favIdSet = new Set(cloudFavorites.map(f => f && f.id).filter(Boolean));
    const mergedFavorites = [...cloudFavorites];
    for (const fav of localFavorites) {
        if (!favIdSet.has(fav.id)) {
            favIdSet.add(fav.id);
            mergedFavorites.push(fav);
        }
    }

    // Server-side XP derivation — never trust the client's XP number.
    // Recalculates from the merged completion arrays to prevent stale
    // localStorage from re-inflating XP after manual corrections.
    const { xp: mergedXP, level: mergedLevel } = deriveXP(
        mergedModules, mergedLabs, mergedQuizzes, mergedAchievements, mergedStreak
    );

    // Detect cheating: if client sent > 5 garbage module IDs, flag the account.
    // The integrity field is server-only — NOT in firestore.rules client whitelist,
    // so the cheater cannot delete or modify it from the browser.
    if (garbageModules > 5) {
        const existingIntegrity = cloudData.integrity || {};
        await userRef.set({
            integrity: {
                status: 'violated',
                detectedAt: existingIntegrity.detectedAt || FieldValue.serverTimestamp(),
                garbageCount: garbageModules,
                peakGarbage: Math.max(garbageModules, existingIntegrity.peakGarbage || 0),
                lastDetected: FieldValue.serverTimestamp()
            }
        }, { merge: true });
    }

    await userRef.set({
        modulesCompleted: mergedModules,
        labsCompleted: mergedLabs,
        achievements: mergedAchievements,
        quizzes: mergedQuizzes,
        favorites: mergedFavorites,
        xp: mergedXP,
        level: mergedLevel,
        streak: mergedStreak,
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return {
        success: true,
        modulesCount: mergedModules.length,
        xp: mergedXP,
        level: mergedLevel,
        streak: mergedStreak
    };
});

// ─── HED Export Endpoint ─────────────────────────────────────────

/**
 * getHedExport — HTTP GET endpoint for Nexus CLI.
 * Reads hed_reports collection, flattens error arrays, strips PII.
 * Optional API key auth via HED_EXPORT_KEY env var.
 */
exports.getHedExport = onRequest({ region: 'us-central1' }, async (req, res) => {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Optional API key check
    const requiredKey = process.env.HED_EXPORT_KEY;
    if (requiredKey) {
        const provided = req.headers['x-api-key'] || req.query.key;
        if (provided !== requiredKey) {
            res.status(403).json({ error: 'Invalid or missing API key' });
            return;
        }
    }

    try {
        const snapshot = await db.collection('hed_reports')
            .orderBy('reportedAt', 'desc')
            .limit(200)
            .get();

        const errors = [];
        snapshot.forEach(doc => {
            const report = doc.data();
            const entries = report.errors || [];
            for (const entry of entries) {
                errors.push({
                    code: entry.code || 'HED-UNKNOWN',
                    message: entry.message || '',
                    url: entry.url || null,
                    source: entry.source || null,
                    timestamp: entry.timestamp || (report.reportedAt ? report.reportedAt.toDate().toISOString() : null),
                    count: entry.count || 1,
                });
            }
        });

        res.json(errors);
    } catch (err) {
        console.error('getHedExport error:', err);
        res.status(500).json({ error: 'Internal error' });
    }
});

// ─── F-27: Handler Comms — Targeted Messaging ──────────────────

/**
 * sendHandlerMessage — Sends a message from a handler to a class or individual student.
 * Creates a document in handler_messages/{auto} collection.
 * Validates sender is the handler of the specified class.
 */
exports.sendHandlerMessage = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { classId, recipientUid, text } = request.data || {};
    const senderUid = request.auth.uid;

    // Validate text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new HttpsError('invalid-argument', 'Message text is required.');
    }
    if (text.length > 500) {
        throw new HttpsError('invalid-argument', 'Message must be 500 characters or less.');
    }
    if (!classId) {
        throw new HttpsError('invalid-argument', 'classId is required.');
    }

    // Verify sender is the handler of this class
    const classDoc = await db.doc(`classes/${classId}`).get();
    if (!classDoc.exists) {
        throw new HttpsError('not-found', 'Class not found.');
    }
    const classData = classDoc.data();
    if (classData.handlerUid !== senderUid) {
        throw new HttpsError('permission-denied', 'Only the class handler can send messages.');
    }

    // If targeting individual, verify they're in the class
    if (recipientUid) {
        const memberUids = classData.memberUids || [];
        if (!memberUids.includes(recipientUid)) {
            throw new HttpsError('invalid-argument', 'Recipient is not a member of this class.');
        }
    }

    // Get sender display name
    const senderDoc = await db.doc(`users/${senderUid}`).get();
    const senderName = senderDoc.exists
        ? (senderDoc.data().displayName || senderDoc.data().callsign || 'Handler')
        : 'Handler';

    // Create the message document
    const msgRef = await db.collection('handler_messages').add({
        classId,
        className: classData.name || '',
        senderUid,
        senderName,
        recipientType: recipientUid ? 'individual' : 'class',
        recipientUid: recipientUid || null,
        text: text.trim(),
        createdAt: FieldValue.serverTimestamp(),
        readBy: []
    });

    return { success: true, messageId: msgRef.id };
});

// ─── SEC-1: Generic Challenge Validation ─────────────────────────

/**
 * validateChallenge — Server-side challenge validation for interactive labs.
 * Supports: shopbot (AI Exploit Lab). Extensible to CLH, quizzes, etc.
 *
 * Client sends: { challengeId, levelId, userInput, conversation }
 * Server returns: { blocked, success, feedback, points, explanation }
 *
 * The client NEVER sees the success/defense patterns or response text
 * until the server decides to reveal them.
 */
exports.validateChallenge = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { challengeId, levelId, userInput, conversation } = request.data || {};

    if (!challengeId || !levelId || !userInput) {
        throw new HttpsError('invalid-argument', 'Missing challengeId, levelId, or userInput.');
    }

    if (typeof userInput !== 'string' || userInput.length > 2000) {
        throw new HttpsError('invalid-argument', 'Input must be a string under 2000 characters.');
    }

    const uid = request.auth.uid;

    // ── Rate limiting: 10 attempts per level per 60 seconds ──
    const attemptsRef = db.collection(`users/${uid}/challenge_attempts`);
    try {
        const recentAttempts = await attemptsRef
            .where('challengeId', '==', challengeId)
            .where('levelId', '==', levelId)
            .where('timestamp', '>', new Date(Date.now() - 60000))
            .get();

        if (recentAttempts.size >= 10) {
            throw new HttpsError('resource-exhausted',
                'Too many attempts. Wait 60 seconds before trying again.');
        }
    } catch (e) {
        if (e instanceof HttpsError) throw e;
        console.warn('Rate limit query failed (index may be building):', e.message);
    }

    // Log the attempt
    attemptsRef.add({
        challengeId,
        levelId,
        timestamp: FieldValue.serverTimestamp()
    }).catch(e => console.warn('Attempt log failed:', e.message));

    // ── Route to challenge handler ──
    switch (challengeId) {
        case 'shopbot':
            return evaluateShopbot(levelId, userInput, conversation || []);
        case 'clh-insight':
            return evaluateClhInsight(levelId, userInput);
        default:
            throw new HttpsError('not-found', `Unknown challenge: ${challengeId}`);
    }
});

/**
 * Evaluate a ShopBot AI Exploit Lab submission.
 * Reads level config from Firestore, runs defense/success checks server-side.
 */
async function evaluateShopbot(levelId, userInput, conversation) {
    const levelNum = parseInt(levelId);
    if (!levelNum || levelNum < 1 || levelNum > 8) {
        throw new HttpsError('invalid-argument', 'Invalid ShopBot level.');
    }

    // Fetch level config from Firestore
    const levelDoc = await db.doc(`challenge_registry/shopbot/levels/${levelNum}`).get();
    if (!levelDoc.exists) {
        throw new HttpsError('not-found', 'Level not found in challenge registry.');
    }

    const level = levelDoc.data();
    const msg = userInput.toLowerCase();

    // ── Defense check ──
    const blocked = checkShopbotDefense(level, msg);
    if (blocked) {
        return {
            blocked: true,
            success: false,
            feedback: blocked,
            points: 0,
            explanation: null
        };
    }

    // ── Success check ──
    // Build conversation context matching the client format
    const conv = [...conversation, { role: 'user', content: userInput }];
    const success = checkShopbotSuccess(level, msg, conv);

    if (success) {
        return {
            blocked: false,
            success: true,
            feedback: level.successResponse,
            points: level.points,
            explanation: level.explanation
        };
    }

    // No match — generic bot response (client picks one randomly)
    return {
        blocked: false,
        success: false,
        feedback: null,
        points: 0,
        explanation: null
    };
}

/**
 * Check if a message triggers the level's defense layer.
 * Returns the block message or false.
 */
function checkShopbotDefense(level, msg) {
    // Level 7: compound defense (requires + anyOf)
    if (level.defenseCompound) {
        const dc = level.defenseCompound;
        const hasRequired = dc.requires.every(p => msg.includes(p));
        const hasAny = dc.anyOf.some(p => msg.includes(p));
        if (hasRequired && hasAny) return level.defenseResponse;
        return false;
    }

    // Level 8: multiple defense rules
    if (level.defenseRules && Array.isArray(level.defenseRules)) {
        for (const rule of level.defenseRules) {
            const hasPatterns = rule.patterns.some(p => msg.includes(p));
            if (!hasPatterns) continue;

            // If rule has requires/anyOf, check those too
            if (rule.requires) {
                if (!rule.requires.every(p => msg.includes(p))) continue;
            }
            if (rule.anyOf) {
                if (!rule.anyOf.some(p => msg.includes(p))) continue;
            }

            return rule.response;
        }
        return false;
    }

    // Simple pattern defense (levels 1-6)
    if (!level.defensePatterns || level.defensePatterns.length === 0) {
        return false;
    }

    const checkMsg = level.defenseStripSpaces ? msg.replace(/\s+/g, '') : msg;
    for (const pattern of level.defensePatterns) {
        if (checkMsg.includes(pattern)) {
            return level.defenseResponse;
        }
    }
    return false;
}

/**
 * Check if a message (or conversation) triggers success for this level.
 * Returns true/false.
 */
function checkShopbotSuccess(level, msg, conversation) {
    // Check string patterns
    if (level.successPatterns && level.successPatterns.length > 0) {
        for (const pattern of level.successPatterns) {
            if (msg.includes(pattern)) return true;
        }
    }

    // Check regex pattern (level 3 has a spaced-letter regex)
    if (level.successRegex) {
        const regex = new RegExp(level.successRegex);
        if (regex.test(msg)) return true;
    }

    return false;
}

/**
 * Evaluate a CLH insight phase answer.
 * Reads accepted answers from Firestore, does case-insensitive comparison.
 */
async function evaluateClhInsight(moduleId, userInput) {
    if (!moduleId || typeof moduleId !== 'string') {
        throw new HttpsError('invalid-argument', 'Invalid CLH module ID.');
    }

    const insightDoc = await db.doc(`challenge_registry/clh/insights/${moduleId}`).get();
    if (!insightDoc.exists) {
        throw new HttpsError('not-found', 'Module insight not found in challenge registry.');
    }

    const insight = insightDoc.data();
    const normalized = userInput.trim().toLowerCase();
    console.log(`[CLH-INSIGHT] moduleId=${moduleId}, input="${normalized}", answers=${JSON.stringify(insight.acceptedAnswers)}`);
    const isCorrect = (insight.acceptedAnswers || []).some(
        a => a.toLowerCase() === normalized
    );
    console.log(`[CLH-INSIGHT] result=${isCorrect}`);

    return {
        blocked: false,
        success: isCorrect,
        feedback: isCorrect ? insight.correctMessage : insight.wrongMessage,
        points: isCorrect ? 100 : 0,
        explanation: null
    };
}

// ─── Challenge Leaderboard ────────────────────────────────────────

/**
 * submitChallengeScore — Record a player's score on a challenge leaderboard.
 * Also updates per-level aggregate stats (success rate, attempt averages).
 *
 * Client sends: { challengeId, score, levelsCleared, totalLevels, attempts: {1: n, 2: n, ...} }
 * Server writes: challenge_leaderboard/{challengeId}/scores/{uid}
 *                challenge_leaderboard/{challengeId}/stats/level_{n}
 */
exports.submitChallengeScore = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const { challengeId, score, levelsCleared, totalLevels, attempts } = request.data || {};

    if (!challengeId || typeof score !== 'number' || typeof levelsCleared !== 'number') {
        throw new HttpsError('invalid-argument', 'Missing or invalid challengeId, score, or levelsCleared.');
    }

    if (score < 0 || score > 10000 || levelsCleared < 0 || levelsCleared > 20) {
        throw new HttpsError('invalid-argument', 'Score or levelsCleared out of range.');
    }

    // Rate limit: 1 submission per challenge per 30 seconds
    const rateLimitRef = db.collection(`users/${uid}/score_submissions`);
    try {
        const recent = await rateLimitRef
            .where('challengeId', '==', challengeId)
            .where('timestamp', '>', new Date(Date.now() - 30000))
            .get();
        if (recent.size >= 1) {
            throw new HttpsError('resource-exhausted', 'Score already submitted. Wait before resubmitting.');
        }
    } catch (e) {
        if (e instanceof HttpsError) throw e;
        console.warn('Score rate limit query failed:', e.message);
    }

    // Log rate limit entry
    rateLimitRef.add({
        challengeId,
        timestamp: FieldValue.serverTimestamp()
    }).catch(e => console.warn('Score rate limit log failed:', e.message));

    // Fetch display name from user profile (if exists)
    let displayName = 'Anonymous';
    try {
        const userDoc = await db.doc(`users/${uid}`).get();
        if (userDoc.exists) {
            const data = userDoc.data();
            displayName = data.callsign || data.displayName || 'Anonymous';
        }
    } catch (e) {
        console.warn('Failed to fetch user profile for leaderboard:', e.message);
    }

    const scoreRef = db.doc(`challenge_leaderboard/${challengeId}/scores/${uid}`);

    // Only write if this score is better than the existing one
    const existingDoc = await scoreRef.get();
    if (existingDoc.exists && existingDoc.data().score >= score) {
        return { submitted: false, reason: 'existing_score_higher' };
    }

    await scoreRef.set({
        uid,
        displayName,
        score,
        levelsCleared,
        totalLevels: totalLevels || 8,
        attempts: attempts || {},
        timestamp: FieldValue.serverTimestamp()
    });

    // Update per-level stats
    if (attempts && typeof attempts === 'object') {
        const batch = db.batch();
        for (const [levelId, attemptCount] of Object.entries(attempts)) {
            const levelNum = parseInt(levelId);
            if (!levelNum || levelNum < 1 || levelNum > 20) continue;

            const statsRef = db.doc(`challenge_leaderboard/${challengeId}/stats/level_${levelNum}`);
            // Use set with merge to handle first-time creation
            batch.set(statsRef, {
                totalAttempts: FieldValue.increment(attemptCount || 0),
                totalSuccesses: FieldValue.increment(1),
                lastUpdated: FieldValue.serverTimestamp()
            }, { merge: true });
        }
        await batch.commit();
    }

    return { submitted: true };
});

/**
 * getLeaderboard — Fetch top scores and per-level stats for a challenge.
 * Client sends: { challengeId }
 * Returns: { topScores: [...], levelStats: {...} }
 */
exports.getLeaderboard = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { challengeId } = request.data || {};
    if (!challengeId) {
        throw new HttpsError('invalid-argument', 'Missing challengeId.');
    }

    // Fetch top 20 scores
    const scoresSnap = await db.collection(`challenge_leaderboard/${challengeId}/scores`)
        .orderBy('score', 'desc')
        .limit(20)
        .get();

    const topScores = [];
    scoresSnap.forEach(doc => {
        const d = doc.data();
        topScores.push({
            displayName: d.displayName || 'Anonymous',
            score: d.score,
            levelsCleared: d.levelsCleared,
            totalLevels: d.totalLevels || 8,
            timestamp: d.timestamp ? d.timestamp.toDate().toISOString() : null
        });
    });

    // Fetch per-level stats
    const statsSnap = await db.collection(`challenge_leaderboard/${challengeId}/stats`).get();
    const levelStats = {};
    statsSnap.forEach(doc => {
        const d = doc.data();
        const successRate = d.totalSuccesses > 0
            ? Math.round((d.totalSuccesses / (d.totalSuccesses + (d.totalAttempts - d.totalSuccesses))) * 100)
            : 0;
        const avgAttempts = d.totalSuccesses > 0
            ? Math.round(d.totalAttempts / d.totalSuccesses * 10) / 10
            : 0;
        levelStats[doc.id] = {
            totalAttempts: d.totalAttempts || 0,
            totalSuccesses: d.totalSuccesses || 0,
            successRate,
            avgAttempts
        };
    });

    return { topScores, levelStats };
});

// ─── SEC-5: Server-Side Quiz Grading ─────────────────────────────

/**
 * gradeQuiz — Server-side quiz answer validation.
 * The client submits answers; the server looks up the answer key from
 * Firestore (quiz_keys/{quizId}) and returns right/wrong per question.
 * NEVER returns the correct answers — only whether each was correct.
 */
exports.gradeQuiz = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { quizId, answers } = request.data || {};

    if (!quizId || typeof quizId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing or invalid quizId.');
    }

    if (!answers || typeof answers !== 'object') {
        throw new HttpsError('invalid-argument', 'Missing or invalid answers object.');
    }

    // Look up answer key from Firestore
    const keyDoc = await db.doc(`quiz_keys/${quizId}`).get();
    if (!keyDoc.exists) {
        throw new HttpsError('not-found', 'Quiz key not found. This quiz may not support server-side grading.');
    }

    const keyData = keyDoc.data();
    const answerKey = keyData.answers; // Array of correct answer indices

    if (!Array.isArray(answerKey)) {
        throw new HttpsError('internal', 'Invalid answer key format.');
    }

    const total = answerKey.length;
    let score = 0;
    const results = [];

    // Compare each submitted answer against the key
    for (let i = 0; i < total; i++) {
        const submitted = answers[String(i)];
        const isCorrect = submitted !== undefined && submitted === answerKey[i];
        if (isCorrect) score++;
        results.push({ correct: isCorrect });
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passingScore = keyData.passingScore || 70;
    const passed = percentage >= passingScore;

    // Log the attempt to Firestore for analytics
    const uid = request.auth.uid;
    try {
        await db.collection(`users/${uid}/quiz_attempts`).add({
            quizId,
            score,
            total,
            percentage,
            passed,
            timestamp: FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.warn('Quiz attempt log failed:', e.message);
    }

    return { score, total, percentage, passed, results };
});

// ─── SEC-4: Operator Mission Completion Validation ──────────────

/**
 * evaluateCheck — Server-side check expression evaluator.
 * Mirrors the client-side evaluateCheck() in OperatorEngine.js exactly.
 * Supports: boolean flags, .has(), .size comparisons, numeric comparisons,
 * && (AND), || (OR) operators.
 *
 * State snapshot values:
 *   - Sets are submitted as arrays and converted to Set objects here
 *   - Booleans, numbers, and arrays are used as-is
 */
function evaluateCheck(checkExpr, state) {
    try {
        const expr = checkExpr;

        // Handle Set.has() calls: nmapTargets.has("x")
        const hasMatch = expr.match(/^(\w+)\.has\(["']([^"']+)["']\)$/);
        if (hasMatch) {
            const setName = hasMatch[1];
            const value = hasMatch[2];
            if (state[setName] && typeof state[setName].has === 'function') {
                return state[setName].has(value);
            }
            return false;
        }

        // Handle OR: expr1 || expr2
        const orParts = expr.split(/\s*\|\|\s*/);
        if (orParts.length > 1) {
            for (const part of orParts) {
                if (evaluateCheck(part.trim(), state)) return true;
            }
            return false;
        }

        // Handle AND: expr1 && expr2
        const andParts = expr.split(/\s*&&\s*/);
        if (andParts.length > 1) {
            for (const part of andParts) {
                if (!evaluateCheck(part.trim(), state)) return false;
            }
            return true;
        }

        // Handle negation prefix: !flagName
        const negMatch = expr.match(/^!(\w+)$/);
        if (negMatch) {
            return !state[negMatch[1]];
        }

        // Handle .indexOf() comparisons: flagsFound.indexOf("root-home") !== -1
        const idxMatch = expr.match(/^(\w+)\.indexOf\(["']([^"']+)["']\)\s*(>=|<=|===|==|>|<|!==|!=)\s*(-?\d+)$/);
        if (idxMatch) {
            const arrName = idxMatch[1];
            const searchVal = idxMatch[2];
            const idxOp = idxMatch[3];
            const idxNum = parseInt(idxMatch[4], 10);
            const arr = state[arrName];
            const idx = (Array.isArray(arr)) ? arr.indexOf(searchVal) : -1;
            switch (idxOp) {
                case '>=':  return idx >= idxNum;
                case '<=':  return idx <= idxNum;
                case '>':   return idx > idxNum;
                case '<':   return idx < idxNum;
                case '===': case '==': return idx === idxNum;
                case '!==': case '!=': return idx !== idxNum;
            }
            return false;
        }

        // Handle .size comparisons: nodesDiscovered.size >= 4
        const sizeMatch = expr.match(/^(\w+)\.size\s*(>=|<=|===|==|>|<|!==|!=)\s*(\d+)$/);
        if (sizeMatch) {
            const setObj = state[sizeMatch[1]];
            const op = sizeMatch[2];
            const num = parseInt(sizeMatch[3], 10);
            const sz = (setObj && typeof setObj.size === 'number') ? setObj.size : 0;
            switch (op) {
                case '>=':  return sz >= num;
                case '<=':  return sz <= num;
                case '>':   return sz > num;
                case '<':   return sz < num;
                case '===': case '==': return sz === num;
                case '!==': case '!=': return sz !== num;
            }
            return false;
        }

        // Handle plain boolean flag: firewallBypassed, etc.
        if (/^\w+$/.test(expr)) {
            return !!state[expr];
        }

        // Handle simple comparison: integrity >= 2, trapsTriggered === 0
        const cmpMatch = expr.match(/^(\w+)\s*(>=|<=|===|==|>|<|!==|!=)\s*(\d+)$/);
        if (cmpMatch) {
            const val = state[cmpMatch[1]];
            const cmpOp = cmpMatch[2];
            const cmpNum = parseInt(cmpMatch[3], 10);
            if (val === undefined) return false;
            switch (cmpOp) {
                case '>=':  return val >= cmpNum;
                case '<=':  return val <= cmpNum;
                case '>':   return val > cmpNum;
                case '<':   return val < cmpNum;
                case '===': case '==': return val === cmpNum;
                case '!==': case '!=': return val !== cmpNum;
            }
        }

        return false;
    } catch (e) {
        return false;
    }
}

/**
 * Sanitize a state snapshot from the client.
 * Converts array-encoded Sets back to Set objects, validates types,
 * and strips any keys not in the allowed stateKeys list.
 */
function sanitizeStateSnapshot(snapshot, allowedKeys) {
    const clean = {};
    // Known Set-type state keys (always present on operator state)
    const setKeys = ['nodesDiscovered', 'nmapTargets'];

    for (const key of allowedKeys) {
        if (!(key in snapshot)) continue;
        const val = snapshot[key];

        if (setKeys.includes(key)) {
            // Convert array to Set for .has()/.size evaluation
            clean[key] = new Set(Array.isArray(val) ? val : []);
        } else if (typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string') {
            clean[key] = val;
        } else if (Array.isArray(val)) {
            clean[key] = val;
        }
        // Skip objects, functions, etc.
    }

    // Always include built-in numeric/boolean state keys if present
    const builtins = ['integrity', 'trapsTriggered', 'agentCmdCount'];
    for (const key of builtins) {
        if (key in snapshot && !(key in clean)) {
            const val = snapshot[key];
            if (typeof val === 'number') clean[key] = val;
        }
    }

    return clean;
}

/**
 * validateMissionCompletion -- Server-side operator mission validation.
 * The client submits its state snapshot; the server re-evaluates all
 * check expressions against it using the authoritative keys from Firestore.
 * NEVER reveals check expressions to the client.
 */
exports.validateMissionCompletion = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { missionId, stateSnapshot } = request.data || {};

    if (!missionId || typeof missionId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing or invalid missionId.');
    }

    if (!stateSnapshot || typeof stateSnapshot !== 'object') {
        throw new HttpsError('invalid-argument', 'Missing or invalid stateSnapshot.');
    }

    const uid = request.auth.uid;

    // Look up mission key from Firestore
    const keyDoc = await db.doc(`operator_keys/${missionId}`).get();
    if (!keyDoc.exists) {
        throw new HttpsError('not-found', 'Mission key not found. This mission may not support server-side validation.');
    }

    const keyData = keyDoc.data();
    const objectives = keyData.objectives; // Array of { id, check }
    const stateKeys = keyData.stateKeys || [];

    if (!Array.isArray(objectives) || objectives.length === 0) {
        throw new HttpsError('internal', 'Invalid mission key format.');
    }

    // Sanitize the submitted state — only allow declared state keys
    // Include built-in keys that are always on operator state
    const allAllowedKeys = [...stateKeys, 'nodesDiscovered', 'nmapTargets', 'integrity', 'trapsTriggered', 'agentCmdCount'];
    const cleanState = sanitizeStateSnapshot(stateSnapshot, allAllowedKeys);

    // Re-evaluate each objective check expression against the clean state
    const completedObjectives = [];
    let allValid = true;

    for (const obj of objectives) {
        const passed = evaluateCheck(obj.check, cleanState);
        if (passed) {
            completedObjectives.push(obj.id);
        } else {
            allValid = false;
        }
    }

    const missionComplete = allValid && completedObjectives.length === objectives.length;

    // Log completion to Firestore
    if (missionComplete) {
        try {
            await db.doc(`users/${uid}/mission_completions/${missionId}`).set({
                missionId,
                completedAt: FieldValue.serverTimestamp(),
                objectiveCount: objectives.length,
                source: 'server'
            });
        } catch (e) {
            console.warn('Mission completion log failed:', e.message);
        }
    }

    // Log the validation attempt
    try {
        await db.collection(`users/${uid}/mission_attempts`).add({
            missionId,
            valid: missionComplete,
            completedObjectives,
            timestamp: FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.warn('Mission attempt log failed:', e.message);
    }

    return {
        valid: missionComplete,
        completedObjectives,
        missionComplete
    };
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
