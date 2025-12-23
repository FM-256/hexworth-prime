/**
 * AchievementSystem.js - Achievement/Badge System for Hexworth Prime
 *
 * Manages all achievements including:
 * - Achievement definitions with icons, descriptions, points
 * - Unlock conditions and checking
 * - Notification display when achievements are earned
 * - Achievement gallery for viewing earned badges
 */

class AchievementSystem {
    static STORAGE_KEY = 'hexworth_achievements';

    // All available achievements
    static ACHIEVEMENTS = {
        // === GETTING STARTED ===
        first_login: {
            id: 'first_login',
            name: 'First Steps',
            description: 'Begin your journey at Hexworth Prime',
            icon: '👣',
            category: 'milestone',
            points: 10,
            secret: false
        },
        sorted: {
            id: 'sorted',
            name: 'Sorted!',
            description: 'Complete the house sorting ceremony',
            icon: '🎓',
            category: 'milestone',
            points: 25,
            secret: false
        },
        first_module: {
            id: 'first_module',
            name: 'Getting Started',
            description: 'Complete your first module',
            icon: '🌟',
            category: 'milestone',
            points: 50,
            secret: false
        },

        // === QUIZ ACHIEVEMENTS ===
        first_quiz: {
            id: 'first_quiz',
            name: 'Quiz Taker',
            description: 'Pass your first quiz',
            icon: '📝',
            category: 'quiz',
            points: 50,
            secret: false
        },
        perfect_score: {
            id: 'perfect_score',
            name: 'Perfectionist',
            description: 'Score 100% on any quiz',
            icon: '💯',
            category: 'quiz',
            points: 100,
            secret: false
        },
        quiz_master_10: {
            id: 'quiz_master_10',
            name: 'Quiz Apprentice',
            description: 'Pass 10 quizzes',
            icon: '📚',
            category: 'quiz',
            points: 150,
            secret: false
        },
        quiz_master_25: {
            id: 'quiz_master_25',
            name: 'Quiz Master',
            description: 'Pass 25 quizzes',
            icon: '🏆',
            category: 'quiz',
            points: 300,
            secret: false
        },
        persistence: {
            id: 'persistence',
            name: 'Persistent',
            description: 'Pass a quiz after 3 or more attempts',
            icon: '💪',
            category: 'quiz',
            points: 75,
            secret: false
        },
        speed_demon: {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Complete a timed quiz with 50%+ time remaining',
            icon: '⚡',
            category: 'quiz',
            points: 100,
            secret: false
        },

        // === HOUSE-SPECIFIC ACHIEVEMENTS ===
        // Shield House
        'shield-cia-master': {
            id: 'shield-cia-master',
            name: 'CIA Triad Master',
            description: 'Master the fundamentals of information security',
            icon: '🛡️',
            category: 'shield',
            points: 100,
            secret: false
        },
        shield_apprentice: {
            id: 'shield_apprentice',
            name: 'Shield Apprentice',
            description: 'Complete 5 Shield House modules',
            icon: '🛡️',
            category: 'shield',
            points: 150,
            secret: false
        },
        shield_master: {
            id: 'shield_master',
            name: 'Shield Master',
            description: 'Complete all Shield House core modules',
            icon: '⚔️',
            category: 'shield',
            points: 500,
            secret: false
        },

        // Web House
        web_apprentice: {
            id: 'web_apprentice',
            name: 'Network Novice',
            description: 'Complete 5 Web House modules',
            icon: '🌐',
            category: 'web',
            points: 150,
            secret: false
        },
        web_master: {
            id: 'web_master',
            name: 'Network Master',
            description: 'Complete all Web House core modules',
            icon: '🕸️',
            category: 'web',
            points: 500,
            secret: false
        },
        subnetting_wizard: {
            id: 'subnetting_wizard',
            name: 'Subnetting Wizard',
            description: 'Score 100% on the subnetting quiz',
            icon: '🧮',
            category: 'web',
            points: 200,
            secret: false
        },

        // Forge House
        forge_apprentice: {
            id: 'forge_apprentice',
            name: 'Forge Apprentice',
            description: 'Complete 5 Forge House modules',
            icon: '🔨',
            category: 'forge',
            points: 150,
            secret: false
        },
        forge_master: {
            id: 'forge_master',
            name: 'Master Smith',
            description: 'Complete all Forge House core modules',
            icon: '⚒️',
            category: 'forge',
            points: 500,
            secret: false
        },

        // Script House
        script_apprentice: {
            id: 'script_apprentice',
            name: 'Script Kiddie',
            description: 'Complete 5 Script House modules',
            icon: '📜',
            category: 'script',
            points: 150,
            secret: false
        },
        script_master: {
            id: 'script_master',
            name: 'Script Sorcerer',
            description: 'Complete all Script House core modules',
            icon: '🧙',
            category: 'script',
            points: 500,
            secret: false
        },

        // Cloud House
        cloud_apprentice: {
            id: 'cloud_apprentice',
            name: 'Cloud Climber',
            description: 'Complete 5 Cloud House modules',
            icon: '☁️',
            category: 'cloud',
            points: 150,
            secret: false
        },
        cloud_master: {
            id: 'cloud_master',
            name: 'Cloud Architect',
            description: 'Complete all Cloud House core modules',
            icon: '🏔️',
            category: 'cloud',
            points: 500,
            secret: false
        },

        // Code House
        code_apprentice: {
            id: 'code_apprentice',
            name: 'Code Cadet',
            description: 'Complete 5 Code House modules',
            icon: '💻',
            category: 'code',
            points: 150,
            secret: false
        },
        code_master: {
            id: 'code_master',
            name: 'DevOps Champion',
            description: 'Complete all Code House core modules',
            icon: '🚀',
            category: 'code',
            points: 500,
            secret: false
        },

        // Key House
        key_apprentice: {
            id: 'key_apprentice',
            name: 'Crypto Curious',
            description: 'Complete 5 Key House modules',
            icon: '🔑',
            category: 'key',
            points: 150,
            secret: false
        },
        key_master: {
            id: 'key_master',
            name: 'Cryptographer',
            description: 'Complete all Key House core modules',
            icon: '🔐',
            category: 'key',
            points: 500,
            secret: false
        },

        // Eye House
        eye_apprentice: {
            id: 'eye_apprentice',
            name: 'Watchful Eye',
            description: 'Complete 5 Eye House modules',
            icon: '👁️',
            category: 'eye',
            points: 150,
            secret: false
        },
        eye_master: {
            id: 'eye_master',
            name: 'All-Seeing',
            description: 'Complete all Eye House core modules',
            icon: '🔮',
            category: 'eye',
            points: 500,
            secret: false
        },

        // === LEVEL ACHIEVEMENTS ===
        level_5: {
            id: 'level_5',
            name: 'Rising Star',
            description: 'Reach Level 5',
            icon: '⭐',
            category: 'level',
            points: 100,
            secret: false
        },
        level_10: {
            id: 'level_10',
            name: 'Seasoned Learner',
            description: 'Reach Level 10',
            icon: '🌟',
            category: 'level',
            points: 250,
            secret: false
        },
        level_15: {
            id: 'level_15',
            name: 'Hexworth Master',
            description: 'Reach Level 15 (Max Level)',
            icon: '👑',
            category: 'level',
            points: 500,
            secret: false
        },

        // === SPECIAL/SECRET ACHIEVEMENTS ===
        night_owl: {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Complete a module between midnight and 4 AM',
            icon: '🦉',
            category: 'special',
            points: 50,
            secret: true
        },
        early_bird: {
            id: 'early_bird',
            name: 'Early Bird',
            description: 'Complete a module between 5 AM and 7 AM',
            icon: '🐦',
            category: 'special',
            points: 50,
            secret: true
        },
        weekend_warrior: {
            id: 'weekend_warrior',
            name: 'Weekend Warrior',
            description: 'Study on both Saturday and Sunday',
            icon: '⚔️',
            category: 'special',
            points: 75,
            secret: true
        },
        streak_7: {
            id: 'streak_7',
            name: 'Week Streak',
            description: 'Study for 7 consecutive days',
            icon: '🔥',
            category: 'special',
            points: 150,
            secret: false
        },
        multi_house: {
            id: 'multi_house',
            name: 'Renaissance Learner',
            description: 'Complete modules in all 8 houses',
            icon: '🎭',
            category: 'special',
            points: 200,
            secret: false
        },
        dark_arts_gate1: {
            id: 'dark_arts_gate1',
            name: 'Gate Keeper',
            description: 'Open the first gate to the Dark Arts',
            icon: '🚪',
            category: 'dark_arts',
            points: 100,
            secret: true
        },
        dark_arts_master: {
            id: 'dark_arts_master',
            name: 'Dark Arts Master',
            description: 'Complete all five gates',
            icon: '💀',
            category: 'dark_arts',
            points: 500,
            secret: true
        },

        // === EXPLORER ACHIEVEMENTS ===
        explorer: {
            id: 'explorer',
            name: 'Explorer',
            description: 'Visit 50 different pages',
            icon: '🗺️',
            category: 'explorer',
            points: 100,
            secret: false
        },
        lab_rat: {
            id: 'lab_rat',
            name: 'Lab Rat',
            description: 'Complete 10 hands-on labs',
            icon: '🔬',
            category: 'explorer',
            points: 200,
            secret: false
        }
    };

