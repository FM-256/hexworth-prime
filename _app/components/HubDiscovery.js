/*
 * HubDiscovery: surfaces PUBLISHED data-driven hubs (task #225) on their house's index page.
 *
 * Discovery model (operator-chosen "option 1"): a hub created for houseId="shield" appears as a
 * tile on /houses/shield/. One-line include, no per-house code:
 *
 *     <div data-hub-discovery></div>
 *     <script src="/components/HubDiscovery.js" data-house="shield"></script>
 *
 * It lazily loads Firebase compat (house pages are otherwise static), queries
 * hubRegistry where status=='published' (rules-safe for any visitor; the constrained query is
 * exactly what the rules require of a non-admin list), filters to this house, and renders tiles
 * into the [data-hub-discovery] container (or appends one). If there are no published hubs for the
 * house, it renders nothing and stays hidden. It is XSS-hardened (textContent, icon allowlist,
 * slug-validated hrefs) and NEVER throws: a discovery failure must not break the house page.
 */
(function () {
    'use strict';
    var SELF = document.currentScript;                 // captured now; null inside async init
    var HOUSE = (SELF && SELF.dataset && SELF.dataset.house) || '';

    var ICON = /^\/assets\/images\/icons\/[A-Za-z0-9_-]+\.webp$/;
    var SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
    function safeIcon(v) { return (typeof v === 'string' && ICON.test(v)) ? v : '/assets/images/icons/hexworth-mark.webp'; }
    function el(tag, text, cls) {
        var n = document.createElement(tag);
        if (cls) { n.className = cls; }
        if (text != null) { n.textContent = String(text); }   // textContent = XSS-safe
        return n;
    }

    function injectStyles() {
        if (document.getElementById('hubdisc-styles')) { return; }
        var s = document.createElement('style'); s.id = 'hubdisc-styles';
        s.textContent =
            '.hubdisc{max-width:1100px;margin:32px auto;padding:0 24px}' +
            '.hubdisc-head{font-size:.75rem;letter-spacing:.28em;text-transform:uppercase;color:#22d3ee;font-weight:700;margin-bottom:14px}' +
            '.hubdisc-grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}' +
            '.hubdisc-card{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid rgba(255,255,255,.12);' +
            'border-radius:12px;background:rgba(255,255,255,.03);text-decoration:none;color:#e9edf4;transition:border-color .2s,transform .15s}' +
            '.hubdisc-card:hover{border-color:rgba(34,211,238,.5);transform:translateY(-2px)}' +
            '.hubdisc-card img{width:38px;height:38px;flex:0 0 auto}' +
            '.hubdisc-label{font-weight:600;font-size:.98rem}.hubdisc-sub{color:#8b95a8;font-size:.82rem;margin-top:2px}';
        document.head.appendChild(s);
    }

    function loadScript(src) {
        return new Promise(function (res, rej) {
            var s = document.createElement('script'); s.src = src; s.async = false;
            s.onload = res; s.onerror = function () { rej(new Error('load ' + src)); };
            document.head.appendChild(s);
        });
    }
    function ensureFirebase() {
        if (typeof firebase !== 'undefined' && firebase.firestore) { return Promise.resolve(true); }
        // House pages are static; load compat + the hosting-provided init only when needed.
        return loadScript('/__/firebase/10.12.2/firebase-app-compat.js')
            .then(function () { return loadScript('/__/firebase/10.12.2/firebase-firestore-compat.js'); })
            .then(function () { return loadScript('/__/firebase/init.js'); })
            .then(function () { return (typeof firebase !== 'undefined' && !!firebase.firestore); })
            .catch(function () { return false; });
    }

    function renderTiles(container, hubs) {
        var mine = hubs.filter(function (h) { return h.houseId === HOUSE && h.status === 'published' && SLUG.test(h.id); });
        if (!mine.length) { container.style.display = 'none'; return; }
        mine.sort(function (a, b) { return (Number(a.sortOrder) || 999) - (Number(b.sortOrder) || 999); });
        while (container.firstChild) { container.removeChild(container.firstChild); }  // clear (no data via innerHTML)
        var head = el('div', 'Hubs', 'hubdisc-head'); container.appendChild(head);
        var grid = el('div', null, 'hubdisc-grid');
        mine.forEach(function (h) {
            var card = el('a', null, 'hubdisc-card');
            card.setAttribute('href', '/houses/hub/' + h.id);   // id is slug-validated above
            var img = document.createElement('img'); img.src = safeIcon(h.icon); img.alt = ''; card.appendChild(img);
            var t = el('div');
            t.appendChild(el('div', h.label || h.id, 'hubdisc-label'));
            if (h.sublabel) { t.appendChild(el('div', h.sublabel, 'hubdisc-sub')); }
            card.appendChild(t);
            grid.appendChild(card);
        });
        container.appendChild(grid);
        container.style.display = '';
    }

    // Session cache: the published-hub set is the SAME for every house, so one query per session
    // serves all house pages. A cache HIT skips the Firebase load entirely (the main per-page cost).
    // Short TTL so a freshly-published hub still appears within a couple minutes without a hard refresh.
    var CACHE_KEY = 'hubdisc_published_v1';
    var CACHE_TTL = 120000; // 2 min
    function readCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) { return null; }
            var o = JSON.parse(raw);
            if (!o || typeof o.t !== 'number' || (Date.now() - o.t) > CACHE_TTL || !Array.isArray(o.hubs)) { return null; }
            return o.hubs;
        } catch (e) { return null; }
    }
    function writeCache(hubs) {
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), hubs: hubs })); } catch (e) { /* quota/private mode */ }
    }

    function init() {
        if (!SLUG.test(HOUSE)) { return; }          // no/invalid data-house -> no-op
        var container = document.querySelector('[data-hub-discovery]');
        if (!container) { container = document.createElement('div'); container.setAttribute('data-hub-discovery', ''); document.body.appendChild(container); }
        container.className = 'hubdisc'; container.style.display = 'none';
        injectStyles();
        var cached = readCache();
        if (cached) { renderTiles(container, cached); return; }   // cache hit: no Firebase load
        ensureFirebase().then(function (ready) {
            if (!ready) { return; }
            return firebase.firestore().collection('hubRegistry').where('status', '==', 'published').get()
                .then(function (snap) {
                    var hubs = []; snap.forEach(function (d) { var x = d.data() || {}; x.id = d.id; hubs.push(x); });
                    writeCache(hubs);
                    renderTiles(container, hubs);
                });
        }).catch(function () { /* discovery must never break the house page */ });
    }

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
    else { init(); }

    // Expose for testing / manual invocation.
    if (typeof window !== 'undefined') { window.HubDiscovery = { render: renderTiles, house: HOUSE }; }
})();
