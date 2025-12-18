/**
 * UpdateManager.js - Industry-Leading Update Experience
 *
 * A comprehensive update system that provides:
 * - Beautiful modal UI with release notes
 * - GitHub API integration for real release data
 * - Direct download with progress indicator
 * - User data backup before update
 * - "What's New" celebration on first launch
 * - Version history tracking
 *
 * This is designed to be the gold standard for
 * static web application updates.
 */

class UpdateManager {
    constructor(options = {}) {
        this.options = {
            // GitHub repository info
            owner: options.owner || 'FM-256',
            repo: options.repo || 'hexworth-prime',

            // URLs
            apiBase: 'https://api.github.com',
            rawBase: 'https://raw.githubusercontent.com',

            // Local version path
            localVersionPath: options.localVersionPath || 'config/version.json',

            // Storage keys
            storageKeys: {
                lastCheck: 'hexworth_update_check',
                dismissed: 'hexworth_update_dismissed',
                lastVersion: 'hexworth_last_version',
                userData: 'hexworth_user_backup',
                seenWhatsNew: 'hexworth_seen_whatsnew'
            },

            // Check interval (4 hours)
            checkInterval: options.checkInterval || 4 * 60 * 60 * 1000,

            // UI options
            zIndex: options.zIndex || 10001,

            ...options
        };

        this.localVersion = null;
        this.remoteRelease = null;
        this.isChecking = false;
        this.modal = null;
        this.banner = null;
    }

    /**
     * Initialize the update manager
     */
    async init() {
        // First, check if this is a new version (show What's New)
        await this.checkFirstLaunch();

        // Then check for updates if due
        if (this.shouldCheck()) {
            await this.checkForUpdates();
        }

        return this;
    }

    /**
     * Check if this is the first launch of a new version
     */
    async checkFirstLaunch() {
        try {
            await this.loadLocalVersion();

            const lastVersion = localStorage.getItem(this.options.storageKeys.lastVersion);
            const currentVersion = this.localVersion?.version;

            if (lastVersion && currentVersion && lastVersion !== currentVersion) {
                // New version detected - show What's New
                const seenWhatsNew = localStorage.getItem(this.options.storageKeys.seenWhatsNew);
                if (seenWhatsNew !== currentVersion) {
                    await this.showWhatsNew();
                }
            }

            // Update stored version
            if (currentVersion) {
                localStorage.setItem(this.options.storageKeys.lastVersion, currentVersion);
            }
        } catch (e) {
            console.log('First launch check skipped:', e.message);
        }
    }

    /**
     * Should we check for updates?
     */
    shouldCheck() {
        const lastCheck = localStorage.getItem(this.options.storageKeys.lastCheck);
        if (!lastCheck) return true;
        return Date.now() - parseInt(lastCheck, 10) >= this.options.checkInterval;
    }

    /**
     * Load local version
     */
    async loadLocalVersion() {
        const response = await fetch(this.options.localVersionPath);
        if (!response.ok) throw new Error('Could not load local version');
        this.localVersion = await response.json();
        return this.localVersion;
    }

