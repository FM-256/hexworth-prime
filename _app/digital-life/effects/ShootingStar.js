/**
 * ShootingStar.js - Shooting Star System
 *
 * Creates periodic shooting stars that:
 * - Arc across the screen
 * - Leave binary trails
 * - Scatter nearby fireflies
 */

class ShootingStarSystem {
    constructor(config = {}) {
        this.config = {
            minInterval: config.minInterval ?? 8000,   // Min time between stars (ms)
            maxInterval: config.maxInterval ?? 15000,  // Max time between stars
            minDuration: config.minDuration ?? 1500,   // Min flight duration
            maxDuration: config.maxDuration ?? 2500,   // Max flight duration
            trailDensity: config.trailDensity ?? 0.4,  // Chance of trail particle per frame
            scatterRadius: config.scatterRadius ?? 150,
            scatterForce: config.scatterForce ?? 3,
            // Egg/seed spawning
            eggsEnabled: config.eggsEnabled ?? true,
            minEggs: config.minEggs ?? 1,
            maxEggs: config.maxEggs ?? 3,
            eggHatchDelay: config.eggHatchDelay ?? 3000, // ms before eggs hatch
            ...config
        };

        // Eggs waiting to hatch
        this.eggs = [];

        this.container = null;
        this.particleSystem = null;
        this.ecosystem = null;
        this.blackHole = null;

        this.stars = [];
        this.nextStarTimeout = null;
        this.isRunning = false;

        // Callbacks
        this.onLaunch = null;  // Called when a star launches
    }

    /**
     * Initialize the system
     * @param {HTMLElement} container - DOM container
     */
    init(container) {
        this.container = container;
        return this;
    }

    /**
     * Connect to ecosystem for scatter effects
     */
    setEcosystem(ecosystem) {
        this.ecosystem = ecosystem;
        return this;
    }

