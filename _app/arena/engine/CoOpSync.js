/* ============================================================
   CTF ARENA — CoOpSync.js
   Firestore sync layer for 2-player cooperative mode.
   Handles room creation, joining, real-time state sync,
   atomic flag submissions, hint reveals, and activity log.
   ============================================================ */

const CoOpSync = (function() {
    'use strict';

    let db = null;
    let initialized = false;
    let sessionRef = null;
    let activityRef = null;
    let stateUnsubscribe = null;
    let activityUnsubscribe = null;
    let presenceInterval = null;

    let _roomCode = null;
    let _playerId = null;
    let _playerName = null;
    let _isHost = false;
    let _onStateChange = null;
    let _onActivityChange = null;
    let _onPlayersChange = null;

    // ────────────────────────────────────────────────
    // INITIALIZATION
    // ────────────────────────────────────────────────

    async function init() {
        if (initialized) return true;

        try {
            // Load Firebase SDK if not already loaded
            if (!window.firebaseApp) {
                const appModule = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js');
                window.firebaseApp = appModule;
            }

            if (!window.firebaseFirestore) {
                const firestoreModule = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
                window.firebaseFirestore = firestoreModule;
            }

            const { getApps, initializeApp } = window.firebaseApp;
            const { getFirestore } = window.firebaseFirestore;

            // Initialize Firebase app if not already done
            if (getApps().length === 0) {
                const firebaseConfig = {
                    apiKey: "AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M",
                    authDomain: "hexworth-prime.firebaseapp.com",
                    projectId: "hexworth-prime",
                    storageBucket: "hexworth-prime.firebasestorage.app",
                    messagingSenderId: "11726236962",
                    appId: "1:11726236962:web:1829ea0839f2587121497b"
                };
                initializeApp(firebaseConfig);
            }

            db = getFirestore(getApps()[0]);
            initialized = true;

            // Get player identity
            _playerId = _getPlayerId();
            _playerName = _getPlayerName();

            console.log('%c[CO-OP] Sync layer initialized', 'color: #9b59b6');
            return true;
        } catch (error) {
            console.error('[CO-OP] Initialization failed:', error);
            return false;
        }
    }

    // ────────────────────────────────────────────────
    // SESSION MANAGEMENT
    // ────────────────────────────────────────────────

    /**
     * Create a new co-op session. Returns room code.
     */
    async function createSession(boxId, config) {
        if (!initialized) await init();
        if (!db) throw new Error('Firestore not available');

        const { doc, setDoc, serverTimestamp } = window.firebaseFirestore;

        _roomCode = _generateRoomCode();
        _isHost = true;

        const sessionData = {
            boxId: boxId,
            state: {
                score: config.scoring?.base || 1000,
                flagsFound: [],
                hintsUsed: [],
                wrongFlags: 0,
                startTime: Date.now(),
                elapsed: 0,
                completed: false,
                godMode: false,
                booted: false
            },
            players: {
                [_playerId]: {
                    name: _playerName,
                    joinedAt: Date.now(),
                    online: true,
                    isHost: true,
                    lastSeen: Date.now()
                }
            },
            config: {
                maxPlayers: 2,
                boxTitle: config.title || 'CTF Arena',
                boxAccent: config.accent || '#3498db'
            },
            status: 'waiting', // waiting | active | completed
            createdAt: Date.now()
        };

        sessionRef = doc(db, 'arena_sessions', _roomCode);
        await setDoc(sessionRef, sessionData);

        console.log(`%c[CO-OP] Session created: ${_roomCode}`, 'color: #2ecc71');
        return _roomCode;
    }

    /**
     * Join an existing session by room code.
     * Returns session data or throws if invalid.
     */
    async function joinSession(roomCode) {
        if (!initialized) await init();
        if (!db) throw new Error('Firestore not available');

        const { doc, getDoc, updateDoc } = window.firebaseFirestore;

        _roomCode = roomCode.toUpperCase().trim();
        _isHost = false;

        sessionRef = doc(db, 'arena_sessions', _roomCode);
        const snap = await getDoc(sessionRef);

        if (!snap.exists()) {
            throw new Error('Room not found');
        }

        const data = snap.data();

        // Check room status
        if (data.status === 'completed') {
            throw new Error('This session has already ended');
        }

        // Check player count
        const playerCount = Object.keys(data.players || {}).length;
        if (playerCount >= (data.config?.maxPlayers || 2)) {
            // Check if we're reconnecting as an existing player
            if (!data.players[_playerId]) {
                throw new Error('Room is full');
            }
        }

        // Add ourselves to the session
        await updateDoc(sessionRef, {
            [`players.${_playerId}`]: {
                name: _playerName,
                joinedAt: Date.now(),
                online: true,
                isHost: false,
                lastSeen: Date.now()
            }
        });

        console.log(`%c[CO-OP] Joined session: ${_roomCode}`, 'color: #2ecc71');
        return data;
    }

    /**
     * Start the game (host only). Sets status to active.
     */
    async function startGame() {
        if (!_isHost || !sessionRef) return;
        const { updateDoc } = window.firebaseFirestore;
        await updateDoc(sessionRef, { status: 'active' });
        await logActivity('game_started', 'Game started');
    }

    // ────────────────────────────────────────────────
    // REAL-TIME STATE SYNC
    // ────────────────────────────────────────────────

    /**
     * Subscribe to state changes. Callback receives full state object.
     */
    function subscribeToState(callback) {
        if (!sessionRef) return;
        _onStateChange = callback;

        const { onSnapshot } = window.firebaseFirestore;

        stateUnsubscribe = onSnapshot(sessionRef, (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();

            // Dispatch state update
            if (_onStateChange) {
                _onStateChange(data.state);
            }

            // Dispatch player updates
            if (_onPlayersChange) {
                _onPlayersChange(data.players, data.status);
            }
        });
    }

    /**
     * Subscribe to activity feed.
     */
    function subscribeToActivity(callback) {
        if (!sessionRef) return;
        _onActivityChange = callback;

        const { collection, query, orderBy, limit, onSnapshot } = window.firebaseFirestore;

        activityRef = collection(sessionRef, 'activity');
        const q = query(activityRef, orderBy('timestamp', 'desc'), limit(50));

        activityUnsubscribe = onSnapshot(q, (snap) => {
            const activities = [];
            snap.forEach(doc => activities.push({ id: doc.id, ...doc.data() }));
            if (_onActivityChange) {
                _onActivityChange(activities.reverse());
            }
        });
    }

    /**
     * Set callback for player changes (join, leave, ready).
     */
    function onPlayersChange(callback) {
        _onPlayersChange = callback;
    }

    /**
     * Write state to Firestore (replaces localStorage save).
     */
    async function updateState(state) {
        if (!sessionRef) return;
        const { updateDoc } = window.firebaseFirestore;

        try {
            await updateDoc(sessionRef, {
                'state': {
                    score: state.score,
                    flagsFound: state.flagsFound || [],
                    hintsUsed: state.hintsUsed || [],
                    wrongFlags: state.wrongFlags || 0,
                    startTime: state.startTime,
                    elapsed: state.elapsed || 0,
                    completed: state.completed || false,
                    godMode: state.godMode || false,
                    booted: state.booted || false
                }
            });
        } catch (error) {
            console.error('[CO-OP] State update failed:', error);
        }
    }

    // ────────────────────────────────────────────────
    // ATOMIC OPERATIONS (Race-Condition Safe)
    // ────────────────────────────────────────────────

    /**
     * Atomically submit a flag. Uses Firestore transaction.
     * Returns { success, newState, message }
     */
    async function submitFlagAtomically(flagId, flagValue, flags, scoring) {
        if (!sessionRef || !db) return { success: false, message: 'Not connected' };

        const { runTransaction } = window.firebaseFirestore;

        try {
            const result = await runTransaction(db, async (transaction) => {
                const snap = await transaction.get(sessionRef);
                if (!snap.exists()) throw new Error('Session lost');

                const data = snap.data();
                const state = data.state;

                // Already found?
                if (state.flagsFound.includes(flagId)) {
                    return { success: false, message: 'Flag already submitted', newState: state };
                }

                // Verify flag value
                const flag = flags.find(f => f.id === flagId && f.value.toLowerCase() === flagValue.toLowerCase());
                if (!flag) {
                    // Wrong flag
                    state.wrongFlags = (state.wrongFlags || 0) + 1;
                    state.score = Math.max(0, state.score + (scoring?.wrongFlagPenalty || -25));
                    transaction.update(sessionRef, { state });
                    return { success: false, message: 'Incorrect flag', newState: state, penalty: scoring?.wrongFlagPenalty || -25 };
                }

                // Capture the flag
                state.flagsFound.push(flagId);
                state.score += flag.points;

                // Check completion
                const allFound = flags.every(f => state.flagsFound.includes(f.id));
                if (allFound && !state.completed) {
                    state.completed = true;
                    // Speed bonus
                    const elapsed = Date.now() - state.startTime;
                    if (scoring?.speedBonus && elapsed < scoring.speedBonus.threshold) {
                        state.score += scoring.speedBonus.points;
                    }
                }

                state.elapsed = Date.now() - state.startTime;
                transaction.update(sessionRef, { state, status: state.completed ? 'completed' : 'active' });

                return { success: true, message: `${flagId}.txt captured! +${flag.points}`, newState: state, points: flag.points, completed: state.completed };
            });

            // Log activity on success
            if (result.success) {
                await logActivity('flag_captured', `${flagId}.txt captured (+${result.points})`);
            } else if (result.penalty) {
                await logActivity('wrong_flag', 'Incorrect flag attempt');
            }

            return result;
        } catch (error) {
            console.error('[CO-OP] Flag submission failed:', error);
            return { success: false, message: 'Transaction failed' };
        }
    }

    /**
     * Atomically reveal a hint. Prevents double-penalty.
     * Returns { success, newState }
     */
    async function revealHintAtomically(hintId, hintPenalty, isGodMode) {
        if (!sessionRef || !db) return { success: false };

        const { runTransaction } = window.firebaseFirestore;

        try {
            const result = await runTransaction(db, async (transaction) => {
                const snap = await transaction.get(sessionRef);
                if (!snap.exists()) throw new Error('Session lost');

                const data = snap.data();
                const state = data.state;

                // Already revealed? (idempotent — no double penalty)
                if (state.hintsUsed.includes(hintId)) {
                    return { success: false, alreadyUsed: true, newState: state };
                }

                state.hintsUsed.push(hintId);
                if (!isGodMode) {
                    state.score = Math.max(0, state.score + hintPenalty);
                }

                transaction.update(sessionRef, { state });
                return { success: true, newState: state };
            });

            if (result.success) {
                await logActivity('hint_revealed', `Hint revealed${isGodMode ? ' (no penalty)' : ` (${hintPenalty})`}`);
            }

            return result;
        } catch (error) {
            console.error('[CO-OP] Hint reveal failed:', error);
            return { success: false };
        }
    }

    // ────────────────────────────────────────────────
    // ACTIVITY LOG
    // ────────────────────────────────────────────────

    async function logActivity(action, detail) {
        if (!sessionRef) return;

        const { addDoc, collection } = window.firebaseFirestore;

        try {
            if (!activityRef) {
                activityRef = collection(sessionRef, 'activity');
            }
            await addDoc(activityRef, {
                player: _playerName,
                playerId: _playerId,
                action: action,
                detail: detail,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('[CO-OP] Activity log failed:', error);
        }
    }

    // ────────────────────────────────────────────────
    // PRESENCE / DISCONNECT
    // ────────────────────────────────────────────────

    function startPresence() {
        // Update lastSeen every 15 seconds
        presenceInterval = setInterval(async () => {
            if (!sessionRef) return;
            const { updateDoc } = window.firebaseFirestore;
            try {
                await updateDoc(sessionRef, {
                    [`players.${_playerId}.lastSeen`]: Date.now(),
                    [`players.${_playerId}.online`]: true
                });
            } catch { /* ignore presence errors */ }
        }, 15000);

        // Mark offline on page unload
        window.addEventListener('beforeunload', () => disconnect());
    }

    async function disconnect() {
        if (presenceInterval) {
            clearInterval(presenceInterval);
            presenceInterval = null;
        }

        if (stateUnsubscribe) {
            stateUnsubscribe();
            stateUnsubscribe = null;
        }

        if (activityUnsubscribe) {
            activityUnsubscribe();
            activityUnsubscribe = null;
        }

        if (sessionRef) {
            try {
                const { updateDoc } = window.firebaseFirestore;
                await updateDoc(sessionRef, {
                    [`players.${_playerId}.online`]: false
                });
                await logActivity('player_left', `${_playerName} disconnected`);
            } catch { /* page may be unloading */ }
        }

        sessionRef = null;
        _roomCode = null;
    }

    // ────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────

    function _generateRoomCode() {
        const hex = Array.from({ length: 3 }, () =>
            Math.floor(Math.random() * 16).toString(16).toUpperCase()
        ).join('');
        return 'HEX-' + hex;
    }

    function _getPlayerId() {
        // Use Firebase Auth UID if available, else generate persistent ID
        if (typeof FirebaseAuth !== 'undefined') {
            const user = FirebaseAuth.getUser();
            if (user?.uid) return user.uid;
        }

        let id = localStorage.getItem('hexworth_coop_player_id');
        if (!id) {
            id = 'anon_' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('hexworth_coop_player_id', id);
        }
        return id;
    }

    function _getPlayerName() {
        // Use Firebase Auth display name if available
        if (typeof FirebaseAuth !== 'undefined') {
            const user = FirebaseAuth.getUser();
            if (user?.displayName) return user.displayName.split(' ')[0]; // First name
        }

        // Fallback: generate a hacker handle
        const handles = ['Ghost', 'Cipher', 'Shadow', 'Bit', 'Hex', 'Null', 'Void', 'Root', 'Ping', 'Echo'];
        const num = Math.floor(Math.random() * 99) + 1;
        let name = localStorage.getItem('hexworth_coop_player_name');
        if (!name) {
            name = handles[Math.floor(Math.random() * handles.length)] + '-' + num;
            localStorage.setItem('hexworth_coop_player_name', name);
        }
        return name;
    }

    // ────────────────────────────────────────────────
    // PUBLIC API
    // ────────────────────────────────────────────────

    return {
        init,
        createSession,
        joinSession,
        startGame,
        subscribeToState,
        subscribeToActivity,
        onPlayersChange,
        updateState,
        submitFlagAtomically,
        revealHintAtomically,
        logActivity,
        startPresence,
        disconnect,

        // Getters
        get roomCode() { return _roomCode; },
        get playerId() { return _playerId; },
        get playerName() { return _playerName; },
        get isHost() { return _isHost; },
        get isActive() { return sessionRef !== null; }
    };
})();
