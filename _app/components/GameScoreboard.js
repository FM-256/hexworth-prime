/**
 * GameScoreboard.js - Post-game score overlay
 *
 * Listens for GameTracker events and shows a slide-in panel with:
 *   - Current score + result
 *   - Top 3 high scores leaderboard (gold / silver / bronze)
 *   - "NEW HIGH SCORE" or "NEW TOP 3" callouts
 *
 * Auto-dismisses after 8 seconds. Click panel or close button to dismiss early.
 * Only appears for score-based games (skips "Don't..." survival games).
 */
const GameScoreboard = (function () {

    let _panel = null;
    let _dismissTimer = null;
    let _cssInjected = false;

    // ── CSS ────────────────────────────────────────────────────────

    function _injectCSS() {
        if (_cssInjected) return;
        _cssInjected = true;

        const style = document.createElement('style');
        style.textContent = `
            .gs-panel {
                position: fixed;
                bottom: 20px;
                right: -400px;
                width: 340px;
                background: rgba(10, 10, 20, 0.95);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                padding: 20px;
                font-family: 'Courier New', monospace;
                color: #e0e0e0;
                z-index: 99999;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.1);
                transition: right 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                cursor: pointer;
            }
            .gs-panel.gs-visible {
                right: 20px;
            }
            .gs-close {
                position: absolute;
                top: 8px;
                right: 12px;
                background: none;
                border: none;
                color: #888;
                font-size: 18px;
                cursor: pointer;
                padding: 2px 6px;
                line-height: 1;
            }
            .gs-close:hover { color: #fff; }
            .gs-title {
                font-size: 13px;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }
            .gs-score-line {
                font-size: 28px;
                font-weight: bold;
                color: #fff;
                margin-bottom: 4px;
            }
            .gs-result {
                font-size: 12px;
                color: #aaa;
                margin-bottom: 16px;
            }
            .gs-badge {
                display: inline-block;
                padding: 3px 10px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 1px;
                margin-bottom: 14px;
                animation: gs-pulse 1s ease-in-out 3;
            }
            .gs-badge-gold {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #1a1a00;
            }
            .gs-badge-top3 {
                background: linear-gradient(135deg, #C0C0C0, #8a8a8a);
                color: #1a1a1a;
            }
            @keyframes gs-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            .gs-divider {
                border: none;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                margin: 12px 0;
            }
            .gs-lb-title {
                font-size: 11px;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
            }
            .gs-lb-row {
                display: flex;
                align-items: center;
                padding: 6px 0;
                font-size: 14px;
            }
            .gs-lb-rank {
                width: 28px;
                font-weight: bold;
                flex-shrink: 0;
            }
            .gs-lb-rank-1 { color: #FFD700; }
            .gs-lb-rank-2 { color: #C0C0C0; }
            .gs-lb-rank-3 { color: #CD7F32; }
            .gs-lb-score {
                flex: 1;
                text-align: right;
                font-family: 'Courier New', monospace;
                font-weight: bold;
            }
            .gs-lb-date {
                width: 80px;
                text-align: right;
                font-size: 11px;
                color: #666;
                flex-shrink: 0;
                margin-left: 8px;
            }
            .gs-lb-empty {
                color: #555;
                font-style: italic;
                font-size: 12px;
                padding: 8px 0;
            }
            .gs-lb-you {
                background: rgba(255, 215, 0, 0.08);
                border-radius: 4px;
                margin: 0 -6px;
                padding: 6px 6px;
            }
            .gs-dismiss-bar {
                height: 3px;
                background: rgba(255, 215, 0, 0.4);
                border-radius: 2px;
                margin-top: 14px;
                animation: gs-shrink 8s linear forwards;
            }
            @keyframes gs-shrink {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        document.head.appendChild(style);
    }

    // ── DOM ─────────────────────────────────────────────────────────

    function _createPanel() {
        if (_panel) _panel.remove();

        const div = document.createElement('div');
        div.className = 'gs-panel';
        div.innerHTML = `
            <button class="gs-close" title="Close">&times;</button>
            <div class="gs-title"></div>
            <div class="gs-score-line"></div>
            <div class="gs-result"></div>
            <div class="gs-badge-area"></div>
            <hr class="gs-divider">
            <div class="gs-lb-title">LEADERBOARD</div>
            <div class="gs-lb-list"></div>
            <div class="gs-dismiss-bar"></div>
        `;

        div.addEventListener('click', _hide);
        div.querySelector('.gs-close').addEventListener('click', function (e) {
            e.stopPropagation();
            _hide();
        });

        document.body.appendChild(div);
        _panel = div;
        return div;
    }

    // ── Show / Hide ────────────────────────────────────────────────

    function _show(detail) {
        // Only show for score-based games
        if (detail.score == null) return;

        _injectCSS();
        const panel = _createPanel();

        // Game title
        const reg = (typeof GameTracker !== 'undefined') ? GameTracker.GAME_REGISTRY : {};
        const meta = reg[detail.gameId] || {};
        panel.querySelector('.gs-title').textContent =
            (meta.icon || '') + ' ' + (meta.title || detail.gameId);

        // Current score
        panel.querySelector('.gs-score-line').textContent =
            _formatScore(detail.score);

        // Result text
        const resultText = detail.result === 'success' ? 'COMPLETED' :
            detail.result === 'failure' ? 'GAME OVER' :
            detail.result ? detail.result.toUpperCase() : '';
        panel.querySelector('.gs-result').textContent = resultText;

        // Top 3 leaderboard
        const topScores = (typeof GameTracker !== 'undefined')
            ? GameTracker.getTopScores(detail.gameId)
            : [];

        const listEl = panel.querySelector('.gs-lb-list');
        if (topScores.length === 0) {
            listEl.innerHTML = '<div class="gs-lb-empty">No scores yet</div>';
        } else {
            listEl.innerHTML = topScores.map(function (entry, i) {
                const rank = i + 1;
                const isYou = entry.score === detail.score
                    && Math.abs(entry.date - Date.now()) < 5000;
                const medals = ['', '#1', '#2', '#3'];
                return `
                    <div class="gs-lb-row ${isYou ? 'gs-lb-you' : ''}">
                        <span class="gs-lb-rank gs-lb-rank-${rank}">${medals[rank]}</span>
                        <span class="gs-lb-score">${_formatScore(entry.score)}</span>
                        <span class="gs-lb-date">${_formatDate(entry.date)}</span>
                    </div>
                `;
            }).join('');
        }

        // Slide in
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                panel.classList.add('gs-visible');
            });
        });

        // Auto-dismiss after 8s
        clearTimeout(_dismissTimer);
        _dismissTimer = setTimeout(_hide, 8000);
    }

    function _showHighScoreBadge(detail) {
        if (!_panel) return;

        const badgeArea = _panel.querySelector('.gs-badge-area');
        if (!badgeArea) return;

        const badge = document.createElement('div');
        if (detail.rank === 1) {
            badge.className = 'gs-badge gs-badge-gold';
            badge.textContent = 'NEW HIGH SCORE!';
        } else if (detail.rank <= 3) {
            badge.className = 'gs-badge gs-badge-top3';
            badge.textContent = 'NEW TOP 3!';
        }
        badgeArea.appendChild(badge);
    }

    function _hide() {
        clearTimeout(_dismissTimer);
        if (_panel) {
            _panel.classList.remove('gs-visible');
            var p = _panel;
            setTimeout(function () { p.remove(); }, 500);
            _panel = null;
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────

    function _formatScore(score) {
        if (typeof score !== 'number') return String(score);
        return score.toLocaleString();
    }

    function _formatDate(ts) {
        if (!ts) return '';
        var d = new Date(ts);
        var m = d.getMonth() + 1;
        var day = d.getDate();
        return m + '/' + day;
    }

    // ── Init ────────────────────────────────────────────────────────

    function init() {
        window.addEventListener('hexworth:gameRecorded', function (e) {
            _show(e.detail);
        });
        window.addEventListener('hexworth:newHighScore', function (e) {
            _showHighScoreBadge(e.detail);
        });
    }

    // Auto-init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init: init };

})();
