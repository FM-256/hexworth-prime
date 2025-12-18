/**
 * Planet.js - Celestial Entity
 *
 * Born from the ultimate sacrifice: when an Ascended digizen
 * willingly enters the black hole, a new planet emerges.
 *
 * Planets:
 * - Orbit around the black hole at a safe distance
 * - Act as sanctuaries for fireflies (protection zone)
 * - Generate energy that attracts and heals nearby fireflies
 * - Have their own life cycle (young → mature → ancient)
 * - Can be destroyed by shooting stars (multiple hits)
 */

class Planet {
    // Planet types based on the digit of the sacrificed Ascended
    static TYPES = {
        BINARY_ZERO: {
            name: 'Null World',
            color: '#4ecdc4',        // Cyan
            glowColor: 'rgba(78, 205, 196, 0.5)',
            symbol: '◯',
            protectionRadius: 120,
            healingRate: 0.5,
            // Elemental Power: Time Dilation
            // Fireflies in zone age slower, gaining extended lifespan
            elementalPower: 'timeDilation',
            timeDilationFactor: 0.4  // Age at 40% normal rate (60% slower)
        },
        BINARY_ONE: {
            name: 'Unity Sphere',
            color: '#fbbf24',        // Gold
            glowColor: 'rgba(251, 191, 36, 0.5)',
            symbol: '◉',
            protectionRadius: 100,
            healingRate: 0.8,
            // Elemental Power: Energize
            // Fireflies in zone move faster and glow brighter
            elementalPower: 'energize',
            energizeSpeedBoost: 1.5,  // 50% faster movement
            energizeBrightness: 1.4   // 40% brighter glow
        }
    };

    constructor(options = {}) {
        // Identity
        this.id = 'planet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Type based on sacrificed digit
        this.digit = options.digit ?? 0;
        this.type = this.digit === 1 ? Planet.TYPES.BINARY_ONE : Planet.TYPES.BINARY_ZERO;

        // Orbital mechanics
        this.orbitCenter = {
            x: options.orbitCenterX ?? window.innerWidth * 0.12,
            y: options.orbitCenterY ?? window.innerHeight * 0.35
        };
        this.orbitRadius = options.orbitRadius ?? 180;
        this.orbitSpeed = 0.0003 + Math.random() * 0.0002; // Radians per ms
        this.orbitAngle = options.startAngle ?? Math.random() * Math.PI * 2;
        this.orbitDirection = Math.random() > 0.5 ? 1 : -1;

        // Position (calculated from orbit)
        this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;

        // Size & Appearance
        this.baseSize = 30;
        this.size = 5; // Start small, grow
        this.maxSize = this.baseSize + Math.random() * 10;
        this.opacity = 0;
        this.rotation = 0;
        this.rotationSpeed = 0.001;

        // Life cycle
        this.age = 0;
        this.birthDuration = 3000; // 3 seconds to fully form
        this.isMature = false;

        // Health (survives multiple shooting star hits)
        this.maxHealth = 3; // Takes 3 hits to destroy
        this.health = this.maxHealth;
        this.isHurt = false;
        this.hurtTimer = 0;
        this.hurtDuration = 500;

        // Protection zone
        this.protectionRadius = this.type.protectionRadius;
        this.healingRate = this.type.healingRate;

        // Gravity well - gentle pull toward planet
        this.gravityRadius = this.protectionRadius * 2.5; // Extends beyond protection
        this.gravityStrength = 0.015; // Gentle pull
        this.orbitDistance = this.size * 1.5; // Ideal orbit distance (won't pull closer than this)

        // Evolution accelerator - planets help fireflies evolve
        this.evolutionBoostRate = 0.002; // Passive evolution progress per second in protection zone
        this.evolutionMultiplier = 2.0; // Collision evolution counts 2x near planet

        // Spawning grounds - planets birth new fireflies
        this.spawnInterval = 15000 + Math.random() * 10000; // 15-25 seconds between spawns
        this.spawnTimer = this.spawnInterval * 0.5; // Start halfway to first spawn
        this.spawnChance = 0.7; // 70% chance to actually spawn when timer fires
        this.digitBias = 0.75; // 75% chance to spawn same digit as planet type

        // Callback for spawning (set by ecosystem)
        this.onSpawnRequest = null;

        // Resource Moons - energy particle generation
        this.particleSpawnRate = 2000 + Math.random() * 1000; // 2-3 seconds between particles
        this.particleTimer = this.particleSpawnRate * Math.random(); // Stagger initial spawns
        this.maxParticles = 8; // Max particles per planet
        this.particles = []; // Active energy particles
        this.particleLifespan = 8000; // 8 seconds before particles fade
        this.particleDriftSpeed = 0.02; // How fast particles drift outward
        this.particleAbsorbRadius = 25; // Distance for firefly to absorb
        this.particleEnergyValue = 15; // Energy restored when absorbed

        // Visual pulse
        this.pulsePhase = Math.random() * Math.PI * 2;

        // DOM elements
        this.element = null;
        this.glowElement = null;

        // Sacrifice Echo - ghost of the creator Ascended
        this.echo = {
            active: false,
            digit: this.digit,       // Same digit as sacrificed Ascended
            orbitAngle: 0,
            orbitRadius: this.size * 2,
            orbitSpeed: 0.002,       // Slower than fireflies
            opacity: 0,
            maxOpacity: 0.6,
            fadeInDuration: 2000,    // 2 seconds to appear
            lifetime: 60000,         // 60 seconds before fading
            fadeOutDuration: 10000,  // 10 seconds to fade
            age: 0,
            element: null,
            trailElements: []
        };

        // Callbacks
        this.onDeath = null;
        this.onCollapse = null; // Called when planet becomes black hole

        // === PHASE 4: Planet Expansion ===

        // Moons - satellites orbiting this planet
        this.moons = [];
        this.maxMoons = 2; // Maximum moons per planet
        this.moonSpawnChance = 0.15; // 15% chance per spawn cycle
        this.moonSpawnInterval = 45000; // 45 seconds between moon spawn attempts
        this.moonSpawnTimer = this.moonSpawnInterval * 0.3; // Start earlier

        // Volcanic activity - periodic energy eruptions
        this.volcanic = {
            active: false,
            intensity: 0,           // 0-1, builds up over time
            buildUpRate: 0.00005,   // Per ms - slow buildup
            threshold: 0.8,         // Erupt when intensity reaches this
            eruptionDuration: 3000, // 3 second eruption
            eruptionTimer: 0,
            cooldownDuration: 30000, // 30 seconds between eruptions
            cooldownTimer: 0,
            particlesPerEruption: 12,
            energyBoostRadius: 150,
            energyBoostAmount: 25
        };

        // Enhanced lifecycle - planets can die of old age
        this.lifecycle = {
            maxAge: 300000 + Math.random() * 180000, // 5-8 minutes lifespan
            dyingAge: 0,              // Set when entering dying state
            dyingDuration: 15000,     // 15 seconds dying animation
            isDying: false,
            collapseToBlackHole: true // Ancient planets become black holes
        };

        // Age visual stages
        this.ageStage = 'young'; // young, mature, ancient, dying
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'planet young'; // Start as young
        this.element.id = this.id;

        // Multi-layer atmosphere (outer, middle, inner)
        this.atmosphereOuter = document.createElement('div');
        this.atmosphereOuter.className = 'planet-atmosphere planet-atmosphere-outer';
        this.element.appendChild(this.atmosphereOuter);

        this.atmosphereMiddle = document.createElement('div');
        this.atmosphereMiddle.className = 'planet-atmosphere planet-atmosphere-middle';
        this.element.appendChild(this.atmosphereMiddle);

        this.atmosphereInner = document.createElement('div');
        this.atmosphereInner.className = 'planet-atmosphere planet-atmosphere-inner';
        this.element.appendChild(this.atmosphereInner);

        // Outer glow (protection zone indicator)
        this.glowElement = document.createElement('div');
        this.glowElement.className = 'planet-glow';
        this.element.appendChild(this.glowElement);

        // Planet body
        this.bodyElement = document.createElement('div');
        this.bodyElement.className = 'planet-body';
        this.bodyElement.textContent = this.type.symbol;
        this.element.appendChild(this.bodyElement);

        // Ring container
        this.ringContainer = document.createElement('div');
        this.ringContainer.className = 'planet-ring-container';
        this.element.appendChild(this.ringContainer);

        // Multiple decorative rings
        this.rings = [];
        for (let i = 1; i <= 3; i++) {
            const ring = document.createElement('div');
            ring.className = `planet-ring planet-ring-${i}`;
            this.ringContainer.appendChild(ring);
            this.rings.push(ring);
        }

        // Debris ring (orbiting particles)
        this.debrisRing = document.createElement('div');
        this.debrisRing.className = 'planet-debris-ring';
        this.element.appendChild(this.debrisRing);

        this.updateElementStyle();
        container.appendChild(this.element);

        // Inject styles
        this.injectStyles();

        return this.element;
    }

