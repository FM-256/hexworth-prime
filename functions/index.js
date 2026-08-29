/**
 * Hexworth Prime — Cloud Functions (Node 22)
 *
 * QC-4: Server-side access control (admin claims, gate verification)
 * AR-11: Server-side flag validation (per-session salted flags)
 */
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const crypto = require('crypto');

// ─── The Wire: Tournament Notification System ────────────────────
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

// ─── LiveKit Secrets (Google Cloud Secret Manager) ──────────────
const livekitApiKey = defineSecret('LIVEKIT_API_KEY');
const livekitApiSecret = defineSecret('LIVEKIT_API_SECRET');
const LIVEKIT_WS_URL = 'wss://hexworth-fxq4kwzr.livekit.cloud';

// ─── Sandbox mission badges (shared with bc1 lab-manager /grade-for) ─
// Same secret hex-ai-bridge.js declares for sandbox_task_state; declared
// here too so awardMissionBadge can bind it.
const sandboxServiceKeyIdx = defineSecret('SANDBOX_SERVICE_KEY');
// Sextant trajectory pepper — bound to withdrawFromObservatory so a withdrawal can
// recompute a learner's cohort token and purge their tokenized Plane-B points.
const sextantPepper = defineSecret('SEXTANT_PEPPER');
// Basic-auth credential ("user:pass") for the service-probe status endpoint on bc1. A secret
// because a browser cannot hold it — see getServiceHealth. The URL below is NOT secret; it is a
// public hostname whose contents are protected by that credential.
const serviceStatusCredential = defineSecret('SERVICE_STATUS_CREDENTIAL');
const SERVICE_STATUS_URL_DEFAULT = 'https://sandbox.hexworth.tech/status.json';

initializeApp();
const db = getFirestore();

// ─── Configuration ───────────────────────────────────────────────
const ADMIN_EMAILS = require('./admin-emails'); // single source of truth — see admin-emails.js
const { gradeSubmission, applyReveal } = require('./quiz-grading'); // see quiz-grading.js header
const FLAG_SECRET = crypto.randomBytes(32).toString('hex'); // per-deploy secret

// App Check: Set to true after configuring reCAPTCHA v3 in Firebase Console
// and replacing RECAPTCHA_SITE_KEY_PLACEHOLDER in FirebaseAuth.js
const ENFORCE_APP_CHECK = false;

// Common Cloud Function options
const cfOptions = { region: 'us-central1', enforceAppCheck: ENFORCE_APP_CHECK };

