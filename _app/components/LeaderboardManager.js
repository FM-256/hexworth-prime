/**
 * LeaderboardManager.js - Hybrid Real/Simulated Leaderboard
 *
 * Creates a dynamic leaderboard that blends real authenticated users
 * with simulated phantom members for an engaging competitive experience.
 *
 * Features:
 * - Real player integration via GitHub/GistSync
 * - Phantom members that phase out as real players join
 * - "Nemesis" rival that stays competitive with the user
 * - Class/group leaderboard via shared Gist registry
 * - Top 15 display with current user position
 *
 * Strategy:
 * - Start with ~15 phantom members
 * - As real players join, replace phantoms 1:1
 * - Always keep 1-3 phantoms for competition feel
 * - Nemesis stays ~50-150 XP ahead, occasionally falls behind
 *
 * @requires HouseMembers.js
 * @requires GistSync.js
 * @requires GitHubAuth.js
 * @author Hexworth Prime
 * @version 1.0.0
 */

class LeaderboardManager {
    constructor(options = {}) {
        this.options = {
            house: options.house || 'web',
            maxDisplay: options.maxDisplay || 15,
            maxPhantoms: options.maxPhantoms || 15,
            minPhantoms: options.minPhantoms || 3,  // Always keep some for competition
            nemesisEnabled: options.nemesisEnabled !== false,
            registryGistId: options.registryGistId || null,  // Shared class roster
            ...options
        };

        // Storage keys
        this.storageKeys = {
            registry: 'hexworth_leaderboard_registry',
            lastSync: 'hexworth_leaderboard_sync',
            optedIn: 'hexworth_leaderboard_optin',
            nemesisState: 'hexworth_nemesis_state'
        };

        // Player pools
        this.realPlayers = [];
        this.phantomPlayers = [];
        this.nemesis = null;
        this.currentUser = null;

        // Dependencies (set via setDependencies)
        this.githubAuth = null;
        this.gistSync = null;
        this.houseMembers = null;
    }

    /**
     * Set dependencies after construction
     */
    setDependencies({ githubAuth, gistSync, houseMembers }) {
        this.githubAuth = githubAuth;
        this.gistSync = gistSync;
        this.houseMembers = houseMembers || new HouseMembers(this.options.house);
    }

    /**
     * Initialize the leaderboard
     */
    async init() {
        // Load current user data
        this.loadCurrentUser();

        // Generate nemesis
        if (this.options.nemesisEnabled) {
            this.initNemesis();
        }

        // Try to load real players from registry
        await this.loadRealPlayers();

        // Generate phantom players to fill gaps
        this.generatePhantoms();

        return this;
    }

    /**
     * Load current user from localStorage
     */
    loadCurrentUser() {
        const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
        const username = localStorage.getItem('hexworth_username');
        const avatar = localStorage.getItem('hexworth_avatar');
        const house = localStorage.getItem('hexworth_house') || 'web';

        // Calculate XP from progress
        let xp = 0;
        for (const [key, value] of Object.entries(progress)) {
            if (value === true || value === 'complete') {
                xp += 75;  // 75 XP per completed module
            } else if (typeof value === 'number') {
                xp += value;
            }
        }

        // Add streak bonus
        const streak = parseInt(localStorage.getItem('hexworth_streak') || '1');
        xp += streak * 10;

        // Add achievement points (discovery points from AchievementManager)
        const achievementPoints = parseInt(localStorage.getItem('hexworth_discovery_points') || '0');
        xp += achievementPoints;

        this.currentUser = {
            id: 'current_user',
            username: username || 'You',
            displayName: username || 'You',
            avatar: avatar || '🎯',
            xp: xp,
            house: house,
            isCurrentUser: true,
            isReal: true
        };

        return this.currentUser;
    }

    /**
     * Initialize the nemesis rival
     */
    initNemesis() {
        const stored = JSON.parse(localStorage.getItem(this.storageKeys.nemesisState) || 'null');
        const today = new Date().toDateString();

        if (stored && stored.date === today) {
            // Use stored nemesis state for consistency within the day
            this.nemesis = stored.nemesis;
        } else {
            // Generate new nemesis state
            this.generateNemesis();
        }
    }

