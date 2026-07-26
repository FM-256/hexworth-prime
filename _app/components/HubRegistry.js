/**
 * HubRegistry, Single source of truth for platform hubs and tenant-assignable
 * courses.
 *
 * Status: consumed live by _app/catalog.html (the hub catalog page) and the admin Hub Health
 * panel; hubHref values here are the canonical link targets students land on, so keep them
 * pointing at real course-hub pages (not house roots or redirect stubs). See
 * _docs/architecture/hub-registry-design.md for the broader migration plan (houses reading from
 * this registry is Option B, staged).
 *
 * Nancy v1 review (2026-05-09) addressed:
 *  - `dashboardHref` removed: every entry except cyberops had `/lobby.html`,
 *    making it consumer-level routing not hub-level data. Consumers now pass
 *    a routing function to adapters.
 *  - `status` field removed: all 19 entries were `'live'`. YAGNI applies -
 *    the field returns when beta/deprecated semantics are defined.
 *  - Phase 1 ships THIS FILE ONLY. Script-tag injection into 13 consumer
 *    pages requires CSP header audit first (Nancy concern 1).
 *
 * Schema:
 *  - id: stable string written to tenant.licensing.contentAccess.{courses|hubs}
 *  - category: 'course' | 'platform-hub' | 'tool'
 *  - label, sublabel: display text. sublabel is descriptor / catalog code.
 *  - catalogCode: official exam/course code (optional, courses only)
 *  - icon: webp icon path
 *  - hubHref: canonical hub URL (used by lobby + nav, also as a default
 *    route fallback for consumers that pass `h => h.hubHref` as routingFn)
 *  - tenantAssignable: boolean. Filters assignable() / courses() / platformHubs().
 *  - sortOrder: integer for explicit ordering. No implicit alphabetical.
 *
 * Adapter pattern: each consumer's COURSE_MAP shape (academy uses
 * {name,desc,icon,href}, clean-ops uses {title,desc,...}, etc.) gets a
 * dedicated adapter function. Adapters take (hub, routingFn) and return
 * the consumer-shape entry. routingFn is called per hub to determine the
 * href value, consumers pass `() => '/lobby.html'` to route through the
 * lobby (default for tenant dashboards) or `h => h.hubHref` to navigate
 * directly (default for the lobby itself).
 */

