/**
 * ContentDiscovery.js - Universal Content Search & Filter System
 *
 * Provides search, filtering, and organization for house content.
 * Automatically injects into house index pages that define SAMPLE_MODULES.
 *
 * Features:
 * - Real-time search by title/description
 * - Filter by content type (presentation, lab, quiz, applet)
 * - Filter by category
 * - "Start Here" recommended section
 * - Compact/Grid view toggle
 * - Result count display
 *
 * Usage: Just include this script after defining SAMPLE_MODULES and CATEGORIES
 * <script src="../../components/ContentDiscovery.js"></script>
 */

(function() {
    'use strict';

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

        // Inject styles
        injectStyles(primaryColor);

        // Create and inject the discovery panel
        const discoveryPanel = createDiscoveryPanel();

        // Find the module section and inject before it
        const moduleSection = document.querySelector('.content-section:last-of-type');
        if (moduleSection) {
            moduleSection.insertBefore(discoveryPanel, moduleSection.firstChild.nextSibling);
        }

        // Initialize filter state
        window.discoveryState = {
            searchQuery: '',
            typeFilter: 'all',
            categoryFilter: 'all',
            viewMode: 'grid'
        };

        // Bind event listeners
        bindDiscoveryEvents();

        // Add "Start Here" section if not exists
        addStartHereSection();

        console.log('%c🔍 ContentDiscovery initialized', 'color: ' + primaryColor);
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

        // Get unique content types from modules
        const types = [...new Set(SAMPLE_MODULES.flatMap(m => m.components || []))];

        panel.innerHTML = `
            <div class="discovery-search-row">
                <div class="discovery-search-box">
                    <span class="discovery-search-icon">🔍</span>
                    <input type="text"
                           class="discovery-search-input"
                           id="discoverySearch"
                           placeholder="Search modules by name or description...">
                </div>
            </div>
            <div class="discovery-filters">
                <div class="discovery-filter-group" id="typeFilters">
                    <button class="discovery-filter-btn active" data-type="all">All Types</button>
                    ${types.includes('presentation') ? '<button class="discovery-filter-btn" data-type="presentation">📊 Slides</button>' : ''}
                    ${types.includes('lab') ? '<button class="discovery-filter-btn" data-type="lab">🧪 Labs</button>' : ''}
                    ${types.includes('quiz') ? '<button class="discovery-filter-btn" data-type="quiz">📝 Quizzes</button>' : ''}
                    ${types.includes('applet') ? '<button class="discovery-filter-btn" data-type="applet">🎮 Interactive</button>' : ''}
                    ${types.includes('guide') ? '<button class="discovery-filter-btn" data-type="guide">📖 Guides</button>' : ''}
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
                    Showing <strong>${SAMPLE_MODULES.length}</strong> of ${SAMPLE_MODULES.length} modules
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
        const { searchQuery, typeFilter, categoryFilter } = window.discoveryState;
        const moduleCards = document.querySelectorAll('.module-card');
        let visibleCount = 0;

        moduleCards.forEach((card, index) => {
            const module = SAMPLE_MODULES[index];
            if (!module) return;

            let visible = true;

            // Search filter
            if (searchQuery) {
                const searchText = `${module.title} ${module.description}`.toLowerCase();
                visible = searchText.includes(searchQuery);
            }

            // Type filter
            if (visible && typeFilter !== 'all') {
                visible = module.components && module.components.includes(typeFilter);
            }

            // Category filter (if modules have category property)
            if (visible && categoryFilter !== 'all') {
                // Try to match by href path or explicit category
                const href = module.href || module.path || '';
                visible = href.includes(categoryFilter) || module.category === categoryFilter;
            }

            // Apply visibility
            if (visible) {
                card.classList.remove('discovery-hidden');
                visibleCount++;
            } else {
                card.classList.add('discovery-hidden');
            }
        });

        // Update results count
        const countEl = document.getElementById('discoveryResultsCount');
        if (countEl) {
            countEl.innerHTML = `Showing <strong>${visibleCount}</strong> of ${SAMPLE_MODULES.length} modules`;
        }

        // Show/hide no results message
        handleNoResults(visibleCount);
    }

    function applyViewMode() {
        const moduleGrid = document.getElementById('moduleGrid');
        if (!moduleGrid) return;

        if (window.discoveryState.viewMode === 'compact') {
            moduleGrid.classList.add('view-compact');
        } else {
            moduleGrid.classList.remove('view-compact');
        }
    }

    function handleNoResults(count) {
        const moduleGrid = document.getElementById('moduleGrid');
        if (!moduleGrid) return;

        // Remove existing no results message
        const existing = moduleGrid.querySelector('.discovery-no-results');
        if (existing) existing.remove();

        if (count === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'discovery-no-results';
            noResults.innerHTML = `
                <div class="discovery-no-results-icon">🔍</div>
                <div class="discovery-no-results-text">No modules found</div>
                <div class="discovery-no-results-hint">Try adjusting your search or filters</div>
                <button class="discovery-clear-btn" onclick="clearDiscoveryFilters()">Clear Filters</button>
            `;
            moduleGrid.appendChild(noResults);
        }
    }

    // Global function to clear filters
    window.clearDiscoveryFilters = function() {
        window.discoveryState = {
            searchQuery: '',
            typeFilter: 'all',
            categoryFilter: 'all',
            viewMode: window.discoveryState.viewMode
        };

        // Reset UI
        document.getElementById('discoverySearch').value = '';
        document.querySelectorAll('.discovery-filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'all' || btn.dataset.category === 'all');
        });

        applyFilters();
    };

    function addStartHereSection() {
        // Find recommended starting modules (first presentation or intro modules)
        const starters = SAMPLE_MODULES.filter(m =>
            m.status === 'available' &&
            (m.title.toLowerCase().includes('fundamental') ||
             m.title.toLowerCase().includes('basic') ||
             m.title.toLowerCase().includes('intro') ||
             m.title.toLowerCase().includes('101') ||
             m.title.toLowerCase().includes('overview') ||
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
                    <div class="start-here-item" onclick="openModule('${m.id}')">
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

    function getTypeLabel(components) {
        if (!components || components.length === 0) return 'Module';
        const labels = {
            presentation: 'Presentation',
            lab: 'Hands-on Lab',
            quiz: 'Knowledge Check',
            applet: 'Interactive Tool',
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