    /**
     * Generate a new nemesis state
     */
    generateNemesis() {
        const houseThemes = {
            web: { prefix: 'Net', suffix: 'Phantom', color: '#60a5fa' },
            shield: { prefix: 'Shadow', suffix: 'Guardian', color: '#f87171' },
            cloud: { prefix: 'Cloud', suffix: 'Wraith', color: '#38bdf8' },
            forge: { prefix: 'Iron', suffix: 'Specter', color: '#fbbf24' },
            script: { prefix: 'Script', suffix: 'Ghost', color: '#a78bfa' },
            code: { prefix: 'Code', suffix: 'Shade', color: '#4ade80' },
            key: { prefix: 'Cipher', suffix: 'Shadow', color: '#f472b6' },
            eye: { prefix: 'Watch', suffix: 'Phantom', color: '#c084fc' },
            'dark-arts': { prefix: 'Void', suffix: 'Stalker', color: '#6b21a8' }
        };

        const theme = houseThemes[this.options.house] || houseThemes.web;
        const userXP = this.currentUser?.xp || 0;

        // Nemesis is 50-150 XP ahead, occasionally behind
        const aheadChance = 0.7;  // 70% chance to be ahead
        const isAhead = Math.random() < aheadChance;
        const gap = Math.floor(Math.random() * 100) + 50;
        const nemesisXP = isAhead ? userXP + gap : Math.max(0, userXP - gap / 2);

        this.nemesis = {
            id: 'nemesis',
            username: `${theme.prefix}${theme.suffix}_X`,
            displayName: `${theme.prefix}${theme.suffix}`,
            avatar: '👻',
            xp: nemesisXP,
            house: this.options.house,
            isNemesis: true,
            isReal: false,
            isAhead: isAhead,
            streak: Math.floor(Math.random() * 7) + 3
        };

        // Store for consistency
        localStorage.setItem(this.storageKeys.nemesisState, JSON.stringify({
            date: new Date().toDateString(),
            nemesis: this.nemesis
        }));

        return this.nemesis;
    }

    /**
     * Update nemesis based on user progress
     * Call this when user gains XP
     */
    updateNemesis(userXPGain = 0) {
        if (!this.nemesis) return;

        const userXP = this.currentUser.xp + userXPGain;

        // Nemesis also "gains" XP, but slower
        const nemesisGain = Math.floor(userXPGain * (0.3 + Math.random() * 0.5));
        this.nemesis.xp += nemesisGain;

        // Check if positions should swap (creates drama)
        const gap = this.nemesis.xp - userXP;

        if (gap > 200) {
            // Nemesis too far ahead, slow down
            this.nemesis.xp = userXP + 100 + Math.floor(Math.random() * 100);
        } else if (gap < -100) {
            // User too far ahead, nemesis catches up
            const catchUp = Math.floor(Math.random() * 50) + 25;
            this.nemesis.xp += catchUp;
        }

        // Occasionally let user overtake (satisfaction moment)
        if (this.nemesis.isAhead && Math.random() < 0.15) {
            this.nemesis.xp = userXP - 20;
            this.nemesis.isAhead = false;
        }

        // Save state
        localStorage.setItem(this.storageKeys.nemesisState, JSON.stringify({
            date: new Date().toDateString(),
            nemesis: this.nemesis
        }));
    }

    /**
     * Load real players from registry Gist
     */
    async loadRealPlayers() {
        this.realPlayers = [];

        // First, try to load from a class registry Gist
        if (this.options.registryGistId) {
            try {
                await this.loadFromRegistry(this.options.registryGistId);
            } catch (e) {
                console.log('Registry load failed:', e.message);
            }
        }

        // Also check local storage for any cached real players
        try {
            const cached = JSON.parse(localStorage.getItem(this.storageKeys.registry) || '[]');
            for (const player of cached) {
                if (!this.realPlayers.find(p => p.username === player.username)) {
                    this.realPlayers.push(player);
                }
            }
        } catch (e) {
            // Ignore
        }

        return this.realPlayers;
    }

