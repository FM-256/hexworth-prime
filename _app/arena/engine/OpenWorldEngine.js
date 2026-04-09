/* ═══════════════════════════════════════════════════════════════════
   OpenWorldEngine.js — Reusable Open World CTF State Engine
   ═══════════════════════════════════════════════════════════════════
   Cross-page state management for multi-device investigation boxes.
   Based on the Gate 8 "Operation Gone Dark" architecture.

   Usage:
     const engine = new OpenWorldEngine({
         id:            'ow-01-mole-hunt',
         title:         'Operation Mole Hunt',
         storageKey:    'hexworth_ow01',
         startScore:    1000,
         clockStart:    8,              // 8 AM
         clockRatio:    60,             // 1 real sec = 1 game min
         accentColor:   '#dc2626',
         pages:         [ ... ],        // nav page definitions
         evidence:      { ... },        // evidence catalog
         connections:   [ ... ],        // key connections to find
         answers:       [ ... ],        // accepted final answers
         nearMiss:      [ ... ],        // partial answer hints
         triggers:      { threats, tips, handler, surveillance },
         scoring:       { ... },
         devices:       [ ... ],        // device list for file recovery
         onComplete:    fn              // callback on completion
     });

     engine.init();
   ═══════════════════════════════════════════════════════════════════ */

class OpenWorldEngine {
    constructor(config) {
        this.cfg = config;
        this.STORAGE_KEY = config.storageKey || 'hexworth_ow_default';
        this.state = null;
        this._clockInterval = null;
        this._audioCtx = null;
        this._masterGain = null;
        this._soundInitialized = false;
    }

    /* ══════════════════════════════════════════════════════
       INITIALIZATION
       ══════════════════════════════════════════════════════ */

