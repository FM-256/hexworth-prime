/**
 * AnalyticsHealth — staleness banner for the analytics-v2 projector pipeline.
 *
 * Architecture: _docs/architecture/student-analytics-v2.md §7.1, §7.4
 *
 * Reads /analytics_v2/projectorHeartbeat and surfaces a small visible banner
 * if the projector pipeline appears stale (no heartbeat in >5 minutes).
 * This is the self-heal observability surface — the UI tells the operator
 * when analytics dashboards may be showing stale projection data, rather
 * than silently failing.
 *
 * Usage:
 *   AnalyticsHealth.attach({
 *     fbFirestore,                    // firebase/firestore module
 *     firestore,                      // firestore instance
 *     containerSelector: '#statusbar',// where to insert the banner
 *     thresholdSec: 300,              // 5min default (arch §7.1)
 *     debug: false,
 *   });
 *
 * The banner self-removes when projector recovers. Non-blocking; never
 * affects core functionality. Polls heartbeat doc every 60s.
 */
(function() {
    'use strict';

    let _config = null;
    let _bannerEl = null;
    let _pollTimer = null;

    function _ensureBanner(container) {
        if (_bannerEl) return _bannerEl;
        _bannerEl = document.createElement('div');
        _bannerEl.id = 'analytics-health-banner';
        _bannerEl.style.cssText = [
            'display: none',
            'background: rgba(251, 191, 36, 0.12)',
            'border: 1px solid rgba(251, 191, 36, 0.4)',
            'color: #fbbf24',
            'padding: 6px 12px',
            'border-radius: 4px',
            'font-size: 0.78rem',
            'font-family: var(--vc-font, system-ui, sans-serif)',
            'margin: 4px 0',
        ].join(';');
        _bannerEl.setAttribute('role', 'status');
        _bannerEl.setAttribute('aria-live', 'polite');
        container.appendChild(_bannerEl);
        return _bannerEl;
    }

    function _show(message) {
        if (!_bannerEl) return;
        _bannerEl.textContent = message;
        _bannerEl.style.display = 'block';
    }

    function _hide() {
        if (!_bannerEl) return;
        _bannerEl.style.display = 'none';
    }

    async function _poll() {
        if (!_config) return;
        try {
            const { firestore, fbFirestore } = _config;
            const docRef = fbFirestore.doc(firestore, 'analytics_v2/projectorHeartbeat');
            const snap = await fbFirestore.getDoc(docRef);
            if (!snap.exists()) {
                // Heartbeat doc not yet created — projector hasn't run yet
                if (_config.debug) console.log('[AnalyticsHealth] no heartbeat doc yet');
                return;
            }
            const data = snap.data();
            const ts = data && data.lastBeatAt;
            if (!ts) return;
            // Firestore Timestamps from web SDK
            const lastBeatMs = ts.toMillis ? ts.toMillis() : new Date(ts).getTime();
            const ageSec = (Date.now() - lastBeatMs) / 1000;
            if (ageSec > _config.thresholdSec) {
                const ageMin = Math.floor(ageSec / 60);
                _show(`Analytics may be stale — projector last updated ${ageMin} minute(s) ago.`);
            } else {
                _hide();
            }
        } catch (e) {
            // Silent — health check failures must never block the app
            if (_config.debug) console.warn('[AnalyticsHealth] poll error:', e.message);
        }
    }

    function attach(config) {
        if (_config) return;  // already attached
        if (!config || !config.firestore || !config.fbFirestore) {
            console.warn('[AnalyticsHealth] missing firestore/fbFirestore — banner disabled');
            return;
        }
        const container = (typeof config.container === 'string')
            ? document.querySelector(config.container)
            : (config.container || document.body);
        if (!container) {
            console.warn('[AnalyticsHealth] container not found — banner disabled');
            return;
        }
        _config = {
            firestore: config.firestore,
            fbFirestore: config.fbFirestore,
            thresholdSec: config.thresholdSec || 300,  // 5 min per arch §7.1
            debug: !!config.debug,
        };
        _ensureBanner(container);
        // Initial check + poll every 60s
        _poll();
        _pollTimer = setInterval(_poll, 60 * 1000);
    }

    function detach() {
        if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
        if (_bannerEl && _bannerEl.parentNode) _bannerEl.parentNode.removeChild(_bannerEl);
        _bannerEl = null;
        _config = null;
    }

    window.AnalyticsHealth = { attach, detach };
})();