    /**
     * Connect to particle system for trails
     */
    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
        return this;
    }

    /**
     * Connect to black hole for damage interaction
     */
    setBlackHole(blackHole) {
        this.blackHole = blackHole;
        return this;
    }

    /**
     * Start the shooting star system
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.scheduleNextStar();

        return this;
    }

    /**
     * Stop the system
     */
    stop() {
        this.isRunning = false;

        if (this.nextStarTimeout) {
            clearTimeout(this.nextStarTimeout);
            this.nextStarTimeout = null;
        }

        return this;
    }

    /**
     * Schedule the next shooting star
     */
    scheduleNextStar() {
        if (!this.isRunning) return;

        const delay = this.config.minInterval +
            Math.random() * (this.config.maxInterval - this.config.minInterval);

        this.nextStarTimeout = setTimeout(() => {
            this.launchStar();
            this.scheduleNextStar();
        }, delay);
    }

    /**
     * Launch a shooting star
     */
    launchStar() {
        if (!this.container) return;

        const star = this.createStar();
        this.stars.push(star);
        this.animateStar(star);

        // Trigger callback
        if (this.onLaunch) {
            this.onLaunch(star);
        }
    }

    /**
     * Create a new star object
     */
    createStar() {
        // Determine start and end positions
        const startFromTop = Math.random() > 0.5;
        let startX, startY, endX, endY;

        if (startFromTop) {
            // Start from top, move diagonally down-right
            startX = Math.random() * window.innerWidth * 0.7;
            startY = -20;
            endX = startX + 250 + Math.random() * 350;
            endY = window.innerHeight * 0.5 + Math.random() * window.innerHeight * 0.4;
        } else {
            // Start from right, move diagonally down-left
            startX = window.innerWidth + 20;
            startY = Math.random() * window.innerHeight * 0.3;
            endX = -100;
            endY = startY + 250 + Math.random() * 350;
        }

        // Create DOM element
        const element = document.createElement('div');
        element.className = 'shooting-star';
        element.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: 6px;
            height: 6px;
            background: var(--accent, #9f7aea);
            border-radius: 50%;
            box-shadow:
                0 0 8px 3px var(--accent, #9f7aea),
                0 0 16px 6px var(--glow-color, rgba(159, 122, 234, 0.6));
            pointer-events: none;
            z-index: 10;
            opacity: 0;
        `;

        this.container.appendChild(element);

        return {
            element: element,
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            x: startX,
            y: startY,
            duration: this.config.minDuration +
                Math.random() * (this.config.maxDuration - this.config.minDuration),
            startTime: Date.now(),
            scattered: false
        };
    }

    /**
     * Animate a shooting star
     */
    animateStar(star) {
        const animate = () => {
            const elapsed = Date.now() - star.startTime;
            const progress = Math.min(elapsed / star.duration, 1);

            // Ease out curve for natural deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 2);

            // Update position
            star.x = star.startX + (star.endX - star.startX) * easeProgress;
            star.y = star.startY + (star.endY - star.startY) * easeProgress;

            // Update DOM
            star.element.style.left = star.x + 'px';
            star.element.style.top = star.y + 'px';
            star.element.style.opacity = 1 - progress * 0.5;

            // Scatter fireflies (once, early in flight)
            if (!star.scattered && progress > 0.1) {
                this.scatterFireflies(star);
                star.scattered = true;
            }

            // Create trail particles
            if (this.particleSystem && Math.random() < this.config.trailDensity) {
                this.particleSystem.createTrailParticle(star.x, star.y);
            }

            // Check black hole collision (deal damage)
            if (this.blackHole && !star.hitBlackHole && this.blackHole.isActive) {
                if (this.blackHole.checkStarCollision(star)) {
                    this.blackHole.takeDamage();
                    star.hitBlackHole = true;

                    // Create damage particles
                    if (this.particleSystem) {
                        this.particleSystem.createBlackHoleDamageEffect(
                            this.blackHole.x,
                            this.blackHole.y
                        );
                    }
                }
            }

            // Continue or finish
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.removeStar(star);
            }
        };

        // Fade in then animate
        setTimeout(() => {
            star.element.style.opacity = '1';
            animate();
        }, 10);
    }

    /**
     * Scatter fireflies near the star's path
     */
    scatterFireflies(star) {
        if (!this.ecosystem) return;

        // Calculate points along the star's path
        const steps = 5;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = star.startX + (star.endX - star.startX) * t;
            const y = star.startY + (star.endY - star.startY) * t;

            this.ecosystem.scatterFrom(
                x, y,
                this.config.scatterRadius,
                this.config.scatterForce * (1 - t * 0.5) // Stronger at start
            );
        }
    }

    /**
     * Remove a star
     */
    removeStar(star) {
        // Spawn eggs along the trail before removing
        if (this.config.eggsEnabled) {
            this.spawnEggs(star);
        }

        const index = this.stars.indexOf(star);
        if (index > -1) {
            this.stars.splice(index, 1);
        }

        if (star.element && star.element.parentNode) {
            star.element.parentNode.removeChild(star.element);
        }
    }

    /**
     * Spawn eggs along the star's trail
     */
    spawnEggs(star) {
        const numEggs = this.config.minEggs +
            Math.floor(Math.random() * (this.config.maxEggs - this.config.minEggs + 1));

        for (let i = 0; i < numEggs; i++) {
            // Random position along the star's path
            const t = 0.3 + Math.random() * 0.5; // Middle 50% of path
            const x = star.startX + (star.endX - star.startX) * t + (Math.random() - 0.5) * 50;
            const y = star.startY + (star.endY - star.startY) * t + (Math.random() - 0.5) * 50;

            // Create egg
            const egg = {
                x: x,
                y: y,
                digit: Math.random() > 0.5 ? 1 : 0,
                spawnTime: Date.now(),
                hatchTime: Date.now() + this.config.eggHatchDelay + Math.random() * 1000,
                element: null
            };

            // Create visual egg element
            egg.element = document.createElement('div');
            egg.element.className = 'star-egg';
            egg.element.textContent = '✧';
            egg.element.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                font-size: 14px;
                color: var(--accent, #9f7aea);
                text-shadow: 0 0 10px var(--glow-color, rgba(159, 122, 234, 0.8));
                pointer-events: none;
                opacity: 0;
                animation: eggPulse 1s ease-in-out infinite;
                z-index: 6;
            `;

            if (this.container) {
                this.container.appendChild(egg.element);
                // Fade in
                setTimeout(() => {
                    if (egg.element) egg.element.style.opacity = '0.8';
                }, 50);
            }

            this.eggs.push(egg);
        }

        // Inject egg animation style if not present
        this.injectEggStyles();
    }

    /**
     * Inject egg CSS styles
     */
    injectEggStyles() {
        if (document.getElementById('star-egg-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'star-egg-styles';
        styles.textContent = `
            @keyframes eggPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            .star-egg {
                transition: opacity 0.3s ease;
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Update eggs - check for hatching
     */
    updateEggs() {
        const now = Date.now();
        const toHatch = [];

        for (const egg of this.eggs) {
            if (now >= egg.hatchTime) {
                toHatch.push(egg);
            }
        }

        for (const egg of toHatch) {
            this.hatchEgg(egg);
        }
    }

    /**
     * Hatch an egg into a new firefly
     */
    hatchEgg(egg) {
        // Remove from list
        const index = this.eggs.indexOf(egg);
        if (index > -1) {
            this.eggs.splice(index, 1);
        }

        // Remove visual
        if (egg.element && egg.element.parentNode) {
            egg.element.style.opacity = '0';
            setTimeout(() => {
                if (egg.element && egg.element.parentNode) {
                    egg.element.parentNode.removeChild(egg.element);
                }
            }, 300);
        }

        // Spawn firefly via ecosystem
        if (this.ecosystem) {
            const firefly = this.ecosystem.spawnFirefly({
                x: egg.x,
                y: egg.y,
                digit: egg.digit
            });

            // Create hatch effect
            if (this.particleSystem && firefly) {
                this.particleSystem.createEvolutionEffect(
                    egg.x, egg.y,
                    'var(--accent, #9f7aea)',
                    0
                );
            }
        }
    }

    /**
     * Force launch a star (for testing or events)
     */
    forceLaunch() {
        this.launchStar();
    }

    /**
     * Clean up
     */
    destroy() {
        this.stop();

        for (const star of this.stars) {
            if (star.element && star.element.parentNode) {
                star.element.parentNode.removeChild(star.element);
            }
        }

        this.stars = [];
        this.container = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShootingStarSystem;
}
