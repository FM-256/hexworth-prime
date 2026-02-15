/* ============================================================
   OPERATION GONE DARK — Gate 8 Shared State Engine
   Cross-page state management, scoring, evidence system
   ============================================================ */

const GoneDark = {
    VERSION: '1.0.0',
    STORAGE_KEY: 'gate8_progress',
    ANSWER_HASH: '9c1b7e8a3f2d6e4b5a0c8d7f1e3b9a2c4d6f8e0b', // placeholder — real hash below

    // SHA-256 of normalized accepted answers
    ACCEPTED_HASHES: [
        '6f5902ac237024bdd0c176cb93063dc4', // kadikoy warehouse 7
        'a7b3c1d4e5f6789012345678abcdef01', // kadıköy warehouse 7
    ],

    state: null,
    _clockInterval: null,
    _audioCtx: null,

    // === ACCELERATED CLOCK ===
    // 1 real second = 1 in-game minute → 1 real minute = 1 in-game hour → 24 real min = 1 day
    CLOCK_RATIO: 60,           // real-to-game multiplier
    CLOCK_START_HOUR: 8,       // investigation begins at 08:00 MON
    DAYS: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],

    defaults() {
        return {
            score: 1000,
            hintsUsed: [],
            recoveredFiles: { desktop: [], laptop: [], phone: [] },
            openedFiles: [],
            pinnedEvidence: [],
            connections: [],
            notes: [],
            wrongAnswers: 0,
            startTime: Date.now(),
            investigationStart: Date.now(),  // anchor for accelerated clock
            dataDrillScans: { desktop: false, laptop: false, phone: false },
            threats: [],
            anonymousTips: [],
            novakMessages: [],
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
    },

    init() {
        this.load();
        this.setupGodMode();
        this.setupNavScore();
        this.startClock();
        // Delay trigger check slightly so UI is ready for notifications
        setTimeout(() => this.checkTriggers(), 1500);
        // Soundscape requires user gesture — init on first click
        const startSound = () => {
            this.initSoundscape();
            document.removeEventListener('click', startSound);
            document.removeEventListener('keydown', startSound);
        };
        document.addEventListener('click', startSound, { once: false });
        document.addEventListener('keydown', startSound, { once: false });
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                this.state = JSON.parse(e.newValue) || this.defaults();
                this.onStateChange();
            }
        });
        window.addEventListener('beforeunload', () => this.save());
        console.log('%c[GONE DARK] State engine initialized', 'color: #d8d830');
    },

    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            this.state = saved ? JSON.parse(saved) : this.defaults();
        } catch {
            this.state = this.defaults();
        }
        if (!this.state.threats) this.state.threats = [];
        if (!this.state.anonymousTips) this.state.anonymousTips = [];
        if (!this.state.novakMessages) this.state.novakMessages = [];
        if (!this.state.surveillanceEvents) this.state.surveillanceEvents = [];
        if (!this.state.progressFlags) this.state.progressFlags = {};
        if (!this.state.investigationStart) this.state.investigationStart = this.state.startTime || Date.now();
        if (this.state.soundEnabled === undefined) this.state.soundEnabled = true;
        if (this.state.soundVolume === undefined) this.state.soundVolume = 0.3;
    },

    // === IN-GAME CLOCK ===
    getInGameTime() {
        const realElapsedMs = Date.now() - this.state.investigationStart;
        const gameMinutesElapsed = realElapsedMs / 1000; // 1 real sec = 1 game minute
        const totalGameMinutes = this.CLOCK_START_HOUR * 60 + gameMinutesElapsed;

        const dayIndex = Math.floor(totalGameMinutes / (24 * 60)) % 7;
        const hourInDay = Math.floor((totalGameMinutes % (24 * 60)) / 60);
        const minuteInHour = Math.floor(totalGameMinutes % 60);

        return {
            day: this.DAYS[dayIndex],
            hour: hourInDay,
            minute: minuteInHour,
            totalMinutes: totalGameMinutes,
            gameHoursElapsed: gameMinutesElapsed / 60,
            isNight: hourInDay < 6 || hourInDay >= 21,
            isDusk: hourInDay >= 18 && hourInDay < 21,
            isDawn: hourInDay >= 5 && hourInDay < 8,
            isDay: hourInDay >= 8 && hourInDay < 18
        };
    },

    formatGameTime(gameTime) {
        if (!gameTime) gameTime = this.getInGameTime();
        const h = gameTime.hour;
        const m = String(gameTime.minute).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${gameTime.day} ${h12}:${m} ${ampm}`;
    },

    getCelestialState(gameTime) {
        if (!gameTime) gameTime = this.getInGameTime();
        if (gameTime.isNight) return { icon: '\u263D', label: 'night', cls: 'night' };     // ☽
        if (gameTime.isDusk)  return { icon: '\u263D', label: 'dusk',  cls: 'twilight' };
        if (gameTime.isDawn)  return { icon: '\u2600', label: 'dawn',  cls: 'twilight' };   // ☀
        return { icon: '\u2600', label: 'day', cls: 'day' };
    },

    startClock() {
        if (this._clockInterval) clearInterval(this._clockInterval);
        this._clockInterval = setInterval(() => this.tickClock(), 1000);
        this.tickClock(); // immediate first tick
    },

    tickClock() {
        const el = document.getElementById('g8-clock');
        if (!el) return;

        const gt = this.getInGameTime();
        const cel = this.getCelestialState(gt);

        const timeEl = el.querySelector('.g8-clock-time');
        const celEl = el.querySelector('.g8-clock-celestial');

        if (timeEl) timeEl.textContent = this.formatGameTime(gt);
        if (celEl) {
            celEl.textContent = cel.icon;
            celEl.className = 'g8-clock-celestial ' + cel.cls;
        }

        // Ambient body class for day/night tinting
        document.body.classList.toggle('g8-nighttime', gt.isNight);
        document.body.classList.toggle('g8-twilight', gt.isDusk || gt.isDawn);
    },

    save() {
        if (!this.state) return;
        this.state.elapsedTime = Date.now() - this.state.startTime;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    },

    reset() {
        this.state = this.defaults();
        this.save();
    },

    complete() {
        this.state.completed = true;
        this.save();
        localStorage.setItem('gate8_complete', 'true');
        localStorage.setItem('gate8_score', this.state.score);
        localStorage.setItem('gate8_timestamp', Date.now());
    },

    // === SCORING ===
    addScore(points, reason) {
        this.state.score += points;
        if (this.state.score < 0) this.state.score = 0;
        this.save();
        this.updateScoreBadge();
        console.log(`%c[SCORE] ${points > 0 ? '+' : ''}${points}: ${reason} (total: ${this.state.score})`, 'color: #d4a840');
    },

    updateScoreBadge() {
        const badge = document.querySelector('.g8-score-badge');
        if (badge) badge.textContent = `SCORE: ${this.state.score}`;
    },

    setupNavScore() {
        const badge = document.querySelector('.g8-score-badge');
        if (badge) badge.textContent = `SCORE: ${this.state.score}`;
    },

    // === EVIDENCE PINNING ===
    pinEvidence(evidence) {
        // evidence = { id, title, detail, source, category, timestamp, isRedHerring }
        if (this.state.pinnedEvidence.find(e => e.id === evidence.id)) return false;
        this.state.pinnedEvidence.push(evidence);
        if (evidence.isRedHerring) {
            this.addScore(-5, `Pinned red herring: ${evidence.title}`);
        } else {
            this.addScore(15, `Pinned evidence: ${evidence.title}`);
        }
        this.save();
        this.checkTriggers();
        return true;
    },

    unpinEvidence(evidenceId) {
        const idx = this.state.pinnedEvidence.findIndex(e => e.id === evidenceId);
        if (idx === -1) return false;
        this.state.pinnedEvidence.splice(idx, 1);
        this.save();
        return true;
    },

    isEvidencePinned(evidenceId) {
        return this.state.pinnedEvidence.some(e => e.id === evidenceId);
    },

    // === FILE TRACKING ===
    openFile(fileId) {
        if (!this.state.openedFiles.includes(fileId)) {
            this.state.openedFiles.push(fileId);
            this.save();
        }
    },

    // === DATA DRILL RECOVERY ===
    recoverFile(device, fileId) {
        if (!this.state.recoveredFiles[device]) this.state.recoveredFiles[device] = [];
        if (this.state.recoveredFiles[device].includes(fileId)) return false;
        this.state.recoveredFiles[device].push(fileId);
        this.addScore(10, `Recovered file: ${fileId}`);
        this.save();
        this.checkTriggers();
        return true;
    },

    isFileRecovered(device, fileId) {
        return this.state.recoveredFiles[device]?.includes(fileId) || false;
    },

    markDrillScanned(device) {
        this.state.dataDrillScans[device] = true;
        this.save();
    },

    // === CONNECTIONS ===
    addConnection(conn) {
        // conn = { id, from, to, label, category }
        if (this.state.connections.find(c => c.id === conn.id)) return false;
        this.state.connections.push(conn);
        this.addScore(25, `Connection made: ${conn.label}`);
        this.save();
        this.checkTriggers();
        return true;
    },

    // === NOTES ===
    addNote(note) {
        // note = { id, text, x, y, color }
        note.id = note.id || 'note_' + Date.now();
        this.state.notes.push(note);
        this.save();
        return note.id;
    },

    removeNote(noteId) {
        this.state.notes = this.state.notes.filter(n => n.id !== noteId);
        this.save();
    },

    // === HINTS ===
    useHint(hintId, hintText) {
        if (this.state.hintsUsed.includes(hintId)) return hintText;
        this.state.hintsUsed.push(hintId);
        this.addScore(-30, `Hint used: ${hintId}`);
        this.save();
        return hintText;
    },

    // === ANSWER VALIDATION ===
    async hashAnswer(answer) {
        const normalized = answer.toLowerCase().replace(/[ıİ]/g, 'i').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, ' ');
        const encoder = new TextEncoder();
        const data = encoder.encode(normalized);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async checkAnswer(answer) {
        // Normalize Turkish characters, then strip non-alphanumeric
        const normalized = answer.toLowerCase()
            .replace(/[ıİ]/g, 'i')
            .replace(/[öÖ]/g, 'o')
            .replace(/[üÜ]/g, 'u')
            .replace(/[çÇ]/g, 'c')
            .replace(/[şŞ]/g, 's')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[^a-z0-9\s]/g, '')
            .trim().replace(/\s+/g, ' ');

        // Accept exact variations
        const accepted = [
            'kadikoy warehouse 7',
            'warehouse 7 kadikoy',
            'kadikoy warehouse seven',
            'warehouse seven kadikoy',
            'kadikoy district warehouse 7',
            'warehouse 7 kadikoy district',
            'kadikoy istanbul warehouse 7',
            'warehouse 7 kadikoy istanbul'
        ];
        if (accepted.includes(normalized)) {
            return { correct: true };
        }
        // Flexible check — has both key elements
        const hasKadikoy = normalized.includes('kadikoy');
        const hasWarehouse7 = normalized.includes('warehouse 7') || normalized.includes('warehouse seven');
        if (hasKadikoy && hasWarehouse7) {
            return { correct: true };
        }
        // Near-miss hints
        if (hasKadikoy && !hasWarehouse7) {
            return { correct: false, hint: 'Right district — but where exactly? The evidence points to a specific building.' };
        }
        if (!hasKadikoy && hasWarehouse7) {
            return { correct: false, hint: 'Right building type — but in which district? Check the credit card trail and map scan.' };
        }
        if (normalized.includes('istanbul')) {
            return { correct: false, hint: 'Right city — but the detective needs a more specific location. Dig deeper into the evidence.' };
        }
        return { correct: false };
    },

    async submitAnswer(answer) {
        const result = await this.checkAnswer(answer);
        if (result.correct) {
            this.addScore(200, 'Correct final answer');
            this.state.finalAnswer = answer;
            this.complete();
            return { correct: true, score: this.state.score };
        } else {
            this.state.wrongAnswers++;
            this.addScore(-50, 'Wrong answer attempt');
            this.save();
            return { correct: false, score: this.state.score, attempts: this.state.wrongAnswers, hint: result.hint };
        }
    },

    // === PROGRESS FLAGS & TRIGGERS ===
    setFlag(flag) {
        if (this.state.progressFlags[flag]) return;
        this.state.progressFlags[flag] = Date.now();
        this.save();
        this.checkTriggers();
    },

    hasFlag(flag) {
        return !!this.state.progressFlags[flag];
    },

    // Threatening messages & anonymous tips triggered by progress + minimum in-game time
    THREAT_TRIGGERS: [
        {
            id: 'threat_1',
            minGameHours: 4,
            condition: (s) => s.recoveredFiles.desktop.length >= 1 || s.recoveredFiles.phone.length >= 1,
            message: {
                from: 'UNKNOWN',
                text: 'You\'re looking at things that don\'t concern you, consultant. Close the case. Walk away.'
            }
        },
        {
            id: 'threat_2',
            minGameHours: 12,
            condition: (s) => s.pinnedEvidence.length >= 5 && s.connections.length >= 2,
            message: {
                from: 'BLOCKED NUMBER',
                text: 'Last warning. The man you\'re looking for chose to disappear. Let him stay gone.'
            }
        },
        {
            id: 'threat_3',
            minGameHours: 20,
            condition: (s) => s.connections.length >= 5,
            message: {
                from: 'UNKNOWN',
                text: 'We know who retained you. We know where Det. Novak lives. Think carefully about your next move.'
            }
        }
    ],

    TIP_TRIGGERS: [
        {
            id: 'tip_1',
            minGameHours: 2,
            condition: (s) => s.openedFiles.length >= 5 && !s.dataDrillScans.desktop && !s.dataDrillScans.phone,
            message: {
                from: 'ANONYMOUS',
                text: 'What you see on the surface isn\'t the whole story. He deleted files before he left. Use the right tools.'
            }
        },
        {
            id: 'tip_2',
            minGameHours: 8,
            condition: (s) => s.dataDrillScans.phone && s.recoveredFiles.phone.length >= 1 && !s.progressFlags.found_warehouse,
            message: {
                from: 'A FRIEND',
                text: 'You\'re getting warmer. The answer is in the deleted messages. Read between the lines — where was he told to go?'
            }
        },
        {
            id: 'tip_3',
            minGameHours: 18,
            condition: (s) => s.pinnedEvidence.length >= 8 && s.connections.length >= 4,
            message: {
                from: 'ANONYMOUS',
                text: 'The district. The building number. That\'s what Novak needs. You have it all — put it together.'
            }
        }
    ],

    // === DET. NOVAK CHECK-INS ===
    NOVAK_TRIGGERS: [
        {
            id: 'novak_1',
            minGameHours: 1,
            condition: () => true,
            message: {
                from: 'DET. NOVAK',
                text: 'Getting settled? IT set up the workstation this morning. Everything you need should be there. Let me know if you hit any walls.'
            }
        },
        {
            id: 'novak_2',
            minGameHours: 6,
            condition: (s) => s.openedFiles.length >= 3,
            message: {
                from: 'DET. NOVAK',
                text: 'Any leads yet? Captain\'s breathing down my neck. The mother called again — third time this week.'
            }
        },
        {
            id: 'novak_3',
            minGameHours: 14,
            condition: (s) => s.pinnedEvidence.length >= 3,
            message: {
                from: 'DET. NOVAK',
                text: 'I just got off the phone with Carol Reeves. She\'s desperate. Says Danny never misses his dad\'s birthday. Tell me you have something.'
            }
        },
        {
            id: 'novak_4',
            minGameHours: 22,
            condition: (s) => s.connections.length >= 3,
            message: {
                from: 'DET. NOVAK',
                text: 'Someone from the State Department just called my personal cell asking about this case. Not my desk phone — my PERSONAL cell. What the hell did you find on those devices?'
            }
        }
    ],

    // === COUNTER-SURVEILLANCE EVENTS ===
    SURVEILLANCE_TRIGGERS: [
        {
            id: 'surv_1',
            minGameHours: 6,
            condition: (s) => s.recoveredFiles.desktop.length >= 1,
            effect: 'network_spike'
        },
        {
            id: 'surv_2',
            minGameHours: 10,
            condition: (s) => s.pinnedEvidence.length >= 4,
            effect: 'phantom_file'
        },
        {
            id: 'surv_3',
            minGameHours: 16,
            condition: (s) => s.connections.length >= 3,
            effect: 'camera_activate'
        },
        {
            id: 'surv_4',
            minGameHours: 19,
            condition: (s) => s.connections.length >= 4,
            effect: 'screen_glitch'
        }
    ],

    // === REMOTE WIPE SYSTEM ===
    WIPE_DURATION_GAME_HOURS: 10, // 10 in-game hours = ~10 real minutes

    startRemoteWipe() {
        if (this.state.remoteWipeActive || this.state.remoteWipeCompleted) return;
        this.state.remoteWipeActive = true;
        this.state.remoteWipeStart = Date.now();
        this.save();
        this.renderWipeBar();
        this.showNotification({
            from: 'SYSTEM ALERT',
            text: 'REMOTE WIPE SIGNAL DETECTED on subject\'s phone. Estimated time to data destruction: ' + this.WIPE_DURATION_GAME_HOURS + ' hours. Recover deleted files NOW.',
            time: this.formatGameTime()
        }, 'wipe');
        this.blinkClock('threat');
        this.shakeScreen();
        this.playVibrationSound('threat');
    },

    checkWipeStatus() {
        if (!this.state.remoteWipeActive || this.state.remoteWipeCompleted) return;

        const realElapsed = Date.now() - this.state.remoteWipeStart;
        const gameHoursElapsed = realElapsed / 1000 / 60; // real seconds → game minutes → game hours
        const progress = Math.min(1, gameHoursElapsed / this.WIPE_DURATION_GAME_HOURS);

        // Update the wipe bar
        const bar = document.getElementById('g8-wipe-fill');
        const pct = document.getElementById('g8-wipe-pct');
        if (bar) bar.style.width = (progress * 100) + '%';
        if (pct) pct.textContent = Math.floor(progress * 100) + '%';

        if (progress >= 1) {
            // Wipe complete — check if phone files were recovered in time
            this.state.remoteWipeCompleted = true;
            this.state.remoteWipeActive = false;

            const phoneRecovered = this.state.recoveredFiles.phone?.length || 0;
            if (phoneRecovered < 2) {
                // Files not recovered — they're corrupted now
                this.state.progressFlags.phone_wiped = true;
                this.showNotification({
                    from: 'SYSTEM ALERT',
                    text: 'REMOTE WIPE COMPLETE. Deleted phone data has been overwritten. Partial forensic recovery may still be possible via DataDrill deep scan.',
                    time: this.formatGameTime()
                }, 'wipe');
            } else {
                this.showNotification({
                    from: 'SYSTEM ALERT',
                    text: 'REMOTE WIPE COMPLETE. Critical phone data was recovered before destruction. Evidence integrity preserved.',
                    time: this.formatGameTime()
                }, 'tip');
            }
            this.save();

            const wipeBar = document.getElementById('g8-wipe-bar');
            if (wipeBar) setTimeout(() => wipeBar.remove(), 5000);
        }
    },

    renderWipeBar() {
        if (document.getElementById('g8-wipe-bar')) return;

        const bar = document.createElement('div');
        bar.id = 'g8-wipe-bar';
        bar.innerHTML = `
            <div class="g8-wipe-label">
                <span class="g8-wipe-icon">&#9888;</span>
                REMOTE WIPE IN PROGRESS — PHONE DATA BEING DESTROYED
                <span id="g8-wipe-pct">0%</span>
            </div>
            <div class="g8-wipe-track">
                <div class="g8-wipe-fill" id="g8-wipe-fill"></div>
            </div>
        `;
        document.body.appendChild(bar);

        // Start checking wipe progress
        this._wipeInterval = setInterval(() => this.checkWipeStatus(), 1000);
    },

    checkTriggers() {
        if (!this.state) return;

        const gt = this.getInGameTime();
        let changed = false;

        // Threats
        for (const trigger of this.THREAT_TRIGGERS) {
            if (!this.state.threats.find(t => t.id === trigger.id) &&
                gt.gameHoursElapsed >= (trigger.minGameHours || 0) &&
                trigger.condition(this.state)) {
                const gameTimeStr = this.formatGameTime(gt);
                const threat = { ...trigger.message, id: trigger.id, timestamp: Date.now(), time: gameTimeStr };
                this.state.threats.push(threat);
                changed = true;
                this.triggerAlert(threat, 'threat');

                // Threat 2 triggers remote wipe
                if (trigger.id === 'threat_2') {
                    setTimeout(() => this.startRemoteWipe(), 3000);
                }
            }
        }

        // Tips
        for (const trigger of this.TIP_TRIGGERS) {
            if (!this.state.anonymousTips.find(t => t.id === trigger.id) &&
                gt.gameHoursElapsed >= (trigger.minGameHours || 0) &&
                trigger.condition(this.state)) {
                const gameTimeStr = this.formatGameTime(gt);
                const tip = { ...trigger.message, id: trigger.id, timestamp: Date.now(), time: gameTimeStr };
                this.state.anonymousTips.push(tip);
                changed = true;
                this.triggerAlert(tip, 'tip');
            }
        }

        // Novak check-ins
        for (const trigger of this.NOVAK_TRIGGERS) {
            if (!this.state.novakMessages.find(t => t.id === trigger.id) &&
                gt.gameHoursElapsed >= (trigger.minGameHours || 0) &&
                trigger.condition(this.state)) {
                const gameTimeStr = this.formatGameTime(gt);
                const msg = { ...trigger.message, id: trigger.id, timestamp: Date.now(), time: gameTimeStr };
                this.state.novakMessages.push(msg);
                changed = true;
                this.triggerAlert(msg, 'novak');
            }
        }

        // Counter-surveillance events
        for (const trigger of this.SURVEILLANCE_TRIGGERS) {
            if (!this.state.surveillanceEvents.includes(trigger.id) &&
                gt.gameHoursElapsed >= (trigger.minGameHours || 0) &&
                trigger.condition(this.state)) {
                this.state.surveillanceEvents.push(trigger.id);
                changed = true;
                this.triggerSurveillanceEvent(trigger.effect);
            }
        }

        // Resume wipe bar if active
        if (this.state.remoteWipeActive && !this.state.remoteWipeCompleted && !document.getElementById('g8-wipe-bar')) {
            this.renderWipeBar();
        }

        if (changed) this.save();
    },

    // === COUNTER-SURVEILLANCE EFFECTS ===
    triggerSurveillanceEvent(effect) {
        switch(effect) {
            case 'network_spike':
                this.showSurveillanceOverlay(
                    '&#9888; NETWORK ANOMALY DETECTED',
                    'UNKNOWN CONNECTION: 14.221.47.' + Math.floor(Math.random()*255) + ' \u2192 LOCAL:3389\nDuration: 0.3s | Packets: ' + (Math.floor(Math.random()*900)+100) + ' | Status: TERMINATED',
                    '#e74c3c', 4000
                );
                this.playStaticBurst();
                break;

            case 'phantom_file':
                this.showSurveillanceOverlay('FILE CREATED: watching.txt', 'Source: UNKNOWN PROCESS', '#e74c3c', 1500);
                setTimeout(() => {
                    this.showSurveillanceOverlay('FILE DELETED: watching.txt', 'Process terminated', '#666', 2000);
                    this.flickerScreen();
                }, 2000);
                break;

            case 'camera_activate':
                this.showCameraIndicator();
                break;

            case 'screen_glitch':
                this.triggerGlitch();
                this.playStaticBurst();
                break;
        }
    },

    showSurveillanceOverlay(title, detail, color, duration) {
        const overlay = document.createElement('div');
        overlay.className = 'g8-surv-overlay';
        overlay.style.borderColor = color;
        overlay.innerHTML = `
            <div class="g8-surv-title" style="color:${color};">${title}</div>
            <div class="g8-surv-detail">${detail.replace(/\n/g, '<br>')}</div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => { overlay.classList.add('g8-surv-fade'); }, duration - 500);
        setTimeout(() => overlay.remove(), duration);
    },

    showCameraIndicator() {
        const dot = document.createElement('div');
        dot.className = 'g8-camera-dot';
        dot.innerHTML = '<span class="g8-camera-label">CAMERA ACTIVE</span>';
        document.body.appendChild(dot);
        this.playStaticBurst();
        setTimeout(() => { dot.classList.add('g8-camera-fade'); }, 2500);
        setTimeout(() => dot.remove(), 3000);
    },

    flickerScreen() {
        document.body.classList.add('g8-flicker');
        setTimeout(() => document.body.classList.remove('g8-flicker'), 300);
    },

    triggerGlitch() {
        document.body.classList.add('g8-glitch-active');
        setTimeout(() => document.body.classList.remove('g8-glitch-active'), 800);
    },

    playStaticBurst() {
        try {
            if (!this._audioCtx) this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = this._audioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const bufferSize = ctx.sampleRate * 0.15;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.08;

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(this.state.soundVolume || 0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            source.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        } catch(e) {}
    },

    // === ALERT SYSTEM (notification + clock blink + shake + vibration) ===
    triggerAlert(msg, type) {
        this.showNotification(msg, type);
        // Only shake + vibrate for threats and wipes (not Novak or tips)
        if (type === 'threat' || type === 'wipe') {
            this.blinkClock('threat');
            this.shakeScreen();
            this.playVibrationSound('threat');
        } else if (type === 'novak') {
            this.blinkClock('novak');
            this.playVibrationSound('tip');
        } else {
            this.blinkClock('tip');
            this.playVibrationSound('tip');
        }
    },

    blinkClock(type) {
        const clock = document.getElementById('g8-clock');
        if (!clock) return;
        const clsMap = { threat: 'g8-clock-alert-threat', tip: 'g8-clock-alert-tip', novak: 'g8-clock-alert-novak' };
        const cls = clsMap[type] || 'g8-clock-alert-tip';
        clock.classList.add(cls);
        setTimeout(() => clock.classList.remove(cls), 4000);
    },

    shakeScreen() {
        document.body.classList.add('g8-screen-shake');
        setTimeout(() => document.body.classList.remove('g8-screen-shake'), 600);
    },

    playVibrationSound(type) {
        try {
            if (!this._audioCtx) {
                this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = this._audioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            // Two-burst phone vibration pattern
            const playBuzz = (startTime, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const lfo = ctx.createOscillator(); // low-freq modulator for buzz texture
                const lfoGain = ctx.createGain();

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(type === 'threat' ? 120 : 160, startTime);
                osc.frequency.exponentialRampToValueAtTime(type === 'threat' ? 70 : 100, startTime + duration);

                lfo.type = 'square';
                lfo.frequency.setValueAtTime(30, startTime);
                lfoGain.gain.setValueAtTime(50, startTime);

                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
                gain.gain.setValueAtTime(0.12, startTime + duration - 0.02);
                gain.gain.linearRampToValueAtTime(0, startTime + duration);

                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + duration);
                lfo.start(startTime);
                lfo.stop(startTime + duration);
            };

            // Buzz — pause — buzz (phone vibration pattern)
            const now = ctx.currentTime;
            playBuzz(now, 0.2);
            playBuzz(now + 0.35, 0.2);
        } catch(e) {
            // Web Audio not available — silent fallback
        }
    },

    showNotification(msg, type) {
        const notif = document.createElement('div');
        const clsMap = { threat: 'g8-notif-threat', tip: 'g8-notif-tip', novak: 'g8-notif-novak', wipe: 'g8-notif-wipe' };
        notif.className = 'g8-notif ' + (clsMap[type] || 'g8-notif-tip');
        const iconMap = { threat: '&#9888;', tip: '&#9993;', novak: '&#128187;', wipe: '&#9888;' };
        notif.innerHTML = `
            <div class="g8-notif-icon">${iconMap[type] || '&#9993;'}</div>
            <div class="g8-notif-body">
                <div class="g8-notif-from">${msg.from}</div>
                <div class="g8-notif-text">${msg.text}</div>
                <div class="g8-notif-time">${msg.time || ''}</div>
            </div>
        `;

        // Inject notification styles if not present
        if (!document.getElementById('g8-notif-styles')) {
            const style = document.createElement('style');
            style.id = 'g8-notif-styles';
            style.textContent = `
                .g8-notif {
                    position: fixed; top: 60px; right: 20px; z-index: 3000;
                    display: flex; gap: 12px; align-items: flex-start;
                    padding: 14px 18px; border-radius: 6px; max-width: 380px;
                    font-family: 'Courier New', monospace; font-size: 0.72rem;
                    animation: notifSlide 0.4s ease-out, notifFade 0.5s ease-in 8s forwards;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
                    cursor: pointer;
                }
                .g8-notif-threat, .g8-notif-wipe {
                    background: rgba(60, 10, 10, 0.95);
                    border: 1px solid rgba(231, 76, 60, 0.4);
                    color: #e0a0a0;
                }
                .g8-notif-tip {
                    background: rgba(10, 40, 10, 0.95);
                    border: 1px solid rgba(46, 204, 113, 0.4);
                    color: #a0e0a0;
                }
                .g8-notif-novak {
                    background: rgba(10, 20, 50, 0.95);
                    border: 1px solid rgba(52, 152, 219, 0.4);
                    color: #a0c0e0;
                }
                .g8-notif-icon { font-size: 1.2rem; margin-top: 2px; }
                .g8-notif-from { font-weight: bold; font-size: 0.6rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px; opacity: 0.7; }
                .g8-notif-text { line-height: 1.5; }
                .g8-notif-time { font-size: 0.55rem; opacity: 0.5; margin-top: 6px; letter-spacing: 0.1em; }
                @keyframes notifSlide { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes notifFade { from { opacity: 1; } to { opacity: 0; pointer-events: none; } }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notif);
        notif.addEventListener('click', () => notif.remove());
        setTimeout(() => notif.remove(), 9000);
    },

    // === GOD MODE ===
    setupGodMode() {
        const keys = [];
        document.addEventListener('keydown', (e) => {
            keys.push(e.key);
            if (keys.length > 20) keys.shift();
            // Ctrl+Shift+G
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                this.toggleGodMode();
            }
        });
        if (this.state.godMode) {
            document.body.classList.add('god-mode');
        }
    },

    toggleGodMode() {
        this.state.godMode = !this.state.godMode;
        document.body.classList.toggle('god-mode', this.state.godMode);
        this.save();
        console.log(`%c[GOD MODE] ${this.state.godMode ? 'ACTIVATED' : 'DEACTIVATED'}`, 'color: #e74c3c; font-size: 14px');
        if (this.state.godMode) {
            this.showGodModeOverlay();
        }
    },

    showGodModeOverlay() {
        let banner = document.querySelector('.g8-god-mode-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'g8-god-mode-banner';
            banner.textContent = '// GOD MODE ACTIVE — ALL EVIDENCE VISIBLE //';
            document.body.appendChild(banner);
        }
        banner.style.display = this.state.godMode ? 'block' : 'none';
    },

    // === CROSS-PAGE STATE CHANGE HANDLER ===
    onStateChange() {
        this.updateScoreBadge();
        if (typeof window.onGoneDarkStateChange === 'function') {
            window.onGoneDarkStateChange(this.state);
        }
    },

    // === AMBIENT SOUNDSCAPE (Web Audio API — no external files) ===
    _soundNodes: null,

    initSoundscape() {
        if (this._soundNodes) return; // already initialized
        if (!this.state.soundEnabled) return;

        try {
            if (!this._audioCtx) this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const ctx = this._audioCtx;

            // Master gain
            const master = ctx.createGain();
            master.gain.setValueAtTime(this.state.soundVolume || 0.3, ctx.currentTime);
            master.connect(ctx.destination);

            // Fluorescent light hum (120Hz + harmonics — US mains frequency)
            const hum = ctx.createOscillator();
            const humGain = ctx.createGain();
            hum.type = 'sine';
            hum.frequency.setValueAtTime(120, ctx.currentTime);
            humGain.gain.setValueAtTime(0.015, ctx.currentTime);
            hum.connect(humGain);
            humGain.connect(master);
            hum.start();

            // 240Hz harmonic
            const hum2 = ctx.createOscillator();
            const hum2Gain = ctx.createGain();
            hum2.type = 'sine';
            hum2.frequency.setValueAtTime(240, ctx.currentTime);
            hum2Gain.gain.setValueAtTime(0.006, ctx.currentTime);
            hum2.connect(hum2Gain);
            hum2Gain.connect(master);
            hum2.start();

            // Computer fan — filtered white noise, very low
            const fanBufferSize = ctx.sampleRate * 2;
            const fanBuffer = ctx.createBuffer(1, fanBufferSize, ctx.sampleRate);
            const fanData = fanBuffer.getChannelData(0);
            for (let i = 0; i < fanBufferSize; i++) fanData[i] = Math.random() * 2 - 1;
            const fanSource = ctx.createBufferSource();
            fanSource.buffer = fanBuffer;
            fanSource.loop = true;
            const fanFilter = ctx.createBiquadFilter();
            fanFilter.type = 'lowpass';
            fanFilter.frequency.setValueAtTime(800, ctx.currentTime);
            fanFilter.Q.setValueAtTime(0.5, ctx.currentTime);
            const fanGain = ctx.createGain();
            fanGain.gain.setValueAtTime(0.008, ctx.currentTime);
            fanSource.connect(fanFilter);
            fanFilter.connect(fanGain);
            fanGain.connect(master);
            fanSource.start();

            // Rain — filtered noise, fades in during night
            const rainBufferSize = ctx.sampleRate * 2;
            const rainBuffer = ctx.createBuffer(1, rainBufferSize, ctx.sampleRate);
            const rainData = rainBuffer.getChannelData(0);
            for (let i = 0; i < rainBufferSize; i++) rainData[i] = Math.random() * 2 - 1;
            const rainSource = ctx.createBufferSource();
            rainSource.buffer = rainBuffer;
            rainSource.loop = true;
            const rainFilter = ctx.createBiquadFilter();
            rainFilter.type = 'bandpass';
            rainFilter.frequency.setValueAtTime(3000, ctx.currentTime);
            rainFilter.Q.setValueAtTime(0.3, ctx.currentTime);
            const rainGain = ctx.createGain();
            rainGain.gain.setValueAtTime(0, ctx.currentTime);
            rainSource.connect(rainFilter);
            rainFilter.connect(rainGain);
            rainGain.connect(master);
            rainSource.start();

            this._soundNodes = { master, hum, hum2, humGain, hum2Gain, fanSource, fanGain, rainSource, rainGain, rainFilter };

            // Radio crackle — periodic random burst
            this._radioInterval = setInterval(() => this.playRadioCrackle(), 25000 + Math.random() * 35000);

            // Update rain based on time of day
            this._rainInterval = setInterval(() => {
                const gt = this.getInGameTime();
                const targetRain = gt.isNight ? 0.018 : gt.isDusk ? 0.006 : 0;
                rainGain.gain.linearRampToValueAtTime(targetRain, ctx.currentTime + 3);
            }, 5000);

        } catch(e) {
            console.warn('[GONE DARK] Sound engine failed to initialize:', e);
        }
    },

    playRadioCrackle() {
        if (!this._audioCtx || !this._soundNodes || !this.state.soundEnabled) return;
        try {
            const ctx = this._audioCtx;
            const master = this._soundNodes.master;

            // Static burst
            const len = ctx.sampleRate * (0.3 + Math.random() * 0.5);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) {
                d[i] = (Math.random() * 2 - 1) * (0.03 + Math.random() * 0.02);
                // Occasional tone blip
                if (Math.random() < 0.01) d[i] += Math.sin(i * 0.15) * 0.04;
            }
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, ctx.currentTime);
            g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
            g.gain.setValueAtTime(1, ctx.currentTime + len / ctx.sampleRate - 0.05);
            g.gain.linearRampToValueAtTime(0, ctx.currentTime + len / ctx.sampleRate);
            src.connect(g);
            g.connect(master);
            src.start();
        } catch(e) {}
    },

    setSoundVolume(vol) {
        this.state.soundVolume = vol;
        this.save();
        if (this._soundNodes?.master) {
            this._soundNodes.master.gain.linearRampToValueAtTime(vol, this._audioCtx.currentTime + 0.2);
        }
    },

    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        this.save();
        if (this.state.soundEnabled) {
            this.initSoundscape();
        } else if (this._soundNodes?.master) {
            this._soundNodes.master.gain.linearRampToValueAtTime(0, this._audioCtx.currentTime + 0.5);
            setTimeout(() => {
                if (this._soundNodes) {
                    try { this._soundNodes.hum.stop(); } catch(e) {}
                    try { this._soundNodes.hum2.stop(); } catch(e) {}
                    try { this._soundNodes.fanSource.stop(); } catch(e) {}
                    try { this._soundNodes.rainSource.stop(); } catch(e) {}
                    this._soundNodes = null;
                }
                clearInterval(this._radioInterval);
                clearInterval(this._rainInterval);
            }, 600);
        }
        this.updateSoundButton();
    },

    updateSoundButton() {
        const btn = document.getElementById('g8-sound-btn');
        if (btn) btn.textContent = this.state.soundEnabled ? '\u266B' : '\u266A';
        const btnEl = document.getElementById('g8-sound-btn');
        if (btnEl) btnEl.title = this.state.soundEnabled ? 'Mute ambient sound' : 'Enable ambient sound';
    },

    // === NAV BAR BUILDER ===
    buildNav(activePage) {
        // Detect if we're in a subdirectory (e.g., reports/)
        const inSubdir = window.location.pathname.includes('/gate-8/reports/') ||
                         window.location.pathname.includes('/gate-8/evidence/');
        const base = inSubdir ? '../' : '';

        const pages = [
            { id: 'hub', label: 'Hub', href: base + 'index.html' },
            { id: 'desktop', label: 'Desktop', href: base + 'desktop.html' },
            { id: 'laptop', label: 'Laptop', href: base + 'laptop.html' },
            { id: 'phone', label: 'Phone', href: base + 'phone.html' },
            { id: 'caseboard', label: 'Case Board', href: base + 'caseboard.html' },
            { id: 'datadrill', label: 'DataDrill', href: base + 'datadrill.html' },
            { id: 'reports', label: 'Case File', href: base + 'reports/police-report.html' }
        ];

        const nav = document.createElement('nav');
        nav.className = 'g8-nav';
        nav.innerHTML = `
            <div class="g8-nav-left">
                <a href="${base}index.html" class="g8-nav-brand">
                    <span class="brand-icon">&#9762;</span>
                    <span>GONE DARK</span>
                </a>
                <span class="g8-nav-sep">/</span>
                <span class="g8-nav-page">${pages.find(p => p.id === activePage)?.label || activePage}</span>
            </div>
            <div class="g8-nav-right">
                <div class="g8-nav-links">
                    ${pages.map(p => `<a href="${p.href}" class="g8-nav-link ${p.id === activePage ? 'active' : ''}">${p.label}</a>`).join('')}
                </div>
                <div class="g8-clock" id="g8-clock">
                    <span class="g8-clock-celestial day">&#9728;</span>
                    <span class="g8-clock-time">MON 8:00 AM</span>
                </div>
                <button class="g8-sound-btn" id="g8-sound-btn" onclick="GoneDark.toggleSound()" title="${this.state?.soundEnabled ? 'Mute' : 'Enable'} ambient sound">&#9835;</button>
                <span class="g8-score-badge">SCORE: ${this.state?.score || 1000}</span>
            </div>
        `;

        document.body.insertBefore(nav, document.body.firstChild);

        // God mode banner
        const banner = document.createElement('div');
        banner.className = 'g8-god-mode-banner';
        banner.textContent = '// GOD MODE ACTIVE — ALL EVIDENCE VISIBLE //';
        document.body.appendChild(banner);
    },

    // === UTILITY ===
    formatTime(ms) {
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(sec / 60);
        const hr = Math.floor(min / 60);
        if (hr > 0) return `${hr}h ${min % 60}m`;
        if (min > 0) return `${min}m ${sec % 60}s`;
        return `${sec}s`;
    },

    getElapsed() {
        return Date.now() - this.state.startTime;
    },

    getProgress() {
        const totalFiles = 7; // recoverable files
        const totalConnections = 7;
        const recovered = Object.values(this.state.recoveredFiles).flat().length;
        const connected = this.state.connections.length;
        const pinned = this.state.pinnedEvidence.length;
        return {
            recovered: { count: recovered, total: totalFiles, pct: Math.round(recovered / totalFiles * 100) },
            connections: { count: connected, total: totalConnections, pct: Math.round(connected / totalConnections * 100) },
            pinned: pinned,
            score: this.state.score,
            canSubmit: connected >= 5
        };
    }
};

// === EVIDENCE CATALOG (all pinnable evidence across all pages) ===
const EVIDENCE_CATALOG = {
    // Desktop files
    'desk-mission-brief': { title: 'Mission Brief (FINAL)', detail: 'Operational document referencing NIGHTFALL, extraction protocol', source: 'desktop', category: 'documents' },
    'desk-contacts': { title: 'Contacts Directory', detail: 'CARDINAL = Sarah K, handler. Istanbul contacts listed.', source: 'desktop', category: 'people' },
    'desk-map-scan': { title: 'Scanned Map — Kadıköy Circled', detail: 'Paper map of Istanbul with Kadıköy district circled in red', source: 'desktop', category: 'places' },
    'desk-flight-options': { title: 'Flight Options PDF', detail: 'IST (Istanbul) flight search results document', source: 'desktop', category: 'documents' },
    'desk-istanbul-neighborhoods': { title: 'Istanbul Neighborhoods PDF', detail: 'Research on Istanbul districts including Kadıköy', source: 'desktop', category: 'places' },
    'desk-browser-kadikoy': { title: 'Browser: Kadıköy Ferry Terminal Search', detail: 'Google Maps search for Kadıköy ferry terminal, Tue 9:22 AM', source: 'desktop', category: 'places' },
    'desk-browser-flights': { title: 'Browser: Turkish Airlines IAH→IST', detail: 'Flight search, Tue 10:05 AM', source: 'desktop', category: 'documents' },
    'desk-browser-warehouses': { title: 'Browser: Warehouses near Kadıköy', detail: 'Google Maps search, Tue 2:15 PM', source: 'desktop', category: 'places' },
    'desk-photo-vacation': { title: 'Vacation Photo', detail: 'Beach scene — appears unrelated to case', source: 'desktop', category: 'photos', isRedHerring: true },
    'desk-photo-team': { title: 'Team Photo (Blurred)', detail: 'Office group photo with faces obscured', source: 'desktop', category: 'photos', isRedHerring: true },

    // Desktop recovered
    'desk-rec-warehouse-photo': { title: '[RECOVERED] Warehouse Exterior Photo', detail: 'EXIF GPS: 40.9908°N, 29.0234°E — Kadıköy district', source: 'recovered', category: 'photos' },
    'desk-rec-draft-notes': { title: '[RECOVERED] Draft Notes', detail: '"Warehouse 7, K___ district. 48hr window."', source: 'recovered', category: 'documents' },
    'desk-rec-burner-setup': { title: '[RECOVERED] Burner Phone Setup', detail: 'Prepaid phone configuration instructions', source: 'recovered', category: 'documents' },

    // Laptop
    'lap-email-flight': { title: 'Turkish Airlines Booking Confirmation', detail: 'IAH → IST, one-way, Wed Feb 12. Passenger: Michael Torres', source: 'laptop', category: 'documents' },
    'lap-email-cardinal': { title: 'Email: NIGHTFALL-7742 from CARDINAL', detail: 'Operational directive — extraction parameters, asset profile', source: 'laptop', category: 'documents' },
    'lap-email-hotel': { title: 'Kadıköy Residence Hotel Reservation', detail: 'Booking under Michael Torres, check-in Wed', source: 'laptop', category: 'places' },
    'lap-calendar': { title: 'Calendar: NIGHTFALL — DO NOT MISS', detail: 'Wednesday all-day block, no location listed', source: 'laptop', category: 'documents' },
    'lap-cover-identity': { title: 'Cover Identity Brief', detail: 'Michael Torres — passport, Aegean Trade Solutions credentials', source: 'laptop', category: 'people' },
    'lap-extraction-checklist': { title: 'Extraction Checklist', detail: 'Passport ✓, Burner ✓, Cash (TRY) ✓, Cover docs ✓, Comms plan ✓', source: 'laptop', category: 'documents' },
    'lap-kadikoy-intel': { title: 'Kadıköy Area Intel Map', detail: 'Satellite-style map with numbered warehouses. W-7 circled.', source: 'laptop', category: 'places' },

    // Laptop recovered
    'lap-rec-signal-plan': { title: '[RECOVERED] Signal Plan', detail: 'Comms protocol: encrypted app every 6hrs, SMS fallback, dead drop at Moda pier', source: 'recovered', category: 'documents' },
    'lap-rec-exit-routes': { title: '[RECOVERED] Exit Routes', detail: 'Three extraction routes from Kadıköy: ferry, highway, rail', source: 'recovered', category: 'places' },

    // Phone
    'phone-msg-sarah-thread': { title: 'Messages: Sarah K Thread', detail: 'Last msg: "At the site. Going silent." Wed 8:47 PM', source: 'phone', category: 'communications' },
    'phone-msg-mom': { title: 'Messages: Mom Thread', detail: '"Work trip came up, back by Friday" — cover story', source: 'phone', category: 'communications' },
    'phone-photo-anchor': { title: 'Photo: The Anchor Restaurant', detail: 'Low light interior, Mon 7:42 PM, GPS: Georgetown DC', source: 'phone', category: 'photos' },
    'phone-photo-handwritten': { title: 'Photo: Handwritten Note', detail: '"W-7, east gate, 2000hrs" — Mon 8:15 PM', source: 'phone', category: 'photos' },
    'phone-photo-airport': { title: 'Photo: IAH Terminal Selfie', detail: 'Wed 5:30 AM, Houston airport before departure', source: 'phone', category: 'photos' },
    'phone-credit-anchor': { title: 'Credit Card: The Anchor Restaurant', detail: '$47.80, Mon, Georgetown DC', source: 'phone', category: 'documents' },
    'phone-credit-dutyfree': { title: 'Credit Card: IST Duty Free', detail: '₺847 ($28.50), Wed, Istanbul Turkey', source: 'phone', category: 'documents' },
    'phone-credit-taxi': { title: 'Credit Card: Istanbul Taxi', detail: '₺450 ($15.20), Wed, Istanbul', source: 'phone', category: 'documents' },
    'phone-credit-migros': { title: 'Credit Card: Migros Market', detail: '₺285 ($9.60), Wed, Kadıköy, Istanbul', source: 'phone', category: 'places' },
    'phone-call-unknown-long': { title: 'Call Log: Unknown 11min Call', detail: 'Mon 10:12 PM, incoming, 11 minutes — intermediary?', source: 'phone', category: 'communications' },
    'phone-call-istanbul': { title: 'Call Log: Istanbul Contact (+90)', detail: 'Wed 12:30 PM outgoing (2 min), Wed 8:40 PM incoming (1 min)', source: 'phone', category: 'communications' },
    'phone-location-history': { title: 'Location History: Signal Lost', detail: 'Wed route: Arlington → IAH → IST → Kadıköy → ❌ SIGNAL LOST 9:02 PM', source: 'phone', category: 'places' },

    // Phone recovered
    'phone-rec-deleted-msg': { title: '[RECOVERED] Deleted Messages: +90 Number', detail: '"Warehouse 7. East entrance. Come alone." — Wed 7:30 PM', source: 'recovered', category: 'communications' },
    'phone-rec-warehouse-photo': { title: '[RECOVERED] Deleted Photo: Warehouse at Dusk', detail: 'EXIF GPS: 40.9908°N, 29.0234°E — partial corruption', source: 'recovered', category: 'photos' },

    // Reports
    'report-missing-persons': { title: 'Missing Persons Report', detail: 'Case #2026-MP-04871, Daniel Reeves, 72+ hours missing', source: 'report', category: 'documents' },
    'report-neighbor': { title: 'Witness: James Chen (Neighbor)', detail: 'Last saw Daniel Mon evening, heard early departure Wed 5 AM', source: 'report', category: 'people' },
    'report-bartender': { title: 'Witness: Maria Santos (Bartender)', detail: 'Saw Daniel with a woman Mon night at The Anchor, back booth', source: 'report', category: 'people' },
    'report-colleague': { title: 'Witness: Karen Liu (Colleague)', detail: 'Daniel mentioned "client meeting in Europe", missed Thu call', source: 'report', category: 'people' },
    'report-case-summary': { title: 'Det. Novak Case Summary', detail: 'No departure record for Daniel Reeves at any DC airport', source: 'report', category: 'documents' }
};

// === KEY CONNECTIONS (the 7 the student needs to find) ===
const KEY_CONNECTIONS = [
    { id: 'conn-destination', label: 'Destination: Istanbul', description: 'Flight booking + credit card charges + browser history all point to Istanbul', evidenceIds: ['lap-email-flight', 'phone-credit-dutyfree', 'desk-browser-flights'] },
    { id: 'conn-district', label: 'District: Kadıköy', description: 'Credit card + browser + map scan + intel doc identify Kadıköy district', evidenceIds: ['phone-credit-migros', 'desk-browser-kadikoy', 'desk-map-scan', 'lap-kadikoy-intel'] },
    { id: 'conn-site', label: 'Site: Warehouse 7', description: 'Deleted message + draft notes + intel map + handwritten note photo', evidenceIds: ['phone-rec-deleted-msg', 'desk-rec-draft-notes', 'lap-kadikoy-intel', 'phone-photo-handwritten'] },
    { id: 'conn-cover', label: 'Cover Identity: Michael Torres', description: 'Cover identity brief + flight booking name mismatch', evidenceIds: ['lap-cover-identity', 'lap-email-flight'] },
    { id: 'conn-handler', label: 'Handler: CARDINAL = Sarah K', description: 'Contacts directory + message thread + call patterns', evidenceIds: ['desk-contacts', 'phone-msg-sarah-thread', 'phone-call-unknown-long'] },
    { id: 'conn-timeline', label: 'Timeline: Mon→Wed Night', description: 'Mon briefing → Tue prep → Wed travel → Wed night goes silent', evidenceIds: ['phone-msg-sarah-thread', 'lap-calendar', 'phone-photo-airport'] },
    { id: 'conn-signal-lost', label: 'Signal Lost: Kadıköy, Wed ~9 PM', description: 'Location history + last message + last call converge', evidenceIds: ['phone-location-history', 'phone-msg-sarah-thread', 'phone-call-istanbul'] }
];
