/**
 * VoidSerpent.js - Major Predator Entity
 *
 * A large, snake-like entity that moves through the ecosystem:
 * - Multi-segment body that follows a path
 * - Consumes fireflies on contact
 * - Creates gravitational wake that pulls fireflies toward its path
 * - Can be driven away by concentrated swarms
 * - Rare spawn, dramatic ecosystem event
 *
 * The Void Serpent represents cosmic chaos - a force of nature
 * that sweeps through and reshapes the ecosystem.
 */

class VoidSerpent {
    static CONFIG = {
        // Appearance
        headSymbol: '◆',
        bodySymbol: '◇',
        tailSymbol: '◁',
        headColor: '#dc2626',           // Red
        bodyColor: '#991b1b',           // Dark red
        glowColor: 'rgba(220, 38, 38, 0.6)',

        // Size
        headSize: 24,
        bodySize: 18,
        tailSize: 14,
        segmentCount: 8,                // Total segments including head
        segmentSpacing: 25,             // Distance between segments

        // Movement
        baseSpeed: 0.03,
        turnSpeed: 0.002,
        waveAmplitude: 30,              // Side-to-side wave motion
        waveFrequency: 0.003,

        // Hunting
        detectionRadius: 200,           // Can detect fireflies
        consumeRadius: 20,              // Distance to consume
        wakeRadius: 100,                // Gravitational wake
        wakeStrength: 0.008,

        // Stats
        maxHealth: 100,
        healthDecayRate: 0.005,         // Slowly loses health over time
        healthPerConsume: 15,           // Health gained per firefly

        // Swarm defense
        swarmThreshold: 8,              // Fireflies needed to repel
        swarmRadius: 80,                // Detection radius for swarm
        repelDuration: 5000,            // ms to flee when repelled

        // Spawning
        minLifespan: 30000,             // 30 seconds minimum
        maxLifespan: 90000,             // 90 seconds maximum
        spawnCooldown: 120000           // 2 minutes between spawns
    };

    constructor(options = {}) {
        // Identity
        this.id = 'serpent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Spawn position (edge of screen)
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: // Top
                this.x = Math.random() * window.innerWidth;
                this.y = -50;
                this.angle = Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                break;
            case 1: // Right
                this.x = window.innerWidth + 50;
                this.y = Math.random() * window.innerHeight;
                this.angle = Math.PI + (Math.random() - 0.5) * 0.5;
                break;
            case 2: // Bottom
                this.x = Math.random() * window.innerWidth;
                this.y = window.innerHeight + 50;
                this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
                break;
            case 3: // Left
                this.x = -50;
                this.y = Math.random() * window.innerHeight;
                this.angle = 0 + (Math.random() - 0.5) * 0.5;
                break;
        }

        // Override with options
        this.x = options.x ?? this.x;
        this.y = options.y ?? this.y;
        this.angle = options.angle ?? this.angle;

        // Segments (head is index 0)
        this.segments = [];
        this.initializeSegments();

        // Movement
        this.speed = VoidSerpent.CONFIG.baseSpeed;
        this.targetAngle = this.angle;
        this.wavePhase = 0;

        // State
        this.age = 0;
        this.health = VoidSerpent.CONFIG.maxHealth;
        this.state = 'entering'; // entering, hunting, feeding, fleeing, leaving
        this.lifespan = VoidSerpent.CONFIG.minLifespan +
            Math.random() * (VoidSerpent.CONFIG.maxLifespan - VoidSerpent.CONFIG.minLifespan);

        // Stats
        this.consumedCount = 0;
        this.repelTimer = 0;

        // Visual
        this.opacity = 0;
        this.targetOpacity = 1;

        // Target tracking
        this.targetFirefly = null;

        // DOM
        this.elements = [];

