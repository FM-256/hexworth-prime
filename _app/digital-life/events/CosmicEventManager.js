/**
 * CosmicEventManager.js - Orchestrates Dynamic Cosmic Events
 *
 * Manages all cosmic events in the Digital Life ecosystem:
 * - Schedules events based on time and probability
 * - Prevents event overlap (or allows synergistic combos)
 * - Coordinates event effects on fireflies and entities
 * - Provides visual and audio cues for events
 *
 * Event Types:
 * - SOLAR_FLARE: Energy boost across screen
 * - METEOR_SHOWER: Multiple shooting stars
 * - VOID_STORM: Gravity distortions
 * - ECLIPSE: Darkness, brighter glows
 * - NEBULA_DRIFT: Colored gas clouds
 * - COMET: Rare long-tail visitor
 */

class CosmicEventManager {
    static EVENT_TYPES = {
        SOLAR_FLARE: {
            name: 'Solar Flare',
            rarity: 0.3,            // 30% of event rolls
            minDuration: 5000,
            maxDuration: 15000,
            cooldown: 60000,        // 1 minute between same event
            priority: 2,
            allowOverlap: ['NEBULA_DRIFT'],
            icon: '☀️'
        },
        METEOR_SHOWER: {
            name: 'Meteor Shower',
            rarity: 0.25,
            minDuration: 10000,
            maxDuration: 30000,
            cooldown: 90000,
            priority: 1,
            allowOverlap: ['SOLAR_FLARE', 'ECLIPSE'],
            icon: '☄️'
        },
        VOID_STORM: {
            name: 'Void Storm',
            rarity: 0.15,
            minDuration: 8000,
            maxDuration: 20000,
            cooldown: 120000,       // 2 minutes
            priority: 3,
            allowOverlap: [],       // No overlap - too chaotic
            icon: '🌀'
        },
        ECLIPSE: {
            name: 'Eclipse',
            rarity: 0.15,
            minDuration: 15000,
            maxDuration: 45000,
            cooldown: 180000,       // 3 minutes
            priority: 2,
            allowOverlap: ['METEOR_SHOWER'],
            icon: '🌑'
        },
        NEBULA_DRIFT: {
            name: 'Nebula Drift',
            rarity: 0.1,
            minDuration: 20000,
            maxDuration: 60000,
            cooldown: 150000,
            priority: 1,
            allowOverlap: ['SOLAR_FLARE', 'METEOR_SHOWER', 'ECLIPSE'],
            icon: '🌌'
        },
        COMET: {
            name: 'Comet Passage',
            rarity: 0.05,           // Rare!
            minDuration: 8000,
            maxDuration: 15000,
            cooldown: 300000,       // 5 minutes
            priority: 4,            // Highest priority
            allowOverlap: ['NEBULA_DRIFT'],
            icon: '💫'
        }
    };

    constructor(config = {}) {
        this.config = {
            enabled: true,
            eventCheckInterval: config.eventCheckInterval ?? 10000, // Check every 10s
            baseEventChance: config.baseEventChance ?? 0.15,        // 15% chance per check
            maxConcurrentEvents: config.maxConcurrentEvents ?? 2,
            announceEvents: config.announceEvents ?? true,
            ...config
        };

        // Active events
        this.activeEvents = new Map();  // eventType -> eventInstance

        // Event cooldowns (last trigger time)
        this.cooldowns = new Map();

        // Event history for stats
        this.history = [];
        this.maxHistorySize = 50;

        // References to other systems
        this.ecosystem = null;
        this.particleSystem = null;
        this.shootingStarSystem = null;
        this.blackHole = null;

        // Timing
        this.lastEventCheck = 0;
        this.isRunning = false;

        // Container for event visuals
        this.container = null;
        this.overlayElement = null;

        // Callbacks
        this.onEventStart = null;
        this.onEventEnd = null;

        // Event handlers (set by individual event classes)
        this.eventHandlers = new Map();
    }

    /**
     * Initialize the event manager
     */
    init(container) {
        this.container = container;
        this.createOverlayElement();
        this.injectStyles();
        this.isRunning = true;
        return this;
    }

    /**
     * Set ecosystem reference
     */
    setEcosystem(ecosystem) {
        this.ecosystem = ecosystem;
        return this;
    }

    /**
     * Set particle system reference
     */
    setParticleSystem(particleSystem) {
        this.particleSystem = particleSystem;
        return this;
    }

    /**
     * Set shooting star system reference
     */
    setShootingStarSystem(shootingStarSystem) {
        this.shootingStarSystem = shootingStarSystem;
        return this;
    }

