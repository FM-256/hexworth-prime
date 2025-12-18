/**
 * EnvironmentalSystem.js - Time of Day & Activity Response
 *
 * Fireflies respond to environmental conditions:
 * - Time of day affects activity levels and colors
 * - Mouse activity/inactivity changes behavior
 * - Special events at dawn/dusk
 * - Weather-like ambient effects
 */

class EnvironmentalSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            // Time simulation
            useRealTime: config.useRealTime ?? false,  // Use actual time vs simulated
            simulatedDayLength: config.simulatedDayLength ?? 120000, // 2 min day cycle
            // Activity detection
            inactivityThreshold: config.inactivityThreshold ?? 5000, // 5 seconds
            // Behavior modifiers
            nightActivityBoost: config.nightActivityBoost ?? 1.5,
            dayActivityReduction: config.dayActivityReduction ?? 0.7,
            ...config
        };

        // Time periods and their properties
        this.timePeriods = {
            dawn: {
                name: 'Dawn',
                hourRange: [5, 7],
                simRange: [0.20, 0.29],
                ambientColor: '#fcd34d',
                glowIntensity: 0.8,
                activityLevel: 0.9,
                specialEvent: 'awakening'
            },
            morning: {
                name: 'Morning',
                hourRange: [7, 12],
                simRange: [0.29, 0.50],
                ambientColor: '#fef3c7',
                glowIntensity: 0.5,
                activityLevel: 0.6,
                specialEvent: null
            },
            afternoon: {
                name: 'Afternoon',
                hourRange: [12, 17],
                simRange: [0.50, 0.71],
                ambientColor: '#fed7aa',
                glowIntensity: 0.4,
                activityLevel: 0.5,
                specialEvent: null
            },
            dusk: {
                name: 'Dusk',
                hourRange: [17, 20],
                simRange: [0.71, 0.83],
                ambientColor: '#c084fc',
                glowIntensity: 0.9,
                activityLevel: 1.2,
                specialEvent: 'gathering'
            },
            evening: {
                name: 'Evening',
                hourRange: [20, 23],
                simRange: [0.83, 0.96],
                ambientColor: '#6366f1',
                glowIntensity: 1.0,
                activityLevel: 1.0,
                specialEvent: null
            },
            night: {
                name: 'Night',
                hourRange: [23, 5],
                simRange: [0.96, 0.20],
                ambientColor: '#1e1b4b',
                glowIntensity: 1.2,
                activityLevel: 0.8,
                specialEvent: 'dreaming'
            }
        };

        // Weather states
        this.weatherStates = {
            clear: { windForce: 0, particleRate: 0, visibility: 1.0 },
            windy: { windForce: 0.02, particleRate: 0.1, visibility: 1.0 },
            stormy: { windForce: 0.05, particleRate: 0.3, visibility: 0.7 },
            calm: { windForce: 0, particleRate: 0, visibility: 1.0 }
        };

        this.ecosystem = null;
        this.particleSystem = null;

        // State
        this.currentPeriod = null;
        this.currentWeather = 'clear';
        this.simulatedTime = 0;
        this.lastActivityTime = Date.now();
        this.isUserActive = true;
        this.lastSpecialEvent = null;
        this.windDirection = { x: 1, y: 0 };
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
        if (!this.config.enabled) return;

        // Update simulated time
        this.simulatedTime += deltaTime / this.config.simulatedDayLength;
        if (this.simulatedTime > 1) this.simulatedTime -= 1;

        // Determine current time period
        const newPeriod = this.getCurrentPeriod();
        if (newPeriod !== this.currentPeriod) {
            this.handlePeriodChange(this.currentPeriod, newPeriod);
            this.currentPeriod = newPeriod;
        }

        // Check user activity
        this.updateActivityState();

        // Apply environmental effects
        this.applyEnvironmentalEffects(deltaTime);

        // Weather effects
        this.applyWeatherEffects(deltaTime);

        // Random weather changes
        if (Math.random() < 0.0001) {
            this.changeWeather();
        }
    }

    /**
     * Get current time period based on time source
     */
    getCurrentPeriod() {
        if (this.config.useRealTime) {
            const hour = new Date().getHours();
            for (const [key, period] of Object.entries(this.timePeriods)) {
                const [start, end] = period.hourRange;
                if (start < end) {
                    if (hour >= start && hour < end) return key;
                } else {
                    // Wraps around midnight (night)
                    if (hour >= start || hour < end) return key;
                }
            }
        } else {
            // Use simulated time
            for (const [key, period] of Object.entries(this.timePeriods)) {
                const [start, end] = period.simRange;
                if (start < end) {
                    if (this.simulatedTime >= start && this.simulatedTime < end) return key;
                } else {
                    // Wraps around (night)
                    if (this.simulatedTime >= start || this.simulatedTime < end) return key;
                }
            }
        }
        return 'evening'; // Default
    }

    /**
     * Handle transition between time periods
     */
    handlePeriodChange(oldPeriod, newPeriod) {
        const periodDef = this.timePeriods[newPeriod];

        // Trigger special event if applicable
        if (periodDef.specialEvent && periodDef.specialEvent !== this.lastSpecialEvent) {
            this.triggerSpecialEvent(periodDef.specialEvent);
            this.lastSpecialEvent = periodDef.specialEvent;
        }

        // Update ambient colors (would affect CSS variables in real implementation)
        this.updateAmbientColors(periodDef);
    }

    /**
     * Trigger special time-based events
     */
    triggerSpecialEvent(eventType) {
        if (!this.ecosystem || !this.particleSystem) return;

        switch (eventType) {
            case 'awakening':
                // Dawn - fireflies become more active, burst of energy
                this.createAwakeningEffect();
                break;
            case 'gathering':
                // Dusk - fireflies start to gather in groups
                this.createGatheringEffect();
                break;
            case 'dreaming':
                // Night - fireflies slow down, dreamy particles
                this.createDreamingEffect();
                break;
        }
    }

    /**
     * Update user activity state
     */
    updateActivityState() {
        const now = Date.now();
        const timeSinceActivity = now - this.lastActivityTime;

        const wasActive = this.isUserActive;
        this.isUserActive = timeSinceActivity < this.config.inactivityThreshold;

        // Handle transition to inactive
        if (wasActive && !this.isUserActive) {
            this.handleUserBecameInactive();
        } else if (!wasActive && this.isUserActive) {
            this.handleUserBecameActive();
        }
    }

    /**
     * Called when user input is detected (from InteractionSystem)
     */
    registerActivity() {
        this.lastActivityTime = Date.now();
    }

    /**
     * Handle user becoming inactive
     */
    handleUserBecameInactive() {
        if (!this.ecosystem) return;

        // Fireflies become more autonomous/curious
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state === 'mature') {
                firefly.autonomyBoost = 1.5;
                firefly.curiosityMode = true;
            }
        }
    }

    /**
     * Handle user becoming active
     */
    handleUserBecameActive() {
        if (!this.ecosystem) return;

        // Fireflies return to normal behavior
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state === 'mature') {
                firefly.autonomyBoost = 1.0;
                firefly.curiosityMode = false;
            }
        }
    }

    /**
     * Apply time-of-day effects to fireflies
     */
    applyEnvironmentalEffects(deltaTime) {
        if (!this.ecosystem || !this.currentPeriod) return;

        const periodDef = this.timePeriods[this.currentPeriod];

        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state !== 'mature') continue;

            // Activity level modifier
            firefly.activityMultiplier = periodDef.activityLevel;

            // Glow intensity based on time
            firefly.environmentalGlow = periodDef.glowIntensity;

            // Night-specific behaviors
            if (this.currentPeriod === 'night' || this.currentPeriod === 'evening') {
                // More likely to blink
                if (!firefly.blinking && Math.random() < 0.001) {
                    firefly.startBlink?.();
                }
            }

            // User inactivity effects
            if (!this.isUserActive) {
                // Wander more freely
                if (Math.random() < 0.002) {
                    const wanderAngle = Math.random() * Math.PI * 2;
                    firefly.applyForce(
                        Math.cos(wanderAngle) * 0.02,
                        Math.sin(wanderAngle) * 0.02
                    );
                }
            }
        }
    }

    /**
     * Apply weather effects
     */
    applyWeatherEffects(deltaTime) {
        if (!this.ecosystem) return;

        const weather = this.weatherStates[this.currentWeather];

        // Wind effect
        if (weather.windForce > 0) {
            for (const firefly of this.ecosystem.fireflies) {
                if (firefly.state !== 'mature') continue;

                firefly.applyForce(
                    this.windDirection.x * weather.windForce,
                    this.windDirection.y * weather.windForce
                );
            }

            // Wind particles
            if (this.particleSystem && Math.random() < weather.particleRate) {
                this.createWindParticle();
            }
        }
    }

    /**
     * Change weather randomly
     */
    changeWeather() {
        const weathers = Object.keys(this.weatherStates);
        const newWeather = weathers[Math.floor(Math.random() * weathers.length)];

        if (newWeather !== this.currentWeather) {
            this.currentWeather = newWeather;

            // Random wind direction
            const angle = Math.random() * Math.PI * 2;
            this.windDirection = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
        }
    }

    /**
     * Create awakening (dawn) effect
     */
    createAwakeningEffect() {
        if (!this.particleSystem || !this.ecosystem) return;

        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;

        // Burst of golden particles
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * screenWidth;
            const y = screenHeight + 20;

            this.particleSystem.createParticle({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: -1 - Math.random() * 2,
                text: '☀',
                size: 8 + Math.random() * 6,
                life: 2000,
                fadeRate: 0.006,
                type: 'awakening',
                color: '#fcd34d'
            });
        }

        // Boost energy for all fireflies
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state === 'mature') {
                firefly.energy = Math.min(100, firefly.energy + 20);
            }
        }
    }

    /**
     * Create gathering (dusk) effect
     */
    createGatheringEffect() {
        if (!this.particleSystem || !this.ecosystem) return;

        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;

        // Purple/orange transition particles
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * screenWidth;
            const y = Math.random() * screenHeight * 0.3;

            this.particleSystem.createParticle({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: 0.3 + Math.random() * 0.5,
                text: '✧',
                size: 6 + Math.random() * 4,
                life: 3000,
                fadeRate: 0.004,
                type: 'gathering',
                color: Math.random() > 0.5 ? '#c084fc' : '#fb923c'
            });
        }

        // Increase cohesion for fireflies
        for (const firefly of this.ecosystem.fireflies) {
            if (firefly.state === 'mature') {
                firefly.gatheringMode = true;
                setTimeout(() => {
                    firefly.gatheringMode = false;
                }, 10000);
            }
        }
    }

    /**
     * Create dreaming (night) effect
     */
    createDreamingEffect() {
        if (!this.particleSystem || !this.ecosystem) return;

        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;

        // Slow floating dream particles
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * screenWidth;
            const y = Math.random() * screenHeight;

            this.particleSystem.createParticle({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.2,
                vy: -0.1 - Math.random() * 0.2,
                text: '○',
                size: 4 + Math.random() * 3,
                life: 5000,
                fadeRate: 0.002,
                type: 'dreaming',
                color: '#818cf8',
                friction: 0.99
            });
        }
    }

    /**
     * Create wind particle
     */
    createWindParticle() {
        if (!this.particleSystem) return;

        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 800;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight || 600;
        const x = this.windDirection.x > 0 ? -10 : screenWidth + 10;
        const y = Math.random() * screenHeight;

        this.particleSystem.createParticle({
            x: x,
            y: y,
            vx: this.windDirection.x * 4,
            vy: this.windDirection.y * 2 + (Math.random() - 0.5),
            text: '~',
            size: 8,
            life: 3000,
            fadeRate: 0.004,
            type: 'wind',
            color: 'rgba(255, 255, 255, 0.3)'
        });
    }

    /**
     * Update ambient colors (for external systems)
     */
    updateAmbientColors(periodDef) {
        // This could set CSS variables on the container
        // For now, just store for reference
        this.currentAmbientColor = periodDef.ambientColor;
    }

    /**
     * Get current state
     */
    getState() {
        const periodDef = this.timePeriods[this.currentPeriod] || {};
        return {
            period: this.currentPeriod,
            periodName: periodDef.name || 'Unknown',
            weather: this.currentWeather,
            isUserActive: this.isUserActive,
            simulatedTime: this.simulatedTime,
            ambientColor: this.currentAmbientColor,
            glowIntensity: periodDef.glowIntensity
        };
    }

    /**
     * Set time manually (for testing)
     */
    setSimulatedTime(normalizedTime) {
        this.simulatedTime = normalizedTime % 1;
    }

    /**
     * Toggle real time vs simulated
     */
    toggleRealTime(useReal) {
        this.config.useRealTime = useReal;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentalSystem;
}
