/**
 * Pheromones.js - Chemical Communication Trail System
 *
 * Fireflies leave invisible pheromone trails that influence behavior:
 * - FOOD: Marks energy sources and successful feeding spots
 * - DANGER: Left when fleeing predators or near black holes
 * - MATING: Attracts potential reproduction partners
 * - TRAIL: General pathfinding markers
 * - SWARM: Encourages grouping behavior
 *
 * Uses spatial grid for efficient lookup and decay over time.
 */

class PheromoneSystem {
    // Pheromone types and their properties
    static TYPES = {
        FOOD: {
            name: 'Food Trail',
            color: 'rgba(34, 197, 94, 0.3)',     // Green
            maxStrength: 100,
            decayRate: 0.02,                      // Per second
            spreadRadius: 30,
            attractStrength: 0.003,
            depositRate: 5,                       // Per second when near food
            lifetime: 30000                       // 30 seconds max
        },
        DANGER: {
            name: 'Danger Signal',
            color: 'rgba(239, 68, 68, 0.4)',     // Red
            maxStrength: 150,
            decayRate: 0.05,                      // Decays faster
            spreadRadius: 50,
            repelStrength: 0.008,                 // Stronger repulsion
            depositRate: 20,                      // Deposited quickly when fleeing
            lifetime: 15000                       // 15 seconds - urgent but brief
        },
        MATING: {
            name: 'Mating Call',
            color: 'rgba(236, 72, 153, 0.3)',    // Pink
            maxStrength: 80,
            decayRate: 0.03,
            spreadRadius: 60,
            attractStrength: 0.004,
            depositRate: 3,
            lifetime: 20000,
            requiresMature: true                  // Only mature fireflies deposit
        },
        TRAIL: {
            name: 'Path Marker',
            color: 'rgba(148, 163, 184, 0.2)',   // Gray
            maxStrength: 50,
            decayRate: 0.01,                      // Slow decay
            spreadRadius: 20,
            followStrength: 0.001,                // Subtle guidance
            depositRate: 2,
            lifetime: 60000                       // 1 minute
        },
        SWARM: {
            name: 'Swarm Signal',
            color: 'rgba(251, 191, 36, 0.3)',    // Yellow
            maxStrength: 120,
            decayRate: 0.025,
            spreadRadius: 80,
            attractStrength: 0.005,
            depositRate: 8,
            lifetime: 25000
        }
    };

    constructor(config = {}) {
        this.config = {
            enabled: true,
            gridCellSize: config.gridCellSize ?? 40,
            maxTrailsPerCell: config.maxTrailsPerCell ?? 10,
            updateInterval: config.updateInterval ?? 100,    // ms between updates
            visualize: config.visualize ?? false,            // Debug visualization
            visualizeOpacity: config.visualizeOpacity ?? 0.5,
            ...config
        };

        // Spatial grid for efficient lookup
        this.grid = new Map();
        this.gridWidth = 0;
        this.gridHeight = 0;

        // All active pheromone trails
        this.trails = [];
        this.trailIdCounter = 0;

        // Performance tracking
        this.lastUpdate = 0;
        this.stats = {
            totalDeposited: 0,
            totalDecayed: 0,
            activeTrails: 0,
            peakTrails: 0
        };

        // Visualization elements (if enabled)
        this.visualContainer = null;
        this.visualElements = new Map();
    }

    /**
     * Initialize the system
     */
    init(container, width, height) {
        this.containerElement = container;
        this.resize(width, height);

        if (this.config.visualize) {
            this.createVisualContainer(container);
        }
    }

    /**
     * Resize the grid
     */
    resize(width, height) {
        this.gridWidth = Math.ceil(width / this.config.gridCellSize);
        this.gridHeight = Math.ceil(height / this.config.gridCellSize);

        // Rebuild grid with new dimensions
        this.rebuildGrid();
    }

    /**
     * Rebuild spatial grid
     */
    rebuildGrid() {
        this.grid.clear();

        for (const trail of this.trails) {
            this.addToGrid(trail);
        }
    }

