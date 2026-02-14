/**
 * ContentDiscovery.js - Universal Content Search & Filter System
 *
 * Provides search, filtering, and organization for house content.
 * Now with GLOBAL SEARCH - finds content across ALL houses!
 *
 * Features:
 * - Real-time search by title/description/tags
 * - GLOBAL SEARCH across all houses (via ContentCatalog.js)
 * - Filter by content type (presentation, lab, quiz, applet)
 * - Filter by category
 * - "Start Here" recommended section
 * - Compact/Grid view toggle
 * - Cross-house navigation
 *
 * Usage: Include after ContentCatalog.js and house SAMPLE_MODULES
 * <script src="../../components/ContentCatalog.js"></script>
 * <script src="../../components/ContentDiscovery.js"></script>
 */

(function() {
    'use strict';

    // Detect current house from URL
    function getCurrentHouse() {
        const path = window.location.pathname;
        const match = path.match(/houses\/([^/]+)/);
        return match ? match[1] : null;
    }

    // Wait for DOM and data to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Check if this page has the required data
        if (typeof SAMPLE_MODULES === 'undefined' || typeof CATEGORIES === 'undefined') {
            console.log('ContentDiscovery: No SAMPLE_MODULES or CATEGORIES found, skipping.');
            return;
        }

        // Initialize discovery system
        initContentDiscovery();
    });

    function initContentDiscovery() {
        // Get house primary color from CSS variables
        const styles = getComputedStyle(document.documentElement);
        const primaryColor = styles.getPropertyValue('--house-primary').trim() || '#6366f1';
        const currentHouse = getCurrentHouse();

        // Inject styles
        injectStyles(primaryColor);

        // Create and inject the discovery panel
        const discoveryPanel = createDiscoveryPanel();

        // Inject into explicit anchor if present, otherwise fall back to last content-section
        const anchor = document.getElementById('discoveryAnchor');
        if (anchor) {
            anchor.appendChild(discoveryPanel);
        } else {
            const moduleSection = document.querySelector('.content-section:last-of-type');
            if (moduleSection) {
                moduleSection.insertBefore(discoveryPanel, moduleSection.firstChild.nextSibling);
            }
        }

        // Create results container for search/filter output
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'discoveryResultsContainer';
        discoveryPanel.after(resultsContainer);

        // Initialize filter state
        window.discoveryState = {
            searchQuery: '',
            typeFilter: 'all',
            categoryFilter: 'all',
            viewMode: 'grid',
            currentHouse: currentHouse,
            showGlobalResults: true
        };

        // Bind event listeners
        bindDiscoveryEvents();

        // Inject favorite heart buttons on module cards
        injectFavoriteButtons(currentHouse);

        // Add "Start Here" section if not exists
        addStartHereSection();

        // Check if ContentCatalog is available
        const hasGlobal = typeof ContentCatalog !== 'undefined';
        console.log(`%c🔍 ContentDiscovery initialized ${hasGlobal ? '(Global Search Enabled)' : '(Local Only)'}`, 'color: ' + primaryColor);
    }

    function injectStyles(primaryColor) {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            /* Content Discovery Panel */
            .discovery-panel {
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
            }

            .discovery-search-row {
                display: flex;
                gap: 12px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }

            .discovery-search-box {
                flex: 1;
                min-width: 250px;
                position: relative;
            }

            .discovery-search-input {
                width: 100%;
                padding: 12px 16px 12px 42px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #e0e0e0;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            }

            .discovery-search-input:focus {
                outline: none;
                border-color: ${primaryColor};
                box-shadow: 0 0 0 3px ${primaryColor}33;
            }

            .discovery-search-input::placeholder {
                color: #666;
            }

            .discovery-search-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                color: #666;
                font-size: 1rem;
                pointer-events: none;
            }

            .discovery-global-badge {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: ${primaryColor}33;
                color: ${primaryColor};
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.65rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .discovery-filters {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            }

            .discovery-filter-group {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
            }

            .discovery-filter-btn {
                padding: 8px 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                color: #888;
                font-size: 0.75rem;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .discovery-filter-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .discovery-filter-btn.active {
                background: ${primaryColor}22;
                border-color: ${primaryColor}66;
                color: ${primaryColor};
            }

            .discovery-filter-divider {
                width: 1px;
                height: 24px;
                background: rgba(255, 255, 255, 0.1);
                margin: 0 8px;
            }

            .discovery-results-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }

            .discovery-results-count {
                font-size: 0.8rem;
                color: #666;
            }

            .discovery-results-count strong {
                color: ${primaryColor};
            }

            .discovery-view-toggle {
                display: flex;
                gap: 4px;
            }

            .discovery-view-btn {
                padding: 6px 10px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #666;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .discovery-view-btn:hover {
                color: #888;
            }

            .discovery-view-btn.active {
                background: ${primaryColor}22;
                border-color: ${primaryColor}44;
                color: ${primaryColor};
            }

            /* Module card enhancements */
            .module-card.discovery-hidden {
                display: none !important;
            }

            .module-card .module-type-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 0.6rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .module-type-badge.type-presentation {
                background: rgba(59, 130, 246, 0.2);
                color: #60a5fa;
            }

            .module-type-badge.type-lab {
                background: rgba(16, 185, 129, 0.2);
                color: #34d399;
            }

            .module-type-badge.type-quiz {
                background: rgba(245, 158, 11, 0.2);
                color: #fbbf24;
            }

            .module-type-badge.type-applet {
                background: rgba(168, 85, 247, 0.2);
                color: #c084fc;
            }

            .module-type-badge.type-game {
                background: rgba(34, 197, 94, 0.2);
                color: #4ade80;
            }

            .module-type-badge.type-review {
                background: rgba(245, 158, 11, 0.2);
                color: #fbbf24;
            }

            .module-type-badge.type-exam {
                background: rgba(239, 68, 68, 0.2);
                color: #f87171;
            }

            .module-type-badge.type-tool {
                background: rgba(6, 182, 212, 0.2);
                color: #22d3ee;
            }

            /* Favorite heart button on module cards */
            .module-favorite-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 1.1rem;
                cursor: pointer;
                opacity: 0.4;
                transition: all 0.2s ease;
                padding: 2px 4px;
                line-height: 1;
                z-index: 2;
            }

            .module-favorite-btn:hover {
                opacity: 0.8;
                transform: scale(1.2);
            }

            .module-favorite-btn.favorited {
                opacity: 1;
                color: #ef4444;
            }

            /* Shift type badge left when heart is present */
            .module-card .module-type-badge {
                right: 34px;
            }

            /* Global Search Results Section */
            .global-results-section {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid rgba(255, 255, 255, 0.1);
            }

            .global-results-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
            }

            .global-results-title {
                font-size: 0.9rem;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            .global-results-count {
                background: rgba(255, 255, 255, 0.1);
                padding: 2px 10px;
                border-radius: 10px;
                font-size: 0.75rem;
                color: #666;
            }

            .global-house-group {
                margin-bottom: 20px;
            }

            .global-house-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 10px;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .global-house-header:hover {
                background: rgba(0, 0, 0, 0.3);
            }

            .global-house-icon {
                font-size: 1.2rem;
            }

            .global-house-name {
                font-size: 0.85rem;
                color: #ccc;
                flex: 1;
            }

            .global-house-count {
                font-size: 0.7rem;
                color: #666;
                background: rgba(255, 255, 255, 0.05);
                padding: 2px 8px;
                border-radius: 10px;
            }

            .global-module-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 10px;
                padding-left: 20px;
            }

            .global-module-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 15px;
                background: rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .global-module-item:hover {
                background: rgba(0, 0, 0, 0.25);
                border-color: rgba(255, 255, 255, 0.1);
                transform: translateX(4px);
            }

            .global-module-icon {
                font-size: 1.3rem;
                flex-shrink: 0;
            }

            .global-module-info {
                flex: 1;
                min-width: 0;
            }

            .global-module-title {
                font-size: 0.85rem;
                color: #ddd;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .global-module-desc {
                font-size: 0.7rem;
                color: #666;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .global-module-arrow {
                color: #444;
                flex-shrink: 0;
                transition: transform 0.2s ease;
            }

            .global-module-item:hover .global-module-arrow {
                transform: translateX(4px);
                color: ${primaryColor};
            }

            /* Start Here Section */
            .start-here-section {
                background: linear-gradient(135deg, ${primaryColor}11, ${primaryColor}05);
                border: 1px solid ${primaryColor}33;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 30px;
            }

            .start-here-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
            }

            .start-here-icon {
                font-size: 1.5rem;
            }

            .start-here-title {
                font-size: 1rem;
                color: ${primaryColor};
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }

            .start-here-description {
                font-size: 0.85rem;
                color: #888;
                margin-bottom: 20px;
                line-height: 1.6;
            }

            .start-here-items {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 12px;
            }

            .start-here-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .start-here-item:hover {
                background: rgba(0, 0, 0, 0.3);
                border-color: ${primaryColor}44;
                transform: translateX(4px);
            }

            .start-here-item-icon {
                font-size: 1.3rem;
            }

            .start-here-item-info {
                flex: 1;
            }

            .start-here-item-title {
                font-size: 0.9rem;
                color: #ddd;
                margin-bottom: 2px;
            }

            .start-here-item-type {
                font-size: 0.7rem;
                color: #666;
            }

            .start-here-item-arrow {
                color: #444;
                transition: transform 0.2s ease;
            }

            .start-here-item:hover .start-here-item-arrow {
                transform: translateX(4px);
                color: ${primaryColor};
            }

            /* Compact list view */
            .module-grid.view-compact {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .module-grid.view-compact .module-card {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 12px 16px;
            }

            .module-grid.view-compact .module-header {
                display: contents;
            }

            .module-grid.view-compact .module-icon {
                font-size: 1.2rem;
                margin-bottom: 0;
            }

            .module-grid.view-compact .module-title {
                flex: 1;
                margin-bottom: 0;
            }

            .module-grid.view-compact .module-description {
                display: none;
            }

            .module-grid.view-compact .module-status {
                margin-top: 0;
            }

            .module-grid.view-compact .module-components {
                display: none;
            }

            /* No results message */
            .discovery-no-results {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .discovery-no-results-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .discovery-no-results-text {
                font-size: 0.95rem;
                margin-bottom: 8px;
            }

            .discovery-no-results-hint {
                font-size: 0.8rem;
                color: #555;
            }

            .discovery-clear-btn {
                margin-top: 15px;
                padding: 8px 20px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #888;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .discovery-clear-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            /* Highlight search matches */
            .discovery-highlight {
                background: ${primaryColor}44;
                padding: 0 2px;
                border-radius: 2px;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    function createDiscoveryPanel() {
        const panel = document.createElement('div');
        panel.className = 'discovery-panel';
        panel.id = 'discoveryPanel';

        // Type config map for dynamic button generation
        const typeConfig = {
            presentation: { icon: '📊', label: 'Slides' },
            lab: { icon: '🧪', label: 'Labs' },
            quiz: { icon: '📝', label: 'Quizzes' },
            applet: { icon: '🎮', label: 'Interactive' },
            game: { icon: '🕹️', label: 'Games' },
            review: { icon: '🔄', label: 'Reviews' },
            exam: { icon: '📋', label: 'Exams' },
            tool: { icon: '🔧', label: 'Tools' },
            guide: { icon: '📖', label: 'Guides' }
        };

        // Get unique content types from modules
        const types = [...new Set(SAMPLE_MODULES.flatMap(m => m.components || []))];
        const hasGlobal = typeof ContentCatalog !== 'undefined';

        // Build type filter buttons dynamically from types found in SAMPLE_MODULES
        const typeButtons = types
            .filter(t => typeConfig[t])
            .map(t => `<button class="discovery-filter-btn" data-type="${t}">${typeConfig[t].icon} ${typeConfig[t].label}</button>`)
            .join('');

        panel.innerHTML = `
            <div class="discovery-search-row">
                <div class="discovery-search-box">
                    <span class="discovery-search-icon">🔍</span>
                    <input type="text"
                           class="discovery-search-input"
                           id="discoverySearch"
                           placeholder="${hasGlobal ? 'Search all houses...' : 'Search modules...'}">
                    ${hasGlobal ? '<span class="discovery-global-badge">Global</span>' : ''}
                </div>
            </div>
            <div class="discovery-filters">
                <div class="discovery-filter-group" id="typeFilters">
                    <button class="discovery-filter-btn active" data-type="all">All Types</button>
                    ${typeButtons}
                </div>
                <div class="discovery-filter-divider"></div>
                <div class="discovery-filter-group" id="categoryFilters">
                    <button class="discovery-filter-btn active" data-category="all">All Categories</button>
                    ${CATEGORIES.slice(0, 6).map(cat =>
                        `<button class="discovery-filter-btn" data-category="${cat.id}">${cat.icon || '📁'} ${cat.name}</button>`
                    ).join('')}
                </div>
            </div>
            <div class="discovery-results-bar">
                <div class="discovery-results-count" id="discoveryResultsCount">
                    Showing <strong>${SAMPLE_MODULES.length}</strong> modules in this house
                </div>
                <div class="discovery-view-toggle">
                    <button class="discovery-view-btn active" data-view="grid" title="Grid view">⊞</button>
                    <button class="discovery-view-btn" data-view="compact" title="Compact list">☰</button>
                </div>
            </div>
        `;

        return panel;
    }

    function bindDiscoveryEvents() {
        // Search input
        const searchInput = document.getElementById('discoverySearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function(e) {
                window.discoveryState.searchQuery = e.target.value.toLowerCase();
                applyFilters();
            }, 200));

            // Keyboard shortcut: / to focus search
            document.addEventListener('keydown', function(e) {
                if (e.key === '/' && document.activeElement !== searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
        }

        // Type filter buttons
        document.querySelectorAll('#typeFilters .discovery-filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#typeFilters .discovery-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                window.discoveryState.typeFilter = this.dataset.type;
                applyFilters();
            });
        });

        // Category filter buttons
        document.querySelectorAll('#categoryFilters .discovery-filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#categoryFilters .discovery-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                window.discoveryState.categoryFilter = this.dataset.category;
                applyFilters();
            });
        });

        // View toggle buttons
        document.querySelectorAll('.discovery-view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.discovery-view-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                window.discoveryState.viewMode = this.dataset.view;
                applyViewMode();
            });
        });
    }

    function applyFilters() {
        const { searchQuery, typeFilter, categoryFilter, currentHouse } = window.discoveryState;
        const hasActiveFilter = searchQuery || typeFilter !== 'all' || categoryFilter !== 'all';
        const hasCatalog = typeof ContentCatalog !== 'undefined';

        let localResults = [];
        let globalResults = [];

        if (searchQuery && searchQuery.length >= 2 && hasCatalog) {
            // Use ContentCatalog.search() for both local and global (multi-term matching + relevance sort)
            const allResults = ContentCatalog.search(searchQuery, {
                type: typeFilter !== 'all' ? typeFilter : null,
                limit: 100
            });
            localResults = allResults.filter(m => m.house === currentHouse);
            globalResults = allResults.filter(m => m.house !== currentHouse);

            // Apply category filter to local results (not supported by ContentCatalog.search)
            if (categoryFilter !== 'all') {
                localResults = localResults.filter(m => m.category === categoryFilter);
            }
        } else if (hasActiveFilter && typeof SAMPLE_MODULES !== 'undefined') {
            // Pure type/category filter (no search query) — filter SAMPLE_MODULES directly
            localResults = SAMPLE_MODULES.filter(function(module) {
                if (typeFilter !== 'all' && (!module.components || !module.components.includes(typeFilter))) return false;
                if (categoryFilter !== 'all' && module.category !== categoryFilter) return false;
                return true;
            });
        }

        // Update results count
        const countEl = document.getElementById('discoveryResultsCount');
        if (countEl) {
            if (!hasActiveFilter) {
                countEl.innerHTML = `<strong>${SAMPLE_MODULES.length}</strong> modules in this house`;
            } else if (globalResults.length > 0) {
                countEl.innerHTML = `<strong>${localResults.length}</strong> in this house, <strong>${globalResults.length}</strong> in other houses`;
            } else {
                countEl.innerHTML = `Showing <strong>${localResults.length}</strong> of ${SAMPLE_MODULES.length} modules`;
            }
        }

        // Render all results into discovery container
        renderDiscoveryResults(localResults, globalResults);
    }

    function renderDiscoveryResults(localResults, globalResults) {
        const container = document.getElementById('discoveryResultsContainer');
        if (!container) return;

        container.innerHTML = '';
        const hasActiveFilter = window.discoveryState.searchQuery ||
                                window.discoveryState.typeFilter !== 'all' ||
                                window.discoveryState.categoryFilter !== 'all';

        if (!hasActiveFilter) return;

        if (localResults.length === 0 && globalResults.length === 0) {
            container.innerHTML = `
                <div class="discovery-no-results">
                    <div class="discovery-no-results-icon">🔍</div>
                    <div class="discovery-no-results-text">No modules found for "${window.discoveryState.searchQuery || 'selected filters'}"</div>
                    <div class="discovery-no-results-hint">Try different keywords or check spelling</div>
                    <button class="discovery-clear-btn" onclick="clearDiscoveryFilters()">Clear Search</button>
                </div>`;
            return;
        }

        let html = '';

        // Local results (this house)
        if (localResults.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <div class="global-results-header">
                        <span class="global-results-title">📍 This House</span>
                        <span class="global-results-count">${localResults.length} results</span>
                    </div>
                    <div class="global-module-list" style="padding-left: 0;">
                        ${localResults.map(m => `
                            <div class="global-module-item" onclick="window.location.href='${m.href}'">
                                <span class="global-module-icon">${m.icon}</span>
                                <div class="global-module-info">
                                    <div class="global-module-title">${m.title}</div>
                                    <div class="global-module-desc">${m.description}</div>
                                </div>
                                <span class="global-module-arrow">→</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        }

        // Global results (other houses)
        if (globalResults.length > 0) {
            const byHouse = {};
            globalResults.forEach(module => {
                if (!byHouse[module.house]) {
                    byHouse[module.house] = {
                        house: module.house,
                        houseName: module.houseName,
                        houseIcon: module.houseIcon,
                        houseColor: module.houseColor,
                        modules: []
                    };
                }
                byHouse[module.house].modules.push(module);
            });

            html += `
                <div class="global-results-section">
                    <div class="global-results-header">
                        <span class="global-results-title">🌐 Other Houses</span>
                        <span class="global-results-count">${globalResults.length} results</span>
                    </div>
                    ${Object.values(byHouse).map(group => `
                        <div class="global-house-group">
                            <div class="global-house-header" style="border-left: 3px solid ${group.houseColor}">
                                <span class="global-house-icon">${group.houseIcon}</span>
                                <span class="global-house-name">${group.houseName}</span>
                                <span class="global-house-count">${group.modules.length}</span>
                            </div>
                            <div class="global-module-list">
                                ${group.modules.map(m => `
                                    <div class="global-module-item" onclick="navigateToModule('${m.fullHref}')">
                                        <span class="global-module-icon">${m.icon}</span>
                                        <div class="global-module-info">
                                            <div class="global-module-title">${m.title}</div>
                                            <div class="global-module-desc">${m.description}</div>
                                        </div>
                                        <span class="global-module-arrow">→</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        }

        container.innerHTML = html;
    }

    // Global function to navigate to a module in another house
    window.navigateToModule = function(href) {
        // Calculate relative path from current location
        // We're in houses/[house]/index.html, target is houses/[other]/path
        window.location.href = '../../' + href;
    };

    function applyViewMode() {
        const moduleGrid = document.getElementById('hrModuleGrid') || document.getElementById('moduleGrid');
        if (!moduleGrid) return;

        if (window.discoveryState.viewMode === 'compact') {
            moduleGrid.classList.add('view-compact');
        } else {
            moduleGrid.classList.remove('view-compact');
        }
    }

    // handleNoResults is now integrated into renderDiscoveryResults

    // Global function to clear filters
    window.clearDiscoveryFilters = function() {
        window.discoveryState = {
            searchQuery: '',
            typeFilter: 'all',
            categoryFilter: 'all',
            viewMode: window.discoveryState.viewMode,
            currentHouse: window.discoveryState.currentHouse,
            showGlobalResults: true
        };

        // Reset UI
        document.getElementById('discoverySearch').value = '';
        document.querySelectorAll('.discovery-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'all' || btn.dataset.category === 'all');
        });

        applyFilters();
    };

    function addStartHereSection() {
        // Find recommended starting modules
        const starters = SAMPLE_MODULES.filter(m =>
            m.status === 'available' &&
            (m.title.toLowerCase().includes('fundamental') ||
             m.title.toLowerCase().includes('basic') ||
             m.title.toLowerCase().includes('intro') ||
             m.title.toLowerCase().includes('101') ||
             m.title.toLowerCase().includes('overview') ||
             m.featured ||
             (m.components && m.components.includes('presentation')))
        ).slice(0, 4);

        if (starters.length === 0) return;

        // Find hero section to insert after
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const startHere = document.createElement('section');
        startHere.className = 'start-here-section';
        startHere.innerHTML = `
            <div class="start-here-header">
                <span class="start-here-icon">🚀</span>
                <h2 class="start-here-title">Start Here</h2>
            </div>
            <p class="start-here-description">
                New to this house? These foundational modules will help you get started.
            </p>
            <div class="start-here-items">
                ${starters.map(m => `
                    <div class="start-here-item" onclick="if('${m.href}')window.location.href='${m.href}'">
                        <span class="start-here-item-icon">${m.icon}</span>
                        <div class="start-here-item-info">
                            <div class="start-here-item-title">${m.title}</div>
                            <div class="start-here-item-type">${getTypeLabel(m.components)}</div>
                        </div>
                        <span class="start-here-item-arrow">→</span>
                    </div>
                `).join('')}
            </div>
        `;

        heroSection.after(startHere);
    }

    function injectFavoriteButtons(currentHouse) {
        if (typeof FavoritesManager === 'undefined') return;

        // Scope to HouseRenderer's module grid to avoid index mismatch
        const moduleCards = document.querySelectorAll('#hrModuleGrid .module-card, #moduleGrid .module-card');
        moduleCards.forEach((card, index) => {
            const module = SAMPLE_MODULES[index];
            if (!module) return;

            // Don't double-inject
            if (card.querySelector('.module-favorite-btn')) return;

            // Make card position relative for absolute heart placement
            card.style.position = 'relative';

            const btn = document.createElement('button');
            btn.className = 'module-favorite-btn' + (FavoritesManager.isFavorite(module.id) ? ' favorited' : '');
            btn.innerHTML = FavoritesManager.isFavorite(module.id) ? '♥' : '♡';
            btn.title = 'Add to Favorites';

            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const meta = {
                    title: module.title,
                    house: currentHouse || '',
                    icon: module.icon || '',
                    type: (module.components && module.components[0]) || '',
                    href: module.href || module.path || ''
                };
                const nowFavorited = FavoritesManager.toggle(module.id, meta);
                btn.classList.toggle('favorited', nowFavorited);
                btn.innerHTML = nowFavorited ? '♥' : '♡';
            });

            card.appendChild(btn);
        });
    }

    function getTypeLabel(components) {
        if (!components || components.length === 0) return 'Module';
        const labels = {
            presentation: 'Presentation',
            lab: 'Hands-on Lab',
            quiz: 'Knowledge Check',
            applet: 'Interactive Tool',
            game: 'Game',
            review: 'Review Activity',
            exam: 'Exam',
            tool: 'Tool',
            guide: 'Study Guide'
        };
        return components.map(c => labels[c] || c).join(' + ');
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

})();
