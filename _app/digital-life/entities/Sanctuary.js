/**
 * Sanctuary.js - Protected Safe Zone Entity
 *
 * Creates permanent or temporary safe zones where:
 * - No predators can enter (repelled at boundary)
 * - Fireflies inside regenerate energy slowly
 * - Provides visual "sanctuary" effect
 * - Can be created by player or spawned by events
 *
 * Represents a haven in the ecosystem.
 */

class Sanctuary {
    static TYPES = {
        STANDARD: {
            name: 'Sanctuary',
            symbol: '☮',
            color: '#22c55e',
            glowColor: 'rgba(34, 197, 94, 0.4)',
            radius: 100,
            energyRegen: 0.5,       // Energy per second
            duration: 60000,        // 60 seconds
            predatorRepelForce: 0.3
        },
        ANCIENT: {
            name: 'Ancient Grove',
            symbol: '🌳',
            color: '#84cc16',
            glowColor: 'rgba(132, 204, 22, 0.5)',
            radius: 150,
            energyRegen: 1.0,       // Double regen
            duration: 90000,        // 90 seconds
            predatorRepelForce: 0.5,
            evolutionBoost: 1.5     // Evolution speed multiplier
        },
        CELESTIAL: {
            name: 'Celestial Haven',
            symbol: '✦',
            color: '#f0abfc',
            glowColor: 'rgba(240, 171, 252, 0.5)',
            radius: 120,
            energyRegen: 0.8,
            duration: 45000,        // 45 seconds
            predatorRepelForce: 0.8,
            immuneToCosmicEvents: true
        },
        PERMANENT: {
            name: 'Eternal Sanctuary',
            symbol: '⬡',
            color: '#fbbf24',
            glowColor: 'rgba(251, 191, 36, 0.4)',
            radius: 80,
            energyRegen: 0.3,
            duration: Infinity,     // Never expires
            predatorRepelForce: 0.4
        }
    };

    constructor(options = {}) {
        // Identity
        this.id = 'sanctuary_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Type
        const typeName = options.type ?? 'STANDARD';
        this.type = Sanctuary.TYPES[typeName] || Sanctuary.TYPES.STANDARD;

        // Position
        this.x = options.x ?? window.innerWidth / 2;
        this.y = options.y ?? window.innerHeight / 2;

        // Size (can be customized)
        this.radius = options.radius ?? this.type.radius;

        // State
        this.state = 'spawning'; // spawning, active, fading, dead
        this.age = 0;
        this.duration = options.duration ?? this.type.duration;

        // Visual
        this.opacity = 0;
        this.pulsePhase = 0;
        this.particleTimer = 0;

        // DOM
        this.element = null;

        // Stats
        this.stats = {
            firefliesProtected: 0,
            energyRestored: 0,
            predatorsRepelled: 0
        };

        // Callbacks
        this.onExpire = null;
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'sanctuary';
        this.element.id = this.id;

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

        const pulse = Math.sin(this.pulsePhase) * 0.1 + 1;
        const innerPulse = Math.sin(this.pulsePhase * 1.5) * 0.15 + 0.85;

        this.element.style.cssText = `
            position: absolute;
            left: ${this.x}px;
            top: ${this.y}px;
            width: ${this.radius * 2 * pulse}px;
            height: ${this.radius * 2 * pulse}px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 2px solid ${this.type.color}60;
            background: radial-gradient(circle,
                ${this.type.glowColor} 0%,
                ${this.type.color}20 ${innerPulse * 50}%,
                transparent 70%
            );
            box-shadow:
                0 0 30px ${this.type.glowColor},
                inset 0 0 50px ${this.type.glowColor};
            opacity: ${this.opacity};
            pointer-events: none;
            z-index: 8;
        `;

        // Add center symbol
        this.element.innerHTML = `
            <span style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: ${24 * pulse}px;
                opacity: ${0.6 + Math.sin(this.pulsePhase) * 0.2};
            ">${this.type.symbol}</span>
        `;
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp, ecosystem) {
        this.age += deltaTime;
        this.pulsePhase += deltaTime * 0.003;

        // State machine
        switch (this.state) {
            case 'spawning':
                this.updateSpawning(deltaTime);
                break;
            case 'active':
                this.updateActive(deltaTime, ecosystem);
                break;
            case 'fading':
                this.updateFading(deltaTime);
                break;
        }

        this.updateElementStyle();
    }

