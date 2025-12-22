/**
 * Digital Life - Main Entry Point
 * Version: 3.8.0 (8-Phase Expansion Complete)
 *
 * A complete binary firefly ecosystem simulation featuring emergent behaviors,
 * cosmic events, predator/prey dynamics, player tools, and immersive audio.
 *
 * ============================================================================
 * PHASE OVERVIEW:
 * ============================================================================
 * Phase 1: Visual Polish     - Trails, death particles, planet visuals
 * Phase 2: Ecosystem Depth   - Energy wells, genetics, pheromones, predator stars
 * Phase 3: Cosmic Events     - Solar flare, meteor shower, void storm, eclipse, nebula
 * Phase 4: Planet Expansion  - Moons, volcanoes, lifecycle, collapse mechanics
 * Phase 5: Predator Variety  - Shadow fireflies, void serpent, parasites
 * Phase 6: Player Tools      - 5 tools, portals, sanctuaries
 * Phase 7: Meta Systems      - Achievements, statistics HUD, event log
 * Phase 8: Audio             - Procedural sounds, ambient atmosphere
 *
 * ============================================================================
 * USAGE:
 * ============================================================================
 * Basic:
 *   const digitalLife = new DigitalLife();
 *   digitalLife.init(document.body);
 *
 * With configuration:
 *   const digitalLife = new DigitalLife({
 *       population: { initial: 25, min: 15, max: 40 },
 *       shootingStars: { minInterval: 10000 },
 *       audio: { enabled: true }  // Enable procedural audio
 *   });
 *   digitalLife.init(containerElement);
 *
 * Debug controls:
 *   digitalLife.createDebugControls();  // Or press 'D' if using test page
 *
 * ============================================================================
 * KEY METHODS:
 * ============================================================================
 * init(container)           - Initialize and start the ecosystem
 * pause() / resume()        - Control simulation state
 * toggleDebugControls()     - Show/hide debug panel
 * triggerShootingStar()     - Force spawn a shooting star
 * forceCosmicEvent(type)    - Trigger specific cosmic event
 * spawnRare(type)           - Spawn rare firefly variant
 * toggleAudio()             - Enable/disable audio system
 * getStats()                - Get current ecosystem statistics
 * destroy()                 - Clean up all resources
 *
 * ============================================================================
 * FILE DEPENDENCIES (load order matters):
 * ============================================================================
 * Core:        Firefly.js, Ecosystem.js
 * Effects:     Particles.js, ShootingStar.js, AmbientEffects.js, Trails.js
 * Entities:    BlackHole.js, Planet.js, Moon.js, EnergyWell.js, PredatorStar.js,
 *              ShadowFirefly.js, VoidSerpent.js, Parasite.js, Portal.js, Sanctuary.js
 * Behaviors:   Hunting.js, Swarming.js, Constellation.js, Reproduction.js,
 *              HousePersonality.js, RareFireflies.js, InteractionSystem.js,
 *              EnvironmentalSystem.js, Genetics.js, Pheromones.js, PredatorManager.js
 * Events:      CosmicEventManager.js, SolarFlare.js, MeteorShower.js,
 *              VoidStorm.js, Eclipse.js, NebulaDrift.js
 * Interactions: PlayerTools.js
 * Meta:        Achievements.js, Statistics.js, EventLog.js
 * Audio:       SoundManager.js, EventSounds.js, AmbientLayer.js
 *
 * @author Hexworth Prime Team
 * @version 3.8.0
 */

