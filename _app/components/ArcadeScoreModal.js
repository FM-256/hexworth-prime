/**
 * ArcadeScoreModal.js - Global Game Scoreboard Modal
 *
 * Self-contained component that shows per-game scoreboards:
 * - Global Top 10 (from Firestore via FirestoreManager)
 * - Your Top 5 (from GameTracker localStorage)
 *
 * Usage:
 *   ArcadeScoreModal.show('brick', "Don't Brick the PC", 'houses/forge/games/dont-brick-the-pc.html');
 */
const ArcadeScoreModal = (function () {
    'use strict';

    let _styleInjected = false;

    const MEDAL = { 1: '\uD83E\uDD47', 2: '\uD83E\uDD48', 3: '\uD83E\uDD49' }; // gold, silver, bronze

    function _injectCSS() {
        if (_styleInjected) return;
        _styleInjected = true;

        const style = document.createElement('style');
        style.textContent = `
            .asm-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.75);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: asmFadeIn 0.2s ease-out;
            }
            @keyframes asmFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .asm-modal {
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 16px;
                width: 90%;
                max-width: 520px;
                max-height: 85vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                animation: asmSlideUp 0.25s ease-out;
            }
            @keyframes asmSlideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .asm-header {
                padding: 1.25rem 1.5rem;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .asm-header h2 {
                font-size: 1.15rem;
                color: #e5e5e5;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .asm-close {
                background: none;
                border: none;
                color: #8a8a8a;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            .asm-close:hover { color: #e5e5e5; }
            .asm-section {
                padding: 1rem 1.5rem;
            }
            .asm-section-title {
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: #9ca3af;
                margin-bottom: 0.75rem;
                font-weight: 600;
            }
            .asm-row {
                display: flex;
                align-items: center;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                margin-bottom: 0.25rem;
                gap: 0.75rem;
                font-size: 0.95rem;
            }
            .asm-row:hover { background: rgba(255,255,255,0.03); }
            .asm-row.asm-you {
                background: rgba(96, 165, 250, 0.1);
                border: 1px solid rgba(96, 165, 250, 0.25);
            }
            .asm-rank {
                width: 2rem;
                text-align: center;
                font-weight: 700;
                color: #8a8a8a;
                flex-shrink: 0;
            }
            .asm-rank-medal { font-size: 1.2rem; }
            .asm-callsign {
                flex: 1;
                color: #e5e5e5;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .asm-you-badge {
                font-size: 0.7rem;
                background: #60a5fa;
                color: #0a0a0a;
                padding: 0.1rem 0.4rem;
                border-radius: 4px;
                font-weight: 700;
                margin-left: 0.5rem;
                flex-shrink: 0;
            }
            .asm-score {
                font-weight: 700;
                color: #fbbf24;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }
            .asm-empty {
                text-align: center;
                color: #8a8a8a;
                padding: 1.5rem 0;
                font-size: 0.9rem;
            }
            .asm-divider {
                border: none;
                border-top: 1px solid #282828;
                margin: 0;
            }
            .asm-footer {
                padding: 1rem 1.5rem;
                border-top: 1px solid #333;
                text-align: center;
            }
            .asm-play-btn {
                display: inline-block;
                padding: 0.6rem 2rem;
                background: #60a5fa;
                color: #0a0a0a;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.95rem;
                cursor: pointer;
                transition: background 0.2s;
                text-decoration: none;
            }
            .asm-play-btn:hover { background: #93c5fd; }
        `;
        document.head.appendChild(style);
    }

    function _formatScore(n) {
        return Number(n).toLocaleString();
    }

    function _renderRank(rank) {
        if (MEDAL[rank]) {
            return `<span class="asm-rank asm-rank-medal">${MEDAL[rank]}</span>`;
        }
        return `<span class="asm-rank">#${rank}</span>`;
    }

    /**
     * Show the scoreboard modal for a game.
     * @param {string} gameId - GameTracker registry key
     * @param {string} gameTitle - Display title
     * @param {string} gameHref - Link to game page
     */
    async function show(gameId, gameTitle, gameHref) {
        _injectCSS();

        // Get current user UID for highlighting
        let currentUid = null;
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser()) {
            currentUid = FirebaseAuth.getUser().uid;
        }

        // Build modal structure
        const overlay = document.createElement('div');
        overlay.className = 'asm-overlay';

        const modal = document.createElement('div');
        modal.className = 'asm-modal';

        // Header
        modal.innerHTML = `
            <div class="asm-header">
                <h2>\uD83C\uDFC6 ${_escapeHtml(gameTitle)}</h2>
                <button class="asm-close" aria-label="Close">&times;</button>
            </div>
            <div class="asm-section" id="asm-global">
                <div class="asm-section-title">\uD83C\uDF0E Global Top 10</div>
                <div class="asm-empty">Loading...</div>
            </div>
            <hr class="asm-divider">
            <div class="asm-section" id="asm-local">
                <div class="asm-section-title">\uD83D\uDCBB Your Top 5 (Local)</div>
            </div>
            <div class="asm-footer">
                <a href="${_escapeHtml(gameHref)}" class="asm-play-btn">\u25B6 Play</a>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Close handlers
        const close = () => overlay.remove();
        modal.querySelector('.asm-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });
        const escHandler = (e) => {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
        };
        document.addEventListener('keydown', escHandler);

        // Render local scores immediately
        const localSection = modal.querySelector('#asm-local');
        _renderLocalScores(localSection, gameId);

        // Fetch and render global scores
        _renderGlobalScores(modal.querySelector('#asm-global'), gameId, currentUid);
    }

    function _renderLocalScores(container, gameId) {
        let scores = [];
        if (typeof GameTracker !== 'undefined') {
            scores = GameTracker.getTopScores(gameId);
        }

        if (scores.length === 0) {
            container.innerHTML += '<div class="asm-empty">No local scores yet. Play to set a record!</div>';
            return;
        }

        scores.forEach((entry, idx) => {
            const rank = idx + 1;
            const name = entry.name || 'You';
            const row = document.createElement('div');
            row.className = 'asm-row';
            row.innerHTML = `
                ${_renderRank(rank)}
                <span class="asm-callsign">${_escapeHtml(name)}</span>
                <span class="asm-score">${_formatScore(entry.score)}</span>
            `;
            container.appendChild(row);
        });
    }

    async function _renderGlobalScores(container, gameId, currentUid) {
        let board = null;

        if (typeof FirestoreManager !== 'undefined' && FirestoreManager.getGameScoreboard) {
            board = await FirestoreManager.getGameScoreboard(gameId);
        }

        // Clear loading state
        const existing = container.querySelector('.asm-empty');
        if (existing) existing.remove();

        if (!board || !board.topScores || board.topScores.length === 0) {
            container.innerHTML += '<div class="asm-empty">No global scores yet. Be the first!</div>';
            return;
        }

        board.topScores.forEach((entry, idx) => {
            const rank = idx + 1;
            const isYou = currentUid && entry.uid === currentUid;
            const row = document.createElement('div');
            row.className = 'asm-row' + (isYou ? ' asm-you' : '');
            row.innerHTML = `
                ${_renderRank(rank)}
                <span class="asm-callsign">
                    ${_escapeHtml(entry.callsign || 'Anonymous')}
                    ${isYou ? '<span class="asm-you-badge">YOU</span>' : ''}
                </span>
                <span class="asm-score">${_formatScore(entry.score)}</span>
            `;
            container.appendChild(row);
        });
    }

    function _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { show };
})();
