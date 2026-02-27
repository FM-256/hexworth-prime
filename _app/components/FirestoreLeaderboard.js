/**
 * FirestoreLeaderboard.js - Real-Time Firestore Leaderboard
 *
 * Displays actual user rankings from Firestore database.
 * Features:
 * - Global XP leaderboard
 * - Per-house leaderboards
 * - Real-time updates
 * - Callsign-based display
 * - Tier badges for founding members
 *
 * @requires FirestoreManager.js
 * @requires FirebaseAuth.js
 */

const FirestoreLeaderboard = (function() {
    'use strict';

    // Configuration
    const config = {
        refreshInterval: 60000, // 1 minute
        maxDisplay: 15,
        cacheKey: 'hexworth_leaderboard_cache',
        cacheTTL: 30000 // 30 seconds
    };

    // State
    let container = null;
    let currentMode = 'global'; // 'global' or house name
    let lastFetch = 0;
    let cachedData = null;
    let isLoading = false;
    let autoRefreshTimer = null;
    let displayCount = 5; // Show top 5 by default, expandable to 10

    // Tier badges
    const tierBadges = {
        founding_member: { icon: '🌟', label: 'Founder', color: '#ffd700' },
        early_adopter: { icon: '⭐', label: 'Early', color: '#87ceeb' },
        beta_tester: { icon: '🔬', label: 'Beta', color: '#9370db' },
        free: { icon: '', label: '', color: '#888' }
    };

    // House colors
    const houseColors = {
        web: '#60a5fa',
        shield: '#a855f7',
        cloud: '#06b6d4',
        forge: '#f97316',
        script: '#22c55e',
        code: '#ec4899',
        key: '#eab308',
        eye: '#6366f1'
    };

    /**
     * Initialize the leaderboard
     */
    function init(containerElement, options = {}) {
        container = containerElement;

        if (options.mode) {
            currentMode = options.mode;
        }

        if (options.autoRefresh !== false) {
            startAutoRefresh();
        }

        // Initial load
        refresh();

        return {
            refresh,
            setMode,
            destroy
        };
    }

    /**
     * Refresh leaderboard data
     */
    async function refresh() {
        if (isLoading) return;

        // Check cache
        const now = Date.now();
        if (cachedData && (now - lastFetch) < config.cacheTTL) {
            render(cachedData);
            return;
        }

        isLoading = true;
        renderLoading();

        try {
            let data;

            if (currentMode === 'global') {
                data = await FirestoreManager.getGlobalLeaderboard(config.maxDisplay);
            } else {
                data = await FirestoreManager.getHouseLeaderboard(currentMode, config.maxDisplay);
            }

            // Get current user's rank
            const currentUser = FirebaseAuth.getUser();
            let userRank = null;

            if (currentUser) {
                userRank = await FirestoreManager.getUserRank(
                    currentUser.uid,
                    currentMode === 'global' ? null : currentMode
                );
            }

            cachedData = {
                entries: data,
                userRank: userRank,
                mode: currentMode,
                timestamp: now
            };

            lastFetch = now;
            render(cachedData);

        } catch (error) {
            console.error('[FirestoreLeaderboard] Error:', error);
            renderError(error.message);
        } finally {
            isLoading = false;
        }
    }

    /**
     * Set leaderboard mode
     */
    function setMode(mode) {
        if (mode !== currentMode) {
            currentMode = mode;
            cachedData = null;
            refresh();
        }
    }

    /**
     * Start auto-refresh timer
     */
    function startAutoRefresh() {
        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
        }
        autoRefreshTimer = setInterval(refresh, config.refreshInterval);
    }

    /**
     * Destroy the leaderboard
     */
    function destroy() {
        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
            autoRefreshTimer = null;
        }
        container = null;
        cachedData = null;
    }

    /**
     * Render the leaderboard
     */
    function render(data) {
        if (!container) return;

        const currentUser = FirebaseAuth.getUser();
        const allEntries = data.entries || [];
        const userRank = data.userRank;

        // Show only displayCount entries (top 5 or top 10)
        const entries = allEntries.slice(0, displayCount);
        const hasMore = allEntries.length > displayCount;
        const isExpanded = displayCount > 5;

        // Check if current user is in visible entries
        const userInTop = currentUser && entries.some(e => e.id === currentUser.uid);

        const html = `
            <div class="fsl-container">
                <div class="fsl-header">
                    <h3 class="fsl-title">
                        ${currentMode === 'global' ? '🏆 Global Rankings' : `🏠 ${capitalize(currentMode)} House`}
                    </h3>
                    <div class="fsl-tabs">
                        <button class="fsl-tab ${currentMode === 'global' ? 'active' : ''}" data-mode="global">
                            Global
                        </button>
                        <button class="fsl-tab ${currentMode !== 'global' ? 'active' : ''}" data-mode="house">
                            My House
                        </button>
                    </div>
                </div>

                <div class="fsl-list">
                    ${entries.length > 0 ? entries.map((entry, i) => renderEntry(entry, i + 1, currentUser)).join('') : `
                        <div class="fsl-empty">
                            <span class="fsl-empty-icon">📊</span>
                            <p>No rankings yet. Complete modules to climb the leaderboard!</p>
                        </div>
                    `}

                    ${userRank && !userInTop && currentUser ? `
                        <div class="fsl-gap">
                            <span>• • •</span>
                        </div>
                        ${renderUserRank(userRank, currentUser)}
                    ` : ''}
                </div>

                ${hasMore || isExpanded ? `
                    <button class="fsl-toggle" data-action="toggle">
                        ${isExpanded ? 'Show Top 5' : 'Show Top 10'}
                    </button>
                ` : ''}

                <div class="fsl-footer">
                    <span class="fsl-updated">Updated ${formatTimeAgo(data.timestamp)}</span>
                    <button class="fsl-refresh" onclick="FirestoreLeaderboard.refresh()">
                        🔄 Refresh
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Bind tab events
        container.querySelectorAll('.fsl-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                if (mode === 'house') {
                    const house = localStorage.getItem('hexworth_house') || 'web';
                    setMode(house);
                } else {
                    setMode('global');
                }
            });
        });

        // Bind toggle button
        const toggleBtn = container.querySelector('.fsl-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                displayCount = displayCount > 5 ? 5 : 10;
                render(cachedData);
            });
        }
    }

    /**
     * Render a leaderboard entry
     */
    function renderEntry(entry, rank, currentUser) {
        const isCurrentUser = currentUser && entry.id === currentUser.uid;
        const tier = tierBadges[entry.tier] || tierBadges.free;
        const rankDisplay = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`;
        const houseColor = houseColors[entry.house] || '#888';

        return `
            <div class="fsl-entry ${isCurrentUser ? 'fsl-current-user' : ''} ${rank <= 3 ? `fsl-rank-${rank}` : ''}">
                <div class="fsl-rank">${rankDisplay}</div>
                <div class="fsl-avatar" style="border-color: ${houseColor}">
                    ${entry.photoURL
                        ? `<img src="${entry.photoURL}" alt="${entry.callsign}">`
                        : `<span>${getInitials(entry.callsign || entry.displayName)}</span>`
                    }
                </div>
                <div class="fsl-info">
                    <div class="fsl-name">
                        <span class="fsl-callsign">@${entry.callsign || 'Anonymous'}</span>
                        ${tier.icon ? `<span class="fsl-tier" style="color: ${tier.color}" title="${tier.label}">${tier.icon}</span>` : ''}
                        ${isCurrentUser ? '<span class="fsl-you">YOU</span>' : ''}
                    </div>
                    <div class="fsl-meta">
                        <span class="fsl-level">Lv. ${entry.level}</span>
                        <span class="fsl-house" style="color: ${houseColor}">${capitalize(entry.house)}</span>
                    </div>
                </div>
                <div class="fsl-xp">
                    <span class="fsl-xp-value">${formatNumber(entry.totalXP)}</span>
                    <span class="fsl-xp-label">XP</span>
                </div>
            </div>
        `;
    }

    /**
     * Render current user's rank (when not in top)
     */
    function renderUserRank(rankData, currentUser) {
        const houseColor = houseColors[rankData.house] || '#888';
        const tier = tierBadges[rankData.tier] || tierBadges.free;

        return `
            <div class="fsl-entry fsl-current-user fsl-below-fold">
                <div class="fsl-rank">#${rankData.rank}</div>
                <div class="fsl-avatar" style="border-color: ${houseColor}">
                    ${currentUser.photoURL
                        ? `<img src="${currentUser.photoURL}" alt="You">`
                        : `<span>${getInitials(rankData.callsign || currentUser.displayName)}</span>`
                    }
                </div>
                <div class="fsl-info">
                    <div class="fsl-name">
                        <span class="fsl-callsign">@${rankData.callsign || 'You'}</span>
                        ${tier.icon ? `<span class="fsl-tier" style="color: ${tier.color}">${tier.icon}</span>` : ''}
                        <span class="fsl-you">YOU</span>
                    </div>
                    <div class="fsl-meta">
                        <span class="fsl-level">Lv. ${rankData.level}</span>
                        <span class="fsl-house" style="color: ${houseColor}">${capitalize(rankData.house)}</span>
                    </div>
                </div>
                <div class="fsl-xp">
                    <span class="fsl-xp-value">${formatNumber(rankData.totalXP)}</span>
                    <span class="fsl-xp-label">XP</span>
                </div>
            </div>
        `;
    }

    /**
     * Render loading state
     */
    function renderLoading() {
        if (!container) return;

        container.innerHTML = `
            <div class="fsl-container fsl-loading">
                <div class="fsl-header">
                    <h3 class="fsl-title">🏆 Loading Rankings...</h3>
                </div>
                <div class="fsl-list">
                    ${Array(5).fill(0).map(() => `
                        <div class="fsl-entry fsl-skeleton">
                            <div class="fsl-rank"><span></span></div>
                            <div class="fsl-avatar"><span></span></div>
                            <div class="fsl-info">
                                <div class="fsl-name"><span></span></div>
                                <div class="fsl-meta"><span></span></div>
                            </div>
                            <div class="fsl-xp"><span></span></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render error state
     */
    function renderError(message) {
        if (!container) return;

        container.innerHTML = `
            <div class="fsl-container fsl-error">
                <div class="fsl-header">
                    <h3 class="fsl-title">🏆 Leaderboard</h3>
                </div>
                <div class="fsl-error-content">
                    <span class="fsl-error-icon">⚠️</span>
                    <p>${message || 'Could not load leaderboard'}</p>
                    <button class="fsl-retry" onclick="FirestoreLeaderboard.refresh()">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Helper functions
     */
    function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toLocaleString() || '0';
    }

    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    function getInitials(name) {
        if (!name) return '?';
        return name.split(/[_\s]/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    /**
     * Inject styles
     */
    function injectStyles() {
        if (document.getElementById('firestore-leaderboard-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'firestore-leaderboard-styles';
        styles.textContent = `
            .fsl-container {
                background: rgba(15, 15, 20, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 20px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .fsl-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .fsl-title {
                font-size: 1rem;
                font-weight: 600;
                color: #e0e0e0;
                margin: 0;
            }

            .fsl-tabs {
                display: flex;
                gap: 8px;
            }

            .fsl-tab {
                padding: 6px 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                color: #888;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .fsl-tab:hover {
                background: rgba(255, 255, 255, 0.08);
                color: #ccc;
            }

            .fsl-tab.active {
                background: rgba(57, 255, 20, 0.1);
                border-color: rgba(57, 255, 20, 0.3);
                color: #39ff14;
            }

            .fsl-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .fsl-entry {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 10px;
                transition: all 0.2s;
            }

            .fsl-entry:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .fsl-rank-1 {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
                border: 1px solid rgba(255, 215, 0, 0.2);
            }

            .fsl-rank-2 {
                background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(192, 192, 192, 0.05));
                border: 1px solid rgba(192, 192, 192, 0.2);
            }

            .fsl-rank-3 {
                background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05));
                border: 1px solid rgba(205, 127, 50, 0.2);
            }

            .fsl-current-user {
                background: linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(57, 255, 20, 0.05));
                border: 1px solid rgba(57, 255, 20, 0.3);
            }

            .fsl-below-fold {
                border-style: dashed;
            }

            .fsl-rank {
                width: 40px;
                font-size: 1.1rem;
                text-align: center;
                color: #888;
            }

            .fsl-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid #333;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.05);
            }

            .fsl-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .fsl-avatar span {
                font-size: 0.9rem;
                font-weight: 600;
                color: #888;
            }

            .fsl-info {
                flex: 1;
                min-width: 0;
            }

            .fsl-name {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .fsl-callsign {
                font-size: 0.9rem;
                font-weight: 500;
                color: #e0e0e0;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
            }

            .fsl-tier {
                font-size: 0.8rem;
            }

            .fsl-you {
                font-size: 0.6rem;
                padding: 2px 6px;
                background: #39ff14;
                color: #000;
                border-radius: 4px;
                font-weight: 700;
            }

            .fsl-meta {
                display: flex;
                gap: 12px;
                margin-top: 4px;
            }

            .fsl-level, .fsl-house {
                font-size: 0.7rem;
                color: #666;
            }

            .fsl-xp {
                text-align: right;
            }

            .fsl-xp-value {
                font-size: 1rem;
                font-weight: 600;
                color: #fff;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
            }

            .fsl-xp-label {
                display: block;
                font-size: 0.6rem;
                color: #555;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            .fsl-gap {
                text-align: center;
                color: #333;
                padding: 10px;
            }

            .fsl-toggle {
                display: block;
                width: 100%;
                padding: 8px;
                margin-top: 10px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                color: #888;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
                letter-spacing: 0.05em;
            }

            .fsl-toggle:hover {
                background: rgba(255, 255, 255, 0.06);
                color: #ccc;
                border-color: rgba(255, 255, 255, 0.15);
            }

            .fsl-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 15px;
                padding-top: 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }

            .fsl-updated {
                font-size: 0.7rem;
                color: #444;
            }

            .fsl-refresh {
                padding: 6px 12px;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #666;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .fsl-refresh:hover {
                background: rgba(255, 255, 255, 0.05);
                color: #888;
            }

            .fsl-empty, .fsl-error-content {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }

            .fsl-empty-icon, .fsl-error-icon {
                font-size: 2.5rem;
                display: block;
                margin-bottom: 15px;
            }

            .fsl-retry {
                margin-top: 15px;
                padding: 10px 20px;
                background: rgba(57, 255, 20, 0.1);
                border: 1px solid rgba(57, 255, 20, 0.3);
                border-radius: 8px;
                color: #39ff14;
                cursor: pointer;
                transition: all 0.2s;
            }

            .fsl-retry:hover {
                background: rgba(57, 255, 20, 0.2);
            }

            /* Skeleton loading */
            .fsl-skeleton .fsl-rank span,
            .fsl-skeleton .fsl-avatar span,
            .fsl-skeleton .fsl-name span,
            .fsl-skeleton .fsl-meta span,
            .fsl-skeleton .fsl-xp span {
                display: inline-block;
                background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
            }

            .fsl-skeleton .fsl-rank span { width: 24px; height: 24px; }
            .fsl-skeleton .fsl-avatar span { width: 40px; height: 40px; border-radius: 50%; }
            .fsl-skeleton .fsl-name span { width: 100px; height: 16px; }
            .fsl-skeleton .fsl-meta span { width: 60px; height: 12px; }
            .fsl-skeleton .fsl-xp span { width: 50px; height: 20px; }

            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* Responsive */
            @media (max-width: 500px) {
                .fsl-header {
                    flex-direction: column;
                    gap: 12px;
                    align-items: flex-start;
                }

                .fsl-entry {
                    gap: 10px;
                    padding: 10px 12px;
                }

                .fsl-rank { width: 32px; font-size: 0.9rem; }
                .fsl-avatar { width: 32px; height: 32px; }
                .fsl-callsign { font-size: 0.8rem; }
                .fsl-xp-value { font-size: 0.85rem; }
            }
        `;

        document.head.appendChild(styles);
    }

    // Inject styles on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    // Public API
    return {
        init,
        refresh,
        setMode,
        destroy
    };

})();
