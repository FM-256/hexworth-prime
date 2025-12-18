/**
 * ShadowFirefly.js - Dark Variant Entity
 *
 * Shadow fireflies are corrupted digizens that spread darkness:
 * - Appear as dark, inverted versions of normal fireflies
 * - Convert nearby 0s into shadows (contagion effect)
 * - Immune to black hole gravity
 * - Avoid light sources and planets
 * - Can be "purified" by Golden fireflies or planet energy
 *
 * They represent entropy in the digital ecosystem.
 */

class ShadowFirefly {
    static CONFIG = {
        // Appearance
        symbol: '▼',
        color: '#1a1a2e',              // Dark purple-black
        glowColor: 'rgba(75, 0, 130, 0.6)', // Indigo glow
        secondaryGlow: 'rgba(139, 0, 139, 0.4)', // Dark magenta

        // Stats
        baseSpeed: 0.04,
        size: 14,
        maxEnergy: 150,                // Higher energy than normal
        energyDecayRate: 0.02,         // Slower decay

        // Conversion
        conversionRadius: 60,          // Range to convert 0s
        conversionChance: 0.003,       // Per frame chance to convert nearby 0
        conversionCooldown: 5000,      // ms between conversions

        // Immunity
        blackHoleImmunity: 0.9,        // 90% gravity resistance
        planetAvoidance: 150,          // Distance to avoid planets

        // Purification
        purifyThreshold: 3,            // Golden touches needed to purify
        purifyByEnergy: 200,           // Energy absorbed from planet to purify

        // Spawning
        spawnChance: 0.0001,           // Very rare natural spawn
        maxPopulation: 3               // Max shadows at once
    };

    constructor(options = {}) {
        // Identity
        this.id = 'shadow_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Position
        this.x = options.x ?? Math.random() * window.innerWidth;
        this.y = options.y ?? Math.random() * window.innerHeight;

        // Movement
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.baseSpeed = ShadowFirefly.CONFIG.baseSpeed;

        // Appearance
        this.size = ShadowFirefly.CONFIG.size;
        this.opacity = 0;
        this.targetOpacity = 0.9;
        this.pulsePhase = Math.random() * Math.PI * 2;

        // State
        this.age = 0;
        this.energy = ShadowFirefly.CONFIG.maxEnergy;
        this.state = 'spawning'; // spawning, active, fleeing, purifying, dead

        // Conversion tracking
        this.conversionTimer = 0;
        this.conversionsCount = 0;

        // Purification tracking
        this.goldenTouches = 0;
        this.planetEnergyAbsorbed = 0;
        this.isPurifying = false;
        this.purifyProgress = 0;

        // Visual effects
        this.trailPoints = [];
        this.maxTrailPoints = 8;
        this.corruptionParticles = [];

        // DOM
        this.element = null;
        this.glowElement = null;

        // Callbacks
        this.onConvert = null;  // Called when converting a firefly
        this.onPurify = null;   // Called when purified
        this.onDeath = null;
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'shadow-firefly';
        this.element.id = this.id;

        // Inner body
        this.bodyElement = document.createElement('div');
        this.bodyElement.className = 'shadow-body';
        this.bodyElement.textContent = ShadowFirefly.CONFIG.symbol;
        this.element.appendChild(this.bodyElement);

        // Dark aura
        this.auraElement = document.createElement('div');
        this.auraElement.className = 'shadow-aura';
        this.element.appendChild(this.auraElement);

        // Corruption tendrils (visual effect)
        this.tendrilsElement = document.createElement('div');
        this.tendrilsElement.className = 'shadow-tendrils';
        this.element.appendChild(this.tendrilsElement);

        this.updateElementStyle();
        container.appendChild(this.element);

        this.injectStyles();

        return this.element;
    }

    /**
     * Update visual style
     */
    updateElementStyle() {
        if (!this.element) return;

        const pulse = Math.sin(this.pulsePhase) * 0.15 + 1;
        const corruptPulse = Math.sin(this.pulsePhase * 2) * 0.1;

        this.element.style.cssText = `
            position: absolute;
            left: ${this.x}px;
            top: ${this.y}px;
            transform: translate(-50%, -50%);
            opacity: ${this.opacity};
            pointer-events: none;
            z-index: 12;
        `;

        if (this.bodyElement) {
            const cfg = ShadowFirefly.CONFIG;
            this.bodyElement.style.cssText = `
                font-size: ${this.size * pulse}px;
                color: ${cfg.color};
                text-shadow:
                    0 0 ${10 * pulse}px ${cfg.glowColor},
                    0 0 ${20 * pulse}px ${cfg.glowColor},
                    0 0 ${30 * pulse}px ${cfg.secondaryGlow};
                filter: ${this.isPurifying ? 'brightness(1.5) saturate(0.5)' : 'none'};
                transition: filter 0.3s;
            `;
        }

        if (this.auraElement) {
            const auraSize = this.size * 4;
            this.auraElement.style.cssText = `
                position: absolute;
                width: ${auraSize}px;
                height: ${auraSize}px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) scale(${1 + corruptPulse});
                background: radial-gradient(circle,
                    rgba(75, 0, 130, 0.3) 0%,
                    rgba(75, 0, 130, 0.1) 40%,
                    transparent 70%
                );
                border-radius: 50%;
                pointer-events: none;
            `;
        }
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp, ecosystem) {
        this.age += deltaTime;
        this.pulsePhase += deltaTime * 0.005;

        // State machine
        switch (this.state) {
            case 'spawning':
                this.updateSpawning(deltaTime);
                break;
            case 'active':
                this.updateActive(deltaTime, timestamp, ecosystem);
                break;
            case 'fleeing':
                this.updateFleeing(deltaTime, ecosystem);
                break;
            case 'purifying':
                this.updatePurifying(deltaTime);
                break;
        }

        // Energy decay
        this.energy -= ShadowFirefly.CONFIG.energyDecayRate * deltaTime;
        if (this.energy <= 0) {
            this.die();
        }

        this.updateElementStyle();
    }

