/**
 * Firefly.js - Individual Binary Firefly Entity
 *
 * A single digital organism in the ecosystem. Each firefly has:
 * - A digit (0 or 1)
 * - A life cycle (birth → growing → mature → dying)
 * - Physical properties (position, velocity, size)
 * - Energy and generation tracking
 */

class Firefly {
    // Life cycle states
    static STATES = {
        BIRTH: 'birth',
        GROWING: 'growing',
        MATURE: 'mature',
        DYING: 'dying',
        DEAD: 'dead'
    };

    // Evolution tiers - each tier is stronger with longer life
    static TIERS = {
        BASIC: {
            level: 0,
            name: 'Basic',
            color: '#ffffff',           // White
            glowColor: 'rgba(255, 255, 255, 0.6)',
            lifeMultiplier: 1.0,        // Normal life span
            gravityResist: 0,           // No resistance to black hole
            evolveThreshold: 3          // Collisions needed to evolve
        },
        CHARGED: {
            level: 1,
            name: 'Charged',
            color: '#9f7aea',           // Purple (theme color)
            glowColor: 'rgba(159, 122, 234, 0.6)',
            lifeMultiplier: 1.5,        // 50% longer life
            gravityResist: 0.15,        // 15% resistance
            evolveThreshold: 5
        },
        RADIANT: {
            level: 2,
            name: 'Radiant',
            color: '#38bdf8',           // Cyan/Blue
            glowColor: 'rgba(56, 189, 248, 0.6)',
            lifeMultiplier: 2.0,        // 2x life span
            gravityResist: 0.30,        // 30% resistance
            evolveThreshold: 8
        },
        PRISMATIC: {
            level: 3,
            name: 'Prismatic',
            color: '#fbbf24',           // Gold
            glowColor: 'rgba(251, 191, 36, 0.6)',
            lifeMultiplier: 3.0,        // 3x life span
            gravityResist: 0.50,        // 50% resistance
            evolveThreshold: 12
        },
        ASCENDED: {
            level: 4,
            name: 'Ascended',
            color: '#22c55e',           // Green (life)
            glowColor: 'rgba(34, 197, 94, 0.6)',
            lifeMultiplier: 5.0,        // 5x life span
            gravityResist: 0.75,        // 75% resistance
            evolveThreshold: Infinity   // Cannot evolve further
        }
    };

    // Get tier by level
    static getTierByLevel(level) {
        const tiers = Object.values(Firefly.TIERS);
        return tiers.find(t => t.level === level) || Firefly.TIERS.BASIC;
    }

    // Get next tier
    static getNextTier(currentTier) {
        const nextLevel = currentTier.level + 1;
        return Firefly.getTierByLevel(nextLevel);
    }

