/**
 * UpdateChecker.js - Version Update Notification
 *
 * Checks for newer versions of Hexworth Prime by comparing
 * the local version against the remote GitHub repository.
 *
 * Features:
 * - Non-intrusive notification banner
 * - Checks once per session (or configurable interval)
 * - Remembers dismissed versions
 * - Links to download page
 *
 * Usage:
 *   const updateChecker = new UpdateChecker();
 *   updateChecker.init();
 */

class UpdateChecker {
    constructor(options = {}) {
        this.options = {
            // GitHub raw content URL for version.json
            remoteVersionUrl: options.remoteVersionUrl ||
                'https://raw.githubusercontent.com/FM-256/hexworth-prime/master/_app/config/version.json',
            // Local version file path (relative to current page)
            localVersionPath: options.localVersionPath || 'config/version.json',
            // GitHub releases page
            releasesUrl: options.releasesUrl ||
                'https://github.com/FM-256/hexworth-prime/releases',
            // Storage keys
            storageKeyDismissed: options.storageKeyDismissed || 'hexworth_update_dismissed',
            storageKeyLastCheck: options.storageKeyLastCheck || 'hexworth_update_last_check',
            // Check interval (default: once per day in ms)
            checkInterval: options.checkInterval || 24 * 60 * 60 * 1000,
            // Position
            position: options.position || 'top', // top or bottom
            // Z-index
            zIndex: options.zIndex || 10000,
            ...options
        };

        this.element = null;
        this.localVersion = null;
        this.remoteVersion = null;
    }

    /**
     * Initialize the update checker
     */
    async init() {
        // Check if we should check for updates
        if (!this.shouldCheck()) {
            return this;
        }

        try {
            // Load local version
            await this.loadLocalVersion();

            // Check remote version
            await this.checkRemoteVersion();

            // Compare and show notification if needed
            if (this.isUpdateAvailable()) {
                this.showNotification();
            }

            // Record check time
            localStorage.setItem(this.options.storageKeyLastCheck, Date.now().toString());

        } catch (e) {
            // Silently fail - don't bother user if update check fails
            console.log('Update check skipped:', e.message);
        }

        return this;
    }

    /**
     * Determine if we should check for updates
     */
    shouldCheck() {
        const lastCheck = localStorage.getItem(this.options.storageKeyLastCheck);
        if (!lastCheck) return true;

        const timeSinceCheck = Date.now() - parseInt(lastCheck, 10);
        return timeSinceCheck >= this.options.checkInterval;
    }

    /**
     * Load local version from version.json
     */
    async loadLocalVersion() {
        const response = await fetch(this.options.localVersionPath);
        if (!response.ok) throw new Error('Could not load local version');
        this.localVersion = await response.json();
    }

    /**
     * Check remote version from GitHub
     */
    async checkRemoteVersion() {
        const response = await fetch(this.options.remoteVersionUrl, {
            cache: 'no-store' // Bypass cache for version check
        });
        if (!response.ok) throw new Error('Could not fetch remote version');
        this.remoteVersion = await response.json();
    }

    /**
     * Compare versions (semver comparison)
     */
    isUpdateAvailable() {
        if (!this.localVersion || !this.remoteVersion) return false;

        const local = this.parseVersion(this.localVersion.version);
        const remote = this.parseVersion(this.remoteVersion.version);

        // Check if this version was dismissed
        const dismissed = localStorage.getItem(this.options.storageKeyDismissed);
        if (dismissed === this.remoteVersion.version) return false;

        // Compare major.minor.patch
        if (remote.major > local.major) return true;
        if (remote.major === local.major && remote.minor > local.minor) return true;
        if (remote.major === local.major && remote.minor === local.minor && remote.patch > local.patch) return true;

        return false;
    }

    /**
     * Parse semver string
     */
    parseVersion(versionString) {
        const parts = versionString.split('.').map(n => parseInt(n, 10) || 0);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    }

    /**
     * Show the update notification
     */
    showNotification() {
        // Inject styles
        this.injectStyles();

        // Create notification element
        this.element = document.createElement('div');
        this.element.className = 'update-notification';
        this.element.innerHTML = `
            <div class="update-content">
                <span class="update-icon">✨</span>
                <span class="update-message">
                    <strong>Hexworth Prime ${this.remoteVersion.version}</strong> is available
                    ${this.remoteVersion.codename ? `<span class="update-codename">"${this.remoteVersion.codename}"</span>` : ''}
                </span>
                <a href="${this.options.releasesUrl}" target="_blank" class="update-link">
                    Get Update
                </a>
                <button class="update-dismiss" title="Dismiss">×</button>
            </div>
        `;

        // Position
        if (this.options.position === 'bottom') {
            this.element.classList.add('position-bottom');
        }

        // Add dismiss handler
        this.element.querySelector('.update-dismiss').addEventListener('click', () => {
            this.dismiss();
        });

        // Add to document
        document.body.appendChild(this.element);

        // Animate in
        requestAnimationFrame(() => {
            this.element.classList.add('visible');
        });
    }

