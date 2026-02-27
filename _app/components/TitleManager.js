/**
 * TitleManager.js - GOT-Style Title Progression System
 *
 * Generates compound titles based on user progress across houses:
 * - Layer 1: House Identity ("of the Shield", "of the Cloud")
 * - Layer 2: Skill Tiers per House (Initiate → Apprentice → Journeyman → Master → Grandmaster)
 * - Layer 3: Cross-House Recognition (Dual-Path, Polymath, Prime Architect)
 * - Layer 4: Special Achievement Titles (Gate Keeper, Bug Hunter, etc.)
 *
 * TIER PROGRESSION (per house):
 * - Initiate: 1+ modules completed (0%+)
 * - Apprentice: 5+ modules or 10%+ completion
 * - Journeyman: 15+ modules or 30%+ completion
 * - Master: 30+ modules or 60%+ completion
 * - Grandmaster: 100% completion
 *
 * CROSS-HOUSE TITLES:
 * - Single house: "{Tier} of {House}" (e.g., "Master of the Shield")
 * - Two houses: "Dual-Path {HighestTier}"
 * - Three+ houses: "Polymath {HighestTier}"
 * - All 8 houses: "Prime Architect"
 *
 * SPECIAL TITLES (achievement-based):
 * - Gate Keeper: Complete all 5 Dark Arts gates
 * - Bug Hunter: Report a confirmed bug
 * - Speed Runner: Complete module in under 5 minutes
 * - Night Owl: Study past midnight 10+ times
 * - Streak Master: 30-day study streak
 * - the Divergent: Unlock Divergent status
 * - the Ghost: Complete all 30 Command Line Hacker modules
 * - Shadow Operative: Complete OPERATION BLACKOUT
 *
 * USAGE EXAMPLES:
 *
 * // Get full compound title
 * const title = TitleManager.getFullTitle('Alex');
 * // "Alex, Master of the Shield, Apprentice of the Eye, Dual-Path Master, Gate Keeper"
 *
 * // Get short title (most prestigious)
 * const shortTitle = TitleManager.getShortTitle('Alex');
 * // "Alex, Gate Keeper"
 *
 * // Get tier for specific house
 * const shieldTier = TitleManager.getTier('shield');
 * // "Master"
 *
 * // Get all tiers with progress
 * const allTiers = TitleManager.getAllTiers();
 * // { shield: { tier: 'Master', completed: 25, total: 30, percent: 83 }, ... }
 *
 * // Check active special titles
 * const specialTitles = TitleManager.getActiveTitles();
 * // ['Gate Keeper', 'Night Owl']
 *
 * // Force recalculation (call after progress update)
 * TitleManager.recalculate();
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const TitleManager = (function() {
    'use strict';

    const STORAGE_KEY = 'hexworth_title_data';
    const PROGRESS_KEY = 'hexworth_progress';
    const HOUSE_KEY = 'hexworth_house';

    // ═══════════════════════════════════════════════════════════════════
    // TIER DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════

    const TIERS = {
        INITIATE: { id: 'initiate', name: 'Initiate', minModules: 1, minPercent: 0 },
        APPRENTICE: { id: 'apprentice', name: 'Apprentice', minModules: 5, minPercent: 10 },
        JOURNEYMAN: { id: 'journeyman', name: 'Journeyman', minModules: 15, minPercent: 30 },
        MASTER: { id: 'master', name: 'Master', minModules: 30, minPercent: 60 },
        GRANDMASTER: { id: 'grandmaster', name: 'Grandmaster', minModules: 999, minPercent: 100 }
    };

    const HOUSE_NAMES = {
        web: 'the Web',
        shield: 'the Shield',
        cloud: 'the Cloud',
        forge: 'the Forge',
        script: 'the Script',
        code: 'the Code',
        key: 'the Key',
        eye: 'the Eye',
        'dark-arts': 'the Dark Arts'
    };

    // ═══════════════════════════════════════════════════════════════════
    // SPECIAL TITLES (Achievement-based)
    // ═══════════════════════════════════════════════════════════════════

    const SPECIAL_TITLES = [
        {
            id: 'gate_keeper',
            name: 'Gate Keeper',
            condition: () => {
                // All 5 Dark Arts gates completed
                for (let i = 1; i <= 5; i++) {
                    if (localStorage.getItem(`gate${i}_complete`) !== 'true') {
                        return false;
                    }
                }
                return true;
            }
        },
        {
            id: 'bug_hunter',
            name: 'Bug Hunter',
            condition: () => {
                // Found and reported a bug (set manually via console or bug report system)
                return localStorage.getItem('hexworth_bug_hunter') === 'true';
            }
        },
        {
            id: 'speed_runner',
            name: 'Speed Runner',
            condition: () => {
                // Completed any module in under 5 minutes (tracked in progress data)
                const progress = getProgress();
                for (const house in progress) {
                    for (const module in progress[house]) {
                        if (progress[house][module].completionTime && progress[house][module].completionTime < 300000) {
                            return true;
                        }
                    }
                }
                return false;
            }
        },
        {
            id: 'night_owl',
            name: 'Night Owl',
            condition: () => {
                // Studied past midnight 10+ times
                const nightSessions = parseInt(localStorage.getItem('hexworth_night_sessions') || '0', 10);
                return nightSessions >= 10;
            }
        },
        {
            id: 'streak_master',
            name: 'Streak Master',
            condition: () => {
                // 30-day study streak
                const streak = parseInt(localStorage.getItem('hexworth_streak') || '0', 10);
                return streak >= 30;
            }
        },
        {
            id: 'divergent',
            name: 'the Divergent',
            condition: () => {
                return localStorage.getItem('hexworth_divergent') === 'true';
            }
        },
        {
            id: 'cli_ghost',
            name: 'the Ghost',
            condition: () => {
                // Completed all 30 Command Line Hacker modules
                return typeof AchievementManager !== 'undefined' && AchievementManager.isUnlocked('cli_ghost');
            }
        },
        {
            id: 'shadow_operative',
            name: 'Shadow Operative',
            condition: () => {
                // Completed OPERATION BLACKOUT (CLH-031)
                return typeof AchievementManager !== 'undefined' && AchievementManager.isUnlocked('cli_blackout');
            }
        }
    ];

    // ═══════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    function getProgress() {
        try {
            return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        } catch {
            return {};
        }
    }

    function getUserHouse() {
        return localStorage.getItem(HOUSE_KEY) || null;
    }

    function getHouseModuleCount(houseId) {
        // Use ContentRegistry if available
        if (typeof ContentRegistry !== 'undefined') {
            const houseContent = ContentRegistry.getHouseContent(houseId);
            return houseContent.length;
        }
        return 0;
    }

    function getHouseCompletedCount(houseId) {
        const progress = getProgress();
        const houseProgress = progress[houseId] || {};

        let completed = 0;
        for (const moduleKey in houseProgress) {
            if (houseProgress[moduleKey]?.completed === true) {
                completed++;
            }
        }
        return completed;
    }

    function getHouseCompletionPercent(houseId) {
        const total = getHouseModuleCount(houseId);
        if (total === 0) return 0;

        const completed = getHouseCompletedCount(houseId);
        return Math.round((completed / total) * 100);
    }

    function calculateTier(houseId) {
        const completed = getHouseCompletedCount(houseId);
        const percent = getHouseCompletionPercent(houseId);

        // Grandmaster: 100% completion
        if (percent >= TIERS.GRANDMASTER.minPercent) {
            return TIERS.GRANDMASTER;
        }

        // Master: 60%+ or 30+ modules
        if (percent >= TIERS.MASTER.minPercent || completed >= TIERS.MASTER.minModules) {
            return TIERS.MASTER;
        }

        // Journeyman: 30%+ or 15+ modules
        if (percent >= TIERS.JOURNEYMAN.minPercent || completed >= TIERS.JOURNEYMAN.minModules) {
            return TIERS.JOURNEYMAN;
        }

        // Apprentice: 10%+ or 5+ modules
        if (percent >= TIERS.APPRENTICE.minPercent || completed >= TIERS.APPRENTICE.minModules) {
            return TIERS.APPRENTICE;
        }

        // Initiate: 1+ module
        if (completed >= TIERS.INITIATE.minModules) {
            return TIERS.INITIATE;
        }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════════
    // TITLE GENERATION
    // ═══════════════════════════════════════════════════════════════════

    function getAllTiers() {
        const tiers = {};
        const allHouses = Object.keys(HOUSE_NAMES);

        allHouses.forEach(houseId => {
            const tier = calculateTier(houseId);
            if (tier) {
                tiers[houseId] = {
                    tier: tier.name,
                    tierId: tier.id,
                    completed: getHouseCompletedCount(houseId),
                    total: getHouseModuleCount(houseId),
                    percent: getHouseCompletionPercent(houseId)
                };
            }
        });

        return tiers;
    }

    function getActiveTitles() {
        const activeTitles = [];

        SPECIAL_TITLES.forEach(special => {
            try {
                if (special.condition()) {
                    activeTitles.push(special.name);
                }
            } catch (e) {
                // Silently skip if condition fails
            }
        });

        return activeTitles;
    }

    function buildHouseTitle() {
        const userHouse = getUserHouse();
        if (!userHouse) return null;

        const houseName = HOUSE_NAMES[userHouse];
        if (!houseName) return null;

        return `of ${houseName}`;
    }

    function buildSkillTiers() {
        const allTiers = getAllTiers();
        const tierList = [];

        // Build tier descriptions for each house with progress
        for (const houseId in allTiers) {
            const houseName = HOUSE_NAMES[houseId];
            const tierData = allTiers[houseId];

            // Only include houses with actual progress
            if (tierData.completed > 0) {
                tierList.push({
                    house: houseId,
                    houseName,
                    tier: tierData.tier,
                    tierId: tierData.tierId,
                    completed: tierData.completed,
                    percent: tierData.percent
                });
            }
        }

        // Sort by completion percentage (highest first)
        tierList.sort((a, b) => b.percent - a.percent);

        return tierList;
    }

    function buildCrossHouseTitle(skillTiers) {
        const houseCount = skillTiers.length;

        if (houseCount === 0) {
            return null;
        }

        if (houseCount === 1) {
            // Single house: just show the tier
            return `${skillTiers[0].tier}`;
        }

        // Check for Prime Architect (all 8 houses with progress)
        if (houseCount >= 8) {
            return 'Prime Architect';
        }

        // Polymath: 3+ houses
        if (houseCount >= 3) {
            // Find the highest tier level
            const highestTier = skillTiers[0].tier; // Already sorted by percent
            return `Polymath ${highestTier}`;
        }

        // Dual-Path: 2 houses
        if (houseCount === 2) {
            const highestTier = skillTiers[0].tier;
            return `Dual-Path ${highestTier}`;
        }

        return null;
    }

    function getFullTitle(username = null) {
        const userName = username || localStorage.getItem('hexworth_callsign') || localStorage.getItem('hexworth_username') || 'Operative';
        const titleParts = [];

        // Factionless users: delegate to FactionlessTree if available
        if (typeof FactionlessTree !== 'undefined' && FactionlessTree.isFactionless()) {
            const fTitle = FactionlessTree.getTitle();
            return `${userName}, ${fTitle}`;
        }

        // Get skill tiers
        const skillTiers = buildSkillTiers();

        // Layer 1: House-specific tiers (primary houses)
        if (skillTiers.length > 0) {
            const houseTitles = skillTiers.map(t => `${t.tier} of ${t.houseName}`);
            titleParts.push(...houseTitles);
        }

        // Layer 2: Cross-house recognition
        const crossHouseTitle = buildCrossHouseTitle(skillTiers);
        if (crossHouseTitle && skillTiers.length > 1) {
            titleParts.push(crossHouseTitle);
        }

        // Layer 3: Special achievement titles
        const specialTitles = getActiveTitles();
        if (specialTitles.length > 0) {
            titleParts.push(...specialTitles);
        }

        // Build final title
        if (titleParts.length === 0) {
            return userName;
        }

        return `${userName}, ${titleParts.join(', ')}`;
    }

    function getShortTitle(username = null) {
        const userName = username || localStorage.getItem('hexworth_callsign') || localStorage.getItem('hexworth_username') || 'Operative';

        // Factionless users: delegate to FactionlessTree if available
        if (typeof FactionlessTree !== 'undefined' && FactionlessTree.isFactionless()) {
            const fTitle = FactionlessTree.getTitle();
            return `${userName}, ${fTitle}`;
        }

        // Priority: Special titles > Cross-house > Highest tier
        const specialTitles = getActiveTitles();
        if (specialTitles.length > 0) {
            return `${userName}, ${specialTitles[0]}`;
        }

        const skillTiers = buildSkillTiers();
        const crossHouseTitle = buildCrossHouseTitle(skillTiers);
        if (crossHouseTitle && skillTiers.length > 1) {
            return `${userName}, ${crossHouseTitle}`;
        }

        if (skillTiers.length > 0) {
            return `${userName}, ${skillTiers[0].tier} of ${skillTiers[0].houseName}`;
        }

        // Fallback: house identity
        const houseTitle = buildHouseTitle();
        if (houseTitle) {
            return `${userName}, ${houseTitle}`;
        }

        return userName;
    }

    function getTier(houseId) {
        const tier = calculateTier(houseId);
        return tier ? tier.name : null;
    }

    function getTierData(houseId) {
        const tier = calculateTier(houseId);
        if (!tier) return null;

        return {
            tier: tier.name,
            tierId: tier.id,
            completed: getHouseCompletedCount(houseId),
            total: getHouseModuleCount(houseId),
            percent: getHouseCompletionPercent(houseId)
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    // CACHING (for performance)
    // ═══════════════════════════════════════════════════════════════════

    function getCachedTitle() {
        try {
            const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return cached;
        } catch {
            return {};
        }
    }

    function cacheTitle(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to cache title data:', e);
        }
    }

    function recalculate() {
        const username = localStorage.getItem('hexworth_callsign') || localStorage.getItem('hexworth_username') || 'Operative';
        const fullTitle = getFullTitle(username);
        const shortTitle = getShortTitle(username);
        const allTiers = getAllTiers();
        const specialTitles = getActiveTitles();

        const data = {
            username,
            fullTitle,
            shortTitle,
            tiers: allTiers,
            specialTitles,
            lastUpdate: Date.now()
        };

        cacheTitle(data);
        return data;
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    return {
        // Get current titles
        getFullTitle,
        getShortTitle,
        getTier,
        getTierData,
        getAllTiers,

        // Special titles
        getActiveTitles,

        // Tier definitions
        TIERS,
        HOUSE_NAMES,

        // Utilities
        recalculate,
        getHouseCompletedCount,
        getHouseCompletionPercent,

        // Data
        buildSkillTiers,

        // Update display (call this when progress changes)
        updateDashboardDisplay: function() {
            const username = localStorage.getItem('hexworth_callsign') || localStorage.getItem('hexworth_username') || 'Operative';
            const fullTitle = getFullTitle(username);
            const titleDisplay = document.getElementById('userTitleDisplay');

            if (titleDisplay) {
                const parts = fullTitle.split(', ');
                const name = parts[0];
                const titles = parts.slice(1).join(', ');

                if (titles) {
                    titleDisplay.innerHTML = `<span class="title-name">${name}</span>, <span class="title-tier">${titles}</span>`;
                } else {
                    titleDisplay.innerHTML = `<span class="title-name">${name}</span>`;
                }
                titleDisplay.style.display = 'inline-block';

            }

            // Recalculate and cache
            return recalculate();
        }
    };
})();

// Auto-calculate on load (use cached if fresh)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TitleManager.recalculate();
    });
} else {
    TitleManager.recalculate();
}

// Listen for progress updates and recalculate title
window.addEventListener('hexworth:progressUpdate', () => {
    if (typeof TitleManager !== 'undefined' && TitleManager.updateDashboardDisplay) {
        // Delay slightly to ensure progress is saved
        setTimeout(() => {
            TitleManager.updateDashboardDisplay();
        }, 100);
    }
});

// Also listen for achievement unlocks (might change special titles)
window.addEventListener('hexworth:achievementUnlocked', () => {
    if (typeof TitleManager !== 'undefined' && TitleManager.updateDashboardDisplay) {
        setTimeout(() => {
            TitleManager.updateDashboardDisplay();
        }, 100);
    }
});
