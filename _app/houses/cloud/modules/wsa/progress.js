/**
 * WSA Course Progress Tracker
 * Tracks module completion state across presentations, labs, and quizzes
 * Delegates to CourseProgress when available for event emission + Layer 1→2 bridge
 */

const WSAProgress = (function() {
    const STORAGE_KEY = 'wsa-course-progress';

    // Module IDs
    const MODULES = [
        'm01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10',
        'm11', 'm12', 'm13', 'm14', 'm15', 'm16', 'm17', 'm18', 'm19',
        'midterm', 'gauntlet', 'gauntlet-advanced', 'capstone'
    ];

    // Special modules that count as complete with ANY single component done
    // (unlike regular modules which require all 4 components)
    const SPECIAL_MODULES = new Set(['midterm', 'capstone', 'gauntlet', 'gauntlet-advanced']);

    // Component types
    const COMPONENTS = ['presentation', 'guiLab', 'psLab', 'quiz'];

    // Lazy-init CourseProgress delegation
    let _cp = null;
    function _getCourseProgress() {
        if (!_cp && typeof CourseProgress !== 'undefined') {
            _cp = CourseProgress.create('wsa', {
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
            console.error('WSAProgress: Error reading progress', e);
            return {};
        }
    }

    /**
     * Save all progress data
     */
    function saveAll(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            // Dispatch event for real-time updates
            window.dispatchEvent(new CustomEvent('wsa-progress-updated', { detail: data }));
        } catch (e) {
            console.error('WSAProgress: Error saving progress', e);
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
     * Handles both true and metadata objects like { passed: true, score: 80 }
     */
    function _isComplete(val) {
        return val === true || (typeof val === 'object' && val !== null);
    }

    /**
     * Mark a component as complete
     * @param {string} moduleId - e.g., 'm01', 'm02'
     * @param {string} component - 'presentation', 'guiLab', 'psLab', 'quiz'
     * @param {object} [metadata] - optional metadata to store (e.g., { passed: true, score: 80 })
     */
    function markComplete(moduleId, component, metadata) {
        const cp = _getCourseProgress();
        if (cp) {
            cp.markComponentComplete(moduleId, component, metadata);
        } else {
            // Fallback: direct localStorage (when CourseProgress.js not loaded)
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
        console.log(`WSAProgress: ${moduleId}/${component} marked complete`);
    }

    /**
     * Mark presentation as viewed (called when presentation page loads)
     */
    function markPresentationViewed(moduleId) {
        // Record content start time for time-on-task analytics
        try {
            const startKey = 'hexworth_start_times';
            const starts = JSON.parse(localStorage.getItem(startKey) || '{}');
            const contentKey = 'wsa-' + moduleId;
            if (!starts[contentKey]) {
                starts[contentKey] = Date.now();
                localStorage.setItem(startKey, JSON.stringify(starts));
            }
        } catch(e) { /* non-critical */ }

        markComplete(moduleId, 'presentation');
    }

    /**
     * Mark GUI lab as complete
     */
    function markGuiLabComplete(moduleId) {
        markComplete(moduleId, 'guiLab');
    }

    /**
     * Mark PowerShell lab as complete
     */
    function markPsLabComplete(moduleId) {
        markComplete(moduleId, 'psLab');
    }

    /**
     * Mark quiz as passed
     * @param {string} moduleId - e.g., 'm01'
     * @param {number} [score] - quiz score percentage (e.g., 80)
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

        // Special modules (midterm, capstone, gauntlet-advanced) complete with any 1 component
        if (SPECIAL_MODULES.has(moduleId)) {
            const anyComplete = COMPONENTS.some(c => _isComplete(progress[c]));
            return anyComplete ? 'complete' : 'opened';
        }

        const completed = COMPONENTS.filter(c => _isComplete(progress[c])).length;

        if (completed >= 4) {
            return 'complete';
        } else if (completed >= 1) {
            return 'in-progress';
        } else if (progress.presentation) {
            return 'opened';
        }

        return 'opened';
    }

    /**
     * Get completion percentage for a module
     */
    function getPercentage(moduleId) {
        const progress = getModule(moduleId);
        const completed = COMPONENTS.filter(c => _isComplete(progress[c])).length;
        return Math.round((completed / 4) * 100);
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
                // Special modules (midterm, capstone, gauntlet-advanced) count as 1 component
                totalComponents += 1;
                const anyDone = COMPONENTS.some(c => _isComplete(all[m]?.[c]));
                if (all[m]?.complete || anyDone) completedComponents += 1;
            } else {
                totalComponents += 4;
                COMPONENTS.forEach(c => {
                    if (all[m]?.[c]) completedComponents++;
                });
            }
        });

        return {
            completed: completedComponents,
            total: totalComponents,
            percentage: Math.round((completedComponents / totalComponents) * 100)
        };
    }

    /**
     * Reset all progress (with confirmation)
     */
    function reset() {
        if (confirm('Reset all WSA course progress? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('wsa-progress-updated', { detail: {} }));
            console.log('WSAProgress: All progress reset');
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
        getAll,
        getModule,
        getStatus,
        getPercentage,
        getAllStatus,
        getCourseProgress,
        markComplete,
        markPresentationViewed,
        markGuiLabComplete,
        markPsLabComplete,
        markQuizPassed,
        reset,
        debug
    };
})();

// Make available globally
window.WSAProgress = WSAProgress;
