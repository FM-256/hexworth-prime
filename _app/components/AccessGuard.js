/**
 * AccessGuard.js - Content Access Control System
 *
 * Prevents direct file access to protected content.
 * Each module page includes this script which verifies the user
 * has proper authorization before allowing the page to render.
 *
 * Protection Levels:
 * - SORTED: User must have completed house sorting
 * - HOUSE: User must belong to specific house (or have God Mode)
 * - GATE: User must have passed specific Dark Arts gate
 * - ADMIN: User must have God Mode enabled
 *
 * Usage (add to protected pages):
 *   <script src="../../components/AccessGuard.js"></script>
 *   <script>
 *     AccessGuard.require('sorted');                    // Must be sorted
 *     AccessGuard.require('house', 'shield');           // Must be in Shield house
 *     AccessGuard.require('gate', 3);                   // Must have passed gate 3
 *     AccessGuard.require('admin');                     // Must have God Mode
 *   </script>
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const AccessGuard = (function() {
    'use strict';

    // Configuration
    const config = {
        redirectDelay: 100,  // ms before redirect
        storageKeys: {
            house: 'hexworth_house',
            theme: 'hexworth_theme',
            godMode: 'hexworth_god_mode',
            gatePrefix: 'gate',
            gateAnswerPrefix: 'gate'
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
        // Fallback: count directory depth
        const depth = (path.match(/\//g) || []).length - 1;
        return '../'.repeat(Math.max(0, depth - 1));
    }

    // Check if user has God Mode (bypasses all checks)
    function hasGodMode() {
        return localStorage.getItem(config.storageKeys.godMode) === 'true';
    }

    // Check if user has been sorted
    function isSorted() {
        return localStorage.getItem(config.storageKeys.house) !== null;
    }

    // Get user's house
    function getUserHouse() {
        return localStorage.getItem(config.storageKeys.house);
    }

    // Check if user has passed a specific Dark Arts gate
    function hasPassedGate(gateNumber) {
        const key = `${config.storageKeys.gatePrefix}${gateNumber}_complete`;
        return localStorage.getItem(key) === 'true';
    }

    // Check if user has passed all gates up to specified number
    function hasPassedGatesUpTo(gateNumber) {
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
        const style = document.getElementById('access-guard-hide');
        if (style) {
            style.remove();
        }
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
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

    // Main requirement check
    function require(level, param) {
        // Hide content immediately
        hideContent();

        // God Mode bypasses everything except explicit admin-only
        if (hasGodMode() && level !== 'admin-only') {
            showContent();
            addGodModeBadge();
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
                }
                break;

            case 'admin':
            case 'admin-only':
                // Must have God Mode - no bypass
                authorized = hasGodMode();
                if (!authorized) {
                    redirectTo = 'dashboard';
                    message = 'This area requires administrator access.';
                }
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

    // Check multiple requirements (all must pass)
    function requireAll(...requirements) {
        hideContent();

        // God Mode bypass
        if (hasGodMode()) {
            showContent();
            addGodModeBadge();
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
                    passed = isSorted() && (param === 'any' || getUserHouse() === param);
                    break;
                case 'gate':
                    passed = hasPassedGatesUpTo(parseInt(param) || 1);
                    break;
                case 'dark-arts':
                    passed = hasPassedGatesUpTo(5);
                    break;
                case 'admin':
                    passed = hasGodMode();
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

        // God Mode bypass
        if (hasGodMode()) {
            showContent();
            addGodModeBadge();
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
                    passed = isSorted() && (param === 'any' || getUserHouse() === param);
                    break;
                case 'gate':
                    passed = hasPassedGatesUpTo(parseInt(param) || 1);
                    break;
                case 'dark-arts':
                    passed = hasPassedGatesUpTo(5);
                    break;
                case 'admin':
                    passed = hasGodMode();
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

    // Public API
    return {
        require,
        requireAll,
        requireAny,
        hasGodMode,
        isSorted,
        getUserHouse,
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
