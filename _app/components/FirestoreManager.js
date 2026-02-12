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
        MODULE_COMPLETE: 100,
        QUIZ_PASS: 150,
        QUIZ_PERFECT: 300,
        LAB_COMPLETE: 200,
        PRESENTATION_VIEW: 50,
        TOOL_EXPLORE: 75,
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
     * Add XP to user
     */
    async function addXP(uid, amount, reason) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { doc, updateDoc, increment, arrayUnion, serverTimestamp } = window.firebaseFirestore;
            const userRef = doc(db, COLLECTIONS.USERS, uid);

            await updateDoc(userRef, {
                xp: increment(amount),
                xpHistory: arrayUnion({
                    amount,
                    reason,
                    timestamp: new Date().toISOString()
                }),
                updatedAt: serverTimestamp()
            });

            console.log(`[FirestoreManager] Added ${amount} XP to ${uid}: ${reason}`);
            return true;
        } catch (error) {
            console.error('[FirestoreManager] Failed to add XP:', error);
            return false;
        }
    }

    /**
     * Record module completion
     */
    async function completeModule(uid, moduleId, house) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { doc, updateDoc, arrayUnion, increment, serverTimestamp } = window.firebaseFirestore;
            const userRef = doc(db, COLLECTIONS.USERS, uid);

            await updateDoc(userRef, {
                modulesCompleted: arrayUnion(moduleId),
                xp: increment(XP_VALUES.MODULE_COMPLETE),
                [`houseProgress.${house}.completed`]: increment(1),
                updatedAt: serverTimestamp()
            });

            console.log(`[FirestoreManager] Module completed: ${moduleId}`);
            return true;
        } catch (error) {
            console.error('[FirestoreManager] Failed to record module completion:', error);
            return false;
        }
    }

    /**
     * Record quiz pass
     */
    async function passQuiz(uid, quizId, score, house) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { doc, updateDoc, increment, serverTimestamp } = window.firebaseFirestore;
            const userRef = doc(db, COLLECTIONS.USERS, uid);

            // Award more XP for perfect scores
            const xpReward = score === 100 ? XP_VALUES.QUIZ_PERFECT : XP_VALUES.QUIZ_PASS;

            await updateDoc(userRef, {
                [`quizzes.${quizId}`]: {
                    score,
                    passedAt: new Date().toISOString()
                },
                xp: increment(xpReward),
                [`houseProgress.${house}.quizzesPassed`]: increment(1),
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('[FirestoreManager] Failed to record quiz pass:', error);
            return false;
        }
    }

    /**
     * Record lab completion
     */
    async function completeLab(uid, labId, house) {
        if (!initialized) await init();
        if (!db) return false;

        try {
            const { doc, updateDoc, arrayUnion, increment, serverTimestamp } = window.firebaseFirestore;
            const userRef = doc(db, COLLECTIONS.USERS, uid);

            await updateDoc(userRef, {
                labsCompleted: arrayUnion(labId),
                xp: increment(XP_VALUES.LAB_COMPLETE),
                [`houseProgress.${house}.labsCompleted`]: increment(1),
                updatedAt: serverTimestamp()
            });

            return true;
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

        if (existingProfile && existingProfile.xp > 0) {
            // Merge: take the higher values
            const mergedData = mergeProgress(existingProfile, localData);
            await setUserProfile(uid, mergedData);
            console.log('[FirestoreManager] Merged local + cloud data');
            return { migrated: true, reason: 'merged' };
        } else {
            // Fresh migration
            const { serverTimestamp } = window.firebaseFirestore;

            await setUserProfile(uid, {
                email,
                house: localData.house,
                xp: localData.xp || 0,
                streak: localData.streak || 0,
                modulesCompleted: localData.modulesCompleted || [],
                labsCompleted: localData.labsCompleted || [],
                achievements: localData.achievements || [],
                quizzes: localData.quizzes || {},
                migratedFromLocalStorage: true,
                migratedAt: new Date().toISOString(),
                createdAt: serverTimestamp()
            });

            console.log('[FirestoreManager] Migrated localStorage to Firestore');
            return { migrated: true, reason: 'fresh_migration' };
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
     */
    async function grandfatherUser(uid) {
        return await setUserProfile(uid, {
            tier: TIERS.FOUNDING_MEMBER,
            grandfathered: true,
            grandfatheredAt: new Date().toISOString()
        });
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

            console.log('[FirestoreManager] Cloud data restored to localStorage');

            return {
                restored: true,
                house: profile.house || null,
                theme: theme,
                profile: profile,
                hasHouse: !!profile.house
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

            // 7. Write merged data to Firestore
            await setUserProfile(uid, {
                modulesCompleted: [...allModuleIds],
                labsCompleted: [...allLabIds],
                xp: mergedXP,
                streak: mergedStreak,
                achievements: mergedAchievementIds,
                quizzes: mergedQuizzes,
                favorites: mergedFavorites
            });

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

        // Update Firestore
        await setUserProfile(uid, { xp: totalXP });

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

        // New User
        initializeNewUser,

        // DB access (for components that need direct Firestore queries)
        getDb: () => db
    };

})();

// NOTE: Don't auto-initialize - FirestoreManager.init() is called on-demand
// when needed (e.g., from FirebaseAuth after successful sign-in)