    /**
     * Get all unlocked achievements
     */
    static getUnlockedAchievements() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.warn('AchievementSystem: Error loading achievements', e);
        }
        return [];
    }

    /**
     * Check if an achievement is unlocked
     */
    static isUnlocked(achievementId) {
        const unlocked = this.getUnlockedAchievements();
        return unlocked.some(a => a.id === achievementId);
    }

    /**
     * Unlock an achievement
     */
    static unlock(achievementId) {
        if (this.isUnlocked(achievementId)) {
            return false; // Already unlocked
        }

        const achievement = this.ACHIEVEMENTS[achievementId];
        if (!achievement) {
            console.warn(`Unknown achievement: ${achievementId}`);
            return false;
        }

        const unlocked = this.getUnlockedAchievements();
        const unlockedAchievement = {
            ...achievement,
            unlockedAt: Date.now()
        };

        unlocked.push(unlockedAchievement);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unlocked));

        // Show notification
        this.showAchievementNotification(achievement);

        // Dispatch event
        window.dispatchEvent(new CustomEvent('hexworth:achievementUnlocked', {
            detail: { achievement: unlockedAchievement }
        }));

        // Award bonus XP through ProgressManager
        if (typeof ProgressManager !== 'undefined') {
            const progress = ProgressManager.getProgress();
            progress.xp += ProgressManager.XP_REWARDS.ACHIEVEMENT_UNLOCK;
            ProgressManager.saveProgress(progress);
        }

        return true;
    }

    /**
     * Check progress-based achievements
     */
    static checkProgressAchievements(progress, context = {}) {
        const newAchievements = [];

        // First module achievement
        if (progress.completedModules.length === 1) {
            if (this.unlock('first_module')) {
                newAchievements.push(this.ACHIEVEMENTS.first_module);
            }
        }

        // Level achievements
        if (progress.level >= 5) {
            if (this.unlock('level_5')) newAchievements.push(this.ACHIEVEMENTS.level_5);
        }
        if (progress.level >= 10) {
            if (this.unlock('level_10')) newAchievements.push(this.ACHIEVEMENTS.level_10);
        }
        if (progress.level >= 15) {
            if (this.unlock('level_15')) newAchievements.push(this.ACHIEVEMENTS.level_15);
        }

        // House apprentice achievements (5 modules per house)
        Object.entries(progress.houses).forEach(([houseId, house]) => {
            if (house.modulesCompleted.length >= 5) {
                const apprenticeId = `${houseId}_apprentice`;
                if (this.ACHIEVEMENTS[apprenticeId] && this.unlock(apprenticeId)) {
                    newAchievements.push(this.ACHIEVEMENTS[apprenticeId]);
                }
            }
        });

        // Multi-house achievement
        const housesWithProgress = Object.values(progress.houses)
            .filter(h => h.modulesCompleted.length > 0).length;
        if (housesWithProgress === 8) {
            if (this.unlock('multi_house')) {
                newAchievements.push(this.ACHIEVEMENTS.multi_house);
            }
        }

        // Lab rat achievement
        if (progress.labsCompleted.length >= 10) {
            if (this.unlock('lab_rat')) {
                newAchievements.push(this.ACHIEVEMENTS.lab_rat);
            }
        }

        // Time-based achievements
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 4) {
            if (this.unlock('night_owl')) {
                newAchievements.push(this.ACHIEVEMENTS.night_owl);
            }
        }
        if (hour >= 5 && hour < 7) {
            if (this.unlock('early_bird')) {
                newAchievements.push(this.ACHIEVEMENTS.early_bird);
            }
        }

        return newAchievements;
    }

    /**
     * Show achievement notification
     */
    static showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'hexworth-achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-label">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-points">+${achievement.points} XP</div>
                </div>
            </div>
        `;

        this.ensureNotificationStyles();
        document.body.appendChild(notification);

        // Sound effect (if available)
        this.playAchievementSound();

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove after animation
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    /**
     * Play achievement sound
     */
    static playAchievementSound() {
        try {
            // Try to play a simple achievement sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Audio not supported or blocked - silent fail
        }
    }

    /**
     * Ensure notification styles are added
     */
    static ensureNotificationStyles() {
        if (document.getElementById('hexworth-achievement-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'hexworth-achievement-styles';
        styles.textContent = `
            .hexworth-achievement-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-120%);
                background: linear-gradient(135deg, rgba(30, 20, 50, 0.98), rgba(50, 30, 70, 0.98));
                border: 2px solid #fbbf24;
                border-radius: 16px;
                padding: 20px 24px;
                min-width: 320px;
                max-width: 420px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
                            0 0 30px rgba(251, 191, 36, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                z-index: 10001;
                transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .hexworth-achievement-notification.show {
                transform: translateX(-50%) translateY(0);
            }

            .achievement-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .achievement-icon {
                font-size: 3rem;
                line-height: 1;
                filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
                animation: achievementPulse 1s ease-in-out infinite;
            }

            @keyframes achievementPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .achievement-info {
                flex: 1;
            }

            .achievement-label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #fbbf24;
                margin-bottom: 4px;
            }

            .achievement-name {
                font-size: 1.25rem;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 4px;
            }

            .achievement-desc {
                font-size: 0.875rem;
                color: #a0a0b0;
                margin-bottom: 8px;
            }

            .achievement-points {
                font-size: 0.875rem;
                font-weight: 600;
                color: #22c55e;
            }

            /* Shimmer effect */
            .hexworth-achievement-notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.1),
                    transparent
                );
                animation: shimmer 2s infinite;
                border-radius: 16px;
            }

            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Get achievement gallery data
     */
    static getGalleryData() {
        const unlocked = this.getUnlockedAchievements();
        const unlockedIds = new Set(unlocked.map(a => a.id));

        const categories = {
            milestone: { name: 'Milestones', achievements: [] },
            quiz: { name: 'Quiz Master', achievements: [] },
            level: { name: 'Leveling Up', achievements: [] },
            explorer: { name: 'Explorer', achievements: [] },
            special: { name: 'Special', achievements: [] },
            dark_arts: { name: 'Dark Arts', achievements: [] }
        };

        // Add house categories
        Object.keys(ProgressManager.HOUSES).forEach(houseId => {
            categories[houseId] = {
                name: ProgressManager.HOUSES[houseId].name,
                achievements: []
            };
        });

        // Sort achievements into categories
        Object.values(this.ACHIEVEMENTS).forEach(achievement => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const unlockedData = unlocked.find(a => a.id === achievement.id);

            const categoryId = categories[achievement.category] ? achievement.category : 'special';

            // Hide secret achievements that aren't unlocked
            if (achievement.secret && !isUnlocked) {
                categories[categoryId].achievements.push({
                    ...achievement,
                    name: '???',
                    description: 'Secret achievement',
                    icon: '❓',
                    locked: true
                });
            } else {
                categories[categoryId].achievements.push({
                    ...achievement,
                    locked: !isUnlocked,
                    unlockedAt: unlockedData?.unlockedAt || null
                });
            }
        });

        return categories;
    }

    /**
     * Get total achievement points earned
     */
    static getTotalPoints() {
        const unlocked = this.getUnlockedAchievements();
        return unlocked.reduce((sum, a) => sum + (a.points || 0), 0);
    }

    /**
     * Get achievement progress summary
     */
    static getProgressSummary() {
        const unlocked = this.getUnlockedAchievements();
        const total = Object.keys(this.ACHIEVEMENTS).length;
        const nonSecret = Object.values(this.ACHIEVEMENTS).filter(a => !a.secret).length;
        const unlockedNonSecret = unlocked.filter(a => !this.ACHIEVEMENTS[a.id]?.secret).length;

        return {
            unlocked: unlocked.length,
            total: total,
            percentage: Math.round((unlocked.length / total) * 100),
            displayProgress: `${unlockedNonSecret}/${nonSecret}`, // Don't reveal secret count
            points: this.getTotalPoints()
        };
    }
}

// Make globally available
window.AchievementSystem = AchievementSystem;