    /**
     * Inject planet-specific CSS
     */
    injectStyles() {
        if (document.getElementById('planet-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'planet-styles';
        styles.textContent = `
            .planet {
                position: absolute;
                pointer-events: none;
                z-index: 8;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            /* Multi-layer atmosphere glow */
            .planet-atmosphere {
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
            }

            .planet-atmosphere-outer {
                background: radial-gradient(circle,
                    transparent 30%,
                    var(--planet-glow) 50%,
                    transparent 70%
                );
                opacity: 0.15;
                animation: atmospherePulse 4s ease-in-out infinite;
            }

            .planet-atmosphere-middle {
                background: radial-gradient(circle,
                    transparent 40%,
                    var(--planet-glow) 60%,
                    transparent 75%
                );
                opacity: 0.25;
                animation: atmospherePulse 3s ease-in-out infinite reverse;
            }

            .planet-atmosphere-inner {
                background: radial-gradient(circle,
                    var(--planet-glow) 0%,
                    transparent 60%
                );
                opacity: 0.4;
                animation: atmospherePulse 2.5s ease-in-out infinite;
            }

            .planet-glow {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle,
                    var(--planet-glow) 0%,
                    transparent 70%
                );
                opacity: 0.3;
                animation: planetPulse 3s ease-in-out infinite;
            }

            .planet-body {
                position: absolute;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%,
                    var(--planet-color) 0%,
                    color-mix(in srgb, var(--planet-color) 50%, black) 100%
                );
                box-shadow:
                    inset -5px -5px 15px rgba(0,0,0,0.5),
                    0 0 20px var(--planet-glow),
                    0 0 40px var(--planet-glow);
            }

            /* Decorative ring system - multiple rings with different angles */
            .planet-ring-container {
                position: absolute;
                pointer-events: none;
            }

            .planet-ring {
                position: absolute;
                border-radius: 50%;
                border: 1px solid var(--planet-color);
                opacity: 0.15;
                pointer-events: none;
            }

            .planet-ring-1 {
                transform: rotateX(75deg) rotateZ(15deg);
                border-style: solid;
                opacity: 0.12;
            }

            .planet-ring-2 {
                transform: rotateX(70deg) rotateZ(-10deg);
                border-style: dashed;
                opacity: 0.08;
            }

            .planet-ring-3 {
                transform: rotateX(65deg) rotateZ(5deg);
                border-style: dotted;
                opacity: 0.1;
            }

            /* Orbital debris ring */
            .planet-debris-ring {
                position: absolute;
                border-radius: 50%;
                border: 2px dotted var(--planet-color);
                opacity: 0.06;
                transform: rotateX(72deg);
                animation: debrisRotate 20s linear infinite;
            }

            .planet.hurt .planet-body {
                animation: planetHurt 0.1s ease-in-out 3;
            }

            /* Planet age stages */
            .planet.young .planet-body {
                box-shadow:
                    inset -3px -3px 10px rgba(0,0,0,0.3),
                    0 0 15px var(--planet-glow);
            }

            .planet.mature .planet-body {
                box-shadow:
                    inset -5px -5px 15px rgba(0,0,0,0.5),
                    0 0 25px var(--planet-glow),
                    0 0 50px var(--planet-glow);
            }

            .planet.ancient .planet-body {
                box-shadow:
                    inset -6px -6px 20px rgba(0,0,0,0.6),
                    0 0 30px var(--planet-glow),
                    0 0 60px var(--planet-glow),
                    0 0 80px var(--planet-glow);
            }

            .planet.ancient .planet-ring {
                opacity: 0.25;
            }

            @keyframes planetPulse {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.1); opacity: 0.5; }
            }

            @keyframes atmospherePulse {
                0%, 100% { transform: scale(1); opacity: var(--atmo-opacity, 0.2); }
                50% { transform: scale(1.05); opacity: calc(var(--atmo-opacity, 0.2) * 1.3); }
            }

            @keyframes debrisRotate {
                from { transform: rotateX(72deg) rotateZ(0deg); }
                to { transform: rotateX(72deg) rotateZ(360deg); }
            }

            @keyframes planetHurt {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(0.9); filter: brightness(2); }
            }

            /* Phase 4: Volcanic eruption state */
            .planet.erupting .planet-body {
                animation: eruption 0.3s ease-in-out infinite;
                box-shadow:
                    inset -5px -5px 15px rgba(0,0,0,0.5),
                    0 0 30px var(--planet-glow),
                    0 0 50px var(--planet-glow),
                    0 0 70px rgba(255, 100, 50, 0.6) !important;
            }

            .planet.erupting .planet-glow {
                animation: eruptionGlow 0.5s ease-in-out infinite;
            }

            @keyframes eruption {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.05) rotate(-2deg); }
                75% { transform: scale(0.98) rotate(2deg); }
            }

            @keyframes eruptionGlow {
                0%, 100% { opacity: 0.4; transform: scale(1); }
                50% { opacity: 0.8; transform: scale(1.2); }
            }

            /* Phase 4: Dying planet state */
            .planet.dying .planet-body {
                animation: dyingPulse 1s ease-in-out infinite;
                filter: saturate(0.5) brightness(0.7);
            }

            .planet.dying .planet-glow {
                animation: dyingGlow 2s ease-in-out infinite;
                filter: hue-rotate(30deg);
            }

            .planet.dying .planet-atmosphere {
                opacity: 0.05 !important;
            }

            .planet.dying .planet-ring {
                opacity: 0.1;
            }

            @keyframes dyingPulse {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(0.95); opacity: 0.6; }
            }

            @keyframes dyingGlow {
                0%, 100% { opacity: 0.2; filter: hue-rotate(0deg); }
                50% { opacity: 0.4; filter: hue-rotate(60deg); }
            }

            /* Volcanic particles */
            .volcanic-particle {
                animation: volcanicFloat 0.5s ease-out;
            }

            @keyframes volcanicFloat {
                from { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Update DOM styles
     */
    updateElementStyle() {
        if (!this.element) return;

        const glowSize = this.protectionRadius * 2;

        // Position
        this.element.style.left = (this.x - glowSize / 2) + 'px';
        this.element.style.top = (this.y - glowSize / 2) + 'px';
        this.element.style.width = glowSize + 'px';
        this.element.style.height = glowSize + 'px';
        this.element.style.opacity = this.opacity;

        // CSS variables for colors
        this.element.style.setProperty('--planet-color', this.type.color);
        this.element.style.setProperty('--planet-glow', this.type.glowColor);

        // Atmosphere layers (scale with planet size and age)
        const atmosphereScale = this.isMature ? 1.2 : 0.8;
        const atmoSize = glowSize * atmosphereScale;

        if (this.atmosphereOuter) {
            this.atmosphereOuter.style.width = (atmoSize * 1.4) + 'px';
            this.atmosphereOuter.style.height = (atmoSize * 1.4) + 'px';
            this.atmosphereOuter.style.left = (glowSize / 2 - atmoSize * 0.7) + 'px';
            this.atmosphereOuter.style.top = (glowSize / 2 - atmoSize * 0.7) + 'px';
        }

        if (this.atmosphereMiddle) {
            this.atmosphereMiddle.style.width = (atmoSize * 1.2) + 'px';
            this.atmosphereMiddle.style.height = (atmoSize * 1.2) + 'px';
            this.atmosphereMiddle.style.left = (glowSize / 2 - atmoSize * 0.6) + 'px';
            this.atmosphereMiddle.style.top = (glowSize / 2 - atmoSize * 0.6) + 'px';
        }

        if (this.atmosphereInner) {
            this.atmosphereInner.style.width = atmoSize + 'px';
            this.atmosphereInner.style.height = atmoSize + 'px';
            this.atmosphereInner.style.left = (glowSize / 2 - atmoSize * 0.5) + 'px';
            this.atmosphereInner.style.top = (glowSize / 2 - atmoSize * 0.5) + 'px';
        }

        // Glow (protection zone)
        this.glowElement.style.width = glowSize + 'px';
        this.glowElement.style.height = glowSize + 'px';

        // Body
        this.bodyElement.style.width = this.size + 'px';
        this.bodyElement.style.height = this.size + 'px';
        this.bodyElement.style.fontSize = (this.size * 0.6) + 'px';
        this.bodyElement.style.color = '#fff';
        this.bodyElement.style.transform = `rotate(${this.rotation}rad)`;
        this.bodyElement.style.left = (glowSize / 2 - this.size / 2) + 'px';
        this.bodyElement.style.top = (glowSize / 2 - this.size / 2) + 'px';

        // Ring container - centered on planet body
        if (this.ringContainer) {
            this.ringContainer.style.width = (this.size * 2) + 'px';
            this.ringContainer.style.height = (this.size * 2) + 'px';
            this.ringContainer.style.left = (glowSize / 2 - this.size) + 'px';
            this.ringContainer.style.top = (glowSize / 2 - this.size) + 'px';
        }

        // Multiple decorative rings at different distances
        if (this.rings) {
            const ringSizes = [1.6, 1.9, 2.2]; // Multipliers for different ring distances
            this.rings.forEach((ring, i) => {
                const ringSize = this.size * ringSizes[i];
                ring.style.width = ringSize + 'px';
                ring.style.height = ringSize + 'px';
                ring.style.left = (this.size - ringSize / 2) + 'px';
                ring.style.top = (this.size - ringSize / 2) + 'px';
            });
        }

        // Debris ring
        if (this.debrisRing) {
            const debrisSize = this.size * 2.5;
            this.debrisRing.style.width = debrisSize + 'px';
            this.debrisRing.style.height = debrisSize + 'px';
            this.debrisRing.style.left = (glowSize / 2 - debrisSize / 2) + 'px';
            this.debrisRing.style.top = (glowSize / 2 - debrisSize / 2) + 'px';
        }

        // Age-based class updates
        this.updateAgeClass();

        // Hurt state
        if (this.isHurt) {
            this.element.classList.add('hurt');
        } else {
            this.element.classList.remove('hurt');
        }
    }

    /**
     * Update age-based visual class
     */
    updateAgeClass() {
        if (!this.element) return;

        // Age thresholds (in milliseconds)
        const youngThreshold = 30000;  // 30 seconds
        const ancientThreshold = 120000; // 2 minutes

        this.element.classList.remove('young', 'mature', 'ancient');

        if (this.age < youngThreshold) {
            this.element.classList.add('young');
        } else if (this.age >= ancientThreshold) {
            this.element.classList.add('ancient');
        } else {
            this.element.classList.add('mature');
        }
    }

    /**
     * Main update loop
     */
    update(deltaTime) {
        this.age += deltaTime;

        // Birth animation
        if (!this.isMature) {
            const birthProgress = Math.min(this.age / this.birthDuration, 1);
            const easeProgress = 1 - Math.pow(1 - birthProgress, 3);

            this.opacity = easeProgress;
            this.size = this.maxSize * easeProgress;

            if (birthProgress >= 1) {
                this.isMature = true;
            }
        }

        // Update orbit
        this.orbitAngle += this.orbitSpeed * deltaTime * this.orbitDirection;
        this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius;

        // Rotation
        this.rotation += this.rotationSpeed * deltaTime;

        // Pulse
        this.pulsePhase += 0.002 * deltaTime;

        // Hurt timer
        if (this.isHurt) {
            this.hurtTimer -= deltaTime;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }

        // Spawning timer (only when mature)
        if (this.isMature) {
            this.spawnTimer -= deltaTime;
            if (this.spawnTimer <= 0) {
                this.trySpawnFirefly();
                this.spawnTimer = this.spawnInterval; // Reset timer
            }

            // Resource particle spawning
            this.particleTimer -= deltaTime;
            if (this.particleTimer <= 0 && this.particles.length < this.maxParticles) {
                this.spawnParticle();
                this.particleTimer = this.particleSpawnRate;
            }
        }

        // Update existing particles
        this.updateParticles(deltaTime);

        // Update sacrifice echo (ghost of creator)
        this.updateEcho(deltaTime);

        // === PHASE 4: New systems ===

        // Update moons
        this.updateMoons(deltaTime, this.age);

        // Moon spawning (only mature planets)
        if (this.isMature && this.moons.length < this.maxMoons) {
            this.moonSpawnTimer -= deltaTime;
            if (this.moonSpawnTimer <= 0) {
                this.trySpawnMoon();
                this.moonSpawnTimer = this.moonSpawnInterval;
            }
        }

        // Update volcanic activity
        this.updateVolcanic(deltaTime);

        // Check lifecycle / aging
        this.updateLifecycle(deltaTime);

        this.updateElementStyle();
    }

    /**
     * Update all moons
     */
    updateMoons(deltaTime, timestamp) {
        for (const moon of this.moons) {
            moon.update(deltaTime, timestamp);
        }
    }

    /**
     * Attempt to spawn a moon
     */
    trySpawnMoon() {
        if (Math.random() > this.moonSpawnChance) return;
        if (typeof Moon === 'undefined') return;

        // Spawn moon at random orbit radius
        const orbitRadius = this.size * 1.5 + Math.random() * 20;

        const moon = new Moon({
            planet: this,
            orbitRadius: orbitRadius
        });

        this.moons.push(moon);

        // Create DOM element if planet has container
        if (this.element && this.element.parentNode) {
            moon.createElement(this.element.parentNode);
        }

        console.log(`🌙 Moon spawned: ${moon.type.name} orbiting ${this.type.name}`);
    }

    /**
     * Update volcanic activity
     */
    updateVolcanic(deltaTime) {
        if (!this.isMature) return;

        const v = this.volcanic;

        // Cooldown after eruption
        if (v.cooldownTimer > 0) {
            v.cooldownTimer -= deltaTime;
            v.intensity = 0;
            return;
        }

        // Currently erupting
        if (v.active) {
            v.eruptionTimer -= deltaTime;
            if (v.eruptionTimer <= 0) {
                // End eruption
                v.active = false;
                v.intensity = 0;
                v.cooldownTimer = v.cooldownDuration;

                // Remove eruption visual
                if (this.element) {
                    this.element.classList.remove('erupting');
                }
            }
            return;
        }

        // Build up volcanic pressure
        v.intensity += v.buildUpRate * deltaTime;

        // Trigger eruption
        if (v.intensity >= v.threshold) {
            this.triggerEruption();
        }
    }

    /**
     * Trigger a volcanic eruption
     */
    triggerEruption() {
        const v = this.volcanic;
        v.active = true;
        v.eruptionTimer = v.eruptionDuration;

        // Visual effect
        if (this.element) {
            this.element.classList.add('erupting');
        }

        // Spawn burst of particles
        for (let i = 0; i < v.particlesPerEruption; i++) {
            setTimeout(() => {
                this.spawnVolcanicParticle();
            }, i * 100);
        }

        console.log(`🌋 ${this.type.name} eruption!`);
    }

    /**
     * Spawn a volcanic energy particle (more energetic than normal)
     */
    spawnVolcanicParticle() {
        const angle = Math.random() * Math.PI * 2;
        const startDist = this.size * 0.5;
        const velocity = 0.08 + Math.random() * 0.04; // Faster than normal particles

        const particle = {
            id: 'volcanic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            x: this.x + Math.cos(angle) * startDist,
            y: this.y + Math.sin(angle) * startDist,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            angle: angle,
            distance: startDist,
            age: 0,
            maxAge: 4000, // Shorter lifespan
            element: null,
            absorbed: false,
            isVolcanic: true,
            energyValue: this.volcanic.energyBoostAmount
        };

        this.createVolcanicParticleElement(particle);
        this.particles.push(particle);
    }

    /**
     * Create volcanic particle DOM element (brighter, more intense)
     */
    createVolcanicParticleElement(particle) {
        if (!this.element) return;

        const el = document.createElement('div');
        el.className = 'planet-particle volcanic-particle';
        el.id = particle.id;
        el.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: radial-gradient(circle, #fff 0%, ${this.type.color} 50%, transparent 100%);
            box-shadow: 0 0 15px ${this.type.color}, 0 0 25px ${this.type.glowColor}, 0 0 35px rgba(255, 100, 50, 0.5);
            pointer-events: none;
            z-index: 7;
            left: ${particle.x}px;
            top: ${particle.y}px;
            transform: translate(-50%, -50%);
        `;

        document.body.appendChild(el);
        particle.element = el;
    }

    /**
     * Update planet lifecycle - handle aging and death
     */
    updateLifecycle(deltaTime) {
        const lc = this.lifecycle;

        // Update age stage
        this.updateAgeStage();

        // Check if entering dying phase
        if (!lc.isDying && this.age >= lc.maxAge) {
            this.startDying();
        }

        // If dying, progress toward death
        if (lc.isDying) {
            const dyingProgress = (this.age - lc.dyingAge) / lc.dyingDuration;

            // Visual fade
            this.opacity = Math.max(0.2, 1 - dyingProgress * 0.8);

            // Shrink slightly
            this.size = this.maxSize * (1 - dyingProgress * 0.3);

            // Increase instability (wobble)
            this.orbitSpeed += Math.sin(this.age * 0.01) * 0.00001 * dyingProgress;

            if (dyingProgress >= 1) {
                this.collapse();
            }
        }
    }

    /**
     * Update age stage for visuals
     */
    updateAgeStage() {
        const youngThreshold = 30000;     // 30 seconds
        const matureThreshold = 60000;    // 1 minute
        const ancientThreshold = this.lifecycle.maxAge * 0.7; // 70% of lifespan

        let newStage = 'young';
        if (this.lifecycle.isDying) {
            newStage = 'dying';
        } else if (this.age >= ancientThreshold) {
            newStage = 'ancient';
        } else if (this.age >= matureThreshold) {
            newStage = 'mature';
        }

        if (newStage !== this.ageStage) {
            this.ageStage = newStage;
            if (this.element) {
                this.element.classList.remove('young', 'mature', 'ancient', 'dying');
                this.element.classList.add(this.ageStage);
            }
        }
    }

    /**
     * Begin the dying process
     */
    startDying() {
        this.lifecycle.isDying = true;
        this.lifecycle.dyingAge = this.age;

        // Stop spawning
        this.spawnChance = 0;

        // Visual feedback
        if (this.element) {
            this.element.classList.add('dying');
        }

        console.log(`💀 ${this.type.name} entering death phase...`);
    }

    /**
     * Planet collapses - either dies or becomes black hole
     */
    collapse() {
        if (this.lifecycle.collapseToBlackHole && this.onCollapse) {
            // Signal to ecosystem to create a mini black hole
            this.onCollapse(this);
        }

        // Trigger death callback
        this.die();
    }

    /**
     * Spawn the sacrifice echo - called when planet is created
     */
    spawnEcho() {
        this.echo.active = true;
        this.echo.age = 0;
        this.echo.opacity = 0;
        this.echo.orbitAngle = Math.random() * Math.PI * 2;
        this.echo.orbitRadius = this.maxSize * 1.5;

        // Create echo DOM element
        this.createEchoElement();
    }

    /**
     * Create DOM element for the sacrifice echo
     */
    createEchoElement() {
        if (this.echo.element) return;

        const el = document.createElement('div');
        el.className = 'planet-echo';
        el.id = this.id + '_echo';
        el.textContent = this.echo.digit;

        el.style.cssText = `
            position: absolute;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            color: #22c55e;
            text-shadow:
                0 0 10px rgba(34, 197, 94, 0.8),
                0 0 20px rgba(34, 197, 94, 0.6),
                0 0 40px rgba(34, 197, 94, 0.4);
            pointer-events: none;
            z-index: 9;
            transform: translate(-50%, -50%);
            transition: opacity 0.5s ease;
        `;

        document.body.appendChild(el);
        this.echo.element = el;

        // Create trail elements (afterimage effect)
        for (let i = 0; i < 3; i++) {
            const trail = document.createElement('div');
            trail.className = 'planet-echo-trail';
            trail.textContent = this.echo.digit;
            trail.style.cssText = `
                position: absolute;
                font-family: 'Courier New', monospace;
                font-size: ${14 - i * 2}px;
                font-weight: bold;
                color: #22c55e;
                text-shadow: 0 0 ${10 - i * 3}px rgba(34, 197, 94, 0.5);
                pointer-events: none;
                z-index: 8;
                transform: translate(-50%, -50%);
                opacity: ${0.3 - i * 0.1};
            `;
            document.body.appendChild(trail);
            this.echo.trailElements.push({
                element: trail,
                angleOffset: (i + 1) * 0.3 // Trail behind
            });
        }
    }

    /**
     * Update sacrifice echo - orbit, fade in/out
     */
    updateEcho(deltaTime) {
        if (!this.echo.active) return;

        this.echo.age += deltaTime;

        // Calculate opacity based on lifecycle
        if (this.echo.age < this.echo.fadeInDuration) {
            // Fading in
            const progress = this.echo.age / this.echo.fadeInDuration;
            this.echo.opacity = progress * this.echo.maxOpacity;
        } else if (this.echo.age < this.echo.lifetime) {
            // Full visibility with gentle pulse
            const pulse = Math.sin(this.echo.age * 0.003) * 0.1;
            this.echo.opacity = this.echo.maxOpacity + pulse;
        } else if (this.echo.age < this.echo.lifetime + this.echo.fadeOutDuration) {
            // Fading out
            const fadeProgress = (this.echo.age - this.echo.lifetime) / this.echo.fadeOutDuration;
            this.echo.opacity = this.echo.maxOpacity * (1 - fadeProgress);
        } else {
            // Echo has faded completely
            this.echo.active = false;
            this.echo.opacity = 0;
            this.removeEchoElement();
            return;
        }

        // Update orbit
        this.echo.orbitAngle += this.echo.orbitSpeed * deltaTime;

        // Calculate position relative to planet
        const echoX = this.x + Math.cos(this.echo.orbitAngle) * this.echo.orbitRadius;
        const echoY = this.y + Math.sin(this.echo.orbitAngle) * this.echo.orbitRadius;

        // Update echo element
        if (this.echo.element) {
            this.echo.element.style.left = echoX + 'px';
            this.echo.element.style.top = echoY + 'px';
            this.echo.element.style.opacity = this.echo.opacity;

            // Gentle size pulse
            const sizePulse = 1 + Math.sin(this.echo.age * 0.005) * 0.1;
            this.echo.element.style.transform = `translate(-50%, -50%) scale(${sizePulse})`;
        }

        // Update trail elements (follow behind)
        for (const trail of this.echo.trailElements) {
            const trailAngle = this.echo.orbitAngle - trail.angleOffset;
            const trailX = this.x + Math.cos(trailAngle) * this.echo.orbitRadius;
            const trailY = this.y + Math.sin(trailAngle) * this.echo.orbitRadius;

            trail.element.style.left = trailX + 'px';
            trail.element.style.top = trailY + 'px';
            trail.element.style.opacity = this.echo.opacity * 0.5;
        }
    }

    /**
     * Remove echo DOM elements
     */
    removeEchoElement() {
        if (this.echo.element && this.echo.element.parentNode) {
            this.echo.element.parentNode.removeChild(this.echo.element);
        }
        this.echo.element = null;

        for (const trail of this.echo.trailElements) {
            if (trail.element && trail.element.parentNode) {
                trail.element.parentNode.removeChild(trail.element);
            }
        }
        this.echo.trailElements = [];
    }

    /**
     * Attempt to spawn a new firefly from this planet
     */
    trySpawnFirefly() {
        // Random chance check
        if (Math.random() > this.spawnChance) return;

        // Need callback to actually spawn
        if (!this.onSpawnRequest) return;

        // Determine digit - biased toward planet's type
        const digit = Math.random() < this.digitBias ? this.digit : (1 - this.digit);

        // Spawn position - at edge of planet, random angle
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDist = this.size * 0.8;
        const spawnX = this.x + Math.cos(spawnAngle) * spawnDist;
        const spawnY = this.y + Math.sin(spawnAngle) * spawnDist;

        // Request spawn from ecosystem
        this.onSpawnRequest({
            x: spawnX,
            y: spawnY,
            digit: digit,
            fromPlanet: this.id,
            // Give spawned fireflies a gentle push outward
            initialVx: Math.cos(spawnAngle) * 0.5,
            initialVy: Math.sin(spawnAngle) * 0.5
        });
    }

    /**
     * Spawn an energy particle from the planet surface
     */
    spawnParticle() {
        const angle = Math.random() * Math.PI * 2;
        const startDist = this.size * 0.6; // Start at planet surface

        const particle = {
            id: 'particle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            x: this.x + Math.cos(angle) * startDist,
            y: this.y + Math.sin(angle) * startDist,
            angle: angle, // Direction of drift
            distance: startDist, // Current distance from planet center
            age: 0,
            maxAge: this.particleLifespan,
            element: null,
            absorbed: false
        };

        // Create DOM element
        this.createParticleElement(particle);
        this.particles.push(particle);
    }

    /**
     * Create DOM element for a particle
     */
    createParticleElement(particle) {
        if (!this.element) return;

        const el = document.createElement('div');
        el.className = 'planet-particle';
        el.id = particle.id;
        el.style.position = 'absolute';
        el.style.width = '6px';
        el.style.height = '6px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = this.type.color;
        el.style.boxShadow = `0 0 8px ${this.type.color}, 0 0 15px ${this.type.glowColor}`;
        el.style.pointerEvents = 'none';
        el.style.zIndex = '7';

        // Position relative to viewport (same as planet)
        el.style.left = particle.x + 'px';
        el.style.top = particle.y + 'px';
        el.style.transform = 'translate(-50%, -50%)';

        // Add to document body (not planet element, since planet position changes)
        document.body.appendChild(el);
        particle.element = el;
    }

    /**
     * Update all particles - drift, age, fade
     */
    updateParticles(deltaTime) {
        const toRemove = [];

        for (const particle of this.particles) {
            particle.age += deltaTime;

            // Check if expired or absorbed
            if (particle.age >= particle.maxAge || particle.absorbed) {
                toRemove.push(particle);
                continue;
            }

            // Drift outward from planet center
            particle.distance += this.particleDriftSpeed * deltaTime;

            // Add gentle wobble
            const wobble = Math.sin(particle.age * 0.003) * 0.3;
            particle.angle += wobble * 0.01;

            // Calculate new position (relative to current planet position)
            particle.x = this.x + Math.cos(particle.angle) * particle.distance;
            particle.y = this.y + Math.sin(particle.angle) * particle.distance;

            // Update visual
            if (particle.element) {
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';

                // Fade based on age
                const lifeProgress = particle.age / particle.maxAge;
                const opacity = 1 - (lifeProgress * lifeProgress); // Quadratic fade
                particle.element.style.opacity = opacity;

                // Shrink slightly as it ages
                const scale = 1 - (lifeProgress * 0.3);
                particle.element.style.transform = `translate(-50%, -50%) scale(${scale})`;
            }
        }

        // Remove expired/absorbed particles
        for (const particle of toRemove) {
            this.removeParticle(particle);
        }
    }

    /**
     * Remove a particle and its DOM element
     */
    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
        if (particle.element && particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
        }
    }

    /**
     * Check if a firefly can absorb any particles
     * @returns {number} Energy gained from absorbed particles
     */
    checkParticleAbsorption(firefly) {
        if (!this.isMature) return 0;
        if (firefly.state !== 'mature') return 0;

        let energyGained = 0;

        for (const particle of this.particles) {
            if (particle.absorbed) continue;

            const dx = firefly.x - particle.x;
            const dy = firefly.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.particleAbsorbRadius) {
                particle.absorbed = true;
                energyGained += this.particleEnergyValue;

                // Flash effect on absorption
                if (particle.element) {
                    particle.element.style.transform = 'translate(-50%, -50%) scale(2)';
                    particle.element.style.opacity = '1';
                }
            }
        }

        return energyGained;
    }

