/**
 * SiteNotice.js — the site-wide notice banner (planned maintenance, known problems).
 *
 * An admin turns it on from the admin console (Operations > Site notice), which writes the one
 * Firestore document site_notice/current. Every page that loads AccessGuard.js or FirebaseAuth.js
 * auto-loads this file, which reads that document and, when it is active and not expired, shows
 * a thin bar across the top of the page.
 *
 * Design choices:
 * - Read through the Firestore REST API, not the SDK: it works on pages that never load Firebase,
 *   and for signed-out visitors (the rule allows a public get of this one document).
 * - Cached in localStorage for 5 minutes, so a visitor costs at most one read per 5 minutes.
 * - Fails closed to NOTHING: any error (offline, blocked, bad data) shows no banner and never
 *   throws into the page.
 * - Top window only: pages embedded in an iframe do not repeat it.
 * - A dismissal is remembered against the notice's updatedAt, so a new or edited notice shows again.
 * - In normal flow at the top of <body>, not sticky or fixed: it is seen on arrival and scrolls
 *   away. Measured 2026-11-12 on 64 sampled pages: 26 have a sticky header, which a sticky banner
 *   would cover once the page scrolls. (Fixed is also out: CLAUDE.md rule 5.)
 * - A full-width bar pinned to the very top with position absolute or fixed (the landing page's
 *   nav is one) does not move with the flow, so while the banner shows such bars are moved down
 *   by its height, and moved back on dismiss. Only bars at top 0, wider than half the window and
 *   under 150px tall are touched.
 *
 * Firestore fields: active (bool), level ('info' | 'warning'), message (<= 280 chars),
 * endsAt (ms epoch or null: clears itself at that time), updatedAt (ms epoch, the version).
 */
