/**
 * CourseProgress — Generalized course progress tracker
 * Factory pattern: each course creates an instance via CourseProgress.create()
 * Manages per-course, per-module, per-component progress in localStorage
 */
const CourseProgress = (function() {
    const instances = {};

    function create(courseId, config) {
        if (instances[courseId]) return instances[courseId];

        const STORAGE_KEY = config.storageKey || `${courseId}-progress`;
        const MODULES = config.modules;
        const COMPONENTS = config.components;

        function getAll() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : {};
            } catch (e) {
                console.error(`CourseProgress[${courseId}]: Error reading progress`, e);
                return {};
            }
        }

        function saveAll(data) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                window.dispatchEvent(new CustomEvent('courseProgress:updated', {
                    detail: { courseId, data }
                }));
            } catch (e) {
                console.error(`CourseProgress[${courseId}]: Error saving progress`, e);
            }
        }

        function getModule(moduleId) {
            const all = getAll();
            return all[moduleId] || {};
        }

        function markComponentComplete(moduleId, component, metadata) {
            const all = getAll();
            if (!all[moduleId]) all[moduleId] = {};

            if (metadata && typeof metadata === 'object') {
                all[moduleId][component] = metadata;
            } else {
                all[moduleId][component] = true;
            }
            all[moduleId].lastUpdated = Date.now();
            saveAll(all);

            window.dispatchEvent(new CustomEvent('courseProgress:componentComplete', {
                detail: { courseId, moduleId, component }
            }));

            if (isModuleComplete(moduleId)) {
                window.dispatchEvent(new CustomEvent('courseProgress:moduleComplete', {
                    detail: { courseId, moduleId, components: getModule(moduleId) }
                }));
            }
        }

        function isModuleComplete(moduleId) {
            const mod = getModule(moduleId);
            return COMPONENTS.every(c => {
                const val = mod[c];
                return val === true || (typeof val === 'object' && val !== null);
            });
        }

        function getStatus(moduleId) {
            const progress = getModule(moduleId);
            const keys = Object.keys(progress).filter(k => k !== 'lastUpdated');

            if (keys.length === 0) return 'not-started';

            const completed = COMPONENTS.filter(c => {
                const val = progress[c];
                return val === true || (typeof val === 'object' && val !== null);
            }).length;

            if (completed >= COMPONENTS.length) return 'complete';
            if (completed >= 1) return 'in-progress';
            return 'not-started';
        }

        function getPercentage(moduleId) {
            const progress = getModule(moduleId);
            const completed = COMPONENTS.filter(c => {
                const val = progress[c];
                return val === true || (typeof val === 'object' && val !== null);
            }).length;
            return Math.round((completed / COMPONENTS.length) * 100);
        }

        function getCourseProgress() {
            const all = getAll();
            let totalComponents = 0;
            let completedComponents = 0;

            MODULES.forEach(m => {
                totalComponents += COMPONENTS.length;
                COMPONENTS.forEach(c => {
                    const val = all[m]?.[c];
                    if (val === true || (typeof val === 'object' && val !== null)) {
                        completedComponents++;
                    }
                });
            });

            return {
                completed: completedComponents,
                total: totalComponents,
                percentage: totalComponents > 0
                    ? Math.round((completedComponents / totalComponents) * 100)
                    : 0
            };
        }

        function reset() {
            localStorage.removeItem(STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('courseProgress:updated', {
                detail: { courseId, data: {} }
            }));
        }

        const instance = {
            courseId, STORAGE_KEY, MODULES, COMPONENTS,
            getAll, getModule, markComponentComplete,
            isModuleComplete, getStatus, getPercentage,
            getCourseProgress, reset
        };

        instances[courseId] = instance;
        return instance;
    }

    function getInstance(courseId) {
        return instances[courseId] || null;
    }

    function getAllInstances() {
        return { ...instances };
    }

    return { create, getInstance, getAllInstances };
})();

window.CourseProgress = CourseProgress;