    /**
     * Check if a position is within protection zone
     */
    isInProtectionZone(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.protectionRadius;
    }

    /**
     * Heal a firefly that's in the protection zone
     */
    healFirefly(firefly, deltaTime) {
        if (!this.isMature) return;

        if (this.isInProtectionZone(firefly.x, firefly.y)) {
            firefly.energy = Math.min(100, firefly.energy + this.healingRate * (deltaTime / 1000));
        }
    }

    /**
     * Apply gravitational pull to a firefly
     * Creates gentle orbiting behavior around the planet
     */
    applyGravity(firefly) {
        if (!this.isMature) return;
        if (firefly.state !== 'mature') return;

        const dx = this.x - firefly.x;
        const dy = this.y - firefly.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only affect fireflies within gravity radius
        if (distance > this.gravityRadius) return;

        // Don't pull fireflies that are too close (prevents clustering on planet)
        if (distance < this.orbitDistance) {
            // Gentle push outward if too close
            const pushStrength = 0.01;
            firefly.applyForce(
                -(dx / distance) * pushStrength,
                -(dy / distance) * pushStrength
            );
            return;
        }

        // Calculate gravity strength (stronger when closer, but with falloff)
        const falloff = 1 - (distance / this.gravityRadius);
        const strength = this.gravityStrength * falloff * falloff; // Quadratic falloff

        // Apply tangential force for orbital motion (not just straight pull)
        // This creates graceful spiraling/orbiting rather than direct collision
        const tangentX = -dy / distance; // Perpendicular to radius
        const tangentY = dx / distance;

        // Mix of radial pull (toward planet) and tangential push (orbital)
        const radialRatio = 0.6; // 60% pull toward, 40% orbital tangent
        const forceX = (dx / distance) * strength * radialRatio + tangentX * strength * (1 - radialRatio);
        const forceY = (dy / distance) * strength * radialRatio + tangentY * strength * (1 - radialRatio);

        firefly.applyForce(forceX, forceY);

        // Mark firefly as being in planet's influence (for visual feedback)
        firefly.nearPlanet = this.id;
    }

