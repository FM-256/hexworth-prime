/**
 * GodParticleReaction.js - Firefly Behaviors Around the God Particle
 *
 * Defines how different fireflies react to the God Particle's presence:
 *
 * REACTION TYPES:
 * - Protector: Forms defensive perimeter (like buffalo protecting young)
 * - Worshipper: Spirals inward, pulses brighter
 * - Curious: Orbits closely, investigates
 * - Fearful: Flees to edges of screen
 * - Aggressive: Darts at it, bounces off the aura
 * - Neutral: Normal behavior, slightly drawn toward it
 *
 * Reaction type is determined by firefly properties:
 * - House affiliation
 * - Digit value (0 or 1)
 * - Evolution tier
 * - Energy level
 */

class GodParticleReaction {
    constructor() {
        // Behavior parameters
        this.behaviors = {
            protector: {
                orbitDistance: 200,      // Distance to maintain
                orbitSpeed: 0.02,        // Angular velocity
                formationStrength: 0.8,  // How strictly they hold formation
                facingInward: true       // Face the God Particle
            },
            worshipper: {
                spiralRate: 0.005,       // How fast they spiral in
                minDistance: 80,         // Don't get too close
                pulseMultiplier: 1.5,    // Brightness increase
                spiralTightness: 0.95    // How tight the spiral
            },
            curious: {
                orbitDistance: 120,
                orbitVariance: 30,       // Random variation in orbit
                investigateSpeed: 0.03,
                pauseChance: 0.01        // Chance to pause and "look"
            },
            fearful: {
                fleeSpeed: 2.0,          // How fast they run
                fleeDistance: 400,       // Distance to maintain
                trembleAmount: 2         // Visual shaking
            },
            aggressive: {
                chargeSpeed: 3.0,
                bounceForce: 2.5,
                chargeDistance: 250,     // Start charging from here
                recoveryTime: 2000       // ms before charging again
            },
            neutral: {
                attractionStrength: 0.1,
                maxInfluenceSpeed: 0.5
            }
        };

        // Track charging fireflies (for aggressive behavior)
        this.chargingFireflies = new Map();

        // Active
        this.isActive = false;
    }

    /**
     * Determine reaction type based on firefly properties
     * @param {Object} firefly - The firefly to evaluate
     * @returns {string} Reaction type
     */
    getReactionType(firefly) {
        // Check house affiliation first (if available)
        const house = firefly.house || firefly.houseAffinity || null;

        if (house) {
            switch (house) {
                case 'shield':
                    return 'protector';
                case 'dark-arts':
                    return 'aggressive';
                case 'web':
                    return 'curious';
                case 'eye':
                    return 'worshipper';
                case 'key':
                    return 'fearful';  // Secretive, avoids exposure
                default:
                    break;
            }
        }

        // Check evolution tier
        if (firefly.tier === 'ascended' || firefly.tier === 'elder') {
            return 'protector';  // High-tier entities protect
        }

        // Check digit value
        if (firefly.digit !== undefined) {
            // 1s tend to be more aggressive/curious
            // 0s tend to be more fearful/worshipping
            if (firefly.digit === 1) {
                return Math.random() > 0.5 ? 'curious' : 'aggressive';
            } else {
                return Math.random() > 0.5 ? 'worshipper' : 'fearful';
            }
        }

        // Check energy level
        if (firefly.energy !== undefined) {
            if (firefly.energy > 80) return 'aggressive';
            if (firefly.energy < 20) return 'fearful';
        }

        // Default: random weighted distribution
        const roll = Math.random();
        if (roll < 0.25) return 'protector';
        if (roll < 0.40) return 'worshipper';
        if (roll < 0.60) return 'curious';
        if (roll < 0.75) return 'fearful';
        if (roll < 0.85) return 'aggressive';
        return 'neutral';
    }

    /**
     * Apply behavior to a firefly based on God Particle influence
     * @param {Object} firefly - The firefly to affect
     * @param {Object} godParticle - The God Particle
     * @param {number} deltaTime - Time since last frame (ms)
     */
    applyBehavior(firefly, godParticle, deltaTime) {
        if (!this.isActive || !godParticle || !firefly) return;

        const influence = godParticle.getInfluence(firefly);
        if (influence.strength === 0) {
            // Outside influence range - reset any special states
            firefly.godReaction = null;
            return;
        }

        // Get or assign reaction type
        if (!firefly.godReaction) {
            firefly.godReaction = this.getReactionType(firefly);
        }

        const dt = deltaTime / 1000;
        const reaction = firefly.godReaction;
        const params = this.behaviors[reaction];

        switch (reaction) {
            case 'protector':
                this.applyProtectorBehavior(firefly, godParticle, influence, params, dt);
                break;
            case 'worshipper':
                this.applyWorshipperBehavior(firefly, godParticle, influence, params, dt);
                break;
            case 'curious':
                this.applyCuriousBehavior(firefly, godParticle, influence, params, dt);
                break;
            case 'fearful':
                this.applyFearfulBehavior(firefly, godParticle, influence, params, dt);
                break;
            case 'aggressive':
                this.applyAggressiveBehavior(firefly, godParticle, influence, params, dt);
                break;
            default:
                this.applyNeutralBehavior(firefly, godParticle, influence, params, dt);
        }
    }

