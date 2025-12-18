/**
 * Ecosystem.js - Population Manager for Digital Life
 *
 * Manages the entire firefly population:
 * - Spawning and despawning
 * - Population limits
 * - Collision detection orchestration
 * - Statistics tracking
 */

class Ecosystem {
    /**
     * Create a new ecosystem
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        // Population settings
        this.config = {
            initialPopulation: config.initialPopulation ?? 20,
            minPopulation: config.minPopulation ?? 10,
            maxPopulation: config.maxPopulation ?? 50,
            spawnRate: config.spawnRate ?? 0.02, // Chance per frame when under min
            collisionRadius: config.collisionRadius ?? 25,
            // Planet population control (prevents performance issues)
            maxPlanets: config.maxPlanets ?? 5,          // Maximum planets allowed
            planetCleanupAge: config.planetCleanupAge ?? 180000, // Force cleanup after 3 min if over limit
            ...config
        };

        // Container
        this.container = null;

        // Population
        this.fireflies = [];
        this.pendingRemovals = [];

        // Animation
        this.animationFrameId = null;
        this.lastTime = 0;
        this.isRunning = false;

        // Statistics
        this.stats = {
            totalBirths: 0,
            totalDeaths: 0,
            totalCollisions: 0,
            overflowCollisions: 0,   // 1+1=0
            quantumCollisions: 0,     // 0+0=1
            mergeCollisions: 0,       // 1+0
            totalEvolutions: 0,
            planetsCreated: 0,
            currentPopulation: 0,
            averageAge: 0,
            averageEnergy: 0
        };

        // Terraform system - multiple planets change the environment
        this.terraform = {
            active: false,
            intensity: 0,           // 0-1 based on planet count
            dominantType: null,     // 'null' (0) or 'unity' (1)
            dominanceRatio: 0.5,    // 0 = all 0-planets, 1 = all 1-planets
            energyRegenBoost: 0,    // Global energy regen multiplier
            minPlanetsForEffect: 2, // Need at least 2 planets to terraform
            overlayElement: null    // DOM element for background effect
        };

        // Planets (created from Ascended sacrifices)
        this.planets = [];

        // Callbacks
        this.onFireflyBirth = null;
        this.onFireflyDeath = null;
        this.onCollision = null;
        this.onEvolution = null;
        this.onPlanetBirth = null;
        this.onStatsUpdate = null;

        // Collision system reference (optional external system)
        this.collisionSystem = null;

        // Particle system reference (for death effects)
        this.particleSystem = null;

        // Black hole predator (optional)
        this.blackHole = null;
    }

    /**
     * Initialize the ecosystem
     * @param {HTMLElement} container - DOM container for fireflies
     */
    init(container) {
        this.container = container;

        // Spawn initial population
        for (let i = 0; i < this.config.initialPopulation; i++) {
            this.spawnFirefly({
                // Stagger spawns for visual effect
                delay: i * 100
            });
        }

        // Start animation loop
        this.start();

        return this;
    }

    /**
     * Spawn a new firefly
     * @param {Object} options - Firefly options
     * @returns {Firefly} - The new firefly
     */
    spawnFirefly(options = {}) {
        if (this.fireflies.length >= this.config.maxPopulation) {
            return null;
        }

        const firefly = new Firefly({
            x: options.x,
            y: options.y,
            digit: options.digit,
            generation: options.generation ?? 0,
            size: options.size,
            tier: options.tier
        });

        // Set up callbacks
        firefly.onDeath = (f) => this.handleFireflyDeath(f);
        firefly.onCollision = (f1, f2, result) => this.handleCollision(f1, f2, result);
        firefly.onEvolve = (f, oldTier, newTier) => this.handleEvolution(f, oldTier, newTier);

        // Create DOM element (with optional delay)
        if (options.delay) {
            setTimeout(() => {
                if (this.container) {
                    firefly.createElement(this.container);
                }
            }, options.delay);
        } else {
            firefly.createElement(this.container);
        }

        this.fireflies.push(firefly);
        this.stats.totalBirths++;
        this.stats.currentPopulation = this.fireflies.length;

        if (this.onFireflyBirth) {
            this.onFireflyBirth(firefly);
        }

        return firefly;
    }

