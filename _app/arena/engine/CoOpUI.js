/* ============================================================
   CTF ARENA — CoOpUI.js
   In-game co-op interface: activity panel sidebar,
   player status indicators, shared notifications.
   ============================================================ */

const CoOpUI = (function() {
    'use strict';

    let _panelEl = null;
    let _toggleBtn = null;
    let _isOpen = false;

    // ────────────────────────────────────────────────
    // INIT — Called after BoxEngine.init when co-op is active
    // ────────────────────────────────────────────────

    function init() {
        _buildPanel();
        _buildToggleButton();
        _buildTaskbarIndicator();

        // Subscribe to activity feed
        CoOpSync.subscribeToActivity((activities) => {
            _renderActivity(activities);
        });

        // Subscribe to player changes
        CoOpSync.onPlayersChange((players) => {
            _renderPlayers(players);
            _updateTaskbarIndicator(players);
        });
    }

    // ────────────────────────────────────────────────
    // BUILD DOM
    // ────────────────────────────────────────────────

    function _buildPanel() {
        _panelEl = document.createElement('div');
        _panelEl.className = 'coop-panel';
        _panelEl.id = 'coopPanel';
        _panelEl.innerHTML = `
            <div class="coop-panel-header">
                <span class="coop-panel-title">CO-OP</span>
                <span class="coop-panel-room">${CoOpSync.roomCode || ''}</span>
                <button class="coop-panel-close" id="coopPanelClose">&times;</button>
            </div>
            <div class="coop-panel-section">
                <div class="coop-section-label">TEAM</div>
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
                <button class="coop-panel-disband" id="coopPanelDisband">Disband Squad</button>
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

        const indicator = document.createElement('span');
        indicator.className = 'coop-taskbar-indicator';
        indicator.id = 'coopTaskbarIndicator';
        indicator.innerHTML = `<span class="coop-dot online"></span> CO-OP`;
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
            return `
                <div class="coop-activity-item ${a.action}">
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
            game_started: '\u25B6'     // Play
        };
        return icons[action] || '\u2022';
    }

    function _formatTime(timestamp) {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

        indicator.innerHTML = `<span class="coop-dot ${allOnline ? 'online' : 'partial'}"></span> CO-OP (${online.length}/${entries.length})`;
    }

    // ────────────────────────────────────────────────
    // SHARED NOTIFICATION (co-op specific)
    // ────────────────────────────────────────────────

    function notifyPartner(message, type) {
        // This creates a notification styled for co-op context
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
