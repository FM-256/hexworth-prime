/**
 * PredatorStar.js - Mobile Hunting Entity
 *
 * Unlike the stationary Black Hole, Predator Stars are mobile hunters:
 * - Patrol the ecosystem looking for prey
 * - Can lock onto and chase fireflies
 * - Different hunting behaviors (ambush, pursuit, drift)
 * - Leave wake trails as they move
 * - Can be driven off by large swarms
 *
 * Types:
 * - HUNTER: Active pursuer, fast but predictable
 * - LURKER: Ambush predator, waits then strikes
 * - DRIFTER: Slow but covers large areas
 * - NOVA: Explosive bursts, dangerous but rare
 */

class PredatorStar {
    static TYPES = {
        HUNTER: {
            name: 'Hunter Star',
            color: '#ef4444',               // Red
            glowColor: 'rgba(239, 68, 68, 0.6)',
            symbol: '☆',
            size: 18,
            speed: 0.08,                    // Fast movement
            detectionRadius: 200,
            chaseRadius: 300,
            catchRadius: 25,
            chaseSpeed: 0.15,
            maxPrey: 3,                     // Hunts up to 3 at once
            huntCooldown: 3000,
            satiation: 100,
            satiationDecay: 0.5             // Per second
        },
        LURKER: {
            name: 'Lurker Star',
            color: '#7c3aed',               // Purple
            glowColor: 'rgba(124, 58, 237, 0.5)',
            symbol: '✧',
            size: 15,
            speed: 0.02,                    // Slow patrol
            detectionRadius: 120,
            chaseRadius: 150,
            catchRadius: 30,
            chaseSpeed: 0.25,               // Fast strike
            maxPrey: 1,
            huntCooldown: 5000,
            satiation: 80,
            satiationDecay: 0.3,
            ambushRange: 80                 // Strike distance
        },
        DRIFTER: {
            name: 'Drifter Star',
            color: '#64748b',               // Gray
            glowColor: 'rgba(100, 116, 139, 0.4)',
            symbol: '✦',
            size: 25,
            speed: 0.03,
            detectionRadius: 300,           // Large detection
            chaseRadius: 350,
            catchRadius: 40,                // Large catch zone
            chaseSpeed: 0.06,               // Slow chase
            maxPrey: 5,
            huntCooldown: 2000,
            satiation: 150,
            satiationDecay: 0.8
        },
        NOVA: {
            name: 'Nova Star',
            color: '#f97316',               // Orange
            glowColor: 'rgba(249, 115, 22, 0.7)',
            symbol: '✴',
            size: 20,
            speed: 0.01,                    // Very slow
            detectionRadius: 250,
            chaseRadius: 100,               // Short chase
            catchRadius: 80,                // Huge catch zone
            chaseSpeed: 0.4,                // Explosive burst
            maxPrey: 8,
            huntCooldown: 8000,
            satiation: 60,
            satiationDecay: 1.0,
            burstDuration: 500,
            burstCooldown: 10000
        }
    };

    static STATES = {
        PATROL: 'patrol',
        DETECT: 'detect',
        CHASE: 'chase',
        STRIKE: 'strike',
        FEED: 'feed',
        RETREAT: 'retreat',
        DORMANT: 'dormant'
    };

