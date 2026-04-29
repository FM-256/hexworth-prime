/**
 * TriageQueueClient.js — Read+write adapter for the self-healing pipeline
 * triage queue (`_triage_queue` Firestore collection).
 *
 * Companion to NexusReader.js. NexusReader handles `_quality_reports/latest`
 * (read-only summary). TriageQueueClient handles `_triage_queue` (mutable
 * defect items) and is the human side of the bidirectional control plane.
 *
 * Design doc: _docs/features/SELF_HEALING_PIPELINE.md
 *
 * AUTH:
 *   `_triage_queue` Firestore rules require admin claim/email reads + writes.
 *   Caller must already have FirebaseAuth initialized AND be admin.
 *
 * USAGE:
 *   await TriageQueueClient.init();
 *
 *   // Subscribe to live updates
 *   const unsubscribe = TriageQueueClient.subscribe(function(items) {
 *     // items is an array of triage docs sorted by priority desc
 *     renderTriagePanel(items);
 *   });
 *
 *   // Mutations
 *   await TriageQueueClient.claim(itemId);              // first-writer-wins
 *   await TriageQueueClient.defer(itemId, 'waiting on textbook');
 *   await TriageQueueClient.dismiss(itemId, 'false positive');
 *   await TriageQueueClient.bumpPriority(itemId, +20);
 *   await TriageQueueClient.reassign(itemId, 'agent:marathon-3');
 *
 *   // When done
 *   unsubscribe();
 *
 * QUERY FILTER (per design doc + Nancy review):
 *   - status in [open, claimed, in-progress] (resolved/dismissed/deferred excluded)
 *   - orderBy priority desc
 *   - limit 50 (caps cost; matches what a human can triage in one sitting)
 *   - severity NOT filtered here — already gated at write-time in publishTriage()
 *
 * MUTATION SAFETY:
 *   - claim() uses runTransaction so concurrent claims resolve first-writer-wins
 *   - all mutations append to history[] for audit trail
 *   - lastModifiedBy tracked from current Firebase user email
 */
