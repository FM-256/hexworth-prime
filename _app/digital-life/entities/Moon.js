/**
 * Moon.js - Planetary Satellite Entity
 *
 * Small bodies that orbit around planets, providing
 * additional benefits to the ecosystem:
 *
 * Types:
 * - Resource Moon: Generates extra energy particles
 * - Shield Moon: Extends protection radius
 * - Beacon Moon: Attracts fireflies from farther away
 * - Ancient Moon: Boosts evolution rate
 */

class Moon {
    // Moon types with different bonuses
    static TYPES = {
        RESOURCE: {
            name: 'Resource Moon',
            symbol: '●',
            color: '#a3e635',           // Lime green
            glowColor: 'rgba(163, 230, 53, 0.5)',
            effect: 'resource',
            size: 8,
            description: 'Generates energy particles'
        },
        SHIELD: {
            name: 'Shield Moon',
            symbol: '◐',
            color: '#38bdf8',           // Sky blue
            glowColor: 'rgba(56, 189, 248, 0.5)',
            effect: 'shield',
            size: 10,
            description: 'Extends protection radius'
        },
        BEACON: {
            name: 'Beacon Moon',
            symbol: '✧',
            color: '#fbbf24',           // Amber
            glowColor: 'rgba(251, 191, 36, 0.5)',
            effect: 'beacon',
            size: 7,
            description: 'Attracts distant fireflies'
        },
        ANCIENT: {
            name: 'Ancient Moon',
            symbol: '◈',
            color: '#a78bfa',           // Purple
            glowColor: 'rgba(167, 139, 250, 0.5)',
            effect: 'ancient',
            size: 12,
            description: 'Accelerates evolution'
        }
    };

    constructor(options = {}) {
        // Identity
        this.id = 'moon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Parent planet reference
        this.planet = options.planet;
        this.planetId = options.planet?.id;

        // Type selection (random or specified)
        const typeNames = Object.keys(Moon.TYPES);
        const typeName = options.type || typeNames[Math.floor(Math.random() * typeNames.length)];
        this.type = Moon.TYPES[typeName] || Moon.TYPES.RESOURCE;
        this.typeName = typeName;

        // Orbital mechanics relative to planet
        this.orbitRadius = options.orbitRadius ?? (30 + Math.random() * 20);
        this.orbitSpeed = 0.002 + Math.random() * 0.001; // Radians per ms
        this.orbitAngle = options.startAngle ?? Math.random() * Math.PI * 2;
        this.orbitDirection = Math.random() > 0.5 ? 1 : -1;

        // Position (calculated from planet position + orbit)
        this.x = 0;
        this.y = 0;
        this.updatePosition();

        // Size & Appearance
        this.size = this.type.size;
        this.opacity = 0;
        this.targetOpacity = 0.9;
        this.rotation = 0;
        this.rotationSpeed = 0.002 + Math.random() * 0.001;

        // Life cycle
        this.age = 0;
        this.birthDuration = 1500; // 1.5 seconds to appear
        this.isMature = false;

        // Effect-specific properties
        this.initEffectProperties();

        // Visual pulse
        this.pulsePhase = Math.random() * Math.PI * 2;

        // DOM element
        this.element = null;

        // Trail for visual effect
        this.trail = [];
        this.maxTrailLength = 5;
        this.trailTimer = 0;
        this.trailInterval = 100; // ms between trail points
    }

    /**
     * Initialize effect-specific properties
     */
    initEffectProperties() {
        switch (this.type.effect) {
            case 'resource':
                this.particleTimer = 0;
                this.particleInterval = 4000 + Math.random() * 2000; // 4-6 seconds
                this.particleEnergyValue = 8;
                break;

            case 'shield':
                this.shieldBonus = 30; // Adds 30 to planet protection radius
                this.shieldPulse = 0;
                break;

            case 'beacon':
                this.attractionRadius = 200;
                this.attractionStrength = 0.008;
                this.beaconPulse = 0;
                break;

            case 'ancient':
                this.evolutionBoostRadius = 80;
                this.evolutionMultiplier = 1.5; // 50% faster evolution
                break;
        }
    }

    /**
     * Update moon position based on parent planet
     */
    updatePosition() {
        if (!this.planet) return;

        this.x = this.planet.x + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.planet.y + Math.sin(this.orbitAngle) * this.orbitRadius;
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'moon';
        this.element.id = this.id;

        // Moon body
        this.bodyElement = document.createElement('div');
        this.bodyElement.className = 'moon-body';
        this.bodyElement.textContent = this.type.symbol;
        this.element.appendChild(this.bodyElement);

        // Glow effect
        this.glowElement = document.createElement('div');
        this.glowElement.className = 'moon-glow';
        this.element.appendChild(this.glowElement);

        this.updateElementStyle();
        container.appendChild(this.element);

        // Inject styles
        this.injectStyles();

        return this.element;
    }

