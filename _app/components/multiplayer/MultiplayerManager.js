/**
 * MultiplayerManager.js - Core 2-Player Mode Infrastructure
 *
 * Manages game rooms via Firestore real-time listeners.
 * No WebSocket server needed — Firestore onSnapshot provides live sync.
 *
 * Room lifecycle: create -> join -> play -> leave
 * Room structure: gameRooms/{roomId}
 *
 * Usage:
 *   const room = await MultiplayerManager.createRoom('threatswarm');
 *   // or
 *   await MultiplayerManager.joinRoom('A3X9K2');
 *   MultiplayerManager.sendGameState({ score: 100, lives: 3 });
 *   MultiplayerManager.onGameState(state => { ... });
 *   MultiplayerManager.leaveRoom();
 *
 * Sprint F-25: 2-Player Mode for Arcade Games
 */
const MultiplayerManager = (function () {
    'use strict';

    // ── Constants ──────────────────────────────────────────────────────
    const COLLECTION = 'gameRooms';
    const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 confusion
    const CODE_LENGTH = 6;
    const ROOM_TTL_MS = 60 * 60 * 1000; // 1 hour
    const HEARTBEAT_INTERVAL = 15000;    // 15 seconds
    const CLEANUP_BATCH = 20;

    // Room statuses
    const STATUS = {
        WAITING:  'waiting',
        READY:    'ready',
        PLAYING:  'playing',
        FINISHED: 'finished'
    };

    // ── State ──────────────────────────────────────────────────────────
    let db = null;
    let currentRoom = null;        // { id, code, gameId, playerIndex }
    let stateListener = null;      // onSnapshot unsubscribe
    let roomListener = null;       // onSnapshot unsubscribe for room meta
    let heartbeatTimer = null;
    let gameStateCallbacks = [];
    let roomEventCallbacks = [];   // room status changes
    let initialized = false;

    // ── Firebase helpers ───────────────────────────────────────────────

    function _getDb() {
        if (db) return db;
        const { getFirestore } = window.firebaseFirestore;
        const { getApps } = window.firebaseApp;
        if (getApps().length === 0) throw new Error('[MultiplayerManager] Firebase not initialized');
        db = getFirestore(getApps()[0]);
        return db;
    }

    function _fs() {
        return window.firebaseFirestore;
    }

    // ── Room Code Generation ──────────────────────────────────────────

    function _generateCode() {
        let code = '';
        const arr = new Uint8Array(CODE_LENGTH);
        crypto.getRandomValues(arr);
        for (let i = 0; i < CODE_LENGTH; i++) {
            code += CODE_CHARS[arr[i] % CODE_CHARS.length];
        }
        return code;
    }

    // ── Core API ──────────────────────────────────────────────────────

    /**
     * Create a new game room.
     * @param {string} gameId - Identifier for the game type
     * @param {object} [options] - Optional settings { displayName, mode }
     * @returns {Promise<{roomId: string, code: string}>}
     */
    async function createRoom(gameId, options = {}) {
        if (currentRoom) await leaveRoom();

        const database = _getDb();
        const { collection, addDoc, serverTimestamp } = _fs();
        const user = _getUser();

        const code = _generateCode();
        const roomData = {
            code: code,
            gameId: gameId,
            status: STATUS.WAITING,
            mode: options.mode || 'realtime', // realtime | turnBased | ghost
            players: [{
                uid: user.uid,
                displayName: options.displayName || user.displayName || 'Player 1',
                ready: false,
                lastHeartbeat: Date.now()
            }],
            gameState: {
                player1: null,
                player2: null,
                shared: null
            },
            createdAt: serverTimestamp(),
            createdBy: user.uid,
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(database, COLLECTION), roomData);

        currentRoom = {
            id: docRef.id,
            code: code,
            gameId: gameId,
            playerIndex: 0
        };

        _startRoomListener();
        _startHeartbeat();

        console.log('[MultiplayerManager] Room created:', code);
        return { roomId: docRef.id, code: code };
    }

    /**
     * Join an existing room by code.
     * @param {string} roomCode - 6-character room code
     * @param {object} [options] - Optional { displayName }
     * @returns {Promise<{roomId: string, gameId: string}>}
     */
    async function joinRoom(roomCode, options = {}) {
        if (currentRoom) await leaveRoom();

        const database = _getDb();
        const { collection, query, where, getDocs, doc, updateDoc, arrayUnion } = _fs();
        const user = _getUser();

        const normalizedCode = roomCode.toUpperCase().trim();

        // Find room by code
        const q = query(
            collection(database, COLLECTION),
            where('code', '==', normalizedCode),
            where('status', '==', STATUS.WAITING)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            throw new Error('Room not found or already full. Check the code and try again.');
        }

        const roomDoc = snap.docs[0];
        const roomData = roomDoc.data();

        if (roomData.players.length >= 2) {
            throw new Error('Room is full.');
        }

        // Prevent joining your own room
        if (roomData.players[0].uid === user.uid) {
            throw new Error('Cannot join your own room.');
        }

        // Add player 2
        const player2 = {
            uid: user.uid,
            displayName: options.displayName || user.displayName || 'Player 2',
            ready: false,
            lastHeartbeat: Date.now()
        };

        const roomRef = doc(database, COLLECTION, roomDoc.id);
        await updateDoc(roomRef, {
            players: [...roomData.players, player2],
            status: STATUS.READY,
            updatedAt: Date.now()
        });

        currentRoom = {
            id: roomDoc.id,
            code: normalizedCode,
            gameId: roomData.gameId,
            playerIndex: 1
        };

        _startRoomListener();
        _startHeartbeat();

        console.log('[MultiplayerManager] Joined room:', normalizedCode);
        return { roomId: roomDoc.id, gameId: roomData.gameId };
    }

    /**
     * Send game state update to opponent.
     * @param {object} state - Serializable game state
     */
    async function sendGameState(state) {
        if (!currentRoom) {
            console.warn('[MultiplayerManager] Not in a room');
            return;
        }

        const database = _getDb();
        const { doc, updateDoc } = _fs();

        const playerKey = currentRoom.playerIndex === 0 ? 'player1' : 'player2';
        const roomRef = doc(database, COLLECTION, currentRoom.id);

        await updateDoc(roomRef, {
            [`gameState.${playerKey}`]: {
                ...state,
                timestamp: Date.now()
            },
            updatedAt: Date.now()
        });
    }

    /**
     * Send shared game state (for turn-based or shared data).
     * @param {object} sharedState - Shared state object
     */
    async function sendSharedState(sharedState) {
        if (!currentRoom) return;

        const database = _getDb();
        const { doc, updateDoc } = _fs();
        const roomRef = doc(database, COLLECTION, currentRoom.id);

        await updateDoc(roomRef, {
            'gameState.shared': {
                ...sharedState,
                timestamp: Date.now()
            },
            updatedAt: Date.now()
        });
    }

    /**
     * Listen for opponent game state updates.
     * @param {function} callback - Receives opponent's state object
     * @returns {function} Unsubscribe function
     */
    function onGameState(callback) {
        gameStateCallbacks.push(callback);
        return function () {
            gameStateCallbacks = gameStateCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Listen for room events (player join, ready, game start, etc.).
     * @param {function} callback - Receives { event, data }
     * @returns {function} Unsubscribe function
     */
    function onRoomEvent(callback) {
        roomEventCallbacks.push(callback);
        return function () {
            roomEventCallbacks = roomEventCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Set this player's ready status.
     * @param {boolean} ready
     */
    async function setReady(ready) {
        if (!currentRoom) return;

        const database = _getDb();
        const { doc, getDoc, updateDoc } = _fs();
        const roomRef = doc(database, COLLECTION, currentRoom.id);

        const snap = await getDoc(roomRef);
        if (!snap.exists()) return;

        const players = snap.data().players;
        players[currentRoom.playerIndex].ready = ready;

        const updates = { players: players, updatedAt: Date.now() };

        // If both ready, start the game
        if (players.length === 2 && players[0].ready && players[1].ready) {
            updates.status = STATUS.PLAYING;
        }

        await updateDoc(roomRef, updates);
    }

    /**
     * Update room status.
     * @param {string} status - One of STATUS values
     */
    async function setStatus(status) {
        if (!currentRoom) return;

        const database = _getDb();
        const { doc, updateDoc } = _fs();
        const roomRef = doc(database, COLLECTION, currentRoom.id);

        await updateDoc(roomRef, {
            status: status,
            updatedAt: Date.now()
        });
    }

    /**
     * Leave the current room. Cleans up listeners and heartbeat.
     */
    async function leaveRoom() {
        if (stateListener) { stateListener(); stateListener = null; }
        if (roomListener) { roomListener(); roomListener = null; }
        if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }

        if (currentRoom) {
            try {
                const database = _getDb();
                const { doc, getDoc, updateDoc, deleteDoc } = _fs();
                const roomRef = doc(database, COLLECTION, currentRoom.id);
                const snap = await getDoc(roomRef);

                if (snap.exists()) {
                    const data = snap.data();
                    const remainingPlayers = data.players.filter(
                        p => p.uid !== _getUser().uid
                    );

                    if (remainingPlayers.length === 0) {
                        // Last player left — delete room
                        await deleteDoc(roomRef);
                    } else {
                        // Remove this player, revert to waiting
                        await updateDoc(roomRef, {
                            players: remainingPlayers,
                            status: STATUS.WAITING,
                            updatedAt: Date.now()
                        });
                    }
                }
            } catch (e) {
                console.warn('[MultiplayerManager] Cleanup error:', e.message);
            }
        }

        currentRoom = null;
        gameStateCallbacks = [];
        roomEventCallbacks = [];
        console.log('[MultiplayerManager] Left room');
    }

    /**
     * Cleanup stale rooms older than TTL.
     * Called automatically when creating a room.
     */
    async function cleanupStaleRooms() {
        try {
            const database = _getDb();
            const { collection, query, where, getDocs, deleteDoc, doc } = _fs();

            const cutoff = new Date(Date.now() - ROOM_TTL_MS);
            const q = query(
                collection(database, COLLECTION),
                where('createdAt', '<', cutoff)
            );
            const snap = await getDocs(q);

            let count = 0;
            for (const roomDoc of snap.docs) {
                if (count >= CLEANUP_BATCH) break;
                await deleteDoc(doc(database, COLLECTION, roomDoc.id));
                count++;
            }

            if (count > 0) {
                console.log(`[MultiplayerManager] Cleaned up ${count} stale rooms`);
            }
        } catch (e) {
            // Non-critical — log and move on
            console.warn('[MultiplayerManager] Cleanup failed:', e.message);
        }
    }

    // ── Internal Listeners ────────────────────────────────────────────

    function _startRoomListener() {
        if (!currentRoom) return;

        const database = _getDb();
        const { doc, onSnapshot } = _fs();
        const roomRef = doc(database, COLLECTION, currentRoom.id);

        let previousStatus = null;
        let previousPlayerCount = 0;

        roomListener = onSnapshot(roomRef, (snap) => {
            if (!snap.exists()) {
                // Room was deleted
                _emitRoomEvent('roomClosed', {});
                leaveRoom();
                return;
            }

            const data = snap.data();
            const opponentKey = currentRoom.playerIndex === 0 ? 'player2' : 'player1';

            // Emit game state to callbacks
            if (data.gameState && data.gameState[opponentKey]) {
                for (const cb of gameStateCallbacks) {
                    try { cb(data.gameState[opponentKey]); } catch (e) {
                        console.error('[MultiplayerManager] Callback error:', e);
                    }
                }
            }

            // Emit shared state
            if (data.gameState && data.gameState.shared) {
                _emitRoomEvent('sharedState', data.gameState.shared);
            }

            // Room status changes
            if (data.status !== previousStatus) {
                previousStatus = data.status;
                _emitRoomEvent('statusChange', { status: data.status });

                if (data.status === STATUS.PLAYING) {
                    _emitRoomEvent('gameStart', { players: data.players });
                }
                if (data.status === STATUS.FINISHED) {
                    _emitRoomEvent('gameEnd', { gameState: data.gameState });
                }
            }

            // Player join/leave
            if (data.players.length !== previousPlayerCount) {
                if (data.players.length > previousPlayerCount) {
                    _emitRoomEvent('playerJoined', {
                        player: data.players[data.players.length - 1],
                        players: data.players
                    });
                } else {
                    _emitRoomEvent('playerLeft', { players: data.players });
                }
                previousPlayerCount = data.players.length;
            }

            // Ready state changes
            _emitRoomEvent('readyUpdate', {
                players: data.players.map(p => ({ displayName: p.displayName, ready: p.ready }))
            });

        }, (error) => {
            console.error('[MultiplayerManager] Room listener error:', error);
            _emitRoomEvent('error', { message: error.message });
        });
    }

    function _startHeartbeat() {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(async () => {
            if (!currentRoom) return;
            try {
                const database = _getDb();
                const { doc, getDoc, updateDoc } = _fs();
                const roomRef = doc(database, COLLECTION, currentRoom.id);
                const snap = await getDoc(roomRef);
                if (!snap.exists()) return;

                const players = snap.data().players;
                if (players[currentRoom.playerIndex]) {
                    players[currentRoom.playerIndex].lastHeartbeat = Date.now();
                    await updateDoc(roomRef, { players: players });
                }
            } catch (e) {
                // Heartbeat failure is non-critical
            }
        }, HEARTBEAT_INTERVAL);
    }

    function _emitRoomEvent(event, data) {
        for (const cb of roomEventCallbacks) {
            try { cb({ event, data }); } catch (e) {
                console.error('[MultiplayerManager] Event callback error:', e);
            }
        }
    }

    function _getUser() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
            const user = FirebaseAuth.getUser();
            if (user) return user;
        }
        // Fallback for unauthenticated or test contexts
        return {
            uid: 'anon_' + Math.random().toString(36).substring(2, 10),
            displayName: 'Anonymous'
        };
    }

    // ── Public API ────────────────────────────────────────────────────

    return {
        // Room lifecycle
        createRoom,
        joinRoom,
        leaveRoom,
        setReady,
        setStatus,

        // Game state
        sendGameState,
        sendSharedState,
        onGameState,
        onRoomEvent,

        // Maintenance
        cleanupStaleRooms,

        // Accessors
        getRoom:     function () { return currentRoom ? { ...currentRoom } : null; },
        isConnected: function () { return currentRoom !== null; },
        getPlayerIndex: function () { return currentRoom ? currentRoom.playerIndex : -1; },

        // Constants
        STATUS
    };

})();
