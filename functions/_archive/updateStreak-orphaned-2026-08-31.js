/**
 * ARCHIVED 2026-08-31 — exports.updateStreak, removed from functions/index.js.
 *
 * WHY IT WAS REMOVED. It had no caller. Grepping _app for a callable invocation of
 * 'updateStreak' returned nothing, so this function never ran in production. It computed a
 * streak from users/{uid}.lastLoginDate, which is a DIFFERENT definition from the client's
 * (ModuleProgress.updateStreak, computed from hexworth_last_study). Two definitions of one
 * fact, one of them dead, is a trap waiting for whoever wires it up next. BUG-237.
 *
 * WHAT WAS DELIBERATELY *NOT* CHANGED. The Math.max(local, cloud) in
 * FirestoreManager.syncBidirectional STAYS. A reviewer caught that removing it — which was my
 * original proposal — would silently destroy real streaks: Device A studies ten days straight
 * and syncs streak=10; Device B, untouched for a month with local streak=0, opens the dashboard
 * and overwrites the cloud's 10 with its stale 0. That Math.max is cross-device reconciliation
 * and is load-bearing independently of this dead function. Its own comment says so.
 *
 * Kept under the never-destroy rule. If server-side streak is ever wanted, start here, but
 * reconcile the two definitions FIRST rather than adding a second writer to the same field.
 */

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
