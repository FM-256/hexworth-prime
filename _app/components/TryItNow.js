/**
 * TryItNow.js — Lightweight inline Python code runner for presentations.
 *
 * PURPOSE: Embeds "Try It Now" code blocks inside slide decks so students
 * can type Python and run it without leaving the presentation. Each block
 * is a mini REPL: textarea editor + Run button + output display.
 *
 * ARCHITECTURE:
 *   - Auto-mounts on all elements with class "try-it-now"
 *   - Pyodide (Python WASM) is loaded lazily on the first Run click
 *   - Once loaded, the Pyodide instance is shared across all blocks on the page
 *   - No XP, no hints, no tests, no persistence — this is for experimentation only
 *   - Optional: "Show Solution" button reveals a model answer
 *   - Optional: expected output check shows green/red feedback after Run
 *
 * USAGE (in a presentation slide):
 *   <div class="try-it-now"
 *        data-starter="x = 5&#10;print(x)"
 *        data-solution="x = 5&#10;print(x * 2)"
 *        data-expected="10"
 *        data-height="120">
 *   </div>
 *
 * DATA ATTRIBUTES:
 *   data-starter   — Pre-filled code in the editor (use &#10; for newlines in HTML)
 *   data-solution  — (Optional) Model answer shown when "Show Solution" is clicked
 *   data-expected  — (Optional) Expected output string; shows pass/fail badge after Run
 *   data-height    — (Optional) Editor height in px (default: 100)
 *
 * DEPENDENCIES:
 *   - Pyodide CDN (loaded on first Run; ~11MB compressed, cached by browser)
 *   - No external CSS — all styles injected by this script
 *
 * CREATED: 2026-04-03 for Python for IT (COP1034C) presentation retrofit
 */
