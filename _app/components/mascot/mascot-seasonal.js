/**
 * mascot-seasonal.js — Seasonal variant system for Mascot Digital Life
 *
 * Determines the current season/holiday and returns CSS classes + metadata.
 * Seasons:
 *   Spring (Mar-May), Summer (Jun-Aug), Fall (Sep-Nov), Winter (Dec-Feb)
 * Holidays:
 *   Halloween (Oct 20-31), Winter Holidays (Dec 15-31)
 *
 * Usage:
 *   const info = MascotSeasonal.getCurrentSeason();
 *   // { season: 'winter', cssClass: 'mascot-season-winter', label: 'Winter', isHoliday: false }
 *
 *   MascotSeasonal.applyToElement(el);
 *   MascotSeasonal.getSeasonalGreeting('shield');
 *
 * @version 1.0.0
 */

var MascotSeasonal = (function () {
    'use strict';

    // ========================================
    // SEASON DEFINITIONS
    // ========================================

    var SEASONS = {
        spring: {
            months: [2, 3, 4],  // Mar, Apr, May (0-indexed)
            cssClass: 'mascot-season-spring',
            label: 'Spring',
            palette: { accent: '#86efac', glow: 'rgba(134, 239, 172, 0.3)' }
        },
        summer: {
            months: [5, 6, 7],
            cssClass: 'mascot-season-summer',
            label: 'Summer',
            palette: { accent: '#facc15', glow: 'rgba(250, 204, 21, 0.3)' }
        },
        fall: {
            months: [8, 9, 10],
            cssClass: 'mascot-season-fall',
            label: 'Fall',
            palette: { accent: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' }
        },
        winter: {
            months: [11, 0, 1],
            cssClass: 'mascot-season-winter',
            label: 'Winter',
            palette: { accent: '#bae6fd', glow: 'rgba(186, 230, 253, 0.3)' }
        }
    };

    var HOLIDAYS = {
        halloween: {
            month: 9,      // October (0-indexed)
            startDay: 20,
            endDay: 31,
            cssClass: 'mascot-season-halloween',
            label: 'Halloween',
            palette: { accent: '#f97316', glow: 'rgba(249, 115, 22, 0.5)' }
        },
        winterHoliday: {
            month: 11,     // December
            startDay: 15,
            endDay: 31,
            cssClass: 'mascot-season-holiday',
            label: 'Winter Holidays',
            palette: { accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' }
        }
    };

    // Per-mascot seasonal greetings
    var SEASONAL_GREETINGS = {
        spring: {
            shield:    'Spring patrol. Perimeter clear.',
            dark_arts: 'New vulnerabilities bloom in spring.',
            eye:       'Fresh intel emerging.',
            cloud:     'Scaling with the season.',
            forge:     'Spring cleaning the servers.',
            web:       'Network traffic thawing.',
            code:      'New branch: spring-release.',
            key:       'Rotating seasonal keys.',
            script:    'Spring cron jobs scheduled.',
            ai:        'Retraining on spring data.',
            matrix:    'Seasonal pattern shift detected.'
        },
        summer: {
            shield:    'Summer heat. Vigilance unchanged.',
            dark_arts: 'Summer of exploits.',
            eye:       'Long days. More to observe.',
            cloud:     'Peak capacity season.',
            forge:     'Forge runs hot in summer.',
            web:       'Bandwidth at maximum.',
            code:      'Summer sprint underway.',
            key:       'Encryption holds in any heat.',
            script:    'Summer uptime: 100%.',
            ai:        'GPU temps nominal.',
            matrix:    'Summer matrix stable.'
        },
        fall: {
            shield:    'Fall back to hardened positions.',
            dark_arts: 'Shadows grow longer.',
            eye:       'Harvesting autumn intel.',
            cloud:     'Migrating workloads.',
            forge:     'Forging winter preparations.',
            web:       'Leaf nodes shedding.',
            code:      'Code freeze approaching.',
            key:       'Autumn key ceremony.',
            script:    'Fall cleanup scripts running.',
            ai:        'Model autumn tuning.',
            matrix:    'Fall recalibration complete.'
        },
        winter: {
            shield:    'Winter garrison holding.',
            dark_arts: 'Cold exploits run silent.',
            eye:       'Frost reveals hidden tracks.',
            cloud:     'Winter redundancy active.',
            forge:     'Forge fires burn brightest in cold.',
            web:       'Network iced but operational.',
            code:      'Frozen branch. No merges.',
            key:       'Keys safe in the cold vault.',
            script:    'Winter maintenance window.',
            ai:        'Cold start optimization.',
            matrix:    'Winter geometry crystallized.'
        }
    };

    // ========================================
    // CORE FUNCTIONS
    // ========================================

    /**
     * Get current season info
     * @param {Date} [date] — optional date override for testing
     * @returns {{ season: string, cssClass: string, label: string, isHoliday: boolean, holiday: string|null, palette: object }}
     */
    function getCurrentSeason(date) {
        var d = date || new Date();
        var month = d.getMonth();
        var day = d.getDate();

        // Check holidays first (they override base season)
        var holidayKey = null;
        var keys = Object.keys(HOLIDAYS);
        for (var i = 0; i < keys.length; i++) {
            var h = HOLIDAYS[keys[i]];
            if (month === h.month && day >= h.startDay && day <= h.endDay) {
                holidayKey = keys[i];
                break;
            }
        }

        if (holidayKey) {
            var hol = HOLIDAYS[holidayKey];
            return {
                season: holidayKey,
                cssClass: hol.cssClass,
                label: hol.label,
                isHoliday: true,
                holiday: holidayKey,
                palette: hol.palette
            };
        }

        // Determine base season
        var seasonKey = 'spring'; // default
        var sKeys = Object.keys(SEASONS);
        for (var j = 0; j < sKeys.length; j++) {
            if (SEASONS[sKeys[j]].months.indexOf(month) !== -1) {
                seasonKey = sKeys[j];
                break;
            }
        }

        var season = SEASONS[seasonKey];
        return {
            season: seasonKey,
            cssClass: season.cssClass,
            label: season.label,
            isHoliday: false,
            holiday: null,
            palette: season.palette
        };
    }

    /**
     * Apply seasonal CSS class to an element
     * @param {HTMLElement} el
     * @param {Date} [date]
     */
    function applyToElement(el, date) {
        if (!el) return;

        // Remove all seasonal classes
        var allClasses = ['mascot-season-spring', 'mascot-season-summer', 'mascot-season-fall',
            'mascot-season-winter', 'mascot-season-halloween', 'mascot-season-holiday'];
        for (var i = 0; i < allClasses.length; i++) {
            el.classList.remove(allClasses[i]);
        }

        var info = getCurrentSeason(date);
        if (info.cssClass) {
            el.classList.add(info.cssClass);
        }
    }

    /**
     * Get a seasonal greeting for a specific mascot
     * @param {string} house
     * @param {Date} [date]
     * @returns {string}
     */
    function getSeasonalGreeting(house, date) {
        var info = getCurrentSeason(date);
        var baseSeason = info.isHoliday ? _getBaseSeason(date) : info.season;
        var houseKey = house.replace(/-/g, '_');
        var greetings = SEASONAL_GREETINGS[baseSeason];
        if (greetings && greetings[houseKey]) {
            return greetings[houseKey];
        }
        return 'Season: ' + info.label;
    }

    /**
     * Get base season even during holidays
     */
    function _getBaseSeason(date) {
        var d = date || new Date();
        var month = d.getMonth();
        var sKeys = Object.keys(SEASONS);
        for (var i = 0; i < sKeys.length; i++) {
            if (SEASONS[sKeys[i]].months.indexOf(month) !== -1) {
                return sKeys[i];
            }
        }
        return 'spring';
    }

    /**
     * Get seasonal palette colors
     * @param {Date} [date]
     * @returns {{ accent: string, glow: string }}
     */
    function getSeasonalPalette(date) {
        var info = getCurrentSeason(date);
        return info.palette;
    }

    // ========================================
    // PUBLIC API
    // ========================================

    return {
        getCurrentSeason: getCurrentSeason,
        applyToElement: applyToElement,
        getSeasonalGreeting: getSeasonalGreeting,
        getSeasonalPalette: getSeasonalPalette,
        SEASONS: SEASONS,
        HOLIDAYS: HOLIDAYS
    };
})();