    /**
     * Spawning state - fade in
     */
    updateSpawning(deltaTime) {
        this.opacity = Math.min(1, this.opacity + deltaTime * 0.002);

        if (this.opacity >= 1) {
            this.state = 'active';
            console.log(`☮️ ${this.type.name} is now active`);
        }
    }

    /**
     * Active state - protect and heal
     */
    updateActive(deltaTime, ecosystem) {
        // Check duration (skip for infinite)
        if (this.duration !== Infinity && this.age >= this.duration) {
            this.state = 'fading';
            return;
        }

        if (!ecosystem) return;

        // Process fireflies in sanctuary
        for (const firefly of ecosystem.fireflies) {
            if (this.isInside(firefly.x, firefly.y)) {
                // Mark as protected
                firefly.inSanctuary = true;

                // Regenerate energy
                const regenAmount = this.type.energyRegen * deltaTime / 1000;
                if (firefly.energy < 100) {
                    firefly.energy = Math.min(100, firefly.energy + regenAmount);
                    this.stats.energyRestored += regenAmount;
                }

                // Evolution boost (if type has it)
                if (this.type.evolutionBoost && firefly.evolutionProgress !== undefined) {
                    firefly.evolutionProgress += deltaTime * 0.0001 * this.type.evolutionBoost;
                }

                this.stats.firefliesProtected++;
            } else {
                // Clear flag if outside
                if (firefly.inSanctuary) {
                    firefly.inSanctuary = false;
                }
            }
        }

        // Repel predators
        this.repelPredators(ecosystem);

        // Spawn ambient particles occasionally
        this.particleTimer += deltaTime;
        if (this.particleTimer > 500) {
            this.spawnAmbientParticle();
            this.particleTimer = 0;
        }
    }

    /**
     * Repel all predator types
     */
    repelPredators(ecosystem) {
        const repelForce = this.type.predatorRepelForce;

        // Repel Predator Stars
        if (window.digitalLife?.predatorStars) {
            for (const predator of window.digitalLife.predatorStars) {
                this.repelEntity(predator, repelForce);
            }
        }

        // Repel Phase 5 predators
        if (window.digitalLife?.predatorManager) {
            const pm = window.digitalLife.predatorManager;

            // Shadows
            for (const shadow of pm.shadows) {
                if (this.repelEntity(shadow, repelForce)) {
                    // Shadows might flee
                    if (shadow.flee) shadow.flee(this.x, this.y);
                }
            }

            // Serpents
            for (const serpent of pm.serpents) {
                if (this.repelEntity(serpent, repelForce * 1.5)) {
                    // Serpents start fleeing
                    if (serpent.startFleeing && serpent.state !== 'fleeing') {
                        serpent.startFleeing();
                        this.stats.predatorsRepelled++;
                    }
                }
            }

            // Parasites
            for (const parasite of pm.parasites) {
                if (parasite.state === 'seeking') {
                    this.repelEntity(parasite, repelForce);
                }
            }
        }
    }

    /**
     * Repel a single entity from the sanctuary
     */
    repelEntity(entity, force) {
        const dx = entity.x - this.x;
        const dy = entity.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if trying to enter
        if (dist < this.radius + 20) {
            // Push out
            const pushX = (dx / dist) * force * 10;
            const pushY = (dy / dist) * force * 10;

            entity.x += pushX;
            entity.y += pushY;

            // Also affect velocity if entity has it
            if (entity.vx !== undefined) {
                entity.vx += pushX * 0.1;
                entity.vy += pushY * 0.1;
            }

            return true;
        }

        return false;
    }

