/* ============================================================
   CTF ARENA — CoOpUI.js
   In-game co-op/VS interface: activity panel sidebar,
   player status indicators, shared notifications,
   VS scoreboard with live team scores.
   ============================================================ */

const CoOpUI = (function() {
    'use strict';

    let _panelEl = null;
    let _toggleBtn = null;
    let _isOpen = false;
    let _seenActivityIds = new Set();
    let _initialLoadDone = false;
    let _vsMode = false;

    // ────────────────────────────────────────────────
    // INIT — Called after BoxEngine.init when co-op/vs is active
    // ────────────────────────────────────────────────

    function init(vsMode) {
        _vsMode = !!vsMode;
        _buildPanel();
        _buildToggleButton();
        _buildTaskbarIndicator();

        // Subscribe to activity feed
        CoOpSync.subscribeToActivity((activities) => {
            _renderActivity(activities);
            _flashTeamNotifications(activities);
        });

        // Subscribe to player changes
        CoOpSync.onPlayersChange((players) => {
            _renderPlayers(players);
            _updateTaskbarIndicator(players);
        });

        // VS: subscribe to teams for live scoreboard
        if (_vsMode) {
            CoOpSync.onTeamsChange((teams) => {
                _renderVsScoreboard(teams);
            });
        }
    }

    // ────────────────────────────────────────────────
    // BUILD DOM
    // ────────────────────────────────────────────────

    function _buildPanel() {
        _panelEl = document.createElement('div');
        _panelEl.className = 'coop-panel' + (_vsMode ? ' vs-panel' : '');
        _panelEl.id = 'coopPanel';

        const panelTitle = _vsMode ? 'VS BATTLE' : 'CO-OP';
        const teamLabel = _vsMode ? 'SCOREBOARD' : 'TEAM';
        const myTeamName = _vsMode && CoOpSync.teamId
            ? `Team ${CoOpSync.teamId.charAt(0).toUpperCase() + CoOpSync.teamId.slice(1)}`
            : '';

        _panelEl.innerHTML = `
            <div class="coop-panel-header ${_vsMode ? 'vs-header' : ''}">
                <span class="coop-panel-title">${panelTitle}</span>
                <span class="coop-panel-room">${CoOpSync.roomCode || ''}</span>
                <button class="coop-panel-close" id="coopPanelClose">&times;</button>
            </div>
            ${_vsMode ? `
            <div class="coop-panel-section vs-scoreboard-section">
                <div class="coop-section-label">SCOREBOARD</div>
                <div class="vs-scoreboard" id="vsScoreboard">
                    <div class="vs-sb-team alpha" id="vsSbAlpha">
                        <span class="vs-sb-name">Team Alpha</span>
                        <span class="vs-sb-score">1000</span>
                        <span class="vs-sb-flags">0 flags</span>
                    </div>
                    <div class="vs-sb-divider">VS</div>
                    <div class="vs-sb-team bravo" id="vsSbBravo">
                        <span class="vs-sb-name">Team Bravo</span>
                        <span class="vs-sb-score">1000</span>
                        <span class="vs-sb-flags">0 flags</span>
                    </div>
                </div>
                ${myTeamName ? `<div class="vs-my-team">You: ${myTeamName}</div>` : ''}
            </div>` : ''}
            <div class="coop-panel-section">
                <div class="coop-section-label">${_vsMode ? 'PLAYERS' : 'TEAM'}</div>
                <div class="coop-panel-players" id="coopPanelPlayers"></div>
            </div>
            <div class="coop-panel-section">
                <div class="coop-section-label">ACTIVITY</div>
                <div class="coop-panel-activity" id="coopPanelActivity">
                    <div class="coop-activity-empty">No activity yet...</div>
                </div>
            </div>
            ${CoOpSync.isHost ? `
            <div class="coop-panel-section coop-panel-host-controls">
                <button class="coop-panel-disband" id="coopPanelDisband">${_vsMode ? 'End Battle' : 'Disband Squad'}</button>
            </div>` : ''}
        `;

        document.querySelector('.arena-desktop').appendChild(_panelEl);

        document.getElementById('coopPanelClose').addEventListener('click', () => toggle(false));

        // Disband button (host only)
        const disbandBtn = document.getElementById('coopPanelDisband');
        if (disbandBtn) {
            disbandBtn.addEventListener('click', () => {
                if (disbandBtn.dataset.confirm === 'true') {
                    CoOpSync.disbandSession();
                    return;
                }
                disbandBtn.dataset.confirm = 'true';
                disbandBtn.textContent = 'Confirm Disband';
                disbandBtn.classList.add('confirm');
                setTimeout(() => {
                    if (disbandBtn.dataset.confirm === 'true') {
                        disbandBtn.dataset.confirm = '';
                        disbandBtn.textContent = 'Disband Squad';
                        disbandBtn.classList.remove('confirm');
                    }
                }, 3000);
            });
        }
    }

    function _buildToggleButton() {
        _toggleBtn = document.createElement('button');
        _toggleBtn.className = 'coop-toggle-btn';
        _toggleBtn.innerHTML = '&#9876;'; // Crossed swords
        _toggleBtn.title = 'Toggle Co-Op Panel';
        _toggleBtn.addEventListener('click', () => toggle());

        document.querySelector('.arena-desktop').appendChild(_toggleBtn);
    }

    function _buildTaskbarIndicator() {
        const taskbarLeft = document.querySelector('.taskbar-left');
        if (!taskbarLeft) return;

        const label = _vsMode ? 'VS' : 'CO-OP';
        const indicator = document.createElement('span');
        indicator.className = 'coop-taskbar-indicator' + (_vsMode ? ' vs-indicator' : '');
        indicator.id = 'coopTaskbarIndicator';
        indicator.innerHTML = `<span class="coop-dot online"></span> ${label}`;
        indicator.addEventListener('click', () => toggle());
        taskbarLeft.appendChild(indicator);
    }

    // ────────────────────────────────────────────────
    // TOGGLE PANEL
    // ────────────────────────────────────────────────

    function toggle(forceState) {
        _isOpen = forceState !== undefined ? forceState : !_isOpen;
        _panelEl.classList.toggle('open', _isOpen);
        _toggleBtn.classList.toggle('active', _isOpen);
    }

    // ────────────────────────────────────────────────
    // RENDER PLAYERS
    // ────────────────────────────────────────────────

    function _renderPlayers(players) {
        const container = document.getElementById('coopPanelPlayers');
        if (!container) return;

        const entries = Object.entries(players || {});

        if (_vsMode) {
            // Group by team
            const alpha = entries.filter(([_, p]) => p.teamId === 'alpha');
            const bravo = entries.filter(([_, p]) => p.teamId === 'bravo');

            const renderGroup = (teamEntries, label) => {
                let html = `<div class="vs-player-group-label">${label}</div>`;
                teamEntries.forEach(([pid, p]) => {
                    const isYou = pid === CoOpSync.playerId;
                    const stale = (Date.now() - (p.lastSeen || 0)) > 30000;
                    const online = p.online && !stale;
                    html += `
                        <div class="coop-panel-player ${online ? 'online' : 'offline'}">
                            <span class="coop-dot ${online ? 'online' : ''}"></span>
                            <span class="coop-panel-player-name">${_escHtml(p.name || 'Unknown')}${isYou ? ' (you)' : ''}</span>
                            ${p.isHost ? '<span class="coop-panel-player-badge">HOST</span>' : ''}
                        </div>
                    `;
                });
                return html;
            };

            container.innerHTML = renderGroup(alpha, 'ALPHA') + renderGroup(bravo, 'BRAVO');
        } else {
            container.innerHTML = entries.map(([pid, p]) => {
                const isYou = pid === CoOpSync.playerId;
                const stale = (Date.now() - (p.lastSeen || 0)) > 30000;
                const online = p.online && !stale;

                return `
                    <div class="coop-panel-player ${online ? 'online' : 'offline'}">
                        <span class="coop-dot ${online ? 'online' : ''}"></span>
                        <span class="coop-panel-player-name">${_escHtml(p.name || 'Unknown')}${isYou ? ' (you)' : ''}</span>
                        ${p.isHost ? '<span class="coop-panel-player-badge">HOST</span>' : ''}
                    </div>
                `;
            }).join('');
        }
    }

    // ────────────────────────────────────────────────
    // RENDER ACTIVITY FEED
    // ────────────────────────────────────────────────

    function _renderActivity(activities) {
        const container = document.getElementById('coopPanelActivity');
        if (!container) return;

        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="coop-activity-empty">No activity yet...</div>';
            return;
        }

        container.innerHTML = activities.map(a => {
            const icon = _activityIcon(a.action);
            const time = _formatTime(a.timestamp);
            const teamTag = _vsMode && a.teamId
                ? `<span class="coop-activity-team ${a.teamId}">${a.teamId === 'alpha' ? 'A' : 'B'}</span>`
                : '';
            return `
                <div class="coop-activity-item ${a.action}${_vsMode && a.teamId ? ' team-' + a.teamId : ''}">
                    ${teamTag}
                    <span class="coop-activity-icon">${icon}</span>
                    <div class="coop-activity-content">
                        <span class="coop-activity-player">${_escHtml(a.player)}</span>
                        <span class="coop-activity-detail">${_escHtml(a.detail)}</span>
                    </div>
                    <span class="coop-activity-time">${time}</span>
                </div>
            `;
        }).join('');

        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    function _activityIcon(action) {
        const icons = {
            flag_captured: '\u2691',   // Flag
            wrong_flag: '\u2716',      // X
            hint_revealed: '\u2139',   // Info
            player_joined: '\u2192',   // Arrow
            player_left: '\u2190',     // Arrow
            player_reconnected: '\u2192',
            game_started: '\u25B6',    // Play
            battle_started: '\u2694',  // Swords
            surrender: '\u2690',       // White flag
            host_migrated: '\u2605'    // Star
        };
        return icons[action] || '\u2022';
    }

    function _formatTime(timestamp) {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // ────────────────────────────────────────────────
    // VS SCOREBOARD (live team scores)
    // ────────────────────────────────────────────────

    function _renderVsScoreboard(teams) {
        if (!teams) return;

        for (const tid of ['alpha', 'bravo']) {
            const el = document.getElementById(`vsSb${tid.charAt(0).toUpperCase() + tid.slice(1)}`);
            if (!el) continue;

            const state = teams[tid]?.state || {};
            const flagCount = (state.flagsFound || []).length;
            const name = teams[tid]?.name || `Team ${tid.charAt(0).toUpperCase() + tid.slice(1)}`;
            const completed = state.completed;

            el.innerHTML = `
                <span class="vs-sb-name">${_escHtml(name)}</span>
                <span class="vs-sb-score${completed ? ' completed' : ''}">${state.score || 0}</span>
                <span class="vs-sb-flags">${flagCount} flag${flagCount !== 1 ? 's' : ''}</span>
            `;
        }
    }

    // ────────────────────────────────────────────────
    // TASKBAR INDICATOR UPDATE
    // ────────────────────────────────────────────────

    function _updateTaskbarIndicator(players) {
        const indicator = document.getElementById('coopTaskbarIndicator');
        if (!indicator) return;

        const entries = Object.entries(players || {});
        const online = entries.filter(([_, p]) => p.online && (Date.now() - (p.lastSeen || 0)) < 30000);
        const allOnline = online.length === entries.length && entries.length >= 2;
        const label = _vsMode ? 'VS' : 'CO-OP';

        indicator.innerHTML = `<span class="coop-dot ${allOnline ? 'online' : 'partial'}"></span> ${label} (${online.length}/${entries.length})`;
    }

    // ────────────────────────────────────────────────
    // TEAM FLASH NOTIFICATIONS
    // ────────────────────────────────────────────────

    const FLASH_ACTIONS = {
        flag_captured: { type: 'success', icon: '\u2691', verb: 'captured a flag' },
        wrong_flag:    { type: 'danger',  icon: '\u2716', verb: 'submitted a wrong flag' },
        hint_revealed: { type: 'warning', icon: '\u2139', verb: 'used a hint' },
        player_joined: { type: 'info',    icon: '\u2192', verb: 'joined' },
        player_left:   { type: 'info',    icon: '\u2190', verb: 'disconnected' },
        player_reconnected: { type: 'info', icon: '\u2192', verb: 'reconnected' },
        host_migrated: { type: 'warning', icon: '\u2605', verb: null },
        battle_started: { type: 'info',   icon: '\u2694', verb: 'started the battle' },
        surrender:     { type: 'danger',  icon: '\u2690', verb: 'surrendered' }
    };

    function _flashTeamNotifications(activities) {
        if (!activities || activities.length === 0) return;

        // First load — seed the seen set, don't flash
        if (!_initialLoadDone) {
            _initialLoadDone = true;
            activities.forEach(a => _seenActivityIds.add(a.id));
            return;
        }

        const myTeam = CoOpSync.teamId;

        for (const a of activities) {
            if (_seenActivityIds.has(a.id)) continue;
            _seenActivityIds.add(a.id);

            // Skip our own actions
            if (a.playerId === CoOpSync.playerId) continue;

            const config = FLASH_ACTIONS[a.action];
            if (!config) continue;

            let msg = config.verb
                ? `${a.player} ${config.verb}`
                : a.detail;

            // VS: tag cross-team activities for psychological pressure
            let type = config.type;
            if (_vsMode && a.teamId && a.teamId !== myTeam) {
                const opTeamName = a.teamId === 'alpha' ? 'Alpha' : 'Bravo';
                msg = `[${opTeamName}] ${msg}`;
                // Opponent flag captures feel more urgent
                if (a.action === 'flag_captured') {
                    type = 'danger';
                }
            }

            if (typeof BoxEngine !== 'undefined') {
                BoxEngine.notify(`${config.icon} ${msg}`, type);
            }
        }
    }

    // ────────────────────────────────────────────────
    // SHARED NOTIFICATION (co-op specific)
    // ────────────────────────────────────────────────

    function notifyPartner(message, type) {
        if (typeof BoxEngine !== 'undefined') {
            BoxEngine.notify(`[Team] ${message}`, type || 'info');
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
        init,
        toggle,
        notifyPartner,
        get isOpen() { return _isOpen; }
    };
})();
