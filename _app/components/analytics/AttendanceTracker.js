/**
 * AttendanceTracker.js - Login & Attendance Analytics Service
 *
 * Records login events and provides attendance pattern analysis
 * for the Handler Dashboard.
 *
 * API:
 *   AttendanceTracker.recordLogin(uid)
 *   AttendanceTracker.getAttendancePattern(uid, range)
 *   AttendanceTracker.getClassAttendance(classId, date)
 *   AttendanceTracker.getStreaks(uid)
 *   AttendanceTracker.getAbsenceAlerts(classId, threshold)
 *
 * Firestore Collections:
 *   analytics/{uid}/sessions   - session documents
 *   analytics/{uid}/attendance - daily attendance roll-up
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - FirestoreManager (components/FirestoreManager.js)
 *   - ClassManager (components/ClassManager.js)
 *
 * @version 1.0.0
 */
const AttendanceTracker = (function() {
    'use strict';

    // =====================================================================
    // STATE
    // =====================================================================

    let db = null;
    let initialized = false;

    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const HOUR_LABELS = [];
    for (let h = 0; h < 24; h++) {
        HOUR_LABELS.push(h.toString().padStart(2, '0') + ':00');
    }

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
            console.log('[AttendanceTracker] Initialized');
            return true;
        } catch (error) {
            console.error('[AttendanceTracker] Init failed:', error);
            return false;
        }
    }

    // =====================================================================
    // HELPERS
    // =====================================================================

    function _todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function _dayKey(timestamp) {
        const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return d.toISOString().slice(0, 10);
    }

    function _daysBetween(d1, d2) {
        const ms = Math.abs(new Date(d2) - new Date(d1));
        return Math.floor(ms / (24 * 60 * 60 * 1000));
    }

    // =====================================================================
    // PUBLIC API
    // =====================================================================

    /**
     * Record a login event for the current session.
     * Called on dashboard load. Idempotent per day (one record per calendar day).
     */
    async function recordLogin(uid) {
        if (!db) await init();
        if (!uid) return;

        const { doc, setDoc, getDoc, Timestamp, collection, addDoc } = window.firebaseFirestore;
        const today = _todayKey();
        const now = new Date();

        // Check if already recorded today
        const attendRef = doc(db, 'analytics', uid, 'attendance', today);
        const existing = await getDoc(attendRef);

        if (existing.exists()) {
            // Update login count for today
            const data = existing.data();
            await setDoc(attendRef, {
                ...data,
                loginCount: (data.loginCount || 1) + 1,
                lastLoginAt: Timestamp.fromDate(now)
            });
        } else {
            // First login today
            await setDoc(attendRef, {
                date: today,
                dayOfWeek: now.getDay(),
                hour: now.getHours(),
                loginCount: 1,
                firstLoginAt: Timestamp.fromDate(now),
                lastLoginAt: Timestamp.fromDate(now)
            });
        }

        // Also record a session start
        const sessRef = collection(db, 'analytics', uid, 'sessions');
        await addDoc(sessRef, {
            loginAt: Timestamp.fromDate(now),
            logoutAt: null,
            activeMs: 0,
            date: today
        });

        console.log('[AttendanceTracker] Login recorded for', uid, 'on', today);
    }

    /**
     * Get attendance heatmap data (day-of-week x hour).
     * Returns { grid: number[][], days: string[], hours: string[], totalDays, activeDays }
     *
     * grid[day][hour] = login count
     */
    async function getAttendancePattern(uid, range) {
        if (!db) await init();
        if (!range) range = '90d';

        const { collection, query, where, getDocs, orderBy, Timestamp } = window.firebaseFirestore;

        const days = parseInt(range) || 90;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const cutoffTs = Timestamp.fromDate(cutoff);

        const attRef = collection(db, 'analytics', uid, 'attendance');
        const q = query(attRef, where('firstLoginAt', '>=', cutoffTs), orderBy('firstLoginAt', 'asc'));
        const snap = await getDocs(q);

        // Build 7x24 grid
        const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
        let activeDays = 0;

        snap.forEach(doc => {
            const data = doc.data();
            const dow = data.dayOfWeek;
            const hour = data.hour;
            if (dow >= 0 && dow < 7 && hour >= 0 && hour < 24) {
                grid[dow][hour] += (data.loginCount || 1);
            }
            activeDays++;
        });

        return {
            grid,
            days: DAY_NAMES,
            hours: HOUR_LABELS,
            totalDays: days,
            activeDays
        };
    }

    /**
     * Get 52-week heatmap data for GitHub-style contribution chart.
     * Returns { weeks: { date, count }[][] } — 52 weeks x 7 days
     */
    async function getYearlyHeatmap(uid) {
        if (!db) await init();

        const { collection, query, where, getDocs, orderBy, Timestamp } = window.firebaseFirestore;

        const cutoff = new Date(Date.now() - 364 * 24 * 60 * 60 * 1000);
        const cutoffTs = Timestamp.fromDate(cutoff);

        const attRef = collection(db, 'analytics', uid, 'attendance');
        const q = query(attRef, where('firstLoginAt', '>=', cutoffTs), orderBy('firstLoginAt', 'asc'));
        const snap = await getDocs(q);

        // Build lookup
        const dayMap = {};
        snap.forEach(doc => {
            const data = doc.data();
            dayMap[data.date] = data.loginCount || 1;
        });

        // Build 52 weeks of data
        const weeks = [];
        const now = new Date();
        // Start from the most recent Sunday 52 weeks ago
        const start = new Date(now);
        start.setDate(start.getDate() - 363 - start.getDay());

        for (let w = 0; w < 53; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const day = new Date(start);
                day.setDate(day.getDate() + (w * 7) + d);
                const key = day.toISOString().slice(0, 10);
                week.push({
                    date: key,
                    count: dayMap[key] || 0,
                    future: day > now
                });
            }
            weeks.push(week);
        }

        return { weeks, dayMap };
    }

    /**
     * Get class attendance for a specific date.
     * Returns { date, present: [{uid, name, loginAt}], absent: [{uid, name}] }
     */
    async function getClassAttendance(classId, date) {
        if (!db) await init();
        if (!date) date = _todayKey();

        const { collection, getDocs, doc, getDoc } = window.firebaseFirestore;

        // Get class members
        const membersSnap = await getDocs(collection(db, 'classes', classId, 'members'));
        const members = [];
        membersSnap.forEach(d => members.push({ uid: d.id, ...d.data() }));

        const present = [];
        const absent = [];

        await Promise.all(members.map(async member => {
            try {
                const attDoc = await getDoc(doc(db, 'analytics', member.uid, 'attendance', date));
                // Get display name
                const userDoc = await getDoc(doc(db, 'users', member.uid));
                const name = userDoc.exists()
                    ? (userDoc.data().callsign || userDoc.data().displayName || member.uid.slice(0, 8))
                    : member.uid.slice(0, 8);

                if (attDoc.exists()) {
                    const data = attDoc.data();
                    present.push({
                        uid: member.uid,
                        name,
                        loginAt: data.firstLoginAt,
                        loginCount: data.loginCount || 1
                    });
                } else {
                    absent.push({ uid: member.uid, name });
                }
            } catch (e) {
                absent.push({ uid: member.uid, name: member.uid.slice(0, 8) });
            }
        }));

        return {
            date,
            present: present.sort((a, b) => a.name.localeCompare(b.name)),
            absent: absent.sort((a, b) => a.name.localeCompare(b.name)),
            total: members.length,
            rate: members.length > 0 ? Math.round((present.length / members.length) * 100) : 0
        };
    }

    /**
     * Get consecutive login streak for a user.
     * Returns { current, longest, lastLogin }
     */
    async function getStreaks(uid) {
        if (!db) await init();

        const { collection, query, getDocs, orderBy } = window.firebaseFirestore;

        const attRef = collection(db, 'analytics', uid, 'attendance');
        const q = query(attRef, orderBy('date', 'asc'));
        const snap = await getDocs(q);

        const dates = [];
        snap.forEach(doc => dates.push(doc.data().date));

        if (dates.length === 0) {
            return { current: 0, longest: 0, lastLogin: null };
        }

        // Calculate streaks
        let current = 1;
        let longest = 1;
        let streak = 1;

        for (let i = 1; i < dates.length; i++) {
            const diff = _daysBetween(dates[i - 1], dates[i]);
            if (diff === 1) {
                streak++;
                if (streak > longest) longest = streak;
            } else {
                streak = 1;
            }
        }

        // Check if current streak is still active (last login was today or yesterday)
        const lastDate = dates[dates.length - 1];
        const daysSinceLast = _daysBetween(lastDate, _todayKey());
        if (daysSinceLast <= 1) {
            current = streak;
        } else {
            current = 0;
        }

        return {
            current,
            longest,
            lastLogin: lastDate,
            totalDays: dates.length
        };
    }

    /**
     * Get students who haven't logged in for X days.
     * Returns { alerts: [{ uid, name, lastLogin, daysMissed }] }
     */
    async function getAbsenceAlerts(classId, threshold) {
        if (!db) await init();
        if (!threshold) threshold = 3;

        const { collection, getDocs, doc, getDoc, query, orderBy, limitToLast } = window.firebaseFirestore;

        // Get class members
        const membersSnap = await getDocs(collection(db, 'classes', classId, 'members'));
        const members = [];
        membersSnap.forEach(d => members.push({ uid: d.id, ...d.data() }));

        const alerts = [];
        const today = _todayKey();

        await Promise.all(members.map(async member => {
            try {
                // Get most recent attendance record
                const attRef = collection(db, 'analytics', member.uid, 'attendance');
                const q = query(attRef, orderBy('date', 'desc'), limitToLast(1));
                const snap = await getDocs(q);

                // Get display name
                const userDoc = await getDoc(doc(db, 'users', member.uid));
                const name = userDoc.exists()
                    ? (userDoc.data().callsign || userDoc.data().displayName || member.uid.slice(0, 8))
                    : member.uid.slice(0, 8);

                let lastLogin = null;
                let daysMissed = Infinity;

                snap.forEach(d => {
                    lastLogin = d.data().date;
                    daysMissed = _daysBetween(lastLogin, today);
                });

                if (snap.empty) {
                    daysMissed = Infinity;
                }

                if (daysMissed >= threshold) {
                    alerts.push({
                        uid: member.uid,
                        name,
                        lastLogin,
                        daysMissed: daysMissed === Infinity ? 'Never' : daysMissed
                    });
                }
            } catch (e) {
                // Skip on error
            }
        }));

        // Sort by most days missed
        alerts.sort((a, b) => {
            const aVal = a.daysMissed === 'Never' ? 9999 : a.daysMissed;
            const bVal = b.daysMissed === 'Never' ? 9999 : b.daysMissed;
            return bVal - aVal;
        });

        return {
            alerts,
            threshold,
            totalMembers: members.length
        };
    }

    // =====================================================================
    // PUBLIC INTERFACE
    // =====================================================================

    return {
        init,
        recordLogin,
        getAttendancePattern,
        getYearlyHeatmap,
        getClassAttendance,
        getStreaks,
        getAbsenceAlerts
    };

})();