(function () {
    'use strict';

    if (window.SiteNotice) { return; }

    var PROJECT = 'hexworth-prime';
    /* The public web API key, the same one FirebaseAuth.js initializes with (a drift test checks). */
    var API_KEY = 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M';
    var DOC_URL = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents/site_notice/current?key=' + API_KEY;
    var CACHE_KEY = 'hexworth_site_notice_v1';
    var DISMISS_KEY = 'hexworth_site_notice_dismissed_v1';
    var CACHE_MS = 5 * 60 * 1000;
    var FETCH_TIMEOUT_MS = 4000;
    var EL_ID = 'hx-site-notice';

    /* localStorage that never throws (private mode, blocked storage). */
    function store(key, value) {
        try {
            if (value === undefined) { return localStorage.getItem(key); }
            localStorage.setItem(key, value);
        } catch (e) { /* storage unavailable: no cache, no remembered dismissal */ }
        return null;
    }

    /* A Firestore REST document -> { active, level, message, endsAt, updatedAt }, or null. */
    function parse(restDoc) {
        var f = restDoc && restDoc.fields;
        if (!f) { return null; }
        var num = function (v) { return v && v.integerValue !== undefined ? Number(v.integerValue) : null; };
        var n = {
            active: !!(f.active && f.active.booleanValue === true),
            level: f.level && f.level.stringValue === 'warning' ? 'warning' : 'info',
            message: f.message && typeof f.message.stringValue === 'string' ? f.message.stringValue.slice(0, 280) : '',
            endsAt: num(f.endsAt),
            updatedAt: num(f.updatedAt) || 0
        };
        return n;
    }

    /* Should this notice show now, for this visitor? */
    function shouldShow(n, now) {
        if (!n || !n.active || !n.message.trim()) { return false; }
        if (n.endsAt !== null && now >= n.endsAt) { return false; }
        return store(DISMISS_KEY) !== String(n.updatedAt);
    }

    /* The cached notice if fresh, else undefined. A cached null means "no notice" and is fresh too. */
    function cached(now) {
        try {
            var c = JSON.parse(store(CACHE_KEY) || 'null');
            if (c && typeof c.at === 'number' && now - c.at < CACHE_MS && now >= c.at) { return c.notice; }
        } catch (e) { /* unreadable cache: refetch */ }
        return undefined;
    }

    /* Fetches the document. Resolves to the notice, or null when there is none (404) or on any error. */
    function fetchNotice() {
        var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS) : null;
        return fetch(DOC_URL, { cache: 'no-store', credentials: 'omit', signal: ctrl ? ctrl.signal : undefined })
            .then(function (r) {
                if (r.status === 404) { return { notice: null, cache: true }; }
                if (!r.ok) { return { notice: null, cache: false }; }
                return r.json().then(function (j) { return { notice: parse(j), cache: true }; });
            })
            .catch(function () { return { notice: null, cache: false }; })
            .then(function (res) {
                if (timer) { clearTimeout(timer); }
                /* a failed read is not cached, so the next page tries again */
                if (res.cache) { store(CACHE_KEY, JSON.stringify({ at: Date.now(), notice: res.notice })); }
                return res.notice;
            });
    }

    /* Injects the banner's stylesheet once. Fixed colours with AA contrast in light and dark pages. */
    function injectStyle() {
        if (document.getElementById(EL_ID + '-style')) { return; }
        var s = document.createElement('style');
        s.id = EL_ID + '-style';
        s.textContent =
            '#' + EL_ID + '{position:relative;z-index:2147483000;display:flex;align-items:center;gap:12px;' +
            'padding:8px 16px;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;box-sizing:border-box;width:100%;' +
            'box-shadow:0 1px 3px rgba(0,0,0,.25);visibility:visible}' +
            '#' + EL_ID + '.info{background:#0b4f8a;color:#ffffff}' +
            '#' + EL_ID + '.warning{background:#ffd24d;color:#1b1b1b}' +
            '#' + EL_ID + ' .hx-sn-text{flex:1;min-width:0;overflow-wrap:anywhere}' +
            '#' + EL_ID + ' .hx-sn-text strong{margin-right:6px}' +
            '#' + EL_ID + ' button{flex:none;font:inherit;font-weight:600;cursor:pointer;border-radius:4px;padding:3px 10px;' +
            'background:transparent;color:inherit;border:1px solid currentColor}' +
            '@media print{#' + EL_ID + '{display:none}}';
        document.head.appendChild(s);
    }

    /* "until 9:30 PM" in the visitor's own time, or '' when the notice has no end. */
    function untilText(endsAt) {
        if (endsAt === null) { return ''; }
        try { return ' (until ' + new Date(endsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ')'; }
        catch (e) { return ''; }
    }

    /* Top bars moved down while the banner shows: [element, its inline top before]. */
    var shifted = [];

    /* Moves full-width bars pinned at the very top (absolute or fixed, top 0) below the banner. */
    function shiftTopBars(bar) {
        var h = bar.getBoundingClientRect().height;
        var all = document.body.getElementsByTagName('*');
        for (var i = 0; i < all.length; i++) {
            var e = all[i];
            if (e === bar || bar.contains(e) || e.getAttribute('data-hx-sn-shifted')) { continue; }
            var cs = getComputedStyle(e);
            if (cs.position !== 'absolute' && cs.position !== 'fixed') { continue; }
            if (parseFloat(cs.top) !== 0 || cs.display === 'none') { continue; }
            var r = e.getBoundingClientRect();
            if (Math.abs(r.top - (cs.position === 'fixed' ? 0 : -window.scrollY)) > 1) { continue; }   /* anchored to the page or window top, not inside a moved box */
            if (r.width < window.innerWidth / 2 || r.height <= 0 || r.height >= 150) { continue; }
            shifted.push([e, e.style.top]);
            e.setAttribute('data-hx-sn-shifted', '1');
            e.style.top = h + 'px';
        }
    }
    /* Puts every moved bar back where it was. */
    function unshiftTopBars() {
        shifted.forEach(function (x) { x[0].style.top = x[1]; x[0].removeAttribute('data-hx-sn-shifted'); });
        shifted = [];
    }

    /* Renders (or replaces) the banner as the first element of <body>. Text only: never HTML. */
    function render(n) {
        var old = document.getElementById(EL_ID);
        if (old) { old.parentNode.removeChild(old); }
        unshiftTopBars();
        if (!n) { return; }
        injectStyle();
        var bar = document.createElement('div');
        bar.id = EL_ID;
        bar.className = n.level;
        bar.setAttribute('role', n.level === 'warning' ? 'alert' : 'status');
        var text = document.createElement('div');
        text.className = 'hx-sn-text';
        var label = document.createElement('strong');
        label.textContent = n.level === 'warning' ? 'Notice:' : 'Info:';
        text.appendChild(label);
        text.appendChild(document.createTextNode(n.message + untilText(n.endsAt)));
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Dismiss';
        btn.setAttribute('aria-label', 'Dismiss this notice');
        btn.onclick = function () { store(DISMISS_KEY, String(n.updatedAt)); render(null); };
        bar.appendChild(text);
        bar.appendChild(btn);
        document.body.insertBefore(bar, document.body.firstChild);
        try { shiftTopBars(bar); } catch (e) { /* a page's odd layout never breaks the banner */ }
    }

    /* Reads the notice (cache first unless forced) and shows or hides the banner. */
    function refresh(opts) {
        var now = Date.now();
        var c = opts && opts.force ? undefined : cached(now);
        var p = c !== undefined ? Promise.resolve(c) : fetchNotice();
        return p.then(function (n) {
            var show = shouldShow(n, Date.now());
            render(show ? n : null);
            return show ? n : null;
        }).catch(function () { return null; });
    }

    /* Top window only; wait for <body>. */
    function start() {
        var top = false;
        try { top = window.top === window.self; } catch (e) { top = false; }
        if (!top || typeof fetch !== 'function') { return; }
        if (document.body) { refresh(); }
        else { document.addEventListener('DOMContentLoaded', function () { refresh(); }); }
    }

    window.SiteNotice = { refresh: refresh, _parse: parse, _shouldShow: shouldShow, CACHE_KEY: CACHE_KEY, DISMISS_KEY: DISMISS_KEY };
    start();
})();
