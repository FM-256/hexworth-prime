/**
 * ProgressManager.js - Central Progress Tracking System for Hexworth Prime
 *
 * Handles all learner progression:
 * - Module completions and quiz scores
 * - XP/Points system with leveling
 * - Achievement tracking
 * - Learning path progression
 * - Skill tree unlocks (divergent paths)
 * - Firestore sync for instructor analytics (v3.11.0+)
 *
 * Storage (4 overlapping formats — all must be checked when counting):
 *   - Structured: hexworth_progress with houses.{id}.modulesCompleted[], labsCompleted[], quizzesPassed[]
 *   - Flat: hexworth_progress[houseId][moduleId] = {completed, score, completedAt}
 *   - Standalone: hexworth_quiz_scores, hexworth_lab_progress, hexworth_modules_completed
 *   - Course-specific: core2-ch{NN}-quiz, hexworth_progress_core1, hexworth_progress_core2
 *   - Sync: Firestore classes/{classId}/progress and activity subcollections
 *
 * _reconcileCounts() uses Math.max() across structured, flat, and standalone sources.
 * The dashboard auth backfill (dashboard.html) mirrors this to sync labs/quizzes to Firestore.
 * CTF box keys (hexworth_ctf_*) are also counted as labs since per-box keys survive resets.
 *
 * Dependencies (for Firestore sync):
 *   - FirebaseAuth (components/FirebaseAuth.js)
 *   - ClassManager (components/ClassManager.js)
 *   - AssignmentManager (components/AssignmentManager.js)
 */

class ProgressManager {
    static STORAGE_KEYS = {
        PROGRESS: 'hexworth_progress',
        ACHIEVEMENTS: 'hexworth_achievements',
        STATS: 'hexworth_stats',
        PROFILE: 'hexworth_profile',
        SKILL_TREE: 'hexworth_skill_tree'
    };

    // ═══════════════════════════════════════════════════════════════
    // COURSE PROGRESS NAMESPACE (QC-6)
    // Standardizes course-specific localStorage keys under hexworth_progress_*
    // Old keys are preserved for backwards compatibility — new keys are canonical.
    //
    // Key mapping (old → new):
    //   'aplus-core1-progress' → 'hexworth_progress_core1'
    //   'aplus-core2-progress' → 'hexworth_progress_core2'
    //   'wsa-course-progress'  → 'hexworth_progress_wsa'
    //   'clh_progress'         → 'hexworth_progress_clh'
    //   'clh_achievements'     → 'hexworth_progress_clh_achievements'
    // ═══════════════════════════════════════════════════════════════

    /**
     * Mapping of old course-specific localStorage keys to new namespaced keys.
     * Old keys remain readable for backwards compat; new keys are the write target.
     */
    static COURSE_KEY_MAP = {
        'aplus-core1-progress': 'hexworth_progress_core1',
        'aplus-core2-progress': 'hexworth_progress_core2',
        'wsa-course-progress':  'hexworth_progress_wsa',
        'clh_progress':         'hexworth_progress_clh',
        'clh_achievements':     'hexworth_progress_clh_achievements'
    };

    static MIGRATION_FLAG = 'hexworth_progress_migrated';
    static OPERATOR_HOUSE_MIGRATION_FLAG = 'hexworth_operator_house_migrated';

    /**
     * BUG-253. Move Operator-mission progress out of the non-house `operator` bucket into
     * `matrix`, where the catalog has always said it belongs.
     *
     * WHY `matrix` AND NOT A NEW HOUSE. Decided 2026-09-03 by a 4-0 vote (Nancy, Mallory, Chris,
     * primary), on evidence none of us had alone:
     *   - ContentCatalog files ALL op-* missions as house 'matrix' — 24 of 24, no exceptions.
     *   - Every analogous sub-hub already attributes to its parent house: Backbone -> 'web',
     *     Code Armory -> 'code', Bug Hunting -> 'dark-arts'. `operator` was the sole outlier.
     *   - The Operator hub's own back-link is literally "← MATRIX", and Matrix's narrative copy
     *     reads "Operators, engineers, architects".
     *   - Adding a 12th house was REJECTED because `Object.keys(HOUSES).length` is the maxXP
     *     denominator (see calculateMaxXP), so it would have quietly lowered the completion
     *     percentage of every student on the platform, not just operator-mission takers.
     *
     * WHAT WAS BROKEN. `getProfile()`'s inline house map spreads `HOUSES[id] || {}`, so an
     * `operator` bucket rendered a NAMELESS house card pinned at 0% (its catalog module count is 0,
     * so `percent` is hardcoded 0 no matter how much the student finished), while Matrix's real
     * percentage was undercounted by exactly the missions sitting in the wrong bucket. The
     * dashboard sentence "Resume operations in operator." was the visible tip, not the whole of it.
     * (Cited by the function that actually exists: an earlier draft of this comment named
     * `getAllHouseProgress`, which is in no file in this repo. I described the mechanism from
     * memory instead of grepping for it, which is the same fabricated-citation failure as BUG-249.)
     *
     * TWO PERCENT FIELDS, AND THEY ARE NOT THE SAME. `getProfile()` derives `.percent` live from
     * ContentCatalog counts, so it self-corrects. `houses[id].progressPercent` is STORED, derived
     * from LearningPaths, and read directly by HouseProgressPanel on every house page. Merging
     * op-* ids into modulesCompleted would have inflated that stored field past 100 on the
     * student's next real Matrix completion and fired a premature "House Mastery Complete!"
     * banner. A reviewer blocked this migration for exactly that; completeModule() now intersects
     * with the path before dividing, which is what getHouseProgress() always did.
     *
     * NON-DESTRUCTIVE, and that was a real disagreement to settle: one reviewer wanted the source
     * bucket deleted after copying so the phantom card disappears, another pointed out the
     * migration precedent above is explicitly "old keys are NEVER deleted". Both are satisfied by
     * ARCHIVING: the bucket is moved to `_archived_operator_*`, which no house iterator reads, so
     * the card goes and the data stays. Nothing is destroyed.
     *
     * NO XP IS AWARDED OR RECALCULATED HERE. XP was already granted at completion time and is
     * gated on the global, house-agnostic `completedModules` array, which this does not touch.
     * Moving the structural bucket therefore cannot double-award; that safety property belongs to
     * the existing code and this migration deliberately relies on it rather than reinventing it.
     *
     * @returns {{migrated: boolean, reason?: string, moved?: number}}
     */
    static migrateOperatorHouseToMatrix() {
        if (localStorage.getItem(this.OPERATOR_HOUSE_MIGRATION_FLAG)) {
            return { migrated: false, reason: 'already_migrated' };
        }
        let progress;
        try {
            progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
        } catch (e) {
            // A corrupt store is not something to "repair" by guessing. Leave it and say so.
            return { migrated: false, reason: 'progress_unreadable' };
        }
        if (!progress || typeof progress !== 'object') return { migrated: false, reason: 'progress_unreadable' };

        // localStorage is student-controlled, so treat every key as untrusted input. These three
        // are excluded from any copy loop on principle: no damage was demonstrated, but a
        // bracket-assignment with an inherited accessor name is not worth finding out about later.
        const UNSAFE = ['__proto__', 'constructor', 'prototype'];
        const safeId = (v) => typeof v === 'string' && v.length > 0 && UNSAFE.indexOf(v) === -1;
        let moved = 0;

        // ── structured shape: progress.houses.operator -> progress.houses.matrix ──
        const srcHouse = progress.houses && progress.houses.operator;
        if (srcHouse && typeof srcHouse === 'object') {
            progress.houses.matrix = progress.houses.matrix || {
                unlocked: true, modulesCompleted: [], quizzesPassed: [],
                labsCompleted: [], currentModule: null, progressPercent: 0, lastAccessed: null
            };
            const dst = progress.houses.matrix;
            ['modulesCompleted', 'quizzesPassed', 'labsCompleted'].forEach((field) => {
                if (!Array.isArray(dst[field])) dst[field] = [];
                const src = Array.isArray(srcHouse[field]) ? srcHouse[field] : [];
                src.forEach((id) => {
                    // Dedup by value. The op-* namespace is disjoint from matrix's existing ala-*
                    // ids, so a collision should be impossible; the check is here so that being
                    // wrong about that is a no-op rather than a duplicate.
                    if (safeId(id) && dst[field].indexOf(id) === -1) { dst[field].push(id); moved++; }
                });
            });
            // Keep whichever visit was actually later, so "most recent house" stays truthful.
            const a = Date.parse(dst.lastAccessed || 0) || 0;
            const b = Date.parse(srcHouse.lastAccessed || 0) || 0;
            if (b > a) dst.lastAccessed = srcHouse.lastAccessed;
            dst.unlocked = true;

            progress._archived_operator_house = srcHouse;   // archived, not destroyed
            delete progress.houses.operator;                // stops the nameless 0% card
        }

        // ── flat/legacy shape: progress.operator[moduleId] -> progress.matrix[moduleId] ──
        const srcFlat = progress.operator;
        if (srcFlat && typeof srcFlat === 'object') {
            progress.matrix = (progress.matrix && typeof progress.matrix === 'object') ? progress.matrix : {};
            Object.keys(srcFlat).forEach((mid) => {
                // Never overwrite an existing matrix record: if both exist the matrix one is the
                // canonical house's own history and this bucket is the mistake being corrected.
                if (safeId(mid) && !progress.matrix[mid]) { progress.matrix[mid] = srcFlat[mid]; moved++; }
            });
            progress._archived_operator_flat = srcFlat;     // archived, not destroyed
            delete progress.operator;
        }

        try {
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
            localStorage.setItem(this.OPERATOR_HOUSE_MIGRATION_FLAG, new Date().toISOString());
        } catch (e) {
            // Quota or private-mode failure: do NOT set the flag, so a later load retries.
            return { migrated: false, reason: 'write_failed' };
        }
        return { migrated: true, moved: moved };
    }

