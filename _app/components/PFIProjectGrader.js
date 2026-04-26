/**
 * PFIProjectGrader.js — Auto-grading submission UI for Python for IT projects.
 *
 * Renders a code editor (CodeMirror), file upload button, submit button,
 * and results panel. On submit, calls the gradePFIProject Cloud Function
 * and displays structured grading results.
 *
 * Usage:
 *   <div id="pfi-grader-root"></div>
 *   <script src="components/PFIProjectGrader.js"></script>
 *   <script>
 *       PFIProjectGrader.init({
 *           containerId: 'pfi-grader-root',
 *           projectId: 'pfi-w1',
 *           title: 'IT System Report Generator',
 *           maxScore: 100,
 *           passingScore: 70,
 *           rubricCategories: [...]
 *       });
 *   </script>
 *
 * @version 1.0.0
 * @feature PFI-AUTOGRADE
 */

(function() {
    'use strict';

    var _config = null;
    var _editor = null;      // CodeMirror instance (or null if CM fails to load)
    var _textarea = null;    // Raw textarea fallback
    var _submitting = false;
    var _previousResult = null;

    // ── Styles ──────────────────────────────────────────────────────
    var CSS = `
        .pfig-root { margin: 2rem 0; }
        .pfig-card {
            background: rgba(15, 15, 20, 0.6);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
        }
        .pfig-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: #e0e0e0;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .pfig-subtitle {
            font-size: 0.85rem;
            color: #6b7280;
            margin-bottom: 20px;
        }
        .pfig-editor-wrap {
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 16px;
        }
        .pfig-textarea {
            width: 100%;
            min-height: 400px;
            background: #0d1117;
            color: #c9d1d9;
            border: none;
            padding: 16px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.85rem;
            line-height: 1.6;
            resize: vertical;
            tab-size: 4;
        }
        .pfig-textarea:focus { outline: none; }
        .pfig-actions {
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
        }
        .pfig-btn {
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .pfig-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pfig-btn-submit {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }
        .pfig-btn-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .pfig-btn-upload {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            color: #94a3b8;
        }
        .pfig-btn-upload:hover { background: rgba(255,255,255,0.1); }
        .pfig-status {
            font-size: 0.82rem;
            color: #6b7280;
        }
        .pfig-spinner {
            display: inline-block;
            width: 16px; height: 16px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: pfig-spin 0.6s linear infinite;
        }
        @keyframes pfig-spin { to { transform: rotate(360deg); } }

        /* Results */
        .pfig-results { margin-top: 20px; }
        .pfig-score-banner {
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 20px;
        }
        .pfig-score-banner.pass { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); }
        .pfig-score-banner.fail { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
        .pfig-score-big {
            font-size: 2.5rem;
            font-weight: 800;
        }
        .pfig-score-banner.pass .pfig-score-big { color: #22c55e; }
        .pfig-score-banner.fail .pfig-score-big { color: #ef4444; }
        .pfig-score-label { font-size: 0.82rem; color: #6b7280; margin-top: 4px; }
        .pfig-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            margin-top: 8px;
        }
        .pfig-badge.pass { background: rgba(34,197,94,0.15); color: #22c55e; }
        .pfig-badge.fail { background: rgba(239,68,68,0.15); color: #ef4444; }

        /* Category table */
        .pfig-cat-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .pfig-cat-table th { text-align: left; padding: 8px 12px; font-size: 0.75rem; color: #6b7280; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .pfig-cat-table td { padding: 8px 12px; font-size: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .pfig-cat-bar { height: 6px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; min-width: 100px; }
        .pfig-cat-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

        /* Test list */
        .pfig-test { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 0.82rem; }
        .pfig-test-icon { width: 18px; text-align: center; font-weight: 700; }
        .pfig-test-icon.pass { color: #22c55e; }
        .pfig-test-icon.fail { color: #ef4444; }

        /* Output */
        .pfig-output-wrap {
            background: #0d1117;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            padding: 16px;
            font-family: monospace;
            font-size: 0.8rem;
            color: #c9d1d9;
            max-height: 300px;
            overflow-y: auto;
            white-space: pre-wrap;
            margin-top: 12px;
        }

        /* CodeMirror overrides */
        .pfig-editor-wrap .CodeMirror {
            height: 400px;
            font-size: 0.85rem;
            background: #0d1117;
        }
    `;

    // ── Public API ──────────────────────────────────────────────────
    function init(config) {
        _config = config;
        var container = document.getElementById(config.containerId);
        if (!container) {
            console.error('[PFIProjectGrader] Container not found:', config.containerId);
            return;
        }

        // Inject styles
        var style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        // Build UI
        container.innerHTML = _buildHTML();

        // Wire up events
        _textarea = document.getElementById('pfig-code');
        document.getElementById('pfig-btn-submit').addEventListener('click', _handleSubmit);
        document.getElementById('pfig-btn-upload').addEventListener('click', _handleUpload);

        // Load CodeMirror for syntax highlighting
        _loadCodeMirror();

        // Check for previous submission
        _loadPreviousSubmission();
    }

    function _buildHTML() {
        var catHeaders = (_config.rubricCategories || []).map(function(c) {
            return '<th>' + _esc(c.label) + '</th>';
        }).join('');

        return '' +
            '<div class="pfig-root">' +
                '<div class="pfig-card">' +
                    '<div class="pfig-title">' +
                        '<img src="/assets/images/icons/icon-flask.webp" alt="" style="width:1.2em;height:1.2em;"> ' +
                        'Auto-Grade: ' + _esc(_config.title || 'Project') +
                    '</div>' +
                    '<div class="pfig-subtitle">Paste your Python code below or upload a .py file, then click Submit to auto-grade against the rubric.</div>' +

                    '<div class="pfig-editor-wrap">' +
                        '<textarea id="pfig-code" class="pfig-textarea" placeholder="# Paste your Python code here..." spellcheck="false"></textarea>' +
                    '</div>' +

                    '<div class="pfig-actions">' +
                        '<button class="pfig-btn pfig-btn-submit" id="pfig-btn-submit">Submit for Grading</button>' +
                        '<button class="pfig-btn pfig-btn-upload" id="pfig-btn-upload">Upload .py File</button>' +
                        '<input type="file" id="pfig-file-input" accept=".py,.txt" style="display:none">' +
                        '<span class="pfig-status" id="pfig-status"></span>' +
                    '</div>' +
                '</div>' +

                '<div id="pfig-results"></div>' +
                '<div id="pfig-previous"></div>' +
            '</div>';
    }

    // ── CodeMirror Loading ──────────────────────────────────────────
    function _loadCodeMirror() {
        // Load CM CSS
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.min.css';
        document.head.appendChild(link);

        // Load CM theme
        var theme = document.createElement('link');
        theme.rel = 'stylesheet';
        theme.href = 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/theme/material-darker.min.css';
        document.head.appendChild(theme);

        // Load CM core + Python mode
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/lib/codemirror.min.js';
        script.onload = function() {
            var mode = document.createElement('script');
            mode.src = 'https://cdn.jsdelivr.net/npm/codemirror@5.65.16/mode/python/python.min.js';
            mode.onload = function() {
                if (typeof CodeMirror !== 'undefined' && _textarea) {
                    _editor = CodeMirror.fromTextArea(_textarea, {
                        mode: 'python',
                        theme: 'material-darker',
                        lineNumbers: true,
                        indentUnit: 4,
                        tabSize: 4,
                        indentWithTabs: false,
                        lineWrapping: true,
                        matchBrackets: true,
                        autoCloseBrackets: true
                    });
                }
            };
            document.head.appendChild(mode);
        };
        document.head.appendChild(script);
    }

    // ── File Upload ────────────────────────────────────────────────
    function _handleUpload() {
        var input = document.getElementById('pfig-file-input');
        input.onchange = function() {
            var file = input.files[0];
            if (!file) return;
            if (file.size > 51200) {
                _setStatus('File too large (50KB limit)', 'error');
                return;
            }
            var reader = new FileReader();
            reader.onload = function(e) {
                var code = e.target.result;
                if (_editor) {
                    _editor.setValue(code);
                } else if (_textarea) {
                    _textarea.value = code;
                }
                _setStatus('Loaded: ' + file.name, 'success');
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // ── Submit ─────────────────────────────────────────────────────
    async function _handleSubmit() {
        if (_submitting) return;

        var code = _editor ? _editor.getValue() : (_textarea ? _textarea.value : '');
        if (!code.trim()) {
            _setStatus('No code to submit.', 'error');
            return;
        }

        if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn()) {
            _setStatus('You must be signed in to submit.', 'error');
            return;
        }

        _submitting = true;
        var btn = document.getElementById('pfig-btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="pfig-spinner"></span> Grading...';
        _setStatus('Submitting code to grading server...', '');

        try {
            var result = await FirebaseAuth.callFunction('gradePFIProject', {
                projectId: _config.projectId,
                code: code
            });

            _previousResult = result.data;
            _renderResults(result.data);
            _setStatus('Grading complete. Attempt #' + (result.data.attemptNumber || 1), 'success');

        } catch (e) {
            var msg = e.message || 'Grading failed.';
            if (e.code === 'functions/resource-exhausted') {
                msg = 'Rate limit reached (5 submissions/hour). Try again later.';
            }
            _setStatus(msg, 'error');
            document.getElementById('pfig-results').innerHTML = '';
        } finally {
            _submitting = false;
            btn.disabled = false;
            btn.textContent = 'Submit for Grading';
        }
    }

    // ── Render Results ─────────────────────────────────────────────
    function _renderResults(data) {
        var container = document.getElementById('pfig-results');
        var passed = data.passed;
        var pct = Math.round((data.autoScore / data.maxScore) * 100);

        var html = '<div class="pfig-card pfig-results">';

        // Score banner
        html += '<div class="pfig-score-banner ' + (passed ? 'pass' : 'fail') + '">';
        html += '<div class="pfig-score-big">' + data.autoScore + ' / ' + data.maxScore + '</div>';
        html += '<div class="pfig-score-label">' + pct + '%</div>';
        html += '<div class="pfig-badge ' + (passed ? 'pass' : 'fail') + '">' + (passed ? 'PASSED' : 'NOT PASSED') + '</div>';
        html += '</div>';

        // Category breakdown
        var cats = data.categoryScores || {};
        var catConfig = _config.rubricCategories || [];
        html += '<h3 style="color:#e0e0e0;font-size:0.95rem;margin-bottom:10px;">Rubric Breakdown</h3>';
        html += '<table class="pfig-cat-table"><thead><tr><th>Category</th><th>Score</th><th>Progress</th></tr></thead><tbody>';
        catConfig.forEach(function(c) {
            var cat = cats[c.id] || { earned: 0, max: c.maxPoints };
            var catPct = cat.max > 0 ? Math.round((cat.earned / cat.max) * 100) : 0;
            var color = catPct >= 80 ? '#22c55e' : catPct >= 50 ? '#eab308' : '#ef4444';
            html += '<tr>';
            html += '<td>' + _esc(c.label) + '</td>';
            html += '<td style="font-weight:600;color:' + color + '">' + cat.earned + ' / ' + cat.max + '</td>';
            html += '<td><div class="pfig-cat-bar"><div class="pfig-cat-fill" style="width:' + catPct + '%;background:' + color + '"></div></div></td>';
            html += '</tr>';
        });
        html += '</tbody></table>';

        // Test results
        var tests = data.testResults || [];
        html += '<h3 style="color:#e0e0e0;font-size:0.95rem;margin-bottom:10px;">Test Results (' + tests.filter(function(t) { return t.passed; }).length + '/' + tests.length + ' passed)</h3>';
        tests.forEach(function(t) {
            html += '<div class="pfig-test">';
            html += '<span class="pfig-test-icon ' + (t.passed ? 'pass' : 'fail') + '">' + (t.passed ? '\u2713' : '\u2717') + '</span>';
            html += '<span style="color:' + (t.passed ? '#c9d1d9' : '#94a3b8') + '">' + _esc(t.name) + '</span>';
            html += '</div>';
        });

        // Execution output
        if (data.executionOutput) {
            html += '<h3 style="color:#e0e0e0;font-size:0.95rem;margin-top:16px;margin-bottom:8px;">Program Output</h3>';
            html += '<div class="pfig-output-wrap">' + _esc(data.executionOutput) + '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }

    // ── Load Previous Submission ───────────────────────────────────
    async function _loadPreviousSubmission() {
        if (typeof FirebaseAuth === 'undefined') return;

        // Wait for auth
        var checkCount = 0;
        var waitForAuth = setInterval(function() {
            checkCount++;
            if (checkCount > 30) { clearInterval(waitForAuth); return; }
            if (!FirebaseAuth.isSignedIn()) return;

            clearInterval(waitForAuth);

            // Check Firestore for existing submission
            var uid = FirebaseAuth.getUser().uid;
            var docPath = 'pfi_submissions/' + _config.projectId + '_' + uid;

            // Use Firestore modular SDK if available
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                firebase.firestore().doc(docPath).get().then(function(doc) {
                    if (doc.exists) {
                        var data = doc.data();
                        _previousResult = data;
                        var prev = document.getElementById('pfig-previous');
                        prev.innerHTML = '<div class="pfig-card" style="border-color:rgba(255,255,255,0.06);">' +
                            '<div style="font-size:0.82rem;color:#6b7280;margin-bottom:8px;">Previous Submission (Attempt #' + (data.attemptNumber || 1) + ')</div>' +
                            '<div style="font-size:1.1rem;font-weight:700;color:' + (data.passed ? '#22c55e' : '#ef4444') + ';">' +
                            data.autoScore + ' / ' + data.maxScore + ' — ' + (data.passed ? 'PASSED' : 'NOT PASSED') +
                            '</div>' +
                            '</div>';
                    }
                }).catch(function() { /* silent */ });
            }
        }, 500);
    }

    // ── Helpers ─────────────────────────────────────────────────────
    function _setStatus(msg, type) {
        var el = document.getElementById('pfig-status');
        if (!el) return;
        el.textContent = msg;
        el.style.color = type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#6b7280';
    }

    function _esc(str) {
        var div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    // ── Export ──────────────────────────────────────────────────────
    window.PFIProjectGrader = { init: init };

})();
