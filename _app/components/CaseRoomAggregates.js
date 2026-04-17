/**
 * CaseRoomAggregates.js - Class Aggregate Dashboard for Case Room (EDT) Labs
 *
 * Instructor-only component showing per-lab aggregate data across all submissions.
 * Data source: edt_submissions queried by labId via Cloud Function.
 *
 * Charts: CSS-only bar charts (no external libraries).
 *
 * Displays:
 *   - Decision distribution (horizontal bar chart)
 *   - Stakeholder selection heatmap (sorted bar chart)
 *   - Evidence tagging disagreement (split bar per artifact)
 *   - Score distribution histogram (total scores)
 *
 * Usage:
 *   CaseRoomAggregates.init(containerElement);
 *
 * @version 1.0.0
 */

const CaseRoomAggregates = (function () {
    'use strict';

    // ── State ──────────────────────────────────────────────────
    let _container  = null;
    let _labIds     = [];       // distinct lab IDs available to this handler
    let _selectedLab = null;
    let _submissions = [];      // loaded for selected lab

    // ── Public API ─────────────────────────────────────────────

    async function init(containerEl) {
        _container = containerEl;

        if (!document.getElementById('cra-styles')) {
            _injectStyles();
        }

        _renderShell();
        await _loadLabList();
    }

    // ── Shell ──────────────────────────────────────────────────

    function _renderShell() {
        _container.innerHTML = `
            <div class="cra-wrap">
                <div class="cra-top-bar">
                    <div class="cra-heading">
                        <img src="/assets/images/icons/icon-table.webp" alt="" class="cra-heading-icon">
                        <span>Class Aggregate Dashboard</span>
                    </div>
                    <div class="cra-lab-select-wrap">
                        <label class="cra-select-label" for="craLabSelector">Lab:</label>
                        <select class="cra-lab-select" id="craLabSelector">
                            <option value="">-- Select a lab --</option>
                        </select>
                        <button class="cra-load-btn" id="craLoadBtn">Load</button>
                    </div>
                </div>
                <div class="cra-content" id="craContent">
                    <div class="cra-placeholder">Select a lab above to view aggregate data.</div>
                </div>
            </div>
        `;

        document.getElementById('craLoadBtn').addEventListener('click', () => {
            const sel = document.getElementById('craLabSelector');
            const val = sel ? sel.value : '';
            if (val) _loadAggregates(val);
        });

        document.getElementById('craLabSelector').addEventListener('change', function () {
            if (this.value) _loadAggregates(this.value);
        });
    }

    // ── Load Lab List ──────────────────────────────────────────

    async function _loadLabList() {
        try {
            const result = await _callFunction('getEDTLabIds', {});
            _labIds = result.labIds || [];

            const sel = document.getElementById('craLabSelector');
            if (!sel) return;

            _labIds.forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = id;
                sel.appendChild(opt);
            });

        } catch (err) {
            console.warn('[CaseRoomAggregates] Could not load lab list:', err.message);
            // Non-fatal: user can still type in selector if needed
        }
    }

    // ── Load Aggregate Data ────────────────────────────────────

    async function _loadAggregates(labId) {
        _selectedLab = labId;
        const content = document.getElementById('craContent');
        if (!content) return;
        content.innerHTML = '<div class="cra-loading">Loading aggregate data for ' + _escHtml(labId) + '...</div>';

        try {
            const result = await _callFunction('getEDTAggregates', { labId });
            _submissions = result.submissions || [];

            if (_submissions.length === 0) {
                content.innerHTML = '<div class="cra-placeholder">No submitted data for <strong>' + _escHtml(labId) + '</strong> yet.</div>';
                return;
            }

            _renderAggregates(content, _submissions, labId);

        } catch (err) {
            console.error('[CaseRoomAggregates] Load error:', err);
            content.innerHTML = '<div class="cra-error">Failed to load aggregate data: ' + _escHtml(err.message || 'Unknown error') + '</div>';
        }
    }

    // ── Render All Aggregate Charts ────────────────────────────

    function _renderAggregates(container, submissions, labId) {
        container.innerHTML = '';

        const summary = document.createElement('div');
        summary.className = 'cra-summary-bar';
        summary.innerHTML =
            '<span class="cra-summary-item"><strong>' + submissions.length + '</strong> submissions</span>' +
            '<span class="cra-summary-item">Lab: <strong>' + _escHtml(labId) + '</strong></span>';
        container.appendChild(summary);

        // Decision Distribution
        container.appendChild(_buildDecisionChart(submissions));

        // Stakeholder Heatmap
        container.appendChild(_buildStakeholderHeatmap(submissions));

        // Evidence Tagging Disagreement
        container.appendChild(_buildEvidenceDisagreement(submissions));

        // Score Distribution Histogram
        container.appendChild(_buildScoreHistogram(submissions));
    }

    // ── Chart 1: Decision Distribution ────────────────────────

    function _buildDecisionChart(submissions) {
        const section = _chartSection('Decision Distribution', 'Percentage of students who chose each decision option.');

        // Tally decision IDs
        const tally = {};
        submissions.forEach(sub => {
            const d = sub.decisionId || 'unknown';
            tally[d] = (tally[d] || 0) + 1;
        });

        const total    = submissions.length;
        const sorted   = Object.entries(tally).sort((a, b) => b[1] - a[1]);
        const chart    = document.createElement('div');
        chart.className = 'cra-bar-chart';

        sorted.forEach(([decId, count]) => {
            const pct    = Math.round((count / total) * 100);
            const row    = document.createElement('div');
            row.className = 'cra-bar-row';
            row.innerHTML =
                '<div class="cra-bar-label" title="' + _escHtml(decId) + '">' + _escHtml(decId) + '</div>' +
                '<div class="cra-bar-track">' +
                    '<div class="cra-bar-fill cra-fill-primary" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<div class="cra-bar-pct">' + pct + '% <span class="cra-bar-count">(' + count + ')</span></div>';
            chart.appendChild(row);
        });

        section.appendChild(chart);
        return section;
    }

    // ── Chart 2: Stakeholder Heatmap ──────────────────────────

    function _buildStakeholderHeatmap(submissions) {
        const section = _chartSection('Stakeholder Heatmap', 'Which stakeholders were selected most and least frequently across the class.');

        const tally = {};
        submissions.forEach(sub => {
            (sub.stakeholderSelections || []).forEach(id => {
                tally[id] = (tally[id] || 0) + 1;
            });
        });

        if (Object.keys(tally).length === 0) {
            section.appendChild(_emptyState('No stakeholder data.'));
            return section;
        }

        const total  = submissions.length;
        const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
        const chart  = document.createElement('div');
        chart.className = 'cra-bar-chart';

        sorted.forEach(([stId, count]) => {
            const pct    = Math.round((count / total) * 100);
            // Color intensity: high selection = cyan, low = muted
            const fill   = pct >= 60 ? 'cra-fill-primary' : pct >= 30 ? 'cra-fill-mid' : 'cra-fill-low';
            const row    = document.createElement('div');
            row.className = 'cra-bar-row';
            row.innerHTML =
                '<div class="cra-bar-label">' + _escHtml(stId) + '</div>' +
                '<div class="cra-bar-track">' +
                    '<div class="cra-bar-fill ' + fill + '" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<div class="cra-bar-pct">' + pct + '% <span class="cra-bar-count">(' + count + ')</span></div>';
            chart.appendChild(row);
        });

        section.appendChild(chart);
        return section;
    }

    // ── Chart 3: Evidence Tagging Disagreement ─────────────────

    function _buildEvidenceDisagreement(submissions) {
        const section = _chartSection('Evidence Tagging Patterns', 'Artifacts with the most disagreement between relevant and irrelevant tags across the class.');

        // Tally tag counts per artifact ID
        const tally = {};
        submissions.forEach(sub => {
            const tags = sub.evidenceTags || {};
            for (const [evId, tagData] of Object.entries(tags)) {
                if (!tally[evId]) tally[evId] = { relevant: 0, irrelevant: 0, contested: 0 };
                if (tagData.tag && tally[evId][tagData.tag] !== undefined) {
                    tally[evId][tagData.tag]++;
                }
            }
        });

        if (Object.keys(tally).length === 0) {
            section.appendChild(_emptyState('No evidence tagging data.'));
            return section;
        }

        // Sort by disagreement: abs(relevant - irrelevant) ascending = most contested first
        const sorted = Object.entries(tally).sort((a, b) => {
            const disA = Math.abs(a[1].relevant - a[1].irrelevant);
            const disB = Math.abs(b[1].relevant - b[1].irrelevant);
            return disA - disB;
        });

        const chart = document.createElement('div');
        chart.className = 'cra-split-chart';

        sorted.forEach(([evId, counts]) => {
            const total  = (counts.relevant || 0) + (counts.irrelevant || 0) + (counts.contested || 0);
            if (total === 0) return;

            const relPct  = Math.round(((counts.relevant  || 0) / total) * 100);
            const irrePct = Math.round(((counts.irrelevant || 0) / total) * 100);
            const conPct  = Math.round(((counts.contested  || 0) / total) * 100);

            const row = document.createElement('div');
            row.className = 'cra-split-row';
            row.innerHTML =
                '<div class="cra-split-label">' + _escHtml(evId) + '</div>' +
                '<div class="cra-split-bar">' +
                    '<div class="cra-split-seg cra-seg-relevant"   style="width:' + relPct  + '%" title="Relevant: '   + relPct  + '%"></div>' +
                    '<div class="cra-split-seg cra-seg-contested"  style="width:' + conPct  + '%" title="Contested: '  + conPct  + '%"></div>' +
                    '<div class="cra-split-seg cra-seg-irrelevant" style="width:' + irrePct + '%" title="Irrelevant: ' + irrePct + '%"></div>' +
                '</div>' +
                '<div class="cra-split-counts">' +
                    '<span class="cra-sc-rel">' + relPct + '% Rel</span>' +
                    '<span class="cra-sc-con">' + conPct + '% Con</span>' +
                    '<span class="cra-sc-irr">' + irrePct + '% Irr</span>' +
                '</div>';
            chart.appendChild(row);
        });

        // Legend
        const legend = document.createElement('div');
        legend.className = 'cra-split-legend';
        legend.innerHTML =
            '<span class="cra-leg-item"><span class="cra-leg-dot cra-seg-relevant"></span>Relevant</span>' +
            '<span class="cra-leg-item"><span class="cra-leg-dot cra-seg-contested"></span>Contested</span>' +
            '<span class="cra-leg-item"><span class="cra-leg-dot cra-seg-irrelevant"></span>Irrelevant</span>';
        section.appendChild(chart);
        section.appendChild(legend);
        return section;
    }

    // ── Chart 4: Score Distribution Histogram ─────────────────

    function _buildScoreHistogram(submissions) {
        const section = _chartSection('Score Distribution', 'Distribution of final total scores (auto-scored components only, before instructor grading).');

        // Build histogram buckets: 0-9, 10-19, ..., 90-100
        const BUCKETS = 10;
        const bucketSize = 10;
        const buckets = new Array(BUCKETS).fill(0);

        submissions.forEach(sub => {
            const auto  = sub.autoScores || {};
            const score = (auto.evidence || 0) + (auto.stakeholder || 0) + (auto.codeConflict || 0);
            const idx   = Math.min(BUCKETS - 1, Math.floor(score / bucketSize));
            buckets[idx]++;
        });

        const maxCount = Math.max(...buckets, 1);
        const chart    = document.createElement('div');
        chart.className = 'cra-histogram';

        buckets.forEach((count, i) => {
            const heightPct = Math.round((count / maxCount) * 100);
            const lo        = i * bucketSize;
            const hi        = lo + bucketSize - 1;
            const col       = document.createElement('div');
            col.className   = 'cra-hist-col';
            col.innerHTML =
                '<div class="cra-hist-bar-wrap">' +
                    '<span class="cra-hist-count">' + (count > 0 ? count : '') + '</span>' +
                    '<div class="cra-hist-bar" style="height:' + heightPct + '%"></div>' +
                '</div>' +
                '<div class="cra-hist-label">' + lo + (hi >= 100 ? '+' : '-' + hi) + '</div>';
            chart.appendChild(col);
        });

        section.appendChild(chart);
        return section;
    }

    // ── Chart Shell Helper ─────────────────────────────────────

    function _chartSection(title, subtitle) {
        const sec = document.createElement('div');
        sec.className = 'cra-chart-section';

        const hdr = document.createElement('div');
        hdr.className = 'cra-chart-header';
        hdr.innerHTML =
            '<div class="cra-chart-title">' + _escHtml(title) + '</div>' +
            '<div class="cra-chart-subtitle">' + _escHtml(subtitle) + '</div>';
        sec.appendChild(hdr);

        return sec;
    }

    function _emptyState(msg) {
        const el = document.createElement('div');
        el.className = 'cra-placeholder';
        el.style.padding = '16px 0';
        el.textContent = msg;
        return el;
    }

    // ── Firebase Helper ────────────────────────────────────────

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
        style.id = 'cra-styles';
        style.textContent = `
            .cra-wrap {
                background: #0d0f14;
                border: 1px solid #1e2530;
                border-radius: 6px;
                overflow: hidden;
                font-family: 'Inter', 'Segoe UI', sans-serif;
                color: #c8d0dc;
                font-size: 0.86rem;
            }

            .cra-top-bar {
                padding: 16px 20px;
                background: #111419;
                border-bottom: 1px solid #1e2530;
                display: flex;
                align-items: center;
                gap: 20px;
                flex-wrap: wrap;
            }
            .cra-heading {
                display: flex;
                align-items: center;
                gap: 10px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.7rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: #00cfcf;
                flex: 1;
                min-width: 200px;
            }
            .cra-heading-icon { width: 14px; height: 14px; opacity: 0.8; }

            .cra-lab-select-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .cra-select-label {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.68rem;
                color: #556;
                white-space: nowrap;
            }
            .cra-lab-select {
                background: #0e1117;
                border: 1px solid #2a3040;
                border-radius: 4px;
                color: #c8d0dc;
                padding: 6px 10px;
                font-size: 0.8rem;
                min-width: 160px;
                cursor: pointer;
            }
            .cra-lab-select:focus { outline: none; border-color: #00cfcf; }
            .cra-load-btn {
                background: #003838;
                border: 1px solid #006060;
                border-radius: 4px;
                color: #00cfcf;
                font-size: 0.78rem;
                padding: 6px 14px;
                cursor: pointer;
                transition: background 0.15s;
            }
            .cra-load-btn:hover { background: #004a4a; }

            .cra-content { padding: 20px 24px; }
            .cra-placeholder {
                text-align: center;
                color: #445;
                padding: 40px 0;
                font-size: 0.82rem;
            }
            .cra-loading { text-align: center; color: #556; padding: 24px; font-size: 0.78rem; }
            .cra-error { color: #e85c5c; padding: 16px; font-size: 0.78rem; }

            .cra-summary-bar {
                display: flex;
                gap: 16px;
                margin-bottom: 28px;
                padding: 12px 16px;
                background: #111419;
                border: 1px solid #1e2530;
                border-radius: 4px;
            }
            .cra-summary-item {
                font-size: 0.78rem;
                color: #778;
            }
            .cra-summary-item strong { color: #e2e8f2; }

            /* Chart sections */
            .cra-chart-section {
                margin-bottom: 36px;
                background: #111419;
                border: 1px solid #1e2530;
                border-radius: 5px;
                overflow: hidden;
            }
            .cra-chart-header {
                padding: 12px 18px;
                background: #14181e;
                border-bottom: 1px solid #1e2530;
            }
            .cra-chart-title {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.7rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #00cfcf;
                margin-bottom: 4px;
            }
            .cra-chart-subtitle { font-size: 0.74rem; color: #556; }

            /* Horizontal bar chart */
            .cra-bar-chart { padding: 16px 18px; }
            .cra-bar-row {
                display: grid;
                grid-template-columns: 100px 1fr 80px;
                align-items: center;
                gap: 12px;
                margin-bottom: 10px;
            }
            .cra-bar-label {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.68rem;
                color: #889;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .cra-bar-track {
                height: 16px;
                background: #1a1e26;
                border-radius: 3px;
                overflow: hidden;
            }
            .cra-bar-fill {
                height: 100%;
                border-radius: 3px;
                transition: width 0.4s ease;
            }
            .cra-fill-primary  { background: #00cfcf; }
            .cra-fill-mid      { background: #2288aa; }
            .cra-fill-low      { background: #1a3540; }
            .cra-bar-pct {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.72rem;
                color: #aab;
                text-align: right;
            }
            .cra-bar-count { color: #445; }

            /* Split bar chart */
            .cra-split-chart { padding: 14px 18px; }
            .cra-split-row { margin-bottom: 10px; }
            .cra-split-label {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.68rem;
                color: #778;
                margin-bottom: 4px;
            }
            .cra-split-bar {
                height: 14px;
                background: #1a1e26;
                border-radius: 3px;
                overflow: hidden;
                display: flex;
            }
            .cra-split-seg { height: 100%; transition: width 0.4s ease; }
            .cra-seg-relevant   { background: #2a7a40; }
            .cra-seg-irrelevant { background: #3a3a4a; }
            .cra-seg-contested  { background: #8a5a10; }
            .cra-split-counts {
                display: flex;
                gap: 12px;
                margin-top: 4px;
            }
            .cra-sc-rel, .cra-sc-con, .cra-sc-irr {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.62rem;
            }
            .cra-sc-rel { color: #4caf6a; }
            .cra-sc-con { color: #e08a30; }
            .cra-sc-irr { color: #556; }

            .cra-split-legend {
                display: flex;
                gap: 16px;
                padding: 10px 18px 14px;
                border-top: 1px solid #1a1e26;
            }
            .cra-leg-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.72rem;
                color: #778;
            }
            .cra-leg-dot {
                width: 10px;
                height: 10px;
                border-radius: 2px;
                display: inline-block;
                flex-shrink: 0;
            }

            /* Histogram */
            .cra-histogram {
                display: flex;
                align-items: flex-end;
                gap: 4px;
                padding: 20px 18px 0;
                height: 160px;
                box-sizing: border-box;
            }
            .cra-hist-col {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .cra-hist-bar-wrap {
                flex: 1;
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
            }
            .cra-hist-count {
                font-size: 0.62rem;
                color: #556;
                font-family: 'JetBrains Mono', monospace;
                margin-bottom: 3px;
                min-height: 14px;
                display: block;
            }
            .cra-hist-bar {
                width: 100%;
                background: linear-gradient(to top, #00cfcf, #006a7a);
                border-radius: 2px 2px 0 0;
                min-height: 2px;
                transition: height 0.4s ease;
            }
            .cra-hist-label {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.58rem;
                color: #445;
                margin-top: 6px;
                margin-bottom: 12px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    return { init };

})();