    /**
     * Spawn ambient healing particles
     */
    spawnAmbientParticle() {
        if (!this.element?.parentNode) return;

        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * this.radius * 0.8;
        const x = this.x + Math.cos(angle) * dist;
        const y = this.y + Math.sin(angle) * dist;

        const particle = document.createElement('div');
        particle.className = 'sanctuary-particle';
        particle.textContent = '✧';
        particle.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            font-size: ${8 + Math.random() * 6}px;
            color: ${this.type.color};
            text-shadow: 0 0 10px ${this.type.color};
            opacity: 0;
            pointer-events: none;
            animation: sanctuaryFloat 2s ease-out forwards;
            z-index: 9;
        `;
        this.element.parentNode.appendChild(particle);

        setTimeout(() => particle.remove(), 2000);
    }

    /**
     * Check if a point is inside the sanctuary
     */
    isInside(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }

    /**
     * Fading state - fade out
     */
    updateFading(deltaTime) {
        this.opacity = Math.max(0, this.opacity - deltaTime * 0.001);

        if (this.opacity <= 0) {
            this.state = 'dead';
            if (this.onExpire) {
                this.onExpire(this);
            }
        }
    }

    /**
     * Get info for debugging
     */
    getInfo() {
        return {
            id: this.id,
            type: this.type.name,
            state: this.state,
            position: { x: Math.round(this.x), y: Math.round(this.y) },
            radius: this.radius,
            age: Math.round(this.age / 1000),
            remainingTime: this.duration === Infinity ? '∞' : Math.round((this.duration - this.age) / 1000),
            stats: this.stats
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('sanctuary-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'sanctuary-styles';
        styles.textContent = `
            .sanctuary {
                will-change: transform, opacity;
            }

            @keyframes sanctuaryFloat {
                0% {
                    opacity: 0;
                    transform: translateY(0);
                }
                30% {
                    opacity: 1;
                }
                100% {
                    opacity: 0;
                    transform: translateY(-30px);
                }
            }
        `;

        document.head.appendChild(styles);
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

/**
 * SanctuaryManager - Manages all sanctuaries
 */
class SanctuaryManager {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,
            maxSanctuaries: config.maxSanctuaries ?? 5,
            ...config
        };

        this.sanctuaries = [];
        this.container = null;
        this.ecosystem = null;

        // Stats
        this.stats = {
            sanctuariesCreated: 0,
            totalEnergyRestored: 0
        };
    }

    /**
     * Initialize
     */
    init(container, ecosystem) {
        this.container = container;
        this.ecosystem = ecosystem;
        return this;
    }

    /**
     * Create a sanctuary
     */
    createSanctuary(options = {}) {
        if (!this.config.enabled) return null;

        // Check max count
        const activeCount = this.sanctuaries.filter(s => s.state !== 'dead').length;
        if (activeCount >= this.config.maxSanctuaries) {
            console.warn('Maximum sanctuaries reached');
            return null;
        }

        const sanctuary = new Sanctuary(options);

        // Set up callbacks
        sanctuary.onExpire = (s) => {
            this.stats.totalEnergyRestored += s.stats.energyRestored;
        };

        // Create DOM
        if (this.container) {
            sanctuary.createElement(this.container);
        }

        this.sanctuaries.push(sanctuary);
        this.stats.sanctuariesCreated++;

        console.log(`☮️ ${sanctuary.type.name} created`);

        return sanctuary;
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp) {
        for (let i = this.sanctuaries.length - 1; i >= 0; i--) {
            const sanctuary = this.sanctuaries[i];

            if (sanctuary.state === 'dead') {
                sanctuary.destroy();
                this.sanctuaries.splice(i, 1);
                continue;
            }

            sanctuary.update(deltaTime, timestamp, this.ecosystem);
        }
    }

    /**
     * Check if a point is in any sanctuary
     */
    isPointProtected(x, y) {
        for (const sanctuary of this.sanctuaries) {
            if (sanctuary.state === 'active' && sanctuary.isInside(x, y)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get all active sanctuaries
     */
    getActiveSanctuaries() {
        return this.sanctuaries.filter(s => s.state === 'active');
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            ...this.stats,
            activeSanctuaries: this.sanctuaries.filter(s => s.state !== 'dead').length
        };
    }

    /**
     * Clean up
     */
    destroy() {
        for (const sanctuary of this.sanctuaries) {
            sanctuary.destroy();
        }
        this.sanctuaries = [];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Sanctuary, SanctuaryManager };
}