    init() {
        this.load();
        this.buildNav(this.cfg.activePage || 'hub');
        this.startClock();
        this.checkTriggers();
        this.updateScoreBadge();

        // Cross-page sync
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                this.state = JSON.parse(e.newValue) || this._defaults();
                this.updateScoreBadge();
                if (window.onOpenWorldStateChange) window.onOpenWorldStateChange(this.state);
            }
        });

        // Save before unload
        window.addEventListener('beforeunload', () => this.save());

        // God mode hotkey
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                this.state.godMode = !this.state.godMode;
                document.body.classList.toggle('ow-god-mode', this.state.godMode);
                this.save();
            }
        });
    }

    /* ══════════════════════════════════════════════════════
       STATE MANAGEMENT
       ══════════════════════════════════════════════════════ */

    _defaults() {
        const devices = {};
        (this.cfg.devices || []).forEach(d => { devices[d] = []; });
        const drillScans = {};
        (this.cfg.devices || []).forEach(d => { drillScans[d] = false; });

        return {
            score: this.cfg.startScore || 1000,
            hintsUsed: [],
            recoveredFiles: devices,
            openedFiles: [],
            pinnedEvidence: [],
            connections: [],
            notes: [],
            wrongAnswers: 0,
            startTime: Date.now(),
            investigationStart: Date.now(),
            dataDrillScans: drillScans,
            threats: [],
            tips: [],
            handlerMessages: [],
            surveillanceEvents: [],
            remoteWipeActive: false,
            remoteWipeStart: null,
            remoteWipeCompleted: false,
            soundEnabled: true,
            soundVolume: 0.3,
            progressFlags: {},
            completed: false,
            godMode: false,
            finalAnswer: null,
            elapsedTime: 0
        };
    }

    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                this.state = JSON.parse(raw);
                // Migration — ensure new fields exist
                if (!this.state.tips) this.state.tips = [];
                if (!this.state.handlerMessages) this.state.handlerMessages = [];
                if (!this.state.surveillanceEvents) this.state.surveillanceEvents = [];
                if (!this.state.progressFlags) this.state.progressFlags = {};
                if (!this.state.investigationStart) this.state.investigationStart = this.state.startTime || Date.now();
                if (this.state.soundEnabled === undefined) this.state.soundEnabled = true;
                if (this.state.soundVolume === undefined) this.state.soundVolume = 0.3;
                if (!this.state.recoveredFiles) {
                    this.state.recoveredFiles = {};
                    (this.cfg.devices || []).forEach(d => { this.state.recoveredFiles[d] = []; });
                }
                if (!this.state.dataDrillScans) {
                    this.state.dataDrillScans = {};
                    (this.cfg.devices || []).forEach(d => { this.state.dataDrillScans[d] = false; });
                }
            } else {
                this.state = this._defaults();
                this.save();
            }
        } catch (e) {
            this.state = this._defaults();
        }
    }

    save() {
        this.state.elapsedTime = Date.now() - this.state.startTime;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        } catch (e) { /* quota */ }
    }

    reset() {
        this.state = this._defaults();
        this.save();
        location.reload();
    }

    complete() {
        this.state.completed = true;
        this.save();
        localStorage.setItem(this.STORAGE_KEY + '_complete', 'true');
        localStorage.setItem(this.STORAGE_KEY + '_score', this.state.score);
        localStorage.setItem(this.STORAGE_KEY + '_timestamp', Date.now());
        if (this.cfg.onComplete) this.cfg.onComplete(this.state);
    }

    /* ══════════════════════════════════════════════════════
       CLOCK & TIME
       ══════════════════════════════════════════════════════ */

    getInGameTime() {
        const ratio = this.cfg.clockRatio || 60;
        const startHour = this.cfg.clockStart || 8;
        const realElapsedMs = Date.now() - this.state.investigationStart;
        const gameMinutesElapsed = realElapsedMs / 1000 * (ratio / 60);
        const totalGameMinutes = startHour * 60 + gameMinutesElapsed;

        const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
        const dayIndex = Math.floor(totalGameMinutes / (24 * 60)) % 7;
        const hourInDay = Math.floor((totalGameMinutes % (24 * 60)) / 60);
        const minuteInHour = Math.floor(totalGameMinutes % 60);

        return {
            day: days[dayIndex],
            hour: hourInDay,
            minute: minuteInHour,
            totalMinutes: totalGameMinutes,
            gameHoursElapsed: gameMinutesElapsed / 60,
            isNight: hourInDay < 6 || hourInDay >= 21,
            isDusk: hourInDay >= 18 && hourInDay < 21,
            isDawn: hourInDay >= 5 && hourInDay < 8,
            isDay: hourInDay >= 8 && hourInDay < 18
        };
    }

    formatGameTime(gt) {
        const h = gt.hour % 12 || 12;
        const ampm = gt.hour < 12 ? 'AM' : 'PM';
        const m = String(gt.minute).padStart(2, '0');
        return gt.day + ' ' + h + ':' + m + ' ' + ampm;
    }

    getCelestialState(gt) {
        if (gt.isNight) return { icon: '<img src="/assets/images/icons/icon-lock.webp" alt="" width="12" height="12" style="vertical-align:middle;opacity:0.6">', label: 'night', cls: 'ow-nighttime' };
        if (gt.isDusk) return { icon: '<img src="/assets/images/icons/icon-warning.webp" alt="" width="12" height="12" style="vertical-align:middle;opacity:0.6">', label: 'dusk', cls: 'ow-twilight' };
        if (gt.isDawn) return { icon: '<img src="/assets/images/icons/icon-info.webp" alt="" width="12" height="12" style="vertical-align:middle;opacity:0.6">', label: 'dawn', cls: 'ow-twilight' };
        return { icon: '<img src="/assets/images/icons/icon-checkmark.webp" alt="" width="12" height="12" style="vertical-align:middle;opacity:0.6">', label: 'day', cls: 'ow-daytime' };
    }

    startClock() {
        this.tickClock();
        this._clockInterval = setInterval(() => this.tickClock(), 1000);
    }

    _lastTriggerCheck = 0;

    tickClock() {
        const gt = this.getInGameTime();
        const el = document.getElementById('ow-clock-time');
        const celEl = document.getElementById('ow-clock-celestial');
        if (el) el.textContent = this.formatGameTime(gt);
        const cel = this.getCelestialState(gt);
        if (celEl) celEl.innerHTML = cel.icon;

        // Apply day/night class to body
        document.body.classList.remove('ow-nighttime', 'ow-twilight', 'ow-daytime');
        document.body.classList.add(cel.cls);

        // Check triggers every 5 seconds (not every tick to avoid burst)
        const now = Date.now();
        if (now - this._lastTriggerCheck > 5000) {
            this._lastTriggerCheck = now;
            this.checkTriggers();
        }
    }

    /* ══════════════════════════════════════════════════════
       SCORING
       ══════════════════════════════════════════════════════ */

    addScore(points, reason) {
        this.state.score = Math.max(0, this.state.score + points);
        this.save();
        this.updateScoreBadge();
    }

    updateScoreBadge() {
        const el = document.getElementById('ow-score-badge');
        if (el) el.textContent = 'SCORE: ' + this.state.score;
    }

    /* ══════════════════════════════════════════════════════
       EVIDENCE
       ══════════════════════════════════════════════════════ */

    pinEvidence(evidence) {
        if (this.isEvidencePinned(evidence.id)) return;
        this.state.pinnedEvidence.push(evidence);
        if (evidence.isRedHerring) {
            this.addScore(this.cfg.scoring?.pinRedHerring || -5, 'Pinned red herring');
        } else {
            this.addScore(this.cfg.scoring?.pinEvidence || 15, 'Pinned evidence');
        }
        this.save();
        this.checkTriggers();
    }

    unpinEvidence(evidenceId) {
        this.state.pinnedEvidence = this.state.pinnedEvidence.filter(e => e.id !== evidenceId);
        this.save();
    }

    isEvidencePinned(evidenceId) {
        return this.state.pinnedEvidence.some(e => e.id === evidenceId);
    }

    /* ══════════════════════════════════════════════════════
       FILE TRACKING
       ══════════════════════════════════════════════════════ */

    openFile(fileId) {
        if (!this.state.openedFiles.includes(fileId)) {
            this.state.openedFiles.push(fileId);
            this.save();
            this.checkTriggers();
        }
    }

    recoverFile(device, fileId) {
        if (!this.state.recoveredFiles[device]) this.state.recoveredFiles[device] = [];
        if (!this.state.recoveredFiles[device].includes(fileId)) {
            this.state.recoveredFiles[device].push(fileId);
            this.addScore(this.cfg.scoring?.recoverFile || 10, 'Recovered file');
            this.save();
            this.checkTriggers();
        }
    }

    isFileRecovered(device, fileId) {
        return (this.state.recoveredFiles[device] || []).includes(fileId);
    }

    markDrillScanned(device) {
        this.state.dataDrillScans[device] = true;
        this.save();
    }

    /* ══════════════════════════════════════════════════════
       CONNECTIONS
       ══════════════════════════════════════════════════════ */

    addConnection(conn) {
        if (this.state.connections.some(c => c.id === conn.id)) return;
        this.state.connections.push(conn);
        this.addScore(this.cfg.scoring?.connection || 25, 'Connection: ' + conn.label);
        this.save();
        this.checkTriggers();

        // Check if this connection triggers a flag delivery
        if (this.cfg.flagConnections && this.cfg.flagConnections[conn.id]) {
            var flagId = this.cfg.flagConnections[conn.id];
            this.requestFlag(flagId).then(function(flagText) {
                if (flagText && conn._onFlagDelivered) {
                    conn._onFlagDelivered(flagText);
                }
            }).catch(function() {});
        }
    }

    /**
     * Request a flag from the server via deliverFlag Cloud Function.
     * Returns the FLAG{xxxxx} text for display to the student.
     */
    async requestFlag(flagId) {
        var boxId = this.cfg.registryId;
        if (!boxId || !flagId) return null;

        // Return cached if already delivered
        if (this.state.deliveredFlags && this.state.deliveredFlags[flagId]) {
            return this.state.deliveredFlags[flagId];
        }

        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                var result = await FirebaseAuth.callFunction('deliverFlag', { boxId: boxId, flagId: flagId });
                var data = result.data || result;
                if (data.flagText) {
                    if (!this.state.deliveredFlags) this.state.deliveredFlags = {};
                    this.state.deliveredFlags[flagId] = data.flagText;
                    this.save();
                    return data.flagText;
                }
            }
        } catch (e) {
            console.warn('[OW] Flag delivery failed:', e.message);
        }
        return null;
    }

    /**
     * Submit a FLAG{xxxxx} string for server-side validation.
     */
    async submitFlag(flagStr) {
        var boxId = this.cfg.registryId;
        if (!boxId || !flagStr) return { correct: false };

        try {
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                var result = await FirebaseAuth.callFunction('validateFlag', {
                    boxId: boxId,
                    submission: flagStr
                });
                var data = result.data || result;
                if (data.correct) {
                    this.addScore(this.cfg.scoring?.correctAnswer || 200, 'Flag captured: ' + data.flagId);
                    if (!this.state.flagsSubmitted) this.state.flagsSubmitted = [];
                    this.state.flagsSubmitted.push(data.flagId);
                    this.save();

                    // Check if all flags submitted
                    var totalFlags = this.cfg.flagConnections ? Object.keys(this.cfg.flagConnections).length : 0;
                    if (this.state.flagsSubmitted.length >= totalFlags) {
                        this.complete();
                    }
                    return { correct: true, flagId: data.flagId, score: this.state.score };
                }
                return { correct: false };
            }
        } catch (e) {
            console.warn('[OW] Flag validation failed:', e.message);
        }
        return { correct: false, error: 'Not authenticated. Sign in to submit flags.' };
    }

    /* ══════════════════════════════════════════════════════
       NOTES
       ══════════════════════════════════════════════════════ */

    addNote(note) {
        if (!note.id) note.id = 'note-' + Date.now();
        note.timestamp = Date.now();
        this.state.notes.push(note);
        this.save();
    }

    removeNote(noteId) {
        this.state.notes = this.state.notes.filter(n => n.id !== noteId);
        this.save();
    }

    /* ══════════════════════════════════════════════════════
       HINTS
       ══════════════════════════════════════════════════════ */

    useHint(hintId) {
        if (this.state.hintsUsed.includes(hintId)) return;
        this.state.hintsUsed.push(hintId);
        this.addScore(this.cfg.scoring?.hintPenalty || -30, 'Hint used');
        this.save();
    }

    /* ══════════════════════════════════════════════════════
       PROGRESS FLAGS
       ══════════════════════════════════════════════════════ */

    setFlag(flag) {
        if (!this.state.progressFlags[flag]) {
            this.state.progressFlags[flag] = Date.now();
            this.save();
            this.checkTriggers();
        }
    }

    hasFlag(flag) {
        return !!this.state.progressFlags[flag];
    }

    /* ══════════════════════════════════════════════════════
       FLAG SUBMISSION (server-side validation)
       ══════════════════════════════════════════════════════
       submitFlag() is defined above in the CONNECTIONS section.
       It calls validateFlag Cloud Function for server-side check.

       Legacy submitAnswer() kept for backward compatibility but
       now redirects to submitFlag() for FLAG{} strings.
       ══════════════════════════════════════════════════════ */

    submitAnswer(answer) {
        // If it looks like a flag, validate server-side
        if (answer && /^FLAG\{.+\}$/i.test(answer.trim())) {
            return this.submitFlag(answer.trim());
        }
        // Not a flag format — tell the student to submit FLAG{} strings
        return Promise.resolve({
            correct: false,
            hint: 'Submit FLAG{xxxxx} strings found during the investigation. Discover flags by confirming connections on the CaseBoard.',
            score: this.state.score
        });
    }

    /* ══════════════════════════════════════════════════════
       PROGRESS QUERY
       ══════════════════════════════════════════════════════ */

    getProgress() {
        let totalRecovered = 0;
        Object.values(this.state.recoveredFiles).forEach(arr => { totalRecovered += arr.length; });
        const minConnections = this.cfg.minConnectionsToSubmit || 5;
        return {
            recovered: totalRecovered,
            connections: this.state.connections.length,
            pinned: this.state.pinnedEvidence.length,
            score: this.state.score,
            canSubmit: this.state.connections.length >= minConnections,
            completed: this.state.completed,
            elapsed: Date.now() - this.state.startTime
        };
    }

    /* ══════════════════════════════════════════════════════
       TRIGGER SYSTEM
       ══════════════════════════════════════════════════════ */

    checkTriggers() {
        const gt = this.getInGameTime();
        const triggers = this.cfg.triggers || {};
        const self = this;

        function processTriggerSet(triggerArray, stateArray, type) {
            if (!triggerArray) return;
            triggerArray.forEach(trigger => {
                if (stateArray.some(t => t.id === trigger.id)) return;
                if (gt.gameHoursElapsed < trigger.minGameHours) return;
                if (trigger.condition && !trigger.condition(self.state, self)) return;

                const msg = {
                    id: trigger.id,
                    from: trigger.from || 'UNKNOWN',
                    text: trigger.text,
                    timestamp: Date.now(),
                    time: self.formatGameTime(gt)
                };
                stateArray.push(msg);
                self.save();

                // Fire notification
                self.showNotification(msg, type);

                // Screen shake for threats
                if (type === 'threat') self.shakeScreen();

                // Custom callback
                if (trigger.onFire) trigger.onFire(self);
            });
        }

        processTriggerSet(triggers.threats, this.state.threats, 'threat');
        processTriggerSet(triggers.tips, this.state.tips, 'tip');
        processTriggerSet(triggers.handler, this.state.handlerMessages, 'handler');

        // Surveillance events
        if (triggers.surveillance) {
            triggers.surveillance.forEach(trigger => {
                if (this.state.surveillanceEvents.includes(trigger.id)) return;
                if (gt.gameHoursElapsed < trigger.minGameHours) return;
                if (trigger.condition && !trigger.condition(this.state, this)) return;

                this.state.surveillanceEvents.push(trigger.id);
                this.save();
                if (trigger.effect) this.triggerSurveillanceEffect(trigger.effect);
            });
        }
    }

    /* ══════════════════════════════════════════════════════
       REMOTE WIPE
       ══════════════════════════════════════════════════════ */

    startRemoteWipe(device, durationGameHours) {
        if (this.state.remoteWipeActive || this.state.remoteWipeCompleted) return;
        this.state.remoteWipeActive = true;
        this.state.remoteWipeStart = Date.now();
        this.state.remoteWipeDevice = device;
        this.state.remoteWipeDuration = durationGameHours || 0.167; // ~10 game minutes
        this.save();

        this.showNotification({
            from: 'SYSTEM ALERT',
            text: 'REMOTE WIPE DETECTED on ' + device.toUpperCase() + '. Recover files before data is destroyed.',
            time: this.formatGameTime(this.getInGameTime())
        }, 'threat');
        this.shakeScreen();
    }

    checkWipeStatus() {
        if (!this.state.remoteWipeActive || this.state.remoteWipeCompleted) return 0;
        const ratio = this.cfg.clockRatio || 60;
        const durationMs = (this.state.remoteWipeDuration || 0.167) * 3600000 / ratio;
        const elapsed = Date.now() - this.state.remoteWipeStart;
        const progress = Math.min(1, elapsed / durationMs);

        if (progress >= 1) {
            this.state.remoteWipeActive = false;
            this.state.remoteWipeCompleted = true;
            this.save();
        }
        return progress;
    }

    /* ══════════════════════════════════════════════════════
       NOTIFICATIONS
       ══════════════════════════════════════════════════════ */

    showNotification(msg, type) {
        this._injectNotifStyles();
        const colors = {
            threat: { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)', text: '#fca5a5', icon: '/assets/images/icons/icon-warning.webp' },
            tip: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#86efac', icon: '/assets/images/icons/icon-info.webp' },
            handler: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', icon: '/assets/images/icons/icon-user.webp' },
            wipe: { bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)', text: '#fca5a5', icon: '/assets/images/icons/icon-alert.webp' }
        };
        const c = colors[type] || colors.handler;

        const div = document.createElement('div');
        div.className = 'ow-notif';
        div.style.cssText = 'background:' + c.bg + ';border:1px solid ' + c.border + ';';
        div.innerHTML = `
            <img src="${c.icon}" alt="" width="16" height="16" style="flex-shrink:0;">
            <div class="ow-notif-body">
                <div class="ow-notif-from" style="color:${c.text}">${this._esc(msg.from)}</div>
                <div class="ow-notif-text">${this._esc(msg.text)}</div>
                ${msg.time ? '<div class="ow-notif-time">' + this._esc(msg.time) + '</div>' : ''}
            </div>
        `;
        document.body.appendChild(div);
        div.addEventListener('click', () => div.remove());
        setTimeout(() => { div.classList.add('ow-notif-fade'); }, 8000);
        setTimeout(() => { if (div.parentNode) div.remove(); }, 9000);
    }

    _injectNotifStyles() {
        if (document.getElementById('ow-notif-styles')) return;
        const s = document.createElement('style');
        s.id = 'ow-notif-styles';
        s.textContent = `
            .ow-notif {
                position: absolute; top: 20px; right: 20px; z-index: 5000;
                max-width: 380px; padding: 12px 16px; border-radius: 8px;
                display: flex; gap: 10px; align-items: flex-start;
                font-family: 'Courier New', monospace; font-size: 0.78rem;
                animation: owNotifSlide 0.4s ease-out;
                cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            }
            .ow-notif-from { font-size: 0.65rem; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px; }
            .ow-notif-text { color: #c9d1d9; line-height: 1.4; }
            .ow-notif-time { color: #4b5563; font-size: 0.65rem; margin-top: 4px; }
            .ow-notif-fade { opacity: 0; transition: opacity 0.5s; }
            @keyframes owNotifSlide { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `;
        document.head.appendChild(s);
    }

    /* ══════════════════════════════════════════════════════
       EFFECTS
       ══════════════════════════════════════════════════════ */

    shakeScreen() {
        document.body.classList.add('ow-screen-shake');
        setTimeout(() => document.body.classList.remove('ow-screen-shake'), 600);
    }

    triggerSurveillanceEffect(effect) {
        switch (effect) {
            case 'network_spike':
                this.showNotification({ from: 'SYSTEM ALERT', text: 'Anomalous network activity detected. External connection attempt intercepted.', time: this.formatGameTime(this.getInGameTime()) }, 'threat');
                break;
            case 'data_wipe':
                this.showNotification({ from: 'SYSTEM ALERT', text: 'Remote data destruction attempt detected on endpoint.', time: this.formatGameTime(this.getInGameTime()) }, 'threat');
                this.shakeScreen();
                break;
            case 'screen_glitch':
                document.body.classList.add('ow-glitch');
                setTimeout(() => document.body.classList.remove('ow-glitch'), 800);
                break;
            case 'access_revoked':
                this.showNotification({ from: 'SYSTEM ALERT', text: 'Credentials have been rotated. Some evidence may become inaccessible.', time: this.formatGameTime(this.getInGameTime()) }, 'threat');
                break;
        }
    }

    /* ══════════════════════════════════════════════════════
       NAVIGATION BAR
       ══════════════════════════════════════════════════════ */

    buildNav(activePage) {
        // Detect subdirectory
        const path = window.location.pathname;
        const boxDir = this.cfg.id || '';
        const inSubdir = path.includes('/reports/') || path.includes('/evidence/');
        const base = inSubdir ? '../' : '';

        const pages = this.cfg.pages || [
            { id: 'hub', label: 'Hub', href: 'index.html' }
        ];

        const nav = document.createElement('nav');
        nav.className = 'ow-nav';
        nav.setAttribute('role', 'navigation');

        const activeLabel = (pages.find(p => p.id === activePage) || {}).label || 'Hub';

        nav.innerHTML = `
            <div class="ow-nav-left">
                <a href="${base}index.html" class="ow-nav-brand">
                    <img src="/assets/images/icons/icon-radar.webp" alt="" width="16" height="16">
                    <span>${this._esc(this.cfg.title || 'OPEN WORLD')}</span>
                </a>
                <span class="ow-nav-sep">/</span>
                <span class="ow-nav-page">${this._esc(activeLabel)}</span>
            </div>
            <div class="ow-nav-right">
                <div class="ow-nav-links">
                    ${pages.map(p => `<a href="${base}${p.href}" class="ow-nav-link${p.id === activePage ? ' active' : ''}">${this._esc(p.label)}</a>`).join('')}
                </div>
                <div class="ow-clock" id="ow-clock">
                    <span id="ow-clock-celestial"></span>
                    <span id="ow-clock-time">MON 8:00 AM</span>
                </div>
                <span class="ow-score-badge" id="ow-score-badge">SCORE: ${this.state.score}</span>
            </div>
        `;

        document.body.insertBefore(nav, document.body.firstChild);
    }

    /* ══════════════════════════════════════════════════════
       UTILITIES
       ══════════════════════════════════════════════════════ */

    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    getElapsed() {
        return Date.now() - this.state.startTime;
    }

    formatTime(ms) {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        if (h > 0) return h + 'h ' + m + 'm';
        return m + 'm';
    }
}

// Export for use across pages
window.OpenWorldEngine = OpenWorldEngine;
