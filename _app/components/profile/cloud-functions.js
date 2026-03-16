/**
 * F-21: Public Profile Cloud Functions
 *
 * These function exports should be added to functions/index.js.
 * They use the same patterns as existing functions (onCall, onRequest,
 * admin SDK for Firestore writes, cfOptions for region + App Check).
 *
 * Prerequisites (already in functions/index.js):
 *   const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
 *   const { onSchedule } = require('firebase-functions/v2/scheduler');
 *   const { initializeApp } = require('firebase-admin/app');
 *   const { getAuth } = require('firebase-admin/auth');
 *   const { getFirestore, FieldValue } = require('firebase-admin/firestore');
 *   const db = getFirestore();
 *   const cfOptions = { region: 'us-central1', enforceAppCheck: ENFORCE_APP_CHECK };
 *
 * NOTE: The scheduler import must be added at the top of functions/index.js:
 *   const { onSchedule } = require('firebase-functions/v2/scheduler');
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

// ─── F-21: Public Profile — Auto-Create on User Creation ─────────

/**
 * createPublicProfile — Triggered when a new user document is created
 * in the users collection. Creates a default public profile with
 * all privacy settings OFF (opt-in model).
 *
 * Trigger: Firestore document create on users/{uid}
 *
 * To add to functions/index.js, also import:
 *   const { onDocumentCreated } = require('firebase-functions/v2/firestore');
 */
exports.createPublicProfile = (() => {
    const { onDocumentCreated } = require('firebase-functions/v2/firestore');

    return onDocumentCreated({
        document: 'users/{uid}',
        region: 'us-central1'
    }, async (event) => {
        const uid = event.params.uid;
        const userData = event.data.data();

        if (!userData) {
            console.warn('[createPublicProfile] No user data for uid:', uid);
            return null;
        }

        const rankFromLevel = _calculateRank(userData.level || 1);

        // Create default public profile
        const publicProfile = {
            callsign: userData.callsign || 'Anonymous',
            house: userData.house || null,
            houseEmblem: _getHouseEmblem(userData.house),
            xp: userData.xp || 0,
            totalXP: userData.xp || 0,
            level: userData.level || 1,
            rank: rankFromLevel,
            modulesCompleted: userData.modulesCompleted || 0,
            boxesSolved: userData.ctfBoxesPwned || 0,
            achievementCount: 0,
            joinDate: FieldValue.serverTimestamp(),
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        if (userData.displayName) {
            publicProfile.displayName = userData.displayName;
        }

        const db = getFirestore();

        // Create the public profile document
        await db.doc(`publicProfiles/${uid}`).set(publicProfile);

        // Create default privacy settings (all OFF)
        await db.doc(`publicProfiles/${uid}/settings/privacy`).set({
            showXP: false,
            showHouse: false,
            showAchievements: false,
            showActivity: false,
            showRealName: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });

        console.log('[createPublicProfile] Created profile for uid:', uid);
        return null;
    });
})();


// ─── F-21: Public Profile — Daily Stats Sync ─────────────────────

/**
 * syncProfileStats — Scheduled function that runs daily at 03:00 UTC.
 * Reads each user's actual data from users/{uid} and updates their
 * publicProfiles/{uid} document with current stats.
 *
 * This ensures public profiles stay in sync even if the client-side
 * syncMyStats() was never called (offline users, API changes, etc.).
 */
exports.syncProfileStats = (() => {
    const { onSchedule } = require('firebase-functions/v2/scheduler');

    return onSchedule({
        schedule: 'every day 03:00',
        timeZone: 'America/New_York',
        region: 'us-central1'
    }, async (event) => {
        const db = getFirestore();
        const usersSnap = await db.collection('users').get();

        let updated = 0;
        let errors = 0;

        // Process in batches of 500 (Firestore batch limit)
        const BATCH_SIZE = 500;
        let batch = db.batch();
        let batchCount = 0;

        for (const userDoc of usersSnap.docs) {
            try {
                const uid = userDoc.id;
                const userData = userDoc.data();

                const profileRef = db.doc(`publicProfiles/${uid}`);
                const rankFromLevel = _calculateRank(userData.level || 1);

                const profileUpdate = {
                    callsign: userData.callsign || 'Anonymous',
                    house: userData.house || null,
                    houseEmblem: _getHouseEmblem(userData.house),
                    xp: userData.xp || 0,
                    totalXP: userData.xp || 0,
                    level: userData.level || 1,
                    rank: rankFromLevel,
                    modulesCompleted: userData.modulesCompleted || 0,
                    boxesSolved: userData.ctfBoxesPwned || 0,
                    achievementCount: Array.isArray(userData.achievements)
                        ? userData.achievements.length : 0,
                    updatedAt: FieldValue.serverTimestamp()
                };

                if (userData.displayName) {
                    profileUpdate.displayName = userData.displayName;
                }
                if (userData.firstName) {
                    profileUpdate.firstName = userData.firstName;
                }

                batch.set(profileRef, profileUpdate, { merge: true });
                batchCount++;
                updated++;

                // Commit batch when it hits the limit
                if (batchCount >= BATCH_SIZE) {
                    await batch.commit();
                    batch = db.batch();
                    batchCount = 0;
                }
            } catch (err) {
                console.error('[syncProfileStats] Error for user:', userDoc.id, err);
                errors++;
            }
        }

        // Commit remaining
        if (batchCount > 0) {
            await batch.commit();
        }

        console.log(`[syncProfileStats] Complete. Updated: ${updated}, Errors: ${errors}`);
        return null;
    });
})();


// ─── Shared Helpers ──────────────────────────────────────────────

/**
 * Calculate rank string from level (mirrors PublicProfile.js client-side)
 */
function _calculateRank(level) {
    if (level >= 50) return 'Architect';
    if (level >= 40) return 'Overseer';
    if (level >= 30) return 'Specialist';
    if (level >= 20) return 'Operator';
    if (level >= 15) return 'Agent';
    if (level >= 10) return 'Analyst';
    if (level >= 5)  return 'Cadet';
    return 'Recruit';
}

/**
 * Get house emblem filename from house ID
 */
function _getHouseEmblem(houseId) {
    const emblems = {
        web:        'icon-globe.webp',
        shield:     'icon-shield.webp',
        cloud:      'icon-cloud.webp',
        forge:      'icon-wrench.webp',
        script:     'icon-terminal.webp',
        code:       'icon-code.webp',
        key:        'icon-key.webp',
        eye:        'icon-magnifier.webp',
        'dark-arts':'icon-skull.webp',
        ai:         'icon-circuit.webp',
        matrix:     'icon-grid.webp'
    };
    return emblems[houseId] || null;
}
