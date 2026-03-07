/**
 * SandboxLauncher.js - Lab Sandbox Environment Launcher
 *
 * Frontend SDK for launching, connecting to, and managing
 * Docker-based lab sandbox containers on bc1.
 *
 * Usage:
 *   SandboxLauncher.launch('do-100')   — launch sandbox for current lab
 *   SandboxLauncher.destroy(sessionId) — tear down a sandbox
 *   SandboxLauncher.list()             — list user's active sandboxes
 *   SandboxLauncher.renderButton(container, labId) — render launch button into element
 */

const SandboxLauncher = (function() {
    'use strict';

    // ── Config ──────────────────────────────────────────────────
    const CONFIG = {
        apiBase: 'https://sandbox.hexworth.tech/api/sandbox',
        devMode: true,              // Set false for production (requires Firebase auth)
        pollInterval: 10000,        // Status poll every 10s
        maxLifetimeMinutes: 120,
        idleTimeoutMinutes: 15,
    };

    // Lab metadata for UI display
    const LAB_INFO = {
        'do-100': { name: 'DevOps Foundation', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp' },
        'do-101': { name: 'DevOps Workbench', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp' },
        'do-102': { name: 'DevOps IDE', tier: 'ide', icon: '/assets/images/icons/icon-wrench.webp' },
        'do-16':  { name: 'Git Fundamentals', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp' },
        'arctic': { name: 'Arctic Terminal', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp' },
    };

    // Active state
    let _activeSessions = {};   // labId → { sessionId, url, pollTimer }

    // ── Auth ────────────────────────────────────────────────────
    async function getIdToken() {
        if (typeof FirebaseAuth !== 'undefined') {
            await FirebaseAuth.waitForAuth();
            if (FirebaseAuth.isSignedIn()) {
                const token = await FirebaseAuth.refreshToken();
                if (token) return token;
            }
        }
        // Dev fallback — server accepts X-Dev-Uid header when NODE_ENV != production
        return null;
    }

    function isSignedIn() {
        // In dev mode (server NODE_ENV != production), always allow
        if (CONFIG.devMode) return true;
        return typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn();
    }

    async function apiCall(method, path, body) {
        const token = await getIdToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Dev mode — send uid from localStorage or default
            const cached = localStorage.getItem('hexworth_firebase_user');
            const uid = cached ? (JSON.parse(cached).uid || 'dev-user') : 'dev-user';
            headers['X-Dev-Uid'] = uid;
        }

        const res = await fetch(`${CONFIG.apiBase}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `API error ${res.status}`);
        }
        return data;
    }

    // ── Core API ────────────────────────────────────────────────

    async function launch(labId) {
        if (!LAB_INFO[labId]) throw new Error(`Unknown lab: ${labId}`);

        const data = await apiCall('POST', '/launch', { labId });

        _activeSessions[labId] = {
            sessionId: data.sessionId,
            url: data.url,
            status: data.status,
            launchedAt: Date.now(),
            pollTimer: null,
        };

        return data;
    }

    async function status(sessionId) {
        return apiCall('GET', `/status/${sessionId}`);
    }

    async function destroy(sessionId) {
        const data = await apiCall('DELETE', `/destroy/${sessionId}`);

        // Clean up local state
        for (const [labId, session] of Object.entries(_activeSessions)) {
            if (session.sessionId === sessionId) {
                if (session.pollTimer) clearInterval(session.pollTimer);
                delete _activeSessions[labId];
                break;
            }
        }

        return data;
    }

    async function list() {
        return apiCall('GET', '/list');
    }

    // ── UI Rendering ────────────────────────────────────────────

    function renderButton(container, labId, options = {}) {
        const info = LAB_INFO[labId];
        if (!info) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'sandbox-launcher';
        wrapper.dataset.labId = labId;

        wrapper.innerHTML = `
            <div class="sandbox-launcher__panel">
                <div class="sandbox-launcher__header">
                    <img src="${info.icon}" alt="" class="sandbox-launcher__icon">
                    <span class="sandbox-launcher__title">Lab Sandbox</span>
                    <span class="sandbox-launcher__tier">${info.tier.toUpperCase()}</span>
                </div>
                <div class="sandbox-launcher__status" data-status="idle">
                    Ready to launch
                </div>
                <div class="sandbox-launcher__actions">
                    <button class="sandbox-launcher__btn sandbox-launcher__btn--launch" type="button">
                        Launch Sandbox
                    </button>
                    <button class="sandbox-launcher__btn sandbox-launcher__btn--open" type="button" style="display:none">
                        ${info.tier === 'ide' ? 'Open IDE' : 'Open Terminal'}
                    </button>
                    <button class="sandbox-launcher__btn sandbox-launcher__btn--destroy" type="button" style="display:none">
                        Destroy
                    </button>
                </div>
                <div class="sandbox-launcher__timer" style="display:none"></div>
                <div class="sandbox-launcher__iframe-wrap" style="display:none">
                    <iframe class="sandbox-launcher__iframe"></iframe>
                    <button class="sandbox-launcher__btn sandbox-launcher__btn--collapse" type="button">Minimize</button>
                </div>
            </div>
        `;

        const launchBtn = wrapper.querySelector('.sandbox-launcher__btn--launch');
        const openBtn = wrapper.querySelector('.sandbox-launcher__btn--open');
        const destroyBtn = wrapper.querySelector('.sandbox-launcher__btn--destroy');
        const collapseBtn = wrapper.querySelector('.sandbox-launcher__btn--collapse');
        const statusEl = wrapper.querySelector('.sandbox-launcher__status');
        const timerEl = wrapper.querySelector('.sandbox-launcher__timer');
        const iframeWrap = wrapper.querySelector('.sandbox-launcher__iframe-wrap');
        const iframe = wrapper.querySelector('.sandbox-launcher__iframe');

        function updateUI(state, message, url) {
            statusEl.dataset.status = state;
            statusEl.textContent = message;

            launchBtn.style.display = state === 'idle' || state === 'error' ? '' : 'none';
            openBtn.style.display = state === 'running' ? '' : 'none';
            destroyBtn.style.display = state === 'running' ? '' : 'none';
            timerEl.style.display = state === 'running' ? '' : 'none';

            if (state === 'running' && url) {
                openBtn.onclick = () => {
                    if (options.mode === 'tab') {
                        window.open(url, `sandbox-${labId}`);
                    } else {
                        iframeWrap.style.display = '';
                        iframe.src = url;
                    }
                };
            }
        }

        function startTimer(launchedAt) {
            const maxMs = CONFIG.maxLifetimeMinutes * 60 * 1000;
            function tick() {
                const elapsed = Date.now() - launchedAt;
                const remaining = Math.max(0, maxMs - elapsed);
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                timerEl.textContent = `Session: ${mins}m ${secs}s remaining`;
                if (remaining <= 0) {
                    updateUI('idle', 'Session expired');
                }
            }
            tick();
            return setInterval(tick, 1000);
        }

        // Launch handler
        launchBtn.addEventListener('click', async () => {
            // Check auth
            if (!isSignedIn()) {
                updateUI('error', 'Sign in to launch a sandbox');
                return;
            }

            updateUI('launching', 'Launching sandbox...');
            launchBtn.disabled = true;

            try {
                const result = await launch(labId);
                updateUI('running', `Connected — ${result.lab}`, result.url);

                const session = _activeSessions[labId];
                session.pollTimer = startTimer(session.launchedAt);

                // Auto-open
                if (options.autoOpen !== false) {
                    if (options.mode === 'tab') {
                        window.open(result.url, `sandbox-${labId}`);
                    } else {
                        iframeWrap.style.display = '';
                        iframe.src = result.url;
                    }
                }
            } catch (err) {
                updateUI('error', err.message);
            } finally {
                launchBtn.disabled = false;
            }
        });

        // Destroy handler
        destroyBtn.addEventListener('click', async () => {
            const session = _activeSessions[labId];
            if (!session) return;

            updateUI('destroying', 'Shutting down...');
            try {
                await destroy(session.sessionId);
                iframeWrap.style.display = 'none';
                iframe.src = '';
                updateUI('idle', 'Sandbox destroyed');
            } catch (err) {
                updateUI('error', err.message);
            }
        });

        // Collapse iframe
        collapseBtn.addEventListener('click', () => {
            iframeWrap.style.display = 'none';
            iframe.src = '';
        });

        container.appendChild(wrapper);
        return wrapper;
    }

    // ── CSS Injection ───────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('sandbox-launcher-styles')) return;

        const style = document.createElement('style');
        style.id = 'sandbox-launcher-styles';
        // Uses --sandbox-accent (falls back to --forge, then cyan) so it adapts to any house theme
        style.textContent = `
            .sandbox-launcher {
                --sb-accent: var(--sandbox-accent, var(--forge, #00ffff));
                --sb-accent-dim: color-mix(in srgb, var(--sb-accent) 12%, transparent);
                --sb-accent-glow: color-mix(in srgb, var(--sb-accent) 30%, transparent);
                margin: 1.5rem 0;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }
            .sandbox-launcher__panel {
                background: var(--bg-card, rgba(0, 20, 40, 0.9));
                border: 1px solid var(--border, rgba(255,255,255,0.08));
                border-radius: 10px;
                padding: 1rem 1.25rem;
            }
            .sandbox-launcher__header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.75rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--border, rgba(255,255,255,0.08));
            }
            .sandbox-launcher__icon {
                width: 1.25rem;
                height: 1.25rem;
                object-fit: contain;
            }
            .sandbox-launcher__title {
                color: var(--sb-accent);
                font-weight: 700;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
            }
            .sandbox-launcher__tier {
                margin-left: auto;
                font-size: 0.65rem;
                color: var(--text-dim, #8b949e);
                border: 1px solid var(--border, rgba(255,255,255,0.08));
                padding: 0.15rem 0.5rem;
                border-radius: 3px;
                font-family: 'Cascadia Code', 'Fira Code', monospace;
                letter-spacing: 0.5px;
            }
            .sandbox-launcher__status {
                font-size: 0.8rem;
                margin-bottom: 0.75rem;
                color: var(--text-dim, #8b949e);
            }
            .sandbox-launcher__status[data-status="running"] { color: #4ade80; }
            .sandbox-launcher__status[data-status="launching"] { color: #fbbf24; }
            .sandbox-launcher__status[data-status="error"] { color: #f87171; }
            .sandbox-launcher__status[data-status="destroying"] { color: #fbbf24; }
            .sandbox-launcher__actions {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            .sandbox-launcher__btn {
                padding: 0.5rem 1rem;
                border: 1px solid var(--sb-accent-glow);
                border-radius: 6px;
                background: var(--sb-accent-dim);
                color: var(--sb-accent);
                font-family: inherit;
                font-size: 0.8rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .sandbox-launcher__btn:hover {
                background: var(--sb-accent-glow);
                box-shadow: 0 0 12px color-mix(in srgb, var(--sb-accent) 20%, transparent);
            }
            .sandbox-launcher__btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .sandbox-launcher__btn--launch {
                font-weight: 700;
            }
            .sandbox-launcher__btn--destroy {
                border-color: rgba(255, 100, 100, 0.3);
                color: #f87171;
                background: rgba(255, 100, 100, 0.05);
            }
            .sandbox-launcher__btn--destroy:hover {
                background: rgba(255, 100, 100, 0.15);
                border-color: rgba(255, 100, 100, 0.5);
                box-shadow: 0 0 12px rgba(255, 100, 100, 0.15);
            }
            .sandbox-launcher__btn--collapse {
                margin-top: 0.5rem;
                font-size: 0.75rem;
                padding: 0.3rem 0.75rem;
            }
            .sandbox-launcher__timer {
                margin-top: 0.5rem;
                font-size: 0.7rem;
                color: var(--text-dim, #8b949e);
                opacity: 0.7;
            }
            .sandbox-launcher__iframe-wrap {
                margin-top: 1rem;
                border: 1px solid var(--border, rgba(255,255,255,0.08));
                border-radius: 8px;
                overflow: hidden;
                background: #000;
            }
            .sandbox-launcher__iframe {
                width: 100%;
                height: 500px;
                border: none;
                display: block;
            }
        `;
        document.head.appendChild(style);
    }

    // Auto-inject styles when loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    // ── Public API ──────────────────────────────────────────────
    return {
        launch,
        status,
        destroy,
        list,
        renderButton,
        getActiveSessions: () => ({ ..._activeSessions }),
        CONFIG,
        LAB_INFO,
    };

})();
