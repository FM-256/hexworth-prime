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
        // ═══════════════════════════════════════════════════════════════
        // GATE 1: White Rabbit - Hex encoding, source inspection, basics
        // ═══════════════════════════════════════════════════════════════
        rabbit: {
            icon: '🐇',
            name: 'White Rabbit',
            gate: 1,
            color: 'rgba(220, 230, 255, 0.8)',
            glowColor: 'rgba(180, 200, 255, 0.6)',
            modules: [
                // Web House - Networking Fundamentals
                'applets/ip-addressing/binary-decimal-converter.html',
                'applets/visualizers/osi-visualizer.html',
                'applets/visualizers/osi-deep-dive-visualizer.html',
                'quizzes/osi-quiz.html',
                // Shield House - Encryption Basics
                'applets/crypto/hashing_steganography/encryption_task.html',
                'applets/crypto/encryption/encryption_jedit_6_1.html',
                // Key House - Encryption Fundamentals
                'presentations/encryption-basics.html',
                'presentations/cryptography-fundamentals.html',
                // Eye House - Traffic Analysis Intro
                'tools/packet-analyzer.html',
                'tools/wireshark-training.html',
                // Forge House - Hardware Basics
                'reference/cpu-architecture.html',
                'applets/hardware/cpu_architecture/cpu_architecture.html',
                // Script House - Linux Basics
                'applets/linux/linux-permissions-calculator.html',
                'applets/linux/linux-filesystem-navigator.html'
            ],
            keywords: [],  // Using exact path matching only
            achievements: {
                started: { id: 'rabbit_hunter', name: 'Rabbit Hunter', desc: 'Began the White Rabbit trail' },
                found3: { id: 'rabbit_spotter', name: 'Rabbit Spotter', desc: 'Found 3 rabbit trail modules' },
                found5: { id: 'rabbit_tracker', name: 'Rabbit Tracker', desc: 'Found 5 rabbit trail modules' },
                complete: { id: 'white_rabbit', name: 'White Rabbit', desc: 'Completed the rabbit trail and solved Gate 1' }
            }
        },

        // ═══════════════════════════════════════════════════════════════
        // GATE 2: Shadow Owl - CSS hidden text, Base64, web inspection
        // Skills: Developer tools, OSINT, source code inspection
        // ═══════════════════════════════════════════════════════════════
        owl: {
            icon: '🦉',
            name: 'Shadow Owl',
            gate: 2,
            color: 'rgba(100, 100, 140, 0.8)',
            glowColor: 'rgba(80, 80, 120, 0.6)',
            modules: [
                // Shield House - OSINT and web inspection
                'applets/threats/osint/OSINT.html',
                'applets/threats/osint_challenge/OSINT_PD_Challenge.html',
                'applets/threats/google_hacking/googlehacking.html',
                'tools/google-dorking-osint.html',
                'labs/osint-google-dorking.html',
                // Shield House - Browser and web security
                'applets/network/browser-security-hardening.html',
                'applets/fundamentals/security-best-practices.html',
                // Shield House - Encoding and crypto basics
                'applets/crypto/encrypt_data/EncryptData.html',
                'applets/crypto/hashing/Hashing.html',
                'applets/crypto/hashing_narrated/Hashing_vo.html',
                // Shield House - Cookie inspection and games
                'applets/games/cookie_caper/cookies.html',
                'applets/games/cyber_scramble/cyberscramble.html',
                // Key House - Certificate inspection
                'tools/cert-inspector.html',
                'presentations/certificates.html'
            ],
            keywords: [],  // Using exact path matching only
            achievements: {
                started: { id: 'owl_watcher', name: 'Owl Watcher', desc: 'Began the Shadow Owl trail' },
                found3: { id: 'owl_spotter', name: 'Owl Spotter', desc: 'Found 3 owl trail modules' },
                found5: { id: 'owl_tracker', name: 'Owl Tracker', desc: 'Found 5 owl trail modules' },
                complete: { id: 'shadow_owl', name: 'Shadow Owl', desc: 'Completed the owl trail and solved Gate 2' }
            }
        },

        // ═══════════════════════════════════════════════════════════════
        // GATE 3: Phantom Chameleon - Steganography, hidden data in images
        // Skills: Image analysis, hidden data extraction
        // ═══════════════════════════════════════════════════════════════
        chameleon: {
            icon: '🦎',
            name: 'Phantom Chameleon',
            gate: 3,
            color: 'rgba(100, 180, 120, 0.8)',
            glowColor: 'rgba(80, 160, 100, 0.6)',
            modules: [
                // Shield House - Steganography modules (primary)
                'applets/crypto/hashing_steganography/Stego.html',
                'applets/crypto/hashing_steganography/hash_steg_presentation.html',
                'applets/crypto/hashing_steganography/Encryption_II.html',
                'applets/crypto/hashing_steganography/Hash_Lab.html',
                'applets/crypto/hashing_steganography/hashing_Lab.html',
                'applets/crypto/hashing_steganography/hash_v3.html',
                // Shield House - Verification
                'applets/crypto/checksum-verifier.html',
                'applets/crypto/digital_signatures/DigitalSignature.html',
                // Key House - Hash & Stego intro
                'modules/hash-stego-intro.html',
                // Dark Arts Vault - Advanced steganography
                'vault/steganography-lab.html'
            ],
            keywords: [],  // Using exact path matching only
            achievements: {
                started: { id: 'chameleon_seeker', name: 'Chameleon Seeker', desc: 'Began the Phantom Chameleon trail' },
                found3: { id: 'chameleon_spotter', name: 'Chameleon Spotter', desc: 'Found 3 chameleon trail modules' },
                found5: { id: 'chameleon_tracker', name: 'Chameleon Tracker', desc: 'Found 5 chameleon trail modules' },
                complete: { id: 'phantom_chameleon', name: 'Phantom Chameleon', desc: 'Completed the chameleon trail and solved Gate 3' }
            }
        },

        // ═══════════════════════════════════════════════════════════════
        // GATE 4: Echo Bat - DTMF audio, signals, traffic analysis
        // Skills: Audio analysis, protocol analysis, signal detection
        // ═══════════════════════════════════════════════════════════════
        bat: {
            icon: '🦇',
            name: 'Echo Bat',
            gate: 4,
            color: 'rgba(160, 100, 180, 0.8)',
            glowColor: 'rgba(140, 80, 160, 0.6)',
            modules: [
                // Eye House - Traffic and protocol analysis (primary)
                'tools/packet-analyzer.html',
                'tools/wireshark-training.html',
                'presentations/network-traffic-analysis.html',
                'labs/traffic-lab.html',
                // Eye House - Log analysis and correlation
                'presentations/log-correlation.html',
                'tools/correlation-engine.html',
                'labs/correlation-lab.html',
                // Eye House - SIEM fundamentals
                'presentations/siem-fundamentals.html',
                'tools/siem-simulator.html',
                'labs/siem-lab.html',
                // Shield House - Network protocol analysis
                'applets/network/protocol_analysis/ProtocolAnalysis.html',
                'applets/network/threeway_handshake/threeway_handshake1_audio.html',
                'applets/network/wireless_security/WirelessSecurity.html',
                // Web House - Network visualizers
                'applets/visualizers/wireless-visualizer.html',
                'applets/visualizers/wireless-architecture-visualizer.html'
            ],
            keywords: [],  // Using exact path matching only
            achievements: {
                started: { id: 'bat_listener', name: 'Bat Listener', desc: 'Began the Echo Bat trail' },
                found3: { id: 'bat_spotter', name: 'Bat Spotter', desc: 'Found 3 bat trail modules' },
                found5: { id: 'bat_tracker', name: 'Bat Tracker', desc: 'Found 5 bat trail modules' },
                complete: { id: 'echo_bat', name: 'Echo Bat', desc: 'Completed the bat trail and solved Gate 4' }
            }
        },

        // ═══════════════════════════════════════════════════════════════
        // GATE 5: Mystic Crystal - Synthesis of all skills
        // Skills: Advanced crypto, threat hunting, forensics, CTF mindset
        // ═══════════════════════════════════════════════════════════════
        crystal: {
            icon: '🔮',
            name: 'Mystic Crystal',
            gate: 5,
            color: 'rgba(180, 140, 220, 0.8)',
            glowColor: 'rgba(160, 120, 200, 0.6)',
            modules: [
                // Key House - Cryptanalysis (breaking codes)
                'presentations/cryptanalysis.html',
                'tools/cryptanalysis-lab.html',
                // Key House - Advanced crypto
                'presentations/elliptic-curve.html',
                'tools/ecc-visualizer.html',
                'presentations/post-quantum.html',
                'tools/pqc-explorer.html',
                // Eye House - Threat hunting
                'presentations/threat-hunting.html',
                'tools/hunt-workbench.html',
                'labs/hunting-lab.html',
                // Eye House - SOC operations
                'presentations/soc-operations.html',
                'tools/soc-simulator.html',
                'labs/soc-lab.html',
                // Shield House - Advanced attacks understanding
                'applets/threats/pen_testing/pen_testing.html',
                'applets/threats/code_injection/codeinjection.html',
                'applets/threats/buffer_overflow/bufferoverflow.html',
                // Shield House - Advanced crypto applets
                'applets/crypto/diffie_hellman/diffie_hellman.html',
                'applets/crypto/rsa/RSA.html',
                'applets/crypto/pki/pki.html',
                // Shield House - Ethical hacking
                'applets/games/ethical_hacking_case/EH_exam_1A.html'
            ],
            keywords: [],  // Using exact path matching only
            achievements: {
                started: { id: 'crystal_gazer', name: 'Crystal Gazer', desc: 'Began the Mystic Crystal trail' },
                found3: { id: 'crystal_spotter', name: 'Crystal Spotter', desc: 'Found 3 crystal trail modules' },
                found5: { id: 'crystal_tracker', name: 'Crystal Tracker', desc: 'Found 5 crystal trail modules' },
                complete: { id: 'mystic_crystal', name: 'Mystic Crystal', desc: 'Mastered all trails and conquered the Dark Arts' }
            }
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

        /* Hunt progress panel */
        .hunt-progress {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(15, 15, 25, 0.95);
            border: 1px solid var(--patronus-glow);
            border-radius: 12px;
            padding: 12px 16px;
            min-width: 200px;
            max-width: 320px;
            font-size: 0.8rem;
            color: var(--patronus-color);
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            z-index: 9996;
            pointer-events: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
        }

        .hunt-progress.show {
            opacity: 1;
            transform: translateY(0);
        }

        .hunt-progress-header {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hunt-progress-header:hover {
            opacity: 0.9;
        }

        .hunt-progress .progress-icon {
            font-size: 1.5rem;
            animation: patronusFloat 2s ease-in-out infinite;
        }

        .hunt-progress .progress-info {
            flex: 1;
        }

        .hunt-progress .progress-title {
            font-weight: bold;
            font-size: 0.85rem;
            color: #fff;
            margin-bottom: 2px;
        }

        .hunt-progress .progress-subtitle {
            font-size: 0.7rem;
            opacity: 0.7;
        }

        .hunt-progress .progress-count {
            font-family: 'Courier New', monospace;
            font-size: 1rem;
            font-weight: bold;
            text-align: right;
        }

        .hunt-progress .progress-bar-container {
            margin-top: 10px;
        }

        .hunt-progress .progress-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
        }

        .hunt-progress .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--patronus-color), var(--patronus-glow));
            transition: width 0.5s ease;
            border-radius: 3px;
        }

        /* Module checklist */
        .hunt-modules {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }

        .hunt-progress.expanded .hunt-modules {
            max-height: 400px;
            margin-top: 12px;
            overflow-y: auto;
        }

        .hunt-modules-title {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            opacity: 0.6;
            margin-bottom: 8px;
        }

        .hunt-module-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 0;
            font-size: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hunt-module-item:last-child {
            border-bottom: none;
        }

        .hunt-module-item.found {
            opacity: 0.5;
        }

        .hunt-module-item .module-status {
            font-size: 0.9rem;
        }

        .hunt-module-item .module-name {
            flex: 1;
            color: #ccc;
        }

        .hunt-module-item.found .module-name {
            text-decoration: line-through;
            color: #888;
        }

        .hunt-module-item .module-house {
            font-size: 0.65rem;
            opacity: 0.6;
        }

        .hunt-toggle {
            font-size: 0.65rem;
            text-align: center;
            margin-top: 8px;
            opacity: 0.5;
            cursor: pointer;
        }

        .hunt-toggle:hover {
            opacity: 0.8;
        }

        .hunt-progress.expanded .hunt-toggle::after {
            content: '▲ Hide modules';
        }

        .hunt-progress:not(.expanded) .hunt-toggle::after {
            content: '▼ Show modules';
        }

        /* End hunt button */
        .hunt-end-btn {
            margin-top: 10px;
            padding: 6px 12px;
            background: rgba(255, 100, 100, 0.2);
            border: 1px solid rgba(255, 100, 100, 0.3);
            border-radius: 6px;
            color: #ff8888;
            font-size: 0.7rem;
            cursor: pointer;
            width: 100%;
            transition: all 0.2s;
        }

        .hunt-end-btn:hover {
            background: rgba(255, 100, 100, 0.3);
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
            const foundPaths = huntData.found || [];
            const found = foundPaths.length;
            const total = trail.modules.length;
            const percent = Math.round((found / total) * 100);

            // Build module list HTML
            const moduleListHtml = trail.modules.map(mod => {
                const isFound = foundPaths.some(f => mod.includes(f) || f.includes(mod));
                const moduleName = this.getModuleDisplayName(mod);
                const houseIcon = this.getHouseIcon(mod);
                return `
                    <div class="hunt-module-item ${isFound ? 'found' : ''}">
                        <span class="module-status">${isFound ? '✓' : '○'}</span>
                        <span class="module-name">${moduleName}</span>
                        <span class="module-house">${houseIcon}</span>
                    </div>
                `;
            }).join('');

            const progress = document.createElement('div');
            progress.className = 'hunt-progress';
            progress.id = 'huntProgress';
            progress.style.setProperty('--patronus-color', trail.color);
            progress.style.setProperty('--patronus-glow', trail.glowColor);
            progress.innerHTML = `
                <div class="hunt-progress-header" onclick="document.getElementById('huntProgress').classList.toggle('expanded')">
                    <span class="progress-icon">${trail.icon}</span>
                    <div class="progress-info">
                        <div class="progress-title">${trail.name} Hunt</div>
                        <div class="progress-subtitle">Gate ${trail.gate} Trail</div>
                    </div>
                    <div class="progress-count">${found}/${total}</div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                </div>
                <div class="hunt-modules">
                    <div class="hunt-modules-title">Modules to Find</div>
                    ${moduleListHtml}
                    <button class="hunt-end-btn" onclick="window.trailHunter.endHunt()">End Hunt</button>
                </div>
                <div class="hunt-toggle" onclick="document.getElementById('huntProgress').classList.toggle('expanded')"></div>
            `;

            document.body.appendChild(progress);

            // Store reference globally for end hunt button
            window.trailHunter = this;

            setTimeout(() => progress.classList.add('show'), 500);
        }

        getModuleDisplayName(modulePath) {
            // Extract a readable name from the module path
            const names = {
                'binary-decimal-converter': 'Binary/Decimal Converter',
                'subnet-calculator': 'Subnet Calculator',
                'dns-header-reference': 'DNS Header Reference',
                'osi-model': 'OSI Model',
                'encryption_task': 'Encryption Task',
                'encryption-basics': 'Encryption Basics',
                'packet-analyzer': 'Packet Analyzer',
                'wireshark-training': 'Wireshark Training',
                'cpu-architecture': 'CPU Architecture',
                'linux-permissions-calculator': 'Linux Permissions',
                'OSINT': 'OSINT Basics',
                'OSINT_PD_Challenge': 'OSINT Challenge',
                'googlehacking': 'Google Hacking',
                'google-dorking-osint': 'Google Dorking',
                'osint-google-dorking': 'OSINT Lab',
                'browser-security-hardening': 'Browser Security',
                'encryption_jedit': 'Encryption Tool',
                'EncryptData': 'Encrypt Data',
                'Hashing': 'Hashing',
                'cookies': 'Cookie Caper',
                'Stego': 'Steganography',
                'hash_steg_presentation': 'Hash & Stego Intro',
                'Encryption_II': 'Encryption II',
                'Hash_Lab': 'Hash Lab',
                'hashing_Lab': 'Hashing Lab',
                'hash-stego-intro': 'Stego Introduction',
                'crypto-stego-lab': 'Crypto Stego Lab',
                'hash_v3': 'Hash v3',
                'checksum-verifier': 'Checksum Verifier',
                'DigitalSignature': 'Digital Signatures',
                'network-traffic-analysis': 'Traffic Analysis',
                'traffic-lab': 'Traffic Lab',
                'ProtocolAnalysis': 'Protocol Analysis',
                'threeway_handshake': '3-Way Handshake',
                'WirelessSecurity': 'Wireless Security',
                'log-correlation': 'Log Correlation',
                'correlation-engine': 'Correlation Engine',
                'siem-fundamentals': 'SIEM Basics',
                'siem-simulator': 'SIEM Simulator',
                'cryptanalysis': 'Cryptanalysis',
                'cryptanalysis-lab': 'Cryptanalysis Lab',
                'threat-hunting': 'Threat Hunting',
                'hunt-workbench': 'Hunt Workbench',
                'hunting-lab': 'Hunting Lab',
                'pen_testing': 'Penetration Testing',
                'codeinjection': 'Code Injection',
                'bufferoverflow': 'Buffer Overflow',
                'elliptic-curve': 'Elliptic Curve',
                'ecc-visualizer': 'ECC Visualizer',
                'diffie_hellman': 'Diffie-Hellman',
                'RSA': 'RSA Encryption',
                'EH_exam': 'Ethical Hacking'
            };

            // Try to match from the names map
            for (const [key, name] of Object.entries(names)) {
                if (modulePath.includes(key)) return name;
            }

            // Fallback: extract filename and clean it up
            const filename = modulePath.split('/').pop().replace('.html', '');
            return filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        getHouseIcon(modulePath) {
            if (modulePath.includes('ip-addressing') || modulePath.includes('subnet') || modulePath.includes('dns') || modulePath.includes('osi')) return '🌐';
            if (modulePath.includes('crypto') || modulePath.includes('encrypt') || modulePath.includes('hash') || modulePath.includes('stego')) return '🔑';
            if (modulePath.includes('packet') || modulePath.includes('wireshark') || modulePath.includes('traffic') || modulePath.includes('siem') || modulePath.includes('correlation') || modulePath.includes('hunt')) return '👁️';
            if (modulePath.includes('cpu') || modulePath.includes('reference')) return '⚒️';
            if (modulePath.includes('linux') || modulePath.includes('script')) return '📜';
            if (modulePath.includes('osint') || modulePath.includes('google') || modulePath.includes('browser') || modulePath.includes('cookie') || modulePath.includes('threat') || modulePath.includes('pen_testing') || modulePath.includes('injection') || modulePath.includes('buffer')) return '🛡️';
            return '📚';
        }

        endHunt() {
            if (confirm('End this hunt? Your progress will be saved but the Patronus will stop guiding you.')) {
                const huntData = this.getHuntData();
                if (huntData[this.activeTrail]) {
                    huntData[this.activeTrail].active = false;
                    this.saveHuntData(huntData);
                }
                this.destroy();
                location.reload();
            }
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
            if (!trail || !trail.modules) return;

            const huntData = this.getHuntData()[this.activeTrail] || {};
            const foundModules = huntData.found || [];

            let markedCount = 0;

            // Check elements with href, data-href, or onclick containing paths
            const allElements = document.querySelectorAll('a[href], [data-href], [onclick*=".html"]');

            allElements.forEach(el => {
                const href = el.getAttribute('href') || '';
                const dataHref = el.dataset.href || '';
                const onclick = el.getAttribute('onclick') || '';

                // Check if this element links to a trail module (exact match only)
                const matchedModule = trail.modules.find(mod => {
                    const modFile = mod.split('/').pop(); // Get filename
                    // Require exact match of the full path OR exact filename match
                    return href === mod || dataHref === mod ||
                           href.endsWith(mod) || dataHref.endsWith(mod) ||
                           href.endsWith(modFile) || dataHref.endsWith(modFile);
                });

                if (matchedModule) {
                    // Find the parent card element or use the element itself
                    let card = el.closest('.module-card, .card, .path-card, .cert-step');
                    if (!card) card = el;

                    // Skip if already marked
                    if (!card.querySelector('.trail-marker')) {
                        this._addMarkerToCard(card, trail, foundModules);
                        markedCount++;
                        console.log(`[TrailHunter] Marked: ${matchedModule}`);
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
            const huntData = this.getHuntData()[this.activeTrail] || {};
            const foundPaths = huntData.found || [];
            const total = trail.modules.length;
            const percent = Math.round((count / total) * 100);

            const progressEl = document.getElementById('huntProgress');
            if (progressEl) {
                // Update progress bar
                progressEl.querySelector('.progress-fill').style.width = percent + '%';

                // Update count
                const countEl = progressEl.querySelector('.progress-count');
                if (countEl) countEl.textContent = `${count}/${total}`;

                // Update module list checkmarks
                const moduleItems = progressEl.querySelectorAll('.hunt-module-item');
                moduleItems.forEach((item, index) => {
                    const mod = trail.modules[index];
                    const isFound = foundPaths.some(f => mod.includes(f) || f.includes(mod));
                    if (isFound) {
                        item.classList.add('found');
                        item.querySelector('.module-status').textContent = '✓';
                    }
                });
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