    /**
     * Handle firefly death
     * @param {Firefly} firefly - The dying firefly
     */
    handleFireflyDeath(firefly) {
        // Queue for removal (don't modify array during iteration)
        this.pendingRemovals.push(firefly);

        this.stats.totalDeaths++;

        // Trigger death particles with enhanced variety based on firefly properties
        if (this.particleSystem) {
            this.particleSystem.createDeathBurst(firefly.x, firefly.y, firefly.digit, {
                tier: firefly.tier,
                rareType: firefly.rareType,
                rareColor: firefly.rareColor,
                desperation: firefly.desperation || 0,
                generation: firefly.generation
            });
        }

        if (this.onFireflyDeath) {
            this.onFireflyDeath(firefly);
        }

        // Spawn replacement if under minimum
        if (this.fireflies.length - this.pendingRemovals.length < this.config.minPopulation) {
            // Spawn near death location with some randomness
            setTimeout(() => {
                this.spawnFirefly({
                    x: firefly.x + (Math.random() - 0.5) * 200,
                    y: firefly.y + (Math.random() - 0.5) * 200,
                    generation: 0 // New life starts at gen 0
                });
            }, 500 + Math.random() * 1000);
        }
    }

    /**
     * Handle collision between fireflies
     */
    handleCollision(firefly1, firefly2, result) {
        this.stats.totalCollisions++;

        switch (result) {
            case 'overflow':
                this.stats.overflowCollisions++;
                break;
            case 'quantum':
                this.stats.quantumCollisions++;
                break;
            case 'merge':
                this.stats.mergeCollisions++;
                break;
        }

        // Create collision particles
        if (this.particleSystem) {
            const midX = (firefly1.x + firefly2.x) / 2;
            const midY = (firefly1.y + firefly2.y) / 2;
            this.particleSystem.createCollisionEffect(midX, midY, result);
        }

        if (this.onCollision) {
            this.onCollision(firefly1, firefly2, result);
        }
    }

    /**
     * Handle firefly evolution
     * @param {Firefly} firefly - The evolving firefly
     * @param {Object} oldTier - Previous tier
     * @param {Object} newTier - New tier
     */
    handleEvolution(firefly, oldTier, newTier) {
        this.stats.totalEvolutions++;

        // Create evolution particles
        if (this.particleSystem) {
            this.particleSystem.createEvolutionEffect(
                firefly.x,
                firefly.y,
                newTier.color,
                newTier.level
            );
        }

        if (this.onEvolution) {
            this.onEvolution(firefly, oldTier, newTier);
        }
    }

    /**
     * Process pending removals
     */
    processPendingRemovals() {
        for (const firefly of this.pendingRemovals) {
            const index = this.fireflies.indexOf(firefly);
            if (index > -1) {
                this.fireflies.splice(index, 1);
                firefly.destroy();
            }
        }
        this.pendingRemovals = [];

        // Safety cleanup: Remove any dead fireflies that slipped through
        // This prevents orphaned elements from persisting
        for (let i = this.fireflies.length - 1; i >= 0; i--) {
            const f = this.fireflies[i];
            if (f.state === 'dead') {
                f.destroy();
                this.fireflies.splice(i, 1);
            }
        }

        this.stats.currentPopulation = this.fireflies.length;
    }

    /**
     * Check collisions between all fireflies
     */
    checkCollisions() {
        const radius = this.config.collisionRadius;

        // Simple O(n²) check - could optimize with spatial partitioning later
        for (let i = 0; i < this.fireflies.length; i++) {
            for (let j = i + 1; j < this.fireflies.length; j++) {
                const f1 = this.fireflies[i];
                const f2 = this.fireflies[j];

                const distance = f1.distanceTo(f2);

                if (distance < radius) {
                    f1.handleCollision(f2);
                }
            }
        }
    }