    /**
     * Create a new firefly
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Identity
        this.id = Firefly.generateId();
        this.digit = options.digit ?? (Math.random() > 0.5 ? 1 : 0);
        this.generation = options.generation ?? 0;

        // Evolution tier
        this.tier = options.tier ?? Firefly.TIERS.BASIC;
        this.evolutionProgress = 0; // Collisions toward next tier

        // Position & Movement
        // Ensure we have valid window dimensions (guard against 0 during early init)
        const safeWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const safeHeight = window.innerHeight || document.documentElement.clientHeight || 600;
        this.x = options.x ?? Math.random() * safeWidth;
        this.y = options.y ?? Math.random() * safeHeight;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.baseSpeed = 0.3 + Math.random() * 0.3;

        // Organic movement parameters
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.015 + Math.random() * 0.015;
        this.pulseOffset = Math.random() * Math.PI * 2;

        // Size & Appearance (tier affects size)
        this.baseSize = 12 + (this.tier.level * 2);
        this.size = options.size ?? this.baseSize * 0.3; // Start small
        this.maxSize = this.baseSize + (this.generation * 2) + (this.tier.level * 3);
        this.opacity = 0;
        this.targetOpacity = 0.7 + (this.tier.level * 0.05); // Higher tiers slightly brighter

        // Life cycle (tier affects lifespan)
        this.state = Firefly.STATES.BIRTH;
        this.age = 0;
        this.baseMaxAge = 120000 + Math.random() * 120000; // 120-240 seconds base (2-4 min)
        this.maxAge = this.baseMaxAge * this.tier.lifeMultiplier;
        this.birthDuration = 3500; // 3.5 seconds to fully appear (slower emergence)
        this.growthDuration = 12000; // 12 seconds to mature (longer childhood)

        // Energy system
        this.energy = 100;
        this.energyDecayRate = 0.006 / (1 + this.tier.level * 0.3); // Much slower decay, tiers help more
        this.collisionEnergyBoost = 35; // More energy from collisions to sustain longer life

        // Collision tracking
        this.collisionCooldown = 0;
        this.collisionCooldownDuration = 2000; // 2 seconds
        this.collisionCount = 0;

        // Gravity resistance (from tier)
        this.gravityResist = this.tier.gravityResist;

        // DOM element (created by Ecosystem)
        this.element = null;

        // Callbacks
        this.onDeath = null;
        this.onCollision = null;
        this.onEvolve = null;
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return 'firefly_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Create DOM element for this firefly
     * @param {HTMLElement} container - Parent container
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'firefly';
        this.element.textContent = this.digit;
        this.element.dataset.id = this.id;
        this.element.dataset.state = this.state;

        this.updateElementStyle();
        container.appendChild(this.element);

        return this.element;
    }

    /**
     * Update DOM element styles
     */
    updateElementStyle() {
        if (!this.element) return;

        // Apply glitch offset if present (glitch rare fireflies)
        const glitchX = this.glitchOffset?.x ?? 0;
        const glitchY = this.glitchOffset?.y ?? 0;

        this.element.style.left = (this.x + glitchX) + 'px';
        this.element.style.top = (this.y + glitchY) + 'px';

        // Apply size multiplier for rare fireflies
        const sizeMultiplier = this.sizeMultiplier ?? 1;
        this.element.style.fontSize = (this.size * sizeMultiplier) + 'px';

        this.element.style.opacity = this.opacity;

        // Use rare symbol if available, otherwise digit
        this.element.textContent = this.rareSymbol ?? this.digit;

        this.element.dataset.state = this.state;
        this.element.dataset.digit = this.digit;
        this.element.dataset.tier = this.tier.level;
        this.element.dataset.rare = this.rareType ?? '';

        // Determine color - constellation color overrides tier color when in formation
        let displayColor = this.tier.color;
        let glowColor = this.tier.glowColor;
        let glowIntensity = 1;

        // Constellation override - twinkling gradient colors!
        if (this.inConstellation && this.constellationColor) {
            displayColor = this.constellationColor;
            glowColor = this.constellationColor;
            glowIntensity = this.constellationGlow || 1.5;
        }

        // Rare firefly override
        if (this.rareColor) {
            displayColor = this.rareColor;
            glowColor = this.rareGlow || this.rareColor;
        }

        // Elemental effect overlay - adds colored aura from planet powers
        if (this.elementalEffect && this.elementalColor) {
            // Blend elemental color with existing glow
            glowColor = this.elementalColor;

            if (this.elementalEffect === 'timeDilation') {
                // Time dilation: subtle pulsing cyan aura
                glowIntensity *= 1.2;
            } else if (this.elementalEffect === 'energize') {
                // Energize: bright golden boost
                glowIntensity *= (this.brightnessBoost ?? 1);
            }
        }

        // Apply brightness boost from Unity Sphere
        if (this.brightnessBoost && this.brightnessBoost > 1) {
            glowIntensity *= this.brightnessBoost;
        }

        // Apply colors with glow intensity
        this.element.style.color = displayColor;
        this.element.style.textShadow = `
            0 0 ${5 * glowIntensity}px ${glowColor},
            0 0 ${10 * glowIntensity}px ${glowColor},
            0 0 ${20 * glowIntensity}px ${glowColor}
        `;
    }

