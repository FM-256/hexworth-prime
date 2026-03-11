/* ============================================================
   CTF ARENA — BlueTeam.js
   Blue team device types for defensive/SOC scenarios:
   MonitoringDashboard, LogViewer, FirewallManager, IDSPanel
   ============================================================ */

// ────────────────────────────────────────────────
// STYLES
// ────────────────────────────────────────────────

(function injectBlueTeamStyles() {
    const style = document.createElement('style');
    style.textContent = `

/* ============================================================
   SHARED BLUE TEAM STYLES
   ============================================================ */

.bt-panel {
    font-family: var(--arena-font);
    color: var(--arena-text);
    background: var(--arena-bg);
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.bt-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: var(--arena-chrome);
    border-bottom: 1px solid var(--arena-border);
    flex-shrink: 0;
}

.bt-toolbar input,
.bt-toolbar select {
    background: var(--arena-bg);
    border: 1px solid var(--arena-border);
    color: var(--arena-text);
    font-family: var(--arena-font);
    font-size: 0.75rem;
    padding: 3px 6px;
    border-radius: 3px;
    outline: none;
}

.bt-toolbar input:focus,
.bt-toolbar select:focus {
    border-color: var(--box-accent);
}

.bt-toolbar button {
    background: var(--arena-chrome-light);
    border: 1px solid var(--arena-border);
    color: var(--arena-text);
    font-family: var(--arena-font);
    font-size: 0.7rem;
    padding: 3px 8px;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
}

.bt-toolbar button:hover {
    background: var(--arena-border);
}

.bt-body {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

.bt-status-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 10px;
    background: var(--arena-chrome);
    border-top: 1px solid var(--arena-border);
    font-size: 0.65rem;
    color: var(--arena-text-dim);
    flex-shrink: 0;
}

.bt-badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 0.65rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.bt-badge-critical { background: #7f1d1d; color: #fca5a5; }
.bt-badge-high     { background: #78350f; color: #fbbf24; }
.bt-badge-medium   { background: #1e3a5f; color: #60a5fa; }
.bt-badge-low      { background: #14532d; color: #86efac; }
.bt-badge-info     { background: #1e293b; color: #94a3b8; }

/* ============================================================
   MONITORING DASHBOARD
   ============================================================ */

.monitoring-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    height: 100%;
    padding: 8px;
}

.monitoring-section {
    background: var(--arena-chrome);
    border: 1px solid var(--arena-border);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
}

.monitoring-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background: var(--arena-chrome-light);
    border-bottom: 1px solid var(--arena-border);
    font-size: 0.7rem;
    font-weight: bold;
    color: var(--arena-text-bright);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    flex-shrink: 0;
}

.monitoring-section-header .section-count {
    font-weight: normal;
    color: var(--arena-text-dim);
    font-size: 0.65rem;
}

.monitoring-section-body {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
    min-height: 0;
}

/* Event feed */
.event-feed-entry {
    display: flex;
    gap: 6px;
    padding: 2px 4px;
    font-size: 0.7rem;
    line-height: 1.4;
    border-bottom: 1px solid rgba(255,255,255,0.03);
}

.event-feed-entry:hover {
    background: rgba(255,255,255,0.03);
}

.event-feed-ts {
    color: var(--arena-text-dim);
    flex-shrink: 0;
    min-width: 70px;
}

.event-feed-src {
    color: var(--box-accent);
    flex-shrink: 0;
    min-width: 110px;
}

.event-feed-msg {
    color: var(--arena-text);
    flex: 1;
    word-break: break-word;
}

/* Alert cards */
.alert-card {
    padding: 6px 8px;
    margin-bottom: 4px;
    border-radius: 3px;
    border-left: 3px solid var(--arena-border);
    background: rgba(255,255,255,0.02);
    font-size: 0.7rem;
    cursor: default;
}

.alert-card:hover {
    background: rgba(255,255,255,0.05);
}

.alert-card.severity-critical { border-left-color: #ef4444; background: rgba(239,68,68,0.08); }
.alert-card.severity-high     { border-left-color: #f59e0b; background: rgba(245,158,11,0.06); }
.alert-card.severity-medium   { border-left-color: #3b82f6; background: rgba(59,130,246,0.06); }
.alert-card.severity-low      { border-left-color: #22c55e; background: rgba(34,197,94,0.04); }

.alert-card-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
}

.alert-card-header .bt-badge {
    font-size: 0.6rem;
}

.alert-card-src {
    color: var(--arena-text-dim);
    font-size: 0.65rem;
    margin-left: auto;
}

.alert-card-desc {
    color: var(--arena-text);
    line-height: 1.3;
}

/* Traffic graph */
.traffic-graph {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 100%;
    padding: 8px 4px 4px;
}

.traffic-bar {
    flex: 1;
    min-width: 4px;
    background: var(--box-accent);
    border-radius: 2px 2px 0 0;
    opacity: 0.7;
    transition: height 0.3s ease, opacity 0.2s;
    position: relative;
}

.traffic-bar:hover {
    opacity: 1;
}

.traffic-bar.spike {
    background: var(--arena-danger);
    opacity: 0.9;
}

/* Stats row */
.monitoring-stats {
    display: flex;
    gap: 16px;
    padding: 6px 8px;
    font-size: 0.65rem;
}

.monitoring-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.monitoring-stat-value {
    font-size: 1rem;
    font-weight: bold;
    color: var(--arena-text-bright);
}

.monitoring-stat-label {
    color: var(--arena-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.6rem;
}

/* ============================================================
   LOG VIEWER
   ============================================================ */

.log-viewer-body {
    flex: 1;
    overflow-y: auto;
    font-size: 0.7rem;
    padding: 0;
    min-height: 0;
}

.log-entry {
    display: flex;
    gap: 6px;
    padding: 2px 8px;
    line-height: 1.5;
    border-bottom: 1px solid rgba(255,255,255,0.02);
    font-size: 0.7rem;
}

.log-entry:nth-child(even) {
    background: rgba(255,255,255,0.015);
}

.log-entry:hover {
    background: rgba(255,255,255,0.04);
}

.log-entry.suspicious {
    background: rgba(239,68,68,0.08);
    border-left: 2px solid var(--arena-danger);
}

.log-entry.suspicious:hover {
    background: rgba(239,68,68,0.12);
}

.log-entry.highlight {
    background: rgba(245,158,11,0.1);
}

.log-line-num {
    color: var(--arena-text-dim);
    min-width: 36px;
    text-align: right;
    flex-shrink: 0;
    user-select: none;
}

.log-ts {
    color: var(--arena-text-dim);
    flex-shrink: 0;
    min-width: 140px;
}

.log-severity {
    flex-shrink: 0;
    min-width: 50px;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.65rem;
}

.log-severity.sev-emerg   { color: #f87171; }
.log-severity.sev-alert   { color: #f87171; }
.log-severity.sev-crit    { color: #fb923c; }
.log-severity.sev-err     { color: #fbbf24; }
.log-severity.sev-warning { color: #facc15; }
.log-severity.sev-notice  { color: #60a5fa; }
.log-severity.sev-info    { color: #94a3b8; }
.log-severity.sev-debug   { color: #6b7280; }

.log-source {
    color: var(--box-accent);
    flex-shrink: 0;
    min-width: 90px;
}

.log-message {
    color: var(--arena-text);
    flex: 1;
    word-break: break-word;
}

.log-search-highlight {
    background: rgba(245,158,11,0.4);
    color: var(--arena-text-bright);
    border-radius: 2px;
    padding: 0 1px;
}

.log-viewer-empty {
    text-align: center;
    padding: 40px;
    color: var(--arena-text-dim);
    font-size: 0.8rem;
}

/* ============================================================
   FIREWALL MANAGER
   ============================================================ */

.fw-table-wrap {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.fw-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.7rem;
}

.fw-table th {
    position: sticky;
    top: 0;
    background: var(--arena-chrome-light);
    border-bottom: 1px solid var(--arena-border);
    padding: 4px 8px;
    text-align: left;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--arena-text-dim);
    z-index: 1;
}

.fw-table td {
    padding: 3px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
}

.fw-table tr:hover td {
    background: rgba(255,255,255,0.03);
}

.fw-table tr.rule-allow td {
    border-left: 3px solid var(--arena-success);
}

.fw-table tr.rule-deny td,
.fw-table tr.rule-drop td {
    border-left: 3px solid var(--arena-danger);
}

.fw-table tr.rule-deny td:last-child,
.fw-table tr.rule-drop td:last-child {
    color: var(--arena-danger);
}

.fw-table tr.rule-allow td:last-child {
    color: var(--arena-success);
}

.fw-action-cell {
    display: flex;
    gap: 4px;
}

.fw-action-btn {
    background: none;
    border: 1px solid var(--arena-border);
    color: var(--arena-text-dim);
    cursor: pointer;
    padding: 1px 5px;
    border-radius: 2px;
    font-size: 0.6rem;
    font-family: var(--arena-font);
}

.fw-action-btn:hover {
    background: var(--arena-chrome-light);
    color: var(--arena-text);
}

.fw-action-btn.btn-delete:hover {
    border-color: var(--arena-danger);
    color: var(--arena-danger);
}

.fw-add-row {
    display: flex;
    gap: 4px;
    padding: 6px 8px;
    background: var(--arena-chrome);
    border-top: 1px solid var(--arena-border);
    flex-shrink: 0;
    flex-wrap: wrap;
}

.fw-add-row input,
.fw-add-row select {
    background: var(--arena-bg);
    border: 1px solid var(--arena-border);
    color: var(--arena-text);
    font-family: var(--arena-font);
    font-size: 0.7rem;
    padding: 2px 5px;
    border-radius: 3px;
    outline: none;
}

.fw-add-row input:focus,
.fw-add-row select:focus {
    border-color: var(--box-accent);
}

.fw-add-row input { width: 100px; }

.fw-add-row button {
    background: var(--box-accent);
    border: none;
    color: #fff;
    font-family: var(--arena-font);
    font-size: 0.7rem;
    padding: 2px 10px;
    border-radius: 3px;
    cursor: pointer;
}

.fw-add-row button:hover {
    filter: brightness(1.2);
}

/* Packet test result */
.fw-test-result {
    padding: 6px 8px;
    background: var(--arena-chrome);
    border-top: 1px solid var(--arena-border);
    font-size: 0.7rem;
    flex-shrink: 0;
}

.fw-test-result.result-allow {
    border-left: 3px solid var(--arena-success);
    color: var(--arena-success);
}

.fw-test-result.result-deny {
    border-left: 3px solid var(--arena-danger);
    color: var(--arena-danger);
}

/* ============================================================
   IDS PANEL
   ============================================================ */

.ids-alert-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
}

.ids-alert {
    padding: 6px 8px;
    margin: 4px 8px;
    background: var(--arena-chrome);
    border: 1px solid var(--arena-border);
    border-radius: 4px;
    font-size: 0.7rem;
}

.ids-alert:hover {
    border-color: rgba(255,255,255,0.15);
}

.ids-alert.classified-tp {
    border-left: 3px solid var(--arena-danger);
}

.ids-alert.classified-fp {
    border-left: 3px solid var(--arena-success);
}

.ids-alert.classified-inv {
    border-left: 3px solid var(--arena-warning);
}

.ids-alert-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.ids-alert-sid {
    color: var(--arena-text-dim);
    font-size: 0.65rem;
}

.ids-alert-ts {
    color: var(--arena-text-dim);
    font-size: 0.65rem;
    margin-left: auto;
}

.ids-alert-sig {
    color: var(--arena-text-bright);
    font-weight: bold;
    margin-bottom: 2px;
}

.ids-alert-detail {
    color: var(--arena-text);
    margin-bottom: 4px;
    line-height: 1.3;
}

.ids-alert-meta {
    display: flex;
    gap: 8px;
    font-size: 0.65rem;
    color: var(--arena-text-dim);
    margin-bottom: 4px;
}

.ids-alert-actions {
    display: flex;
    gap: 4px;
}

.ids-classify-btn {
    background: var(--arena-chrome-light);
    border: 1px solid var(--arena-border);
    color: var(--arena-text);
    font-family: var(--arena-font);
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 3px;
    cursor: pointer;
}

.ids-classify-btn:hover {
    background: var(--arena-border);
}

.ids-classify-btn.active-tp {
    background: rgba(239,68,68,0.2);
    border-color: var(--arena-danger);
    color: var(--arena-danger);
}

.ids-classify-btn.active-fp {
    background: rgba(34,197,94,0.2);
    border-color: var(--arena-success);
    color: var(--arena-success);
}

.ids-classify-btn.active-inv {
    background: rgba(245,158,11,0.2);
    border-color: var(--arena-warning);
    color: var(--arena-warning);
}

.ids-classification-label {
    font-size: 0.65rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.ids-classification-label.cls-tp  { color: var(--arena-danger); }
.ids-classification-label.cls-fp  { color: var(--arena-success); }
.ids-classification-label.cls-inv { color: var(--arena-warning); }

`;
    document.head.appendChild(style);
})();


