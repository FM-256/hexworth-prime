/**
 * CaseRoomGrading.js - Instructor Grading Panel for Case Room (EDT) Submissions
 *
 * Standalone dashboard panel for instructors to grade EDT lab submissions.
 * Loads ungraded submissions from edt_submissions where frameworkGraded == false,
 * for classes owned by the current handler.
 *
 * Usage:
 *   CaseRoomGrading.init(containerElement);
 *
 * Dependencies:
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - Firebase SDK (firebase-app, firebase-firestore, firebase-functions)
 *
 * Panel aesthetic: matches InstructorDashboard (dark bg, cyan accent, mono labels).
 *
 * @version 1.0.0
 */

const CaseRoomGrading = (function () {
    'use strict';

    // ── State ──────────────────────────────────────────────────
    let _container   = null;
    let _submissions = [];      // ungraded submission docs
    let _selected    = null;    // currently open submission object
    let _rubricState = {};      // { cb1, cb2, cb3, cb4 } checkbox booleans

    // ── Public API ─────────────────────────────────────────────

    async function init(containerEl) {
        _container = containerEl;

        if (!document.getElementById('crg-styles')) {
            _injectStyles();
        }

        _renderShell();
        await _loadSubmissions();
    }

    // ── Shell Layout ───────────────────────────────────────────

    function _renderShell() {
        _container.innerHTML = `
            <div class="crg-layout">
                <div class="crg-list-panel" id="crgListPanel">
                    <div class="crg-panel-header">
                        <div class="crg-panel-title">
                            <img src="/assets/images/icons/icon-list.webp" alt="" class="crg-title-icon">
                            Ungraded Submissions
                        </div>
                        <button class="crg-refresh-btn" id="crgRefreshBtn" title="Refresh list">
                            <img src="/assets/images/icons/icon-radar.webp" alt="Refresh">
                        </button>
                    </div>
                    <div class="crg-submission-list" id="crgSubmissionList">
                        <div class="crg-loading">Loading submissions...</div>
                    </div>
                    <div class="crg-aggregates-link">
                        <button class="crg-agg-btn" id="crgAggBtn">
                            <img src="/assets/images/icons/icon-table.webp" alt=""> View Class Aggregates
                        </button>
                    </div>
                </div>
                <div class="crg-grading-panel" id="crgGradingPanel">
                    <div class="crg-empty-grading">
                        <img src="/assets/images/icons/icon-info.webp" alt="" class="crg-empty-icon">
                        <div class="crg-empty-text">Select a submission to grade</div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('crgRefreshBtn').addEventListener('click', _loadSubmissions);
        document.getElementById('crgAggBtn').addEventListener('click', _openAggregates);
    }

    // ── Load Submissions ───────────────────────────────────────

    async function _loadSubmissions() {
        const listEl = document.getElementById('crgSubmissionList');
        if (!listEl) return;

        listEl.innerHTML = '<div class="crg-loading">Loading...</div>';

        try {
            // Call the Cloud Function to get ungraded submissions for this handler's classes
            const result = await _callFunction('getUngradedEDTSubmissions', {});
            _submissions = result.submissions || [];
            _renderSubmissionList();
        } catch (err) {
            console.error('[CaseRoomGrading] Load error:', err);
            listEl.innerHTML = '<div class="crg-error">Failed to load submissions. ' + _escHtml(err.message || 'Check your connection.') + '</div>';
        }
    }

    // ── Submission List ────────────────────────────────────────

    function _renderSubmissionList() {
        const listEl = document.getElementById('crgSubmissionList');
        if (!listEl) return;

        if (_submissions.length === 0) {
            listEl.innerHTML = '<div class="crg-empty-list">No ungraded submissions.</div>';
            return;
        }

        listEl.innerHTML = '';

        _submissions.forEach(sub => {
            const item = document.createElement('div');
            item.className = 'crg-submission-item' + (_selected && _selected.docId === sub.docId ? ' crg-selected' : '');
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');

            // Format date safely
            const dateStr = sub.submittedAt
                ? new Date(sub.submittedAt._seconds ? sub.submittedAt._seconds * 1000 : sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Unknown date';

            item.innerHTML =
                '<div class="crg-sub-callsign">' + _escHtml(sub.callsign || 'Anonymous') + '</div>' +
                '<div class="crg-sub-meta">' +
                    '<span class="crg-sub-lab">' + _escHtml(sub.labId) + '</span>' +
                    '<span class="crg-sub-date">' + _escHtml(dateStr) + '</span>' +
                '</div>' +
                '<div class="crg-sub-scores">' +
                    'Ev: <strong>' + (sub.autoScores ? sub.autoScores.evidence : '--') + '</strong> ' +
                    'St: <strong>' + (sub.autoScores ? sub.autoScores.stakeholder : '--') + '</strong> ' +
                    'Code: <strong>' + (sub.autoScores ? sub.autoScores.codeConflict : '--') + '</strong>' +
                '</div>';

            item.addEventListener('click', () => _selectSubmission(sub));
            item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') _selectSubmission(sub); });

            listEl.appendChild(item);
        });
    }

    // ── Select Submission for Grading ──────────────────────────

    function _selectSubmission(sub) {
        _selected   = sub;
        _rubricState = { cb1: false, cb2: false, cb3: false, cb4: false };

        // Highlight selected item in list
        document.querySelectorAll('.crg-submission-item').forEach(el => el.classList.remove('crg-selected'));
        _renderSubmissionList();

        const panel = document.getElementById('crgGradingPanel');
        if (!panel) return;

        panel.innerHTML = '';
        panel.appendChild(_buildGradingView(sub));
    }

    // ── Grading View ───────────────────────────────────────────

    function _buildGradingView(sub) {
        const wrap = document.createElement('div');
        wrap.className = 'crg-grading-view';

        // ── Header ──
        const hdr = document.createElement('div');
        hdr.className = 'crg-grading-header';
        const dateStr = sub.submittedAt
            ? new Date(sub.submittedAt._seconds ? sub.submittedAt._seconds * 1000 : sub.submittedAt).toLocaleString('en-US')
            : 'Unknown';

        hdr.innerHTML =
            '<div class="crg-grading-title">' + _escHtml(sub.callsign || 'Anonymous') + '</div>' +
            '<div class="crg-grading-meta">' +
                '<span class="crg-meta-chip">Lab: ' + _escHtml(sub.labId) + '</span>' +
                '<span class="crg-meta-chip">Submitted: ' + _escHtml(dateStr) + '</span>' +
                '<span class="crg-meta-chip">Doc: ' + _escHtml(sub.docId || '') + '</span>' +
                (sub.resetCount ? '<span class="crg-meta-chip crg-chip-warn">Resets: ' + sub.resetCount + '</span>' : '') +
            '</div>';
        wrap.appendChild(hdr);

        // ── Phase 2: Evidence Tags ──
        wrap.appendChild(_buildSection('icon-database.webp', 'Phase 2 -- Evidence Tags',
            _buildEvidenceTable(sub.evidenceTags || {})));

        // ── Phase 3: Stakeholders + Decision ──
        wrap.appendChild(_buildSection('icon-user.webp', 'Phase 3 -- Stakeholders + Decision',
            _buildStakeholderDecisionBlock(sub)));

        // ── Phase 4: Framework Challenge + Response ──
        wrap.appendChild(_buildSection('icon-code.webp', 'Phase 4 -- Framework Challenge',
            _buildFrameworkBlock(sub)));

        // ── Phase 5: Code Conflict ──
        wrap.appendChild(_buildSection('icon-lock.webp', 'Phase 5 -- Code Conflict',
            _buildCodeConflictBlock(sub)));

        // ── Auto Scores Summary ──
        wrap.appendChild(_buildAutoScoresSummary(sub));

        // ── Grading Rubric ──
        wrap.appendChild(_buildRubric());

        // ── Framework Score Slider ──
        wrap.appendChild(_buildScoreControls());

        // ── Instructor Feedback ──
        wrap.appendChild(_buildFeedbackArea());

        // ── Submit Grade ──
        wrap.appendChild(_buildSubmitRow(sub));

        return wrap;
    }

    function _buildSection(icon, title, content) {
        const sec = document.createElement('div');
        sec.className = 'crg-section';

        const hdr = document.createElement('div');
        hdr.className = 'crg-section-header';
        hdr.innerHTML =
            '<img src="/assets/images/icons/' + _escHtml(icon) + '" alt="" class="crg-section-icon">' +
            '<span class="crg-section-title">' + _escHtml(title) + '</span>';
        sec.appendChild(hdr);

        const body = document.createElement('div');
        body.className = 'crg-section-body';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement || content instanceof DocumentFragment) {
            body.appendChild(content);
        }
        sec.appendChild(body);

        return sec;
    }

    // ── Evidence Table ─────────────────────────────────────────

    function _buildEvidenceTable(evidenceTags) {
        const frag = document.createDocumentFragment();

        if (!evidenceTags || Object.keys(evidenceTags).length === 0) {
            const empty = document.createElement('div');
            empty.className = 'crg-empty-section';
            empty.textContent = 'No evidence tags recorded.';
            frag.appendChild(empty);
            return frag;
        }

        const table = document.createElement('table');
        table.className = 'crg-ev-table';

        const thead = document.createElement('thead');
        thead.innerHTML =
            '<tr>' +
                '<th>Artifact ID</th>' +
                '<th>Tag</th>' +
                '<th>Explanation</th>' +
            '</tr>';
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        for (const [evId, tagData] of Object.entries(evidenceTags)) {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td class="crg-ev-id">' + _escHtml(evId) + '</td>' +
                '<td><span class="crg-tag-badge crg-tag-' + _escHtml(tagData.tag || 'unknown') + '">' + _escHtml(tagData.tag || 'none') + '</span></td>' +
                '<td class="crg-ev-note">' + _escHtml(tagData.note || '---') + '</td>';
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        frag.appendChild(table);
        return frag;
    }

    // ── Stakeholder + Decision Block ───────────────────────────

    function _buildStakeholderDecisionBlock(sub) {
        const frag = document.createDocumentFragment();

        const stList = document.createElement('div');
        stList.className = 'crg-inline-list';
        stList.innerHTML = '<span class="crg-field-label">Stakeholders selected: </span>';
        const sels = sub.stakeholderSelections || [];
        stList.innerHTML +=
            sels.length > 0
            ? sels.map(s => '<span class="crg-chip">' + _escHtml(s) + '</span>').join('')
            : '<span class="crg-empty-val">None</span>';
        frag.appendChild(stList);

        const decisionBlock = document.createElement('div');
        decisionBlock.className = 'crg-decision-block';
        decisionBlock.innerHTML =
            '<span class="crg-field-label">Decision chosen: </span>' +
            '<span class="crg-decision-val">' + _escHtml(sub.decisionId || 'None') + '</span>';
        frag.appendChild(decisionBlock);

        return frag;
    }

    // ── Framework Block ────────────────────────────────────────

    function _buildFrameworkBlock(sub) {
        const frag = document.createDocumentFragment();

        const decisionId = sub.decisionId;

        // Note: we don't have the config here, so we display what we have from the submission.
        // The framework challenge text would require loading the lab config, so we display
        // the challenge ID and the student's response.
        const challengeNote = document.createElement('div');
        challengeNote.className = 'crg-challenge-note';
        challengeNote.innerHTML =
            '<span class="crg-field-label">Challenge received for decision: </span>' +
            '<span class="crg-chip">' + _escHtml(decisionId || 'Unknown') + '</span>';
        frag.appendChild(challengeNote);

        const respLabel = document.createElement('div');
        respLabel.className = 'crg-field-label';
        respLabel.style.marginTop = '12px';
        respLabel.textContent = 'Student framework response:';
        frag.appendChild(respLabel);

        const resp = document.createElement('div');
        resp.className = 'crg-response-block';
        resp.textContent = sub.frameworkResponse || '(no response)';
        frag.appendChild(resp);

        return frag;
    }

    // ── Code Conflict Block ────────────────────────────────────

    function _buildCodeConflictBlock(sub) {
        const frag = document.createDocumentFragment();

        const rankLabel = document.createElement('div');
        rankLabel.className = 'crg-field-label';
        rankLabel.textContent = 'Code provision ranking (1 = highest obligation):';
        frag.appendChild(rankLabel);

        const rankList = document.createElement('ol');
        rankList.className = 'crg-rank-list';
        (sub.codeRanking || []).forEach(ref => {
            const li = document.createElement('li');
            li.textContent = ref;
            rankList.appendChild(li);
        });
        if ((sub.codeRanking || []).length === 0) {
            const li = document.createElement('li');
            li.className = 'crg-empty-val';
            li.textContent = 'No ranking data.';
            rankList.appendChild(li);
        }
        frag.appendChild(rankList);

        const respLabel = document.createElement('div');
        respLabel.className = 'crg-field-label';
        respLabel.style.marginTop = '12px';
        respLabel.textContent = 'Conflict resolution response:';
        frag.appendChild(respLabel);

        const resp = document.createElement('div');
        resp.className = 'crg-response-block';
        resp.textContent = sub.codeConflictResponse || '(no response)';
        frag.appendChild(resp);

        return frag;
    }

    // ── Auto Scores Summary ────────────────────────────────────

    function _buildAutoScoresSummary(sub) {
        const scores = sub.autoScores || {};
        const sec = document.createElement('div');
        sec.className = 'crg-auto-scores';

        sec.innerHTML =
            '<div class="crg-auto-scores-title">Auto-Computed Scores</div>' +
            '<div class="crg-scores-row">' +
                '<div class="crg-score-cell">' +
                    '<div class="crg-score-val">' + (scores.evidence != null ? scores.evidence : '--') + '</div>' +
                    '<div class="crg-score-label">Evidence / 20</div>' +
                '</div>' +
                '<div class="crg-score-cell">' +
                    '<div class="crg-score-val">' + (scores.stakeholder != null ? scores.stakeholder : '--') + '</div>' +
                    '<div class="crg-score-label">Stakeholder / 20</div>' +
                '</div>' +
                '<div class="crg-score-cell">' +
                    '<div class="crg-score-val crg-score-pending">--</div>' +
                    '<div class="crg-score-label">Framework / 40</div>' +
                '</div>' +
                '<div class="crg-score-cell">' +
                    '<div class="crg-score-val">' + (scores.codeConflict != null ? scores.codeConflict : '--') + '</div>' +
                    '<div class="crg-score-label">Code Conflict / 20</div>' +
                '</div>' +
            '</div>';

        return sec;
    }

    // ── Rubric ─────────────────────────────────────────────────

    function _buildRubric() {
        const sec = document.createElement('div');
        sec.className = 'crg-section';

        const hdr = document.createElement('div');
        hdr.className = 'crg-section-header';
        hdr.innerHTML =
            '<img src="/assets/images/icons/icon-check.webp" alt="" class="crg-section-icon">' +
            '<span class="crg-section-title">Framework Response Rubric</span>';
        sec.appendChild(hdr);

        const body = document.createElement('div');
        body.className = 'crg-section-body';

        const rubricItems = [
            { key: 'cb1', label: 'Engages with the specific critique (not generic)' },
            { key: 'cb2', label: 'Uses framework vocabulary correctly (utilitarian, deontological, virtue ethics, or consequentialist)' },
            { key: 'cb3', label: 'Logically consistent with their evidence tags from Phase 2' },
            { key: 'cb4', label: 'Addresses the "incomplete reasoning" dimension from the challenge' }
        ];

        rubricItems.forEach(item => {
            const row = document.createElement('label');
            row.className = 'crg-rubric-row';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = 'crg-' + item.key;
            cb.className = 'crg-rubric-cb';
            cb.checked = _rubricState[item.key] || false;
            cb.addEventListener('change', function () {
                _rubricState[item.key] = this.checked;
            });

            const lbl = document.createElement('span');
            lbl.className = 'crg-rubric-label';
            lbl.textContent = item.label;

            row.appendChild(cb);
            row.appendChild(lbl);
            body.appendChild(row);
        });

        sec.appendChild(body);
        return sec;
    }

    // ── Score Slider ───────────────────────────────────────────

    function _buildScoreControls() {
        const sec = document.createElement('div');
        sec.className = 'crg-section';

        const hdr = document.createElement('div');
        hdr.className = 'crg-section-header';
        hdr.innerHTML =
            '<img src="/assets/images/icons/icon-radar.webp" alt="" class="crg-section-icon">' +
            '<span class="crg-section-title">Framework Score (0 -- 40)</span>';
        sec.appendChild(hdr);

        const body = document.createElement('div');
        body.className = 'crg-section-body';

        const sliderRow = document.createElement('div');
        sliderRow.className = 'crg-slider-row';

        const slider = document.createElement('input');
        slider.type    = 'range';
        slider.id      = 'crgFwScore';
        slider.className = 'crg-score-slider';
        slider.min     = '0';
        slider.max     = '40';
        slider.step    = '1';
        slider.value   = '0';

        const display = document.createElement('span');
        display.className = 'crg-score-display';
        display.id = 'crgFwScoreDisplay';
        display.textContent = '0 / 40';

        slider.addEventListener('input', function () {
            display.textContent = this.value + ' / 40';
        });

        sliderRow.appendChild(slider);
        sliderRow.appendChild(display);
        body.appendChild(sliderRow);

        sec.appendChild(body);
        return sec;
    }

    // ── Instructor Feedback Area ───────────────────────────────

    function _buildFeedbackArea() {
        const sec = document.createElement('div');
        sec.className = 'crg-section';

        const hdr = document.createElement('div');
        hdr.className = 'crg-section-header';
        hdr.innerHTML =
            '<img src="/assets/images/icons/icon-info.webp" alt="" class="crg-section-icon">' +
            '<span class="crg-section-title">Instructor Feedback</span>';
        sec.appendChild(hdr);

        const body = document.createElement('div');
        body.className = 'crg-section-body';

        const lbl = document.createElement('label');
        lbl.htmlFor = 'crgFeedbackText';
        lbl.className = 'crg-field-label';
        lbl.textContent = 'Feedback for student (shown in reflection mode after grading):';
        body.appendChild(lbl);

        const ta = document.createElement('textarea');
        ta.id = 'crgFeedbackText';
        ta.className = 'crg-feedback-ta';
        ta.placeholder = 'Provide specific feedback on the framework response, noting strengths and areas for improvement...';
        ta.maxLength = 2000;
        body.appendChild(ta);

        const charCount = document.createElement('span');
        charCount.className = 'crg-char-count';
        charCount.id = 'crgFbChars';
        charCount.textContent = '0 / 2000';
        ta.addEventListener('input', function () {
            charCount.textContent = this.value.length + ' / 2000';
        });
        body.appendChild(charCount);

        sec.appendChild(body);
        return sec;
    }

    // ── Submit Grade Row ───────────────────────────────────────

    function _buildSubmitRow(sub) {
        const row = document.createElement('div');
        row.className = 'crg-submit-row';

        const statusMsg = document.createElement('div');
        statusMsg.className = 'crg-submit-status';
        statusMsg.id = 'crgSubmitStatus';

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'crg-submit-btn';
        submitBtn.id = 'crgSubmitGradeBtn';
        submitBtn.innerHTML = '<img src="/assets/images/icons/icon-checkmark.webp" alt=""> Submit Grade';

        submitBtn.addEventListener('click', () => _submitGrade(sub, submitBtn, statusMsg));

        row.appendChild(statusMsg);
        row.appendChild(submitBtn);
        return row;
    }

    // ── Submit Grade ───────────────────────────────────────────

    async function _submitGrade(sub, btn, statusEl) {
        const scoreEl    = document.getElementById('crgFwScore');
        const feedbackEl = document.getElementById('crgFeedbackText');

        if (!scoreEl || !feedbackEl) {
            _setStatus(statusEl, 'error', 'UI error: inputs not found.');
            return;
        }

        const frameworkScore  = parseInt(scoreEl.value, 10);
        const feedback        = feedbackEl.value.trim();

        // Basic validation
        if (isNaN(frameworkScore) || frameworkScore < 0 || frameworkScore > 40) {
            _setStatus(statusEl, 'error', 'Framework score must be between 0 and 40.');
            return;
        }

        if (feedback.length === 0) {
            _setStatus(statusEl, 'error', 'Feedback is required before submitting a grade.');
            return;
        }

        // Calculate final total using auto-scores + framework score
        const auto = sub.autoScores || {};
        const evidenceScore    = auto.evidence    != null ? auto.evidence    : 0;
        const stakeholderScore = auto.stakeholder  != null ? auto.stakeholder : 0;
        const codeScore        = auto.codeConflict != null ? auto.codeConflict : 0;
        const finalTotal       = evidenceScore + stakeholderScore + frameworkScore + codeScore;

        btn.disabled = true;
        btn.textContent = 'Submitting...';
        _setStatus(statusEl, '', '');

        try {
            await _callFunction('gradeEDTSubmission', {
                docId:             sub.docId,
                frameworkScore,
                frameworkFeedback: feedback,
                finalTotal
            });

            _setStatus(statusEl, 'success', 'Grade submitted. Final total: ' + finalTotal + ' / 100.');

            // Remove from ungraded list
            _submissions = _submissions.filter(s => s.docId !== sub.docId);
            _selected    = null;
            _renderSubmissionList();

            // Clear grading panel
            const panel = document.getElementById('crgGradingPanel');
            if (panel) {
                panel.innerHTML =
                    '<div class="crg-empty-grading">' +
                        '<img src="/assets/images/icons/icon-checkmark.webp" alt="" class="crg-empty-icon">' +
                        '<div class="crg-empty-text">Grade submitted successfully.</div>' +
                    '</div>';
            }

        } catch (err) {
            console.error('[CaseRoomGrading] Grade submit error:', err);
            btn.disabled = false;
            btn.innerHTML = '<img src="/assets/images/icons/icon-checkmark.webp" alt=""> Submit Grade';
            _setStatus(statusEl, 'error', err.message || 'Failed to submit grade. Try again.');
        }
    }

    // ── Open Aggregates Panel ──────────────────────────────────

    function _openAggregates() {
        if (typeof CaseRoomAggregates !== 'undefined') {
            // Find the parent container and replace with aggregates view
            const back = document.createElement('button');
            back.className = 'crg-back-btn';
            back.innerHTML = '<img src="/assets/images/icons/icon-arrow-left.webp" alt=""> Back to Grading';
            back.addEventListener('click', () => {
                CaseRoomGrading.init(_container);
            });

            _container.innerHTML = '';
            _container.appendChild(back);

            const aggContainer = document.createElement('div');
            _container.appendChild(aggContainer);
            CaseRoomAggregates.init(aggContainer);
        } else {
            console.warn('[CaseRoomGrading] CaseRoomAggregates not loaded.');
        }
    }

    // ── Helpers ────────────────────────────────────────────────

    /**
     * Calls a Firebase Cloud Function using the available SDK pattern.
     * Mirrors the approach used in EDTEngine._doSubmit.
     */
    async function _callFunction(name, data) {
        if (typeof firebase !== 'undefined' && firebase.functions) {
            const fn = firebase.functions().httpsCallable(name);
            const result = await fn(data);
            return result.data;
        } else if (typeof firebase !== 'undefined') {
            const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');
            const fns = getFunctions(firebase.app());
            const fn = httpsCallable(fns, name);
            const result = await fn(data);
            return result.data;
        }
        throw new Error('Firebase not available.');
    }

    function _setStatus(el, type, msg) {
        if (!el) return;
        el.className = 'crg-submit-status' + (type ? ' crg-status-' + type : '');
        el.textContent = msg;
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

    // ── Styles ─────────────────────────────────────────────────

    function _injectStyles() {
        const style = document.createElement('style');
        style.id = 'crg-styles';
        style.textContent = `
            /* CaseRoomGrading component styles */
            /* Uses CSS custom properties from the host page where available */
            .crg-layout {
                display: grid;
                grid-template-columns: 320px 1fr;
                gap: 0;
                height: 100%;
                min-height: 600px;
                background: #0d0f14;
                border: 1px solid #1e2530;
                border-radius: 6px;
                overflow: hidden;
                font-family: 'Inter', 'Segoe UI', sans-serif;
                color: #c8d0dc;
                font-size: 0.86rem;
            }

            /* List panel */
            .crg-list-panel {
                background: #111419;
                border-right: 1px solid #1e2530;
                display: flex;
                flex-direction: column;
            }
            .crg-panel-header {
                padding: 16px 18px 12px;
                border-bottom: 1px solid #1e2530;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .crg-panel-title {
                flex: 1;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
                font-size: 0.7rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: #00cfcf;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .crg-title-icon {
                width: 14px;
                height: 14px;
                opacity: 0.8;
            }
            .crg-refresh-btn {
                background: none;
                border: 1px solid #1e2530;
                border-radius: 4px;
                padding: 4px 6px;
                cursor: pointer;
                color: #666;
                transition: border-color 0.15s, color 0.15s;
            }
            .crg-refresh-btn:hover { border-color: #00cfcf; color: #00cfcf; }
            .crg-refresh-btn img { width: 12px; height: 12px; display: block; }

            .crg-submission-list {
                flex: 1;
                overflow-y: auto;
                padding: 8px;
            }
            .crg-loading { padding: 20px; text-align: center; color: #555; font-size: 0.78rem; }
            .crg-error { padding: 16px; color: #e85c5c; font-size: 0.78rem; }
            .crg-empty-list { padding: 24px 16px; text-align: center; color: #555; font-size: 0.78rem; }

            .crg-submission-item {
                padding: 12px 14px;
                border: 1px solid #1e2530;
                border-radius: 4px;
                margin-bottom: 6px;
                cursor: pointer;
                transition: border-color 0.15s, background 0.15s;
            }
            .crg-submission-item:hover { border-color: #2a3546; background: #14181e; }
            .crg-submission-item.crg-selected { border-color: #00cfcf; background: #0e1a22; }
            .crg-sub-callsign {
                font-weight: 600;
                color: #e2e8f2;
                margin-bottom: 4px;
                font-size: 0.84rem;
            }
            .crg-sub-meta {
                display: flex;
                gap: 8px;
                margin-bottom: 6px;
            }
            .crg-sub-lab, .crg-sub-date {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.68rem;
                color: #556;
                background: #1a1e26;
                padding: 2px 6px;
                border-radius: 3px;
            }
            .crg-sub-scores {
                font-size: 0.72rem;
                color: #667;
            }
            .crg-sub-scores strong { color: #9ab; }

            .crg-aggregates-link {
                padding: 12px;
                border-top: 1px solid #1e2530;
            }
            .crg-agg-btn {
                width: 100%;
                background: #0e1a22;
                border: 1px solid #1e3040;
                border-radius: 4px;
                padding: 8px 12px;
                color: #7ab;
                font-size: 0.76rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
                transition: border-color 0.15s;
            }
            .crg-agg-btn:hover { border-color: #00cfcf; color: #00cfcf; }
            .crg-agg-btn img { width: 13px; height: 13px; }

            /* Grading panel */
            .crg-grading-panel {
                overflow-y: auto;
                padding: 0;
            }
            .crg-empty-grading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                gap: 14px;
                color: #445;
            }
            .crg-empty-icon { width: 32px; height: 32px; opacity: 0.4; }
            .crg-empty-text { font-size: 0.82rem; }

            .crg-grading-view { padding: 24px 28px; }

            .crg-grading-header { margin-bottom: 24px; padding-bottom: 18px; border-bottom: 1px solid #1e2530; }
            .crg-grading-title {
                font-size: 1.1rem;
                font-weight: 700;
                color: #e2e8f2;
                margin-bottom: 8px;
            }
            .crg-grading-meta { display: flex; gap: 8px; flex-wrap: wrap; }
            .crg-meta-chip {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.66rem;
                background: #1a1e26;
                border: 1px solid #2a3040;
                padding: 2px 8px;
                border-radius: 3px;
                color: #889;
            }

            .crg-chip-warn {
                border-color: #8a5a10;
                color: #e0a030;
                background: rgba(138, 90, 16, 0.15);
            }

            /* Sections */
            .crg-section {
                margin-bottom: 28px;
                background: #111419;
                border: 1px solid #1e2530;
                border-radius: 5px;
                overflow: hidden;
            }
            .crg-section-header {
                padding: 10px 16px;
                background: #14181e;
                border-bottom: 1px solid #1e2530;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .crg-section-icon { width: 13px; height: 13px; opacity: 0.7; }
            .crg-section-title {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.68rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: #00cfcf;
            }
            .crg-section-body { padding: 16px; }

            .crg-empty-section { color: #445; font-size: 0.78rem; font-style: italic; }

            /* Evidence table */
            .crg-ev-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.78rem;
            }
            .crg-ev-table th {
                text-align: left;
                padding: 6px 10px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.64rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #556;
                border-bottom: 1px solid #1e2530;
            }
            .crg-ev-table td {
                padding: 8px 10px;
                border-bottom: 1px solid #191d24;
                vertical-align: top;
            }
            .crg-ev-id {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.7rem;
                color: #7ab;
                white-space: nowrap;
            }
            .crg-ev-note { color: #aab; line-height: 1.5; }

            .crg-tag-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 0.66rem;
                font-family: 'JetBrains Mono', monospace;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }
            .crg-tag-relevant   { background: #0e2a18; color: #4caf6a; border: 1px solid #1a4028; }
            .crg-tag-irrelevant { background: #1e1e28; color: #667; border: 1px solid #2a2a38; }
            .crg-tag-contested  { background: #2a1a06; color: #e08a30; border: 1px solid #3a2a10; }
            .crg-tag-unknown    { background: #1e1e28; color: #555; border: 1px solid #2a2a38; }

            /* Inline elements */
            .crg-field-label {
                display: block;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.66rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #556;
                margin-bottom: 8px;
            }
            .crg-chip {
                display: inline-block;
                background: #1a1e26;
                border: 1px solid #2a3040;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 0.72rem;
                color: #9ab;
                margin: 2px;
            }
            .crg-inline-list { margin-bottom: 12px; }
            .crg-decision-block { font-size: 0.82rem; }
            .crg-decision-val { color: #e2e8f2; font-weight: 600; }
            .crg-empty-val { color: #445; font-style: italic; }

            .crg-challenge-note { margin-bottom: 12px; font-size: 0.8rem; }

            .crg-response-block {
                background: #0e1117;
                border: 1px solid #1e2530;
                border-left: 3px solid #00cfcf;
                padding: 14px 16px;
                font-size: 0.82rem;
                line-height: 1.65;
                color: #bcc;
                border-radius: 0 4px 4px 0;
                white-space: pre-wrap;
                word-break: break-word;
            }

            .crg-rank-list {
                margin: 0 0 0 20px;
                padding: 0;
                color: #9ab;
                font-size: 0.78rem;
                line-height: 1.8;
            }

            /* Auto scores */
            .crg-auto-scores {
                background: #0e1117;
                border: 1px solid #1e2530;
                border-radius: 5px;
                padding: 16px 20px;
                margin-bottom: 28px;
            }
            .crg-auto-scores-title {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.66rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: #556;
                margin-bottom: 14px;
            }
            .crg-scores-row {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }
            .crg-score-cell { text-align: center; }
            .crg-score-val {
                font-size: 1.4rem;
                font-weight: 700;
                color: #e2e8f2;
                font-family: 'JetBrains Mono', monospace;
            }
            .crg-score-pending { color: #445 !important; }
            .crg-score-label {
                font-size: 0.66rem;
                color: #556;
                margin-top: 2px;
            }

            /* Rubric */
            .crg-rubric-row {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 8px 0;
                cursor: pointer;
                border-bottom: 1px solid #191d24;
            }
            .crg-rubric-row:last-child { border-bottom: none; }
            .crg-rubric-cb {
                margin-top: 2px;
                width: 16px;
                height: 16px;
                cursor: pointer;
                accent-color: #00cfcf;
                flex-shrink: 0;
            }
            .crg-rubric-label {
                font-size: 0.82rem;
                color: #aab;
                line-height: 1.5;
            }

            /* Score slider */
            .crg-slider-row {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .crg-score-slider {
                flex: 1;
                -webkit-appearance: none;
                height: 4px;
                background: linear-gradient(to right, #00cfcf 0%, #00cfcf calc(var(--val, 0) * 1%), #1e2530 calc(var(--val, 0) * 1%));
                border-radius: 2px;
                outline: none;
            }
            .crg-score-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px;
                height: 18px;
                background: #00cfcf;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 6px rgba(0,207,207,0.4);
            }
            .crg-score-slider::-moz-range-thumb {
                width: 18px;
                height: 18px;
                background: #00cfcf;
                border-radius: 50%;
                cursor: pointer;
                border: none;
            }
            .crg-score-display {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.9rem;
                font-weight: 700;
                color: #00cfcf;
                min-width: 60px;
                text-align: right;
            }

            /* Feedback */
            .crg-feedback-ta {
                width: 100%;
                background: #0e1117;
                border: 1px solid #1e2530;
                border-radius: 4px;
                color: #c8d0dc;
                font-family: 'Inter', sans-serif;
                font-size: 0.82rem;
                padding: 12px;
                min-height: 100px;
                resize: vertical;
                margin-top: 8px;
                box-sizing: border-box;
                transition: border-color 0.15s;
            }
            .crg-feedback-ta:focus { outline: none; border-color: #00cfcf; }
            .crg-char-count {
                display: block;
                font-size: 0.66rem;
                color: #445;
                text-align: right;
                margin-top: 4px;
                font-family: 'JetBrains Mono', monospace;
            }

            /* Submit row */
            .crg-submit-row {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 14px;
                padding: 20px 0 8px;
                border-top: 1px solid #1e2530;
                margin-top: 12px;
            }
            .crg-submit-status {
                font-size: 0.78rem;
                color: #445;
                flex: 1;
            }
            .crg-submit-status.crg-status-error { color: #e85c5c; }
            .crg-submit-status.crg-status-success { color: #4caf6a; }

            .crg-submit-btn {
                background: #003838;
                border: 1px solid #006060;
                border-radius: 4px;
                color: #00cfcf;
                font-size: 0.82rem;
                padding: 10px 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: background 0.15s, border-color 0.15s;
            }
            .crg-submit-btn:hover { background: #004a4a; border-color: #00cfcf; }
            .crg-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            .crg-submit-btn img { width: 13px; height: 13px; }

            .crg-back-btn {
                background: none;
                border: 1px solid #1e2530;
                border-radius: 4px;
                color: #7ab;
                font-size: 0.78rem;
                padding: 8px 14px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin: 16px;
                transition: border-color 0.15s;
            }
            .crg-back-btn:hover { border-color: #00cfcf; color: #00cfcf; }
            .crg-back-btn img { width: 12px; height: 12px; }

            @media (max-width: 900px) {
                .crg-layout { grid-template-columns: 1fr; }
                .crg-list-panel { border-right: none; border-bottom: 1px solid #1e2530; max-height: 300px; }
                .crg-scores-row { grid-template-columns: repeat(2, 1fr); }
            }
        `;
        document.head.appendChild(style);
    }

    return { init };

})();
