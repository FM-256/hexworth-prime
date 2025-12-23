/**
 * ProgressDisplay.js - Visual Progress Components for Hexworth Prime
 *
 * Provides visual components for displaying:
 * - User level and XP bar
 * - House progress cards
 * - Recent achievements
 * - Skill tree overview
 */

class ProgressDisplay {
    /**
     * Render the main progress panel (for dashboard)
     * @param {string} containerId - ID of container element
     */
    static renderDashboardPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const profile = ProgressManager.getProfile();
        const achievementSummary = AchievementSystem.getProgressSummary();

        container.innerHTML = `
            <div class="progress-dashboard">
                <div class="progress-header">
                    <div class="level-display">
                        <div class="level-badge">
                            <span class="level-number">${profile.level}</span>
                            <span class="level-label">LEVEL</span>
                        </div>
                        <div class="xp-info">
                            <div class="xp-bar">
                                <div class="xp-fill" style="width: ${profile.levelProgress}%"></div>
                            </div>
                            <span class="xp-text">${profile.xp.toLocaleString()} XP ${profile.xpToNextLevel ? `(${profile.xpToNextLevel} to next level)` : '(MAX)'}</span>
                        </div>
                    </div>
                    <div class="quick-stats">
                        <div class="stat-item">
                            <span class="stat-value">${profile.totalModulesCompleted}</span>
                            <span class="stat-label">Modules</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${profile.totalQuizzesPassed}</span>
                            <span class="stat-label">Quizzes</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${achievementSummary.displayProgress}</span>
                            <span class="stat-label">Achievements</span>
                        </div>
                    </div>
                </div>

                <div class="house-progress-grid">
                    ${profile.houseProgress.map(house => this.renderHouseCard(house)).join('')}
                </div>

                ${this.renderRecentAchievements()}
            </div>
        `;

