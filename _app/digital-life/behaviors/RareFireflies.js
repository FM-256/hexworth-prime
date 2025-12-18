/**
 * RareFireflies.js - Rare Variant System
 *
 * Special firefly variants with unique properties:
 * - Golden 1: Attracts other 1s, boosts nearby energy
 * - Diamond 0: Reflects attacks, creates shields
 * - Glitch: Phase through obstacles, random teleports
 * - Ancient: Very old fireflies with wisdom aura
 */

class RareFireflySystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            // Spawn chances (per new firefly)
            goldenChance: config.goldenChance ?? 0.02,     // 2%
            diamondChance: config.diamondChance ?? 0.02,   // 2%
            glitchChance: config.glitchChance ?? 0.01,     // 1%
            ancientAgeThreshold: config.ancientAgeThreshold ?? 60000, // 60 seconds
            ...config
        };

        // Rare type definitions
        this.rareTypes = {
            golden: {
                name: 'Golden',
                symbol: '★',
                color: '#fbbf24',
                glow: '#fcd34d',
                digitRequired: 1,
                effects: {
                    attractRadius: 150,
                    energyBoostRadius: 80,
                    energyBoostAmount: 0.05,
                    speedBoost: 1.2,
                    sizeMultiplier: 1.4,
                    trailGlow: true
                }
            },
            diamond: {
                name: 'Diamond',
                symbol: '◆',
                color: '#67e8f9',
                glow: '#a5f3fc',
                digitRequired: 0,
                effects: {
                    shieldRadius: 60,
                    reflectChance: 0.3,
                    damageReduction: 0.7,
                    sizeMultiplier: 1.3,
                    sparkleEffect: true
                }
            },
            glitch: {
                name: 'Glitch',
                symbol: '▓',
                color: '#a855f7',
                glow: '#c084fc',
                digitRequired: null, // Either digit
                effects: {
                    teleportChance: 0.003,
                    teleportRadius: 200,
                    phaseThrough: true,
                    visualGlitch: true,
                    sizeMultiplier: 1.0
                }
            },
            ancient: {
                name: 'Ancient',
                symbol: '✦',
                color: '#d4d4d8',
                glow: '#f4f4f5',
                digitRequired: null,
                effects: {
                    wisdomRadius: 120,
                    evolveBoost: 2.0,      // Others evolve faster near
                    energyShareRadius: 100,
                    sizeMultiplier: 1.5,
                    slowMovement: 0.6
                }
            }
        };

        this.ecosystem = null;
        this.particleSystem = null;
        this.rareFireflies = new Map(); // fireflyId -> rare type data
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

        // Check for new rare fireflies
        this.checkNewFireflies();

        // Check for ancient transformation
        this.checkAncientTransformation();

        // Update rare firefly effects
        this.updateRareEffects(deltaTime);
    }

    /**
     * Check new fireflies for rare status
     */
    checkNewFireflies() {
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.rareChecked) continue;
            firefly.rareChecked = true;

            // Skip if already rare
            if (this.rareFireflies.has(firefly.id)) continue;

            // Roll for rare types
            if (firefly.digit === 1 && Math.random() < this.config.goldenChance) {
                this.makeRare(firefly, 'golden');
            } else if (firefly.digit === 0 && Math.random() < this.config.diamondChance) {
                this.makeRare(firefly, 'diamond');
            } else if (Math.random() < this.config.glitchChance) {
                this.makeRare(firefly, 'glitch');
            }
        }
    }

    /**
     * Check for fireflies old enough to become Ancient
     */
    checkAncientTransformation() {
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;
            if (this.rareFireflies.has(firefly.id)) continue;

            if (firefly.age >= this.config.ancientAgeThreshold) {
                // Small chance to become ancient
                if (Math.random() < 0.001) {
                    this.makeRare(firefly, 'ancient');
                }
            }
        }
    }

    /**
     * Transform firefly into rare variant
     */
    makeRare(firefly, rareType) {
        const typeDef = this.rareTypes[rareType];

        const rareData = {
            type: rareType,
            typeDef: typeDef,
            createdAt: Date.now(),
            glitchOffset: { x: 0, y: 0 },
            sparklePhase: 0,
            lastTeleport: 0
        };

        this.rareFireflies.set(firefly.id, rareData);

        // Apply visual changes
        firefly.rareType = rareType;
        firefly.rareSymbol = typeDef.symbol;
        firefly.rareColor = typeDef.color;
        firefly.rareGlow = typeDef.glow;
        firefly.sizeMultiplier = typeDef.effects.sizeMultiplier ?? 1;

        // Create transformation effect
        this.createTransformationEffect(firefly, typeDef);

        return rareData;
    }

    /**
     * Update all rare firefly effects
     */
    updateRareEffects(deltaTime) {
        const toRemove = [];

        for (const [fireflyId, rareData] of this.rareFireflies) {
            const firefly = this.ecosystem.fireflies.find(f => f.id === fireflyId);

            if (!firefly || firefly.state !== 'mature') {
                toRemove.push(fireflyId);
                continue;
            }

            // Apply type-specific effects
            switch (rareData.type) {
                case 'golden':
                    this.updateGoldenEffects(firefly, rareData.typeDef.effects);
                    break;
                case 'diamond':
                    this.updateDiamondEffects(firefly, rareData, rareData.typeDef.effects);
                    break;
                case 'glitch':
                    this.updateGlitchEffects(firefly, rareData, rareData.typeDef.effects);
                    break;
                case 'ancient':
                    this.updateAncientEffects(firefly, rareData.typeDef.effects);
                    break;
            }
        }

        // Clean up dead rare fireflies
        for (const id of toRemove) {
            this.rareFireflies.delete(id);
        }
    }

    /**
     * Golden 1 effects - attract and boost energy
     */
    updateGoldenEffects(firefly, effects) {
        const nearby = this.ecosystem.fireflies.filter(f =>
            f !== firefly &&
            f.state === 'mature' &&
            f.digit === 1 &&
            firefly.distanceTo(f) < effects.attractRadius
        );

        // Attract other 1s
        for (const other of nearby) {
            const dx = firefly.x - other.x;
            const dy = firefly.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 30) {
                other.applyForce(
                    (dx / dist) * 0.01,
                    (dy / dist) * 0.01
                );
            }

            // Energy boost if close enough
            if (dist < effects.energyBoostRadius) {
                other.energy = Math.min(100, other.energy + effects.energyBoostAmount);
            }
        }

        // Trail glow particles
        if (effects.trailGlow && this.particleSystem && Math.random() < 0.1) {
            this.particleSystem.createParticle({
                x: firefly.x + (Math.random() - 0.5) * 10,
                y: firefly.y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.5,
                text: '✧',
                size: 6,
                life: 400,
                fadeRate: 0.03,
                type: 'golden_trail',
                color: '#fbbf24'
            });
        }
    }

    /**
     * Diamond 0 effects - shield and sparkle
     */
    updateDiamondEffects(firefly, rareData, effects) {
        // Apply damage reduction
        firefly.damageReduction = effects.damageReduction;

        // Sparkle effect
        if (effects.sparkleEffect) {
            rareData.sparklePhase += 0.1;
            firefly.sparkleIntensity = (Math.sin(rareData.sparklePhase) + 1) / 2;

            // Occasional sparkle particle
            if (this.particleSystem && Math.random() < 0.05) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 15 + Math.random() * 10;

                this.particleSystem.createParticle({
                    x: firefly.x + Math.cos(angle) * dist,
                    y: firefly.y + Math.sin(angle) * dist,
                    vx: Math.cos(angle) * 0.5,
                    vy: Math.sin(angle) * 0.5,
                    text: '✦',
                    size: 5,
                    life: 300,
                    fadeRate: 0.04,
                    type: 'diamond_sparkle',
                    color: '#67e8f9'
                });
            }
        }

        // Shield effect for nearby 0s
        const nearby = this.ecosystem.fireflies.filter(f =>
            f !== firefly &&
            f.state === 'mature' &&
            f.digit === 0 &&
            firefly.distanceTo(f) < effects.shieldRadius
        );

        for (const other of nearby) {
            other.diamondShielded = true;
            other.shieldAmount = effects.damageReduction * 0.5;
        }
    }

    /**
     * Glitch effects - teleport and visual glitch
     */
    updateGlitchEffects(firefly, rareData, effects) {
        const now = Date.now();

        // Random teleport
        if (effects.teleportChance && Math.random() < effects.teleportChance) {
            if (now - rareData.lastTeleport > 2000) { // Min 2s between teleports
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * effects.teleportRadius;

                const newX = firefly.x + Math.cos(angle) * dist;
                const newY = firefly.y + Math.sin(angle) * dist;

                // Keep in bounds
                const sw = window.innerWidth || document.documentElement.clientWidth || 800;
                const sh = window.innerHeight || document.documentElement.clientHeight || 600;
                firefly.x = Math.max(50, Math.min(sw - 50, newX));
                firefly.y = Math.max(50, Math.min(sh - 50, newY));

                rareData.lastTeleport = now;

                // Teleport effect
                this.createTeleportEffect(firefly);
            }
        }

        // Visual glitch offset
        if (effects.visualGlitch) {
            rareData.glitchOffset.x = (Math.random() - 0.5) * 4;
            rareData.glitchOffset.y = (Math.random() - 0.5) * 4;
            firefly.glitchOffset = rareData.glitchOffset;
        }

        // Phase through - reduced gravity
        if (effects.phaseThrough) {
            firefly.gravityResistBonus = (firefly.gravityResistBonus ?? 0) + 0.3;
        }
    }

    /**
     * Ancient effects - wisdom and energy sharing
     */
    updateAncientEffects(firefly, effects) {
        // Slow movement
        if (effects.slowMovement) {
            firefly.vx *= effects.slowMovement;
            firefly.vy *= effects.slowMovement;
        }

        // Wisdom aura - boost evolution for nearby fireflies
        const nearby = this.ecosystem.fireflies.filter(f =>
            f !== firefly &&
            f.state === 'mature' &&
            firefly.distanceTo(f) < effects.wisdomRadius
        );

        for (const other of nearby) {
            // Boost their collision progress
            other.wisdomBoost = effects.evolveBoost;

            // Energy sharing
            if (firefly.distanceTo(other) < effects.energyShareRadius) {
                if (firefly.energy > 50 && other.energy < 50) {
                    const transfer = 0.02;
                    firefly.energy -= transfer;
                    other.energy = Math.min(100, other.energy + transfer);
                }
            }
        }

        // Wisdom particles
        if (this.particleSystem && Math.random() < 0.02) {
            const angle = Math.random() * Math.PI * 2;
            const dist = effects.wisdomRadius * Math.random();

            this.particleSystem.createParticle({
                x: firefly.x + Math.cos(angle) * dist,
                y: firefly.y + Math.sin(angle) * dist,
                vx: 0,
                vy: -0.3,
                text: '·',
                size: 4,
                life: 1500,
                fadeRate: 0.01,
                type: 'wisdom',
                color: '#d4d4d8'
            });
        }
    }

    /**
     * Create transformation effect
     */
    createTransformationEffect(firefly, typeDef) {
        if (!this.particleSystem) return;

        // Burst of particles
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            const speed = 2 + Math.random();

            this.particleSystem.createParticle({
                x: firefly.x,
                y: firefly.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                text: typeDef.symbol,
                size: 8,
                life: 800,
                fadeRate: 0.015,
                type: 'rare_transform',
                color: typeDef.color,
                friction: 0.95
            });
        }

        // Flash
        this.particleSystem.createFlash(firefly.x, firefly.y, 'rare');
    }

    /**
     * Create teleport effect for glitch fireflies
     */
    createTeleportEffect(firefly) {
        if (!this.particleSystem) return;

        // Glitch particles at destination
        for (let i = 0; i < 6; i++) {
            this.particleSystem.createParticle({
                x: firefly.x + (Math.random() - 0.5) * 30,
                y: firefly.y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                text: '▓',
                size: 10,
                life: 400,
                fadeRate: 0.03,
                type: 'glitch_teleport',
                color: '#a855f7'
            });
        }
    }

    /**
     * Get stats
     */
    getStats() {
        const counts = {
            golden: 0,
            diamond: 0,
            glitch: 0,
            ancient: 0
        };

        for (const [, data] of this.rareFireflies) {
            counts[data.type]++;
        }

        return {
            total: this.rareFireflies.size,
            byCtype: counts
        };
    }

    /**
     * Force spawn a rare firefly (for testing)
     */
    forceSpawnRare(type = 'golden') {
        if (!this.ecosystem) {
            console.warn('RareFireflySystem: No ecosystem connected');
            return null;
        }

        if (!this.rareTypes[type]) {
            console.warn(`RareFireflySystem: Unknown type "${type}"`);
            return null;
        }

        const typeDef = this.rareTypes[type];
        const digit = typeDef.digitRequired ?? Math.round(Math.random());
        const sw = window.innerWidth || document.documentElement.clientWidth || 800;
        const sh = window.innerHeight || document.documentElement.clientHeight || 600;

        const firefly = this.ecosystem.spawnFirefly({
            x: Math.random() * sw * 0.8 + sw * 0.1,
            y: Math.random() * sh * 0.8 + sh * 0.1,
            digit: digit
        });

        if (firefly) {
            // Skip the rareChecked flag so makeRare works
            firefly.rareChecked = true;
            this.makeRare(firefly, type);
            console.log(`✨ Spawned ${typeDef.name} (${typeDef.symbol}) rare firefly:`, firefly.id);
        } else {
            console.warn('RareFireflySystem: Failed to spawn firefly (population limit?)');
        }

        return firefly;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RareFireflySystem;
}
