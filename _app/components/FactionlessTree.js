/**
 * FactionlessTree.js - Factionless / Divergent Skill Tree
 *
 * Instead of going deep in one house, Factionless users go WIDE across all houses.
 * Tracks breadth of knowledge across 5 branches (each mapping to 2 houses).
 *
 * BRANCHES:
 *   Recon       (eye + shield)   : Observer    -> Analyst    -> Sentinel
 *   Engineering (forge + code)   : Tinkerer    -> Builder    -> Architect
 *   Network     (web + cloud)    : Connector   -> Navigator  -> Pathfinder
 *   Crypto      (key + script)   : Decoder     -> Cipher     -> Cryptarch
 *   Operations  (dark-arts + *)  : Operator    -> Strategist -> Commander
 *
 * TIER THRESHOLDS:
 *   Tier 1: 3 modules from EITHER house in the branch
 *   Tier 2: 10 modules across BOTH houses in the branch
 *   Tier 3: 20+ modules across BOTH houses in the branch
 *
 * OVERALL TITLES:
 *   0 branches T1   -> "Factionless"
 *   1-2 branches T1 -> "Factionless Wanderer"
 *   3+ branches T1  -> "Factionless Pathfinder"
 *   5 branches T1   -> "Factionless Polymath"
 *   5 branches T2   -> "Factionless Prime"
 *   5 branches T3   -> "The Divergent"
 *
 * @version 1.0.0
 */
