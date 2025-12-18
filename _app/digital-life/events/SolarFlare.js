/**
 * SolarFlare.js - Solar Flare Cosmic Event
 *
 * A wave of solar energy sweeps across the screen:
 * - All fireflies receive energy boost
 * - Screen pulses with warm golden light
 * - Fireflies glow brighter temporarily
 * - Can trigger evolution for high-tier fireflies
 * - Energy wells recharge faster
 */

class SolarFlareEvent {
    constructor() {
        this.particles = [];
        this.wavePosition = -0.2; // Start off-screen
        this.container = null;
        this.waveElement = null;
    }

    /**
     * Event handler interface - called when event starts
     */
    start(eventData, manager) {
        this.container = manager.container;
        eventData.data.wavePosition = -0.2;
        eventData.data.peakReached = false;
        eventData.data.affectedFireflies = new Set();

        // Create visual elements
        this.createWaveElement(manager);

        // Set overlay to warm golden
        manager.setOverlay(
            'radial-gradient(ellipse at 50% 0%, rgba(255, 200, 50, 0.4) 0%, transparent 70%)',
            0.3 * eventData.intensity
        );
    }

    /**
     * Create the solar wave visual element
     */
    createWaveElement(manager) {
        this.waveElement = document.createElement('div');
        this.waveElement.className = 'solar-flare-wave';
        this.waveElement.style.cssText = `
            position: fixed;
            top: -100px;
            left: 0;
            width: 100%;
            height: 200px;
            background: linear-gradient(
                180deg,
                transparent 0%,
                rgba(255, 220, 100, 0.3) 30%,
                rgba(255, 180, 50, 0.6) 50%,
                rgba(255, 220, 100, 0.3) 70%,
                transparent 100%
            );
            pointer-events: none;
            z-index: 6;
            filter: blur(20px);
            mix-blend-mode: screen;
        `;
        manager.container.appendChild(this.waveElement);

        // Inject wave animation styles
        this.injectStyles();
    }

    /**
     * Event handler interface - called every frame
     */
    update(deltaTime, timestamp, eventData, manager) {
        const progress = (timestamp - eventData.startTime) / eventData.duration;
        eventData.progress = progress;

        // Wave moves from top to bottom
        const waveProgress = this.easeInOutQuad(progress);
        const waveY = -100 + (window.innerHeight + 300) * waveProgress;

        if (this.waveElement) {
            this.waveElement.style.top = waveY + 'px';
            // Pulse opacity
            const pulse = 0.5 + Math.sin(timestamp * 0.005) * 0.3;
            this.waveElement.style.opacity = pulse * eventData.intensity;
        }

        // Update overlay intensity based on progress (peak in middle)
        const intensityCurve = Math.sin(progress * Math.PI);
        manager.setOverlay(
            'radial-gradient(ellipse at 50% 0%, rgba(255, 200, 50, 0.5) 0%, transparent 70%)',
            0.4 * intensityCurve * eventData.intensity
        );

        // Apply effects to fireflies
        if (manager.ecosystem) {
            const waveTop = waveY;
            const waveBottom = waveY + 200;

            for (const firefly of manager.ecosystem.fireflies) {
                // Check if firefly is hit by wave
                if (firefly.y >= waveTop && firefly.y <= waveBottom) {
                    if (!eventData.data.affectedFireflies.has(firefly.id)) {
                        // First hit - energy boost
                        this.applyFlareEffect(firefly, eventData, manager);
                        eventData.data.affectedFireflies.add(firefly.id);
                    }
                }

                // Ongoing glow boost for all during event
                if (!firefly._originalGlowIntensity) {
                    firefly._originalGlowIntensity = firefly.glowIntensity ?? 1;
                }
                firefly.glowIntensity = firefly._originalGlowIntensity * (1 + 0.5 * intensityCurve);
            }
        }

        // Boost energy wells
        if (manager.energyWells) {
            for (const well of manager.energyWells) {
                // Faster regeneration during solar flare
                if (!well._originalRegenRate) {
                    well._originalRegenRate = well.type.regenRate;
                }
                // Temporarily boost (will be reset on end)
            }
        }

        // Spawn solar particles occasionally
        if (Math.random() < 0.1 * eventData.intensity) {
            this.spawnSolarParticle(manager);
        }
    }

