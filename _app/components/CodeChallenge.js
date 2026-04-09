/**
 * CodeChallenge.js — Automated Python code validation for labs and projects.
 *
 * Extends CodeRunner with test case validation. Students write code,
 * click "Run" to test locally, then click "Submit" to run automated tests.
 * Pass/fail is determined by comparing stdout against expected output patterns.
 *
 * Usage:
 *   <div class="code-challenge" data-lang="python" data-challenge-id="w1-ex1">
 *       <pre>print("hello")</pre>
 *   </div>
 *   <script>
 *       CodeChallenge.register('w1-ex1', {
 *           title: 'Print a greeting',
 *           description: 'Write a program that prints "Hello, World!"',
 *           tests: [
 *               { name: 'Output check', expected: 'Hello, World!' }
 *           ]
 *       });
 *       CodeChallenge.initAll();
 *   </script>
 *
 * Test types:
 *   - { expected: 'exact string' }          — stdout must contain this string
 *   - { expected: /regex/ }                 — stdout must match this pattern
 *   - { fn: (stdout) => true/false, name }  — custom validator function
 *
 * Depends on: CodeRunner.js (must be loaded first)
 *
 * Created: 2026-04-03
 */
const CodeChallenge = (function() {
    'use strict';

    /* ── Challenge registry: challengeId → config ── */
    const _challenges = {};

    /* ── Track passed challenges for ModuleProgress ── */
    const _passed = {};

    /**
     * Register a challenge with its test configuration.
     * Call this before initAll().
     *
     * @param {string} id      — unique challenge ID (matches data-challenge-id)
     * @param {Object} config  — { title, description, tests[], starterCode? }
     */
    function register(id, config) {
        _challenges[id] = config;
    }

    /**
     * Initialize all code-challenge elements on the page.
     * Finds all elements with class "code-challenge", creates CodeRunner
     * instances, and adds the Submit button + test results UI.
     */
    function initAll() {
        var elements = document.querySelectorAll('.code-challenge');
        elements.forEach(function(el) {
            var id = el.dataset.challengeId;
            if (!id || !_challenges[id]) return;

            var config = _challenges[id];

            /* Create CodeRunner instance for this challenge */
            var runner = new CodeRunner(el, {
                lang: el.dataset.lang || 'python',
                editable: true
            });
            runner.init();

            /* Store runner reference on the element for later access */
            el._runner = runner;
            el._challengeId = id;

            /* Add challenge header with title and description */
            var header = document.createElement('div');
            header.className = 'cc-header';
            header.innerHTML =
                '<div class="cc-title">' + _escapeHtml(config.title || 'Code Challenge') + '</div>' +
                (config.description
                    ? '<div class="cc-desc">' + _escapeHtml(config.description) + '</div>'
                    : '');
            el.insertBefore(header, el.firstChild);

            /* Add Submit button after the CodeRunner wrapper */
            var submitRow = document.createElement('div');
            submitRow.className = 'cc-submit-row';
            submitRow.innerHTML =
                '<button class="cc-submit-btn">Submit Solution</button>' +
                '<span class="cc-status"></span>';
            el.appendChild(submitRow);

            /* Add test results panel (hidden until submit) */
            var results = document.createElement('div');
            results.className = 'cc-results cc-hidden';
            el.appendChild(results);

            /* Wire submit button */
            var submitBtn = submitRow.querySelector('.cc-submit-btn');
            var statusEl = submitRow.querySelector('.cc-status');
            submitBtn.addEventListener('click', function() {
                _runTests(el, runner, config, results, statusEl, submitBtn);
            });
        });

        /* Inject styles once */
        _injectStyles();
    }

    /**
     * Run all tests for a challenge.
     * Executes the student's code via Pyodide, captures stdout,
     * then checks each test case against the output.
     */
    async function _runTests(el, runner, config, resultsEl, statusEl, submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Running tests...';
        statusEl.textContent = '';
        statusEl.className = 'cc-status';
        resultsEl.className = 'cc-results';
        resultsEl.innerHTML = '';

        var code = runner.getCode().trim();
        if (!code) {
            statusEl.textContent = 'Write some code first.';
            statusEl.className = 'cc-status cc-status-fail';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Solution';
            return;
        }

        /* Run the student's code and capture stdout */
        var stdout = '';
        var runError = null;

        try {
            if (!CodeRunner._pyodideReady) {
                statusEl.textContent = 'Loading Python runtime...';
                CodeRunner._pyodideReady = runner._loadPyodide();
            }
            var pyodide = await CodeRunner._pyodideReady;
            statusEl.textContent = 'Executing code...';

            /* Capture stdout */
            var captured = '';
            pyodide.setStdout({ batched: function(msg) { captured += msg + '\n'; } });
            pyodide.setStderr({ batched: function(msg) {} }); /* Ignore stderr for tests */

            await pyodide.runPythonAsync(code);
            stdout = captured.trim();
        } catch (err) {
            runError = String(err);
        }

        /* Evaluate each test case */
        var tests = config.tests || [];
        var passed = 0;
        var failed = 0;
        var html = '<div class="cc-results-header">Test Results</div>';

        if (runError) {
            /* Code crashed — all tests fail */
            html += '<div class="cc-test cc-test-fail">' +
                '<span class="cc-test-icon">X</span>' +
                '<span class="cc-test-name">Code Execution</span>' +
                '<span class="cc-test-detail">Error: ' + _escapeHtml(runError.substring(0, 200)) + '</span>' +
                '</div>';
            failed = tests.length;
        } else {
            tests.forEach(function(test, i) {
                var testPassed = false;
                var detail = '';

                if (typeof test.fn === 'function') {
                    /* Custom validator */
                    try {
                        testPassed = test.fn(stdout, code);
                        detail = testPassed ? 'Passed' : 'Check failed';
                    } catch (e) {
                        detail = 'Validator error: ' + e.message;
                    }
                } else if (test.expected instanceof RegExp) {
                    /* Regex match */
                    testPassed = test.expected.test(stdout);
                    detail = testPassed
                        ? 'Pattern matched'
                        : 'Expected pattern: ' + test.expected.toString();
                } else if (typeof test.expected === 'string') {
                    /* String contains check (case-insensitive by default) */
                    var normalize = function(s) { return s.replace(/\s+/g, ' ').trim().toLowerCase(); };
                    testPassed = normalize(stdout).indexOf(normalize(test.expected)) !== -1;
                    detail = testPassed
                        ? 'Output contains expected text'
                        : 'Expected: "' + _escapeHtml(test.expected) + '"';
                }

                if (testPassed) passed++;
                else failed++;

                var cls = testPassed ? 'cc-test-pass' : 'cc-test-fail';
                var icon = testPassed ? '&#10003;' : 'X';
                html += '<div class="cc-test ' + cls + '">' +
                    '<span class="cc-test-icon">' + icon + '</span>' +
                    '<span class="cc-test-name">' + _escapeHtml(test.name || 'Test ' + (i + 1)) + '</span>' +
                    '<span class="cc-test-detail">' + detail + '</span>' +
                    '</div>';
            });
        }

        /* Summary */
        var allPassed = failed === 0 && passed > 0;
        html += '<div class="cc-summary ' + (allPassed ? 'cc-summary-pass' : 'cc-summary-fail') + '">' +
            (allPassed
                ? 'All ' + passed + ' tests passed!'
                : passed + ' of ' + (passed + failed) + ' tests passed') +
            '</div>';

        resultsEl.innerHTML = html;
        resultsEl.classList.remove('cc-hidden');

        /* Update status */
        if (allPassed) {
            statusEl.textContent = 'PASSED';
            statusEl.className = 'cc-status cc-status-pass';
            submitBtn.textContent = 'Passed!';
            submitBtn.className = 'cc-submit-btn cc-submit-passed';

            /* Track this challenge as passed */
            _passed[el._challengeId] = true;

            /* Fire completion event for the page to listen to */
            el.dispatchEvent(new CustomEvent('challenge-passed', {
                detail: { challengeId: el._challengeId, passed: passed, total: passed + failed }
            }));
        } else {
            statusEl.textContent = 'FAILED — fix your code and try again';
            statusEl.className = 'cc-status cc-status-fail';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Solution';
        }
    }

    /**
     * Check if a specific challenge has been passed.
     * @param {string} id — challenge ID
     * @returns {boolean}
     */
    function isPassed(id) {
        return _passed[id] === true;
    }

    /**
     * Check if ALL registered challenges have been passed.
     * @returns {boolean}
     */
    function allPassed() {
        var ids = Object.keys(_challenges);
        if (ids.length === 0) return false;
        return ids.every(function(id) { return _passed[id] === true; });
    }

    /**
     * Get pass count and total count.
     * @returns {{ passed: number, total: number }}
     */
    function getProgress() {
        var ids = Object.keys(_challenges);
        var p = ids.filter(function(id) { return _passed[id] === true; }).length;
        return { passed: p, total: ids.length };
    }

    /* ── Utility: escape HTML ── */
    function _escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /* ── Inject CSS styles once ── */
    var _stylesInjected = false;
    function _injectStyles() {
        if (_stylesInjected) return;
        _stylesInjected = true;

        var style = document.createElement('style');
        style.textContent = [
            /* Challenge header */
            '.cc-header { margin-bottom: 12px; }',
            '.cc-title { font-size: 1.05rem; font-weight: 700; color: #10b981; margin-bottom: 4px; }',
            '.cc-desc { font-size: 0.85rem; color: #94a3b8; line-height: 1.5; }',

            /* Submit row */
            '.cc-submit-row { display: flex; align-items: center; gap: 14px; margin-top: 10px; }',
            '.cc-submit-btn {',
            '  background: #10b981; color: #000; border: none; padding: 10px 28px;',
            '  border-radius: 6px; font-size: 0.9rem; font-weight: 700; cursor: pointer;',
            '  transition: background 0.2s, transform 0.15s;',
            '}',
            '.cc-submit-btn:hover:not(:disabled) { background: #34d399; transform: translateY(-1px); }',
            '.cc-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }',
            '.cc-submit-passed { background: #22c55e !important; }',

            /* Status text */
            '.cc-status { font-size: 0.82rem; font-weight: 600; }',
            '.cc-status-pass { color: #22c55e; }',
            '.cc-status-fail { color: #ef4444; }',

            /* Results panel */
            '.cc-results { margin-top: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; }',
            '.cc-hidden { display: none; }',
            '.cc-results-header { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 10px; }',

            /* Individual test rows */
            '.cc-test { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.85rem; }',
            '.cc-test:last-of-type { border-bottom: none; }',
            '.cc-test-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }',
            '.cc-test-pass .cc-test-icon { background: rgba(34,197,94,0.15); color: #22c55e; }',
            '.cc-test-fail .cc-test-icon { background: rgba(239,68,68,0.15); color: #ef4444; }',
            '.cc-test-name { font-weight: 600; color: #e2e8f0; min-width: 120px; }',
            '.cc-test-detail { color: #64748b; font-size: 0.78rem; }',

            /* Summary */
            '.cc-summary { margin-top: 10px; padding: 8px 12px; border-radius: 6px; font-size: 0.88rem; font-weight: 700; text-align: center; }',
            '.cc-summary-pass { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: #22c55e; }',
            '.cc-summary-fail { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }'
        ].join('\n');
        document.head.appendChild(style);
    }

    /* ── Public API ── */
    return {
        register: register,
        initAll: initAll,
        isPassed: isPassed,
        allPassed: allPassed,
        getProgress: getProgress
    };

})();
