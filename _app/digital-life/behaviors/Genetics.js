/**
 * Genetics.js - Firefly Trait Inheritance System
 *
 * Provides genetic inheritance for firefly reproduction:
 * - Inheritable traits (speed, size, glow, lifespan, etc.)
 * - Crossover mechanics from two parents
 * - Mutation system for trait variation
 * - Dominant/recessive trait weighting
 * - Generation tracking and lineage
 *
 * Traits are stored as normalized values (0-1) and applied as multipliers
 * to base stats during firefly initialization.
 */

class GeneticsSystem {
    // All inheritable traits with their properties
    static TRAITS = {
        // Movement traits
        speed: {
            name: 'Speed',
            min: 0.6,           // Slowest possible
            max: 1.5,           // Fastest possible
            default: 1.0,
            mutationRate: 0.15,
            mutationRange: 0.1,
            dominance: 0.5      // Equal inheritance
        },
        agility: {
            name: 'Agility',
            min: 0.7,
            max: 1.4,
            default: 1.0,
            mutationRate: 0.12,
            mutationRange: 0.08,
            dominance: 0.5
        },

        // Physical traits
        size: {
            name: 'Size',
            min: 0.7,
            max: 1.4,
            default: 1.0,
            mutationRate: 0.1,
            mutationRange: 0.1,
            dominance: 0.6      // Slightly dominant (larger)
        },
        glowIntensity: {
            name: 'Glow Intensity',
            min: 0.5,
            max: 1.8,
            default: 1.0,
            mutationRate: 0.2,  // More variable
            mutationRange: 0.15,
            dominance: 0.7      // Bright is dominant
        },
        glowFrequency: {
            name: 'Glow Frequency',
            min: 0.6,
            max: 1.6,
            default: 1.0,
            mutationRate: 0.18,
            mutationRange: 0.12,
            dominance: 0.5
        },

        // Survival traits
        energyEfficiency: {
            name: 'Energy Efficiency',
            min: 0.7,
            max: 1.4,
            default: 1.0,
            mutationRate: 0.1,
            mutationRange: 0.08,
            dominance: 0.65     // Efficient is slightly dominant
        },
        lifespan: {
            name: 'Lifespan',
            min: 0.8,
            max: 1.3,
            default: 1.0,
            mutationRate: 0.08, // More stable
            mutationRange: 0.06,
            dominance: 0.55
        },
        resilience: {
            name: 'Resilience',
            min: 0.7,
            max: 1.5,
            default: 1.0,
            mutationRate: 0.12,
            mutationRange: 0.1,
            dominance: 0.6
        },

        // Social traits
        sociability: {
            name: 'Sociability',
            min: 0.4,
            max: 1.6,
            default: 1.0,
            mutationRate: 0.2,
            mutationRange: 0.15,
            dominance: 0.5
        },
        curiosity: {
            name: 'Curiosity',
            min: 0.5,
            max: 1.5,
            default: 1.0,
            mutationRate: 0.18,
            mutationRange: 0.12,
            dominance: 0.55
        },

        // Reproduction traits
        fertility: {
            name: 'Fertility',
            min: 0.6,
            max: 1.5,
            default: 1.0,
            mutationRate: 0.1,
            mutationRange: 0.1,
            dominance: 0.6
        },
        maturitySpeed: {
            name: 'Maturity Speed',
            min: 0.8,
            max: 1.3,
            default: 1.0,
            mutationRate: 0.08,
            mutationRange: 0.05,
            dominance: 0.5
        }
    };

    // Special genetic markers (boolean traits)
    static MARKERS = {
        ancientBloodline: {
            name: 'Ancient Bloodline',
            inheritChance: 0.3,     // 30% chance to pass on
            effectMultiplier: 1.1   // 10% bonus to all traits
        },
        voidTouched: {
            name: 'Void Touched',
            inheritChance: 0.15,
            effectMultiplier: 0.95  // Slight penalty but unique effects
        },
        starborn: {
            name: 'Starborn',
            inheritChance: 0.25,
            effectMultiplier: 1.05
        },
        cosmicWanderer: {
            name: 'Cosmic Wanderer',
            inheritChance: 0.2,
            effectMultiplier: 1.0   // No stat change, visual only
        }
    };

