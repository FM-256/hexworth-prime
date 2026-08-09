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
        // "Don't..." survival games
        // Fleet sweep 2026-08-02: these three recorded with ids absent from the registry,
        // so record() warned 'Unknown gameId' and DISCARDED every play (aws-sts even rendered
        // a permanently empty leaderboard via GameScoreboard's regex auto-detect).
        'aws_sts': { title: "STS: Incident Response", house: 'cloud', icon: '<img src="/assets/images/icons/icon-cloud.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        'apifoundations': { title: "API Foundations Lab", house: 'cloud', icon: '<img src="/assets/images/icons/icon-cloud.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        'ta-whoami': { title: "Who Am I? (IAM)", house: 'cloud', icon: '<img src="/assets/images/icons/icon-cloud.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        'the-nines': { title: "The Nines", house: 'cloud', icon: '<img src="/assets/images/icons/icon-cloud.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        'cold-horizon': { title: "Lagrange Edge: Line of Sight", house: 'cloud', icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        'save-the-pod': { title: "Pod Crossing", house: 'cloud', icon: '<img src="/assets/images/icons/icon-cloud.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        domain:  { title: "Don't Lose Your Domain",   house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        brick:   { title: "Don't Brick the PC",       house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        phished: { title: "Don't Get Phished",        house: 'shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        server:  { title: "Don't Kill the Server",    house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        packet:  { title: "Don't Drop the Packet",    house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        deploy:  { title: "Don't Deploy on Friday",   house: 'code',   icon: '<img src="/assets/images/icons/icon-laptop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        troll:   { title: "Don't Feed the Troll",     house: 'eye',    icon: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        key:     { title: "Don't Leak the Key",       house: 'key',    icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        bill:    { title: "Don't Check the Bill",     house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        printer: { title: "Don't Anger the Printer",  house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        sqli:    { title: "SQL Injection Defense",    house: 'shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        // Score-based games
        adpath:       { title: "AD Attack Path",       house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        firewall:     { title: "Firewall Builder",     house: 'key',    icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        iam:          { title: "IAM Debugger",          house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        cron:         { title: "Cron Builder",          house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        timeline:     { title: "Incident Timeline",    house: 'eye',    icon: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        patch:        { title: "Patch Tuesday",         house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        'threat-modeler': { title: "STRIDE Threat Modeler", house: 'eye', icon: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        backup:       { title: "Backup or Bust",       house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        memforensics: { title: "Memory Forensics",     house: 'eye',    icon: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        docker:       { title: "Docker Escape",        house: 'code',   icon: '<img src="/assets/images/icons/icon-laptop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        cloudarch:    { title: "Cloud Architect",       house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        k8s:          { title: "Kubernetes Rescue",     house: 'code',   icon: '<img src="/assets/images/icons/icon-laptop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        api:          { title: "API Interceptor",       house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        netarchitect: { title: "Network Architect",     house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        wireless:     { title: "Wireless Warzone",      house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        packetsniffer: { title: "Packet Sniffer",       house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        packetinvaders: { title: "Packet Invaders",    house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        malware:      { title: "Malware Zoo",           house: 'shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        raid:         { title: "RAID Calculator",       house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        // Arcade games
        threatswarm:  { title: "Threat Swarm",          house: 'shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        cryptopong:   { title: "Crypto Pong",           house: 'key',    icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        buildbreaker: { title: "Build Breaker",         house: 'code',   icon: '<img src="/assets/images/icons/icon-laptop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        clouddestroyer: { title: "Cloud Destroyer",     house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        cloudhop:     { title: "Cloud Hop",             house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        'cloudhop-vertical': { title: "Cloud Hop: Vertical", house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        threatrunner: { title: "Threat Runner",         house: 'shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        packetrun:    { title: "Packet Run",            house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        pipesnake:    { title: "Pipe Snake",            house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        logcentipede: { title: "Log Centipede",         house: 'eye',    icon: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        bitdash:      { title: "Bit Dash",              house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        chipmatch:    { title: "Chip Match",            house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        rackstack:    { title: "Rack Stack",            house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        cipherbubbles: { title: "Cipher Bubbles",       house: 'key',    icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        // Flappy games
        flappy_cloud:  { title: "Cloud Flap",             house: 'cloud',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        flappy_packet: { title: "Packet Flap",            house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        flappy_exploit: { title: "Exploit Flap",          house: 'shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        flappy_crypto: { title: "Crypto Flap",            house: 'key',    icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        flappy_sudo:   { title: "Sudo Flap",              house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        // Review/quiz games
        regexrunner:  { title: "Regex Runner",          house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        permission:   { title: "Permission Puzzle",     house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        terminalv:    { title: "Terminal Velocity",     house: 'script', icon: '<img src="/assets/images/icons/icon-skull-crossbones.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        dnsrace:      { title: "DNS Resolver Race",     house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        subnets:      { title: "Subnet Siege",          house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        protostack:   { title: "Protocol Stack",        house: 'web',    icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        binaryblitz:  { title: "Binary Blitz",          house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        hashcracker:  { title: "Hash Cracker",          house: 'key',    icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        logdetective: { title: "Log Detective",         house: 'eye',    icon: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        pipeline:     { title: "Pipeline Panic",        house: 'code',   icon: '<img src="/assets/images/icons/icon-laptop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        gitbisect:    { title: "Git Bisect",            house: 'code',   icon: '<img src="/assets/images/icons/icon-laptop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        ciphercracker: { title: "Cipher Cracker",       house: 'key',    icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        fsck:         { title: "FSCK",                  house: 'forge',  icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">' },
        contra:       { title: "Network Assault",         house: 'shield', icon: '<img src="/assets/images/icons/icon-explosion.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
        threatdex:    { title: "ThreatDex",               house: 'shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">' },
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

    /**
     * Award tiered XP for top-5 game score placements.
     * #1: 1000 XP, #2: 750 XP, #3: 500 XP, #4: 250 XP, #5: 100 XP
     * Bridges directly to hexworth_progress localStorage.
     */
    const RANK_XP = { 1: 1000, 2: 750, 3: 500, 4: 250, 5: 100 };

    function _awardHighScoreXP(gameId, score, rank) {
        const xpReward = RANK_XP[rank];
        if (!xpReward) return;
        try {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            progress.xp = (progress.xp || 0) + xpReward;
            _recalcLevel(progress);
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
            console.log(`<img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> ${gameId}: rank #${rank} (${score})! +${xpReward} XP (total: ${progress.xp})`);
        } catch (e) { /* silent */ }
    }

    // ── Level helper (shared, uncapped) ─────────────────────────────
    function _recalcLevel(progress) {
        // Quadratic formula inverse: N = floor((1 + sqrt(1 + xp/12.5)) / 2)
        const xp = progress.xp || 0;
        if (xp <= 0) { progress.level = 1; return; }
        progress.level = Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
    }

    // ═══════════════════════════════════════════════════════════════
    // SCORE REIGN SYSTEM
    // Hold #1 in a game → earn compounding passive XP over time.
    // 5% daily compound on a 25 XP base, capped at 500 XP/day, max 90 days.
    // XP is collected on next visit (dashboard load, game play, etc.).
    // Reign ends if you play and don't place in top 5.
    // ═══════════════════════════════════════════════════════════════

    const REIGN = {
        BASE_XP: 25,         // Base XP per day holding #1
        RATE: 0.05,          // 5% daily compound
        MAX_PER_DAY: 500,    // Cap per day
        MAX_DAYS: 90          // Max compounding period per reign
    };

    /**
     * Start or renew a reign for a game.
     * Called when a new #1 high score is set.
     * If already reigning, resets the 90-day clock (rewards improvement).
     */
    function _startReign(data, gameId) {
        if (!data[gameId]) return;
        data[gameId].reign = {
            active: true,
            startDate: new Date().toISOString(),
            lastPaidDay: 0,
            totalPaid: (data[gameId].reign ? data[gameId].reign.totalPaid : 0) || 0
        };
    }

    /**
     * End a reign for a game.
     * Called when you play but don't place in top 5.
     */
    function _endReign(data, gameId) {
        if (data[gameId] && data[gameId].reign) {
            data[gameId].reign.active = false;
        }
    }

    /**
     * Collect all pending reign XP across all games.
     * Should be called on dashboard load, game start, etc.
     * @returns {{ totalXP: number, reigns: Array<{gameId, days, earned}> }}
     */
    function collectReigns() {
        const data = _load();
        const now = new Date();
        let totalXP = 0;
        const reigns = [];

        for (const [gameId, entry] of Object.entries(data)) {
            if (gameId === '_aggregate' || !entry || !entry.reign || !entry.reign.active) continue;

            const start = new Date(entry.reign.startDate);
            const daysSinceStart = Math.floor((now - start) / 86400000);
            const payableDays = Math.min(daysSinceStart, REIGN.MAX_DAYS);

            if (payableDays <= entry.reign.lastPaidDay) continue;

            let earned = 0;
            for (let day = entry.reign.lastPaidDay + 1; day <= payableDays; day++) {
                const dayXP = Math.min(
                    Math.round(REIGN.BASE_XP * Math.pow(1 + REIGN.RATE, day)),
                    REIGN.MAX_PER_DAY
                );
                earned += dayXP;
            }

            if (earned > 0) {
                entry.reign.lastPaidDay = payableDays;
                entry.reign.totalPaid = (entry.reign.totalPaid || 0) + earned;
                totalXP += earned;
                reigns.push({ gameId, days: payableDays, earned });
            }
        }

        if (totalXP > 0) {
            _save(data);
            // Bridge XP to progress
            try {
                const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
                progress.xp = (progress.xp || 0) + totalXP;
                _recalcLevel(progress);
                localStorage.setItem('hexworth_progress', JSON.stringify(progress));
                console.log(`<img src="/assets/images/icons/icon-crown.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Score Reign: collected ${totalXP} XP from ${reigns.length} active reign(s)`);
                reigns.forEach(r => console.log(`   ${r.gameId}: ${r.days} days → +${r.earned} XP`));
            } catch (e) { /* silent */ }
        }

        return { totalXP, reigns };
    }

    // ── cloud scoreboard submission ─────────────────────────────

    /**
     * Submit score to global scoreboard via FirestoreManager.
     * Fire-and-forget: non-blocking, fail-silent.
     * Skips if user is not authenticated.
     */
    function _submitToCloud(gameId, score, sessionDuration) {
        try {
            // Skip if not authenticated
            if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.getUser()) return;
            if (typeof FirestoreManager === 'undefined' || !FirestoreManager.submitGameScore) return;

            FirestoreManager.submitGameScore(gameId, score, { sessionDuration })
                .then(result => {
                    if (result && result.qualified) {
                        window.dispatchEvent(new CustomEvent('hexworth:globalHighScore', {
                            detail: { gameId, score, rank: result.rank }
                        }));
                    }
                })
                .catch(() => { /* silent */ });
        } catch (e) { /* silent */ }
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
            score: details.score != null ? details.score : undefined,
            date: now
        });
        if (entry.history.length > 10) entry.history.shift();

        // ── Top 5 high scores ──────────────────────────────────────
        let isNewHighScore = false;
        let highScoreRank = null;

        if (details.score != null) {
            if (!Array.isArray(entry.topScores)) entry.topScores = [];

            var _name = localStorage.getItem('hexworth_display_name')
                || localStorage.getItem('hexworth_username') || '';
            if (!_name) {
                try { var _fb = JSON.parse(localStorage.getItem('hexworth_firebase_user'));
                    if (_fb && _fb.displayName) _name = _fb.displayName;
                } catch(e) {}
            }
            entry.topScores.push({ score: details.score, date: now, name: _name });
            entry.topScores.sort((a, b) => b.score - a.score);
            entry.topScores = entry.topScores.slice(0, 5);

            // Determine rank (1-based) of the score we just pushed
            const rank = entry.topScores.findIndex(s => s.score === details.score && s.date === now);
            if (rank !== -1) {
                highScoreRank = rank + 1;
                isNewHighScore = highScoreRank === 1;
            }
        }

        // Update aggregate stats
        data._aggregate = _computeAggregate(data);

        _save(data);

        // Fire custom event for any listeners (dashboard, etc.)
        window.dispatchEvent(new CustomEvent('hexworth:gameRecorded', {
            detail: { gameId, ...details, aggregate: data._aggregate }
        }));

        // Fire high score event when a new score enters top 3
        if (highScoreRank != null) {
            window.dispatchEvent(new CustomEvent('hexworth:newHighScore', {
                detail: { gameId, score: details.score, rank: highScoreRank }
            }));
        }

        // Award tiered XP for top 5 placements
        if (highScoreRank != null) {
            _awardHighScoreXP(gameId, details.score, highScoreRank);
        }

        // Score Reign — start/renew reign on new #1
        if (isNewHighScore) {
            const reignData = _load();
            _startReign(reignData, gameId);
            _save(reignData);
        }

        // Cloud scoreboard — submit when score exists and placed in local top 5
        if (highScoreRank != null && details.score != null) {
            _submitToCloud(gameId, details.score, details.timeElapsed || 0);
        }
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
     * Get top 5 high scores for a game.
     * @param {string} gameId
     * @returns {Array<{score: number, date: number}>}
     */
    function getTopScores(gameId) {
        const data = _load();
        return (data[gameId] && Array.isArray(data[gameId].topScores))
            ? data[gameId].topScores
            : [];
    }

    /**
     * Get the highest score for a game.
     * @param {string} gameId
     * @returns {number|null}
     */
    function getHighScore(gameId) {
        const scores = getTopScores(gameId);
        return scores.length > 0 ? scores[0].score : null;
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

    // One-time wipe of pre-name scores (v2 migration)
    if (!localStorage.getItem('hexworth_gt_v2')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem('hexworth_gt_v2', '1');
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
        getTopScores,
        getHighScore,
        collectReigns,
        reset,
        formatTime,
        GAME_REGISTRY
    };

})();
