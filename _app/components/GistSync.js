/**
 * GistSync.js - Cloud Progress Sync via GitHub Gists
 *
 * Enables cloud backup and cross-device sync of Hexworth Prime progress
 * using GitHub Gists as free, private storage.
 *
 * Features:
 * - Export all progress to a private Gist
 * - Import progress from existing Gist
 * - Auto-sync with conflict detection
 * - Versioned backups with history
 * - Selective sync (choose what to sync)
 *
 * Usage:
 *   const sync = new GistSync(githubAuth);
 *   await sync.backup();              // Create/update backup
 *   await sync.restore();             // Restore from cloud
 *   await sync.getStatus();           // Check sync status
 *
 * @requires GitHubAuth.js
 * @author Hexworth Prime
 * @version 1.0.0
 */

class GistSync {
    constructor(githubAuth, options = {}) {
        this.auth = githubAuth;
        this.options = {
            gistDescription: 'Hexworth Prime Progress Backup',
            fileName: 'hexworth-progress.json',
            autoSync: options.autoSync || false,
            syncInterval: options.syncInterval || 300000, // 5 minutes
            ...options
        };

        // Storage keys
        this.storageKeys = {
            gistId: 'hexworth_sync_gist_id',
            lastSync: 'hexworth_sync_last',
            syncEnabled: 'hexworth_sync_enabled'
        };

        // Gist API endpoint
        this.gistEndpoint = 'https://api.github.com/gists';

        // Data keys to sync
        this.syncKeys = [
            'hexworth_house',
            'hexworth_progress',
            'hexworth_streak',
            'hexworth_last_visit',
            'hexworth_first_visit',
            'hexworth_achievements',
            'hexworth_theme',
            'hexworth_sound_enabled',
            'hexworth_firefly_density',
            'hexworth_effects_enabled',
            // Dark Arts progress
            'dark_arts_gate1_complete',
            'dark_arts_gate2_complete',
            'dark_arts_gate3_complete',
            'dark_arts_gate4_complete',
            'dark_arts_gate5_complete',
            'gate1_answer',
            'gate2_answer',
            'gate3_answer',
            'gate4_answer',
            'gate5_answer'
        ];

        // Event callbacks
        this.onSyncStart = options.onSyncStart || (() => {});
        this.onSyncComplete = options.onSyncComplete || (() => {});
        this.onSyncError = options.onSyncError || console.error;
        this.onConflict = options.onConflict || null;

        // Auto-sync setup
        if (this.options.autoSync && this.isEnabled()) {
            this.startAutoSync();
        }
    }

    /**
     * Check if sync is enabled
     */
    isEnabled() {
        return localStorage.getItem(this.storageKeys.syncEnabled) === 'true';
    }

    /**
     * Enable sync
     */
    enable() {
        localStorage.setItem(this.storageKeys.syncEnabled, 'true');
        if (this.options.autoSync) {
            this.startAutoSync();
        }
    }

    /**
     * Disable sync
     */
    disable() {
        localStorage.setItem(this.storageKeys.syncEnabled, 'false');
        this.stopAutoSync();
    }

    /**
     * Get the stored Gist ID
     */
    getGistId() {
        return localStorage.getItem(this.storageKeys.gistId);
    }

    /**
     * Set the Gist ID
     */
    setGistId(id) {
        localStorage.setItem(this.storageKeys.gistId, id);
    }

    /**
     * Collect all progress data for backup
     */
    collectProgressData() {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            username: localStorage.getItem('hexworth_username'),
            data: {}
        };

        for (const key of this.syncKeys) {
            const value = localStorage.getItem(key);
            if (value !== null) {
                // Try to parse JSON values
                try {
                    data.data[key] = JSON.parse(value);
                } catch {
                    data.data[key] = value;
                }
            }
        }

        // Also include house-specific rank data
        const houses = ['web', 'shield', 'cloud', 'forge', 'script', 'code', 'key', 'eye', 'dark-arts'];
        for (const house of houses) {
            const rankKey = `hexworth_rank_${house}`;
            const rankData = localStorage.getItem(rankKey);
            if (rankData) {
                try {
                    data.data[rankKey] = JSON.parse(rankData);
                } catch {
                    data.data[rankKey] = rankData;
                }
            }
        }