const FactionlessTree = (function() {
    'use strict';

    const PROGRESS_KEY = 'hexworth_progress';
    const HOUSE_KEY = 'hexworth_house';
    const STYLE_ID = 'factionless-tree-styles';

    // ═══════════════════════════════════════════════════════════════
    // BRANCH DEFINITIONS
    // ═══════════════════════════════════════════════════════════════

    const EMBLEM_PATH = '/assets/images/emblems/';

    function emblemImg(houseId, size) {
        size = size || 22;
        return `<img src="${EMBLEM_PATH}${houseId}.webp" alt="${houseId}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;vertical-align:middle;">`;
    }

    const BRANCHES = [
        {
            id: 'recon',
            name: 'Recon',
            houses: ['eye', 'shield'],
            color: '#c084fc',
            tiers: ['Observer', 'Analyst', 'Sentinel']
        },
        {
            id: 'engineering',
            name: 'Engineering',
            houses: ['forge', 'code'],
            color: '#fbbf24',
            tiers: ['Tinkerer', 'Builder', 'Architect']
        },
        {
            id: 'network',
            name: 'Network',
            houses: ['web', 'cloud'],
            color: '#60a5fa',
            tiers: ['Connector', 'Navigator', 'Pathfinder']
        },
        {
            id: 'crypto',
            name: 'Crypto',
            houses: ['key', 'script'],
            color: '#f472b6',
            tiers: ['Decoder', 'Cipher', 'Cryptarch']
        },
        {
            id: 'operations',
            name: 'Operations',
            houses: ['dark-arts'],
            color: '#9333ea',
            tiers: ['Operator', 'Strategist', 'Commander'],
            crossHouse: true
        }
    ];

    // ═══════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════

    function getProgress() {
        try {
            return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        } catch { return {}; }
    }

    function countCompleted(houseId) {
        const progress = getProgress();
        const hp = progress[houseId] || {};
        let count = 0;
        for (const key in hp) {
            if (hp[key] && hp[key].completed === true) count++;
        }
        return count;
    }

    function countCompletedTotal() {
        const progress = getProgress();
        let total = 0;
        for (const houseId in progress) {
            const hp = progress[houseId] || {};
            for (const key in hp) {
                if (hp[key] && hp[key].completed === true) total++;
            }
        }
        return total;
    }

    // ═══════════════════════════════════════════════════════════════
    // BRANCH CALCULATION
    // ═══════════════════════════════════════════════════════════════

    function calculateBranch(branch) {
        let totalCompleted = 0;
        const houseCounts = {};

        if (branch.crossHouse) {
            // Operations: dark-arts modules + cross-house breadth bonus
            const daCount = countCompleted('dark-arts');
            houseCounts['dark-arts'] = daCount;
            // Cross-house bonus: count total from ALL houses minus the max single house
            const allHouseIds = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];
            let crossCount = 0;
            allHouseIds.forEach(h => { crossCount += countCompleted(h); });
            // Use the larger of dark-arts count or cross-house average as progression
            totalCompleted = daCount + Math.floor(crossCount / allHouseIds.length);
        } else {
            branch.houses.forEach(h => {
                const c = countCompleted(h);
                houseCounts[h] = c;
                totalCompleted += c;
            });
        }

        // Determine tier
        let tier = 0;
        let tierName = 'Locked';

        // Tier 1: 3 modules from EITHER house
        const hasEitherHouse = Object.values(houseCounts).some(c => c >= 3);
        if (hasEitherHouse || (branch.crossHouse && totalCompleted >= 3)) {
            tier = 1;
            tierName = branch.tiers[0];
        }

        // Tier 2: 10 modules across BOTH houses (or total for operations)
        if (totalCompleted >= 10) {
            if (branch.crossHouse || (branch.houses.length <= 1) ||
                branch.houses.every(h => (houseCounts[h] || 0) >= 1)) {
                tier = 2;
                tierName = branch.tiers[1];
            }
        }

        // Tier 3: 20+ modules across BOTH houses
        if (totalCompleted >= 20) {
            if (branch.crossHouse || (branch.houses.length <= 1) ||
                branch.houses.every(h => (houseCounts[h] || 0) >= 3)) {
                tier = 3;
                tierName = branch.tiers[2];
            }
        }

        // Progress toward next tier
        let nextThreshold = 3;
        let progressCount = Math.max(...Object.values(houseCounts), 0);
        if (tier >= 1) { nextThreshold = 10; progressCount = totalCompleted; }
        if (tier >= 2) { nextThreshold = 20; progressCount = totalCompleted; }
        if (tier >= 3) { nextThreshold = totalCompleted; } // maxed

        const progressPercent = tier >= 3 ? 100 :
            Math.min(100, Math.round((progressCount / nextThreshold) * 100));

        return {
            ...branch,
            tier,
            tierName,
            totalCompleted,
            houseCounts,
            progressPercent,
            nextThreshold: tier >= 3 ? null : nextThreshold
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    function isFactionless() {
        const house = localStorage.getItem(HOUSE_KEY);
        return house === 'divergent' ||
               localStorage.getItem('hexworth_divergent') === 'true';
    }

    function getBranches() {
        return BRANCHES.map(calculateBranch);
    }

    function getTitle() {
        const branches = getBranches();
        const t1Count = branches.filter(b => b.tier >= 1).length;
        const t2Count = branches.filter(b => b.tier >= 2).length;
        const t3Count = branches.filter(b => b.tier >= 3).length;

        if (t3Count === 5) return 'The Divergent';
        if (t2Count === 5) return 'Factionless Prime';
        if (t1Count === 5) return 'Factionless Polymath';
        if (t1Count >= 3) return 'Factionless Pathfinder';
        if (t1Count >= 1) return 'Factionless Wanderer';
        return 'Factionless';
    }

    // ═══════════════════════════════════════════════════════════════
    // STYLE INJECTION
    // ═══════════════════════════════════════════════════════════════

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .ft-container { max-width: 900px; margin: 0 auto; }
            .ft-header {
                text-align: center; margin-bottom: 30px; padding: 20px;
                background: rgba(255, 0, 255, 0.05);
                border: 1px solid rgba(255, 0, 255, 0.15);
                border-radius: 10px;
            }
            .ft-title-label {
                font-size: 0.65rem; color: #666; letter-spacing: 0.3em;
                text-transform: uppercase; margin-bottom: 6px;
            }
            .ft-title {
                font-size: 1.4rem; font-weight: 300; letter-spacing: 0.15em;
                background: linear-gradient(135deg, #ff00ff, #00ffff);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .ft-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 16px;
            }
            .ft-branch {
                background: rgba(15, 15, 25, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px; padding: 20px;
                transition: border-color 0.3s, box-shadow 0.3s;
                position: relative; overflow: hidden;
            }
            .ft-branch:hover {
                border-color: var(--branch-color);
                box-shadow: 0 0 20px color-mix(in srgb, var(--branch-color) 30%, transparent);
            }
            .ft-branch-header {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 14px;
            }
            .ft-branch-name {
                font-size: 1rem; font-weight: 600; color: var(--branch-color);
                letter-spacing: 0.08em;
            }
            .ft-branch-icons { font-size: 1.1rem; }
            .ft-tier-badge {
                display: inline-block; padding: 3px 10px; border-radius: 4px;
                font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
                text-transform: uppercase;
            }
            .ft-tier-locked {
                background: rgba(255, 255, 255, 0.05); color: #555;
                border: 1px solid #333;
            }
            .ft-tier-1 {
                background: rgba(205, 127, 50, 0.15); color: #cd7f32;
                border: 1px solid rgba(205, 127, 50, 0.4);
            }
            .ft-tier-2 {
                background: rgba(192, 192, 192, 0.15); color: #c0c0c0;
                border: 1px solid rgba(192, 192, 192, 0.4);
            }
            .ft-tier-3 {
                background: rgba(255, 215, 0, 0.15); color: #ffd700;
                border: 1px solid rgba(255, 215, 0, 0.4);
            }
            .ft-tier-label {
                font-size: 0.8rem; color: #aaa; margin-bottom: 10px;
                font-weight: 300;
            }
            .ft-progress-bar {
                height: 6px; background: rgba(255, 255, 255, 0.06);
                border-radius: 3px; overflow: hidden; margin-bottom: 8px;
            }
            .ft-progress-fill {
                height: 100%; border-radius: 3px;
                background: var(--branch-color);
                transition: width 0.6s ease;
            }
            .ft-progress-text {
                font-size: 0.7rem; color: #555;
                display: flex; justify-content: space-between;
            }
            .ft-houses {
                display: flex; gap: 8px; margin-top: 12px;
                padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05);
            }
            .ft-house-chip {
                font-size: 0.65rem; color: #888; padding: 3px 8px;
                background: rgba(255,255,255,0.03); border-radius: 4px;
                border: 1px solid rgba(255,255,255,0.06);
            }
            .ft-house-chip .ft-chip-count {
                color: var(--branch-color); font-weight: 600; margin-left: 4px;
            }
            @media (max-width: 600px) {
                .ft-grid { grid-template-columns: 1fr; }
                .ft-title { font-size: 1.1rem; }
            }
        `;
        document.head.appendChild(style);
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════

    function renderTree(containerEl) {
        if (!containerEl) return;
        injectStyles();

        const branches = getBranches();
        const title = getTitle();

        const tierBadgeClass = (tier) => {
            if (tier === 0) return 'ft-tier-locked';
            if (tier === 1) return 'ft-tier-1';
            if (tier === 2) return 'ft-tier-2';
            return 'ft-tier-3';
        };

        const tierLabel = (tier) => {
            if (tier === 0) return 'Locked';
            if (tier === 1) return 'Bronze';
            if (tier === 2) return 'Silver';
            return 'Gold';
        };

        let html = '<div class="ft-container">';

        // Header
        html += `
            <div class="ft-header">
                <div class="ft-title-label">Current Title</div>
                <div class="ft-title">${title}</div>
            </div>
        `;

        // Branch cards
        html += '<div class="ft-grid">';
        branches.forEach(b => {
            const badgeClass = tierBadgeClass(b.tier);
            const badgeLabel = tierLabel(b.tier);
            const nextText = b.nextThreshold
                ? `${b.totalCompleted} / ${b.nextThreshold}`
                : 'Maxed';

            html += `
                <div class="ft-branch" style="--branch-color: ${b.color};">
                    <div class="ft-branch-header">
                        <div>
                            <span class="ft-branch-icons">${b.houses.map(h => emblemImg(h, 24)).join(' ')}</span>
                            <span class="ft-branch-name">${b.name}</span>
                        </div>
                        <span class="ft-tier-badge ${badgeClass}">${badgeLabel}</span>
                    </div>
                    <div class="ft-tier-label">${b.tierName}</div>
                    <div class="ft-progress-bar">
                        <div class="ft-progress-fill" style="width: ${b.progressPercent}%;"></div>
                    </div>
                    <div class="ft-progress-text">
                        <span>${nextText}</span>
                        <span>${b.progressPercent}%</span>
                    </div>
                    <div class="ft-houses">
                        ${b.houses.map(h => `
                            <span class="ft-house-chip">
                                ${emblemImg(h, 16)}
                                ${h}
                                <span class="ft-chip-count">${b.houseCounts[h] || 0}</span>
                            </span>
                        `).join('')}
                        ${b.crossHouse ? '<span class="ft-house-chip">+ cross-house breadth</span>' : ''}
                    </div>
                </div>
            `;
        });
        html += '</div></div>';

        containerEl.innerHTML = html;
    }

    return {
        isFactionless,
        getBranches,
        getTitle,
        renderTree,
        injectStyles,
        BRANCHES
    };
})();

// Make globally available
window.FactionlessTree = FactionlessTree;
