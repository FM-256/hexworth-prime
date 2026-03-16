/**
 * EngagementMetrics.js - Student Engagement Analytics Service
 *
 * Client-side analytics service for the Handler Dashboard.
 * Reads from Firestore analytics/{uid}/sessions collection
 * and computes engagement metrics.
 *
 * API:
 *   EngagementMetrics.getLoginFrequency(uid, range)
 *   EngagementMetrics.getSessionDuration(uid, range)
 *   EngagementMetrics.getActiveTime(uid, range)
 *   EngagementMetrics.getEngagementScore(uid)
 *   EngagementMetrics.getClassEngagement(classId)
 *   EngagementMetrics.getEngagementTrends(classId, weeks)
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js)
 *   - ClassManager (components/ClassManager.js)
 *
 * @version 1.0.0
 */
const EngagementMetrics = (function() {
    'use strict';

    // =====================================================================
    // STATE
    // =====================================================================

    let db = null;
    let initialized = false;

    // Cache TTL: 5 minutes
    const CACHE_TTL = 5 * 60 * 1000;
    const cache = new Map();

    // Weights for composite engagement score
    const SCORE_WEIGHTS = {
        loginFrequency: 0.25,
        sessionDuration: 0.25,
        activeRatio: 0.20,
        completionRate: 0.30
    };

    // Thresholds for scoring bands
    const THRESHOLDS = {
        loginsPerWeek: { low: 1, mid: 3, high: 5 },
        avgSessionMinutes: { low: 5, mid: 15, high: 30 },
        activeRatio: { low: 0.3, mid: 0.5, high: 0.7 }
    };

    // =====================================================================
    // INITIALIZATION
    // =====================================================================

    async function init() {
        if (initialized) return true;

        try {
            if (typeof FirestoreManager !== 'undefined') {
                await FirestoreManager.init();
            }

            if (!window.firebaseFirestore) {
                throw new Error('Firestore SDK not available');
            }

            const { getFirestore } = window.firebaseFirestore;
            const { getApps } = window.firebaseApp;

            if (getApps().length === 0) {
                throw new Error('Firebase app not initialized');
            }

            db = getFirestore(getApps()[0]);
            initialized = true;
            console.log('[EngagementMetrics] Initialized');
            return true;
        } catch (error) {
            console.error('[EngagementMetrics] Init failed:', error);
            return false;
        }
    }

    // =====================================================================
    // CACHE HELPERS
    // =====================================================================

    function _cacheKey(method, ...args) {
        return method + ':' + args.join(':');
    }

    function _getCached(key) {
        const entry = cache.get(key);
        if (entry && Date.now() - entry.ts < CACHE_TTL) {
            return entry.data;
        }
        cache.delete(key);
        return null;
    }

    function _setCache(key, data) {
        cache.set(key, { data, ts: Date.now() });
    }

    // =====================================================================
    // FIRESTORE QUERIES
    // =====================================================================

    /**
     * Fetch session docs for a user within a date range.
     * Collection: analytics/{uid}/sessions
     * Each doc: { loginAt, logoutAt, activeMs, idle, completions }
     */
    async function _fetchSessions(uid, range) {
        if (!db) await init();

        const cKey = _cacheKey('sessions', uid, range);
        const cached = _getCached(cKey);
        if (cached) return cached;

        const { collection, query, where, getDocs, orderBy } = window.firebaseFirestore;
        const cutoff = _rangeToCutoff(range);

        const sessRef = collection(db, 'analytics', uid, 'sessions');
        const q = query(
            sessRef,
            where('loginAt', '>=', cutoff),
            orderBy('loginAt', 'asc')
        );

        const snap = await getDocs(q);
        const sessions = [];
        snap.forEach(doc => {
            sessions.push({ id: doc.id, ...doc.data() });
        });

        _setCache(cKey, sessions);
        return sessions;
    }

    /**
     * Convert range string to Firestore Timestamp cutoff.
     * Supports: '7d', '14d', '30d', '90d', '1y'
     */
    function _rangeToCutoff(range) {
        const now = Date.now();
        const days = {
            '7d': 7, '14d': 14, '30d': 30, '90d': 90, '1y': 365
        };
        const d = days[range] || 30;
        const cutoffMs = now - (d * 24 * 60 * 60 * 1000);

        const { Timestamp } = window.firebaseFirestore;
        return Timestamp.fromMillis(cutoffMs);
    }

    function _dayKey(timestamp) {
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toISOString().slice(0, 10);
    }

    // =====================================================================
    // PUBLIC API
    // =====================================================================

    /**
     * Login frequency over time period.
     * Returns { labels: string[], data: number[], total: number }
     */
    async function getLoginFrequency(uid, range) {
        if (!range) range = '30d';
        const sessions = await _fetchSessions(uid, range);

        // Group by day
        const counts = {};
        sessions.forEach(s => {
            const key = _dayKey(s.loginAt);
            counts[key] = (counts[key] || 0) + 1;
        });

        // Build continuous date range
        const days = parseInt(range) || 30;
        const labels = [];
        const data = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            labels.push(key);
            data.push(counts[key] || 0);
        }

        return {
            labels,
            data,
            total: sessions.length
        };
    }

    /**
     * Average session duration in minutes.
     * Returns { average: number, sessions: { date, minutes }[], total: number }
     */
    async function getSessionDuration(uid, range) {
        if (!range) range = '30d';
        const sessions = await _fetchSessions(uid, range);

        const durations = sessions.map(s => {
            const start = s.loginAt.toDate ? s.loginAt.toDate() : new Date(s.loginAt);
            const end = s.logoutAt
                ? (s.logoutAt.toDate ? s.logoutAt.toDate() : new Date(s.logoutAt))
                : new Date(start.getTime() + (s.activeMs || 0));
            const minutes = (end - start) / 60000;
            return {
                date: _dayKey(s.loginAt),
                minutes: Math.round(minutes * 10) / 10
            };
        });

        const total = durations.reduce((sum, d) => sum + d.minutes, 0);
        const average = durations.length > 0 ? Math.round((total / durations.length) * 10) / 10 : 0;

        return { average, sessions: durations, total: durations.length };
    }

    /**
     * Active time vs total session time.
     * Returns { activeMinutes, totalMinutes, ratio }
     */
    async function getActiveTime(uid, range) {
        if (!range) range = '30d';
        const sessions = await _fetchSessions(uid, range);

        let activeMs = 0;
        let totalMs = 0;

        sessions.forEach(s => {
            const start = s.loginAt.toDate ? s.loginAt.toDate() : new Date(s.loginAt);
            const end = s.logoutAt
                ? (s.logoutAt.toDate ? s.logoutAt.toDate() : new Date(s.logoutAt))
                : new Date(start.getTime() + (s.activeMs || 0));
            totalMs += (end - start);
            activeMs += (s.activeMs || (end - start));
        });

        return {
            activeMinutes: Math.round(activeMs / 60000),
            totalMinutes: Math.round(totalMs / 60000),
            ratio: totalMs > 0 ? Math.round((activeMs / totalMs) * 100) / 100 : 0
        };
    }

    /**
     * Composite engagement score (0-100).
     * Based on logins, duration, active ratio, completions.
     */
    async function getEngagementScore(uid) {
        const [logins, duration, active] = await Promise.all([
            getLoginFrequency(uid, '30d'),
            getSessionDuration(uid, '30d'),
            getActiveTime(uid, '30d')
        ]);

        // Fetch completions count from user profile
        let completions = 0;
        try {
            const { doc, getDoc } = window.firebaseFirestore;
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const progress = data.progress || {};
                completions = Object.keys(progress).filter(k => progress[k] === true || progress[k] === 'complete').length;
            }
        } catch (e) {
            // Graceful fallback
        }

        // Normalize each factor to 0-100
        const loginsPerWeek = (logins.total / 4.3); // ~4.3 weeks in 30 days
        const loginScore = Math.min(100, (loginsPerWeek / THRESHOLDS.loginsPerWeek.high) * 100);

        const durationScore = Math.min(100, (duration.average / THRESHOLDS.avgSessionMinutes.high) * 100);

        const activeScore = Math.min(100, (active.ratio / THRESHOLDS.activeRatio.high) * 100);

        const completionScore = Math.min(100, completions * 2); // 50 completions = 100

        // Weighted composite
        const composite = Math.round(
            loginScore * SCORE_WEIGHTS.loginFrequency +
            durationScore * SCORE_WEIGHTS.sessionDuration +
            activeScore * SCORE_WEIGHTS.activeRatio +
            completionScore * SCORE_WEIGHTS.completionRate
        );

        return {
            score: Math.min(100, Math.max(0, composite)),
            breakdown: {
                loginScore: Math.round(loginScore),
                durationScore: Math.round(durationScore),
                activeScore: Math.round(activeScore),
                completionScore: Math.round(completionScore)
            },
            raw: {
                loginsPerWeek: Math.round(loginsPerWeek * 10) / 10,
                avgSessionMinutes: duration.average,
                activeRatio: active.ratio,
                completions
            }
        };
    }

    /**
     * Aggregated metrics for an entire class.
     * Returns { students: [], classAverage, topEngaged, atRisk }
     */
    async function getClassEngagement(classId) {
        if (!db) await init();

        // Get class members
        const { collection, getDocs } = window.firebaseFirestore;
        const membersSnap = await getDocs(collection(db, 'classes', classId, 'members'));
        const memberUids = [];
        membersSnap.forEach(doc => memberUids.push(doc.id));

        // Fetch engagement scores in parallel (batch of 10)
        const students = [];
        const batchSize = 10;
        for (let i = 0; i < memberUids.length; i += batchSize) {
            const batch = memberUids.slice(i, i + batchSize);
            const results = await Promise.all(batch.map(async uid => {
                try {
                    const score = await getEngagementScore(uid);
                    // Get display name
                    const { doc: docRef, getDoc } = window.firebaseFirestore;
                    const userDoc = await getDoc(docRef(db, 'users', uid));
                    const name = userDoc.exists()
                        ? (userDoc.data().callsign || userDoc.data().displayName || uid.slice(0, 8))
                        : uid.slice(0, 8);
                    return { uid, name, ...score };
                } catch (e) {
                    return { uid, name: uid.slice(0, 8), score: 0, breakdown: {}, raw: {} };
                }
            }));
            students.push(...results);
        }

        // Sort for rankings
        const sorted = [...students].sort((a, b) => b.score - a.score);
        const classAverage = students.length > 0
            ? Math.round(students.reduce((sum, s) => sum + s.score, 0) / students.length)
            : 0;

        return {
            students: sorted,
            classAverage,
            topEngaged: sorted.slice(0, 5),
            atRisk: sorted.filter(s => s.score < 30),
            totalStudents: students.length
        };
    }

    /**
     * Weekly engagement trends for a class.
     * Returns { weeks: string[], averages: number[], participation: number[] }
     */
    async function getEngagementTrends(classId, weeks) {
        if (!weeks) weeks = 12;
        if (!db) await init();

        // Get class members
        const { collection, getDocs, query, where, orderBy, Timestamp } = window.firebaseFirestore;
        const membersSnap = await getDocs(collection(db, 'classes', classId, 'members'));
        const memberUids = [];
        membersSnap.forEach(doc => memberUids.push(doc.id));

        if (memberUids.length === 0) {
            return { weeks: [], averages: [], participation: [] };
        }

        const weekLabels = [];
        const weekAverages = [];
        const weekParticipation = [];
        const now = new Date();

        for (let w = weeks - 1; w >= 0; w--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - (w * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 7);

            const label = weekStart.toISOString().slice(5, 10) + ' - ' + weekEnd.toISOString().slice(5, 10);
            weekLabels.push(label);

            // Count sessions per member in this week
            let totalSessions = 0;
            let activeMembers = 0;
            let totalDurationMs = 0;

            const startTs = Timestamp.fromDate(weekStart);
            const endTs = Timestamp.fromDate(weekEnd);

            // Sample up to 20 members to keep query count reasonable
            const sampleUids = memberUids.slice(0, 20);

            await Promise.all(sampleUids.map(async uid => {
                try {
                    const sessRef = collection(db, 'analytics', uid, 'sessions');
                    const q = query(sessRef, where('loginAt', '>=', startTs), where('loginAt', '<=', endTs));
                    const snap = await getDocs(q);
                    if (snap.size > 0) {
                        activeMembers++;
                        totalSessions += snap.size;
                        snap.forEach(doc => {
                            const d = doc.data();
                            totalDurationMs += (d.activeMs || 0);
                        });
                    }
                } catch (e) {
                    // Skip on error
                }
            }));

            const avgDuration = activeMembers > 0 ? Math.round(totalDurationMs / activeMembers / 60000) : 0;
            weekAverages.push(avgDuration);
            weekParticipation.push(Math.round((activeMembers / sampleUids.length) * 100));
        }

        return {
            weeks: weekLabels,
            averages: weekAverages,
            participation: weekParticipation
        };
    }

    /**
     * Clear cache (for manual refresh).
     */
    function clearCache() {
        cache.clear();
    }

    // =====================================================================
    // PUBLIC INTERFACE
    // =====================================================================

    return {
        init,
        getLoginFrequency,
        getSessionDuration,
        getActiveTime,
        getEngagementScore,
        getClassEngagement,
        getEngagementTrends,
        clearCache
    };

})();