    /**
     * Protector: Form defensive perimeter around God Particle
     */
    applyProtectorBehavior(firefly, godParticle, influence, params, dt) {
        const dx = godParticle.x - firefly.x;
        const dy = godParticle.y - firefly.y;
        const distance = influence.distance;

        // Calculate orbit position
        if (!firefly.orbitAngle) {
            firefly.orbitAngle = Math.atan2(dy, dx);
        }
        firefly.orbitAngle += params.orbitSpeed;

        // Target position on the orbit
        const targetX = godParticle.x + Math.cos(firefly.orbitAngle) * params.orbitDistance;
        const targetY = godParticle.y + Math.sin(firefly.orbitAngle) * params.orbitDistance;

        // Move toward target position
        const toTargetX = targetX - firefly.x;
        const toTargetY = targetY - firefly.y;

        firefly.vx += toTargetX * params.formationStrength * dt;
        firefly.vy += toTargetY * params.formationStrength * dt;

        // Face inward
        if (params.facingInward && firefly.element) {
            const angle = Math.atan2(-dy, -dx) * (180 / Math.PI);
            firefly.element.style.transform = `rotate(${angle}deg)`;
        }

        // Boost opacity to show protection
        if (firefly.element) {
            firefly.element.style.filter = `brightness(1.3) drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))`;
        }
    }

    /**
     * Worshipper: Spiral inward, pulse brighter
     */
    applyWorshipperBehavior(firefly, godParticle, influence, params, dt) {
        const dx = godParticle.x - firefly.x;
        const dy = godParticle.y - firefly.y;
        const distance = influence.distance;

        // Don't get too close
        if (distance > params.minDistance) {
            // Spiral toward god particle
            if (!firefly.spiralAngle) {
                firefly.spiralAngle = Math.atan2(dy, dx);
            }
            firefly.spiralAngle += 0.05;

            // Move inward with spiral
            const spiralX = Math.cos(firefly.spiralAngle) * 0.5;
            const spiralY = Math.sin(firefly.spiralAngle) * 0.5;

            firefly.vx = (dx * params.spiralRate + spiralX) * params.spiralTightness;
            firefly.vy = (dy * params.spiralRate + spiralY) * params.spiralTightness;
        } else {
            // At minimum distance, just orbit
            if (!firefly.orbitAngle) firefly.orbitAngle = Math.atan2(dy, dx);
            firefly.orbitAngle += 0.03;
            firefly.vx = Math.cos(firefly.orbitAngle + Math.PI/2) * 0.3;
            firefly.vy = Math.sin(firefly.orbitAngle + Math.PI/2) * 0.3;
        }

        // Pulse brighter
        if (firefly.element) {
            const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.3;
            firefly.element.style.filter = `brightness(${params.pulseMultiplier * pulse}) drop-shadow(0 0 12px rgba(192, 132, 252, 0.8))`;
        }
    }

    /**
     * Curious: Orbit closely, occasionally pause to investigate
     */
    applyCuriousBehavior(firefly, godParticle, influence, params, dt) {
        const dx = godParticle.x - firefly.x;
        const dy = godParticle.y - firefly.y;
        const distance = influence.distance;

        // Random orbit distance variation
        if (!firefly.targetOrbitDistance) {
            firefly.targetOrbitDistance = params.orbitDistance + (Math.random() - 0.5) * params.orbitVariance * 2;
        }

        // Pause occasionally
        if (Math.random() < params.pauseChance) {
            firefly.isPaused = true;
            setTimeout(() => { firefly.isPaused = false; }, 500 + Math.random() * 1000);
        }

        if (firefly.isPaused) {
            firefly.vx *= 0.9;
            firefly.vy *= 0.9;
            return;
        }

        // Orbit behavior
        if (!firefly.orbitAngle) {
            firefly.orbitAngle = Math.atan2(dy, dx);
        }
        firefly.orbitAngle += params.investigateSpeed;

        const targetX = godParticle.x + Math.cos(firefly.orbitAngle) * firefly.targetOrbitDistance;
        const targetY = godParticle.y + Math.sin(firefly.orbitAngle) * firefly.targetOrbitDistance;

        firefly.vx += (targetX - firefly.x) * 0.1;
        firefly.vy += (targetY - firefly.y) * 0.1;

        // Curious glow
        if (firefly.element) {
            firefly.element.style.filter = `brightness(1.1) drop-shadow(0 0 6px rgba(96, 165, 250, 0.5))`;
        }
    }

