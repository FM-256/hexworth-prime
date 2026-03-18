/**
 * CodeRunner.js - In-Browser Code Execution via WASM
 *
 * Supports: Python (Pyodide), SQL (sql.js), JavaScript (iframe sandbox)
 * C/C++ planned for Phase 2 (Container Sandbox)
 *
 * Usage:
 *   <script src="/components/CodeRunner.js"></script>
 *   <div class="code-runner" data-lang="python">
 *     <pre>print("hello")</pre>
 *   </div>
 *
 * Or auto-enhance existing code blocks:
 *   CodeRunner.enhanceAll('.code-block[data-runnable]');
 */

class CodeRunner {
    static _pyodideReady = null;
    static _sqlReady = null;
    static _instances = [];

    constructor(container, options = {}) {
        this.container = container;
        this.lang = (options.lang || container.dataset.lang || 'javascript').toLowerCase();
        this.editable = options.editable !== false;
        this.theme = options.theme || 'dark';
        this.maxOutputLines = options.maxOutputLines || 200;
        this.timeout = options.timeout || 10000;
        this.originalCode = '';
        this._running = false;

        CodeRunner._instances.push(this);
    }

    /**
     * Initialize the runner UI
     */
    init() {
        // Extract code from container
        const pre = this.container.querySelector('pre');
        if (!pre) return this;

        this.originalCode = this._extractPlainText(pre);

        // Build the runner UI
        this._buildUI(pre);

        return this;
    }

    /**
     * Extract plain text from syntax-highlighted HTML
     */
    _extractPlainText(pre) {
        const clone = pre.cloneNode(true);
        return clone.textContent || clone.innerText || '';
    }