// ────────────────────────────────────────────────
// MONITORING DASHBOARD
// ────────────────────────────────────────────────

const ArenaMonitoring = {
    _instances: [],

    init(container, config, engine) {
        const inst = new MonitoringInstance(container, config, engine);
        this._instances.push(inst);
        return inst;
    }
};

class MonitoringInstance {
    constructor(container, config, engine) {
        this.config = config;
        this.engine = engine;
        this._events = [];
        this._alerts = [];
        this._trafficData = [];
        this._eventCount = 0;
        this._alertCounts = { critical: 0, high: 0, medium: 0, low: 0 };

        this._build(container);

        // Load initial data from config
        if (config.monitoring) {
            if (config.monitoring.events) {
                config.monitoring.events.forEach(e => this.addEvent(e));
            }
            if (config.monitoring.alerts) {
                config.monitoring.alerts.forEach(a => this.triggerAlert(a));
            }
            if (config.monitoring.traffic) {
                this.updateTraffic(config.monitoring.traffic);
            }
        }
    }

    _build(container) {
        container.innerHTML = '';
        const panel = document.createElement('div');
        panel.className = 'bt-panel';

        // Grid layout: 4 quadrants
        const grid = document.createElement('div');
        grid.className = 'monitoring-grid';

        // Q1: Event feed
        const eventSection = this._buildSection('Event Feed', 'events');
        this._eventFeedEl = eventSection.querySelector('.monitoring-section-body');
        this._eventCountEl = eventSection.querySelector('.section-count');

        // Q2: Alerts
        const alertSection = this._buildSection('Active Alerts', 'alerts');
        this._alertListEl = alertSection.querySelector('.monitoring-section-body');
        this._alertCountEl = alertSection.querySelector('.section-count');

        // Q3: Traffic graph
        const trafficSection = this._buildSection('Network Traffic', 'traffic');
        this._trafficEl = trafficSection.querySelector('.monitoring-section-body');
        this._trafficEl.classList.add('traffic-graph');

        // Q4: Stats
        const statsSection = this._buildSection('Summary', 'stats');
        this._statsEl = statsSection.querySelector('.monitoring-section-body');
        this._updateStats();

        grid.appendChild(eventSection);
        grid.appendChild(alertSection);
        grid.appendChild(trafficSection);
        grid.appendChild(statsSection);

        panel.appendChild(grid);
        container.appendChild(panel);
    }

