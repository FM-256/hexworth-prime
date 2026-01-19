/**
 * CLH Completion Modal - "MISSION COMPLETED" Stamp Effect
 *
 * Creates a dramatic classified document stamp effect when a lab is completed.
 *
 * Usage:
 *   const modal = new CLHCompletionModal({
 *       moduleId: 'CLH-002',
 *       moduleName: 'Navigation & Reconnaissance',
 *       xpEarned: 75,
 *       nextIntroUrl: '../../clh/clh-003-intro.html',
 *       successMessage: 'Reconnaissance successful.'
 *   });
 *
 *   // When lab is complete:
 *   modal.show();
 */

class CLHCompletionModal {
    constructor(options = {}) {
        this.moduleId = options.moduleId || 'CLH-000';
        this.moduleName = options.moduleName || 'Unknown Mission';
        this.xpEarned = options.xpEarned || 50;
        this.nextIntroUrl = options.nextIntroUrl || '../../index.html';
        this.successMessage = options.successMessage || 'Mission objectives achieved.';
        this.isLastModule = options.isLastModule || false;

        this._injectStyles();
        this._createModal();
    }

    _injectStyles() {
        // Only inject once
        if (document.getElementById('clh-completion-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'clh-completion-styles';
        styles.textContent = `
            /* ═══════════════════════════════════════════════════════════
               MISSION COMPLETED - Classified Document Stamp Effect
               ═══════════════════════════════════════════════════════════ */

            .clh-completion-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                justify-content: center;
                align-items: center;
                z-index: 10000;
                overflow: hidden;
            }

            .clh-completion-overlay.show {
                display: flex;
                animation: overlayFadeIn 0.3s ease;
            }

            @keyframes overlayFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* Document Container */
            .clh-document {
                position: relative;
                width: 500px;
                max-width: 90vw;
                background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
                border: 3px solid #333;
                border-radius: 4px;
                padding: 60px 40px 40px;
                box-shadow:
                    0 0 60px rgba(0, 0, 0, 0.8),
                    inset 0 0 100px rgba(0, 0, 0, 0.5);
                animation: documentSlide 0.4s ease;
            }

            @keyframes documentSlide {
                from {
                    transform: translateY(-30px) scale(0.95);
                    opacity: 0;
                }
                to {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }

            /* Top Secret Header */
            .clh-doc-header {
                position: absolute;
                top: -15px;
                left: 50%;
                transform: translateX(-50%);
                background: #1a1a1a;
                padding: 8px 30px;
                border: 2px solid #8b0000;
                font-family: 'Courier New', monospace;
                font-size: 0.75em;
                font-weight: bold;
                letter-spacing: 0.3em;
                color: #8b0000;
                text-transform: uppercase;
            }

            /* THE STAMP - Main Feature */
            .clh-stamp-container {
                position: relative;
                margin-bottom: 30px;
                min-height: 140px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .clh-stamp {
                position: relative;
                transform: rotate(-5deg);
                animation: stampSlam 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                animation-delay: 0.3s;
                animation-fill-mode: backwards;
            }

            @keyframes stampSlam {
                0% {
                    transform: rotate(-5deg) scale(3);
                    opacity: 0;
                }
                50% {
                    transform: rotate(-5deg) scale(0.95);
                }
                100% {
                    transform: rotate(-5deg) scale(1);
                    opacity: 1;
                }
            }

            .clh-stamp-border {
                border: 4px solid #b91c1c;
                border-radius: 8px;
                padding: 15px 35px;
                background: rgba(185, 28, 28, 0.1);
                box-shadow:
                    0 0 0 2px rgba(185, 28, 28, 0.3),
                    inset 0 0 20px rgba(185, 28, 28, 0.1);
            }

            .clh-stamp-text {
                font-family: 'Impact', 'Arial Black', sans-serif;
                font-size: 2.5em;
                font-weight: bold;
                letter-spacing: 0.15em;
                color: #b91c1c;
                text-transform: uppercase;
                text-shadow:
                    2px 2px 0 rgba(0, 0, 0, 0.3),
                    0 0 20px rgba(185, 28, 28, 0.5);
                line-height: 1.2;
            }

            .clh-stamp-text .mission-word {
                display: block;
                font-size: 0.5em;
                letter-spacing: 0.5em;
                margin-bottom: 5px;
            }

            /* Document Body */
            .clh-doc-body {
                text-align: center;
                margin-bottom: 30px;
            }

            .clh-module-id {
                font-family: 'Courier New', monospace;
                font-size: 0.8em;
                color: #666;
                letter-spacing: 0.2em;
                margin-bottom: 8px;
            }

            .clh-module-name {
                font-size: 1.2em;
                color: #00ff41;
                margin-bottom: 15px;
                text-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
            }

            .clh-success-message {
                color: #888;
                font-size: 0.95em;
                margin-bottom: 20px;
                line-height: 1.6;
            }

            .clh-xp-badge {
                display: inline-block;
                padding: 10px 25px;
                background: linear-gradient(135deg, rgba(255, 166, 87, 0.2), rgba(255, 166, 87, 0.05));
                border: 2px solid #ffa657;
                border-radius: 25px;
                color: #ffa657;
                font-family: 'Courier New', monospace;
                font-size: 1.1em;
                font-weight: bold;
                animation: xpPulse 2s ease infinite;
            }

            @keyframes xpPulse {
                0%, 100% { box-shadow: 0 0 10px rgba(255, 166, 87, 0.3); }
                50% { box-shadow: 0 0 25px rgba(255, 166, 87, 0.5); }
            }

            /* Action Buttons */
            .clh-doc-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .clh-action-btn {
                padding: 14px 28px;
                border: none;
                border-radius: 8px;
                font-family: 'Cascadia Code', 'Courier New', monospace;
                font-size: 0.95em;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .clh-action-btn.explore {
                background: transparent;
                color: #00ff41;
                border: 2px solid #00ff41;
            }

            .clh-action-btn.explore:hover {
                background: rgba(0, 255, 65, 0.1);
                box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
            }

            .clh-action-btn.next-mission {
                background: linear-gradient(135deg, #00ff41, #00cc33);
                color: #0a0a0a;
                font-weight: bold;
            }

            .clh-action-btn.next-mission:hover {
                box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
                transform: translateY(-2px);
            }

            .clh-action-btn.graduation {
                background: linear-gradient(135deg, #ffa657, #ff8c00);
                color: #0a0a0a;
                font-weight: bold;
            }

            .clh-action-btn.graduation:hover {
                box-shadow: 0 0 30px rgba(255, 166, 87, 0.5);
                transform: translateY(-2px);
            }

            /* Decorative Elements */
            .clh-doc-corner {
                position: absolute;
                width: 20px;
                height: 20px;
                border-color: #333;
                border-style: solid;
            }

            .clh-doc-corner.tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
            .clh-doc-corner.tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; }
            .clh-doc-corner.bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; }
            .clh-doc-corner.br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }

            .clh-doc-watermark {
                position: absolute;
                bottom: 15px;
                right: 15px;
                font-family: 'Courier New', monospace;
                font-size: 0.6em;
                color: #333;
                letter-spacing: 0.1em;
            }

            /* Mobile Adjustments */
            @media (max-width: 600px) {
                .clh-document {
                    padding: 50px 25px 30px;
                }

                .clh-stamp-text {
                    font-size: 1.8em;
                }

                .clh-stamp-border {
                    padding: 12px 25px;
                }

                .clh-doc-actions {
                    flex-direction: column;
                }

                .clh-action-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    _createModal() {
        // Remove existing modal if present
        const existing = document.getElementById('clhCompletionModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'clhCompletionModal';
        modal.className = 'clh-completion-overlay';

        // Determine next button
        let nextButton;
        if (this.isLastModule) {
            nextButton = `
                <a href="../../index.html" class="clh-action-btn graduation">
                    View Certificate
                    <span>→</span>
                </a>
            `;
        } else {
            nextButton = `
                <button class="clh-action-btn next-mission" onclick="CLHCompletionModal.goToNext()">
                    Next Mission
                    <span>→</span>
                </button>
            `;
        }

        modal.innerHTML = `
            <div class="clh-document">
                <div class="clh-doc-corner tl"></div>
                <div class="clh-doc-corner tr"></div>
                <div class="clh-doc-corner bl"></div>
                <div class="clh-doc-corner br"></div>

                <div class="clh-doc-header">CLASSIFIED</div>

                <div class="clh-stamp-container">
                    <div class="clh-stamp">
                        <div class="clh-stamp-border">
                            <div class="clh-stamp-text">
                                <span class="mission-word">MISSION</span>
                                COMPLETED
                            </div>
                        </div>
                    </div>
                </div>

                <div class="clh-doc-body">
                    <div class="clh-module-id">${this.moduleId}</div>
                    <div class="clh-module-name">${this.moduleName}</div>
                    <div class="clh-success-message">${this.successMessage}</div>
                    <div class="clh-xp-badge">+${this.xpEarned} XP</div>
                </div>

                <div class="clh-doc-actions">
                    <button class="clh-action-btn explore" onclick="CLHCompletionModal.close()">
                        Continue Exploring
                    </button>
                    ${nextButton}
                </div>

                <div class="clh-doc-watermark">HEXWORTH PRIME // ${new Date().toISOString().split('T')[0]}</div>
            </div>
        `;

        document.body.appendChild(modal);

        // Store next URL for static method access
        CLHCompletionModal._nextUrl = this.nextIntroUrl;
        CLHCompletionModal._instance = this;
    }

    show() {
        const modal = document.getElementById('clhCompletionModal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    hide() {
        const modal = document.getElementById('clhCompletionModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // Static methods for onclick handlers
    static close() {
        if (CLHCompletionModal._instance) {
            CLHCompletionModal._instance.hide();
        }
    }

    static goToNext() {
        if (CLHCompletionModal._nextUrl) {
            window.location.href = CLHCompletionModal._nextUrl;
        }
    }
}

// Store static references
CLHCompletionModal._instance = null;
CLHCompletionModal._nextUrl = null;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CLHCompletionModal;
}
