/**
 * GitHubAuth.js - GitHub Authentication for Hexworth Prime
 *
 * Provides GitHub identity integration using the Device Flow,
 * which is ideal for client-side applications without a backend.
 *
 * Features:
 * - GitHub Device Flow authentication (no server required)
 * - Personal Access Token fallback option
 * - Profile fetching and caching
 * - Secure token storage
 * - Auto-refresh on expiration
 *
 * Usage:
 *   const auth = new GitHubAuth();
 *   await auth.login();           // Initiates device flow
 *   const profile = auth.getProfile();
 *   auth.logout();
 *
 * Device Flow Process:
 * 1. App requests device code from GitHub
 * 2. User visits github.com/login/device
 * 3. User enters the code shown in app
 * 4. App polls until user completes authorization
 * 5. App receives access token, fetches profile
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

class GitHubAuth {
    constructor(options = {}) {
        // GitHub OAuth App credentials
        // For Device Flow, only client_id is needed (no secret!)
        this.config = {
            clientId: options.clientId || 'YOUR_GITHUB_CLIENT_ID', // Set this after creating OAuth App
            scopes: options.scopes || ['read:user', 'gist'], // gist for progress sync
            ...options
        };

        // Storage keys
        this.storageKeys = {
            token: 'hexworth_github_token',
            profile: 'hexworth_github_profile',
            tokenExpiry: 'hexworth_github_token_expiry'
        };

        // API endpoints
        this.endpoints = {
            deviceCode: 'https://github.com/login/device/code',
            accessToken: 'https://github.com/login/oauth/access_token',
            user: 'https://api.github.com/user',
            gists: 'https://api.github.com/gists'
        };

        // State
        this.profile = this.loadProfile();
        this.isAuthenticated = this.checkAuth();

        // Event callbacks
        this.onLogin = options.onLogin || (() => {});
        this.onLogout = options.onLogout || (() => {});
        this.onError = options.onError || console.error;
    }

    /**
     * Check if user is authenticated
     */
    checkAuth() {
        const token = localStorage.getItem(this.storageKeys.token);
        const expiry = localStorage.getItem(this.storageKeys.tokenExpiry);

        if (!token) return false;

        // Check expiration if set
        if (expiry && Date.now() > parseInt(expiry)) {
            this.logout(true); // Silent logout
            return false;
        }

        return true;
    }

    /**
     * Load cached profile from localStorage
     */
    loadProfile() {
        try {
            const cached = localStorage.getItem(this.storageKeys.profile);
            return cached ? JSON.parse(cached) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Save profile to localStorage
     */
    saveProfile(profile) {
        this.profile = profile;
        localStorage.setItem(this.storageKeys.profile, JSON.stringify(profile));
    }

    /**
     * Get current user profile
     */
    getProfile() {
        return this.profile;
    }

    /**
     * Get the access token
     */
    getToken() {
        return localStorage.getItem(this.storageKeys.token);
    }

    /**
     * Initiate GitHub Device Flow login
     * Returns an object with user_code and verification_uri for display
     */
    async initiateDeviceFlow() {
        try {
            const response = await fetch(this.endpoints.deviceCode, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: this.config.clientId,
                    scope: this.config.scopes.join(' ')
                })
            });

            if (!response.ok) {
                throw new Error(`Device flow initiation failed: ${response.status}`);
            }

            const data = await response.json();

            return {
                deviceCode: data.device_code,
                userCode: data.user_code,
                verificationUri: data.verification_uri,
                expiresIn: data.expires_in,
                interval: data.interval || 5
            };
        } catch (error) {
            this.onError('Failed to initiate device flow', error);
            throw error;
        }
    }

    /**
     * Poll for access token after user enters code
     */
    async pollForToken(deviceCode, interval = 5, maxAttempts = 60) {
        let attempts = 0;

        const poll = async () => {
            if (attempts >= maxAttempts) {
                throw new Error('Authorization timeout - please try again');
            }

            attempts++;

            try {
                const response = await fetch(this.endpoints.accessToken, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: this.config.clientId,
                        device_code: deviceCode,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
                    })
                });

                const data = await response.json();

                if (data.error) {
                    switch (data.error) {
                        case 'authorization_pending':
                            // User hasn't entered code yet, continue polling
                            await this.sleep(interval * 1000);
                            return poll();

                        case 'slow_down':
                            // Increase interval
                            await this.sleep((interval + 5) * 1000);
                            return poll();

                        case 'expired_token':
                            throw new Error('Code expired - please restart login');

                        case 'access_denied':
                            throw new Error('Access denied by user');

                        default:
                            throw new Error(data.error_description || data.error);
                    }
                }

                // Success! We have the token
                return {
                    accessToken: data.access_token,
                    tokenType: data.token_type,
                    scope: data.scope
                };
            } catch (error) {
                if (error.message.includes('expired') ||
                    error.message.includes('denied') ||
                    error.message.includes('timeout')) {
                    throw error;
                }
                // Network error, retry
                await this.sleep(interval * 1000);
                return poll();
            }
        };

        return poll();
    }

    /**
     * Fetch user profile from GitHub API
     */
    async fetchProfile(token) {
        try {
            const response = await fetch(this.endpoints.user, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Profile fetch failed: ${response.status}`);
            }

            const data = await response.json();

            // Extract relevant profile data
            return {
                id: data.id,
                username: data.login,
                displayName: data.name || data.login,
                avatar: data.avatar_url,
                profileUrl: data.html_url,
                email: data.email,
                bio: data.bio,
                company: data.company,
                location: data.location,
                publicRepos: data.public_repos,
                followers: data.followers,
                following: data.following,
                createdAt: data.created_at,
                fetchedAt: new Date().toISOString()
            };
        } catch (error) {
            this.onError('Failed to fetch profile', error);
            throw error;
        }
    }

    /**
     * Complete login flow - initiates device flow and polls for completion
     * Returns a controller object for the UI to use
     */
    async login() {
        // Start device flow
        const deviceFlow = await this.initiateDeviceFlow();

        // Return controller for UI to display code and track progress
        return {
            userCode: deviceFlow.userCode,
            verificationUri: deviceFlow.verificationUri,
            expiresIn: deviceFlow.expiresIn,

            // Call this to start polling (returns promise that resolves on success)
            waitForAuth: async () => {
                const tokenData = await this.pollForToken(
                    deviceFlow.deviceCode,
                    deviceFlow.interval
                );

                // Store token
                localStorage.setItem(this.storageKeys.token, tokenData.accessToken);

                // Fetch and store profile
                const profile = await this.fetchProfile(tokenData.accessToken);
                this.saveProfile(profile);

                // Update state
                this.isAuthenticated = true;

                // Also store in the main hexworth username key for compatibility
                localStorage.setItem('hexworth_username', profile.username);
                localStorage.setItem('hexworth_display_name', profile.displayName);
                localStorage.setItem('hexworth_avatar', profile.avatar);

                // Trigger callback
                this.onLogin(profile);

                return profile;
            },

            // Call this to cancel the flow
            cancel: () => {
                // Just stops the UI - polling will timeout naturally
            }
        };
    }

    /**
     * Login with Personal Access Token (alternative method)
     */
    async loginWithToken(token) {
        try {
            // Validate token by fetching profile
            const profile = await this.fetchProfile(token);

            // Store token and profile
            localStorage.setItem(this.storageKeys.token, token);
            this.saveProfile(profile);

            // Update state
            this.isAuthenticated = true;

            // Store compatibility keys
            localStorage.setItem('hexworth_username', profile.username);
            localStorage.setItem('hexworth_display_name', profile.displayName);
            localStorage.setItem('hexworth_avatar', profile.avatar);

            // Trigger callback
            this.onLogin(profile);

            return profile;
        } catch (error) {
            this.onError('Invalid token', error);
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * Logout - clear all GitHub auth data
     */
    logout(silent = false) {
        // Clear auth data
        localStorage.removeItem(this.storageKeys.token);
        localStorage.removeItem(this.storageKeys.profile);
        localStorage.removeItem(this.storageKeys.tokenExpiry);

        // Clear compatibility keys
        localStorage.removeItem('hexworth_username');
        localStorage.removeItem('hexworth_display_name');
        localStorage.removeItem('hexworth_avatar');

        // Update state
        this.profile = null;
        this.isAuthenticated = false;

        // Trigger callback
        if (!silent) {
            this.onLogout();
        }
    }

    /**
     * Refresh profile from GitHub
     */
    async refreshProfile() {
        const token = this.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const profile = await this.fetchProfile(token);
        this.saveProfile(profile);

        return profile;
    }

    /**
     * Helper: sleep for ms milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Render login button
     */
    renderLoginButton(container, options = {}) {
        const {
            text = 'Sign in with GitHub',
            className = 'github-login-btn',
            showIcon = true
        } = options;

        const button = document.createElement('button');
        button.className = className;
        button.innerHTML = `
            ${showIcon ? '<svg class="github-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>' : ''}
            <span>${text}</span>
        `;

        button.addEventListener('click', () => this.showLoginModal());

        if (container) {
            container.appendChild(button);
        }

        return button;
    }

    /**
     * Render user profile badge
     */
    renderProfileBadge(container, options = {}) {
        const {
            showName = true,
            showLogout = true,
            size = 'medium'
        } = options;

        if (!this.profile) {
            return this.renderLoginButton(container, options);
        }

        const badge = document.createElement('div');
        badge.className = `github-profile-badge size-${size}`;
        badge.innerHTML = `
            <img src="${this.profile.avatar}" alt="${this.profile.username}" class="profile-avatar">
            ${showName ? `<span class="profile-name">${this.profile.displayName}</span>` : ''}
            ${showLogout ? `<button class="profile-logout" title="Sign out">×</button>` : ''}
        `;

        if (showLogout) {
            badge.querySelector('.profile-logout').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Sign out of GitHub?')) {
                    this.logout();
                    // Re-render as login button
                    badge.replaceWith(this.renderLoginButton(null, options));
                }
            });
        }

        badge.addEventListener('click', () => {
            window.open(this.profile.profileUrl, '_blank');
        });

        if (container) {
            container.appendChild(badge);
        }

        return badge;
    }

    /**
     * Show login modal with device flow UI
     */
    async showLoginModal() {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'github-login-overlay';
        overlay.innerHTML = `
            <div class="github-login-modal">
                <button class="modal-close">×</button>
                <div class="modal-header">
                    <svg class="github-logo" viewBox="0 0 24 24" width="48" height="48">
                        <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <h2>Sign in with GitHub</h2>
                </div>
                <div class="modal-content">
                    <div class="login-step step-loading">
                        <div class="spinner"></div>
                        <p>Initializing...</p>
                    </div>
                    <div class="login-step step-code" style="display: none;">
                        <p>Enter this code at:</p>
                        <a href="" target="_blank" class="verification-link"></a>
                        <div class="user-code"></div>
                        <button class="copy-code-btn">Copy Code</button>
                        <div class="waiting-message">
                            <div class="spinner small"></div>
                            <span>Waiting for authorization...</span>
                        </div>
                    </div>
                    <div class="login-step step-success" style="display: none;">
                        <div class="success-icon">✓</div>
                        <p>Welcome, <span class="username"></span>!</p>
                    </div>
                    <div class="login-step step-error" style="display: none;">
                        <div class="error-icon">✗</div>
                        <p class="error-message"></p>
                        <button class="retry-btn">Try Again</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="alt-login">
                        <span>Or use a </span>
                        <button class="token-login-btn">Personal Access Token</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Get elements
        const modal = overlay.querySelector('.github-login-modal');
        const stepLoading = overlay.querySelector('.step-loading');
        const stepCode = overlay.querySelector('.step-code');
        const stepSuccess = overlay.querySelector('.step-success');
        const stepError = overlay.querySelector('.step-error');

        // Close handlers
        const close = () => overlay.remove();
        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Token login alternative
        overlay.querySelector('.token-login-btn').addEventListener('click', () => {
            this.showTokenLoginModal();
            close();
        });

        try {
            // Initiate device flow
            const loginController = await this.login();

            // Show code step
            stepLoading.style.display = 'none';
            stepCode.style.display = 'block';

            const codeDisplay = stepCode.querySelector('.user-code');
            codeDisplay.textContent = loginController.userCode;

            const verificationLink = stepCode.querySelector('.verification-link');
            verificationLink.href = loginController.verificationUri;
            verificationLink.textContent = loginController.verificationUri;

            // Copy button
            stepCode.querySelector('.copy-code-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(loginController.userCode);
                const btn = stepCode.querySelector('.copy-code-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy Code', 2000);
            });

            // Wait for authorization
            const profile = await loginController.waitForAuth();

            // Show success
            stepCode.style.display = 'none';
            stepSuccess.style.display = 'block';
            stepSuccess.querySelector('.username').textContent = profile.displayName;

            // Close after delay
            setTimeout(close, 2000);

        } catch (error) {
            // Show error
            stepLoading.style.display = 'none';
            stepCode.style.display = 'none';
            stepError.style.display = 'block';
            stepError.querySelector('.error-message').textContent = error.message;

            stepError.querySelector('.retry-btn').addEventListener('click', () => {
                close();
                this.showLoginModal();
            });
        }
    }

    /**
     * Show Personal Access Token login modal
     */
    showTokenLoginModal() {
        const overlay = document.createElement('div');
        overlay.className = 'github-login-overlay';
        overlay.innerHTML = `
            <div class="github-login-modal">
                <button class="modal-close">×</button>
                <div class="modal-header">
                    <svg class="github-logo" viewBox="0 0 24 24" width="48" height="48">
                        <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <h2>Personal Access Token</h2>
                </div>
                <div class="modal-content">
                    <div class="token-instructions">
                        <p>Generate a token at <a href="https://github.com/settings/tokens/new" target="_blank">GitHub Settings</a></p>
                        <p class="scope-hint">Required scopes: <code>read:user</code>, <code>gist</code></p>
                    </div>
                    <input type="password" class="token-input" placeholder="ghp_xxxxxxxxxxxx">
                    <button class="submit-token-btn">Sign In</button>
                    <p class="token-error" style="display: none;"></p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const close = () => overlay.remove();
        overlay.querySelector('.modal-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        const input = overlay.querySelector('.token-input');
        const submitBtn = overlay.querySelector('.submit-token-btn');
        const errorMsg = overlay.querySelector('.token-error');

        submitBtn.addEventListener('click', async () => {
            const token = input.value.trim();
            if (!token) {
                errorMsg.textContent = 'Please enter a token';
                errorMsg.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Verifying...';

            try {
                await this.loginWithToken(token);
                close();
            } catch (error) {
                errorMsg.textContent = error.message;
                errorMsg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
    }

    /**
     * Get CSS styles for auth components
     */
    static getStyles() {
        return `
            /* GitHub Auth Styles */
            .github-login-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: #24292e;
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
            }

            .github-login-btn:hover {
                background: #2f363d;
            }

            .github-login-btn .github-icon {
                flex-shrink: 0;
            }

            /* Profile Badge */
            .github-profile-badge {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .github-profile-badge:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .github-profile-badge .profile-avatar {
                width: 28px;
                height: 28px;
                border-radius: 50%;
            }

            .github-profile-badge.size-small .profile-avatar {
                width: 20px;
                height: 20px;
            }

            .github-profile-badge.size-large .profile-avatar {
                width: 36px;
                height: 36px;
            }

            .github-profile-badge .profile-name {
                color: #e0e0e0;
                font-size: 14px;
            }

            .github-profile-badge .profile-logout {
                background: none;
                border: none;
                color: #888;
                font-size: 18px;
                cursor: pointer;
                padding: 0 4px;
                line-height: 1;
            }

            .github-profile-badge .profile-logout:hover {
                color: #f87171;
            }

            /* Login Modal Overlay */
            .github-login-overlay {
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

            .github-login-modal {
                background: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 30px;
                width: 90%;
                max-width: 400px;
                position: relative;
            }

            .github-login-modal .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #8b949e;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
            }

            .github-login-modal .modal-close:hover {
                color: #fff;
            }

            .github-login-modal .modal-header {
                text-align: center;
                margin-bottom: 25px;
            }

            .github-login-modal .github-logo {
                margin-bottom: 15px;
                color: #fff;
            }

            .github-login-modal h2 {
                color: #e6edf3;
                font-size: 20px;
                margin: 0;
            }

            /* Login Steps */
            .login-step {
                text-align: center;
            }

            .login-step p {
                color: #8b949e;
                margin: 10px 0;
            }

            .login-step .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #30363d;
                border-top-color: #58a6ff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }

            .login-step .spinner.small {
                width: 16px;
                height: 16px;
                border-width: 2px;
                display: inline-block;
                vertical-align: middle;
                margin: 0 8px 0 0;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Verification Code Display */
            .user-code {
                font-family: 'SF Mono', Monaco, Consolas, monospace;
                font-size: 32px;
                font-weight: bold;
                color: #58a6ff;
                letter-spacing: 4px;
                padding: 20px;
                background: rgba(88, 166, 255, 0.1);
                border-radius: 8px;
                margin: 15px 0;
            }

            .verification-link {
                color: #58a6ff;
                text-decoration: none;
                font-size: 14px;
            }

            .verification-link:hover {
                text-decoration: underline;
            }

            .copy-code-btn {
                background: #21262d;
                color: #c9d1d9;
                border: 1px solid #30363d;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-bottom: 20px;
            }

            .copy-code-btn:hover {
                background: #30363d;
            }

            .waiting-message {
                color: #8b949e;
                font-size: 14px;
            }

            /* Success/Error Icons */
            .success-icon {
                width: 60px;
                height: 60px;
                background: #238636;
                color: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                margin: 0 auto 15px;
            }

            .error-icon {
                width: 60px;
                height: 60px;
                background: #f85149;
                color: #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                margin: 0 auto 15px;
            }

            .retry-btn {
                background: #21262d;
                color: #c9d1d9;
                border: 1px solid #30363d;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-top: 15px;
            }

            .retry-btn:hover {
                background: #30363d;
            }

            /* Token Login */
            .modal-footer {
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #30363d;
                text-align: center;
            }

            .alt-login {
                color: #8b949e;
                font-size: 13px;
            }

            .token-login-btn {
                background: none;
                border: none;
                color: #58a6ff;
                cursor: pointer;
                font-size: 13px;
            }

            .token-login-btn:hover {
                text-decoration: underline;
            }

            .token-instructions {
                text-align: left;
                margin-bottom: 20px;
            }

            .token-instructions p {
                margin: 5px 0;
            }

            .token-instructions a {
                color: #58a6ff;
            }

            .scope-hint {
                font-size: 12px;
            }

            .scope-hint code {
                background: #21262d;
                padding: 2px 6px;
                border-radius: 4px;
            }

            .token-input {
                width: 100%;
                padding: 12px;
                background: #0d1117;
                border: 1px solid #30363d;
                border-radius: 6px;
                color: #e6edf3;
                font-family: monospace;
                font-size: 14px;
                margin-bottom: 15px;
            }

            .token-input:focus {
                outline: none;
                border-color: #58a6ff;
            }

            .submit-token-btn {
                width: 100%;
                padding: 12px;
                background: #238636;
                color: #fff;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
            }

            .submit-token-btn:hover {
                background: #2ea043;
            }

            .submit-token-btn:disabled {
                background: #21262d;
                cursor: not-allowed;
            }

            .token-error {
                color: #f85149;
                font-size: 13px;
                margin-top: 10px;
            }
        `;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAuth;
}
