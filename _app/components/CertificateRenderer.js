/**
 * CertificateRenderer.js — Course Completion Certificate Generator
 *
 * Renders a printable certificate for students who complete a course.
 * Reads progress from localStorage to verify completion and display stats.
 *
 * Usage:
 *   CertificateRenderer.init({
 *       containerId: 'certificate',
 *       courseTitle: 'CyberOps Associate 200-201',
 *       courseSubtitle: 'Cisco Certified CyberOps Associate',
 *       house: 'eye',
 *       houseColor: '#8B5CF6',
 *       houseIcon: '\uD83D\uDC41\uFE0F',
 *       houseName: 'Eye House',
 *       storageKey: 'cyberops200201',
 *       unitLabel: 'weeks',       // or 'chapters'
 *       unitCount: 8,
 *       backUrl: 'index.html'
 *   });
 */

const CertificateRenderer = (() => {

    let config = {};

    function init(options) {
        config = options;
        const container = document.getElementById(config.containerId);
        if (!container) return;

        const progress = getProgress();
        const completedCount = countCompleted(progress);
        const isComplete = completedCount >= config.unitCount;

        if (isComplete) {
            renderCertificate(container, progress, completedCount);
        } else {
            renderIncomplete(container, completedCount);
        }
    }

    function getProgress() {
        try {
            const stored = localStorage.getItem(config.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }

    function countCompleted(progress) {
        const units = progress[config.unitLabel] || progress.weeks || progress.chapters || {};
        let count = 0;
        for (let i = 1; i <= config.unitCount; i++) {
            const unit = units[i];
            if (unit && (unit.moduleComplete || unit.evalComplete || unit.examComplete)) {
                count++;
            }
        }
        return count;
    }

    function getCompletionDate(progress) {
        if (progress.lastAccessedAt) {
            return new Date(progress.lastAccessedAt);
        }
        return new Date();
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function renderCertificate(container, progress, completedCount) {
        const completionDate = getCompletionDate(progress);
        const dateStr = formatDate(completionDate);
        const startDate = progress.startedAt ? formatDate(new Date(progress.startedAt)) : null;

        container.innerHTML = `
            <div class="cert-wrapper">
                <div class="cert-actions no-print">
                    <a href="${config.backUrl}" class="cert-back-btn">&larr; Back to Course</a>
                    <button onclick="window.print()" class="cert-print-btn">Print Certificate</button>
                </div>

                <div class="cert-frame" id="certFrame">
                    <div class="cert-border">
                        <div class="cert-inner">
                            <div class="cert-seal">${config.houseIcon}</div>

                            <div class="cert-header-text">HEXWORTH PRIME</div>
                            <div class="cert-house-name">${config.houseName}</div>

                            <div class="cert-divider"></div>

                            <div class="cert-title">Certificate of Completion</div>

                            <div class="cert-body">
                                <p class="cert-presented">This certifies that the bearer has successfully completed</p>
                                <div class="cert-course-title">${config.courseTitle}</div>
                                ${config.courseSubtitle ? `<div class="cert-course-subtitle">${config.courseSubtitle}</div>` : ''}

                                <div class="cert-stats">
                                    <div class="cert-stat">
                                        <div class="cert-stat-value">${completedCount}</div>
                                        <div class="cert-stat-label">${capitalize(config.unitLabel)} Completed</div>
                                    </div>
                                    <div class="cert-stat">
                                        <div class="cert-stat-value">100%</div>
                                        <div class="cert-stat-label">Course Progress</div>
                                    </div>
                                </div>

                                <div class="cert-date">
                                    ${startDate ? `<span class="cert-date-range">Started: ${startDate}</span>` : ''}
                                    <span class="cert-date-completed">Completed: ${dateStr}</span>
                                </div>
                            </div>

                            <div class="cert-divider"></div>

                            <div class="cert-footer">
                                <div class="cert-signature">
                                    <div class="cert-sig-line"></div>
                                    <div class="cert-sig-title">Hexworth Prime Academy</div>
                                </div>
                                <div class="cert-id">
                                    <span>ID: ${generateCertId(config.storageKey, completionDate)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderIncomplete(container, completedCount) {
        const remaining = config.unitCount - completedCount;
        container.innerHTML = `
            <div class="cert-wrapper">
                <div class="cert-actions">
                    <a href="${config.backUrl}" class="cert-back-btn">&larr; Back to Course</a>
                </div>
                <div class="cert-incomplete">
                    <div class="cert-incomplete-icon"><img src="/assets/images/icons/icon-padlock.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"></div>
                    <h2>Certificate Locked</h2>
                    <p>Complete all ${config.unitCount} ${config.unitLabel} to earn your certificate.</p>
                    <div class="cert-incomplete-progress">
                        <div class="cert-incomplete-bar">
                            <div class="cert-incomplete-fill" style="width: ${Math.round((completedCount / config.unitCount) * 100)}%"></div>
                        </div>
                        <span>${completedCount}/${config.unitCount} ${config.unitLabel} complete &mdash; ${remaining} remaining</span>
                    </div>
                    <a href="${config.backUrl}" class="cert-continue-btn">Continue Learning</a>
                </div>
            </div>
        `;
    }

    function generateCertId(key, date) {
        const hash = key.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
        const ts = date.getTime().toString(36).toUpperCase();
        return `HP-${Math.abs(hash).toString(16).toUpperCase().slice(0, 4)}-${ts.slice(-6)}`;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return { init };
})();
