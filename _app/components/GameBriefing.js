/**
 * GameBriefing.js - First-visit "what is this and how do I play it" overlay for arcade games.
 *
 * WHY THIS EXISTS: the operator play-tested three separate games and each time could not tell
 * what he was supposed to do ("no way for the user to know what the hell he is supposed to do",
 * "users need help, it is part of a class", "this game makes zero sense... this game is silly").
 * Three games got hand-rolled overlays in response and immediately began to drift. This is the
 * one implementation the rest of the fleet shares.
 *
 * CONTENT STANDARD -- every briefing answers these, in this order, because the AD Attack Path
 * post-mortem showed the VERB is the part most often missing:
 *   role   WHO you are / the fiction
 *   goal   WHAT you are trying to do and how you know you won
 *   howto  THE VERB -- the literal interaction (click the lines, type a command, arrow keys)
 *   why    the real-world skill this stands for
 *   help   where assistance lives when stuck
 *
 * Usage:
 *   GameBriefing.init({
 *     key: 'cloud-flap',                       // localStorage seen-flag key (required, unique)
 *     title: 'Cloud Flap',
 *     accent: '#22d3ee',                       // optional, defaults to platform cyan
 *     role: 'You are a packet crossing the backbone.',
 *     goal: 'Survive as long as possible. Each milestone teaches one cloud fact.',
 *     howto: ['SPACE or click to flap', 'Avoid the pipes', 'Milestones every 10 gates'],
 *     why: 'Reinforces cloud fundamentals under time pressure.',
 *     help: 'Press ? any time to reopen this briefing.'
 *   });
 *
 * MODE DECISION (Nancy asked for this explicitly, 2026-08-03): overlay-interrupt ONLY. Games
 * that already carry a persistent instructions panel (save-the-pod's side panel) KEEP it -- the
 * overlay answers "what is this and what do I do first", the panel answers "what was that key
 * again" mid-play. They are different jobs, so no game is converted away from a working panel,
 * and no embedded/sidebar render mode is added to this component. One shape, one purpose.
 *
 * Dependencies: none. Vanilla DOM, self-contained CSS, no build step.
 * CLAUDE.md rule 5 / HEUR-008: uses position:absolute (never fixed), matching the shipped
 * ArcadeScoreModal pattern, so a body filter on a host wrapper cannot break it.
 */
