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

    // ── Check for tenant context ─────────────────────────
    var raw = null;
    try {
        raw = sessionStorage.getItem('hexworth_tenant') || localStorage.getItem('hexworth_tenant');
    } catch (e) {}

    // No tenant = no-op. Direct Hexworth Prime users see nothing.
    if (!raw) return;

    // Parse tenant for name (needed even when hidden, for the re-engage pill)
    var tenantPeek = null;
    try { tenantPeek = JSON.parse(raw); } catch (e) {}

    // ── Shell hidden? Show re-engage pill instead ────────
    // The user toggled the shell off. Enrollment is intact but the
    // visual shell, link overrides, and branding are all suppressed.
    // A small floating pill lets them re-enter the tenant experience.
    var shellHidden = false;
    try { shellHidden = sessionStorage.getItem(SHELL_HIDDEN_KEY) === 'true'; } catch (e) {}

    if (shellHidden) {
        var tenantName = (tenantPeek && tenantPeek.branding && tenantPeek.branding.platformName)
            || (tenantPeek && tenantPeek.name) || 'Tenant';
        var pillColor = (tenantPeek && tenantPeek.branding && tenantPeek.branding.primaryColor) || '#06b6d4';

        function injectPill() {
            if (!document.body) {
                document.addEventListener('DOMContentLoaded', injectPill);
                return;
            }
            var pill = document.createElement('button');
            pill.id = 'tenant-reenter-pill';
            pill.title = 'Re-enter ' + tenantName + ' tenant view';
            pill.textContent = tenantName;
            pill.style.cssText = [
                'position: fixed',
                'bottom: 20px',
                'right: 20px',
                'z-index: 99999',
                'background: ' + pillColor,
                'color: #fff',
                'border: none',
                'padding: 8px 16px',
                'border-radius: 20px',
                'font-size: 0.72rem',
                'font-weight: 600',
                'letter-spacing: 0.04em',
                'cursor: pointer',
                'box-shadow: 0 2px 12px rgba(0,0,0,0.3)',
                'transition: all 0.2s',
                'opacity: 0.85'
            ].join(';');
            pill.addEventListener('mouseover', function() { this.style.opacity = '1'; this.style.transform = 'scale(1.05)'; });
            pill.addEventListener('mouseout', function() { this.style.opacity = '0.85'; this.style.transform = 'scale(1)'; });
            pill.addEventListener('click', function() {
                // Re-engage: clear the hidden flag, reload into full shell
                try { sessionStorage.removeItem(SHELL_HIDDEN_KEY); } catch (e) {}
                window.location.reload();
            });
            document.body.appendChild(pill);
        }
        injectPill();

        // Expose toggle API for external use
        window.TenantShellToggle = {
            isHidden: function() { return true; },
            show: function() {
                try { sessionStorage.removeItem(SHELL_HIDDEN_KEY); } catch (e) {}
                window.location.reload();
            }
        };

        console.log('%c[TENANT] Shell hidden — pill active for: ' + tenantName, 'color: #94a3b8');
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
        // Hide the shell — enrollment stays, only visual wrapper goes away
        try { sessionStorage.setItem(SHELL_HIDDEN_KEY, 'true'); } catch (e) {}
        window.location.reload();
    });
    rightSide.appendChild(toggleBtn);

    headerBar.appendChild(leftSide);
    headerBar.appendChild(rightSide);

    // Insert at the very top of <body>
    // Wait for body to exist (script might be in <head>)
    function injectBar() {
        if (document.body) {
            document.body.insertBefore(headerBar, document.body.firstChild);
        } else {
            // Body not ready yet — wait
            document.addEventListener('DOMContentLoaded', function() {
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
            try { sessionStorage.setItem(SHELL_HIDDEN_KEY, 'true'); } catch (e) {}
            window.location.reload();
        },
        show: function() { /* already showing */ }
    };

    // ── Console log ──────────────────────────────────────
    console.log('%c[TENANT] Shell active: ' + (b.platformName || tenant.name), 'color: ' + (b.primaryColor || '#06b6d4'));

})();
