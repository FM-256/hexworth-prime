/**
 * EnergyWell.js - Stationary Energy Source Entity
 *
 * Energy wells are anchor points in the ecosystem that:
 * - Attract nearby fireflies with gentle pull
 * - Regenerate energy for fireflies in range
 * - Pulse with energy that can be absorbed
 * - Have limited capacity that regenerates over time
 * - Can be depleted temporarily by heavy use
 *
 * Types:
 * - STANDARD: Basic energy well
 * - VOLATILE: High output but unstable (flickers)
 * - ANCIENT: Slow but unlimited capacity
 */

class EnergyWell {
    static TYPES = {
        STANDARD: {
            name: 'Standard Well',
            color: '#22c55e',           // Green
            glowColor: 'rgba(34, 197, 94, 0.5)',
            symbol: '◈',
            capacity: 100,
            regenRate: 0.5,             // Energy per second regeneration
            outputRate: 2,              // Energy per second to fireflies
            attractRadius: 120,
            attractStrength: 0.008,
            pulseSpeed: 0.003
        },
        VOLATILE: {
            name: 'Volatile Well',
            color: '#f59e0b',           // Amber
            glowColor: 'rgba(245, 158, 11, 0.6)',
            symbol: '◇',
            capacity: 60,
            regenRate: 1.5,             // Fast regen
            outputRate: 5,              // High output
            attractRadius: 80,
            attractStrength: 0.015,     // Stronger pull
            pulseSpeed: 0.008,          // Faster pulse
            flickerChance: 0.02         // Random flicker
        },
        ANCIENT: {
            name: 'Ancient Well',
            color: '#8b5cf6',           // Purple
            glowColor: 'rgba(139, 92, 246, 0.4)',
            symbol: '❖',
            capacity: Infinity,         // Unlimited
            regenRate: 0,               // Doesn't need regen
            outputRate: 1,              // Slow but steady
            attractRadius: 200,         // Large range
            attractStrength: 0.005,     // Gentle pull
            pulseSpeed: 0.001           // Slow, meditative
        }
    };