    constructor(options = {}) {
        // Identity
        this.id = 'predatorstar_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        // Type
        this.typeName = options.type ?? 'HUNTER';
        this.type = PredatorStar.TYPES[this.typeName] || PredatorStar.TYPES.HUNTER;

        // Position and movement
        this.x = options.x ?? Math.random() * (window.innerWidth * 0.8) + window.innerWidth * 0.1;
        this.y = options.y ?? Math.random() * (window.innerHeight * 0.8) + window.innerHeight * 0.1;
        this.vx = 0;
        this.vy = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = this.type.speed;

        // Patrol behavior
        this.patrolTarget = null;
        this.patrolWaitTime = 0;

        // Hunting state
        this.state = PredatorStar.STATES.PATROL;
        this.targets = [];               // Currently tracked prey
        this.primaryTarget = null;       // Main chase target
        this.satiation = this.type.satiation;
        this.huntCooldown = 0;
        this.catchCount = 0;

        // Nova-specific
        if (this.typeName === 'NOVA') {
            this.burstReady = true;
            this.burstCooldownTimer = 0;
            this.isBursting = false;
            this.burstTimer = 0;
        }

        // Visual state
        this.size = this.type.size;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.opacity = 0;
        this.targetOpacity = 0.9;
        this.wakeTrail = [];

        // Life cycle
        this.age = 0;
        this.birthDuration = 1500;
        this.isMature = false;

        // Bounds
        this.bounds = {
            minX: 50,
            maxX: window.innerWidth - 50,
            minY: 50,
            maxY: window.innerHeight - 50
        };

        // DOM
        this.element = null;

        // Callbacks
        this.onCatch = null;
        this.onRetreat = null;
    }

    /**
     * Create DOM element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = 'predator-star';
        this.element.id = this.id;

        // Glow layer
        this.glowElement = document.createElement('div');
        this.glowElement.className = 'predator-star-glow';
        this.element.appendChild(this.glowElement);

        // Core
        this.coreElement = document.createElement('div');
        this.coreElement.className = 'predator-star-core';
        this.coreElement.textContent = this.type.symbol;
        this.element.appendChild(this.coreElement);

        // Detection ring (shows when hunting)
        this.detectionRing = document.createElement('div');
        this.detectionRing.className = 'predator-star-detection';
        this.element.appendChild(this.detectionRing);

        // Wake trail container
        this.wakeContainer = document.createElement('div');
        this.wakeContainer.className = 'predator-star-wake';
        this.element.appendChild(this.wakeContainer);

        this.updateElementStyle();
        container.appendChild(this.element);
        this.injectStyles();

        return this.element;
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('predator-star-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'predator-star-styles';
        styles.textContent = `
            .predator-star {
                position: absolute;
                pointer-events: none;
                z-index: 8;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .predator-star-glow {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle,
                    var(--predator-glow) 0%,
                    transparent 70%
                );
                animation: predatorPulse 1.5s ease-in-out infinite;
            }

            .predator-star-core {
                position: absolute;
                font-family: 'Courier New', monospace;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%,
                    var(--predator-color) 0%,
                    color-mix(in srgb, var(--predator-color) 50%, black) 100%
                );
                box-shadow:
                    0 0 10px var(--predator-glow),
                    0 0 20px var(--predator-glow),
                    inset 0 0 8px rgba(255,255,255,0.3);
                transition: transform 0.2s ease;
            }

            .predator-star.hunting .predator-star-core {
                animation: predatorHunt 0.3s ease-in-out infinite;
            }

            .predator-star.striking .predator-star-core {
                animation: predatorStrike 0.1s ease-in-out;
            }

            .predator-star.bursting .predator-star-core {
                animation: predatorBurst 0.5s ease-out;
            }

            .predator-star-detection {
                position: absolute;
                border-radius: 50%;
                border: 1px dashed var(--predator-color);
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .predator-star.hunting .predator-star-detection {
                opacity: 0.3;
                animation: detectionPulse 2s ease-in-out infinite;
            }

            .predator-star-wake {
                position: absolute;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }

            .wake-particle {
                position: absolute;
                border-radius: 50%;
                background: var(--predator-glow);
                transition: opacity 0.5s ease;
            }

            @keyframes predatorPulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 0.8; }
            }

            @keyframes predatorHunt {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            @keyframes predatorStrike {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }

            @keyframes predatorBurst {
                0% { transform: scale(1); }
                50% { transform: scale(2); opacity: 1; }
                100% { transform: scale(1); opacity: 0.8; }
            }

            @keyframes detectionPulse {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.1); opacity: 0.5; }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Update DOM element styles
     */
    updateElementStyle() {
        if (!this.element) return;

        const displaySize = this.type.detectionRadius * 2;

        // Position (centered on detection radius for the ring)
        this.element.style.left = (this.x - displaySize / 2) + 'px';
        this.element.style.top = (this.y - displaySize / 2) + 'px';
        this.element.style.width = displaySize + 'px';
        this.element.style.height = displaySize + 'px';
        this.element.style.opacity = this.opacity;

        // CSS variables
        this.element.style.setProperty('--predator-color', this.type.color);
        this.element.style.setProperty('--predator-glow', this.type.glowColor);

        // Glow
        const glowSize = this.size * 3;
        this.glowElement.style.width = glowSize + 'px';
        this.glowElement.style.height = glowSize + 'px';
        this.glowElement.style.left = (displaySize / 2 - glowSize / 2) + 'px';
        this.glowElement.style.top = (displaySize / 2 - glowSize / 2) + 'px';

        // Core with pulse
        const pulseFactor = 1 + Math.sin(this.pulsePhase) * 0.1;
        const coreSize = this.size * pulseFactor;
        this.coreElement.style.width = coreSize + 'px';
        this.coreElement.style.height = coreSize + 'px';
        this.coreElement.style.fontSize = (coreSize * 0.6) + 'px';
        this.coreElement.style.color = '#fff';
        this.coreElement.style.left = (displaySize / 2 - coreSize / 2) + 'px';
        this.coreElement.style.top = (displaySize / 2 - coreSize / 2) + 'px';

        // Detection ring
        const ringSize = this.type.detectionRadius * 2;
        this.detectionRing.style.width = ringSize + 'px';
        this.detectionRing.style.height = ringSize + 'px';
        this.detectionRing.style.left = (displaySize / 2 - ringSize / 2) + 'px';
        this.detectionRing.style.top = (displaySize / 2 - ringSize / 2) + 'px';

        // State classes
        this.element.classList.toggle('hunting', this.state === PredatorStar.STATES.CHASE);
        this.element.classList.toggle('striking', this.state === PredatorStar.STATES.STRIKE);
        this.element.classList.toggle('bursting', this.isBursting);
    }

