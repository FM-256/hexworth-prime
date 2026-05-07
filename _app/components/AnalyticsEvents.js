/**
 * AnalyticsEvents — client-side event emitter for Hexworth analytics-v2.
 *
 * Architecture: _docs/architecture/student-analytics-v2.md (§4.3)
 *
 * Responsibilities:
 *   - Holds a server-issued session token (refreshes on near-expiry)
 *   - Buffers events in localStorage (durable across crash/tab-close)
 *   - Flushes batches every 5 min OR on pagehide/visibilitychange
 *   - Replays buffer on next page load if prior flush failed
 *   - Idempotent on clientEventId (UUID)
 *
 * Lifecycle:
 *   AnalyticsEvents.init({ tenantId, classId, callFunction }) once on page load
 *   AnalyticsEvents.emit(type, payload)               anywhere a signal happens
 *   AnalyticsEvents.flush()                            (manual; auto on intervals/pagehide)
 *   AnalyticsEvents.endSession()                       on explicit logout
 *
 * Usage (with FirebaseAuth wrapper):
 *   await AnalyticsEvents.init({
 *     tenantId: 'test-x',
 *     classId: 'class-001',
 *     callFunction: (name, data) => FirebaseAuth.callFunction(name, data),
 *   });
 *
 * Usage (with raw Firebase functions httpsCallable):
 *   const callFn = (name, data) => fbFunctions.httpsCallable(functions, name)(data);
 *   await AnalyticsEvents.init({ tenantId, classId, callFunction: callFn });
 *
 *   AnalyticsEvents.emit('item.start', { itemId: 'mod-1', itemType: 'module' });
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'hxAnalyticsBuffer:v2';
    const SESSION_KEY = 'hxAnalyticsSession:v2';
    const FLUSH_INTERVAL_MS = 5 * 60 * 1000;         // 5 minutes
    const HEARTBEAT_INTERVAL_MS = 30 * 1000;         // 30 seconds
    const IDLE_THRESHOLD_MS = 60 * 1000;             // 60 seconds since last input = idle
    const REFRESH_LEAD_SEC = 60;                      // refresh token 60s before expiry
    const MAX_BUFFER_SIZE = 1000;                     // hard cap to prevent runaway growth
    const MAX_BATCH_SIZE = 500;                       // server-side cap
    const APP_VERSION = '2026-05-07';

    // ─── State ──────────────────────────────────────────────────────
    let _config = null;          // { tenantId, classId, callFunction, debug }
    let _session = null;         // { token, sessionId, exp, consentVersion }
    let _flushTimer = null;
    let _heartbeatTimer = null;
    let _initialized = false;
    let _lastInputAt = Date.now();
    let _itemContext = null;     // current itemId being engaged with

    // ─── Helpers ────────────────────────────────────────────────────

    function _uuid() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // RFC4122-ish fallback
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function _readBuffer() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function _writeBuffer(buf) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(buf));
        } catch (e) {
            // Quota exceeded — drop oldest 25% to make room
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(buf.slice(Math.floor(buf.length / 4))));
            } catch (_) { /* give up */ }
        }
    }

    function _readSession() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function _writeSession(s) {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        } catch (e) {
            // ignore
        }
    }

    function _clearSession() {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* */ }
    }

    function _now() { return Math.floor(Date.now() / 1000); }

    function _captureContext() {
        return {
            device: /Mobi|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            browser: navigator.userAgent.slice(0, 200),
            viewportW: window.innerWidth,
            viewportH: window.innerHeight,
            networkType: (navigator.connection && navigator.connection.effectiveType) || null,
            appVersion: APP_VERSION,
        };
    }

    // ─── Token management ───────────────────────────────────────────

    async function _ensureSession(forceFresh) {
        const cached = _readSession();
        const now = _now();

        // Use cached if fresh enough
        if (!forceFresh && cached && cached.exp && cached.exp - now > REFRESH_LEAD_SEC) {
            _session = cached;
            return _session;
        }

        // Try refresh path if we have a token (even near-expired)
        if (!forceFresh && cached && cached.token) {
            try {
                const result = await _config.callFunction('refreshSessionToken', { priorToken: cached.token });
                const data = result && result.data ? result.data : result;
                _session = {
                    token: data.token,
                    sessionId: data.sessionId,
                    exp: data.exp,
                    consentVersion: cached.consentVersion,
                    // Preserve startedAt across refresh — same logical session continues
                    startedAt: cached.startedAt || Date.now(),
                };
                _writeSession(_session);
                return _session;
            } catch (e) {
                // Refresh failed — fall through to fresh issuance
                if (_config.debug) console.warn('[Analytics] refresh failed, getting fresh:', e.message);
            }
        }

        // Fresh issuance
        const result = await _config.callFunction('getSessionToken', {
            tenantId: _config.tenantId,
            classId: _config.classId,
        });
        const data = result && result.data ? result.data : result;
        _session = {
            token: data.token,
            sessionId: data.sessionId,
            exp: data.exp,
            consentVersion: data.consentVersion,
            startedAt: Date.now(),
        };
        _writeSession(_session);

        // Emit session_start on a fresh session
        emit('nav.session_start', {
            entryUrl: location.href,
            referrer: document.referrer || '',
            consentVersion: _session.consentVersion,
        });

        return _session;
    }

    // ─── Event emission ─────────────────────────────────────────────

    function emit(type, payload) {
        if (!_initialized) {
            // Queue without session (will flush after init completes)
            // No-op: drop if not initialized — caller error
            console.warn('[Analytics] emit called before init:', type);
            return;
        }
        const ev = {
            clientEventId: _uuid(),
            type,
            payload: payload || {},
            clientTs: new Date().toISOString(),
            context: _captureContext(),
        };
        const buf = _readBuffer();
        if (buf.length >= MAX_BUFFER_SIZE) {
            // Drop oldest 10%; emit a telemetry signal client-side (console only)
            buf.splice(0, Math.floor(MAX_BUFFER_SIZE / 10));
            console.warn('[Analytics] buffer full, dropped oldest events');
        }
        buf.push(ev);
        _writeBuffer(buf);
    }

    // ─── Flush ──────────────────────────────────────────────────────

    let _flushInFlight = false;

    async function flush(reason) {
        if (_flushInFlight) return { skipped: 'in_flight' };
        const buf = _readBuffer();
        if (buf.length === 0) return { sent: 0 };

        await _ensureSession(false);
        if (!_session) return { skipped: 'no_session' };

        _flushInFlight = true;
        try {
            // Slice into max-batch-size chunks
            for (let i = 0; i < buf.length; i += MAX_BATCH_SIZE) {
                const batch = buf.slice(i, i + MAX_BATCH_SIZE);
                try {
                    const result = await _config.callFunction('ingestEvents', {
                        sessionToken: _session.token,
                        events: batch,
                    });
                    const data = result && result.data ? result.data : result;
                    // Only remove successfully accepted events from buffer
                    if (data && Array.isArray(data.accepted)) {
                        const acceptedIds = new Set(data.accepted.map(a => a.clientEventId));
                        const remaining = _readBuffer().filter(ev => !acceptedIds.has(ev.clientEventId));
                        _writeBuffer(remaining);
                    }
                } catch (err) {
                    // Auth-expired errors trigger refresh + retry
                    const msg = (err && err.message) || '';
                    if (msg.includes('expired') || msg.includes('unauthenticated')) {
                        try {
                            await _ensureSession(true);
                            // single retry
                            const retry = await _config.callFunction('ingestEvents', {
                                sessionToken: _session.token,
                                events: batch,
                            });
                            const rdata = retry && retry.data ? retry.data : retry;
                            if (rdata && Array.isArray(rdata.accepted)) {
                                const acceptedIds = new Set(rdata.accepted.map(a => a.clientEventId));
                                const remaining = _readBuffer().filter(ev => !acceptedIds.has(ev.clientEventId));
                                _writeBuffer(remaining);
                            }
                        } catch (retryErr) {
                            console.error('[Analytics] retry after refresh failed:', retryErr.message);
                            return { error: retryErr.message };
                        }
                    } else {
                        console.error('[Analytics] flush failed:', msg);
                        return { error: msg };
                    }
                }
            }
            return { sent: buf.length, reason };
        } finally {
            _flushInFlight = false;
        }
    }

    // ─── Heartbeat + idle tracking ──────────────────────────────────

    function _onInput() { _lastInputAt = Date.now(); }

    function _emitHeartbeat() {
        const isActive = (Date.now() - _lastInputAt) < IDLE_THRESHOLD_MS;
        emit('nav.heartbeat', {
            isActive,
            currentUrl: location.href,
            currentItemId: _itemContext || undefined,
        });
    }

    // ─── Item context API ───────────────────────────────────────────

    function setItemContext(itemId, itemType, itemTitle) {
        if (_itemContext === itemId) return;
        if (_itemContext) {
            // Implicit item.complete is NOT auto-emitted; caller must do it explicitly.
        }
        _itemContext = itemId;
        if (itemId) {
            emit('item.start', {
                itemId,
                itemType: itemType || 'module',
                itemTitle: itemTitle || '',
                isResume: false,
            });
        }
    }

    function clearItemContext() { _itemContext = null; }

    // ─── End session (logout) ──────────────────────────────────────

    let _sessionEndEmitted = false;

    function _computeSessionDurationMs() {
        if (!_session || !_session.startedAt) return 0;
        var ms = Date.now() - _session.startedAt;
        return ms > 0 ? ms : 0;  // server caps; this just sanitizes negative clock skew
    }

    async function endSession(reason) {
        if (_session && _session.sessionId && !_sessionEndEmitted) {
            _sessionEndEmitted = true;
            emit('nav.session_end', {
                durationMs: _computeSessionDurationMs(),
                exitUrl: location.href,
                reason: reason || 'explicit_logout',
            });
        }
        await flush('end_session');
        _clearSession();
        _session = null;
        _sessionEndEmitted = false;  // reset for next session
    }

    // ─── Init ───────────────────────────────────────────────────────

    async function init(config) {
        if (_initialized) return;
        if (!config || !config.tenantId) {
            throw new Error('AnalyticsEvents.init requires { tenantId, callFunction }');
        }
        // Accept either { callFunction } directly or { fbAuth } for legacy compatibility
        var callFn = config.callFunction;
        if (!callFn && config.fbAuth && typeof config.fbAuth.callFunction === 'function') {
            callFn = function(name, data) { return config.fbAuth.callFunction(name, data); };
        }
        if (typeof callFn !== 'function') {
            throw new Error('AnalyticsEvents.init requires callFunction (or fbAuth.callFunction)');
        }
        _config = {
            tenantId: config.tenantId,
            classId: config.classId || '_tenant_',
            callFunction: callFn,
            debug: !!config.debug,
        };
        _initialized = true;

        // Acquire session (issues nav.session_start internally if fresh)
        await _ensureSession(false);

        // Replay any prior-session buffer leftovers
        const leftovers = _readBuffer();
        if (leftovers.length > 0 && _config.debug) {
            console.log(`[Analytics] replaying ${leftovers.length} buffered events from prior session`);
        }
        flush('init_replay').catch(e => console.warn('[Analytics] init replay failed:', e.message));

        // Periodic flush
        _flushTimer = setInterval(() => flush('interval'), FLUSH_INTERVAL_MS);

        // Heartbeat
        _heartbeatTimer = setInterval(_emitHeartbeat, HEARTBEAT_INTERVAL_MS);

        // Input tracking for active/idle
        ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(t => {
            window.addEventListener(t, _onInput, { passive: true });
        });

        // Flush on tab close (best effort — survives most cases via localStorage anyway)
        window.addEventListener('pagehide', () => {
            if (_sessionEndEmitted) return;  // dedup with explicit endSession()
            _sessionEndEmitted = true;
            emit('nav.session_end', {
                durationMs: _computeSessionDurationMs(),
                exitUrl: location.href,
                reason: 'pagehide',
            });
            // Synchronous-ish flush
            flush('pagehide');
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') flush('visibilitychange');
        });
    }

    // ─── Public API ─────────────────────────────────────────────────

    window.AnalyticsEvents = {
        init,
        emit,
        flush,
        endSession,
        setItemContext,
        clearItemContext,
        // Diagnostics
        _bufferSize: () => _readBuffer().length,
        _session: () => _session ? { sessionId: _session.sessionId, exp: _session.exp } : null,
    };
})();