    constructor(options = {}) {
        // Identity
        this.id = 'energywell_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Type
        this.typeName = options.type ?? 'STANDARD';
        this.type = EnergyWell.TYPES[this.typeName] || EnergyWell.TYPES.STANDARD;

        // Position (stationary)
        this.x = options.x ?? Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2;
        this.y = options.y ?? Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2;

        // Size & Appearance
        this.baseSize = options.size ?? 25;
        this.size = this.baseSize;
        this.opacity = 0;
        this.targetOpacity = 0.9;

        // Energy state
        this.energy = this.type.capacity === Infinity ? Infinity : this.type.capacity;
        this.maxEnergy = this.type.capacity;
        this.isDepleted = false;
        this.depletedCooldown = 0;
        this.depletedDuration = 5000; // 5 seconds recovery when depleted

        // Attraction
        this.attractRadius = this.type.attractRadius;
        this.attractStrength = this.type.attractStrength;

        // Visual state
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = this.type.pulseSpeed;
        this.flickerState = 1; // For volatile wells

        // Life cycle
        this.age = 0;
        this.birthDuration = 2000;
        this.isMature = false;

        // Stats
        this.totalEnergyGiven = 0;
        this.firefliesServed = new Set();

        // DOM elements
        this.element = null;

        // Callbacks
        this.onDepleted = null;
        this.onRestored = null;
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'energy-well';
        this.element.id = this.id;

        // Outer glow (attraction zone indicator)
        this.glowElement = document.createElement('div');
        this.glowElement.className = 'energy-well-glow';
        this.element.appendChild(this.glowElement);

        // Core
        this.coreElement = document.createElement('div');
        this.coreElement.className = 'energy-well-core';
        this.coreElement.textContent = this.type.symbol;
        this.element.appendChild(this.coreElement);

        // Energy rings (pulsing outward)
        this.rings = [];
        for (let i = 0; i < 3; i++) {
            const ring = document.createElement('div');
            ring.className = 'energy-well-ring';
            this.element.appendChild(ring);
            this.rings.push(ring);
        }

        // Energy level indicator
        this.levelElement = document.createElement('div');
        this.levelElement.className = 'energy-well-level';
        this.element.appendChild(this.levelElement);

        this.updateElementStyle();
        container.appendChild(this.element);

        // Inject styles
        this.injectStyles();

        return this.element;
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('energy-well-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'energy-well-styles';
        styles.textContent = `
            .energy-well {
                position: absolute;
                pointer-events: none;
                z-index: 6;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .energy-well-glow {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle,
                    var(--well-glow) 0%,
                    transparent 70%
                );
                opacity: 0.3;
                animation: wellPulse 2s ease-in-out infinite;
            }

            .energy-well-core {
                position: absolute;
                font-family: 'Courier New', monospace;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%,
                    var(--well-color) 0%,
                    color-mix(in srgb, var(--well-color) 60%, black) 100%
                );
                box-shadow:
                    0 0 15px var(--well-glow),
                    0 0 30px var(--well-glow),
                    inset 0 0 10px rgba(255,255,255,0.2);
            }

            .energy-well-ring {
                position: absolute;
                border-radius: 50%;
                border: 1px solid var(--well-color);
                opacity: 0;
                animation: ringExpand 3s ease-out infinite;
            }

            .energy-well-ring:nth-child(3) { animation-delay: 0s; }
            .energy-well-ring:nth-child(4) { animation-delay: 1s; }
            .energy-well-ring:nth-child(5) { animation-delay: 2s; }

            .energy-well-level {
                position: absolute;
                bottom: -8px;
                width: 80%;
                height: 3px;
                background: rgba(0,0,0,0.5);
                border-radius: 2px;
                overflow: hidden;
                display: none; /* Hidden by default - cleaner look */
            }

            .energy-well.show-level .energy-well-level {
                display: block; /* Can be shown via class if needed */
            }

            .energy-well-level::after {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: var(--energy-level, 100%);
                background: var(--well-color);
                transition: width 0.3s ease;
            }

            .energy-well.depleted .energy-well-core {
                filter: grayscale(0.8) brightness(0.5);
            }

            .energy-well.depleted .energy-well-ring {
                animation: none;
                opacity: 0;
            }

            .energy-well.volatile .energy-well-core {
                animation: volatileFlicker 0.1s ease-in-out infinite;
            }

            @keyframes wellPulse {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.1); opacity: 0.5; }
            }

            @keyframes ringExpand {
                0% {
                    transform: scale(0.5);
                    opacity: 0.6;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            @keyframes volatileFlicker {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Update DOM element styles
     */
    updateElementStyle() {
        if (!this.element) return;

        const displaySize = this.attractRadius * 2;

        // Position
        this.element.style.left = (this.x - displaySize / 2) + 'px';
        this.element.style.top = (this.y - displaySize / 2) + 'px';
        this.element.style.width = displaySize + 'px';
        this.element.style.height = displaySize + 'px';
        this.element.style.opacity = this.opacity * this.flickerState;

        // CSS variables
        this.element.style.setProperty('--well-color', this.type.color);
        this.element.style.setProperty('--well-glow', this.type.glowColor);

        // Energy level indicator
        const energyPercent = this.maxEnergy === Infinity ? 100 : (this.energy / this.maxEnergy) * 100;
        this.element.style.setProperty('--energy-level', energyPercent + '%');

        // Glow size
        this.glowElement.style.width = displaySize + 'px';
        this.glowElement.style.height = displaySize + 'px';

        // Core size with pulse
        const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.1;
        const coreSize = this.size * pulseFactor;
        this.coreElement.style.width = coreSize + 'px';
        this.coreElement.style.height = coreSize + 'px';
        this.coreElement.style.fontSize = (coreSize * 0.5) + 'px';
        this.coreElement.style.color = '#fff';
        this.coreElement.style.left = (displaySize / 2 - coreSize / 2) + 'px';
        this.coreElement.style.top = (displaySize / 2 - coreSize / 2) + 'px';

        // Rings
        this.rings.forEach((ring, i) => {
            const ringSize = this.size * (1.5 + i * 0.3);
            ring.style.width = ringSize + 'px';
            ring.style.height = ringSize + 'px';
            ring.style.left = (displaySize / 2 - ringSize / 2) + 'px';
            ring.style.top = (displaySize / 2 - ringSize / 2) + 'px';
        });

        // Level indicator position
        this.levelElement.style.left = (displaySize / 2 - this.size * 0.4) + 'px';
        this.levelElement.style.top = (displaySize / 2 + this.size / 2 + 5) + 'px';

        // State classes
        this.element.classList.toggle('depleted', this.isDepleted);
        this.element.classList.toggle('volatile', this.typeName === 'VOLATILE');
    }

    /**
     * Main update loop
     */
    update(deltaTime) {
        this.age += deltaTime;

        // Birth animation
        if (!this.isMature) {
            const birthProgress = Math.min(this.age / this.birthDuration, 1);
            this.opacity = birthProgress * this.targetOpacity;
            this.size = this.baseSize * birthProgress;

            if (birthProgress >= 1) {
                this.isMature = true;
            }
        }

        // Pulse animation
        this.pulsePhase += this.pulseSpeed * deltaTime;

        // Volatile flicker
        if (this.typeName === 'VOLATILE' && this.type.flickerChance) {
            if (Math.random() < this.type.flickerChance) {
                this.flickerState = 0.5 + Math.random() * 0.5;
            } else {
                this.flickerState = Math.min(1, this.flickerState + 0.1);
            }
        }

        // Energy regeneration
        if (!this.isDepleted && this.energy < this.maxEnergy && this.maxEnergy !== Infinity) {
            this.energy = Math.min(this.maxEnergy, this.energy + this.type.regenRate * (deltaTime / 1000));
        }

        // Depleted recovery
        if (this.isDepleted) {
            this.depletedCooldown -= deltaTime;
            if (this.depletedCooldown <= 0) {
                this.isDepleted = false;
                this.energy = this.maxEnergy * 0.3; // Restore to 30%
                if (this.onRestored) {
                    this.onRestored(this);
                }
            }
        }

        this.updateElementStyle();
    }

    /**
     * Check if a position is within attraction range
     */
    isInRange(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.attractRadius;
    }

    /**
     * Apply attraction force to a firefly
     */
    applyAttraction(firefly) {
        if (!this.isMature || this.isDepleted) return;
        if (firefly.state !== 'mature') return;

        const dx = this.x - firefly.x;
        const dy = this.y - firefly.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.attractRadius) return;
        if (distance < this.size) return; // Don't pull into core

        // Attraction strength falls off with distance
        const falloff = 1 - (distance / this.attractRadius);
        const strength = this.attractStrength * falloff;

        firefly.applyForce(
            (dx / distance) * strength,
            (dy / distance) * strength
        );

        // Mark firefly as near well
        firefly.nearEnergyWell = this.id;
    }

    /**
     * Give energy to a firefly in range
     * @returns {number} Energy given
     */
    giveEnergy(firefly, deltaTime) {
        if (!this.isMature || this.isDepleted) return 0;
        if (firefly.state !== 'mature') return 0;

        const dx = firefly.x - this.x;
        const dy = firefly.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Must be close to core to receive energy
        const transferRadius = this.size * 2;
        if (distance > transferRadius) return 0;

        // Calculate energy to give
        const proximity = 1 - (distance / transferRadius);
        let energyToGive = this.type.outputRate * proximity * (deltaTime / 1000);

        // Check capacity (unless infinite)
        if (this.maxEnergy !== Infinity) {
            energyToGive = Math.min(energyToGive, this.energy);
            this.energy -= energyToGive;

            // Check for depletion
            if (this.energy <= 0) {
                this.energy = 0;
                this.isDepleted = true;
                this.depletedCooldown = this.depletedDuration;
                if (this.onDepleted) {
                    this.onDepleted(this);
                }
            }
        }

        // Track stats
        this.totalEnergyGiven += energyToGive;
        this.firefliesServed.add(firefly.id);

        return energyToGive;
    }

    /**
     * Get state info
     */
    getStateInfo() {
        return {
            id: this.id,
            type: this.type.name,
            position: { x: Math.round(this.x), y: Math.round(this.y) },
            energy: this.maxEnergy === Infinity ? '∞' : Math.round(this.energy),
            maxEnergy: this.maxEnergy === Infinity ? '∞' : this.maxEnergy,
            isDepleted: this.isDepleted,
            totalGiven: Math.round(this.totalEnergyGiven),
            uniqueServed: this.firefliesServed.size
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
    module.exports = EnergyWell;
}
