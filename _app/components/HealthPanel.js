/**
 * HealthPanel.js - System Health Dashboard UI
 * Hexworth Prime
 *
 * Renders HED error log data in a filterable, exportable panel.
 * Follows AchievementPanel.js pattern: IIFE, injectStyles(), render(container).
 *
 * Requires: HED.js
 *
 * @version 1.0.0
 */

const HealthPanel = (function() {
    'use strict';

    let _container = null;
    let _filter = 'all';

    const CODE_LABELS = {
        'HED-001': 'JS Error',
        'HED-002': 'Rejection',
        'HED-003': 'Console',
        'HED-004': 'Resource'
    };

    const CODE_COLORS = {
        'HED-001': '#f87171',
        'HED-002': '#fbbf24',
        'HED-003': '#60a5fa',
        'HED-004': '#c084fc'
    };

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    function injectStyles() {
        if (document.getElementById('health-panel-styles')) return;
        const style = document.createElement('style');
        style.id = 'health-panel-styles';
        style.textContent = `
            .hp-container { padding: 15px 5px; font-family: inherit; }

            /* Stats row */
            .hp-stats {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }
            .hp-stat-card {
                text-align: center;
                padding: 12px 8px;
                border-radius: 10px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .hp-stat-value {
                font-size: 1.6rem;
                font-weight: 700;
                font-family: 'Courier New', monospace;
            }
            .hp-stat-label {
                font-size: 0.7rem;
                opacity: 0.6;
                margin-top: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .hp-green { color: #4ade80; }
            .hp-yellow { color: #fbbf24; }
            .hp-red { color: #f87171; }

            /* Controls */
            .hp-controls {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 15px;
                align-items: center;
            }
            .hp-btn {
                padding: 6px 14px;
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.15);
                background: rgba(255,255,255,0.05);
                color: #ccc;
                cursor: pointer;
                font-size: 0.75rem;
                transition: all 0.15s;
            }
            .hp-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
            .hp-btn.active {
                background: rgba(96, 165, 250, 0.2);
                border-color: #60a5fa;
                color: #60a5fa;
            }
            .hp-btn-action {
                margin-left: auto;
                padding: 6px 14px;
                border-radius: 6px;
                border: 1px solid rgba(255,255,255,0.15);
                background: rgba(255,255,255,0.05);
                color: #ccc;
                cursor: pointer;
                font-size: 0.75rem;
                transition: all 0.15s;
            }
            .hp-btn-action:hover { background: rgba(255,255,255,0.1); color: #fff; }
            .hp-btn-danger:hover { background: rgba(248,113,113,0.2); color: #f87171; border-color: #f87171; }

            /* Error list */
            .hp-list { display: flex; flex-direction: column; gap: 8px; max-height: 50vh; overflow-y: auto; }
            .hp-card {
                display: grid;
                grid-template-columns: 80px 1fr;
                gap: 12px;
                padding: 12px;
                border-radius: 8px;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.08);
                font-size: 0.8rem;
                align-items: start;
            }
            .hp-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.7rem;
                font-weight: 600;
                font-family: 'Courier New', monospace;
                text-align: center;
            }
            .hp-card-body { min-width: 0; }
            .hp-card-msg {
                word-break: break-word;
                color: #e5e5e5;
                line-height: 1.4;
            }
            .hp-card-meta {
                margin-top: 6px;
                font-size: 0.7rem;
                opacity: 0.5;
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }

            /* Empty state */
            .hp-empty {
                text-align: center;
                padding: 50px 20px;
                opacity: 0.5;
            }
            .hp-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
            .hp-empty-text { font-size: 0.9rem; }

            @media (max-width: 600px) {
                .hp-stats { grid-template-columns: repeat(3, 1fr); }
                .hp-card { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(style);
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════

    function colorClass(count) {
        if (count === 0) return 'hp-green';
        if (count < 10) return 'hp-yellow';
        return 'hp-red';
    }

    function formatTime(iso) {
        if (!iso) return '';
        try {
            var d = new Date(iso);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
        } catch (e) { return iso; }
    }

    function truncate(str, len) {
        if (!str) return '';
        return str.length > len ? str.substring(0, len) + '...' : str;
    }

    function renderStats(stats) {
        var codes = ['HED-001', 'HED-002', 'HED-003', 'HED-004'];
        var html = '<div class="hp-stats">';
        html += '<div class="hp-stat-card"><div class="hp-stat-value ' + colorClass(stats.total) + '">' +
                stats.total + '</div><div class="hp-stat-label">Total</div></div>';
        codes.forEach(function(code) {
            var count = stats.byCodes[code] || 0;
            html += '<div class="hp-stat-card"><div class="hp-stat-value ' + colorClass(count) + '">' +
                    count + '</div><div class="hp-stat-label">' + CODE_LABELS[code] + '</div></div>';
        });
        html += '</div>';
        return html;
    }

    function renderControls() {
        var filters = [
            { key: 'all', label: 'All' },
            { key: 'HED-001', label: 'JS Errors' },
            { key: 'HED-002', label: 'Rejections' },
            { key: 'HED-003', label: 'Console' },
            { key: 'HED-004', label: 'Resources' }
        ];
        var html = '<div class="hp-controls">';
        filters.forEach(function(f) {
            html += '<button class="hp-btn' + (_filter === f.key ? ' active' : '') +
                    '" data-filter="' + f.key + '">' + f.label + '</button>';
        });
        html += '<button class="hp-btn-action" data-action="export">Export JSON</button>';
        html += '<button class="hp-btn-action hp-btn-danger" data-action="clear">Clear Log</button>';
        html += '</div>';
        return html;
    }

    function renderList(log) {
        if (log.length === 0) {
            return '<div class="hp-empty">' +
                   '<div class="hp-empty-icon">&#x2705;</div>' +
                   '<div class="hp-empty-text">All Systems Green</div>' +
                   '</div>';
        }

        var filtered = _filter === 'all' ? log : log.filter(function(e) { return e.code === _filter; });

        if (filtered.length === 0) {
            return '<div class="hp-empty">' +
                   '<div class="hp-empty-text">No ' + (CODE_LABELS[_filter] || '') + ' errors</div>' +
                   '</div>';
        }

        // Newest first
        var sorted = filtered.slice().reverse();

        var html = '<div class="hp-list">';
        sorted.forEach(function(entry) {
            var color = CODE_COLORS[entry.code] || '#ccc';
            html += '<div class="hp-card">';
            html += '<div><span class="hp-badge" style="background:' + color + '22;color:' + color +
                    ';border:1px solid ' + color + '44">' + entry.code + '</span></div>';
            html += '<div class="hp-card-body">';
            html += '<div class="hp-card-msg">' + escapeHtml(truncate(entry.message, 300)) + '</div>';
            html += '<div class="hp-card-meta">';
            html += '<span>' + formatTime(entry.timestamp) + '</span>';
            if (entry.source) html += '<span>' + escapeHtml(truncate(entry.source, 100)) + '</span>';
            html += '<span>' + escapeHtml(truncate(entry.url, 80)) + '</span>';
            html += '</div></div></div>';
        });
        html += '</div>';
        return html;
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function render(container) {
        if (!container) return;
        _container = container;
        injectStyles();

        var hedAvailable = typeof HED !== 'undefined';
        if (!hedAvailable) {
            container.innerHTML = '<div class="hp-empty"><div class="hp-empty-text">HED agent not loaded on this page.</div></div>';
            return;
        }

        var stats = HED.getStats();
        var log = HED.getLog();

        var html = '<div class="hp-container">';
        html += renderStats(stats);
        html += renderControls();
        html += renderList(log);
        html += '</div>';

        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.hp-btn[data-filter]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                _filter = btn.getAttribute('data-filter');
                render(container);
            });
        });

        container.querySelectorAll('.hp-btn-action[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = btn.getAttribute('data-action');
                if (action === 'export') {
                    HED.export();
                } else if (action === 'clear') {
                    if (confirm('Clear all HED error logs?')) {
                        HED.clear();
                        render(container);
                    }
                }
            });
        });
    }

    // Listen for real-time updates — re-render if panel is visible
    window.addEventListener('hexworth:hedError', function() {
        if (_container && _container.offsetParent !== null) {
            render(_container);
        }
    });

    return {
        render: render
    };
})();
