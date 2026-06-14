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

        // Dr. Hex mood-ring (Phase 2): mount the floating help button keyed to this
        // box's registryId — the exact id written to flag_attempts/flag_captures, so
        // hexAiAmbientState reads the right CTF activity. 'no-escalate' keeps it
        // calm-and-available on CTF (celebrates on capture; never nags on wrong
        // flags, which are normal exploration). Idempotent. Independent of box DOM
        // (position:fixed on body), so safe to mount here at session start.
        if (config.registryId && !document.querySelector('hex-ai-button')) {
            const fab = document.createElement('hex-ai-button');
            fab.setAttribute('mission-id', config.registryId);
            fab.setAttribute('house', config.house || 'eye');
            fab.setAttribute('no-escalate', '');
            document.body.appendChild(fab);
            const mod = document.createElement('script');
            mod.type = 'module';
            mod.src = '/_lib/HexAIButton.js';
            document.head.appendChild(mod);
        }

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
                // Store player's difficulty choice for _getEffectiveDifficulty()
                if (result.difficulty) {
                    this._difficultyOverride = result.difficulty;
                }
                this._initWithMode();
            });
        } else {
            // No co-op scripts loaded — solo mode directly
            this._initWithMode();
        }
    },

    // Called after mode selection (solo/co-op/VS) — sets up state, security,
    // DOM, and either resumes a saved session or starts the boot sequence.
    _initWithMode() {
        const config = this.config;
        this.load();

        // Generate or restore session seed for flag salting (AR-11)
        if (!this.state._sessionSeed) {
            this.state._sessionSeed = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
            this.save();
        }

        // Lazy-load HatRating.js for box rating after completion
        if (typeof HatRating === 'undefined') {
            const hatScript = document.createElement('script');
            const beScript = document.querySelector('script[src*="BoxEngine"]');
            hatScript.src = beScript ? new URL('HatRating.js', beScript.src).href : '/arena/engine/HatRating.js';
            hatScript.onerror = () => console.warn('[ARENA] HatRating.js failed to load — ratings disabled');
            document.head.appendChild(hatScript);
        }

        // Pre-compute hashed flag values for secure comparison
        this._flagHashes = [];
        this._computeFlagHashes().catch(e => console.error('[ARENA] Flag hash computation failed:', e));

        // Pre-fetch all flag texts from server so the delivered flags cache is
        // populated before the user submits. This is essential for VS/CoOp mode
        // where submitFlagAtomically validates against the cache. Without this,
        // flags that use {{FLAG:}} placeholders aren't in cache until the user
        // triggers the command that reveals them.
        if (config.registryId && config.flags) {
            config.flags.forEach(f => {
                if (!this.getDeliveredFlag(f.id)) {
                    this.requestFlagText(f.id).catch(() => {});
                }
            });
        }

        // DevTools detection — research instrumentation only, does NOT block (AR-11).
        // Uses window size differential heuristic: when DevTools is docked,
        // outerWidth - innerWidth grows beyond 200px. Logged for instructor analytics.
        this._devToolsOpen = false;
        this._devToolsInterval = setInterval(() => {
            const threshold = 200;
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;
            const isOpen = widthDiff || heightDiff;
            if (isOpen && !this._devToolsOpen) {
                this._devToolsOpen = true;
                this._logEvent('devtools_open', {});
                console.warn('%c[ARENA] DevTools detected. Activity logged for research purposes.', 'color: #e74c3c; font-size: 14px;');
            } else if (!isOpen && this._devToolsOpen) {
                this._devToolsOpen = false;
                this._logEvent('devtools_close', {});
            }
        }, 2000);

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

        window.addEventListener('beforeunload', () => {
            this.save();
            // Clean up tutorial auto-hint interval
            if (this._tutorialAutoHintInterval) {
                clearInterval(this._tutorialAutoHintInterval);
            }
            if (!this.state.completed) {
                this._logEvent('session_abandon', {
                    flagsFound: this.state.flagsFound.length,
                    totalFlags: (this.config.flags || []).length,
                    hintsUsed: this.state.hintsUsed.length,
                    score: this.state.score,
                    lastAction: this.state.events?.length ? this.state.events[this.state.events.length - 1] : null
                });
                this.save(); // Save again with abandon event
            }
        });

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

    // Fresh state for a new box session. Score starts at config.scoring.base
    // (default 1000) and gets modified by flag captures (+), hints (-), wrong flags (-).
    _defaults() {
        return {
            score: this.config.scoring?.base || 1000,
            flagsFound: [],
            hintsUsed: [],
            wrongFlags: 0,
            wrongFlagTimestamps: [],
            startTime: Date.now(),
            elapsed: 0,
            completed: false,
            godMode: false,
            booted: false,
            notes: '',
            events: [],  // Research instrumentation — timestamped action log
            _tutorialStep: 0,
            _tutorialComplete: false,
            _tutorialStepStartedAt: 0,  // Timestamp when current step started (for auto-hint in Easy)
            // Phase/layer progression (Sprint AR-15)
            activePhases: [],
            completedPhases: [],
            phaseTimestamps: {}  // { phaseId: { started: ms, completed: ms } }
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

        // Activity-based phase progression: check on navigations and commands
        // so phases with empty requiredFlags advance naturally as the user works
        if (type === 'navigate' || type === 'command') {
            this._checkPhaseProgression(null);
        }
    },

    // Classify a command into CTF attack phases for research analytics.
    // Maps to a simplified kill-chain: RECON -> EXPLOIT -> EXTRACTION.
    _classifyCommand(cmd) {
        const c = cmd.toLowerCase().split(' ')[0];
        const recon = ['nmap', 'whoami', 'id', 'ls', 'pwd', 'find', 'cat', 'head', 'hostname', 'uname', 'file', 'help'];
        const exploit = ['sqlmap', 'curl', 'hydra', 'nikto', 'gobuster', 'dirb', 'wfuzz', 'burp'];
        const extraction = ['cat', 'head', 'tail', 'grep', 'strings', 'xxd', 'base64'];
        // 'cat' could be recon OR extraction — if any flags are found, cat becomes extraction
        if (this.state.flagsFound.length > 0 && extraction.includes(c)) return 'EXTRACTION';
        if (exploit.includes(c)) return 'EXPLOIT';
        if (recon.includes(c)) return 'RECON';
        return 'OTHER';
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

    // ────────────────────────────────────────────────
    // ASSESSMENT REPORT EXPORT (Sprint AR-7)
    // ────────────────────────────────────────────────

    /**
     * Export a CSV assessment report mapping flags to CompTIA cert objectives.
     * God Mode only — instructor/admin feature.
     */
    exportAssessmentReport() {
        if (!this.state || !this.state.godMode) {
            this.notify('Assessment export requires God Mode', 'warning');
            return;
        }

        const config = this.config;
        const s = this.state;
        const objectives = config.certObjectives?.mappings || [];

        if (objectives.length === 0) {
            this.notify('No cert objectives configured for this box', 'warning');
            return;
        }

        const headers = ['Student','Box','Flag ID','Cert Path','Objective Code','Objective Description','Skill','Captured','Hints Used','Time to Capture (s)'];
        const rows = [headers.join(',')];

        for (const obj of objectives) {
            const captured = s.flagsFound.includes(obj.flagId);
            const flagEvent = (s.events || []).find(e => e.type === 'flag_correct' && e.data?.flagId === obj.flagId);
            const timeToCapture = flagEvent ? Math.round(flagEvent.elapsed / 1000) : 'N/A';
            const hintCount = (s.hintsUsed || []).filter(h => {
                const hint = (config.hints || []).find(hi => hi.id === h);
                return hint && hint.forFlag === obj.flagId;
            }).length;

            rows.push([
                'Anonymous',
                `"${config.title}"`,
                obj.flagId,
                config.certObjectives?.certPath || '',
                obj.objective,
                `"${obj.description}"`,
                `"${obj.skill}"`,
                captured ? 'Y' : 'N',
                hintCount,
                timeToCapture
            ].join(','));
        }

        const csv = rows.join('\n');

        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(csv);
            this.notify('Assessment report copied to clipboard', 'success');
        }

        // Also trigger download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${config.storageKey || 'box'}_assessment.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ────────────────────────────────────────────────
    // PRE/POST CONFIDENCE SURVEY (Sprint AR-14)
    // ────────────────────────────────────────────────

    _buildSurveyModal(type, questions, callback) {
        const overlay = document.createElement('div');
        overlay.className = 'survey-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        const title = type === 'pre' ? 'Pre-Challenge Survey' : 'Post-Challenge Survey';
        const subtitle = type === 'pre'
            ? 'Rate how you feel before starting this challenge.'
            : 'Reflect on your experience with this challenge.';

        const labels = ['1', '2', '3', '4', '5'];

        let questionsHtml = '';
        questions.forEach((q, idx) => {
            const lowLabel = q.low || '';
            const highLabel = q.high || '';
            questionsHtml += `
                <div class="survey-question" data-q="${idx + 1}">
                    <div class="survey-question-text">${this._escHtml(q.text)}</div>
                    <div class="survey-likert">
                        <span class="survey-anchor-label">${this._escHtml(lowLabel)}</span>
                        ${labels.map(v => `<button class="survey-likert-btn" data-value="${v}">${v}</button>`).join('')}
                        <span class="survey-anchor-label">${this._escHtml(highLabel)}</span>
                    </div>
                </div>
            `;
        });

        overlay.setAttribute('aria-label', title);
        overlay.innerHTML = `
            <div class="survey-card">
                <h3 class="survey-title">${title}</h3>
                <p class="survey-subtitle">${subtitle}</p>
                <div class="survey-questions">${questionsHtml}</div>
                <div class="survey-actions">
                    <button class="survey-submit-btn" disabled>Submit</button>
                    <button class="survey-skip-btn">Skip</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        const responses = {};
        const submitBtn = overlay.querySelector('.survey-submit-btn');
        const skipBtn = overlay.querySelector('.survey-skip-btn');

        // Likert button click handling
        overlay.querySelectorAll('.survey-question').forEach(qEl => {
            const qKey = qEl.dataset.q;
            qEl.querySelectorAll('.survey-likert-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    qEl.querySelectorAll('.survey-likert-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    responses['q' + qKey] = parseInt(btn.dataset.value);
                    // Enable submit if all questions answered
                    const answered = Object.keys(responses).length;
                    submitBtn.disabled = answered < questions.length;
                });
            });
        });

        const close = (result) => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            callback(result);
        };

        submitBtn.addEventListener('click', () => close(responses));
        skipBtn.addEventListener('click', () => close(null));
    },

    _showPreSurvey(onComplete) {
        const questions = [
            { text: 'How confident are you in solving this type of challenge?', low: 'Not at all', high: 'Extremely' },
            { text: 'How difficult do you expect this challenge to be?', low: 'Very Easy', high: 'Very Hard' },
            { text: 'How familiar are you with the tools needed?', low: 'Not at all', high: 'Expert' },
            { text: 'How anxious do you feel about this challenge?', low: 'Not at all', high: 'Extremely' },
            { text: 'Have you completed a similar challenge before?', low: 'Never', high: 'Many times' }
        ];

        this._buildSurveyModal('pre', questions, (responses) => {
            if (responses) {
                this.state.preSurvey = responses;
                this._logEvent('pre_survey', responses);
                this.save();
            }
            onComplete();
        });
    },

    _showPostSurvey() {
        const questions = [
            { text: 'How confident do you NOW feel about this type of challenge?', low: 'Not at all', high: 'Extremely' },
            { text: 'How difficult was this challenge?', low: 'Very Easy', high: 'Very Hard' },
            { text: 'How well did the hints help you?', low: 'Not at all', high: 'Perfectly' },
            { text: 'How likely are you to attempt a harder challenge?', low: 'Not at all', high: 'Very likely' },
            { text: 'How much did you learn from this challenge?', low: 'Nothing', high: 'A great deal' }
        ];

        this._buildSurveyModal('post', questions, (responses) => {
            if (responses) {
                this.state.postSurvey = responses;
                this._logEvent('post_survey', responses);
                this.save();
            }
        });
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

    _confirmReset() {
        // Build a confirmation dialog
        const existing = document.getElementById('resetConfirmOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'resetConfirmOverlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:12000;';
        overlay.innerHTML = `
            <div style="background:#0d1117;border:1px solid #e74c3c;border-radius:8px;padding:24px 28px;max-width:360px;width:90%;text-align:center;font-family:'Courier New',monospace;">
                <div style="margin-bottom:12px;">
                    <img src="/assets/images/icons/icon-warning.webp" alt="" width="32" height="32">
                </div>
                <div style="color:#e74c3c;font-size:1rem;font-weight:bold;margin-bottom:8px;">Reset Box?</div>
                <div style="color:#9ca3af;font-size:0.78rem;line-height:1.5;margin-bottom:20px;">
                    This will erase all progress, flags, hints, and score for this box. You will start from scratch.
                </div>
                <div style="display:flex;gap:10px;justify-content:center;">
                    <button id="resetConfirmYes" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);border-radius:6px;padding:8px 20px;font-family:inherit;font-size:0.78rem;font-weight:bold;cursor:pointer;">Reset</button>
                    <button id="resetConfirmNo" style="background:none;color:#6b7280;border:1px solid #1e293b;border-radius:6px;padding:8px 20px;font-family:inherit;font-size:0.78rem;cursor:pointer;">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('resetConfirmYes').addEventListener('click', () => this.reset());
        document.getElementById('resetConfirmNo').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
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
        taskbar.setAttribute('role', 'toolbar');
        taskbar.setAttribute('aria-label', 'Arena taskbar');
        taskbar.innerHTML = `
            <div class="taskbar-left">
                <span class="taskbar-box-name">${this._escHtml(this.config.title || 'CTF Arena')}</span>
                <button class="taskbar-reset-btn" id="taskbarResetBtn" title="Reset box progress" aria-label="Reset box">
                    <img src="/assets/images/icons/icon-refresh.webp" alt="" width="14" height="14" style="vertical-align:middle;opacity:0.6;">
                </button>
            </div>
            <div class="taskbar-center" id="taskbarCenter" role="group" aria-label="Open windows"></div>
            <div class="taskbar-right">
                <span class="taskbar-clock" id="taskbarClock" role="timer" aria-label="Elapsed time"></span>
                <span class="taskbar-score" id="taskbarScore" role="status" aria-live="polite" title="Click for details" tabindex="0" aria-label="Score: ${this.state.score}">SCORE: ${this.state.score}</span>
                <button class="taskbar-flag-btn" id="taskbarFlagBtn" aria-label="Submit a flag">SUBMIT FLAG</button>
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

        // Post-completion report overlay
        this._buildReportOverlay(arena);

        // Desktop icons
        this._buildDesktopIcons();

        // Taskbar events
        document.getElementById('taskbarScore').addEventListener('click', () => this._toggleScoreDetail());
        document.getElementById('taskbarFlagBtn').addEventListener('click', () => this._openFlagModal());
        document.getElementById('taskbarResetBtn').addEventListener('click', () => this._confirmReset());

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
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('aria-label', 'Open ' + this._escHtml(icon.label));
            el.innerHTML = `
                ${this._renderDesktopIconGlyph(icon.icon)}
                <span class="icon-label">${this._escHtml(icon.label)}</span>
            `;
            el.addEventListener('dblclick', () => this._launchApp(icon));
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._launchApp(icon); }
            });
            el.addEventListener('click', () => {
                container.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
                el.classList.add('selected');
            });
            container.appendChild(el);
        });
    },

    // Shorthand → webp lookup for dispatch-box desktop icons.
    // Pre-existing configs use 2-3 letter codes (PS, AD, EVT, ...) that
    // were originally rendered as raw text. This table maps the common
    // codes to real icons; unknown codes fall back to text rendering.
    _DESKTOP_ICON_MAP: {
        'PS':   '/assets/images/icons/icon-terminal.webp',
        '>_':   '/assets/images/icons/icon-terminal.webp',
        'AD':   '/assets/images/icons/icon-users.webp',
        'ADUC': '/assets/images/icons/icon-users.webp',
        'EVT':  '/assets/images/icons/icon-list.webp',
        'TKT':  '/assets/images/icons/icon-clipboard.webp',
        'NET':  '/assets/images/icons/icon-network.webp',
        'SVC':  '/assets/images/icons/icon-gear.webp',
        'LOG':  '/assets/images/icons/icon-document.webp',
        'TXT':  '/assets/images/icons/icon-document.webp',
        'DSH':  '/assets/images/icons/icon-barchart.webp',
        'ADM':  '/assets/images/icons/icon-crown.webp',
        'DNS':  '/assets/images/icons/icon-globe.webp',
        'SEC':  '/assets/images/icons/icon-shield.webp',
        'FW':   '/assets/images/icons/icon-shield.webp',
        'CRT':  '/assets/images/icons/icon-key.webp',
        'SRV':  '/assets/images/icons/icon-server.webp',
        'PRT':  '/assets/images/icons/icon-printer.webp',
        'RST':  '/assets/images/icons/icon-wrench.webp',
        'HD':   '/assets/images/icons/icon-desktop.webp',
        'VPN':  '/assets/images/icons/icon-lock.webp',
        '?':    '/assets/images/icons/icon-warning.webp'
    },

    _renderDesktopIconGlyph(iconRef) {
        if (typeof iconRef !== 'string' || iconRef.length === 0) {
            return '<span class="icon-emoji" aria-hidden="true"></span>';
        }
        // Image-path direct: full path or known file extension
        if (iconRef.startsWith('/') || /\.(webp|png|svg|jpg|jpeg)$/i.test(iconRef)) {
            return `<img class="icon-img" src="${this._escHtml(iconRef)}" alt="" aria-hidden="true">`;
        }
        // Shorthand lookup
        const mapped = this._DESKTOP_ICON_MAP[iconRef];
        if (mapped) {
            return `<img class="icon-img" src="${mapped}" alt="" aria-hidden="true">`;
        }
        // Fallback: render the literal as text (preserves legacy behavior
        // for one-off shorthand codes not yet curated into the map).
        return `<span class="icon-emoji" aria-hidden="true">${this._escHtml(iconRef)}</span>`;
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
            <div class="flag-modal" role="dialog" aria-modal="true" aria-label="Submit Flag">
                <h3 id="flagModalTitle">&#9873; Submit Flag</h3>
                <div class="flag-badges" role="group" aria-label="Flag status">${badgesHtml}</div>
                <label for="flagModalInput" class="sr-only" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;">Enter flag value</label>
                <input type="text" class="flag-modal-input" id="flagModalInput" placeholder="flag{...}" autocomplete="off" aria-label="Enter flag value">
                <div class="flag-modal-btns">
                    <button class="flag-modal-submit" id="flagModalSubmit">Submit</button>
                    <button class="flag-modal-cancel" id="flagModalCancel">Cancel</button>
                </div>
                <div class="flag-modal-msg" id="flagModalMsg" role="status" aria-live="polite"></div>
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
        panel.setAttribute('role', 'complementary');
        panel.setAttribute('aria-label', 'Hints panel');
        panel.innerHTML = `
            <div class="hint-panel-header">
                <h3>Hints</h3>
                <button class="hint-panel-close" id="hintPanelClose" aria-label="Close hints panel">&times;</button>
            </div>
            <div class="hint-list" id="hintList" role="list"></div>
        `;
        parent.appendChild(panel);

        document.getElementById('hintPanelClose').addEventListener('click', () => this._closeHints());
        this._renderHints();
    },

    _buildCompletionOverlay(parent) {
        const overlay = document.createElement('div');
        overlay.className = 'completion-overlay';
        overlay.id = 'completionOverlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Box completion');
        overlay.innerHTML = `
            <div class="completion-card">
                <h2><img src="/assets/images/icons/icon-scales.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> BOX PWNED</h2>
                <div class="box-subtitle" id="completionSubtitle"></div>
                <div class="final-score" id="completionScore"></div>
                <div class="score-breakdown" id="completionBreakdown"></div>
                <div class="lore-outro" id="completionLore"></div>
                <div class="completion-btns">
                    <button id="completionReport" class="completion-report-btn">View Full Report</button>
                    <button id="completionClose">Continue</button>
                </div>
            </div>
        `;
        parent.appendChild(overlay);

        document.getElementById('completionClose').addEventListener('click', () => {
            overlay.classList.remove('active');
            // Show hat rating widget after completion
            if (typeof HatRating !== 'undefined' && this.config.registryId) {
                HatRating.show(this.config.registryId);
            }
            // Show post-challenge survey after completion
            if (!this.state.postSurvey) {
                this._showPostSurvey();
            }
        });

        document.getElementById('completionReport').addEventListener('click', () => {
            overlay.classList.remove('active');
            this._showCompletionReport();
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
    // _startBoot() is defined in the blue team extension block
    // below (search "WINRE BOOT SEQUENCE VARIANT") — it routes to
    // the WinRE flow when config.bootSequence === 'winre', otherwise
    // falls through to the original Linux/BIOS sequence.
    // ────────────────────────────────────────────────

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

        // Init phase system (no-op if no phases configured)
        this._initPhases();

        // Init blue team phase bar (no-op if blueTeamMode not set)
        this._initBlueTeam();

        // Fresh session: log box_start and show pre-survey
        if (this.state.events && this.state.events.length === 0 && !this.state.preSurvey) {
            this._logEvent('box_start', { boxId: this.config.storageKey || 'unknown' });
            this._showPreSurvey(() => {
                // After survey, init tutorial if configured
                this._initTutorial();
            });
            return;
        }

        // Returning session: detect prior abandonment and log resume
        if (!this.state.completed && this.state.events && this.state.events.length > 0) {
            const hasAbandon = this.state.events.some(e => e.type === 'session_abandon');
            if (hasAbandon) {
                this._logEvent('session_resume', {
                    flagsFound: this.state.flagsFound.length,
                    totalFlags: (this.config.flags || []).length,
                    score: this.state.score
                });
                this.save();
                this.notify('Welcome back! Resuming your session.', 'info');
            }
        }

        // Init tutorial (handles guard internally if not configured)
        this._initTutorial();
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

        // Position: cascade from top-left, wrapping within a 200x300 area
        // so windows don't stack exactly on top of each other
        const count = Object.keys(this._windows).length;
        const top = 30 + (count * 30) % 200;
        const left = 100 + (count * 40) % 300;
        win.style.cssText = `top:${top}px; left:${left}px; width:700px; height:500px; z-index:${++this._zIndex};`;

        win.setAttribute('role', 'dialog');
        win.setAttribute('aria-label', title);

        win.innerHTML = `
            <div class="window-titlebar">
                <span class="win-icon" aria-hidden="true">${icon || ''}</span>
                <span class="win-title">${this._escHtml(title)}</span>
                <div class="win-buttons">
                    <button class="win-btn win-btn-minimize" data-action="minimize" aria-label="Minimize ${this._escHtml(title)}"></button>
                    <button class="win-btn win-btn-close" data-action="close" aria-label="Close ${this._escHtml(title)}"></button>
                </div>
            </div>
            <div class="window-content"></div>
            <div class="window-resize" aria-hidden="true"></div>
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
        if (badge) {
            badge.textContent = 'SCORE: ' + this.state.score;
            badge.setAttribute('aria-label', 'Score: ' + this.state.score);
        }
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

        let html = '<h4>Score Breakdown</h4>';
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
    // FLAG SECURITY (Sprint AR-11)
    // ────────────────────────────────────────────────

    /**
     * Hash a flag value with a per-session seed using SHA-256.
     * Prevents casual DevTools inspection of state from revealing flag text.
     */
    async _hashFlag(value, seed) {
        const data = new TextEncoder().encode(value.toLowerCase().trim() + ':' + seed);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Pre-compute hashed versions of all flags for the current session.
     * Called after session seed is established in _initWithMode.
     */
    async _computeFlagHashes() {
        const flags = this.config.flags || [];
        const seed = this.state._sessionSeed;
        this._flagHashes = await Promise.all(flags.map(async f => ({
            id: f.id,
            hash: await this._hashFlag(f.value, seed),
            points: f.points
        })));
    },

    /**
     * SEC-9: Server-side flag validation with local hash fallback.
     *
     * Calls the validateFlag Cloud Function to check the submitted flag
     * against the server-side flag_registry (Firestore). If the server
     * is unavailable (offline, auth error, timeout), falls back to local
     * SHA-256 hash comparison using pre-computed _flagHashes.
     *
     * Config option: config.serverFlagValidation (default: true when
     * FirebaseAuth is available and user is signed in).
     *
     * @param {string} boxId      - The box registryId
     * @param {string} scenarioId - Optional scenario ID (dispatch boxes)
     * @param {string} submission - The raw flag text submitted by the user
     * @returns {Promise<{correct: boolean, flagId: string|null, source: string}>}
     */
    async _validateFlagViaServer(boxId, scenarioId, submission) {
        const serverEnabled = this.config.serverFlagValidation !== false;
        const hasAuth = typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn();

        // Attempt server validation if enabled and authenticated
        if (serverEnabled && hasAuth && boxId) {
            try {
                const payload = { boxId, submission: submission.trim() };
                if (scenarioId) payload.flagId = scenarioId;
                if (this.state._sessionId) payload.sessionId = this.state._sessionId;

                const result = await FirebaseAuth.callFunction('validateFlag', payload);
                const data = result.data || result;

                return {
                    correct: !!data.correct,
                    flagId: data.flagId || null,
                    source: 'server'
                };
            } catch (err) {
                console.warn('[ARENA] Server flag validation unavailable, falling back to local hash:', err.message);
                // Fall through to local hash comparison
            }
        }

        // Fallback: local SHA-256 hash comparison
        const seed = this.state._sessionSeed;
        if (!seed || !this._flagHashes || this._flagHashes.length === 0) {
            return { correct: false, flagId: null, source: 'local_no_hashes' };
        }

        try {
            const submittedHash = await this._hashFlag(submission, seed);
            for (const fh of this._flagHashes) {
                if (submittedHash === fh.hash) {
                    return { correct: true, flagId: fh.id, source: 'local_hash' };
                }
            }
            return { correct: false, flagId: null, source: 'local_hash' };
        } catch (e) {
            console.error('[ARENA] Local hash fallback failed:', e);
            return { correct: false, flagId: null, source: 'local_error' };
        }
    },

    // ── SEC-2: Flag Delivery (server-side flag text) ──────────────

    /** Delivered flag cache: { flagId: flagText } */
    _deliveredFlags: {},

    /**
     * Request flag text from server for display.
     * Called when the student earns a flag (scenario complete, phase unlock, etc.)
     * Returns the plaintext flag for rendering in terminal/GUI.
     */
    async requestFlagText(flagId) {
        // Return cached if already delivered
        if (this._deliveredFlags[flagId]) return this._deliveredFlags[flagId];

        // Restore from state (persisted across page refreshes)
        if (this.state._deliveredFlags && this.state._deliveredFlags[flagId]) {
            this._deliveredFlags[flagId] = this.state._deliveredFlags[flagId];
            return this._deliveredFlags[flagId];
        }

        const hasAuth = typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn();
        const boxId = this.config.registryId;

        if (!hasAuth || !boxId) {
            console.warn('[ARENA] Cannot deliver flag — no auth or registryId');
            return null;
        }

        try {
            const result = await FirebaseAuth.callFunction('deliverFlag', { boxId, flagId });
            const data = result.data || result;
            if (data.flagText) {
                this._deliveredFlags[flagId] = data.flagText;
                // Persist to state so page refresh retains delivered flags
                if (!this.state._deliveredFlags) this.state._deliveredFlags = {};
                this.state._deliveredFlags[flagId] = data.flagText;
                this.save();
                return data.flagText;
            }
        } catch (err) {
            console.warn('[ARENA] Flag delivery failed:', err.message);
        }
        return null;
    },

    /**
     * Synchronous read of a previously delivered flag.
     * Returns null if not yet delivered.
     */
    getDeliveredFlag(flagId) {
        if (this._deliveredFlags[flagId]) return this._deliveredFlags[flagId];
        if (this.state._deliveredFlags && this.state._deliveredFlags[flagId]) {
            this._deliveredFlags[flagId] = this.state._deliveredFlags[flagId];
            return this._deliveredFlags[flagId];
        }
        return null;
    },

    /**
     * Replace {{FLAG:id}} tokens in text with delivered flag values.
     * Used by Terminal._appendOutput and custom command handlers.
     * Unresolved tokens show a placeholder.
     */
    resolveFlagTokens(text) {
        if (!text || typeof text !== 'string') return text;
        var self = this;
        return text.replace(/\{\{FLAG:(\w+)\}\}/g, function(match, id) {
            var cached = self.getDeliveredFlag(id);
            if (cached) return cached;

            // Trigger async fetch from server
            if (!self._flagFetchPending) self._flagFetchPending = {};
            if (!self._flagFetchPending[id]) {
                self._flagFetchPending[id] = true;
                self.requestFlagText(id).then(function(flagText) {
                    delete self._flagFetchPending[id];
                    if (flagText) {
                        // Replace all [FLAG LOADING...] placeholders in terminal output with the real flag
                        var termOutput = document.querySelector('.term-output, #terminal-output');
                        if (termOutput) {
                            termOutput.innerHTML = termOutput.innerHTML
                                .replace(/\[FLAG LOADING\.\.\.\]/g, '<span style="color:#2ecc71;font-weight:bold;">' + flagText + '</span>')
                                .replace(/\[FLAG PENDING - Complete the challenge\]/g, '<span style="color:#2ecc71;font-weight:bold;">' + flagText + '</span>');
                        }
                        // Also replace in browser webapp output
                        var webappOutput = document.querySelector('.webapp [data-results]');
                        if (webappOutput) {
                            webappOutput.innerHTML = webappOutput.innerHTML
                                .replace(/\[FLAG LOADING\.\.\.\]/g, '<span style="color:#2ecc71;font-weight:bold;">' + flagText + '</span>');
                        }
                    }
                }).catch(function() { delete self._flagFetchPending[id]; });
            }
            return '[FLAG LOADING...]';
        });
    },

    /**
     * Rate limiting for flag submissions.
     * 3 wrong → 30s cooldown. 6 wrong → 60s cooldown. 10 wrong → page refresh required.
     */
    _checkRateLimit() {
        const stamps = this.state.wrongFlagTimestamps || [];
        const now = Date.now();
        // Clean old timestamps (older than 5 minutes)
        this.state.wrongFlagTimestamps = stamps.filter(t => now - t < 300000);
        const recent = this.state.wrongFlagTimestamps.length;

        if (recent >= 10) {
            return { blocked: true, message: 'Too many attempts. Refresh the page to try again.', wait: Infinity };
        }
        if (recent >= 6) {
            const last = this.state.wrongFlagTimestamps[this.state.wrongFlagTimestamps.length - 1];
            const elapsed = now - last;
            if (elapsed < 60000) {
                return { blocked: true, message: `Cooldown: ${Math.ceil((60000 - elapsed) / 1000)}s remaining`, wait: 60000 - elapsed };
            }
        }
        if (recent >= 3) {
            const last = this.state.wrongFlagTimestamps[this.state.wrongFlagTimestamps.length - 1];
            const elapsed = now - last;
            if (elapsed < 30000) {
                return { blocked: true, message: `Cooldown: ${Math.ceil((30000 - elapsed) / 1000)}s remaining`, wait: 30000 - elapsed };
            }
        }
        return { blocked: false };
    },

    /**
     * Show a countdown timer on the submit button during rate limiting.
     */
    _startRateLimitCountdown(waitMs) {
        const submitBtn = document.getElementById('flagModalSubmit');
        const msg = document.getElementById('flagModalMsg');
        if (!submitBtn) return;

        submitBtn.disabled = true;
        submitBtn.classList.add('rate-limited');

        if (waitMs === Infinity) {
            submitBtn.textContent = 'Locked';
            return;
        }

        const endTime = Date.now() + waitMs;
        const tick = () => {
            const remaining = Math.ceil((endTime - Date.now()) / 1000);
            if (remaining <= 0) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('rate-limited');
                submitBtn.textContent = 'Submit';
                msg.innerHTML = '';
                return;
            }
            submitBtn.textContent = `Wait ${remaining}s`;
            requestAnimationFrame(tick);
        };
        tick();
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

        // Restore submit button state (may have been rate-limited)
        const submitBtn = document.getElementById('flagModalSubmit');
        if (submitBtn && !submitBtn.classList.contains('rate-limited')) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }

        // Check if rate limit is still active on open
        if (!this._coOpMode) {
            const rateCheck = this._checkRateLimit();
            if (rateCheck.blocked) {
                document.getElementById('flagModalMsg').innerHTML = `<span style="color:#e74c3c;">${this._escHtml(rateCheck.message)}</span>`;
                this._startRateLimitCountdown(rateCheck.wait);
            }
        }

        // Enter key
        input.onkeydown = (e) => { if (e.key === 'Enter') this.submitFlag(); };
    },

    _closeFlagModal() {
        document.getElementById('flagModalOverlay').classList.remove('active');
    },

    // Main flag submission entry point. Routes through:
    // 1. TripWire decoy detection  2. Rate limiting  3. Server validation (if authed)
    // 4. Local SHA-256 hash fallback (if offline/anon)
    submitFlag() {
        const input = document.getElementById('flagModalInput');
        const msg = document.getElementById('flagModalMsg');
        const raw = input.value.trim();

        if (!raw) {
            msg.innerHTML = '<span style="color:#e74c3c;">Enter a flag to submit.</span>';
            return;
        }

        // TripWire: Decoy flag detection
        if (typeof raw === 'string' && /^FLAG\{NICE_TRY/i.test(raw)) {
            if (window.TripWire && window.TripWire._dispatch) {
                window.TripWire._dispatch({
                    sensor: 'decoy',
                    category: 'honeypot_access',
                    detail: 'Submitted honeypot flag in CTF box: ' + raw.substring(0, 30),
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname
                });
            }
            // Still show wrong flag feedback (don't reveal it's a decoy in the UI)
        }

        // Rate limiting check (client-side, prevents unnecessary server calls)
        if (!this._coOpMode) {
            const rateCheck = this._checkRateLimit();
            if (rateCheck.blocked) {
                msg.innerHTML = `<span style="color:#e74c3c;">${this._escHtml(rateCheck.message)}</span>`;
                this._startRateLimitCountdown(rateCheck.wait);
                return;
            }
        }

        // Server-side flag validation (SEC-2)
        // Check if FirebaseAuth is available for server validation
        const useServer = typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn();
        const registryId = this.config.registryId;

        if (useServer && registryId) {
            msg.innerHTML = '<span style="color:#3498db;">Validating...</span>';
            const submitBtn = document.getElementById('flagModalSubmit');
            if (submitBtn) submitBtn.disabled = true;

            FirebaseAuth.callFunction('validateFlag', {
                boxId: registryId,
                submission: raw
            }).then(result => {
                if (submitBtn) submitBtn.disabled = false;
                const data = result.data || result;

                if (data.correct && data.flagId) {
                    this._handleFlagCapture(data.flagId, raw, input, msg);
                } else {
                    this._handleWrongFlag(raw, msg);
                }
            }).catch(err => {
                if (submitBtn) submitBtn.disabled = false;
                console.error('[ARENA] Server flag validation error:', err);
                const errMsg = err.message || '';
                if (errMsg.includes('Too many attempts')) {
                    msg.innerHTML = '<span style="color:#e74c3c;">Rate limited. Wait and try again.</span>';
                } else {
                    msg.innerHTML = '<span style="color:#e74c3c;">Server error. Try again.</span>';
                }
            });
            return;
        }

        // Fallback: client-side hashed comparison (offline or no auth)
        this._hashFlag(raw, this.state._sessionSeed).then(submittedHash => {
            for (const fh of this._flagHashes) {
                if (submittedHash === fh.hash) {
                    this._handleFlagCapture(fh.id, raw, input, msg);
                    return;
                }
            }
            this._handleWrongFlag(raw, msg);
        }).catch(e => {
            console.error('[ARENA] Flag hash error:', e);
            msg.innerHTML = '<span style="color:#e74c3c;">Error validating flag. Try again.</span>';
        });
    },

    /**
     * Handle a correctly captured flag (shared by server + fallback paths).
     */
    _handleFlagCapture(flagId, rawInput, inputEl, msgEl) {
        if (this.state.flagsFound.includes(flagId)) {
            msgEl.innerHTML = '<span style="color:#3498db;">Flag already submitted.</span>';
            return;
        }

        const flags = this.config.flags || [];
        const flag = flags.find(f => f.id === flagId);
        const points = flag?.points || 100;

        // Co-op: sync to shared state
        if (this._coOpMode) {
            CoOpSync.submitFlagAtomically(
                flagId, rawInput, flags, this.config.scoring
            ).then(result => {
                if (result.success) {
                    this.state = { ...this._defaults(), ...result.newState };
                    this._logEvent('flag_correct', { flagId, points: result.points, hintsUsed: this.state.hintsUsed.length, elapsed: Date.now() - this.state.startTime });
                    msgEl.innerHTML = `<span style="color:#2ecc71;">&#10003; ${result.message}</span>`;
                    this.notify(result.message, 'success');
                    this._syncFlagBadges();
                    this._updateScoreBadge();
                    this._reportFlagCapture(flagId, result.points);
                    this._checkPhaseProgression(flagId);
                    inputEl.value = '';
                    if (result.completed) {
                        this._completionShown = true;
                        this._reportCompletion();
                        setTimeout(() => this._showCompletion(0), 800);
                    }
                } else {
                    const color = result.message === 'Flag already submitted' ? '#3498db' : '#e74c3c';
                    msgEl.innerHTML = `<span style="color:${color};">${result.message}</span>`;
                }
            });
            return;
        }

        // Solo: update local state
        this.state.flagsFound.push(flagId);
        this.addScore(points, `${flagId}.txt captured`);
        this._logEvent('flag_correct', { flagId, points, hintsUsed: this.state.hintsUsed.length, elapsed: Date.now() - this.state.startTime });
        msgEl.innerHTML = `<span style="color:#2ecc71;">&#10003; ${flagId}.txt captured! +${points} points</span>`;
        this.notify(`${flagId}.txt captured! +${points} points`, 'success');
        this._reportFlagCapture(flagId, points);

        const badge = document.getElementById('flagBadge_' + flagId);
        if (badge) badge.classList.add('found');

        this._checkPhaseProgression(flagId);
        inputEl.value = '';
        this._checkCompletion();
    },

    /**
     * Handle a wrong flag submission (shared by server + fallback paths).
     */
    _handleWrongFlag(rawInput, msgEl) {
        this.state.wrongFlags++;
        this.state.wrongFlagTimestamps.push(Date.now());
        const penalty = this.config.scoring?.wrongFlagPenalty || -25;
        this.addScore(penalty, 'Wrong flag attempt');
        this._logEvent('flag_wrong', { flagId: '__none__', attempt: rawInput });
        msgEl.innerHTML = `<span style="color:#e74c3c;">Incorrect flag. ${penalty} points</span>`;
        this.save();

        const postCheck = this._checkRateLimit();
        if (postCheck.blocked) {
            this._startRateLimitCountdown(postCheck.wait);
        }
    },

    /**
     * Programmatic flag award for config command handlers.
     * Use this when a lab awards a flag based on an action (e.g., restoring a service)
     * rather than through the flag submission modal.
     * @param {string} flagId - The flag ID to award (e.g., 'flag1', 'user', 'root')
     */
    awardFlag(flagId) {
        if (this.state.flagsFound.includes(flagId)) return;

        const flags = this.config.flags || [];
        const flag = flags.find(f => f.id === flagId);
        const points = flag?.points || 100;

        this.state.flagsFound.push(flagId);
        this.addScore(points, `${flagId} captured`);
        this._logEvent('flag_correct', { flagId, points, hintsUsed: this.state.hintsUsed.length, elapsed: Date.now() - this.state.startTime });
        this.notify(`${flagId} captured! +${points} points`, 'success');
        this._reportFlagCapture(flagId, points);

        // Server-side: validate action and record flag
        // Sends state proof to validateAction CF — server checks conditions
        const boxId = this.config.registryId || this.config.storageKey || 'unknown';
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.callFunction) {
            // Build state proof from engine state (only serializable values)
            const stateProof = {};
            const engineState = this.config._state || this.config;
            for (const [k, v] of Object.entries(engineState)) {
                if (k.startsWith('_') && (typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string' || Array.isArray(v))) {
                    stateProof[k] = v;
                }
            }
            stateProof._actionCount = (this.state.events || []).length;
            stateProof._flagsFound = [...this.state.flagsFound];
            stateProof._elapsed = Date.now() - (this.state.startTime || Date.now());

            FirebaseAuth.callFunction('validateAction', {
                boxId: boxId,
                flagId: flagId,
                stateProof: stateProof
            }).then(() => {
                // Capture is now written server-side — nudge the Dr. Hex mood-ring
                // to refetch so it celebrates. (The _reportFlagCapture dispatch above
                // fires before this server write lands; this one catches the timing.)
                try { window.dispatchEvent(new CustomEvent('hexworth:lab-attempt-submitted')); } catch (e) {}
            }).catch(() => {}); // silent — don't block gameplay
        }

        const badge = document.getElementById('flagBadge_' + flagId);
        if (badge) badge.classList.add('found');

        this._updateScoreBadge();
        this.save();
        this._checkCompletion();
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

    /**
     * Get the effective hint penalty, adjusted for difficulty tier.
     * Hard mode doubles hint costs.
     */
    _getEffectiveHintPenalty(hint) {
        const scoring = this.config.scoring || {};
        const base = hint.penalty || scoring.hintPenalty || -50;
        const difficulty = this._getEffectiveDifficulty();
        if (difficulty === 'hard') return base * 2;
        return base;
    },

    /**
     * Resolve the effective difficulty tier.
     * Returns 'easy', 'normal', or 'hard'. Defaults to 'normal' if not set.
     */
    _getEffectiveDifficulty() {
        // Player override via lobby selection, URL param, or saved state
        const params = new URLSearchParams(window.location.search);
        const override = this._difficultyOverride || params.get('difficulty') || (this.state && this.state._difficultyOverride);
        if (override) {
            const o = override.toLowerCase();
            if (o === 'easy' || o === 'normal' || o === 'hard') return o;
        }
        const d = (this.config.difficulty || 'normal').toLowerCase();
        if (d === 'easy' || d.includes('beginner')) return 'easy';
        if (d === 'hard' || d.includes('expert') || d.includes('advanced')) return 'hard';
        return 'normal';
    },

    _renderHints() {
        const list = document.getElementById('hintList');
        if (!list) return;
        const hints = this.config.hints || [];
        const scoring = this.config.scoring || {};
        list.innerHTML = '';

        hints.forEach((hint, idx) => {
            const used = this.state.hintsUsed.includes(hint.id);
            const penalty = this._getEffectiveHintPenalty(hint);
            const isFree = this.state.godMode;
            const item = document.createElement('div');
            item.className = 'hint-item ' + (used ? 'revealed' : 'locked');

            if (used) {
                // Already revealed — show text and spent cost
                item.innerHTML = `
                    <div class="hint-item-header">
                        <span class="hint-item-label">Hint ${idx + 1}</span>
                        <span class="hint-item-cost spent">${isFree ? 'Free (God Mode)' : penalty + ' pts spent'}</span>
                    </div>
                    <div class="hint-item-text">${this._escHtml(hint.text)}</div>
                `;
            } else {
                // Not yet revealed — show cost preview and confirm button
                item.innerHTML = `
                    <div class="hint-item-header">
                        <span class="hint-item-label">Hint ${idx + 1}</span>
                        <span class="hint-item-cost">${isFree ? 'Free' : penalty + ' pts'}</span>
                    </div>
                    <div class="hint-cost-preview">
                        ${isFree ? 'No penalty in God Mode' : `This hint costs <strong>${Math.abs(penalty)}</strong> points`}
                    </div>
                    <button class="hint-reveal-btn">Reveal Hint (${isFree ? 'free' : penalty + ' pts'})</button>
                    <div class="hint-confirm" style="display:none;">
                        <span class="hint-confirm-text">${isFree ? 'Reveal this hint?' : `Are you sure? You will lose ${Math.abs(penalty)} points.`}</span>
                        <div class="hint-confirm-btns">
                            <button class="hint-confirm-yes">Yes, reveal</button>
                            <button class="hint-confirm-no">Cancel</button>
                        </div>
                    </div>
                `;

                const revealBtn = item.querySelector('.hint-reveal-btn');
                const confirmDiv = item.querySelector('.hint-confirm');
                const confirmYes = item.querySelector('.hint-confirm-yes');
                const confirmNo = item.querySelector('.hint-confirm-no');

                revealBtn.addEventListener('click', () => {
                    revealBtn.style.display = 'none';
                    confirmDiv.style.display = 'block';
                });

                confirmYes.addEventListener('click', () => {
                    this._useHint(hint);
                    this._renderHints();
                });

                confirmNo.addEventListener('click', () => {
                    confirmDiv.style.display = 'none';
                    revealBtn.style.display = 'block';
                });
            }

            list.appendChild(item);
        });
    },

    _useHint(hint) {
        if (this.state.hintsUsed.includes(hint.id)) return;

        if (this._coOpMode) {
            // Co-op: atomic Firestore transaction with difficulty-adjusted penalty
            const effectivePenalty = this._getEffectiveHintPenalty(hint);
            CoOpSync.revealHintAtomically(hint.id, effectivePenalty, this.state.godMode).then(result => {
                if (result.success) {
                    this.state = { ...this._defaults(), ...result.newState };
                    this._logEvent('hint_reveal', { flagId: hint.forFlag || hint.id, hintIndex: this.state.hintsUsed.length - 1, penalty: this.state.godMode ? 0 : effectivePenalty });
                    this._updateScoreBadge();
                    this._renderHints();
                    this._reportHintReveal(hint.id, effectivePenalty);
                    this.notify(`Hint revealed. ${this.state.godMode ? 'No penalty (God Mode)' : effectivePenalty + ' points'}`, 'warning');
                }
                // If already used, silently re-render (idempotent)
                if (result.alreadyUsed) {
                    this._renderHints();
                }
            });
            return;
        }

        // Solo mode: original logic with difficulty-adjusted penalty
        this.state.hintsUsed.push(hint.id);
        const effectivePenalty = this._getEffectiveHintPenalty(hint);

        if (!this.state.godMode) {
            this.addScore(effectivePenalty, `Hint used: ${hint.id}`);
        }

        this.save();
        this._logEvent('hint_reveal', { flagId: hint.forFlag || hint.id, hintIndex: this.state.hintsUsed.length - 1, penalty: this.state.godMode ? 0 : effectivePenalty });
        this._reportHintReveal(hint.id, effectivePenalty);
        this.notify(`Hint revealed. ${this.state.godMode ? 'No penalty (God Mode)' : effectivePenalty + ' points'}`, 'warning');
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

    // Toggle God Mode (Ctrl+Shift+G). Requires admin/instructor localStorage flag.
    // Reveals all flag values in console and removes hint penalties.
    _toggleGodMode() {
        if (!this.state.godMode) {
            const isAdmin = localStorage.getItem('hexworth_firebase_admin');
            if (!isAdmin) {
                this.notify('Instructor access required for God Mode', 'warning');
                this._logEvent('god_mode_denied', {});
                return;
            }
        }

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
            // Escape closes modals (in priority order: topmost first)
            if (e.key === 'Escape') {
                const reportOverlay = document.getElementById('reportOverlay');
                if (reportOverlay && reportOverlay.classList.contains('active')) {
                    reportOverlay.classList.remove('active');
                    return;
                }
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
                const phasePanel = document.getElementById('phasePanel');
                if (phasePanel && phasePanel.classList.contains('active')) {
                    this._togglePhasePanel(false);
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
     * Resolve the student's enrolled class IDs for activity logging.
     * Mirrors the pattern used by ProgressSync.sync() — iterates over
     * ClassManager.getStudentClasses() and returns all enrolled class IDs.
     * Falls back to cached enrollments if the network call fails.
     * Returns an empty array if the student is not enrolled in any class.
     */
    async _resolveClassIds() {
        try {
            if (typeof FirebaseAuth === 'undefined' || typeof ClassManager === 'undefined') return [];
            const user = FirebaseAuth.getUser();
            if (!user) return [];

            let classes;
            try {
                classes = await ClassManager.getStudentClasses(user.uid);
            } catch (e) {
                // Offline fallback — same pattern as ProgressSync
                classes = ClassManager.getCachedEnrollments ? ClassManager.getCachedEnrollments() : [];
            }
            return (classes || []).map(c => c.id).filter(Boolean);
        } catch (e) {
            console.warn('[ARENA] Could not resolve classIds:', e);
            return [];
        }
    },

    /**
     * Report box completion to instructor analytics pipeline.
     * Safe — all calls wrapped in try/catch and existence checks.
     */
    async _reportCompletion() {
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

        // Phase timing: group command events by phase, compute time per phase
        const phaseTimings = { RECON: 0, EXPLOIT: 0, EXTRACTION: 0, OTHER: 0 };
        const commandEvents = events.filter(e => e.type === 'command' && e.data && e.data.phase);
        if (commandEvents.length > 0) {
            for (let i = 0; i < commandEvents.length; i++) {
                const phase = commandEvents[i].data.phase;
                const start = commandEvents[i].t;
                const end = (i + 1 < commandEvents.length) ? commandEvents[i + 1].t : (s.completed ? Date.now() : commandEvents[i].t);
                phaseTimings[phase] = (phaseTimings[phase] || 0) + (end - start);
            }
        }

        const researchData = {
            eventLog: events,
            totalCommands,
            totalNavigations,
            avgTimeBetweenFlags,
            hintEffectiveness,
            phaseTimings,
            preSurvey: s.preSurvey || null,
            postSurvey: s.postSurvey || null
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
            } else if (trackerKey) {
                // Bridge: write progress directly when ProgressManager isn't loaded
                this._bridgeProgress(trackerKey, s.score);
            }
        } catch (e) { console.error('[ARENA] ProgressManager error:', e); }

        // GameTracker — records game session stats
        try {
            if (typeof GameTracker !== 'undefined' && trackerKey) {
                GameTracker.record(trackerKey, {
                    result: 'win',
                    score: s.score,
                    timeElapsed: elapsed,
                    commandsUsed: totalCommands,
                    achievementsEarned: s.flagsFound.length,
                    achievementsTotal: (this.config.flags || []).length,
                    ...researchData
                });
            }
        } catch (e) { console.error('[ARENA] GameTracker error:', e); }

        // AssignmentManager — logs activity to Firestore for instructor dashboard
        // Resolve classIds from enrolled classes (same pattern as ProgressSync)
        try {
            if (typeof AssignmentManager !== 'undefined') {
                const classIds = await this._resolveClassIds();
                const activityData = {
                    score: s.score,
                    flags: s.flagsFound.length,
                    totalFlags: (this.config.flags || []).length,
                    wrongFlags: s.wrongFlags || 0,
                    hints: s.hintsUsed.length,
                    time: elapsed,
                    mode: this._vsMode ? 'vs' : this._coOpMode ? 'coop' : 'solo',
                    certObjectives: this.config.certObjectives || null,
                    objectivesCovered: (this.config.certObjectives?.mappings || []).map(m => ({
                        objective: m.objective,
                        captured: this.state.flagsFound.includes(m.flagId)
                    })),
                    ...researchData
                };
                if (classIds.length > 0) {
                    for (const classId of classIds) {
                        AssignmentManager.logActivity(classId, 'arena_complete', boxId, this.config.title || boxId, activityData);
                    }
                } else {
                    // No enrolled classes — log without classId for global analytics
                    console.warn('[ARENA] No enrolled classes found — arena_complete not synced to Firestore');
                }
            }
        } catch (e) { console.error('[ARENA] AssignmentManager error:', e); }

        // Sync aggregate CTF stats to Firestore user profile
        try {
            if (typeof FirestoreManager !== 'undefined' && typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                const user = FirebaseAuth.getUser();
                if (user) {
                    const ctfStats = this._aggregateCTFStats();
                    FirestoreManager.setUserProfile(user.uid, {
                        ctfBoxesPwned: ctfStats.boxesPwned,
                        ctfFlagsCaptured: ctfStats.flagsCaptured
                    });
                }
            }
        } catch (e) { console.error('[ARENA] CTF stats sync error:', e); }

        console.log(`%c[ARENA] Assessment reported: ${boxId} (${s.score} pts, ${elapsed}s, ${events.length} events)`, 'color: #9b59b6');
    },

    /**
     * Aggregate CTF stats from all localStorage box keys.
     * Reads hexworth_ctf_a1..a20 (and b/c/d/e series) to compute totals.
     */
    _aggregateCTFStats() {
        let boxesPwned = 0;
        let flagsCaptured = 0;
        const prefixes = ['a', 'b', 'c', 'd', 'e'];
        for (const prefix of prefixes) {
            for (let i = 1; i <= 20; i++) {
                try {
                    const data = JSON.parse(localStorage.getItem(`hexworth_ctf_${prefix}${i}`) || 'null');
                    if (!data) continue;
                    if (data.completed) boxesPwned++;
                    if (Array.isArray(data.flagsFound)) {
                        flagsCaptured += data.flagsFound.length;
                    } else {
                        // Workshop format: boolean flags
                        if (data.userFlag) flagsCaptured++;
                        if (data.rootFlag) flagsCaptured++;
                    }
                } catch (e) { /* skip corrupt keys */ }
            }
        }
        return { boxesPwned, flagsCaptured };
    },

    /**
     * Bridge progress to localStorage when ProgressManager isn't loaded.
     * Writes both flat and structured format + awards LAB_COMPLETE XP (200).
     */
    _bridgeProgress(trackerKey, score) {
        const PROGRESS_KEY = 'hexworth_progress';
        const LAB_XP = 500; // mirrors ProgressManager.XP_REWARDS.LAB_COMPLETE
        try {
            const progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');

            // Flat format
            if (!progress.arena) progress.arena = {};
            progress.arena[trackerKey] = {
                completed: true,
                completedAt: new Date().toISOString(),
                score: score
            };

            // Structured format
            if (!Array.isArray(progress.completedModules)) progress.completedModules = [];
            if (!progress.houses) progress.houses = {};
            if (!progress.houses.arena) {
                progress.houses.arena = {
                    unlocked: true, modulesCompleted: [], quizzesPassed: [],
                    labsCompleted: [], currentModule: null, progressPercent: 0, lastAccessed: null
                };
            }
            const house = progress.houses.arena;
            if (!Array.isArray(house.modulesCompleted)) house.modulesCompleted = [];
            if (!Array.isArray(house.labsCompleted)) house.labsCompleted = [];
            house.lastAccessed = Date.now();

            // Only award XP on first completion
            if (!progress.completedModules.includes(trackerKey)) {
                progress.completedModules.push(trackerKey);
                if (!house.modulesCompleted.includes(trackerKey)) house.modulesCompleted.push(trackerKey);
                if (!house.labsCompleted.includes(trackerKey)) house.labsCompleted.push(trackerKey);
                if (!Array.isArray(progress.labsCompleted)) progress.labsCompleted = [];
                if (!progress.labsCompleted.includes(trackerKey)) progress.labsCompleted.push(trackerKey);

                progress.xp = (progress.xp || 0) + LAB_XP;
                // Level formula inverse (uncapped): N = floor((1 + sqrt(1 + xp/12.5)) / 2)
                progress.level = Math.max(1, Math.floor((1 + Math.sqrt(1 + progress.xp / 12.5)) / 2));
            }

            localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
            console.log(`[ARENA] Progress bridge: ${trackerKey} → +${LAB_XP} XP (total: ${progress.xp})`);
        } catch (e) {
            console.warn('[ARENA] Progress bridge failed:', e.message);
        }
    },

    /**
     * Report a flag capture to instructor analytics.
     */
    async _reportFlagCapture(flagId, points) {
        try {
            if (typeof AssignmentManager !== 'undefined') {
                const boxId = this.config.storageKey || 'unknown';
                const classIds = await this._resolveClassIds();
                for (const classId of classIds) {
                    AssignmentManager.logActivity(classId, 'arena_flag', boxId, this.config.title || boxId, {
                        flagId, points
                    });
                }
            }
        } catch (e) { /* silent */ }

        // Nudge the Dr. Hex mood-ring to refetch so it celebrates this capture.
        // flag_captures is written server-side by validateFlag before this runs;
        // the button's own 800ms debounce covers propagation. Non-fatal.
        try {
            window.dispatchEvent(new CustomEvent('hexworth:lab-attempt-submitted'));
        } catch (e) { /* mood-ring is a side-channel */ }
    },

    /**
     * Report a hint reveal to instructor analytics.
     */
    async _reportHintReveal(hintId, penalty) {
        try {
            if (typeof AssignmentManager !== 'undefined') {
                const boxId = this.config.storageKey || 'unknown';
                const classIds = await this._resolveClassIds();
                for (const classId of classIds) {
                    AssignmentManager.logActivity(classId, 'arena_hint', boxId, this.config.title || boxId, {
                        hintId, penalty
                    });
                }
            }
        } catch (e) { /* silent */ }
    },

    // ────────────────────────────────────────────────
    // PHASE/LAYER PROGRESSION (Sprint AR-15)
    // ────────────────────────────────────────────────

    /**
     * Initialize the phase system from config.phases[].
     * Called from _showDesktop after DOM is ready.
     * If no phases defined, this is a no-op (backward compatible).
     */
    _initPhases() {
        const phases = this.config.phases;
        if (!phases || phases.length === 0) return;

        // Restore state or initialize fresh
        if (!this.state.activePhases || this.state.activePhases.length === 0) {
            // First run: activate all unlocked phases (locked !== true)
            this.state.activePhases = phases.filter(p => !p.locked).map(p => p.id);
            if (!this.state.phaseTimestamps) this.state.phaseTimestamps = {};
            this.state.activePhases.forEach(id => {
                if (!this.state.phaseTimestamps[id]) {
                    this.state.phaseTimestamps[id] = { started: Date.now() };
                }
            });
            this.save();
        }

        // Build phase tracker UI in taskbar
        this._buildPhaseTracker();
        this._updatePhaseTracker();

        // Build phase detail panel
        this._buildPhasePanel();
    },

    /**
     * Build the phase indicator widget in the taskbar (next to score).
     */
    _buildPhaseTracker() {
        const phases = this.config.phases;
        if (!phases) return;

        const taskbarRight = this._desktopEl.querySelector('.taskbar-right');
        if (!taskbarRight) return;

        const tracker = document.createElement('span');
        tracker.className = 'phase-tracker';
        tracker.id = 'phaseTracker';
        tracker.title = 'Click for phase details';
        tracker.addEventListener('click', () => this._togglePhasePanel());

        // Insert before the score badge
        const scoreBadge = taskbarRight.querySelector('.taskbar-score');
        taskbarRight.insertBefore(tracker, scoreBadge);
    },

    /**
     * Update the phase tracker display in the taskbar.
     */
    _updatePhaseTracker() {
        const tracker = document.getElementById('phaseTracker');
        const phases = this.config.phases;
        if (!tracker || !phases) return;

        const completed = (this.state.completedPhases || []).length;
        const total = phases.length;

        // Find current active (non-completed) phase
        const currentPhase = phases.find(p =>
            this.state.activePhases.includes(p.id) &&
            !this.state.completedPhases.includes(p.id)
        );

        if (completed >= total) {
            tracker.innerHTML = `<span class="phase-tracker-icon"><img src="/assets/images/icons/icon-scales.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span> <span class="phase-tracker-text">All Phases Complete</span>`;
            tracker.classList.add('all-complete');
        } else if (currentPhase) {
            tracker.innerHTML = `<span class="phase-tracker-icon">${currentPhase.icon || '<img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">'}</span> <span class="phase-tracker-text">Phase ${completed + 1}/${total}: ${this._escHtml(currentPhase.name)}</span>`;
            tracker.classList.remove('all-complete');
        } else {
            tracker.innerHTML = `<span class="phase-tracker-icon"><img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span> <span class="phase-tracker-text">Phase ${completed}/${total}</span>`;
            tracker.classList.remove('all-complete');
        }
    },

    /**
     * Build the phase detail panel (slide-down from taskbar).
     */
    _buildPhasePanel() {
        const phases = this.config.phases;
        if (!phases) return;

        const panel = document.createElement('div');
        panel.className = 'phase-panel';
        panel.id = 'phasePanel';

        panel.setAttribute('role', 'complementary');
        panel.setAttribute('aria-label', 'Attack phases');
        panel.innerHTML = `
            <div class="phase-panel-header">
                <h4>Attack Phases</h4>
                <button class="phase-panel-close" id="phasePanelClose" aria-label="Close phase panel">&times;</button>
            </div>
            <div class="phase-panel-list" id="phasePanelList" role="list"></div>
        `;

        this._desktopEl.appendChild(panel);
        document.getElementById('phasePanelClose').addEventListener('click', () => this._togglePhasePanel(false));

        this._renderPhasePanel();
    },

    /**
     * Toggle the phase detail panel visibility.
     */
    _togglePhasePanel(forceState) {
        const panel = document.getElementById('phasePanel');
        if (!panel) return;

        const isOpen = panel.classList.contains('active');
        const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

        panel.classList.toggle('active', shouldOpen);

        if (shouldOpen) {
            this._renderPhasePanel();
            // Close on outside click
            const closer = (e) => {
                if (!panel.contains(e.target) && !e.target.closest('.phase-tracker')) {
                    panel.classList.remove('active');
                    document.removeEventListener('click', closer);
                }
            };
            setTimeout(() => document.addEventListener('click', closer), 10);
        }
    },

    /**
     * Render the contents of the phase detail panel.
     */
    _renderPhasePanel() {
        const list = document.getElementById('phasePanelList');
        const phases = this.config.phases;
        if (!list || !phases) return;

        list.innerHTML = '';

        phases.forEach(phase => {
            const isCompleted = (this.state.completedPhases || []).includes(phase.id);
            const isActive = (this.state.activePhases || []).includes(phase.id) && !isCompleted;
            const isLocked = !isCompleted && !isActive;

            let status = 'locked';
            let statusLabel = 'LOCKED';
            if (isCompleted) { status = 'completed'; statusLabel = 'COMPLETE'; }
            else if (isActive) { status = 'active'; statusLabel = 'ACTIVE'; }

            // Calculate time spent in phase
            let timeStr = '';
            const ts = (this.state.phaseTimestamps || {})[phase.id];
            if (ts) {
                const end = ts.completed || (isActive ? Date.now() : null);
                if (end && ts.started) {
                    const ms = end - ts.started;
                    const mins = Math.floor(ms / 60000);
                    const secs = Math.floor((ms % 60000) / 1000);
                    timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                }
            }

            const el = document.createElement('div');
            el.className = `phase-item ${status}`;
            el.innerHTML = `
                <div class="phase-item-header">
                    <span class="phase-item-icon">${phase.icon || '<img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">'}</span>
                    <span class="phase-item-name">${this._escHtml(phase.name)}</span>
                    <span class="phase-item-status">${statusLabel}</span>
                </div>
                <div class="phase-item-desc">${isLocked ? '???' : this._escHtml(phase.description || '')}</div>
                ${timeStr ? `<div class="phase-item-time">${timeStr}</div>` : ''}
                ${(phase.mitre && phase.mitre.length && !isLocked) ? `
                    <div class="phase-item-mitre">
                        ${phase.mitre.map(t => `<span class="mitre-tag">${this._escHtml(t)}</span>`).join('')}
                    </div>
                ` : ''}
                ${(phase.requiredFlags && !isLocked) ? `
                    <div class="phase-item-flags">
                        ${phase.requiredFlags.map(fId => {
                            const found = this.state.flagsFound.includes(fId);
                            return `<span class="phase-flag-badge ${found ? 'found' : ''}">${this._escHtml(fId)}</span>`;
                        }).join('')}
                    </div>
                ` : ''}
            `;
            list.appendChild(el);
        });
    },

    /**
     * Check if a flag submission triggers phase completion/unlocking.
     * Called after a successful flag capture.
     */
    _checkPhaseProgression(flagId) {
        const phases = this.config.phases;
        if (!phases || phases.length === 0) return;

        phases.forEach(phase => {
            // Skip if already completed
            if ((this.state.completedPhases || []).includes(phase.id)) return;
            // Skip if not active
            if (!(this.state.activePhases || []).includes(phase.id)) return;

            // Check if all required flags for this phase are now captured
            const allCaptured = (phase.requiredFlags || []).every(fId =>
                this.state.flagsFound.includes(fId)
            );

            if (allCaptured) {
                // Mark phase complete
                if (!this.state.completedPhases) this.state.completedPhases = [];
                this.state.completedPhases.push(phase.id);

                // Record completion timestamp
                if (!this.state.phaseTimestamps) this.state.phaseTimestamps = {};
                if (!this.state.phaseTimestamps[phase.id]) {
                    this.state.phaseTimestamps[phase.id] = { started: this.state.startTime };
                }
                this.state.phaseTimestamps[phase.id].completed = Date.now();

                const elapsed = Date.now() - (this.state.phaseTimestamps[phase.id].started || this.state.startTime);
                this._logEvent('phase_complete', {
                    phaseId: phase.id,
                    phaseName: phase.name,
                    elapsed: elapsed,
                    mitre: phase.mitre || []
                });

                this.notify(`Phase complete: ${phase.name}`, 'success');

                // Unlock next phases
                if (phase.unlocks && phase.unlocks.length) {
                    phase.unlocks.forEach(nextId => {
                        if (!this.state.activePhases.includes(nextId)) {
                            this.state.activePhases.push(nextId);
                            // Record start timestamp for new phase
                            if (!this.state.phaseTimestamps[nextId]) {
                                this.state.phaseTimestamps[nextId] = { started: Date.now() };
                            }
                            this._logEvent('phase_unlock', { phaseId: nextId });

                            const nextPhase = phases.find(p => p.id === nextId);
                            if (nextPhase) {
                                this.notify(`Phase unlocked: ${nextPhase.name}`, 'info');
                            }
                        }
                    });
                }

                this.save();
                this._updatePhaseTracker();
                this._renderPhasePanel();
            }
        });
    },

    // ────────────────────────────────────────────────
    // POST-COMPLETION REPORT (Sprint AR-15)
    // ────────────────────────────────────────────────

    /**
     * Build the completion report overlay DOM.
     * Called from _buildDOM.
     */
    _buildReportOverlay(parent) {
        const overlay = document.createElement('div');
        overlay.className = 'report-overlay';
        overlay.id = 'reportOverlay';
        overlay.innerHTML = `
            <div class="report-card" id="reportCard">
                <div class="report-header" id="reportHeader"></div>
                <div class="report-body" id="reportBody"></div>
                <div class="report-actions">
                    <button class="report-export-btn" id="reportExportBtn">Export Report</button>
                    <button class="report-close-btn" id="reportCloseBtn">Close</button>
                </div>
            </div>
        `;
        parent.appendChild(overlay);

        document.getElementById('reportCloseBtn').addEventListener('click', () => {
            overlay.classList.remove('active');
            // Show post-survey if not yet taken
            if (!this.state.postSurvey) {
                this._showPostSurvey();
            }
        });

        document.getElementById('reportExportBtn').addEventListener('click', () => {
            this._exportReportMarkdown();
        });
    },

    /**
     * Show the full post-completion report.
     * Called when box is completed (all flags found).
     */
    _showCompletionReport() {
        const overlay = document.getElementById('reportOverlay');
        if (!overlay) return;

        const s = this.state;
        const config = this.config;
        const scoring = config.scoring || {};
        const phases = config.phases || [];
        const flags = config.flags || [];
        const events = s.events || [];
        const elapsed = Date.now() - s.startTime;
        const elapsedMin = Math.round(elapsed / 60000);

        // ── HEADER ──
        const header = document.getElementById('reportHeader');
        const maxScore = (scoring.base || 1000) + flags.reduce((sum, f) => sum + (f.points || 0), 0) +
            (scoring.speedBonus ? scoring.speedBonus.points : 0);

        header.innerHTML = `
            <div class="report-title"><img src="/assets/images/icons/icon-scales.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> BOX COMPLETE</div>
            <div class="report-box-name">${this._escHtml(config.title || 'CTF Box')}</div>
            <div class="report-summary-row">
                <span class="report-summary-item"><strong>${elapsedMin}</strong> min</span>
                <span class="report-summary-divider">|</span>
                <span class="report-summary-item"><strong>${s.score}</strong>/${maxScore} pts</span>
                <span class="report-summary-divider">|</span>
                <span class="report-summary-item"><strong>${s.flagsFound.length}</strong>/${flags.length} flags</span>
                ${config.difficulty ? `<span class="report-summary-divider">|</span><span class="report-summary-item">${this._escHtml(config.difficulty)}</span>` : ''}
            </div>
        `;

        // ── BODY ──
        let bodyHtml = '';

        // 1. ATTACK CHAIN
        bodyHtml += '<div class="report-section"><h4 class="report-section-title">ATTACK CHAIN</h4>';
        if (phases.length > 0) {
            phases.forEach((phase, idx) => {
                const isCompleted = (s.completedPhases || []).includes(phase.id);
                const ts = (s.phaseTimestamps || {})[phase.id];
                let timeStr = '--';
                if (ts && ts.started && ts.completed) {
                    const ms = ts.completed - ts.started;
                    const mins = Math.floor(ms / 60000);
                    const secs = Math.floor((ms % 60000) / 1000);
                    timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                }
                bodyHtml += `
                    <div class="report-chain-step ${isCompleted ? 'completed' : 'incomplete'}">
                        <span class="report-chain-num">${idx + 1}.</span>
                        <span class="report-chain-icon">${phase.icon || '<img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">'}</span>
                        <span class="report-chain-name">${this._escHtml(phase.name)}</span>
                        <span class="report-chain-time">[${timeStr}]</span>
                    </div>
                `;
            });
        } else {
            // No phases: build chain from flag submission order
            const flagEvents = events.filter(e => e.type === 'flag_correct');
            if (flagEvents.length > 0) {
                flagEvents.forEach((fe, idx) => {
                    const elapsed = fe.elapsed ? Math.round(fe.elapsed / 1000) : 0;
                    const mins = Math.floor(elapsed / 60);
                    const secs = elapsed % 60;
                    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                    bodyHtml += `
                        <div class="report-chain-step completed">
                            <span class="report-chain-num">${idx + 1}.</span>
                            <span class="report-chain-icon">&#9873;</span>
                            <span class="report-chain-name">${this._escHtml(fe.data?.flagId || 'Flag')}</span>
                            <span class="report-chain-time">[${timeStr}]</span>
                        </div>
                    `;
                });
            } else {
                bodyHtml += '<div class="report-chain-empty">No attack chain data available.</div>';
            }
        }
        bodyHtml += '</div>';

        // 2. MITRE ATT&CK MAPPING
        const allMitre = [];
        if (phases.length > 0) {
            phases.forEach(p => {
                (p.mitre || []).forEach(t => {
                    if (!allMitre.includes(t)) allMitre.push(t);
                });
            });
        }
        // Also check individual flags for mitre mappings
        flags.forEach(f => {
            (f.mitre || []).forEach(t => {
                if (!allMitre.includes(t)) allMitre.push(t);
            });
        });

        if (allMitre.length > 0) {
            bodyHtml += '<div class="report-section"><h4 class="report-section-title">MITRE ATT&CK</h4>';
            bodyHtml += '<div class="report-mitre-list">';
            allMitre.forEach(t => {
                bodyHtml += `<span class="report-mitre-tag">${this._escHtml(t)}</span>`;
            });
            bodyHtml += '</div></div>';
        }

        // 3. SCORE BREAKDOWN
        bodyHtml += '<div class="report-section"><h4 class="report-section-title">SCORE BREAKDOWN</h4>';
        bodyHtml += '<div class="report-score-table">';
        bodyHtml += `<div class="report-score-row"><span>Base score</span><span>${scoring.base || 1000}</span></div>`;

        s.flagsFound.forEach(id => {
            const flag = flags.find(f => f.id === id);
            if (flag) bodyHtml += `<div class="report-score-row"><span>${this._escHtml(id)}.txt flag</span><span class="pos">+${flag.points}</span></div>`;
        });

        // Speed bonus
        const speedBonus = (scoring.speedBonus && elapsed < scoring.speedBonus.threshold) ? scoring.speedBonus.points : 0;
        if (speedBonus) {
            bodyHtml += `<div class="report-score-row"><span>Speed bonus</span><span class="pos">+${speedBonus}</span></div>`;
        }

        if (s.hintsUsed.length) {
            const hintPenTotal = s.hintsUsed.length * (scoring.hintPenalty || -50);
            bodyHtml += `<div class="report-score-row"><span>Hints used (${s.hintsUsed.length})</span><span class="neg">${hintPenTotal}</span></div>`;
        }
        if (s.wrongFlags) {
            const wrongPenTotal = s.wrongFlags * (scoring.wrongFlagPenalty || -25);
            bodyHtml += `<div class="report-score-row"><span>Wrong flags (${s.wrongFlags})</span><span class="neg">${wrongPenTotal}</span></div>`;
        }

        bodyHtml += `<div class="report-score-row total"><span>Final Score</span><span>${s.score}</span></div>`;
        bodyHtml += '</div></div>';

        // 4. PERFORMANCE METRICS
        bodyHtml += '<div class="report-section"><h4 class="report-section-title">PERFORMANCE METRICS</h4>';
        bodyHtml += '<div class="report-metrics-grid">';

        // Time per phase
        if (phases.length > 0) {
            phases.forEach(phase => {
                const ts = (s.phaseTimestamps || {})[phase.id];
                let dur = '--';
                if (ts && ts.started && ts.completed) {
                    const ms = ts.completed - ts.started;
                    dur = Math.round(ms / 60000) + ' min';
                }
                bodyHtml += `<div class="report-metric"><span class="report-metric-label">${this._escHtml(phase.name)}</span><span class="report-metric-value">${dur}</span></div>`;
            });
        }

        bodyHtml += `<div class="report-metric"><span class="report-metric-label">Total time</span><span class="report-metric-value">${elapsedMin} min</span></div>`;
        bodyHtml += `<div class="report-metric"><span class="report-metric-label">Hints used</span><span class="report-metric-value">${s.hintsUsed.length}</span></div>`;
        bodyHtml += `<div class="report-metric"><span class="report-metric-label">Wrong flag attempts</span><span class="report-metric-value">${s.wrongFlags}</span></div>`;

        const totalCommands = events.filter(e => e.type === 'command').length;
        bodyHtml += `<div class="report-metric"><span class="report-metric-label">Commands executed</span><span class="report-metric-value">${totalCommands}</span></div>`;

        const totalNavs = events.filter(e => e.type === 'navigate').length;
        bodyHtml += `<div class="report-metric"><span class="report-metric-label">Page navigations</span><span class="report-metric-value">${totalNavs}</span></div>`;

        bodyHtml += '</div></div>';

        // 5. RECOMMENDATIONS
        const recs = this._generateRecommendations(s, scoring, phases, flags, events);
        if (recs.length > 0) {
            bodyHtml += '<div class="report-section"><h4 class="report-section-title">RECOMMENDATIONS</h4>';
            bodyHtml += '<div class="report-recommendations">';
            recs.forEach(r => {
                bodyHtml += `<div class="report-rec-item"><span class="report-rec-icon">${r.icon}</span><span class="report-rec-text">${this._escHtml(r.text)}</span></div>`;
            });
            bodyHtml += '</div></div>';
        }

        document.getElementById('reportBody').innerHTML = bodyHtml;
        overlay.classList.add('active');
    },

    /**
     * Generate performance-based recommendations.
     */
    _generateRecommendations(state, scoring, phases, flags, events) {
        const recs = [];
        const elapsed = Date.now() - state.startTime;
        const elapsedMin = Math.round(elapsed / 60000);

        // Too many hints
        const hintRatio = flags.length > 0 ? state.hintsUsed.length / flags.length : 0;
        if (hintRatio > 0.7) {
            recs.push({ icon: '\uD83D\uDCA1', text: 'You used hints for most flags. Practice enumeration techniques to find more clues independently.' });
        } else if (hintRatio > 0.3) {
            recs.push({ icon: '\uD83D\uDCA1', text: 'Good hint usage. Try to reduce reliance on hints for a higher score next time.' });
        }

        // Too many wrong flags
        if (state.wrongFlags > flags.length * 2) {
            recs.push({ icon: '\u26A0', text: 'Many incorrect flag attempts. Read output more carefully and validate findings before submitting.' });
        } else if (state.wrongFlags > flags.length) {
            recs.push({ icon: '\u26A0', text: 'Several wrong flag attempts. Double-check flag format and values before submitting.' });
        }

        // Speed analysis
        if (scoring.speedBonus && elapsed < scoring.speedBonus.threshold) {
            recs.push({ icon: '\u26A1', text: 'Excellent speed! You earned the speed bonus. Consider trying a harder difficulty.' });
        } else if (elapsedMin > 60) {
            recs.push({ icon: '\u23F1', text: 'This took over an hour. Review your methodology to work more efficiently.' });
        }

        // Command count analysis
        const cmdCount = events.filter(e => e.type === 'command').length;
        if (cmdCount === 0) {
            recs.push({ icon: '\uD83D\uDCBB', text: 'No terminal commands logged. The terminal is your primary attack tool — practice CLI skills.' });
        } else if (cmdCount < 5) {
            recs.push({ icon: '\uD83D\uDCBB', text: 'Very few commands used. Explore more tools and techniques in the terminal.' });
        }

        // Perfect score
        if (state.hintsUsed.length === 0 && state.wrongFlags === 0) {
            recs.push({ icon: '\uD83C\uDFC6', text: 'Perfect run — no hints, no wrong flags! Outstanding work.' });
        }

        return recs;
    },

    /**
     * Export the completion report as markdown to clipboard.
     */
    _exportReportMarkdown() {
        const s = this.state;
        const config = this.config;
        const scoring = config.scoring || {};
        const phases = config.phases || [];
        const flags = config.flags || [];
        const events = s.events || [];
        const elapsed = Date.now() - s.startTime;
        const elapsedMin = Math.round(elapsed / 60000);

        let md = `# ${config.title || 'CTF Box'} — Completion Report\n\n`;
        md += `**Time:** ${elapsedMin} min | **Score:** ${s.score} | **Flags:** ${s.flagsFound.length}/${flags.length}\n\n`;

        // Attack chain
        md += `## Attack Chain\n\n`;
        if (phases.length > 0) {
            phases.forEach((phase, idx) => {
                const isCompleted = (s.completedPhases || []).includes(phase.id);
                const ts = (s.phaseTimestamps || {})[phase.id];
                let timeStr = '--';
                if (ts && ts.started && ts.completed) {
                    const ms = ts.completed - ts.started;
                    const mins = Math.floor(ms / 60000);
                    const secs = Math.floor((ms % 60000) / 1000);
                    timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                }
                md += `${idx + 1}. ${phase.icon || ''} ${phase.name} [${timeStr}] ${isCompleted ? '(COMPLETE)' : '(INCOMPLETE)'}\n`;
            });
        } else {
            const flagEvents = events.filter(e => e.type === 'flag_correct');
            flagEvents.forEach((fe, idx) => {
                const elapsed = fe.elapsed ? Math.round(fe.elapsed / 1000) : 0;
                const mins = Math.floor(elapsed / 60);
                const secs = elapsed % 60;
                md += `${idx + 1}. ${fe.data?.flagId || 'Flag'} [${mins}m ${secs}s]\n`;
            });
        }

        // MITRE
        const allMitre = [];
        phases.forEach(p => (p.mitre || []).forEach(t => { if (!allMitre.includes(t)) allMitre.push(t); }));
        flags.forEach(f => (f.mitre || []).forEach(t => { if (!allMitre.includes(t)) allMitre.push(t); }));
        if (allMitre.length > 0) {
            md += `\n## MITRE ATT&CK\n\n`;
            allMitre.forEach(t => { md += `- ${t}\n`; });
        }

        // Score breakdown
        md += `\n## Score Breakdown\n\n`;
        md += `| Item | Points |\n|------|--------|\n`;
        md += `| Base | ${scoring.base || 1000} |\n`;
        s.flagsFound.forEach(id => {
            const flag = flags.find(f => f.id === id);
            if (flag) md += `| ${id}.txt | +${flag.points} |\n`;
        });
        if (s.hintsUsed.length) md += `| Hints (${s.hintsUsed.length}) | ${s.hintsUsed.length * (scoring.hintPenalty || -50)} |\n`;
        if (s.wrongFlags) md += `| Wrong flags (${s.wrongFlags}) | ${s.wrongFlags * (scoring.wrongFlagPenalty || -25)} |\n`;
        md += `| **Total** | **${s.score}** |\n`;

        // Performance
        md += `\n## Performance\n\n`;
        md += `- Total time: ${elapsedMin} min\n`;
        md += `- Hints used: ${s.hintsUsed.length}\n`;
        md += `- Wrong attempts: ${s.wrongFlags}\n`;
        md += `- Commands: ${events.filter(e => e.type === 'command').length}\n`;

        // Recommendations
        const recs = this._generateRecommendations(s, scoring, phases, flags, events);
        if (recs.length > 0) {
            md += `\n## Recommendations\n\n`;
            recs.forEach(r => { md += `- ${r.text}\n`; });
        }

        md += `\n---\n*Generated by Hexworth Prime CTF Arena*\n`;

        // Export the report: download a .md file AND copy to clipboard. Both run
        // (not fallback) because a programmatic <a download> click can be silently
        // ignored on iOS Safari / some WebViews with NO exception thrown, so a
        // try/catch alone cannot guarantee delivery. The clipboard copy is the
        // reliable leg; the downloaded file is the visible artifact where supported.
        // CTF boxes keep their clipboard write-up workflow; ALA labs gain a real file.
        const slug = (config.registryId || config.title || 'ctf-box')
            .toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'ctf-box';
        const filename = `${slug}-completion-report.md`;
        let downloaded = false;
        try {
            const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.rel = 'noopener';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 30000);
            downloaded = true;
        } catch (e) { /* download unsupported in this context; clipboard below carries it */ }

        const okMsg = downloaded ? `Report saved as ${filename} and copied to clipboard` : 'Report copied to clipboard as markdown';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(md).then(() => {
                this.notify(okMsg, 'success');
            }).catch(() => {
                this.notify(downloaded ? `Report saved as ${filename}` : 'Failed to export report', downloaded ? 'success' : 'warning');
            });
        } else {
            this.notify(downloaded ? `Report saved as ${filename}` : 'Clipboard unavailable and download not supported', downloaded ? 'success' : 'warning');
        }
    },

    // ────────────────────────────────────────────────
    // TUTORIAL MODE (Sprint AR-12)
    // Difficulty tiers: easy (all steps + tips + auto-hint),
    //   normal (steps, no tips, normal hints),
    //   hard (no tutorial, double hint costs, time pressure)
    // ────────────────────────────────────────────────

    _initTutorial() {
        const difficulty = this._getEffectiveDifficulty();

        // Hard mode: no tutorial panel at all
        if (difficulty === 'hard') return;

        if (!this.config.tutorialMode || !this.config.tutorial) return;

        this.tutorial = {
            steps: this.config.tutorial.steps || [],
            currentStep: this.state._tutorialStep || 0,
            completed: this.state._tutorialComplete || false,
            difficulty: difficulty
        };

        if (this.tutorial.completed) return;

        // Record when current step started (for Easy mode auto-hint)
        if (!this.state._tutorialStepStartedAt) {
            this.state._tutorialStepStartedAt = Date.now();
            this.save();
        }

        // Build tutorial UI
        this._buildTutorialPanel();
        this._renderTutorialPanel();

        // Wrap _logEvent to auto-advance tutorial steps on matching events
        const self = this;
        const origLog = this._logEvent.bind(this);
        this._logEvent = function(type, data) {
            origLog(type, data);
            self._checkTutorialProgress(type, data);
        };

        // Easy mode: start auto-hint timer (checks every 30s if student is stuck)
        if (difficulty === 'easy') {
            this._tutorialAutoHintInterval = setInterval(() => {
                self._checkAutoHint();
            }, 30000);
        }
    },

    _buildTutorialPanel() {
        const difficulty = this.tutorial.difficulty;
        const diffLabel = difficulty === 'easy' ? 'GUIDED' : 'OBJECTIVES';
        const diffBadgeClass = 'tutorial-difficulty-badge tutorial-diff-' + difficulty;

        const panel = document.createElement('div');
        panel.className = 'tutorial-panel';
        panel.id = 'tutorialPanel';
        panel.innerHTML = `
            <div class="tutorial-header">
                <span class="tutorial-icon">\uD83D\uDCCB</span>
                <span class="tutorial-title">${diffLabel}</span>
                <span class="${diffBadgeClass}">${this._escHtml(difficulty.toUpperCase())}</span>
                <button class="tutorial-toggle" id="tutorialToggle">\u2212</button>
            </div>
            <div class="tutorial-progress" id="tutorialProgress"></div>
            <div class="tutorial-steps" id="tutorialSteps"></div>
            <div class="tutorial-tip" id="tutorialTip"></div>
        `;
        this._desktopEl.appendChild(panel);

        document.getElementById('tutorialToggle').addEventListener('click', () => {
            panel.classList.toggle('collapsed');
            document.getElementById('tutorialToggle').textContent = panel.classList.contains('collapsed') ? '+' : '\u2212';
        });
    },

    /**
     * Render/refresh the tutorial panel: progress bar, steps, and tip.
     * Called on init and after each step completion.
     */
    _renderTutorialPanel() {
        const stepsEl = document.getElementById('tutorialSteps');
        const tipEl = document.getElementById('tutorialTip');
        const progressEl = document.getElementById('tutorialProgress');
        if (!stepsEl || !tipEl) return;

        const index = this.tutorial.currentStep;
        const total = this.tutorial.steps.length;
        const difficulty = this.tutorial.difficulty;
        const showAllSteps = difficulty === 'easy';
        const showTips = difficulty === 'easy';

        // Update progress bar
        if (progressEl) {
            const pct = total > 0 ? Math.round((index / total) * 100) : 0;
            progressEl.innerHTML = `<div class="tutorial-progress-bar"><div class="tutorial-progress-fill" style="width:${pct}%"></div></div><span class="tutorial-progress-label">${index}/${total}</span>`;
        }

        // Render step list
        stepsEl.innerHTML = '';
        this.tutorial.steps.forEach((step, i) => {
            const isCompleted = i < index;
            const isActive = i === index;
            const isLocked = i > index;
            const isRevealed = showAllSteps || i <= index;

            const el = document.createElement('div');
            el.className = 'tutorial-step';
            if (isCompleted) el.classList.add('completed');
            else if (isActive) el.classList.add('active');
            else el.classList.add('locked');

            const checkIcon = isCompleted ? '\u2713' : isActive ? '\u25BA' : '\u25CB';
            const stepText = isRevealed ? this._escHtml(step.title) : '???';

            el.innerHTML = `<span class="step-check">${checkIcon}</span><span class="step-text">${stepText}</span>`;
            stepsEl.appendChild(el);
        });

        // Show tip for current step (Easy mode always shows, Normal never shows)
        if (index < total) {
            const step = this.tutorial.steps[index];
            if (showTips && step.tip) {
                tipEl.innerHTML = `<strong>Tip:</strong> ${this._escHtml(step.tip)}`;
                tipEl.style.display = 'block';
            } else {
                tipEl.style.display = 'none';
            }
        } else {
            tipEl.innerHTML = '<strong>All objectives complete!</strong> Submit your flags.';
            tipEl.style.display = 'block';
        }

        // Auto-scroll to active step
        const activeStep = stepsEl.querySelector('.tutorial-step.active');
        if (activeStep) activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    /**
     * Reveal the next tutorial step with a glow/pulse animation.
     * Called after a step is completed.
     */
    _revealNextStep(newIndex) {
        // Update the panel
        this._renderTutorialPanel();

        // Add glow animation to the newly active step
        const stepsEl = document.getElementById('tutorialSteps');
        if (!stepsEl) return;
        const activeStep = stepsEl.querySelector('.tutorial-step.active');
        if (activeStep) {
            activeStep.classList.add('tutorial-step-reveal');
            // Remove animation class after it plays (600ms)
            setTimeout(() => activeStep.classList.remove('tutorial-step-reveal'), 800);
        }

        // Pulse the panel border briefly
        const panel = document.getElementById('tutorialPanel');
        if (panel) {
            panel.classList.add('tutorial-panel-pulse');
            setTimeout(() => panel.classList.remove('tutorial-panel-pulse'), 1200);
        }
    },

    /**
     * Easy mode: auto-reveal the first unused hint after 3 minutes stuck on the same step.
     * This is a gentler nudge than the hint system — no point penalty.
     */
    _checkAutoHint() {
        if (!this.tutorial || this.tutorial.completed) return;
        if (this.tutorial.difficulty !== 'easy') return;

        const stepStarted = this.state._tutorialStepStartedAt || Date.now();
        const elapsed = Date.now() - stepStarted;
        const AUTO_HINT_THRESHOLD = 180000; // 3 minutes

        if (elapsed >= AUTO_HINT_THRESHOLD) {
            // Find the first unrevealed hint
            const hints = this.config.hints || [];
            const unused = hints.find(h => !this.state.hintsUsed.includes(h.id));
            if (unused) {
                // Auto-reveal hint without penalty
                this.state.hintsUsed.push(unused.id);
                this.save();
                this._renderHints();
                this._logEvent('tutorial_auto_hint', { hintId: unused.id, stepIndex: this.tutorial.currentStep });

                // Show the tip in the tutorial panel as a nudge
                const tipEl = document.getElementById('tutorialTip');
                if (tipEl) {
                    const step = this.tutorial.steps[this.tutorial.currentStep];
                    tipEl.innerHTML = `<strong>Hint unlocked (free):</strong> ${this._escHtml(unused.text)}`;
                    tipEl.style.display = 'block';
                    tipEl.classList.add('tutorial-tip-flash');
                    setTimeout(() => tipEl.classList.remove('tutorial-tip-flash'), 1500);
                }

                this.notify('Stuck? A free hint has been unlocked for you.', 'info');

                // Reset the step timer so it doesn't fire again immediately
                this.state._tutorialStepStartedAt = Date.now();
                this.save();
            }
        }
    },

    _checkTutorialProgress(eventType, eventData) {
        if (!this.tutorial || this.tutorial.completed) return;

        const step = this.tutorial.steps[this.tutorial.currentStep];
        if (!step) return;

        // Check if the current event matches the step's completion trigger
        let matched = false;

        if (step.trigger) {
            if (step.trigger.event === eventType) {
                // Check additional conditions
                if (step.trigger.match) {
                    matched = Object.entries(step.trigger.match).every(([key, val]) => {
                        if (typeof val === 'string' && val.startsWith('contains:')) {
                            return String(eventData[key] || '').toLowerCase().includes(val.slice(9).toLowerCase());
                        }
                        return eventData[key] === val;
                    });
                } else {
                    matched = true;
                }
            }

            // Also check alternate triggers (array of {event, match} objects)
            if (!matched && step.trigger.alt) {
                for (const alt of step.trigger.alt) {
                    if (alt.event === eventType) {
                        if (alt.match) {
                            const altMatch = Object.entries(alt.match).every(([key, val]) => {
                                if (typeof val === 'string' && val.startsWith('contains:')) {
                                    return String(eventData[key] || '').toLowerCase().includes(val.slice(9).toLowerCase());
                                }
                                return eventData[key] === val;
                            });
                            if (altMatch) { matched = true; break; }
                        } else {
                            matched = true; break;
                        }
                    }
                }
            }

            // Also check flag-based triggers
            if (!matched && step.trigger.flagCaptured && this.state.flagsFound.includes(step.trigger.flagCaptured)) {
                matched = true;
            }
        }

        if (matched) {
            this.tutorial.currentStep++;
            this.state._tutorialStep = this.tutorial.currentStep;

            // Reset step timer for auto-hint
            this.state._tutorialStepStartedAt = Date.now();
            this.save();

            this.notify(`Objective ${this.tutorial.currentStep}/${this.tutorial.steps.length} complete!`, 'success');
            this._logEvent('tutorial_step_complete', { step: this.tutorial.currentStep, difficulty: this.tutorial.difficulty });

            if (this.tutorial.currentStep >= this.tutorial.steps.length) {
                this.tutorial.completed = true;
                this.state._tutorialComplete = true;
                this.save();
                this.notify('All tutorial objectives complete! Great work!', 'success');
                this._logEvent('tutorial_complete', { totalSteps: this.tutorial.steps.length, difficulty: this.tutorial.difficulty });

                // Stop auto-hint timer
                if (this._tutorialAutoHintInterval) {
                    clearInterval(this._tutorialAutoHintInterval);
                    this._tutorialAutoHintInterval = null;
                }
            }

            // Animate the reveal of the next step
            this._revealNextStep(this.tutorial.currentStep);
        }
    },

    // ============================================================
    // BLUE TEAM STATE MACHINE
    // Opt-in via config: blueTeamMode: true, btPhases: ['triage', ...]
    // Provides a phase indicator bar at the top of the desktop and
    // methods for IR/forensics/hardening dispatch boxes to drive
    // scenario flow. All methods are no-ops when blueTeamMode is not set.
    // ============================================================

    /**
     * Initialize the blue team phase system from config.
     * Called from _showDesktop after DOM is ready, alongside _initPhases().
     * No-op if config.blueTeamMode is not true.
     */
    _initBlueTeam() {
        if (!this.config.blueTeamMode) return;

        // Valid phase names — config may provide a subset or reorder
        const VALID_PHASES = ['triage', 'diagnosis', 'remediation', 'verification', 'documentation'];
        const configPhases = this.config.btPhases || ['triage', 'diagnosis', 'remediation', 'verification'];

        // Validate and sanitize
        this._btPhaseList = configPhases.filter(p => VALID_PHASES.includes(p));
        if (this._btPhaseList.length === 0) {
            this._btPhaseList = ['triage', 'diagnosis', 'remediation', 'verification'];
        }

        // Restore or initialize blue team state
        if (!this.state._btPhaseIndex) this.state._btPhaseIndex = 0;
        if (!this.state._btPhaseTimestamps) this.state._btPhaseTimestamps = {};

        // Record start time for initial phase
        const currentPhase = this._btPhaseList[this.state._btPhaseIndex];
        if (currentPhase && !this.state._btPhaseTimestamps[currentPhase]) {
            this.state._btPhaseTimestamps[currentPhase] = { started: Date.now() };
        }

        this.save();
        this._renderPhaseBar();

        this._logEvent('bt_init', {
            phases: this._btPhaseList,
            currentPhase: this._getPhase()
        });

        console.log(`%c[ARENA] Blue team mode active — phase: ${this._getPhase()}`, 'color: #27ae60');
    },

    /**
     * Return the current blue team phase name.
     * Returns null if blue team mode is not active.
     */
    _getPhase() {
        if (!this.config.blueTeamMode || !this._btPhaseList) return null;
        const idx = this.state._btPhaseIndex || 0;
        return this._btPhaseList[idx] || null;
    },

    /**
     * Jump to a named phase. Useful for config boxes that need to
     * programmatically set phase based on scenario conditions.
     * No-op if phase name is not in the phase list.
     */
    _setPhase(name) {
        if (!this.config.blueTeamMode || !this._btPhaseList) return;
        const idx = this._btPhaseList.indexOf(name);
        if (idx === -1) return;

        const prev = this._getPhase();
        this.state._btPhaseIndex = idx;

        // Record timestamp for new phase
        if (!this.state._btPhaseTimestamps[name]) {
            this.state._btPhaseTimestamps[name] = { started: Date.now() };
        }

        this.save();
        this._renderPhaseBar();
        this._logEvent('bt_phase_set', { from: prev, to: name });
    },

    /**
     * Advance to the next phase in sequence.
     * Records completion timestamp for the outgoing phase.
     * Fires config.onPhaseComplete(phaseName, engine) callback if defined.
     * No-op if already on the final phase.
     */
    _advancePhase() {
        if (!this.config.blueTeamMode || !this._btPhaseList) return;

        const currentIdx = this.state._btPhaseIndex || 0;
        const currentPhase = this._btPhaseList[currentIdx];

        if (currentIdx >= this._btPhaseList.length - 1) {
            // Already on last phase — notify and bail
            this.notify('All phases complete.', 'success');
            return;
        }

        // Record completion timestamp for outgoing phase
        if (!this.state._btPhaseTimestamps) this.state._btPhaseTimestamps = {};
        if (!this.state._btPhaseTimestamps[currentPhase]) {
            this.state._btPhaseTimestamps[currentPhase] = { started: this.state.startTime };
        }
        this.state._btPhaseTimestamps[currentPhase].completed = Date.now();

        // Move to next phase
        const nextIdx = currentIdx + 1;
        const nextPhase = this._btPhaseList[nextIdx];
        this.state._btPhaseIndex = nextIdx;

        // Record start for incoming phase
        if (!this.state._btPhaseTimestamps[nextPhase]) {
            this.state._btPhaseTimestamps[nextPhase] = { started: Date.now() };
        }

        this.save();
        this._renderPhaseBar();

        this._logEvent('bt_phase_advance', { from: currentPhase, to: nextPhase });
        this.notify('Phase advanced: ' + nextPhase.toUpperCase(), 'success');

        // Fire config callback
        if (typeof this.config.onPhaseComplete === 'function') {
            try { this.config.onPhaseComplete(currentPhase, this); } catch (e) { /* silent */ }
        }
    },

    /**
     * Build or rebuild the blue team phase bar shown above the desktop icons.
     * The bar is a horizontal stepper with phase names and a progress indicator.
     */
    _renderPhaseBar() {
        if (!this.config.blueTeamMode || !this._btPhaseList) return;

        const arena = document.getElementById('arena');
        if (!arena) return;

        // Remove existing bar before rebuilding
        const existing = document.getElementById('btPhaseBar');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.className = 'bt-phase-bar';
        bar.id = 'btPhaseBar';

        const currentIdx = this.state._btPhaseIndex || 0;

        // Phase label map — human-readable names
        const LABELS = {
            triage: 'Triage',
            diagnosis: 'Diagnosis',
            remediation: 'Remediation',
            verification: 'Verification',
            documentation: 'Documentation'
        };

        let stepsHtml = '';
        this._btPhaseList.forEach(function(phase, idx) {
            var status = 'pending';
            if (idx < currentIdx) status = 'done';
            else if (idx === currentIdx) status = 'active';

            stepsHtml += '<div class="bt-phase-step ' + status + '" data-phase="' + phase + '">';
            stepsHtml += '<div class="bt-phase-dot"><span class="bt-phase-dot-inner">' + (idx + 1) + '</span></div>';
            stepsHtml += '<div class="bt-phase-label">' + (LABELS[phase] || phase) + '</div>';
            stepsHtml += '</div>';

            if (idx < this._btPhaseList.length - 1) {
                stepsHtml += '<div class="bt-phase-connector ' + (idx < currentIdx ? 'done' : '') + '"></div>';
            }
        }, this);

        bar.innerHTML = '<div class="bt-phase-bar-inner">' + stepsHtml + '</div>';

        // Insert above desktop icons, inside .arena-desktop
        const desktop = this._desktopEl;
        if (desktop) {
            desktop.insertBefore(bar, desktop.firstChild);
        }
    },

    // ============================================================
    // GUI WINDOW FRAMEWORK EXTENSIONS
    // New window types: event_viewer, tree_panel, properties, hardware_inspector
    // Used by openWindow via the _openWindow helper below.
    // Config boxes call BoxEngine.openGuiWindow(id, type, config).
    // ============================================================

    /**
     * Unified entry point for typed GUI windows.
     * Usage: BoxEngine.openGuiWindow('evtlog', 'event_viewer', { title, icon, eventLog: [...] })
     *
     * Falls through to openWindow() with the appropriate content element.
     * Opts boxes into the draggable/resizable window chrome automatically.
     */
    openGuiWindow(appId, type, cfg) {
        // If already open, just focus it
        if (this._windows[appId]) {
            this._focusWindow(appId);
            const existing = this._windows[appId];
            if (existing.el.classList.contains('minimized')) {
                existing.el.classList.remove('minimized');
            }
            return existing;
        }

        var contentEl = document.createElement('div');
        contentEl.className = 'gui-window-content';

        switch (type) {
            case 'event_viewer':
                contentEl.innerHTML = this._buildEventViewerWindow(cfg);
                this._attachEventViewerHandlers(contentEl, cfg);
                break;
            case 'tree_panel':
                contentEl.innerHTML = this._buildTreePanelWindow(cfg);
                this._attachTreePanelHandlers(contentEl, cfg);
                break;
            case 'properties':
                contentEl.innerHTML = this._buildPropertiesDialog(cfg);
                this._attachPropertiesHandlers(contentEl, cfg);
                break;
            case 'hardware_inspector':
                contentEl.innerHTML = this._buildHardwareInspector(cfg);
                this._attachHardwareInspectorHandlers(contentEl, cfg);
                break;
            default:
                contentEl.textContent = 'Unknown window type: ' + type;
        }

        var win = this.openWindow(appId, cfg.title || type, cfg.icon || '', contentEl);
        this._logEvent('gui_window_open', { type: type, appId: appId });
        return win;
    },

    /**
     * Build HTML for an Event Viewer window.
     * Renders a filterable log table with expandable rows.
     *
     * Config shape:
     *   eventLog: [{ timestamp, eventId, source, category, description, detail }]
     */
    _buildEventViewerWindow(cfg) {
        var events = cfg.eventLog || [];

        // Build unique Event ID list for filter dropdown
        var ids = [];
        events.forEach(function(ev) {
            if (ev.eventId && ids.indexOf(String(ev.eventId)) === -1) ids.push(String(ev.eventId));
        });
        ids.sort();

        var idOptions = '<option value="">All Event IDs</option>';
        ids.forEach(function(id) { idOptions += '<option value="' + id + '">' + id + '</option>'; });

        var rowsHtml = '';
        events.forEach(function(ev, idx) {
            var catClass = ev.category ? 'evcat-' + ev.category.toLowerCase().replace(/\s+/g, '-') : '';
            rowsHtml += '<tr class="ev-row ' + catClass + '" data-idx="' + idx + '">';
            rowsHtml += '<td class="ev-ts">' + (ev.timestamp || '') + '</td>';
            rowsHtml += '<td class="ev-id">' + (ev.eventId || '') + '</td>';
            rowsHtml += '<td class="ev-src">' + (ev.source || '') + '</td>';
            rowsHtml += '<td class="ev-cat">' + (ev.category || '') + '</td>';
            rowsHtml += '<td class="ev-desc">' + (ev.description || '') + '</td>';
            rowsHtml += '</tr>';
            if (ev.detail) {
                rowsHtml += '<tr class="ev-detail-row" data-for="' + idx + '" style="display:none;">';
                rowsHtml += '<td colspan="5" class="ev-detail-cell">' + ev.detail + '</td>';
                rowsHtml += '</tr>';
            }
        });

        return '<div class="ev-viewer">' +
            '<div class="ev-toolbar">' +
            '<select class="ev-filter-id" title="Filter by Event ID">' + idOptions + '</select>' +
            '<input class="ev-filter-src" type="text" placeholder="Filter source..." title="Filter by source IP or host">' +
            '<span class="ev-count" id="evCount_all">' + events.length + ' events</span>' +
            '</div>' +
            '<div class="ev-table-wrap">' +
            '<table class="ev-table">' +
            '<thead><tr>' +
            '<th>Timestamp</th><th>Event ID</th><th>Source</th><th>Category</th><th>Description</th>' +
            '</tr></thead>' +
            '<tbody id="evTbody">' + rowsHtml + '</tbody>' +
            '</table>' +
            '</div>' +
            '</div>';
    },

    /**
     * Wire up event viewer filter controls and row expand/collapse.
     */
    _attachEventViewerHandlers(el, cfg) {
        var self = this;
        var events = cfg.eventLog || [];

        var filterById = function() {
            var idVal = el.querySelector('.ev-filter-id').value;
            var srcVal = el.querySelector('.ev-filter-src').value.toLowerCase().trim();
            var rows = el.querySelectorAll('.ev-row');
            var visible = 0;
            rows.forEach(function(row) {
                var idx = parseInt(row.dataset.idx, 10);
                var ev = events[idx] || {};
                var idMatch = !idVal || String(ev.eventId) === idVal;
                var srcMatch = !srcVal || (ev.source || '').toLowerCase().includes(srcVal);
                var show = idMatch && srcMatch;
                row.style.display = show ? '' : 'none';
                // Keep detail row hidden regardless — expand toggle handles it
                var detail = el.querySelector('.ev-detail-row[data-for="' + idx + '"]');
                if (detail && !show) detail.style.display = 'none';
                if (show) visible++;
            });
            var counter = el.querySelector('.ev-count');
            if (counter) counter.textContent = visible + ' events';
        };

        el.querySelector('.ev-filter-id').addEventListener('change', filterById);
        el.querySelector('.ev-filter-src').addEventListener('input', filterById);

        // Row click: expand/collapse detail
        el.querySelector('#evTbody').addEventListener('click', function(e) {
            var row = e.target.closest('.ev-row');
            if (!row) return;
            var idx = row.dataset.idx;
            var detail = el.querySelector('.ev-detail-row[data-for="' + idx + '"]');
            if (!detail) return;
            var isOpen = detail.style.display !== 'none';
            detail.style.display = isOpen ? 'none' : 'table-row';
            row.classList.toggle('ev-row-expanded', !isOpen);
            self._logEvent('ev_viewer_expand', { eventIdx: parseInt(idx, 10) });
        });
    },

    /**
     * Build HTML for a Tree Panel window.
     * Left panel: expandable/collapsible tree. Right panel: node details.
     *
     * Config shape:
     *   tree: { root: { label, children: [{ label, data, children }] } }
     *   onSelect: function(node, engine) — optional callback
     */
    _buildTreePanelWindow(cfg) {
        var tree = cfg.tree || {};
        var root = tree.root || { label: 'Root', children: [] };

        var buildNode = function(node, depth) {
            var hasChildren = node.children && node.children.length > 0;
            var indent = depth * 14;
            var html = '<div class="tp-node' + (hasChildren ? ' tp-has-children' : '') + '" data-node="' + (node.id || '') + '" style="padding-left:' + indent + 'px">';
            if (hasChildren) {
                html += '<span class="tp-toggle">&#9654;</span>';
            } else {
                html += '<span class="tp-toggle-spacer"></span>';
            }
            html += '<span class="tp-node-label">' + node.label + '</span>';
            html += '</div>';
            if (hasChildren) {
                html += '<div class="tp-children" style="display:none;">';
                node.children.forEach(function(child) {
                    html += buildNode(child, depth + 1);
                });
                html += '</div>';
            }
            return html;
        };

        var treeHtml = buildNode(root, 0);

        return '<div class="tp-panel">' +
            '<div class="tp-left">' +
            '<div class="tp-tree-header">Object Tree</div>' +
            '<div class="tp-tree">' + treeHtml + '</div>' +
            '</div>' +
            '<div class="tp-divider"></div>' +
            '<div class="tp-right">' +
            '<div class="tp-detail-header">Details</div>' +
            '<div class="tp-detail-body" id="tpDetailBody">Select an item to view details.</div>' +
            '</div>' +
            '</div>';
    },

    /**
     * Wire up tree expand/collapse and node selection.
     * Builds a flat node map so selection lookup is O(1).
     */
    _attachTreePanelHandlers(el, cfg) {
        var self = this;

        // Flatten the tree into a map by label (simple key for config boxes)
        var nodeMap = {};
        var flattenTree = function(node) {
            nodeMap[node.label] = node;
            if (node.id) nodeMap[node.id] = node;
            if (node.children) node.children.forEach(flattenTree);
        };
        if (cfg.tree && cfg.tree.root) flattenTree(cfg.tree.root);

        el.addEventListener('click', function(e) {
            var toggle = e.target.closest('.tp-toggle');
            var nodeEl = e.target.closest('.tp-node');

            // Expand/collapse on toggle click
            if (toggle && nodeEl) {
                var childrenEl = nodeEl.nextElementSibling;
                if (childrenEl && childrenEl.classList.contains('tp-children')) {
                    var isOpen = childrenEl.style.display !== 'none';
                    childrenEl.style.display = isOpen ? 'none' : 'block';
                    toggle.innerHTML = isOpen ? '&#9654;' : '&#9660;';
                }
                return;
            }

            // Node selection
            if (nodeEl) {
                // Deselect previous
                el.querySelectorAll('.tp-node.selected').forEach(function(n) { n.classList.remove('selected'); });
                nodeEl.classList.add('selected');

                var label = nodeEl.querySelector('.tp-node-label');
                var labelText = label ? label.textContent : '';
                var node = nodeMap[labelText] || {};
                var detailBody = el.querySelector('#tpDetailBody');

                // Render node data in right panel
                if (detailBody) {
                    if (node.data) {
                        var html = '<table class="tp-detail-table">';
                        Object.keys(node.data).forEach(function(key) {
                            html += '<tr><td class="tp-detail-key">' + key + '</td><td class="tp-detail-val">' + node.data[key] + '</td></tr>';
                        });
                        html += '</table>';
                        detailBody.innerHTML = html;
                    } else {
                        detailBody.textContent = 'No details for: ' + labelText;
                    }
                }

                self._logEvent('tp_node_select', { label: labelText });

                // Fire config callback
                if (typeof cfg.onSelect === 'function') {
                    try { cfg.onSelect(node, self); } catch (e2) { /* silent */ }
                }
            }
        });
    },

    /**
     * Build HTML for a Properties dialog window.
     * Tabbed property sheet — each tab has a list of fields.
     *
     * Config shape:
     *   tabs: [{ label, fields: [{ name, value, editable, type }] }]
     *   onSave: function(tabLabel, field, value, engine) — optional
     */
    _buildPropertiesDialog(cfg) {
        var tabs = cfg.tabs || [];
        if (tabs.length === 0) return '<div class="pd-empty">No properties configured.</div>';

        var tabBtns = '';
        var tabPanels = '';
        tabs.forEach(function(tab, idx) {
            var active = idx === 0 ? ' active' : '';
            tabBtns += '<button class="pd-tab-btn' + active + '" data-tab="' + idx + '">' + tab.label + '</button>';

            var fields = tab.fields || [];
            var fieldsHtml = '';
            fields.forEach(function(field) {
                var inputHtml;
                if (field.editable) {
                    if (field.type === 'select' && field.options) {
                        inputHtml = '<select class="pd-field-input" data-field="' + field.name + '">';
                        field.options.forEach(function(opt) {
                            var sel = opt === field.value ? ' selected' : '';
                            inputHtml += '<option' + sel + '>' + opt + '</option>';
                        });
                        inputHtml += '</select>';
                    } else if (field.type === 'checkbox') {
                        var chk = field.value ? ' checked' : '';
                        inputHtml = '<input type="checkbox" class="pd-field-checkbox" data-field="' + field.name + '"' + chk + '>';
                    } else {
                        inputHtml = '<input type="text" class="pd-field-input" data-field="' + field.name + '" value="' + (field.value || '') + '">';
                    }
                } else {
                    inputHtml = '<span class="pd-field-value">' + (field.value || '') + '</span>';
                }
                fieldsHtml += '<div class="pd-field-row"><label class="pd-field-label">' + field.name + ':</label>' + inputHtml + '</div>';
            });

            tabPanels += '<div class="pd-tab-panel' + active + '" data-panel="' + idx + '">' + fieldsHtml + '</div>';
        });

        return '<div class="pd-dialog">' +
            '<div class="pd-tab-bar">' + tabBtns + '</div>' +
            '<div class="pd-tab-content">' + tabPanels + '</div>' +
            '<div class="pd-actions">' +
            '<button class="pd-apply-btn">Apply</button>' +
            '<button class="pd-ok-btn">OK</button>' +
            '</div>' +
            '</div>';
    },

    /**
     * Wire tab switching and Apply/OK for the properties dialog.
     */
    _attachPropertiesHandlers(el, cfg) {
        var self = this;
        var tabs = cfg.tabs || [];

        // Tab switching
        el.querySelectorAll('.pd-tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tabIdx = btn.dataset.tab;
                el.querySelectorAll('.pd-tab-btn').forEach(function(b) { b.classList.remove('active'); });
                el.querySelectorAll('.pd-tab-panel').forEach(function(p) { p.classList.remove('active'); });
                btn.classList.add('active');
                el.querySelector('.pd-tab-panel[data-panel="' + tabIdx + '"]').classList.add('active');
            });
        });

        var collectAndFire = function() {
            el.querySelectorAll('.pd-field-input, .pd-field-checkbox').forEach(function(input) {
                var fieldName = input.dataset.field;
                var value = input.type === 'checkbox' ? input.checked : input.value;
                var activePanelIdx = parseInt(el.querySelector('.pd-tab-btn.active').dataset.tab, 10);
                var tabLabel = (tabs[activePanelIdx] || {}).label || '';
                self._logEvent('pd_field_change', { tab: tabLabel, field: fieldName, value: value });
                if (typeof cfg.onSave === 'function') {
                    try { cfg.onSave(tabLabel, fieldName, value, self); } catch (e) { /* silent */ }
                }
            });
        };

        el.querySelector('.pd-apply-btn').addEventListener('click', collectAndFire);
        el.querySelector('.pd-ok-btn').addEventListener('click', function() {
            collectAndFire();
            // OK closes the window — find parent window appId from data-app
            var win = el.closest('.arena-window');
            if (win && win.dataset.app) self.closeWindow(win.dataset.app);
        });
    },

    /**
     * Build HTML for a Hardware Inspector window.
     * Renders an SVG-based component overview with status indicators.
     * Clicking a component fires its clickAction callback.
     *
     * Config shape:
     *   components: [{ id, label, x, y, w, h, status, detail }]
     *   onComponentClick: function(component, engine)
     */
    _buildHardwareInspector(cfg) {
        var components = cfg.components || [];

        // Status color map
        var STATUS_COLORS = {
            ok: '#2ecc71',
            warn: '#f39c12',
            fail: '#e74c3c',
            unknown: '#555'
        };

        var svgItems = '';
        var listItems = '';

        components.forEach(function(comp) {
            var x = comp.x || 0;
            var y = comp.y || 0;
            var w = comp.w || 120;
            var h = comp.h || 60;
            var color = STATUS_COLORS[comp.status] || STATUS_COLORS.unknown;
            var label = comp.label || comp.id;

            // SVG component block
            svgItems += '<g class="hw-component" data-comp-id="' + comp.id + '" style="cursor:pointer">';
            svgItems += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"';
            svgItems += ' rx="4" fill="rgba(20,20,30,0.9)" stroke="' + color + '" stroke-width="1.5"/>';
            // Status dot
            svgItems += '<circle cx="' + (x + w - 10) + '" cy="' + (y + 10) + '" r="4" fill="' + color + '"/>';
            // Label text
            svgItems += '<text x="' + (x + w / 2) + '" y="' + (y + h / 2) + '"';
            svgItems += ' text-anchor="middle" dominant-baseline="middle" fill="#ccc" font-size="10" font-family="Courier New, monospace">' + label + '</text>';
            svgItems += '</g>';

            // Sidebar list entry
            listItems += '<div class="hw-list-item" data-comp-id="' + comp.id + '">';
            listItems += '<span class="hw-status-dot" style="background:' + color + '"></span>';
            listItems += '<span class="hw-list-label">' + label + '</span>';
            listItems += '<span class="hw-list-status">' + (comp.status || 'unknown') + '</span>';
            listItems += '</div>';
        });

        return '<div class="hw-inspector">' +
            '<div class="hw-svg-wrap">' +
            '<svg class="hw-svg" viewBox="0 0 680 360" xmlns="http://www.w3.org/2000/svg">' +
            // Motherboard background
            '<rect x="10" y="10" width="660" height="340" rx="8" fill="#0a0a12" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
            svgItems +
            '</svg>' +
            '</div>' +
            '<div class="hw-sidebar">' +
            '<div class="hw-sidebar-header">Components</div>' +
            '<div class="hw-list">' + listItems + '</div>' +
            '<div class="hw-detail-panel" id="hwDetailPanel">Click a component for details.</div>' +
            '</div>' +
            '</div>';
    },

    /**
     * Wire SVG and list clicks for the hardware inspector.
     */
    _attachHardwareInspectorHandlers(el, cfg) {
        var self = this;
        var components = cfg.components || [];

        var compMap = {};
        components.forEach(function(c) { compMap[c.id] = c; });

        var selectComp = function(id) {
            var comp = compMap[id];
            if (!comp) return;

            // Highlight SVG item
            el.querySelectorAll('.hw-component').forEach(function(g) {
                g.classList.toggle('selected', g.dataset.compId === id);
            });
            // Highlight list item
            el.querySelectorAll('.hw-list-item').forEach(function(item) {
                item.classList.toggle('selected', item.dataset.compId === id);
            });

            // Render detail panel
            var detail = el.querySelector('#hwDetailPanel');
            if (detail) {
                var html = '<strong>' + comp.label + '</strong>';
                html += '<div class="hw-detail-status hw-status-' + (comp.status || 'unknown') + '">' + (comp.status || 'unknown').toUpperCase() + '</div>';
                if (comp.detail) html += '<div class="hw-detail-text">' + comp.detail + '</div>';
                detail.innerHTML = html;
            }

            self._logEvent('hw_component_click', { id: id, status: comp.status });

            if (typeof cfg.onComponentClick === 'function') {
                try { cfg.onComponentClick(comp, self); } catch (e) { /* silent */ }
            }
        };

        // SVG click delegation
        el.querySelector('.hw-svg').addEventListener('click', function(e) {
            var g = e.target.closest('.hw-component');
            if (g) selectComp(g.dataset.compId);
        });

        // Sidebar list click delegation
        el.querySelector('.hw-list').addEventListener('click', function(e) {
            var item = e.target.closest('.hw-list-item');
            if (item) selectComp(item.dataset.compId);
        });
    },

    // ============================================================
    // WINRE BOOT SEQUENCE VARIANT
    // Activated by config: bootSequence: 'winre'
    // Shows BSOD -> restart -> "Preparing Automatic Repair" ->
    // "Choose an option" menu with Troubleshoot -> Advanced Options.
    // Each Advanced Options item may be wired to config.winreCallbacks.
    // ============================================================

    /**
     * Check config.bootSequence and route to the correct boot handler.
     * Called in place of _startBoot() when bootSequence is set.
     * Currently supports: 'winre' | default (Linux/BIOS flow).
     */
    _startBoot() {
        if (this.state.godMode) {
            this.state.booted = true;
            this.save();
            this._showDesktop();
            return;
        }

        if (this.config.bootSequence === 'winre') {
            this._bootWinRE();
            return;
        }

        // Default: original Linux/BIOS boot flow
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

    /**
     * WinRE boot sequence.
     * Phase 1: Blue screen of death (2.5s or click to skip)
     * Phase 2: "Restarting" spinner (1.5s)
     * Phase 3: "Preparing Automatic Repair" spinner (2s)
     * Phase 4: "Choose an option" menu
     * Phase 5: Troubleshoot -> Advanced Options sub-menu
     *
     * Config hooks:
     *   config.winreCallbacks: {
     *     startupRepair: function(engine),
     *     startupSettings: function(engine),
     *     systemRestore: function(engine),
     *     uninstallUpdates: function(engine),
     *     commandPrompt: function(engine)
     *   }
     */
    _bootWinRE() {
        var self = this;
        var arena = document.getElementById('arena');

        // Helper: remove all WinRE screens
        var clearWinRE = function() {
            var existing = arena.querySelectorAll('.winre-screen');
            existing.forEach(function(el) { el.remove(); });
        };

        // ── Phase 1: BSOD ──
        var bsod = document.createElement('div');
        bsod.className = 'winre-screen winre-bsod';
        bsod.innerHTML =
            '<div class="winre-bsod-inner">' +
            '<div class="winre-bsod-sad">:&#40;</div>' +
            '<div class="winre-bsod-title">Your PC ran into a problem and needs to restart.</div>' +
            '<div class="winre-bsod-detail">We\'re collecting some error info, and then we\'ll restart for you.</div>' +
            '<div class="winre-bsod-progress">' +
            '<div class="winre-bsod-bar"><div class="winre-bsod-bar-fill" id="bsodBarFill"></div></div>' +
            '<span class="winre-bsod-pct" id="bsodPct">0%</span> complete' +
            '</div>' +
            '<div class="winre-bsod-code">CRITICAL_PROCESS_DIED</div>' +
            '</div>';
        arena.appendChild(bsod);

        // Animate progress bar 0 -> 100% over 2.5s
        var pct = 0;
        var barFill = bsod.querySelector('#bsodBarFill');
        var bsodPct = bsod.querySelector('#bsodPct');
        var bsodInterval = setInterval(function() {
            pct = Math.min(100, pct + Math.floor(Math.random() * 8) + 3);
            if (barFill) barFill.style.width = pct + '%';
            if (bsodPct) bsodPct.textContent = pct + '%';
            if (pct >= 100) {
                clearInterval(bsodInterval);
                setTimeout(showRestart, 400);
            }
        }, 80);

        // ── Phase 2: Restarting ──
        var showRestart = function() {
            clearWinRE();
            var restart = document.createElement('div');
            restart.className = 'winre-screen winre-restart';
            restart.innerHTML =
                '<div class="winre-spinner"></div>' +
                '<div class="winre-restart-label">Restarting...</div>';
            arena.appendChild(restart);
            setTimeout(showPreparing, 1500);
        };

        // ── Phase 3: Preparing Automatic Repair ──
        var showPreparing = function() {
            clearWinRE();
            var prep = document.createElement('div');
            prep.className = 'winre-screen winre-preparing';
            prep.innerHTML =
                '<div class="winre-win-logo">' +
                '<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" width="44" height="44">' +
                '<rect x="0" y="0" width="20" height="20" fill="#f35325"/>' +
                '<rect x="24" y="0" width="20" height="20" fill="#81bc06"/>' +
                '<rect x="0" y="24" width="20" height="20" fill="#05a6f0"/>' +
                '<rect x="24" y="24" width="20" height="20" fill="#ffba08"/>' +
                '</svg>' +
                '</div>' +
                '<div class="winre-preparing-label">Preparing Automatic Repair</div>' +
                '<div class="winre-spinner"></div>';
            arena.appendChild(prep);
            setTimeout(showChooseOption, 2000);
        };

        // ── Phase 4: Choose an option ──
        var showChooseOption = function() {
            clearWinRE();
            var choose = document.createElement('div');
            choose.className = 'winre-screen winre-choose';
            choose.innerHTML =
                '<div class="winre-choose-inner">' +
                '<div class="winre-choose-title">Choose an option</div>' +
                '<div class="winre-choose-options">' +
                '<button class="winre-opt-btn" id="winreContinue">' +
                '<div class="winre-opt-icon winre-opt-icon-continue">&#10148;</div>' +
                '<div><div class="winre-opt-label">Continue</div>' +
                '<div class="winre-opt-sub">Exit and continue to Windows</div></div>' +
                '</button>' +
                '<button class="winre-opt-btn" id="winreTroubleshoot">' +
                '<div class="winre-opt-icon winre-opt-icon-trouble">&#128295;</div>' +
                '<div><div class="winre-opt-label">Troubleshoot</div>' +
                '<div class="winre-opt-sub">Reset your PC or see advanced options</div></div>' +
                '</button>' +
                '<button class="winre-opt-btn" id="winreShutdown">' +
                '<div class="winre-opt-icon winre-opt-icon-off">&#9211;</div>' +
                '<div><div class="winre-opt-label">Turn off your PC</div>' +
                '<div class="winre-opt-sub"></div></div>' +
                '</button>' +
                '</div>' +
                '</div>';
            arena.appendChild(choose);

            choose.querySelector('#winreContinue').addEventListener('click', function() {
                clearWinRE();
                self.state.booted = true;
                self.save();
                self._showDesktop();
            });
            choose.querySelector('#winreTroubleshoot').addEventListener('click', showTroubleshoot);
            choose.querySelector('#winreShutdown').addEventListener('click', function() {
                clearWinRE();
                // Show shutdown screen
                var off = document.createElement('div');
                off.className = 'winre-screen winre-shutdown';
                off.innerHTML = '<div class="winre-shutdown-label">Shutting down...</div>';
                arena.appendChild(off);
            });
        };

        // ── Phase 5: Troubleshoot ──
        var showTroubleshoot = function() {
            clearWinRE();
            var trouble = document.createElement('div');
            trouble.className = 'winre-screen winre-troubleshoot';
            trouble.innerHTML =
                '<div class="winre-choose-inner">' +
                '<div class="winre-choose-title">Troubleshoot</div>' +
                '<div class="winre-choose-options">' +
                '<button class="winre-opt-btn" id="winreAdvanced">' +
                '<div class="winre-opt-icon winre-opt-icon-advanced">&#9881;</div>' +
                '<div><div class="winre-opt-label">Advanced options</div>' +
                '<div class="winre-opt-sub">Startup Repair, Command Prompt and more</div></div>' +
                '</button>' +
                '</div>' +
                '<button class="winre-back-btn" id="winreBackToChoose">&#8592; Back</button>' +
                '</div>';
            arena.appendChild(trouble);

            trouble.querySelector('#winreAdvanced').addEventListener('click', showAdvancedOptions);
            trouble.querySelector('#winreBackToChoose').addEventListener('click', showChooseOption);
        };

        // ── Phase 6: Advanced Options ──
        var showAdvancedOptions = function() {
            clearWinRE();
            var callbacks = self.config.winreCallbacks || {};

            var advanced = document.createElement('div');
            advanced.className = 'winre-screen winre-advanced';
            advanced.innerHTML =
                '<div class="winre-choose-inner winre-advanced-inner">' +
                '<div class="winre-choose-title">Advanced options</div>' +
                '<div class="winre-advanced-grid">' +
                '<button class="winre-adv-btn" data-action="startupRepair">' +
                '<div class="winre-adv-icon">&#128295;</div>' +
                '<div class="winre-adv-label">Startup Repair</div>' +
                '<div class="winre-adv-sub">Fix problems that keep Windows from loading</div>' +
                '</button>' +
                '<button class="winre-adv-btn" data-action="startupSettings">' +
                '<div class="winre-adv-icon">&#128196;</div>' +
                '<div class="winre-adv-label">Startup Settings</div>' +
                '<div class="winre-adv-sub">Change Windows startup behavior</div>' +
                '</button>' +
                '<button class="winre-adv-btn" data-action="systemRestore">' +
                '<div class="winre-adv-icon">&#128347;</div>' +
                '<div class="winre-adv-label">System Restore</div>' +
                '<div class="winre-adv-sub">Use a restore point to fix issues</div>' +
                '</button>' +
                '<button class="winre-adv-btn" data-action="uninstallUpdates">' +
                '<div class="winre-adv-icon">&#128465;</div>' +
                '<div class="winre-adv-label">Uninstall Updates</div>' +
                '<div class="winre-adv-sub">Remove recently installed quality or feature updates</div>' +
                '</button>' +
                '<button class="winre-adv-btn" data-action="commandPrompt">' +
                '<div class="winre-adv-icon">&#62;_</div>' +
                '<div class="winre-adv-label">Command Prompt</div>' +
                '<div class="winre-adv-sub">Use the Command Prompt for advanced troubleshooting</div>' +
                '</button>' +
                '</div>' +
                '<button class="winre-back-btn" id="winreBackToTrouble">&#8592; Back</button>' +
                '</div>';
            arena.appendChild(advanced);

            advanced.querySelector('#winreBackToTrouble').addEventListener('click', showTroubleshoot);

            advanced.querySelectorAll('.winre-adv-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var action = btn.dataset.action;
                    self._logEvent('winre_action', { action: action });

                    if (typeof callbacks[action] === 'function') {
                        try {
                            callbacks[action](self);
                        } catch (e) {
                            console.error('[ARENA] WinRE callback error:', action, e);
                        }
                    } else {
                        // Default: Command Prompt transitions to desktop
                        if (action === 'commandPrompt') {
                            clearWinRE();
                            self.state.booted = true;
                            self.save();
                            self._showDesktop();
                        } else {
                            self.notify('No handler configured for: ' + action, 'warning');
                        }
                    }
                });
            });
        };
    }

};