    /**
     * Spawning state - fade in
     */
    updateSpawning(deltaTime) {
        const spawnDuration = 2000;
        const progress = Math.min(1, this.age / spawnDuration);

        this.opacity = this.targetOpacity * this.easeOutCubic(progress);

        if (progress >= 1) {
            this.state = 'active';
        }
    }

    /**
     * Active state - hunt and convert
     */
    updateActive(deltaTime, timestamp, ecosystem) {
        // Update conversion cooldown
        this.conversionTimer = Math.max(0, this.conversionTimer - deltaTime);

        // Avoid planets (light sources)
        this.avoidPlanets(ecosystem);

        // Hunt for 0s to convert
        this.huntFireflies(ecosystem);

        // Apply movement
        this.move(deltaTime);

        // Check for golden fireflies nearby (threat)
        this.checkGoldenThreat(ecosystem);

        // Try to convert nearby 0s
        if (this.conversionTimer <= 0) {
            this.tryConvert(ecosystem);
        }
    }

    /**
     * Fleeing state - run from golden fireflies
     */
    updateFleeing(deltaTime, ecosystem) {
        // Find nearest golden firefly and run away
        let nearestGolden = null;
        let nearestDist = Infinity;

        for (const firefly of ecosystem.fireflies) {
            if (firefly.rareType === 'golden') {
                const dist = this.distanceTo(firefly);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestGolden = firefly;
                }
            }
        }

        if (nearestGolden && nearestDist < 200) {
            // Run away
            const dx = this.x - nearestGolden.x;
            const dy = this.y - nearestGolden.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            this.vx += (dx / dist) * 0.005;
            this.vy += (dy / dist) * 0.005;
        } else {
            // No longer threatened
            this.state = 'active';
        }