    constructor(config = {}) {
        this.config = {
            enabled: true,
            baseMutationRate: config.baseMutationRate ?? 0.15,
            environmentalMutation: config.environmentalMutation ?? true,
            trackLineage: config.trackLineage ?? true,
            maxLineageDepth: config.maxLineageDepth ?? 10,
            ...config
        };

        // Statistics tracking
        this.stats = {
            totalBreedings: 0,
            totalMutations: 0,
            markersPassed: 0,
            uniqueLineages: new Set()
        };

        // Lineage tree (for tracking ancestry)
        this.lineageTree = new Map();
    }

    /**
     * Create default genetics for a newly spawned firefly
     */
    createDefaultGenetics() {
        const genetics = {
            traits: {},
            markers: [],
            generation: 0,
            lineageId: this.generateLineageId(),
            parents: null,
            mutationHistory: []
        };

        // Initialize all traits with slight random variation from default
        for (const [traitName, traitDef] of Object.entries(GeneticsSystem.TRAITS)) {
            const variation = (Math.random() - 0.5) * 0.2; // ±10% initial variation
            genetics.traits[traitName] = this.clampTrait(
                traitDef.default + variation,
                traitDef
            );
        }

        return genetics;
    }

    /**
     * Create genetics from shooting star seed (more variation)
     */
    createStarSeedGenetics() {
        const genetics = this.createDefaultGenetics();
        genetics.markers.push('starborn');

        // Star seeds have more extreme traits
        for (const [traitName, traitDef] of Object.entries(GeneticsSystem.TRAITS)) {
            const extremity = Math.random() < 0.5 ? -1 : 1;
            const variation = extremity * (0.1 + Math.random() * 0.2);
            genetics.traits[traitName] = this.clampTrait(
                traitDef.default + variation,
                traitDef
            );
        }

        return genetics;
    }

    /**
     * Breed two fireflies to create offspring genetics
     */
    breed(parent1Genetics, parent2Genetics, environmentalFactors = {}) {
        if (!this.config.enabled) {
            return this.createDefaultGenetics();
        }

        this.stats.totalBreedings++;

        const offspring = {
            traits: {},
            markers: [],
            generation: Math.max(
                parent1Genetics.generation || 0,
                parent2Genetics.generation || 0
            ) + 1,
            lineageId: this.generateLineageId(),
            parents: {
                parent1: parent1Genetics.lineageId,
                parent2: parent2Genetics.lineageId
            },
            mutationHistory: []
        };

        // Inherit each trait
        for (const [traitName, traitDef] of Object.entries(GeneticsSystem.TRAITS)) {
            const parent1Value = parent1Genetics.traits?.[traitName] ?? traitDef.default;
            const parent2Value = parent2Genetics.traits?.[traitName] ?? traitDef.default;

            // Crossover: weighted average based on dominance
            const dominanceRoll = Math.random();
            let inheritedValue;

            if (dominanceRoll < traitDef.dominance) {
                // Dominant inheritance - favor higher value
                inheritedValue = Math.max(parent1Value, parent2Value) * 0.7 +
                                Math.min(parent1Value, parent2Value) * 0.3;
            } else {
                // Regular inheritance - average with slight randomness
                inheritedValue = (parent1Value + parent2Value) / 2 +
                                (Math.random() - 0.5) * 0.1;
            }

            // Apply mutation
            if (Math.random() < this.getMutationRate(traitDef, environmentalFactors)) {
                const mutation = (Math.random() - 0.5) * 2 * traitDef.mutationRange;
                inheritedValue += mutation;
                offspring.mutationHistory.push({
                    trait: traitName,
                    mutation: mutation,
                    generation: offspring.generation
                });
                this.stats.totalMutations++;
            }

            offspring.traits[traitName] = this.clampTrait(inheritedValue, traitDef);
        }

        // Inherit markers
        this.inheritMarkers(offspring, parent1Genetics, parent2Genetics);

        // Track lineage
        if (this.config.trackLineage) {
            this.recordLineage(offspring);
        }

        return offspring;
    }

    /**
     * Get effective mutation rate considering environmental factors
     */
    getMutationRate(traitDef, environmentalFactors) {
        let rate = traitDef.mutationRate * this.config.baseMutationRate;

        if (this.config.environmentalMutation && environmentalFactors) {
            // Near black holes increases mutation
            if (environmentalFactors.nearBlackHole) {
                rate *= 2.0;
            }
            // Near ancient wells increases beneficial mutations
            if (environmentalFactors.nearAncientWell) {
                rate *= 1.3;
            }
            // Cosmic events can spike mutation
            if (environmentalFactors.cosmicEvent) {
                rate *= 1.5;
            }
        }

        return Math.min(rate, 0.5); // Cap at 50%
    }

