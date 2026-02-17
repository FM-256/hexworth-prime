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

    // ────────────────────────────────────────────────
    // SHOW LOBBY
    // ────────────────────────────────────────────────

    /**
     * Show the mode selection overlay.
     * @param {object} config - Box config (title, scoring, etc.)
     * @param {function} onStart - Called with { mode: 'solo'|'coop', state? }
     */
    function show(config, onStart) {
        _config = config;
        _onStart = onStart;

        _overlayEl = document.createElement('div');
        _overlayEl.className = 'coop-lobby-overlay';
        _overlayEl.innerHTML = `
            <div class="coop-lobby-card">
                <div class="coop-lobby-title">${_escHtml(config.title || 'CTF Arena')}</div>
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

        // Button handlers
        document.getElementById('coopBtnSolo').addEventListener('click', () => {
            _close();
            _onStart({ mode: 'solo' });
        });

        document.getElementById('coopBtnCoop').addEventListener('click', () => {
            _showCoOpOptions();
        });
    }

    // ────────────────────────────────────────────────
    // CO-OP OPTIONS (Create / Join)
    // ────────────────────────────────────────────────

    function _showCoOpOptions() {
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

        // Hide mode buttons
        document.querySelector('.coop-lobby-modes').style.display = 'none';
        document.querySelector('.coop-lobby-subtitle').textContent = 'Set up your team';
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
            const roomCode = await CoOpSync.createSession(boxId, _config);

            stage.innerHTML = `
                <div class="coop-room-created">
                    <div class="coop-room-label">Room Code</div>
                    <div class="coop-room-code" id="coopRoomCode">${roomCode}</div>
                    <div class="coop-room-hint">Share this code with your partner</div>
                    <div class="coop-players" id="coopPlayerList">
                        <div class="coop-player you">
                            <span class="coop-player-dot online"></span>
                            <span class="coop-player-name">${_escHtml(CoOpSync.playerName)}</span>
                            <span class="coop-player-role">HOST</span>
                        </div>
                        <div class="coop-player waiting" id="coopPlayer2Slot">
                            <span class="coop-player-dot"></span>
                            <span class="coop-player-name">Waiting for partner...</span>
                        </div>
                    </div>
                    <button class="coop-start-btn disabled" id="coopStartBtn" disabled>Waiting for partner</button>
                </div>
            `;

            // Listen for partner joining
            CoOpSync.onPlayersChange((players, status) => {
                _updatePlayerList(players);
            });
            CoOpSync.subscribeToState(() => {}); // Starts the listener

            document.getElementById('coopStartBtn').addEventListener('click', async () => {
                await CoOpSync.startGame();
                await CoOpSync.logActivity('player_joined', `${CoOpSync.playerName} (host) started the game`);
                CoOpSync.startPresence();
                _close();
                _onStart({ mode: 'coop' });
            });
        } catch (error) {
            stage.innerHTML = `<div class="coop-error">Failed to create room: ${_escHtml(error.message)}</div>`;
        }
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
                    <input type="text" class="coop-join-input" id="coopJoinInput"
                           placeholder="HEX-___" maxlength="7" autocomplete="off" spellcheck="false">
                    <button class="coop-join-go" id="coopJoinGo">Join</button>
                </div>
                <div class="coop-join-msg" id="coopJoinMsg"></div>
            </div>
        `;

        const input = document.getElementById('coopJoinInput');
        input.focus();

        // Auto-format: uppercase, add HEX- prefix
        input.addEventListener('input', () => {
            let val = input.value.toUpperCase().replace(/[^A-F0-9\-]/g, '');
            if (val.length > 0 && !val.startsWith('HEX-')) {
                // If they're typing just the hex part, prefix it
                val = val.replace('HEX', '').replace('-', '');
                if (val.length <= 3) val = 'HEX-' + val;
            }
            input.value = val;
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') _joinRoom();
        });

        document.getElementById('coopJoinGo').addEventListener('click', _joinRoom);
    }

    async function _joinRoom() {
        const input = document.getElementById('coopJoinInput');
        const msg = document.getElementById('coopJoinMsg');
        const code = input.value.trim().toUpperCase();

        if (!code || code.length < 5) {
            msg.innerHTML = '<span class="coop-error-text">Enter a valid room code</span>';
            return;
        }

        msg.innerHTML = '<span class="coop-loading-text">Connecting...</span>';

        try {
            await CoOpSync.init();
            const sessionData = await CoOpSync.joinSession(code);
            await CoOpSync.logActivity('player_joined', `${CoOpSync.playerName} joined the room`);
            CoOpSync.startPresence();

            // Show waiting-for-host screen
            const stage = document.getElementById('coopLobbyStage');
            stage.innerHTML = `
                <div class="coop-room-created">
                    <div class="coop-room-label">Joined Room</div>
                    <div class="coop-room-code">${code}</div>
                    <div class="coop-players" id="coopPlayerList"></div>
                    <div class="coop-join-status" id="coopJoinStatus">Waiting for host to start...</div>
                </div>
            `;

            _updatePlayerList(sessionData.players);

            // Listen for game start
            CoOpSync.onPlayersChange((players, status) => {
                _updatePlayerList(players);
            });

            CoOpSync.subscribeToState((state) => {
                // When host starts the game, status changes trigger via player change
            });

            // Also listen for status change to 'active'
            // We re-use the onPlayersChange callback since it fires on any doc change
            CoOpSync.onPlayersChange((players, status) => {
                _updatePlayerList(players);
                if (status === 'active') {
                    _close();
                    _onStart({ mode: 'coop', state: null }); // State will come via subscription
                }
            });

        } catch (error) {
            msg.innerHTML = `<span class="coop-error-text">${_escHtml(error.message)}</span>`;
        }
    }

    // ────────────────────────────────────────────────
    // PLAYER LIST UPDATE
    // ────────────────────────────────────────────────

    function _updatePlayerList(players) {
        const list = document.getElementById('coopPlayerList');
        if (!list) return;

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

        // If only 1 player, show empty slot
        if (entries.length < 2) {
            html += `
                <div class="coop-player waiting">
                    <span class="coop-player-dot"></span>
                    <span class="coop-player-name">Waiting for partner...</span>
                </div>
            `;
        }

        list.innerHTML = html;

        // Enable start button if 2 players (host only)
        const startBtn = document.getElementById('coopStartBtn');
        if (startBtn && entries.length >= 2) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            startBtn.textContent = 'Start Mission';
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
