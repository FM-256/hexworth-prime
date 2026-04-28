/* ============================================================
   CIS2208 — DominoEngine.js
   Cascading Impact Simulator + War Room Decision Engine

   Powers all 16 labs in "The Domino Effect" course.
   Each lab is a scenario config fed into this engine.

   Architecture:
   - Config-driven: scenario JSON defines timesteps, decisions, cascades
   - State machine: BRIEFING → PREDICT → TIMESTEP → CASCADE → DEBRIEF
   - Timer-gated decisions: real time pressure on each timestep
   - Prediction challenges: students predict before seeing results
   - SVG cascade visualization: animated domino chains
   - Post-scenario comparison: prediction vs actual = learning moment

   Integration:
   - ModuleProgress.complete() on passing score
   - AccessGuard.require('sorted') in host HTML
   - FirebaseAuth for tenant sync
   - AchievementManager for course-level badges

   No external dependencies. No build step. Pure client-side JS.
   ============================================================ */

const DominoEngine = {

    /* ── State ── */
    scenario: null,
    state: null,
    _container: null,
    _timer: null,
    _timerInterval: null,
    _phase: 'idle',        // idle | briefing | predict | timestep | cascade | debrief
    _currentStep: 0,
    _predictions: {},
    _decisions: [],
    _score: { prediction: 0, decisions: 0, total: 0, max: 0 },
    _cascadeData: [],
    _moduleId: null,

    /* ── 6 Impact Dimensions ── */
    DIMENSIONS: ['technical', 'financial', 'regulatory', 'reputational', 'political', 'legislative'],

    DIMENSION_META: {
        technical:    { label: 'Technical',    color: '#00ffff', icon: 'icon-terminal.webp' },
        financial:    { label: 'Financial',    color: '#fbbf24', icon: 'icon-coins.webp' },
        regulatory:   { label: 'Regulatory',   color: '#ff00ff', icon: 'icon-clipboard.webp' },
        reputational: { label: 'Reputational', color: '#ef4444', icon: 'icon-eye.webp' },
        political:    { label: 'Political',    color: '#f97316', icon: 'icon-globe.webp' },
        legislative:  { label: 'Legislative',  color: '#a78bfa', icon: 'icon-scroll.webp' }
    },

    /* ── Phase Durations (seconds) ── */
    PHASE_TIMERS: {
        predict: 90,      // 90s to make predictions
        timestep: 45,     // 45s per decision point
        cascade: 0,       // no timer — animation plays
        debrief: 0        // no timer — review at leisure
    },


    /* ================================================================
       INIT — Called from host HTML with scenario config
       ================================================================ */

    init(config) {
        this.scenario = config.scenario;
        this._moduleId = config.moduleId;
        this._container = document.getElementById(config.containerId || 'domino-root');

        if (!this._container) {
            console.error('[DOMINO] Container not found:', config.containerId);
            return;
        }

        // Initialize state
        this.state = {
            started: false,
            completed: false,
            currentStep: 0,
            predictions: {},
            decisions: [],
            flags: {},
            cascadeResults: [],
            score: { prediction: 0, decisions: 0, total: 0, max: 0 }
        };

        // Try to restore saved state
        this._loadState();

        if (this.state.completed) {
            this._renderDebrief();
        } else {
            this._renderBriefing();
        }
    },


    /* ================================================================
       PHASE 1: BRIEFING — Scenario Introduction
       ================================================================ */

    _renderBriefing() {
        this._phase = 'briefing';
        const s = this.scenario;

        this._container.innerHTML = `
            <div class="de-briefing">
                <div class="de-header">
                    <div class="de-phase-badge">INCOMING INCIDENT</div>
                    <h2 class="de-title">${s.title}</h2>
                    <div class="de-subtitle">${s.subtitle}</div>
                </div>

                <div class="de-scenario-card">
                    <div class="de-scenario-label">SITUATION REPORT</div>
                    <div class="de-scenario-text">${s.briefing}</div>
                </div>

                <div class="de-intel-grid">
                    ${s.intelCards.map(card => `
                        <div class="de-intel-card" style="border-left-color: ${this.DIMENSION_META[card.dimension]?.color || '#ff00ff'}">
                            <div class="de-intel-label">${card.label}</div>
                            <div class="de-intel-value">${card.value}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="de-dimensions-preview">
                    <div class="de-preview-label">IMPACT DIMENSIONS IN PLAY</div>
                    <div class="de-dimension-chips">
                        ${s.activeDimensions.map(d => `
                            <span class="de-chip" style="border-color: ${this.DIMENSION_META[d].color}; color: ${this.DIMENSION_META[d].color}">
                                ${this.DIMENSION_META[d].label}
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="de-step-count">
                    ${s.timesteps.length} decision points ahead — ${s.timesteps.reduce((a, t) => a + (t.decisions?.length || 0), 0)} total decisions
                </div>

                <button class="de-btn de-btn-primary" onclick="DominoEngine._startPrediction()">
                    Begin Analysis
                </button>
            </div>
        `;
    },


    /* ================================================================
       PHASE 2: PREDICT — Student predicts cascade before it plays
       ================================================================ */

    _startPrediction() {
        this._phase = 'predict';
        const s = this.scenario;

        this._container.innerHTML = `
            <div class="de-predict">
                <div class="de-header">
                    <div class="de-phase-badge">PREDICTION PHASE</div>
                    <h2 class="de-title">Predict the Impact</h2>
                    <div class="de-subtitle">Before the incident unfolds, predict which dimensions will be hit hardest. Your accuracy is scored.</div>
                    <div class="de-timer" id="de-timer"></div>
                </div>

                <div class="de-predict-grid">
                    ${s.activeDimensions.map(d => `
                        <div class="de-predict-card" data-dim="${d}">
                            <div class="de-predict-dim" style="color: ${this.DIMENSION_META[d].color}">
                                ${this.DIMENSION_META[d].label}
                            </div>
                            <label class="de-predict-label">Severity (1-5)</label>
                            <div class="de-predict-buttons" id="de-sev-${d}">
                                ${[1,2,3,4,5].map(n => `
                                    <button class="de-sev-btn" onclick="DominoEngine._setSeverity('${d}', ${n})" data-val="${n}">${n}</button>
                                `).join('')}
                            </div>
                            <label class="de-predict-label">When does impact peak?</label>
                            <select class="de-predict-select" id="de-timing-${d}" onchange="DominoEngine._checkPredictReady()">
                                <option value="">-- select --</option>
                                <option value="immediate">Immediate (hours)</option>
                                <option value="short">Short-term (days)</option>
                                <option value="medium">Medium-term (weeks)</option>
                                <option value="long">Long-term (months+)</option>
                            </select>
                        </div>
                    `).join('')}
                </div>

                <button class="de-btn de-btn-primary" id="de-predict-submit" onclick="DominoEngine._submitPredictions()" disabled>
                    Lock In Predictions
                </button>
            </div>
        `;

        this._startTimer('predict', this.PHASE_TIMERS.predict, () => this._submitPredictions());
    },

    _setSeverity(dim, val) {
        this._predictions[dim] = this._predictions[dim] || {};
        this._predictions[dim].severity = val;

        // Highlight selected button
        const btns = document.querySelectorAll(`#de-sev-${dim} .de-sev-btn`);
        btns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.val) === val));

        this._checkPredictReady();
    },

    _checkPredictReady() {
        const dims = this.scenario.activeDimensions;
        const allSev = dims.every(d => this._predictions[d]?.severity);
        const allTiming = dims.every(d => {
            const sel = document.getElementById(`de-timing-${d}`);
            if (sel && sel.value) {
                this._predictions[d] = this._predictions[d] || {};
                this._predictions[d].timing = sel.value;
                return true;
            }
            return false;
        });

        const btn = document.getElementById('de-predict-submit');
        if (btn) btn.disabled = !(allSev && allTiming);
    },

    _submitPredictions() {
        // Capture any timing values not yet captured
        this.scenario.activeDimensions.forEach(d => {
            const sel = document.getElementById(`de-timing-${d}`);
            if (sel && sel.value) {
                this._predictions[d] = this._predictions[d] || {};
                this._predictions[d].timing = sel.value;
            }
        });

        this._clearTimer();
        this.state.predictions = { ...this._predictions };
        this._saveState();
        this._startTimesteps();
    },


    /* ================================================================
       PHASE 3: TIMESTEPS — War Room Decisions Under Pressure
       ================================================================ */

    _startTimesteps() {
        this._currentStep = 0;
        this._renderTimestep();
    },

    /* ── Adaptive Branching: resolve variants and filter decisions ── */

    _checkCondition(condition) {
        if (!condition) return true;
        const flags = this.state.flags || {};
        return Object.keys(condition).every(key => flags[key] === condition[key]);
    },

    _resolveTimestep(step) {
        // Start with base step properties
        let situation = step.situation;
        let evidence = step.evidence || [];
        let contradicts = step.contradicts || false;

        // Apply first matching variant override (if any)
        if (step.variants && step.variants.length) {
            for (const v of step.variants) {
                if (this._checkCondition(v.condition)) {
                    if (v.situation) situation = v.situation;
                    if (v.evidence) evidence = v.evidence;
                    if (v.contradicts !== undefined) contradicts = v.contradicts;
                    break; // first match wins
                }
            }
        }

        // Filter decisions by requires/excludes flags
        const visibleDecisions = [];
        step.decisions.forEach((d, rawIdx) => {
            if (d.requires && !this._checkCondition(d.requires)) return;
            if (d.excludes && this._checkCondition(d.excludes)) return;
            visibleDecisions.push({ ...d, _rawIdx: rawIdx });
        });

        // Safety: if all decisions filtered out, include all unconditional ones
        if (visibleDecisions.length === 0) {
            step.decisions.forEach((d, rawIdx) => {
                if (!d.requires && !d.excludes) {
                    visibleDecisions.push({ ...d, _rawIdx: rawIdx });
                }
            });
        }

        // Final safety: if still empty, include everything
        if (visibleDecisions.length === 0) {
            step.decisions.forEach((d, rawIdx) => {
                visibleDecisions.push({ ...d, _rawIdx: rawIdx });
            });
        }

        return { situation, evidence, contradicts, decisions: visibleDecisions, timeLabel: step.timeLabel };
    },

    _renderTimestep() {
        this._phase = 'timestep';
        const rawStep = this.scenario.timesteps[this._currentStep];

        if (!rawStep) {
            this._startCascade();
            return;
        }

        // Resolve adaptive branching
        const step = this._resolveTimestep(rawStep);
        this._resolvedStep = step; // cache for _makeDecision

        const stepNum = this._currentStep + 1;
        const totalSteps = this.scenario.timesteps.length;

        this._container.innerHTML = `
            <div class="de-timestep">
                <div class="de-header">
                    <div class="de-phase-badge">DECISION POINT ${stepNum} of ${totalSteps}</div>
                    <div class="de-timer" id="de-timer"></div>
                    <div class="de-clock-label">${step.timeLabel}</div>
                </div>

                <div class="de-situation-card">
                    <div class="de-situation-label">NEW INFORMATION</div>
                    <div class="de-situation-text">${step.situation}</div>
                    ${step.contradicts ? `<div class="de-contradiction">This contradicts earlier information.</div>` : ''}
                </div>

                ${step.evidence.length ? `
                    <div class="de-evidence-strip">
                        ${step.evidence.map(e => `
                            <div class="de-evidence-chip ${e.reliability}">${e.text}</div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="de-decisions">
                    <div class="de-decisions-label">YOUR DECISION</div>
                    ${step.decisions.map((d, renderIdx) => `
                        <button class="de-decision-btn" onclick="DominoEngine._makeDecision(${this._currentStep}, ${d._rawIdx})">
                            <div class="de-decision-letter">${String.fromCharCode(65 + renderIdx)}</div>
                            <div class="de-decision-text">${d.text}</div>
                        </button>
                    `).join('')}
                </div>

                <div class="de-step-progress">
                    ${Array.from({length: totalSteps}, (_, i) => `
                        <div class="de-step-dot ${i < stepNum ? 'completed' : ''} ${i === this._currentStep ? 'current' : ''}"></div>
                    `).join('')}
                </div>
            </div>
        `;

        // Timer: find a valid timeout default from visible decisions
        const timeoutRawIdx = this._findTimeoutDefault(rawStep, step.decisions);
        const timerSec = rawStep.timerSeconds || this.PHASE_TIMERS.timestep;
        if (timerSec > 0) {
            this._startTimer('timestep', timerSec, () => {
                this._makeDecision(this._currentStep, timeoutRawIdx);
            });
        }
    },

    _findTimeoutDefault(rawStep, visibleDecisions) {
        // Prefer the configured default if it's visible
        const configDefault = rawStep.timeoutDefault || 0;
        if (visibleDecisions.some(d => d._rawIdx === configDefault)) return configDefault;
        // Fall back to the lowest-scoring visible decision
        let worst = visibleDecisions[0];
        visibleDecisions.forEach(d => { if (d.score < worst.score) worst = d; });
        return worst._rawIdx;
    },

    _makeDecision(stepIdx, rawChoiceIdx) {
        this._clearTimer();
        const step = this.scenario.timesteps[stepIdx];
        const choice = step.decisions[rawChoiceIdx];

        // Merge decision flags into state
        if (choice.flags) {
            this.state.flags = this.state.flags || {};
            Object.assign(this.state.flags, choice.flags);
        }

        this._decisions.push({
            step: stepIdx,
            choice: rawChoiceIdx,
            text: choice.text,
            score: choice.score || 0,
            consequence: choice.consequence,
            optimal: choice.optimal || false
        });

        this.state.decisions = [...this._decisions];

        // Show brief consequence feedback using resolved visible decisions
        const resolved = this._resolvedStep;
        const btns = document.querySelectorAll('.de-decision-btn');
        btns.forEach((btn, renderIdx) => {
            const visD = resolved ? resolved.decisions[renderIdx] : null;
            const visRawIdx = visD ? visD._rawIdx : renderIdx;
            btn.classList.add('disabled');
            if (visRawIdx === rawChoiceIdx) btn.classList.add(choice.optimal ? 'chosen-good' : 'chosen');
            if (step.decisions[visRawIdx] && step.decisions[visRawIdx].optimal && visRawIdx !== rawChoiceIdx) btn.classList.add('was-optimal');
        });

        const decisionsEl = document.querySelector('.de-decisions');
        if (decisionsEl) {
            const consequenceEl = document.createElement('div');
            consequenceEl.className = 'de-consequence-flash';
            consequenceEl.innerHTML = `<div class="de-consequence-text">${choice.consequence}</div>`;
            decisionsEl.appendChild(consequenceEl);
        }

        this._saveState();

        // Advance after showing consequence
        setTimeout(() => {
            this._currentStep++;
            this._renderTimestep();
        }, 2500);
    },


    /* ================================================================
       PHASE 4: CASCADE — Animated Domino Chain Visualization
       ================================================================ */

    _startCascade() {
        this._phase = 'cascade';
        const s = this.scenario;

        // Compute cascade results based on decisions made
        this._cascadeData = this._computeCascade();

        this._container.innerHTML = `
            <div class="de-cascade">
                <div class="de-header">
                    <div class="de-phase-badge">IMPACT CASCADE</div>
                    <h2 class="de-title">The Dominoes Fall</h2>
                    <div class="de-subtitle">Watch how your decisions shaped the outcome across all dimensions.</div>
                </div>

                <div class="de-cascade-visual" id="de-cascade-svg"></div>

                <div class="de-cascade-details" id="de-cascade-details"></div>

                <button class="de-btn de-btn-primary" id="de-cascade-next" style="display:none" onclick="DominoEngine._startDebrief()">
                    View Analysis
                </button>
            </div>
        `;

        this._animateCascade();
    },

    _computeCascade() {
        const s = this.scenario;
        const results = [];

        s.activeDimensions.forEach(dim => {
            const base = s.cascadeBaseline[dim] || {};
            let severity = base.severity || 3;
            let description = base.description || '';
            let mitigated = false;

            // Apply decision modifiers
            this._decisions.forEach(d => {
                const step = s.timesteps[d.step];
                const choice = step.decisions[d.choice];
                if (choice.modifiers && choice.modifiers[dim]) {
                    severity += choice.modifiers[dim].severityDelta || 0;
                    if (choice.modifiers[dim].description) {
                        description = choice.modifiers[dim].description;
                    }
                    if (choice.modifiers[dim].mitigated) mitigated = true;
                }
            });

            severity = Math.max(1, Math.min(5, severity));

            results.push({
                dimension: dim,
                severity,
                description,
                mitigated,
                timing: base.timing || 'medium',
                metric: base.metric || ''
            });
        });

        return results;
    },

    _animateCascade() {
        const container = document.getElementById('de-cascade-svg');
        const details = document.getElementById('de-cascade-details');
        if (!container) return;

        const dims = this._cascadeData;
        const w = 900, h = 80 + dims.length * 70;

        // Build SVG
        let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg">`;

        // Incident trigger at top
        svg += `<rect x="380" y="10" width="140" height="36" rx="8" fill="rgba(255,0,255,0.15)" stroke="#ff00ff" stroke-width="1.5"/>`;
        svg += `<text x="450" y="33" text-anchor="middle" fill="#ff00ff" font-family="Courier New" font-size="11" font-weight="700">INCIDENT</text>`;

        dims.forEach((d, i) => {
            const y = 70 + i * 70;
            const meta = this.DIMENSION_META[d.dimension];
            const barWidth = (d.severity / 5) * 500;

            // Connection line from above
            svg += `<line x1="450" y1="${y - 24}" x2="450" y2="${y}" stroke="${meta.color}" stroke-width="1" stroke-dasharray="4,3" opacity="0" class="de-cascade-line" style="animation: deFadeIn 0.4s ease forwards ${0.3 + i * 0.4}s"/>`;

            // Dimension label
            svg += `<text x="20" y="${y + 20}" fill="${meta.color}" font-family="Courier New" font-size="10" font-weight="700" opacity="0" style="animation: deFadeIn 0.4s ease forwards ${0.5 + i * 0.4}s">${meta.label.toUpperCase()}</text>`;

            // Severity bar — JS-animated for cross-browser SVG compat
            svg += `<rect x="140" y="${y + 6}" width="0" height="20" rx="4" fill="${meta.color}" opacity="0.25" class="de-sev-bar" data-target-width="${barWidth}" data-delay="${0.6 + i * 0.4}"/>`;

            // Severity number
            svg += `<text x="${145 + barWidth + 10}" y="${y + 21}" fill="${meta.color}" font-family="Courier New" font-size="12" font-weight="700" opacity="0" style="animation: deFadeIn 0.3s ease forwards ${0.9 + i * 0.4}s">${d.severity}/5</text>`;

            // Mitigated badge
            if (d.mitigated) {
                svg += `<text x="850" y="${y + 21}" fill="#00ff9d" font-family="Courier New" font-size="9" opacity="0" style="animation: deFadeIn 0.3s ease forwards ${1.0 + i * 0.4}s">MITIGATED</text>`;
            }
        });

        svg += `</svg>`;
        container.innerHTML = svg;

        // JS-driven bar width animation (cross-browser safe for SVG rect)
        container.querySelectorAll('.de-sev-bar').forEach(bar => {
            const targetW = parseFloat(bar.dataset.targetWidth) || 0;
            const delay = parseFloat(bar.dataset.delay) || 0;
            setTimeout(() => {
                const start = performance.now();
                const duration = 600;
                const animate = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    bar.setAttribute('width', targetW * eased);
                    if (progress < 1) requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            }, delay * 1000);
        });

        // Build detail cards with staggered reveal
        let detailHtml = '';
        dims.forEach((d, i) => {
            const meta = this.DIMENSION_META[d.dimension];
            detailHtml += `
                <div class="de-cascade-card" style="border-left-color: ${meta.color}; animation: deFadeIn 0.4s ease forwards ${1.2 + i * 0.4}s; opacity: 0">
                    <div class="de-cascade-card-label" style="color: ${meta.color}">${meta.label} Impact — Severity ${d.severity}/5</div>
                    <div class="de-cascade-card-desc">${d.description}</div>
                    ${d.metric ? `<div class="de-cascade-card-metric">${d.metric}</div>` : ''}
                </div>
            `;
        });
        details.innerHTML = detailHtml;

        // Show next button after animation completes
        const totalTime = (1.5 + dims.length * 0.4) * 1000;
        setTimeout(() => {
            const btn = document.getElementById('de-cascade-next');
            if (btn) btn.style.display = '';
        }, totalTime);
    },


    /* ================================================================
       PHASE 5: DEBRIEF — Prediction vs Reality + Score
       ================================================================ */

    _startDebrief() {
        this._phase = 'debrief';
        this._computeScore();
        this.state.completed = true;
        this.state.score = { ...this._score };
        this.state.cascadeResults = [...this._cascadeData];
        this._saveState();

        this._renderDebrief();
    },

    _renderDebrief() {
        const s = this.scenario;
        const score = this.state.score || this._score;
        const pct = score.max > 0 ? Math.round((score.total / score.max) * 100) : 0;
        const passed = pct >= 60;

        this._container.innerHTML = `
            <div class="de-debrief">
                <div class="de-header">
                    <div class="de-phase-badge">AFTER-ACTION REPORT</div>
                    <h2 class="de-title">${s.title} — Debrief</h2>
                </div>

                <div class="de-score-panel ${passed ? 'pass' : 'fail'}">
                    <div class="de-score-big">${score.total} / ${score.max}</div>
                    <div class="de-score-pct">${pct}%</div>
                    <div class="de-score-label">${passed ? 'ANALYSIS COMPLETE' : 'BELOW THRESHOLD — Review and Retry'}</div>
                </div>

                <div class="de-debrief-sections">
                    <div class="de-debrief-section">
                        <div class="de-debrief-section-title">Prediction Accuracy</div>
                        <div class="de-debrief-section-score">${score.prediction} pts</div>
                        <div class="de-comparison-grid">
                            ${(this.state.cascadeResults || this._cascadeData).map(d => {
                                const pred = (this.state.predictions || this._predictions)[d.dimension] || {};
                                const meta = this.DIMENSION_META[d.dimension];
                                const sevDiff = Math.abs((pred.severity || 0) - d.severity);
                                const sevClass = sevDiff === 0 ? 'exact' : sevDiff <= 1 ? 'close' : 'off';
                                return `
                                    <div class="de-compare-row">
                                        <span class="de-compare-dim" style="color: ${meta.color}">${meta.label}</span>
                                        <span class="de-compare-pred">You: ${pred.severity || '?'}/5</span>
                                        <span class="de-compare-actual">Actual: ${d.severity}/5</span>
                                        <span class="de-compare-verdict ${sevClass}">${sevDiff === 0 ? 'Exact' : sevDiff <= 1 ? 'Close' : 'Off by ' + sevDiff}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="de-debrief-section">
                        <div class="de-debrief-section-title">Decision Quality</div>
                        <div class="de-debrief-section-score">${score.decisions} pts</div>
                        <div class="de-decision-review">
                            ${(this.state.decisions || this._decisions).map((d, i) => {
                                const step = s.timesteps[d.step];
                                return `
                                    <div class="de-decision-row ${d.optimal ? 'optimal' : 'suboptimal'}">
                                        <div class="de-decision-step">Step ${i + 1}: ${step.timeLabel}</div>
                                        <div class="de-decision-chose">You chose: ${d.text}</div>
                                        <div class="de-decision-result">${d.consequence}</div>
                                        ${!d.optimal && step.decisions.find(x => x.optimal) ? `
                                            <div class="de-decision-better">Better: ${step.decisions.find(x => x.optimal).text}</div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <div class="de-debrief-actions">
                    ${passed ? `
                        <button class="de-btn de-btn-success" onclick="DominoEngine._complete()">Mark Complete</button>
                    ` : `
                        <button class="de-btn de-btn-primary" onclick="DominoEngine._restart()">Retry Scenario</button>
                    `}
                    <a href="../index.html" class="de-btn de-btn-secondary">Back to Course</a>
                </div>
            </div>
        `;
    },


    /* ================================================================
       SCORING
       ================================================================ */

    _computeScore() {
        let predScore = 0;
        let predMax = 0;
        const dims = this.scenario.activeDimensions;

        // Prediction scoring: severity accuracy + timing accuracy
        dims.forEach(d => {
            const pred = this._predictions[d] || {};
            const actual = this._cascadeData.find(c => c.dimension === d);
            if (!actual) return;

            predMax += 2; // 1 for severity, 1 for timing (predictions are supporting, not primary)

            // Severity: exact = 1, off by 1 = 0.5 (rounded at end)
            const sevDiff = Math.abs((pred.severity || 0) - actual.severity);
            if (sevDiff === 0) predScore += 1;
            else if (sevDiff === 1) predScore += 0.5;

            // Timing: exact = 1, adjacent = 0.5
            const timingOrder = ['immediate', 'short', 'medium', 'long'];
            const predIdx = timingOrder.indexOf(pred.timing);
            const actIdx = timingOrder.indexOf(actual.timing);
            const timeDiff = Math.abs(predIdx - actIdx);
            if (timeDiff === 0) predScore += 1;
            else if (timeDiff === 1) predScore += 0.5;
        });

        // Decision scoring: sum of choice scores
        let decScore = 0;
        let decMax = 0;
        this._decisions.forEach(d => {
            const step = this.scenario.timesteps[d.step];
            const maxForStep = Math.max(...step.decisions.map(x => x.score || 0));
            decMax += maxForStep;
            decScore += d.score;
        });

        predScore = Math.round(predScore);
        predMax = Math.round(predMax);

        this._score = {
            prediction: predScore,
            predictionMax: predMax,
            decisions: decScore,
            decisionsMax: decMax,
            total: predScore + decScore,
            max: predMax + decMax
        };
    },


    /* ================================================================
       TIMER
       ================================================================ */

    _startTimer(phase, seconds, onExpire) {
        this._clearTimer();
        this._timer = seconds;

        const el = document.getElementById('de-timer');
        if (!el) return;

        const update = () => {
            const m = Math.floor(this._timer / 60);
            const s = this._timer % 60;
            el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
            el.classList.toggle('warning', this._timer <= 15);
            el.classList.toggle('danger', this._timer <= 5);
        };

        update();
        this._timerInterval = setInterval(() => {
            this._timer--;
            if (this._timer <= 0) {
                this._clearTimer();
                if (onExpire) onExpire();
            } else {
                update();
            }
        }, 1000);
    },

    _clearTimer() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    },


    /* ================================================================
       STATE PERSISTENCE
       ================================================================ */

    _stateKey() {
        return 'domino_' + this._moduleId;
    },

    _scenarioHash() {
        // Hash timestep count + decision count + flag keys + variant count for version guard
        const s = this.scenario;
        const steps = s.timesteps ? s.timesteps.length : 0;
        const decs = s.timesteps ? s.timesteps.reduce((a, t) => a + (t.decisions ? t.decisions.length : 0), 0) : 0;
        const variants = s.timesteps ? s.timesteps.reduce((a, t) => a + (t.variants ? t.variants.length : 0), 0) : 0;
        // Collect all flag keys used across decisions
        const flagKeys = new Set();
        if (s.timesteps) s.timesteps.forEach(t => {
            if (t.decisions) t.decisions.forEach(d => {
                if (d.flags) Object.keys(d.flags).forEach(k => flagKeys.add(k));
                if (d.requires) Object.keys(d.requires).forEach(k => flagKeys.add(k));
                if (d.excludes) Object.keys(d.excludes).forEach(k => flagKeys.add(k));
            });
        });
        return steps + ':' + decs + ':' + s.activeDimensions.length + ':' + variants + ':' + flagKeys.size;
    },

    _saveState() {
        try {
            this.state._schemaHash = this._scenarioHash();
            localStorage.setItem(this._stateKey(), JSON.stringify(this.state));
        } catch (e) { /* quota exceeded — silent */ }
    },

    _loadState() {
        try {
            const raw = localStorage.getItem(this._stateKey());
            if (raw) {
                const saved = JSON.parse(raw);
                // Version guard: if scenario structure changed, discard stale state
                if (saved._schemaHash && saved._schemaHash !== this._scenarioHash()) {
                    localStorage.removeItem(this._stateKey());
                    return;
                }
                this.state = saved;
                this.state.flags = saved.flags || {};
                this._predictions = saved.predictions || {};
                this._decisions = saved.decisions || [];
                this._cascadeData = saved.cascadeResults || [];
                this._score = saved.score || this._score;
            }
        } catch (e) { /* corrupt state — start fresh */ }
    },


    /* ================================================================
       COMPLETION + RESTART
       ================================================================ */

    _complete() {
        if (typeof ModuleProgress !== 'undefined') {
            ModuleProgress.complete('divergent', this._moduleId, { returnUrl: '../index.html' });
        }
    },

    _restart() {
        localStorage.removeItem(this._stateKey());
        this._predictions = {};
        this._decisions = [];
        this._cascadeData = [];
        this._resolvedStep = null;
        this._score = { prediction: 0, decisions: 0, total: 0, max: 0 };
        this.state = {
            started: false, completed: false, currentStep: 0,
            predictions: {}, decisions: [], flags: {}, cascadeResults: [],
            score: { prediction: 0, decisions: 0, total: 0, max: 0 }
        };
        this._renderBriefing();
    }
};
