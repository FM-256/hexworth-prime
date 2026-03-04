/**
 * BlacksiteTerminal.js - CCTV Visual Wrapper for CLHTerminal
 * Hexworth Prime - Grep & Pipe Mastery
 *
 * This is a VISUAL LAYER that wraps around CLHTerminal.
 * CLHTerminal handles all command execution, filesystem, objectives.
 * BlacksiteTerminal adds: CCTV aesthetic, timer, fuse, audio, explosions.
 *
 * Usage:
 *   BlacksiteTerminal.init({
 *       container: '#blacksite-container',
 *       moduleId: 'GPM-001',
 *       timeLimit: 420,
 *       onComplete: () => {},
 *       onExplosion: () => {}
 *   });
 */

const BlacksiteTerminal = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const CONFIG = {
        themes: {
            'GPM-001': { name: 'grep', color: '#4ade80', camera: 'CAM-07', location: 'SERVER ROOM A' },
            'GPM-002': { name: 'regex', color: '#a78bfa', camera: 'CAM-12', location: 'COMMS CENTER' },
            'GPM-003': { name: 'pipes', color: '#60a5fa', camera: 'CAM-03', location: 'DATA NEXUS' },
            'GPM-BOSS': { name: 'boss', color: '#ef4444', camera: 'CAM-01', location: 'CONTROL ROOM' }
        },
        defaultTimeLimit: 300,
        warningTime: 60,
        criticalTime: 30
    };

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    let state = {
        initialized: false,
        moduleId: null,
        timeLimit: 300,
        timeRemaining: 300,
        timerRunning: false,
        timerInterval: null,
        audioEnabled: true,
        terminal: null  // CLHTerminal instance
    };

    let elements = {};
    let callbacks = {};
    let systems = { fuse: null, explosion: null, audio: null, cctv: null };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    function init(options) {
        console.log('[BlacksiteTerminal] Initializing...');

        const container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;

        if (!container) {
            console.error('[BlacksiteTerminal] Container not found');
            return false;
        }

        // Store options
        state.moduleId = options.moduleId || 'GPM-001';
        state.timeLimit = options.timeLimit || CONFIG.defaultTimeLimit;
        state.timeRemaining = state.timeLimit;
        callbacks.onComplete = options.onComplete || (() => {});
        callbacks.onExplosion = options.onExplosion || (() => {});
        callbacks.onAllComplete = options.onAllComplete || (() => {});

        // Build the UI
        buildUI(container);

        // Initialize audio
        initAudio();

        // Initialize particles
        initParticles();

        // Initialize CCTV system
        initCCTV();

        // Start timestamp clock
        startTimestamp();

        // Load the module
        loadModule(state.moduleId);

        state.initialized = true;
        console.log('[BlacksiteTerminal] Initialized');

        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // UI CONSTRUCTION
    // ═══════════════════════════════════════════════════════════════

    function buildUI(container) {
        const theme = CONFIG.themes[state.moduleId] || CONFIG.themes['GPM-001'];

        container.innerHTML = `
            <div class="blacksite-frame" data-section="${theme.name}">
                <!-- Scanline overlay -->
                <div class="blacksite-scanlines"></div>

                <!-- CCTV Header -->
                <div class="blacksite-header">
                    <div class="blacksite-header-left">
                        <span class="blacksite-rec"><span class="blacksite-rec-dot"></span> REC</span>
                        <span class="blacksite-cam-id">${theme.camera}</span>
                        <span class="blacksite-location">${theme.location}</span>
                    </div>
                    <div class="blacksite-timestamp">--</div>
                    <div class="blacksite-signal">
                        <div class="blacksite-signal-bars">
                            <span></span><span></span><span></span><span></span>
                        </div>
                        SIGNAL
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="blacksite-body">
                    <!-- Terminal Panel (uses CLHTerminal) -->
                    <div class="blacksite-terminal-panel">
                        <div class="blacksite-terminal-chrome">
                            <div class="blacksite-terminal-dots">
                                <span class="dot red"></span>
                                <span class="dot yellow"></span>
                                <span class="dot green"></span>
                            </div>
                            <span class="blacksite-terminal-title">BLACKSITE TERMINAL</span>
                            <div class="blacksite-terminal-controls">
                                <button class="blacksite-btn" data-action="hint">HINT</button>
                                <button class="blacksite-btn" data-action="clear">CLEAR</button>
                            </div>
                        </div>
                        <div class="blacksite-terminal-container">
                            <div id="blacksite-terminal-output" class="blacksite-terminal-output"></div>
                            <div class="blacksite-terminal-input-row">
                                <span id="blacksite-prompt" class="blacksite-prompt">$</span>
                                <input type="text" id="blacksite-terminal-input" class="blacksite-terminal-input" autocomplete="off" spellcheck="false">
                            </div>
                        </div>

                        <!-- Radio Feed (below terminal) -->
                        <div class="blacksite-radio-panel">
                            <div class="blacksite-radio-header">
                                <span class="blacksite-radio-icon"><img src="/assets/images/icons/icon-signal.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
                                <span class="blacksite-radio-title">ENCRYPTED RADIO - CH7</span>
                                <span class="blacksite-radio-status">● LIVE</span>
                            </div>
                            <div id="blacksite-radio-log" class="blacksite-radio-log"></div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <div class="blacksite-sidebar">
                        <!-- Timer -->
                        <div class="blacksite-panel">
                            <div class="blacksite-panel-header">COUNTDOWN</div>
                            <div class="blacksite-timer">
                                <div class="blacksite-timer-display">05:00</div>
                                <div class="blacksite-timer-bar-container">
                                    <div class="blacksite-timer-bar"></div>
                                </div>
                            </div>
                            <!-- Fuse visualization -->
                            <div class="blacksite-fuse-container"></div>
                        </div>

                        <!-- CCTV Surveillance System -->
                        <div class="blacksite-panel blacksite-cctv-panel">
                            <div class="blacksite-panel-header">SURVEILLANCE FEED</div>
                            <div id="blacksite-cctv-container" class="blacksite-cctv-mount"></div>
                        </div>

                        <!-- Objectives -->
                        <div class="blacksite-panel blacksite-objectives-panel">
                            <div class="blacksite-panel-header">OBJECTIVES</div>
                            <div class="blacksite-objectives-list"></div>
                            <div class="blacksite-objectives-progress">
                                <div class="blacksite-progress-bar-container">
                                    <div class="blacksite-progress-bar"></div>
                                </div>
                                <span class="blacksite-progress-text">0/0</span>
                            </div>
                        </div>

                        <!-- Audio Control -->
                        <div class="blacksite-panel blacksite-audio-panel">
                            <div class="blacksite-audio-bars">
                                <span></span><span></span><span></span><span></span><span></span>
                            </div>
                            <span>AUDIO</span>
                            <button class="blacksite-audio-toggle"><img src="/assets/images/icons/icon-signal.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></button>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="blacksite-footer">
                    <div class="blacksite-footer-controls">
                        <span>◀◀ REW</span>
                        <span><img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"><img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> FF</span>
                        <span>▌▌ PAUSE</span>
                    </div>
                    <div class="blacksite-footer-status">SECURE FEED</div>
                </div>
            </div>
        `;

        // Cache element references
        elements.frame = container.querySelector('.blacksite-frame');
        elements.timestamp = container.querySelector('.blacksite-timestamp');
        elements.camId = container.querySelector('.blacksite-cam-id');
        elements.location = container.querySelector('.blacksite-location');
        elements.timerDisplay = container.querySelector('.blacksite-timer-display');
        elements.timerBar = container.querySelector('.blacksite-timer-bar');
        elements.fuseContainer = container.querySelector('.blacksite-fuse-container');
        elements.cctvContainer = container.querySelector('#blacksite-cctv-container');
        elements.objectivesList = container.querySelector('.blacksite-objectives-list');
        elements.progressBar = container.querySelector('.blacksite-progress-bar');
        elements.progressText = container.querySelector('.blacksite-progress-text');
        elements.audioToggle = container.querySelector('.blacksite-audio-toggle');
        elements.terminalOutput = container.querySelector('#blacksite-terminal-output');
        elements.terminalInput = container.querySelector('#blacksite-terminal-input');
        elements.prompt = container.querySelector('#blacksite-prompt');
        elements.radioLog = container.querySelector('#blacksite-radio-log');

        // Bind events
        bindEvents();
    }

    function bindEvents() {
        // Audio toggle
        elements.audioToggle.addEventListener('click', toggleAudio);

        // Hint/Clear buttons
        elements.frame.querySelectorAll('.blacksite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'hint') showHint();
                if (action === 'clear') clearTerminal();
            });
        });

        // Click anywhere in terminal area to focus input
        elements.terminalOutput.parentElement.addEventListener('click', () => {
            elements.terminalInput.focus();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // MODULE LOADING
    // ═══════════════════════════════════════════════════════════════

    function loadModule(moduleId) {
        console.log(`[BlacksiteTerminal] Loading module: ${moduleId}`);

        state.moduleId = moduleId;

        // Update theme
        const theme = CONFIG.themes[moduleId] || CONFIG.themes['GPM-001'];
        elements.frame.setAttribute('data-section', theme.name);
        elements.camId.textContent = theme.camera;
        elements.location.textContent = theme.location;

        // Destroy existing terminal
        if (state.terminal) {
            state.terminal = null;
            elements.terminalOutput.innerHTML = '';
        }

        // Get module config for objectives display
        const moduleConfig = typeof CLHConfig !== 'undefined' ? CLHConfig.getModule(moduleId) : null;
        if (moduleConfig) {
            renderObjectives(moduleConfig.objectives || []);

            // Update prompt
            const user = moduleConfig.user || 'operator';
            const hostname = moduleConfig.hostname || 'blacksite';
            elements.prompt.textContent = `${user}@${hostname}:~$`;
        }

        // Initialize CLHTerminal
        if (typeof CLHTerminal !== 'undefined') {
            state.terminal = new CLHTerminal({
                moduleId: moduleId,
                container: '#blacksite-terminal-output',
                inputElement: '#blacksite-terminal-input',
                onObjectiveComplete: handleObjectiveComplete,
                onModuleComplete: handleModuleComplete,
                onCommand: handleCommand
            });
        } else {
            console.error('[BlacksiteTerminal] CLHTerminal not loaded!');
            elements.terminalOutput.innerHTML = '<div style="color: #ef4444; padding: 20px;">ERROR: CLHTerminal not loaded</div>';
        }

        // Reset timer
        resetTimer();
    }

    function renderObjectives(objectives) {
        elements.objectivesList.innerHTML = objectives.map((obj, i) => `
            <div class="blacksite-objective" data-id="${obj.id}">
                <span class="blacksite-objective-num">${i + 1}</span>
                <span class="blacksite-objective-text">${obj.task}</span>
            </div>
        `).join('');

        elements.progressText.textContent = `0/${objectives.length}`;
        elements.progressBar.style.width = '0%';
    }

    // ═══════════════════════════════════════════════════════════════
    // OBJECTIVE HANDLING
    // ═══════════════════════════════════════════════════════════════

    function handleObjectiveComplete(objectiveId, completedCount, totalCount) {
        console.log(`[BlacksiteTerminal] Objective complete: ${objectiveId} (${completedCount}/${totalCount})`);

        // Update UI
        const objEl = elements.objectivesList.querySelector(`[data-id="${objectiveId}"]`);
        if (objEl) {
            objEl.classList.add('complete');
            objEl.querySelector('.blacksite-objective-num').textContent = '✓';
        }

        // Update progress
        const percent = (completedCount / totalCount) * 100;
        elements.progressBar.style.width = `${percent}%`;
        elements.progressText.textContent = `${completedCount}/${totalCount}`;

        // Play sound
        if (systems.audio && state.audioEnabled) {
            systems.audio.success();
        }

        // Update CCTV story progression
        updateCCTVProgress(completedCount, totalCount);

        // Trigger CCTV alert on milestone objectives
        if (completedCount === 1) {
            triggerCCTVAlert('CONTROL: First objective complete. Good work, BLACKSITE.');
        } else if (completedCount === Math.floor(totalCount / 2)) {
            triggerCCTVAlert('PHOENIX: Halfway there! Keep the intel coming!');
        } else if (completedCount === totalCount - 1) {
            triggerCCTVAlert('CONTROL: One more objective! Almost there!');
        }
    }

    function handleModuleComplete() {
        console.log('[BlacksiteTerminal] All objectives complete!');

        stopTimer();

        // Stop tension sounds
        if (systems.audio) {
            systems.audio.stopAll();
            systems.audio.success();
        }

        // Check for insight phase (wire cutting question)
        const moduleConfig = typeof CLHConfig !== 'undefined' ? CLHConfig.getModule(state.moduleId) : null;
        if (moduleConfig && moduleConfig.insightPhase && moduleConfig.insightPhase.enabled) {
            setTimeout(() => showWireCuttingModal(moduleConfig.insightPhase), 500);
        } else {
            handleSectionSuccess();
        }
    }

    function handleCommand(command) {
        // Could add keypress sounds here
        if (systems.audio && state.audioEnabled) {
            // systems.audio.keypress();
        }
    }

    function handleSectionSuccess() {
        console.log('[BlacksiteTerminal] Section success!');

        // Visual feedback
        elements.frame.classList.add('success');

        // CCTV success events
        if (systems.cctv) {
            systems.cctv.setPhoenixProgress(4);
            systems.cctv.switchCamera('CAM-04', true); // Show ballroom - everyone safe
            systems.cctv.addRadioMessage('PHOENIX: DEVICE NEUTRALIZED! Summit is secure!', 'success');
            systems.cctv.addRadioMessage('CONTROL: Outstanding work, BLACKSITE. All 47 executives safe.', 'success');
        }

        if (callbacks.onComplete) {
            callbacks.onComplete(state.moduleId, {
                timeRemaining: state.timeRemaining,
                timeLimit: state.timeLimit
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // TIMER SYSTEM
    // ═══════════════════════════════════════════════════════════════

    function resetTimer(timeLimit) {
        stopTimer();
        state.timeLimit = timeLimit || state.timeLimit;
        state.timeRemaining = state.timeLimit;
        updateTimerDisplay();

        // Reset fuse
        if (systems.fuse) {
            systems.fuse.reset(state.timeLimit);
        }
    }

    function startTimer() {
        if (state.timerRunning) return;

        state.timerRunning = true;

        // Start fuse
        if (systems.fuse) {
            systems.fuse.start();
        }

        // Start audio
        if (systems.audio && state.audioEnabled) {
            systems.audio.startFuse();
            systems.audio.startTick(1000);
        }

        state.timerInterval = setInterval(() => {
            state.timeRemaining = Math.max(0, state.timeRemaining - 0.1);
            updateTimerDisplay();
            updateTension();

            if (state.timeRemaining <= 0) {
                handleExplosion();
            }
        }, 100);
    }

    function stopTimer() {
        state.timerRunning = false;

        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }

        if (systems.fuse) {
            systems.fuse.pause();
        }

        if (systems.audio) {
            systems.audio.stopFuse();
            systems.audio.stopTick();
            systems.audio.stopHeartbeat();
        }
    }

    function updateTimerDisplay() {
        const mins = Math.floor(state.timeRemaining / 60);
        const secs = Math.floor(state.timeRemaining % 60);
        elements.timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const percent = (state.timeRemaining / state.timeLimit) * 100;
        elements.timerBar.style.width = `${percent}%`;

        // Update warning/critical states
        elements.timerDisplay.classList.remove('warning', 'critical');
        elements.timerBar.classList.remove('warning', 'critical');

        if (state.timeRemaining <= CONFIG.criticalTime) {
            elements.timerDisplay.classList.add('critical');
            elements.timerBar.classList.add('critical');
        } else if (state.timeRemaining <= CONFIG.warningTime) {
            elements.timerDisplay.classList.add('warning');
            elements.timerBar.classList.add('warning');
        }
    }

    function updateTension() {
        if (!systems.audio || !state.audioEnabled) return;

        const tensionLevel = 1 - (state.timeRemaining / state.timeLimit);
        systems.audio.setTension(tensionLevel);

        // Start heartbeat when critical
        if (state.timeRemaining <= CONFIG.criticalTime) {
            systems.audio.startHeartbeat();

            // Trigger CCTV critical events
            if (systems.cctv && state.timeRemaining === CONFIG.criticalTime) {
                systems.cctv.triggerGlitch();
                systems.cctv.addRadioMessage('PHOENIX: Time is critical! I need that code NOW!', 'urgent');
            }
        }

        // Warning threshold - signal degradation
        if (state.timeRemaining <= CONFIG.warningTime && state.timeRemaining > CONFIG.criticalTime) {
            if (systems.cctv && Math.random() < 0.05) {
                systems.cctv.triggerGlitch();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // EXPLOSION
    // ═══════════════════════════════════════════════════════════════

    function handleExplosion() {
        console.log('[BlacksiteTerminal] BOOM!');

        stopTimer();

        // CCTV signal loss effect
        if (systems.cctv) {
            systems.cctv.triggerSignalLoss();
            systems.cctv.addRadioMessage('CONTROL: We lost the feed! PHOENIX, respond!', 'urgent');
            systems.cctv.addRadioMessage('...', 'urgent');
            systems.cctv.addRadioMessage('CONTROL: PHOENIX is down. Mission failed.', 'urgent');
        }

        // Audio
        if (systems.audio) {
            systems.audio.stopAll();
            systems.audio.explosion();
        }

        // Visual explosion
        if (systems.explosion) {
            systems.explosion.trigger(
                { timeRemaining: '00:00' },
                () => restartSection()
            );
        }

        if (callbacks.onExplosion) {
            callbacks.onExplosion(state.moduleId);
        }
    }

    function restartSection() {
        if (systems.explosion) {
            systems.explosion.hide();
        }

        // Reload the module
        loadModule(state.moduleId);
        startTimer();
    }

    // ═══════════════════════════════════════════════════════════════
    // WIRE CUTTING MODAL
    // ═══════════════════════════════════════════════════════════════

    function showWireCuttingModal(insightConfig) {
        const modal = document.createElement('div');
        modal.className = 'blacksite-wire-modal';
        modal.innerHTML = `
            <div class="blacksite-wire-content">
                <div class="blacksite-wire-title"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> CRITICAL DECISION <img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                <div class="blacksite-wire-question">${insightConfig.question}</div>
                <div class="blacksite-wire-options">
                    ${(insightConfig.options || []).map((opt, i) => `
                        <button class="blacksite-wire-option" data-correct="${opt.correct || false}">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        modal.querySelectorAll('.blacksite-wire-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const isCorrect = btn.dataset.correct === 'true';

                if (isCorrect) {
                    btn.classList.add('correct');
                    if (systems.audio && state.audioEnabled) {
                        systems.audio.wireCut();
                    }
                    setTimeout(() => {
                        modal.remove();
                        handleSectionSuccess();
                    }, 1000);
                } else {
                    btn.classList.add('incorrect');
                    if (systems.audio && state.audioEnabled) {
                        systems.audio.buzzer();
                    }
                    setTimeout(() => {
                        modal.remove();
                        handleExplosion();
                    }, 500);
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // AUDIO SYSTEM
    // ═══════════════════════════════════════════════════════════════

    function initAudio() {
        if (typeof BlacksiteAudio !== 'undefined') {
            BlacksiteAudio.init();
            systems.audio = BlacksiteAudio;
        }
    }

    function toggleAudio() {
        if (!systems.audio) return;

        const muted = systems.audio.toggleMute();
        state.audioEnabled = !muted;
        elements.audioToggle.innerHTML = muted ? '<img src="/assets/images/icons/icon-signal.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' : '<img src="/assets/images/icons/icon-signal.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">';
    }

    // ═══════════════════════════════════════════════════════════════
    // PARTICLE SYSTEM
    // ═══════════════════════════════════════════════════════════════

    function initParticles() {
        if (typeof BlacksiteParticles === 'undefined') return;

        // Fuse
        systems.fuse = BlacksiteParticles.createFuse({
            container: elements.fuseContainer,
            time: state.timeLimit,
            onComplete: handleExplosion
        });

        // Explosion
        systems.explosion = BlacksiteParticles.createExplosion();
    }

    // ═══════════════════════════════════════════════════════════════
    // CCTV SYSTEM
    // ═══════════════════════════════════════════════════════════════

    function initCCTV() {
        if (typeof BlacksiteCCTV === 'undefined') {
            console.warn('[BlacksiteTerminal] BlacksiteCCTV not loaded');
            return;
        }

        if (!elements.cctvContainer) {
            console.warn('[BlacksiteTerminal] CCTV container not found');
            return;
        }

        BlacksiteCCTV.init({
            container: elements.cctvContainer,
            externalRadio: true, // Use external radio panel
            onRadioMessage: addRadioMessage // Forward messages to our panel
        });

        systems.cctv = BlacksiteCCTV;

        // Start radio ambient sound (background hum + static)
        if (systems.audio && state.audioEnabled) {
            systems.audio.startRadioAmbient();
        }

        // Start with idle radio chatter
        BlacksiteCCTV.startRadioChatter('idle');

        console.log('[BlacksiteTerminal] CCTV system initialized');
    }

    // ═══════════════════════════════════════════════════════════════
    // RADIO FEED
    // ═══════════════════════════════════════════════════════════════

    function addRadioMessage(message, type = 'normal') {
        if (!elements.radioLog) return;

        // Play radio sounds
        if (systems.audio && state.audioEnabled) {
            systems.audio.radioMessage(type);

            // Play roger beep after a delay (simulates end of transmission)
            setTimeout(() => {
                if (systems.audio && state.audioEnabled) {
                    systems.audio.roger();
                }
            }, 800 + Math.random() * 400);
        }

        const now = new Date();
        const time = now.toTimeString().slice(0, 8);

        const msgEl = document.createElement('div');
        msgEl.className = `blacksite-radio-msg ${type}`;
        msgEl.innerHTML = `<span class="blacksite-radio-time">${time}</span> ${message}`;

        elements.radioLog.appendChild(msgEl);
        elements.radioLog.scrollTop = elements.radioLog.scrollHeight;

        // Limit messages to prevent overflow
        while (elements.radioLog.children.length > 15) {
            elements.radioLog.removeChild(elements.radioLog.firstChild);
        }

        // Flash effect for urgent messages
        if (type === 'urgent') {
            msgEl.classList.add('flash');
        }
    }

    function startRadioChatter(phase) {
        if (systems.cctv) {
            systems.cctv.startRadioChatter(phase);
        }
    }

    function updateCCTVProgress(completedCount, totalCount) {
        if (!systems.cctv) return;

        const progress = completedCount / totalCount;

        // Update PHOENIX progress based on completion
        if (progress >= 0.25 && progress < 0.5) {
            systems.cctv.setPhoenixProgress(1); // Approaching
        } else if (progress >= 0.5 && progress < 0.75) {
            systems.cctv.setPhoenixProgress(2); // At device
        } else if (progress >= 0.75 && progress < 1) {
            systems.cctv.setPhoenixProgress(3); // Critical
        } else if (progress >= 1) {
            systems.cctv.setPhoenixProgress(4); // Success
        }
    }

    function triggerCCTVAlert(message) {
        if (!systems.cctv) return;
        systems.cctv.triggerMotionAlert();
        systems.cctv.addRadioMessage(message, 'urgent');
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    function startTimestamp() {
        const update = () => {
            const now = new Date();
            elements.timestamp.textContent = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
        };
        update();
        setInterval(update, 1000);
    }

    function showHint() {
        if (state.terminal && typeof state.terminal.getCurrentObjective === 'function') {
            const obj = state.terminal.getCurrentObjective();
            if (obj && obj.hint) {
                state.terminal.print(`<span style="color: #fbbf24;"><img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> HINT: ${obj.hint}</span>`);
            }
        }
    }

    function clearTerminal() {
        if (elements.terminalOutput) {
            elements.terminalOutput.innerHTML = '';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        init,
        loadSection: loadModule,
        startTimer,
        stopTimer,
        resetTimer,
        restartSection,
        toggleAudio,

        getState: () => ({ ...state }),
        isInitialized: () => state.initialized
    };

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlacksiteTerminal;
}
