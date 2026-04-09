/**
 * EngagementTracker.js - Student Engagement Analytics Engine
 *
 * Tracks student interaction data for hotspot and dropout detection:
 * - Time on page (accumulated across sessions)
 * - Scroll depth (maximum percentage reached)
 * - Interaction events (clicks on interactive elements)
 * - Section visibility (Intersection Observer)
 * - Exit point (last visible section on unload)
 * - Quiz patterns (first-try pass rate, retries)
 * - Session metadata (timestamp, duration, device, referrer)
 *
 * Data writes to: users/{uid}/engagement/{moduleId}
 * Merges with existing data — never overwrites previous sessions.
 *
 * Firestore rules for engagement data:
 * match /users/{userId}/engagement/{moduleId} {
 *   allow read, write: if request.auth != null && request.auth.uid == userId;
 * }
 *
 * @author Hexworth Prime
 * @version 1.0.0
 */

const EngagementTracker = (function() {
    'use strict';

    // ─── State ───────────────────────────────────────────────────
    let _moduleId = null;
    let _house = null;
    let _startTime = null;
    let _elapsedMs = 0;
    let _maxScrollDepth = 0;
    let _interactionCount = 0;
    let _sectionsViewed = new Set();
    let _exitSection = null;
    let _customEvents = [];
    let _flushed = false;
    let _initialized = false;
    let _observer = null;
    let _scrollTimer = null;
    let _hiddenAt = null;

    // ─── Device Detection ────────────────────────────────────────
    function _detectDevice() {
        const ua = navigator.userAgent || '';
        if (/Mobi|Android/i.test(ua) && !/iPad|Tablet/i.test(ua)) return 'mobile';
        if (/iPad|Tablet|PlayBook/i.test(ua) || (navigator.maxTouchPoints > 1 && /Mac/i.test(ua))) return 'tablet';
        return 'desktop';
    }

    // ─── Module ID Resolution ────────────────────────────────────
    function _resolveModuleId() {
        // 1. data attribute on body or html
        const fromAttr = document.body?.dataset?.moduleId
            || document.documentElement?.dataset?.moduleId;
        if (fromAttr) return fromAttr;

        // 2. ModuleProgress config if already initialized
        if (typeof ModuleProgress !== 'undefined' && ModuleProgress._config?.moduleId) {
            return ModuleProgress._config.moduleId;
        }

        // 3. Parse from ModuleProgress.init() script tag
        const scripts = document.querySelectorAll('script');
        for (const s of scripts) {
            const text = s.textContent || '';
            const match = text.match(/ModuleProgress\.init\(\s*\{\s*moduleId\s*:\s*['"]([^'"]+)['"]/);
            if (match) return match[1];
        }

        return null;
    }

    function _resolveHouse() {
        const fromAttr = document.body?.dataset?.house
            || document.documentElement?.dataset?.house;
        if (fromAttr) return fromAttr;

        // Infer from URL path: /houses/{houseId}/
        const pathMatch = location.pathname.match(/\/houses\/([^/]+)\//);
        if (pathMatch) return pathMatch[1];

        return null;
    }

    // ─── UID Helper ──────────────────────────────────────────────
    function _getUid() {
        if (typeof FirebaseAuth !== 'undefined') {
            const user = FirebaseAuth.getUser();
            return user?.uid || null;
        }
        return null;
    }

    // ─── Scroll Depth (debounced) ────────────────────────────────
    function _onScroll() {
        if (_scrollTimer) return;
        _scrollTimer = setTimeout(() => {
            _scrollTimer = null;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            const viewportHeight = window.innerHeight;
            const maxScroll = docHeight - viewportHeight;
            if (maxScroll > 0) {
                const depth = Math.min(1, scrollTop / maxScroll);
                if (depth > _maxScrollDepth) _maxScrollDepth = depth;
            }
        }, 250);
    }

    // ─── Section Visibility (Intersection Observer) ──────────────
    function _initSectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const sections = document.querySelectorAll(
            'section[id], [data-section], .slide, .module-section, article[id]'
        );
        if (sections.length === 0) return;

        _observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const id = entry.target.id
                        || entry.target.dataset.section
                        || entry.target.className.split(/\s+/)[0]
                        || 'unknown';
                    _sectionsViewed.add(id);
                    _exitSection = id;
                }
            }
        }, { threshold: 0.3 });

        for (const section of sections) {
            _observer.observe(section);
        }
    }

    // ─── Interaction Tracking ────────────────────────────────────
    function _onInteraction(e) {
        const target = e.target;
        if (!target) return;

        // Only count meaningful interactions
        const isInteractive = target.closest(
            'button, a, input, select, textarea, [role="button"], ' +
            '[data-interactive], .quiz-option, .tab-btn, .accordion-header, ' +
            '.game-btn, .lab-terminal, .code-runner'
        );
        if (isInteractive) {
            _interactionCount++;
        }
    }

    // ─── Visibility Change (pause/resume timer) ─────────────────
    function _onVisibilityChange() {
        if (document.hidden) {
            // Page hidden — accumulate elapsed time
            if (_startTime) {
                _elapsedMs += performance.now() - _startTime;
                _startTime = null;
            }
            _hiddenAt = Date.now();
        } else {
            // Page visible again — restart timer
            _startTime = performance.now();
            _hiddenAt = null;
        }
    }

    // ─── Firestore Write ─────────────────────────────────────────
    async function _writeToFirestore(data) {
        try {
            const uid = _getUid();
            if (!uid || !_moduleId) return false;

            // Ensure FirestoreManager is initialized
            if (typeof FirestoreManager !== 'undefined') {
                await FirestoreManager.init();
            }

            if (!window.firebaseFirestore) return false;

            const { doc, getDoc, setDoc, getFirestore, getApps, serverTimestamp } = window.firebaseFirestore;
            const firebaseApp = window.firebaseApp;
            if (!firebaseApp || !getApps || getApps().length === 0) return false;

            const db = getFirestore(getApps()[0]);
            const engagementRef = doc(db, 'users', uid, 'engagement', _moduleId);

            // Read existing document to merge
            let existing = {};
            try {
                const snap = await getDoc(engagementRef);
                if (snap.exists()) existing = snap.data();
            } catch (_) {
                // First write or offline — proceed with empty merge
            }

            // Merge logic: accumulate, don't overwrite
            const merged = {
                moduleId: _moduleId,
                house: _house || existing.house || null,
                totalTimeSeconds: Math.round(
                    (existing.totalTimeSeconds || 0) + data.sessionSeconds
                ),
                sessions: (existing.sessions || 0) + 1,
                lastVisit: serverTimestamp(),
                maxScrollDepth: Math.max(
                    existing.maxScrollDepth || 0,
                    data.maxScrollDepth
                ),
                sectionsViewed: _uniqueArray(
                    existing.sectionsViewed || [],
                    data.sectionsViewed
                ),
                exitSection: data.exitSection || existing.exitSection || null,
                interactionCount: (existing.interactionCount || 0) + data.interactionCount,
                deviceType: data.deviceType,
                customEvents: _trimEvents(
                    (existing.customEvents || []).concat(data.customEvents)
                )
            };

            // Preserve completedAt if it was set previously
            if (existing.completedAt) {
                merged.completedAt = existing.completedAt;
            }

            await setDoc(engagementRef, merged);
            return true;
        } catch (err) {
            console.warn('[EngagementTracker] Firestore write failed:', err.message);
            return false;
        }
    }

    // ─── Utilities ───────────────────────────────────────────────
    function _uniqueArray(existing, incoming) {
        const set = new Set([...existing, ...incoming]);
        return Array.from(set);
    }

    function _trimEvents(events) {
        // Keep last 50 custom events to prevent unbounded growth
        if (events.length > 50) return events.slice(-50);
        return events;
    }

    function _buildPayload() {
        // Finalize elapsed time
        let sessionMs = _elapsedMs;
        if (_startTime) {
            sessionMs += performance.now() - _startTime;
        }

        return {
            sessionSeconds: Math.round(sessionMs / 1000),
            maxScrollDepth: Math.round(_maxScrollDepth * 100) / 100,
            sectionsViewed: Array.from(_sectionsViewed),
            exitSection: _exitSection,
            interactionCount: _interactionCount,
            deviceType: _detectDevice(),
            customEvents: _customEvents,
            referrer: document.referrer || null,
            timestamp: Date.now()
        };
    }

    // ─── Flush (write data to Firestore) ─────────────────────────
    async function flush() {
        if (_flushed || !_initialized) return;
        _flushed = true;

        const payload = _buildPayload();

        // Skip trivial sessions (under 2 seconds, likely accidental)
        if (payload.sessionSeconds < 2) return;

        await _writeToFirestore(payload);
    }

    // ─── Teardown ────────────────────────────────────────────────
    function _teardown() {
        if (_observer) {
            _observer.disconnect();
            _observer = null;
        }
        window.removeEventListener('scroll', _onScroll, { passive: true });
        document.removeEventListener('click', _onInteraction, true);
        document.removeEventListener('visibilitychange', _onVisibilityChange);
    }

    // ─── Unload Handlers ─────────────────────────────────────────
    function _onBeforeUnload() {
        flush();
    }

    function _onPageHide() {
        flush();
    }

    // ─── Init ────────────────────────────────────────────────────
    function init(moduleId, house) {
        if (_initialized) return;

        _moduleId = moduleId || _resolveModuleId();
        _house = house || _resolveHouse();

        if (!_moduleId) {
            // No module context — nothing to track
            return;
        }

        _initialized = true;
        _flushed = false;
        _startTime = performance.now();
        _elapsedMs = 0;
        _maxScrollDepth = 0;
        _interactionCount = 0;
        _sectionsViewed = new Set();
        _exitSection = null;
        _customEvents = [];

        // Attach listeners
        window.addEventListener('scroll', _onScroll, { passive: true });
        document.addEventListener('click', _onInteraction, true);
        document.addEventListener('visibilitychange', _onVisibilityChange);

        // Use pagehide (more reliable than beforeunload on mobile)
        window.addEventListener('pagehide', _onPageHide);
        window.addEventListener('beforeunload', _onBeforeUnload);

        // Section observer (deferred to not block page load)
        if (document.readyState === 'complete') {
            _initSectionObserver();
        } else {
            window.addEventListener('load', _initSectionObserver, { once: true });
        }

        console.log(`[EngagementTracker] Tracking: ${_moduleId} (${_house || 'unknown house'})`);
    }

    // ─── Track Custom Event ──────────────────────────────────────
    function trackEvent(name, data) {
        if (!_initialized) return;
        _customEvents.push({
            name: name,
            data: data || {},
            at: Math.round((performance.now() - (_startTime || 0)) / 1000)
        });
    }

    // ─── Mark Complete ───────────────────────────────────────────
    async function markComplete() {
        if (!_initialized || !_moduleId) return;

        const uid = _getUid();
        if (!uid) return;

        try {
            if (!window.firebaseFirestore) return;
            const { doc, updateDoc, getFirestore, getApps, serverTimestamp } = window.firebaseFirestore;
            if (!getApps || getApps().length === 0) return;

            const db = getFirestore(getApps()[0]);
            const ref = doc(db, 'users', uid, 'engagement', _moduleId);
            await updateDoc(ref, { completedAt: serverTimestamp() });
        } catch (_) {
            // Silent — completion is tracked elsewhere too
        }
    }

    // ─── Auto-Init ───────────────────────────────────────────────
    // Self-initialize when DOM is ready (if moduleId is discoverable)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init(), { once: true });
    } else {
        // DOM already parsed — defer to next microtask to let ModuleProgress init first
        Promise.resolve().then(() => init());
    }

    // ─── Public API ──────────────────────────────────────────────
    return {
        init: init,
        trackEvent: trackEvent,
        flush: flush,
        markComplete: markComplete
    };

})();