    _buildSection(title, id) {
        const section = document.createElement('div');
        section.className = 'monitoring-section';
        section.dataset.section = id;
        section.innerHTML = `
            <div class="monitoring-section-header">
                <span>${title}</span>
                <span class="section-count">0</span>
            </div>
            <div class="monitoring-section-body"></div>
        `;
        return section;
    }

    addEvent(event) {
        this._eventCount++;
        const entry = document.createElement('div');
        entry.className = 'event-feed-entry';

        const ts = event.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const src = event.source || 'system';
        const msg = event.message || '';

        entry.innerHTML = `
            <span class="event-feed-ts">${this._esc(ts)}</span>
            <span class="event-feed-src">${this._esc(src)}</span>
            <span class="event-feed-msg">${this._esc(msg)}</span>
        `;

        this._eventFeedEl.appendChild(entry);
        this._eventFeedEl.scrollTop = this._eventFeedEl.scrollHeight;
        this._eventCountEl.textContent = this._eventCount;
        this._events.push(event);

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('monitoring_event', { source: src, message: msg });
        }
    }

    triggerAlert(alert) {
        const severity = (alert.severity || 'medium').toLowerCase();
        this._alertCounts[severity] = (this._alertCounts[severity] || 0) + 1;

        const card = document.createElement('div');
        card.className = 'alert-card severity-' + severity;

        const src = alert.sourceIP || alert.source || 'unknown';
        const desc = alert.description || alert.message || '';
        const name = alert.name || alert.rule || '';

        card.innerHTML = `
            <div class="alert-card-header">
                <span class="bt-badge bt-badge-${severity}">${severity}</span>
                <strong>${this._esc(name)}</strong>
                <span class="alert-card-src">${this._esc(src)}</span>
            </div>
            <div class="alert-card-desc">${this._esc(desc)}</div>
        `;

        // Newest on top
        if (this._alertListEl.firstChild) {
            this._alertListEl.insertBefore(card, this._alertListEl.firstChild);
        } else {
            this._alertListEl.appendChild(card);
        }

        const total = Object.values(this._alertCounts).reduce((a, b) => a + b, 0);
        this._alertCountEl.textContent = total;
        this._alerts.push(alert);
        this._updateStats();

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('monitoring_alert', { severity, name, sourceIP: src });
        }
    }

    updateTraffic(data) {
        this._trafficData = Array.isArray(data) ? data : [];
        this._trafficEl.innerHTML = '';

        if (this._trafficData.length === 0) return;

        const max = Math.max(...this._trafficData.map(d => typeof d === 'number' ? d : d.value || 0));
        const threshold = typeof data[0] === 'object' && data[0].threshold ? data[0].threshold : max * 0.8;

        this._trafficData.forEach(d => {
            const val = typeof d === 'number' ? d : d.value || 0;
            const isSpike = val > threshold;
            const bar = document.createElement('div');
            bar.className = 'traffic-bar' + (isSpike ? ' spike' : '');
            const pct = max > 0 ? (val / max) * 100 : 0;
            bar.style.height = Math.max(2, pct) + '%';
            bar.title = (typeof d === 'object' && d.label ? d.label + ': ' : '') + val;
            this._trafficEl.appendChild(bar);
        });
    }

    _updateStats() {
        if (!this._statsEl) return;
        this._statsEl.innerHTML = `
            <div class="monitoring-stats">
                <div class="monitoring-stat">
                    <span class="monitoring-stat-value">${this._eventCount}</span>
                    <span class="monitoring-stat-label">Events</span>
                </div>
                <div class="monitoring-stat">
                    <span class="monitoring-stat-value" style="color: #ef4444;">${this._alertCounts.critical || 0}</span>
                    <span class="monitoring-stat-label">Critical</span>
                </div>
                <div class="monitoring-stat">
                    <span class="monitoring-stat-value" style="color: #f59e0b;">${this._alertCounts.high || 0}</span>
                    <span class="monitoring-stat-label">High</span>
                </div>
                <div class="monitoring-stat">
                    <span class="monitoring-stat-value" style="color: #3b82f6;">${this._alertCounts.medium || 0}</span>
                    <span class="monitoring-stat-label">Medium</span>
                </div>
                <div class="monitoring-stat">
                    <span class="monitoring-stat-value" style="color: #22c55e;">${this._alertCounts.low || 0}</span>
                    <span class="monitoring-stat-label">Low</span>
                </div>
            </div>
        `;
    }

    _esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}


