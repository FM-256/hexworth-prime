/**
 * GodParticle.js - The All-Seeing Eye
 *
 * A divine entity that manifests when God Mode is activated:
 * - 10x larger than normal fireflies
 * - Majestic, slow floating movement
 * - Emanates an aura that affects all nearby entities
 * - Fireflies react to its presence based on their nature
 *
 * Visual: A giant ethereal eyeball with cosmic glow
 */

class GodParticle {
    /**
     * Create the God Particle
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Identity
        this.id = 'god_particle_' + Date.now();
        this.type = 'god';

        // Position
        this.x = options.x ?? window.innerWidth / 2;
        this.y = options.y ?? window.innerHeight / 2;

        // Velocity (slow, majestic movement)
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;

        // Size (10x normal firefly)
        this.baseSize = 150;
        this.size = this.baseSize;
        this.pulseMin = 140;
        this.pulseMax = 160;

        // Aura of influence
        this.auraRadius = 300;          // Range of influence on fireflies
        this.auraStrength = 1.0;        // Intensity of effect

        // Visual state
        this.rotation = 0;
        this.rotationSpeed = 0.005;     // Slow, watchful rotation
        this.pulsePhase = 0;
        this.pulseSpeed = 0.02;
        this.eyeDirection = { x: 0, y: 0 };  // Where the eye is looking
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.blinkDuration = 150;       // ms
        this.blinkInterval = 5000;      // Blink every 5 seconds

        // Movement behavior
        this.wanderAngle = Math.random() * Math.PI * 2;
        this.wanderSpeed = 0.01;
        this.maxSpeed = 0.5;
        this.drag = 0.98;

        // State
        this.isActive = true;
        this.opacity = 0;               // Fade in on spawn
        this.targetOpacity = 1;

        // DOM elements
        this.element = null;
        this.eyeElement = null;
        this.pupilElement = null;
        this.auraElement = null;
        this.innerGlowElement = null;

        // Animation
        this.animationFrameId = null;
        this.lastTime = 0;

        // Callbacks
        this.onMove = null;
    }

    /**
     * Create DOM element
     * @param {HTMLElement} container - Parent container
     */
    createElement(container) {
        // Main container
        this.element = document.createElement('div');
        this.element.className = 'god-particle';
        this.element.id = this.id;

        // Outer aura (pulsing glow)
        this.auraElement = document.createElement('div');
        this.auraElement.className = 'god-particle-aura';
        this.element.appendChild(this.auraElement);

        // Inner glow ring
        this.innerGlowElement = document.createElement('div');
        this.innerGlowElement.className = 'god-particle-inner-glow';
        this.element.appendChild(this.innerGlowElement);

        // Eye container
        this.eyeElement = document.createElement('div');
        this.eyeElement.className = 'god-particle-eye';
        this.element.appendChild(this.eyeElement);

        // Iris
        this.irisElement = document.createElement('div');
        this.irisElement.className = 'god-particle-iris';
        this.eyeElement.appendChild(this.irisElement);

        // Pupil (follows cursor/fireflies)
        this.pupilElement = document.createElement('div');
        this.pupilElement.className = 'god-particle-pupil';
        this.irisElement.appendChild(this.pupilElement);

        // Highlight
        this.highlightElement = document.createElement('div');
        this.highlightElement.className = 'god-particle-highlight';
        this.eyeElement.appendChild(this.highlightElement);

        // Inject styles
        this.injectStyles();

        // Add to container
        container.appendChild(this.element);

        // Initial position
        this.updatePosition();

        // Track mouse for eye movement
        document.addEventListener('mousemove', (e) => this.trackTarget(e.clientX, e.clientY));
    }

