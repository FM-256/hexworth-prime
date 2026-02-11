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
                grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                gap: 10px;
                overflow-y: auto;
                flex: 1;
                padding-bottom: 10px;
            }

            .ap-card {
                background: rgba(255,255,255,0.03);
                border: 1px solid #333;
                border-radius: 10px;
                padding: 12px 8px;
                text-align: center;
                transition: all 0.2s;
                cursor: default;
            }

            .ap-card.unlocked {
                border-color: var(--house-primary, #60a5fa);
                background: rgba(var(--house-primary-rgb, 100,100,255), 0.08);
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
            }

            .ap-card.locked .ap-card-icon {
                filter: grayscale(1);
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
                    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
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
        const gridHTML = pageItems.length > 0 ? pageItems.map(ach => {
            const isUnlocked = unlockedSet.has(ach.id);
            const isSecret = ach.secret;
            const displayIcon = (isUnlocked || !isSecret) ? ach.icon : '❓';
            const displayName = (isUnlocked || !isSecret) ? ach.name : '???';
            const displayDesc = isUnlocked ? ach.description : (isSecret ? '???' : ach.description);

            const classes = ['ap-card'];
            classes.push(isUnlocked ? 'unlocked' : 'locked');
            if (isSecret) classes.push('secret');
            if (isUnlocked && ach.style) classes.push(ach.style);

            let dateHTML = '';
            if (isUnlocked) {
                try {
                    const v2 = JSON.parse(localStorage.getItem('hexworth_achievements_v2') || '{}');
                    const ts = v2?.unlocked?.[ach.id]?.unlockedAt;
                    if (ts) {
                        dateHTML = `<div class="ap-card-date">${new Date(ts).toLocaleDateString()}</div>`;
                    }
                } catch {}
            }

            return `
                <div class="${classes.join(' ')}" title="${isUnlocked ? ach.description : ''}">
                    <div class="ap-card-icon">${displayIcon}</div>
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
                <button class="ap-page-btn" data-page="next" ${_state.page >= totalPages - 1 ? 'disabled' : ''}>Next &#9654;</button>
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
        notif.className = `achievement-notification ${ach.style || ''}`;
        notif.innerHTML = `
            <div class="achievement-notif-icon">${ach.icon}</div>
            <div class="achievement-notif-content">
                <div class="achievement-notif-label">ACHIEVEMENT UNLOCKED</div>
                <div class="achievement-notif-name">${ach.name}</div>
                <div class="achievement-notif-points">+${ach.points} pts</div>
            </div>
        `;

        document.body.appendChild(notif);

        // Play sound if available
        try {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                playUnlockSound(ach.style);
            }
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

    return {
        render,
        queueNotification,
        resetFilters() {
            _state = { category: null, filter: 'all', sort: 'name', search: '', page: 0 };
            if (_container) render(_container);
        }
    };
})();
