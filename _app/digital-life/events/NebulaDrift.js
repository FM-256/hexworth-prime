/**
 * NebulaDrift.js - Nebula Drift Cosmic Event
 *
 * Colorful gas clouds drift through the ecosystem:
 * - Multiple nebula clouds with different colors
 * - Each cloud type affects fireflies differently
 * - Beautiful visual with semi-transparent layers
 * - Fireflies inside clouds change behavior/color
 * - Long duration, ambient event
 */

class NebulaDriftEvent {
    // Nebula types with different effects
    static NEBULA_TYPES = {
        ENERGY: {
            name: 'Energy Nebula',
            color: 'rgba(50, 200, 100, 0.2)',      // Green
            glowColor: 'rgba(100, 255, 150, 0.4)',
            effect: 'energy',                      // Boosts energy
            modifier: 1.5
        },
        CALM: {
            name: 'Calm Nebula',
            color: 'rgba(100, 150, 255, 0.2)',     // Blue
            glowColor: 'rgba(150, 200, 255, 0.4)',
            effect: 'calm',                        // Slows movement
            modifier: 0.6
        },
        CHAOS: {
            name: 'Chaos Nebula',
            color: 'rgba(255, 100, 150, 0.2)',     // Pink/Red
            glowColor: 'rgba(255, 150, 200, 0.4)',
            effect: 'chaos',                       // Random movement
            modifier: 2.0
        },
        EVOLUTION: {
            name: 'Evolution Nebula',
            color: 'rgba(200, 150, 255, 0.2)',     // Purple
            glowColor: 'rgba(220, 180, 255, 0.4)',
            effect: 'evolution',                   // Evolution boost
            modifier: 1.3
        },
        ANCIENT: {
            name: 'Ancient Nebula',
            color: 'rgba(255, 200, 100, 0.15)',    // Gold
            glowColor: 'rgba(255, 220, 150, 0.3)',
            effect: 'ancient',                     // Lifespan boost
            modifier: 1.2
        }
    };

    constructor() {
        this.nebulae = [];
        this.container = null;
    }

    /**
     * Event handler interface - called when event starts
     */
    start(eventData, manager) {
        this.container = manager.container;
        eventData.data.firefliesAffected = new Set();
        eventData.data.nebulaCount = 2 + Math.floor(eventData.intensity * 2);

        // Spawn initial nebulae
        for (let i = 0; i < eventData.data.nebulaCount; i++) {
            this.spawnNebula(eventData, manager);
        }

        // Subtle ambient overlay
        manager.setOverlay(
            'radial-gradient(ellipse at center, rgba(100, 80, 150, 0.1) 0%, transparent 70%)',
            0.2
        );

        this.injectStyles();
    }

    /**
     * Spawn a nebula cloud
     */
    spawnNebula(eventData, manager) {
        // Random type
        const typeNames = Object.keys(NebulaDriftEvent.NEBULA_TYPES);
        const typeName = typeNames[Math.floor(Math.random() * typeNames.length)];
        const type = NebulaDriftEvent.NEBULA_TYPES[typeName];

        // Random size and position
        const width = 200 + Math.random() * 300;
        const height = 150 + Math.random() * 250;
        const x = Math.random() * (window.innerWidth - width);
        const y = Math.random() * (window.innerHeight - height);

        // Drift direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.01 + Math.random() * 0.02;

        const nebula = {
            id: 'nebula_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: type,
            typeName: typeName,
            x: x,
            y: y,
            width: width,
            height: height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            opacity: 0,
            targetOpacity: 0.6 + Math.random() * 0.3,
            age: 0,
            element: null,
            affectedFireflies: new Set()
        };

        // Create visual element
        this.createNebulaElement(nebula, manager);

        this.nebulae.push(nebula);
    }