// validateFlag rate limit: max flag submits per box per 60s window. Raised from 10
// (too tight for multi-stage exams like the cell-Σ commissioning final, where a
// student legitimately iterates the grader+submit across 9 stages). A FLAG{} value
// has far too much entropy for 30/min to enable brute-forcing.
const FLAG_RATE_LIMIT_PER_MIN = 30;

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

    // PRESERVE AN INSTRUCTOR GRANT ON THE CLAIM TOO (2026-08-21). The Firestore `role` write
    // below was fixed for exactly this on 2026-08-03; the CLAIM write up here was left deriving
    // `handler` from the admin allowlist, so it kept doing what that fix stopped. Because this
    // function runs on EVERY standard sign-in (signInWithGoogle, signInWithEmail,
    // createAccountWithEmail, linkWithGoogle -- FirebaseAuth.js:329,510,558,622, each followed by
    // a forced token refresh), any NON-ADMIN holding handler:true lost it at their next login,
    // silently. `handler` gates five Cloud Functions including gradeEDTSubmission, so the claim
    // that grants grading was erasing itself on the way in.
    //
    // Found by Chris while re-reviewing the users/{userId} rules fix, which had proposed making
    // this claim the sole gate on student PII -- resting a security boundary on a value that
    // deletes itself.
    //
    // `admin` stays DERIVED on purpose: removing an address from the allowlist must still
    // downgrade an ex-admin on their next sign-in. Only `handler` is preserved, and it remains
    // revocable -- adminSetRole writes handler:false explicitly, which this then reads back as
    // false. Read BEFORE the write, so a getUser() failure throws without having stomped
    // anything; the client already tolerates this call failing (FirebaseAuth.js:346).
    const existingClaims = (await getAuth().getUser(uid)).customClaims || {};

    await getAuth().setCustomUserClaims(uid, {
        admin: isAdmin,
        handler: isAdmin || existingClaims.handler === true
    });

    // Also write to Firestore user doc for client-side cache reads.
    // PRESERVE AN INSTRUCTOR GRANT (Chris 2026-08-03): this write used to be an unconditional
    // role: isAdmin ? 'admin' : 'student', which was harmless while `role` was inert data.
    // The moment AccessGuard's instructor level started reading it, this line became a silent
    // revoker: a TA granted role='instructor' by hand was stomped back to 'student' on their
    // NEXT explicit sign-in (this function runs on signInWithGoogle, signInWithEmail,
    // createAccountWithEmail and linkWithGoogle) -- locked out with no error and no obvious
    // cause. Non-admin instructors keep their role; everyone else behaves exactly as before,
    // including ex-admins being downgraded to student.
    const existing = await db.doc(`users/${uid}`).get();
    const currentRole = existing.exists ? existing.data().role : null;
    const role = isAdmin ? 'admin'
               : (currentRole === 'instructor' ? 'instructor' : 'student');

    await db.doc(`users/${uid}`).set({
        role: role,
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

/**
 * getServiceHealth — the SLA view for the Pulse dashboard.
 *
 * WHY A FUNCTION AND NOT A DIRECT FETCH FROM THE BROWSER
 *   The probe runs on bc1 and publishes its results over the tunnel that already serves
 *   sandbox.hexworth.tech. That endpoint is protected by basic auth, and a browser cannot hold
 *   that credential — anything shipped to the client is public. So the credential lives here,
 *   server-side, and the ADMIN CHECK is the platform's own `requireAdmin`: the same allowlist and
 *   custom claim that gate every other admin operation. No second auth system to keep in step.
 *
 *   The alternative designs were worse. Writing to Firestore from bc1 would put a write
 *   credential on the host that runs student sandbox containers — the least-trusted box on the
 *   estate. Making the endpoint public would mean "gated" was decorative.
 *
 * WHAT IT RETURNS
 *   `stale` is computed here rather than trusted from the payload, because the failure this
 *   whole system exists for is SILENCE: a probe that stopped reporting looks exactly like a probe
 *   reporting healthy. If the data is old, the UI must be able to say so even when every service
 *   in it reads "up".
 */
exports.getServiceHealth = onCall(
    { ...cfOptions, secrets: [serviceStatusCredential] },
    async (request) => {
    requireAdmin(request);

    // URL is not secret (it is a public hostname); the CREDENTIAL is, so it goes through
    // Secret Manager like LIVEKIT_API_KEY and SEXTANT_PEPPER rather than a plain env var.
    const url = process.env.SERVICE_STATUS_URL || SERVICE_STATUS_URL_DEFAULT;
    const cred = serviceStatusCredential.value();          // "user:pass"
    if (!url || !cred) {
        // Fail loudly. A monitoring endpoint that silently returns nothing is the defect.
        throw new HttpsError('failed-precondition',
            'SERVICE_STATUS_URL / SERVICE_STATUS_CREDENTIAL are not configured.');
    }

    let payload;
    try {
        const res = await fetch(url, {
            headers: { Authorization: 'Basic ' + Buffer.from(cred).toString('base64') },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
            // Distinguish "the probe host is unreachable" from "the services are down". They are
            // different problems and must not render the same way.
            return { reachable: false, httpStatus: res.status, services: [], stale: true };
        }
        payload = await res.json();
    } catch (err) {
        return { reachable: false, error: String(err).slice(0, 120), services: [], stale: true };
    }

    // ⚠ CLAMPING HIDES CLOCK SKEW, so report it instead of absorbing it. If bc1's clock runs
    // ahead of this function's, the raw age goes NEGATIVE and Math.max would turn that into
    // "probed just now" — the most reassuring possible reading of a condition we cannot actually
    // vouch for. bc1 lost power twice on 2026-08-18, which is exactly when clocks jump.
    const rawAge = Math.floor(Date.now() / 1000) - (payload.generated_at || 0);
    const clockSkew = rawAge < -30;              // small negatives are ordinary scheduling jitter
    const ageSeconds = Math.max(0, rawAge);
    const services = Array.isArray(payload.services) ? payload.services : [];
    return {
        reachable: true,
        services,
        // An empty list from a parseable payload is a BROKEN PROBE, not a healthy platform. The
        // caller must be able to tell those apart without inferring it from services.length.
        empty: services.length === 0,
        clockSkew,
        generatedAt: payload.generated_at || null,
        generatedIso: payload.generated_iso || null,
        probeHost: payload.probe_host || null,
        ageSeconds,
        // cron is every 2 min; 300s means the probe itself has stopped and NOTHING below is
        // trustworthy, however green it looks.
        stale: ageSeconds > 300,
    };
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

    // BUG-044: this used to check the proof only `if (proof && gateNum <= 5)`, so an EMPTY
    // proof skipped validation for EVERY gate. Since prerequisites are checked against the
    // caller's own docs, a signed-in caller could loop gateNumber 1,2,3... from the console
    // and mint a fully server-blessed vault without solving anything.
    //
    // The allowlist below fails CLOSED: a gate not named here must present a valid proof.
    // A threshold ("anything above 5 is fine") fails OPEN for every future gate number, which
    // is exactly how this hole would come back.
    //
    // Gates 1-5 have a real validator: validateGateAnswer hashes the student's answer against
    // gate_registry and writes the completion itself, so nothing legitimate calls this function
    // for them (verified: the only callers in _app are gates 6-8, all with proof:''). And no
    // caller can satisfy the proof anyway -- generateGateProof HMACs with FLAG_SECRET, which is
    // crypto.randomBytes at module load (line 35), so it is unguessable AND changes per deploy.
    // The practical effect is that completeGate is closed for every gate except 6-8.
    const CLIENT_ATTESTED_GATES = [6, 7, 8];
    const clientAttested = CLIENT_ATTESTED_GATES.includes(gateNum);
    if (!clientAttested) {
        const expectedProof = generateGateProof(gateNum, uid);
        if (!proof || proof !== expectedProof) {
            throw new HttpsError('permission-denied',
                'This gate cannot be completed through this endpoint. Submit your answer to be validated.');
        }
    }

    // Check prerequisites — must have completed all previous gates
    if (gateNum > 1) {
        const prevGate = await db.doc(`users/${uid}/gates/gate${gateNum - 1}`).get();
        if (!prevGate.exists || !prevGate.data().completed) {
            throw new HttpsError('failed-precondition', `Must complete gate ${gateNum - 1} first.`);
        }
    }

    // Record the completion WITH ITS PROVENANCE. Gates 6-8 validate their multi-step work in
    // the browser, so this is the student's own attestation, not a server verification -- and a
    // reader that cannot tell the two apart is how the vault ended up trusting forged progress.
    // Server-validated completions (validateGateAnswer) carry verified: true.
    await db.doc(`users/${uid}/gates/gate${gateNum}`).set({
        completed: true,
        completedAt: FieldValue.serverTimestamp(),
        gateNumber: gateNum,
        verified: !clientAttested,
        source: clientAttested ? 'client-attested' : 'server'
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
// The CTF counter definition lives in ctf-stats.js so account-merge.js uses the IDENTICAL
// logic. Three conflicting notions of "pwned" previously existed in this codebase.
const { recomputeCtfStats } = require('./ctf-stats');
const _recomputeCtfStats = (uid) => recomputeCtfStats(db, FieldValue, uid);

/* ── #306: THE REVEAL GATE, ENFORCED ──────────────────────────────────────────────
   config-shared.js declared the gate as "checked SERVER-SIDE against captured evidence"
   and cited scope criterion E1. Nothing read it. Mallory proved on 2026-08-09 that a
   player could type a flag and Transmit on the first frame with zero evidence work, so
   anyone holding a flag out-of-band got full credit without touching the mechanic the box
   exists to teach.

   ⚠ THIS MUST GUARD EVERY CREDITING PATH. validateFlag has two: Mode 1 with a flagId and
   Mode 2 which scans every flag for the box. Gating only Mode 1 would make "omit the
   flagId" the bypass, which is precisely the shape of bug this is closing. If you add a
   third path, it calls this too.

   FAILS OPEN BY DESIGN when no gate is seeded for a flag. 12 of 15 missions have a
   derivable spec (see gen-mission-gates.js); the rest behave exactly as they do today
   rather than being gated on a guess that would reject correct answers. */
const missionGates = require('./mission-gates');

async function assertGateSatisfied(uid, boxId, flagId) {
    let gateDoc;
    try {
        gateDoc = await db.doc(`mission_gates/${boxId}`).get();
    } catch (e) {
        /* A gate lookup that ERRORS must not silently credit. But it must also not lock every
           student out of a working box because one read failed, so it is logged loudly and
           treated as ungated. If this line starts appearing in logs, that is the alarm. */
        console.error(`[revealGate] lookup failed for ${boxId}/${flagId}: ${e.message}`);
        return null;
    }
    if (!gateDoc.exists) return null;
    const gate = (gateDoc.data().gates || {})[flagId];
    if (!gate) return null;

    /* The progress read needs the same guard as the gate lookup above, and did not have it.
       Unguarded, a transient Firestore error here would throw straight out of validateFlag,
       and validateFlag is the submission path for EVERY CTF box on the platform, not just this
       one. A blip in one box's gate would surface as flag submission being broken everywhere.

       Fails OPEN, loudly, for the same reason the lookup does: refusing to credit a correct
       answer because a read failed is a worse outcome than crediting one we could not verify.
       Forcing this path is not a practical bypass, and if it starts appearing in logs that is
       the alarm rather than the leak. */
    let progSnap;
    try {
        progSnap = await db.doc(`users/${uid}/mission_progress/${boxId}_${flagId}`).get();
    } catch (e) {
        console.error(`[revealGate] progress read failed for ${uid} ${boxId}/${flagId}: ${e.message}`);
        return null;
    }
    const progress = progSnap.exists ? progSnap.data() : {};
    const result = missionGates.evaluateGate(gate, progress, gate.sources || {});
    return result.satisfied ? null : result;
}

/**
 * recordMissionFinding — the ONLY way a finding enters a player's ledger.
 *
 * The client reports an ACTION ("I compared these sources"), never a conclusion. The server
 * re-derives the result from its own copy of the mission's provenance and records it only if
 * the claim is TRUE. Accepting a self-reported conclusion would verify nothing, because a
 * client that can be edited to skip the work can be edited to claim it.
 *
 * What this deliberately does not try to stop: someone calling this endpoint directly with
 * the correct source pairs. Doing that requires knowing which sources share a dependency,
 * which IS the learning objective. The bar is "credit requires demonstrating the reasoning",
 * not "credit requires using our UI". Reject claims that are FALSE, not claims that arrived
 * by an unusual route.
 */
exports.recordMissionFinding = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
    const { boxId, flagId, findingId, sources, corroboratorId } = request.data || {};
    if (!boxId || !flagId) throw new HttpsError('invalid-argument', 'Missing boxId or flagId.');

    const uid = request.auth.uid;
    const gateDoc = await db.doc(`mission_gates/${boxId}`).get();
    if (!gateDoc.exists) throw new HttpsError('not-found', 'No gate spec for this box.');
    const gate = (gateDoc.data().gates || {})[flagId];
    if (!gate) throw new HttpsError('not-found', 'No gate spec for this mission.');

    const ref = db.doc(`users/${uid}/mission_progress/${boxId}_${flagId}`);
    const update = { boxId, flagId, updatedAt: FieldValue.serverTimestamp() };

    /* Claiming a CORROBORATOR is claiming to hold a second source. The family is decided by
       the server's own data, so a player cannot nominate a platform reading as physical
       evidence: that substitution is the exact error every mission in this box is about. */
    /* ⚠ NESTED OBJECT, NOT A DOTTED KEY. `set(..., {merge:true})` does NOT expand dot notation
       the way `update()` does: it writes a field whose NAME literally contains a dot. This
       code originally did update[`findings.${id}`] = true and then set(), which produced a
       field called "findings.three-channels-one-front-end" while evaluateGate read
       progress.findings and found undefined. Every necessary counted as missing, so a student
       who did all the work was still refused. Caught by the end-to-end run reading the ledger
       back out of Firestore; the callable itself cheerfully reported recorded:true. */
    if (corroboratorId) {
        const src = (gate.sources || {})[corroboratorId];
        if (!src) throw new HttpsError('invalid-argument', 'Unknown source.');
        update.corroborators = { [corroboratorId]: true };
        await ref.set(update, { merge: true });
        return { recorded: true, corroboratorId, family: src.family };
    }

    if (!findingId) throw new HttpsError('invalid-argument', 'Nothing claimed.');
    const spec = (gate.findings || {})[findingId];
    const verdict = missionGates.verifyFinding(spec, { sources }, gate.sources || {});
    if (!verdict.ok) {
        /* The reason is returned because it is about the sources the PLAYER named, so it
           teaches without handing over an answer they had not already reached. */
        return { recorded: false, reason: verdict.reason };
    }
    // Nested, for the same reason as corroborators above. A merge on a nested map adds the key
    // without clobbering findings already recorded.
    update.findings = { [findingId]: true };
    await ref.set(update, { merge: true });
    return { recorded: true, findingId, detail: verdict.reason };
});

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

        if (recentAttempts.size >= FLAG_RATE_LIMIT_PER_MIN) {
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
        /* Check the whole ALIAS GROUP for this flag, not just its canonical value.
         *
         * A box may seed several legitimate answers for one mission and alias the
         * alternates to a single capture id. le-01-cold-horizon does exactly that:
         * the accepted answer is the shared dependency a player discovered, and a
         * mission's trap pair usually shares more than one axis, so reporting the
         * shared issuer, the shared pipeline or the shared signing authority are
         * all correct findings.
         *
         * Mode 2 already honoured that, because it scanned every value and then
         * resolved through `aliases`. Mode 1 compared against `flags[flagId]`
         * alone, so the moment a client started passing a flagId (to stop
         * cross-mission mis-crediting, since real systems share dependency values
         * and the same string can be the right answer to several missions) every
         * alternate silently became wrong. A student giving a valid answer would
         * be told they failed AND docked wrongAnswerPenalty -- 27 of 27 alternates
         * across 15 missions, caught in review before it shipped.
         *
         * The cross-mission scoping is unchanged: candidates are still restricted
         * to the one mission the caller named.
         */
        const aliasMap = flagDoc.data().aliases || {};
        const candidates = Object.keys(flags).filter(
            k => k === flagId || aliasMap[k] === flagId
        );
        if (!candidates.length) {
            throw new HttpsError('not-found', 'Flag not found.');
        }
        const isCorrect = candidates.some(
            k => normalizedSubmission === String(flags[k]).trim().toLowerCase()
        );

        if (isCorrect) {
            /* Checked AFTER correctness so a wrong answer is still told it is wrong, and
               BEFORE any write so a gated submission leaves no capture behind. The player
               is not told which requirements are outstanding: the missing necessaries ARE
               the findings the mission exists to make them discover. */
            const blocked = await assertGateSatisfied(uid, boxId, flagId);
            if (blocked) {
                return { correct: false, gated: true, flagId: null,
                         message: missionGates.refusalMessage(blocked) };
            }
            await db.doc(`users/${uid}/flag_captures/${boxId}_${flagId}`).set({
                boxId, flagId, capturedAt: FieldValue.serverTimestamp(), sessionId: sessionId || null
            });
            // Server-authoritative recompute of BOTH counters — see _recomputeCtfStats.
            await _recomputeCtfStats(uid);
        }
        return { correct: isCorrect, flagId: isCorrect ? flagId : null };
    }

    // Mode 2: no flagId — check all flags for the box
    const aliases = flagDoc.data().aliases || {};
    for (const [fid, fvalue] of Object.entries(flags)) {
        if (normalizedSubmission === fvalue.trim().toLowerCase()) {
            const resolvedId = aliases[fid] || fid;
            // Same gate as Mode 1. Omitting flagId must not be a way around it.
            const blocked = await assertGateSatisfied(uid, boxId, resolvedId);
            if (blocked) {
                return { correct: false, gated: true, flagId: null,
                         message: missionGates.refusalMessage(blocked) };
            }
            await db.doc(`users/${uid}/flag_captures/${boxId}_${resolvedId}`).set({
                boxId, flagId: resolvedId, capturedAt: FieldValue.serverTimestamp(), sessionId: sessionId || null
            });
            // Server-authoritative recompute of BOTH counters — see _recomputeCtfStats.
            await _recomputeCtfStats(uid);
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

    /* ── COMPETITION BOXES NEVER HAVE FLAG VALUES DISCLOSED ────────────────────────────────
     * This function hands the caller a flag VALUE and checks only that they are signed in.
     * That is deliberate for teaching: BoxEngine pre-fetches every flag on page load
     * (BoxEngine.js:99-106) so VS/CoOp can validate against a local cache, and labs display
     * "you found FLAG{...}" as the reward. LagrangeEngine's header already names the cost —
     * 231 boxes hand a student every answer before they do anything — and correctly grades it
     * SPOILER-class rather than forgery-class, because captures are still compared server-side
     * by validateFlag.
     *
     * For a RANKED competition that distinction collapses: seeing the flag IS having it, so a
     * spoiler is a forgery. boxId and flagId both live in client-side config, so anyone signed
     * in can call this directly and collect a box's flags without opening the investigation.
     *
     * Registry docs may therefore set `deliveryDisabled: true`. Those boxes disclose nothing;
     * the player must submit what they worked out and validateFlag judges it — the pattern
     * le-01-cold-horizon already proves. Enforced HERE, server-side, because a client-side
     * rule is a request rather than a control.
     *
     * OPT-IN, not default-on, and that is a considered choice: flipping all 231 boxes would
     * silently break VS/CoOp's cache validation and remove the reward text from teaching labs.
     * Competition content opts in; teaching content is untouched.
     */
    /* Any truthy value blocks, not a strict === true. The seeder only ever writes a real
     * boolean, but the realistic way this field gets set in a hurry is a human editing the
     * Firestore doc during an event — and `"true"` typed as a string would sail past a strict
     * check and leave disclosure ON, on the one box somebody was trying to lock down. A
     * security control must fail CLOSED on an ambiguous value. Caught by testing the guard
     * against a string, not by reading it.
     */
    if (flagDoc.data().deliveryDisabled) {
        throw new HttpsError('permission-denied',
            'This box does not disclose flag values. Submit the flag you worked out instead.');
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

    // Helper: activate handler for this user (preserves admin if already admin)
    async function grantHandler() {
        const isAlreadyAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email.toLowerCase());
        await getAuth().setCustomUserClaims(uid, {
            handler: true,
            admin: isAlreadyAdmin
        });

        const updates = {
            handlerActivated: true,
            activatedAt: FieldValue.serverTimestamp()
        };
        // Only set accountType to handler if not already admin
        if (!isAlreadyAdmin) {
            updates.accountType = 'handler';
        }
        await db.doc(`users/${uid}`).set(updates, { merge: true });
    }

    // Check handler code (hardcoded)
    if (codeHash === HANDLER_CODE_HASH) {
        await grantHandler();
        return { role: 'handler' };
    }

    // Check dynamically generated handler codes from admin console
    const codesSnap = await db.collection('handler_codes')
        .where('hash', '==', codeHash)
        .where('expired', '==', false)
        .limit(1)
        .get();

    if (!codesSnap.empty) {
        const codeDoc = codesSnap.docs[0];
        const codeData = codeDoc.data();
        if (codeData.usedBy) {
            return { role: null }; // already used
        }

        // Check expiration — added 2026-04-26 to enforce code TTL server-side
        // Without this, expiresAt was cosmetic-only (set in admin console but never checked)
        if (codeData.expiresAt) {
            const expiresDate = codeData.expiresAt.toDate ? codeData.expiresAt.toDate() : new Date(codeData.expiresAt);
            if (expiresDate < new Date()) {
                // Auto-expire the code
                await codeDoc.ref.update({ expired: true });
                return { role: null };
            }
        }

        // Mark code as used
        await codeDoc.ref.update({
            usedBy: email || uid,
            usedAt: FieldValue.serverTimestamp()
        });

        await grantHandler();
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
                gateNumber: gateNum,
                verified: true,
                source: 'server'
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
            gateNumber: gateNum,
            verified: true,
            source: 'server'
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

    // ONCE PER REASON, ENFORCED SERVER-SIDE (BUG-082).
    //
    // Every client call site already gates on a localStorage "already awarded" flag, so the
    // INTENDED policy has always been one award per distinct reason. That guard is
    // devtools-clearable, and until 2026-08-01 it did not matter because a dead `hexworth_uid`
    // check meant these calls never reached the server at all. Un-gating them made ~99 call sites
    // live, at which point the only thing standing between a student and arbitrary XP was a
    // localStorage boolean. Chris blocked the fix on exactly that.
    //
    // This does NOT invent policy -- it moves the policy the clients already enforce to where a
    // student cannot reach it. Measured before writing: of 98 call sites, 89 pass a static reason
    // and the 9 dynamic ones vary by SCENARIO or MODULE ("STRIDE Threat Modeler - " + scenario,
    // moduleId + " completed"), never per attempt. So distinct work still earns distinct XP.
    //
    // arrayUnion alone cannot do this: the entry carries a timestamp, so every append is a unique
    // object and union never collapses them.
    //
    // Transaction, not read-then-write: two rapid clicks would otherwise both read "absent" and
    // both append.
    const result = await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        const history = (snap.exists && snap.data().xpHistory) || [];
        if (history.some((e) => e && e.reason === reason)) {
            return { success: true, added: 0, deduped: true };
        }
        tx.update(userRef, {
            xpHistory: FieldValue.arrayUnion({
                amount: numAmount,
                reason,
                timestamp: new Date().toISOString()
            }),
            updatedAt: FieldValue.serverTimestamp()
        });
        return { success: true, added: numAmount };
    });

    return result;
});

/**
 * awardMissionBadge — SERVER-ISSUED badge for Linux Command Mastery missions.
 *
 * The client never awards these. Flow: student finishes a mission in the
 * sandbox -> UI shows /check results -> UI calls this with {mission}. We
 * re-grade server-side via the bc1 lab-manager's service-key-gated
 * /grade-for endpoint (uid resolved to ITS OWN session at the source of
 * truth — no session id crosses the trust boundary; same Style-A model as
 * hex-ai-bridge sandbox_task_state). Only a badgeEligible=true verdict
 * writes the award: users/{uid}.achievements arrayUnion (existing UI reads
 * this) + users/{uid}/server_awards/{badgeId} proof doc (no client write
 * rule exists for that subcollection, so it is CF-only by default-deny —
 * the tamper-evident record).
 */
/**
 * awardCourseBadge — issues a COURSE completion badge from server-issued mission proofs.
 *
 * Callable rather than a Firestore trigger on server_awards, deliberately: a trigger would fire
 * on every mission award and re-scan the whole subcollection each time, and the client already
 * knows the moment a mission badge lands, which is exactly when a course might have completed.
 * The client can only ASK; it supplies no evidence and cannot influence the outcome.
 *
 * Nothing here trusts the caller. It counts distinct missions the SERVER awarded (each one
 * re-graded against bc1 by awardMissionBadge, each proof in a subcollection with no client
 * write rule) and awards only if the threshold is genuinely met. A client calling this in a
 * loop gets the same answer as a client that never calls it.
 *
 * Idempotent: re-awarding writes the same badgeId with merge, and the response says whether
 * this call is what awarded it, so the UI can celebrate once.
 *
 * See functions/course-badges.js for why exactly one course is registered, and for why this
 * awards a badge but does not yet release the student's OpenStack slot (#275).
 */
const courseBadges = require('./course-badges');

exports.awardCourseBadge = onCall({ ...cfOptions, secrets: [sandboxServiceKeyIdx] }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const results = await courseBadges.evaluate(db, uid);
    const awarded = [];

    for (const c of results) {
        if (!c.complete || c.alreadyAwarded) continue;
        const userRef = db.doc(`users/${uid}`);
        await userRef.set({
            achievements: FieldValue.arrayUnion(c.badgeId),
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        await db.doc(`users/${uid}/server_awards/${c.badgeId}`).set({
            badgeId: c.badgeId,
            course: c.courseId,
            name: c.name,
            /* The proof is recorded, not just the verdict. A later audit can re-derive this
               award from the mission list without trusting that the count was right when it
               ran, which is the same standard the mission awards themselves are held to. */
            missions: c.missions,
            missionCount: c.count,
            required: c.requiresDistinctMissions,
            source: 'server',
            awardedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        awarded.push({ badgeId: c.badgeId, name: c.name, missions: c.count });
        console.log(`[awardCourseBadge] ${uid} <- ${c.badgeId} (${c.count}/${c.requiresDistinctMissions} missions)`);

        /* #275: the badge is the completion record, so this is the moment the student's
           OpenStack pool slot can go back. Cloud Functions cannot reach the bc2 claim service
           (tailscale), so this relays through bc1, which can: CF -> bc1 (service key) -> bc2
           (bridge secret) -> emptiness guard.

           AFTER the badge write and deliberately NON-FATAL. The badge is the thing the student
           earned; a bridge that is down must never cost them the award, and the slot can be
           released later by any other path. Releasing first would risk the inverse: a freed
           slot with no record of why.

           bc2 REFUSES any slot still holding credentials, servers or volumes, so a student who
           has not torn their sandbox down keeps it, and this call simply reports that. Nothing
           here deletes a cloud resource; it clears a pointer. */
        if (c.sandboxCourse) {
            try {
                const rel = await fetch('https://sandbox.hexworth.tech/api/sandbox/release-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',
                               'x-service-key': sandboxServiceKeyIdx.value() },
                    body: JSON.stringify({ uid }),
                    signal: AbortSignal.timeout(30000),
                });
                const rd = await rel.json().catch(() => null);
                console.log(`[awardCourseBadge] slot release for ${uid}: ${rel.status} ${JSON.stringify(rd)}`);
            } catch (e) {
                console.error(`[awardCourseBadge] slot release failed for ${uid} (badge stands): ${e.message}`);
            }
        }
    }

    return {
        awarded: awarded.length > 0,
        badges: awarded,
        progress: results.map(c => ({ courseId: c.courseId, count: c.count,
                                      required: c.requiresDistinctMissions,
                                      complete: c.complete, held: c.alreadyAwarded }))
    };
});


exports.awardMissionBadge = onCall({ ...cfOptions, secrets: [sandboxServiceKeyIdx] }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const mission = request.data && request.data.mission;
    if (typeof mission !== 'string' || !/^[a-z][a-z0-9-]{0,40}$/.test(mission)) {
        throw new HttpsError('invalid-argument', 'mission must be a lowercase slug.');
    }

    const serviceKey = sandboxServiceKeyIdx.value();
    if (!serviceKey) {
        throw new HttpsError('failed-precondition', 'Badge service not configured.');
    }

    // Re-grade at the source of truth. Timeout well inside the CF budget.
    const url = `https://sandbox.hexworth.tech/api/sandbox/grade-for?uid=${encodeURIComponent(uid)}&mission=${encodeURIComponent(mission)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let verdict;
    try {
        const resp = await fetch(url, { headers: { 'X-Service-Key': serviceKey }, signal: controller.signal });
        if (!resp.ok) throw new HttpsError('unavailable', `Grader returned ${resp.status}.`);
        verdict = await resp.json();
    } catch (e) {
        if (e instanceof HttpsError) throw e;
        throw new HttpsError('unavailable', 'Grader unreachable.');
    } finally {
        clearTimeout(timer);
    }

    if (!verdict || verdict.running !== true) {
        throw new HttpsError('failed-precondition',
            `No running session to grade (${(verdict && verdict.reason) || 'unknown'}).`);
    }
    if (verdict.badgeEligible !== true) {
        // Honest partial result — the UI shows which tasks remain via /check.
        return { awarded: false, passed: verdict.passed, total: verdict.total };
    }

    const badgeId = verdict.badge && verdict.badge.id;
    if (!badgeId || !/^[a-z][a-z0-9_]{0,60}$/.test(badgeId)) {
        throw new HttpsError('internal', 'Mission has no valid badge id.');
    }

    const userRef = db.doc(`users/${uid}`);
    await userRef.set({
        achievements: FieldValue.arrayUnion(badgeId),
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    await db.doc(`users/${uid}/server_awards/${badgeId}`).set({
        badgeId,
        mission,
        name: (verdict.badge && verdict.badge.name) || badgeId,
        passed: verdict.passed,
        total: verdict.total,
        source: 'server',
        awardedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`[awardMissionBadge] ${uid} <- ${badgeId} (${mission} ${verdict.passed}/${verdict.total})`);
    return { awarded: true, badgeId, name: (verdict.badge && verdict.badge.name) || badgeId };
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

    // DISABLED: Roxy deactivated pending investigation into false positives.
    // Server-side integrity flagging paused — will log but not lock.
    if (garbageModules > 5) {
        console.warn(`[syncProgress] ${uid} has ${garbageModules} garbage modules — NOT flagging (Roxy disabled).`);
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
        const provided = String(req.headers['x-api-key'] || req.query.key || '');
        const a = Buffer.from(provided);
        const b = Buffer.from(requiredKey);
        // Length pre-check is required: timingSafeEqual throws on mismatched lengths.
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
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

        if (recentAttempts.size >= FLAG_RATE_LIMIT_PER_MIN) {
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

    // QC-57 per-question grading: instant-feedback pages call gradeQuiz once per
    // answer with { partial: true }. Partial calls must not write quiz_attempts
    // (15 misleading near-zero "failed" docs per real attempt), must not count
    // toward reviewAfterFails, and must not reveal the key beyond the submitted
    // question. EXPLICIT opt-in only — no length-based inference: a timed exam's
    // auto-submit can legitimately contain a single answer (ala-final/ala-midterm),
    // and those full submissions MUST keep normal logging + reviewAfterFails.
    const isPartial = request.data.partial === true;

    // The comparison logic lives in quiz-grading.js so the test suite can exercise the
    // REAL implementation. It used to be inline here with a hand-copied duplicate in
    // tests/gradeQuiz.test.js; the copy drifted (it never grew the `terminal` branch)
    // and went on reporting green. See that file's header.
    //
    // #295: `total` is now the SERVED question count, not answerKey.length. For a quiz
    // whose key doc declares poolSize, servedCount < bankSize and `results.length`
    // (bankSize) is therefore LARGER than `total`. They were equal for this function's
    // entire prior life — do not reintroduce that assumption. With no poolSize the two
    // are identical and the arithmetic is unchanged for all 415 server-graded quizzes.
    const graded = gradeSubmission({
        answerKey,
        types: keyData.types || [],   // optional per-question type array: 'mc','ms','order','terminal'
        answers,
        poolSize: keyData.poolSize,   // absent on every key doc today => full-bank behaviour
        isPartial
    });

    if (graded.rejected) {
        // Today only 'too-many-answers': more distinct in-range indices submitted than
        // the attempt served, i.e. a client grading itself against a denominator it
        // undercut. Impossible on a non-pooled quiz.
        throw new HttpsError('invalid-argument', graded.rejected.message);
    }

    const { score, total, percentage, results } = graded;
    const passingScore = keyData.passingScore || 70;
    const passed = percentage >= passingScore;

    // Opt-in "review after N failed attempts": exams that set keyData.reviewAfterFails
    // reveal the correct answers once a student has failed that many times (this attempt
    // included), so a struggling student can finally review what they missed. Counts the
    // user's prior failed attempts for this quiz via a single-field query (no composite
    // index required). Server-authoritative — the client cannot spoof the attempt count.
    let revealForReview = false;
    if (!isPartial && !passed && keyData.reviewAfterFails) {
        try {
            const priorSnap = await db.collection(`users/${request.auth.uid}/quiz_attempts`)
                .where('quizId', '==', quizId).get();
            let priorFailed = 0;
            priorSnap.forEach(d => { if (d.data() && d.data().passed === false) priorFailed++; });
            // +1 for the current failing attempt (logged below).
            if (priorFailed + 1 >= keyData.reviewAfterFails) revealForReview = true;
        } catch (e) {
            console.warn('reviewAfterFails count failed:', e.message);
        }
    }

    // ── Conditional correct-answer reveal ──
    // High-stakes exams reveal the key only to passers (anti-memorization: a failing
    // retaker shouldn't be handed the key). Formative module quizzes set revealToAll,
    // so EVERY student gets the correct answer + explanation post-submission — that is
    // the point of a learning-check review, and failing students need it most.
    // revealForReview adds the opt-in "after N fails" path (see above).
    if (passed || keyData.revealToAll || revealForReview) {
        // Bounded by the BANK, not by `total`. Before #295 those were the same number;
        // now a pooled quiz's drawn indices are scattered across the whole bank, so
        // looping to `total` would reveal the wrong questions and miss the asked ones.
        applyReveal({
            results,
            answerKey,
            explanations: keyData.explanations,
            answers,
            isPartial,
            pooled: graded.pooled
        });
    }

    // Log the attempt to Firestore for analytics — full submissions only.
    // Per-question partial calls would write ~15 misleading near-zero "failed"
    // records per real quiz attempt (the real final score never reaches the server).
    if (!isPartial) {
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
    }

    return { score, total, percentage, passed, results, reviewAvailable: revealForReview };
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
        // Custom mission Sets (flags, dmzNodesMapped, ...) reach the server as plain
        // arrays -- the client serializes every Set via Array.from and the sanitizer
        // only re-converts the two built-in set keys. Accept both shapes, or every
        // custom-Set check hard-rejects legitimately completed missions.
        const hasMatch = expr.match(/^(\w+)\.has\(["']([^"']+)["']\)$/);
        if (hasMatch) {
            const setName = hasMatch[1];
            const value = hasMatch[2];
            if (state[setName] && typeof state[setName].has === 'function') {
                return state[setName].has(value);
            }
            if (Array.isArray(state[setName])) {
                return state[setName].includes(value);
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
        // Arrays accepted for the same reason as in the .has handler above.
        const sizeMatch = expr.match(/^(\w+)\.size\s*(>=|<=|===|==|>|<|!==|!=)\s*(\d+)$/);
        if (sizeMatch) {
            const setObj = state[sizeMatch[1]];
            const op = sizeMatch[2];
            const num = parseInt(sizeMatch[3], 10);
            const sz = (setObj && typeof setObj.size === 'number') ? setObj.size
                : (Array.isArray(setObj) ? setObj.length : 0);
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
    // Client-supplied arrays are capped: no legitimate mission state (flags, nodes,
    // captured items) approaches this size, and an uncapped array is the one input a
    // hostile client could inflate cheaply now that the evaluator accepts arrays.
    const MAX_ARRAY_LEN = 200;

    for (const key of allowedKeys) {
        if (!(key in snapshot)) continue;
        const val = snapshot[key];

        if (setKeys.includes(key)) {
            // Convert array to Set for .has()/.size evaluation
            clean[key] = new Set(Array.isArray(val) ? val.slice(0, MAX_ARRAY_LEN) : []);
        } else if (typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string') {
            clean[key] = val;
        } else if (Array.isArray(val)) {
            clean[key] = val.slice(0, MAX_ARRAY_LEN);
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

// ─── Admin Console Cloud Functions ──────────────────────────────

/**
 * Admin guard helper — throws if caller lacks admin claim.
 */
function requireAdmin(request) {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const hasAdminClaim = request.auth.token.admin === true;
    const email = (request.auth.token.email || '').toLowerCase();
    const inAllowlist = ADMIN_EMAILS.includes(email);
    if (!hasAdminClaim && !inAllowlist) {
        throw new HttpsError('permission-denied', 'Admin privileges required.');
    }
}

/**
 * adminSearchUsers — Search users collection by email, callsign, or display name.
 * Returns top 20 matches. Exact UID match always checked first.
 */
exports.adminSearchUsers = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { query: searchQuery } = request.data || {};
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.length < 2) {
        throw new HttpsError('invalid-argument', 'Search query must be at least 2 characters.');
    }

    const q = searchQuery.trim().toLowerCase();
    const results = new Map(); // uid -> data

    // 1. Exact UID match
    try {
        const uidDoc = await db.doc(`users/${searchQuery.trim()}`).get();
        if (uidDoc.exists) {
            results.set(uidDoc.id, { uid: uidDoc.id, ...uidDoc.data() });
        }
    } catch (_) { /* ignore */ }

    // 2. Email exact match
    try {
        const emailSnap = await db.collection('users').where('email', '==', q).limit(5).get();
        emailSnap.forEach(d => results.set(d.id, { uid: d.id, ...d.data() }));
    } catch (_) { /* ignore */ }

    // 3. Callsign exact match
    try {
        const csSnap = await db.collection('users').where('callsign', '==', q).limit(5).get();
        csSnap.forEach(d => results.set(d.id, { uid: d.id, ...d.data() }));
    } catch (_) { /* ignore */ }

    // 4. Display name prefix search (Firestore range query)
    try {
        const nameSnap = await db.collection('users')
            .where('displayName', '>=', searchQuery.trim())
            .where('displayName', '<=', searchQuery.trim() + '\uf8ff')
            .limit(20)
            .get();
        nameSnap.forEach(d => results.set(d.id, { uid: d.id, ...d.data() }));
    } catch (_) { /* ignore */ }

    // 5. Email prefix search
    try {
        const emailPrefixSnap = await db.collection('users')
            .where('email', '>=', q)
            .where('email', '<=', q + '\uf8ff')
            .limit(20)
            .get();
        emailPrefixSnap.forEach(d => results.set(d.id, { uid: d.id, ...d.data() }));
    } catch (_) { /* ignore */ }

    // Convert to array and limit
    const users = Array.from(results.values()).slice(0, 20).map(u => ({
        uid: u.uid,
        email: u.email || null,
        displayName: u.displayName || u.callsign || null,
        callsign: u.callsign || null,
        photoURL: u.photoURL || null,
        house: u.house || null,
        level: u.level || null,
        xp: u.xp || null,
        accountType: u.accountType || 'operative',
        integrity: u.integrity || null,
        isActive: u.isActive !== false
    }));

    return { users };
});

/**
 * searchUsers — Public user search for messaging (any authenticated user).
 * Returns limited fields: uid, displayName, callsign, accountType.
 * No email, no sensitive data exposed.
 */
exports.searchUsers = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { query: searchQuery } = request.data || {};
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.length < 2) {
        throw new HttpsError('invalid-argument', 'Search query must be at least 2 characters.');
    }

    const q = searchQuery.trim().toLowerCase();
    const original = searchQuery.trim();
    const results = new Map();

    // Scan all users and filter in-memory (small user base, reliable)
    try {
        const allSnap = await db.collection('users').limit(200).get();
        allSnap.forEach(d => {
            const data = d.data();
            const callsign = (data.callsign || '').toLowerCase();
            const displayName = (data.displayName || '').toLowerCase();
            const email = (data.email || '').toLowerCase();
            if (callsign.includes(q) || displayName.includes(q) || email.includes(q)) {
                results.set(d.id, { uid: d.id, ...data });
            }
        });
    } catch (e) {
        console.error('[searchUsers] Query failed:', e);
    }

    // Fallback: if Firestore scan turned up nothing AND the query looks like
    // an email, try Firebase Auth's getUserByEmail. Catches Auth-only users
    // who haven't been written to users/ yet (Wendy Norfleet 2026-05-13).
    // Only triggers on empty result + email-shape query — preserves the
    // original semantics for callsign/name searches.
    if (results.size === 0 && original.includes('@')) {
        try {
            const authUser = await admin.auth().getUserByEmail(original);
            results.set(authUser.uid, {
                uid: authUser.uid,
                displayName: authUser.displayName || null,
                photoURL: authUser.photoURL || null,
                callsign: null,
                accountType: 'operative'
            });
        } catch (e) {
            // user-not-found / email-not-found are expected — silently ignore
            if (e.code && e.code !== 'auth/user-not-found' && e.code !== 'auth/email-not-found') {
                console.error('[searchUsers] Auth fallback error:', e.code, e.message);
            }
        }
    }

    // Return limited fields only — no sensitive data
    const users = Array.from(results.values()).slice(0, 15).map(u => ({
        uid: u.uid,
        displayName: u.displayName || null,
        callsign: u.callsign || null,
        photoURL: u.photoURL || null,
        accountType: u.accountType || 'operative'
    }));

    return { users };
});

/**
 * adminResetIntegrity — Clear integrity violation for a user.
 * Removes the integrity object from their Firestore profile.
 */
exports.adminResetIntegrity = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { uid } = request.data || {};
    if (!uid || typeof uid !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing uid.');
    }

    await db.doc(`users/${uid}`).update({
        integrity: FieldValue.delete(),
        integrityResetAt: FieldValue.serverTimestamp(),
        integrityResetBy: request.auth.uid
    });

    return { success: true, uid };
});

/**
 * adminSetIntegrity — Set integrity violation on a user (summons Roxy).
 */
exports.adminSetIntegrity = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { uid, data } = request.data || {};
    if (!uid || typeof uid !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing uid.');
    }

    await db.doc(`users/${uid}`).update({
        integrity: {
            status: 'violated',
            violatedAt: FieldValue.serverTimestamp(),
            source: (data && data.source) || 'admin_action',
            reason: (data && data.reason) || 'Set by admin',
            setBy: request.auth.uid
        }
    });

    return { success: true, uid };
});

/**
 * adminUpdateUser — Update arbitrary user profile fields with admin privileges.
 * Only allows a whitelist of safe fields.
 */
exports.adminUpdateUser = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { uid, fields } = request.data || {};
    if (!uid || typeof uid !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing uid.');
    }
    if (!fields || typeof fields !== 'object') {
        throw new HttpsError('invalid-argument', 'Missing fields.');
    }

    // Whitelist of updatable fields
    const ALLOWED_FIELDS = [
        'xp', 'level', 'house', 'accountType', 'isActive',
        'deactivatedAt', 'deactivatedBy', 'mergedInto',
        'displayName', 'callsign'
    ];

    const safeUpdate = { updatedAt: FieldValue.serverTimestamp() };
    for (const [key, value] of Object.entries(fields)) {
        if (ALLOWED_FIELDS.includes(key)) {
            safeUpdate[key] = value;
        }
    }

    // If accountType changed, update custom claims too
    if (safeUpdate.accountType) {
        const isHandler = safeUpdate.accountType === 'handler' || safeUpdate.accountType === 'admin';
        const isAdmin = safeUpdate.accountType === 'admin';
        await getAuth().setCustomUserClaims(uid, {
            admin: isAdmin,
            handler: isHandler
        });
    }

    await db.doc(`users/${uid}`).update(safeUpdate);

    return { success: true, uid, updatedFields: Object.keys(safeUpdate) };
});

/**
 * adminGenerateHandlerCode — Generate a new handler activation code.
 * Stores the hash in Firestore, returns the plaintext once.
 * @param {number} [request.data.expiresInHours] - Optional expiration in hours (24, 168, 720, or null for permanent)
 */
exports.adminGenerateHandlerCode = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { expiresInHours } = request.data || {};

    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
    let code = '';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
        code += chars[bytes[i] % chars.length];
    }

    // Format: XXXX-XXXX
    const formatted = code.substring(0, 4) + '-' + code.substring(4);

    // Hash for storage
    const codeHash = crypto.createHash('sha256').update(formatted).digest('hex');

    // Compute expiration timestamp if provided
    let expiresAt = null;
    if (expiresInHours && typeof expiresInHours === 'number' && expiresInHours > 0) {
        expiresAt = new Date(Date.now() + expiresInHours * 3600000);
    }

    // Store in handler_codes collection
    await db.collection('handler_codes').add({
        hash: codeHash,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
        usedBy: null,
        expired: false,
        expiresAt: expiresAt
    });

    return { code: formatted, expiresAt: expiresAt ? expiresAt.toISOString() : null };
});

/**
 * adminRevokeHandlerCode — Expire an active handler code so it can no longer be used.
 * @param {string} request.data.codeDocId - The Firestore document ID of the handler_codes entry
 */
exports.adminRevokeHandlerCode = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { codeDocId } = request.data || {};
    if (!codeDocId || typeof codeDocId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing codeDocId.');
    }

    const codeRef = db.collection('handler_codes').doc(codeDocId);
    const codeSnap = await codeRef.get();
    if (!codeSnap.exists) {
        throw new HttpsError('not-found', 'Handler code not found.');
    }

    const codeData = codeSnap.data();
    if (codeData.usedBy) {
        throw new HttpsError('failed-precondition', 'Cannot revoke a code that has already been used.');
    }
    if (codeData.expired) {
        throw new HttpsError('failed-precondition', 'Code is already expired.');
    }

    await codeRef.update({
        expired: true,
        revokedAt: FieldValue.serverTimestamp(),
        revokedBy: request.auth.uid
    });

    return { success: true, codeDocId };
});

/**
 * adminSetRole — Grant or revoke admin/handler role on a user by UID.
 * Sets Firebase Auth custom claims and updates Firestore profile.
 */
exports.adminSetRole = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { uid, role, grant } = request.data || {};
    if (!uid || typeof uid !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing uid.');
    }
    if (!['admin', 'handler'].includes(role)) {
        throw new HttpsError('invalid-argument', 'Role must be "admin" or "handler".');
    }

    // Prevent removing own admin
    if (uid === request.auth.uid && role === 'admin' && grant === false) {
        throw new HttpsError('failed-precondition', 'Cannot remove your own admin role.');
    }

    // Get current claims
    const userRecord = await getAuth().getUser(uid);
    const currentClaims = userRecord.customClaims || {};

    // Update claims
    const newClaims = { ...currentClaims, [role]: grant !== false };
    await getAuth().setCustomUserClaims(uid, newClaims);

    // Update Firestore profile
    const accountType = newClaims.admin ? 'admin' : newClaims.handler ? 'handler' : 'student';
    await db.doc(`users/${uid}`).update({
        accountType: accountType,
        roleUpdatedAt: FieldValue.serverTimestamp(),
        roleUpdatedBy: request.auth.uid
    });

    return {
        success: true,
        uid,
        role,
        granted: grant !== false,
        claims: newClaims,
        email: userRecord.email || null
    };
});

/**
 * adminListAdmins — List all users with admin custom claims.
 */
exports.adminListAdmins = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    // Query Firestore for admin/handler accounts
    const adminsSnap = await db.collection('users')
        .where('accountType', 'in', ['admin', 'handler'])
        .get();

    const admins = [];
    adminsSnap.forEach(doc => {
        const data = doc.data();
        admins.push({
            uid: doc.id,
            email: data.email || '',
            displayName: data.displayName || data.callsign || '',
            accountType: data.accountType || 'unknown',
            roleUpdatedAt: data.roleUpdatedAt || null
        });
    });

    // Also check the hardcoded ADMIN_EMAILS list
    return { admins, hardcodedEmails: ADMIN_EMAILS };
});

/**
 * userOnboardingState — Admin diagnostic. Returns the full provisioning
 * state of a user across Firebase Auth, users/, enrollments/, all class
 * progress docs, and tenant adminUids. Used to diagnose "I see them in
 * the roster but searchUsers can't find them" cases — exactly the Wendy
 * Norfleet 2026-05-13 pattern (Auth + class-progress present, users/{uid}
 * missing because enrollInClass doesn't upsert the global profile).
 *
 * Input:  { email?: string, uid?: string }  — at least one required
 * Returns: {
 *   query: { email, uid },
 *   resolvedUid,
 *   auth:        { exists, uid, email, displayName, emailVerified, providers, createdAt, lastSignIn } | null,
 *   usersDoc:    { exists, hasEmail, hasDisplayName, hasCallsign, fieldCount, data } | null,
 *   enrollments: [{ tenantSlug, classId, courseId }],
 *   progressDocs:[{ path, tenantSlug, classId, displayName, email, lastActive, isGuest }],
 *   tenantAdminships: [{ tenantId, tenantName }],
 *   gaps:        ['not_in_firebase_auth' | 'users_doc_missing' | 'users_doc_no_email' |
 *                 'users_doc_no_displayName' | 'enrolled_without_users_doc' |
 *                 'progress_without_users_doc' | 'progress_query_failed:<code>']
 * }
 *
 * Cost: 1 Auth lookup + 1 users get + 1 enrollments get + 1 collectionGroup
 * query on `progress` (email-indexed) + 1 tenants scan. ~5 Firestore ops.
 *
 * v1: platform-operator-only via requireAdmin().
 * v2 (future): tenant-scoped — allow tenant admins to diagnose users
 * within their own tenant. Requires tenant-membership check.
 */
exports.userOnboardingState = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { email: queryEmail, uid: queryUid } = request.data || {};
    if (!queryEmail && !queryUid) {
        throw new HttpsError('invalid-argument', 'Provide email or uid.');
    }

    let resolvedUid = queryUid || null;
    let authRecord = null;
    const gaps = [];

    // 1. Firebase Auth lookup — exact email or uid
    try {
        if (queryUid) {
            authRecord = await admin.auth().getUser(queryUid);
        } else {
            authRecord = await admin.auth().getUserByEmail(queryEmail);
        }
        resolvedUid = authRecord.uid;
    } catch (e) {
        if (e.code === 'auth/user-not-found' || e.code === 'auth/email-not-found') {
            gaps.push('not_in_firebase_auth');
        } else {
            console.error('[userOnboardingState] Auth lookup failed:', e);
            gaps.push('auth_lookup_error:' + e.code);
        }
    }

    const auth = authRecord ? {
        exists: true,
        uid: authRecord.uid,
        email: authRecord.email || null,
        displayName: authRecord.displayName || null,
        emailVerified: authRecord.emailVerified,
        providers: authRecord.providerData.map(p => p.providerId),
        createdAt: authRecord.metadata.creationTime,
        lastSignIn: authRecord.metadata.lastSignInTime
    } : null;

    // 2. users/{uid} profile doc
    let usersDoc = null;
    if (resolvedUid) {
        const snap = await db.doc('users/' + resolvedUid).get();
        if (snap.exists) {
            const d = snap.data();
            usersDoc = {
                exists: true,
                hasEmail: !!d.email,
                hasDisplayName: !!d.displayName,
                hasCallsign: !!d.callsign,
                fieldCount: Object.keys(d).length,
                data: {
                    email: d.email || null,
                    displayName: d.displayName || null,
                    callsign: d.callsign || null,
                    accountType: d.accountType || null,
                    tier: d.tier || null
                }
            };
            if (!d.email) gaps.push('users_doc_no_email');
            if (!d.displayName) gaps.push('users_doc_no_displayName');
        } else {
            usersDoc = { exists: false };
            if (auth) gaps.push('users_doc_missing');
        }
    }

    // 3. enrollments/{uid}
    const enrollments = [];
    if (resolvedUid) {
        const enrollSnap = await db.doc('enrollments/' + resolvedUid).get();
        if (enrollSnap.exists) {
            const data = enrollSnap.data();
            if (Array.isArray(data.enrollments)) {
                enrollments.push(...data.enrollments);
            } else if (data.tenantSlug) {
                // Legacy single-enrollment format
                enrollments.push({
                    tenantSlug: data.tenantSlug,
                    classId: data.classId,
                    courseId: data.courseId || ''
                });
            }
        }
        if (enrollments.length > 0 && usersDoc && !usersDoc.exists) {
            gaps.push('enrolled_without_users_doc');
        }
    }

    // 4. progress docs — iterate enrollments and read each known path.
    // (Avoids needing a collectionGroup index on `progress`. Orphan-progress
    // detection — docs that exist with no matching enrollment — is out of
    // scope for v1; if needed later, add a collectionGroup('progress')
    // index on `email` or `__name__` and run a one-time scan.)
    const progressDocs = [];
    if (resolvedUid) {
        for (const e of enrollments) {
            const path = `tenants/${e.tenantSlug}/classes/${e.classId}/progress/${resolvedUid}`;
            const pgSnap = await db.doc(path).get();
            if (pgSnap.exists) {
                const d = pgSnap.data();
                progressDocs.push({
                    path,
                    tenantSlug: e.tenantSlug,
                    classId: e.classId,
                    displayName: d.displayName || null,
                    email: d.email || null,
                    lastActive: d.lastActive || null,
                    isGuest: !!d.isGuest
                });
            }
        }
        if (progressDocs.length > 0 && usersDoc && !usersDoc.exists) {
            gaps.push('progress_without_users_doc');
        }
    }

    // 5. Tenant adminships — full tenants scan. Small today (~12 tenants).
    // If tenant count grows >100 we should switch to a reverse-index
    // (e.g. collectionGroup('adminUids') or a tenants_by_admin/{uid} doc).
    const tenantAdminships = [];
    if (resolvedUid) {
        const tenSnap = await db.collection('tenants').get();
        tenSnap.forEach(t => {
            const adminUids = t.data().adminUids || [];
            if (adminUids.includes(resolvedUid)) {
                tenantAdminships.push({
                    tenantId: t.id,
                    tenantName: t.data().name || t.id
                });
            }
        });
    }

    return {
        query: { email: queryEmail || null, uid: queryUid || null },
        resolvedUid,
        auth,
        usersDoc,
        enrollments,
        progressDocs,
        tenantAdminships,
        gaps
    };
});

/**
 * adminGetStats — Aggregate platform statistics for the admin dashboard.
 */
exports.adminGetStats = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    // Run queries in parallel
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        allUsersSnap,
        handlersSnap,
        adminsSnap,
        lockoutsSnap,
        classesSnap
    ] = await Promise.all([
        db.collection('users').count().get(),
        db.collection('users').where('accountType', '==', 'handler').count().get(),
        db.collection('users').where('accountType', '==', 'admin').count().get(),
        db.collection('users').where('integrity.status', '==', 'violated').count().get(),
        db.collection('classes').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
    ]);

    // Active today and event counts (best effort)
    let activeToday = 0;
    let tripwireToday = 0;
    let flagAttemptsToday = 0;

    try {
        const activeSnap = await db.collection('users')
            .where('updatedAt', '>=', today)
            .count().get();
        activeToday = activeSnap.data().count || 0;
    } catch (_) { /* index may not exist */ }

    return {
        totalUsers: allUsersSnap.data().count || 0,
        handlers: handlersSnap.data().count || 0,
        admins: adminsSnap.data().count || 0,
        activeLockouts: lockoutsSnap.data().count || 0,
        totalClasses: classesSnap.data().count || 0,
        activeToday,
        tripwireToday,
        flagAttemptsToday
    };
});

// ─── F-23: Messaging System ─────────────────────────────────────

const MESSAGING_RATE_LIMIT = 10; // max messages per minute
const MESSAGING_RATE_WINDOW = 60 * 1000; // 60 seconds in ms
const MAX_MESSAGE_LENGTH = 500;
const MESSAGE_RETENTION_DAYS = 90;

/**
 * sendMessage — Callable: send a message to another user.
 * Validates sender/recipient are in the same class, enforces rate limit,
 * creates message doc and updates conversation doc.
 */
exports.sendMessage = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { toUid, text, classId } = request.data || {};
    const fromUid = request.auth.uid;

    // ── Input validation ──
    if (!toUid || typeof toUid !== 'string') {
        throw new HttpsError('invalid-argument', 'Invalid recipient.');
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new HttpsError('invalid-argument', 'Message cannot be empty.');
    }
    if (text.length > MAX_MESSAGE_LENGTH) {
        throw new HttpsError('invalid-argument', `Message exceeds ${MAX_MESSAGE_LENGTH} character limit.`);
    }
    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Class context required.');
    }
    if (fromUid === toUid) {
        throw new HttpsError('invalid-argument', 'Cannot message yourself.');
    }

    // ── Check sender is not blocked ──
    const blockSnap = await db.collection('messaging_blocks')
        .where('blockedUid', '==', fromUid)
        .where('classId', '==', classId)
        .limit(1)
        .get();
    if (!blockSnap.empty) {
        throw new HttpsError('permission-denied', 'You are blocked from messaging in this context.');
    }

    // ── Verify class/DM context ──
    if (classId !== 'dm') {
        const classDoc = await db.doc(`classes/${classId}`).get();
        if (!classDoc.exists) {
            throw new HttpsError('not-found', 'Class not found.');
        }

        const classData = classDoc.data();
        const handlerId = classData.handlerUid;

        // Check membership: both users must be members OR the handler
        const [fromMember, toMember] = await Promise.all([
            fromUid === handlerId ? Promise.resolve({ exists: true }) :
                db.doc(`classes/${classId}/members/${fromUid}`).get(),
            toUid === handlerId ? Promise.resolve({ exists: true }) :
                db.doc(`classes/${classId}/members/${toUid}`).get()
        ]);

        if (!fromMember.exists) {
            throw new HttpsError('permission-denied', 'You are not a member of this class.');
        }
        if (!toMember.exists) {
            throw new HttpsError('permission-denied', 'Recipient is not in this class.');
        }
    } else {
        // DM: just verify the recipient exists
        const recipientDoc = await db.doc(`users/${toUid}`).get();
        if (!recipientDoc.exists) {
            throw new HttpsError('not-found', 'Recipient not found.');
        }
    }

    // ── Rate limiting: 10 messages per minute ──
    const oneMinuteAgo = new Date(Date.now() - MESSAGING_RATE_WINDOW);
    const recentMessages = await db.collection('messages')
        .where('from', '==', fromUid)
        .where('timestamp', '>=', oneMinuteAgo)
        .count()
        .get();

    if (recentMessages.data().count >= MESSAGING_RATE_LIMIT) {
        throw new HttpsError('resource-exhausted', 'Rate limit exceeded. Max 10 messages per minute.');
    }

    // ── Build conversation ID (deterministic) ──
    const sortedUids = [fromUid, toUid].sort();
    const conversationId = `${sortedUids[0]}_${sortedUids[1]}_${classId}`;
    const trimmedText = text.trim();

    // ── Create message document ──
    const messageRef = await db.collection('messages').add({
        from: fromUid,
        to: toUid,
        text: trimmedText,
        timestamp: FieldValue.serverTimestamp(),
        read: false,
        classId: classId,
        deleted: false,
        reportedBy: [],
        conversationId: conversationId
    });

    // ── Update or create conversation document ──
    // Clear hiddenBy so the conversation reappears for both users when a new message arrives
    const preview = trimmedText.length > 80 ? trimmedText.substring(0, 80) + '...' : trimmedText;
    await db.doc(`conversations/${conversationId}`).set({
        participants: sortedUids,
        lastMessage: preview,
        lastTimestamp: FieldValue.serverTimestamp(),
        classId: classId,
        hiddenBy: []
    }, { merge: true });

    return { success: true, messageId: messageRef.id, conversationId };
});

/**
 * reportMessage — Callable: report a message.
 * Adds reporter UID to reportedBy array. Flags if 3+ reports.
 */
exports.reportMessage = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { messageId } = request.data || {};
    const reporterUid = request.auth.uid;

    if (!messageId || typeof messageId !== 'string') {
        throw new HttpsError('invalid-argument', 'Invalid message ID.');
    }

    const messageRef = db.doc(`messages/${messageId}`);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
        throw new HttpsError('not-found', 'Message not found.');
    }

    const messageData = messageDoc.data();

    // Only participants can report
    if (messageData.from !== reporterUid && messageData.to !== reporterUid) {
        throw new HttpsError('permission-denied', 'You can only report messages in your conversations.');
    }

    // Cannot report own messages
    if (messageData.from === reporterUid) {
        throw new HttpsError('invalid-argument', 'Cannot report your own message.');
    }

    // Check if already reported by this user
    if (messageData.reportedBy && messageData.reportedBy.includes(reporterUid)) {
        return { success: true, alreadyReported: true };
    }

    // Add reporter to array
    await messageRef.update({
        reportedBy: FieldValue.arrayUnion(reporterUid)
    });

    // Check if threshold reached (3+ reports = flagged)
    const reportCount = (messageData.reportedBy ? messageData.reportedBy.length : 0) + 1;
    const flagged = reportCount >= 3;

    return { success: true, reportCount, flagged };
});

/**
 * purgeOldMessages — Scheduled: runs daily at 02:00 UTC.
 * Deletes messages older than 90 days and soft-deleted messages.
 * Cleans up empty conversations.
 */
const { onSchedule } = require('firebase-functions/v2/scheduler');

exports.purgeOldMessages = onSchedule({
    schedule: 'every day 02:00',
    timeZone: 'UTC',
    region: 'us-central1'
}, async (event) => {
    const cutoffDate = new Date(Date.now() - (MESSAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000));
    const batch = db.batch();
    let deleteCount = 0;
    const affectedConversations = new Set();

    // Delete messages older than retention period
    const oldMessages = await db.collection('messages')
        .where('timestamp', '<', cutoffDate)
        .limit(500)
        .get();

    oldMessages.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
        if (doc.data().conversationId) {
            affectedConversations.add(doc.data().conversationId);
        }
    });

    // Delete soft-deleted messages immediately
    const deletedMessages = await db.collection('messages')
        .where('deleted', '==', true)
        .limit(500)
        .get();

    deletedMessages.forEach((doc) => {
        batch.delete(doc.ref);
        deleteCount++;
        if (doc.data().conversationId) {
            affectedConversations.add(doc.data().conversationId);
        }
    });

    if (deleteCount > 0) {
        await batch.commit();
    }

    // Clean up conversations that have no remaining messages
    for (const convId of affectedConversations) {
        const remaining = await db.collection('messages')
            .where('conversationId', '==', convId)
            .limit(1)
            .get();

        if (remaining.empty) {
            await db.doc(`conversations/${convId}`).delete();
        }
    }

    console.log(`[purgeOldMessages] Deleted ${deleteCount} messages, checked ${affectedConversations.size} conversations`);
});

// ─── Self-Healing Pipeline: Dead-claim reaper ─────────────────────────
// Slice 3a of the bidirectional control plane. See:
//   _docs/features/SELF_HEALING_PIPELINE.md
//
// Every 5 minutes, scans _triage_queue and _auto_fix_queue for items
// where status is claimed/in-progress but the claim has gone stale.
// Stale = no heartbeat update for 10+ minutes.
//
// HEARTBEAT EXPECTATION (post-Nancy review 2026-04-29):
//   - Humans (Pulse mutations) never heartbeat. claimedAt is the only
//     staleness signal for human claims — a human who claims and then
//     walks away gets their item released after 10min.
//   - Agents (Slice 3+) MUST heartbeat every 2min during long work, or
//     the reaper releases their item and a second agent can re-claim
//     and double-execute. The agent harness must enforce this — the
//     reaper does not distinguish humans from agents.
//   - 'in-progress' status is treated identically to 'claimed' here.
//     Long legitimate work without heartbeat WILL be interrupted.
//
// TIMESTAMP NOTE:
//   history[] entries use new Date().toISOString() because Firestore
//   serverTimestamp() cannot be embedded inside array elements. The
//   doc-level updatedAt uses serverTimestamp() for authoritative
//   ordering; history ts is advisory and matches TriageQueueClient.
//
// MALFORMED heartbeatAt:
//   If heartbeatAt is anything other than a Firestore Timestamp (e.g.
//   an ISO string from a buggy writer), heartbeatMs is null and the
//   item gets released. Deliberate safe-fallback: a malformed heartbeat
//   means the claim is effectively untracked.
//
// Uses transactions to avoid race with a fresh heartbeat or claim
// that may land between the query and the write.

const DEAD_CLAIM_STALE_MS = 10 * 60 * 1000;  // 10 minutes
const REAPER_ACTOR = 'agent:dead-claim-reaper';

async function reapStaleClaims(collectionName) {
    const cutoffMs = Date.now() - DEAD_CLAIM_STALE_MS;
    const cutoff = new Date(cutoffMs);

    const snap = await db.collection(collectionName)
        .where('status', 'in', ['claimed', 'in-progress'])
        .where('claimedAt', '<', cutoff)
        .limit(100)
        .get();

    let released = 0;
    let skippedFreshHeartbeat = 0;

    for (const doc of snap.docs) {
        const data = doc.data();
        // Skip if heartbeat is fresher than claimedAt and within window —
        // an agent is still actively working
        const heartbeatMs = data.heartbeatAt && data.heartbeatAt.toMillis
            ? data.heartbeatAt.toMillis()
            : null;
        if (heartbeatMs && heartbeatMs > cutoffMs) {
            skippedFreshHeartbeat++;
            continue;
        }

        try {
            await db.runTransaction(async (txn) => {
                const fresh = await txn.get(doc.ref);
                if (!fresh.exists) return;
                const f = fresh.data();
                // Re-check inside transaction — may have updated since query
                if (!['claimed', 'in-progress'].includes(f.status)) return;
                const freshHeartbeatMs = f.heartbeatAt && f.heartbeatAt.toMillis
                    ? f.heartbeatAt.toMillis()
                    : null;
                if (freshHeartbeatMs && freshHeartbeatMs > cutoffMs) return;

                const historyEntry = {
                    ts: new Date().toISOString(),
                    actor: REAPER_ACTOR,
                    action: 'release-stale',
                    note: `claimedAt=${f.claimedAt && f.claimedAt.toDate ? f.claimedAt.toDate().toISOString() : 'unknown'} owner=${f.owner || 'null'}`,
                };
                const newHistory = (Array.isArray(f.history) ? f.history : [])
                    .concat([historyEntry])
                    .slice(-20);

                txn.update(doc.ref, {
                    status: 'open',
                    owner: null,
                    heartbeatAt: null,
                    updatedAt: FieldValue.serverTimestamp(),
                    history: newHistory,
                });
            });
            released++;
        } catch (err) {
            console.error(`[releaseDeadClaims] Failed to release ${collectionName}/${doc.id}:`, err.message);
        }
    }

    return { released, skippedFreshHeartbeat, scanned: snap.size };
}

exports.releaseDeadClaims = onSchedule({
    schedule: 'every 5 minutes',
    timeZone: 'UTC',
    region: 'us-central1',
}, async (event) => {
    const start = Date.now();
    const triageResult = await reapStaleClaims('_triage_queue');
    const autoFixResult = await reapStaleClaims('_auto_fix_queue');
    const elapsed = Date.now() - start;

    if (triageResult.released > 0 || autoFixResult.released > 0) {
        console.log(`[releaseDeadClaims] Released ${triageResult.released} from _triage_queue, ${autoFixResult.released} from _auto_fix_queue (skipped fresh: ${triageResult.skippedFreshHeartbeat + autoFixResult.skippedFreshHeartbeat}, scanned: ${triageResult.scanned + autoFixResult.scanned}, elapsed: ${elapsed}ms)`);
    }
});

// ─── Self-Healing Pipeline: PULSE-2 De-Promotion Detector ─────────────
// Spec: _docs/features/PULSE_2_DEPROMOTION_DETECTOR.md (Nancy-approved 2026-05-08).
// Detects a promoted auto-fix rule going bad: ≥3 distinct items with
// `apply-validate-failed` history entries from agent actors in the last 30 min.
// On detection: flips per-template flag OFF in _system_config/self_healing,
// writes a CRITICAL triage item, surfaces to operator via Pulse banner.

const PULSE2_WINDOW_MS = 30 * 60 * 1000;     // 30-minute failure window
const PULSE2_DISTINCT_THRESHOLD = 3;          // ≥3 distinct failed items

async function disableTemplateAndAlert(rule, itemIds) {
    // Idempotent: re-read enabledTemplates and only flip if still on.
    await db.runTransaction(async txn => {
        const ref = db.doc('_system_config/self_healing');
        const snap = await txn.get(ref);
        const cur = (snap.data() || {}).enabledTemplates || [];
        if (!cur.includes(rule)) return; // already disabled
        const next = cur.filter(r => r !== rule);
        txn.set(ref, {
            enabledTemplates: next,
            lastAutoDisable: { rule, at: FieldValue.serverTimestamp(), itemIds },
        }, { merge: true });
    });

    // Triage item — fingerprint-keyed for dedup, transactional history-append.
    // Per Nancy review #1: silent un-dismiss is a regression; tag re-open events.
    const fingerprint = crypto.createHash('sha256').update('AUTO-DEPROMOTE:' + rule).digest('hex').slice(0, 16);
    const triageRef = db.doc(`_triage_queue/auto-depromote-${fingerprint}`);

    await db.runTransaction(async txn => {
        const snap = await txn.get(triageRef);
        const cur = snap.exists ? (snap.data() || {}) : null;
        const wasDismissed = cur && cur.status === 'dismissed';
        const hist = (cur && Array.isArray(cur.history)) ? cur.history : [];
        const newHistEntry = {
            ts: new Date().toISOString(),
            actor: 'cf:detectAutoHealingFailureSpike',
            action: wasDismissed ? 'auto-depromote-reopen' : 'auto-depromote',
            note: `${itemIds.length} items: ${itemIds.slice(0, 3).join(', ')}${itemIds.length > 3 ? '...' : ''}`,
        };
        const update = {
            title: `Auto-healing rule ${rule} disabled — apply-validate-failed spike`,
            severity: 'critical',
            priority: 100,
            category: 'self-healing',
            source: 'auto-depromote',
            rule,
            message: `Rule ${rule} had ≥${PULSE2_DISTINCT_THRESHOLD} distinct items fail validate() in the last 30 min. Per-template flag automatically flipped OFF. Operator action: investigate template + validator, re-run autofix-dryrun, re-enable in Pulse if fixed. NOTE: re-enabling within 30 min of the spike will trigger immediate re-disable until the failure window ages out.`,
            recentItems: itemIds,
            status: 'open',
            history: hist.concat([newHistEntry]).slice(-20),
        };
        if (!cur) {
            update.createdAt = FieldValue.serverTimestamp();
        } else if (wasDismissed) {
            update.reopenedAt = FieldValue.serverTimestamp();
            update.previousResolution = cur.status;
        }
        txn.set(triageRef, update, { merge: true });
    });

    console.log(`[detectAutoHealingFailureSpike] AUTO-DISABLED rule=${rule} itemIds=${itemIds.length}`);
}

exports.detectAutoHealingFailureSpike = onSchedule({
    schedule: 'every 5 minutes',
    timeZone: 'UTC',
    region: 'us-central1',
}, async () => {
    const cfgSnap = await db.doc('_system_config/self_healing').get();
    const enabledTemplates = (cfgSnap.data() || {}).enabledTemplates || [];
    if (enabledTemplates.length === 0) return;

    const cutoff = Date.now() - PULSE2_WINDOW_MS;
    const queueSnap = await db.collection('_auto_fix_queue').get();

    // Group recent failures by rule, tracking distinct itemIds per rule.
    const failuresByRule = new Map();
    queueSnap.forEach(doc => {
        const d = doc.data() || {};
        const rule = d.rule;
        if (!rule || !enabledTemplates.includes(rule)) return;
        const hist = Array.isArray(d.history) ? d.history : [];
        for (const h of hist) {
            if (!String(h.actor || '').startsWith('agent:')) continue;
            if (h.action !== 'apply-validate-failed') continue;
            const ts = Date.parse(h.ts || '');
            if (!ts || ts < cutoff) continue;
            if (!failuresByRule.has(rule)) failuresByRule.set(rule, new Set());
            failuresByRule.get(rule).add(doc.id);
            break; // one match per item is enough
        }
    });

    // Auto-disable any rule with ≥3 distinct failed items.
    for (const [rule, items] of failuresByRule) {
        if (items.size < PULSE2_DISTINCT_THRESHOLD) continue;
        await disableTemplateAndAlert(rule, [...items]);
    }
});

// ─── Self-Healing Pipeline: Saturation alarm ──────────────────────────
// Slice 3d. Fires when the triage queue grows faster than humans+agents
// can drain. Per Nancy round 2: floor (50 items) + percentage (20%/24h)
// + out-of-band channel (Discord webhook reuses existing infra).
//
// Why not a Pulse banner: if the operator is in Pulse, they already see
// the queue. The alarm needs to reach them when they're NOT in Pulse.
//
// Storage: _saturation_history/latest holds rolling 7-day snapshot array.
// Each hourly run appends {ts, openCount} and trims older entries.
//
// Cooldown: hardcoded 6 hours between webhook posts to prevent spam.
// Stored as lastAlarmAt on the same doc.

const SATURATION_FLOOR = 50;             // items
const SATURATION_GROWTH_PCT = 20;        // %
const SATURATION_LOOKBACK_MS = 24 * 60 * 60 * 1000;  // 24h
const SATURATION_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;  // 7d
const SATURATION_COOLDOWN_MS = 6 * 60 * 60 * 1000;   // 6h between alarms

async function countOpen(collectionName) {
    const snap = await db.collection(collectionName)
        .where('status', '==', 'open')
        .count()
        .get();
    return snap.data().count || 0;
}

async function postSaturationAlarm(totalOpen, priorCount, growthPct) {
    const url = process.env.SATURATION_WEBHOOK_URL || DISCORD_WEBHOOK_URL;
    if (!url) {
        console.warn('[saturationAlarm] No webhook URL configured (SATURATION_WEBHOOK_URL or DISCORD_WEBHOOK_URL)');
        return false;
    }
    const message = '[ALARM] **Hexworth triage queue saturation**\n'
        + `Open items: ${totalOpen} (was ${priorCount} 24h ago, +${growthPct.toFixed(1)}%)\n`
        + `Threshold: > ${SATURATION_FLOOR} items AND > ${SATURATION_GROWTH_PCT}% 24h growth\n`
        + 'Review at https://hexworth.com/pulse.html';
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message }),
        });
        if (!res.ok) {
            console.error(`[saturationAlarm] Webhook returned ${res.status}: ${await res.text()}`);
            return false;
        }
        return true;
    } catch (err) {
        console.error(`[saturationAlarm] Webhook fetch failed: ${err.message}`);
        return false;
    }
}

exports.checkSaturationAlarm = onSchedule({
    schedule: 'every 60 minutes',
    timeZone: 'UTC',
    region: 'us-central1',
}, async (event) => {
    const triageOpen = await countOpen('_triage_queue');
    const autoFixOpen = await countOpen('_auto_fix_queue');
    const totalOpen = triageOpen + autoFixOpen;
    const now = Date.now();

    const histRef = db.doc('_saturation_history/latest');
    const histSnap = await histRef.get();
    const histData = histSnap.exists ? histSnap.data() : {};
    const existingSnapshots = Array.isArray(histData.snapshots) ? histData.snapshots : [];
    const lastAlarmAt = histData.lastAlarmAt || 0;

    // Find the snapshot closest to the lookback window — search BEFORE
    // appending the current snapshot, otherwise the current run becomes its
    // own prior in sparse-history conditions (first ~23h after deploy or
    // after any outage gap), structurally suppressing alarms during the
    // exact window the operator most needs them. (Nancy round 5 fix.)
    const target = now - SATURATION_LOOKBACK_MS;
    let prior = null;
    let bestDelta = Infinity;
    for (const s of existingSnapshots) {
        const d = Math.abs(s.ts - target);
        if (d < bestDelta) { bestDelta = d; prior = s; }
    }

    let alarmFired = false;
    let alarmBlocked = false;
    let alarmBlockedReason = null;
    let growthPct = 0;
    if (prior && totalOpen > SATURATION_FLOOR) {
        // Cap growth at +1000% if prior was 0 (avoid Infinity)
        growthPct = prior.openCount > 0
            ? ((totalOpen - prior.openCount) / prior.openCount) * 100
            : (totalOpen > 0 ? 1000 : 0);
        if (growthPct > SATURATION_GROWTH_PCT) {
            // Cooldown check: don't spam
            if (now - lastAlarmAt < SATURATION_COOLDOWN_MS) {
                console.log(`[saturationAlarm] Conditions met but cooldown active (last alarm ${Math.round((now - lastAlarmAt) / 60000)}min ago)`);
                alarmBlocked = true;
                alarmBlockedReason = 'cooldown';
            } else {
                const sent = await postSaturationAlarm(totalOpen, prior.openCount, growthPct);
                if (sent) {
                    alarmFired = true;
                } else {
                    // Webhook misconfigured or returned error. Surface to
                    // operator via the saturation history doc so Pulse can
                    // render a banner — silent Cloud Logging warnings are
                    // not enough. (Nancy round 5 fix.)
                    alarmBlocked = true;
                    alarmBlockedReason = 'webhook-failed-or-unset';
                }
            }
        }
    }

    // Append snapshot AFTER the search; trim retention.
    const newSnapshots = existingSnapshots.concat([{ ts: now, openCount: totalOpen }]);
    const cutoff = now - SATURATION_RETENTION_MS;
    const trimmed = newSnapshots.filter(s => s.ts > cutoff);

    const update = {
        snapshots: trimmed,
        updatedAt: FieldValue.serverTimestamp(),
        lastSnapshot: { ts: now, openCount: totalOpen },
        // Sentinel for Pulse to render a banner when the alarm fires or is
        // blocked. Pulse reads this to know "saturation conditions exist
        // RIGHT NOW" even if the webhook channel is broken.
        currentlySaturated: alarmFired || alarmBlocked,
        saturationBlockedReason: alarmBlocked ? alarmBlockedReason : null,
        lastSaturationCheckAt: FieldValue.serverTimestamp(),
    };
    if (alarmFired) update.lastAlarmAt = now;
    await histRef.set(update, { merge: true });

    if (alarmFired) {
        console.warn(`[saturationAlarm] FIRED: ${totalOpen} open items, +${growthPct.toFixed(1)}% in 24h (prior=${prior.openCount})`);
    } else if (alarmBlocked) {
        console.warn(`[saturationAlarm] CONDITIONS MET but alarm blocked: ${alarmBlockedReason}`);
    }
});

/**
 * hideConversation — Callable: hide a conversation from a user's inbox.
 * Adds the user's UID to the conversation's hiddenBy array.
 * The conversation reappears if a new message is sent (sendMessage removes from hiddenBy).
 */
exports.hideConversation = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { conversationId } = request.data || {};
    const uid = request.auth.uid;

    if (!conversationId || typeof conversationId !== 'string') {
        throw new HttpsError('invalid-argument', 'Invalid conversation ID.');
    }

    const convRef = db.doc(`conversations/${conversationId}`);
    const convDoc = await convRef.get();

    if (!convDoc.exists) {
        throw new HttpsError('not-found', 'Conversation not found.');
    }

    const convData = convDoc.data();

    // Only participants can hide their own conversations
    if (!convData.participants || !convData.participants.includes(uid)) {
        throw new HttpsError('permission-denied', 'You are not a participant in this conversation.');
    }

    // Add to hiddenBy array
    await convRef.update({
        hiddenBy: FieldValue.arrayUnion(uid)
    });

    return { success: true };
});

/**
 * blockStudent — Callable: handler blocks a student from messaging in a class.
 * Creates a document in messaging_blocks collection.
 * Only the class handler can block students in their class.
 */
exports.blockStudent = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { studentUid, classId } = request.data || {};
    const uid = request.auth.uid;

    if (!studentUid || typeof studentUid !== 'string') {
        throw new HttpsError('invalid-argument', 'Invalid student UID.');
    }
    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Invalid class ID.');
    }

    // Verify caller is the handler for this class
    const classDoc = await db.doc(`classes/${classId}`).get();
    if (!classDoc.exists) {
        throw new HttpsError('not-found', 'Class not found.');
    }
    if (classDoc.data().handlerUid !== uid) {
        throw new HttpsError('permission-denied', 'Only the class handler can block students.');
    }

    // Check if already blocked
    const existingSnap = await db.collection('messaging_blocks')
        .where('blockedUid', '==', studentUid)
        .where('blockedBy', '==', uid)
        .where('classId', '==', classId)
        .limit(1)
        .get();

    if (!existingSnap.empty) {
        return { success: true, alreadyBlocked: true };
    }

    await db.collection('messaging_blocks').add({
        blockedUid: studentUid,
        blockedBy: uid,
        classId: classId,
        timestamp: FieldValue.serverTimestamp()
    });

    return { success: true };
});

/**
 * unblockStudent — Callable: handler unblocks a student from messaging.
 * Deletes the messaging_blocks document.
 * Only the original blocker (handler) can unblock.
 */
exports.unblockStudent = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { blockId } = request.data || {};
    const uid = request.auth.uid;

    if (!blockId || typeof blockId !== 'string') {
        throw new HttpsError('invalid-argument', 'Invalid block ID.');
    }

    const blockRef = db.doc(`messaging_blocks/${blockId}`);
    const blockDoc = await blockRef.get();

    if (!blockDoc.exists) {
        throw new HttpsError('not-found', 'Block record not found.');
    }

    if (blockDoc.data().blockedBy !== uid) {
        throw new HttpsError('permission-denied', 'Only the handler who created the block can remove it.');
    }

    await blockRef.delete();
    return { success: true };
});

// ─── Spectator: LiveKit Token Generation ────────────────────────

/**
 * getLiveKitToken — Callable: generates a LiveKit access token.
 * Broadcasters get publish+subscribe permissions.
 * Spectators get subscribe-only permissions.
 */
exports.getLiveKitToken = onCall({
    region: 'us-central1',
    enforceAppCheck: ENFORCE_APP_CHECK,
    secrets: [livekitApiKey, livekitApiSecret]
}, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { roomName, role } = request.data || {};
    const uid = request.auth.uid;

    if (!roomName || typeof roomName !== 'string') {
        throw new HttpsError('invalid-argument', 'Room name required.');
    }
    if (!role || (role !== 'broadcaster' && role !== 'spectator')) {
        throw new HttpsError('invalid-argument', 'Role must be "broadcaster" or "spectator".');
    }

    // Get user display name
    const userDoc = await db.doc(`users/${uid}`).get();
    const displayName = userDoc.exists
        ? (userDoc.data().callsign || userDoc.data().displayName || uid.substring(0, 8))
        : uid.substring(0, 8);

    const { AccessToken } = require('livekit-server-sdk');

    const identity = role === 'spectator' ? `${uid}_spec_${Date.now()}` : uid;

    const token = new AccessToken(livekitApiKey.value(), livekitApiSecret.value(), {
        identity: identity,
        name: displayName,
        ttl: '4h'
    });

    token.addGrant({
        room: roomName,
        roomJoin: true,
        canPublish: role === 'broadcaster',
        canSubscribe: true,
        canPublishData: role === 'broadcaster'
    });

    const jwt = await token.toJwt();

    // Track active stream in Firestore if broadcaster
    if (role === 'broadcaster') {
        await db.doc(`spectator_streams/${uid}`).set({
            uid,
            displayName,
            roomName,
            startedAt: FieldValue.serverTimestamp(),
            active: true
        }, { merge: true });
    }

    return { token: jwt, wsUrl: LIVEKIT_WS_URL };
});

/**
 * endLiveStream — Callable: marks a broadcaster's stream as inactive.
 */
exports.endLiveStream = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    await db.doc(`spectator_streams/${request.auth.uid}`).update({
        active: false,
        endedAt: FieldValue.serverTimestamp()
    });
    return { success: true };
});

/**
 * validateAction — Callable: server-side action flag validation for labs.
 *
 * Unlike validateFlag (text-based: student finds FLAG{text}, submits it, server checks hash),
 * validateAction is action-based: student performs work, client sends state proof,
 * server validates the state against conditions stored in flag_registry.
 *
 * The conditions are ONLY on the server. The client config knows "call awardFlag when
 * services are restored" but the server decides if the state actually proves it.
 *
 * flag_registry/{boxId} schema for action flags:
 * {
 *   flags: {
 *     flag1: 'FLAG{...}',          // text flags (traditional)
 *     flag2: 'FLAG{...}'
 *   },
 *   actionConditions: {            // action flag conditions (new)
 *     flag1: {
 *       required: { servicesUp: ['networking','sshd','cron'], logRecovered: true },
 *       minActions: 5              // minimum command count before flag is plausible
 *     }
 *   },
 *   flagOrder: ['flag1','flag2']
 * }
 */
exports.validateAction = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { boxId, flagId, stateProof } = request.data || {};
    const uid = request.auth.uid;

    if (!boxId || !flagId) {
        throw new HttpsError('invalid-argument', 'boxId and flagId required.');
    }
    if (!stateProof || typeof stateProof !== 'object') {
        throw new HttpsError('invalid-argument', 'State proof required.');
    }

    // Load registry
    const registryDoc = await db.doc(`flag_registry/${boxId}`).get();
    if (!registryDoc.exists) {
        throw new HttpsError('not-found', 'Lab not registered.');
    }

    const registry = registryDoc.data();
    const conditions = (registry.actionConditions || {})[flagId];

    if (!conditions) {
        throw new HttpsError('not-found', 'No action conditions for this flag.');
    }

    // Validate sequential order
    const flagOrder = registry.flagOrder || [];
    const flagIndex = flagOrder.indexOf(flagId);
    if (flagIndex > 0) {
        const prevFlag = flagOrder[flagIndex - 1];
        const prevCapture = await db.doc(`users/${uid}/flag_captures/${boxId}_${prevFlag}`).get();
        if (!prevCapture.exists) {
            throw new HttpsError('failed-precondition', 'Complete previous objectives first.');
        }
    }

    // Already captured — idempotent
    const existing = await db.doc(`users/${uid}/flag_captures/${boxId}_${flagId}`).get();
    if (existing.exists) {
        return { success: true, duplicate: true };
    }

    // Validate state proof against conditions
    const required = conditions.required || {};
    for (const [key, expected] of Object.entries(required)) {
        const actual = stateProof[key];

        if (Array.isArray(expected)) {
            // All items in expected must be present in actual
            if (!Array.isArray(actual) || !expected.every(item => actual.includes(item))) {
                return { success: false, reason: `Condition not met: ${key}` };
            }
        } else if (typeof expected === 'boolean') {
            if (actual !== expected) {
                return { success: false, reason: `Condition not met: ${key}` };
            }
        } else if (typeof expected === 'number') {
            if (typeof actual !== 'number' || actual < expected) {
                return { success: false, reason: `Condition not met: ${key}` };
            }
        } else if (typeof expected === 'string') {
            if (actual !== expected) {
                return { success: false, reason: `Condition not met: ${key}` };
            }
        }
    }

    // Minimum actions check (anti-console-abuse)
    if (conditions.minActions && typeof stateProof._actionCount === 'number') {
        if (stateProof._actionCount < conditions.minActions) {
            return { success: false, reason: 'Insufficient activity.' };
        }
    }

    // All conditions met — record the capture
    await db.doc(`users/${uid}/flag_captures/${boxId}_${flagId}`).set({
        boxId,
        flagId,
        capturedAt: FieldValue.serverTimestamp(),
        source: 'action-lab',
        stateSnapshot: stateProof
    });

    // Server-authoritative recompute of BOTH counters — see _recomputeCtfStats.
    // Capture the return value: this site (unlike the other three) USES the count in its
    // response. 98081d6cd replaced the old `const allCaptures = ...count()` block by pattern
    // and left the reference below dangling, so every first-time action-lab capture threw
    // ReferenceError: allCaptures is not defined. Both writes complete before the throw, so
    // no student lost progress — but the caller got an internal error, and BoxEngine's
    // .catch(() => {}) swallowed it, meaning the hexworth:lab-attempt-submitted event never
    // dispatched. A pattern replacement that silently mangles one of four sites is exactly
    // what a diff makes easy to miss.
    const ctfStats = await _recomputeCtfStats(uid);

    return { success: true, totalFlags: ctfStats.flagsCaptured };
});

// ─── WL: White Label Tenant API ─────────────────────────────────

/**
 * getTenantConfig — Public HTTP endpoint for the branded loader page.
 * Returns tenant branding and licensing config. No auth required
 * because the loader needs this BEFORE the user signs in.
 *
 * GET /getTenantConfig?slug=university-x
 */
exports.getTenantConfig = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
    const slug = req.query.slug || req.query.tenantId;

    if (!slug) {
        res.status(400).json({ error: 'Missing slug parameter' });
        return;
    }

    try {
        const doc = await db.doc(`tenants/${slug}`).get();

        if (!doc.exists) {
            res.status(404).json({ error: 'Tenant not found' });
            return;
        }

        const tenant = doc.data();

        // Don't expose internal fields to the public endpoint
        const publicConfig = {
            tenantId: tenant.tenantId,
            name: tenant.name,
            slug: tenant.slug,
            status: tenant.status,
            branding: tenant.branding,
            domain: tenant.domain,
            licensing: {
                tier: tenant.licensing.tier,
                contentAccess: tenant.licensing.contentAccess,
                // Don't expose maxSeats or expiresAt to client
            },
            auth: {
                method: tenant.auth.method,
                allowAnonymous: tenant.auth.allowAnonymous,
                allowGoogleSSO: tenant.auth.allowGoogleSSO
                // Don't expose SAML/OIDC configs
            },
            adminUids: tenant.adminUids || []
        };

        // Cache for 30 seconds
        res.set('Cache-Control', 'public, max-age=30');
        res.json(publicConfig);

    } catch (error) {
        console.error('[WL] getTenantConfig error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * logObservatoryEvent — research-cohort activity ingestion (Hexworth Observatory).
 *
 * Receives activity events via navigator.sendBeacon so unload-time events
 * (course_click, house_dwell) survive page navigation. It is the ONLY writer to
 * observatory_activity (clients are create:false): it verifies the Firebase ID
 * token → trusted uid (never trusts a client-supplied uid), derives classId from
 * the student's enrollment doc (so an unenrolled class can't be claimed),
 * whitelists the persisted fields, and clamps dwell seconds (no event stuffing).
 *
 * Body (text/plain JSON): { idToken, type, classId, path, clientTs, payload }
 * Always responds 204 — analytics is best-effort; errors never reach the page.
 */
exports.logObservatoryEvent = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
    // sendBeacon is POST-only; ignore anything else quietly.
    if (req.method !== 'POST') { res.status(204).end(); return; }

    const ALLOWED = ['house_enter', 'course_click', 'house_dwell', 'content_complete',
        'page_view', 'session_end', 'client_error', 'device', 'sandbox_launch'];
    // Phase 2 behavioral events. These require re-consent to the current form version
    // (the "Data Collected" enumeration), so a participant who only ever signed v1 is
    // NOT deep-tracked. content_complete + the house_* events stay admitted on any
    // consent record (they are within the original form's "interaction and performance
    // data"). Keep this string in lockstep with ObservatoryConsent.FORM_VERSION.
    const PHASE2_TYPES = ['page_view', 'session_end', 'client_error', 'device'];
    const OBSERVATORY_FORM_VERSION = 'cerbi-v2-2026-07-05';

    try {
        // sendBeacon delivers the Blob as the raw body; Express may hand us an
        // object (auto-parsed), a string, or a Buffer depending on content-type.
        let data = req.body;
        if (typeof data === 'string') { data = JSON.parse(data || '{}'); }
        else if (Buffer.isBuffer(data)) { data = JSON.parse(data.toString('utf8') || '{}'); }
        data = data || {};

        const idToken = data.idToken;
        const type = data.type;
        if (!idToken || ALLOWED.indexOf(type) === -1) { res.status(204).end(); return; }

        // Verify the token → trusted uid. Never trust a client-supplied uid.
        let decoded;
        try { decoded = await getAuth().verifyIdToken(idToken); }
        catch (e) { res.status(204).end(); return; }
        const uid = decoded.uid;

        // Read the enrollment and consent docs together (one parallel round-trip) so we
        // have classId, record-existence, and the consent form version in hand without a
        // second read. classId: enrollment wins, then consent, then (last resort) the
        // client value. formVersion always comes from the consent doc.
        let classId = null;
        let hasRecord = false;
        let formVersion = null;
        let declined = false;
        try {
            const [enrollSnap, consentSnap] = await Promise.all([
                db.doc(`observatory_enrollment/${uid}`).get(),
                db.doc(`observatory_consent/${uid}`).get()
            ]);
            if (enrollSnap.exists) {
                hasRecord = true; classId = enrollSnap.data().classId || null;
                if (enrollSnap.data().participates === false) declined = true;
            }
            if (consentSnap.exists) {
                hasRecord = true;
                if (!classId) classId = consentSnap.data().classId || null;
                formVersion = consentSnap.data().formVersion || null;
                if (consentSnap.data().participates === false) declined = true;
            }
        } catch (e) { /* leave defaults: hasRecord false, classId/formVersion null */ }
        // Research-integrity gate: only a uid with a server-side enrollment or consent
        // record enters the dataset. This backstops the client-side check now that
        // telemetry runs on shared course pages, not just the consented house index.
        // Gate on record EXISTENCE (hasRecord), never on classId, so a consented student
        // whose record carries a null classId is still admitted.
        if (!hasRecord) { res.status(204).end(); return; }

        // Decline gate: a participant who explicitly declined research (participates===false on
        // either the consent or enrollment record) is fully allowed to USE the Observatory, but no
        // research data is collected about them. Drop every event type, silently (204). Records that
        // predate this field have participates undefined and are treated as consented (unchanged).
        if (declined) { res.status(204).end(); return; }

        if (!classId && typeof data.classId === 'string') classId = data.classId;

        // Phase 2 consent gate: a behavioral event is admitted only if the participant's
        // consent record is on the CURRENT form version (they re-consented to the
        // "Data Collected" enumeration). Fail-closed: a missing consent doc or a missing/
        // older formVersion drops the behavioral event. Phase 1 events skip this gate.
        if (PHASE2_TYPES.indexOf(type) !== -1 && formVersion !== OBSERVATORY_FORM_VERSION) {
            res.status(204).end(); return;
        }

        // Whitelist persisted fields — no arbitrary client fields enter the dataset.
        const payload = (data.payload && typeof data.payload === 'object') ? data.payload : {};
        const event = {
            uid: uid,
            classId: classId || null,
            type: type,
            path: typeof data.path === 'string' ? data.path.slice(0, 300) : null,
            clientTs: typeof data.clientTs === 'string' ? data.clientTs.slice(0, 40) : null,
            at: FieldValue.serverTimestamp()
        };
        // Dwell seconds: clamp to [0, 86400] so a forged value can't inflate metrics.
        if (type === 'house_dwell' && Number.isFinite(payload.seconds)) {
            event.seconds = Math.min(Math.max(0, Math.round(payload.seconds)), 86400);
        }
        // Course-click target/name, length-bounded.
        if (type === 'course_click') {
            if (typeof payload.target === 'string') event.target = payload.target.slice(0, 300);
            if (typeof payload.name === 'string') event.name = payload.name.slice(0, 200);
        }
        // Sandbox launch: which lab box was launched (Phase-1 activity event, admitted on any
        // consent record — it is a platform interaction, same category as a course click).
        if (type === 'sandbox_launch') {
            if (typeof payload.labId === 'string') event.labId = payload.labId.slice(0, 60);
        }
        // Content completion: which module/lab/quiz was finished, and the score when
        // one applies (quiz pass). moduleId length-bounded; score clamped to [0,100]
        // or null (modules/labs complete with no score). A forged score cannot exceed 100.
        if (type === 'content_complete') {
            if (typeof payload.moduleId === 'string') event.moduleId = payload.moduleId.slice(0, 120);
            event.score = Number.isFinite(payload.score)
                ? Math.min(Math.max(0, Math.round(payload.score)), 100)
                : null;
        }
        // Page view: which course the path belongs to (path itself is already top-level).
        if (type === 'page_view') {
            if (typeof payload.course === 'string') event.course = payload.course.slice(0, 120);
        }
        // Session end: time on the page and how much of it was active (idle excluded),
        // plus how far the student scrolled. Snapshots share a sessionId (one per page
        // load) so the dashboard keeps the largest per session. All clamped so a forged
        // value can't skew metrics.
        if (type === 'session_end') {
            if (typeof payload.sessionId === 'string') event.sessionId = payload.sessionId.slice(0, 40);
            if (Number.isFinite(payload.durationSec)) event.durationSec = Math.min(Math.max(0, Math.round(payload.durationSec)), 86400);
            if (Number.isFinite(payload.activeSec)) event.activeSec = Math.min(Math.max(0, Math.round(payload.activeSec)), 86400);
            if (Number.isFinite(payload.maxScrollPct)) event.maxScrollPct = Math.min(Math.max(0, Math.round(payload.maxScrollPct)), 100);
        }
        // Client error: a JS error a real student hit (doubles as live QA). No stack, just
        // the message + source, length-bounded.
        if (type === 'client_error') {
            if (typeof payload.message === 'string') event.message = payload.message.slice(0, 300);
            if (typeof payload.source === 'string') event.source = payload.source.slice(0, 200);
        }
        // Device context, recorded once per session.
        if (type === 'device') {
            if (typeof payload.viewport === 'string') event.viewport = payload.viewport.slice(0, 40);
            if (typeof payload.platform === 'string') event.platform = payload.platform.slice(0, 60);
            if (typeof payload.connection === 'string') event.connection = payload.connection.slice(0, 40);
            event.reducedMotion = payload.reducedMotion === true;
        }

        await db.collection('observatory_activity').add(event);
        res.status(204).end();
    } catch (e) {
        console.warn('[Observatory] logObservatoryEvent error:', e.message);
        res.status(204).end();
    }
});

/**
 * withdrawFromObservatory — research withdrawal + data deletion (the IRB "right
 * to withdraw"). The signed-in participant calls this to permanently remove
 * their participation: it deletes their consent doc, their enrollment/roster
 * doc, and ALL of their activity events, then writes a minimal tombstone (uid +
 * timestamp — no PII, no research data) so the operator has an audit record that
 * a withdrawal occurred. Clients cannot delete these docs directly (rules deny
 * it); deletion is admin-SDK-only, here, after verifying the caller owns the uid.
 */
exports.withdrawFromObservatory = onCall({ ...cfOptions, secrets: [sextantPepper] }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in to withdraw.');
    }
    const uid = request.auth.uid;
    try {
        // Delete the consent + enrollment docs for this participant.
        await db.doc(`observatory_consent/${uid}`).delete();
        await db.doc(`observatory_enrollment/${uid}`).delete();

        // Purge the learner's tokenized Sextant cohort points (Plane B) so the right-to-
        // withdraw covers this feature. The identified self-view needs no purge: it is derived
        // live from observatory_activity, which the loop above already deleted. Recomputing the
        // token needs the pepper; if it is unset, no Plane-B data could exist, so nothing to
        // purge. Never blocks the withdrawal.
        let sextantPurged = false;
        let deletedCohortPoints = 0;
        try {
            const pepper = process.env.SEXTANT_PEPPER || (sextantPepper.value && sextantPepper.value());
            const r = await require('./sextant').purgeLearner(db, uid, pepper || null);
            deletedCohortPoints = r.deletedCohortPoints;
            sextantPurged = true;
        } catch (e) {
            // purgeLearner throws when the pepper is unavailable (real Plane-B data may exist and
            // could not be resolved). The withdrawal STILL completes (PII already deleted above);
            // the tombstone records sextantPurged:false so the next snapshot's reconcileWithdrawals
            // finishes the job with a validated pepper. Logged at ERROR so it is not silent.
            console.error('[Observatory] Sextant Plane-B purge deferred to reconciliation (pepper unavailable):', e.message);
        }

        // Delete all activity events for this uid, in batches (Firestore caps a
        // batch at 500 writes; 400 leaves headroom). Loop until none remain.
        let deletedActivity = 0;
        let more = true;
        while (more) {
            const snap = await db.collection('observatory_activity')
                .where('uid', '==', uid).limit(400).get();
            if (snap.empty) break;
            const batch = db.batch();
            snap.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
            deletedActivity += snap.size;
            more = snap.size === 400; // a full page may mean more remain
        }

        // Minimal audit tombstone — records THAT a withdrawal happened, with no PII and no
        // retained research data. sextantPurged records whether the Plane-B purge completed; a
        // false value is the reconciliation queue reconcileWithdrawals drains on the next snapshot.
        await db.doc(`observatory_withdrawals/${uid}`).set({
            uid: uid,
            withdrawnAt: FieldValue.serverTimestamp(),
            sextantPurged: sextantPurged
        });

        return {
            ok: true,
            deletedActivity: deletedActivity,
            deletedSextantCohortPoints: deletedCohortPoints,
            sextantPurged: sextantPurged
        };
    } catch (e) {
        console.error('[Observatory] withdrawFromObservatory failed:', e.message);
        throw new HttpsError('internal', 'Withdrawal failed. Please try again.');
    }
});

/**
 * getMyTrajectory — Sextant self-view (design D). Returns the signed-in learner's OWN
 * week-by-week trajectory, DERIVED LIVE from their observatory_activity events. No new
 * persisted identified store, no research-consent gate: this is the learner's own data shown
 * back to them (same category as the dashboard), so it works for every signed-in learner.
 * The activity read is scoped to request.auth.uid via the admin SDK — a learner can only ever
 * see their own trajectory, and observatory_activity stays admin-only at the rules layer.
 */
exports.getMyTrajectory = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    try {
        // Read only THIS learner's activity, MOST-RECENT-FIRST (orderBy at desc), capped for
        // cost/latency. The cap therefore truncates the OLDEST history, not an arbitrary slice —
        // so the recent weekly buckets/velocity a learner cares about are always correct; only a
        // learner past the cap loses their oldest weeks. `truncated` signals that to the client.
        // (Requires the observatory_activity (uid asc, at desc) composite index — firestore.indexes.json.)
        const CAP = 20000;
        const snap = await db.collection('observatory_activity')
            .where('uid', '==', uid).orderBy('at', 'desc').limit(CAP).get();
        const events = snap.docs.map((d) => d.data());
        const weeks = require('./sextant').deriveTrajectory(events);
        return { uid: uid, weeks: weeks, eventCount: events.length, truncated: events.length >= CAP };
    } catch (e) {
        console.error('[Sextant] getMyTrajectory failed:', e.message);
        throw new HttpsError('internal', 'Could not load your trajectory. Please try again.');
    }
});

/**
 * getCohortComparison — Sextant Stage 2 reader (ADMIN only). Reads the tokenized cohort
 * points (Plane B), aggregates them by class + week, and applies k-anonymity suppression
 * SERVER-SIDE via sextant.aggregateCohorts — so the client only ever receives averaged,
 * suppressed cohort series, never the raw per-learner tokenized rows. No PII in or out
 * (points carry a token + classId + metrics, never a uid/name/email).
 */
exports.getCohortComparison = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    // Admin gate — mirrors firestore.rules isAdmin() (custom claim OR email allowlist).
    const email = (request.auth.token.email || '').toLowerCase();
    const isAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email);
    if (!isAdmin) {
        throw new HttpsError('permission-denied', 'Cohort analytics are admin-only.');
    }
    try {
        const snap = await db.collection('sextant_cohort_points').get();
        const points = snap.docs.map((d) => d.data());
        return require('./sextant').aggregateCohorts(points, 5); // k = 5
    } catch (e) {
        console.error('[Sextant] getCohortComparison failed:', e.message);
        throw new HttpsError('internal', 'Could not load cohort comparison.');
    }
});

/**
 * getTenantCatalog — Returns licensed content catalog for a tenant.
 * Requires auth — the student must be signed in to see their content.
 */
exports.getTenantCatalog = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantId } = request.data || {};
    if (!tenantId) {
        throw new HttpsError('invalid-argument', 'Missing tenantId.');
    }

    const doc = await db.doc(`tenants/${tenantId}`).get();
    if (!doc.exists) {
        throw new HttpsError('not-found', 'Tenant not found.');
    }

    const tenant = doc.data();
    if (tenant.status !== 'active') {
        throw new HttpsError('permission-denied', 'Tenant is not active.');
    }

    // Check license expiration
    if (tenant.licensing.expiresAt && new Date(tenant.licensing.expiresAt) < new Date()) {
        throw new HttpsError('permission-denied', 'License has expired.');
    }

    return {
        tier: tenant.licensing.tier,
        contentAccess: tenant.licensing.contentAccess,
        features: tenant.licensing.contentAccess.features
    };
});

// ─── WL-5: Assignment API ───────────────────────────────────────

// Valid content types for assignments
const VALID_CONTENT_TYPES = ['box', 'module', 'quiz', 'lab', 'presentation'];
const VALID_ASSIGNMENT_STATUSES = ['active', 'draft', 'archived'];
const VALID_PROGRESS_STATUSES = ['not_started', 'in_progress', 'completed', 'graded'];

/**
 * verifyTenantAdmin — Helper to check if caller is a tenant admin.
 * Returns the tenant doc data if authorized, throws if not.
 */
async function verifyTenantAdmin(uid, tenantId) {
    if (!tenantId || typeof tenantId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tenantId.');
    }

    const tenantDoc = await db.doc(`tenants/${tenantId}`).get();
    if (!tenantDoc.exists) {
        throw new HttpsError('not-found', 'Tenant not found.');
    }

    const tenant = tenantDoc.data();
    if (tenant.status !== 'active') {
        throw new HttpsError('permission-denied', 'Tenant is not active.');
    }

    const adminUids = tenant.adminUids || [];
    if (!adminUids.includes(uid)) {
        throw new HttpsError('permission-denied', 'Not a tenant admin.');
    }

    return tenant;
}

/**
 * createAssignment — Create a new assignment in a tenant class.
 * Input: { tenantId, classId, title, description, contentType, contentId, dueDate, points }
 * Only tenant admins can create assignments.
 */
exports.createAssignment = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantId, classId, title, description, contentType, contentId, dueDate, points } = request.data || {};
    const uid = request.auth.uid;

    // Verify caller is tenant admin
    await verifyTenantAdmin(uid, tenantId);

    // Validate required fields
    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing classId.');
    }
    if (!title || typeof title !== 'string' || title.length > 200) {
        throw new HttpsError('invalid-argument', 'Title is required (max 200 chars).');
    }
    if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
        throw new HttpsError('invalid-argument', `Invalid contentType. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`);
    }
    if (!contentId || typeof contentId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing contentId.');
    }

    // Verify the class exists
    const classDoc = await db.doc(`tenants/${tenantId}/classes/${classId}`).get();
    if (!classDoc.exists) {
        throw new HttpsError('not-found', 'Class not found.');
    }

    // Build assignment document
    const numPoints = Number(points) || 100;
    if (numPoints < 0 || numPoints > 10000) {
        throw new HttpsError('invalid-argument', 'Points must be 0-10,000.');
    }

    // Get current assignment count for ordering
    const existingAssignments = await db.collection(`tenants/${tenantId}/classes/${classId}/assignments`).count().get();
    const order = (existingAssignments.data().count || 0) + 1;

    const assignment = {
        title: title.trim(),
        description: (description || '').trim(),
        contentType,
        contentId: contentId.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        points: numPoints,
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        createdBy: uid,
        order
    };

    const ref = await db.collection(`tenants/${tenantId}/classes/${classId}/assignments`).add(assignment);

    return {
        assignmentId: ref.id,
        ...assignment,
        createdAt: new Date().toISOString() // Return serializable timestamp
    };
});

/**
 * updateAssignment — Update an existing assignment.
 * Input: { tenantId, classId, assignmentId, updates }
 * Only tenant admins can update assignments.
 */
exports.updateAssignment = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantId, classId, assignmentId, updates } = request.data || {};
    const uid = request.auth.uid;

    // Verify caller is tenant admin
    await verifyTenantAdmin(uid, tenantId);

    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing classId.');
    }
    if (!assignmentId || typeof assignmentId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing assignmentId.');
    }
    if (!updates || typeof updates !== 'object') {
        throw new HttpsError('invalid-argument', 'Missing updates object.');
    }

    // Verify assignment exists
    const assignmentRef = db.doc(`tenants/${tenantId}/classes/${classId}/assignments/${assignmentId}`);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) {
        throw new HttpsError('not-found', 'Assignment not found.');
    }

    // Whitelist allowed update fields
    const allowedFields = ['title', 'description', 'dueDate', 'points', 'status', 'contentType', 'contentId', 'order'];
    const sanitized = {};

    for (const key of Object.keys(updates)) {
        if (!allowedFields.includes(key)) continue;

        if (key === 'title') {
            if (typeof updates.title !== 'string' || updates.title.length > 200) {
                throw new HttpsError('invalid-argument', 'Title must be a string (max 200 chars).');
            }
            sanitized.title = updates.title.trim();
        } else if (key === 'description') {
            sanitized.description = (updates.description || '').trim();
        } else if (key === 'dueDate') {
            sanitized.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
        } else if (key === 'points') {
            const numPoints = Number(updates.points);
            if (!Number.isFinite(numPoints) || numPoints < 0 || numPoints > 10000) {
                throw new HttpsError('invalid-argument', 'Points must be 0-10,000.');
            }
            sanitized.points = numPoints;
        } else if (key === 'status') {
            if (!VALID_ASSIGNMENT_STATUSES.includes(updates.status)) {
                throw new HttpsError('invalid-argument', `Invalid status. Must be one of: ${VALID_ASSIGNMENT_STATUSES.join(', ')}`);
            }
            sanitized.status = updates.status;
        } else if (key === 'contentType') {
            if (!VALID_CONTENT_TYPES.includes(updates.contentType)) {
                throw new HttpsError('invalid-argument', `Invalid contentType. Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`);
            }
            sanitized.contentType = updates.contentType;
        } else if (key === 'contentId') {
            if (typeof updates.contentId !== 'string') {
                throw new HttpsError('invalid-argument', 'contentId must be a string.');
            }
            sanitized.contentId = updates.contentId.trim();
        } else if (key === 'order') {
            const numOrder = Number(updates.order);
            if (!Number.isFinite(numOrder) || numOrder < 1) {
                throw new HttpsError('invalid-argument', 'Order must be a positive integer.');
            }
            sanitized.order = numOrder;
        }
    }

    if (Object.keys(sanitized).length === 0) {
        throw new HttpsError('invalid-argument', 'No valid update fields provided.');
    }

    sanitized.updatedAt = FieldValue.serverTimestamp();
    sanitized.updatedBy = uid;

    await assignmentRef.update(sanitized);

    return { success: true, assignmentId, updatedFields: Object.keys(sanitized).filter(k => k !== 'updatedAt' && k !== 'updatedBy') };
});

/**
 * deleteAssignment — Delete an assignment from a tenant class.
 * Input: { tenantId, classId, assignmentId }
 * Only tenant admins can delete assignments.
 */
exports.deleteAssignment = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantId, classId, assignmentId } = request.data || {};
    const uid = request.auth.uid;

    // Verify caller is tenant admin
    await verifyTenantAdmin(uid, tenantId);

    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing classId.');
    }
    if (!assignmentId || typeof assignmentId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing assignmentId.');
    }

    // Verify assignment exists
    const assignmentRef = db.doc(`tenants/${tenantId}/classes/${classId}/assignments/${assignmentId}`);
    const assignmentDoc = await assignmentRef.get();
    if (!assignmentDoc.exists) {
        throw new HttpsError('not-found', 'Assignment not found.');
    }

    await assignmentRef.delete();

    return { success: true, assignmentId };
});

/**
 * getAssignments — List assignments for a tenant class.
 * Input: { tenantId, classId }
 * Admins: returns all assignments.
 * Students: returns assignments with their progress status attached.
 */
exports.getAssignments = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantId, classId } = request.data || {};
    const uid = request.auth.uid;

    if (!tenantId || typeof tenantId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tenantId.');
    }
    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing classId.');
    }

    // Check tenant exists and is active
    const tenantDoc = await db.doc(`tenants/${tenantId}`).get();
    if (!tenantDoc.exists) {
        throw new HttpsError('not-found', 'Tenant not found.');
    }
    const tenant = tenantDoc.data();
    if (tenant.status !== 'active') {
        throw new HttpsError('permission-denied', 'Tenant is not active.');
    }

    const isAdmin = (tenant.adminUids || []).includes(uid);

    // Fetch assignments ordered by display order
    const assignmentsSnap = await db.collection(`tenants/${tenantId}/classes/${classId}/assignments`)
        .orderBy('order', 'asc')
        .get();

    const assignments = [];
    assignmentsSnap.forEach(doc => {
        const data = doc.data();
        assignments.push({
            assignmentId: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
            updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
            dueDate: data.dueDate ? (data.dueDate.toDate ? data.dueDate.toDate().toISOString() : data.dueDate) : null
        });
    });

    // For students, attach their progress
    if (!isAdmin) {
        // Only return active assignments for students
        const activeAssignments = assignments.filter(a => a.status === 'active');

        const progressDoc = await db.doc(`tenants/${tenantId}/classes/${classId}/progress/${uid}`).get();
        const progressData = progressDoc.exists ? (progressDoc.data().assignments || {}) : {};

        return {
            assignments: activeAssignments.map(a => ({
                ...a,
                progress: progressData[a.assignmentId] || { status: 'not_started' }
            })),
            role: 'student'
        };
    }

    return { assignments, role: 'admin' };
});

/**
 * submitAssignmentProgress — Student submits progress on an assignment.
 * Input: { tenantId, classId, assignmentId, status, score }
 * Only the student themselves can submit their own progress.
 */
exports.submitAssignmentProgress = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantId, classId, assignmentId, status, score } = request.data || {};
    const uid = request.auth.uid;

    if (!tenantId || typeof tenantId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tenantId.');
    }
    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing classId.');
    }
    if (!assignmentId || typeof assignmentId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing assignmentId.');
    }
    if (!status || !VALID_PROGRESS_STATUSES.includes(status)) {
        throw new HttpsError('invalid-argument', `Invalid status. Must be one of: ${VALID_PROGRESS_STATUSES.join(', ')}`);
    }

    // Students cannot set 'graded' — only admins can grade
    if (status === 'graded') {
        throw new HttpsError('permission-denied', 'Students cannot grade their own work.');
    }

    // Verify tenant is active
    const tenantDoc = await db.doc(`tenants/${tenantId}`).get();
    if (!tenantDoc.exists) {
        throw new HttpsError('not-found', 'Tenant not found.');
    }
    if (tenantDoc.data().status !== 'active') {
        throw new HttpsError('permission-denied', 'Tenant is not active.');
    }

    // Verify assignment exists and is active
    const assignmentDoc = await db.doc(`tenants/${tenantId}/classes/${classId}/assignments/${assignmentId}`).get();
    if (!assignmentDoc.exists) {
        throw new HttpsError('not-found', 'Assignment not found.');
    }
    if (assignmentDoc.data().status !== 'active') {
        throw new HttpsError('failed-precondition', 'Assignment is not active.');
    }

    // Build progress entry
    const progressEntry = {
        status,
        updatedAt: new Date().toISOString()
    };

    if (status === 'in_progress' || status === 'completed') {
        progressEntry.startedAt = FieldValue.serverTimestamp();
    }
    if (status === 'completed') {
        progressEntry.completedAt = FieldValue.serverTimestamp();
    }
    if (score !== undefined && score !== null) {
        const numScore = Number(score);
        if (!Number.isFinite(numScore) || numScore < 0 || numScore > 10000) {
            throw new HttpsError('invalid-argument', 'Score must be 0-10,000.');
        }
        progressEntry.score = numScore;
    }

    // Merge into the student's progress document
    const progressRef = db.doc(`tenants/${tenantId}/classes/${classId}/progress/${uid}`);
    const progressDoc = await progressRef.get();

    if (progressDoc.exists) {
        // Preserve existing startedAt if already set
        const existing = (progressDoc.data().assignments || {})[assignmentId];
        if (existing && existing.startedAt) {
            delete progressEntry.startedAt; // Don't overwrite original start time
        }

        await progressRef.update({
            [`assignments.${assignmentId}`]: progressEntry
        });
    } else {
        await progressRef.set({
            assignments: {
                [assignmentId]: progressEntry
            }
        });
    }

    return { success: true, assignmentId, status };
});

/**
 * getStudentProgress — Get student progress for a tenant class.
 * Input: { tenantId, classId, studentUid? }
 * Admin: can query any student (omit studentUid to get all students).
 * Student: can only query their own progress.
 */
exports.getStudentProgress = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantId, classId, studentUid } = request.data || {};
    const uid = request.auth.uid;

    if (!tenantId || typeof tenantId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tenantId.');
    }
    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing classId.');
    }

    // Check tenant exists and is active
    const tenantDoc = await db.doc(`tenants/${tenantId}`).get();
    if (!tenantDoc.exists) {
        throw new HttpsError('not-found', 'Tenant not found.');
    }
    const tenant = tenantDoc.data();
    if (tenant.status !== 'active') {
        throw new HttpsError('permission-denied', 'Tenant is not active.');
    }

    const isAdmin = (tenant.adminUids || []).includes(uid);

    // Non-admin trying to view another student's progress
    if (!isAdmin && studentUid && studentUid !== uid) {
        throw new HttpsError('permission-denied', 'Cannot view other students\' progress.');
    }

    // Admin requesting all students
    if (isAdmin && !studentUid) {
        const progressSnap = await db.collection(`tenants/${tenantId}/classes/${classId}/progress`).get();

        const students = [];
        progressSnap.forEach(doc => {
            const data = doc.data();
            students.push({
                uid: doc.id,
                studentUid: doc.id,
                displayName: data.displayName || '',
                email: data.email || '',
                enrolledAt: data.enrolledAt || null,
                lastActive: data.lastActive || null,
                currentChapter: data.currentChapter || 1,
                chaptersCompleted: data.chaptersCompleted || [],
                modulesCompleted: data.modulesCompleted || [],
                quizScores: data.quizScores || {},
                labsCompleted: data.labsCompleted || [],
                totalTimeSpent: data.totalTimeSpent || 0,
                totalSessionMs: data.totalSessionMs || 0,  // Analytics v2 — canonical time field (ms)
                assignments: data.assignments || {}
            });
        });

        return { students, role: 'admin' };
    }

    // Single student query (own progress or admin querying specific student)
    const targetUid = studentUid || uid;
    const progressDoc = await db.doc(`tenants/${tenantId}/classes/${classId}/progress/${targetUid}`).get();

    if (!progressDoc.exists) {
        return {
            studentUid: targetUid,
            assignments: {},
            role: isAdmin ? 'admin' : 'student'
        };
    }

    return {
        studentUid: targetUid,
        assignments: progressDoc.data().assignments || {},
        role: isAdmin ? 'admin' : 'student'
    };
});


// ─── WL: Tenant Admin Cloud Functions ────────────────────────────────
// Server-side CRUD for tenant management. Called from the admin console
// UI. Uses requireAdmin() — only platform admins (custom claim or email
// allowlist) can create/modify tenants. This ensures Firestore security
// rules never need a write rule on the tenants collection.

// Valid values for input validation
const VALID_TIERS = ['analyst', 'team', 'academy', 'enterprise'];
const VALID_DASHBOARD_VARIANTS = ['command-center', 'clean-ops', 'tactical-hud', 'enterprise', 'academy', 'federal', 'nightshift', 'minimalist', 'campus'];

/**
 * Helper: build a default tenant document from required fields.
 * Mirrors createDefaultTenant() in tenant-admin.js so both the CLI
 * and Cloud Function produce identical schema.
 */
function buildTenantDoc(slug, name, tier) {
    return {
        tenantId: slug,
        name: name,
        slug: slug,
        branding: {
            logo: '',
            favicon: '',
            primaryColor: '#06b6d4',
            secondaryColor: '#8b5cf6',
            backgroundColor: '#0a0a0f',
            headerColor: '#0d1117',
            fontFamily: 'Inter, system-ui, sans-serif',
            customCSS: '',
            platformName: name,
            tagline: 'Cybersecurity Training Platform',
            dashboardVariant: null,
            terminology: {}
        },
        licensing: {
            tier: tier,
            contentAccess: {
                series: [],
                houses: [],
                hubs: [],
                courses: [],
                features: {
                    vsMode: false,
                    chatbots: false,
                    bugHunting: false,
                    codeRunner: false,
                    wiresharkHub: false,
                    forensicsHub: false
                }
            },
            maxSeats: tier === 'analyst' ? 1 :
                      tier === 'team' ? 25 :
                      tier === 'academy' ? 200 : 9999,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        domain: {
            type: 'subdomain',
            subdomain: slug,
            customDomain: null
        },
        auth: {
            method: 'firebase',
            allowAnonymous: false,
            allowGoogleSSO: true,
            samlConfig: null,
            oidcConfig: null
        },
        adminUids: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        status: 'active'
    };
}

/**
 * adminListTenants — Returns all tenants for the admin console table.
 * Strips sensitive fields (SAML/OIDC configs) from response.
 */
exports.adminListTenants = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const snap = await db.collection('tenants').orderBy('createdAt', 'desc').get();
    const tenants = [];

    snap.forEach(doc => {
        const d = doc.data();
        // Strip sensitive auth configs
        if (d.auth) {
            delete d.auth.samlConfig;
            delete d.auth.oidcConfig;
        }
        tenants.push({ id: doc.id, ...d });
    });

    return { tenants };
});

/**
 * adminGetTenant — Returns a single tenant's full config.
 */
exports.adminGetTenant = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { slug } = request.data || {};
    if (!slug) throw new HttpsError('invalid-argument', 'Slug is required.');

    const doc = await db.doc(`tenants/${slug}`).get();
    if (!doc.exists) throw new HttpsError('not-found', `Tenant "${slug}" not found.`);

    return { tenant: { id: doc.id, ...doc.data() } };
});

/**
 * adminCreateTenant — Creates a new tenant with default schema.
 * Validates slug uniqueness and required fields.
 */
exports.adminCreateTenant = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { slug, name, tier, branding, licensing, features, adminUids } = request.data || {};

    // Validate required fields
    if (!slug || typeof slug !== 'string') {
        throw new HttpsError('invalid-argument', 'Slug is required.');
    }
    if (!name || typeof name !== 'string') {
        throw new HttpsError('invalid-argument', 'Name is required.');
    }

    // Validate slug format: lowercase, hyphens, alphanumeric
    const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (slugClean !== slug) {
        throw new HttpsError('invalid-argument', 'Slug must be lowercase alphanumeric with hyphens only.');
    }
    if (slug.length < 3 || slug.length > 50) {
        throw new HttpsError('invalid-argument', 'Slug must be 3-50 characters.');
    }

    // Validate tier
    const tenantTier = tier || 'team';
    if (!VALID_TIERS.includes(tenantTier)) {
        throw new HttpsError('invalid-argument', 'Invalid tier. Must be: ' + VALID_TIERS.join(', '));
    }

    // Check slug uniqueness — allow re-creation if previously soft-deleted
    const existing = await db.doc(`tenants/${slug}`).get();
    if (existing.exists && existing.data().status !== 'deleted') {
        throw new HttpsError('already-exists', `Tenant "${slug}" already exists.`);
    }

    // Build the tenant document with defaults
    const tenantDoc = buildTenantDoc(slug, name, tenantTier);

    // Apply optional overrides from the request
    if (branding) {
        if (branding.primaryColor) tenantDoc.branding.primaryColor = branding.primaryColor;
        if (branding.secondaryColor) tenantDoc.branding.secondaryColor = branding.secondaryColor;
        if (branding.logo) tenantDoc.branding.logo = branding.logo;
        if (branding.tagline) tenantDoc.branding.tagline = branding.tagline;
        if (branding.dashboardVariant) {
            if (!VALID_DASHBOARD_VARIANTS.includes(branding.dashboardVariant)) {
                throw new HttpsError('invalid-argument', 'Invalid dashboard variant.');
            }
            tenantDoc.branding.dashboardVariant = branding.dashboardVariant;
        }
    }

    if (licensing) {
        if (licensing.maxSeats) tenantDoc.licensing.maxSeats = parseInt(licensing.maxSeats);
        if (licensing.expiresAt) tenantDoc.licensing.expiresAt = licensing.expiresAt;

        // Apply content access (courses, houses, series, hubs, features)
        if (licensing.contentAccess && typeof licensing.contentAccess === 'object') {
            const ca = licensing.contentAccess;
            if (Array.isArray(ca.houses))  tenantDoc.licensing.contentAccess.houses  = ca.houses;
            if (Array.isArray(ca.series))  tenantDoc.licensing.contentAccess.series  = ca.series;
            if (Array.isArray(ca.hubs))    tenantDoc.licensing.contentAccess.hubs    = ca.hubs;
            if (Array.isArray(ca.courses)) tenantDoc.licensing.contentAccess.courses = ca.courses;
            if (ca.features && typeof ca.features === 'object') {
                tenantDoc.licensing.contentAccess.features = ca.features;
            }
        }
    }

    // Apply feature overrides (legacy path — direct features param)
    if (features && typeof features === 'object' && !licensing?.contentAccess?.features) {
        Object.keys(features).forEach(key => {
            tenantDoc.licensing.contentAccess.features[key] = !!features[key];
        });
    }

    // Apply admin UIDs — always include the creator
    if (adminUids && Array.isArray(adminUids)) {
        tenantDoc.adminUids = adminUids.filter(uid => typeof uid === 'string' && uid.trim());
    }
    if (!tenantDoc.adminUids.includes(request.auth.uid)) {
        tenantDoc.adminUids.push(request.auth.uid);
    }

    // Write to Firestore
    await db.doc(`tenants/${slug}`).set(tenantDoc);

    return { slug, message: `Tenant "${name}" created successfully.` };
});

/**
 * adminUpdateTenant — Updates an existing tenant's fields.
 * Uses dot-notation for nested field updates so unchanged fields
 * are preserved (not overwritten with defaults).
 */
exports.adminUpdateTenant = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { slug, updates } = request.data || {};
    if (!slug) throw new HttpsError('invalid-argument', 'Slug is required.');
    if (!updates || typeof updates !== 'object') {
        throw new HttpsError('invalid-argument', 'Updates object is required.');
    }

    // Verify tenant exists
    const doc = await db.doc(`tenants/${slug}`).get();
    if (!doc.exists) throw new HttpsError('not-found', `Tenant "${slug}" not found.`);

    // Build the Firestore update object with dot-notation keys
    const firestoreUpdates = { updatedAt: FieldValue.serverTimestamp() };

    // Branding fields
    const brandingFields = [
        'primaryColor', 'secondaryColor', 'backgroundColor', 'headerColor',
        'fontFamily', 'customCSS', 'platformName', 'tagline', 'logo', 'favicon'
    ];
    brandingFields.forEach(field => {
        if (updates[field] !== undefined) {
            firestoreUpdates[`branding.${field}`] = updates[field];
        }
    });

    // Dashboard variant (with validation)
    if (updates.dashboardVariant !== undefined) {
        if (updates.dashboardVariant && !VALID_DASHBOARD_VARIANTS.includes(updates.dashboardVariant)) {
            throw new HttpsError('invalid-argument', 'Invalid dashboard variant.');
        }
        firestoreUpdates['branding.dashboardVariant'] = updates.dashboardVariant || null;
    }

    // Name
    if (updates.name) {
        firestoreUpdates.name = updates.name;
        firestoreUpdates['branding.platformName'] = updates.name;
    }

    // Licensing fields
    if (updates.tier) {
        if (!VALID_TIERS.includes(updates.tier)) {
            throw new HttpsError('invalid-argument', 'Invalid tier.');
        }
        firestoreUpdates['licensing.tier'] = updates.tier;
    }
    if (updates.maxSeats !== undefined) {
        firestoreUpdates['licensing.maxSeats'] = parseInt(updates.maxSeats);
    }
    if (updates.expiresAt !== undefined) {
        firestoreUpdates['licensing.expiresAt'] = updates.expiresAt;
    }

    // Content access arrays (courses, houses, series, hubs)
    if (updates.contentAccess && typeof updates.contentAccess === 'object') {
        const ca = updates.contentAccess;
        if (Array.isArray(ca.houses))  firestoreUpdates['licensing.contentAccess.houses']  = ca.houses;
        if (Array.isArray(ca.series))  firestoreUpdates['licensing.contentAccess.series']  = ca.series;
        if (Array.isArray(ca.hubs))    firestoreUpdates['licensing.contentAccess.hubs']    = ca.hubs;
        if (Array.isArray(ca.courses)) firestoreUpdates['licensing.contentAccess.courses'] = ca.courses;
        // Features from contentAccess take precedence over legacy features param
        if (ca.features && typeof ca.features === 'object') {
            Object.keys(ca.features).forEach(key => {
                firestoreUpdates[`licensing.contentAccess.features.${key}`] = !!ca.features[key];
            });
        }
    }

    // Features (legacy path — only if contentAccess.features wasn't provided)
    if (updates.features && typeof updates.features === 'object' && !(updates.contentAccess && updates.contentAccess.features)) {
        Object.keys(updates.features).forEach(key => {
            firestoreUpdates[`licensing.contentAccess.features.${key}`] = !!updates.features[key];
        });
    }

    // Admin UIDs
    if (updates.adminUids !== undefined) {
        if (!Array.isArray(updates.adminUids)) {
            throw new HttpsError('invalid-argument', 'adminUids must be an array.');
        }
        firestoreUpdates.adminUids = updates.adminUids.filter(uid => typeof uid === 'string' && uid.trim());
    }

    // Status
    if (updates.status) {
        if (!['active', 'suspended', 'inactive'].includes(updates.status)) {
            throw new HttpsError('invalid-argument', 'Invalid status.');
        }
        firestoreUpdates.status = updates.status;
    }

    await db.doc(`tenants/${slug}`).update(firestoreUpdates);

    return { slug, message: `Tenant "${slug}" updated.`, fieldsUpdated: Object.keys(firestoreUpdates).length };
});

/**
 * adminDeleteTenant — Soft-deletes a tenant by setting status to 'deleted'.
 * Does NOT remove the Firestore document — data is preserved for audit.
 */
exports.adminDeleteTenant = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { slug } = request.data || {};
    if (!slug) throw new HttpsError('invalid-argument', 'Slug is required.');

    const doc = await db.doc(`tenants/${slug}`).get();
    if (!doc.exists) throw new HttpsError('not-found', `Tenant "${slug}" not found.`);

    await db.doc(`tenants/${slug}`).update({
        status: 'deleted',
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: request.auth.uid,
        updatedAt: FieldValue.serverTimestamp()
    });

    return { slug, message: `Tenant "${slug}" has been deactivated.` };
});

/**
 * adminPurgeDeletedTenants — Hard-deletes all tenant docs with status 'deleted'.
 * Permanently removes data from Firestore. Admin only.
 */
exports.adminPurgeDeletedTenants = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const snapshot = await db.collection('tenants')
        .where('status', '==', 'deleted')
        .get();

    if (snapshot.empty) {
        return { purged: 0, message: 'No deleted tenants to purge.' };
    }

    const batch = db.batch();
    const slugs = [];
    snapshot.forEach(doc => {
        slugs.push(doc.id);
        batch.delete(doc.ref);
    });

    await batch.commit();
    return { purged: slugs.length, slugs, message: `Purged ${slugs.length} deleted tenant(s).` };
});

// ═══════════════════════════════════════════════════════════════════════════
// TENANT INVITES — Pre-registration instructor invites (2026-05-13)
// ═══════════════════════════════════════════════════════════════════════════
// Built after the Wendy Norfleet pattern was closed via backfill: this slice
// goes one step further by supporting "create tenant → invite instructor by
// email" BEFORE the instructor has signed up. Token-based redemption flow
// binds the invite to a specific email — when the instructor signs in (any
// time before expiry, with a matching email), they're auto-added to the
// tenant's adminUids.
//
// Data model: tenant_invites/{tokenId}
//   { tenantId, email (lowercased), role, createdBy, createdAt, expiresAt,
//     redeemedAt, redeemedByUid, status: 'pending'|'redeemed'|'expired'|'revoked' }
//
// Security: tokens are bearer credentials. Strict email binding on redemption
// — auth.token.email MUST match invite.email to prevent URL-leak abuse.
// Single-use, 7-day default expiry.

const INVITE_DEFAULT_TTL_DAYS = 7;
const INVITE_VALID_ROLES = ['instructor', 'student'];

/**
 * adminCreateInvite — Generates a pre-registration invite token for a tenant.
 * Input:  { tenantId, email, role?, ttlDays? }
 * Returns: { tokenId, inviteUrl, expiresAt }
 *
 * Admin-gated (platform operator). Returns the URL for the operator to share.
 * Auto-email-send is NOT included in v1 — operator shares the link manually.
 */
exports.adminCreateInvite = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { tenantId, email: rawEmail, role: rawRole, ttlDays: rawTtl } = request.data || {};
    if (!tenantId || typeof tenantId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tenantId.');
    }
    if (!rawEmail || typeof rawEmail !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing email.');
    }
    const email = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new HttpsError('invalid-argument', 'Invalid email format.');
    }
    const role = rawRole || 'instructor';
    if (!INVITE_VALID_ROLES.includes(role)) {
        throw new HttpsError('invalid-argument', 'Invalid role. Must be: ' + INVITE_VALID_ROLES.join(', '));
    }
    const ttlDays = Math.min(Math.max(parseInt(rawTtl, 10) || INVITE_DEFAULT_TTL_DAYS, 1), 30);

    // Verify tenant exists + is active
    const tenantDoc = await db.doc(`tenants/${tenantId}`).get();
    if (!tenantDoc.exists) throw new HttpsError('not-found', 'Tenant not found.');
    if (tenantDoc.data().status !== 'active') {
        throw new HttpsError('failed-precondition', 'Tenant is not active.');
    }

    // H1 — Reject duplicate pending invite for the same (tenantId, email).
    // Expired/redeemed/revoked invites do NOT block re-invite.
    // NOTE (best-effort, not atomic): this read is OUTSIDE a transaction. Two
    // concurrent admin clicks for the same (tenantId, email) can each pass the
    // duplicate check before either set() commits. Acceptable for v1: admin-only
    // path, microsecond race window, no security impact. If H1 becomes a hard
    // guarantee, switch to deterministic doc IDs or wrap read+write in a tx.
    const dupSnap = await db.collection('tenant_invites')
        .where('tenantId', '==', tenantId)
        .where('email', '==', email)
        .where('status', '==', 'pending')
        .limit(1)
        .get();
    if (!dupSnap.empty) {
        throw new HttpsError('already-exists',
            'Active pending invite exists for this email. Revoke it first or wait for expiry.');
    }

    // H2 — Soft warn if the invitee is already a tenant admin. Don't block.
    let warning = null;
    const adminUidsExisting = Array.isArray(tenantDoc.data().adminUids) ? tenantDoc.data().adminUids : [];
    if (adminUidsExisting.length > 0) {
        try {
            const existingUser = await admin.auth().getUserByEmail(email);
            if (adminUidsExisting.includes(existingUser.uid)) {
                warning = 'User is already an admin of this tenant. Invite created but unnecessary.';
            }
        } catch (e) {
            // Only swallow the expected "no Auth account yet" case — the normal
            // pre-registration path. Other errors (network, quota, etc.) must
            // surface so a transient failure doesn't produce a phantom-clean
            // invite without the admin-already check actually running.
            if (e && e.code !== 'auth/user-not-found') throw e;
        }
    }

    // Generate cryptographically-random token. crypto.randomUUID() gives 36 chars.
    const tokenId = crypto.randomUUID().replace(/-/g, '');

    // expiresAt uses Date.now() (host clock) for the +ttl math — serverTimestamp()
    // is a sentinel and cannot be used in arithmetic. createdAt uses
    // serverTimestamp() to match the codebase pattern for audit-only fields.
    const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await db.doc('tenant_invites/' + tokenId).set({
        tenantId,
        email,
        role,
        createdBy: request.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt,
        redeemedAt: null,
        redeemedByUid: null,
        status: 'pending'
    });

    // Build redemption URL. Production frontend lives at hexworth.com.
    const baseUrl = process.env.INVITE_BASE_URL || 'https://hexworth.com';
    const inviteUrl = `${baseUrl}/accept-invite.html?token=${tokenId}`;

    return {
        tokenId,
        inviteUrl,
        expiresAt: expiresAt.toDate().toISOString(),
        tenantId,
        email,
        role,
        warning
    };
});

/**
 * adminListInvites — Lists invites for a tenant (or all pending invites).
 * Input: { tenantId?, status? } — both optional, defaults to all-pending
 */
exports.adminListInvites = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { tenantId, status } = request.data || {};
    let query = db.collection('tenant_invites');
    if (tenantId) query = query.where('tenantId', '==', tenantId);
    if (status)   query = query.where('status', '==', status);
    query = query.orderBy('createdAt', 'desc').limit(100);

    const snap = await query.get();
    const invites = [];
    snap.forEach(d => {
        const data = d.data();
        invites.push({
            tokenId: d.id,
            tenantId: data.tenantId,
            email: data.email,
            role: data.role,
            status: data.status,
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
            expiresAt: data.expiresAt ? data.expiresAt.toDate().toISOString() : null,
            redeemedAt: data.redeemedAt ? data.redeemedAt.toDate().toISOString() : null,
            redeemedByUid: data.redeemedByUid || null
        });
    });
    return { invites };
});

/**
 * adminRevokeInvite — Marks a pending invite as revoked. Idempotent.
 * Input: { tokenId }
 */
exports.adminRevokeInvite = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { tokenId } = request.data || {};
    if (!tokenId || typeof tokenId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tokenId.');
    }
    const ref = db.doc('tenant_invites/' + tokenId);

    // Transactional revoke prevents a redeem-vs-revoke race from overwriting
    // a legitimately redeemed invite with status='revoked' (which would leave
    // the instructor in tenants.adminUids while the audit trail says revoked).
    // Note: Admin SDK only retries transactions on Firestore ABORTED errors;
    // HttpsError thrown inside the callback propagates out without retry.
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new HttpsError('not-found', 'Invite not found.');
        const status = snap.data().status;
        if (status === 'redeemed') {
            throw new HttpsError('failed-precondition', 'Invite already redeemed — cannot revoke.');
        }
        if (status === 'revoked') {
            // Idempotent: silent no-op on already-revoked.
            return;
        }
        tx.update(ref, {
            status: 'revoked',
            revokedAt: admin.firestore.FieldValue.serverTimestamp(),
            revokedBy: request.auth.uid
        });
    });
    return { success: true, tokenId };
});

/**
 * redeemInvite — Called by the instructor after signing in. Validates the
 * token (exists, pending, not expired, email matches auth.token.email),
 * then adds their UID to the tenant's adminUids and marks the invite redeemed.
 *
 * Input: { tokenId }
 * Returns: { success, tenantId, role }
 *
 * Open to any authenticated user — security comes from token possession +
 * email binding. If auth.token.email doesn't match invite.email, reject.
 */
exports.redeemInvite = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { tokenId } = request.data || {};
    if (!tokenId || typeof tokenId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tokenId.');
    }

    const callerEmail = (request.auth.token.email || '').trim().toLowerCase();
    if (!callerEmail) {
        throw new HttpsError('failed-precondition',
            'No email on auth token — sign in with a Google account that has email verified.');
    }

    const inviteRef = db.doc('tenant_invites/' + tokenId);

    // Pre-flight: cheap fail-fast checks (email-binding, role, lazy-expiry) before
    // entering the transaction. Status/concurrency-sensitive checks re-validate
    // INSIDE the transaction to avoid double-redeem races.
    const preSnap = await inviteRef.get();
    if (!preSnap.exists) throw new HttpsError('not-found', 'Invite not found.');
    const preInvite = preSnap.data();

    // Email binding — DO NOT echo the expected email back. URL holders may not be authorized.
    if (callerEmail !== preInvite.email) {
        throw new HttpsError('permission-denied',
            'This invite is for a different email address. Sign out and try a different Google account.');
    }

    if (preInvite.role === 'student') {
        // Reserved for future student-invite flow. Not implemented in v1.
        throw new HttpsError('unimplemented', 'Student invites are not yet supported.');
    }

    // Lazy expiry — flip status outside transaction, then reject.
    // Catch logs but does not block rejection — the user-facing error is unchanged
    // either way, and a swallowed write silently masks rules/permission misconfig.
    if (preInvite.expiresAt && preInvite.expiresAt.toMillis() < Date.now()) {
        if (preInvite.status === 'pending') {
            await inviteRef.update({ status: 'expired' }).catch(e => {
                console.warn('[redeemInvite] lazy-expiry status update failed for token ' + tokenId + ':', e);
            });
        }
        throw new HttpsError('failed-precondition', 'Invite has expired.');
    }

    // Transactional redemption — atomic read-validate-write across invite + tenant docs.
    // Prevents double-redeem races (e.g., two tabs hitting Accept simultaneously).
    const tenantRef = db.doc('tenants/' + preInvite.tenantId);
    const result = await db.runTransaction(async (tx) => {
        const inviteTxSnap = await tx.get(inviteRef);
        if (!inviteTxSnap.exists) throw new HttpsError('not-found', 'Invite not found.');
        const inv = inviteTxSnap.data();
        if (inv.status === 'redeemed') {
            throw new HttpsError('failed-precondition', 'Invite already redeemed.');
        }
        if (inv.status === 'revoked') {
            throw new HttpsError('failed-precondition', 'Invite has been revoked.');
        }
        if (inv.status === 'expired') {
            throw new HttpsError('failed-precondition', 'Invite has expired.');
        }
        // Defense-in-depth: re-check tenant exists inside the tx so a tenant
        // deletion racing with redemption can't trigger set+merge ghost-creation.
        const tenantTxSnap = await tx.get(tenantRef);
        if (!tenantTxSnap.exists) {
            throw new HttpsError('not-found', 'Tenant not found.');
        }
        tx.set(tenantRef, {
            adminUids: admin.firestore.FieldValue.arrayUnion(request.auth.uid),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        tx.update(inviteRef, {
            status: 'redeemed',
            redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
            redeemedByUid: request.auth.uid
        });
        return { tenantId: inv.tenantId, role: inv.role };
    });

    return {
        success: true,
        tenantId: result.tenantId,
        role: result.role
    };
});

// ═══════════════════════════════════════════════════════════════════════════
// CLASS MANAGEMENT — CRUD for tenant classes (Phase 2)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * adminCreateClass — Creates a class under a tenant.
 * Input: { tenantSlug, name, courseId, joinCode, startDate, endDate, settings, instructorUid? }
 */
// Licence check lives in functions/licensing.js so it can be unit-tested without
// booting this bundle. See that file for the model and the why-here reasoning.
const { isCourseLicensed } = require('./licensing');

exports.adminCreateClass = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { tenantSlug, name, courseId, joinCode, startDate, endDate, settings, instructorUid } = request.data || {};

    if (!tenantSlug) throw new HttpsError('invalid-argument', 'Missing tenantSlug.');
    if (!name || typeof name !== 'string') throw new HttpsError('invalid-argument', 'Class name is required.');
    if (!courseId) throw new HttpsError('invalid-argument', 'Course is required.');

    // Validate tenant exists
    const tenantDoc = await db.doc(`tenants/${tenantSlug}`).get();
    if (!tenantDoc.exists) throw new HttpsError('not-found', `Tenant "${tenantSlug}" not found.`);

    // Licence gate. No-op unless this tenant has opted in via licensing.enforce.
    // Fails loudly, to the admin, at the moment of the mistake — and names the two ways out
    // so the message is actionable rather than merely a refusal.
    const licence = isCourseLicensed(tenantDoc.data(), courseId);
    if (!licence.allowed) {
        console.warn(`[licensing] refused class creation: tenant=${tenantSlug} course=${courseId} `
                   + `licensed=${JSON.stringify(licence.licensed)}`);
        throw new HttpsError('failed-precondition',
            `"${tenantSlug}" is not licensed for "${courseId}". `
          + `Licensed courses: ${licence.licensed.join(', ') || '(none)'}. `
          + `Add "${courseId}" to the tenant's licensing.contentAccess.courses, or create this `
          + `class in a tenant that licenses it.`);
    }

    // Generate or validate join code
    let code = (joinCode || '').trim().toUpperCase();
    if (!code || code.length < 4) {
        // Auto-generate: course prefix + 4 random chars
        const prefixMap = { 'network-plus': 'NP', 'cyberops': 'CO', 'aplus-core1': 'A1', 'aplus-core2': 'A2', 'md-100': 'MD', 'md-101': 'ME', 'feh': 'FH', 'python-hub': 'PY', 'python-for-it': 'PI' /* Python for IT (COP1034C) */ };
        const prefix = prefixMap[courseId] || 'HX';
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let rand = '';
        for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
        code = prefix + '-' + rand;
    }

    // Check join code uniqueness across classes and tournaments
    try {
        const existing = await db.collectionGroup('classes')
            .where('joinCode', '==', code)
            .limit(1)
            .get();
        if (!existing.empty) {
            throw new HttpsError('already-exists', `Join code "${code}" is already in use.`);
        }
    } catch (e) {
        // FAILED_PRECONDITION = index still building — skip uniqueness check
        if (e.code === 9 || e.code === 'already-exists') {
            if (e.code === 'already-exists') throw e;
            console.warn('[adminCreateClass] CollectionGroup index not ready, skipping uniqueness check');
        } else {
            throw e;
        }
    }

    try {
        const tournCheck = await db.collection('tournaments')
            .where('joinCode', '==', code)
            .limit(1)
            .get();
        if (!tournCheck.empty) {
            throw new HttpsError('already-exists', `Join code "${code}" conflicts with a tournament.`);
        }
    } catch (e) {
        if (e.code === 'already-exists') throw e;
        console.warn('[adminCreateClass] Tournament check failed, proceeding:', e.message);
    }

    const classDoc = {
        name: name,
        courseId: courseId,
        joinCode: code,
        instructorUid: instructorUid || request.auth.uid,
        instructorEmail: request.auth.token.email || '',
        status: 'active',
        startDate: startDate || null,
        endDate: endDate || null,
        settings: {
            sequentialChapters: settings?.sequentialChapters !== false,
            passingScore: settings?.passingScore || 70,
            requireQuiz: settings?.requireQuiz !== false
        },
        studentCount: 0,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await db.collection(`tenants/${tenantSlug}/classes`).add(classDoc);

    return { classId: ref.id, joinCode: code, message: `Class "${name}" created.` };
});

/**
 * adminListClasses — Lists all classes for a tenant.
 * Input: { tenantSlug }
 */
exports.adminListClasses = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { tenantSlug } = request.data || {};
    if (!tenantSlug) throw new HttpsError('invalid-argument', 'Missing tenantSlug.');

    const snap = await db.collection(`tenants/${tenantSlug}/classes`)
        .orderBy('createdAt', 'desc')
        .get();

    const classes = [];
    snap.forEach(doc => {
        classes.push({ id: doc.id, ...doc.data() });
    });

    return { classes };
});

/**
 * adminUpdateClass — Updates a class within a tenant.
 * Input: { tenantSlug, classId, updates }
 */
exports.adminUpdateClass = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { tenantSlug, classId, updates } = request.data || {};
    if (!tenantSlug || !classId) throw new HttpsError('invalid-argument', 'Missing tenantSlug or classId.');
    if (!updates || typeof updates !== 'object') throw new HttpsError('invalid-argument', 'Updates required.');

    const classRef = db.doc(`tenants/${tenantSlug}/classes/${classId}`);
    const classDoc = await classRef.get();
    if (!classDoc.exists) throw new HttpsError('not-found', 'Class not found.');

    const allowed = ['name', 'status', 'startDate', 'endDate'];
    const firestoreUpdates = { updatedAt: FieldValue.serverTimestamp() };

    allowed.forEach(field => {
        if (updates[field] !== undefined) firestoreUpdates[field] = updates[field];
    });

    if (updates.settings && typeof updates.settings === 'object') {
        if (updates.settings.sequentialChapters !== undefined) firestoreUpdates['settings.sequentialChapters'] = !!updates.settings.sequentialChapters;
        if (updates.settings.passingScore !== undefined) firestoreUpdates['settings.passingScore'] = parseInt(updates.settings.passingScore);
        if (updates.settings.requireQuiz !== undefined) firestoreUpdates['settings.requireQuiz'] = !!updates.settings.requireQuiz;
    }

    await classRef.update(firestoreUpdates);
    return { classId, message: 'Class updated.' };
});