    /**
     * Build the runner interface
     */
    _buildUI(pre) {
        // Wrap original content
        const wrapper = document.createElement('div');
        wrapper.className = 'cr-wrapper';

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'cr-toolbar';
        toolbar.innerHTML = `
            <div class="cr-toolbar-left">
                <span class="cr-lang-badge cr-lang-${this.lang}">${this._langLabel()}</span>
                ${this.editable ? '<span class="cr-edit-hint">editable</span>' : ''}
            </div>
            <div class="cr-toolbar-right">
                <button class="cr-btn cr-btn-reset" title="Reset code" aria-label="Reset code to original">
                    <img src="/_app/assets/images/icons/icon-refresh.webp" alt="" style="width:14px;height:14px;vertical-align:middle;filter:brightness(0.8)">
                </button>
                <button class="cr-btn cr-btn-copy" title="Copy code" aria-label="Copy code to clipboard">
                    <img src="/_app/assets/images/icons/icon-clipboard.webp" alt="" style="width:14px;height:14px;vertical-align:middle;filter:brightness(0.8)">
                </button>
                <button class="cr-btn cr-btn-run" title="Run code (Ctrl+Enter)" aria-label="Run code">
                    <img src="/_app/assets/images/icons/icon-play.webp" alt="" style="width:14px;height:14px;vertical-align:middle"> Run
                </button>
            </div>
        `;

        // Code editor area
        const editor = document.createElement('div');
        editor.className = 'cr-editor';
        if (this.editable) {
            editor.contentEditable = 'true';
            editor.spellcheck = false;
            editor.setAttribute('role', 'textbox');
            editor.setAttribute('aria-label', `${this._langLabel()} code editor`);
            editor.setAttribute('aria-multiline', 'true');
        }
        // Preserve original highlighted HTML for display
        editor.innerHTML = pre.innerHTML;

        // Output panel (hidden initially)
        const output = document.createElement('div');
        output.className = 'cr-output cr-hidden';
        output.setAttribute('role', 'log');
        output.setAttribute('aria-label', 'Code output');
        output.setAttribute('aria-live', 'polite');
        output.innerHTML = `
            <div class="cr-output-header">
                <span>Output</span>
                <button class="cr-btn cr-btn-clear" title="Clear output" aria-label="Clear output">Clear</button>
            </div>
            <pre class="cr-output-content"></pre>
        `;

        // Loading indicator
        const loader = document.createElement('div');
        loader.className = 'cr-loader cr-hidden';
        loader.innerHTML = '<span class="cr-spinner"></span> Loading runtime...';

        // Assemble
        wrapper.appendChild(toolbar);
        wrapper.appendChild(editor);
        wrapper.appendChild(loader);
        wrapper.appendChild(output);

        // Replace original pre
        pre.replaceWith(wrapper);

        // Store refs
        this._editor = editor;
        this._output = output;
        this._outputContent = output.querySelector('.cr-output-content');
        this._loader = loader;
        this._runBtn = toolbar.querySelector('.cr-btn-run');
        this._resetBtn = toolbar.querySelector('.cr-btn-reset');
        this._copyBtn = toolbar.querySelector('.cr-btn-copy');
        this._clearBtn = output.querySelector('.cr-btn-clear');

        // Bind events
        this._runBtn.addEventListener('click', () => this.run());
        this._resetBtn.addEventListener('click', () => this.reset());
        this._copyBtn.addEventListener('click', () => this.copyCode());
        this._clearBtn.addEventListener('click', () => this.clearOutput());

        // Ctrl+Enter to run
        editor.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.run();
            }
            // Tab inserts spaces instead of changing focus
            if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand('insertText', false, '    ');
            }
        });

        // Inject styles once
        CodeRunner._injectStyles();
    }

    /**
     * Get current code from editor
     */
    getCode() {
        if (!this._editor) return this.originalCode;
        return this._editor.textContent || this._editor.innerText || '';
    }

    /**
     * Run the code
     */
    async run() {
        if (this._running) return;
        this._running = true;
        this._runBtn.disabled = true;
        this._runBtn.classList.add('cr-running');

        const code = this.getCode().trim();
        if (!code) {
            this._showOutput('No code to run.', 'error');
            this._running = false;
            this._runBtn.disabled = false;
            this._runBtn.classList.remove('cr-running');
            return;
        }

        try {
            let result;
            switch (this.lang) {
                case 'python':
                    result = await this._runPython(code);
                    break;
                case 'sql':
                    result = await this._runSQL(code);
                    break;
                case 'javascript':
                case 'js':
                    result = await this._runJavaScript(code);
                    break;
                case 'c':
                case 'cpp':
                case 'c++':
                    result = { output: 'C/C++ sandbox coming soon. Use the Container Sandbox for compiled languages.', type: 'info' };
                    break;
                default:
                    result = { output: `Language "${this.lang}" not supported for in-browser execution.`, type: 'error' };
            }
            this._showOutput(result.output, result.type || 'success');
        } catch (err) {
            this._showOutput(err.message || String(err), 'error');
        }

        this._running = false;
        this._runBtn.disabled = false;
        this._runBtn.classList.remove('cr-running');
    }

    /**
     * Python execution via Pyodide
     */
    async _runPython(code) {
        if (!CodeRunner._pyodideReady) {
            this._showLoader('Loading Python runtime...');
            CodeRunner._pyodideReady = this._loadPyodide();
        }

        const pyodide = await CodeRunner._pyodideReady;
        this._hideLoader();

        // Capture stdout/stderr
        let stdout = '';
        let stderr = '';

        pyodide.setStdout({ batched: (msg) => { stdout += msg + '\n'; } });
        pyodide.setStderr({ batched: (msg) => { stderr += msg + '\n'; } });

        try {
            const result = await this._withTimeout(
                pyodide.runPythonAsync(code),
                this.timeout
            );

            let output = stdout;
            if (result !== undefined && result !== null && String(result) !== 'undefined') {
                const resultStr = String(result);
                if (resultStr && !stdout.includes(resultStr)) {
                    output += resultStr + '\n';
                }
            }
            if (stderr) {
                output += stderr;
            }

            return {
                output: output.trim() || '(no output)',
                type: stderr ? 'warning' : 'success'
            };
        } catch (err) {
            return {
                output: (stdout ? stdout + '\n' : '') + String(err),
                type: 'error'
            };
        }
    }

    /**
     * Load Pyodide from CDN
     */
    async _loadPyodide() {
        if (typeof loadPyodide === 'function') {
            return await loadPyodide();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
            script.onload = async () => {
                try {
                    const pyodide = await loadPyodide({
                        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/'
                    });
                    resolve(pyodide);
                } catch (err) {
                    reject(err);
                }
            };
            script.onerror = () => reject(new Error('Failed to load Python runtime'));
            document.head.appendChild(script);
        });
    }

    /**
     * SQL execution via sql.js
     */
    async _runSQL(code) {
        if (!CodeRunner._sqlReady) {
            this._showLoader('Loading SQL engine...');
            CodeRunner._sqlReady = this._loadSqlJs();
        }

        const SQL = await CodeRunner._sqlReady;
        this._hideLoader();

        try {
            const db = new SQL.Database();

            // Pre-load sample tables for learning
            db.run(`
                CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, role TEXT, department TEXT, last_login TEXT);
                INSERT INTO users VALUES (1, 'admin', 'Administrator', 'IT', '2026-03-15');
                INSERT INTO users VALUES (2, 'jsmith', 'Analyst', 'Security', '2026-03-14');
                INSERT INTO users VALUES (3, 'mjones', 'Developer', 'Engineering', '2026-03-13');
                INSERT INTO users VALUES (4, 'klee', 'Manager', 'Operations', '2026-03-12');
                INSERT INTO users VALUES (5, 'dchen', 'Intern', 'IT', '2026-03-10');

                CREATE TABLE IF NOT EXISTS incidents (id INTEGER PRIMARY KEY, title TEXT, severity TEXT, status TEXT, assigned_to INTEGER, created_at TEXT);
                INSERT INTO incidents VALUES (1, 'Phishing campaign detected', 'High', 'Open', 2, '2026-03-14');
                INSERT INTO incidents VALUES (2, 'Failed login attempts', 'Medium', 'Investigating', 2, '2026-03-13');
                INSERT INTO incidents VALUES (3, 'Outdated SSL certificate', 'Low', 'Resolved', 3, '2026-03-10');
                INSERT INTO incidents VALUES (4, 'Unauthorized access attempt', 'Critical', 'Open', 1, '2026-03-15');
                INSERT INTO incidents VALUES (5, 'Malware on workstation', 'High', 'Investigating', 4, '2026-03-12');

                CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, timestamp TEXT, source_ip TEXT, event_type TEXT, details TEXT);
                INSERT INTO logs VALUES (1, '2026-03-15 09:00:00', '192.168.1.100', 'LOGIN', 'User admin logged in');
                INSERT INTO logs VALUES (2, '2026-03-15 09:05:00', '10.0.0.50', 'FAILED_LOGIN', 'Invalid password for jsmith');
                INSERT INTO logs VALUES (3, '2026-03-15 09:10:00', '192.168.1.100', 'FILE_ACCESS', 'admin accessed /etc/shadow');
                INSERT INTO logs VALUES (4, '2026-03-15 09:15:00', '172.16.0.1', 'NETWORK', 'Port scan detected');
                INSERT INTO logs VALUES (5, '2026-03-15 09:20:00', '10.0.0.50', 'LOGIN', 'User jsmith logged in');
            `);

            const statements = code.split(';').filter(s => s.trim());
            let output = '';

            for (const stmt of statements) {
                const trimmed = stmt.trim();
                if (!trimmed) continue;

                try {
                    const results = db.exec(trimmed);
                    if (results.length > 0) {
                        for (const result of results) {
                            // Format as table
                            output += this._formatSqlTable(result.columns, result.values);
                            output += '\n';
                        }
                    } else if (/^(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(trimmed)) {
                        const changes = db.getRowsModified();
                        output += `Query OK, ${changes} row(s) affected\n`;
                    }
                } catch (err) {
                    output += `ERROR: ${err.message}\n`;
                }
            }

            db.close();
            return { output: output.trim() || '(no results)', type: 'success' };
        } catch (err) {
            return { output: String(err), type: 'error' };
        }
    }

    /**
     * Format SQL results as ASCII table
     */
    _formatSqlTable(columns, rows) {
        if (!columns.length) return '';

        // Calculate column widths
        const widths = columns.map((col, i) => {
            let max = col.length;
            for (const row of rows) {
                const val = String(row[i] === null ? 'NULL' : row[i]);
                if (val.length > max) max = val.length;
            }
            return Math.min(max, 30); // Cap width
        });

        const separator = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
        const formatRow = (vals) => '| ' + vals.map((v, i) => {
            const s = String(v === null ? 'NULL' : v);
            return s.substring(0, widths[i]).padEnd(widths[i]);
        }).join(' | ') + ' |';

        let out = separator + '\n';
        out += formatRow(columns) + '\n';
        out += separator + '\n';
        for (const row of rows) {
            out += formatRow(row) + '\n';
        }
        out += separator + '\n';
        out += `${rows.length} row(s)\n`;

        return out;
    }

    /**
     * Load sql.js from CDN
     */
    async _loadSqlJs() {
        if (typeof initSqlJs === 'function') {
            return await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` });
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://sql.js.org/dist/sql-wasm.js';
            script.onload = async () => {
                try {
                    const SQL = await initSqlJs({
                        locateFile: file => `https://sql.js.org/dist/${file}`
                    });
                    resolve(SQL);
                } catch (err) {
                    reject(err);
                }
            };
            script.onerror = () => reject(new Error('Failed to load SQL engine'));
            document.head.appendChild(script);
        });
    }

    /**
     * JavaScript execution via sandboxed iframe
     */
    async _runJavaScript(code) {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.sandbox = 'allow-scripts';
            document.body.appendChild(iframe);

            let output = '';
            let resolved = false;

            const cleanup = () => {
                if (!resolved) {
                    resolved = true;
                    window.removeEventListener('message', handler);
                    clearTimeout(timer);
                    iframe.remove();
                }
            };

            const handler = (e) => {
                if (e.source !== iframe.contentWindow) return;
                const data = e.data;
                if (data && data._cr_type === 'output') {
                    output += data.text + '\n';
                } else if (data && data._cr_type === 'done') {
                    cleanup();
                    resolve({ output: output.trim() || '(no output)', type: 'success' });
                } else if (data && data._cr_type === 'error') {
                    cleanup();
                    resolve({ output: (output ? output + '\n' : '') + data.text, type: 'error' });
                }
            };

            window.addEventListener('message', handler);

            // Timeout
            const timer = setTimeout(() => {
                cleanup();
                resolve({ output: (output ? output + '\n' : '') + 'Execution timed out (10s limit)', type: 'error' });
            }, this.timeout);

            // Build sandbox code
            const sandboxCode = `
                <script>
                    const _output = [];
                    const _origLog = console.log;
                    console.log = function(...args) {
                        const text = args.map(a => {
                            if (typeof a === 'object') return JSON.stringify(a, null, 2);
                            return String(a);
                        }).join(' ');
                        parent.postMessage({ _cr_type: 'output', text }, '*');
                    };
                    console.error = console.warn = console.info = console.log;
                    console.table = function(data) {
                        console.log(JSON.stringify(data, null, 2));
                    };
                    try {
                        const _result = eval(${JSON.stringify(code)});
                        if (_result !== undefined) {
                            console.log(_result);
                        }
                        parent.postMessage({ _cr_type: 'done' }, '*');
                    } catch(e) {
                        parent.postMessage({ _cr_type: 'error', text: e.toString() }, '*');
                    }
                <\/script>
            `;

            iframe.srcdoc = sandboxCode;
        });
    }

    /**
     * Show output panel
     */
    _showOutput(text, type = 'success') {
        if (!this._output || !this._outputContent) return;

        // Truncate if too long
        const lines = text.split('\n');
        let displayText = text;
        if (lines.length > this.maxOutputLines) {
            displayText = lines.slice(0, this.maxOutputLines).join('\n') + `\n... (${lines.length - this.maxOutputLines} more lines truncated)`;
        }

        this._outputContent.textContent = displayText;
        this._outputContent.className = 'cr-output-content cr-output-' + type;
        this._output.classList.remove('cr-hidden');
    }

    /**
     * Clear output
     */
    clearOutput() {
        if (this._outputContent) this._outputContent.textContent = '';
        if (this._output) this._output.classList.add('cr-hidden');
    }

    /**
     * Reset code to original
     */
    reset() {
        if (this._editor) {
            this._editor.textContent = this.originalCode;
        }
        this.clearOutput();
    }

    /**
     * Copy code to clipboard
     */
    async copyCode() {
        const code = this.getCode();
        try {
            await navigator.clipboard.writeText(code);
            this._flashButton(this._copyBtn, 'Copied!');
        } catch {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = code;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
            this._flashButton(this._copyBtn, 'Copied!');
        }
    }

    /**
     * Flash button text briefly
     */
    _flashButton(btn, text) {
        const original = btn.innerHTML;
        btn.textContent = text;
        btn.classList.add('cr-flash');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('cr-flash');
        }, 1200);
    }

    /**
     * Show/hide loader
     */
    _showLoader(msg) {
        if (this._loader) {
            this._loader.querySelector('.cr-spinner + span, .cr-spinner')
                && (this._loader.innerHTML = `<span class="cr-spinner"></span> ${msg}`);
            this._loader.classList.remove('cr-hidden');
        }
    }

    _hideLoader() {
        if (this._loader) this._loader.classList.add('cr-hidden');
    }

    /**
     * Timeout wrapper
     */
    _withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Execution timed out (${ms / 1000}s limit)`)), ms)
            )
        ]);
    }

    /**
     * Language display label
     */
    _langLabel() {
        const labels = {
            python: 'Python',
            javascript: 'JavaScript',
            js: 'JavaScript',
            sql: 'SQL',
            c: 'C',
            cpp: 'C++',
            'c++': 'C++',
            bash: 'Bash'
        };
        return labels[this.lang] || this.lang;
    }

    /**
     * Auto-enhance existing code blocks with [data-runnable]
     */
    static enhanceAll(selector = '.code-block[data-runnable]') {
        const blocks = document.querySelectorAll(selector);
        blocks.forEach(block => {
            const lang = block.dataset.lang || block.dataset.runnable || 'javascript';
            const runner = new CodeRunner(block, { lang });
            runner.init();
        });
    }

    /**
     * Inject styles (once)
     */
    static _injectStyles() {
        if (document.getElementById('cr-styles')) return;

        const style = document.createElement('style');
        style.id = 'cr-styles';
        style.textContent = `
            .cr-wrapper {
                background: #0d1117;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                overflow: hidden;
                margin: 14px 0;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
            }

            .cr-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.03);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }

            .cr-toolbar-left, .cr-toolbar-right {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .cr-lang-badge {
                font-size: 0.7rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                padding: 2px 8px;
                border-radius: 3px;
                color: #fff;
            }

            .cr-lang-python { background: #306998; }
            .cr-lang-javascript, .cr-lang-js { background: #f0db4f; color: #333; }
            .cr-lang-sql { background: #e48e00; }
            .cr-lang-c { background: #555555; }
            .cr-lang-cpp, .cr-lang-c\\+ { background: #00599c; }
            .cr-lang-bash { background: #4EAA25; }

            .cr-edit-hint {
                font-size: 0.65rem;
                color: rgba(255, 255, 255, 0.3);
                font-style: italic;
            }

            .cr-btn {
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #8b949e;
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 0.75rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                transition: all 0.2s;
                font-family: 'Inter', system-ui, sans-serif;
            }

            .cr-btn:hover {
                color: #e0e0e0;
                border-color: rgba(255, 255, 255, 0.3);
                background: rgba(255, 255, 255, 0.05);
            }

            .cr-btn:focus-visible {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }

            .cr-btn-run {
                background: rgba(78, 201, 176, 0.15);
                border-color: rgba(78, 201, 176, 0.3);
                color: #4EC9B0;
                font-weight: 600;
            }

            .cr-btn-run:hover {
                background: rgba(78, 201, 176, 0.25);
                color: #6fe0c8;
            }

            .cr-btn-run.cr-running {
                opacity: 0.6;
                cursor: wait;
            }

            .cr-btn.cr-flash {
                background: rgba(78, 201, 176, 0.2);
                color: #4EC9B0;
                border-color: rgba(78, 201, 176, 0.4);
            }

            .cr-editor {
                padding: 16px;
                font-size: 0.85rem;
                line-height: 1.7;
                color: #e0e0e0;
                min-height: 60px;
                max-height: 400px;
                overflow-y: auto;
                white-space: pre;
                outline: none;
                tab-size: 4;
            }

            .cr-editor:focus {
                box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.3);
            }

            .cr-editor .comment { color: #6a737d; }
            .cr-editor .keyword { color: #ff7b72; }
            .cr-editor .string { color: #a5d6ff; }
            .cr-editor .builtin { color: #79c0ff; }
            .cr-editor .number { color: #79c0ff; }
            .cr-editor .output { color: #4EC9B0; }

            .cr-output {
                border-top: 1px solid rgba(255, 255, 255, 0.08);
            }

            .cr-output-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.02);
                font-size: 0.7rem;
                color: #8b949e;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .cr-output-content {
                padding: 12px 16px;
                font-size: 0.82rem;
                line-height: 1.6;
                color: #4EC9B0;
                white-space: pre-wrap;
                word-break: break-word;
                max-height: 300px;
                overflow-y: auto;
                margin: 0;
                font-family: 'JetBrains Mono', monospace;
            }

            .cr-output-error { color: #f85149; }
            .cr-output-warning { color: #d29922; }
            .cr-output-info { color: #79c0ff; }
            .cr-output-success { color: #4EC9B0; }

            .cr-hidden { display: none !important; }

            .cr-loader {
                padding: 12px 16px;
                font-size: 0.8rem;
                color: #8b949e;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .cr-spinner {
                width: 14px;
                height: 14px;
                border: 2px solid rgba(255, 255, 255, 0.1);
                border-top-color: #4EC9B0;
                border-radius: 50%;
                animation: crSpin 0.6s linear infinite;
                display: inline-block;
            }

            @keyframes crSpin {
                to { transform: rotate(360deg); }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .cr-spinner { animation: none; border-top-color: #4EC9B0; opacity: 0.6; }
                .cr-btn { transition: none; }
            }

            /* High contrast */
            @media (prefers-contrast: more) {
                .cr-wrapper { border-color: rgba(255, 255, 255, 0.4); }
                .cr-toolbar { border-bottom-color: rgba(255, 255, 255, 0.3); }
                .cr-btn { border-color: rgba(255, 255, 255, 0.4); }
            }

            /* Mobile */
            @media (max-width: 600px) {
                .cr-editor { padding: 12px; font-size: 0.78rem; }
                .cr-output-content { padding: 10px 12px; font-size: 0.78rem; }
                .cr-edit-hint { display: none; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-init on DOMContentLoaded
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        CodeRunner.enhanceAll();
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeRunner;
}