    /**
     * Apply flare effect to a firefly
     */
    applyFlareEffect(firefly, eventData, manager) {
        // Energy boost
        const energyBoost = 20 * eventData.intensity;
        firefly.energy = Math.min(100, firefly.energy + energyBoost);

        // Small chance to trigger evolution for high-tier fireflies
        if (firefly.tier && firefly.tier.level >= 2 && Math.random() < 0.1 * eventData.intensity) {
            firefly.evolutionProgress = (firefly.evolutionProgress || 0) + 25;
        }

        // Visual feedback - brief flash
        if (manager.particleSystem) {
            manager.particleSystem.createFlash(
                firefly.x, firefly.y,
                'rgba(255, 220, 100, 0.8)',
                firefly.size * 3
            );
        }
    }

    /**
     * Spawn a solar particle
     */
    spawnSolarParticle(manager) {
        const particle = document.createElement('div');
        const x = Math.random() * window.innerWidth;
        const size = 2 + Math.random() * 4;

        particle.className = 'solar-particle';
        particle.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: -10px;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, #ffdd66 0%, #ff9933 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 7;
            box-shadow: 0 0 ${size * 2}px rgba(255, 200, 50, 0.8);
        `;

        manager.container.appendChild(particle);

        // Animate falling
        const duration = 2000 + Math.random() * 3000;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1 || !particle.parentNode) {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                return;
            }

            const y = -10 + (window.innerHeight + 20) * progress;
            const drift = Math.sin(progress * Math.PI * 4) * 20;
            particle.style.top = y + 'px';
            particle.style.left = (x + drift) + 'px';
            particle.style.opacity = 1 - progress;

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }

    /**
     * Easing function for smooth wave movement
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    /**
     * Event handler interface - called when event ends
     */
    end(eventData, manager) {
        // Remove wave element
        if (this.waveElement?.parentNode) {
            this.waveElement.parentNode.removeChild(this.waveElement);
        }
        this.waveElement = null;

        // Clear overlay
        manager.clearOverlay();

        // Reset firefly glow
        if (manager.ecosystem) {
            for (const firefly of manager.ecosystem.fireflies) {
                if (firefly._originalGlowIntensity) {
                    firefly.glowIntensity = firefly._originalGlowIntensity;
                    delete firefly._originalGlowIntensity;
                }
            }
        }

        // Reset energy well regen rates
        if (manager.energyWells) {
            for (const well of manager.energyWells) {
                if (well._originalRegenRate) {
                    delete well._originalRegenRate;
                }
            }
        }
    }

    /**
     * Event handler interface - get modifiers
     */
    getModifiers(eventData) {
        const progress = eventData.progress;
        const intensityCurve = Math.sin(progress * Math.PI);

        return {
            energyMultiplier: 1 + 0.5 * intensityCurve * eventData.intensity,
            glowMultiplier: 1 + 0.3 * intensityCurve * eventData.intensity,
            spawnRateMultiplier: 1 + 0.2 * eventData.intensity
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('solar-flare-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'solar-flare-styles';
        styles.textContent = `
            .solar-flare-wave {
                animation: solarWavePulse 0.5s ease-in-out infinite;
            }

            @keyframes solarWavePulse {
                0%, 100% { filter: blur(20px) brightness(1); }
                50% { filter: blur(25px) brightness(1.2); }
            }

            .solar-particle {
                animation: solarParticleTwinkle 0.3s ease-in-out infinite;
            }

            @keyframes solarParticleTwinkle {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.3); }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SolarFlareEvent;
}