/**
 * adminDeleteClass — Deletes a class and all its progress docs.
 * Input: { tenantSlug, classId }
 */
exports.adminDeleteClass = onCall(cfOptions, async (request) => {
    requireAdmin(request);

    const { tenantSlug, classId } = request.data || {};
    if (!tenantSlug || !classId) throw new HttpsError('invalid-argument', 'Missing tenantSlug or classId.');

    const classRef = db.doc(`tenants/${tenantSlug}/classes/${classId}`);
    const classDoc = await classRef.get();
    if (!classDoc.exists) throw new HttpsError('not-found', 'Class not found.');

    // Delete all progress subdocs first
    const progressSnap = await db.collection(`tenants/${tenantSlug}/classes/${classId}/progress`).get();
    const batch = db.batch();
    progressSnap.forEach(doc => batch.delete(doc.ref));
    batch.delete(classRef);
    await batch.commit();

    return { classId, message: 'Class deleted.' };
});

/**
 * withdrawStudent — Soft-remove a student from a class.
 * Sets status to 'withdrawn' on the progress doc. Data preserved for records.
 * Input: { tenantSlug, classId, studentUid }
 * Callable by: admin or tenant admin (uid in adminUids)
 */
exports.withdrawStudent = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');

    const { tenantSlug, classId, studentUid } = request.data || {};
    if (!tenantSlug || !classId || !studentUid) {
        throw new HttpsError('invalid-argument', 'Missing tenantSlug, classId, or studentUid.');
    }

    // Verify caller is admin or tenant admin
    const tenantDoc = await db.doc(`tenants/${tenantSlug}`).get();
    if (!tenantDoc.exists) throw new HttpsError('not-found', 'Tenant not found.');
    const isAdmin = request.auth.token.admin === true;
    const isTenantAdmin = (tenantDoc.data().adminUids || []).includes(request.auth.uid);
    if (!isAdmin && !isTenantAdmin) {
        throw new HttpsError('permission-denied', 'Only admins can withdraw students.');
    }

    // Mark as withdrawn — preserve all progress data for records
    const progressRef = db.doc(`tenants/${tenantSlug}/classes/${classId}/progress/${studentUid}`);
    const progressDoc = await progressRef.get();
    if (!progressDoc.exists) throw new HttpsError('not-found', 'Student not found in class.');

    await progressRef.update({
        status: 'withdrawn',
        withdrawnAt: FieldValue.serverTimestamp(),
        withdrawnBy: request.auth.uid
    });

    return { success: true, studentUid, action: 'withdrawn' };
});

