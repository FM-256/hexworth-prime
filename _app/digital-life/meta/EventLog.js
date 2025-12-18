/**
 * EventLog.js - Scrolling Event History
 *
 * Records and displays significant ecosystem events:
 * - Births and deaths (rare types highlighted)
 * - Evolution events
 * - Cosmic events
 * - Predator encounters
 * - Planet formation
 * - Player actions
 *
 * Shows a scrolling log with timestamps and event icons.
 */

class EventLog {
    static EVENT_TYPES = {
        BIRTH: { icon: '✨', color: '#22c55e', label: 'Birth' },
        DEATH: { icon: '💀', color: '#ef4444', label: 'Death' },
        EVOLUTION: { icon: '⬆️', color: '#9f7aea', label: 'Evolution' },
        RARE_SPAWN: { icon: '⭐', color: '#fbbf24', label: 'Rare' },
        COSMIC_EVENT: { icon: '🌌', color: '#38bdf8', label: 'Cosmic' },
        PLANET: { icon: '🌍', color: '#84cc16', label: 'Planet' },
        PREDATOR: { icon: '⚠️', color: '#f97316', label: 'Predator' },
        PLAYER_ACTION: { icon: '🛠️', color: '#ec4899', label: 'Action' },
        CONSTELLATION: { icon: '✦', color: '#a78bfa', label: 'Constellation' },
        ACHIEVEMENT: { icon: '🏆', color: '#fbbf24', label: 'Achievement' },
        SYSTEM: { icon: '📋', color: '#888', label: 'System' }
    };

    constructor(config = {}) {
        this.config = {
            enabled: config.enabled ?? true,
            maxEntries: config.maxEntries ?? 100,
            showUI: config.showUI ?? true,
            autoScroll: config.autoScroll ?? true,
            groupSimilar: config.groupSimilar ?? true,    // Group rapid similar events
            groupWindow: config.groupWindow ?? 1000,       // ms window for grouping
            filterTypes: config.filterTypes ?? null,       // null = show all, or array of types
            position: config.position ?? 'bottom-right',
            collapsed: config.collapsed ?? true,
            ...config
        };

        // Event entries
        this.entries = [];

        // Grouping state
        this.lastEvent = null;
        this.lastEventTime = 0;
        this.groupCount = 0;

        // DOM
        this.element = null;
        this.logContainer = null;
        this.isExpanded = !this.config.collapsed;

        // Callbacks
        this.onEvent = null;
    }

    /**
     * Initialize the event log
     */
    init(container) {
        if (this.config.showUI) {
            this.createElement(container);
        }
        this.injectStyles();

        // Log system start
        this.log('SYSTEM', 'Ecosystem initialized');

        console.log('📋 Event log initialized');
        return this;
    }

    /**
     * Create the UI element
     */
    createElement(container) {
        this.element = document.createElement('div');
        this.element.className = `event-log event-log-${this.config.position}`;
        this.element.innerHTML = `
            <div class="log-header">
                <span class="log-title">📋 Event Log</span>
                <span class="log-count">(0)</span>
                <button class="log-toggle">${this.isExpanded ? '▼' : '▲'}</button>
            </div>
            <div class="log-container ${this.isExpanded ? 'expanded' : ''}"></div>
            <div class="log-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="rare">Rare</button>
                <button class="filter-btn" data-filter="cosmic">Cosmic</button>
                <button class="filter-btn" data-filter="predator">Danger</button>
            </div>
        `;

        this.logContainer = this.element.querySelector('.log-container');

        // Toggle expand/collapse
        this.element.querySelector('.log-header').addEventListener('click', () => {
            this.toggleExpanded();
        });

        // Filter buttons
        this.element.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setFilter(btn.dataset.filter);
                this.element.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        (container || document.body).appendChild(this.element);
    }

    /**
     * Toggle expanded/collapsed state
     */
    toggleExpanded() {
        this.isExpanded = !this.isExpanded;
        this.logContainer.classList.toggle('expanded', this.isExpanded);
        this.element.querySelector('.log-toggle').textContent = this.isExpanded ? '▼' : '▲';
    }

    /**
     * Set event filter
     */
    setFilter(filter) {
        if (filter === 'all') {
            this.config.filterTypes = null;
        } else if (filter === 'rare') {
            this.config.filterTypes = ['RARE_SPAWN', 'EVOLUTION', 'ACHIEVEMENT'];
        } else if (filter === 'cosmic') {
            this.config.filterTypes = ['COSMIC_EVENT', 'PLANET', 'CONSTELLATION'];
        } else if (filter === 'predator') {
            this.config.filterTypes = ['PREDATOR', 'DEATH'];
        }
        this.refreshDisplay();
    }