        // Callbacks
        this.onConsume = null;
        this.onDeath = null;
        this.onRepel = null;
    }

    /**
     * Initialize segment positions
     */
    initializeSegments() {
        const cfg = VoidSerpent.CONFIG;

        for (let i = 0; i < cfg.segmentCount; i++) {
            const offsetX = -Math.cos(this.angle) * cfg.segmentSpacing * i;
            const offsetY = -Math.sin(this.angle) * cfg.segmentSpacing * i;

            this.segments.push({
                x: this.x + offsetX,
                y: this.y + offsetY,
                angle: this.angle,
                element: null,
                type: i === 0 ? 'head' : (i === cfg.segmentCount - 1 ? 'tail' : 'body')
            });
        }
    }

    /**
     * Create DOM elements for all segments
     */
    createElement(container) {
        const cfg = VoidSerpent.CONFIG;

        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];

            const el = document.createElement('div');
            el.className = `void-serpent-segment void-serpent-${segment.type}`;
            el.id = this.id + '_seg_' + i;

            // Symbol based on type
            let symbol, size;
            switch (segment.type) {
                case 'head':
                    symbol = cfg.headSymbol;
                    size = cfg.headSize;
                    break;
                case 'tail':
                    symbol = cfg.tailSymbol;
                    size = cfg.tailSize;
                    break;
                default:
                    symbol = cfg.bodySymbol;
                    size = cfg.bodySize - (i * 0.5); // Gradual size decrease
            }

            el.textContent = symbol;
            el.style.cssText = `
                position: absolute;
                font-size: ${size}px;
                color: ${segment.type === 'head' ? cfg.headColor : cfg.bodyColor};
                text-shadow:
                    0 0 10px ${cfg.glowColor},
                    0 0 20px ${cfg.glowColor},
                    0 0 30px ${cfg.glowColor};
                pointer-events: none;
                z-index: 15;
                opacity: 0;
                transform: translate(-50%, -50%);
            `;

            container.appendChild(el);
            segment.element = el;
            this.elements.push(el);
        }

        this.injectStyles();
    }

    /**
     * Update visual positions
     */
    updateElements() {
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            if (!segment.element) continue;

            const pulse = Math.sin(this.wavePhase + i * 0.5) * 0.1 + 1;

            segment.element.style.left = segment.x + 'px';
            segment.element.style.top = segment.y + 'px';
            segment.element.style.opacity = this.opacity;
            segment.element.style.transform = `translate(-50%, -50%) rotate(${segment.angle}rad) scale(${pulse})`;

            // Head gets extra effects
            if (segment.type === 'head' && this.state === 'hunting') {
                segment.element.style.filter = 'brightness(1.3)';
            } else {
                segment.element.style.filter = 'none';
            }
        }
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp, ecosystem) {
        this.age += deltaTime;
        this.wavePhase += deltaTime * VoidSerpent.CONFIG.waveFrequency;

        // Health decay
        this.health -= VoidSerpent.CONFIG.healthDecayRate * deltaTime;

        // State machine
        switch (this.state) {
            case 'entering':
                this.updateEntering(deltaTime);
                break;
            case 'hunting':
                this.updateHunting(deltaTime, ecosystem);
                break;
            case 'feeding':
                this.updateFeeding(deltaTime);
                break;
            case 'fleeing':
                this.updateFleeing(deltaTime);
                break;
            case 'leaving':
                this.updateLeaving(deltaTime);
                break;
        }

        // Check death conditions
        if (this.health <= 0 || this.age >= this.lifespan) {
            this.startLeaving();
        }

        // Update segment positions (snake following)
        this.updateSegments(deltaTime);

        // Apply gravitational wake
        if (this.state !== 'leaving') {
            this.applyWake(ecosystem);
        }

        // Update visuals
        this.updateElements();
    }

    /**
     * Entering state - fade in and move onto screen
     */
    updateEntering(deltaTime) {
        const enterDuration = 2000;
        const progress = Math.min(1, this.age / enterDuration);

        this.opacity = this.targetOpacity * this.easeOutCubic(progress);

        // Move forward
        this.moveForward(deltaTime);

        // Check if fully on screen
        const head = this.segments[0];
        if (progress >= 1 &&
            head.x > 50 && head.x < window.innerWidth - 50 &&
            head.y > 50 && head.y < window.innerHeight - 50) {
            this.state = 'hunting';
            console.log(`🐍 Void Serpent ${this.id} is hunting!`);
        }
    }

    /**
     * Hunting state - seek and consume fireflies
     */
    updateHunting(deltaTime, ecosystem) {
        // Check for swarm defense
        if (this.checkSwarmDefense(ecosystem)) {
            this.startFleeing();
            return;
        }

        // Find target
        if (!this.targetFirefly || this.targetFirefly.state === 'dead') {
            this.targetFirefly = this.findTarget(ecosystem);
        }

        // Move toward target or wander
        if (this.targetFirefly) {
            this.moveTowardTarget(deltaTime);
        } else {
            this.wander(deltaTime);
        }

        // Check for consumption
        this.checkConsumption(ecosystem);

        // Move forward
        this.moveForward(deltaTime);
    }

    /**
     * Feeding state - brief pause after consuming
     */
    updateFeeding(deltaTime) {
        // Brief pause
        this.feedTimer = (this.feedTimer || 500) - deltaTime;

        if (this.feedTimer <= 0) {
            this.state = 'hunting';
            this.feedTimer = 500;
        }
    }

    /**
     * Fleeing state - run from swarm
     */
    updateFleeing(deltaTime) {
        this.repelTimer -= deltaTime;

        // Move away from center (toward edge)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const dx = this.segments[0].x - centerX;
        const dy = this.segments[0].y - centerY;
        const angleAway = Math.atan2(dy, dx);

        this.targetAngle = angleAway;
        this.turnTowardTarget(deltaTime);
        this.moveForward(deltaTime * 1.5); // Faster when fleeing

        if (this.repelTimer <= 0) {
            this.state = 'hunting';
        }
    }

    /**
     * Leaving state - exit the screen
     */
    updateLeaving(deltaTime) {
        // Move toward nearest edge
        const head = this.segments[0];
        let targetX, targetY;

        // Find nearest edge
        const distToLeft = head.x;
        const distToRight = window.innerWidth - head.x;
        const distToTop = head.y;
        const distToBottom = window.innerHeight - head.y;

        const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

        if (minDist === distToLeft) {
            targetX = -100;
            targetY = head.y;
        } else if (minDist === distToRight) {
            targetX = window.innerWidth + 100;
            targetY = head.y;
        } else if (minDist === distToTop) {
            targetX = head.x;
            targetY = -100;
        } else {
            targetX = head.x;
            targetY = window.innerHeight + 100;
        }

        this.targetAngle = Math.atan2(targetY - head.y, targetX - head.x);
        this.turnTowardTarget(deltaTime);
        this.moveForward(deltaTime);

        // Fade out
        this.opacity = Math.max(0, this.opacity - deltaTime * 0.001);

        // Check if off screen
        if (head.x < -150 || head.x > window.innerWidth + 150 ||
            head.y < -150 || head.y > window.innerHeight + 150) {
            this.die();
        }
    }

    /**
     * Find nearest target firefly
     */
    findTarget(ecosystem) {
        const cfg = VoidSerpent.CONFIG;
        const head = this.segments[0];
        let nearest = null;
        let nearestDist = Infinity;

        for (const firefly of ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            const dx = firefly.x - head.x;
            const dy = firefly.y - head.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < cfg.detectionRadius && dist < nearestDist) {
                nearestDist = dist;
                nearest = firefly;
            }
        }

        return nearest;
    }

    /**
     * Move toward current target
     */
    moveTowardTarget(deltaTime) {
        if (!this.targetFirefly) return;

        const head = this.segments[0];
        const dx = this.targetFirefly.x - head.x;
        const dy = this.targetFirefly.y - head.y;

        this.targetAngle = Math.atan2(dy, dx);
        this.turnTowardTarget(deltaTime);
    }

    /**
     * Wander when no target
     */
    wander(deltaTime) {
        // Occasional direction changes
        if (Math.random() < 0.01) {
            this.targetAngle += (Math.random() - 0.5) * 1;
        }

        // Avoid edges
        const head = this.segments[0];
        const margin = 100;

        if (head.x < margin) this.targetAngle = 0;
        if (head.x > window.innerWidth - margin) this.targetAngle = Math.PI;
        if (head.y < margin) this.targetAngle = Math.PI / 2;
        if (head.y > window.innerHeight - margin) this.targetAngle = -Math.PI / 2;

        this.turnTowardTarget(deltaTime);
    }

    /**
     * Turn toward target angle
     */
    turnTowardTarget(deltaTime) {
        const cfg = VoidSerpent.CONFIG;

        // Normalize angle difference
        let diff = this.targetAngle - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        // Turn toward target
        this.angle += Math.sign(diff) * Math.min(Math.abs(diff), cfg.turnSpeed * deltaTime);
    }

    /**
     * Move forward in current direction
     */
    moveForward(deltaTime) {
        const cfg = VoidSerpent.CONFIG;

        // Wave motion
        const waveOffset = Math.sin(this.wavePhase) * cfg.waveAmplitude * 0.01;
        const moveAngle = this.angle + waveOffset;

        // Update head position
        const head = this.segments[0];
        head.x += Math.cos(moveAngle) * this.speed * deltaTime;
        head.y += Math.sin(moveAngle) * this.speed * deltaTime;
        head.angle = moveAngle;
    }

    /**
     * Update segment positions (follow the leader)
     */
    updateSegments(deltaTime) {
        const cfg = VoidSerpent.CONFIG;

        for (let i = 1; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const leader = this.segments[i - 1];

            // Calculate desired position behind leader
            const dx = segment.x - leader.x;
            const dy = segment.y - leader.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > cfg.segmentSpacing) {
                // Move toward leader
                const moveRatio = (dist - cfg.segmentSpacing) / dist;
                segment.x -= dx * moveRatio * 0.3;
                segment.y -= dy * moveRatio * 0.3;
            }

            // Update angle to face leader
            segment.angle = Math.atan2(leader.y - segment.y, leader.x - segment.x);
        }
    }

    /**
     * Check for firefly consumption
     */
    checkConsumption(ecosystem) {
        const cfg = VoidSerpent.CONFIG;
        const head = this.segments[0];

        for (const firefly of ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            const dx = firefly.x - head.x;
            const dy = firefly.y - head.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < cfg.consumeRadius) {
                this.consumeFirefly(firefly);
                return true;
            }
        }

        return false;
    }

    /**
     * Consume a firefly
     */
    consumeFirefly(firefly) {
        // Kill the firefly
        firefly.die();

        // Gain health
        this.health = Math.min(VoidSerpent.CONFIG.maxHealth,
            this.health + VoidSerpent.CONFIG.healthPerConsume);

        this.consumedCount++;
        this.state = 'feeding';
        this.targetFirefly = null;

        // Callback
        if (this.onConsume) {
            this.onConsume(this, firefly);
        }
    }

    /**
     * Check for swarm defense
     */
    checkSwarmDefense(ecosystem) {
        const cfg = VoidSerpent.CONFIG;
        const head = this.segments[0];
        let nearbyCount = 0;

        for (const firefly of ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            const dx = firefly.x - head.x;
            const dy = firefly.y - head.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < cfg.swarmRadius) {
                nearbyCount++;
            }
        }

        return nearbyCount >= cfg.swarmThreshold;
    }

    /**
     * Start fleeing from swarm
     */
    startFleeing() {
        this.state = 'fleeing';
        this.repelTimer = VoidSerpent.CONFIG.repelDuration;

        if (this.onRepel) {
            this.onRepel(this);
        }

        console.log(`🐍 Void Serpent ${this.id} repelled by swarm!`);
    }

    /**
     * Start leaving the screen
     */
    startLeaving() {
        if (this.state === 'leaving') return;

        this.state = 'leaving';
        console.log(`🐍 Void Serpent ${this.id} departing... (consumed ${this.consumedCount} fireflies)`);
    }

    /**
     * Apply gravitational wake to nearby fireflies
     */
    applyWake(ecosystem) {
        const cfg = VoidSerpent.CONFIG;

        for (const firefly of ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            // Check distance to each segment
            for (const segment of this.segments) {
                const dx = segment.x - firefly.x;
                const dy = segment.y - firefly.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < cfg.wakeRadius && dist > cfg.consumeRadius) {
                    // Pull toward segment
                    const strength = cfg.wakeStrength * (1 - dist / cfg.wakeRadius);
                    firefly.applyForce &&
                        firefly.applyForce((dx / dist) * strength, (dy / dist) * strength);
                    break; // Only affect from one segment
                }
            }
        }
    }

    /**
     * Easing function
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Die
     */
    die() {
        if (this.onDeath) {
            this.onDeath(this);
        }
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('void-serpent-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'void-serpent-styles';
        styles.textContent = `
            .void-serpent-segment {
                will-change: transform, opacity;
                transition: filter 0.2s;
            }

            .void-serpent-head {
                animation: serpentHeadPulse 1s ease-in-out infinite;
            }

            .void-serpent-body {
                animation: serpentBodyPulse 1.5s ease-in-out infinite;
            }

            @keyframes serpentHeadPulse {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3) drop-shadow(0 0 10px rgba(220, 38, 38, 0.8)); }
            }

            @keyframes serpentBodyPulse {
                0%, 100% { opacity: 0.9; }
                50% { opacity: 1; }
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
            health: Math.round(this.health),
            consumed: this.consumedCount,
            age: Math.round(this.age / 1000)
        };
    }

    /**
     * Clean up
     */
    destroy() {
        for (const el of this.elements) {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }
        this.elements = [];
        this.segments = [];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoidSerpent;
}