    /**
     * Create nebula DOM element
     */
    createNebulaElement(nebula, manager) {
        nebula.element = document.createElement('div');
        nebula.element.className = 'nebula-cloud';
        nebula.element.style.cssText = `
            position: fixed;
            width: ${nebula.width}px;
            height: ${nebula.height}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 3;
            opacity: 0;
            filter: blur(30px);
            background: radial-gradient(
                ellipse at center,
                ${nebula.type.glowColor} 0%,
                ${nebula.type.color} 40%,
                transparent 70%
            );
            mix-blend-mode: screen;
        `;
        manager.container.appendChild(nebula.element);

        // Inner glow layer
        const innerGlow = document.createElement('div');
        innerGlow.className = 'nebula-inner';
        innerGlow.style.cssText = `
            position: absolute;
            top: 20%;
            left: 20%;
            width: 60%;
            height: 60%;
            border-radius: 50%;
            background: radial-gradient(
                ellipse at center,
                ${nebula.type.glowColor} 0%,
                transparent 70%
            );
            filter: blur(15px);
            animation: nebulaInnerPulse 4s ease-in-out infinite;
        `;
        nebula.element.appendChild(innerGlow);
    }

    /**
     * Event handler interface - called every frame
     */
    update(deltaTime, timestamp, eventData, manager) {
        const progress = (timestamp - eventData.startTime) / eventData.duration;
        eventData.progress = progress;

        // Update nebulae
        for (const nebula of this.nebulae) {
            nebula.age += deltaTime;

            // Fade in/out
            const fadeIn = Math.min(1, nebula.age / 2000);
            const fadeOut = progress > 0.8 ? (1 - progress) * 5 : 1;
            nebula.opacity = nebula.targetOpacity * fadeIn * fadeOut;

            // Move nebula
            nebula.x += nebula.vx * deltaTime;
            nebula.y += nebula.vy * deltaTime;
            nebula.rotation += nebula.rotationSpeed * deltaTime;

            // Wrap around screen edges
            if (nebula.x < -nebula.width) nebula.x = window.innerWidth;
            if (nebula.x > window.innerWidth) nebula.x = -nebula.width;
            if (nebula.y < -nebula.height) nebula.y = window.innerHeight;
            if (nebula.y > window.innerHeight) nebula.y = -nebula.height;

            // Update visual
            if (nebula.element) {
                nebula.element.style.left = nebula.x + 'px';
                nebula.element.style.top = nebula.y + 'px';
                nebula.element.style.opacity = nebula.opacity;
                nebula.element.style.transform = `rotate(${nebula.rotation}deg)`;
            }

            // Check fireflies inside this nebula
            if (manager.ecosystem) {
                this.applyNebulaEffects(nebula, manager.ecosystem, eventData);
            }
        }
    }

    /**
     * Apply nebula effects to fireflies inside it
     */
    applyNebulaEffects(nebula, ecosystem, eventData) {
        const centerX = nebula.x + nebula.width / 2;
        const centerY = nebula.y + nebula.height / 2;
        const radiusX = nebula.width / 2 * 0.7; // Effective radius
        const radiusY = nebula.height / 2 * 0.7;

        for (const firefly of ecosystem.fireflies) {
            // Ellipse containment check
            const dx = (firefly.x - centerX) / radiusX;
            const dy = (firefly.y - centerY) / radiusY;
            const isInside = (dx * dx + dy * dy) <= 1;

            const wasInside = nebula.affectedFireflies.has(firefly.id);

            if (isInside && !wasInside) {
                // Entered nebula
                nebula.affectedFireflies.add(firefly.id);
                eventData.data.firefliesAffected.add(firefly.id);
                this.onEnterNebula(firefly, nebula);
            } else if (!isInside && wasInside) {
                // Left nebula
                nebula.affectedFireflies.delete(firefly.id);
                this.onExitNebula(firefly, nebula);
            } else if (isInside) {
                // Still inside - apply continuous effects
                this.applyContinuousEffect(firefly, nebula);
            }
        }
    }

    /**
     * Called when firefly enters nebula
     */
    onEnterNebula(firefly, nebula) {
        // Store original values
        if (!firefly._nebulaOriginals) {
            firefly._nebulaOriginals = {
                speed: firefly.baseSpeed,
                energyDecay: firefly.energyDecayRate
            };
        }

        // Apply tint based on nebula type
        if (firefly.element) {
            firefly.element.style.filter = `hue-rotate(${this.getHueRotation(nebula.typeName)}deg)`;
        }
    }

