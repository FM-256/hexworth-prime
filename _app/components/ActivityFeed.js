/**
 * ActivityFeed.js - Immersive Handler Comms Activity Feed
 *
 * Records and displays user activity in a spy/handler communication style.
 * Stores locally and syncs to Firestore for persistence across devices.
 */

const ActivityFeed = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        storageKey: 'hexworth_activity_feed',
        maxEvents: 50,          // Max events to store
        displayCount: 8,        // Events to show in compact view
        expandedCount: 25       // Events to show in expanded view
    };

    // Event type definitions with icons and message templates
    const EVENT_TYPES = {
        module_complete: {
            icon: '✓',
            prefix: 'INTEL ACQUIRED',
            template: (data) => `Completed: ${data.title || data.moduleId}`,
            color: '#4ade80'
        },
        achievement_unlock: {
            icon: '★',
            prefix: 'COMMENDATION',
            template: (data) => `Unlocked: ${data.title || data.achievementId}`,
            color: '#fbbf24'
        },
        xp_gain: {
            icon: '+',
            prefix: 'XP ACQUIRED',
            template: (data) => `+${data.amount} XP${data.reason ? ` - ${data.reason}` : ''}`,
            color: '#60a5fa'
        },
        level_up: {
            icon: '▲',
            prefix: 'RANK ADVANCEMENT',
            template: (data) => `Promoted to Level ${data.level}`,
            color: '#a78bfa'
        },
        login: {
            icon: '◉',
            prefix: 'CONNECTION',
            template: (data) => data.streak > 1 ? `Secure link established - ${data.streak} day streak` : 'Secure link established',
            color: '#22d3ee'
        },
        streak: {
            icon: '🔥',
            prefix: 'STREAK BONUS',
            template: (data) => `${data.days}-day streak maintained`,
            color: '#f97316'
        },
        house_join: {
            icon: '⌂',
            prefix: 'ASSIGNMENT',
            template: (data) => `Inducted into ${data.houseName}`,
            color: '#ec4899'
        },
        mission_complete: {
            icon: '◆',
            prefix: 'MISSION COMPLETE',
            template: (data) => `${data.title} - ${data.rating || 'Success'}`,
            color: '#10b981'
        },
        leaderboard_rank: {
            icon: '↑',
            prefix: 'RANK CHANGE',
            template: (data) => `Now #${data.rank} on ${data.board || 'leaderboard'}`,
            color: '#8b5cf6'
        },
        directive: {
            icon: '⚐',
            prefix: 'DIRECTIVE',
            template: (data) => data.message,
            color: '#f59e0b'
        },
        intel: {
            icon: '◈',
            prefix: 'INTEL REPORT',
            template: (data) => data.message,
            color: '#38bdf8'
        },
        directive_complete: {
            icon: '✦',
            prefix: 'MISSION COMPLETE',
            template: (data) => data.message,
            color: '#4ade80'
        },
        system: {
            icon: '⚡',
            prefix: 'HANDLER',
            template: (data) => data.message,
            color: '#94a3b8'
        }
    };

    // In-memory cache
    let events = [];
    let isExpanded = false;
    let containerEl = null;

    /**
     * Initialize the activity feed
     */
    function init() {
        loadFromStorage();
    }

    /**
     * Load events from localStorage
     */
    function loadFromStorage() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                events = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('[ActivityFeed] Failed to load from storage:', e);
            events = [];
        }
    }

    /**
     * Save events to localStorage
     */
    function saveToStorage() {
        try {
            // Trim to max events
            if (events.length > CONFIG.maxEvents) {
                events = events.slice(-CONFIG.maxEvents);
            }
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(events));
        } catch (e) {
            console.warn('[ActivityFeed] Failed to save to storage:', e);
        }
    }

    /**
     * Record a new activity event
     * @param {string} type - Event type (module_complete, achievement_unlock, etc.)
     * @param {object} data - Event-specific data
     * @param {number} [timestamp] - Optional timestamp (for queued events)
     */
    function record(type, data = {}, timestamp) {
        const eventType = EVENT_TYPES[type];
        if (!eventType) {
            console.warn('[ActivityFeed] Unknown event type:', type);
            return;
        }

        const event = {
            id: generateId(),
            type,
            data,
            timestamp: timestamp || Date.now()
        };

        events.push(event);
        saveToStorage();

        // Update UI if rendered
        if (containerEl) {
            renderFeed(containerEl);
            highlightNewEvent(event.id);
        }

        // Sync to Firestore if signed in
        syncToFirestore(event);

    }

    /**
     * Generate unique event ID
     */
    function generateId() {
        return 'evt_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Format timestamp in military/spy style
     */
    function formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        // Less than 1 minute
        if (diff < 60000) {
            return 'JUST NOW';
        }

        // Less than 1 hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins}M AGO`;
        }

        // Less than 24 hours
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}H AGO`;
        }

        // More than 24 hours - show date
        const date = new Date(timestamp);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    }

    /**
     * Drain queued activity events written by module pages.
     * Module pages can't load ActivityFeed.js so they write to a
     * localStorage queue. This drains it on dashboard load.
     */
    function drainQueue() {
        const key = 'hexworth_activity_queue';
        try {
            const queue = JSON.parse(localStorage.getItem(key) || '[]');
            if (queue.length === 0) return;
            queue.forEach(evt => record(evt.type, evt.data, evt.timestamp));
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('[ActivityFeed] Failed to drain queue:', e);
            localStorage.removeItem(key);
        }
    }

    /**
     * Render the activity feed into a container
     * @param {HTMLElement} container - Container element
     * @param {object} options - Render options
     */
    function render(container, options = {}) {
        containerEl = container;
        drainQueue();
        renderFeed(container, options);
    }

    /**
     * Internal render function
     */
    function renderFeed(container, options = {}) {
        const displayEvents = isExpanded
            ? events.slice(-CONFIG.expandedCount).reverse()
            : events.slice(-CONFIG.displayCount).reverse();

        const hasMore = events.length > CONFIG.displayCount;

        container.innerHTML = `
            <div class="activity-feed-container${isExpanded ? ' expanded' : ''}">
                <div class="activity-feed-header">
                    <div class="activity-feed-title">
                        <span class="feed-icon">◢</span>
                        HANDLER COMMS
                    </div>
                    <div class="activity-feed-status">
                        <span class="status-dot"></span>
                        LIVE
                    </div>
                </div>

                ${typeof DailyDirectives !== 'undefined' ? DailyDirectives.renderPinned() : ''}

                <div class="activity-feed-terminal">
                    ${displayEvents.length === 0 ? `
                        <div class="feed-empty">
                            <div class="empty-icon">◇</div>
                            <div class="empty-text">Awaiting transmissions...</div>
                            <div class="empty-subtext">Complete modules to see activity</div>
                        </div>
                    ` : `
                        <div class="feed-events">
                            ${displayEvents.map(event => renderEvent(event)).join('')}
                        </div>
                    `}
                </div>

                ${hasMore && !isExpanded ? `
                    <button class="feed-expand-btn" onclick="ActivityFeed.toggleExpand()">
                        <span class="expand-icon">▼</span>
                        VIEW MORE (${events.length - CONFIG.displayCount})
                    </button>
                ` : ''}

                ${isExpanded ? `
                    <button class="feed-expand-btn" onclick="ActivityFeed.toggleExpand()">
                        <span class="expand-icon">▲</span>
                        COLLAPSE
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render a single event
     */
    function renderEvent(event) {
        const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.system;
        const message = eventType.template(event.data);
        const time = formatTime(event.timestamp);

        return `
            <div class="feed-event" data-event-id="${event.id}" style="--event-color: ${eventType.color}">
                <div class="event-indicator">
                    <span class="event-icon">${eventType.icon}</span>
                </div>
                <div class="event-content">
                    <div class="event-prefix">${eventType.prefix}</div>
                    <div class="event-message">${message}</div>
                </div>
                <div class="event-time">${time}</div>
            </div>
        `;
    }

    /**
     * Highlight a newly added event
     */
    function highlightNewEvent(eventId) {
        setTimeout(() => {
            const eventEl = document.querySelector(`[data-event-id="${eventId}"]`);
            if (eventEl) {
                eventEl.classList.add('new-event');
                setTimeout(() => eventEl.classList.remove('new-event'), 2000);
            }
        }, 50);
    }

    /**
     * Toggle expanded view
     */
    function toggleExpand() {
        isExpanded = !isExpanded;
        if (containerEl) {
            renderFeed(containerEl);
        }
    }

    /**
     * Sync event to Firestore
     */
    async function syncToFirestore(event) {
        if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn()) {
            return;
        }

        try {
            if (typeof FirestoreManager !== 'undefined') {
                const user = FirebaseAuth.getUser();
                if (user) {
                    // Add to user's activity array in Firestore
                    await FirestoreManager.setUserProfile(user.uid, {
                        lastActivity: event
                    });
                }
            }
        } catch (e) {
            console.warn('[ActivityFeed] Failed to sync to Firestore:', e);
        }
    }

    /**
     * Load activity from Firestore (for new device sync)
     */
    async function loadFromFirestore() {
        if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn()) {
            return;
        }

        try {
            if (typeof FirestoreManager !== 'undefined') {
                const user = FirebaseAuth.getUser();
                if (user) {
                    const profile = await FirestoreManager.getUserProfile(user.uid);
                    if (profile?.activityFeed && Array.isArray(profile.activityFeed)) {
                        // Merge with local events
                        const cloudEvents = profile.activityFeed;
                        const localIds = new Set(events.map(e => e.id));
                        const newEvents = cloudEvents.filter(e => !localIds.has(e.id));
                        events = [...events, ...newEvents].sort((a, b) => a.timestamp - b.timestamp);
                        saveToStorage();
                    }
                }
            }
        } catch (e) {
            console.warn('[ActivityFeed] Failed to load from Firestore:', e);
        }
    }

    /**
     * Get CSS styles for the activity feed
     */
    function getStyles() {
        return `
            /* Activity Feed - Handler Comms Style */
            .activity-feed-container {
                background: linear-gradient(180deg, rgba(0, 20, 10, 0.95) 0%, rgba(0, 15, 8, 0.98) 100%);
                border: 1px solid rgba(34, 197, 94, 0.3);
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                overflow: hidden;
                position: relative;
            }

            .activity-feed-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.5), transparent);
            }

            .activity-feed-container.expanded {
                max-height: 500px;
            }

            .activity-feed-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 14px;
                border-bottom: 1px solid rgba(34, 197, 94, 0.2);
                background: rgba(34, 197, 94, 0.05);
            }

            .activity-feed-title {
                font-size: 0.75rem;
                font-weight: 600;
                color: #22c55e;
                letter-spacing: 0.15em;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .feed-icon {
                font-size: 0.9rem;
                animation: feedPulse 2s infinite;
            }

            @keyframes feedPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .activity-feed-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.65rem;
                color: #ef4444;
                letter-spacing: 0.1em;
            }

            .status-dot {
                width: 6px;
                height: 6px;
                background: #ef4444;
                border-radius: 50%;
                animation: statusBlink 1s infinite;
            }

            @keyframes statusBlink {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.3; }
            }

            .activity-feed-terminal {
                padding: 10px;
                max-height: 280px;
                overflow-y: auto;
            }

            .activity-feed-container.expanded .activity-feed-terminal {
                max-height: 400px;
            }

            /* Scrollbar styling */
            .activity-feed-terminal::-webkit-scrollbar {
                width: 4px;
            }

            .activity-feed-terminal::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.3);
            }

            .activity-feed-terminal::-webkit-scrollbar-thumb {
                background: rgba(34, 197, 94, 0.4);
                border-radius: 2px;
            }

            .feed-empty {
                text-align: center;
                padding: 30px 20px;
                color: #4a5568;
            }

            .empty-icon {
                font-size: 1.5rem;
                color: #22c55e;
                opacity: 0.4;
                margin-bottom: 10px;
            }

            .empty-text {
                font-size: 0.8rem;
                color: #666;
                margin-bottom: 5px;
            }

            .empty-subtext {
                font-size: 0.7rem;
                color: #555;
            }

            .feed-events {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .feed-event {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 8px 10px;
                background: rgba(0, 0, 0, 0.3);
                border-left: 2px solid var(--event-color, #22c55e);
                border-radius: 0 4px 4px 0;
                transition: all 0.3s ease;
            }

            .feed-event:hover {
                background: rgba(34, 197, 94, 0.1);
            }

            .feed-event.new-event {
                animation: newEventFlash 0.5s ease;
            }

            @keyframes newEventFlash {
                0% { background: rgba(34, 197, 94, 0.4); }
                100% { background: rgba(0, 0, 0, 0.3); }
            }

            .event-indicator {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--event-color, #22c55e);
                font-size: 0.8rem;
            }

            .event-content {
                flex: 1;
                min-width: 0;
            }

            .event-prefix {
                font-size: 0.6rem;
                color: var(--event-color, #22c55e);
                letter-spacing: 0.1em;
                margin-bottom: 2px;
                opacity: 0.8;
            }

            .event-message {
                font-size: 0.75rem;
                color: #a0aec0;
                line-height: 1.3;
                word-break: break-word;
            }

            .event-time {
                flex-shrink: 0;
                font-size: 0.6rem;
                color: #4a5568;
                letter-spacing: 0.05em;
            }

            .feed-expand-btn {
                width: 100%;
                padding: 10px;
                background: rgba(34, 197, 94, 0.1);
                border: none;
                border-top: 1px solid rgba(34, 197, 94, 0.2);
                color: #22c55e;
                font-family: 'Courier New', monospace;
                font-size: 0.7rem;
                letter-spacing: 0.1em;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s ease;
            }

            .feed-expand-btn:hover {
                background: rgba(34, 197, 94, 0.2);
            }

            .expand-icon {
                font-size: 0.6rem;
            }

            /* Magic theme override */
            .theme-magic .activity-feed-container {
                background: linear-gradient(180deg, rgba(20, 10, 30, 0.95) 0%, rgba(15, 8, 25, 0.98) 100%);
                border-color: rgba(159, 122, 234, 0.3);
            }

            .theme-magic .activity-feed-container::before {
                background: linear-gradient(90deg, transparent, rgba(159, 122, 234, 0.5), transparent);
            }

            .theme-magic .activity-feed-header {
                border-bottom-color: rgba(159, 122, 234, 0.2);
                background: rgba(159, 122, 234, 0.05);
            }

            .theme-magic .activity-feed-title {
                color: #a78bfa;
            }

            .theme-magic .feed-event {
                border-left-color: #a78bfa;
            }

            .theme-magic .feed-event:hover {
                background: rgba(159, 122, 234, 0.1);
            }

            .theme-magic .activity-feed-terminal::-webkit-scrollbar-thumb {
                background: rgba(159, 122, 234, 0.4);
            }

            .theme-magic .feed-expand-btn {
                background: rgba(159, 122, 234, 0.1);
                border-top-color: rgba(159, 122, 234, 0.2);
                color: #a78bfa;
            }

            .theme-magic .feed-expand-btn:hover {
                background: rgba(159, 122, 234, 0.2);
            }

            .theme-magic .empty-icon {
                color: #a78bfa;
            }
        `;
    }

    /**
     * Clear all activity (for testing/reset)
     */
    function clear() {
        events = [];
        saveToStorage();
        if (containerEl) {
            renderFeed(containerEl);
        }
    }

    /**
     * Get all events (for debugging)
     */
    function getEvents() {
        return [...events];
    }

    // Initialize on load
    init();

    // Public API
    return {
        record,
        render,
        toggleExpand,
        loadFromFirestore,
        getStyles,
        clear,
        getEvents,

        // Convenience methods for common events
        moduleComplete: (moduleId, title) => record('module_complete', { moduleId, title }),
        achievementUnlock: (achievementId, title) => record('achievement_unlock', { achievementId, title }),
        xpGain: (amount, reason) => record('xp_gain', { amount, reason }),
        levelUp: (level) => record('level_up', { level }),
        login: (streak) => record('login', { streak }),
        missionComplete: (title, rating) => record('mission_complete', { title, rating }),
        systemMessage: (message) => record('system', { message })
    };
})();

// Make globally available
window.ActivityFeed = ActivityFeed;
