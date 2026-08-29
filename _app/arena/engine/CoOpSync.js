/* ============================================================
   CTF ARENA — CoOpSync.js
   Firestore sync layer for cooperative and VS modes.
   Handles room creation, joining, real-time state sync,
   atomic flag submissions, hint reveals, activity log,
   session persistence, auto-rejoin, host migration,
   and VS team-based competitive state management.
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
    let _mode = 'coop';       // 'coop' | 'vs'
    let _teamId = null;        // 'alpha' | 'bravo' (VS only)
    let _onStateChange = null;
    let _onActivityChange = null;
    let _onPlayersChange = null;
    let _onTeamsChange = null;
    let _onDisband = null;
    let _onVsWinner = null;
    let _beforeUnloadHandler = null;
    let _teamsUnsubscribe = null;
    let _timerInterval = null;

    const SESSION_KEY = 'hexworth_coop_active_session';

    // ────────────────────────────────────────────────
    // INITIALIZATION
    // ────────────────────────────────────────────────

    async function init() {
        if (initialized) return true;

        try {
            // Load Firebase SDK if not already loaded (FirebaseAuth may have done this)
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

            // Get player identity (may update after auth resolves)
            _playerId = _getPlayerId();
            _playerName = _getPlayerName();

            console.log('%c[CO-OP] Sync layer initialized', 'color: #9b59b6');
        } catch (error) {
            console.error('[CO-OP] Initialization failed:', error);
            return false;
        }

        // Auth setup — separate from Firestore init so auth errors don't kill db
        // Use a timeout to prevent hanging if auth never resolves
        try {
            if (typeof FirebaseAuth !== 'undefined') {
                var authTimeout = new Promise(function(_, reject) {
                    setTimeout(function() { reject(new Error('Auth timed out')); }, 5000);
                });
                try {
                    await Promise.race([FirebaseAuth.waitForAuth(), authTimeout]);
                } catch (timeoutErr) {
                    console.warn('[CO-OP] Auth wait timed out — proceeding without auth state');
                }

                if (typeof FirebaseAuth.isSignedIn === 'function' && !FirebaseAuth.isSignedIn()) {
                    console.log('%c[CO-OP] No auth session — signing in anonymously', 'color: #e67e22');
                    try {
                        await FirebaseAuth.signInAnonymously();
                        await new Promise(resolve => setTimeout(resolve, 800));
                    } catch (anonErr) {
                        console.warn('[CO-OP] Anonymous sign-in failed:', anonErr.message);
                    }
                }

                // Re-derive identity on EVERY path, not just the anonymous one.
                //
                // FIXED 2026-08-29. This pair used to live INSIDE the `!isSignedIn()` branch
                // above, so it ran only for users who had to be signed in anonymously. The
                // first call at line ~78 happens BEFORE `waitForAuth()` resolves, and
                // `_getPlayerId()` falls back to a localStorage `anon_*` id when
                // `FirebaseAuth.getUser()` has not populated `currentUser` yet -- an ordinary
                // Firebase timing gap. So an ALREADY-SIGNED-IN student who lost that race kept
                // the `anon_*` id for the whole session, because `isSignedIn()` was true and
                // the correction never ran. The comment at line ~77 already promised identity
                // "may update after auth resolves"; it only did on one branch.
                //
                // Harmless while the rules ignored identity. NOT harmless now: arena_sessions
                // keys players by this id and the update rule requires
                // `request.auth.uid in players`, so a mis-keyed player would have every
                // heartbeat and state sync denied mid-game. Predicted in 9ec369431 (2026-08-04)
                // before either half was written: "a uid-membership rule would lock out a
                // legitimately racing player."
                _playerId = _getPlayerId();
                _playerName = _getPlayerName();
                console.log('%c[CO-OP] Auth ready: ' + _playerId, 'color: #2ecc71');
            }
        } catch (authError) {
            console.error('[CO-OP] Auth setup failed:', authError.message);
        }

        return true;
    }

    // ────────────────────────────────────────────────
    // SESSION MANAGEMENT
    // ────────────────────────────────────────────────

    /**
     * Create a new session. Returns room code.
     * @param {string} boxId
     * @param {object} config - Box config
     * @param {number} maxPlayers - Max players (co-op) or max per team (vs)
     * @param {object} opts - { mode: 'coop'|'vs', timeLimit: number|null }
     */
    async function createSession(boxId, config, maxPlayers, opts) {
        if (!initialized) await init();
        if (!db) throw new Error('Firestore not available');

        const { doc, setDoc } = window.firebaseFirestore;

        _roomCode = _generateRoomCode();
        _isHost = true;
        _mode = opts?.mode || 'coop';

        const baseState = {
            score: config.scoring?.base || 1000,
            flagsFound: [],
            hintsUsed: [],
            wrongFlags: 0,
            startTime: Date.now(),
            elapsed: 0,
            completed: false,
            godMode: false,
            booted: false
        };

        const sessionData = {
            boxId: boxId,
            mode: _mode,
            config: {
                maxPlayers: maxPlayers || 2,
                boxTitle: config.title || 'CTF Arena',
                boxAccent: config.accent || '#3498db',
                timeLimit: opts?.timeLimit || null
            },
            status: 'waiting',
            createdAt: Date.now()
        };

        if (_mode === 'vs') {
            // VS: per-team state, player assigned to alpha as host
            _teamId = 'alpha';
            sessionData.teams = {
                alpha: {
                    name: 'Team Alpha',
                    players: {
                        [_playerId]: {
                            name: _playerName,
                            joinedAt: Date.now(),
                            online: true,
                            isHost: true,
                            lastSeen: Date.now()
                        }
                    },
                    state: { ...baseState }
                },
                bravo: {
                    name: 'Team Bravo',
                    players: {},
                    state: { ...baseState }
                }
            };
            sessionData.winner = null;
        } else {
            // Co-op: shared state
            sessionData.state = baseState;
            sessionData.players = {
                [_playerId]: {
                    name: _playerName,
                    joinedAt: Date.now(),
                    online: true,
                    isHost: true,
                    lastSeen: Date.now()
                }
            };
        }

        sessionRef = doc(db, 'arena_sessions', _roomCode);
        await setDoc(sessionRef, sessionData);

        _persistSession();
        _installRefreshGuard();

        const label = _mode === 'vs' ? 'VS' : 'CO-OP';
        console.log(`%c[${label}] Session created: ${_roomCode}`, 'color: #2ecc71');
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
        _mode = data.mode || 'coop';

        // Check room status
        if (data.status === 'completed') {
            throw new Error('This session has already ended');
        }

        if (_mode === 'vs') {
            // VS: assign to team with fewer players (auto-balance)
            const alphaPlayers = Object.keys(data.teams?.alpha?.players || {});
            const bravoPlayers = Object.keys(data.teams?.bravo?.players || {});
            const maxPerTeam = data.config?.maxPlayers || 1;

            // Check if reconnecting as existing player
            const inAlpha = alphaPlayers.includes(_playerId);
            const inBravo = bravoPlayers.includes(_playerId);

            if (inAlpha) {
                _teamId = 'alpha';
                const existing = data.teams.alpha.players[_playerId];
                if (existing?.isHost) _isHost = true;
            } else if (inBravo) {
                _teamId = 'bravo';
                const existing = data.teams.bravo.players[_playerId];
                if (existing?.isHost) _isHost = true;
            } else {
                // New player — auto-balance
                if (bravoPlayers.length < alphaPlayers.length && bravoPlayers.length < maxPerTeam) {
                    _teamId = 'bravo';
                } else if (alphaPlayers.length < maxPerTeam) {
                    _teamId = 'alpha';
                } else if (bravoPlayers.length < maxPerTeam) {
                    _teamId = 'bravo';
                } else {
                    throw new Error('Both teams are full');
                }
            }

            await updateDoc(sessionRef, {
                [`teams.${_teamId}.players.${_playerId}`]: {
                    name: _playerName,
                    joinedAt: (inAlpha || inBravo) ?
                        (data.teams[_teamId]?.players[_playerId]?.joinedAt || Date.now()) :
                        Date.now(),
                    online: true,
                    isHost: _isHost,
                    lastSeen: Date.now()
                }
            });
        } else {
            // Co-op: original logic
            const playerCount = Object.keys(data.players || {}).length;
            if (playerCount >= (data.config?.maxPlayers || 2)) {
                if (!data.players[_playerId]) {
                    throw new Error('Room is full');
                }
            }

            const existingPlayer = data.players[_playerId];
            if (existingPlayer?.isHost) {
                _isHost = true;
            }

            await updateDoc(sessionRef, {
                [`players.${_playerId}`]: {
                    name: _playerName,
                    joinedAt: existingPlayer?.joinedAt || Date.now(),
                    online: true,
                    isHost: _isHost,
                    lastSeen: Date.now()
                }
            });
        }

        _persistSession();
        _installRefreshGuard();

        const label = _mode === 'vs' ? 'VS' : 'CO-OP';
        console.log(`%c[${label}] Joined session: ${_roomCode}${_teamId ? ' (team ' + _teamId + ')' : ''}${_isHost ? ' (host)' : ''}`, 'color: #2ecc71');
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
     * In VS mode, receives the local team's state.
     */
    function subscribeToState(callback) {
        if (!sessionRef) return;
        _onStateChange = callback;

        const { onSnapshot } = window.firebaseFirestore;

        stateUnsubscribe = onSnapshot(sessionRef, (snap) => {
            if (!snap.exists()) return;
            const data = snap.data();

            // Session disbanded — notify and clean up
            if (data.status === 'disbanded') {
                if (_onDisband) _onDisband(data);
                _clearPersistedSession();
                return;
            }

            if (_mode === 'vs' && _teamId) {
                // VS: dispatch local team's state
                const teamState = data.teams?.[_teamId]?.state;
                if (_onStateChange && teamState) {
                    _onStateChange(teamState);
                }
                // Dispatch team changes
                if (_onTeamsChange) {
                    _onTeamsChange(data.teams, data.status);
                }
                // Dispatch player changes (flatten for compatibility)
                if (_onPlayersChange) {
                    const allPlayers = {};
                    for (const tid of ['alpha', 'bravo']) {
                        const team = data.teams?.[tid];
                        if (team?.players) {
                            Object.entries(team.players).forEach(([pid, p]) => {
                                allPlayers[pid] = { ...p, teamId: tid };
                            });
                        }
                    }
                    _onPlayersChange(allPlayers, data.status);
                }
                // Check for winner
                if (data.winner && _onVsWinner) {
                    _onVsWinner(data.winner, data.teams);
                }
            } else {
                // Co-op: original dispatch
                if (_onStateChange) {
                    _onStateChange(data.state);
                }
                if (_onPlayersChange) {
                    _onPlayersChange(data.players, data.status);
                }
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
     * In VS mode, writes to the local team's state path.
     */
    async function updateState(state) {
        if (!sessionRef) return;
        const { updateDoc } = window.firebaseFirestore;

        const stateObj = {
            score: state.score,
            flagsFound: state.flagsFound || [],
            hintsUsed: state.hintsUsed || [],
            wrongFlags: state.wrongFlags || 0,
            startTime: state.startTime,
            elapsed: state.elapsed || 0,
            completed: state.completed || false,
            godMode: state.godMode || false,
            booted: state.booted || false
        };

        try {
            if (_mode === 'vs' && _teamId) {
                await updateDoc(sessionRef, {
                    [`teams.${_teamId}.state`]: stateObj
                });
            } else {
                await updateDoc(sessionRef, { 'state': stateObj });
            }
        } catch (error) {
            console.error(`[${_mode === 'vs' ? 'VS' : 'CO-OP'}] State update failed:`, error);
        }
    }

    // ────────────────────────────────────────────────
    // ATOMIC OPERATIONS (Race-Condition Safe)
    // ────────────────────────────────────────────────

    /**
     * Atomically submit a flag. Uses Firestore transaction.
     * In VS mode, operates on the team's state.
     * Returns { success, newState, message }
     */
    async function submitFlagAtomically(flagId, flagValue, flags, scoring) {
        if (!sessionRef || !db) return { success: false, message: 'Not connected' };

        const { runTransaction } = window.firebaseFirestore;
        const isVs = _mode === 'vs' && _teamId;

        try {
            const result = await runTransaction(db, async (transaction) => {
                const snap = await transaction.get(sessionRef);
                if (!snap.exists()) throw new Error('Session lost');

                const data = snap.data();
                const state = isVs ? data.teams[_teamId].state : data.state;

                // Already found?
                if (state.flagsFound.includes(flagId)) {
                    return { success: false, message: 'Flag already submitted', newState: state };
                }

                // Verify flag value
                // Flags may have a .value property (legacy) or the value comes from
                // the deliverFlag system (server-delivered). Check both paths.
                let flag = flags.find(f => f.id === flagId && f.value && f.value.toLowerCase() === flagValue.toLowerCase());
                if (!flag) {
                    // Fallback: check against BoxEngine's delivered flags cache
                    // This handles boxes where flags[] has { id, points } but no value
                    if (typeof BoxEngine !== 'undefined' && BoxEngine.getDeliveredFlag) {
                        const delivered = BoxEngine.getDeliveredFlag(flagId);
                        if (delivered && delivered.toLowerCase() === flagValue.toLowerCase()) {
                            flag = flags.find(f => f.id === flagId);
                        }
                    }
                }
                if (!flag) {
                    state.wrongFlags = (state.wrongFlags || 0) + 1;
                    state.score = Math.max(0, state.score + (scoring?.wrongFlagPenalty || -25));
                    if (isVs) {
                        transaction.update(sessionRef, { [`teams.${_teamId}.state`]: state });
                    } else {
                        transaction.update(sessionRef, { state });
                    }
                    return { success: false, message: 'Incorrect flag', newState: state, penalty: scoring?.wrongFlagPenalty || -25 };
                }

                // Capture the flag
                state.flagsFound.push(flagId);
                state.score += flag.points;

                // Check completion
                const allFound = flags.every(f => state.flagsFound.includes(f.id));
                if (allFound && !state.completed) {
                    state.completed = true;
                    const elapsed = Date.now() - state.startTime;
                    if (scoring?.speedBonus && elapsed < scoring.speedBonus.threshold) {
                        state.score += scoring.speedBonus.points;
                    }
                }

                state.elapsed = Date.now() - state.startTime;

                if (isVs) {
                    const updates = { [`teams.${_teamId}.state`]: state };
                    // VS: set winner if this team completed
                    if (state.completed && !data.winner) {
                        updates.winner = _teamId;
                        updates.status = 'completed';
                    }
                    transaction.update(sessionRef, updates);
                } else {
                    transaction.update(sessionRef, { state, status: state.completed ? 'completed' : 'active' });
                }

                return { success: true, message: `${flagId}.txt captured! +${flag.points}`, newState: state, points: flag.points, completed: state.completed };
            });

            if (result.success) {
                await logActivity('flag_captured', `${flagId}.txt captured (+${result.points})`);
            } else if (result.penalty) {
                await logActivity('wrong_flag', 'Incorrect flag attempt');
            }

            return result;
        } catch (error) {
            console.error(`[${isVs ? 'VS' : 'CO-OP'}] Flag submission failed:`, error);
            return { success: false, message: 'Transaction failed' };
        }
    }

    /**
     * Atomically reveal a hint. Prevents double-penalty.
     * In VS mode, operates on the team's state.
     * Returns { success, newState }
     */
    async function revealHintAtomically(hintId, hintPenalty, isGodMode) {
        if (!sessionRef || !db) return { success: false };

        const { runTransaction } = window.firebaseFirestore;
        const isVs = _mode === 'vs' && _teamId;

        try {
            const result = await runTransaction(db, async (transaction) => {
                const snap = await transaction.get(sessionRef);
                if (!snap.exists()) throw new Error('Session lost');

                const data = snap.data();
                const state = isVs ? data.teams[_teamId].state : data.state;

                if (state.hintsUsed.includes(hintId)) {
                    return { success: false, alreadyUsed: true, newState: state };
                }

                state.hintsUsed.push(hintId);
                if (!isGodMode) {
                    state.score = Math.max(0, state.score + hintPenalty);
                }

                if (isVs) {
                    transaction.update(sessionRef, { [`teams.${_teamId}.state`]: state });
                } else {
                    transaction.update(sessionRef, { state });
                }
                return { success: true, newState: state };
            });

            if (result.success) {
                await logActivity('hint_revealed', `Hint revealed${isGodMode ? ' (no penalty)' : ` (${hintPenalty})`}`);
            }

            return result;
        } catch (error) {
            console.error(`[${isVs ? 'VS' : 'CO-OP'}] Hint reveal failed:`, error);
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
            const entry = {
                player: _playerName,
                playerId: _playerId,
                action: action,
                detail: detail,
                timestamp: Date.now()
            };
            // VS: tag activity with team for cross-team display
            if (_mode === 'vs' && _teamId) {
                entry.teamId = _teamId;
            }
            await addDoc(activityRef, entry);
        } catch (error) {
            console.error(`[${_mode === 'vs' ? 'VS' : 'CO-OP'}] Activity log failed:`, error);
        }
    }

    // ────────────────────────────────────────────────
    // DISBAND (Host Only)
    // ────────────────────────────────────────────────

    /**
     * Disband the session. Sets status to 'disbanded'.
     * All connected players will be notified via snapshot.
     */
    async function disbandSession() {
        if (!sessionRef || !_isHost) return;
        const { updateDoc } = window.firebaseFirestore;

        try {
            await logActivity('session_disbanded', `${_playerName} disbanded the squad`);
            await updateDoc(sessionRef, { status: 'disbanded' });
            _clearPersistedSession();
            await disconnect();
            console.log('%c[CO-OP] Session disbanded', 'color: #e74c3c');
        } catch (error) {
            console.error('[CO-OP] Disband failed:', error);
        }
    }

    /**
     * Set callback for when session is disbanded.
     */
    function onDisband(callback) {
        _onDisband = callback;
    }

    // ────────────────────────────────────────────────
    // SESSION PERSISTENCE & AUTO-REJOIN
    // ────────────────────────────────────────────────

    function _persistSession() {
        try {
            const data = {
                roomCode: _roomCode,
                playerId: _playerId,
                isHost: _isHost,
                mode: _mode,
                url: window.location.pathname,
                timestamp: Date.now()
            };
            if (_mode === 'vs' && _teamId) {
                data.teamId = _teamId;
            }
            localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        } catch { /* localStorage may be full */ }
    }

    function _clearPersistedSession() {
        try { localStorage.removeItem(SESSION_KEY); } catch {}
    }

    /**
     * Check for an active session that can be rejoined.
     * Returns { roomCode, playerId, isHost, url } or null.
     */
    function getPersistedSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            // Expire after 2 hours
            if (Date.now() - data.timestamp > 2 * 60 * 60 * 1000) {
                _clearPersistedSession();
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    /**
     * Validate that a persisted session still exists and is joinable.
     * Returns session data or null.
     */
    async function validatePersistedSession(roomCode) {
        if (!initialized) await init();
        if (!db) return null;

        const { doc, getDoc } = window.firebaseFirestore;
        try {
            const ref = doc(db, 'arena_sessions', roomCode);
            const snap = await getDoc(ref);
            if (!snap.exists()) return null;

            const data = snap.data();
            if (data.status === 'disbanded' || data.status === 'completed') {
                _clearPersistedSession();
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    // ────────────────────────────────────────────────
    // REFRESH GUARD
    // ────────────────────────────────────────────────

    function _installRefreshGuard() {
        if (_beforeUnloadHandler) return; // Already installed
        _beforeUnloadHandler = (e) => {
            if (sessionRef) {
                e.preventDefault();
                // Modern browsers ignore custom messages but still show the dialog
                return '';
            }
        };
        window.addEventListener('beforeunload', _beforeUnloadHandler);
    }

    function _removeRefreshGuard() {
        if (_beforeUnloadHandler) {
            window.removeEventListener('beforeunload', _beforeUnloadHandler);
            _beforeUnloadHandler = null;
        }
    }

    // ────────────────────────────────────────────────
    // HOST MIGRATION (Lobby Only)
    // ────────────────────────────────────────────────

    /**
     * Promote a new host if current host is offline.
     * Called from lobby when host staleness is detected.
     * Uses transaction to prevent race conditions.
     */
    async function migrateHost() {
        if (!sessionRef || !db) return false;

        const { runTransaction } = window.firebaseFirestore;

        try {
            const result = await runTransaction(db, async (transaction) => {
                const snap = await transaction.get(sessionRef);
                if (!snap.exists()) return false;

                const data = snap.data();
                const players = data.players || {};

                // Find current host
                const hostEntry = Object.entries(players).find(([_, p]) => p.isHost);
                if (!hostEntry) return false;

                const [hostId, hostData] = hostEntry;
                const hostStale = (Date.now() - (hostData.lastSeen || 0)) > 60000; // 60s

                if (!hostStale || hostData.online) return false; // Host is fine

                // Find first online non-host player to promote
                const candidate = Object.entries(players).find(([pid, p]) =>
                    pid !== hostId && p.online && (Date.now() - (p.lastSeen || 0)) < 30000
                );

                if (!candidate) return false; // No one to promote

                const [newHostId, newHostData] = candidate;

                // Demote old host, promote new
                const updates = {};
                updates[`players.${hostId}.isHost`] = false;
                updates[`players.${newHostId}.isHost`] = true;
                transaction.update(sessionRef, updates);

                return { newHostId, newHostName: newHostData.name };
            });

            if (result && result.newHostId) {
                // If we're the new host, update local state
                if (result.newHostId === _playerId) {
                    _isHost = true;
                    _persistSession();
                }
                await logActivity('host_migrated', `${result.newHostName} is now the host`);
                console.log(`%c[CO-OP] Host migrated to ${result.newHostName}`, 'color: #f39c12');
                return true;
            }
            return false;
        } catch (error) {
            console.error('[CO-OP] Host migration failed:', error);
            return false;
        }
    }

    // ────────────────────────────────────────────────
    // PRESENCE / DISCONNECT
    // ────────────────────────────────────────────────

    function startPresence() {
        presenceInterval = setInterval(async () => {
            if (!sessionRef) return;
            const { updateDoc } = window.firebaseFirestore;
            try {
                if (_mode === 'vs' && _teamId) {
                    await updateDoc(sessionRef, {
                        [`teams.${_teamId}.players.${_playerId}.lastSeen`]: Date.now(),
                        [`teams.${_teamId}.players.${_playerId}.online`]: true
                    });
                } else {
                    await updateDoc(sessionRef, {
                        [`players.${_playerId}.lastSeen`]: Date.now(),
                        [`players.${_playerId}.online`]: true
                    });
                }
            } catch { /* ignore presence errors */ }
        }, 15000);
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

        if (_teamsUnsubscribe) {
            _teamsUnsubscribe();
            _teamsUnsubscribe = null;
        }

        if (_timerInterval) {
            clearInterval(_timerInterval);
            _timerInterval = null;
        }

        _removeRefreshGuard();

        if (sessionRef) {
            try {
                const { updateDoc } = window.firebaseFirestore;
                if (_mode === 'vs' && _teamId) {
                    await updateDoc(sessionRef, {
                        [`teams.${_teamId}.players.${_playerId}.online`]: false
                    });
                } else {
                    await updateDoc(sessionRef, {
                        [`players.${_playerId}.online`]: false
                    });
                }
                await logActivity('player_left', `${_playerName} disconnected`);
            } catch { /* page may be unloading */ }
        }

        sessionRef = null;
        _roomCode = null;
        _teamId = null;
    }

    // ────────────────────────────────────────────────
    // VS MODE — TEAM-SPECIFIC METHODS
    // ────────────────────────────────────────────────

    /**
     * Subscribe to all teams data changes (VS mode).
     * Callback receives { alpha: {...}, bravo: {...} } teams object.
     */
    function onTeamsChange(callback) {
        _onTeamsChange = callback;
    }

    /**
     * Subscribe to VS winner event.
     * Callback receives (winnerId, teams).
     */
    function onVsWinner(callback) {
        _onVsWinner = callback;
    }

    /**
     * Get all teams snapshot (VS mode). Returns teams object or null.
     */
    async function getTeams() {
        if (!sessionRef || !db) return null;
        const { getDoc } = window.firebaseFirestore;
        try {
            const snap = await getDoc(sessionRef);
            if (!snap.exists()) return null;
            return snap.data().teams || null;
        } catch { return null; }
    }

    /**
     * Get the opponent team's ID.
     */
    function getOpponentTeam() {
        if (!_teamId) return null;
        return _teamId === 'alpha' ? 'bravo' : 'alpha';
    }

    /**
     * Surrender in VS mode. Sets the other team as winner.
     */
    async function surrender() {
        if (!sessionRef || !db || _mode !== 'vs' || !_teamId) return;
        const { updateDoc } = window.firebaseFirestore;
        const winner = getOpponentTeam();
        try {
            await updateDoc(sessionRef, { winner, status: 'completed' });
            await logActivity('surrender', `${_playerName}'s team surrendered`);
        } catch (error) {
            console.error('[VS] Surrender failed:', error);
        }
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
        disbandSession,
        onDisband,
        subscribeToState,
        subscribeToActivity,
        onPlayersChange,
        updateState,
        submitFlagAtomically,
        revealHintAtomically,
        logActivity,
        startPresence,
        disconnect,
        migrateHost,

        // VS Mode
        onTeamsChange,
        onVsWinner,
        getTeams,
        getOpponentTeam,
        surrender,

        // Session persistence
        getPersistedSession,
        validatePersistedSession,
        clearPersistedSession: _clearPersistedSession,

        // Getters
        get roomCode() { return _roomCode; },
        get playerId() { return _playerId; },
        get playerName() { return _playerName; },
        get isHost() { return _isHost; },
        get isActive() { return sessionRef !== null; },
        get mode() { return _mode; },
        get teamId() { return _teamId; },
        getSessionRef: function() { return sessionRef; }
    };
})();