// ────────────────────────────────────────────────
// LOG VIEWER
// ────────────────────────────────────────────────

const ArenaLogViewer = {
    _instances: [],

    init(container, config, engine) {
        const inst = new LogViewerInstance(container, config, engine);
        this._instances.push(inst);
        return inst;
    }
};

class LogViewerInstance {
    constructor(container, config, engine) {
        this.config = config;
        this.engine = engine;
        this._entries = [];
        this._filteredEntries = [];
        this._searchTerm = '';
        this._severityFilter = 'all';

        this._build(container);

        // Load initial logs from config
        if (config.logViewer && config.logViewer.entries) {
            this.loadLogs(config.logViewer.entries);
        }
    }

    _build(container) {
        container.innerHTML = '';
        const panel = document.createElement('div');
        panel.className = 'bt-panel';

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'bt-toolbar';

        this._searchInput = document.createElement('input');
        this._searchInput.type = 'text';
        this._searchInput.placeholder = 'Search logs...';
        this._searchInput.style.flex = '1';
        this._searchInput.addEventListener('input', () => {
            this._searchTerm = this._searchInput.value;
            this._render();
        });
        this._searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.search(this._searchInput.value);
            }
        });

        this._filterSelect = document.createElement('select');
        const severities = ['all', 'emerg', 'alert', 'crit', 'err', 'warning', 'notice', 'info', 'debug'];
        severities.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s === 'all' ? 'All Severities' : s.toUpperCase();
            this._filterSelect.appendChild(opt);
        });
        this._filterSelect.addEventListener('change', () => {
            this._severityFilter = this._filterSelect.value;
            this._render();
        });

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => {
            this._searchInput.value = '';
            this._filterSelect.value = 'all';
            this._searchTerm = '';
            this._severityFilter = 'all';
            this._render();
        });

        toolbar.appendChild(this._searchInput);
        toolbar.appendChild(this._filterSelect);
        toolbar.appendChild(clearBtn);

        // Log body
        this._logBody = document.createElement('div');
        this._logBody.className = 'log-viewer-body';

        // Status bar
        this._statusBar = document.createElement('div');
        this._statusBar.className = 'bt-status-bar';

        panel.appendChild(toolbar);
        panel.appendChild(this._logBody);
        panel.appendChild(this._statusBar);
        container.appendChild(panel);

        // Click to focus search
        container.addEventListener('click', (e) => {
            if (e.target === container || e.target === this._logBody) {
                this._searchInput.focus();
            }
        });
    }

    loadLogs(entries) {
        this._entries = entries.map((e, i) => ({
            lineNum: i + 1,
            timestamp: e.timestamp || '',
            severity: (e.severity || 'info').toLowerCase(),
            source: e.source || '',
            message: e.message || '',
            suspicious: !!e.suspicious,
            raw: e
        }));
        this._render();

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('logs_loaded', { count: entries.length });
        }
    }

    search(term) {
        this._searchTerm = term || '';
        this._searchInput.value = this._searchTerm;
        this._render();

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('log_search', { term: this._searchTerm, results: this._filteredEntries.length });
        }

        return this._filteredEntries;
    }

    filter(severity) {
        this._severityFilter = (severity || 'all').toLowerCase();
        this._filterSelect.value = this._severityFilter;
        this._render();
        return this._filteredEntries;
    }

    _render() {
        this._filteredEntries = this._entries.filter(e => {
            // Severity filter
            if (this._severityFilter !== 'all' && e.severity !== this._severityFilter) {
                return false;
            }
            // Search filter
            if (this._searchTerm) {
                const term = this._searchTerm.toLowerCase();
                const haystack = (e.timestamp + ' ' + e.severity + ' ' + e.source + ' ' + e.message).toLowerCase();
                if (!haystack.includes(term)) return false;
            }
            return true;
        });

        this._logBody.innerHTML = '';

        if (this._filteredEntries.length === 0) {
            this._logBody.innerHTML = '<div class="log-viewer-empty">No log entries match the current filter.</div>';
        } else {
            const fragment = document.createDocumentFragment();
            this._filteredEntries.forEach(e => {
                const row = document.createElement('div');
                let cls = 'log-entry';
                if (e.suspicious) cls += ' suspicious';
                if (this._searchTerm && !e.suspicious) cls += ' highlight';
                row.className = cls;

                let msgHtml = this._esc(e.message);
                if (this._searchTerm) {
                    msgHtml = this._highlightTerm(msgHtml, this._searchTerm);
                }

                row.innerHTML = `
                    <span class="log-line-num">${e.lineNum}</span>
                    <span class="log-ts">${this._esc(e.timestamp)}</span>
                    <span class="log-severity sev-${e.severity}">${e.severity}</span>
                    <span class="log-source">${this._esc(e.source)}</span>
                    <span class="log-message">${msgHtml}</span>
                `;
                fragment.appendChild(row);
            });
            this._logBody.appendChild(fragment);
        }

        this._statusBar.textContent = `${this._filteredEntries.length} of ${this._entries.length} entries` +
            (this._searchTerm ? ` | Search: "${this._searchTerm}"` : '') +
            (this._severityFilter !== 'all' ? ` | Filter: ${this._severityFilter.toUpperCase()}` : '');
    }

    _highlightTerm(html, term) {
        // Case-insensitive highlight on already-escaped text
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(' + escaped + ')', 'gi');
        return html.replace(regex, '<span class="log-search-highlight">$1</span>');
    }

    _esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}


