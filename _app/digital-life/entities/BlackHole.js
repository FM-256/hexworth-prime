/**
 * BlackHole.js - Cosmic Predator Entity
 *
 * A stationary predator in the Digital Life ecosystem:
 * - Cannot move (fixed position)
 * - Exerts gravitational pull on nearby fireflies
 * - Consumes fireflies that enter the event horizon
 * - Grows larger when consuming "1" digicenz
 * - Shrinks when consuming "0" digicenz
 * - Takes damage from shooting star impacts
 */

class BlackHole {
    /**
     * Create a new black hole
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Identity
        this.id = 'blackhole_' + Date.now();

        // Position (fixed - cannot move)
        this.x = options.x ?? window.innerWidth * 0.15;
        this.y = options.y ?? window.innerHeight * 0.3;

        // Size & Mass
        this.baseSize = options.baseSize ?? 60;
        this.size = this.baseSize;
        this.minSize = 20;
        this.maxSize = 150;
        this.mass = 1.0; // Affects gravitational pull

        // Growth rates
        this.growthRate = options.growthRate ?? 8;  // Size increase per "1" consumed
        this.shrinkRate = options.shrinkRate ?? 6;  // Size decrease per "0" consumed

        // Gravitational physics
        this.gravityRadius = options.gravityRadius ?? 250;  // Pull range
        this.gravityStrength = options.gravityStrength ?? 0.08;  // Pull force
        this.eventHorizonRatio = 0.5;  // Consumption radius as ratio of size (clickable core)

        // Health system (for shooting star damage)
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.healthRegenRate = 0.5;  // Per second
        this.starDamage = 25;  // Damage per shooting star hit
        this.isHurt = false;
        this.hurtDuration = 500;  // ms
        this.hurtTimer = 0;

        // Consumption stats
        this.totalConsumed = 0;
        this.onesConsumed = 0;
        this.zerosConsumed = 0;

        // Symbiosis with planets - orbiting planets boost gravity
        this.symbiosisPlanets = 0; // Current planet count in symbiotic range
        this.symbiosisRange = 400; // Distance to consider planet "in orbit"
        this.symbiosisBoostPerPlanet = 0.15; // 15% gravity boost per planet
        this.maxSymbiosisBoost = 0.75; // Max 75% bonus from planets (diminishing returns)
        this.symbiosisGlowIntensity = 0; // Visual intensity (0-1)

        // Visual state
        this.rotation = 0;
        this.rotationSpeed = 0.02;
        this.pulsePhase = 0;
        this.isActive = true;
        this.opacity = 1;

        // DOM element
        this.element = null;
        this.innerElement = null;
        this.glowElement = null;

        // Callbacks
        this.onConsume = null;
        this.onDamage = null;
        this.onDeath = null;
        this.onAscendedSacrifice = null; // Called when Ascended tier is consumed
        this.onSecretClick = null; // Called when 5 clicks detected (house selector)

        // Secret click tracking (5 clicks = house selector)
        this.clickCount = 0;
        this.clickTimer = null;
        this.clickTimeout = 2000; // Reset after 2 seconds of no clicks
    }

    /**
     * Create DOM element for the black hole
     * @param {HTMLElement} container - Parent container
     */
    createElement(container) {
        // Main container
        this.element = document.createElement('div');
        this.element.className = 'black-hole';
        this.element.id = this.id;

        // Gravitational glow (outer ring)
        this.glowElement = document.createElement('div');
        this.glowElement.className = 'black-hole-glow';
        this.element.appendChild(this.glowElement);

        // Accretion disk (spinning ring)
        this.diskElement = document.createElement('div');
        this.diskElement.className = 'black-hole-disk';
        this.element.appendChild(this.diskElement);

        // Event horizon (inner black circle)
        this.innerElement = document.createElement('div');
        this.innerElement.className = 'black-hole-core';
        this.element.appendChild(this.innerElement);

        // Secret click handler on the core (5 clicks = house selector)
        this.innerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('[DEBUG] Black hole core clicked!');
            this.handleSecretClick();
        });

        this.updateElementStyle();
        container.appendChild(this.element);

        // Inject black hole specific styles
        this.injectStyles();

        return this.element;
    }

    /**
     * Inject CSS styles for the black hole
     */
    injectStyles() {
        if (document.getElementById('black-hole-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'black-hole-styles';
        styles.textContent = `
            .black-hole {
                position: absolute;
                pointer-events: none;
                z-index: 15;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.4;
                transition: opacity 0.3s ease;
            }

            .black-hole:hover {
                opacity: 0.7;
            }

            .black-hole-glow {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(40, 0, 60, 0.2) 0%,
                    rgba(40, 0, 60, 0.05) 40%,
                    transparent 70%
                );
                animation: blackHoleGlow 5s ease-in-out infinite;
            }

            .black-hole-disk {
                position: absolute;
                border-radius: 50%;
                border: 2px solid transparent;
                border-top-color: rgba(100, 60, 140, 0.6);
                border-right-color: rgba(100, 60, 140, 0.3);
                box-shadow:
                    0 0 10px rgba(100, 60, 140, 0.3),
                    inset 0 0 15px rgba(0, 0, 0, 0.5);
                animation: blackHoleSpin 6s linear infinite;
            }

            .black-hole-core {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle,
                    #050005 0%,
                    #0a000a 60%,
                    #0f0510 100%
                );
                box-shadow:
                    inset 0 0 20px rgba(0, 0, 0, 1),
                    0 0 5px rgba(0, 0, 0, 0.6);
                pointer-events: auto;
                cursor: default;
            }

            .black-hole.hurt .black-hole-core {
                background: radial-gradient(circle,
                    #300 0%,
                    #100 60%,
                    #1a0a2e 100%
                );
                box-shadow:
                    inset 0 0 30px rgba(255, 0, 0, 0.5),
                    0 0 20px rgba(255, 0, 0, 0.4);
            }

            .black-hole.hurt .black-hole-disk {
                border-top-color: #ff4444;
                border-right-color: rgba(255, 68, 68, 0.5);
                box-shadow:
                    0 0 30px rgba(255, 68, 68, 0.8),
                    inset 0 0 20px rgba(255, 0, 0, 0.3);
            }

            @keyframes blackHoleSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes blackHoleGlow {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.1); }
            }

            .black-hole.consuming .black-hole-disk {
                animation-duration: 1s;
            }

            .black-hole.dormant {
                opacity: 0.3;
            }

            .black-hole.dormant .black-hole-disk {
                animation-duration: 10s;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Update DOM element styles
     */
    updateElementStyle() {
        if (!this.element) return;

        const eventHorizonSize = this.size * this.eventHorizonRatio;
        const diskSize = this.size * 0.8;
        const glowSize = this.gravityRadius * 2;

        // Position container
        this.element.style.left = (this.x - glowSize / 2) + 'px';
        this.element.style.top = (this.y - glowSize / 2) + 'px';
        this.element.style.width = glowSize + 'px';
        this.element.style.height = glowSize + 'px';
        this.element.style.opacity = this.opacity;

        // Glow size (gravity visualization)
        this.glowElement.style.width = glowSize + 'px';
        this.glowElement.style.height = glowSize + 'px';

        // Disk size
        this.diskElement.style.width = diskSize + 'px';
        this.diskElement.style.height = diskSize + 'px';

        // Core size
        this.innerElement.style.width = eventHorizonSize + 'px';
        this.innerElement.style.height = eventHorizonSize + 'px';

        // Hurt state
        if (this.isHurt) {
            this.element.classList.add('hurt');
        } else {
            this.element.classList.remove('hurt');
        }

        // Active state
        if (!this.isActive) {
            this.element.classList.add('dormant');
        } else {
            this.element.classList.remove('dormant');
        }

        // Symbiosis visual feedback - intensified glow and faster spin with more planets
        if (this.symbiosisGlowIntensity > 0) {
            this.element.classList.add('symbiosis');

            // Enhance glow based on planet count
            const glowMultiplier = 1 + (this.symbiosisGlowIntensity * 0.5);
            this.glowElement.style.transform = `scale(${glowMultiplier})`;
            this.glowElement.style.opacity = 0.6 + (this.symbiosisGlowIntensity * 0.4);

            // Faster spin based on symbiosis
            const spinSpeed = 4 - (this.symbiosisGlowIntensity * 2); // 4s down to 2s
            this.diskElement.style.animationDuration = spinSpeed + 's';

            // Purple-gold gradient shift based on symbiosis intensity
            const goldAmount = Math.round(this.symbiosisGlowIntensity * 100);
            this.diskElement.style.borderTopColor = `hsl(${280 - goldAmount}, 60%, 60%)`;
        } else {
            this.element.classList.remove('symbiosis');
            this.glowElement.style.transform = '';
            this.glowElement.style.opacity = '';
            this.diskElement.style.animationDuration = '';
            this.diskElement.style.borderTopColor = '';
        }
    }

    /**
     * Main update loop
     * @param {number} deltaTime - Time since last frame (ms)
     */
    update(deltaTime) {
        if (!this.isActive) return;

        // Update rotation (visual only)
        this.rotation += this.rotationSpeed * (deltaTime / 16);
        this.pulsePhase += 0.05;

        // Regenerate health slowly
        if (this.health < this.maxHealth) {
            this.health = Math.min(this.maxHealth,
                this.health + this.healthRegenRate * (deltaTime / 1000));
        }

        // Update hurt timer
        if (this.isHurt) {
            this.hurtTimer -= deltaTime;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }

        // Update mass based on size
        this.mass = this.size / this.baseSize;

        // Update gravity radius based on size
        this.gravityRadius = 150 + (this.size * 1.5);

        // Update DOM
        this.updateElementStyle();
    }

    /**
     * Update symbiosis with nearby planets
     * @param {Array} planets - Array of Planet objects
     */
    updateSymbiosis(planets) {
        let inRangePlanets = 0;

        for (const planet of planets) {
            if (!planet.isMature) continue;

            const dx = this.x - planet.x;
            const dy = this.y - planet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.symbiosisRange) {
                inRangePlanets++;
            }
        }

        this.symbiosisPlanets = inRangePlanets;

        // Calculate symbiosis glow intensity (for visual feedback)
        this.symbiosisGlowIntensity = Math.min(1, inRangePlanets * 0.25);
    }

    /**
     * Get the current symbiosis gravity multiplier
     * Uses diminishing returns formula for balance
     * @returns {number} - Multiplier (1.0 = no boost)
     */
    getSymbiosisMultiplier() {
        if (this.symbiosisPlanets === 0) return 1.0;

        // Diminishing returns: each planet adds less than the last
        // Formula: boost = maxBoost * (1 - e^(-k * planetCount))
        const k = 0.5; // Steepness of curve
        const rawBoost = this.maxSymbiosisBoost * (1 - Math.exp(-k * this.symbiosisPlanets));

        return 1.0 + rawBoost;
    }

    /**
     * Calculate gravitational force on a firefly
     * @param {Firefly} firefly - The firefly to calculate force for
     * @returns {Object} - {fx, fy} force components, or null if out of range
     */
    calculateGravity(firefly) {
        const dx = this.x - firefly.x;
        const dy = this.y - firefly.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Out of gravity range
        if (distance > this.gravityRadius || distance < 1) {
            return null;
        }

        // Calculate force (stronger when closer, scaled by mass)
        // Apply symbiosis multiplier from orbiting planets!
        const symbiosisMultiplier = this.getSymbiosisMultiplier();
        const strength = this.gravityStrength * this.mass * symbiosisMultiplier *
            Math.pow((this.gravityRadius - distance) / this.gravityRadius, 2);

        // Normalize direction and apply force
        const fx = (dx / distance) * strength;
        const fy = (dy / distance) * strength;

        return { fx, fy, distance };
    }

    /**
     * Check if a firefly should be consumed
     * @param {Firefly} firefly - The firefly to check
     * @returns {boolean} - True if consumed
     */
    checkConsumption(firefly) {
        if (!this.isActive) return false;

        const dx = this.x - firefly.x;
        const dy = this.y - firefly.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const eventHorizon = this.size * this.eventHorizonRatio;

        if (distance < eventHorizon) {
            this.consume(firefly);
            return true;
        }

        return false;
    }

    /**
     * Consume a firefly
     * @param {Firefly} firefly - The firefly being consumed
     */
    consume(firefly) {
        this.totalConsumed++;

        // Check if this is an Ascended tier sacrifice (creates a planet!)
        const isAscended = firefly.tier && firefly.tier.level === 4;

        if (isAscended) {
            // Ascended sacrifice - trigger planet birth!
            if (this.onAscendedSacrifice) {
                this.onAscendedSacrifice(this, firefly);
            }
            // Ascended sacrifices don't grow/shrink the black hole - they transcend
        } else if (firefly.digit === 1) {
            // Ones make the black hole grow
            this.onesConsumed++;
            this.size = Math.min(this.maxSize, this.size + this.growthRate);
            this.element?.classList.add('consuming');
            setTimeout(() => this.element?.classList.remove('consuming'), 300);
        } else {
            // Zeros make the black hole shrink
            this.zerosConsumed++;
            this.size = Math.max(this.minSize, this.size - this.shrinkRate);
        }

        // Callback for normal consumption
        if (this.onConsume) {
            this.onConsume(this, firefly);
        }
    }

    /**
     * Take damage from a shooting star
     * @param {number} damage - Damage amount (optional, uses default)
     */
    takeDamage(damage = null) {
        const actualDamage = damage ?? this.starDamage;

        this.health = Math.max(0, this.health - actualDamage);
        this.isHurt = true;
        this.hurtTimer = this.hurtDuration;

        // Shrink slightly when hurt
        this.size = Math.max(this.minSize, this.size - 5);

        // Callback
        if (this.onDamage) {
            this.onDamage(this, actualDamage);
        }

        // Check death
        if (this.health <= 0) {
            this.die();
        }
    }

    /**
     * Check if shooting star hits the black hole
     * @param {Object} star - Shooting star object with x, y properties
     * @returns {boolean} - True if hit
     */
    checkStarCollision(star) {
        const dx = this.x - star.x;
        const dy = this.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Hit the disk area
        const hitRadius = this.size * 0.5;

        return distance < hitRadius;
    }

    /**
     * Black hole death (temporary - will respawn)
     */
    die() {
        this.isActive = false;
        this.opacity = 0.3;

        if (this.onDeath) {
            this.onDeath(this);
        }

        // Respawn after delay
        setTimeout(() => {
            this.respawn();
        }, 10000); // 10 second respawn
    }

    /**
     * Respawn the black hole
     */
    respawn() {
        this.health = this.maxHealth;
        this.size = this.baseSize;
        this.isActive = true;
        this.opacity = 1;
        this.isHurt = false;
    }

    /**
     * Handle secret click pattern (5 clicks = house selector)
     */
    handleSecretClick() {
        console.log('[DEBUG] handleSecretClick called, current count:', this.clickCount);

        // Reset timer on each click
        if (this.clickTimer) {
            clearTimeout(this.clickTimer);
        }

        this.clickCount++;

        // Subtle visual pulse feedback (no console hints!)
        if (this.innerElement) {
            this.innerElement.style.transform = 'scale(1.15)';
            setTimeout(() => {
                if (this.innerElement) {
                    this.innerElement.style.transform = '';
                }
            }, 100);
        }

        // Check if pattern complete
        if (this.clickCount >= 5) {
            console.log('[DEBUG] 5 clicks reached! Triggering callback...');
            this.clickCount = 0;

            if (this.onSecretClick) {
                console.log('[DEBUG] onSecretClick callback exists, calling it');
                this.onSecretClick(this);
            } else {
                console.log('[DEBUG] WARNING: onSecretClick callback is NOT set!');
            }
            return;
        }

        // Reset after timeout
        this.clickTimer = setTimeout(() => {
            this.clickCount = 0;
        }, this.clickTimeout);
    }

    /**
     * Get current state info
     */
    getStateInfo() {
        return {
            id: this.id,
            position: { x: Math.round(this.x), y: Math.round(this.y) },
            size: Math.round(this.size),
            health: Math.round(this.health),
            totalConsumed: this.totalConsumed,
            onesConsumed: this.onesConsumed,
            zerosConsumed: this.zerosConsumed,
            gravityRadius: Math.round(this.gravityRadius),
            isActive: this.isActive
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
    module.exports = BlackHole;
}
