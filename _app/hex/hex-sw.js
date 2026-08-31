/**
 * hex-sw.js — service worker for the Hex OS PWA (HEXOS-5).
 *
 * SCOPE IS THE WHOLE SAFETY STORY. This file lives at /hex/ and is registered with
 * { scope: '/hex/' }, so it controls /hex/* and nothing else. It must never be moved to the root
 * or registered with scope '/': tenant-sw.js already registers at scope '/' (see
 * _app/tenant/index.html), and a second root-scoped worker would evict it, taking tenant routing
 * down platform-wide. A worker cannot claim a scope above its own path, so keeping this file
 * inside /hex/ makes that mistake structurally impossible rather than merely discouraged.
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
    // Same-origin only, and only inside this worker's own scope. Everything else -- lab pages,
    // course content, the sandbox API -- is left entirely alone, so nothing this worker does can
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