    /**
     * Update visual style
     */
    updateElementStyle() {
        if (!this.element) return;

        const pulse = Math.sin(this.pulsePhase) * 0.1 + 1;

        this.element.style.cssText = `
            position: absolute;
            left: ${this.x}px;
            top: ${this.y}px;
            transform: translate(-50%, -50%) rotate(${this.rotation}rad);
            opacity: ${this.opacity};
            pointer-events: none;
            z-index: 9;
        `;

        if (this.bodyElement) {
            this.bodyElement.style.cssText = `
                font-size: ${this.size * pulse}px;
                color: ${this.type.color};
                text-shadow:
                    0 0 ${5 * pulse}px ${this.type.glowColor},
                    0 0 ${10 * pulse}px ${this.type.glowColor};
                transition: none;
            `;
        }

        if (this.glowElement) {
            this.glowElement.style.cssText = `
                position: absolute;
                width: ${this.size * 3}px;
                height: ${this.size * 3}px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background: radial-gradient(circle,
                    ${this.type.glowColor} 0%,
                    transparent 70%
                );
                opacity: ${0.4 * pulse};
                pointer-events: none;
            `;
        }
    }

    /**
     * Update moon state
     * @param {number} deltaTime - Time since last update
     * @param {number} timestamp - Current timestamp
     */
    update(deltaTime, timestamp) {
        this.age += deltaTime;

        // Birth animation
        if (!this.isMature) {
            const birthProgress = Math.min(1, this.age / this.birthDuration);
            this.opacity = this.targetOpacity * this.easeOutCubic(birthProgress);

            if (birthProgress >= 1) {
                this.isMature = true;
            }
        }

        // Update orbit
        this.orbitAngle += this.orbitSpeed * this.orbitDirection * deltaTime;
        this.updatePosition();

        // Rotation
        this.rotation += this.rotationSpeed * deltaTime;

        // Visual pulse
        this.pulsePhase += deltaTime * 0.003;

        // Trail update
        this.trailTimer += deltaTime;
        if (this.trailTimer >= this.trailInterval && this.isMature) {
            this.trailTimer = 0;
            this.trail.push({
                x: this.x,
                y: this.y,
                age: 0
            });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }

        // Age trail points
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].age += deltaTime;
            if (this.trail[i].age > 500) {
                this.trail.splice(i, 1);
            }
        }

        // Effect-specific updates
        this.updateEffect(deltaTime, timestamp);

        // Update visuals
        this.updateElementStyle();
    }

    /**
     * Update effect-specific behavior
     */
    updateEffect(deltaTime, timestamp) {
        if (!this.isMature) return;

        switch (this.type.effect) {
            case 'resource':
                this.particleTimer += deltaTime;
                if (this.particleTimer >= this.particleInterval) {
                    this.particleTimer = 0;
                    // Signal to spawn a particle (handled by planet/ecosystem)
                    if (this.planet && this.planet.particles.length < this.planet.maxParticles + 2) {
                        this.planet.spawnParticle(this.x, this.y, this.particleEnergyValue);
                    }
                }
                break;

            case 'shield':
                this.shieldPulse = Math.sin(timestamp * 0.003) * 0.2 + 1;
                break;

            case 'beacon':
                this.beaconPulse = Math.sin(timestamp * 0.004) * 0.3 + 1;
                break;

            case 'ancient':
                // Passive effect, handled by ecosystem
                break;
        }
    }

    /**
     * Apply beacon attraction to a firefly
     * @param {Firefly} firefly - The firefly to potentially attract
     */
    applyBeaconAttraction(firefly) {
        if (this.type.effect !== 'beacon' || !this.isMature) return;

        const dx = this.planet.x - firefly.x; // Attract toward planet, not moon
        const dy = this.planet.y - firefly.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.attractionRadius || dist < 30) return;

        const strength = this.attractionStrength * (1 - dist / this.attractionRadius) * this.beaconPulse;

        if (firefly.applyForce) {
            firefly.applyForce(
                (dx / dist) * strength,
                (dy / dist) * strength
            );
        }
    }

    /**
     * Check if firefly is in ancient moon's evolution boost zone
     * @param {Firefly} firefly - The firefly to check
     * @returns {boolean}
     */
    isInEvolutionZone(firefly) {
        if (this.type.effect !== 'ancient' || !this.isMature) return false;

        const dx = this.x - firefly.x;
        const dy = this.y - firefly.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        return dist <= this.evolutionBoostRadius;
    }

    /**
     * Get shield bonus for planet
     * @returns {number} Shield radius bonus
     */
    getShieldBonus() {
        if (this.type.effect !== 'shield' || !this.isMature) return 0;
        return this.shieldBonus * this.shieldPulse;
    }

    /**
     * Easing function
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Inject moon-specific CSS
     */
    injectStyles() {
        if (document.getElementById('moon-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'moon-styles';
        styles.textContent = `
            .moon {
                will-change: transform, opacity;
            }

            .moon-body {
                position: relative;
                z-index: 1;
            }

            .moon-glow {
                animation: moonPulse 2s ease-in-out infinite;
            }

            @keyframes moonPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.6; }
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
            type: this.typeName,
            effect: this.type.effect,
            planetId: this.planetId,
            age: Math.round(this.age / 1000),
            isMature: this.isMature
        };
    }

    /**
     * Clean up DOM element
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.planet = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Moon;
}
