/**
 * HouseProgressPanel.js - Per-House Progress Display Component
 *
 * A drop-in component that displays house-specific learning progress.
 * Auto-detects the current house from the URL and shows:
 * - Progress bar with completion percentage
 * - Modules completed / total
 * - Next recommended module with "Continue Learning" button
 * - Learning streak and XP earned in this house
 *
 * Dependencies: ProgressManager.js, LearningPaths.js
 *
 * Usage: Just include this script in any house index.html:
 *   <script src="../../components/HouseProgressPanel.js"></script>
 *
 * The panel will automatically inject itself after the stats-bar element.
 */

class HouseProgressPanel {
    static HOUSE_COLORS = {
        web: { primary: '#60a5fa', glow: 'rgba(96, 165, 250, 0.3)' },
        shield: { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.3)' },
        cloud: { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.3)' },
        forge: { primary: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' },
        script: { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' },
        code: { primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)' },
        key: { primary: '#eab308', glow: 'rgba(234, 179, 8, 0.3)' },
        eye: { primary: '#6366f1', glow: 'rgba(99, 102, 241, 0.3)' }
    };

    constructor() {
        this.houseId = this.detectHouse();
        this.panel = null;
        this.initialized = false;
    }

    /**
     * Detect which house we're in based on URL
     */
    detectHouse() {
        const path = window.location.pathname;
        const match = path.match(/houses\/(\w+)/);
        return match ? match[1] : null;
    }

    /**
     * Initialize the panel
     */
    init() {
        if (this.initialized || !this.houseId) {
            console.log('HouseProgressPanel: No house detected or already initialized');
            return;
        }

        // Wait for dependencies
        if (typeof ProgressManager === 'undefined' || typeof LearningPaths === 'undefined') {
            console.warn('HouseProgressPanel: Waiting for dependencies...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.injectStyles();
        this.createPanel();
        this.updateProgress();
        this.setupEventListeners();
        this.initialized = true;

        console.log(`HouseProgressPanel: Initialized for ${this.houseId}`);
    }

    /**
     * Inject component styles
     */
    injectStyles() {
        if (document.getElementById('house-progress-panel-styles')) return;

        const colors = this.HOUSE_COLORS[this.houseId] || this.HOUSE_COLORS.web;

        const styles = document.createElement('style');
        styles.id = 'house-progress-panel-styles';
        styles.textContent = `
            .house-progress-panel {
                background: rgba(15, 15, 20, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 24px 28px;
                margin-bottom: 40px;
                position: relative;
                overflow: hidden;
            }

            .house-progress-panel::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, ${colors.primary}, transparent);
            }

            .hpp-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .hpp-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .hpp-title-icon {
                font-size: 1.3rem;
            }

            .hpp-title-text {
                font-size: 0.75rem;
                color: #888;
                letter-spacing: 0.2em;
                text-transform: uppercase;
            }

            .hpp-level-badge {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
            }

            .hpp-level-badge .level-icon {
                font-size: 1rem;
            }

            .hpp-level-badge .level-text {
                font-size: 0.75rem;
                color: ${colors.primary};
                font-weight: 600;
            }

            .hpp-progress-container {
                margin-bottom: 20px;
            }

            .hpp-progress-stats {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .hpp-progress-label {
                font-size: 0.85rem;
                color: #ccc;
            }

            .hpp-progress-percent {
                font-size: 1.5rem;
                font-weight: 300;
                color: ${colors.primary};
            }

            .hpp-progress-bar {
                height: 8px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }

            .hpp-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, ${colors.primary}, ${colors.primary}88);
                border-radius: 4px;
                transition: width 0.6s ease;
                position: relative;
            }

            .hpp-progress-fill::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                width: 20px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
                animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }

            .hpp-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .hpp-stat {
                text-align: center;
                padding: 12px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.03);
            }

            .hpp-stat-value {
                font-size: 1.4rem;
                font-weight: 300;
                color: #fff;
                margin-bottom: 4px;
            }

            .hpp-stat-label {
                font-size: 0.65rem;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }

            .hpp-next-module {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 12px;
                gap: 15px;
            }

            .hpp-next-info {
                flex: 1;
            }

            .hpp-next-label {
                font-size: 0.65rem;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-bottom: 4px;
            }

            .hpp-next-title {
                font-size: 0.95rem;
                color: #ddd;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .hpp-next-type {
                font-size: 0.65rem;
                padding: 2px 8px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
                color: #888;
            }

            .hpp-continue-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                background: linear-gradient(135deg, ${colors.primary}dd, ${colors.primary});
                border: none;
                border-radius: 10px;
                color: #000;
                font-weight: 600;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
            }

            .hpp-continue-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px ${colors.glow};
            }

            .hpp-continue-btn .arrow {
                transition: transform 0.3s ease;
            }

            .hpp-continue-btn:hover .arrow {
                transform: translateX(4px);
            }

            .hpp-complete {
                text-align: center;
                padding: 20px;
            }

            .hpp-complete-icon {
                font-size: 2.5rem;
                margin-bottom: 10px;
            }

            .hpp-complete-text {
                font-size: 1rem;
                color: ${colors.primary};
                margin-bottom: 5px;
            }

            .hpp-complete-subtext {
                font-size: 0.8rem;
                color: #666;
            }

            /* Responsive */
            @media (max-width: 600px) {
                .hpp-next-module {
                    flex-direction: column;
                    text-align: center;
                }

                .hpp-continue-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Create the panel element
     */
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'house-progress-panel';
        this.panel.id = 'houseProgressPanel';

        // Find insertion point (after stats-bar or at start of main content)
        const statsBar = document.querySelector('.stats-bar');
        const mainContent = document.querySelector('.house-content');

        if (statsBar) {
            statsBar.insertAdjacentElement('afterend', this.panel);
        } else if (mainContent) {
            mainContent.insertAdjacentElement('afterbegin', this.panel);
        } else {
            document.body.appendChild(this.panel);
        }
    }

    /**
     * Update progress display
     */
    updateProgress() {
        if (!this.panel || !this.houseId) return;

        // Get data from ProgressManager
        const houseProgress = ProgressManager.getHouseProgress(this.houseId);
        const profile = ProgressManager.getProfile();

        if (!houseProgress) {
            this.panel.innerHTML = '<p style="color: #666; text-align: center;">Progress data unavailable</p>';
            return;
        }

        const {
            name, icon, color, domain,
            modulesCompleted = [],
            totalModules = 0,
            progressPercent = 0,
            nextModule
        } = houseProgress;

        const completedCount = modulesCompleted.length;
        const houseColors = this.HOUSE_COLORS[this.houseId] || this.HOUSE_COLORS.web;

        // Calculate house-specific XP (rough estimate based on completions)
        const houseXP = completedCount * 100; // Simplified

        // Build panel HTML
        let nextModuleHTML = '';

        if (progressPercent >= 100) {
            nextModuleHTML = `
                <div class="hpp-complete">
                    <div class="hpp-complete-icon">🏆</div>
                    <div class="hpp-complete-text">House Mastery Complete!</div>
                    <div class="hpp-complete-subtext">You've completed all modules in ${name}</div>
                </div>
            `;
        } else if (nextModule) {
            const typeLabel = this.getTypeLabel(nextModule.type);
            nextModuleHTML = `
                <div class="hpp-next-module">
                    <div class="hpp-next-info">
                        <div class="hpp-next-label">Continue Your Journey</div>
                        <div class="hpp-next-title">
                            ${nextModule.title}
                            <span class="hpp-next-type">${typeLabel}</span>
                        </div>
                    </div>
                    <a href="${nextModule.href}" class="hpp-continue-btn">
                        Continue Learning
                        <span class="arrow">→</span>
                    </a>
                </div>
            `;
        } else {
            nextModuleHTML = `
                <div class="hpp-next-module">
                    <div class="hpp-next-info">
                        <div class="hpp-next-label">Ready to Begin</div>
                        <div class="hpp-next-title">Start your ${domain} journey</div>
                    </div>
                    <button class="hpp-continue-btn" onclick="document.querySelector('.module-card')?.click()">
                        Browse Modules
                        <span class="arrow">→</span>
                    </button>
                </div>
            `;
        }

        this.panel.innerHTML = `
            <div class="hpp-header">
                <div class="hpp-title">
                    <span class="hpp-title-icon">📊</span>
                    <span class="hpp-title-text">Your Progress</span>
                </div>
                <div class="hpp-level-badge">
                    <span class="level-icon">⭐</span>
                    <span class="level-text">Level ${profile.level}</span>
                </div>
            </div>

            <div class="hpp-progress-container">
                <div class="hpp-progress-stats">
                    <span class="hpp-progress-label">${completedCount} of ${totalModules} modules completed</span>
                    <span class="hpp-progress-percent">${progressPercent}%</span>
                </div>
                <div class="hpp-progress-bar">
                    <div class="hpp-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>

            <div class="hpp-details">
                <div class="hpp-stat">
                    <div class="hpp-stat-value">${completedCount}</div>
                    <div class="hpp-stat-label">Completed</div>
                </div>
                <div class="hpp-stat">
                    <div class="hpp-stat-value">${totalModules - completedCount}</div>
                    <div class="hpp-stat-label">Remaining</div>
                </div>
                <div class="hpp-stat">
                    <div class="hpp-stat-value">${houseXP}</div>
                    <div class="hpp-stat-label">House XP</div>
                </div>
                <div class="hpp-stat">
                    <div class="hpp-stat-value">${this.getEstimatedTime(totalModules - completedCount)}</div>
                    <div class="hpp-stat-label">Est. Time Left</div>
                </div>
            </div>

            ${nextModuleHTML}
        `;

        // Also update the stats-bar if it exists
        this.updateStatsBar(completedCount, totalModules);
    }

    /**
     * Update the existing stats bar with real data
     */
    updateStatsBar(completed, total) {
        const completedEl = document.getElementById('completedModules');
        const totalEl = document.getElementById('totalModules');

        if (completedEl) completedEl.textContent = completed;
        if (totalEl) totalEl.textContent = total;
    }

    /**
     * Get module type label
     */
    getTypeLabel(type) {
        const labels = {
            presentation: '📊 Slides',
            quiz: '📝 Quiz',
            lab: '🧪 Lab',
            applet: '🎮 Interactive',
            tool: '🔧 Tool'
        };
        return labels[type] || type;
    }

    /**
     * Estimate remaining time based on modules left
     */
    getEstimatedTime(modulesLeft) {
        const avgMinutesPerModule = 25;
        const totalMinutes = modulesLeft * avgMinutesPerModule;

        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
    }

    /**
     * Setup event listeners for live updates
     */
    setupEventListeners() {
        // Listen for progress updates
        window.addEventListener('hexworth:progressUpdate', () => {
            this.updateProgress();
        });

        // Listen for progress reset
        window.addEventListener('hexworth:progressReset', () => {
            this.updateProgress();
        });
    }
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.houseProgressPanel = new HouseProgressPanel();
    window.houseProgressPanel.init();
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!window.houseProgressPanel) {
            window.houseProgressPanel = new HouseProgressPanel();
            window.houseProgressPanel.init();
        }
    }, 100);
}

// Make class globally available
window.HouseProgressPanel = HouseProgressPanel;