const GameBriefing = (function () {
    'use strict';

    let _cssInjected = false;
    let _config = null;

    function _injectCSS(accent) {
        if (_cssInjected) return;
        _cssInjected = true;
        const style = document.createElement('style');
        style.id = 'game-briefing-css';
        style.textContent = `
            .gbf-overlay {
                /* NANCY 2026-08-03: match ArcadeScoreModal's shipped pattern -- absolute +
                   inset + high z-index, never position:fixed. Defensive against CLAUDE.md
                   rule 5 / HEUR-008 (fixed breaks under a body filter) even though no cloud
                   game currently sets one; a tenant wrapper embedding a game in dashboard
                   chrome would make it live. min-height covers short-body games. */
                position: absolute; inset: 0; min-height: 100vh; z-index: 30000;
                background: rgba(5, 9, 18, 0.955);
                overflow-y: auto; padding: 28px 16px;
                font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                animation: gbfFade .22s ease;
            }
            @keyframes gbfFade { from { opacity: 0 } to { opacity: 1 } }
            .gbf-card {
                max-width: 720px; margin: 0 auto;
                background: linear-gradient(160deg, #111a2c 0%, #0d1523 100%);
                border: 1px solid var(--gbf-accent, ${accent});
                border-radius: 14px; padding: 26px 26px 22px;
                color: #dce8f6; line-height: 1.62;
                box-shadow: 0 10px 44px rgba(0, 0, 0, .55), 0 0 0 1px rgba(255,255,255,.03) inset;
            }
            .gbf-card h2 {
                color: var(--gbf-accent, ${accent}); font-size: 21px;
                margin: 0 0 6px; letter-spacing: .01em;
            }
            .gbf-kicker { color: #7f93ab; font-size: 12px; text-transform: uppercase;
                          letter-spacing: .12em; margin-bottom: 16px; }
            .gbf-block { margin-bottom: 15px; font-size: 15px; }
            .gbf-role {
                border-left: 4px solid var(--gbf-accent, ${accent});
                background: rgba(255, 255, 255, .04);
                padding: 11px 15px; border-radius: 0 9px 9px 0; margin-bottom: 15px;
            }
            .gbf-goal { color: #f4f8ff; }
            .gbf-goal strong, .gbf-role strong { color: var(--gbf-accent, ${accent}); }
            .gbf-h3 { color: #a9c4de; font-size: 13px; text-transform: uppercase;
                      letter-spacing: .1em; margin: 18px 0 8px; }
            .gbf-steps { list-style: none; padding: 0; margin: 0 0 15px; }
            .gbf-steps li {
                background: rgba(255, 255, 255, .035);
                border-left: 3px solid var(--gbf-accent, ${accent});
                padding: 9px 14px; border-radius: 0 8px 8px 0;
                margin-bottom: 7px; font-size: 14.5px;
            }
            .gbf-steps li strong { color: var(--gbf-accent, ${accent}); }
            .gbf-why { color: #9fb4c8; font-size: 14px; font-style: italic; }
            .gbf-help { color: #9fb4c8; font-size: 13.5px; margin-top: 12px; }
            .gbf-actions { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
            .gbf-btn {
                background: var(--gbf-accent, ${accent}); color: #04121d;
                border: none; border-radius: 8px; padding: 11px 26px;
                font-size: 15px; font-weight: 700; cursor: pointer;
                font-family: inherit; transition: filter .18s ease;
            }
            .gbf-btn:hover { filter: brightness(1.12); }
            .gbf-reopen {
                position: absolute; right: 14px; bottom: 14px; z-index: 9000;
                background: rgba(10, 18, 30, .92); color: var(--gbf-accent, ${accent});
                border: 1px solid var(--gbf-accent, ${accent}); border-radius: 20px;
                padding: 7px 15px; font-size: 12.5px; cursor: pointer;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .gbf-reopen:hover { background: rgba(20, 34, 52, .96); }
            @media (max-width: 620px) {
                .gbf-card { padding: 20px 17px; }
                .gbf-card h2 { font-size: 18px; }
                .gbf-block, .gbf-steps li { font-size: 14px; }
                .gbf-reopen { right: 10px; bottom: 10px; font-size: 11.5px; }
            }
        `;
        document.head.appendChild(style);
    }

    // Text-only rendering: every field is inserted with textContent, never innerHTML, because
    // briefing copy is authored per game and must never become an injection surface.
    function _line(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text != null) n.textContent = String(text);
        return n;
    }

    function show() {
        if (!_config || document.getElementById('gbfOverlay')) return;
        _injectCSS(_config.accent || '#22d3ee');

        const overlay = document.createElement('div');
        overlay.className = 'gbf-overlay';
        overlay.id = 'gbfOverlay';
        overlay.style.setProperty('--gbf-accent', _config.accent || '#22d3ee');

        const card = _line('div', 'gbf-card');
        card.appendChild(_line('h2', null, _config.title || 'How to play'));
        card.appendChild(_line('div', 'gbf-kicker', 'Briefing'));

        if (_config.role) card.appendChild(_line('div', 'gbf-role', _config.role));
        if (_config.goal) card.appendChild(_line('div', 'gbf-block gbf-goal', _config.goal));

        if (Array.isArray(_config.howto) && _config.howto.length) {
            card.appendChild(_line('div', 'gbf-h3', 'How to play'));
            const ul = _line('ul', 'gbf-steps');
            _config.howto.forEach(function (step) { ul.appendChild(_line('li', null, step)); });
            card.appendChild(ul);
        }

        if (_config.why) card.appendChild(_line('div', 'gbf-why', _config.why));
        if (_config.help) card.appendChild(_line('div', 'gbf-help', _config.help));

        const actions = _line('div', 'gbf-actions');
        const start = _line('button', 'gbf-btn', _config.startLabel || 'Start');
        start.type = 'button';
        start.addEventListener('click', hide);
        actions.appendChild(start);
        card.appendChild(actions);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
        start.focus();

        // ESC dismisses too -- a modal with only one exit is a trap on a keyboard-driven game.
        document.addEventListener('keydown', _escHandler);
    }

    function _escHandler(e) {
        if (e.key === 'Escape') hide();
    }

    function hide() {
        const o = document.getElementById('gbfOverlay');
        if (o) o.remove();
        document.removeEventListener('keydown', _escHandler);
        try { localStorage.setItem('gbf_seen_' + _config.key, 'true'); } catch (err) { /* private mode */ }
    }

    function _addReopen() {
        if (document.getElementById('gbfReopen')) return;
        const btn = _line('button', 'gbf-reopen', 'How to Play');
        btn.id = 'gbfReopen';
        btn.type = 'button';
        btn.style.setProperty('--gbf-accent', _config.accent || '#22d3ee');
        btn.addEventListener('click', show);
        document.body.appendChild(btn);
    }

    function init(config) {
        if (!config || !config.key) return;
        _config = config;
        var start = function () {
            _injectCSS(config.accent || '#22d3ee');
            _addReopen();
            var seen = false;
            try { seen = localStorage.getItem('gbf_seen_' + config.key) === 'true'; } catch (e) { /* private mode */ }
            if (!seen) show();
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    }

    return { init: init, show: show, hide: hide };
})();

if (typeof window !== 'undefined') { window.GameBriefing = GameBriefing; }
