/**
 * Python Hub Progress Tracker
 * Tracks module completion state across presentations and labs,
 * plus standalone labs, quizzes, and tools
 * Delegates to CourseProgress when available for event emission + Layer 1→2 bridge
 */

const PYHProgress = (function() {
    const STORAGE_KEY = 'pyh-hub-progress';

    // Hub-native module IDs (T2, T4, T5 only — no cross-refs)
    const MODULES = [
        // T2: Standard Library
        'stdlib-01', 'stdlib-02', 'stdlib-03', 'stdlib-04',
        'stdlib-05', 'stdlib-06', 'stdlib-07', 'stdlib-08',
        // T4: Graphics & Games
        'graphics-01', 'graphics-02', 'graphics-03', 'graphics-04',
        'graphics-05', 'graphics-06', 'graphics-07', 'graphics-08',
        // T5: Projects
        'project-01', 'project-02', 'project-03',
        'project-04', 'project-05', 'project-06'
    ];

    // Component types per module (presentation + lab, no quiz)
    const COMPONENTS = ['presentation', 'lab'];

    // Lazy-init CourseProgress delegation
    let _cp = null;
    function _getCourseProgress() {
        if (!_cp && typeof CourseProgress !== 'undefined') {
            _cp = CourseProgress.create('pyh', {
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
            console.error('PYHProgress: Error reading progress', e);
            return {};
        }
    }

    /**
     * Save all progress data
     */
    function saveAll(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('pyh-progress-updated', { detail: data }));
        } catch (e) {
            console.error('PYHProgress: Error saving progress', e);
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
     * @param {string} moduleId - e.g., 'stdlib-01', 'graphics-03'
     * @param {string} component - 'presentation', 'lab'
     * @param {object} [metadata] - optional metadata
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
        console.log('PYHProgress: ' + moduleId + '/' + component + ' marked complete');
    }

    /**
     * Mark an entire module as complete (presentation + lab done)
     * Records start time for analytics, bridges to ModuleProgress
     */
    function markModuleComplete(moduleId) {
        // Record content start time for time-on-task analytics
        try {
            const startKey = 'hexworth_start_times';
            const starts = JSON.parse(localStorage.getItem(startKey) || '{}');
            const contentKey = 'pyh-' + moduleId;
            if (!starts[contentKey]) {
                starts[contentKey] = Date.now();
                localStorage.setItem(startKey, JSON.stringify(starts));
            }
        } catch(e) { /* non-critical */ }

        markComplete(moduleId, 'presentation');
        markComplete(moduleId, 'lab');

        // Bridge to ModuleProgress
        try {
            if (typeof ModuleProgress !== 'undefined') {
                ModuleProgress.complete('code', 'pyh-' + moduleId);
            }
        } catch(e) { /* non-critical */ }
    }

    /**
     * Mark a standalone lab as complete
     * @param {string} labId - e.g., 'lab-stdlib-01', 'lab-graphics-01'
     */
    function markLabComplete(labId) {
        const all = getAll();
        if (!all.labs) all.labs = {};
        all.labs[labId] = { completed: true, timestamp: Date.now() };
        saveAll(all);
        console.log('PYHProgress: lab/' + labId + ' completed');
    }

    /**
     * Check if a standalone lab is complete
     * @param {string} labId
     * @returns {boolean}
     */
    function isLabComplete(labId) {
        const all = getAll();
        return all.labs?.[labId]?.completed === true;
    }

    /**
     * Mark a standalone quiz as complete
     * @param {string} quizId
     * @param {number} [score]
     */
    function markQuizComplete(quizId, score) {
        const all = getAll();
        if (!all.quizzes) all.quizzes = {};
        all.quizzes[quizId] = { passed: true, score: score || null, timestamp: Date.now() };
        saveAll(all);
        console.log('PYHProgress: quiz/' + quizId + ' passed');
    }

    /**
     * Check if a standalone quiz is complete
     * @param {string} quizId
     * @returns {boolean}
     */
    function isQuizComplete(quizId) {
        const all = getAll();
        return all.quizzes?.[quizId]?.passed === true;
    }

    /**
     * Mark a tool as viewed
     * @param {string} toolId
     */
    function markToolViewed(toolId) {
        const all = getAll();
        if (!all.tools) all.tools = {};
        all.tools[toolId] = { viewed: true, timestamp: Date.now() };
        saveAll(all);
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

        const completed = COMPONENTS.filter(c => _isComplete(progress[c])).length;

        if (completed >= COMPONENTS.length) {
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
     * Get overall course progress (modules only)
     */
    function getCourseProgress() {
        const all = getAll();
        let totalComponents = 0;
        let completedComponents = 0;

        MODULES.forEach(m => {
            totalComponents += COMPONENTS.length;
            COMPONENTS.forEach(c => {
                if (_isComplete(all[m]?.[c])) completedComponents++;
            });
        });

        return {
            completed: completedComponents,
            total: totalComponents,
            percentage: totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0
        };
    }

    /**
     * Get overall hub progress combining modules, labs, quizzes, tools
     */
    function getHubProgress() {
        const all = getAll();
        let modulesComplete = 0;
        MODULES.forEach(m => {
            if (getStatus(m) === 'complete') modulesComplete++;
        });
        const labsComplete = Object.values(all.labs || {}).filter(l => l.completed).length;
        const quizzesComplete = Object.values(all.quizzes || {}).filter(q => q.passed).length;
        const toolsViewed = Object.values(all.tools || {}).filter(t => t.viewed).length;

        const total = MODULES.length + 16 + 6 + 2; // 22 modules + 16 labs + 6 quizzes + 2 tools
        const done = modulesComplete + labsComplete + quizzesComplete + toolsViewed;

        return {
            modules: { completed: modulesComplete, total: MODULES.length },
            labs: { completed: labsComplete, total: 16 },
            quizzes: { completed: quizzesComplete, total: 6 },
            tools: { completed: toolsViewed, total: 2 },
            overall: { completed: done, total: total, percentage: total > 0 ? Math.round((done / total) * 100) : 0 }
        };
    }

    /**
     * Reset all progress (with confirmation)
     */
    function reset() {
        if (confirm('Reset all Python Hub progress? This cannot be undone.')) {
            localStorage.removeItem(STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('pyh-progress-updated', { detail: {} }));
            console.log('PYHProgress: All progress reset');
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
        getHubProgress,
        markComplete,
        markModuleComplete,
        markLabComplete,
        isLabComplete,
        markQuizComplete,
        isQuizComplete,
        markToolViewed,
        reset,
        debug
    };
})();

window.PYHProgress = PYHProgress;