    /**
     * One-time migration: copy data from old course keys to new namespaced keys.
     * - Idempotent: checks MIGRATION_FLAG before running
     * - Non-destructive: old keys are NEVER deleted
     * - Safe to call multiple times (no-op after first successful run)
     *
     * Called automatically on page load (see bottom of file).
     */
    static migrateProgressNamespace() {
        // Already migrated — nothing to do
        if (localStorage.getItem(this.MIGRATION_FLAG)) {
            return { migrated: false, reason: 'already_migrated' };
        }

        const results = [];

        for (const [oldKey, newKey] of Object.entries(this.COURSE_KEY_MAP)) {
            try {
                const oldData = localStorage.getItem(oldKey);
                if (oldData !== null) {
                    // Only copy if new key doesn't already have data
                    const existingNew = localStorage.getItem(newKey);
                    if (!existingNew) {
                        localStorage.setItem(newKey, oldData);
                        results.push({ oldKey, newKey, action: 'copied' });
                    } else {
                        // New key already exists — merge: old data as base, new data wins
                        try {
                            const oldObj = JSON.parse(oldData);
                            const newObj = JSON.parse(existingNew);
                            const merged = { ...oldObj, ...newObj };
                            localStorage.setItem(newKey, JSON.stringify(merged));
                            results.push({ oldKey, newKey, action: 'merged' });
                        } catch (e) {
                            // Non-JSON data — new key wins, skip
                            results.push({ oldKey, newKey, action: 'skipped_parse_error' });
                        }
                    }
                } else {
                    results.push({ oldKey, newKey, action: 'no_old_data' });
                }
            } catch (e) {
                console.warn(`[ProgressManager] Migration error for ${oldKey}:`, e);
                results.push({ oldKey, newKey, action: 'error', error: e.message });
            }
        }

        // Set migration flag with timestamp
        localStorage.setItem(this.MIGRATION_FLAG, JSON.stringify({
            migratedAt: new Date().toISOString(),
            version: 1,
            results
        }));

        console.log('[ProgressManager] Progress namespace migration complete:', results);
        return { migrated: true, results };
    }

    /**
     * Read course progress with fallback: new key first, then old key.
     * Use this instead of raw localStorage.getItem() for course progress keys.
     * @param {string} courseKey - Either old key (e.g., 'aplus-core1-progress') or
     *                             new key (e.g., 'hexworth_progress_core1')
     * @returns {object} Parsed JSON data or empty object
     */
    static getCourseProgress(courseKey) {
        // Resolve to new key if an old key was passed
        const newKey = this.COURSE_KEY_MAP[courseKey] || courseKey;
        // Resolve to old key for fallback
        const oldKey = Object.entries(this.COURSE_KEY_MAP)
            .find(([, v]) => v === newKey)?.[0] || null;

        // Try new key first
        try {
            const newData = localStorage.getItem(newKey);
            if (newData !== null) {
                return JSON.parse(newData);
            }
        } catch (e) {
            console.warn(`[ProgressManager] Error reading new key ${newKey}:`, e);
        }

        // Fall back to old key
        if (oldKey) {
            try {
                const oldData = localStorage.getItem(oldKey);
                if (oldData !== null) {
                    return JSON.parse(oldData);
                }
            } catch (e) {
                console.warn(`[ProgressManager] Error reading old key ${oldKey}:`, e);
            }
        }

        return {};
    }

    /**
     * Write course progress to BOTH new and old keys (dual-write).
     * This ensures backwards compat during transition: old code reading old keys
     * still sees fresh data, while new code reads from new keys.
     * @param {string} courseKey - Either old or new key
     * @param {object} data - The progress data to save
     */
    static saveCourseProgress(courseKey, data) {
        const newKey = this.COURSE_KEY_MAP[courseKey] || courseKey;
        const oldKey = Object.entries(this.COURSE_KEY_MAP)
            .find(([, v]) => v === newKey)?.[0] || null;

        const json = JSON.stringify(data);

        // Write to new key (canonical)
        localStorage.setItem(newKey, json);

        // Dual-write to old key for backwards compat
        if (oldKey) {
            localStorage.setItem(oldKey, json);
        }
    }

    // XP rewards — delegates to XPCalculator.XP_RATES (single source of truth)
    static _XP_FALLBACK = {
        PRESENTATION_VIEW: 100, TOOL_EXPLORE: 100, QUIZ_PASS: 100,
        QUIZ_PERFECT: 200, GATE_CLEARED: 500, LAB_COMPLETE: 500,
        GAME_PLAYED: 100, MODULE_COMPLETE: 1000, COURSE_COMPLETE: 10000,
        DAILY_LOGIN: 25
    };
    static XP_REWARDS = new Proxy(ProgressManager._XP_FALLBACK, {
        get(fallback, key) {
            if (typeof XPCalculator !== 'undefined' && XPCalculator.XP_RATES && key in XPCalculator.XP_RATES) {
                return XPCalculator.XP_RATES[key];
            }
            return fallback[key];
        }
    });

    // Level system — uncapped RPG-style quadratic curve
    // Formula: Level N requires 50 * N * (N-1) cumulative XP
    // Gap between levels grows linearly: +100 XP per level
    //   Level  2:       100 XP  |  Level 10:    4,500 XP
    //   Level 20:    19,000 XP  |  Level 50:  122,500 XP
    //   Level 100:  495,000 XP  |  Level 200: 1,990,000 XP
    // No cap — levels keep growing forever. Use the formula, not arrays.

