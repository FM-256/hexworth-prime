/**
 * AchievementPanel.js - Categorized Achievement UI for Hexworth Prime
 *
 * Replaces the flat achievement grid with a full categorized, filterable,
 * searchable panel that handles 1,400+ achievements performantly.
 *
 * Requires: AchievementRegistry.js, AchievementManager.js (for titles)
 *
 * @version 1.0.0
 */

const AchievementPanel = (function() {
    'use strict';

    const PAGE_SIZE = 60;  // Cards per page for performance

    let _state = {
        category: null,        // null = all
        filter: 'all',         // all | unlocked | locked | secret
        sort: 'name',          // name | points | date
        search: '',
        page: 0
    };

    let _container = null;

    // ═══════════════════════════════════════════════════════════════════
    // BADGE IMAGE SUPPORT
    // ═══════════════════════════════════════════════════════════════════

    // Resolve _app/ root from this script's own src attribute
    const _badgeBasePath = (function() {
        return '/assets/images/badges/';
    })();

    // Cache which badge images exist (populated on first load)
    let _badgeCache = null;

    function getBadgeUrl(achievementId) {
        return _badgeBasePath + achievementId + '.webp';
    }

    /**
     * Build the visual icon HTML for an achievement card.
     * Shows badge image if available, falls back to emoji.
     */
    function badgeIconHTML(achievementId, emoji, isLocked, name) {
        const url = getBadgeUrl(achievementId);
        const grayscale = isLocked ? 'filter:grayscale(1) brightness(0.5);' : '';
        const altText = name ? name + ' badge' : '';
        // Image with emoji fallback via onerror
        return '<img src="' + url + '" alt="' + altText + '" class="ap-badge-img" style="' + grayscale + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\';">'
             + '<span class="ap-badge-emoji" style="display:none;">' + emoji + '</span>';
    }

    /**
     * Build notification icon HTML (larger size for toast).
     */
    function notifBadgeHTML(achievementId, emoji, name) {
        const url = getBadgeUrl(achievementId);
        const altText = name ? name + ' badge' : '';
        return '<img src="' + url + '" alt="' + altText + '" class="ap-notif-badge-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline\';">'
             + '<span style="display:none;font-size:2.5rem;">' + emoji + '</span>';
    }

    // ═══════════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════════

    function injectStyles() {
        if (document.getElementById('achievement-panel-styles')) return;
        const style = document.createElement('style');
        style.id = 'achievement-panel-styles';
        style.textContent = `
            .ap-layout {
                display: flex;
                gap: 20px;
                height: 100%;
                min-height: 0;
            }

            /* Sidebar */
            .ap-sidebar {
                width: 200px;
                flex-shrink: 0;
                overflow-y: auto;
                border-right: 1px solid #333;
                padding-right: 15px;
            }

            .ap-cat-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.15s;
                font-size: 0.8rem;
                color: #aaa;
                margin-bottom: 2px;
            }

            .ap-cat-item:hover {
                background: rgba(255,255,255,0.05);
            }

            .ap-cat-item.active {
                background: rgba(var(--house-primary-rgb, 100,100,255), 0.15);
                color: var(--house-primary, #60a5fa);
            }

            .ap-cat-label {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .ap-cat-count {
                font-size: 0.65rem;
                color: #666;
                margin-left: 8px;
                flex-shrink: 0;
            }

            .ap-cat-bar {
                width: 100%;
                height: 3px;
                background: rgba(255,255,255,0.05);
                border-radius: 2px;
                margin-top: 4px;
                overflow: hidden;
            }

            .ap-cat-bar-fill {
                height: 100%;
                background: var(--house-primary, #60a5fa);
                border-radius: 2px;
                transition: width 0.3s;
            }

            /* Main content area */
            .ap-main {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            /* Controls bar */
            .ap-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
                align-items: center;
                flex-wrap: wrap;
            }

            .ap-search {
                flex: 1;
                min-width: 150px;
                padding: 8px 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid #444;
                border-radius: 8px;
                color: #ddd;
                font-size: 0.8rem;
                outline: none;
            }

            .ap-search:focus {
                border-color: var(--house-primary, #60a5fa);
            }

            .ap-search::placeholder {
                color: #666;
            }

            .ap-filter-group {
                display: flex;
                gap: 4px;
            }

            .ap-filter-btn {
                padding: 6px 10px;
                font-size: 0.7rem;
                background: rgba(255,255,255,0.05);
                border: 1px solid #444;
                border-radius: 6px;
                color: #aaa;
                cursor: pointer;
                transition: all 0.15s;
            }

            .ap-filter-btn:hover {
                background: rgba(255,255,255,0.08);
            }

            .ap-filter-btn.active {
                background: rgba(var(--house-primary-rgb, 100,100,255), 0.2);
                border-color: var(--house-primary, #60a5fa);
                color: var(--house-primary, #60a5fa);
            }

            .ap-sort-select {
                padding: 6px 8px;
                background: rgba(255,255,255,0.05);
                border: 1px solid #444;
                border-radius: 6px;
                color: #aaa;
                font-size: 0.7rem;
                cursor: pointer;
            }

            /* Stats bar */
            .ap-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 15px;
                padding: 12px 15px;
                background: rgba(255,255,255,0.02);
                border-radius: 10px;
            }

            .ap-stat {
                text-align: center;
            }

            .ap-stat-value {
                font-size: 1.4rem;
                color: var(--house-primary, #60a5fa);
                font-weight: 600;
            }

            .ap-stat-label {
                font-size: 0.6rem;
                color: #666;
                letter-spacing: 0.1em;
            }

            .ap-progress-bar {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .ap-progress-track {
                flex: 1;
                height: 8px;
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                overflow: hidden;
            }

            .ap-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--house-primary, #60a5fa), #a78bfa);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .ap-progress-pct {
                font-size: 0.8rem;
                color: #aaa;
                width: 40px;
                text-align: right;
            }

            /* Grid */
            .ap-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 12px;
                overflow-y: auto;
                flex: 1;
                padding-bottom: 10px;
            }

            .ap-card {
                background: rgba(255,255,255,0.03);
                border: 1px solid #333;
                border-radius: 10px;
                padding: 14px 10px;
                text-align: center;
                transition: all 0.2s;
                cursor: default;
                position: relative;
            }

            .ap-card.unlocked {
                border-color: var(--house-primary, #60a5fa);
                background: rgba(var(--house-primary-rgb, 100,100,255), 0.08);
            }

            /* Rarity tier borders (unlocked only) */
            .ap-card.rarity-uncommon.unlocked {
                border-color: #4ade80;
                box-shadow: 0 0 8px rgba(74,222,128,0.15);
            }
            .ap-card.rarity-rare.unlocked {
                border-color: #60a5fa;
                box-shadow: 0 0 10px rgba(96,165,250,0.2);
            }
            .ap-card.rarity-epic.unlocked {
                border-color: #a78bfa;
                box-shadow: 0 0 12px rgba(167,139,250,0.25);
            }
            .ap-card.rarity-epic.unlocked::after {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                border-radius: 10px;
                background: linear-gradient(135deg, transparent 40%, rgba(167,139,250,0.08) 50%, transparent 60%);
                background-size: 200% 200%;
                animation: apShimmer 3s ease-in-out infinite;
                pointer-events: none;
            }

            @keyframes apShimmer {
                0% { background-position: 200% 200%; }
                100% { background-position: -200% -200%; }
            }

            /* NEW badge for recently unlocked */
            .ap-new-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: linear-gradient(135deg, #ffd700, #ffaa00);
                color: #000;
                font-size: 0.5rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                padding: 2px 6px;
                border-radius: 8px;
                animation: apNewPulse 2s ease-in-out infinite;
                z-index: 1;
                box-shadow: 0 2px 8px rgba(255,215,0,0.4);
            }

            @keyframes apNewPulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.05); }
            }

            .ap-card.locked {
                opacity: 0.4;
            }

            .ap-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }

            .ap-card-icon {
                font-size: 1.6rem;
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 56px;
            }

            .ap-badge-img {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                object-fit: cover;
                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .ap-card:hover .ap-badge-img {
                transform: scale(1.1);
                box-shadow: 0 4px 16px rgba(0,0,0,0.5);
            }

            .ap-card.unlocked .ap-badge-img {
                box-shadow: 0 2px 12px rgba(var(--house-primary-rgb, 100,100,255), 0.4);
            }

            /* ── ANIMATED BADGE EFFECTS ── */

            /* Legendary badges: slow prismatic glow */
            .ap-card.legendary.unlocked .ap-badge-img,
            .ap-card.rarity-legendary.unlocked .ap-badge-img {
                animation: apBadgePrismatic 4s ease-in-out infinite;
            }

            @keyframes apBadgePrismatic {
                0%, 100% { box-shadow: 0 0 12px rgba(255,215,0,0.5), 0 0 24px rgba(255,107,0,0.2); }
                33% { box-shadow: 0 0 12px rgba(255,0,255,0.5), 0 0 24px rgba(139,92,246,0.2); }
                66% { box-shadow: 0 0 12px rgba(0,255,255,0.5), 0 0 24px rgba(96,165,250,0.2); }
            }

            /* Cosmic badges: slow orbit ring */
            .ap-card.cosmic.unlocked .ap-badge-img {
                animation: apBadgeCosmic 6s linear infinite;
                box-shadow: 0 0 16px rgba(139,92,246,0.5);
            }

            @keyframes apBadgeCosmic {
                0% { box-shadow: 0 0 16px rgba(139,92,246,0.5), 4px 0 8px rgba(167,139,250,0.3); }
                25% { box-shadow: 0 0 16px rgba(139,92,246,0.5), 0 4px 8px rgba(167,139,250,0.3); }
                50% { box-shadow: 0 0 16px rgba(139,92,246,0.5), -4px 0 8px rgba(167,139,250,0.3); }
                75% { box-shadow: 0 0 16px rgba(139,92,246,0.5), 0 -4px 8px rgba(167,139,250,0.3); }
                100% { box-shadow: 0 0 16px rgba(139,92,246,0.5), 4px 0 8px rgba(167,139,250,0.3); }
            }

            /* Glitch badges: subtle distortion flicker */
            .ap-card.glitch.unlocked .ap-badge-img {
                animation: apBadgeGlitch 3s ease-in-out infinite;
            }

            @keyframes apBadgeGlitch {
                0%, 90%, 100% { transform: none; filter: none; }
                92% { transform: translate(-2px, 1px); filter: hue-rotate(90deg); }
                94% { transform: translate(2px, -1px); filter: hue-rotate(180deg); }
                96% { transform: translate(-1px, -1px); filter: hue-rotate(270deg); }
                98% { transform: none; filter: none; }
            }

            /* Golden badges: warm pulse */
            .ap-card.golden.unlocked .ap-badge-img {
                animation: apBadgeGolden 3s ease-in-out infinite;
            }

            @keyframes apBadgeGolden {
                0%, 100% { box-shadow: 0 0 10px rgba(255,215,0,0.4); }
                50% { box-shadow: 0 0 20px rgba(255,215,0,0.7), 0 0 30px rgba(255,165,0,0.3); }
            }

            /* Retro badges: CRT scanline effect */
            .ap-card.retro.unlocked .ap-badge-img {
                animation: apBadgeRetro 0.1s steps(2) infinite;
            }

            @keyframes apBadgeRetro {
                0% { filter: brightness(1); }
                50% { filter: brightness(0.97); }
            }

            /* Epic rarity: subtle float */
            .ap-card.rarity-epic.unlocked .ap-badge-img {
                animation: apBadgeFloat 3s ease-in-out infinite;
            }

            @keyframes apBadgeFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }

            /* Hover animation override: spin for any unlocked */
            .ap-card.unlocked:hover .ap-badge-img {
                animation: none;
                transform: scale(1.15) rotate(5deg);
            }

            .ap-badge-emoji {
                font-size: 1.6rem;
            }

            .ap-card.locked .ap-card-icon {
                filter: grayscale(1);
            }

            .ap-card.locked .ap-badge-img {
                filter: grayscale(1) brightness(0.5);
            }

            .ap-card-name {
                font-size: 0.75rem;
                color: #ddd;
                margin-bottom: 3px;
                line-height: 1.2;
            }

            .ap-card-desc {
                font-size: 0.6rem;
                color: #888;
                line-height: 1.3;
                max-height: 2.6em;
                overflow: hidden;
            }

            .ap-card-points {
                font-size: 0.55rem;
                color: #4ade80;
                margin-top: 4px;
            }

            .ap-card.locked .ap-card-points {
                display: none;
            }

            .ap-card-date {
                font-size: 0.5rem;
                color: #555;
                margin-top: 2px;
            }

            /* Secret card styles */
            .ap-card.secret.locked .ap-card-icon {
                filter: none;
            }

            .ap-card.secret.locked .ap-card-name {
                color: #666;
            }

            /* Style variants */
            .ap-card.glitch.unlocked {
                border-color: #ff00ff !important;
                background: linear-gradient(135deg, rgba(255,0,255,0.1), rgba(0,255,255,0.05)) !important;
            }

            .ap-card.golden.unlocked {
                border-color: #ffd700 !important;
                background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.05)) !important;
            }

            .ap-card.legendary.unlocked {
                border: 2px solid transparent !important;
                background: linear-gradient(135deg, rgba(30,30,30,0.95), rgba(20,20,20,0.98)) padding-box,
                            linear-gradient(135deg, #ffd700, #ff6b00, #ff00ff, #00ffff, #ffd700) border-box !important;
            }

            .ap-card.cosmic.unlocked {
                border-color: #8b5cf6 !important;
                background: linear-gradient(135deg, rgba(20,10,40,0.3), rgba(10,5,30,0.3)) !important;
            }

            .ap-card.retro.unlocked {
                border-color: #00ff00 !important;
                font-family: monospace;
            }

            /* Pagination */
            .ap-pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                padding: 10px 0;
            }

            .ap-page-btn {
                padding: 6px 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid #444;
                border-radius: 6px;
                color: #aaa;
                cursor: pointer;
                font-size: 0.75rem;
            }

            .ap-page-btn:hover:not(:disabled) {
                background: rgba(255,255,255,0.1);
            }

            .ap-page-btn:disabled {
                opacity: 0.3;
                cursor: default;
            }

            .ap-page-info {
                font-size: 0.7rem;
                color: #666;
            }

            /* Title display */
            .ap-title-display {
                text-align: center;
                margin-bottom: 15px;
                padding: 10px;
            }

            .ap-title-label {
                font-size: 0.6rem;
                color: #666;
                letter-spacing: 0.15em;
                margin-bottom: 4px;
            }

            .ap-title-value {
                font-size: 1rem;
                color: #ffd700;
                font-style: italic;
            }

            /* Empty state */
            .ap-empty {
                text-align: center;
                padding: 40px;
                color: #666;
                font-size: 0.85rem;
            }

            /* Notification badge image */
            .ap-notif-badge-img {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                object-fit: cover;
                box-shadow: 0 2px 12px rgba(255, 215, 0, 0.4);
            }

            /* Notification particle burst container */
            .ap-notif-particles {
                position: absolute;
                top: 50%;
                left: 30px;
                width: 0;
                height: 0;
                pointer-events: none;
            }

            .ap-particle {
                position: absolute;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #ffd700;
                animation: apParticleBurst 0.8s ease-out forwards;
            }

            .ap-particle:nth-child(2) { animation-delay: 0.05s; background: #ffaa00; }
            .ap-particle:nth-child(3) { animation-delay: 0.1s; background: #ff6b00; }
            .ap-particle:nth-child(4) { animation-delay: 0.05s; background: #ffd700; }
            .ap-particle:nth-child(5) { animation-delay: 0.1s; background: #ffaa00; }
            .ap-particle:nth-child(6) { animation-delay: 0.15s; background: #ff6b00; }
            .ap-particle:nth-child(7) { animation-delay: 0.08s; background: #ffd700; }
            .ap-particle:nth-child(8) { animation-delay: 0.12s; background: #ffaa00; }

            @keyframes apParticleBurst {
                0% { transform: translate(0,0) scale(1); opacity: 1; }
                100% { transform: translate(var(--ptx, 30px), var(--pty, 0px)) scale(0); opacity: 0; }
            }

            /* Badge scale-pop on notification */
            .ap-notif-pop .achievement-notif-icon {
                animation: apBadgePop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s;
            }

            @keyframes apBadgePop {
                0% { transform: scale(0.5); opacity: 0.5; }
                60% { transform: scale(1.25); }
                100% { transform: scale(1); opacity: 1; }
            }

            /* Responsive: stack sidebar on narrow screens */
            @media (max-width: 600px) {
                .ap-layout {
                    flex-direction: column;
                }
                .ap-sidebar {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid #333;
                    padding-right: 0;
                    padding-bottom: 10px;
                    max-height: 150px;
                    overflow-x: auto;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }
                .ap-cat-item {
                    flex: 0 0 auto;
                }
                .ap-cat-bar {
                    display: none;
                }
                .ap-grid {
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Get filtered + sorted achievement list
     */
    function getFilteredAchievements() {
        if (typeof AchievementRegistry === 'undefined') return [];

        let defs = _state.category
            ? AchievementRegistry.getByCategory(_state.category)
            : AchievementRegistry.getAllDefinitions();

        const unlockedSet = new Set(AchievementRegistry.getUnlockedIds());
        const v2Data = (() => {
            try {
                const raw = localStorage.getItem('hexworth_achievements_v2');
                return raw ? JSON.parse(raw) : null;
            } catch { return null; }
        })();

        // Filter
        if (_state.filter === 'unlocked') {
            defs = defs.filter(d => unlockedSet.has(d.id));
        } else if (_state.filter === 'locked') {
            defs = defs.filter(d => !unlockedSet.has(d.id));
        } else if (_state.filter === 'secret') {
            defs = defs.filter(d => d.secret);
        }

        // Search
        if (_state.search) {
            const q = _state.search.toLowerCase();
            defs = defs.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.description.toLowerCase().includes(q) ||
                d.id.toLowerCase().includes(q)
            );
        }

        // Sort
        if (_state.sort === 'points') {
            defs.sort((a, b) => b.points - a.points);
        } else if (_state.sort === 'date') {
            defs.sort((a, b) => {
                const aTime = v2Data?.unlocked?.[a.id]?.unlockedAt || 0;
                const bTime = v2Data?.unlocked?.[b.id]?.unlockedAt || 0;
                return bTime - aTime;
            });
        } else {
            defs.sort((a, b) => a.name.localeCompare(b.name));
        }

        return defs;
    }

    /**
     * Render the full panel into the container element
     */
    function render(container) {
        _container = container;
        injectStyles();

        if (typeof AchievementRegistry === 'undefined') {
            container.innerHTML = '<div class="ap-empty">Achievement system loading...</div>';
            return;
        }

        const stats = AchievementRegistry.getStats();
        const categories = AchievementRegistry.getCategories();
        const unlockedSet = new Set(AchievementRegistry.getUnlockedIds());
        const username = localStorage.getItem('hexworth_username') || 'Student';
        const title = (typeof AchievementManager !== 'undefined')
            ? AchievementManager.buildTitle(username)
            : username;

        // Build sidebar HTML
        const sidebarHTML = `
            <div class="ap-cat-item ${!_state.category ? 'active' : ''}" data-cat="">
                <span class="ap-cat-label">All Achievements</span>
                <span class="ap-cat-count">${stats.total}</span>
            </div>
            ${categories.map(cat => {
                const catStats = AchievementRegistry.getCategoryStats(cat.id);
                return `
                    <div class="ap-cat-item ${_state.category === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                        <span class="ap-cat-label">${cat.label}</span>
                        <span class="ap-cat-count">${catStats.unlocked}/${catStats.total}</span>
                    </div>
                    <div class="ap-cat-bar"><div class="ap-cat-bar-fill" style="width: ${catStats.percentage}%"></div></div>
                `;
            }).join('')}
        `;

        // Get filtered results
        const allFiltered = getFilteredAchievements();
        const totalPages = Math.ceil(allFiltered.length / PAGE_SIZE);
        _state.page = Math.min(_state.page, Math.max(0, totalPages - 1));
        const pageItems = allFiltered.slice(_state.page * PAGE_SIZE, (_state.page + 1) * PAGE_SIZE);

        // Build grid HTML
        const now = Date.now();
        const NEW_THRESHOLD = 48 * 60 * 60 * 1000; // 48 hours
        let v2Cache = null;
        try { v2Cache = JSON.parse(localStorage.getItem('hexworth_achievements_v2') || '{}'); } catch {}

        const gridHTML = pageItems.length > 0 ? pageItems.map(ach => {
            const isUnlocked = unlockedSet.has(ach.id);
            const isSecret = ach.secret;
            const displayEmoji = (isUnlocked || !isSecret) ? ach.icon : '<img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">';
            const displayName = (isUnlocked || !isSecret) ? ach.name : '???';
            const displayDesc = isUnlocked ? ach.description : (isSecret ? '???' : ach.description);
            const showBadgeId = (isUnlocked || !isSecret) ? ach.id : null;

            const classes = ['ap-card'];
            classes.push(isUnlocked ? 'unlocked' : 'locked');
            if (isSecret) classes.push('secret');
            if (isUnlocked && ach.style) classes.push(ach.style);
            // Add rarity class for unlocked cards (unless style already overrides)
            if (isUnlocked && !ach.style) {
                const rc = getRarityClass(ach.points, ach.style);
                if (rc) classes.push(rc);
            }

            let dateHTML = '';
            let newBadgeHTML = '';
            if (isUnlocked) {
                const ts = v2Cache?.unlocked?.[ach.id]?.unlockedAt;
                if (ts) {
                    dateHTML = `<div class="ap-card-date">${new Date(ts).toLocaleDateString()}</div>`;
                    // Show NEW badge if unlocked within threshold
                    if (now - ts < NEW_THRESHOLD) {
                        newBadgeHTML = '<span class="ap-new-badge">NEW</span>';
                    }
                }
            }

            const iconContent = showBadgeId
                ? badgeIconHTML(showBadgeId, displayEmoji, !isUnlocked, displayName)
                : '<span class="ap-badge-emoji">' + displayEmoji + '</span>';

            return `
                <div class="${classes.join(' ')}" title="${isUnlocked ? ach.description : ''}">
                    ${newBadgeHTML}
                    <div class="ap-card-icon">${iconContent}</div>
                    <div class="ap-card-name">${displayName}</div>
                    <div class="ap-card-desc">${displayDesc}</div>
                    <div class="ap-card-points">+${ach.points} pts</div>
                    ${dateHTML}
                </div>
            `;
        }).join('') : '<div class="ap-empty">No achievements match your filters.</div>';

        // Pagination HTML
        const paginationHTML = totalPages > 1 ? `
            <div class="ap-pagination">
                <button class="ap-page-btn" data-page="prev" ${_state.page === 0 ? 'disabled' : ''}>&#9664; Prev</button>
                <span class="ap-page-info">${_state.page + 1} / ${totalPages} (${allFiltered.length} achievements)</span>
                <button class="ap-page-btn" data-page="next" ${_state.page >= totalPages - 1 ? 'disabled' : ''}>Next <img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></button>
            </div>
        ` : `<div class="ap-page-info" style="text-align:center;padding:5px;color:#666;font-size:0.7rem;">${allFiltered.length} achievements</div>`;

        // Full layout
        container.innerHTML = `
            <div class="ap-title-display">
                <div class="ap-title-label">YOUR TITLE</div>
                <div class="ap-title-value">${title}</div>
            </div>

            <div class="ap-stats">
                <div class="ap-stat">
                    <div class="ap-stat-value">${stats.unlocked}</div>
                    <div class="ap-stat-label">UNLOCKED</div>
                </div>
                <div class="ap-stat">
                    <div class="ap-stat-value">${stats.total}</div>
                    <div class="ap-stat-label">TOTAL</div>
                </div>
                <div class="ap-stat">
                    <div class="ap-stat-value">${stats.points.toLocaleString()}</div>
                    <div class="ap-stat-label">POINTS</div>
                </div>
                <div class="ap-progress-bar">
                    <div class="ap-progress-track">
                        <div class="ap-progress-fill" style="width: ${stats.percentage}%"></div>
                    </div>
                    <div class="ap-progress-pct">${stats.percentage}%</div>
                </div>
            </div>

            <div class="ap-layout">
                <div class="ap-sidebar">
                    ${sidebarHTML}
                </div>
                <div class="ap-main">
                    <div class="ap-controls">
                        <input class="ap-search" type="text" placeholder="Search achievements..." value="${_state.search}">
                        <div class="ap-filter-group">
                            <button class="ap-filter-btn ${_state.filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                            <button class="ap-filter-btn ${_state.filter === 'unlocked' ? 'active' : ''}" data-filter="unlocked">Unlocked</button>
                            <button class="ap-filter-btn ${_state.filter === 'locked' ? 'active' : ''}" data-filter="locked">Locked</button>
                            <button class="ap-filter-btn ${_state.filter === 'secret' ? 'active' : ''}" data-filter="secret">Secret</button>
                        </div>
                        <select class="ap-sort-select" data-sort>
                            <option value="name" ${_state.sort === 'name' ? 'selected' : ''}>Name</option>
                            <option value="points" ${_state.sort === 'points' ? 'selected' : ''}>Points</option>
                            <option value="date" ${_state.sort === 'date' ? 'selected' : ''}>Date</option>
                        </select>
                    </div>
                    <div class="ap-grid">
                        ${gridHTML}
                    </div>
                    ${paginationHTML}
                </div>
            </div>
        `;

        // Bind events
        bindEvents(container);
    }

    // ═══════════════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════════════

    function bindEvents(container) {
        // Category clicks
        container.querySelectorAll('.ap-cat-item').forEach(el => {
            el.addEventListener('click', () => {
                _state.category = el.dataset.cat || null;
                _state.page = 0;
                render(_container);
            });
        });

        // Filter buttons
        container.querySelectorAll('.ap-filter-btn').forEach(el => {
            el.addEventListener('click', () => {
                _state.filter = el.dataset.filter;
                _state.page = 0;
                render(_container);
            });
        });

        // Sort select
        const sortSelect = container.querySelector('.ap-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                _state.sort = sortSelect.value;
                _state.page = 0;
                render(_container);
            });
        }

        // Search input (debounced)
        const searchInput = container.querySelector('.ap-search');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    _state.search = searchInput.value;
                    _state.page = 0;
                    render(_container);
                    // Re-focus search and restore cursor
                    const newSearch = _container.querySelector('.ap-search');
                    if (newSearch) {
                        newSearch.focus();
                        newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length);
                    }
                }, 250);
            });
        }

        // Pagination
        container.querySelectorAll('.ap-page-btn').forEach(el => {
            el.addEventListener('click', () => {
                if (el.dataset.page === 'prev' && _state.page > 0) {
                    _state.page--;
                } else if (el.dataset.page === 'next') {
                    _state.page++;
                }
                render(_container);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // NOTIFICATION SYSTEM (unified)
    // ═══════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════
    // RARITY HELPERS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Determine rarity tier from points and style
     * Common: <50, Uncommon: 50-99, Rare: 100-199, Epic: 200-499, Legendary: 500+ or style=legendary/cosmic
     */
    function getRarityClass(points, style) {
        if (style === 'legendary' || style === 'cosmic' || points >= 500) return 'rarity-legendary';
        if (points >= 200) return 'rarity-epic';
        if (points >= 100) return 'rarity-rare';
        if (points >= 50) return 'rarity-uncommon';
        return '';
    }

    function getRarityLabel(points, style) {
        if (style === 'legendary' || style === 'cosmic' || points >= 500) return 'LEGENDARY';
        if (points >= 200) return 'EPIC';
        if (points >= 100) return 'RARE';
        return '';
    }

    let _notificationQueue = [];
    let _isShowingNotification = false;

    /**
     * Queue an achievement unlock notification
     */
    function queueNotification(achievement) {
        _notificationQueue.push(achievement);
        if (!_isShowingNotification) {
            showNextNotification();
        }
    }

    function showNextNotification() {
        if (_notificationQueue.length === 0) {
            _isShowingNotification = false;
            return;
        }

        _isShowingNotification = true;
        const ach = _notificationQueue.shift();

        // Remove existing notification
        const existing = document.getElementById('ap-notification');
        if (existing) existing.remove();

        const notif = document.createElement('div');
        notif.id = 'ap-notification';
        notif.className = `achievement-notification ap-notif-pop ${ach.style || ''}`;
        const notifIcon = ach.id ? notifBadgeHTML(ach.id, ach.icon, ach.name) : ach.icon;

        // Generate particle burst HTML (8 particles radiating outward)
        const particleAngles = [0, 45, 90, 135, 180, 225, 270, 315];
        const particleHTML = particleAngles.map((angle, i) => {
            const rad = angle * Math.PI / 180;
            const dist = 30 + Math.random() * 20;
            const tx = Math.cos(rad) * dist;
            const ty = Math.sin(rad) * dist;
            return '<div class="ap-particle" style="animation-name:apParticleBurst;--ptx:' + tx + 'px;--pty:' + ty + 'px;"></div>';
        }).join('');

        // Rarity label
        const rarityLabel = getRarityLabel(ach.points || 0, ach.style);

        notif.innerHTML = `
            <div class="ap-notif-particles">${particleHTML}</div>
            <div class="achievement-notif-icon">${notifIcon}</div>
            <div class="achievement-notif-content">
                <div class="achievement-notif-label">ACHIEVEMENT UNLOCKED</div>
                <div class="achievement-notif-name">${ach.name}</div>
                <div class="achievement-notif-points">+${ach.points} pts${rarityLabel ? ' &middot; ' + rarityLabel : ''}</div>
            </div>
        `;

        document.body.appendChild(notif);

        // Set particle trajectories via inline style
        notif.querySelectorAll('.ap-particle').forEach((p, i) => {
            const angle = particleAngles[i] * Math.PI / 180;
            const dist = 30 + Math.random() * 20;
            p.style.setProperty('--ptx', (Math.cos(angle) * dist) + 'px');
            p.style.setProperty('--pty', (Math.sin(angle) * dist) + 'px');
        });

        // Play sound if available
        try {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                playUnlockSound(ach.style);
            }
        } catch {}

        // Dispatch event for live dashboard counter update
        try {
            window.dispatchEvent(new CustomEvent('hexworth:achievementUnlocked', {
                detail: { id: ach.id, name: ach.name, points: ach.points }
            }));
        } catch {}

        // Auto-remove and show next
        setTimeout(() => {
            notif.style.animation = 'achievementSlideIn 0.3s ease-in reverse forwards';
            setTimeout(() => {
                notif.remove();
                showNextNotification();
            }, 300);
        }, 4000);
    }

    /**
     * Play a short CEG arpeggio for achievement unlock
     */
    function playUnlockSound(style) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            const notes = style === 'legendary' ? [523.25, 659.25, 783.99, 1046.50] : [523.25, 659.25, 783.99];
            const duration = style === 'legendary' ? 0.2 : 0.15;

            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.08, ctx.currentTime + i * duration);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * duration + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * duration);
                osc.stop(ctx.currentTime + i * duration + 0.5);
            });

            setTimeout(() => ctx.close(), 2000);
        } catch {}
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════
    // LIVE DASHBOARD COUNTER UPDATE
    // ═══════════════════════════════════════════════════════════════════

    window.addEventListener('hexworth:achievementUnlocked', function() {
        // Update dashboard stat counter
        const el = document.getElementById('achievementsEarned');
        if (el) {
            const current = parseInt(el.textContent, 10) || 0;
            el.textContent = current + 1;
            // Brief highlight flash
            el.style.transition = 'color 0.3s';
            el.style.color = '#ffd700';
            setTimeout(() => { el.style.color = ''; }, 1500);
        }
        // Update achievement panel counter if visible
        const achCount = document.getElementById('achievementCount');
        if (achCount && typeof AchievementRegistry !== 'undefined') {
            const stats = AchievementRegistry.getStats();
            achCount.textContent = stats.unlocked + '/' + stats.total;
        }
        // Re-render panel if it's currently visible
        if (_container && _container.offsetParent !== null) {
            render(_container);
        }
    });

    return {
        render,
        queueNotification,
        resetFilters() {
            _state = { category: null, filter: 'all', sort: 'name', search: '', page: 0 };
            if (_container) render(_container);
        }
    };
})();