(function() {
    'use strict';

    // ── Shared Pyodide Instance ──────────────────────────────────────────
    // One Pyodide runtime per page. Lazy-loaded on first Run click.
    var _pyodide = null;
    var _pyodideLoading = null;  // Promise while loading, null when idle

    /**
     * Load Pyodide from CDN if not already loaded. Returns a Promise
     * that resolves with the Pyodide instance.
     */
    function _ensurePyodide() {
        if (_pyodide) return Promise.resolve(_pyodide);
        if (_pyodideLoading) return _pyodideLoading;

        _pyodideLoading = new Promise(function(resolve, reject) {
            // Dynamically load the Pyodide bootstrap script
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
            script.onload = function() {
                // Initialize the Pyodide runtime
                loadPyodide().then(function(py) {
                    _pyodide = py;
                    _pyodideLoading = null;
                    resolve(py);
                }).catch(function(err) {
                    _pyodideLoading = null;
                    reject(err);
                });
            };
            script.onerror = function() {
                _pyodideLoading = null;
                reject(new Error('Failed to load Pyodide from CDN'));
            };
            document.head.appendChild(script);
        });

        return _pyodideLoading;
    }

    // ── Style Injection ──────────────────────────────────────────────────
    // Inject all component styles into <head> once. Scoped under .tin- prefix.
    var _stylesInjected = false;

    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;

        var css = [
            '/* ── TryItNow.js — Inline code runner for presentations ── */',

            /* Override slide overflow for slides containing TIN blocks.
               Slides normally use overflow:hidden + justify-content:center,
               which clips the TIN block and gate message. We switch to
               overflow-y:auto and align to top so everything is visible. */
            '.slide:has(.try-it-now) {',
            '    overflow-y: auto !important;',
            '    justify-content: flex-start !important;',
            '    padding-top: 40px !important;',
            '}',

            /* Container: dark card with green accent border */
            '.tin-block {',
            '    background: #0d1117;',
            '    border: 1px solid rgba(16, 185, 129, 0.25);',
            '    border-radius: 8px;',
            '    padding: 14px 16px;',
            '    margin: 10px 0;',
            '    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
            '}',

            /* Label strip at top */
            '.tin-label {',
            '    font-size: 0.72rem;',
            '    font-weight: 700;',
            '    text-transform: uppercase;',
            '    letter-spacing: 0.08em;',
            '    color: #10b981;',
            '    margin-bottom: 8px;',
            '}',

            /* Code editor textarea */
            '.tin-editor {',
            '    width: 100%;',
            '    background: #161b22;',
            '    color: #e6edf3;',
            '    border: 1px solid rgba(255, 255, 255, 0.08);',
            '    border-radius: 5px;',
            '    padding: 10px 12px;',
            '    font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;',
            '    font-size: 0.84rem;',
            '    line-height: 1.6;',
            '    resize: vertical;',
            '    tab-size: 4;',
            '    outline: none;',
            '    transition: border-color 0.2s;',
            '}',
            '.tin-editor:focus {',
            '    border-color: rgba(16, 185, 129, 0.5);',
            '}',

            /* Button row */
            '.tin-btn-row {',
            '    display: flex;',
            '    gap: 8px;',
            '    margin-top: 8px;',
            '    align-items: center;',
            '}',

            /* Run button */
            '.tin-run-btn {',
            '    background: rgba(16, 185, 129, 0.15);',
            '    color: #10b981;',
            '    border: 1px solid rgba(16, 185, 129, 0.35);',
            '    padding: 6px 18px;',
            '    border-radius: 5px;',
            '    font-size: 0.82rem;',
            '    font-weight: 600;',
            '    cursor: pointer;',
            '    transition: background 0.2s;',
            '}',
            '.tin-run-btn:hover {',
            '    background: rgba(16, 185, 129, 0.28);',
            '}',
            '.tin-run-btn:disabled {',
            '    opacity: 0.4;',
            '    cursor: not-allowed;',
            '}',

            /* Solution button */
            '.tin-solution-btn {',
            '    background: rgba(201, 168, 58, 0.10);',
            '    color: #c9a83a;',
            '    border: 1px solid rgba(201, 168, 58, 0.25);',
            '    padding: 6px 14px;',
            '    border-radius: 5px;',
            '    font-size: 0.78rem;',
            '    cursor: pointer;',
            '    transition: background 0.2s;',
            '}',
            '.tin-solution-btn:hover {',
            '    background: rgba(201, 168, 58, 0.20);',
            '}',

            /* Output area */
            '.tin-output {',
            '    background: #161b22;',
            '    border: 1px solid rgba(255, 255, 255, 0.06);',
            '    border-radius: 5px;',
            '    padding: 8px 12px;',
            '    margin-top: 8px;',
            '    font-family: "SF Mono", monospace;',
            '    font-size: 0.82rem;',
            '    line-height: 1.55;',
            '    color: #94a3b8;',
            '    white-space: pre-wrap;',
            '    min-height: 28px;',
            '    display: none;',
            '}',
            '.tin-output.visible { display: block; }',
            '.tin-output.success { color: #10b981; }',
            '.tin-output.error   { color: #ef4444; }',

            /* Pass/fail badge for expected output check */
            '.tin-badge {',
            '    display: inline-block;',
            '    font-size: 0.72rem;',
            '    font-weight: 700;',
            '    padding: 2px 10px;',
            '    border-radius: 4px;',
            '    margin-left: 8px;',
            '}',
            '.tin-badge-pass {',
            '    background: rgba(16, 185, 129, 0.15);',
            '    color: #10b981;',
            '}',
            '.tin-badge-fail {',
            '    background: rgba(239, 68, 68, 0.12);',
            '    color: #ef4444;',
            '}',

            /* Loading state */
            '.tin-loading {',
            '    color: #64748b;',
            '    font-size: 0.8rem;',
            '    font-style: italic;',
            '}',

            /* Gate indicator — pulsing prompt when slide is locked */
            '.tin-gate-msg {',
            '    text-align: center;',
            '    font-size: 0.82rem;',
            '    font-weight: 600;',
            '    color: #f59e0b;',
            '    margin-top: 10px;',
            '    padding: 6px 0;',
            '    animation: tin-pulse 2s ease-in-out infinite;',
            '}',
            '.tin-gate-msg.completed {',
            '    color: #10b981;',
            '    animation: none;',
            '}',
            '@keyframes tin-pulse {',
            '    0%, 100% { opacity: 1; }',
            '    50%      { opacity: 0.4; }',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ── Mount a Single Block ─────────────────────────────────────────────

    /**
     * Transform a .try-it-now placeholder into a live code editor block.
     * Reads data attributes, builds DOM, attaches event listeners.
     *
     * @param {HTMLElement} el - The .try-it-now container element
     */
    function _mountBlock(el) {
        var starter  = (el.getAttribute('data-starter')  || '').replace(/\\n/g, '\n');
        var solution = (el.getAttribute('data-solution') || '').replace(/\\n/g, '\n');
        var expected = el.getAttribute('data-expected') || '';
        var height   = parseInt(el.getAttribute('data-height') || '100', 10);

        // Build the block DOM
        var block = document.createElement('div');
        block.className = 'tin-block';

        // Label
        var label = document.createElement('div');
        label.className = 'tin-label';
        label.textContent = 'Try It Now';
        block.appendChild(label);

        // Editor textarea
        var editor = document.createElement('textarea');
        editor.className = 'tin-editor';
        editor.value = starter;
        editor.style.height = height + 'px';
        editor.spellcheck = false;
        editor.setAttribute('autocorrect', 'off');
        editor.setAttribute('autocapitalize', 'off');

        // Tab key inserts 4 spaces instead of switching focus
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var start = editor.selectionStart;
                var end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 4;
            }
            // Ctrl+Enter runs the code
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                runBtn.click();
            }
            // Ctrl+S — prevent browser Save dialog (nothing to save here)
            if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
            }
        });
        block.appendChild(editor);

        // Button row
        var btnRow = document.createElement('div');
        btnRow.className = 'tin-btn-row';

        // Run button
        var runBtn = document.createElement('button');
        runBtn.className = 'tin-run-btn';
        runBtn.textContent = 'Run';
        btnRow.appendChild(runBtn);

        // Solution button (only if data-solution is provided)
        if (solution) {
            var solBtn = document.createElement('button');
            solBtn.className = 'tin-solution-btn';
            solBtn.textContent = 'Show Solution';
            var solutionShown = false;
            solBtn.addEventListener('click', function() {
                if (!solutionShown) {
                    editor.value = solution;
                    solBtn.textContent = 'Solution Loaded';
                    solutionShown = true;
                }
            });
            btnRow.appendChild(solBtn);
        }

        block.appendChild(btnRow);

        // Output area (hidden until first run)
        var output = document.createElement('div');
        output.className = 'tin-output';
        block.appendChild(output);

        // ── Run Button Click Handler ─────────────────────────────────
        runBtn.addEventListener('click', function() {
            var code = editor.value;
            if (!code.trim()) return;

            // Show loading state
            runBtn.disabled = true;
            runBtn.textContent = 'Loading Python...';
            output.className = 'tin-output visible';
            output.textContent = 'Loading Python runtime...';

            _ensurePyodide().then(function(pyodide) {
                runBtn.textContent = 'Running...';

                // Capture stdout into an array
                var lines = [];
                pyodide.setStdout({ batched: function(line) { lines.push(line); } });
                pyodide.setStderr({ batched: function(line) { lines.push('[ERROR] ' + line); } });

                // Override input() with a simple prompt-based fallback
                pyodide.globals.set('input', pyodide.toPy(function(prompt) {
                    var val = window.prompt(prompt || 'Enter input:');
                    if (val === null) val = '';
                    if (prompt) lines.push(String(prompt) + val);
                    return val;
                }));

                return pyodide.runPythonAsync(code).then(function() {
                    // Success: show output
                    var text = lines.join('\n');
                    output.textContent = text || '(no output)';
                    output.className = 'tin-output visible success';

                    // Check expected output if specified
                    if (expected) {
                        _showExpectedBadge(btnRow, text.trim(), expected.trim());
                        // Mark complete only on PASS
                        if (text.trim() === expected.trim()) {
                            _markComplete(el);
                        }
                    } else {
                        // No expected output — any successful run completes the block
                        _markComplete(el);
                    }
                }).catch(function(err) {
                    // Python error: show friendly + raw
                    var msg = err.message || String(err);
                    var text = lines.join('\n');
                    if (text) text += '\n';
                    text += _friendlyError(msg);
                    output.textContent = text;
                    output.className = 'tin-output visible error';

                    // Remove any previous pass/fail badge
                    var oldBadge = btnRow.querySelector('.tin-badge');
                    if (oldBadge) oldBadge.remove();
                });
            }).catch(function(err) {
                output.textContent = 'Failed to load Python: ' + err.message;
                output.className = 'tin-output visible error';
            }).finally(function() {
                runBtn.disabled = false;
                runBtn.textContent = 'Run';
            });
        });

        // Gate message — pulsing prompt shown when the slide is locked
        var gateMsg = document.createElement('div');
        gateMsg.className = 'tin-gate-msg';
        gateMsg.textContent = 'Complete the exercise above to continue';
        block.appendChild(gateMsg);

        // Replace the placeholder element with the built block
        el.innerHTML = '';
        el.appendChild(block);

        // Store completion state and gate message ref on the element
        el._tinCompleted = false;
        el._gateMsg = gateMsg;
    }

    // ── Expected Output Badge ────────────────────────────────────────────

    /**
     * Show a pass/fail badge next to the buttons when data-expected is set.
     *
     * @param {HTMLElement} btnRow - The button row to append the badge to
     * @param {string} actual - The trimmed program output
     * @param {string} expected - The trimmed expected output
     */
    function _showExpectedBadge(btnRow, actual, expected) {
        // Remove previous badge if present
        var old = btnRow.querySelector('.tin-badge');
        if (old) old.remove();

        var badge = document.createElement('span');
        badge.className = 'tin-badge';

        if (actual === expected) {
            badge.classList.add('tin-badge-pass');
            badge.textContent = 'PASS';
        } else {
            badge.classList.add('tin-badge-fail');
            badge.textContent = 'Expected: ' + expected;
        }
        btnRow.appendChild(badge);
    }

    // ── Simplified Error Translator ──────────────────────────────────────
    // Lighter version of PythonSandbox._translateError — just the top 5.

    /**
     * Convert a raw Python error into a brief friendly message.
     * Keeps it simple — this is a "Try It Now" block, not a full grader.
     *
     * @param {string} raw - Raw Python exception string
     * @returns {string} - Friendly error + raw error
     */
    function _friendlyError(raw) {
        if (raw.indexOf('NameError') !== -1) {
            var m = raw.match(/name '(\w+)' is not defined/);
            return 'Variable Error: "' + (m ? m[1] : '?') + '" is not defined.\n\n' + raw;
        }
        if (raw.indexOf('SyntaxError') !== -1) {
            return 'Syntax Error: Check for missing colons, quotes, or parentheses.\n\n' + raw;
        }
        if (raw.indexOf('TypeError') !== -1) {
            return 'Type Error: Wrong type — maybe mixing str and int?\n\n' + raw;
        }
        if (raw.indexOf('IndentationError') !== -1) {
            return 'Indentation Error: Use 4 spaces per indent level.\n\n' + raw;
        }
        if (raw.indexOf('ValueError') !== -1) {
            return 'Value Error: Cannot convert that value.\n\n' + raw;
        }
        return 'Error:\n' + raw;
    }

    // ── Completion Tracking & Slide Navigation Gating ──────────────────
    // When a TIN block is on a presentation slide, the Next button is
    // disabled until the student completes the exercise. This ensures
    // students engage with each "Try It Now" before moving on.

    /**
     * Mark a TIN block as completed. Updates its visual state and
     * re-enables the Next button if it was gated.
     *
     * @param {HTMLElement} el - The .try-it-now container element
     */
    function _markComplete(el) {
        if (el._tinCompleted) return; // Already completed
        el._tinCompleted = true;

        // Add a visual indicator to the block
        var block = el.querySelector('.tin-block');
        if (block) {
            block.style.borderColor = 'rgba(16, 185, 129, 0.6)';
        }

        // Update the gate message to show completion
        if (el._gateMsg) {
            el._gateMsg.textContent = 'Complete — you may continue';
            el._gateMsg.classList.add('completed');
        }

        // Re-enable the Next button if it was disabled by this block
        _updateNextButton();
    }

    /**
     * Check the active slide for an uncompleted TIN block and
     * enable/disable the Next button accordingly.
     * Called on slide transitions and on TIN block completion.
     */
    function _updateNextButton() {
        var nextBtn = document.getElementById('next-btn');
        if (!nextBtn) return; // Not a presentation page

        // Find the currently active slide
        var activeSlide = document.querySelector('.slide.active');
        if (!activeSlide) return;

        // Check if this slide has a TIN block
        var tinBlock = activeSlide.querySelector('.try-it-now');
        if (!tinBlock) {
            // No TIN block on this slide — Next is always enabled
            nextBtn.disabled = false;
            return;
        }

        // TIN block exists — gate on completion
        if (tinBlock._tinCompleted) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    }

    /**
     * Hook into the presentation's slide navigation system.
     *
     * We cannot wrap goToSlide() because it is a function declaration
     * inside a <script> block — closures (keyboard handler, onclick)
     * reference the original binding, not window.goToSlide. Instead,
     * we use a MutationObserver to detect when the .active class moves
     * between slides, then check for TIN blocks on the new active slide.
     */
    function _hookSlideNavigation() {
        // Only hook if this looks like a presentation page (has slide sections)
        var nextBtn = document.getElementById('next-btn');
        if (!nextBtn) return;

        // Observe class changes on all slide sections.
        // When a slide gains the "active" class, check for TIN gating.
        var slides = document.querySelectorAll('.slide');
        if (slides.length === 0) return;

        var observer = new MutationObserver(function(mutations) {
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.attributeName === 'class' && m.target.classList.contains('active')) {
                    // A slide just became active — check for TIN block
                    setTimeout(_updateNextButton, 10);
                    return;
                }
            }
        });

        // Watch class attribute changes on every slide section
        for (var i = 0; i < slides.length; i++) {
            observer.observe(slides[i], { attributes: true, attributeFilter: ['class'] });
        }

        // Block ArrowRight keyboard navigation when TIN block is incomplete
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight') {
                var activeSlide = document.querySelector('.slide.active');
                if (activeSlide) {
                    var tinBlock = activeSlide.querySelector('.try-it-now');
                    if (tinBlock && !tinBlock._tinCompleted) {
                        e.stopImmediatePropagation(); // Prevent the presentation's handler
                        e.preventDefault();
                    }
                }
            }
        }, true); // useCapture: true — fires BEFORE the presentation's handler

        // Also run on initial page load to gate the first slide if it has a TIN block
        setTimeout(_updateNextButton, 200);
    }

    // ── Auto-Initialize ──────────────────────────────────────────────────
    // Find all .try-it-now elements and mount them when the DOM is ready.

    function _init() {
        var blocks = document.querySelectorAll('.try-it-now');
        if (blocks.length === 0) return;

        _injectStyles();

        for (var i = 0; i < blocks.length; i++) {
            _mountBlock(blocks[i]);
        }

        // Hook into slide navigation for presentation gating
        _hookSlideNavigation();
    }

    // Run on DOMContentLoaded or immediately if already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

})();
