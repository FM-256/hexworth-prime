/**
 * AchievementManager.js - Achievement & Title System
 *
 * Tracks achievements, awards points for discovery, and builds
 * dynamic titles like "Daenerys, Mother of Dragons, Breaker of Chains"
 *
 * Categories:
 * - regular: Normal achievements, name visible when locked
 * - secret: Hidden until unlocked (shows ❓)
 * - legendary: Rare achievements with special styling
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const AchievementManager = (function() {
    'use strict';

    const STORAGE_KEY = 'hexworth_achievements';
    const POINTS_KEY = 'hexworth_discovery_points';

    // ═══════════════════════════════════════════════════════════════════
    // ACHIEVEMENT DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════

    const achievements = [
        // ─────────────────────────────────────────────────────────────
        // REGULAR ACHIEVEMENTS (visible when locked)
        // ─────────────────────────────────────────────────────────────
        {
            id: 'first_visit',
            icon: '🌟',
            name: 'First Steps',
            desc: 'Enter the academy for the first time',
            points: 5,
            category: 'regular',
            title: null
        },
        {
            id: 'sorted',
            icon: '🏠',
            name: 'Sorted',
            desc: 'Get sorted into a house',
            points: 10,
            category: 'regular',
            title: 'of House {house}'
        },
        {
            id: 'streak_3',
            icon: '🔥',
            name: 'Kindled',
            desc: 'Maintain a 3-day learning streak',
            points: 15,
            category: 'regular',
            title: null
        },
        {
            id: 'streak_7',
            icon: '⚡',
            name: 'Dedicated',
            desc: 'Maintain a 7-day learning streak',
            points: 25,
            category: 'regular',
            title: 'the Dedicated'
        },
        {
            id: 'streak_30',
            icon: '💎',
            name: 'Unstoppable',
            desc: 'Maintain a 30-day learning streak',
            points: 100,
            category: 'regular',
            title: 'the Unstoppable'
        },
        {
            id: 'first_module',
            icon: '📚',
            name: 'Scholar',
            desc: 'Complete your first module',
            points: 10,
            category: 'regular',
            title: null
        },
        {
            id: 'first_quiz',
            icon: '✅',
            name: 'Tested',
            desc: 'Pass your first quiz',
            points: 10,
            category: 'regular',
            title: null
        },
        {
            id: 'perfect_score',
            icon: '💯',
            name: 'Perfectionist',
            desc: 'Score 100% on any quiz',
            points: 25,
            category: 'regular',
            title: 'the Perfectionist'
        },
        {
            id: 'quiz_master_10',
            icon: '🎓',
            name: 'Quiz Master',
            desc: 'Pass 10 quizzes',
            points: 50,
            category: 'regular',
            title: 'Quiz Master'
        },
        {
            id: 'quiz_master_25',
            icon: '📜',
            name: 'Knowledge Seeker',
            desc: 'Pass 25 quizzes',
            points: 100,
            category: 'regular',
            title: 'Seeker of Knowledge'
        },
        {
            id: 'persistence',
            icon: '🔄',
            name: 'Persistence',
            desc: 'Pass a quiz after 3+ attempts',
            points: 20,
            category: 'regular',
            title: null
        },
        {
            id: 'speed_demon',
            icon: '⚡',
            name: 'Speed Demon',
            desc: 'Pass a timed quiz with 50%+ time remaining',
            points: 30,
            category: 'regular',
            title: 'the Swift'
        },
        {
            id: 'explorer',
            icon: '🗺️',
            name: 'Explorer',
            desc: 'Visit all houses',
            points: 20,
            category: 'regular',
            title: 'the Explorer'
        },
        {
            id: 'night_owl',
            icon: '🦉',
            name: 'Night Owl',
            desc: 'Study after midnight',
            points: 10,
            category: 'regular',
            title: null
        },
        {
            id: 'early_bird',
            icon: '🐦',
            name: 'Early Bird',
            desc: 'Study before 6 AM',
            points: 10,
            category: 'regular',
            title: null
        },
        {
            id: 'sound_master',
            icon: '🔊',
            name: 'Attuned',
            desc: 'Enable Digital Life audio',
            points: 5,
            category: 'regular',
            title: null
        },

        // ─────────────────────────────────────────────────────────────
        // DARK ARTS ACHIEVEMENTS
        // ─────────────────────────────────────────────────────────────
        {
            id: 'gate_1',
            icon: '🔓',
            name: 'Initiate',
            desc: 'Pass the first Dark Arts gate',
            points: 25,
            category: 'regular',
            title: null
        },
        {
            id: 'gate_2',
            icon: '🔐',
            name: 'Acolyte',
            desc: 'Pass the second Dark Arts gate',
            points: 30,
            category: 'regular',
            title: null
        },
        {
            id: 'gate_3',
            icon: '🗝️',
            name: 'Adept',
            desc: 'Pass the third Dark Arts gate',
            points: 35,
            category: 'regular',
            title: null
        },
        {
            id: 'gate_4',
            icon: '⚙️',
            name: 'Practitioner',
            desc: 'Pass the fourth Dark Arts gate',
            points: 40,
            category: 'regular',
            title: null
        },
        {
            id: 'gate_5',
            icon: '🏴',
            name: 'Shadow Master',
            desc: 'Complete all five Dark Arts gates',
            points: 50,
            category: 'regular',
            title: 'Master of Shadows'
        },
        {
            id: 'dark-arts-master',
            icon: '🌑',
            name: 'Dark Arts Master',
            desc: 'Pass the Dark Arts Mastery Quiz',
            points: 75,
            category: 'regular',
            title: 'Master of the Dark Arts'
        },

        // ─────────────────────────────────────────────────────────────
        // SECRET ACHIEVEMENTS (hidden until unlocked)
        // ─────────────────────────────────────────────────────────────
        {
            id: 'divergent',
            icon: '⚡',
            name: 'Divergent',
            desc: 'The algorithm cannot contain you',
            points: 100,
            category: 'secret',
            title: 'the Divergent',
            style: 'glitch'
        },
        {
            id: 'god_mode',
            icon: '👁️',
            name: 'Ascended',
            desc: 'See beyond the veil',
            points: 50,
            category: 'secret',
            title: 'the All-Seeing',
            style: 'golden'
        },
        {
            id: 'konami',
            icon: '🎮',
            name: 'Old School',
            desc: 'Some codes never die',
            points: 30,
            category: 'secret',
            title: 'of the Old Code',
            style: 'retro'
        },
        {
            id: 'storm_gates',
            icon: '⚔️',
            name: 'Gate Crasher',
            desc: 'Found the back door',
            points: 40,
            category: 'secret',
            title: 'Stormer of Gates',
            style: 'glitch'
        },
        {
            id: 'house_hopper',
            icon: '🌀',
            name: 'Boundless',
            desc: 'Walls mean nothing to you',
            points: 50,
            category: 'secret',
            title: 'the Boundless',
            style: 'glitch'
        },
        {
            id: 'secret_hunter',
            icon: '🔮',
            name: 'Secret Hunter',
            desc: 'Found 5 hidden achievements',
            points: 75,
            category: 'secret',
            title: 'Seeker of Secrets'
        },
        {
            id: 'completionist',
            icon: '👑',
            name: 'Completionist',
            desc: 'Unlock every achievement',
            points: 200,
            category: 'legendary',
            title: 'the Complete',
            style: 'legendary'
        },

        // ─────────────────────────────────────────────────────────────
        // LEGENDARY ACHIEVEMENTS (super rare)
        // ─────────────────────────────────────────────────────────────
        {
            id: 'first_blood',
            icon: '🩸',
            name: 'First Blood',
            desc: 'Among the first to discover a secret',
            points: 150,
            category: 'legendary',
            title: 'First of Their Name',
            style: 'legendary'
        },
        {
            id: 'galaxy_architect',
            icon: '🌌',
            name: 'Galaxy Architect',
            desc: 'Your learning left a permanent mark',
            points: 100,
            category: 'legendary',
            title: 'Architect of Galaxies',
            style: 'cosmic'
        },

        // ─────────────────────────────────────────────────────────────
        // CLI MASTERY ACHIEVEMENTS (House of Script)
        // ─────────────────────────────────────────────────────────────
        {
            id: 'cli_ghost',
            icon: '👻',
            name: 'CLI Ghost',
            desc: 'Complete all 30 Command Line Hacker modules',
            points: 500,
            category: 'legendary',
            title: 'the Ghost',
            style: 'legendary'
        },
        {
            id: 'cli_recruit',
            icon: '🎖️',
            name: 'CLI Recruit',
            desc: 'Complete CLH modules 001-003',
            points: 25,
            category: 'regular',
            title: null
        },
        {
            id: 'cli_analyst',
            icon: '🔍',
            name: 'CLI Analyst',
            desc: 'Complete CLH modules 004-006',
            points: 35,
            category: 'regular',
            title: null
        },
        {
            id: 'cli_operative',
            icon: '🎯',
            name: 'CLI Operative',
            desc: 'Complete CLH modules 007-009',
            points: 45,
            category: 'regular',
            title: null
        },
        {
            id: 'cli_shadow',
            icon: '🌑',
            name: 'CLI Shadow',
            desc: 'Complete CLH modules 010-012',
            points: 55,
            category: 'regular',
            title: 'the Shadow'
        },
        {
            id: 'cli_phantom',
            icon: '👤',
            name: 'CLI Phantom',
            desc: 'Complete CLH modules 013-015',
            points: 65,
            category: 'regular',
            title: 'the Phantom'
        },
        {
            id: 'cli_specter',
            icon: '🌫️',
            name: 'CLI Specter',
            desc: 'Complete CLH modules 016-022',
            points: 100,
            category: 'regular',
            title: 'the Specter'
        },
        {
            id: 'cli_wraith',
            icon: '💀',
            name: 'CLI Wraith',
            desc: 'Complete CLH modules 023-027',
            points: 150,
            category: 'regular',
            title: 'the Wraith'
        },
        {
            id: 'cli_blackout',
            icon: '⚫',
            name: 'BLACKOUT',
            desc: 'Complete OPERATION BLACKOUT - the ultimate test',
            points: 750,
            category: 'legendary',
            title: 'Shadow Operative',
            style: 'cosmic'
        },
        {
            id: 'cli_master',
            icon: '🔱',
            name: 'CLI Grandmaster',
            desc: 'Complete all 31 Command Line Hacker challenges',
            points: 1000,
            category: 'legendary',
            title: 'Grandmaster of the CLI',
            style: 'legendary'
        }
    ];

    // ═══════════════════════════════════════════════════════════════════
    // STORAGE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    function getUnlockedIds() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveUnlockedIds(ids) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
    }

    function getPoints() {
        return parseInt(localStorage.getItem(POINTS_KEY) || '0', 10);
    }

    function savePoints(points) {
        localStorage.setItem(POINTS_KEY, points.toString());
    }

    // ═══════════════════════════════════════════════════════════════════
    // UNLOCK FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    function unlock(achievementId, silent = false) {
        const unlocked = getUnlockedIds();

        // Already unlocked
        if (unlocked.includes(achievementId)) {
            return false;
        }

        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) {
            console.warn('Achievement not found:', achievementId);
            return false;
        }

        // Add to unlocked list
        unlocked.push(achievementId);
        saveUnlockedIds(unlocked);

        // Add points
        const currentPoints = getPoints();
        savePoints(currentPoints + achievement.points);

        // Check for meta-achievements
        checkMetaAchievements(unlocked);

        // Show notification unless silent
        if (!silent) {
            showUnlockNotification(achievement);
        }

        console.log(`%c🏆 Achievement Unlocked: ${achievement.name} (+${achievement.points} pts)`,
            'color: #ffd700; font-size: 14px; font-weight: bold;');

        // Record in Activity Feed
        if (typeof ActivityFeed !== 'undefined') {
            ActivityFeed.achievementUnlock(achievementId, achievement.name);
        }

        return true;
    }

    function checkMetaAchievements(unlocked) {
        // Secret Hunter: Found 5 secret achievements
        const secretCount = unlocked.filter(id => {
            const ach = achievements.find(a => a.id === id);
            return ach && ach.category === 'secret';
        }).length;

        if (secretCount >= 5 && !unlocked.includes('secret_hunter')) {
            setTimeout(() => unlock('secret_hunter'), 1500);
        }

        // Completionist: All AchievementManager achievements (except completionist itself)
        const requiredIds = achievements.filter(a => a.id !== 'completionist').map(a => a.id);
        const allUnlocked = requiredIds.every(id => unlocked.includes(id));
        if (allUnlocked && !unlocked.includes('completionist')) {
            setTimeout(() => unlock('completionist'), 2000);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // NOTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════════════

    function showUnlockNotification(achievement) {
        // Remove existing notification
        const existing = document.getElementById('achievement-notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.id = 'achievement-notification';
        notification.className = `achievement-notification ${achievement.style || ''}`;
        notification.innerHTML = `
            <div class="achievement-notif-icon">${achievement.icon}</div>
            <div class="achievement-notif-content">
                <div class="achievement-notif-label">ACHIEVEMENT UNLOCKED</div>
                <div class="achievement-notif-name">${achievement.name}</div>
                <div class="achievement-notif-points">+${achievement.points} pts</div>
            </div>
        `;

        // Add styles if not present
        if (!document.getElementById('achievement-notif-styles')) {
            const styles = document.createElement('style');
            styles.id = 'achievement-notif-styles';
            styles.textContent = `
                .achievement-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, rgba(30,30,30,0.95), rgba(20,20,20,0.98));
                    border: 2px solid #ffd700;
                    border-radius: 12px;
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 100000;
                    animation: achievementSlideIn 0.5s ease-out, achievementGlow 2s ease-in-out infinite;
                    box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
                }

                @keyframes achievementSlideIn {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes achievementGlow {
                    0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
                }

                .achievement-notif-icon {
                    font-size: 2.5rem;
                    animation: achievementBounce 0.5s ease-out 0.3s;
                }

                @keyframes achievementBounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                }

                .achievement-notif-label {
                    font-size: 0.65rem;
                    color: #ffd700;
                    letter-spacing: 0.15em;
                    margin-bottom: 2px;
                }

                .achievement-notif-name {
                    font-size: 1.1rem;
                    color: #fff;
                    font-weight: 600;
                }

                .achievement-notif-points {
                    font-size: 0.8rem;
                    color: #4ade80;
                    margin-top: 2px;
                }

                /* Glitch style for Divergent achievements */
                .achievement-notification.glitch {
                    border-color: #ff00ff;
                    animation: achievementSlideIn 0.5s ease-out, glitchNotifPulse 0.5s ease-in-out infinite;
                }

                .achievement-notification.glitch .achievement-notif-label {
                    color: #ff00ff;
                }

                @keyframes glitchNotifPulse {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(255, 0, 255, 0.3), -2px 0 0 #00ffff, 2px 0 0 #ff0000;
                    }
                    50% {
                        box-shadow: 0 0 40px rgba(255, 0, 255, 0.6), 2px 0 0 #00ffff, -2px 0 0 #ff0000;
                    }
                }

                /* Golden style for God Mode */
                .achievement-notification.golden {
                    border-color: #ffd700;
                    background: linear-gradient(135deg, rgba(50,40,0,0.95), rgba(30,25,0,0.98));
                }

                /* Retro style for Konami */
                .achievement-notification.retro {
                    border-color: #00ff00;
                    font-family: monospace;
                }

                .achievement-notification.retro .achievement-notif-label {
                    color: #00ff00;
                }

                /* Legendary style */
                .achievement-notification.legendary {
                    border: 2px solid transparent;
                    background: linear-gradient(135deg, rgba(30,30,30,0.95), rgba(20,20,20,0.98)) padding-box,
                                linear-gradient(135deg, #ffd700, #ff6b00, #ff00ff, #00ffff, #ffd700) border-box;
                    animation: achievementSlideIn 0.5s ease-out, legendaryGlow 3s ease-in-out infinite;
                }

                @keyframes legendaryGlow {
                    0%, 100% { filter: hue-rotate(0deg); }
                    50% { filter: hue-rotate(30deg); }
                }

                /* Cosmic style */
                .achievement-notification.cosmic {
                    border-color: #8b5cf6;
                    background: linear-gradient(135deg, rgba(20,10,40,0.95), rgba(10,5,30,0.98));
                }

                .achievement-notification.cosmic .achievement-notif-label {
                    color: #a78bfa;
                }

                .achievement-notification.cosmic .achievement-notif-icon {
                    animation: achievementBounce 0.5s ease-out 0.3s, cosmicRotate 10s linear infinite;
                }

                @keyframes cosmicRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'achievementSlideIn 0.3s ease-in reverse forwards';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ═══════════════════════════════════════════════════════════════════
    // TITLE BUILDER
    // ═══════════════════════════════════════════════════════════════════

    function buildTitle(username) {
        const unlocked = getUnlockedIds();
        const titleParts = [];

        // Get house for {house} substitution
        const house = localStorage.getItem('hexworth_house');
        const houseNames = {
            'shield': 'Shield',
            'web': 'Web',
            'cloud': 'Cloud',
            'forge': 'Forge',
            'script': 'Script',
            'code': 'Code',
            'key': 'Key',
            'eye': 'Eye',
            'divergent': 'The Factionless'
        };

        // Collect title fragments from unlocked achievements
        achievements.forEach(ach => {
            if (unlocked.includes(ach.id) && ach.title) {
                let title = ach.title;

                // Substitute {house}
                if (house && title.includes('{house}')) {
                    title = title.replace('{house}', houseNames[house] || house);
                }

                titleParts.push(title);
            }
        });

        // Build full title
        if (titleParts.length === 0) {
            return username || 'Student';
        }

        const name = username || 'Student';
        return `${name}, ${titleParts.join(', ')}`;
    }

    function getShortTitle(username) {
        const unlocked = getUnlockedIds();

        // Priority order for short title (pick the most prestigious)
        const priorityOrder = [
            'cli_master', 'completionist', 'cli_blackout', 'cli_ghost',
            'first_blood', 'galaxy_architect', 'divergent', 'god_mode',
            'cli_wraith', 'cli_specter', 'gate_5', 'streak_30',
            'house_hopper', 'secret_hunter', 'sorted'
        ];

        for (const id of priorityOrder) {
            if (unlocked.includes(id)) {
                const ach = achievements.find(a => a.id === id);
                if (ach && ach.title) {
                    let title = ach.title;
                    const house = localStorage.getItem('hexworth_house');
                    if (house && title.includes('{house}')) {
                        const houseNames = {
                            'shield': 'Shield', 'web': 'Web', 'cloud': 'Cloud',
                            'forge': 'Forge', 'script': 'Script', 'code': 'Code',
                            'key': 'Key', 'eye': 'Eye', 'divergent': 'The Factionless'
                        };
                        title = title.replace('{house}', houseNames[house] || house);
                    }
                    return `${username || 'Student'}, ${title}`;
                }
            }
        }

        return username || 'Student';
    }

    // ═══════════════════════════════════════════════════════════════════
    // QUERY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════

    function isUnlocked(achievementId) {
        return getUnlockedIds().includes(achievementId);
    }

    function getAchievement(achievementId) {
        return achievements.find(a => a.id === achievementId);
    }

    function getAllAchievements() {
        return achievements;
    }

    function getUnlockedAchievements() {
        const unlocked = getUnlockedIds();
        return achievements.filter(a => unlocked.includes(a.id));
    }

    function getStats() {
        const unlocked = getUnlockedIds();
        return {
            total: achievements.length,
            unlocked: unlocked.length,
            points: getPoints(),
            secretsFound: unlocked.filter(id => {
                const ach = achievements.find(a => a.id === id);
                return ach && ach.category === 'secret';
            }).length,
            legendaryFound: unlocked.filter(id => {
                const ach = achievements.find(a => a.id === id);
                return ach && ach.category === 'legendary';
            }).length
        };
    }

    // ═══════════════════════════════════════════════════════════════════
    // AUTO-CHECK ACHIEVEMENTS
    // ═══════════════════════════════════════════════════════════════════

    function checkImplicitAchievements() {
        // First visit
        if (!isUnlocked('first_visit')) {
            unlock('first_visit', true); // Silent for first visit
        }

        // Sorted
        if (localStorage.getItem('hexworth_house') && !isUnlocked('sorted')) {
            unlock('sorted');
        }

        // Divergent
        if (localStorage.getItem('hexworth_divergent') === 'true' && !isUnlocked('divergent')) {
            unlock('divergent');
        }

        // House Hopper
        if (localStorage.getItem('hexworth_house_hopper') === 'true' && !isUnlocked('house_hopper')) {
            unlock('house_hopper');
        }

        // God Mode
        if (sessionStorage.getItem('hexworth_god_mode') === 'true' && !isUnlocked('god_mode')) {
            unlock('god_mode');
        }

        // Streaks
        const streak = parseInt(localStorage.getItem('hexworth_streak') || '0', 10);
        if (streak >= 3 && !isUnlocked('streak_3')) unlock('streak_3');
        if (streak >= 7 && !isUnlocked('streak_7')) unlock('streak_7');
        if (streak >= 30 && !isUnlocked('streak_30')) unlock('streak_30');

        // Sound
        if (localStorage.getItem('hexworth_sound_enabled') === 'true' && !isUnlocked('sound_master')) {
            unlock('sound_master', true);
        }

        // Time-based
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 5 && !isUnlocked('night_owl')) {
            unlock('night_owl');
        }
        if (hour >= 4 && hour < 6 && !isUnlocked('early_bird')) {
            unlock('early_bird');
        }

        // Dark Arts gates
        for (let i = 1; i <= 5; i++) {
            if (localStorage.getItem(`gate${i}_complete`) === 'true') {
                const achId = i === 5 ? 'gate_5' : `gate_${i}`;
                if (!isUnlocked(achId)) unlock(achId);
            }
        }

        // CLI Hacker tier achievements
        checkCLHProgress();
    }

    // ═══════════════════════════════════════════════════════════════════
    // CLI HACKER PROGRESS CHECK
    // ═══════════════════════════════════════════════════════════════════

    function checkCLHProgress() {
        try {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            const scriptProgress = progress.script || {};

            // Helper to check if a module is fully complete (slides + quiz + terminal)
            function isModuleComplete(moduleNum) {
                const key = `clh-${String(moduleNum).padStart(3, '0')}`;
                const moduleData = scriptProgress[key];
                // Module is complete if it has completed: true
                return moduleData && moduleData.completed === true;
            }

            // Helper to check if a range of modules are complete
            function isRangeComplete(start, end) {
                for (let i = start; i <= end; i++) {
                    if (!isModuleComplete(i)) return false;
                }
                return true;
            }

            // CLI Recruit: CLH-001 to CLH-003
            if (isRangeComplete(1, 3) && !isUnlocked('cli_recruit')) {
                unlock('cli_recruit');
            }

            // CLI Analyst: CLH-004 to CLH-006
            if (isRangeComplete(1, 6) && !isUnlocked('cli_analyst')) {
                unlock('cli_analyst');
            }

            // CLI Operative: CLH-007 to CLH-009
            if (isRangeComplete(1, 9) && !isUnlocked('cli_operative')) {
                unlock('cli_operative');
            }

            // CLI Shadow: CLH-010 to CLH-012
            if (isRangeComplete(1, 12) && !isUnlocked('cli_shadow')) {
                unlock('cli_shadow');
            }

            // CLI Phantom: CLH-013 to CLH-015
            if (isRangeComplete(1, 15) && !isUnlocked('cli_phantom')) {
                unlock('cli_phantom');
            }

            // CLI Specter: CLH-016 to CLH-022
            if (isRangeComplete(1, 22) && !isUnlocked('cli_specter')) {
                unlock('cli_specter');
            }

            // CLI Wraith: CLH-023 to CLH-027
            if (isRangeComplete(1, 27) && !isUnlocked('cli_wraith')) {
                unlock('cli_wraith');
            }

            // CLI Ghost: ALL 30 modules complete
            if (isRangeComplete(1, 30) && !isUnlocked('cli_ghost')) {
                unlock('cli_ghost');
            }

            // CLI Blackout: Complete CLH-031 (OPERATION BLACKOUT)
            if (isModuleComplete(31) && !isUnlocked('cli_blackout')) {
                unlock('cli_blackout');
            }

            // CLI Grandmaster: ALL 31 modules complete (including BLACKOUT)
            if (isRangeComplete(1, 31) && !isUnlocked('cli_master')) {
                unlock('cli_master');
            }

        } catch (e) {
            console.warn('Error checking CLH progress:', e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════

    return {
        unlock,
        isUnlocked,
        getAchievement,
        getAllAchievements,
        getUnlockedAchievements,
        getUnlockedIds,
        getPoints,
        getStats,
        buildTitle,
        getShortTitle,
        checkImplicitAchievements,
        checkCLHProgress
    };
})();

// Auto-check achievements on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        AchievementManager.checkImplicitAchievements();
    });
} else {
    AchievementManager.checkImplicitAchievements();
}
