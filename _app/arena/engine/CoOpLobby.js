/* ============================================================
   CTF ARENA — CoOpLobby.js
   Pre-game lobby UI for co-op and VS modes.
   Shows mode selection (Solo/Co-Op/VS), room creation, joining,
   player list, team assignment, and game start controls.
   ============================================================ */

const CoOpLobby = (function() {
    'use strict';

    let _overlayEl = null;
    let _config = null;
    let _onStart = null;  // Callback when game should start
    let _pollInterval = null;
    let _hostMigrationInterval = null;
    let _squadSize = 2;   // Selected squad size (2=Duo, 3=Trio, 5=Squad)
    let _gameMode = 'solo'; // 'solo' | 'coop' | 'vs'
    let _timeLimit = null;  // VS time limit in minutes (null = unlimited)

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
        // Eclipse-tier opt-in: single-button lobby with forced mode/difficulty.
        // Affects only configs that set `lobbyMode: 'eclipse'`; all other boxes
        // see the multi-mode/difficulty UI below.
        if (_config.lobbyMode === 'eclipse') {
            _showEclipseSelect();
            return;
        }
        _overlayEl = document.createElement('div');
        _overlayEl.className = 'coop-lobby-overlay';
        _overlayEl.innerHTML = `
            <div class="coop-lobby-card">
                <div class="coop-lobby-title">${_escHtml(_config.title || 'CTF Arena')}</div>
                <div class="coop-lobby-subtitle">Choose your mission type</div>
                <div class="coop-lobby-modes">
                    <button class="coop-mode-btn" id="coopBtnSolo">
                        <span class="coop-mode-icon"><img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                        <span class="coop-mode-label">Solo Ops</span>
                        <span class="coop-mode-desc">Hack alone. Full credit.</span>
                    </button>
                    <button class="coop-mode-btn coop-mode-highlight" id="coopBtnCoop">
                        <span class="coop-mode-icon"><img src="/assets/images/icons/icon-swords.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                        <span class="coop-mode-label">Co-Op</span>
                        <span class="coop-mode-desc">Team up. Shared mission.</span>
                    </button>
                    <button class="coop-mode-btn coop-mode-vs" id="coopBtnVs">
                        <span class="coop-mode-icon">&#9760;</span>
                        <span class="coop-mode-label">VS Battle</span>
                        <span class="coop-mode-desc">Team vs team. Race to pwn.</span>
                    </button>
                </div>
                <div class="coop-difficulty-row">
                    <span class="coop-difficulty-label">Difficulty:</span>
                    <div class="coop-difficulty-options">
                        <button class="coop-diff-btn coop-diff-easy" data-diff="easy" title="Tutorial guidance, free hints after 3 min">Easy</button>
                        <button class="coop-diff-btn coop-diff-normal coop-diff-active" data-diff="normal" title="Standard challenge, hints available">Normal</button>
                        <button class="coop-diff-btn coop-diff-hard" data-diff="hard" title="No tutorial, double hint penalties">Hard</button>
                    </div>
                </div>
                <div class="coop-lobby-stage" id="coopLobbyStage"></div>
            </div>
        `;

        document.body.appendChild(_overlayEl);

        // Difficulty selector
        let _selectedDifficulty = 'normal';
        _overlayEl.querySelectorAll('.coop-diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                _overlayEl.querySelectorAll('.coop-diff-btn').forEach(b => b.classList.remove('coop-diff-active'));
                btn.classList.add('coop-diff-active');
                _selectedDifficulty = btn.dataset.diff;
            });
        });

        document.getElementById('coopBtnSolo').addEventListener('click', () => {
            _gameMode = 'solo';
            _close();
            _onStart({ mode: 'solo', difficulty: _selectedDifficulty });
        });

        document.getElementById('coopBtnCoop').addEventListener('click', () => {
            _gameMode = 'coop';
            _showSquadSelect();
        });

        document.getElementById('coopBtnVs').addEventListener('click', () => {
            _gameMode = 'vs';
            _showVsFormatSelect();
        });
    }

    // ────────────────────────────────────────────────
    // ECLIPSE-TIER SELECT (single-button lobby)
    // ────────────────────────────────────────────────

    function _showEclipseSelect() {
        const forceMode = _config.forceMode || 'solo';
        const forceDifficulty = _config.forceDifficulty || 'hard';
        _overlayEl = document.createElement('div');
        _overlayEl.className = 'coop-lobby-overlay';
        _overlayEl.innerHTML = `
            <div class="coop-lobby-card eclipse">
                <div class="eclipse-tier-chip">ECLIPSE TIER</div>
                <div class="coop-lobby-title eclipse-title">${_escHtml(_config.title || 'Patient Zero')}</div>
                <div class="eclipse-subtitle">FINAL PRACTICAL EXAMINATION</div>
                <button class="eclipse-btn" id="eclipseEnter" aria-label="Begin Eclipse">ECLIPSE</button>
                <div class="eclipse-threat">every action is graded</div>
            </div>
        `;
        document.body.appendChild(_overlayEl);

        document.getElementById('eclipseEnter').addEventListener('click', () => {
            _gameMode = forceMode;
            _close();
            _onStart({ mode: forceMode, difficulty: forceDifficulty });
        });
    }

    // ────────────────────────────────────────────────
    // AUTO-REJOIN PROMPT
    // ────────────────────────────────────────────────

    function _showRejoinPrompt(persisted, sessionData) {
        const max = sessionData.config?.maxPlayers || 2;
        const isVs = sessionData.mode === 'vs';
        const sLabel = isVs ? 'VS' : (max === 2 ? 'DUO' : max === 3 ? 'TRIO' : 'SQUAD');
        let playerCount, isHost;
        if (isVs) {
            const allPlayers = [
                ...Object.keys(sessionData.teams?.alpha?.players || {}),
                ...Object.keys(sessionData.teams?.bravo?.players || {})
            ];
            playerCount = allPlayers.length;
            const teamId = persisted.teamId || 'alpha';
            isHost = sessionData.teams?.[teamId]?.players?.[persisted.playerId]?.isHost;
        } else {
            playerCount = Object.keys(sessionData.players || {}).length;
            isHost = sessionData.players?.[persisted.playerId]?.isHost;
        }
        _gameMode = sessionData.mode || 'coop';

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
        if (stage) stage.innerHTML = '<div class="coop-loading">Reconnecting...</div>';

        try {
            const data = await CoOpSync.joinSession(roomCode);
            await CoOpSync.logActivity('player_reconnected', `${CoOpSync.playerName} reconnected`);
            CoOpSync.startPresence();

            // If game is already active, skip lobby and go straight in
            if (data.status === 'active') {
                _close();
                _onStart({ mode: _gameMode, state: _gameMode === 'vs' ? null : data.state, rejoin: true });
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
    // VS FORMAT SELECTION
    // ────────────────────────────────────────────────

    function _showVsFormatSelect() {
        document.querySelector('.coop-lobby-modes').style.display = 'none';
        document.querySelector('.coop-lobby-subtitle').textContent = 'Select battle format';

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-squad-select vs-format-select">
                <button class="coop-squad-btn vs-format-btn" data-size="1">
                    <span class="coop-squad-count">1v1</span>
                    <span class="coop-squad-label">DUEL</span>
                </button>
                <button class="coop-squad-btn vs-format-btn" data-size="2">
                    <span class="coop-squad-count">2v2</span>
                    <span class="coop-squad-label">DUO</span>
                </button>
                <button class="coop-squad-btn vs-format-btn" data-size="3">
                    <span class="coop-squad-count">3v3</span>
                    <span class="coop-squad-label">TRIO</span>
                </button>
                <button class="coop-squad-btn vs-format-btn" data-size="5">
                    <span class="coop-squad-count">5v5</span>
                    <span class="coop-squad-label">SQUAD</span>
                </button>
            </div>
        `;

        stage.querySelectorAll('.vs-format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                _squadSize = parseInt(btn.dataset.size);
                _showVsOptions();
            });
        });
    }

    function _showVsOptions() {
        const formatLabel = _squadSize === 1 ? '1v1 DUEL' : _squadSize === 2 ? '2v2 DUO' : _squadSize === 3 ? '3v3 TRIO' : '5v5 SQUAD';
        document.querySelector('.coop-lobby-subtitle').textContent = `${formatLabel} — Set up your battle`;

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="vs-time-select">
                <div class="vs-time-label">Time Limit</div>
                <div class="vs-time-options">
                    <button class="vs-time-btn active" data-time="0">Unlimited</button>
                    <button class="vs-time-btn" data-time="10">10 min</button>
                    <button class="vs-time-btn" data-time="15">15 min</button>
                    <button class="vs-time-btn" data-time="20">20 min</button>
                    <button class="vs-time-btn" data-time="30">30 min</button>
                </div>
            </div>
            <div class="coop-options">
                <button class="coop-option-btn vs-option-btn" id="vsCreate">
                    <span class="coop-option-icon">+</span>
                    Create Battle
                </button>
                <button class="coop-option-btn vs-option-btn" id="vsJoin">
                    <span class="coop-option-icon">&#8594;</span>
                    Join Battle
                </button>
            </div>
        `;

        // Time limit selection
        _timeLimit = null;
        stage.querySelectorAll('.vs-time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                stage.querySelectorAll('.vs-time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const t = parseInt(btn.dataset.time);
                _timeLimit = t > 0 ? t : null;
            });
        });

        document.getElementById('vsCreate').addEventListener('click', _createVsRoom);
        document.getElementById('vsJoin').addEventListener('click', _showJoinInput);
    }

    async function _createVsRoom() {
        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = '<div class="coop-loading">Initializing battle arena...</div>';

        try {
            await CoOpSync.init();
            const boxId = _config.storageKey || 'unknown';
            const roomCode = await CoOpSync.createSession(boxId, _config, _squadSize, {
                mode: 'vs',
                timeLimit: _timeLimit
            });
            _installDisbandListener();
            _showVsHostLobby(roomCode);
        } catch (error) {
            stage.innerHTML = `<div class="coop-error">Failed to create battle: ${_escHtml(error.message)}</div>`;
        }
    }

    function _showVsHostLobby(roomCode) {
        const formatLabel = _squadSize === 1 ? '1v1' : _squadSize === 2 ? '2v2' : _squadSize === 3 ? '3v3' : '5v5';
        const timeLabel = _timeLimit ? `${_timeLimit} min` : 'Unlimited';

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-room-created vs-room-created">
                <div class="coop-room-label">Battle Room</div>
                <div class="coop-room-code" id="coopRoomCode">${roomCode} <span class="coop-squad-badge vs-badge">${formatLabel} VS</span></div>
                <div class="coop-room-hint">Share this code with opponents &bull; ${timeLabel}</div>
                <div class="vs-teams-container" id="vsTeamsContainer">
                    <div class="vs-team-col" id="vsTeamAlpha">
                        <div class="vs-team-header alpha">TEAM ALPHA</div>
                        <div class="vs-team-players" id="vsAlphaPlayers"></div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="vs-team-col" id="vsTeamBravo">
                        <div class="vs-team-header bravo">TEAM BRAVO</div>
                        <div class="vs-team-players" id="vsBravoPlayers"></div>
                    </div>
                </div>
                <button class="coop-start-btn vs-start-btn disabled" id="vsStartBtn" disabled>Waiting for opponents</button>
                <button class="coop-disband-btn" id="coopDisbandBtn">Disband Battle</button>
            </div>
        `;

        // Subscribe to team changes via the state subscription
        CoOpSync.subscribeToState(() => {}); // Need this to trigger snapshot listener
        CoOpSync.onPlayersChange((players, status) => {
            _updateVsTeamLists(players);
        });
        // Also subscribe to teams directly via onTeamsChange
        CoOpSync.onTeamsChange((teams, status) => {
            _updateVsTeamListsFromTeams(teams);
        });

        document.getElementById('vsStartBtn').addEventListener('click', async () => {
            await CoOpSync.startGame();
            await CoOpSync.logActivity('battle_started', `${CoOpSync.playerName} started the battle`);
            CoOpSync.startPresence();
            _close();
            _onStart({ mode: 'vs' });
        });

        document.getElementById('coopDisbandBtn').addEventListener('click', _confirmDisband);
    }

    function _updateVsTeamListsFromTeams(teams) {
        if (!teams) return;

        for (const tid of ['alpha', 'bravo']) {
            const container = document.getElementById(`vs${tid.charAt(0).toUpperCase() + tid.slice(1)}Players`);
            if (!container) continue;

            const teamPlayers = teams[tid]?.players || {};
            const entries = Object.entries(teamPlayers);
            let html = '';

            entries.forEach(([pid, p]) => {
                const isYou = pid === CoOpSync.playerId;
                const stale = (Date.now() - (p.lastSeen || 0)) > 30000;
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

            // Empty slots
            const max = _squadSize;
            for (let i = entries.length; i < max; i++) {
                html += `
                    <div class="coop-player waiting">
                        <span class="coop-player-dot"></span>
                        <span class="coop-player-name">Waiting...</span>
                    </div>
                `;
            }

            container.innerHTML = html;
        }

        // Enable start button when both teams have at least 1 player
        const alphaCount = Object.keys(teams.alpha?.players || {}).length;
        const bravoCount = Object.keys(teams.bravo?.players || {}).length;
        const startBtn = document.getElementById('vsStartBtn');
        if (startBtn && alphaCount >= 1 && bravoCount >= 1) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            const total = alphaCount + bravoCount;
            const max = _squadSize * 2;
            startBtn.textContent = total >= max ? 'Start Battle' : `Start Battle (${total}/${max})`;
        }
    }

    function _updateVsTeamLists(players) {
        // Reconstruct teams from flattened players with teamId
        const teams = { alpha: { players: {} }, bravo: { players: {} } };
        Object.entries(players || {}).forEach(([pid, p]) => {
            const tid = p.teamId || 'alpha';
            teams[tid].players[pid] = p;
        });
        _updateVsTeamListsFromTeams(teams);
    }

    // ────────────────────────────────────────────────
    // CREATE ROOM
    // ────────────────────────────────────────────────

    async function _createRoom() {
        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = '<div class="coop-loading">Initializing secure channel...</div>';

        try {
            await CoOpSync.init();
            const boxId = _config.storageKey || 'unknown';
            const roomCode = await CoOpSync.createSession(boxId, _config, _squadSize, { mode: 'coop' });
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

            // Detect mode from session
            if (sessionData.mode === 'vs') {
                _gameMode = 'vs';
            }

            const label = _gameMode === 'vs' ? 'battle' : 'room';
            await CoOpSync.logActivity('player_joined', `${CoOpSync.playerName} joined the ${label}`);
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
        const isVs = _gameMode === 'vs' || sessionData.mode === 'vs';

        if (isVs) {
            _gameMode = 'vs';
            return _showVsJoinerLobby(code, sessionData, max);
        }

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

        CoOpSync.onPlayersChange((players, status) => {
            _updatePlayerList(players, max);

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

        _startHostMigrationPolling();
    }

    function _showVsJoinerLobby(code, sessionData, max) {
        const formatLabel = max === 1 ? '1v1' : max === 2 ? '2v2' : max === 3 ? '3v3' : '5v5';
        const myTeam = CoOpSync.teamId;

        const stage = document.getElementById('coopLobbyStage');
        stage.innerHTML = `
            <div class="coop-room-created vs-room-created">
                <div class="coop-room-label">Joined Battle</div>
                <div class="coop-room-code">${code} <span class="coop-squad-badge vs-badge">${formatLabel} VS</span></div>
                <div class="vs-team-assignment">You are on <strong>Team ${myTeam ? myTeam.charAt(0).toUpperCase() + myTeam.slice(1) : '?'}</strong></div>
                <div class="vs-teams-container" id="vsTeamsContainer">
                    <div class="vs-team-col" id="vsTeamAlpha">
                        <div class="vs-team-header alpha">TEAM ALPHA</div>
                        <div class="vs-team-players" id="vsAlphaPlayers"></div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="vs-team-col" id="vsTeamBravo">
                        <div class="vs-team-header bravo">TEAM BRAVO</div>
                        <div class="vs-team-players" id="vsBravoPlayers"></div>
                    </div>
                </div>
                <div class="coop-join-status" id="coopJoinStatus">Waiting for host to start battle...</div>
            </div>
        `;

        _squadSize = max;

        // Initial render
        if (sessionData.teams) {
            _updateVsTeamListsFromTeams(sessionData.teams);
        }

        CoOpSync.subscribeToState(() => {});

        CoOpSync.onTeamsChange((teams, status) => {
            _updateVsTeamListsFromTeams(teams);
        });

        CoOpSync.onPlayersChange((players, status) => {
            if (status === 'active') {
                _close();
                _onStart({ mode: 'vs', state: null });
            }
        });

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