// ────────────────────────────────────────────────
// FIREWALL MANAGER
// ────────────────────────────────────────────────

const ArenaFirewall = {
    _instances: [],

    init(container, config, engine) {
        const inst = new FirewallInstance(container, config, engine);
        this._instances.push(inst);
        return inst;
    }
};

class FirewallInstance {
    constructor(container, config, engine) {
        this.config = config;
        this.engine = engine;
        this._rules = [];
        this._nextId = 1;
        this._lastTestResult = null;

        this._build(container);

        // Load initial rules from config
        if (config.firewall && config.firewall.rules) {
            config.firewall.rules.forEach(r => this.addRule(r));
        }
    }

    _build(container) {
        container.innerHTML = '';
        const panel = document.createElement('div');
        panel.className = 'bt-panel';

        // Toolbar with test packet
        const toolbar = document.createElement('div');
        toolbar.className = 'bt-toolbar';
        toolbar.innerHTML = '<span style="font-size:0.7rem; color:var(--arena-text-dim); margin-right:4px;">Test Packet:</span>';

        this._testSrc = document.createElement('input');
        this._testSrc.placeholder = 'Src IP';
        this._testSrc.style.width = '90px';

        this._testDst = document.createElement('input');
        this._testDst.placeholder = 'Dst IP';
        this._testDst.style.width = '90px';

        this._testPort = document.createElement('input');
        this._testPort.placeholder = 'Port';
        this._testPort.style.width = '50px';

        this._testProto = document.createElement('select');
        ['tcp', 'udp', 'icmp'].forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p.toUpperCase();
            this._testProto.appendChild(opt);
        });

        const testBtn = document.createElement('button');
        testBtn.textContent = 'Test';
        testBtn.addEventListener('click', () => {
            const result = this.testPacket({
                src: this._testSrc.value || '0.0.0.0',
                dst: this._testDst.value || '0.0.0.0',
                port: parseInt(this._testPort.value) || 0,
                protocol: this._testProto.value
            });
            this._showTestResult(result);
        });

        toolbar.appendChild(this._testSrc);
        toolbar.appendChild(this._testDst);
        toolbar.appendChild(this._testPort);
        toolbar.appendChild(this._testProto);
        toolbar.appendChild(testBtn);

        // Rules table
        const tableWrap = document.createElement('div');
        tableWrap.className = 'fw-table-wrap';

        this._tableEl = document.createElement('table');
        this._tableEl.className = 'fw-table';
        this._tableEl.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Chain</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Port</th>
                    <th>Proto</th>
                    <th>Action</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        this._tbodyEl = this._tableEl.querySelector('tbody');
        tableWrap.appendChild(this._tableEl);

        // Add rule row
        const addRow = document.createElement('div');
        addRow.className = 'fw-add-row';

        this._addChain = document.createElement('select');
        ['INPUT', 'OUTPUT', 'FORWARD'].forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            this._addChain.appendChild(opt);
        });

        this._addSrc = document.createElement('input');
        this._addSrc.placeholder = 'Source (0.0.0.0/0)';

        this._addDst = document.createElement('input');
        this._addDst.placeholder = 'Destination (0.0.0.0/0)';

        this._addPort = document.createElement('input');
        this._addPort.placeholder = 'Port (any)';
        this._addPort.style.width = '60px';

        this._addProto = document.createElement('select');
        ['any', 'tcp', 'udp', 'icmp'].forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p.toUpperCase();
            this._addProto.appendChild(opt);
        });

        this._addAction = document.createElement('select');
        ['ACCEPT', 'DROP', 'REJECT'].forEach(a => {
            const opt = document.createElement('option');
            opt.value = a;
            opt.textContent = a;
            this._addAction.appendChild(opt);
        });

        const addBtn = document.createElement('button');
        addBtn.textContent = 'Add Rule';
        addBtn.addEventListener('click', () => {
            this.addRule({
                chain: this._addChain.value,
                src: this._addSrc.value || '0.0.0.0/0',
                dst: this._addDst.value || '0.0.0.0/0',
                port: this._addPort.value || 'any',
                protocol: this._addProto.value,
                action: this._addAction.value
            });
            // Reset fields
            this._addSrc.value = '';
            this._addDst.value = '';
            this._addPort.value = '';
        });

        addRow.appendChild(this._addChain);
        addRow.appendChild(this._addSrc);
        addRow.appendChild(this._addDst);
        addRow.appendChild(this._addPort);
        addRow.appendChild(this._addProto);
        addRow.appendChild(this._addAction);
        addRow.appendChild(addBtn);

        // Test result area
        this._testResultEl = document.createElement('div');
        this._testResultEl.className = 'fw-test-result';
        this._testResultEl.style.display = 'none';

        // Status bar
        this._statusBar = document.createElement('div');
        this._statusBar.className = 'bt-status-bar';
        this._statusBar.textContent = '0 rules';

        panel.appendChild(toolbar);
        panel.appendChild(tableWrap);
        panel.appendChild(addRow);
        panel.appendChild(this._testResultEl);
        panel.appendChild(this._statusBar);
        container.appendChild(panel);
    }

    addRule(rule) {
        const id = this._nextId++;
        const r = {
            id: id,
            chain: rule.chain || 'INPUT',
            src: rule.src || '0.0.0.0/0',
            dst: rule.dst || '0.0.0.0/0',
            port: rule.port || 'any',
            protocol: (rule.protocol || 'any').toLowerCase(),
            action: (rule.action || 'ACCEPT').toUpperCase()
        };
        this._rules.push(r);
        this._renderRules();

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('firewall_add_rule', { ruleId: id, chain: r.chain, action: r.action, port: r.port });
        }

        return id;
    }

    removeRule(id) {
        this._rules = this._rules.filter(r => r.id !== id);
        this._renderRules();

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('firewall_remove_rule', { ruleId: id });
        }
    }

    testPacket(packet) {
        const src = packet.src || '0.0.0.0';
        const dst = packet.dst || '0.0.0.0';
        const port = packet.port || 0;
        const protocol = (packet.protocol || 'tcp').toLowerCase();

        for (const rule of this._rules) {
            // Check protocol match
            if (rule.protocol !== 'any' && rule.protocol !== protocol) continue;

            // Check port match
            if (rule.port !== 'any') {
                const rulePort = parseInt(rule.port);
                if (!isNaN(rulePort) && rulePort !== port) continue;
            }

            // Check source IP match (simple prefix matching for CIDR)
            if (rule.src !== '0.0.0.0/0' && rule.src !== 'any') {
                if (!this._ipMatch(src, rule.src)) continue;
            }

            // Check destination IP match
            if (rule.dst !== '0.0.0.0/0' && rule.dst !== 'any') {
                if (!this._ipMatch(dst, rule.dst)) continue;
            }

            // Match found
            const action = rule.action === 'ACCEPT' ? 'allow' : 'deny';

            if (this.engine && this.engine._logEvent) {
                this.engine._logEvent('firewall_test_packet', {
                    src, dst, port, protocol, result: action, matchedRule: rule.id
                });
            }

            return { action, rule: rule, matched: true };
        }

        // Default policy: deny (implicit drop)
        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('firewall_test_packet', {
                src, dst, port, protocol, result: 'deny', matchedRule: null
            });
        }

        return { action: 'deny', rule: null, matched: false };
    }

    _ipMatch(ip, cidr) {
        // Simple match: exact or CIDR prefix
        if (cidr.includes('/')) {
            const [network, bits] = cidr.split('/');
            const maskBits = parseInt(bits);
            if (maskBits === 0) return true;
            // Simple prefix comparison for common cases
            const netParts = network.split('.');
            const ipParts = ip.split('.');
            const fullOctets = Math.floor(maskBits / 8);
            for (let i = 0; i < fullOctets && i < 4; i++) {
                if (ipParts[i] !== netParts[i]) return false;
            }
            return true;
        }
        return ip === cidr;
    }

    _renderRules() {
        this._tbodyEl.innerHTML = '';

        this._rules.forEach((r, idx) => {
            const tr = document.createElement('tr');
            const actionLower = r.action.toLowerCase();
            const rowClass = actionLower === 'accept' ? 'rule-allow' : 'rule-deny';
            tr.className = rowClass;

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${this._esc(r.chain)}</td>
                <td>${this._esc(r.src)}</td>
                <td>${this._esc(r.dst)}</td>
                <td>${this._esc(String(r.port))}</td>
                <td>${this._esc(r.protocol.toUpperCase())}</td>
                <td><strong>${this._esc(r.action)}</strong></td>
                <td class="fw-action-cell">
                    ${idx > 0 ? '<button class="fw-action-btn" data-move="up" title="Move up">UP</button>' : ''}
                    ${idx < this._rules.length - 1 ? '<button class="fw-action-btn" data-move="down" title="Move down">DN</button>' : ''}
                    <button class="fw-action-btn btn-delete" data-delete title="Delete rule">X</button>
                </td>
            `;

            // Wire action buttons
            tr.querySelectorAll('.fw-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (btn.dataset.move === 'up' && idx > 0) {
                        [this._rules[idx - 1], this._rules[idx]] = [this._rules[idx], this._rules[idx - 1]];
                        this._renderRules();
                    } else if (btn.dataset.move === 'down' && idx < this._rules.length - 1) {
                        [this._rules[idx], this._rules[idx + 1]] = [this._rules[idx + 1], this._rules[idx]];
                        this._renderRules();
                    } else if (btn.dataset.delete !== undefined) {
                        this.removeRule(r.id);
                    }
                });
            });

            this._tbodyEl.appendChild(tr);
        });

        this._statusBar.textContent = `${this._rules.length} rule${this._rules.length !== 1 ? 's' : ''}`;
    }

    _showTestResult(result) {
        this._testResultEl.style.display = 'block';
        this._testResultEl.className = 'fw-test-result result-' + result.action;

        if (result.matched) {
            this._testResultEl.textContent = `Result: ${result.action.toUpperCase()} — matched rule #${this._rules.indexOf(result.rule) + 1} (${result.rule.chain} ${result.rule.action})`;
        } else {
            this._testResultEl.textContent = 'Result: DENY — no matching rule (implicit drop)';
        }
    }

    _esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}