/**
 * removeStudent — Hard-delete a student from a class.
 * Deletes progress doc and enrollment doc permanently. Decrements student count.
 * Input: { tenantSlug, classId, studentUid }
 * Callable by: admin or tenant admin (uid in adminUids)
 */
exports.removeStudent = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');

    const { tenantSlug, classId, studentUid } = request.data || {};
    if (!tenantSlug || !classId || !studentUid) {
        throw new HttpsError('invalid-argument', 'Missing tenantSlug, classId, or studentUid.');
    }

    // Verify caller is admin or tenant admin
    const tenantDoc = await db.doc(`tenants/${tenantSlug}`).get();
    if (!tenantDoc.exists) throw new HttpsError('not-found', 'Tenant not found.');
    const isAdmin = request.auth.token.admin === true;
    const isTenantAdmin = (tenantDoc.data().adminUids || []).includes(request.auth.uid);
    if (!isAdmin && !isTenantAdmin) {
        throw new HttpsError('permission-denied', 'Only admins can remove students.');
    }

    const batch = db.batch();

    // Delete progress doc
    batch.delete(db.doc(`tenants/${tenantSlug}/classes/${classId}/progress/${studentUid}`));

    // Delete enrollment lookup doc
    batch.delete(db.doc(`enrollments/${studentUid}`));

    // Decrement student count
    batch.update(db.doc(`tenants/${tenantSlug}/classes/${classId}`), {
        studentCount: FieldValue.increment(-1)
    });

    await batch.commit();

    return { success: true, studentUid, action: 'removed' };
});

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED ENROLLMENT — Lobby join code resolution + class enrollment
// ═══════════════════════════════════════════════════════════════════════════

