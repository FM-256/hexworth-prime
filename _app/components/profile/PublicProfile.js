/**
 * PublicProfile.js - Public User Profile Manager
 *
 * Client-side manager for public profiles. Reads from Firestore
 * publicProfiles/{uid}, enforces privacy settings so only fields
 * the owner has opted-in are returned to other viewers.
 *
 * Singleton IIFE pattern — matches FirestoreManager, AccessGuard, etc.
 *
 * Dependencies: Firebase SDK (loaded dynamically via FirebaseAuth.js)
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const PublicProfile = (function() {
    'use strict';

    let db = null;
    let initialized = false;

    // Default privacy settings — all OFF (opt-in model)
    const DEFAULT_PRIVACY = {
        showXP: false,
        showHouse: false,
        showAchievements: false,
        showActivity: false,
        showRealName: false
    };

    // Fields that are always public (cannot be hidden)
    const ALWAYS_PUBLIC_FIELDS = ['uid', 'callsign', 'joinDate', 'rank', 'level'];

    // Privacy-gated field mapping: privacy key -> profile fields it controls
    const PRIVACY_FIELD_MAP = {
        showXP: ['xp', 'totalXP'],
        showHouse: ['house', 'houseEmblem'],
        showAchievements: ['achievements', 'achievementCount'],
        showActivity: ['recentActivity', 'modulesCompleted', 'boxesSolved'],
        showRealName: ['displayName', 'firstName']
    };

    // House display data
    const HOUSE_DATA = {
        web:        { name: 'Web',        color: '#60a5fa', emblem: 'icon-globe.webp' },
        shield:     { name: 'Shield',     color: '#f87171', emblem: 'icon-shield.webp' },
        cloud:      { name: 'Cloud',      color: '#38bdf8', emblem: 'icon-cloud.webp' },
        forge:      { name: 'Forge',      color: '#fbbf24', emblem: 'icon-wrench.webp' },
        script:     { name: 'Script',     color: '#a78bfa', emblem: 'icon-terminal.webp' },
        code:       { name: 'Code',       color: '#4ade80', emblem: 'icon-code.webp' },
        key:        { name: 'Key',        color: '#f472b6', emblem: 'icon-key.webp' },
        eye:        { name: 'Eye',        color: '#c084fc', emblem: 'icon-magnifier.webp' },
        'dark-arts':{ name: 'Dark Arts',  color: '#9b59d0', emblem: 'icon-skull.webp' },
        ai:         { name: 'AI',         color: '#22d3ee', emblem: 'icon-circuit.webp' },
        matrix:     { name: 'Matrix',     color: '#ff00ff', emblem: 'icon-grid.webp' }
    };

    /**
     * Initialize Firestore connection
     */
    async function init() {
        if (initialized) return true;

        try {
            // Wait for Firebase SDK to be available
            if (typeof firebase === 'undefined' && typeof window.firebaseApp === 'undefined') {
                // Try dynamic import (same pattern as FirebaseAuth.js)
                const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
                if (window.firebaseApp) {
                    db = getFirestore(window.firebaseApp);
                } else {
                    console.warn('[PublicProfile] Firebase app not initialized');
                    return false;
                }
            } else if (window.firebaseDB) {
                db = window.firebaseDB;
            } else {
                const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
                db = getFirestore(window.firebaseApp);
            }

            initialized = true;
            return true;
        } catch (err) {
            console.error('[PublicProfile] Init failed:', err);
            return false;
        }
    }

    /**
     * Get current authenticated user's UID
     */
    function getCurrentUID() {
        // Check FirebaseAuth singleton first
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
            const user = FirebaseAuth.getUser();
            return user ? user.uid : null;
        }
        // Fallback to localStorage
        try {
            const stored = localStorage.getItem('hexworth_firebase_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.uid || null;
            }
        } catch (_) { /* ignore */ }
        return null;
    }

    /**
     * Get a user's public profile — privacy-aware
     * Returns only fields the owner has made public (plus always-public fields).
     * If the requester is the owner, all fields are returned.
     *
     * @param {string} uid - Target user's UID
     * @returns {Object|null} Public profile data or null if not found
     */
    async function getPublicProfile(uid) {
        if (!initialized) await init();
        if (!db || !uid) return null;

        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');

            // Fetch profile document
            const profileRef = doc(db, 'publicProfiles', uid);
            const profileSnap = await getDoc(profileRef);

            if (!profileSnap.exists()) return null;

            const profileData = profileSnap.data();
            const currentUID = getCurrentUID();
            const isOwner = currentUID === uid;

            // Owner gets everything
            if (isOwner) {
                return { ...profileData, uid, _isOwner: true };
            }

            // Fetch privacy settings
            const settingsRef = doc(db, 'publicProfiles', uid, 'settings', 'privacy');
            let privacy = { ...DEFAULT_PRIVACY };

            try {
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists()) {
                    privacy = { ...DEFAULT_PRIVACY, ...settingsSnap.data() };
                }
            } catch (_) {
                // Settings subcollection may not exist yet — use defaults (all hidden)
            }

            // Build filtered profile
            const filtered = { uid, _isOwner: false };

            // Always include public fields
            for (const field of ALWAYS_PUBLIC_FIELDS) {
                if (profileData[field] !== undefined) {
                    filtered[field] = profileData[field];
                }
            }

            // Include privacy-gated fields only if enabled
            for (const [privacyKey, fields] of Object.entries(PRIVACY_FIELD_MAP)) {
                if (privacy[privacyKey]) {
                    for (const field of fields) {
                        if (profileData[field] !== undefined) {
                            filtered[field] = profileData[field];
                        }
                    }
                }
            }

            // Attach which sections are visible (for UI rendering)
            filtered._visibleSections = {};
            for (const key of Object.keys(DEFAULT_PRIVACY)) {
                filtered._visibleSections[key] = privacy[key];
            }

            return filtered;
        } catch (err) {
            console.error('[PublicProfile] getPublicProfile error:', err);
            return null;
        }
    }

    /**
     * Update the current user's public profile
     *
     * @param {Object} data - Fields to update (callsign, displayName, house, etc.)
     * @returns {boolean} Success
     */
    async function updateMyProfile(data) {
        if (!initialized) await init();
        if (!db) return false;

        const uid = getCurrentUID();
        if (!uid) {
            console.warn('[PublicProfile] Cannot update — not authenticated');
            return false;
        }

        try {
            const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');

            // Sanitize — strip any fields that should not be client-writable
            const safeFields = [
                'callsign', 'displayName', 'firstName', 'house', 'houseEmblem',
                'xp', 'totalXP', 'level', 'rank', 'modulesCompleted', 'boxesSolved',
                'achievementCount', 'achievements', 'recentActivity'
            ];

            const sanitized = {};
            for (const key of safeFields) {
                if (data[key] !== undefined) {
                    sanitized[key] = data[key];
                }
            }

            sanitized.updatedAt = serverTimestamp();

            const profileRef = doc(db, 'publicProfiles', uid);
            await setDoc(profileRef, sanitized, { merge: true });

            return true;
        } catch (err) {
            console.error('[PublicProfile] updateMyProfile error:', err);
            return false;
        }
    }

    /**
     * Set privacy settings for the current user
     *
     * @param {Object} settings - Privacy toggles (showXP, showHouse, etc.)
     * @returns {boolean} Success
     */
    async function setPrivacySettings(settings) {
        if (!initialized) await init();
        if (!db) return false;

        const uid = getCurrentUID();
        if (!uid) {
            console.warn('[PublicProfile] Cannot set privacy — not authenticated');
            return false;
        }

        try {
            const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');

            // Only allow known privacy keys
            const sanitized = {};
            for (const key of Object.keys(DEFAULT_PRIVACY)) {
                if (typeof settings[key] === 'boolean') {
                    sanitized[key] = settings[key];
                }
            }

            sanitized.updatedAt = serverTimestamp();

            const settingsRef = doc(db, 'publicProfiles', uid, 'settings', 'privacy');
            await setDoc(settingsRef, sanitized, { merge: true });

            return true;
        } catch (err) {
            console.error('[PublicProfile] setPrivacySettings error:', err);
            return false;
        }
    }

    /**
     * Get privacy settings for the current user
     *
     * @returns {Object} Privacy settings (with defaults for missing keys)
     */
    async function getMyPrivacySettings() {
        if (!initialized) await init();
        if (!db) return { ...DEFAULT_PRIVACY };

        const uid = getCurrentUID();
        if (!uid) return { ...DEFAULT_PRIVACY };

        try {
            const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');

            const settingsRef = doc(db, 'publicProfiles', uid, 'settings', 'privacy');
            const snap = await getDoc(settingsRef);

            if (snap.exists()) {
                return { ...DEFAULT_PRIVACY, ...snap.data() };
            }
            return { ...DEFAULT_PRIVACY };
        } catch (err) {
            console.error('[PublicProfile] getMyPrivacySettings error:', err);
            return { ...DEFAULT_PRIVACY };
        }
    }

    /**
     * Sync current user's stats to their public profile
     * Pulls from Firestore users/{uid} and updates publicProfiles/{uid}
     */
    async function syncMyStats() {
        if (!initialized) await init();
        if (!db) return false;

        const uid = getCurrentUID();
        if (!uid) return false;

        try {
            const { doc, getDoc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');

            // Read user's main profile
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) return false;

            const userData = userSnap.data();

            // Build public profile from user data
            const profileUpdate = {
                callsign: userData.callsign || 'Anonymous',
                house: userData.house || null,
                xp: userData.xp || 0,
                totalXP: userData.xp || 0,
                level: userData.level || 1,
                rank: _calculateRank(userData.level || 1),
                modulesCompleted: userData.modulesCompleted || 0,
                boxesSolved: userData.ctfBoxesPwned || 0,
                achievementCount: Array.isArray(userData.achievements) ? userData.achievements.length : 0,
                joinDate: userData.createdAt || null,
                updatedAt: serverTimestamp()
            };

            if (userData.displayName) profileUpdate.displayName = userData.displayName;
            if (userData.firstName) profileUpdate.firstName = userData.firstName;

            // Set house emblem
            if (userData.house && HOUSE_DATA[userData.house]) {
                profileUpdate.houseEmblem = HOUSE_DATA[userData.house].emblem;
            }

            const profileRef = doc(db, 'publicProfiles', uid);
            await setDoc(profileRef, profileUpdate, { merge: true });

            return true;
        } catch (err) {
            console.error('[PublicProfile] syncMyStats error:', err);
            return false;
        }
    }

    /**
     * Calculate rank string from level
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
     * Get house display data
     */
    function getHouseData(houseId) {
        return HOUSE_DATA[houseId] || null;
    }

    // ─── Public API ──────────────────────────────────────────────────

    return {
        init,
        getPublicProfile,
        updateMyProfile,
        setPrivacySettings,
        getMyPrivacySettings,
        syncMyStats,
        getHouseData,
        getCurrentUID,
        DEFAULT_PRIVACY,
        HOUSE_DATA
    };

})();