    /**
     * Maintain population (spawn if needed)
     */
    maintainPopulation() {
        const current = this.fireflies.length - this.pendingRemovals.length;

        if (current < this.config.minPopulation) {
            // Higher spawn rate when critically low
            const spawnChance = this.config.spawnRate * (1 + (this.config.minPopulation - current) * 0.5);

            if (Math.random() < spawnChance) {
                this.spawnFirefly();
            }
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        if (this.fireflies.length === 0) return;

        let totalAge = 0;
        let totalEnergy = 0;

        for (const firefly of this.fireflies) {
            totalAge += firefly.age;
            totalEnergy += firefly.energy;
        }

        this.stats.averageAge = Math.round(totalAge / this.fireflies.length);
        this.stats.averageEnergy = Math.round(totalEnergy / this.fireflies.length);

        if (this.onStatsUpdate) {
            this.onStatsUpdate(this.stats);
        }
    }

    /**
     * Main animation loop
     */
    animate(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = this.lastTime ? currentTime - this.lastTime : 16;
        this.lastTime = currentTime;

        // Update all fireflies
        for (const firefly of this.fireflies) {
            firefly.update(deltaTime, currentTime);
        }

        // Update planets
        this.updatePlanets(deltaTime);

        // Update terraform effect (multiple planets change environment)
        this.updateTerraform(deltaTime);

        // Apply black hole gravity and check consumption
        if (this.blackHole && this.blackHole.isActive) {
            this.processBlackHole(deltaTime);
        }

        // Check collisions
        this.checkCollisions();

        // Process removals
        this.processPendingRemovals();

        // Maintain population
        this.maintainPopulation();

        // Update stats periodically (every 30 frames)
        if (Math.random() < 0.033) {
            this.updateStats();
        }

        // Next frame
        this.animationFrameId = requestAnimationFrame((t) => this.animate(t));
    }

    /**
     * Start the ecosystem
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = 0;
        this.animationFrameId = requestAnimationFrame((t) => this.animate(t));

        return this;
    }

    /**
     * Stop the ecosystem
     */
    stop() {
        this.isRunning = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        return this;
    }

    /**
     * Scatter all fireflies from a point (for shooting star effect)
     * @param {number} x - Origin X
     * @param {number} y - Origin Y
     * @param {number} radius - Effect radius
     * @param {number} force - Force magnitude
     */
    scatterFrom(x, y, radius = 150, force = 3) {
        for (const firefly of this.fireflies) {
            const dx = firefly.x - x;
            const dy = firefly.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius && distance > 0) {
                const strength = (radius - distance) / radius * force;
                const fx = (dx / distance) * strength;
                const fy = (dy / distance) * strength;

                firefly.applyForce(fx, fy);
            }
        }
    }

