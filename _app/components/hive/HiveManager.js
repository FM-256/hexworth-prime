/**
 * HiveManager.js - Multiplayer Hive Session Manager
 *
 * Core manager for collaborative Hive sessions. Handles session creation,
 * joining, real-time action broadcasting, presence tracking, and role
 * assignment via Firestore listeners.
 *
 * Modes:
 * - co-op: Shared workspace with role assignments
 * - competitive: Individual workspaces with leaderboard
 * - redqueen: Asymmetric attacker vs challengers
 *
 * Usage:
 *   await HiveManager.init();
 *   const hive = await HiveManager.createHive({ mode: 'co-op', maxPlayers: 4 });
 *   await HiveManager.joinHive('ABC123');
 *   HiveManager.onAction((action) => { ... });
 *   HiveManager.broadcastAction({ type: 'flag_found', data: {...} });
 *
 * Dependencies:
 *   - FirebaseAuth.js (must be initialized)
 *   - Firestore SDK (loaded dynamically)
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const HiveManager = (function () {
    'use strict';

    // ── State ────────────────────────────────────────────────────────
    let _db = null;
    let _initialized = false;
    let _currentHive = null;       // { id, ref, mode, ... }
    let _actionListeners = [];
    let _presenceListeners = [];
    let _unsubActions = null;
    let _unsubParticipants = null;
    let _presenceInterval = null;

    const PRESENCE_INTERVAL_MS = 30000;   // heartbeat every 30s
    const PRESENCE_TIMEOUT_MS  = 90000;   // offline after 90s silence
    const INVITE_CODE_LENGTH   = 6;

    // ── Firestore helpers ────────────────────────────────────────────

    async function _ensureFirestore() {
        if (_db) return _db;
        if (!window.firebaseFirestore) {
            const mod = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
            window.firebaseFirestore = mod;
        }
        const fs = window.firebaseFirestore;
        const { getApps } = window.firebaseApp;
        const apps = getApps();
        if (!apps.length) throw new Error('[HiveManager] Firebase app not initialized');
        _db = fs.getFirestore(apps[0]);
        return _db;
    }

    function _fs() { return window.firebaseFirestore; }

    function _uid() {
        if (typeof FirebaseAuth === 'undefined') return null;
        const u = FirebaseAuth.getUser();
        return u ? u.uid : null;
    }

    function _userMeta() {
        if (typeof FirebaseAuth === 'undefined') return {};
        const u = FirebaseAuth.getUser();
        if (!u) return {};
        return {
            uid: u.uid,
            displayName: u.displayName || 'Agent',
            photoURL: u.photoURL || '',
            house: localStorage.getItem('hexworth_house') || 'unsorted'
        };
    }

    function _generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    // ── Init ─────────────────────────────────────────────────────────

    async function init() {
        if (_initialized) return true;
        try {
            await _ensureFirestore();
            _initialized = true;
            return true;
        } catch (e) {
            console.error('[HiveManager] Init failed:', e);
            return false;
        }
    }

    // ── Create Hive ──────────────────────────────────────────────────

    /**
     * Create a new Hive session.
     * @param {Object} config
     * @param {string} config.mode - 'co-op' | 'competitive' | 'redqueen'
     * @param {number} [config.maxPlayers=4]
     * @param {number} [config.timeLimit=0] - minutes, 0 = unlimited
     * @param {string} [config.difficulty='normal']
     * @param {string} [config.title='']
     * @returns {Object} { id, inviteCode }
     */
    async function createHive(config) {
        await init();
        const fs = _fs();
        const uid = _uid();
        if (!uid) throw new Error('Must be signed in to create a Hive');

        const inviteCode = _generateCode();
        const meta = _userMeta();

        const hiveData = {
            mode: config.mode || 'co-op',
            title: config.title || '',
            maxPlayers: config.maxPlayers || 4,
            timeLimit: config.timeLimit || 0,
            difficulty: config.difficulty || 'normal',
            inviteCode: inviteCode,
            creatorUid: uid,
            creatorName: meta.displayName,
            status: 'lobby',             // lobby | active | completed
            createdAt: fs.serverTimestamp(),
            startedAt: null,
            endedAt: null,
            participantCount: 1
        };

        const hiveRef = await fs.addDoc(fs.collection(_db, 'hives'), hiveData);

        // Add creator as first participant
        await fs.setDoc(fs.doc(_db, 'hives', hiveRef.id, 'participants', uid), {
            ...meta,
            role: config.mode === 'redqueen' ? 'redqueen' : 'leader',
            joinedAt: fs.serverTimestamp(),
            lastSeen: fs.serverTimestamp(),
            online: true,
            score: 0
        });

        await _attachToHive(hiveRef.id, hiveData.mode);

        return { id: hiveRef.id, inviteCode };
    }

    // ── Join Hive ────────────────────────────────────────────────────

    /**
     * Join an existing Hive by ID or invite code.
     * @param {string} hiveIdOrCode - Firestore doc ID or 6-char invite code
     */
    async function joinHive(hiveIdOrCode) {
        await init();
        const fs = _fs();
        const uid = _uid();
        if (!uid) throw new Error('Must be signed in to join a Hive');

        let hiveId = hiveIdOrCode;
        let hiveSnap;

        // If short code, resolve to doc ID
        if (hiveIdOrCode.length <= INVITE_CODE_LENGTH) {
            const q = fs.query(
                fs.collection(_db, 'hives'),
                fs.where('inviteCode', '==', hiveIdOrCode.toUpperCase()),
                fs.where('status', 'in', ['lobby', 'active']),
                fs.limit(1)
            );
            const snap = await fs.getDocs(q);
            if (snap.empty) throw new Error('Hive not found or already ended');
            hiveSnap = snap.docs[0];
            hiveId = hiveSnap.id;
        } else {
            hiveSnap = await fs.getDoc(fs.doc(_db, 'hives', hiveId));
            if (!hiveSnap.exists()) throw new Error('Hive not found');
        }

        const hiveData = hiveSnap.data();
        if (hiveData.status === 'completed') throw new Error('Hive has ended');

        // Check capacity
        const pSnap = await fs.getDocs(fs.collection(_db, 'hives', hiveId, 'participants'));
        if (pSnap.size >= hiveData.maxPlayers) throw new Error('Hive is full');

        // Already in?
        const existingDoc = await fs.getDoc(fs.doc(_db, 'hives', hiveId, 'participants', uid));
        if (!existingDoc.exists()) {
            const meta = _userMeta();
            await fs.setDoc(fs.doc(_db, 'hives', hiveId, 'participants', uid), {
                ...meta,
                role: 'scout',
                joinedAt: fs.serverTimestamp(),
                lastSeen: fs.serverTimestamp(),
                online: true,
                score: 0
            });
            await fs.updateDoc(fs.doc(_db, 'hives', hiveId), {
                participantCount: fs.increment(1)
            });
        } else {
            // Re-joining: mark online
            await fs.updateDoc(fs.doc(_db, 'hives', hiveId, 'participants', uid), {
                online: true,
                lastSeen: fs.serverTimestamp()
            });
        }

        await _attachToHive(hiveId, hiveData.mode);
        return { id: hiveId, mode: hiveData.mode };
    }

    // ── Leave / Cleanup ──────────────────────────────────────────────

    async function leaveHive() {
        if (!_currentHive) return;
        const fs = _fs();
        const uid = _uid();
        if (uid) {
            try {
                await fs.updateDoc(
                    fs.doc(_db, 'hives', _currentHive.id, 'participants', uid),
                    { online: false, lastSeen: fs.serverTimestamp() }
                );
            } catch (e) { /* best-effort */ }
        }
        _detach();
    }

    // ── Actions ──────────────────────────────────────────────────────

    /**
     * Broadcast an action to all participants.
     * @param {Object} action - { type: string, data: any }
     */
    async function broadcastAction(action) {
        if (!_currentHive) throw new Error('Not in a Hive');
        const fs = _fs();
        const uid = _uid();

        await fs.addDoc(fs.collection(_db, 'hives', _currentHive.id, 'actions'), {
            uid: uid,
            displayName: _userMeta().displayName,
            type: action.type || 'generic',
            data: action.data || {},
            timestamp: fs.serverTimestamp()
        });
    }

    /**
     * Listen for actions from other participants.
     * @param {Function} callback - receives { uid, type, data, timestamp }
     */
    function onAction(callback) {
        _actionListeners.push(callback);
    }

    /**
     * Remove an action listener.
     */
    function offAction(callback) {
        _actionListeners = _actionListeners.filter(fn => fn !== callback);
    }

    // ── Participants & Roles ─────────────────────────────────────────

    /**
     * Get current participants list.
     * @returns {Array} participants with roles
     */
    async function getParticipants() {
        if (!_currentHive) return [];
        const fs = _fs();
        const snap = await fs.getDocs(
            fs.collection(_db, 'hives', _currentHive.id, 'participants')
        );
        const now = Date.now();
        return snap.docs.map(d => {
            const data = d.data();
            const lastSeen = data.lastSeen?.toMillis ? data.lastSeen.toMillis() : 0;
            return {
                uid: d.id,
                displayName: data.displayName || 'Agent',
                photoURL: data.photoURL || '',
                house: data.house || '',
                role: data.role || 'scout',
                score: data.score || 0,
                online: data.online && (now - lastSeen < PRESENCE_TIMEOUT_MS),
                joinedAt: data.joinedAt
            };
        });
    }

    /**
     * Assign a role to a participant (creator only).
     * @param {string} uid
     * @param {string} role - 'leader' | 'scout' | 'analyst' | 'operator' | 'redqueen'
     */
    async function assignRole(uid, role) {
        if (!_currentHive) throw new Error('Not in a Hive');
        const fs = _fs();
        const myUid = _uid();

        // Verify caller is creator
        const hiveSnap = await fs.getDoc(fs.doc(_db, 'hives', _currentHive.id));
        if (hiveSnap.data().creatorUid !== myUid) {
            throw new Error('Only the Hive creator can assign roles');
        }

        await fs.updateDoc(
            fs.doc(_db, 'hives', _currentHive.id, 'participants', uid),
            { role: role }
        );
    }

    /**
     * Update own score.
     */
    async function updateScore(points) {
        if (!_currentHive) return;
        const fs = _fs();
        const uid = _uid();
        await fs.updateDoc(
            fs.doc(_db, 'hives', _currentHive.id, 'participants', uid),
            { score: fs.increment(points) }
        );
    }

    /**
     * Listen for participant changes (joins, leaves, role changes).
     * @param {Function} callback - receives participants array
     */
    function onParticipantsChange(callback) {
        _presenceListeners.push(callback);
    }

    // ── Session Control ──────────────────────────────────────────────

    async function startSession() {
        if (!_currentHive) return;
        const fs = _fs();
        await fs.updateDoc(fs.doc(_db, 'hives', _currentHive.id), {
            status: 'active',
            startedAt: fs.serverTimestamp()
        });
    }

    async function endSession() {
        if (!_currentHive) return;
        const fs = _fs();
        await fs.updateDoc(fs.doc(_db, 'hives', _currentHive.id), {
            status: 'completed',
            endedAt: fs.serverTimestamp()
        });
    }

    async function getHiveData() {
        if (!_currentHive) return null;
        const fs = _fs();
        const snap = await fs.getDoc(fs.doc(_db, 'hives', _currentHive.id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    }

    /**
     * List active Hives (for lobby browsing).
     * @param {number} [limit=20]
     */
    async function listActiveHives(maxResults) {
        await init();
        const fs = _fs();
        const q = fs.query(
            fs.collection(_db, 'hives'),
            fs.where('status', 'in', ['lobby', 'active']),
            fs.orderBy('createdAt', 'desc'),
            fs.limit(maxResults || 20)
        );
        const snap = await fs.getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // ── Chat ─────────────────────────────────────────────────────────

    async function sendChat(message) {
        if (!_currentHive) return;
        const fs = _fs();
        const meta = _userMeta();
        await fs.addDoc(fs.collection(_db, 'hives', _currentHive.id, 'chat'), {
            uid: meta.uid,
            displayName: meta.displayName,
            message: message,
            timestamp: fs.serverTimestamp()
        });
    }

    function onChat(callback) {
        if (!_currentHive) return null;
        const fs = _fs();
        const q = fs.query(
            fs.collection(_db, 'hives', _currentHive.id, 'chat'),
            fs.orderBy('timestamp', 'asc'),
            fs.limitToLast(100)
        );
        return fs.onSnapshot(q, (snap) => {
            const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(messages);
        });
    }

    // ── Internal: Attach / Detach ────────────────────────────────────

    async function _attachToHive(hiveId, mode) {
        _detach();  // clean up previous
        const fs = _fs();

        _currentHive = { id: hiveId, mode: mode };

        // Listen for new actions (only after now)
        const actionsRef = fs.query(
            fs.collection(_db, 'hives', hiveId, 'actions'),
            fs.orderBy('timestamp', 'asc'),
            fs.limitToLast(1)
        );
        let firstSnapshot = true;
        _unsubActions = fs.onSnapshot(actionsRef, (snap) => {
            if (firstSnapshot) { firstSnapshot = false; return; }
            snap.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const data = { id: change.doc.id, ...change.doc.data() };
                    if (data.uid !== _uid()) {
                        _actionListeners.forEach(fn => fn(data));
                    }
                }
            });
        });

        // Listen for participant changes
        _unsubParticipants = fs.onSnapshot(
            fs.collection(_db, 'hives', hiveId, 'participants'),
            (snap) => {
                const participants = snap.docs.map(d => ({
                    uid: d.id,
                    ...d.data()
                }));
                _presenceListeners.forEach(fn => fn(participants));
            }
        );

        // Presence heartbeat
        _presenceInterval = setInterval(async () => {
            const uid = _uid();
            if (!uid || !_currentHive) return;
            try {
                await fs.updateDoc(
                    fs.doc(_db, 'hives', _currentHive.id, 'participants', uid),
                    { lastSeen: fs.serverTimestamp(), online: true }
                );
            } catch (e) { /* best-effort */ }
        }, PRESENCE_INTERVAL_MS);

        // Leave on page unload
        window.addEventListener('beforeunload', _onUnload);
    }

    function _detach() {
        if (_unsubActions) { _unsubActions(); _unsubActions = null; }
        if (_unsubParticipants) { _unsubParticipants(); _unsubParticipants = null; }
        if (_presenceInterval) { clearInterval(_presenceInterval); _presenceInterval = null; }
        window.removeEventListener('beforeunload', _onUnload);
        _currentHive = null;
        _actionListeners = [];
        _presenceListeners = [];
    }

    function _onUnload() {
        // Fire-and-forget presence update
        if (_currentHive && _uid()) {
            const fs = _fs();
            try {
                fs.updateDoc(
                    fs.doc(_db, 'hives', _currentHive.id, 'participants', _uid()),
                    { online: false }
                );
            } catch (e) { /* best-effort */ }
        }
    }

    // ── Public API ───────────────────────────────────────────────────

    return {
        init,
        createHive,
        joinHive,
        leaveHive,
        broadcastAction,
        onAction,
        offAction,
        getParticipants,
        assignRole,
        updateScore,
        onParticipantsChange,
        startSession,
        endSession,
        getHiveData,
        listActiveHives,
        sendChat,
        onChat,
        getCurrentHive: function () { return _currentHive; },
        isInHive: function () { return !!_currentHive; }
    };
})();