    /**
     * Apply evolution acceleration to fireflies in protection zone
     * - Passive evolution progress over time
     * - Marks firefly for boosted collision evolution
     */
    applyEvolutionBoost(firefly, deltaTime) {
        if (!this.isMature) return;
        if (firefly.state !== 'mature') return;

        // Only in protection zone
        if (!this.isInProtectionZone(firefly.x, firefly.y)) {
            return;
        }

        // Passive evolution progress (slow but steady)
        // Fireflies gain evolution points just by being near the planet
        const passiveGain = this.evolutionBoostRate * (deltaTime / 1000);
        firefly.evolutionProgress = (firefly.evolutionProgress || 0) + passiveGain;

        // Mark for boosted collision evolution
        // The Firefly's handleCollision will check this multiplier
        firefly.evolutionMultiplier = this.evolutionMultiplier;

        // Check if passive evolution triggered a tier-up
        if (firefly.evolutionProgress >= firefly.tier.evolveThreshold) {
            firefly.evolve();
        }
    }

    /**
     * Apply elemental power effects to fireflies in protection zone
     * - Null World (0): Time Dilation - aging slows down
     * - Unity Sphere (1): Energize - faster movement, brighter glow
     */
    applyElementalPower(firefly, deltaTime) {
        if (!this.isMature) return;
        if (firefly.state !== 'mature') return;

        // Only apply in protection zone
        if (!this.isInProtectionZone(firefly.x, firefly.y)) {
            return;
        }

        // Apply based on elemental type
        if (this.type.elementalPower === 'timeDilation') {
            // TIME DILATION (Null World / 0)
            // Reduce the effective time passed for this firefly's aging
            // The firefly will receive this factor and apply it to its age increment
            firefly.timeDilationFactor = this.type.timeDilationFactor;

            // Visual feedback - subtle cyan shimmer
            firefly.elementalEffect = 'timeDilation';
            firefly.elementalColor = this.type.color;

        } else if (this.type.elementalPower === 'energize') {
            // ENERGIZE (Unity Sphere / 1)
            // Boost speed multiplier
            firefly.speedMultiplier = (firefly.speedMultiplier || 1) * this.type.energizeSpeedBoost;

            // Increase brightness
            firefly.brightnessBoost = this.type.energizeBrightness;

            // Visual feedback - golden energize effect
            firefly.elementalEffect = 'energize';
            firefly.elementalColor = this.type.color;
        }
    }