// ────────────────────────────────────────────────
// IDS PANEL
// ────────────────────────────────────────────────

const ArenaIDS = {
    _instances: [],

    init(container, config, engine) {
        const inst = new IDSInstance(container, config, engine);
        this._instances.push(inst);
        return inst;
    }
};

class IDSInstance {
    constructor(container, config, engine) {
        this.config = config;
        this.engine = engine;
        this._alerts = [];
        this._nextAlertId = 1;
        this._classifications = {};  // alertId -> classification
        this._filterClass = 'all';

        this._build(container);

        // Load initial alerts from config
        if (config.ids && config.ids.alerts) {
            config.ids.alerts.forEach(a => this.addAlert(a));
        }
    }

    _build(container) {
        container.innerHTML = '';
        const panel = document.createElement('div');
        panel.className = 'bt-panel';

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'bt-toolbar';

        const label = document.createElement('span');
        label.style.cssText = 'font-size:0.7rem; color:var(--arena-text-dim); margin-right:4px;';
        label.textContent = 'Filter:';

        this._filterSelect = document.createElement('select');
        const filters = [
            { value: 'all', label: 'All Alerts' },
            { value: 'unclassified', label: 'Unclassified' },
            { value: 'true-positive', label: 'True Positive' },
            { value: 'false-positive', label: 'False Positive' },
            { value: 'investigate', label: 'Needs Investigation' }
        ];
        filters.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.value;
            opt.textContent = f.label;
            this._filterSelect.appendChild(opt);
        });
        this._filterSelect.addEventListener('change', () => {
            this._filterClass = this._filterSelect.value;
            this._render();
        });

        toolbar.appendChild(label);
        toolbar.appendChild(this._filterSelect);

        // Alert list
        this._alertListEl = document.createElement('div');
        this._alertListEl.className = 'ids-alert-list';

        // Status bar
        this._statusBar = document.createElement('div');
        this._statusBar.className = 'bt-status-bar';
        this._updateStatus();

        panel.appendChild(toolbar);
        panel.appendChild(this._alertListEl);
        panel.appendChild(this._statusBar);
        container.appendChild(panel);
    }

    addAlert(alert) {
        const id = alert.id || ('ids-' + this._nextAlertId++);
        const a = {
            id: id,
            sid: alert.sid || 0,
            timestamp: alert.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            severity: (alert.severity || 'medium').toLowerCase(),
            signature: alert.signature || alert.name || '',
            description: alert.description || '',
            sourceIP: alert.sourceIP || alert.src || '',
            destIP: alert.destIP || alert.dst || '',
            sourcePort: alert.sourcePort || '',
            destPort: alert.destPort || '',
            protocol: (alert.protocol || 'TCP').toUpperCase(),
            classification: alert.classification || null,
            raw: alert
        };

        this._alerts.push(a);

        if (a.classification) {
            this._classifications[a.id] = a.classification;
        }

        this._render();

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('ids_alert', { alertId: id, severity: a.severity, signature: a.signature });
        }

        return id;
    }

    classify(alertId, classification) {
        // Valid classifications: 'true-positive', 'false-positive', 'investigate'
        const validTypes = ['true-positive', 'false-positive', 'investigate'];
        if (!validTypes.includes(classification)) return;

        this._classifications[alertId] = classification;
        this._render();

        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('ids_classify', { alertId, classification });
        }

        // Check if this classification triggers a flag
        if (this.config.ids && typeof this.config.ids.onClassify === 'function') {
            this.config.ids.onClassify(alertId, classification, this, this.engine);
        }
    }

    _render() {
        this._alertListEl.innerHTML = '';

        const filtered = this._alerts.filter(a => {
            if (this._filterClass === 'all') return true;
            if (this._filterClass === 'unclassified') return !this._classifications[a.id];
            return this._classifications[a.id] === this._filterClass;
        });

        if (filtered.length === 0) {
            this._alertListEl.innerHTML = '<div class="log-viewer-empty">No alerts match the current filter.</div>';
            this._updateStatus();
            return;
        }

        const fragment = document.createDocumentFragment();

        // Newest first
        [...filtered].reverse().forEach(a => {
            const cls = this._classifications[a.id];
            const el = document.createElement('div');
            let alertClass = 'ids-alert';
            if (cls === 'true-positive') alertClass += ' classified-tp';
            else if (cls === 'false-positive') alertClass += ' classified-fp';
            else if (cls === 'investigate') alertClass += ' classified-inv';
            el.className = alertClass;

            const clsLabel = cls
                ? `<span class="ids-classification-label cls-${cls === 'true-positive' ? 'tp' : cls === 'false-positive' ? 'fp' : 'inv'}">${cls === 'true-positive' ? 'TRUE POSITIVE' : cls === 'false-positive' ? 'FALSE POSITIVE' : 'INVESTIGATING'}</span>`
                : '';

            el.innerHTML = `
                <div class="ids-alert-header">
                    <span class="bt-badge bt-badge-${a.severity}">${a.severity}</span>
                    <span class="ids-alert-sid">[${a.sid}]</span>
                    ${clsLabel}
                    <span class="ids-alert-ts">${this._esc(a.timestamp)}</span>
                </div>
                <div class="ids-alert-sig">${this._esc(a.signature)}</div>
                <div class="ids-alert-detail">${this._esc(a.description)}</div>
                <div class="ids-alert-meta">
                    <span>${this._esc(a.sourceIP)}${a.sourcePort ? ':' + a.sourcePort : ''}</span>
                    <span>-></span>
                    <span>${this._esc(a.destIP)}${a.destPort ? ':' + a.destPort : ''}</span>
                    <span>${a.protocol}</span>
                </div>
                <div class="ids-alert-actions">
                    <button class="ids-classify-btn ${cls === 'true-positive' ? 'active-tp' : ''}" data-classify="true-positive">True Positive</button>
                    <button class="ids-classify-btn ${cls === 'false-positive' ? 'active-fp' : ''}" data-classify="false-positive">False Positive</button>
                    <button class="ids-classify-btn ${cls === 'investigate' ? 'active-inv' : ''}" data-classify="investigate">Investigate</button>
                </div>
            `;

            // Wire classify buttons
            el.querySelectorAll('.ids-classify-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.classify(a.id, btn.dataset.classify);
                });
            });

            fragment.appendChild(el);
        });

        this._alertListEl.appendChild(fragment);
        this._updateStatus();
    }

    _updateStatus() {
        const total = this._alerts.length;
        const classified = Object.keys(this._classifications).length;
        const tp = Object.values(this._classifications).filter(c => c === 'true-positive').length;
        const fp = Object.values(this._classifications).filter(c => c === 'false-positive').length;
        const inv = Object.values(this._classifications).filter(c => c === 'investigate').length;

        this._statusBar.textContent = `${total} alerts | ${classified}/${total} classified | TP: ${tp} | FP: ${fp} | INV: ${inv}`;
    }

    _esc(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}