/**
 * resolveJoinCode — Looks up a join code across classes and tournaments.
 * Returns the type and metadata so the lobby knows what to render.
 * Input: { code: string }
 * Returns: { type: 'class'|'tournament'|'not_found', ...metadata }
 */
exports.resolveJoinCode = onCall(cfOptions, async (request) => {
    // No auth required — resolving a code only reads public class metadata
    const { code } = request.data || {};
    if (!code || typeof code !== 'string' || code.trim().length < 4) {
        throw new HttpsError('invalid-argument', 'Join code must be at least 4 characters.');
    }

    const cleanCode = code.trim().toUpperCase();
    const uid = request.auth ? request.auth.uid : null;

    // 1. Check tenant classes (collectionGroup query on 'classes')
    const classSnap = await db.collectionGroup('classes')
        .where('joinCode', '==', cleanCode)
        .where('status', '==', 'active')
        .limit(1)
        .get();

    if (!classSnap.empty) {
        const classDoc = classSnap.docs[0];
        const classData = classDoc.data();
        // Extract tenantId from the document path: tenants/{tenantId}/classes/{classId}
        const pathParts = classDoc.ref.path.split('/');
        const tenantSlug = pathParts[1];

        // Check if student is already enrolled (only if authenticated)
        let alreadyEnrolled = false;
        if (uid) {
            const progressDoc = await db.doc(`tenants/${tenantSlug}/classes/${classDoc.id}/progress/${uid}`).get();
            alreadyEnrolled = progressDoc.exists;
        }

        return {
            type: 'class',
            tenantSlug: tenantSlug,
            classId: classDoc.id,
            className: classData.name || '',
            courseId: classData.courseId || '',
            instructorName: classData.instructorName || '',
            startDate: classData.startDate || null,
            endDate: classData.endDate || null,
            alreadyEnrolled: alreadyEnrolled
        };
    }

    // 2. Check tournaments
    const tournSnap = await db.collection('tournaments')
        .where('joinCode', '==', cleanCode)
        .where('status', 'in', ['lobby', 'active'])
        .limit(1)
        .get();

    if (!tournSnap.empty) {
        const tournDoc = tournSnap.docs[0];
        const tournData = tournDoc.data();
        return {
            type: 'tournament',
            tournamentId: tournDoc.id,
            name: tournData.name || '',
            status: tournData.status,
            teamCount: tournData.teamCount || 0,
            maxTeams: tournData.maxTeams || 32
        };
    }

    // 3. Nothing found
    return { type: 'not_found' };
});

/**
 * enrollInClass — Enrolls an authenticated student in a tenant class.
 * Validates class is active, tenant is active, student not already enrolled,
 * seat limits not exceeded. Writes progress doc scaffold.
 * Input: { tenantSlug, classId }
 */
exports.enrollInClass = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const { tenantSlug, classId, displayName: clientName, callsign: clientCallsign } = request.data || {};
    const uid = request.auth.uid;
    const email = request.auth.token.email || '';
    const displayName = (clientName && clientName.trim()) || request.auth.token.name || email.split('@')[0] || 'Student';
    const callsign = (clientCallsign && clientCallsign.trim()) || '';

    if (!tenantSlug || typeof tenantSlug !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing tenantSlug.');
    }
    if (!classId || typeof classId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing classId.');
    }

    // Verify tenant exists and is active
    const tenantDoc = await db.doc(`tenants/${tenantSlug}`).get();
    if (!tenantDoc.exists) {
        throw new HttpsError('not-found', 'Organization not found.');
    }
    if (tenantDoc.data().status !== 'active') {
        throw new HttpsError('failed-precondition', 'Organization is not active.');
    }

    // Verify class exists and is active
    const classRef = db.doc(`tenants/${tenantSlug}/classes/${classId}`);
    const classDoc = await classRef.get();
    if (!classDoc.exists) {
        throw new HttpsError('not-found', 'Class not found.');
    }
    const classData = classDoc.data();
    if (classData.status !== 'active') {
        throw new HttpsError('failed-precondition', 'This class is not currently accepting enrollments.');
    }

    // Licence gate, defence in depth. adminCreateClass is the primary gate, but classes
    // created BEFORE a tenant opted in are already on disk and would otherwise keep taking
    // enrolments forever. No-op unless licensing.enforce is set.
    //
    // Deliberately worded for a STUDENT, not an admin: they cannot fix a licence and should
    // not be shown its internals. The console line carries the detail an admin needs.
    const enrolLicence = isCourseLicensed(tenantDoc.data(), classData.courseId);
    if (!enrolLicence.allowed) {
        console.warn(`[licensing] refused enrolment: tenant=${tenantSlug} class=${classId} `
                   + `course=${classData.courseId} licensed=${JSON.stringify(enrolLicence.licensed)}`);
        throw new HttpsError('failed-precondition',
            'This class is not available under your organization\'s current licence. '
          + 'Please contact your instructor.');
    }

    // Check seat limits
    const maxSeats = tenantDoc.data().licensing?.maxSeats || 9999;
    const currentCount = classData.studentCount || 0;
    if (currentCount >= maxSeats) {
        throw new HttpsError('resource-exhausted', 'Class is full. Contact your instructor.');
    }

    // Ensure global users/{uid} exists. Runs on EVERY enrollInClass call so
    // re-enrollments of users in the Wendy-pattern state (progress exists,
    // users/ doesn't) get repaired too — not just first-time enrollments.
    // Closes the gap that made the instructor-add search fail for users who
    // join via lobby join-code and never visit dashboard.
    //
    // photoURL pulled from request.auth.token.picture which is set by
    // Google OAuth but NOT by email/password, custom-token, or anonymous
    // providers — falls through to null in those cases (acceptable).
    const userRef = db.doc('users/' + uid);
    const existingUser = await userRef.get();
    if (!existingUser.exists) {
        // Matches FirestoreManager.js:1594-1607 canonical first-visit shape.
        await userRef.set({
            email: email || null,
            displayName: displayName || null,
            photoURL: request.auth.token.picture || null,
            tier: 'free',
            grandfathered: false,
            xp: 0,
            streak: 0,
            modulesCompleted: [],
            labsCompleted: [],
            achievements: [],
            quizzes: {},
            createdAt: FieldValue.serverTimestamp(),
            _profileCreatedBy: 'enrollInClass'
        }, { merge: true });
    }

    // Check if already enrolled
    const progressRef = db.doc(`tenants/${tenantSlug}/classes/${classId}/progress/${uid}`);
    const existingProgress = await progressRef.get();
    if (existingProgress.exists) {
        // Already enrolled — return success without re-writing
        return {
            success: true,
            alreadyEnrolled: true,
            tenantSlug,
            classId,
            courseId: classData.courseId || ''
        };
    }

    // Enroll: write progress doc scaffold + increment student count
    const batch = db.batch();

    batch.set(progressRef, {
        displayName: displayName,
        callsign: callsign,
        email: email,
        isGuest: !email || request.auth.token.firebase?.sign_in_provider === 'anonymous',
        enrolledAt: FieldValue.serverTimestamp(),
        lastActive: FieldValue.serverTimestamp(),
        currentChapter: 1,
        chaptersCompleted: [],
        modulesCompleted: [],
        quizScores: {},
        labsCompleted: [],
        totalTimeSpent: 0
    });

    batch.update(classRef, {
        studentCount: FieldValue.increment(1)
    });

    // Write enrollment lookup doc — allows any page to discover this
    // student's tenant/class without depending on localStorage.
    // Read by syncClassProgress CF and client-side tenant context restore.
    //
    // Multi-enrollment: enrollments are stored as an array so a student
    // can be in multiple classes simultaneously. Each entry has
    // { tenantSlug, classId, courseId, enrolledAt }. Progress syncs to
    // the class whose courseId matches the completed module.
    const enrollRef = db.doc(`enrollments/${uid}`);
    const enrollSnap = await enrollRef.get();
    const newEntry = {
        tenantSlug: tenantSlug,
        classId: classId,
        courseId: classData.courseId || ''
    };

    if (enrollSnap.exists) {
        const existingData = enrollSnap.data();

        // Migration: if old single-enrollment format, convert to array
        if (!existingData.enrollments && existingData.tenantSlug) {
            const legacyEntry = {
                tenantSlug: existingData.tenantSlug,
                classId: existingData.classId,
                courseId: existingData.courseId || ''
            };
            // Start fresh array with the legacy entry + the new one
            const entries = [legacyEntry];
            // Only add new entry if it's not a duplicate of the legacy one
            if (legacyEntry.classId !== newEntry.classId) {
                entries.push(newEntry);
            }
            batch.set(enrollRef, { enrollments: entries });
        } else {
            // Already array format — add if not duplicate
            const existing = existingData.enrollments || [];
            const alreadyHas = existing.some(e => e.classId === newEntry.classId);
            if (!alreadyHas) {
                batch.update(enrollRef, {
                    enrollments: FieldValue.arrayUnion(newEntry)
                });
            }
        }
    } else {
        // First enrollment for this student
        batch.set(enrollRef, { enrollments: [newEntry] });
    }

    await batch.commit();

    return {
        success: true,
        alreadyEnrolled: false,
        tenantSlug,
        classId,
        courseId: classData.courseId || '',
        className: classData.name || ''
    };
});

/**
 * syncClassProgress — Student submits a module or quiz completion to their class progress.
 * Input: { moduleId, type: 'module'|'quiz'|'lab', score? }
 *   Optional: { tenantSlug, classId } — if omitted, looks up from enrollments/{uid}
 * Merges into the student's progress doc at tenants/{slug}/classes/{classId}/progress/{uid}
 */
exports.syncClassProgress = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    let { tenantSlug, classId, moduleId, type, score } = request.data || {};
    const uid = request.auth.uid;

    if (!moduleId) {
        throw new HttpsError('invalid-argument', 'Missing moduleId.');
    }

    // Multi-enrollment: if tenant/class not provided by client, look up
    // from enrollments/{uid} and sync to ALL enrolled classes.
    // If client provides specific tenant/class, sync only to that one.
    const targets = []; // Array of { tenantSlug, classId } to sync to

    if (tenantSlug && classId) {
        // Client specified exactly which class — use it directly
        targets.push({ tenantSlug, classId });
    } else {
        // Look up all enrollments and sync to each one
        const enrollDoc = await db.doc(`enrollments/${uid}`).get();
        if (!enrollDoc.exists) {
            return { success: false, reason: 'not_enrolled' };
        }
        const enrollData = enrollDoc.data();

        // Handle both old single-enrollment format and new array format
        if (enrollData.enrollments && Array.isArray(enrollData.enrollments)) {
            enrollData.enrollments.forEach(e => {
                targets.push({ tenantSlug: e.tenantSlug, classId: e.classId });
            });
        } else if (enrollData.tenantSlug && enrollData.classId) {
            // Legacy single-enrollment format
            targets.push({ tenantSlug: enrollData.tenantSlug, classId: enrollData.classId });
        }
    }

    if (targets.length === 0) {
        return { success: false, reason: 'no_enrollment_found' };
    }

    // Sync progress to each enrolled class
    let synced = 0;
    for (const target of targets) {
        const progressRef = db.doc(`tenants/${target.tenantSlug}/classes/${target.classId}/progress/${uid}`);
        const progressDoc = await progressRef.get();

        if (!progressDoc.exists) {
            // Not enrolled in this class — skip
            continue;
        }

        const updates = {
            lastActive: FieldValue.serverTimestamp()
        };

        if (type === 'quiz' && score !== undefined) {
            updates[`quizScores.${moduleId}`] = Number(score);
        }

        if (type === 'module' || type === 'presentation' || type === 'tool') {
            updates.modulesCompleted = FieldValue.arrayUnion(moduleId);
        }

        if (type === 'lab') {
            updates.labsCompleted = FieldValue.arrayUnion(moduleId);
        }

        await progressRef.update(updates);
        synced++;
    } // end for-each enrolled class

    return { success: synced > 0, moduleId, type, classesUpdated: synced };
});

// ═══════════════════════════════════════════════════════════════════════════
// SIGNAL C2 — Command & Control for Hardware Projects
// ═══════════════════════════════════════════════════════════════════════════
// Real backend for the C2 dashboard. Devices (ESP32, Arduino, Pi) call
// these endpoints to register, check in, receive commands, and report
// results. Dashboard operators use dispatch to send commands.
//
// Auth model:
//   Devices: Bearer token (deviceKey) generated at registration
//   Dashboard: Firebase Auth (admin only)
//
// Firestore collections:
//   c2_devices/{deviceId}     — registered devices + latest status
//   c2_commands/{commandId}   — command queue + results
//   c2_logs/{deviceId}/entries — activity log
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a secure device key and ID.
 */
function generateDeviceCredentials() {
    const id = 'd_' + crypto.randomBytes(4).toString('hex');
    const key = 'sk_' + crypto.randomBytes(24).toString('hex');
    return { id, key };
}

/**
 * Validate a device key against Firestore.
 * Returns the device doc if valid, throws if not.
 */
async function validateDeviceKey(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer sk_')) {
        throw new HttpsError('unauthenticated', 'Missing or invalid device key.');
    }
    const key = authHeader.replace('Bearer ', '');

    // Look up device by key
    const snap = await db.collection('c2_devices')
        .where('deviceKey', '==', key)
        .limit(1)
        .get();

    if (snap.empty) {
        throw new HttpsError('permission-denied', 'Invalid device key.');
    }
    return snap.docs[0];
}

/**
 * c2Register — Register a new hardware device.
 *
 * Called once when a device is first provisioned.
 * Returns a deviceId and deviceKey for all future communication.
 */
exports.c2Register = onRequest(cfOptions, async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    try {
        const { deviceType, projectId, name, firmware, capabilities } = req.body;

        if (!deviceType || !name) {
            res.status(400).json({ error: 'deviceType and name are required.' });
            return;
        }

        // Generate credentials
        const creds = generateDeviceCredentials();

        // Determine check-in intervals based on device type
        const intervals = {
            esp32:   { checkIn: 30, commandPoll: 5 },
            arduino: { checkIn: 60, commandPoll: 10 },
            pi:      { checkIn: 15, commandPoll: 3 },
            ducky:   { checkIn: 10, commandPoll: 2 }
        };
        const interval = intervals[deviceType] || intervals.esp32;

        // Store in Firestore
        await db.doc(`c2_devices/${creds.id}`).set({
            deviceId: creds.id,
            deviceKey: creds.key,
            name: name,
            type: deviceType,
            projectId: projectId || null,
            firmware: firmware || '0.0.0',
            capabilities: capabilities || [],
            status: 'registered',
            lastCheckIn: null,
            ip: null,
            rssi: null,
            uptime: 0,
            freeHeap: null,
            sensors: {},
            checkInInterval: interval.checkIn,
            commandPollInterval: interval.commandPoll,
            registeredAt: FieldValue.serverTimestamp()
        });

        // Log registration
        await db.collection(`c2_logs/${creds.id}/entries`).add({
            type: 'registration',
            timestamp: FieldValue.serverTimestamp(),
            data: { deviceType, projectId, name, firmware }
        });

        res.status(201).json({
            deviceId: creds.id,
            deviceKey: creds.key,
            checkInInterval: interval.checkIn,
            commandPollInterval: interval.commandPoll
        });
    } catch (e) {
        console.error('c2Register error:', e);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

/**
 * c2CheckIn — Device heartbeat.
 *
 * Called every N seconds by the device. Reports status, IP, sensors.
 * Returns ack + pending command count.
 */
exports.c2CheckIn = onRequest(cfOptions, async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    try {
        const deviceDoc = await validateDeviceKey(req.headers.authorization);
        const { uptime, ip, rssi, freeHeap, firmware, sensors } = req.body;
        const deviceId = deviceDoc.id;

        // Update device status
        await deviceDoc.ref.update({
            status: 'online',
            lastCheckIn: FieldValue.serverTimestamp(),
            uptime: uptime || 0,
            ip: ip || null,
            rssi: rssi || null,
            freeHeap: freeHeap || null,
            firmware: firmware || deviceDoc.data().firmware,
            sensors: sensors || {}
        });

        // Count pending commands for this device
        const pendingSnap = await db.collection('c2_commands')
            .where('deviceId', '==', deviceId)
            .where('status', '==', 'pending')
            .get();

        res.json({ ack: true, pendingCommands: pendingSnap.size });
    } catch (e) {
        if (e instanceof HttpsError) { res.status(403).json({ error: e.message }); return; }
        console.error('c2CheckIn error:', e);
        res.status(500).json({ error: 'Check-in failed.' });
    }
});

/**
 * c2GetCommands — Device fetches pending commands.
 *
 * Returns all pending commands for the device, marks them as delivered.
 */
exports.c2GetCommands = onRequest(cfOptions, async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

    try {
        const deviceDoc = await validateDeviceKey(req.headers.authorization);
        const deviceId = deviceDoc.id;

        // Get pending commands
        const snap = await db.collection('c2_commands')
            .where('deviceId', '==', deviceId)
            .where('status', '==', 'pending')
            .orderBy('issuedAt', 'asc')
            .get();

        const commands = [];
        const batch = db.batch();

        snap.forEach(doc => {
            const data = doc.data();

            // Check expiry
            if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
                batch.update(doc.ref, { status: 'expired' });
                return;
            }

            commands.push({
                commandId: doc.id,
                action: data.action,
                params: data.params || {},
                issuedAt: data.issuedAt ? data.issuedAt.toDate().toISOString() : null
            });

            // Mark as delivered
            batch.update(doc.ref, {
                status: 'delivered',
                deliveredAt: FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        res.json({ commands });
    } catch (e) {
        if (e instanceof HttpsError) { res.status(403).json({ error: e.message }); return; }
        console.error('c2GetCommands error:', e);
        res.status(500).json({ error: 'Failed to fetch commands.' });
    }
});

/**
 * c2Result — Device reports command execution result.
 *
 * Called after a device executes a command. Stores the result and
 * updates the command status.
 */
exports.c2Result = onRequest(cfOptions, async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    try {
        const deviceDoc = await validateDeviceKey(req.headers.authorization);
        const { commandId, status, result, executionTime } = req.body;

        if (!commandId || !status) {
            res.status(400).json({ error: 'commandId and status are required.' });
            return;
        }

        // Verify the command belongs to this device
        const cmdRef = db.doc(`c2_commands/${commandId}`);
        const cmdDoc = await cmdRef.get();

        if (!cmdDoc.exists || cmdDoc.data().deviceId !== deviceDoc.id) {
            res.status(404).json({ error: 'Command not found for this device.' });
            return;
        }

        // Update command with result
        await cmdRef.update({
            status: status === 'success' ? 'completed' : status,
            result: result || null,
            executionTime: executionTime || null,
            completedAt: FieldValue.serverTimestamp()
        });

        // Log the result
        await db.collection(`c2_logs/${deviceDoc.id}/entries`).add({
            type: 'command-result',
            timestamp: FieldValue.serverTimestamp(),
            data: {
                commandId,
                action: cmdDoc.data().action,
                status,
                executionTime,
                resultSize: result ? JSON.stringify(result).length : 0
            }
        });

        res.json({ ack: true });
    } catch (e) {
        if (e instanceof HttpsError) { res.status(403).json({ error: e.message }); return; }
        console.error('c2Result error:', e);
        res.status(500).json({ error: 'Failed to store result.' });
    }
});

/**
 * c2Dispatch — Dashboard operator sends a command to a device.
 *
 * Requires Firebase admin authentication. Queues a command for the
 * specified device to pick up on its next poll.
 */
exports.c2Dispatch = onCall(cfOptions, async (request) => {
    // Require admin
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
    const email = request.auth.token.email || '';
    const isAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email);
    if (!isAdmin) throw new HttpsError('permission-denied', 'Admin access required.');

    const { deviceId, action, params, ttl } = request.data;

    if (!deviceId || !action) {
        throw new HttpsError('invalid-argument', 'deviceId and action are required.');
    }

    // Verify the device exists
    const deviceDoc = await db.doc(`c2_devices/${deviceId}`).get();
    if (!deviceDoc.exists) {
        throw new HttpsError('not-found', `Device ${deviceId} not found.`);
    }
    const devData = deviceDoc.data();

    // Capability gate: the device's declared capabilities array MUST
    // include the requested action, AND the action must be in the
    // server-side allowlist for the device's type. A device declaring
    // capabilities: [] used to bypass this check entirely — that was
    // the gap Nancy caught 2026-05-17. Hardened now: both client-side
    // declaration and server-side type allowlist must agree.
    if (!ALLOWED_C2_ACTIONS_BY_TYPE[devData.type || 'esp32']) {
        throw new HttpsError('invalid-argument',
            `Unknown device type "${devData.type}" — no server-side capability allowlist defined.`);
    }
    const serverAllowed = ALLOWED_C2_ACTIONS_BY_TYPE[devData.type || 'esp32'];
    if (!serverAllowed.includes(action)) {
        throw new HttpsError('invalid-argument',
            `Action "${action}" is not in the server-side allowlist for device type "${devData.type}". Allowed: ${serverAllowed.join(', ')}`);
    }
    const declaredCaps = devData.capabilities || [];
    if (declaredCaps.length === 0) {
        throw new HttpsError('failed-precondition',
            `Device ${deviceId} declared empty capabilities at register time. Re-flash with a non-empty capabilities array to use C2 dispatch.`);
    }
    if (!declaredCaps.includes(action)) {
        throw new HttpsError('invalid-argument',
            `Device ${deviceId} did not declare action "${action}" at register time. Declared: ${declaredCaps.join(', ')}`);
    }

    // Calculate expiry
    const ttlSeconds = ttl || 300; // default 5 minutes
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    // Create command
    const cmdRef = await db.collection('c2_commands').add({
        deviceId,
        action,
        params: params || {},
        status: 'pending',
        issuedAt: FieldValue.serverTimestamp(),
        expiresAt,
        issuedBy: request.auth.uid,
        result: null,
        deliveredAt: null,
        completedAt: null,
        executionTime: null
    });

    // Log the dispatch
    await db.collection(`c2_logs/${deviceId}/entries`).add({
        type: 'command-dispatched',
        timestamp: FieldValue.serverTimestamp(),
        data: {
            commandId: cmdRef.id,
            action,
            params: params || {},
            issuedBy: email,
            ttl: ttlSeconds
        }
    });

    return { commandId: cmdRef.id, queued: true };
});

/**
 * c2ListDevices — Dashboard lists all registered devices.
 *
 * Returns all devices with their current status. Admin only.
 */
exports.c2ListDevices = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
    const email = request.auth.token.email || '';
    const isAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email);
    if (!isAdmin) throw new HttpsError('permission-denied', 'Admin access required.');

    const snap = await db.collection('c2_devices')
        .orderBy('lastCheckIn', 'desc')
        .get();

    const devices = [];
    const now = Date.now();

    snap.forEach(doc => {
        const data = doc.data();
        // Determine online/offline/stale status based on last check-in
        let liveStatus = 'offline';
        if (data.lastCheckIn) {
            const lastMs = data.lastCheckIn.toMillis();
            const intervalMs = (data.checkInInterval || 30) * 1000;
            const elapsed = now - lastMs;
            if (elapsed < intervalMs * 2) liveStatus = 'online';
            else if (elapsed < intervalMs * 10) liveStatus = 'stale';
            else liveStatus = 'offline';
        } else {
            liveStatus = 'registered'; // never checked in
        }

        devices.push({
            deviceId: doc.id,
            name: data.name,
            type: data.type,
            projectId: data.projectId,
            firmware: data.firmware,
            capabilities: data.capabilities,
            status: liveStatus,
            lastCheckIn: data.lastCheckIn ? data.lastCheckIn.toDate().toISOString() : null,
            ip: data.ip,
            rssi: data.rssi,
            uptime: data.uptime,
            sensors: data.sensors,
            registeredAt: data.registeredAt ? data.registeredAt.toDate().toISOString() : null
        });
    });

    return { devices, count: devices.length };
});

// ─── C2 Pairing Codes ───────────────────────────────────────────
// Production hardening for /c2Register. Instead of accepting any
// POST to /c2Register (open-enrollment), a device can call
// /c2RegisterWithCode with a one-time admin-issued pairing code.
// The legacy /c2Register endpoint stays open for backwards compat
// with already-deployed firmware; new firmware should prefer the
// authenticated path.
//
// Code shape: HEX-PAIR-XK7A2P  (HEX-PAIR- prefix + 6 chars from a
// 32-symbol no-look-alike alphabet — no I/O/0/1).
//
// Firestore: /c2_pairing_codes/{code} with { createdAt, createdBy,
// createdByEmail, label, ttlSeconds, expiresAt, usedAt, usedByDeviceId }.
// Rule: admin read; CF-only writes. Single document per code.

// Server-side authoritative allowlist of C2 actions per device type.
// A device's declared `capabilities` array (set at register time) is
// intersected with this allowlist in c2Dispatch — both must include
// the requested action for dispatch to succeed. New actions get added
// here when the firmware on a device type implements them.
const ALLOWED_C2_ACTIONS_BY_TYPE = Object.freeze({
    esp32:   ['ping', 'echo', 'blink', 'reboot'],
    arduino: ['ping', 'echo'],
    pi:      ['ping', 'echo', 'reboot'],
    ducky:   ['ping', 'echo'],
});

const PAIRING_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generatePairingCodeString() {
    const bytes = crypto.randomBytes(6);
    let body = '';
    for (let i = 0; i < 6; i++) body += PAIRING_ALPHABET[bytes[i] % PAIRING_ALPHABET.length];
    return 'HEX-PAIR-' + body;
}

/**
 * c2GeneratePairingCode — Admin generates a one-time pairing code.
 *
 * Returns { code, expiresAt, ttlSeconds }. Operator hands the code
 * to whoever is provisioning the device; they paste it into the
 * captive-portal form. Code is single-use, expires after ttlSeconds.
 */
exports.c2GeneratePairingCode = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
    const email = request.auth.token.email || '';
    const isAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email);
    if (!isAdmin) throw new HttpsError('permission-denied', 'Admin access required.');

    const { ttl, label } = request.data || {};
    // Clamp ttl: minimum 60s (1 minute) to maximum 86400s (24 hours).
    // Default 1800s (30 minutes) is the operator-walks-to-device window.
    const ttlSeconds = Math.min(Math.max(parseInt(ttl, 10) || 1800, 60), 86400);

    const code = generatePairingCodeString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await db.doc(`c2_pairing_codes/${code}`).set({
        code,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request.auth.uid,
        createdByEmail: email,
        label: typeof label === 'string' ? label.slice(0, 80) : null,
        ttlSeconds,
        expiresAt,
        usedAt: null,
        usedByDeviceId: null,
    });

    return { code, expiresAt: expiresAt.toISOString(), ttlSeconds };
});

/**
 * c2RequestStudentPairingCode — Authenticated student mints a code for
 * their own device. Same code shape and lifecycle as the admin path; the
 * difference is that the code carries ownerUid = caller, and the device
 * doc inherits that ownerUid at register time so the student can read
 * their own device via Firestore rules.
 *
 * Rate limit: 1 active code at a time, 3 codes per rolling 24h window.
 * Both the rate-limit state read and the new-code write happen inside
 * a single Firestore transaction so two concurrent calls cannot bypass
 * the active-code invariant.
 */
exports.c2RequestStudentPairingCode = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
    const uid = request.auth.uid;
    const email = request.auth.token.email || '';
    const ttlSeconds = 1800;
    const now = Date.now();
    const expiresAt = new Date(now + ttlSeconds * 1000);
    const stateRef = db.doc(`student_pairing_state/${uid}`);

    const txResult = await db.runTransaction(async (tx) => {
        const stateDoc = await tx.get(stateRef);
        const state = stateDoc.exists ? stateDoc.data() : { last24h: [], activeCodeId: null };

        if (state.activeCodeId) {
            const activeRef = db.doc(`c2_pairing_codes/${state.activeCodeId}`);
            const activeDoc = await tx.get(activeRef);
            if (activeDoc.exists) {
                const d = activeDoc.data();
                const exp = d.expiresAt && d.expiresAt.toDate ? d.expiresAt.toDate().getTime() : 0;
                if (!d.usedAt && exp > now) {
                    return { error: 'You already have an active pairing code. Use it or wait for it to expire.', status: 'failed-precondition' };
                }
            }
        }

        const cutoff = now - 24 * 60 * 60 * 1000;
        const prunedLast24h = (state.last24h || [])
            .map(t => t && t.toMillis ? t.toMillis() : (typeof t === 'number' ? t : new Date(t).getTime()))
            .filter(t => t > cutoff);
        if (prunedLast24h.length >= 3) {
            return { error: 'Rate limit: 3 pairing codes per 24 hours.', status: 'resource-exhausted' };
        }

        const code = generatePairingCodeString();
        const codeRef = db.doc(`c2_pairing_codes/${code}`);

        tx.set(codeRef, {
            code,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: uid,
            createdByEmail: email,
            label: null,
            ttlSeconds,
            expiresAt,
            usedAt: null,
            usedByDeviceId: null,
            ownerUid: uid,
            issuedTo: 'student',
        });

        tx.set(stateRef, {
            activeCodeId: code,
            last24h: [...prunedLast24h.map(t => new Date(t)), new Date(now)],
            updatedAt: FieldValue.serverTimestamp(),
        });

        return { code, expiresAt: expiresAt.toISOString(), ttlSeconds };
    });

    if (txResult.error) {
        throw new HttpsError(txResult.status, txResult.error);
    }
    return { code: txResult.code, expiresAt: txResult.expiresAt, ttlSeconds: txResult.ttlSeconds };
});

/**
 * c2RegisterWithCode — Device registers using an admin-issued code.
 *
 * Same response shape as /c2Register (deviceId + deviceKey + intervals)
 * so the firmware-side switch is just a different URL plus the new
 * pairingCode field in the request body.
 *
 * Transactional: code lookup + mark-used + device-create happen in
 * one Firestore transaction so two devices can't redeem the same
 * code in a race.
 */
