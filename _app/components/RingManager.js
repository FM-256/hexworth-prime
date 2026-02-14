/**
 * RingManager.js - OASIS Ring Management System
 *
 * Manages the 8 legendary Rings of Hexworth Prime - competitive artifacts
 * inspired by Ready Player One. One ring per house, held by the highest
 * scorer on each ring's challenge. Rings can be claimed, defended, and
 * transfer between challengers.
 *
 * Features:
 * - Firestore integration for ring state
 * - localStorage cache for offline display
 * - Ring ownership tracking & history
 * - Challenge submission & score validation
 * - Cooldown system (5 min between attempts)
 * - XP rewards for claims/attempts
 * - Custom event dispatching
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const RingManager = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    // RING DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════

    const RINGS = {
        shield: {
            id: 'shield',
            name: 'Ring of the Shield',
            house: 'shield',
            theme: 'Defense & Security',
            color: '#f87171',
            icon: '🛡️'
        },
        web: {
            id: 'web',
            name: 'Ring of the Web',
            house: 'web',
            theme: 'Networking & Protocols',
            color: '#60a5fa',
            icon: '🌐'
        },
        forge: {
            id: 'forge',
            name: 'Ring of the Forge',
            house: 'forge',
            theme: 'Hardware & Systems',
            color: '#fbbf24',
            icon: '🔨'
        },
        script: {
            id: 'script',
            name: 'Ring of the Script',
            house: 'script',
            theme: 'Automation & Linux',
            color: '#a78bfa',
            icon: '📜'
        },
        cloud: {
            id: 'cloud',
            name: 'Ring of the Cloud',
            house: 'cloud',
            theme: 'Infrastructure & Architecture',
            color: '#38bdf8',
            icon: '☁️'
        },
        code: {
            id: 'code',
            name: 'Ring of the Code',
            house: 'code',
            theme: 'DevOps & CI/CD',
            color: '#4ade80',
            icon: '⚙️'
        },
        key: {
            id: 'key',
            name: 'Ring of the Key',
            house: 'key',
            theme: 'Cryptography & Ciphers',
            color: '#f472b6',
            icon: '🔑'
        },
        eye: {
            id: 'eye',
            name: 'Ring of the Eye',
            house: 'eye',
            theme: 'Monitoring & Detection',
            color: '#c084fc',
            icon: '👁️'
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // CONSTANTS & CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    const FIRESTORE_COLLECTION = 'rings';
    const CACHE_KEY = 'hexworth_oasis_rings';
    const ATTEMPTS_KEY = 'hexworth_oasis_my_attempts';
    const COOLDOWN_KEY = 'hexworth_oasis_cooldowns';

    const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    const MAX_HISTORY_ENTRIES = 20;

    const XP_REWARDS = {
        RING_CLAIMED: 500,
        RING_ATTEMPT: 100,
        FIRST_ATTEMPT: 100
    };

    // ═══════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════

    let db = null;
    let initialized = false;
    let ringStates = {}; // In-memory cache of ring states

    // ═══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Initialize RingManager - attempt Firestore connection, load cache
     */
    async function init() {
        if (initialized) return true;

        console.log('[RingManager] Initializing...');

        // Load from cache first (always works, even offline)
        loadFromCache();

        // Try to connect to Firestore
        try {
            if (window.firebaseFirestore) {
                // Firestore already loaded
                const { getFirestore } = window.firebaseFirestore;
                const { getApps } = window.firebaseApp;

                if (getApps().length > 0) {
                    db = getFirestore(getApps()[0]);
                    console.log('[RingManager] Connected to Firestore');
                }
            }
        } catch (error) {
            console.warn('[RingManager] Firestore not available, using cache-only mode');
        }

        initialized = true;
        return true;
    }

    /**
     * Check if Firestore is available
     */
    function isOnline() {
        return db !== null;
    }

    // ═══════════════════════════════════════════════════════════════════
    // FIRESTORE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get ring document from Firestore
     */
    async function getRingDoc(ringId) {
        if (!db) return null;

        try {
            const { doc, getDoc } = window.firebaseFirestore;
            const ringRef = doc(db, FIRESTORE_COLLECTION, ringId);
            const snapshot = await getDoc(ringRef);

            if (snapshot.exists()) {
                return { id: ringId, ...snapshot.data() };
            }

            // Ring document doesn't exist - create it
            return await initializeRingDoc(ringId);
        } catch (error) {
            console.error(`[RingManager] Failed to get ring ${ringId}:`, error);
            return null;
        }
    }

    /**
     * Initialize a new ring document in Firestore
     */
    async function initializeRingDoc(ringId) {
        if (!db) return null;

        const ringDef = RINGS[ringId];
        if (!ringDef) return null;

        try {
            const { doc, setDoc, serverTimestamp } = window.firebaseFirestore;
            const ringRef = doc(db, FIRESTORE_COLLECTION, ringId);

            const newRing = {
                id: ringId,
                name: ringDef.name,
                currentHolder: null,
                totalAttempts: 0,
                transferCount: 0,
                history: [],
                createdAt: serverTimestamp()
            };

            await setDoc(ringRef, newRing);
            console.log(`[RingManager] Initialized ring: ${ringDef.name}`);

            return newRing;
        } catch (error) {
            console.error(`[RingManager] Failed to initialize ring ${ringId}:`, error);
            return null;
        }
    }

    /**
     * Submit a challenge score - may claim/transfer ring
     */
    async function submitScore(ringId, score) {
        if (!initialized) await init();
        if (!db) {
            return { success: false, error: 'Firestore not available' };
        }

        const ringDef = RINGS[ringId];
        if (!ringDef) {
            return { success: false, error: 'Invalid ring ID' };
        }

        // Get current user
        const uid = getCurrentUID();
        const callsign = getCurrentCallsign();

        if (!uid || !callsign) {
            return { success: false, error: 'User not authenticated' };
        }

        // Check cooldown
        const canAttemptResult = canAttempt(ringId);
        if (!canAttemptResult.allowed) {
            return {
                success: false,
                error: `Cooldown active. Try again in ${Math.ceil(canAttemptResult.remaining / 60000)} minutes.`
            };
        }

        // Record cooldown
        recordCooldown(ringId);

        try {
            const { doc, runTransaction, serverTimestamp, increment } = window.firebaseFirestore;
            const ringRef = doc(db, FIRESTORE_COLLECTION, ringId);

            const result = await runTransaction(db, async (transaction) => {
                const ringDoc = await transaction.get(ringRef);

                let ringData;
                if (!ringDoc.exists()) {
                    // Initialize ring if it doesn't exist
                    ringData = {
                        id: ringId,
                        name: ringDef.name,
                        currentHolder: null,
                        totalAttempts: 0,
                        transferCount: 0,
                        history: [],
                        createdAt: serverTimestamp()
                    };
                } else {
                    ringData = ringDoc.data();
                }

                const currentHolder = ringData.currentHolder;
                const currentHighScore = currentHolder?.score || 0;

                // Record attempt
                transaction.update(ringRef, {
                    totalAttempts: increment(1)
                });

                // Check if score beats current holder
                const isNewRecord = score > currentHighScore;
                const previousHolder = currentHolder;

                if (isNewRecord) {
                    // Transfer ring to new holder
                    const newHolder = {
                        uid,
                        callsign,
                        house: localStorage.getItem('hexworth_house') || 'web',
                        score,
                        claimedAt: serverTimestamp()
                    };

                    // Update history
                    const history = ringData.history || [];
                    if (previousHolder) {
                        history.unshift({
                            uid: previousHolder.uid,
                            callsign: previousHolder.callsign,
                            score: previousHolder.score,
                            heldFrom: previousHolder.claimedAt,
                            heldUntil: serverTimestamp()
                        });
                    }

                    // Keep only last 20 entries
                    const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);

                    transaction.update(ringRef, {
                        currentHolder: newHolder,
                        transferCount: increment(1),
                        history: trimmedHistory
                    });

                    return {
                        success: true,
                        newHolder,
                        previousHolder,
                        isNewRecord: true,
                        margin: score - currentHighScore
                    };
                } else {
                    // Ring defended
                    return {
                        success: true,
                        newHolder: null,
                        previousHolder: currentHolder,
                        isNewRecord: false,
                        margin: currentHighScore - score
                    };
                }
            });

            // Record attempt in user's local history
            recordAttempt(ringId, score);

            // Award XP
            if (typeof FirestoreManager !== 'undefined') {
                if (result.isNewRecord) {
                    await FirestoreManager.addXP(uid, XP_REWARDS.RING_CLAIMED, `Ring claimed: ${ringDef.name}`);
                } else {
                    // Check if first attempt
                    const attempts = getMyAttempts(ringId);
                    const xp = attempts.length === 1 ? XP_REWARDS.FIRST_ATTEMPT : XP_REWARDS.RING_ATTEMPT;
                    await FirestoreManager.addXP(uid, xp, `Ring challenge attempt: ${ringDef.name}`);
                }
            }

            // Dispatch events
            if (result.isNewRecord) {
                dispatchEvent('ring-claimed', {
                    ring: ringDef,
                    newHolder: result.newHolder,
                    previousHolder: result.previousHolder,
                    score
                });
            } else {
                dispatchEvent('ring-attempted', {
                    ring: ringDef,
                    challenger: { uid, callsign, score },
                    currentHighScore: result.previousHolder?.score || 0
                });

                if (result.previousHolder) {
                    dispatchEvent('ring-defended', {
                        ring: ringDef,
                        holder: result.previousHolder,
                        challenger: { uid, callsign, score },
                        margin: result.margin
                    });
                }
            }

            // Sync cache
            await syncFromCloud();

            return result;

        } catch (error) {
            console.error(`[RingManager] Failed to submit score for ${ringId}:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync all ring states from Firestore to cache
     */
    async function syncFromCloud() {
        if (!db) return false;

        try {
            const { collection, getDocs } = window.firebaseFirestore;
            const ringsRef = collection(db, FIRESTORE_COLLECTION);
            const snapshot = await getDocs(ringsRef);

            const cache = {
                lastSync: Date.now(),
                rings: {}
            };

            snapshot.forEach(doc => {
                const data = doc.data();
                const ringId = doc.id;

                cache.rings[ringId] = {
                    holder: data.currentHolder ? {
                        callsign: data.currentHolder.callsign,
                        house: data.currentHolder.house,
                        score: data.currentHolder.score,
                        claimedAt: data.currentHolder.claimedAt?.toDate?.() || null
                    } : null,
                    totalAttempts: data.totalAttempts || 0,
                    transferCount: data.transferCount || 0
                };

                ringStates[ringId] = data;
            });

            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            console.log('[RingManager] Synced from cloud');

            return true;
        } catch (error) {
            console.error('[RingManager] Failed to sync from cloud:', error);
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // LOCAL CACHE OPERATIONS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Load ring states from localStorage cache
     */
    function loadFromCache() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const data = JSON.parse(cached);
                if (data.rings) {
                    ringStates = data.rings;
                    console.log('[RingManager] Loaded from cache');
                }
            }
        } catch (error) {
            console.warn('[RingManager] Failed to load cache:', error);
        }
    }

    /**
     * Update cache for a specific ring
     */
    function _updateLocalCache(ringId, data) {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{"rings":{}}');
            cached.lastSync = Date.now();
            cached.rings[ringId] = {
                holder: data.currentHolder ? {
                    callsign: data.currentHolder.callsign,
                    house: data.currentHolder.house,
                    score: data.currentHolder.score
                } : null,
                totalAttempts: data.totalAttempts || 0,
                transferCount: data.transferCount || 0
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
        } catch (error) {
            console.warn('[RingManager] Failed to update cache:', error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // RING QUERIES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get ring definition + current state
     */
    function getRing(ringId) {
        const def = RINGS[ringId];
        if (!def) return null;

        // Try in-memory state first
        let state = ringStates[ringId];

        // Fall back to cache
        if (!state) {
            try {
                const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
                state = cached.rings?.[ringId] || {};
            } catch {
                state = {};
            }
        }

        return {
            ...def,
            holder: state.holder || null,
            totalAttempts: state.totalAttempts || 0,
            transferCount: state.transferCount || 0
        };
    }

    /**
     * Get all rings with current holders
     */
    function getAllRings() {
        return Object.keys(RINGS).map(ringId => getRing(ringId));
    }

    /**
     * Get current holder info for a ring
     */
    function getCurrentHolder(ringId) {
        const ring = getRing(ringId);
        return ring?.holder || null;
    }

    /**
     * Get rings held by current user
     */
    function getMyRings() {
        const uid = getCurrentUID();
        if (!uid) return [];

        return getAllRings().filter(ring => ring.holder?.uid === uid);
    }

    /**
     * Get ring ownership history (last 20 transfers)
     */
    async function getRingHistory(ringId) {
        if (!db) return [];

        try {
            const ringDoc = await getRingDoc(ringId);
            return ringDoc?.history || [];
        } catch (error) {
            console.error(`[RingManager] Failed to get history for ${ringId}:`, error);
            return [];
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // USER ATTEMPTS TRACKING
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Record an attempt in user's local history
     */
    function recordAttempt(ringId, score) {
        try {
            const attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}');

            if (!attempts[ringId]) {
                attempts[ringId] = {
                    bestScore: score,
                    attempts: 1,
                    lastAttempt: Date.now()
                };
            } else {
                attempts[ringId].bestScore = Math.max(attempts[ringId].bestScore, score);
                attempts[ringId].attempts++;
                attempts[ringId].lastAttempt = Date.now();
            }

            localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
        } catch (error) {
            console.warn('[RingManager] Failed to record attempt:', error);
        }
    }

    /**
     * Get user's attempts for a ring
     */
    function getMyAttempts(ringId) {
        try {
            const attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}');
            return attempts[ringId] || { bestScore: 0, attempts: 0, lastAttempt: null };
        } catch {
            return { bestScore: 0, attempts: 0, lastAttempt: null };
        }
    }

    /**
     * Get user's best score for a ring
     */
    function getMyBestScore(ringId) {
        const attempts = getMyAttempts(ringId);
        return attempts.bestScore || 0;
    }

    // ═══════════════════════════════════════════════════════════════════
    // COOLDOWN SYSTEM
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Check if user can attempt a ring (cooldown check)
     */
    function canAttempt(ringId) {
        try {
            const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || '{}');
            const lastAttempt = cooldowns[ringId];

            if (!lastAttempt) {
                return { allowed: true, remaining: 0 };
            }

            const elapsed = Date.now() - lastAttempt;
            const remaining = COOLDOWN_DURATION - elapsed;

            if (remaining <= 0) {
                return { allowed: true, remaining: 0 };
            }

            return { allowed: false, remaining };
        } catch {
            return { allowed: true, remaining: 0 };
        }
    }

    /**
     * Record cooldown timestamp
     */
    function recordCooldown(ringId) {
        try {
            const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || '{}');
            cooldowns[ringId] = Date.now();
            localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
        } catch (error) {
            console.warn('[RingManager] Failed to record cooldown:', error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // FEED EVENTS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get recent ring events (transfers, attempts, defenses)
     * TODO: Implement Firestore subcollection for events feed
     */
    async function getRecentEvents(limit = 20) {
        // For now, return empty array - implement when needed
        // This would query a 'rings_events' collection with recent activity
        return [];
    }

    // ═══════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get current user's UID
     */
    function getCurrentUID() {
        if (typeof FirebaseAuth !== 'undefined') {
            const user = FirebaseAuth.getUser();
            return user?.uid || null;
        }
        return null;
    }

    /**
     * Get current user's callsign
     */
    function getCurrentCallsign() {
        if (typeof FirebaseAuth !== 'undefined') {
            const user = FirebaseAuth.getUser();
            return user?.displayName || user?.email?.split('@')[0] || 'Anonymous';
        }
        return 'Anonymous';
    }

    /**
     * Dispatch custom event
     */
    function dispatchEvent(eventName, detail) {
        try {
            document.dispatchEvent(new CustomEvent(`ring-${eventName}`, { detail }));
        } catch (error) {
            console.warn(`[RingManager] Failed to dispatch event ${eventName}:`, error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    return {
        // Core
        init,
        isOnline,

        // Ring queries
        getRing,
        getAllRings,
        getCurrentHolder,
        getMyRings,
        getRingHistory,

        // Challenge flow
        submitScore,
        canAttempt,
        getMyAttempts,
        getMyBestScore,

        // Sync
        syncFromCloud,
        _updateLocalCache,

        // Feed
        getRecentEvents,

        // Constants (for UI)
        RINGS,
        COOLDOWN_DURATION,
        XP_REWARDS
    };

})();

// Auto-initialize on load (cache-only mode works without Firestore)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        RingManager.init();
    });
} else {
    RingManager.init();
}
