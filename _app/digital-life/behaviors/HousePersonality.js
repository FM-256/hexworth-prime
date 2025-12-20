/**
 * HousePersonality.js - House-Based Behavioral Modifiers
 *
 * Fireflies can adopt house personalities that affect behavior:
 * - Web (Spider): Network-building, create connections
 * - Shield (Guardian): Protective, cluster around weaker members
 * - Forge (Creator): Build structures, leave lasting trails
 * - Script (Coder): Sequential movement, pattern following
 * - Cloud (Ethereal): Float higher, fade in/out
 * - Dark Arts (Shadow): Stealth mode, avoid others
 */

class HousePersonalitySystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            assignmentChance: config.assignmentChance ?? 0.15, // Chance firefly gets a house
            personalityDuration: config.personalityDuration ?? 30000, // How long personality lasts
            ...config
        };

        // House definitions with behavioral modifiers
        this.houses = {
            web: {
                name: 'Web',
                symbol: '◈',
                color: '#a855f7', // Purple
                description: 'Network builders - create connections',
                modifiers: {
                    cohesionBoost: 2.0,      // Stronger pull to others
                    connectionRadius: 120,    // Draw lines to nearby
                    connectionChance: 0.3,    // Per frame, create visual
                    speedMultiplier: 0.8      // Slower, methodical
                }
            },
            shield: {
                name: 'Shield',
                symbol: '◆',
                color: '#3b82f6', // Blue
                description: 'Guardians - protect the weak',
                modifiers: {
                    protectionRadius: 80,     // Range of protection
                    seekWeakest: true,        // Move toward low-energy fireflies
                    damageReduction: 0.5,     // Take less damage
                    speedMultiplier: 1.1      // Slightly faster to respond
                }
            },
            forge: {
                name: 'Forge',
                symbol: '◇',
                color: '#f97316', // Orange
                description: 'Creators - leave lasting marks',
                modifiers: {
                    trailPersistence: 3.0,    // Trails last longer
                    trailIntensity: 1.5,      // Brighter trails
                    buildChance: 0.01,        // Chance to place "forge mark"
                    speedMultiplier: 0.9
                }
            },
            script: {
                name: 'Script',
                symbol: '▣',
                color: '#22c55e', // Green
                description: 'Coders - sequential patterns',
                modifiers: {
                    patternMovement: true,    // Move in geometric patterns
                    patternTypes: ['zigzag', 'spiral', 'square', 'sine'],
                    patternDuration: 5000,    // How long to follow pattern
                    speedMultiplier: 1.2      // Precise, quick movements
                }
            },
            cloud: {
                name: 'Cloud',
                symbol: '○',
                color: '#38bdf8', // Cyan
                description: 'Ethereal - float and fade',
                modifiers: {
                    verticalBias: -0.3,       // Float upward
                    fadeEnabled: true,        // Periodic fading
                    fadeInterval: 2000,       // Fade in/out cycle
                    gravityResist: 0.5,       // Less affected by black hole
                    speedMultiplier: 0.7      // Dreamy, slow
                }
            },
            darkarts: {
                name: 'Dark Arts',
                symbol: '◉',
                color: '#dc2626', // Red
                description: 'Shadows - stealth and avoidance',
                modifiers: {
                    stealthEnabled: true,     // Periodic invisibility
                    stealthDuration: 3000,    // How long invisible
                    stealthCooldown: 8000,    // Time between stealth
                    avoidanceRadius: 100,     // Stay away from others
                    speedMultiplier: 1.3      // Quick and elusive
                }
            }
        };

        this.ecosystem = null;
        this.particleSystem = null;
        this.activePersonalities = new Map(); // fireflyId -> personality data
        this.forgeMarks = []; // Persistent marks left by Forge house
        this.dominantHouse = null; // If set, this house appears more often
        this.dominantHouseWeight = 0.6; // 60% chance for dominant house
    }

    /**
     * Set a dominant house (typically the user's house)
     * This biases personality assignments toward that house
     * @param {string} houseKey - The house key ('web', 'shield', etc.)
     * @param {number} weight - Weight from 0-1 (default 0.6 = 60% chance)
     */
    setDominantHouse(houseKey, weight = 0.6) {
        if (this.houses[houseKey]) {
            this.dominantHouse = houseKey;
            this.dominantHouseWeight = Math.max(0, Math.min(1, weight));
        }
        return this;
    }

    /**
     * Clear the dominant house (return to random distribution)
     */
    clearDominantHouse() {
        this.dominantHouse = null;
        return this;
    }

    setEcosystem(ecosystem) {
        this.ecosystem = ecosystem;
        return this;
    }

    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
        return this;
    }

    /**
     * Main update
     */
    update(deltaTime) {
        if (!this.config.enabled || !this.ecosystem) return;

        const fireflies = this.ecosystem.fireflies;

        // Assign personalities to new fireflies
        for (const firefly of fireflies) {
            if (firefly.state !== 'mature') continue;

            if (!this.activePersonalities.has(firefly.id)) {
                if (Math.random() < this.config.assignmentChance * 0.01) {
                    this.assignPersonality(firefly);
                }
            }
        }

        // Update active personalities
        this.updatePersonalities(deltaTime, fireflies);

        // Update forge marks
        this.updateForgeMarks(deltaTime);
    }

    /**
     * Assign a house personality to a firefly
     */
    assignPersonality(firefly) {
        const houseKeys = Object.keys(this.houses);
        let houseKey;

        // Use dominant house with weighted probability if set
        if (this.dominantHouse && Math.random() < this.dominantHouseWeight) {
            houseKey = this.dominantHouse;
        } else {
            houseKey = houseKeys[Math.floor(Math.random() * houseKeys.length)];
        }

        const house = this.houses[houseKey];

        const personality = {
            house: houseKey,
            houseDef: house,
            startTime: Date.now(),
            duration: this.config.personalityDuration + Math.random() * 10000,
            patternPhase: 0,
            patternType: null,
            stealthActive: false,
            lastStealth: 0,
            fadePhase: 0
        };

        // Initialize pattern for Script house
        if (houseKey === 'script') {
            personality.patternType = house.modifiers.patternTypes[
                Math.floor(Math.random() * house.modifiers.patternTypes.length)
            ];
            personality.patternStartTime = Date.now();
        }

        this.activePersonalities.set(firefly.id, personality);

        // Mark the firefly
        firefly.house = houseKey;
        firefly.houseSymbol = house.symbol;
        firefly.houseColor = house.color;

        // Create assignment effect
        this.createAssignmentEffect(firefly, house);
    }

    /**
     * Update all active personalities
     */
    updatePersonalities(deltaTime, fireflies) {
        const toRemove = [];

        for (const [fireflyId, personality] of this.activePersonalities) {
            // Find the firefly
            const firefly = fireflies.find(f => f.id === fireflyId);

            if (!firefly || firefly.state !== 'mature') {
                toRemove.push(fireflyId);
                continue;
            }

            // Check duration
            const elapsed = Date.now() - personality.startTime;
            if (elapsed > personality.duration) {
                toRemove.push(fireflyId);
                this.removePersonality(firefly);
                continue;
            }

            // Apply house-specific behavior
            this.applyHouseBehavior(firefly, personality, deltaTime);
        }

        // Clean up expired personalities
        for (const id of toRemove) {
            this.activePersonalities.delete(id);
        }
    }

    /**
     * Apply house-specific behavioral modifiers
     */
    applyHouseBehavior(firefly, personality, deltaTime) {
        const house = personality.houseDef;
        const mod = house.modifiers;

        switch (personality.house) {
            case 'web':
                this.applyWebBehavior(firefly, mod);
                break;
            case 'shield':
                this.applyShieldBehavior(firefly, mod);
                break;
            case 'forge':
                this.applyForgeBehavior(firefly, mod);
                break;
            case 'script':
                this.applyScriptBehavior(firefly, personality, mod);
                break;
            case 'cloud':
                this.applyCloudBehavior(firefly, personality, mod);
                break;
            case 'darkarts':
                this.applyDarkArtsBehavior(firefly, personality, mod);
                break;
        }
    }

    /**
     * Web house - create connections
     */
    applyWebBehavior(firefly, mod) {
        if (!this.particleSystem) return;

        // Find nearby fireflies and draw connections
        if (Math.random() < mod.connectionChance * 0.1) {
            const nearby = this.ecosystem.fireflies.filter(f =>
                f !== firefly && f.state === 'mature' &&
                firefly.distanceTo(f) < mod.connectionRadius
            );

            for (const other of nearby.slice(0, 3)) {
                this.particleSystem.createConnectionLine(
                    firefly.x, firefly.y,
                    other.x, other.y,
                    firefly.houseColor
                );
            }
        }
    }

    /**
     * Shield house - protect weak fireflies
     */
    applyShieldBehavior(firefly, mod) {
        if (!mod.seekWeakest) return;

        // Find weakest nearby firefly
        const nearby = this.ecosystem.fireflies.filter(f =>
            f !== firefly && f.state === 'mature' &&
            firefly.distanceTo(f) < mod.protectionRadius * 2
        );

        if (nearby.length === 0) return;

        // Sort by energy (weakest first)
        nearby.sort((a, b) => a.energy - b.energy);
        const weakest = nearby[0];

        // If weakest has low energy, move toward them
        if (weakest.energy < 50) {
            const dx = weakest.x - firefly.x;
            const dy = weakest.y - firefly.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 30) {
                firefly.applyForce(
                    (dx / dist) * 0.03,
                    (dy / dist) * 0.03
                );
            }

            // Share energy if very close
            if (dist < 40 && firefly.energy > 60) {
                const transfer = 0.1;
                firefly.energy -= transfer;
                weakest.energy = Math.min(100, weakest.energy + transfer * 0.5);
            }
        }
    }

    /**
     * Forge house - leave marks
     */
    applyForgeBehavior(firefly, mod) {
        if (Math.random() > mod.buildChance) return;

        // Create a forge mark
        const mark = {
            x: firefly.x,
            y: firefly.y,
            symbol: '✧',
            color: firefly.houseColor,
            opacity: 0.8,
            createTime: Date.now(),
            lifetime: 15000 * mod.trailPersistence
        };

        this.forgeMarks.push(mark);

        // Create visual effect
        if (this.particleSystem) {
            this.particleSystem.createParticle({
                x: firefly.x,
                y: firefly.y,
                vx: 0,
                vy: -0.5,
                text: '✧',
                size: 12,
                life: 500,
                fadeRate: 0.02,
                type: 'forge',
                color: firefly.houseColor
            });
        }
    }

    /**
     * Script house - pattern movement
     */
    applyScriptBehavior(firefly, personality, mod) {
        const elapsed = Date.now() - personality.patternStartTime;
        const patternProgress = (elapsed % mod.patternDuration) / mod.patternDuration;

        let forceX = 0;
        let forceY = 0;

        switch (personality.patternType) {
            case 'zigzag':
                forceX = patternProgress < 0.5 ? 0.05 : -0.05;
                forceY = Math.sin(patternProgress * Math.PI * 4) * 0.03;
                break;
            case 'spiral':
                const angle = patternProgress * Math.PI * 4;
                const radius = 0.03 + patternProgress * 0.02;
                forceX = Math.cos(angle) * radius;
                forceY = Math.sin(angle) * radius;
                break;
            case 'square':
                const segment = Math.floor(patternProgress * 4);
                switch (segment) {
                    case 0: forceX = 0.04; break;
                    case 1: forceY = 0.04; break;
                    case 2: forceX = -0.04; break;
                    case 3: forceY = -0.04; break;
                }
                break;
            case 'sine':
                forceX = 0.03;
                forceY = Math.sin(patternProgress * Math.PI * 2) * 0.04;
                break;
        }

        firefly.applyForce(forceX, forceY);
    }

    /**
     * Cloud house - ethereal floating
     */
    applyCloudBehavior(firefly, personality, mod) {
        // Upward bias
        firefly.applyForce(0, mod.verticalBias * 0.01);

        // Fading effect
        if (mod.fadeEnabled) {
            personality.fadePhase += 0.02;
            const fadeAmount = (Math.sin(personality.fadePhase) + 1) / 2;
            firefly.cloudOpacity = 0.3 + fadeAmount * 0.7;
        }

        // Gravity resistance (applied in ecosystem)
        firefly.gravityResistBonus = mod.gravityResist;
    }

    /**
     * Dark Arts house - stealth and avoidance
     */
    applyDarkArtsBehavior(firefly, personality, mod) {
        const now = Date.now();

        // Stealth management
        if (mod.stealthEnabled) {
            if (!personality.stealthActive) {
                // Check if we can enter stealth
                if (now - personality.lastStealth > mod.stealthCooldown) {
                    personality.stealthActive = true;
                    personality.stealthStart = now;
                    firefly.stealthMode = true;
                }
            } else {
                // Check if stealth should end
                if (now - personality.stealthStart > mod.stealthDuration) {
                    personality.stealthActive = false;
                    personality.lastStealth = now;
                    firefly.stealthMode = false;
                }
            }
        }

        // Avoidance behavior
        const nearby = this.ecosystem.fireflies.filter(f =>
            f !== firefly && f.state === 'mature' &&
            firefly.distanceTo(f) < mod.avoidanceRadius
        );

        for (const other of nearby) {
            const dx = firefly.x - other.x;
            const dy = firefly.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                firefly.applyForce(
                    (dx / dist) * 0.02,
                    (dy / dist) * 0.02
                );
            }
        }
    }

    /**
     * Update forge marks (fade over time)
     */
    updateForgeMarks(deltaTime) {
        const now = Date.now();
        this.forgeMarks = this.forgeMarks.filter(mark => {
            const age = now - mark.createTime;
            if (age > mark.lifetime) return false;
            mark.opacity = 0.8 * (1 - age / mark.lifetime);
            return true;
        });
    }

    /**
     * Remove personality from firefly
     */
    removePersonality(firefly) {
        firefly.house = null;
        firefly.houseSymbol = null;
        firefly.houseColor = null;
        firefly.stealthMode = false;
        firefly.cloudOpacity = null;
        firefly.gravityResistBonus = 0;
    }

    /**
     * Create visual effect when personality is assigned
     */
    createAssignmentEffect(firefly, house) {
        if (!this.particleSystem) return;

        // Ring of house symbol particles
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const dist = 30;

            this.particleSystem.createParticle({
                x: firefly.x + Math.cos(angle) * dist,
                y: firefly.y + Math.sin(angle) * dist,
                vx: Math.cos(angle) * -1,
                vy: Math.sin(angle) * -1,
                text: house.symbol,
                size: 10,
                life: 800,
                fadeRate: 0.015,
                type: 'house_assign',
                color: house.color
            });
        }
    }

    /**
     * Get forge marks for rendering
     */
    getForgeMarks() {
        return this.forgeMarks;
    }

    /**
     * Get stats
     */
    getStats() {
        const houseCounts = {};
        for (const key of Object.keys(this.houses)) {
            houseCounts[key] = 0;
        }

        for (const [, personality] of this.activePersonalities) {
            houseCounts[personality.house]++;
        }

        return {
            total: this.activePersonalities.size,
            byHouse: houseCounts,
            forgeMarks: this.forgeMarks.length
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HousePersonalitySystem;
}
