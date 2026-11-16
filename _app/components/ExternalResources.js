/**
 * ExternalResources.js — the "Free extra practice" card on course hubs (external, free materials).
 *
 * A hub opts in with one tag before </body>:
 *   <script src="/components/ExternalResources.js" data-hub="network-plus" defer></script>
 * The card is placed before the page footer if there is one, else at the end of <main>, else at
 * the end of <body>. Links open in a new tab.
 *
 * Content (operator, 2026-11-16, security pilot of eight hubs; trimmed per Nancy so each lab fits its
 * hub's level): SEED Labs pages taken from the
 * CLARK Cybersecurity Library's own records (api.clark.center learning-object materials) and each
 * checked to return 200 on 2026-11-16, plus a link to browse CLARK. CLARK materials are
 * CC BY-NC-SA 4.0; these are LINKS only, nothing is copied into Hexworth. Tenants: operator decision
 * 2026-11-16, the card shows for white-label tenant students too (free, neutral, labelled external;
 * tenant faculty were not asked). A per-tenant opt-out would need a TenantRouter check. Individual CLARK item
 * pages are not linked: their URL format could not be verified, so only the browse page is.
 */
(function () {
    'use strict';

    if (window.__hxExternalResources) { return; }
    window.__hxExternalResources = true;

    var SEED = 'https://seedsecuritylabs.org/Labs_20.04/';
    var CLARK_BROWSE = 'https://clark.center/browse';

    /* One entry per SEED lab used below: [label, path under SEED]. */
    var LAB = {
        sniffing: ['Packet Sniffing and Spoofing', 'Networking/Sniffing_Spoofing/'],
        arp: ['ARP Cache Poisoning Attack', 'Networking/ARP_Attack/'],
        tcp: ['TCP Attacks', 'Networking/TCP_Attacks/'],
        dnsLocal: ['DNS Cache Poisoning Attack (Local)', 'Networking/DNS/DNS_Local/'],
        dnsRebind: ['DNS Rebinding Attack', 'Networking/DNS/DNS_Rebinding/'],
        icmp: ['ICMP Redirect Attack', 'Networking/ICMP_Redirect/'],
        firewall: ['Firewall', 'Networking/Firewall/'],
        fwEvasion: ['Firewall Evasion', 'Networking/Firewall_Evasion/'],
        vpn: ['Virtual Private Network', 'Networking/VPN_Tunnel/'],
        sqli: ['Web Security: SQL Injection Attack Lab', 'Web/Web_SQL_Injection/'],
        csrf: ['Web Security: Cross-Site Request Forgery Attack Lab', 'Web/Web_CSRF_Elgg/'],
        bofSetuid: ['Buffer-Overflow Attack Lab (Set-UID Version)', 'Software/Buffer_Overflow_Setuid/'],
        formatString: ['Format-String Vulnerability Lab', 'Software/Format_String/'],
        race: ['Race Condition Vulnerability Lab', 'Software/Race_Condition/'],
        shellcode: ['Shellcode Development Lab', 'Software/Shellcode/'],
        envSetuid: ['Environment Variable and Set-UID Lab', 'Software/Environment_Variable_and_SetUID/']
    };

    /* Per hub: which labs, and what the CLARK browse link is for. */
    var HUBS = {
        'network-plus': { labs: ['sniffing', 'arp', 'tcp', 'dnsLocal', 'firewall', 'vpn'], browse: 'network security' },
        'cysa': { labs: ['sniffing', 'fwEvasion', 'tcp', 'dnsRebind', 'icmp'], browse: 'network security and defense' },
        'forensics': { labs: [], browse: 'digital forensics and incident response' },
        'feh': { labs: ['sqli', 'csrf', 'bofSetuid', 'formatString', 'race', 'shellcode'], browse: 'software and web security' },
        'linux-essentials': { labs: ['envSetuid', 'firewall'], browse: 'operating system security' },
        'python-for-it': { labs: ['sniffing'], browse: 'programming and secure coding' },
        'cybersecurity-ethics': { labs: [], browse: 'ethics and privacy' },
        'cybersecurity-policy': { labs: [], browse: 'cyber law, policy and risk management' }
    };

    /* The link table, exposed before any early return (the test reads it). */
    window.ExternalResources = { HUBS: HUBS, LAB: LAB, SEED: SEED, CLARK_BROWSE: CLARK_BROWSE };

    /* The hub id from this script tag's data-hub. */
    function hubId() {
        var s = document.currentScript || document.querySelector('script[src*="ExternalResources.js"][data-hub]');
        return s ? s.getAttribute('data-hub') : null;
    }

    /* A link that opens in a new tab, text only. */
    function link(text, href) {
        var a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = text;
        return a;
    }

    /* Builds the card for one hub. */
    function card(cfg) {
        var box = document.createElement('section');
        box.id = 'hx-external-resources';
        box.setAttribute('aria-labelledby', 'hx-er-title');
        var h = document.createElement('h2');
        h.id = 'hx-er-title';
        h.textContent = cfg.labs.length ? 'Free extra practice' : 'Free extra resources';
        var sub = document.createElement('p');
        sub.className = 'hx-er-sub';
        sub.textContent = 'External, free materials. They open in a new tab and are not graded by Hexworth.';
        box.appendChild(h);
        box.appendChild(sub);
        var ul = document.createElement('ul');
        cfg.labs.forEach(function (k) {
            var l = LAB[k];
            if (!l) { return; }
            var li = document.createElement('li');
            li.appendChild(link('SEED Lab: ' + l[0], SEED + l[1]));
            ul.appendChild(li);
        });
        var li = document.createElement('li');
        li.appendChild(link('Browse the CLARK Cybersecurity Library', CLARK_BROWSE));
        /* the browse page is the library's general search, not a topic page: say what to search for */
        var hint = document.createElement('span');
        hint.className = 'hx-er-hint';
        hint.textContent = ' (search for: ' + cfg.browse + ')';
        li.appendChild(hint);
        ul.appendChild(li);
        box.appendChild(ul);
        var note = document.createElement('p');
        note.className = 'hx-er-note';
        /* Sourced 2026-11-16: SEED pages show "Copyright (c) Wenliang Du" (no license named), so no
           license is claimed for SEED; CLARK's own pages name CC BY-NC-SA 4.0; CLARK's download
           endpoint refuses requests that are not signed in. */
        note.textContent = (cfg.labs.length ? 'SEED Labs are by Wenliang Du and free to use online. ' : '') +
            'The CLARK Cybersecurity Library (Towson University) lists its materials under CC BY-NC-SA 4.0; ' +
            'downloading its files requires signing in to CLARK.';
        box.appendChild(note);
        return box;
    }

    /* The card's styles, once. Neutral: it inherits the hub's font and text colour. */
    function style() {
        var s = document.createElement('style');
        s.textContent =
            '#hx-external-resources{box-sizing:border-box;max-width:1100px;margin:32px auto;padding:20px 24px;' +
            'border:1px solid rgba(128,128,128,.35);border-radius:10px;background:rgba(128,128,128,.06);font:inherit;color:inherit;text-align:left}' +
            '#hx-external-resources h2{margin:0 0 4px;font-size:1.15rem}' +
            '#hx-external-resources .hx-er-sub,#hx-external-resources .hx-er-note{margin:0 0 12px;font-size:.85rem;opacity:.8}' +
            '#hx-external-resources .hx-er-note{margin:12px 0 0}' +
            '#hx-external-resources ul{margin:0;padding-left:20px}' +
            '#hx-external-resources li{margin:6px 0}' +
            '#hx-external-resources a{color:inherit;text-decoration:underline;overflow-wrap:anywhere}' +
            '#hx-external-resources .hx-er-hint{font-size:.85rem;opacity:.8}' +
            '@media (max-width:600px){#hx-external-resources{margin:24px 16px;padding:16px}}';
        document.head.appendChild(s);
    }

    /* Before the footer, else at the end of <main>, else at the end of <body>. */
    function place(el) {
        /* a <footer>, or the footer-classed block some hubs use instead (Network+ has div.page-footer);
           never one inside a dialog or template */
        var footer = [].slice.call(document.querySelectorAll('footer, .page-footer, .site-footer, .course-footer'))
            .filter(function (f) { return !f.closest('dialog, template, [role=dialog], [aria-modal=true]'); })[0];
        if (footer && footer.parentNode) { footer.parentNode.insertBefore(el, footer); return; }
        var main = document.querySelector('main');
        if (main) { main.appendChild(el); return; }
        document.body.appendChild(el);
    }

    var id = hubId();
    var cfg = id && HUBS[id];
    if (!cfg) { return; }
    var run = function () {
        if (document.getElementById('hx-external-resources')) { return; }
        style();
        place(card(cfg));
    };
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', run); } else { run(); }

})();
