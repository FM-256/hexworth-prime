/**
 * GameScoreboard.js - Persistent high score widget for all games
 *
 * Auto-detects the game ID from the page, then renders a fixed scoreboard
 * panel showing top 3 high scores. Updates live after each game-over.
 *
 * Requires: GameTracker.js loaded before this script.
 */
const GameScoreboard = (function () {

    let _widget = null;
    let _gameId = null;
    let _collapsed = false;
    let _cssInjected = false;
    let _flashTimer = null;

    // ── Auto-detect game ID ────────────────────────────────────────

    function _detectGameId() {
        var scripts = document.querySelectorAll('script:not([src])');
        for (var i = 0; i < scripts.length; i++) {
            var text = scripts[i].textContent;
            // Direct GameTracker.record() call
            var match = text.match(/GameTracker\.record\s*\(\s*['"]([^'"]+)['"]/);
            if (match) return match[1];
            // Engine-based games pass trackerKey in config (e.g. FlappyEngine.init)
            var tkMatch = text.match(/trackerKey\s*:\s*['"]([^'"]+)['"]/);
            if (tkMatch) return tkMatch[1];
        }
        return null;
    }

    // ── CSS ────────────────────────────────────────────────────────

    function _injectCSS() {
        if (_cssInjected) return;
        _cssInjected = true;

        var style = document.createElement('style');
        style.textContent = `
            .gs-widget {
                /* Not top:12px. The shared achievement toast (AchievementManager.js) owns
                   top:20/right:20 and is ~94px tall, so a panel at 12px was underneath it in every
                   game loading both -- measured on cloud-flap at 1920 ("Night Owl >< #1").
                   130px clears the toast band [20,114] with margin. This panel is persistent and
                   this file is on 79 pages; the toast is transient and on 2,551, so the panel is
                   the one that yields. Per-page .gs-widget top overrides marked !important are
                   redundant with this and were removed -- fix the component, not the pages. */
                position: absolute;
                top: 130px;
                right: 12px;
                width: 220px;
                background: rgba(8, 8, 18, 0.92);
                border: 1px solid rgba(255, 215, 0, 0.25);
                border-radius: 10px;
                font-family: 'Courier New', monospace;
                color: #ccc;
                z-index: 99990;
                box-shadow: 0 2px 20px rgba(0,0,0,0.5);
                overflow: hidden;
                transition: border-color 0.3s, box-shadow 0.3s;
                user-select: none;
            }
            .gs-widget.gs-flash {
                border-color: rgba(255, 215, 0, 0.8);
                box-shadow: 0 2px 20px rgba(0,0,0,0.5), 0 0 25px rgba(255, 215, 0, 0.3);
            }
            .gs-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px 8px;
                cursor: pointer;
                background: rgba(255, 215, 0, 0.06);
                border-bottom: 1px solid rgba(255, 215, 0, 0.12);
            }
            .gs-header:hover { background: rgba(255, 215, 0, 0.1); }
            .gs-header-title {
                font-size: 11px;
                font-weight: bold;
                color: #FFD700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
            }
            .gs-toggle {
                font-size: 14px;
                color: #8a8a8a;
                transition: transform 0.2s;
            }
            .gs-widget.gs-collapsed .gs-toggle { transform: rotate(180deg); }
            .gs-widget.gs-collapsed .gs-body { display: none; }
            .gs-body {
                padding: 10px 12px 12px;
            }
            .gs-row {
                display: flex;
                align-items: center;
                padding: 5px 4px;
                border-radius: 4px;
                margin-bottom: 2px;
                font-size: 13px;
                transition: background 0.3s;
            }
            .gs-row.gs-highlight {
                background: rgba(255, 215, 0, 0.12);
                animation: gs-row-flash 1.5s ease-out;
            }
            @keyframes gs-row-flash {
                0% { background: rgba(255, 215, 0, 0.35); }
                100% { background: rgba(255, 215, 0, 0.12); }
            }
            .gs-medal {
                width: 22px;
                font-size: 14px;
                flex-shrink: 0;
                text-align: center;
            }
            .gs-rank-1 .gs-medal { color: #FFD700; }
            .gs-rank-2 .gs-medal { color: #C0C0C0; }
            .gs-rank-3 .gs-medal { color: #CD7F32; }
            .gs-row-name {
                flex: 1;
                font-size: 11px;
                color: #aaa;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 0;
            }
            .gs-row-score {
                font-weight: bold;
                font-size: 14px;
                color: #fff;
                padding-left: 6px;
                flex-shrink: 0;
                text-align: right;
            }
            .gs-empty {
                color: #444;
                font-size: 11px;
                text-align: center;
                padding: 12px 0;
                font-style: italic;
            }
            .gs-slot-empty .gs-row-score {
                color: #333;
                font-weight: normal;
            }
            .gs-slot-empty .gs-medal { color: #333; }
            .gs-stats {
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid rgba(255,255,255,0.06);
                font-size: 10px;
                color: #808080;
                display: flex;
                justify-content: space-between;
            }
            .gs-badge-bar {
                text-align: center;
                padding: 6px 0 2px;
            }
            .gs-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                letter-spacing: 1px;
                animation: gs-badge-pulse 0.8s ease-in-out 3;
            }
            .gs-badge-gold {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #1a1a00;
            }
            .gs-badge-top3 {
                background: linear-gradient(135deg, #C0C0C0, #8a8a8a);
                color: #1a1a1a;
            }
            @keyframes gs-badge-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
            }
        `;
        document.head.appendChild(style);
    }

    // ── Build widget ───────────────────────────────────────────────

    function _createWidget() {
        if (_widget) _widget.remove();

        var div = document.createElement('div');
        div.className = 'gs-widget';

        /* Narrow screens: start COLLAPSED, do not hide. Ten game pages each carried
           `@media (max-width:899px){ .gs-widget{ display:none } }` to stop a 220px panel landing on
           the board -- that deletes the student's rank and the affordance to see it. Collapsing
           keeps the HIGH SCORES header and the toggle, so the panel is one tap away and occupies
           only a header row. Only the INITIAL state is width-derived; once the student toggles it,
           their choice stands (no resize listener re-collapsing it under them). */
        if (window.innerWidth < 900) {
            _collapsed = true;
            div.classList.add('gs-collapsed');
        }

        div.innerHTML =
            '<div class="gs-header">' +
                '<span class="gs-header-title">HIGH SCORES</span>' +
                '<span class="gs-toggle">&#9650;</span>' +
            '</div>' +
            '<div class="gs-body">' +
                '<div class="gs-badge-bar"></div>' +
                '<div class="gs-list"></div>' +
                '<div class="gs-stats"></div>' +
            '</div>';

        div.querySelector('.gs-header').addEventListener('click', function () {
            _collapsed = !_collapsed;
            div.classList.toggle('gs-collapsed', _collapsed);
        });

        document.body.appendChild(div);
        _widget = div;
        _populateScores();
    }

    // ── Populate / refresh scores ──────────────────────────────────

    function _populateScores(highlightScore) {
        if (!_widget || !_gameId) return;
        if (typeof GameTracker === 'undefined') return;

        var topScores = GameTracker.getTopScores(_gameId);
        var stats = GameTracker.getGameStats(_gameId);
        var listEl = _widget.querySelector('.gs-list');
        var statsEl = _widget.querySelector('.gs-stats');
        var medals = ['#1', '#2', '#3'];
        var html = '';

        for (var i = 0; i < 3; i++) {
            var entry = topScores[i];
            var isEmpty = !entry;
            var isHighlight = !isEmpty && highlightScore != null
                && entry.score === highlightScore
                && Math.abs(entry.date - Date.now()) < 5000;
            var cls = 'gs-row gs-rank-' + (i + 1);
            if (isEmpty) cls += ' gs-slot-empty';
            if (isHighlight) cls += ' gs-highlight';

            var name = isEmpty ? '' : (entry.name || 'Player');
            html += '<div class="' + cls + '">' +
                '<span class="gs-medal">' + medals[i] + '</span>' +
                '<span class="gs-row-name">' + (isEmpty ? '' : _escapeHtml(name)) + '</span>' +
                '<span class="gs-row-score">' + (isEmpty ? '---' : _formatScore(entry.score)) + '</span>' +
            '</div>';
        }

        listEl.innerHTML = html;

        if (stats && stats.plays > 0) {
            statsEl.innerHTML =
                '<span>PLAYS: ' + stats.plays + '</span>' +
                '<span>WINS: ' + stats.wins + '</span>';
        } else {
            statsEl.innerHTML = '<span style="margin:0 auto">NO PLAYS YET</span>';
        }
    }

    // ── Flash + badge on new score ─────────────────────────────────

    function _onGameRecorded(e) {
        var detail = e.detail;
        if (!_widget || detail.score == null) return;

        // Expand if collapsed
        if (_collapsed) {
            _collapsed = false;
            _widget.classList.remove('gs-collapsed');
        }

        _populateScores(detail.score);

        // Flash the widget border
        _widget.classList.add('gs-flash');
        clearTimeout(_flashTimer);
        _flashTimer = setTimeout(function () {
            if (_widget) _widget.classList.remove('gs-flash');
        }, 3000);
    }

    function _onHighScore(e) {
        if (!_widget) return;
        var badgeBar = _widget.querySelector('.gs-badge-bar');
        if (!badgeBar) return;

        var badge = document.createElement('span');
        if (e.detail.rank === 1) {
            badge.className = 'gs-badge gs-badge-gold';
            badge.textContent = 'NEW HIGH SCORE!';
        } else if (e.detail.rank <= 3) {
            badge.className = 'gs-badge gs-badge-top3';
            badge.textContent = 'NEW TOP 3!';
        } else {
            return;
        }
        badgeBar.innerHTML = '';
        badgeBar.appendChild(badge);

        // Clear badge after 6s
        setTimeout(function () {
            if (badgeBar) badgeBar.innerHTML = '';
        }, 6000);
    }

    // ── Helpers ─────────────────────────────────────────────────────

    function _formatScore(score) {
        if (typeof score !== 'number') return String(score);
        return score.toLocaleString();
    }

    function _escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── Init ────────────────────────────────────────────────────────

    function init() {
        _gameId = _detectGameId();
        if (!_gameId) return; // Not a tracked game page

        _injectCSS();
        _createWidget();

        window.addEventListener('hexworth:gameRecorded', _onGameRecorded);
        window.addEventListener('hexworth:newHighScore', _onHighScore);
    }

    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init: init };

})();
