/**
 * NexusReader.js — Read-side adapter for the Nexus quality pipeline.
 *
 * Nexus (`_tools/nexus/`) is a developer-side hub that orchestrates EduScan,
 * sprint master, HED, audit, etc., and publishes a sanitized summary to
 * Firestore at `_quality_reports/latest` via `nexus full --publish`.
 *
 * This component lets browser surfaces (Pulse, Admin Console, eventually
 * Handler Dashboard for filtered per-course views) read that summary without
 * each surface reimplementing Firestore plumbing.
 *
 * AUTH REQUIREMENTS:
 *   `_quality_reports/{reportId}` Firestore rules require admin-claim reads.
 *   Caller must already have FirebaseAuth initialized AND be admin.
 *
 * USAGE:
 *   await NexusReader.init();          // optional — lazy on first call
 *   const summary = await NexusReader.getSummary();
 *   if (summary.gate === 'PASS') { ... }
 *
 *   const cseFindings = await NexusReader.getFindingsByPath(
 *     'houses/divergent/cybersecurity-ethics/');
 *
 * SCHEMA OF summary (from publish.js buildSummary):
 *   {
 *     scannedAt: Timestamp,
 *     scannedBy: 'CLI',
 *     duration: number (ms),
 *     filesScanned: number,
 *     gate: 'PASS' | 'FAIL',
 *     severity: { critical, high, medium, low, suspect, warning },
 *     topIssues: [{ code, severity, message, file, line }] (max 50),
 *     spokes: { ... per-spoke summaries },
 *     ruleBreakdown: { ruleCode: count }
 *   }
 *
 * CACHE:
 *   sessionStorage key 'nexus_reader_cache' holds { ts, payload }.
 *   TTL is 5 minutes — long enough that a single page session shares
 *   one Firestore read; short enough that re-opening the tab after a
 *   deploy gets fresh data.
 */
(function (global) {
    'use strict';

    var CACHE_KEY = 'nexus_reader_cache';
    var CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
    var DOC_PATH = '_quality_reports/latest';

    var _firestoreModule = null;
    var _db = null;
    var _initInFlight = null;

    /**
     * Lazy-load the Firebase Firestore modular SDK and resolve the db handle
     * from the existing Firebase app initialized by FirebaseAuth.js.
     */
    async function ensureFirestore() {
        if (_db) return _db;
        if (_initInFlight) return _initInFlight;

        _initInFlight = (async function () {
            if (!window.firebaseApp || typeof window.firebaseApp.getApps !== 'function') {
                throw new Error('[NexusReader] Firebase app not initialized — load FirebaseAuth.js first');
            }
            if (!window.firebaseFirestore) {
                var mod = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
                window.firebaseFirestore = mod;
            }
            _firestoreModule = window.firebaseFirestore;
            var apps = window.firebaseApp.getApps();
            if (!apps.length) {
                throw new Error('[NexusReader] No Firebase app instance available');
            }
            _db = _firestoreModule.getFirestore(apps[0]);
            return _db;
        })();

        return _initInFlight;
    }

    function readCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || !parsed.ts) return null;
            if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
            return parsed.payload;
        } catch (e) {
            return null;
        }
    }

    function writeCache(payload) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                ts: Date.now(),
                payload: payload
            }));
        } catch (e) {
            // Quota or disabled storage — non-fatal, just skip caching
        }
    }

    /**
     * Convert the Firestore Timestamp shape the publisher writes into
     * a plain ISO string. The publisher uses serverTimestamp() which
     * deserializes as { _seconds, _nanoseconds } in the modular SDK or as
     * a Timestamp instance with toDate() depending on path.
     */
    function normalizeTimestamp(ts) {
        if (!ts) return null;
        if (typeof ts === 'string') return ts;
        if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
        if (ts._seconds || ts.seconds) {
            var s = ts._seconds || ts.seconds;
            return new Date(s * 1000).toISOString();
        }
        return null;
    }

    /**
     * Force a Firestore read of _quality_reports/latest, bypassing cache.
     * Returns the normalized payload or throws.
     */
    async function fetchSummary() {
        var db = await ensureFirestore();
        var doc = _firestoreModule.doc(db, DOC_PATH);
        var snap = await _firestoreModule.getDoc(doc);
        if (!snap.exists()) {
            throw new Error('[NexusReader] _quality_reports/latest not found — has nexus full --publish been run?');
        }
        var data = snap.data();
        var payload = {
            scannedAt: normalizeTimestamp(data.scannedAt),
            scannedBy: data.scannedBy || 'unknown',
            duration: data.duration || 0,
            filesScanned: data.filesScanned || 0,
            gate: data.gate || 'UNKNOWN',
            severity: data.severity || {},
            topIssues: Array.isArray(data.topIssues) ? data.topIssues : [],
            spokes: data.spokes || {},
            ruleBreakdown: data.ruleBreakdown || {}
        };
        writeCache(payload);
        return payload;
    }

    /**
     * Public API: get the latest published Nexus summary.
     * Returns the cached value if fresh; otherwise fetches from Firestore.
     * @returns {Promise<Object>} Summary payload (see schema above).
     */
    async function getSummary() {
        var cached = readCache();
        if (cached) return cached;
        return fetchSummary();
    }

    /**
     * Public API: filter the topIssues array by file path prefix.
     * Useful for per-course or per-house views.
     * @param {string} prefix - Path prefix to match (e.g., 'houses/divergent/').
     * @returns {Promise<Array>} Findings whose file starts with the prefix.
     */
    async function getFindingsByPath(prefix) {
        if (!prefix) return [];
        var summary = await getSummary();
        return summary.topIssues.filter(function (f) {
            return typeof f.file === 'string' && f.file.indexOf(prefix) === 0;
        });
    }

    /**
     * Public API: short-circuit boolean for gate state.
     * @returns {Promise<boolean>} True if gate is PASS.
     */
    async function isGatePassing() {
        try {
            var s = await getSummary();
            return s.gate === 'PASS';
        } catch (e) {
            return false;
        }
    }

    /**
     * Public API: explicit cache clear. Useful for "refresh now" buttons.
     */
    function clearCache() {
        try {
            sessionStorage.removeItem(CACHE_KEY);
        } catch (e) { /* noop */ }
    }

    /**
     * Public API: explicit init for callers that want to surface Firestore
     * errors at page-load time rather than at first read.
     */
    async function init() {
        await ensureFirestore();
        return true;
    }

    global.NexusReader = {
        init: init,
        getSummary: getSummary,
        getFindingsByPath: getFindingsByPath,
        isGatePassing: isGatePassing,
        clearCache: clearCache,
        // Cache TTL in ms — exposed so callers can compute "data freshness"
        CACHE_TTL_MS: CACHE_TTL_MS
    };
})(window);