        this.addStyles();
    }

    /**
     * Render a single house progress card
     */
    static renderHouseCard(house) {
        const progressClass = house.progressPercent === 100 ? 'complete' :
                             house.progressPercent > 0 ? 'in-progress' : 'not-started';

        return `
            <div class="house-card ${progressClass}" style="--house-color: ${house.color}">
                <div class="house-icon">${house.icon}</div>
                <div class="house-info">
                    <h4 class="house-name">${house.name}</h4>
                    <div class="house-domain">${house.domain}</div>
                    <div class="house-progress-bar">
                        <div class="progress-fill" style="width: ${house.progressPercent}%; background: ${house.color}"></div>
                    </div>
                    <div class="house-stats">
                        <span>${house.modulesCompleted.length} completed</span>
                        <span class="progress-percent">${house.progressPercent}%</span>
                    </div>
                </div>
                ${house.nextModule ? `
                    <a href="houses/${house.id}/${house.nextModule.href}" class="continue-btn" style="background: ${house.color}">
                        Continue →
                    </a>
                ` : house.progressPercent === 100 ? `
                    <span class="complete-badge">✓ Complete</span>
                ` : `
                    <a href="houses/${house.id}/index.html" class="start-btn">Start</a>
                `}
            </div>
        `;
    }

    /**
     * Render recent achievements section
     */
    static renderRecentAchievements() {
        const achievements = AchievementSystem.getUnlockedAchievements()
            .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
            .slice(0, 5);

        if (achievements.length === 0) {
            return `
                <div class="recent-achievements empty">
                    <h3>Achievements</h3>
                    <p class="no-achievements">Complete modules and quizzes to earn achievements!</p>
                </div>
            `;
        }

        return `
            <div class="recent-achievements">
                <h3>Recent Achievements</h3>
                <div class="achievement-list">
                    ${achievements.map(a => `
                        <div class="achievement-item">
                            <span class="achievement-icon">${a.icon}</span>
                            <div class="achievement-info">
                                <span class="achievement-name">${a.name}</span>
                                <span class="achievement-desc">${a.description}</span>
                            </div>
                            <span class="achievement-points">+${a.points} XP</span>
                        </div>
                    `).join('')}
                </div>
                <a href="achievements.html" class="view-all-link">View All Achievements →</a>
            </div>
        `;
    }

    /**
     * Render compact progress bar for house pages
     * @param {string} houseId - The house ID
     */
    static renderHouseProgressBar(houseId) {
        const houseProgress = ProgressManager.getHouseProgress(houseId);
        if (!houseProgress) return '';

        return `
            <div class="house-progress-header" style="--house-color: ${houseProgress.color}">
                <div class="progress-info">
                    <span class="progress-text">${houseProgress.completedCount}/${houseProgress.totalModules} modules completed</span>
                    <span class="progress-percent">${houseProgress.progressPercent}%</span>
                </div>
                <div class="progress-bar-wrapper">
                    <div class="progress-bar-fill" style="width: ${houseProgress.progressPercent}%"></div>
                </div>
                ${houseProgress.nextModule ? `
                    <div class="next-up">
                        Next: <a href="${houseProgress.nextModule.href}">${houseProgress.nextModule.title}</a>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render mini XP indicator (for headers/navbars)
     */
    static renderMiniXPIndicator() {
        const profile = ProgressManager.getProfile();

        return `
            <div class="mini-xp-indicator">
                <span class="mini-level">Lv ${profile.level}</span>
                <div class="mini-xp-bar">
                    <div class="mini-xp-fill" style="width: ${profile.levelProgress}%"></div>
                </div>
                <span class="mini-xp">${profile.xp} XP</span>
            </div>
        `;
    }

    /**
     * Add necessary styles
     */
    static addStyles() {
        if (document.getElementById('progress-display-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'progress-display-styles';
        styles.textContent = `
            .progress-dashboard {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }

            .progress-header {
                display: flex;
                flex-wrap: wrap;
                gap: 30px;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 30px;
                padding: 25px;
                background: linear-gradient(135deg, rgba(30, 20, 50, 0.8), rgba(20, 15, 40, 0.8));
                border-radius: 16px;
                border: 1px solid rgba(168, 85, 247, 0.2);
            }

            .level-display {
                display: flex;
                align-items: center;
                gap: 20px;
            }

            .level-badge {
                width: 70px;
                height: 70px;
                background: linear-gradient(135deg, #7c3aed, #a855f7);
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
            }

            .level-number {
                font-size: 1.8rem;
                font-weight: 700;
                color: white;
                line-height: 1;
            }

            .level-label {
                font-size: 0.6rem;
                color: rgba(255, 255, 255, 0.8);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .xp-info {
                display: flex;
                flex-direction: column;
                gap: 6px;
                min-width: 200px;
            }

            .xp-bar {
                height: 8px;
                background: rgba(100, 100, 120, 0.3);
                border-radius: 4px;
                overflow: hidden;
            }

            .xp-fill {
                height: 100%;
                background: linear-gradient(90deg, #7c3aed, #a855f7);
                border-radius: 4px;
                transition: width 0.5s ease;
            }

            .xp-text {
                font-size: 0.85rem;
                color: #a0a0b0;
            }

            .quick-stats {
                display: flex;
                gap: 30px;
            }

            .stat-item {
                text-align: center;
            }

            .stat-item .stat-value {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: #e0e0e0;
            }

            .stat-item .stat-label {
                font-size: 0.75rem;
                color: #808090;
                text-transform: uppercase;
            }

            .house-progress-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .house-card {
                background: linear-gradient(135deg, rgba(30, 25, 45, 0.9), rgba(25, 20, 40, 0.9));
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(var(--house-color-rgb, 168, 85, 247), 0.2);
                display: flex;
                flex-direction: column;
                gap: 12px;
                transition: transform 0.2s, box-shadow 0.2s;
            }

            .house-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            }

            .house-card.complete {
                border-color: rgba(34, 197, 94, 0.4);
            }

            .house-icon {
                font-size: 2rem;
            }

            .house-name {
                margin: 0;
                font-size: 1.1rem;
                color: #e0e0e0;
            }

            .house-domain {
                font-size: 0.8rem;
                color: #808090;
            }

            .house-progress-bar {
                height: 6px;
                background: rgba(100, 100, 120, 0.2);
                border-radius: 3px;
                overflow: hidden;
            }

            .house-progress-bar .progress-fill {
                height: 100%;
                border-radius: 3px;
                transition: width 0.5s ease;
            }

            .house-stats {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                color: #a0a0b0;
            }

            .progress-percent {
                font-weight: 600;
                color: var(--house-color, #a855f7);
            }

            .continue-btn, .start-btn {
                display: inline-block;
                padding: 10px 16px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                font-size: 0.9rem;
                text-align: center;
                transition: all 0.2s;
            }

            .continue-btn {
                color: white;
            }

            .continue-btn:hover {
                filter: brightness(1.1);
                transform: translateY(-1px);
            }

            .start-btn {
                background: rgba(100, 100, 120, 0.3);
                color: #a0a0b0;
            }

            .start-btn:hover {
                background: rgba(100, 100, 120, 0.5);
                color: #e0e0e0;
            }

            .complete-badge {
                color: #22c55e;
                font-weight: 600;
                font-size: 0.9rem;
            }

            .recent-achievements {
                background: linear-gradient(135deg, rgba(30, 25, 45, 0.8), rgba(25, 20, 40, 0.8));
                border-radius: 12px;
                padding: 20px;
                border: 1px solid rgba(251, 191, 36, 0.2);
            }

            .recent-achievements h3 {
                margin: 0 0 15px 0;
                color: #fbbf24;
                font-size: 1.1rem;
            }

            .achievement-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .achievement-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
            }

            .achievement-icon {
                font-size: 1.5rem;
            }

            .achievement-info {
                flex: 1;
            }

            .achievement-name {
                display: block;
                font-weight: 600;
                color: #e0e0e0;
                font-size: 0.95rem;
            }

            .achievement-desc {
                font-size: 0.8rem;
                color: #808090;
            }

            .achievement-points {
                color: #22c55e;
                font-weight: 600;
                font-size: 0.85rem;
            }

            .view-all-link {
                display: block;
                margin-top: 15px;
                text-align: center;
                color: #a78bfa;
                text-decoration: none;
                font-size: 0.9rem;
            }

            .view-all-link:hover {
                color: #c4b5fd;
            }

            .no-achievements {
                color: #606070;
                font-style: italic;
                text-align: center;
                padding: 20px;
            }

            /* Mini XP Indicator */
            .mini-xp-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 20px;
            }

            .mini-level {
                font-weight: 600;
                color: #a855f7;
                font-size: 0.85rem;
            }

            .mini-xp-bar {
                width: 60px;
                height: 4px;
                background: rgba(100, 100, 120, 0.3);
                border-radius: 2px;
                overflow: hidden;
            }

            .mini-xp-fill {
                height: 100%;
                background: #a855f7;
                border-radius: 2px;
            }

            .mini-xp {
                font-size: 0.75rem;
                color: #808090;
            }

            /* House Progress Header */
            .house-progress-header {
                padding: 15px 20px;
                background: linear-gradient(135deg, rgba(20, 15, 35, 0.9), rgba(30, 20, 50, 0.9));
                border-radius: 10px;
                border: 1px solid rgba(168, 85, 247, 0.2);
                margin-bottom: 20px;
            }

            .progress-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .progress-text {
                color: #a0a0b0;
                font-size: 0.9rem;
            }

            .progress-bar-wrapper {
                height: 6px;
                background: rgba(100, 100, 120, 0.2);
                border-radius: 3px;
                overflow: hidden;
            }

            .progress-bar-fill {
                height: 100%;
                background: var(--house-color, #a855f7);
                border-radius: 3px;
                transition: width 0.5s ease;
            }

            .next-up {
                margin-top: 10px;
                font-size: 0.85rem;
                color: #808090;
            }

            .next-up a {
                color: #a78bfa;
                text-decoration: none;
            }

            .next-up a:hover {
                color: #c4b5fd;
            }

            @media (max-width: 768px) {
                .progress-header {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .quick-stats {
                    width: 100%;
                    justify-content: space-around;
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

// Make globally available
window.ProgressDisplay = ProgressDisplay;
