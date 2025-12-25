/**
 * Trail Hunter - Patronus Guide System
 * Hexworth Prime v2.7.0
 *
 * When a hunt is active, an ethereal Patronus creature appears
 * and hops around the screen, guiding users to trail modules.
 *
 * Inspired by the Patronus charm - a protective guide through darkness.
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // TRAIL CONFIGURATION
    // ═══════════════════════════════════════════════════════════════

    const TRAILS = {
        rabbit: {
            icon: '🐇',
            name: 'White Rabbit',
            gate: 1,
            color: 'rgba(220, 230, 255, 0.8)',
            glowColor: 'rgba(180, 200, 255, 0.6)',
            modules: [
                'applets/ip-addressing/binary-decimal-converter.html',
                'tools/subnet-calculator.html',
                'tools/dns-header-reference.html',
                'presentations/osi-model.html',
                'applets/crypto/hashing_steganography/encryption_task.html',
                'presentations/encryption-basics.html',
                'tools/packet-analyzer.html',
                'tools/wireshark-training.html',
                'reference/cpu-architecture.html',
                'applets/linux/linux-permissions-calculator.html'
            ],
            // Keywords to match module cards by title/content
            keywords: [
                'binary/decimal', 'binary decimal', 'binary converter',
                'subnet calculator', 'subnetting calculator',
                'dns header',
                'osi model',
                'encryption task', 'hashing steganography',
                'encryption basics',
                'packet analyzer',
                'wireshark',
                'cpu architecture', '32-bit vs 64-bit',
                'linux permissions', 'permissions calculator'
            ],
            achievements: {
                started: { id: 'rabbit_hunter', name: 'Rabbit Hunter', desc: 'Began the White Rabbit trail' },
                found3: { id: 'rabbit_spotter', name: 'Rabbit Spotter', desc: 'Found 3 rabbit trail modules' },
                found5: { id: 'rabbit_tracker', name: 'Rabbit Tracker', desc: 'Found 5 rabbit trail modules' },
                complete: { id: 'white_rabbit', name: 'White Rabbit', desc: 'Completed the rabbit trail and solved Gate 1' }
            }
        },
        owl: {
            icon: '🦉',
            name: 'Shadow Owl',
            gate: 2,
            color: 'rgba(100, 100, 140, 0.8)',
            glowColor: 'rgba(80, 80, 120, 0.6)',
            modules: [],
            achievements: {}
        },
        chameleon: {
            icon: '🦎',
            name: 'Phantom Chameleon',
            gate: 3,
            color: 'rgba(100, 180, 120, 0.8)',
            glowColor: 'rgba(80, 160, 100, 0.6)',
            modules: [],
            achievements: {}
        },
        bat: {
            icon: '🦇',
            name: 'Echo Bat',
            gate: 4,
            color: 'rgba(160, 100, 180, 0.8)',
            glowColor: 'rgba(140, 80, 160, 0.6)',
            modules: [],
            achievements: {}
        },
        crystal: {
            icon: '🔮',
            name: 'Mystic Crystal',
            gate: 5,
            color: 'rgba(180, 140, 220, 0.8)',
            glowColor: 'rgba(160, 120, 200, 0.6)',
            modules: [],
            achievements: {}
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    const STYLES = `
        /* Trail Hunter - Patronus System */

        .patronus-container {
            position: fixed;
            pointer-events: none;
            z-index: 9997;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: visible;
            background: none !important;
            background-color: transparent !important;
            isolation: isolate;
            contain: layout style;
        }

        /* Ensure no unintended styling leaks */
        .patronus-container * {
            background: none;
        }

        .patronus {
            position: absolute;
            font-size: 2rem;
            opacity: 0;
            filter: drop-shadow(0 0 10px var(--patronus-glow));
            transition: opacity 0.5s ease;
            animation: patronusFloat 3s ease-in-out infinite;
            background: none !important;
            line-height: 1;
        }

        .patronus.active {
            opacity: 0.6;
        }

        .patronus.hopping {
            animation: patronusHop 0.5s ease-out;
        }

        .patronus.excited {
            animation: patronusExcited 0.3s ease-in-out 3;
            opacity: 0.9 !important;
            filter: drop-shadow(0 0 20px var(--patronus-glow))
                    drop-shadow(0 0 40px var(--patronus-glow));
        }

        .patronus.found {
            animation: patronusSpin 0.8s ease-out;
        }

        /* Ethereal glow effect */
        .patronus::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, var(--patronus-glow) 0%, transparent 70%);
            border-radius: 50%;
            z-index: -1;
            animation: patronusPulse 2s ease-in-out infinite;
        }

        /* Sparkle trail */
        .patronus-sparkle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--patronus-color);
            border-radius: 50%;
            pointer-events: none;
            animation: sparkle 1s ease-out forwards;
        }

        @keyframes patronusFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }

        @keyframes patronusHop {
            0% {
                transform: translateY(0) scaleY(1) scaleX(1);
            }
            15% {
                transform: translateY(0) scaleY(0.7) scaleX(1.2);
            }
            40% {
                transform: translateY(-40px) scaleY(1.2) scaleX(0.9);
            }
            70% {
                transform: translateY(-20px) scaleY(1) scaleX(1);
            }
            100% {
                transform: translateY(0) scaleY(0.9) scaleX(1.1);
            }
        }

        @keyframes patronusExcited {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(-10deg); }
            75% { transform: translateY(-10px) rotate(10deg); }
        }

        @keyframes patronusSpin {
            0% { transform: rotate(0deg) scale(1); opacity: 0.6; }
            50% { transform: rotate(180deg) scale(1.3); opacity: 1; }
            100% { transform: rotate(360deg) scale(1); opacity: 0.6; }
        }

        @keyframes patronusPulse {
            0%, 100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.5;
            }
            50% {
                transform: translate(-50%, -50%) scale(1.3);
                opacity: 0.8;
            }
        }

        @keyframes sparkle {
            0% {
                opacity: 1;
                transform: scale(1);
            }
            100% {
                opacity: 0;
                transform: scale(0);
            }
        }

        /* Hunt notification toast */
        .hunt-toast {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: rgba(20, 20, 30, 0.95);
            border: 1px solid var(--patronus-glow);
            color: var(--patronus-color);
            padding: 15px 30px;
            border-radius: 8px;
            font-family: 'Georgia', serif;
            font-size: 0.9rem;
            letter-spacing: 0.1em;
            opacity: 0;
            transition: all 0.5s ease;
            z-index: 9998;
            text-align: center;
            box-shadow: 0 0 30px var(--patronus-glow);
        }

        .hunt-toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        .hunt-toast .toast-icon {
            font-size: 1.5rem;
            display: block;
            margin-bottom: 8px;
        }

        .hunt-toast .toast-title {
            font-weight: bold;
            margin-bottom: 4px;
        }

        .hunt-toast .toast-progress {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-top: 8px;
        }

        /* Hunt progress indicator */
        .hunt-progress {
            position: fixed;
            top: 20px;
            right: 80px;
            background: rgba(20, 20, 30, 0.9);
            border: 1px solid var(--patronus-glow);
            border-radius: 20px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.75rem;
            color: var(--patronus-color);
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            z-index: 9996;
        }

        .hunt-progress.show {
            opacity: 0.8;
            transform: translateY(0);
        }

        .hunt-progress:hover {
            opacity: 1;
        }

        .hunt-progress .progress-icon {
            font-size: 1.2rem;
        }

        .hunt-progress .progress-bar {
            width: 60px;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 2px;
            overflow: hidden;
        }

        .hunt-progress .progress-fill {
            height: 100%;
            background: var(--patronus-color);
            transition: width 0.5s ease;
        }

        .hunt-progress .progress-text {
            font-family: 'Courier New', monospace;
            letter-spacing: 0.1em;
        }

        /* Trail markers on module cards */
        .trail-marker {
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 1rem;
            opacity: 0.8;
            animation: trailMarkerPulse 2s ease-in-out infinite;
            filter: drop-shadow(0 0 4px var(--patronus-glow));
            z-index: 10;
            pointer-events: none;
        }

        .trail-marker.found {
            opacity: 0.4;
        }

        @keyframes trailMarkerPulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.1); opacity: 1; }
        }
    `;

    // ═══════════════════════════════════════════════════════════════
    // TRAIL HUNTER CLASS
    // ═══════════════════════════════════════════════════════════════

    class TrailHunter {
        constructor() {
            this.activeTrail = null;
            this.patronus = null;
            this.position = { x: 100, y: 100 };
            this.targetPosition = { x: 100, y: 100 };
            this.hopInterval = null;
            this.sparkleInterval = null;

            this.init();
        }

        init() {
            console.log('[TrailHunter] Initializing...');
            this.checkActiveHunts();

            // Only do anything if there's an active hunt
            if (this.activeTrail) {
                console.log('[TrailHunter] Active hunt found:', this.activeTrail);
                try {
                    this.injectStyles();
                    this.createPatronus();
                    this.createProgressIndicator();
                    this.startPatronusMovement();
                    this.checkCurrentPage();
                    this.markTrailModules();
                    console.log('[TrailHunter] Patronus active and hopping');
                } catch (e) {
                    console.error('[TrailHunter] Error during init:', e);
                    this.destroy(); // Clean up on error
                }
            } else {
                console.log('[TrailHunter] No active hunt, staying dormant');
            }
        }

        injectStyles() {
            if (document.getElementById('trail-hunter-styles')) return;

            const style = document.createElement('style');
            style.id = 'trail-hunter-styles';
            style.textContent = STYLES;
            document.head.appendChild(style);
        }

        checkActiveHunts() {
            const hunts = this.getHuntData();

            // Find active hunt (most recent started)
            for (const [trailId, data] of Object.entries(hunts)) {
                if (data.active && !data.completed) {
                    this.activeTrail = trailId;
                    break;
                }
            }
        }

        getHuntData() {
            return JSON.parse(localStorage.getItem('trail_hunts') || '{}');
        }

        saveHuntData(data) {
            localStorage.setItem('trail_hunts', JSON.stringify(data));
        }

        createPatronus() {
            const trail = TRAILS[this.activeTrail];
            if (!trail) return;

            // Create container
            const container = document.createElement('div');
            container.className = 'patronus-container';
            container.id = 'patronusContainer';

            // Set CSS variables
            container.style.setProperty('--patronus-color', trail.color);
            container.style.setProperty('--patronus-glow', trail.glowColor);

            // Create patronus element
            this.patronus = document.createElement('div');
            this.patronus.className = 'patronus';
            this.patronus.textContent = trail.icon;
            this.patronus.style.left = this.position.x + 'px';
            this.patronus.style.top = this.position.y + 'px';

            container.appendChild(this.patronus);
            document.body.appendChild(container);

            // Fade in after a moment
            setTimeout(() => {
                this.patronus.classList.add('active');
            }, 500);
        }

        createProgressIndicator() {
            const trail = TRAILS[this.activeTrail];
            const huntData = this.getHuntData()[this.activeTrail] || {};
            const found = (huntData.found || []).length;
            const total = trail.modules.length;
            const percent = Math.round((found / total) * 100);

            const progress = document.createElement('div');
            progress.className = 'hunt-progress';
            progress.id = 'huntProgress';
            progress.style.setProperty('--patronus-color', trail.color);
            progress.style.setProperty('--patronus-glow', trail.glowColor);
            progress.innerHTML = `
                <span class="progress-icon">${trail.icon}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <span class="progress-text">${found}/${total}</span>
            `;

            document.body.appendChild(progress);

            setTimeout(() => progress.classList.add('show'), 1000);
        }

        startPatronusMovement() {
            // Initial position - bottom right area
            this.position = {
                x: window.innerWidth - 150,
                y: window.innerHeight - 150
            };
            this.updatePatronusPosition();

            // Hop to new position every 3-6 seconds
            this.hopInterval = setInterval(() => {
                this.hopToNewPosition();
            }, 3000 + Math.random() * 3000);

            // Create sparkles periodically
            this.sparkleInterval = setInterval(() => {
                this.createSparkle();
            }, 500);
        }

        hopToNewPosition() {
            if (!this.patronus) return;

            // Calculate new target along screen edges
            const edge = Math.floor(Math.random() * 4);
            const padding = 80;
            const w = window.innerWidth;
            const h = window.innerHeight;

            switch(edge) {
                case 0: // Top
                    this.targetPosition = {
                        x: padding + Math.random() * (w - padding * 2),
                        y: padding
                    };
                    break;
                case 1: // Right
                    this.targetPosition = {
                        x: w - padding,
                        y: padding + Math.random() * (h - padding * 2)
                    };
                    break;
                case 2: // Bottom
                    this.targetPosition = {
                        x: padding + Math.random() * (w - padding * 2),
                        y: h - padding
                    };
                    break;
                case 3: // Left
                    this.targetPosition = {
                        x: padding,
                        y: padding + Math.random() * (h - padding * 2)
                    };
                    break;
            }

            this.animateHop();
        }

        animateHop() {
            if (!this.patronus) return;

            // Add hopping animation class
            this.patronus.classList.add('hopping');

            // Calculate midpoint for arc
            const startX = this.position.x;
            const startY = this.position.y;
            const endX = this.targetPosition.x;
            const endY = this.targetPosition.y;

            // Animate position
            let progress = 0;
            const duration = 500;
            const startTime = performance.now();

            const animate = (currentTime) => {
                progress = (currentTime - startTime) / duration;

                if (progress >= 1) {
                    this.position = { ...this.targetPosition };
                    this.updatePatronusPosition();
                    this.patronus.classList.remove('hopping');
                    return;
                }

                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);

                this.position.x = startX + (endX - startX) * ease;
                this.position.y = startY + (endY - startY) * ease;

                this.updatePatronusPosition();
                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        }

        updatePatronusPosition() {
            if (!this.patronus) return;
            this.patronus.style.left = this.position.x + 'px';
            this.patronus.style.top = this.position.y + 'px';
        }

        createSparkle() {
            if (!this.patronus || !this.patronus.classList.contains('active')) return;

            const container = document.getElementById('patronusContainer');
            if (!container) return;

            const sparkle = document.createElement('div');
            sparkle.className = 'patronus-sparkle';
            sparkle.style.left = (this.position.x + 15 + Math.random() * 10) + 'px';
            sparkle.style.top = (this.position.y + 15 + Math.random() * 10) + 'px';

            container.appendChild(sparkle);

            // Remove after animation
            setTimeout(() => sparkle.remove(), 1000);
        }

        checkCurrentPage() {
            const trail = TRAILS[this.activeTrail];
            if (!trail) return;

            const currentPath = window.location.pathname;
            console.log('[TrailHunter] Checking current page:', currentPath);

            // Check if current page is a trail module
            const matchedModule = trail.modules.find(mod => currentPath.includes(mod));

            if (matchedModule) {
                console.log('[TrailHunter] ✓ This is a trail module:', matchedModule);
                this.handleModuleFound(currentPath);
            } else {
                console.log('[TrailHunter] Not a trail module. Trail modules:', trail.modules);
            }
        }

        markTrailModules() {
            // Delay to allow dynamic content to render
            setTimeout(() => this._doMarkTrailModules(), 500);
        }

        _doMarkTrailModules() {
            const trail = TRAILS[this.activeTrail];
            if (!trail || !trail.keywords) return;

            const huntData = this.getHuntData()[this.activeTrail] || {};
            const foundModules = huntData.found || [];

            let markedCount = 0;

            // Method 1: Find module cards by their text content
            const cards = document.querySelectorAll('.module-card, .card, [class*="module"], [class*="card"]');

            cards.forEach(card => {
                // Skip if already marked
                if (card.querySelector('.trail-marker')) return;

                const cardText = card.textContent.toLowerCase();

                // Check if card text matches any trail keyword
                const matched = trail.keywords.some(keyword =>
                    cardText.includes(keyword.toLowerCase())
                );

                if (matched) {
                    this._addMarkerToCard(card, trail, foundModules);
                    markedCount++;
                }
            });

            // Method 2: Also check links with hrefs
            const links = document.querySelectorAll('a[href]');
            links.forEach(link => {
                const href = link.getAttribute('href') || '';

                const matchedModule = trail.modules.find(mod => href.includes(mod));

                if (matchedModule) {
                    let card = link.closest('.module-card, .card, [class*="card"]');
                    if (!card) card = link;

                    if (!card.querySelector('.trail-marker')) {
                        this._addMarkerToCard(card, trail, foundModules);
                        markedCount++;
                    }
                }
            });

            if (markedCount > 0) {
                console.log(`[TrailHunter] Marked ${markedCount} trail modules on this page`);
            }
        }

        _addMarkerToCard(card, trail, foundModules) {
            // Make sure card has position relative for absolute positioning
            const computedStyle = window.getComputedStyle(card);
            if (computedStyle.position === 'static') {
                card.style.position = 'relative';
            }

            // Create marker
            const marker = document.createElement('span');
            marker.className = 'trail-marker';
            marker.textContent = trail.icon;
            marker.title = `${trail.name} Trail Module`;

            // Check if this module was already found (match by keywords in card)
            const cardText = card.textContent.toLowerCase();
            const isFound = foundModules.some(foundPath => {
                // Check if any trail module path matches and this card contains related keywords
                return trail.modules.some(mod => {
                    if (foundPath.includes(mod)) {
                        // Get keywords for this module
                        const modKeywords = trail.keywords.filter(kw =>
                            mod.toLowerCase().includes(kw.split(' ')[0]) ||
                            kw.toLowerCase().includes(mod.split('/').pop().replace('.html', '').replace(/-/g, ' ').split('_')[0])
                        );
                        return modKeywords.some(kw => cardText.includes(kw.toLowerCase()));
                    }
                    return false;
                });
            });

            if (isFound) {
                marker.classList.add('found');
                marker.title += ' (Discovered!)';
            }

            card.appendChild(marker);
        }

        handleModuleFound(modulePath) {
            console.log('[TrailHunter] handleModuleFound called with:', modulePath);
            const huntData = this.getHuntData();
            const trailData = huntData[this.activeTrail] || { active: true, found: [] };
            console.log('[TrailHunter] Current found modules:', trailData.found);

            // Check if already found
            const alreadyFound = trailData.found.some(f => modulePath.includes(f) || f.includes(modulePath));

            if (!alreadyFound) {
                // Mark as found
                trailData.found.push(modulePath);
                huntData[this.activeTrail] = trailData;
                this.saveHuntData(huntData);
                console.log('[TrailHunter] ★ NEW MODULE DISCOVERED! Total:', trailData.found.length);

                // Excited patronus!
                if (this.patronus) {
                    this.patronus.classList.add('found');
                    setTimeout(() => {
                        this.patronus.classList.remove('found');
                    }, 800);
                }

                // Show discovery toast
                this.showToast('found', trailData.found.length);

                // Update progress
                this.updateProgress(trailData.found.length);

                // Check for achievements
                this.checkAchievements(trailData.found.length);
            } else {
                // Already found - patronus gets excited but no new discovery
                if (this.patronus) {
                    this.patronus.classList.add('excited');
                    setTimeout(() => {
                        this.patronus.classList.remove('excited');
                    }, 900);
                }
            }
        }

        showToast(type, count) {
            const trail = TRAILS[this.activeTrail];
            const total = trail.modules.length;

            const toast = document.createElement('div');
            toast.className = 'hunt-toast';
            toast.style.setProperty('--patronus-color', trail.color);
            toast.style.setProperty('--patronus-glow', trail.glowColor);

            if (type === 'start') {
                toast.innerHTML = `
                    <span class="toast-icon">${trail.icon}</span>
                    <div class="toast-title">The Hunt Begins</div>
                    <div>Follow the ${trail.name}...</div>
                `;
            } else if (type === 'found') {
                toast.innerHTML = `
                    <span class="toast-icon">${trail.icon}</span>
                    <div class="toast-title">Trail Discovered!</div>
                    <div class="toast-progress">${count}/${total} modules found</div>
                `;
            }

            document.body.appendChild(toast);

            setTimeout(() => toast.classList.add('show'), 100);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }

        updateProgress(count) {
            const trail = TRAILS[this.activeTrail];
            const total = trail.modules.length;
            const percent = Math.round((count / total) * 100);

            const progressEl = document.getElementById('huntProgress');
            if (progressEl) {
                progressEl.querySelector('.progress-fill').style.width = percent + '%';
                progressEl.querySelector('.progress-text').textContent = `${count}/${total}`;
            }
        }

        checkAchievements(count) {
            const trail = TRAILS[this.activeTrail];
            const achievements = trail.achievements;

            // Would integrate with achievement system
            if (count >= 3 && achievements.found3) {
                console.log('Achievement unlocked:', achievements.found3.name);
            }
            if (count >= 5 && achievements.found5) {
                console.log('Achievement unlocked:', achievements.found5.name);
            }
        }

        // Static method to start a hunt (called from Gate)
        static startHunt(trailId) {
            try {
                console.log('[TrailHunter] Starting hunt:', trailId);
                const trail = TRAILS[trailId];
                if (!trail) {
                    console.warn('[TrailHunter] Unknown trail:', trailId);
                    return;
                }

                const hunts = JSON.parse(localStorage.getItem('trail_hunts') || '{}');

                if (!hunts[trailId]) {
                    hunts[trailId] = {
                        active: true,
                        started: Date.now(),
                        found: [],
                        completed: false
                    };
                    localStorage.setItem('trail_hunts', JSON.stringify(hunts));
                    console.log('[TrailHunter] Hunt registered in localStorage');

                    // Note: Toast will show when user navigates to a page with TrailHunter
                    // We don't inject styles here to avoid affecting Gate page
                }
            } catch (e) {
                console.error('[TrailHunter] startHunt error:', e);
            }
        }

        // Static method to complete a hunt (called when gate is solved)
        static completeHunt(trailId) {
            const hunts = JSON.parse(localStorage.getItem('trail_hunts') || '{}');

            if (hunts[trailId]) {
                hunts[trailId].completed = true;
                hunts[trailId].active = false;
                hunts[trailId].completedAt = Date.now();
                localStorage.setItem('trail_hunts', JSON.stringify(hunts));
            }
        }

        destroy() {
            console.log('[TrailHunter] Destroying instance');
            if (this.hopInterval) clearInterval(this.hopInterval);
            if (this.sparkleInterval) clearInterval(this.sparkleInterval);

            const container = document.getElementById('patronusContainer');
            if (container) container.remove();

            const progress = document.getElementById('huntProgress');
            if (progress) progress.remove();

            const styles = document.getElementById('trail-hunter-styles');
            if (styles) styles.remove();
        }

        // Emergency kill switch - clears all hunts and removes Patronus
        static emergencyStop() {
            console.log('[TrailHunter] EMERGENCY STOP - clearing all hunts');
            localStorage.removeItem('trail_hunts');

            const container = document.getElementById('patronusContainer');
            if (container) container.remove();

            const progress = document.getElementById('huntProgress');
            if (progress) progress.remove();

            const styles = document.getElementById('trail-hunter-styles');
            if (styles) styles.remove();

            const toasts = document.querySelectorAll('.hunt-toast');
            toasts.forEach(t => t.remove());

            console.log('[TrailHunter] All elements removed, localStorage cleared');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE
    // ═══════════════════════════════════════════════════════════════

    // Make TrailHunter available globally for Gate integration
    window.TrailHunter = TrailHunter;

    // Safe initialization with error handling
    function safeInit() {
        try {
            // Only create if body exists
            if (!document.body) return;
            new TrailHunter();
        } catch (e) {
            console.error('TrailHunter initialization error:', e);
        }
    }

    // Auto-initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInit);
    } else {
        safeInit();
    }

})();
