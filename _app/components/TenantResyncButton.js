/**
 * TenantResyncButton.js — Tenant Dashboard Manual Cloud Resync
 *
 * Injects a "Sync Progress" section into tenant dashboards
 * (/tenant/dashboard-{variant}.html) with two buttons:
 *   - Refresh from cloud → FirestoreManager.syncBidirectional (additive)
 *   - Restore → confirm-gated → FirestoreManager.restoreFromCloud
 *
 * Companion to ProgressRestore.js (which auto-fires syncBidirectional on
 * auth state change). This component gives tenant students a MANUAL lever
 * when auto-sync doesn't bring back what they expected.
 *
 * Anchor strategy (Nancy-verified 2026-05-18):
 *   - 5 of 9 production tenant dashboards have <div id="card-grid"> —
 *     primary anchor (button injects right after card grid, inline)
 *   - 4 of 9 (clean-ops, command-center, enterprise, tactical-hud) lack
 *     card-grid — fallback to id="tenant-app", which exists on ALL 9
 *
 * Concurrency: every call goes through FirestoreManager's _syncInFlight
 * mutex. If ProgressRestore is mid-sync when the user clicks the button,
 * we surface "Sync already in progress" rather than racing.
 *
 * Dependencies (must load BEFORE this script):
 *   - FirebaseAuth.js
 *   - FirestoreManager.js
 *
 * @feature Phase 5 (2026-05-18) cloud-progress resync
 */
