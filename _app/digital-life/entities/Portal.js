/**
 * Portal.js - Warp Portal Entity
 *
 * Creates two-way teleportation portals for fireflies:
 * - Portals come in pairs (entry and exit)
 * - Fireflies entering one portal exit from its linked partner
 * - Visual swirl effect with particles
 * - Can be used by player or spawned by cosmic events
 *
 * Creates interesting movement patterns and escape routes.
 */

class Portal {
    static CONFIG = {
        // Appearance
        symbol: '◎',
        colors: {
            primary: '#9f7aea',      // Purple
            secondary: '#38bdf8',    // Cyan
            glow: 'rgba(159, 122, 234, 0.6)'
        },

        // Size
        radius: 40,
        captureRadius: 30,          // Distance to trigger teleport

        // Behavior
        cooldownPerFirefly: 2000,   // 2 second cooldown per firefly
        pullStrength: 0.08,         // Gentle pull toward portal
        pullRadius: 100,            // Pull range

        // Lifespan
        defaultDuration: 30000,     // 30 seconds
        fadeTime: 2000,             // 2 second fade out

        // Effects
        particleCount: 8,
        rotationSpeed: 0.002
    };

    /**
     * Create a portal pair
     * @param {Object} options - Configuration
     * @returns {Object} { portalA, portalB } - Linked portal pair
     */
    static createPair(options = {}) {
        const portalA = new Portal({
            x: options.x1 ?? window.innerWidth * 0.3,
            y: options.y1 ?? window.innerHeight * 0.5,
            color: options.colorA ?? Portal.CONFIG.colors.primary,
            duration: options.duration ?? Portal.CONFIG.defaultDuration
        });

        const portalB = new Portal({
            x: options.x2 ?? window.innerWidth * 0.7,
            y: options.y2 ?? window.innerHeight * 0.5,
            color: options.colorB ?? Portal.CONFIG.colors.secondary,
            duration: options.duration ?? Portal.CONFIG.defaultDuration
        });

        // Link portals
        portalA.linkedPortal = portalB;
        portalB.linkedPortal = portalA;

        portalA.pairId = 'pair_' + Date.now();
        portalB.pairId = portalA.pairId;

        return { portalA, portalB };
    }

    constructor(options = {}) {
        // Identity
        this.id = 'portal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        this.pairId = null;

        // Position
        this.x = options.x ?? window.innerWidth / 2;
        this.y = options.y ?? window.innerHeight / 2;

        // Appearance
        this.color = options.color ?? Portal.CONFIG.colors.primary;
        this.radius = options.radius ?? Portal.CONFIG.radius;

        // State
        this.state = 'spawning'; // spawning, active, fading, dead
        this.age = 0;
        this.duration = options.duration ?? Portal.CONFIG.defaultDuration;
        this.rotation = Math.random() * Math.PI * 2;

        // Link
        this.linkedPortal = null;

        // Cooldowns per firefly
        this.fireflyCooldowns = new Map();

        // Visual
        this.opacity = 0;
        this.scale = 0.5;
        this.particles = [];

        // DOM
        this.element = null;
        this.particleContainer = null;

        // Callbacks
        this.onTeleport = null;
        this.onDeath = null;

        // Initialize particles
        this.initParticles();
    }

    /**
     * Initialize swirling particles
     */
    initParticles() {
        const cfg = Portal.CONFIG;
        for (let i = 0; i < cfg.particleCount; i++) {
            this.particles.push({
                angle: (Math.PI * 2 / cfg.particleCount) * i,
                distance: this.radius * 0.6,
                size: 3 + Math.random() * 3,
                speed: 0.8 + Math.random() * 0.4
            });
        }
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'portal';
        this.element.id = this.id;

        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'portal-particles';

        // Create particle elements
        for (let i = 0; i < this.particles.length; i++) {
            const particleEl = document.createElement('div');
            particleEl.className = 'portal-particle';
            this.particleContainer.appendChild(particleEl);
        }

        this.element.appendChild(this.particleContainer);
        this.updateElementStyle();
        container.appendChild(this.element);

        this.injectStyles();

        return this.element;
    }

    /**
     * Update visual style
     */
    updateElementStyle() {
        if (!this.element) return;

        const cfg = Portal.CONFIG;

        this.element.style.cssText = `
            position: absolute;
            left: ${this.x}px;
            top: ${this.y}px;
            width: ${this.radius * 2 * this.scale}px;
            height: ${this.radius * 2 * this.scale}px;
            transform: translate(-50%, -50%) rotate(${this.rotation}rad);
            border-radius: 50%;
            border: 3px solid ${this.color};
            background: radial-gradient(circle,
                ${this.color}20 0%,
                ${this.color}40 40%,
                transparent 70%
            );
            box-shadow:
                0 0 20px ${this.color}80,
                0 0 40px ${this.color}40,
                inset 0 0 30px ${this.color}60;
            opacity: ${this.opacity};
            pointer-events: none;
            z-index: 12;
        `;

        // Update particles
        this.updateParticles();
    }

