/**
 * Parasite.js - Energy Draining Entity
 *
 * Small entities that attach to fireflies and drain their energy:
 * - Spawn from entropy or cosmic events
 * - Seek out healthy fireflies
 * - Attach and slowly drain energy
 * - Can be shaken off by rapid movement or collision
 * - Multiple parasites can stack on one host
 *
 * They represent decay and resource competition in the ecosystem.
 */

class Parasite {
    static CONFIG = {
        // Appearance
        symbol: '•',
        attachedSymbol: '∙',
        color: '#78350f',               // Dark amber/brown
        glowColor: 'rgba(120, 53, 15, 0.5)',

        // Size
        size: 6,
        attachedSize: 4,

        // Movement (when seeking)
        seekSpeed: 0.05,
        detectionRadius: 150,
        attachRadius: 15,

        // Draining
        drainRate: 0.08,                // Energy per ms
        drainInterval: 100,             // ms between drain ticks
        maxDrainTotal: 40,              // Max energy to drain before detaching

        // Lifespan
        seekingLifespan: 15000,         // 15 seconds to find host
        attachedLifespan: 30000,        // 30 seconds max attached
        detachCooldown: 3000,           // Can't reattach for 3 seconds

        // Shake off
        shakeSpeedThreshold: 0.08,      // Host speed to shake off
        shakeChance: 0.01,              // Per frame chance when fast
        collisionDetachChance: 0.5,     // Chance to detach on host collision

        // Population
        maxPopulation: 10,
        spawnCooldown: 20000            // 20 seconds between spawns
    };

    constructor(options = {}) {
        // Identity
        this.id = 'parasite_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Position
        this.x = options.x ?? Math.random() * window.innerWidth;
        this.y = options.y ?? Math.random() * window.innerHeight;

        // Movement
        this.vx = (Math.random() - 0.5) * 0.05;
        this.vy = (Math.random() - 0.5) * 0.05;

        // State
        this.state = 'seeking'; // seeking, attaching, attached, detaching, dead
        this.age = 0;
        this.attachedTime = 0;

        // Host tracking
        this.host = null;
        this.hostOffset = { x: 0, y: 0 }; // Position offset on host
        this.totalDrained = 0;

        // Cooldowns
        this.detachCooldownTimer = 0;
        this.drainTimer = 0;

        // Visual
        this.opacity = 0;
        this.targetOpacity = 0.9;
        this.pulsePhase = Math.random() * Math.PI * 2;

        // DOM
        this.element = null;

        // Callbacks
        this.onAttach = null;
        this.onDetach = null;
        this.onDeath = null;
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'parasite';
        this.element.id = this.id;
        this.element.textContent = Parasite.CONFIG.symbol;

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

        const cfg = Parasite.CONFIG;
        const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
        const isAttached = this.state === 'attached';

        this.element.textContent = isAttached ? cfg.attachedSymbol : cfg.symbol;

        this.element.style.cssText = `
            position: absolute;
            left: ${this.x}px;
            top: ${this.y}px;
            font-size: ${(isAttached ? cfg.attachedSize : cfg.size) * pulse}px;
            color: ${cfg.color};
            text-shadow:
                0 0 ${5 * pulse}px ${cfg.glowColor},
                0 0 ${10 * pulse}px ${cfg.glowColor};
            transform: translate(-50%, -50%);
            opacity: ${this.opacity};
            pointer-events: none;
            z-index: ${isAttached ? 14 : 11};
            transition: font-size 0.2s;
        `;

        // Add visual feedback when draining
        if (isAttached && this.drainTimer < 50) {
            this.element.style.filter = 'brightness(1.5)';
        } else {
            this.element.style.filter = 'none';
        }
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp, ecosystem) {
        this.age += deltaTime;
        this.pulsePhase += deltaTime * 0.008;

        // Update cooldowns
        this.detachCooldownTimer = Math.max(0, this.detachCooldownTimer - deltaTime);

        // State machine
        switch (this.state) {
            case 'seeking':
                this.updateSeeking(deltaTime, ecosystem);
                break;
            case 'attaching':
                this.updateAttaching(deltaTime);
                break;
            case 'attached':
                this.updateAttached(deltaTime, ecosystem);
                break;
            case 'detaching':
                this.updateDetaching(deltaTime);
                break;
        }

        this.updateElementStyle();
    }

    /**
     * Seeking state - look for a host
     */
    updateSeeking(deltaTime, ecosystem) {
        const cfg = Parasite.CONFIG;

        // Fade in
        this.opacity = Math.min(this.targetOpacity, this.opacity + deltaTime * 0.002);

        // Check lifespan
        if (this.age >= cfg.seekingLifespan) {
            this.die();
            return;
        }

        // Can't seek during cooldown
        if (this.detachCooldownTimer > 0) {
            this.wander(deltaTime);
            return;
        }

        // Find target
        let target = null;
        let targetDist = Infinity;

        for (const firefly of ecosystem.fireflies) {
            // Only healthy, mature fireflies
            if (firefly.state !== 'mature') continue;
            if (firefly.energy < 30) continue; // Skip low energy
            if (firefly.parasiteCount >= 3) continue; // Max parasites per host

            const dist = this.distanceTo(firefly);
            if (dist < cfg.detectionRadius && dist < targetDist) {
                targetDist = dist;
                target = firefly;
            }
        }

        if (target) {
            // Move toward target
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            this.vx += (dx / dist) * 0.003;
            this.vy += (dy / dist) * 0.003;

            // Check for attach
            if (dist < cfg.attachRadius) {
                this.startAttaching(target);
            }
        } else {
            this.wander(deltaTime);
        }

        // Apply movement
        this.move(deltaTime);
    }