exports.c2RegisterWithCode = onRequest(cfOptions, async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    try {
        const { pairingCode, deviceType, name, projectId, firmware, capabilities } = req.body || {};

        if (!pairingCode || !deviceType || !name) {
            res.status(400).json({ error: 'pairingCode, deviceType, and name are required.' });
            return;
        }

        // Normalize code (uppercase, strip whitespace, allow user to type
        // 'hex-pair-xk7a2p' or with stray dashes).
        const normalizedCode = String(pairingCode).toUpperCase().replace(/\s+/g, '');

        const intervals = {
            esp32:   { checkIn: 30, commandPoll: 5 },
            arduino: { checkIn: 60, commandPoll: 10 },
            pi:      { checkIn: 15, commandPoll: 3 },
            ducky:   { checkIn: 10, commandPoll: 2 }
        };
        const interval = intervals[deviceType] || intervals.esp32;

        const codeRef = db.doc(`c2_pairing_codes/${normalizedCode}`);
        const txResult = await db.runTransaction(async (tx) => {
            const codeDoc = await tx.get(codeRef);
            if (!codeDoc.exists) {
                return { error: 'Unknown pairing code.', status: 403 };
            }
            const data = codeDoc.data();
            if (data.usedAt) {
                return { error: 'Pairing code already used.', status: 403 };
            }
            if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
                return { error: 'Pairing code expired.', status: 403 };
            }

            const ownerUid = data.ownerUid || null;
            const isStudentCode = !!(ownerUid && data.issuedTo === 'student');
            const stateRef = isStudentCode ? db.doc(`student_pairing_state/${ownerUid}`) : null;
            const stateDoc = stateRef ? await tx.get(stateRef) : null;

            const creds = generateDeviceCredentials();

            tx.set(db.doc(`c2_devices/${creds.id}`), {
                deviceId: creds.id,
                deviceKey: creds.key,
                name: name,
                type: deviceType,
                projectId: projectId || null,
                firmware: firmware || '0.0.0',
                capabilities: capabilities || [],
                status: 'registered',
                lastCheckIn: null,
                ip: null,
                rssi: null,
                uptime: 0,
                freeHeap: null,
                sensors: {},
                checkInInterval: interval.checkIn,
                commandPollInterval: interval.commandPoll,
                registeredAt: FieldValue.serverTimestamp(),
                registeredViaPairingCode: normalizedCode,
                pairingCodeCreatedBy: data.createdBy,
                ownerUid,
            });

            tx.update(codeRef, {
                usedAt: FieldValue.serverTimestamp(),
                usedByDeviceId: creds.id,
            });

            if (stateRef && stateDoc && stateDoc.exists && stateDoc.data().activeCodeId === normalizedCode) {
                tx.update(stateRef, {
                    activeCodeId: null,
                    updatedAt: FieldValue.serverTimestamp(),
                });
            }

            return {
                status: 201,
                deviceId: creds.id,
                deviceKey: creds.key,
                checkInInterval: interval.checkIn,
                commandPollInterval: interval.commandPoll,
            };
        });

        if (txResult.error) {
            res.status(txResult.status).json({ error: txResult.error });
            return;
        }

        // Log the registration (best-effort, outside the transaction)
        try {
            await db.collection(`c2_logs/${txResult.deviceId}/entries`).add({
                type: 'registration',
                timestamp: FieldValue.serverTimestamp(),
                data: {
                    deviceType,
                    name,
                    firmware,
                    via: 'c2RegisterWithCode',
                    pairingCode: normalizedCode,
                }
            });
        } catch (e) { /* non-critical */ }

        res.status(201).json({
            deviceId: txResult.deviceId,
            deviceKey: txResult.deviceKey,
            checkInInterval: txResult.checkInInterval,
            commandPollInterval: txResult.commandPollInterval,
        });
    } catch (e) {
        console.error('c2RegisterWithCode error:', e);
        res.status(500).json({ error: 'Registration failed.' });
    }
});

/**
 * c2DecommissionDevice — Owner removes their own device from the fleet.
 *
 * Drops the c2_devices/{deviceId} doc, breaking the deviceId/deviceKey
 * pairing on the backend side. The physical device keeps running with
 * its NVS-stored credentials but its next check-in will get HTTP 404
 * and effectively go offline against this backend. To bring it back
 * online, the student factory-resets WiFi (BOOT-hold 5s) and re-pairs
 * with a fresh pairing code, registering as a new c2_devices/{id}.
 *
 * This is the v1 "device management" action. Real in-place key
 * rotation (preserving deviceId) requires firmware that knows the new
 * rekey endpoint; that ships with a future firmware revision and gets
 * paired with c2RequestRekeyCode at that time.
 *
 * Owner-only: the caller must be the device's ownerUid OR an admin.
 * Admin-issued devices (ownerUid == null) can only be removed by admins.
 */
exports.c2DecommissionDevice = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
    const uid = request.auth.uid;
    const email = request.auth.token.email || '';
    const isAdmin = request.auth.token.admin === true || ADMIN_EMAILS.includes(email);

    const { deviceId } = request.data || {};
    if (!deviceId) throw new HttpsError('invalid-argument', 'deviceId is required.');

    const devRef = db.doc(`c2_devices/${deviceId}`);
    const devSnap = await devRef.get();
    if (!devSnap.exists) {
        throw new HttpsError('not-found', `Device ${deviceId} not found.`);
    }
    const dev = devSnap.data();

    if (!isAdmin && dev.ownerUid !== uid) {
        throw new HttpsError('permission-denied',
            `You are not the owner of device ${deviceId}.`);
    }

    // Log the decommission before the delete so we keep an audit trail.
    try {
        await db.collection(`c2_logs/${deviceId}/entries`).add({
            type: 'decommission',
            timestamp: FieldValue.serverTimestamp(),
            data: {
                actorUid: uid,
                actorEmail: email,
                actorIsAdmin: isAdmin,
                deviceName: dev.name || null,
                ownerUid: dev.ownerUid || null,
            }
        });
    } catch (e) { /* audit logging is best-effort */ }

    await devRef.delete();
    return { decommissioned: true, deviceId };
});

// ─── The Wire: Discord Tournament Notifications ─────────────────
// Non-blocking. Fire-and-forget. Never throws — a failed notification
// must never block a flag submission.

async function sendWireNotification(embed) {
    if (!DISCORD_WEBHOOK_URL) return;
    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        if (!response.ok) {
            console.warn('[Wire] Discord webhook failed:', response.status);
        }
    } catch (err) {
        console.warn('[Wire] Discord notification error:', err.message);
    }
}

// ─── CTF Tournament: Flag Submission ──────────────────────────────
// Server-side flag validation for CTF tournaments.
// Hashes the submitted flag with the challenge's salt and compares
// to the stored hash. Updates team score and challenge solveCount.

exports.ctfSubmitFlag = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');

    const { tournamentId, challengeId, flag } = request.data || {};
    if (!tournamentId || !challengeId || !flag) {
        throw new HttpsError('invalid-argument', 'tournamentId, challengeId, and flag are required.');
    }

    const uid = request.auth.uid;

    // 1. Load tournament — verify it's active or frozen
    const tRef = db.collection('tournaments').doc(tournamentId);
    const tSnap = await tRef.get();
    if (!tSnap.exists) throw new HttpsError('not-found', 'Tournament not found.');
    const tournament = tSnap.data();

    if (tournament.status !== 'active' && tournament.status !== 'frozen') {
        throw new HttpsError('failed-precondition', 'Tournament is not accepting submissions.');
    }

    // 2. Find which team this user belongs to
    const teamsSnap = await tRef.collection('teams').get();
    let userTeamId = null;
    let userTeamData = null;
    teamsSnap.forEach(doc => {
        const data = doc.data();
        if (data.members && data.members.includes(uid)) {
            userTeamId = doc.id;
            userTeamData = data;
        }
    });

    if (!userTeamId) {
        throw new HttpsError('failed-precondition', 'You are not on a team in this tournament.');
    }

    // 3. Check if team already solved this challenge
    if (userTeamData.solves && userTeamData.solves.includes(challengeId)) {
        throw new HttpsError('already-exists', 'Your team already solved this challenge.');
    }

    /* ── 4. RATE LIMITING (TOURN-04, rewritten 2026-08-29) ────────────────────────────────
     * The old rule was "max 1 submission per team per challenge per 10 seconds", implemented
     * as a query followed several awaits later by a write. It had TWO independent bypasses,
     * both proven rather than theorised:
     *
     *   1. IT WAS SCOPED TO team+challenge, so rotating the challenge escaped it entirely.
     *      Measured against PRODUCTION: one user pushed 12 guesses across 12 challenges in
     *      922ms, roughly 13/s, unbounded. That is an online brute-force channel.
     *   2. IT WAS CHECK-THEN-ACT, with nothing serialising concurrent callers. Measured in the
     *      emulator: five teammates submitting the same challenge simultaneously were ALL
     *      accepted; the limit held for zero of five.
     *
     * Both are closed here, and they need different mechanisms because they are different
     * attacks. A per-user budget does nothing about five DIFFERENT users racing one challenge,
     * and a per-team+challenge lock does nothing about one user rotating targets. So both
     * counters are read and written inside ONE transaction, which is also what makes them
     * immune to the race: the loser of a concurrent pair re-reads and sees the winner's write.
     *
     * The counters live in their own docs rather than being derived from the submissions
     * collection, because a query cannot be transactional against documents that do not exist
     * yet — which is precisely why the original was racy.
     *
     * rateLimits/* is Cloud-Functions-only at the rules layer; no client can read its own
     * budget, let alone reset it.
     */
    // FIXED window, not sliding, and the distinction is not pedantry (Nancy, 2026-08-29).
    // The counter resets to `now` once the window expires, which is the classic
    // boundary-burst counter: she proved it by rewinding windowStart and landing 8 more
    // immediately, so the true worst case is ~16 requests straddling a boundary, not 8.
    // Called "sliding" in the first draft, which mis-described the guarantee to whoever read
    // it next. Accepted deliberately: the attacker still waits out ~50s to set it up, and the
    // bug this replaces was ~13/s UNBOUNDED. If 8/60s is ever needed as a hard ceiling rather
    // than an amortised average, this has to become a real sliding log of timestamps.
    const RL_USER_WINDOW_MS = 60000;
    const RL_USER_MAX = 8;             // generous for real play, useless for brute force
    const RL_TEAM_CHALLENGE_MS = 10000; // unchanged from the original rule

    const rlUserRef = tRef.collection('rateLimits').doc(`u_${uid}`);
    const rlPairRef = tRef.collection('rateLimits').doc(`tc_${userTeamId}_${challengeId}`);

    try {
        await db.runTransaction(async (tx) => {
            const [uSnap, pSnap] = await Promise.all([tx.get(rlUserRef), tx.get(rlPairRef)]);
            const now = Date.now();

            // (a) Same team, same challenge, inside the cooldown. Serialised, so a burst of
            //     teammates cannot all read "no recent submission" and all proceed.
            const lastPair = pSnap.exists ? (pSnap.data().lastAt || 0) : 0;
            if (now - lastPair < RL_TEAM_CHALLENGE_MS) {
                const e = new Error('RL_PAIR'); e.code = 'RL_PAIR'; throw e;
            }

            // (b) Per-USER window, which the old rule had no concept of. This is the one that
            //     stops challenge rotation.
            const u = uSnap.exists ? uSnap.data() : {};
            let windowStart = u.windowStart || 0;
            let count = u.count || 0;
            if (now - windowStart >= RL_USER_WINDOW_MS) { windowStart = now; count = 0; }
            if (count >= RL_USER_MAX) {
                const e = new Error('RL_USER'); e.code = 'RL_USER';
                e.retryIn = Math.ceil((RL_USER_WINDOW_MS - (now - windowStart)) / 1000);
                throw e;
            }

            tx.set(rlPairRef, { lastAt: now, teamId: userTeamId, challengeId }, { merge: true });
            tx.set(rlUserRef, { windowStart, count: count + 1, lastAt: now }, { merge: true });
        });
    } catch (e) {
        if (e && e.code === 'RL_PAIR') {
            throw new HttpsError('resource-exhausted', 'Too fast. Wait 10 seconds between attempts on this challenge.');
        }
        if (e && e.code === 'RL_USER') {
            throw new HttpsError('resource-exhausted',
                `Too many attempts. Wait ${e.retryIn || 60} seconds before submitting again.`);
        }
        // Firestore retries a contended transaction a finite number of times (default 5). If
        // that is exhausted under a heavier burst than the 5-way case tested, the error is
        // neither RL_PAIR nor RL_USER and used to fall through as a raw `internal` — a student
        // mid-event would see an unexplained failure during exactly the contention this limit
        // exists for. Map it to the same retryable answer the throttle gives.
        if (e && (e.code === 10 || e.code === 'ABORTED' || /transaction|contention|too much contention/i.test(String(e.message || '')))) {
            console.warn('[ctfSubmitFlag] rate-limit transaction exhausted retries:', e.message);
            throw new HttpsError('resource-exhausted', 'Server busy. Try that again in a moment.');
        }
        throw e;
    }

    // 5. Load challenge and verify flag
    const chRef = tRef.collection('challenges').doc(challengeId);
    const chSnap = await chRef.get();
    if (!chSnap.exists) throw new HttpsError('not-found', 'Challenge not found.');
    const challenge = chSnap.data();

    /* A challenge the admin has not revealed is NOT solvable, and this is the only place that
     * can enforce it. `visible` was filtered in client JS only (tournament-board.html), while
     * firestore.rules grants `allow read: if true` on the whole challenges subcollection — so an
     * UNAUTHENTICATED Firestore REST GET returns a hidden challenge's title, description, hints
     * and flagHash, and this function then happily credited it. Proven in an adversarial audit:
     * a hidden challenge was read with no token at all, then scored for full points while every
     * other team could not see it existed. That turns a phased reveal into a head start for
     * whoever probes the API first.
     *
     * Refused as not-found rather than permission-denied: confirming "this id exists but is
     * hidden" is itself the reveal, and lets someone enumerate the unreleased set.
     *
     * Missing `visible` is treated as VISIBLE, so existing challenges that predate the field
     * keep working — this must not retroactively hide live content.
     */
    if (challenge.visible === false) {
        throw new HttpsError('not-found', 'Challenge not found.');
    }

    // Hash the submitted flag with the challenge's salt
    const submittedHash = 'sha256:' + crypto
        .createHash('sha256')
        .update(challenge.flagSalt + ':' + flag)
        .digest('hex');

    const correct = submittedHash === challenge.flagHash;

    // 6. Record the submission
    await tRef.collection('submissions').add({
        teamId: userTeamId,
        teamName: userTeamData.name || 'Unknown',
        challengeId: challengeId,
        /* NEVER store the raw flag of a CORRECT submission. tournaments/{id}/submissions is
           `allow read: if request.auth != null` (firestore.rules) because the ungated live
           broadcast board needs the feed — so any signed-in user could read every team's
           winning flag and replay it. Storing the answer next to `correct: true` turned the
           submission log into an answer key.
           Incorrect guesses are retained: they are not answers, and they are the useful half
           for reviewing suspected cheating. */
        submittedFlag: correct ? null : flag,
        correct: correct,
        points: correct ? (challenge.currentPoints || challenge.points || 0) : 0,
        submittedBy: uid,
        submittedByName: request.auth.token.name || request.auth.token.email || uid,
        timestamp: FieldValue.serverTimestamp()
    });

    // 7. If correct — update team score, challenge solveCount, tournament stats
    if (correct) {
        /* ── THE CREDIT CLAIM IS A TRANSACTION, NOT A READ-THEN-WRITE ──────────────────────
         * The already-solved check at step 3 and the score write below used to be separated by
         * several awaits, with no transaction anywhere. Two teammates submitting the same
         * correct flag within milliseconds BOTH read "not yet solved" and BOTH credited.
         * Proven live: a two-member team scored 1500 for two challenges worth 1000.
         *
         * It was also invisible. `solves` uses arrayUnion, which de-duplicates the id, so the
         * team's solves array looked correct and only the score was wrong — nobody reading the
         * board would see it.
         *
         * solveCount had the same defect independently: read-modify-write meant a raced pair
         * recorded ONE solve, and currentPoints was then computed from that undercount, so the
         * dynamic-decay curve was wrong for every later solver of that challenge too.
         *
         * All of it now happens inside one transaction that RE-READS the team and challenge.
         * The transaction's own read of solves is the authoritative check: the loser of a race
         * sees the winner's write and aborts. Same serialization pattern ctfJoinTeam already
         * uses correctly for rosterLocks.
         */
        const teamRef = tRef.collection('teams').doc(userTeamId);
        let pointsAwarded = 0;

        try {
            pointsAwarded = await db.runTransaction(async (tx) => {
                const [teamNow, chNow] = await Promise.all([tx.get(teamRef), tx.get(chRef)]);

                const solvesNow = (teamNow.exists && teamNow.data().solves) || [];
                if (solvesNow.includes(challengeId)) {
                    // Someone else on this team won the race. Not an error the player caused.
                    const e = new Error('ALREADY_SOLVED'); e.code = 'ALREADY_SOLVED'; throw e;
                }

                const chData = chNow.exists ? chNow.data() : {};
                const award = chData.currentPoints || chData.points || 0;

                tx.update(teamRef, {
                    score: FieldValue.increment(award),
                    solves: FieldValue.arrayUnion(challengeId),
                    lastSolveTime: FieldValue.serverTimestamp()
                });

                // Derived INSIDE the transaction from the value just read, so concurrent solves
                // of the same challenge by DIFFERENT teams cannot both compute from one count.
                const newSolveCount = (chData.solveCount || 0) + 1;
                const chUpdate = { solveCount: newSolveCount };
                if (tournament.scoringModel === 'dynamic' && tournament.dynamicConfig) {
                    const cfg = tournament.dynamicConfig;
                    const initial = cfg.initialPoints || 500;
                    const floor = cfg.minPoints || 50;
                    const decay = cfg.decayRate || 0.85;
                    chUpdate.currentPoints = Math.max(floor, Math.floor(initial * Math.pow(decay, newSolveCount)));
                }
                tx.update(chRef, chUpdate);

                return award;
            });
        } catch (e) {
            if (e && e.code === 'ALREADY_SOLVED') {
                throw new HttpsError('already-exists', 'Your team already solved this challenge.');
            }
            throw e;
        }

        // Record individual flag capture + sync profile
        await db.doc(`users/${uid}/flag_captures/${tournamentId}_${challengeId}`).set({
            boxId: tournamentId,
            flagId: challengeId,
            capturedAt: FieldValue.serverTimestamp(),
            source: 'tournament'
        });
        // Server-authoritative recompute of BOTH counters — see _recomputeCtfStats.
        await _recomputeCtfStats(uid);

        /* solveCount and currentPoints are now written INSIDE the transaction above, derived
         * from the value read there. The read-modify-write that used to live here is deleted,
         * not kept alongside it: running both would increment twice and re-corrupt the decay
         * curve this fix exists to protect. */

        // Update tournament stats
        await tRef.update({
            totalSubmissions: FieldValue.increment(1),
            totalSolves: FieldValue.increment(1)
        });

        // ── The Wire: broadcast flag capture to Discord ──
        // Non-blocking — don't await. A failed notification never blocks the response.
        const teamDoc = await tRef.collection('teams').doc(userTeamId).get();
        const teamName = teamDoc.exists ? (teamDoc.data().name || userTeamId) : userTeamId;
        const teamScore = teamDoc.exists ? (teamDoc.data().score || 0) : 0;
        const wirePayload = {
            type: 'flag_capture',
            team: teamName,
            teamId: userTeamId,
            challenge: challengeId,
            points: pointsAwarded,
            totalScore: teamScore,
            timestamp: FieldValue.serverTimestamp()
        };

        // Firestore live feed (in-platform tournament board reads this)
        tRef.collection('notifications').add(wirePayload).catch(() => {});

        /* Discord webhook (external feed) — SILENCED DURING A FREEZE.
         *
         * `frozen` is a deliberate endgame mechanic: the board, podium and broadcast all stop
         * showing standings so the final placings are a surprise. This webhook fired
         * unconditionally, posting team, challenge, points and RUNNING TOTAL to Discord — so
         * anyone watching that channel saw exactly what the freeze exists to hide, and had a
         * live-score advantage over everyone honouring it in-platform.
         *
         * The in-platform notifications feed above is left alone: the board applies the freeze
         * itself when rendering, and that feed is also what the post-freeze reveal replays.
         */
        if (tournament.status !== 'frozen') {
            sendWireNotification({
                title: 'FLAG CAPTURED',
                color: 3066993,
                fields: [
                    { name: 'Team', value: teamName, inline: true },
                    { name: 'Challenge', value: challengeId, inline: true },
                    { name: 'Points', value: '+' + pointsAwarded + ' (Total: ' + teamScore + ')', inline: true }
                ],
                footer: { text: 'Hexworth Prime // The Wire' },
                timestamp: new Date().toISOString()
            }).catch(() => {});
        }

        return {
            correct: true,
            points: pointsAwarded,
            message: 'Correct! +' + pointsAwarded + ' points'
        };
    }

    // 8. Incorrect — just increment submission count
    await tRef.update({
        totalSubmissions: FieldValue.increment(1)
    });

    return {
        correct: false,
        points: 0,
        message: 'Incorrect flag.'
    };
});

// ─── CTF: Team join / leave (Model B self-service, server-validated) ──────────────
// Teams are admin-write-only at the rules layer (BUG-024); a client cannot securely self-join
// the parallel members[]/memberNames[] arrays (BUG-026). These callables run with the admin SDK
// (bypassing rules) and validate the self-join/leave server-side, so a user can only add/remove
// THEMSELVES. members[] and memberNames[] are kept index-aligned inside a transaction (push/splice
// both together), binding each name to its uid positionally without a schema change.

// Resolve a display name the way the lobby does: profile callsign > displayName > token > uid.
async function _resolveUserName(uid, token) {
    try {
        const snap = await db.collection('users').doc(uid).get();
        if (snap.exists) {
            const d = snap.data();
            return d.callsign || d.displayName || (token && token.name) || (token && token.email) || uid;
        }
    } catch (e) { /* fall through to token */ }
    return (token && token.name) || (token && token.email) || uid;
}

exports.ctfJoinTeam = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
    const { tournamentId, teamId, joinCode } = request.data || {};
    if (!tournamentId || !teamId) throw new HttpsError('invalid-argument', 'tournamentId and teamId are required.');
    // Validate the path segments — the CF is the sole write authority now (BUG-024), so it must
    // enforce the slug shape itself (a '/' in teamId would change the Firestore path depth). Same
    // guard the client uses for the doc id (safeId), applied server-side.
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(tournamentId) || !/^[A-Za-z0-9_-]{1,128}$/.test(teamId)) {
        throw new HttpsError('invalid-argument', 'Invalid tournament or team id.');
    }
    const uid = request.auth.uid;

    const tRef = db.collection('tournaments').doc(tournamentId);
    const tSnap = await tRef.get();
    if (!tSnap.exists) throw new HttpsError('not-found', 'Tournament not found.');
    const tournament = tSnap.data();
    if (tournament.status !== 'lobby' && tournament.status !== 'active') {
        throw new HttpsError('failed-precondition', 'Team registration is closed for this tournament.');
    }

    /* ── THE JOIN CODE IS NOW A GATE (TOURN-03, 2026-08-29) ────────────────────────────────
     * It previously gated NOTHING. This function did not accept a joinCode parameter at all,
     * the lobby page had no prompt for one, and the only use of the value anywhere in the
     * system was as a salt ingredient. Participation was controlled solely by
     * `request.auth != null` — which anonymous sign-in satisfies — so anyone who listed the
     * public `tournaments` collection could join any event they found. Proven in an audit: an
     * "invite only" tournament was discovered with no prior link and joined with no code.
     *
     * READ FROM THE PRIVATE DOC, NOT THE TOURNAMENT DOC. `tournaments/{id}` is
     * `allow read: if true` so the podium and lobby work pre-auth; a code stored there is
     * published, not secret. The authoritative copy lives at `tournaments/{id}/private/config`,
     * which rules deny to every client (Cloud Functions use the admin SDK and bypass rules).
     *
     * TOURNAMENTS CREATED BEFORE THIS FIX have no private doc. They fall back to the legacy
     * public field so a live event does not break the moment this deploys — and that fallback
     * is deliberately NOT a silent one: it logs, so the gap is visible rather than permanent.
     * Those tournaments are no more exposed than they were yesterday; new ones are gated.
     */
    let expectedCode = null;
    let codeSource = 'none';
    try {
        const privSnap = await tRef.collection('private').doc('config').get();
        if (privSnap.exists && privSnap.data().joinCode) {
            expectedCode = String(privSnap.data().joinCode);
            codeSource = 'private';
        }
    } catch (e) {
        // A read failure must not silently downgrade to the public value — that would turn an
        // outage into an auth bypass. Fail closed.
        console.error('[ctfJoinTeam] private config read failed:', e.message);
        throw new HttpsError('internal', 'Could not verify the join code. Try again.');
    }
    if (expectedCode === null && tournament.joinCode) {
        expectedCode = String(tournament.joinCode);
        codeSource = 'legacy-public';
        console.warn(`[ctfJoinTeam] tournament ${tournamentId} has no private config; falling back to the PUBLIC joinCode. Re-save it in the admin console to close this.`);
    }
    if (expectedCode !== null) {
        const supplied = typeof joinCode === 'string' ? joinCode.trim() : '';
        // Case-insensitive: the admin console accepts any case and students retype these by
        // hand off a projector. Comparing case-sensitively would reject correct codes.
        if (supplied.toLowerCase() !== expectedCode.trim().toLowerCase()) {
            throw new HttpsError('permission-denied', 'That join code is not correct for this tournament.');
        }
    } else if (tournament.hasJoinCode === true) {
        /* THE TOURNAMENT SAYS IT HAS A CODE AND WE CANNOT FIND ONE — REFUSE.
         *
         * Nancy, 2026-08-29: creation is two round trips. `addDoc` writes the tournament with
         * hasJoinCode:true, then a second `setDoc` writes private/config. A network blip between
         * them leaves a tournament that ADVERTISES a code, has no private doc, and no legacy
         * public field either (that write was removed). Falling through to "no code configured,
         * open as before" would silently reopen the exact hole this whole change closes, while
         * the admin console still displays "set (see Manage)".
         *
         * Enforced HERE rather than by rolling back in the browser, because a client-side
         * rollback cannot cover a tab that was closed mid-write. The server refuses on the
         * INTENT recorded in the document, which survives any client failure.
         */
        console.error(`[ctfJoinTeam] tournament ${tournamentId} declares hasJoinCode but no code exists — refusing all joins. Re-save the join code in the admin console.`);
        throw new HttpsError('failed-precondition',
            'This tournament is not fully configured yet. Ask your instructor to re-save its join code.');
    } else {
        // No code configured and none claimed: the tournament genuinely never had one. Open,
        // as it was before this change.
        console.warn(`[ctfJoinTeam] tournament ${tournamentId} has NO join code at all — joining is ungated.`);
    }

    // One team per user: reject if already on a DIFFERENT team in this tournament.
    const teamsSnap = await tRef.collection('teams').get();
    let existing = null;
    teamsSnap.forEach(d => { const m = d.data().members; if (Array.isArray(m) && m.includes(uid)) existing = d.id; });
    if (existing === teamId) return { ok: true, teamId }; // idempotent — consistent shape with all return paths
    if (existing) throw new HttpsError('failed-precondition', 'You are already on a team in this tournament. Leave it first.');

    const name = await _resolveUserName(uid, request.auth.token);
    const maxSize = tournament.maxTeamSize || 4;
    const teamRef = tRef.collection('teams').doc(teamId);
    const lockRef = tRef.collection('rosterLocks').doc(uid);

    // Transaction serializes per-user on the rosterLock doc (one lock = one team claim), so
    // concurrent joins to DIFFERENT teams cannot flood multiple rosters (a real registration-DoS,
    // since per-team transactions don't serialize against each other). Also re-checks team-full.
    await db.runTransaction(async (tx) => {
        const lockSnap = await tx.get(lockRef);
        const snap = await tx.get(teamRef);
        if (!snap.exists) throw new HttpsError('not-found', 'Team not found.');
        if (lockSnap.exists) {
            if (lockSnap.data().teamId === teamId) return; // idempotent — already on this team
            throw new HttpsError('failed-precondition', 'You are already on a team in this tournament. Leave it first.');
        }
        const team = snap.data();
        const members = Array.isArray(team.members) ? team.members.slice() : [];
        const memberNames = Array.isArray(team.memberNames) ? team.memberNames.slice() : [];
        // Legacy member (in members[] but no lock, e.g. admin-assigned): backfill the lock, no dup.
        if (members.includes(uid)) { tx.set(lockRef, { teamId, joinedAt: FieldValue.serverTimestamp() }); return; }
        if (members.length >= maxSize) throw new HttpsError('failed-precondition', 'That team is full.');
        members.push(uid);
        memberNames.push(name);
        tx.set(lockRef, { teamId, joinedAt: FieldValue.serverTimestamp() });
        tx.update(teamRef, { members, memberNames });
    });
    return { ok: true, teamId };
});

exports.ctfLeaveTeam = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
    const { tournamentId, teamId } = request.data || {};
    if (!tournamentId || !teamId) throw new HttpsError('invalid-argument', 'tournamentId and teamId are required.');
    // Validate the path segments — the CF is the sole write authority now (BUG-024), so it must
    // enforce the slug shape itself (a '/' in teamId would change the Firestore path depth). Same
    // guard the client uses for the doc id (safeId), applied server-side.
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(tournamentId) || !/^[A-Za-z0-9_-]{1,128}$/.test(teamId)) {
        throw new HttpsError('invalid-argument', 'Invalid tournament or team id.');
    }
    const uid = request.auth.uid;

    const tRef = db.collection('tournaments').doc(tournamentId);
    const tSnap = await tRef.get();
    if (!tSnap.exists) throw new HttpsError('not-found', 'Tournament not found.');
    const tournament = tSnap.data();
    // Leaving is allowed only before the tournament starts (matches the lobby's leave button,
    // shown for 'lobby'/'draft'). Once active, rosters are locked.
    if (tournament.status !== 'lobby' && tournament.status !== 'draft') {
        throw new HttpsError('failed-precondition', 'You can only leave a team before the tournament starts.');
    }

    const teamRef = tRef.collection('teams').doc(teamId);
    const lockRef = tRef.collection('rosterLocks').doc(uid);
    // Transaction removes uid + its index-aligned name from the roster and releases the lock. Also
    // RECOVERS a stranded user: if the team doc is gone (admin deleted it) or the admin removed the
    // user from members[] directly, still release a lock that points at this team — so a user can
    // never be permanently locked out of the tournament with no self-service path.
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(teamRef);
        const lockSnap = await tx.get(lockRef);
        const lockHere = lockSnap.exists && lockSnap.data().teamId === teamId;
        if (!snap.exists) {
            if (lockHere) { tx.delete(lockRef); return; } // team deleted — free the stuck lock
            throw new HttpsError('not-found', 'Team not found.');
        }
        const team = snap.data();
        const members = Array.isArray(team.members) ? team.members.slice() : [];
        const memberNames = Array.isArray(team.memberNames) ? team.memberNames.slice() : [];
        const membersLenBefore = members.length;
        const idx = members.indexOf(uid);
        if (idx === -1) {
            if (lockHere) { tx.delete(lockRef); return; } // not in members but stale lock points here — release it
            throw new HttpsError('failed-precondition', 'You are not on that team.');
        }
        members.splice(idx, 1);
        // Remove the index-aligned name only when the arrays were parallel (always true for
        // CF-managed teams); on a legacy/misaligned doc, leave memberNames alone rather than
        // splice a wrong name — members (authoritative) is still corrected.
        if (memberNames.length === membersLenBefore && idx < memberNames.length) memberNames.splice(idx, 1);
        tx.update(teamRef, { members, memberNames });
        tx.delete(lockRef); // release the roster lock (no-op if absent)
    });
    return { ok: true, teamId };
});

// ─── EDT: Ethical Decision Training Lab Submission ───────────────

/**
 * submitEDTLab — Receives and stores a completed Case Room investigation.
 *
 * Payload (from EDTEngine._doSubmit):
 *   labId                  — config.id, e.g. 'eth-l01'
 *   evidenceTags           — { [evId]: { tag, note } }
 *   stakeholderSelections  — string[]
 *   decisionId             — chosen decision ID
 *   frameworkResponse      — free text
 *   codeRanking            — ordered provision ref string[]
 *   codeConflictResponse   — free text
 *   autoScores             — { evidence, stakeholder, codeConflict }
 *
 * Writes to: edt_submissions/{labId}_{uid}
 * Marks frameworkResponse + codeConflictResponse for instructor review.
 * Auto-scores evidence quality and stakeholder depth (included in payload).
 */
exports.submitEDTLab = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const data = request.data || {};

    const {
        labId,
        evidenceTags,
        stakeholderSelections,
        decisionId,
        frameworkResponse,
        codeRanking,
        codeConflictResponse,
        autoScores
    } = data;

    // ── Input validation ──────────────────────────────────
    if (!labId || typeof labId !== 'string' || labId.length > 64) {
        throw new HttpsError('invalid-argument', 'Invalid labId.');
    }

    if (!decisionId || typeof decisionId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing decisionId.');
    }

    if (!frameworkResponse || typeof frameworkResponse !== 'string' || frameworkResponse.trim().length < 80) {
        throw new HttpsError('invalid-argument', 'Framework response must be at least 80 characters.');
    }

    if (!codeConflictResponse || typeof codeConflictResponse !== 'string' || codeConflictResponse.trim().length < 80) {
        throw new HttpsError('invalid-argument', 'Code conflict response must be at least 80 characters.');
    }

    if (!Array.isArray(stakeholderSelections) || stakeholderSelections.length === 0) {
        throw new HttpsError('invalid-argument', 'Stakeholder selections required.');
    }

    if (!Array.isArray(codeRanking) || codeRanking.length === 0) {
        throw new HttpsError('invalid-argument', 'Code ranking required.');
    }

    // ── Rate limiting: 3 submissions per lab per hour ─────
    const subRef = db.collection(`users/${uid}/edt_attempts`);
    try {
        const recent = await subRef
            .where('labId', '==', labId)
            .where('timestamp', '>', new Date(Date.now() - 3600000))
            .get();
        if (recent.size >= 3) {
            throw new HttpsError('resource-exhausted',
                'Too many submissions for this lab. Wait an hour before resubmitting.');
        }
    } catch (e) {
        if (e instanceof HttpsError) throw e;
        console.warn('[EDT] Rate limit query failed:', e.message);
    }

    // Log attempt
    subRef.add({
        labId,
        timestamp: FieldValue.serverTimestamp()
    }).catch(e => console.warn('[EDT] Attempt log failed:', e.message));

    // ── Sanitize free text fields (server-side strip) ─────
    const sanitize = (str, max) =>
        typeof str === 'string' ? str.replace(/<[^>]*>/g, '').trim().slice(0, max) : '';

    const cleanFramework = sanitize(frameworkResponse, 3000);
    const cleanConflict  = sanitize(codeConflictResponse, 2000);

    // ── Sanitize evidenceTags ─────────────────────────────
    const cleanTags = {};
    const validTagValues = new Set(['relevant', 'irrelevant', 'contested']);
    if (evidenceTags && typeof evidenceTags === 'object') {
        for (const [evId, tag] of Object.entries(evidenceTags)) {
            if (typeof evId === 'string' && evId.length < 10 &&
                tag && validTagValues.has(tag.tag)) {
                cleanTags[evId] = {
                    tag: tag.tag,
                    note: sanitize(tag.note || '', 500)
                };
            }
        }
    }

    // ── Sanitize stakeholder selections ──────────────────
    const cleanStakeholders = Array.isArray(stakeholderSelections)
        ? stakeholderSelections.filter(s => typeof s === 'string' && s.length < 8).slice(0, 20)
        : [];

    // ── Sanitize code ranking ─────────────────────────────
    const cleanRanking = Array.isArray(codeRanking)
        ? codeRanking.filter(r => typeof r === 'string' && r.length < 30).slice(0, 10)
        : [];

    // ── Validate auto-scores (sanity bounds) ──────────────
    const cleanAutoScores = {
        evidence:     Math.min(20, Math.max(0, parseInt((autoScores || {}).evidence) || 0)),
        stakeholder:  Math.min(20, Math.max(0, parseInt((autoScores || {}).stakeholder) || 0)),
        codeConflict: Math.min(20, Math.max(0, parseInt((autoScores || {}).codeConflict) || 0))
    };

    // ── Fetch user callsign for instructor display ────────
    const userDoc = await db.doc(`users/${uid}`).get();
    const callsign = userDoc.exists ? (userDoc.data().callsign || 'Anonymous') : 'Anonymous';

    // ── Check reset count for instructor visibility ────────
    let resetCount = 0;
    try {
        const resetSnap = await db.doc(`users/${uid}/edt_resets/${labId}`).get();
        if (resetSnap.exists) resetCount = resetSnap.data().count || 0;
    } catch (e) { /* non-critical */ }

    // ── Write submission document ─────────────────────────
    const docId = labId + '_' + uid;
    await db.doc(`edt_submissions/${docId}`).set({
        labId,
        uid,
        callsign,
        resetCount,
        submittedAt:           FieldValue.serverTimestamp(),
        decisionId,
        evidenceTags:          cleanTags,
        stakeholderSelections: cleanStakeholders,
        frameworkResponse:     cleanFramework,
        codeRanking:           cleanRanking,
        codeConflictResponse:  cleanConflict,
        autoScores:            cleanAutoScores,
        // Flags for instructor grading workflow
        needsInstructorReview: true,
        frameworkGraded:       false,
        conflictGraded:        false,
        instructorScore:       null,
        instructorFeedback:    null
    }, { merge: false });

    // ── Record lab completion via recordProgress ──────────
    await db.doc(`users/${uid}`).set({
        labsCompleted: FieldValue.arrayUnion(labId),
        updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return {
        success: true,
        docId,
        autoScores: cleanAutoScores
    };
});