class DigitalLife {
    /**
     * Create Digital Life system
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.config = {
            // Population settings
            population: {
                initial: 20,
                min: 10,
                max: 50,
                ...config.population
            },

            // Collision settings
            collision: {
                radius: 25,
                showBinaryArithmetic: true, // Show 1+1=10 etc
                ...config.collision
            },

            // Shooting star settings
            shootingStars: {
                enabled: true,
                minInterval: 8000,
                maxInterval: 15000,
                ...config.shootingStars
            },

            // Mouse interaction (legacy - now uses InteractionSystem)
            mouse: {
                enabled: true,
                avoidRadius: 100,
                avoidForce: 0.15,
                ...config.mouse
            },

            // Visual settings
            visual: {
                showStats: false,
                ...config.visual
            },

            // Black hole predator settings
            blackHole: {
                enabled: true,
                x: null, // null = auto position (left side)
                y: null,
                baseSize: 60,
                gravityRadius: 250,
                gravityStrength: 0.08,
                ...config.blackHole
            },

            // Behavior systems
            behaviors: {
                hunting: { enabled: true, ...config.behaviors?.hunting },
                swarming: { enabled: true, ...config.behaviors?.swarming },
                constellation: { enabled: true, ...config.behaviors?.constellation },
                reproduction: { enabled: true, ...config.behaviors?.reproduction },
                housePersonality: { enabled: true, ...config.behaviors?.housePersonality },
                rareFireflies: { enabled: true, ...config.behaviors?.rareFireflies },
                interaction: { enabled: true, ...config.behaviors?.interaction },
                environmental: { enabled: true, ...config.behaviors?.environmental },
                ambientEffects: { enabled: true, ...config.behaviors?.ambientEffects }
            },

            // Trail system (visual polish)
            trails: {
                enabled: true,
                maxTrailLength: 8,
                trailSpacing: 40,
                fadeDuration: 400,
                ...config.trails
            },

            // Phase 2: Ecosystem Depth
            // Energy Wells (stationary energy sources)
            energyWells: {
                enabled: true,
                maxWells: 3,
                spawnChance: 0.0005, // Per frame
                types: ['STANDARD', 'VOLATILE', 'ANCIENT'],
                ...config.energyWells
            },

            // Genetics system (trait inheritance)
            genetics: {
                enabled: true,
                baseMutationRate: 0.15,
                environmentalMutation: true,
                trackLineage: true,
                ...config.genetics
            },

            // Pheromone system (chemical trails)
            pheromones: {
                enabled: true,
                gridCellSize: 40,
                visualize: false, // Set true for debug
                ...config.pheromones
            },

            // Predator Stars (mobile hunters)
            predatorStars: {
                enabled: true,
                maxPredators: 2,
                spawnChance: 0.0002, // Per frame
                types: ['HUNTER', 'LURKER', 'DRIFTER'],
                ...config.predatorStars
            },

            // Phase 3: Cosmic Events
            cosmicEvents: {
                enabled: true,
                eventCheckInterval: 15000,     // Check every 15s
                baseEventChance: 0.06,         // 6% chance per check
                maxConcurrentEvents: 2,
                announceEvents: true,
                ...config.cosmicEvents
            },

            // Phase 5: Predator Variety
            predators: {
                enabled: true,
                shadows: {
                    enabled: true,
                    maxPopulation: 3,
                    spawnChance: 0.00005,
                    minEcosystemAge: 60000    // 1 min
                },
                serpent: {
                    enabled: true,
                    maxActive: 1,
                    spawnCooldown: 180000,     // 3 min
                    minEcosystemAge: 120000,   // 2 min
                    minPopulation: 20
                },
                parasites: {
                    enabled: true,
                    maxPopulation: 10,
                    spawnChance: 0.0001,
                    minEcosystemAge: 45000     // 45s
                },
                ...config.predators
            },

            // Phase 6: Player Tools
            playerTools: {
                enabled: true,
                showUI: true,
                startingCharges: 3,
                ...config.playerTools
            },

            // Phase 6: Portals
            portals: {
                enabled: true,
                maxPairs: 3,
                ...config.portals
            },

            // Phase 6: Sanctuaries
            sanctuaries: {
                enabled: true,
                maxSanctuaries: 5,
                ...config.sanctuaries
            },

            // Phase 7: Meta Systems
            achievements: {
                enabled: true,
                showUI: true,
                toastDuration: 4000,
                storageKey: 'digitalLifeAchievements',
                ...config.achievements
            },

            statistics: {
                enabled: true,
                showHUD: true,
                updateInterval: 500,
                position: 'top-left',
                ...config.statistics
            },

            eventLog: {
                enabled: true,
                showUI: true,
                maxEntries: 100,
                position: 'bottom-right',
                collapsed: true,
                ...config.eventLog
            },

            // Phase 8: Audio System
            audio: {
                enabled: config.audio?.enabled ?? false,  // Disabled by default (user must enable)
                masterVolume: config.audio?.masterVolume ?? 0.5,
                ambientVolume: config.audio?.ambientVolume ?? 0.3,
                eventVolume: config.audio?.eventVolume ?? 0.6,
                ambientEnabled: config.audio?.ambientEnabled ?? true,
                eventsEnabled: config.audio?.eventsEnabled ?? true,
                ...config.audio
            }
        };

        // Core systems
        this.container = null;
        this.ecosystem = null;
        this.particleSystem = null;
        this.shootingStarSystem = null;
        this.blackHole = null;
        this.trailSystem = null;

        // Phase 2: Ecosystem Depth systems
        this.energyWells = [];
        this.geneticsSystem = null;
        this.pheromoneSystem = null;
        this.predatorStars = [];

        // Phase 3: Cosmic Events
        this.cosmicEventManager = null;

        // Phase 5: Predator Variety
        this.predatorManager = null;

        // Phase 6: Player Tools
        this.playerTools = null;
        this.portalManager = null;
        this.sanctuaryManager = null;

        // Phase 7: Meta Systems
        this.achievementSystem = null;
        this.statisticsDisplay = null;
        this.eventLog = null;

        // Phase 8: Audio Systems
        this.soundManager = null;
        this.eventSounds = null;
        this.ambientLayer = null;

        // Behavior systems
        this.huntingSystem = null;
        this.swarmingSystem = null;
        this.constellationSystem = null;
        this.reproductionSystem = null;
        this.housePersonalitySystem = null;
        this.rareFireflySystem = null;
        this.interactionSystem = null;
        this.environmentalSystem = null;
        this.ambientEffects = null;

        // State
        this.isInitialized = false;
        this.isRunning = false;

        // Mouse tracking (legacy - kept for basic avoidance)
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseHandler = null;

        // Stats display
        this.statsElement = null;

        // Animation frame
        this.animationFrameId = null;
        this.lastUpdateTime = 0;
    }

    /**
     * Initialize the Digital Life system
     * @param {HTMLElement} container - Container element (or document.body)
     * @returns {DigitalLife}
     */
    init(container) {
        if (this.isInitialized) {
            console.warn('DigitalLife already initialized');
            return this;
        }

        // CRITICAL: Inject styles FIRST before creating any DOM elements
        // Without this, .firefly elements won't have position: absolute
        this.injectStyles();

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'digital-life-container';
        this.container.className = 'digital-life-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 50;
            overflow: hidden;
        `;

        container.appendChild(this.container);

        // Initialize particle system first
        this.particleSystem = new ParticleSystem(this.container);
        this.particleSystem.init();

        // Initialize trail system (visual polish for firefly movement)
        if (this.config.trails.enabled && typeof TrailSystem !== 'undefined') {
            this.trailSystem = new TrailSystem(this.container, this.config.trails);
        }

        // Initialize ecosystem
        this.ecosystem = new Ecosystem({
            initialPopulation: this.config.population.initial,
            minPopulation: this.config.population.min,
            maxPopulation: this.config.population.max,
            collisionRadius: this.config.collision.radius
        });

        this.ecosystem.setParticleSystem(this.particleSystem);
        this.ecosystem.init(this.container);

        // Hook trail cleanup to firefly deaths
        if (this.trailSystem) {
            const originalOnDeath = this.ecosystem.onFireflyDeath;
            this.ecosystem.onFireflyDeath = (firefly) => {
                // Clean up trail for this firefly
                this.trailSystem.removeTrail(firefly.id);
                // Call original callback if exists
                if (originalOnDeath) {
                    originalOnDeath(firefly);
                }
            };
        }

        // Initialize black hole predator
        if (this.config.blackHole.enabled) {
            this.blackHole = new BlackHole({
                x: this.config.blackHole.x ?? window.innerWidth * 0.08,
                y: this.config.blackHole.y ?? window.innerHeight * 0.25,
                baseSize: this.config.blackHole.baseSize,
                gravityRadius: this.config.blackHole.gravityRadius,
                gravityStrength: this.config.blackHole.gravityStrength
            });

            this.blackHole.createElement(this.container);
            this.ecosystem.setBlackHole(this.blackHole);

            // Secret click handler: 5 clicks = house selector
            this.blackHole.onSecretClick = () => {
                this.showHouseSelector();
            };
        }

        // Initialize shooting stars
        if (this.config.shootingStars.enabled) {
            this.shootingStarSystem = new ShootingStarSystem({
                minInterval: this.config.shootingStars.minInterval,
                maxInterval: this.config.shootingStars.maxInterval
            });

            this.shootingStarSystem
                .init(this.container)
                .setEcosystem(this.ecosystem)
                .setParticleSystem(this.particleSystem);

            // Connect black hole if enabled
            if (this.blackHole) {
                this.shootingStarSystem.setBlackHole(this.blackHole);
            }

            this.shootingStarSystem.start();
        }

        // Set up mouse interaction (legacy)
        if (this.config.mouse.enabled) {
            this.setupMouseInteraction();
        }

        // Initialize behavior systems
        this.initializeBehaviorSystems();

        // Initialize Phase 2: Ecosystem Depth systems
        this.initializePhase2Systems();

        // Initialize Phase 3: Cosmic Events
        this.initializeCosmicEvents();

        // Initialize Phase 5: Predator Variety
        this.initializePhase5Systems();

        // Initialize Phase 6: Player Tools
        this.initializePhase6Systems();

        // Initialize Phase 7: Meta Systems
        this.initializePhase7Systems();

        // Initialize Phase 8: Audio Systems
        this.initializePhase8Systems();

        // Stats display (if enabled)
        if (this.config.visual.showStats) {
            this.createStatsDisplay();
        }

        // Start behavior update loop
        this.startBehaviorLoop();

        this.isInitialized = true;
        this.isRunning = true;

        console.log('🔮 Digital Life initialized with all behavior systems');

        return this;
    }

    /**
     * Initialize all behavior systems
     */
    initializeBehaviorSystems() {
        const behaviors = this.config.behaviors;

        // Hunting System (1s hunt 0s)
        if (behaviors.hunting.enabled && typeof HuntingSystem !== 'undefined') {
            this.huntingSystem = new HuntingSystem(behaviors.hunting);
            this.huntingSystem.setEcosystem(this.ecosystem);
        }

        // Swarming System (flocking behavior)
        if (behaviors.swarming.enabled && typeof SwarmingSystem !== 'undefined') {
            this.swarmingSystem = new SwarmingSystem(behaviors.swarming);
            this.swarmingSystem.setEcosystem(this.ecosystem);
        }

        // Constellation System (pattern formation)
        if (behaviors.constellation.enabled && typeof ConstellationSystem !== 'undefined') {
            this.constellationSystem = new ConstellationSystem(behaviors.constellation);
            this.constellationSystem
                .setEcosystem(this.ecosystem)
                .setParticleSystem(this.particleSystem);
        }

        // Reproduction System (mitosis)
        if (behaviors.reproduction.enabled && typeof ReproductionSystem !== 'undefined') {
            this.reproductionSystem = new ReproductionSystem(behaviors.reproduction);
            this.reproductionSystem
                .setEcosystem(this.ecosystem)
                .setParticleSystem(this.particleSystem);
        }

        // House Personality System
        if (behaviors.housePersonality.enabled && typeof HousePersonalitySystem !== 'undefined') {
            this.housePersonalitySystem = new HousePersonalitySystem(behaviors.housePersonality);
            this.housePersonalitySystem
                .setEcosystem(this.ecosystem)
                .setParticleSystem(this.particleSystem);
        }

        // Rare Firefly System
        if (behaviors.rareFireflies.enabled && typeof RareFireflySystem !== 'undefined') {
            try {
                this.rareFireflySystem = new RareFireflySystem(behaviors.rareFireflies);
                this.rareFireflySystem
                    .setEcosystem(this.ecosystem)
                    .setParticleSystem(this.particleSystem);
            } catch (e) {
                console.error('RareFireflySystem init error:', e);
            }
        }

        // Interaction System (click/drag)
        if (behaviors.interaction.enabled && typeof InteractionSystem !== 'undefined') {
            this.interactionSystem = new InteractionSystem(behaviors.interaction);
            this.interactionSystem
                .init(this.container)
                .setEcosystem(this.ecosystem)
                .setParticleSystem(this.particleSystem);
        }

        // Environmental System (time of day)
        if (behaviors.environmental.enabled && typeof EnvironmentalSystem !== 'undefined') {
            this.environmentalSystem = new EnvironmentalSystem(behaviors.environmental);
            this.environmentalSystem
                .setEcosystem(this.ecosystem)
                .setParticleSystem(this.particleSystem);
        }

        // Ambient Effects System (spell particles, data streams, etc.)
        if (behaviors.ambientEffects.enabled && typeof AmbientEffects !== 'undefined') {
            this.ambientEffects = new AmbientEffects(behaviors.ambientEffects);
            this.ambientEffects.init(this.container);
        }

        // Hook up binary arithmetic display to collisions
        if (this.config.collision.showBinaryArithmetic) {
            this.setupBinaryArithmeticDisplay();
        }
    }

    /**
     * Initialize Phase 2: Ecosystem Depth systems
     */
    initializePhase2Systems() {
        // Genetics System (trait inheritance)
        if (this.config.genetics.enabled && typeof GeneticsSystem !== 'undefined') {
            this.geneticsSystem = new GeneticsSystem(this.config.genetics);
            console.log('🧬 Genetics system initialized');

            // Hook genetics into reproduction
            if (this.reproductionSystem) {
                this.reproductionSystem.geneticsSystem = this.geneticsSystem;
            }

            // Apply genetics to existing fireflies
            if (this.ecosystem) {
                for (const firefly of this.ecosystem.fireflies) {
                    if (!firefly.genetics) {
                        firefly.genetics = this.geneticsSystem.createDefaultGenetics();
                        this.geneticsSystem.applyToFirefly(firefly, firefly.genetics);
                    }
                }
            }
        }

        // Pheromone System (chemical trails)
        if (this.config.pheromones.enabled && typeof PheromoneSystem !== 'undefined') {
            this.pheromoneSystem = new PheromoneSystem(this.config.pheromones);
            this.pheromoneSystem.init(this.container, window.innerWidth, window.innerHeight);
            console.log('🧪 Pheromone system initialized');
        }

        // Spawn initial energy wells
        if (this.config.energyWells.enabled && typeof EnergyWell !== 'undefined') {
            // Start with one energy well
            this.spawnEnergyWell();
            console.log('⚡ Energy well system initialized');
        }

        // Predator stars spawn over time (not immediately)
        if (this.config.predatorStars.enabled && typeof PredatorStar !== 'undefined') {
            console.log('🌟 Predator star system initialized');
        }
    }

    /**
     * Spawn an energy well
     */
    spawnEnergyWell(type = null) {
        if (!this.config.energyWells.enabled || typeof EnergyWell === 'undefined') return null;
        if (this.energyWells.length >= this.config.energyWells.maxWells) return null;

        const types = this.config.energyWells.types;
        const selectedType = type || types[Math.floor(Math.random() * types.length)];

        const well = new EnergyWell({
            type: selectedType,
            x: Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2,
            y: Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2
        });

        well.createElement(this.container);
        this.energyWells.push(well);

        // Set up callbacks
        well.onDepleted = (w) => {
            console.log(`⚡ Energy well ${w.type.name} depleted`);
        };
        well.onRestored = (w) => {
            console.log(`⚡ Energy well ${w.type.name} restored`);
        };

        return well;
    }

    /**
     * Spawn a predator star
     */
    spawnPredatorStar(type = null) {
        if (!this.config.predatorStars.enabled || typeof PredatorStar === 'undefined') return null;
        if (this.predatorStars.length >= this.config.predatorStars.maxPredators) return null;

        const types = this.config.predatorStars.types;
        const selectedType = type || types[Math.floor(Math.random() * types.length)];

        const star = new PredatorStar({
            type: selectedType
        });

        star.createElement(this.container);
        this.predatorStars.push(star);

        // Set up catch callback
        star.onCatch = (predator, prey) => {
            if (this.ecosystem) {
                // Kill the caught firefly
                this.ecosystem.killFirefly(prey, 'predator');
                console.log(`🌟 ${predator.type.name} caught firefly ${prey.id}`);
            }
        };

        console.log(`🌟 Spawned ${star.type.name}`);
        return star;
    }

    /**
     * Initialize Phase 3: Cosmic Events
     */
    initializeCosmicEvents() {
        if (!this.config.cosmicEvents.enabled || typeof CosmicEventManager === 'undefined') {
            return;
        }

        this.cosmicEventManager = new CosmicEventManager(this.config.cosmicEvents);
        this.cosmicEventManager.init(this.container);
        this.cosmicEventManager.setEcosystem(this.ecosystem);
        this.cosmicEventManager.setParticleSystem(this.particleSystem);
        this.cosmicEventManager.setShootingStarSystem(this.shootingStarSystem);
        this.cosmicEventManager.setBlackHole(this.blackHole);

        // Store reference to energy wells for events
        this.cosmicEventManager.energyWells = this.energyWells;

        // Register event handlers
        if (typeof SolarFlareEvent !== 'undefined') {
            this.cosmicEventManager.registerEventHandler('SOLAR_FLARE', new SolarFlareEvent());
        }
        if (typeof MeteorShowerEvent !== 'undefined') {
            this.cosmicEventManager.registerEventHandler('METEOR_SHOWER', new MeteorShowerEvent());
        }
        if (typeof VoidStormEvent !== 'undefined') {
            this.cosmicEventManager.registerEventHandler('VOID_STORM', new VoidStormEvent());
        }
        if (typeof EclipseEvent !== 'undefined') {
            this.cosmicEventManager.registerEventHandler('ECLIPSE', new EclipseEvent());
        }
        if (typeof NebulaDriftEvent !== 'undefined') {
            this.cosmicEventManager.registerEventHandler('NEBULA_DRIFT', new NebulaDriftEvent());
        }

        console.log('🌌 Cosmic Event system initialized');
    }

    /**
     * Initialize Phase 5: Predator Variety systems
     */
    initializePhase5Systems() {
        if (!this.config.predators.enabled || typeof PredatorManager === 'undefined') {
            return;
        }

        this.predatorManager = new PredatorManager(this.config.predators);
        this.predatorManager.init(this.container, this.ecosystem);

        console.log('🐍 Phase 5: Predator variety system initialized');
    }

    /**
     * Initialize Phase 6: Player Tools systems
     */
    initializePhase6Systems() {
        // Player Tools
        if (this.config.playerTools.enabled && typeof PlayerTools !== 'undefined') {
            this.playerTools = new PlayerTools(this.config.playerTools);
            this.playerTools.init(this.container, this.ecosystem);
            console.log('🛠️ Player tools initialized');
        }

        // Portal Manager
        if (this.config.portals.enabled && typeof PortalManager !== 'undefined') {
            this.portalManager = new PortalManager(this.config.portals);
            this.portalManager.init(this.container, this.ecosystem);
            console.log('🌀 Portal system initialized');
        }

        // Sanctuary Manager
        if (this.config.sanctuaries.enabled && typeof SanctuaryManager !== 'undefined') {
            this.sanctuaryManager = new SanctuaryManager(this.config.sanctuaries);
            this.sanctuaryManager.init(this.container, this.ecosystem);
            console.log('☮️ Sanctuary system initialized');
        }

        console.log('✨ Phase 6: Player tools system initialized');
    }

    /**
     * Initialize Phase 7: Meta Systems
     */
    initializePhase7Systems() {
        // Event Log (initialize first so it can receive events from other systems)
        if (this.config.eventLog.enabled && typeof EventLog !== 'undefined') {
            this.eventLog = new EventLog(this.config.eventLog);
            this.eventLog.init(document.body);
            console.log('📋 Event log initialized');
        }

        // Statistics Display
        if (this.config.statistics.enabled && typeof StatisticsDisplay !== 'undefined') {
            this.statisticsDisplay = new StatisticsDisplay(this.config.statistics);
            this.statisticsDisplay.init(document.body);
            console.log('📊 Statistics display initialized');
        }

        // Achievement System
        if (this.config.achievements.enabled && typeof AchievementSystem !== 'undefined') {
            this.achievementSystem = new AchievementSystem(this.config.achievements);
            this.achievementSystem.init(document.body);
            console.log('🏆 Achievement system initialized');
        }

        // Wire up event hooks
        this.wirePhase7Events();

        console.log('📈 Phase 7: Meta systems initialized');
    }

    /**
     * Wire up Phase 7 event hooks to ecosystem events
     */
    wirePhase7Events() {
        if (!this.ecosystem) return;

        // Hook into birth events
        const originalOnBirth = this.ecosystem.onFireflyBirth;
        this.ecosystem.onFireflyBirth = (firefly) => {
            // Log birth
            this.eventLog?.logBirth(firefly);

            // Check for rare spawn
            if (firefly.rareType) {
                this.eventLog?.logRareSpawn(firefly);
            }

            // Call original callback if exists
            if (originalOnBirth) {
                originalOnBirth(firefly);
            }
        };

        // Hook into death events (extend existing hook from trail system)
        const originalOnDeath = this.ecosystem.onFireflyDeath;
        this.ecosystem.onFireflyDeath = (firefly, cause) => {
            // Log death
            this.eventLog?.logDeath(firefly, cause);

            // Call original callback if exists (includes trail cleanup)
            if (originalOnDeath) {
                originalOnDeath(firefly, cause);
            }
        };

        // Hook into evolution events
        const originalOnEvolution = this.ecosystem.onEvolution;
        this.ecosystem.onEvolution = (firefly, oldTier, newTier) => {
            // Log evolution
            this.eventLog?.logEvolution(firefly, oldTier, newTier);

            // Call original callback if exists
            if (originalOnEvolution) {
                originalOnEvolution(firefly, oldTier, newTier);
            }
        };

        // Hook into cosmic event manager if available
        if (this.cosmicEventManager) {
            const originalOnEvent = this.cosmicEventManager.onEventStart;
            this.cosmicEventManager.onEventStart = (eventType) => {
                this.eventLog?.logCosmicEvent(eventType, 'started');
                if (originalOnEvent) {
                    originalOnEvent(eventType);
                }
            };

            const originalOnEventEnd = this.cosmicEventManager.onEventEnd;
            this.cosmicEventManager.onEventEnd = (eventType) => {
                this.eventLog?.logCosmicEvent(eventType, 'ended');
                if (originalOnEventEnd) {
                    originalOnEventEnd(eventType);
                }
            };
        }

        // Hook into predator manager if available
        if (this.predatorManager) {
            const originalOnKill = this.predatorManager.onPredatorKill;
            this.predatorManager.onPredatorKill = (predatorType, firefly) => {
                this.eventLog?.logPredatorEvent(predatorType, 'caught firefly');
                if (originalOnKill) {
                    originalOnKill(predatorType, firefly);
                }
            };
        }

        // Hook achievement checking to stats updates
        if (this.achievementSystem) {
            const originalOnStatsUpdate = this.ecosystem.onStatsUpdate;
            this.ecosystem.onStatsUpdate = (stats) => {
                // Check achievements
                this.achievementSystem.checkAchievements(stats);

                // Call original callback if exists
                if (originalOnStatsUpdate) {
                    originalOnStatsUpdate(stats);
                }
            };

            // Set up achievement unlock callback
            this.achievementSystem.onUnlock = (achievement) => {
                this.eventLog?.logAchievement(achievement);
                // Play achievement sound
                this.eventSounds?.playAchievement();
            };
        }
    }

    /**
     * Initialize Phase 8: Audio Systems
     */
    initializePhase8Systems() {
        if (!this.config.audio.enabled) {
            console.log('🔇 Audio system disabled (enable with config.audio.enabled = true)');
            return;
        }

        // Sound Manager (core audio infrastructure)
        if (typeof SoundManager !== 'undefined') {
            this.soundManager = new SoundManager({
                enabled: this.config.audio.enabled,
                masterVolume: this.config.audio.masterVolume,
                ambientVolume: this.config.audio.ambientVolume,
                eventVolume: this.config.audio.eventVolume
            });

            // Initialize on first user interaction (browser requirement)
            const initAudio = () => {
                if (!this.soundManager.isInitialized) {
                    this.soundManager.init();

                    // Start ambient layer if enabled
                    if (this.config.audio.ambientEnabled && this.ambientLayer) {
                        this.ambientLayer.start();
                    }
                }
                document.removeEventListener('click', initAudio);
                document.removeEventListener('keydown', initAudio);
            };

            document.addEventListener('click', initAudio);
            document.addEventListener('keydown', initAudio);

            console.log('🔊 Sound manager created (will initialize on first interaction)');
        }

        // Event Sounds (lifecycle, collisions, cosmic events)
        if (this.soundManager && typeof EventSounds !== 'undefined') {
            this.eventSounds = new EventSounds(this.soundManager, {
                enabled: this.config.audio.eventsEnabled
            });
            console.log('🎵 Event sounds initialized');
        }

        // Ambient Layer (background atmosphere)
        if (this.soundManager && typeof AmbientLayer !== 'undefined') {
            this.ambientLayer = new AmbientLayer(this.soundManager, {
                enabled: this.config.audio.ambientEnabled
            });
            console.log('🎶 Ambient layer initialized');
        }

        // Wire up audio to ecosystem events
        this.wirePhase8Audio();

        console.log('🔊 Phase 8: Audio system initialized');
    }

    /**
     * Wire up audio hooks to ecosystem events
     */
    wirePhase8Audio() {
        if (!this.eventSounds || !this.ecosystem) return;

        // Hook into birth events
        const originalOnBirth = this.ecosystem.onFireflyBirth;
        this.ecosystem.onFireflyBirth = (firefly) => {
            // Play birth sound
            this.eventSounds?.playBirth(firefly);

            // Check for rare spawn
            if (firefly.rareType) {
                this.eventSounds?.playRareSpawn(firefly.rareType);
            }

            // Call original callback if exists
            if (originalOnBirth) {
                originalOnBirth(firefly);
            }
        };

        // Hook into death events
        const originalOnDeath = this.ecosystem.onFireflyDeath;
        this.ecosystem.onFireflyDeath = (firefly, cause) => {
            // Play death sound
            this.eventSounds?.playDeath(firefly, cause);

            // Call original callback if exists
            if (originalOnDeath) {
                originalOnDeath(firefly, cause);
            }
        };

        // Hook into evolution events
        const originalOnEvolution = this.ecosystem.onEvolution;
        this.ecosystem.onEvolution = (firefly, oldTier, newTier) => {
            // Play evolution sound
            this.eventSounds?.playEvolution(firefly, oldTier, newTier);

            // Call original callback if exists
            if (originalOnEvolution) {
                originalOnEvolution(firefly, oldTier, newTier);
            }
        };

        // Hook into collision events
        const originalOnCollision = this.ecosystem.onCollision;
        this.ecosystem.onCollision = (firefly1, firefly2, result) => {
            // Play collision sound
            this.eventSounds?.playCollision(firefly1.digit, firefly2.digit, result);

            // Call original callback if exists
            if (originalOnCollision) {
                originalOnCollision(firefly1, firefly2, result);
            }
        };

        // Hook into cosmic event manager
        if (this.cosmicEventManager) {
            const originalOnEvent = this.cosmicEventManager.onEventStart;
            this.cosmicEventManager.onEventStart = (eventType) => {
                // Play cosmic event sound
                switch (eventType) {
                    case 'SOLAR_FLARE':
                        this.eventSounds?.playSolarFlare('start');
                        break;
                    case 'METEOR_SHOWER':
                        this.eventSounds?.playMeteorShower();
                        break;
                    case 'VOID_STORM':
                        this.eventSounds?.playVoidStorm('start');
                        break;
                    case 'ECLIPSE':
                        this.eventSounds?.playEclipse('start');
                        break;
                    case 'NEBULA_DRIFT':
                        this.eventSounds?.playNebulaDrift();
                        break;
                }

                if (originalOnEvent) {
                    originalOnEvent(eventType);
                }
            };
        }

        // Hook into predator manager
        if (this.predatorManager) {
            const originalOnSpawn = this.predatorManager.onPredatorSpawn;
            this.predatorManager.onPredatorSpawn = (predatorType) => {
                switch (predatorType) {
                    case 'shadow':
                        this.eventSounds?.playShadowAppear();
                        break;
                    case 'serpent':
                        this.eventSounds?.playVoidSerpent();
                        break;
                    case 'parasite':
                        this.eventSounds?.playParasiteAttach();
                        break;
                }

                if (originalOnSpawn) {
                    originalOnSpawn(predatorType);
                }
            };
        }

        // Hook into shooting star system
        if (this.shootingStarSystem) {
            const originalOnLaunch = this.shootingStarSystem.onLaunch;
            this.shootingStarSystem.onLaunch = (star) => {
                this.eventSounds?.playShootingStar();

                if (originalOnLaunch) {
                    originalOnLaunch(star);
                }
            };
        }

        // Hook into player tools
        if (this.playerTools) {
            const originalOnToolUse = this.playerTools.onToolUse;
            this.playerTools.onToolUse = (toolType) => {
                switch (toolType) {
                    case 'blessing':
                        this.eventSounds?.playEnergyBlessing();
                        break;
                    case 'shield':
                        this.eventSounds?.playShieldBubble();
                        break;
                    case 'beacon':
                    case 'gravity':
                    case 'catalyst':
                        this.eventSounds?.playUIClick();
                        break;
                }

                if (originalOnToolUse) {
                    originalOnToolUse(toolType);
                }
            };
        }

        // Hook into portal manager
        if (this.portalManager) {
            const originalOnTeleport = this.portalManager.onTeleport;
            this.portalManager.onTeleport = (firefly, portal) => {
                this.eventSounds?.playPortalActivate();

                if (originalOnTeleport) {
                    originalOnTeleport(firefly, portal);
                }
            };
        }
    }

    /**
     * Create a portal pair (for debugging or player use)
     */
    createPortalPair(options = {}) {
        if (!this.portalManager) {
            console.warn('Portal manager not available');
            return null;
        }
        return this.portalManager.createPortalPair(options);
    }

    /**
     * Create a sanctuary (for debugging or player use)
     */
    createSanctuary(options = {}) {
        if (!this.sanctuaryManager) {
            console.warn('Sanctuary manager not available');
            return null;
        }
        return this.sanctuaryManager.createSanctuary(options);
    }

    /**
     * Force spawn a shadow firefly (for debugging)
     */
    forceShadow(x, y) {
        if (!this.predatorManager) {
            console.warn('Predator manager not available');
            return null;
        }
        return this.predatorManager.forceShadow(x, y);
    }

    /**
     * Force spawn a void serpent (for debugging)
     */
    forceSerpent() {
        if (!this.predatorManager) {
            console.warn('Predator manager not available');
            return null;
        }
        return this.predatorManager.forceSerpent();
    }

    /**
     * Force spawn a parasite (for debugging)
     */
    forceParasite(x, y) {
        if (!this.predatorManager) {
            console.warn('Predator manager not available');
            return null;
        }
        return this.predatorManager.forceParasite(x, y);
    }

    /**
     * Force trigger a cosmic event (for debugging)
     */
    forceCosmicEvent(eventType = 'SOLAR_FLARE') {
        if (!this.cosmicEventManager) {
            console.warn('Cosmic event manager not available');
            return null;
        }
        return this.cosmicEventManager.forceEvent(eventType);
    }

    /**
     * Set up binary arithmetic display on collisions
     */
    setupBinaryArithmeticDisplay() {
        if (!this.ecosystem || !this.particleSystem) return;

        // Use the ecosystem's onCollision callback
        this.ecosystem.onCollision = (firefly1, firefly2, result) => {
            const midX = (firefly1.x + firefly2.x) / 2;
            const midY = (firefly1.y + firefly2.y) / 2;
            // Show binary arithmetic display
            this.particleSystem.createBinaryArithmeticDisplay(midX, midY, firefly1.digit, firefly2.digit);
        };
    }

    /**
     * Start the behavior update loop
     */
    startBehaviorLoop() {
        const update = (currentTime) => {
            if (!this.isRunning) return;

            const deltaTime = this.lastUpdateTime ? currentTime - this.lastUpdateTime : 16;
            this.lastUpdateTime = currentTime;

            // Update all behavior systems
            this.updateBehaviors(deltaTime);

            this.animationFrameId = requestAnimationFrame(update);
        };

        this.animationFrameId = requestAnimationFrame(update);
    }

    /**
     * Update all behavior systems
     */
    updateBehaviors(deltaTime) {
        const timestamp = performance.now();

        // Update shooting star eggs
        if (this.shootingStarSystem) {
            this.shootingStarSystem.updateEggs?.();
        }

        // Update behavior systems
        this.huntingSystem?.update(deltaTime);
        this.swarmingSystem?.update(deltaTime);
        this.constellationSystem?.update(deltaTime);
        this.reproductionSystem?.update(deltaTime);
        this.housePersonalitySystem?.update(deltaTime);
        this.rareFireflySystem?.update(deltaTime);
        this.interactionSystem?.update(deltaTime);
        this.environmentalSystem?.update(deltaTime);
        this.ambientEffects?.update(deltaTime);

        // Update trail system (visual polish)
        if (this.trailSystem && this.ecosystem) {
            // Update trails for each firefly
            for (const firefly of this.ecosystem.fireflies) {
                this.trailSystem.updateFireflyTrail(firefly, timestamp);
            }
            // Render all trails
            this.trailSystem.render(timestamp);

            // Aggressive cleanup every frame to immediately remove trails from dead/dying fireflies
            // The cleanup method is efficient - it only builds a Set and removes stale trails
            this.trailSystem.cleanup(this.ecosystem.fireflies);
        }

        // Register activity from interaction system to environmental
        if (this.interactionSystem?.isInteracting() && this.environmentalSystem) {
            this.environmentalSystem.registerActivity();
        }

        // Update Phase 2: Ecosystem Depth systems
        this.updatePhase2Systems(deltaTime, timestamp);
    }

    /**
     * Update Phase 2: Ecosystem Depth systems
     */
    updatePhase2Systems(deltaTime, timestamp) {
        // Update energy wells
        for (const well of this.energyWells) {
            well.update(deltaTime);

            // Apply well effects to nearby fireflies
            if (this.ecosystem) {
                for (const firefly of this.ecosystem.fireflies) {
                    // Apply attraction
                    well.applyAttraction(firefly);

                    // Give energy to fireflies in range
                    const energyGiven = well.giveEnergy(firefly, deltaTime);
                    if (energyGiven > 0) {
                        firefly.energy = Math.min(100, firefly.energy + energyGiven);
                    }
                }
            }
        }

        // Randomly spawn new energy wells
        if (this.config.energyWells.enabled &&
            this.energyWells.length < this.config.energyWells.maxWells &&
            Math.random() < this.config.energyWells.spawnChance) {
            this.spawnEnergyWell();
        }

        // Update pheromone system
        if (this.pheromoneSystem && this.ecosystem) {
            this.pheromoneSystem.update(timestamp);

            // Process each firefly for pheromone deposit and influence
            for (const firefly of this.ecosystem.fireflies) {
                // Build context for pheromone deposit decisions
                const context = {
                    nearEnergyWell: this.energyWells.some(w => w.isInRange(firefly.x, firefly.y)),
                    nearPlanet: this.ecosystem.planets?.some(p =>
                        Math.sqrt((firefly.x - p.x) ** 2 + (firefly.y - p.y) ** 2) < p.size * 2
                    ),
                    nearBlackHole: this.blackHole?.isActive &&
                        Math.sqrt((firefly.x - this.blackHole.x) ** 2 +
                                  (firefly.y - this.blackHole.y) ** 2) < this.blackHole.gravityRadius,
                    fleeing: firefly.isFleeing,
                    seekingMate: firefly.readyToReproduce,
                    inSwarm: firefly.swarmId !== undefined
                };

                // Deposit pheromones based on behavior
                this.pheromoneSystem.processFirefly(firefly, deltaTime, context);

                // Apply pheromone influence to movement
                this.pheromoneSystem.applyInfluence(firefly);
            }
        }

        // Update predator stars
        for (let i = this.predatorStars.length - 1; i >= 0; i--) {
            const star = this.predatorStars[i];
            const fireflies = this.ecosystem?.fireflies ?? [];
            star.update(deltaTime, fireflies);
        }

        // Randomly spawn new predator stars
        if (this.config.predatorStars.enabled &&
            this.predatorStars.length < this.config.predatorStars.maxPredators &&
            Math.random() < this.config.predatorStars.spawnChance) {
            this.spawnPredatorStar();
        }

        // Update cosmic events
        if (this.cosmicEventManager) {
            this.cosmicEventManager.update(deltaTime, timestamp);
        }

        // Update Phase 5: Predator variety
        if (this.predatorManager) {
            this.predatorManager.update(deltaTime, timestamp);
        }

        // Update Phase 6: Player Tools
        if (this.playerTools) {
            this.playerTools.update(deltaTime, timestamp);
        }

        // Update portals
        if (this.portalManager) {
            this.portalManager.update(deltaTime, timestamp);
        }

        // Update sanctuaries
        if (this.sanctuaryManager) {
            this.sanctuaryManager.update(deltaTime, timestamp);
        }

        // Update Phase 7: Meta Systems
        this.updatePhase7Systems(deltaTime, timestamp);
    }

    /**
     * Update Phase 7: Meta Systems
     */
    updatePhase7Systems(deltaTime, timestamp) {
        // Build comprehensive stats object for statistics display
        if (this.statisticsDisplay && this.ecosystem) {
            const stats = this.ecosystem.getStats();

            // Add tier breakdown
            const tierCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
            let rareCount = 0;
            for (const firefly of this.ecosystem.fireflies) {
                tierCounts[firefly.tier?.level ?? 0]++;
                if (firefly.rareType) rareCount++;
            }
            stats.tierCounts = tierCounts;
            stats.rareCount = rareCount;

            // Add entity counts
            stats.entityCounts = {
                energyWells: this.energyWells?.length ?? 0,
                predatorStars: this.predatorStars?.length ?? 0,
                shadows: this.predatorManager?.shadows?.length ?? 0,
                serpents: this.predatorManager?.serpents?.length ?? 0,
                parasites: this.predatorManager?.parasites?.length ?? 0,
                portals: this.portalManager?.portals?.length ?? 0,
                sanctuaries: this.sanctuaryManager?.sanctuaries?.length ?? 0,
                planets: this.ecosystem.planets?.length ?? 0
            };

            // Update statistics display
            this.statisticsDisplay.update(stats);
        }

        // Update ambient layer with ecosystem data
        if (this.ambientLayer && this.ecosystem) {
            this.ambientLayer.setEcosystemData({
                population: this.ecosystem.fireflies.length,
                shadows: this.predatorManager?.shadows?.length ?? 0,
                serpents: this.predatorManager?.serpents?.length ?? 0,
                parasites: this.predatorManager?.parasites?.length ?? 0,
                voidStormActive: this.cosmicEventManager?.isEventActive('VOID_STORM'),
                cosmicEventActive: this.cosmicEventManager?.hasActiveEvents()
            });
        }
    }

    /**
     * Inject required CSS styles
     * Uses theme colors from config if available
     */
    injectStyles() {
        if (document.getElementById('digital-life-styles')) return;

        // Get theme colors from config
        const themeColors = this.config.themeColors || DigitalLife.THEMES.magic;
        const accent = themeColors.accent || '#9f7aea';
        const glow = themeColors.glow || 'rgba(159, 122, 234, 0.6)';
        const themeName = this.config.theme || 'magic';

        const styles = document.createElement('style');
        styles.id = 'digital-life-styles';
        styles.textContent = `
            .digital-life-container {
                font-family: 'Courier New', monospace;
                --dl-accent: ${accent};
                --dl-glow: ${glow};
                --dl-theme: ${themeName};
            }

            .firefly {
                position: absolute;
                font-weight: bold;
                color: var(--dl-accent, #9f7aea);
                text-shadow:
                    0 0 5px var(--dl-glow, rgba(159, 122, 234, 0.8)),
                    0 0 10px var(--dl-glow, rgba(159, 122, 234, 0.6)),
                    0 0 20px var(--dl-glow, rgba(159, 122, 234, 0.4));
                pointer-events: none;
                user-select: none;
                transition: opacity 0.3s ease;
                z-index: 2;
            }

            .firefly[data-state="birth"] {
                filter: blur(1px);
            }

            .firefly[data-state="dying"] {
                filter: blur(2px);
            }

            .firefly[data-digit="1"] {
                /* Ones could be slightly different - optional */
            }

            .firefly[data-digit="0"] {
                /* Zeros could be slightly different - optional */
            }

            .shooting-star {
                z-index: 10;
            }

            .particle {
                z-index: 5;
            }

            .particle-flash {
                z-index: 4;
            }

            @keyframes flashPulse {
                0% {
                    transform: scale(0.5);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.5);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }

            .digital-life-stats {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: ${themeName === 'matrix' ? '#00ff41' : '#0f0'};
                font-family: 'Courier New', monospace;
                font-size: 11px;
                padding: 10px 15px;
                border-radius: 6px;
                border: 1px solid ${themeName === 'matrix' ? '#00ff4130' : '#0f03'};
                z-index: 1000;
                pointer-events: auto;
            }

            .digital-life-stats h4 {
                margin: 0 0 8px 0;
                color: ${themeName === 'matrix' ? '#00ff41' : '#0f0'};
                font-size: 12px;
                border-bottom: 1px solid ${themeName === 'matrix' ? '#00ff4130' : '#0f03'};
                padding-bottom: 5px;
            }

            .digital-life-stats .stat-row {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin: 3px 0;
            }

            .digital-life-stats .stat-value {
                color: ${accent};
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Set up mouse interaction
     */
    setupMouseInteraction() {
        this.mouseHandler = (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Apply avoidance force to nearby fireflies
            if (this.ecosystem) {
                for (const firefly of this.ecosystem.fireflies) {
                    const dx = firefly.x - this.mouseX;
                    const dy = firefly.y - this.mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.config.mouse.avoidRadius && dist > 0) {
                        const force = (this.config.mouse.avoidRadius - dist) /
                            this.config.mouse.avoidRadius * this.config.mouse.avoidForce;
                        firefly.applyForce((dx / dist) * force, (dy / dist) * force);
                    }
                }
            }
        };

        document.addEventListener('mousemove', this.mouseHandler);
    }

    /**
     * Create stats display (for debugging)
     */
    createStatsDisplay() {
        this.statsElement = document.createElement('div');
        this.statsElement.className = 'digital-life-stats';
        document.body.appendChild(this.statsElement);

        this.ecosystem.onStatsUpdate = (stats) => {
            const pop = this.ecosystem.getPopulationByDigit();
            let blackHoleStats = '';

            if (this.blackHole) {
                const bhState = this.blackHole.getStateInfo();
                blackHoleStats = `
                <div class="stat-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #0f03;">
                    <span>Black Hole:</span>
                    <span class="stat-value" style="color: ${this.blackHole.isActive ? '#9f7aea' : '#666'}">
                        ${this.blackHole.isActive ? 'Active' : 'Dormant'}
                    </span>
                </div>
                <div class="stat-row">
                    <span>BH Size:</span>
                    <span class="stat-value">${bhState.size}px</span>
                </div>
                <div class="stat-row">
                    <span>BH Health:</span>
                    <span class="stat-value">${bhState.health}%</span>
                </div>
                <div class="stat-row">
                    <span>Consumed:</span>
                    <span class="stat-value">${bhState.onesConsumed}(1) / ${bhState.zerosConsumed}(0)</span>
                </div>
                `;
            }

            // Count fireflies by tier
            const tierCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
            for (const firefly of this.ecosystem.fireflies) {
                tierCounts[firefly.tier?.level ?? 0]++;
            }

            const tierDisplay = `
                <div class="stat-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #0f03;">
                    <span>Tiers:</span>
                    <span class="stat-value" style="font-size: 10px;">
                        <span style="color: #fff;">${tierCounts[0]}</span>/
                        <span style="color: #9f7aea;">${tierCounts[1]}</span>/
                        <span style="color: #38bdf8;">${tierCounts[2]}</span>/
                        <span style="color: #fbbf24;">${tierCounts[3]}</span>/
                        <span style="color: #22c55e;">${tierCounts[4]}</span>
                    </span>
                </div>
                <div class="stat-row">
                    <span>Evolutions:</span>
                    <span class="stat-value">${stats.totalEvolutions || 0}</span>
                </div>
                `;

            let planetStats = '';
            if (this.ecosystem.planets && this.ecosystem.planets.length > 0) {
                planetStats = `
                <div class="stat-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #0f03;">
                    <span>Planets:</span>
                    <span class="stat-value" style="color: #fbbf24;">${this.ecosystem.planets.length}</span>
                </div>
                `;
            }

            this.statsElement.innerHTML = `
                <h4>Digital Life Stats</h4>
                <div class="stat-row">
                    <span>Population:</span>
                    <span class="stat-value">${stats.currentPopulation}</span>
                </div>
                <div class="stat-row">
                    <span>Zeros / Ones:</span>
                    <span class="stat-value">${pop.zeros} / ${pop.ones}</span>
                </div>
                <div class="stat-row">
                    <span>Births / Deaths:</span>
                    <span class="stat-value">${stats.totalBirths} / ${stats.totalDeaths}</span>
                </div>
                <div class="stat-row">
                    <span>Collisions:</span>
                    <span class="stat-value">${stats.totalCollisions}</span>
                </div>
                <div class="stat-row">
                    <span>Avg Energy:</span>
                    <span class="stat-value">${stats.averageEnergy}%</span>
                </div>
                ${tierDisplay}
                ${blackHoleStats}
                ${planetStats}
            `;
        };
    }

    /**
     * Pause the simulation
     */
    pause() {
        if (!this.isRunning) return this;

        this.ecosystem?.stop();
        this.particleSystem?.stop();
        this.shootingStarSystem?.stop();
        this.ambientEffects?.stop?.();

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        this.isRunning = false;

        return this;
    }

    /**
     * Resume the simulation
     */
    resume() {
        if (this.isRunning) return this;

        this.ecosystem?.start();
        this.particleSystem?.start();
        this.shootingStarSystem?.start();
        this.ambientEffects?.start?.();

        this.isRunning = true;
        this.startBehaviorLoop();

        return this;
    }

    /**
     * Force a shooting star (for testing)
     */
    triggerShootingStar() {
        this.shootingStarSystem?.forceLaunch();
        return this;
    }

    /**
     * Get current stats
     */
    getStats() {
        return this.ecosystem?.getStats() ?? {};
    }

    /**
     * Update config at runtime
     */
    updateConfig(newConfig) {
        // Deep merge config
        this.config = {
            ...this.config,
            ...newConfig,
            population: { ...this.config.population, ...newConfig.population },
            collision: { ...this.config.collision, ...newConfig.collision },
            shootingStars: { ...this.config.shootingStars, ...newConfig.shootingStars },
            mouse: { ...this.config.mouse, ...newConfig.mouse },
            visual: { ...this.config.visual, ...newConfig.visual }
        };

        return this;
    }

    /**
     * Toggle stats display
     */
    toggleStats() {
        if (this.statsElement) {
            this.statsElement.style.display =
                this.statsElement.style.display === 'none' ? 'block' : 'none';
        } else {
            this.config.visual.showStats = true;
            this.createStatsDisplay();
        }
        return this;
    }

    /**
     * Create debug controls panel for testing features
     */
    createDebugControls() {
        if (this.debugElement) return this;

        this.debugElement = document.createElement('div');
        this.debugElement.className = 'digital-life-debug';
        this.debugElement.innerHTML = `
            <h4>🧪 Debug Controls</h4>
            <div class="debug-section">
                <span class="section-title">Celestial Events</span>
                <button data-action="shootingStar">☄️ Shooting Star</button>
                <button data-action="constellation">✨ Force Constellation</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Planets</span>
                <button data-action="planetNull">🌐 Null World (0)</button>
                <button data-action="planetUnity">🌟 Unity Sphere (1)</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Fireflies</span>
                <button data-action="spawnAscended">👑 Spawn Ascended</button>
                <button data-action="makeDesperate">💀 Make Desperate</button>
                <button data-action="forceSwarm">🐝 Force Swarm</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Rare Spawns</span>
                <button data-action="rareGolden">🥇 Golden</button>
                <button data-action="rareDiamond">💎 Diamond</button>
                <button data-action="rareGlitch">⚡ Glitch</button>
                <button data-action="rareAncient">🏛️ Ancient</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Environment</span>
                <button data-action="forceTerraform">🌍 Terraform (4 planets)</button>
                <button data-action="toggleBlackHole">🕳️ Toggle Black Hole</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Phase 2: Ecosystem</span>
                <button data-action="spawnEnergyWell">⚡ Energy Well</button>
                <button data-action="spawnPredator">🌟 Predator Star</button>
                <button data-action="togglePheromones">🧪 Toggle Pheromones</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Phase 3: Cosmic Events</span>
                <button data-action="eventSolarFlare">☀️ Solar Flare</button>
                <button data-action="eventMeteorShower">☄️ Meteor Shower</button>
                <button data-action="eventVoidStorm">🌀 Void Storm</button>
                <button data-action="eventEclipse">🌑 Eclipse</button>
                <button data-action="eventNebula">🌌 Nebula Drift</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Phase 5: Predators</span>
                <button data-action="spawnShadow">👤 Shadow Firefly</button>
                <button data-action="spawnSerpent">🐍 Void Serpent</button>
                <button data-action="spawnParasite">🦠 Parasite</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Phase 6: Player Tools</span>
                <button data-action="createPortals">🌀 Portal Pair</button>
                <button data-action="createSanctuary">☮️ Sanctuary</button>
                <button data-action="createAncientGrove">🌳 Ancient Grove</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Phase 7: Meta Systems</span>
                <button data-action="toggleEventLog">📋 Toggle Event Log</button>
                <button data-action="toggleStats7">📊 Toggle Stats HUD</button>
                <button data-action="clearAchievements">🏆 Reset Achievements</button>
                <button data-action="testAchievement">🎉 Test Achievement</button>
            </div>
            <div class="debug-section">
                <span class="section-title">Phase 8: Audio</span>
                <button data-action="toggleAudio">🔊 Toggle Audio</button>
                <button data-action="toggleAmbient">🎶 Toggle Ambient</button>
                <button data-action="testBirthSound">✨ Birth Sound</button>
                <button data-action="testDeathSound">💀 Death Sound</button>
                <button data-action="testEvolutionSound">⬆️ Evolution Sound</button>
                <button data-action="testCosmicSound">🌌 Cosmic Sound</button>
            </div>
            <button class="close-btn" data-action="close">✕</button>
        `;

        // Add styles for debug panel
        this.injectDebugStyles();

        // Add event listeners
        this.debugElement.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) return;

            switch (action) {
                case 'shootingStar':
                    this.triggerShootingStar();
                    this.flashButton(e.target);
                    break;
                case 'constellation':
                    this.forceConstellation();
                    this.flashButton(e.target);
                    break;
                case 'planetNull':
                    this.spawnPlanet(0);
                    this.flashButton(e.target);
                    break;
                case 'planetUnity':
                    this.spawnPlanet(1);
                    this.flashButton(e.target);
                    break;
                case 'spawnAscended':
                    this.spawnAscendedFirefly();
                    this.flashButton(e.target);
                    break;
                case 'makeDesperate':
                    this.makeFireflyDesperate();
                    this.flashButton(e.target);
                    break;
                case 'forceSwarm':
                    this.forceSwarm();
                    this.flashButton(e.target);
                    break;
                case 'rareGolden':
                    this.spawnRare('golden');
                    this.flashButton(e.target);
                    break;
                case 'rareDiamond':
                    this.spawnRare('diamond');
                    this.flashButton(e.target);
                    break;
                case 'rareGlitch':
                    this.spawnRare('glitch');
                    this.flashButton(e.target);
                    break;
                case 'rareAncient':
                    this.spawnRare('ancient');
                    this.flashButton(e.target);
                    break;
                case 'forceTerraform':
                    this.forceTerraform();
                    this.flashButton(e.target);
                    break;
                case 'toggleBlackHole':
                    this.toggleBlackHole();
                    this.flashButton(e.target);
                    break;
                case 'spawnEnergyWell':
                    this.spawnEnergyWell();
                    this.flashButton(e.target);
                    break;
                case 'spawnPredator':
                    this.spawnPredatorStar();
                    this.flashButton(e.target);
                    break;
                case 'togglePheromones':
                    this.togglePheromoneVisualization();
                    this.flashButton(e.target);
                    break;
                case 'eventSolarFlare':
                    this.forceCosmicEvent('SOLAR_FLARE');
                    this.flashButton(e.target);
                    break;
                case 'eventMeteorShower':
                    this.forceCosmicEvent('METEOR_SHOWER');
                    this.flashButton(e.target);
                    break;
                case 'eventVoidStorm':
                    this.forceCosmicEvent('VOID_STORM');
                    this.flashButton(e.target);
                    break;
                case 'eventEclipse':
                    this.forceCosmicEvent('ECLIPSE');
                    this.flashButton(e.target);
                    break;
                case 'eventNebula':
                    this.forceCosmicEvent('NEBULA_DRIFT');
                    this.flashButton(e.target);
                    break;
                case 'spawnShadow':
                    this.forceShadow();
                    this.flashButton(e.target);
                    break;
                case 'spawnSerpent':
                    this.forceSerpent();
                    this.flashButton(e.target);
                    break;
                case 'spawnParasite':
                    this.forceParasite();
                    this.flashButton(e.target);
                    break;
                case 'createPortals':
                    this.createPortalPair({
                        x1: window.innerWidth * 0.3,
                        y1: window.innerHeight * 0.5,
                        x2: window.innerWidth * 0.7,
                        y2: window.innerHeight * 0.5
                    });
                    this.flashButton(e.target);
                    break;
                case 'createSanctuary':
                    this.createSanctuary({
                        type: 'STANDARD',
                        x: window.innerWidth * 0.5,
                        y: window.innerHeight * 0.5
                    });
                    this.flashButton(e.target);
                    break;
                case 'createAncientGrove':
                    this.createSanctuary({
                        type: 'ANCIENT',
                        x: window.innerWidth * 0.5,
                        y: window.innerHeight * 0.5
                    });
                    this.flashButton(e.target);
                    break;
                case 'toggleEventLog':
                    this.toggleEventLog();
                    this.flashButton(e.target);
                    break;
                case 'toggleStats7':
                    this.toggleStatisticsHUD();
                    this.flashButton(e.target);
                    break;
                case 'clearAchievements':
                    this.resetAchievements();
                    this.flashButton(e.target);
                    break;
                case 'testAchievement':
                    this.testAchievement();
                    this.flashButton(e.target);
                    break;
                case 'toggleAudio':
                    this.toggleAudio();
                    this.flashButton(e.target);
                    break;
                case 'toggleAmbient':
                    this.toggleAmbient();
                    this.flashButton(e.target);
                    break;
                case 'testBirthSound':
                    this.testSound('birth');
                    this.flashButton(e.target);
                    break;
                case 'testDeathSound':
                    this.testSound('death');
                    this.flashButton(e.target);
                    break;
                case 'testEvolutionSound':
                    this.testSound('evolution');
                    this.flashButton(e.target);
                    break;
                case 'testCosmicSound':
                    this.testSound('cosmic');
                    this.flashButton(e.target);
                    break;
                case 'close':
                    this.toggleDebugControls();
                    break;
            }
        });

