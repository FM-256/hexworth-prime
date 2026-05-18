/* ============================================================
   EDT — EDTEngine.js
   Ethical Decision Training Case Room Engine

   Config-driven, analogous to BoxEngine but for ethics labs.
   No terminals, no flags. Students investigate real ethical
   dilemmas through a 4-phase structured investigation:

     Phase 1 — Brief:       Read and absorb the situation
     Phase 2 — Evidence:    Tag artifacts as relevant/irrelevant/contested
     Phase 3 — Stakeholders + Decision:  Map who is affected, commit to a course of action
     Phase 4 — Framework Challenge:      Defend against an opposing analysis
     Phase 5 — Code Conflict:            Rank competing professional obligations

   State persists to localStorage. Submission goes to Firestore
   via the submitEDTLab Cloud Function. After submission, the
   student re-enters read-only Reflection Mode.

   Public API:
     EDTEngine.init(config)   — call once from the lab's index.html
   ============================================================ */

const EDTEngine = (function () {
    'use strict';

    // ── Constants ──────────────────────────────────────────
    const STORAGE_PREFIX = 'hexworth_edt_';
    const PHASES = [
        { id: 1, short: 'Brief',       label: 'Brief' },
        { id: 2, short: 'Evidence',    label: 'Evidence' },
        { id: 3, short: 'Decision',    label: 'Stakeholders + Decision' },
        { id: 4, short: 'Framework',   label: 'Framework' },
        { id: 5, short: 'Code',        label: 'Code Conflict' },
    ];

    // Minimum text lengths for free-response fields (characters)
    const MIN_EXPLANATION_LEN = 20;
    const MIN_FRAMEWORK_RESPONSE_LEN = 80;
    const MIN_CONFLICT_RESPONSE_LEN = 80;

    // ── Module state ───────────────────────────────────────
    let _config = null;
    let _state  = null;    // persisted to localStorage
    let _root   = null;    // #caseroom DOM node

    // ── localStorage helpers ───────────────────────────────

    function _storageKey() {
        return STORAGE_PREFIX + _config.id;
    }

    function _save() {
        try {
            localStorage.setItem(_storageKey(), JSON.stringify(_state));
        } catch (e) {
            console.warn('[EDT] localStorage save failed:', e.message);
        }
    }

    function _load() {
        try {
            const raw = localStorage.getItem(_storageKey());
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn('[EDT] localStorage load failed:', e.message);
        }
        return null;
    }

    function _defaultState() {
        return {
            phase: 1,
            submitted: false,
            // Phase 2: evidence tags — { [evidenceId]: { tag: 'relevant'|'irrelevant'|'contested', note: '' } }
            evidenceTags: {},
            // Phase 3: selected stakeholder IDs
            stakeholderSelections: [],
            // Phase 3: committed decision ID
            decisionId: null,
            decisionLocked: false,
            // Phase 4: free-response text after the framework challenge
            frameworkResponse: '',
            // Phase 5: ordered provision IDs (index 0 = rank 1 = highest obligation)
            codeRanking: [],
            codeConflictResponse: ''
        };
    }

    // ── Phase guard helpers ────────────────────────────────

    /**
     * Returns true if the student has met the requirements to advance
     * past the given phase. Used for nav button enable/disable and
     * validation before progression.
     */
    function _phaseComplete(phase) {
        switch (phase) {
            case 1:
                // Brief is always complete once read — just advance
                return true;

            case 2: {
                // All evidence must be tagged with at least a radio selection
                const required = (_config.evidence || []).length;
                const tagged   = Object.keys(_state.evidenceTags).length;
                if (tagged < required) return false;
                // At least minStakeholders... actually that is phase 3.
                // All explanations must meet minimum length if tag is not irrelevant
                for (const ev of (_config.evidence || [])) {
                    const tag = _state.evidenceTags[ev.id];
                    if (!tag) return false;
                    // If tagged relevant or contested, require an explanation
                    if ((tag.tag === 'relevant' || tag.tag === 'contested') &&
                        (!tag.note || tag.note.trim().length < MIN_EXPLANATION_LEN)) {
                        return false;
                    }
                }
                return true;
            }

            case 3:
                // Min stakeholders selected AND a decision locked
                if (!_state.decisionLocked) return false;
                if (_state.stakeholderSelections.length < (_config.minStakeholders || 4)) return false;
                return true;

            case 4:
                // Framework response must meet minimum length
                return _state.frameworkResponse.trim().length >= MIN_FRAMEWORK_RESPONSE_LEN;

            case 5:
                // All provisions ranked (with at least one reorder) AND conflict response written
                return (
                    _state.codeRanking.length === (_config.codeProvisions || []).length &&
                    _state._rankingInteracted === true &&
                    _state.codeConflictResponse.trim().length >= MIN_CONFLICT_RESPONSE_LEN
                );

            default:
                return true;
        }
    }

    // ── Sanitisation helpers ───────────────────────────────

    function _sanitizeText(str) {
        if (typeof str !== 'string') return '';
        // Strip HTML tags — store only plain text
        return str.replace(/<[^>]*>/g, '').trim().slice(0, 5000);
    }

    // ── Root renderer ──────────────────────────────────────

    function _render() {
        _root.innerHTML = '';
        _root.appendChild(_buildHeader());
        _root.appendChild(_buildPhaseIndicator());

        const wrapper = document.createElement('div');
        wrapper.className = 'edt-phase-panels';

        PHASES.forEach(ph => {
            const panel = document.createElement('div');
            panel.className = 'edt-phase-panel' + (ph.id === _state.phase ? ' edt-active' : '');
            panel.id = 'edt-panel-' + ph.id;
            panel.appendChild(_buildPhaseContent(ph.id));
            wrapper.appendChild(panel);
        });

        // Submission / Reflection screen
        if (_state.submitted) {
            _root.innerHTML = '';
            _root.appendChild(_buildHeader());
            _root.appendChild(_buildReflectionScreen());
            return;
        }

        _root.appendChild(wrapper);
    }

    // ── Header ─────────────────────────────────────────────

    function _buildHeader() {
        const header = document.createElement('header');
        header.className = 'edt-header';

        // Left: course tag, title, subtitle, meta
        const left = document.createElement('div');
        left.className = 'edt-header-left';

        const tag = document.createElement('div');
        tag.className = 'edt-course-tag';
        tag.textContent = _config.course + ' // Week ' + _config.week;
        left.appendChild(tag);

        const title = document.createElement('h2');
        title.className = 'edt-title';
        title.textContent = _config.title;
        left.appendChild(title);

        const sub = document.createElement('div');
        sub.className = 'edt-subtitle';
        sub.textContent = _config.subtitle;
        left.appendChild(sub);

        const meta = document.createElement('div');
        meta.className = 'edt-meta-row';
        meta.innerHTML =
            '<span class="edt-meta-chip">Chapter <span>' + _config.chapter + '</span></span>' +
            '<span class="edt-meta-chip">Est. <span>' + _config.duration + ' min</span></span>' +
            '<span class="edt-meta-chip">Lab ID <span>' + _config.id.toUpperCase() + '</span></span>';
        left.appendChild(meta);

        // Right: back link
        const right = document.createElement('div');
        right.className = 'edt-header-status';

        const back = document.createElement('a');
        back.href = _config.returnUrl || '/houses/divergent/ethics-it/';
        back.className = 'edt-back-link';
        back.innerHTML = '<img src="/assets/images/icons/icon-arrow-left.webp" alt=""> Ethics in IT';
        right.appendChild(back);

        header.appendChild(left);
        header.appendChild(right);
        return header;
    }

    // ── Phase Indicator ────────────────────────────────────

    function _buildPhaseIndicator() {
        const bar = document.createElement('nav');
        bar.className = 'edt-phase-indicator';
        bar.setAttribute('aria-label', 'Investigation phases');

        PHASES.forEach(ph => {
            const seg = document.createElement('div');
            seg.className = 'edt-phase-segment';
            seg.setAttribute('aria-label', 'Phase ' + ph.id + ': ' + ph.label);

            if (_state.submitted || ph.id < _state.phase) {
                seg.classList.add('edt-phase-done');
            } else if (ph.id === _state.phase) {
                seg.classList.add('edt-phase-active');
            }

            seg.innerHTML =
                '<span class="edt-phase-num">0' + ph.id + '</span>' +
                '<span class="edt-phase-label">' + ph.short + '</span>';

            bar.appendChild(seg);
        });

        return bar;
    }

    // ── Phase Content Dispatcher ──────────────────────────

    function _buildPhaseContent(phaseId) {
        switch (phaseId) {
            case 1: return _buildPhase1();
            case 2: return _buildPhase2();
            case 3: return _buildPhase3();
            case 4: return _buildPhase4();
            case 5: return _buildPhase5();
            default:
                const div = document.createElement('div');
                div.textContent = 'Unknown phase.';
                return div;
        }
    }

    // ── PHASE 1: Brief ─────────────────────────────────────

    function _buildPhase1() {
        const frag = document.createDocumentFragment();
        const b    = _config.brief;

        // Section header
        frag.appendChild(_sectionHeader('icon-document.webp', 'Phase 1 -- Brief', 'Read the situation brief. You are being assigned this case.'));

        // Document + sidebar
        const wrapper = document.createElement('div');
        wrapper.className = 'edt-brief-wrapper';

        // ── Document ──
        const doc = document.createElement('article');
        doc.className = 'edt-brief-doc';

        if (b.classification) {
            const cls = document.createElement('div');
            cls.className = 'edt-doc-classification';
            cls.textContent = b.classification;
            doc.appendChild(cls);
        }

        const meta = document.createElement('div');
        meta.className = 'edt-doc-meta';
        const metaLines = [];
        if (b.type) metaLines.push('<strong>TYPE:</strong> ' + _escHtml(b.type.toUpperCase()));
        if (b.from) metaLines.push('<strong>FROM:</strong> ' + _escHtml(b.from));
        if (b.to)   metaLines.push('<strong>TO:</strong> '   + _escHtml(b.to));
        if (b.date) metaLines.push('<strong>DATE:</strong> ' + _escHtml(b.date));
        meta.innerHTML = metaLines.join('<br>');
        doc.appendChild(meta);

        const divider = document.createElement('hr');
        divider.className = 'edt-doc-divider';
        doc.appendChild(divider);

        const body = document.createElement('div');
        body.className = 'edt-doc-body';
        // Content is authored — split on double-newline into paragraphs
        const paragraphs = (_escHtml(b.content)).split(/\n\n+/);
        body.innerHTML = paragraphs.map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
        doc.appendChild(body);

        wrapper.appendChild(doc);

        // ── Sidebar ──
        const sidebar = document.createElement('aside');
        sidebar.className = 'edt-brief-sidebar';

        // Context box
        const ctx = document.createElement('div');
        ctx.className = 'edt-brief-context';
        ctx.innerHTML =
            '<div class="edt-brief-context-title">Your role</div>' +
            '<p>You are not an outside observer. You are a participant in this situation. Your choices have consequences.</p>' +
            '<p>Ethics in computing is not an academic exercise. The decisions in this case have real-world analogues with real people affected.</p>';
        sidebar.appendChild(ctx);

        // Instructions box
        const inst = document.createElement('div');
        inst.className = 'edt-brief-instructions';
        inst.innerHTML =
            '<div class="edt-brief-instructions-title">Investigation process</div>' +
            '<div class="edt-brief-step"><span class="edt-brief-step-num">01</span><span>Read the brief carefully. Note the date, parties, and your position.</span></div>' +
            '<div class="edt-brief-step"><span class="edt-brief-step-num">02</span><span>Review and tag evidence artifacts -- mark what matters and why.</span></div>' +
            '<div class="edt-brief-step"><span class="edt-brief-step-num">03</span><span>Identify who is affected, then commit to a course of action.</span></div>' +
            '<div class="edt-brief-step"><span class="edt-brief-step-num">04</span><span>Defend your decision against a professional challenge.</span></div>' +
            '<div class="edt-brief-step"><span class="edt-brief-step-num">05</span><span>Resolve a conflict between professional codes of conduct.</span></div>';
        sidebar.appendChild(inst);

        wrapper.appendChild(sidebar);
        frag.appendChild(wrapper);

        // Nav row
        frag.appendChild(_buildNavRow(1));

        return _fragToDiv(frag);
    }

    // ── PHASE 2: Evidence ──────────────────────────────────

    function _buildPhase2() {
        const frag = document.createDocumentFragment();

        frag.appendChild(_sectionHeader('icon-magnifier.webp', 'Phase 2 -- Evidence Board', 'Tag each artifact. Mark it RELEVANT, IRRELEVANT, or CONTESTED. Explain your reasoning.'));

        // Progress counter
        const counter = document.createElement('div');
        counter.className = 'edt-evidence-progress';
        counter.id = 'edt-ev-counter';
        frag.appendChild(counter);
        _updateEvidenceCounter(counter);

        // Grid
        const grid = document.createElement('div');
        grid.className = 'edt-evidence-grid';

        (_config.evidence || []).forEach(ev => {
            grid.appendChild(_buildEvidenceCard(ev));
        });

        frag.appendChild(grid);

        // Validation message
        const valMsg = document.createElement('div');
        valMsg.className = 'edt-status-msg edt-status-warning';
        valMsg.id = 'edt-ev-validation';
        valMsg.style.display = 'none';
        valMsg.innerHTML = '<img src="/assets/images/icons/icon-warning.webp" alt=""> ' +
            'All artifacts must be tagged. For RELEVANT and CONTESTED artifacts, provide an explanation of at least ' + MIN_EXPLANATION_LEN + ' characters.';
        frag.appendChild(valMsg);

        frag.appendChild(_buildNavRow(2));

        return _fragToDiv(frag);
    }

    function _buildEvidenceCard(ev) {
        const card = document.createElement('article');
        card.className = 'edt-evidence-card';
        card.id = 'edt-ev-card-' + ev.id;

        const tag = _state.evidenceTags[ev.id];
        if (tag && tag.tag) {
            card.classList.add('edt-tagged-' + tag.tag);
        }

        card.innerHTML =
            '<div class="edt-evidence-id">' + _escHtml(ev.id) + '</div>' +
            '<div class="edt-evidence-type-badge">' + _escHtml(ev.type) + '</div>' +
            '<div class="edt-evidence-title">' + _escHtml(ev.title) + '</div>' +
            '<div class="edt-evidence-date">' + _escHtml(ev.date) + '</div>' +
            '<div class="edt-evidence-content">' + _escHtml(ev.content) + '</div>' +
            '<div class="edt-evidence-tag-controls">' +
                '<span class="edt-tag-label">Tag this artifact</span>' +
                '<div class="edt-tag-radios">' +
                    '<button type="button" class="edt-tag-btn edt-btn-relevant" data-ev="' + _escAttr(ev.id) + '" data-val="relevant">Relevant</button>' +
                    '<button type="button" class="edt-tag-btn edt-btn-irrelevant" data-ev="' + _escAttr(ev.id) + '" data-val="irrelevant">Irrelevant</button>' +
                    '<button type="button" class="edt-tag-btn edt-btn-contested" data-ev="' + _escAttr(ev.id) + '" data-val="contested">Contested</button>' +
                '</div>' +
                '<textarea class="edt-tag-explanation" id="edt-note-' + _escAttr(ev.id) + '"' +
                    ' placeholder="Explain why this artifact is relevant or contested (min ' + MIN_EXPLANATION_LEN + ' chars)..."' +
                    ' maxlength="500" aria-label="Explanation for ' + _escAttr(ev.title) + '"></textarea>' +
                '<span class="edt-field-error" id="edt-ev-err-' + _escAttr(ev.id) + '">Explanation required for this tag.</span>' +
            '</div>';

        // Restore saved state
        if (tag) {
            _applyTagButtonActive(card, tag.tag);
            if (tag.note) {
                const textarea = card.querySelector('textarea');
                if (textarea) {
                    textarea.value = tag.note;
                    textarea.classList.add('edt-visible');
                }
            }
        }

        // Attach button listeners
        card.querySelectorAll('.edt-tag-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const evId = this.dataset.ev;
                const val  = this.dataset.val;
                _onTagClick(evId, val, card);
            });
        });

        // Textarea listener
        const textarea = card.querySelector('textarea');
        if (textarea) {
            textarea.addEventListener('input', function () {
                const evId = card.querySelector('.edt-tag-btn').dataset.ev;
                const existing = _state.evidenceTags[evId] || {};
                existing.note = _sanitizeText(this.value);
                _state.evidenceTags[evId] = existing;
                _save();
                _updateEvidenceCounter(document.getElementById('edt-ev-counter'));
            });
        }

        return card;
    }

    function _onTagClick(evId, val, card) {
        _state.evidenceTags[evId] = _state.evidenceTags[evId] || {};
        _state.evidenceTags[evId].tag = val;
        _save();

        // Update card class
        card.classList.remove('edt-tagged-relevant', 'edt-tagged-irrelevant', 'edt-tagged-contested');
        card.classList.add('edt-tagged-' + val);
        _applyTagButtonActive(card, val);

        // Show/hide textarea
        const textarea = card.querySelector('textarea');
        if (textarea) {
            if (val === 'irrelevant') {
                textarea.classList.remove('edt-visible');
            } else {
                textarea.classList.add('edt-visible');
                textarea.focus();
            }
        }

        // Update counter
        _updateEvidenceCounter(document.getElementById('edt-ev-counter'));
    }

    function _applyTagButtonActive(card, tagVal) {
        card.querySelectorAll('.edt-tag-btn').forEach(btn => {
            btn.classList.remove('edt-tag-active');
            if (btn.dataset.val === tagVal) {
                btn.classList.add('edt-tag-active');
            }
        });
    }

    function _updateEvidenceCounter(el) {
        if (!el) return;
        const total  = (_config.evidence || []).length;
        const tagged = Object.keys(_state.evidenceTags).length;
        el.innerHTML =
            '<span class="edt-evidence-count">Tagged: <strong>' + tagged + ' / ' + total + '</strong> artifacts</span>' +
            '<span class="edt-evidence-count">Relevant: <strong>' +
                Object.values(_state.evidenceTags).filter(t => t.tag === 'relevant').length + '</strong>' +
            '  Contested: <strong>' +
                Object.values(_state.evidenceTags).filter(t => t.tag === 'contested').length + '</strong>' +
            '  Irrelevant: <strong>' +
                Object.values(_state.evidenceTags).filter(t => t.tag === 'irrelevant').length + '</strong></span>';
    }

    // ── PHASE 3: Stakeholders + Decision ──────────────────

    function _buildPhase3() {
        const frag = document.createDocumentFragment();

        frag.appendChild(_sectionHeader('icon-users.webp', 'Phase 3 -- Stakeholders + Decision', 'Map who is affected. Then commit to a course of action. You cannot change your decision after locking in.'));

        // ── Stakeholder section ──
        const stSection = document.createElement('section');
        stSection.className = 'edt-stakeholder-section';

        const stHeader = document.createElement('div');
        stHeader.style.cssText = 'margin-bottom:12px;';
        const minReq = _config.minStakeholders || 4;
        stHeader.innerHTML =
            '<div style="font-family:var(--edt-mono);font-size:0.68rem;color:var(--edt-text-sec);letter-spacing:0.08em;margin-bottom:6px;">' +
            'Select at least <strong style="color:var(--edt-primary);">' + minReq + '</strong> stakeholders affected by this situation. ' +
            'Choose carefully. Not everyone on this list is relevant.</div>';
        stSection.appendChild(stHeader);

        const grid = document.createElement('div');
        grid.className = 'edt-stakeholder-grid';

        (_config.stakeholders || []).forEach(s => {
            const item = document.createElement('div');
            item.className = 'edt-stakeholder-item';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'edt-stakeholder-checkbox';
            cb.id = 'edt-st-' + s.id;
            cb.value = s.id;
            cb.checked = _state.stakeholderSelections.includes(s.id);

            const lbl = document.createElement('label');
            lbl.className = 'edt-stakeholder-label';
            lbl.htmlFor = 'edt-st-' + s.id;

            const pin = document.createElement('span');
            pin.className = 'edt-pin-marker';
            pin.setAttribute('aria-hidden', 'true');
            lbl.appendChild(pin);

            const txt = document.createElement('span');
            txt.textContent = s.name;
            lbl.appendChild(txt);

            item.appendChild(cb);
            item.appendChild(lbl);

            cb.addEventListener('change', function () {
                if (this.checked) {
                    if (!_state.stakeholderSelections.includes(s.id)) {
                        _state.stakeholderSelections.push(s.id);
                    }
                } else {
                    _state.stakeholderSelections = _state.stakeholderSelections.filter(id => id !== s.id);
                }
                _save();
                _updateStakeholderCount(countBar);
            });

            grid.appendChild(item);
        });

        stSection.appendChild(grid);

        const countBar = document.createElement('div');
        countBar.className = 'edt-stakeholder-count-bar';
        stSection.appendChild(countBar);
        _updateStakeholderCount(countBar);

        const stValMsg = document.createElement('div');
        stValMsg.className = 'edt-status-msg edt-status-warning';
        stValMsg.id = 'edt-st-validation';
        stValMsg.style.display = 'none';
        stValMsg.innerHTML = '<img src="/assets/images/icons/icon-warning.webp" alt=""> Please select at least ' + minReq + ' stakeholders.';
        stSection.appendChild(stValMsg);

        frag.appendChild(stSection);

        // ── Decision section ──
        const decSection = document.createElement('section');
        decSection.className = 'edt-decision-section';

        const decHeader = document.createElement('div');
        decHeader.style.cssText = 'margin-bottom:16px;margin-top:32px;padding-top:24px;border-top:1px solid var(--edt-border);';
        decHeader.innerHTML =
            '<div style="font-family:var(--edt-mono);font-size:0.68rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--edt-primary);margin-bottom:6px;">Decision Point</div>' +
            '<div style="font-size:0.84rem;color:var(--edt-text-sec);line-height:1.6;">Given what you know, what do you do? This decision is permanent -- choose carefully.</div>';
        decSection.appendChild(decHeader);

        const intro = document.createElement('div');
        intro.className = 'edt-decision-intro';
        intro.textContent = 'You have reviewed the brief and the evidence. You have mapped the stakeholders. You must now choose a course of action. Consider the consequences for every party you have identified.';
        decSection.appendChild(intro);

        const opts = document.createElement('div');
        opts.className = 'edt-decision-options';
        opts.id = 'edt-decision-options';
        if (_state.decisionLocked) {
            opts.classList.add('edt-decision-locked');
        }

        const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

        (_config.decisions || []).forEach((d, i) => {
            const item = document.createElement('div');
            item.className = 'edt-decision-item';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.className = 'edt-decision-radio';
            radio.name = 'edt-decision';
            radio.id = 'edt-d-' + d.id;
            radio.value = d.id;
            radio.checked = _state.decisionId === d.id;
            radio.disabled = _state.decisionLocked;

            const lbl = document.createElement('label');
            lbl.className = 'edt-decision-label';
            lbl.htmlFor = 'edt-d-' + d.id;

            const idx = document.createElement('span');
            idx.className = 'edt-decision-index';
            idx.textContent = LETTERS[i] || (i + 1);

            const txt = document.createElement('span');
            txt.className = 'edt-decision-text';
            txt.textContent = d.text;

            lbl.appendChild(idx);
            lbl.appendChild(txt);

            radio.addEventListener('change', function () {
                if (this.checked) {
                    _state.decisionId = d.id;
                    _save();
                    // Enable commit button
                    const btn = document.getElementById('edt-commit-btn');
                    if (btn) btn.disabled = false;
                }
            });

            item.appendChild(radio);
            item.appendChild(lbl);
            opts.appendChild(item);
        });

        decSection.appendChild(opts);

        // Commit button
        const commitBtn = document.createElement('button');
        commitBtn.type = 'button';
        commitBtn.id = 'edt-commit-btn';
        commitBtn.style.cssText = 'margin-top:20px;';

        if (_state.decisionLocked) {
            commitBtn.className = 'edt-commit-btn edt-locked';
            commitBtn.textContent = 'Decision locked';
            commitBtn.disabled = true;
        } else {
            commitBtn.className = 'edt-commit-btn';
            commitBtn.textContent = 'Lock In Decision';
            commitBtn.disabled = !_state.decisionId;
            commitBtn.addEventListener('click', _onCommitDecision);
        }

        decSection.appendChild(commitBtn);

        const decValMsg = document.createElement('div');
        decValMsg.className = 'edt-status-msg edt-status-warning';
        decValMsg.id = 'edt-dec-validation';
        decValMsg.style.cssText = 'margin-top:12px;display:none;';
        decValMsg.innerHTML = '<img src="/assets/images/icons/icon-warning.webp" alt=""> Please select a decision before locking in.';
        decSection.appendChild(decValMsg);

        frag.appendChild(decSection);
        frag.appendChild(_buildNavRow(3));

        return _fragToDiv(frag);
    }

    function _updateStakeholderCount(el) {
        if (!el) return;
        const sel = _state.stakeholderSelections.length;
        const min = _config.minStakeholders || 4;
        const total = (_config.stakeholders || []).length;
        el.innerHTML =
            '<span>' + sel + ' of ' + total + ' selected. ' +
            (sel < min
                ? '<strong style="color:var(--edt-amber);">Minimum ' + min + ' required.</strong>'
                : '<strong style="color:var(--edt-success);">Threshold met.</strong>') +
            '</span>';
    }

    function _onCommitDecision() {
        if (!_state.decisionId) {
            const v = document.getElementById('edt-dec-validation');
            if (v) v.style.display = 'flex';
            return;
        }

        // Confirm
        const decisionText = (_config.decisions || []).find(d => d.id === _state.decisionId);
        const label = decisionText ? decisionText.text : 'your decision';

        // Brief confirm UI — inline, no browser dialog
        const btn = document.getElementById('edt-commit-btn');
        if (!btn) return;

        if (btn.dataset.confirming === 'true') {
            // Second click — lock it
            _state.decisionLocked = true;
            _save();
            _render();
        } else {
            // First click — show confirm state
            btn.dataset.confirming = 'true';
            btn.textContent = 'Confirm? This is permanent. Click again.';
            btn.style.background = 'var(--edt-amber)';
            btn.style.borderColor = 'var(--edt-amber)';

            // Auto-reset after 5s
            setTimeout(() => {
                if (btn.dataset.confirming === 'true') {
                    btn.dataset.confirming = '';
                    btn.textContent = 'Lock In Decision';
                    btn.style.background = '';
                    btn.style.borderColor = '';
                }
            }, 5000);
        }
    }

    // ── PHASE 4: Framework Challenge ──────────────────────

    function _buildPhase4() {
        const frag = document.createDocumentFragment();

        frag.appendChild(_sectionHeader('icon-brain.webp', 'Phase 4 -- Framework Challenge', 'Your decision has been reviewed. An opposing analyst has challenged your reasoning. Respond.'));

        // Get the pre-authored challenge for their decision
        const challenge = _config.frameworkChallenges && _state.decisionId
            ? _config.frameworkChallenges[_state.decisionId]
            : null;

        if (!challenge) {
            const err = document.createElement('div');
            err.className = 'edt-status-msg edt-status-error';
            err.innerHTML = '<img src="/assets/images/icons/icon-alert.webp" alt=""> No challenge found for this decision. Return to Phase 3.';
            frag.appendChild(err);
            frag.appendChild(_buildNavRow(4));
            return _fragToDiv(frag);
        }

        // Show the selected decision as context
        const selDec = (_config.decisions || []).find(d => d.id === _state.decisionId);
        if (selDec) {
            const ctx = document.createElement('div');
            ctx.className = 'edt-status-msg edt-status-info';
            ctx.style.cssText = 'margin-bottom:20px;';
            ctx.innerHTML = '<img src="/assets/images/icons/icon-lock.webp" alt=""> Your locked decision: <strong style="color:var(--edt-text);margin-left:6px;">' + _escHtml(selDec.text) + '</strong>';
            frag.appendChild(ctx);
        }

        // ── Transmission block ──
        const txWrapper = document.createElement('div');
        txWrapper.className = 'edt-transmission-wrapper';

        const txHeader = document.createElement('div');
        txHeader.className = 'edt-transmission-header';
        txHeader.innerHTML = '<span class="edt-tx-dot"></span>INCOMING ANALYST TRANSMISSION -- ETHICS REVIEW BOARD';
        txWrapper.appendChild(txHeader);

        const txBody = document.createElement('div');
        txBody.className = 'edt-transmission-body';

        // Supporting block
        const supBlock = document.createElement('div');
        supBlock.className = 'edt-framework-block';
        supBlock.innerHTML =
            '<div class="edt-framework-block-label edt-label-supporting">' +
            '<img src="/assets/images/icons/icon-checkmark.webp" alt="" style="width:12px;height:12px;filter:invert(1) sepia(1) saturate(5) hue-rotate(100deg);"> SUPPORTING ANALYSIS' +
            '</div>' +
            '<p>' + _escHtml(challenge.supporting) + '</p>';
        txBody.appendChild(supBlock);

        // Challenging block
        const chalBlock = document.createElement('div');
        chalBlock.className = 'edt-framework-block';
        chalBlock.innerHTML =
            '<div class="edt-framework-block-label edt-label-challenging">' +
            '<img src="/assets/images/icons/icon-crossmark.webp" alt="" style="width:12px;height:12px;filter:invert(1) sepia(1) saturate(5) hue-rotate(300deg);"> CHALLENGING ANALYSIS' +
            '</div>' +
            '<p>' + _escHtml(challenge.challenging) + '</p>';
        txBody.appendChild(chalBlock);

        // Incomplete block
        const incBlock = document.createElement('div');
        incBlock.className = 'edt-framework-block';
        incBlock.innerHTML =
            '<div class="edt-framework-block-label edt-label-incomplete">' +
            '<img src="/assets/images/icons/icon-warning.webp" alt="" style="width:12px;height:12px;filter:invert(1) sepia(1) saturate(8) hue-rotate(5deg);"> INCOMPLETE REASONING NOTICE' +
            '</div>' +
            '<p>' + _escHtml(challenge.incomplete) + '</p>';
        txBody.appendChild(incBlock);

        txWrapper.appendChild(txBody);
        frag.appendChild(txWrapper);

        // ── Student response ──
        const respSection = document.createElement('section');
        respSection.className = 'edt-framework-response-section';

        const prompt = document.createElement('div');
        prompt.className = 'edt-framework-prompt';
        prompt.innerHTML =
            '<strong>Your response required</strong>' +
            'Address the challenging analysis above. Explain why your decision remains defensible, or acknowledge where the critique lands and how you would modify your reasoning. ' +
            'Reference at least one ethical framework (utilitarian, deontological, virtue ethics, or consequentialist) by name and apply it to the facts of this case.';
        respSection.appendChild(prompt);

        const lbl = document.createElement('label');
        lbl.className = 'edt-textarea-label';
        lbl.htmlFor = 'edt-fw-response';
        lbl.textContent = 'Your analysis (min ' + MIN_FRAMEWORK_RESPONSE_LEN + ' characters)';
        respSection.appendChild(lbl);

        const ta = document.createElement('textarea');
        ta.id = 'edt-fw-response';
        ta.className = 'edt-textarea';
        ta.style.minHeight = '140px';
        ta.maxLength = 3000;
        ta.setAttribute('aria-label', 'Framework response');
        ta.placeholder = 'Construct a reasoned, specific defense. Vague or generic responses will not meet the grading threshold...';
        ta.value = _state.frameworkResponse || '';

        const charCount = document.createElement('span');
        charCount.className = 'edt-char-count';
        charCount.id = 'edt-fw-chars';
        charCount.textContent = (ta.value.length) + ' / 3000';

        ta.addEventListener('input', function () {
            _state.frameworkResponse = _sanitizeText(this.value);
            _save();
            charCount.textContent = this.value.length + ' / 3000';
        });

        respSection.appendChild(ta);
        respSection.appendChild(charCount);

        const fwValMsg = document.createElement('div');
        fwValMsg.className = 'edt-status-msg edt-status-warning';
        fwValMsg.id = 'edt-fw-validation';
        fwValMsg.style.cssText = 'margin-top:8px;display:none;';
        fwValMsg.innerHTML = '<img src="/assets/images/icons/icon-warning.webp" alt=""> Response must be at least ' + MIN_FRAMEWORK_RESPONSE_LEN + ' characters.';
        respSection.appendChild(fwValMsg);

        frag.appendChild(respSection);
        frag.appendChild(_buildNavRow(4));

        return _fragToDiv(frag);
    }

    // ── PHASE 5: Code Conflict ─────────────────────────────

    function _buildPhase5() {
        const frag = document.createDocumentFragment();

        frag.appendChild(_sectionHeader('icon-scales.webp', 'Phase 5 -- Code Conflict', 'Rank these professional obligations. Then resolve the conflict between the two that directly oppose each other.'));

        // Initialize ranking to config order if not yet set
        if (_state.codeRanking.length === 0) {
            _state.codeRanking = (_config.codeProvisions || []).map(p => p.code + ' ' + p.section);
            _state._rankingInteracted = false;
            _save();
        }

        // Provisions ranking
        const provLabel = document.createElement('div');
        provLabel.style.cssText = 'font-family:var(--edt-mono);font-size:0.68rem;color:var(--edt-text-sec);letter-spacing:0.06em;margin-bottom:14px;';
        provLabel.textContent = 'Rank these provisions 1 (highest obligation) to ' + (_config.codeProvisions || []).length + ' (lowest). Use the arrows to reorder.';
        frag.appendChild(provLabel);

        const provList = document.createElement('div');
        provList.className = 'edt-code-provisions';
        provList.id = 'edt-prov-list';
        frag.appendChild(provList);

        _renderProvisionList(provList);

        // Conflict box
        const conflict = _config.codeConflict;
        if (conflict) {
            const cbox = document.createElement('div');
            cbox.className = 'edt-conflict-box';
            cbox.innerHTML =
                '<div class="edt-conflict-box-title">' +
                '<img src="/assets/images/icons/icon-swords.webp" alt=""> Code Conflict: ' +
                _escHtml(conflict.provision1) + ' vs. ' + _escHtml(conflict.provision2) +
                '</div>' +
                '<p>' + _escHtml(conflict.conflictDescription) + '</p>';
            frag.appendChild(cbox);
        }

        // Conflict response
        const lbl = document.createElement('label');
        lbl.className = 'edt-textarea-label';
        lbl.htmlFor = 'edt-conflict-response';
        lbl.textContent = 'Resolution -- which obligation prevails and why? (min ' + MIN_CONFLICT_RESPONSE_LEN + ' characters)';
        frag.appendChild(lbl);

        const ta = document.createElement('textarea');
        ta.id = 'edt-conflict-response';
        ta.className = 'edt-textarea';
        ta.style.minHeight = '120px';
        ta.maxLength = 2000;
        ta.placeholder = 'Argue which professional obligation takes precedence in this specific situation, and why...';
        ta.value = _state.codeConflictResponse || '';

        const charCount = document.createElement('span');
        charCount.className = 'edt-char-count';
        charCount.id = 'edt-cc-chars';
        charCount.textContent = ta.value.length + ' / 2000';

        ta.addEventListener('input', function () {
            _state.codeConflictResponse = _sanitizeText(this.value);
            _save();
            charCount.textContent = this.value.length + ' / 2000';
        });

        frag.appendChild(ta);
        frag.appendChild(charCount);

        const ccValMsg = document.createElement('div');
        ccValMsg.className = 'edt-status-msg edt-status-warning';
        ccValMsg.id = 'edt-cc-validation';
        ccValMsg.style.cssText = 'margin-top:8px;display:none;';
        ccValMsg.innerHTML = '<img src="/assets/images/icons/icon-warning.webp" alt=""> Response must be at least ' + MIN_CONFLICT_RESPONSE_LEN + ' characters.';
        frag.appendChild(ccValMsg);

        // Submit button row
        const submitRow = document.createElement('div');
        submitRow.className = 'edt-nav-row';
        submitRow.style.justifyContent = 'flex-end';

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'edt-btn-secondary';
        prevBtn.innerHTML = '<img src="/assets/images/icons/icon-arrow-left.webp" alt=""> Back';
        prevBtn.addEventListener('click', () => _goToPhase(_state.phase - 1));
        submitRow.appendChild(prevBtn);

        const spacer = document.createElement('span');
        spacer.style.flex = '1';
        submitRow.appendChild(spacer);

        const hint = document.createElement('span');
        hint.className = 'edt-nav-hint';
        hint.id = 'edt-submit-hint';
        hint.textContent = '';
        submitRow.appendChild(hint);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.id = 'edt-submit-btn';
        submitBtn.className = 'edt-btn-primary';
        submitBtn.innerHTML = 'Submit Case Room <img src="/assets/images/icons/icon-checkmark.webp" alt="">';
        submitBtn.addEventListener('click', _onSubmit);
        submitRow.appendChild(submitBtn);

        frag.appendChild(submitRow);

        return _fragToDiv(frag);
    }

    function _renderProvisionList(container) {
        container.innerHTML = '';
        const provisions = _config.codeProvisions || [];

        _state.codeRanking.forEach((ref, i) => {
            const prov = provisions.find(p => (p.code + ' ' + p.section) === ref);
            if (!prov) return;

            const card = document.createElement('div');
            card.className = 'edt-provision-card edt-rank-' + (i + 1);
            card.dataset.ref = ref;

            const rankBadge = document.createElement('div');
            rankBadge.className = 'edt-provision-rank';
            rankBadge.textContent = i + 1;

            const info = document.createElement('div');
            info.className = 'edt-provision-info';
            info.innerHTML =
                '<div class="edt-provision-ref">' + _escHtml(prov.code) + ' - Section ' + _escHtml(prov.section) + '</div>' +
                '<div class="edt-provision-text">' + _escHtml(prov.text) + '</div>';

            const controls = document.createElement('div');
            controls.className = 'edt-provision-controls';

            if (i > 0) {
                const upBtn = document.createElement('button');
                upBtn.type = 'button';
                upBtn.className = 'edt-rank-btn';
                upBtn.textContent = 'Up';
                upBtn.setAttribute('aria-label', 'Move ' + prov.code + ' up');
                upBtn.addEventListener('click', () => {
                    const idx = _state.codeRanking.indexOf(ref);
                    if (idx > 0) {
                        [_state.codeRanking[idx - 1], _state.codeRanking[idx]] =
                            [_state.codeRanking[idx], _state.codeRanking[idx - 1]];
                        _state._rankingInteracted = true;
                        _save();
                        _renderProvisionList(container);
                    }
                });
                controls.appendChild(upBtn);
            }

            if (i < _state.codeRanking.length - 1) {
                const downBtn = document.createElement('button');
                downBtn.type = 'button';
                downBtn.className = 'edt-rank-btn';
                downBtn.textContent = 'Down';
                downBtn.setAttribute('aria-label', 'Move ' + prov.code + ' down');
                downBtn.addEventListener('click', () => {
                    const idx = _state.codeRanking.indexOf(ref);
                    if (idx < _state.codeRanking.length - 1) {
                        [_state.codeRanking[idx + 1], _state.codeRanking[idx]] =
                            [_state.codeRanking[idx], _state.codeRanking[idx + 1]];
                        _state._rankingInteracted = true;
                        _save();
                        _renderProvisionList(container);
                    }
                });
                controls.appendChild(downBtn);
            }

            card.appendChild(rankBadge);
            card.appendChild(info);
            card.appendChild(controls);
            container.appendChild(card);
        });
    }

    // ── Navigation Row ─────────────────────────────────────

    function _buildNavRow(phaseId) {
        const row = document.createElement('div');
        row.className = 'edt-nav-row';

        if (phaseId > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.type = 'button';
            prevBtn.className = 'edt-btn-secondary';
            prevBtn.innerHTML = '<img src="/assets/images/icons/icon-arrow-left.webp" alt=""> Back';
            prevBtn.addEventListener('click', () => _goToPhase(phaseId - 1));
            row.appendChild(prevBtn);
        } else {
            row.appendChild(document.createElement('span'));
        }

        const hint = document.createElement('span');
        hint.className = 'edt-nav-hint';

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'edt-btn-primary';

        if (phaseId < PHASES.length) {
            nextBtn.textContent = 'Continue to Phase ' + (phaseId + 1);
            nextBtn.innerHTML += ' <img src="/assets/images/icons/icon-arrow-left.webp" alt="" style="transform:scaleX(-1)">';
            nextBtn.addEventListener('click', () => _tryAdvancePhase(phaseId));
        }

        row.appendChild(hint);
        row.appendChild(nextBtn);

        return row;
    }

    function _goToPhase(n) {
        if (n < 1 || n > PHASES.length) return;
        _state.phase = n;
        _save();
        _render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function _tryAdvancePhase(current) {
        // Run validation for the current phase
        if (!_validatePhase(current)) return;
        _state.phase = current + 1;
        _save();
        _render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Validates the current phase state and shows inline errors.
     * Returns true if valid, false if there are issues.
     */
    function _validatePhase(phase) {
        switch (phase) {
            case 2: {
                const evVal = document.getElementById('edt-ev-validation');
                if (!_phaseComplete(2)) {
                    if (evVal) evVal.style.display = 'flex';
                    evVal && evVal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    return false;
                }
                if (evVal) evVal.style.display = 'none';
                return true;
            }
            case 3: {
                const stVal  = document.getElementById('edt-st-validation');
                const decVal = document.getElementById('edt-dec-validation');
                const minReq = _config.minStakeholders || 4;

                if (_state.stakeholderSelections.length < minReq) {
                    if (stVal) { stVal.style.display = 'flex'; stVal.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
                    return false;
                }
                if (stVal) stVal.style.display = 'none';

                if (!_state.decisionLocked) {
                    if (decVal) { decVal.style.display = 'flex'; decVal.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
                    return false;
                }
                if (decVal) decVal.style.display = 'none';
                return true;
            }
            case 4: {
                const fwVal = document.getElementById('edt-fw-validation');
                if (_state.frameworkResponse.trim().length < MIN_FRAMEWORK_RESPONSE_LEN) {
                    if (fwVal) { fwVal.style.display = 'flex'; fwVal.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
                    return false;
                }
                if (fwVal) fwVal.style.display = 'none';
                return true;
            }
            default:
                return true;
        }
    }

    // ── Submission ─────────────────────────────────────────

    function _onSubmit() {
        // Phase 5 validation
        const ccVal = document.getElementById('edt-cc-validation');
        if (_state.codeConflictResponse.trim().length < MIN_CONFLICT_RESPONSE_LEN) {
            if (ccVal) { ccVal.style.display = 'flex'; ccVal.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
            return;
        }
        if (ccVal) ccVal.style.display = 'none';

        if (_state.codeRanking.length !== (_config.codeProvisions || []).length) {
            _showSubmitHint('Provision ranking incomplete.');
            return;
        }

        const btn = document.getElementById('edt-submit-btn');
        if (!btn) return;

        if (btn.dataset.confirming === 'true') {
            _doSubmit(btn);
        } else {
            btn.dataset.confirming = 'true';
            btn.textContent = 'Confirm submission? Click again.';
            btn.style.background = 'var(--edt-amber)';
            btn.style.borderColor = 'var(--edt-amber)';
            btn.style.color = 'var(--edt-bg)';
            setTimeout(() => {
                if (btn.dataset.confirming === 'true') {
                    btn.dataset.confirming = '';
                    btn.innerHTML = 'Submit Case Room <img src="/assets/images/icons/icon-checkmark.webp" alt="">';
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }
            }, 6000);
        }
    }

    function _showSubmitHint(msg) {
        const hint = document.getElementById('edt-submit-hint');
        if (hint) {
            hint.textContent = msg;
            hint.style.color = 'var(--edt-danger)';
        }
    }

    async function _doSubmit(btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="edt-spinner"></span> Submitting...';

        // ── Auto-score: evidence quality ──────────────────────
        // Full points if all relevant/contested tags have explanations >= 40 chars
        const evScoring = _config.scoring ? _config.scoring.evidence : 20;
        const tagged = Object.values(_state.evidenceTags);
        const totalTagged = tagged.length;
        const total = (_config.evidence || []).length;
        const withExplanation = tagged.filter(t =>
            (t.tag === 'relevant' || t.tag === 'contested') &&
            t.note && t.note.trim().length >= 40
        ).length;
        const evidenceScore = totalTagged === total
            ? Math.round(evScoring * (0.5 + 0.5 * (withExplanation / Math.max(1, tagged.filter(t => t.tag !== 'irrelevant').length))))
            : Math.round(evScoring * (tagged.length / total) * 0.8);

        // ── Auto-score: stakeholder depth ──────────────────────
        // Three tiers: obvious (expected), nonObvious (bonus), irrelevant (penalty)
        const stScoring = _config.scoring ? _config.scoring.stakeholder : 20;
        const allStakeholders = _config.stakeholders || [];
        const nonObvious = allStakeholders.filter(s => !s.obvious && !s.irrelevant).map(s => s.id);
        const irrelevant = allStakeholders.filter(s => s.irrelevant).map(s => s.id);
        const selected = _state.stakeholderSelections;

        const nonObviousFound = selected.filter(id => nonObvious.includes(id)).length;
        const irrelevantPicked = selected.filter(id => irrelevant.includes(id)).length;
        const validPicks = selected.filter(id => !irrelevant.includes(id)).length;

        // Base: ratio of valid picks to minimum required (40%)
        const stCountRatio = Math.min(1, validPicks / (_config.minStakeholders || 4));
        // Depth: ratio of non-obvious found (40%)
        const stDepthRatio = nonObviousFound / Math.max(1, nonObvious.length);
        // Penalty: each irrelevant pick costs 20% of the section score
        const penalty = Math.min(stScoring, irrelevantPicked * (stScoring * 0.2));

        const stakeholderScore = Math.max(0, Math.round(stScoring * ((stDepthRatio * 0.4) + (stCountRatio * 0.4) + (nonObviousFound > 0 ? 0.2 : 0)) - penalty));

        // ── Auto-score: code ranking ───────────────────────────
        const ccScoring = _config.scoring ? _config.scoring.codeConflict : 20;
        // Auto-score: 60% for completing the ranking + having min length response
        const codeScore = Math.round(ccScoring * 0.6); // partial auto; remainder is spot-check

        const payload = {
            labId:                  _config.id,
            evidenceTags:           _state.evidenceTags,
            stakeholderSelections:  _state.stakeholderSelections,
            decisionId:             _state.decisionId,
            frameworkResponse:      _state.frameworkResponse,
            codeRanking:            _state.codeRanking,
            codeConflictResponse:   _state.codeConflictResponse,
            // Pre-computed auto scores
            autoScores: {
                evidence:     evidenceScore,
                stakeholder:  stakeholderScore,
                codeConflict: codeScore
            }
        };

        try {
            // submitEDTLab Cloud Function
            if (typeof firebase !== 'undefined' && firebase.functions) {
                const submitFn = firebase.functions().httpsCallable('submitEDTLab');
                const result = await submitFn(payload);
                console.log('[EDT] Submission accepted:', result.data);
            } else if (typeof firebase !== 'undefined') {
                // Modular SDK path — try dynamic import of firebase-functions
                const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
                const fns = getFunctions(firebase.app());
                const submitFn = httpsCallable(fns, 'submitEDTLab');
                const result = await submitFn(payload);
                console.log('[EDT] Submission accepted:', result.data);
            } else {
                // Development fallback — log submission
                console.info('[EDT] (DEV) Submission payload:', payload);
            }

            // Record lab completion via ModuleProgress (non-blocking)
            if (typeof ModuleProgress !== 'undefined') {
                ModuleProgress.complete('divergent', _config.id, {
                    score: evidenceScore + stakeholderScore + codeScore,
                    house: 'divergent'
                });
            }

            _state.submitted = true;
            _state.submittedAt = Date.now();
            _state.finalScores = {
                evidence:     evidenceScore,
                stakeholder:  stakeholderScore,
                framework:    null, // instructor-graded
                codeConflict: codeScore
            };
            _save();
            _render();
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            console.error('[EDT] Submission failed:', err);
            btn.disabled = false;
            btn.innerHTML = 'Submit Case Room <img src="/assets/images/icons/icon-checkmark.webp" alt="">';
            btn.dataset.confirming = '';

            // Show error
            let msg = 'Submission failed. Check your connection and try again.';
            if (err && err.code === 'unauthenticated') {
                msg = 'You must be signed in to submit. Refresh the page and sign in.';
            }
            _showSubmitHint(msg);
        }
    }

    // ── Reflection / Completion Screen ────────────────────

    function _buildReflectionScreen() {
        const wrapper = document.createElement('div');

        // Reflection banner + Export Report button row
        const bannerRow = document.createElement('div');
        bannerRow.className = 'edt-reflection-banner-row';

        const banner = document.createElement('div');
        banner.className = 'edt-reflection-banner';
        banner.innerHTML = '<img src="/assets/images/icons/icon-checkmark.webp" alt=""> Reflection Mode -- This submission is read-only. All paths are now visible.';
        bannerRow.appendChild(banner);

        // Feature 2: Export Report button (visible in reflection mode only)
        const exportBtn = document.createElement('button');
        exportBtn.type = 'button';
        exportBtn.className = 'edt-export-btn';
        exportBtn.innerHTML = '<img src="/assets/images/icons/icon-list.webp" alt=""> Export Report';
        exportBtn.addEventListener('click', _exportReport);
        bannerRow.appendChild(exportBtn);

        // Reset Lab button (clears localStorage + Firestore submission)
        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'edt-reset-btn';
        resetBtn.innerHTML = '<img src="/assets/images/icons/icon-radar.webp" alt=""> Reset Lab';
        resetBtn.addEventListener('click', _resetLab);
        bannerRow.appendChild(resetBtn);

        wrapper.appendChild(bannerRow);

        // Completion card
        const screen = document.createElement('div');
        screen.className = 'edt-submit-screen';

        const icon = document.createElement('img');
        icon.className = 'edt-submit-icon';
        icon.src = '/assets/images/icons/icon-scales.webp';
        icon.alt = '';
        screen.appendChild(icon);

        const title = document.createElement('h2');
        title.className = 'edt-submit-title';
        title.textContent = 'Case Room Submitted';
        screen.appendChild(title);

        const desc = document.createElement('p');
        desc.className = 'edt-submit-desc';
        desc.textContent = 'Your investigation is complete. The auto-scored components are shown below. Your framework analysis will be reviewed by your instructor.';
        screen.appendChild(desc);

        // Score breakdown
        const scores = _state.finalScores || {};
        const breakdown = document.createElement('div');
        breakdown.className = 'edt-score-breakdown';

        const cells = [
            { label: 'Evidence Tagging',    val: scores.evidence,    max: _config.scoring ? _config.scoring.evidence : 20 },
            { label: 'Stakeholder Depth',   val: scores.stakeholder, max: _config.scoring ? _config.scoring.stakeholder : 20 },
            { label: 'Framework Analysis',  val: null,               max: _config.scoring ? _config.scoring.framework : 40 },
            { label: 'Code Conflict',        val: scores.codeConflict, max: _config.scoring ? _config.scoring.codeConflict : 20 },
        ];

        cells.forEach(cell => {
            const c = document.createElement('div');
            c.className = 'edt-score-cell' + (cell.val === null ? ' edt-pending' : '');
            c.innerHTML =
                '<div class="edt-score-cell-label">' + _escHtml(cell.label) + '</div>' +
                (cell.val !== null
                    ? '<div class="edt-score-cell-value">' + cell.val + '<span class="edt-score-cell-max"> / ' + cell.max + '</span></div>'
                    : '<div class="edt-score-cell-value">Pending Review</div>') +
                (cell.val === null ? '<div class="edt-score-cell-max">Instructor graded</div>' : '');
            breakdown.appendChild(c);
        });

        screen.appendChild(breakdown);

        const note = document.createElement('p');
        note.style.cssText = 'font-size:0.78rem;color:var(--edt-text-muted);font-family:var(--edt-mono);max-width:500px;margin:0 auto;';
        note.textContent = 'There is no single correct decision. The goal is structured, defensible reasoning grounded in professional ethics standards.';
        screen.appendChild(note);

        const backBtn = document.createElement('a');
        backBtn.href = _config.returnUrl || '/houses/divergent/ethics-it/';
        backBtn.className = 'edt-btn-secondary';
        backBtn.style.cssText = 'display:inline-flex;margin-top:28px;';
        backBtn.innerHTML = '<img src="/assets/images/icons/icon-arrow-left.webp" alt=""> Return to Course';
        screen.appendChild(backBtn);

        wrapper.appendChild(screen);

        // Feature 3: Instructor feedback section (async — fetches from Firestore)
        const feedbackSection = document.createElement('section');
        feedbackSection.id = 'edt-instructor-feedback';
        feedbackSection.style.cssText = 'margin-top:36px;padding-top:28px;border-top:1px solid var(--edt-border);';
        feedbackSection.innerHTML =
            '<div style="font-family:var(--edt-mono);font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--edt-text-muted);margin-bottom:16px;">Instructor Review</div>' +
            '<div class="edt-feedback-loading" id="edt-fb-status">Checking for instructor feedback...</div>';
        wrapper.appendChild(feedbackSection);
        _loadInstructorFeedback(feedbackSection);

        // Feature 6: Student self-review section
        wrapper.appendChild(_buildSelfReview());

        // All-paths review: show all framework challenges
        const allPaths = document.createElement('section');
        allPaths.style.cssText = 'margin-top:48px;padding-top:32px;border-top:1px solid var(--edt-border);';
        allPaths.innerHTML = '<div style="font-family:var(--edt-mono);font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--edt-text-muted);margin-bottom:20px;">All Decision Paths -- Reference</div>';

        (_config.decisions || []).forEach(d => {
            const ch = _config.frameworkChallenges && _config.frameworkChallenges[d.id];
            if (!ch) return;

            const block = document.createElement('details');
            block.style.cssText = 'margin-bottom:12px;background:var(--edt-bg-card);border:1px solid var(--edt-border);border-radius:var(--edt-radius);';
            if (d.id === _state.decisionId) {
                block.open = true;
                block.style.borderColor = 'var(--edt-primary-border)';
            }

            const sum = document.createElement('summary');
            sum.style.cssText = 'padding:14px 18px;font-size:0.82rem;cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;';
            if (d.id === _state.decisionId) {
                sum.innerHTML = '<span style="font-family:var(--edt-mono);font-size:0.6rem;color:var(--edt-primary);border:1px solid var(--edt-primary-border);padding:2px 8px;border-radius:3px;flex-shrink:0;">YOUR CHOICE</span>';
            }
            const txt = document.createElement('span');
            txt.textContent = d.text;
            sum.appendChild(txt);
            block.appendChild(sum);

            const detail = document.createElement('div');
            detail.style.cssText = 'padding:0 18px 18px;border-top:1px solid var(--edt-border);';
            detail.innerHTML =
                '<div style="margin-top:14px;font-size:0.78rem;color:var(--edt-text-sec);line-height:1.6;margin-bottom:10px;"><strong style="color:var(--edt-success);font-family:var(--edt-mono);font-size:0.62rem;display:block;margin-bottom:4px;">SUPPORTING ANALYSIS</strong>' + _escHtml(ch.supporting) + '</div>' +
                '<div style="font-size:0.78rem;color:var(--edt-text-sec);line-height:1.6;margin-bottom:10px;"><strong style="color:var(--edt-danger);font-family:var(--edt-mono);font-size:0.62rem;display:block;margin-bottom:4px;">CHALLENGING ANALYSIS</strong>' + _escHtml(ch.challenging) + '</div>' +
                '<div style="font-size:0.78rem;color:var(--edt-text-sec);line-height:1.6;"><strong style="color:var(--edt-amber);font-family:var(--edt-mono);font-size:0.62rem;display:block;margin-bottom:4px;">INCOMPLETE REASONING NOTICE</strong>' + _escHtml(ch.incomplete) + '</div>';

            // Feature 6: for the student's chosen path, show their response directly below the challenge
            if (d.id === _state.decisionId && _state.frameworkResponse) {
                const selfResp = document.createElement('div');
                selfResp.className = 'edt-self-response-box';
                selfResp.innerHTML =
                    '<div class="edt-self-response-label">YOUR RESPONSE</div>' +
                    '<div class="edt-self-response-text">' + _escHtml(_state.frameworkResponse) + '</div>';
                detail.appendChild(selfResp);
            }

            block.appendChild(detail);

            allPaths.appendChild(block);
        });

        wrapper.appendChild(allPaths);

        // Feature 5: Peer Perspectives section (renders async after checking lab config flag)
        const peerSection = document.createElement('section');
        peerSection.id = 'edt-peer-perspectives';
        wrapper.appendChild(peerSection);
        _loadPeerPerspectives(peerSection);

        return wrapper;
    }

    // ── Feature 3: Load Instructor Feedback ───────────────────

    /**
     * Fetches the student's own submission doc from Firestore and displays
     * framework score, instructor feedback, and final total if graded.
     * Non-blocking — falls back gracefully if Firestore is unavailable.
     *
     * @param {HTMLElement} section - The section element to populate
     */
    async function _loadInstructorFeedback(section) {
        const statusEl = document.getElementById('edt-fb-status');

        try {
            // Resolve Firebase Firestore
            let db = null;

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                db = firebase.firestore();
            } else if (typeof firebase !== 'undefined') {
                try {
                    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    db = getFirestore(firebase.app());
                } catch (e) {
                    console.warn('[EDT] Could not load firestore module:', e.message);
                }
            }

            if (!db) {
                if (statusEl) statusEl.textContent = 'Feedback unavailable in offline mode.';
                return;
            }

            // Resolve current user UID
            let uid = null;
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
                uid = firebase.auth().currentUser.uid;
            } else if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.uid) {
                uid = FirebaseAuth.uid();
            }

            if (!uid) {
                if (statusEl) statusEl.textContent = 'Sign in to see instructor feedback.';
                return;
            }

            const docId = _config.id + '_' + uid;
            let docData = null;

            // Support both compat and modular SDK shapes
            if (typeof db.doc === 'function') {
                // Modular Firestore
                const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const snap = await getDoc(doc(db, 'edt_submissions', docId));
                if (snap.exists()) docData = snap.data();
            } else {
                // Compat Firestore
                const snap = await db.doc('edt_submissions/' + docId).get();
                if (snap.exists) docData = snap.data();
            }

            if (!docData) {
                if (statusEl) statusEl.textContent = 'No submission record found.';
                return;
            }

            if (docData.frameworkGraded === true) {
                // Render graded feedback
                const fwScore  = docData.frameworkScore != null ? docData.frameworkScore : '--';
                const fbText   = docData.frameworkFeedback || '(no written feedback)';
                const fwMax    = _config.scoring ? _config.scoring.framework : 40;
                const total    = docData.finalTotal != null ? docData.finalTotal : '--';
                const totalMax = (_config.scoring ? (_config.scoring.evidence + _config.scoring.stakeholder + _config.scoring.framework + _config.scoring.codeConflict) : 100);

                const feedbackCard = document.createElement('div');
                feedbackCard.className = 'edt-feedback-card';
                feedbackCard.innerHTML =
                    '<div class="edt-feedback-header">' +
                        '<img src="/assets/images/icons/icon-check.webp" alt="" style="width:14px;height:14px;"> Graded' +
                    '</div>' +
                    '<div class="edt-feedback-scores">' +
                        '<span class="edt-feedback-score-item">Framework: <strong>' + fwScore + ' / ' + fwMax + '</strong></span>' +
                        '<span class="edt-feedback-score-item edt-score-total">Final Total: <strong>' + total + ' / ' + totalMax + '</strong></span>' +
                    '</div>' +
                    '<div class="edt-feedback-label">Instructor Feedback</div>' +
                    '<div class="edt-feedback-text">' + _escHtml(fbText) + '</div>';

                // Remove loading message and inject card
                if (statusEl) statusEl.remove();
                section.appendChild(feedbackCard);

            } else {
                if (statusEl) {
                    statusEl.className = 'edt-feedback-pending';
                    statusEl.innerHTML =
                        '<img src="/assets/images/icons/icon-radar.webp" alt="" style="width:12px;height:12px;vertical-align:middle;margin-right:6px;"> ' +
                        'Awaiting instructor review.';
                }
            }

        } catch (err) {
            console.warn('[EDT] Could not load instructor feedback:', err.message);
            if (statusEl) statusEl.textContent = 'Could not load feedback. Try refreshing the page.';
        }
    }

    // ── Feature 5: Load Peer Perspectives ────────────────────

    /**
     * Checks the lab config doc for peerViewEnabled flag.
     * If enabled, loads anonymized framework responses from other students.
     * Displays up to 5 responses grouped by decision.
     * Does NOT reveal UIDs or names -- Analyst A/B/C labels only.
     *
     * @param {HTMLElement} section - Container to render into
     */
    async function _loadPeerPerspectives(section) {
        try {
            let db = null;

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                db = firebase.firestore();
            } else if (typeof firebase !== 'undefined') {
                try {
                    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    db = getFirestore(firebase.app());
                } catch (e) { /* no firestore available */ }
            }

            if (!db) return;

            // Check peerViewEnabled on the lab config doc
            let configData = null;
            try {
                if (typeof db.doc === 'function') {
                    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    const snap = await getDoc(doc(db, 'edt_lab_config', _config.id));
                    if (snap.exists()) configData = snap.data();
                } else {
                    const snap = await db.doc('edt_lab_config/' + _config.id).get();
                    if (snap.exists) configData = snap.data();
                }
            } catch (e) {
                console.warn('[EDT] Could not read lab config:', e.message);
                return;
            }

            if (!configData || configData.peerViewEnabled !== true) {
                // Peer view not enabled -- render nothing
                return;
            }

            // Resolve current user UID to exclude self
            let uid = null;
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
                uid = firebase.auth().currentUser.uid;
            } else if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.uid) {
                uid = FirebaseAuth.uid();
            }

            // Query edt_submissions for this labId
            let allDocs = [];
            try {
                if (typeof db.collection === 'function' && typeof db.collection('x').where !== 'undefined') {
                    // Compat SDK
                    const snap = await db.collection('edt_submissions')
                        .where('labId', '==', _config.id)
                        .limit(50)
                        .get();
                    snap.forEach(d => { if (d.data().uid !== uid) allDocs.push(d.data()); });
                } else {
                    // Modular SDK
                    const { collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                    const q = query(collection(db, 'edt_submissions'), where('labId', '==', _config.id), limit(50));
                    const snap = await getDocs(q);
                    snap.forEach(d => { if (d.data().uid !== uid) allDocs.push(d.data()); });
                }
            } catch (e) {
                console.warn('[EDT] Peer query failed:', e.message);
                return;
            }

            if (allDocs.length === 0) return;

            // Randomly sample up to 5
            const shuffled = allDocs.sort(() => Math.random() - 0.5).slice(0, 5);

            // Render section
            section.style.cssText = 'margin-top:48px;padding-top:32px;border-top:1px solid var(--edt-border);';

            const heading = document.createElement('div');
            heading.style.cssText = 'font-family:var(--edt-mono);font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--edt-text-muted);margin-bottom:20px;';
            heading.textContent = 'Peer Perspectives';
            section.appendChild(heading);

            const note = document.createElement('div');
            note.style.cssText = 'font-size:0.74rem;color:var(--edt-text-sec);margin-bottom:24px;line-height:1.5;';
            note.textContent = 'A sample of how other analysts in your class approached this case. Identities are anonymized.';
            section.appendChild(note);

            // Alphabet labels for analysts
            const LABELS = ['Analyst A', 'Analyst B', 'Analyst C', 'Analyst D', 'Analyst E'];

            shuffled.forEach((peer, i) => {
                if (!peer.frameworkResponse) return;

                // Find the decision text from config
                const decText = (_config.decisions || []).find(d => d.id === peer.decisionId);
                const decLabel = decText ? decText.text : peer.decisionId;

                const card = document.createElement('div');
                card.className = 'edt-peer-card';

                card.innerHTML =
                    '<div class="edt-peer-header">' +
                        '<span class="edt-peer-label">' + _escHtml(LABELS[i] || ('Analyst ' + (i + 1))) + '</span>' +
                        '<span class="edt-peer-decision">chose: <em>' + _escHtml(decLabel) + '</em></span>' +
                    '</div>' +
                    '<div class="edt-peer-response">' + _escHtml(peer.frameworkResponse) + '</div>';

                section.appendChild(card);
            });

        } catch (err) {
            console.warn('[EDT] Peer perspectives error:', err.message);
            // Fail silently -- peer view is supplemental
        }
    }

    // ── Feature 6: Student Self-Review Block ──────────────────

    /**
     * Builds a section in reflection mode showing the student's own
     * framework response and code conflict response, labeled "YOUR RESPONSE".
     * Positioned before the all-paths reference so students can compare.
     */
    function _buildSelfReview() {
        const section = document.createElement('section');
        section.className = 'edt-self-review-section';
        section.style.cssText = 'margin-top:40px;padding-top:32px;border-top:1px solid var(--edt-border);';

        const heading = document.createElement('div');
        heading.style.cssText = 'font-family:var(--edt-mono);font-size:0.68rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--edt-text-muted);margin-bottom:20px;';
        heading.textContent = 'Your Responses -- Review';
        section.appendChild(heading);

        // Framework response block
        if (_state.frameworkResponse) {
            const fwBlock = document.createElement('div');
            fwBlock.style.cssText = 'margin-bottom:24px;';
            fwBlock.innerHTML =
                '<div style="font-family:var(--edt-mono);font-size:0.62rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--edt-text-muted);margin-bottom:10px;">Phase 4 -- Framework Analysis Response</div>';

            const fwBox = document.createElement('div');
            fwBox.className = 'edt-self-response-box';
            fwBox.innerHTML =
                '<div class="edt-self-response-label">YOUR RESPONSE</div>' +
                '<div class="edt-self-response-text">' + _escHtml(_state.frameworkResponse) + '</div>';
            fwBlock.appendChild(fwBox);
            section.appendChild(fwBlock);
        }

        // Code conflict response block
        if (_state.codeConflictResponse) {
            const ccBlock = document.createElement('div');
            ccBlock.style.cssText = 'margin-bottom:24px;';
            ccBlock.innerHTML =
                '<div style="font-family:var(--edt-mono);font-size:0.62rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--edt-text-muted);margin-bottom:10px;">Phase 5 -- Code Conflict Resolution Response</div>';

            const ccBox = document.createElement('div');
            ccBox.className = 'edt-self-response-box';
            ccBox.innerHTML =
                '<div class="edt-self-response-label">YOUR RESPONSE</div>' +
                '<div class="edt-self-response-text">' + _escHtml(_state.codeConflictResponse) + '</div>';
            ccBlock.appendChild(ccBox);
            section.appendChild(ccBlock);
        }

        return section;
    }

    // ── Feature 2: Export Report ───────────────────────────────

    /**
     * Generates a self-contained printable HTML page in a new window.
     * Includes all phases, scores, and instructor feedback (if available).
     * Print-friendly: white background, no dark theme, proper margins.
     * Works offline once the window is open (no CDN dependencies in the output).
     */
    function _exportReport() {
        const scores       = _state.finalScores || {};
        const scoreMax     = _config.scoring || { evidence: 20, stakeholder: 20, framework: 40, codeConflict: 20 };
        const submittedAt  = _state.submittedAt ? new Date(_state.submittedAt).toLocaleString('en-US') : 'Unknown';

        // Resolve display name from FirebaseAuth if available
        let studentName = 'Student';
        try {
            if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
                studentName = firebase.auth().currentUser.displayName || firebase.auth().currentUser.email || 'Student';
            } else if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
                const u = FirebaseAuth.getUser();
                studentName = (u && (u.displayName || u.email)) || 'Student';
            }
        } catch (e) { /* non-critical */ }

        // ── Build evidence table rows ──
        const evRows = Object.entries(_state.evidenceTags || {}).map(([evId, tag]) => {
            return '<tr><td>' + _escHtmlExport(evId) + '</td><td class="tag-' + _escHtmlExport(tag.tag) + '">' + _escHtmlExport(tag.tag) + '</td><td>' + _escHtmlExport(tag.note || '') + '</td></tr>';
        }).join('');

        // ── Build stakeholder list ──
        const stakeList = (_state.stakeholderSelections || []).map(id => {
            const stData = (_config.stakeholders || []).find(s => s.id === id);
            return '<li>' + _escHtmlExport(stData ? stData.name : id) + '</li>';
        }).join('');

        // ── Decision + Framework Challenge ──
        const selDec = (_config.decisions || []).find(d => d.id === _state.decisionId);
        const decText = selDec ? selDec.text : (_state.decisionId || 'Not recorded');
        const challenge = _config.frameworkChallenges && _state.decisionId
            ? _config.frameworkChallenges[_state.decisionId]
            : null;

        const challengeHtml = challenge
            ? '<div class="challenge-block sup"><strong>Supporting Analysis</strong><p>' + _escHtmlExport(challenge.supporting) + '</p></div>' +
              '<div class="challenge-block cha"><strong>Challenging Analysis</strong><p>' + _escHtmlExport(challenge.challenging) + '</p></div>' +
              '<div class="challenge-block inc"><strong>Incomplete Reasoning Notice</strong><p>' + _escHtmlExport(challenge.incomplete) + '</p></div>'
            : '<p><em>Challenge data not available.</em></p>';

        // ── Code ranking + conflict ──
        const rankRows = (_state.codeRanking || []).map((ref, i) => {
            const prov = (_config.codeProvisions || []).find(p => (p.code + ' ' + p.section) === ref);
            return '<tr><td>' + (i + 1) + '</td><td>' + _escHtmlExport(ref) + '</td><td>' + _escHtmlExport(prov ? prov.text : '') + '</td></tr>';
        }).join('');

        const conflict = _config.codeConflict;
        const conflictHtml = conflict
            ? '<div class="conflict-desc"><strong>' + _escHtmlExport(conflict.provision1) + ' vs. ' + _escHtmlExport(conflict.provision2) + '</strong><p>' + _escHtmlExport(conflict.conflictDescription) + '</p></div>'
            : '';

        // ── Score rows ──
        const frameworkGraded = scores.framework != null;
        const total = frameworkGraded
            ? ((scores.evidence || 0) + (scores.stakeholder || 0) + (scores.framework || 0) + (scores.codeConflict || 0))
            : null;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Case Room Report -- ${_escHtmlExport(_config.title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #111;
    background: #fff;
    max-width: 860px;
    margin: 0 auto;
    padding: 40px 32px;
    font-size: 14px;
    line-height: 1.65;
  }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #ccc; }
  h3 { font-size: 13px; margin: 18px 0 6px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.06em; color: #444; }
  .meta { font-size: 12px; color: #555; margin-bottom: 24px; font-family: monospace; }
  .meta span { margin-right: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
  th { text-align: left; background: #f4f4f4; padding: 6px 10px; font-family: monospace; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #ddd; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  .tag-relevant   { color: #1a7a30; font-weight: bold; }
  .tag-irrelevant { color: #888; }
  .tag-contested  { color: #c06010; font-weight: bold; }
  .challenge-block { padding: 12px 14px; margin-bottom: 10px; border-left: 3px solid #ccc; background: #f9f9f9; }
  .challenge-block.sup { border-color: #2a8a40; }
  .challenge-block.cha { border-color: #c03030; }
  .challenge-block.inc { border-color: #c07020; }
  .response-box { background: #f2f8ff; border: 1px solid #c0d4e8; border-left: 4px solid #1a6090; padding: 14px 16px; white-space: pre-wrap; font-family: Georgia, serif; font-size: 13.5px; line-height: 1.7; margin-top: 10px; }
  .response-label { font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #1a6090; margin-bottom: 6px; font-weight: bold; }
  .score-table td:first-child { font-weight: bold; width: 200px; }
  .score-table td:last-child { font-family: monospace; font-weight: bold; font-size: 15px; }
  .score-pending { color: #aaa; font-style: italic; }
  .feedback-box { background: #fffbe8; border: 1px solid #e0c060; padding: 14px 16px; margin-top: 10px; white-space: pre-wrap; font-size: 13.5px; }
  .conflict-desc { background: #fff4f0; border-left: 3px solid #c05030; padding: 12px 14px; margin-bottom: 14px; }
  ul { margin: 6px 0 12px 20px; }
  @media print {
    body { padding: 20px 16px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<h1>${_escHtmlExport(_config.title)}</h1>
<div class="meta">
  <span>Student: ${_escHtmlExport(studentName)}</span>
  <span>Lab ID: ${_escHtmlExport(_config.id)}</span>
  <span>Submitted: ${_escHtmlExport(submittedAt)}</span>
  <span>Course: ${_escHtmlExport(_config.course || '')}</span>
</div>

<h2>Phase 2 -- Evidence Tagging</h2>
<table>
  <thead><tr><th>Artifact</th><th>Tag</th><th>Explanation</th></tr></thead>
  <tbody>${evRows || '<tr><td colspan="3">No evidence tags recorded.</td></tr>'}</tbody>
</table>

<h2>Phase 3 -- Stakeholders + Decision</h2>
<h3>Stakeholders Selected</h3>
<ul>${stakeList || '<li>None recorded.</li>'}</ul>
<h3>Decision Chosen</h3>
<p><strong>${_escHtmlExport(decText)}</strong></p>

<h2>Phase 4 -- Framework Challenge + Response</h2>
<h3>Challenge Received</h3>
${challengeHtml}
<h3>Your Response</h3>
<div class="response-label">YOUR FRAMEWORK ANALYSIS</div>
<div class="response-box">${_escHtmlExport(_state.frameworkResponse || '')}</div>

<h2>Phase 5 -- Code Conflict</h2>
<h3>Provision Ranking</h3>
<table>
  <thead><tr><th>Rank</th><th>Reference</th><th>Text</th></tr></thead>
  <tbody>${rankRows || '<tr><td colspan="3">No ranking recorded.</td></tr>'}</tbody>
</table>
${conflictHtml}
<h3>Conflict Resolution Response</h3>
<div class="response-label">YOUR RESPONSE</div>
<div class="response-box">${_escHtmlExport(_state.codeConflictResponse || '')}</div>

<h2>Scores</h2>
<table class="score-table">
  <tr><td>Evidence Tagging</td><td>${scores.evidence != null ? scores.evidence + ' / ' + scoreMax.evidence : '<span class="score-pending">Pending</span>'}</td></tr>
  <tr><td>Stakeholder Depth</td><td>${scores.stakeholder != null ? scores.stakeholder + ' / ' + scoreMax.stakeholder : '<span class="score-pending">Pending</span>'}</td></tr>
  <tr><td>Framework Analysis</td><td>${scores.framework != null ? scores.framework + ' / ' + scoreMax.framework : '<span class="score-pending">Pending instructor review</span>'}</td></tr>
  <tr><td>Code Conflict</td><td>${scores.codeConflict != null ? scores.codeConflict + ' / ' + scoreMax.codeConflict : '<span class="score-pending">Pending</span>'}</td></tr>
  ${total != null ? '<tr><td><strong>Final Total</strong></td><td><strong>' + total + ' / ' + (scoreMax.evidence + scoreMax.stakeholder + scoreMax.framework + scoreMax.codeConflict) + '</strong></td></tr>' : ''}
</table>

${scores.framework != null && _state.instructorFeedback
    ? '<h2>Instructor Feedback</h2><div class="feedback-box">' + _escHtmlExport(_state.instructorFeedback) + '</div>'
    : ''}

<p style="font-size:11px;color:#aaa;margin-top:40px;font-family:monospace;">Generated by Hexworth Prime Case Room -- ${new Date().toLocaleString('en-US')}</p>
</body>
</html>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(html);
            win.document.close();
            win.focus();
        } else {
            alert('Pop-up was blocked. Allow pop-ups for this site to export the report.');
        }
    }

    /**
     * HTML-escape helper used exclusively for _exportReport output.
     * Separate from _escHtml to avoid mingling DOM-context escaping with
     * raw HTML string generation for the export window.
     */
    function _escHtmlExport(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ── Reset Lab ──────────────────────────────────────────

    async function _resetLab() {
        // Two-click confirmation
        const btn = _root.querySelector('.edt-reset-btn');
        if (!btn) return;

        if (!btn.dataset.confirming) {
            btn.dataset.confirming = '1';
            btn.innerHTML = '<img src="/assets/images/icons/icon-radar.webp" alt=""> Confirm Reset?';
            btn.classList.add('edt-reset-confirming');
            // Auto-cancel after 4 seconds
            setTimeout(() => {
                if (btn.dataset.confirming) {
                    btn.dataset.confirming = '';
                    btn.innerHTML = '<img src="/assets/images/icons/icon-radar.webp" alt=""> Reset Lab';
                    btn.classList.remove('edt-reset-confirming');
                }
            }, 4000);
            return;
        }

        btn.disabled = true;
        btn.innerHTML = 'Resetting...';

        try {
            // Call Cloud Function to delete Firestore submission + increment reset counter
            const result = await _callFunction('resetEDTSubmission', { labId: _config.id });

            // Clear localStorage state
            try {
                localStorage.removeItem(_storageKey());
            } catch (e) { /* non-critical */ }

            // Reload the page — engine will start fresh from Phase 1
            window.location.reload();

        } catch (err) {
            // Mid-lab reset case: no submission exists yet (student hasn't
            // clicked Submit), so resetEDTSubmission CF throws not-found.
            // Treat as success — clear local in-progress state and reload.
            // The 5-reset cap is intentionally NOT incremented for mid-lab
            // clears; only post-submit resets count toward it.
            // Modular Firebase SDK uses bare error codes (no "functions/"
            // prefix). Belt-and-suspenders message match handles the rare
            // case where the SDK shape changes.
            if (err && (err.code === 'not-found' ||
                        (err.message || '').includes('No submission found'))) {
                console.info('[EDT] No submission existed; clearing localStorage only.');
                try { localStorage.removeItem(_storageKey()); } catch (e) { /* non-critical */ }
                window.location.reload();
                return;
            }

            console.error('[EDT] Reset failed:', err);
            btn.disabled = false;
            btn.dataset.confirming = '';
            btn.classList.remove('edt-reset-confirming');

            if (err && err.code === 'resource-exhausted') {
                btn.innerHTML = 'Max resets reached';
                btn.disabled = true;
            } else {
                btn.innerHTML = '<img src="/assets/images/icons/icon-radar.webp" alt=""> Reset Lab';
                // Show error briefly
                const banner = _root.querySelector('.edt-reflection-banner');
                if (banner) {
                    const orig = banner.innerHTML;
                    banner.innerHTML = '<img src="/assets/images/icons/icon-warning.webp" alt=""> Reset failed: ' + _escHtml(err.message || 'Unknown error');
                    banner.classList.add('edt-banner-error');
                    setTimeout(() => {
                        banner.innerHTML = orig;
                        banner.classList.remove('edt-banner-error');
                    }, 4000);
                }
            }
        }
    }

    // ── Firebase helper ─────────────────────────────────────

    async function _callFunction(name, data) {
        // Use FirebaseAuth.callFunction which is already wired to the modular SDK
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.callFunction) {
            const result = await FirebaseAuth.callFunction(name, data);
            return result.data;
        }
        // Fallback: compat SDK (unlikely on EDT pages but safe)
        if (typeof firebase !== 'undefined' && firebase.functions) {
            const fn = firebase.functions().httpsCallable(name);
            const result = await fn(data);
            return result.data;
        }
        throw new Error('Firebase not available. Sign in to continue.');
    }

    // ── Utility helpers ────────────────────────────────────

    function _sectionHeader(icon, title, desc) {
        const div = document.createElement('div');
        div.className = 'edt-section-header';
        div.innerHTML =
            '<img src="/assets/images/icons/' + icon + '" alt="">' +
            '<div>' +
                '<div class="edt-section-title">' + _escHtml(title) + '</div>' +
                (desc ? '<div class="edt-section-desc">' + _escHtml(desc) + '</div>' : '') +
            '</div>';
        return div;
    }

    function _fragToDiv(frag) {
        const div = document.createElement('div');
        div.appendChild(frag);
        return div;
    }

    function _escHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function _escAttr(str) {
        return _escHtml(str);
    }

    // ── Public API ─────────────────────────────────────────

    /**
     * EDTEngine.init(config)
     * Entry point. Call once from the lab's index.html after loading
     * EDTEngine.js and config.js.
     *
     * @param {Object} config - Lab configuration (see ETHLabConfig schema)
     */
    function init(config) {
        _config = config;
        _root   = document.getElementById('caseroom');

        if (!_root) {
            console.error('[EDT] #caseroom element not found.');
            return;
        }

        // Load or initialize state
        const saved = _load();
        if (saved && saved.phase) {
            _state = saved;
        } else {
            _state = _defaultState();
        }

        // If previously submitted, go straight to reflection
        // (state.submitted persists in localStorage)

        // Set document title
        document.title = config.title + ' // Case Room // Hexworth Prime';

        _render();
    }

    return { init };

})();
