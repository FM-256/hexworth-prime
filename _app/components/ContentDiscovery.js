/**
 * ContentDiscovery.js - Universal Content Search & Filter System
 *
 * Provides search, filtering, and organization for Hexworth Prime content.
 * Self-initializing: auto-detects page context (house, dashboard, vault, arcade).
 * Also exposes a manual API for custom integrations.
 *
 * Features:
 * - Fuzzy token-based search (split query into words, match all tokens)
 * - Relevance scoring (title > description > tags)
 * - Tag-based filter chips (presentation, quiz, lab, applet, tool, game)
 * - Content type filter chips
 * - Cross-house toggle (default: current house only; toggle for all houses)
 * - `/` keyboard shortcut to focus search
 * - Escape key closes dropdown
 * - 200ms debounced input
 * - GLOBAL SEARCH across all houses via ContentCatalog.js
 *
 * Usage:
 *   Auto-init: Include after ContentCatalog.js
 *     <script src="../../components/ContentCatalog.js"></script>
 *     <script src="../../components/ContentDiscovery.js"></script>
 *
 *   Manual init with options:
 *     ContentDiscovery.init({
 *         container: '#mySearchContainer',
 *         context: 'house',         // 'house' | 'dashboard' | 'vault' | 'arcade' | 'global'
 *         houseFilter: 'web',       // restrict to a specific house
 *         typeFilter: null,          // restrict to a content type
 *         showCrossHouseToggle: true,
 *         showTypeChips: true,
 *         showTagChips: true,
 *         placeholder: 'Search...',
 *         maxResults: 50,
 *         onSelect: (module) => {},  // callback when user clicks a result
 *     });
 */