    /**
     * Dismiss the notification
     */
    dismiss() {
        // Remember this version was dismissed
        localStorage.setItem(this.options.storageKeyDismissed, this.remoteVersion.version);

        // Animate out
        this.element.classList.remove('visible');
        this.element.classList.add('dismissed');

        // Remove after animation
        setTimeout(() => {
            this.element?.remove();
        }, 300);
    }

    /**
     * Force check (ignore interval)
     */
    async forceCheck() {
        localStorage.removeItem(this.options.storageKeyLastCheck);
        localStorage.removeItem(this.options.storageKeyDismissed);
        return this.init();
    }

    /**
     * Get version info
     */
    getVersionInfo() {
        return {
            local: this.localVersion,
            remote: this.remoteVersion,
            updateAvailable: this.isUpdateAvailable()
        };
    }

    /**
     * Inject styles
     */
    injectStyles() {
        if (document.getElementById('update-checker-styles')) return;

        const style = document.createElement('style');
        style.id = 'update-checker-styles';
        style.textContent = `
            .update-notification {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: ${this.options.zIndex};
                transform: translateY(-100%);
                transition: transform 0.3s ease;
            }

            .update-notification.position-bottom {
                top: auto;
                bottom: 0;
                transform: translateY(100%);
            }

            .update-notification.visible {
                transform: translateY(0);
            }

            .update-notification.dismissed {
                transform: translateY(-100%);
            }

            .update-notification.position-bottom.dismissed {
                transform: translateY(100%);
            }

            .update-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                padding: 12px 20px;
                background: linear-gradient(135deg, rgba(30, 25, 45, 0.95), rgba(40, 30, 60, 0.95));
                border-bottom: 1px solid rgba(159, 122, 234, 0.3);
                backdrop-filter: blur(10px);
                font-family: 'Segoe UI', sans-serif;
                font-size: 0.9rem;
                color: #c4b5d4;
            }

            .update-notification.position-bottom .update-content {
                border-bottom: none;
                border-top: 1px solid rgba(159, 122, 234, 0.3);
            }

            .update-icon {
                font-size: 1.2rem;
            }

            .update-message {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .update-message strong {
                color: #e8d5f5;
            }

            .update-codename {
                color: #9f7aea;
                font-style: italic;
                font-size: 0.85rem;
            }

            .update-link {
                padding: 6px 16px;
                background: rgba(159, 122, 234, 0.2);
                border: 1px solid rgba(159, 122, 234, 0.4);
                border-radius: 4px;
                color: #c4b5d4;
                text-decoration: none;
                font-size: 0.85rem;
                transition: all 0.2s ease;
            }

            .update-link:hover {
                background: rgba(159, 122, 234, 0.3);
                border-color: rgba(159, 122, 234, 0.6);
                color: #fff;
            }

            .update-dismiss {
                background: none;
                border: none;
                color: #6a5a7a;
                font-size: 1.4rem;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
                transition: color 0.2s ease;
            }

            .update-dismiss:hover {
                color: #c4b5d4;
            }

            /* Matrix theme */
            [data-theme="matrix"] .update-content {
                background: linear-gradient(135deg, rgba(10, 20, 15, 0.95), rgba(15, 30, 20, 0.95));
                border-color: rgba(0, 255, 65, 0.3);
            }

            [data-theme="matrix"] .update-message strong,
            [data-theme="matrix"] .update-link:hover {
                color: #00ff41;
            }

            [data-theme="matrix"] .update-codename {
                color: #00aa2a;
            }

            [data-theme="matrix"] .update-link {
                background: rgba(0, 255, 65, 0.1);
                border-color: rgba(0, 255, 65, 0.3);
                color: #00cc33;
            }

            [data-theme="matrix"] .update-link:hover {
                background: rgba(0, 255, 65, 0.2);
                border-color: rgba(0, 255, 65, 0.5);
            }

            /* Mobile responsive */
            @media (max-width: 600px) {
                .update-content {
                    flex-wrap: wrap;
                    gap: 10px;
                    padding: 10px 15px;
                }

                .update-message {
                    flex-basis: 100%;
                    justify-content: center;
                }

                .update-codename {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpdateChecker;
}