    /**
     * Get grid cell key from position
     */
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.config.gridCellSize);
        const cellY = Math.floor(y / this.config.gridCellSize);
        return `${cellX},${cellY}`;
    }

    /**
     * Add trail to spatial grid
     */
    addToGrid(trail) {
        const key = this.getCellKey(trail.x, trail.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        const cell = this.grid.get(key);
        if (cell.length < this.config.maxTrailsPerCell) {
            cell.push(trail);
        }
    }

    /**
     * Remove trail from spatial grid
     */
    removeFromGrid(trail) {
        const key = this.getCellKey(trail.x, trail.y);
        const cell = this.grid.get(key);
        if (cell) {
            const index = cell.indexOf(trail);
            if (index > -1) {
                cell.splice(index, 1);
            }
        }
    }

    /**
     * Deposit a pheromone trail
     */
    deposit(x, y, type, depositorId, strength = null) {
        if (!this.config.enabled) return null;

        const pheromoneType = PheromoneSystem.TYPES[type];
        if (!pheromoneType) return null;

        // Check if there's already a trail of this type nearby to merge with
        const nearbyTrails = this.getTrailsInRadius(x, y, this.config.gridCellSize);
        const existingTrail = nearbyTrails.find(t =>
            t.type === type &&
            t.depositorId === depositorId &&
            this.getDistance(x, y, t.x, t.y) < 15
        );

        if (existingTrail) {
            // Strengthen existing trail
            existingTrail.strength = Math.min(
                pheromoneType.maxStrength,
                existingTrail.strength + (strength ?? pheromoneType.depositRate)
            );
            existingTrail.lastRefreshed = Date.now();
            return existingTrail;
        }

        // Create new trail
        const trail = {
            id: 'pheromone_' + (++this.trailIdCounter),
            type: type,
            x: x,
            y: y,
            strength: strength ?? pheromoneType.depositRate,
            maxStrength: pheromoneType.maxStrength,
            depositorId: depositorId,
            createdAt: Date.now(),
            lastRefreshed: Date.now(),
            lifetime: pheromoneType.lifetime
        };

        this.trails.push(trail);
        this.addToGrid(trail);
        this.stats.totalDeposited++;
        this.stats.activeTrails = this.trails.length;
        this.stats.peakTrails = Math.max(this.stats.peakTrails, this.trails.length);

        return trail;
    }

    /**
     * Get distance between two points
     */
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get all trails in radius
     */
    getTrailsInRadius(x, y, radius) {
        const results = [];
        const cellRadius = Math.ceil(radius / this.config.gridCellSize);
        const centerCellX = Math.floor(x / this.config.gridCellSize);
        const centerCellY = Math.floor(y / this.config.gridCellSize);

        // Check surrounding cells
        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                const key = `${centerCellX + dx},${centerCellY + dy}`;
                const cell = this.grid.get(key);
                if (cell) {
                    for (const trail of cell) {
                        const dist = this.getDistance(x, y, trail.x, trail.y);
                        if (dist <= radius) {
                            results.push(trail);
                        }
                    }
                }
            }
        }

        return results;
    }

    /**
     * Get trails of specific type in radius
     */
    getTrailsByType(x, y, radius, type) {
        return this.getTrailsInRadius(x, y, radius).filter(t => t.type === type);
    }

    /**
     * Calculate influence on a firefly from nearby pheromones
     */
    calculateInfluence(firefly) {
        if (!this.config.enabled) return { fx: 0, fy: 0, behaviors: {} };

        const result = {
            fx: 0,
            fy: 0,
            behaviors: {
                attractedToFood: false,
                fleeingDanger: false,
                seekingMate: false,
                followingTrail: false,
                joiningSwarm: false
            }
        };

        // Check each pheromone type
        for (const [typeName, pheromoneType] of Object.entries(PheromoneSystem.TYPES)) {
            const nearbyTrails = this.getTrailsByType(
                firefly.x, firefly.y,
                pheromoneType.spreadRadius,
                typeName
            );

            if (nearbyTrails.length === 0) continue;

            // Calculate combined influence from all trails of this type
            let totalForceX = 0;
            let totalForceY = 0;
            let totalWeight = 0;

            for (const trail of nearbyTrails) {
                // Skip own trails for some types
                if (trail.depositorId === firefly.id && typeName !== 'TRAIL') continue;

                const dx = trail.x - firefly.x;
                const dy = trail.y - firefly.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 1) continue;

                // Strength falls off with distance
                const falloff = 1 - (dist / pheromoneType.spreadRadius);
                const weight = (trail.strength / pheromoneType.maxStrength) * falloff;

                let strength;
                let dirX = dx / dist;
                let dirY = dy / dist;

                // Different types have different effects
                switch (typeName) {
                    case 'FOOD':
                        strength = pheromoneType.attractStrength;
                        result.behaviors.attractedToFood = true;
                        break;

                    case 'DANGER':
                        // Repel - move away
                        strength = -pheromoneType.repelStrength;
                        result.behaviors.fleeingDanger = true;
                        break;

                    case 'MATING':
                        // Only mature fireflies respond to mating
                        if (firefly.state !== 'mature') continue;
                        strength = pheromoneType.attractStrength;
                        result.behaviors.seekingMate = true;
                        break;

                    case 'TRAIL':
                        strength = pheromoneType.followStrength;
                        result.behaviors.followingTrail = true;
                        break;

                    case 'SWARM':
                        strength = pheromoneType.attractStrength;
                        result.behaviors.joiningSwarm = true;
                        break;

                    default:
                        strength = 0.001;
                }

                totalForceX += dirX * strength * weight;
                totalForceY += dirY * strength * weight;
                totalWeight += weight;
            }

            if (totalWeight > 0) {
                result.fx += totalForceX;
                result.fy += totalForceY;
            }
        }

        return result;
    }

    /**
     * Update all trails (decay and cleanup)
     */
    update(timestamp) {
        if (!this.config.enabled) return;

        // Throttle updates for performance
        if (timestamp - this.lastUpdate < this.config.updateInterval) return;

        const deltaTime = (timestamp - this.lastUpdate) / 1000; // Convert to seconds
        this.lastUpdate = timestamp;

        const now = Date.now();
        const toRemove = [];

        for (const trail of this.trails) {
            const pheromoneType = PheromoneSystem.TYPES[trail.type];
            if (!pheromoneType) continue;

            // Decay
            trail.strength -= pheromoneType.decayRate * deltaTime * trail.maxStrength;

            // Check expiration
            const age = now - trail.createdAt;
            if (trail.strength <= 0 || age > trail.lifetime) {
                toRemove.push(trail);
            }
        }

        // Remove expired trails
        for (const trail of toRemove) {
            this.removeTrail(trail);
            this.stats.totalDecayed++;
        }

        this.stats.activeTrails = this.trails.length;

        // Update visualization if enabled
        if (this.config.visualize) {
            this.updateVisualization();
        }
    }

    /**
     * Remove a trail
     */
    removeTrail(trail) {
        this.removeFromGrid(trail);
        const index = this.trails.indexOf(trail);
        if (index > -1) {
            this.trails.splice(index, 1);
        }

        if (this.config.visualize) {
            this.removeVisualElement(trail.id);
        }
    }

    /**
     * Process firefly behavior - deposit appropriate pheromones
     */
    processFirefly(firefly, deltaTime, context = {}) {
        if (!this.config.enabled) return;
        if (firefly.state !== 'mature') return;

        const depositInterval = 500; // ms between deposits
        if (!firefly.lastPheromoneDeposit) {
            firefly.lastPheromoneDeposit = 0;
        }

        const now = Date.now();
        if (now - firefly.lastPheromoneDeposit < depositInterval) return;

        firefly.lastPheromoneDeposit = now;

        // Deposit based on current behavior/state
        if (context.nearEnergyWell || context.nearPlanet) {
            // Near food source - leave food trail
            this.deposit(firefly.x, firefly.y, 'FOOD', firefly.id);
        }

        if (context.fleeing || context.nearBlackHole) {
            // In danger - leave danger signal
            this.deposit(firefly.x, firefly.y, 'DANGER', firefly.id);
        }

        if (firefly.readyToReproduce && context.seekingMate) {
            // Looking for mate - leave mating pheromone
            this.deposit(firefly.x, firefly.y, 'MATING', firefly.id);
        }

        if (context.inSwarm) {
            // Part of swarm - leave swarm signal
            this.deposit(firefly.x, firefly.y, 'SWARM', firefly.id);
        }

        // Always leave subtle trail markers
        if (Math.random() < 0.3) { // 30% chance per interval
            this.deposit(firefly.x, firefly.y, 'TRAIL', firefly.id,
                         PheromoneSystem.TYPES.TRAIL.depositRate * 0.5);
        }
    }

    /**
     * Apply pheromone influence to firefly movement
     */
    applyInfluence(firefly) {
        if (!this.config.enabled) return;

        const influence = this.calculateInfluence(firefly);

        // Apply the forces to the firefly
        if (firefly.applyForce) {
            firefly.applyForce(influence.fx, influence.fy);
        }

        // Track behavior flags for debugging/visualization
        firefly.pheromoneInfluence = influence.behaviors;
    }

    // ========== Visualization (Debug) ==========

    /**
     * Create visualization container
     */
    createVisualContainer(container) {
        this.visualContainer = document.createElement('div');
        this.visualContainer.className = 'pheromone-visual-layer';
        this.visualContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
        `;
        container.appendChild(this.visualContainer);
    }

    /**
     * Update visualization
     */
    updateVisualization() {
        if (!this.visualContainer) return;

        for (const trail of this.trails) {
            const pheromoneType = PheromoneSystem.TYPES[trail.type];
            if (!pheromoneType) continue;

            let element = this.visualElements.get(trail.id);

            if (!element) {
                // Create new visual element
                element = document.createElement('div');
                element.className = 'pheromone-visual';
                element.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                `;
                this.visualContainer.appendChild(element);
                this.visualElements.set(trail.id, element);
            }

            // Update element
            const size = pheromoneType.spreadRadius * (trail.strength / trail.maxStrength);
            const opacity = (trail.strength / trail.maxStrength) * this.config.visualizeOpacity;

            element.style.left = (trail.x - size / 2) + 'px';
            element.style.top = (trail.y - size / 2) + 'px';
            element.style.width = size + 'px';
            element.style.height = size + 'px';
            element.style.background = pheromoneType.color;
            element.style.opacity = opacity;
        }
    }

    /**
     * Remove visual element
     */
    removeVisualElement(trailId) {
        const element = this.visualElements.get(trailId);
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
        this.visualElements.delete(trailId);
    }

    /**
     * Toggle visualization
     */
    toggleVisualization(enabled) {
        this.config.visualize = enabled;

        if (enabled && !this.visualContainer && this.containerElement) {
            this.createVisualContainer(this.containerElement);
        } else if (!enabled && this.visualContainer) {
            // Clean up all visual elements
            for (const [id, element] of this.visualElements) {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
            this.visualElements.clear();

            if (this.visualContainer.parentNode) {
                this.visualContainer.parentNode.removeChild(this.visualContainer);
            }
            this.visualContainer = null;
        }
    }

    /**
     * Get statistics
     */
    getStats() {
        const typeCounts = {};
        for (const typeName of Object.keys(PheromoneSystem.TYPES)) {
            typeCounts[typeName] = this.trails.filter(t => t.type === typeName).length;
        }

        return {
            ...this.stats,
            byType: typeCounts,
            gridCells: this.grid.size
        };
    }

    /**
     * Clear all trails
     */
    clear() {
        for (const trail of [...this.trails]) {
            this.removeTrail(trail);
        }
        this.trails = [];
        this.grid.clear();
    }

    /**
     * Destroy the system
     */
    destroy() {
        this.clear();

        if (this.visualContainer && this.visualContainer.parentNode) {
            this.visualContainer.parentNode.removeChild(this.visualContainer);
        }
        this.visualContainer = null;
        this.visualElements.clear();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PheromoneSystem;
}