    /**
     * Inherit genetic markers from parents
     */
    inheritMarkers(offspring, parent1, parent2) {
        const parentMarkers = new Set([
            ...(parent1.markers || []),
            ...(parent2.markers || [])
        ]);

        for (const markerName of parentMarkers) {
            const marker = GeneticsSystem.MARKERS[markerName];
            if (marker && Math.random() < marker.inheritChance) {
                if (!offspring.markers.includes(markerName)) {
                    offspring.markers.push(markerName);
                    this.stats.markersPassed++;
                }
            }
        }
    }

    /**
     * Apply genetics to a firefly's base stats
     */
    applyToFirefly(firefly, genetics) {
        if (!genetics || !genetics.traits) return;

        // Store genetics reference
        firefly.genetics = genetics;

        // Apply trait multipliers
        const traits = genetics.traits;

        // Movement
        if (firefly.baseSpeed !== undefined) {
            firefly.baseSpeed *= traits.speed || 1;
        }
        if (firefly.turnRate !== undefined) {
            firefly.turnRate *= traits.agility || 1;
        }

        // Physical
        if (firefly.baseSize !== undefined) {
            firefly.baseSize *= traits.size || 1;
        }
        if (firefly.glowIntensity !== undefined) {
            firefly.glowIntensity *= traits.glowIntensity || 1;
        }
        if (firefly.pulseSpeed !== undefined) {
            firefly.pulseSpeed *= traits.glowFrequency || 1;
        }

        // Survival
        if (firefly.energyDecayRate !== undefined) {
            // Lower decay = better efficiency
            firefly.energyDecayRate /= traits.energyEfficiency || 1;
        }
        if (firefly.maxLifespan !== undefined) {
            firefly.maxLifespan *= traits.lifespan || 1;
        }

        // Social
        if (firefly.swarmAttraction !== undefined) {
            firefly.swarmAttraction *= traits.sociability || 1;
        }

        // Reproduction
        if (firefly.reproductionCooldown !== undefined) {
            // Lower cooldown = higher fertility
            firefly.reproductionCooldown /= traits.fertility || 1;
        }
        if (firefly.maturationTime !== undefined) {
            firefly.maturationTime /= traits.maturitySpeed || 1;
        }

        // Apply marker effects
        this.applyMarkerEffects(firefly, genetics.markers);
    }

    /**
     * Apply special marker effects
     */
    applyMarkerEffects(firefly, markers) {
        if (!markers || markers.length === 0) return;

        for (const markerName of markers) {
            const marker = GeneticsSystem.MARKERS[markerName];
            if (!marker) continue;

            // Global stat multiplier
            if (marker.effectMultiplier !== 1.0) {
                firefly.baseSpeed *= marker.effectMultiplier;
                firefly.glowIntensity *= marker.effectMultiplier;
            }

            // Marker-specific effects
            switch (markerName) {
                case 'ancientBloodline':
                    firefly.hasAncientBloodline = true;
                    // Slightly longer lifespan
                    if (firefly.maxLifespan) {
                        firefly.maxLifespan *= 1.15;
                    }
                    break;

                case 'voidTouched':
                    firefly.isVoidTouched = true;
                    // Resistant to black hole pull
                    firefly.blackHoleResistance = 0.5;
                    break;

                case 'starborn':
                    firefly.isStarborn = true;
                    // Enhanced glow
                    firefly.glowIntensity *= 1.2;
                    break;

                case 'cosmicWanderer':
                    firefly.isCosmicWanderer = true;
                    // Moves in more interesting patterns
                    firefly.wanderAmplitude = (firefly.wanderAmplitude || 1) * 1.3;
                    break;
            }
        }

        // Track markers on firefly
        firefly.geneticMarkers = markers;
    }

    /**
     * Clamp trait value to valid range
     */
    clampTrait(value, traitDef) {
        return Math.max(traitDef.min, Math.min(traitDef.max, value));
    }

    /**
     * Generate unique lineage identifier
     */
    generateLineageId() {
        return 'lineage_' + Date.now().toString(36) + '_' +
               Math.random().toString(36).substr(2, 6);
    }

