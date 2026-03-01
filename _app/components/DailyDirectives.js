/**
 * DailyDirectives.js - Daily & Weekly Micro-Missions
 *
 * Generates 1 daily mission + 1 weekly mission, deterministically seeded
 * by date/week number. Completing them grants bonus XP. Resets at midnight.
 *
 * Storage: hexworth_daily_directives (tracks completion + claim per date)
 */

const DailyDirectives = (function() {
    'use strict';

    const STORAGE_KEY = 'hexworth_daily_directives';

    // ═══════════════════════════════════════════════════════════════
    // MISSION TEMPLATES
    // ═══════════════════════════════════════════════════════════════

    const DAILY_MISSIONS = [
        { id: 'complete_any',    desc: 'Complete any module',                  xp: 50,  check: checkAnyModule },
        { id: 'quiz_80',        desc: 'Pass a quiz with 80%+',                xp: 75,  check: checkQuiz80 },
        { id: 'two_modules',    desc: 'Complete 2 modules in one session',     xp: 100, check: checkTwoModules },
        { id: 'visit_new',      desc: 'Visit a house you haven\'t started',   xp: 50,  check: checkNewHouse }
    ];

    const WEEKLY_MISSIONS = [
        { id: 'five_modules',   desc: 'Complete 5 modules this week',         xp: 250, check: checkFiveModulesWeek },
        { id: 'three_quizzes',  desc: 'Pass 3 quizzes this week',             xp: 200, check: checkThreeQuizzesWeek },
        { id: 'seven_streak',   desc: 'Maintain a 7-day streak',              xp: 300, check: checkSevenStreak }
    ];

    // ═══════════════════════════════════════════════════════════════
    // DETERMINISTIC SEEDING
    // ═══════════════════════════════════════════════════════════════

    function dateSeed() {
        const d = new Date();
        return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    }

    function weekSeed() {
        const d = new Date();
        const start = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
        return d.getFullYear() * 100 + weekNum;
    }

    function seededIndex(seed, len) {
        // Simple hash → index
        let h = seed;
        h = ((h >> 16) ^ h) * 0x45d9f3b;
        h = ((h >> 16) ^ h) * 0x45d9f3b;
        h = (h >> 16) ^ h;
        return Math.abs(h) % len;
    }

    // ═══════════════════════════════════════════════════════════════
    // MISSION GETTERS
    // ═══════════════════════════════════════════════════════════════

    function getToday() {
        const idx = seededIndex(dateSeed(), DAILY_MISSIONS.length);
        return { ...DAILY_MISSIONS[idx], type: 'daily', seed: dateSeed() };
    }

    function getWeekly() {
        const idx = seededIndex(weekSeed(), WEEKLY_MISSIONS.length);
        return { ...WEEKLY_MISSIONS[idx], type: 'weekly', seed: weekSeed() };
    }

    // ═══════════════════════════════════════════════════════════════
    // STORAGE
    // ═══════════════════════════════════════════════════════════════

    function getState() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch { return {}; }
    }

    function saveState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    /**
     * Get or initialize tracking for a mission seed
     */
    function getMissionState(mission) {
        const state = getState();
        const key = mission.type + '_' + mission.seed;
        if (!state[key]) {
            state[key] = { id: mission.id, completed: false, claimed: false, progressSnapshot: null };
            saveState(state);
        }
        return state[key];
    }

    function updateMissionState(mission, updates) {
        const state = getState();
        const key = mission.type + '_' + mission.seed;
        state[key] = { ...getMissionState(mission), ...updates };
        saveState(state);
    }

    // ═══════════════════════════════════════════════════════════════
    // PROGRESS CHECKERS
    // ═══════════════════════════════════════════════════════════════

    function getProgress() {
        if (typeof ProgressManager !== 'undefined' && ProgressManager.getProgress) {
            return ProgressManager.getProgress();
        }
        try { return JSON.parse(localStorage.getItem('hexworth_progress') || '{}'); }
        catch { return {}; }
    }

    function getTodayCompletions() {
        const progress = getProgress();
        const today = new Date().toDateString();
        let count = 0;

        // Check flat format
        for (const houseId of Object.keys(progress)) {
            if (houseId === 'houses' || houseId === 'completedModules' || houseId === 'xp' || houseId === 'level') continue;
            const house = progress[houseId];
            if (!house || typeof house !== 'object') continue;
            for (const mod of Object.values(house)) {
                if (mod.completed && mod.date && new Date(mod.date).toDateString() === today) {
                    count++;
                }
            }
        }
        return count;
    }

    function getWeekCompletions() {
        const progress = getProgress();
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        let modules = 0;
        let quizzes = 0;

        for (const houseId of Object.keys(progress)) {
            if (houseId === 'houses' || houseId === 'completedModules' || houseId === 'xp' || houseId === 'level') continue;
            const house = progress[houseId];
            if (!house || typeof house !== 'object') continue;
            for (const mod of Object.values(house)) {
                if (mod.completed && mod.date && new Date(mod.date) >= weekStart) {
                    modules++;
                    if (mod.score !== undefined) quizzes++;
                }
            }
        }
        return { modules, quizzes };
    }

    function checkAnyModule() {
        return getTodayCompletions() >= 1;
    }

    function checkQuiz80() {
        const progress = getProgress();
        const today = new Date().toDateString();
        for (const houseId of Object.keys(progress)) {
            if (houseId === 'houses' || houseId === 'completedModules') continue;
            const house = progress[houseId];
            if (!house || typeof house !== 'object') continue;
            for (const mod of Object.values(house)) {
                if (mod.completed && mod.score >= 80 && mod.date && new Date(mod.date).toDateString() === today) {
                    return true;
                }
            }
        }
        return false;
    }

    function checkTwoModules() {
        return getTodayCompletions() >= 2;
    }

    function checkNewHouse() {
        // Check if a house was accessed today that had 0 completions before today
        const progress = getProgress();
        const today = new Date().toDateString();
        if (!progress.houses) return false;

        for (const [id, house] of Object.entries(progress.houses)) {
            const mods = house.modulesCompleted || [];
            if (mods.length > 0) {
                // Check if ALL completions for this house are from today
                const houseFlat = progress[id];
                if (!houseFlat) continue;
                const allToday = Object.values(houseFlat).every(m =>
                    m.date && new Date(m.date).toDateString() === today
                );
                if (allToday && mods.length <= 2) return true; // Just started today
            }
        }
        return false;
    }

    function checkFiveModulesWeek() {
        return getWeekCompletions().modules >= 5;
    }

    function checkThreeQuizzesWeek() {
        return getWeekCompletions().quizzes >= 3;
    }

    function checkSevenStreak() {
        const streak = parseInt(localStorage.getItem('hexworth_streak') || '0');
        return streak >= 7;
    }

    // ═══════════════════════════════════════════════════════════════
    // CHECK & CLAIM
    // ═══════════════════════════════════════════════════════════════

    function checkProgress(mission) {
        if (!mission || !mission.check) return false;
        try { return mission.check(); }
        catch (e) { console.warn('[DailyDirectives] check() error:', e); return false; }
    }

    function claim(missionType) {
        const mission = missionType === 'weekly' ? getWeekly() : getToday();
        const mState = getMissionState(mission);

        if (mState.claimed) return false;
        if (!checkProgress(mission)) return false;

        updateMissionState(mission, { completed: true, claimed: true });

        // Award XP via ProgressManager bridge
        const progress = getProgress();
        progress.xp = (Number(progress.xp) || 0) + mission.xp;
        // Recalculate level
        if (progress.xp > 0) {
            progress.level = Math.max(1, Math.floor((1 + Math.sqrt(1 + progress.xp / 12.5)) / 2));
        }
        localStorage.setItem('hexworth_progress', JSON.stringify(progress));

        // Record in activity feed
        if (typeof ActivityFeed !== 'undefined') {
            ActivityFeed.record('directive_complete', {
                message: `Mission complete: ${mission.desc} (+${mission.xp} XP)`
            });
        }

        // Re-render feed if available
        if (typeof ActivityFeed !== 'undefined' && document.getElementById('houseActivity')) {
            ActivityFeed.render(document.getElementById('houseActivity'));
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // PINNED UI SECTION
    // ═══════════════════════════════════════════════════════════════

    function renderMissionRow(mission, label) {
        const mState = getMissionState(mission);
        const isComplete = mState.claimed ? true : checkProgress(mission);
        const isClaimed = mState.claimed;

        // Auto-mark as completed in state
        if (isComplete && !mState.completed) {
            updateMissionState(mission, { completed: true });
        }

        const statusIcon = isClaimed ? '✓' : isComplete ? '◆' : '○';
        const statusClass = isClaimed ? 'claimed' : isComplete ? 'ready' : 'pending';

        return `
            <div class="daily-mission-row ${statusClass}">
                <span class="mission-status">${statusIcon}</span>
                <div class="mission-info">
                    <span class="mission-label">${label}</span>
                    <span class="mission-desc">${mission.desc}</span>
                </div>
                <div class="mission-reward">
                    ${isClaimed
                        ? '<span class="mission-claimed">CLAIMED</span>'
                        : isComplete
                            ? `<button class="mission-claim-btn" onclick="DailyDirectives.claim('${mission.type}')">+${mission.xp} XP</button>`
                            : `<span class="mission-xp">${mission.xp} XP</span>`
                    }
                </div>
            </div>
        `;
    }

    function renderPinned() {
        try {
            const daily = getToday();
            const weekly = getWeekly();

            let dailyRow, weeklyRow;
            try { dailyRow = renderMissionRow(daily, 'DAILY'); }
            catch (e) { console.error('[DailyDirectives] Daily mission render error:', e); dailyRow = ''; }
            try { weeklyRow = renderMissionRow(weekly, 'WEEKLY'); }
            catch (e) { console.error('[DailyDirectives] Weekly mission render error:', e); weeklyRow = ''; }

            return `
                <div class="daily-directives-pinned">
                    <div class="daily-directives-header">
                        <span class="daily-directives-icon">◈</span>
                        ACTIVE MISSIONS
                    </div>
                    ${dailyRow}
                    ${weeklyRow}
                </div>
            `;
        } catch (e) {
            console.error('[DailyDirectives] renderPinned error:', e);
            return '';
        }
    }

    /**
     * Inject a directive event announcing today's missions (once per day)
     */
    function inject() {
        if (typeof ActivityFeed === 'undefined') return;

        const shown = getState();
        const todayFlag = 'announced_' + dateSeed();
        if (shown[todayFlag]) return;

        const daily = getToday();
        ActivityFeed.record('directive', {
            message: `Daily mission: ${daily.desc} (+${daily.xp} XP)`
        });

        shown[todayFlag] = true;
        saveState(shown);
    }

    /**
     * Get CSS for daily directives pinned section
     */
    function getStyles() {
        return `
            .daily-directives-pinned {
                border-bottom: 1px solid rgba(245, 158, 11, 0.2);
                padding: 10px;
                background: rgba(245, 158, 11, 0.03);
            }

            .daily-directives-header {
                font-size: 0.65rem;
                font-weight: 600;
                color: #f59e0b;
                letter-spacing: 0.12em;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .daily-directives-icon {
                font-size: 0.8rem;
            }

            .daily-mission-row {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 4px;
                margin-bottom: 4px;
                background: rgba(0, 0, 0, 0.2);
                border-left: 2px solid rgba(245, 158, 11, 0.4);
            }

            .daily-mission-row.ready {
                border-left-color: #4ade80;
                background: rgba(74, 222, 128, 0.05);
            }

            .daily-mission-row.claimed {
                border-left-color: #4a5568;
                opacity: 0.6;
            }

            .mission-status {
                font-size: 0.7rem;
                width: 16px;
                text-align: center;
                flex-shrink: 0;
            }

            .daily-mission-row.pending .mission-status { color: #4a5568; }
            .daily-mission-row.ready .mission-status { color: #4ade80; }
            .daily-mission-row.claimed .mission-status { color: #4a5568; }

            .mission-info {
                flex: 1;
                min-width: 0;
            }

            .mission-label {
                font-size: 0.55rem;
                letter-spacing: 0.1em;
                color: #f59e0b;
                opacity: 0.7;
                margin-right: 6px;
            }

            .mission-desc {
                font-size: 0.7rem;
                color: #a0aec0;
            }

            .mission-reward {
                flex-shrink: 0;
            }

            .mission-xp {
                font-size: 0.6rem;
                color: #4a5568;
                letter-spacing: 0.05em;
            }

            .mission-claimed {
                font-size: 0.55rem;
                color: #4a5568;
                letter-spacing: 0.1em;
            }

            .mission-claim-btn {
                background: rgba(74, 222, 128, 0.2);
                border: 1px solid rgba(74, 222, 128, 0.4);
                color: #4ade80;
                font-family: 'Courier New', monospace;
                font-size: 0.6rem;
                padding: 3px 8px;
                border-radius: 3px;
                cursor: pointer;
                letter-spacing: 0.05em;
                transition: all 0.2s ease;
            }

            .mission-claim-btn:hover {
                background: rgba(74, 222, 128, 0.3);
                box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);
            }

            /* Magic theme */
            .theme-magic .daily-directives-pinned {
                border-bottom-color: rgba(167, 139, 250, 0.2);
                background: rgba(167, 139, 250, 0.03);
            }

            .theme-magic .daily-directives-header {
                color: #a78bfa;
            }

            .theme-magic .daily-mission-row {
                border-left-color: rgba(167, 139, 250, 0.4);
            }

            .theme-magic .mission-label {
                color: #a78bfa;
            }

            .theme-magic .mission-claim-btn {
                background: rgba(167, 139, 250, 0.2);
                border-color: rgba(167, 139, 250, 0.4);
                color: #a78bfa;
            }
        `;
    }

    // Public API
    return {
        getToday,
        getWeekly,
        checkProgress,
        claim,
        renderPinned,
        inject,
        getStyles
    };
})();

window.DailyDirectives = DailyDirectives;
