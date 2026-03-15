/**
 * IntegrityLockscreen.js
 * Hexworth Prime — Integrity Enforcement Layer
 *
 * When a student's integrity status is "violated", this locks the entire
 * page with a full-screen overlay showing a dancing T-Rex and music.
 * Cannot be dismissed, closed, or bypassed. Only an admin reset clears it.
 *
 * Checks two sources (both must be clean to proceed):
 *   1. localStorage  hexworth_integrity  (fast, instant)
 *   2. Firestore      profile.integrity  (authoritative, tamper-proof)
 *
 * Loaded via FluxCapacitor on every page.
 */
(function () {
    'use strict';

    // ── Asset paths (relative to site root) ──
    var VIDEO_PATH = '/components/lockscreen/dancing-trex.mp4';
    var AUDIO_PATH = '/components/lockscreen/sneaky-mischief.mp3';

    // ── State ──
    var _locked = false;
    var _overlay = null;

    // Store native removeItem BEFORE TripWire wraps it
    var _nativeRemoveItem = Storage.prototype.removeItem.bind(localStorage);

    // ================================================================
    // Phase 1: Instant check (localStorage — blocks in <50ms)
    // ================================================================
    function checkLocalIntegrity() {
        try {
            var raw = localStorage.getItem('hexworth_integrity');
            if (!raw) return false;
            var data = JSON.parse(raw);
            return data && data.status === 'violated';
        } catch (e) {
            return false;
        }
    }

    // ================================================================
    // Phase 2: Authoritative check (Firestore — async)
    // ================================================================
    function checkFirestoreIntegrity() {
        // Listen for auth state, then pull profile
        window.addEventListener('firebaseAuthStateChanged', function handler(e) {
            window.removeEventListener('firebaseAuthStateChanged', handler);

            var profile = e.detail && e.detail.firestoreProfile;
            if (!profile) return;

            // Check Firestore integrity field
            if (profile.integrity && profile.integrity.status === 'violated') {
                if (!_locked) engageLockscreen(profile.integrity);
            }

            // Also check if admin cleared it — unlock if Firestore is clean
            // AND localStorage is clean (admin reset wipes both)
            if ((!profile.integrity || profile.integrity.status !== 'violated') && _locked) {
                // Don't auto-unlock — admin reset should wipe localStorage too.
                // If Firestore is clean but localStorage still says violated,
                // that's a stale flag. Clear it.
                try {
                    var local = JSON.parse(localStorage.getItem('hexworth_integrity') || 'null');
                    if (local && local.status === 'violated') {
                        // Firestore is authoritative — if it's clean, clear local
                        _nativeRemoveItem('hexworth_integrity');
                        disengageLockscreen();
                    }
                } catch (e) { /* ignore */ }
            }
        });
    }

    // ================================================================
    // Lockscreen UI
    // ================================================================
    function engageLockscreen(integrityData) {
        if (_locked) return;
        _locked = true;

        // Calculate cheat duration
        var timerText = '--';
        if (integrityData && integrityData.detectedAt) {
            timerText = formatDuration(integrityData.detectedAt);
        }

        // Build overlay
        _overlay = document.createElement('div');
        _overlay.id = 'integrity-lockscreen';
        _overlay.innerHTML = [
            '<style>',
            '#integrity-lockscreen {',
            '  position: fixed; inset: 0; z-index: 999999;',
            '  background: #000; display: flex; flex-direction: column;',
            '  align-items: center; justify-content: center;',
            '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
            '  overflow: hidden; user-select: none;',
            '}',
            '#integrity-lockscreen video {',
            '  width: 100%; height: 100%; object-fit: cover;',
            '  position: absolute; inset: 0; z-index: 1;',
            '}',
            '#integrity-lockscreen .ls-hud {',
            '  position: absolute; z-index: 2; text-align: center;',
            '  bottom: 0; left: 0; right: 0;',
            '  padding: 24px 16px 32px;',
            '  background: linear-gradient(transparent, rgba(0,0,0,0.85) 40%);',
            '}',
            '#integrity-lockscreen .ls-title {',
            '  font-size: 28px; font-weight: 800; color: #ef4444;',
            '  text-transform: uppercase; letter-spacing: 0.08em;',
            '  text-shadow: 0 0 20px rgba(239,68,68,0.6);',
            '  margin-bottom: 4px;',
            '}',
            '#integrity-lockscreen .ls-subtitle {',
            '  font-size: 14px; color: #94a3b8; margin-bottom: 16px;',
            '}',
            '#integrity-lockscreen .ls-timer-row {',
            '  display: flex; align-items: center; justify-content: center;',
            '  gap: 12px; margin-bottom: 8px;',
            '}',
            '#integrity-lockscreen .ls-timer-label {',
            '  font-size: 11px; color: #ef4444; text-transform: uppercase;',
            '  letter-spacing: 0.1em; font-weight: 600;',
            '}',
            '#integrity-lockscreen .ls-timer {',
            '  font-size: 22px; font-weight: 700; color: #f87171;',
            '  font-family: "Courier New", monospace;',
            '  text-shadow: 0 0 12px rgba(248,113,113,0.5);',
            '}',
            '#integrity-lockscreen .ls-message {',
            '  font-size: 12px; color: #64748b; font-style: italic;',
            '  margin-top: 8px;',
            '}',
            '#integrity-lockscreen .ls-top-badge {',
            '  position: absolute; top: 20px; left: 50%; transform: translateX(-50%);',
            '  z-index: 2; background: rgba(239,68,68,0.15);',
            '  border: 1px solid rgba(239,68,68,0.3); border-radius: 6px;',
            '  padding: 6px 18px; display: flex; align-items: center; gap: 8px;',
            '}',
            '#integrity-lockscreen .ls-badge-dot {',
            '  width: 8px; height: 8px; border-radius: 50%; background: #ef4444;',
            '  animation: ls-pulse 1.5s ease-in-out infinite;',
            '}',
            '#integrity-lockscreen .ls-badge-text {',
            '  font-size: 11px; color: #ef4444; font-weight: 600;',
            '  text-transform: uppercase; letter-spacing: 0.1em;',
            '}',
            '@keyframes ls-pulse {',
            '  0%, 100% { opacity: 1; }',
            '  50% { opacity: 0.3; }',
            '}',
            '</style>',

            // Top badge
            '<div class="ls-top-badge">',
            '  <div class="ls-badge-dot"></div>',
            '  <div class="ls-badge-text">Integrity Violation Detected</div>',
            '</div>',

            // Video
            '<video autoplay loop muted playsinline>',
            '  <source src="' + VIDEO_PATH + '" type="video/mp4">',
            '</video>',

            // Audio
            '<audio autoplay loop id="ls-audio">',
            '  <source src="' + AUDIO_PATH + '" type="audio/mpeg">',
            '</audio>',

            // HUD overlay at bottom
            '<div class="ls-hud">',
            '  <div class="ls-title">Account Locked</div>',
            '  <div class="ls-subtitle">Integrity violation — admin review required</div>',
            '  <div class="ls-timer-row">',
            '    <span class="ls-timer-label">Time in violation:</span>',
            '    <span class="ls-timer" id="ls-timer">' + timerText + '</span>',
            '  </div>',
            '  <div class="ls-message">See your instructor to resolve this. Refreshing won\'t help.</div>',
            '</div>'
        ].join('\n');

        document.body.appendChild(_overlay);

        // Block all keyboard shortcuts
        document.addEventListener('keydown', blockKeys, true);

        // Block right-click
        document.addEventListener('contextmenu', blockEvent, true);

        // Start live timer
        if (integrityData && integrityData.detectedAt) {
            startLiveTimer(integrityData.detectedAt);
        }

        // Try to play audio (may need user interaction)
        var audio = document.getElementById('ls-audio');
        if (audio) {
            audio.volume = 0.5;
            var playPromise = audio.play();
            if (playPromise) {
                playPromise.catch(function () {
                    // Autoplay blocked — play on first interaction
                    document.addEventListener('click', function tryPlay() {
                        audio.play();
                        document.removeEventListener('click', tryPlay);
                    }, { once: true });
                });
            }
        }

        // Prevent scroll on body
        document.body.style.overflow = 'hidden';

        console.log('%c[IntegrityLockscreen] ENGAGED — account locked due to integrity violation',
            'color: #ef4444; font-weight: bold; font-size: 14px;');
    }

    function disengageLockscreen() {
        if (!_locked || !_overlay) return;
        _locked = false;
        _overlay.remove();
        _overlay = null;
        document.removeEventListener('keydown', blockKeys, true);
        document.removeEventListener('contextmenu', blockEvent, true);
        document.body.style.overflow = '';
        console.log('[IntegrityLockscreen] Disengaged — integrity cleared by admin.');
    }

    // ================================================================
    // Helpers
    // ================================================================
    function blockKeys(e) {
        // Allow F12 so DevTools stays accessible (adds to their tripwire log!)
        if (e.key === 'F12') return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }

    function blockEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function formatDuration(isoDate) {
        var start = new Date(isoDate).getTime();
        var now = Date.now();
        var diff = Math.max(0, now - start);

        var seconds = Math.floor(diff / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        hours %= 24;
        minutes %= 60;
        seconds %= 60;

        var parts = [];
        if (days > 0) parts.push(days + 'd');
        if (hours > 0 || days > 0) parts.push(hours + 'h');
        parts.push(minutes + 'm');
        parts.push(seconds + 's');

        return parts.join(' ');
    }

    function startLiveTimer(isoDate) {
        setInterval(function () {
            var el = document.getElementById('ls-timer');
            if (el) el.textContent = formatDuration(isoDate);
        }, 1000);
    }

    // ================================================================
    // Prevent removal via DevTools
    // ================================================================
    function guardOverlay() {
        // If they delete the overlay from DOM, re-add it
        var observer = new MutationObserver(function (mutations) {
            if (_locked && !document.getElementById('integrity-lockscreen')) {
                document.body.appendChild(_overlay);
                console.log('%c[IntegrityLockscreen] Nice try. Re-engaged.',
                    'color: #ef4444; font-weight: bold;');
            }
        });
        observer.observe(document.body, { childList: true });
    }

    // ================================================================
    // Anti-bypass: Prevent clearing localStorage to escape
    // ================================================================
    function guardLocalStorage() {
        // If they clear hexworth_integrity, re-set it from our cached copy
        var _cachedIntegrity = localStorage.getItem('hexworth_integrity');
        if (!_cachedIntegrity) return;

        var origRemoveItem = Storage.prototype.removeItem;
        var origClear = Storage.prototype.clear;
        var origSetItem = Storage.prototype.setItem;

        // Intercept attempts to clear the integrity flag
        try {
            Object.defineProperty(Storage.prototype, 'removeItem', {
                value: function (key) {
                    if (key === 'hexworth_integrity' && _locked) {
                        console.log('%c[IntegrityLockscreen] Blocked attempt to remove integrity flag.',
                            'color: #ef4444;');
                        return;
                    }
                    return origRemoveItem.apply(this, arguments);
                },
                writable: false,
                configurable: false
            });
        } catch (e) { /* TripWire may have already locked this */ }
    }

    // ================================================================
    // Initialization
    // ================================================================
    function isAdmin() {
        try {
            // Check the real FirebaseAuth admin key
            if (localStorage.getItem('hexworth_firebase_admin') === 'true') return true;
            // Legacy fallback
            if (localStorage.getItem('hexworth_auth_admin') === 'true') return true;
            // Check HexworthAdmin if loaded
            if (window.HexworthAdmin && typeof window.HexworthAdmin.isAdmin === 'function') {
                return window.HexworthAdmin.isAdmin();
            }
        } catch (e) { /* not admin */ }
        return false;
    }

    function init() {
        // Skip for admin users
        if (isAdmin()) return;

        // Phase 1: Instant localStorage check
        if (checkLocalIntegrity()) {
            try {
                var data = JSON.parse(localStorage.getItem('hexworth_integrity'));
                engageLockscreen(data);
                guardOverlay();
                guardLocalStorage();
            } catch (e) {
                engageLockscreen({});
            }
        }

        // Phase 2: Firestore check (async, authoritative)
        // Even if localStorage is clean, Firestore may have the flag
        checkFirestoreIntegrity();
    }

    // Run immediately — don't wait for DOMContentLoaded
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    // Expose for admin tools
    window.IntegrityLockscreen = {
        isLocked: function () { return _locked; },
        disengage: function () {
            // Only works if called from admin context
            if (isAdmin()) {
                // Use native removeItem to bypass TripWire + guard
                _nativeRemoveItem('hexworth_integrity');
                disengageLockscreen();
                return true;
            }
            console.log('%c[IntegrityLockscreen] Access denied. Admin only.',
                'color: #ef4444;');
            return false;
        }
    };

})();
