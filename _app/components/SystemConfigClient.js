/**
 * SystemConfigClient.js — Read+write adapter for _system_config docs.
 *
 * Single doc model: _system_config/self_healing
 *   {
 *     enabled: bool,                      // master kill switch (default false)
 *     enabledBy: 'human:eq',              // last actor to enable
 *     enabledAt: Timestamp,
 *     lastDisabledBy: 'human:eq',
 *     lastDisabledAt: Timestamp,
 *     enabledTemplates: ['CAT-002'],      // per-template allowlist (optional)
 *     updatedAt: Timestamp,
 *   }
 *
 * Both Pulse (admin UI) and the agent CLI read this doc. Cloud Functions
 * may also read it. Writes go through this client (admin claim required).
 *
 * AUTH:
 *   `_system_config/{docId}` Firestore rules require admin claim/email.
 */
(function (global) {
    'use strict';

    var DOC_ID = 'self_healing';
    var COLLECTION = '_system_config';

    var _firestoreModule = null;
    var _db = null;
    var _initInFlight = null;

    async function ensureFirestore() {
        if (_db) return _db;
        if (_initInFlight) return _initInFlight;
        _initInFlight = (async function () {
            if (!window.firebaseApp || typeof window.firebaseApp.getApps !== 'function') {
                throw new Error('[SystemConfigClient] Firebase app not initialized');
            }
            if (!window.firebaseFirestore) {
                var mod = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
                window.firebaseFirestore = mod;
            }
            _firestoreModule = window.firebaseFirestore;
            var apps = window.firebaseApp.getApps();
            if (!apps.length) throw new Error('[SystemConfigClient] No Firebase app instance');
            _db = _firestoreModule.getFirestore(apps[0]);
            return _db;
        })();
        return _initInFlight;
    }

    function currentActorId() {
        try {
            // FirebaseAuth is a top-level IIFE in components/FirebaseAuth.js;
            // .getUser() returns { uid, email, displayName, ... } once auth is ready
            var user = (typeof FirebaseAuth !== 'undefined' && typeof FirebaseAuth.getUser === 'function')
                ? FirebaseAuth.getUser()
                : null;
            if (!user) return 'human:unknown';
            var local = (user.email || user.uid || 'unknown').split('@')[0]
                .toLowerCase().replace(/[^a-z0-9_-]/g, '-');
            return 'human:' + local;
        } catch (e) { return 'human:unknown'; }
    }

    function tsToIso(ts) {
        if (!ts) return null;
        if (typeof ts === 'string') return ts;
        if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
        if (ts._seconds || ts.seconds) {
            return new Date((ts._seconds || ts.seconds) * 1000).toISOString();
        }
        return null;
    }

    /**
     * Get current self-healing state. Returns a default-disabled object
     * if the doc doesn't exist yet.
     */
    function _shapeState(d) {
        return {
            enabled: !!d.enabled,
            enabledBy: d.enabledBy || null,
            enabledAt: tsToIso(d.enabledAt),
            lastDisabledBy: d.lastDisabledBy || null,
            lastDisabledAt: tsToIso(d.lastDisabledAt),
            enabledTemplates: Array.isArray(d.enabledTemplates) ? d.enabledTemplates : [],
            availableTemplates: Array.isArray(d.availableTemplates) ? d.availableTemplates : [],
            availableTemplatesUpdatedAt: tsToIso(d.availableTemplatesUpdatedAt),
            updatedAt: tsToIso(d.updatedAt),
        };
    }

    async function getSelfHealingState() {
        var db = await ensureFirestore();
        var fs = _firestoreModule;
        var snap = await fs.getDoc(fs.doc(db, COLLECTION, DOC_ID));
        if (!snap.exists()) {
            return _shapeState({});
        }
        return _shapeState(snap.data() || {});
    }

    /**
     * Live subscribe to state changes. Useful for the Pulse toggle UI
     * to reflect changes made from another tab/admin.
     */
    async function subscribeSelfHealingState(onState, onError) {
        var db = await ensureFirestore();
        var fs = _firestoreModule;
        var unsub = fs.onSnapshot(fs.doc(db, COLLECTION, DOC_ID), function (snap) {
            onState(snap.exists() ? _shapeState(snap.data() || {}) : _shapeState({}));
        }, function (err) {
            if (typeof onError === 'function') onError(err);
        });
        return unsub;
    }

    /**
     * Flip the master toggle. Preserves existing enabledTemplates.
     * Records actor and timestamp.
     *
     * Uses Firestore runTransaction (Nancy round 7 fix): two operators
     * clicking simultaneously previously had a lost-update race because
     * read-then-write-via-setDoc isn't atomic. Transaction guarantees
     * each write sees the result of the prior write.
     */
    async function setEnabled(enabled) {
        var db = await ensureFirestore();
        var fs = _firestoreModule;
        var ref = fs.doc(db, COLLECTION, DOC_ID);
        var actor = currentActorId();
        return fs.runTransaction(db, async function (txn) {
            var snap = await txn.get(ref);
            var existing = snap.exists() ? snap.data() : {};
            var update = {
                enabled: !!enabled,
                enabledTemplates: Array.isArray(existing.enabledTemplates) ? existing.enabledTemplates : [],
                updatedAt: fs.serverTimestamp(),
                enabledBy: existing.enabledBy || null,
                enabledAt: existing.enabledAt || null,
                lastDisabledBy: existing.lastDisabledBy || null,
                lastDisabledAt: existing.lastDisabledAt || null,
            };
            if (enabled) {
                update.enabledBy = actor;
                update.enabledAt = fs.serverTimestamp();
            } else {
                update.lastDisabledBy = actor;
                update.lastDisabledAt = fs.serverTimestamp();
            }
            // merge:true preserves fields written by other code paths
            // (e.g., availableTemplates from nexus publish.js mirror)
            txn.set(ref, update, { merge: true });
            return update;
        });
    }

    /**
     * Add or remove a template from the per-template allowlist.
     * The master `enabled` flag must also be true for any template to run.
     *
     * Uses Firestore runTransaction (Nancy round 7 fix): if two admins
     * click different template toggles in quick succession, the second
     * write previously could clobber the first's change. Transaction
     * ensures both updates land.
     */
    async function setTemplateEnabled(ruleCode, enabled) {
        var db = await ensureFirestore();
        var fs = _firestoreModule;
        var ref = fs.doc(db, COLLECTION, DOC_ID);
        return fs.runTransaction(db, async function (txn) {
            var snap = await txn.get(ref);
            var existing = snap.exists() ? snap.data() : {};
            var current = Array.isArray(existing.enabledTemplates) ? existing.enabledTemplates : [];
            var next = enabled
                ? (current.includes(ruleCode) ? current : current.concat([ruleCode]))
                : current.filter(function (r) { return r !== ruleCode; });
            var update = {
                enabled: !!existing.enabled,
                enabledTemplates: next,
                updatedAt: fs.serverTimestamp(),
                enabledBy: existing.enabledBy || null,
                enabledAt: existing.enabledAt || null,
                lastDisabledBy: existing.lastDisabledBy || null,
                lastDisabledAt: existing.lastDisabledAt || null,
            };
            // merge:true preserves fields written by other code paths
            // (e.g., availableTemplates from nexus publish.js mirror)
            txn.set(ref, update, { merge: true });
            return update;
        });
    }

    async function init() {
        await ensureFirestore();
        return true;
    }

    // Read-only snapshot of healer activity from existing data sources:
    //   - _auto_fix_queue: depth (capped at limit) + most-recent agent:* history
    //   - _quality_reports/scanHeartbeat: last scan recency
    // Per Nancy review (PULSE-1, 2026-05-08): no new Firestore docs, no new CFs.
    // History entries use `ts` (ISO string), per writers in autofix-cli.js +
    // publish.js + TriageQueueClient.js.
    var QUEUE_READ_LIMIT = 100;
    function _tsToMs(ts) {
        if (!ts) return null;
        if (typeof ts.toMillis === 'function') return ts.toMillis();
        if (typeof ts === 'string') { var t = Date.parse(ts); return isNaN(t) ? null : t; }
        if (ts._seconds || ts.seconds) return (ts._seconds || ts.seconds) * 1000;
        return null;
    }

    async function getHealerActivity() {
        var db = await ensureFirestore();
        var fs = _firestoreModule;
        var thirtyMinAgo = Date.now() - 30 * 60 * 1000;
        var depth = 0, depthCapped = false, lastAgentAt = null, applyFailLast30 = 0;
        try {
            var qSnap = await fs.getDocs(fs.query(fs.collection(db, '_auto_fix_queue'), fs.limit(QUEUE_READ_LIMIT)));
            depth = qSnap.size;
            depthCapped = (depth >= QUEUE_READ_LIMIT);
            qSnap.forEach(function (doc) {
                var d = doc.data() || {};
                var hist = Array.isArray(d.history) ? d.history : [];
                hist.forEach(function (h) {
                    var actor = h.actor || '';
                    if (actor.indexOf('agent:') !== 0) return;
                    var ms = _tsToMs(h.ts);
                    if (!ms) return;
                    if (!lastAgentAt || ms > lastAgentAt) lastAgentAt = ms;
                    var action = h.action || '';
                    if (ms > thirtyMinAgo && action.indexOf('apply-validate-failed') === 0) applyFailLast30++;
                });
            });
        } catch (e) {
            // queue read failure is non-fatal — surface as null fields
        }
        var lastScanAtMs = null, lastScanGate = null;
        try {
            var hbSnap = await fs.getDoc(fs.doc(db, '_quality_reports', 'scanHeartbeat'));
            if (hbSnap.exists()) {
                var hb = hbSnap.data() || {};
                lastScanAtMs = _tsToMs(hb.scannedAt);
                lastScanGate = (typeof hb.gatePass === 'boolean') ? hb.gatePass : null;
            }
        } catch (e) {
            // heartbeat read failure is non-fatal
        }
        return {
            queueDepth: depth,
            queueDepthCapped: depthCapped,
            lastAgentApplyAtMs: lastAgentAt,
            applyFailLast30min: applyFailLast30,
            lastScanAtMs: lastScanAtMs,
            lastScanGatePass: lastScanGate,
            fetchedAtMs: Date.now()
        };
    }

    global.SystemConfigClient = {
        init: init,
        getSelfHealingState: getSelfHealingState,
        subscribeSelfHealingState: subscribeSelfHealingState,
        setEnabled: setEnabled,
        setTemplateEnabled: setTemplateEnabled,
        getHealerActivity: getHealerActivity,
    };
})(window);