    /**
     * Set black hole reference
     */
    setBlackHole(blackHole) {
        this.blackHole = blackHole;
        return this;
    }

    /**
     * Register an event handler class
     */
    registerEventHandler(eventType, handler) {
        this.eventHandlers.set(eventType, handler);
        return this;
    }

    /**
     * Create overlay element for screen effects
     */
    createOverlayElement() {
        this.overlayElement = document.createElement('div');
        this.overlayElement.className = 'cosmic-event-overlay';
        this.overlayElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
            opacity: 0;
            transition: opacity 1s ease;
        `;
        this.container.appendChild(this.overlayElement);

        // Announcement element
        this.announcementElement = document.createElement('div');
        this.announcementElement.className = 'cosmic-event-announcement';
        this.container.appendChild(this.announcementElement);
    }

    /**
     * Main update loop
     */
    update(deltaTime, timestamp) {
        if (!this.config.enabled || !this.isRunning) return;

        // Check for new events periodically
        if (timestamp - this.lastEventCheck > this.config.eventCheckInterval) {
            this.lastEventCheck = timestamp;
            this.checkForNewEvent(timestamp);
        }

        // Update active events
        for (const [eventType, eventData] of this.activeEvents) {
            // Check if event has expired
            if (timestamp > eventData.endTime) {
                this.endEvent(eventType, timestamp);
                continue;
            }

            // Update event
            const handler = this.eventHandlers.get(eventType);
            if (handler?.update) {
                handler.update(deltaTime, timestamp, eventData, this);
            }
        }
    }

    /**
     * Check if we should trigger a new event
     */
    checkForNewEvent(timestamp) {
        // Random chance to trigger event
        if (Math.random() > this.config.baseEventChance) return;

        // Check if we can have more concurrent events
        if (this.activeEvents.size >= this.config.maxConcurrentEvents) return;

        // Build list of available events
        const availableEvents = [];
        for (const [type, eventConfig] of Object.entries(CosmicEventManager.EVENT_TYPES)) {
            // Check cooldown
            const lastTrigger = this.cooldowns.get(type) || 0;
            if (timestamp - lastTrigger < eventConfig.cooldown) continue;

            // Check overlap rules
            if (!this.canOverlap(type)) continue;

            // Add to pool with weighted rarity
            availableEvents.push({ type, weight: eventConfig.rarity });
        }

        if (availableEvents.length === 0) return;

        // Weighted random selection
        const totalWeight = availableEvents.reduce((sum, e) => sum + e.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const event of availableEvents) {
            roll -= event.weight;
            if (roll <= 0) {
                this.startEvent(event.type, timestamp);
                break;
            }
        }
    }

    /**
     * Check if event can overlap with current active events
     */
    canOverlap(eventType) {
        const eventConfig = CosmicEventManager.EVENT_TYPES[eventType];

        for (const activeType of this.activeEvents.keys()) {
            // Check if new event allows overlap with active
            if (!eventConfig.allowOverlap.includes(activeType)) {
                // Check if active event allows overlap with new
                const activeConfig = CosmicEventManager.EVENT_TYPES[activeType];
                if (!activeConfig.allowOverlap.includes(eventType)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Start a cosmic event
     */
    startEvent(eventType, timestamp) {
        const eventConfig = CosmicEventManager.EVENT_TYPES[eventType];
        const handler = this.eventHandlers.get(eventType);

        // Calculate duration
        const duration = eventConfig.minDuration +
            Math.random() * (eventConfig.maxDuration - eventConfig.minDuration);

        const eventData = {
            type: eventType,
            config: eventConfig,
            startTime: timestamp,
            endTime: timestamp + duration,
            duration: duration,
            progress: 0,
            intensity: 0.5 + Math.random() * 0.5, // 50-100% intensity
            data: {} // Event-specific data
        };

        // Initialize event via handler
        if (handler?.start) {
            handler.start(eventData, this);
        }

        this.activeEvents.set(eventType, eventData);
        this.cooldowns.set(eventType, timestamp);

        // Record history
        this.history.push({
            type: eventType,
            startTime: timestamp,
            duration: duration
        });
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }

        // Announce
        if (this.config.announceEvents) {
            this.announce(eventConfig.icon + ' ' + eventConfig.name);
        }

        // Callback
        if (this.onEventStart) {
            this.onEventStart(eventType, eventData);
        }

        console.log(`🌌 Cosmic Event: ${eventConfig.name} started (${(duration/1000).toFixed(1)}s)`);
    }

    /**
     * End a cosmic event
     */
    endEvent(eventType, timestamp) {
        const eventData = this.activeEvents.get(eventType);
        if (!eventData) return;

        const handler = this.eventHandlers.get(eventType);
        if (handler?.end) {
            handler.end(eventData, this);
        }

        this.activeEvents.delete(eventType);

        // Callback
        if (this.onEventEnd) {
            this.onEventEnd(eventType, eventData);
        }

        console.log(`🌌 Cosmic Event: ${eventData.config.name} ended`);
    }

    /**
     * Force trigger a specific event (for debugging)
     */
    forceEvent(eventType) {
        if (!CosmicEventManager.EVENT_TYPES[eventType]) {
            console.warn(`Unknown event type: ${eventType}`);
            return null;
        }

        // End any conflicting events
        for (const activeType of this.activeEvents.keys()) {
            if (!this.canOverlapWith(eventType, activeType)) {
                this.endEvent(activeType, performance.now());
            }
        }

        this.startEvent(eventType, performance.now());
        return this.activeEvents.get(eventType);
    }

    /**
     * Check if two specific events can overlap
     */
    canOverlapWith(type1, type2) {
        const config1 = CosmicEventManager.EVENT_TYPES[type1];
        const config2 = CosmicEventManager.EVENT_TYPES[type2];
        return config1.allowOverlap.includes(type2) || config2.allowOverlap.includes(type1);
    }

    /**
     * Display announcement
     */
    announce(message) {
        this.announcementElement.textContent = message;
        this.announcementElement.classList.add('show');

        setTimeout(() => {
            this.announcementElement.classList.remove('show');
        }, 3000);
    }

    /**
     * Set overlay effect
     */
    setOverlay(color, opacity) {
        this.overlayElement.style.background = color;
        this.overlayElement.style.opacity = opacity;
    }

    /**
     * Clear overlay
     */
    clearOverlay() {
        this.overlayElement.style.opacity = '0';
    }

    /**
     * Get active event modifiers for fireflies
     */
    getModifiers() {
        const modifiers = {
            energyMultiplier: 1,
            speedMultiplier: 1,
            glowMultiplier: 1,
            gravityMultiplier: 1,
            spawnRateMultiplier: 1,
            deathRateMultiplier: 1
        };

        for (const [eventType, eventData] of this.activeEvents) {
            const handler = this.eventHandlers.get(eventType);
            if (handler?.getModifiers) {
                const eventMods = handler.getModifiers(eventData);
                for (const [key, value] of Object.entries(eventMods)) {
                    if (modifiers[key] !== undefined) {
                        modifiers[key] *= value;
                    }
                }
            }
        }

        return modifiers;
    }

    /**
     * Check if a specific event is active
     */
    isEventActive(eventType) {
        return this.activeEvents.has(eventType);
    }

    /**
     * Get all active event types
     */
    getActiveEventTypes() {
        return Array.from(this.activeEvents.keys());
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            activeEvents: this.getActiveEventTypes(),
            totalTriggered: this.history.length,
            recentEvents: this.history.slice(-5).map(h => h.type)
        };
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('cosmic-event-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'cosmic-event-styles';
        styles.textContent = `
            .cosmic-event-overlay {
                mix-blend-mode: screen;
            }

            .cosmic-event-announcement {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                font-family: 'Courier New', monospace;
                font-size: 2rem;
                font-weight: bold;
                color: #fff;
                text-shadow:
                    0 0 20px rgba(159, 122, 234, 0.8),
                    0 0 40px rgba(159, 122, 234, 0.6),
                    0 0 60px rgba(159, 122, 234, 0.4);
                pointer-events: none;
                opacity: 0;
                z-index: 100;
                transition: all 0.5s ease;
                letter-spacing: 0.2em;
            }

            .cosmic-event-announcement.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            @keyframes cosmicPulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            @keyframes solarFlare {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes voidSwirl {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Pause event checking
     */
    pause() {
        this.isRunning = false;
    }

    /**
     * Resume event checking
     */
    resume() {
        this.isRunning = true;
    }

    /**
     * Destroy the manager
     */
    destroy() {
        // End all active events
        for (const eventType of this.activeEvents.keys()) {
            this.endEvent(eventType, performance.now());
        }

        // Remove DOM elements
        if (this.overlayElement?.parentNode) {
            this.overlayElement.parentNode.removeChild(this.overlayElement);
        }
        if (this.announcementElement?.parentNode) {
            this.announcementElement.parentNode.removeChild(this.announcementElement);
        }

        this.activeEvents.clear();
        this.cooldowns.clear();
        this.eventHandlers.clear();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CosmicEventManager;
}