    // Level tier names — base tiers + prestige tiers beyond 100
    static LEVEL_TIERS = [
        { min: 1,    max: 10,   name: 'Initiate',         color: '#6b7280' },
        { min: 11,   max: 20,   name: 'Apprentice',       color: '#3b82f6' },
        { min: 21,   max: 30,   name: 'Journeyman',       color: '#22c55e' },
        { min: 31,   max: 40,   name: 'Specialist',       color: '#14b8a6' },
        { min: 41,   max: 50,   name: 'Expert',           color: '#a855f7' },
        { min: 51,   max: 60,   name: 'Veteran',          color: '#f97316' },
        { min: 61,   max: 70,   name: 'Master',           color: '#eab308' },
        { min: 71,   max: 80,   name: 'Grandmaster',      color: '#ef4444' },
        { min: 81,   max: 90,   name: 'Legend',            color: '#dc2626' },
        { min: 91,   max: 100,  name: 'Hexworth Prime',   color: '#06b6d4' },
        { min: 101,  max: 150,  name: 'Ascendant',        color: '#8b5cf6' },
        { min: 151,  max: 200,  name: 'Transcendent',     color: '#d946ef' },
        { min: 201,  max: 300,  name: 'Mythic',           color: '#f43f5e' },
        { min: 301,  max: 500,  name: 'Eternal',          color: '#fbbf24' },
        { min: 501,  max: Infinity, name: 'Infinite',     color: '#ffffff' },
    ];

    // House definitions with colors and icons
    static HOUSES = {
        web: { name: 'House of the Web', icon: '<img src="/assets/images/icons/icon-spiderweb.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#60a5fa', domain: 'Networking & Connections' },
        shield: { name: 'House of the Shield', icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#f87171', domain: 'Security & Defense' },
        forge: { name: 'House of the Forge', icon: '<img src="/assets/images/icons/icon-tools.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', color: '#fbbf24', domain: 'Hardware & Systems' },
        script: { name: 'House of the Script', icon: '<img src="/assets/images/icons/icon-scroll.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#a78bfa', domain: 'Automation & Efficiency' },
        cloud: { name: 'House of the Cloud', icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#38bdf8', domain: 'Infrastructure & Scale' },
        code: { name: 'House of the Code', icon: '<img src="/assets/images/icons/icon-laptop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#4ade80', domain: 'Development & Engineering' },
        key: { name: 'House of the Key', icon: '<img src="/assets/images/icons/icon-key.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#f472b6', domain: 'Cryptography & Secrets' },
        eye: { name: 'House of the Eye', icon: '<img src="/assets/images/icons/icon-detective.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#c084fc', domain: 'Monitoring & Analysis' },
        'dark-arts': { name: 'House of the Dark Arts', icon: '<img src="/assets/images/icons/icon-skull.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#9b59d0', domain: 'Offensive Security & Research' },
        'matrix': { name: 'House of the Matrix', icon: '<img src="/assets/images/icons/icon-syringe.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', color: '#00ff41', domain: 'Mechanics & Operations' },
        'divergent': { name: 'The Factionless', icon: '<img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', color: '#ff00ff', domain: 'All Domains' }
    };

    /**
     * Initialize or get user progress
     */
    static getProgress() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            if (stored) {
                const data = JSON.parse(stored);
                // Merge with defaults to ensure all required fields exist
                const defaults = this.createDefaultProgress();
                const merged = {
                    ...defaults,
                    ...data,
                    completedModules: data.completedModules || defaults.completedModules,
                    quizHistory: data.quizHistory || defaults.quizHistory,
                    labsCompleted: data.labsCompleted || defaults.labsCompleted,
                    divergentBranches: data.divergentBranches || defaults.divergentBranches,
                    // Shallow-merge per house key so newly-added houses auto-initialize
                    // (defaults.houses has all 11 houses with empty arrays) while
                    // preserving existing data for houses already in saved progress.
                    // Old behavior: `data.houses || defaults.houses` → empty {} wins,
                    // leaving missing houses unprotected against the auto-init guard
                    // in completeModule. That guard would then skip structured updates,
                    // creating drift between flat and structured formats.
                    houses: { ...defaults.houses, ...(data.houses || {}) }
                };
                // Sanitize numeric fields — prevent "[object Object]50" corruption
                merged.xp = (typeof merged.xp === 'number' && isFinite(merged.xp))
                    ? merged.xp : (parseInt(String(merged.xp).replace(/[^0-9]/g, ''), 10) || 0);
                merged.level = (typeof merged.level === 'number' && isFinite(merged.level))
                    ? merged.level : (parseInt(String(merged.level).replace(/[^0-9]/g, ''), 10) || 1);
                return merged;
            }
        } catch (e) {
            console.warn('ProgressManager: Error loading progress', e);
        }

        // Return default progress structure
        return this.createDefaultProgress();
    }

    /**
     * Create default progress structure for new users
     */
    static createDefaultProgress() {
        const progress = {
            version: 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            xp: 0,
            level: 1,
            houses: {},
            completedModules: [],
            quizHistory: [],
            labsCompleted: [],
            currentPath: null,  // Current learning path
            divergentBranches: []  // Unlocked skill branches
        };

        // Initialize each house
        Object.keys(this.HOUSES).forEach(houseId => {
            progress.houses[houseId] = {
                unlocked: true,  // All houses start unlocked
                modulesCompleted: [],
                quizzesPassed: [],
                labsCompleted: [],
                currentModule: null,
                progressPercent: 0,
                lastAccessed: null
            };
        });

        return progress;
    }

