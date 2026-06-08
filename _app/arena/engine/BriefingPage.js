/* ============================================================
   CTF ARENA — BriefingPage
   Pre-launch mission briefing overlay
   Shows box metadata, lore, objectives, and toolkit
   before the student boots into the box.
   ============================================================ */

const BriefingPage = (function () {

    const STORAGE_KEY = 'hexworth_skip_briefing';
    let _styleInjected = false;

    // ── Difficulty color map ──
    const DIFF_COLORS = {
        'beginner':              '#22c55e',
        'intermediate':          '#3b82f6',
        'intermediate-advanced': '#f59e0b',
        'advanced':              '#f59e0b',
        'expert':                '#ef4444'
    };

    function _diffColor(difficulty) {
        if (!difficulty) return '#3b82f6';
        return DIFF_COLORS[difficulty.toLowerCase()] || '#3b82f6';
    }

    // ── Inject CSS once ──
    function _injectStyles() {
        if (_styleInjected) return;
        _styleInjected = true;

        const style = document.createElement('style');
        style.textContent = `
/* ── BriefingPage Overlay ── */

.bp-overlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: #08080f;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: 'Share Tech Mono', 'Courier New', 'Consolas', monospace;
    color: #c0c0d0;
    opacity: 1;
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.bp-overlay.bp-fade-out {
    opacity: 0;
    transform: scale(1.02);
    pointer-events: none;
}

/* Classified watermark */
.bp-overlay::before {
    content: 'CLASSIFIED';
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: clamp(4rem, 12vw, 10rem);
    font-weight: 700;
    letter-spacing: 0.3em;
    color: rgba(255, 255, 255, 0.018);
    pointer-events: none;
    white-space: nowrap;
    z-index: 0;
    user-select: none;
}

.bp-inner {
    position: relative;
    z-index: 1;
    max-width: 760px;
    margin: 0 auto;
    padding: 3rem 1.5rem 4rem;
}

/* ── Accent bar ── */
.bp-accent-bar {
    width: 100%;
    height: 3px;
    border-radius: 2px;
    margin-bottom: 2rem;
}

/* ── Header ── */
.bp-header {
    margin-bottom: 2.5rem;
}

.bp-title {
    font-size: clamp(1.4rem, 4vw, 2rem);
    color: #e0e0f0;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.25;
    margin: 0 0 0.4rem;
}

.bp-subtitle {
    font-size: 0.85rem;
    color: #6a6a7a;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0 0 1rem;
}

.bp-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    align-items: center;
}

.bp-badge {
    display: inline-block;
    padding: 0.2rem 0.65rem;
    border-radius: 3px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #08080f;
}

.bp-stat {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    font-size: 0.72rem;
    color: #8a8a9a;
    letter-spacing: 0.04em;
}

.bp-stat-num {
    color: #c0c0d0;
    font-weight: 600;
}

/* ── Sections ── */
.bp-section {
    margin-bottom: 2rem;
}

.bp-section-label {
    font-size: 0.68rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #4a4a5a;
    margin: 0 0 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.bp-briefing-text {
    font-size: 0.88rem;
    line-height: 1.7;
    color: #a0a0b4;
}

/* ── Objectives list ── */
.bp-obj-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.bp-obj-item {
    display: flex;
    gap: 0.8rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.82rem;
    line-height: 1.5;
}

.bp-obj-item:last-child {
    border-bottom: none;
}

.bp-obj-code {
    flex-shrink: 0;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.04);
    color: #8a8a9a;
    height: fit-content;
    white-space: nowrap;
}

.bp-obj-desc {
    color: #9a9aae;
}

/* ── MITRE tags ── */
.bp-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.bp-tag {
    display: inline-block;
    padding: 0.2rem 0.55rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    font-size: 0.72rem;
    color: #7a7a8e;
    letter-spacing: 0.04em;
    background: rgba(255, 255, 255, 0.02);
}

/* ── Command tags ── */
.bp-cmd-tag {
    display: inline-block;
    padding: 0.25rem 0.6rem;
    border-radius: 2px;
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    background: rgba(255, 255, 255, 0.05);
    color: #b0b0c4;
    border: 1px solid rgba(255, 255, 255, 0.06);
}

/* ── Lab Goals list ── */
.bp-goals-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.bp-goal-item {
    position: relative;
    padding: 0.5rem 0 0.5rem 1.2rem;
    font-size: 0.82rem;
    line-height: 1.6;
    color: #9a9aae;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.bp-goal-item:last-child {
    border-bottom: none;
}

.bp-goal-item::before {
    content: "▸";
    position: absolute;
    left: 0;
    color: #6a6a7a;
}

/* ── Rich toolkit list ── */
.bp-toolkit-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.bp-toolkit-item {
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.82rem;
    line-height: 1.5;
}

.bp-toolkit-item:last-child {
    border-bottom: none;
}

.bp-tk-name {
    margin-bottom: 0.2rem;
}

.bp-tk-name code {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 2px;
    font-size: 0.78rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.05);
    color: #b0b0c4;
    border: 1px solid rgba(255, 255, 255, 0.06);
    letter-spacing: 0.03em;
}

.bp-tk-purpose {
    color: #9a9aae;
    font-size: 0.8rem;
    margin: 0.2rem 0 0.3rem;
}

.bp-tk-sample code {
    display: inline-block;
    padding: 0.15rem 0.45rem;
    border-radius: 2px;
    font-size: 0.74rem;
    color: #7a8aae;
    background: rgba(255, 255, 255, 0.025);
    border: 1px dashed rgba(255, 255, 255, 0.06);
    font-family: 'Courier New', monospace;
}

/* ── First Time collapsible ── */
.bp-collapsible-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.7rem 0;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #6a6a7a;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    font-family: inherit;
    transition: color 0.2s;
}

.bp-collapsible-header:hover {
    color: #9a9aae;
}

.bp-chevron {
    display: inline-block;
    transition: transform 0.25s ease;
    font-size: 0.6rem;
}

.bp-collapsible-header[aria-expanded="true"] .bp-chevron {
    transform: rotate(90deg);
}

.bp-collapsible-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease;
}

.bp-collapsible-body.bp-expanded {
    max-height: 600px;
}

.bp-ftq {
    margin: 0 0 1rem;
    padding: 0;
}

.bp-ftq dt {
    font-size: 0.8rem;
    color: #b0b0c4;
    font-weight: 600;
    margin: 0.8rem 0 0.25rem;
}

.bp-ftq dt:first-child {
    margin-top: 0;
}

.bp-ftq dd {
    font-size: 0.78rem;
    color: #7a7a8e;
    line-height: 1.6;
    margin: 0;
    padding-left: 0.8rem;
    border-left: 2px solid rgba(255, 255, 255, 0.04);
}

/* ── Actions ── */
.bp-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 2.5rem;
}

.bp-launch-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.9rem 2.8rem;
    border: none;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fff;
    cursor: pointer;
    transition: filter 0.2s, transform 0.15s;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
}

.bp-launch-btn:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
}

.bp-launch-btn:active {
    transform: translateY(0);
}

.bp-skip-link {
    font-size: 0.72rem;
    color: #4a4a5a;
    cursor: pointer;
    background: none;
    border: none;
    font-family: inherit;
    letter-spacing: 0.06em;
    transition: color 0.2s;
}

.bp-skip-link:hover {
    color: #7a7a8e;
}

/* ── Responsive ── */
@media (max-width: 600px) {
    .bp-inner {
        padding: 2rem 1rem 3rem;
    }

    .bp-obj-item {
        flex-direction: column;
        gap: 0.3rem;
    }

    .bp-launch-btn {
        width: 100%;
    }
}
`;
        document.head.appendChild(style);
    }

    // ── Escape HTML ──
    function _esc(str) {
        var d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    // ── Collect unique MITRE IDs from phases ──
    function _collectMitre(phases) {
        if (!phases || !phases.length) return [];
        var seen = {};
        var ids = [];
        for (var i = 0; i < phases.length; i++) {
            var mitre = phases[i].mitre;
            if (!mitre) continue;
            for (var j = 0; j < mitre.length; j++) {
                if (!seen[mitre[j]]) {
                    seen[mitre[j]] = true;
                    ids.push(mitre[j]);
                }
            }
        }
        return ids;
    }

    // ── Build the DOM ──
    function _buildOverlay(config, onLaunch, options) {
        var isForced = !!(options && options.force);
        var accent = config.accent || '#3498db';
        var difficulty = config.difficulty || 'Intermediate';
        var diffCol = _diffColor(difficulty);
        var flagCount = config.flags ? config.flags.length : 0;
        var hintCount = config.hints ? config.hints.length : 0;

        // Lore intro
        var introText = '';
        if (config.lore && config.lore.intro) {
            introText = config.lore.intro;
        } else {
            introText = 'You have been assigned to ' + (config.title || 'this mission') + '. '
                + (config.subtitle ? config.subtitle + '. ' : '')
                + 'Complete all objectives, capture the flags, and report back.';
        }

        // Cert objectives
        var objectives = (config.certObjectives && config.certObjectives.mappings) || [];
        var certPath = config.certObjectives ? config.certObjectives.certPath : '';

        // MITRE
        var mitreIds = _collectMitre(config.phases);

        // Commands
        var commands = config.commands ? Object.keys(config.commands) : [];

        // Phase count
        var phaseCount = config.phases ? config.phases.length : 0;

        // ── Build HTML ──
        var html = '';

        // Accent bar
        html += '<div class="bp-accent-bar" style="background: ' + accent + ';"></div>';

        // Header
        html += '<div class="bp-header">';
        html += '<h1 class="bp-title">' + _esc(config.title || 'Mission Briefing') + '</h1>';
        if (config.subtitle) {
            html += '<p class="bp-subtitle">' + _esc(config.subtitle) + '</p>';
        }
        html += '<div class="bp-meta">';
        html += '<span class="bp-badge" style="background: ' + diffCol + ';">' + _esc(difficulty) + '</span>';
        if (flagCount > 0) {
            html += '<span class="bp-stat"><span class="bp-stat-num">' + flagCount + '</span> flag' + (flagCount !== 1 ? 's' : '') + '</span>';
        }
        if (hintCount > 0) {
            html += '<span class="bp-stat"><span class="bp-stat-num">' + hintCount + '</span> hint' + (hintCount !== 1 ? 's' : '') + ' available</span>';
        }
        if (phaseCount > 0) {
            html += '<span class="bp-stat"><span class="bp-stat-num">' + phaseCount + '</span> phase' + (phaseCount !== 1 ? 's' : '') + '</span>';
        }
        html += '</div>'; // meta
        html += '</div>'; // header

        // Scenario Briefing
        html += '<div class="bp-section">';
        html += '<div class="bp-section-label">Scenario Briefing</div>';
        html += '<p class="bp-briefing-text">' + _esc(introText) + '</p>';
        html += '</div>';

        // Downloads — printable handouts (worksheets, cheat-sheets, reference
        // PDFs). Optional; only renders if lore.downloads is a non-empty array.
        // Each entry: { label, url, kind?: 'PDF'|'DOCX'|... }.
        if (config.lore && Array.isArray(config.lore.downloads) && config.lore.downloads.length > 0) {
            html += '<div class="bp-section">';
            html += '<div class="bp-section-label">Worksheet &amp; Handouts</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;">';
            for (var d = 0; d < config.lore.downloads.length; d++) {
                var dl = config.lore.downloads[d] || {};
                if (!dl.url || !dl.label) continue;
                var kindLabel = dl.kind ? ' (' + _esc(dl.kind) + ')' : '';
                html += '<a href="' + _esc(dl.url) + '" download target="_blank" rel="noopener" ' +
                    'style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;' +
                    'background:rgba(0,255,65,0.08);border:1px solid rgba(0,255,65,0.35);' +
                    'border-radius:6px;color:#bbf7d0;text-decoration:none;font-size:0.9rem;font-weight:600;">' +
                    '<span style="font-size:1.1em;">&#128190;</span> ' + _esc(dl.label) + kindLabel +
                    '</a>';
            }
            html += '</div>';
            html += '</div>';
        }

        // Lab Goals — plain-English skill bullets (optional; sits between
        // narrative scenario and cert-mapped objectives so practical "what
        // you'll do" reads first, cert mapping reads as reference)
        if (config.lore && Array.isArray(config.lore.goals) && config.lore.goals.length > 0) {
            html += '<div class="bp-section">';
            html += '<div class="bp-section-label">Lab Goals</div>';
            html += '<ul class="bp-goals-list">';
            for (var g = 0; g < config.lore.goals.length; g++) {
                html += '<li class="bp-goal-item">' + _esc(config.lore.goals[g]) + '</li>';
            }
            html += '</ul>';
            html += '</div>';
        }

        // Learning Objectives
        if (objectives.length > 0) {
            html += '<div class="bp-section">';
            html += '<div class="bp-section-label">Learning Objectives' + (certPath ? ' &mdash; ' + _esc(certPath) : '') + '</div>';
            html += '<ul class="bp-obj-list">';
            for (var i = 0; i < objectives.length; i++) {
                var obj = objectives[i];
                html += '<li class="bp-obj-item">';
                html += '<span class="bp-obj-code">' + _esc(obj.objective || '') + '</span>';
                html += '<span class="bp-obj-desc">' + _esc(obj.description || '') + '</span>';
                html += '</li>';
            }
            html += '</ul>';
            html += '</div>';
        }

        // MITRE ATT&CK
        if (mitreIds.length > 0) {
            html += '<div class="bp-section">';
            html += '<div class="bp-section-label">MITRE ATT&CK Techniques</div>';
            html += '<div class="bp-tag-list">';
            for (var m = 0; m < mitreIds.length; m++) {
                html += '<span class="bp-tag">' + _esc(mitreIds[m]) + '</span>';
            }
            html += '</div>';
            html += '</div>';
        }

        // Toolkit — rich variant (name + purpose + sample) when lore.toolkit
        // is authored; falls back to bare command-tag cloud for legacy labs.
        if (config.lore && Array.isArray(config.lore.toolkit) && config.lore.toolkit.length > 0) {
            html += '<div class="bp-section">';
            html += '<div class="bp-section-label">Your Toolkit</div>';
            html += '<ul class="bp-toolkit-list">';
            for (var t = 0; t < config.lore.toolkit.length; t++) {
                var tk = config.lore.toolkit[t] || {};
                html += '<li class="bp-toolkit-item">';
                html += '<div class="bp-tk-name"><code>' + _esc(tk.name || '') + '</code></div>';
                if (tk.purpose) {
                    html += '<div class="bp-tk-purpose">' + _esc(tk.purpose) + '</div>';
                }
                if (tk.sample) {
                    html += '<div class="bp-tk-sample"><code>' + _esc(tk.sample) + '</code></div>';
                }
                html += '</li>';
            }
            html += '</ul>';
            html += '</div>';
        } else if (commands.length > 0) {
            html += '<div class="bp-section">';
            html += '<div class="bp-section-label">Your Toolkit</div>';
            html += '<div class="bp-tag-list">';
            for (var c = 0; c < commands.length; c++) {
                html += '<span class="bp-cmd-tag">' + _esc(commands[c]) + '</span>';
            }
            html += '</div>';
            html += '</div>';
        }

        // First Time? collapsible
        html += '<div class="bp-section">';
        html += '<button class="bp-collapsible-header" aria-expanded="false" type="button">';
        html += '<span class="bp-chevron">&#9654;</span> First Time?';
        html += '</button>';
        html += '<div class="bp-collapsible-body">';
        html += '<dl class="bp-ftq">';
        html += '<dt>What is a CTF box?</dt>';
        html += '<dd>A Capture-the-Flag box is a simulated environment where you use real security tools and techniques to find hidden flags. Each box presents a realistic scenario with a target system to investigate or exploit.</dd>';
        html += '<dt>How do flags work?</dt>';
        html += '<dd>Flags are secret values hidden in the environment. When you discover one, submit it in the Flag panel. Each flag is worth points and advances you through the mission.</dd>';
        html += '<dt>How do hints work?</dt>';
        html += '<dd>If you get stuck, hints are available from the desktop. Each hint costs points, so try to solve the challenge yourself first. Hints are progressively more revealing.</dd>';
        html += '<dt>What are phases?</dt>';
        html += '<dd>Boxes are divided into phases that mirror a real attack chain: reconnaissance, analysis, exploitation, and extraction. Each phase unlocks as you progress. The phase panel shows your current position.</dd>';
        html += '<dt>How is scoring calculated?</dt>';
        html += '<dd>Your score is based on flags captured, hints used (penalty), wrong submissions (penalty), and completion time. Faster completions with fewer hints earn higher scores.</dd>';
        html += '</dl>';
        html += '</div>';
        html += '</div>';

        // Actions — forced re-opens render a close-only button so a mid-lab
        // re-summon can't silently silence all future briefings via misclick.
        html += '<div class="bp-actions">';
        html += '<button class="bp-launch-btn" style="background: ' + accent + ';">' + (isForced ? 'Resume Mission' : 'Launch Mission') + '</button>';
        if (isForced) {
            html += '<button class="bp-skip-link bp-close-only">Close</button>';
        } else {
            html += '<button class="bp-skip-link">Skip briefing next time</button>';
        }
        html += '</div>';

        // Create overlay
        var overlay = document.createElement('div');
        overlay.className = 'bp-overlay';

        var inner = document.createElement('div');
        inner.className = 'bp-inner';
        inner.innerHTML = html;
        overlay.appendChild(inner);

        // ── Event handlers ──

        // Collapsible
        var colBtn = inner.querySelector('.bp-collapsible-header');
        var colBody = inner.querySelector('.bp-collapsible-body');
        if (colBtn && colBody) {
            colBtn.addEventListener('click', function () {
                var expanded = colBtn.getAttribute('aria-expanded') === 'true';
                colBtn.setAttribute('aria-expanded', String(!expanded));
                if (!expanded) {
                    colBody.classList.add('bp-expanded');
                } else {
                    colBody.classList.remove('bp-expanded');
                }
            });
        }

        // Launch
        var launchBtn = inner.querySelector('.bp-launch-btn');
        if (launchBtn) {
            launchBtn.addEventListener('click', function () {
                _dismiss(overlay, onLaunch);
            });
        }

        // Skip / Close button
        var skipBtn = inner.querySelector('.bp-skip-link');
        if (skipBtn) {
            skipBtn.addEventListener('click', function () {
                if (!isForced) {
                    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (e) { /* quota */ }
                }
                _dismiss(overlay, onLaunch);
            });
        }

        return overlay;
    }

    // ── Dismiss with animation ──
    function _dismiss(overlay, callback) {
        overlay.classList.add('bp-fade-out');
        setTimeout(function () {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (typeof callback === 'function') {
                callback();
            }
        }, 520);
    }

    // ── Public API ──
    return {

        /**
         * Show the briefing page overlay.
         * @param {Object}   config   - Box config object
         * @param {Function} callback - Called when student launches (or skips)
         * @param {Object}   [options]
         * @param {boolean}  [options.force] - Bypass skip-preference and render
         *   a Close button instead of "Skip next time". Use this for mid-lab
         *   re-summon (e.g., from a desktop briefing icon) so a re-open can't
         *   silently set the global skip flag.
         */
        show: function (config, callback, options) {
            var isForced = !!(options && options.force);

            // Check skip preference (force bypasses)
            if (!isForced) {
                try {
                    if (localStorage.getItem(STORAGE_KEY) === 'true') {
                        if (typeof callback === 'function') callback();
                        return;
                    }
                } catch (e) { /* private browsing */ }
            }

            _injectStyles();

            var overlay = _buildOverlay(config, callback, options);
            document.body.appendChild(overlay);
        }
    };

})();
