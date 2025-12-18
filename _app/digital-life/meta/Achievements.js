/**
 * Achievements.js - Milestone Tracking System
 *
 * Tracks and rewards various ecosystem milestones:
 * - Population achievements (first firefly, 50 fireflies, etc.)
 * - Evolution achievements (first charged, first ascended)
 * - Rare discoveries (golden, diamond, glitch, ancient)
 * - Event witnessing (solar flare, eclipse, etc.)
 * - Survival achievements (oldest firefly, longest dynasty)
 * - Interaction achievements (tools used, fireflies saved)
 *
 * Displays toast notifications and tracks unlock progress.
 */

class AchievementSystem {
    static ACHIEVEMENTS = {
        // Population Milestones
        FIRST_LIFE: {
            id: 'first_life',
            name: 'Let There Be Light',
            description: 'First firefly appears in the ecosystem',
            icon: '✨',
            category: 'population',
            condition: (stats) => stats.totalBirths >= 1,
            points: 10
        },
        SMALL_COLONY: {
            id: 'small_colony',
            name: 'Small Colony',
            description: 'Have 25 fireflies alive at once',
            icon: '🏘️',
            category: 'population',
            condition: (stats) => stats.currentPopulation >= 25,
            points: 25
        },
        THRIVING: {
            id: 'thriving',
            name: 'Thriving Ecosystem',
            description: 'Have 50 fireflies alive at once',
            icon: '🌳',
            category: 'population',
            condition: (stats) => stats.currentPopulation >= 50,
            points: 50
        },
        METROPOLIS: {
            id: 'metropolis',
            name: 'Digital Metropolis',
            description: 'Have 100 fireflies alive at once',
            icon: '🏙️',
            category: 'population',
            condition: (stats) => stats.currentPopulation >= 100,
            points: 100
        },
        CENTURY: {
            id: 'century',
            name: 'Century of Lives',
            description: '100 total fireflies have been born',
            icon: '💯',
            category: 'population',
            condition: (stats) => stats.totalBirths >= 100,
            points: 50
        },
        THOUSAND_SOULS: {
            id: 'thousand_souls',
            name: 'Thousand Souls',
            description: '1000 total fireflies have been born',
            icon: '🎊',
            category: 'population',
            condition: (stats) => stats.totalBirths >= 1000,
            points: 200
        },

        // Evolution Achievements
        FIRST_EVOLUTION: {
            id: 'first_evolution',
            name: 'Spark of Progress',
            description: 'First firefly evolves to Charged tier',
            icon: '⚡',
            category: 'evolution',
            condition: (stats) => stats.evolutions?.charged >= 1,
            points: 25
        },
        RADIANT_RISE: {
            id: 'radiant_rise',
            name: 'Radiant Rise',
            description: 'A firefly reaches Radiant tier',
            icon: '💎',
            category: 'evolution',
            condition: (stats) => stats.evolutions?.radiant >= 1,
            points: 50
        },
        PRISMATIC_POWER: {
            id: 'prismatic_power',
            name: 'Prismatic Power',
            description: 'A firefly reaches Prismatic tier',
            icon: '🌈',
            category: 'evolution',
            condition: (stats) => stats.evolutions?.prismatic >= 1,
            points: 75
        },
        ASCENSION: {
            id: 'ascension',
            name: 'Ascension',
            description: 'A firefly reaches the legendary Ascended tier',
            icon: '👼',
            category: 'evolution',
            condition: (stats) => stats.evolutions?.ascended >= 1,
            points: 150
        },
        EVOLUTION_MASTER: {
            id: 'evolution_master',
            name: 'Evolution Master',
            description: '10 fireflies have reached Ascended tier',
            icon: '🏆',
            category: 'evolution',
            condition: (stats) => stats.evolutions?.ascended >= 10,
            points: 300
        },

        // Rare Discoveries
        GOLDEN_FIND: {
            id: 'golden_find',
            name: 'Golden Discovery',
            description: 'Witness the birth of a Golden firefly',
            icon: '⭐',
            category: 'rare',
            condition: (stats) => stats.rares?.golden >= 1,
            points: 100
        },
        DIAMOND_FIND: {
            id: 'diamond_find',
            name: 'Diamond in the Rough',
            description: 'Witness the birth of a Diamond firefly',
            icon: '💠',
            category: 'rare',
            condition: (stats) => stats.rares?.diamond >= 1,
            points: 100
        },
        GLITCH_FIND: {
            id: 'glitch_find',
            name: 'System Anomaly',
            description: 'Witness the birth of a Glitch firefly',
            icon: '🔲',
            category: 'rare',
            condition: (stats) => stats.rares?.glitch >= 1,
            points: 100
        },
        ANCIENT_FIND: {
            id: 'ancient_find',
            name: 'Ancient Awakening',
            description: 'Witness the birth of an Ancient firefly',
            icon: '📜',
            category: 'rare',
            condition: (stats) => stats.rares?.ancient >= 1,
            points: 100
        },
        RARE_COLLECTOR: {
            id: 'rare_collector',
            name: 'Rare Collector',
            description: 'Witness all 4 rare firefly types',
            icon: '🎯',
            category: 'rare',
            condition: (stats) => {
                const r = stats.rares || {};
                return r.golden >= 1 && r.diamond >= 1 && r.glitch >= 1 && r.ancient >= 1;
            },
            points: 500
        },

        // Cosmic Events
        SOLAR_WITNESS: {
            id: 'solar_witness',
            name: 'Solar Witness',
            description: 'Experience a Solar Flare event',
            icon: '☀️',
            category: 'cosmic',
            condition: (stats) => stats.events?.solarFlare >= 1,
            points: 30
        },
        METEOR_WATCHER: {
            id: 'meteor_watcher',
            name: 'Meteor Watcher',
            description: 'Experience a Meteor Shower',
            icon: '☄️',
            category: 'cosmic',
            condition: (stats) => stats.events?.meteorShower >= 1,
            points: 30
        },
        VOID_SURVIVOR: {
            id: 'void_survivor',
            name: 'Void Survivor',
            description: 'Survive a Void Storm',
            icon: '🌀',
            category: 'cosmic',
            condition: (stats) => stats.events?.voidStorm >= 1,
            points: 40
        },
        ECLIPSE_VIEWER: {
            id: 'eclipse_viewer',
            name: 'Eclipse Viewer',
            description: 'Witness an Eclipse',
            icon: '🌑',
            category: 'cosmic',
            condition: (stats) => stats.events?.eclipse >= 1,
            points: 40
        },
        NEBULA_DRIFTER: {
            id: 'nebula_drifter',
            name: 'Nebula Drifter',
            description: 'Experience a Nebula Drift',
            icon: '🌌',
            category: 'cosmic',
            condition: (stats) => stats.events?.nebulaDrift >= 1,
            points: 30
        },
        COSMIC_VETERAN: {
            id: 'cosmic_veteran',
            name: 'Cosmic Veteran',
            description: 'Experience all 5 cosmic event types',
            icon: '🌠',
            category: 'cosmic',
            condition: (stats) => {
                const e = stats.events || {};
                return e.solarFlare >= 1 && e.meteorShower >= 1 &&
                       e.voidStorm >= 1 && e.eclipse >= 1 && e.nebulaDrift >= 1;
            },
            points: 200
        },

        // Survival
        ELDER: {
            id: 'elder',
            name: 'Elder',
            description: 'A firefly lives for over 3 minutes',
            icon: '👴',
            category: 'survival',
            condition: (stats) => stats.longestLife >= 180000,
            points: 50
        },
        ANCIENT_ONE: {
            id: 'ancient_one',
            name: 'The Ancient One',
            description: 'A firefly lives for over 5 minutes',
            icon: '🧙',
            category: 'survival',
            condition: (stats) => stats.longestLife >= 300000,
            points: 100
        },
        IMMORTAL_LEGEND: {
            id: 'immortal_legend',
            name: 'Immortal Legend',
            description: 'A firefly lives for over 10 minutes',
            icon: '👑',
            category: 'survival',
            condition: (stats) => stats.longestLife >= 600000,
            points: 250
        },
        DYNASTY: {
            id: 'dynasty',
            name: 'Dynasty',
            description: 'A lineage reaches 5 generations',
            icon: '🏰',
            category: 'survival',
            condition: (stats) => stats.highestGeneration >= 5,
            points: 75
        },
        LEGACY: {
            id: 'legacy',
            name: 'Eternal Legacy',
            description: 'A lineage reaches 10 generations',
            icon: '📿',
            category: 'survival',
            condition: (stats) => stats.highestGeneration >= 10,
            points: 150
        },

        // Interaction
        FIRST_BLESSING: {
            id: 'first_blessing',
            name: 'Divine Touch',
            description: 'Use the Energy Blessing tool',
            icon: '🙏',
            category: 'interaction',
            condition: (stats) => stats.toolsUsed?.blessing >= 1,
            points: 15
        },
        GRAVITY_MASTER: {
            id: 'gravity_master',
            name: 'Gravity Master',
            description: 'Create 10 gravity wells',
            icon: '🌀',
            category: 'interaction',
            condition: (stats) => stats.toolsUsed?.gravity >= 10,
            points: 30
        },
        PROTECTOR: {
            id: 'protector',
            name: 'Protector',
            description: 'Deploy 5 shield bubbles',
            icon: '🛡️',
            category: 'interaction',
            condition: (stats) => stats.toolsUsed?.shield >= 5,
            points: 40
        },
        PORTAL_MAKER: {
            id: 'portal_maker',
            name: 'Portal Maker',
            description: 'Create a portal pair',
            icon: '🌀',
            category: 'interaction',
            condition: (stats) => stats.portalsCreated >= 1,
            points: 25
        },
        SANCTUARY_BUILDER: {
            id: 'sanctuary_builder',
            name: 'Sanctuary Builder',
            description: 'Create a sanctuary',
            icon: '☮️',
            category: 'interaction',
            condition: (stats) => stats.sanctuariesCreated >= 1,
            points: 25
        },

        // Special
        BLACK_HOLE_WITNESS: {
            id: 'black_hole_witness',
            name: 'Event Horizon',
            description: 'Witness the black hole consume a firefly',
            icon: '🕳️',
            category: 'special',
            condition: (stats) => stats.blackHoleConsumptions >= 1,
            points: 20
        },
        PLANET_BIRTH: {
            id: 'planet_birth',
            name: 'World Builder',
            description: 'Witness a planet form',
            icon: '🌍',
            category: 'special',
            condition: (stats) => stats.planetsFormed >= 1,
            points: 50
        },
        CONSTELLATION_FORMER: {
            id: 'constellation_former',
            name: 'Star Mapper',
            description: 'Fireflies form a constellation',
            icon: '⭐',
            category: 'special',
            condition: (stats) => stats.constellationsFormed >= 1,
            points: 40
        },
        PREDATOR_REPELLED: {
            id: 'predator_repelled',
            name: 'Swarm Defense',
            description: 'A predator is repelled by a swarm',
            icon: '💪',
            category: 'special',
            condition: (stats) => stats.predatorsRepelled >= 1,
            points: 35
        }
    };

    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,
            showToasts: config.showToasts ?? true,
            toastDuration: config.toastDuration ?? 4000,
            persistUnlocks: config.persistUnlocks ?? true,
            ...config
        };

        // Unlocked achievements
        this.unlocked = new Set();

        // Stats tracking for achievements
        this.stats = {
            totalBirths: 0,
            totalDeaths: 0,
            currentPopulation: 0,
            longestLife: 0,
            highestGeneration: 0,
            evolutions: { charged: 0, radiant: 0, prismatic: 0, ascended: 0 },
            rares: { golden: 0, diamond: 0, glitch: 0, ancient: 0 },
            events: { solarFlare: 0, meteorShower: 0, voidStorm: 0, eclipse: 0, nebulaDrift: 0 },
            toolsUsed: { blessing: 0, gravity: 0, shield: 0, beacon: 0, catalyst: 0 },
            portalsCreated: 0,
            sanctuariesCreated: 0,
            blackHoleConsumptions: 0,
            planetsFormed: 0,
            constellationsFormed: 0,
            predatorsRepelled: 0
        };

        // Total points earned
        this.totalPoints = 0;

        // Toast queue
        this.toastQueue = [];
        this.isShowingToast = false;

        // DOM
        this.toastContainer = null;

        // Load saved progress
        if (this.config.persistUnlocks) {
            this.loadProgress();
        }
    }

    /**
     * Initialize the achievement system
     */
    init(container) {
        this.createToastContainer(container);
        this.injectStyles();
        console.log('🏆 Achievement system initialized');
        return this;
    }

    /**
     * Create toast notification container
     */
    createToastContainer(container) {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'achievement-toast-container';
        (container || document.body).appendChild(this.toastContainer);
    }

    /**
     * Track a stat change
     */
    trackStat(statPath, value = 1, isAbsolute = false) {
        const parts = statPath.split('.');
        let obj = this.stats;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {};
            obj = obj[parts[i]];
        }

        const key = parts[parts.length - 1];
        if (isAbsolute) {
            obj[key] = value;
        } else {
            obj[key] = (obj[key] || 0) + value;
        }

        // Check for newly unlocked achievements
        this.checkAchievements();
    }

    /**
     * Update current population (absolute value)
     */
    updatePopulation(count) {
        this.stats.currentPopulation = count;
        this.checkAchievements();
    }

    /**
     * Check all achievements for unlock
     */
    checkAchievements() {
        for (const [key, achievement] of Object.entries(AchievementSystem.ACHIEVEMENTS)) {
            if (this.unlocked.has(achievement.id)) continue;

            try {
                if (achievement.condition(this.stats)) {
                    this.unlockAchievement(achievement);
                }
            } catch (e) {
                // Condition failed - achievement not yet earned
            }
        }
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievement) {
        if (this.unlocked.has(achievement.id)) return;

        this.unlocked.add(achievement.id);
        this.totalPoints += achievement.points;

        console.log(`🏆 Achievement Unlocked: ${achievement.name}`);

        // Show toast
        if (this.config.showToasts) {
            this.queueToast(achievement);
        }

        // Save progress
        if (this.config.persistUnlocks) {
            this.saveProgress();
        }
    }

    /**
     * Queue a toast notification
     */
    queueToast(achievement) {
        this.toastQueue.push(achievement);
        if (!this.isShowingToast) {
            this.showNextToast();
        }
    }

    /**
     * Show the next toast in queue
     */
    showNextToast() {
        if (this.toastQueue.length === 0) {
            this.isShowingToast = false;
            return;
        }

        this.isShowingToast = true;
        const achievement = this.toastQueue.shift();

        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="toast-icon">${achievement.icon}</div>
            <div class="toast-content">
                <div class="toast-title">Achievement Unlocked!</div>
                <div class="toast-name">${achievement.name}</div>
                <div class="toast-desc">${achievement.description}</div>
                <div class="toast-points">+${achievement.points} points</div>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                this.showNextToast();
            }, 300);
        }, this.config.toastDuration);
    }

    /**
     * Get unlocked achievements
     */
    getUnlocked() {
        return Array.from(this.unlocked).map(id => {
            return Object.values(AchievementSystem.ACHIEVEMENTS).find(a => a.id === id);
        }).filter(Boolean);
    }

    /**
     * Get locked achievements
     */
    getLocked() {
        return Object.values(AchievementSystem.ACHIEVEMENTS).filter(a => !this.unlocked.has(a.id));
    }

    /**
     * Get progress summary
     */
    getProgress() {
        const total = Object.keys(AchievementSystem.ACHIEVEMENTS).length;
        const unlocked = this.unlocked.size;
        const maxPoints = Object.values(AchievementSystem.ACHIEVEMENTS).reduce((sum, a) => sum + a.points, 0);

        return {
            unlocked,
            total,
            percentage: Math.round((unlocked / total) * 100),
            points: this.totalPoints,
            maxPoints
        };
    }

    /**
     * Get achievements by category
     */
    getByCategory(category) {
        return Object.values(AchievementSystem.ACHIEVEMENTS).filter(a => a.category === category);
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            const data = {
                unlocked: Array.from(this.unlocked),
                stats: this.stats,
                totalPoints: this.totalPoints
            };
            localStorage.setItem('digitalLife_achievements', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save achievement progress:', e);
        }
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const data = JSON.parse(localStorage.getItem('digitalLife_achievements'));
            if (data) {
                this.unlocked = new Set(data.unlocked || []);
                // Merge loaded stats with defaults
                this.stats = { ...this.stats, ...data.stats };
                this.totalPoints = data.totalPoints || 0;
                console.log(`🏆 Loaded ${this.unlocked.size} achievements`);
            }
        } catch (e) {
            console.warn('Could not load achievement progress:', e);
        }
    }

    /**
     * Reset all progress
     */
    resetProgress() {
        this.unlocked.clear();
        this.totalPoints = 0;
        this.stats = {
            totalBirths: 0,
            totalDeaths: 0,
            currentPopulation: 0,
            longestLife: 0,
            highestGeneration: 0,
            evolutions: { charged: 0, radiant: 0, prismatic: 0, ascended: 0 },
            rares: { golden: 0, diamond: 0, glitch: 0, ancient: 0 },
            events: { solarFlare: 0, meteorShower: 0, voidStorm: 0, eclipse: 0, nebulaDrift: 0 },
            toolsUsed: { blessing: 0, gravity: 0, shield: 0, beacon: 0, catalyst: 0 },
            portalsCreated: 0,
            sanctuariesCreated: 0,
            blackHoleConsumptions: 0,
            planetsFormed: 0,
            constellationsFormed: 0,
            predatorsRepelled: 0
        };

        if (this.config.persistUnlocks) {
            localStorage.removeItem('digitalLife_achievements');
        }
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('achievement-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'achievement-styles';
        styles.textContent = `
            .achievement-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            }

            .achievement-toast {
                display: flex;
                align-items: center;
                gap: 15px;
                background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(50, 40, 70, 0.95));
                border: 2px solid #fbbf24;
                border-radius: 12px;
                padding: 15px 20px;
                box-shadow: 0 0 30px rgba(251, 191, 36, 0.3), 0 4px 20px rgba(0, 0, 0, 0.5);
                transform: translateX(120%);
                transition: transform 0.3s ease-out;
                pointer-events: auto;
                min-width: 300px;
            }

            .achievement-toast.show {
                transform: translateX(0);
            }

            .toast-icon {
                font-size: 36px;
                filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-family: 'Courier New', monospace;
                font-size: 10px;
                color: #fbbf24;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 4px;
            }

            .toast-name {
                font-family: Georgia, serif;
                font-size: 18px;
                color: #fff;
                font-weight: bold;
                margin-bottom: 4px;
            }

            .toast-desc {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #aaa;
                margin-bottom: 6px;
            }

            .toast-points {
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #22c55e;
                font-weight: bold;
            }

            @keyframes achievementGlow {
                0%, 100% { box-shadow: 0 0 30px rgba(251, 191, 36, 0.3), 0 4px 20px rgba(0, 0, 0, 0.5); }
                50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.5), 0 4px 20px rgba(0, 0, 0, 0.5); }
            }

            .achievement-toast.show {
                animation: achievementGlow 1.5s ease-in-out infinite;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Destroy the system
     */
    destroy() {
        if (this.toastContainer) {
            this.toastContainer.remove();
        }
        this.toastQueue = [];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
}
