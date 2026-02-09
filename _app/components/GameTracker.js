/**
 * GameTracker.js - Central survival game statistics tracker
 *
 * Tracks play history, wins/losses, best times, and per-game stats
 * across all "Don't..." survival games in Hexworth Prime.
 *
 * Usage from any game's endGame():
 *   GameTracker.record('brick', {
 *       result: 'success',          // 'success', 'timeout', 'failure', etc.
 *       timeElapsed: 45,            // seconds played
 *       commandsUsed: 12,           // total commands entered
 *       achievementsEarned: 5,      // in-game achievements this run
 *       achievementsTotal: 12       // total in-game achievements unlocked ever
 *   });
 */
const GameTracker = (function () {

    const STORAGE_KEY = 'hexworth_game_tracker';

    const GAME_REGISTRY = {
        domain:  { title: "Don't Lose Your Domain",   house: 'cloud',  icon: '☁️' },
        brick:   { title: "Don't Brick the PC",       house: 'forge',  icon: '🔨' },
        phished: { title: "Don't Get Phished",        house: 'shield', icon: '🛡️' },
        server:  { title: "Don't Kill the Server",    house: 'script', icon: '☠️' },
        packet:  { title: "Don't Drop the Packet",    house: 'web',    icon: '🕸️' },
        deploy:  { title: "Don't Deploy on Friday",   house: 'code',   icon: '💻' },
        troll:   { title: "Don't Feed the Troll",     house: 'eye',    icon: '👁️' },
        key:     { title: "Don't Leak the Key",       house: 'key',    icon: '🔑' },
        bill:    { title: "Don't Check the Bill",     house: 'cloud',  icon: '☁️' },
        printer: { title: "Don't Anger the Printer",  house: 'forge',  icon: '🔨' },
    };

    // ── persistence ──────────────────────────────────────────────

    function _load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }

    function _save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // ── public API ───────────────────────────────────────────────

    /**
     * Record a game session result.
     * @param {string} gameId  - registry key (e.g. 'brick', 'deploy')
     * @param {object} details - { result, timeElapsed, commandsUsed, achievementsEarned, achievementsTotal }
     */
    function record(gameId, details) {
        if (!GAME_REGISTRY[gameId]) {
            console.warn('[GameTracker] Unknown gameId:', gameId);
            return;
        }

        const data = _load();

        // Ensure game entry exists
        if (!data[gameId]) {
            data[gameId] = {
                plays: 0,
                wins: 0,
                losses: 0,
                bestTime: null,            // fastest win in seconds
                worstEnding: null,          // funniest/worst ending type
                totalCommands: 0,
                maxAchievements: 0,         // best in-game achievement count in single run
                totalAchievementsUnlocked: 0,
                firstPlayed: null,
                lastPlayed: null,
                history: []                 // last 10 sessions
            };
        }

        const entry = data[gameId];
        const now = Date.now();
        const isWin = details.result === 'success';

        entry.plays++;
        if (isWin) entry.wins++;
        else entry.losses++;

        if (isWin && details.timeElapsed != null) {
            if (entry.bestTime === null || details.timeElapsed < entry.bestTime) {
                entry.bestTime = details.timeElapsed;
            }
        }

        if (!isWin && details.result) {
            entry.worstEnding = details.result;
        }

        if (details.commandsUsed != null) {
            entry.totalCommands += details.commandsUsed;
        }

        if (details.achievementsEarned != null && details.achievementsEarned > entry.maxAchievements) {
            entry.maxAchievements = details.achievementsEarned;
        }

        if (details.achievementsTotal != null) {
            entry.totalAchievementsUnlocked = details.achievementsTotal;
        }

        if (!entry.firstPlayed) entry.firstPlayed = now;
        entry.lastPlayed = now;

        // Keep last 10 session records
        entry.history.push({
            result: details.result,
            time: details.timeElapsed,
            commands: details.commandsUsed,
            achievements: details.achievementsEarned,
            date: now
        });
        if (entry.history.length > 10) entry.history.shift();

        // Update aggregate stats
        data._aggregate = _computeAggregate(data);

        _save(data);

        // Fire custom event for any listeners (dashboard, etc.)
        window.dispatchEvent(new CustomEvent('hexworth:gameRecorded', {
            detail: { gameId, ...details, aggregate: data._aggregate }
        }));
    }

    /**
     * Get stats for a specific game.
     * @param {string} gameId
     * @returns {object|null}
     */
    function getGameStats(gameId) {
        const data = _load();
        if (!data[gameId]) return null;
        return {
            ...data[gameId],
            ...GAME_REGISTRY[gameId],
            winRate: data[gameId].plays > 0
                ? Math.round((data[gameId].wins / data[gameId].plays) * 100)
                : 0
        };
    }

    /**
     * Get stats for all games.
     * @returns {object} keyed by gameId
     */
    function getAllStats() {
        const data = _load();
        const result = {};
        for (const [id, meta] of Object.entries(GAME_REGISTRY)) {
            result[id] = data[id]
                ? { ...data[id], ...meta, winRate: data[id].plays > 0 ? Math.round((data[id].wins / data[id].plays) * 100) : 0 }
                : { ...meta, plays: 0, wins: 0, losses: 0, bestTime: null, winRate: 0 };
        }
        return result;
    }

    /**
     * Get aggregate stats across all games.
     * @returns {object}
     */
    function getAggregate() {
        const data = _load();
        return data._aggregate || _computeAggregate(data);
    }

    /**
     * Get the game registry (titles, houses, icons).
     * @returns {object}
     */
    function getRegistry() {
        return { ...GAME_REGISTRY };
    }

    /**
     * Get list of games the player has won at least once.
     * @returns {string[]} array of gameIds
     */
    function getGamesWon() {
        const data = _load();
        return Object.keys(GAME_REGISTRY).filter(id => data[id] && data[id].wins > 0);
    }

    /**
     * Get list of games not yet played.
     * @returns {string[]} array of gameIds
     */
    function getGamesUnplayed() {
        const data = _load();
        return Object.keys(GAME_REGISTRY).filter(id => !data[id] || data[id].plays === 0);
    }

    /**
     * Check if player has won all games (for master badge).
     * @returns {boolean}
     */
    function hasWonAll() {
        return getGamesWon().length === Object.keys(GAME_REGISTRY).length;
    }

    /**
     * Clear all tracking data.
     */
    function reset() {
        localStorage.removeItem(STORAGE_KEY);
    }

    // ── internal ─────────────────────────────────────────────────

    function _computeAggregate(data) {
        let totalPlays = 0, totalWins = 0, totalLosses = 0;
        let totalCommands = 0, gamesPlayed = 0, gamesWon = 0;
        let fastestWin = null, fastestWinGame = null;

        for (const id of Object.keys(GAME_REGISTRY)) {
            const g = data[id];
            if (!g) continue;

            if (g.plays > 0) gamesPlayed++;
            if (g.wins > 0) gamesWon++;

            totalPlays += g.plays;
            totalWins += g.wins;
            totalLosses += g.losses;
            totalCommands += g.totalCommands;

            if (g.bestTime !== null && (fastestWin === null || g.bestTime < fastestWin)) {
                fastestWin = g.bestTime;
                fastestWinGame = id;
            }
        }

        return {
            totalGames: Object.keys(GAME_REGISTRY).length,
            gamesPlayed,
            gamesWon,
            gamesRemaining: Object.keys(GAME_REGISTRY).length - gamesWon,
            totalPlays,
            totalWins,
            totalLosses,
            overallWinRate: totalPlays > 0 ? Math.round((totalWins / totalPlays) * 100) : 0,
            totalCommands,
            fastestWin,
            fastestWinGame,
            allComplete: gamesWon === Object.keys(GAME_REGISTRY).length
        };
    }

    // ── format helpers (for display) ─────────────────────────────

    /**
     * Format seconds as M:SS string.
     * @param {number} seconds
     * @returns {string}
     */
    function formatTime(seconds) {
        if (seconds == null) return '--:--';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    return {
        record,
        getGameStats,
        getAllStats,
        getAggregate,
        getRegistry,
        getGamesWon,
        getGamesUnplayed,
        hasWonAll,
        reset,
        formatTime,
        GAME_REGISTRY
    };

})();
