/**
 * ObservatoryBadges.js — shared source of truth for the Observatory sandbox
 * badge collection.
 *
 * WHY THIS EXISTS: these definitions live as a page-local `OBS_BADGE_DEFS` const
 * inside houses/observatory/index.html, so nothing else (e.g. the unified Trophy
 * Cabinet) can see them. This module is the intended canonical home so BOTH the
 * sandbox page AND the cabinet can read one list.
 *
 * STATUS (be honest): NOT yet the single source of truth. houses/observatory/
 * index.html still declares its OWN copy of these defs (plus local obsRarity/
 * obsBadgeEarned) and does not load this module. The two arrays are byte-identical
 * today, but until the observatory page is migrated to load ObservatoryBadges.js
 * and its local const is retired, there are TWO copies to keep in sync — if only
 * one is edited (e.g. an SBX-7 lab flips pending→live), the cabinet and the sandbox
 * page will disagree. Migration is a tracked, render-verified follow-up.
 *
 * SCOPE: this module owns DEFINITIONS + pure helpers only. It does NOT own earned
 * state (that stays in the durable progress doc `hexworth_obs_sandbox_progress`
 * → p.obsBadges, synced via LabStateSync) and it does NOT award anything (the
 * observatory's evaluateObsBadges + the awardMissionBadge Cloud Function keep that
 * responsibility, preserving server-issued integrity). Moving award logic here
 * would risk that integrity, so it is deliberately left out.
 *
 * TRUST TIERS (unchanged from the marathon L5/L6 design):
 *   - legacy:true  — the 5 pre-existing CORE achievements; earned state lives in
 *                    AchievementSystem, not here. Displayed for a unified home.
 *   - pending:true — reserved for per-lab server checks not yet wired (SBX-7);
 *                    render locked, cannot be earned yet.
 *   - obs_*        — the native Observatory badges; earned state in p.obsBadges.
 *
 * `art` is a badge-art filename stem in _app/assets/images/badges/ (operator-
 * confirmed canonical, 318 pieces). It is intentionally decoupled from `id`.
 */
