/**
 * SQLTerminal.js — In-Browser SQL Terminal for Database Modules
 *
 * Uses sql.js (SQLite compiled to WASM) for real SQL execution.
 * Provides a terminal-style interface with query input, result tables,
 * and task completion hooks for module progress tracking.
 *
 * Usage:
 *   SQLTerminal.init('db-01-intro', '#terminal', {
 *       seedSQL: DB_SEED_SQL,
 *       onCommand: (sql, results, error) => { ... }
 *   });
 */

const SQLTerminal = (() => {
    let db = null;
    let moduleId = '';
    let container = null;
    let history = [];
    let historyIndex = -1;
    let onCommandCallback = null;
    let initPromise = null;

    // ── Load sql.js from CDN ──────────────────────────────────────────
    function loadSqlJs() {
        if (initPromise) return initPromise;
        initPromise = new Promise((resolve, reject) => {
            if (typeof initSqlJs !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load sql.js'));
            document.head.appendChild(script);
        });
        return initPromise;
    }

    // ── Initialize database ───────────────────────────────────────────
    async function initDB(seedSQL) {
        await loadSqlJs();
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        db = new SQL.Database();
        if (seedSQL) {
            try {
                db.run(seedSQL);
            } catch (e) {
                console.error('[SQLTerminal] Seed error:', e.message);
            }
        }
    }

    // ── Execute SQL ───────────────────────────────────────────────────
    function execute(sql) {
        if (!db) return { error: 'Database not initialized' };
        try {
            const trimmed = sql.trim();
            if (!trimmed) return { error: 'Empty query' };

            // Handle multiple statements
            const results = db.exec(trimmed);

            // For SELECT-type queries, return result set
            if (results.length > 0) {
                return { results: results };
            }

            // For non-SELECT (INSERT/UPDATE/DELETE/CREATE), return affected rows
            const changes = db.getRowsModified();
            return { message: `Query OK. ${changes} row(s) affected.` };
        } catch (e) {
            return { error: e.message };
        }
    }

    // ── Render result as HTML table ───────────────────────────────────
    function renderResult(result) {
        if (result.error) {
            return `<div class="sql-error">ERROR: ${escapeHtml(result.error)}</div>`;
        }
        if (result.message) {
            return `<div class="sql-success">${escapeHtml(result.message)}</div>`;
        }
        if (!result.results || result.results.length === 0) {
            return '<div class="sql-success">Query OK. No results returned.</div>';
        }

        let html = '';
        for (const rs of result.results) {
            const rowCount = rs.values.length;
            html += '<div class="sql-result-table-wrap"><table class="sql-result-table">';
            html += '<thead><tr>';
            for (const col of rs.columns) {
                html += `<th>${escapeHtml(col)}</th>`;
            }
            html += '</tr></thead><tbody>';
            for (const row of rs.values) {
                html += '<tr>';
                for (const val of row) {
                    const display = val === null ? '<span class="sql-null">NULL</span>' : escapeHtml(String(val));
                    html += `<td>${display}</td>`;
                }
                html += '</tr>';
            }
            html += '</tbody></table>';
            html += `<div class="sql-row-count">${rowCount} row${rowCount !== 1 ? 's' : ''}</div>`;
            html += '</div>';
        }
        return html;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── Build terminal UI ─────────────────────────────────────────────
    function buildUI(el) {
        el.innerHTML = `
            <div class="sql-terminal">
                <div class="sql-terminal-header">
                    <span class="sql-terminal-dot red"></span>
                    <span class="sql-terminal-dot yellow"></span>
                    <span class="sql-terminal-dot green"></span>
                    <span class="sql-terminal-title">SQL Console</span>
                    <button class="sql-schema-btn" id="sqlSchemaBtn" title="Show tables">TABLES</button>
                </div>
                <div class="sql-output" id="sqlOutput">
                    <div class="sql-welcome">Connected to in-memory database.<br>Type SQL queries and press Ctrl+Enter or click Run.</div>
                </div>
                <div class="sql-input-area">
                    <div class="sql-prompt">SQL&gt;</div>
                    <textarea class="sql-input" id="sqlInput" rows="3" placeholder="SELECT * FROM employees;" spellcheck="false"></textarea>
                </div>
                <div class="sql-controls">
                    <button class="sql-run-btn" id="sqlRunBtn">Run (Ctrl+Enter)</button>
                    <button class="sql-clear-btn" id="sqlClearBtn">Clear</button>
                </div>
            </div>
        `;

        const input = el.querySelector('#sqlInput');
        const output = el.querySelector('#sqlOutput');
        const runBtn = el.querySelector('#sqlRunBtn');
        const clearBtn = el.querySelector('#sqlClearBtn');
        const schemaBtn = el.querySelector('#sqlSchemaBtn');

        // Run query
        function runQuery() {
            const sql = input.value.trim();
            if (!sql) return;

            // Add to history
            if (history[history.length - 1] !== sql) {
                history.push(sql);
            }
            historyIndex = history.length;

            // Display query
            const queryDiv = document.createElement('div');
            queryDiv.className = 'sql-history-entry';
            queryDiv.innerHTML = `<div class="sql-history-query">SQL&gt; ${escapeHtml(sql)}</div>`;

            // Execute
            const result = execute(sql);
            queryDiv.innerHTML += renderResult(result);
            output.appendChild(queryDiv);
            output.scrollTop = output.scrollHeight;

            // Callback
            if (onCommandCallback) {
                onCommandCallback(sql, result.results || null, result.error || null);
            }

            input.value = '';
            input.rows = 3;
        }

        runBtn.addEventListener('click', runQuery);

        // Keyboard shortcuts
        input.addEventListener('keydown', (e) => {
            // Ctrl+Enter or Cmd+Enter to run
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runQuery();
                return;
            }

            // History navigation (when single line)
            if (e.key === 'ArrowUp' && input.value.indexOf('\n') === -1) {
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = history[historyIndex];
                }
                e.preventDefault();
            }
            if (e.key === 'ArrowDown' && input.value.indexOf('\n') === -1) {
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    input.value = history[historyIndex];
                } else {
                    historyIndex = history.length;
                    input.value = '';
                }
                e.preventDefault();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', () => {
            const lines = input.value.split('\n').length;
            input.rows = Math.max(3, Math.min(10, lines));
        });

        // Clear output
        clearBtn.addEventListener('click', () => {
            output.innerHTML = '<div class="sql-welcome">Output cleared.</div>';
        });

        // Show schema
        schemaBtn.addEventListener('click', () => {
            const sql = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;";
            const result = execute(sql);
            if (result.results && result.results[0]) {
                const tables = result.results[0].values.map(r => r[0]);
                let schemaHtml = '<div class="sql-schema-info"><strong>Tables in database:</strong><br>';
                for (const table of tables) {
                    const info = execute(`PRAGMA table_info(${table});`);
                    if (info.results && info.results[0]) {
                        schemaHtml += `<div class="sql-schema-table"><span class="sql-table-name">${table}</span> (`;
                        const cols = info.results[0].values.map(r => {
                            const name = r[1];
                            const type = r[2] || 'TEXT';
                            const pk = r[5] ? ' PK' : '';
                            return `<span class="sql-col-name">${name}</span> ${type}${pk}`;
                        });
                        schemaHtml += cols.join(', ') + ')</div>';
                    }
                }
                schemaHtml += '</div>';
                const div = document.createElement('div');
                div.className = 'sql-history-entry';
                div.innerHTML = schemaHtml;
                output.appendChild(div);
                output.scrollTop = output.scrollHeight;
            }
        });

        // Focus input
        input.focus();
    }

    // ── CSS injection ─────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('sql-terminal-styles')) return;
        const style = document.createElement('style');
        style.id = 'sql-terminal-styles';
        style.textContent = `
            .sql-terminal {
                background: #0d1117;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                height: 100%;
                overflow: hidden;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
            }
            .sql-terminal-header {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: #161b22;
                border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            .sql-terminal-dot {
                width: 10px; height: 10px; border-radius: 50%;
            }
            .sql-terminal-dot.red { background: #ff5f57; }
            .sql-terminal-dot.yellow { background: #febc2e; }
            .sql-terminal-dot.green { background: #28c840; }
            .sql-terminal-title {
                flex: 1;
                text-align: center;
                color: #8b949e;
                font-size: 0.75rem;
                font-weight: 500;
            }
            .sql-schema-btn {
                background: rgba(59,130,246,0.15);
                border: 1px solid rgba(59,130,246,0.3);
                color: #3B82F6;
                font-size: 0.65rem;
                font-family: 'JetBrains Mono', monospace;
                padding: 3px 8px;
                border-radius: 4px;
                cursor: pointer;
                letter-spacing: 0.05em;
            }
            .sql-schema-btn:hover { background: rgba(59,130,246,0.25); }
            .sql-output {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                font-size: 0.82rem;
                line-height: 1.5;
                color: #c9d1d9;
            }
            .sql-welcome { color: #8b949e; margin-bottom: 8px; }
            .sql-history-entry { margin-bottom: 12px; }
            .sql-history-query {
                color: #3B82F6;
                margin-bottom: 6px;
                white-space: pre-wrap;
                word-break: break-all;
            }
            .sql-error {
                color: #f87171;
                background: rgba(239,68,68,0.1);
                padding: 6px 10px;
                border-radius: 4px;
                border-left: 3px solid #ef4444;
            }
            .sql-success {
                color: #4ade80;
                font-style: italic;
            }
            .sql-result-table-wrap {
                overflow-x: auto;
                margin: 4px 0;
            }
            .sql-result-table {
                border-collapse: collapse;
                width: 100%;
                font-size: 0.78rem;
            }
            .sql-result-table th {
                background: rgba(59,130,246,0.12);
                color: #93c5fd;
                text-align: left;
                padding: 5px 10px;
                border: 1px solid rgba(255,255,255,0.08);
                font-weight: 600;
                white-space: nowrap;
            }
            .sql-result-table td {
                padding: 4px 10px;
                border: 1px solid rgba(255,255,255,0.06);
                color: #c9d1d9;
                white-space: nowrap;
            }
            .sql-result-table tr:nth-child(even) td {
                background: rgba(255,255,255,0.02);
            }
            .sql-result-table tr:hover td {
                background: rgba(59,130,246,0.06);
            }
            .sql-null { color: #6b7280; font-style: italic; }
            .sql-row-count {
                color: #6b7280;
                font-size: 0.72rem;
                margin-top: 4px;
            }
            .sql-schema-info {
                color: #8b949e;
                font-size: 0.78rem;
                line-height: 1.8;
            }
            .sql-schema-table { margin-left: 12px; }
            .sql-table-name { color: #93c5fd; font-weight: 600; }
            .sql-col-name { color: #4ade80; }
            .sql-input-area {
                display: flex;
                gap: 0;
                border-top: 1px solid rgba(255,255,255,0.08);
                background: #0d1117;
            }
            .sql-prompt {
                padding: 10px 4px 10px 12px;
                color: #3B82F6;
                font-size: 0.82rem;
                font-weight: 600;
                line-height: 1.5;
                flex-shrink: 0;
            }
            .sql-input {
                flex: 1;
                background: transparent;
                border: none;
                color: #e0e0e0;
                font-family: 'JetBrains Mono', 'Consolas', monospace;
                font-size: 0.82rem;
                line-height: 1.5;
                padding: 10px 12px 10px 6px;
                resize: none;
                outline: none;
            }
            .sql-input::placeholder { color: #4b5563; }
            .sql-controls {
                display: flex;
                gap: 8px;
                padding: 8px 12px;
                background: #161b22;
                border-top: 1px solid rgba(255,255,255,0.08);
            }
            .sql-run-btn {
                background: linear-gradient(135deg, #3B82F6, #2563EB);
                border: none;
                color: #fff;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.75rem;
                font-weight: 600;
                padding: 6px 16px;
                border-radius: 4px;
                cursor: pointer;
                letter-spacing: 0.03em;
            }
            .sql-run-btn:hover { filter: brightness(1.1); }
            .sql-clear-btn {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                color: #8b949e;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.75rem;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
            }
            .sql-clear-btn:hover { background: rgba(255,255,255,0.1); }
        `;
        document.head.appendChild(style);
    }

    // ── Public API ────────────────────────────────────────────────────
    return {
        /**
         * Initialize the SQL terminal
         * @param {string} modId - Module ID for progress tracking
         * @param {string} selector - CSS selector for container element
         * @param {Object} opts - Options
         * @param {string} opts.seedSQL - SQL to seed the database
         * @param {Function} opts.onCommand - Callback(sql, results, error)
         */
        async init(modId, selector, opts = {}) {
            moduleId = modId;
            container = document.querySelector(selector);
            if (!container) {
                console.error('[SQLTerminal] Container not found:', selector);
                return;
            }

            onCommandCallback = opts.onCommand || null;

            // Show loading state
            container.innerHTML = '<div style="color:#8b949e;padding:20px;font-family:monospace;text-align:center;">Loading SQL engine...</div>';

            injectStyles();

            try {
                await initDB(opts.seedSQL || '');
                buildUI(container);
            } catch (e) {
                container.innerHTML = `<div style="color:#f87171;padding:20px;font-family:monospace;">Failed to load SQL engine: ${e.message}<br><br>Check your internet connection (sql.js loads from CDN).</div>`;
                console.error('[SQLTerminal] Init error:', e);
            }
        },

        /** Execute SQL and return result (for programmatic use) */
        exec(sql) {
            return execute(sql);
        },

        /** Get the database instance */
        getDB() {
            return db;
        }
    };
})();
