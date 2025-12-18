/**
 * VoidStorm.js - Void Storm Cosmic Event
 *
 * A chaotic gravity distortion sweeps through:
 * - Multiple gravity wells appear and move
 * - Fireflies are pulled in random directions
 * - Visual distortion effect on screen
 * - Black hole becomes unstable (if present)
 * - Some fireflies may get "void-touched" marker
 */

class VoidStormEvent {
    constructor() {
        this.vortices = [];
        this.container = null;
        this.distortionElement = null;
    }

    /**
     * Event handler interface - called when event starts
     */
    start(eventData, manager) {
        this.container = manager.container;
        eventData.data.voidTouched = 0;
        eventData.data.maxVortices = 3 + Math.floor(eventData.intensity * 3);

        // Create initial vortices
        const initialCount = 1 + Math.floor(eventData.intensity * 2);
        for (let i = 0; i < initialCount; i++) {
            this.spawnVortex(eventData, manager);
        }

        // Create distortion overlay
        this.createDistortionOverlay(manager);

        // Dark purple overlay
        manager.setOverlay(
            'radial-gradient(ellipse at center, rgba(50, 0, 80, 0.4) 0%, rgba(20, 0, 40, 0.6) 100%)',
            0.5 * eventData.intensity
        );

        // Make black hole unstable if present
        if (manager.blackHole) {
            manager.blackHole._originalGravityStrength = manager.blackHole.gravityStrength;
            eventData.data.blackHoleAffected = true;
        }

        this.injectStyles();
    }

    /**
     * Create visual distortion overlay
     */
    createDistortionOverlay(manager) {
        this.distortionElement = document.createElement('div');
        this.distortionElement.className = 'void-storm-distortion';
        this.distortionElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 4;
            background: transparent;
            filter: url(#void-distortion);
        `;

        // Create SVG filter for distortion
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.style.position = 'absolute';
        svg.innerHTML = `
            <defs>
                <filter id="void-distortion">
                    <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" seed="${Math.random() * 100}">
                        <animate attributeName="baseFrequency" dur="10s" values="0.01;0.02;0.01" repeatCount="indefinite"/>
                    </feTurbulence>
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
            </defs>
        `;

        manager.container.appendChild(svg);
        manager.container.appendChild(this.distortionElement);
    }

    /**
     * Spawn a gravity vortex
     */
    spawnVortex(eventData, manager) {
        if (this.vortices.length >= eventData.data.maxVortices) return;

        const vortex = {
            id: 'vortex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.05, // Slow drift
            vy: (Math.random() - 0.5) * 0.05,
            radius: 80 + Math.random() * 120,
            strength: 0.01 + Math.random() * 0.02 * eventData.intensity,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            clockwise: Math.random() < 0.5,
            age: 0,
            maxAge: 3000 + Math.random() * 5000,
            element: null
        };

        // Create visual element
        vortex.element = document.createElement('div');
        vortex.element.className = 'void-vortex';
        vortex.element.style.cssText = `
            position: fixed;
            width: ${vortex.radius * 2}px;
            height: ${vortex.radius * 2}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 5;
            background: radial-gradient(
                circle,
                rgba(80, 0, 120, 0.1) 0%,
                rgba(60, 0, 100, 0.3) 40%,
                rgba(40, 0, 80, 0.5) 70%,
                transparent 100%
            );
            border: 1px solid rgba(150, 50, 200, 0.3);
            box-shadow:
                inset 0 0 30px rgba(100, 0, 150, 0.4),
                0 0 20px rgba(100, 0, 150, 0.3);
        `;
        manager.container.appendChild(vortex.element);

        // Inner spiral
        const spiral = document.createElement('div');
        spiral.className = 'void-spiral';
        spiral.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 60%;
            height: 60%;
            transform: translate(-50%, -50%);
            border: 2px solid rgba(150, 50, 200, 0.4);
            border-radius: 50%;
            border-top-color: transparent;
            border-left-color: transparent;
        `;
        vortex.element.appendChild(spiral);

        this.vortices.push(vortex);
    }

    /**
     * Event handler interface - called every frame
     */
    update(deltaTime, timestamp, eventData, manager) {
        const progress = (timestamp - eventData.startTime) / eventData.duration;
        eventData.progress = progress;

        // Intensity peaks in middle
        const intensityCurve = Math.sin(progress * Math.PI);

        // Update overlay
        manager.setOverlay(
            'radial-gradient(ellipse at center, rgba(50, 0, 80, 0.5) 0%, rgba(20, 0, 40, 0.7) 100%)',
            0.4 * intensityCurve * eventData.intensity
        );

        // Maybe spawn new vortex
        if (Math.random() < 0.005 * eventData.intensity && this.vortices.length < eventData.data.maxVortices) {
            this.spawnVortex(eventData, manager);
        }

        // Update vortices
        for (let i = this.vortices.length - 1; i >= 0; i--) {
            const vortex = this.vortices[i];
            vortex.age += deltaTime;

            // Remove old vortices
            if (vortex.age > vortex.maxAge) {
                this.removeVortex(vortex, i);
                continue;
            }

            // Move vortex
            vortex.x += vortex.vx * deltaTime;
            vortex.y += vortex.vy * deltaTime;
            vortex.rotation += vortex.rotationSpeed * deltaTime;

            // Bounce off edges
            if (vortex.x < 0 || vortex.x > window.innerWidth) vortex.vx *= -1;
            if (vortex.y < 0 || vortex.y > window.innerHeight) vortex.vy *= -1;

            // Update visual
            if (vortex.element) {
                vortex.element.style.left = (vortex.x - vortex.radius) + 'px';
                vortex.element.style.top = (vortex.y - vortex.radius) + 'px';
                vortex.element.style.transform = `rotate(${vortex.rotation}rad)`;

                // Fade in/out
                const ageProgress = vortex.age / vortex.maxAge;
                const opacity = ageProgress < 0.2 ? ageProgress * 5 :
                               ageProgress > 0.8 ? (1 - ageProgress) * 5 : 1;
                vortex.element.style.opacity = opacity;
            }

            // Apply gravity to fireflies
            if (manager.ecosystem) {
                this.applyVortexGravity(vortex, manager.ecosystem, eventData);
            }
        }

        // Make black hole unstable
        if (eventData.data.blackHoleAffected && manager.blackHole) {
            const wobble = Math.sin(timestamp * 0.01) * 0.02 * eventData.intensity;
            manager.blackHole.gravityStrength = manager.blackHole._originalGravityStrength * (1 + wobble);
        }
    }

    /**
     * Apply vortex gravity to fireflies
     */
    applyVortexGravity(vortex, ecosystem, eventData) {
        for (const firefly of ecosystem.fireflies) {
            const dx = vortex.x - firefly.x;
            const dy = vortex.y - firefly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > vortex.radius || dist < 10) continue;

            // Gravity strength falls off with distance
            const falloff = 1 - (dist / vortex.radius);
            const force = vortex.strength * falloff;

            // Apply tangential force (swirling) + radial force (pull)
            const angle = Math.atan2(dy, dx);
            const tangentAngle = angle + (vortex.clockwise ? Math.PI / 2 : -Math.PI / 2);

            const tangentForce = force * 0.7;
            const radialForce = force * 0.3;

            const fx = Math.cos(tangentAngle) * tangentForce + (dx / dist) * radialForce;
            const fy = Math.sin(tangentAngle) * tangentForce + (dy / dist) * radialForce;

            if (firefly.applyForce) {
                firefly.applyForce(fx, fy);
            }

            // Chance to become void-touched
            if (!firefly.isVoidTouched && dist < vortex.radius * 0.3) {
                if (Math.random() < 0.001 * eventData.intensity) {
                    firefly.isVoidTouched = true;
                    firefly.blackHoleResistance = (firefly.blackHoleResistance || 0) + 0.3;
                    eventData.data.voidTouched++;

                    // Visual indicator
                    if (firefly.element) {
                        firefly.element.style.filter = 'hue-rotate(270deg)';
                        setTimeout(() => {
                            if (firefly.element) {
                                firefly.element.style.filter = '';
                            }
                        }, 500);
                    }
                }
            }
        }
    }

