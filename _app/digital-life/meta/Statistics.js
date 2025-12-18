/**
 * Statistics.js - Real-time Ecosystem Dashboard
 *
 * Displays comprehensive statistics about the ecosystem:
 * - Population metrics (current, peak, births, deaths)
 * - Evolution breakdown by tier
 * - Energy levels and average lifespan
 * - Rare firefly counts
 * - Entity counts (planets, black holes, predators)
 * - Performance metrics (FPS, entity count)
 *
 * Provides both a compact HUD and detailed panel view.
 */

class StatisticsSystem {
    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,
            updateInterval: config.updateInterval ?? 500,  // ms between updates
            showHUD: config.showHUD ?? true,
            showDetailedPanel: config.showDetailedPanel ?? false,
            position: config.position ?? 'top-left', // top-left, top-right, bottom-left, bottom-right
            ...config
        };

        // Current stats snapshot
        this.currentStats = {
            // Population
            population: 0,
            peakPopulation: 0,
            totalBirths: 0,
            totalDeaths: 0,
            birthRate: 0,
            deathRate: 0,

            // Evolution tiers
            tiers: {
                basic: 0,
                charged: 0,
                radiant: 0,
                prismatic: 0,
                ascended: 0
            },

            // Rare types
            rares: {
                golden: 0,
                diamond: 0,
                glitch: 0,
                ancient: 0
            },

            // Average metrics
            averageEnergy: 0,
            averageAge: 0,
            oldestFirefly: 0,
            highestGeneration: 0,

            // Entities
            planets: 0,
            moons: 0,
            blackHoles: 0,
            energyWells: 0,
            predatorStars: 0,
            shadows: 0,
            serpents: 0,
            parasites: 0,
            portals: 0,
            sanctuaries: 0,

            // Performance
            fps: 60,
            totalEntities: 0,

            // Time
            ecosystemAge: 0,
            sessionTime: 0
        };

        // Historical data for graphs
        this.history = {
            population: [],
            births: [],
            deaths: [],
            maxHistoryLength: 60  // 30 seconds at 2 updates/sec
        };

        // Rate tracking
        this.lastBirths = 0;
        this.lastDeaths = 0;
        this.lastUpdateTime = Date.now();

        // DOM elements
        this.hudElement = null;
        this.panelElement = null;

        // Update timer
        this.updateTimer = null;

        // Start time
        this.sessionStartTime = Date.now();
    }

    /**
     * Initialize the statistics system
     */
    init(container) {
        this.container = container;

        if (this.config.showHUD) {
            this.createHUD();
        }

        this.injectStyles();

        // Start update loop
        this.startUpdates();

        console.log('📊 Statistics system initialized');
        return this;
    }

    /**
     * Create the compact HUD display
     */
    createHUD() {
        this.hudElement = document.createElement('div');
        this.hudElement.className = `stats-hud stats-hud-${this.config.position}`;
        this.hudElement.innerHTML = this.renderHUD();

        document.body.appendChild(this.hudElement);

        // Click to toggle detailed panel
        this.hudElement.addEventListener('click', () => this.toggleDetailedPanel());
    }

    /**
     * Render HUD content
     */
    renderHUD() {
        const s = this.currentStats;
        return `
            <div class="hud-row">
                <span class="hud-label">Pop:</span>
                <span class="hud-value">${s.population}</span>
                <span class="hud-secondary">/ ${s.peakPopulation} peak</span>
            </div>
            <div class="hud-row">
                <span class="hud-label">Gen:</span>
                <span class="hud-value">${s.highestGeneration}</span>
                <span class="hud-secondary">• Age: ${this.formatTime(s.ecosystemAge)}</span>
            </div>
            <div class="hud-row hud-tiers">
                <span class="tier tier-basic">${s.tiers.basic}</span>
                <span class="tier tier-charged">${s.tiers.charged}</span>
                <span class="tier tier-radiant">${s.tiers.radiant}</span>
                <span class="tier tier-prismatic">${s.tiers.prismatic}</span>
                <span class="tier tier-ascended">${s.tiers.ascended}</span>
            </div>
            <div class="hud-row hud-small">
                <span>🌍 ${s.planets}</span>
                <span>🕳️ ${s.blackHoles}</span>
                <span>⚡ ${Math.round(s.averageEnergy)}%</span>
            </div>
        `;
    }

    /**
     * Create detailed statistics panel
     */
    createDetailedPanel() {
        if (this.panelElement) return;

        this.panelElement = document.createElement('div');
        this.panelElement.className = 'stats-panel';
        this.panelElement.innerHTML = this.renderDetailedPanel();

        document.body.appendChild(this.panelElement);

        // Close button
        this.panelElement.querySelector('.panel-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDetailedPanel();
        });
    }

    /**
     * Render detailed panel content
     */
    renderDetailedPanel() {
        const s = this.currentStats;
        return `
            <div class="panel-header">
                <span class="panel-title">📊 Ecosystem Statistics</span>
                <button class="panel-close">✕</button>
            </div>

            <div class="panel-section">
                <div class="section-title">Population</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-value">${s.population}</span>
                        <span class="stat-label">Current</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${s.peakPopulation}</span>
                        <span class="stat-label">Peak</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${s.totalBirths}</span>
                        <span class="stat-label">Total Births</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${s.totalDeaths}</span>
                        <span class="stat-label">Total Deaths</span>
                    </div>
                </div>
                <div class="stat-bar">
                    <div class="stat-bar-fill" style="width: ${Math.min(100, (s.population / Math.max(1, s.peakPopulation)) * 100)}%"></div>
                </div>
            </div>

            <div class="panel-section">
                <div class="section-title">Evolution Tiers</div>
                <div class="tier-breakdown">
                    <div class="tier-row">
                        <span class="tier-dot tier-basic"></span>
                        <span class="tier-name">Basic</span>
                        <span class="tier-count">${s.tiers.basic}</span>
                        <div class="tier-bar"><div class="tier-bar-fill tier-basic" style="width: ${this.getTierPercent('basic')}%"></div></div>
                    </div>
                    <div class="tier-row">
                        <span class="tier-dot tier-charged"></span>
                        <span class="tier-name">Charged</span>
                        <span class="tier-count">${s.tiers.charged}</span>
                        <div class="tier-bar"><div class="tier-bar-fill tier-charged" style="width: ${this.getTierPercent('charged')}%"></div></div>
                    </div>
                    <div class="tier-row">
                        <span class="tier-dot tier-radiant"></span>
                        <span class="tier-name">Radiant</span>
                        <span class="tier-count">${s.tiers.radiant}</span>
                        <div class="tier-bar"><div class="tier-bar-fill tier-radiant" style="width: ${this.getTierPercent('radiant')}%"></div></div>
                    </div>
                    <div class="tier-row">
                        <span class="tier-dot tier-prismatic"></span>
                        <span class="tier-name">Prismatic</span>
                        <span class="tier-count">${s.tiers.prismatic}</span>
                        <div class="tier-bar"><div class="tier-bar-fill tier-prismatic" style="width: ${this.getTierPercent('prismatic')}%"></div></div>
                    </div>
                    <div class="tier-row">
                        <span class="tier-dot tier-ascended"></span>
                        <span class="tier-name">Ascended</span>
                        <span class="tier-count">${s.tiers.ascended}</span>
                        <div class="tier-bar"><div class="tier-bar-fill tier-ascended" style="width: ${this.getTierPercent('ascended')}%"></div></div>
                    </div>
                </div>
            </div>

            <div class="panel-section">
                <div class="section-title">Rare Fireflies</div>
                <div class="rare-grid">
                    <div class="rare-item ${s.rares.golden > 0 ? 'discovered' : ''}">
                        <span class="rare-icon">★</span>
                        <span class="rare-name">Golden</span>
                        <span class="rare-count">${s.rares.golden}</span>
                    </div>
                    <div class="rare-item ${s.rares.diamond > 0 ? 'discovered' : ''}">
                        <span class="rare-icon">◆</span>
                        <span class="rare-name">Diamond</span>
                        <span class="rare-count">${s.rares.diamond}</span>
                    </div>
                    <div class="rare-item ${s.rares.glitch > 0 ? 'discovered' : ''}">
                        <span class="rare-icon">▓</span>
                        <span class="rare-name">Glitch</span>
                        <span class="rare-count">${s.rares.glitch}</span>
                    </div>
                    <div class="rare-item ${s.rares.ancient > 0 ? 'discovered' : ''}">
                        <span class="rare-icon">✦</span>
                        <span class="rare-name">Ancient</span>
                        <span class="rare-count">${s.rares.ancient}</span>
                    </div>
                </div>
            </div>

            <div class="panel-section">
                <div class="section-title">Ecosystem Entities</div>
                <div class="entity-grid">
                    <div class="entity-item">🌍 Planets: ${s.planets}</div>
                    <div class="entity-item">🌙 Moons: ${s.moons}</div>
                    <div class="entity-item">🕳️ Black Holes: ${s.blackHoles}</div>
                    <div class="entity-item">⚡ Energy Wells: ${s.energyWells}</div>
                    <div class="entity-item">👤 Shadows: ${s.shadows}</div>
                    <div class="entity-item">🐍 Serpents: ${s.serpents}</div>
                    <div class="entity-item">🦠 Parasites: ${s.parasites}</div>
                    <div class="entity-item">🌀 Portals: ${s.portals}</div>
                    <div class="entity-item">☮️ Sanctuaries: ${s.sanctuaries}</div>
                </div>
            </div>

            <div class="panel-section">
                <div class="section-title">Performance</div>
                <div class="stat-grid">
                    <div class="stat-item">
                        <span class="stat-value">${s.fps}</span>
                        <span class="stat-label">FPS</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${s.totalEntities}</span>
                        <span class="stat-label">Total Entities</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatTime(s.sessionTime)}</span>
                        <span class="stat-label">Session Time</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.formatTime(s.ecosystemAge)}</span>
                        <span class="stat-label">Ecosystem Age</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Toggle detailed panel visibility
     */
    toggleDetailedPanel() {
        if (!this.panelElement) {
            this.createDetailedPanel();
            this.config.showDetailedPanel = true;
        } else {
            this.panelElement.classList.toggle('visible');
            this.config.showDetailedPanel = this.panelElement.classList.contains('visible');
        }
    }

    /**
     * Get tier percentage of population
     */
    getTierPercent(tier) {
        const total = this.currentStats.population || 1;
        return Math.round((this.currentStats.tiers[tier] / total) * 100);
    }

    /**
     * Start the update loop
     */
    startUpdates() {
        this.updateTimer = setInterval(() => this.update(), this.config.updateInterval);
    }

    /**
     * Main update - gather stats from ecosystem
     */
    update() {
        if (!window.digitalLife?.ecosystem) return;

        const ecosystem = window.digitalLife.ecosystem;
        const fireflies = ecosystem.fireflies || [];

        // Population stats
        this.currentStats.population = fireflies.length;
        this.currentStats.peakPopulation = Math.max(this.currentStats.peakPopulation, fireflies.length);
        this.currentStats.totalBirths = ecosystem.stats?.totalBirths || 0;
        this.currentStats.totalDeaths = ecosystem.stats?.totalDeaths || 0;

        // Calculate rates
        const now = Date.now();
        const elapsed = (now - this.lastUpdateTime) / 1000;
        if (elapsed > 0) {
            this.currentStats.birthRate = (this.currentStats.totalBirths - this.lastBirths) / elapsed;
            this.currentStats.deathRate = (this.currentStats.totalDeaths - this.lastDeaths) / elapsed;
        }
        this.lastBirths = this.currentStats.totalBirths;
        this.lastDeaths = this.currentStats.totalDeaths;
        this.lastUpdateTime = now;

        // Reset tier counts
        this.currentStats.tiers = { basic: 0, charged: 0, radiant: 0, prismatic: 0, ascended: 0 };
        this.currentStats.rares = { golden: 0, diamond: 0, glitch: 0, ancient: 0 };

        // Analyze fireflies
        let totalEnergy = 0;
        let totalAge = 0;
        let oldestAge = 0;
        let highestGen = 0;

        for (const firefly of fireflies) {
            // Tier
            const tierLevel = firefly.tier?.level || 0;
            const tierNames = ['basic', 'charged', 'radiant', 'prismatic', 'ascended'];
            const tierName = tierNames[tierLevel] || 'basic';
            this.currentStats.tiers[tierName]++;

            // Rare type
            if (firefly.rareType) {
                const rareKey = firefly.rareType.toLowerCase();
                if (this.currentStats.rares[rareKey] !== undefined) {
                    this.currentStats.rares[rareKey]++;
                }
            }

            // Energy and age
            totalEnergy += firefly.energy || 0;
            totalAge += firefly.age || 0;
            oldestAge = Math.max(oldestAge, firefly.age || 0);
            highestGen = Math.max(highestGen, firefly.generation || 0);
        }

        this.currentStats.averageEnergy = fireflies.length > 0 ? totalEnergy / fireflies.length : 0;
        this.currentStats.averageAge = fireflies.length > 0 ? totalAge / fireflies.length : 0;
        this.currentStats.oldestFirefly = oldestAge;
        this.currentStats.highestGeneration = highestGen;

        // Entity counts
        this.currentStats.planets = ecosystem.planets?.length || 0;
        this.currentStats.moons = ecosystem.planets?.reduce((sum, p) => sum + (p.moons?.length || 0), 0) || 0;
        this.currentStats.blackHoles = ecosystem.blackHole ? 1 : 0;
        this.currentStats.energyWells = window.digitalLife?.energyWells?.length || 0;
        this.currentStats.predatorStars = window.digitalLife?.predatorStars?.length || 0;

        // Phase 5 predators
        const pm = window.digitalLife?.predatorManager;
        this.currentStats.shadows = pm?.shadows?.length || 0;
        this.currentStats.serpents = pm?.serpents?.length || 0;
        this.currentStats.parasites = pm?.parasites?.length || 0;

        // Phase 6 entities
        this.currentStats.portals = window.digitalLife?.portalManager?.portals?.length || 0;
        this.currentStats.sanctuaries = window.digitalLife?.sanctuaryManager?.sanctuaries?.length || 0;

        // Performance
        this.currentStats.fps = Math.round(1000 / (now - this.lastUpdateTime) || 60);
        this.currentStats.totalEntities = fireflies.length +
            this.currentStats.planets +
            this.currentStats.energyWells +
            this.currentStats.shadows +
            this.currentStats.serpents +
            this.currentStats.parasites;

        // Time
        this.currentStats.ecosystemAge = ecosystem.stats?.totalTime || 0;
        this.currentStats.sessionTime = now - this.sessionStartTime;

        // Update history
        this.history.population.push(this.currentStats.population);
        if (this.history.population.length > this.history.maxHistoryLength) {
            this.history.population.shift();
        }

        // Update displays
        this.refreshDisplay();
    }

    /**
     * Refresh all display elements
     */
    refreshDisplay() {
        if (this.hudElement) {
            this.hudElement.innerHTML = this.renderHUD();
        }

        if (this.panelElement && this.config.showDetailedPanel) {
            this.panelElement.innerHTML = this.renderDetailedPanel();
            this.panelElement.classList.add('visible');
            // Re-attach close handler
            this.panelElement.querySelector('.panel-close')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDetailedPanel();
            });
        }
    }

    /**
     * Format time in mm:ss or hh:mm:ss
     */
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
        }
        return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
    }

    /**
     * Get current stats
     */
    getStats() {
        return { ...this.currentStats };
    }

    /**
     * Show/hide HUD
     */
    setHUDVisible(visible) {
        if (this.hudElement) {
            this.hudElement.style.display = visible ? 'block' : 'none';
        }
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('statistics-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'statistics-styles';
        styles.textContent = `
            .stats-hud {
                position: fixed;
                background: rgba(0, 0, 0, 0.75);
                padding: 10px 15px;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #ccc;
                z-index: 1000;
                cursor: pointer;
                transition: background 0.2s;
                min-width: 180px;
            }

            .stats-hud:hover {
                background: rgba(0, 0, 0, 0.85);
            }

            .stats-hud-top-left { top: 10px; left: 10px; }
            .stats-hud-top-right { top: 10px; right: 10px; }
            .stats-hud-bottom-left { bottom: 10px; left: 10px; }
            .stats-hud-bottom-right { bottom: 10px; right: 10px; }

            .hud-row {
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .hud-label {
                color: #888;
            }

            .hud-value {
                color: #9f7aea;
                font-weight: bold;
            }

            .hud-secondary {
                color: #666;
                font-size: 10px;
            }

            .hud-tiers {
                display: flex;
                gap: 4px;
            }

            .tier {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
            }

            .tier-basic { background: rgba(255,255,255,0.2); color: #fff; }
            .tier-charged { background: rgba(159,122,234,0.3); color: #9f7aea; }
            .tier-radiant { background: rgba(56,189,248,0.3); color: #38bdf8; }
            .tier-prismatic { background: rgba(251,191,36,0.3); color: #fbbf24; }
            .tier-ascended { background: rgba(34,197,94,0.3); color: #22c55e; }

            .hud-small {
                font-size: 10px;
                color: #888;
                gap: 10px;
            }

            /* Detailed Panel */
            .stats-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                background: rgba(10, 10, 15, 0.95);
                border: 1px solid #333;
                border-radius: 12px;
                padding: 20px;
                width: 450px;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10001;
                font-family: 'Courier New', monospace;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .stats-panel.visible {
                opacity: 1;
                visibility: visible;
                transform: translate(-50%, -50%) scale(1);
            }

            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #333;
            }

            .panel-title {
                font-size: 18px;
                color: #9f7aea;
                font-weight: bold;
            }

            .panel-close {
                background: none;
                border: none;
                color: #666;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
            }

            .panel-close:hover {
                color: #fff;
            }

            .panel-section {
                margin-bottom: 20px;
            }

            .section-title {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }

            .stat-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
            }

            .stat-item {
                text-align: center;
            }

            .stat-value {
                display: block;
                font-size: 24px;
                color: #fff;
                font-weight: bold;
            }

            .stat-label {
                font-size: 10px;
                color: #666;
            }

            .stat-bar {
                height: 4px;
                background: #222;
                border-radius: 2px;
                margin-top: 10px;
            }

            .stat-bar-fill {
                height: 100%;
                background: #9f7aea;
                border-radius: 2px;
                transition: width 0.3s;
            }

            .tier-breakdown {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .tier-row {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .tier-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
            }

            .tier-dot.tier-basic { background: #fff; }
            .tier-dot.tier-charged { background: #9f7aea; }
            .tier-dot.tier-radiant { background: #38bdf8; }
            .tier-dot.tier-prismatic { background: #fbbf24; }
            .tier-dot.tier-ascended { background: #22c55e; }

            .tier-name {
                width: 80px;
                color: #aaa;
            }

            .tier-count {
                width: 40px;
                color: #fff;
                font-weight: bold;
            }

            .tier-bar {
                flex: 1;
                height: 6px;
                background: #222;
                border-radius: 3px;
            }

            .tier-bar-fill {
                height: 100%;
                border-radius: 3px;
                transition: width 0.3s;
            }

            .tier-bar-fill.tier-basic { background: #fff; }
            .tier-bar-fill.tier-charged { background: #9f7aea; }
            .tier-bar-fill.tier-radiant { background: #38bdf8; }
            .tier-bar-fill.tier-prismatic { background: #fbbf24; }
            .tier-bar-fill.tier-ascended { background: #22c55e; }

            .rare-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
            }

            .rare-item {
                text-align: center;
                padding: 10px;
                background: rgba(30, 30, 40, 0.5);
                border-radius: 8px;
                opacity: 0.4;
            }

            .rare-item.discovered {
                opacity: 1;
                background: rgba(50, 40, 60, 0.7);
            }

            .rare-icon {
                display: block;
                font-size: 24px;
                margin-bottom: 5px;
            }

            .rare-name {
                display: block;
                font-size: 10px;
                color: #888;
            }

            .rare-count {
                display: block;
                font-size: 14px;
                color: #fff;
                font-weight: bold;
            }

            .entity-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                font-size: 12px;
            }

            .entity-item {
                color: #aaa;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Destroy the system
     */
    destroy() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        if (this.hudElement) {
            this.hudElement.remove();
        }
        if (this.panelElement) {
            this.panelElement.remove();
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsSystem;
}