    /**
     * Get firefly at position (for mouse interaction)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} radius - Search radius
     * @returns {Firefly|null}
     */
    getFireflyAt(x, y, radius = 30) {
        for (const firefly of this.fireflies) {
            const dx = firefly.x - x;
            const dy = firefly.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                return firefly;
            }
        }
        return null;
    }

    /**
     * Get population counts by digit
     * @returns {Object} - {zeros, ones}
     */
    getPopulationByDigit() {
        let zeros = 0;
        let ones = 0;

        for (const firefly of this.fireflies) {
            if (firefly.digit === 0) zeros++;
            else ones++;
        }

        return { zeros, ones };
    }

    /**
     * Connect particle system for effects
     * @param {ParticleSystem} particleSystem
     */
    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
        return this;
    }

    /**
     * Connect black hole predator
     * @param {BlackHole} blackHole
     */
    setBlackHole(blackHole) {
        this.blackHole = blackHole;

        // Set up consumption callback for particle effects
        blackHole.onConsume = (hole, firefly) => {
            if (this.particleSystem) {
                this.particleSystem.createConsumptionEffect(
                    firefly.x, firefly.y,
                    hole.x, hole.y,
                    firefly.digit
                );
            }
        };

        // Set up Ascended sacrifice callback - creates a planet!
        blackHole.onAscendedSacrifice = (hole, firefly) => {
            this.createPlanet(firefly.digit, hole.x, hole.y);
        };

        return this;
    }

    /**
     * Create a planet from Ascended sacrifice
     * @param {number} digit - The digit of the sacrificed Ascended (determines planet type)
     * @param {number} holeX - Black hole X position
     * @param {number} holeY - Black hole Y position
     */
    createPlanet(digit, holeX, holeY) {
        // Need Planet class
        if (typeof Planet === 'undefined') {
            console.warn('Planet class not loaded');
            return null;
        }

        // ═══════════════════════════════════════════════════════════════
        // PLANET POPULATION CONTROL - Prevents performance issues
        // ═══════════════════════════════════════════════════════════════

        // If at max capacity, clean up oldest planet first
        if (this.planets.length >= this.config.maxPlanets) {
            console.log(`🪐 Planet limit reached (${this.config.maxPlanets}). Recycling oldest planet...`);
            this.recycleOldestPlanet();
        }

        // Double-check we have room (recycling might have failed)
        if (this.planets.length >= this.config.maxPlanets) {
            console.warn('Cannot create planet - at maximum capacity');
            return null;
        }

        // Create planet with orbit around black hole
        const planet = new Planet({
            digit: digit,
            orbitCenterX: holeX,
            orbitCenterY: holeY,
            orbitRadius: 150 + Math.random() * 80, // Variable orbit distance
            startAngle: Math.random() * Math.PI * 2
        });

        planet.onDeath = (p) => this.handlePlanetDeath(p);

        // Set up collapse callback - ancient planets become mini black holes
        planet.onCollapse = (p) => this.handlePlanetCollapse(p);

        // Set up spawn callback - planets can birth new fireflies
        planet.onSpawnRequest = (options) => this.handlePlanetSpawn(planet, options);

        // Create DOM element
        if (this.container) {
            planet.createElement(this.container);
        }

        this.planets.push(planet);
        this.stats.planetsCreated++;

        // Spawn the sacrifice echo (ghost of the Ascended creator)
        planet.spawnEcho();

        // Create epic birth effect
        if (this.particleSystem) {
            this.particleSystem.createPlanetBirthEffect(
                holeX, holeY,
                planet.type.color
            );
        }

        if (this.onPlanetBirth) {
            this.onPlanetBirth(planet);
        }

        return planet;
    }

    /**
     * Handle planet death
     */
    handlePlanetDeath(planet) {
        const index = this.planets.indexOf(planet);
        if (index > -1) {
            this.planets.splice(index, 1);
        }

        // Create destruction effect
        if (this.particleSystem) {
            this.particleSystem.createPlanetDeathEffect(
                planet.x, planet.y,
                planet.type.color
            );
        }

        planet.destroy();
    }

    /**
     * Handle planet collapse - ancient planets become mini black holes
     */
    handlePlanetCollapse(planet) {
        console.log(`🕳️ ${planet.type.name} collapsing into mini black hole at (${Math.round(planet.x)}, ${Math.round(planet.y)})`);

        // Create visual collapse effect
        if (this.particleSystem) {
            // Implosion effect - particles rush inward
            this.particleSystem.createCollapseEffect(planet.x, planet.y, planet.type.color);
        }

        // If we have a main black hole, boost its power temporarily
        if (this.blackHole) {
            // Temporary gravity boost
            const originalStrength = this.blackHole.gravityStrength;
            this.blackHole.gravityStrength *= 1.5;

            // Reset after 5 seconds
            setTimeout(() => {
                if (this.blackHole) {
                    this.blackHole.gravityStrength = originalStrength;
                }
            }, 5000);

            // Add mass to black hole (visual feedback)
            this.blackHole.addMass && this.blackHole.addMass(0.1);
        }

        // Spawn a burst of energy particles at collapse point
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                if (this.particleSystem) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = planet.x + Math.cos(angle) * 30;
                    const y = planet.y + Math.sin(angle) * 30;
                    this.particleSystem.createParticle(x, y, {
                        color: planet.type.color,
                        size: 8,
                        lifetime: 2000,
                        velocity: { x: Math.cos(angle) * 0.1, y: Math.sin(angle) * 0.1 }
                    });
                }
            }, i * 50);
        }
    }

    /**
     * Recycle the oldest planet to make room for a new one
     * Called when planet limit is reached
     */
    recycleOldestPlanet() {
        if (this.planets.length === 0) return;

        // Find oldest planet by age
        let oldestPlanet = this.planets[0];
        let oldestAge = oldestPlanet.age;

        for (const planet of this.planets) {
            if (planet.age > oldestAge) {
                oldestAge = planet.age;
                oldestPlanet = planet;
            }
        }

        console.log(`♻️ Recycling ${oldestPlanet.type.name} (age: ${Math.round(oldestAge / 1000)}s)`);

        // Create a graceful death effect
        if (this.particleSystem) {
            this.particleSystem.createPlanetDeathEffect(
                oldestPlanet.x, oldestPlanet.y,
                oldestPlanet.type.color
            );
        }

        // Remove from array and destroy
        const index = this.planets.indexOf(oldestPlanet);
        if (index > -1) {
            this.planets.splice(index, 1);
        }
        oldestPlanet.destroy();
    }

    /**
     * Handle planet spawn request - planets can birth new fireflies
     */
    handlePlanetSpawn(planet, options) {
        // Don't exceed max population
        if (this.fireflies.length >= this.config.maxPopulation) {
            return null;
        }

        // Spawn the firefly
        const firefly = this.spawnFirefly({
            x: options.x,
            y: options.y,
            digit: options.digit,
            generation: 0 // Planet-born fireflies are generation 0
        });

        if (firefly) {
            // Apply initial velocity (gentle push from planet)
            if (options.initialVx !== undefined) {
                firefly.vx = options.initialVx;
                firefly.vy = options.initialVy;
            }

            // Mark as planet-born (for potential special behaviors)
            firefly.bornFromPlanet = planet.id;

            // Create birth effect
            if (this.particleSystem) {
                this.particleSystem.createFlash(options.x, options.y, 'spawn');
            }
        }

        return firefly;
    }

    /**
     * Update all planets and their effects
     */
    updatePlanets(deltaTime) {
        // ═══════════════════════════════════════════════════════════════
        // PERIODIC CLEANUP - Extra safety check for planet overflow
        // ═══════════════════════════════════════════════════════════════
        if (this.planets.length > this.config.maxPlanets) {
            console.warn(`⚠️ Planet overflow detected: ${this.planets.length}/${this.config.maxPlanets}. Cleaning up...`);
            while (this.planets.length > this.config.maxPlanets) {
                this.recycleOldestPlanet();
            }
        }

        // Clear planet influence markers at start of each frame
        for (const firefly of this.fireflies) {
            firefly.nearPlanet = null;
            firefly.evolutionMultiplier = null; // Must stay near planet to keep boost

            // Clear elemental effect markers (must stay in zone to keep effects)
            firefly.timeDilationFactor = null;
            firefly.speedMultiplier = 1; // Reset to default
            firefly.brightnessBoost = null;
            firefly.elementalEffect = null;
            firefly.elementalColor = null;
        }

        for (const planet of this.planets) {
            planet.update(deltaTime);

            // Apply planet effects to fireflies
            for (const firefly of this.fireflies) {
                // Heal fireflies in protection zone
                planet.healFirefly(firefly, deltaTime);

                // Apply gravitational pull (creates orbiting behavior)
                planet.applyGravity(firefly);

                // Apply evolution acceleration
                planet.applyEvolutionBoost(firefly, deltaTime);

                // Apply elemental powers (Time Dilation / Energize)
                planet.applyElementalPower(firefly, deltaTime);

                // Check resource particle absorption
                const energyGained = planet.checkParticleAbsorption(firefly);
                if (energyGained > 0) {
                    firefly.energy = Math.min(100, firefly.energy + energyGained);
                }
            }
        }
    }

    /**
     * Update terraform effect based on current planets
     * Multiple planets change the environment
     */
    updateTerraform(deltaTime) {
        const maturePlanets = this.planets.filter(p => p.isMature);
        const planetCount = maturePlanets.length;

        // Check if terraform should be active
        if (planetCount >= this.terraform.minPlanetsForEffect) {
            // Calculate intensity (0-1 based on planet count, caps at 4)
            this.terraform.intensity = Math.min(1, (planetCount - 1) / 3);
            this.terraform.active = true;

            // Calculate planet type dominance
            let nullWorlds = 0;
            let unitySpheres = 0;
            for (const planet of maturePlanets) {
                if (planet.digit === 0) nullWorlds++;
                else unitySpheres++;
            }

            // Dominance ratio: 0 = all null, 0.5 = balanced, 1 = all unity
            const total = nullWorlds + unitySpheres;
            this.terraform.dominanceRatio = total > 0 ? unitySpheres / total : 0.5;

            if (nullWorlds > unitySpheres) {
                this.terraform.dominantType = 'null';
            } else if (unitySpheres > nullWorlds) {
                this.terraform.dominantType = 'unity';
            } else {
                this.terraform.dominantType = 'balanced';
            }

            // Energy regeneration boost (5-15% based on intensity)
            this.terraform.energyRegenBoost = 0.05 + (this.terraform.intensity * 0.1);

        } else {
            this.terraform.active = false;
            this.terraform.intensity = Math.max(0, this.terraform.intensity - 0.001 * deltaTime);
            this.terraform.energyRegenBoost = 0;
        }

        // Update visual overlay
        this.updateTerraformOverlay();

        // Apply terraform energy boost to all fireflies
        if (this.terraform.energyRegenBoost > 0) {
            for (const firefly of this.fireflies) {
                if (firefly.state === 'mature') {
                    // Small passive energy regeneration
                    const regenAmount = this.terraform.energyRegenBoost * (deltaTime / 1000);
                    firefly.energy = Math.min(100, firefly.energy + regenAmount);
                }
            }
        }
    }

    /**
     * Create or update the terraform visual overlay
     */
    updateTerraformOverlay() {
        // Create overlay if it doesn't exist
        if (!this.terraform.overlayElement && this.container) {
            const overlay = document.createElement('div');
            overlay.id = 'terraform-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                transition: opacity 2s ease, background 2s ease;
            `;
            document.body.insertBefore(overlay, document.body.firstChild);
            this.terraform.overlayElement = overlay;
        }

        if (!this.terraform.overlayElement) return;

        const overlay = this.terraform.overlayElement;
        const intensity = this.terraform.intensity;
        const ratio = this.terraform.dominanceRatio;

        if (intensity > 0.01) {
            // Calculate color based on dominance
            // Null World (0) = Cyan atmosphere
            // Unity Sphere (1) = Gold atmosphere
            // Balanced = Purple (mix)
            const cyanR = 78, cyanG = 205, cyanB = 196;   // #4ecdc4
            const goldR = 251, goldG = 191, goldB = 36;   // #fbbf24

            const r = Math.round(cyanR + (goldR - cyanR) * ratio);
            const g = Math.round(cyanG + (goldG - cyanG) * ratio);
            const b = Math.round(cyanB + (goldB - cyanB) * ratio);

            // Apply radial gradient from edges
            const alpha = intensity * 0.15; // Max 15% opacity
            overlay.style.background = `
                radial-gradient(ellipse at center,
                    transparent 30%,
                    rgba(${r}, ${g}, ${b}, ${alpha * 0.3}) 60%,
                    rgba(${r}, ${g}, ${b}, ${alpha}) 100%
                )
            `;
            overlay.style.opacity = '1';
        } else {
            overlay.style.opacity = '0';
        }
    }

    /**
     * Check if firefly is protected by any planet
     */
    isFireflyProtected(firefly) {
        for (const planet of this.planets) {
            if (planet.isMature && planet.isInProtectionZone(firefly.x, firefly.y)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Process black hole gravity and consumption
     * @param {number} deltaTime - Time since last frame
     */
    processBlackHole(deltaTime) {
        if (!this.blackHole) return;

        // Update black hole
        this.blackHole.update(deltaTime);

        // Update symbiosis with planets (boosts gravity based on nearby planets)
        this.blackHole.updateSymbiosis(this.planets);

        // Process each firefly
        for (const firefly of this.fireflies) {
            // Skip non-mature or dying fireflies
            if (firefly.state === 'dying' || firefly.state === 'dead' || firefly.state === 'birth') {
                continue;
            }

            // Check consumption first (before gravity pulls them in more)
            if (this.blackHole.checkConsumption(firefly)) {
                // Firefly was consumed - trigger proper death flow
                // die() will: set state to DEAD, destroy element, call onDeath callback
                // handleFireflyDeath will: add to pendingRemovals, increment stats, spawn particles
                firefly.die();
                continue;
            }

            // Check if firefly is protected by a planet
            const isProtected = this.isFireflyProtected(firefly);

            // Apply gravitational pull (reduced by gravity resistance and planet protection)
            const gravity = this.blackHole.calculateGravity(firefly);
            if (gravity) {
                let resistMultiplier = 1 - (firefly.gravityResist || 0);

                // Planet protection greatly reduces gravity
                if (isProtected) {
                    resistMultiplier *= 0.2; // 80% reduction in gravity
                }

                firefly.applyForce(
                    gravity.fx * resistMultiplier,
                    gravity.fy * resistMultiplier
                );
            }
        }
    }

    /**
     * Get all current statistics
     * @returns {Object}
     */
    getStats() {
        return { ...this.stats, ...this.getPopulationByDigit() };
    }

    /**
     * Clean up everything
     */
    destroy() {
        this.stop();

        for (const firefly of this.fireflies) {
            firefly.destroy();
        }

        this.fireflies = [];
        this.pendingRemovals = [];
        this.container = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Ecosystem;
}
