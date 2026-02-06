/**
 * ProgressiveHints.js
 * A reusable hint system for educational labs
 *
 * Features:
 * - 4-level progressive hints (nudge → specific → near-complete → solution)
 * - Collapsible hint cards with smooth animations
 * - Color progression: blue → yellow → orange → red
 * - localStorage tracking for analytics
 * - Dark theme compatible
 * - ES6 module + IIFE export
 *
 * Usage:
 *   ProgressiveHints.init('hint-container', [
 *     { level: 1, text: "Look at file manipulation commands" },
 *     { level: 2, text: "Try using the 'cp' command" },
 *     { level: 3, text: "cp source destination" },
 *     { level: 4, text: "cp file.txt backup/file.txt", isSolution: true }
 *   ]);
 */

(function(root, factory) {
    // Universal Module Definition (UMD)
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS/Node
        module.exports = factory();
    } else {
        // Browser global (IIFE)
        root.ProgressiveHints = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    // ========================================
    // CONFIGURATION
    // ========================================

    const CONFIG = {
        storageKey: 'hexworth_hints_analytics',
        animationDuration: 300,
        colors: {
            1: { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd', label: 'Gentle Nudge' },
            2: { bg: '#3d3d00', border: '#eab308', text: '#fef08a', label: 'Getting Warmer' },
            3: { bg: '#4a2c00', border: '#f97316', text: '#fed7aa', label: 'Almost There' },
            4: { bg: '#4a1c1c', border: '#ef4444', text: '#fecaca', label: 'Solution' }
        }
    };

    // ========================================
    // STATE
    // ========================================

    let state = {
        containerId: null,
        container: null,
        hints: [],
        revealedCount: 0,
        initialized: false,
        stylesInjected: false,
        currentLabId: null
    };

    // ========================================
    // STYLES
    // ========================================

    const STYLES = `
        .ph-container {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            margin: 1rem 0;
        }

        .ph-trigger-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            color: #93c5fd;
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .ph-trigger-btn:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1e3a5f 100%);
            border-color: #60a5fa;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .ph-trigger-btn:active {
            transform: translateY(0);
        }

        .ph-trigger-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .ph-trigger-btn svg {
            width: 18px;
            height: 18px;
        }

        .ph-hint-counter {
            font-size: 0.85rem;
            color: #64748b;
            margin-left: 0.75rem;
            font-style: italic;
        }

        .ph-hints-wrapper {
            margin-top: 1rem;
        }

        .ph-hint-card {
            margin-bottom: 0.75rem;
            border-radius: 8px;
            overflow: hidden;
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
            transition: all ${CONFIG.animationDuration}ms ease;
        }

        .ph-hint-card.ph-revealed {
            opacity: 1;
            transform: translateY(0);
            max-height: 500px;
        }

        .ph-hint-card.ph-level-1 {
            background: ${CONFIG.colors[1].bg};
            border: 1px solid ${CONFIG.colors[1].border};
        }

        .ph-hint-card.ph-level-2 {
            background: ${CONFIG.colors[2].bg};
            border: 1px solid ${CONFIG.colors[2].border};
        }

        .ph-hint-card.ph-level-3 {
            background: ${CONFIG.colors[3].bg};
            border: 1px solid ${CONFIG.colors[3].border};
        }

        .ph-hint-card.ph-level-4 {
            background: ${CONFIG.colors[4].bg};
            border: 1px solid ${CONFIG.colors[4].border};
        }

        .ph-hint-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            cursor: pointer;
            user-select: none;
        }

        .ph-hint-header:hover {
            filter: brightness(1.1);
        }

        .ph-hint-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .ph-level-1 .ph-hint-label { color: ${CONFIG.colors[1].text}; }
        .ph-level-2 .ph-hint-label { color: ${CONFIG.colors[2].text}; }
        .ph-level-3 .ph-hint-label { color: ${CONFIG.colors[3].text}; }
        .ph-level-4 .ph-hint-label { color: ${CONFIG.colors[4].text}; }

        .ph-hint-badge {
            font-size: 0.75rem;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            opacity: 0.8;
        }

        .ph-level-1 .ph-hint-badge { background: ${CONFIG.colors[1].border}; color: #0f172a; }
        .ph-level-2 .ph-hint-badge { background: ${CONFIG.colors[2].border}; color: #0f172a; }
        .ph-level-3 .ph-hint-badge { background: ${CONFIG.colors[3].border}; color: #0f172a; }
        .ph-level-4 .ph-hint-badge { background: ${CONFIG.colors[4].border}; color: #0f172a; }

        .ph-collapse-icon {
            transition: transform 0.2s ease;
        }

        .ph-hint-card.ph-collapsed .ph-collapse-icon {
            transform: rotate(-90deg);
        }

        .ph-hint-content {
            padding: 0 1rem 1rem 1rem;
            line-height: 1.6;
            font-size: 0.95rem;
            overflow: hidden;
            transition: all 0.2s ease;
        }

        .ph-hint-card.ph-collapsed .ph-hint-content {
            padding-top: 0;
            padding-bottom: 0;
            max-height: 0;
            opacity: 0;
        }

        .ph-level-1 .ph-hint-content { color: ${CONFIG.colors[1].text}; }
        .ph-level-2 .ph-hint-content { color: ${CONFIG.colors[2].text}; }
        .ph-level-3 .ph-hint-content { color: ${CONFIG.colors[3].text}; }
        .ph-level-4 .ph-hint-content { color: ${CONFIG.colors[4].text}; }

        .ph-hint-content code {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Fira Code', 'Consolas', monospace;
            font-size: 0.9rem;
        }

        .ph-hint-content pre {
            background: rgba(0, 0, 0, 0.4);
            padding: 0.75rem 1rem;
            border-radius: 6px;
            overflow-x: auto;
            margin: 0.5rem 0;
        }

        .ph-hint-content pre code {
            background: transparent;
            padding: 0;
        }

        .ph-reset-btn {
            margin-top: 0.5rem;
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid #475569;
            border-radius: 6px;
            color: #94a3b8;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .ph-reset-btn:hover {
            background: #1e293b;
            border-color: #64748b;
            color: #cbd5e1;
        }

        .ph-all-revealed .ph-trigger-btn {
            background: linear-gradient(135deg, #4a1c1c 0%, #2d1515 100%);
            border-color: #ef4444;
            color: #fecaca;
        }

        /* Animation for new hint reveal */
        @keyframes ph-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }

        .ph-hint-card.ph-just-revealed {
            animation: ph-pulse 0.6s ease;
        }

        /* Dark theme adjustments (if parent has .dark class) */
        .dark .ph-trigger-btn,
        [data-theme="dark"] .ph-trigger-btn {
            background: linear-gradient(135deg, #1e3a5f 0%, #0a0f1a 100%);
        }
    `;

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    /**
     * Inject styles into document head (only once)
     */
    function injectStyles() {
        if (state.stylesInjected) return;

        const styleEl = document.createElement('style');
        styleEl.id = 'progressive-hints-styles';
        styleEl.textContent = STYLES;
        document.head.appendChild(styleEl);

        state.stylesInjected = true;
    }

    /**
     * Generate unique lab ID from current page
     */
    function generateLabId() {
        return window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_');
    }

    /**
     * Get analytics data from localStorage
     */
    function getAnalytics() {
        try {
            const data = localStorage.getItem(CONFIG.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.warn('ProgressiveHints: Could not read analytics', e);
            return {};
        }
    }

    /**
     * Save analytics data to localStorage
     */
    function saveAnalytics(data) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('ProgressiveHints: Could not save analytics', e);
        }
    }

    /**
     * Track hint reveal in analytics
     */
    function trackHintReveal(labId, hintLevel) {
        const analytics = getAnalytics();

        if (!analytics[labId]) {
            analytics[labId] = {
                firstAccess: new Date().toISOString(),
                hintsRevealed: [],
                totalReveals: 0,
                solutionViewed: false
            };
        }

        const labData = analytics[labId];
        labData.lastAccess = new Date().toISOString();
        labData.totalReveals++;

        if (!labData.hintsRevealed.includes(hintLevel)) {
            labData.hintsRevealed.push(hintLevel);
        }

        if (hintLevel === 4) {
            labData.solutionViewed = true;
        }

        saveAnalytics(analytics);
    }

    /**
     * Create SVG icon for lightbulb
     */
    function createLightbulbIcon() {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
        </svg>`;
    }

    /**
     * Create SVG icon for collapse arrow
     */
    function createCollapseIcon() {
        return `<svg class="ph-collapse-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>`;
    }

    /**
     * Parse hint text for code blocks and inline code
     */
    function parseHintText(text) {
        // Handle code blocks (triple backticks)
        text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

        // Handle inline code (single backticks)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Handle line breaks
        text = text.replace(/\n/g, '<br>');

        return text;
    }

    // ========================================
    // RENDER FUNCTIONS
    // ========================================

    /**
     * Render the complete hint UI
     */
    function render() {
        if (!state.container) return;

        const allRevealed = state.revealedCount >= state.hints.length;

        state.container.innerHTML = `
            <div class="ph-container ${allRevealed ? 'ph-all-revealed' : ''}">
                <div class="ph-controls">
                    <button class="ph-trigger-btn" ${allRevealed ? 'disabled' : ''}>
                        ${createLightbulbIcon()}
                        ${allRevealed ? 'All Hints Revealed' : 'Need a hint?'}
                    </button>
                    <span class="ph-hint-counter">
                        ${state.revealedCount > 0
                            ? `Hint ${state.revealedCount} of ${state.hints.length}`
                            : `${state.hints.length} hints available`}
                    </span>
                </div>
                <div class="ph-hints-wrapper">
                    ${state.hints.map((hint, index) => renderHintCard(hint, index)).join('')}
                </div>
                ${state.revealedCount > 0 ? `
                    <button class="ph-reset-btn">Reset Hints</button>
                ` : ''}
            </div>
        `;

        attachEventListeners();
    }

    /**
     * Render a single hint card
     */
    function renderHintCard(hint, index) {
        const isRevealed = index < state.revealedCount;
        const level = hint.level || (index + 1);
        const colorConfig = CONFIG.colors[level] || CONFIG.colors[1];
        const isSolution = hint.isSolution || level === 4;

        return `
            <div class="ph-hint-card ph-level-${level} ${isRevealed ? 'ph-revealed' : ''}"
                 data-index="${index}">
                <div class="ph-hint-header">
                    <div class="ph-hint-label">
                        <span class="ph-hint-badge">${isSolution ? 'SOLUTION' : `HINT ${level}`}</span>
                        <span>${colorConfig.label}</span>
                    </div>
                    ${createCollapseIcon()}
                </div>
                <div class="ph-hint-content">
                    ${parseHintText(hint.text)}
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to rendered elements
     */
    function attachEventListeners() {
        const container = state.container.querySelector('.ph-container');
        if (!container) return;

        // "Need a hint?" button
        const triggerBtn = container.querySelector('.ph-trigger-btn');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', showNext);
        }

        // Reset button
        const resetBtn = container.querySelector('.ph-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', reset);
        }

        // Hint card headers (collapse/expand)
        const headers = container.querySelectorAll('.ph-hint-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const card = this.closest('.ph-hint-card');
                if (card && card.classList.contains('ph-revealed')) {
                    card.classList.toggle('ph-collapsed');
                }
            });
        });
    }

    // ========================================
    // PUBLIC API
    // ========================================

    /**
     * Initialize the hint system
     * @param {string} containerId - ID of the container element
     * @param {Array} hints - Array of hint objects
     * @param {Object} options - Optional configuration
     */
    function init(containerId, hints, options = {}) {
        // Inject styles
        injectStyles();

        // Find container
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`ProgressiveHints: Container #${containerId} not found`);
            return false;
        }

        // Validate hints
        if (!Array.isArray(hints) || hints.length === 0) {
            console.error('ProgressiveHints: hints must be a non-empty array');
            return false;
        }

        // Initialize state
        state.containerId = containerId;
        state.container = container;
        state.hints = hints.map((hint, index) => ({
            level: hint.level || (index + 1),
            text: hint.text || '',
            isSolution: hint.isSolution || (hint.level === 4) || (index === hints.length - 1 && hints.length === 4)
        }));
        state.revealedCount = 0;
        state.initialized = true;
        state.currentLabId = options.labId || generateLabId();

        // Render initial state
        render();

        return true;
    }

    /**
     * Show the next hint
     * @returns {boolean} True if a hint was revealed, false if all hints shown
     */
    function showNext() {
        if (!state.initialized) {
            console.warn('ProgressiveHints: Not initialized. Call init() first.');
            return false;
        }

        if (state.revealedCount >= state.hints.length) {
            return false;
        }

        // Increment revealed count
        state.revealedCount++;

        // Track in analytics
        const hint = state.hints[state.revealedCount - 1];
        trackHintReveal(state.currentLabId, hint.level);

        // Re-render
        render();

        // Add animation class to newly revealed hint
        setTimeout(() => {
            const newCard = state.container.querySelector(
                `.ph-hint-card[data-index="${state.revealedCount - 1}"]`
            );
            if (newCard) {
                newCard.classList.add('ph-just-revealed');
                // Scroll into view if needed
                newCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 50);

        return true;
    }

    /**
     * Reset all hints (hide all)
     */
    function reset() {
        if (!state.initialized) {
            console.warn('ProgressiveHints: Not initialized. Call init() first.');
            return;
        }

        state.revealedCount = 0;
        render();
    }

    /**
     * Get the number of revealed hints
     * @returns {number} Count of revealed hints
     */
    function getRevealed() {
        return state.revealedCount;
    }

    /**
     * Get analytics for a specific lab or all labs
     * @param {string} labId - Optional lab ID (defaults to current lab)
     * @returns {Object} Analytics data
     */
    function getAnalyticsData(labId = null) {
        const analytics = getAnalytics();

        if (labId) {
            return analytics[labId] || null;
        }

        if (state.currentLabId) {
            return analytics[state.currentLabId] || null;
        }

        return analytics;
    }

    /**
     * Check if solution has been viewed for current lab
     * @returns {boolean} True if solution was viewed
     */
    function wasSolutionViewed() {
        const labData = getAnalyticsData();
        return labData ? labData.solutionViewed : false;
    }

    /**
     * Destroy the hint system and clean up
     */
    function destroy() {
        if (state.container) {
            state.container.innerHTML = '';
        }

        state = {
            containerId: null,
            container: null,
            hints: [],
            revealedCount: 0,
            initialized: false,
            stylesInjected: state.stylesInjected, // Keep styles injected
            currentLabId: null
        };
    }

    // ========================================
    // EXPORT
    // ========================================

    return {
        init,
        showNext,
        reset,
        getRevealed,
        getAnalytics: getAnalyticsData,
        wasSolutionViewed,
        destroy,
        // Expose version for debugging
        version: '1.0.0'
    };

}));
