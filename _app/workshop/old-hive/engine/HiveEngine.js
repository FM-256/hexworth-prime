/**
 * HiveEngine.js — The Hive Core Engine
 *
 * Shared rendering engine for The Hive escape-room facility.
 *
 * Public API:
 *   HiveEngine.renderHub()           — renders the hub cross-section page
 *   HiveEngine.renderFloor(floorId)  — renders a floor's puzzle sequence
 *
 * Reads/writes progress via localStorage key: hexworth_hive_progress
 *
 * Depends on: RedQueen.js, PuzzleRenderer.js (loaded before this file)
 */

const HiveEngine = (() => {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    const STORAGE_KEY = 'hexworth_hive_progress';

    const FLOORS = [
        { id: 'compression-vault', title: 'Compression Vault', floor: 'B-1',
          house: 'forge', icon: '🔧', difficulty: 1, depthTier: 'pristine',
          requiresCompleted: 0 },
        { id: 'cipher-break', title: 'Cipher Break', floor: 'B-2',
          house: 'key', icon: '🔑', difficulty: 1, depthTier: 'pristine',
          requiresCompleted: 0 },
        { id: null, title: 'Packet Panic', floor: 'B-3', house: 'shield',
          icon: '🛡️', difficulty: 2, depthTier: 'worn', requiresCompleted: 1, comingSoon: true },
        { id: null, title: 'Script Injection', floor: 'B-4', house: 'web',
          icon: '🌐', difficulty: 2, depthTier: 'worn', requiresCompleted: 1, comingSoon: true },
        { id: null, title: 'Logic Bomb', floor: 'B-5', house: 'script',
          icon: '📜', difficulty: 2, depthTier: 'worn', requiresCompleted: 1, comingSoon: true },
        { id: null, title: 'Cloud Breach', floor: 'B-6', house: 'cloud',
          icon: '☁️', difficulty: 3, depthTier: 'damaged', requiresCompleted: 3, comingSoon: true },
        { id: null, title: 'Memory Dump', floor: 'B-7', house: 'forge',
          icon: '🔧', difficulty: 3, depthTier: 'damaged', requiresCompleted: 3, comingSoon: true },
        { id: null, title: 'Firewall Maze', floor: 'B-8', house: 'shield',
          icon: '🛡️', difficulty: 3, depthTier: 'damaged', requiresCompleted: 3, comingSoon: true },
        { id: null, title: 'Zero Day', floor: 'B-9', house: 'key',
          icon: '🔑', difficulty: 4, depthTier: 'critical', requiresCompleted: 6, comingSoon: true },
        { id: null, title: 'Kernel Panic', floor: 'B-10', house: 'script',
          icon: '📜', difficulty: 4, depthTier: 'critical', requiresCompleted: 6, comingSoon: true },
        { id: null, title: "Queen's Chamber", floor: 'B-??', house: null,
          icon: '🔴', difficulty: 5, depthTier: 'breach', requiresCompleted: 10, comingSoon: true }
    ];

    const HOUSE_COLORS = {
        forge:  '#e67e22',
        key:    '#9b59b6',
        shield: '#3498db',
        web:    '#2ecc71',
        script: '#f39c12',
        cloud:  '#1abc9c'
    };

    const DEPTH_TIERS = {
        pristine: { bg: '#e8e8e8', accent: '#cc0000', bodyClass: 'hive-pristine' },
        worn:     { bg: '#d0d0d0', accent: '#cc8800', bodyClass: 'hive-worn' },
        damaged:  { bg: '#999999', accent: '#cc0000', bodyClass: 'hive-damaged' },
        critical: { bg: '#444444', accent: '#ff0000', bodyClass: 'hive-critical' },
        breach:   { bg: '#1a0000', accent: '#ff0000', bodyClass: 'hive-breach' }
    };

    // -------------------------------------------------------------------------
    // Progress helpers
    // -------------------------------------------------------------------------

    let _progress = null;

    function _loadProgress() {
        try {
            _progress = JSON.parse(localStorage.getItem(STORAGE_KEY));
        } catch (e) {
            _progress = null;
        }
        if (!_progress || typeof _progress !== 'object') {
            _progress = {
                floorsCompleted: 0,
                floors: {},
                queensChamber: false,
                firstVisit: new Date().toISOString()
            };
            _saveProgress();
        }
    }

    function _saveProgress() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_progress));
    }

    function _getFloorStatus(floorDef) {
        if (floorDef.comingSoon) return 'coming-soon';
        if (!floorDef.id) return 'locked';
        const floorProg = _progress.floors[floorDef.id];
        if (floorProg && floorProg.completed) return 'completed';
        if (_progress.floorsCompleted >= floorDef.requiresCompleted) return 'available';
        return 'locked';
    }

    // -------------------------------------------------------------------------
    // Style injection
    // -------------------------------------------------------------------------

    function _injectStyles(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------------
    // Hub CSS
    // -------------------------------------------------------------------------

    function _getHubCSS() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                background: #f0f0f0;
                color: #222;
                font-family: 'Courier New', monospace;
                min-height: 100vh;
                overflow-x: hidden;
            }

            /* Scan-line overlay */
            body::after {
                content: '';
                position: fixed;
                top: -100%;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(204, 0, 0, 0.2);
                z-index: 9998;
                animation: hvScanline 6s linear infinite;
                pointer-events: none;
            }
            @keyframes hvScanline {
                0% { top: -4px; }
                100% { top: 100%; }
            }

            .hv-hub { max-width: 800px; margin: 0 auto; padding: 20px; }

            /* Header */
            .hv-header {
                position: sticky;
                top: 0;
                z-index: 100;
                background: #f0f0f0;
                padding: 16px 0;
                border-bottom: 2px solid #cc0000;
                margin-bottom: 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .hv-back {
                text-decoration: none;
                color: #888;
                font-size: 0.8rem;
                letter-spacing: 0.05em;
                transition: color 0.2s;
            }
            .hv-back:hover { color: #cc0000; }
            .hv-title-group { text-align: right; }
            .hv-title {
                font-size: 1.4rem;
                font-weight: bold;
                letter-spacing: 0.15em;
                color: #cc0000;
            }
            .hv-subtitle {
                font-size: 0.65rem;
                letter-spacing: 0.2em;
                color: #999;
                margin-top: 2px;
            }

            /* Facility cross-section */
            .hv-facility { display: flex; flex-direction: column; gap: 8px; }

            .hv-floor-row {
                display: grid;
                grid-template-columns: 50px 40px 1fr 90px 36px;
                align-items: center;
                gap: 12px;
                padding: 14px 18px;
                background: #fff;
                border: 1px solid #e0e0e0;
                border-left: 4px solid #cc0000;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .hv-floor-row:hover:not(.hv-locked):not(.hv-coming-soon) {
                transform: translateX(4px);
                box-shadow: 0 2px 12px rgba(204, 0, 0, 0.1);
                border-left-color: #ff0000;
            }
            .hv-floor-row.hv-locked, .hv-floor-row.hv-coming-soon {
                opacity: 0.45;
                cursor: default;
                background: #f5f5f5;
            }
            .hv-floor-row.hv-completed {
                border-left-color: #4caf50;
            }
            .hv-floor-row.hv-available {
                animation: hvPulseRow 2.5s ease-in-out infinite;
            }
            @keyframes hvPulseRow {
                0%, 100% { box-shadow: 0 0 0 rgba(204, 0, 0, 0); }
                50% { box-shadow: 0 0 12px rgba(204, 0, 0, 0.12); }
            }

            .hv-floor-num {
                font-size: 0.75rem;
                font-weight: bold;
                color: #cc0000;
                letter-spacing: 0.05em;
            }
            .hv-floor-icon { font-size: 1.2rem; text-align: center; }
            .hv-floor-info { min-width: 0; }
            .hv-floor-name {
                font-size: 0.85rem;
                font-weight: bold;
                color: #333;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .hv-floor-house {
                font-size: 0.6rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                margin-top: 2px;
            }
            .hv-floor-diff {
                display: flex;
                gap: 3px;
                justify-content: flex-end;
            }
            .hv-diff-bar {
                width: 10px;
                height: 14px;
                background: #ddd;
                border-radius: 2px;
            }
            .hv-diff-bar.filled { background: #cc0000; }
            .hv-floor-status {
                text-align: center;
                font-size: 1rem;
            }

            /* Stats bar */
            .hv-stats {
                display: flex;
                justify-content: center;
                gap: 40px;
                margin-top: 32px;
                padding: 16px 0;
                border-top: 1px solid #ddd;
            }
            .hv-stat {
                text-align: center;
            }
            .hv-stat-val {
                font-size: 1.3rem;
                font-weight: bold;
                color: #cc0000;
            }
            .hv-stat-label {
                font-size: 0.6rem;
                letter-spacing: 0.1em;
                color: #888;
                text-transform: uppercase;
                margin-top: 2px;
            }

            /* Floor depth tier backgrounds */
            .hive-pristine { background: #e8e8e8; }
            .hive-worn { background: #d0d0d0; }
            .hive-damaged {
                background: #999;
                animation: hvFlicker 8s infinite;
            }
            .hive-critical {
                background: #444;
                color: #eee;
                animation: hvFlicker 3s infinite;
            }
            .hive-breach {
                background: #1a0000;
                color: #ff4444;
            }
            @keyframes hvFlicker {
                0%, 97%, 100% { opacity: 1; }
                98% { opacity: 0.92; }
            }

            /* Floor gameplay UI */
            .hv-floor-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                min-height: 100vh;
            }
            .hv-floor-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 0;
                border-bottom: 2px solid #cc0000;
                margin-bottom: 20px;
            }
            .hv-floor-title-text {
                font-size: 1rem;
                font-weight: bold;
                letter-spacing: 0.1em;
                color: #cc0000;
            }
            .hv-floor-sub {
                font-size: 0.65rem;
                color: #888;
                letter-spacing: 0.08em;
                margin-top: 2px;
            }
            .hv-timer {
                font-size: 1.1rem;
                font-weight: bold;
                letter-spacing: 0.08em;
                color: #cc0000;
                font-variant-numeric: tabular-nums;
            }
            .hv-timer.warning { color: #e67e22; }
            .hv-timer.critical { color: #ff0000; animation: hvTimerPulse 0.5s infinite; }
            @keyframes hvTimerPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .hv-progress-bar {
                height: 4px;
                background: #ddd;
                border-radius: 2px;
                margin-bottom: 24px;
                overflow: hidden;
            }
            .hv-progress-fill {
                height: 100%;
                background: #cc0000;
                border-radius: 2px;
                transition: width 0.4s ease;
            }

            .hv-puzzle-container { min-height: 300px; }

            /* Next button after correct answer */
            .hv-next-btn {
                display: block;
                margin: 20px auto 0;
                padding: 12px 40px;
                background: transparent;
                color: #cc0000;
                border: 2px solid #cc0000;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                font-weight: bold;
                letter-spacing: 0.08em;
                cursor: pointer;
                transition: all 0.2s;
            }
            .hv-next-btn:hover { background: #cc0000; color: #fff; }

            /* Completion screen */
            .hv-complete {
                text-align: center;
                padding: 60px 20px;
            }
            .hv-complete-icon { font-size: 3rem; margin-bottom: 16px; }
            .hv-complete-title {
                font-size: 1.4rem;
                font-weight: bold;
                color: #4caf50;
                letter-spacing: 0.1em;
                margin-bottom: 8px;
            }
            .hv-complete-sub {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 24px;
            }
            .hv-complete-stats {
                display: flex;
                justify-content: center;
                gap: 32px;
                margin-bottom: 32px;
                flex-wrap: wrap;
            }
            .hv-complete-stat { text-align: center; }
            .hv-complete-stat-val {
                font-size: 1.5rem;
                font-weight: bold;
                color: #cc0000;
            }
            .hv-complete-stat-label {
                font-size: 0.6rem;
                letter-spacing: 0.1em;
                color: #888;
                text-transform: uppercase;
            }
            .hv-return-btn {
                display: inline-block;
                padding: 14px 40px;
                background: #cc0000;
                color: #fff;
                border: none;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                font-weight: bold;
                letter-spacing: 0.08em;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.2s;
            }
            .hv-return-btn:hover { background: #aa0000; }

            /* Lockdown screen */
            .hv-lockdown {
                text-align: center;
                padding: 60px 20px;
            }
            .hv-lockdown-icon { font-size: 3rem; margin-bottom: 16px; }
            .hv-lockdown-title {
                font-size: 1.4rem;
                font-weight: bold;
                color: #cc0000;
                letter-spacing: 0.1em;
                margin-bottom: 8px;
            }
            .hv-lockdown-sub {
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 24px;
            }
            .hv-retry-btn {
                display: inline-block;
                padding: 14px 40px;
                background: transparent;
                color: #cc0000;
                border: 2px solid #cc0000;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                margin-right: 12px;
            }
            .hv-retry-btn:hover { background: #cc0000; color: #fff; }

            /* Responsive */
            @media (max-width: 600px) {
                .hv-floor-row {
                    grid-template-columns: 40px 32px 1fr 60px 28px;
                    gap: 8px;
                    padding: 10px 12px;
                }
                .hv-floor-name { font-size: 0.75rem; }
                .hv-floor-num { font-size: 0.65rem; }
            }
        `;
    }

    // -------------------------------------------------------------------------
    // Hub rendering
    // -------------------------------------------------------------------------

    function _buildHeader() {
        const header = document.createElement('div');
        header.className = 'hv-header';

        const back = document.createElement('a');
        back.className = 'hv-back';
        back.href = '../dashboard.html';
        back.textContent = '← DASHBOARD';

        const titleGroup = document.createElement('div');
        titleGroup.className = 'hv-title-group';
        titleGroup.innerHTML = `
            <div class="hv-title">THE HIVE</div>
            <div class="hv-subtitle">UNDERGROUND FACILITY — ESCAPE PROTOCOL</div>
        `;

        header.appendChild(back);
        header.appendChild(titleGroup);
        return header;
    }

    function _buildFloorRow(floorDef) {
        const status = _getFloorStatus(floorDef);
        const row = document.createElement('div');
        row.className = 'hv-floor-row';

        if (status === 'completed') row.classList.add('hv-completed');
        else if (status === 'available') row.classList.add('hv-available');
        else if (status === 'locked') row.classList.add('hv-locked');
        else if (status === 'coming-soon') row.classList.add('hv-coming-soon');

        // Floor number
        const num = document.createElement('div');
        num.className = 'hv-floor-num';
        num.textContent = floorDef.floor;

        // Icon
        const icon = document.createElement('div');
        icon.className = 'hv-floor-icon';
        icon.textContent = floorDef.icon || '🔴';

        // Info
        const info = document.createElement('div');
        info.className = 'hv-floor-info';

        const name = document.createElement('div');
        name.className = 'hv-floor-name';
        name.textContent = floorDef.title;

        const house = document.createElement('div');
        house.className = 'hv-floor-house';
        if (floorDef.house) {
            house.textContent = floorDef.house.toUpperCase();
            house.style.color = HOUSE_COLORS[floorDef.house] || '#888';
        }

        info.appendChild(name);
        info.appendChild(house);

        // Difficulty bars
        const diff = document.createElement('div');
        diff.className = 'hv-floor-diff';
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'hv-diff-bar' + (i < floorDef.difficulty ? ' filled' : '');
            diff.appendChild(bar);
        }

        // Status icon
        const statusEl = document.createElement('div');
        statusEl.className = 'hv-floor-status';
        if (status === 'completed') {
            statusEl.textContent = '✓';
            statusEl.style.color = '#4caf50';
        } else if (status === 'available') {
            statusEl.textContent = '▶';
            statusEl.style.color = '#cc0000';
        } else if (status === 'locked') {
            statusEl.textContent = '🔒';
        } else {
            statusEl.textContent = '🔒';
        }

        // Best time for completed floors
        if (status === 'completed' && floorDef.id && _progress.floors[floorDef.id]) {
            const bestTime = _progress.floors[floorDef.id].bestTime;
            if (bestTime) {
                const timeStr = _formatTime(bestTime);
                const timeEl = document.createElement('div');
                timeEl.style.cssText = 'font-size: 0.55rem; color: #4caf50; margin-top: 2px;';
                timeEl.textContent = timeStr;
                info.appendChild(timeEl);
            }
        }

        row.appendChild(num);
        row.appendChild(icon);
        row.appendChild(info);
        row.appendChild(diff);
        row.appendChild(statusEl);

        // Click handler
        if (status === 'available' || status === 'completed') {
            row.onclick = () => {
                window.location.href = `player.html?floor=${floorDef.id}`;
            };
        }

        return row;
    }

    function _buildStatsBar() {
        const stats = document.createElement('div');
        stats.className = 'hv-stats';

        const completedCount = _progress.floorsCompleted;

        // Total time across all floors
        let totalTime = 0;
        Object.values(_progress.floors).forEach(f => {
            if (f.bestTime) totalTime += f.bestTime;
        });

        const items = [
            { val: completedCount, label: 'Floors Cleared' },
            { val: FLOORS.filter(f => f.id).length, label: 'Total Available' },
            { val: totalTime > 0 ? _formatTime(totalTime) : '--:--', label: 'Total Time' }
        ];

        items.forEach(item => {
            const stat = document.createElement('div');
            stat.className = 'hv-stat';
            stat.innerHTML = `
                <div class="hv-stat-val">${item.val}</div>
                <div class="hv-stat-label">${item.label}</div>
            `;
            stats.appendChild(stat);
        });

        return stats;
    }

    function _buildHub() {
        document.body.innerHTML = '';
        _injectStyles(_getHubCSS());

        const hub = document.createElement('div');
        hub.className = 'hv-hub';

        hub.appendChild(_buildHeader());

        // Facility cross-section
        const facility = document.createElement('div');
        facility.className = 'hv-facility';

        FLOORS.forEach(floorDef => {
            facility.appendChild(_buildFloorRow(floorDef));
        });

        hub.appendChild(facility);
        hub.appendChild(_buildStatsBar());

        document.body.appendChild(hub);
    }

    // -------------------------------------------------------------------------
    // Floor gameplay
    // -------------------------------------------------------------------------

    let _floorState = null;
    let _timerInterval = null;

    function _initFloorState(floorData) {
        _floorState = {
            floorId: floorData.id,
            floorData: floorData,
            puzzles: _selectVariants(floorData.puzzles),
            puzzleIndex: 0,
            collectedDigits: [],
            score: floorData.baseXP || 250,
            hintsUsed: 0,
            wrongAnswers: 0,
            startTime: Date.now(),
            timeRemaining: floorData.parTime,
            parTime: floorData.parTime,
            timerWarnings: { half: false, quarter: false, tenth: false }
        };
    }

    function _selectVariants(puzzles) {
        return puzzles.map(p => {
            if (p.variants && p.variants.length > 0 && Math.random() < 0.3) {
                const variant = p.variants[Math.floor(Math.random() * p.variants.length)];
                return { ...p, ...variant, variants: undefined, isVariant: true };
            }
            return { ...p, isVariant: false };
        });
    }

    function _formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function _startTimer(timerEl) {
        if (_timerInterval) clearInterval(_timerInterval);

        _timerInterval = setInterval(() => {
            if (!_floorState) { clearInterval(_timerInterval); return; }

            _floorState.timeRemaining--;
            timerEl.textContent = _formatTime(Math.max(0, _floorState.timeRemaining));

            // Timer styling
            const pct = _floorState.timeRemaining / _floorState.parTime;
            timerEl.className = 'hv-timer';
            if (pct <= 0.10) timerEl.classList.add('critical');
            else if (pct <= 0.25) timerEl.classList.add('warning');

            // Red Queen warnings
            if (pct <= 0.50 && !_floorState.timerWarnings.half) {
                _floorState.timerWarnings.half = true;
                RedQueen.warn(_floorState.timeRemaining, _floorState.parTime);
            }
            if (pct <= 0.25 && !_floorState.timerWarnings.quarter) {
                _floorState.timerWarnings.quarter = true;
                RedQueen.warn(_floorState.timeRemaining, _floorState.parTime);
            }
            if (pct <= 0.10 && !_floorState.timerWarnings.tenth) {
                _floorState.timerWarnings.tenth = true;
                RedQueen.warn(_floorState.timeRemaining, _floorState.parTime);
            }

            // Time expired
            if (_floorState.timeRemaining <= 0) {
                clearInterval(_timerInterval);
                _timerInterval = null;
                RedQueen.warn(0, _floorState.parTime);
                setTimeout(() => _failFloor(), 2000);
            }
        }, 1000);
    }

    function _buildFloorUI(floorData) {
        document.body.innerHTML = '';

        // Apply depth tier class
        const tier = DEPTH_TIERS[floorData.depthTier] || DEPTH_TIERS.pristine;
        document.body.className = tier.bodyClass;

        _injectStyles(_getHubCSS());

        // Init Red Queen
        RedQueen.init(floorData.depthTier);

        const container = document.createElement('div');
        container.className = 'hv-floor-container';

        // Header
        const header = document.createElement('div');
        header.className = 'hv-floor-header';

        const titleArea = document.createElement('div');
        titleArea.innerHTML = `
            <div class="hv-floor-title-text">${floorData.floor} — ${floorData.title}</div>
            <div class="hv-floor-sub">PAR TIME: ${_formatTime(floorData.parTime)}</div>
        `;

        const timerEl = document.createElement('div');
        timerEl.className = 'hv-timer';
        timerEl.textContent = _formatTime(floorData.parTime);

        header.appendChild(titleArea);
        header.appendChild(timerEl);
        container.appendChild(header);

        // Progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'hv-progress-bar';
        const progressFill = document.createElement('div');
        progressFill.className = 'hv-progress-fill';
        progressFill.style.width = '0%';
        progressBar.appendChild(progressFill);
        container.appendChild(progressBar);

        // Puzzle container
        const puzzleContainer = document.createElement('div');
        puzzleContainer.className = 'hv-puzzle-container';
        container.appendChild(puzzleContainer);

        document.body.appendChild(container);

        // Store refs
        _floorState._timerEl = timerEl;
        _floorState._progressFill = progressFill;
        _floorState._puzzleContainer = puzzleContainer;
        _floorState._container = container;

        // Start timer
        _startTimer(timerEl);

        // Red Queen intro
        RedQueen.speak(floorData.intro, 5000);

        // Delay first puzzle to let intro show
        setTimeout(() => {
            _renderCurrentPuzzle();
        }, 1500);
    }

    function _renderCurrentPuzzle() {
        if (!_floorState) return;

        const idx = _floorState.puzzleIndex;
        const total = _floorState.puzzles.length;

        // Update progress bar
        _floorState._progressFill.style.width = `${(idx / total) * 100}%`;

        if (idx >= total) {
            // All puzzles done — show code entry
            _showCodeEntry();
            return;
        }

        const puzzle = _floorState.puzzles[idx];

        PuzzleRenderer.render(puzzle, _floorState._puzzleContainer, (isCorrect, codeDigit) => {
            if (isCorrect) {
                _floorState.collectedDigits.push(codeDigit);

                // Add next button after a short delay
                setTimeout(() => {
                    const nextBtn = document.createElement('button');
                    nextBtn.className = 'hv-next-btn';
                    nextBtn.textContent = idx < total - 1 ? '> NEXT PUZZLE' : '> ENTER CODE';
                    nextBtn.onclick = () => {
                        _floorState.puzzleIndex++;
                        _renderCurrentPuzzle();
                    };
                    _floorState._puzzleContainer.querySelector('.hv-puzzle').appendChild(nextBtn);
                }, 500);
            } else {
                _floorState.wrongAnswers++;
                _floorState.score = Math.max(0, _floorState.score - 20);

                // Allow retry after delay
                setTimeout(() => {
                    const retryBtn = document.createElement('button');
                    retryBtn.className = 'hv-next-btn';
                    retryBtn.textContent = '> TRY AGAIN';
                    retryBtn.onclick = () => {
                        _renderCurrentPuzzle();
                    };
                    _floorState._puzzleContainer.querySelector('.hv-puzzle').appendChild(retryBtn);
                }, 500);
            }
        });
    }

    function _showCodeEntry() {
        if (!_floorState) return;

        _floorState._progressFill.style.width = '100%';

        RedQueen.speak('All puzzles complete. Enter the exit code to unlock this floor.', 4000);

        const digits = _floorState.floorData.finalCode;

        setTimeout(() => {
            PuzzleRenderer.renderCodeEntry(digits, _floorState._puzzleContainer, (isCorrect) => {
                if (isCorrect) {
                    _completeFloor();
                } else {
                    // Wrong code — Red Queen taunts
                    RedQueen.speak('Incorrect code sequence. The facility does not forgive.', 3000);
                    _floorState.score = Math.max(0, _floorState.score - 30);

                    // Show error and allow retry
                    const errMsg = document.createElement('div');
                    errMsg.style.cssText = 'text-align: center; color: #cc0000; font-family: "Courier New", monospace; font-size: 0.85rem; margin-top: 12px;';
                    errMsg.textContent = 'Code rejected. Check your collected digits and try again.';
                    _floorState._puzzleContainer.appendChild(errMsg);

                    setTimeout(() => {
                        errMsg.remove();
                        _showCodeEntry();
                    }, 3000);
                }
            });
        }, 1000);
    }

    function _completeFloor() {
        if (!_floorState) return;

        // Stop timer
        if (_timerInterval) {
            clearInterval(_timerInterval);
            _timerInterval = null;
        }

        const elapsed = Math.floor((Date.now() - _floorState.startTime) / 1000);
        const floorId = _floorState.floorId;

        // Time bonus
        const timeRatio = Math.max(0, _floorState.timeRemaining / _floorState.parTime);
        const timeBonus = Math.floor(timeRatio * 100);
        const finalScore = _floorState.score + timeBonus;

        // Determine if perfect (no wrong answers, no hints)
        const perfect = _floorState.wrongAnswers === 0 && _floorState.hintsUsed === 0;

        // Save progress
        const existing = _progress.floors[floorId];
        const isFirstCompletion = !existing || !existing.completed;

        _progress.floors[floorId] = {
            completed: true,
            bestTime: existing && existing.bestTime ? Math.min(existing.bestTime, elapsed) : elapsed,
            bestScore: existing && existing.bestScore ? Math.max(existing.bestScore, finalScore) : finalScore,
            attempts: (existing && existing.attempts || 0) + 1,
            hintsUsed: _floorState.hintsUsed,
            perfect: perfect,
            firstCompleted: existing && existing.firstCompleted ? existing.firstCompleted : new Date().toISOString()
        };

        if (isFirstCompletion) {
            _progress.floorsCompleted = (_progress.floorsCompleted || 0) + 1;
        }

        _saveProgress();

        // Record to GameTracker if available
        if (window.GameTracker) {
            try {
                GameTracker.recordScore('hive-' + floorId, finalScore, {
                    time: elapsed,
                    hintsUsed: _floorState.hintsUsed,
                    wrongAnswers: _floorState.wrongAnswers,
                    perfect: perfect
                });
            } catch (e) { /* silent */ }
        }

        RedQueen.dismiss();

        // Show completion screen
        _floorState._container.innerHTML = '';
        const complete = document.createElement('div');
        complete.className = 'hv-complete';
        complete.innerHTML = `
            <div class="hv-complete-icon">${perfect ? '⭐' : '✓'}</div>
            <div class="hv-complete-title">FLOOR CLEARED</div>
            <div class="hv-complete-sub">${_floorState.floorData.floor} — ${_floorState.floorData.title}</div>
            <div class="hv-complete-stats">
                <div class="hv-complete-stat">
                    <div class="hv-complete-stat-val">${_formatTime(elapsed)}</div>
                    <div class="hv-complete-stat-label">Time</div>
                </div>
                <div class="hv-complete-stat">
                    <div class="hv-complete-stat-val">${finalScore}</div>
                    <div class="hv-complete-stat-label">Score</div>
                </div>
                <div class="hv-complete-stat">
                    <div class="hv-complete-stat-val">${_floorState.hintsUsed}</div>
                    <div class="hv-complete-stat-label">Hints Used</div>
                </div>
                <div class="hv-complete-stat">
                    <div class="hv-complete-stat-val">${_floorState.wrongAnswers}</div>
                    <div class="hv-complete-stat-label">Wrong Answers</div>
                </div>
            </div>
            ${perfect ? '<div style="color:#f39c12;font-size:0.85rem;margin-bottom:20px;letter-spacing:0.08em;">★ PERFECT CLEAR — No hints, no wrong answers ★</div>' : ''}
            <a href="index.html" class="hv-return-btn">← RETURN TO HUB</a>
        `;

        _floorState._container.appendChild(complete);
        _floorState = null;
    }

    function _failFloor() {
        if (!_floorState) return;

        if (_timerInterval) {
            clearInterval(_timerInterval);
            _timerInterval = null;
        }

        const floorId = _floorState.floorId;

        // Record attempt
        const existing = _progress.floors[floorId];
        _progress.floors[floorId] = {
            completed: existing ? existing.completed : false,
            bestTime: existing ? existing.bestTime : null,
            bestScore: existing ? existing.bestScore : null,
            attempts: (existing && existing.attempts || 0) + 1,
            hintsUsed: existing ? existing.hintsUsed : 0,
            perfect: existing ? existing.perfect : false,
            firstCompleted: existing ? existing.firstCompleted : null
        };
        _saveProgress();

        RedQueen.dismiss();

        // Show lockdown screen
        _floorState._container.innerHTML = '';
        const lockdown = document.createElement('div');
        lockdown.className = 'hv-lockdown';
        lockdown.innerHTML = `
            <div class="hv-lockdown-icon">🔒</div>
            <div class="hv-lockdown-title">LOCKDOWN</div>
            <div class="hv-lockdown-sub">Time expired. The facility has sealed this floor.</div>
            <button class="hv-retry-btn" onclick="window.location.reload()">RETRY</button>
            <a href="index.html" class="hv-return-btn" style="background:transparent;color:#cc0000;border:2px solid #cc0000;">← HUB</a>
        `;

        _floorState._container.appendChild(lockdown);
        _floorState = null;
    }

    // -------------------------------------------------------------------------
    // Floor data loading
    // -------------------------------------------------------------------------

    async function _loadFloorJSON(floorId) {
        const resp = await fetch(`floors/${floorId}.json`);
        if (!resp.ok) throw new Error(`Floor not found: ${floorId}`);
        return resp.json();
    }

    // -------------------------------------------------------------------------
    // Hint callback (used by PuzzleRenderer)
    // -------------------------------------------------------------------------

    function _onHintUsed(cost) {
        if (_floorState) {
            _floorState.hintsUsed++;
            _floorState.score = Math.max(0, _floorState.score - cost);
        }
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    function renderHub() {
        _loadProgress();
        _buildHub();
    }

    async function renderFloor(floorId) {
        _loadProgress();

        // Verify floor exists and is available
        const floorDef = FLOORS.find(f => f.id === floorId);
        if (!floorDef) {
            document.body.innerHTML = '<div style="text-align:center;padding:40px;font-family:monospace;color:#cc0000;">Floor not found.</div>';
            return;
        }

        const status = _getFloorStatus(floorDef);
        if (status === 'locked' || status === 'coming-soon') {
            document.body.innerHTML = '<div style="text-align:center;padding:40px;font-family:monospace;color:#cc0000;">This floor is locked.</div>';
            return;
        }

        try {
            const floorData = await _loadFloorJSON(floorId);
            _initFloorState(floorData);
            _buildFloorUI(floorData);
        } catch (e) {
            document.body.innerHTML = `<div style="text-align:center;padding:40px;font-family:monospace;color:#cc0000;">Error loading floor: ${e.message}</div>`;
        }
    }

    return {
        renderHub,
        renderFloor,
        _onHintUsed
    };

})();
