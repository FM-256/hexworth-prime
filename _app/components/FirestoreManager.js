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

    // Shared mutex across syncBidirectional and restoreFromCloud. Both
    // functions read-then-write localStorage and a cloud profile doc;
    // concurrent invocations (e.g. ProgressRestore auto-sync racing
    // a user clicking the resync button) could last-write-wins with
    // stale snapshots. Set before the first await of each function,
    // cleared in finally. Nancy-required (2026-05-18, Phase 5 review).
    let _syncInFlight = false;

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

    // XP values — delegates to XPCalculator.XP_RATES (single source of truth)
    // Fallback constants only used if XPCalculator hasn't loaded yet
    const _XP_FALLBACK = {
        PRESENTATION_VIEW: 100, TOOL_EXPLORE: 100, QUIZ_PASS: 100,
        QUIZ_PERFECT: 200, GATE_CLEARED: 500, LAB_COMPLETE: 500,
        GAME_PLAYED: 100, MODULE_COMPLETE: 1000, COURSE_COMPLETE: 10000,
        DAILY_LOGIN: 25, FIRST_IN_HOUSE: 100
    };
    const XP_VALUES = new Proxy(_XP_FALLBACK, {
        get(fallback, key) {
            if (typeof XPCalculator !== 'undefined' && XPCalculator.XP_RATES && key in XPCalculator.XP_RATES) {
                return XPCalculator.XP_RATES[key];
            }
            return fallback[key];
        }
    });

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
    // Provenance written beside _complete, never instead of it. See _restoreGateProgress.
    const GATE_VERIFIED_SUFFIX = '_verified';
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
        'hexworth_hed_log', 'hexworth_hed_enabled', 'hexworth_hed_pending',
        'hexworth_xp', 'hexworth_level'  // Derived by XPCalculator — never sync raw values
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

                        /* CARRY THE PROVENANCE. The server deliberately records WHETHER a gate was
                           validated server-side (`verified`, `source`) because, per the comment in
                           `completeGate` in functions/index.js, "a reader that cannot tell the two
                           apart is how the vault ended up trusting forged progress" -- cited by
                           symbol, not line, because line numbers drift. This restore used to
                           write only the bare 'true' above, flattening a server-verified gate and a
                           client-attested one into the same value. BUG-239.

                           NO CONSUMER CHANGES, ON PURPOSE. Gates 6-8 are client-attested BY DESIGN
                           (they validate multi-step work in the browser), and their `verified` is
                           false permanently -- nothing will ever flip it. So requiring
                           verified===true anywhere that currently reads gate{N}_complete would
                           permanently lock every gate 6-8 completer out of content they legitimately
                           finished. The ~12 existing readers are untouched and keep reading the same
                           flag they always did; this only ADDS a field beside it.

                           Whether client attestation should gate vault content at all is a real
                           question about the vault's trust model. It is a product decision, not a
                           bug fix, and it is deliberately not made here. */
                        localStorage.setItem(
                            `${GATE_STORAGE_PREFIX}${gateNum}${GATE_VERIFIED_SUFFIX}`,
                            data.verified === true ? 'true' : 'false'
                        );

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
     * Merges with existing cloud data so a sparse device can't overwrite a full device's blob.
     * Stored at users/{uid}/sync/localStorage for clean separation.
     */
    async function _writeSyncBlob(uid) {
        try {
            const { doc, setDoc, getDoc, serverTimestamp } = window.firebaseFirestore;
            const syncRef = doc(db, COLLECTIONS.USERS, uid, 'sync', 'localStorage');

            // Read existing blob to preserve data from other devices
            let existingData = {};
            try {
                const existing = await getDoc(syncRef);
                if (existing.exists() && existing.data().data) {
                    existingData = existing.data().data;
                }
            } catch (e) { /* ignore read failures */ }

            const localState = _collectSyncableState();

            // Deep merge per key: preserves completion monotonicity
            // (a sparse device can't overwrite a full device's progress)
            const deepMerge = (typeof SyncUtils !== 'undefined')
                ? SyncUtils.deepMerge
                : function(cloud, local) { return local; };

            const merged = { ...existingData };
            for (const [key, localValue] of Object.entries(localState)) {
                const cloudValue = existingData[key];
                if (!cloudValue || cloudValue === localValue) {
                    merged[key] = localValue;
                } else {
                    // Both exist and differ — deep merge the JSON values
                    try {
                        const cloudParsed = JSON.parse(cloudValue);
                        const localParsed = JSON.parse(localValue);
                        merged[key] = JSON.stringify(deepMerge(cloudParsed, localParsed));
                    } catch (e) {
                        // Not JSON — local wins for non-JSON strings
                        merged[key] = localValue;
                    }
                }
            }

            await setDoc(syncRef, {
                data: merged,
                keyCount: Object.keys(merged).length,
                syncedAt: serverTimestamp()
            });
            console.log(`[FirestoreManager] Sync blob written (${Object.keys(merged).length} merged keys: ${Object.keys(localState).length} local + ${Object.keys(existingData).length} cloud)`);
        } catch (error) {
            console.warn('[FirestoreManager] Sync blob write failed:', error.message);
        }
    }

    /**
     * Restore bulk localStorage from Firestore sync blob.
     * Missing keys: restored from cloud.
     * Existing keys: deep-merged with completion monotonicity (truthy wins).
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

            // Deep merge via SyncUtils — enforces completion monotonicity:
            // booleans: truthy wins, numbers: Math.max, objects: recursive merge
            const deepMerge = (typeof SyncUtils !== 'undefined')
                ? SyncUtils.deepMerge
                : function(cloud, local) { return local; };

            let restored = 0;
            let merged = 0;
            for (const [key, value] of Object.entries(data)) {
                if (typeof value !== 'string') continue;
                // Skip excluded keys (derived values like hexworth_xp/level)
                if (!_isSyncableKey(key)) continue;
                const local = localStorage.getItem(key);
                if (local === null) {
                    // Key missing locally — restore from cloud
                    // SAFETY: for progress keys, only restore if cloud has real data
                    if (key === LOCALSTORAGE_KEYS.progress) {
                        try {
                            const cloudProg = JSON.parse(value);
                            if (!cloudProg || Object.keys(cloudProg).length === 0) continue;
                        } catch (e) { continue; }
                    }
                    localStorage.setItem(key, value);
                    restored++;
                } else if (local !== value) {
                    // Key exists locally with different value — deep merge
                    try {
                        const cloudParsed = JSON.parse(value);
                        const localParsed = JSON.parse(local);
                        const mergedResult = deepMerge(cloudParsed, localParsed);
                        localStorage.setItem(key, JSON.stringify(mergedResult));
                        merged++;
                    } catch (e) {
                        // Not JSON — apply scalar monotonicity
                        if (value === 'true' && local !== 'true') {
                            localStorage.setItem(key, value);
                            merged++;
                        } else if (/^\d+$/.test(value) && /^\d+$/.test(local)) {
                            if (parseInt(value, 10) > parseInt(local, 10)) {
                                localStorage.setItem(key, value);
                                merged++;
                            }
                        }
                    }
                }
            }

            console.log(`[FirestoreManager] Sync blob restored (${restored} new + ${merged} merged from ${Object.keys(data).length} total)`);
            return restored + merged;
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
        // Unified quadratic formula (matches ProgressManager + XPCalculator)
        if (!xp || xp <= 0) return 1;
        return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
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
     * Get users flagged by the integrity system (status === 'violated').
     * Used by the Shame Corner on the dashboard.
     */
    async function getFlaggedUsers(limit = 20) {
        if (!initialized) await init();
        if (!db) return [];

        try {
            const { collection, query, where, limit: limitFn, getDocs } = window.firebaseFirestore;
            const usersRef = collection(db, COLLECTIONS.USERS);
            // Single-field where — no composite index needed
            const q = query(usersRef, where('integrity.status', '==', 'violated'), limitFn(limit));
            const snapshot = await getDocs(q);

            const flagged = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                flagged.push({
                    id: doc.id,
                    callsign: data.callsign || 'Unknown',
                    photoURL: data.photoURL || null,
                    house: data.house || 'web',
                    integrity: data.integrity || {}
                });
            });

            return flagged;
        } catch (error) {
            console.error('[FirestoreManager] Failed to get flagged users:', error);
            return [];
        }
    }

    /**
     * Search users by callsign prefix.
     * Uses Firestore range query on callsignLower (already indexed).
     */
    async function searchUsers(prefix, limit = 10) {
        if (!initialized) await init();
        if (!db) return [];
        if (!prefix || prefix.length < 2) return [];

        try {
            const { collection, query, where, limit: limitFn, getDocs } = window.firebaseFirestore;
            const usersRef = collection(db, COLLECTIONS.USERS);
            // Firestore prefix range pattern: >= prefix, <= prefix + high Unicode char
            const q = query(
                usersRef,
                where('callsignLower', '>=', prefix),
                where('callsignLower', '<=', prefix + '\uf8ff'),
                limitFn(limit)
            );
            const snapshot = await getDocs(q);

            const results = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.callsign) {
                    results.push({
                        id: doc.id,
                        callsign: data.callsign,
                        displayName: data.displayName || data.callsign,
                        photoURL: data.photoURL || null,
                        house: data.house || 'web',
                        xp: data.xp || 0,
                        integrity: data.integrity || null
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('[FirestoreManager] Failed to search users:', error);
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
        if (_syncInFlight) return { restored: false, reason: 'in_flight', skipped: true };
        if (!initialized) await init();
        if (!db) return { restored: false, reason: 'db_unavailable' };

        _syncInFlight = true;
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

            // Restore quiz scores — MERGE not clobber. Keeps the higher score
            // per quiz so Device-A's better attempt isn't lost when Device-B
            // pulls cloud. Mirrors syncBidirectional's behavior.
            if (profile.quizzes && Object.keys(profile.quizzes).length > 0) {
                const localQuizzes = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.quizScores) || '{}');
                const mergedQuizzes = mergeQuizScores(profile.quizzes, localQuizzes);
                localStorage.setItem(LOCALSTORAGE_KEYS.quizScores, JSON.stringify(mergedQuizzes));
            }

            // Restore XP — use deterministic calculator if available, else cloud value
            if (typeof XPCalculator !== 'undefined') {
                const calc = XPCalculator.recalculate();
                localStorage.setItem(LOCALSTORAGE_KEYS.xp, calc.xp.toString());
            } else if (profile.xp) {
                localStorage.setItem(LOCALSTORAGE_KEYS.xp, profile.xp.toString());
            }

            // Streak — take MAX(local, cloud). A user who racked up streak on
            // Device-A while Device-B was offline shouldn't lose the streak
            // when Device-B pulls cloud (which may have an older value).
            if (profile.streak) {
                const localStreak = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.streak) || '0', 10);
                const cloudStreak = parseInt(profile.streak, 10) || 0;
                const maxStreak = Math.max(localStreak, cloudStreak);
                if (maxStreak > 0) {
                    localStorage.setItem(LOCALSTORAGE_KEYS.streak, maxStreak.toString());
                }
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
            // SAFETY: always MERGE cloud completions into local — never overwrite or reduce
            const existingProgress = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.progress) || '{}');
            const mergeTarget = (!existingProgress || Array.isArray(existingProgress))
                ? {} : existingProgress;

            let cloudAdded = 0;
            const addCloudCompletion = (moduleId) => {
                const parts = moduleId.split('-');
                const house = parts[0];
                const key = parts.slice(1).join('-') || moduleId;
                if (!house || !key) return;
                if (!mergeTarget[house] || typeof mergeTarget[house] !== 'object') mergeTarget[house] = {};
                if (!mergeTarget[house][key] || !mergeTarget[house][key].completed) {
                    mergeTarget[house][key] = { completed: true, restoredFromCloud: true };
                    cloudAdded++;
                }
            };

            if (Array.isArray(profile.modulesCompleted)) {
                profile.modulesCompleted.forEach(addCloudCompletion);
            }
            if (Array.isArray(profile.labsCompleted)) {
                profile.labsCompleted.forEach(addCloudCompletion);
            }

            if (cloudAdded > 0) {
                localStorage.setItem(LOCALSTORAGE_KEYS.progress, JSON.stringify(mergeTarget));
                console.log(`[FirestoreManager] Merged ${cloudAdded} cloud completions into local progress`);
            } else {
                console.log('[FirestoreManager] No new cloud completions to merge');
            }

            // Restore gate completion progress from subcollection
            const gateResult = await _restoreGateProgress(uid);

            console.log('[FirestoreManager] Cloud data restored to localStorage');

            // Stamp last-sync time so the dashboard "Last cloud sync" display
            // and any UI relying on freshness can read it. Writes from THIS
            // device's perspective — cache clear nukes it intentionally.
            try { localStorage.setItem('hexworth_last_cloud_sync', new Date().toISOString()); } catch (e) {}

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
        } finally {
            _syncInFlight = false;
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
     * Flow (9 steps, order matters):
     *   1. Fetch cloud profile
     *   2. Read local progress
     *   3. Cloud → Local: restore completions missing from this device
     *   4. Local → Cloud: union arrays (filter garbage IDs to prevent re-inflation)
     *   5. Merge scalars — XPCalculator is sole XP authority (never trust stored XP)
     *   6. Write merged state to localStorage (re-read first to catch race conditions)
     *   6a. Update AchievementRegistry v2 format from merged achievements
     *   6b. Restore gate completion progress from Firestore subcollection
     *   7. Push merged arrays to syncProgress CF (server derives XP, ignores client XP)
     *   8. Restore bulk sync blob from other devices + re-clean garbage after merge
     *   9. Final XPCalculator.recalculate() to ensure localStorage XP matches reality
     *
     * Why this order: Cloud data must be merged into local BEFORE local→cloud push,
     * otherwise we'd overwrite cloud with stale local data. Step 9 runs AFTER blob
     * restore because the blob may add completions that change the XP total.
     *
     * @param {string} uid - Firebase UID
     * @returns {object} - { synced, modulesCount, added }
     */
    async function syncBidirectional(uid) {
        if (_syncInFlight) return { synced: false, reason: 'in_flight', skipped: true };
        if (!initialized) await init();
        if (!db) return { synced: false, reason: 'db_unavailable' };

        _syncInFlight = true;
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

            if (!Array.isArray(localProgress.completedModules)) localProgress.completedModules = [];

            cloudModules.forEach(moduleId => {
                const { house, key } = parseModuleId(moduleId);
                if (!house || !key) return;
                if (!localProgress[house] || typeof localProgress[house] !== 'object') localProgress[house] = {};
                if (!localProgress[house][key] || !localProgress[house][key].completed) {
                    localProgress[house][key] = {
                        completed: true,
                        restoredFromCloud: true,
                        date: new Date().toISOString()
                    };
                    addedToLocal++;
                }
                // Also populate completedModules[] so XPCalculator can see cloud-restored items
                if (!localProgress.completedModules.includes(moduleId)) {
                    localProgress.completedModules.push(moduleId);
                }
            });

            if (!Array.isArray(localProgress.labsCompleted)) localProgress.labsCompleted = [];

            cloudLabs.forEach(labId => {
                const { house, key } = parseModuleId(labId);
                if (!house || !key) return;
                if (!localProgress[house] || typeof localProgress[house] !== 'object') localProgress[house] = {};
                if (!localProgress[house][key] || !localProgress[house][key].completed) {
                    localProgress[house][key] = {
                        completed: true,
                        restoredFromCloud: true,
                        date: new Date().toISOString()
                    };
                    addedToLocal++;
                }
                // Populate completedModules[] and labsCompleted[] for XPCalculator
                if (!localProgress.completedModules.includes(labId)) {
                    localProgress.completedModules.push(labId);
                }
                if (!localProgress.labsCompleted.includes(labId)) {
                    localProgress.labsCompleted.push(labId);
                }
            });

            // Cloud quizzes → local quiz_scores
            const cloudQuizzes = cloudProfile.quizzes || {};
            const localQuizzes = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.quizScores) || '{}');
            const mergedQuizzes = mergeQuizScores(cloudQuizzes, localQuizzes);

            // Cloud quizzes → local progress entries
            if (!Array.isArray(localProgress.quizHistory)) localProgress.quizHistory = [];

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
                // Populate completedModules[] and quizHistory[] for XPCalculator
                if (quizData.score >= 70 || quizData.passed) {
                    if (!localProgress.completedModules.includes(quizId)) {
                        localProgress.completedModules.push(quizId);
                    }
                    if (!localProgress.quizHistory.some(q => q.moduleId === quizId)) {
                        localProgress.quizHistory.push({
                            moduleId: quizId,
                            score: quizData.score,
                            houseId: house,
                            completedAt: Date.now(),
                            restoredFromCloud: true
                        });
                    }
                }
            });

            // 4. Local → Cloud: union local completedModules/labsCompleted arrays with cloud
            // Filter garbage: only accept IDs with a known house prefix and a non-empty key
            const _validHouses = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye', 'ai', 'linux', 'arena', 'divergent', 'matrix'];
            const _isValidId = (id) => {
                if (!id || typeof id !== 'string') return false;
                if (id.startsWith('dark-arts-') && id.length > 10) return true;
                const dash = id.indexOf('-');
                if (dash < 1) return false;
                const house = id.slice(0, dash);
                const key = id.slice(dash + 1);
                if (!key || !_validHouses.includes(house)) return false;
                if (key.startsWith(house + '-')) return false;
                if (_validHouses.includes(key)) return false;
                return true;
            };
            // Clean localProgress arrays IN PLACE so Step 6 localStorage write is also clean
            localProgress.completedModules = [...new Set(
                (Array.isArray(localProgress.completedModules) ? localProgress.completedModules : []).filter(_isValidId)
            )];
            localProgress.labsCompleted = [...new Set(
                (Array.isArray(localProgress.labsCompleted) ? localProgress.labsCompleted : []).filter(_isValidId)
            )];
            const allModuleIds = new Set([...cloudModules, ...localProgress.completedModules]);
            const allLabIds = new Set([...cloudLabs, ...localProgress.labsCompleted]);
            addedToCloud = allModuleIds.size - cloudModules.length;

            // 5. Merge scalar values — XPCalculator is sole authority
            let mergedXP;
            if (typeof XPCalculator !== 'undefined') {
                mergedXP = XPCalculator.recalculate().xp;
            } else {
                mergedXP = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.xp) || '0');
            }

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
            // SAFETY: re-read localStorage to catch any completions added during async sync
            // and merge them in so we never lose progress written by ModuleProgress.complete()
            try {
                const freshLocal = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.progress) || '{}');
                for (const [house, modules] of Object.entries(freshLocal)) {
                    if (!modules || typeof modules !== 'object' || Array.isArray(modules)) continue;
                    if (!_validHouses.includes(house) && house !== 'dark-arts') continue;  // skip numeric/garbage keys
                    if (typeof localProgress[house] !== 'object') localProgress[house] = {};
                    for (const [modId, modData] of Object.entries(modules)) {
                        if (modData && modData.completed && (!localProgress[house][modId] || !localProgress[house][modId].completed)) {
                            localProgress[house][modId] = modData;
                        }
                    }
                }
                // Preserve completedModules from fresh read too (filter garbage to prevent re-introduction)
                if (Array.isArray(freshLocal.completedModules)) {
                    if (!Array.isArray(localProgress.completedModules)) localProgress.completedModules = [];
                    freshLocal.completedModules.filter(_isValidId).forEach(id => {
                        if (!localProgress.completedModules.includes(id)) localProgress.completedModules.push(id);
                    });
                }
            } catch (e) { /* best-effort merge */ }
            localStorage.setItem(LOCALSTORAGE_KEYS.progress, JSON.stringify(localProgress));
            localStorage.setItem(LOCALSTORAGE_KEYS.xp, mergedXP.toString());
            localStorage.setItem(LOCALSTORAGE_KEYS.streak, mergedStreak.toString());
            localStorage.setItem(LOCALSTORAGE_KEYS.achievements, JSON.stringify(mergedAchievementIds));
            localStorage.setItem(LOCALSTORAGE_KEYS.quizScores, JSON.stringify(mergedQuizzes));
            localStorage.setItem(LOCALSTORAGE_KEYS.favorites, JSON.stringify(mergedFavorites));

            // 6a. Update AchievementRegistry v2 storage (old key is for compat, v2 is what the UI reads)
            try {
                const V2_KEY = 'hexworth_achievements_v2';
                const v2Raw = localStorage.getItem(V2_KEY);
                const v2 = v2Raw ? JSON.parse(v2Raw) : null;
                const v2Data = (v2 && v2.version === 2 && v2.unlocked)
                    ? v2
                    : { version: 2, unlocked: {}, migratedAt: Date.now() };
                let v2Added = 0;
                for (const id of mergedAchievementIds) {
                    if (!v2Data.unlocked[id]) {
                        v2Data.unlocked[id] = { unlockedAt: null, source: 'cloud_sync' };
                        v2Added++;
                    }
                }
                if (v2Added > 0 || !v2Raw) {
                    localStorage.setItem(V2_KEY, JSON.stringify(v2Data));
                    console.log(`[FirestoreManager] Achievements v2 updated: +${v2Added} from cloud (${Object.keys(v2Data.unlocked).length} total)`);
                }
            } catch (e) {
                console.warn('[FirestoreManager] Achievements v2 update failed:', e.message);
            }

            // Restore house if missing locally
            if (cloudProfile.house && !localStorage.getItem(LOCALSTORAGE_KEYS.house)) {
                localStorage.setItem(LOCALSTORAGE_KEYS.house, cloudProfile.house);
            }

            // 6b. Restore gate completion progress from subcollection
            const gateResult = await _restoreGateProgress(uid);
            if (gateResult.gatesRestored > 0) addedToLocal += gateResult.gatesRestored;

            // 7. Push merged arrays to syncProgress Cloud Function.
            // The CF derives XP server-side from completion arrays — it ignores the
            // client's xp field. This prevents stale localStorage XP from overwriting
            // corrected Firestore values (the bug that caused VORYX's XP re-inflation).
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

                // XP is written to Firestore in step 9 after all sync operations complete
            }

            // 8. Restore bulk sync blob — a device-specific snapshot of ALL hexworth_*
            // localStorage keys. This catches data that doesn't fit the structured
            // fields above (e.g. WSA course progress, StateFederation handles).
            const blobRestored = await _restoreSyncBlob(uid);
            addedToLocal += blobRestored;

            // 8a. Re-clean progress arrays after blob merge — older blobs may contain
            // garbage module IDs that were cleaned from this device but persisted in
            // another device's snapshot. Without this, garbage would re-infect arrays.
            try {
                const hp = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.progress) || '{}');
                let blobCleaned = false;
                if (Array.isArray(hp.completedModules)) {
                    const before = hp.completedModules.length;
                    hp.completedModules = [...new Set(hp.completedModules.filter(_isValidId))];
                    if (hp.completedModules.length < before) blobCleaned = true;
                }
                if (Array.isArray(hp.labsCompleted)) {
                    const before = hp.labsCompleted.length;
                    hp.labsCompleted = [...new Set(hp.labsCompleted.filter(_isValidId))];
                    if (hp.labsCompleted.length < before) blobCleaned = true;
                }
                if (blobCleaned) localStorage.setItem(LOCALSTORAGE_KEYS.progress, JSON.stringify(hp));
            } catch (e) { /* best-effort */ }

            await _writeSyncBlob(uid);

            // 9. Final XP recalculation — must happen AFTER blob restore (step 8)
            // because the blob may have added completions that change the XP total.
            // XPCalculator.recalculate() is a pure function that derives XP from
            // the current localStorage state — it never reads cached/stale values.
            if (typeof XPCalculator !== 'undefined') {
                const finalCalc = XPCalculator.recalculate();
                const finalXP = finalCalc.xp;
                const finalLevel = finalCalc.level;
                localStorage.setItem(LOCALSTORAGE_KEYS.xp, finalXP.toString());
                localStorage.setItem('hexworth_level', finalLevel.toString());
                // Also fix xp/level inside hexworth_progress
                try {
                    const hp = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEYS.progress) || '{}');
                    if (hp.xp !== finalXP || hp.level !== finalLevel) {
                        hp.xp = finalXP;
                        hp.level = finalLevel;
                        localStorage.setItem(LOCALSTORAGE_KEYS.progress, JSON.stringify(hp));
                    }
                } catch (e) { /* best-effort */ }
                // XP + level are derived server-side by syncProgress CF.
                // No client-side Firestore write needed — server ignores client XP.
            }

            console.log(`[FirestoreManager] Bidirectional sync complete: +${addedToLocal} to local, +${addedToCloud} to cloud`);

            // Stamp last-sync time so the dashboard "Last cloud sync" display
            // can read it. Same key as restoreFromCloud.
            try { localStorage.setItem('hexworth_last_cloud_sync', new Date().toISOString()); } catch (e) {}

            // Dispatch event so dashboard can re-render
            window.dispatchEvent(new CustomEvent('hexworth:cloudSyncComplete', {
                detail: { addedToLocal, addedToCloud, totalModules: allModuleIds.size }
            }));

            return { synced: true, modulesCount: allModuleIds.size, addedToLocal, addedToCloud };
        } catch (error) {
            console.error('[FirestoreManager] Bidirectional sync error:', error);
            return { synced: false, reason: 'error', error: error.message };
        } finally {
            _syncInFlight = false;
        }
    }

    /**
     * Parse a module ID like "shield-security-fundamentals" into { house, key }
     * Handles all known house prefixes (single-word: web, shield, forge, etc.)
     */
    function parseModuleId(moduleId) {
        if (!moduleId || typeof moduleId !== 'string') return { house: null, key: null };
        // Check multi-segment houses first
        if (moduleId.startsWith('dark-arts-')) {
            return { house: 'dark-arts', key: moduleId.slice(10) };
        }
        const knownHouses = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye', 'ai'];
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
        // Delegate to XPCalculator if available (deterministic, canonical)
        if (typeof XPCalculator !== 'undefined') {
            const calc = XPCalculator.recalculate();
            const totalXP = calc.xp;

            console.log('[FirestoreManager] XP recalculated via XPCalculator:', totalXP, calc.breakdown);

            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                try {
                    await FirebaseAuth.callFunction('syncProgress', { xp: totalXP });
                } catch (err) {
                    console.warn('[FirestoreManager] XP sync via CF failed:', err.message);
                }
            }

            return { success: true, xp: totalXP };
        }

        // Fallback: inline calculation with corrected XP values
        const localData = getLocalStorageProgress();
        if (!localData) {
            console.log('[FirestoreManager] No localStorage data to calculate XP from');
            return { success: false, xp: 0 };
        }

        let totalXP = 0;

        // 100 XP per completed module (PRESENTATION_VIEW rate as conservative default)
        if (Array.isArray(localData.modulesCompleted)) {
            totalXP += localData.modulesCompleted.length * XP_VALUES.PRESENTATION_VIEW;
        }

        // 250 XP per achievement (BADGE_EARNED rate)
        if (Array.isArray(localData.achievements)) {
            totalXP += localData.achievements.length * 250;
        }

        // Daily login streak (25 XP/day, capped at 365)
        const streakDays = Math.min(localData.streak || 0, 365);
        totalXP += streakDays * XP_VALUES.DAILY_LOGIN;

        // Quiz completions (100 XP each — QUIZ_PASS rate)
        if (localData.quizzes) {
            totalXP += Object.keys(localData.quizzes).length * XP_VALUES.QUIZ_PASS;
        }

        // Lab completions (500 XP each — LAB_COMPLETE rate)
        if (Array.isArray(localData.labsCompleted)) {
            totalXP += localData.labsCompleted.length * XP_VALUES.LAB_COMPLETE;
        }

        console.log('[FirestoreManager] Recalculated XP (fallback):', totalXP, {
            modules: localData.modulesCompleted?.length || 0,
            achievements: localData.achievements?.length || 0,
            streak: streakDays,
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

        // Community
        getFlaggedUsers,
        searchUsers,

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
