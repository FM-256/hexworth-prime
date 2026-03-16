/**
 * TurnBasedManager.js - Turn-Based Multiplayer Framework
 *
 * Layered on top of MultiplayerManager for games that alternate turns
 * rather than running in real-time. Handles turn tracking, timers,
 * move validation, state serialization, and win conditions.
 *
 * Usage:
 *   // After MultiplayerManager.createRoom() or joinRoom():
 *   TurnBasedManager.init({
 *       turnDuration: 30,
 *       validateMove: (move, state) => move.value > 0,
 *       checkWin: (state) => state.score >= 100 ? 0 : -1,
 *       onTurnStart: (playerIndex, state) => { updateUI(); },
 *       onMoveReceived: (move, playerIndex) => { animateMove(); },
 *       onGameOver: (winnerIndex, state) => { showResults(); }
 *   });
 *
 *   TurnBasedManager.submitMove({ action: 'place', x: 3, y: 4 });
 *   TurnBasedManager.forfeit();
 *
 * Sprint F-25: 2-Player Mode for Arcade Games
 */
const TurnBasedManager = (function () {
    'use strict';

    // ── State ──────────────────────────────────────────────────────────
    let config = null;
    let turnTimer = null;
    let timeRemaining = 0;
    let tickInterval = null;
    let gameActive = false;
    let moveHistory = [];
    let unsubRoom = null;
    let unsubState = null;

    // Defaults
    const DEFAULTS = {
        turnDuration: 30,           // seconds per turn
        firstTurn: 0,               // player 0 goes first
        maxTurns: Infinity,         // unlimited turns
        turnTimeoutAction: 'skip',  // 'skip' | 'forfeit' | 'random'
        validateMove: null,         // fn(move, sharedState) => bool
        checkWin: null,             // fn(sharedState) => winnerIndex or -1
        onTurnStart: null,          // fn(playerIndex, sharedState, timeRemaining)
        onTurnTick: null,           // fn(secondsRemaining)
        onMoveReceived: null,       // fn(move, playerIndex)
        onGameOver: null,           // fn(winnerIndex, sharedState, reason)
        onTimeout: null,            // fn(playerIndex)
        serializeState: null,       // fn(localState) => serializable
        deserializeState: null      // fn(serialized) => localState
    };

    // ── Init ──────────────────────────────────────────────────────────

    /**
     * Initialize turn-based mode for the current room.
     * Must be called after MultiplayerManager has joined/created a room.
     *
     * @param {object} options - Configuration (see DEFAULTS)
     */
    function init(options = {}) {
        if (!MultiplayerManager.isConnected()) {
            console.error('[TurnBased] Not connected to a room');
            return;
        }

        config = { ...DEFAULTS, ...options };
        moveHistory = [];
        gameActive = false;

        // Listen for room events to detect game start and moves
        unsubRoom = MultiplayerManager.onRoomEvent(_handleRoomEvent);
        unsubState = MultiplayerManager.onGameState(_handleOpponentState);

        console.log('[TurnBased] Initialized with', config.turnDuration, 's turns');
    }

    /**
     * Start the game (called automatically when both players ready,
     * or manually by the host).
     */
    async function startGame(initialState = {}) {
        gameActive = true;

        const sharedState = {
            currentTurn: config.firstTurn,
            turnNumber: 0,
            moves: [],
            gameData: initialState,
            startedAt: Date.now(),
            status: 'active'
        };

        await MultiplayerManager.sendSharedState(sharedState);
        _startTurnTimer(config.firstTurn, sharedState);
    }

    // ── Move Submission ───────────────────────────────────────────────

    /**
     * Submit a move. Validates, records, checks win, and advances turn.
     *
     * @param {object} move - Game-specific move data
     * @returns {Promise<boolean>} True if move was accepted
     */
    async function submitMove(move) {
        if (!gameActive || !config) {
            console.warn('[TurnBased] Game not active');
            return false;
        }

        const room = MultiplayerManager.getRoom();
        if (!room) return false;

        // Fetch current shared state
        const sharedState = await _getSharedState();
        if (!sharedState || sharedState.status !== 'active') return false;

        // Verify it is this player's turn
        if (sharedState.currentTurn !== room.playerIndex) {
            console.warn('[TurnBased] Not your turn');
            return false;
        }

        // Validate move
        if (config.validateMove) {
            const valid = config.validateMove(move, sharedState.gameData);
            if (!valid) {
                console.warn('[TurnBased] Move rejected by validator');
                return false;
            }
        }

        // Build move record
        const moveRecord = {
            playerIndex: room.playerIndex,
            move: move,
            turnNumber: sharedState.turnNumber,
            timestamp: Date.now()
        };

        // Apply move to history
        const updatedMoves = [...sharedState.moves, moveRecord];
        moveHistory.push(moveRecord);

        // Advance turn
        const nextTurn = sharedState.currentTurn === 0 ? 1 : 0;
        const nextTurnNumber = sharedState.turnNumber + 1;

        const updatedState = {
            ...sharedState,
            currentTurn: nextTurn,
            turnNumber: nextTurnNumber,
            moves: updatedMoves,
            lastMove: moveRecord
        };

        // Check win condition
        if (config.checkWin) {
            const winner = config.checkWin(updatedState.gameData, updatedMoves);
            if (winner >= 0) {
                updatedState.status = 'finished';
                updatedState.winner = winner;
                updatedState.endedAt = Date.now();
            }
        }

        // Check max turns
        if (nextTurnNumber >= config.maxTurns) {
            updatedState.status = 'finished';
            updatedState.endedAt = Date.now();
        }

        // Send updated state
        await MultiplayerManager.sendSharedState(updatedState);

        // Also send as player-specific state so opponent gets it via onGameState
        await MultiplayerManager.sendGameState({
            type: 'move',
            move: moveRecord,
            sharedState: updatedState
        });

        // Stop current timer
        _stopTurnTimer();

        // Handle game end or next turn
        if (updatedState.status === 'finished') {
            _endGame(updatedState.winner, updatedState, 'win');
        } else {
            // Next turn timer will be started by the state listener
            // for the player whose turn it now is
            if (nextTurn === room.playerIndex) {
                _startTurnTimer(nextTurn, updatedState);
            }
        }

        return true;
    }

    /**
     * Forfeit the game.
     */
    async function forfeit() {
        if (!gameActive) return;

        const room = MultiplayerManager.getRoom();
        if (!room) return;

        const winnerIndex = room.playerIndex === 0 ? 1 : 0;

        const sharedState = await _getSharedState();
        if (sharedState) {
            sharedState.status = 'finished';
            sharedState.winner = winnerIndex;
            sharedState.endedAt = Date.now();
            await MultiplayerManager.sendSharedState(sharedState);
        }

        await MultiplayerManager.sendGameState({
            type: 'forfeit',
            playerIndex: room.playerIndex
        });

        _endGame(winnerIndex, sharedState, 'forfeit');
    }

    // ── Turn Timer ────────────────────────────────────────────────────

    function _startTurnTimer(playerIndex, sharedState) {
        _stopTurnTimer();
        timeRemaining = config.turnDuration;

        if (config.onTurnStart) {
            config.onTurnStart(playerIndex, sharedState, timeRemaining);
        }

        tickInterval = setInterval(() => {
            timeRemaining--;

            if (config.onTurnTick) {
                config.onTurnTick(timeRemaining);
            }

            if (timeRemaining <= 0) {
                _handleTimeout(playerIndex, sharedState);
            }
        }, 1000);
    }

    function _stopTurnTimer() {
        if (tickInterval) {
            clearInterval(tickInterval);
            tickInterval = null;
        }
        timeRemaining = 0;
    }

    async function _handleTimeout(playerIndex, sharedState) {
        _stopTurnTimer();

        if (config.onTimeout) {
            config.onTimeout(playerIndex);
        }

        const room = MultiplayerManager.getRoom();
        if (!room || playerIndex !== room.playerIndex) return;

        switch (config.turnTimeoutAction) {
            case 'forfeit':
                await forfeit();
                break;

            case 'skip': {
                // Skip turn, advance to other player
                const nextTurn = playerIndex === 0 ? 1 : 0;
                const updated = {
                    ...sharedState,
                    currentTurn: nextTurn,
                    turnNumber: sharedState.turnNumber + 1,
                    lastMove: { type: 'timeout', playerIndex, timestamp: Date.now() }
                };
                await MultiplayerManager.sendSharedState(updated);
                await MultiplayerManager.sendGameState({ type: 'timeout', playerIndex });
                break;
            }

            case 'random':
                // Game-specific: would need a move generator
                console.warn('[TurnBased] Random timeout action not implemented — skipping');
                break;
        }
    }

    // ── Event Handlers ────────────────────────────────────────────────

    function _handleRoomEvent(event) {
        switch (event.event) {
            case 'gameStart':
                if (!gameActive) {
                    // Player 1 should start the game
                    const room = MultiplayerManager.getRoom();
                    if (room && room.playerIndex === 0) {
                        startGame();
                    }
                }
                break;

            case 'sharedState':
                if (event.data && event.data.status === 'active') {
                    const room = MultiplayerManager.getRoom();
                    if (room && event.data.currentTurn === room.playerIndex) {
                        gameActive = true;
                        _startTurnTimer(room.playerIndex, event.data);
                    }
                }
                if (event.data && event.data.status === 'finished') {
                    _endGame(event.data.winner, event.data, 'win');
                }
                break;

            case 'roomClosed':
                _endGame(-1, null, 'disconnect');
                break;
        }
    }

    function _handleOpponentState(state) {
        if (!state || !config) return;

        if (state.type === 'move' && config.onMoveReceived) {
            config.onMoveReceived(state.move, state.move.playerIndex);
        }

        if (state.type === 'forfeit') {
            const room = MultiplayerManager.getRoom();
            _endGame(room ? room.playerIndex : -1, state.sharedState, 'forfeit');
        }

        if (state.type === 'timeout') {
            // Opponent timed out — start our turn
            const room = MultiplayerManager.getRoom();
            if (room && state.sharedState) {
                _startTurnTimer(room.playerIndex, state.sharedState);
            }
        }
    }

    // ── Game End ──────────────────────────────────────────────────────

    function _endGame(winnerIndex, sharedState, reason) {
        gameActive = false;
        _stopTurnTimer();

        if (unsubRoom) { unsubRoom(); unsubRoom = null; }
        if (unsubState) { unsubState(); unsubState = null; }

        if (config && config.onGameOver) {
            config.onGameOver(winnerIndex, sharedState, reason);
        }

        MultiplayerManager.setStatus(MultiplayerManager.STATUS.FINISHED);
        console.log('[TurnBased] Game over. Winner:', winnerIndex, 'Reason:', reason);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    async function _getSharedState() {
        // The shared state is maintained through the Firestore room document.
        // We rely on the latest snapshot from MultiplayerManager.
        // For direct reads, we fetch from Firestore.
        try {
            const room = MultiplayerManager.getRoom();
            if (!room) return null;

            const db = (function () {
                const { getFirestore } = window.firebaseFirestore;
                const { getApps } = window.firebaseApp;
                return getFirestore(getApps()[0]);
            })();

            const { doc, getDoc } = window.firebaseFirestore;
            const snap = await getDoc(doc(db, 'gameRooms', room.id));
            if (!snap.exists()) return null;

            return snap.data().gameState?.shared || null;
        } catch (e) {
            console.error('[TurnBased] Failed to get shared state:', e);
            return null;
        }
    }

    // ── Cleanup ───────────────────────────────────────────────────────

    function destroy() {
        _stopTurnTimer();
        if (unsubRoom) { unsubRoom(); unsubRoom = null; }
        if (unsubState) { unsubState(); unsubState = null; }
        gameActive = false;
        config = null;
        moveHistory = [];
    }

    // ── Public API ────────────────────────────────────────────────────

    return {
        init,
        startGame,
        submitMove,
        forfeit,
        destroy,

        // Accessors
        isActive:       function () { return gameActive; },
        getTimeRemaining: function () { return timeRemaining; },
        getMoveHistory: function () { return [...moveHistory]; },
        getTurnNumber:  function () {
            return moveHistory.length;
        }
    };

})();