    /**
     * Wander randomly
     */
    wander(deltaTime) {
        // Random direction changes
        if (Math.random() < 0.02) {
            this.vx += (Math.random() - 0.5) * 0.02;
            this.vy += (Math.random() - 0.5) * 0.02;
        }

        this.move(deltaTime);
    }

    /**
     * Apply movement
     */
    move(deltaTime) {
        const cfg = Parasite.CONFIG;

        // Apply velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Damping
        this.vx *= 0.95;
        this.vy *= 0.95;

        // Speed limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > cfg.seekSpeed) {
            this.vx = (this.vx / speed) * cfg.seekSpeed;
            this.vy = (this.vy / speed) * cfg.seekSpeed;
        }

        // Boundary wrapping
        if (this.x < 0) this.x = window.innerWidth;
        if (this.x > window.innerWidth) this.x = 0;
        if (this.y < 0) this.y = window.innerHeight;
        if (this.y > window.innerHeight) this.y = 0;
    }

    /**
     * Start attaching to host
     */
    startAttaching(host) {
        this.state = 'attaching';
        this.host = host;

        // Random offset on host
        const angle = Math.random() * Math.PI * 2;
        const dist = 5 + Math.random() * 5;
        this.hostOffset = {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist
        };

        // Mark host
        host.parasiteCount = (host.parasiteCount || 0) + 1;
    }

    /**
     * Attaching state - brief transition
     */
    updateAttaching(deltaTime) {
        // Quick transition to attached
        this.attachingProgress = (this.attachingProgress || 0) + deltaTime / 300;

        // Move toward host
        if (this.host) {
            const targetX = this.host.x + this.hostOffset.x;
            const targetY = this.host.y + this.hostOffset.y;
            this.x += (targetX - this.x) * 0.2;
            this.y += (targetY - this.y) * 0.2;
        }

        if (this.attachingProgress >= 1) {
            this.state = 'attached';
            this.attachingProgress = 0;
            this.attachedTime = 0;

            if (this.onAttach) {
                this.onAttach(this, this.host);
            }

            console.log(`🦠 Parasite attached to firefly ${this.host?.id}`);
        }
    }

    /**
     * Attached state - drain energy
     */
    updateAttached(deltaTime, ecosystem) {
        const cfg = Parasite.CONFIG;

        if (!this.host || this.host.state === 'dead') {
            this.detach();
            return;
        }

        this.attachedTime += deltaTime;

        // Follow host
        this.x = this.host.x + this.hostOffset.x;
        this.y = this.host.y + this.hostOffset.y;

        // Drain energy
        this.drainTimer += deltaTime;
        if (this.drainTimer >= cfg.drainInterval) {
            const drained = cfg.drainRate * cfg.drainInterval;
            this.host.energy = Math.max(0, this.host.energy - drained);
            this.totalDrained += drained;
            this.drainTimer = 0;
        }

        // Check detach conditions
        this.checkDetachConditions();

        // Check lifespan
        if (this.attachedTime >= cfg.attachedLifespan ||
            this.totalDrained >= cfg.maxDrainTotal) {
            this.detach();
        }
    }

    /**
     * Check if should detach
     */
    checkDetachConditions() {
        const cfg = Parasite.CONFIG;
        if (!this.host) return;

        // Host died
        if (this.host.state === 'dead' || this.host.energy <= 0) {
            this.detach();
            return;
        }

        // Shake off by speed
        const hostSpeed = Math.sqrt(
            (this.host.vx || 0) ** 2 +
            (this.host.vy || 0) ** 2
        );

        if (hostSpeed > cfg.shakeSpeedThreshold) {
            if (Math.random() < cfg.shakeChance) {
                this.detach();
                return;
            }
        }

        // Check if host collided (would be marked by collision system)
        if (this.host.justCollided) {
            if (Math.random() < cfg.collisionDetachChance) {
                this.detach();
            }
        }
    }

    /**
     * Detach from host
     */
    detach() {
        this.state = 'detaching';

        if (this.host) {
            this.host.parasiteCount = Math.max(0, (this.host.parasiteCount || 1) - 1);

            if (this.onDetach) {
                this.onDetach(this, this.host);
            }
        }

        this.host = null;
        this.detachCooldownTimer = Parasite.CONFIG.detachCooldown;
    }

    /**
     * Detaching state - drift away
     */
    updateDetaching(deltaTime) {
        this.detachingProgress = (this.detachingProgress || 0) + deltaTime / 500;

        // Drift in random direction
        this.x += (Math.random() - 0.5) * 2;
        this.y += (Math.random() - 0.5) * 2;

        if (this.detachingProgress >= 1) {
            this.state = 'seeking';
            this.detachingProgress = 0;
            this.age = 0; // Reset age for new seeking phase
            this.totalDrained = 0;
        }
    }

    /**
     * Distance to another entity
     */
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Die
     */
    die() {
        this.state = 'dead';

        // Clean up host reference
        if (this.host) {
            this.host.parasiteCount = Math.max(0, (this.host.parasiteCount || 1) - 1);
        }

        if (this.onDeath) {
            this.onDeath(this);
        }
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('parasite-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'parasite-styles';
        styles.textContent = `
            .parasite {
                will-change: transform, opacity;
                animation: parasitePulse 1s ease-in-out infinite;
            }

            @keyframes parasitePulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.2); }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Get info for debugging
     */
    getInfo() {
        return {
            id: this.id,
            state: this.state,
            hostId: this.host?.id || null,
            drained: Math.round(this.totalDrained),
            age: Math.round(this.age / 1000)
        };
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.host) {
            this.host.parasiteCount = Math.max(0, (this.host.parasiteCount || 1) - 1);
        }

        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.host = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Parasite;
}
