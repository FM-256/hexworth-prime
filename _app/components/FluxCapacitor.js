/**
 * Flux Capacitor - House Navigation System
 * Hexworth Prime v2.6.0
 *
 * A floating teleportation button that allows users to navigate
 * between houses from any page.
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const HOUSES = [
        { id: 'web', name: 'Web', icon: '🌐', color: '#60a5fa', path: 'houses/web/index.html' },
        { id: 'shield', name: 'Shield', icon: '🛡️', color: '#f87171', path: 'houses/shield/index.html' },
        { id: 'cloud', name: 'Cloud', icon: '☁️', color: '#38bdf8', path: 'houses/cloud/index.html' },
        { id: 'forge', name: 'Forge', icon: '⚒️', color: '#fbbf24', path: 'houses/forge/index.html' },
        { id: 'script', name: 'Script', icon: '📜', color: '#a78bfa', path: 'houses/script/index.html' },
        { id: 'code', name: 'Code', icon: '💻', color: '#4ade80', path: 'houses/code/index.html' },
        { id: 'key', name: 'Key', icon: '🔑', color: '#f472b6', path: 'houses/key/index.html' },
        { id: 'eye', name: 'Eye', icon: '👁️', color: '#c084fc', path: 'houses/eye/index.html' },
        { id: 'dark-arts', name: 'Dark Arts', icon: '💀', color: '#6b21a8', path: 'dark-arts/vault/index.html', gatePath: 'dark-arts/gate-1.html', gated: true }
    ];

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    const STYLES = `
        /* Flux Capacitor - Slime Green Radioactive Theme */
        :root {
            --flux-green: #39ff14;
            --flux-green-dim: #2ecc0f;
            --flux-glow: rgba(57, 255, 20, 0.6);
            --flux-glow-strong: rgba(57, 255, 20, 0.9);
            --flux-dark: #0a1a0a;
        }

        /* Floating Button */
        .flux-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, #1a2a1a 0%, #0a1a0a 100%);
            border: 2px solid var(--flux-green);
            cursor: pointer;
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
                0 0 20px var(--flux-glow),
                0 0 40px rgba(57, 255, 20, 0.3),
                inset 0 0 15px rgba(57, 255, 20, 0.1);
            animation: fluxPulse 2s ease-in-out infinite;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .flux-btn:hover {
            transform: scale(1.1) rotate(15deg);
            box-shadow:
                0 0 30px var(--flux-glow-strong),
                0 0 60px var(--flux-glow),
                inset 0 0 20px rgba(57, 255, 20, 0.2);
        }

        .flux-btn:active {
            transform: scale(0.95);
        }

        /* Biohazard Symbol */
        .flux-icon {
            font-size: 1.8rem;
            filter: drop-shadow(0 0 8px var(--flux-green));
            animation: fluxSpin 8s linear infinite;
        }

        @keyframes fluxPulse {
            0%, 100% {
                box-shadow:
                    0 0 20px var(--flux-glow),
                    0 0 40px rgba(57, 255, 20, 0.3),
                    inset 0 0 15px rgba(57, 255, 20, 0.1);
                transform: scale(1);
            }
            50% {
                box-shadow:
                    0 0 30px var(--flux-glow-strong),
                    0 0 60px var(--flux-glow),
                    inset 0 0 25px rgba(57, 255, 20, 0.2);
                transform: scale(1.05);
            }
        }

        @keyframes fluxSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Modal Overlay */
        .flux-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.92);
            backdrop-filter: blur(12px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .flux-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        /* Modal Content */
        .flux-modal {
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .flux-overlay.active .flux-modal {
            transform: scale(1);
        }

        .flux-title {
            font-size: 1.5rem;
            color: var(--flux-green);
            margin-bottom: 8px;
            text-shadow: 0 0 20px var(--flux-glow);
            font-family: 'Segoe UI', system-ui, sans-serif;
            letter-spacing: 2px;
        }

        .flux-subtitle {
            color: #666;
            font-size: 0.85rem;
            margin-bottom: 30px;
        }

        /* House Grid */
        .flux-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            max-width: 450px;
            margin: 0 auto;
        }

        .flux-house {
            background: rgba(20, 20, 30, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .flux-house::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at center, var(--house-color) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .flux-house:hover {
            transform: translateY(-5px);
            border-color: var(--house-color);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px var(--house-glow);
        }

        .flux-house:hover::before {
            opacity: 0.15;
        }

        .flux-house.current {
            border-color: var(--flux-green);
            box-shadow: 0 0 20px var(--flux-glow);
        }

        .flux-house.current::after {
            content: '📍';
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 0.9rem;
        }

        .flux-house.home::after {
            content: '⭐';
            position: absolute;
            top: 8px;
            left: 8px;
            font-size: 0.8rem;
        }

        .flux-house.locked {
            opacity: 0.7;
            cursor: pointer;
        }

        .flux-house.locked:hover {
            border-color: #a855f7;
            box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }

        .flux-house.locked::after {
            content: '⚔️';
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 0.9rem;
            animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .flux-house-icon {
            font-size: 2rem;
            margin-bottom: 8px;
            display: block;
        }

        .flux-house-name {
            color: #e0e0e0;
            font-size: 0.9rem;
            font-weight: 500;
        }

        /* Dashboard Link */
        .flux-dashboard {
            margin-top: 25px;
        }

        .flux-dashboard-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #888;
            padding: 10px 30px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s ease;
        }

        .flux-dashboard-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border-color: rgba(255, 255, 255, 0.4);
        }

        /* Close hint */
        .flux-hint {
            margin-top: 25px;
            color: #444;
            font-size: 0.75rem;
        }

        .flux-hint kbd {
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 8px;
            border-radius: 4px;
            margin: 0 3px;
        }

        /* Warp Animation */
        .flux-warp {
            position: fixed;
            inset: 0;
            background: var(--flux-green);
            z-index: 99999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.15s ease;
        }

        .flux-warp.active {
            opacity: 1;
        }

        /* Responsive */
        @media (max-width: 500px) {
            .flux-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }

            .flux-house {
                padding: 15px 10px;
            }

            .flux-house-icon {
                font-size: 1.5rem;
            }

            .flux-btn {
                bottom: 16px;
                right: 16px;
                width: 50px;
                height: 50px;
            }
        }
    `;

    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function detectCurrentHouse() {
        const path = window.location.pathname;

        // Check for Dark Arts
        if (path.includes('dark-arts')) {
            return 'dark-arts';
        }

        // Check for regular houses
        const houseMatch = path.match(/houses\/(\w+)/);
        return houseMatch ? houseMatch[1] : null;
    }

    function calculateBasePath() {
        const path = window.location.pathname;

        // Find how deep we are from _app
        // Pattern: /_app/houses/[house]/[subfolders]/file.html
        // or: /_app/dark-arts/[subfolders]/file.html

        let depth = 0;

        if (path.includes('/houses/')) {
            // Count folders after houses/[house]/
            const afterHouse = path.split(/\/houses\/\w+\//)[1] || '';
            depth = (afterHouse.match(/\//g) || []).length;
            return '../'.repeat(depth + 2); // +2 for houses/[house]
        } else if (path.includes('/dark-arts/')) {
            const afterDarkArts = path.split('/dark-arts/')[1] || '';
            depth = (afterDarkArts.match(/\//g) || []).length;
            return '../'.repeat(depth + 1); // +1 for dark-arts
        }

        // Fallback - assume we're at house index level
        return '../../';
    }

    function getUserHouse() {
        return localStorage.getItem('hexworth_house');
    }

    function isDarkArtsUnlocked() {
        return localStorage.getItem('dark_arts_unlocked') === 'true';
    }

    function isHouseHopper() {
        return localStorage.getItem('hexworth_house_hopper') === 'true';
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT
    // ═══════════════════════════════════════════════════════════════

    class FluxCapacitor {
        constructor() {
            this.isOpen = false;
            this.currentHouse = detectCurrentHouse();
            this.userHouse = getUserHouse();
            this.basePath = calculateBasePath();

            this.init();
        }

        init() {
            this.injectStyles();
            this.createButton();
            this.createModal();
            this.createWarpEffect();
            this.bindEvents();
        }

        injectStyles() {
            const style = document.createElement('style');
            style.id = 'flux-capacitor-styles';
            style.textContent = STYLES;
            document.head.appendChild(style);
        }

        createButton() {
            this.button = document.createElement('button');
            this.button.className = 'flux-btn';
            this.button.setAttribute('aria-label', 'Open Flux Capacitor');
            this.button.setAttribute('title', 'Flux Capacitor (Press ~)');
            this.button.innerHTML = '<span class="flux-icon">☢️</span>';
            document.body.appendChild(this.button);
        }

        createModal() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'flux-overlay';

            const modal = document.createElement('div');
            modal.className = 'flux-modal';

            // Title
            const title = document.createElement('h2');
            title.className = 'flux-title';
            title.textContent = '⚡ FLUX CAPACITOR ⚡';
            modal.appendChild(title);

            // Subtitle
            const subtitle = document.createElement('p');
            subtitle.className = 'flux-subtitle';
            subtitle.textContent = 'Select destination';
            modal.appendChild(subtitle);

            // House Grid
            const grid = document.createElement('div');
            grid.className = 'flux-grid';

            HOUSES.forEach((house, index) => {
                const card = this.createHouseCard(house, index);
                grid.appendChild(card);
            });

            modal.appendChild(grid);

            // Dashboard Link
            const dashSection = document.createElement('div');
            dashSection.className = 'flux-dashboard';
            const dashBtn = document.createElement('button');
            dashBtn.className = 'flux-dashboard-btn';
            dashBtn.textContent = '🏠 Return to Dashboard';
            dashBtn.addEventListener('click', () => this.navigateTo('dashboard.html'));
            dashSection.appendChild(dashBtn);
            modal.appendChild(dashSection);

            // Hint
            const hint = document.createElement('p');
            hint.className = 'flux-hint';
            hint.innerHTML = 'Press <kbd>~</kbd> or <kbd>Esc</kbd> to close • <kbd>1-9</kbd> quick nav';
            modal.appendChild(hint);

            this.overlay.appendChild(modal);
            document.body.appendChild(this.overlay);
        }

        createHouseCard(house, index) {
            const card = document.createElement('div');
            card.className = 'flux-house';
            card.style.setProperty('--house-color', house.color);
            card.style.setProperty('--house-glow', house.color + '40');
            card.dataset.house = house.id;
            card.dataset.index = index + 1;

            // Check states
            const isCurrent = this.currentHouse === house.id;
            const isHome = this.userHouse === house.id;
            const isLocked = house.gated && !isDarkArtsUnlocked();

            if (isCurrent) card.classList.add('current');
            if (isHome && !isCurrent) card.classList.add('home');
            if (isLocked) card.classList.add('locked');

            // Icon
            const icon = document.createElement('span');
            icon.className = 'flux-house-icon';
            icon.textContent = house.icon;
            card.appendChild(icon);

            // Name
            const name = document.createElement('span');
            name.className = 'flux-house-name';
            name.textContent = house.name;
            card.appendChild(name);

            // Click handler
            if (!isCurrent) {
                card.addEventListener('click', () => {
                    if (isLocked && house.gatePath) {
                        // Navigate to gates for gated houses
                        this.navigateTo(house.gatePath);
                    } else if (!isLocked) {
                        // Navigate to house/vault
                        this.navigateTo(house.path);
                    }
                });
            }

            return card;
        }

        createWarpEffect() {
            this.warp = document.createElement('div');
            this.warp.className = 'flux-warp';
            document.body.appendChild(this.warp);
        }

        navigateTo(path) {
            // Trigger warp animation
            this.warp.classList.add('active');

            // Navigate after animation
            setTimeout(() => {
                window.location.href = this.basePath + path;
            }, 150);
        }

        toggle() {
            this.isOpen = !this.isOpen;
            this.overlay.classList.toggle('active', this.isOpen);

            if (this.isOpen) {
                // Focus first house for keyboard nav
                this.overlay.querySelector('.flux-house')?.focus();
            }
        }

        close() {
            if (this.isOpen) {
                this.isOpen = false;
                this.overlay.classList.remove('active');
            }
        }

        bindEvents() {
            // Button click
            this.button.addEventListener('click', () => this.toggle());

            // Overlay click (close on background)
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });

            // Keyboard
            document.addEventListener('keydown', (e) => {
                // Toggle with ~ or `
                if (e.key === '`' || e.key === '~') {
                    e.preventDefault();
                    this.toggle();
                    return;
                }

                // Only handle these when open
                if (!this.isOpen) return;

                // Close with Escape
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.close();
                    return;
                }

                // Quick nav with number keys
                const num = parseInt(e.key);
                if (num >= 1 && num <= 9) {
                    const house = HOUSES[num - 1];
                    if (house) {
                        const isLocked = house.gated && !isDarkArtsUnlocked();
                        const isCurrent = this.currentHouse === house.id;
                        if (!isLocked && !isCurrent) {
                            this.navigateTo(house.path);
                        }
                    }
                }

                // Dashboard with 0 or H
                if (e.key === '0' || e.key.toLowerCase() === 'h') {
                    this.navigateTo('dashboard.html');
                }
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE
    // ═══════════════════════════════════════════════════════════════

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new FluxCapacitor());
    } else {
        new FluxCapacitor();
    }

})();