    /**
     * Load players from a shared registry Gist
     */
    async loadFromRegistry(gistId) {
        const token = this.githubAuth?.getToken();
        const headers = token
            ? { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
            : { 'Accept': 'application/vnd.github.v3+json' };

        const response = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
        if (!response.ok) throw new Error('Could not load registry');

        const gist = await response.json();
        const registryFile = gist.files['hexworth-leaderboard.json'];
        if (!registryFile) throw new Error('Registry file not found');

        const registry = JSON.parse(registryFile.content);

        // Fetch each player's progress
        for (const entry of registry.players || []) {
            if (entry.progressGistId) {
                try {
                    const player = await this.loadPlayerFromGist(entry);
                    if (player) {
                        this.realPlayers.push(player);
                    }
                } catch (e) {
                    console.log(`Could not load player ${entry.username}:`, e.message);
                }
            }
        }

        // Cache locally
        localStorage.setItem(this.storageKeys.registry, JSON.stringify(this.realPlayers));
        localStorage.setItem(this.storageKeys.lastSync, Date.now().toString());
    }

    /**
     * Load a single player's data from their progress Gist
     */
    async loadPlayerFromGist(entry) {
        const response = await fetch(`https://api.github.com/gists/${entry.progressGistId}`);
        if (!response.ok) return null;

        const gist = await response.json();
        const progressFile = gist.files['hexworth-progress.json'];
        if (!progressFile) return null;

        const data = JSON.parse(progressFile.content);

        // Calculate XP
        let xp = 0;
        const progress = data.data?.hexworth_progress || {};
        for (const [key, value] of Object.entries(progress)) {
            if (value === true || value === 'complete') {
                xp += 75;
            } else if (typeof value === 'number') {
                xp += value;
            }
        }

        const streak = data.data?.hexworth_streak || 1;
        xp += streak * 10;

        return {
            id: entry.username,
            username: entry.username,
            displayName: entry.displayName || entry.username,
            avatar: `https://github.com/${entry.username}.png`,
            xp: xp,
            house: data.data?.hexworth_house || 'web',
            isReal: true,
            lastUpdated: data.exportedAt
        };
    }

    /**
     * Generate phantom players to fill the leaderboard
     */
    generatePhantoms() {
        const realCount = this.realPlayers.length;
        const targetPhantoms = Math.max(
            this.options.minPhantoms,
            this.options.maxPhantoms - realCount
        );

        // Use HouseMembers to generate phantoms
        if (!this.houseMembers) {
            this.houseMembers = new HouseMembers(this.options.house, {
                memberCount: targetPhantoms
            });
        }

        // Get phantoms and transform to our format
        const phantoms = this.houseMembers.getMembers().slice(0, targetPhantoms);

        this.phantomPlayers = phantoms.map(p => ({
            id: `phantom_${p.id}`,
            username: p.username,
            displayName: p.username,
            avatar: p.avatar,
            xp: p.xp,
            house: this.options.house,
            isReal: false,
            isOnline: p.isOnline,
            streak: p.streak
        }));

        return this.phantomPlayers;
    }

    /**
     * Get the complete leaderboard
     */
    getLeaderboard() {
        // Combine all players
        let allPlayers = [
            ...this.realPlayers,
            ...this.phantomPlayers
        ];

        // Add nemesis if enabled
        if (this.nemesis) {
            allPlayers.push(this.nemesis);
        }

        // Add current user
        if (this.currentUser) {
            // Remove any duplicate of current user
            allPlayers = allPlayers.filter(p =>
                p.username !== this.currentUser.username
            );
            allPlayers.push(this.currentUser);
        }

        // Sort by XP descending
        allPlayers.sort((a, b) => b.xp - a.xp);

        // Assign ranks
        allPlayers.forEach((player, index) => {
            player.rank = index + 1;
        });

        // Get top N
        const topPlayers = allPlayers.slice(0, this.options.maxDisplay);

        // Find current user if not in top
        const userInTop = topPlayers.find(p => p.isCurrentUser);
        const userRank = allPlayers.findIndex(p => p.isCurrentUser) + 1;

        return {
            top: topPlayers,
            currentUser: this.currentUser,
            userRank: userRank,
            userInTop: !!userInTop,
            totalPlayers: allPlayers.length,
            realCount: this.realPlayers.length,
            phantomCount: this.phantomPlayers.length
        };
    }

    /**
     * Opt-in to public leaderboard
     */
    async optInToLeaderboard() {
        if (!this.githubAuth?.isAuthenticated) {
            throw new Error('Must be signed in to join leaderboard');
        }

        localStorage.setItem(this.storageKeys.optedIn, 'true');

        // Make sure progress Gist exists and is shareable
        if (this.gistSync) {
            await this.gistSync.backup();
        }

        return true;
    }

    /**
     * Opt-out of public leaderboard
     */
    optOutOfLeaderboard() {
        localStorage.setItem(this.storageKeys.optedIn, 'false');
    }

    /**
     * Check if user is opted in
     */
    isOptedIn() {
        return localStorage.getItem(this.storageKeys.optedIn) === 'true';
    }

    /**
     * Create a class registry Gist (for instructors)
     */
    async createClassRegistry(className, studentUsernames = []) {
        if (!this.githubAuth?.isAuthenticated) {
            throw new Error('Must be signed in to create registry');
        }

        const token = this.githubAuth.getToken();

        const registry = {
            className: className,
            createdAt: new Date().toISOString(),
            createdBy: this.githubAuth.profile.username,
            players: studentUsernames.map(username => ({
                username: username,
                displayName: username,
                progressGistId: null  // Students add their own Gist IDs
            }))
        };

        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: `Hexworth Prime Leaderboard: ${className}`,
                public: false,
                files: {
                    'hexworth-leaderboard.json': {
                        content: JSON.stringify(registry, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create registry');
        }

        const gist = await response.json();
        return {
            gistId: gist.id,
            url: gist.html_url,
            registry: registry
        };
    }

    /**
     * Join a class registry (for students)
     */
    async joinClassRegistry(registryGistId) {
        if (!this.githubAuth?.isAuthenticated) {
            throw new Error('Must be signed in to join');
        }
        if (!this.gistSync) {
            throw new Error('GistSync not configured');
        }

        // Make sure user has a progress Gist
        let progressGistId = this.gistSync.getGistId();
        if (!progressGistId) {
            const result = await this.gistSync.backup();
            progressGistId = result.id;
        }

        // Fetch current registry
        const token = this.githubAuth.getToken();
        const response = await fetch(`https://api.github.com/gists/${registryGistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Could not access registry');
        }

        const gist = await response.json();
        const registryFile = gist.files['hexworth-leaderboard.json'];
        if (!registryFile) {
            throw new Error('Invalid registry format');
        }

        const registry = JSON.parse(registryFile.content);
        const username = this.githubAuth.profile.username;

        // Find or add player entry
        let playerEntry = registry.players.find(p => p.username === username);
        if (playerEntry) {
            playerEntry.progressGistId = progressGistId;
        } else {
            registry.players.push({
                username: username,
                displayName: this.githubAuth.profile.displayName || username,
                progressGistId: progressGistId,
                joinedAt: new Date().toISOString()
            });
        }

        // Update registry
        const updateResponse = await fetch(`https://api.github.com/gists/${registryGistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    'hexworth-leaderboard.json': {
                        content: JSON.stringify(registry, null, 2)
                    }
                }
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Could not update registry');
        }

        // Store registry ID locally
        this.options.registryGistId = registryGistId;
        localStorage.setItem('hexworth_class_registry', registryGistId);

        // Mark as opted in
        this.optInToLeaderboard();

        return { success: true, registry };
    }

    /**
     * Render leaderboard to container
     */
    renderLeaderboard(container) {
        if (!container) return;

        const data = this.getLeaderboard();

        const html = `
            <div class="leaderboard-container">
                <div class="leaderboard-header">
                    <h3 class="leaderboard-title">🏆 House Leaderboard</h3>
                    <div class="leaderboard-stats">
                        <span class="real-count">${data.realCount} real</span>
                        <span class="total-count">${data.totalPlayers} total</span>
                    </div>
                </div>

                <div class="leaderboard-list">
                    ${data.top.map((player, i) => this.renderPlayerRow(player, i)).join('')}

                    ${!data.userInTop ? `
                        <div class="leaderboard-gap">
                            <span>···</span>
                        </div>
                        ${this.renderPlayerRow(data.currentUser, data.userRank - 1)}
                    ` : ''}
                </div>

                ${this.githubAuth?.isAuthenticated && !this.isOptedIn() ? `
                    <div class="leaderboard-optin">
                        <button class="optin-btn" onclick="leaderboardManager.optInToLeaderboard()">
                            Join Public Leaderboard
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render a single player row
     */
    renderPlayerRow(player, index) {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
        const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        const specialClass = player.isCurrentUser ? 'current-user' : player.isNemesis ? 'nemesis' : player.isReal ? 'real-player' : '';

        const avatar = player.avatar?.startsWith('http')
            ? `<img src="${player.avatar}" alt="${player.username}" class="player-avatar">`
            : `<span class="player-avatar-emoji">${player.avatar}</span>`;

        return `
            <div class="leaderboard-row ${specialClass} ${rankClass}">
                <div class="player-rank">
                    ${rankIcon || `#${player.rank}`}
                </div>
                <div class="player-avatar-container">
                    ${avatar}
                    ${player.isReal ? '<span class="real-badge">✓</span>' : ''}
                    ${player.isNemesis ? '<span class="nemesis-badge">👻</span>' : ''}
                </div>
                <div class="player-info">
                    <span class="player-name">${player.displayName}</span>
                    ${player.isCurrentUser ? '<span class="you-badge">YOU</span>' : ''}
                </div>
                <div class="player-xp">
                    ${player.xp.toLocaleString()} XP
                </div>
            </div>
        `;
    }

    /**
     * Get CSS styles for the leaderboard
     */
    static getStyles() {
        return `
            .leaderboard-container {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 20px;
            }

            .leaderboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .leaderboard-title {
                font-size: 1rem;
                font-weight: 600;
                color: #e0e0e0;
                margin: 0;
            }

            .leaderboard-stats {
                display: flex;
                gap: 12px;
                font-size: 0.75rem;
            }

            .real-count {
                color: #4ade80;
            }

            .total-count {
                color: #888;
            }

            .leaderboard-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .leaderboard-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
                transition: all 0.2s;
            }

            .leaderboard-row:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .leaderboard-row.gold {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
                border: 1px solid rgba(255, 215, 0, 0.2);
            }

            .leaderboard-row.silver {
                background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05));
                border: 1px solid rgba(192, 192, 192, 0.2);
            }