const ContentDiscovery = (function() {
    'use strict';

    // ========================================
    // STATE
    // ========================================
    let instances = [];
    let globalStylesInjected = false;
    let globalKeyboardBound = false;

    // Type display config
    const TYPE_CONFIG = {
        presentation: { icon: '📊', label: 'Slides', color: '#60a5fa' },
        lab:          { icon: '🧪', label: 'Labs', color: '#34d399' },
        quiz:         { icon: '📝', label: 'Quizzes', color: '#fbbf24' },
        applet:       { icon: '🎮', label: 'Interactive', color: '#c084fc' },
        game:         { icon: '🕹️', label: 'Games', color: '#4ade80' },
        review:       { icon: '🔄', label: 'Reviews', color: '#fb923c' },
        exam:         { icon: '📋', label: 'Exams', color: '#f87171' },
        tool:         { icon: '🔧', label: 'Tools', color: '#22d3ee' },
        guide:        { icon: '📖', label: 'Guides', color: '#a78bfa' },
        reference:    { icon: '📚', label: 'Reference', color: '#94a3b8' },
        module:       { icon: '📦', label: 'Modules', color: '#e879f9' }
    };

    function catIconHTML(mod) {
        if (!mod.category) return mod.icon || '📄';
        return `<img src="/assets/images/categories/${mod.category}.webp" alt="" onerror="this.outerHTML='${mod.icon || '📄'}'">`;
    }

    // ========================================
    // AUTO-INIT
    // ========================================

    function autoInit() {
        // Skip auto-init if no ContentCatalog (required)
        if (typeof ContentCatalog === 'undefined') {
            console.log('ContentDiscovery: ContentCatalog not found, skipping auto-init.');
            return;
        }

        // Detect page context
        const context = detectContext();

        // For house pages with SAMPLE_MODULES and CATEGORIES, inject the legacy
        // discovery panel (backwards compatibility with HouseRenderer)
        if (context.type === 'house' && typeof SAMPLE_MODULES !== 'undefined' && typeof CATEGORIES !== 'undefined') {
            initHouseDiscovery(context);
        }
    }

    function detectContext() {
        const path = window.location.pathname;
        const ctx = { type: 'unknown', house: null, path: path };

        // House page: /houses/{houseId}/
        const houseMatch = path.match(/houses\/([^/]+)/);
        if (houseMatch) {
            ctx.type = 'house';
            ctx.house = houseMatch[1];
        }

        // Dashboard
        if (path.includes('dashboard.html')) {
            ctx.type = 'dashboard';
        }

        // Vault
        if (path.includes('dark-arts/vault')) {
            ctx.type = 'vault';
            ctx.house = 'dark-arts';
        }

        // Arcade / Games
        if (path.includes('games.html')) {
            ctx.type = 'arcade';
        }

        return ctx;
    }

    // ========================================
    // HOUSE DISCOVERY (legacy panel mode)
    // ========================================

    function initHouseDiscovery(context) {
        const styles = getComputedStyle(document.documentElement);
        const primaryColor = styles.getPropertyValue('--house-primary').trim() || '#6366f1';
        const currentHouse = context.house;

        // Inject global styles once
        if (!globalStylesInjected) {
            injectGlobalStyles(primaryColor);
            globalStylesInjected = true;
        }

        // Create and inject the discovery panel
        const discoveryPanel = createDiscoveryPanel(currentHouse, primaryColor);

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
            showGlobalResults: true,
            crossHouseEnabled: true
        };

        // Bind event listeners
        bindDiscoveryEvents(currentHouse, primaryColor);

        // Inject favorite heart buttons on module cards
        injectFavoriteButtons(currentHouse);

        // Add "Start Here" section if not exists
        addStartHereSection(primaryColor);

        // Bind global keyboard shortcut
        if (!globalKeyboardBound) {
            bindGlobalKeyboard();
            globalKeyboardBound = true;
        }

        const hasGlobal = typeof ContentCatalog !== 'undefined';
        console.log(`%c ContentDiscovery initialized ${hasGlobal ? '(Global Search Enabled)' : '(Local Only)'}`, 'color: ' + primaryColor);
    }

    // ========================================
    // PUBLIC API: init()
    // ========================================

    /**
     * Manual initialization for custom integrations.
     * @param {Object} opts Configuration options
     * @returns {Object} Instance with search/destroy methods
     */
    function init(opts = {}) {
        const {
            container = null,
            context = 'global',
            houseFilter = null,
            typeFilter = null,
            showCrossHouseToggle = true,
            showTypeChips = true,
            showTagChips = false,
            placeholder = 'Search all content...',
            maxResults = 50,
            onSelect = null,
            primaryColor = '#6366f1',
            inlineMode = false     // true = dropdown results below search bar
        } = opts;

        if (typeof ContentCatalog === 'undefined') {
            console.warn('ContentDiscovery.init: ContentCatalog not found.');
            return null;
        }

        // Inject global styles once
        if (!globalStylesInjected) {
            injectGlobalStyles(primaryColor);
            globalStylesInjected = true;
        }

        // Get or create container
        let containerEl;
        if (typeof container === 'string') {
            containerEl = document.querySelector(container);
        } else if (container instanceof HTMLElement) {
            containerEl = container;
        }

        if (!containerEl) {
            console.warn('ContentDiscovery.init: container not found:', container);
            return null;
        }

        // Create the universal search widget
        const instanceId = 'cd-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        const widget = createUniversalWidget({
            instanceId,
            houseFilter,
            typeFilter,
            showCrossHouseToggle,
            showTypeChips,
            showTagChips,
            placeholder,
            maxResults,
            onSelect,
            primaryColor,
            inlineMode,
            context
        });

        containerEl.appendChild(widget.el);

        // Store instance
        const instance = {
            id: instanceId,
            el: widget.el,
            search: widget.search,
            destroy: () => {
                widget.el.remove();
                instances = instances.filter(i => i.id !== instanceId);
            }
        };

        instances.push(instance);

        // Bind global keyboard shortcut
        if (!globalKeyboardBound) {
            bindGlobalKeyboard();
            globalKeyboardBound = true;
        }

        return instance;
    }

    // ========================================
    // UNIVERSAL WIDGET (for manual init)
    // ========================================

    function createUniversalWidget(opts) {
        const {
            instanceId, houseFilter, typeFilter, showCrossHouseToggle,
            showTypeChips, showTagChips, placeholder, maxResults,
            onSelect, primaryColor, inlineMode, context
        } = opts;

        const wrapper = document.createElement('div');
        wrapper.className = 'cd-widget';
        wrapper.id = instanceId;
        wrapper.setAttribute('data-cd-instance', instanceId);

        // State
        let state = {
            query: '',
            typeFilter: typeFilter || 'all',
            houseFilter: houseFilter || 'all',
            crossHouse: !houseFilter,
            isOpen: false
        };

        // Build search bar
        const searchBar = document.createElement('div');
        searchBar.className = 'cd-search-bar';
        searchBar.innerHTML = `
            <span class="cd-search-icon">&#128269;</span>
            <input type="text"
                   class="cd-search-input"
                   id="${instanceId}-input"
                   placeholder="${placeholder}"
                   autocomplete="off">
            <span class="cd-kbd-hint" id="${instanceId}-kbd">/</span>
        `;
        wrapper.appendChild(searchBar);

        // Build type chips row
        if (showTypeChips) {
            const chipsRow = document.createElement('div');
            chipsRow.className = 'cd-chips-row';
            chipsRow.id = `${instanceId}-chips`;

            // All Types chip
            chipsRow.innerHTML = `<button class="cd-chip active" data-type="all">All Types</button>`;

            // Get available types from catalog
            const allModules = ContentCatalog.getAllModules();
            const typesSet = new Set();
            allModules.forEach(m => {
                if (m.components) m.components.forEach(c => typesSet.add(c));
            });

            Array.from(typesSet).sort().forEach(type => {
                const cfg = TYPE_CONFIG[type];
                if (cfg) {
                    const btn = document.createElement('button');
                    btn.className = 'cd-chip';
                    btn.dataset.type = type;
                    btn.textContent = cfg.icon + ' ' + cfg.label;
                    chipsRow.appendChild(btn);
                }
            });

            // Cross-house toggle
            if (showCrossHouseToggle && houseFilter) {
                const divider = document.createElement('span');
                divider.className = 'cd-chip-divider';
                chipsRow.appendChild(divider);

                const toggle = document.createElement('button');
                toggle.className = 'cd-chip cd-cross-house-toggle';
                toggle.id = `${instanceId}-crosshouse`;
                toggle.textContent = '🌐 All Houses';
                toggle.title = 'Search across all houses';
                chipsRow.appendChild(toggle);
            }

            wrapper.appendChild(chipsRow);
        }

        // Results dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'cd-dropdown';
        dropdown.id = `${instanceId}-dropdown`;
        dropdown.style.display = 'none';
        wrapper.appendChild(dropdown);

        // Input reference
        const inputEl = searchBar.querySelector('input');
        const kbdHint = searchBar.querySelector('.cd-kbd-hint');

        // ---- Event Handlers ----

        let debounceTimer = null;

        function doSearch(query) {
            state.query = query || '';
            const trimmed = state.query.trim();

            if (!trimmed) {
                closeDropdown();
                return;
            }

            // Perform fuzzy token-based search
            const results = fuzzySearch(trimmed, {
                houseFilter: state.crossHouse ? null : state.houseFilter,
                typeFilter: state.typeFilter !== 'all' ? state.typeFilter : null,
                maxResults: maxResults
            });

            renderDropdown(results, trimmed);
            openDropdown();
        }

        function openDropdown() {
            dropdown.style.display = '';
            state.isOpen = true;
        }

        function closeDropdown() {
            dropdown.style.display = 'none';
            state.isOpen = false;
        }

        function renderDropdown(results, query) {
            dropdown.innerHTML = '';

            if (results.length === 0) {
                dropdown.innerHTML = `
                    <div class="cd-no-results">
                        <div class="cd-no-results-icon">&#128269;</div>
                        <div class="cd-no-results-text">No modules found for "${escapeHtml(query)}"</div>
                        <div class="cd-no-results-hint">Try different keywords or check spelling</div>
                    </div>`;
                return;
            }

            // Group results by house
            const grouped = {};
            results.forEach(r => {
                const key = r.house || 'unknown';
                if (!grouped[key]) {
                    grouped[key] = {
                        house: key,
                        name: r.houseName || key,
                        icon: r.houseIcon || '📁',
                        color: r.houseColor || '#666',
                        modules: []
                    };
                }
                grouped[key].modules.push(r);
            });

            // Count header
            const countDiv = document.createElement('div');
            countDiv.className = 'cd-results-count';
            countDiv.innerHTML = `<strong>${results.length}</strong> result${results.length !== 1 ? 's' : ''}`;
            dropdown.appendChild(countDiv);

            // Render each house group
            Object.values(grouped).forEach(group => {
                const groupEl = document.createElement('div');
                groupEl.className = 'cd-house-group';

                const header = document.createElement('div');
                header.className = 'cd-house-header';
                header.style.borderLeftColor = group.color;
                header.innerHTML = `
                    <span class="cd-house-icon">${group.icon}</span>
                    <span class="cd-house-name">${group.name}</span>
                    <span class="cd-house-count">${group.modules.length}</span>
                `;
                groupEl.appendChild(header);

                const list = document.createElement('div');
                list.className = 'cd-module-list';

                group.modules.forEach(mod => {
                    const item = document.createElement('div');
                    item.className = 'cd-module-item';
                    item.tabIndex = 0;

                    // Component type badges
                    const badges = (mod.components || []).map(c => {
                        const cfg = TYPE_CONFIG[c];
                        return cfg ? `<span class="cd-type-badge" style="background: ${cfg.color}22; color: ${cfg.color};">${cfg.label}</span>` : '';
                    }).join('');

                    item.innerHTML = `
                        <span class="cd-module-icon">${catIconHTML(mod)}</span>
                        <div class="cd-module-info">
                            <div class="cd-module-title">${highlightTokens(mod.title, query)}</div>
                            <div class="cd-module-desc">${highlightTokens(mod.description || '', query)}</div>
                            <div class="cd-module-badges">${badges}</div>
                        </div>
                        <span class="cd-module-arrow">&#8594;</span>
                    `;

                    // Navigate on click
                    const navigateTo = function() {
                        if (onSelect) {
                            onSelect(mod);
                        } else {
                            // Compute href relative to current page
                            const href = computeHref(mod);
                            if (href) window.location.href = href;
                        }
                    };

                    item.addEventListener('click', navigateTo);
                    item.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') navigateTo();
                    });

                    list.appendChild(item);
                });

                groupEl.appendChild(list);
                dropdown.appendChild(groupEl);
            });
        }

        // Debounced input handler
        inputEl.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => doSearch(inputEl.value), 200);
        });

        // Focus shows results if query present
        inputEl.addEventListener('focus', function() {
            if (kbdHint) kbdHint.style.display = 'none';
            if (state.query.trim()) {
                doSearch(state.query);
            }
        });

        inputEl.addEventListener('blur', function() {
            if (kbdHint && !inputEl.value) kbdHint.style.display = '';
            // Delay close to allow click on results
            setTimeout(() => {
                if (!wrapper.contains(document.activeElement)) {
                    closeDropdown();
                }
            }, 200);
        });

        // Escape closes dropdown
        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
                inputEl.blur();
            }
        });

        // Type chip clicks
        if (showTypeChips) {
            const chipsContainer = wrapper.querySelector('.cd-chips-row');
            if (chipsContainer) {
                chipsContainer.addEventListener('click', function(e) {
                    const chip = e.target.closest('.cd-chip');
                    if (!chip) return;

                    // Cross-house toggle
                    if (chip.classList.contains('cd-cross-house-toggle')) {
                        state.crossHouse = !state.crossHouse;
                        chip.classList.toggle('active', state.crossHouse);
                        if (state.query.trim()) doSearch(state.query);
                        return;
                    }

                    // Type filter chip
                    if (chip.dataset.type !== undefined) {
                        chipsContainer.querySelectorAll('.cd-chip[data-type]').forEach(c => c.classList.remove('active'));
                        chip.classList.add('active');
                        state.typeFilter = chip.dataset.type;
                        if (state.query.trim()) doSearch(state.query);
                    }
                });
            }
        }

        // Register this input for global `/` shortcut
        inputEl.setAttribute('data-cd-searchinput', instanceId);

        return {
            el: wrapper,
            search: doSearch
        };
    }

    // ========================================
    // FUZZY SEARCH ENGINE
    // ========================================

    /**
     * Token-based fuzzy search with relevance scoring.
     * Splits query into words; ALL tokens must appear in title+description+tags+components.
     * Results scored: title match = 10, description match = 3, tag/component match = 1.
     */
    function fuzzySearch(query, opts = {}) {
        const { houseFilter = null, typeFilter = null, maxResults = 50 } = opts;

        const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        if (tokens.length === 0) return [];

        const allModules = ContentCatalog.getAllModules();
        const houses = ContentCatalog.getAllHouses();

        let results = [];

        allModules.forEach(mod => {
            // Apply house filter
            if (houseFilter && houseFilter !== 'all' && mod.house !== houseFilter) return;

            // Apply type filter
            if (typeFilter && mod.components && !mod.components.includes(typeFilter)) return;

            // Skip unavailable
            if (mod.status && mod.status !== 'available') return;

            const titleLower = (mod.title || '').toLowerCase();
            const descLower = (mod.description || '').toLowerCase();
            const tagsLower = (mod.tags || []).join(' ').toLowerCase();
            const compsLower = (mod.components || []).join(' ').toLowerCase();
            const idLower = (mod.id || '').toLowerCase();
            const allText = titleLower + ' ' + descLower + ' ' + tagsLower + ' ' + compsLower + ' ' + idLower;

            // All tokens must match somewhere
            const allMatch = tokens.every(token => allText.includes(token));
            if (!allMatch) return;

            // Score by relevance
            let score = 0;
            tokens.forEach(token => {
                if (titleLower.includes(token)) score += 10;
                if (descLower.includes(token)) score += 3;
                if (tagsLower.includes(token)) score += 2;
                if (compsLower.includes(token)) score += 1;
            });

            // Bonus for exact full query match in title
            if (titleLower.includes(query.toLowerCase())) score += 20;

            const house = houses[mod.house];
            results.push({
                ...mod,
                score,
                houseName: house ? house.name : mod.house,
                houseIcon: house ? house.icon : '📁',
                houseColor: house ? house.color : '#666',
                fullHref: house ? house.basePath + mod.href : mod.href
            });
        });

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        return results.slice(0, maxResults);
    }

    // ========================================
    // HREF COMPUTATION
    // ========================================

    function computeHref(mod) {
        if (!mod.fullHref) return mod.href;

        const currentPath = window.location.pathname;

        // Strip /_app/ prefix if present (local dev), otherwise strip leading /
        const appIndex = currentPath.indexOf('/_app/');
        const relativePath = appIndex !== -1 ? currentPath.substring(appIndex + 6) : currentPath.substring(1);
        const depth = relativePath.split('/').length - 1;
        const prefix = '../'.repeat(depth);
        return prefix + mod.fullHref;
    }

    // ========================================
    // TEXT HELPERS
    // ========================================

    function highlightTokens(text, query) {
        if (!text || !query) return text || '';
        const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        let result = escapeHtml(text);

        tokens.forEach(token => {
            const escaped = escapeRegex(token);
            const regex = new RegExp('(' + escaped + ')', 'gi');
            result = result.replace(regex, '<mark class="cd-highlight">$1</mark>');
        });

        return result;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ========================================
    // GLOBAL KEYBOARD SHORTCUT
    // ========================================

    function bindGlobalKeyboard() {
        document.addEventListener('keydown', function(e) {
            // `/` to focus search — only when no input/textarea is focused
            // Check e.defaultPrevented: if another handler (HouseRenderer, vault search)
            // already called preventDefault(), skip to avoid stealing focus.
            if (e.key === '/' &&
                !e.defaultPrevented &&
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA' &&
                !document.activeElement.isContentEditable) {

                // Find the first visible ContentDiscovery search input
                const cdInput = document.querySelector('[data-cd-searchinput]') ||
                                document.getElementById('discoverySearch');
                if (cdInput) {
                    e.preventDefault();
                    cdInput.focus();
                }
            }
        });
    }

    // ========================================
    // LEGACY HOUSE PANEL (backward compat)
    // ========================================

    function createDiscoveryPanel(currentHouse, primaryColor) {
        const panel = document.createElement('div');
        panel.className = 'discovery-panel';
        panel.id = 'discoveryPanel';

        // Get unique content types from modules
        const types = [...new Set(SAMPLE_MODULES.flatMap(m => m.components || []))];
        const hasGlobal = typeof ContentCatalog !== 'undefined';

        // Build type filter buttons dynamically
        const typeButtons = types
            .filter(t => TYPE_CONFIG[t])
            .map(t => `<button class="discovery-filter-btn" data-type="${t}">${TYPE_CONFIG[t].icon} ${TYPE_CONFIG[t].label}</button>`)
            .join('');

        panel.innerHTML = `
            <div class="discovery-search-row">
                <div class="discovery-search-box">
                    <span class="discovery-search-icon">&#128269;</span>
                    <input type="text"
                           class="discovery-search-input"
                           id="discoverySearch"
                           placeholder="${hasGlobal ? 'Search all houses...' : 'Search modules...'}"
                           autocomplete="off">
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
                <div class="discovery-filter-divider"></div>
                <button class="discovery-filter-btn cd-cross-house-chip active" id="crossHouseToggle" title="Toggle cross-house search">
                    🌐 All Houses
                </button>
            </div>
            <div class="discovery-results-bar">
                <div class="discovery-results-count" id="discoveryResultsCount">
                    Showing <strong>${SAMPLE_MODULES.length}</strong> modules (searching all houses)
                </div>
                <div class="discovery-view-toggle">
                    <button class="discovery-view-btn active" data-view="grid" title="Grid view">&#8862;</button>
                    <button class="discovery-view-btn" data-view="compact" title="Compact list">&#9776;</button>
                </div>
            </div>
        `;

        return panel;
    }

    function bindDiscoveryEvents(currentHouse, primaryColor) {
        // Search input
        const searchInput = document.getElementById('discoverySearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function(e) {
                window.discoveryState.searchQuery = e.target.value.toLowerCase();
                applyHouseFilters();
            }, 200));

            // Escape to clear
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    clearDiscoveryFilters();
                    searchInput.blur();
                }
            });
        }

        // Type filter buttons
        document.querySelectorAll('#typeFilters .discovery-filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#typeFilters .discovery-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                window.discoveryState.typeFilter = this.dataset.type;
                applyHouseFilters();
            });
        });

        // Category filter buttons
        document.querySelectorAll('#categoryFilters .discovery-filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#categoryFilters .discovery-filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                window.discoveryState.categoryFilter = this.dataset.category;
                applyHouseFilters();
            });
        });

        // Cross-house toggle
        const crossHouseBtn = document.getElementById('crossHouseToggle');
        if (crossHouseBtn) {
            crossHouseBtn.addEventListener('click', function() {
                window.discoveryState.crossHouseEnabled = !window.discoveryState.crossHouseEnabled;
                this.classList.toggle('active', window.discoveryState.crossHouseEnabled);
                applyHouseFilters();
            });
        }

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

    function applyHouseFilters() {
        const { searchQuery, typeFilter, categoryFilter, currentHouse, crossHouseEnabled } = window.discoveryState;
        const hasActiveFilter = searchQuery || typeFilter !== 'all' || categoryFilter !== 'all';
        const hasCatalog = typeof ContentCatalog !== 'undefined';

        let localResults = [];
        let globalResults = [];

        if (searchQuery && searchQuery.length >= 2 && hasCatalog) {
            // Use fuzzy search engine
            const houseScope = crossHouseEnabled ? null : currentHouse;
            const allResults = fuzzySearch(searchQuery, {
                houseFilter: null, // get everything for grouping
                typeFilter: typeFilter !== 'all' ? typeFilter : null,
                maxResults: 100
            });
            localResults = allResults.filter(m => m.house === currentHouse);
            globalResults = crossHouseEnabled ? allResults.filter(m => m.house !== currentHouse) : [];

            // Apply category filter to local results
            if (categoryFilter !== 'all') {
                localResults = localResults.filter(m => m.category === categoryFilter);
            }
        } else if (hasActiveFilter && typeof SAMPLE_MODULES !== 'undefined') {
            // Pure type/category filter (no search query)
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
                countEl.innerHTML = `<strong>${SAMPLE_MODULES.length}</strong> modules (searching all houses)`;
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
                    <div class="discovery-no-results-icon">&#128269;</div>
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
                        <span class="global-results-title">&#128205; This House</span>
                        <span class="global-results-count">${localResults.length} results</span>
                    </div>
                    <div class="global-module-list" style="padding-left: 0;">
                        ${localResults.map(m => `
                            <div class="global-module-item" onclick="window.location.href='${m.href}'">
                                <span class="global-module-icon">${catIconHTML(m)}</span>
                                <div class="global-module-info">
                                    <div class="global-module-title">${m.title}</div>
                                    <div class="global-module-desc">${m.description}</div>
                                </div>
                                <span class="global-module-arrow">&#8594;</span>
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
                        <span class="global-results-title">&#127760; Other Houses</span>
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
                                        <span class="global-module-icon">${catIconHTML(m)}</span>
                                        <div class="global-module-info">
                                            <div class="global-module-title">${m.title}</div>
                                            <div class="global-module-desc">${m.description}</div>
                                        </div>
                                        <span class="global-module-arrow">&#8594;</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>`;
        }

        container.innerHTML = html;
    }

    // ========================================
    // LEGACY HELPER FUNCTIONS
    // ========================================

    // Global function to navigate to a module in another house
    window.navigateToModule = function(href) {
        var currentPath = window.location.pathname;
        // Strip /_app/ prefix if present (local dev), otherwise strip leading /
        var appIndex = currentPath.indexOf('/_app/');
        var relativePath = appIndex !== -1 ? currentPath.substring(appIndex + 6) : currentPath.substring(1);
        var depth = relativePath.split('/').length - 1;
        var prefix = '';
        for (var i = 0; i < depth; i++) prefix += '../';
        window.location.href = prefix + href;
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

    // Global function to clear filters
    window.clearDiscoveryFilters = function() {
        window.discoveryState = {
            searchQuery: '',
            typeFilter: 'all',
            categoryFilter: 'all',
            viewMode: window.discoveryState ? window.discoveryState.viewMode : 'grid',
            currentHouse: window.discoveryState ? window.discoveryState.currentHouse : null,
            showGlobalResults: true,
            crossHouseEnabled: true
        };

        // Reset UI
        const searchEl = document.getElementById('discoverySearch');
        if (searchEl) searchEl.value = '';
        document.querySelectorAll('.discovery-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'all' || btn.dataset.category === 'all');
        });
        const crossHouseBtn = document.getElementById('crossHouseToggle');
        if (crossHouseBtn) crossHouseBtn.classList.add('active');

        applyHouseFilters();
    };

    function addStartHereSection(primaryColor) {
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

        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const startHere = document.createElement('section');
        startHere.className = 'start-here-section';
        startHere.innerHTML = `
            <div class="start-here-header">
                <span class="start-here-icon">&#128640;</span>
                <h2 class="start-here-title">Start Here</h2>
            </div>
            <p class="start-here-description">
                New to this house? These foundational modules will help you get started.
            </p>
            <div class="start-here-items">
                ${starters.map(m => `
                    <div class="start-here-item" onclick="if('${m.href}')window.location.href='${m.href}'">
                        <span class="start-here-item-icon">${catIconHTML(m)}</span>
                        <div class="start-here-item-info">
                            <div class="start-here-item-title">${m.title}</div>
                            <div class="start-here-item-type">${getTypeLabel(m.components)}</div>
                        </div>
                        <span class="start-here-item-arrow">&#8594;</span>
                    </div>
                `).join('')}
            </div>
        `;

        heroSection.after(startHere);
    }

    function injectFavoriteButtons(currentHouse) {
        if (typeof FavoritesManager === 'undefined') return;

        const moduleCards = document.querySelectorAll('#hrModuleGrid .module-card, #moduleGrid .module-card');
        moduleCards.forEach((card, index) => {
            const module = SAMPLE_MODULES[index];
            if (!module) return;

            // Don't double-inject
            if (card.querySelector('.module-favorite-btn')) return;

            card.style.position = 'relative';

            const btn = document.createElement('button');
            btn.className = 'module-favorite-btn' + (FavoritesManager.isFavorite(module.id) ? ' favorited' : '');
            btn.innerHTML = FavoritesManager.isFavorite(module.id) ? '&#9829;' : '&#9825;';
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
                btn.innerHTML = nowFavorited ? '&#9829;' : '&#9825;';
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

    // ========================================
    // STYLES
    // ========================================

    function injectGlobalStyles(primaryColor) {
        const pc = primaryColor || '#6366f1';
        const styleSheet = document.createElement('style');
        styleSheet.id = 'cd-global-styles';
        styleSheet.textContent = `
            /* ═══════════════════════════════════════════
               ContentDiscovery — Universal Widget Styles
               ═══════════════════════════════════════════ */

            .cd-widget {
                position: relative;
                width: 100%;
            }

            .cd-search-bar {
                position: relative;
                display: flex;
                align-items: center;
            }

            .cd-search-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                color: #666;
                font-size: 1rem;
                pointer-events: none;
                z-index: 1;
            }

            .cd-search-input {
                width: 100%;
                padding: 12px 50px 12px 42px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #e0e0e0;
                font-size: 0.9rem;
                font-family: inherit;
                transition: all 0.2s ease;
                outline: none;
            }

            .cd-search-input:focus {
                border-color: ${pc};
                box-shadow: 0 0 0 3px ${pc}33;
            }

            .cd-search-input::placeholder {
                color: #555;
            }

            .cd-kbd-hint {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.06);
                color: #555;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.7rem;
                font-family: monospace;
                border: 1px solid rgba(255, 255, 255, 0.08);
                pointer-events: none;
            }

            /* Chips row */
            .cd-chips-row {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                margin-top: 10px;
                align-items: center;
            }

            .cd-chip {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                color: #888;
                font-size: 0.73rem;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                font-family: inherit;
            }

            .cd-chip:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .cd-chip.active {
                background: ${pc}22;
                border-color: ${pc}66;
                color: ${pc};
            }

            .cd-chip-divider {
                width: 1px;
                height: 20px;
                background: rgba(255, 255, 255, 0.1);
                margin: 0 4px;
            }

            .cd-cross-house-toggle.active {
                background: rgba(34, 197, 94, 0.15);
                border-color: rgba(34, 197, 94, 0.4);
                color: #4ade80;
            }

            /* Dropdown results */
            .cd-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                max-height: 480px;
                overflow-y: auto;
                background: #141418;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 0 0 10px 10px;
                box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
                z-index: 1000;
                padding: 12px;
            }

            .cd-results-count {
                font-size: 0.75rem;
                color: #666;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .cd-results-count strong {
                color: ${pc};
            }

            .cd-house-group {
                margin-bottom: 14px;
            }

            .cd-house-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                border-left: 3px solid #666;
                margin-bottom: 6px;
            }

            .cd-house-icon {
                font-size: 1rem;
            }

            .cd-house-name {
                font-size: 0.78rem;
                color: #bbb;
                flex: 1;
            }

            .cd-house-count {
                font-size: 0.65rem;
                color: #666;
                background: rgba(255, 255, 255, 0.05);
                padding: 2px 8px;
                border-radius: 10px;
            }

            .cd-module-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding-left: 8px;
            }

            .cd-module-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 12px;
                background: rgba(0, 0, 0, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.03);
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .cd-module-item:hover,
            .cd-module-item:focus {
                background: rgba(255, 255, 255, 0.04);
                border-color: rgba(255, 255, 255, 0.08);
                transform: translateX(3px);
                outline: none;
            }

            .cd-module-icon {
                font-size: 1.2rem;
                flex-shrink: 0;
                display: flex;
                align-items: center;
            }

            .cd-module-icon img {
                width: 28px;
                height: 28px;
                border-radius: 5px;
                object-fit: cover;
            }

            .cd-module-info {
                flex: 1;
                min-width: 0;
            }

            .cd-module-title {
                font-size: 0.85rem;
                color: #ddd;
                margin-bottom: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .cd-module-desc {
                font-size: 0.72rem;
                color: #666;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .cd-module-badges {
                display: flex;
                gap: 4px;
                margin-top: 3px;
                flex-wrap: wrap;
            }

            .cd-type-badge {
                padding: 1px 6px;
                border-radius: 4px;
                font-size: 0.6rem;
                text-transform: uppercase;
                letter-spacing: 0.03em;
            }

            .cd-module-arrow {
                color: #444;
                flex-shrink: 0;
                transition: transform 0.2s ease;
            }

            .cd-module-item:hover .cd-module-arrow {
                transform: translateX(4px);
                color: ${pc};
            }

            .cd-highlight {
                background: ${pc}44;
                padding: 0 2px;
                border-radius: 2px;
                color: inherit;
            }

            .cd-no-results {
                text-align: center;
                padding: 30px 20px;
                color: #666;
            }

            .cd-no-results-icon {
                font-size: 2rem;
                margin-bottom: 10px;
                opacity: 0.5;
            }

            .cd-no-results-text {
                font-size: 0.9rem;
                margin-bottom: 6px;
            }

            .cd-no-results-hint {
                font-size: 0.75rem;
                color: #555;
            }

            /* ═══════════════════════════════════════════
               Legacy Discovery Panel Styles
               ═══════════════════════════════════════════ */

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
                outline: none;
            }

            .discovery-search-input:focus {
                border-color: ${pc};
                box-shadow: 0 0 0 3px ${pc}33;
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
                background: ${pc}33;
                color: ${pc};
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
                font-family: inherit;
            }

            .discovery-filter-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .discovery-filter-btn.active {
                background: ${pc}22;
                border-color: ${pc}66;
                color: ${pc};
            }

            .cd-cross-house-chip.active {
                background: rgba(34, 197, 94, 0.15);
                border-color: rgba(34, 197, 94, 0.4);
                color: #4ade80;
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
                color: ${pc};
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
                font-family: inherit;
            }

            .discovery-view-btn:hover {
                color: #888;
            }

            .discovery-view-btn.active {
                background: ${pc}22;
                border-color: ${pc}44;
                color: ${pc};
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

            .module-type-badge.type-presentation { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
            .module-type-badge.type-lab { background: rgba(16, 185, 129, 0.2); color: #34d399; }
            .module-type-badge.type-quiz { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
            .module-type-badge.type-applet { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
            .module-type-badge.type-game { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
            .module-type-badge.type-review { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
            .module-type-badge.type-exam { background: rgba(239, 68, 68, 0.2); color: #f87171; }
            .module-type-badge.type-tool { background: rgba(6, 182, 212, 0.2); color: #22d3ee; }

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

            .global-module-icon { font-size: 1.3rem; flex-shrink: 0; display: flex; align-items: center; }
            .global-module-icon img { width: 28px; height: 28px; border-radius: 5px; object-fit: cover; }

            .global-module-info { flex: 1; min-width: 0; }

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
                color: ${pc};
            }

            /* Start Here Section */
            .start-here-section {
                background: linear-gradient(135deg, ${pc}11, ${pc}05);
                border: 1px solid ${pc}33;
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

            .start-here-icon { font-size: 1.5rem; }

            .start-here-title {
                font-size: 1rem;
                color: ${pc};
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
                border-color: ${pc}44;
                transform: translateX(4px);
            }

            .start-here-item-icon { font-size: 1.3rem; display: flex; align-items: center; }
            .start-here-item-icon img { width: 28px; height: 28px; border-radius: 5px; object-fit: cover; }
            .start-here-item-info { flex: 1; }
            .start-here-item-title { font-size: 0.9rem; color: #ddd; margin-bottom: 2px; }
            .start-here-item-type { font-size: 0.7rem; color: #666; }

            .start-here-item-arrow {
                color: #444;
                transition: transform 0.2s ease;
            }

            .start-here-item:hover .start-here-item-arrow {
                transform: translateX(4px);
                color: ${pc};
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

            .module-grid.view-compact .module-header { display: contents; }
            .module-grid.view-compact .module-icon { font-size: 1.2rem; margin-bottom: 0; }
            .module-grid.view-compact .module-title { flex: 1; margin-bottom: 0; }
            .module-grid.view-compact .module-description { display: none; }
            .module-grid.view-compact .module-status { margin-top: 0; }
            .module-grid.view-compact .module-components { display: none; }

            /* No results message */
            .discovery-no-results {
                text-align: center;
                padding: 60px 20px;
                color: #666;
            }

            .discovery-no-results-icon { font-size: 3rem; margin-bottom: 15px; opacity: 0.5; }
            .discovery-no-results-text { font-size: 0.95rem; margin-bottom: 8px; }
            .discovery-no-results-hint { font-size: 0.8rem; color: #555; }

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
                font-family: inherit;
            }

            .discovery-clear-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            /* Highlight search matches */
            .discovery-highlight {
                background: ${pc}44;
                padding: 0 2px;
                border-radius: 2px;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // ========================================
    // DOM READY HOOK
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        // DOM already loaded, run on next tick to let other scripts set up globals
        setTimeout(autoInit, 0);
    }

    // ========================================
    // PUBLIC API
    // ========================================

    return {
        init: init,
        search: fuzzySearch,
        detectContext: detectContext,
        TYPE_CONFIG: TYPE_CONFIG
    };

})();

// Make globally available
window.ContentDiscovery = ContentDiscovery;