    /**
     * Remove a vortex
     */
    removeVortex(vortex, index) {
        if (vortex.element?.parentNode) {
            vortex.element.parentNode.removeChild(vortex.element);
        }
        this.vortices.splice(index, 1);
    }

    /**
     * Event handler interface - called when event ends
     */
    end(eventData, manager) {
        // Remove all vortices
        for (const vortex of this.vortices) {
            if (vortex.element?.parentNode) {
                vortex.element.parentNode.removeChild(vortex.element);
            }
        }
        this.vortices = [];

        // Remove distortion overlay
        if (this.distortionElement?.parentNode) {
            this.distortionElement.parentNode.removeChild(this.distortionElement);
        }

        // Remove SVG filter
        const svg = manager.container.querySelector('svg');
        if (svg?.parentNode) {
            svg.parentNode.removeChild(svg);
        }

        // Restore black hole
        if (eventData.data.blackHoleAffected && manager.blackHole) {
            manager.blackHole.gravityStrength = manager.blackHole._originalGravityStrength;
            delete manager.blackHole._originalGravityStrength;
        }

        // Clear overlay
        manager.clearOverlay();

        console.log(`🌀 Void Storm ended: ${eventData.data.voidTouched} fireflies void-touched`);
    }

    /**
     * Event handler interface - get modifiers
     */
    getModifiers(eventData) {
        const intensityCurve = Math.sin(eventData.progress * Math.PI);
        return {
            gravityMultiplier: 1 + 0.5 * intensityCurve * eventData.intensity,
            speedMultiplier: 1 + 0.2 * intensityCurve,
            deathRateMultiplier: 1 + 0.1 * eventData.intensity // Slightly more dangerous
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('void-storm-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'void-storm-styles';
        styles.textContent = `
            .void-vortex {
                animation: voidPulse 2s ease-in-out infinite;
            }

            .void-spiral {
                animation: voidSpin 3s linear infinite;
            }

            @keyframes voidPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes voidSpin {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }

            .void-storm-distortion {
                animation: voidDistort 5s ease-in-out infinite;
            }

            @keyframes voidDistort {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.6; }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoidStormEvent;
}
