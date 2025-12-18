/**
 * Particles.js - Visual Effects System for Digital Life
 *
 * Handles all particle effects:
 * - Death bursts (when fireflies die)
 * - Collision effects (overflow, quantum, merge)
 * - Shooting star trails
 * - General ambient particles
 */

class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.animationFrameId = null;
        this.isRunning = false;
    }

    /**
     * Initialize and start the particle system
     */
    init() {
        this.injectStyles();
        this.start();
        return this;
    }

    /**
     * Create a death burst effect
     * Enhanced version with variety based on firefly properties
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} digit - The digit of the dying firefly (0 or 1)
     * @param {Object} options - Additional options for variety
     */
    createDeathBurst(x, y, digit, options = {}) {
        const tier = options.tier || { level: 0, color: '#ffffff' };
        const rareType = options.rareType || null;
        const rareColor = options.rareColor || null;
        const desperation = options.desperation || 0;
        const generation = options.generation || 0;

        // Base particle count scales with tier and generation
        let particleCount = 8 + Math.floor(Math.random() * 5);
        particleCount += tier.level * 2;
        particleCount += Math.min(generation, 3);

        // Desperate deaths are more dramatic
        if (desperation > 0.5) {
            particleCount += Math.floor(desperation * 6);
        }

        const oppositeDigit = digit === 1 ? 0 : 1;

        // Determine death style based on properties
        const deathStyle = this.getDeathStyle(digit, tier, rareType, desperation);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.5;
            let speed = 2 + Math.random() * 3;
            let size = 8 + Math.random() * 6;

            // Speed and size vary by tier
            speed *= (1 + tier.level * 0.2);
            size *= (1 + tier.level * 0.15);

            // Desperate deaths explode faster
            if (desperation > 0.5) {
                speed *= (1 + desperation * 0.5);
            }

            // Determine particle text and color
            let showText = i < particleCount / 2 ? digit.toString() : oppositeDigit.toString();
            let particleColor = deathStyle.color;

            // Rare fireflies show their symbol in death
            if (rareType && i % 3 === 0) {
                showText = deathStyle.symbol;
            }

            // Special symbols for higher tiers
            if (tier.level >= 3 && i % 4 === 0) {
                showText = deathStyle.specialSymbol;
            }

            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: showText,
                size: size,
                life: deathStyle.life + Math.random() * 400,
                fadeRate: deathStyle.fadeRate,
                type: 'death-' + deathStyle.name,
                color: particleColor,
                gravity: deathStyle.gravity,
                friction: deathStyle.friction
            });
        }

        // Additional effects for special deaths
        this.createDeathSpecialEffects(x, y, deathStyle, tier, rareType);

        // Central flash
        this.createFlash(x, y, 'death-' + deathStyle.name);
    }

    /**
     * Determine death visual style based on firefly properties
     */
    getDeathStyle(digit, tier, rareType, desperation) {
        // Base style
        let style = {
            name: 'basic',
            color: digit === 1 ? '#ff6b6b' : '#4ecdc4',
            life: 800,
            fadeRate: 0.015,
            gravity: 0.02,
            friction: 0.97,
            symbol: digit.toString(),
            specialSymbol: '*'
        };

        // Tier-based modifications
        if (tier.level >= 1) {
            style.color = tier.color;
            style.name = tier.name?.toLowerCase() || 'charged';
            style.specialSymbol = tier.level >= 3 ? '◇' : '+';
        }

        // Rare type overrides
        if (rareType) {
            switch (rareType) {
                case 'golden':
                    style.name = 'golden';
                    style.color = '#fbbf24';
                    style.symbol = '★';
                    style.specialSymbol = '✦';
                    style.life = 1200;
                    style.gravity = -0.01; // Float upward
                    break;
                case 'diamond':
                    style.name = 'diamond';
                    style.color = '#67e8f9';
                    style.symbol = '◆';
                    style.specialSymbol = '✧';
                    style.life = 1000;
                    style.friction = 0.99; // Slower spread
                    break;
                case 'glitch':
                    style.name = 'glitch';
                    style.color = '#a855f7';
                    style.symbol = '▓';
                    style.specialSymbol = '▒';
                    style.life = 600;
                    style.fadeRate = 0.025; // Faster fade (glitchy)
                    break;
                case 'ancient':
                    style.name = 'ancient';
                    style.color = '#d4d4d8';
                    style.symbol = '✦';
                    style.specialSymbol = '·';
                    style.life = 1500;
                    style.gravity = -0.005;
                    break;
            }
        }

        // Desperation modifications
        if (desperation > 0.7) {
            style.name += '-desperate';
            style.fadeRate *= 0.8; // Slower fade for more dramatic effect
            style.life *= 1.2;
        }

        return style;
    }

    /**
     * Create special effects for unique death types
     */
    createDeathSpecialEffects(x, y, style, tier, rareType) {
        // Golden death: ascending sparkles
        if (rareType === 'golden') {
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    this.createParticle({
                        x: x + (Math.random() - 0.5) * 30,
                        y: y + (Math.random() - 0.5) * 30,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: -1 - Math.random() * 2,
                        text: '✧',
                        size: 6 + Math.random() * 4,
                        life: 1500,
                        fadeRate: 0.01,
                        type: 'golden-ascend',
                        color: '#fcd34d',
                        gravity: -0.02,
                        friction: 0.99
                    });
                }, i * 100);
            }
        }

        // Diamond death: crystalline shatter
        if (rareType === 'diamond') {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                this.createParticle({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * 3,
                    vy: Math.sin(angle) * 3,
                    text: '◇',
                    size: 10,
                    life: 800,
                    fadeRate: 0.02,
                    type: 'diamond-shard',
                    color: '#a5f3fc',
                    friction: 0.95,
                    gravity: 0.03
                });
            }
        }

        // Glitch death: flickering remnants
        if (rareType === 'glitch') {
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    this.createParticle({
                        x: x + (Math.random() - 0.5) * 50,
                        y: y + (Math.random() - 0.5) * 50,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        text: '▓',
                        size: 12,
                        life: 300,
                        fadeRate: 0.05,
                        type: 'glitch-remnant',
                        color: '#c084fc',
                        friction: 0.9
                    });
                }, i * 50);
            }
        }

        // Ancient death: wisdom dispersal
        if (rareType === 'ancient') {
            for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 / 12) * i;
                const dist = 20 + Math.random() * 30;
                setTimeout(() => {
                    this.createParticle({
                        x: x + Math.cos(angle) * dist,
                        y: y + Math.sin(angle) * dist,
                        vx: Math.cos(angle) * 0.3,
                        vy: Math.sin(angle) * 0.3 - 0.5,
                        text: '·',
                        size: 4,
                        life: 2000,
                        fadeRate: 0.008,
                        type: 'wisdom-mote',
                        color: '#f4f4f5',
                        gravity: -0.005,
                        friction: 0.995
                    });
                }, i * 80);
            }
        }

        // Higher tier deaths: ring expansion
        if (tier.level >= 2) {
            for (let ring = 0; ring < tier.level; ring++) {
                setTimeout(() => {
                    for (let i = 0; i < 6; i++) {
                        const angle = (Math.PI * 2 / 6) * i + ring * 0.5;
                        this.createParticle({
                            x: x,
                            y: y,
                            vx: Math.cos(angle) * (2 + ring * 0.5),
                            vy: Math.sin(angle) * (2 + ring * 0.5),
                            text: '○',
                            size: 8 - ring,
                            life: 600,
                            fadeRate: 0.02,
                            type: 'tier-ring',
                            color: tier.color,
                            friction: 0.98,
                            gravity: 0
                        });
                    }
                }, ring * 150);
            }
        }
    }

    /**
     * Create collision effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - 'overflow', 'quantum', or 'merge'
     */
    createCollisionEffect(x, y, type) {
        let particleCount, text, color;

        switch (type) {
            case 'overflow':
                // 1+1=0 - red/orange flash, shows "10" briefly
                particleCount = 6;
                text = ['1', '0', '+', '1', '=', '0'];
                color = '#ff6b6b';
                break;

            case 'quantum':
                // 0+0=1 - cyan/blue flash, shows "01"
                particleCount = 6;
                text = ['0', '0', '+', '0', '=', '1'];
                color = '#4ecdc4';
                break;

            case 'merge':
                // 1+0 - golden flash, energy transfer
                particleCount = 4;
                text = ['+', '+', '+', '+'];
                color = '#ffd93d';
                break;

            default:
                return;
        }

        // Circular burst of particles
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 1.5 + Math.random() * 2;

            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: text[i % text.length],
                size: 10 + Math.random() * 4,
                life: 600 + Math.random() * 300,
                fadeRate: 0.02,
                type: 'collision-' + type,
                color: color
            });
        }

        // Central flash
        this.createFlash(x, y, type);
    }

    /**
     * Create shooting star trail particle
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    createTrailParticle(x, y) {
        this.createParticle({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5 + 0.3, // Slight downward drift
            text: Math.random() > 0.5 ? '1' : '0',
            size: 8 + Math.random() * 4,
            life: 400 + Math.random() * 200,
            fadeRate: 0.03,
            type: 'trail',
            color: null
        });
    }

    /**
     * Create black hole consumption effect
     * Particles spiral toward the black hole
     * @param {number} startX - Firefly X position
     * @param {number} startY - Firefly Y position
     * @param {number} holeX - Black hole X position
     * @param {number} holeY - Black hole Y position
     * @param {number} digit - The consumed digit (0 or 1)
     */
    createConsumptionEffect(startX, startY, holeX, holeY, digit) {
        const particleCount = 6 + Math.floor(Math.random() * 4);
        const color = digit === 1 ? '#ff6b6b' : '#4ecdc4';

        // Direction toward black hole
        const dx = holeX - startX;
        const dy = holeY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dirX = dx / distance;
        const dirY = dy / distance;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const spread = 0.5 + Math.random() * 0.5;

            // Initial outward burst
            const burstVx = Math.cos(angle) * spread;
            const burstVy = Math.sin(angle) * spread;

            // Add pull toward black hole
            const pullStrength = 1 + Math.random() * 2;
            const vx = burstVx + dirX * pullStrength;
            const vy = burstVy + dirY * pullStrength;

            this.createParticle({
                x: startX + (Math.random() - 0.5) * 10,
                y: startY + (Math.random() - 0.5) * 10,
                vx: vx,
                vy: vy,
                text: digit.toString(),
                size: 10 + Math.random() * 6,
                life: 300 + Math.random() * 200,
                fadeRate: 0.04,
                type: 'consumption',
                color: color,
                friction: 0.95,
                gravity: 0
            });
        }

        // Flash at consumption point
        this.createFlash(startX, startY, 'consumption-' + digit);
    }

    /**
     * Create black hole damage effect (when hit by shooting star)
     * @param {number} x - Black hole X position
     * @param {number} y - Black hole Y position
     */
    createBlackHoleDamageEffect(x, y) {
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 3 + Math.random() * 4;

            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: '!',
                size: 12 + Math.random() * 8,
                life: 500 + Math.random() * 300,
                fadeRate: 0.025,
                type: 'damage',
                color: '#ff4444',
                friction: 0.96,
                gravity: 0.02
            });
        }

        // Large damage flash
        this.createFlash(x, y, 'damage');
    }

    /**
     * Create evolution effect when a firefly evolves to a new tier
     * @param {number} x - Firefly X position
     * @param {number} y - Firefly Y position
     * @param {string} newColor - The color of the new tier
     * @param {number} tierLevel - The new tier level
     */
    createEvolutionEffect(x, y, newColor, tierLevel) {
        const particleCount = 10 + tierLevel * 4;
        const symbols = ['*', '+', '^', '!'];

        // Spiral burst of particles
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 2 + Math.random() * 3;

            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: symbols[Math.floor(Math.random() * symbols.length)],
                size: 10 + Math.random() * 8,
                life: 600 + Math.random() * 400,
                fadeRate: 0.02,
                type: 'evolution',
                color: newColor,
                friction: 0.97,
                gravity: -0.01 // Float upward
            });
        }

        // Ring expansion effect
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const speed = 1.5;

            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: '◇',
                size: 14,
                life: 800,
                fadeRate: 0.015,
                type: 'evolution-ring',
                color: newColor,
                friction: 0.99,
                gravity: 0
            });
        }

        // Central flash
        this.createFlash(x, y, 'evolution');
    }

    /**
     * Create planet birth effect (when Ascended sacrifices to black hole)
     * @param {number} x - Birth X position
     * @param {number} y - Birth Y position
     * @param {string} color - Planet type color
     */
    createPlanetBirthEffect(x, y, color) {
        const particleCount = 30;
        const symbols = ['*', '✦', '◇', '○', '+'];

        // Massive spiral burst
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 4 + Math.random() * 5;
            const delay = i * 30;

            setTimeout(() => {
                this.createParticle({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    text: symbols[Math.floor(Math.random() * symbols.length)],
                    size: 12 + Math.random() * 10,
                    life: 1200 + Math.random() * 600,
                    fadeRate: 0.012,
                    type: 'planet-birth',
                    color: color,
                    friction: 0.97,
                    gravity: -0.02
                });
            }, delay);
        }

        // Central explosion rings
        for (let ring = 0; ring < 3; ring++) {
            setTimeout(() => {
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 / 12) * i;
                    const speed = 2 + ring * 1.5;

                    this.createParticle({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        text: '◯',
                        size: 16 - ring * 2,
                        life: 1000,
                        fadeRate: 0.015,
                        type: 'planet-birth-ring',
                        color: color,
                        friction: 0.98,
                        gravity: 0
                    });
                }
            }, ring * 200);
        }

        // Epic central flash
        this.createFlash(x, y, 'planet-birth');
    }

    /**
     * Create planet death effect
     * @param {number} x - Planet X position
     * @param {number} y - Planet Y position
     * @param {string} color - Planet color
     */
    createPlanetDeathEffect(x, y, color) {
        const particleCount = 20;

        // Debris explosion
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;

            this.createParticle({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: ['◇', '△', '○', '□'][Math.floor(Math.random() * 4)],
                size: 8 + Math.random() * 8,
                life: 800 + Math.random() * 400,
                fadeRate: 0.02,
                type: 'planet-death',
                color: color,
                friction: 0.96,
                gravity: 0.03
            });
        }

        // Death flash
        this.createFlash(x, y, 'planet-death');
    }

    /**
     * Create a generic particle
     * @param {Object} options - Particle options
     */
    createParticle(options) {
        const particle = {
            id: 'particle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            x: options.x,
            y: options.y,
            vx: options.vx ?? 0,
            vy: options.vy ?? 0,
            text: options.text ?? '',
            size: options.size ?? 10,
            opacity: 1,
            life: options.life ?? 500,
            maxLife: options.life ?? 500,
            fadeRate: options.fadeRate ?? 0.02,
            type: options.type ?? 'generic',
            color: options.color,
            element: null,
            friction: options.friction ?? 0.98,
            gravity: options.gravity ?? 0
        };

        // Create DOM element
        particle.element = document.createElement('div');
        particle.element.className = 'particle particle-' + particle.type;
        particle.element.textContent = particle.text;
        particle.element.style.cssText = `
            position: absolute;
            left: ${particle.x}px;
            top: ${particle.y}px;
            font-family: 'Courier New', monospace;
            font-size: ${particle.size}px;
            font-weight: bold;
            color: ${particle.color || 'var(--accent, #9f7aea)'};
            text-shadow: 0 0 10px ${particle.color || 'var(--glow-color, rgba(159, 122, 234, 0.8))'};
            pointer-events: none;
            user-select: none;
            opacity: ${particle.opacity};
            z-index: 5;
        `;

        this.container.appendChild(particle.element);
        this.particles.push(particle);

        return particle;
    }

    /**
     * Create a flash effect at position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Effect type for styling
     */
    createFlash(x, y, type) {
        const flash = document.createElement('div');
        flash.className = 'particle-flash flash-' + type;

        let color;
        switch (type) {
            case 'overflow': color = 'rgba(255, 107, 107, 0.8)'; break;
            case 'quantum': color = 'rgba(78, 205, 196, 0.8)'; break;
            case 'merge': color = 'rgba(255, 217, 61, 0.8)'; break;
            case 'consumption-1': color = 'rgba(255, 107, 107, 0.8)'; break;
            case 'consumption-0': color = 'rgba(78, 205, 196, 0.8)'; break;
            case 'damage': color = 'rgba(255, 68, 68, 0.9)'; break;
            case 'evolution': color = 'rgba(255, 255, 255, 0.9)'; break;
            case 'planet-birth': color = 'rgba(255, 255, 255, 1)'; break;
            case 'planet-death': color = 'rgba(255, 100, 100, 0.8)'; break;
            case 'mitosis': color = 'rgba(34, 197, 94, 0.8)'; break;
            case 'spawn': color = 'rgba(159, 122, 234, 0.8)'; break;
            case 'rare': color = 'rgba(251, 191, 36, 0.9)'; break;
            default: color = 'var(--glow-color, rgba(159, 122, 234, 0.8))';
        }

        flash.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 30px;
            height: 30px;
            margin-left: -15px;
            margin-top: -15px;
            border-radius: 50%;
            background: ${color};
            box-shadow: 0 0 20px ${color}, 0 0 40px ${color};
            pointer-events: none;
            opacity: 1;
            z-index: 4;
            animation: flashPulse 0.4s ease-out forwards;
        `;

        this.container.appendChild(flash);

        // Remove after animation
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 400);
    }

    /**
     * Update all particles
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        const toRemove = [];

        for (const particle of this.particles) {
            // Update life
            particle.life -= deltaTime;

            if (particle.life <= 0) {
                toRemove.push(particle);
                continue;
            }

            // Update physics
            particle.vx *= particle.friction;
            particle.vy *= particle.friction;
            particle.vy += particle.gravity;

            particle.x += particle.vx;
            particle.y += particle.vy;

            // Update opacity based on life
            particle.opacity = Math.max(0, particle.life / particle.maxLife);

            // Update DOM
            if (particle.element) {
                particle.element.style.left = particle.x + 'px';
                particle.element.style.top = particle.y + 'px';
                particle.element.style.opacity = particle.opacity;
            }
        }

        // Remove dead particles
        for (const particle of toRemove) {
            this.removeParticle(particle);
        }
    }

    /**
     * Remove a particle
     */
    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }

        if (particle.element && particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
        }
    }

    /**
     * Animation loop
     */
    animate(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = this.lastTime ? currentTime - this.lastTime : 16;
        this.lastTime = currentTime;

        this.update(deltaTime);

        this.animationFrameId = requestAnimationFrame((t) => this.animate(t));
    }

    /**
     * Start the particle system
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = 0;
        this.animationFrameId = requestAnimationFrame((t) => this.animate(t));

        return this;
    }

    /**
     * Stop the particle system
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
     * Clear all particles
     */
    clear() {
        for (const particle of this.particles) {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        }
        this.particles = [];
    }

    /**
     * Clean up everything
     */
    destroy() {
        this.stop();
        this.clear();
        this.container = null;
    }

    /**
     * Get particle count (for debugging)
     */
    getParticleCount() {
        return this.particles.length;
    }

    /**
     * Create binary arithmetic display effect
     * Shows equations like "1+1=10" (binary) when collisions happen
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} digit1 - First operand
     * @param {number} digit2 - Second operand
     */
    createBinaryArithmeticDisplay(x, y, digit1, digit2) {
        const sum = digit1 + digit2;
        let result;
        let color;

        // Binary addition results
        if (sum === 0) {
            result = '0';
            color = '#4ecdc4'; // Cyan for 0+0=0
        } else if (sum === 1) {
            result = '1';
            color = '#ffd93d'; // Gold for 0+1=1 or 1+0=1
        } else {
            result = '10'; // Binary for 2
            color = '#ff6b6b'; // Red for 1+1=10 (overflow!)
        }

        const equation = `${digit1}+${digit2}=${result}`;

        // Create floating equation display
        const display = document.createElement('div');
        display.className = 'binary-arithmetic-display';
        display.textContent = equation;
        display.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            transform: translate(-50%, -50%);
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: bold;
            color: ${color};
            text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
            pointer-events: none;
            user-select: none;
            opacity: 1;
            z-index: 15;
            white-space: nowrap;
            animation: arithmeticFloat 1.5s ease-out forwards;
        `;

        this.container.appendChild(display);

        // Create supporting particles around the equation
        for (let i = 0; i < 4; i++) {
            const angle = (Math.PI * 2 / 4) * i + Math.PI / 4;
            const dist = 25;

            this.createParticle({
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * 0.5,
                vy: Math.sin(angle) * 0.5 - 0.3,
                text: sum === 2 ? '!' : '·',
                size: 8,
                life: 800,
                fadeRate: 0.015,
                type: 'arithmetic',
                color: color,
                friction: 0.98,
                gravity: -0.01
            });
        }

        // Remove display after animation
        setTimeout(() => {
            if (display.parentNode) {
                display.parentNode.removeChild(display);
            }
        }, 1500);
    }

    /**
     * Create connection line between two points (for Web house)
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     * @param {string} color - Line color
     */
    createConnectionLine(x1, y1, x2, y2, color = '#a855f7') {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        const line = document.createElement('div');
        line.className = 'connection-line';
        line.style.cssText = `
            position: absolute;
            left: ${x1}px;
            top: ${y1}px;
            width: ${distance}px;
            height: 1px;
            background: linear-gradient(90deg,
                ${color}00 0%,
                ${color} 20%,
                ${color} 80%,
                ${color}00 100%);
            transform-origin: left center;
            transform: rotate(${angle}deg);
            pointer-events: none;
            opacity: 0.6;
            z-index: 3;
            animation: lineFade 0.5s ease-out forwards;
        `;

        this.container.appendChild(line);

        // Create sparkle at midpoint
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        if (Math.random() < 0.3) {
            this.createParticle({
                x: midX,
                y: midY,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                text: '·',
                size: 4,
                life: 300,
                fadeRate: 0.04,
                type: 'connection',
                color: color
            });
        }

        // Remove line after animation
        setTimeout(() => {
            if (line.parentNode) {
                line.parentNode.removeChild(line);
            }
        }, 500);
    }

    /**
     * Create mitosis flash effect
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Effect type
     */
    createMitosisFlash(x, y) {
        this.createFlash(x, y, 'mitosis');

        // Additional cell-division particles
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;

            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                text: '◎',
                size: 8,
                life: 500,
                fadeRate: 0.025,
                type: 'mitosis',
                color: '#22c55e',
                friction: 0.95
            });
        }
    }

    /**
     * Inject required CSS animations for new effects
     */
    injectStyles() {
        if (document.getElementById('particle-system-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'particle-system-styles';
        styles.textContent = `
            @keyframes arithmeticFloat {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                50% {
                    opacity: 1;
                    transform: translate(-50%, -100%) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -150%) scale(0.8);
                }
            }

            @keyframes lineFade {
                0% { opacity: 0.6; }
                100% { opacity: 0; }
            }

            @keyframes flashPulse {
                0% {
                    transform: scale(0.5);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ParticleSystem;
}