    /**
     * Main update loop - called each frame
     * @param {number} deltaTime - Time since last frame (ms)
     * @param {number} time - Current time for animations
     */
    update(deltaTime, time) {
        if (this.state === Firefly.STATES.DEAD) return;

        // Update age (with time dilation from Null World planets)
        // Time dilation slows aging, giving fireflies extended life
        const timeFactor = this.timeDilationFactor ?? 1;
        this.age += deltaTime * timeFactor;

        // Update collision cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= deltaTime;
        }

        // State machine
        switch (this.state) {
            case Firefly.STATES.BIRTH:
                this.updateBirth(deltaTime);
                break;
            case Firefly.STATES.GROWING:
                this.updateGrowing(deltaTime);
                break;
            case Firefly.STATES.MATURE:
                this.updateMature(deltaTime);
                break;
            case Firefly.STATES.DYING:
                this.updateDying(deltaTime);
                break;
        }

        // Update movement (all states except DEAD)
        this.updateMovement(time);

        // Update energy decay
        this.updateEnergy(deltaTime);

        // Update DOM
        this.updateElementStyle();
    }

    /**
     * Birth state - fading in, growing
     */
    updateBirth(deltaTime) {
        const progress = Math.min(this.age / this.birthDuration, 1);

        // Ease in
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        this.opacity = easeProgress * this.targetOpacity * 0.5; // Start dim
        this.size = this.baseSize * 0.3 + (this.baseSize * 0.3 * easeProgress);

        if (progress >= 1) {
            this.state = Firefly.STATES.GROWING;
            this.age = 0; // Reset age for growth phase
        }
    }

    /**
     * Growing state - reaching full size and brightness
     */
    updateGrowing(deltaTime) {
        const progress = Math.min(this.age / this.growthDuration, 1);

        // Ease in-out
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        this.opacity = (0.5 + 0.5 * easeProgress) * this.targetOpacity;
        this.size = this.baseSize * 0.6 + (this.maxSize - this.baseSize * 0.6) * easeProgress;

        // Small chance to flip digit during growth
        if (Math.random() < 0.0005) {
            this.digit = this.digit === 1 ? 0 : 1;
        }

        if (progress >= 1) {
            this.state = Firefly.STATES.MATURE;
            this.age = 0; // Reset age for mature phase
        }
    }

    /**
     * Mature state - full life, waiting for death trigger
     */
    updateMature(deltaTime) {
        // Calculate desperation for visual effects
        const desperation = this.getDesperation();

        // Pulsing opacity - FASTER when desperate (frantic heartbeat effect)
        const basePulseSpeed = 0.002;
        const pulseSpeed = basePulseSpeed * (1 + desperation * 4); // Up to 5x faster pulse
        const pulse = Math.sin(Date.now() * pulseSpeed + this.pulseOffset);

        // More erratic opacity when desperate
        const baseOpacity = this.targetOpacity * (0.7 + 0.3 * pulse);
        const desperateFlicker = desperation > 0.5 ? (Math.random() * 0.2 * desperation) : 0;
        this.opacity = baseOpacity + desperateFlicker;

        // More frequent digit flicker when desperate (glitching out)
        const flickerChance = 0.0003 + (desperation * 0.003); // Up to 10x more likely
        if (Math.random() < flickerChance) {
            this.digit = this.digit === 1 ? 0 : 1;
        }

        // Visual indicator: size pulsing when critical (breathing hard)
        if (desperation > 0.6) {
            const breathe = Math.sin(Date.now() * 0.008) * desperation * 3;
            this.size = this.maxSize + breathe;
        }

        // Check death conditions
        if (this.age > this.maxAge || this.energy <= 0) {
            this.startDying();
        }
    }

    /**
     * Dying state - fade out before death
     */
    updateDying(deltaTime) {
        const dyingDuration = 1000; // 1 second death animation
        const progress = Math.min(this.age / dyingDuration, 1);

        this.opacity = this.targetOpacity * (1 - progress);
        this.size = this.size * (1 - progress * 0.3);

        if (progress >= 1) {
            this.die();
        }
    }

    /**
     * Start the dying process
     */
    startDying() {
        if (this.state === Firefly.STATES.DYING || this.state === Firefly.STATES.DEAD) return;

        this.state = Firefly.STATES.DYING;
        this.age = 0;
    }

    /**
     * Complete death - trigger callback and clean up element
     */
    die() {
        this.state = Firefly.STATES.DEAD;

        // Immediately remove DOM element to prevent visual artifacts
        this.destroy();

        if (this.onDeath) {
            this.onDeath(this);
        }
    }

    /**
     * Update movement with organic wobble
     * Desperation increases speed and erratic behavior
     * Planet energize effect also boosts speed
     */
    updateMovement(time) {
        const t = time * 0.001;
        const desperation = this.desperation ?? 0;

        // Speed multiplier: up to 2.5x faster when desperate
        // Unity Sphere planets add additional boost via this.speedMultiplier
        const desperationBoost = 1 + (desperation * 1.5);
        const planetBoost = this.speedMultiplier ?? 1;
        const speedMultiplier = desperationBoost * planetBoost;

        // Organic wobble - more intense when desperate (frantic searching)
        const wobbleIntensity = 1 + (desperation * 2); // Up to 3x wobble
        const wobbleX = Math.sin(t * this.wobbleSpeed + this.wobbleOffset) * 25 * wobbleIntensity;
        const wobbleY = Math.cos(t * this.wobbleSpeed * 0.8 + this.wobbleOffset) * 18 * wobbleIntensity;

        // Random velocity changes - MORE FREQUENT when desperate (searching behavior)
        const directionChangeChance = 0.008 + (desperation * 0.04); // Up to 6x more likely
        if (Math.random() < directionChangeChance) {
            // Stronger impulses when desperate
            const impulseStrength = 0.15 * (1 + desperation * 2);
            this.vx += (Math.random() - 0.5) * impulseStrength;
            this.vy += (Math.random() - 0.5) * impulseStrength;

            // Higher max speed when desperate (adrenaline!)
            const maxSpeed = this.baseSpeed * speedMultiplier;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > maxSpeed) {
                this.vx = (this.vx / speed) * maxSpeed;
                this.vy = (this.vy / speed) * maxSpeed;
            }
        }

        // Apply movement with speed multiplier
        this.x += (this.vx + wobbleX * 0.02) * speedMultiplier;
        this.y += (this.vy + wobbleY * 0.02) * speedMultiplier;

        // Wrap around screen (use safe dimensions)
        const padding = 50;
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;
        if (this.x < -padding) this.x = screenWidth + padding;
        if (this.x > screenWidth + padding) this.x = -padding;
        if (this.y < -padding) this.y = screenHeight + padding;
        if (this.y > screenHeight + padding) this.y = -padding;
    }

    /**
     * Update energy decay
     */
    updateEnergy(deltaTime) {
        if (this.state === Firefly.STATES.MATURE) {
            this.energy -= this.energyDecayRate * (deltaTime / 16); // Normalize to ~60fps
            this.energy = Math.max(0, this.energy);
        }
    }

    /**
     * Calculate desperation level (0 = calm, 1 = maximum desperation)
     * Based on remaining life (age) and energy
     * @returns {number} 0-1 desperation level
     */
    getDesperation() {
        if (this.state !== Firefly.STATES.MATURE) return 0;

        // How much life remains? (0 = about to die, 1 = just born)
        const ageRemaining = Math.max(0, 1 - (this.age / this.maxAge));

        // How much energy remains? (0 = empty, 1 = full)
        const energyRemaining = this.energy / 100;

        // Take the more critical of the two
        const lifeForce = Math.min(ageRemaining, energyRemaining);

        // Convert to desperation (invert and apply curve for dramatic ramp-up)
        // Stays low until ~30% life remaining, then ramps up sharply
        const desperation = Math.pow(1 - lifeForce, 2.5);

        // Cache for external systems to read
        this.desperation = Math.min(1, desperation);

        return this.desperation;
    }

    /**
     * Check if this firefly is desperate enough to actively seek evolution
     * @returns {boolean}
     */
    isDesperate() {
        return this.getDesperation() > 0.4; // 40%+ desperation triggers seeking behavior
    }

    /**
     * Check if critically desperate (last moments)
     * @returns {boolean}
     */
    isCritical() {
        return this.getDesperation() > 0.75; // 75%+ is critical
    }

    /**
     * Handle collision with another firefly
     * @param {Firefly} other - The other firefly
     * @returns {string} - Result type: 'overflow', 'quantum', 'merge', or 'none'
     */
    handleCollision(other) {
        // Check cooldown
        if (this.collisionCooldown > 0 || other.collisionCooldown > 0) {
            return 'none';
        }

        // Only mature fireflies collide meaningfully
        if (this.state !== Firefly.STATES.MATURE || other.state !== Firefly.STATES.MATURE) {
            return 'none';
        }

        let result = 'none';

        if (this.digit === 1 && other.digit === 1) {
            // 1 + 1 = 0 (overflow)
            this.digit = 0;
            other.digit = 0;
            result = 'overflow';
        } else if (this.digit === 0 && other.digit === 0) {
            // 0 + 0 = 1 (quantum flip)
            this.digit = 1;
            other.digit = 1;
            result = 'quantum';
        } else {
            // 1 + 0 = merge energy
            this.energy = Math.min(100, this.energy + this.collisionEnergyBoost);
            other.energy = Math.min(100, other.energy + this.collisionEnergyBoost);
            result = 'merge';
        }

        // Set cooldowns
        this.collisionCooldown = this.collisionCooldownDuration;
        other.collisionCooldown = other.collisionCooldownDuration;

        // Track collisions
        this.collisionCount++;
        other.collisionCount++;

        // Evolution progress - both fireflies gain progress
        // Planet proximity grants evolution multiplier!
        const myMultiplier = this.evolutionMultiplier || 1;
        const otherMultiplier = other.evolutionMultiplier || 1;

        this.evolutionProgress += myMultiplier;
        other.evolutionProgress += otherMultiplier;

        // Clear multipliers after use (must stay near planet to keep bonus)
        this.evolutionMultiplier = null;
        other.evolutionMultiplier = null;

        // Check for evolution
        this.checkEvolution();
        other.checkEvolution();

        // Trigger callback
        if (this.onCollision) {
            this.onCollision(this, other, result);
        }

        return result;
    }

    /**
     * Check if firefly can evolve to next tier
     */
    checkEvolution() {
        if (this.evolutionProgress >= this.tier.evolveThreshold) {
            this.evolve();
        }
    }

    /**
     * Evolve to next tier
     */
    evolve() {
        const nextTier = Firefly.getNextTier(this.tier);

        // Can't evolve past max tier
        if (nextTier.level === this.tier.level) {
            return;
        }

        const oldTier = this.tier;
        this.tier = nextTier;
        this.evolutionProgress = 0;

        // Update stats for new tier
        this.maxAge = this.baseMaxAge * this.tier.lifeMultiplier;
        this.gravityResist = this.tier.gravityResist;
        this.energyDecayRate = 0.006 / (1 + this.tier.level * 0.3); // Match slower decay formula
        this.targetOpacity = 0.7 + (this.tier.level * 0.05);
        this.maxSize = this.baseSize + (this.generation * 2) + (this.tier.level * 3);

        // REBIRTH: Reset age on evolution - they've earned a fresh start!
        this.age = 0;

        // Full energy restore on evolution
        this.energy = 100;

        // Trigger callback
        if (this.onEvolve) {
            this.onEvolve(this, oldTier, this.tier);
        }
    }

    /**
     * Apply force (for scatter effects, mouse interaction, etc.)
     */
    applyForce(fx, fy) {
        this.vx += fx;
        this.vy += fy;
    }

    /**
     * Get distance to another firefly
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Clean up DOM element
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }

    /**
     * Get current state info (for debugging/display)
     */
    getStateInfo() {
        return {
            id: this.id,
            digit: this.digit,
            state: this.state,
            generation: this.generation,
            age: Math.round(this.age),
            energy: Math.round(this.energy),
            collisions: this.collisionCount,
            position: { x: Math.round(this.x), y: Math.round(this.y) }
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Firefly;
}
