/**
 * Eclipse.js - Eclipse Cosmic Event
 *
 * Darkness descends as a celestial body passes:
 * - Screen darkens gradually
 * - Fireflies glow significantly brighter
 * - Rare fireflies become even more visible
 * - Energy consumption reduced (conservation mode)
 * - Mystical atmosphere with star visibility boost
 */

class EclipseEvent {
    constructor() {
        this.container = null;
        this.eclipseBody = null;
        this.coronaElement = null;
        this.starsElement = null;
    }

    /**
     * Event handler interface - called when event starts
     */
    start(eventData, manager) {
        this.container = manager.container;
        eventData.data.phase = 'approaching'; // approaching, totality, departing
        eventData.data.maxDarkness = 0.7 + (eventData.intensity * 0.2); // 70-90% darkness

        // Create eclipse visual elements
        this.createEclipseBody(eventData, manager);
        this.createStarfield(manager);

        // Initial dim overlay
        manager.setOverlay(
            'rgba(0, 0, 20, 0.1)',
            0.1
        );

        this.injectStyles();
    }

    /**
     * Create the eclipse body (moon/shadow)
     */
    createEclipseBody(eventData, manager) {
        // Corona (visible during totality)
        this.coronaElement = document.createElement('div');
        this.coronaElement.className = 'eclipse-corona';
        this.coronaElement.style.cssText = `
            position: fixed;
            width: 200px;
            height: 200px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 20;
            background: radial-gradient(
                circle,
                transparent 45%,
                rgba(255, 200, 100, 0.3) 50%,
                rgba(255, 150, 50, 0.2) 60%,
                rgba(255, 100, 50, 0.1) 75%,
                transparent 100%
            );
            opacity: 0;
            transform: translate(-50%, -50%);
        `;
        manager.container.appendChild(this.coronaElement);

        // Eclipse body (dark circle)
        this.eclipseBody = document.createElement('div');
        this.eclipseBody.className = 'eclipse-body';
        this.eclipseBody.style.cssText = `
            position: fixed;
            width: 150px;
            height: 150px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 21;
            background: radial-gradient(
                circle at 30% 30%,
                rgba(30, 30, 40, 1) 0%,
                rgba(10, 10, 20, 1) 100%
            );
            box-shadow:
                0 0 50px rgba(0, 0, 0, 0.8),
                inset 0 0 30px rgba(0, 0, 0, 0.5);
            transform: translate(-50%, -50%);
        `;
        manager.container.appendChild(this.eclipseBody);

        // Position off-screen initially
        const startX = -200;
        const startY = window.innerHeight * 0.2;
        this.updateEclipsePosition(startX, startY, 0);
    }

    /**
     * Create background starfield (visible during darkness)
     */
    createStarfield(manager) {
        this.starsElement = document.createElement('div');
        this.starsElement.className = 'eclipse-starfield';
        this.starsElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 3;
            opacity: 0;
        `;

        // Generate random stars
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            const size = 1 + Math.random() * 2;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 2;

            star.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}%;
                top: ${y}%;
                background: #fff;
                border-radius: 50%;
                box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, 0.5);
                animation: starTwinkle 2s ease-in-out ${delay}s infinite;
            `;
            this.starsElement.appendChild(star);
        }

