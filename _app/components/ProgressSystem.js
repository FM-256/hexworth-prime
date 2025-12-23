/**
 * ProgressSystem.js - Centralized loader for all progress-related components
 *
 * Include this single file to get the full progress system:
 * - ProgressManager (XP, levels, module tracking)
 * - AchievementSystem (badges, achievements)
 * - LearningPaths (module sequences, prerequisites)
 * - SkillTreeData (divergent path definitions)
 *
 * Usage: Add this script to any page that needs progress tracking
 * <script src="../../../components/ProgressSystem.js"></script>
 */

(function() {
    'use strict';

    // Determine base path from current script location
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const scriptPath = currentScript.src;
    const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);

    // Components to load in order (some may depend on others)
    const components = [
        'SkillTreeData.js',
        'LearningPaths.js',
        'AchievementSystem.js',
        'ProgressManager.js'
    ];

    // Track loaded components
    let loadedCount = 0;
    const totalComponents = components.length;

    // Load each component
    function loadComponent(filename) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = basePath + filename;
            script.async = false; // Maintain order
            script.onload = () => {
                loadedCount++;
                resolve();
            };
            script.onerror = () => {
                console.warn(`ProgressSystem: Failed to load ${filename}`);
                resolve(); // Continue anyway
            };
            document.head.appendChild(script);
        });
    }

    // Load all components in sequence
    async function initProgressSystem() {
        for (const component of components) {
            await loadComponent(component);
        }

        // Dispatch event when all components are loaded
        window.dispatchEvent(new CustomEvent('hexworth:progressSystemReady', {
            detail: { loadedCount, totalComponents }
        }));

        // Initialize first-time user if needed
        if (typeof ProgressManager !== 'undefined') {
            const progress = ProgressManager.getProgress();
            if (!progress.createdAt || Date.now() - progress.createdAt < 1000) {
                // New user - trigger first login achievement
                if (typeof AchievementSystem !== 'undefined') {
                    AchievementSystem.unlock('first_login');
                }
            }
        }

        console.log('ProgressSystem: All components loaded');
    }

    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProgressSystem);
    } else {
        initProgressSystem();
    }
})();
