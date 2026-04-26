/**
 * HouseRenderer.js - Unified 5-Tab House Index Layout
 *
 * Shared renderer for all 9 house index pages. Each house provides
 * a thin config (~50-80 lines) and this module generates the complete
 * page structure with 5 tabs.
 *
 * Pattern: Follows CMMCDomainRenderer.js — IIFE module, init(config) entry point,
 * CSS injected as <style> string, all HTML generated in JS.
 *
 * Tabs:
 *   1. Learning Paths  — Cert path cards from config.paths
 *   2. House Content   — Module cards + text filter from config.modules
 *   3. Explore All     — #discoveryAnchor (ContentDiscovery auto-injects)
 *   4. Profile         — Lazy: XP, level, progress stats
 *   5. Instructor      — Lazy: InstructorDashboard dynamic load
 *
 * Usage:
 *   HouseRenderer.init({
 *       houseId: 'cloud',
 *       icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
 *       title: 'Cloud',
 *       fullTitle: 'House of the Cloud',
 *       domain: 'Infrastructure & Scale',
 *       description: 'Build empires in the ether...',
 *       certBadges: ['AWS CCP', 'Azure Fundamentals'],
 *       paths: [ { id, icon, name, cert, href? } ],
 *       modules: SAMPLE_MODULES,
 *       categories: CATEGORIES,
 *       afterStatsHTML: ''   // optional (dark-arts gates/vault)
 *   });
 *
 * @version 1.0.0
 */

