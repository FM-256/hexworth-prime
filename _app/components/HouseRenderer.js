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
 *       icon: '☁️',
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
        'vault': 'vault',
    };

    // ========================================
    // INIT
    // ========================================

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

        console.log(`%c${config.icon} ${config.fullTitle}`, `color: var(--house-primary, #60a5fa); font-size: 14px;`);
    }

    // ========================================
    // CSS INJECTION
    // ========================================

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
                position: fixed;
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
                text-align: center;
                padding: 60px 20px;
                margin-bottom: 50px;
                position: relative;
            }

            .hero-mascot {
                margin-bottom: 20px;
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

            .hero-mascot img:hover {
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
            }

            .hero-mascot-species {
                font-size: 0.7rem;
                color: #666;
                letter-spacing: 0.2em;
                text-transform: uppercase;
            }

            .hero-mascot-quote {
                font-size: 0.85rem;
                color: #555;
                font-style: italic;
                max-width: 500px;
                margin: 15px auto 0;
                line-height: 1.6;
            }

            .hero-icon {
                font-size: 5rem;
                margin-bottom: 25px;
                filter: drop-shadow(0 0 30px var(--house-glow));
            }

            .hero-icon img {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                border: 2px solid var(--house-primary);
                box-shadow: 0 0 20px var(--house-glow);
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
                margin: 0 auto;
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
                color: #555;
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

            .hr-top-search-input::placeholder { color: #555; }

            .hr-top-search-count {
                font-size: 0.75rem;
                color: #555;
                white-space: nowrap;
                position: absolute;
                right: 14px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
            }

            .hr-top-search-kbd {
                font-size: 0.6rem;
                color: #444;
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
                color: #666;
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
                color: #666;
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
                color: #666;
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

            .hr-filter-input::placeholder { color: #555; }

            .hr-filter-count {
                font-size: 0.75rem;
                color: #555;
                white-space: nowrap;
            }

            .module-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
            }

            .module-card {
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
                color: #666;
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
                color: #666;
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
                color: #555;
                font-size: 0.9rem;
            }

            /* Explore panel */
            .hr-explore-info {
                text-align: center;
                padding: 20px;
                color: #555;
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
            .hr-feature-desc { font-size: 0.72rem; color: #666; font-family: 'Segoe UI', sans-serif; line-height: 1.5; }

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
                color: #666;
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
                color: #666;
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
                color: #555;
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
                color: #444;
            }

            /* Instructor panel */
            .hr-instructor-loading {
                text-align: center;
                padding: 60px 20px;
                color: #555;
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

            /* Responsive */
            @media (max-width: 768px) {
                .house-header {
                    padding: 15px 20px;
                    flex-direction: column;
                    gap: 15px;
                }
                .house-content { padding: 20px; }
                .hero-mascot img { width: 150px; height: 200px; }
                .hero-title { font-size: 1.8rem; }
                .stats-bar { flex-wrap: wrap; gap: 20px; }
                .stat-item { flex: 1 1 45%; }
                .hr-tab-bar { gap: 2px; padding: 4px; }
                .hr-tab { padding: 10px 8px; font-size: 0.7rem; gap: 4px; }
                .hr-tab-label { display: none; }
                .hr-tab-icon { font-size: 1.2rem; }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // PAGE RENDER
    // ========================================

    function renderPage() {
        // Header
        const header = document.createElement('header');
        header.className = 'house-header';
        header.innerHTML = `
            <div class="header-left">
                <a href="../../dashboard.html" class="back-btn">
                    <span>&larr;</span>
                    <span>Dashboard</span>
                </a>
                <div class="house-badge">
                    <span class="house-icon">${config.emblem ? `<img src="${config.emblem}" alt="${config.fullTitle}" onerror="this.outerHTML='${config.icon}'">` : config.icon}</span>
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
            <section class="hero-section">
                ${config.mascot ? `<div class="hero-mascot mascot-fx mascot-fx-${mascotId} holo-card holo-subtle">
                    <img src="${config.mascot}" alt="${config.fullTitle} mascot" onerror="this.parentElement.style.display='none'">
                    ${lore ? `<div class="hero-mascot-name">${lore.name}</div><div class="hero-mascot-species">${lore.species}</div>` : ''}
                </div>` : ''}
                <div class="hero-icon">${config.emblem ? `<img src="${config.emblem}" alt="${config.fullTitle} emblem" onerror="this.outerHTML='${config.icon}'">` : config.icon}</div>
                <h1 class="hero-title">House of the <span>${config.title}</span></h1>
                <p class="hero-domain">${config.domain}</p>
                <p class="hero-description">${config.description}</p>
                ${lore ? `<p class="hero-mascot-quote">"${lore.quote}"</p>` : ''}
            </section>

            <div class="stats-bar">
                <div class="stat-item">
                    <div class="stat-value" id="hrTotalModules">0</div>
                    <div class="stat-label">Total Modules</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="hrCompleted">0</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="hrHours">0</div>
                    <div class="stat-label">Hours of Content</div>
                </div>
                <div class="stat-item">
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
            <span class="hr-top-search-icon">&#128269;</span>
            <input type="text" class="hr-top-search-input" id="hrTopSearchInput"
                   placeholder="${searchPlaceholder}"
                   autocomplete="off">
            <span class="hr-top-search-count" id="hrTopSearchCount"></span>
        `;
        main.appendChild(topSearch);

        // Tab bar
        const tabs = [
            { id: 'paths',      icon: '🎯', label: 'Learning Paths' },
            { id: 'content',    icon: '⚡', label: 'House Content' },
            { id: 'explore',    icon: '🗺️', label: 'Explore All' },
            { id: 'profile',    icon: '👤', label: 'Profile' },
            { id: 'instructor', icon: '📋', label: 'Instructor' }
        ];

        const tabBar = document.createElement('div');
        tabBar.className = 'hr-tab-bar';
        tabBar.innerHTML = tabs.map(t =>
            `<button class="hr-tab" data-tab="${t.id}">
                <span class="hr-tab-icon">${t.icon}</span>
                <span class="hr-tab-label">${t.label}</span>
            </button>`
        ).join('');
        main.appendChild(tabBar);

        // Tab panels
        tabs.forEach(t => {
            const panel = document.createElement('div');
            panel.className = 'hr-panel';
            panel.id = 'hr-panel-' + t.id;
            panel.dataset.tab = t.id;
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

    function initTabs() {
        const stored = localStorage.getItem('hexworth_house_tab_' + config.houseId);
        activeTab = stored || 'paths';

        document.querySelectorAll('.hr-tab').forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });

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

    function switchTab(tabId) {
        activeTab = tabId;
        localStorage.setItem('hexworth_house_tab_' + config.houseId, tabId);

        // Update tab buttons
        document.querySelectorAll('.hr-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update panels
        document.querySelectorAll('.hr-panel').forEach(panel => {
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

    function renderPathsPanel() {
        const panel = document.getElementById('hr-panel-paths');
        if (!config.paths || config.paths.length === 0) {
            panel.innerHTML = '<div class="hr-profile-empty"><div class="hr-profile-empty-icon">🎯</div><div class="hr-profile-empty-text">No certification paths configured yet.</div></div>';
            return;
        }

        const pathCards = config.paths.map(p => {
            const catId = PATH_CATEGORY_MAP[p.id];
            const iconHTML = catId
                ? `<img src="/assets/images/categories/${catId}.webp" alt="${p.name}" onerror="this.outerHTML='${p.icon}'">`
                : p.icon;
            return `
            <div class="path-card" data-path-id="${p.id}" data-path-href="${p.href || ''}">
                <div class="path-icon">${iconHTML}</div>
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
            <section class="paths-section">
                <h2 class="paths-title">Certification Paths</h2>
                <div class="paths-grid">${pathCards}</div>
            </section>
        `;

        // Bind clicks
        panel.querySelectorAll('.path-card').forEach(card => {
            card.addEventListener('click', () => {
                const href = card.dataset.pathHref;
                const pathId = card.dataset.pathId;
                if (href) {
                    window.location.href = href;
                } else {
                    window.location.href = `../../path-view.html?house=${config.houseId}&path=${pathId}`;
                }
            });
        });
    }

    // ========================================
    // CONTENT PANEL
    // ========================================

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
                const fallback = (p.icon && !p.icon.includes('<')) ? p.icon : '📚';
                const iconHTML = iconSrc
                    ? `<img src="${iconSrc}" alt="${p.name}" onerror="this.outerHTML='${fallback}'">`
                    : fallback;
                const href = p.href || `../../path-view.html?house=${config.houseId}&path=${p.id}`;
                return `
                    <div class="hr-hub-card" data-href="${href}">
                        <div class="hr-hub-icon">${iconHTML}</div>
                        <div class="hr-hub-name">${p.name}</div>
                        <div class="hr-hub-cert">${p.cert}</div>
                    </div>`;
            }).join('');

            hubHTML = `
                <div class="hr-hub-section">
                    <h3 class="hr-hub-title">Course Hubs</h3>
                    <div class="hr-hub-grid">${hubCards}</div>
                </div>`;
        }

        panel.innerHTML = `
            ${hubHTML}
            <div class="hr-filter-bar">
                <input type="text" class="hr-filter-input" id="hrFilterInput"
                       placeholder="Filter modules by title, description, or type..."
                       autocomplete="off">
                <span class="hr-filter-count" id="hrFilterCount">${modules.length} modules</span>
            </div>
            <div class="module-grid" id="hrModuleGrid"></div>
            <div class="hr-no-results" id="hrNoResults" style="display:none;">No modules match your filter.</div>
        `;

        // Bind hub card clicks
        panel.querySelectorAll('.hr-hub-card').forEach(card => {
            card.addEventListener('click', () => {
                window.location.href = card.dataset.href;
            });
        });

        const grid = document.getElementById('hrModuleGrid');
        modules.forEach((mod, idx) => {
            const card = document.createElement('div');
            card.className = 'module-card';
            card.dataset.idx = idx;
            card.dataset.href = mod.href || '';

            const typeBadge = getTypeBadge(mod);
            const catIcon = mod.category
                ? `<img src="/assets/images/categories/${mod.category}.webp" alt="${mod.title || mod.category}" onerror="this.outerHTML='${mod.icon}'">`
                : mod.icon;
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
            grid.appendChild(card);
        });

        // Filter input
        document.getElementById('hrFilterInput').addEventListener('input', filterModules);
    }

    function filterModules() {
        const query = document.getElementById('hrFilterInput').value.toLowerCase().trim();
        const modules = config.modules || [];
        const cards = document.querySelectorAll('#hrModuleGrid .module-card');
        let visible = 0;

        cards.forEach((card, idx) => {
            const mod = modules[idx];
            if (!mod) return;

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

        if (query) {
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
            topCount.textContent = query ? (visible + ' of ' + modules.length) : '';
        }
    }

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
            presentation: '📊 Slides',
            applet: '🎮 Interactive',
            lab: '🧪 Lab',
            quiz: '📝 Quiz',
            game: '🕹️ Game',
            review: '🔄 Review',
            reference: '📖 Reference',
            tool: '🔧 Tool'
        };
        return labels[component] || component;
    }

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

    function renderExplorePanel() {
        const panel = document.getElementById('hr-panel-explore');
        panel.innerHTML = `
            <div class="hr-features-section">
                <h3 class="hr-features-title">Special Features</h3>
                <div class="hr-feature-grid">
                    <a href="/arena/index.html" class="hr-feature-card feat-arena">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/ctf.webp" alt="CTF challenges" onerror="this.outerHTML='&#9878;'"></div>
                        <div class="hr-feature-name" style="color:#f87171;">The Arena</div>
                        <div class="hr-feature-desc">CTF challenges, capture-the-flag competitions, and ranked offensive security drills</div>
                    </a>
                    <a href="/hive/index.html" class="hr-feature-card feat-hive">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/games.webp" alt="Arcade games" onerror="this.outerHTML='&#9888;'"></div>
                        <div class="hr-feature-name" style="color:#fbbf24;">The Hive</div>
                        <div class="hr-feature-desc">Arcade games, combat simulations, and gamified security training</div>
                    </a>
                    <a href="/arctic/index.html" class="hr-feature-card feat-arctic">
                        <div class="hr-feature-icon"><img src="/assets/images/categories/linux.webp" alt="Linux terminal" onerror="this.outerHTML='🐧'"></div>
                        <div class="hr-feature-name" style="color:#38bdf8;">The Arctic</div>
                        <div class="hr-feature-desc">Linux terminal training, command-line mastery, and server administration</div>
                    </a>
                    <a href="https://colosseum-arena.web.app" target="_blank" rel="noopener" class="hr-feature-card feat-colosseum">
                        <div class="hr-feature-icon"><img src="/assets/images/emblems/dark-arts.webp" alt="The Colosseum" onerror="this.outerHTML='🏛️'"></div>
                        <div class="hr-feature-name" style="color:#9333ea;">The Colosseum <span style="font-size:0.6rem;color:#555;font-weight:400;">↗</span></div>
                        <div class="hr-feature-desc">Incident response card game — live multiplayer cybersecurity battle simulator</div>
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
                <div class="hr-profile-empty-icon">👤</div>
                <div class="hr-profile-empty-text">Start learning to track your progress</div>
                <div class="hr-profile-empty-hint">Complete modules, quizzes, and labs to see your stats here</div>
            </div>
        `;
    }

    // ========================================
    // INSTRUCTOR PANEL (lazy)
    // ========================================

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
                panel.innerHTML = '<div class="hr-profile-empty"><div class="hr-profile-empty-icon">📋</div><div class="hr-profile-empty-text">Instructor Dashboard unavailable</div></div>';
            }
        };
        script.onerror = function() {
            panel.innerHTML = '<div class="hr-profile-empty"><div class="hr-profile-empty-icon">📋</div><div class="hr-profile-empty-text">Instructor Dashboard unavailable</div></div>';
        };
        document.body.appendChild(script);
    }

    // ========================================
    // STATS
    // ========================================

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
