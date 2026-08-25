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
        devMode: false,             // lab-manager runs NODE_ENV=production (2026-07-02): Firebase auth required
        pollInterval: 10000,        // Status poll every 10s
        maxLifetimeMinutes: 120,
        idleTimeoutMinutes: 15,
    };

    // Lab metadata for UI display.
    // `browsable` is a REQUIRED, explicit, per-entry ruling: true = advertised on The Rig
    // (/rig/) as a free-play launch card; false = course-internal, launchable only from the
    // page that owns its scaffolding. The Rig's accessor is FAIL-CLOSED -- a missing key
    // means the entry does not appear (and the hub-registry audit fails the build until the
    // key is added), so a new environment can never leak onto the shelf by omission.
    const LAB_INFO = {
        'do-100': { name: 'DevOps Foundation', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: true },
        'do-101': { name: 'DevOps Workbench', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: true },
        'do-102': { name: 'DevOps IDE', tier: 'ide', icon: '/assets/images/icons/icon-wrench.webp', browsable: true },
        'do-16':  { name: 'Git Fundamentals', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: true },
        'arctic': { name: 'Arctic Terminal', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: true },
        'db-sql': { name: 'PostgreSQL Terminal', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: true },
        // FINAL EXAM environment (CTS4321C practical). Its stage panels, flag capture and
        // grading live in ala-final.html, NOT in this launcher -- a bare launch card would
        // hand out an ungraded shell into exam infrastructure. NEVER flip this to true.
        'cell-sigma': { name: 'Cell-Σ Commissioning (ALA Final)', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: false },
        'linux-mastery': { name: 'Linux Mastery Workbench', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: true },
        'linux-sandbox': { name: 'Linux Practice Sandbox', tier: 'terminal', icon: '/assets/images/icons/icon-terminal.webp', browsable: true },
        // DELIBERATELY browsable (the-rig doc, Nancy's build-time note 2): OpenStack Stage 2a's
        // read-only CLI lab is The Rig's first automatic inheritance -- the visible path, chosen
        // on purpose, not the fail-closed default.
        'openstack-cli': { name: 'OpenStack CLI Lab', tier: 'terminal', icon: '/assets/images/icons/icon-cloud.webp', browsable: true },
    };

    /**
     * The Rig's data source: only entries explicitly flagged browsable:true, as
     * frozen copies. Strict equality (not truthiness) keeps the fail-closed
     * contract: absent or malformed flags exclude the entry.
     */
    function getBrowsableLabs() {
        const out = {};
        for (const id of Object.keys(LAB_INFO)) {
            if (LAB_INFO[id].browsable === true) out[id] = Object.freeze({ ...LAB_INFO[id] });
        }
        return out;
    }

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

    async function launch(labId, opts = {}) {
        if (!LAB_INFO[labId]) throw new Error(`Unknown lab: ${labId}`);

        // Optional mission (Linux Command Mastery): the lab-manager seeds the
        // container's mission world at launch and remembers the mission on the
        // session, so /check grades the mission instead of free-play challenges.
        const body = { labId };
        if (typeof opts.mission === 'string' && opts.mission) body.mission = opts.mission;
        // Capacity split (2026-07-30): several labs are reachable BOTH as coursework and as
        // free-play browsing from The Rig, and the server cannot tell those apart from the
        // labId. So the caller declares it: The Rig passes freePlay:true, which puts the
        // launch under the free-play cap (12 of 40) instead of the coursework reserve.
        // Course pages omit it and are never capped. A mission-driven launch is graded work
        // regardless -- the server ignores this flag when a mission is present.
        if (opts.freePlay === true) body.freePlay = true;
        // Stage 4 seeded cloud labs: the page names a scenario, the lab-manager asks the bc2
        // claim service to build that broken state in the student's OWN project, and injects
        // the seeded resource id into the container env so the repair check can compare
        // against an id the student cannot forge. Allowlist-shaped, like the lab ids: a
        // scenario the server does not recognise is simply refused there.
        if (typeof opts.scenario === 'string' && /^[a-z][a-z0-9-]{0,40}$/.test(opts.scenario)) {
            body.scenario = opts.scenario;
        }
        const data = await apiCall('POST', '/launch', body);

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

    // Server-authoritative practice grading for a running session. Returns
    // { ok, passed, total, complete, results[] }. The caller awards any badge.
    // The EXPLICIT empty ?mission= matters (Chris gate 2026-07-10, bug #94):
    // the server's /check falls back to the session's sticky `mission` field
    // when the param is ABSENT — so a box that ever ran a mission would route
    // this free-play grade into the mission fork (mission results carry .brief
    // not .desc -> '✓ undefined' rows, and the practitioner badge gate reads
    // fields mission grading never returns). An empty string is an explicit
    // "no mission" (typeof check passes, `if (mReq && ...)` fails) and always
    // grades the free-play challenges.
    async function checkPractice(sessionId) {
        return apiCall('GET', `/check/${sessionId}?mission=`);
    }

    // Cloud Master capstone only: records the student's pre-destroy baseline SERVER-SIDE,
    // as an explicit action they take rather than something the grader infers while marking.
    // Returns { ok: true, recorded: {networks, servers} } or { ok: false, reason, error } —
    // the soft failures (no manifest, stack not live) come back as 200 with ok:false, so read
    // `ok`, do not rely on this throwing.
    // `kind` selects WHICH witness the grader records. Omitted means the capstone baseline it
    // has always recorded, so every existing caller is unchanged. 'attach' is the Cinder lab's
    // attach witness (BUG-058): the grader reads the live cloud and writes down which volume
    // sat on which server, because nothing in the end state can prove that later.
    // The two labs cannot be told apart server-side -- every OpenStack lab shares one labId --
    // so the kind is named here rather than inferred.
    async function recordBaseline(sessionId, kind) {
        return apiCall('POST', `/baseline/${sessionId}`, kind ? { kind } : undefined);
    }

    // Mission grading (Linux Command Mastery): rich per-task results
    // { ok, mission, results[{id,brief,tier,bonus,hidden,pass,feedback[]}],
    //   passed, total, badgeEligible, badge }. Badge award itself is SERVER-side
    // (awardMissionBadge CF) — never awarded from the client.
    async function checkMission(sessionId, missionId) {
        return apiCall('GET', `/check/${sessionId}?mission=${encodeURIComponent(missionId)}`);
    }

    // Public mission catalog (metadata only; no check commands).
    async function listMissions() {
        const resp = await fetch(`${CONFIG.apiBase}/missions`);
        if (!resp.ok) throw new Error(`missions catalog: HTTP ${resp.status}`);
        return resp.json();
    }

    // ── UI Rendering ────────────────────────────────────────────

    /**
     * Show the OpenStack web-console (Horizon) credentials after a personal-cloud launch.
     *
     * WHY A PASSWORD IS SHOWN AT ALL. The CLI gets an application credential the student never
     * sees or types. Horizon cannot consume one — its login form takes username/password — so
     * the web console needs a typeable secret. It is safe to display because its lifetime IS the
     * session: the bridge rotates it at claim and again at teardown, so a screenshot is dead as
     * soon as the lab is reaped.
     *
     * The fetch mints an HttpOnly cookie that the /dashboard gate checks on every request.
     * Without it the console 401s, so this runs BEFORE the student can click through. It is
     * awaited rather than fired-and-forgotten so the link is never shown as ready while the
     * gate would still reject it.
     */
    async function showConsolePanel(host, result) {
        if (!host || !result || !result.horizonPassword) return;   // not a personal-cloud launch

        // Mint the browser cookie for the gate. A failure here must not hide the credentials —
        // the student can still reach the console after a retry — but it MUST be visible,
        // otherwise the console just 401s and looks broken for no stated reason.
        let gateOk = true;
        try {
            // credentials:'include' is REQUIRED, not defensive: the lab page is hexworth.com and
            // this API is sandbox.hexworth.tech, so without it the browser discards the Set-Cookie
            // and the console 401s for a student who did everything right. apiCall() does not send
            // credentials (nothing else here needs them), so this call is made directly.
            const token = (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn())
                ? await FirebaseAuth.refreshToken() : null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            const r = await fetch(CONFIG.apiBase + '/console-session',
                { method: 'POST', headers: headers, credentials: 'include' });
            if (!r.ok) gateOk = false;
        } catch (e) {
            gateOk = false;
        }

        const old = host.querySelector('.sandbox-console-panel');
        if (old) old.remove();

        const panel = document.createElement('div');
        panel.className = 'sandbox-console-panel';
        panel.style.cssText = 'margin-top:1rem;padding:1rem;border:1px solid rgba(255,255,255,.18);' +
            'border-radius:8px;background:rgba(255,255,255,.04);font-size:.92rem;line-height:1.55';

        const heading = document.createElement('strong');
        heading.textContent = 'Web console (Horizon)';
        panel.appendChild(heading);

        const note = document.createElement('div');
        note.style.cssText = 'margin:.35rem 0 .6rem;opacity:.8';
        note.textContent = gateOk
            ? 'These credentials work for this session only and stop working when the lab ends.'
            : 'Console access could not be prepared. Relaunch the lab, and tell your instructor if it keeps happening.';
        panel.appendChild(note);

        // Only show credentials that can actually be used. If the gate cookie failed to mint,
        // the console will 401 no matter what is typed, so printing a username and password
        // beside "could not be prepared" would read as live and send the student to a login
        // form that cannot succeed. Say what happened instead, and show nothing usable.
        // textContent throughout: these are server-supplied strings and must never be markup.
        const rows = gateOk
            ? [['User', result.horizonUser], ['Password', result.horizonPassword]]
            : [];
        rows.forEach(function (pair) {
            const row = document.createElement('div');
            const label = document.createElement('span');
            label.style.cssText = 'display:inline-block;min-width:5.5rem;opacity:.75';
            label.textContent = pair[0];
            const value = document.createElement('code');
            value.style.cssText = 'user-select:all;word-break:break-all';
            value.textContent = pair[1] || '';
            row.appendChild(label);
            row.appendChild(value);
            panel.appendChild(row);
        });

        if (gateOk && result.horizonUrl) {
            const link = document.createElement('a');
            link.href = result.horizonUrl;
            link.target = 'hexworth-openstack-console';
            link.rel = 'noopener';
            link.textContent = 'Open the web console';
            link.style.cssText = 'display:inline-block;margin-top:.7rem;font-weight:600';
            panel.appendChild(link);
        }

        host.appendChild(panel);
    }

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
                    <button class="sandbox-launcher__btn sandbox-launcher__btn--maximize" type="button">Maximize</button>
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

        // Host-injected action buttons (options.extraActions: [{label,
        // visibleWhen: 'always'|'running', onClick(ctx)}]) + a terminal-adjacent
        // results panel (ctx.panel), inserted between the actions row and the
        // iframe. STRICTLY additive across the 10 pages sharing this component:
        // callers that pass no extraActions build an empty list, create ZERO new
        // DOM, and updateUI's extras pass is a forEach over an empty array
        // (adversarial review 2026-07-10 — the guard is this `: []`).
        const extras = Array.isArray(options.extraActions) ? options.extraActions.map((a) => {
            const el = document.createElement('button');
            el.type = 'button';
            el.className = 'sandbox-launcher__btn sandbox-launcher__btn--extra';
            el.textContent = a.label;
            // running-scoped actions start hidden; updateUI reveals them.
            el.style.display = a.visibleWhen === 'running' ? 'none' : '';
            return { el, visibleWhen: a.visibleWhen || 'always', onClick: a.onClick };
        }) : [];
        let extraPanel = null;
        if (extras.length) {
            const actionsRow = wrapper.querySelector('.sandbox-launcher__actions');
            extras.forEach((x) => actionsRow.appendChild(x.el));
            extraPanel = document.createElement('div');
            extraPanel.className = 'sandbox-launcher__extra-panel';
            extraPanel.style.display = 'none';
            // Safe insertion point: every ref in this component is class-queried,
            // nothing walks siblings/children positionally (verified 2026-07-10).
            iframeWrap.parentNode.insertBefore(extraPanel, iframeWrap);
            extras.forEach((x) => {
                x.el.addEventListener('click', () => {
                    const session = _activeSessions[labId];
                    // Host handler errors must never break the launcher itself.
                    try {
                        x.onClick({
                            labId,
                            sessionId: session ? session.sessionId : null,
                            panel: extraPanel,
                            state: statusEl.dataset.status,
                        });
                    } catch (e) { /* isolated */ }
                });
            });
        }

        function updateUI(state, message, url) {
            statusEl.dataset.status = state;
            statusEl.textContent = message;

            launchBtn.style.display = state === 'idle' || state === 'error' ? '' : 'none';
            openBtn.style.display = state === 'running' ? '' : 'none';
            destroyBtn.style.display = state === 'running' ? '' : 'none';
            timerEl.style.display = state === 'running' ? '' : 'none';
            // Host-injected extras: running-scoped ones follow open/destroy;
            // empty array (the 9 zero-options callers) makes this a no-op.
            extras.forEach((x) => { x.el.style.display = (x.visibleWhen !== 'running' || state === 'running') ? '' : 'none'; });

            if (state === 'running' && url) {
                openBtn.onclick = () => {
                    if (options.mode === 'tab') {
                        window.open(url, `sandbox-${labId}`);
                    } else {
                        iframeWrap.style.display = '';
                        wrapper.classList.add('is-embedded');   // host pages widen for this
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
                    closeIframe();          // same cleanup as Destroy; see closeIframe()
                    clearConsolePanel();    // session END — the backend has rotated the password
                    updateUI('idle', 'Session expired');
                    // Session is gone — let the host clear any session-bound UI (e.g. the grader).
                    if (typeof options.onEnd === 'function') { try { options.onEnd(labId); } catch (e) { /* ignore */ } }
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
                // Mission-aware launch: options.mission may be a string or a function
                // returning the currently selected mission id (lets a picker rendered
                // elsewhere on the page drive the same launch button).
                const missionSel = typeof options.mission === 'function' ? options.mission() : options.mission;
                // options.freePlay is set by free-play front doors (The Rig) so the server
                // charges the launch against the free-play cap rather than the coursework
                // reserve. A selected mission always wins: that is graded work.
                const launchOpts = missionSel ? { mission: missionSel } : {};
                if (!missionSel && options.freePlay === true) launchOpts.freePlay = true;
                // Seeded-scenario labs declare which broken state to build (Stage 4).
                if (typeof options.scenario === 'string') launchOpts.scenario = options.scenario;
                const result = await launch(labId, launchOpts);
                updateUI('running', `Connected — ${result.lab}`, result.url);

                // Optional launch hook (e.g. Observatory usage telemetry). Best-effort:
                // a hook error must never break the launch flow.
                if (typeof options.onLaunch === 'function') {
                    try { options.onLaunch(labId, result); } catch (e) { /* ignore */ }
                }

                // Web console panel. Lives HERE and not on the lab pages because six OpenStack
                // labs call this same launcher — a panel copied into each is the same fix six
                // times, and the seventh lab would silently not have it.
                try { await showConsolePanel(container, result); } catch (e) { /* never break launch */ }

                const session = _activeSessions[labId];
                session.pollTimer = startTimer(session.launchedAt);

                // Auto-open
                if (options.autoOpen !== false) {
                    if (options.mode === 'tab') {
                        window.open(result.url, `sandbox-${labId}`);
                    } else {
                        iframeWrap.style.display = '';
                        wrapper.classList.add('is-embedded');
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
                closeIframe();
                clearConsolePanel();    // session END — the backend has rotated the password
                updateUI('idle', 'Sandbox destroyed');
                // Session is gone — let the host clear any session-bound UI (e.g. the grader).
                if (typeof options.onEnd === 'function') { try { options.onEnd(labId); } catch (e) { /* ignore */ } }
            } catch (err) {
                updateUI('error', err.message);
            }
        });

        // Collapse iframe
        /* MAXIMIZE. The sandbox is a terminal or a desktop living inside an article column,
           so its usable size was whatever was left over: a hardcoded 500px tall, capped by the
           page's max-width. Fullscreen gives it the whole display, which is the only way the
           thing being maximised is the SANDBOX rather than the page around it.

           ⚠ FULLSCREEN API, NOT A position:fixed OVERLAY, and that is deliberate. Platform rule
           5 / HEUR-008: position:fixed is broken whenever body.style.filter is set, and three
           shipped components set it (FluxCapacitor, UserProfileModal, TenantShell). A
           hand-rolled overlay would work everywhere until it silently did not. requestFullscreen
           is outside the filtered stacking context entirely and cannot be broken that way.

           Falls back to an in-page tall mode if the API is unavailable or refused (some
           embedded/iframe contexts deny it): still a real improvement, still no fixed
           positioning. */
        const maximizeBtn = wrapper.querySelector('.sandbox-launcher__btn--maximize');
        let priorInlineHeight = '';   // a drag's inline height, stashed across is-tall
        function isFull() {
            return document.fullscreenElement === iframeWrap;
        }
        function syncMaxLabel() {
            const on = isFull() || iframeWrap.classList.contains('is-tall');
            maximizeBtn.textContent = on ? 'Restore' : 'Maximize';
        }
        maximizeBtn.addEventListener('click', async () => {
            if (isFull()) { await document.exitFullscreen().catch(() => {}); return; }
            if (iframeWrap.classList.contains('is-tall')) {
                iframeWrap.classList.remove('is-tall');
                iframeWrap.style.height = priorInlineHeight;   // back to what they had dragged
                syncMaxLabel(); return;
            }
            if (iframeWrap.requestFullscreen) {
                try { await iframeWrap.requestFullscreen(); syncMaxLabel(); return; }
                catch (e) { /* denied: fall through to the in-page tall mode */ }
            }
            /* ⚠ A NATIVE RESIZE DRAG WRITES AN INLINE height ON THE WRAPPER, and an inline
               style beats the .is-tall class rule in the cascade. So a student who dragged the
               panel first and then hit Maximize got the class, the "Restore" label, and no size
               change at all: the "looks like it worked" failure this component has now produced
               twice. Stash the dragged height, clear it so the class can win, and put it back
               on Restore rather than dumping them at the default. */
            priorInlineHeight = iframeWrap.style.height || '';
            iframeWrap.style.height = '';
            iframeWrap.classList.add('is-tall');
            syncMaxLabel();
            iframeWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        /* Escape and the browser's own fullscreen exit do not fire our click handler, so the
           label would otherwise stay stuck on "Restore" after leaving fullscreen. */
        document.addEventListener('fullscreenchange', syncMaxLabel);

        /* ── ONE PLACE THAT CLOSES THE SANDBOX ────────────────────────────────────────
           There are THREE ways a sandbox stops being on screen: the student minimises it,
           they destroy it, or the session hits maxLifetimeMinutes and expires. Each one used
           to unwind by hand, and `is-embedded` (which makes the Rig card span every grid
           column) was removed by only ONE of them. Destroy and expiry left an idle, empty
           card permanently spanning the full grid next to normal-width neighbours, on every
           page load until the tab was reloaded. Chris reproduced it by clicking the real
           buttons: afterDestroy { embedded: true, cardWidth: 1536 }.
           Factored so a FOURTH way to close cannot repeat the same miss. */
        function closeIframe() {
            if (isFull()) document.exitFullscreen().catch(() => {});
            if (iframeWrap.classList.contains('is-tall')) {
                iframeWrap.classList.remove('is-tall');
                iframeWrap.style.height = priorInlineHeight;
            }
            syncMaxLabel();
            iframeWrap.style.display = 'none';
            wrapper.classList.remove('is-embedded');
            iframe.src = '';

        }

        /**
         * Drop the console credentials when the SESSION ends — deliberately NOT inside
         * closeIframe().
         *
         * Those are two different events sharing one function. Destroy and max-lifetime expiry end
         * the session, and the backend rotates the Horizon password at teardown, so a panel left
         * up would show a dead password beside a live-looking link. Minimize does NOT end
         * anything: collapseBtn also calls closeIframe(), state stays 'running', the timer keeps
         * counting, and the container is still alive on the server.
         *
         * A first attempt put this inside closeIframe() and so wiped a working student's
         * credentials the moment they minimised the terminal, recoverable only by destroying the
         * sandbox — trading one bug for a worse one. Keep it keyed to session end, not to the
         * iframe closing.
         */
        function clearConsolePanel() {
            const stalePanel = container.querySelector('.sandbox-console-panel');
            if (stalePanel) stalePanel.remove();
        }

        collapseBtn.addEventListener('click', closeIframe);

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
            /* Host-injected extra actions (options.extraActions) + their
               terminal-adjacent results panel. Only pages that opt in ever
               render these (2026-07-10, operator: no more scrolling away
               from the terminal to grade or read the manual). */
            .sandbox-launcher__btn--extra {
                border-color: rgba(52, 211, 153, 0.45);
                color: #6ee7b7;
                background: rgba(52, 211, 153, 0.07);
            }
            .sandbox-launcher__btn--extra:hover {
                background: rgba(52, 211, 153, 0.16);
                box-shadow: 0 0 12px rgba(52, 211, 153, 0.15);
            }
            .sandbox-launcher__extra-panel {
                margin-top: 0.6rem;
                padding: 0.7rem 0.9rem;
                border: 1px solid rgba(52, 211, 153, 0.30);
                border-radius: 8px;
                background: rgba(52, 211, 153, 0.05);
                font-size: 0.82rem;
                color: #c7d0f0;
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
                /* ⚠ THE WRAPPER OWNS THE HEIGHT, NOT THE IFRAME, and that is the whole fix.
                   The first version put resize:vertical here and left the iframe on its own
                   fixed clamp(). The two heights were decoupled, so dragging did nothing to the
                   sandbox: smaller CLIPPED the iframe (overflow:hidden, no scrollbar to recover
                   it) and larger just added dead black wrapper. Chris measured it — dragged
                   824px -> 300px, iframe stayed 778px. A resize handle that resizes nothing is
                   worse than no handle, because it looks like it worked. */
                height: clamp(420px, 72vh, 1100px);
                resize: vertical;
                min-height: 260px;
            }
            .sandbox-launcher__iframe {
                width: 100%;
                /* Fills whatever the wrapper currently is: the clamp default, a dragged height,
                   or the full display in fullscreen. One source of truth for the size. */
                height: 100%;
                border: none;
                display: block;
            }
            /* The wrapper is the fullscreen element, so IT takes the display and the iframe
               follows automatically. */
            .sandbox-launcher__iframe-wrap:fullscreen {
                border-radius: 0;
                border: none;
                resize: none;
                background: #000;
                height: 100vh;
            }
            /* Fallback when the Fullscreen API is unavailable or refused. Deliberately NOT
               position:fixed: rule 5 / HEUR-008, fixed positioning breaks under
               body.style.filter, which shipped components set. This only grows the element in
               normal flow, so nothing can break it. */
            .sandbox-launcher__iframe-wrap.is-tall {
                height: calc(100vh - 120px);
            }
            .sandbox-launcher__btn--maximize {
                margin-top: 0.5rem;
                margin-right: 0.5rem;
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
        checkPractice,
        checkMission,
        recordBaseline,
        listMissions,
        renderButton,
        getActiveSessions: () => ({ ..._activeSessions }),
        getBrowsableLabs,
        CONFIG,
        LAB_INFO,
    };

})();

// Explicit window attachment so the module is reachable from any script block
// regardless of load order tooling (top-level const is global-lexical only).
window.SandboxLauncher = SandboxLauncher;