    /**
     * Main update loop
     */
    update(deltaTime, fireflies = []) {
        this.age += deltaTime;

        // Birth animation
        if (!this.isMature) {
            const birthProgress = Math.min(this.age / this.birthDuration, 1);
            this.opacity = birthProgress * this.targetOpacity;
            if (birthProgress >= 1) {
                this.isMature = true;
            }
        }

        // Pulse animation
        this.pulsePhase += 0.004 * deltaTime;

        // Satiation decay
        this.satiation = Math.max(0, this.satiation - this.type.satiationDecay * (deltaTime / 1000));

        // Hunt cooldown
        if (this.huntCooldown > 0) {
            this.huntCooldown -= deltaTime;
        }

        // Nova burst cooldown
        if (this.typeName === 'NOVA') {
            if (!this.burstReady) {
                this.burstCooldownTimer -= deltaTime;
                if (this.burstCooldownTimer <= 0) {
                    this.burstReady = true;
                }
            }
            if (this.isBursting) {
                this.burstTimer -= deltaTime;
                if (this.burstTimer <= 0) {
                    this.isBursting = false;
                }
            }
        }

        // Check if dormant from overfeeding
        if (this.satiation >= this.type.satiation) {
            this.state = PredatorStar.STATES.DORMANT;
            this.speed = this.type.speed * 0.2;
        } else if (this.state === PredatorStar.STATES.DORMANT && this.satiation < this.type.satiation * 0.7) {
            this.state = PredatorStar.STATES.PATROL;
            this.speed = this.type.speed;
        }

        // State machine
        if (this.isMature && this.state !== PredatorStar.STATES.DORMANT) {
            this.updateBehavior(deltaTime, fireflies);
        }

        // Update movement
        this.updateMovement(deltaTime);

        // Update wake trail
        this.updateWakeTrail(deltaTime);

        this.updateElementStyle();
    }