// ─── EDT: Student Reset ──────────────────────────────────────────

/**
 * resetEDTSubmission — Student resets their own Case Room submission.
 *
 * Deletes the edt_submissions document and increments a reset counter
 * so instructors can see how many times the student started over.
 * Does NOT clear edt_attempts (rate-limit history persists).
 */
exports.resetEDTSubmission = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const labId = (request.data || {}).labId;

    if (!labId || typeof labId !== 'string' || labId.length > 64) {
        throw new HttpsError('invalid-argument', 'Invalid labId.');
    }

    const docId = labId + '_' + uid;
    const docRef = db.doc(`edt_submissions/${docId}`);

    // Verify the document exists and belongs to this user
    const snap = await docRef.get();
    if (!snap.exists) {
        throw new HttpsError('not-found', 'No submission found for this lab.');
    }
    if (snap.data().uid !== uid) {
        throw new HttpsError('permission-denied', 'Cannot reset another user\'s submission.');
    }

    // Check reset count before transaction
    const resetRef = db.doc(`users/${uid}/edt_resets/${labId}`);
    const resetSnap = await resetRef.get();
    const currentCount = resetSnap.exists ? (resetSnap.data().count || 0) : 0;

    if (currentCount >= 5) {
        throw new HttpsError('resource-exhausted',
            'Maximum resets reached for this lab. Contact your instructor.');
    }

    // Atomic transaction: delete submission + increment counter + update profile
    await db.runTransaction(async (t) => {
        t.delete(docRef);
        t.set(resetRef, {
            count: currentCount + 1,
            lastResetAt: FieldValue.serverTimestamp()
        }, { merge: true });
        t.update(db.doc(`users/${uid}`), {
            labsCompleted: FieldValue.arrayRemove(labId)
        });
    });

    return {
        success: true,
        resetCount: currentCount + 1,
        remaining: 5 - (currentCount + 1)
    };
});

// ─── EDT: Instructor Grading ─────────────────────────────────────

/**
 * gradeEDTSubmission — Instructor grades a student's framework response.
 *
 * Auth: must be authenticated with handler or admin claim.
 * Writes frameworkScore, frameworkFeedback, frameworkGraded, finalTotal
 * to the edt_submissions/{docId} document.
 *
 * Payload:
 *   docId              — e.g. 'eth-l01_uid123'
 *   frameworkScore     — integer 0-40
 *   frameworkFeedback  — string, max 2000 chars
 *   finalTotal         — integer, pre-computed by client (server re-validates)
 */
exports.gradeEDTSubmission = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    // Must be a handler or admin
    const isHandler = request.auth.token.handler === true || request.auth.token.admin === true;
    if (!isHandler) {
        throw new HttpsError('permission-denied', 'Handler role required.');
    }

    const { docId, frameworkScore, frameworkFeedback, finalTotal } = request.data || {};

    // ── Input validation ──────────────────────────────────
    if (!docId || typeof docId !== 'string' || docId.length > 128) {
        throw new HttpsError('invalid-argument', 'Invalid docId.');
    }

    const score = parseInt(frameworkScore, 10);
    if (isNaN(score) || score < 0 || score > 40) {
        throw new HttpsError('invalid-argument', 'frameworkScore must be 0-40.');
    }

    const feedback = typeof frameworkFeedback === 'string'
        ? frameworkFeedback.replace(/<[^>]*>/g, '').trim().slice(0, 2000)
        : '';

    if (feedback.length === 0) {
        throw new HttpsError('invalid-argument', 'frameworkFeedback is required.');
    }

    const instructorUid = request.auth.uid;

    // ── Fetch submission doc ──────────────────────────────
    const subRef  = db.doc('edt_submissions/' + docId);
    const subSnap = await subRef.get();

    if (!subSnap.exists) {
        throw new HttpsError('not-found', 'Submission document not found.');
    }

    const subData = subSnap.data();

    // ── Verify this handler owns a class containing the student ──
    // We check by querying classes where handlerUid == instructor and
    // the student uid is a member. If no class found, deny.
    const studentUid = subData.uid;

    if (!studentUid) {
        throw new HttpsError('internal', 'Submission missing student uid.');
    }

    // Handler-class ownership check
    const classesSnap = await db.collection('classes')
        .where('handlerUid', '==', instructorUid)
        .get();

    let authorized = false;

    // Check each class for member doc
    const memberChecks = classesSnap.docs.map(classDoc =>
        db.doc('classes/' + classDoc.id + '/members/' + studentUid).get()
    );
    const memberResults = await Promise.all(memberChecks);
    authorized = memberResults.some(snap => snap.exists);

    // Admin bypass
    if (!authorized && request.auth.token.admin === true) {
        authorized = true;
    }

    if (!authorized) {
        throw new HttpsError('permission-denied', 'Student not in any of your classes.');
    }

    // ── Re-validate finalTotal server-side ───────────────
    const auto       = subData.autoScores || {};
    const evScore    = Math.min(20, Math.max(0, auto.evidence    || 0));
    const stScore    = Math.min(20, Math.max(0, auto.stakeholder || 0));
    const codeScore  = Math.min(20, Math.max(0, auto.codeConflict || 0));
    const calcTotal  = evScore + stScore + score + codeScore;

    // Accept client-provided total only if it matches server calculation
    // (client has the same formula — this is a sanity gate, not blind trust)
    const validatedTotal = calcTotal;

    // ── Write grade to submission doc ────────────────────
    await subRef.update({
        frameworkScore:    score,
        frameworkFeedback: feedback,
        frameworkGraded:   true,
        finalTotal:        validatedTotal,
        gradedBy:          instructorUid,
        gradedAt:          FieldValue.serverTimestamp(),
        needsInstructorReview: false
    });

    return { success: true, finalTotal: validatedTotal };
});

/**
 * togglePeerView — Instructor enables/disables peer view for a lab.
 *
 * Auth: handler or admin required.
 * Writes peerViewEnabled (true/false) to edt_lab_config/{labId}.
 *
 * Payload:
 *   labId    — lab configuration ID (e.g. 'eth-l01')
 *   enabled  — boolean
 */
exports.togglePeerView = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const isHandler = request.auth.token.handler === true || request.auth.token.admin === true;
    if (!isHandler) {
        throw new HttpsError('permission-denied', 'Handler role required.');
    }

    const { labId, enabled } = request.data || {};

    if (!labId || typeof labId !== 'string' || labId.length > 64) {
        throw new HttpsError('invalid-argument', 'Invalid labId.');
    }

    if (typeof enabled !== 'boolean') {
        throw new HttpsError('invalid-argument', 'enabled must be a boolean.');
    }

    const instructorUid = request.auth.uid;

    await db.doc('edt_lab_config/' + labId).set({
        peerViewEnabled: enabled,
        peerViewUpdatedBy: instructorUid,
        peerViewUpdatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, labId, peerViewEnabled: enabled };
});

/**
 * getUngradedEDTSubmissions — Returns ungraded submissions for the handler's classes.
 *
 * Auth: handler or admin required.
 * Returns submissions where frameworkGraded == false for classes
 * owned by the requesting handler.
 */
exports.getUngradedEDTSubmissions = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const isHandler = request.auth.token.handler === true || request.auth.token.admin === true;
    if (!isHandler) {
        throw new HttpsError('permission-denied', 'Handler role required.');
    }

    const instructorUid = request.auth.uid;

    // Get all student UIDs in this handler's classes
    const classesSnap = await db.collection('classes')
        .where('handlerUid', '==', instructorUid)
        .get();

    if (classesSnap.empty) {
        return { submissions: [] };
    }

    // Collect all member UIDs across classes
    const memberUids = new Set();
    const memberFetches = [];

    classesSnap.docs.forEach(classDoc => {
        memberFetches.push(
            db.collection('classes/' + classDoc.id + '/members').get()
                .then(snap => snap.forEach(m => memberUids.add(m.id)))
        );
    });
    await Promise.all(memberFetches);

    if (memberUids.size === 0) {
        return { submissions: [] };
    }

    // Query ungraded EDT submissions — Firestore 'in' supports up to 30 values
    // Chunk if needed
    const uidArray   = Array.from(memberUids);
    const CHUNK      = 30;
    const allSubs    = [];

    for (let i = 0; i < uidArray.length; i += CHUNK) {
        const chunk = uidArray.slice(i, i + CHUNK);
        const snap  = await db.collection('edt_submissions')
            .where('uid', 'in', chunk)
            .where('frameworkGraded', '==', false)
            .orderBy('submittedAt', 'desc')
            .limit(100)
            .get();

        snap.forEach(d => {
            const data = d.data();
            // Return only fields needed for the grading list + grading view
            // Full content fields (frameworkResponse, evidenceTags) are included
            // for the grading view — sanitized on submission, safe to return here.
            allSubs.push({
                docId:                 d.id,
                labId:                 data.labId,
                uid:                   data.uid,
                callsign:              data.callsign,
                submittedAt:           data.submittedAt,
                decisionId:            data.decisionId,
                evidenceTags:          data.evidenceTags,
                stakeholderSelections: data.stakeholderSelections,
                frameworkResponse:     data.frameworkResponse,
                codeRanking:           data.codeRanking,
                codeConflictResponse:  data.codeConflictResponse,
                autoScores:            data.autoScores
            });
        });
    }

    return { submissions: allSubs };
});

/**
 * getEDTAggregates — Returns all submissions for a lab for aggregate display.
 *
 * Auth: handler or admin required.
 * Returns non-PII aggregate data for the requested labId.
 */
exports.getEDTAggregates = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const isHandler = request.auth.token.handler === true || request.auth.token.admin === true;
    if (!isHandler) {
        throw new HttpsError('permission-denied', 'Handler role required.');
    }

    const { labId } = request.data || {};

    if (!labId || typeof labId !== 'string' || labId.length > 64) {
        throw new HttpsError('invalid-argument', 'Invalid labId.');
    }

    const snap = await db.collection('edt_submissions')
        .where('labId', '==', labId)
        .get();

    const submissions = [];
    snap.forEach(d => {
        const data = d.data();
        // Return only what the charts need — no student UIDs, no free text
        submissions.push({
            decisionId:            data.decisionId,
            stakeholderSelections: data.stakeholderSelections,
            evidenceTags:          data.evidenceTags,
            autoScores:            data.autoScores
        });
    });

    return { submissions };
});

/**
 * getEDTLabIds — Returns distinct lab IDs that have submissions.
 *
 * Auth: handler or admin required.
 * Used to populate the lab selector in CaseRoomAggregates.
 */
exports.getEDTLabIds = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const isHandler = request.auth.token.handler === true || request.auth.token.admin === true;
    if (!isHandler) {
        throw new HttpsError('permission-denied', 'Handler role required.');
    }

    // Firestore does not support SELECT DISTINCT — fetch a batch and deduplicate
    const snap = await db.collection('edt_submissions')
        .orderBy('labId')
        .limit(500)
        .get();

    const labIdSet = new Set();
    snap.forEach(d => { labIdSet.add(d.data().labId); });

    return { labIds: Array.from(labIdSet).sort() };
});


// ─── The Wire: Discord Interaction Handler ───────────────────────
// Handles slash commands from the Hexworth Prime Discord bot.
// Discord POSTs to this endpoint when a user runs /standings, /team, etc.

const nacl = require('tweetnacl');
const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

// House role IDs (mapped during server setup)
const HOUSE_ROLES = {
    'shield':    '1494411653784141834',
    'forge':     '1494411655633834044',
    'web':       '1494411661761577011',
    'code':      '1494411663955464414',
    'matrix':    '1494411665410752614',
    'dark-arts': '1494411667293868063',
    'eye':       '1494411669030436924',
    'script':    '1494411670767009998',
    'cloud':     '1494411672951984350',
    'key':       '1494411680481022092',
    'ai':        '1494411682628374610',
    'signal':    '1494411684771790848'
};

const GUILD_ID = '1494399956126138383';
const STUDENT_ROLE_ID = '1494421554556047440';
const INTRODUCTIONS_CHANNEL = '1494411540382744667';

exports.discordInteraction = onRequest({ region: 'us-central1' }, async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    // Verify Discord signature
    const signature = req.headers['x-signature-ed25519'];
    const timestamp = req.headers['x-signature-timestamp'];
    const rawBody = JSON.stringify(req.body);

    const isValid = nacl.sign.detached.verify(
        Buffer.from(timestamp + rawBody),
        Buffer.from(signature, 'hex'),
        Buffer.from(DISCORD_PUBLIC_KEY, 'hex')
    );

    if (!isValid) {
        return res.status(401).send('Invalid signature');
    }

    const interaction = req.body;

    // PING — Discord sends this to verify the endpoint
    if (interaction.type === 1) {
        return res.json({ type: 1 });
    }

    // SLASH COMMAND
    if (interaction.type === 2) {
        const command = interaction.data.name;

        // /help
        if (command === 'help') {
            return res.json({
                type: 4,
                data: {
                    embeds: [{
                        title: 'Hexworth Prime Bot Commands',
                        color: 433476,
                        fields: [
                            { name: '/join', value: 'Get your Student role and welcome message', inline: true },
                            { name: '/link <code>', value: 'Link Discord to Hexworth account', inline: true },
                            { name: '/house <name>', value: 'Join a House role', inline: true },
                            { name: '/standings', value: 'Tournament leaderboard', inline: true },
                            { name: '/team <name>', value: 'Look up a team', inline: true },
                            { name: '/challenge', value: 'Random challenge', inline: true },
                            { name: '/trivia', value: 'Cybersecurity trivia', inline: true },
                            { name: '/boxinfo <name>', value: 'Look up a CTF box', inline: true },
                            { name: '/profile', value: 'Your profile', inline: true },
                            { name: '/streak', value: 'Completion streak', inline: true },
                            { name: '/optin', value: 'Toggle milestone announcements', inline: true },
                            { name: '/help', value: 'This message', inline: true }
                        ],
                        footer: { text: 'Hexworth Prime // The Wire' }
                    }]
                }
            });
        }

        // /standings
        if (command === 'standings') {
            try {
                // Find the active tournament
                const tournSnap = await db.collection('tournaments')
                    .where('status', 'in', ['active', 'frozen'])
                    .limit(1)
                    .get();

                if (tournSnap.empty) {
                    return res.json({
                        type: 4,
                        data: {
                            embeds: [{
                                title: 'No Active Tournament',
                                description: 'There is no tournament running right now. Check #announcements for the next event.',
                                color: 10038562
                            }]
                        }
                    });
                }

                const tourn = tournSnap.docs[0];
                const tournData = tourn.data();
                // Fetch ALL teams (not limit(10) — a score tie at the 10/11 boundary could
                // otherwise drop the correct team) and rank with the canonical CTF tie-break
                // (BUG-022): score DESC, then earliest lastSolveTime ASC, id fallback for stability.
                // Mirrors the browser rule in /components/CtfStandings.js and is the server-side
                // reference the HCA finalization service will reuse.
                const teamsSnap = await tourn.ref.collection('teams')
                    .orderBy('score', 'desc')
                    .get();

                // Normalize lastSolveTime (admin Timestamp | {seconds} | number | string | missing) to ms.
                // Rule kept BYTE-IDENTICAL to the browser canonical helper _app/components/CtfStandings.js.
                // Duplicated (not imported) because Cloud Functions bundle only functions/ and cannot reach
                // _app/. If you edit the rule in one place, edit both. (BUG-022, Nancy R2.)
                const solveMs = (v) => {
                    if (v == null) return Infinity;   // null/undefined only — a literal 0 (epoch ms) is a real time
                    if (typeof v.toMillis === 'function') return v.toMillis();
                    if (typeof v.seconds === 'number') return v.seconds * 1000;
                    const n = new Date(v).getTime();
                    return isNaN(n) ? Infinity : n;
                };
                const ranked = teamsSnap.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .sort((a, b) => {
                        const sd = (b.score || 0) - (a.score || 0);
                        if (sd !== 0) return sd;
                        // Compare equality before subtracting so Infinity-Infinity (both missing) can't
                        // produce NaN and corrupt the sort; falls through to the stable id tiebreak.
                        const am = solveMs(a.lastSolveTime), bm = solveMs(b.lastSolveTime);
                        if (am !== bm) return am - bm;
                        return String(a.id || '').localeCompare(String(b.id || ''));
                    })
                    .slice(0, 10);

                let leaderboard = '';
                let rank = 1;
                ranked.forEach(t => {
                    const medal = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : rank + 'th';
                    leaderboard += `**${medal}** — ${t.name || t.id} — ${t.score || 0} pts (${(t.solves || []).length} flags)\n`;
                    rank++;
                });

                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Tournament Leaderboard: ' + (tournData.name || 'Active'),
                            description: leaderboard || 'No teams have scored yet.',
                            color: 15844367,
                            footer: { text: 'Hexworth Prime // The Wire // Live Standings' },
                            timestamp: new Date().toISOString()
                        }]
                    }
                });
            } catch (err) {
                console.error('[Wire] /standings error:', err);
                return res.json({
                    type: 4,
                    data: { content: 'Error loading standings. Try again in a moment.' }
                });
            }
        }

        // /team <name>
        if (command === 'team') {
            const teamName = interaction.data.options?.[0]?.value;
            if (!teamName) {
                return res.json({ type: 4, data: { content: 'Usage: /team <team name>' } });
            }

            try {
                const tournSnap = await db.collection('tournaments')
                    .where('status', 'in', ['active', 'frozen'])
                    .limit(1)
                    .get();

                if (tournSnap.empty) {
                    return res.json({ type: 4, data: { content: 'No active tournament.' } });
                }

                const teamsSnap = await tournSnap.docs[0].ref.collection('teams').get();
                let found = null;
                teamsSnap.forEach(doc => {
                    const t = doc.data();
                    if ((t.name || '').toLowerCase() === teamName.toLowerCase()) {
                        found = { id: doc.id, ...t };
                    }
                });

                if (!found) {
                    return res.json({ type: 4, data: { content: `Team "${teamName}" not found in the active tournament.` } });
                }

                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Team: ' + found.name,
                            color: 3066993,
                            fields: [
                                { name: 'Score', value: String(found.score || 0), inline: true },
                                { name: 'Flags Captured', value: String((found.solves || []).length), inline: true },
                                { name: 'Members', value: String((found.members || []).length), inline: true }
                            ],
                            footer: { text: 'Hexworth Prime // The Wire' },
                            timestamp: new Date().toISOString()
                        }]
                    }
                });
            } catch (err) {
                console.error('[Wire] /team error:', err);
                return res.json({ type: 4, data: { content: 'Error loading team data.' } });
            }
        }

        // /profile — show linked Hexworth stats
        if (command === 'profile') {
            const discordUserId = interaction.member?.user?.id || interaction.user?.id;
            const discordUsername = interaction.member?.user?.username || interaction.user?.username || 'Unknown';

            try {
                // Look up link
                const linkDoc = await db.collection('discord_links').doc(discordUserId).get();
                if (!linkDoc.exists) {
                    return res.json({
                        type: 4,
                        data: {
                            embeds: [{
                                title: 'Profile: ' + discordUsername,
                                description: 'Your Discord is not linked to a Hexworth account yet.\n\n**To link:**\n1. Go to [hexworth.com/dashboard](https://hexworth.com/dashboard.html)\n2. Open Settings > Link Discord\n3. Copy the 6-character code\n4. Type `/link <code>` here',
                                color: 15844367,
                                footer: { text: 'Hexworth Prime // Link Required' }
                            }]
                        }
                    });
                }

                const linkData = linkDoc.data();
                const userDoc = await db.doc(`users/${linkData.uid}`).get();
                const userData = userDoc.exists ? userDoc.data() : {};

                const xp = userData.xp || 0;
                const level = userData.level || 1;
                const modulesCompleted = userData.modulesCompleted || 0;
                const quizzesPassed = userData.quizzesPassed || 0;
                const flagsCaptured = userData.ctfFlagsCaptured || 0;

                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Profile: ' + discordUsername,
                            color: 433476,
                            fields: [
                                { name: 'Level', value: String(level), inline: true },
                                { name: 'XP', value: String(xp).replace(/\B(?=(\d{3})+(?!\d))/g, ','), inline: true },
                                { name: 'Modules', value: String(modulesCompleted), inline: true },
                                { name: 'Quizzes Passed', value: String(quizzesPassed), inline: true },
                                { name: 'Flags Captured', value: String(flagsCaptured), inline: true },
                                { name: 'Email', value: linkData.email || 'N/A', inline: true }
                            ],
                            footer: { text: 'Hexworth Prime // Profile' },
                            timestamp: new Date().toISOString()
                        }]
                    }
                });
            } catch (err) {
                console.error('[Wire] /profile error:', err);
                return res.json({ type: 4, data: { content: 'Error loading profile.' } });
            }
        }

        // /house <name>
        if (command === 'house') {
            const houseName = interaction.data.options?.[0]?.value;
            const roleId = HOUSE_ROLES[houseName];
            const memberId = interaction.member?.user?.id;

            if (!roleId || !memberId) {
                return res.json({ type: 4, data: { content: 'Invalid house or unable to identify you.' } });
            }

            try {
                // Remove existing house roles first
                const roleValues = Object.values(HOUSE_ROLES);
                const memberRoles = interaction.member?.roles || [];
                for (const existingRole of memberRoles) {
                    if (roleValues.includes(existingRole) && existingRole !== roleId) {
                        await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${memberId}/roles/${existingRole}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN }
                        });
                    }
                }

                // Add the new house role
                const addResult = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${memberId}/roles/${roleId}`, {
                    method: 'PUT',
                    headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN }
                });

                if (addResult.ok || addResult.status === 204) {
                    const houseDisplay = houseName.charAt(0).toUpperCase() + houseName.slice(1);
                    return res.json({
                        type: 4,
                        data: {
                            embeds: [{
                                title: 'House Assigned',
                                description: `You are now a member of **House of ${houseDisplay}**. Your name color has been updated.`,
                                color: 3066993,
                                footer: { text: 'Hexworth Prime // Houses' }
                            }]
                        }
                    });
                } else {
                    return res.json({ type: 4, data: { content: 'Failed to assign role. The bot may need Manage Roles permission.' } });
                }
            } catch (err) {
                console.error('[Wire] /house error:', err);
                return res.json({ type: 4, data: { content: 'Error assigning house role.' } });
            }
        }

        // /link <code> — link Discord account to Hexworth
        if (command === 'link') {
            const code = (interaction.data.options?.[0]?.value || '').toUpperCase().trim();
            const discordId = interaction.member?.user?.id;
            const discordUsername = interaction.member?.user?.username || '';

            if (!code || code.length !== 6) {
                return res.json({ type: 4, data: { content: 'Invalid code. Enter the 6-character code from your Hexworth dashboard.' } });
            }

            try {
                // Look up the code directly in Firestore
                const codeDoc = await db.collection('discord_link_codes').doc(code).get();
                if (!codeDoc.exists) {
                    return res.json({ type: 4, data: { content: 'Code not found. Generate a new one from your Hexworth dashboard (Settings > Link Discord).' } });
                }

                const codeData = codeDoc.data();

                if (codeData.used) {
                    return res.json({ type: 4, data: { content: 'This code has already been used. Generate a new one.' } });
                }

                if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
                    return res.json({ type: 4, data: { content: 'Code expired. Generate a new one from the dashboard.' } });
                }

                // Mark used
                await db.collection('discord_link_codes').doc(code).update({ used: true });

                // Create link
                await db.collection('discord_links').doc(discordId).set({
                    uid: codeData.uid,
                    email: codeData.email,
                    discordUsername: discordUsername,
                    linkedAt: FieldValue.serverTimestamp()
                });

                await db.doc(`users/${codeData.uid}`).set({
                    discordId: discordId,
                    discordUsername: discordUsername,
                    discordLinkedAt: FieldValue.serverTimestamp()
                }, { merge: true });

                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Account Linked',
                            description: 'Your Discord account is now connected to Hexworth Prime.\n\nUse `/profile` to see your stats and `/streak` to check your progress.',
                            color: 3066993,
                            fields: [
                                { name: 'Hexworth Account', value: codeData.email || 'Linked', inline: true },
                                { name: 'Discord', value: discordUsername, inline: true }
                            ],
                            footer: { text: 'Hexworth Prime // Account Linked' }
                        }]
                    }
                });
            } catch (err) {
                console.error('[Wire] /link error:', err);
                return res.json({ type: 4, data: { content: 'Error linking account. Try again.' } });
            }
        }

        // /join — assign Student role and welcome
        if (command === 'join') {
            const memberId = interaction.member?.user?.id;
            const username = interaction.member?.user?.username || 'Operator';
            if (!memberId) {
                return res.json({ type: 4, data: { content: 'Could not identify you. Try again in a server channel.' } });
            }

            try {
                // Assign Student role
                await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${memberId}/roles/${STUDENT_ROLE_ID}`, {
                    method: 'PUT',
                    headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN }
                });

                // Post welcome in #introductions
                await fetch(`https://discord.com/api/v10/channels/${INTRODUCTIONS_CHANNEL}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bot ' + DISCORD_BOT_TOKEN,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        embeds: [{
                            title: 'New Operator Joined',
                            description: `Welcome **${username}** to Hexworth Prime.\n\nUse \`/house <name>\` to join a House and get your colored role.\nUse \`/help\` to see all available commands.\n\nIntroduce yourself below.`,
                            color: 3066993,
                            footer: { text: 'Hexworth Prime // Welcome' },
                            timestamp: new Date().toISOString()
                        }]
                    })
                });

                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Welcome, ' + username,
                            description: 'You have been assigned the **Student** role.\n\n**Next steps:**\n1. Use `/house <name>` to join your House\n2. Check out #quick-links for platform URLs\n3. Introduce yourself in #introductions\n4. Try `/challenge` for a random challenge',
                            color: 3066993,
                            footer: { text: 'Hexworth Prime // You are in.' }
                        }]
                    }
                });
            } catch (err) {
                console.error('[Wire] /join error:', err);
                return res.json({ type: 4, data: { content: 'Error setting up your profile. The bot may need Manage Roles permission.' } });
            }
        }

        // /challenge — random CTF box or Operator mission
        if (command === 'challenge') {
            const challenges = [
                { name: 'A1-Phantom Gate', type: 'CTF Box', diff: 'Beginner', url: 'https://hexworth.com/arena/index.html' },
                { name: 'B3-Cipher Lock', type: 'CTF Box', diff: 'Intermediate', url: 'https://hexworth.com/arena/index.html' },
                { name: 'C7-Veiled Logic', type: 'CTF Box', diff: 'Advanced', url: 'https://hexworth.com/arena/index.html' },
                { name: 'D5-Breach Point', type: 'CTF Box', diff: 'Expert', url: 'https://hexworth.com/arena/index.html' },
                { name: 'OW-01 Mole Hunt', type: 'Open World', diff: 'Investigation', url: 'https://hexworth.com/arena/index.html' },
                { name: 'Python-01 Grid Search', type: 'Operator', diff: 'Tier 3', url: 'https://hexworth.com/operator/index.html' },
                { name: 'Python-10 Route Planner', type: 'Operator', diff: 'Tier 5', url: 'https://hexworth.com/operator/index.html' },
                { name: 'PFI-OP-01 The Patrol', type: 'Operator', diff: 'Tier 2', url: 'https://hexworth.com/operator/missions/pfi-op-01.mission.html' },
                { name: 'PFI-OP-03 The Router', type: 'Operator', diff: 'Tier 3', url: 'https://hexworth.com/operator/missions/pfi-op-03.mission.html' },
                { name: 'White Belt Challenge', type: 'Dojo', diff: 'Beginner', url: 'https://hexworth.com/dojo/index.html' },
                { name: 'Green Belt Challenge', type: 'Dojo', diff: 'Intermediate', url: 'https://hexworth.com/dojo/index.html' },
                { name: 'Black Belt Challenge', type: 'Dojo', diff: 'Expert', url: 'https://hexworth.com/dojo/index.html' }
            ];
            const pick = challenges[Math.floor(Math.random() * challenges.length)];
            return res.json({
                type: 4,
                data: {
                    embeds: [{
                        title: 'Daily Challenge',
                        color: 15844367,
                        fields: [
                            { name: 'Challenge', value: pick.name, inline: true },
                            { name: 'Type', value: pick.type, inline: true },
                            { name: 'Difficulty', value: pick.diff, inline: true },
                            { name: 'Link', value: '[Launch Challenge](' + pick.url + ')', inline: false }
                        ],
                        footer: { text: 'Hexworth Prime // /challenge' }
                    }]
                }
            });
        }

        // /optin — toggle milestone announcements
        if (command === 'optin') {
            const setting = interaction.data.options?.[0]?.value;
            const discordId = interaction.member?.user?.id;
            if (!discordId) {
                return res.json({ type: 4, data: { content: 'Could not identify you.' } });
            }
            try {
                const linkDoc = await db.collection('discord_links').doc(discordId).get();
                if (!linkDoc.exists) {
                    return res.json({ type: 4, data: { content: 'Link your account first with `/link <code>`.' } });
                }
                await db.collection('discord_links').doc(discordId).update({
                    milestoneAnnouncements: setting === 'enable'
                });
                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Milestone Announcements ' + (setting === 'enable' ? 'Enabled' : 'Disabled'),
                            description: setting === 'enable'
                                ? 'When you pass a quiz with 90%+ or complete a course, it will be announced in #announcements.'
                                : 'Your achievements will no longer be announced publicly.',
                            color: setting === 'enable' ? 3066993 : 10038562,
                            footer: { text: 'Hexworth Prime // Settings' }
                        }]
                    }
                });
            } catch (err) {
                console.error('[Wire] /optin error:', err);
                return res.json({ type: 4, data: { content: 'Error updating setting.' } });
            }
        }

        // /trivia — cybersecurity trivia
        if (command === 'trivia') {
            const questions = [
                { q: 'What port does HTTPS use by default?', a: '443' },
                { q: 'What does CIA stand for in cybersecurity?', a: 'Confidentiality, Integrity, Availability' },
                { q: 'What protocol resolves domain names to IP addresses?', a: 'DNS (Domain Name System)' },
                { q: 'What is the default subnet mask for a Class C network?', a: '255.255.255.0 (/24)' },
                { q: 'What does SIEM stand for?', a: 'Security Information and Event Management' },
                { q: 'What layer of the OSI model does a switch operate at?', a: 'Layer 2 (Data Link)' },
                { q: 'What tool is commonly used for packet capture and analysis?', a: 'Wireshark' },
                { q: 'What does the "S" in HTTPS stand for?', a: 'Secure (HTTP over TLS/SSL)' },
                { q: 'What is the well-known port for SSH?', a: '22' },
                { q: 'What type of attack involves sending too many requests to overwhelm a server?', a: 'DDoS (Distributed Denial of Service)' },
                { q: 'What does VLAN stand for?', a: 'Virtual Local Area Network' },
                { q: 'What is the first phase of the Cyber Kill Chain?', a: 'Reconnaissance' },
                { q: 'What command shows the routing table on a Windows machine?', a: 'route print' },
                { q: 'What does ARP stand for?', a: 'Address Resolution Protocol' },
                { q: 'What is the private IP range for Class A networks?', a: '10.0.0.0 - 10.255.255.255' },
                { q: 'What encryption standard replaced DES?', a: 'AES (Advanced Encryption Standard)' },
                { q: 'What does NIST stand for?', a: 'National Institute of Standards and Technology' },
                { q: 'How many usable hosts are in a /24 subnet?', a: '254' },
                { q: 'What Linux command changes file permissions?', a: 'chmod' },
                { q: 'What is the maximum MTU size for standard Ethernet?', a: '1500 bytes' }
            ];
            const pick = questions[Math.floor(Math.random() * questions.length)];
            return res.json({
                type: 4,
                data: {
                    embeds: [{
                        title: 'Cybersecurity Trivia',
                        description: '**' + pick.q + '**\n\n||' + pick.a + '||',
                        color: 433476,
                        footer: { text: 'Hexworth Prime // Click the spoiler to reveal the answer' }
                    }]
                }
            });
        }

        // /boxinfo <name> — look up a CTF box
        if (command === 'boxinfo') {
            const boxName = (interaction.data.options?.[0]?.value || '').toLowerCase();
            try {
                const boxFlags = require('./box_flags.json');
                let found = null;
                let foundKey = null;
                for (const [key, val] of Object.entries(boxFlags)) {
                    if (key.toLowerCase().includes(boxName) || (val.title || '').toLowerCase().includes(boxName)) {
                        found = val;
                        foundKey = key;
                        break;
                    }
                }
                if (!found) {
                    return res.json({ type: 4, data: { content: 'Box "' + boxName + '" not found. Try a partial name like "phantom" or "cipher".' } });
                }
                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Box: ' + (found.title || foundKey),
                            color: 10038562,
                            fields: [
                                { name: 'ID', value: foundKey, inline: true },
                                { name: 'Flags', value: String(Object.keys(found.flags || {}).length || found.flagCount || '?'), inline: true },
                                { name: 'Link', value: '[Open in Arena](https://hexworth.com/arena/index.html)', inline: true }
                            ],
                            footer: { text: 'Hexworth Prime // CTF Arena' }
                        }]
                    }
                });
            } catch (err) {
                return res.json({ type: 4, data: { content: 'Error looking up box data.' } });
            }
        }

        // /streak — show completion streak and recent activity
        if (command === 'streak') {
            const discordUserId = interaction.member?.user?.id || interaction.user?.id;

            try {
                const linkDoc = await db.collection('discord_links').doc(discordUserId).get();
                if (!linkDoc.exists) {
                    return res.json({
                        type: 4,
                        data: {
                            embeds: [{
                                title: 'Streak Tracker',
                                description: 'Link your account first with `/link <code>` to track your streak.\n\nGet your code at [hexworth.com/dashboard](https://hexworth.com/dashboard.html) > Settings > Link Discord.',
                                color: 15844367,
                                footer: { text: 'Hexworth Prime // Link Required' }
                            }]
                        }
                    });
                }

                const linkData = linkDoc.data();
                const userDoc = await db.doc(`users/${linkData.uid}`).get();
                const userData = userDoc.exists ? userDoc.data() : {};

                const streak = userData.currentStreak || 0;
                const longestStreak = userData.longestStreak || 0;
                const lastActive = userData.lastActiveDate || 'Never';
                const xp = userData.xp || 0;
                const level = userData.level || 1;

                const streakEmoji = streak >= 7 ? 'On fire!' : streak >= 3 ? 'Building momentum!' : streak > 0 ? 'Keep it going!' : 'Start a new streak today!';

                return res.json({
                    type: 4,
                    data: {
                        embeds: [{
                            title: 'Streak: ' + streak + ' day' + (streak !== 1 ? 's' : ''),
                            description: streakEmoji,
                            color: streak >= 7 ? 16711680 : streak >= 3 ? 16766720 : 433476,
                            fields: [
                                { name: 'Current Streak', value: streak + ' days', inline: true },
                                { name: 'Longest Streak', value: longestStreak + ' days', inline: true },
                                { name: 'Level', value: String(level), inline: true },
                                { name: 'Total XP', value: String(xp).replace(/\B(?=(\d{3})+(?!\d))/g, ','), inline: true },
                                { name: 'Last Active', value: typeof lastActive === 'string' ? lastActive : new Date(lastActive).toLocaleDateString(), inline: true }
                            ],
                            footer: { text: 'Hexworth Prime // Streak Tracker' },
                            timestamp: new Date().toISOString()
                        }]
                    }
                });
            } catch (err) {
                console.error('[Wire] /streak error:', err);
                return res.json({ type: 4, data: { content: 'Error loading streak data.' } });
            }
        }

        // Unknown command
        return res.json({ type: 4, data: { content: 'Unknown command.' } });
    }

    // MESSAGE COMPONENT INTERACTION (buttons, selects)
    if (interaction.type === 3) {
        const customId = interaction.data.custom_id;

        if (customId === 'reroll_challenge') {
            const challenges = [
                { name: 'A1-Phantom Gate', type: 'CTF Box', diff: 'Beginner', desc: 'Your first breach.', url: 'https://hexworth.com/arena/index.html' },
                { name: 'B3-Cipher Lock', type: 'CTF Box', diff: 'Intermediate', desc: 'Encrypted comms, hidden keys.', url: 'https://hexworth.com/arena/index.html' },
                { name: 'C7-Veiled Logic', type: 'CTF Box', diff: 'Advanced', desc: 'Reverse the logic.', url: 'https://hexworth.com/arena/index.html' },
                { name: 'D5-Breach Point', type: 'CTF Box', diff: 'Expert', desc: 'Full kill chain.', url: 'https://hexworth.com/arena/index.html' },
                { name: 'Python-01 Grid Search', type: 'Operator', diff: 'Tier 3', desc: 'Loop sweep a 7x7 grid.', url: 'https://hexworth.com/operator/index.html' },
                { name: 'PFI-OP-03 The Router', type: 'Operator', diff: 'Tier 3', desc: 'Multiple functions + gates.', url: 'https://hexworth.com/operator/missions/pfi-op-03.mission.html' },
                { name: 'Green Belt Challenge', type: 'Dojo', diff: 'Intermediate', desc: 'SSRF exploitation.', url: 'https://hexworth.com/dojo/index.html' }
            ];
            const pick = challenges[Math.floor(Math.random() * challenges.length)];
            return res.json({
                type: 4,
                data: {
                    embeds: [{
                        title: 'Rerolled Challenge',
                        color: 15844367,
                        fields: [
                            { name: pick.name, value: pick.desc, inline: false },
                            { name: 'Type', value: pick.type, inline: true },
                            { name: 'Difficulty', value: pick.diff, inline: true }
                        ],
                        footer: { text: 'Hexworth Prime // Rerolled' }
                    }],
                    components: [{
                        type: 1,
                        components: [
                            { type: 2, style: 5, label: 'Launch Challenge', url: pick.url }
                        ]
                    }]
                }
            });
        }

        return res.json({ type: 4, data: { content: 'Unknown interaction.' } });
    }

    // Unknown interaction type
    return res.status(400).send('Unknown interaction type');
});


