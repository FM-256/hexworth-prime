/**
 * PythonSandbox.js - Full IDE Lab Environment for Python for IT
 *
 * The core engine that powers all weekly Python lab pages. Each lab page
 * calls PythonSandbox.init() with a list of challenges and gets a complete,
 * multi-panel IDE rendered into a target container.
 *
 * == Layout ==
 *   [ Top Bar: title, shortcuts, nav ]
 *   [ Sidebar | Description + Editor + Output | Variable Inspector ]
 *   [ Status Bar: streak, timer, XP ]
 *
 * == Architecture ==
 *   - Single IIFE exporting a PythonSandbox global object
 *   - All state lives in the _state object (in memory) + localStorage (persistence)
 *   - Pyodide (Python WASM runtime) is lazy-loaded on first Run/Submit
 *   - Styles are injected via _injectStyles() — no external CSS file required
 *   - Input simulation: interactive in Run mode, automated (from config) in Submit mode
 *   - Error translator maps cryptic Python errors to plain English explanations
 *
 * == Public API ==
 *   PythonSandbox.init(config)   - Render the sandbox into containerId
 *
 * == Config Shape ==
 *   {
 *     containerId: 'sandbox-root',
 *     title: 'Week 1 Lab',
 *     moduleId: 'pfi-w1-sandbox',
 *     houseId: 'code',
 *     returnUrl: '../index.html',
 *     challenges: [ { id, title, difficulty, xp, parTime, instructions,
 *                      expected, starter, hints, testInputs, tests } ]
 *   }
 *
 * == Dependencies ==
 *   - Pyodide CDN (loaded lazily on first run)
 *   - ModuleProgress.js (optional, for completion tracking)
 *
 * @author Hexworth Prime
 * @version 1.0.0
 * @created 2026-04-03
 */