            .leaderboard-row.bronze {
                background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05));
                border: 1px solid rgba(205, 127, 50, 0.2);
            }

            .leaderboard-row.current-user {
                background: linear-gradient(135deg, rgba(var(--house-primary-rgb, 159, 122, 234), 0.15), rgba(var(--house-primary-rgb, 159, 122, 234), 0.05));
                border: 1px solid rgba(var(--house-primary-rgb, 159, 122, 234), 0.3);
            }

            .leaderboard-row.nemesis {
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(168, 85, 247, 0.05));
                border: 1px dashed rgba(168, 85, 247, 0.3);
            }

            .leaderboard-row.real-player {
                border-left: 2px solid #4ade80;
            }

            .player-rank {
                width: 40px;
                font-size: 1.1rem;
                text-align: center;
                color: #888;
            }

            .player-avatar-container {
                position: relative;
                width: 36px;
                height: 36px;
            }

            .player-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                object-fit: cover;
            }

            .player-avatar-emoji {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.4rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
            }

            .real-badge {
                position: absolute;
                bottom: -2px;
                right: -2px;
                width: 14px;
                height: 14px;
                background: #4ade80;
                border-radius: 50%;
                font-size: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
            }

            .nemesis-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                font-size: 12px;
            }

            .player-info {
                flex: 1;
                min-width: 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .player-name {
                font-size: 0.9rem;
                color: #e0e0e0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .you-badge {
                font-size: 0.65rem;
                padding: 2px 6px;
                background: var(--house-primary, #9f7aea);
                color: #000;
                border-radius: 4px;
                font-weight: 600;
            }

            .player-xp {
                font-size: 0.85rem;
                color: #888;
                font-family: 'SF Mono', Monaco, monospace;
            }

            .leaderboard-gap {
                text-align: center;
                color: #444;
                padding: 5px;
            }

            .leaderboard-optin {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                text-align: center;
            }

            .optin-btn {
                padding: 10px 24px;
                background: rgba(74, 222, 128, 0.1);
                border: 1px solid rgba(74, 222, 128, 0.3);
                border-radius: 6px;
                color: #4ade80;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .optin-btn:hover {
                background: rgba(74, 222, 128, 0.2);
            }

            /* Responsive */
            @media (max-width: 500px) {
                .leaderboard-row {
                    gap: 8px;
                    padding: 8px;
                }

                .player-rank {
                    width: 30px;
                    font-size: 0.9rem;
                }

                .player-avatar, .player-avatar-emoji {
                    width: 28px;
                    height: 28px;
                    font-size: 1.1rem;
                }

                .player-name {
                    font-size: 0.8rem;
                }

                .player-xp {
                    font-size: 0.75rem;
                }
            }
        `;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeaderboardManager;
}