const HouseRenderer = (function() {
    'use strict';

    let config = null;
    let activeTab = 'paths';
    let profileLoaded = false;
    let instructorLoaded = false;

    // Map path IDs → category icon filenames for path card images
    const PATH_CATEGORY_MAP = {
        'aws-ccp': 'aws',
        'azure-fundamentals': 'fundamentals',
        'wsa': 'wsa',
        'security-plus': 'fundamentals',
        'cysa-plus': 'cysa-plus',
        'casp-plus': 'architecture',
        'comptia-linux': 'linux',
        'zero-to-python': 'python',
        'devops-fundamentals': 'devops-automation',
        'linux-mastery': 'linux-admin',
        'comptia-aplus-core1': 'aplus-core1',
        'comptia-aplus-core2': 'aplus-core2',
        'md-100': 'md-100',
        'md-101': 'windows-os',
        'security-operations': 'security-operations',
        'cryptography-track': 'cryptography',
        'security-plus-crypto': 'crypto-protocols',
        'aws-developer': 'aws',
        'comptia-network': 'networking',
        'ccna': 'networking',
        'feh': 'feh-course',
        'ehe': 'certifications',
        'cyberops': 'cyberops',
        'wifi-arsenal': 'wireless',
        'bug-hunting': 'bh-recon',
        'vault': 'vault',
        'python-hub': 'python',
    };

    // ========================================
    // INIT
    // ========================================

    /**
     * Initialize a house index page from a config object.
     * Sets up emblem/mascot paths, loads CSS dependencies (mascot effects, holo-foil, skip-nav),
     * injects styles, renders the full page layout, initializes tabs, and updates progress stats.
     * @param {Object} cfg - House configuration (houseId, title, paths, modules, categories, etc.)
     */
    function init(cfg) {
        config = cfg;
        if (!config.emblem && config.houseId) {
            config.emblem = `/assets/images/emblems/${config.houseId}.webp`;
        }
        // Auto-generate mascot path from houseId (dark_arts → dark-arts)
        if (!config.mascot && config.houseId) {
            const mascotId = config.houseId.replace(/_/g, '-');
            config.mascot = `/assets/images/mascots/${mascotId}-hero.webp`;
        }
        // Load mascot signature effects CSS
        if (!document.getElementById('mascot-fx-css')) {
            const link = document.createElement('link');
            link.id = 'mascot-fx-css';
            link.rel = 'stylesheet';
            link.href = '/css/mascot-effects.css';
            document.head.appendChild(link);
        }
        // Load holographic foil component (auto-inits .holo-card elements)
        if (!document.getElementById('holo-foil-script')) {
            const s = document.createElement('script');
            s.id = 'holo-foil-script';
            s.src = '/components/HoloFoil.js';
            document.body.appendChild(s);
        }
        // Load skip navigation CSS
        if (!document.getElementById('skip-nav-css')) {
            const link = document.createElement('link');
            link.id = 'skip-nav-css';
            link.rel = 'stylesheet';
            link.href = '/css/skip-nav.css';
            document.head.appendChild(link);
        }
        injectCSS();
        renderPage();
        initTabs();
        updateStats();

        // Force-loop mascot video (some browsers ignore the loop attribute)
        var mv = document.querySelector('.hero-mascot video');
        if (mv) mv.addEventListener('ended', function() { this.currentTime = 0; this.play(); });

        console.log(`%c${config.icon} ${config.fullTitle}`, `color: var(--house-primary, #60a5fa); font-size: 14px;`);
    }

    // ========================================
    // CSS INJECTION
    // ========================================

    /** Inject all component CSS as a <style> element (house-header, tabs, cards, hero section) */
    function injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
                min-height: 100vh;
                background: #0a0a0f;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #e0e0e0;
                overflow-x: hidden;
            }

            body::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background:
                    radial-gradient(ellipse at 20% 20%, var(--house-bg) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 80%, var(--house-bg) 0%, transparent 50%);
                pointer-events: none;
                z-index: 0;
            }

            /* Header */
            .house-header {
                padding: 20px 40px;
                border-bottom: 1px solid var(--house-border);
                background: rgba(10, 10, 15, 0.95);
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 100;
                backdrop-filter: blur(10px);
            }

            .header-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .back-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #888;
                font-size: 0.8rem;
                text-decoration: none;
                transition: all 0.3s ease;
            }

            .back-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
                border-color: rgba(255, 255, 255, 0.2);
            }

            .house-badge {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 20px;
                background: var(--house-bg);
                border: 1px solid var(--house-border);
                border-radius: 25px;
            }

            .house-icon { font-size: 1.5rem; display: flex; align-items: center; }
            .house-icon img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }

            .house-badge-text {
                font-size: 0.75rem;
                letter-spacing: 0.2em;
                color: var(--house-primary);
                text-transform: uppercase;
            }

            .header-right {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .cert-badge {
                padding: 6px 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                font-size: 0.7rem;
                color: #888;
                letter-spacing: 0.1em;
            }

            /* Main */
            .house-content {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px;
                position: relative;
                z-index: 10;
            }

            /* Hero */
            .hero-section {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 40px;
                padding: 60px 20px;
                margin-bottom: 50px;
                position: relative;
            }

            .hero-left {
                flex-shrink: 0;
            }

            .hero-right {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                max-width: 550px;
            }

            .hero-mascot {
                margin-bottom: 0;
                filter: drop-shadow(0 0 40px var(--house-glow));
            }

            .hero-mascot img {
                width: 200px;
                height: 266px;
                border-radius: 16px;
                border: 2px solid var(--house-primary);
                box-shadow: 0 0 50px var(--house-glow), 0 0 100px rgba(0,0,0,0.5);
                object-fit: cover;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .hero-mascot video {
                width: 266px;
                height: auto;
                border-radius: 16px;
                border: 2px solid var(--house-primary);
                box-shadow: 0 0 50px var(--house-glow), 0 0 100px rgba(0,0,0,0.5);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .hero-mascot img:hover, .hero-mascot video:hover {
                transform: scale(1.05);
                box-shadow: 0 0 70px var(--house-glow), 0 0 120px rgba(0,0,0,0.5);
            }

            .hero-mascot-name {
                font-size: 1.1rem;
                font-weight: 600;
                color: var(--house-primary);
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-top: 10px;
                text-align: center;
            }

            .hero-mascot-species {
                font-size: 0.7rem;
                color: #8a8a8a;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                text-align: center;
            }

            .hero-mascot-quote {
                font-size: 0.85rem;
                color: #808080;
                font-style: italic;
                max-width: 500px;
                margin: 15px 0 0;
                line-height: 1.6;
            }

            .hero-icon {
                font-size: 5rem;
                margin-bottom: 15px;
                filter: drop-shadow(0 0 30px var(--house-glow));
            }

            .hero-icon img {
                width: 96px;
                height: 96px;
                border-radius: 50%;
                border: 3px solid var(--house-primary);
                box-shadow: 0 0 25px var(--house-glow);
                object-fit: cover;
            }

            .hero-title {
                font-size: 2.5rem;
                font-weight: 300;
                letter-spacing: 0.15em;
                color: #fff;
                margin-bottom: 10px;
            }

            .hero-title span { color: var(--house-primary); }

            .hero-domain {
                font-size: 1rem;
                color: var(--house-primary);
                letter-spacing: 0.3em;
                text-transform: uppercase;
                margin-bottom: 20px;
            }

            .hero-description {
                font-size: 1rem;
                color: #888;
                max-width: 600px;
                line-height: 1.8;
            }

            /* Top-level search bar (always visible) */
            .hr-top-search {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                position: relative;
            }

            .hr-top-search-icon {
                position: absolute;
                left: 14px;
                top: 50%;
                transform: translateY(-50%);
                color: #808080;
                font-size: 1rem;
                pointer-events: none;
                z-index: 1;
            }

            .hr-top-search-input {
                flex: 1;
                padding: 12px 16px 12px 42px;
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                color: #e0e0e0;
                font-size: 0.9rem;
                font-family: inherit;
                outline: none;
                transition: all 0.3s ease;
            }

            .hr-top-search-input:focus {
                border-color: var(--house-primary);
                box-shadow: 0 0 0 3px var(--house-glow);
            }

            .hr-top-search-input::placeholder { color: #808080; }

            .hr-top-search-count {
                font-size: 0.75rem;
                color: #808080;
                white-space: nowrap;
                position: absolute;
                right: 14px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
            }

            .hr-top-search-kbd {
                font-size: 0.6rem;
                color: #808080;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 4px;
                padding: 2px 6px;
                margin-left: 8px;
                font-family: monospace;
            }

            /* Stats bar */
            .stats-bar {
                display: flex;
                justify-content: center;
                gap: 40px;
                padding: 25px;
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid var(--house-border);
                border-radius: 12px;
                margin-bottom: 30px;
            }

            .stat-item { text-align: center; }

            .stat-value {
                font-size: 2rem;
                font-weight: 300;
                color: var(--house-primary);
            }

            .stat-label {
                font-size: 0.7rem;
                color: #8a8a8a;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-top: 5px;
            }

            /* Tab bar */
            .hr-tab-bar {
                display: flex;
                gap: 4px;
                padding: 6px;
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                margin-bottom: 30px;
                overflow-x: auto;
            }

            .hr-tab {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 16px;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 8px;
                color: #8a8a8a;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s ease;
                white-space: nowrap;
                font-family: inherit;
            }

            .hr-tab:hover {
                color: #aaa;
                background: rgba(255, 255, 255, 0.03);
            }

            .hr-tab.active {
                background: rgba(255, 255, 255, 0.05);
                border-color: var(--house-border);
                color: var(--house-primary);
            }

            .hr-tab-icon { font-size: 1rem; }

            /* Tab panels */
            .hr-panel { display: none; }
            .hr-panel.active { display: block; }

            /* Paths panel */
            .paths-section {
                background: rgba(15, 15, 20, 0.4);
                border: 1px solid var(--house-border);
                border-radius: 12px;
                padding: 30px;
            }

            .paths-title {
                font-size: 0.8rem;
                color: var(--house-primary);
                letter-spacing: 0.2em;
                text-transform: uppercase;
                margin-bottom: 20px;
            }

            .paths-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }

            .path-card {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px 20px;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .path-card:hover {
                background: rgba(255, 255, 255, 0.05);
                border-color: var(--house-border);
            }

            .path-icon { font-size: 1.5rem; display: flex; align-items: center; }
            .path-icon img {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                object-fit: cover;
                box-shadow: 0 0 12px var(--house-glow);
            }
            .path-info { flex: 1; }

            .path-name {
                font-size: 0.9rem;
                color: #ddd;
                margin-bottom: 3px;
            }

            .path-cert {
                font-size: 0.7rem;
                color: #8a8a8a;
            }

            .path-progress {
                width: 50px;
                height: 50px;
                position: relative;
            }

            .path-progress-ring { transform: rotate(-90deg); }

            .path-progress-bg {
                fill: none;
                stroke: rgba(255, 255, 255, 0.05);
                stroke-width: 4;
            }

            .path-progress-fill {
                fill: none;
                stroke: var(--house-primary);
                stroke-width: 4;
                stroke-linecap: round;
                stroke-dasharray: 126;
                stroke-dashoffset: 126;
                transition: stroke-dashoffset 0.5s ease;
            }

            .path-progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.7rem;
                color: #888;
            }

            /* Content panel - filter + modules */
            .hr-filter-bar {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
            }

            .hr-filter-input {
                flex: 1;
                padding: 10px 16px;
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #e0e0e0;
                font-size: 0.9rem;
                font-family: inherit;
                outline: none;
                transition: border-color 0.3s;
            }

            .hr-filter-input:focus {
                border-color: var(--house-primary);
            }

            .hr-filter-input::placeholder { color: #808080; }

            .hr-filter-count {
                font-size: 0.75rem;
                color: #808080;
                white-space: nowrap;
            }

            .hr-favorites-filter {
                padding: 6px 14px;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 6px;
                color: #8a8a8a;
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s ease;
                font-family: inherit;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .hr-favorites-filter:hover {
                border-color: var(--house-primary);
                color: var(--house-primary);
            }
            .hr-favorites-filter.active {
                background: var(--house-glow, rgba(96,165,250,0.15));
                border-color: var(--house-primary);
                color: var(--house-primary);
            }

            .module-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .module-card {
                position: relative;
                background: rgba(15, 15, 20, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .module-card:hover {
                border-color: var(--house-border);
                background: rgba(20, 20, 25, 0.6);
            }

            .module-card.favorited {
                border-color: var(--house-primary, #60a5fa);
                box-shadow: 0 0 12px var(--house-glow, rgba(96,165,250,0.2));
            }

            .module-card.favorited:hover {
                box-shadow: 0 0 20px var(--house-glow, rgba(96,165,250,0.3));
            }

            .module-card.hidden { display: none; }

            .module-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;
            }

            .module-icon {
                font-size: 1.4rem;
                display: flex;
                align-items: center;
            }

            .module-icon img {
                width: 32px;
                height: 32px;
                border-radius: 6px;
                object-fit: cover;
            }

            .module-badges {
                display: flex;
                gap: 6px;
                align-items: center;
            }

            .module-status {
                padding: 3px 10px;
                border-radius: 8px;
                font-size: 0.6rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }

            .module-status.available {
                background: rgba(34, 197, 94, 0.15);
                color: #4ade80;
            }

            .module-status.coming-soon {
                background: rgba(255, 255, 255, 0.05);
                color: #8a8a8a;
            }

            .module-status.completed {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
            }

            .module-type-badge {
                padding: 3px 10px;
                border-radius: 8px;
                font-size: 0.6rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                font-weight: 600;
            }

            .module-type-badge.type-lab {
                background: rgba(59, 130, 246, 0.15);
                color: #60a5fa;
            }

            .module-type-badge.type-game {
                background: rgba(234, 179, 8, 0.15);
                color: #facc15;
            }

            .module-type-badge.type-reference {
                background: rgba(168, 85, 247, 0.15);
                color: #c084fc;
            }

            .module-type-badge.type-review {
                background: rgba(168, 85, 247, 0.2);
                color: #c084fc;
                border: 1px solid rgba(168, 85, 247, 0.3);
            }

            .module-title {
                font-size: 0.95rem;
                color: #ddd;
                margin-bottom: 8px;
            }

            .module-description {
                font-size: 0.75rem;
                color: #8a8a8a;
                line-height: 1.5;
                margin-bottom: 12px;
            }

            .module-components {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .component-tag {
                padding: 4px 10px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 6px;
                font-size: 0.65rem;
                color: #888;
            }

            .hr-no-results {
                text-align: center;
                padding: 40px 20px;
                color: #808080;
                font-size: 0.9rem;
            }

            /* Explore panel */
            .hr-explore-info {
                text-align: center;
                padding: 20px;
                color: #808080;
                font-size: 0.8rem;
                margin-bottom: 20px;
            }

            /* Feature cards in Explore panel */
            .hr-features-section { margin-bottom: 30px; }
            .hr-features-title {
                color: var(--house-primary, #60a5fa);
                font-family: 'Segoe UI', sans-serif;
                font-size: 0.85rem;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-bottom: 18px;
                text-shadow: 0 0 15px var(--house-glow, rgba(96,165,250,0.3));
            }
            .hr-feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 15px;
            }
            .hr-feature-card {
                text-decoration: none;
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 22px;
                display: block;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            .hr-feature-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 2px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .hr-feature-card:hover {
                transform: translateY(-4px);
                background: rgba(20, 20, 25, 0.8);
            }
            .hr-feature-card:hover::before { opacity: 1; }
            .hr-feature-card.feat-arena { border-color: rgba(239, 68, 68, 0.25); }
            .hr-feature-card.feat-arena:hover { border-color: rgba(239, 68, 68, 0.5); box-shadow: 0 0 25px rgba(239, 68, 68, 0.2); }
            .hr-feature-card.feat-arena::before { background: linear-gradient(90deg, #ef4444, #f87171); }
            .hr-feature-card.feat-hive { border-color: rgba(234, 179, 8, 0.25); }
            .hr-feature-card.feat-hive:hover { border-color: rgba(234, 179, 8, 0.5); box-shadow: 0 0 25px rgba(234, 179, 8, 0.2); }
            .hr-feature-card.feat-hive::before { background: linear-gradient(90deg, #eab308, #fbbf24); }
            .hr-feature-card.feat-arctic { border-color: rgba(56, 189, 248, 0.25); }
            .hr-feature-card.feat-arctic:hover { border-color: rgba(56, 189, 248, 0.5); box-shadow: 0 0 25px rgba(56, 189, 248, 0.2); }
            .hr-feature-card.feat-arctic::before { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
            .hr-feature-card.feat-colosseum { border-color: rgba(147, 51, 234, 0.25); }
            .hr-feature-card.feat-colosseum:hover { border-color: rgba(147, 51, 234, 0.5); box-shadow: 0 0 25px rgba(147, 51, 234, 0.2); }
            .hr-feature-card.feat-colosseum::before { background: linear-gradient(90deg, #7c3aed, #9333ea); }
            .hr-feature-icon img { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; }
            .hr-feature-icon { font-size: 1.6rem; margin-bottom: 10px; }
            .hr-feature-name { font-size: 0.9rem; font-family: 'Segoe UI', sans-serif; font-weight: 600; margin-bottom: 6px; }
            .hr-feature-desc { font-size: 0.72rem; color: #8a8a8a; font-family: 'Segoe UI', sans-serif; line-height: 1.5; }

            /* Course hub cards in content panel */
            .hr-hub-section { margin-bottom: 25px; }
            .hr-hub-title {
                color: var(--house-primary, #60a5fa);
                font-family: 'Segoe UI', sans-serif;
                font-size: 0.85rem;
                letter-spacing: 0.15em;
                text-transform: uppercase;
                margin-bottom: 15px;
                text-shadow: 0 0 15px var(--house-glow, rgba(96,165,250,0.3));
            }
            .hr-hub-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 15px;
            }
            .hr-hub-card {
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid var(--house-border, rgba(96,165,250,0.25));
                border-radius: 10px;
                padding: 22px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            .hr-hub-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 2px;
                background: linear-gradient(90deg, var(--house-primary, #60a5fa), var(--house-accent, #93c5fd));
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .hr-hub-card:hover {
                transform: translateY(-4px);
                background: rgba(20, 20, 25, 0.8);
                border-color: var(--house-primary, #60a5fa);
                box-shadow: 0 0 25px var(--house-glow, rgba(96,165,250,0.2));
            }
            .hr-hub-card:hover::before { opacity: 1; }
            .hr-hub-icon { margin-bottom: 12px; }
            .hr-hub-icon img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
            .hr-hub-name {
                font-size: 0.95rem;
                color: #ddd;
                font-family: 'Segoe UI', sans-serif;
                font-weight: 600;
                margin-bottom: 5px;
            }
            .hr-hub-cert {
                font-size: 0.72rem;
                color: var(--house-primary, #60a5fa);
                font-family: 'Segoe UI', sans-serif;
                letter-spacing: 0.05em;
            }

            /* Profile panel */
            .hr-profile-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .hr-profile-card {
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 20px;
                text-align: center;
            }

            .hr-profile-card-value {
                font-size: 2rem;
                font-weight: 300;
                color: var(--house-primary);
                margin-bottom: 5px;
            }

            .hr-profile-card-label {
                font-size: 0.7rem;
                color: #8a8a8a;
                letter-spacing: 0.15em;
                text-transform: uppercase;
            }

            .hr-xp-bar-container {
                background: rgba(15, 15, 20, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
            }

            .hr-xp-bar-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .hr-xp-bar-level {
                font-size: 0.9rem;
                color: var(--house-primary);
            }

            .hr-xp-bar-xp {
                font-size: 0.75rem;
                color: #8a8a8a;
            }

            .hr-xp-bar-track {
                height: 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                overflow: hidden;
            }

            .hr-xp-bar-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--house-primary), var(--house-secondary, var(--house-primary)));
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .hr-profile-empty {
                text-align: center;
                padding: 60px 20px;
                color: #808080;
            }

            .hr-profile-empty-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .hr-profile-empty-text {
                font-size: 0.9rem;
                margin-bottom: 8px;
            }

            .hr-profile-empty-hint {
                font-size: 0.75rem;
                color: #808080;
            }

            /* Instructor panel */
            .hr-instructor-loading {
                text-align: center;
                padding: 60px 20px;
                color: #808080;
            }

            .hr-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255, 255, 255, 0.05);
                border-top-color: var(--house-primary);
                border-radius: 50%;
                animation: hr-spin 0.8s linear infinite;
                margin: 0 auto 15px;
            }

            @keyframes hr-spin {
                to { transform: rotate(360deg); }
            }

            /* Footer */
            .house-footer {
                text-align: center;
                padding: 30px;
                border-top: 1px solid rgba(255, 255, 255, 0.03);
                margin-top: 50px;
            }

            .footer-text {
                font-size: 0.65rem;
                color: #333;
                letter-spacing: 0.2em;
            }

            /* Focus-visible styles for keyboard navigation */
            .path-card:focus-visible,
            .hr-hub-card:focus-visible,
            .module-card:focus-visible {
                outline: 2px solid var(--house-primary, #60a5fa);
                outline-offset: 2px;
                border-color: var(--house-primary, #60a5fa);
                box-shadow: 0 0 0 4px var(--house-glow, rgba(96, 165, 250, 0.25));
            }

            .hr-feature-card:focus-visible {
                outline: 2px solid var(--house-primary, #60a5fa);
                outline-offset: 2px;
                box-shadow: 0 0 0 4px var(--house-glow, rgba(96, 165, 250, 0.25));
            }

            /* Responsive */
            @media (max-width: 768px) {
                .house-header {
                    padding: 15px 20px;
                    flex-direction: column;
                    gap: 15px;
                }
                .house-content { padding: 20px; }
                .hero-section {
                    flex-direction: column;
                    text-align: center;
                }
                .hero-right {
                    align-items: center;
                }
                .hero-mascot-quote {
                    margin: 15px auto 0;
                }
                .hero-description {
                    margin: 0 auto;
                }
                .hero-mascot img { width: 150px; height: 200px; }
                .hero-mascot video { width: 200px; height: auto; }
                .hero-title { font-size: 1.8rem; }
                .stats-bar { flex-wrap: wrap; gap: 20px; }
                .stat-item { flex: 1 1 45%; }
                .hr-tab-bar { gap: 2px; padding: 4px; }
                .hr-tab { padding: 10px 8px; font-size: 0.7rem; gap: 4px; }
                .hr-tab-label { display: none; }
                .hr-tab-icon { font-size: 1.2rem; }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .path-card,
                .module-card,
                .hr-hub-card,
                .hr-feature-card,
                .hr-tab,
                .back-btn,
                .stat-item,
                .house-badge { transition: none !important; }
                .path-card:hover,
                .module-card:hover,
                .hr-hub-card:hover { transform: none !important; }
                .hr-spinner { animation: none; }
            }

            /* High contrast */
            @media (prefers-contrast: more) {
                .path-card,
                .module-card,
                .hr-hub-card { border-color: rgba(255, 255, 255, 0.4); }
                .hr-tab { border: 1px solid rgba(255, 255, 255, 0.3); }
                .hr-tab.active { border-color: var(--house-primary, #60a5fa); }
                .house-badge-text { color: #fff; }
                .stat-label { color: #ccc; }
                .module-cat { color: #ccc; }
                .hero-description { color: #ccc; }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // PAGE RENDER
    // ========================================

    /** Generate and inject the complete page DOM: header, hero section, 5-tab content area */
    function renderPage() {
        // Header
        const header = document.createElement('header');
        header.className = 'house-header';
        header.setAttribute('role', 'banner');
        header.innerHTML = `
            <div class="header-left">
                <a href="${(typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getUrl('dashboard') : '../../dashboard.html'}" class="back-btn">
                    <span>&larr;</span>
                    <span>${(typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getName() : 'Dashboard'}</span>
                </a>
                <div class="house-badge">
                    <span class="house-icon">${config.emblem ? `<img src="${config.emblem}" alt="${config.fullTitle}" onerror="this.onerror=null;this.src='/assets/images/icons/icon-home.webp'">` : config.icon}</span>
                    <span class="house-badge-text">${config.fullTitle}</span>
                </div>
            </div>
            <div class="header-right">
                ${(config.certBadges || []).map(b => `<span class="cert-badge">${b}</span>`).join('')}
            </div>
        `;
        document.body.appendChild(header);

        // Skip navigation link (accessibility)
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-nav';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Main
        const main = document.createElement('main');
        main.className = 'house-content';
        main.id = 'main-content';

        // Mascot lore (if MascotLore is loaded)
        const mascotId = config.houseId ? config.houseId.replace(/_/g, '-') : null;
        const lore = (typeof MascotLore !== 'undefined' && mascotId) ? MascotLore.get(mascotId) : null;

        // Hero
        main.innerHTML = `
            <section class="hero-section" role="region" aria-label="${config.fullTitle} overview">
                <div class="hero-left">
                    ${config.mascot ? `<div class="hero-mascot mascot-fx mascot-fx-${mascotId} holo-card holo-subtle">
                        ${config.mascotVideo
                            ? `<video poster="${config.mascot}" autoplay loop muted playsinline><source src="${config.mascotVideo}" type="video/mp4"></video>`
                            : `<img src="${config.mascot}" alt="${config.fullTitle} mascot" onerror="this.parentElement.style.display='none'">`}
                        ${lore ? `<div class="hero-mascot-name">${lore.name}</div><div class="hero-mascot-species">${lore.species}</div>` : ''}
                    </div>` : ''}
                </div>
                <div class="hero-right">
                    <div class="hero-icon">${config.emblem ? `<img src="${config.emblem}" alt="${config.fullTitle} emblem" onerror="this.onerror=null;this.src='/assets/images/icons/icon-home.webp'">` : config.icon}</div>
                    <h1 class="hero-title">${config.customTitle ? config.customTitle : `House of the <span>${config.title}</span>`}</h1>
                    <p class="hero-domain">${config.domain}</p>
                    <p class="hero-description">${config.description}</p>
                    ${lore ? `<p class="hero-mascot-quote">"${lore.quote}"</p>` : ''}
                </div>
            </section>

            <div class="stats-bar" role="group" aria-label="House statistics">
                <div class="stat-item" role="group" aria-label="Total Modules">
                    <div class="stat-value" id="hrTotalModules" aria-live="polite">0</div>
                    <div class="stat-label">Total Modules</div>
                </div>
                <div class="stat-item" role="group" aria-label="Completed">
                    <div class="stat-value" id="hrCompleted" aria-live="polite">0</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-item" role="group" aria-label="Hours of Content">
                    <div class="stat-value" id="hrHours">0</div>
                    <div class="stat-label">Hours of Content</div>
                </div>
                <div class="stat-item" role="group" aria-label="Cert Paths">
                    <div class="stat-value" id="hrCertPaths">${(config.paths || []).length}</div>
                    <div class="stat-label">Cert Paths</div>
                </div>
            </div>
        `;

        // afterStatsHTML (for dark-arts gates/vault/etc.)
        if (config.afterStatsHTML) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = config.afterStatsHTML;
            while (wrapper.firstChild) {
                main.appendChild(wrapper.firstChild);
            }
        }

        // Top-level search bar (always visible)
        const searchPlaceholder = config.searchPlaceholder || `Search ${config.fullTitle} modules...`;
        const topSearch = document.createElement('div');
        topSearch.className = 'hr-top-search';
        topSearch.innerHTML = `
            <span class="hr-top-search-icon" aria-hidden="true"><img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></span>
            <input type="text" class="hr-top-search-input" id="hrTopSearchInput"
                   placeholder="${searchPlaceholder}"
                   aria-label="Search ${config.fullTitle} modules"
                   autocomplete="off">
            <span class="hr-top-search-count" id="hrTopSearchCount"></span>
        `;
        main.appendChild(topSearch);

        // Tab bar
        const tabs = [
            { id: 'paths',      icon: '<img src="/assets/images/icons/icon-target.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Learning Paths' },
            { id: 'content',    icon: '<img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'House Content' },
            { id: 'explore',    icon: '<img src="/assets/images/icons/icon-map.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Explore All' },
            { id: 'profile',    icon: '<img src="/assets/images/icons/icon-users.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Profile' },
            { id: 'instructor', icon: '<img src="/assets/images/icons/icon-clipboard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Instructor' }
        ];

        const tabBar = document.createElement('nav');
        tabBar.className = 'hr-tab-bar';
        tabBar.setAttribute('role', 'tablist');
        tabBar.setAttribute('aria-label', config.fullTitle + ' navigation');
        tabBar.innerHTML = tabs.map((t, i) =>
            `<button class="hr-tab" role="tab" id="hr-tab-${t.id}" data-tab="${t.id}" aria-label="${t.label}" aria-selected="${i === 0 ? 'true' : 'false'}" aria-controls="hr-panel-${t.id}" tabindex="${i === 0 ? '0' : '-1'}">
                <span class="hr-tab-icon" aria-hidden="true">${t.icon}</span>
                <span class="hr-tab-label">${t.label}</span>
            </button>`
        ).join('');
        main.appendChild(tabBar);

        // Tab panels
        const panelLabels = {
            paths: 'Learning paths',
            content: 'House content',
            explore: 'Explore all content',
            profile: 'Your profile',
            instructor: 'Instructor dashboard'
        };
        tabs.forEach(t => {
            const panel = document.createElement('div');
            panel.className = 'hr-panel';
            panel.id = 'hr-panel-' + t.id;
            panel.dataset.tab = t.id;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', 'hr-tab-' + t.id);
            panel.setAttribute('tabindex', '0');
            main.appendChild(panel);
        });

        document.body.appendChild(main);

        // Footer
        const footer = document.createElement('footer');
        footer.className = 'house-footer';
        footer.innerHTML = `<p class="footer-text">HEXWORTH PRIME // ${config.fullTitle.toUpperCase()}</p>`;
        document.body.appendChild(footer);

        // Render immediate panels
        renderPathsPanel();
        renderContentPanel();
        renderExplorePanel();
    }

    // ========================================
    // TAB SYSTEM
    // ========================================

    /** Initialize the 5-tab navigation (Paths, Content, Explore, Profile, Instructor) */
    function initTabs() {
        const stored = localStorage.getItem('hexworth_house_tab_' + config.houseId);
        activeTab = stored || 'paths';

        document.querySelectorAll('.hr-tab').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

        // Keyboard navigation for tab list (Arrow keys, Home, End)
        const tabBar = document.querySelector('.hr-tab-bar[role="tablist"]');
        if (tabBar) {
            tabBar.addEventListener('keydown', function(e) {
                const tabs = Array.from(tabBar.querySelectorAll('[role="tab"]'));
                const idx = tabs.indexOf(document.activeElement);
                if (idx < 0) return;
                let target = null;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    target = tabs[(idx + 1) % tabs.length];
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    target = tabs[(idx - 1 + tabs.length) % tabs.length];
                } else if (e.key === 'Home') {
                    target = tabs[0];
                } else if (e.key === 'End') {
                    target = tabs[tabs.length - 1];
                }
                if (target) {
                    e.preventDefault();
                    target.focus();
                    switchTab(target.dataset.tab);
                }
            });
        }

        switchTab(activeTab);

        // Wire up top-level search
        const topInput = document.getElementById('hrTopSearchInput');
        if (topInput) {
            topInput.addEventListener('input', topLevelSearch);

            // Keyboard shortcut: / to focus search (when not already in an input)
            document.addEventListener('keydown', function(e) {
                if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    topInput.focus();
                }
                if (e.key === 'Escape' && document.activeElement === topInput) {
                    topInput.value = '';
                    topLevelSearch();
                    topInput.blur();
                }
            });
        }
    }

    /** Create the search bar that filters across paths and modules */
    function topLevelSearch() {
        const topInput = document.getElementById('hrTopSearchInput');
        const query = (topInput ? topInput.value : '').toLowerCase().trim();
        const modules = config.modules || [];
        const countEl = document.getElementById('hrTopSearchCount');

        if (!query) {
            // Clear: reset all cards, hide count
            const cards = document.querySelectorAll('#hrModuleGrid .module-card');
            cards.forEach(card => card.classList.remove('hidden'));
            if (countEl) countEl.textContent = '';
            // Also sync the tab-level filter input
            const tabInput = document.getElementById('hrFilterInput');
            if (tabInput) tabInput.value = '';
            const tabCount = document.getElementById('hrFilterCount');
            if (tabCount) tabCount.textContent = modules.length + ' modules';
            const noResults = document.getElementById('hrNoResults');
            if (noResults) noResults.style.display = 'none';
            // Also clear discovery search when on explore tab
            if (activeTab === 'explore') {
                const discoveryInput = document.getElementById('discoverySearch');
                if (discoveryInput && discoveryInput.value) {
                    discoveryInput.value = '';
                    discoveryInput.dispatchEvent(new Event('input'));
                }
            }
            return;
        }

        // When on explore tab, forward search to ContentDiscovery panel instead
        if (activeTab === 'explore') {
            const discoveryInput = document.getElementById('discoverySearch');
            if (discoveryInput) {
                discoveryInput.value = query ? topInput.value : '';
                discoveryInput.dispatchEvent(new Event('input'));
            }
            if (countEl) countEl.textContent = '';
            return;
        }

        // Auto-switch to content tab when user types (from paths/profile tabs)
        if (activeTab !== 'content') {
            switchTab('content');
        }

        // Filter modules
        const cards = document.querySelectorAll('#hrModuleGrid .module-card');
        let visible = 0;

        cards.forEach((card, idx) => {
            const mod = modules[idx];
            if (!mod) return;

            const searchable = [
                mod.title,
                mod.description,
                ...(mod.tags || []),
                ...(mod.components || [])
            ].join(' ').toLowerCase();

            if (searchable.includes(query)) {
                card.classList.remove('hidden');
                visible++;
            } else {
                card.classList.add('hidden');
            }
        });

        // Update count display
        if (countEl) {
            countEl.textContent = visible + ' of ' + modules.length;
        }

        // Sync tab-level filter
        const tabInput = document.getElementById('hrFilterInput');
        if (tabInput) tabInput.value = query;
        const tabCount = document.getElementById('hrFilterCount');
        if (tabCount) tabCount.textContent = visible + ' of ' + modules.length;
        const noResults = document.getElementById('hrNoResults');
        if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';
    }

    /** Switch to a tab by ID, lazy-loading content panels on first view */
    function switchTab(tabId) {
        activeTab = tabId;
        localStorage.setItem('hexworth_house_tab_' + config.houseId, tabId);

        // Update tab buttons + ARIA
        document.querySelectorAll('.hr-tab[role="tab"]').forEach(btn => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Update panels
        document.querySelectorAll('.hr-panel[role="tabpanel"]').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.tab === tabId);
        });

        // Lazy load
        if (tabId === 'profile' && !profileLoaded) {
            renderProfilePanel();
            profileLoaded = true;
        }
        if (tabId === 'instructor' && !instructorLoaded) {
            renderInstructorPanel();
            instructorLoaded = true;
        }
    }

    // ========================================
    // PATHS PANEL
    // ========================================

    /** Render the Learning Paths tab with certification path cards */
    function renderPathsPanel() {
        const panel = document.getElementById('hr-panel-paths');
        if (!config.paths || config.paths.length === 0) {
            panel.innerHTML = '<div class="hr-profile-empty"><div class="hr-profile-empty-icon"><img src="/assets/images/icons/icon-target.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div><div class="hr-profile-empty-text">No certification paths configured yet.</div></div>';
            return;
        }

        const pathCards = config.paths.map(p => {
            const catId = PATH_CATEGORY_MAP[p.id];
            const pIconSrc = (p.icon && p.icon.includes('src=')) ? (p.icon.match(/src="([^"]+)"/)?.[1] || '/assets/images/icons/icon-books.webp') : (p.icon || '/assets/images/icons/icon-books.webp');
            const iconHTML = catId
                ? `<img src="/assets/images/categories/${catId}.webp" alt="${p.name}" onerror="this.onerror=null;this.src='${pIconSrc}'">`
                : p.icon;
            return `
            <div class="path-card" role="listitem" tabindex="0" data-path-id="${p.id}" data-path-href="${p.href || ''}" aria-label="${p.name} - ${p.cert}">
                <div class="path-icon" aria-hidden="true">${iconHTML}</div>
                <div class="path-info">
                    <div class="path-name">${p.name}</div>
                    <div class="path-cert">${p.cert}</div>
                </div>
                <div class="path-progress">
                    <svg class="path-progress-ring" width="50" height="50">
                        <circle class="path-progress-bg" cx="25" cy="25" r="20"/>
                        <circle class="path-progress-fill" cx="25" cy="25" r="20" style="stroke-dashoffset: 126"/>
                    </svg>
                    <span class="path-progress-text">0%</span>
                </div>
            </div>
        `;}).join('');

        panel.innerHTML = `
            <section class="paths-section" role="region" aria-label="Certification paths">
                <h2 class="paths-title">Certification Paths</h2>
                <div class="paths-grid" role="list">${pathCards}</div>
            </section>
        `;

        // Bind clicks and keyboard navigation
        panel.querySelectorAll('.path-card').forEach(card => {
            const navigatePath = () => {
                const href = card.dataset.pathHref;
                const pathId = card.dataset.pathId;
                if (href) {
                    window.location.href = href;
                } else {
                    window.location.href = `../../path-view.html?house=${config.houseId}&path=${pathId}`;
                }
            };
            card.addEventListener('click', navigatePath);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigatePath();
                }
            });
        });
    }

    // ========================================
    // CONTENT PANEL
    // ========================================

    /** Render the House Content tab with filterable module cards */
    function renderContentPanel() {
        const panel = document.getElementById('hr-panel-content');
        const modules = config.modules || [];
        const paths = config.paths || [];

        // Build course hub cards from paths config
        let hubHTML = '';
        if (paths.length > 0) {
            const hubCards = paths.map(p => {
                const catId = PATH_CATEGORY_MAP[p.id];
                const iconSrc = catId
                    ? `/assets/images/categories/${catId}.webp`
                    : (p.icon && p.icon.includes('src=') ? p.icon.match(/src="([^"]+)"/)?.[1] || '' : '');
                const fallbackSrc = (p.icon && p.icon.includes('src=')) ? (p.icon.match(/src="([^"]+)"/)?.[1] || '/assets/images/icons/icon-books.webp') : (p.icon && !p.icon.includes('<') ? p.icon : '/assets/images/icons/icon-books.webp');
                const iconHTML = iconSrc
                    ? `<img src="${iconSrc}" alt="${p.name}" onerror="this.onerror=null;this.src='${fallbackSrc}'">`
                    : (p.icon || '<img src="/assets/images/icons/icon-books.webp" alt="">');
                const href = p.href || `../../path-view.html?house=${config.houseId}&path=${p.id}`;
                return `
                    <div class="hr-hub-card" role="listitem" tabindex="0" data-href="${href}" aria-label="${p.name} - ${p.cert}">
                        <div class="hr-hub-icon" aria-hidden="true">${iconHTML}</div>
                        <div class="hr-hub-name">${p.name}</div>
                        <div class="hr-hub-cert">${p.cert}</div>
                    </div>`;
            }).join('');

            hubHTML = `
                <div class="hr-hub-section">
                    <h3 class="hr-hub-title">Course Hubs</h3>
                    <div class="hr-hub-grid" role="list">${hubCards}</div>
                </div>`;
        }

        panel.innerHTML = `
            ${hubHTML}
            <div class="hr-filter-bar">
                <input type="text" class="hr-filter-input" id="hrFilterInput"
                       placeholder="Filter modules by title, description, or type..."
                       aria-label="Filter modules by title, description, or type"
                       autocomplete="off">
                <button class="hr-favorites-filter" id="hrFavoritesFilter" title="Show favorites only" aria-pressed="false">&#9829; Favorites</button>
                <span class="hr-filter-count" id="hrFilterCount">${modules.length} modules</span>
            </div>
            <div class="module-grid" id="hrModuleGrid" role="list"></div>
            <div class="hr-no-results" id="hrNoResults" style="display:none;">No modules match your filter.</div>
        `;

        // Bind hub card clicks and keyboard navigation
        panel.querySelectorAll('.hr-hub-card').forEach(card => {
            const navigateHub = () => {
                window.location.href = card.dataset.href;
            };
            card.addEventListener('click', navigateHub);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigateHub();
                }
            });
        });

        const grid = document.getElementById('hrModuleGrid');
        modules.forEach((mod, idx) => {
            const card = document.createElement('div');
            card.className = 'module-card';
            card.setAttribute('role', 'listitem');
            card.setAttribute('tabindex', '0');
            card.dataset.idx = idx;
            card.dataset.href = mod.href || '';
            card.dataset.moduleId = mod.id;
            if (typeof FavoritesManager !== 'undefined' && FavoritesManager.isFavorite(mod.id)) {
                card.classList.add('favorited');
            }

            const typeBadge = getTypeBadge(mod);
            const catIcon = mod.category
                ? `<img src="/assets/images/categories/${mod.category}.webp" alt="${mod.title || mod.category}" onerror="this.onerror=null;this.src='${mod.icon}'">`
                : `<img src="${mod.icon}" alt="${mod.title || ''}">`;
            card.innerHTML = `
                <div class="module-header">
                    <span class="module-icon">${catIcon}</span>
                    <div class="module-badges">
                        ${typeBadge}
                        <span class="module-status ${mod.status}">${(mod.status || '').replace('-', ' ')}</span>
                    </div>
                </div>
                <div class="module-title">${mod.title}</div>
                <div class="module-description">${mod.description}</div>
                <div class="module-components">
                    ${(mod.components || []).map(c => `<span class="component-tag">${getComponentLabel(c)}</span>`).join('')}
                </div>
            `;

            card.addEventListener('click', () => openModule(mod));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModule(mod);
                }
            });
            grid.appendChild(card);
        });

        // Filter input
        document.getElementById('hrFilterInput').addEventListener('input', filterModules);

        // Favorites filter
        const favFilterBtn = document.getElementById('hrFavoritesFilter');
        if (favFilterBtn && typeof FavoritesManager !== 'undefined') {
            favFilterBtn.addEventListener('click', function() {
                const isActive = this.classList.toggle('active');
                this.setAttribute('aria-pressed', isActive);
                window._hrFavoritesFilterActive = isActive;
                filterModules();
            });
        } else if (favFilterBtn) {
            favFilterBtn.style.display = 'none';
        }
    }

    /** Filter module cards by search text and category dropdown */
    function filterModules() {
        const query = document.getElementById('hrFilterInput').value.toLowerCase().trim();
        const modules = config.modules || [];
        const cards = document.querySelectorAll('#hrModuleGrid .module-card');
        const favActive = window._hrFavoritesFilterActive && typeof FavoritesManager !== 'undefined';
        let visible = 0;

        cards.forEach((card, idx) => {
            const mod = modules[idx];
            if (!mod) return;

            // Favorites filter
            if (favActive && !FavoritesManager.isFavorite(mod.id)) {
                card.classList.add('hidden');
                return;
            }

            if (!query) {
                card.classList.remove('hidden');
                visible++;
                return;
            }

            const searchable = [
                mod.title,
                mod.description,
                ...(mod.tags || []),
                ...(mod.components || [])
            ].join(' ').toLowerCase();

            if (searchable.includes(query)) {
                card.classList.remove('hidden');
                visible++;
            } else {
                card.classList.add('hidden');
            }
        });

        const countEl = document.getElementById('hrFilterCount');
        const noResults = document.getElementById('hrNoResults');

        if (query || favActive) {
            countEl.textContent = `${visible} of ${modules.length}`;
            noResults.style.display = visible === 0 ? 'block' : 'none';
        } else {
            countEl.textContent = `${modules.length} modules`;
            noResults.style.display = 'none';
        }

        // Sync top-level search bar
        const topInput = document.getElementById('hrTopSearchInput');
        if (topInput && topInput.value !== document.getElementById('hrFilterInput').value) {
            topInput.value = document.getElementById('hrFilterInput').value;
        }
        const topCount = document.getElementById('hrTopSearchCount');
        if (topCount) {
            topCount.textContent = (query || favActive) ? (visible + ' of ' + modules.length) : '';
        }
    }

    /** @returns {string} HTML badge showing module type (quiz, lab, presentation, applet) */
    function getTypeBadge(mod) {
        if (!mod.components) return '';
        if (mod.type === 'review' || mod.components.includes('review')) return '<span class="module-type-badge type-review">Review</span>';
        if (mod.components.includes('game')) return '<span class="module-type-badge type-game">Game</span>';
        if (mod.components.includes('lab')) return '<span class="module-type-badge type-lab">Lab</span>';
        if (mod.components.includes('reference')) return '<span class="module-type-badge type-reference">Ref</span>';
        return '';
    }

    function getComponentLabel(component) {
        const labels = {
            presentation: '<img src="/assets/images/icons/icon-barchart.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Slides',
            applet: '<img src="/assets/images/icons/icon-joystick.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Interactive',
            lab: '<img src="/assets/images/icons/icon-flask.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Lab',
            quiz: '<img src="/assets/images/icons/icon-notepad.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Quiz',
            game: '<img src="/assets/images/icons/icon-joystick.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Game',
            review: '<img src="/assets/images/icons/icon-refresh.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Review',
            reference: '<img src="/assets/images/icons/icon-books.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Reference',
            tool: '<img src="/assets/images/icons/icon-wrench.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> Tool'
        };
        return labels[component] || component;
    }

    /** Navigate to a module, resolving the path relative to the house hub */
    function openModule(mod) {
        if (mod.status === 'available' && mod.href) {
            window.location.href = mod.href;
        } else if (mod.status === 'coming-soon') {
            alert('This module is coming soon!');
        }
    }

    // ========================================
    // EXPLORE PANEL
    // ========================================

    /**
     * Render the Explore All tab panel.
     *
     * This tab has TWO distinct sections:
     *
     *   1. SPECIAL FEATURES (below) — Curated highlight cards with rich descriptions,
     *      colored names, and links to major platform experiences (Arena, Hive, Arctic,
     *      Operator, etc.). These are hand-crafted promotional cards.
     *      TO ADD A NEW FEATURE: Add an <a> element to the hr-feature-grid below.
     *
     *   2. PLATFORM HUBS (injected by ContentDiscovery.js) — Compact icon grid of ALL
     *      cross-house content hubs. Appears below the search bar via renderPlatformHubs().
     *      Data-driven from the PLATFORM_HUBS array in ContentDiscovery.js.
     *      TO ADD A NEW HUB: Add an entry to PLATFORM_HUBS in ContentDiscovery.js.
     *
     * Both sections are intentional — Special Features provides editorial curation
     * with descriptions, while Platform Hubs provides quick-access navigation.
     * They complement each other; do not remove one thinking it duplicates the other.
     */
    /** Render the Explore All tab with ContentDiscovery anchor */
    function renderExplorePanel() {
        const panel = document.getElementById('hr-panel-explore');
        panel.innerHTML = `
            <div class="hr-features-section">
                <h3 class="hr-features-title">Special Features</h3>
                <div class="hr-feature-grid" role="list">
                    <a href="/arena/index.html" class="hr-feature-card feat-arena" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/ctf.webp" alt="CTF challenges" onerror="this.onerror=null;this.src='/assets/images/icons/icon-scales.webp'"></div>
                        <div class="hr-feature-name" style="color:#f87171;">The Arena</div>
                        <div class="hr-feature-desc">CTF challenges, capture-the-flag competitions, and ranked offensive security drills</div>
                    </a>
                    <a href="/hive/index.html" class="hr-feature-card feat-hive" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/games.webp" alt="Arcade games" onerror="this.onerror=null;this.src='/assets/images/icons/icon-siren.webp'"></div>
                        <div class="hr-feature-name" style="color:#fbbf24;">The Hive</div>
                        <div class="hr-feature-desc">Arcade games, combat simulations, and gamified security training</div>
                    </a>
                    <a href="/arctic/index.html" class="hr-feature-card feat-arctic" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/linux.webp" alt="Linux terminal" onerror="this.onerror=null;this.src='/assets/images/icons/icon-penguin.webp'"></div>
                        <div class="hr-feature-name" style="color:#38bdf8;">The Arctic</div>
                        <div class="hr-feature-desc">Linux terminal training, command-line mastery, and server administration</div>
                    </a>
                    <a href="https://colosseum-arena.web.app" target="_blank" rel="noopener" class="hr-feature-card feat-colosseum" role="listitem" aria-label="The Colosseum - opens in new tab">
                        <div class="hr-feature-icon"><img src="/assets/images/emblems/dark-arts.webp" alt="The Colosseum" onerror="this.onerror=null;this.src='/assets/images/icons/icon-institution.webp'"></div>
                        <div class="hr-feature-name" style="color:#9333ea;">The Colosseum <span style="font-size:0.6rem;color:#808080;font-weight:400;" aria-hidden="true">↗</span></div>
                        <div class="hr-feature-desc">Incident response card game — live multiplayer cybersecurity battle simulator</div>
                    </a>
                    <a href="/dispatch/index.html" class="hr-feature-card feat-dispatch" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-wrench.webp" alt="Dispatch" onerror="this.onerror=null;this.src='/assets/images/icons/icon-tools.webp'"></div>
                        <div class="hr-feature-name" style="color:#fb923c;">Dispatch</div>
                        <div class="hr-feature-desc">IT troubleshooting simulations — network, hardware, OS, AD, and printer scenarios</div>
                    </a>
                    <a href="/operator/index.html" class="hr-feature-card feat-operator" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/command-line.webp" alt="Operator" onerror="this.onerror=null;this.src='/assets/images/icons/icon-terminal.webp'"></div>
                        <div class="hr-feature-name" style="color:#4ade80;">Operator</div>
                        <div class="hr-feature-desc">Grid-based terminal missions — recon, forensics, incident response, and privilege escalation</div>
                    </a>
                    <a href="/signal/index.html" class="hr-feature-card feat-signal" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-antenna.webp" alt="Signal" onerror="this.onerror=null;this.src='/assets/images/icons/icon-signal.webp'"></div>
                        <div class="hr-feature-name" style="color:#ff6b35;">The Signal</div>
                        <div class="hr-feature-desc">Hardware projects — badge hacking, firmware ops, IoT security, and RF exploration</div>
                    </a>
                    <a href="/houses/code/devops/index.html" class="hr-feature-card feat-forge" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/devops-automation.webp" alt="DevOps Forge" onerror="this.onerror=null;this.src='/assets/images/icons/icon-refresh.webp'"></div>
                        <div class="hr-feature-name" style="color:#60a5fa;">The Forge</div>
                        <div class="hr-feature-desc">DevOps hub — CI/CD pipelines, GitHub Actions, containers, and infrastructure as code</div>
                    </a>
                    <a href="/dark-arts/vault/bug-hunting/index.html" class="hr-feature-card feat-bughunt" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-spider.webp" alt="Bug Hunting" onerror="this.onerror=null;this.src='/assets/images/icons/icon-target.webp'"></div>
                        <div class="hr-feature-name" style="color:#c084fc;">Bug Hunting Hub</div>
                        <div class="hr-feature-desc">Security research — AI exploit lab, bug bounty simulation, vulnerability hunting</div>
                    </a>
                    <a href="/projects/index.html" class="hr-feature-card feat-projects" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-construction.webp" alt="Projects" onerror="this.onerror=null;this.src='/assets/images/icons/icon-tools.webp'"></div>
                        <div class="hr-feature-name" style="color:#fbbf24;">Projects</div>
                        <div class="hr-feature-desc">Build and ship real-world portfolio projects across cybersecurity domains</div>
                    </a>
                    <a href="/houses/code/armory/index.html" class="hr-feature-card feat-armory" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-swords.webp" alt="Code Armory" onerror="this.onerror=null;this.src='/assets/images/icons/icon-code.webp'"></div>
                        <div class="hr-feature-name" style="color:#f59e0b;">Code Armory</div>
                        <div class="hr-feature-desc">Programming languages hub — Python, JavaScript, C, Go, Rust, Bash, SQL, and more</div>
                    </a>
                    <a href="/houses/web/backbone/index.html" class="hr-feature-card feat-backbone" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-network.webp" alt="Backbone" onerror="this.onerror=null;this.src='/assets/images/icons/icon-globe.webp'"></div>
                        <div class="hr-feature-name" style="color:#3b82f6;">The Backbone</div>
                        <div class="hr-feature-desc">Advanced networking — BGP, MPLS, data center, SDN, wireless, and WAN technologies</div>
                    </a>
                    <a href="/houses/code/algorithms/index.html" class="hr-feature-card feat-algo" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-dna.webp" alt="Algorithms" onerror="this.onerror=null;this.src='/assets/images/icons/icon-lightning.webp'"></div>
                        <div class="hr-feature-name" style="color:#10b981;">Algorithm Chamber</div>
                        <div class="hr-feature-desc">Data structures, discrete math, algorithm design, and computational problem solving</div>
                    </a>
                    <a href="/houses/code/cortex/index.html" class="hr-feature-card feat-cortex" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-brain.webp" alt="Cortex" onerror="this.onerror=null;this.src='/assets/images/icons/icon-robot.webp'"></div>
                        <div class="hr-feature-name" style="color:#a855f7;">The Cortex</div>
                        <div class="hr-feature-desc">AI and machine learning with a cybersecurity lens — foundations through deep learning</div>
                    </a>
                    <a href="/career/index.html" class="hr-feature-card feat-career" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-rocket.webp" alt="Career" onerror="this.onerror=null;this.src='/assets/images/icons/icon-graduation.webp'"></div>
                        <div class="hr-feature-name" style="color:#ec4899;">Career Launchpad</div>
                        <div class="hr-feature-desc">Job boards, resume builder, interview prep, career path explorer, and salary research</div>
                    </a>
                    <a href="/funding/index.html" class="hr-feature-card feat-funding" role="listitem">
                        <div class="hr-feature-icon"><img src="/assets/images/icons/icon-money.webp" alt="Funding" onerror="this.onerror=null;this.src='/assets/images/icons/icon-gear.webp'"></div>
                        <div class="hr-feature-name" style="color:#22c55e;">Funding Hub</div>
                        <div class="hr-feature-desc">Grants, scholarships, funding calendar, and application tracker for students and educators</div>
                    </a>
                </div>
            </div>
            <div class="hr-explore-info">Search across all houses and content types</div>
            <div id="discoveryAnchor"></div>
        `;
    }

    // ========================================
    // PROFILE PANEL (lazy)
    // ========================================

    /** Render the Profile tab with XP, level, progress stats (lazy-loaded) */
    function renderProfilePanel() {
        const panel = document.getElementById('hr-panel-profile');

        try {
            if (typeof ProgressManager === 'undefined') {
                panel.innerHTML = renderEmptyProfile();
                return;
            }

            const profile = ProgressManager.getProfile();
            if (!profile || profile.xp === 0) {
                panel.innerHTML = renderEmptyProfile();
                return;
            }

            const levelPct = profile.levelProgress || 0;

            panel.innerHTML = `
                <div class="hr-xp-bar-container">
                    <div class="hr-xp-bar-header">
                        <span class="hr-xp-bar-level">Level ${profile.level}</span>
                        <span class="hr-xp-bar-xp">${profile.xp} XP${profile.xpToNextLevel > 0 ? ` (${profile.xpToNextLevel} to next)` : ''}</span>
                    </div>
                    <div class="hr-xp-bar-track">
                        <div class="hr-xp-bar-fill" style="width: ${levelPct}%"></div>
                    </div>
                </div>
                <div class="hr-profile-grid">
                    <div class="hr-profile-card">
                        <div class="hr-profile-card-value">${profile.totalModulesCompleted}</div>
                        <div class="hr-profile-card-label">Modules Completed</div>
                    </div>
                    <div class="hr-profile-card">
                        <div class="hr-profile-card-value">${profile.totalQuizzesPassed}</div>
                        <div class="hr-profile-card-label">Quizzes Passed</div>
                    </div>
                    <div class="hr-profile-card">
                        <div class="hr-profile-card-value">${profile.totalLabsCompleted}</div>
                        <div class="hr-profile-card-label">Labs Completed</div>
                    </div>
                    <div class="hr-profile-card">
                        <div class="hr-profile-card-value">${profile.achievementCount}</div>
                        <div class="hr-profile-card-label">Achievements</div>
                    </div>
                </div>
            `;
        } catch (e) {
            panel.innerHTML = renderEmptyProfile();
        }
    }

    function renderEmptyProfile() {
        return `
            <div class="hr-profile-empty">
                <div class="hr-profile-empty-icon"><img src="/assets/images/icons/icon-users.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
                <div class="hr-profile-empty-text">Start learning to track your progress</div>
                <div class="hr-profile-empty-hint">Complete modules, quizzes, and labs to see your stats here</div>
            </div>
        `;
    }

    // ========================================
    // INSTRUCTOR PANEL (lazy)
    // ========================================

    /** Render the Instructor tab (lazy-loads InstructorDashboard.js) */
    function renderInstructorPanel() {
        const panel = document.getElementById('hr-panel-instructor');
        panel.innerHTML = `
            <div class="hr-instructor-loading">
                <div class="hr-spinner"></div>
                <div>Loading Instructor Dashboard...</div>
            </div>
        `;

        // Dynamically load InstructorDashboard.js
        const script = document.createElement('script');
        script.src = '../../components/InstructorDashboard.js';
        script.onload = function() {
            panel.innerHTML = '';
            if (typeof InstructorDashboard !== 'undefined') {
                InstructorDashboard.init(panel);
            } else {
                panel.innerHTML = '<div class="hr-profile-empty"><div class="hr-profile-empty-icon"><img src="/assets/images/icons/icon-clipboard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div><div class="hr-profile-empty-text">Instructor Dashboard unavailable</div></div>';
            }
        };
        script.onerror = function() {
            panel.innerHTML = '<div class="hr-profile-empty"><div class="hr-profile-empty-icon"><img src="/assets/images/icons/icon-clipboard.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div><div class="hr-profile-empty-text">Instructor Dashboard unavailable</div></div>';
        };
        document.body.appendChild(script);
    }

    // ========================================
    // STATS
    // ========================================

    /** Update the header progress bar and stats counters from ModuleProgress */
    function updateStats() {
        const modules = config.modules || [];
        const total = modules.length;
        const hours = Math.round(total * 0.75);

        const totalEl = document.getElementById('hrTotalModules');
        const compEl = document.getElementById('hrCompleted');
        const hoursEl = document.getElementById('hrHours');

        if (totalEl) totalEl.textContent = total;
        if (compEl) compEl.textContent = 0;
        if (hoursEl) hoursEl.textContent = hours;
    }

    // ========================================
    // PUBLIC API
    // ========================================

    return { init };
})();