    /**
     * Record offspring in lineage tree
     */
    recordLineage(offspring) {
        this.lineageTree.set(offspring.lineageId, {
            parents: offspring.parents,
            generation: offspring.generation,
            markers: offspring.markers,
            timestamp: Date.now()
        });

        this.stats.uniqueLineages.add(offspring.lineageId);

        // Prune old entries if tree gets too large
        if (this.lineageTree.size > 1000) {
            const entries = Array.from(this.lineageTree.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            // Remove oldest 20%
            for (let i = 0; i < 200; i++) {
                this.lineageTree.delete(entries[i][0]);
            }
        }
    }

    /**
     * Get ancestry chain for a lineage
     */
    getAncestry(lineageId, maxDepth = null) {
        const depth = maxDepth ?? this.config.maxLineageDepth;
        const ancestry = [];
        let currentId = lineageId;

        for (let i = 0; i < depth && currentId; i++) {
            const record = this.lineageTree.get(currentId);
            if (!record) break;

            ancestry.push({
                id: currentId,
                generation: record.generation,
                markers: record.markers
            });

            // Follow first parent (could track both, but gets exponential)
            currentId = record.parents?.parent1;
        }

        return ancestry;
    }

    /**
     * Calculate genetic similarity between two fireflies
     */
    calculateSimilarity(genetics1, genetics2) {
        if (!genetics1?.traits || !genetics2?.traits) return 0;

        let totalDiff = 0;
        let traitCount = 0;

        for (const traitName of Object.keys(GeneticsSystem.TRAITS)) {
            const val1 = genetics1.traits[traitName] || 1;
            const val2 = genetics2.traits[traitName] || 1;
            const diff = Math.abs(val1 - val2);
            totalDiff += diff;
            traitCount++;
        }

        // Convert to similarity (0-1)
        const avgDiff = totalDiff / traitCount;
        return Math.max(0, 1 - avgDiff);
    }

    /**
     * Get visual indicator of genetic quality
     */
    getGeneticQuality(genetics) {
        if (!genetics?.traits) return 'unknown';

        let totalBonus = 0;
        let traitCount = 0;

        for (const [traitName, traitDef] of Object.entries(GeneticsSystem.TRAITS)) {
            const value = genetics.traits[traitName] || traitDef.default;
            // How far above default is this trait?
            totalBonus += (value - traitDef.default) / (traitDef.max - traitDef.default);
            traitCount++;
        }

        const avgBonus = totalBonus / traitCount;

        if (avgBonus > 0.3) return 'exceptional';
        if (avgBonus > 0.1) return 'superior';
        if (avgBonus > -0.1) return 'average';
        if (avgBonus > -0.3) return 'weak';
        return 'deficient';
    }

    /**
     * Create a mutation event (for environmental effects)
     */
    mutateFirefly(firefly, mutationType = 'random') {
        if (!firefly.genetics) return;

        const genetics = firefly.genetics;
        const traitNames = Object.keys(GeneticsSystem.TRAITS);
        const traitToMutate = traitNames[Math.floor(Math.random() * traitNames.length)];
        const traitDef = GeneticsSystem.TRAITS[traitToMutate];

        let mutation;
        switch (mutationType) {
            case 'beneficial':
                mutation = Math.abs(Math.random() * traitDef.mutationRange * 2);
                break;
            case 'harmful':
                mutation = -Math.abs(Math.random() * traitDef.mutationRange * 2);
                break;
            case 'extreme':
                mutation = (Math.random() - 0.5) * traitDef.mutationRange * 4;
                break;
            default: // random
                mutation = (Math.random() - 0.5) * traitDef.mutationRange * 2;
        }

        genetics.traits[traitToMutate] = this.clampTrait(
            genetics.traits[traitToMutate] + mutation,
            traitDef
        );

        genetics.mutationHistory.push({
            trait: traitToMutate,
            mutation: mutation,
            type: mutationType,
            generation: genetics.generation,
            timestamp: Date.now()
        });

        // Re-apply genetics to update firefly stats
        this.applyToFirefly(firefly, genetics);

        this.stats.totalMutations++;

        return {
            trait: traitToMutate,
            mutation: mutation,
            newValue: genetics.traits[traitToMutate]
        };
    }

    /**
     * Get statistics about the genetics system
     */
    getStats() {
        return {
            ...this.stats,
            uniqueLineages: this.stats.uniqueLineages.size,
            lineageTreeSize: this.lineageTree.size,
            avgMutationsPerBreeding: this.stats.totalBreedings > 0
                ? this.stats.totalMutations / this.stats.totalBreedings
                : 0
        };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalBreedings: 0,
            totalMutations: 0,
            markersPassed: 0,
            uniqueLineages: new Set()
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeneticsSystem;
}
