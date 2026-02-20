/**
 * AccessGuard.js - Content Access Control System
 *
 * QC-4: Server-side admin verification via Firebase Auth custom claims.
 * Trust-then-verify pattern: sync localStorage check for instant UX,
 * async custom claims verification catches forgery in background.
 *
 * Protection Levels:
 * - SORTED: User must have completed house sorting
 * - HOUSE: User must belong to specific house (or have God Mode)
 * - GATE: User must have passed specific Dark Arts gate
 * - ADMIN: User must have Firebase Admin, God Mode, or Master Key
 * - ADMIN-ONLY: User must have Firebase Admin ONLY (strictest)
 *
 * Usage (add to protected pages):
 *   <script src="../../components/AccessGuard.js"></script>
 *   <script>
 *     AccessGuard.require('sorted');                    // Must be sorted
 *     AccessGuard.require('house', 'shield');           // Must be in Shield house
 *     AccessGuard.require('gate', 3);                   // Must have passed gate 3
 *     AccessGuard.require('admin');                     // Must have admin access
 *   </script>
 *
 * @author Hexworth Prime
 * @version 2.0.0
 */

const AccessGuard = (function() {
    'use strict';

    // Configuration
    const config = {
        redirectDelay: 100,  // ms before redirect
        masterKeyDuration: 5 * 60 * 1000,  // 5 minutes in milliseconds
        storageKeys: {
            house: 'hexworth_house',
            theme: 'hexworth_theme',
            godMode: 'hexworth_god_mode',
            divergent: 'hexworth_divergent',
            houseHopper: 'hexworth_house_hopper',
            gatePrefix: 'gate',
            gateAnswerPrefix: 'gate',
            masterKey: 'hexworth_master_key',
            masterKeyExpiry: 'hexworth_master_key_expiry'
        },
        paths: {
            sorting: '/sorting.html',
            dashboard: '/dashboard.html',
            unauthorized: '/unauthorized.html',
            darkArtsGate: '/dark-arts/gate-1.html'
        }
    };

    // Calculate base path from current location
    function getBasePath() {
        const path = window.location.pathname;
        const appIndex = path.indexOf('/_app/');
        if (appIndex !== -1) {
            return path.substring(0, appIndex + 6);  // Include /_app/
        }
        // Fallback: count directory segments above the file
        // /workshop/index.html → 1 dir up → '../'
        // /workshop/           → 1 dir up → '../'
        // /dark-arts/vault/x   → 2 dirs up → '../../'
        const segments = path.replace(/\/[^/]*$/, '').split('/').filter(Boolean);
        return segments.length > 0 ? '../'.repeat(segments.length) : './';
    }

    // Check if user has God Mode (bypasses all checks)
    // NOTE: God Mode uses sessionStorage - it resets when browser/tab closes
    function hasGodMode() {
        return sessionStorage.getItem(config.storageKeys.godMode) === 'true';
    }

    // Toggle God Mode (session-only, never persisted)
    function toggleGodMode() {
        const current = hasGodMode();
        if (current) {
            sessionStorage.removeItem(config.storageKeys.godMode);
            console.log('%c👁️ God Mode Deactivated', 'color: #666; font-size: 14px;');
        } else {
            sessionStorage.setItem(config.storageKeys.godMode, 'true');
            console.log('%c👁️ GOD MODE ACTIVATED', 'color: #ffd700; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #ffd700;');
        }
        return !current;
    }

    // ─────────────────────────────────────────────────────────────
    // FIREBASE ADMIN - Persistent admin access via Google sign-in
    // QC-4: Sync check from localStorage, async verify from custom claims
    // ─────────────────────────────────────────────────────────────

    // Sync check: reads localStorage (fast, may be forged)
    function isFirebaseAdmin() {
        return localStorage.getItem('hexworth_firebase_admin') === 'true';
    }

    // Get Firebase user info
    function getFirebaseUser() {
        try {
            const user = localStorage.getItem('hexworth_firebase_user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * QC-4: Async admin verification via Firebase Auth custom claims.
     * Returns: true (verified admin), false (not admin / forged), null (inconclusive)
     */
    async function _verifyAdminAsync() {
        try {
            if (typeof FirebaseAuth === 'undefined') return null;

            await FirebaseAuth.waitForAuth();

            if (!FirebaseAuth.isSignedIn()) return null; // can't verify unsigned users

            // Use FirebaseAuth's resolved admin status (claims + email allowlist)
            return FirebaseAuth.isAdmin();
        } catch (e) {
            console.warn('[AccessGuard] Admin verification error:', e);
            return null; // inconclusive — don't punish on error
        }
    }

    /**
     * QC-4: Async gate verification via Cloud Function.
     * Returns: true (verified), false (forged), null (inconclusive)
     */
    async function _verifyGateAsync(gateNumber) {
        try {
            if (typeof FirebaseAuth === 'undefined') return null;

            await FirebaseAuth.waitForAuth();

            if (!FirebaseAuth.isSignedIn()) return null;

            const result = await FirebaseAuth.callFunction('verifyGateAccess', {
                gateNumber: gateNumber
            });
            return result.data.authorized;
        } catch (e) {
            console.warn('[AccessGuard] Gate verification error:', e);
            return null; // inconclusive — don't punish on error
        }
    }

    /**
     * QC-4: Schedule background async verification.
     * If verification returns false (forged), hide content and redirect.
     */
    function _scheduleAsyncVerification(type, param) {
        if (type === 'admin') {
            _verifyAdminAsync().then(result => {
                if (result === false) {
                    console.warn('[AccessGuard] ASYNC ADMIN VERIFICATION FAILED — forged localStorage detected');
                    localStorage.removeItem('hexworth_firebase_admin');
                    hideContent();
                    redirect('dashboard', 'Admin access could not be verified.');
                }
                // result === true → legitimate admin, keep showing
                // result === null → inconclusive (offline/not signed in), keep showing
            });
        } else if (type === 'gate') {
            const gateNum = parseInt(param) || 1;
            _verifyGateAsync(gateNum).then(result => {
                if (result === false) {
                    console.warn(`[AccessGuard] ASYNC GATE ${gateNum} VERIFICATION FAILED — forged localStorage detected`);
                    // Strip forged localStorage flags
                    for (let i = 1; i <= gateNum; i++) {
                        localStorage.removeItem(`gate${i}_complete`);
                    }
                    localStorage.removeItem('dark_arts_unlocked');
                    hideContent();
                    redirect('dark-arts-gate', `Gate ${gateNum} completion could not be verified.`);
                }
            });
        }
    }

    // Add Firebase admin badge
    function addFirebaseAdminBadge() {
        // Defer until body exists
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', addFirebaseAdminBadge);
            return;
        }

        if (document.getElementById('firebase-admin-indicator')) return;

        const user = getFirebaseUser();
        const badge = document.createElement('div');
        badge.id = 'firebase-admin-indicator';
        badge.innerHTML = `
            <style>
                #firebase-admin-indicator {
                    position: fixed;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #4285f4, #34a853);
                    color: #fff;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: bold;
                    letter-spacing: 0.1em;
                    z-index: 99999;
                    box-shadow: 0 0 20px rgba(66, 133, 244, 0.5);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                #firebase-admin-indicator img {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                }
            </style>
            ${user && user.photoURL ? `<img src="${user.photoURL}" alt="">` : ''}
            <span>ADMIN MODE</span>
        `;
        document.body.appendChild(badge);
    }

    // ─────────────────────────────────────────────────────────────
    // MASTER KEY SYSTEM - Time-based full access
    // Triggered by 5 clicks on the black hole
    // ─────────────────────────────────────────────────────────────

    // Check if Master Key is active and not expired
    function hasMasterKey() {
        const expiry = sessionStorage.getItem(config.storageKeys.masterKeyExpiry);
        if (!expiry) return false;

        const expiryTime = parseInt(expiry, 10);
        const now = Date.now();

        if (now >= expiryTime) {
            // Expired - clean up
            deactivateMasterKey();
            return false;
        }

        return true;
    }

    // Get remaining time in milliseconds
    function getMasterKeyRemaining() {
        const expiry = sessionStorage.getItem(config.storageKeys.masterKeyExpiry);
        if (!expiry) return 0;

        const remaining = parseInt(expiry, 10) - Date.now();
        return Math.max(0, remaining);
    }

    // Activate Master Key for 5 minutes
    function activateMasterKey() {
        const expiry = Date.now() + config.masterKeyDuration;
        sessionStorage.setItem(config.storageKeys.masterKey, 'true');
        sessionStorage.setItem(config.storageKeys.masterKeyExpiry, expiry.toString());

        // Grant all gate access temporarily
        for (let i = 1; i <= 7; i++) {
            sessionStorage.setItem(`master_gate${i}_complete`, 'true');
        }

        console.log('%c🔑 MASTER KEY ACTIVATED - 5 MINUTES',
            'color: #00ff00; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px #00ff00;');

        // Create visual indicator
        showMasterKeyIndicator();

        return true;
    }

    // Deactivate Master Key
    function deactivateMasterKey() {
        sessionStorage.removeItem(config.storageKeys.masterKey);
        sessionStorage.removeItem(config.storageKeys.masterKeyExpiry);

        // Remove temporary gate access
        for (let i = 1; i <= 7; i++) {
            sessionStorage.removeItem(`master_gate${i}_complete`);
        }

        // Remove visual indicator
        const indicator = document.getElementById('master-key-indicator');
        if (indicator) indicator.remove();

        console.log('%c🔑 Master Key Expired', 'color: #666; font-size: 14px;');
    }

    // Show floating countdown indicator
    function showMasterKeyIndicator() {
        // Remove existing indicator
        const existing = document.getElementById('master-key-indicator');
        if (existing) existing.remove();

        const indicator = document.createElement('div');
        indicator.id = 'master-key-indicator';
        indicator.innerHTML = `
            <style>
                #master-key-indicator {
                    position: fixed;
                    top: 15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #00ff00, #00aa00);
                    color: #000;
                    padding: 8px 20px;
                    border-radius: 25px;
                    font-size: 12px;
                    font-weight: bold;
                    letter-spacing: 0.1em;
                    z-index: 99999;
                    box-shadow: 0 0 30px rgba(0, 255, 0, 0.6);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: masterKeyPulse 2s ease-in-out infinite;
                    cursor: pointer;
                    user-select: none;
                }
                @keyframes masterKeyPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.5); }
                    50% { box-shadow: 0 0 40px rgba(0, 255, 0, 0.8); }
                }
                #master-key-indicator:hover {
                    background: linear-gradient(135deg, #ff4444, #aa0000);
                    box-shadow: 0 0 30px rgba(255, 0, 0, 0.6);
                }
                #master-key-indicator .key-icon {
                    font-size: 16px;
                }
                #master-key-indicator .key-time {
                    font-family: monospace;
                    font-size: 14px;
                }
            </style>
            <span class="key-icon">🔑</span>
            <span>MASTER KEY</span>
            <span class="key-time" id="master-key-countdown">5:00</span>
        `;

        document.body.appendChild(indicator);

        // Click to deactivate early
        indicator.addEventListener('click', () => {
            if (confirm('Deactivate Master Key early?')) {
                deactivateMasterKey();
            }
        });

        // Start countdown timer
        updateMasterKeyCountdown();
    }

    // Update countdown display
    function updateMasterKeyCountdown() {
        const countdownEl = document.getElementById('master-key-countdown');
        if (!countdownEl) return;

        const remaining = getMasterKeyRemaining();

        if (remaining <= 0) {
            deactivateMasterKey();
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Change color when < 1 minute
        const indicator = document.getElementById('master-key-indicator');
        if (indicator && remaining < 60000) {
            indicator.style.background = 'linear-gradient(135deg, #ffaa00, #ff6600)';
            indicator.style.boxShadow = '0 0 30px rgba(255, 165, 0, 0.6)';
        }

        // Update every second
        setTimeout(updateMasterKeyCountdown, 1000);
    }

    // Check if temporary gate access is granted by Master Key
    function hasMasterKeyGateAccess(gateNumber) {
        if (!hasMasterKey()) return false;
        return sessionStorage.getItem(`master_gate${gateNumber}_complete`) === 'true';
    }

    // Check if user has been sorted
    function isSorted() {
        return localStorage.getItem(config.storageKeys.house) !== null;
    }

    // Get user's house
    function getUserHouse() {
        return localStorage.getItem(config.storageKeys.house);
    }

    // Check if user is Divergent (Factionless)
    function isDivergent() {
        return localStorage.getItem(config.storageKeys.divergent) === 'true';
    }

    // Check if user is a House Hopper (can access all house content)
    function isHouseHopper() {
        return localStorage.getItem(config.storageKeys.houseHopper) === 'true';
    }

    // Check if user has passed a specific Dark Arts gate
    function hasPassedGate(gateNumber) {
        // Master Key grants temporary access to all gates
        if (hasMasterKeyGateAccess(gateNumber)) return true;

        const key = `${config.storageKeys.gatePrefix}${gateNumber}_complete`;
        return localStorage.getItem(key) === 'true';
    }

    // Check if user has passed all gates up to specified number
    function hasPassedGatesUpTo(gateNumber) {
        // Master Key grants access to all gates
        if (hasMasterKey()) return true;

        for (let i = 1; i <= gateNumber; i++) {
            if (!hasPassedGate(i)) {
                return false;
            }
        }
        return true;
    }

    // Hide page content immediately (before check)
    function hideContent() {
        // Add style to hide everything until verified
        const style = document.createElement('style');
        style.id = 'access-guard-hide';
        style.textContent = `
            body {
                visibility: hidden !important;
                opacity: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Show page content (after successful check)
    function showContent() {
        // Remove both hide styles (preload and dynamic)
        const preloadStyle = document.getElementById('access-guard-preload');
        if (preloadStyle) {
            preloadStyle.remove();
        }
        const hideStyle = document.getElementById('access-guard-hide');
        if (hideStyle) {
            hideStyle.remove();
        }

        // Also set inline styles if body exists (belt and suspenders)
        if (document.body) {
            document.body.style.visibility = 'visible';
            document.body.style.opacity = '1';
        }
    }

    // Redirect to appropriate page
    function redirect(destination, message) {
        const basePath = getBasePath();

        // Store message for display on redirect page
        if (message) {
            sessionStorage.setItem('access_guard_message', message);
            sessionStorage.setItem('access_guard_from', window.location.href);
        }

        setTimeout(() => {
            let url;
            switch (destination) {
                case 'sorting':
                    url = basePath + 'sorting.html';
                    break;
                case 'dashboard':
                    url = basePath + 'dashboard.html';
                    break;
                case 'dark-arts-gate':
                    url = basePath + 'dark-arts/gate-1.html';
                    break;
                case 'unauthorized':
                default:
                    url = basePath + 'unauthorized.html';
                    break;
            }
            window.location.href = url;
        }, config.redirectDelay);
    }

    // ─────────────────────────────────────────────────────────────
    // MAIN ACCESS CHECK — require(), requireAll(), requireAny()
    // ─────────────────────────────────────────────────────────────

    // Main requirement check
    function require(level, param) {
        // Hide content immediately
        hideContent();

        // Firebase Admin bypasses everything except admin-only
        // QC-4: Sync show, async verify in background
        if (isFirebaseAdmin() && level !== 'admin-only') {
            showContent();
            addFirebaseAdminBadge();
            _scheduleAsyncVerification('admin');
            return true;
        }

        // God Mode bypasses everything except explicit admin-only
        if (hasGodMode() && level !== 'admin-only') {
            showContent();
            addGodModeBadge();
            return true;
        }

        // Master Key bypasses everything except explicit admin-only
        if (hasMasterKey() && level !== 'admin-only') {
            showContent();
            addMasterKeyBadge();
            return true;
        }

        let authorized = false;
        let redirectTo = 'unauthorized';
        let message = '';

        switch (level) {
            case 'sorted':
                // User must have completed sorting
                authorized = isSorted();
                if (!authorized) {
                    redirectTo = 'sorting';
                    message = 'You must complete the Sorting Quiz first.';
                }
                break;

            case 'house':
                // User must be in specific house (or any house if param is 'any')
                if (!isSorted()) {
                    redirectTo = 'sorting';
                    message = 'You must complete the Sorting Quiz first.';
                } else if (param === 'any' || param === undefined) {
                    authorized = true;
                } else if (isHouseHopper()) {
                    // House Hoppers (Divergent) can access ANY house content
                    authorized = true;
                    console.log('%c⚡ House Hopper Access Granted', 'color: #ff00ff;');
                } else {
                    const userHouse = getUserHouse();
                    // Allow access if user is in the specified house
                    // Also allow cross-house access for general content
                    authorized = (userHouse === param);
                    if (!authorized) {
                        redirectTo = 'dashboard';
                        message = `This content is for ${param.charAt(0).toUpperCase() + param.slice(1)} house members.`;
                    }
                }
                break;

            case 'gate':
                // User must have passed Dark Arts gates
                const gateNum = parseInt(param) || 1;
                if (!hasPassedGatesUpTo(gateNum)) {
                    authorized = false;
                    redirectTo = 'dark-arts-gate';
                    message = `You must pass Gate ${gateNum} to access this content.`;
                } else {
                    authorized = true;
                    // Async server verification for authenticated users
                    _scheduleAsyncVerification('gate', gateNum);
                }
                break;

            case 'dark-arts':
                // User must have access to Dark Arts (all 5 gates or God Mode)
                if (!hasPassedGatesUpTo(5)) {
                    authorized = false;
                    redirectTo = 'dark-arts-gate';
                    message = 'You must complete all Five Gates to enter the Vault.';
                } else {
                    authorized = true;
                    // Async server verification for authenticated users
                    _scheduleAsyncVerification('gate', 5);
                }
                break;

            case 'admin':
                // QC-4: Firebase admin (verified via custom claims) OR God Mode
                if (isFirebaseAdmin()) {
                    showContent();
                    addFirebaseAdminBadge();
                    _scheduleAsyncVerification('admin');
                    return true;
                }
                authorized = hasGodMode();
                if (!authorized) {
                    redirectTo = 'dashboard';
                    message = 'This area requires administrator access.';
                }
                break;

            case 'admin-only':
                // QC-4: Strictest level — Firebase admin only (verified via custom claims)
                if (isFirebaseAdmin()) {
                    showContent();
                    addFirebaseAdminBadge();
                    _scheduleAsyncVerification('admin');
                    return true;
                }
                authorized = false;
                redirectTo = 'dashboard';
                message = 'This area requires administrator access.';
                break;

            default:
                console.warn('AccessGuard: Unknown protection level:', level);
                authorized = true;
        }

        if (authorized) {
            showContent();
            return true;
        } else {
            redirect(redirectTo, message);
            return false;
        }
    }

    // Add a visual indicator when God Mode is active
    function addGodModeBadge() {
        if (document.getElementById('god-mode-indicator')) return;

        const badge = document.createElement('div');
        badge.id = 'god-mode-indicator';
        badge.innerHTML = '👁️ GOD MODE';
        badge.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ffd700, #ff6b00);
            color: #000;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 0.1em;
            z-index: 99999;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            pointer-events: none;
        `;
        document.body.appendChild(badge);
    }

    // Add Master Key indicator (shows on protected pages when active)
    function addMasterKeyBadge() {
        // Check if indicator already exists
        if (document.getElementById('master-key-indicator')) return;

        // Show the full indicator with countdown
        showMasterKeyIndicator();
    }

    // Check multiple requirements (all must pass)
    function requireAll(...requirements) {
        hideContent();

        // Firebase Admin bypass — QC-4: with async verification
        if (isFirebaseAdmin()) {
            showContent();
            addFirebaseAdminBadge();
            _scheduleAsyncVerification('admin');
            return true;
        }

        // God Mode bypass
        if (hasGodMode()) {
            showContent();
            addGodModeBadge();
            return true;
        }

        // Master Key bypass
        if (hasMasterKey()) {
            showContent();
            addMasterKeyBadge();
            return true;
        }

        for (const req of requirements) {
            const [level, param] = Array.isArray(req) ? req : [req];
            // Don't hide/show during iteration, just check
            let passed = false;

            switch (level) {
                case 'sorted':
                    passed = isSorted();
                    break;
                case 'house':
                    // House hoppers can access any house
                    passed = isSorted() && (param === 'any' || isHouseHopper() || getUserHouse() === param);
                    break;
                case 'gate':
                    passed = hasPassedGatesUpTo(parseInt(param) || 1);
                    break;
                case 'dark-arts':
                    passed = hasPassedGatesUpTo(5);
                    break;
                case 'admin':
                    // QC-4: Firebase admin OR God Mode
                    passed = hasGodMode() || isFirebaseAdmin();
                    break;
                default:
                    passed = true;
            }

            if (!passed) {
                return require(level, param);  // Use single require for proper redirect
            }
        }

        showContent();
        return true;
    }

    // Allow any of multiple requirements (first match wins)
    function requireAny(...requirements) {
        hideContent();

        // Firebase Admin bypass — QC-4: with async verification
        if (isFirebaseAdmin()) {
            showContent();
            addFirebaseAdminBadge();
            _scheduleAsyncVerification('admin');
            return true;
        }

        // God Mode bypass
        if (hasGodMode()) {
            showContent();
            addGodModeBadge();
            return true;
        }

        // Master Key bypass
        if (hasMasterKey()) {
            showContent();
            addMasterKeyBadge();
            return true;
        }

        for (const req of requirements) {
            const [level, param] = Array.isArray(req) ? req : [req];
            let passed = false;

            switch (level) {
                case 'sorted':
                    passed = isSorted();
                    break;
                case 'house':
                    // House hoppers can access any house
                    passed = isSorted() && (param === 'any' || isHouseHopper() || getUserHouse() === param);
                    break;
                case 'gate':
                    passed = hasPassedGatesUpTo(parseInt(param) || 1);
                    break;
                case 'dark-arts':
                    passed = hasPassedGatesUpTo(5);
                    break;
                case 'admin':
                    // QC-4: Firebase admin OR God Mode
                    passed = hasGodMode() || isFirebaseAdmin();
                    break;
                default:
                    passed = true;
            }

            if (passed) {
                showContent();
                return true;
            }
        }

        // None passed - redirect based on first requirement
        const [level, param] = Array.isArray(requirements[0]) ? requirements[0] : [requirements[0]];
        return require(level, param);
    }

    // Show indicator if Master Key or Firebase Admin is active (for page navigation)
    function showIndicatorIfActive() {
        // Firebase Admin badge
        if (isFirebaseAdmin() && !document.getElementById('firebase-admin-indicator')) {
            addFirebaseAdminBadge();
        }
        // Master Key indicator
        if (hasMasterKey() && !document.getElementById('master-key-indicator')) {
            showMasterKeyIndicator();
        }
    }

    // Public API
    return {
        require,
        requireAll,
        requireAny,
        hasGodMode,
        toggleGodMode,
        // Firebase Admin system
        isFirebaseAdmin,
        getFirebaseUser,
        // Master Key system
        hasMasterKey,
        activateMasterKey,
        deactivateMasterKey,
        getMasterKeyRemaining,
        showIndicatorIfActive,
        // User status
        isSorted,
        getUserHouse,
        isDivergent,
        isHouseHopper,
        hasPassedGate,
        hasPassedGatesUpTo,
        showContent,
        hideContent
    };
})();

// Auto-execute: Hide content immediately on script load
(function() {
    // Immediately hide to prevent flash of content
    const style = document.createElement('style');
    style.id = 'access-guard-preload';
    style.textContent = 'body { visibility: hidden; }';
    document.head.appendChild(style);
})();

// Auto-show Master Key indicator on any page if active
document.addEventListener('DOMContentLoaded', function() {
    AccessGuard.showIndicatorIfActive();
});
