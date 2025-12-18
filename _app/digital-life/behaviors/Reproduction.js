/**
 * Reproduction.js - Mitosis/Reproduction System
 *
 * Mature fireflies with high energy can reproduce:
 * - Split into two smaller fireflies
 * - Offspring inherit parent's digit
 * - Energy cost for reproduction
 * - Population cap prevents runaway growth
 */

class ReproductionSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            // Requirements
            minEnergyToReproduce: config.minEnergyToReproduce ?? 85,
            minAgeToReproduce: config.minAgeToReproduce ?? 20000, // 20 seconds
            minTierToReproduce: config.minTierToReproduce ?? 1, // At least Charged tier
            // Costs
            energyCost: config.energyCost ?? 60,
            // Chances
            reproductionChance: config.reproductionChance ?? 0.0002, // Per frame when eligible
            // Cooldown
            reproductionCooldown: config.reproductionCooldown ?? 30000, // 30 seconds
            // Offspring
            offspringEnergyPercent: config.offspringEnergyPercent ?? 0.4, // % of remaining parent energy
            offspringInheritsTier: config.offspringInheritsTier ?? false, // Start at Basic
            offspringDistance: config.offspringDistance ?? 30,
            ...config
        };

        this.ecosystem = null;
        this.particleSystem = null;
    }

    setEcosystem(ecosystem) {
        this.ecosystem = ecosystem;
        return this;
    }

    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
        return this;
    }

    /**
     * Main update
     */
    update(deltaTime) {
        if (!this.config.enabled || !this.ecosystem) return;

        const fireflies = this.ecosystem.fireflies;

        // Check population cap
        if (fireflies.length >= this.ecosystem.config.maxPopulation) return;

        for (const firefly of fireflies) {
            if (this.canReproduce(firefly)) {
                if (Math.random() < this.config.reproductionChance) {
                    this.reproduce(firefly);
                }
            }
        }
    }

    /**
     * Check if firefly can reproduce
     */
    canReproduce(firefly) {
        // Must be mature
        if (firefly.state !== 'mature') return false;

        // Must have enough energy
        if (firefly.energy < this.config.minEnergyToReproduce) return false;

        // Must be old enough
        if (firefly.age < this.config.minAgeToReproduce) return false;

        // Must be high enough tier
        const tierLevel = firefly.tier?.level ?? 0;
        if (tierLevel < this.config.minTierToReproduce) return false;

        // Check cooldown
        if (firefly.lastReproduction) {
            const timeSinceLastRepro = Date.now() - firefly.lastReproduction;
            if (timeSinceLastRepro < this.config.reproductionCooldown) return false;
        }

        // Not in formation or swarm
        if (firefly.inConstellation || firefly.inSwarm) return false;

        return true;
    }

    /**
     * Perform reproduction
     */
    reproduce(parent) {
        // Deduct energy
        parent.energy -= this.config.energyCost;
        parent.lastReproduction = Date.now();

        // Calculate offspring position (nearby)
        const angle = Math.random() * Math.PI * 2;
        const distance = this.config.offspringDistance;
        const offspringX = parent.x + Math.cos(angle) * distance;
        const offspringY = parent.y + Math.sin(angle) * distance;

        // Calculate offspring energy
        const offspringEnergy = parent.energy * this.config.offspringEnergyPercent;

        // Create offspring via ecosystem
        const offspring = this.ecosystem.spawnFirefly({
            x: offspringX,
            y: offspringY,
            digit: parent.digit, // Inherit digit
            generation: (parent.generation ?? 0) + 1,
            tier: this.config.offspringInheritsTier ? parent.tier : undefined
        });

        if (offspring) {
            offspring.energy = offspringEnergy;

            // Create mitosis effect
            this.createMitosisEffect(parent, offspring);
        }

        return offspring;
    }

    /**
     * Create visual effect for mitosis
     */
    createMitosisEffect(parent, offspring) {
        if (!this.particleSystem) return;

        // Connection line particles
        const midX = (parent.x + offspring.x) / 2;
        const midY = (parent.y + offspring.y) / 2;

        // Burst at split point
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const speed = 1 + Math.random() * 2;

            this.particleSystem.createParticle({
                x: midX,
                y: midY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: parent.digit.toString(),
                size: 8 + Math.random() * 4,
                life: 600,
                fadeRate: 0.02,
                type: 'mitosis',
                color: parent.tier?.color ?? '#ffffff',
                friction: 0.96,
                gravity: 0
            });
        }

        // Flash
        this.particleSystem.createFlash(midX, midY, 'mitosis');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReproductionSystem;
}
