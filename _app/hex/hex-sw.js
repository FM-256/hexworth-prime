/**
 * hex-sw.js. NOT REGISTERED. DO NOT REGISTER IT. Kept for HEXOS-5b.
 *
 * ============================ READ THIS BEFORE WIRING IT UP ============================
 * Nothing registers this file, and that is deliberate. It is retained because the caching
 * design below is sound and will be reused; what is unsound is registering a SECOND worker
 * at this path at all.
 *
 * WHY. tenant-sw.js is registered at scope '/' and injects TenantRouter + TenantShell into
 * every navigation outside /tenant/ and /admin/. That injection is the white-label guarantee
 * a tenant is paying for. Service worker scope matching prefers the LONGEST match, so a
 * worker scoped to '/hex/' becomes the controller for the two Hex OS pages and tenant-sw
 * stops seeing those navigations. Verified in a browser, not inferred: a root worker's
 * injection stops the moment a narrower worker registers, and it stops even if the narrower
 * worker's fetch handler does nothing at all: the controller is chosen by scope, not by
 * behaviour. So "register it but pass through" is NOT a safe middle ground.
 *
 * WHY A GUARD DOES NOT RESCUE IT. The first attempt shipped a load-time check: read
 * hexworth_tenant, and if present skip registration and unregister any existing worker. A
 * reviewer showed that cannot work. The controller for a navigation is resolved BEFORE the
 * destination document's scripts run, so on the very load where the guard detects a tenant,
 * this worker had already served the page uninjected. The guard only protects the NEXT load.
 * Worse, the cross-tab case it relied on could not fire: hexworth_tenant is written to
 * localStorage by exactly one of twelve writers (_app/lobby.html), while the ten tenant
 * dashboards and tenant/index.html write sessionStorage only, which does not cross tabs.
 * (TenantShell.js:60 asserts both are written; that comment is wrong, and believing it is
 * where the guard's confidence came from.)
 *
 * WHAT HEXOS-5b SHOULD DO INSTEAD. Only one worker can control a page, so Hex OS offline
 * caching belongs IN the single root-scoped worker that already controls every page, beside
 * the tenant injection, not in a second worker competing for these two paths. The cache
 * strategy below transfers as-is; the registration does not.
 *
 * Nothing was lost by removing it. Chrome's Page.getInstallabilityErrors returns [] for /hex/
 * with no worker registered, so the PWA still installs. Offline launch is the only casualty.
 * =====================================================================================
 *
 * Everything below this line describes the design AS IT WOULD BEHAVE IF REGISTERED. It is not
 * registered. Read it as the spec for HEXOS-5b, not as a description of what is running.
 *
 * SCOPE. This file lives at /hex/, so the narrowest scope it could ever claim is '/hex/'. That
 * placement is deliberate: a worker cannot claim a scope above its own path, which makes
 * "accidentally becomes a root worker and evicts tenant-sw.js" structurally impossible rather
 * than merely discouraged. Note this protects only the WIDENING direction. It does nothing about
 * the failure that actually matters here, which runs the other way: at '/hex/' it would be
 * NARROWER than tenant-sw.js at '/', and the narrower scope wins. See the header.
 *
 * NETWORK-FIRST, DELIBERATELY. A cache-first worker is how a PWA ships a bug that outlives the
 * fix: students keep getting yesterday's shell no matter how many times we deploy. Every request
 * goes to the network first; the cache exists only so the shell opens when the network does not.
 * Slightly slower, and impossible to get permanently stuck.
 *
 * WHAT IS CACHED: the two Hex OS pages, the manifest, and the app list. Not lab content, not
 * course pages, not anything under another house. A lab is a live container session; serving one
 * from cache would show a student a box that no longer exists.
 */
'use strict';

// Bump on every change to this file or the shell. An unchanged name means an old worker keeps
// serving an old cache, which is the failure mode this design is built to avoid.
const CACHE = 'hex-os-v1';

const PRECACHE = [
    '/hex/',
    '/hex/apps.html',
    '/hex/manifest.webmanifest',
    '/data/hex-apps.json',
];

self.addEventListener('install', (event) => {
    // Take over promptly; there is no half-updated state worth preserving for a launcher.
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE)
            // addAll rejects the whole install if ANY entry 404s, which would leave the PWA with
            // no worker at all. Add individually and tolerate misses.
            .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => null))))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('hex-os-'))
                .map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    // Same-origin only, and only inside this worker's own scope. Everything else, meaning lab
    // pages, course content and the sandbox API, is left alone, so nothing this worker does can
    // serve a student a stale version of anything outside Hex OS.
    if (url.origin !== self.location.origin) return;
    const inScope = url.pathname.startsWith('/hex/') || url.pathname === '/data/hex-apps.json';
    if (!inScope) return;

    event.respondWith(
        fetch(req)
            .then((res) => {
                // Only cache a real success. Caching a 404 or a redirect is how a worker pins a
                // broken page in place.
                if (res && res.status === 200 && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
                }
                return res;
            })
            .catch(() => caches.match(req).then((hit) => hit || caches.match('/hex/')))
    );
});