    /**
     * Save progress to localStorage
     */
    static saveProgress(progress) {
        progress.updatedAt = Date.now();
        localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(progress));

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('hexworth:progressUpdate', {
            detail: { progress }
        }));
    }

    /**
     * Sync completion to Firestore for instructor analytics
     * Called automatically by completeModule() - non-blocking
     * @param {string} moduleId - The module ID
     * @param {string} houseId - The house ID
     * @param {string} moduleType - Type: 'presentation', 'quiz', 'lab', etc.
     * @param {object} metadata - Additional data (score, etc.)
     */
    static async syncToFirestore(moduleId, houseId, moduleType, metadata = {}) {
        // Dynamically load Firebase dependencies if not present
        if (typeof FirebaseAuth === 'undefined' || typeof ClassManager === 'undefined' || typeof AssignmentManager === 'undefined') {
            try {
                await this._loadFirestoreDeps();
            } catch (e) {
                console.log('[ProgressManager] Firestore sync skipped - failed to load dependencies:', e.message);
                return;
            }
        }

        // Wait for auth state to resolve (up to 5s)
        let user = typeof FirebaseAuth !== 'undefined' ? FirebaseAuth.getUser() : null;
        if (!user && typeof FirebaseAuth !== 'undefined') {
            user = await new Promise(resolve => {
                const handler = (e) => {
                    window.removeEventListener('firebaseAuthStateChanged', handler);
                    resolve(e.detail?.user || null);
                };
                window.addEventListener('firebaseAuthStateChanged', handler);
                setTimeout(() => {
                    window.removeEventListener('firebaseAuthStateChanged', handler);
                    resolve(FirebaseAuth.getUser());
                }, 5000);
            });
        }
        if (!user) {
            console.log('[ProgressManager] Firestore sync skipped - not authenticated');
            return;
        }

        try {
            // Initialize managers if needed
            await ClassManager.init();
            await AssignmentManager.init();

            // Get all classes the student is enrolled in
            const enrolledClasses = await ClassManager.getStudentClasses(user.uid);

            if (!enrolledClasses || enrolledClasses.length === 0) {
                console.log('[ProgressManager] Firestore sync skipped - not enrolled in any classes');
                return;
            }

            // Get a readable title for the content
            let contentTitle = moduleId;
            try {
                if (typeof LearningPaths !== 'undefined') {
                    const moduleInfo = LearningPaths.getModuleById ?
                        LearningPaths.getModuleById(moduleId) : null;
                    if (moduleInfo && moduleInfo.title) {
                        contentTitle = moduleInfo.title;
                    }
                }
            } catch (e) {
                // Use moduleId as fallback
            }

            // Determine event type based on module type and metadata
            let eventType = 'module_completed';
            if (moduleType === 'quiz') {
                eventType = metadata.score >= 70 ? 'quiz_passed' : 'quiz_failed';
            } else if (moduleType === 'lab') {
                eventType = 'lab_completed';
            } else if (moduleType === 'presentation') {
                eventType = 'presentation_viewed';
            }

            // Sync to each enrolled class — but only if the module belongs to that class's curriculum.
            // Without this check, completing an A+ module would write to the MD-100 class progress doc.
            const syncPromises = enrolledClasses.map(async (cls) => {
                try {
                    // Check if this module is part of the class's assigned content
                    if (typeof AssignmentManager !== 'undefined' && AssignmentManager.getClassAssignments) {
                        const assignments = await AssignmentManager.getClassAssignments(cls.id);
                        const isRelevant = assignments.some(a => {
                            // Direct content match
                            if (a.contentId === moduleId) return true;
                            // Path assignment — check if module is in the path's module list
                            if (a.assignmentType === 'path') {
                                if (typeof ContentRegistry !== 'undefined') {
                                    const path = ContentRegistry.paths?.[a.contentId];
                                    if (path?.modules?.includes(moduleId)) return true;
                                } else {
                                    // ContentRegistry not loaded (module pages don't have it) —
                                    // use prefix heuristic: 'forge-md100-m01' belongs to path 'md-100'
                                    const norm = a.contentId.replace(/-/g, '').toLowerCase();
                                    if (moduleId.replace(/-/g, '').toLowerCase().includes(norm)) return true;
                                }
                            }
                            return false;
                        });
                        if (!isRelevant) {
                            console.log(`[ProgressManager] Skipping class ${cls.name} — ${moduleId} not in curriculum`);
                            return;
                        }
                    }

                    // Submit progress update
                    await AssignmentManager.submitProgress(cls.id, moduleId, {
                        completed: true,
                        score: metadata.score || null,
                        completedAt: new Date().toISOString()
                    });

                    // Log activity event
                    await AssignmentManager.logActivity(
                        cls.id,
                        eventType,
                        moduleId,
                        contentTitle,
                        { score: metadata.score || null, house: houseId }
                    );

                    console.log(`[ProgressManager] Synced to class: ${cls.name} (${cls.id})`);
                } catch (err) {
                    console.warn(`[ProgressManager] Failed to sync to class ${cls.id}:`, err.message);
                }
            });

            await Promise.allSettled(syncPromises);
            console.log(`[ProgressManager] Firestore sync complete for ${moduleId}`);

        } catch (error) {
            console.error('[ProgressManager] Firestore sync error:', error);
            throw error; // Re-throw so caller can catch
        }
    }

    /**
     * Complete a module and award XP
     * @param {string} moduleId - The module ID (e.g., 'shield-cia-triad')
     * @param {string} houseId - The house ID (e.g., 'shield')
     * @param {string} moduleType - Type: 'presentation', 'quiz', 'lab', 'tool', 'applet'
     * @param {object} metadata - Additional data (score, time, etc.)
     * @returns {object} Result with XP earned, level ups, unlocks
     */
    static completeModule(moduleId, houseId, moduleType = 'module', metadata = {}) {
        const progress = this.getProgress();
        const result = {
            xpEarned: 0,
            levelUp: false,
            newLevel: progress.level,
            unlocks: [],
            achievements: [],
            nextModule: null
        };

        // Track completion counts for diminishing XP
        if (!progress.completionCounts) progress.completionCounts = {};
        const prevCount = progress.completionCounts[moduleId] || 0;
        progress.completionCounts[moduleId] = prevCount + 1;

        // Check if already completed
        if (progress.completedModules.includes(moduleId)) {
            // Quiz repeats: one-and-done, no additional XP
            if (moduleType === 'quiz') {
                console.log(`Quiz ${moduleId} already completed - no repeat XP`);
                try {
                    if (typeof LearningPaths !== 'undefined') {
                        result.nextModule = LearningPaths.getNextModule(houseId, moduleId);
                    }
                } catch (e) {
                    console.error('Error getting next module:', e);
                }
                this.saveProgress(progress);
                return result;
            }

            // Non-quiz repeat: award diminishing XP (skip array pushes + house tracking)
            const baseRates = {
                lab: this.XP_REWARDS.LAB_COMPLETE,
                presentation: this.XP_REWARDS.PRESENTATION_VIEW,
                tool: this.XP_REWARDS.TOOL_EXPLORE,
                applet: this.XP_REWARDS.TOOL_EXPLORE
            };
            const baseXP = baseRates[moduleType] || this.XP_REWARDS.PRESENTATION_VIEW;
            result.xpEarned = Math.floor(baseXP * Math.pow(0.5, prevCount));

            if (result.xpEarned > 0) {
                const oldLevel = progress.level || 1;
                progress.xp = (Number(progress.xp) || 0) + result.xpEarned;
                progress.level = this.calculateLevel(progress.xp);
                if (progress.level > oldLevel) {
                    result.levelUp = true;
                    result.newLevel = progress.level;
                }
            }

            try {
                if (typeof LearningPaths !== 'undefined') {
                    result.nextModule = LearningPaths.getNextModule(houseId, moduleId);
                }
            } catch (e) {
                console.error('Error getting next module:', e);
            }

            this.saveProgress(progress);
            this.showCompletionNotification(result);
            return result;
        }

        // Mark module as completed
        progress.completedModules.push(moduleId);

        // Update house-specific progress — auto-init the house if missing.
        // Previously this block was guarded by `if (progress.houses[houseId])`,
        // which silently skipped the structured-array update when the house
        // wasn't already initialized. The flat-format write below still ran,
        // creating drift between flat (progress[houseId][moduleId]) and
        // structured (progress.houses[houseId].modulesCompleted) stores.
        if (!progress.houses) progress.houses = {};
        if (!progress.houses[houseId]) {
            progress.houses[houseId] = {
                unlocked: true,
                modulesCompleted: [],
                quizzesPassed: [],
                labsCompleted: [],
                currentModule: null,
                progressPercent: 0,
                lastAccessed: null
            };
        }
        const house = progress.houses[houseId];
        if (!Array.isArray(house.modulesCompleted)) house.modulesCompleted = [];
        if (!Array.isArray(house.quizzesPassed))    house.quizzesPassed = [];
        if (!Array.isArray(house.labsCompleted))    house.labsCompleted = [];
        if (!house.modulesCompleted.includes(moduleId)) {
            house.modulesCompleted.push(moduleId);
        }
        house.lastAccessed = Date.now();

        /* Update progress percentage — INTERSECTED WITH THE PATH, not a raw count.
           This divided `house.modulesCompleted.length` by `pathModules.length`, which are two
           different populations: modulesCompleted holds everything ever completed under this
           house, while pathModules is only what the learning path lists. Anything completed under
           the house but absent from the path inflates the numerator, and nothing bounds the result
           at 100. HouseProgressPanel reads this stored field directly and fires its
           "House Mastery Complete!" banner at >= 100, so an inflated value announces mastery a
           student has not earned and never self-corrects, because the extra ids stay in
           modulesCompleted forever.
           getHouseProgress() has always computed this correctly by filtering pathModules against
           modulesCompleted. This is the same question answered two ways in one file, which is the
           mistake that keeps costing us; it now uses the same intersection. Found by a reviewer
           blocking the BUG-253 migration, whose op-* ids are exactly such non-path entries and
           would have made a latent bug routine. */
        const pathModules = LearningPaths.getHouseModules(houseId);
        if (pathModules && pathModules.length > 0) {
            const completedInPath = pathModules.filter(m => house.modulesCompleted.includes(m.id));
            house.progressPercent = Math.round(
                (completedInPath.length / pathModules.length) * 100
            );
        }

        // DUAL-WRITE: Also save in flat format for Handler Dashboard sync
        // This ensures checkLocalCompletion() can find completions from QuizEngine
        if (!progress[houseId]) progress[houseId] = {};
        progress[houseId][moduleId] = {
            completed: true,
            completedAt: new Date().toISOString(),
            score: metadata.score || null
        };

        // Calculate XP based on module type
        switch (moduleType) {
            case 'quiz':
                // 70-89% = 100 XP, 90%+ = 200 XP (first time only)
                result.xpEarned = (metadata.score >= 90)
                    ? this.XP_REWARDS.QUIZ_PERFECT
                    : this.XP_REWARDS.QUIZ_PASS;
                // Store quiz result
                progress.quizHistory.push({
                    moduleId,
                    houseId,
                    score: metadata.score,
                    attempts: metadata.attempts,
                    time: metadata.time,
                    completedAt: Date.now()
                });
                if (!progress.houses[houseId].quizzesPassed.includes(moduleId)) {
                    progress.houses[houseId].quizzesPassed.push(moduleId);
                }
                break;

            case 'lab':
                result.xpEarned = this.XP_REWARDS.LAB_COMPLETE;
                progress.labsCompleted.push(moduleId);
                if (!progress.houses[houseId].labsCompleted.includes(moduleId)) {
                    progress.houses[houseId].labsCompleted.push(moduleId);
                }
                break;

            case 'presentation':
                result.xpEarned = this.XP_REWARDS.PRESENTATION_VIEW;
                break;

            case 'tool':
            case 'applet':
                result.xpEarned = this.XP_REWARDS.TOOL_EXPLORE;
                break;

            default:
                result.xpEarned = this.XP_REWARDS.MODULE_COMPLETE;
        }

        // Add XP and check for level up (force numeric to prevent string concatenation)
        const oldLevel = progress.level || 1;
        progress.xp = (Number(progress.xp) || 0) + result.xpEarned;
        progress.level = this.calculateLevel(progress.xp);

        if (progress.level > oldLevel) {
            result.levelUp = true;
            result.newLevel = progress.level;
        }

        // Check for skill tree unlocks (divergent paths)
        result.unlocks = this.checkSkillUnlocks(progress, moduleId, houseId);

        // Determine next module in path
        result.nextModule = LearningPaths.getNextModule(houseId, moduleId);

        // Save progress to localStorage
        this.saveProgress(progress);

        // Increment standalone counters (keeps parity with ModuleProgress path)
        try {
            const lsModules = parseInt(localStorage.getItem('hexworth_modules_completed') || '0', 10) || 0;
            localStorage.setItem('hexworth_modules_completed', String(lsModules + 1));
            if (moduleType === 'quiz' && metadata.score >= 70) {
                const lsQuizzes = parseInt(localStorage.getItem('hexworth_quizzes_passed') || '0', 10) || 0;
                localStorage.setItem('hexworth_quizzes_passed', String(lsQuizzes + 1));
            }
        } catch (e) { /* non-critical */ }

        // Sync to Firestore for instructor analytics (async, non-blocking)
        this.syncToFirestore(moduleId, houseId, moduleType, metadata).catch(err => {
            console.warn('[ProgressManager] Firestore sync failed (offline?):', err.message);
        });

        // Check for achievements
        result.achievements = AchievementSystem.checkProgressAchievements(progress, {
            moduleId,
            houseId,
            moduleType,
            ...metadata
        });

        // Show notification
        this.showCompletionNotification(result);

        return result;
    }

    /**
     * Calculate level from XP (uncapped — formula-based, no array lookup)
     * Formula inverse: N = floor((1 + sqrt(1 + xp/12.5)) / 2)
     */
    static calculateLevel(xp) {
        if (!xp || xp <= 0) return 1;
        return Math.max(1, Math.floor((1 + Math.sqrt(1 + xp / 12.5)) / 2));
    }

    /**
     * Get XP required for next level (always returns a value — no cap)
     */
    static getXPForNextLevel(currentLevel) {
        return 50 * (currentLevel + 1) * currentLevel;
    }

    /**
     * Get current level progress (0-100%)
     */
    static getLevelProgress(xp, level) {
        const currentThreshold = 50 * level * (level - 1);
        const nextThreshold = 50 * (level + 1) * level;
        const range = nextThreshold - currentThreshold;
        const progress = xp - currentThreshold;
        return range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 100;
    }

    /**
     * Get tier info for a given level
     */
    static getLevelTier(level) {
        for (const tier of this.LEVEL_TIERS) {
            if (level >= tier.min && level <= tier.max) return tier;
        }
        return this.LEVEL_TIERS[this.LEVEL_TIERS.length - 1];
    }

    /**
     * Get the theoretical max XP from all available content
     */
    static getMaxXP() {
        if (typeof ContentCatalog === 'undefined') return 495000; // fallback estimate

        const modules = ContentCatalog.getAllModules();
        let maxXP = 0;

        modules.forEach(mod => {
            if (mod.status && mod.status !== 'available') return;
            const comps = mod.components || [];
            // Each component type awards its own XP
            if (comps.includes('presentation')) maxXP += this.XP_REWARDS.PRESENTATION_VIEW;
            if (comps.includes('quiz'))         maxXP += this.XP_REWARDS.QUIZ_PERFECT;
            if (comps.includes('lab'))          maxXP += this.XP_REWARDS.LAB_COMPLETE;
            if (comps.includes('game'))         maxXP += this.XP_REWARDS.GAME_HIGH_SCORE;
            if (comps.includes('applet') || comps.includes('tool')) maxXP += this.XP_REWARDS.TOOL_EXPLORE;
            // Full module completion bonus
            maxXP += this.XP_REWARDS.MODULE_COMPLETE;
        });

        // Add house mastery bonuses (8 houses × 10k)
        maxXP += Object.keys(this.HOUSES).length * this.XP_REWARDS.COURSE_COMPLETE;

        return maxXP;
    }

    /**
     * Get completion stats across all houses
     */
    static getCompletionStats() {
        const progress = this.getProgress();

        // Structured count
        let completed = Array.isArray(progress.completedModules) ? progress.completedModules.length : 0;

        // Reconcile with flat-format count (use the higher number)
        let flatCount = 0;
        Object.keys(this.HOUSES).forEach(houseId => {
            flatCount += this._countFlatCompletions(progress, houseId);
        });
        const lsCount = parseInt(localStorage.getItem('hexworth_modules_completed') || '0') || 0;
        completed = Math.max(completed, flatCount, lsCount);

        let total = 0;
        if (typeof ContentCatalog !== 'undefined') {
            total = ContentCatalog.getAllModules().filter(m => !m.status || m.status === 'available').length;
        }

        return {
            completed,
            total,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /**
     * Get journey milestones (key moments in user's history)
     */
    static getJourneyMilestones() {
        const progress = this.getProgress();
        const milestones = [];

        // Member since
        if (progress.createdAt) {
            milestones.push({ icon: '<img src="/assets/images/icons/icon-rocket.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Joined Hexworth', date: progress.createdAt, type: 'start' });
        }

        // House milestones
        Object.entries(progress.houses || {}).forEach(([houseId, house]) => {
            const def = this.HOUSES[houseId];
            if (!def) return;
            const count = (house.modulesCompleted || []).length;
            if (count >= 1) {
                milestones.push({ icon: def.icon, label: `First ${def.name} module`, date: house.lastAccessed, type: 'house' });
            }
            if (count >= 10) {
                milestones.push({ icon: '<img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: `10 ${def.name} modules`, date: house.lastAccessed, type: 'milestone' });
            }
        });

        // Level milestones — base tiers + prestige
        const level = progress.level || 1;
        if (level >= 10)  milestones.push({ icon: '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Initiate Complete (Lv 10)', type: 'level' });
        if (level >= 20)  milestones.push({ icon: '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Apprentice (Lv 20)', type: 'level' });
        if (level >= 30)  milestones.push({ icon: '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Journeyman (Lv 30)', type: 'level' });
        if (level >= 40)  milestones.push({ icon: '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Specialist (Lv 40)', type: 'level' });
        if (level >= 50)  milestones.push({ icon: '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Expert (Lv 50)', type: 'level' });
        if (level >= 60)  milestones.push({ icon: '<img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Veteran (Lv 60)', type: 'level' });
        if (level >= 70)  milestones.push({ icon: '<img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Master (Lv 70)', type: 'level' });
        if (level >= 80)  milestones.push({ icon: '<img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Grandmaster (Lv 80)', type: 'level' });
        if (level >= 90)  milestones.push({ icon: '<img src="/assets/images/icons/icon-crown.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'Legend (Lv 90)', type: 'level' });
        if (level >= 100) milestones.push({ icon: '<img src="/assets/images/icons/icon-crown.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: 'HEXWORTH PRIME (Lv 100)', type: 'level' });
        if (level >= 150) milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Ascendant (Lv 150)', type: 'level' });
        if (level >= 200) milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Transcendent (Lv 200)', type: 'level' });
        if (level >= 300) milestones.push({ icon: '<img src="/assets/images/icons/icon-explosion.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Mythic (Lv 300)', type: 'level' });
        if (level >= 500) milestones.push({ icon: '<img src="/assets/images/icons/icon-explosion.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">', label: 'Eternal (Lv 500)', type: 'level' });

        // XP milestones
        const xp = progress.xp || 0;
        if (xp >= 1000)    milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '1,000 XP earned', type: 'xp' });
        if (xp >= 10000)   milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '10,000 XP earned', type: 'xp' });
        if (xp >= 50000)   milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '50,000 XP earned', type: 'xp' });
        if (xp >= 100000)  milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '100,000 XP earned', type: 'xp' });
        if (xp >= 250000)  milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '250,000 XP earned', type: 'xp' });
        if (xp >= 500000)  milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '500,000 XP earned', type: 'xp' });
        if (xp >= 1000000) milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '1,000,000 XP earned', type: 'xp' });
        if (xp >= 5000000) milestones.push({ icon: '<img src="/assets/images/icons/icon-diamond.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">', label: '5,000,000 XP earned', type: 'xp' });

        return milestones;
    }

    /**
     * Check for skill tree unlocks based on completion
     */
    static checkSkillUnlocks(progress, moduleId, houseId) {
        const unlocks = [];
        const skillTree = this.getSkillTree();

        // Check each skill branch for unlock conditions
        Object.entries(skillTree.branches || {}).forEach(([branchId, branch]) => {
            if (progress.divergentBranches.includes(branchId)) return;

            // Check if prerequisites are met
            const prereqsMet = branch.prerequisites.every(prereq => {
                if (prereq.type === 'module') {
                    return progress.completedModules.includes(prereq.id);
                }
                if (prereq.type === 'level') {
                    return progress.level >= prereq.value;
                }
                if (prereq.type === 'house_progress') {
                    const house = progress.houses[prereq.houseId];
                    return house && house.progressPercent >= prereq.value;
                }
                return false;
            });

            if (prereqsMet) {
                progress.divergentBranches.push(branchId);
                unlocks.push({
                    type: 'skill_branch',
                    id: branchId,
                    name: branch.name,
                    description: branch.description
                });
            }
        });

        return unlocks;
    }

    /**
     * Get skill tree data
     */
    static getSkillTree() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.SKILL_TREE);
            if (stored) return JSON.parse(stored);
        } catch (e) {}
        return SkillTreeData.getDefaultTree();
    }

    /**
     * Save skill tree customizations
     */
    static saveSkillTree(tree) {
        localStorage.setItem(this.STORAGE_KEYS.SKILL_TREE, JSON.stringify(tree));
    }

    /**
     * Get user profile/stats summary
     */
    static getProfile() {
        const progress = this.getProgress();
        const achievements = (typeof AchievementSystem !== 'undefined')
            ? AchievementSystem.getUnlockedAchievements() : [];

        // Deterministic XP — always recompute from completion state when XPCalculator is loaded
        let xp, level, integrity = null;
        if (typeof XPCalculator !== 'undefined') {
            const calc = XPCalculator.recalculate();
            xp = calc.xp;
            level = calc.level;
            integrity = calc.integrity || null;
        } else {
            // Fallback for pages without XPCalculator: keep existing reconciliation
            const progressXP = (typeof progress.xp === 'number' && isFinite(progress.xp)) ? progress.xp : 0;
            const standaloneXP = parseInt(localStorage.getItem('hexworth_xp') || '0', 10) || 0;
            xp = Math.max(progressXP, standaloneXP);
            level = this.calculateLevel(xp);
        }

        // Sync computed values back to both stores so pages without XPCalculator
        // still see correct values.
        // GUARD: Only write back to hexworth_progress if it has real data (not empty defaults).
        const progressXP = (typeof progress.xp === 'number' && isFinite(progress.xp)) ? progress.xp : 0;
        const storedLevel = (typeof progress.level === 'number' && isFinite(progress.level) && progress.level >= 1) ? progress.level : 1;

        if (xp !== progressXP || level !== storedLevel) {
            const hasRealData = (progress.completedModules && progress.completedModules.length > 0)
                || Object.keys(progress.houses || {}).some(h => {
                    const house = progress.houses[h];
                    return house && (house.modulesCompleted || []).length > 0;
                })
                || Object.keys(this.HOUSES).some(h => progress[h] && typeof progress[h] === 'object' && !Array.isArray(progress[h]));

            if (hasRealData) {
                try {
                    progress.xp = xp;
                    progress.level = level;
                    localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
                } catch (e) { /* best-effort sync */ }
            }

            // Always update standalone scalar keys
            try {
                localStorage.setItem('hexworth_xp', String(xp));
                localStorage.setItem('hexworth_level', String(level));
            } catch (e) { /* best-effort sync */ }
        }

        const nextXP = this.getXPForNextLevel(level);
        const tier = this.getLevelTier(level) || { name: 'Initiate', color: '#6b7280' };
        const completion = this.getCompletionStats();
        const maxXP = this.getMaxXP() || 495000;

        // ── Reconcile counts from BOTH structured AND flat progress ──
        // Structured: progress.completedModules[], houses[h].quizzesPassed[], etc.
        // Flat: progress[houseId][moduleId] = { completed: true, score: 85 }
        const counts = this._reconcileCounts(progress);

        // ── Build per-house progress with real percentages ──
        const hasCatalog = typeof ContentCatalog !== 'undefined';
        const houseProgress = Object.entries(progress.houses || {}).map(([id, house]) => {
            const def = this.HOUSES[id] || {};
            const completedCount = (house.modulesCompleted || []).length;
            // Also count flat-format completions for this house
            const flatCount = this._countFlatCompletions(progress, id);
            const totalCompleted = Math.max(completedCount, flatCount);
            // Get total available modules in this house from ContentCatalog
            let totalInHouse = 0;
            if (hasCatalog) {
                totalInHouse = ContentCatalog.getHouseModules(id)
                    .filter(m => !m.status || m.status === 'available').length;
            }
            const percent = totalInHouse > 0
                ? Math.round((totalCompleted / totalInHouse) * 100) : 0;
            return {
                id,
                ...def,
                ...house,
                percent,
                completedCount: totalCompleted,
                totalInHouse
            };
        }).filter(h => h.completedCount > 0 || h.totalInHouse > 0);

        return {
            xp,
            level,
            maxLevel: null, // uncapped
            levelProgress: this.getLevelProgress(xp, level),
            xpToNextLevel: nextXP ? nextXP - xp : null,
            tier,
            maxXP,
            xpPercent: maxXP > 0 ? Math.round((xp / maxXP) * 100) : 0,
            completion,
            totalModulesCompleted: counts.modules,
            totalQuizzesPassed: counts.quizzes,
            totalLabsCompleted: counts.labs,
            achievementCount: achievements.length,
            houseProgress,
            divergentBranches: progress.divergentBranches,
            memberSince: progress.createdAt,
            milestones: this.getJourneyMilestones(),
            integrity
        };
    }

    /**
     * Reconcile module/quiz/lab counts from both structured and flat progress formats.
     * Returns the HIGHER of the two counts to avoid undercounting.
     */
    static _reconcileCounts(progress) {
        // Structured counts
        const structModules = Array.isArray(progress.completedModules)
            ? progress.completedModules.length
            : Object.keys(progress.completedModules || {}).length;
        const structLabs = Array.isArray(progress.labsCompleted)
            ? progress.labsCompleted.length
            : Object.keys(progress.labsCompleted || {}).length;

        // Count quizzes from per-house quizzesPassed arrays (structured)
        let structQuizzes = 0;
        Object.values(progress.houses || {}).forEach(house => {
            if (Array.isArray(house.quizzesPassed)) {
                structQuizzes += house.quizzesPassed.length;
            }
        });
        // Also check the old quizHistory array
        if (Array.isArray(progress.quizHistory)) {
            structQuizzes = Math.max(structQuizzes, progress.quizHistory.filter(q => q.score >= 70).length);
        }

        // Flat-format counts: progress[houseId][moduleId] = { completed, score }
        let flatModules = 0;
        let flatQuizzes = 0;
        let flatLabs = 0;
        const houseIds = Object.keys(this.HOUSES);
        houseIds.forEach(houseId => {
            const houseData = progress[houseId];
            if (!houseData || typeof houseData !== 'object') return;
            // Skip structured fields (arrays, primitives)
            if (Array.isArray(houseData)) return;
            Object.entries(houseData).forEach(([key, val]) => {
                if (!val || typeof val !== 'object' || Array.isArray(val)) return;
                if (val.completed) {
                    flatModules++;
                    if (val.score !== undefined) flatQuizzes++;
                }
            });
        });

        // Also check localStorage counters as a third source
        const lsQuizzes = parseInt(localStorage.getItem('hexworth_quizzes_passed') || '0', 10) || 0;
        const lsModules = parseInt(localStorage.getItem('hexworth_modules_completed') || '0', 10) || 0;

        return {
            modules: Math.max(structModules, flatModules, lsModules),
            quizzes: Math.max(structQuizzes, flatQuizzes, lsQuizzes),
            labs: Math.max(structLabs, flatLabs)
        };
    }

    /**
     * Count flat-format completions for a specific house.
     * Reads progress[houseId][moduleId].completed entries.
     */
    static _countFlatCompletions(progress, houseId) {
        const houseData = progress[houseId];
        if (!houseData || typeof houseData !== 'object' || Array.isArray(houseData)) return 0;
        let count = 0;
        Object.values(houseData).forEach(val => {
            if (val && typeof val === 'object' && !Array.isArray(val) && val.completed) {
                count++;
            }
        });
        return count;
    }

    /**
     * Get house-specific progress
     */
    static getHouseProgress(houseId) {
        const progress = this.getProgress();
        const house = (progress.houses || {})[houseId];

        if (!house) return null;

        const pathModules = LearningPaths.getHouseModules(houseId);
        const completedInPath = pathModules.filter(m =>
            house.modulesCompleted.includes(m.id)
        );

        // Check for house mastery reward (500k XP)
        if (pathModules.length > 0 && completedInPath.length === pathModules.length) {
            this.awardHouseMastery(houseId);
        }

        return {
            ...this.HOUSES[houseId],
            ...house,
            totalModules: pathModules.length,
            completedCount: completedInPath.length,
            nextModule: LearningPaths.getNextIncompleteModule(houseId, house.modulesCompleted)
        };
    }

    /**
     * Award 500,000 XP for completing all modules in a house path.
     * Tracked in hexworth_house_completions to prevent duplicates.
     */
    static HOUSE_MASTERY_XP = 10000; // XP_REWARDS.COURSE_COMPLETE

    static awardHouseMastery(houseId) {
        /* BUG-254. This was a hand-maintained second list and it had drifted from HOUSES in BOTH
           directions: it carried `ai`, `linux` and `arena`, which are not houses at all, and it
           omitted `matrix` and `divergent`, which are. So the guard whose stated job is rejecting
           garbage house ids accepted three pieces of garbage, while two real houses could never be
           awarded mastery at all. At HOUSE_MASTERY_XP each, that is 20,000 XP no student could
           reach, and three ids that could inflate the very count this exists to protect.

           Derived from HOUSES rather than restated, because the restating IS the bug: the same
           question answered in two places drifts the moment either one changes. Same mistake shape
           as completeModule's progressPercent, fixed the same way.

           NOTE, and it is why BUG-254 stays open: this removes ONE of two blockers. The caller
           also requires pathModules.length > 0 && completedInPath.length === pathModules.length,
           and dark-arts, matrix and divergent have no LearningPaths entry at all, so mastery still
           cannot fire for them until that content exists. Authoring three houses' worth of
           learning path is a curriculum decision, not a drive-by fix. */
        if (!Object.prototype.hasOwnProperty.call(this.HOUSES, houseId)) return;

        const COMPLETION_KEY = 'hexworth_house_completions';
        try {
            const completions = JSON.parse(localStorage.getItem(COMPLETION_KEY) || '{}');
            if (completions[houseId]) return; // Already awarded

            // Mark as awarded
            completions[houseId] = {
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));

            // Award XP
            const progress = this.getProgress();
            progress.xp = (Number(progress.xp) || 0) + this.HOUSE_MASTERY_XP;
            progress.level = this.calculateLevel(progress.xp);
            this.saveProgress(progress);

            console.log(`<img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> House ${houseId} mastery complete! +${this.HOUSE_MASTERY_XP.toLocaleString()} XP`);

            // Unlock house mastery achievement
            if (typeof AchievementManager !== 'undefined') {
                AchievementManager.unlock(`house_master_${houseId}`);
            }
        } catch (e) {
            console.warn('[ProgressManager] House mastery check failed:', e.message);
        }
    }

    /**
     * Show completion notification toast
     */
    static showCompletionNotification(result) {
        const toast = document.createElement('div');
        toast.className = 'hexworth-progress-toast';

        let content = `
            <div class="toast-header">
                <span class="toast-icon"><img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></span>
                <span class="toast-title">Progress Updated!</span>
            </div>
            <div class="toast-body">
                <div class="xp-earned">+${result.xpEarned} XP</div>
        `;

        if (result.levelUp) {
            content += `<div class="level-up"><img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Level Up! Now Level ${result.newLevel}</div>`;
        }

        if (result.unlocks.length > 0) {
            content += '<div class="unlocks"><img src="/assets/images/icons/icon-unlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> New content unlocked!</div>';
        }

        if (result.nextModule) {
            content += `
                <button class="toast-next-btn" onclick="ProgressManager.navigateToModule('${result.nextModule.id}', '${result.nextModule.href}')">
                    Continue → ${result.nextModule.title}
                </button>
            `;
        }

        content += '</div>';
        toast.innerHTML = content;

        // Add styles if not present
        this.ensureToastStyles();

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto dismiss after 8 seconds (longer to allow clicking next)
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 8000);
    }

    /**
     * Navigate to a module
     */
    static navigateToModule(moduleId, href) {
        if (href) {
            window.location.href = href;
        }
    }

    /**
     * Add toast styles to document
     */
    static ensureToastStyles() {
        if (document.getElementById('hexworth-progress-toast-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'hexworth-progress-toast-styles';
        styles.textContent = `
            .hexworth-progress-toast {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, rgba(20, 20, 40, 0.98), rgba(30, 20, 50, 0.98));
                border: 1px solid rgba(168, 85, 247, 0.4);
                border-radius: 12px;
                padding: 16px 20px;
                min-width: 280px;
                max-width: 360px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.2);
                z-index: 10000;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .hexworth-progress-toast.show {
                transform: translateX(0);
            }

            .toast-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }

            .toast-icon {
                font-size: 1.2rem;
            }

            .toast-title {
                color: #e0e0e0;
                font-weight: 600;
                font-size: 1rem;
            }

            .toast-body {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .xp-earned {
                color: #22c55e;
                font-size: 1.25rem;
                font-weight: 700;
            }

            .level-up {
                color: #fbbf24;
                font-weight: 600;
                padding: 8px;
                background: rgba(251, 191, 36, 0.1);
                border-radius: 6px;
                text-align: center;
            }

            .unlocks {
                color: #a78bfa;
                font-size: 0.9rem;
            }

            .toast-next-btn {
                margin-top: 8px;
                padding: 10px 16px;
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.9rem;
            }

            .toast-next-btn:hover {
                background: linear-gradient(135deg, #8b5cf6, #c084fc);
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Reset all progress (for testing/user request)
     */
    static resetProgress() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        window.dispatchEvent(new CustomEvent('hexworth:progressReset'));
    }

    /**
     * Export progress for backup
     */
    static exportProgress() {
        return {
            progress: this.getProgress(),
            achievements: AchievementSystem.getUnlockedAchievements(),
            skillTree: this.getSkillTree(),
            exportedAt: Date.now()
        };
    }

    /**
     * Import progress from backup
     */
    static importProgress(data) {
        if (data.progress) {
            this.saveProgress(data.progress);
        }
        if (data.achievements) {
            localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
        }
        if (data.skillTree) {
            this.saveSkillTree(data.skillTree);
        }
        window.dispatchEvent(new CustomEvent('hexworth:progressImported'));
    }

    /**
     * Dynamically load Firestore dependencies for sync.
     * Resolves the script path from ProgressManager.js location.
     */
    static _depsLoading = null;
    static async _loadFirestoreDeps() {
        if (this._depsLoading) return this._depsLoading;
        this._depsLoading = (async () => {
            // Find our own script tag to resolve relative path
            const scripts = document.querySelectorAll('script[src*="ProgressManager"]');
            let basePath = '';
            if (scripts.length > 0) {
                const src = scripts[0].getAttribute('src');
                basePath = src.substring(0, src.lastIndexOf('/') + 1);
            }

            const deps = ['FirebaseAuth.js', 'FirestoreManager.js', 'ClassManager.js', 'AssignmentManager.js'];
            for (const dep of deps) {
                if (document.querySelector(`script[src*="${dep}"]`)) continue;
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = basePath + dep;
                    s.onload = resolve;
                    s.onerror = () => reject(new Error(`Failed to load ${dep}`));
                    document.head.appendChild(s);
                });
            }

            // Initialize FirebaseAuth (imports Firebase SDK from CDN)
            if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.init) {
                await FirebaseAuth.init();
            }
        })();
        return this._depsLoading;
    }

    // ═══════════════════════════════════════════════════════════════
    // CORE 2 PROGRESS BRIDGE
    // Bidirectional sync between aplus-core2-progress and hexworth_progress.forge
    // ═══════════════════════════════════════════════════════════════

    /**
     * Sync Core 2 progress between legacy key (aplus-core2-progress)
     * and the house progress key (hexworth_progress.forge).
     *
     * Direction 1: aplus-core2-progress → hexworth_progress.forge
     *   Legacy chapters ch13-ch24 → forge keys core2-ch{NN}-index
     *
     * Direction 2: hexworth_progress.forge → aplus-core2-progress
     *   forge keys core2-ch{NN}-index → legacy chapters ch{NN}
     *
     * Runs on page load and on progress update events.
     */
    static syncCore2Progress() {
        try {
            const core2Key = 'aplus-core2-progress';
            // Read from new namespace first, fall back to old key
            const core2Progress = this.getCourseProgress(core2Key);
            const hp = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PROGRESS) || '{}');
            if (!hp.forge) hp.forge = {};

            let changed = false;
            let core2Changed = false;

            // Direction 1: aplus-core2-progress → hexworth_progress.forge
            for (let ch = 13; ch <= 24; ch++) {
                const chKey = 'ch' + ch;
                const forgeKey = `core2-${chKey}-index`;

                if (core2Progress[chKey] && core2Progress[chKey].completed) {
                    if (!hp.forge[forgeKey] || !hp.forge[forgeKey].completed) {
                        hp.forge[forgeKey] = {
                            completed: true,
                            completedAt: core2Progress[chKey].lastAttempt || new Date().toISOString(),
                            score: core2Progress[chKey].score || null
                        };
                        changed = true;
                    }
                }
            }

            // Direction 2: hexworth_progress.forge → aplus-core2-progress
            for (let ch = 13; ch <= 24; ch++) {
                const chKey = 'ch' + ch;
                const forgeKey = `core2-${chKey}-index`;

                if (hp.forge[forgeKey] && hp.forge[forgeKey].completed) {
                    if (!core2Progress[chKey] || !core2Progress[chKey].completed) {
                        core2Progress[chKey] = {
                            completed: true,
                            score: hp.forge[forgeKey].score || null,
                            lastAttempt: hp.forge[forgeKey].completedAt || new Date().toISOString()
                        };
                        core2Changed = true;
                    }
                }
            }

            // Also check quiz completions stored in standalone keys (core2-ch{NN}-quiz)
            for (let ch = 13; ch <= 24; ch++) {
                const quizKey = `core2-ch${ch}-quiz`;
                try {
                    const quizData = JSON.parse(localStorage.getItem(quizKey) || '{}');
                    if (quizData.completed) {
                        const chKey = 'ch' + ch;
                        const forgeKey = `core2-${chKey}-index`;

                        if (!hp.forge[forgeKey] || !hp.forge[forgeKey].completed) {
                            hp.forge[forgeKey] = {
                                completed: true,
                                completedAt: quizData.completedAt || new Date().toISOString(),
                                score: quizData.score || null
                            };
                            changed = true;
                        }
                        if (!core2Progress[chKey] || !core2Progress[chKey].completed) {
                            core2Progress[chKey] = {
                                completed: true,
                                score: quizData.score || null,
                                lastAttempt: quizData.completedAt || new Date().toISOString()
                            };
                            core2Changed = true;
                        }
                    }
                } catch (e) { /* skip individual quiz key errors */ }
            }

            // Persist changes
            if (changed) {
                localStorage.setItem(this.STORAGE_KEYS.PROGRESS, JSON.stringify(hp));
            }
            if (core2Changed) {
                // Dual-write: both old and new namespace key
                this.saveCourseProgress(core2Key, core2Progress);
            }

            if (changed || core2Changed) {
                console.log('[ProgressManager] Core 2 progress bridge synced');
            }
        } catch (e) {
            console.warn('[ProgressManager] Core 2 bridge sync error:', e);
        }
    }
}

// Make globally available
window.ProgressManager = ProgressManager;

// Run namespace migration + Core 2 progress bridge on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ProgressManager.migrateProgressNamespace();
        // BUG-253. Runs BEFORE syncCore2Progress and before anything reads progress.houses, so no
        // consumer ever sees the orphaned `operator` bucket on a migrated store. Flag-guarded, so
        // this is a single localStorage read on every subsequent load.
        ProgressManager.migrateOperatorHouseToMatrix();
        ProgressManager.syncCore2Progress();
    });
} else {
    ProgressManager.migrateProgressNamespace();
    ProgressManager.migrateOperatorHouseToMatrix();
    ProgressManager.syncCore2Progress();
}

// Re-sync when progress updates occur
window.addEventListener('hexworth:progressUpdate', () => {
    ProgressManager.syncCore2Progress();
});
window.addEventListener('courseProgress:componentComplete', () => {
    ProgressManager.syncCore2Progress();
});