// ─── The Wire: Daily Challenge (Scheduled) ───────────────────────
// Posts a random challenge to #daily-challenge every day at 8am EST (13:00 UTC)

const DAILY_CHALLENGE_CHANNEL = '1494417032702066708';

exports.dailyChallenge = onSchedule({
    schedule: 'every day 08:00',
    region: 'us-central1',
    timeZone: 'America/New_York'
}, async () => {
    const challenges = [
        { name: 'A1-Phantom Gate', type: 'CTF Box', diff: 'Beginner', desc: 'Your first breach. Enumerate services, find the way in, capture the flag.', url: 'https://hexworth.com/arena/index.html' },
        { name: 'A5-Binary Storm', type: 'CTF Box', diff: 'Beginner', desc: 'A misconfigured server with too many open doors. Find the right one.', url: 'https://hexworth.com/arena/index.html' },
        { name: 'B3-Cipher Lock', type: 'CTF Box', diff: 'Intermediate', desc: 'Encrypted comms, hidden keys, and a locked vault. Break in.', url: 'https://hexworth.com/arena/index.html' },
        { name: 'B7-Dark Relay', type: 'CTF Box', diff: 'Intermediate', desc: 'Pivot through a relay network. Each hop reveals the next target.', url: 'https://hexworth.com/arena/index.html' },
        { name: 'C7-Veiled Logic', type: 'CTF Box', diff: 'Advanced', desc: 'The logic is hidden in the code. Reverse it to find the flag.', url: 'https://hexworth.com/arena/index.html' },
        { name: 'D5-Breach Point', type: 'CTF Box', diff: 'Expert', desc: 'Multi-stage. Full kill chain from recon to exfiltration.', url: 'https://hexworth.com/arena/index.html' },
        { name: 'OW-01 Mole Hunt', type: 'Open World', diff: 'Investigation', desc: 'An insider is leaking data. Analyze SIEM logs, emails, and badge records to find them.', url: 'https://hexworth.com/arena/index.html' },
        { name: 'Python-01 Grid Search', type: 'Operator', diff: 'Tier 3', desc: 'Write a loop to sweep a 7x7 grid and find 5 hidden servers.', url: 'https://hexworth.com/operator/index.html' },
        { name: 'Python-15 Quadrant Siege', type: 'Operator', diff: 'Tier 6', desc: '11x11 grid, 4 zones, gates everywhere. Functions are mandatory.', url: 'https://hexworth.com/operator/index.html' },
        { name: 'PFI-OP-01 The Patrol', type: 'Operator', diff: 'Tier 2', desc: 'Your first function mission. Define patrol(), call it 4 times.', url: 'https://hexworth.com/operator/missions/pfi-op-01.mission.html' },
        { name: 'PFI-OP-04 The Architect', type: 'Operator', diff: 'Tier 4', desc: 'Compose complex behavior from simple functions. 4 quadrants, 4 servers.', url: 'https://hexworth.com/operator/missions/pfi-op-04.mission.html' },
        { name: 'White Belt: SQL Injection', type: 'Dojo', diff: 'Beginner', desc: 'Classic SQL injection on a login form. Can you bypass authentication?', url: 'https://hexworth.com/dojo/index.html' },
        { name: 'Green Belt: SSRF', type: 'Dojo', diff: 'Intermediate', desc: 'Server-Side Request Forgery. Make the server fetch internal resources for you.', url: 'https://hexworth.com/dojo/index.html' },
        { name: 'Black Belt: Chain Attack', type: 'Dojo', diff: 'Expert', desc: 'Combine 3 vulnerabilities into a single kill chain. No hints.', url: 'https://hexworth.com/dojo/index.html' }
    ];

    const pick = challenges[Math.floor(Math.random() * challenges.length)];
    const colors = { 'Beginner': 3066993, 'Intermediate': 15844367, 'Advanced': 16753920, 'Expert': 16711680, 'Investigation': 5025616, 'Tier 2': 3066993, 'Tier 3': 3447003, 'Tier 4': 15844367, 'Tier 6': 16711680 };

    try {
        await fetch(`https://discord.com/api/v10/channels/${DAILY_CHALLENGE_CHANNEL}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bot ' + DISCORD_BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [{
                    title: 'DAILY CHALLENGE — ' + new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
                    color: colors[pick.diff] || 433476,
                    fields: [
                        { name: pick.name, value: pick.desc, inline: false },
                        { name: 'Type', value: pick.type, inline: true },
                        { name: 'Difficulty', value: pick.diff, inline: true }
                    ],
                    footer: { text: 'Hexworth Prime // The Wire // Daily Challenge' },
                    timestamp: new Date().toISOString()
                }],
                components: [{
                    type: 1,
                    components: [
                        { type: 2, style: 5, label: 'Launch Challenge', url: pick.url },
                        { type: 2, style: 2, label: 'Get a Different One', custom_id: 'reroll_challenge', disabled: false }
                    ]
                }]
            })
        });
        console.log('[Wire] Daily challenge posted:', pick.name);
    } catch (err) {
        console.error('[Wire] Daily challenge failed:', err.message);
    }
});


// ─── The Wire: Patch Notes (callable by deploy process) ──────────
// Called manually or via post-deploy hook to announce a deployment.

const PATCH_NOTES_CHANNEL = '1494417027446739025';

exports.postPatchNote = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const email = request.auth.token.email || '';
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        throw new HttpsError('permission-denied', 'Admin only.');
    }

    const { title, changes, version } = request.data || {};
    if (!title || !changes) {
        throw new HttpsError('invalid-argument', 'title and changes are required.');
    }

    const fields = [];
    if (version) fields.push({ name: 'Version', value: version, inline: true });
    fields.push({ name: 'Changes', value: changes, inline: false });

    try {
        await fetch(`https://discord.com/api/v10/channels/${PATCH_NOTES_CHANNEL}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bot ' + DISCORD_BOT_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [{
                    title: 'PATCH NOTES — ' + title,
                    color: 3447003,
                    fields: fields,
                    footer: { text: 'Hexworth Prime // Deploy' },
                    timestamp: new Date().toISOString()
                }]
            })
        });
        return { success: true };
    } catch (err) {
        console.error('[Wire] Patch note failed:', err.message);
        throw new HttpsError('internal', 'Failed to post patch note.');
    }
});


// ─── Discord Activity OAuth2 Token Exchange ──────────────────────
// Called by the Panopticon Discord Activity to exchange an auth code for a token.
// This runs as an HTTP endpoint (not callable) since the Activity iframe
// doesn't have Firebase Auth context.

const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

exports.discordActivityAuth = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const { code } = req.body || {};
    if (!code) {
        return res.status(400).json({ error: 'code is required' });
    }

    try {
        // Exchange the authorization code for an access token
        const tokenResp = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: '1494405567593054389',
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code
            }).toString()
        });

        if (!tokenResp.ok) {
            const err = await tokenResp.text();
            console.error('[Activity Auth] Token exchange failed:', err);
            return res.status(tokenResp.status).json({ error: 'Token exchange failed' });
        }

        const tokenData = await tokenResp.json();

        // Fetch user info
        const userResp = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
        });
        const userData = userResp.ok ? await userResp.json() : {};

        return res.json({
            access_token: tokenData.access_token,
            user: {
                id: userData.id,
                username: userData.username,
                avatar: userData.avatar
            }
        });
    } catch (err) {
        console.error('[Activity Auth] Error:', err);
        return res.status(500).json({ error: 'Internal error' });
    }
});


// ─── Discord Account Linking ─────────────────────────────────────

/**
 * generateDiscordLinkCode — Called from the Hexworth dashboard.
 * Generates a 6-character code, stores it in Firestore with the user's UID,
 * and returns it. Code expires in 10 minutes.
 */
exports.generateDiscordLinkCode = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }
    const uid = request.auth.uid;
    const email = request.auth.token.email || '';

    // Generate a 6-char alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Store in Firestore with 10-minute expiry
    await db.collection('discord_link_codes').doc(code).set({
        uid: uid,
        email: email,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        used: false
    });

    return { code: code };
});

/**
 * verifyDiscordLinkCode — Called from the Discord bot /link command.
 * Validates the code, links the Discord ID to the Hexworth UID,
 * and stores the mapping in Firestore.
 */
exports.verifyDiscordLinkCode = onCall(cfOptions, async (request) => {
    const { code, discordId, discordUsername } = request.data || {};
    if (!code || !discordId) {
        throw new HttpsError('invalid-argument', 'code and discordId are required.');
    }

    // Look up the code
    const codeDoc = await db.collection('discord_link_codes').doc(code.toUpperCase()).get();
    if (!codeDoc.exists) {
        throw new HttpsError('not-found', 'Invalid link code.');
    }

    const codeData = codeDoc.data();

    // Check expiry
    if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
        throw new HttpsError('deadline-exceeded', 'Link code has expired. Generate a new one from the dashboard.');
    }

    // Check if already used
    if (codeData.used) {
        throw new HttpsError('already-exists', 'This code has already been used.');
    }

    // Mark code as used
    await db.collection('discord_link_codes').doc(code.toUpperCase()).update({ used: true });

    // Create the link mapping
    await db.collection('discord_links').doc(discordId).set({
        uid: codeData.uid,
        email: codeData.email,
        discordUsername: discordUsername || null,
        linkedAt: FieldValue.serverTimestamp()
    });

    // Also store the Discord ID on the user's profile
    await db.doc(`users/${codeData.uid}`).set({
        discordId: discordId,
        discordUsername: discordUsername || null,
        discordLinkedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, uid: codeData.uid };
});


// ─── Weekly Leaderboard (Scheduled — Sunday 9pm EST) ─────────────
const LEADERBOARD_CHANNEL = '1494411241534263458';

exports.weeklyLeaderboard = onSchedule({
    schedule: 'every sunday 21:00',
    region: 'us-central1',
    timeZone: 'America/New_York'
}, async () => {
    try {
        // Get top 10 users by XP
        const usersSnap = await db.collection('users')
            .orderBy('xp', 'desc')
            .limit(10)
            .get();

        if (usersSnap.empty) {
            console.log('[Wire] Weekly leaderboard: no users with XP');
            return;
        }

        let board = '';
        let rank = 1;
        usersSnap.forEach(doc => {
            const u = doc.data();
            const name = u.discordUsername || u.displayName || u.email || 'Operator';
            const medal = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : rank + 'th';
            board += `**${medal}** — ${name} — Level ${u.level || 1} — ${(u.xp || 0).toLocaleString()} XP\n`;
            rank++;
        });

        await fetch(`https://discord.com/api/v10/channels/${LEADERBOARD_CHANNEL}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: 'WEEKLY LEADERBOARD — Week of ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                    description: board,
                    color: 15844367,
                    footer: { text: 'Hexworth Prime // The Wire // Updated every Sunday at 9pm EST' },
                    timestamp: new Date().toISOString()
                }]
            })
        });
        console.log('[Wire] Weekly leaderboard posted');
    } catch (err) {
        console.error('[Wire] Weekly leaderboard failed:', err.message);
    }
});


// ─── Daily Challenge Follow-Up (12 hours after main post) ────────
exports.dailyChallengeHints = onSchedule({
    schedule: 'every day 20:00',
    region: 'us-central1',
    timeZone: 'America/New_York'
}, async () => {
    const hints = [
        'Still working on today\'s challenge? Remember: enumeration is the first step. Run every scan before you try exploits.',
        'Stuck? Check if you missed any open ports. Sometimes the answer is on a non-standard port.',
        'Today\'s challenge tip: read the error messages carefully. They often tell you exactly what\'s wrong.',
        'Halfway through the day. If you haven\'t started today\'s challenge, there\'s still time. Jump in.',
        'Pro tip: document your approach as you go. The write-up is as valuable as the flag.',
        'Need help? Ask in #ctf-discussion. Use ||spoiler tags|| for hints.',
        'Remember: every failed attempt teaches you something. The box doesn\'t judge — it only validates.',
        'If brute force isn\'t working, step back and think about what the box is trying to teach you.'
    ];
    const pick = hints[Math.floor(Math.random() * hints.length)];

    try {
        await fetch(`https://discord.com/api/v10/channels/${DAILY_CHALLENGE_CHANNEL}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: 'Challenge Check-In',
                    description: pick,
                    color: 433476,
                    footer: { text: 'Hexworth Prime // Daily Challenge // Evening Check-In' }
                }]
            })
        });
    } catch (err) {
        console.error('[Wire] Challenge hints failed:', err.message);
    }
});


// ─── Milestone Announcements (callable from quiz/module completion) ──
const ANNOUNCEMENTS_CHANNEL = '1494411237755453621';

exports.announceMilestone = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const { type, name, score } = request.data || {};
    // type: 'quiz_ace' (90%+), 'course_complete', 'certification_ready'

    if (!type || !name) return { announced: false };

    // Check if user has a linked Discord account with announcements enabled
    const userDoc = await db.doc(`users/${uid}`).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const discordId = userData.discordId;

    if (!discordId) return { announced: false, reason: 'no_discord' };

    const linkDoc = await db.collection('discord_links').doc(discordId).get();
    if (!linkDoc.exists || !linkDoc.data().milestoneAnnouncements) {
        return { announced: false, reason: 'opted_out' };
    }

    const discordUsername = linkDoc.data().discordUsername || 'An operator';

    let embed;
    if (type === 'quiz_ace') {
        embed = {
            title: 'Quiz Ace!',
            description: `**${discordUsername}** scored **${score}%** on **${name}**`,
            color: 16766720,
            footer: { text: 'Hexworth Prime // Achievement' },
            timestamp: new Date().toISOString()
        };
    } else if (type === 'course_complete') {
        embed = {
            title: 'Course Completed!',
            description: `**${discordUsername}** has completed **${name}**`,
            color: 3066993,
            footer: { text: 'Hexworth Prime // Milestone' },
            timestamp: new Date().toISOString()
        };
    } else if (type === 'certification_ready') {
        embed = {
            title: 'Certification Ready!',
            description: `**${discordUsername}** has completed all objectives for **${name}**`,
            color: 15844367,
            footer: { text: 'Hexworth Prime // Certification Path' },
            timestamp: new Date().toISOString()
        };
    } else {
        return { announced: false, reason: 'unknown_type' };
    }

    try {
        await fetch(`https://discord.com/api/v10/channels/${ANNOUNCEMENTS_CHANNEL}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        return { announced: true };
    } catch (err) {
        console.error('[Wire] Milestone announcement failed:', err.message);
        return { announced: false, reason: 'discord_error' };
    }
});


// ─── Auto-Role on Course Completion (callable) ──────────────────
const COURSE_ROLES = {
    'forge-ch12-hw-network-troubleshooting': { name: 'A+ Core 1 Graduate', color: 16753920 },
    'forge-ch24-documentation': { name: 'A+ Core 2 Graduate', color: 16753920 },
    'forge-md100-m11': { name: 'MD-100 Graduate', color: 3447003 },
    'web-troubleshooting-quiz': { name: 'Network+ Graduate', color: 433476 },
    'pfi-w4-final-exam': { name: 'Python Graduate', color: 1093465 }
};

exports.checkCourseCompletion = onCall(cfOptions, async (request) => {
    if (!request.auth) return { role: null };

    const uid = request.auth.uid;
    const { moduleId } = request.data || {};
    if (!moduleId || !COURSE_ROLES[moduleId]) return { role: null };

    // Check if user has Discord linked
    const userDoc = await db.doc(`users/${uid}`).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const discordId = userData.discordId;
    if (!discordId) return { role: null, reason: 'no_discord' };

    const roleInfo = COURSE_ROLES[moduleId];

    try {
        // Check if role exists, create if not
        const rolesResp = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/roles`, {
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN }
        });
        const roles = await rolesResp.json();
        let roleId = null;
        for (const r of roles) {
            if (r.name === roleInfo.name) { roleId = r.id; break; }
        }

        if (!roleId) {
            // Create the role
            const createResp = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/roles`, {
                method: 'POST',
                headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roleInfo.name, color: roleInfo.color, mentionable: true })
            });
            const newRole = await createResp.json();
            roleId = newRole.id;
        }

        // Assign role to user
        await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}/roles/${roleId}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN }
        });

        return { role: roleInfo.name, assigned: true };
    } catch (err) {
        console.error('[Wire] Auto-role failed:', err.message);
        return { role: null, reason: 'error' };
    }
});


// ─── Tournament Team Channels (callable by tournament system) ────
exports.createTournamentChannels = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');

    const email = request.auth.token.email || '';
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        throw new HttpsError('permission-denied', 'Admin only.');
    }

    const { tournamentId, teams } = request.data || {};
    if (!tournamentId || !Array.isArray(teams) || teams.length === 0) {
        throw new HttpsError('invalid-argument', 'tournamentId and teams[] required.');
    }

    try {
        // Create a tournament category
        const catResp = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'TOURNAMENT: ' + tournamentId.toUpperCase(),
                type: 4
            })
        });
        const cat = await catResp.json();
        const catId = cat.id;

        const channels = [];
        for (const team of teams) {
            const chResp = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/channels`, {
                method: 'POST',
                headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'team-' + team.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    type: 0,
                    parent_id: catId,
                    topic: 'Private channel for team ' + team.name
                })
            });
            const ch = await chResp.json();
            channels.push({ team: team.name, channelId: ch.id });
        }

        // Store mapping in Firestore
        await db.doc(`tournaments/${tournamentId}`).set({
            discordCategoryId: catId,
            discordChannels: channels
        }, { merge: true });

        return { categoryId: catId, channels: channels };
    } catch (err) {
        console.error('[Wire] Tournament channels failed:', err.message);
        throw new HttpsError('internal', 'Failed to create tournament channels.');
    }
});


// ─── Cleanup Tournament Channels (callable) ─────────────────────
exports.deleteTournamentChannels = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');

    const email = request.auth.token.email || '';
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        throw new HttpsError('permission-denied', 'Admin only.');
    }

    const { tournamentId } = request.data || {};
    if (!tournamentId) throw new HttpsError('invalid-argument', 'tournamentId required.');

    try {
        const tournDoc = await db.doc(`tournaments/${tournamentId}`).get();
        if (!tournDoc.exists) throw new HttpsError('not-found', 'Tournament not found.');

        const data = tournDoc.data();
        const channels = data.discordChannels || [];
        const catId = data.discordCategoryId;

        // Delete team channels
        for (const ch of channels) {
            await fetch(`https://discord.com/api/v10/channels/${ch.channelId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN }
            });
        }

        // Delete category
        if (catId) {
            await fetch(`https://discord.com/api/v10/channels/${catId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN }
            });
        }

        // Clean up Firestore
        await db.doc(`tournaments/${tournamentId}`).update({
            discordCategoryId: null,
            discordChannels: null
        });

        return { deleted: true, channelsRemoved: channels.length };
    } catch (err) {
        console.error('[Wire] Tournament channel cleanup failed:', err.message);
        throw new HttpsError('internal', 'Failed to delete tournament channels.');
    }
});


// ─── New Content Announcement (callable when content is deployed) ──
const NEW_CONTENT_CHANNEL = '1494417030109990922';

exports.announceNewContent = onCall(cfOptions, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Must be signed in.');
    const email = request.auth.token.email || '';
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
        throw new HttpsError('permission-denied', 'Admin only.');
    }

    const { title, description, type, url } = request.data || {};
    if (!title) throw new HttpsError('invalid-argument', 'title required.');

    const typeColors = { 'ctf': 10038562, 'lab': 1093465, 'presentation': 433476, 'tool': 15844367, 'course': 3066993 };

    try {
        const msgResp = await fetch(`https://discord.com/api/v10/channels/${NEW_CONTENT_CHANNEL}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: 'NEW: ' + title,
                    description: description || '',
                    color: typeColors[type] || 433476,
                    fields: url ? [{ name: 'Link', value: '[Open](' + url + ')', inline: true }] : [],
                    footer: { text: 'Hexworth Prime // New Content' },
                    timestamp: new Date().toISOString()
                }]
            })
        });

        // Auto-create a discussion thread on the post
        const msg = await msgResp.json();
        if (msg.id) {
            await fetch(`https://discord.com/api/v10/channels/${NEW_CONTENT_CHANNEL}/messages/${msg.id}/threads`, {
                method: 'POST',
                headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Discuss: ' + title, auto_archive_duration: 1440 })
            });
        }

        return { success: true };
    } catch (err) {
        console.error('[Wire] New content announcement failed:', err.message);
        throw new HttpsError('internal', 'Failed to announce.');
    }
});


// ─── Achievement Webhook (callable from AchievementSystem) ───────
exports.announceAchievement = onCall(cfOptions, async (request) => {
    if (!request.auth) return { announced: false };

    const uid = request.auth.uid;
    const { achievementName, achievementDesc, rarity } = request.data || {};
    if (!achievementName) return { announced: false };

    // Only announce rare achievements
    if (rarity !== 'rare' && rarity !== 'epic' && rarity !== 'legendary') {
        return { announced: false, reason: 'common_achievement' };
    }

    const userDoc = await db.doc(`users/${uid}`).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const discordId = userData.discordId;
    if (!discordId) return { announced: false, reason: 'no_discord' };

    const linkDoc = await db.collection('discord_links').doc(discordId).get();
    if (!linkDoc.exists || !linkDoc.data().milestoneAnnouncements) {
        return { announced: false, reason: 'opted_out' };
    }

    const rarityColors = { 'rare': 3447003, 'epic': 10038562, 'legendary': 16766720 };
    const discordUsername = linkDoc.data().discordUsername || 'An operator';

    try {
        await fetch(`https://discord.com/api/v10/channels/${ANNOUNCEMENTS_CHANNEL}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: rarity.toUpperCase() + ' Achievement Unlocked!',
                    description: '**' + discordUsername + '** earned **' + achievementName + '**\n' + (achievementDesc || ''),
                    color: rarityColors[rarity] || 433476,
                    footer: { text: 'Hexworth Prime // Achievement' },
                    timestamp: new Date().toISOString()
                }]
            })
        });
        return { announced: true };
    } catch (err) {
        console.error('[Wire] Achievement announcement failed:', err.message);
        return { announced: false };
    }
});

// ─── PFI Auto-Grading System ─────────────────────────────────────────

/**
 * gradePFIProject — Server-side auto-grading for Python for IT projects.
 *
 * Flow:
 *   1. Authenticate and validate payload
 *   2. Rate limit (5 submissions/hour per project)
 *   3. Fetch test spec from Firestore (pfi_test_specs/{projectId})
 *   4. Call Cloud Run grader service with code + tests
 *   5. Compute weighted score mapped to rubric categories
 *   6. Store submission in Firestore (pfi_submissions/{projectId}_{uid})
 *   7. Return results to client
 */
exports.gradePFIProject = onCall({ ...cfOptions, timeoutSeconds: 60 }, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email || '';
    const { projectId, code, sourceFiles, entryPoint } = request.data || {};

    // ── Validate payload ──
    if (!projectId || typeof projectId !== 'string') {
        throw new HttpsError('invalid-argument', 'Missing projectId.');
    }

    // Support two modes: single-file (code string) or multi-file (sourceFiles dict)
    const isMultiFile = sourceFiles && typeof sourceFiles === 'object' && Object.keys(sourceFiles).length > 0;

    if (!isMultiFile && (!code || typeof code !== 'string')) {
        throw new HttpsError('invalid-argument', 'Missing code or sourceFiles.');
    }

    if (isMultiFile) {
        // Validate multi-file submission
        const totalSize = Object.values(sourceFiles).reduce((sum, v) => sum + (typeof v === 'string' ? v.length : 0), 0);
        if (totalSize > 500000) {
            throw new HttpsError('invalid-argument', 'Total project size exceeds 500KB limit.');
        }
        const fileCount = Object.keys(sourceFiles).length;
        if (fileCount > 20) {
            throw new HttpsError('invalid-argument', 'Too many files (20 file limit).');
        }
        // Validate entry point exists
        const ep = entryPoint || 'main.py';
        if (!sourceFiles[ep]) {
            throw new HttpsError('invalid-argument', `Entry point "${ep}" not found in uploaded files.`);
        }
    } else if (code.length > 51200) {
        throw new HttpsError('invalid-argument', 'Code exceeds 50KB limit.');
    }

    const validProjects = ['pfi-w1', 'pfi-w2', 'pfi-w3', 'pfi-w4'];
    if (!validProjects.includes(projectId)) {
        throw new HttpsError('invalid-argument', 'Invalid projectId.');
    }

    // ── Rate limiting: 5 submissions per project per hour ──
    const attemptsRef = db.collection(`users/${uid}/pfi_attempts`);
    const oneHourAgo = new Date(Date.now() - 3600000);
    try {
        const recentAttempts = await attemptsRef
            .where('projectId', '==', projectId)
            .where('timestamp', '>', oneHourAgo)
            .get();

        if (recentAttempts.size >= 20) {
            throw new HttpsError('resource-exhausted',
                'Rate limit: 20 submissions per project per hour. Try again later.');
        }
    } catch (e) {
        if (e instanceof HttpsError) throw e;
        // Index may not exist yet — allow the submission
        console.warn('[PFI] Rate limit query failed (index building?):', e.message);
    }

    // ── Fetch test spec ──
    const specDoc = await db.doc(`pfi_test_specs/${projectId}`).get();
    if (!specDoc.exists) {
        throw new HttpsError('not-found', 'Test spec not found for this project.');
    }
    const spec = specDoc.data();

    // ── Log the attempt ──
    attemptsRef.add({
        projectId,
        timestamp: FieldValue.serverTimestamp()
    }).catch(e => console.warn('[PFI] Attempt log failed:', e.message));

    // ── Call Cloud Run grader ──
    const GRADER_URL = process.env.PFI_GRADER_URL || 'https://pfi-grader-fgafgj7uoa-uc.a.run.app';
    let gradeResult;

    console.log(`[PFI] Mode: ${isMultiFile ? 'multi' : 'single'}, Code length: ${(code || '').length}, GRADER_URL: ${GRADER_URL ? 'SET' : 'EMPTY'}`);

    if (GRADER_URL) {
        // Production: call Cloud Run service
        try {
            const { GoogleAuth } = require('google-auth-library');
            const auth = new GoogleAuth();
            const client = await auth.getIdTokenClient(GRADER_URL);
            const response = await client.request({
                url: GRADER_URL + '/grade',
                method: 'POST',
                data: {
                    code: isMultiFile ? '' : code,
                    sourceFiles: isMultiFile ? sourceFiles : {},
                    entryPoint: isMultiFile ? (entryPoint || 'main.py') : 'student_code.py',
                    files: spec.files || {},
                    tests: spec.tests
                }
            });
            gradeResult = response.data;
            console.log(`[PFI] Cloud Run returned: success=${gradeResult?.success}, results=${gradeResult?.results?.length}, time=${gradeResult?.executionTime}`);
        } catch (e) {
            console.error('[PFI] Cloud Run grader call failed:', e.message);
            throw new HttpsError('internal', 'Grading service unavailable. Please try again.');
        }
    } else {
        // Fallback: static-only grading (no code execution, just code structure checks)
        // This allows the system to work before Cloud Run is deployed
        // For multi-file: concatenate all source files for static analysis
        const allCode = isMultiFile ? Object.values(sourceFiles).join('\n') : code;
        gradeResult = _staticOnlyGrade(allCode, spec.tests);
    }

    if (!gradeResult || !gradeResult.success) {
        throw new HttpsError('internal', gradeResult?.error || 'Grading failed.');
    }

    // ── Compute score from results ──
    const categoryScores = {};
    for (const cat of spec.rubricCategories) {
        categoryScores[cat.id] = { earned: 0, max: cat.maxPoints };
    }

    const testResults = [];
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const test of spec.tests) {
        const result = gradeResult.results.find(r => r.testId === test.id);
        const passed = result ? result.passed : false;
        const weight = test.weight || 1;
        totalWeight += weight;
        if (passed) earnedWeight += weight;

        // Collect evidence from Cloud Run check results
        const evidence = [];
        if (result && result.checks) {
            for (const check of result.checks) {
                if (check.evidence && check.evidence.length > 0) {
                    evidence.push(...check.evidence);
                }
            }
        }

        testResults.push({
            testId: test.id,
            name: test.name,
            passed: passed,
            category: test.category,
            evidence: evidence.slice(0, 5) // Cap at 5 per test
        });
    }

    // Distribute earned weight proportionally across categories
    for (const test of spec.tests) {
        const result = testResults.find(r => r.testId === test.id);
        if (!result || !result.passed) continue;

        const cat = categoryScores[test.category];
        if (!cat) continue;

        // Each test contributes its weight as a fraction of the category max
        const catTests = spec.tests.filter(t => t.category === test.category);
        const catTotalWeight = catTests.reduce((sum, t) => sum + (t.weight || 1), 0);
        const contribution = Math.round((test.weight / catTotalWeight) * cat.max);
        cat.earned = Math.min(cat.max, cat.earned + contribution);
    }

    const autoScore = Object.values(categoryScores).reduce((sum, c) => sum + c.earned, 0);
    const maxScore = spec.maxScore || 100;
    const passed = autoScore >= (spec.passingScore || 70);

    // ── Get student callsign ──
    let callsign = '';
    try {
        const userDoc = await db.doc(`users/${uid}`).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            callsign = userData.callsign || userData.displayName || '';
        }
    } catch (e) { /* silent */ }

    // ── Count previous attempts ──
    let attemptNumber = 1;
    const existingDoc = await db.doc(`pfi_submissions/${projectId}_${uid}`).get();
    if (existingDoc.exists) {
        attemptNumber = (existingDoc.data().attemptNumber || 0) + 1;
    }

    // ── Get first execution output for display ──
    let executionOutput = '';
    let executionError = null;
    const firstExecResult = gradeResult.results.find(r => {
        const test = spec.tests.find(t => t.id === r.testId);
        return test && test.type === 'execution';
    });
    if (firstExecResult) {
        executionOutput = firstExecResult.output || '';
    }

    // ── Store submission ──
    const submission = {
        projectId,
        uid,
        callsign,
        code: isMultiFile ? '' : (code || ''),
        sourceFiles: isMultiFile ? sourceFiles : {},
        entryPoint: isMultiFile ? (entryPoint || 'main.py') : '',
        isMultiFile: isMultiFile || false,
        submittedAt: FieldValue.serverTimestamp(),
        attemptNumber,
        autoScore,
        maxScore,
        passed,
        categoryScores,
        testResults,
        executionOutput: executionOutput.substring(0, 10000), // Cap at 10KB
        executionError,
        executionTime: gradeResult.executionTime || 0,
        needsInstructorReview: autoScore >= 50 && autoScore < 70, // Borderline
        instructorScore: null,
        instructorFeedback: null
    };

    await db.doc(`pfi_submissions/${projectId}_${uid}`).set(submission);

    // ── Return to client ──
    return {
        autoScore,
        maxScore,
        passed,
        categoryScores,
        testResults,
        executionOutput: executionOutput.substring(0, 5000),
        attemptNumber,
        executionTime: gradeResult.executionTime || 0
    };
});

/**
 * Fallback grading when Cloud Run is not available.
 * Only runs static checks (code structure) — no execution tests.
 */
function _staticOnlyGrade(code, tests) {
    const results = [];
    for (const test of tests) {
        if (test.type === 'execution') {
            // Skip execution tests — mark as failed with explanation
            results.push({
                testId: test.id,
                name: test.name,
                passed: false,
                output: '',
                checks: [{ checkType: 'execution', passed: false, detail: 'Code execution not available (grader service offline)' }]
            });
        } else if (test.type === 'static') {
            // Run static checks locally
            const checks = test.checks || [];
            const checkResults = checks.map(check => {
                let passed = false;
                try {
                    switch (check.type) {
                        case 'code_contains':
                            passed = code.includes(check.value);
                            break;
                        case 'code_not_contains':
                            passed = !code.includes(check.value);
                            break;
                        case 'code_regex':
                            passed = new RegExp(check.pattern, check.flags || '').test(code);
                            break;
                        case 'code_regex_count': {
                            const matches = code.match(new RegExp(check.pattern, (check.flags || '') + 'g')) || [];
                            passed = matches.length >= (check.minCount || 1);
                            break;
                        }
                    }
                } catch (e) { /* silent */ }
                return { checkType: check.type, passed, detail: '' };
            });
            results.push({
                testId: test.id,
                name: test.name,
                passed: checkResults.every(c => c.passed),
                output: '',
                checks: checkResults
            });
        }
    }
    return { success: true, results, executionTime: 0, error: null };
}

// ─── Analytics v2 — Event Log Platform (Phase 1) ───────────────────
// Architecture: _docs/architecture/student-analytics-v2.md
// Module: ./analytics-v2.js
const _analyticsV2 = require('./analytics-v2');
exports.getSessionToken       = _analyticsV2.getSessionToken;
exports.refreshSessionToken   = _analyticsV2.refreshSessionToken;
exports.ingestEvents          = _analyticsV2.ingestEvents;
exports.projectEvent          = _analyticsV2.projectEvent;
exports.projectorHeartbeatJob = _analyticsV2.projectorHeartbeatJob;

// ─── Analytics v2 — Self-Heal Health Monitor ──────────────────────
// Scheduled job; writes _triage_queue items if projector pipeline silent
const _analyticsV2Health = require('./analytics-v2-health');
exports.analyticsHealthCheck  = _analyticsV2Health.analyticsHealthCheck;

// ─── Quiz Quality Monitor — Weekly C9 cross-quiz duplicate scan ────
// Scheduled job; reads quiz_keys/ collection, writes QUIZ-DUP triage items
const _quizQualityMonitor = require('./quiz-quality-monitor');
exports.quizQualityMonitor    = _quizQualityMonitor.quizQualityMonitor;

// ─── Operator Board — XIAO 7.5" ePaper status display ──────────────
// HTTP endpoint; serves a PNG image rendered for the e-paper panel.
// Phase 1: static Hello World image. Phase 2: composed from Firestore.
// Project: _tools/operator-board/
const _operatorBoard = require('./operator-board');
exports.operatorBoard         = _operatorBoard.operatorBoard;

// ─── Hex AI Bridge — CF → hexclass Dr. Hex orchestrator ────────────
// hexAiChat: authenticated callable; proxies signed-in user chat to the
// orchestrator with server-derived role + API key from Secret Manager.
// hexAiHealth: authenticated callable; reports orchestrator reachability.
// Architecture: _docs/architecture/dr-hex-orchestrator.md (v0.3.0+)
const _hexAiBridge = require('./hex-ai-bridge');
exports.hexAiChat             = _hexAiBridge.hexAiChat;
exports.hexAiChatStream       = _hexAiBridge.hexAiChatStream;
exports.hexAiHealth           = _hexAiBridge.hexAiHealth;
exports.hexAiToolCallback     = _hexAiBridge.hexAiToolCallback;   // v0.6.0c-3 audit sink
exports.hexAiToolDispatch     = _hexAiBridge.hexAiToolDispatch;   // v0.6.0c-2 Firestore-backed tools
exports.hexAiSecurityEvent    = _hexAiBridge.hexAiSecurityEvent;  // cyber-hardening 2026-05-25 — defense-layer event sink
exports.hexAiQualityObservation = _hexAiBridge.hexAiQualityObservation; // AI-26 2026-05-30, voice_linter to dr_hex_quality_observations sink
exports.hexAiAmbientState     = _hexAiBridge.hexAiAmbientState;   // mood-ring 2026-05-25 — button state computer
exports.hexAiRecordLabAttempt = _hexAiBridge.hexAiRecordLabAttempt; // AI-20 2026-05-30, lab_attempts data path for educational-lab mood-ring
exports.hexAiEngagementEvent  = _hexAiBridge.hexAiEngagementEvent; // TELEMETRY-001 2026-05-25 — post-intervention engagement

// LIVE-2 (2026-06-03) — scheduled aggregator that polls USAJobs +
// Hacker News + WWR for cybersecurity jobs and internships, tags
// each with Hexworth house affinity, and writes to Firestore
// featured_opportunities. Read by Internship Finder + Job Board
// live-feed sections (LIVE-4). Schedule: every 4h at :15.
exports.fetchOpportunities = require('./fetchOpportunities').fetchOpportunities;

// Sextant Stage 1 (design D) — weekly scheduled job. Reconciles any deferred withdrawal
// purges, then freezes each consented, recently-active learner's position into Plane B only
// (tokenized cohort, sextant_cohort_points — no PII). The identified self-view is NOT persisted;
// it is derived live by getMyTrajectory. Design: _docs/architecture/career-trajectory-navigator.md
exports.sextantSnapshot = require('./sextant').sextantSnapshot;