(function (root) {
    'use strict';

    var HUBS = [
        // ─── Platform Hubs (5) ─────────────────────────────────────
        {
            id: 'wireshark',
            category: 'platform-hub',
            label: 'Wireshark Hub',
            sublabel: '32 modules',
            icon: '/assets/images/icons/icon-antenna.webp',
            hubHref: '/wireshark/index.html',
            tenantAssignable: true,
            sortOrder: 1
        },
        {
            id: 'forensics',
            category: 'platform-hub',
            label: 'Forensics Hub',
            sublabel: '30 modules',
            icon: '/assets/images/icons/icon-magnifier.webp',
            hubHref: '/houses/eye/forensics/index.html',
            tenantAssignable: true,
            sortOrder: 2
        },
        {
            id: 'bug-hunting',
            category: 'platform-hub',
            label: 'Bug Hunting Dojo',
            sublabel: 'Security research',
            icon: '/assets/images/icons/icon-spider.webp',
            hubHref: '/dark-arts/vault/bug-hunting/index.html',
            tenantAssignable: true,
            sortOrder: 3
        },
        {
            id: 'signal',
            category: 'platform-hub',
            label: 'Signal Toolkit',
            sublabel: 'Hardware projects',
            icon: '/assets/images/icons/icon-signal.webp',
            hubHref: '/signal/index.html',
            tenantAssignable: true,
            sortOrder: 4
        },
        {
            id: 'arctic-cli',
            category: 'platform-hub',
            label: 'Arctic CLI Training',
            sublabel: 'Linux fundamentals',
            icon: '/assets/images/icons/icon-penguin.webp',
            hubHref: '/arctic/index.html',
            tenantAssignable: true,
            sortOrder: 5
        },

        // ─── Courses (14, original 12 + ethics-it + infosec from Task #96) ─
        {
            id: 'network-plus',
            category: 'course',
            catalogCode: 'N10-009',
            label: 'CompTIA Network+',
            sublabel: 'N10-009',
            icon: '/assets/images/icons/icon-globe.webp',
            hubHref: '/houses/web/network-plus/index.html',
            tenantAssignable: true,
            sortOrder: 10
        },
        {
            id: 'cyberops',
            category: 'course',
            catalogCode: '200-201',
            label: 'CyberOps',
            sublabel: '200-201',
            icon: '/assets/images/icons/icon-shield.webp',
            hubHref: '/houses/eye/modules/cyberops/index.html',
            tenantAssignable: true,
            sortOrder: 20
        },
        {
            id: 'aplus-core1',
            category: 'course',
            catalogCode: '220-1101',
            label: 'CompTIA A+ Core 1',
            sublabel: '220-1101',
            icon: '/assets/images/icons/icon-wrench.webp',
            hubHref: '/houses/forge/applets/comptia-aplus/core-1/index.html',
            tenantAssignable: true,
            sortOrder: 30
        },
        {
            id: 'aplus-core2',
            category: 'course',
            catalogCode: '220-1102',
            label: 'CompTIA A+ Core 2',
            sublabel: '220-1102',
            icon: '/assets/images/icons/icon-wrench.webp',
            hubHref: '/houses/forge/applets/comptia-aplus/core-2/index.html',
            tenantAssignable: true,
            sortOrder: 40
        },
        {
            id: 'md-100',
            category: 'course',
            catalogCode: 'MD-100',
            label: 'MD-100',
            sublabel: 'Windows Client',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/forge/md-100/index.html',
            tenantAssignable: true,
            sortOrder: 50
        },
        {
            id: 'md-101',
            category: 'course',
            catalogCode: 'MD-101',
            label: 'MD-101',
            sublabel: 'Windows Devices',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/forge/md-101/index.html',
            tenantAssignable: true,
            sortOrder: 60
        },
        {
            id: 'feh',
            category: 'course',
            label: 'FEH',
            sublabel: 'Forensics & Ethical Hacking',
            icon: '/assets/images/icons/icon-magnifier.webp',
            hubHref: '/houses/dark-arts/feh/index.html',
            tenantAssignable: true,
            sortOrder: 70
        },
        {
            id: 'python-hub',
            category: 'course',
            label: 'Python Programming',
            sublabel: 'Python Hub',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/code/modules/python-hub/index.html',
            tenantAssignable: true,
            sortOrder: 80
        },
        {
            id: 'python-for-it',
            category: 'course',
            catalogCode: 'COP1034C',
            label: 'Python for IT',
            sublabel: 'COP1034C',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/code/python-for-it/index.html',
            tenantAssignable: true,
            sortOrder: 90
        },
        {
            id: 'security-plus',
            category: 'course',
            catalogCode: 'SY0-701',
            label: 'CompTIA Security+',
            sublabel: 'SY0-701',
            icon: '/assets/images/icons/icon-shield.webp',
            hubHref: '/houses/shield/security-plus/index.html',
            tenantAssignable: true,
            sortOrder: 100
        },
        {
            id: 'isc2-cc',
            category: 'course',
            catalogCode: 'CC',
            label: 'ISC2 Certified in Cybersecurity',
            sublabel: 'CC',
            icon: '/assets/images/icons/icon-key.webp',
            hubHref: '/houses/shield/isc2-cc/index.html',
            tenantAssignable: true,
            sortOrder: 110
        },
        {
            id: 'server-plus',
            category: 'course',
            catalogCode: 'SK0-005',
            label: 'CompTIA Server+',
            sublabel: 'SK0-005',
            icon: '/assets/images/icons/icon-keyboard.webp',
            hubHref: '/houses/cloud/server-plus/index.html',
            tenantAssignable: true,
            sortOrder: 120
        },
        {
            id: 'wsa',
            category: 'course',
            catalogCode: 'CTS1328C',
            label: 'Windows Server Administration',
            sublabel: 'CTS1328C',
            icon: '/assets/images/icons/icon-server.webp',
            hubHref: '/houses/cloud/modules/wsa/index.html',
            tenantAssignable: true,
            sortOrder: 125
        },
        {
            id: 'adv-linux',
            category: 'course',
            catalogCode: 'CTS4321C',
            label: 'Advanced Linux Administration',
            sublabel: 'CTS4321C',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/matrix/adv-linux/index.html',
            tenantAssignable: true,
            sortOrder: 127
        },
        {
            id: 'ethics-it',
            category: 'course',
            catalogCode: 'CIS4253',
            label: 'Ethics in IT',
            sublabel: 'CIS4253',
            icon: '/assets/images/icons/icon-scales.webp',
            hubHref: '/houses/divergent/ethics-it/index.html',
            tenantAssignable: true,
            sortOrder: 130
        },
        {
            id: 'domino-effect',
            category: 'course',
            catalogCode: 'CIS2208',
            label: 'The Domino Effect',
            sublabel: 'CIS2208',
            icon: '/assets/images/icons/icon-chain.webp',
            // Course content lives under the legacy folder slug 'cybersecurity-policy'
            // even though the course was rebranded "The Domino Effect" (CIS2208).
            hubHref: '/houses/divergent/cybersecurity-policy/index.html',
            tenantAssignable: true,
            sortOrder: 135
        },
        {
            id: 'infosec',
            category: 'course',
            catalogCode: 'CIS2350C',
            label: 'Principles of Information Security',
            sublabel: 'CIS2350C',
            icon: '/assets/images/icons/icon-padlock.webp',
            hubHref: '/houses/shield/infosec/index.html',
            tenantAssignable: true,
            sortOrder: 140
        }
    ];

    function _filter(predicate) {
        return HUBS.filter(predicate);
    }

    function _byId(id) {
        for (var i = 0; i < HUBS.length; i++) {
            if (HUBS[i].id === id) return HUBS[i];
        }
        return null;
    }

    var HubRegistry = {
        all: function () { return HUBS.slice(); },
        byId: _byId,
        assignable: function () { return _filter(function (h) { return h.tenantAssignable === true; }); },
        courses: function () { return _filter(function (h) { return h.category === 'course' && h.tenantAssignable; }); },
        platformHubs: function () { return _filter(function (h) { return h.category === 'platform-hub' && h.tenantAssignable; }); },
        sorted: function (filterFn) {
            var arr = filterFn ? _filter(filterFn) : HUBS.slice();
            return arr.sort(function (a, b) {
                return (a.sortOrder || 999) - (b.sortOrder || 999);
            });
        },
        // ── Dynamic (Firestore-backed) hubs, task #225 ──────────────
        // Merges admin-created hubs from the `hubRegistry` Firestore collection with the static
        // 19+ above. Firestore is HubRegistry's PERSISTENCE LAYER for browser-created hubs, not a
        // competing registry, same schema, doc-id == hub id. Async because it reads Firestore.
        //
        // opts = {
        //   db,                       // Firestore db handle
        //   firestore,                // { collection, query, where, getDocs } (modular SDK)
        //   isAdmin,                  // bool, admins list unconstrained; non-admins are forced
        //                             //        to where('status','==','published') so the rules
        //                             //        `list` gate is satisfiable (see firestore.rules
        //                             //        hubRegistry block). A non-admin unconstrained list
        //                             //        would be DENIED WHOLESALE by Firestore.
        //   onError                   // optional (err) => void
        // }
        //
        // Guarantees (both adversarial-review, Nancy R2):
        //  #4 status-normalization, every STATIC entry lacks a `status` field; it is defaulted to
        //     'published' here so a consumer doing `if (h.status !== 'published') hide()` over the
        //     merged array never hides the 19+ real courses.
        //  #5 STATIC WINS, a static id ALWAYS overrides a same-id dynamic doc, so a stray/typo'd
        //     Firestore doc can never shadow a live hardcoded course at read time (defense-in-depth
        //     with the rules-level reserved-id rejection on create).
        //
        // NEVER THROWS: a registry read must not break a consumer page. On any Firestore error
        // (offline, rules deny, missing context) it falls back to the static-only list.
        allWithDynamic: function (opts) {
            opts = opts || {};
            var normalizedStatic = HUBS.map(function (h) {
                return h.status ? h : Object.assign({}, h, { status: 'published' });
            });
            if (!opts.db || !opts.firestore || typeof opts.firestore.getDocs !== 'function') {
                // No Firestore context, static-only baseline (also the SSR/offline path).
                return Promise.resolve(normalizedStatic.slice());
            }
            var fs = opts.firestore;
            var col;
            try {
                col = fs.collection(opts.db, 'hubRegistry');
            } catch (e) {
                if (opts.onError) { opts.onError(e); }
                return Promise.resolve(normalizedStatic.slice());
            }
            var q = opts.isAdmin ? col : fs.query(col, fs.where('status', '==', 'published'));
            return Promise.resolve(fs.getDocs(q)).then(function (snap) {
                var dynamic = [];
                snap.forEach(function (d) {
                    var data = d.data() || {};
                    data.id = d.id; // doc id is authoritative for the hub id
                    dynamic.push(data);
                });
                var staticIds = {};
                normalizedStatic.forEach(function (h) { staticIds[h.id] = true; });
                // STATIC WINS: drop any dynamic doc colliding with a static id, then append static.
                return dynamic.filter(function (d) { return !staticIds[d.id]; }).concat(normalizedStatic);
            }, function (err) {
                if (opts.onError) { opts.onError(err); }
                return normalizedStatic.slice();
            });
        },
        // Adapter functions for the 5 dashboard COURSE_MAP shapes (Phase 3
        // refactor uses these so existing dashboard read-side code is
        // unchanged). Each adapter takes (hub, routingFn) and returns the
        // entry in the consumer's expected shape. routingFn(h) returns the
        // href, consumers pass `() => '/lobby.html'` for tenant-dashboard
        // routing, or `h => h.hubHref` for direct hub navigation (lobby).
        adapters: {
            // Used by lobby.html (3-field shape, label includes catalog code)
            nameOnly: function (h, routingFn) {
                return {
                    name: h.catalogCode ? h.label + ' ' + h.catalogCode : h.label,
                    icon: h.icon,
                    href: routingFn(h)
                };
            },
            // Used by 5 dashboards: academy, minimalist, nightshift, campus, federal
            nameDesc: function (h, routingFn) {
                return { name: h.label, desc: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by 3 dashboards: clean-ops, tactical-hud, tenant/index
            titleDesc: function (h, routingFn) {
                return { title: h.label, desc: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by command-center
            titleSub: function (h, routingFn) {
                return { title: h.label, sub: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by enterprise COURSE_MAP
            nameSub: function (h, routingFn) {
                return { name: h.label, sub: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by enterprise NAV_COURSE_MAP
            labelOnly: function (h, routingFn) {
                return { label: h.label, icon: h.icon, href: routingFn(h) };
            }
        }
    };

    if (typeof root !== 'undefined') {
        root.HubRegistry = HubRegistry;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HubRegistry;
    }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