    /**
     * Fearful: Flee from the God Particle
     */
    applyFearfulBehavior(firefly, godParticle, influence, params, dt) {
        const dx = firefly.x - godParticle.x;  // Away from god particle
        const dy = firefly.y - godParticle.y;
        const distance = influence.distance;

        // Flee faster when closer
        const urgency = 1 - (distance / godParticle.auraRadius);
        const fleeStrength = params.fleeSpeed * urgency;

        // Normalize and apply flee force
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            firefly.vx += (dx / len) * fleeStrength * dt * 60;
            firefly.vy += (dy / len) * fleeStrength * dt * 60;
        }

        // Tremble effect
        if (firefly.element) {
            const trembleX = (Math.random() - 0.5) * params.trembleAmount;
            const trembleY = (Math.random() - 0.5) * params.trembleAmount;
            firefly.element.style.transform = `translate(${trembleX}px, ${trembleY}px)`;
            firefly.element.style.filter = `brightness(0.8) opacity(0.7)`;
        }
    }

    /**
     * Aggressive: Charge at God Particle, bounce off
     */
    applyAggressiveBehavior(firefly, godParticle, influence, params, dt) {
        const dx = godParticle.x - firefly.x;
        const dy = godParticle.y - firefly.y;
        const distance = influence.distance;

        // Check if recovering from last charge
        const lastCharge = this.chargingFireflies.get(firefly.id);
        if (lastCharge && Date.now() - lastCharge < params.recoveryTime) {
            // Still recovering - circle menacingly
            if (!firefly.orbitAngle) firefly.orbitAngle = Math.atan2(dy, dx);
            firefly.orbitAngle += 0.04;
            const targetX = godParticle.x + Math.cos(firefly.orbitAngle) * params.chargeDistance;
            const targetY = godParticle.y + Math.sin(firefly.orbitAngle) * params.chargeDistance;
            firefly.vx += (targetX - firefly.x) * 0.05;
            firefly.vy += (targetY - firefly.y) * 0.05;
            return;
        }

        // Check if should start charge
        if (!firefly.isCharging && distance < params.chargeDistance && distance > 100) {
            firefly.isCharging = true;
        }

        if (firefly.isCharging) {
            // Charge toward god particle
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len > 0) {
                firefly.vx = (dx / len) * params.chargeSpeed;
                firefly.vy = (dy / len) * params.chargeSpeed;
            }

            // Check for "hit" (close to god particle)
            if (distance < 80) {
                // Bounce off!
                firefly.vx = -(dx / len) * params.bounceForce;
                firefly.vy = -(dy / len) * params.bounceForce;
                firefly.isCharging = false;
                this.chargingFireflies.set(firefly.id, Date.now());

                // Flash effect
                if (firefly.element) {
                    firefly.element.style.filter = `brightness(2) drop-shadow(0 0 15px rgba(239, 68, 68, 1))`;
                    setTimeout(() => {
                        if (firefly.element) {
                            firefly.element.style.filter = '';
                        }
                    }, 200);
                }
            }
        }

        // Aggressive glow
        if (firefly.element && !firefly.isCharging) {
            firefly.element.style.filter = `brightness(1.2) drop-shadow(0 0 6px rgba(239, 68, 68, 0.6))`;
        }
    }

    /**
     * Neutral: Slight attraction, mostly normal behavior
     */
    applyNeutralBehavior(firefly, godParticle, influence, params, dt) {
        // Gentle pull toward god particle
        firefly.vx += influence.direction.x * params.attractionStrength * influence.strength;
        firefly.vy += influence.direction.y * params.attractionStrength * influence.strength;

        // Clamp influence
        const speed = Math.sqrt(firefly.vx * firefly.vx + firefly.vy * firefly.vy);
        if (speed > params.maxInfluenceSpeed) {
            firefly.vx = (firefly.vx / speed) * params.maxInfluenceSpeed;
            firefly.vy = (firefly.vy / speed) * params.maxInfluenceSpeed;
        }
    }

    /**
     * Activate the reaction system
     */
    activate() {
        this.isActive = true;
        console.log('%c🌟 God Particle reactions activated', 'color: #a855f7;');
    }

    /**
     * Deactivate and clean up
     */
    deactivate() {
        this.isActive = false;
        this.chargingFireflies.clear();
    }
}

// Create global instance
const godParticleReaction = new GodParticleReaction();

// Listen for god mode events
window.addEventListener('godModeActivated', () => godParticleReaction.activate());
window.addEventListener('godModeDeactivated', () => godParticleReaction.deactivate());

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GodParticleReaction, godParticleReaction };
}
