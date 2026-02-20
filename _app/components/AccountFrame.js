/**
 * AccountFrame.js - Account Type Frame System for Hexworth Prime
 *
 * Renders visual frames around user avatars indicating account type:
 * - Operative (student, default): House-colored border ring
 * - Handler (instructor): Gold pulsing frame with crossed keys sigil
 * - Admin: Red pulsing frame with shield sigil
 *
 * Tier hierarchy: operative < handler < admin
 * Use hasMinimumRole() for tier-based permission checks.
 *
 * Handler/Admin status is unlocked via authorization codes validated through
 * the Caesar-17 cipher system (PathCipher). The plaintext codes never
 * appear in source — only the encoded forms are stored as constants.
 *
 * Usage:
 *   AccountFrame.injectStyles();
 *   AccountFrame.wrap(avatarElement, { size: 'header' });
 *   AccountFrame.showActivationModal();
 *
 * API:
 *   AccountFrame.getAccountType()       → 'operative' | 'handler' | 'admin'
 *   AccountFrame.hasMinimumRole(role)   → boolean (tier check)
 *   AccountFrame.validateCode(input)    → boolean
 *   AccountFrame.wrap(el, options)      → wrapped element
 *   AccountFrame.showActivationModal()  → shows code entry modal
 *   AccountFrame.injectStyles()         → injects CSS into <head>
 *   AccountFrame.refreshAll()           → re-wraps all active frames
 *
 * Events:
 *   'accountTypeChanged' — dispatched on document when type changes
 *     detail: { type: 'operative' | 'handler' | 'admin' }
 *
 * Dependencies:
 *   - PathCipher (config/cipher.js) — for code validation
 *
 * @version 1.1.0
 */

