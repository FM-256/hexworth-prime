/**
 * Swarming.js - Swarm Intelligence Behavior
 *
 * Implements flocking/swarming:
 * - Separation: Don't crowd neighbors
 * - Alignment: Steer toward average heading
 * - Cohesion: Steer toward center of mass
 * - Swarms can form, move as unit, and disperse
 */

class SwarmingSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            // Boid parameters
            separationRadius: config.separationRadius ?? 25,
            alignmentRadius: config.alignmentRadius ?? 60,
            cohesionRadius: config.cohesionRadius ?? 80,
            separationForce: config.separationForce ?? 0.04,
            alignmentForce: config.alignmentForce ?? 0.02,
            cohesionForce: config.cohesionForce ?? 0.015,
            // Swarm formation
            minSwarmSize: config.minSwarmSize ?? 4,
            swarmFormationChance: config.swarmFormationChance ?? 0.001, // Per frame
            swarmDuration: config.swarmDuration ?? 8000, // How long swarms last
            swarmSpeedBoost: config.swarmSpeedBoost ?? 1.3,
            ...config
        };

        this.ecosystem = null;
        this.activeSwarms = [];
        this.swarmIdCounter = 0;
    }

    setEcosystem(ecosystem) {
        this.ecosystem = ecosystem;
        return this;
    }

    /**
     * Main update loop
     */
    update(deltaTime) {
        if (!this.config.enabled || !this.ecosystem) return;

        const fireflies = this.ecosystem.fireflies;

        // Update existing swarms
        this.updateSwarms(deltaTime);

        // Check for new swarm formation
        if (Math.random() < this.config.swarmFormationChance) {
            this.tryFormSwarm(fireflies);
        }

        // Apply flocking behavior to all mature fireflies
        for (const firefly of fireflies) {
            if (firefly.state !== 'mature') continue;
            this.applyFlockingBehavior(firefly, fireflies);
        }
    }

    /**
     * Apply boid-like flocking behavior
     */
    applyFlockingBehavior(firefly, fireflies) {
        let separationX = 0, separationY = 0, sepCount = 0;
        let alignmentX = 0, alignmentY = 0, aliCount = 0;
        let cohesionX = 0, cohesionY = 0, cohCount = 0;

        for (const other of fireflies) {
            if (other === firefly || other.state !== 'mature') continue;

            const dist = firefly.distanceTo(other);

            // Separation - avoid crowding
            if (dist < this.config.separationRadius && dist > 0) {
                const dx = firefly.x - other.x;
                const dy = firefly.y - other.y;
                separationX += dx / dist;
                separationY += dy / dist;
                sepCount++;
            }

            // Alignment - match velocity (same digit only)
            if (dist < this.config.alignmentRadius && firefly.digit === other.digit) {
                alignmentX += other.vx;
                alignmentY += other.vy;
                aliCount++;
            }

            // Cohesion - move toward center (same digit only)
            if (dist < this.config.cohesionRadius && firefly.digit === other.digit) {
                cohesionX += other.x;
                cohesionY += other.y;
                cohCount++;
            }
        }

        // Apply separation
        if (sepCount > 0) {
            firefly.applyForce(
                (separationX / sepCount) * this.config.separationForce,
                (separationY / sepCount) * this.config.separationForce
            );
        }

        // Apply alignment
        if (aliCount > 0) {
            const avgVx = alignmentX / aliCount;
            const avgVy = alignmentY / aliCount;
            firefly.applyForce(
                (avgVx - firefly.vx) * this.config.alignmentForce,
                (avgVy - firefly.vy) * this.config.alignmentForce
            );
        }

        // Apply cohesion
        if (cohCount > 0) {
            const centerX = cohesionX / cohCount;
            const centerY = cohesionY / cohCount;
            const dx = centerX - firefly.x;
            const dy = centerY - firefly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                firefly.applyForce(
                    (dx / dist) * this.config.cohesionForce,
                    (dy / dist) * this.config.cohesionForce
                );
            }
        }
    }

    /**
     * Try to form a new swarm from nearby fireflies
     */
    tryFormSwarm(fireflies) {
        // Find a random mature firefly as seed
        const matureFireflies = fireflies.filter(f => f.state === 'mature' && !f.swarmId);
        if (matureFireflies.length < this.config.minSwarmSize) return;

        const seed = matureFireflies[Math.floor(Math.random() * matureFireflies.length)];

        // Find nearby same-digit fireflies
        const candidates = matureFireflies.filter(f => {
            if (f === seed || f.digit !== seed.digit) return false;
            return seed.distanceTo(f) < this.config.cohesionRadius * 1.5;
        });

        if (candidates.length >= this.config.minSwarmSize - 1) {
            // Form swarm!
            const swarmMembers = [seed, ...candidates.slice(0, this.config.minSwarmSize - 1)];
            this.createSwarm(swarmMembers);
        }
    }

    /**
     * Create a new swarm
     */
    createSwarm(members) {
        const swarmId = 'swarm_' + (++this.swarmIdCounter);

        const swarm = {
            id: swarmId,
            members: members,
            digit: members[0].digit,
            age: 0,
            maxAge: this.config.swarmDuration,
            mood: 'neutral', // neutral, aggressive, fleeing
            targetX: null,
            targetY: null
        };

        // Mark members
        for (const member of members) {
            member.swarmId = swarmId;
            member.inSwarm = true;
        }

        // Set random target for swarm to move toward
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;
        swarm.targetX = Math.random() * screenWidth;
        swarm.targetY = Math.random() * screenHeight;

        this.activeSwarms.push(swarm);

        return swarm;
    }

    /**
     * Update all active swarms
     */
    updateSwarms(deltaTime) {
        const toRemove = [];

        for (const swarm of this.activeSwarms) {
            swarm.age += deltaTime;

            // Remove dead members
            swarm.members = swarm.members.filter(m =>
                m.state === 'mature' && this.ecosystem.fireflies.includes(m)
            );

            // Swarm disbands if too small or too old
            if (swarm.members.length < this.config.minSwarmSize || swarm.age > swarm.maxAge) {
                toRemove.push(swarm);
                continue;
            }

            // Move swarm toward target
            this.moveSwarm(swarm, deltaTime);

            // Change target occasionally
            if (Math.random() < 0.005) {
                const sw = window.innerWidth || document.documentElement.clientWidth || 800;
                const sh = window.innerHeight || document.documentElement.clientHeight || 600;
                swarm.targetX = Math.random() * sw;
                swarm.targetY = Math.random() * sh;
            }
        }

        // Remove disbanded swarms
        for (const swarm of toRemove) {
            this.disbandSwarm(swarm);
        }
    }

    /**
     * Move swarm toward its target
     */
    moveSwarm(swarm, deltaTime) {
        if (!swarm.targetX || !swarm.targetY) return;

        // Calculate swarm center
        let centerX = 0, centerY = 0;
        for (const member of swarm.members) {
            centerX += member.x;
            centerY += member.y;
        }
        centerX /= swarm.members.length;
        centerY /= swarm.members.length;

        // Direction to target
        const dx = swarm.targetX - centerX;
        const dy = swarm.targetY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 50) {
            // Apply force to all members
            const force = 0.02 * this.config.swarmSpeedBoost;
            for (const member of swarm.members) {
                member.applyForce(
                    (dx / dist) * force,
                    (dy / dist) * force
                );
            }
        } else {
            // Reached target, pick new one
            const sw = window.innerWidth || document.documentElement.clientWidth || 800;
            const sh = window.innerHeight || document.documentElement.clientHeight || 600;
            swarm.targetX = Math.random() * sw;
            swarm.targetY = Math.random() * sh;
        }
    }

    /**
     * Disband a swarm
     */
    disbandSwarm(swarm) {
        // Clear member flags
        for (const member of swarm.members) {
            member.swarmId = null;
            member.inSwarm = false;
        }

        // Remove from active list
        const index = this.activeSwarms.indexOf(swarm);
        if (index > -1) {
            this.activeSwarms.splice(index, 1);
        }
    }

    /**
     * Get swarm stats
     */
    getStats() {
        return {
            activeSwarms: this.activeSwarms.length,
            totalInSwarms: this.activeSwarms.reduce((sum, s) => sum + s.members.length, 0)
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SwarmingSystem;
}