// ────────────────────────────────────────────────
// REGISTRATION — Hook into BoxEngine._launchApp
// ────────────────────────────────────────────────

(function registerBlueTeamDevices() {
    if (typeof BoxEngine === 'undefined') {
        console.error('[BlueTeam] BoxEngine not found. Load BlueTeam.js after BoxEngine.js.');
        return;
    }

    // Store original _launchApp
    const _origLaunchApp = BoxEngine._launchApp.bind(BoxEngine);

    BoxEngine._launchApp = function(iconDef) {
        const appId = iconDef.id;

        switch (iconDef.app) {
            case 'monitoring': {
                if (this._windows[appId]) { this._focusWindow(appId); return; }
                const container = document.createElement('div');
                container.className = 'bt-panel-container';
                container.style.cssText = 'width:100%;height:100%;';
                this.openWindow(appId, iconDef.label, iconDef.icon, container);
                const inst = ArenaMonitoring.init(container, this.config, this);
                // Store reference for config callbacks
                this._blueTeam = this._blueTeam || {};
                this._blueTeam[appId] = inst;
                break;
            }
            case 'logviewer': {
                if (this._windows[appId]) { this._focusWindow(appId); return; }
                const container = document.createElement('div');
                container.className = 'bt-panel-container';
                container.style.cssText = 'width:100%;height:100%;';
                this.openWindow(appId, iconDef.label, iconDef.icon, container);
                const inst = ArenaLogViewer.init(container, this.config, this);
                this._blueTeam = this._blueTeam || {};
                this._blueTeam[appId] = inst;
                break;
            }
            case 'firewall': {
                if (this._windows[appId]) { this._focusWindow(appId); return; }
                const container = document.createElement('div');
                container.className = 'bt-panel-container';
                container.style.cssText = 'width:100%;height:100%;';
                this.openWindow(appId, iconDef.label, iconDef.icon, container);
                const inst = ArenaFirewall.init(container, this.config, this);
                this._blueTeam = this._blueTeam || {};
                this._blueTeam[appId] = inst;
                break;
            }
            case 'ids': {
                if (this._windows[appId]) { this._focusWindow(appId); return; }
                const container = document.createElement('div');
                container.className = 'bt-panel-container';
                container.style.cssText = 'width:100%;height:100%;';
                this.openWindow(appId, iconDef.label, iconDef.icon, container);
                const inst = ArenaIDS.init(container, this.config, this);
                this._blueTeam = this._blueTeam || {};
                this._blueTeam[appId] = inst;
                break;
            }
            default:
                _origLaunchApp(iconDef);
        }
    };

    console.log('%c[ARENA] BlueTeam devices registered: monitoring, logviewer, firewall, ids', 'color: #3b82f6');
})();
