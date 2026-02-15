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
     * Check if a WSA module is locally complete
     */
    function checkWSAModule(moduleId) {
        const progress = JSON.parse(localStorage.getItem('wsa-course-progress') || '{}');
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
     * Check local completion for a given contentId
     */
    function checkLocalCompletion(contentId) {
        // A+ Core 1
        const core1Match = contentId.match(/^aplus-core1-(ch\d{2})$/);
        if (core1Match) {
            const progress = JSON.parse(localStorage.getItem('aplus-core1-progress') || '{}');
            const ch = progress[core1Match[1]];
            if (ch && ch.completed) return { completed: true, score: ch.score || null, completedAt: ch.lastAttempt || null };
            return null;
        }

        // A+ Core 2
        const core2Match = contentId.match(/^aplus-core2-(ch\d{2})$/);
        if (core2Match) {
            const progress = JSON.parse(localStorage.getItem('aplus-core2-progress') || '{}');
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

    // Flush queue when coming back online
    window.addEventListener('online', () => {
        console.log('[ProgressSync] Back online — flushing sync queue');
        flushQueue();
    });

    // Export for manual trigger
    window.ProgressSync = { sync, checkLocalCompletion, flushQueue };
})();