    /**
     * Inject CSS styles for the God Particle
     */
    injectStyles() {
        if (document.getElementById('god-particle-styles')) return;

        const style = document.createElement('style');
        style.id = 'god-particle-styles';
        style.textContent = `
            .god-particle {
                position: fixed;
                pointer-events: none;
                z-index: 9998;
                transition: opacity 1s ease;
            }

            .god-particle-aura {
                position: absolute;
                width: 300px;
                height: 300px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(168, 85, 247, 0.3) 0%,
                    rgba(139, 92, 246, 0.15) 40%,
                    rgba(124, 58, 237, 0.05) 70%,
                    transparent 100%
                );
                animation: godAuraPulse 4s ease-in-out infinite;
            }

            .god-particle-inner-glow {
                position: absolute;
                width: 180px;
                height: 180px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255, 255, 255, 0.1) 0%,
                    rgba(168, 85, 247, 0.2) 50%,
                    transparent 100%
                );
                animation: godInnerPulse 2s ease-in-out infinite;
            }

            .god-particle-eye {
                position: absolute;
                width: 150px;
                height: 150px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: radial-gradient(ellipse at 30% 30%,
                    #f8f8ff 0%,
                    #e8e8f0 50%,
                    #c8c8d8 100%
                );
                box-shadow:
                    inset 0 0 30px rgba(0, 0, 0, 0.2),
                    0 0 40px rgba(168, 85, 247, 0.6),
                    0 0 80px rgba(139, 92, 246, 0.4);
                overflow: hidden;
            }

            .god-particle-iris {
                position: absolute;
                width: 80px;
                height: 80px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: radial-gradient(circle at 40% 40%,
                    #a855f7 0%,
                    #7c3aed 40%,
                    #5b21b6 70%,
                    #4c1d95 100%
                );
                box-shadow:
                    inset 0 0 15px rgba(0, 0, 0, 0.4),
                    0 0 10px rgba(168, 85, 247, 0.5);
                transition: transform 0.1s ease-out;
            }

            .god-particle-pupil {
                position: absolute;
                width: 35px;
                height: 35px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%,
                    #1a1a2e 0%,
                    #0a0a0f 100%
                );
                box-shadow: inset 0 0 10px rgba(168, 85, 247, 0.3);
            }

            .god-particle-highlight {
                position: absolute;
                width: 20px;
                height: 20px;
                left: 30%;
                top: 25%;
                border-radius: 50%;
                background: radial-gradient(circle,
                    rgba(255, 255, 255, 0.9) 0%,
                    rgba(255, 255, 255, 0.4) 50%,
                    transparent 100%
                );
            }

            .god-particle.blinking .god-particle-eye {
                transform: translate(-50%, -50%) scaleY(0.1);
            }

            .god-particle-eye {
                transition: transform 0.1s ease;
            }

            @keyframes godAuraPulse {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.8;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.15);
                    opacity: 1;
                }
            }

            @keyframes godInnerPulse {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.6;
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.1);
                    opacity: 1;
                }
            }

            /* Cosmic particles around the eye */
            .god-particle::before {
                content: '';
                position: absolute;
                width: 400px;
                height: 400px;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                background-image:
                    radial-gradient(2px 2px at 20% 30%, rgba(168, 85, 247, 0.8), transparent),
                    radial-gradient(2px 2px at 40% 70%, rgba(139, 92, 246, 0.6), transparent),
                    radial-gradient(1px 1px at 60% 20%, rgba(192, 132, 252, 0.7), transparent),
                    radial-gradient(2px 2px at 80% 50%, rgba(168, 85, 247, 0.5), transparent),
                    radial-gradient(1px 1px at 30% 80%, rgba(124, 58, 237, 0.6), transparent),
                    radial-gradient(2px 2px at 70% 90%, rgba(139, 92, 246, 0.4), transparent);
                animation: godParticleOrbit 20s linear infinite;
            }

            @keyframes godParticleOrbit {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Track a target (mouse or nearest firefly) with the eye
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     */
    trackTarget(targetX, targetY) {
        if (!this.irisElement || this.isBlinking) return;

        // Calculate direction to target
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Limit eye movement range
        const maxOffset = 15;
        const offsetX = (dx / Math.max(distance, 1)) * Math.min(distance * 0.1, maxOffset);
        const offsetY = (dy / Math.max(distance, 1)) * Math.min(distance * 0.1, maxOffset);

        this.eyeDirection.x = offsetX;
        this.eyeDirection.y = offsetY;

        // Apply to iris
        this.irisElement.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    }

    /**
     * Update position on screen
     */
    updatePosition() {
        if (!this.element) return;

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.opacity = this.opacity;
    }

    /**
     * Main update loop
     * @param {number} deltaTime - Time since last frame in ms
     */
    update(deltaTime) {
        if (!this.isActive) return;

        const dt = deltaTime / 1000; // Convert to seconds

        // Fade in
        if (this.opacity < this.targetOpacity) {
            this.opacity = Math.min(this.opacity + dt * 0.5, this.targetOpacity);
        }

        // Wandering movement
        this.wanderAngle += (Math.random() - 0.5) * this.wanderSpeed;
        this.vx += Math.cos(this.wanderAngle) * 0.02;
        this.vy += Math.sin(this.wanderAngle) * 0.02;

        // Apply drag
        this.vx *= this.drag;
        this.vy *= this.drag;

        // Limit speed
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary wrapping with margin
        const margin = 100;
        if (this.x < -margin) this.x = window.innerWidth + margin;
        if (this.x > window.innerWidth + margin) this.x = -margin;
        if (this.y < -margin) this.y = window.innerHeight + margin;
        if (this.y > window.innerHeight + margin) this.y = -margin;

        // Blinking
        this.blinkTimer += deltaTime;
        if (this.blinkTimer >= this.blinkInterval && !this.isBlinking) {
            this.blink();
        }

        // Size pulse
        this.pulsePhase += this.pulseSpeed;
        this.size = this.pulseMin + (this.pulseMax - this.pulseMin) * (0.5 + 0.5 * Math.sin(this.pulsePhase));

        // Update visual
        this.updatePosition();

        // Callback
        if (this.onMove) {
            this.onMove(this.x, this.y);
        }
    }

    /**
     * Make the eye blink
     */
    blink() {
        if (this.isBlinking) return;

        this.isBlinking = true;
        this.element.classList.add('blinking');

        setTimeout(() => {
            this.element.classList.remove('blinking');
            this.isBlinking = false;
            this.blinkTimer = 0;
        }, this.blinkDuration);
    }

    /**
     * Get nearby entities within aura range
     * @param {Array} entities - Array of entities to check
     * @returns {Array} Entities within aura range
     */
    getEntitiesInAura(entities) {
        return entities.filter(entity => {
            if (!entity || entity === this) return false;
            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.auraRadius;
        });
    }

    /**
     * Calculate influence on a firefly based on distance
     * @param {Object} firefly - The firefly to check
     * @returns {Object} Influence data { strength, direction, distance }
     */
    getInfluence(firefly) {
        const dx = this.x - firefly.x;
        const dy = this.y - firefly.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.auraRadius) {
            return { strength: 0, direction: { x: 0, y: 0 }, distance };
        }

        // Strength falls off with distance
        const strength = (1 - distance / this.auraRadius) * this.auraStrength;

        // Normalized direction toward god particle
        const direction = {
            x: dx / Math.max(distance, 1),
            y: dy / Math.max(distance, 1)
        };

        return { strength, direction, distance };
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.animationFrameId) return;

        this.lastTime = performance.now();

        const animate = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            this.update(deltaTime);

            if (this.isActive) {
                this.animationFrameId = requestAnimationFrame(animate);
            }
        };

        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * Stop the animation loop
     */
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Destroy the God Particle
     */
    destroy() {
        this.isActive = false;
        this.stop();

        // Fade out then remove
        if (this.element) {
            this.element.style.opacity = '0';
            setTimeout(() => {
                if (this.element && this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            }, 1000);
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GodParticle;
}