const AccountFrame = (function() {

    // ═══════════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════════

    const STORAGE_KEY = 'hexworth_account_type';

    // Codes are validated server-side via validateActivationCode Cloud Function.
    // No encoded codes stored in client JS.

    // Tier hierarchy for permission checks
    const TIER_LEVELS = { operative: 0, handler: 1, admin: 2 };

    // Size configurations for frame wrapping
    const SIZE_CONFIG = {
        header: { ring: 34, padding: 3 },
        small:  { ring: 28, padding: 2 }
    };

    // Crossed keys SVG (inline, 12x12 viewBox)
    const CROSSED_KEYS_SVG = `<svg class="af-sigil" viewBox="0 0 12 12" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#d4a017" stroke-width="0.8" fill="none" stroke-linecap="round">
            <!-- Key 1: top-left to bottom-right -->
            <circle cx="2.5" cy="2.5" r="1.5"/>
            <line x1="3.5" y1="3.5" x2="9" y2="9"/>
            <line x1="7.5" y1="7.5" x2="9" y2="6.5"/>
            <line x1="8.5" y1="8.5" x2="9.5" y2="7.5"/>
            <!-- Key 2: top-right to bottom-left -->
            <circle cx="9.5" cy="2.5" r="1.5"/>
            <line x1="8.5" y1="3.5" x2="3" y2="9"/>
            <line x1="4.5" y1="7.5" x2="3" y2="6.5"/>
            <line x1="3.5" y1="8.5" x2="2.5" y2="7.5"/>
        </g>
    </svg>`;

    // Large crossed keys for activation modal
    const CROSSED_KEYS_LARGE = `<svg class="af-modal-sigil" viewBox="0 0 12 12" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#d4a017" stroke-width="0.6" fill="none" stroke-linecap="round">
            <circle cx="2.5" cy="2.5" r="1.5"/>
            <line x1="3.5" y1="3.5" x2="9" y2="9"/>
            <line x1="7.5" y1="7.5" x2="9" y2="6.5"/>
            <line x1="8.5" y1="8.5" x2="9.5" y2="7.5"/>
            <circle cx="9.5" cy="2.5" r="1.5"/>
            <line x1="8.5" y1="3.5" x2="3" y2="9"/>
            <line x1="4.5" y1="7.5" x2="3" y2="6.5"/>
            <line x1="3.5" y1="8.5" x2="2.5" y2="7.5"/>
        </g>
    </svg>`;

    // Admin shield SVG (inline, 12x12 viewBox)
    const ADMIN_SHIELD_SVG = `<svg class="af-sigil" viewBox="0 0 12 12" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#ef4444" stroke-width="0.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 1L10 3V6C10 8.5 8 10.5 6 11C4 10.5 2 8.5 2 6V3L6 1Z"/>
            <path d="M6 4V7M6 8.5V8.5" stroke-width="1"/>
        </g>
    </svg>`;

    // Track wrapped elements for refreshAll()
    let wrappedElements = [];
    let stylesInjected = false;

    // ═══════════════════════════════════════════════════════════════
    // CORE API
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get current account type from localStorage
     * @returns {'operative'|'handler'}
     */
    function getAccountType() {
        return localStorage.getItem(STORAGE_KEY) || 'operative';
    }

    /**
     * Set account type in localStorage, sync to Firebase, and dispatch event
     * @param {'operative'|'handler'} type
     */
    function setAccountType(type) {
        localStorage.setItem(STORAGE_KEY, type);

        // Sync to Firebase if signed in (so it persists across devices/localStorage clears)
        syncAccountTypeToFirebase(type);

        document.dispatchEvent(new CustomEvent('accountTypeChanged', {
            detail: { type: type }
        }));
    }

    /**
     * Sync account type to Firebase user profile
     * @param {'operative'|'handler'} type
     */
    async function syncAccountTypeToFirebase(type) {
        try {
            if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn()) return;
            if (typeof FirestoreManager === 'undefined') return;

            const user = FirebaseAuth.getUser();
            if (!user || !user.uid) return;

            await FirestoreManager.setUserProfile(user.uid, { accountType: type });
            console.log('[AccountFrame] Synced accountType to Firebase:', type);
        } catch (error) {
            console.warn('[AccountFrame] Failed to sync accountType to Firebase:', error);
        }
    }

    /**
     * Restore account type from Firebase (call on page load after auth)
     * If Firebase has elevated status but localStorage doesn't, restore it
     */
    async function restoreFromFirebase() {
        try {
            if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn()) return;
            if (typeof FirestoreManager === 'undefined') return;

            const user = FirebaseAuth.getUser();
            if (!user || !user.uid) return;

            const profile = await FirestoreManager.getUserProfile(user.uid);
            if (profile && (profile.accountType === 'handler' || profile.accountType === 'admin')) {
                const localType = localStorage.getItem(STORAGE_KEY);
                const localLevel = TIER_LEVELS[localType] || 0;
                const firebaseLevel = TIER_LEVELS[profile.accountType] || 0;

                // Only restore if Firebase has higher tier
                if (firebaseLevel > localLevel) {
                    console.log('[AccountFrame] Restoring', profile.accountType, 'status from Firebase');
                    localStorage.setItem(STORAGE_KEY, profile.accountType);
                    document.dispatchEvent(new CustomEvent('accountTypeChanged', {
                        detail: { type: profile.accountType }
                    }));
                    refreshAll();
                }
            }
        } catch (error) {
            console.warn('[AccountFrame] Failed to restore accountType from Firebase:', error);
        }
    }

    /**
     * Check if current user has at least the specified role tier
     * Tier hierarchy: operative < handler < admin
     * @param {'operative'|'handler'|'admin'} minimumRole - The minimum required role
     * @returns {boolean}
     */
    function hasMinimumRole(minimumRole) {
        const currentType = getAccountType();
        const currentLevel = TIER_LEVELS[currentType] || 0;
        const requiredLevel = TIER_LEVELS[minimumRole] || 0;
        return currentLevel >= requiredLevel;
    }

    /**
     * Validate an authorization code via Cloud Function.
     * Server-side validation — no codes stored in client JS.
     * @param {string} input - User-entered code
     * @returns {Promise<'handler'|'admin'|false>} - Returns the role type if valid, false otherwise
     */
    async function validateCode(input) {
        if (!input) return false;

        // Server-side validation for authenticated users
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
            try {
                const result = await FirebaseAuth.callFunction('validateActivationCode', {
                    code: input.trim()
                });
                const role = result.data.role;
                if (role === 'admin' || role === 'handler') {
                    // Refresh token to pick up new custom claims
                    await FirebaseAuth.refreshToken();
                    return role;
                }
                return false;
            } catch (err) {
                if (err.code === 'functions/resource-exhausted') {
                    throw err; // Let caller handle rate limit
                }
                console.warn('[AccountFrame] Server validation failed:', err.message);
                return false;
            }
        }

        // Not signed in — cannot validate
        return false;
    }

    /**
     * Wrap an avatar element with the appropriate account frame
     * @param {HTMLElement} element - The avatar element to wrap
     * @param {Object} options
     * @param {'header'|'small'} options.size - Frame size variant
     * @param {boolean} options.showTitle - Show "HANDLER" on hover
     * @returns {HTMLElement} The wrapper element
     */
    function wrap(element, options = {}) {
        if (!element) return null;

        const size = options.size || 'header';
        const showTitle = options.showTitle !== false;
        const type = getAccountType();

        // Don't double-wrap — if already wrapped, update instead
        if (element.parentElement && element.parentElement.classList.contains('af-wrapper')) {
            return updateWrapper(element.parentElement, type, size, showTitle);
        }

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = `af-wrapper af-${type} af-size-${size}`;
        if (showTitle && (type === 'handler' || type === 'admin')) {
            wrapper.setAttribute('data-title', type.toUpperCase());
        }

        // Insert wrapper around element
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);

        // Add sigil for handler/admin
        if (type === 'handler' || type === 'admin') {
            const sigil = document.createElement('div');
            sigil.className = 'af-sigil-badge';
            sigil.innerHTML = type === 'admin' ? ADMIN_SHIELD_SVG : CROSSED_KEYS_SVG;
            wrapper.appendChild(sigil);
        }

        // Track for refresh
        wrappedElements.push({ wrapper, element, options });

        return wrapper;
    }

    /**
     * Update an existing wrapper's type
     */
    function updateWrapper(wrapper, type, size, showTitle) {
        wrapper.className = `af-wrapper af-${type} af-size-${size}`;

        if (showTitle && (type === 'handler' || type === 'admin')) {
            wrapper.setAttribute('data-title', type.toUpperCase());
        } else {
            wrapper.removeAttribute('data-title');
        }

        // Add or remove sigil
        const existingSigil = wrapper.querySelector('.af-sigil-badge');
        const needsSigil = type === 'handler' || type === 'admin';

        if (needsSigil && !existingSigil) {
            const sigil = document.createElement('div');
            sigil.className = 'af-sigil-badge';
            sigil.innerHTML = type === 'admin' ? ADMIN_SHIELD_SVG : CROSSED_KEYS_SVG;
            wrapper.appendChild(sigil);
        } else if (needsSigil && existingSigil) {
            // Update sigil if type changed
            existingSigil.innerHTML = type === 'admin' ? ADMIN_SHIELD_SVG : CROSSED_KEYS_SVG;
        } else if (!needsSigil && existingSigil) {
            existingSigil.remove();
        }

        return wrapper;
    }

    /**
     * Refresh all wrapped elements (call after type change)
     */
    function refreshAll() {
        const type = getAccountType();
        wrappedElements = wrappedElements.filter(({ wrapper }) => {
            // Clean up removed elements
            return document.body.contains(wrapper);
        });

        wrappedElements.forEach(({ wrapper, options }) => {
            const size = options.size || 'header';
            const showTitle = options.showTitle !== false;
            updateWrapper(wrapper, type, size, showTitle);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // ACTIVATION MODAL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Show the handler activation modal with code entry
     */
    function showActivationModal() {
        const overlay = document.createElement('div');
        overlay.className = 'af-overlay';
        overlay.innerHTML = `
            <div class="af-modal">
                <button class="af-modal-close">&times;</button>
                <div class="af-modal-header">
                    ${CROSSED_KEYS_LARGE}
                    <h2 class="af-modal-title">Handler Authentication</h2>
                    <p class="af-modal-subtitle">Enter your instructor authorization code</p>
                </div>
                <div class="af-modal-body">
                    <input type="password" class="af-code-input" placeholder="Authorization code" autocomplete="off" spellcheck="false">
                    <button class="af-auth-btn">AUTHENTICATE</button>
                    <p class="af-error-msg" style="display:none">ACCESS DENIED</p>
                    <p class="af-success-msg" style="display:none">HANDLER STATUS GRANTED</p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Elements
        const modal = overlay.querySelector('.af-modal');
        const input = overlay.querySelector('.af-code-input');
        const authBtn = overlay.querySelector('.af-auth-btn');
        const errorMsg = overlay.querySelector('.af-error-msg');
        const successMsg = overlay.querySelector('.af-success-msg');

        // Focus input
        setTimeout(() => input.focus(), 100);

        // Close handlers
        const close = () => {
            overlay.classList.add('af-fade-out');
            setTimeout(() => overlay.remove(), 300);
        };

        overlay.querySelector('.af-modal-close').addEventListener('click', close);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close();
        });

        // Auth handler
        const authenticate = async () => {
            const code = input.value;
            if (!code) {
                input.classList.add('af-shake');
                setTimeout(() => input.classList.remove('af-shake'), 500);
                return;
            }

            // Check if user is signed in
            if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn()) {
                errorMsg.textContent = 'SIGN IN REQUIRED';
                errorMsg.style.display = 'block';
                input.classList.add('af-shake');
                setTimeout(() => input.classList.remove('af-shake'), 500);
                return;
            }

            // Disable inputs during server call
            authBtn.disabled = true;
            input.disabled = true;
            authBtn.textContent = 'VERIFYING...';

            try {
                const validatedRole = await validateCode(code);
                if (validatedRole) {
                    // Success
                    errorMsg.style.display = 'none';
                    input.style.display = 'none';
                    authBtn.style.display = 'none';
                    successMsg.textContent = validatedRole === 'admin' ? 'ADMIN STATUS GRANTED' : 'HANDLER STATUS GRANTED';
                    successMsg.style.display = 'block';
                    modal.classList.add(validatedRole === 'admin' ? 'af-admin-flash' : 'af-success-flash');

                    setAccountType(validatedRole);
                    refreshAll();

                    setTimeout(close, 1500);
                } else {
                    // Failure
                    errorMsg.textContent = 'ACCESS DENIED';
                    errorMsg.style.display = 'block';
                    input.classList.add('af-shake');
                    input.value = '';
                    authBtn.disabled = false;
                    input.disabled = false;
                    authBtn.textContent = 'AUTHENTICATE';
                    setTimeout(() => {
                        input.classList.remove('af-shake');
                        input.focus();
                    }, 500);
                }
            } catch (err) {
                if (err.code === 'functions/resource-exhausted') {
                    errorMsg.textContent = 'TOO MANY ATTEMPTS — WAIT 10 MINUTES';
                } else {
                    errorMsg.textContent = 'VERIFICATION FAILED';
                }
                errorMsg.style.display = 'block';
                input.value = '';
                authBtn.disabled = false;
                input.disabled = false;
                authBtn.textContent = 'AUTHENTICATE';
            }
        };

        authBtn.addEventListener('click', authenticate);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') authenticate();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    /**
     * Inject all AccountFrame CSS into document head
     */
    function injectStyles() {
        if (stylesInjected) return;
        stylesInjected = true;

        const style = document.createElement('style');
        style.textContent = getStyles();
        document.head.appendChild(style);
    }

    function getStyles() {
        return `
            /* ═══════════════════════════════════════════════════
               AccountFrame — Frame Wrapper
               ═══════════════════════════════════════════════════ */

            .af-wrapper {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                flex-shrink: 0;
            }

            /* Operative (Student) Frame */
            .af-operative {
                border: 2px solid var(--house-primary, #9f7aea);
                box-shadow: 0 0 6px var(--house-glow, rgba(159, 122, 234, 0.3));
            }

            /* Handler (Instructor) Frame */
            .af-handler {
                border: 2px solid #d4a017;
                box-shadow: 0 0 8px rgba(212, 160, 23, 0.4);
                animation: af-handler-pulse 3s ease-in-out infinite;
            }

            @keyframes af-handler-pulse {
                0%, 100% { box-shadow: 0 0 8px rgba(212, 160, 23, 0.4); }
                50%      { box-shadow: 0 0 16px rgba(212, 160, 23, 0.7); }
            }

            /* Admin Frame */
            .af-admin {
                border: 2px solid #ef4444;
                box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
                animation: af-admin-pulse 3s ease-in-out infinite;
            }

            @keyframes af-admin-pulse {
                0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
                50%      { box-shadow: 0 0 16px rgba(239, 68, 68, 0.7); }
            }

            /* Red corner accents for admin */
            .af-admin::before,
            .af-admin::after {
                content: '';
                position: absolute;
                width: 6px;
                height: 6px;
                border-color: #ef4444;
                border-style: solid;
                pointer-events: none;
            }

            .af-admin::before {
                top: -3px;
                left: -3px;
                border-width: 2px 0 0 2px;
                border-radius: 2px 0 0 0;
            }

            .af-admin::after {
                bottom: -3px;
                right: -3px;
                border-width: 0 2px 2px 0;
                border-radius: 0 0 2px 0;
            }

            .af-admin[data-title] {
                cursor: default;
            }

            /* Gold corner accents for handler */
            .af-handler::before,
            .af-handler::after {
                content: '';
                position: absolute;
                width: 6px;
                height: 6px;
                border-color: #d4a017;
                border-style: solid;
                pointer-events: none;
            }

            .af-handler::before {
                top: -3px;
                left: -3px;
                border-width: 2px 0 0 2px;
                border-radius: 2px 0 0 0;
            }

            .af-handler::after {
                bottom: -3px;
                right: -3px;
                border-width: 0 2px 2px 0;
                border-radius: 0 0 2px 0;
            }

            /* HANDLER title on hover */
            .af-wrapper[data-title]:hover::before {
                /* Override corner accent with title tooltip */
            }

            .af-handler[data-title] {
                cursor: default;
            }

            .af-handler[data-title]::after {
                bottom: -3px;
                right: -3px;
            }

            /* Separate tooltip element approach — using the sigil badge area */

            /* ═══════════════════════════════════════════════════
               Size Variants
               ═══════════════════════════════════════════════════ */

            .af-size-header {
                padding: 3px;
            }

            .af-size-small {
                padding: 2px;
            }

            /* Ensure wrapped avatars stay round */
            .af-wrapper img,
            .af-wrapper .profile-avatar {
                border-radius: 50%;
                display: block;
            }

            /* ═══════════════════════════════════════════════════
               Crossed Keys Sigil Badge
               ═══════════════════════════════════════════════════ */

            .af-sigil-badge {
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: #1a1a2e;
                border: 1px solid #d4a017;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
            }

            .af-sigil {
                display: block;
            }

            /* Tooltip on hover for handler */
            .af-handler .af-sigil-badge::after {
                content: 'HANDLER';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 4px;
                padding: 2px 6px;
                background: rgba(212, 160, 23, 0.9);
                color: #000;
                font-size: 8px;
                font-weight: 700;
                letter-spacing: 1px;
                border-radius: 3px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }

            .af-handler:hover .af-sigil-badge::after {
                opacity: 1;
            }

            /* Admin sigil badge styling */
            .af-admin .af-sigil-badge {
                border-color: #ef4444;
            }

            /* Tooltip on hover for admin */
            .af-admin .af-sigil-badge::after {
                content: 'ADMIN';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 4px;
                padding: 2px 6px;
                background: rgba(239, 68, 68, 0.9);
                color: #fff;
                font-size: 8px;
                font-weight: 700;
                letter-spacing: 1px;
                border-radius: 3px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }

            .af-admin:hover .af-sigil-badge::after {
                opacity: 1;
            }

            /* ═══════════════════════════════════════════════════
               Activation Modal
               ═══════════════════════════════════════════════════ */

            .af-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                backdrop-filter: blur(6px);
                animation: af-fade-in 0.3s ease;
            }

            @keyframes af-fade-in {
                from { opacity: 0; }
                to   { opacity: 1; }
            }

            .af-overlay.af-fade-out {
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .af-modal {
                background: #12121e;
                border: 1px solid #d4a01744;
                border-radius: 12px;
                padding: 35px;
                width: 90%;
                max-width: 380px;
                position: relative;
                text-align: center;
            }

            .af-modal-close {
                position: absolute;
                top: 12px;
                right: 15px;
                background: none;
                border: none;
                color: #666;
                font-size: 24px;
                cursor: pointer;
                line-height: 1;
            }

            .af-modal-close:hover {
                color: #d4a017;
            }

            .af-modal-header {
                margin-bottom: 25px;
            }

            .af-modal-sigil {
                margin-bottom: 15px;
                filter: drop-shadow(0 0 8px rgba(212, 160, 23, 0.5));
            }

            .af-modal-title {
                color: #d4a017;
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 8px 0;
                letter-spacing: 1px;
            }

            .af-modal-subtitle {
                color: #888;
                font-size: 13px;
                margin: 0;
            }

            .af-code-input {
                width: 100%;
                padding: 14px;
                background: #0a0a14;
                border: 1px solid #333;
                border-radius: 6px;
                color: #d4a017;
                font-family: 'SF Mono', Monaco, Consolas, monospace;
                font-size: 16px;
                text-align: center;
                letter-spacing: 2px;
                margin-bottom: 15px;
                box-sizing: border-box;
            }

            .af-code-input:focus {
                outline: none;
                border-color: #d4a017;
                box-shadow: 0 0 8px rgba(212, 160, 23, 0.3);
            }

            .af-code-input::placeholder {
                color: #555;
                letter-spacing: 0;
                font-size: 14px;
            }

            .af-auth-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #d4a017, #b8860b);
                color: #000;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 2px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .af-auth-btn:hover {
                background: linear-gradient(135deg, #e6b422, #d4a017);
                box-shadow: 0 0 15px rgba(212, 160, 23, 0.4);
            }

            .af-error-msg {
                color: #f85149;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: 1px;
                margin-top: 12px;
            }

            .af-success-msg {
                color: #d4a017;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 2px;
                margin-top: 12px;
                text-shadow: 0 0 10px rgba(212, 160, 23, 0.5);
            }

            /* Success flash on modal */
            .af-success-flash {
                animation: af-gold-flash 0.6s ease;
            }

            @keyframes af-gold-flash {
                0%   { box-shadow: 0 0 0 rgba(212, 160, 23, 0); }
                50%  { box-shadow: 0 0 40px rgba(212, 160, 23, 0.6), inset 0 0 20px rgba(212, 160, 23, 0.1); }
                100% { box-shadow: 0 0 0 rgba(212, 160, 23, 0); }
            }

            /* Admin success flash on modal */
            .af-admin-flash {
                animation: af-red-flash 0.6s ease;
            }

            @keyframes af-red-flash {
                0%   { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
                50%  { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(239, 68, 68, 0.1); }
                100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
            }

            /* Input shake animation */
            .af-shake {
                animation: af-shake 0.4s ease;
            }

            @keyframes af-shake {
                0%, 100% { transform: translateX(0); }
                20%      { transform: translateX(-8px); }
                40%      { transform: translateX(8px); }
                60%      { transform: translateX(-4px); }
                80%      { transform: translateX(4px); }
            }

            /* ═══════════════════════════════════════════════════
               Settings Section Badge
               ═══════════════════════════════════════════════════ */

            .af-role-badge {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1px;
            }

            .af-role-badge.af-badge-operative {
                background: rgba(var(--house-primary-rgb, 159, 122, 234), 0.15);
                color: var(--house-primary, #9f7aea);
                border: 1px solid var(--house-primary, #9f7aea);
            }

            .af-role-badge.af-badge-handler {
                background: rgba(212, 160, 23, 0.15);
                color: #d4a017;
                border: 1px solid #d4a017;
            }

            .af-role-badge.af-badge-admin {
                background: rgba(239, 68, 68, 0.15);
                color: #ef4444;
                border: 1px solid #ef4444;
            }
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        getAccountType: getAccountType,
        hasMinimumRole: hasMinimumRole,
        validateCode: validateCode,
        wrap: wrap,
        showActivationModal: showActivationModal,
        injectStyles: injectStyles,
        refreshAll: refreshAll,
        setAccountType: setAccountType,
        getStyles: getStyles,
        restoreFromFirebase: restoreFromFirebase
    };

})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccountFrame;
}