        manager.container.appendChild(this.starsElement);
    }

    /**
     * Update eclipse body position
     */
    updateEclipsePosition(x, y, coronaOpacity) {
        if (this.eclipseBody) {
            this.eclipseBody.style.left = x + 'px';
            this.eclipseBody.style.top = y + 'px';
        }
        if (this.coronaElement) {
            this.coronaElement.style.left = x + 'px';
            this.coronaElement.style.top = y + 'px';
            this.coronaElement.style.opacity = coronaOpacity;
        }
    }

    /**
     * Event handler interface - called every frame
     */
    update(deltaTime, timestamp, eventData, manager) {
        const progress = (timestamp - eventData.startTime) / eventData.duration;
        eventData.progress = progress;

        // Eclipse path: enters from left, crosses top portion of screen, exits right
        const pathProgress = this.easeInOutSine(progress);
        const x = -200 + (window.innerWidth + 400) * pathProgress;
        const y = window.innerHeight * 0.25 + Math.sin(pathProgress * Math.PI) * 50;

        // Darkness curve: peaks at 50% progress (totality)
        const darknessCurve = Math.sin(progress * Math.PI);
        const darkness = eventData.data.maxDarkness * darknessCurve;

        // Determine phase
        if (progress < 0.3) {
            eventData.data.phase = 'approaching';
        } else if (progress < 0.7) {
            eventData.data.phase = 'totality';
        } else {
            eventData.data.phase = 'departing';
        }

        // Corona is most visible during totality
        const coronaOpacity = eventData.data.phase === 'totality' ?
            0.8 * darknessCurve : 0.3 * darknessCurve;

        this.updateEclipsePosition(x, y, coronaOpacity);

        // Update darkness overlay
        manager.setOverlay(
            `rgba(0, 0, 20, ${darkness})`,
            1
        );

        // Stars become visible as it gets darker
        if (this.starsElement) {
            this.starsElement.style.opacity = Math.min(1, darkness * 1.5);
        }

        // Boost firefly glow based on darkness
        if (manager.ecosystem) {
            const glowBoost = 1 + (darkness * 2); // Up to 3x glow at max darkness

            for (const firefly of manager.ecosystem.fireflies) {
                // Store original if not stored
                if (!firefly._eclipseOriginalGlow) {
                    firefly._eclipseOriginalGlow = firefly.glowIntensity ?? 1;
                }

                // Apply boosted glow
                firefly.glowIntensity = firefly._eclipseOriginalGlow * glowBoost;

                // Rare fireflies glow even more
                if (firefly.rareType) {
                    firefly.glowIntensity *= 1.3;
                }

                // Update visual if element exists
                if (firefly.element) {
                    const baseGlow = firefly.tier?.glowColor || 'rgba(159, 122, 234, 0.6)';
                    firefly.element.style.textShadow = `
                        0 0 ${5 * glowBoost}px ${baseGlow},
                        0 0 ${10 * glowBoost}px ${baseGlow},
                        0 0 ${20 * glowBoost}px ${baseGlow}
                    `;
                }
            }
        }

        // Spawn occasional "eclipse particles" during totality
        if (eventData.data.phase === 'totality' && Math.random() < 0.02) {
            this.spawnEclipseParticle(x, y, manager);
        }
    }

    /**
     * Spawn a particle from the corona
     */
    spawnEclipseParticle(eclipseX, eclipseY, manager) {
        const particle = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const distance = 75 + Math.random() * 50;
        const x = eclipseX + Math.cos(angle) * distance;
        const y = eclipseY + Math.sin(angle) * distance;
        const size = 2 + Math.random() * 3;

        particle.className = 'eclipse-particle';
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, #ffd700 0%, #ff8800 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 19;
            box-shadow: 0 0 ${size * 3}px rgba(255, 200, 50, 0.6);
        `;
        manager.container.appendChild(particle);

        // Animate outward
        const startTime = performance.now();
        const duration = 1500 + Math.random() * 1000;
        const vx = Math.cos(angle) * 0.05;
        const vy = Math.sin(angle) * 0.05;

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1 || !particle.parentNode) {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                return;
            }

            const px = x + vx * elapsed;
            const py = y + vy * elapsed;
            particle.style.left = px + 'px';
            particle.style.top = py + 'px';
            particle.style.opacity = 1 - progress;
            particle.style.transform = `scale(${1 - progress * 0.5})`;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Easing function
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    /**
     * Event handler interface - called when event ends
     */
    end(eventData, manager) {
        // Remove visual elements
        if (this.eclipseBody?.parentNode) {
            this.eclipseBody.parentNode.removeChild(this.eclipseBody);
        }
        if (this.coronaElement?.parentNode) {
            this.coronaElement.parentNode.removeChild(this.coronaElement);
        }
        if (this.starsElement?.parentNode) {
            this.starsElement.parentNode.removeChild(this.starsElement);
        }

        this.eclipseBody = null;
        this.coronaElement = null;
        this.starsElement = null;

        // Restore firefly glow
        if (manager.ecosystem) {
            for (const firefly of manager.ecosystem.fireflies) {
                if (firefly._eclipseOriginalGlow) {
                    firefly.glowIntensity = firefly._eclipseOriginalGlow;
                    delete firefly._eclipseOriginalGlow;
                }
                // Reset text shadow
                if (firefly.element) {
                    firefly.element.style.textShadow = '';
                }
            }
        }

        // Clear overlay
        manager.clearOverlay();
    }

    /**
     * Event handler interface - get modifiers
     */
    getModifiers(eventData) {
        const darknessCurve = Math.sin(eventData.progress * Math.PI);
        return {
            glowMultiplier: 1 + (darknessCurve * 2 * eventData.intensity),
            energyMultiplier: 1 - (darknessCurve * 0.3), // Reduced energy consumption
            deathRateMultiplier: 1 - (darknessCurve * 0.2) // Slightly safer
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('eclipse-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'eclipse-styles';
        styles.textContent = `
            .eclipse-body {
                animation: eclipsePulse 4s ease-in-out infinite;
            }

            .eclipse-corona {
                animation: coronaPulse 2s ease-in-out infinite;
            }

            @keyframes eclipsePulse {
                0%, 100% { box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(0, 0, 0, 0.5); }
                50% { box-shadow: 0 0 60px rgba(0, 0, 0, 0.9), inset 0 0 40px rgba(0, 0, 0, 0.6); }
            }

            @keyframes coronaPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
            }

            @keyframes starTwinkle {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EclipseEvent;
}