(function () {
    'use strict';

    // The 25 canonical Observatory badge definitions. Verbatim from the marathon
    // L5/L6 grid — this is now the ONE place they are declared.
    var DEFS = [
        { id: 'sandbox_first_boot', legacy: true, name: 'First Boot', desc: 'Launch your first sandbox', art: 'first_visit', pts: 10 },
        { id: 'sandbox_getting_there', legacy: true, name: 'Getting There', desc: 'Pass your first graded step', art: 'first_module', pts: 10 },
        { id: 'sandbox_tutorial_graduate', legacy: true, name: 'Tutorial Graduate', desc: 'Finish the 5-step guided tutorial', art: 'terminal_explorer', pts: 25 },
        { id: 'sandbox_fresh_start', legacy: true, name: 'Fresh Start', desc: 'Come back after a session ended', art: 'deja_vu', pts: 15 },
        { id: 'linux_sandbox_practitioner', legacy: true, name: 'Linux Practitioner', desc: 'Complete all 5 free-play challenges', art: 'script_linux_sage', pts: 150 },
        { id: 'obs_first_mission', name: 'First Blood: Mission One', desc: 'Complete your first Command Mastery mission', art: 'first_blood', pts: 25 },
        { id: 'obs_mission_5', name: 'Field Operative', desc: 'Complete 5 Command Mastery missions', art: 'cli_operative', pts: 75 },
        { id: 'obs_mission_10', name: 'Command Phantom', desc: 'Complete 10 Command Mastery missions', art: 'cli_phantom', pts: 150 },
        { id: 'obs_mission_18', name: 'Command Master', desc: 'Complete ALL 18 Command Mastery missions', art: 'cli_master', pts: 500, style: 'legendary' },
        { id: 'obs_first_task', name: 'First Green Check', desc: 'Pass your first mission task', art: 'terminal_initiate', pts: 10 },
        { id: 'obs_bonus_hunter', name: 'Bonus Hunter', desc: 'Pass any [bonus] task', art: 'secret_hunter', pts: 50 },
        { id: 'obs_hidden_finder', name: 'Unseen Requirement', desc: 'Satisfy a hidden requirement', art: 'ghost_protocol', pts: 100 },
        { id: 'obs_perfect_mission', name: 'Flawless Clear', desc: 'Pass EVERY task in a mission, bonus included', art: 'perfect_run', pts: 150 },
        { id: 'obs_task_50', name: 'Fifty Checks', desc: 'Pass 50 mission tasks in total', art: 'dedication', pts: 75 },
        { id: 'obs_grade_persistent', name: 'Grade Early, Grade Often', desc: 'Grade one mission 10+ times, then complete it', art: 'persistence', pts: 50 },
        { id: 'obs_comeback', name: 'The Return', desc: 'Finish a mission you started on an earlier day', art: 'time_traveler', pts: 50 },
        { id: 'obs_night_shift', name: 'Night Shift', desc: 'Complete a mission between midnight and 5 AM', art: 'midnight_hacker', pts: 50 },
        { id: 'obs_speedrun', name: 'Speedrun', desc: 'Complete a mission within 10 minutes of starting it', art: 'speed_demon', pts: 100 },
        { id: 'obs_manual_scholar', name: 'Read The Manual', desc: 'Open the Field Manual', art: 'fundamentals_scholar', pts: 10 },
        { id: 'obs_lab_workbench', name: 'Workbench: Tooled Up', desc: 'Complete the DevOps Workbench graded checks', art: 'tool_wielder', pts: 100, pending: true },
        { id: 'obs_lab_git', name: 'Git: History Surgeon', desc: 'Complete the Git Fundamentals graded checks', art: 'code_git_guru', pts: 150, pending: true },
        { id: 'obs_lab_dataformats', name: 'Data Formats: Parsed Clean', desc: 'Complete the Data Formats graded checks', art: 'binary_reader', pts: 75, pending: true },
        { id: 'obs_lab_ide', name: 'IDE: Configured', desc: 'Complete the DevOps IDE graded checks', art: 'construct_master', pts: 50, pending: true },
        { id: 'obs_lab_postgres', name: 'PostgreSQL Operator', desc: 'Complete the PostgreSQL lab graded checks', art: 'console_hacker', pts: 150, pending: true },
        { id: 'obs_realbox', name: 'Real Box: Field Work', desc: 'Complete BOTH Real Box practicals', art: 'command_warrior', pts: 250, pending: true }
    ];

    var PROG_LS = 'hexworth_obs_sandbox_progress';

    // Rarity from points — the SAME thresholds the core system derives from
    // (kept identical so the unified cabinet can treat both systems uniformly).
    function rarity(def) {
        if (def.style === 'legendary' || def.pts >= 500) return 'legendary';
        if (def.pts >= 200) return 'epic';
        if (def.pts >= 100) return 'rare';
        if (def.pts >= 50) return 'uncommon';
        return 'common';
    }

    // Read the durable progress doc (earned obs badges live at p.obsBadges).
    // Fail-safe: a missing/corrupt doc reads as "nothing earned yet".
    function readProgress() {
        try { return JSON.parse(localStorage.getItem(PROG_LS) || 'null') || {}; }
        catch (e) { return {}; }
    }

    // Earned check. legacy badges defer to AchievementSystem (their real home);
    // obs_* badges read the progress doc. `prog` optional — defaults to the live doc.
    function earned(def, prog) {
        if (def.legacy) {
            try { return typeof AchievementSystem !== 'undefined' && AchievementSystem.isUnlocked(def.id); }
            catch (e) { return false; }
        }
        if (!prog) prog = readProgress();
        return !!(prog.obsBadges && prog.obsBadges[def.id]);
    }

    window.ObservatoryBadges = {
        DEFS: DEFS,
        PROG_LS: PROG_LS,
        rarity: rarity,
        readProgress: readProgress,
        earned: earned
    };
})();