        this.move(deltaTime);
    }

    /**
     * Purifying state - being cleansed
     */
    updatePurifying(deltaTime) {
        this.purifyProgress += deltaTime / 3000; // 3 seconds to purify

        // Visual feedback
        this.opacity = this.targetOpacity * (1 - this.purifyProgress * 0.5);

        if (this.purifyProgress >= 1) {
            this.purify();
        }
    }

    /**
     * Avoid planets (light sources)
     */
    avoidPlanets(ecosystem) {
        if (!ecosystem.planets) return;

        for (const planet of ecosystem.planets) {
            const dx = this.x - planet.x;
            const dy = this.y - planet.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ShadowFirefly.CONFIG.planetAvoidance) {
                // Push away from planet
                const force = 0.003 * (1 - dist / ShadowFirefly.CONFIG.planetAvoidance);
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;

                // Absorb planet energy (can lead to purification)
                if (dist < planet.protectionRadius) {
                    this.planetEnergyAbsorbed += 0.5;
                    if (this.planetEnergyAbsorbed >= ShadowFirefly.CONFIG.purifyByEnergy) {
                        this.startPurifying();
                    }
                }
            }
        }
    }

    /**
     * Hunt for 0s to convert
     */
    huntFireflies(ecosystem) {
        let nearestZero = null;
        let nearestDist = Infinity;

        for (const firefly of ecosystem.fireflies) {
            // Only hunt 0s that aren't already shadows
            if (firefly.digit === 0 && !firefly.isShadow && firefly.state === 'mature') {
                const dist = this.distanceTo(firefly);
                if (dist < nearestDist && dist < 300) {
                    nearestDist = dist;
                    nearestZero = firefly;
                }
            }
        }

        if (nearestZero) {
            // Move toward target
            const dx = nearestZero.x - this.x;
            const dy = nearestZero.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            this.vx += (dx / dist) * 0.002;
            this.vy += (dy / dist) * 0.002;
        }
    }

    /**
     * Try to convert a nearby 0 to a shadow
     */
    tryConvert(ecosystem) {
        const cfg = ShadowFirefly.CONFIG;

        for (const firefly of ecosystem.fireflies) {
            if (firefly.digit !== 0 || firefly.isShadow || firefly.state !== 'mature') continue;

            const dist = this.distanceTo(firefly);
            if (dist > cfg.conversionRadius) continue;

            // Chance to convert
            if (Math.random() < cfg.conversionChance) {
                this.convertFirefly(firefly);
                this.conversionTimer = cfg.conversionCooldown;
                break;
            }
        }
    }

    /**
     * Convert a firefly to a shadow variant
     */
    convertFirefly(firefly) {
        firefly.isShadow = true;
        firefly.shadowLevel = 1;

        // Visual changes
        if (firefly.element) {
            firefly.element.classList.add('shadow-converted');
            firefly.element.style.filter = 'invert(0.8) hue-rotate(270deg)';
        }

        // Behavior changes
        firefly.energyDecayRate *= 0.5; // Slower decay
        firefly.blackHoleResistance = (firefly.blackHoleResistance || 0) + 0.5;

        this.conversionsCount++;
        this.energy += 20; // Gain energy from conversion

        // Callback
        if (this.onConvert) {
            this.onConvert(this, firefly);
        }

        console.log(`👤 Shadow converted firefly ${firefly.id}`);
    }

    /**
     * Check for golden fireflies (threat)
     */
    checkGoldenThreat(ecosystem) {
        for (const firefly of ecosystem.fireflies) {
            if (firefly.rareType !== 'golden') continue;

            const dist = this.distanceTo(firefly);

            // Golden fireflies are a threat
            if (dist < 100) {
                this.state = 'fleeing';

                // Golden touch - accumulate toward purification
                if (dist < 40) {
                    this.goldenTouches++;
                    if (this.goldenTouches >= ShadowFirefly.CONFIG.purifyThreshold) {
                        this.startPurifying();
                    }
                }
                return;
            }
        }
    }

    /**
     * Start the purification process
     */
    startPurifying() {
        if (this.state === 'purifying') return;

        this.state = 'purifying';
        this.isPurifying = true;
        this.purifyProgress = 0;

        if (this.element) {
            this.element.classList.add('purifying');
        }

        console.log(`✨ Shadow ${this.id} being purified...`);
    }

    /**
     * Complete purification - transform back to normal
     */
    purify() {
        // Create a normal firefly in its place
        if (this.onPurify) {
            this.onPurify(this);
        }

        this.die();
    }

    /**
     * Apply movement
     */
    move(deltaTime) {
        // Apply velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Speed limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.baseSpeed) {
            this.vx = (this.vx / speed) * this.baseSpeed;
            this.vy = (this.vy / speed) * this.baseSpeed;
        }

        // Boundary wrapping
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
    }

    /**
     * Apply gravity (mostly immune)
     */
    applyGravity(force) {
        const immunity = ShadowFirefly.CONFIG.blackHoleImmunity;
        this.vx += force.x * (1 - immunity);
        this.vy += force.y * (1 - immunity);
    }

    /**
     * Distance to another entity
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Easing function
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Die
     */
    die() {
        this.state = 'dead';

        if (this.onDeath) {
            this.onDeath(this);
        }
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('shadow-firefly-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'shadow-firefly-styles';
        styles.textContent = `
            .shadow-firefly {
                will-change: transform, opacity;
            }

            .shadow-body {
                position: relative;
                z-index: 2;
                animation: shadowPulse 2s ease-in-out infinite;
            }

            .shadow-aura {
                animation: shadowAura 3s ease-in-out infinite;
            }

            .shadow-tendrils {
                position: absolute;
                width: 100%;
                height: 100%;
                left: 0;
                top: 0;
                background: radial-gradient(ellipse at center,
                    transparent 30%,
                    rgba(75, 0, 130, 0.2) 60%,
                    transparent 80%
                );
                animation: tendrilsRotate 4s linear infinite;
            }

            @keyframes shadowPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes shadowAura {
                0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
                50% { opacity: 0.9; transform: translate(-50%, -50%) scale(1.2); }
            }

            @keyframes tendrilsRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .shadow-firefly.purifying .shadow-body {
                animation: purifyPulse 0.5s ease-in-out infinite;
                filter: brightness(2) saturate(0);
            }

            @keyframes purifyPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.5; }
            }

            /* Converted firefly styling */
            .shadow-converted {
                animation: shadowInfected 1s ease-in-out infinite !important;
            }

            @keyframes shadowInfected {
                0%, 100% { filter: invert(0.8) hue-rotate(270deg); }
                50% { filter: invert(0.6) hue-rotate(290deg); }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Get info for debugging
     */
    getInfo() {
        return {
            id: this.id,
            state: this.state,
            conversions: this.conversionsCount,
            goldenTouches: this.goldenTouches,
            energy: Math.round(this.energy)
        };
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShadowFirefly;
}