    /**
     * Log an event
     */
    log(type, message, data = {}) {
        if (!this.config.enabled) return;

        const eventType = EventLog.EVENT_TYPES[type] || EventLog.EVENT_TYPES.SYSTEM;
        const now = Date.now();

        // Check for grouping similar events
        if (this.config.groupSimilar &&
            this.lastEvent?.type === type &&
            this.lastEvent?.message === message &&
            now - this.lastEventTime < this.config.groupWindow) {

            this.groupCount++;
            this.lastEvent.count = this.groupCount;
            this.lastEvent.timestamp = now;
            this.updateLastEntry();
            return;
        }

        // Create new entry
        const entry = {
            id: 'evt_' + now + '_' + Math.random().toString(36).substr(2, 5),
            type,
            message,
            data,
            timestamp: now,
            count: 1,
            eventType
        };

        this.entries.push(entry);
        this.lastEvent = entry;
        this.lastEventTime = now;
        this.groupCount = 1;

        // Trim old entries
        while (this.entries.length > this.config.maxEntries) {
            this.entries.shift();
        }

        // Add to UI
        if (this.logContainer) {
            this.addEntryToUI(entry);
        }

        // Update count
        this.updateCount();

        // Callback
        if (this.onEvent) {
            this.onEvent(entry);
        }
    }

    /**
     * Add entry to UI
     */
    addEntryToUI(entry) {
        // Check filter
        if (this.config.filterTypes && !this.config.filterTypes.includes(entry.type)) {
            return;
        }

        const el = document.createElement('div');
        el.className = 'log-entry';
        el.dataset.type = entry.type;
        el.dataset.id = entry.id;
        el.innerHTML = this.renderEntry(entry);

        this.logContainer.appendChild(el);

        // Auto-scroll
        if (this.config.autoScroll && this.isExpanded) {
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
        }

        // Animate in
        requestAnimationFrame(() => {
            el.classList.add('show');
        });
    }

    /**
     * Update the last entry (for grouping)
     */
    updateLastEntry() {
        if (!this.logContainer || !this.lastEvent) return;

        const el = this.logContainer.querySelector(`[data-id="${this.lastEvent.id}"]`);
        if (el) {
            el.innerHTML = this.renderEntry(this.lastEvent);
        }
    }

    /**
     * Render entry HTML
     */
    renderEntry(entry) {
        const time = this.formatTime(entry.timestamp);
        const countBadge = entry.count > 1 ? `<span class="entry-count">×${entry.count}</span>` : '';

        return `
            <span class="entry-time">${time}</span>
            <span class="entry-icon" style="color: ${entry.eventType.color}">${entry.eventType.icon}</span>
            <span class="entry-message">${entry.message}</span>
            ${countBadge}
        `;
    }

