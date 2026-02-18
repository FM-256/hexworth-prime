/* ============================================================
   CTF ARENA — BoxEngine.js
   Core orchestrator: boot, desktop, windows, state, scoring,
   flags, hints, notifications, god mode
   ============================================================ */

const BoxEngine = {
    config: null,
    state: null,
    _windows: {},
    _windowOrder: [],
    _zIndex: 100,
    _clockInterval: null,
    _notifQueue: [],
    _notifCount: 0,
    _scoreDetailOpen: false,

    // ────────────────────────────────────────────────
    // INIT
    // ────────────────────────────────────────────────

    init(config) {
        this.config = config;
        this._coOpMode = false;
        this._vsMode = false;

        // Check if co-op mode is available
        if (typeof CoOpLobby !== 'undefined') {
            // Show lobby to choose Solo, Co-Op, or VS
            CoOpLobby.show(config, (result) => {
                if (result.mode === 'coop') {
                    this._coOpMode = true;
                    this.config.coOpMode = true;
                } else if (result.mode === 'vs') {
                    this._coOpMode = true; // VS uses co-op infra
                    this._vsMode = true;
                    this.config.coOpMode = true;
                    this.config.vsMode = true;
                }
                this._initWithMode();
            });
        } else {
            // No co-op scripts loaded — solo mode directly
            this._initWithMode();
        }
    },

    _initWithMode() {
        const config = this.config;
        this.load();

        // Set accent color
        document.documentElement.style.setProperty('--box-accent', config.accent || '#3498db');

        // Build DOM shell
        this._buildDOM();

        // Setup keyboard listeners
        this._setupGodMode();
        this._setupKeys();

        if (this._coOpMode) {
            // Co-op/VS: sync state via Firestore
            CoOpSync.subscribeToState((state) => {
                this.state = { ...this._defaults(), ...state };
                this._updateScoreBadge();
                this._syncFlagBadges();
                this._renderHints();
                if (state.completed && !this._completionShown) {
                    this._completionShown = true;
                    if (this._vsMode) {
                        // VS: wait for winner determination via onVsWinner
                    } else {
                        this._showCompletion(0);
                    }
                }
            });

            // VS: listen for winner
            if (this._vsMode) {
                CoOpSync.onVsWinner((winnerId, teams) => {
                    if (this._vsWinnerShown) return;
                    this._vsWinnerShown = true;
                    const myTeam = CoOpSync.teamId;
                    const won = winnerId === myTeam;
                    this._showVsResult(won, winnerId, teams);
                });
            }

            // Init co-op/vs UI panel
            if (typeof CoOpUI !== 'undefined') {
                CoOpUI.init(this._vsMode);
            }
        } else {
            // Solo: cross-tab sync via localStorage
            window.addEventListener('storage', (e) => {
                if (e.key === config.storageKey) {
                    this.state = JSON.parse(e.newValue) || this._defaults();
                    this._updateScoreBadge();
                }
            });
        }

        window.addEventListener('beforeunload', () => this.save());

        // If state was previously saved (returning user), skip boot and go to desktop
        if (this.state.booted) {
            this._showDesktop();
        } else {
            this._startBoot();
        }

        const modeLabel = this._vsMode ? '(VS)' : this._coOpMode ? '(CO-OP)' : '(SOLO)';
        console.log(`%c[ARENA] BoxEngine initialized: ${config.title} ${modeLabel}`, 'color: #3498db');
    },

    // ────────────────────────────────────────────────
    // STATE MANAGEMENT
    // ────────────────────────────────────────────────

    _defaults() {
        return {
            score: this.config.scoring?.base || 1000,
            flagsFound: [],
            hintsUsed: [],
            wrongFlags: 0,
            startTime: Date.now(),
            elapsed: 0,
            completed: false,
            godMode: false,
            booted: false,
            notes: '',
            events: []  // Research instrumentation — timestamped action log
        };
    },

    // ────────────────────────────────────────────────
    // RESEARCH INSTRUMENTATION (Sprint AR-14)
    // ────────────────────────────────────────────────

    _logEvent(type, data) {
        if (!this.state) return;
        if (!this.state.events) this.state.events = [];
        this.state.events.push({
            t: Date.now(),
            elapsed: this.state.startTime ? Date.now() - this.state.startTime : 0,
            type: type,
            data: data || {}
        });
    },

    exportEventLog() {
        if (!this.state || !this.state.godMode) return;
        const events = this.state.events || [];
        const blob = JSON.stringify(events, null, 2);
        console.log('[BoxEngine] Event Log (' + events.length + ' events):');
        console.log(blob);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(blob);
            this.notify('Event log copied to clipboard (' + events.length + ' events)', 'success');
        }
    },

    load() {
        if (this._coOpMode) {
            // Co-op: state comes from Firestore via subscription
            // Use defaults until first snapshot arrives
            this.state = this._defaults();
            return;
        }

        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                this.state = { ...this._defaults(), ...JSON.parse(saved) };
            } else {
                this.state = this._defaults();
            }
        } catch {
            this.state = this._defaults();
        }
    },

    save() {
        if (!this.state) return;
        this.state.elapsed = Date.now() - this.state.startTime;

        if (this._coOpMode) {
            // Co-op: push state to Firestore
            CoOpSync.updateState(this.state);
        } else {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.state));
        }
    },

    reset() {
        this.state = this._defaults();
        this.save();
        location.reload();
    },

    // ────────────────────────────────────────────────
    // DOM CONSTRUCTION
    // ────────────────────────────────────────────────

    _buildDOM() {
        const arena = document.getElementById('arena');
        arena.innerHTML = '';

        // God mode banner
        const godBanner = document.createElement('div');
        godBanner.className = 'god-banner';
        godBanner.textContent = '// GOD MODE — All flags visible, hints free //';
        document.body.appendChild(godBanner);

        // Boot screen (created but may not be used)
        this._bootEl = document.createElement('div');
        this._bootEl.className = 'boot-screen';
        this._bootEl.innerHTML = '<div class="boot-text" id="bootText"></div><div class="boot-skip">Click or press any key to skip</div>';
        arena.appendChild(this._bootEl);

        // Desktop
        this._desktopEl = document.createElement('div');
        this._desktopEl.className = 'arena-desktop';
        this._desktopEl.innerHTML = '<div class="desktop-icons" id="desktopIcons"></div>';
        arena.appendChild(this._desktopEl);

        // Taskbar
        const taskbar = document.createElement('div');
        taskbar.className = 'arena-taskbar';
        taskbar.innerHTML = `
            <div class="taskbar-left">
                <span class="taskbar-box-name">${this._escHtml(this.config.title || 'CTF Arena')}</span>
            </div>
            <div class="taskbar-center" id="taskbarCenter"></div>
            <div class="taskbar-right">
                <span class="taskbar-clock" id="taskbarClock"></span>
                <span class="taskbar-score" id="taskbarScore" title="Click for details">SCORE: ${this.state.score}</span>
                <button class="taskbar-flag-btn" id="taskbarFlagBtn">SUBMIT FLAG</button>
            </div>
        `;
        this._desktopEl.appendChild(taskbar);

        // Score detail panel
        const scorePanel = document.createElement('div');
        scorePanel.className = 'score-detail-panel';
        scorePanel.id = 'scoreDetailPanel';
        this._desktopEl.appendChild(scorePanel);

        // Flag submission modal
        this._buildFlagModal(arena);

        // Hint panel
        this._buildHintPanel(arena);

        // Completion overlay
        this._buildCompletionOverlay(arena);

        // Desktop icons
        this._buildDesktopIcons();

        // Taskbar events
        document.getElementById('taskbarScore').addEventListener('click', () => this._toggleScoreDetail());
        document.getElementById('taskbarFlagBtn').addEventListener('click', () => this._openFlagModal());

        // Clock
        this._startClock();

        // Update state display
        this._updateScoreBadge();

        // Restore god mode if active
        if (this.state.godMode) {
            document.body.classList.add('god-mode');
        }
    },

    _buildDesktopIcons() {
        const container = document.getElementById('desktopIcons');
        const icons = this.config.desktop?.icons || [];

        icons.forEach(icon => {
            const el = document.createElement('div');
            el.className = 'desktop-icon';
            el.innerHTML = `
                <span class="icon-emoji">${icon.icon}</span>
                <span class="icon-label">${this._escHtml(icon.label)}</span>
            `;
            el.addEventListener('dblclick', () => this._launchApp(icon));
            el.addEventListener('click', () => {
                container.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');
            });
            container.appendChild(el);
        });
    },

    _buildFlagModal(parent) {
        const overlay = document.createElement('div');
        overlay.className = 'flag-modal-overlay';
        overlay.id = 'flagModalOverlay';

        const flags = this.config.flags || [];
        const badgesHtml = flags.map(f =>
            `<span class="flag-badge" id="flagBadge_${f.id}">${this._escHtml(f.id)}.txt</span>`
        ).join('');

        overlay.innerHTML = `
            <div class="flag-modal">
                <h3>&#9873; Submit Flag</h3>
                <div class="flag-badges">${badgesHtml}</div>
                <input type="text" class="flag-modal-input" id="flagModalInput" placeholder="flag{...}" autocomplete="off">
                <div class="flag-modal-btns">
                    <button class="flag-modal-submit" id="flagModalSubmit">Submit</button>
                    <button class="flag-modal-cancel" id="flagModalCancel">Cancel</button>
                </div>
                <div class="flag-modal-msg" id="flagModalMsg"></div>
            </div>
        `;

        parent.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this._closeFlagModal();
        });

        document.getElementById('flagModalSubmit').addEventListener('click', () => this.submitFlag());
        document.getElementById('flagModalCancel').addEventListener('click', () => this._closeFlagModal());

        // Update badge states
        this.state.flagsFound.forEach(id => {
            const badge = document.getElementById('flagBadge_' + id);
            if (badge) badge.classList.add('found');
        });
    },

    _buildHintPanel(parent) {
        const overlay = document.createElement('div');
        overlay.className = 'hint-overlay';
        overlay.id = 'hintOverlay';
        overlay.addEventListener('click', () => this._closeHints());
        parent.appendChild(overlay);

        const panel = document.createElement('div');
        panel.className = 'hint-panel';
        panel.id = 'hintPanel';
        panel.innerHTML = `
            <div class="hint-panel-header">
                <h3>Hints</h3>
                <button class="hint-panel-close" id="hintPanelClose">&times;</button>
            </div>
            <div class="hint-list" id="hintList"></div>
        `;
        parent.appendChild(panel);

        document.getElementById('hintPanelClose').addEventListener('click', () => this._closeHints());
        this._renderHints();
    },

    _buildCompletionOverlay(parent) {
        const overlay = document.createElement('div');
        overlay.className = 'completion-overlay';
        overlay.id = 'completionOverlay';
        overlay.innerHTML = `
            <div class="completion-card">
                <h2>&#9878; BOX PWNED</h2>
                <div class="box-subtitle" id="completionSubtitle"></div>
                <div class="final-score" id="completionScore"></div>
                <div class="score-breakdown" id="completionBreakdown"></div>
                <div class="lore-outro" id="completionLore"></div>
                <button id="completionClose">Continue</button>
            </div>
        `;
        parent.appendChild(overlay);

        document.getElementById('completionClose').addEventListener('click', () => {
            overlay.classList.remove('active');
        });

        // VS result overlay (hidden by default, shown when VS match ends)
        const vsOverlay = document.createElement('div');
        vsOverlay.className = 'vs-result-overlay';
        vsOverlay.id = 'vsResultOverlay';
        vsOverlay.innerHTML = `
            <div class="vs-result-card">
                <div class="vs-result-banner" id="vsResultBanner"></div>
                <div class="vs-result-title" id="vsResultTitle"></div>
                <div class="vs-result-subtitle" id="vsResultSubtitle"></div>
                <div class="vs-result-scores" id="vsResultScores"></div>
                <button id="vsResultClose">Continue</button>
            </div>
        `;
        parent.appendChild(vsOverlay);

        document.getElementById('vsResultClose').addEventListener('click', () => {
            vsOverlay.classList.remove('active');
        });
    },

    _showVsResult(won, winnerId, teams) {
        // Report assessment on VS completion
        if (won) this._reportCompletion();
        const overlay = document.getElementById('vsResultOverlay');
        if (!overlay) return;

        const myTeam = CoOpSync.teamId;
        const opponentTeam = CoOpSync.getOpponentTeam();
        const myState = teams[myTeam]?.state || {};
        const opState = teams[opponentTeam]?.state || {};

        document.getElementById('vsResultBanner').textContent = won ? 'VICTORY' : 'DEFEATED';
        document.getElementById('vsResultBanner').className = 'vs-result-banner ' + (won ? 'victory' : 'defeat');
        document.getElementById('vsResultTitle').textContent = this.config.title || '';
        document.getElementById('vsResultSubtitle').textContent = won
            ? `${teams[myTeam]?.name || 'Your team'} captured all flags first!`
            : `${teams[winnerId]?.name || 'Opponent'} captured all flags first.`;

        const myFlags = (myState.flagsFound || []).length;
        const opFlags = (opState.flagsFound || []).length;
        const totalFlags = (this.config.flags || []).length;

        document.getElementById('vsResultScores').innerHTML = `
            <div class="vs-score-row your-team">
                <span class="vs-score-team">${this._escHtml(teams[myTeam]?.name || 'Your Team')}</span>
                <span class="vs-score-flags">${myFlags}/${totalFlags} flags</span>
                <span class="vs-score-points">${myState.score || 0}</span>
            </div>
            <div class="vs-score-row opponent-team">
                <span class="vs-score-team">${this._escHtml(teams[opponentTeam]?.name || 'Opponent')}</span>
                <span class="vs-score-flags">${opFlags}/${totalFlags} flags</span>
                <span class="vs-score-points">${opState.score || 0}</span>
            </div>
        `;

        this._closeFlagModal();
        overlay.classList.add('active');
    },

    // ────────────────────────────────────────────────
    // BOOT SEQUENCE
    // ────────────────────────────────────────────────

    _startBoot() {
        if (this.state.godMode) {
            this.state.booted = true;
            this.save();
            this._showDesktop();
            return;
        }

        this._bootEl.style.display = 'flex';
        const textEl = document.getElementById('bootText');
        const bootLines = this.config.boot?.biosLines || ['Booting...'];
        let lineIdx = 0;
        let charIdx = 0;
        let currentText = '';
        const speed = 12;

        const skipBoot = () => {
            this._bootEl.removeEventListener('click', skipBoot);
            document.removeEventListener('keydown', skipBoot);
            this.state.booted = true;
            this.save();
            this._bootEl.classList.add('fade-out');
            setTimeout(() => {
                this._bootEl.style.display = 'none';
                this._showDesktop();
            }, 600);
        };

        this._bootEl.addEventListener('click', skipBoot);
        document.addEventListener('keydown', skipBoot);

        const typeLine = () => {
            if (lineIdx >= bootLines.length) {
                // Move to GRUB
                setTimeout(() => this._showGrub(skipBoot), 400);
                return;
            }

            const line = bootLines[lineIdx];
            if (charIdx < line.length) {
                currentText += line[charIdx];
                textEl.innerHTML = currentText + '<span class="boot-cursor"></span>';
                charIdx++;
                setTimeout(typeLine, speed + Math.random() * 10);
            } else {
                currentText += '\n';
                lineIdx++;
                charIdx = 0;
                setTimeout(typeLine, 80 + Math.random() * 60);
            }
        };

        typeLine();
    },

    _showGrub(skipHandler) {
        this._bootEl.style.display = 'none';

        const grub = document.createElement('div');
        grub.className = 'grub-screen';
        const entries = this.config.boot?.grubEntries || ['Kali GNU/Linux'];
        grub.innerHTML = `
            <div class="grub-box">
                <div class="grub-title">GNU GRUB version 2.06</div>
                ${entries.map((e, i) => `<div class="grub-entry ${i === 0 ? 'selected' : ''}">${this._escHtml(e)}</div>`).join('')}
            </div>
        `;
        document.getElementById('arena').appendChild(grub);

        setTimeout(() => {
            grub.remove();
            this._showLogin(skipHandler);
        }, 1200);
    },

    _showLogin(skipHandler) {
        const login = document.createElement('div');
        login.className = 'login-screen';
        const user = this.config.boot?.loginUser || 'kali';
        login.innerHTML = `
            <div class="login-text">${this._escHtml(user)} login: <span class="typed">${this._escHtml(user)}</span></div>
            <div class="login-text">Password: <span class="typed login-password">********</span></div>
        `;
        document.getElementById('arena').appendChild(login);

        setTimeout(() => {
            const msg = document.createElement('div');
            msg.className = 'login-text';
            msg.innerHTML = '<span class="typed" style="color:#00ff00;">Last login: ' + new Date().toUTCString() + '</span>';
            login.appendChild(msg);
        }, 600);

        setTimeout(() => {
            login.remove();
            this._bootEl.removeEventListener('click', skipHandler);
            document.removeEventListener('keydown', skipHandler);
            this.state.booted = true;
            this.save();
            this._showDesktop();
        }, 1800);
    },

    _showDesktop() {
        this._bootEl.style.display = 'none';
        this._desktopEl.classList.add('active');
        // Log box_start on first desktop show (fresh session only)
        if (this.state.events && this.state.events.length === 0) {
            this._logEvent('box_start', { boxId: this.config.storageKey || 'unknown' });
        }
    },

    // ────────────────────────────────────────────────
    // WINDOW MANAGER
    // ────────────────────────────────────────────────

    openWindow(appId, title, icon, contentEl) {
        // If already open, focus it
        if (this._windows[appId]) {
            this._focusWindow(appId);
            const win = this._windows[appId];
            if (win.el.classList.contains('minimized')) {
                win.el.classList.remove('minimized');
            }
            return win;
        }

        const win = document.createElement('div');
        win.className = 'arena-window focused';
        win.dataset.app = appId;

        // Position: cascade from top-left
        const count = Object.keys(this._windows).length;
        const top = 30 + (count * 30) % 200;
        const left = 100 + (count * 40) % 300;
        win.style.cssText = `top:${top}px; left:${left}px; width:700px; height:500px; z-index:${++this._zIndex};`;

        win.innerHTML = `
            <div class="window-titlebar">
                <span class="win-icon">${icon || ''}</span>
                <span class="win-title">${this._escHtml(title)}</span>
                <div class="win-buttons">
                    <button class="win-btn win-btn-minimize" data-action="minimize"></button>
                    <button class="win-btn win-btn-close" data-action="close"></button>
                </div>
            </div>
            <div class="window-content"></div>
            <div class="window-resize"></div>
        `;

        // Append content
        win.querySelector('.window-content').appendChild(contentEl);

        // Events
        win.addEventListener('mousedown', () => this._focusWindow(appId));
        win.querySelector('[data-action="close"]').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeWindow(appId);
        });
        win.querySelector('[data-action="minimize"]').addEventListener('click', (e) => {
            e.stopPropagation();
            win.classList.add('minimized');
        });

        // Dragging
        this._makeDraggable(win, win.querySelector('.window-titlebar'));

        // Resizing
        this._makeResizable(win, win.querySelector('.window-resize'));

        this._desktopEl.appendChild(win);
        this._windows[appId] = { el: win, title };
        this._windowOrder.push(appId);

        // Add taskbar button
        this._addTaskbarButton(appId, title, icon);

        this._logEvent('window_open', { type: appId });
        return this._windows[appId];
    },

    closeWindow(appId) {
        const win = this._windows[appId];
        if (!win) return;
        win.el.remove();
        delete this._windows[appId];
        this._windowOrder = this._windowOrder.filter(id => id !== appId);

        // Remove taskbar button
        const btn = document.getElementById('taskBtn_' + appId);
        if (btn) btn.remove();

        // Callback for cleanup
        if (typeof this.config.onWindowClose === 'function') {
            this.config.onWindowClose(appId);
        }
    },

    _focusWindow(appId) {
        Object.values(this._windows).forEach(w => w.el.classList.remove('focused'));
        const win = this._windows[appId];
        if (win) {
            win.el.classList.add('focused');
            win.el.style.zIndex = ++this._zIndex;
        }
        // Update taskbar
        document.querySelectorAll('.taskbar-app-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('taskBtn_' + appId);
        if (btn) btn.classList.add('active');
    },

    _addTaskbarButton(appId, title, icon) {
        const center = document.getElementById('taskbarCenter');
        const btn = document.createElement('button');
        btn.className = 'taskbar-app-btn active';
        btn.id = 'taskBtn_' + appId;
        btn.textContent = (icon || '') + ' ' + title;
        btn.addEventListener('click', () => {
            const win = this._windows[appId];
            if (!win) return;
            if (win.el.classList.contains('minimized')) {
                win.el.classList.remove('minimized');
                this._focusWindow(appId);
            } else if (win.el.classList.contains('focused')) {
                win.el.classList.add('minimized');
            } else {
                this._focusWindow(appId);
            }
        });
        center.appendChild(btn);

        // Deactivate others
        document.querySelectorAll('.taskbar-app-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    },

    _makeDraggable(el, handle) {
        let startX, startY, origX, origY;

        handle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('win-btn')) return;
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            origX = el.offsetLeft;
            origY = el.offsetTop;

            const onMove = (e) => {
                el.style.left = (origX + e.clientX - startX) + 'px';
                el.style.top = (origY + e.clientY - startY) + 'px';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    },

    _makeResizable(el, handle) {
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startW = el.offsetWidth;
            const startH = el.offsetHeight;

            const onMove = (e) => {
                el.style.width = Math.max(400, startW + e.clientX - startX) + 'px';
                el.style.height = Math.max(300, startH + e.clientY - startY) + 'px';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    },

    // ────────────────────────────────────────────────
    // APP LAUNCHER
    // ────────────────────────────────────────────────

    _launchApp(iconDef) {
        const appId = iconDef.id;

        switch (iconDef.app) {
            case 'terminal': {
                if (this._windows[appId]) { this._focusWindow(appId); return; }
                const container = document.createElement('div');
                container.className = 'terminal-container';
                this.openWindow(appId, iconDef.label, iconDef.icon, container);
                if (typeof ArenaTerminal !== 'undefined') {
                    ArenaTerminal.init(container, this.config, this);
                }
                break;
            }
            case 'browser': {
                if (this._windows[appId]) { this._focusWindow(appId); return; }
                const container = document.createElement('div');
                container.className = 'browser-container';
                this.openWindow(appId, iconDef.label, iconDef.icon, container);
                if (typeof ArenaBrowser !== 'undefined') {
                    ArenaBrowser.init(container, this.config, this);
                }
                break;
            }
            case 'notes': {
                if (this._windows[appId]) { this._focusWindow(appId); return; }
                const container = document.createElement('div');
                container.className = 'notes-container';
                const ta = document.createElement('textarea');
                ta.placeholder = 'Your notes...';
                ta.value = this.state.notes || '';
                ta.addEventListener('input', () => {
                    this.state.notes = ta.value;
                    this.save();
                });
                container.appendChild(ta);
                this.openWindow(appId, iconDef.label, iconDef.icon, container);
                break;
            }
            case 'flags': {
                this._openFlagModal();
                break;
            }
            case 'hints': {
                this._openHints();
                break;
            }
            default: {
                // Custom app handler from config
                if (typeof this.config.onAppLaunch === 'function') {
                    this.config.onAppLaunch(iconDef, this);
                }
            }
        }
    },

    // ────────────────────────────────────────────────
    // SCORING
    // ────────────────────────────────────────────────

    addScore(points, reason) {
        this.state.score += points;
        if (this.state.score < 0) this.state.score = 0;
        this.save();
        this._updateScoreBadge();
        console.log(`%c[SCORE] ${points > 0 ? '+' : ''}${points}: ${reason} (total: ${this.state.score})`, 'color: #d4a840');
    },

    _updateScoreBadge() {
        const badge = document.getElementById('taskbarScore');
        if (badge) badge.textContent = 'SCORE: ' + this.state.score;
    },

    _toggleScoreDetail() {
        const panel = document.getElementById('scoreDetailPanel');
        if (!panel) return;
        this._scoreDetailOpen = !this._scoreDetailOpen;
        panel.classList.toggle('active', this._scoreDetailOpen);

        if (this._scoreDetailOpen) {
            this._renderScoreDetail(panel);
            // Close on outside click
            const closer = (e) => {
                if (!panel.contains(e.target) && e.target.id !== 'taskbarScore') {
                    this._scoreDetailOpen = false;
                    panel.classList.remove('active');
                    document.removeEventListener('click', closer);
                }
            };
            setTimeout(() => document.addEventListener('click', closer), 10);
        }
    },

    _renderScoreDetail(panel) {
        const s = this.state;
        const scoring = this.config.scoring || {};
        const elapsed = Math.round((Date.now() - s.startTime) / 60000);

        let html = `<h4>Score Breakdown</h4>`;
        html += `<div class="detail-row"><span>Base</span><span>${scoring.base || 1000}</span></div>`;

        s.flagsFound.forEach(id => {
            const flag = (this.config.flags || []).find(f => f.id === id);
            if (flag) html += `<div class="detail-row"><span>${id}.txt</span><span class="pos">+${flag.points}</span></div>`;
        });

        if (s.hintsUsed.length) {
            html += `<div class="detail-row"><span>Hints (${s.hintsUsed.length})</span><span class="neg">${s.hintsUsed.length * (scoring.hintPenalty || -50)}</span></div>`;
        }
        if (s.wrongFlags) {
            html += `<div class="detail-row"><span>Wrong flags (${s.wrongFlags})</span><span class="neg">${s.wrongFlags * (scoring.wrongFlagPenalty || -25)}</span></div>`;
        }

        html += `<div class="detail-row" style="border-top:1px solid #333;padding-top:6px;margin-top:6px;"><span>Time</span><span>${elapsed} min</span></div>`;
        panel.innerHTML = html;
    },

    // ────────────────────────────────────────────────
    // FLAG SYSTEM
    // ────────────────────────────────────────────────

    _openFlagModal() {
        const overlay = document.getElementById('flagModalOverlay');
        overlay.classList.add('active');
        const input = document.getElementById('flagModalInput');
        input.value = '';
        input.focus();
        document.getElementById('flagModalMsg').innerHTML = '';

        // Enter key
        input.onkeydown = (e) => { if (e.key === 'Enter') this.submitFlag(); };
    },

    _closeFlagModal() {
        document.getElementById('flagModalOverlay').classList.remove('active');
    },

    submitFlag() {
        const input = document.getElementById('flagModalInput');
        const msg = document.getElementById('flagModalMsg');
        const raw = input.value.trim();

        if (!raw) {
            msg.innerHTML = '<span style="color:#e74c3c;">Enter a flag to submit.</span>';
            return;
        }

        const flags = this.config.flags || [];

        if (this._coOpMode) {
            // Co-op: atomic Firestore transaction
            const normalized = raw.toLowerCase().trim();
            const matchedFlag = flags.find(f => f.value.toLowerCase() === normalized);

            msg.innerHTML = '<span style="color:#3498db;">Submitting...</span>';

            CoOpSync.submitFlagAtomically(
                matchedFlag?.id || '__wrong__',
                raw,
                flags,
                this.config.scoring
            ).then(result => {
                if (result.success) {
                    this.state = { ...this._defaults(), ...result.newState };
                    this._logEvent('flag_correct', { flagId: matchedFlag?.id, points: result.points, hintsUsed: this.state.hintsUsed.length, elapsed: Date.now() - this.state.startTime });
                    msg.innerHTML = `<span style="color:#2ecc71;">&#10003; ${result.message}</span>`;
                    this.notify(result.message, 'success');
                    this._syncFlagBadges();
                    this._updateScoreBadge();
                    this._reportFlagCapture(matchedFlag?.id, result.points);
                    input.value = '';
                    if (result.completed) {
                        this._completionShown = true;
                        this._reportCompletion();
                        setTimeout(() => this._showCompletion(0), 800);
                    }
                } else {
                    if (result.penalty) {
                        this.state = { ...this._defaults(), ...result.newState };
                        this._updateScoreBadge();
                    }
                    if (result.message !== 'Flag already submitted') {
                        this._logEvent('flag_wrong', { flagId: '__none__', attempt: raw });
                    }
                    const color = result.message === 'Flag already submitted' ? '#3498db' : '#e74c3c';
                    msg.innerHTML = `<span style="color:${color};">${result.message}${result.penalty ? '. ' + result.penalty + ' points' : ''}</span>`;
                }
            });
            return;
        }

        // Solo mode: original logic
        const normalized = raw.toLowerCase().trim();

        for (const flag of flags) {
            if (normalized === flag.value.toLowerCase()) {
                if (this.state.flagsFound.includes(flag.id)) {
                    msg.innerHTML = '<span style="color:#3498db;">Flag already submitted.</span>';
                    return;
                }
                // Found new flag
                this.state.flagsFound.push(flag.id);
                this.addScore(flag.points, `${flag.id}.txt captured`);
                this._logEvent('flag_correct', { flagId: flag.id, points: flag.points, hintsUsed: this.state.hintsUsed.length, elapsed: Date.now() - this.state.startTime });
                msg.innerHTML = `<span style="color:#2ecc71;">&#10003; ${flag.id}.txt captured! +${flag.points} points</span>`;
                this.notify(`${flag.id}.txt captured! +${flag.points} points`, 'success');
                this._reportFlagCapture(flag.id, flag.points);

                // Update badge
                const badge = document.getElementById('flagBadge_' + flag.id);
                if (badge) badge.classList.add('found');

                input.value = '';
                this._checkCompletion();
                return;
            }
        }

        // Wrong flag
        this.state.wrongFlags++;
        const penalty = this.config.scoring?.wrongFlagPenalty || -25;
        this.addScore(penalty, 'Wrong flag attempt');
        this._logEvent('flag_wrong', { flagId: '__none__', attempt: raw });
        msg.innerHTML = `<span style="color:#e74c3c;">Incorrect flag. ${penalty} points</span>`;
    },

    _checkCompletion() {
        const allFlags = this.config.flags || [];
        const allFound = allFlags.every(f => this.state.flagsFound.includes(f.id));

        if (allFound && !this.state.completed) {
            this.state.completed = true;

            // Speed bonus
            const elapsed = Date.now() - this.state.startTime;
            const scoring = this.config.scoring || {};
            let speedBonus = 0;
            if (scoring.speedBonus && elapsed < scoring.speedBonus.threshold) {
                speedBonus = scoring.speedBonus.points;
                this.addScore(speedBonus, 'Speed bonus');
            }

            this._logEvent('box_complete', {
                score: this.state.score,
                totalTime: elapsed,
                flagsFound: this.state.flagsFound.length,
                hintsUsed: this.state.hintsUsed.length
            });

            this.save();
            this._reportCompletion();

            // Show completion modal
            setTimeout(() => this._showCompletion(speedBonus), 800);
        }
    },

    _showCompletion(speedBonus) {
        const overlay = document.getElementById('completionOverlay');
        const s = this.state;
        const scoring = this.config.scoring || {};
        const elapsed = Math.round((Date.now() - s.startTime) / 60000);

        document.getElementById('completionSubtitle').textContent = this.config.title || '';
        document.getElementById('completionScore').textContent = s.score;

        let html = `<div class="row"><span>Base score</span><span>${scoring.base || 1000}</span></div>`;
        s.flagsFound.forEach(id => {
            const flag = (this.config.flags || []).find(f => f.id === id);
            if (flag) html += `<div class="row"><span>${id}.txt flag</span><span style="color:#2ecc71;">+${flag.points}</span></div>`;
        });
        if (speedBonus) html += `<div class="row"><span>Speed bonus</span><span style="color:#2ecc71;">+${speedBonus}</span></div>`;
        if (s.hintsUsed.length) html += `<div class="row"><span>Hints (${s.hintsUsed.length})</span><span style="color:#e74c3c;">${s.hintsUsed.length * (scoring.hintPenalty || -50)}</span></div>`;
        if (s.wrongFlags) html += `<div class="row"><span>Wrong flags (${s.wrongFlags})</span><span style="color:#e74c3c;">${s.wrongFlags * (scoring.wrongFlagPenalty || -25)}</span></div>`;
        html += `<div class="row total"><span>Time</span><span>${elapsed} min</span></div>`;

        document.getElementById('completionBreakdown').innerHTML = html;
        document.getElementById('completionLore').textContent = this.config.lore?.outro || '';

        this._closeFlagModal();
        overlay.classList.add('active');
    },

    // ────────────────────────────────────────────────
    // HINT SYSTEM
    // ────────────────────────────────────────────────

    _openHints() {
        this._renderHints();
        document.getElementById('hintOverlay').classList.add('active');
        document.getElementById('hintPanel').classList.add('active');
    },

    _closeHints() {
        document.getElementById('hintOverlay').classList.remove('active');
        document.getElementById('hintPanel').classList.remove('active');
    },

    _renderHints() {
        const list = document.getElementById('hintList');
        if (!list) return;
        const hints = this.config.hints || [];
        list.innerHTML = '';

        hints.forEach((hint, idx) => {
            const used = this.state.hintsUsed.includes(hint.id);
            const item = document.createElement('div');
            item.className = 'hint-item ' + (used ? 'revealed' : 'locked');
            item.innerHTML = `
                <div class="hint-item-header">
                    <span class="hint-item-label">Hint ${idx + 1}</span>
                    <span class="hint-item-cost">${used ? 'Used' : hint.penalty + ' pts'}</span>
                </div>
                ${!used ? '<button class="hint-reveal-btn">Reveal Hint</button>' : ''}
                <div class="hint-item-text">${used ? this._escHtml(hint.text) : ''}</div>
            `;

            if (!used) {
                item.querySelector('.hint-reveal-btn').addEventListener('click', () => {
                    this._useHint(hint);
                    this._renderHints();
                });
            }
            list.appendChild(item);
        });
    },

    _useHint(hint) {
        if (this.state.hintsUsed.includes(hint.id)) return;

        if (this._coOpMode) {
            // Co-op: atomic Firestore transaction
            CoOpSync.revealHintAtomically(hint.id, hint.penalty, this.state.godMode).then(result => {
                if (result.success) {
                    this.state = { ...this._defaults(), ...result.newState };
                    this._logEvent('hint_reveal', { flagId: hint.forFlag || hint.id, hintIndex: this.state.hintsUsed.length - 1, penalty: this.state.godMode ? 0 : hint.penalty });
                    this._updateScoreBadge();
                    this._renderHints();
                    this._reportHintReveal(hint.id, hint.penalty);
                    this.notify(`Hint revealed. ${this.state.godMode ? 'No penalty (God Mode)' : hint.penalty + ' points'}`, 'warning');
                }
                // If already used, silently re-render (idempotent)
                if (result.alreadyUsed) {
                    this._renderHints();
                }
            });
            return;
        }

        // Solo mode: original logic
        this.state.hintsUsed.push(hint.id);

        if (!this.state.godMode) {
            this.addScore(hint.penalty, `Hint used: ${hint.id}`);
        }

        this.save();
        this._logEvent('hint_reveal', { flagId: hint.forFlag || hint.id, hintIndex: this.state.hintsUsed.length - 1, penalty: this.state.godMode ? 0 : hint.penalty });
        this._reportHintReveal(hint.id, hint.penalty);
        this.notify(`Hint revealed. ${this.state.godMode ? 'No penalty (God Mode)' : hint.penalty + ' points'}`, 'warning');
    },

    // ────────────────────────────────────────────────
    // NOTIFICATIONS
    // ────────────────────────────────────────────────

    notify(message, type) {
        type = type || 'info';
        const iconMap = { info: '\u2139', success: '\u2713', warning: '\u26A0', danger: '\u2716' };

        const el = document.createElement('div');
        el.className = 'arena-notification ' + type;
        el.innerHTML = `<span class="notif-icon">${iconMap[type] || ''}</span><span class="notif-text">${this._escHtml(message)}</span>`;

        // Stack notifications
        const offset = this._notifCount * 70;
        el.style.top = (20 + offset) + 'px';
        this._notifCount++;

        document.body.appendChild(el);
        el.addEventListener('click', () => { el.classList.add('fade-out'); setTimeout(() => { el.remove(); this._notifCount = Math.max(0, this._notifCount - 1); }, 300); });
        setTimeout(() => {
            el.classList.add('fade-out');
            setTimeout(() => { el.remove(); this._notifCount = Math.max(0, this._notifCount - 1); }, 300);
        }, 5000);
    },

    // ────────────────────────────────────────────────
    // CLOCK
    // ────────────────────────────────────────────────

    _startClock() {
        const tick = () => {
            const el = document.getElementById('taskbarClock');
            if (el) {
                const now = new Date();
                el.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        };
        tick();
        this._clockInterval = setInterval(tick, 30000);
    },

    // ────────────────────────────────────────────────
    // GOD MODE
    // ────────────────────────────────────────────────

    _setupGodMode() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                this._toggleGodMode();
            }
        });
    },

    _toggleGodMode() {
        this.state.godMode = !this.state.godMode;
        document.body.classList.toggle('god-mode', this.state.godMode);
        this.save();
        this._logEvent('god_mode', { enabled: this.state.godMode });

        if (this.state.godMode) {
            this.notify('GOD MODE ACTIVATED — Flags visible, hints free', 'danger');
            // Reveal flag values in console
            (this.config.flags || []).forEach(f => {
                console.log(`%c[GOD MODE] ${f.id}: ${f.value}`, 'color: #e74c3c; font-size: 14px');
            });
        } else {
            this.notify('God mode deactivated', 'info');
        }
    },

    // ────────────────────────────────────────────────
    // KEYBOARD SHORTCUTS
    // ────────────────────────────────────────────────

    _setupKeys() {
        document.addEventListener('keydown', (e) => {
            // Escape closes modals
            if (e.key === 'Escape') {
                const flagModal = document.getElementById('flagModalOverlay');
                if (flagModal.classList.contains('active')) {
                    this._closeFlagModal();
                    return;
                }
                const hintPanel = document.getElementById('hintPanel');
                if (hintPanel.classList.contains('active')) {
                    this._closeHints();
                    return;
                }
            }
        });
    },

    // ────────────────────────────────────────────────
    // UTILITY
    // ────────────────────────────────────────────────

    /**
     * Sync flag badge UI to match current state (for co-op remote updates).
     */
    _syncFlagBadges() {
        (this.config.flags || []).forEach(f => {
            const badge = document.getElementById('flagBadge_' + f.id);
            if (badge) {
                badge.classList.toggle('found', this.state.flagsFound.includes(f.id));
            }
        });
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ────────────────────────────────────────────────
    // ASSESSMENT / INSTRUCTOR INTEGRATION
    // ────────────────────────────────────────────────

    /**
     * Report box completion to instructor analytics pipeline.
     * Safe — all calls wrapped in try/catch and existence checks.
     */
    _reportCompletion() {
        const trackerKey = this.config.trackerKey;
        const boxId = this.config.storageKey || 'unknown';
        const s = this.state;
        const elapsed = Math.round((Date.now() - s.startTime) / 1000);
        const events = s.events || [];

        // Research instrumentation — compute analytics from event log
        const flagEvents = events.filter(e => e.type === 'flag_correct');
        const hintEvents = events.filter(e => e.type === 'hint_reveal');
        const totalCommands = events.filter(e => e.type === 'command').length;
        const totalNavigations = events.filter(e => e.type === 'navigate').length;

        // Average time between flag captures (ms)
        let avgTimeBetweenFlags = 0;
        if (flagEvents.length > 1) {
            const gaps = [];
            for (let i = 1; i < flagEvents.length; i++) {
                gaps.push(flagEvents[i].t - flagEvents[i - 1].t);
            }
            avgTimeBetweenFlags = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
        }

        // Hint effectiveness: time from each hint_reveal to next flag_correct (ms)
        const hintEffectiveness = hintEvents.map(h => {
            const nextFlag = flagEvents.find(f => f.t > h.t);
            return nextFlag ? nextFlag.t - h.t : null;
        }).filter(v => v !== null);

        const researchData = {
            eventLog: events,
            totalCommands,
            totalNavigations,
            avgTimeBetweenFlags,
            hintEffectiveness
        };

        // ProgressManager — marks module complete, awards XP
        try {
            if (typeof ProgressManager !== 'undefined' && trackerKey) {
                ProgressManager.completeModule(trackerKey, 'arena', 'lab', {
                    score: s.score,
                    flags: s.flagsFound.length,
                    hints: s.hintsUsed.length,
                    time: elapsed,
                    ...researchData
                });
            }
        } catch (e) { console.error('[ARENA] ProgressManager error:', e); }

        // GameTracker — records game session stats
        try {
            if (typeof GameTracker !== 'undefined' && trackerKey) {
                GameTracker.record(trackerKey, {
                    result: 'win',
                    timeElapsed: elapsed,
                    commandsUsed: totalCommands,
                    achievementsEarned: s.flagsFound.length,
                    achievementsTotal: (this.config.flags || []).length,
                    ...researchData
                });
            }
        } catch (e) { console.error('[ARENA] GameTracker error:', e); }

        // AssignmentManager — logs activity to Firestore for instructor dashboard
        try {
            if (typeof AssignmentManager !== 'undefined') {
                AssignmentManager.logActivity(null, 'arena_complete', boxId, this.config.title || boxId, {
                    score: s.score,
                    flags: s.flagsFound.length,
                    totalFlags: (this.config.flags || []).length,
                    hints: s.hintsUsed.length,
                    time: elapsed,
                    mode: this._vsMode ? 'vs' : this._coOpMode ? 'coop' : 'solo',
                    ...researchData
                });
            }
        } catch (e) { console.error('[ARENA] AssignmentManager error:', e); }

        console.log(`%c[ARENA] Assessment reported: ${boxId} (${s.score} pts, ${elapsed}s, ${events.length} events)`, 'color: #9b59b6');
    },

    /**
     * Report a flag capture to instructor analytics.
     */
    _reportFlagCapture(flagId, points) {
        try {
            if (typeof AssignmentManager !== 'undefined') {
                const boxId = this.config.storageKey || 'unknown';
                AssignmentManager.logActivity(null, 'arena_flag', boxId, this.config.title || boxId, {
                    flagId, points
                });
            }
        } catch (e) { /* silent */ }
    },

    /**
     * Report a hint reveal to instructor analytics.
     */
    _reportHintReveal(hintId, penalty) {
        try {
            if (typeof AssignmentManager !== 'undefined') {
                const boxId = this.config.storageKey || 'unknown';
                AssignmentManager.logActivity(null, 'arena_hint', boxId, this.config.title || boxId, {
                    hintId, penalty
                });
            }
        } catch (e) { /* silent */ }
    }
};