/* Assign to window explicitly so lab pages in separate <script> blocks can call PythonSandbox.init() */
window.PythonSandbox = (function() {
    'use strict';

    // ── Pyodide CDN URL ─────────────────────────────────────────────────────
    // Pinned to a stable release. Update intentionally — breaking changes happen.
    const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';

    // ── localStorage Key Prefix ──────────────────────────────────────────────
    // All keys owned by this component use this prefix to avoid collisions.
    const LS_PREFIX = 'pysandbox_';

    // ── XP Award Amounts ────────────────────────────────────────────────────
    // Base XP values for each difficulty tier. Overridden by challenge.xp if set.
    const XP_BY_DIFFICULTY = { easy: 10, medium: 20, hard: 30 };

    // Bonus/penalty modifiers applied on top of base XP
    const XP_SPEED_BONUS     = 5;   // Solved under par time
    const XP_FIRST_TRY_BONUS = 10;  // Passed on first submit
    const XP_HINT_PENALTY    = 5;   // Per hint revealed (minimum total = 0)

    // ── Streak Milestone Values ──────────────────────────────────────────────
    // At these streak counts, visual flair is triggered in the status bar.
    const STREAK_MILESTONES = [3, 5, 10];

    // ── Auto-Save Debounce ───────────────────────────────────────────────────
    // Editor content is saved to localStorage this many ms after the last keystroke.
    const AUTOSAVE_DEBOUNCE_MS = 500;

    // ─────────────────────────────────────────────────────────────────────────
    // MODULE-LEVEL STATE
    // Single source of truth for the current sandbox session. Never accessed
    // directly from outside; all mutation goes through internal functions.
    // ─────────────────────────────────────────────────────────────────────────
    /* Cached Pyodide load promise — prevents double-loading. Declared outside
       _state because it's referenced before the IIFE returns and can't live
       on the public PythonSandbox object during construction. */
    let _pyodideLoadPromise = null;

    let _state = {
        // Config passed by the lab page at init()
        config: null,

        // Currently selected challenge object (reference into config.challenges)
        activeChallenge: null,

        // Index of the active challenge in config.challenges[]
        activeChallengeIndex: 0,

        // Pyodide instance — null until first Run/Submit is clicked
        pyodide: null,

        // True while Pyodide is being loaded for the first time
        pyodideLoading: false,

        // Per-challenge runtime state: challengeId → { hintsUsed, submitCount, passed, earnedXp, startTime }
        challengeData: {},

        // In-memory code history: array of { code, output, timestamp, type, passed }
        // Not persisted to localStorage (too large); resets on page reload.
        runHistory: [],

        // Total XP earned across all challenges in this session (persisted to localStorage)
        totalXp: 0,

        // Consecutive challenges passed without a failed submit
        streak: 0,

        // Timer: setInterval handle for the active challenge clock
        timerInterval: null,

        // Elapsed seconds on the active challenge timer
        timerSeconds: 0,

        // Active output tab: 'output' | 'repl' | 'tests' | 'history'
        activeOutputTab: 'output',

        // Queue of input() responses waiting to be consumed in interactive Run mode
        inputQueue: [],

        // Resolvers array for input() promises in interactive mode
        // Each entry is { resolve } — the next input() call pops and resolves one.
        inputResolvers: [],

        // Debounce timer handle for autosave
        autosaveTimer: null,

        // CodeMirror editor instance — null until loaded from CDN.
        // When active, _state.dom.editor.value is proxied to getValue/setValue.
        cmEditor: null,

        // DOM references — populated by _buildDOM()
        dom: {}
    };

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Initialize the sandbox in the given container element.
     *
     * This is the only function a lab page needs to call. It:
     *   1. Validates the config
     *   2. Injects all styles into <head>
     *   3. Builds and mounts the full IDE DOM
     *   4. Restores persisted state (XP, completed challenges)
     *   5. Selects the first challenge and renders it
     *
     * @param {Object} config - Lab configuration object (see file header for shape)
     */
    function init(config) {
        // Validate required fields before touching the DOM
        if (!config || !config.containerId || !config.challenges || !config.challenges.length) {
            console.error('[PythonSandbox] init() requires containerId and at least one challenge.');
            return;
        }

        const container = document.getElementById(config.containerId);
        if (!container) {
            console.error('[PythonSandbox] Container element not found:', config.containerId);
            return;
        }

        // Store config on state
        _state.config = config;

        // Restore persisted XP total for this lab module
        _state.totalXp = _loadXp(config.moduleId);

        // Restore persisted streak
        _state.streak = _loadStreak(config.moduleId);

        // Initialize per-challenge runtime data for every challenge in config
        config.challenges.forEach(function(ch) {
            _state.challengeData[ch.id] = {
                hintsUsed: 0,        // How many hints revealed so far
                submitCount: 0,      // How many Submit attempts made
                passed: _loadPassed(config.moduleId, ch.id),  // Restored from localStorage
                earnedXp: 0,         // XP awarded when passed (set on first pass)
                startTime: null      // Date.now() when challenge was selected
            };
        });

        // Inject all component CSS into <head> (idempotent)
        _injectStyles();

        // Build the full IDE DOM and mount it into the container
        _buildDOM(container);

        // Load CodeMirror from CDN to upgrade the editor with syntax highlighting.
        // This is async — the textarea works immediately, CM upgrades it when loaded.
        _initCodeMirror();

        // Activate the first challenge
        _selectChallenge(0);

        // Update the XP display and streak display in the status bar
        _updateStatusBar();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOM CONSTRUCTION
    // All DOM building is centralized here. _buildDOM creates the skeleton;
    // _renderChallengeList, _renderDescription, etc. fill in the content.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build and mount the complete IDE DOM structure into the container.
     * Stores references to frequently-accessed nodes in _state.dom.
     *
     * @param {HTMLElement} container - The host element from the lab page
     */
    function _buildDOM(container) {
        // Clear any previous content
        container.innerHTML = '';

        // Apply the sandbox root class for scoped CSS
        container.classList.add('ps-root');

        // ── Top Bar ──────────────────────────────────────────────
        const topBar = _el('div', 'ps-top-bar');
        topBar.innerHTML =
            '<div class="ps-top-bar-left">' +
                '<span class="ps-logo-dot"></span>' +
                '<span class="ps-title">' + _escape((_state.config.title || 'Python Lab')) + '</span>' +
            '</div>' +
            '<div class="ps-top-bar-center">' +
                '<span class="ps-shortcuts-hint">Ctrl+Enter to Run &nbsp;|&nbsp; Ctrl+S to Save</span>' +
            '</div>' +
            '<div class="ps-top-bar-right">' +
                '<a class="ps-nav-link" href="' + _escape(_state.config.returnUrl || '../index.html') + '">Back to Course</a>' +
            '</div>';
        container.appendChild(topBar);

        // ── Main Content Row ─────────────────────────────────────
        // Three columns: sidebar | center | inspector
        const mainRow = _el('div', 'ps-main-row');
        container.appendChild(mainRow);

        // ── Left Sidebar ──────────────────────────────────────────
        const sidebar = _el('div', 'ps-sidebar');
        mainRow.appendChild(sidebar);

        // Challenge list (populated by _renderChallengeList)
        const challengeList = _el('div', 'ps-challenge-list');
        sidebar.appendChild(challengeList);
        _state.dom.challengeList = challengeList;

        // Sidebar footer: progress bar + XP total
        const sidebarFooter = _el('div', 'ps-sidebar-footer');
        const progressLabel = _el('div', 'ps-progress-label');
        _state.dom.progressLabel = progressLabel;
        const progressBar = _el('div', 'ps-progress-bar-track');
        const progressFill = _el('div', 'ps-progress-bar-fill');
        progressBar.appendChild(progressFill);
        _state.dom.progressFill = progressFill;
        const xpTotal = _el('div', 'ps-xp-total');
        _state.dom.xpTotal = xpTotal;
        sidebarFooter.appendChild(progressLabel);
        sidebarFooter.appendChild(progressBar);
        sidebarFooter.appendChild(xpTotal);
        sidebar.appendChild(sidebarFooter);

        // ── Center Column ─────────────────────────────────────────
        const centerCol = _el('div', 'ps-center-col');
        mainRow.appendChild(centerCol);

        // Description bar (above editor)
        const descBar = _el('div', 'ps-desc-bar');
        centerCol.appendChild(descBar);
        _state.dom.descBar = descBar;

        // Editor toolbar
        const editorToolbar = _el('div', 'ps-editor-toolbar');
        editorToolbar.innerHTML =
            '<div class="ps-toolbar-left">' +
                '<button class="ps-btn ps-btn-run" id="ps-btn-run" title="Run code (Ctrl+Enter)">Run</button>' +
                '<button class="ps-btn ps-btn-submit" id="ps-btn-submit" title="Submit and check tests">Submit</button>' +
                '<button class="ps-btn ps-btn-reset" id="ps-btn-reset" title="Reset to starter code">Reset</button>' +
            '</div>' +
            '<div class="ps-toolbar-right">' +
                '<button class="ps-btn ps-btn-export" id="ps-btn-export" title="Download as .py file">Export .py</button>' +
            '</div>';
        centerCol.appendChild(editorToolbar);
        _state.dom.editorToolbar = editorToolbar;

        // Editor area: line numbers + textarea side by side
        const editorArea = _el('div', 'ps-editor-area');
        centerCol.appendChild(editorArea);

        const lineNumbers = _el('div', 'ps-line-numbers');
        lineNumbers.setAttribute('aria-hidden', 'true');
        editorArea.appendChild(lineNumbers);
        _state.dom.lineNumbers = lineNumbers;

        const textarea = _el('textarea', 'ps-editor');
        textarea.setAttribute('spellcheck', 'false');
        textarea.setAttribute('autocapitalize', 'off');
        textarea.setAttribute('autocomplete', 'off');
        textarea.setAttribute('autocorrect', 'off');
        textarea.setAttribute('aria-label', 'Python code editor');
        editorArea.appendChild(textarea);
        _state.dom.editor = textarea;

        // Output panel (tabbed)
        const outputPanel = _el('div', 'ps-output-panel');
        centerCol.appendChild(outputPanel);

        // Tab row
        const tabRow = _el('div', 'ps-tab-row');
        ['output', 'repl', 'tests', 'history'].forEach(function(tabId) {
            const tab = _el('button', 'ps-tab');
            tab.dataset.tab = tabId;
            tab.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
            tabRow.appendChild(tab);
        });
        outputPanel.appendChild(tabRow);
        _state.dom.tabRow = tabRow;

        // Tab panes
        const outputPane = _buildOutputPane();
        const replPane   = _buildReplPane();
        const testsPane  = _buildTestsPane();
        const historyPane = _buildHistoryPane();

        outputPanel.appendChild(outputPane);
        outputPanel.appendChild(replPane);
        outputPanel.appendChild(testsPane);
        outputPanel.appendChild(historyPane);

        // ── Right Panel: Variable Inspector ───────────────────────
        const inspector = _el('div', 'ps-inspector');
        mainRow.appendChild(inspector);

        const inspectorHeader = _el('div', 'ps-inspector-header');
        inspectorHeader.textContent = 'Variable Inspector';
        inspector.appendChild(inspectorHeader);

        const inspectorHint = _el('div', 'ps-inspector-hint');
        inspectorHint.textContent = 'Run code to inspect variables.';
        inspector.appendChild(inspectorHint);
        _state.dom.inspectorHint = inspectorHint;

        const inspectorList = _el('div', 'ps-inspector-list');
        inspector.appendChild(inspectorList);
        _state.dom.inspectorList = inspectorList;

        // ── Status Bar ────────────────────────────────────────────
        const statusBar = _el('div', 'ps-status-bar');
        container.appendChild(statusBar);

        const streakDisplay = _el('span', 'ps-status-streak');
        _state.dom.streakDisplay = streakDisplay;

        const timerDisplay = _el('span', 'ps-status-timer');
        timerDisplay.textContent = 'Time: 0:00';
        _state.dom.timerDisplay = timerDisplay;

        const xpDisplay = _el('span', 'ps-status-xp');
        _state.dom.xpDisplay = xpDisplay;

        statusBar.appendChild(streakDisplay);
        statusBar.appendChild(timerDisplay);
        statusBar.appendChild(xpDisplay);

        // ── Pyodide Loading Overlay ───────────────────────────────
        // Covers the center column while Pyodide loads (only on first run)
        const loadingOverlay = _el('div', 'ps-loading-overlay');
        loadingOverlay.innerHTML =
            '<div class="ps-loading-box">' +
                '<div class="ps-loading-spinner"></div>' +
                '<div class="ps-loading-text">Loading Python runtime...</div>' +
                '<div class="ps-loading-sub">Pyodide WebAssembly — first run only</div>' +
            '</div>';
        loadingOverlay.style.display = 'none';
        centerCol.style.position = 'relative';
        centerCol.appendChild(loadingOverlay);
        _state.dom.loadingOverlay = loadingOverlay;

        // ── Celebration Banner (hidden until all challenges pass) ─
        const celebration = _el('div', 'ps-celebration');
        celebration.style.display = 'none';
        celebration.innerHTML =
            '<div class="ps-celebration-inner">' +
                '<div class="ps-celebration-title">All Challenges Complete!</div>' +
                '<div class="ps-celebration-sub">Outstanding work. Lab complete.</div>' +
                '<button class="ps-btn ps-btn-complete" id="ps-btn-complete">Mark Lab Complete</button>' +
            '</div>' +
            '<div class="ps-confetti" id="ps-confetti"></div>';
        container.appendChild(celebration);
        _state.dom.celebration = celebration;

        // ── Wire Up All Event Listeners ───────────────────────────
        _attachEventListeners();

        // ── Initial Challenge List Render ─────────────────────────
        _renderChallengeList();
    }

    /**
     * Build the Output tab pane (stdout from run/submit).
     * Includes the input simulation field and a Clear button.
     *
     * @returns {HTMLElement}
     */
    function _buildOutputPane() {
        const pane = _el('div', 'ps-tab-pane');
        pane.dataset.pane = 'output';

        // Output display area (read-only, monospace)
        const outputDisplay = _el('div', 'ps-output-display');
        outputDisplay.setAttribute('aria-live', 'polite');
        pane.appendChild(outputDisplay);
        _state.dom.outputDisplay = outputDisplay;

        // Input simulation row: appears when code calls input() in Run mode
        const inputRow = _el('div', 'ps-input-row');
        inputRow.style.display = 'none';
        inputRow.innerHTML =
            '<span class="ps-input-prompt">input:</span>' +
            '<input type="text" class="ps-input-field" placeholder="Type your input here, press Enter" />';
        pane.appendChild(inputRow);
        _state.dom.inputRow = inputRow;
        _state.dom.inputField = inputRow.querySelector('.ps-input-field');

        // Clear button
        const clearBtn = _el('button', 'ps-clear-btn');
        clearBtn.textContent = 'Clear';
        clearBtn.dataset.target = 'output';
        pane.appendChild(clearBtn);

        return pane;
    }

    /**
     * Build the REPL tab pane (interactive >>> prompt).
     * Students type single expressions or statements and see results live.
     *
     * @returns {HTMLElement}
     */
    function _buildReplPane() {
        const pane = _el('div', 'ps-tab-pane');
        pane.dataset.pane = 'repl';
        pane.style.display = 'none';

        // Scrollable history of previous REPL entries
        const replHistory = _el('div', 'ps-repl-history');
        pane.appendChild(replHistory);
        _state.dom.replHistory = replHistory;

        // Input row at the bottom
        const replInputRow = _el('div', 'ps-repl-input-row');
        replInputRow.innerHTML =
            '<span class="ps-repl-prompt">&gt;&gt;&gt;</span>' +
            '<input type="text" class="ps-repl-field" placeholder="Enter a Python expression..." />';
        pane.appendChild(replInputRow);
        _state.dom.replField = replInputRow.querySelector('.ps-repl-field');

        // Clear button
        const clearBtn = _el('button', 'ps-clear-btn');
        clearBtn.textContent = 'Clear';
        clearBtn.dataset.target = 'repl';
        pane.appendChild(clearBtn);

        return pane;
    }

    /**
     * Build the Tests tab pane (pass/fail grid from Submit).
     *
     * @returns {HTMLElement}
     */
    function _buildTestsPane() {
        const pane = _el('div', 'ps-tab-pane');
        pane.dataset.pane = 'tests';
        pane.style.display = 'none';

        const testResults = _el('div', 'ps-test-results');
        testResults.textContent = 'Run Submit to see test results.';
        pane.appendChild(testResults);
        _state.dom.testResults = testResults;

        return pane;
    }

    /**
     * Build the History tab pane (log of all runs/submits this session).
     * Entries are added in reverse-chronological order (newest first).
     *
     * @returns {HTMLElement}
     */
    function _buildHistoryPane() {
        const pane = _el('div', 'ps-tab-pane');
        pane.dataset.pane = 'history';
        pane.style.display = 'none';

        const historyLog = _el('div', 'ps-history-log');
        historyLog.textContent = 'No runs yet this session.';
        pane.appendChild(historyLog);
        _state.dom.historyLog = historyLog;

        // Clear button clears only the in-memory history log display
        const clearBtn = _el('button', 'ps-clear-btn');
        clearBtn.textContent = 'Clear History';
        clearBtn.dataset.target = 'history';
        pane.appendChild(clearBtn);

        return pane;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CODEMIRROR INTEGRATION
    // Upgrades the plain textarea to a CodeMirror editor with Python syntax
    // highlighting, auto-indent, and bracket matching. Loaded from CDN.
    // If CDN fails, the textarea works as a graceful fallback.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Load CodeMirror 5 from CDN and replace the textarea with a rich editor.
     * Creates a proxy on _state.dom.editor so .value still works everywhere.
     *
     * CDN resources loaded:
     *   - codemirror.min.js (core)
     *   - codemirror.min.css (base styles)
     *   - python.min.js (Python language mode)
     *   - matchbrackets.min.js (bracket highlighting)
     *   - closebrackets.min.js (auto-close brackets/quotes)
     */
    function _initCodeMirror() {
        var CM_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/';

        // Track how many resources need to load
        var remaining = 5;
        var failed = false;

        function onLoad() {
            remaining--;
            if (remaining > 0 || failed) return;
            _activateCodeMirror();
        }

        function onError() {
            failed = true;
            // Fallback: textarea still works, just without syntax highlighting
            console.warn('[PythonSandbox] CodeMirror CDN load failed; using plain textarea.');
        }

        // Load CSS (base styles)
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CM_CDN + 'codemirror.min.css';
        link.onload = onLoad;
        link.onerror = onError;
        document.head.appendChild(link);

        // Load JS files in sequence (core must load before addons/modes)
        var scripts = [
            CM_CDN + 'codemirror.min.js',
            CM_CDN + 'mode/python/python.min.js',
            CM_CDN + 'addon/edit/matchbrackets.min.js',
            CM_CDN + 'addon/edit/closebrackets.min.js'
        ];

        // Chain script loading: core first, then addons
        function loadScript(index) {
            if (index >= scripts.length) return;
            var s = document.createElement('script');
            s.src = scripts[index];
            s.onload = function() {
                onLoad();
                loadScript(index + 1);
            };
            s.onerror = onError;
            document.head.appendChild(s);
        }
        loadScript(0);
    }

    /**
     * Once all CodeMirror resources are loaded, replace the textarea with
     * a CodeMirror instance and create the .value proxy.
     */
    function _activateCodeMirror() {
        if (typeof CodeMirror === 'undefined') return;

        var textarea = _state.dom.editor;

        // Create the CodeMirror instance from the existing textarea
        var cm = CodeMirror.fromTextArea(textarea, {
            mode:              'python',
            theme:             'default',      // We override with custom CSS below
            lineNumbers:       true,
            matchBrackets:     true,
            autoCloseBrackets: true,
            indentUnit:        4,
            tabSize:           4,
            indentWithTabs:    false,
            lineWrapping:      false,
            viewportMargin:    Infinity,       // Render all lines (small files)
            extraKeys: {
                // Ctrl+Enter runs the code (matches toolbar shortcut)
                'Ctrl-Enter': function() { _runCode(); },
                'Cmd-Enter':  function() { _runCode(); },
                // Ctrl+S saves (prevents browser default save dialog)
                'Ctrl-S':     function() { _autosaveCode(); },
                'Cmd-S':      function() { _autosaveCode(); },
                // Tab inserts 4 spaces (not a tab character)
                'Tab':        function(cm) {
                    if (cm.somethingSelected()) {
                        cm.indentSelection('add');
                    } else {
                        cm.replaceSelection('    ', 'end');
                    }
                },
                // Shift-Tab dedents
                'Shift-Tab':  function(cm) {
                    cm.indentSelection('subtract');
                }
            }
        });

        // Store the instance for direct access
        _state.cmEditor = cm;

        // ── Proxy: make _state.dom.editor.value work with CodeMirror ──
        // All existing code reads/writes _state.dom.editor.value.
        // We create a lightweight proxy that intercepts these operations.
        _state.dom.editor = {
            // Getter: read from CodeMirror
            get value() { return cm.getValue(); },
            // Setter: write to CodeMirror
            set value(v) { cm.setValue(v); },
            // These are used by _insertAtCursor and scroll sync.
            // With CodeMirror, _insertAtCursor is no longer needed (CM handles Tab),
            // and scroll sync is built-in. Provide stubs for safety.
            get selectionStart() { return cm.getCursor('from').ch; },
            get selectionEnd()   { return cm.getCursor('to').ch; },
            get scrollTop()      { return cm.getScrollInfo().top; },
            // Focus the editor (used when challenges are selected)
            focus: function() { cm.focus(); }
        };

        // ── Hide the old line numbers gutter (CodeMirror provides its own) ──
        if (_state.dom.lineNumbers) {
            _state.dom.lineNumbers.style.display = 'none';
        }

        // ── Auto-save on content change ──
        cm.on('change', function() {
            _scheduleAutosave();
        });

        // ── Apply dark theme via injected CSS ──
        _injectCodeMirrorTheme();

        // Refresh to ensure proper layout after DOM mount
        setTimeout(function() { cm.refresh(); }, 50);
    }

    /**
     * Inject custom dark-theme CSS for CodeMirror that matches the
     * PythonSandbox dark IDE aesthetic. CodeMirror's default theme is
     * light — we override it to match our #0d1117 background.
     */
    function _injectCodeMirrorTheme() {
        var css = [
            '/* ── CodeMirror dark theme override for PythonSandbox ── */',
            '.ps-editor-area .CodeMirror {',
            '    background: #0d1117;',
            '    color: #e6edf3;',
            '    font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;',
            '    font-size: 0.88rem;',
            '    line-height: 1.65;',
            '    height: 100%;',
            '    border: none;',
            '}',
            '.ps-editor-area .CodeMirror-gutters {',
            '    background: #0a0e14;',
            '    border-right: 1px solid rgba(255,255,255,0.06);',
            '    color: #4a5568;',
            '}',
            '.ps-editor-area .CodeMirror-linenumber {',
            '    color: #4a5568;',
            '    padding: 0 6px 0 4px;',
            '    font-size: 0.78rem;',
            '}',
            '.ps-editor-area .CodeMirror-cursor {',
            '    border-left: 2px solid #10b981;',
            '}',
            '.ps-editor-area .CodeMirror-selected {',
            '    background: rgba(16, 185, 129, 0.15) !important;',
            '}',
            '.ps-editor-area .CodeMirror-matchingbracket {',
            '    color: #10b981 !important;',
            '    text-decoration: underline;',
            '}',
            '/* Python syntax highlighting colors */',
            '.ps-editor-area .cm-keyword   { color: #ff7b72; }',   // if, for, def, class, return
            '.ps-editor-area .cm-def       { color: #d2a8ff; }',   // function/class name definitions
            '.ps-editor-area .cm-variable  { color: #e6edf3; }',   // variable names
            '.ps-editor-area .cm-variable-2 { color: #79c0ff; }',  // self, cls
            '.ps-editor-area .cm-string    { color: #a5d6ff; }',   // string literals
            '.ps-editor-area .cm-string-2  { color: #a5d6ff; }',   // f-strings
            '.ps-editor-area .cm-number    { color: #79c0ff; }',   // numeric literals
            '.ps-editor-area .cm-comment   { color: #6a7a8b; font-style: italic; }',
            '.ps-editor-area .cm-builtin   { color: #ffa657; }',   // print, len, range, etc.
            '.ps-editor-area .cm-operator  { color: #ff7b72; }',   // =, +, -, etc.
            '.ps-editor-area .cm-meta      { color: #c9a83a; }',   // decorators (@)
            '.ps-editor-area .cm-property  { color: #79c0ff; }',   // object.property
            '.ps-editor-area .cm-atom      { color: #79c0ff; }',   // True, False, None
            '/* Scrollbar styling */',
            '.ps-editor-area .CodeMirror-vscrollbar::-webkit-scrollbar,',
            '.ps-editor-area .CodeMirror-hscrollbar::-webkit-scrollbar {',
            '    width: 8px; height: 8px;',
            '}',
            '.ps-editor-area .CodeMirror-vscrollbar::-webkit-scrollbar-thumb,',
            '.ps-editor-area .CodeMirror-hscrollbar::-webkit-scrollbar-thumb {',
            '    background: rgba(255,255,255,0.12);',
            '    border-radius: 4px;',
            '}',
            '/* Hide the original textarea (CodeMirror keeps it synced) */',
            '.ps-editor-area textarea.ps-editor { display: none; }'
        ].join('\n');

        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENT LISTENERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Wire up all interactive elements after DOM is built.
     * Called once from _buildDOM; never repeated.
     */
    function _attachEventListeners() {
        const d = _state.dom;

        // ── Editor: Tab key inserts 4 spaces (not focus change) ──
        // NOTE: When CodeMirror is active, these listeners are on the hidden
        // textarea and never fire. CM handles Tab/Ctrl+Enter/Ctrl+S natively
        // via the extraKeys config. These remain as a fallback for the plain
        // textarea case (e.g., if CDN is blocked).
        d.editor.addEventListener('keydown', function(e) {
            if (_state.cmEditor) return; // CodeMirror handles this
            if (e.key === 'Tab') {
                e.preventDefault();
                _insertAtCursor(d.editor, '    '); // 4 spaces
                _updateLineNumbers();
            }
            // Ctrl+Enter = Run
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                _runCode();
            }
            // Ctrl+S = force autosave (browser default prevented)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                _autosaveCode();
            }
        });

        // ── Editor: Update line numbers and autosave on input ────
        d.editor.addEventListener('input', function() {
            if (_state.cmEditor) return; // CodeMirror handles this
            _updateLineNumbers();
            _scheduleAutosave();
        });

        // ── Editor: Sync scroll of line numbers to editor ────────
        d.editor.addEventListener('scroll', function() {
            if (_state.cmEditor) return; // CodeMirror handles this
            d.lineNumbers.scrollTop = d.editor.scrollTop;
        });

        // ── Toolbar Buttons ───────────────────────────────────────
        document.getElementById('ps-btn-run').addEventListener('click', function() {
            _runCode();
        });
        document.getElementById('ps-btn-submit').addEventListener('click', function() {
            _submitCode();
        });
        document.getElementById('ps-btn-reset').addEventListener('click', function() {
            _resetToStarter();
        });
        document.getElementById('ps-btn-export').addEventListener('click', function() {
            _exportAsPy();
        });

        // ── Output Tab Switching ──────────────────────────────────
        d.tabRow.addEventListener('click', function(e) {
            const btn = e.target.closest('.ps-tab');
            if (!btn) return;
            _switchOutputTab(btn.dataset.tab);
        });

        // ── Clear Buttons (delegated from output panel) ───────────
        // The panel contains multiple clear buttons, each with data-target
        const outputPanel = d.tabRow.parentElement;
        outputPanel.addEventListener('click', function(e) {
            const btn = e.target.closest('.ps-clear-btn');
            if (!btn) return;
            _clearTab(btn.dataset.target);
        });

        // ── REPL Input: Enter key executes expression ─────────────
        d.replField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                _executeRepl(d.replField.value);
                d.replField.value = '';
            }
        });

        // ── Interactive Input: Enter key feeds the waiting input() ─
        d.inputField.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                _resolveNextInput(d.inputField.value);
                d.inputField.value = '';
            }
        });

        // ── Mark Lab Complete button ──────────────────────────────
        // This button only appears after _checkAllPassed() fires the celebration.
        document.getElementById('ps-btn-complete').addEventListener('click', function() {
            _markLabComplete();
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CHALLENGE SELECTION AND RENDERING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Select a challenge by its index in config.challenges[].
     * Saves the current editor code for the outgoing challenge,
     * then loads the incoming challenge's saved code (or starter code).
     *
     * @param {number} index - Index into config.challenges[]
     */
    function _selectChallenge(index) {
        const challenges = _state.config.challenges;
        if (index < 0 || index >= challenges.length) return;

        // Save current editor content for the outgoing challenge before switching
        if (_state.activeChallenge) {
            _saveCodeForChallenge(_state.activeChallenge.id, _state.dom.editor.value);
        }

        _state.activeChallengeIndex = index;
        _state.activeChallenge = challenges[index];

        // Initialize challenge runtime data if not already present
        if (!_state.challengeData[_state.activeChallenge.id]) {
            _state.challengeData[_state.activeChallenge.id] = {
                hintsUsed: 0,
                submitCount: 0,
                passed: false,
                earnedXp: 0,
                startTime: null
            };
        }

        // Record start time for the challenge timer
        _state.challengeData[_state.activeChallenge.id].startTime = Date.now();

        // Reset and restart the elapsed-time timer
        _resetTimer();
        _startTimer();

        // Reset the hint reveal count for this session (count persists across
        // page loads in _challengeData.hintsUsed, not per-challenge session)
        // The hint UI will re-render from the saved count.

        // Load saved code for this challenge, or fall back to starter code
        const savedCode = _loadCodeForChallenge(_state.activeChallenge.id);
        _state.dom.editor.value = savedCode !== null ? savedCode : (_state.activeChallenge.starter || '');

        // Refresh CodeMirror after content change (ensures correct rendering)
        if (_state.cmEditor) {
            setTimeout(function() { _state.cmEditor.refresh(); }, 10);
        }

        // Sync line numbers with new content (only needed in textarea fallback mode)
        _updateLineNumbers();

        // Reset output panel to a clean state
        _clearTab('output');
        _clearTab('tests');
        _state.dom.testResults.textContent = 'Run Submit to see test results.';

        // Render the description bar for this challenge
        _renderDescription();

        // Highlight active item in sidebar
        _renderChallengeList();

        // Switch to output tab by default when switching challenges
        _switchOutputTab('output');

        // Update progress bar in sidebar footer
        _updateProgress();
    }

    /**
     * Render the left sidebar challenge list.
     * Each item shows title, difficulty badge, pass/fail status, and XP value.
     * The active challenge is highlighted with an accent border.
     */
    function _renderChallengeList() {
        const list = _state.dom.challengeList;
        list.innerHTML = '';

        _state.config.challenges.forEach(function(ch, i) {
            const data = _state.challengeData[ch.id] || {};
            const isPassed = data.passed;
            const isActive = i === _state.activeChallengeIndex;

            const item = _el('div', 'ps-challenge-item' + (isActive ? ' ps-challenge-item--active' : '') + (isPassed ? ' ps-challenge-item--passed' : ''));
            item.dataset.index = i;

            // Difficulty label and CSS class
            const diff = (ch.difficulty || 'easy').toLowerCase();
            const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);

            // Status indicator: check mark if passed, empty circle if not
            const statusIcon = isPassed ? '[PASS]' : '[TODO]';

            // Base XP value (either from config or difficulty default)
            const xpValue = ch.xp || XP_BY_DIFFICULTY[diff] || 10;

            item.innerHTML =
                '<div class="ps-ci-header">' +
                    '<span class="ps-ci-status">' + statusIcon + '</span>' +
                    '<span class="ps-ci-title">' + _escape(ch.title || ('Challenge ' + (i + 1))) + '</span>' +
                '</div>' +
                '<div class="ps-ci-meta">' +
                    '<span class="ps-diff-badge diff-' + diff + '">' + diffLabel + '</span>' +
                    '<span class="ps-ci-xp">' + xpValue + ' XP</span>' +
                '</div>';

            // Click to select this challenge
            item.addEventListener('click', function() {
                _selectChallenge(i);
            });

            list.appendChild(item);
        });
    }

    /**
     * Render the description bar above the editor.
     * Shows: challenge title, instructions HTML, expected output block,
     * revealed hints, and the Hint button.
     */
    function _renderDescription() {
        const ch = _state.activeChallenge;
        if (!ch) return;

        const data = _state.challengeData[ch.id];
        const diff = (ch.difficulty || 'easy').toLowerCase();
        const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);
        const totalHints = (ch.hints && ch.hints.length) || 0;
        const usedHints = data ? data.hintsUsed : 0;
        const xpValue = ch.xp || XP_BY_DIFFICULTY[diff] || 10;
        const parTime = ch.parTime || 0;

        // Build the description HTML string
        let html =
            '<div class="ps-desc-top">' +
                '<div class="ps-desc-title">' + _escape(ch.title || '') + '</div>' +
                '<div class="ps-desc-badges">' +
                    '<span class="ps-diff-badge diff-' + diff + '">' + diffLabel + '</span>' +
                    '<span class="ps-desc-xp">' + xpValue + ' XP</span>' +
                    (parTime ? '<span class="ps-desc-par">Par: ' + parTime + 's</span>' : '') +
                '</div>' +
            '</div>' +
            '<div class="ps-desc-instructions">' +
                // Instructions may contain HTML (e.g., <code> tags) — allowed by design.
                // The content comes from the trusted course config, not from user input.
                (ch.instructions || '') +
            '</div>';

        // Show the expected output in a code block if provided
        if (ch.expected) {
            html +=
                '<div class="ps-desc-expected">' +
                    '<span class="ps-desc-expected-label">Expected Output:</span>' +
                    '<code class="ps-desc-expected-code">' + _escape(ch.expected) + '</code>' +
                '</div>';
        }

        // Render hints that have already been revealed
        if (usedHints > 0 && ch.hints && ch.hints.length) {
            html += '<div class="ps-hints-container">';
            for (let i = 0; i < usedHints; i++) {
                html +=
                    '<div class="ps-hint-box">' +
                        '<span class="ps-hint-label">Hint ' + (i + 1) + ':</span>' +
                        ' ' + _escape(ch.hints[i]) +
                    '</div>';
            }
            html += '</div>';
        }

        // Hint button — disabled if all hints revealed or no hints available
        if (totalHints > 0) {
            const hintRemaining = totalHints - usedHints;
            const btnDisabled = hintRemaining === 0 ? 'disabled' : '';
            html +=
                '<button class="ps-btn ps-btn-hint" id="ps-btn-hint" ' + btnDisabled + '>' +
                    'Hint (' + usedHints + '/' + totalHints + ')' +
                '</button>';
        }

        _state.dom.descBar.innerHTML = html;

        // Attach hint button listener (re-attached each render because innerHTML replaces the node)
        const hintBtn = document.getElementById('ps-btn-hint');
        if (hintBtn) {
            hintBtn.addEventListener('click', function() {
                _revealNextHint();
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CODE EXECUTION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Run the current editor content in interactive mode.
     *
     * - Shows Pyodide loading overlay on first run
     * - Redirects Python stdout/stderr to our output display
     * - When code calls input(), shows the interactive input field
     * - Captures all user-defined variables for the Variable Inspector
     * - Adds a history entry
     */
    async function _runCode() {
        const code = _state.dom.editor.value;
        if (!code.trim()) return;

        // Code review challenges (Tkinter, sockets) cannot run in Pyodide.
        // Show a helpful message instead of crashing on unsupported imports.
        if (_state.activeChallenge && _state.activeChallenge.codeReview) {
            _switchOutputTab('output');
            _setOutput(
                'This is a Code Review challenge — the code cannot run in the browser.\n' +
                'Use Submit to validate your code structure, or test locally in VS Code.',
                'info'
            );
            return;
        }

        // Switch to output tab so the user sees results immediately
        _switchOutputTab('output');
        _setOutput('[Running...]', 'info');

        try {
            // Ensure Pyodide is loaded (lazy, first time only)
            await _ensurePyodide();
        } catch (err) {
            _setOutput('Failed to load Python runtime: ' + err.message, 'error');
            return;
        }

        // Clear the input queue for interactive mode
        _state.inputQueue = [];
        _state.inputResolvers = [];
        _state.dom.inputRow.style.display = 'none';

        // Redirect Pyodide's stdout/stderr to our display
        const outputLines = [];
        _state.pyodide.setStdout({ batched: function(line) { outputLines.push(line); } });
        _state.pyodide.setStderr({ batched: function(line) { outputLines.push('[ERROR] ' + line); } });

        // Override input() with our interactive handler
        // This returns a Promise that resolves when the user submits the input field.
        _state.pyodide.globals.set('input', _state.pyodide.toPy(function(prompt) {
            if (prompt) outputLines.push(String(prompt));
            return _waitForInteractiveInput(outputLines);
        }));

        let errorOccurred = false;
        let translatedError = null;
        let rawError = null;

        try {
            // runPythonAsync supports async code and our Promise-returning input()
            await _state.pyodide.runPythonAsync(code);
        } catch (err) {
            errorOccurred = true;
            rawError = err.message || String(err);
            translatedError = _translateError(rawError);
        }

        // Hide the interactive input row once execution is done
        _state.dom.inputRow.style.display = 'none';

        // Build the final output string
        let outputText = outputLines.join('\n');
        if (errorOccurred) {
            outputText += (outputText ? '\n' : '') + translatedError;
        }

        _setOutput(outputText || '(no output)', errorOccurred ? 'error' : 'success');

        // Add to in-session history
        _addHistoryEntry({
            code: code,
            output: outputText,
            timestamp: new Date(),
            type: 'run',
            passed: false // runs are not graded
        });

        // Update the variable inspector with post-execution namespace
        _updateVariableInspector();
    }

    /**
     * Submit the current editor content for automated testing.
     *
     * Unlike Run mode, Submit:
     *   - Feeds testInputs[] silently (no interactive input field)
     *   - Runs each test function from config and records pass/fail
     *   - Awards XP on first pass, applies hint penalties and speed bonuses
     *   - Updates streak and challenge status
     *   - Triggers celebration if all challenges are now passed
     */
    async function _submitCode() {
        const code = _state.dom.editor.value;
        const ch = _state.activeChallenge;
        if (!code.trim() || !ch) return;

        // Switch to output tab first, then tests tab will auto-switch after
        _switchOutputTab('output');
        _setOutput('[Submitting...]', 'info');

        const data = _state.challengeData[ch.id];
        data.submitCount++;

        // ── Code Review Mode ─────────────────────────────────────
        // Some challenges (e.g., Tkinter GUI, socket programming) cannot
        // execute inside Pyodide/WASM. When codeReview is true, we skip
        // execution entirely and validate the source code structure only.
        // Tests receive empty output and the raw source via check('', code).
        let stdoutStr = '';
        let runError = null;

        if (ch.codeReview) {
            // No execution — inform the student this is a structural review
            _setOutput('Code Review Mode — validating code structure (not executed)', 'info');

        } else {
            // ── Normal execution path: load Pyodide and run the code ──
            try {
                await _ensurePyodide();
            } catch (err) {
                _setOutput('Failed to load Python runtime: ' + err.message, 'error');
                return;
            }

            // Collect stdout into an array for comparison against test functions
            const outputLines = [];
            _state.pyodide.setStdout({ batched: function(line) { outputLines.push(line); } });
            _state.pyodide.setStderr({ batched: function(line) { outputLines.push('[ERROR] ' + line); } });

            // Use automated input queue from challenge config (testInputs[])
            const testInputs = (ch.testInputs || []).slice(); // clone so we can shift()
            let inputIndex = 0;
            _state.pyodide.globals.set('input', _state.pyodide.toPy(function(prompt) {
                // Feed the next queued input silently; if exhausted, return empty string
                if (prompt) outputLines.push(String(prompt));
                const val = testInputs[inputIndex] !== undefined ? String(testInputs[inputIndex]) : '';
                inputIndex++;
                return val;
            }));

            try {
                await _state.pyodide.runPythonAsync(code);
            } catch (err) {
                runError = err;
            }

            stdoutStr = outputLines.join('\n');
        }

        // ── Run Tests ────────────────────────────────────────────
        const tests = ch.tests || [];
        const testResultsList = tests.map(function(test) {
            if (runError) {
                // If the code crashed, all tests fail automatically
                return { name: test.name || 'Test', passed: false, reason: 'Code threw an error.' };
            }
            try {
                // Pass both output and source code so tests can validate
                // either program output OR code structure (e.g. "uses def", "uses strip()")
                const passed = test.check(stdoutStr, code);
                return { name: test.name || 'Test', passed: Boolean(passed), reason: '' };
            } catch (testErr) {
                return { name: test.name || 'Test', passed: false, reason: 'Test threw: ' + testErr.message };
            }
        });

        const allTestsPassed = testResultsList.length > 0 && testResultsList.every(function(r) { return r.passed; });

        // ── Output Panel: Output Tab ─────────────────────────────
        let outputText = stdoutStr;
        if (runError) {
            outputText += (outputText ? '\n' : '') + _translateError(runError.message || String(runError));
        }
        _setOutput(outputText || '(no output)', runError ? 'error' : 'success');

        // ── Output Panel: Tests Tab ──────────────────────────────
        _renderTestResults(testResultsList);
        _switchOutputTab('tests');

        // ── XP Award Logic ───────────────────────────────────────
        if (allTestsPassed && !data.passed) {
            // This is the first time this challenge has been passed
            data.passed = true;

            const baseXp = ch.xp || XP_BY_DIFFICULTY[(ch.difficulty || 'easy').toLowerCase()] || 10;
            let awardedXp = baseXp;

            // First-try bonus: no prior failed submits
            if (data.submitCount === 1) {
                awardedXp += XP_FIRST_TRY_BONUS;
            }

            // Speed bonus: check if solved within par time
            if (ch.parTime && data.startTime) {
                const elapsedSeconds = Math.floor((Date.now() - data.startTime) / 1000);
                if (elapsedSeconds <= ch.parTime) {
                    awardedXp += XP_SPEED_BONUS;
                }
            }

            // Hint penalty: -5 per hint used, floored at 0
            const hintPenalty = (data.hintsUsed || 0) * XP_HINT_PENALTY;
            awardedXp = Math.max(0, awardedXp - hintPenalty);

            data.earnedXp = awardedXp;
            _state.totalXp += awardedXp;

            // Persist new XP total and challenge completion
            _saveXp(_state.config.moduleId, _state.totalXp);
            _savePassed(_state.config.moduleId, ch.id);

            // Streak: bump on pass
            _state.streak++;
            _saveStreak(_state.config.moduleId, _state.streak);
            _checkStreakMilestone(_state.streak);

            // Refresh sidebar to show PASSED status
            _renderChallengeList();
            _updateProgress();
            _updateStatusBar();

            // Check if every challenge is now complete
            _checkAllPassed();

        } else if (!allTestsPassed) {
            // Failed submit: reset streak
            _state.streak = 0;
            _saveStreak(_state.config.moduleId, 0);
            _updateStatusBar();
        }

        // Add history entry regardless of pass/fail
        _addHistoryEntry({
            code: code,
            output: outputText,
            timestamp: new Date(),
            type: 'submit',
            passed: allTestsPassed
        });

        // Refresh variable inspector after submit
        _updateVariableInspector();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERACTIVE INPUT HANDLING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Called by the overridden input() function during interactive Run mode.
     * Shows the input field in the output panel, then returns a Promise that
     * resolves with whatever the student types and submits.
     *
     * Note: Pyodide's runPythonAsync() allows returning a JS Promise from a
     * Python-called function — it will await it automatically.
     *
     * @param {Array} outputLines - The shared stdout buffer (we append prompt output before awaiting)
     * @returns {Promise<string>} - Resolves to the student's input string
     */
    function _waitForInteractiveInput(outputLines) {
        // Show the current accumulated output so far
        _setOutput(outputLines.join('\n') || '(waiting for input...)', 'info');

        // Show the input row and focus the field
        _state.dom.inputRow.style.display = 'flex';
        _state.dom.inputField.focus();

        // Return a Promise. _resolveNextInput() calls the stored resolver.
        return new Promise(function(resolve) {
            _state.inputResolvers.push({ resolve: resolve });
        });
    }

    /**
     * Called when the student hits Enter in the interactive input field.
     * Resolves the oldest pending input() Promise with the submitted value.
     * Appends the submitted value to the output display so it looks like a terminal.
     *
     * @param {string} value - The text the student typed
     */
    function _resolveNextInput(value) {
        if (_state.inputResolvers.length === 0) return;

        const next = _state.inputResolvers.shift();

        // Echo the input to the output display (mimics real terminal behavior)
        const current = _state.dom.outputDisplay.textContent;
        _state.dom.outputDisplay.textContent = current + (current ? '\n' : '') + value;

        // Hide input row immediately — will re-show if another input() is hit
        _state.dom.inputRow.style.display = 'none';

        // Resolve the Promise so Python execution continues
        next.resolve(value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REPL
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Execute a single REPL expression or statement.
     * Results are appended to the REPL history display.
     *
     * @param {string} code - Single line or short snippet of Python
     */
    async function _executeRepl(code) {
        if (!code.trim()) return;

        // Ensure Pyodide is ready
        try {
            await _ensurePyodide();
        } catch (err) {
            _appendReplLine('Error loading Python: ' + err.message, 'error');
            return;
        }

        // Show what was typed
        _appendReplLine('>>> ' + code, 'prompt');

        // Capture stdout
        const lines = [];
        _state.pyodide.setStdout({ batched: function(l) { lines.push(l); } });
        _state.pyodide.setStderr({ batched: function(l) { lines.push(l); } });

        try {
            // Use eval-style: try to evaluate as expression first (returns value),
            // fall back to exec-style if it fails (e.g., assignment statements)
            let result;
            try {
                result = _state.pyodide.runPython(code);
            } catch {
                result = undefined;
            }

            const stdoutStr = lines.join('\n');
            if (stdoutStr) _appendReplLine(stdoutStr, 'output');
            // Only display result if it's not None/undefined and nothing was printed
            if (result !== undefined && result !== null && !stdoutStr) {
                _appendReplLine(String(result), 'output');
            }
        } catch (err) {
            _appendReplLine(_translateError(err.message || String(err)), 'error');
        }
    }

    /**
     * Append a line to the REPL history display.
     *
     * @param {string} text - Content to display
     * @param {string} type - 'prompt' | 'output' | 'error'
     */
    function _appendReplLine(text, type) {
        const line = _el('div', 'ps-repl-line ps-repl-line--' + type);
        line.textContent = text;
        _state.dom.replHistory.appendChild(line);
        // Auto-scroll to the newest line
        _state.dom.replHistory.scrollTop = _state.dom.replHistory.scrollHeight;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VARIABLE INSPECTOR
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Query Pyodide's global namespace after execution and render all
     * user-defined variables in the right panel.
     *
     * Filters out: dunder names (__x__), modules, built-in callables,
     * and internal Pyodide artifacts.
     */
    function _updateVariableInspector() {
        if (!_state.pyodide) return;

        const list = _state.dom.inspectorList;
        list.innerHTML = '';

        // Get all names in the Python global namespace
        let names;
        try {
            names = _state.pyodide.runPython('list(globals().keys())').toJs();
        } catch {
            return;
        }

        // Filter to only user-meaningful variables
        const skipPrefixes = ['__'];
        const skipNames = new Set(['input', 'print', 'open', 'exit', 'quit', 'help', 'copyright', 'credits', 'license']);

        const userVars = names.filter(function(name) {
            if (skipNames.has(name)) return false;
            if (skipPrefixes.some(function(p) { return name.startsWith(p); })) return false;
            return true;
        });

        if (userVars.length === 0) {
            _state.dom.inspectorHint.textContent = 'No variables defined yet.';
            return;
        }
        _state.dom.inspectorHint.textContent = '';

        userVars.forEach(function(name) {
            let pyType = 'unknown';
            let displayValue = '?';

            try {
                // Get type name from Python
                pyType = _state.pyodide.runPython('type(' + name + ').__name__');

                // Skip module and function objects — not useful to display
                if (pyType === 'module' || pyType === 'function' || pyType === 'builtin_function_or_method') return;

                // Get string representation, truncated for readability
                const fullVal = _state.pyodide.runPython('repr(' + name + ')');
                displayValue = fullVal.length > 60 ? fullVal.slice(0, 57) + '...' : fullVal;
            } catch {
                displayValue = '(unreadable)';
            }

            // Color class based on Python type
            const colorClass = _typeColorClass(pyType);

            const row = _el('div', 'ps-var-row');
            row.innerHTML =
                '<span class="ps-var-name">' + _escape(name) + '</span>' +
                '<span class="ps-var-type ' + colorClass + '">' + _escape(pyType) + '</span>' +
                '<span class="ps-var-value">' + _escape(displayValue) + '</span>';

            list.appendChild(row);
        });
    }

    /**
     * Return a CSS class name for a Python type string.
     * Used to color-code variable types in the inspector.
     *
     * @param {string} typeName - Python type.__name__ string
     * @returns {string} CSS class
     */
    function _typeColorClass(typeName) {
        const map = {
            str:   'ps-type-str',
            int:   'ps-type-int',
            float: 'ps-type-float',
            list:  'ps-type-list',
            tuple: 'ps-type-list',
            dict:  'ps-type-dict',
            bool:  'ps-type-bool',
            set:   'ps-type-list',
            NoneType: 'ps-type-none'
        };
        return map[typeName] || 'ps-type-other';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERROR TRANSLATOR
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Map Python exception messages to plain English explanations.
     * Returns an HTML string with the friendly message and a collapsed
     * "Show original" detail block containing the raw Python traceback.
     *
     * The design intent: novices see the friendly message by default;
     * they can expand to see the real error as they grow more experienced.
     *
     * @param {string} rawMsg - Raw Python exception string from Pyodide
     * @returns {string} - Formatted error string (plain text, not HTML — output is set via textContent)
     */
    function _translateError(rawMsg) {
        if (!rawMsg) return 'An unknown error occurred.';

        const msg = rawMsg;

        // ── NameError ─────────────────────────────────────────────
        const nameMatch = msg.match(/NameError.*name '(\w+)' is not defined/);
        if (nameMatch) {
            return (
                'Variable Error: You used a variable called "' + nameMatch[1] + '" but never created it.\n' +
                'Check the spelling, or make sure you assigned it a value before using it.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── TypeError: string + int concatenation ─────────────────
        if (msg.includes('TypeError') && msg.includes('can only concatenate str')) {
            return (
                'Type Error: You tried to combine text and a number with +.\n' +
                'Convert the number to text first using str(). For example: "Age: " + str(25)\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── TypeError: generic ────────────────────────────────────
        if (msg.includes('TypeError')) {
            return (
                'Type Error: You passed the wrong type of value to a function or operator.\n' +
                'Check what types each function expects (e.g., int, str, list).\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── SyntaxError ───────────────────────────────────────────
        if (msg.includes('SyntaxError')) {
            return (
                'Syntax Error: Python cannot understand this line.\n' +
                'Check for: missing colons after if/for/def, unmatched parentheses, or unclosed quotes.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── IndentationError ──────────────────────────────────────
        if (msg.includes('IndentationError')) {
            return (
                'Indentation Error: The spacing on this line is wrong.\n' +
                'Use exactly 4 spaces for each indent level. Do not mix tabs and spaces.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── TabError (subclass of IndentationError) ───────────────
        // Python raises TabError specifically when tabs and spaces are mixed.
        // The traceback says "TabError:", not "IndentationError:", so it needs
        // its own handler to avoid falling through to the generic fallback.
        if (msg.includes('TabError')) {
            return (
                'Tab Error: You mixed tabs and spaces in your indentation.\n' +
                'Pick one and stick with it — Python convention is 4 spaces per indent level.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── IndexError ────────────────────────────────────────────
        const indexMatch = msg.match(/IndexError.*list index out of range/);
        if (indexMatch) {
            return (
                'Index Error: You tried to access a position that does not exist in the list.\n' +
                'Remember: list indices start at 0. A list with 3 items has indices 0, 1, 2.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── KeyError ──────────────────────────────────────────────
        const keyMatch = msg.match(/KeyError:\s*(.+)/);
        if (keyMatch) {
            return (
                'Key Error: The key ' + keyMatch[1] + ' does not exist in this dictionary.\n' +
                'Check your spelling, or use dict.get("key") for safe access that returns None if missing.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── ValueError ────────────────────────────────────────────
        if (msg.includes('ValueError')) {
            return (
                'Value Error: The value you provided is not the right type for this operation.\n' +
                'For example, int("hello") fails because "hello" cannot be converted to a number.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── ZeroDivisionError ─────────────────────────────────────
        if (msg.includes('ZeroDivisionError')) {
            return (
                'Zero Division Error: You divided by zero, which is mathematically undefined.\n' +
                'Check your denominator before dividing (e.g., if divisor != 0: ...).\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── FileNotFoundError ─────────────────────────────────────
        if (msg.includes('FileNotFoundError')) {
            return (
                'File Not Found: Python cannot find the file you referenced.\n' +
                'Check the filename, extension, and path. Remember paths are case-sensitive on Linux.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── AttributeError ────────────────────────────────────────
        if (msg.includes('AttributeError')) {
            return (
                'Attribute Error: This object does not have that method or property.\n' +
                'Use type(variable) to check what kind of object you have, then look up its methods.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── RecursionError ────────────────────────────────────────
        if (msg.includes('RecursionError')) {
            return (
                'Recursion Error: Your function called itself too many times without stopping.\n' +
                'Make sure your recursive function has a proper base case that ends the recursion.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── ImportError / ModuleNotFoundError ─────────────────────
        if (msg.includes('ImportError') || msg.includes('ModuleNotFoundError')) {
            return (
                'Import Error: Python cannot find the module you tried to import.\n' +
                'In this browser environment, only standard library modules and pre-loaded packages are available.\n\n' +
                '--- Original Error ---\n' + rawMsg
            );
        }

        // ── Fallback: return raw with a generic header ────────────
        return 'Python Error:\n' + rawMsg;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HINTS SYSTEM
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Reveal the next hint for the active challenge.
     * Increments hintsUsed on the challenge's runtime data and re-renders
     * the description bar to show the new hint callout.
     *
     * Hint penalty (-5 XP per hint) is applied at Submit time, not here.
     */
    function _revealNextHint() {
        const ch = _state.activeChallenge;
        if (!ch || !ch.hints) return;

        const data = _state.challengeData[ch.id];
        if (data.hintsUsed >= ch.hints.length) return; // Already exhausted

        data.hintsUsed++;

        // Re-render description bar so the new hint appears
        _renderDescription();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TIMER
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Start the per-challenge elapsed time timer.
     * Ticks every second and updates the status bar display.
     */
    function _startTimer() {
        _state.timerInterval = setInterval(function() {
            _state.timerSeconds++;
            _updateTimerDisplay();
        }, 1000);
    }

    /**
     * Stop and reset the elapsed time timer.
     * Called when switching challenges.
     */
    function _resetTimer() {
        if (_state.timerInterval) {
            clearInterval(_state.timerInterval);
            _state.timerInterval = null;
        }
        _state.timerSeconds = 0;
        _updateTimerDisplay();
    }

    /**
     * Update the timer label in the status bar.
     * Format: M:SS (e.g., "2:05", "10:47")
     */
    function _updateTimerDisplay() {
        const mins = Math.floor(_state.timerSeconds / 60);
        const secs = _state.timerSeconds % 60;
        const display = mins + ':' + (secs < 10 ? '0' : '') + secs;
        if (_state.dom.timerDisplay) {
            _state.dom.timerDisplay.textContent = 'Time: ' + display;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // XP AND STREAK DISPLAY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Update all status bar elements: streak count, timer, and XP total.
     * Also checks whether a streak milestone flair should be triggered.
     */
    function _updateStatusBar() {
        // Streak display
        const streak = _state.streak;
        let streakText = 'Streak: ' + streak;
        _state.dom.streakDisplay.textContent = streakText;

        // Apply milestone class if at a milestone number
        _state.dom.streakDisplay.classList.remove('ps-streak-milestone');
        if (STREAK_MILESTONES.includes(streak)) {
            _state.dom.streakDisplay.classList.add('ps-streak-milestone');
        }

        // XP display
        _state.dom.xpDisplay.textContent = 'XP: ' + _state.totalXp;
    }

    /**
     * Check if the just-reached streak count is a milestone.
     * Visual flair is applied via CSS; this function handles the logic gate.
     *
     * @param {number} streak - Current streak count
     */
    function _checkStreakMilestone(streak) {
        if (!STREAK_MILESTONES.includes(streak)) return;

        // The CSS class 'ps-streak-milestone' is applied in _updateStatusBar.
        // Here we show a brief toast notification so the student knows they
        // hit a streak milestone — the amber pulse alone is too subtle.

        // Milestone-specific messages
        var messages = { 3: '3 in a row!', 5: '5-streak! On fire!', 10: '10-STREAK! Unstoppable!' };
        var text = messages[streak] || 'Streak: ' + streak + '!';

        // Create the toast element
        var toast = document.createElement('div');
        toast.className = 'ps-streak-toast';
        toast.textContent = text;

        // Append to the sandbox root so it's scoped inside the component
        var root = document.querySelector('.ps-root');
        if (root) {
            root.appendChild(toast);

            // Auto-remove after the animation completes (2.5s)
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 2500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PROGRESS BAR (SIDEBAR FOOTER)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Update the progress bar at the bottom of the sidebar.
     * Shows X/Y challenges passed and fills the bar proportionally.
     */
    function _updateProgress() {
        const challenges = _state.config.challenges;
        const total = challenges.length;
        const passed = challenges.filter(function(ch) {
            return _state.challengeData[ch.id] && _state.challengeData[ch.id].passed;
        }).length;

        const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

        _state.dom.progressLabel.textContent = passed + ' / ' + total + ' passed';
        _state.dom.progressFill.style.width = pct + '%';
        _state.dom.xpTotal.textContent = 'Total XP: ' + _state.totalXp;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CELEBRATION
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if all challenges are now in a passed state.
     * If so, show the celebration banner and confetti particles.
     */
    function _checkAllPassed() {
        const all = _state.config.challenges.every(function(ch) {
            return _state.challengeData[ch.id] && _state.challengeData[ch.id].passed;
        });

        if (!all) return;

        const cel = _state.dom.celebration;
        cel.style.display = 'flex';

        // Build confetti: 40 small colored dots with randomized CSS animations
        const confettiContainer = document.getElementById('ps-confetti');
        if (confettiContainer && confettiContainer.children.length === 0) {
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
            for (let i = 0; i < 40; i++) {
                const dot = document.createElement('span');
                dot.className = 'ps-confetti-dot';
                // Randomize horizontal position, delay, and color
                dot.style.left = (Math.random() * 100) + '%';
                dot.style.animationDelay = (Math.random() * 2) + 's';
                dot.style.animationDuration = (1.5 + Math.random() * 2) + 's';
                dot.style.background = colors[Math.floor(Math.random() * colors.length)];
                confettiContainer.appendChild(dot);
            }
        }
    }

    /**
     * Mark the lab as complete via ModuleProgress.
     * Called when the student clicks "Mark Lab Complete" in the celebration banner.
     */
    function _markLabComplete() {
        if (typeof ModuleProgress !== 'undefined') {
            ModuleProgress.complete(
                _state.config.houseId,
                _state.config.moduleId,
                {
                    score: _state.totalXp,
                    returnUrl: _state.config.returnUrl
                }
            );
        } else {
            // Graceful fallback: navigate back without recording progress
            window.location.href = _state.config.returnUrl || '../index.html';
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HISTORY
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Add a run or submit snapshot to the in-memory history and refresh
     * the History tab display. Newest entries appear at the top.
     *
     * @param {Object} entry - { code, output, timestamp, type, passed }
     */
    function _addHistoryEntry(entry) {
        // Prepend to array so index 0 is always most recent
        _state.runHistory.unshift(entry);

        _renderHistoryLog();
    }

    /**
     * Render the history log tab from _state.runHistory.
     * Each entry is a collapsible row showing timestamp, type badge, and output.
     */
    function _renderHistoryLog() {
        const log = _state.dom.historyLog;
        log.innerHTML = '';

        if (_state.runHistory.length === 0) {
            log.textContent = 'No runs yet this session.';
            return;
        }

        _state.runHistory.forEach(function(entry, i) {
            const row = _el('div', 'ps-history-entry');

            // Format timestamp: HH:MM:SS
            const ts = entry.timestamp;
            const time = ts.getHours() + ':' +
                String(ts.getMinutes()).padStart(2, '0') + ':' +
                String(ts.getSeconds()).padStart(2, '0');

            const typeBadge = entry.type === 'submit'
                ? (entry.passed ? '[PASS]' : '[FAIL]')
                : '[RUN]';

            const header = _el('div', 'ps-history-header');
            header.textContent = time + '  ' + typeBadge + '  ' + entry.output.slice(0, 60) + (entry.output.length > 60 ? '...' : '');

            // Clicking the header expands to show full output (read-only)
            header.addEventListener('click', function() {
                const body = row.querySelector('.ps-history-body');
                if (body) body.style.display = body.style.display === 'none' ? 'block' : 'none';
            });

            const body = _el('div', 'ps-history-body');
            body.style.display = 'none';
            body.textContent = '--- Output ---\n' + entry.output;

            row.appendChild(header);
            row.appendChild(body);
            log.appendChild(row);
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EDITOR UTILITIES
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Reset the editor to the active challenge's starter code.
     * Prompts the user first since this destroys their work.
     */
    function _resetToStarter() {
        const ch = _state.activeChallenge;
        if (!ch) return;

        if (!confirm('Reset to starter code? Your current code will be cleared.')) return;

        _state.dom.editor.value = ch.starter || '';
        if (_state.cmEditor) _state.cmEditor.refresh();
        _updateLineNumbers();
        _saveCodeForChallenge(ch.id, _state.dom.editor.value);
    }

    /**
     * Export the current editor content as a .py file.
     * Uses the Blob + createObjectURL pattern (no server required).
     */
    function _exportAsPy() {
        const ch = _state.activeChallenge;
        const code = _state.dom.editor.value;
        const filename = (ch ? ch.id : 'challenge') + '.py';

        // Build a Blob from the code string, typed as Python source
        const blob = new Blob([code], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor, click it, then clean up
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Release the object URL from memory after a short delay
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    }

    /**
     * Update the line number gutter to match the current line count in the editor.
     * Also syncs the scroll position so line numbers stay aligned.
     */
    function _updateLineNumbers() {
        const text = _state.dom.editor.value;
        const lines = text.split('\n').length;
        const gutter = _state.dom.lineNumbers;

        // Only rebuild the gutter if line count changed (avoid DOM churn on every keypress)
        const current = gutter.children.length;
        if (current !== lines) {
            gutter.innerHTML = '';
            for (let i = 1; i <= lines; i++) {
                const span = document.createElement('div');
                span.className = 'ps-line-num';
                span.textContent = i;
                gutter.appendChild(span);
            }
        }

        // Keep gutter scroll synchronized with editor scroll
        gutter.scrollTop = _state.dom.editor.scrollTop;
    }

    /**
     * Insert a string at the current cursor position in the textarea.
     * Preserves selection if text is selected (replaces it with the inserted string).
     *
     * @param {HTMLTextAreaElement} textarea
     * @param {string} text - String to insert (e.g., '    ' for Tab)
     */
    function _insertAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.slice(0, start);
        const after = textarea.value.slice(end);
        textarea.value = before + text + after;
        // Move cursor to after inserted text
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OUTPUT PANEL MANAGEMENT
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Set the content of the Output tab's display area.
     *
     * @param {string} text - Content to display (plain text, uses textContent)
     * @param {string} type - 'info' | 'success' | 'error' (affects CSS class)
     */
    function _setOutput(text, type) {
        const display = _state.dom.outputDisplay;
        display.textContent = text;
        display.className = 'ps-output-display ps-output-' + (type || 'info');
    }

    /**
     * Render pass/fail results in the Tests tab after a Submit.
     *
     * @param {Array} results - Array of { name, passed, reason } objects
     */
    function _renderTestResults(results) {
        const container = _state.dom.testResults;
        container.innerHTML = '';

        if (!results || results.length === 0) {
            container.textContent = 'No tests defined for this challenge.';
            return;
        }

        results.forEach(function(r) {
            const row = _el('div', 'ps-test-row ' + (r.passed ? 'ps-test-pass' : 'ps-test-fail'));
            const icon = r.passed ? '[PASS]' : '[FAIL]';
            row.textContent = icon + '  ' + r.name + (r.reason ? ' — ' + r.reason : '');
            container.appendChild(row);
        });
    }

    /**
     * Switch the active output tab to the given tab ID.
     * Updates tab button active state and shows/hides panes.
     *
     * @param {string} tabId - 'output' | 'repl' | 'tests' | 'history'
     */
    function _switchOutputTab(tabId) {
        _state.activeOutputTab = tabId;

        // Update tab button active states
        const tabs = _state.dom.tabRow.querySelectorAll('.ps-tab');
        tabs.forEach(function(tab) {
            tab.classList.toggle('ps-tab--active', tab.dataset.tab === tabId);
        });

        // Show/hide panes
        const panes = _state.dom.tabRow.parentElement.querySelectorAll('.ps-tab-pane');
        panes.forEach(function(pane) {
            pane.style.display = pane.dataset.pane === tabId ? 'flex' : 'none';
        });
    }

    /**
     * Clear the content of a named output tab.
     *
     * @param {string} target - 'output' | 'repl' | 'tests' | 'history'
     */
    function _clearTab(target) {
        switch (target) {
            case 'output':
                _state.dom.outputDisplay.textContent = '';
                _state.dom.outputDisplay.className = 'ps-output-display';
                break;
            case 'repl':
                _state.dom.replHistory.innerHTML = '';
                break;
            case 'tests':
                _state.dom.testResults.innerHTML = '';
                _state.dom.testResults.textContent = 'Run Submit to see test results.';
                break;
            case 'history':
                _state.runHistory = [];
                _state.dom.historyLog.textContent = 'No runs yet this session.';
                break;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTOSAVE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Schedule an autosave to fire AUTOSAVE_DEBOUNCE_MS after the last keystroke.
     * If called again before the timer fires, the previous timer is cancelled
     * (debounce pattern).
     */
    function _scheduleAutosave() {
        if (_state.autosaveTimer) clearTimeout(_state.autosaveTimer);
        _state.autosaveTimer = setTimeout(function() {
            _autosaveCode();
        }, AUTOSAVE_DEBOUNCE_MS);
    }

    /**
     * Immediately save the current editor content to localStorage.
     */
    function _autosaveCode() {
        if (!_state.activeChallenge) return;
        _saveCodeForChallenge(_state.activeChallenge.id, _state.dom.editor.value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PYODIDE LOADING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Ensure Pyodide is loaded and ready.
     * First call loads the CDN script and initializes the runtime (~5-8s).
     * Subsequent calls resolve instantly from the cached instance.
     *
     * Uses a module-level promise so that concurrent calls (e.g., double-click Run)
     * don't trigger multiple loads.
     *
     * @returns {Promise<void>} Resolves when Pyodide is ready
     */
    function _ensurePyodide() {
        // Return immediately if already loaded
        if (_state.pyodide) return Promise.resolve();

        // Return the in-progress load promise if one exists
        if (_pyodideLoadPromise) return _pyodideLoadPromise;

        // Show the loading overlay over the center column
        _state.dom.loadingOverlay.style.display = 'flex';

        _pyodideLoadPromise = new Promise(function(resolve, reject) {
            // Inject the Pyodide CDN script into <head>
            const script = document.createElement('script');
            script.src = PYODIDE_CDN;
            script.onload = async function() {
                try {
                    // loadPyodide is a global function defined by the Pyodide CDN script
                    _state.pyodide = await loadPyodide();
                    _state.dom.loadingOverlay.style.display = 'none';
                    resolve();
                } catch (err) {
                    _state.dom.loadingOverlay.style.display = 'none';
                    _pyodideLoadPromise = null; // Allow retry
                    reject(err);
                }
            };
            script.onerror = function() {
                _state.dom.loadingOverlay.style.display = 'none';
                _pyodideLoadPromise = null;
                reject(new Error('Failed to load Pyodide from CDN. Check your internet connection.'));
            };
            document.head.appendChild(script);
        });

        return _pyodideLoadPromise;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LOCALSTORAGE PERSISTENCE
    // All localStorage access is centralized here. Keys are namespaced by
    // the module ID so multiple labs on the same domain don't collide.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Save the editor code for a specific challenge to localStorage.
     *
     * @param {string} challengeId
     * @param {string} code
     */
    function _saveCodeForChallenge(challengeId, code) {
        const key = LS_PREFIX + _state.config.moduleId + '_code_' + challengeId;
        try { localStorage.setItem(key, code); } catch (e) { /* storage full — silently ignore */ }
    }

    /**
     * Load saved editor code for a challenge from localStorage.
     *
     * @param {string} challengeId
     * @returns {string|null} Saved code, or null if not found
     */
    function _loadCodeForChallenge(challengeId) {
        const key = LS_PREFIX + _state.config.moduleId + '_code_' + challengeId;
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    /**
     * Save total XP for this lab module to localStorage.
     *
     * @param {string} moduleId
     * @param {number} xp
     */
    function _saveXp(moduleId, xp) {
        try { localStorage.setItem(LS_PREFIX + moduleId + '_xp', String(xp)); } catch (e) {}
    }

    /**
     * Load total XP for this lab module from localStorage.
     *
     * @param {string} moduleId
     * @returns {number}
     */
    function _loadXp(moduleId) {
        try { return parseInt(localStorage.getItem(LS_PREFIX + moduleId + '_xp') || '0', 10); } catch (e) { return 0; }
    }

    /**
     * Save a challenge's passed status to localStorage.
     *
     * @param {string} moduleId
     * @param {string} challengeId
     */
    function _savePassed(moduleId, challengeId) {
        const key = LS_PREFIX + moduleId + '_passed';
        let passed = {};
        try { passed = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
        passed[challengeId] = true;
        try { localStorage.setItem(key, JSON.stringify(passed)); } catch (e) {}
    }

    /**
     * Load the passed status for a single challenge from localStorage.
     *
     * @param {string} moduleId
     * @param {string} challengeId
     * @returns {boolean}
     */
    function _loadPassed(moduleId, challengeId) {
        const key = LS_PREFIX + moduleId + '_passed';
        try {
            const passed = JSON.parse(localStorage.getItem(key) || '{}');
            return passed[challengeId] === true;
        } catch (e) { return false; }
    }

    /**
     * Save the current streak to localStorage.
     *
     * @param {string} moduleId
     * @param {number} streak
     */
    function _saveStreak(moduleId, streak) {
        try { localStorage.setItem(LS_PREFIX + moduleId + '_streak', String(streak)); } catch (e) {}
    }

    /**
     * Load the current streak from localStorage.
     *
     * @param {string} moduleId
     * @returns {number}
     */
    function _loadStreak(moduleId) {
        try { return parseInt(localStorage.getItem(LS_PREFIX + moduleId + '_streak') || '0', 10); } catch (e) { return 0; }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOM UTILITY HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Create a DOM element with a given tag and className.
     * Shorthand used heavily in _buildDOM to keep it readable.
     *
     * @param {string} tag - HTML tag name (e.g., 'div', 'button')
     * @param {string} className - Space-separated CSS class string
     * @returns {HTMLElement}
     */
    function _el(tag, className) {
        const elem = document.createElement(tag);
        if (className) elem.className = className;
        return elem;
    }

    /**
     * Escape a string for safe insertion as text content or attribute value.
     * Prevents XSS when rendering user-controlled config values like challenge titles.
     *
     * @param {string} str
     * @returns {string}
     */
    function _escape(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CSS INJECTION
    // All component styles are defined here and injected once into <head>.
    // The ps- prefix scopes everything to avoid collision with host page styles.
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Inject all PythonSandbox CSS into the document <head>.
     * Idempotent: checks for the style tag's ID before injecting.
     */
    function _injectStyles() {
        if (document.getElementById('ps-styles')) return; // Already injected

        const style = document.createElement('style');
        style.id = 'ps-styles';
        style.textContent = _getStyles();
        document.head.appendChild(style);
    }

    /**
     * Return the full CSS string for the sandbox component.
     * Split into logical sections with comments for maintainability.
     *
     * @returns {string}
     */
    function _getStyles() {
        return `
/* ── Reset and Root Container ──────────────────────────────────────────── */

/* The root container fills the viewport. The host page should give it
   explicit height (e.g., 100vh) for the flex layout to work correctly. */
.ps-root {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #0a0e1a;
    color: #c9d1d9;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    box-sizing: border-box;
    overflow: hidden; /* Scroll is handled per-panel, not the root */
}

/* All child elements inherit border-box */
.ps-root *, .ps-root *::before, .ps-root *::after {
    box-sizing: inherit;
}

/* ── Custom Scrollbar Styling ───────────────────────────────────────────── */

/* Thin, dark scrollbars that match the IDE aesthetic */
.ps-root ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.ps-root ::-webkit-scrollbar-track {
    background: #0d1117;
}
.ps-root ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
}
.ps-root ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
}

/* ── Top Bar ────────────────────────────────────────────────────────────── */

/* Fixed-height bar across the full width. Three zones: left (title),
   center (shortcut hints), right (navigation link). */
.ps-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    min-height: 44px;
    background: #0d1117;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0 16px;
    flex-shrink: 0;
}

.ps-top-bar-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* Green accent dot — visual identity marker for the Code house */
.ps-logo-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #10b981;
    flex-shrink: 0;
}

.ps-title {
    font-weight: 600;
    font-size: 15px;
    color: #e6edf3;
}

.ps-top-bar-center {
    color: rgba(255, 255, 255, 0.35);
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', monospace;
}

.ps-nav-link {
    color: #10b981;
    text-decoration: none;
    font-size: 13px;
    padding: 4px 10px;
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 4px;
    transition: background 0.15s, border-color 0.15s;
}
.ps-nav-link:hover {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.6);
}

/* ── Main Row ───────────────────────────────────────────────────────────── */

/* Three-column flex row. Sidebar and inspector have fixed widths;
   center column is flex:1 and fills remaining space. */
.ps-main-row {
    display: flex;
    flex: 1;
    min-height: 0; /* Critical: allows children to scroll independently */
    overflow: hidden;
}

/* ── Left Sidebar ───────────────────────────────────────────────────────── */

.ps-sidebar {
    width: 220px;
    min-width: 220px;
    background: #0d1117;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Challenge list: scrollable, fills all available sidebar space */
.ps-challenge-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
}

/* Each challenge item in the list */
.ps-challenge-item {
    padding: 10px 12px;
    border-radius: 6px;
    margin-bottom: 4px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: background 0.15s;
}
.ps-challenge-item:hover {
    background: rgba(255, 255, 255, 0.04);
}

/* Active challenge: accent border + slightly highlighted background */
.ps-challenge-item--active {
    background: rgba(16, 185, 129, 0.08);
    border-left-color: #10b981;
}

/* Passed challenge: subtle green text on the status indicator */
.ps-challenge-item--passed .ps-ci-status {
    color: #10b981;
}

.ps-ci-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.ps-ci-status {
    font-size: 10px;
    font-family: 'SF Mono', monospace;
    color: rgba(255, 255, 255, 0.35);
    flex-shrink: 0;
}

.ps-ci-title {
    font-size: 13px;
    color: #e6edf3;
    line-height: 1.3;
}

.ps-ci-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-left: 28px; /* Indent to align under title, past status icon */
}

.ps-ci-xp {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
}

/* ── Sidebar Footer ─────────────────────────────────────────────────────── */

.ps-sidebar-footer {
    padding: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
}

.ps-progress-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 6px;
}

/* Progress bar track (container) */
.ps-progress-bar-track {
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
}

/* Progress bar fill — width is set via JS as a percentage */
.ps-progress-bar-fill {
    height: 100%;
    background: #10b981;
    border-radius: 3px;
    transition: width 0.4s ease;
    width: 0%;
}

.ps-xp-total {
    font-size: 12px;
    color: #10b981;
    font-weight: 600;
}

/* ── Difficulty Badges ──────────────────────────────────────────────────── */

/* Shared badge base */
.ps-diff-badge {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: 600;
    font-family: 'SF Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Green = Easy */
.diff-easy {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Amber = Medium */
.diff-medium {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Red = Hard */
.diff-hard {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

/* ── Center Column ──────────────────────────────────────────────────────── */

/* Fills remaining horizontal space, arranges editor + output vertically */
.ps-center-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* Prevents flex overflow */
    position: relative; /* For loading overlay positioning */
    overflow: hidden;
}

/* ── Description Bar ────────────────────────────────────────────────────── */

/* Shows challenge title, instructions, expected output, and hints.
   Fixed height with internal scrolling so it doesn't push the editor. */
.ps-desc-bar {
    background: #0d1117;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 12px 16px;
    max-height: 200px;
    overflow-y: auto;
    flex-shrink: 0;
}

.ps-desc-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 6px;
}

.ps-desc-title {
    font-size: 15px;
    font-weight: 600;
    color: #e6edf3;
}

.ps-desc-badges {
    display: flex;
    align-items: center;
    gap: 8px;
}

.ps-desc-xp {
    font-size: 12px;
    color: #10b981;
    font-weight: 600;
}

.ps-desc-par {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
}

/* Instructions body — allows trusted HTML from course config */
.ps-desc-instructions {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
    margin-bottom: 10px;
}

.ps-desc-instructions code {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: #10b981;
}

/* Expected output block */
.ps-desc-expected {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.ps-desc-expected-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    white-space: nowrap;
    padding-top: 2px;
}

.ps-desc-expected-code {
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 4px;
    padding: 3px 8px;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: #10b981;
    white-space: pre;
}

/* Hint callout boxes */
.ps-hints-container {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
}

.ps-hint-box {
    background: rgba(245, 158, 11, 0.08);
    border-left: 3px solid #f59e0b;
    border-radius: 0 4px 4px 0;
    padding: 6px 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
}

.ps-hint-label {
    color: #f59e0b;
    font-weight: 600;
    margin-right: 4px;
}

/* ── Shared Button Styles ───────────────────────────────────────────────── */

.ps-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    white-space: nowrap;
}
.ps-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #e6edf3;
}
.ps-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* Run button: green accent */
.ps-btn-run {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.4);
    color: #10b981;
}
.ps-btn-run:hover {
    background: rgba(16, 185, 129, 0.25) !important;
    border-color: rgba(16, 185, 129, 0.7) !important;
    color: #10b981 !important;
}

/* Submit button: blue accent */
.ps-btn-submit {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.4);
    color: #3b82f6;
}
.ps-btn-submit:hover {
    background: rgba(59, 130, 246, 0.25) !important;
    border-color: rgba(59, 130, 246, 0.7) !important;
    color: #3b82f6 !important;
}

/* Hint button: amber accent */
.ps-btn-hint {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.3);
    color: #f59e0b;
    font-size: 11px;
    padding: 4px 10px;
}

/* Complete button in celebration banner */
.ps-btn-complete {
    background: rgba(16, 185, 129, 0.2);
    border-color: #10b981;
    color: #10b981;
    font-size: 14px;
    padding: 8px 20px;
}

/* ── Editor Toolbar ─────────────────────────────────────────────────────── */

.ps-editor-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: #0d1117;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
    gap: 8px;
}

.ps-toolbar-left, .ps-toolbar-right {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* ── Code Editor Area ───────────────────────────────────────────────────── */

/* Side-by-side flex: gutter (line numbers) + textarea (editor) */
.ps-editor-area {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: #0a0e1a;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
}

/* Line number gutter — non-interactive, matches editor line height */
.ps-line-numbers {
    min-width: 44px;
    padding: 12px 8px 12px 0;
    background: #0a0e1a;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.2);
    text-align: right;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.6;
    user-select: none;
    overflow: hidden; /* Scroll is synced via JS */
    flex-shrink: 0;
}

.ps-line-num {
    padding-right: 8px;
    height: calc(13px * 1.6); /* Must match editor line-height exactly */
}

/* The main code textarea */
.ps-editor {
    flex: 1;
    padding: 12px;
    background: transparent;
    color: #e6edf3;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.6;
    tab-size: 4;
    white-space: pre;
    overflow-wrap: normal;
    overflow-x: auto;
    overflow-y: auto;
    caret-color: #10b981;
}

/* Subtle green cursor line highlight handled via selection color */
.ps-editor::selection {
    background: rgba(16, 185, 129, 0.2);
}

/* ── Output Panel ───────────────────────────────────────────────────────── */

/* Fixed height output section below the editor */
.ps-output-panel {
    height: 200px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    background: #0d1117;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
}

/* Tab button row at the top of the output panel */
.ps-tab-row {
    display: flex;
    align-items: center;
    gap: 0;
    background: #0a0e1a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
}

.ps-tab {
    padding: 6px 14px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
}
.ps-tab:hover {
    color: rgba(255, 255, 255, 0.75);
}
.ps-tab--active {
    color: #10b981;
    border-bottom-color: #10b981;
}

/* Each tab pane: flex column so content + clear button stack vertically */
.ps-tab-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 8px 10px;
    gap: 6px;
}

/* The main output display area — reads textContent (never innerHTML from user data) */
.ps-output-display {
    flex: 1;
    overflow-y: auto;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    color: rgba(255, 255, 255, 0.75);
}

/* Output state colorization */
.ps-output-success { color: rgba(255, 255, 255, 0.85); }
.ps-output-error   { color: #ef4444; }
.ps-output-info    { color: rgba(255, 255, 255, 0.4); }

/* Input simulation row — shown only when code calls input() */
.ps-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.ps-input-prompt {
    font-size: 11px;
    color: #10b981;
    font-family: monospace;
    flex-shrink: 0;
}

.ps-input-field {
    flex: 1;
    background: rgba(16, 185, 129, 0.06);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 4px;
    color: #e6edf3;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    padding: 4px 8px;
    outline: none;
}
.ps-input-field:focus {
    border-color: #10b981;
}

/* Small, unobtrusive clear button */
.ps-clear-btn {
    align-self: flex-end;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    color: rgba(255, 255, 255, 0.35);
    font-size: 11px;
    padding: 2px 8px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
}
.ps-clear-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.65);
}

/* ── REPL Pane ──────────────────────────────────────────────────────────── */

.ps-repl-history {
    flex: 1;
    overflow-y: auto;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.6;
}

.ps-repl-line { padding: 1px 0; white-space: pre-wrap; word-break: break-word; }
.ps-repl-line--prompt { color: #10b981; }
.ps-repl-line--output { color: rgba(255, 255, 255, 0.8); }
.ps-repl-line--error  { color: #ef4444; }

.ps-repl-input-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.ps-repl-prompt {
    color: #10b981;
    font-family: monospace;
    font-size: 12px;
    flex-shrink: 0;
}

.ps-repl-field {
    flex: 1;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    color: #e6edf3;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    padding: 2px 4px;
    outline: none;
}
.ps-repl-field:focus {
    border-bottom-color: #10b981;
}

/* ── Tests Pane ─────────────────────────────────────────────────────────── */

.ps-test-results {
    flex: 1;
    overflow-y: auto;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ps-test-row {
    padding: 5px 10px;
    border-radius: 4px;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
}

/* Green row for passed test */
.ps-test-pass {
    background: rgba(16, 185, 129, 0.1);
    border-left: 3px solid #10b981;
    color: #10b981;
}

/* Red row for failed test */
.ps-test-fail {
    background: rgba(239, 68, 68, 0.1);
    border-left: 3px solid #ef4444;
    color: #ef4444;
}

/* ── History Pane ───────────────────────────────────────────────────────── */

.ps-history-log {
    flex: 1;
    overflow-y: auto;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.ps-history-entry {
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Header row of a history entry — click to expand */
.ps-history-header {
    padding: 5px 10px;
    font-family: 'SF Mono', monospace;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition: background 0.12s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.ps-history-header:hover {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.8);
}

/* Expanded body: full output in monospace */
.ps-history-body {
    padding: 8px 10px;
    font-family: 'SF Mono', monospace;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.65);
    white-space: pre-wrap;
    word-break: break-word;
    background: #0a0e1a;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* ── Variable Inspector (Right Panel) ───────────────────────────────────── */

.ps-inspector {
    width: 220px;
    min-width: 220px;
    background: #0d1117;
    border-left: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.ps-inspector-header {
    padding: 10px 12px 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(255, 255, 255, 0.35);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
}

.ps-inspector-hint {
    padding: 8px 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
}

/* Scrollable list of variable rows */
.ps-inspector-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
}

/* One row per variable */
.ps-var-row {
    display: grid;
    grid-template-columns: 90px 50px 1fr;
    align-items: center;
    padding: 5px 12px;
    gap: 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 11px;
    font-family: 'SF Mono', monospace;
}
.ps-var-row:hover {
    background: rgba(255, 255, 255, 0.03);
}

.ps-var-name {
    color: #e6edf3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Type chip — color coded by Python type */
.ps-var-type {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    text-align: center;
    font-weight: 600;
}

/* Type colors */
.ps-type-str   { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.ps-type-int   { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
.ps-type-float { background: rgba(6, 182, 212, 0.15);  color: #06b6d4; }
.ps-type-list  { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.ps-type-dict  { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
.ps-type-bool  { background: rgba(239, 68, 68, 0.15);  color: #ef4444; }
.ps-type-none  { background: rgba(255,255,255,0.08);   color: rgba(255,255,255,0.4); }
.ps-type-other { background: rgba(255,255,255,0.08);   color: rgba(255,255,255,0.5); }

.ps-var-value {
    color: rgba(255, 255, 255, 0.55);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Status Bar ─────────────────────────────────────────────────────────── */

/* Fixed-height bar at the very bottom of the root container */
.ps-status-bar {
    height: 28px;
    min-height: 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 0 16px;
    background: #0a0e1a;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
    font-size: 12px;
    font-family: 'SF Mono', monospace;
    color: rgba(255, 255, 255, 0.4);
}

/* Streak counter — gets green pulse at milestone values */
.ps-status-streak {
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.3s;
}
.ps-streak-milestone {
    color: #f59e0b;
    animation: ps-streak-pulse 1.5s ease-in-out 3;
}

@keyframes ps-streak-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
}

/* ── Streak Toast ──────────────────────────────────────────────────────── */
/* Brief floating notification shown when the student hits a streak milestone.
   Slides up from the bottom status bar area, holds, then fades out.
   Uses absolute positioning within .ps-root (which has position: relative). */
.ps-streak-toast {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(245, 158, 11, 0.95);
    color: #0a0e1a;
    font-weight: 700;
    font-size: 14px;
    padding: 8px 24px;
    border-radius: 6px;
    white-space: nowrap;
    z-index: 100;
    pointer-events: none;
    animation: ps-toast-rise 2.5s ease-out forwards;
}
@keyframes ps-toast-rise {
    0%   { opacity: 0; transform: translateX(-50%) translateY(10px); }
    15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    75%  { opacity: 1; transform: translateX(-50%) translateY(0); }
    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}

/* ── Loading Overlay ────────────────────────────────────────────────────── */

/* Covers center column during Pyodide initialization */
.ps-loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(10, 14, 26, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.ps-loading-box {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

/* CSS-only spinner */
.ps-loading-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(16, 185, 129, 0.2);
    border-top-color: #10b981;
    border-radius: 50%;
    animation: ps-spin 0.8s linear infinite;
}

@keyframes ps-spin {
    to { transform: rotate(360deg); }
}

.ps-loading-text {
    color: #e6edf3;
    font-size: 14px;
    font-weight: 500;
}

.ps-loading-sub {
    color: rgba(255, 255, 255, 0.35);
    font-size: 12px;
}

/* ── Celebration Banner ─────────────────────────────────────────────────── */

/* Slides in from the top when all challenges are passed */
.ps-celebration {
    position: absolute;
    top: 44px; /* Below the top bar */
    left: 0;
    right: 0;
    z-index: 200;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15));
    border-bottom: 1px solid rgba(16, 185, 129, 0.3);
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    animation: ps-slide-down 0.5s ease forwards;
    overflow: hidden;
}

@keyframes ps-slide-down {
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
}

.ps-celebration-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 2;
    position: relative;
}

.ps-celebration-title {
    font-size: 22px;
    font-weight: 700;
    color: #e6edf3;
    animation: ps-pulse 2s ease-in-out infinite;
}

@keyframes ps-pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.7; }
}

.ps-celebration-sub {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
}

/* Confetti container — covers the entire celebration banner */
.ps-confetti {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
}

/* Individual confetti dot — animated via random delay/duration set in JS */
.ps-confetti-dot {
    position: absolute;
    top: -10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: ps-confetti-fall linear forwards;
}

@keyframes ps-confetti-fall {
    0%   { transform: translateY(0) rotate(0deg);    opacity: 1; }
    100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
}

/* ── Responsive: Collapse Sidebar and Inspector at Narrow Widths ─────────── */

/* Below 900px: sidebar collapses to a thin icon rail.
   The challenge titles and meta are hidden; only the status dots remain.
   The variable inspector is also hidden to reclaim horizontal space. */
@media (max-width: 900px) {
    .ps-sidebar {
        width: 44px;
        min-width: 44px;
    }
    .ps-ci-title,
    .ps-ci-meta,
    .ps-ci-status,
    .ps-sidebar-footer,
    .ps-challenge-list {
        /* Hide text content at narrow widths; keep item padding as icon space */
        font-size: 0;
    }
    .ps-challenge-item {
        padding: 10px 0;
        display: flex;
        justify-content: center;
    }
    .ps-challenge-item--passed::after {
        /* Green dot indicator replaces text status at narrow widths */
        content: '';
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
    }
    .ps-inspector {
        display: none; /* Variable inspector hidden below 900px */
    }
    .ps-top-bar-center {
        display: none; /* Shortcut hints hidden at narrow widths */
    }
}

/* Below 600px: status bar compresses, description bar gets more height */
@media (max-width: 600px) {
    .ps-status-bar {
        font-size: 10px;
        gap: 10px;
    }
}
`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PYODIDE LOAD PROMISE (module-level, shared across all instances)
    // ─────────────────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC EXPORTS
    // Only expose what lab pages need. All internal functions remain private.
    // _pyodidePromise is exposed on the returned object so concurrent loads
    // from double-clicks share the same promise.
    // ─────────────────────────────────────────────────────────────────────────
    return {
        init: init
    };

})();
