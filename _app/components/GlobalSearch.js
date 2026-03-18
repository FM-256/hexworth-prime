/**
 * GlobalSearch.js - Ctrl+K Search Overlay
 * Hexworth Prime v2.7.0
 *
 * Provides global search accessible from any page via Ctrl+K / Cmd+K.
 * Lazy-loads ContentCatalog.js on first activation to avoid 509KB overhead
 * on every page load.
 *
 * Loaded automatically by FluxCapacitor.js on every content page.
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const TYPE_CONFIG = {
        presentation: { icon: '/assets/images/icons/icon-barchart.webp', label: 'Slides',       color: '#60a5fa' },
        lab:          { icon: '/assets/images/icons/icon-flask.webp', label: 'Labs',         color: '#34d399' },
        quiz:         { icon: '/assets/images/icons/icon-notepad.webp', label: 'Quizzes',      color: '#fbbf24' },
        applet:       { icon: '/assets/images/icons/icon-joystick.webp', label: 'Interactive',  color: '#c084fc' },
        game:         { icon: '/assets/images/icons/icon-joystick.webp', label: 'Games',        color: '#4ade80' },
        review:       { icon: '/assets/images/icons/icon-refresh.webp', label: 'Reviews',      color: '#fb923c' },
        exam:         { icon: '/assets/images/icons/icon-clipboard.webp', label: 'Exams',        color: '#f87171' },
        tool:         { icon: '/assets/images/icons/icon-wrench.webp', label: 'Tools',        color: '#22d3ee' },
        guide:        { icon: '/assets/images/icons/icon-books.webp', label: 'Guides',       color: '#a78bfa' },
        reference:    { icon: '/assets/images/icons/icon-books.webp', label: 'Reference',    color: '#94a3b8' },
        module:       { icon: '/assets/images/icons/icon-package.webp', label: 'Modules',      color: '#e879f9' }
    };

    // Type filter chips shown in the UI
    const TYPE_FILTERS = [
        { key: null,            label: 'All' },
        { key: 'presentation',  label: 'Slides' },
        { key: 'lab',           label: 'Labs' },
        { key: 'quiz',          label: 'Quizzes' },
        { key: 'game',          label: 'Games' }
    ];

    const MAX_RESULTS = 30;
    const DEBOUNCE_MS = 200;

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    let overlay = null;
    let input = null;
    let resultsContainer = null;
    let chipContainer = null;
    let catalogLoaded = false;
    let catalogLoading = false;
    let isOpen = false;
    let activeFilter = null;      // null = All
    let selectedIndex = -1;       // keyboard nav index into flat result list
    let debounceTimer = null;
    let basePath = null;

    // ═══════════════════════════════════════════════════════════════
    // PATH RESOLUTION
    // ═══════════════════════════════════════════════════════════════

    function calculateBasePath() {
        const path = window.location.pathname;

        if (path.includes('/houses/')) {
            const afterHouse = path.split(/\/houses\/\w+\//)[1] || '';
            const depth = (afterHouse.match(/\//g) || []).length;
            return '../'.repeat(depth + 2);
        } else if (path.includes('/dark-arts/')) {
            const afterDarkArts = path.split('/dark-arts/')[1] || '';
            const depth = (afterDarkArts.match(/\//g) || []).length;
            return '../'.repeat(depth + 1);
        } else if (path.includes('/components/')) {
            return '../';
        }

        const filename = path.split('/').pop();
        const appRootPages = ['terminal.html', 'dashboard.html', 'index.html', 'sorting.html', 'connect.html'];
        if (appRootPages.includes(filename)) {
            return './';
        }

        return '../../';
    }

    // ═══════════════════════════════════════════════════════════════
    // LAZY-LOAD CONTENT CATALOG
    // ═══════════════════════════════════════════════════════════════

    function loadCatalog(callback) {
        if (catalogLoaded && window.ContentCatalog) {
            callback();
            return;
        }
        if (catalogLoading) return;
        catalogLoading = true;

        // Resolve path using captured script reference
        var catalogSrc;
        if (_currentScript && _currentScript.src) {
            catalogSrc = _currentScript.src.replace('GlobalSearch.js', 'ContentCatalog.js');
        } else {
            // Fallback: resolve from page location
            catalogSrc = (basePath || calculateBasePath()) + 'components/ContentCatalog.js';
        }

        var s = document.createElement('script');
        s.src = catalogSrc;
        s.onload = function() {
            catalogLoaded = true;
            catalogLoading = false;
            callback();
        };
        s.onerror = function() {
            catalogLoading = false;
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="gs-empty">Failed to load search index. Try again.</div>';
            }
        };
        document.head.appendChild(s);
    }

    // Capture script reference immediately (before DOMContentLoaded loses it)
    var _currentScript = document.currentScript;

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    const STYLES = `
        .gs-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(12px);
            z-index: 100000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 12vh;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        }

        .gs-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .gs-container {
            width: 95%;
            max-width: 600px;
            max-height: 70vh;
            display: flex;
            flex-direction: column;
            transform: scale(0.96) translateY(-10px);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .gs-overlay.active .gs-container {
            transform: scale(1) translateY(0);
        }

        /* Search input bar */
        .gs-input-wrap {
            display: flex;
            align-items: center;
            background: rgba(20, 20, 30, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 0 16px;
            gap: 10px;
        }

        .gs-search-icon {
            font-size: 1.1rem;
            opacity: 0.5;
            flex-shrink: 0;
        }

        .gs-input {
            flex: 1;
            background: none;
            border: none;
            outline: none;
            color: #e0e0e0;
            font-size: 1rem;
            font-family: 'Segoe UI', system-ui, sans-serif;
            padding: 14px 0;
            caret-color: #60a5fa;
        }

        .gs-input::placeholder {
            color: #808080;
        }

        .gs-esc-hint {
            font-size: 0.7rem;
            color: #808080;
            background: rgba(255, 255, 255, 0.06);
            padding: 3px 8px;
            border-radius: 4px;
            flex-shrink: 0;
        }

        /* Type filter chips */
        .gs-chips {
            display: flex;
            gap: 6px;
            padding: 8px 4px 4px;
            flex-wrap: wrap;
        }

        .gs-chip {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #888;
            padding: 6px 14px;
            border-radius: 16px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.15s ease;
            font-family: 'Segoe UI', system-ui, sans-serif;
            min-height: 28px;
        }

        .gs-chip:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #bbb;
        }

        .gs-chip.active {
            background: rgba(96, 165, 250, 0.15);
            border-color: rgba(96, 165, 250, 0.4);
            color: #60a5fa;
        }

        /* Results area */
        .gs-results {
            overflow-y: auto;
            margin-top: 4px;
            padding-bottom: 8px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .gs-results::-webkit-scrollbar {
            width: 6px;
        }

        .gs-results::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 3px;
        }

        /* House group header */
        .gs-house-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px 4px;
            margin-top: 6px;
            border-left: 3px solid #666;
            font-size: 0.75rem;
            color: #888;
        }

        .gs-house-header:first-child {
            margin-top: 0;
        }

        .gs-house-name {
            font-weight: 600;
            color: #aaa;
        }

        .gs-house-count {
            margin-left: auto;
            font-size: 0.65rem;
            opacity: 0.5;
        }

        /* Result item */
        .gs-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            margin: 2px 0;
            border-radius: 8px;
            border: 1px solid transparent;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
        }

        .gs-item:hover,
        .gs-item.gs-selected {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.08);
            transform: translateX(3px);
        }

        .gs-item-icon {
            font-size: 1.1rem;
            flex-shrink: 0;
            width: 28px;
            text-align: center;
        }

        .gs-item-info {
            flex: 1;
            min-width: 0;
        }

        .gs-item-title {
            color: #e0e0e0;
            font-size: 0.85rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .gs-item-desc {
            color: #8a8a8a;
            font-size: 0.7rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 1px;
        }

        .gs-item-badge {
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 0.6rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            flex-shrink: 0;
        }

        .gs-item-arrow {
            color: #444;
            flex-shrink: 0;
            font-size: 0.8rem;
        }

        /* Highlight */
        .gs-highlight {
            background: rgba(251, 191, 36, 0.25);
            padding: 0 2px;
            border-radius: 2px;
            color: inherit;
        }

        /* Empty / loading states */
        .gs-empty {
            text-align: center;
            color: #808080;
            padding: 32px 16px;
            font-size: 0.85rem;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }

        .gs-loading {
            text-align: center;
            color: #808080;
            padding: 32px 16px;
            font-size: 0.85rem;
        }

        .gs-shortcut-hint {
            text-align: center;
            padding: 16px;
            color: #444;
            font-size: 0.7rem;
        }

        .gs-shortcut-hint kbd {
            background: rgba(255, 255, 255, 0.08);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.7rem;
            margin: 0 2px;
        }

        /* Responsive */
        @media (max-width: 500px) {
            .gs-overlay {
                padding-top: 5vh;
            }

            .gs-container {
                max-height: 80vh;
            }

            .gs-input {
                font-size: 0.9rem;
            }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            .gs-overlay { transition: none; }
            .gs-container { transition: none; }
            .gs-chip { transition: none; }
            .gs-item { transition: none; }
            .gs-item:hover { transform: none; }
        }

        /* High contrast */
        @media (prefers-contrast: more) {
            .gs-input-wrap { border-color: rgba(255, 255, 255, 0.4); }
            .gs-chip { border-color: rgba(255, 255, 255, 0.3); }
            .gs-chip.active { border-color: rgba(96, 165, 250, 0.7); }
            .gs-item:hover,
            .gs-item.gs-selected { border-color: rgba(255, 255, 255, 0.3); }
        }
    `;

    // ═══════════════════════════════════════════════════════════════
    // DOM CONSTRUCTION
    // ═══════════════════════════════════════════════════════════════

    function buildOverlay() {
        if (overlay) return;

        // Inject styles
        const style = document.createElement('style');
        style.id = 'global-search-styles';
        style.textContent = STYLES;
        document.head.appendChild(style);

        // Overlay
        overlay = document.createElement('div');
        overlay.className = 'gs-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Global search');

        // Container
        const container = document.createElement('div');
        container.className = 'gs-container';

        // Input wrapper
        const inputWrap = document.createElement('div');
        inputWrap.className = 'gs-input-wrap';

        const searchIcon = document.createElement('span');
        searchIcon.className = 'gs-search-icon';
        searchIcon.textContent = '\u{1F50D}';
        searchIcon.setAttribute('aria-hidden', 'true');
        inputWrap.appendChild(searchIcon);

        input = document.createElement('input');
        input.className = 'gs-input';
        input.type = 'text';
        input.placeholder = 'Search all modules...';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('aria-label', 'Search all modules');
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('aria-controls', 'gs-results-list');
        inputWrap.appendChild(input);

        const escHint = document.createElement('span');
        escHint.className = 'gs-esc-hint';
        escHint.textContent = 'Esc';
        inputWrap.appendChild(escHint);

        container.appendChild(inputWrap);

        // Type chips
        chipContainer = document.createElement('div');
        chipContainer.className = 'gs-chips';

        chipContainer.setAttribute('role', 'toolbar');
        chipContainer.setAttribute('aria-label', 'Filter by content type');

        TYPE_FILTERS.forEach(function(f) {
            const chip = document.createElement('button');
            chip.className = 'gs-chip' + (f.key === activeFilter ? ' active' : '');
            chip.textContent = f.label;
            chip.dataset.type = f.key || '';
            chip.setAttribute('aria-pressed', String(f.key === activeFilter));
            chip.addEventListener('click', function() {
                activeFilter = f.key;
                updateChips();
                runSearch();
                input.focus();
            });
            chipContainer.appendChild(chip);
        });

        container.appendChild(chipContainer);

        // Results
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'gs-results';
        resultsContainer.id = 'gs-results-list';
        resultsContainer.setAttribute('role', 'listbox');
        resultsContainer.setAttribute('aria-label', 'Search results');
        resultsContainer.innerHTML = '<div class="gs-empty">Type to search 1,500+ modules</div>' +
            '<div class="gs-shortcut-hint"><kbd>\u2191</kbd> <kbd>\u2193</kbd> navigate \u00B7 <kbd>Enter</kbd> open \u00B7 <kbd>Esc</kbd> close</div>';
        container.appendChild(resultsContainer);

        // Live region for screen reader announcements
        var liveRegion = document.createElement('div');
        liveRegion.id = 'gs-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
        container.appendChild(liveRegion);

        overlay.appendChild(container);

        // Click backdrop to close
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeSearch();
            }
        });

        // Input events
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(runSearch, DEBOUNCE_MS);
        });

        input.addEventListener('keydown', handleInputKeydown);

        document.body.appendChild(overlay);
    }

    function updateChips() {
        if (!chipContainer) return;
        var chips = chipContainer.querySelectorAll('.gs-chip');
        chips.forEach(function(chip) {
            var key = chip.dataset.type || null;
            var isActive = key === activeFilter;
            chip.classList.toggle('active', isActive);
            chip.setAttribute('aria-pressed', String(isActive));
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // SEARCH & RENDERING
    // ═══════════════════════════════════════════════════════════════

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightTokens(text, query) {
        if (!text || !query) return escapeHtml(text || '');
        var tokens = query.toLowerCase().split(/\s+/).filter(function(t) { return t.length > 0; });
        var result = escapeHtml(text);

        tokens.forEach(function(token) {
            var escaped = escapeRegex(token);
            var regex = new RegExp('(' + escaped + ')', 'gi');
            result = result.replace(regex, '<mark class="gs-highlight">$1</mark>');
        });

        return result;
    }

    function getPrimaryBadge(components) {
        if (!components || !components.length) return null;
        // Priority: presentation > lab > quiz > game > applet > review > tool > guide > reference > module
        var priority = ['presentation', 'lab', 'quiz', 'game', 'applet', 'review', 'exam', 'tool', 'guide', 'reference', 'module'];
        for (var i = 0; i < priority.length; i++) {
            if (components.indexOf(priority[i]) !== -1) {
                return TYPE_CONFIG[priority[i]] || null;
            }
        }
        return TYPE_CONFIG[components[0]] || null;
    }

    function runSearch() {
        if (!window.ContentCatalog) return;
        if (!input || !resultsContainer) return;

        var query = input.value.trim();
        selectedIndex = -1;

        if (!query) {
            resultsContainer.innerHTML = '<div class="gs-empty">Type to search 1,500+ modules</div>' +
                '<div class="gs-shortcut-hint"><kbd>\u2191</kbd> <kbd>\u2193</kbd> navigate \u00B7 <kbd>Enter</kbd> open \u00B7 <kbd>Esc</kbd> close</div>';
            return;
        }

        var opts = { limit: MAX_RESULTS, status: 'available' };
        if (activeFilter) opts.type = activeFilter;

        var results = ContentCatalog.search(query, opts);

        if (!results.length) {
            resultsContainer.innerHTML = '<div class="gs-empty">No results for "' + escapeHtml(query) + '"</div>';
            return;
        }

        // Group by house
        var groups = {};
        var groupOrder = [];
        results.forEach(function(r) {
            var key = r.house || 'unknown';
            if (!groups[key]) {
                groups[key] = {
                    house: key,
                    name: r.houseName || key,
                    icon: r.houseIcon || '\u{1F4C1}',
                    color: r.houseColor || '#666',
                    modules: []
                };
                groupOrder.push(key);
            }
            groups[key].modules.push(r);
        });

        // Render
        var html = '';
        groupOrder.forEach(function(key) {
            var group = groups[key];

            // House header
            html += '<div class="gs-house-header" style="border-left-color: ' + group.color + ';">';
            html += '<span>' + group.icon + '</span>';
            html += '<span class="gs-house-name">' + escapeHtml(group.name) + '</span>';
            html += '<span class="gs-house-count">' + group.modules.length + '</span>';
            html += '</div>';

            // Module items
            group.modules.forEach(function(mod) {
                var badge = getPrimaryBadge(mod.components);
                var badgeHtml = '';
                if (badge) {
                    badgeHtml = '<span class="gs-item-badge" style="background: ' + badge.color + '22; color: ' + badge.color + ';">' + badge.label + '</span>';
                }

                html += '<div class="gs-item" role="option" data-href="' + escapeHtml(mod.fullHref || '') + '" tabindex="-1">';
                html += '<span class="gs-item-icon">' + (mod.icon || '\u{1F4C4}') + '</span>';
                html += '<div class="gs-item-info">';
                html += '<div class="gs-item-title">' + highlightTokens(mod.title, query) + '</div>';
                if (mod.description) {
                    html += '<div class="gs-item-desc">' + highlightTokens(mod.description, query) + '</div>';
                }
                html += '</div>';
                html += badgeHtml;
                html += '<span class="gs-item-arrow">\u2192</span>';
                html += '</div>';
            });
        });

        resultsContainer.innerHTML = html;

        // Announce result count to screen readers
        var liveRegion = document.getElementById('gs-live-region');
        if (liveRegion) {
            liveRegion.textContent = results.length + ' result' + (results.length !== 1 ? 's' : '') + ' found';
        }

        // Bind click handlers
        var items = resultsContainer.querySelectorAll('.gs-item');
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                navigateToResult(item.dataset.href);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════════════════════

    function navigateToResult(href) {
        if (!href) return;
        closeSearch();
        window.location.href = basePath + href;
    }

    // ═══════════════════════════════════════════════════════════════
    // KEYBOARD NAVIGATION
    // ═══════════════════════════════════════════════════════════════

    function getResultItems() {
        if (!resultsContainer) return [];
        return resultsContainer.querySelectorAll('.gs-item');
    }

    function updateSelection(items) {
        items.forEach(function(item, i) {
            item.classList.toggle('gs-selected', i === selectedIndex);
        });

        // Scroll selected into view
        if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function handleInputKeydown(e) {
        var items = getResultItems();
        var count = items.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (count > 0) {
                selectedIndex = (selectedIndex + 1) % count;
                updateSelection(items);
            }
            return;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (count > 0) {
                selectedIndex = selectedIndex <= 0 ? count - 1 : selectedIndex - 1;
                updateSelection(items);
            }
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                navigateToResult(items[selectedIndex].dataset.href);
            } else if (count > 0) {
                // Navigate to first result if nothing selected
                navigateToResult(items[0].dataset.href);
            }
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            closeSearch();
            return;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // OPEN / CLOSE
    // ═══════════════════════════════════════════════════════════════

    function openSearch() {
        if (isOpen) return;

        basePath = calculateBasePath();
        buildOverlay();
        if (input) input.setAttribute('aria-expanded', 'true');

        if (!catalogLoaded && !catalogLoading) {
            // Show loading state
            resultsContainer.innerHTML = '<div class="gs-loading">Loading search index...</div>';
            overlay.classList.add('active');
            isOpen = true;

            loadCatalog(function() {
                // Catalog ready — show default state or run pending query
                if (input.value.trim()) {
                    runSearch();
                } else {
                    resultsContainer.innerHTML = '<div class="gs-empty">Type to search 1,500+ modules</div>' +
                        '<div class="gs-shortcut-hint"><kbd>\u2191</kbd> <kbd>\u2193</kbd> navigate \u00B7 <kbd>Enter</kbd> open \u00B7 <kbd>Esc</kbd> close</div>';
                }
                input.focus();
            });
            // Focus input immediately even while loading
            input.focus();
            return;
        }

        overlay.classList.add('active');
        isOpen = true;
        input.focus();
        input.select();

        // Re-run search if there's existing text
        if (input.value.trim()) {
            runSearch();
        }
    }

    function closeSearch() {
        if (!isOpen) return;
        isOpen = false;
        selectedIndex = -1;
        if (overlay) overlay.classList.remove('active');
        if (input) input.setAttribute('aria-expanded', 'false');
    }

    function toggleSearch() {
        if (isOpen) {
            closeSearch();
        } else {
            openSearch();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL KEYBOARD LISTENER
    // ═══════════════════════════════════════════════════════════════

    document.addEventListener('keydown', function(e) {
        // Ctrl+K / Cmd+K to toggle search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            // Respect defaultPrevented
            if (e.defaultPrevented) return;

            // Skip when user is in an input/textarea/contenteditable
            // (unless the search overlay itself is open — allow closing)
            if (!isOpen) {
                var tag = e.target.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) {
                    return;
                }
            }

            e.preventDefault();
            toggleSearch();
            return;
        }

        // Escape to close (only when open)
        if (e.key === 'Escape' && isOpen) {
            e.preventDefault();
            closeSearch();
        }
    });

})();
