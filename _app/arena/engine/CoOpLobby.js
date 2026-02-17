/* ============================================================
   CTF ARENA — CoOpLobby.js
   Pre-game lobby UI for co-op mode.
   Shows mode selection (Solo/Co-Op), room creation, joining,
   player list, and game start controls.
   ============================================================ */

const CoOpLobby = (function() {
    'use strict';

    let _overlayEl = null;
    let _config = null;
    let _onStart = null;  // Callback when game should start
    let _pollInterval = null;
    let _hostMigrationInterval = null;
    let _squadSize = 2;   // Selected squad size (2=Duo, 3=Trio, 5=Squad)

    // ────────────────────────────────────────────────
    // SHOW LOBBY
    // ────────────────────────────────────────────────

    /**
     * Show the mode selection overlay.
     * @param {object} config - Box config (title, scoring, etc.)
     * @param {function} onStart - Called with { mode: 'solo'|'coop', state? }
     */
    async function show(config, onStart) {
        _config = config;
        _onStart = onStart;

        // Check for active session to rejoin
        const persisted = CoOpSync.getPersistedSession();
        if (persisted && persisted.url === window.location.pathname) {
            await CoOpSync.init();
            const sessionData = await CoOpSync.validatePersistedSession(persisted.roomCode);
            if (sessionData) {
                _showRejoinPrompt(persisted, sessionData);
                return;
            }
        }

        _showModeSelect();
    }

    function _showModeSelect() {
        _overlayEl = document.createElement('div');
        _overlayEl.className = 'coop-lobby-overlay';
        _overlayEl.innerHTML = `
            <div class="coop-lobby-card">
                <div class="coop-lobby-title">${_escHtml(_config.title || 'CTF Arena')}</div>
                <div class="coop-lobby-subtitle">Choose your mission type</div>
                <div class="coop-lobby-modes">
                    <button class="coop-mode-btn" id="coopBtnSolo">
                        <span class="coop-mode-icon">&#128373;</span>
                        <span class="coop-mode-label">Solo Ops</span>
                        <span class="coop-mode-desc">Hack alone. Full credit.</span>
                    </button>
                    <button class="coop-mode-btn coop-mode-highlight" id="coopBtnCoop">
                        <span class="coop-mode-icon">&#9876;</span>
                        <span class="coop-mode-label">Co-Op</span>
                        <span class="coop-mode-desc">Team up. Shared mission.</span>
                    </button>
                </div>
                <div class="coop-lobby-stage" id="coopLobbyStage"></div>
            </div>
        `;

        document.body.appendChild(_overlayEl);

        document.getElementById('coopBtnSolo').addEventListener('click', () => {
            _close();
            _onStart({ mode: 'solo' });
        });

        document.getElementById('coopBtnCoop').addEventListener('click', () => {
            _showSquadSelect();
        });
    }

    // ────────────────────────────────────────────────
    // AUTO-REJOIN PROMPT
    // ────────────────────────────────────────────────

    function _showRejoinPrompt(persisted, sessionData) {
        const max = sessionData.config?.maxPlayers || 2;
        const sLabel = max === 2 ? 'DUO' : max === 3 ? 'TRIO' : 'SQUAD';
        const playerCount = Object.keys(sessionData.players || {}).length;
        const isHost = sessionData.players?.[persisted.playerId]?.isHost;

        _overlayEl = document.createElement('div');
        _overlayEl.className = 'coop-lobby-overlay';
        _overlayEl.innerHTML = `
            <div class="coop-lobby-card">
                <div class="coop-lobby-title">${_escHtml(_config.title || 'CTF Arena')}</div>
                <div class="coop-lobby-subtitle">Active session detected</div>
                <div class="coop-rejoin-prompt">
                    <div class="coop-room-code">${persisted.roomCode} <span class="coop-squad-badge">${sLabel}</span></div>
                    <div class="coop-rejoin-info">${playerCount} player${playerCount !== 1 ? 's' : ''} ${isHost ? '(you are host)' : ''}</div>
                    <div class="coop-rejoin-status">Session is ${sessionData.status}</div>
                    <div class="coop-rejoin-actions">
                        <button class="coop-rejoin-btn rejoin" id="coopRejoinYes">Rejoin Squad</button>
                        <button class="coop-rejoin-btn decline" id="coopRejoinNo">New Game</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(_overlayEl);

        document.getElementById('coopRejoinYes').addEventListener('click', async () => {
            await _performRejoin(persisted.roomCode, sessionData);
        });

        document.getElementById('coopRejoinNo').addEventListener('click', () => {
            CoOpSync.clearPersistedSession();
            _overlayEl.remove();
            _overlayEl = null;
            _showModeSelect();
        });
    }

    async function _performRejoin(roomCode, sessionData) {
        const stage = _overlayEl.querySelector('.coop-rejoin-prompt');
        if (stage) stage.innerHTML = `<div class="coop-loading">Reconnecting...</div>`;

        try {
            const data = await CoOpSync.joinSession(roomCode);
            await CoOpSync.logActivity('player_reconnected', `${CoOpSync.playerName} reconnected`);
            CoOpSync.startPresence();

            // If game is already active, skip lobby and go straight in
            if (data.status === 'active') {
                _close();
                _onStart({ mode: 'coop', state: data.state, rejoin: true });
                return;
            }

            // Game is still in lobby — show waiting screen
            const max = data.config?.maxPlayers || 2;
            _squadSize = max;
            _installDisbandListener();

            if (CoOpSync.isHost) {
                // Recreate the host lobby view
                _overlayEl.remove();
                _overlayEl = null;
                _showModeSelect(); // We need the overlay shell
                // Skip to room created view
                document.querySelector('.coop-lobby-modes').style.display = 'none';
                const squadLabel = max === 2 ? 'DUO' : max === 3 ? 'TRIO' : 'SQUAD';
                document.querySelector('.coop-lobby-subtitle').textContent = `${squadLabel} — Reconnected`;
                _showHostLobby(roomCode, max);
            } else {
                // Show joiner waiting view
                _overlayEl.remove();
                _overlayEl = null;
                _showModeSelect();
                document.querySelector('.coop-lobby-modes').style.display = 'none';
                const sLabel = max === 2 ? 'DUO' : max === 3 ? 'TRIO' : 'SQUAD';
                document.querySelector('.coop-lobby-subtitle').textContent = `${sLabel} — Reconnected`;
                _showJoinerLobby(roomCode, data, max);
            }
        } catch (error) {
            CoOpSync.clearPersistedSession();
            if (stage) stage.innerHTML = `<div class="coop-error">Rejoin failed: ${_escHtml(error.message)}</div>`;
            setTimeout(() => {
                _overlayEl.remove();
                _overlayEl = null;
                _showModeSelect();
            }, 2000);
        }
    }

    // ────────────────────────────────────────────────
    // SQUAD SIZE SELECTION
    // ────────────────────────────────────────────────

    function _showSquadSelect() {
        // Hide mode buttons
        document.querySelector('.coop-lobby-modes').style.display = 'none';
        document.querySelector('.coop-lobby-subtitle').textContent = 'Select squad size';

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-squad-select">
                <button class="coop-squad-btn" data-size="2">
                    <span class="coop-squad-count">2</span>
                    <span class="coop-squad-label">DUO</span>
                </button>
                <button class="coop-squad-btn" data-size="3">
                    <span class="coop-squad-count">3</span>
                    <span class="coop-squad-label">TRIO</span>
                </button>
                <button class="coop-squad-btn" data-size="5">
                    <span class="coop-squad-count">5</span>
                    <span class="coop-squad-label">SQUAD</span>
                </button>
            </div>
        `;

        stage.querySelectorAll('.coop-squad-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                _squadSize = parseInt(btn.dataset.size);
                _showCoOpOptions();
            });
        });
    }

    // ────────────────────────────────────────────────
    // CO-OP OPTIONS (Create / Join)
    // ────────────────────────────────────────────────

    function _showCoOpOptions() {
        const squadLabel = _squadSize === 2 ? 'DUO' : _squadSize === 3 ? 'TRIO' : 'SQUAD';

        document.querySelector('.coop-lobby-subtitle').textContent = `${squadLabel} — Set up your team`;

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-options">
                <button class="coop-option-btn" id="coopCreate">
                    <span class="coop-option-icon">+</span>
                    Create Room
                </button>
                <button class="coop-option-btn" id="coopJoin">
                    <span class="coop-option-icon">&#8594;</span>
                    Join Room
                </button>
            </div>
        `;

        document.getElementById('coopCreate').addEventListener('click', _createRoom);
        document.getElementById('coopJoin').addEventListener('click', _showJoinInput);
    }

    // ────────────────────────────────────────────────
    // CREATE ROOM
    // ────────────────────────────────────────────────

    async function _createRoom() {
        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `<div class="coop-loading">Initializing secure channel...</div>`;

        try {
            await CoOpSync.init();
            const boxId = _config.storageKey || 'unknown';
            const roomCode = await CoOpSync.createSession(boxId, _config, _squadSize);
            _installDisbandListener();
            _showHostLobby(roomCode, _squadSize);
        } catch (error) {
            stage.innerHTML = `<div class="coop-error">Failed to create room: ${_escHtml(error.message)}</div>`;
        }
    }

    /**
     * Shared host lobby view — used by both createRoom and rejoin.
     */
    function _showHostLobby(roomCode, max) {
        const squadLabel = max === 2 ? 'DUO' : max === 3 ? 'TRIO' : 'SQUAD';
        const teamNoun = max === 2 ? 'your partner' : 'your team';
        _squadSize = max;

        let emptySlots = '';
        for (let i = 1; i < max; i++) {
            emptySlots += `
                <div class="coop-player waiting">
                    <span class="coop-player-dot"></span>
                    <span class="coop-player-name">Waiting...</span>
                </div>`;
        }

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-room-created">
                <div class="coop-room-label">Room Code</div>
                <div class="coop-room-code" id="coopRoomCode">${roomCode} <span class="coop-squad-badge">${squadLabel}</span></div>
                <div class="coop-room-hint">Share this code with ${teamNoun}</div>
                <div class="coop-players" id="coopPlayerList">
                    <div class="coop-player you">
                        <span class="coop-player-dot online"></span>
                        <span class="coop-player-name">${_escHtml(CoOpSync.playerName)}</span>
                        <span class="coop-player-role">HOST</span>
                    </div>
                    ${emptySlots}
                </div>
                <button class="coop-start-btn disabled" id="coopStartBtn" disabled>Waiting for ${teamNoun}</button>
                <button class="coop-disband-btn" id="coopDisbandBtn">Disband Squad</button>
            </div>
        `;

        CoOpSync.onPlayersChange((players, status) => {
            _updatePlayerList(players);
        });
        CoOpSync.subscribeToState(() => {});

        document.getElementById('coopStartBtn').addEventListener('click', async () => {
            await CoOpSync.startGame();
            await CoOpSync.logActivity('game_started', `${CoOpSync.playerName} started the game`);
            CoOpSync.startPresence();
            _close();
            _onStart({ mode: 'coop' });
        });

        document.getElementById('coopDisbandBtn').addEventListener('click', _confirmDisband);
    }

    // ────────────────────────────────────────────────
    // JOIN ROOM
    // ────────────────────────────────────────────────

    function _showJoinInput() {
        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-join-form">
                <label class="coop-join-label">Enter Room Code</label>
                <div class="coop-join-input-row">
                    <span class="coop-join-prefix">HEX-</span>
                    <input type="text" class="coop-join-input" id="coopJoinInput"
                           placeholder="___" maxlength="3" autocomplete="off" spellcheck="false"
                           style="flex:1;min-width:0;">
                    <button class="coop-join-go" id="coopJoinGo">Join</button>
                </div>
                <div class="coop-join-msg" id="coopJoinMsg"></div>
            </div>
        `;

        const input = document.getElementById('coopJoinInput');
        input.focus();

        input.addEventListener('input', () => {
            input.value = input.value.toUpperCase().replace(/[^A-F0-9]/g, '').substring(0, 3);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') _joinRoom();
        });

        document.getElementById('coopJoinGo').addEventListener('click', _joinRoom);
    }

    async function _joinRoom() {
        const input = document.getElementById('coopJoinInput');
        const msg = document.getElementById('coopJoinMsg');
        const raw = input.value.trim().toUpperCase().replace(/[^A-F0-9]/g, '');
        const code = 'HEX-' + raw;

        if (!raw || raw.length < 3) {
            msg.innerHTML = '<span class="coop-error-text">Enter the 3-character room code</span>';
            return;
        }

        msg.innerHTML = '<span class="coop-loading-text">Connecting...</span>';

        try {
            await CoOpSync.init();
            const sessionData = await CoOpSync.joinSession(code);
            await CoOpSync.logActivity('player_joined', `${CoOpSync.playerName} joined the room`);
            CoOpSync.startPresence();

            const max = sessionData.config?.maxPlayers || 2;
            _squadSize = max;
            _installDisbandListener();
            _showJoinerLobby(code, sessionData, max);
        } catch (error) {
            msg.innerHTML = `<span class="coop-error-text">${_escHtml(error.message)}</span>`;
        }
    }

    /**
     * Shared joiner lobby view — used by both joinRoom and rejoin.
     */
    function _showJoinerLobby(code, sessionData, max) {
        const sLabel = max === 2 ? 'DUO' : max === 3 ? 'TRIO' : 'SQUAD';

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-room-created">
                <div class="coop-room-label">Joined Room</div>
                <div class="coop-room-code">${code} <span class="coop-squad-badge">${sLabel}</span></div>
                <div class="coop-players" id="coopPlayerList"></div>
                <div class="coop-join-status" id="coopJoinStatus">Waiting for host to start...</div>
            </div>
        `;

        _updatePlayerList(sessionData.players, max);

        CoOpSync.subscribeToState(() => {});

        // Listen for player changes, game start, and host migration
        CoOpSync.onPlayersChange((players, status) => {
            _updatePlayerList(players, max);

            // If we got promoted to host, switch to host view
            if (CoOpSync.isHost && !document.getElementById('coopStartBtn')) {
                _overlayEl.remove();
                _overlayEl = null;
                _showModeSelect();
                document.querySelector('.coop-lobby-modes').style.display = 'none';
                document.querySelector('.coop-lobby-subtitle').textContent = `${sLabel} — You are now host`;
                _showHostLobby(code, max);
                return;
            }

            if (status === 'active') {
                _close();
                _onStart({ mode: 'coop', state: null });
            }
        });

        // Start host migration checks (if host goes stale, try to promote)
        _startHostMigrationPolling();
    }

    // ────────────────────────────────────────────────
    // DISBAND
    // ────────────────────────────────────────────────

    function _confirmDisband() {
        const btn = document.getElementById('coopDisbandBtn');
        if (!btn) return;

        if (btn.dataset.confirm === 'true') {
            // Second click — actually disband
            CoOpSync.disbandSession();
            _close();
            return;
        }

        // First click — show confirmation
        btn.dataset.confirm = 'true';
        btn.textContent = 'Confirm Disband';
        btn.classList.add('confirm');

        // Reset after 3 seconds if not confirmed
        setTimeout(() => {
            if (btn && btn.dataset.confirm === 'true') {
                btn.dataset.confirm = '';
                btn.textContent = 'Disband Squad';
                btn.classList.remove('confirm');
            }
        }, 3000);
    }

    function _installDisbandListener() {
        CoOpSync.onDisband((data) => {
            _stopHostMigrationPolling();
            // Show disbanded message
            if (_overlayEl) {
                const stage = document.getElementById('coopLobbyStage');
                if (stage) {
                    stage.innerHTML = `
                        <div class="coop-disbanded-msg">
                            <div class="coop-disbanded-icon">&#128683;</div>
                            <div class="coop-disbanded-text">Squad disbanded by host</div>
                        </div>`;
                }
                setTimeout(() => {
                    _close();
                    _showModeSelect();
                }, 2500);
            } else {
                // In-game — show notification and reload
                if (typeof BoxEngine !== 'undefined') {
                    BoxEngine.notify('Squad disbanded by host', 'danger');
                }
                CoOpSync.disconnect();
                setTimeout(() => location.reload(), 2000);
            }
        });
    }

    // ────────────────────────────────────────────────
    // HOST MIGRATION POLLING
    // ────────────────────────────────────────────────

    function _startHostMigrationPolling() {
        _stopHostMigrationPolling();
        _hostMigrationInterval = setInterval(async () => {
            if (CoOpSync.isHost) {
                _stopHostMigrationPolling(); // We're already host
                return;
            }
            await CoOpSync.migrateHost();
        }, 15000); // Check every 15s
    }

    function _stopHostMigrationPolling() {
        if (_hostMigrationInterval) {
            clearInterval(_hostMigrationInterval);
            _hostMigrationInterval = null;
        }
    }

    // ────────────────────────────────────────────────
    // PLAYER LIST UPDATE
    // ────────────────────────────────────────────────

    function _updatePlayerList(players, maxPlayers) {
        const list = document.getElementById('coopPlayerList');
        if (!list) return;

        const max = maxPlayers || _squadSize || 2;
        const entries = Object.entries(players || {});
        let html = '';

        entries.forEach(([pid, p]) => {
            const isYou = pid === CoOpSync.playerId;
            const stale = (Date.now() - (p.lastSeen || 0)) > 30000; // 30s timeout
            const online = p.online && !stale;

            html += `
                <div class="coop-player ${isYou ? 'you' : ''} ${online ? '' : 'offline'}">
                    <span class="coop-player-dot ${online ? 'online' : ''}"></span>
                    <span class="coop-player-name">${_escHtml(p.name || 'Unknown')}</span>
                    ${p.isHost ? '<span class="coop-player-role">HOST</span>' : ''}
                    ${isYou ? '<span class="coop-player-you">YOU</span>' : ''}
                </div>
            `;
        });

        // Show empty slots for remaining spots
        const emptyCount = max - entries.length;
        for (let i = 0; i < emptyCount; i++) {
            html += `
                <div class="coop-player waiting">
                    <span class="coop-player-dot"></span>
                    <span class="coop-player-name">Waiting...</span>
                </div>
            `;
        }

        list.innerHTML = html;

        // Enable start button when at least 2 players are in (host only)
        const startBtn = document.getElementById('coopStartBtn');
        if (startBtn && entries.length >= 2) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            startBtn.textContent = entries.length >= max ? 'Start Mission' : `Start Mission (${entries.length}/${max})`;
        }
    }

    // ────────────────────────────────────────────────
    // CLOSE
    // ────────────────────────────────────────────────

    function _close() {
        if (_pollInterval) {
            clearInterval(_pollInterval);
            _pollInterval = null;
        }
        _stopHostMigrationPolling();
        if (_overlayEl) {
            _overlayEl.classList.add('fade-out');
            setTimeout(() => {
                _overlayEl.remove();
                _overlayEl = null;
            }, 300);
        }
    }

    // ────────────────────────────────────────────────
    // UTILITY
    // ────────────────────────────────────────────────

    function _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ────────────────────────────────────────────────
    // PUBLIC API
    // ────────────────────────────────────────────────

    return {
        show,
        close: _close
    };
})();