    /**
     * Refresh display (after filter change)
     */
    refreshDisplay() {
        if (!this.logContainer) return;

        this.logContainer.innerHTML = '';

        for (const entry of this.entries) {
            if (this.config.filterTypes && !this.config.filterTypes.includes(entry.type)) {
                continue;
            }

            const el = document.createElement('div');
            el.className = 'log-entry show';
            el.dataset.type = entry.type;
            el.dataset.id = entry.id;
            el.innerHTML = this.renderEntry(entry);
            this.logContainer.appendChild(el);
        }

        // Scroll to bottom
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    /**
     * Update entry count display
     */
    updateCount() {
        if (!this.element) return;
        const countEl = this.element.querySelector('.log-count');
        if (countEl) {
            countEl.textContent = `(${this.entries.length})`;
        }
    }

    /**
     * Format timestamp
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * Convenience methods for logging specific events
     */
    logBirth(firefly) {
        const tier = firefly.tier?.name || 'Basic';
        this.log('BIRTH', `${tier} firefly born (gen ${firefly.generation})`);
    }

    logDeath(firefly, cause = 'natural') {
        const tier = firefly.tier?.name || 'Basic';
        this.log('DEATH', `${tier} firefly died (${cause})`);
    }

    logEvolution(firefly, oldTier, newTier) {
        this.log('EVOLUTION', `Firefly evolved: ${oldTier.name} → ${newTier.name}`);
    }

    logRareSpawn(firefly) {
        const rareType = firefly.rareType || 'Unknown';
        this.log('RARE_SPAWN', `${rareType} firefly appeared!`, { rareType });
    }

    logCosmicEvent(eventType, phase = 'started') {
        const names = {
            SOLAR_FLARE: 'Solar Flare',
            METEOR_SHOWER: 'Meteor Shower',
            VOID_STORM: 'Void Storm',
            ECLIPSE: 'Eclipse',
            NEBULA_DRIFT: 'Nebula Drift'
        };
        this.log('COSMIC_EVENT', `${names[eventType] || eventType} ${phase}`);
    }

    logPlanetEvent(event, planet) {
        const planetType = planet?.type?.name || 'Planet';
        this.log('PLANET', `${planetType}: ${event}`);
    }

    logPredatorEvent(predatorType, event) {
        this.log('PREDATOR', `${predatorType}: ${event}`);
    }

    logPlayerAction(action, result = '') {
        this.log('PLAYER_ACTION', `${action}${result ? ': ' + result : ''}`);
    }

    logConstellation(pattern) {
        this.log('CONSTELLATION', `Constellation formed: ${pattern}`);
    }

    logAchievement(achievement) {
        this.log('ACHIEVEMENT', `Unlocked: ${achievement.name}`);
    }

    /**
     * Get all entries
     */
    getEntries() {
        return [...this.entries];
    }

    /**
     * Clear all entries
     */
    clear() {
        this.entries = [];
        if (this.logContainer) {
            this.logContainer.innerHTML = '';
        }
        this.updateCount();
    }

    /**
     * Export log as text
     */
    exportAsText() {
        return this.entries.map(e => {
            const time = this.formatTime(e.timestamp);
            const count = e.count > 1 ? ` (×${e.count})` : '';
            return `[${time}] ${e.eventType.icon} ${e.message}${count}`;
        }).join('\n');
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('eventlog-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'eventlog-styles';
        styles.textContent = `
            .event-log {
                position: fixed;
                width: 320px;
                background: rgba(10, 10, 15, 0.9);
                border: 1px solid #333;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                z-index: 999;
                overflow: hidden;
            }

            .event-log-bottom-right { bottom: 80px; right: 10px; }
            .event-log-bottom-left { bottom: 80px; left: 10px; }
            .event-log-top-right { top: 100px; right: 10px; }
            .event-log-top-left { top: 100px; left: 10px; }

            .log-header {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                background: rgba(30, 30, 40, 0.8);
                cursor: pointer;
                user-select: none;
            }

            .log-header:hover {
                background: rgba(40, 40, 50, 0.8);
            }

            .log-title {
                flex: 1;
                color: #aaa;
            }

            .log-count {
                color: #666;
                margin-right: 10px;
            }

            .log-toggle {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 0;
                font-size: 10px;
            }

            .log-container {
                max-height: 0;
                overflow-y: auto;
                transition: max-height 0.3s ease;
            }

            .log-container.expanded {
                max-height: 250px;
            }

            .log-container::-webkit-scrollbar {
                width: 6px;
            }

            .log-container::-webkit-scrollbar-track {
                background: #111;
            }

            .log-container::-webkit-scrollbar-thumb {
                background: #444;
                border-radius: 3px;
            }

            .log-entry {
                display: flex;
                align-items: center;
                padding: 6px 12px;
                border-bottom: 1px solid #222;
                opacity: 0;
                transform: translateX(-10px);
                transition: all 0.2s ease;
            }

            .log-entry.show {
                opacity: 1;
                transform: translateX(0);
            }

            .log-entry:hover {
                background: rgba(255, 255, 255, 0.03);
            }

            .entry-time {
                color: #555;
                margin-right: 8px;
                font-size: 9px;
            }

            .entry-icon {
                margin-right: 8px;
                font-size: 12px;
            }

            .entry-message {
                flex: 1;
                color: #ccc;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .entry-count {
                background: rgba(159, 122, 234, 0.3);
                color: #9f7aea;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 9px;
                margin-left: 8px;
            }

            .log-filters {
                display: flex;
                padding: 6px;
                gap: 4px;
                background: rgba(20, 20, 30, 0.8);
                border-top: 1px solid #333;
            }

            .filter-btn {
                flex: 1;
                background: rgba(40, 40, 50, 0.5);
                border: 1px solid #333;
                color: #666;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 10px;
                font-family: inherit;
                transition: all 0.2s;
            }

            .filter-btn:hover {
                background: rgba(60, 60, 70, 0.5);
                color: #aaa;
            }

            .filter-btn.active {
                background: rgba(159, 122, 234, 0.2);
                border-color: #9f7aea;
                color: #9f7aea;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Destroy the event log
     */
    destroy() {
        if (this.element) {
            this.element.remove();
        }
        this.entries = [];
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventLog;
}
