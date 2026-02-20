/**
 * FirestoreManager.js - Cloud Database Manager for Hexworth Prime
 *
 * Handles all Firestore operations:
 * - User profiles (callsign, house, tier, XP)
 * - Progress tracking (modules, achievements)
 * - localStorage migration
 * - Leaderboards
 * - Grandfathering existing users
 *
 * Dependencies: Firebase SDK (loaded dynamically)
 */

const FirestoreManager = (function() {
    'use strict';

    // Firestore instance
    let db = null;
    let initialized = false;

    // Collection names
    const COLLECTIONS = {
        USERS: 'users',
        LEADERBOARDS: 'leaderboards'
    };

    // User tiers
    const TIERS = {
        FOUNDING_MEMBER: 'founding_member',  // Grandfathered beta users
        FREE: 'free',                         // Default free tier
        PRO: 'pro',                           // Paid individual
        INSTRUCTOR: 'instructor',             // Can create classrooms
        ENTERPRISE: 'enterprise'              // Institutional
    };

    // XP values for actions (aligned with ProgressManager.XP_REWARDS)
    const XP_VALUES = {
        PRESENTATION_VIEW: 50,
        QUIZ_PASS: 100,
        QUIZ_PERFECT: 200,
        LAB_COMPLETE: 500,
        MODULE_COMPLETE: 1000,
        COURSE_COMPLETE: 10000,
        GAME_HIGH_SCORE: 1000,
        TOOL_EXPLORE: 50,
        DAILY_LOGIN: 25,
        FIRST_IN_HOUSE: 100
    };

    // localStorage keys to migrate
    const LOCALSTORAGE_KEYS = {
        house: 'hexworth_house',
        progress: 'hexworth_progress',
        achievements: 'hexworth_achievements',
        quizScores: 'hexworth_quiz_scores',
        labProgress: 'hexworth_lab_progress',
        xp: 'hexworth_xp',
        discoveryPoints: 'hexworth_discovery_points',
        streak: 'hexworth_streak',
        lastLogin: 'hexworth_last_login',
        favorites: 'hexworth_favorites'
    };

    // Gate localStorage keys (not in LOCALSTORAGE_KEYS because they use a different pattern)
    const GATE_STORAGE_PREFIX = 'gate';
    const GATE_STORAGE_SUFFIX = '_complete';
    const DARK_ARTS_UNLOCKED_KEY = 'dark_arts_unlocked';

    // ─── Bulk localStorage Sync (Cross-Device Persistence) ───────────
    // Keys matching these prefixes/exact names are EXCLUDED from sync
    // (device-local, session, cache, or migration-specific)
    const SYNC_EXCLUDED_KEYS = new Set([
        'hexworth_firebase_user', 'hexworth_firebase_admin', 'hexworth_uid',
        'hexworth_device_id', 'hexworth_migrated_to_firestore', 'hexworth_gt_v2',
        'hexworth_progress_migrated', 'hexworth_auto_backup', 'hexworth_backup_offered',
        'hexworth_active_tab', 'hexworth_retake_sorting', 'hexworth_synced_activity',
        'hexworth_sync_queue', 'hexworth_version_cache', 'hexworth_start_times',
        'hexworth_github_token', 'hexworth_github_client_id', 'hexworth_github_gist_id',
        'hexworth_enrolled_classes', 'glitch_firefly_spawned',
        'hexworth_hed_log', 'hexworth_hed_enabled', 'hexworth_hed_pending'
    ]);
    const SYNC_EXCLUDED_PREFIXES = [
        'hexworth_house_tab_', 'skill-tree-', 'clh031-panel-',
        'leaderboard_cache_', 'ring_', 'oasis_'
    ];
    const SYNC_MAX_VALUE_SIZE = 10000;  // 10KB per value
    const SYNC_MAX_KEYS = 300;

    /**
     * Restore gate completion progress from Firestore subcollection to localStorage.
     * Reads users/{uid}/gates/* and sets gate{N}_complete + dark_arts_unlocked flags.
     * Called by restoreFromCloud and syncBidirectional.
     *
     * @param {string} uid - Firebase UID
     * @returns {object} - { gatesRestored: number, maxGate: number }
     */
    async function _restoreGateProgress(uid) {
        try {
            const { collection, doc, getDocs } = window.firebaseFirestore;
            const gatesRef = collection(doc(db, COLLECTIONS.USERS, uid), 'gates');
            const snapshot = await getDocs(gatesRef);

            let gatesRestored = 0;
            let maxGate = 0;

            snapshot.forEach(gateDoc => {
                const data = gateDoc.data();
                if (data.completed) {
                    const gateNum = data.gateNumber || parseInt(gateDoc.id.replace('gate', ''));
                    if (gateNum) {
                        localStorage.setItem(`${GATE_STORAGE_PREFIX}${gateNum}${GATE_STORAGE_SUFFIX}`, 'true');
                        gatesRestored++;
                        if (gateNum > maxGate) maxGate = gateNum;
                    }
                }
            });

            // If gate 5 or higher is completed, unlock the Dark Arts vault
            if (maxGate >= 5) {
                localStorage.setItem(DARK_ARTS_UNLOCKED_KEY, 'true');
            }

            if (gatesRestored > 0) {
                console.log(`[FirestoreManager] Restored ${gatesRestored} gate(s) from cloud (max: gate ${maxGate})`);
            }

            return { gatesRestored, maxGate };
        } catch (error) {
            console.warn('[FirestoreManager] Gate progress restore failed:', error.message);
            return { gatesRestored: 0, maxGate: 0 };
        }
    }

    /**
     * Check if a localStorage key should be synced across devices.
     */
    function _isSyncableKey(key) {
        if (!key || typeof key !== 'string') return false;
        if (SYNC_EXCLUDED_KEYS.has(key)) return false;
        for (const prefix of SYNC_EXCLUDED_PREFIXES) {
            if (key.startsWith(prefix)) return false;
        }
        return true;
    }

    /**
     * Collect all syncable localStorage key-value pairs.
     * Returns a plain object suitable for Firestore storage.
     */
    function _collectSyncableState() {
        const state = {};
        let count = 0;
        for (let i = 0; i < localStorage.length && count < SYNC_MAX_KEYS; i++) {
            const key = localStorage.key(i);
            if (!_isSyncableKey(key)) continue;
            const value = localStorage.getItem(key);
            if (value !== null && value.length <= SYNC_MAX_VALUE_SIZE) {
                state[key] = value;
                count++;
            }
        }
        return state;
    }

    /**
     * Write bulk localStorage sync blob to Firestore.
     * Stored at users/{uid}/sync/localStorage for clean separation.
     */
    async function _writeSyncBlob(uid) {
        try {
            const { doc, setDoc, serverTimestamp } = window.firebaseFirestore;
            const syncRef = doc(db, COLLECTIONS.USERS, uid, 'sync', 'localStorage');
            const state = _collectSyncableState();
            await setDoc(syncRef, {
                data: state,
                keyCount: Object.keys(state).length,
                syncedAt: serverTimestamp()
            });
            console.log(`[FirestoreManager] Sync blob written (${Object.keys(state).length} keys)`);
        } catch (error) {
            console.warn('[FirestoreManager] Sync blob write failed:', error.message);
        }
    }

    /**
     * Restore bulk localStorage from Firestore sync blob.
     * Only restores keys that don't already exist locally (no overwrite).
     */
    async function _restoreSyncBlob(uid) {
        try {
            const { doc, getDoc } = window.firebaseFirestore;
            const syncRef = doc(db, COLLECTIONS.USERS, uid, 'sync', 'localStorage');
            const snapshot = await getDoc(syncRef);

            if (!snapshot.exists()) {
                console.log('[FirestoreManager] No sync blob found');
                return 0;
            }

            const { data } = snapshot.data();
            if (!data || typeof data !== 'object') return 0;

            let restored = 0;
            for (const [key, value] of Object.entries(data)) {
                if (typeof value !== 'string') continue;
                // Only restore keys that are missing locally
                if (localStorage.getItem(key) === null) {
                    localStorage.setItem(key, value);
                    restored++;
                }
            }

            console.log(`[FirestoreManager] Sync blob restored (${restored} new keys from ${Object.keys(data).length} total)`);
            return restored;
        } catch (error) {
            console.warn('[FirestoreManager] Sync blob restore failed:', error.message);
            return 0;
        }
    }

    /**
     * Initialize Firestore
     */
    async function init() {
        if (initialized) return true;

        try {
            // Wait for Firebase SDK
            if (!window.firebaseApp) {
                console.warn('[FirestoreManager] Waiting for Firebase SDK...');
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!window.firebaseApp) {
                    throw new Error('Firebase SDK not loaded');
                }
            }

            // Import Firestore module (same version as auth)
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
            window.firebaseFirestore = firestoreModule;

            // Get Firestore instance
            const { getFirestore } = firestoreModule;
            const { getApps } = window.firebaseApp;

            if (getApps().length === 0) {
                throw new Error('Firebase app not initialized');
            }

            db = getFirestore(getApps()[0]);
            initialized = true;
            console.log('[FirestoreManager] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[FirestoreManager] Initialization failed:', error);
            return false;
        }
    }

    /**
     * Get current user's UID from FirebaseAuth
     */
    function getCurrentUID() {
        if (typeof FirebaseAuth !== 'undefined') {
            const user = FirebaseAuth.getUser();
            return user?.uid || null;
        }
        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // USER PROFILE OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Create or update user profile
     */
    async function setUserProfile(uid, data) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { doc, setDoc, serverTimestamp } = window.firebaseFirestore;
            const userRef = doc(db, COLLECTIONS.USERS, uid);

            await setDoc(userRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });

            console.log('[FirestoreManager] User profile updated:', uid);
            return true;
        } catch (error) {
            console.error('[FirestoreManager] Failed to set user profile:', error);
            return false;
        }
    }

    /**
     * Get user profile
     */
    async function getUserProfile(uid) {
        if (!initialized) await init();
        if (!db) return null;

        try {
            const { doc, getDoc } = window.firebaseFirestore;
            const userRef = doc(db, COLLECTIONS.USERS, uid);
            const snapshot = await getDoc(userRef);

            if (snapshot.exists()) {
                return { uid, ...snapshot.data() };
            }
            return null;
        } catch (error) {
            console.error('[FirestoreManager] Failed to get user profile:', error);
            return null;
        }
    }

    /**
     * Check if callsign is available
     */
    async function isCallsignAvailable(callsign) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { collection, query, where, getDocs } = window.firebaseFirestore;
            const usersRef = collection(db, COLLECTIONS.USERS);
            const q = query(usersRef, where('callsignLower', '==', callsign.toLowerCase()));
            const snapshot = await getDocs(q);

            return snapshot.empty;
        } catch (error) {
            console.error('[FirestoreManager] Failed to check callsign:', error);
            return false;
        }
    }

    /**
     * Set user's callsign
     */
    async function setCallsign(uid, callsign) {
        // Validate callsign format
        if (!validateCallsign(callsign)) {
            return { success: false, error: 'Invalid callsign format' };
        }

        // Check availability
        const available = await isCallsignAvailable(callsign);
        if (!available) {
            return { success: false, error: 'Callsign already taken' };
        }

        // Save
        const success = await setUserProfile(uid, {
            callsign: callsign,
            callsignLower: callsign.toLowerCase()
        });

        return { success, error: success ? null : 'Failed to save' };
    }

    /**
     * Validate callsign format
     */
    function validateCallsign(callsign) {
        if (!callsign || typeof callsign !== 'string') return false;

        // 3-16 characters, alphanumeric + underscore, can't start with number
        const pattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
        if (!pattern.test(callsign)) return false;

        // Basic profanity filter (extend as needed)
        const blocked = ['admin', 'moderator', 'hexworth', 'system', 'null', 'undefined'];
        if (blocked.includes(callsign.toLowerCase())) return false;

        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // PROGRESS & XP OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Add XP to user via Cloud Function (server authority)
     */
    async function addXP(uid, amount, reason) {
        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                const result = await FirebaseAuth.callFunction('addXP', {
                    amount: amount,
                    reason: reason || 'unspecified'
                });
                console.log(`[FirestoreManager] Added ${amount} XP via CF: ${reason}`);
                return true;
            }
            console.warn('[FirestoreManager] addXP skipped — not signed in');
            return false;
        } catch (error) {
            console.error('[FirestoreManager] Failed to add XP:', error);
            return false;
        }
    }

    /**
     * Record module completion via Cloud Function (server authority)
     */
    async function completeModule(uid, moduleId, house) {
        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                await FirebaseAuth.callFunction('recordProgress', {
                    type: 'module',
                    itemId: moduleId,
                    house: house || null
                });
                console.log(`[FirestoreManager] Module completed via CF: ${moduleId}`);
                return true;
            }
            console.warn('[FirestoreManager] completeModule skipped — not signed in');
            return false;
        } catch (error) {
            console.error('[FirestoreManager] Failed to record module completion:', error);
            return false;
        }
    }

    /**
     * Record quiz pass via Cloud Function (server authority)
     */
    async function passQuiz(uid, quizId, score, house) {
        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                await FirebaseAuth.callFunction('recordProgress', {
                    type: 'quiz',
                    itemId: quizId,
                    score: score,
                    house: house || null
                });
                return true;
            }
            console.warn('[FirestoreManager] passQuiz skipped — not signed in');
            return false;
        } catch (error) {
            console.error('[FirestoreManager] Failed to record quiz pass:', error);
            return false;
        }
    }

    /**
     * Record lab completion via Cloud Function (server authority)
     */
    async function completeLab(uid, labId, house) {
        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                await FirebaseAuth.callFunction('recordProgress', {
                    type: 'lab',
                    itemId: labId,
                    house: house || null
                });
                return true;
            }
            console.warn('[FirestoreManager] completeLab skipped — not signed in');
            return false;
        } catch (error) {
            console.error('[FirestoreManager] Failed to record lab completion:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // LOCALSTORAGE MIGRATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get all progress from localStorage
     */
    function getLocalStorageProgress() {
        const data = {};

        try {
            // House
            data.house = localStorage.getItem(LOCALSTORAGE_KEYS.house);

            // Progress (modules completed)
            const progress = localStorage.getItem(LOCALSTORAGE_KEYS.progress);
            data.modulesCompleted = progress ? JSON.parse(progress) : [];

            // Achievements
            const achievements = localStorage.getItem(LOCALSTORAGE_KEYS.achievements);
            data.achievements = achievements ? JSON.parse(achievements) : [];

            // Quiz scores
            const quizzes = localStorage.getItem(LOCALSTORAGE_KEYS.quizScores);
            data.quizzes = quizzes ? JSON.parse(quizzes) : {};

            // Lab progress
            const labs = localStorage.getItem(LOCALSTORAGE_KEYS.labProgress);
            data.labsCompleted = labs ? JSON.parse(labs) : [];

            // Streak
            data.streak = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.streak) || '0');

            // XP calculation - read stored XP as-is (discovery points tracked separately)
            let totalXP = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.xp) || '0');

            // If XP is still 0, calculate from progress data
            if (totalXP === 0) {
                // 75 XP per completed module
                if (Array.isArray(data.modulesCompleted)) {
                    totalXP += data.modulesCompleted.length * 75;
                }
                // 15 XP per achievement
                if (Array.isArray(data.achievements)) {
                    totalXP += data.achievements.length * 15;
                }
                // Streak bonus
                totalXP += data.streak * 10;
            }

            data.xp = totalXP;

            // Check if there's any actual data
            const hasData = data.house ||
                           data.modulesCompleted.length > 0 ||
                           data.achievements.length > 0 ||
                           Object.keys(data.quizzes).length > 0 ||
                           data.labsCompleted.length > 0 ||
                           data.xp > 0;

            return hasData ? data : null;
        } catch (error) {
            console.error('[FirestoreManager] Failed to read localStorage:', error);
            return null;
        }
    }

    /**
     * Migrate localStorage progress to Firestore
     */
    async function migrateFromLocalStorage(uid, email) {
        const localData = getLocalStorageProgress();

        if (!localData) {
            console.log('[FirestoreManager] No localStorage data to migrate');
            return { migrated: false, reason: 'no_data' };
        }

        console.log('[FirestoreManager] Migrating localStorage data:', localData);

        // Check if user already has Firestore data
        const existingProfile = await getUserProfile(uid);

        // Use Cloud Function for migration (writes protected fields)
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
            try {
                await FirebaseAuth.callFunction('syncProgress', {
                    modulesCompleted: localData.modulesCompleted || [],
                    labsCompleted: localData.labsCompleted || [],
                    xp: localData.xp || 0,
                    streak: localData.streak || 0,
                    achievements: localData.achievements || [],
                    quizzes: localData.quizzes || {}
                });

                // Also write safe fields directly (house, email)
                if (localData.house) {
                    await setUserProfile(uid, {
                        house: localData.house
                    });
                }

                console.log('[FirestoreManager] Migrated localStorage to Firestore via CF');
                return { migrated: true, reason: existingProfile ? 'merged' : 'fresh_migration' };
            } catch (err) {
                console.warn('[FirestoreManager] Migration via CF failed:', err.message);
                return { migrated: false, reason: 'cf_error' };
            }
        } else {
            console.warn('[FirestoreManager] Migration skipped — not signed in');
            return { migrated: false, reason: 'not_signed_in' };
        }
    }

    /**
     * Merge cloud and local progress (take higher/more complete values)
     */
    function mergeProgress(cloudData, localData) {
        // Helper to safely convert a value to an array of unique strings.
        // Handles arrays, objects (by taking keys), or null/undefined.
        const normalizeToArray = (data) => {
            if (Array.isArray(data)) {
                return data;
            }
            if (typeof data === 'object' && data !== null) {
                return Object.keys(data);
            }
            return [];
        };

        return {
            // Keep existing profile data
            ...cloudData,

            // Take higher XP
            xp: Math.max(cloudData.xp || 0, localData.xp || 0),

            // Take higher streak
            streak: Math.max(cloudData.streak || 0, localData.streak || 0),

            // Merge arrays (union)
            modulesCompleted: [...new Set([
                ...normalizeToArray(cloudData.modulesCompleted),
                ...normalizeToArray(localData.modulesCompleted)
            ])],

            labsCompleted: [...new Set([
                ...normalizeToArray(cloudData.labsCompleted),
                ...normalizeToArray(localData.labsCompleted)
            ])],

            achievements: [...new Set([
                ...(cloudData.achievements || []),
                ...(localData.achievements || [])
            ])],

            // Merge quiz scores (keep highest)
            quizzes: mergeQuizScores(cloudData.quizzes || {}, localData.quizzes || {})
        };
    }

    /**
     * Merge quiz scores keeping highest scores
     */
    function mergeQuizScores(cloud, local) {
        const merged = { ...cloud };

        for (const [quizId, localScore] of Object.entries(local)) {
            if (!merged[quizId] || localScore.score > merged[quizId].score) {
                merged[quizId] = localScore;
            }
        }

        return merged;
    }

    // ═══════════════════════════════════════════════════════════════
    // GRANDFATHERING
    // ═══════════════════════════════════════════════════════════════

    /**
     * Mark user as grandfathered (founding member)
     * NOTE: tier/grandfathered are protected fields — this requires admin context.
     * Call from Firebase console or a Cloud Function, not from client-side code.
     */
    async function grandfatherUser(uid) {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
            try {
                await FirebaseAuth.callFunction('syncProgress', {
                    // syncProgress won't write tier/grandfathered, but this is a
                    // placeholder. A dedicated CF should be created for grandfathering.
                });
            } catch (e) { /* ignore */ }
        }
        console.warn('[FirestoreManager] grandfatherUser requires admin SDK — use Firebase console');
        return false;
    }

    /**
     * Check if user is grandfathered
     */
    async function isGrandfathered(uid) {
        const profile = await getUserProfile(uid);
        return profile?.grandfathered === true;
    }

    /**
     * Batch grandfather all existing users (run once during migration)
     * This should be called with a list of UIDs from Firebase Auth
     */
    async function batchGrandfatherUsers(uids) {
        if (!initialized) await init();
        if (!db) return { success: false, count: 0 };

        let count = 0;
        for (const uid of uids) {
            const success = await grandfatherUser(uid);
            if (success) count++;
        }

        console.log(`[FirestoreManager] Grandfathered ${count}/${uids.length} users`);
        return { success: true, count };
    }

    // ═══════════════════════════════════════════════════════════════
    // LEADERBOARDS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Calculate level from XP
     */
    function calculateLevel(xp) {
        // Level formula: Level = floor(sqrt(xp / 100)) + 1
        return Math.floor(Math.sqrt((xp || 0) / 100)) + 1;
    }

    /**
     * Get global leaderboard (top users by XP)
     */
    async function getGlobalLeaderboard(limit = 50) {
        if (!initialized) await init();
        if (!db) return [];

        try {
            const { collection, query, orderBy, limit: limitFn, getDocs } = window.firebaseFirestore;
            const usersRef = collection(db, COLLECTIONS.USERS);
            const q = query(usersRef, orderBy('xp', 'desc'), limitFn(limit));
            const snapshot = await getDocs(q);

            const leaderboard = [];
            let rank = 1;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.callsign) {  // Only show users with callsigns
                    leaderboard.push({
                        rank: rank++,
                        id: doc.id,
                        callsign: data.callsign,
                        displayName: data.displayName || data.callsign,
                        photoURL: data.photoURL || null,
                        house: data.house || 'web',
                        totalXP: data.xp || 0,
                        level: calculateLevel(data.xp),
                        tier: data.tier || 'free',
                        modulesCompleted: data.modulesCompleted?.length || 0
                    });
                }
            });

            return leaderboard;
        } catch (error) {
            console.error('[FirestoreManager] Failed to get global leaderboard:', error);
            return [];
        }
    }

    /**
     * Get house-specific leaderboard
     */
    async function getHouseLeaderboard(house, limit = 25) {
        if (!initialized) await init();
        if (!db) return [];

        try {
            const { collection, query, where, orderBy, limit: limitFn, getDocs } = window.firebaseFirestore;
            const usersRef = collection(db, COLLECTIONS.USERS);
            const q = query(
                usersRef,
                where('house', '==', house),
                orderBy('xp', 'desc'),
                limitFn(limit)
            );
            const snapshot = await getDocs(q);

            const leaderboard = [];
            let rank = 1;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.callsign) {
                    leaderboard.push({
                        rank: rank++,
                        id: doc.id,
                        callsign: data.callsign,
                        displayName: data.displayName || data.callsign,
                        photoURL: data.photoURL || null,
                        house: house,
                        totalXP: data.xp || 0,
                        level: calculateLevel(data.xp),
                        tier: data.tier || 'free',
                        modulesCompleted: data.modulesCompleted?.length || 0
                    });
                }
            });

            return leaderboard;
        } catch (error) {
            console.error('[FirestoreManager] Failed to get house leaderboard:', error);
            return [];
        }
    }

    /**
     * Get user's rank and stats (for display when not in top)
     */
    async function getUserRank(uid, house = null) {
        // Get user profile first
        const profile = await getUserProfile(uid);
        if (!profile) return null;

        // Get appropriate leaderboard
        const leaderboard = house
            ? await getHouseLeaderboard(house, 1000)
            : await getGlobalLeaderboard(1000);

        const index = leaderboard.findIndex(entry => entry.id === uid);
        const rank = index >= 0 ? index + 1 : leaderboard.length + 1;

        return {
            rank,
            callsign: profile.callsign,
            house: profile.house || 'web',
            totalXP: profile.xp || 0,
            level: calculateLevel(profile.xp),
            tier: profile.tier || 'free'
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // GAME SCOREBOARDS
    // ═══════════════════════════════════════════════════════════════

    // In-memory cache: gameId → { data, fetchedAt }
    const _scoreboardCache = {};
    const SCOREBOARD_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

    /**
     * Submit a game score to the global scoreboard via Cloud Function.
     * @param {string} gameId
     * @param {number} score
     * @param {{ sessionDuration: number }} meta
     * @returns {{ qualified: boolean, rank: number|null } | null}
     */
    async function submitGameScore(gameId, score, meta) {
        try {
            if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.getUser()) {
                return null;
            }
            const result = await FirebaseAuth.callFunction('submitGameScore', {
                gameId,
                score,
                sessionDuration: meta.sessionDuration || 0,
                meta
            });
            // Invalidate cache for this game on successful submission
            delete _scoreboardCache[gameId];
            return result.data || result;
        } catch (error) {
            console.warn('[FirestoreManager] submitGameScore failed:', error.message);
            return null;
        }
    }

    /**
     * Get global scoreboard for a game (top 10). 2-minute cache.
     * @param {string} gameId
     * @returns {{ topScores: Array, lowestTopScore: number, entryCount: number } | null}
     */
    async function getGameScoreboard(gameId) {
        // Check cache
        const cached = _scoreboardCache[gameId];
        if (cached && (Date.now() - cached.fetchedAt) < SCOREBOARD_CACHE_TTL) {
            return cached.data;
        }

        if (!initialized) await init();
        if (!db) return null;

        try {
            const { doc, getDoc } = window.firebaseFirestore;
            const scoreRef = doc(db, 'game_scores', gameId);
            const snapshot = await getDoc(scoreRef);

            if (!snapshot.exists()) {
                const empty = { topScores: [], lowestTopScore: 0, entryCount: 0 };
                _scoreboardCache[gameId] = { data: empty, fetchedAt: Date.now() };
                return empty;
            }

            const data = snapshot.data();
            _scoreboardCache[gameId] = { data, fetchedAt: Date.now() };
            return data;
        } catch (error) {
            console.error('[FirestoreManager] getGameScoreboard failed:', error);
            return null;
        }
    }

    /**
     * Batch-fetch scoreboards for multiple games (parallel, 10 at a time).
     * @param {string[]} gameIds
     * @returns {Object<string, object>} map of gameId → scoreboard data
     */
    async function getGameScoreboards(gameIds) {
        const results = {};
        const chunks = [];

        // Split into chunks of 10
        for (let i = 0; i < gameIds.length; i += 10) {
            chunks.push(gameIds.slice(i, i + 10));
        }

        for (const chunk of chunks) {
            const fetches = chunk.map(async (id) => {
                results[id] = await getGameScoreboard(id);
            });
            await Promise.all(fetches);
        }

        return results;
    }

    /**
     * Get the minimum score needed to enter the top 10 for a game.
     * Returns 0 if the board isn't full yet.
     * @param {string} gameId
     * @returns {number}
     */
    async function getGameScoreThreshold(gameId) {
        const board = await getGameScoreboard(gameId);
        if (!board || board.entryCount < 10) return 0;
        return board.lowestTopScore || 0;
    }

    // ═══════════════════════════════════════════════════════════════
    // CLOUD RESTORE (New Device / Fresh Cache)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Restore user data from Firestore to localStorage
     * Used when returning user signs in on a new device or after cache clear
     * @param {string} uid - User's Firebase UID
     * @returns {object} - { restored: boolean, house: string|null, theme: string|null, profile: object|null }
     */
    async function restoreFromCloud(uid) {
        if (!initialized) await init();
        if (!db) return { restored: false, reason: 'db_unavailable' };

        try {
            const profile = await getUserProfile(uid);

            if (!profile) {
                console.log('[FirestoreManager] No cloud profile found for user');
                return { restored: false, reason: 'no_profile' };
            }

            console.log('[FirestoreManager] Restoring from cloud:', profile);

            // First: restore bulk sync blob (sets ALL syncable keys from last device)
            // This runs first so specific field restores below can override if needed
            const bulkRestored = await _restoreSyncBlob(uid);

            // Restore house
            if (profile.house) {
                localStorage.setItem(LOCALSTORAGE_KEYS.house, profile.house);
            }

            // Restore theme (stored separately in Firestore if available, otherwise infer from house)
            const theme = profile.theme || (profile.house === 'operator' ? 'matrix' : 'magic');
            localStorage.setItem('hexworth_theme', theme);

            // Restore achievements (array of IDs - compatible with AchievementManager)
            if (profile.achievements && profile.achievements.length > 0) {
                localStorage.setItem(LOCALSTORAGE_KEYS.achievements, JSON.stringify(profile.achievements));
            }

            // Restore quiz scores
            if (profile.quizzes && Object.keys(profile.quizzes).length > 0) {
                localStorage.setItem(LOCALSTORAGE_KEYS.quizScores, JSON.stringify(profile.quizzes));
            }

            // Restore XP and streak
            if (profile.xp) {
                localStorage.setItem(LOCALSTORAGE_KEYS.xp, profile.xp.toString());
            }

            if (profile.streak) {
                localStorage.setItem(LOCALSTORAGE_KEYS.streak, profile.streak.toString());
            }

            // Restore favorites (merge with local)
            if (profile.favorites && Array.isArray(profile.favorites)) {
                if (typeof FavoritesManager !== 'undefined') {
                    FavoritesManager.mergeFromCloud(profile.favorites);
                } else {
                    // Direct merge if FavoritesManager not loaded yet
                    try {
                        const localFavs = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.favorites) || '[]');
                        const localIds = new Set(localFavs.map(f => f.id));
                        profile.favorites.forEach(cf => {
                            if (cf.id && !localIds.has(cf.id)) localFavs.push(cf);
                        });
                        localStorage.setItem(LOCALSTORAGE_KEYS.favorites, JSON.stringify(localFavs));
                    } catch (e) { /* ignore */ }
                }
            }

            // Rebuild hexworth_progress in the nested object format that labs/dashboard expect
            // Convert modulesCompleted array to nested house progress object
            const existingProgress = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.progress) || '{}');

            // Only rebuild if existing progress is empty or is an array (old format)
            if (!existingProgress || Array.isArray(existingProgress) || Object.keys(existingProgress).length === 0) {
                const rebuiltProgress = {};

                // Convert modulesCompleted array to nested format
                if (profile.modulesCompleted && Array.isArray(profile.modulesCompleted)) {
                    profile.modulesCompleted.forEach(moduleId => {
                        // Parse module ID to extract house (e.g., 'forge-admin-tools-lab' -> 'forge')
                        const parts = moduleId.split('-');
                        const house = parts[0];
                        const moduleKey = parts.slice(1).join('-') || moduleId;

                        if (!rebuiltProgress[house]) {
                            rebuiltProgress[house] = {};
                        }
                        rebuiltProgress[house][moduleKey] = {
                            completed: true,
                            restoredFromCloud: true
                        };
                    });
                }

                // Also add labs to progress
                if (profile.labsCompleted && Array.isArray(profile.labsCompleted)) {
                    profile.labsCompleted.forEach(labId => {
                        const parts = labId.split('-');
                        const house = parts[0];
                        const labKey = parts.slice(1).join('-') || labId;

                        if (!rebuiltProgress[house]) {
                            rebuiltProgress[house] = {};
                        }
                        rebuiltProgress[house][labKey] = {
                            completed: true,
                            restoredFromCloud: true
                        };
                    });
                }

                if (Object.keys(rebuiltProgress).length > 0) {
                    localStorage.setItem(LOCALSTORAGE_KEYS.progress, JSON.stringify(rebuiltProgress));
                    console.log('[FirestoreManager] Rebuilt progress in nested format:', rebuiltProgress);
                }
            } else {
                console.log('[FirestoreManager] Existing progress found, not overwriting:', existingProgress);
            }

            // Restore gate completion progress from subcollection
            const gateResult = await _restoreGateProgress(uid);

            console.log('[FirestoreManager] Cloud data restored to localStorage');

            return {
                restored: true,
                house: profile.house || null,
                theme: theme,
                profile: profile,
                hasHouse: !!profile.house,
                gatesRestored: gateResult.gatesRestored
            };
        } catch (error) {
            console.error('[FirestoreManager] Failed to restore from cloud:', error);
            return { restored: false, reason: 'error', error: error.message };
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // BIDIRECTIONAL SYNC (Cross-Device Progress)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Bidirectional sync: merge cloud profile ↔ localStorage
     * Called on every auth state change (dashboard load, sign-in, etc.)
     * Ensures progress from all devices is merged and consistent.
     *
     * @param {string} uid - Firebase UID
     * @returns {object} - { synced, modulesCount, added }
     */
    async function syncBidirectional(uid) {
        if (!initialized) await init();
        if (!db) return { synced: false, reason: 'db_unavailable' };

        try {
            // 1. Fetch cloud profile
            const cloudProfile = await getUserProfile(uid);
            if (!cloudProfile) {
                console.log('[FirestoreManager] No cloud profile for bidirectional sync');
                return { synced: false, reason: 'no_profile' };
            }

            // 2. Read local progress (the nested object the dashboard reads)
            const localProgress = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.progress) || '{}');
            let addedToLocal = 0;
            let addedToCloud = 0;

            // 3. Cloud → Local: add cloud completions missing from localStorage
            const cloudModules = Array.isArray(cloudProfile.modulesCompleted) ? cloudProfile.modulesCompleted : [];
            const cloudLabs = Array.isArray(cloudProfile.labsCompleted) ? cloudProfile.labsCompleted : [];

            cloudModules.forEach(moduleId => {
                const { house, key } = parseModuleId(moduleId);
                if (!house || !key) return;
                if (!localProgress[house]) localProgress[house] = {};
                if (!localProgress[house][key] || !localProgress[house][key].completed) {
                    localProgress[house][key] = {
                        completed: true,
                        restoredFromCloud: true,
                        date: new Date().toISOString()
                    };
                    addedToLocal++;
                }
            });

            cloudLabs.forEach(labId => {
                const { house, key } = parseModuleId(labId);
                if (!house || !key) return;
                if (!localProgress[house]) localProgress[house] = {};
                if (!localProgress[house][key] || !localProgress[house][key].completed) {
                    localProgress[house][key] = {
                        completed: true,
                        restoredFromCloud: true,
                        date: new Date().toISOString()
                    };
                    addedToLocal++;
                }
            });

            // Cloud quizzes → local quiz_scores
            const cloudQuizzes = cloudProfile.quizzes || {};
            const localQuizzes = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.quizScores) || '{}');
            const mergedQuizzes = mergeQuizScores(cloudQuizzes, localQuizzes);

            // Cloud quizzes → local progress entries
            Object.entries(cloudQuizzes).forEach(([quizId, quizData]) => {
                const { house, key } = parseModuleId(quizId);
                if (!house || !key) return;
                if (!localProgress[house]) localProgress[house] = {};
                if (!localProgress[house][key] || !localProgress[house][key].completed) {
                    if (quizData.score >= 70 || quizData.passed) {
                        localProgress[house][key] = {
                            completed: true,
                            score: quizData.score,
                            restoredFromCloud: true,
                            date: quizData.passedAt || new Date().toISOString()
                        };
                        addedToLocal++;
                    }
                }
            });

            // 4. Local → Cloud: collect all local completions into module ID sets
            const allModuleIds = new Set(cloudModules);
            const allLabIds = new Set(cloudLabs);

            Object.entries(localProgress).forEach(([house, modules]) => {
                if (typeof modules !== 'object' || modules === null) return;
                Object.entries(modules).forEach(([key, data]) => {
                    if (data && data.completed) {
                        const fullId = `${house}-${key}`;
                        if (!allModuleIds.has(fullId)) addedToCloud++;
                        allModuleIds.add(fullId);
                        // Also classify as lab if LearningPaths confirms it
                        if (typeof LearningPaths !== 'undefined' && LearningPaths.getModule) {
                            const mod = LearningPaths.getModule(fullId);
                            if (mod && mod.type === 'lab') {
                                allLabIds.add(fullId);
                            }
                        }
                    }
                });
            });

            // 5. Merge scalar values (take max)
            const localXP = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.xp) || '0');
            const mergedXP = Math.max(cloudProfile.xp || 0, localXP);

            const localStreak = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.streak) || '0');
            const mergedStreak = Math.max(cloudProfile.streak || 0, localStreak);

            // Merge achievements (union)
            const localAchievements = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.achievements) || '[]');
            const cloudAchievements = cloudProfile.achievements || [];
            // Normalize: both arrays may contain strings or objects with .id
            const normalizeAch = arr => arr.map(a => typeof a === 'string' ? a : (a?.id || '')).filter(Boolean);
            const mergedAchievementIds = [...new Set([...normalizeAch(localAchievements), ...normalizeAch(cloudAchievements)])];

            // Merge favorites (union by ID)
            const localFavorites = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.favorites) || '[]');
            const cloudFavorites = Array.isArray(cloudProfile.favorites) ? cloudProfile.favorites : [];
            const favIdSet = new Set();
            const mergedFavorites = [];
            [...localFavorites, ...cloudFavorites].forEach(f => {
                if (f && f.id && !favIdSet.has(f.id)) {
                    favIdSet.add(f.id);
                    mergedFavorites.push(f);
                }
            });

            // 6. Write merged data to localStorage
            localStorage.setItem(LOCALSTORAGE_KEYS.progress, JSON.stringify(localProgress));
            localStorage.setItem(LOCALSTORAGE_KEYS.xp, mergedXP.toString());
            localStorage.setItem(LOCALSTORAGE_KEYS.streak, mergedStreak.toString());
            localStorage.setItem(LOCALSTORAGE_KEYS.achievements, JSON.stringify(mergedAchievementIds));
            localStorage.setItem(LOCALSTORAGE_KEYS.quizScores, JSON.stringify(mergedQuizzes));
            localStorage.setItem(LOCALSTORAGE_KEYS.favorites, JSON.stringify(mergedFavorites));

            // Restore house if missing locally
            if (cloudProfile.house && !localStorage.getItem(LOCALSTORAGE_KEYS.house)) {
                localStorage.setItem(LOCALSTORAGE_KEYS.house, cloudProfile.house);
            }

            // 6b. Restore gate completion progress from subcollection
            const gateResult = await _restoreGateProgress(uid);
            if (gateResult.gatesRestored > 0) addedToLocal += gateResult.gatesRestored;

            // 7. Write merged data to Firestore via Cloud Function (server authority)
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                try {
                    await FirebaseAuth.callFunction('syncProgress', {
                        modulesCompleted: [...allModuleIds],
                        labsCompleted: [...allLabIds],
                        xp: mergedXP,
                        streak: mergedStreak,
                        achievements: mergedAchievementIds,
                        quizzes: mergedQuizzes,
                        favorites: mergedFavorites
                    });
                } catch (syncErr) {
                    console.warn('[FirestoreManager] Cloud sync failed, data saved locally:', syncErr.message);
                }
            }

            // 8. Write bulk localStorage sync blob (captures ALL syncable state)
            await _writeSyncBlob(uid);

            console.log(`[FirestoreManager] Bidirectional sync complete: +${addedToLocal} to local, +${addedToCloud} to cloud`);

            // Dispatch event so dashboard can re-render
            window.dispatchEvent(new CustomEvent('hexworth:cloudSyncComplete', {
                detail: { addedToLocal, addedToCloud, totalModules: allModuleIds.size }
            }));

            return { synced: true, modulesCount: allModuleIds.size, addedToLocal, addedToCloud };
        } catch (error) {
            console.error('[FirestoreManager] Bidirectional sync error:', error);
            return { synced: false, reason: 'error', error: error.message };
        }
    }

    /**
     * Parse a module ID like "shield-security-fundamentals" into { house, key }
     * Handles all known house prefixes (single-word: web, shield, forge, etc.)
     */
    function parseModuleId(moduleId) {
        if (!moduleId || typeof moduleId !== 'string') return { house: null, key: null };
        const knownHouses = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];
        const parts = moduleId.split('-');
        if (parts.length < 2) return { house: null, key: null };

        // Check if first segment is a known house
        if (knownHouses.includes(parts[0])) {
            return { house: parts[0], key: parts.slice(1).join('-') };
        }

        // Fallback: first segment as house
        return { house: parts[0], key: parts.slice(1).join('-') || moduleId };
    }

    // ═══════════════════════════════════════════════════════════════
    // NEW USER SETUP
    // ═══════════════════════════════════════════════════════════════

    /**
     * Initialize new user after first sign-in
     * Called by FirebaseAuth after successful authentication
     */
    async function initializeNewUser(user) {
        if (!initialized) await init();

        const uid = user.uid;
        const email = user.email;

        console.log(`[FirestoreManager] Initializing user: ${email}`);

        // Check if user profile exists
        let profile = await getUserProfile(uid);

        if (!profile) {
            // Brand new user - create profile
            const { serverTimestamp } = window.firebaseFirestore;

            profile = {
                email,
                displayName: user.displayName || null,
                photoURL: user.photoURL || null,
                tier: TIERS.FREE,
                grandfathered: false,
                xp: 0,
                streak: 0,
                modulesCompleted: [],
                labsCompleted: [],
                achievements: [],
                quizzes: {},
                createdAt: serverTimestamp()
            };

            await setUserProfile(uid, profile);
            console.log('[FirestoreManager] Created new user profile');
        }

        // Try to migrate localStorage data (once only)
        let migration = null;
        if (!localStorage.getItem('hexworth_migrated_to_firestore')) {
            migration = await migrateFromLocalStorage(uid, email);
            localStorage.setItem('hexworth_migrated_to_firestore', 'true');
            console.log('[FirestoreManager] Migration complete, flag set');
        } else {
            console.log('[FirestoreManager] Migration already completed, skipping');
        }

        // syncBidirectional is called by the dashboard's firebaseAuthStateChanged handler
        const syncResult = null;

        // Recalculate XP if it's 0 (fix for users who migrated before XP calculation was fixed)
        const currentProfile = await getUserProfile(uid);
        if (currentProfile && (currentProfile.xp === 0 || !currentProfile.xp)) {
            const xpResult = await recalculateXP(uid);
            console.log('[FirestoreManager] XP recalculated:', xpResult);
        }

        // Check if user needs to set callsign
        const needsCallsign = !currentProfile?.callsign;

        return {
            profile: await getUserProfile(uid),  // Refresh after potential migration
            needsCallsign,
            migration,
            syncResult
        };
    }

    /**
     * Recalculate XP from localStorage and update Firestore
     * Call this to fix users with 0 XP after initial migration
     */
    async function recalculateXP(uid) {
        const localData = getLocalStorageProgress();
        if (!localData) {
            console.log('[FirestoreManager] No localStorage data to calculate XP from');
            return { success: false, xp: 0 };
        }

        let totalXP = 0;

        // 75 XP per completed module
        if (Array.isArray(localData.modulesCompleted)) {
            totalXP += localData.modulesCompleted.length * 75;
        }

        // 15 XP per achievement
        if (Array.isArray(localData.achievements)) {
            totalXP += localData.achievements.length * 15;
        }

        // Streak bonus
        totalXP += (localData.streak || 0) * 10;

        // Quiz completions (25 XP each)
        if (localData.quizzes) {
            totalXP += Object.keys(localData.quizzes).length * 25;
        }

        // Lab completions (50 XP each)
        if (Array.isArray(localData.labsCompleted)) {
            totalXP += localData.labsCompleted.length * 50;
        }

        console.log('[FirestoreManager] Recalculated XP:', totalXP, {
            modules: localData.modulesCompleted?.length || 0,
            achievements: localData.achievements?.length || 0,
            discoveryPoints,
            streak: localData.streak || 0,
            quizzes: Object.keys(localData.quizzes || {}).length,
            labs: localData.labsCompleted?.length || 0
        });

        // Update Firestore via Cloud Function (xp is a protected field)
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
            try {
                await FirebaseAuth.callFunction('syncProgress', { xp: totalXP });
            } catch (err) {
                console.warn('[FirestoreManager] XP sync via CF failed:', err.message);
            }
        }

        return { success: true, xp: totalXP };
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        // Core
        init,
        TIERS,
        XP_VALUES,

        // User Profile
        getUserProfile,
        setUserProfile,
        setCallsign,
        isCallsignAvailable,
        validateCallsign,

        // Progress
        addXP,
        completeModule,
        passQuiz,
        completeLab,
        recalculateXP,

        // Migration & Restore
        getLocalStorageProgress,
        migrateFromLocalStorage,
        restoreFromCloud,
        syncBidirectional,

        // Grandfathering
        grandfatherUser,
        isGrandfathered,
        batchGrandfatherUsers,

        // Leaderboards
        getGlobalLeaderboard,
        getHouseLeaderboard,
        getUserRank,
        calculateLevel,

        // Game Scoreboards
        submitGameScore,
        getGameScoreboard,
        getGameScoreboards,
        getGameScoreThreshold,

        // New User
        initializeNewUser,

        // DB access (for components that need direct Firestore queries)
        getDb: () => db
    };

})();

// NOTE: Don't auto-initialize - FirestoreManager.init() is called on-demand
// when needed (e.g., from FirebaseAuth after successful sign-in)
