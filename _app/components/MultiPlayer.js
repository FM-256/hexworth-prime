/**
 * MultiPlayer.js — Reusable 2-Player System for Hexworth Prime Arcade
 *
 * Game-agnostic multiplayer component. Drop into any game for:
 * - Mode selection (Solo / Split Controls / Turn-Based)
 * - Dual control schemes (WASD vs Arrows)
 * - Side-by-side scoreboard
 * - Turn-based manager with timer
 * - Winner announcement overlay
 * - Ghost mode (record & replay inputs)
 *
 * Sprint F-25: 2-Player Mode System (Wave 16)
 */
window.MultiPlayer = (function () {
    'use strict';

    var _cssInjected = false;
    var _activeKeys = {};
    var _keyListener = null;
    var _keyUpListener = null;

    // ── Control Schemes ──────────────────────────────────────────────
    var CONTROLS = {
        1: { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'Space', alt1: 'KeyQ', alt2: 'KeyE' },
        2: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', action: 'Enter', alt1: 'ShiftLeft', alt2: 'ControlLeft' }
    };

    // ── CSS Injection ────────────────────────────────────────────────
    function _injectCSS(accent) {
        if (_cssInjected) return;
        _cssInjected = true;
        var ac = accent || '#f59e0b';
        var s = document.createElement('style');
        s.textContent = [
            '.mp-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.88);z-index:10050;display:flex;align-items:center;justify-content:center;animation:mpFadeIn .25s ease-out}',
            '@keyframes mpFadeIn{from{opacity:0}to{opacity:1}}',
            '@media(prefers-reduced-motion:reduce){.mp-overlay,.mp-mode-btn,.mp-winner-badge,.mp-turn-bar{animation:none!important;transition:none!important}}',
            '.mp-panel{background:#111;border:1px solid #333;border-radius:12px;padding:32px 28px;text-align:center;font-family:"Courier New",monospace;color:#ccc;max-width:420px;width:90%}',
            '.mp-panel h2{color:' + ac + ';font-size:22px;margin-bottom:8px;letter-spacing:2px}',
            '.mp-panel .mp-sub{color:#888;font-size:12px;margin-bottom:24px}',
            '.mp-mode-btn{display:block;width:100%;padding:14px 16px;margin-bottom:10px;background:rgba(255,255,255,0.04);border:1px solid #444;border-radius:8px;color:#eee;font-family:inherit;font-size:14px;cursor:pointer;text-align:left;transition:border-color .15s,background .15s}',
            '.mp-mode-btn:hover{border-color:' + ac + ';background:rgba(255,255,255,0.08)}',
            '.mp-mode-btn strong{color:' + ac + ';display:block;margin-bottom:2px}',
            '.mp-mode-btn span{color:#888;font-size:11px}',
            '.mp-sb{display:flex;gap:12px;font-family:"Courier New",monospace;user-select:none}',
            '.mp-sb-player{flex:1;background:rgba(0,0,0,0.6);border:1px solid #333;border-radius:8px;padding:10px 14px;text-align:center;transition:border-color .2s}',
            '.mp-sb-player.p1{border-color:#3b82f6}',
            '.mp-sb-player.p2{border-color:#ef4444}',
            '.mp-sb-player.winner{box-shadow:0 0 18px rgba(255,215,0,0.35);border-color:#fbbf24}',
            '.mp-sb-name{font-size:11px;color:#999;margin-bottom:4px;letter-spacing:1px}',
            '.mp-sb-score{font-size:28px;font-weight:bold;color:#fff}',
            '.mp-sb-player.p1 .mp-sb-score{color:#60a5fa}',
            '.mp-sb-player.p2 .mp-sb-score{color:#f87171}',
            '.mp-turn-bar{background:#111;border:1px solid #333;border-radius:8px;padding:8px 16px;font-family:"Courier New",monospace;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#ccc}',
            '.mp-turn-label{font-weight:bold}',
            '.mp-turn-label.p1{color:#60a5fa}',
            '.mp-turn-label.p2{color:#f87171}',
            '.mp-turn-timer{color:#fbbf24;font-size:15px;font-weight:bold}',
            '.mp-winner-badge{font-size:48px;margin-bottom:12px;animation:mpPulse 1.5s ease-in-out infinite}',
            '@keyframes mpPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}',
            '.mp-win-title{font-size:26px;color:#fbbf24;margin-bottom:6px;letter-spacing:3px}',
            '.mp-win-scores{font-size:14px;color:#999;margin-bottom:20px}',
            '.mp-win-scores .p1c{color:#60a5fa}',
            '.mp-win-scores .p2c{color:#f87171}',
            '.mp-btn{padding:12px 28px;background:' + ac + ';color:#000;border:none;border-radius:6px;font-family:inherit;font-size:14px;font-weight:bold;cursor:pointer;letter-spacing:1px}',
            '.mp-btn:hover{filter:brightness(1.15)}'
        ].join('\n');
        document.head.appendChild(s);
    }

    // ── Icon helper (no emoji) ───────────────────────────────────────
    function _icon(name, size) {
        var sz = size || '1.2em';
        return '<img src="/_app/assets/images/icons/' + name + '.webp" alt="" style="width:' + sz + ';height:' + sz + ';vertical-align:middle;display:inline-block;object-fit:contain">';
    }

    // ── Mode Select Screen ───────────────────────────────────────────
    function showModeSelect(container, callback, opts) {
        opts = opts || {};
        _injectCSS(opts.accent);
        var overlay = document.createElement('div');
        overlay.className = 'mp-overlay';
        overlay.innerHTML = '<div class="mp-panel">' +
            '<h2>' + _icon('icon-swords', '1.4em') + ' PLAYER MODE</h2>' +
            '<div class="mp-sub">Choose your battle configuration</div>' +
            '<button class="mp-mode-btn" data-mode="solo"><strong>' + _icon('icon-target') + ' Solo</strong><span>Classic single-player experience</span></button>' +
            '<button class="mp-mode-btn" data-mode="split"><strong>' + _icon('icon-users') + ' Split Controls</strong><span>P1: WASD + Space -- P2: Arrows + Enter</span></button>' +
            '<button class="mp-mode-btn" data-mode="turns"><strong>' + _icon('icon-clock') + ' Turn-Based</strong><span>Alternate turns, compete for high score</span></button>' +
            '</div>';
        overlay.addEventListener('click', function (e) {
            var btn = e.target.closest('.mp-mode-btn');
            if (!btn) return;
            var mode = btn.getAttribute('data-mode');
            container.removeChild(overlay);
            if (typeof callback === 'function') callback(mode);
        });
        container.appendChild(overlay);
        return overlay;
    }

    // ── Split Controls Manager ───────────────────────────────────────
    function getControls(playerNum) {
        var c = CONTROLS[playerNum] || CONTROLS[1];
        return {
            up: c.up, down: c.down, left: c.left, right: c.right,
            action: c.action, alt1: c.alt1, alt2: c.alt2,
            isPressed: function (key) { return !!_activeKeys[key]; }
        };
    }

    function startListening() {
        if (_keyListener) return;
        _activeKeys = {};
        _keyListener = function (e) {
            _activeKeys[e.code] = true;
            // Prevent scroll from arrow keys / space during gameplay
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(e.code) !== -1) {
                e.preventDefault();
            }
        };
        _keyUpListener = function (e) {
            _activeKeys[e.code] = false;
        };
        window.addEventListener('keydown', _keyListener);
        window.addEventListener('keyup', _keyUpListener);
    }

    function stopListening() {
        if (_keyListener) {
            window.removeEventListener('keydown', _keyListener);
            window.removeEventListener('keyup', _keyUpListener);
            _keyListener = null;
            _keyUpListener = null;
            _activeKeys = {};
        }
    }

    // ── Dual Score Display ───────────────────────────────────────────
    function renderScoreboard(container, p1Score, p2Score, p1Name, p2Name, opts) {
        opts = opts || {};
        _injectCSS(opts.accent);
        var gameOver = opts.gameOver || false;
        var p1Win = gameOver && p1Score > p2Score;
        var p2Win = gameOver && p2Score > p1Score;
        // Reuse existing element or create
        var el = container.querySelector('.mp-sb');
        if (!el) {
            el = document.createElement('div');
            el.className = 'mp-sb';
            container.appendChild(el);
        }
        el.innerHTML =
            '<div class="mp-sb-player p1' + (p1Win ? ' winner' : '') + '">' +
                '<div class="mp-sb-name">' + (p1Win ? _icon('icon-crown', '1em') + ' ' : '') + (p1Name || 'P1') + '</div>' +
                '<div class="mp-sb-score">' + (p1Score || 0) + '</div>' +
            '</div>' +
            '<div class="mp-sb-player p2' + (p2Win ? ' winner' : '') + '">' +
                '<div class="mp-sb-name">' + (p2Win ? _icon('icon-crown', '1em') + ' ' : '') + (p2Name || 'P2') + '</div>' +
                '<div class="mp-sb-score">' + (p2Score || 0) + '</div>' +
            '</div>';
        return el;
    }

    // ── Turn-Based Manager ───────────────────────────────────────────
    function turnManager(config) {
        config = config || {};
        var players = config.players || 2;
        var timeLimit = config.timeLimit || 0;  // 0 = no limit
        var onTurnStart = config.onTurnStart || function () {};
        var onTurnEnd = config.onTurnEnd || function () {};
        var current = 0;
        var timer = null;
        var remaining = timeLimit;
        var barEl = null;
        var active = true;

        function _renderBar(container) {
            if (!barEl) {
                _injectCSS(config.accent);
                barEl = document.createElement('div');
                barEl.className = 'mp-turn-bar';
                container.appendChild(barEl);
            }
            var pNum = current + 1;
            var cls = 'p' + pNum;
            barEl.innerHTML =
                '<span class="mp-turn-label ' + cls + '">' + _icon('icon-target', '1em') + ' Player ' + pNum + '\'s Turn</span>' +
                (timeLimit > 0 ? '<span class="mp-turn-timer">' + remaining + 's</span>' : '');
        }

        function _startTimer() {
            if (timeLimit <= 0) return;
            remaining = timeLimit;
            if (timer) clearInterval(timer);
            timer = setInterval(function () {
                remaining--;
                if (barEl) {
                    var timerEl = barEl.querySelector('.mp-turn-timer');
                    if (timerEl) timerEl.textContent = remaining + 's';
                }
                if (remaining <= 0) {
                    clearInterval(timer);
                    timer = null;
                    endTurn();
                }
            }, 1000);
        }

        function startTurn(container) {
            if (!active) return;
            _renderBar(container);
            _startTimer();
            onTurnStart(current + 1);
        }

        function endTurn() {
            if (!active) return;
            if (timer) { clearInterval(timer); timer = null; }
            onTurnEnd(current + 1);
            current = (current + 1) % players;
        }

        function getCurrentPlayer() { return current + 1; }

        function destroy() {
            active = false;
            if (timer) { clearInterval(timer); timer = null; }
            if (barEl && barEl.parentNode) barEl.parentNode.removeChild(barEl);
            barEl = null;
        }

        return {
            startTurn: startTurn,
            endTurn: endTurn,
            getCurrentPlayer: getCurrentPlayer,
            destroy: destroy
        };
    }

    // ── Winner Announcement ──────────────────────────────────────────
    function announceWinner(winner, p1Score, p2Score, opts) {
        opts = opts || {};
        _injectCSS(opts.accent);
        var container = opts.container || document.body;
        var tie = p1Score === p2Score;
        var title = tie ? 'DRAW' : (winner === 1 ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS');
        var overlay = document.createElement('div');
        overlay.className = 'mp-overlay';
        overlay.innerHTML = '<div class="mp-panel">' +
            '<div class="mp-winner-badge">' + _icon('icon-trophy', '2.4em') + '</div>' +
            '<div class="mp-win-title">' + title + '</div>' +
            '<div class="mp-win-scores">' +
                '<span class="p1c">P1: ' + p1Score + '</span> &mdash; ' +
                '<span class="p2c">P2: ' + p2Score + '</span>' +
            '</div>' +
            '<button class="mp-btn mp-play-again">PLAY AGAIN</button>' +
            '</div>';
        var playAgainBtn = overlay.querySelector('.mp-play-again');
        playAgainBtn.addEventListener('click', function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            if (typeof opts.onPlayAgain === 'function') opts.onPlayAgain();
        });
        container.appendChild(overlay);
        // Hook: GameTracker integration
        if (typeof opts.onResult === 'function') {
            opts.onResult({ winner: tie ? 0 : winner, p1Score: p1Score, p2Score: p2Score, tie: tie });
        }
        return overlay;
    }

    // ── Ghost Mode (Record & Replay) ─────────────────────────────────
    var _recording = null;
    var _recordStart = 0;
    var _recordKeyDown = null;
    var _recordKeyUp = null;
    var _ghostTimers = [];

    function startRecording() {
        _recording = [];
        _recordStart = performance.now();
        // Clean up any previous listeners
        _stopRecordListeners();
        _recordKeyDown = function (e) {
            _recording.push({ t: Math.round(performance.now() - _recordStart), code: e.code, type: 'down' });
        };
        _recordKeyUp = function (e) {
            _recording.push({ t: Math.round(performance.now() - _recordStart), code: e.code, type: 'up' });
        };
        window.addEventListener('keydown', _recordKeyDown);
        window.addEventListener('keyup', _recordKeyUp);
    }

    function stopRecording() {
        _stopRecordListeners();
        var result = _recording || [];
        _recording = null;
        return result;
    }

    function _stopRecordListeners() {
        if (_recordKeyDown) { window.removeEventListener('keydown', _recordKeyDown); _recordKeyDown = null; }
        if (_recordKeyUp) { window.removeEventListener('keyup', _recordKeyUp); _recordKeyUp = null; }
    }

    function playGhost(recording, onInput) {
        stopGhost();
        if (!recording || !recording.length || typeof onInput !== 'function') return;
        _ghostTimers = [];
        for (var i = 0; i < recording.length; i++) {
            (function (entry) {
                var tid = setTimeout(function () {
                    onInput(entry);
                }, entry.t);
                _ghostTimers.push(tid);
            })(recording[i]);
        }
    }

    function stopGhost() {
        for (var i = 0; i < _ghostTimers.length; i++) {
            clearTimeout(_ghostTimers[i]);
        }
        _ghostTimers = [];
    }

    // ── Public API ───────────────────────────────────────────────────
    return {
        showModeSelect: showModeSelect,
        getControls: getControls,
        startListening: startListening,
        stopListening: stopListening,
        renderScoreboard: renderScoreboard,
        turnManager: turnManager,
        announceWinner: announceWinner,
        startRecording: startRecording,
        stopRecording: stopRecording,
        playGhost: playGhost,
        stopGhost: stopGhost,
        CONTROLS: CONTROLS
    };
})();
