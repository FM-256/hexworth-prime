/**
 * TenantServiceWorker — Network-Layer Tenant Shell Injection
 *
 * PURPOSE:
 * Intercepts every HTML page fetch within the tenant scope and injects
 * TenantRouter.js + TenantShell.js into the <head> before the browser
 * parses the page. This guarantees tenant encapsulation on ALL pages
 * without modifying any content files.
 *
 * HOW IT WORKS:
 * 1. Tenant dashboard registers this SW with scope '/' (entire app)
 * 2. SW activates and claims all clients immediately
 * 3. On every fetch for an HTML page:
 *    a. Fetches the original page from the server
 *    b. Reads the response as text
 *    c. Injects <script> tags for TenantRouter.js and TenantShell.js
 *       after <meta charset="UTF-8"> (or after <head> if no charset)
 *    d. Returns the modified response to the browser
 * 4. Non-HTML requests (JS, CSS, images, API calls) pass through untouched
 *
 * SCOPING:
 * The SW only injects when the tenant session is active. It checks for
 * a 'tenant-active' flag set during registration. If the flag is not
 * set (direct Hexworth Prime user), all requests pass through unmodified.
 *
 * UNREGISTRATION:
 * When the tenant session ends (user clicks "Sign Out" or navigates to
 * a non-tenant page), the SW unregisters itself so direct users are
 * never affected.
 *
 * @version 1.0.0
 * @feature WL-4
 */

// ── State ──
let tenantActive = false;

// ── Lifecycle ──

self.addEventListener('install', function(event) {
    // Activate immediately — don't wait for old SW to die
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    // Claim all open tabs immediately so injection starts right away
    event.waitUntil(self.clients.claim());
});

// Listen for messages from the page (activation/deactivation)
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'TENANT_ACTIVATE') {
        tenantActive = true;
    } else if (event.data && event.data.type === 'TENANT_DEACTIVATE') {
        tenantActive = false;
    }
});

// ── Fetch Interception ──

self.addEventListener('fetch', function(event) {
    // Only intercept when tenant is active
    if (!tenantActive) return;

    var request = event.request;

    // Only intercept navigation requests (HTML pages)
    // Skip API calls, scripts, stylesheets, images, etc.
    if (request.mode !== 'navigate') return;

    // Skip tenant dashboard pages themselves (they already have the scripts)
    var url = new URL(request.url);
    if (url.pathname.startsWith('/tenant/')) return;

    // Skip admin pages
    if (url.pathname.startsWith('/admin/')) return;

    // Intercept: fetch the page, inject tenant scripts, return modified response
    event.respondWith(injectTenantShell(request));
});

/**
 * Fetch the original page, inject tenant scripts into <head>,
 * and return the modified response.
 */
async function injectTenantShell(request) {
    try {
        var response = await fetch(request);

        // Only modify HTML responses
        var contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
            return response;
        }

        // Read the original HTML
        var html = await response.text();

        // The injection payload — TenantRouter and TenantShell scripts
        // These are idempotent: TenantRouter checks for existing instance,
        // TenantShell checks __tenantShellExecuted flag
        var injection = '\n    <script src="/components/TenantRouter.js"></script>' +
                       '\n    <script src="/components/TenantShell.js"></script>';

        // Inject after <meta charset="UTF-8"> if present
        var injected = false;
        if (html.indexOf('<meta charset="UTF-8">') !== -1) {
            html = html.replace(
                '<meta charset="UTF-8">',
                '<meta charset="UTF-8">' + injection
            );
            injected = true;
        }

        // Fallback: inject after <head> tag
        if (!injected && html.indexOf('<head>') !== -1) {
            html = html.replace('<head>', '<head>' + injection);
            injected = true;
        }

        // Fallback: inject after <head ...> with attributes
        if (!injected) {
            html = html.replace(/<head([^>]*)>/, '<head$1>' + injection);
        }

        // Build a new response with the modified HTML
        // Preserve original headers but update content-length
        var newHeaders = new Headers(response.headers);
        newHeaders.delete('content-length'); // Length changed, let browser calculate

        return new Response(html, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (err) {
        // On any error, fall through to the original request
        return fetch(request);
    }
}