    /**
     * Update hunting behavior
     */
    updateBehavior(deltaTime, fireflies) {
        // Detect nearby fireflies
        this.targets = fireflies.filter(f => {
            if (f.state !== 'mature') return false;
            const dist = this.getDistance(f.x, f.y);
            return dist < this.type.detectionRadius;
        });

        // Check for swarm that might drive us off
        if (this.targets.length > 10) {
            this.state = PredatorStar.STATES.RETREAT;
            this.primaryTarget = null;
            return;
        }

        switch (this.state) {
            case PredatorStar.STATES.PATROL:
                this.updatePatrol(deltaTime);
                if (this.targets.length > 0 && this.huntCooldown <= 0) {
                    this.state = PredatorStar.STATES.DETECT;
                }
                break;

            case PredatorStar.STATES.DETECT:
                // Pick a target
                if (this.targets.length > 0) {
                    // Lurkers wait for close prey
                    if (this.typeName === 'LURKER') {
                        const closeTarget = this.targets.find(f =>
                            this.getDistance(f.x, f.y) < this.type.ambushRange
                        );
                        if (closeTarget) {
                            this.primaryTarget = closeTarget;
                            this.state = PredatorStar.STATES.STRIKE;
                        }
                    } else {
                        // Others chase nearest
                        this.primaryTarget = this.targets.reduce((closest, f) => {
                            const dist = this.getDistance(f.x, f.y);
                            const closestDist = closest ? this.getDistance(closest.x, closest.y) : Infinity;
                            return dist < closestDist ? f : closest;
                        }, null);
                        this.state = PredatorStar.STATES.CHASE;
                    }
                } else {
                    this.state = PredatorStar.STATES.PATROL;
                }
                break;

            case PredatorStar.STATES.CHASE:
                if (!this.primaryTarget || this.primaryTarget.state !== 'mature') {
                    this.primaryTarget = null;
                    this.state = PredatorStar.STATES.PATROL;
                    break;
                }

                const dist = this.getDistance(this.primaryTarget.x, this.primaryTarget.y);

                // Lost the target
                if (dist > this.type.chaseRadius) {
                    this.primaryTarget = null;
                    this.state = PredatorStar.STATES.PATROL;
                    break;
                }

                // Nova burst
                if (this.typeName === 'NOVA' && this.burstReady && dist < 100) {
                    this.triggerBurst();
                }

                // Catch check
                if (dist < this.type.catchRadius) {
                    this.state = PredatorStar.STATES.STRIKE;
                }

                // Chase movement
                this.chaseTarget(this.primaryTarget, deltaTime);
                break;

            case PredatorStar.STATES.STRIKE:
                if (this.primaryTarget && this.primaryTarget.state === 'mature') {
                    const catchDist = this.getDistance(this.primaryTarget.x, this.primaryTarget.y);
                    if (catchDist < this.type.catchRadius) {
                        this.catchPrey(this.primaryTarget);
                    }
                }
                this.state = PredatorStar.STATES.FEED;
                break;

            case PredatorStar.STATES.FEED:
                this.huntCooldown = this.type.huntCooldown;
                this.state = PredatorStar.STATES.PATROL;
                break;

            case PredatorStar.STATES.RETREAT:
                this.retreatFromSwarm(deltaTime);
                if (this.targets.length < 5) {
                    this.state = PredatorStar.STATES.PATROL;
                }
                break;
        }
    }

