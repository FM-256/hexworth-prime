/**
 * ProgressManager.js - Central Progress Tracking System for Hexworth Prime
 *
 * Handles all learner progression:
 * - Module completions and quiz scores
 * - XP/Points system with leveling
 * - Achievement tracking
 * - Learning path progression
 * - Skill tree unlocks (divergent paths)
 *
 * Storage: localStorage with 'hexworth_' prefix
 */

class ProgressManager {
    static STORAGE_KEYS = {
        PROGRESS: 'hexworth_progress',
        ACHIEVEMENTS: 'hexworth_achievements',
        STATS: 'hexworth_stats',
        PROFILE: 'hexworth_profile',
        SKILL_TREE: 'hexworth_skill_tree'
    };

    // XP rewards for different activities
    static XP_REWARDS = {
        MODULE_COMPLETE: 100,
        QUIZ_PASS: 150,
        QUIZ_PERFECT: 300,
        FIRST_ATTEMPT_PASS: 50,  // Bonus
        ACHIEVEMENT_UNLOCK: 25,
        LAB_COMPLETE: 200,
        PRESENTATION_VIEW: 50,
        TOOL_EXPLORE: 75
    };

    // Level thresholds (XP required to reach each level)
    static LEVEL_THRESHOLDS = [
        0,      // Level 1
        500,    // Level 2
        1200,   // Level 3
        2100,   // Level 4
        3200,   // Level 5
        4500,   // Level 6
        6000,   // Level 7
        7700,   // Level 8
        9600,   // Level 9
        11700,  // Level 10
        14000,  // Level 11
        16500,  // Level 12
        19200,  // Level 13
        22100,  // Level 14
        25200,  // Level 15 (Master)
    ];

    // House definitions with colors and icons
    static HOUSES = {
        web: { name: 'Web House', icon: '🌐', color: '#3b82f6', domain: 'Networking' },
        shield: { name: 'Shield House', icon: '🛡️', color: '#a855f7', domain: 'Security' },
        forge: { name: 'Forge House', icon: '🔨', color: '#f97316', domain: 'Systems' },
        script: { name: 'Script House', icon: '📜', color: '#22c55e', domain: 'Automation' },
        cloud: { name: 'Cloud House', icon: '☁️', color: '#06b6d4', domain: 'Cloud Computing' },
        code: { name: 'Code House', icon: '💻', color: '#ec4899', domain: 'DevOps' },
        key: { name: 'Key House', icon: '🔑', color: '#eab308', domain: 'Cryptography' },
        eye: { name: 'Eye House', icon: '👁️', color: '#6366f1', domain: 'Monitoring' }
    };

