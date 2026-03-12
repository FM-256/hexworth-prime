/**
 * ProgressSync — Lightweight Firestore sync for course progress
 *
 * Syncs localStorage completions to Firestore so the instructor dashboard
 * can see student progress. Works on any page that loads FirebaseAuth,
 * ClassManager, and AssignmentManager.
 *
 * HD-6 additions:
 *   - Offline sync queue (hexworth_sync_queue) — retries on reconnect
 *   - Enrollment cache fallback — uses ClassManager.getCachedEnrollments() when offline
 *
 * Usage: <script src="components/ProgressSync.js"></script>
 * That's it. It auto-runs on auth ready.
 */
(function () {
    'use strict';

    // Debounce: don't sync more than once per 5 seconds
    const SYNC_COOLDOWN = 5000;
    const QUEUE_KEY = 'hexworth_sync_queue';
    const QUEUE_MAX = 100;
    let _lastSync = 0;

    /**
     * Check if a completion happened after enrollment.
     * If enrolledAt is unknown, allow (safe fallback).
     * If completedAt is missing, assume pre-enrollment (skip).
     */
    function _isPostEnrollment(completedAt, enrolledAt) {
        if (!enrolledAt) return true;
        if (!completedAt) return false;
        return new Date(completedAt).getTime() >= new Date(enrolledAt).getTime();
    }

    // ═══════════════════════════════════════════════════════════════
    // QC-6: Course progress namespace helpers
    // Read from new hexworth_progress_* keys first, fall back to old keys.
    // ═══════════════════════════════════════════════════════════════

    /**
     * Read a course progress key with namespace fallback.
     * Checks new key (hexworth_progress_*) first, then old key.
     * If ProgressManager is loaded, delegates to its getCourseProgress();
     * otherwise falls back to direct localStorage reads.
     */
    function _readCourseKey(oldKey) {
        // Delegate to ProgressManager if available (it has the canonical key map)
        if (typeof ProgressManager !== 'undefined' && ProgressManager.getCourseProgress) {
            return ProgressManager.getCourseProgress(oldKey);
        }

        // Standalone fallback: inline key map for when ProgressManager isn't loaded
        const keyMap = {
            'aplus-core1-progress': 'hexworth_progress_core1',
            'aplus-core2-progress': 'hexworth_progress_core2',
            'wsa-course-progress':  'hexworth_progress_wsa',
            'clh_progress':         'hexworth_progress_clh',
            'clh_achievements':     'hexworth_progress_clh_achievements'
        };

        const newKey = keyMap[oldKey];

        // Try new key first
        if (newKey) {
            try {
                const data = localStorage.getItem(newKey);
                if (data !== null) return JSON.parse(data);
            } catch (e) { /* fall through */ }
        }

        // Fall back to old key
        try {
            const data = localStorage.getItem(oldKey);
            if (data !== null) return JSON.parse(data);
        } catch (e) { /* fall through */ }

        return {};
    }

    /**
     * Check if a WSA module is locally complete
     */
    function checkWSAModule(moduleId) {
        const progress = _readCourseKey('wsa-course-progress');
        const mod = progress[moduleId];
        if (!mod) return null;

        const components = ['presentation', 'guiLab', 'psLab', 'quiz'];
        const allComplete = components.every(c => {
            const val = mod[c];
            return val === true || (typeof val === 'object' && val !== null);
        });

        if (!allComplete) return null;

        const quizData = mod.quiz;
        const score = (typeof quizData === 'object' && quizData !== null && quizData.score !== undefined)
            ? quizData.score : null;

        return {
            completed: true,
            score: score,
            completedAt: mod.lastUpdated
                ? new Date(mod.lastUpdated).toISOString()
                : new Date().toISOString()
        };
    }

    /**
     * Check local completion for a given contentId.
     * QC-6: Now checks new hexworth_progress_* keys first, falls back to old keys.
     */
    function checkLocalCompletion(contentId) {
        // A+ Core 1
        const core1Match = contentId.match(/^aplus-core1-(ch\d{2})$/);
        if (core1Match) {
            const progress = _readCourseKey('aplus-core1-progress');
            const ch = progress[core1Match[1]];
            if (ch && ch.completed) return { completed: true, score: ch.score || null, completedAt: ch.lastAttempt || null };
            return null;
        }

        // A+ Core 2
        const core2Match = contentId.match(/^aplus-core2-(ch\d{2})$/);
        if (core2Match) {
            const progress = _readCourseKey('aplus-core2-progress');
            const ch = progress[core2Match[1]];
            if (ch && ch.completed) return { completed: true, score: ch.score || null, completedAt: ch.lastAttempt || null };
            return null;
        }

        // WSA individual module
        const wsaModMatch = contentId.match(/^wsa-(m\d{2})-/);
        if (wsaModMatch) {
            return checkWSAModule(wsaModMatch[1]);
        }

        // WSA whole course
        if (contentId === 'wsa') {
            const modules = ['m01','m02','m03','m04','m05','m06','m07','m08','m09','m10',
                             'm11','m12','m13','m14','m15','m16','m17','m18','m19','m20'];
            const allDone = modules.every(m => checkWSAModule(m) !== null);
            if (allDone) return { completed: true, score: null, completedAt: new Date().toISOString() };
            return null;
        }

        // CLH modules
        const clhMatch = contentId.match(/^script-(clh-\d{3})$/);
        if (clhMatch) {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            const mod = (progress.script || {})[clhMatch[1]];
            if (mod && mod.completed) return { completed: true, score: mod.score || null, completedAt: mod.completedAt || null };
            return null;
        }

        // Game completions (via GameTracker)
        const gameMatch = contentId.match(/^game-(.+)$/);
        if (gameMatch) {
            try {
                const tracker = JSON.parse(localStorage.getItem('hexworth_game_tracker') || '{}');
                const gameData = tracker[gameMatch[1]] || tracker[contentId];
                if (gameData && (gameData.played || gameData.won || gameData.completed)) {
                    return { completed: true, score: gameData.bestScore || null, completedAt: gameData.lastPlayed || null };
                }
            } catch (e) { /* fall through */ }
            return null;
        }

        // Dark Arts gate completions
        const gateMatch = contentId.match(/^gate(\d+)$/);
        if (gateMatch) {
            const key = 'gate' + gateMatch[1] + '_complete';
            try {
                const val = localStorage.getItem(key);
                if (val === 'true' || val === '1') {
                    return { completed: true, score: null, completedAt: null };
                }
                // Also check JSON format
                const parsed = JSON.parse(val);
                if (parsed && parsed.completed) {
                    return { completed: true, score: null, completedAt: parsed.completedAt || null };
                }
            } catch (e) { /* fall through */ }
            return null;
        }

        // Operator mission completions
        const opMatch = contentId.match(/^op-(.+)$/);
        if (opMatch) {
            const keySlug = opMatch[1].replace(/-/g, '');
            const key = 'hexworth_operator_' + keySlug;
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.completed) {
                    return { completed: true, score: data.score || null, completedAt: data.completedAt || null };
                }
            } catch (e) { /* fall through */ }
            return null;
        }

        // Generic house content
        const houseMatch = contentId.match(/^(script|shield|web|forge|cloud|code|key|eye)-(.+)$/);
        if (houseMatch) {
            const [, house, moduleKey] = houseMatch;
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            const hp = progress[house] || {};
            const mod = hp[moduleKey] || hp[contentId];
            if (mod && mod.completed) return { completed: true, score: mod.score || null, completedAt: mod.completedAt || null };
            return null;
        }

        // Arctic modules (stored in hexworth_arctic_progress)
        try {
            const arcticProgress = JSON.parse(localStorage.getItem('hexworth_arctic_progress') || '{}');
            const arcticVal = arcticProgress[contentId];
            if (arcticVal) {
                const completedAt = typeof arcticVal === 'string' ? arcticVal : null;
                return { completed: true, score: null, completedAt };
            }
        } catch (e) { /* fall through */ }

        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // OFFLINE SYNC QUEUE (HD-6)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Enqueue a failed sync item for later retry
     */
    function enqueueItem(item) {
        try {
            const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            queue.push({ ...item, queuedAt: Date.now() });
            // Cap at QUEUE_MAX — drop oldest entries (FIFO)
            while (queue.length > QUEUE_MAX) {
                queue.shift();
            }
            localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            console.warn('[ProgressSync] Failed to enqueue item:', e);
        }
    }

    /**
     * Flush queued items — attempt to submit each, remove on success
     */
    async function flushQueue() {
        if (typeof AssignmentManager === 'undefined') return;

        let queue;
        try {
            queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        } catch (e) {
            return;
        }

        if (queue.length === 0) return;

        const remaining = [];
        let flushed = 0;

        for (const item of queue) {
            try {
                if (item.type === 'progress') {
                    if (typeof ClassManager !== 'undefined' && ClassManager.getEnrollmentDate) {
                        const enrolledAt = await ClassManager.getEnrollmentDate(item.classId);
                        if (!_isPostEnrollment(item.data?.completedAt, enrolledAt)) { flushed++; continue; }
                    }
                    await AssignmentManager.submitProgress(item.classId, item.contentId, item.data);
                    flushed++;
                } else if (item.type === 'activity') {
                    await AssignmentManager.logActivity(
                        item.classId, item.eventType, item.contentId,
                        item.title, item.meta
                    );
                    flushed++;
                } else {
                    // Unknown type — discard
                }
            } catch (e) {
                // Still failing — keep in queue
                remaining.push(item);
            }
        }

        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));

        if (flushed > 0) {
            console.log(`[ProgressSync] Flushed ${flushed} queued item(s), ${remaining.length} remaining`);
        }
    }

    /**
     * Run the sync
     */
    async function sync() {
        // Cooldown check
        const now = Date.now();
        if (now - _lastSync < SYNC_COOLDOWN) return;
        _lastSync = now;

        // Dependencies check
        if (typeof FirebaseAuth === 'undefined') return;
        if (typeof ClassManager === 'undefined') return;
        if (typeof AssignmentManager === 'undefined') return;

        const user = FirebaseAuth.getUser();
        if (!user) return;

        // Flush any queued items first
        await flushQueue();

        // Get enrolled classes — fall back to local cache if network fails
        let classes;
        try {
            classes = await ClassManager.getStudentClasses(user.uid);
        } catch (e) {
            console.warn('[ProgressSync] Network error fetching classes, using cache:', e.message);
            classes = ClassManager.getCachedEnrollments ? ClassManager.getCachedEnrollments() : [];
        }
        if (!classes.length) return;

        // Build enrollment date lookup for pre-enrollment filtering
        const enrollmentDates = {};
        if (typeof ClassManager !== 'undefined' && ClassManager.getEnrollmentDate) {
            for (const cls of classes) {
                try { enrollmentDates[cls.id] = await ClassManager.getEnrollmentDate(cls.id); }
                catch (e) { enrollmentDates[cls.id] = null; }
            }
        }

        try {
            const syncedActivity = JSON.parse(localStorage.getItem('hexworth_synced_activity') || '{}');
            let synced = 0;

            for (const cls of classes) {
                let assignments;
                try {
                    assignments = await AssignmentManager.getClassAssignments(cls.id);
                } catch (e) {
                    console.warn(`[ProgressSync] Could not fetch assignments for ${cls.id}:`, e.message);
                    continue;
                }

                for (const assignment of assignments) {
                    const result = checkLocalCompletion(assignment.contentId);
                    if (result && result.completed) {
                        if (!_isPostEnrollment(result.completedAt, enrollmentDates[cls.id])) continue;
                        // Compute duration from start time if available
                        let duration = null;
                        try {
                            const starts = JSON.parse(localStorage.getItem('hexworth_start_times') || '{}');
                            const wsaMatch = assignment.contentId.match(/^wsa-(m\d{2})/);
                            const startKey = wsaMatch ? 'wsa-' + wsaMatch[1] : assignment.contentId;
                            const startedAt = starts[startKey];
                            if (startedAt && result.completedAt) {
                                const completedMs = new Date(result.completedAt).getTime();
                                duration = Math.round((completedMs - startedAt) / 1000);
                                if (duration < 0) duration = null;
                            }
                        } catch(e) { /* non-critical */ }

                        const progressData = { ...result, duration };

                        try {
                            await AssignmentManager.submitProgress(cls.id, assignment.contentId, progressData);
                            synced++;
                        } catch (e) {
                            // Network failure — enqueue for later
                            enqueueItem({
                                type: 'progress',
                                classId: cls.id,
                                contentId: assignment.contentId,
                                data: progressData
                            });
                        }

                        const activityKey = `${cls.id}:${assignment.contentId}`;
                        if (!syncedActivity[activityKey]) {
                            try {
                                const eventType = result.score !== undefined ? 'quiz_passed' : 'module_completed';
                                await AssignmentManager.logActivity(
                                    cls.id, eventType, assignment.contentId,
                                    assignment.title || assignment.contentId,
                                    { score: result.score }
                                );
                                syncedActivity[activityKey] = Date.now();
                            } catch (e) {
                                // Network failure — enqueue activity log
                                enqueueItem({
                                    type: 'activity',
                                    classId: cls.id,
                                    eventType: result.score !== undefined ? 'quiz_passed' : 'module_completed',
                                    contentId: assignment.contentId,
                                    title: assignment.title || assignment.contentId,
                                    meta: { score: result.score }
                                });
                            }
                        }
                    }

                    // Per-module expansion for path assignments (enables module-level heat maps)
                    if (assignment.assignmentType === 'path' && typeof LearningPaths !== 'undefined') {
                        const pathDef = LearningPaths.PATHS[assignment.contentId];
                        if (pathDef && pathDef.modules) {
                            for (const mod of pathDef.modules) {
                                const modActivityKey = `${cls.id}:${mod.id}`;
                                if (syncedActivity[modActivityKey]) continue;
                                const modResult = checkLocalCompletion(mod.id);
                                if (modResult && modResult.completed) {
                                    if (!_isPostEnrollment(modResult.completedAt, enrollmentDates[cls.id])) continue;
                                    try {
                                        await AssignmentManager.submitProgress(cls.id, mod.id, modResult);
                                        syncedActivity[modActivityKey] = Date.now();
                                        synced++;
                                    } catch (e) {
                                        enqueueItem({ type: 'progress', classId: cls.id, contentId: mod.id, data: modResult });
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (synced > 0) {
                localStorage.setItem('hexworth_synced_activity', JSON.stringify(syncedActivity));
                console.log(`[ProgressSync] Synced ${synced} completion(s) to Firestore`);
            }
        } catch (error) {
            console.warn('[ProgressSync] Sync failed:', error);
        }
    }

    // Auto-sync on auth ready
    window.addEventListener('firebaseAuthStateChanged', (e) => {
        if (e.detail && e.detail.user) {
            sync();
        }
    });

    // Re-sync when progress updates (if on same page)
    window.addEventListener('courseProgress:componentComplete', () => sync());
    window.addEventListener('wsa-progress-updated', () => sync());
    window.addEventListener('arctic:moduleComplete', () => sync());

    // Flush queue when coming back online
    window.addEventListener('online', () => {
        console.log('[ProgressSync] Back online — flushing sync queue');
        flushQueue();
    });

    // Export for manual trigger
    window.ProgressSync = { sync, checkLocalCompletion, flushQueue };
})();
