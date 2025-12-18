/**
 * MeteorShower.js - Meteor Shower Cosmic Event
 *
 * Multiple shooting stars rain across the sky:
 * - Rapid succession of shooting stars
 * - Each can spawn firefly seeds
 * - Some meteors explode on impact
 * - Creates spectacular visual display
 * - Chance for rare "golden meteor" with bonus effects
 */

class MeteorShowerEvent {
    constructor() {
        this.meteors = [];
        this.lastMeteorTime = 0;
        this.container = null;
    }

    /**
     * Event handler interface - called when event starts
     */
    start(eventData, manager) {
        this.container = manager.container;
        eventData.data.meteorsLaunched = 0;
        eventData.data.seedsDropped = 0;
        eventData.data.goldenMeteors = 0;
        this.lastMeteorTime = 0;

        // Subtle overlay
        manager.setOverlay(
            'linear-gradient(180deg, rgba(100, 100, 150, 0.2) 0%, transparent 50%)',
            0.3
        );

        this.injectStyles();
    }

    /**
     * Event handler interface - called every frame
     */
    update(deltaTime, timestamp, eventData, manager) {
        const progress = (timestamp - eventData.startTime) / eventData.duration;
        eventData.progress = progress;

        // Calculate meteor spawn rate based on intensity curve
        // Peak in the middle of the event
        const intensityCurve = Math.sin(progress * Math.PI);
        const baseInterval = 800 - (400 * eventData.intensity); // 400-800ms between meteors
        const interval = baseInterval / (1 + intensityCurve);

        // Spawn new meteors
        if (timestamp - this.lastMeteorTime > interval) {
            this.lastMeteorTime = timestamp;
            this.launchMeteor(eventData, manager, timestamp);
        }

        // Update active meteors
        this.updateMeteors(deltaTime, timestamp, manager);

        // Update overlay based on intensity
        manager.setOverlay(
            'linear-gradient(180deg, rgba(100, 100, 150, 0.3) 0%, transparent 50%)',
            0.2 + 0.2 * intensityCurve
        );
    }

    /**
     * Launch a new meteor
     */
    launchMeteor(eventData, manager, timestamp) {
        // Determine if this is a golden meteor (rare)
        const isGolden = Math.random() < 0.05 * eventData.intensity;

        // Random starting position (top of screen, random x)
        const startX = Math.random() * window.innerWidth;
        const startY = -50;

        // Random angle (mostly downward, slight variation)
        const angle = (70 + Math.random() * 40) * (Math.PI / 180); // 70-110 degrees
        const speed = 0.3 + Math.random() * 0.3; // Pixels per ms

        const meteor = {
            id: 'meteor_' + timestamp + '_' + Math.random().toString(36).substr(2, 5),
            x: startX,
            y: startY,
            angle: angle,
            speed: speed,
            size: isGolden ? 6 : (3 + Math.random() * 3),
            isGolden: isGolden,
            color: isGolden ? '#ffd700' : '#ffffff',
            glowColor: isGolden ? 'rgba(255, 215, 0, 0.8)' : 'rgba(200, 200, 255, 0.6)',
            trailLength: isGolden ? 80 : (40 + Math.random() * 40),
            element: null,
            trailElement: null,
            createdAt: timestamp,
            hasDroppedSeed: false
        };

        // Create DOM elements
        this.createMeteorElements(meteor, manager);

        this.meteors.push(meteor);
        eventData.data.meteorsLaunched++;
        if (isGolden) eventData.data.goldenMeteors++;
    }

    /**
     * Create meteor DOM elements
     */
    createMeteorElements(meteor, manager) {
        // Trail element
        meteor.trailElement = document.createElement('div');
        meteor.trailElement.className = 'meteor-trail' + (meteor.isGolden ? ' golden' : '');
        meteor.trailElement.style.cssText = `
            position: fixed;
            width: ${meteor.trailLength}px;
            height: ${meteor.size}px;
            background: linear-gradient(
                90deg,
                transparent 0%,
                ${meteor.glowColor} 50%,
                ${meteor.color} 100%
            );
            border-radius: ${meteor.size}px;
            pointer-events: none;
            z-index: 15;
            filter: blur(1px);
            transform-origin: right center;
        `;
        manager.container.appendChild(meteor.trailElement);

        // Head element
        meteor.element = document.createElement('div');
        meteor.element.className = 'meteor-head' + (meteor.isGolden ? ' golden' : '');
        meteor.element.style.cssText = `
            position: fixed;
            width: ${meteor.size * 2}px;
            height: ${meteor.size * 2}px;
            background: radial-gradient(circle, ${meteor.color} 0%, ${meteor.glowColor} 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 16;
            box-shadow: 0 0 ${meteor.size * 3}px ${meteor.glowColor};
        `;
        manager.container.appendChild(meteor.element);
    }

