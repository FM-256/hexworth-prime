/**
 * PredatorManager.js - Orchestrates All Predator Types
 *
 * Manages spawning, updating, and cleanup of:
 * - Shadow Fireflies (convert 0s to shadows)
 * - Void Serpents (large multi-segment predator)
 * - Parasites (attach and drain energy)
 *
 * Provides population control, spawn scheduling, and
 * integration with the ecosystem.
 */

class PredatorManager {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,

            // Shadow Fireflies
            shadows: {
                enabled: config.shadows?.enabled ?? true,
                maxPopulation: config.shadows?.maxPopulation ?? 3,
                spawnChance: config.shadows?.spawnChance ?? 0.00005,
                minEcosystemAge: config.shadows?.minEcosystemAge ?? 60000 // 1 min
            },

            // Void Serpent
            serpent: {
                enabled: config.serpent?.enabled ?? true,
                maxActive: config.serpent?.maxActive ?? 1,
                spawnCooldown: config.serpent?.spawnCooldown ?? 180000, // 3 min
                minEcosystemAge: config.serpent?.minEcosystemAge ?? 120000, // 2 min
                minPopulation: config.serpent?.minPopulation ?? 20 // Need healthy ecosystem
            },

            // Parasites
            parasites: {
                enabled: config.parasites?.enabled ?? true,
                maxPopulation: config.parasites?.maxPopulation ?? 10,
                spawnChance: config.parasites?.spawnChance ?? 0.0001,
                minEcosystemAge: config.parasites?.minEcosystemAge ?? 45000 // 45s
            }
        };

        // Entity collections
        this.shadows = [];
        this.serpents = [];
        this.parasites = [];

        // Spawn timers
        this.serpentCooldown = this.config.serpent.spawnCooldown * 0.5; // Start halfway

        // References
        this.container = null;
        this.ecosystem = null;

        // Stats
        this.stats = {
            shadowsSpawned: 0,
            shadowsPurified: 0,
            serpentsSpawned: 0,
            serpentKills: 0,
            parasitesSpawned: 0,
            energyDrained: 0
        };
    }

    /**
     * Initialize with container and ecosystem
     */
    init(container, ecosystem) {
        this.container = container;
        this.ecosystem = ecosystem;
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp) {
        if (!this.config.enabled || !this.ecosystem) return;

        const ecosystemAge = this.ecosystem.stats?.totalTime || 0;

        // Update spawn chances
        this.updateSpawning(deltaTime, ecosystemAge);

        // Update all predators
        this.updateShadows(deltaTime, timestamp);
        this.updateSerpents(deltaTime, timestamp);
        this.updateParasites(deltaTime, timestamp);

        // Clean up dead entities
        this.cleanup();
    }

    /**
     * Check and handle spawning
     */
    updateSpawning(deltaTime, ecosystemAge) {
        // Shadow Fireflies
        if (this.config.shadows.enabled &&
            ecosystemAge >= this.config.shadows.minEcosystemAge &&
            this.shadows.length < this.config.shadows.maxPopulation) {

            if (Math.random() < this.config.shadows.spawnChance) {
                this.spawnShadow();
            }
        }

        // Void Serpent
        if (this.config.serpent.enabled &&
            ecosystemAge >= this.config.serpent.minEcosystemAge) {

            this.serpentCooldown -= deltaTime;

            if (this.serpentCooldown <= 0 &&
                this.serpents.length < this.config.serpent.maxActive &&
                this.ecosystem.fireflies.length >= this.config.serpent.minPopulation) {

                this.spawnSerpent();
                this.serpentCooldown = this.config.serpent.spawnCooldown;
            }
        }

        // Parasites
        if (this.config.parasites.enabled &&
            ecosystemAge >= this.config.parasites.minEcosystemAge &&
            this.parasites.length < this.config.parasites.maxPopulation) {

            if (Math.random() < this.config.parasites.spawnChance) {
                this.spawnParasite();
            }
        }
    }

    /**
     * Spawn a Shadow Firefly
     */
    spawnShadow(options = {}) {
        if (typeof ShadowFirefly === 'undefined') return null;

        const shadow = new ShadowFirefly({
            x: options.x ?? Math.random() * window.innerWidth,
            y: options.y ?? Math.random() * window.innerHeight
        });

        // Set up callbacks
        shadow.onConvert = (s, firefly) => {
            this.stats.shadowsSpawned++; // Track conversions as "spawns"
        };

        shadow.onPurify = (s) => {
            this.stats.shadowsPurified++;
            // Could spawn a normal firefly here
        };

        shadow.onDeath = (s) => {
            // Will be cleaned up in cleanup()
        };

        // Create DOM
        if (this.container) {
            shadow.createElement(this.container);
        }

        this.shadows.push(shadow);
        this.stats.shadowsSpawned++;

        console.log(`👤 Shadow Firefly spawned (${this.shadows.length}/${this.config.shadows.maxPopulation})`);

        return shadow;
    }

    /**
     * Spawn a Void Serpent
     */
    spawnSerpent(options = {}) {
        if (typeof VoidSerpent === 'undefined') return null;

        const serpent = new VoidSerpent(options);

        // Set up callbacks
        serpent.onConsume = (s, firefly) => {
            this.stats.serpentKills++;
        };

        serpent.onRepel = (s) => {
            // Swarm defended successfully
        };

        serpent.onDeath = (s) => {
            // Will be cleaned up in cleanup()
        };

        // Create DOM
        if (this.container) {
            serpent.createElement(this.container);
        }

        this.serpents.push(serpent);
        this.stats.serpentsSpawned++;

        console.log(`🐍 Void Serpent spawned! Beware!`);

        return serpent;
    }

    /**
     * Spawn a Parasite
     */
    spawnParasite(options = {}) {
        if (typeof Parasite === 'undefined') return null;

        const parasite = new Parasite({
            x: options.x ?? Math.random() * window.innerWidth,
            y: options.y ?? Math.random() * window.innerHeight
        });

        // Set up callbacks
        parasite.onAttach = (p, host) => {
            // Track attachment
        };

        parasite.onDetach = (p, host) => {
            this.stats.energyDrained += p.totalDrained;
        };

        parasite.onDeath = (p) => {
            // Will be cleaned up in cleanup()
        };

        // Create DOM
        if (this.container) {
            parasite.createElement(this.container);
        }

        this.parasites.push(parasite);
        this.stats.parasitesSpawned++;

        console.log(`🦠 Parasite spawned (${this.parasites.length}/${this.config.parasites.maxPopulation})`);

        return parasite;
    }

    /**
     * Update all Shadow Fireflies
     */
    updateShadows(deltaTime, timestamp) {
        for (const shadow of this.shadows) {
            if (shadow.state !== 'dead') {
                shadow.update(deltaTime, timestamp, this.ecosystem);
            }
        }
    }

    /**
     * Update all Void Serpents
     */
    updateSerpents(deltaTime, timestamp) {
        for (const serpent of this.serpents) {
            if (serpent.state !== 'dead') {
                serpent.update(deltaTime, timestamp, this.ecosystem);
            }
        }
    }

    /**
     * Update all Parasites
     */
    updateParasites(deltaTime, timestamp) {
        for (const parasite of this.parasites) {
            if (parasite.state !== 'dead') {
                parasite.update(deltaTime, timestamp, this.ecosystem);
            }
        }
    }

    /**
     * Clean up dead entities
     */
    cleanup() {
        // Shadows
        for (let i = this.shadows.length - 1; i >= 0; i--) {
            if (this.shadows[i].state === 'dead') {
                this.shadows[i].destroy();
                this.shadows.splice(i, 1);
            }
        }

        // Serpents
        for (let i = this.serpents.length - 1; i >= 0; i--) {
            const serpent = this.serpents[i];
            if (serpent.state === 'dead' ||
                (serpent.state === 'leaving' && serpent.opacity <= 0)) {
                serpent.destroy();
                this.serpents.splice(i, 1);
            }
        }

        // Parasites
        for (let i = this.parasites.length - 1; i >= 0; i--) {
            if (this.parasites[i].state === 'dead') {
                this.parasites[i].destroy();
                this.parasites.splice(i, 1);
            }
        }
    }

    /**
     * Force spawn methods (for debug)
     */
    forceShadow(x, y) {
        return this.spawnShadow({ x, y });
    }

    forceSerpent() {
        return this.spawnSerpent();
    }

    forceParasite(x, y) {
        return this.spawnParasite({ x, y });
    }

    /**
     * Get stats for display
     */
    getStats() {
        return {
            ...this.stats,
            activeShadows: this.shadows.length,
            activeSerpents: this.serpents.length,
            activeParasites: this.parasites.length,
            attachedParasites: this.parasites.filter(p => p.state === 'attached').length
        };
    }

    /**
     * Get all active predators (for collision checks etc)
     */
    getAllPredators() {
        return {
            shadows: this.shadows,
            serpents: this.serpents,
            parasites: this.parasites
        };
    }

    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;

        if (!enabled) {
            // Clean up all when disabled
            this.destroyAll();
        }
    }

    /**
     * Destroy all predators
     */
    destroyAll() {
        for (const shadow of this.shadows) {
            shadow.destroy();
        }
        this.shadows = [];

        for (const serpent of this.serpents) {
            serpent.destroy();
        }
        this.serpents = [];

        for (const parasite of this.parasites) {
            parasite.destroy();
        }
        this.parasites = [];
    }

    /**
     * Full cleanup
     */
    destroy() {
        this.destroyAll();
        this.container = null;
        this.ecosystem = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PredatorManager;
}