    /**
     * Check if shooting star hits the planet
     */
    checkStarCollision(star) {
        const dx = this.x - star.x;
        const dy = this.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < this.size;
    }

    /**
     * Take damage from shooting star
     */
    takeDamage() {
        this.health--;
        this.isHurt = true;
        this.hurtTimer = this.hurtDuration;

        if (this.health <= 0) {
            this.die();
        }
    }

    /**
     * Planet death
     */
    die() {
        if (this.onDeath) {
            this.onDeath(this);
        }
    }

    /**
     * Get state info
     */
    getStateInfo() {
        return {
            id: this.id,
            type: this.type.name,
            digit: this.digit,
            health: this.health,
            position: { x: Math.round(this.x), y: Math.round(this.y) },
            age: Math.round(this.age / 1000),
            isMature: this.isMature
        };
    }

    /**
     * Get effective protection radius (including shield moon bonus)
     */
    getEffectiveProtectionRadius() {
        let radius = this.protectionRadius;

        // Add shield moon bonus
        for (const moon of this.moons) {
            radius += moon.getShieldBonus();
        }

        return radius;
    }

    /**
     * Apply moon effects to fireflies
     */
    applyMoonEffects(firefly) {
        for (const moon of this.moons) {
            // Beacon attraction
            moon.applyBeaconAttraction(firefly);

            // Ancient moon evolution boost
            if (moon.isInEvolutionZone(firefly)) {
                firefly.evolutionMultiplier = (firefly.evolutionMultiplier || 1) * moon.evolutionMultiplier;
            }
        }
    }

    /**
     * Clean up
     */
    destroy() {
        // Clean up all moons
        for (const moon of this.moons) {
            moon.destroy();
        }
        this.moons = [];

        // Clean up all particles
        for (const particle of this.particles) {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        }
        this.particles = [];

        // Clean up sacrifice echo
        this.removeEchoElement();

        // Clean up planet element
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Planet;
}
