/**
 * TenantShell.js — White Label Shell Injector
 *
 * PURPOSE:
 * When a tenant user navigates from the branded SOC dashboard into
 * any content page (Wireshark Hub, CTF Arena, house pages, etc.),
 * they must remain inside the tenant experience. This script:
 *
 *   1. Checks sessionStorage for tenant context
 *   2. If found, injects the tenant header bar at the top of the page
 *   3. Overrides all "Dashboard" / "Home" / "Back" navigation links
 *      to point back to the tenant hub (not Hexworth Prime dashboard)
 *   4. Applies tenant branding (CSS variables, page title)
 *   5. Adds a persistent "Return to Hub" button
 *   6. Provides a toggle to hide/show the shell without unenrolling
 *
 * If no tenant context exists (direct Hexworth Prime users), this
 * script is a complete no-op — zero DOM changes, zero visual impact.
 *
 * SHELL TOGGLE (v1.1):
 * Users enrolled in a tenant can hide the shell to browse Hexworth Prime
 * without the tenant encapsulation. The enrollment stays intact — only
 * the visual shell and link overrides are suppressed. A floating pill
 * lets them re-engage at any time.
 *
 * LOADING:
 * This script should be loaded on EVERY content page, ideally in
 * the <head> or early in <body>. It runs synchronously on load
 * to prevent a flash of unbranded content (FOUC).
 *
 * Add to any page:
 *   <script src="/components/TenantShell.js"></script>
 *
 * Or add to pages that already load components:
 *   Listed alongside AccessGuard.js, ModuleProgress.js, etc.
 *
 * @version 1.1.0
 * @feature WL-2, WL-TOGGLE
 */

