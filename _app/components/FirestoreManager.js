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
        lastLogin: 'hexworth_last_login'
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
                xp: increment(window.ProgressManager?.XP_REWARDS?.MODULE_COMPLETE || 100),
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
            const xpReward = score === 100 ? (window.ProgressManager?.XP_REWARDS?.QUIZ_PERFECT || 300) : (window.ProgressManager?.XP_REWARDS?.QUIZ_PASS || 150);

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
                xp: increment(window.ProgressManager?.XP_REWARDS?.LAB_COMPLETE || 200),
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

            // XP calculation - combine multiple sources
            let totalXP = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.xp) || '0');

            // Add discovery points from achievements
            const discoveryPoints = parseInt(localStorage.getItem(LOCALSTORAGE_KEYS.discoveryPoints) || '0');
            totalXP += discoveryPoints;

            // If XP is still 0, calculate from progress data
            if (totalXP === 0 && typeof window.ProgressManager !== 'undefined') {
                const XP_REWARDS = window.ProgressManager.XP_REWARDS;

                // MODULE_COMPLETE XP per completed module
                if (Array.isArray(data.modulesCompleted)) {
                    totalXP += data.modulesCompleted.length * (XP_REWARDS?.MODULE_COMPLETE || 100);
                }
                // Achievement points are added separately by AchievementSystem.js
                // XP_REWARDS.ACHIEVEMENT is not directly a constant here.
                // For migration, we'll assume a conservative 15 XP per achievement if no specific points.
                if (Array.isArray(data.achievements)) {
                    totalXP += data.achievements.length * 15;
                }
                // Streak bonus
                totalXP += data.streak * (XP_REWARDS?.DAILY_LOGIN || 25) / 2; // Roughly half a daily login
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

        // Try to migrate localStorage data
        const migration = await migrateFromLocalStorage(uid, email);

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
            migration
        };
    }

    /**
     * Recalculate XP from localStorage and update Firestore
     * Call this to fix users with 0 XP after initial migration
     */
    async function recalculateXP(uid) {
        const localData = getLocalStorageProgress(); // This already uses the new XP calculation from local storage
        if (!localData) {
            console.log('[FirestoreManager] No localStorage data to calculate XP from');
            return { success: false, xp: 0 };
        }

        let totalXP = 0;
        if (typeof window.ProgressManager !== 'undefined') {
            const XP_REWARDS = window.ProgressManager.XP_REWARDS;
            const AchievementSystem = window.AchievementSystem; // Access AchievementSystem for points

            // Calculate XP from module types, quizzes, labs, and achievements
            // We need to fetch details for each completed module to determine its type
            // For now, use basic counts with default rewards. A more precise calc would need module types.

            // Assume base MODULE_COMPLETE for all completed modules
            if (Array.isArray(localData.modulesCompleted)) {
                totalXP += localData.modulesCompleted.length * (XP_REWARDS?.MODULE_COMPLETE || 100);
            }

            // Quiz completions (approximate, as individual scores/types are not in localData directly)
            if (localData.quizzes) {
                totalXP += Object.keys(localData.quizzes).length * (XP_REWARDS?.QUIZ_PASS || 150); // Assume pass
            }

            // Lab completions
            if (Array.isArray(localData.labsCompleted)) {
                totalXP += localData.labsCompleted.length * (XP_REWARDS?.LAB_COMPLETE || 200);
            }

            // Achievements points
            if (Array.isArray(localData.achievements) && AchievementSystem) {
                localData.achievements.forEach(achId => {
                    const achievement = AchievementSystem.ACHIEVEMENTS[achId];
                    if (achievement) {
                        totalXP += achievement.points;
                    }
                });
            }

            // Streak bonus
            totalXP += (localData.streak || 0) * (XP_REWARDS?.DAILY_LOGIN || 25) / 2; // Roughly half a daily login
        } else {
            // Fallback if ProgressManager is not available (shouldn't happen if dependencies are correct)
            totalXP = localData.xp || 0;
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
        initializeNewUser
    };

})();

// NOTE: Don't auto-initialize - FirestoreManager.init() is called on-demand
// when needed (e.g., from FirebaseAuth after successful sign-in)
