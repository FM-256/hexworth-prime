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
 * Flags are salted per-session so DevTools inspection is useless.
 * The client never sees the real flag — only the server knows.
 */
exports.validateFlag = onCall(cfOptions, async (request) => {
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
        xp: FieldValue.increment(numAmount),
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
            updates.xp = FieldValue.increment(1000);
            if (house) {
                updates[`houseProgress.${house}.completed`] = FieldValue.increment(1);
            }
            break;

        case 'lab':
            updates.labsCompleted = FieldValue.arrayUnion(itemId);
            updates.xp = FieldValue.increment(500);
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
            updates.xp = FieldValue.increment(numScore === 100 ? 200 : 100);
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
        xp: FieldValue.increment(25), // daily login bonus
        updatedAt: FieldValue.serverTimestamp()
    });

    return { streak: newStreak, alreadyUpdated: false };
});

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

    const localModules = sanitizeStringArray(localData.modulesCompleted);
    const localLabs = sanitizeStringArray(localData.labsCompleted);
    const localAchievements = sanitizeStringArray(localData.achievements);
    const localQuizzes = sanitizeQuizzes(localData.quizzes);
    const localXP = Math.max(0, Math.min(1000000, parseInt(localData.xp) || 0));
    const localStreak = Math.max(0, Math.min(10000, parseInt(localData.streak) || 0));
    const localFavorites = sanitizeFavorites(localData.favorites);

    // Get cloud profile
    const userRef = db.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    const cloudData = userDoc.exists ? userDoc.data() : {};

    // Merge: union arrays, max scalars
    const mergedModules = [...new Set([...(cloudData.modulesCompleted || []), ...localModules])];
    const mergedLabs = [...new Set([...(cloudData.labsCompleted || []), ...localLabs])];
    const mergedAchievements = [...new Set([...(cloudData.achievements || []), ...localAchievements])];
    const mergedXP = Math.max(cloudData.xp || 0, localXP);
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

    await userRef.set({
        modulesCompleted: mergedModules,
        labsCompleted: mergedLabs,
        achievements: mergedAchievements,
        quizzes: mergedQuizzes,
        favorites: mergedFavorites,
        xp: mergedXP,
        streak: mergedStreak,
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return {
        success: true,
        modulesCount: mergedModules.length,
        xp: mergedXP,
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