    /**
     * Initialize or get user progress
     */
    static getProgress() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.PROGRESS);
            if (stored) {
                return JSON.parse(stored);
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

        // Check if already completed
        if (progress.completedModules.includes(moduleId)) {
            // Still allow re-completion for practice, but reduced/no XP
            console.log(`Module ${moduleId} already completed - practice mode`);
            // Still provide next module even in practice mode
            result.nextModule = LearningPaths.getNextModule(houseId, moduleId);
            return result;
        }

        // Mark module as completed
        progress.completedModules.push(moduleId);

        // Update house-specific progress
        if (progress.houses[houseId]) {
            const house = progress.houses[houseId];
            if (!house.modulesCompleted.includes(moduleId)) {
                house.modulesCompleted.push(moduleId);
            }
            house.lastAccessed = Date.now();

            // Update progress percentage
            const pathModules = LearningPaths.getHouseModules(houseId);
            if (pathModules && pathModules.length > 0) {
                house.progressPercent = Math.round(
                    (house.modulesCompleted.length / pathModules.length) * 100
                );
            }
        }

        // Calculate XP based on module type
        switch (moduleType) {
            case 'quiz':
                result.xpEarned = this.XP_REWARDS.QUIZ_PASS;
                if (metadata.score === 100) {
                    result.xpEarned = this.XP_REWARDS.QUIZ_PERFECT;
                }
                if (metadata.attempts === 1) {
                    result.xpEarned += this.XP_REWARDS.FIRST_ATTEMPT_PASS;
                }
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

        // Add XP and check for level up
        const oldLevel = progress.level;
        progress.xp += result.xpEarned;
        progress.level = this.calculateLevel(progress.xp);

        if (progress.level > oldLevel) {
            result.levelUp = true;
            result.newLevel = progress.level;
        }

        // Check for skill tree unlocks (divergent paths)
        result.unlocks = this.checkSkillUnlocks(progress, moduleId, houseId);

        // Determine next module in path
        result.nextModule = LearningPaths.getNextModule(houseId, moduleId);

        // Save progress
        this.saveProgress(progress);

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
     * Calculate level from XP
     */
    static calculateLevel(xp) {
        for (let i = this.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= this.LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    /**
     * Get XP required for next level
     */
    static getXPForNextLevel(currentLevel) {
        if (currentLevel >= this.LEVEL_THRESHOLDS.length) {
            return null; // Max level
        }
        return this.LEVEL_THRESHOLDS[currentLevel];
    }

    /**
     * Get current level progress (0-100%)
     */
    static getLevelProgress(xp, level) {
        const currentThreshold = this.LEVEL_THRESHOLDS[level - 1] || 0;
        const nextThreshold = this.LEVEL_THRESHOLDS[level] || this.LEVEL_THRESHOLDS[this.LEVEL_THRESHOLDS.length - 1];
        const range = nextThreshold - currentThreshold;
        const progress = xp - currentThreshold;
        return Math.min(100, Math.round((progress / range) * 100));
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
        const achievements = AchievementSystem.getUnlockedAchievements();

        return {
            xp: progress.xp,
            level: progress.level,
            levelProgress: this.getLevelProgress(progress.xp, progress.level),
            xpToNextLevel: this.getXPForNextLevel(progress.level) - progress.xp,
            totalModulesCompleted: progress.completedModules.length,
            totalQuizzesPassed: progress.quizHistory.filter(q => q.score >= 70).length,
            totalLabsCompleted: progress.labsCompleted.length,
            achievementCount: achievements.length,
            houseProgress: Object.entries(progress.houses).map(([id, house]) => ({
                id,
                ...this.HOUSES[id],
                ...house
            })),
            divergentBranches: progress.divergentBranches,
            memberSince: progress.createdAt
        };
    }

    /**
     * Get house-specific progress
     */
    static getHouseProgress(houseId) {
        const progress = this.getProgress();
        const house = progress.houses[houseId];

        if (!house) return null;

        const pathModules = LearningPaths.getHouseModules(houseId);
        const completedInPath = pathModules.filter(m =>
            house.modulesCompleted.includes(m.id)
        );

        return {
            ...this.HOUSES[houseId],
            ...house,
            totalModules: pathModules.length,
            completedCount: completedInPath.length,
            nextModule: LearningPaths.getNextIncompleteModule(houseId, house.modulesCompleted)
        };
    }

    /**
     * Show completion notification toast
     */
    static showCompletionNotification(result) {
        const toast = document.createElement('div');
        toast.className = 'hexworth-progress-toast';

        let content = `
            <div class="toast-header">
                <span class="toast-icon">✨</span>
                <span class="toast-title">Progress Updated!</span>
            </div>
            <div class="toast-body">
                <div class="xp-earned">+${result.xpEarned} XP</div>
        `;

        if (result.levelUp) {
            content += `<div class="level-up">🎉 Level Up! Now Level ${result.newLevel}</div>`;
        }

        if (result.unlocks.length > 0) {
            content += `<div class="unlocks">🔓 New content unlocked!</div>`;
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
                position: fixed;
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
}

// Make globally available
window.ProgressManager = ProgressManager;