    /**
     * Update all active meteors
     */
    updateMeteors(deltaTime, timestamp, manager) {
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            const meteor = this.meteors[i];

            // Move meteor
            meteor.x += Math.cos(meteor.angle) * meteor.speed * deltaTime;
            meteor.y += Math.sin(meteor.angle) * meteor.speed * deltaTime;

            // Update DOM positions
            if (meteor.element) {
                meteor.element.style.left = (meteor.x - meteor.size) + 'px';
                meteor.element.style.top = (meteor.y - meteor.size) + 'px';
            }

            if (meteor.trailElement) {
                const trailAngle = (meteor.angle * 180 / Math.PI) + 180;
                meteor.trailElement.style.left = meteor.x + 'px';
                meteor.trailElement.style.top = (meteor.y - meteor.size / 2) + 'px';
                meteor.trailElement.style.transform = `rotate(${trailAngle}deg)`;
            }

            // Check if meteor should drop a seed
            if (!meteor.hasDroppedSeed &&
                meteor.y > window.innerHeight * 0.3 &&
                meteor.y < window.innerHeight * 0.7) {

                // Chance to drop seed
                const seedChance = meteor.isGolden ? 0.8 : 0.3;
                if (Math.random() < seedChance) {
                    this.dropSeed(meteor, manager);
                    meteor.hasDroppedSeed = true;
                }
            }

            // Check if meteor is off screen
            if (meteor.y > window.innerHeight + 100 ||
                meteor.x < -100 ||
                meteor.x > window.innerWidth + 100) {

                // Create impact effect if hitting bottom
                if (meteor.y > window.innerHeight - 50) {
                    this.createImpact(meteor, manager);
                }

                // Remove meteor
                this.removeMeteor(meteor, i);
            }
        }
    }

    /**
     * Drop a firefly seed from meteor
     */
    dropSeed(meteor, manager) {
        if (!manager.ecosystem) return;

        // Use shooting star system if available
        if (manager.shootingStarSystem?.dropSeed) {
            manager.shootingStarSystem.dropSeed(meteor.x, meteor.y);
        } else if (manager.ecosystem.spawnFirefly) {
            // Direct spawn
            const firefly = manager.ecosystem.spawnFirefly({
                x: meteor.x,
                y: meteor.y,
                fromSeed: true
            });

            // Golden meteors spawn higher tier
            if (firefly && meteor.isGolden) {
                firefly.energy = 100;
                firefly.evolutionProgress = 50;
            }
        }

        // Visual feedback
        if (manager.particleSystem) {
            const color = meteor.isGolden ? '#ffd700' : '#aabbff';
            manager.particleSystem.createFlash(meteor.x, meteor.y, color, 30);
        }
    }

    /**
     * Create impact effect when meteor hits bottom
     */
    createImpact(meteor, manager) {
        if (!manager.particleSystem) return;

        const impactX = meteor.x;
        const impactY = window.innerHeight - 20;

        // Create burst of particles
        const particleCount = meteor.isGolden ? 15 : 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 0.8) + (Math.random() * Math.PI * 0.4); // Upward spread
            const speed = 0.1 + Math.random() * 0.2;
            const size = 2 + Math.random() * 3;

            const particle = document.createElement('div');
            particle.className = 'meteor-impact-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${impactX}px;
                top: ${impactY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${meteor.color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 14;
                box-shadow: 0 0 ${size * 2}px ${meteor.glowColor};
            `;
            manager.container.appendChild(particle);

            // Animate particle
            const startTime = performance.now();
            const duration = 500 + Math.random() * 500;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const animate = () => {
                const elapsed = performance.now() - startTime;
                const progress = elapsed / duration;

                if (progress >= 1 || !particle.parentNode) {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                    return;
                }

                const x = impactX + vx * elapsed;
                const y = impactY + vy * elapsed + 0.0005 * elapsed * elapsed; // Gravity
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.opacity = 1 - progress;

                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        }
    }

    /**
     * Remove a meteor
     */
    removeMeteor(meteor, index) {
        if (meteor.element?.parentNode) {
            meteor.element.parentNode.removeChild(meteor.element);
        }
        if (meteor.trailElement?.parentNode) {
            meteor.trailElement.parentNode.removeChild(meteor.trailElement);
        }
        this.meteors.splice(index, 1);
    }

    /**
     * Event handler interface - called when event ends
     */
    end(eventData, manager) {
        // Remove all remaining meteors
        for (const meteor of this.meteors) {
            if (meteor.element?.parentNode) {
                meteor.element.parentNode.removeChild(meteor.element);
            }
            if (meteor.trailElement?.parentNode) {
                meteor.trailElement.parentNode.removeChild(meteor.trailElement);
            }
        }
        this.meteors = [];

        // Clear overlay
        manager.clearOverlay();

        console.log(`☄️ Meteor Shower ended: ${eventData.data.meteorsLaunched} meteors, ${eventData.data.seedsDropped} seeds, ${eventData.data.goldenMeteors} golden`);
    }

    /**
     * Event handler interface - get modifiers
     */
    getModifiers(eventData) {
        return {
            spawnRateMultiplier: 1.5 // More fireflies during meteor shower
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('meteor-shower-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'meteor-shower-styles';
        styles.textContent = `
            .meteor-head {
                animation: meteorPulse 0.1s ease-in-out infinite;
            }

            .meteor-head.golden {
                animation: goldenMeteorPulse 0.15s ease-in-out infinite;
            }

            .meteor-trail.golden {
                filter: blur(2px);
            }

            @keyframes meteorPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.9; }
            }

            @keyframes goldenMeteorPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.4); opacity: 0.95; }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MeteorShowerEvent;
}