(function () {
    'use strict';

    if (window._tenantResyncButtonInitialized) return;
    window._tenantResyncButtonInitialized = true;

    var _intervalHandle = null;
    var _containerEl = null;
    var _statusEl = null;

    // ── Styles (variant-neutral; subtle and inline-able) ──────────────
    function injectStyles() {
        if (document.getElementById('tenant-resync-styles')) return;
        var style = document.createElement('style');
        style.id = 'tenant-resync-styles';
        style.textContent =
            '.tenant-resync-section{margin:32px auto 32px;padding:18px 22px;max-width:560px;' +
            'border-radius:10px;background:rgba(255,255,255,0.04);' +
            'border:1px solid rgba(255,255,255,0.08);' +
            'font-family:Inter,system-ui,-apple-system,sans-serif;text-align:center;}' +
            '.tenant-resync-title{font-size:0.9rem;color:#c8d0e0;margin-bottom:4px;' +
            'font-weight:600;letter-spacing:0.02em;}' +
            '.tenant-resync-status{font-size:0.75rem;color:#6b7394;margin-bottom:14px;}' +
            '.tenant-resync-buttons{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}' +
            '.tenant-resync-btn{padding:8px 18px;background:rgba(6,182,212,0.12);' +
            'border:1px solid rgba(6,182,212,0.35);color:#06b6d4;border-radius:6px;' +
            'cursor:pointer;font-size:0.85rem;font-family:inherit;font-weight:500;' +
            'transition:background 0.15s ease;}' +
            '.tenant-resync-btn:hover:not(:disabled){background:rgba(6,182,212,0.22);}' +
            '.tenant-resync-btn:disabled{opacity:0.5;cursor:not-allowed;}' +
            '.tenant-resync-btn.tenant-resync-secondary{' +
            'background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.18);' +
            'color:#c8d0e0;}' +
            '.tenant-resync-btn.tenant-resync-secondary:hover:not(:disabled){' +
            'background:rgba(255,255,255,0.08);}';
        document.head.appendChild(style);
    }

    // ── Time formatter (matches dashboard.html _formatLastSyncISO) ────
    function formatLastSync(iso) {
        if (!iso) return 'never';
        try {
            var then = new Date(iso).getTime();
            if (isNaN(then)) return 'never';
            var secs = Math.floor((Date.now() - then) / 1000);
            if (secs < 60) return 'just now';
            if (secs < 3600) return Math.floor(secs / 60) + ' min ago';
            if (secs < 86400) return Math.floor(secs / 3600) + ' hr ago';
            return Math.floor(secs / 86400) + ' day(s) ago';
        } catch (e) { return 'never'; }
    }

    function refreshStatusLine() {
        if (!_statusEl) return;
        var iso = null;
        try { iso = localStorage.getItem('hexworth_last_cloud_sync'); } catch (e) {}
        _statusEl.textContent = 'Last cloud sync: ' + formatLastSync(iso);
    }

    // ── Click handlers ────────────────────────────────────────────────
    function getSignedInUid() {
        if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn ||
            !FirebaseAuth.isSignedIn()) {
            return null;
        }
        var u = FirebaseAuth.getUser && FirebaseAuth.getUser();
        return (u && u.uid) ? u.uid : null;
    }

    function setButtonsBusy(busy, busyLabel) {
        var btns = _containerEl ? _containerEl.querySelectorAll('.tenant-resync-btn') : [];
        for (var i = 0; i < btns.length; i++) {
            btns[i].disabled = busy;
        }
        var refresh = document.getElementById('tenant-resync-refresh');
        if (refresh) refresh.textContent = busy ? (busyLabel || 'Working...') : 'Refresh from cloud';
        var restore = document.getElementById('tenant-resync-restore');
        if (restore) restore.textContent = busy ? '...' : 'Restore';
    }

    async function onRefreshClick() {
        var uid = getSignedInUid();
        if (!uid) { alert('Sign in first to sync from the cloud.'); return; }
        if (typeof FirestoreManager === 'undefined' || !FirestoreManager.syncBidirectional) {
            alert('Cloud sync unavailable right now. Try again in a moment.');
            return;
        }
        setButtonsBusy(true, 'Refreshing...');
        try {
            var result = await FirestoreManager.syncBidirectional(uid);
            if (result && result.skipped) {
                alert('Sync already in progress — try again in a moment.');
            } else if (result && result.synced) {
                var added = result.addedToLocal || 0;
                alert(added > 0
                    ? 'Refreshed — pulled ' + added + ' item(s) from cloud.\nReload the page to see them.'
                    : 'Refreshed — local is already up to date with cloud.');
            } else {
                alert('Refresh did not complete. Reason: ' + (result && result.reason || 'unknown'));
            }
        } catch (err) {
            alert('Refresh failed: ' + (err && err.message || err));
        } finally {
            setButtonsBusy(false);
            refreshStatusLine();
        }
    }

    async function onRestoreClick() {
        var uid = getSignedInUid();
        if (!uid) { alert('Sign in first to restore from the cloud.'); return; }
        // Enumerated-clobber confirm dialog — Nancy-required so students
        // know theme + house get REPLACED. Quizzes/streak are merge-safe
        // (Phase 1 fix in FirestoreManager).
        var confirmText =
            'Restore from cloud?\n\n' +
            'This will:\n' +
            '  • Merge cloud modules/labs/quizzes into local (additive — nothing removed)\n' +
            '  • Take the higher of local/cloud streak\n' +
            '  • REPLACE your theme with the cloud value\n' +
            '  • REPLACE your house assignment with the cloud value\n\n' +
            'Use this only if "Refresh from cloud" did NOT bring back missing progress.';
        if (!confirm(confirmText)) return;

        if (typeof FirestoreManager === 'undefined' || !FirestoreManager.restoreFromCloud) {
            alert('Cloud restore unavailable right now. Try again in a moment.');
            return;
        }
        setButtonsBusy(true, 'Restoring...');
        try {
            var result = await FirestoreManager.restoreFromCloud(uid);
            if (result && result.skipped) {
                alert('Sync already in progress — try again in a moment.');
            } else if (result && result.restored) {
                alert('Restore complete. Reloading to apply changes...');
                location.reload();
            } else {
                alert('Restore did not complete. Reason: ' + (result && result.reason || 'unknown'));
            }
        } catch (err) {
            alert('Restore failed: ' + (err && err.message || err));
        } finally {
            setButtonsBusy(false);
            refreshStatusLine();
        }
    }

    // ── DOM injection ─────────────────────────────────────────────────
    function buildContainer() {
        var section = document.createElement('section');
        section.className = 'tenant-resync-section';
        section.setAttribute('aria-label', 'Cloud progress resync');

        var title = document.createElement('div');
        title.className = 'tenant-resync-title';
        title.textContent = 'Sync Progress';

        var status = document.createElement('div');
        status.className = 'tenant-resync-status';
        status.id = 'tenant-resync-status';
        status.textContent = 'Last cloud sync: never';

        var btnRow = document.createElement('div');
        btnRow.className = 'tenant-resync-buttons';

        var refreshBtn = document.createElement('button');
        refreshBtn.className = 'tenant-resync-btn';
        refreshBtn.id = 'tenant-resync-refresh';
        refreshBtn.textContent = 'Refresh from cloud';
        refreshBtn.addEventListener('click', onRefreshClick);

        var restoreBtn = document.createElement('button');
        restoreBtn.className = 'tenant-resync-btn tenant-resync-secondary';
        restoreBtn.id = 'tenant-resync-restore';
        restoreBtn.textContent = 'Restore';
        restoreBtn.addEventListener('click', onRestoreClick);

        btnRow.appendChild(refreshBtn);
        btnRow.appendChild(restoreBtn);
        section.appendChild(title);
        section.appendChild(status);
        section.appendChild(btnRow);

        return { section: section, statusEl: status };
    }

    function injectContainer() {
        if (_containerEl) return; // already injected
        injectStyles();
        var built = buildContainer();
        _containerEl = built.section;
        _statusEl = built.statusEl;

        // Two-tier anchor (Nancy-verified coverage 9 of 9 dashboards):
        //   1. #card-grid (5 variants: academy, campus, federal, minimalist, nightshift)
        //   2. fallback: #tenant-app (all 9 — universal anchor)
        var grid = document.getElementById('card-grid');
        if (grid && grid.parentNode) {
            grid.parentNode.insertBefore(_containerEl, grid.nextSibling);
        } else {
            var fallback = document.getElementById('tenant-app');
            if (fallback) {
                fallback.appendChild(_containerEl);
            } else {
                document.body.appendChild(_containerEl); // last-resort
            }
        }
        refreshStatusLine();
    }

    function removeContainer() {
        if (_containerEl && _containerEl.parentNode) {
            _containerEl.parentNode.removeChild(_containerEl);
        }
        _containerEl = null;
        _statusEl = null;
    }

    function startIntervalRefresher() {
        if (_intervalHandle) return;
        _intervalHandle = setInterval(refreshStatusLine, 60 * 1000);
    }
    function stopIntervalRefresher() {
        if (_intervalHandle) {
            clearInterval(_intervalHandle);
            _intervalHandle = null;
        }
    }

    function applyAuthState(user) {
        if (user && user.uid) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', injectContainer);
            } else {
                injectContainer();
            }
            startIntervalRefresher();
        } else {
            stopIntervalRefresher();
            removeContainer();
        }
    }

    // Wire to auth state changes from FirebaseAuth.js (the canonical
    // dispatch source; not page-shell-dependent — fires on every page
    // that loads FirebaseAuth.js, sign-in AND sign-out).
    window.addEventListener('firebaseAuthStateChanged', function (e) {
        var user = (e && e.detail && e.detail.user) || null;
        applyAuthState(user);
    });

    // If FirebaseAuth has already resolved by the time this script runs,
    // probe initial state so we don't wait for the next event.
    if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
        var initialUser = FirebaseAuth.getUser();
        if (initialUser) applyAuthState(initialUser);
    }
})();