    /**
     * Patrol behavior
     */
    updatePatrol(deltaTime) {
        // Set new patrol target if needed
        if (!this.patrolTarget || this.patrolWaitTime > 0) {
            this.patrolWaitTime -= deltaTime;
            if (this.patrolWaitTime <= 0) {
                this.patrolTarget = {
                    x: this.bounds.minX + Math.random() * (this.bounds.maxX - this.bounds.minX),
                    y: this.bounds.minY + Math.random() * (this.bounds.maxY - this.bounds.minY)
                };
            }
            return;
        }

        // Move toward patrol target
        const dx = this.patrolTarget.x - this.x;
        const dy = this.patrolTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20) {
            // Reached target, wait before next
            this.patrolWaitTime = 2000 + Math.random() * 3000;
            this.patrolTarget = null;
        } else {
            this.angle = Math.atan2(dy, dx);
            this.vx = Math.cos(this.angle) * this.type.speed;
            this.vy = Math.sin(this.angle) * this.type.speed;
        }
    }

    /**
     * Chase a target
     */
    chaseTarget(target, deltaTime) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.angle = Math.atan2(dy, dx);
            const chaseSpeed = this.isBursting ? this.type.chaseSpeed * 2 : this.type.chaseSpeed;
            this.vx = Math.cos(this.angle) * chaseSpeed;
            this.vy = Math.sin(this.angle) * chaseSpeed;
        }
    }

    /**
     * Retreat from large swarm
     */
    retreatFromSwarm(deltaTime) {
        // Calculate center of swarm
        let centerX = 0, centerY = 0;
        for (const target of this.targets) {
            centerX += target.x;
            centerY += target.y;
        }
        centerX /= this.targets.length;
        centerY /= this.targets.length;

        // Move away from center
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
            this.angle = Math.atan2(dy, dx);
            this.vx = Math.cos(this.angle) * this.type.speed * 1.5;
            this.vy = Math.sin(this.angle) * this.type.speed * 1.5;
        }

        if (this.onRetreat) {
            this.onRetreat(this);
        }
    }

    /**
     * Trigger Nova burst
     */
    triggerBurst() {
        this.isBursting = true;
        this.burstTimer = this.type.burstDuration;
        this.burstReady = false;
        this.burstCooldownTimer = this.type.burstCooldown;
    }

    /**
     * Catch prey
     */
    catchPrey(firefly) {
        this.catchCount++;
        this.satiation += 20;
        this.primaryTarget = null;

        if (this.onCatch) {
            this.onCatch(this, firefly);
        }
    }

    /**
     * Update movement and bounds
     */
    updateMovement(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        // Bounds
        if (this.x < this.bounds.minX) {
            this.x = this.bounds.minX;
            this.vx = Math.abs(this.vx);
        }
        if (this.x > this.bounds.maxX) {
            this.x = this.bounds.maxX;
            this.vx = -Math.abs(this.vx);
        }
        if (this.y < this.bounds.minY) {
            this.y = this.bounds.minY;
            this.vy = Math.abs(this.vy);
        }
        if (this.y > this.bounds.maxY) {
            this.y = this.bounds.maxY;
            this.vy = -Math.abs(this.vy);
        }
    }

    /**
     * Update wake trail (motion blur effect)
     */
    updateWakeTrail(deltaTime) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        // Add new wake particle if moving
        if (speed > 0.02 && this.wakeTrail.length < 8) {
            this.wakeTrail.push({
                x: this.x,
                y: this.y,
                age: 0,
                maxAge: 500
            });
        }

        // Update and remove old particles
        for (let i = this.wakeTrail.length - 1; i >= 0; i--) {
            this.wakeTrail[i].age += deltaTime;
            if (this.wakeTrail[i].age > this.wakeTrail[i].maxAge) {
                this.wakeTrail.splice(i, 1);
            }
        }
    }

    /**
     * Get distance to a point
     */
    getDistance(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if a point is in detection range
     */
    isInDetectionRange(x, y) {
        return this.getDistance(x, y) < this.type.detectionRadius;
    }

    /**
     * Check if a point is in catch range
     */
    isInCatchRange(x, y) {
        return this.getDistance(x, y) < this.type.catchRadius;
    }

    /**
     * Update bounds (when window resizes)
     */
    updateBounds(width, height) {
        this.bounds.maxX = width - 50;
        this.bounds.maxY = height - 50;
    }

    /**
     * Get state info
     */
    getStateInfo() {
        return {
            id: this.id,
            type: this.type.name,
            state: this.state,
            position: { x: Math.round(this.x), y: Math.round(this.y) },
            satiation: Math.round(this.satiation),
            targets: this.targets.length,
            catches: this.catchCount,
            hunting: this.primaryTarget?.id ?? null
        };
    }

    /**
     * Clean up
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.targets = [];
        this.primaryTarget = null;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PredatorStar;
}