(function (global) {
    'use strict';

    var COLLECTION = '_triage_queue';
    var QUERY_LIMIT = 50;
    var ACTIVE_STATUSES = ['open', 'claimed', 'in-progress'];

    var _firestoreModule = null;
    var _db = null;
    var _initInFlight = null;
    var _activeUnsubscribers = new Set();

    /**
     * Lazy-load the Firestore SDK and resolve db handle.
     * Reuses NexusReader's loaded SDK if already present (window.firebaseFirestore).
     */
    async function ensureFirestore() {
        if (_db) return _db;
        if (_initInFlight) return _initInFlight;

        _initInFlight = (async function () {
            if (!window.firebaseApp || typeof window.firebaseApp.getApps !== 'function') {
                throw new Error('[TriageQueueClient] Firebase app not initialized — load FirebaseAuth.js first');
            }
            if (!window.firebaseFirestore) {
                var mod = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
                window.firebaseFirestore = mod;
            }
            _firestoreModule = window.firebaseFirestore;
            var apps = window.firebaseApp.getApps();
            if (!apps.length) {
                throw new Error('[TriageQueueClient] No Firebase app instance available');
            }
            _db = _firestoreModule.getFirestore(apps[0]);
            return _db;
        })();

        return _initInFlight;
    }

    /**
     * Resolve the current admin actor identifier for owner/lastModifiedBy fields.
     * Format: human:<email-localpart-or-uid>
     */
    function currentActorId() {
        try {
            var auth = window.firebaseAuth;
            var user = auth && typeof auth.getCurrentUser === 'function'
                ? auth.getCurrentUser()
                : null;
            if (!user) return 'human:unknown';
            var local = (user.email || user.uid || 'unknown').split('@')[0]
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, '-');
            return 'human:' + local;
        } catch (e) {
            return 'human:unknown';
        }
    }

    /**
     * Normalize a Firestore Timestamp / object into ISO string.
     */
    function tsToIso(ts) {
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
     * Convert a Firestore doc snapshot to the plain shape callers consume.
     */
    function docToItem(doc) {
        var d = doc.data() || {};
        return {
            id: doc.id,
            defectFingerprint: d.defectFingerprint || '',
            source: d.source || 'unknown',
            severity: d.severity || 'low',
            rule: d.rule || null,
            ruleVersion: d.ruleVersion || null,
            title: d.title || '',
            description: d.description || '',
            filePath: d.filePath || null,
            lineNumber: d.lineNumber || null,
            groupKey: d.groupKey || null,
            childCount: d.childCount || 0,
            childPaths: Array.isArray(d.childPaths) ? d.childPaths : [],
            status: d.status || 'open',
            priority: typeof d.priority === 'number' ? d.priority : 0,
            owner: d.owner || null,
            claimedAt: tsToIso(d.claimedAt),
            heartbeatAt: tsToIso(d.heartbeatAt),
            autoFixEligible: !!d.autoFixEligible,
            createdAt: tsToIso(d.createdAt),
            updatedAt: tsToIso(d.updatedAt),
            resolvedAt: tsToIso(d.resolvedAt),
            resolvedBy: d.resolvedBy || null,
            history: Array.isArray(d.history) ? d.history : [],
        };
    }

    /**
     * Public API: subscribe to the live triage queue.
     * Calls `onItems` with an array of items every time the snapshot updates.
     * Returns an unsubscribe function.
     */
    async function subscribe(onItems, onError) {
        var db = await ensureFirestore();
        var fs = _firestoreModule;
        var q = fs.query(
            fs.collection(db, COLLECTION),
            fs.where('status', 'in', ACTIVE_STATUSES),
            fs.orderBy('priority', 'desc'),
            fs.limit(QUERY_LIMIT)
        );
        var unsub = fs.onSnapshot(q, function (snap) {
            var items = [];
            snap.forEach(function (doc) { items.push(docToItem(doc)); });
            try { onItems(items); } catch (e) { console.error('[TriageQueueClient] onItems handler threw:', e); }
        }, function (err) {
            console.error('[TriageQueueClient] subscription error:', err);
            if (typeof onError === 'function') {
                try { onError(err); } catch (e) { /* swallow */ }
            }
        });
        _activeUnsubscribers.add(unsub);
        return function detach() {
            unsub();
            _activeUnsubscribers.delete(unsub);
        };
    }

    /**
     * Internal helper: apply a mutation to a triage item via Firestore transaction.
     * Read current state, mutate, append history entry, write back.
     * The transaction ensures concurrent claims don't both succeed silently.
     *
     * @param {string} itemId
     * @param {function(item, fs): {fields: object, action: string, note?: string}} mutator
     *        Returns the fields to merge into the doc + an action label for history.
     */
    async function _mutate(itemId, mutator) {
        var db = await ensureFirestore();
        var fs = _firestoreModule;
        var ref = fs.doc(db, COLLECTION, itemId);
        var actor = currentActorId();
        return fs.runTransaction(db, async function (txn) {
            var snap = await txn.get(ref);
            if (!snap.exists()) {
                throw new Error('[TriageQueueClient] item not found: ' + itemId);
            }
            var current = docToItem(snap);
            var spec = mutator(current, fs);
            if (!spec || !spec.fields) {
                throw new Error('[TriageQueueClient] mutator returned no fields');
            }
            var historyEntry = {
                ts: new Date().toISOString(),
                actor: actor,
                action: spec.action || 'update',
                note: spec.note || null,
            };
            var newHistory = (current.history || []).concat([historyEntry]).slice(-20);
            var update = Object.assign({}, spec.fields, {
                updatedAt: fs.serverTimestamp(),
                history: newHistory,
            });
            txn.update(ref, update);
            return { actor: actor, action: spec.action };
        });
    }

    /**
     * Public API: claim an item (first-writer-wins via transaction).
     * Sets status: claimed, owner: <currentActor>, claimedAt: now.
     * Throws if already claimed by another actor.
     */
    async function claim(itemId) {
        // Cache actor once at call time so the ownership check and owner
        // write always agree even across an auth-token refresh.
        var actor = currentActorId();
        return _mutate(itemId, function (item, fs) {
            if (item.status === 'claimed' || item.status === 'in-progress') {
                if (item.owner && item.owner !== actor) {
                    throw new Error('[TriageQueueClient] item already claimed by ' + item.owner);
                }
            }
            return {
                action: 'claim',
                fields: {
                    status: 'claimed',
                    owner: actor,
                    claimedAt: fs.serverTimestamp(),
                },
            };
        });
    }

    /**
     * Public API: defer an item (e.g., waiting on a dependency).
     */
    async function defer(itemId, reason) {
        return _mutate(itemId, function () {
            return {
                action: 'defer',
                note: reason || null,
                fields: { status: 'deferred' },
            };
        });
    }

    /**
     * Public API: dismiss an item (false positive, won't fix, etc.).
     */
    async function dismiss(itemId, reason) {
        return _mutate(itemId, function () {
            return {
                action: 'dismiss',
                note: reason || null,
                fields: { status: 'dismissed' },
            };
        });
    }

    /**
     * Public API: nudge priority by `delta`. Bounded 0..100 + Math.round to
     * satisfy the Firestore rule (priority is number AND in [0,100]).
     */
    async function bumpPriority(itemId, delta) {
        return _mutate(itemId, function (item) {
            var next = Math.round(Math.max(0, Math.min(100, (item.priority || 0) + (delta || 0))));
            return {
                action: 'bumpPriority',
                note: 'delta=' + delta + ' new=' + next,
                fields: { priority: next },
            };
        });
    }

    /**
     * Public API: explicit owner reassignment. Owner must match the
     * `^(agent|human):[a-z0-9_-]+$` regex enforced by Firestore rules.
     */
    async function reassign(itemId, newOwner) {
        if (!/^(agent|human):[a-z0-9_-]+$/.test(newOwner || '')) {
            throw new Error('[TriageQueueClient] invalid owner format: ' + newOwner);
        }
        return _mutate(itemId, function () {
            return {
                action: 'reassign',
                note: 'newOwner=' + newOwner,
                fields: { owner: newOwner, status: 'claimed' },
            };
        });
    }

    /**
     * Public API: explicit init for callers that want errors at page load.
     */
    async function init() {
        await ensureFirestore();
        return true;
    }

    /**
     * Public API: detach all subscriptions. Useful on page unload.
     */
    function detachAll() {
        _activeUnsubscribers.forEach(function (u) {
            try { u(); } catch (e) { /* swallow */ }
        });
        _activeUnsubscribers.clear();
    }

    global.TriageQueueClient = {
        init: init,
        subscribe: subscribe,
        claim: claim,
        defer: defer,
        dismiss: dismiss,
        bumpPriority: bumpPriority,
        reassign: reassign,
        detachAll: detachAll,
        // Constants exposed for callers that need to render/filter
        ACTIVE_STATUSES: ACTIVE_STATUSES,
        QUERY_LIMIT: QUERY_LIMIT,
    };
})(window);
