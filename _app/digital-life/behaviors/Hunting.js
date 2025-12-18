/**
 * Hunting.js - Predator/Prey Behavior System
 *
 * Implements the hunt dynamics:
 * - 1s (Hunters) pursue nearby 0s
 * - 0s (Prey) flee from nearby 1s
 * - Hunger/satiation affects aggression
 * - Natural population oscillation
 */

class HuntingSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            detectionRadius: config.detectionRadius ?? 150,
            huntSpeed: config.huntSpeed ?? 0.8,
            fleeSpeed: config.fleeSpeed ?? 1.2,
            huntForce: config.huntForce ?? 0.03,
            fleeForce: config.fleeForce ?? 0.05,
            // Hunger system
            hungerEnabled: config.hungerEnabled ?? true,
            maxHunger: config.maxHunger ?? 100,
            hungerDecayRate: config.hungerDecayRate ?? 0.5, // Per second
            satiationOnCatch: config.satiationOnCatch ?? 50,
            // Balance
            predatorSlowdownThreshold: config.predatorSlowdownThreshold ?? 0.7, // If >70% are 1s, slow down
            preySpeedupThreshold: config.preySpeedupThreshold ?? 0.3, // If <30% are 0s, speed up prey
            ...config
        };

        this.ecosystem = null;
    }

    /**
     * Connect to ecosystem
     */
    setEcosystem(ecosystem) {
        this.ecosystem = ecosystem;
        return this;
    }

    /**
     * Process hunting behaviors for all fireflies
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (!this.config.enabled || !this.ecosystem) return;

        const fireflies = this.ecosystem.fireflies;
        const population = this.ecosystem.getPopulationByDigit();
        const total = population.zeros + population.ones;

        if (total === 0) return;

        // Calculate balance modifiers
        const predatorRatio = population.ones / total;
        const balanceModifier = this.calculateBalanceModifier(predatorRatio);

        // Process each firefly
        for (const firefly of fireflies) {
            // Skip non-mature fireflies
            if (firefly.state !== 'mature') continue;

            // DESPERATION BEHAVIOR: Overrides normal hunting when desperate
            // Desperate fireflies seek ANY collision for evolution chance
            if (firefly.isDesperate && firefly.isDesperate()) {
                this.processDesperateSeek(firefly, fireflies, deltaTime);
            }

            if (firefly.digit === 1) {
                // Hunter behavior
                this.processHunter(firefly, fireflies, deltaTime, balanceModifier);
            } else {
                // Prey behavior
                this.processPrey(firefly, fireflies, deltaTime, balanceModifier);
            }
        }
    }

    /**
     * Process desperate seeking behavior - firefly actively seeks ANY collision
     * to trigger evolution and get a rebirth
     */
    processDesperateSeek(firefly, fireflies, deltaTime) {
        const desperation = firefly.getDesperation();

        // Find nearest firefly (any digit, any tier)
        let nearestTarget = null;
        let nearestDist = Infinity;

        for (const other of fireflies) {
            if (other === firefly || other.state !== 'mature') continue;

            const dist = firefly.distanceTo(other);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestTarget = other;
            }
        }

        // Desperately chase nearest firefly
        if (nearestTarget && nearestDist < 300) {
            const dx = nearestTarget.x - firefly.x;
            const dy = nearestTarget.y - firefly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Force scales with desperation - critical fireflies are VERY aggressive
                const baseForce = 0.04;
                const desperationBoost = 1 + (desperation * 3); // Up to 4x force when critical
                const force = baseForce * desperationBoost;

                firefly.applyForce(
                    (dx / dist) * force,
                    (dy / dist) * force
                );

                // Mark as seeking (for visual feedback)
                firefly.seekingCollision = true;
            }
        } else {
            firefly.seekingCollision = false;
        }
    }

    /**
     * Calculate balance modifier based on population ratio
     */
    calculateBalanceModifier(predatorRatio) {
        let hunterMod = 1.0;
        let preyMod = 1.0;

        // Too many predators - slow them down
        if (predatorRatio > this.config.predatorSlowdownThreshold) {
            const excess = (predatorRatio - this.config.predatorSlowdownThreshold) /
                          (1 - this.config.predatorSlowdownThreshold);
            hunterMod = 1.0 - (excess * 0.7); // Up to 70% slower
        }

        // Too few prey - speed them up
        if (predatorRatio > (1 - this.config.preySpeedupThreshold)) {
            const scarcity = (predatorRatio - (1 - this.config.preySpeedupThreshold)) /
                            this.config.preySpeedupThreshold;
            preyMod = 1.0 + (scarcity * 0.5); // Up to 50% faster
        }

        return { hunterMod, preyMod };
    }

    /**
     * Process hunter (1) behavior - pursue nearest prey
     */
    processHunter(hunter, fireflies, deltaTime, balanceModifier) {
        // Update hunger
        if (this.config.hungerEnabled) {
            hunter.hunger = hunter.hunger ?? this.config.maxHunger;
            hunter.hunger = Math.max(0, hunter.hunger - this.config.hungerDecayRate * (deltaTime / 1000));

            // Hunger affects aggression
            const hungerFactor = hunter.hunger / this.config.maxHunger;
            if (hungerFactor > 0.8) {
                // Well fed - lazy, don't hunt much
                return;
            }
        }

        // Find nearest prey
        let nearestPrey = null;
        let nearestDist = this.config.detectionRadius;

        for (const other of fireflies) {
            if (other === hunter || other.digit !== 0 || other.state !== 'mature') continue;

            const dist = hunter.distanceTo(other);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestPrey = other;
            }
        }

        // Pursue prey
        if (nearestPrey) {
            const dx = nearestPrey.x - hunter.x;
            const dy = nearestPrey.y - hunter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Hunger makes hunters more aggressive
                const hungerBoost = this.config.hungerEnabled ?
                    (1 + (1 - (hunter.hunger / this.config.maxHunger)) * 0.5) : 1;

                const force = this.config.huntForce * balanceModifier.hunterMod * hungerBoost;
                hunter.applyForce(
                    (dx / dist) * force,
                    (dy / dist) * force
                );
            }
        }
    }

    /**
     * Process prey (0) behavior - flee from nearest hunter
     */
    processPrey(prey, fireflies, deltaTime, balanceModifier) {
        // Find threats within detection radius
        let fleeX = 0;
        let fleeY = 0;
        let threatCount = 0;

        for (const other of fireflies) {
            if (other === prey || other.digit !== 1 || other.state !== 'mature') continue;

            const dist = prey.distanceTo(other);
            if (dist < this.config.detectionRadius && dist > 0) {
                // Calculate flee direction (away from threat)
                const dx = prey.x - other.x;
                const dy = prey.y - other.y;

                // Closer threats are more urgent
                const urgency = 1 - (dist / this.config.detectionRadius);
                fleeX += (dx / dist) * urgency;
                fleeY += (dy / dist) * urgency;
                threatCount++;
            }
        }

        // Apply flee force
        if (threatCount > 0) {
            const magnitude = Math.sqrt(fleeX * fleeX + fleeY * fleeY);
            if (magnitude > 0) {
                const force = this.config.fleeForce * balanceModifier.preyMod;
                prey.applyForce(
                    (fleeX / magnitude) * force,
                    (fleeY / magnitude) * force
                );
            }

            // Prey cluster together for safety (slight attraction to other 0s)
            this.clusterWithAllies(prey, fireflies);
        }
    }

    /**
     * Prey cluster with other prey for safety
     */
    clusterWithAllies(prey, fireflies) {
        let centerX = 0;
        let centerY = 0;
        let allyCount = 0;

        for (const other of fireflies) {
            if (other === prey || other.digit !== 0 || other.state !== 'mature') continue;

            const dist = prey.distanceTo(other);
            if (dist < this.config.detectionRadius * 0.8 && dist > 20) {
                centerX += other.x;
                centerY += other.y;
                allyCount++;
            }
        }

        if (allyCount > 0) {
            centerX /= allyCount;
            centerY /= allyCount;

            const dx = centerX - prey.x;
            const dy = centerY - prey.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                // Gentle pull toward allies
                prey.applyForce(
                    (dx / dist) * 0.01,
                    (dy / dist) * 0.01
                );
            }
        }
    }

    /**
     * Called when a hunter catches prey (collision between 1 and 0)
     */
    onCatch(hunter, prey) {
        if (this.config.hungerEnabled && hunter.hunger !== undefined) {
            hunter.hunger = Math.min(this.config.maxHunger,
                hunter.hunger + this.config.satiationOnCatch);
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuntingSystem;
}
