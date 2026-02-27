/**
 * Python Engineering Course Progress Tracker
 * Tracks module completion state across presentations, labs, and quizzes
 * Delegates to CourseProgress when available for event emission + Layer 1→2 bridge
 */

const PYEProgress = (function() {
    const STORAGE_KEY = 'pye-course-progress';

    // Module IDs
    const MODULES = [
        'ch01', 'ch02', 'ch03', 'ch04', 'ch05',
        'midterm',
        'ch06', 'ch07', 'ch08', 'ch09', 'ch10',
        'capstone'
    ];

    // Special modules that count as complete with ANY single component done
    const SPECIAL_MODULES = new Set(['midterm', 'capstone']);

    // Component types per regular chapter (immersive = single-component)
    const COMPONENTS = ['presentation', 'lab', 'quiz'];

    // Lazy-init CourseProgress delegation
    let _cp = null;
    function _getCourseProgress() {
        if (!_cp && typeof CourseProgress !== 'undefined') {
            _cp = CourseProgress.create('pye', {
                modules: MODULES,
                components: COMPONENTS,
                storageKey: STORAGE_KEY
            });
        }
        return _cp;
    }

    /**
     * Get all progress data
     */
    function getAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('PYEProgress: Error reading progress', e);
            return {};
        }
    }

    /**
     * Save all progress data
     */
    function saveAll(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('pye-progress-updated', { detail: data }));
        } catch (e) {
            console.error('PYEProgress: Error saving progress', e);
        }
    }

    /**
     * Get progress for a specific module
     */
    function getModule(moduleId) {
        const all = getAll();
        return all[moduleId] || {};
    }

    /**
     * Check if a stored component value counts as complete
     */
    function _isComplete(val) {
        return val === true || (typeof val === 'object' && val !== null);
    }

    /**
     * Mark a component as complete
     * @param {string} moduleId - e.g., 'ch01', 'midterm'
     * @param {string} component - 'presentation', 'lab', 'quiz'
     * @param {object} [metadata] - optional metadata (e.g., { passed: true, score: 80 })
     */
    function markComplete(moduleId, component, metadata) {
        const cp = _getCourseProgress();
        if (cp) {
            cp.markComponentComplete(moduleId, component, metadata);
        } else {
            const all = getAll();
            if (!all[moduleId]) {
                all[moduleId] = {};
            }
            if (metadata && typeof metadata === 'object') {
                all[moduleId][component] = metadata;
            } else {
                all[moduleId][component] = true;
            }
            all[moduleId].lastUpdated = Date.now();
            saveAll(all);
        }
        console.log(`PYEProgress: ${moduleId}/${component} marked complete`);
    }

    /**
     * Mark an immersive module as complete (all sections done)
     */
    function markModuleComplete(moduleId) {
        // Record content start time for time-on-task analytics
        try {
            const startKey = 'hexworth_start_times';
            const starts = JSON.parse(localStorage.getItem(startKey) || '{}');
            const contentKey = 'pye-' + moduleId;
            if (!starts[contentKey]) {
                starts[contentKey] = Date.now();
                localStorage.setItem(startKey, JSON.stringify(starts));
            }
        } catch(e) { /* non-critical */ }

        markComplete(moduleId, 'presentation');
        markComplete(moduleId, 'lab');
    }

    /**
     * Mark quiz as passed
     */
    function markQuizPassed(moduleId, score) {
        if (score !== undefined && score !== null) {
            markComplete(moduleId, 'quiz', { passed: true, score: score });
        } else {
            markComplete(moduleId, 'quiz');
        }
    }

    /**
     * Get completion status for a module
     * @returns {string} 'not-started', 'opened', 'in-progress', 'complete'
     */
    function getStatus(moduleId) {
        const progress = getModule(moduleId);
        const keys = Object.keys(progress).filter(k => k !== 'lastUpdated');

        if (keys.length === 0) {
            return 'not-started';
        }

        // Special modules complete with any 1 component
        if (SPECIAL_MODULES.has(moduleId)) {
            const anyComplete = COMPONENTS.some(c => _isComplete(progress[c]));
            return anyComplete ? 'complete' : 'opened';
        }

        const completed = COMPONENTS.filter(c => _isComplete(progress[c])).length;

        if (completed >= 3) {
            return 'complete';
        } else if (completed >= 1) {
            return 'in-progress';
        }

        return 'opened';
    }

    /**
     * Get completion percentage for a module
     */
    function getPercentage(moduleId) {
        const progress = getModule(moduleId);
        const completed = COMPONENTS.filter(c => _isComplete(progress[c])).length;
        return Math.round((completed / COMPONENTS.length) * 100);
    }

    /**
     * Get detailed status for all modules
     */
    function getAllStatus() {
        const result = {};
        MODULES.forEach(m => {
            result[m] = {
                status: getStatus(m),
                percentage: getPercentage(m),
                ...getModule(m)
            };
        });
        return result;
    }

    /**
     * Get overall course progress
     */
    function getCourseProgress() {
        const all = getAll();
        let totalComponents = 0;
        let completedComponents = 0;

        MODULES.forEach(m => {
            if (SPECIAL_MODULES.has(m)) {
                totalComponents += 1;
                const anyDone = COMPONENTS.some(c => _isComplete(all[m]?.[c]));
                if (all[m]?.complete || anyDone) completedComponents += 1;
            } else {
                totalComponents += COMPONENTS.length;
                COMPONENTS.forEach(c => {
                    if (_isComplete(all[m]?.[c])) completedComponents++;
                });
            }
        });

        return {
            completed: completedComponents,
            total: totalComponents,
            percentage: totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0
        };
    }

    /**
     * Check if a chapter is unlocked (previous chapter complete or first chapter)
     */
    function isUnlocked(moduleId) {
        const idx = MODULES.indexOf(moduleId);
        if (idx <= 0) return true; // First module always unlocked

        // Midterm requires ch01-ch05 complete
        if (moduleId === 'midterm') {
            return ['ch01','ch02','ch03','ch04','ch05'].every(m => getStatus(m) === 'complete');
        }
        // ch06 requires midterm complete
        if (moduleId === 'ch06') {
            return getStatus('midterm') === 'complete';
        }
        // Capstone requires ch06-ch10 complete
        if (moduleId === 'capstone') {
            return ['ch06','ch07','ch08','ch09','ch10'].every(m => getStatus(m) === 'complete');
        }

        const prevModule = MODULES[idx - 1];
        return getStatus(prevModule) === 'complete';
    }

    /**
     * Reset all progress (with confirmation)
     */
    function reset() {
        if (confirm('Reset all Python Engineering course progress? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('pye-progress-updated', { detail: {} }));
            console.log('PYEProgress: All progress reset');
            return true;
        }
        return false;
    }

    /**
     * Debug: Log current progress
     */
    function debug() {
        console.table(getAllStatus());
    }

    // Public API
    return {
        MODULES,
        COMPONENTS,
        getAll,
        getModule,
        getStatus,
        getPercentage,
        getAllStatus,
        getCourseProgress,
        markComplete,
        markModuleComplete,
        markQuizPassed,
        isUnlocked,
        reset,
        debug
    };
})();

window.PYEProgress = PYEProgress;