        return data;
    }

    /**
     * Apply progress data from backup
     */
    applyProgressData(data, merge = false) {
        if (!data || !data.data) {
            throw new Error('Invalid backup data');
        }

        const applied = [];
        const skipped = [];

        for (const [key, value] of Object.entries(data.data)) {
            // Skip if merge mode and local has newer data
            if (merge) {
                const localValue = localStorage.getItem(key);
                if (localValue !== null) {
                    skipped.push(key);
                    continue;
                }
            }

            // Store value (stringify objects)
            if (typeof value === 'object' && value !== null) {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, value);
            }
            applied.push(key);
        }

        return { applied, skipped };
    }

    /**
     * Create a new Gist with progress data
     */
    async createGist(isPublic = false) {
        const token = this.auth.getToken();
        if (!token) {
            throw new Error('Not authenticated with GitHub');
        }

        const progressData = this.collectProgressData();

        const response = await fetch(this.gistEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: this.options.gistDescription,
                public: isPublic,
                files: {
                    [this.options.fileName]: {
                        content: JSON.stringify(progressData, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create Gist');
        }

        const gist = await response.json();
        this.setGistId(gist.id);
        localStorage.setItem(this.storageKeys.lastSync, new Date().toISOString());

        return gist;
    }

    /**
     * Update existing Gist with current progress
     */
    async updateGist(gistId) {
        const token = this.auth.getToken();
        if (!token) {
            throw new Error('Not authenticated with GitHub');
        }

        const progressData = this.collectProgressData();

        const response = await fetch(`${this.gistEndpoint}/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: {
                    [this.options.fileName]: {
                        content: JSON.stringify(progressData, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Gist was deleted, create new one
                localStorage.removeItem(this.storageKeys.gistId);
                return this.createGist();
            }
            const error = await response.json();
            throw new Error(error.message || 'Failed to update Gist');
        }

        const gist = await response.json();
        localStorage.setItem(this.storageKeys.lastSync, new Date().toISOString());

        return gist;
    }

    /**
     * Fetch Gist data
     */
    async fetchGist(gistId) {
        const token = this.auth.getToken();
        if (!token) {
            throw new Error('Not authenticated with GitHub');
        }

        const response = await fetch(`${this.gistEndpoint}/${gistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Backup not found - it may have been deleted');
            }
            throw new Error('Failed to fetch backup');
        }

        const gist = await response.json();
        const file = gist.files[this.options.fileName];

        if (!file) {
            throw new Error('Backup file not found in Gist');
        }

        return {
            gist,
            data: JSON.parse(file.content)
        };
    }

    /**
     * Backup progress to cloud
     */
    async backup() {
        this.onSyncStart('backup');

        try {
            const existingGistId = this.getGistId();
            let result;

            if (existingGistId) {
                result = await this.updateGist(existingGistId);
            } else {
                result = await this.createGist();
            }

            this.onSyncComplete('backup', result);
            return result;

        } catch (error) {
            this.onSyncError('backup', error);
            throw error;
        }
    }

    /**
     * Restore progress from cloud
     */
    async restore(options = {}) {
        const { merge = false, gistId = null } = options;

        this.onSyncStart('restore');

        try {
            const targetGistId = gistId || this.getGistId();

            if (!targetGistId) {
                throw new Error('No backup found. Please backup first or provide a Gist ID.');
            }

            const { data } = await this.fetchGist(targetGistId);

            // Check for conflicts
            if (this.onConflict && !merge) {
                const localData = this.collectProgressData();
                const hasConflict = this.detectConflict(localData, data);

                if (hasConflict) {
                    const resolution = await this.onConflict(localData, data);
                    if (resolution === 'cancel') {
                        throw new Error('Restore cancelled by user');
                    }
                    if (resolution === 'merge') {
                        options.merge = true;
                    }
                }
            }

            const result = this.applyProgressData(data, merge);
            localStorage.setItem(this.storageKeys.lastSync, new Date().toISOString());

            if (gistId && gistId !== this.getGistId()) {
                this.setGistId(gistId);
            }

            this.onSyncComplete('restore', result);
            return result;

        } catch (error) {
            this.onSyncError('restore', error);
            throw error;
        }
    }

    /**
     * Detect conflicts between local and cloud data
     */
    detectConflict(localData, cloudData) {
        // Check if both have progress data
        const localHasProgress = Object.keys(localData.data).length > 0;
        const cloudHasProgress = Object.keys(cloudData.data).length > 0;

        if (!localHasProgress || !cloudHasProgress) {
            return false;
        }

        // Check for differing house assignments
        if (localData.data.hexworth_house !== cloudData.data.hexworth_house) {
            return true;
        }

        // Check for differing progress
        const localProgress = localData.data.hexworth_progress || {};
        const cloudProgress = cloudData.data.hexworth_progress || {};

        for (const key of Object.keys(localProgress)) {
            if (cloudProgress[key] && cloudProgress[key] !== localProgress[key]) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get sync status
     */
    async getStatus() {
        const gistId = this.getGistId();
        const lastSync = localStorage.getItem(this.storageKeys.lastSync);
        const isEnabled = this.isEnabled();
        const isAuthenticated = this.auth.isAuthenticated;

        const status = {
            enabled: isEnabled,
            authenticated: isAuthenticated,
            hasBackup: !!gistId,
            gistId: gistId,
            lastSync: lastSync ? new Date(lastSync) : null,
            gistUrl: gistId ? `https://gist.github.com/${gistId}` : null
        };

        // Fetch cloud status if available
        if (gistId && isAuthenticated) {
            try {
                const { gist, data } = await this.fetchGist(gistId);
                status.cloudData = {
                    exportedAt: data.exportedAt,
                    updatedAt: gist.updated_at,
                    username: data.username,
                    keyCount: Object.keys(data.data).length
                };
            } catch (error) {
                status.cloudError = error.message;
            }
        }

        return status;
    }

    /**
     * List user's Hexworth backup Gists
     */
    async listBackups() {
        const token = this.auth.getToken();
        if (!token) {
            throw new Error('Not authenticated with GitHub');
        }

        const response = await fetch(`${this.gistEndpoint}?per_page=100`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch Gists');
        }

        const gists = await response.json();

        // Filter for Hexworth backups
        return gists.filter(gist =>
            gist.description.includes('Hexworth') ||
            gist.files[this.options.fileName]
        ).map(gist => ({
            id: gist.id,
            description: gist.description,
            createdAt: gist.created_at,
            updatedAt: gist.updated_at,
            url: gist.html_url,
            isPublic: gist.public
        }));
    }

    /**
     * Delete a backup Gist
     */
    async deleteBackup(gistId) {
        const token = this.auth.getToken();
        if (!token) {
            throw new Error('Not authenticated with GitHub');
        }

        const response = await fetch(`${this.gistEndpoint}/${gistId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete backup');
        }

        // Clear local reference if this was the active backup
        if (this.getGistId() === gistId) {
            localStorage.removeItem(this.storageKeys.gistId);
            localStorage.removeItem(this.storageKeys.lastSync);
        }

        return true;
    }

    /**
     * Start auto-sync interval
     */
    startAutoSync() {
        if (this.autoSyncInterval) return;

        this.autoSyncInterval = setInterval(async () => {
            if (this.isEnabled() && this.auth.isAuthenticated) {
                try {
                    await this.backup();
                } catch (error) {
                    console.error('Auto-sync failed:', error);
                }
            }
        }, this.options.syncInterval);
    }

    /**
     * Stop auto-sync interval
     */
    stopAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
        }
    }

    /**
     * Show sync settings modal
     */
    showSyncModal() {
        const overlay = document.createElement('div');
        overlay.className = 'gist-sync-overlay';
        overlay.innerHTML = `
            <div class="gist-sync-modal">
                <button class="modal-close">×</button>
                <div class="modal-header">
                    <h2>☁️ Cloud Sync</h2>
                    <p class="sync-subtitle">Backup your progress to GitHub</p>
                </div>
                <div class="modal-content">
                    <div class="sync-status">
                        <div class="status-loading">
                            <div class="spinner"></div>
                            <span>Checking sync status...</span>
                        </div>
                        <div class="status-info" style="display: none;">
                            <div class="status-row">
                                <span class="status-label">Status</span>
                                <span class="status-value sync-status-badge"></span>
                            </div>
                            <div class="status-row">
                                <span class="status-label">Last Sync</span>
                                <span class="status-value last-sync-time"></span>
                            </div>
                            <div class="status-row backup-link-row" style="display: none;">
                                <span class="status-label">Backup</span>
                                <a class="status-value backup-link" href="" target="_blank">View on GitHub</a>
                            </div>
                        </div>
                    </div>
                    <div class="sync-actions">
                        <button class="sync-btn backup-btn">
                            <span class="btn-icon">⬆️</span>
                            <span class="btn-text">Backup Now</span>
                        </button>
                        <button class="sync-btn restore-btn">
                            <span class="btn-icon">⬇️</span>
                            <span class="btn-text">Restore</span>
                        </button>
                    </div>
                    <div class="sync-message" style="display: none;"></div>
                    <div class="sync-options">
                        <label class="option-toggle">
                            <input type="checkbox" class="auto-sync-toggle">
                            <span>Auto-sync every 5 minutes</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="import-section">
                        <span>Have a backup ID? </span>
                        <button class="import-btn">Import from Gist</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Elements
        const statusLoading = overlay.querySelector('.status-loading');
        const statusInfo = overlay.querySelector('.status-info');
        const statusBadge = overlay.querySelector('.sync-status-badge');
        const lastSyncTime = overlay.querySelector('.last-sync-time');
        const backupLinkRow = overlay.querySelector('.backup-link-row');
        const backupLink = overlay.querySelector('.backup-link');
        const backupBtn = overlay.querySelector('.backup-btn');
        const restoreBtn = overlay.querySelector('.restore-btn');
        const syncMessage = overlay.querySelector('.sync-message');
        const autoSyncToggle = overlay.querySelector('.auto-sync-toggle');
        const importBtn = overlay.querySelector('.import-btn');

        // Close handler
        const close = () => overlay.remove();
        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Show message helper
        const showMessage = (text, type = 'info') => {
            syncMessage.textContent = text;
            syncMessage.className = `sync-message ${type}`;
            syncMessage.style.display = 'block';
            setTimeout(() => syncMessage.style.display = 'none', 4000);
        };

        // Load status
        const loadStatus = async () => {
            try {
                const status = await this.getStatus();

                statusLoading.style.display = 'none';
                statusInfo.style.display = 'block';

                if (!status.authenticated) {
                    statusBadge.textContent = 'Not signed in';
                    statusBadge.className = 'status-value sync-status-badge status-warning';
                    backupBtn.disabled = true;
                    restoreBtn.disabled = true;
                } else if (status.hasBackup) {
                    statusBadge.textContent = 'Synced';
                    statusBadge.className = 'status-value sync-status-badge status-success';
                    lastSyncTime.textContent = status.lastSync
                        ? this.formatTimeAgo(status.lastSync)
                        : 'Never';
                    backupLinkRow.style.display = 'flex';
                    backupLink.href = status.gistUrl;
                } else {
                    statusBadge.textContent = 'No backup';
                    statusBadge.className = 'status-value sync-status-badge status-neutral';
                    lastSyncTime.textContent = 'Never';
                }

                autoSyncToggle.checked = status.enabled;

            } catch (error) {
                statusLoading.innerHTML = `<span class="error">Error: ${error.message}</span>`;
            }
        };

        // Backup handler
        backupBtn.addEventListener('click', async () => {
            backupBtn.disabled = true;
            backupBtn.querySelector('.btn-text').textContent = 'Backing up...';

            try {
                await this.backup();
                showMessage('Backup complete!', 'success');
                loadStatus();
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                backupBtn.disabled = false;
                backupBtn.querySelector('.btn-text').textContent = 'Backup Now';
            }
        });

        // Restore handler
        restoreBtn.addEventListener('click', async () => {
            if (!confirm('This will replace your local progress with the cloud backup. Continue?')) {
                return;
            }

            restoreBtn.disabled = true;
            restoreBtn.querySelector('.btn-text').textContent = 'Restoring...';

            try {
                const result = await this.restore();
                showMessage(`Restored ${result.applied.length} items!`, 'success');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                showMessage(error.message, 'error');
            } finally {
                restoreBtn.disabled = false;
                restoreBtn.querySelector('.btn-text').textContent = 'Restore';
            }
        });

        // Auto-sync toggle
        autoSyncToggle.addEventListener('change', () => {
            if (autoSyncToggle.checked) {
                this.enable();
                showMessage('Auto-sync enabled', 'success');
            } else {
                this.disable();
                showMessage('Auto-sync disabled', 'info');
            }
        });

        // Import handler
        importBtn.addEventListener('click', () => {
            const gistId = prompt('Enter the Gist ID from your backup URL:\n(e.g., https://gist.github.com/abc123 → abc123)');
            if (gistId) {
                this.restore({ gistId: gistId.trim() })
                    .then(result => {
                        showMessage(`Imported ${result.applied.length} items!`, 'success');
                        setTimeout(() => window.location.reload(), 1500);
                    })
                    .catch(error => showMessage(error.message, 'error'));
            }
        });

        // Initial load
        loadStatus();
    }

    /**
     * Format time ago for display
     */
    formatTimeAgo(date) {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    }

    /**
     * Get CSS styles for sync components
     */
    static getStyles() {
        return `
            /* Gist Sync Styles */
            .gist-sync-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(4px);
            }

            .gist-sync-modal {
                background: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 30px;
                width: 90%;
                max-width: 420px;
                position: relative;
            }

            .gist-sync-modal .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #8b949e;
                font-size: 24px;
                cursor: pointer;
            }

            .gist-sync-modal .modal-header {
                text-align: center;
                margin-bottom: 25px;
            }

            .gist-sync-modal h2 {
                color: #e6edf3;
                font-size: 22px;
                margin: 0 0 8px;
            }

            .sync-subtitle {
                color: #8b949e;
                font-size: 14px;
                margin: 0;
            }

            /* Status Section */
            .sync-status {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid #30363d;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }

            .status-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                color: #8b949e;
                padding: 10px;
            }

            .status-loading .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #30363d;
                border-top-color: #58a6ff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .status-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
            }

            .status-row:not(:last-child) {
                border-bottom: 1px solid #21262d;
            }

            .status-label {
                color: #8b949e;
                font-size: 13px;
            }

            .status-value {
                color: #e6edf3;
                font-size: 13px;
            }

            .sync-status-badge {
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
            }

            .sync-status-badge.status-success {
                background: rgba(35, 134, 54, 0.2);
                color: #3fb950;
            }

            .sync-status-badge.status-warning {
                background: rgba(187, 128, 9, 0.2);
                color: #d29922;
            }

            .sync-status-badge.status-neutral {
                background: rgba(139, 148, 158, 0.2);
                color: #8b949e;
            }

            .backup-link {
                color: #58a6ff;
                text-decoration: none;
            }

            .backup-link:hover {
                text-decoration: underline;
            }

            /* Action Buttons */
            .sync-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 15px;
            }

            .sync-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 16px;
                background: #21262d;
                border: 1px solid #30363d;
                border-radius: 8px;
                color: #e6edf3;
                cursor: pointer;
                transition: all 0.2s;
            }

            .sync-btn:hover:not(:disabled) {
                background: #30363d;
                border-color: #58a6ff;
            }

            .sync-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .sync-btn .btn-icon {
                font-size: 24px;
            }

            .sync-btn .btn-text {
                font-size: 13px;
                font-weight: 500;
            }

            /* Message */
            .sync-message {
                padding: 10px 15px;
                border-radius: 6px;
                font-size: 13px;
                text-align: center;
                margin-bottom: 15px;
            }

            .sync-message.success {
                background: rgba(35, 134, 54, 0.2);
                color: #3fb950;
            }

            .sync-message.error {
                background: rgba(248, 81, 73, 0.2);
                color: #f85149;
            }

            .sync-message.info {
                background: rgba(88, 166, 255, 0.2);
                color: #58a6ff;
            }

            /* Options */
            .sync-options {
                padding: 10px 0;
            }

            .option-toggle {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #8b949e;
                font-size: 13px;
                cursor: pointer;
            }

            .option-toggle input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: #58a6ff;
            }

            /* Footer */
            .gist-sync-modal .modal-footer {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #30363d;
                text-align: center;
            }

            .import-section {
                color: #8b949e;
                font-size: 13px;
            }

            .import-btn {
                background: none;
                border: none;
                color: #58a6ff;
                cursor: pointer;
                font-size: 13px;
            }

            .import-btn:hover {
                text-decoration: underline;
            }
        `;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GistSync;
}