    /**
     * Get hue rotation for nebula type
     */
    getHueRotation(typeName) {
        switch (typeName) {
            case 'ENERGY': return 90;      // Greenish
            case 'CALM': return 200;       // Blueish
            case 'CHAOS': return 330;      // Pinkish
            case 'EVOLUTION': return 270;  // Purple
            case 'ANCIENT': return 40;     // Golden
            default: return 0;
        }
    }

    /**
     * Apply continuous effect while inside nebula
     */
    applyContinuousEffect(firefly, nebula) {
        const effect = nebula.type.effect;
        const modifier = nebula.type.modifier;

        switch (effect) {
            case 'energy':
                // Boost energy regeneration
                firefly.energy = Math.min(100, firefly.energy + 0.05 * modifier);
                break;

            case 'calm':
                // Slow movement
                if (firefly.vx) firefly.vx *= 0.98;
                if (firefly.vy) firefly.vy *= 0.98;
                break;

            case 'chaos':
                // Random movement impulses
                if (Math.random() < 0.05) {
                    const angle = Math.random() * Math.PI * 2;
                    const force = 0.05 * modifier;
                    if (firefly.applyForce) {
                        firefly.applyForce(
                            Math.cos(angle) * force,
                            Math.sin(angle) * force
                        );
                    }
                }
                break;

            case 'evolution':
                // Boost evolution progress
                if (firefly.evolutionProgress !== undefined) {
                    firefly.evolutionProgress += 0.01 * modifier;
                }
                break;

            case 'ancient':
                // Extend lifespan slightly
                if (firefly.maxAge && firefly.age < firefly.maxAge * 0.9) {
                    firefly.maxAge += 0.1;
                }
                break;
        }
    }

    /**
     * Called when firefly exits nebula
     */
    onExitNebula(firefly, nebula) {
        // Clear tint
        if (firefly.element) {
            firefly.element.style.filter = '';
        }

        // Restore original values
        if (firefly._nebulaOriginals) {
            firefly.baseSpeed = firefly._nebulaOriginals.speed;
            firefly.energyDecayRate = firefly._nebulaOriginals.energyDecay;
            delete firefly._nebulaOriginals;
        }
    }

    /**
     * Event handler interface - called when event ends
     */
    end(eventData, manager) {
        // Clear all firefly effects
        if (manager.ecosystem) {
            for (const firefly of manager.ecosystem.fireflies) {
                if (firefly.element) {
                    firefly.element.style.filter = '';
                }
                if (firefly._nebulaOriginals) {
                    firefly.baseSpeed = firefly._nebulaOriginals.speed;
                    firefly.energyDecayRate = firefly._nebulaOriginals.energyDecay;
                    delete firefly._nebulaOriginals;
                }
            }
        }

        // Remove all nebula elements
        for (const nebula of this.nebulae) {
            if (nebula.element?.parentNode) {
                nebula.element.parentNode.removeChild(nebula.element);
            }
        }
        this.nebulae = [];

        // Clear overlay
        manager.clearOverlay();

        console.log(`🌌 Nebula Drift ended: ${eventData.data.firefliesAffected.size} fireflies affected`);
    }

    /**
     * Event handler interface - get modifiers
     */
    getModifiers(eventData) {
        // Average effect across all nebulae
        return {
            energyMultiplier: 1.1, // Slight energy bonus
            glowMultiplier: 1.2    // Enhanced glow
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('nebula-drift-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'nebula-drift-styles';
        styles.textContent = `
            .nebula-cloud {
                animation: nebulaFloat 10s ease-in-out infinite;
            }

            @keyframes nebulaFloat {
                0%, 100% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.05) rotate(2deg); }
                50% { transform: scale(1) rotate(0deg); }
                75% { transform: scale(0.95) rotate(-2deg); }
            }

            @keyframes nebulaInnerPulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.1); }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NebulaDriftEvent;
}