    /**
     * Update particle positions
     */
    updateParticles() {
        if (!this.particleContainer) return;

        const particles = this.particleContainer.children;
        for (let i = 0; i < this.particles.length && i < particles.length; i++) {
            const p = this.particles[i];
            const el = particles[i];

            const px = Math.cos(p.angle) * p.distance;
            const py = Math.sin(p.angle) * p.distance;

            el.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: ${p.size}px;
                height: ${p.size}px;
                background: ${this.color};
                border-radius: 50%;
                transform: translate(${px}px, ${py}px) translate(-50%, -50%);
                box-shadow: 0 0 ${p.size * 2}px ${this.color};
            `;
        }
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp, ecosystem) {
        this.age += deltaTime;

        // State machine
        switch (this.state) {
            case 'spawning':
                this.updateSpawning(deltaTime);
                break;
            case 'active':
                this.updateActive(deltaTime, ecosystem);
                break;
            case 'fading':
                this.updateFading(deltaTime);
                break;
        }

        // Rotate particles
        this.rotation += Portal.CONFIG.rotationSpeed * deltaTime;
        for (const p of this.particles) {
            p.angle += p.speed * 0.01 * deltaTime;
        }

        // Update cooldowns
        for (const [fireflyId, cooldown] of this.fireflyCooldowns.entries()) {
            if (cooldown <= 0) {
                this.fireflyCooldowns.delete(fireflyId);
            } else {
                this.fireflyCooldowns.set(fireflyId, cooldown - deltaTime);
            }
        }

        this.updateElementStyle();
    }

    /**
     * Spawning state - fade in
     */
    updateSpawning(deltaTime) {
        this.opacity = Math.min(1, this.opacity + deltaTime * 0.003);
        this.scale = Math.min(1, this.scale + deltaTime * 0.002);

        if (this.opacity >= 1 && this.scale >= 1) {
            this.state = 'active';
        }
    }

    /**
     * Active state - process teleportation
     */
    updateActive(deltaTime, ecosystem) {
        const cfg = Portal.CONFIG;

        // Check duration
        if (this.age >= this.duration) {
            this.state = 'fading';
            return;
        }

        if (!ecosystem || !this.linkedPortal) return;

        // Apply pull to nearby fireflies
        for (const firefly of ecosystem.fireflies) {
            const dx = this.x - firefly.x;
            const dy = this.y - firefly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Pull toward portal
            if (dist < cfg.pullRadius && dist > cfg.captureRadius) {
                const force = cfg.pullStrength * (1 - dist / cfg.pullRadius);
                firefly.vx += (dx / dist) * force;
                firefly.vy += (dy / dist) * force;
            }

            // Teleport if in capture radius
            if (dist < cfg.captureRadius) {
                this.teleportFirefly(firefly);
            }
        }
    }

    /**
     * Teleport a firefly to the linked portal
     */
    teleportFirefly(firefly) {
        if (!this.linkedPortal) return false;

        // Check cooldown
        if (this.fireflyCooldowns.has(firefly.id)) return false;

        // Set cooldown on both portals
        this.fireflyCooldowns.set(firefly.id, Portal.CONFIG.cooldownPerFirefly);
        this.linkedPortal.fireflyCooldowns.set(firefly.id, Portal.CONFIG.cooldownPerFirefly);

        // Calculate exit position (slightly offset from portal center)
        const exitAngle = Math.random() * Math.PI * 2;
        const exitDist = Portal.CONFIG.captureRadius * 1.5;

        const oldX = firefly.x;
        const oldY = firefly.y;

        // Teleport!
        firefly.x = this.linkedPortal.x + Math.cos(exitAngle) * exitDist;
        firefly.y = this.linkedPortal.y + Math.sin(exitAngle) * exitDist;

        // Preserve momentum direction but add some outward push
        const speed = Math.sqrt(firefly.vx * firefly.vx + firefly.vy * firefly.vy);
        firefly.vx = Math.cos(exitAngle) * (speed + 0.05);
        firefly.vy = Math.sin(exitAngle) * (speed + 0.05);

        // Visual feedback
        this.createTeleportEffect(oldX, oldY);
        this.linkedPortal.createTeleportEffect(firefly.x, firefly.y);

        // Callback
        if (this.onTeleport) {
            this.onTeleport(this, firefly, this.linkedPortal);
        }

        console.log(`🌀 Firefly ${firefly.id} teleported through portal`);

        return true;
    }

    /**
     * Create teleport visual effect
     */
    createTeleportEffect(x, y) {
        if (!this.element?.parentNode) return;

        const effect = document.createElement('div');
        effect.className = 'portal-teleport-effect';
        effect.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 30px;
            height: 30px;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: radial-gradient(circle, ${this.color} 0%, transparent 70%);
            animation: portalFlash 0.4s ease-out forwards;
            pointer-events: none;
            z-index: 25;
        `;
        this.element.parentNode.appendChild(effect);

        setTimeout(() => effect.remove(), 400);
    }

    /**
     * Fading state - fade out
     */
    updateFading(deltaTime) {
        this.opacity = Math.max(0, this.opacity - deltaTime / Portal.CONFIG.fadeTime);
        this.scale = Math.max(0.3, this.scale - deltaTime * 0.0005);

        if (this.opacity <= 0) {
            this.state = 'dead';
            if (this.onDeath) {
                this.onDeath(this);
            }
        }
    }

    /**
     * Force close the portal
     */
    close() {
        this.state = 'fading';
    }

    /**
     * Get info for debugging
     */
    getInfo() {
        return {
            id: this.id,
            pairId: this.pairId,
            state: this.state,
            linkedTo: this.linkedPortal?.id || null,
            position: { x: Math.round(this.x), y: Math.round(this.y) },
            age: Math.round(this.age / 1000),
            remainingTime: Math.round((this.duration - this.age) / 1000)
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('portal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'portal-styles';
        styles.textContent = `
            .portal {
                will-change: transform, opacity;
            }

            .portal-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                animation: portalSpin 4s linear infinite;
            }

            @keyframes portalSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes portalFlash {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }

            .portal-teleport-effect {
                will-change: transform, opacity;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Clean up
     */
    destroy() {
        // Also destroy linked portal if it exists
        if (this.linkedPortal && this.linkedPortal.state !== 'dead') {
            this.linkedPortal.linkedPortal = null; // Unlink to prevent recursion
            this.linkedPortal.destroy();
        }

        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.linkedPortal = null;
        this.fireflyCooldowns.clear();
    }
}

/**
 * PortalManager - Manages all portal pairs
 */
class PortalManager {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,
            maxPairs: config.maxPairs ?? 3,
            ...config
        };

        this.portals = [];
        this.container = null;
        this.ecosystem = null;

        // Stats
        this.stats = {
            portalsCreated: 0,
            teleportations: 0
        };
    }

    /**
     * Initialize
     */
    init(container, ecosystem) {
        this.container = container;
        this.ecosystem = ecosystem;
        return this;
    }

    /**
     * Create a portal pair
     */
    createPortalPair(options = {}) {
        if (!this.config.enabled) return null;

        // Check max pairs
        const activePairs = this.getActivePairCount();
        if (activePairs >= this.config.maxPairs) {
            console.warn('Maximum portal pairs reached');
            return null;
        }

        const { portalA, portalB } = Portal.createPair(options);

        // Set up callbacks
        portalA.onTeleport = (portal, firefly) => this.stats.teleportations++;
        portalB.onTeleport = (portal, firefly) => this.stats.teleportations++;

        portalA.onDeath = (portal) => this.removePortal(portal);
        portalB.onDeath = (portal) => this.removePortal(portal);

        // Create DOM elements
        if (this.container) {
            portalA.createElement(this.container);
            portalB.createElement(this.container);
        }

        this.portals.push(portalA, portalB);
        this.stats.portalsCreated += 2;

        console.log(`🌀 Portal pair created`);

        return { portalA, portalB };
    }

    /**
     * Get count of active portal pairs
     */
    getActivePairCount() {
        const pairIds = new Set();
        for (const portal of this.portals) {
            if (portal.state !== 'dead' && portal.pairId) {
                pairIds.add(portal.pairId);
            }
        }
        return pairIds.size;
    }

    /**
     * Remove a portal
     */
    removePortal(portal) {
        const index = this.portals.indexOf(portal);
        if (index !== -1) {
            this.portals.splice(index, 1);
        }
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp) {
        for (let i = this.portals.length - 1; i >= 0; i--) {
            const portal = this.portals[i];

            if (portal.state === 'dead') {
                portal.destroy();
                this.portals.splice(i, 1);
                continue;
            }

            portal.update(deltaTime, timestamp, this.ecosystem);
        }
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            ...this.stats,
            activePortals: this.portals.filter(p => p.state !== 'dead').length,
            activePairs: this.getActivePairCount()
        };
    }

    /**
     * Clean up
     */
    destroy() {
        for (const portal of this.portals) {
            portal.destroy();
        }
        this.portals = [];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Portal, PortalManager };
}