        document.body.appendChild(this.debugElement);
        return this;
    }

    /**
     * Inject debug panel styles
     */
    injectDebugStyles() {
        if (document.getElementById('digital-life-debug-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'digital-life-debug-styles';
        styles.textContent = `
            .digital-life-debug {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.85);
                color: #0f0;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #0f03;
                z-index: 10000;
                pointer-events: auto;
                min-width: 180px;
                box-shadow: 0 4px 20px rgba(0, 255, 0, 0.1);
            }

            .digital-life-debug h4 {
                margin: 0 0 12px 0;
                color: #0f0;
                font-size: 13px;
                border-bottom: 1px solid #0f03;
                padding-bottom: 8px;
                text-align: center;
            }

            .digital-life-debug .debug-section {
                margin-bottom: 10px;
            }

            .digital-life-debug .section-title {
                display: block;
                color: #888;
                font-size: 9px;
                text-transform: uppercase;
                margin-bottom: 5px;
                letter-spacing: 1px;
            }

            .digital-life-debug button {
                display: block;
                width: 100%;
                padding: 6px 10px;
                margin: 3px 0;
                background: rgba(159, 122, 234, 0.2);
                border: 1px solid rgba(159, 122, 234, 0.4);
                color: #c4b5fd;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }

            .digital-life-debug button:hover {
                background: rgba(159, 122, 234, 0.4);
                border-color: rgba(159, 122, 234, 0.8);
                color: #fff;
            }

            .digital-life-debug button:active,
            .digital-life-debug button.flash {
                background: rgba(0, 255, 0, 0.4);
                border-color: #0f0;
                color: #0f0;
            }

            .digital-life-debug .close-btn {
                position: absolute;
                top: 8px;
                right: 8px;
                width: 20px;
                padding: 2px;
                font-size: 12px;
                text-align: center;
                background: transparent;
                border: none;
                color: #666;
            }

            .digital-life-debug .close-btn:hover {
                color: #f00;
                background: transparent;
                border: none;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Flash button to show action triggered
     */
    flashButton(button) {
        button.classList.add('flash');
        setTimeout(() => button.classList.remove('flash'), 200);
    }

    /**
     * Toggle debug controls visibility
     */
    toggleDebugControls() {
        if (this.debugElement) {
            this.debugElement.style.display =
                this.debugElement.style.display === 'none' ? 'block' : 'none';
        } else {
            this.createDebugControls();
        }
        return this;
    }

    /**
     * Force a constellation to form
     */
    forceConstellation() {
        if (!this.constellationSystem) {
            console.warn('Constellation system not available');
            return this;
        }
        // Temporarily boost formation chance to guarantee it
        this.constellationSystem.tryCreateFormation();
        return this;
    }

    /**
     * Spawn a planet directly (bypassing Ascended sacrifice)
     * @param {number} digit - 0 for Null World, 1 for Unity Sphere
     */
    spawnPlanet(digit) {
        if (!this.ecosystem || !this.blackHole) {
            console.warn('Ecosystem or black hole not available');
            return this;
        }
        const planet = this.ecosystem.createPlanet(
            digit,
            this.blackHole.x,
            this.blackHole.y
        );
        if (planet) {
            console.log(`🌍 Spawned ${digit === 0 ? 'Null World' : 'Unity Sphere'} planet`);
        }
        return this;
    }

    /**
     * Spawn an Ascended (tier 4) firefly
     */
    spawnAscendedFirefly() {
        if (!this.ecosystem) return this;

        const firefly = this.ecosystem.spawnFirefly({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
            y: window.innerHeight / 2 + (Math.random() - 0.5) * 200,
            tier: Firefly.TIERS.ASCENDED
        });

        if (firefly) {
            firefly.tier = Firefly.TIERS.ASCENDED;
            firefly.gravityResist = Firefly.TIERS.ASCENDED.gravityResist;
            firefly.maxAge = firefly.baseMaxAge * Firefly.TIERS.ASCENDED.lifeMultiplier;
            console.log('👑 Spawned Ascended firefly');
        }
        return this;
    }

    /**
     * Make a random firefly desperate (low energy, near death)
     */
    makeFireflyDesperate() {
        if (!this.ecosystem) return this;

        const matureFireflies = this.ecosystem.fireflies.filter(f => f.state === 'mature');
        if (matureFireflies.length === 0) return this;

        const target = matureFireflies[Math.floor(Math.random() * matureFireflies.length)];
        target.energy = 5;
        target.age = target.maxAge * 0.9; // 90% through lifespan

        console.log('💀 Made firefly desperate:', target.id);
        return this;
    }

    /**
     * Force a swarm to form
     */
    forceSwarm() {
        if (!this.swarmingSystem) {
            console.warn('Swarming system not available');
            return this;
        }
        this.swarmingSystem.tryCreateSwarm?.();
        return this;
    }

    /**
     * Force terraform by spawning 4 planets
     */
    forceTerraform() {
        if (!this.ecosystem || !this.blackHole) return this;

        // Spawn 4 planets (2 of each type)
        for (let i = 0; i < 4; i++) {
            const digit = i % 2;
            setTimeout(() => {
                this.ecosystem.createPlanet(digit, this.blackHole.x, this.blackHole.y);
            }, i * 500);
        }
        console.log('🌍 Terraform initiated - spawning 4 planets');
        return this;
    }

    /**
     * Toggle black hole active state
     */
    toggleBlackHole() {
        if (!this.blackHole) return this;

        if (this.blackHole.isActive) {
            this.blackHole.isActive = false;
            this.blackHole.opacity = 0.3;
            console.log('🕳️ Black hole deactivated');
        } else {
            this.blackHole.isActive = true;
            this.blackHole.opacity = 1;
            console.log('🕳️ Black hole activated');
        }
        this.blackHole.updateElementStyle();
        return this;
    }

    /**
     * Activate Master Key (triggered by 5 clicks on black hole)
     * Grants 5 minutes of full access to all houses and Dark Arts gates
     */
    showHouseSelector() {
        // Check if AccessGuard is available
        if (typeof AccessGuard !== 'undefined' && AccessGuard.activateMasterKey) {
            // Activate the Master Key through AccessGuard
            AccessGuard.activateMasterKey();

            // Show dramatic visual feedback
            this.showMasterKeyActivation();
        } else {
            console.warn('AccessGuard not available - Master Key cannot be activated');
        }
    }

    /**
     * Show dramatic Master Key activation effect
     */
    showMasterKeyActivation() {
        // Create dramatic flash effect
        const flash = document.createElement('div');
        flash.id = 'master-key-flash';
        flash.innerHTML = `
            <style>
                #master-key-flash {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: radial-gradient(circle at center,
                        rgba(0, 255, 0, 0.8) 0%,
                        rgba(0, 200, 0, 0.4) 30%,
                        rgba(0, 100, 0, 0.1) 60%,
                        transparent 80%
                    );
                    z-index: 99998;
                    pointer-events: none;
                    animation: masterKeyFlash 1.5s ease-out forwards;
                }
                @keyframes masterKeyFlash {
                    0% {
                        opacity: 0;
                        transform: scale(0.5);
                    }
                    20% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1.5);
                    }
                }
                .master-key-message {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    animation: masterKeyText 1.5s ease-out forwards;
                }
                @keyframes masterKeyText {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.5);
                    }
                    30% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1.1);
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                .master-key-icon {
                    font-size: 4rem;
                    text-shadow: 0 0 30px #00ff00;
                }
                .master-key-title {
                    color: #00ff00;
                    font-size: 2rem;
                    font-weight: bold;
                    letter-spacing: 0.3em;
                    text-shadow: 0 0 20px #00ff00;
                    margin: 10px 0;
                }
                .master-key-subtitle {
                    color: rgba(0, 255, 0, 0.8);
                    font-size: 1rem;
                    letter-spacing: 0.2em;
                }
            </style>
            <div class="master-key-message">
                <div class="master-key-icon">🔑</div>
                <div class="master-key-title">MASTER KEY</div>
                <div class="master-key-subtitle">5 MINUTES • ALL ACCESS</div>
            </div>
        `;

        document.body.appendChild(flash);

        // Remove after animation, then show house selector
        setTimeout(() => {
            if (flash.parentNode) {
                flash.remove();
            }
            // Show house selector panel
            this.showHouseSelectorPanel();
        }, 1500);

        // Trigger a dramatic black hole pulse
        if (this.blackHole && this.blackHole.element) {
            this.blackHole.element.style.transform = 'scale(1.5)';
            this.blackHole.element.style.filter = 'hue-rotate(120deg) brightness(2)';
            setTimeout(() => {
                if (this.blackHole && this.blackHole.element) {
                    this.blackHole.element.style.transform = '';
                    this.blackHole.element.style.filter = '';
                }
            }, 500);
        }
    }

    /**
     * Show house selector panel for quick navigation
     */
    showHouseSelectorPanel() {
        // Remove existing panel if present
        const existing = document.getElementById('house-selector-panel');
        if (existing) existing.remove();

        const houses = [
            { id: 'web', name: 'Web', icon: '🌐', color: '#3b82f6', path: 'houses/web/index.html' },
            { id: 'shield', name: 'Shield', icon: '🛡️', color: '#10b981', path: 'houses/shield/index.html' },
            { id: 'forge', name: 'Forge', icon: '🔨', color: '#f59e0b', path: 'houses/forge/index.html' },
            { id: 'script', name: 'Script', icon: '📜', color: '#8b5cf6', path: 'houses/script/index.html' },
            { id: 'cloud', name: 'Cloud', icon: '☁️', color: '#06b6d4', path: 'houses/cloud/index.html' },
            { id: 'code', name: 'Code', icon: '💻', color: '#ec4899', path: 'houses/code/index.html' },
            { id: 'key', name: 'Key', icon: '🔑', color: '#f59e0b', path: 'houses/key/index.html' },
            { id: 'eye', name: 'Eye', icon: '👁️', color: '#6366f1', path: 'houses/eye/index.html' },
            { id: 'dark-arts', name: 'Dark Arts', icon: '🌑', color: '#991b1b', path: 'dark-arts/vault/index.html' }
        ];

        const panel = document.createElement('div');
        panel.id = 'house-selector-panel';
        panel.innerHTML = `
            <style>
                #house-selector-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(10, 10, 20, 0.95);
                    border: 2px solid rgba(0, 255, 0, 0.4);
                    border-radius: 20px;
                    padding: 30px;
                    z-index: 99999;
                    box-shadow: 0 0 60px rgba(0, 255, 0, 0.3);
                    animation: panelAppear 0.3s ease-out;
                    max-width: 90vw;
                }
                @keyframes panelAppear {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                #house-selector-panel h2 {
                    text-align: center;
                    color: #00ff00;
                    font-size: 1.2rem;
                    letter-spacing: 0.2em;
                    margin: 0 0 20px 0;
                    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
                }
                .house-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                }
                .house-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 20px 15px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }
                .house-btn:hover {
                    transform: translateY(-3px);
                    border-color: var(--house-color);
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
                }
                .house-btn .icon {
                    font-size: 2rem;
                }
                .house-btn .name {
                    color: #fff;
                    font-size: 0.8rem;
                    font-weight: 500;
                    letter-spacing: 0.1em;
                }
                .close-panel {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: #666;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .close-panel:hover {
                    color: #ff4444;
                }
                @media (max-width: 500px) {
                    .house-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            </style>
            <button class="close-panel" onclick="this.parentElement.remove()">×</button>
            <h2>🔑 SELECT DESTINATION</h2>
            <div class="house-grid">
                ${houses.map(h => `
                    <a href="${h.path}" class="house-btn" style="--house-color: ${h.color}">
                        <span class="icon">${h.icon}</span>
                        <span class="name">${h.name}</span>
                    </a>
                `).join('')}
            </div>
        `;

        document.body.appendChild(panel);

        // Close on click outside
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                panel.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    /**
     * Toggle pheromone visualization (debug)
     */
    togglePheromoneVisualization() {
        if (!this.pheromoneSystem) {
            console.warn('Pheromone system not available');
            return this;
        }

        const newState = !this.pheromoneSystem.config.visualize;
        this.pheromoneSystem.toggleVisualization(newState);
        console.log(`🧪 Pheromone visualization: ${newState ? 'ON' : 'OFF'}`);
        return this;
    }

    /**
     * Toggle event log visibility
     */
    toggleEventLog() {
        if (!this.eventLog) {
            console.warn('Event log not available');
            return this;
        }
        this.eventLog.toggleExpanded();
        return this;
    }

    /**
     * Toggle statistics HUD visibility
     */
    toggleStatisticsHUD() {
        if (!this.statisticsDisplay) {
            console.warn('Statistics display not available');
            return this;
        }
        this.statisticsDisplay.toggleVisibility();
        return this;
    }

    /**
     * Reset all achievements (for testing)
     */
    resetAchievements() {
        if (!this.achievementSystem) {
            console.warn('Achievement system not available');
            return this;
        }
        this.achievementSystem.reset();
        this.eventLog?.log('SYSTEM', 'Achievements reset');
        console.log('🏆 Achievements reset');
        return this;
    }

    /**
     * Test achievement toast (spawns a sample achievement notification)
     */
    testAchievement() {
        if (!this.achievementSystem) {
            console.warn('Achievement system not available');
            return this;
        }
        // Manually trigger a toast for testing
        this.achievementSystem.showToast({
            name: 'Test Achievement',
            description: 'This is a test achievement notification',
            icon: '🎉',
            points: 100
        });
        console.log('🎉 Test achievement triggered');
        return this;
    }

    /**
     * Log a player action (for event log)
     */
    logPlayerAction(action, result = '') {
        this.eventLog?.logPlayerAction(action, result);
        return this;
    }

    /**
     * Get current achievement progress
     */
    getAchievementProgress() {
        return this.achievementSystem?.getProgress() ?? { unlocked: 0, total: 0, points: 0 };
    }

    /**
     * Export event log as text
     */
    exportEventLog() {
        return this.eventLog?.exportAsText() ?? '';
    }

    // ========================================
    // PHASE 8: AUDIO METHODS
    // ========================================

    /**
     * Toggle audio on/off
     */
    toggleAudio() {
        if (!this.soundManager) {
            // Try to enable audio if not initialized
            if (!this.config.audio.enabled) {
                this.config.audio.enabled = true;
                this.initializePhase8Systems();
                console.log('🔊 Audio enabled');
            }
            return this;
        }

        if (this.soundManager.isMuted) {
            this.soundManager.unmute();
            console.log('🔊 Audio unmuted');
        } else {
            this.soundManager.mute();
            console.log('🔇 Audio muted');
        }
        return this;
    }

    /**
     * Toggle ambient layer on/off
     */
    toggleAmbient() {
        if (!this.ambientLayer) {
            console.warn('Ambient layer not available');
            return this;
        }

        if (this.ambientLayer.isPlaying) {
            this.ambientLayer.stop();
            console.log('🔇 Ambient stopped');
        } else {
            this.ambientLayer.start();
            console.log('🎶 Ambient started');
        }
        return this;
    }

    /**
     * Test a specific sound
     */
    testSound(type) {
        // Ensure audio is initialized
        if (!this.soundManager?.isInitialized) {
            if (this.soundManager) {
                this.soundManager.init();
            } else {
                console.warn('Sound manager not available. Enable audio in config.');
                return this;
            }
        }

        switch (type) {
            case 'birth':
                this.eventSounds?.playBirth({ tier: { level: 2 } });
                break;
            case 'death':
                this.eventSounds?.playDeath({ tier: { level: 1 } }, 'natural');
                break;
            case 'evolution':
                this.eventSounds?.playEvolution({}, { level: 1 }, { level: 2 });
                break;
            case 'cosmic':
                this.eventSounds?.playSolarFlare('start');
                break;
            case 'golden':
                this.eventSounds?.playGoldenSpawn();
                break;
            case 'diamond':
                this.eventSounds?.playDiamondSpawn();
                break;
            case 'glitch':
                this.eventSounds?.playGlitchSpawn();
                break;
            case 'ancient':
                this.eventSounds?.playAncientSpawn();
                break;
            case 'achievement':
                this.eventSounds?.playAchievement();
                break;
            // Cosmic events
            case 'shootingStar':
                this.eventSounds?.playShootingStar();
                break;
            case 'solarFlare':
                this.eventSounds?.playSolarFlare('start');
                break;
            case 'meteorShower':
                this.eventSounds?.playMeteorShower();
                break;
            case 'voidStorm':
                this.eventSounds?.playVoidStorm('start');
                break;
            case 'eclipse':
                this.eventSounds?.playEclipse('start');
                break;
            case 'nebula':
                this.eventSounds?.playNebulaDrift();
                break;
            // Predators
            case 'shadow':
                this.eventSounds?.playShadowAppear();
                break;
            case 'serpent':
                this.eventSounds?.playVoidSerpent();
                break;
            case 'parasite':
                this.eventSounds?.playParasiteAttach();
                break;
            default:
                console.log('Unknown sound type:', type);
        }
        return this;
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.soundManager?.setMasterVolume(volume);
        return this;
    }

    /**
     * Set ambient volume
     */
    setAmbientVolume(volume) {
        this.soundManager?.setCategoryVolume('ambient', volume);
        return this;
    }

    /**
     * Set event sounds volume
     */
    setEventVolume(volume) {
        this.soundManager?.setCategoryVolume('event', volume);
        return this;
    }

    /**
     * Get audio stats
     */
    getAudioStats() {
        return {
            soundManager: this.soundManager?.getStats() ?? { initialized: false },
            ambient: this.ambientLayer?.getState() ?? { isPlaying: false },
            eventsEnabled: this.eventSounds?.config.enabled ?? false
        };
    }

    /**
     * Clean up everything
     */
    destroy() {
        // Stop animation loop
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Remove mouse handler
        if (this.mouseHandler) {
            document.removeEventListener('mousemove', this.mouseHandler);
        }

        // Destroy behavior systems
        this.interactionSystem?.destroy?.();
        this.ambientEffects?.destroy?.();

        // Destroy Phase 2 systems
        for (const well of this.energyWells) {
            well.destroy();
        }
        this.energyWells = [];

        for (const star of this.predatorStars) {
            star.destroy();
        }
        this.predatorStars = [];

        this.pheromoneSystem?.destroy?.();
        this.pheromoneSystem = null;
        this.geneticsSystem = null;

        // Destroy cosmic event manager
        this.cosmicEventManager?.destroy?.();
        this.cosmicEventManager = null;

        // Destroy predator manager (Phase 5)
        this.predatorManager?.destroy?.();
        this.predatorManager = null;

        // Destroy Phase 6 systems
        this.playerTools?.destroy?.();
        this.playerTools = null;

        this.portalManager?.destroy?.();
        this.portalManager = null;

        this.sanctuaryManager?.destroy?.();
        this.sanctuaryManager = null;

        // Destroy Phase 7 systems
        this.achievementSystem?.destroy?.();
        this.achievementSystem = null;

        this.statisticsDisplay?.destroy?.();
        this.statisticsDisplay = null;

        this.eventLog?.destroy?.();
        this.eventLog = null;

        // Destroy Phase 8 audio systems
        this.ambientLayer?.destroy?.();
        this.ambientLayer = null;

        this.eventSounds = null;

        this.soundManager?.destroy?.();
        this.soundManager = null;

        // Destroy trail system
        this.trailSystem?.destroy?.();
        this.trailSystem = null;

        // Destroy core systems
        this.shootingStarSystem?.destroy();
        this.blackHole?.destroy();
        this.particleSystem?.destroy();
        this.ecosystem?.destroy();

        // Clear behavior system references
        this.huntingSystem = null;
        this.swarmingSystem = null;
        this.constellationSystem = null;
        this.reproductionSystem = null;
        this.housePersonalitySystem = null;
        this.rareFireflySystem = null;
        this.interactionSystem = null;
        this.environmentalSystem = null;
        this.ambientEffects = null;

        // Remove stats
        if (this.statsElement && this.statsElement.parentNode) {
            this.statsElement.parentNode.removeChild(this.statsElement);
        }

        // Remove debug controls
        if (this.debugElement && this.debugElement.parentNode) {
            this.debugElement.parentNode.removeChild(this.debugElement);
        }

        // Remove container
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Remove styles
        const styles = document.getElementById('digital-life-styles');
        if (styles && styles.parentNode) {
            styles.parentNode.removeChild(styles);
        }

        // Remove debug styles
        const debugStyles = document.getElementById('digital-life-debug-styles');
        if (debugStyles && debugStyles.parentNode) {
            debugStyles.parentNode.removeChild(debugStyles);
        }

        this.isInitialized = false;
        this.isRunning = false;

        console.log('Digital Life destroyed');

        return this;
    }

    /**
     * Spawn a rare firefly (for testing)
     * @param {string} type - 'golden', 'diamond', 'glitch', or 'ancient'
     */
    spawnRare(type = 'golden') {
        if (!this.rareFireflySystem) {
            console.warn('RareFireflySystem not available');
            return null;
        }
        return this.rareFireflySystem.forceSpawnRare(type);
    }

    /**
     * Get environmental state (time of day, weather)
     */
    getEnvironmentState() {
        return this.environmentalSystem?.getState() ?? {};
    }

    /**
     * Get swarm stats
     */
    getSwarmStats() {
        return this.swarmingSystem?.getStats() ?? {};
    }

    /**
     * Get constellation stats
     */
    getConstellationStats() {
        return this.constellationSystem?.getStats() ?? {};
    }

    /**
     * Get house personality stats
     */
    getHouseStats() {
        return this.housePersonalitySystem?.getStats() ?? {};
    }

    /**
     * Set the dominant house for firefly personalities
     * Fireflies will be biased toward exhibiting this house's behaviors
     * @param {string} houseKey - The house key ('web', 'shield', 'forge', 'script', 'cloud', 'darkarts')
     * @param {number} weight - Weight from 0-1 (default 0.6 = 60% chance)
     */
    setDominantHouse(houseKey, weight = 0.6) {
        if (this.housePersonalitySystem) {
            this.housePersonalitySystem.setDominantHouse(houseKey, weight);
            console.log(`🏠 Digital Life: Dominant house set to ${houseKey} (${weight * 100}% bias)`);
        }
        return this;
    }

    /**
     * Clear the dominant house (return to random distribution)
     */
    clearDominantHouse() {
        if (this.housePersonalitySystem) {
            this.housePersonalitySystem.clearDominantHouse();
            console.log('🏠 Digital Life: Dominant house cleared');
        }
        return this;
    }

    /**
     * Get rare firefly stats
     */
    getRareStats() {
        return this.rareFireflySystem?.getStats() ?? {};
    }
}

// ========================================
// PRESET CONFIGURATIONS
// ========================================

/**
 * Ambient Mode Configuration
 * For use as a non-intrusive background decoration.
 * Disables all UI overlays and aggressive features.
 */
DigitalLife.AMBIENT_CONFIG = {
    population: {
        initial: 15,
        min: 10,
        max: 30
    },
    // Disable all UI overlays
    achievements: {
        enabled: false,
        showUI: false
    },
    statistics: {
        enabled: false,
        showHUD: false
    },
    eventLog: {
        enabled: false,
        showUI: false
    },
    playerTools: {
        enabled: false,
        showUI: false
    },
    // Reduce dramatic events
    cosmicEvents: {
        enabled: true,
        baseEventChance: 0.02,  // 2% - rare and subtle
        maxConcurrentEvents: 1,
        announceEvents: false
    },
    // Minimal predators
    predators: {
        enabled: true,
        shadows: { enabled: true, maxPopulation: 1 },
        serpent: { enabled: false },
        parasites: { enabled: false }
    },
    // Keep visuals gentle
    blackHole: {
        enabled: true,
        gravityStrength: 0.05  // Weaker pull
    },
    // Audio off by default for ambient
    audio: {
        enabled: false
    }
};

/**
 * Full Experience Configuration
 * All features enabled for interactive exploration.
 */
DigitalLife.FULL_CONFIG = {
    population: {
        initial: 25,
        min: 15,
        max: 50
    },
    achievements: { enabled: true, showUI: true },
    statistics: { enabled: true, showHUD: true },
    eventLog: { enabled: true, showUI: true },
    playerTools: { enabled: true, showUI: true },
    cosmicEvents: {
        enabled: true,
        baseEventChance: 0.06  // 6% chance per check
    },
    predators: { enabled: true },
    audio: { enabled: false }  // Still requires user gesture
};

/**
 * Theme Definitions
 * Define color schemes for different visual modes.
 */
DigitalLife.THEMES = {
    magic: {
        name: 'Magic',
        accent: '#9f7aea',
        glow: 'rgba(159, 122, 234, 0.6)',
        tiers: {
            BASIC: { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.6)' },
            CHARGED: { color: '#9f7aea', glow: 'rgba(159, 122, 234, 0.6)' },
            RADIANT: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)' },
            PRISMATIC: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)' },
            ASCENDED: { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.6)' }
        }
    },
    matrix: {
        name: 'Matrix',
        accent: '#00ff41',
        glow: 'rgba(0, 255, 65, 0.6)',
        tiers: {
            BASIC: { color: '#00aa2a', glow: 'rgba(0, 170, 42, 0.6)' },
            CHARGED: { color: '#00ff41', glow: 'rgba(0, 255, 65, 0.6)' },
            RADIANT: { color: '#33ff66', glow: 'rgba(51, 255, 102, 0.6)' },
            PRISMATIC: { color: '#66ff99', glow: 'rgba(102, 255, 153, 0.6)' },
            ASCENDED: { color: '#99ffbb', glow: 'rgba(153, 255, 187, 0.8)' }
        }
    }
};

/**
 * Apply theme to Firefly tier colors
 * @param {string} themeName - Theme to apply ('magic' or 'matrix')
 */
DigitalLife.applyTheme = function(themeName) {
    const theme = DigitalLife.THEMES[themeName];
    if (!theme) return;

    // Update Firefly tier colors
    if (typeof Firefly !== 'undefined') {
        Object.keys(theme.tiers).forEach(tierName => {
            if (Firefly.TIERS[tierName]) {
                Firefly.TIERS[tierName].color = theme.tiers[tierName].color;
                Firefly.TIERS[tierName].glowColor = theme.tiers[tierName].glow;
            }
        });
    }

    console.log(`✨ Digital Life theme applied: ${theme.name}`);
};

/**
 * Create an ambient-mode instance (convenience factory)
 * Auto-detects theme from localStorage
 * @param {Object} overrides - Additional config overrides
 * @returns {DigitalLife}
 */
DigitalLife.createAmbient = function(overrides = {}) {
    // Auto-detect theme from localStorage
    const storedTheme = localStorage.getItem('hexworth_theme') || 'magic';
    const theme = DigitalLife.THEMES[storedTheme] || DigitalLife.THEMES.magic;

    // Apply theme colors to Firefly tiers
    DigitalLife.applyTheme(storedTheme);

    // Create instance with theme config
    const instance = new DigitalLife({
        ...DigitalLife.AMBIENT_CONFIG,
        theme: storedTheme,
        themeColors: theme,
        ...overrides
    });

    return instance;
};

/**
 * Create a full-experience instance (convenience factory)
 * Auto-detects theme from localStorage
 * @param {Object} overrides - Additional config overrides
 * @returns {DigitalLife}
 */
DigitalLife.createFull = function(overrides = {}) {
    // Auto-detect theme from localStorage
    const storedTheme = localStorage.getItem('hexworth_theme') || 'magic';
    const theme = DigitalLife.THEMES[storedTheme] || DigitalLife.THEMES.magic;

    // Apply theme colors to Firefly tiers
    DigitalLife.applyTheme(storedTheme);

    return new DigitalLife({
        ...DigitalLife.FULL_CONFIG,
        theme: storedTheme,
        themeColors: theme,
        ...overrides
    });
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DigitalLife;
}

// Also expose globally for non-module usage
if (typeof window !== 'undefined') {
    window.DigitalLife = DigitalLife;
}
