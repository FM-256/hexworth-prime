/**
 * WallOfShame.js - TripWire Incident Display for Hexworth Prime
 *
 * Reads hexworth_tripwire_log from localStorage and renders incident
 * cards, global stats (Firestore if available, local fallback), and
 * TripWire achievement badges on the Wall of Shame page.
 *
 * Listens for live hexworth:tripwire events to update in real time.
 *
 * @version 1.0.0
 */
(function() {
    'use strict';

    // ── Guard: only run on the Wall of Shame page ──
    if (!document.getElementById('local-entries')) return;

    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════

    var TRIPWIRE_LOG_KEY = 'hexworth_tripwire_log';
    var ACHIEVEMENTS_KEY = 'hexworth_achievements_v2';
    var MAX_DISPLAY = 50;
    var COUNTER_DURATION = 2000; // ms
    var ICON_BASE = '/assets/images/icons/';

    // Sensor display metadata
    var SENSOR_META = {
        storage:  { name: 'Storage Tampering',   icon: 'icon-database.webp',  severity: 'high'   },
        runtime:  { name: 'Runtime Manipulation', icon: 'icon-tools.webp',     severity: 'high'   },
        dom:      { name: 'DOM Tampering',        icon: 'icon-web.webp',       severity: 'medium' },
        console:  { name: 'Console Injection',    icon: 'icon-laptop.webp',    severity: 'medium' },
        timer:    { name: 'Timer Manipulation',   icon: 'icon-clock.webp',     severity: 'medium' },
        decoy:    { name: 'Honeypot Access',      icon: 'icon-honey.webp',     severity: 'high'   },
        xss:      { name: 'XSS Attempt',          icon: 'icon-syringe.webp',   severity: 'low'    }
    };

    // TripWire achievement definitions
    var TRIPWIRE_BADGES = {
        tripwire_busted:         { name: 'Busted!',         description: 'First catch by any sensor',       points: 50  },
        tripwire_repeat:         { name: 'Repeat Offender', description: 'Caught 3 times',                  points: 75  },
        tripwire_script_kiddie:  { name: 'Script Kiddie',   description: 'Console injection caught',        points: 50  },
        tripwire_manipulator:    { name: 'The Manipulator', description: 'DOM tampering caught',             points: 50  },
        tripwire_storage_raider: { name: 'Storage Raider',  description: 'localStorage tampering caught',   points: 50  },
        tripwire_time_bandit:    { name: 'Time Bandit',     description: 'Timer manipulation caught',       points: 50  },
        tripwire_decoy_victim:   { name: 'Decoy Victim',    description: 'Submitted honeypot flag',         points: 100 },
        tripwire_xss_artist:    { name: 'XSS Artist',      description: 'XSS attempt outside lab',         points: 50  },
        tripwire_hall_of_fame:   { name: 'Hall of Fame',    description: '5+ different sensors triggered',  points: 250 }
    };

    // Fallback sensor meta for unknown types
    var UNKNOWN_SENSOR = { name: 'Unknown Sensor', icon: 'icon-alert.webp', severity: 'low' };

    // ═══════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Basic XSS prevention for rendering user-facing detail text.
     */
    function sanitize(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Convert ISO timestamp to relative time string.
     */
    function formatRelativeTime(isoString) {
        if (!isoString) return 'unknown';
        var then = new Date(isoString).getTime();
        if (isNaN(then)) return 'unknown';
        var now = Date.now();
        var diff = Math.max(0, now - then);
        var seconds = Math.floor(diff / 1000);

        if (seconds < 60)   return seconds + 's ago';
        var minutes = Math.floor(seconds / 60);
        if (minutes < 60)   return minutes + 'm ago';
        var hours = Math.floor(minutes / 60);
        if (hours < 24)     return hours + 'h ago';
        var days = Math.floor(hours / 24);
        if (days < 30)      return days + 'd ago';
        var months = Math.floor(days / 30);
        if (months < 12)    return months + 'mo ago';
        var years = Math.floor(months / 12);
        return years + 'y ago';
    }

    /**
     * Read and parse a JSON key from localStorage. Returns fallback on failure.
     */
    function readStorage(key, fallback) {
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    }

    /**
     * Get sensor metadata, falling back gracefully for unknown types.
     */
    function getSensorMeta(type) {
        return SENSOR_META[type] || UNKNOWN_SENSOR;
    }

    // ═══════════════════════════════════════════════════════════════════
    // COUNTER ANIMATION
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Animate a counter element from 0 to target over COUNTER_DURATION ms.
     * Uses ease-out cubic for dramatic ramp.
     */
    function animateCounter(target) {
        var el = document.getElementById('incident-counter');
        if (!el) return;
        if (target === 0) { el.textContent = '0'; return; }

        var start = performance.now();

        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / COUNTER_DURATION, 1);
            // ease-out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(eased * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }

        requestAnimationFrame(tick);
    }

    // ═══════════════════════════════════════════════════════════════════
    // LOCAL ENTRIES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Render tripwire log entries into #local-entries.
     */
    function renderLocalEntries(entries) {
        var container = document.getElementById('local-entries');
        if (!container) return;

        if (!entries || entries.length === 0) {
            container.innerHTML =
                '<div class="wos-empty">' +
                '<img src="' + ICON_BASE + 'icon-checkmark.webp" class="empty-icon" alt="">' +
                '<p>Clean record. For now.</p>' +
                '</div>';
            return;
        }

        // Sort newest first
        var sorted = entries.slice().sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        // Cap at MAX_DISPLAY
        var display = sorted.slice(0, MAX_DISPLAY);
        var html = '';

        for (var i = 0; i < display.length; i++) {
            html += buildEntryCard(display[i]);
        }

        if (sorted.length > MAX_DISPLAY) {
            html +=
                '<div class="wos-overflow">' +
                '... and ' + (sorted.length - MAX_DISPLAY) + ' more incidents' +
                '</div>';
        }

        container.innerHTML = html;
    }

    /**
     * Build HTML string for a single incident entry card.
     */
    function buildEntryCard(entry) {
        var meta = getSensorMeta(entry.sensor || entry.type);
        var detail = sanitize(entry.detail || entry.message || 'No details recorded');
        var page = sanitize(entry.page || entry.url || 'Unknown page');
        var time = formatRelativeTime(entry.timestamp);

        return (
            '<div class="wos-entry" data-sensor="' + sanitize(entry.sensor || entry.type || '') + '">' +
                '<div class="entry-header">' +
                    '<img src="' + ICON_BASE + meta.icon + '" class="entry-icon" alt="">' +
                    '<span class="entry-sensor">' + sanitize(meta.name) + '</span>' +
                    '<span class="severity-badge severity-' + meta.severity + '">' +
                        meta.severity.toUpperCase() +
                    '</span>' +
                    '<span class="entry-time">' + time + '</span>' +
                '</div>' +
                '<div class="entry-detail">' + detail + '</div>' +
                '<div class="entry-page">' + page + '</div>' +
            '</div>'
        );
    }

    /**
     * Prepend a new entry with flash animation (for live updates).
     */
    function prependEntry(entry) {
        var container = document.getElementById('local-entries');
        if (!container) return;

        // Remove the empty-state message if present
        var empty = container.querySelector('.wos-empty');
        if (empty) empty.remove();

        var tmp = document.createElement('div');
        tmp.innerHTML = buildEntryCard(entry);
        var card = tmp.firstChild;
        card.classList.add('wos-entry-flash');

        container.insertBefore(card, container.firstChild);

        // Remove flash class after animation
        setTimeout(function() {
            card.classList.remove('wos-entry-flash');
        }, 1200);

        // Trim excess cards
        var cards = container.querySelectorAll('.wos-entry');
        while (cards.length > MAX_DISPLAY) {
            container.removeChild(cards[cards.length - 1]);
            cards = container.querySelectorAll('.wos-entry');
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // GLOBAL STATS
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Attempt to load global stats from Firestore; fall back to offline display.
     */
    function loadGlobalStats() {
        if (typeof firebase === 'undefined' || !firebase.firestore) {
            renderOfflineStats();
            return;
        }

        firebase.firestore().doc('tripwire_stats/global').get()
            .then(function(doc) {
                if (doc.exists) {
                    renderGlobalStats(doc.data());
                } else {
                    renderOfflineStats();
                }
            })
            .catch(function() {
                renderOfflineStats();
            });
    }

    /**
     * Render global stats from Firestore data.
     */
    function renderGlobalStats(data) {
        var container = document.getElementById('global-stats');
        if (!container) return;

        var totalCaught = data.totalCaught || 0;
        var methods = data.methods || {};
        var lastEvent = data.lastEvent || null;

        // Find the max method count for bar scaling
        var maxCount = 0;
        var methodKeys = Object.keys(methods);
        for (var i = 0; i < methodKeys.length; i++) {
            if (methods[methodKeys[i]] > maxCount) {
                maxCount = methods[methodKeys[i]];
            }
        }

        var barsHtml = '';
        for (var j = 0; j < methodKeys.length; j++) {
            var key = methodKeys[j];
            var count = methods[key];
            var meta = getSensorMeta(key);
            var pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

            barsHtml +=
                '<div class="stat-bar-row">' +
                    '<span class="stat-bar-label">' + sanitize(meta.name) + '</span>' +
                    '<div class="stat-bar-track">' +
                        '<div class="stat-bar-fill severity-bg-' + meta.severity + '" ' +
                            'style="width:' + pct + '%"></div>' +
                    '</div>' +
                    '<span class="stat-bar-count">' + count.toLocaleString() + '</span>' +
                '</div>';
        }

        var lastStr = lastEvent ? formatRelativeTime(lastEvent) : 'never';

        container.innerHTML =
            '<div class="global-stats-panel">' +
                '<div class="stat-header">' +
                    '<img src="' + ICON_BASE + 'icon-globe.webp" class="stat-icon" alt="">' +
                    '<span class="stat-title">GLOBAL INCIDENT FEED</span>' +
                '</div>' +
                '<div class="stat-total">' +
                    '<span class="stat-number">' + totalCaught.toLocaleString() + '</span>' +
                    '<span class="stat-label">total incidents across all cadets</span>' +
                '</div>' +
                '<div class="stat-bars">' + barsHtml + '</div>' +
                '<div class="stat-footer">Last event: ' + lastStr + '</div>' +
            '</div>';
    }

    /**
     * Render offline/unavailable stats message.
     */
    function renderOfflineStats() {
        var container = document.getElementById('global-stats');
        if (!container) return;

        container.innerHTML =
            '<div class="global-stats-offline">' +
                '<img src="' + ICON_BASE + 'icon-disconnect.webp" class="offline-icon" alt="">' +
                '<p>[ GLOBAL STATS UNAVAILABLE — LOCAL MODE ]</p>' +
            '</div>';
    }

    // ═══════════════════════════════════════════════════════════════════
    // BADGES
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Render TripWire achievement badges into #badge-grid.
     */
    function renderBadges() {
        var container = document.getElementById('badge-grid');
        if (!container) return;

        var achievements = readStorage(ACHIEVEMENTS_KEY, {});
        var badgeKeys = Object.keys(TRIPWIRE_BADGES);
        var html = '';

        for (var i = 0; i < badgeKeys.length; i++) {
            var id = badgeKeys[i];
            var badge = TRIPWIRE_BADGES[id];
            var unlocked = !!(achievements[id] && achievements[id].unlocked);

            if (unlocked) {
                html +=
                    '<div class="badge-card badge-unlocked">' +
                        '<div class="badge-glow"></div>' +
                        '<img src="' + ICON_BASE + 'icon-trophy.webp" class="badge-icon" alt="">' +
                        '<div class="badge-name">' + sanitize(badge.name) + '</div>' +
                        '<div class="badge-desc">' + sanitize(badge.description) + '</div>' +
                        '<div class="badge-points">+' + badge.points + ' XP</div>' +
                    '</div>';
            } else {
                html +=
                    '<div class="badge-card badge-locked">' +
                        '<img src="' + ICON_BASE + 'icon-lock.webp" class="badge-icon badge-icon-locked" alt="">' +
                        '<div class="badge-name">???</div>' +
                        '<div class="badge-desc">LOCKED</div>' +
                        '<div class="badge-points">' + badge.points + ' XP</div>' +
                    '</div>';
            }
        }

        container.innerHTML = html;
    }

    // ═══════════════════════════════════════════════════════════════════
    // LOCAL STATS SUMMARY
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Build a local summary from the tripwire log for the stats header.
     */
    function renderLocalSummary(entries) {
        var totalEl = document.getElementById('incident-counter');
        if (!totalEl) return;

        var total = entries ? entries.length : 0;
        animateCounter(total);

        // Unique sensors triggered
        var sensorEl = document.getElementById('sensor-count');
        if (sensorEl && entries) {
            var sensors = {};
            for (var i = 0; i < entries.length; i++) {
                var s = entries[i].sensor || entries[i].type;
                if (s) sensors[s] = true;
            }
            sensorEl.textContent = Object.keys(sensors).length;
        }

        // Last incident time
        var lastEl = document.getElementById('last-incident');
        if (lastEl && entries && entries.length > 0) {
            var sorted = entries.slice().sort(function(a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            lastEl.textContent = formatRelativeTime(sorted[0].timestamp);
        } else if (lastEl) {
            lastEl.textContent = 'never';
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // LIVE UPDATES
    // ═══════════════════════════════════════════════════════════════════

    var _currentCount = 0;

    /**
     * Handle a live tripwire event while the page is open.
     */
    function onTripwireEvent(e) {
        var entry = e.detail;
        if (!entry) return;

        // Prepend to display
        prependEntry(entry);

        // Update counter
        _currentCount++;
        var counterEl = document.getElementById('incident-counter');
        if (counterEl) {
            counterEl.textContent = _currentCount.toLocaleString();
        }

        // Update sensor count
        var entries = readStorage(TRIPWIRE_LOG_KEY, []);
        var sensors = {};
        for (var i = 0; i < entries.length; i++) {
            var s = entries[i].sensor || entries[i].type;
            if (s) sensors[s] = true;
        }
        var sensorEl = document.getElementById('sensor-count');
        if (sensorEl) {
            sensorEl.textContent = Object.keys(sensors).length;
        }

        // Update last incident
        var lastEl = document.getElementById('last-incident');
        if (lastEl) {
            lastEl.textContent = 'just now';
        }

        // Re-render badges (new trips might unlock them)
        renderBadges();
    }

    // ═══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    function init() {
        var entries = readStorage(TRIPWIRE_LOG_KEY, []);
        _currentCount = entries.length;

        // Render all sections
        renderLocalEntries(entries);
        renderLocalSummary(entries);
        renderBadges();
        loadGlobalStats();

        // Listen for live tripwire events
        document.addEventListener('hexworth:tripwire', onTripwireEvent);
    }

    // ── Boot ──
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