(function() {
    'use strict';

    var SHELL_HIDDEN_KEY = 'hexworth_tenant_shell_hidden';
    // Set once revocation is confirmed. Guards the DOMContentLoaded-deferred injectors,
    // which would otherwise render from stale locals after the storage purge.
    var revoked = false;

    /* ── Cross-tab mirror (BUG-242) ──────────────────────────────────────────────────────
       sessionStorage does not cross tabs, and eleven of the twelve join paths write ONLY
       sessionStorage. A student who joined through a tenant dashboard and then opened a gated
       module in a NEW TAB therefore had no tenant context there: no branding, and no waiver of
       the sorting quiz and Dark Arts gates that do not exist in their experience.

       THIS IS EXPORTED, AND IT IS DEFINED ABOVE THE EARLY RETURN BELOW, DELIBERATELY. This file
       is a parser-blocking <script> near the top of every tenant page, so on a FIRST join it
       executes and exits before the page's own async join handler has fetched the config and
       written it. A mirror placed inside the normal flow below would never fire on exactly the
       page the bug is reported from. So the join handlers call this explicitly after their write.
       A reviewer found this by reading the script order; the design before it looked correct and
       would have shipped inert on the reported repro.

       NOT A SECURITY MECHANISM, and nothing here should be described as one. Nothing in this path
       checks identity: the async verification confirms a tenant EXISTS, not that this user belongs
       to it, so a hand-written key already grants the same waiver. This restores a broken feature
       for legitimate students and bounds accidental bleed between students on a shared machine.

       THE PERSISTED COPY IS BOUNDED BY THREE THINGS, all of which exist:
         1. FirebaseAuth.purgeTenantContext(), called from both signOut() paths, clears it at the
            same moment it clears the auth session this wrapper belongs to.
         2. The TTL enforced on read below, which ages out a student who was removed from a still
            active tenant and therefore never triggers a sign-out or a 404.
         3. purgeTenantAndStrip() further down, which already clears both storages when the async
            verification finds the tenant deleted or renamed.
       An earlier draft of this comment claimed (1) before it had been written. That is the exact
       defect BUG-236 is filed for, in the file BUG-236 is filed against. */
    function mirrorTenantForCrossTab(config) {
        try {
            var payload = (typeof config === 'string') ? config : JSON.stringify(config);
            if (!payload) return false;
            // Must at least parse and name a tenant. A malformed blob is worse than none: it is
            // what a hand-typed value looks like, and the read paths already reject it.
            var parsed = JSON.parse(payload);
            if (!parsed || typeof parsed.slug !== 'string' || !parsed.slug.trim()) return false;
            localStorage.setItem('hexworth_tenant', payload);
            // Stamped so staleness can be bounded. Sign-out purges this, but a student REMOVED
            // from a still-active tenant keeps the same uid and would otherwise carry the blob
            // indefinitely; the timestamp is what lets a reader age it out.
            localStorage.setItem('hexworth_tenant_mirrored_at', String(Date.now()));
            return true;
        } catch (e) {
            return false;   // storage blocked or quota exceeded: cross-tab is a convenience
        }
    }
    // Exported before any early return, so a join page whose tenant context does not yet exist can
    // still reach it. window.TenantShellToggle is assigned far below and is NOT available here.
    window.TenantShellMirror = { mirror: mirrorTenantForCrossTab };

    /* TTL on the mirrored copy, enforced HERE because this is the one file that runs on every
       tenant page and can purge for all of the read sites at once. Consumers read the key
       directly; removing it is therefore how the bound actually reaches them, rather than adding
       an age check to each.
       Bounds the case nothing else catches: a student removed from a tenant that is still active.
       They never sign out, so (1) does not fire, and the tenant still resolves, so the 404 purge
       does not either. Only the sessionStorage copy is left alone -- it dies with the tab anyway,
       and is written by the join flow that just verified the tenant. */
    var MIRROR_TTL_MS = 12 * 60 * 60 * 1000;   // 12h: longer than a class, shorter than a loan
    try {
        var persisted = localStorage.getItem('hexworth_tenant');
        if (persisted) {
            var stamp = parseInt(localStorage.getItem('hexworth_tenant_mirrored_at') || '', 10);
            if (!(stamp > 0)) {
                /* UNSTAMPED, OR CORRUPT. Two ways to get here, and both must age out rather than
                   be exempt: lobby.html has always written this key WITHOUT a stamp (:706, :822),
                   and a garbage value parses to NaN. A first cut tested `if (stamp && ...)`, which
                   is falsy for BOTH -- so the TTL would have skipped exactly the blob that
                   predates it and the one that was tampered with. Stamp it on first sighting so
                   the clock starts now; that is later than the true write time, which errs toward
                   keeping a legitimate student's context rather than cutting it short.

                   NOTE this is a behaviour change for lobby-joined students, whose localStorage
                   copy previously lived forever. It now expires 12h after first sighting, after
                   which a new tab falls back to no tenant context until they pass through a tenant
                   page again. That is the intended bound, not a side effect. */
                localStorage.setItem('hexworth_tenant_mirrored_at', String(Date.now()));
            } else if ((Date.now() - stamp) > MIRROR_TTL_MS) {
                localStorage.removeItem('hexworth_tenant');
                localStorage.removeItem('hexworth_tenant_mirrored_at');
            }
        }
    } catch (e) { /* storage blocked; the read below simply finds nothing */ }

    // ── Check for tenant context ─────────────────────────
    var raw = null;
    try {
        raw = sessionStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant');
    } catch (e) {}

    // No tenant = no-op. Direct Hexworth Prime users see nothing.
    if (!raw) return;

    // ── Revocation: an inactive tenant must leave NO trace on the student ──
    //
    // The tenant config is cached at join time and was never re-checked. Deactivating a tenant,
    // and even removing the student from the class and the tenant, changed only Firestore —
    // nothing server-side can reach a browser's storage, and the localStorage copy in particular
    // persists across reboots indefinitely. So the shell and the re-enter pill kept rendering
    // from a snapshot forever. Reported 2026-08-04.
    //
    // WHICH STORAGE, PRECISELY (this comment used to get it wrong, BUG-236). It previously said
    // the config is cached in "sessionStorage AND localStorage at join time". That is true of
    // exactly ONE of twelve join paths: _app/lobby.html, which writes both. The ten tenant
    // dashboards, tenant/index.html and tenant/instructor.html write sessionStorage ONLY. So the
    // `sessionStorage.getItem(...) || localStorage.getItem(...)` fallback used here and in
    // AccessGuard, FirebaseAuth, ModuleProgress and TenantRouter is lobby-only in practice, and
    // for everyone else there is nothing behind the `||`.
    //
    // That has a live consequence which is NOT fixed by correcting this comment: sessionStorage
    // does not cross tabs, so a student who joined through a dashboard and opens content in a NEW
    // TAB has no tenant context there — losing branding, and losing the sorting-quiz waiver that
    // AccessGuard grants white-label students. Tracked separately; see BUG-242.
    //
    // Do NOT "fix" that by making the dashboards write localStorage too. The verification below
    // is storage-source-agnostic and would still run, so it would not reopen the 2026-08-04 hole
    // — but on a SHARED or LAB machine a localStorage blob outlives the browser session and, when
    // the network check fails open (see the flaky-wifi note below), can render one student's
    // tenant branding into the next student's session. sessionStorage dying with the tab is a
    // property worth keeping.
    //
    // Operator ruling: "if the tenant is inactive no pill should be present for anybody."
    //
    // Verified against the SERVER, never against the cached blob that is being invalidated.
    // Uses getTenantConfig — already public, CORS-enabled, 30s-cached, and already the
    // endpoint every /tenant/*.html loader calls before writing this blob in the first
    // place. It returns `status`, and the loaders already reject non-'active' at JOIN time;
    // this applies the same test on every page load, which is the bit that was missing.
    //
    // Fail-open on a network error, deliberately: a student mid-lesson on flaky wifi must
    // not lose their course because a fetch timed out. A deactivated tenant surviving until
    // the next successful check is the lesser harm, and AccessGuard's own async verifier
    // closes the access half separately.
    /* TWO UNRELATED ACTIONS — do not merge them again.
       A tenant is WHITE-LABEL ACCESS: a branded wrapper over Hexworth. Ending the wrapper
       and ending someone's Hexworth account are different events with different triggers.

       stripTenantChrome() ends the WRAPPER ONLY. Branding, bar, pill and link overrides go;
       the blob stays, so the person keeps browsing Hexworth exactly as any other user.
       This is what a suspended tenant gets.

       purgeTenantAndStrip() additionally DELETES the blob. Because AccessGuard.js:699-736
       re-reads that blob on every require() call to waive the sorting quiz white-label
       students never take, deleting it also removes their content access. Reserve it for
       cases where there is no white-label relationship left to honour: the operator's own
       manual dismiss, and a tenant that returns 404.

       Collapsing these two took the platform down on 2026-08-04. Suspended-tenant students
       had their blob deleted, lost the bypass, and were redirected to the dashboard from
       every page — killing Hexworth for them when the intent was only to end the tenant. */
    function stripTenantChrome(reason) {
        // Stop the deferred injectors: on a page that loads this script in <head> (the
        // documented, recommended placement) injectBar/injectPill wait for DOMContentLoaded.
        // A cached 30s getTenantConfig response can resolve BEFORE that fires, in which case
        // the strip below removes nothing and the deferred callback then renders the shell
        // anyway from local vars that storage-clearing never touched. This flag is what the
        // injectors check; the DOM strip alone loses that race.
        revoked = true;

        // TenantRouter caches _active=true at script load and exposes refresh() precisely
        // for post-hoc storage changes. Without this, AccessGuard.redirect() still sees a
        // live tenant and routes the user INTO the hub just declared inactive, and
        // overrideLinks() keeps rewriting every Dashboard/Home link on the page to that hub
        // on its 1s/3s timers for the lifetime of the view.
        // NOT `window.TenantRouter` — TenantRouter.js:27 declares `const TenantRouter = ...`
        // at the top level of a CLASSIC script, so the binding lives in the global declarative
        // record and never becomes a property of window. `window.TenantRouter` is permanently
        // undefined and this whole call was dead code. `typeof` is the working pattern already
        // used at AccessGuard.js:658. Caught at QC 2026-08-04 by reproducing the stale-cache
        // redirect it was supposed to prevent.
        try { if (typeof TenantRouter !== 'undefined' && TenantRouter.refresh) TenantRouter.refresh(); } catch (e) {}

        // Strip whichever branch rendered: the full shell bar, or the re-enter pill
        // (plus the pill's dismiss badge, which is a SIBLING element rather than a child —
        // the pill is a <button> and nesting a button inside one is invalid HTML, so the
        // badge is positioned alongside it and must be removed by id in its own right).
        ['tenant-shell-bar', 'tenant-reenter-pill', 'tenant-pill-dismiss'].forEach(function(id) {
            var el = document.getElementById(id);
            if (el && el.parentNode) el.parentNode.removeChild(el);
        });
        if (window.console && console.info) {
            console.info('[TenantShell] tenant wrapper removed (' + reason + ') — '
                       + 'branding, bar and pill gone; Hexworth access untouched');
        }
    }

    /* Chrome removal PLUS deletion of the blob. This also costs the student their
       AccessGuard bypass, so it is only correct where no white-label relationship remains:
       the manual dismiss, a 404 tenant, or a blob that names no tenant at all. A suspended
       tenant must NOT come through here — see the note above stripTenantChrome(). */
    function purgeTenantAndStrip(reason) {
        try { sessionStorage.removeItem('hexworth_tenant'); } catch (e) {}
        try {
            localStorage.removeItem('hexworth_tenant');
            localStorage.removeItem('hexworth_tenant_slug');
            localStorage.removeItem(SHELL_HIDDEN_KEY);
        } catch (e) {}
        stripTenantChrome(reason);
    }

    (function verifyTenantStillActive() {
        var peek = null;
        try { peek = JSON.parse(raw); } catch (e) {}
        var slug = peek && peek.slug;
        // An unparseable or slugless blob cannot name a tenant to verify, and is exactly what
        // a hand-typed localStorage value looks like. Strip it rather than honour it.
        if (!slug) { purgeTenantAndStrip('no slug in cached config'); return; }

        fetch('https://us-central1-hexworth-prime.cloudfunctions.net/getTenantConfig?slug='
              + encodeURIComponent(slug))
            .then(function(r) {
                if (r.status === 404) { purgeTenantAndStrip('tenant no longer exists'); return null; }
                if (!r.ok) return null;                       // transient — fail open
                return r.json();
            })
            .then(function(cfg) {
                if (!cfg) return;
                /* A tenant that is no longer active ends the WHITE-LABEL WRAPPER and nothing
                   else. Chrome only — the blob survives, so the student keeps their Hexworth
                   access and simply browses unbranded. This is the operator's original ask
                   ("if the tenant is inactive no pill should be present for anybody") without
                   the collateral damage of the first attempt, which deleted the blob and
                   thereby killed Hexworth for every suspended tenant's students. */
                if (cfg.status !== 'active') {
                    stripTenantChrome('tenant status=' + cfg.status);
                }
            })
            .catch(function() { /* offline — fail open, re-checked next load */ });
    })();

    // Parse tenant for name (needed even when hidden, for the re-engage pill)
    var tenantPeek = null;
    try { tenantPeek = JSON.parse(raw); } catch (e) {}

    // ── Shell hidden? Show re-engage pill instead ────────
    // The user toggled the shell off. Enrollment is intact but the
    // visual shell, link overrides, and branding are all suppressed.
    // A small floating pill lets them re-enter the tenant experience.
    // Uses localStorage (not sessionStorage) so the state persists across tabs.
    var shellHidden = false;
    try { shellHidden = localStorage.getItem(SHELL_HIDDEN_KEY) === 'true'; } catch (e) {}

    if (shellHidden) {
        var tenantName = (tenantPeek && tenantPeek.branding && tenantPeek.branding.platformName)
            || (tenantPeek && tenantPeek.name) || 'Tenant';
        var pillColor = (tenantPeek && tenantPeek.branding && tenantPeek.branding.primaryColor) || '#06b6d4';
        var pillLogo  = (tenantPeek && tenantPeek.branding && tenantPeek.branding.logo) || null;

        // Derive 2-char tenant initials. Verified by node execution against
        // all 6 production tenant platformName values (2026-06-05):
        //   "Dr. Norfleet" → DN
        //   "Faculty Testing Primus" → FT
        //   "Infosec/ethics-May-2026" → IE
        //   "keiser university" → KU
        //   "Python April 2026" → PA
        //   "Dr. Wallace" → DW
        // Split on whitespace, slash, dash, underscore, or period.
        var deriveInitials = function(name) {
            if (!name) return 'T';
            var tokens = String(name).split(/[\s\/\-_.]+/).filter(Boolean);
            if (tokens.length === 0) return 'T';
            if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
            return (tokens[0][0] + tokens[1][0]).toUpperCase();
        };

        var injectPill = function() {
            // Same race as injectBar: this re-enters via DOMContentLoaded, which can fire
            // AFTER a cached getTenantConfig response has already revoked the tenant. The
            // storage purge does not reach these closure locals, so the flag is the guard.
            if (revoked) return;
            if (!document.body) {
                document.addEventListener('DOMContentLoaded', injectPill);
                return;
            }
            var pill = document.createElement('button');
            pill.id = 'tenant-reenter-pill';
            pill.title = 'Re-enter ' + tenantName + ' tenant view';
            pill.setAttribute('aria-label', pill.title);

            // HEUR-008 STRUCTURAL FIX per CLAUDE.md Rule 5 + EduScan validator
            // guidance at _tools/eduscan/validators/syntax/heuristics.js:813.
            //
            // position:fixed is reparented to the filtered ancestor when
            // body.style.filter is set (dashboard.html Storm Gates line 5941
            // + glitch firefly easter egg line 6629), causing the pill to
            // teleport relative to scroll. position:absolute is immune.
            // Y-axis pinned to viewport-bottom via rAF-throttled scroll
            // listener; X-axis static `right` matches platform precedent
            // (FluxCapacitor:641 pinFlux, SoundToggle:89 pinSound).
            pill.style.cssText = [
                'position: absolute',
                'right: 24px',
                'width: 44px',
                'height: 44px',
                'border-radius: 50%',
                'z-index: 99999',
                'background: ' + pillColor,
                'color: #fff',
                'border: none',
                'padding: 0',
                'cursor: pointer',
                'box-shadow: 0 2px 12px rgba(0,0,0,0.3)',
                'transition: opacity 0.2s ease, transform 0.2s ease',
                'opacity: 0.85',
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'font-size: 0.85rem',
                'font-weight: 700',
                'overflow: hidden',
                'line-height: 1'
            ].join(';');

            if (pillLogo) {
                var img = document.createElement('img');
                img.src = pillLogo;
                img.alt = '';
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
                pill.appendChild(img);
            } else {
                pill.textContent = deriveInitials(tenantName);
            }

            // Bottom-right stacking column on worst-case lab pages:
            //   HexAIButton (position:fixed, bottom 24, height 64):
            //       y = [24, 88] from viewport bottom
            //   FluxCapacitor (position:absolute, JS pinFlux at top=viewportH-88):
            //       same y-range as HexAIButton; FluxCapacitor and HexAIButton are
            //       alternative AI surfaces, do not co-render on the same page
            //   SoundToggle (position:absolute, JS pinSound at top=viewportH-136):
            //       y = [92, 136] from viewport bottom
            //   This pill (position:absolute, JS top=viewportH-188):
            //       y = [144, 188] from viewport bottom — 8px above SoundToggle top
            //
            // Derivation: pill_offsetBottom = SoundToggle_top_from_bottom + gap
            //                              = 136 + 8 = 144
            // (SoundToggle_top_from_bottom = 136 is the JS pinSound constant,
            // not the CSS `bottom: 92` value, which gets overridden by the JS.)
            //
            // Mobile note: isMobile() uses 600px threshold; SoundToggle's CSS
            // mobile breakpoint is 500px but its JS pinSound overrides that
            // at all widths. Mobile pill at bottom: 136 clears mobile
            // HexAIButton (bottom 16, height 64 → top edge at 80) + SoundToggle
            // by the same 8px margin as desktop.
            // ── Dismiss badge ────────────────────────────────────────────────
            // Reported 2026-08-04: "the pill stay on the screen even after class is done,
            // or the tennant deactivated or the user removed from tennant" / "we need to
            // have a way to remove the pills".
            //
            // Two of those three cases CANNOT be detected from this page. The automatic
            // check above uses getTenantConfig, which is public and needs no auth — that is
            // the only reason the tenant-deactivated case could be closed at all. Class-ended
            // lives on the class doc and student-removed lives at enrollments/{uid}, which
            // firestore.rules:887-889 restricts to an authenticated self-read. Verified in a
            // browser: on a content page `firebase`, `FirebaseAuth` and `FirestoreManager` are
            // all undefined, so there is no authenticated call path where this pill renders.
            // A manual control is therefore not a convenience here, it is the only mechanism
            // that covers those two cases — and it covers unforeseen ones for free.
            //
            // WHY IT CONFIRMS FIRST. purgeTenantAndStrip is not cosmetic. The blob does double
            // duty: AccessGuard.js:699-736 re-reads it on EVERY require() call and uses its
            // presence to waive the sorting quiz that tenant students never take. Dropping it
            // therefore revokes content access, and 81 of the 96 pages that load this script
            // call AccessGuard.require() (measured, not estimated). That is exactly right when
            // the relationship is over and a hard regression when it is not, so a mis-click on
            // a live enrollment must not be able to trigger it silently.
            //
            // WHY IT ROUTES TO THE LOBBY. Once the blob is gone this script is a no-op on the
            // next load (see the early return at the top — no blob, no bar, no pill), so there
            // would otherwise be no on-page route back and the student would need a join code
            // they may not have kept. lobby.html is the re-entry point, so we land them there
            // rather than on a page they can no longer open.
            //
            // Distinct from "Exit Shell" (line ~513), which sets SHELL_HIDDEN_KEY only and
            // deliberately leaves the blob — that hides the chrome while keeping enrollment
            // and access intact, and is what produced this leftover pill in the first place.
            var dismiss = document.createElement('button');
            dismiss.id = 'tenant-pill-dismiss';
            dismiss.type = 'button';
            dismiss.textContent = '×';                 // multiplication sign, not an emoji
            dismiss.title = 'Leave ' + tenantName + ' and remove this pill';
            dismiss.setAttribute('aria-label', dismiss.title);
            dismiss.style.cssText = [
                'position: absolute',                        // HEUR-008: never fixed, same as the pill
                'width: 18px',
                'height: 18px',
                'border-radius: 50%',
                'z-index: 100000',                           // one above the pill so it stays clickable
                'background: #0f172a',
                'color: #e2e8f0',
                'border: 1px solid rgba(255,255,255,0.25)',
                'padding: 0',
                'cursor: pointer',
                'font-size: 12px',
                'font-weight: 700',
                'line-height: 1',
                'display: flex',
                'align-items: center',
                'justify-content: center',
                'opacity: 0',                                // revealed on hover/focus of either element
                'transition: opacity 0.2s ease',
                'pointer-events: none'                       // unhoverable while invisible, so it cannot
            ].join(';');                                     // be clicked by accident off-screen

            // Reveal on hover or keyboard focus of EITHER element. Focus matters on its own:
            // an opacity-0 control that only appears on hover is unreachable by keyboard.
            var showDismiss = function() {
                dismiss.style.opacity = '1';
                dismiss.style.pointerEvents = 'auto';
            };
            var hideDismiss = function() {
                dismiss.style.opacity = '0';
                dismiss.style.pointerEvents = 'none';
            };
            [pill, dismiss].forEach(function(el) {
                el.addEventListener('mouseenter', showDismiss);
                el.addEventListener('mouseleave', hideDismiss);
                el.addEventListener('focus', showDismiss);
                el.addEventListener('blur', hideDismiss);
            });

            dismiss.addEventListener('click', function(ev) {
                // The pill sits underneath; without this the re-enter handler also fires and
                // reloads the page out from under the confirm.
                ev.stopPropagation();
                ev.preventDefault();
                var ok = window.confirm(
                    'Leave ' + tenantName + '?\n\n' +
                    'This removes the pill and exits the tenant on this device. You will lose ' +
                    'access to ' + tenantName + ' course content until you rejoin with your ' +
                    'join code.\n\n' +
                    'Your enrollment and progress are not deleted.'
                );
                if (!ok) return;
                purgeTenantAndStrip('dismissed by student');
                window.location.href = '/lobby.html';
            });

            var pendingFrame = null;
            var isMobile = function() { return window.innerWidth <= 600; };
            var repositionY = function() {
                pendingFrame = null;
                var offsetBottom = isMobile() ? 136 : 144;
                var top = window.scrollY + window.innerHeight - offsetBottom - 44;
                pill.style.top = top + 'px';
                // Overlap the pill's top-right corner by 5px so the badge reads as attached
                // to the pill rather than floating as a separate control.
                dismiss.style.top = (top - 5) + 'px';
            };
            var updateRight = function() {
                var right = isMobile() ? 16 : 24;
                pill.style.right = right + 'px';
                dismiss.style.right = (right - 5) + 'px';
            };
            var scheduleReposition = function() {
                if (pendingFrame !== null) return;
                pendingFrame = requestAnimationFrame(repositionY);
            };
            repositionY();
            updateRight();
            window.addEventListener('scroll', scheduleReposition, { passive: true });
            window.addEventListener('resize', function() {
                updateRight();
                scheduleReposition();
            }, { passive: true });

            pill.addEventListener('mouseover', function() { this.style.opacity = '1'; this.style.transform = 'scale(1.05)'; });
            pill.addEventListener('mouseout',  function() { this.style.opacity = '0.85'; this.style.transform = 'scale(1)'; });
            pill.addEventListener('click', function() {
                // Re-engage: clear the hidden flag from localStorage, reload into full shell
                try { localStorage.removeItem(SHELL_HIDDEN_KEY); } catch (e) {}
                window.location.reload();
            });
            document.body.appendChild(pill);
            document.body.appendChild(dismiss);
        };
        injectPill();

        // Expose toggle API for external use
        window.TenantShellToggle = {
            isHidden: function() { return true; },
            show: function() {
                try { localStorage.removeItem(SHELL_HIDDEN_KEY); } catch (e) {}
                window.location.reload();
            }
        };

        console.log('%c[TENANT] Shell hidden — pill active for: ' + tenantName, 'color: #94a3b8');

        // HEUR-030-class fix (2026-06-06): the visible-shell path's link
        // rewriter at L384-441 is never registered when shellHidden=true
        // (we return below before reaching L214 / L384). So a tenant student
        // who hides the shell loses href rewriting and any
        // <a href="/dashboard.html"> click sends them to main hex.
        //
        // Fix: run a parallel rewriter inside the shellHidden branch using
        // tenantPeek.slug. Independent of the visible-shell rewriter — no
        // shared variables (renamed hiddenHubUrl / hiddenOverrideLinks /
        // hiddenObserver), no ES5 hoisting collisions in the IIFE scope.
        //
        // The __tenantShellHiddenRewriterRegistered guard IS necessary here
        // (unlike the visible-shell __tenantShellExecuted at L214) because
        // shellHidden returns below before L214. If TenantShell.js is loaded
        // twice on a page (theoretically possible per AccessGuard/
        // ModuleProgress/FirebaseAuth auto-loader logic), two observers
        // would otherwise register.
        //
        // unauthorized.html stays in the rewrite list to match the
        // visible-shell L401-402 behavior — consistency over surprise.
        // Fail-CLOSED on missing slug: console.warn, no registration.
        if (tenantPeek && tenantPeek.slug && !window.__tenantShellHiddenRewriterRegistered) {
            window.__tenantShellHiddenRewriterRegistered = true;
            var hiddenHubUrl = '/tenant/index.html?slug=' + encodeURIComponent(tenantPeek.slug);
            var hiddenOverrideLinks = function() {
                // Revoked: stop rewriting. This re-runs on 1s/3s timers and a
                // MutationObserver, so without this it keeps pointing every
                // Dashboard/Home link at the dead tenant hub for the life of
                // the page, long after the shell itself was stripped.
                if (revoked) return;
                var targetUrl = (typeof TenantRouter !== 'undefined' && TenantRouter.isActive())
                    ? TenantRouter.getUrl('dashboard')
                    : hiddenHubUrl;
                var links = document.querySelectorAll('a[href]');
                for (var i = 0; i < links.length; i++) {
                    var href = links[i].getAttribute('href');
                    if (!href) continue;
                    if (links[i].getAttribute('data-tenant-override')) continue;
                    if (href.indexOf('dashboard.html') !== -1 ||
                        href === '/' || href === '/index.html' ||
                        href.indexOf('sorting.html') !== -1 ||
                        href.indexOf('unauthorized.html') !== -1) {
                        links[i].setAttribute('href', targetUrl);
                        links[i].setAttribute('data-tenant-override', 'true');
                    }
                }
            };
            // Two DOMContentLoaded callbacks below do DIFFERENT things —
            // not a copy-paste bug. First runs hiddenOverrideLinks; second
            // attaches the MutationObserver. Sequenced via separate addEventListener
            // calls. Matches the visible-shell pattern at L411-440.
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', hiddenOverrideLinks);
            } else {
                hiddenOverrideLinks();
            }
            setTimeout(hiddenOverrideLinks, 1000);
            setTimeout(hiddenOverrideLinks, 3000);
            if (typeof MutationObserver !== 'undefined') {
                var hiddenObserver = new MutationObserver(function(mutations) {
                    var hasNewLinks = false;
                    for (var i = 0; i < mutations.length; i++) {
                        if (mutations[i].addedNodes.length > 0) { hasNewLinks = true; break; }
                    }
                    if (hasNewLinks) hiddenOverrideLinks();
                });
                if (document.body) {
                    hiddenObserver.observe(document.body, { childList: true, subtree: true });
                } else {
                    document.addEventListener('DOMContentLoaded', function() {
                        hiddenObserver.observe(document.body, { childList: true, subtree: true });
                    });
                }
            }
        } else if (!tenantPeek || !tenantPeek.slug) {
            console.warn('[TENANT] Malformed tenant context (slug missing) — link rewriter disabled in shellHidden path');
        }

        return; // ← Skip all shell injection
    }

    // Prevent duplicate injection. The auto-loaders in AccessGuard/ModuleProgress/
    // FirebaseAuth use __tenantShellRequested to ensure only one <script> is created.
    // This flag prevents re-execution if the script somehow loads twice.
    if (window.__tenantShellExecuted) return;
    window.__tenantShellExecuted = true;

    var tenant = null;
    try {
        tenant = JSON.parse(raw);
    } catch (e) { return; }

    if (!tenant || !tenant.branding) return;

    var b = tenant.branding;
    var hubUrl = '/tenant/index.html?slug=' + encodeURIComponent(tenant.slug);

    // ── Apply branding CSS variables ─────────────────────
    var root = document.documentElement;
    if (b.primaryColor) root.style.setProperty('--brand-primary', b.primaryColor);
    if (b.secondaryColor) root.style.setProperty('--brand-secondary', b.secondaryColor);
    if (b.backgroundColor) root.style.setProperty('--brand-bg', b.backgroundColor);
    if (b.headerColor) root.style.setProperty('--brand-header', b.headerColor);
    if (b.fontFamily) root.style.setProperty('--brand-font', b.fontFamily);

    // Update page title to include tenant name
    if (b.platformName && document.title.indexOf(b.platformName) === -1) {
        document.title = document.title.replace(/Hexworth Prime/gi, b.platformName)
                                       .replace(/\| Hexworth$/i, '| ' + b.platformName);
        // If no replacement happened, append
        if (document.title.indexOf(b.platformName) === -1) {
            document.title += ' | ' + b.platformName;
        }
    }

    // Inject custom CSS if defined
    if (b.customCSS) {
        var customStyle = document.createElement('style');
        customStyle.textContent = b.customCSS;
        document.head.appendChild(customStyle);
    }

    // ── Inject tenant header bar ─────────────────────────
    // This bar sits at the very top of the page, above all other content.
    // It provides persistent branding and a "Return to Hub" link.

    var headerBar = document.createElement('div');
    headerBar.id = 'tenant-shell-bar';
    headerBar.style.cssText = [
        'position: sticky',
        'top: 0',
        'z-index: 99999',
        'background: ' + (b.headerColor || '#0d1117'),
        'border-bottom: 1px solid rgba(255,255,255,0.1)',
        'padding: 6px 16px',
        'display: flex',
        'align-items: center',
        'justify-content: space-between',
        'font-family: ' + (b.fontFamily || 'Inter, system-ui, sans-serif'),
        'font-size: 0.8rem'
    ].join(';');

    // Left side: logo + name
    var leftSide = document.createElement('div');
    leftSide.style.cssText = 'display:flex;align-items:center;gap:10px;';

    if (b.logo) {
        var logo = document.createElement('img');
        logo.src = b.logo;
        logo.alt = b.platformName || tenant.name;
        logo.style.cssText = 'height:22px;width:auto;object-fit:contain;';
        leftSide.appendChild(logo);
    }

    var nameSpan = document.createElement('span');
    nameSpan.textContent = b.platformName || tenant.name;
    nameSpan.style.cssText = 'font-weight:600;color:#e0e0e0;letter-spacing:0.02em;';
    leftSide.appendChild(nameSpan);

    // Accent underline
    var accent = document.createElement('div');
    accent.style.cssText = [
        'position: absolute',
        'bottom: -1px',
        'left: 0',
        'right: 0',
        'height: 2px',
        'background: linear-gradient(90deg, ' + (b.primaryColor || '#06b6d4') + ', ' + (b.secondaryColor || '#8b5cf6') + ', ' + (b.primaryColor || '#06b6d4') + ')'
    ].join(';');
    headerBar.appendChild(accent);

    // Right side: return to hub button
    var rightSide = document.createElement('div');
    rightSide.style.cssText = 'display:flex;align-items:center;gap:12px;';

    var hubBtn = document.createElement('a');
    hubBtn.href = hubUrl;
    hubBtn.textContent = 'Return to Hub';
    hubBtn.style.cssText = [
        'background: rgba(255,255,255,0.06)',
        'border: 1px solid rgba(255,255,255,0.1)',
        'color: #94a3b8',
        'padding: 4px 12px',
        'border-radius: 4px',
        'font-size: 0.75rem',
        'text-decoration: none',
        'transition: all 0.2s',
        'cursor: pointer'
    ].join(';');
    hubBtn.addEventListener('mouseover', function() {
        this.style.background = 'rgba(255,255,255,0.1)';
        this.style.color = '#e0e0e0';
    });
    hubBtn.addEventListener('mouseout', function() {
        this.style.background = 'rgba(255,255,255,0.06)';
        this.style.color = '#94a3b8';
    });
    rightSide.appendChild(hubBtn);

    // Toggle button: hide the tenant shell without unenrolling
    var toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Exit Shell';
    toggleBtn.title = 'Browse Hexworth Prime without the tenant wrapper. Your enrollment stays intact.';
    toggleBtn.style.cssText = [
        'background: transparent',
        'border: 1px solid rgba(255,255,255,0.08)',
        'color: #64748b',
        'padding: 4px 12px',
        'border-radius: 4px',
        'font-size: 0.72rem',
        'cursor: pointer',
        'transition: all 0.2s'
    ].join(';');
    toggleBtn.addEventListener('mouseover', function() {
        this.style.borderColor = 'rgba(255,255,255,0.2)';
        this.style.color = '#94a3b8';
    });
    toggleBtn.addEventListener('mouseout', function() {
        this.style.borderColor = 'rgba(255,255,255,0.08)';
        this.style.color = '#64748b';
    });
    toggleBtn.addEventListener('click', function() {
        // Hide the shell — enrollment stays, only visual wrapper goes away.
        // Uses localStorage so the hidden state persists across all tabs.
        try { localStorage.setItem(SHELL_HIDDEN_KEY, 'true'); } catch (e) {}
        // Open Hexworth Prime dashboard in a new tab so user has a clean starting point
        window.open('/dashboard.html', '_blank');
        // Reload current tab to drop the shell from this page too
        window.location.reload();
    });
    rightSide.appendChild(toggleBtn);

    headerBar.appendChild(leftSide);
    headerBar.appendChild(rightSide);

    // Insert at the very top of <body>
    // Wait for body to exist (script might be in <head>)
    function injectBar() {
        // Revocation can land before DOMContentLoaded when getTenantConfig answers from its
        // 30s cache. Check at BOTH the immediate and deferred moment: the deferred callback
        // fires long after the storage purge and would otherwise render an inactive tenant.
        if (revoked) return;
        if (document.body) {
            document.body.insertBefore(headerBar, document.body.firstChild);
        } else {
            // Body not ready yet — wait
            document.addEventListener('DOMContentLoaded', function() {
                if (revoked) return;
                document.body.insertBefore(headerBar, document.body.firstChild);
            });
        }
    }
    injectBar();

    // ── Override navigation links ────────────────────────
    // Replace all links that point to the Hexworth Prime dashboard
    // with links to the tenant hub. This runs after DOM is ready
    // and also observes for dynamically added links.

    function overrideLinks() {
        // Same reason as the hidden-branch rewriter: timers + MutationObserver keep
        // this alive after revocation unless it checks the flag.
        if (revoked) return;
        // Use TenantRouter for the hub URL if available, otherwise fall back
        var targetUrl = (typeof TenantRouter !== 'undefined' && TenantRouter.isActive())
            ? TenantRouter.getUrl('dashboard')
            : hubUrl;

        var links = document.querySelectorAll('a[href]');
        for (var i = 0; i < links.length; i++) {
            var href = links[i].getAttribute('href');
            if (!href) continue;

            // Skip links already overridden
            if (links[i].getAttribute('data-tenant-override')) continue;

            // Dashboard links (any relative depth or absolute)
            if (href.indexOf('dashboard.html') !== -1 ||
                href === '/' || href === '/index.html' ||
                href.indexOf('sorting.html') !== -1 ||
                href.indexOf('unauthorized.html') !== -1) {

                links[i].setAttribute('href', targetUrl);
                links[i].setAttribute('data-tenant-override', 'true');
            }
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', overrideLinks);
    } else {
        overrideLinks();
    }

    // Also run after a short delay (catches dynamically rendered links)
    setTimeout(overrideLinks, 1000);
    setTimeout(overrideLinks, 3000);

    // Observe DOM mutations to catch dynamically added links
    if (typeof MutationObserver !== 'undefined') {
        var observer = new MutationObserver(function(mutations) {
            var hasNewLinks = false;
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes.length > 0) {
                    hasNewLinks = true;
                    break;
                }
            }
            if (hasNewLinks) overrideLinks();
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                observer.observe(document.body, { childList: true, subtree: true });
            });
        }
    }

    // ── Override ModuleProgress navigation ────────────────
    // ModuleProgress navigateToDashboard() now checks TenantRouter
    // directly (wired in ModuleProgress.js), so this monkey-patch
    // is only a safety net for the legacy _goToDashboard path.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof ModuleProgress !== 'undefined' && ModuleProgress._goToDashboard) {
                ModuleProgress._goToDashboard = function() {
                    if (typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) {
                        window.location.href = TenantRouter.getUrl('dashboard');
                    } else {
                        window.location.href = hubUrl;
                    }
                };
            }
        });
    }

    // ── Public toggle API ─────────────────────────────────
    // Allows other components to check shell state or toggle it
    window.TenantShellToggle = {
        isHidden: function() { return false; },
        hide: function() {
            try { localStorage.setItem(SHELL_HIDDEN_KEY, 'true'); } catch (e) {}
            window.open('/dashboard.html', '_blank');
            window.location.reload();
        },
        show: function() { /* already showing */ }
    };

    // ── Console log ──────────────────────────────────────
    console.log('%c[TENANT] Shell active: ' + (b.platformName || tenant.name), 'color: ' + (b.primaryColor || '#06b6d4'));

})();