    /**
     * Check for updates from GitHub
     */
    async checkForUpdates() {
        if (this.isChecking) return;
        this.isChecking = true;

        try {
            // Load local version if not already loaded
            if (!this.localVersion) {
                await this.loadLocalVersion();
            }

            // Fetch latest release from GitHub API
            const response = await fetch(
                `${this.options.apiBase}/repos/${this.options.owner}/${this.options.repo}/releases/latest`,
                { headers: { 'Accept': 'application/vnd.github.v3+json' } }
            );

            if (!response.ok) {
                // No releases yet, try checking version.json directly
                await this.checkVersionFile();
                return;
            }

            this.remoteRelease = await response.json();

            // Parse version from tag (remove 'v' prefix if present)
            const remoteVersion = this.remoteRelease.tag_name.replace(/^v/, '');

            // Check if update available
            if (this.isNewerVersion(remoteVersion, this.localVersion.version)) {
                // Check if dismissed
                const dismissed = localStorage.getItem(this.options.storageKeys.dismissed);
                if (dismissed !== remoteVersion) {
                    this.showUpdateBanner();
                }
            }

            // Record check time
            localStorage.setItem(this.options.storageKeys.lastCheck, Date.now().toString());

        } catch (e) {
            console.log('Update check failed:', e.message);
            // Fall back to version.json check
            try {
                await this.checkVersionFile();
            } catch (e2) {
                console.log('Fallback check also failed:', e2.message);
            }
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * Fallback: Check version.json directly
     */
    async checkVersionFile() {
        const url = `${this.options.rawBase}/${this.options.owner}/${this.options.repo}/master/_app/config/version.json`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not fetch remote version');

        const remoteVersion = await response.json();

        if (this.isNewerVersion(remoteVersion.version, this.localVersion.version)) {
            const dismissed = localStorage.getItem(this.options.storageKeys.dismissed);
            if (dismissed !== remoteVersion.version) {
                // Create a pseudo-release object
                this.remoteRelease = {
                    tag_name: remoteVersion.version,
                    name: `Hexworth Prime ${remoteVersion.version}`,
                    body: remoteVersion.changelog || 'New version available!',
                    published_at: remoteVersion.releaseDate,
                    html_url: `https://github.com/${this.options.owner}/${this.options.repo}/releases`,
                    assets: []
                };
                this.showUpdateBanner();
            }
        }

        localStorage.setItem(this.options.storageKeys.lastCheck, Date.now().toString());
    }

    /**
     * Compare semver versions
     */
    isNewerVersion(remote, local) {
        const parseVer = (v) => v.split('.').map(n => parseInt(n, 10) || 0);
        const r = parseVer(remote);
        const l = parseVer(local);

        for (let i = 0; i < 3; i++) {
            if ((r[i] || 0) > (l[i] || 0)) return true;
            if ((r[i] || 0) < (l[i] || 0)) return false;
        }
        return false;
    }

    /**
     * Show the update notification banner
     */
    showUpdateBanner() {
        this.injectStyles();

        const version = this.remoteRelease.tag_name.replace(/^v/, '');
        const name = this.remoteRelease.name || `Version ${version}`;

        this.banner = document.createElement('div');
        this.banner.className = 'update-banner';
        this.banner.innerHTML = `
            <div class="update-banner-content">
                <div class="update-banner-icon">
                    <span class="update-pulse"></span>
                    <span class="update-icon-inner">⬆️</span>
                </div>
                <div class="update-banner-text">
                    <strong>Update Available</strong>
                    <span class="update-version">${name}</span>
                </div>
                <div class="update-banner-actions">
                    <button class="update-btn-details">View Details</button>
                    <button class="update-btn-dismiss" title="Remind me later">Later</button>
                </div>
            </div>
        `;

        // Event handlers
        this.banner.querySelector('.update-btn-details').addEventListener('click', () => {
            this.showUpdateModal();
        });

        this.banner.querySelector('.update-btn-dismiss').addEventListener('click', () => {
            this.dismissBanner();
        });

        document.body.appendChild(this.banner);

        // Animate in
        requestAnimationFrame(() => {
            this.banner.classList.add('visible');
        });
    }

    /**
     * Dismiss the banner
     */
    dismissBanner() {
        if (!this.banner) return;

        this.banner.classList.remove('visible');
        setTimeout(() => {
            this.banner?.remove();
            this.banner = null;
        }, 300);
    }

    /**
     * Show the full update modal
     */
    async showUpdateModal() {
        this.dismissBanner();
        this.injectStyles();

        const version = this.remoteRelease.tag_name.replace(/^v/, '');
        const releaseNotes = this.formatReleaseNotes(this.remoteRelease.body || '');
        const publishDate = this.remoteRelease.published_at
            ? new Date(this.remoteRelease.published_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            : 'Recently';

        // Find download asset (zip file)
        const zipAsset = this.remoteRelease.assets?.find(a => a.name.endsWith('.zip'));
        const downloadUrl = zipAsset?.browser_download_url ||
            `https://github.com/${this.options.owner}/${this.options.repo}/archive/refs/heads/master.zip`;

        this.modal = document.createElement('div');
        this.modal.className = 'update-modal-overlay';
        this.modal.innerHTML = `
            <div class="update-modal">
                <div class="update-modal-header">
                    <div class="update-modal-badge">UPDATE AVAILABLE</div>
                    <button class="update-modal-close" title="Close">×</button>
                </div>

                <div class="update-modal-hero">
                    <div class="update-modal-version">
                        <span class="version-current">${this.localVersion.version}</span>
                        <span class="version-arrow">→</span>
                        <span class="version-new">${version}</span>
                    </div>
                    <div class="update-modal-title">${this.remoteRelease.name || 'New Version'}</div>
                    <div class="update-modal-date">Released ${publishDate}</div>
                </div>

                <div class="update-modal-body">
                    <div class="update-section">
                        <h3>📋 What's New</h3>
                        <div class="update-notes">${releaseNotes}</div>
                    </div>

                    <div class="update-section update-backup-section">
                        <h3>💾 Backup Your Progress</h3>
                        <p>Before updating, we recommend saving your progress data.</p>
                        <button class="update-btn update-btn-backup" id="backupBtn">
                            <span class="btn-icon">📦</span>
                            <span class="btn-text">Export My Data</span>
                        </button>
                        <div class="backup-status" id="backupStatus"></div>
                    </div>
                </div>

                <div class="update-modal-footer">
                    <button class="update-btn update-btn-secondary" id="dismissBtn">
                        Not Now
                    </button>
                    <button class="update-btn update-btn-primary" id="downloadBtn">
                        <span class="btn-icon">⬇️</span>
                        <span class="btn-text">Download Update</span>
                    </button>
                </div>

                <div class="update-download-progress" id="downloadProgress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="progress-text" id="progressText">Preparing download...</div>
                </div>
            </div>
        `;

        // Event handlers
        this.modal.querySelector('.update-modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        this.modal.querySelector('#dismissBtn').addEventListener('click', () => {
            this.dismissUpdate();
        });

        this.modal.querySelector('#backupBtn').addEventListener('click', () => {
            this.exportUserData();
        });

        this.modal.querySelector('#downloadBtn').addEventListener('click', () => {
            this.startDownload(downloadUrl);
        });

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        document.body.appendChild(this.modal);

        // Animate in
        requestAnimationFrame(() => {
            this.modal.classList.add('visible');
        });

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Format release notes (markdown to HTML)
     */
    formatReleaseNotes(markdown) {
        if (!markdown || markdown.trim() === '') {
            return '<p>No release notes available.</p>';
        }

        // Simple markdown conversion
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h4>$1</h4>')
            .replace(/^## (.*$)/gim, '<h3>$1</h3>')
            .replace(/^# (.*$)/gim, '<h2>$1</h2>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Lists
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap lists
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

        // Wrap in paragraph if not already
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }

        return html;
    }

    /**
     * Export user data for backup
     */
    exportUserData() {
        const statusEl = document.getElementById('backupStatus');
        const btnEl = document.getElementById('backupBtn');

        try {
            // Collect all Hexworth-related localStorage data
            const userData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('hexworth_') || key.startsWith('dark_arts_') || key.startsWith('gate')) {
                    userData[key] = localStorage.getItem(key);
                }
            }

            // Create downloadable file
            const dataStr = JSON.stringify(userData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `hexworth-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Update UI
            btnEl.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Backup Saved!</span>';
            btnEl.classList.add('success');
            statusEl.innerHTML = `<span class="status-success">✓ ${Object.keys(userData).length} items backed up</span>`;

        } catch (e) {
            statusEl.innerHTML = `<span class="status-error">✗ Backup failed: ${e.message}</span>`;
        }
    }

    /**
     * Start the download process
     */
    startDownload(url) {
        const progressContainer = document.getElementById('downloadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const downloadBtn = document.getElementById('downloadBtn');

        // Show progress
        progressContainer.classList.add('visible');
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Downloading...</span>';

        // Animate progress (simulated since we can't track actual download)
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 90) {
                clearInterval(interval);
                progress = 90;
            }
            progressFill.style.width = progress + '%';
            progressText.textContent = `Downloading... ${Math.round(progress)}%`;
        }, 200);

        // Trigger actual download
        const a = document.createElement('a');
        a.href = url;
        a.download = '';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Complete the animation
        setTimeout(() => {
            clearInterval(interval);
            progressFill.style.width = '100%';
            progressText.textContent = 'Download started! Check your downloads folder.';
            downloadBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Downloaded!</span>';
            downloadBtn.classList.add('success');

            // Show instructions
            setTimeout(() => {
                this.showInstallInstructions();
            }, 1500);
        }, 2000);
    }

    /**
     * Show installation instructions
     */
    showInstallInstructions() {
        const modalBody = this.modal?.querySelector('.update-modal-body');
        if (!modalBody) return;

        const instructions = document.createElement('div');
        instructions.className = 'update-section update-instructions';
        instructions.innerHTML = `
            <h3>📖 Installation Instructions</h3>
            <ol class="install-steps">
                <li>
                    <span class="step-number">1</span>
                    <span class="step-text">Locate the downloaded ZIP file</span>
                </li>
                <li>
                    <span class="step-number">2</span>
                    <span class="step-text">Extract all files to a new folder</span>
                </li>
                <li>
                    <span class="step-number">3</span>
                    <span class="step-text">Open <code>START.html</code> in your browser</span>
                </li>
                <li>
                    <span class="step-number">4</span>
                    <span class="step-text">If you backed up your data, import it from Settings</span>
                </li>
            </ol>
            <p class="install-note">💡 Your browser may remember your progress automatically!</p>
        `;

        modalBody.appendChild(instructions);
        instructions.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Show What's New modal for new version
     */
    async showWhatsNew() {
        this.injectStyles();

        const version = this.localVersion.version;
        const codename = this.localVersion.codename || '';
        const changelog = this.localVersion.changelog || this.localVersion.features || [];

        this.modal = document.createElement('div');
        this.modal.className = 'update-modal-overlay whatsnew-modal';
        this.modal.innerHTML = `
            <div class="update-modal">
                <div class="whatsnew-header">
                    <div class="whatsnew-celebration">🎉</div>
                    <div class="whatsnew-title">Welcome to ${version}</div>
                    ${codename ? `<div class="whatsnew-codename">"${codename}"</div>` : ''}
                </div>

                <div class="update-modal-body">
                    <div class="whatsnew-intro">
                        Thanks for updating! Here's what's new:
                    </div>

                    <div class="whatsnew-features">
                        ${Array.isArray(changelog)
                            ? changelog.map(item => `
                                <div class="whatsnew-feature">
                                    <span class="feature-icon">${item.icon || '✨'}</span>
                                    <div class="feature-content">
                                        <div class="feature-title">${item.title || item}</div>
                                        ${item.description ? `<div class="feature-desc">${item.description}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')
                            : `<div class="whatsnew-text">${changelog}</div>`
                        }
                    </div>
                </div>

                <div class="update-modal-footer">
                    <button class="update-btn update-btn-primary" id="whatsNewContinue">
                        Let's Go! 🚀
                    </button>
                </div>
            </div>
        `;

        this.modal.querySelector('#whatsNewContinue').addEventListener('click', () => {
            localStorage.setItem(this.options.storageKeys.seenWhatsNew, version);
            this.closeModal();
        });

        document.body.appendChild(this.modal);

        requestAnimationFrame(() => {
            this.modal.classList.add('visible');
        });

        document.body.style.overflow = 'hidden';
    }

    /**
     * Dismiss update (remember this version)
     */
    dismissUpdate() {
        const version = this.remoteRelease?.tag_name?.replace(/^v/, '');
        if (version) {
            localStorage.setItem(this.options.storageKeys.dismissed, version);
        }
        this.closeModal();
    }

    /**
     * Close the modal
     */
    closeModal() {
        if (!this.modal) return;

        this.modal.classList.remove('visible');
        document.body.style.overflow = '';

        setTimeout(() => {
            this.modal?.remove();
            this.modal = null;
        }, 300);
    }

    /**
     * Force check for updates
     */
    async forceCheck() {
        localStorage.removeItem(this.options.storageKeys.lastCheck);
        localStorage.removeItem(this.options.storageKeys.dismissed);
        await this.checkForUpdates();

        if (!this.remoteRelease || !this.isNewerVersion(
            this.remoteRelease.tag_name.replace(/^v/, ''),
            this.localVersion.version
        )) {
            this.showUpToDateMessage();
        }
    }

    /**
     * Show "up to date" message
     */
    showUpToDateMessage() {
        this.injectStyles();

        const toast = document.createElement('div');
        toast.className = 'update-toast';
        toast.innerHTML = `
            <span class="toast-icon">✅</span>
            <span class="toast-text">You're up to date! (v${this.localVersion.version})</span>
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Inject all styles
     */
    injectStyles() {
        if (document.getElementById('update-manager-styles')) return;

        const style = document.createElement('style');
        style.id = 'update-manager-styles';
        style.textContent = `
            /* ===== UPDATE BANNER ===== */
            .update-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: ${this.options.zIndex};
                transform: translateY(-100%);
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .update-banner.visible {
                transform: translateY(0);
            }

            .update-banner-content {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 14px 24px;
                background: linear-gradient(135deg, #1a1425 0%, #2d1f3d 100%);
                border-bottom: 1px solid rgba(159, 122, 234, 0.3);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .update-banner-icon {
                position: relative;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .update-pulse {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(159, 122, 234, 0.3);
                animation: updatePulse 2s ease-in-out infinite;
            }

            @keyframes updatePulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.3); opacity: 0; }
            }

            .update-icon-inner {
                font-size: 1.4rem;
                z-index: 1;
            }

            .update-banner-text {
                flex: 1;
                color: #e8d5f5;
                font-family: 'Segoe UI', sans-serif;
            }

            .update-banner-text strong {
                display: block;
                font-size: 0.9rem;
                margin-bottom: 2px;
            }

            .update-version {
                font-size: 0.8rem;
                color: #9f7aea;
            }

            .update-banner-actions {
                display: flex;
                gap: 10px;
            }

            .update-btn-details {
                padding: 8px 20px;
                background: linear-gradient(135deg, #9f7aea, #805ad5);
                border: none;
                border-radius: 6px;
                color: white;
                font-size: 0.85rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .update-btn-details:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(159, 122, 234, 0.4);
            }

            .update-btn-dismiss {
                padding: 8px 16px;
                background: transparent;
                border: 1px solid rgba(159, 122, 234, 0.3);
                border-radius: 6px;
                color: #a89aba;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .update-btn-dismiss:hover {
                border-color: rgba(159, 122, 234, 0.6);
                color: #e8d5f5;
            }

            /* ===== UPDATE MODAL ===== */
            .update-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: ${this.options.zIndex + 1};
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: 20px;
            }

            .update-modal-overlay.visible {
                opacity: 1;
            }

            .update-modal {
                background: linear-gradient(180deg, #1e1a2e 0%, #151020 100%);
                border: 1px solid rgba(159, 122, 234, 0.2);
                border-radius: 16px;
                max-width: 520px;
                width: 100%;
                max-height: 85vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                transform: translateY(20px) scale(0.95);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .update-modal-overlay.visible .update-modal {
                transform: translateY(0) scale(1);
            }

            .update-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid rgba(159, 122, 234, 0.1);
            }

            .update-modal-badge {
                font-size: 0.65rem;
                font-weight: 600;
                letter-spacing: 0.15em;
                color: #9f7aea;
                padding: 4px 12px;
                background: rgba(159, 122, 234, 0.15);
                border-radius: 20px;
            }

            .update-modal-close {
                width: 32px;
                height: 32px;
                border: none;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                color: #8a7a9a;
                font-size: 1.4rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .update-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .update-modal-hero {
                text-align: center;
                padding: 30px 20px;
                background: linear-gradient(180deg, rgba(159, 122, 234, 0.1) 0%, transparent 100%);
            }

            .update-modal-version {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 15px;
            }

            .version-current {
                font-size: 1.1rem;
                color: #6a5a7a;
                font-family: 'Courier New', monospace;
            }

            .version-arrow {
                font-size: 1.2rem;
                color: #9f7aea;
                animation: arrowPulse 1.5s ease-in-out infinite;
            }

            @keyframes arrowPulse {
                0%, 100% { opacity: 0.5; transform: translateX(0); }
                50% { opacity: 1; transform: translateX(3px); }
            }

            .version-new {
                font-size: 1.4rem;
                font-weight: 600;
                color: #e8d5f5;
                font-family: 'Courier New', monospace;
            }

            .update-modal-title {
                font-size: 1.5rem;
                font-weight: 300;
                color: #fff;
                margin-bottom: 8px;
            }

            .update-modal-date {
                font-size: 0.8rem;
                color: #6a5a7a;
            }

            .update-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
            }

            .update-section {
                margin-bottom: 25px;
            }

            .update-section h3 {
                font-size: 0.9rem;
                font-weight: 500;
                color: #c4b5d4;
                margin-bottom: 12px;
            }

            .update-notes {
                font-size: 0.85rem;
                color: #a89aba;
                line-height: 1.7;
            }

            .update-notes h2, .update-notes h3, .update-notes h4 {
                color: #c4b5d4;
                margin: 15px 0 10px;
            }

            .update-notes ul {
                padding-left: 20px;
                margin: 10px 0;
            }

            .update-notes li {
                margin: 6px 0;
            }

            .update-notes code {
                background: rgba(159, 122, 234, 0.2);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.85em;
            }

            .update-backup-section {
                background: rgba(159, 122, 234, 0.05);
                border: 1px solid rgba(159, 122, 234, 0.15);
                border-radius: 12px;
                padding: 20px;
            }

            .update-backup-section p {
                font-size: 0.85rem;
                color: #a89aba;
                margin-bottom: 15px;
            }

            .update-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .update-btn-backup {
                background: rgba(159, 122, 234, 0.2);
                border: 1px solid rgba(159, 122, 234, 0.3);
                color: #c4b5d4;
            }

            .update-btn-backup:hover {
                background: rgba(159, 122, 234, 0.3);
            }

            .update-btn-backup.success {
                background: rgba(72, 187, 120, 0.2);
                border-color: rgba(72, 187, 120, 0.3);
                color: #68d391;
            }

            .backup-status {
                margin-top: 10px;
                font-size: 0.8rem;
            }

            .status-success { color: #68d391; }
            .status-error { color: #fc8181; }

            .update-modal-footer {
                display: flex;
                gap: 12px;
                padding: 20px;
                border-top: 1px solid rgba(159, 122, 234, 0.1);
                justify-content: flex-end;
            }

            .update-btn-secondary {
                background: transparent;
                border: 1px solid rgba(159, 122, 234, 0.3);
                color: #a89aba;
            }

            .update-btn-secondary:hover {
                border-color: rgba(159, 122, 234, 0.5);
                color: #c4b5d4;
            }

            .update-btn-primary {
                background: linear-gradient(135deg, #9f7aea, #805ad5);
                color: white;
            }

            .update-btn-primary:hover:not(:disabled) {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(159, 122, 234, 0.4);
            }

            .update-btn-primary:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }

            .update-btn-primary.success {
                background: linear-gradient(135deg, #48bb78, #38a169);
            }

            /* Download Progress */
            .update-download-progress {
                padding: 0 20px 20px;
                display: none;
            }

            .update-download-progress.visible {
                display: block;
            }

            .progress-bar {
                height: 6px;
                background: rgba(159, 122, 234, 0.2);
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .progress-fill {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, #9f7aea, #805ad5);
                border-radius: 3px;
                transition: width 0.3s ease;
            }

            .progress-text {
                font-size: 0.8rem;
                color: #a89aba;
                text-align: center;
            }

            /* Installation Instructions */
            .update-instructions {
                background: rgba(72, 187, 120, 0.05);
                border: 1px solid rgba(72, 187, 120, 0.2);
                border-radius: 12px;
                padding: 20px;
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .install-steps {
                list-style: none;
                padding: 0;
                margin: 15px 0;
            }

            .install-steps li {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 12px 0;
                border-bottom: 1px solid rgba(159, 122, 234, 0.1);
            }

            .install-steps li:last-child {
                border-bottom: none;
            }

            .step-number {
                width: 28px;
                height: 28px;
                background: rgba(159, 122, 234, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                font-weight: 600;
                color: #9f7aea;
            }

            .step-text {
                color: #c4b5d4;
                font-size: 0.9rem;
            }

            .step-text code {
                background: rgba(159, 122, 234, 0.2);
                padding: 2px 8px;
                border-radius: 4px;
            }

            .install-note {
                font-size: 0.85rem;
                color: #68d391;
                margin-top: 10px;
            }

            /* ===== WHAT'S NEW MODAL ===== */
            .whatsnew-modal .update-modal {
                text-align: center;
            }

            .whatsnew-header {
                padding: 40px 20px 30px;
                background: linear-gradient(180deg, rgba(159, 122, 234, 0.15) 0%, transparent 100%);
            }

            .whatsnew-celebration {
                font-size: 4rem;
                animation: celebrate 1s ease;
            }

            @keyframes celebrate {
                0% { transform: scale(0); }
                50% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            .whatsnew-title {
                font-size: 1.8rem;
                font-weight: 300;
                color: #fff;
                margin: 15px 0 5px;
            }

            .whatsnew-codename {
                font-size: 1rem;
                color: #9f7aea;
                font-style: italic;
            }

            .whatsnew-intro {
                font-size: 0.95rem;
                color: #a89aba;
                margin-bottom: 20px;
            }

            .whatsnew-features {
                text-align: left;
            }

            .whatsnew-feature {
                display: flex;
                gap: 15px;
                padding: 15px;
                background: rgba(159, 122, 234, 0.05);
                border-radius: 10px;
                margin-bottom: 10px;
            }

            .feature-icon {
                font-size: 1.5rem;
            }

            .feature-content {
                flex: 1;
            }

            .feature-title {
                font-weight: 500;
                color: #e8d5f5;
                margin-bottom: 4px;
            }

            .feature-desc {
                font-size: 0.85rem;
                color: #8a7a9a;
            }

            /* ===== TOAST ===== */
            .update-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: rgba(30, 26, 46, 0.95);
                border: 1px solid rgba(159, 122, 234, 0.3);
                border-radius: 10px;
                padding: 14px 24px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: ${this.options.zIndex};
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .update-toast.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            .toast-icon {
                font-size: 1.2rem;
            }

            .toast-text {
                color: #c4b5d4;
                font-size: 0.9rem;
            }

            /* ===== MATRIX THEME ===== */
            [data-theme="matrix"] .update-banner-content,
            [data-theme="matrix"] .update-modal {
                background: linear-gradient(180deg, #0a140f 0%, #061008 100%);
            }

            [data-theme="matrix"] .update-banner-content {
                border-color: rgba(0, 255, 65, 0.3);
            }

            [data-theme="matrix"] .update-modal {
                border-color: rgba(0, 255, 65, 0.2);
            }

            [data-theme="matrix"] .update-modal-badge,
            [data-theme="matrix"] .version-arrow,
            [data-theme="matrix"] .whatsnew-codename {
                color: #00ff41;
            }

            [data-theme="matrix"] .update-btn-primary {
                background: linear-gradient(135deg, #00ff41, #00aa2a);
            }

            [data-theme="matrix"] .progress-fill {
                background: linear-gradient(90deg, #00ff41, #00aa2a);
            }

            /* ===== RESPONSIVE ===== */
            @media (max-width: 600px) {
                .update-banner-content {
                    flex-wrap: wrap;
                    padding: 12px 16px;
                }

                .update-banner-text {
                    flex-basis: calc(100% - 60px);
                }

                .update-banner-actions {
                    flex-basis: 100%;
                    margin-top: 10px;
                }

                .update-modal {
                    max-height: 95vh;
                    border-radius: 12px;
                }

                .update-modal-hero {
                    padding: 20px 15px;
                }

                .update-modal-body {
                    padding: 15px;
                }

                .update-modal-footer {
                    flex-direction: column;
                }

                .update-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            localVersion: this.localVersion,
            remoteRelease: this.remoteRelease,
            updateAvailable: this.remoteRelease ?
                this.isNewerVersion(
                    this.remoteRelease.tag_name.replace(/^v/, ''),
                    this.localVersion?.version || '0.0.0'
                ) : false
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpdateManager;
}
