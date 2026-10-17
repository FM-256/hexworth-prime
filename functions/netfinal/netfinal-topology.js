/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-topology.js — the Meridian Corp final-exam topology, as a seedable template.
 *
 * Design spec: ~/hexworth-shared/etwork essential final/
 *              "Network+ Final Exam — Meridian Corp Operations Lab Design Spec.md" (Oct 16 2026)
 *              sections 3 and 4.
 *
 * WHAT THIS IS AND IS NOT. This is stage 1 of a 7-stage build: the fixed shape of the network and
 * the roster of things that live on it. It holds NO faults (stage 3), NO questions (stage 6) and NO
 * answer key. It is a pure data module with one function — nothing here reads the DOM, the network,
 * or the clock — so the server can generate from it and a test can assert against it.
 *
 * DELIBERATELY A SEPARATE MODULE, NOT A GUILabEngine EXTENSION. The spec proposes extending
 * GUILabEngine, whose `connectivity` model is three booleans (`GUILabEngine.js:1100`:
 * `{ gateway: false, internet: false, dns: false }`). Replacing that with a real path evaluator
 * would edit a shared core that **22 pages load**, and there are **TWO copies already diverged by
 * 237 lines**: `_app/houses/web/network-plus/engine/` (134,645 bytes, loaded by 12 of those pages)
 * and `_app/houses/web/labs/engine/` (126,078 bytes, loaded by the other 10). Measured with
 * `grep -rlE '<script[^>]+src="[^"]*GUILabEngine\.js' _app --include=*.html` — counting files that
 * merely contain the string gives 23 and is wrong, since one only mentions it in prose.
 *
 * The split is the argument: an edit to either copy reaches a DIFFERENT subset of pages, and the
 * spec's regression plan names only the midterm's 12 tasks, so one copy's pages would go unguarded
 * entirely. The exam core is therefore standalone and testable on its own, and wiring it to a UI is
 * a later, separate decision. Nothing here or in netfinal-core.js imports or modifies GUILabEngine.
 *
 * WHAT VARIES PER STUDENT AND WHAT DOES NOT. Per spec section 4: VLAN ids, device names, the
 * management VLAN, and question wording are FIXED so every student reads the same exam. Everything a
 * student could copy from a classmate — subnets, host octets, MACs, port positions — is seeded.
 * That split is the whole integrity model, so it is expressed here as data rather than left to the
 * generator to remember.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── VLANs ────────────────────────────────────────────────────────────────────────────────────
     * VLAN 99 is FIXED at 10.0.0.0/24 and is the management network. Spec section 3: "VLAN 99 and
     * the path from ADMIN-WS01 to every management address are protected: no seeded fault touches
     * them." That is what keeps every device reachable for the whole exam unless the student breaks
     * it themselves, so the management subnet must not move with the seed — a student who loses
     * management access loses the exam, not a question. */
    var VLANS = [
        { id: 10, name: 'Sales',             seeded: true,  dhcp: true  },
        { id: 20, name: 'Engineering',       seeded: true,  dhcp: true  },
        { id: 30, name: 'Servers',           seeded: true,  dhcp: false },
        /* THE GUEST POOL STOPS AT .127 ON PURPOSE. Fault S5A sets this sub-interface to a /25,
         * whose boundary is .128, and its ticket is "Guests with addresses above .127 can't browse.
         * Others are fine." With a .100-.199 pool and three guest clients nobody ever leases above
         * .127, so the fault would have had NO symptom and no contrast. Leasing below the boundary
         * and placing the static guest devices above it is what makes both halves of that ticket
         * real. */
        { id: 40, name: 'Guest',             seeded: true,  dhcp: true, pool: [100, 127] },
        { id: 99, name: 'Network management', seeded: false, dhcp: false, fixedSubnet: '10.0.0.0/24' }
    ];

    /* Non-VLAN networks. The branch is 10.200.0.0/24, which is why the seeded second octet `b`
     * excludes 200 — otherwise a student's user VLAN could collide with the far side of the IPsec
     * tunnel and S6's symptoms would become unreadable. */
    var FIXED_NETS = {
        transit: { cidr: '172.16.0.0/30',  rtr: '172.16.0.1', fw: '172.16.0.2' },
        dmz:     { cidr: '172.16.50.0/24', fw: '172.16.50.1' },
        branch:  { cidr: '10.200.0.0/24',  nas: '10.200.0.25' }
    };

    /* ── Devices the student can log in to ────────────────────────────────────────────────────────
     * Spec section 3: "Every accessible device has exactly one access method, so the question of
     * where the evidence lives has one right answer." `access` is therefore part of the data, not a
     * UI detail — a question that asks where evidence lives is graded against it.
     *
     * `mgmt` is a template: `{vlan30}.10` resolves against the seeded Servers subnet, while literal
     * 10.0.0.x addresses are fixed management addresses. */
    var DEVICES = [
        { id: 'ADMIN-WS01',     role: 'Student workstation',        platform: 'windows11',   access: 'local',  vlan: 10, mgmt: 'dhcp' },
        { id: 'MeridianRTR-01', role: 'Inter-VLAN routing, ACLs',   platform: 'ios-xe',      access: 'ssh',    mgmt: '10.0.0.1' },
        { id: 'MeridianSW-01',  role: 'Core / floor-1 switch',      platform: 'ios',         access: 'ssh',    mgmt: '10.0.0.2' },
        { id: 'MeridianSW-02',  role: 'Floor-2 access switch',      platform: 'ios',         access: 'ssh',    mgmt: '10.0.0.3' },
        { id: 'MER-FW01',       role: 'Edge firewall: NAT, IPsec',  platform: 'pfsense-gui', access: 'web',    mgmt: '172.16.0.2' },
        { id: 'MER-WLC01',      role: 'Wireless controller',        platform: 'unifi-gui',   access: 'web',    mgmt: '10.0.0.5' },
        { id: 'MER-SRV01',      role: 'DNS (BIND) and DHCP (Kea)',  platform: 'ubuntu24',    access: 'ssh',    mgmt: '{vlan30}.10' },
        { id: 'MER-NOC01',      role: 'SNMP and syslog monitoring', platform: 'librenms-gui', access: 'web',   mgmt: '{vlan30}.30' },
        { id: 'MER-WEB01',      role: 'Public website in DMZ',      platform: 'ubuntu24',    access: 'ssh',    mgmt: '172.16.50.10' }
    ];

    /* ── Physical links ───────────────────────────────────────────────────────────────────────────
     * `allowed` on a trunk is the ALLOWED VLAN LIST, and it is the single most load-bearing field in
     * this file: fault slot S3 removes a VLAN from it, and `reach()` layer 2 walks it. Spec section
     * 3 notes SW-01 Gi0/1 to SW-02 carries "10, 20, 99 (and 40 for the floor-2 APs)" — written out
     * in full here rather than as prose, because a trunk list that is ambiguous in the spec becomes
     * a grading dispute in the exam. */
    var LINKS = [
        { a: ['MeridianRTR-01', 'Gi0/0'], b: ['MeridianSW-01', 'Fa0/24'], kind: 'trunk',  allowed: [10, 20, 30, 40, 99] },
        { a: ['MeridianRTR-01', 'Gi0/1'], b: ['MER-FW01', 'LAN'],         kind: 'routed', net: 'transit' },
        { a: ['MER-FW01', 'WAN'],         b: ['ISP', 'edge'],             kind: 'routed', net: 'wan' },
        { a: ['MER-FW01', 'DMZ'],         b: ['MER-WEB01', 'eth0'],       kind: 'routed', net: 'dmz' },
        { a: ['MeridianSW-01', 'Gi0/1'],  b: ['MeridianSW-02', 'Gi0/1'],  kind: 'trunk',  allowed: [10, 20, 40, 99] }
    ];

    /* ── Where each device sits at layer 2 ─────────────────────────────────────────
     * The three Linux/appliance servers are DEVICES (section 3's access table) but they are also
     * hosts on a switch port, and reach() cannot evaluate a path to something with no layer-2
     * position. Declared here rather than inferred, because "which port is MER-SRV01 on" is a
     * legitimate exam question and the answer has to be seeded, not accidental.
     *
     * `portPool` means a seeded port inside that VLAN's range; `port` means a fixed one.
     * `self` means the device IS the switch, reached through its own Vlan99 interface.
     * `routed` means it hangs off a routed firewall interface, not a switch at all. */
    var DEVICE_ATTACH = {
        'ADMIN-WS01':     { endpoint: true },
        'MeridianRTR-01': { switch: 'MeridianSW-01', port: 24, trunk: true },
        'MeridianSW-01':  { self: true, vlan: 99 },
        'MeridianSW-02':  { self: true, vlan: 99 },
        'MER-FW01':       { routed: true, net: 'transit' },
        'MER-WLC01':      { switch: 'MeridianSW-01', port: 22, vlan: 99 },
        'MER-SRV01':      { switch: 'MeridianSW-01', portPool: 30, vlan: 30, oui: 'supermicro' },
        'MER-NOC01':      { switch: 'MeridianSW-01', portPool: 30, vlan: 30, oui: 'supermicro' },
        'MER-WEB01':      { routed: true, net: 'dmz', oui: 'supermicro' }
    };

    /* ── Port ranges ──────────────────────────────────────────────────────────────────────────────
     * Endpoints are placed on a RANDOM port within their VLAN's range (spec section 4), so "which
     * port" answers differ per student. The ranges are fixed so the question "which port range
     * serves Sales" stays the same for everyone. SW-02 Fa0/15-24 are shut: a student who finds a
     * host there has found something wrong, which keeps empty ports meaningful rather than noise. */
    var PORT_PLAN = {
        'MeridianSW-01': [
            { range: [1, 8],   vlan: 10, label: 'Sales' },
            { range: [9, 16],  vlan: 20, label: 'Engineering' },
            { range: [17, 20], vlan: 30, label: 'Servers' },
            { range: [21, 21], vlan: 'trunk', label: 'AP-1' },
            { range: [22, 22], vlan: 99, label: 'WLC' },
            { range: [23, 23], vlan: null, label: 'spare' },
            { range: [24, 24], vlan: 'trunk', label: 'uplink to RTR' }
        ],
        'MeridianSW-02': [
            { range: [1, 8],   vlan: 20, label: 'Engineering' },
            { range: [9, 12],  vlan: 10, label: 'Sales' },
            { range: [13, 14], vlan: 'trunk', label: 'AP-2, AP-3' },
            { range: [15, 24], vlan: null, label: 'shut down', shutdown: true }
        ]
    };

    /* ── Endpoint roster ─────────────────────────────────────────────────────────────────────────
     * About 25 things that appear in tables but cannot be logged in to. `oui` is a REAL vendor
     * prefix per device type: spec section 4 wants MAC answers to differ per student while the
     * vendor stays recognisable, because "which vendor is this device" is a legitimate exam question
     * and a random 48-bit MAC would make it unanswerable.
     *
     * `host` fixed means a static address; `dhcp` means the lease comes from Kea and is therefore
     * subject to S9's pool faults. `reservation` is the printer: a DHCP client with a fixed address,
     * which is what makes S2A's symptom ("its screen shows a 10.{b}.20.x address") diagnosable. */
    var OUI = {
        dell:     '00:14:22',   // Dell  — PCs
        hp:       '00:1B:78',   // HP    — printer
        ubiquiti: '24:A4:3C',   // Ubiquiti — access points
        cisco:    '00:1A:A1',   // Cisco — switch and router interfaces
        supermicro: '00:25:90'  // Supermicro — servers
    };

    var ENDPOINTS = [
        { name: 'MER-FS01',      kind: 'server',  vlan: 30, host: 20,  oui: 'supermicro', switch: 'MeridianSW-01', portPool: 30 },
        { name: 'PRN-SALES01',   kind: 'printer', vlan: 10, dhcp: true, reservation: true, oui: 'hp', switch: 'MeridianSW-01', portPool: 10, tcpPorts: [9100] },
        { name: 'SALES-PC01',    kind: 'pc', vlan: 10, dhcp: true, oui: 'dell', switch: 'MeridianSW-01', portPool: 10 },
        { name: 'SALES-PC02',    kind: 'pc', vlan: 10, dhcp: true, oui: 'dell', switch: 'MeridianSW-01', portPool: 10 },
        { name: 'SALES-PC03',    kind: 'pc', vlan: 10, dhcp: true, oui: 'dell', switch: 'MeridianSW-01', portPool: 10 },
        { name: 'SALES-PC04',    kind: 'pc', vlan: 10, dhcp: true, oui: 'dell', switch: 'MeridianSW-02', portPool: 10 },
        { name: 'SALES-PC05',    kind: 'pc', vlan: 10, dhcp: true, oui: 'dell', switch: 'MeridianSW-02', portPool: 10 },
        { name: 'SALES-PC06',    kind: 'pc', vlan: 10, dhcp: true, oui: 'dell', switch: 'MeridianSW-02', portPool: 10 },
        { name: 'ENG-PC01',      kind: 'pc', vlan: 20, dhcp: true, oui: 'dell', switch: 'MeridianSW-01', portPool: 20 },
        { name: 'ENG-PC02',      kind: 'pc', vlan: 20, dhcp: true, oui: 'dell', switch: 'MeridianSW-01', portPool: 20 },
        { name: 'ENG-PC03',      kind: 'pc', vlan: 20, dhcp: true, oui: 'dell', switch: 'MeridianSW-01', portPool: 20 },
        { name: 'ENG-PC04',      kind: 'pc', vlan: 20, dhcp: true, oui: 'dell', switch: 'MeridianSW-02', portPool: 20 },
        { name: 'ENG-PC05',      kind: 'pc', vlan: 20, dhcp: true, oui: 'dell', switch: 'MeridianSW-02', portPool: 20 },
        { name: 'ENG-PC06',      kind: 'pc', vlan: 20, dhcp: true, oui: 'dell', switch: 'MeridianSW-02', portPool: 20 },
        { name: 'AP-1',          kind: 'ap', vlan: 99, host: 41, oui: 'ubiquiti', switch: 'MeridianSW-01', port: 21, band24: true },
        { name: 'AP-2',          kind: 'ap', vlan: 99, host: 42, oui: 'ubiquiti', switch: 'MeridianSW-02', port: 13, band24: true },
        { name: 'AP-3',          kind: 'ap', vlan: 99, host: 43, oui: 'ubiquiti', switch: 'MeridianSW-02', port: 14, band24: true },
        /* Wireless clients have no switch port — they associate to an AP. `reach()` resolves their
         * layer-2 position through the AP's trunk, which is what makes S11A (guest SSID mapped to
         * the wrong VLAN) visible as guests holding Sales addresses. */
        { name: 'WIFI-SALES01',  kind: 'wifi', vlan: 10, dhcp: true, oui: 'dell', ap: 'AP-1', ssid: 'Meridian-Corp' },
        { name: 'WIFI-SALES02',  kind: 'wifi', vlan: 10, dhcp: true, oui: 'dell', ap: 'AP-2', ssid: 'Meridian-Corp' },
        { name: 'WIFI-ENG01',    kind: 'wifi', vlan: 20, dhcp: true, oui: 'dell', ap: 'AP-3', ssid: 'Meridian-Corp' },
        { name: 'WIFI-GUEST01',  kind: 'wifi', vlan: 40, dhcp: true, oui: 'dell', ap: 'AP-1', ssid: 'Meridian-Guest' },
        { name: 'WIFI-GUEST02',  kind: 'wifi', vlan: 40, dhcp: true, oui: 'dell', ap: 'AP-2', ssid: 'Meridian-Guest' },
        { name: 'WIFI-GUEST03',  kind: 'wifi', vlan: 40, dhcp: true, oui: 'dell', ap: 'AP-3', ssid: 'Meridian-Guest' },
        /* Static guest devices ABOVE the /25 boundary and OUTSIDE the pool, so S5A strands them
         * while the leased guests keep working -- and so the pool still excludes every reserved and
         * static address, which the dhcp-pools-sane invariant requires. */
        { name: 'KIOSK-GUEST01', kind: 'kiosk', vlan: 40, hostRange: [130, 164], oui: 'dell', ap: 'AP-1', ssid: 'Meridian-Guest' },
        { name: 'KIOSK-GUEST02', kind: 'kiosk', vlan: 40, hostRange: [165, 199], oui: 'dell', ap: 'AP-2', ssid: 'Meridian-Guest' },
        { name: 'BR-NAS01',      kind: 'server', network: 'branch', host: 25, oui: 'supermicro', tcpPorts: [445] }
    ];

    /* ── SSIDs ───────────────────────────────────────────────────────────────────────────────────
     * Mapped to VLANs here because S11A breaks exactly this mapping. Guest DHCP hands out a public
     * resolver (spec section 6) so that a CORRECT guest ACL — which blocks guest-to-internal —
     * never breaks guest name resolution. Without that, fixing S8A would look like breaking DNS. */
    var SSIDS = [
        { name: 'Meridian-Corp',  vlan: 10, aps: ['AP-1', 'AP-2', 'AP-3'] },
        { name: 'Meridian-Guest', vlan: 40, aps: ['AP-1', 'AP-2', 'AP-3'], dnsOverride: '1.1.1.1' }
    ];

    /* ── DNS zone, as authored before any fault ──────────────────────────────────────────────────
     * S10A makes `intranet` point at .21 (one past the file server); S10B edits a record without
     * incrementing the serial so BIND never reloads it. Both need a correct baseline to deviate
     * from, so the TRUE records live here and faults mutate copies. */
    var DNS_ZONE = {
        origin: 'meridian.local',
        serial: 2026101601,
        records: [
            { name: 'fs01',     type: 'A', target: '{vlan30}.20' },
            { name: 'intranet', type: 'A', target: '{vlan30}.20' },
            { name: 'wiki',     type: 'A', target: '{vlan30}.20' },
            { name: 'noc',      type: 'A', target: '{vlan30}.30' },
            { name: 'srv01',    type: 'A', target: '{vlan30}.10' },
            { name: 'www',      type: 'A', target: '172.16.50.10' }
        ]
    };

    /* ── Fault slots ────────────────────────────────────────────────────────────
     * STAGE 1 DECLARES THEM; STAGE 3 IMPLEMENTS THEM. The generator must choose a variant per slot
     * and reject forbidden combinations, so it needs the slot list and the conflict pairs now. It
     * does NOT need apply()/fixed() yet, and inventing those here would be guessing at stage 3.
     *
     * LAYER IS PER VARIANT, NOT PER SLOT. Spec section 6 gives S8A as "3/4 (security)" and S8B as
     * plain layer 4; S11A as layer 2 and S11B as layer 1. Every other slot's two variants share a
     * layer. This matters because the incident log's layer field is GRADED (section 6: the conflict
     * pairs exist precisely so "the layer field in the incident log" is unambiguous), so a per-slot
     * layer would mark a correct answer wrong on four of the twenty-four variants.
     *
     * `group` is the user population a variant strands, and it is how conflicts are reasoned about
     * rather than memorised: two faults that strand the same group make the log's layer ambiguous.
     * It is descriptive here — CONFLICT_PAIRS below is the enforced list, taken verbatim from the
     * spec, because deriving conflicts from these labels would silently invent or drop pairs. */
    var FAULT_SLOTS = [
        { slot: 'S1',  variants: { A: { layer: 1,   group: 'eng-floor2' }, B: { layer: 1,   group: 'eng-floor2' } } },
        { slot: 'S2',  variants: { A: { layer: 2,   group: 'sales-printer' }, B: { layer: 2, group: 'sales-host' } } },
        { slot: 'S3',  variants: { A: { layer: 2,   group: 'eng-floor2' }, B: { layer: 2,   group: 'sales-floor2' } } },
        { slot: 'S4',  variants: { A: { layer: 2.5, group: 'sales' },      B: { layer: 2.5, group: 'servers' } } },
        { slot: 'S5',  variants: { A: { layer: 3,   group: 'guest-high' }, B: { layer: 3,   group: 'eng-floor1' } } },
        { slot: 'S6',  variants: { A: { layer: 3,   group: 'branch-all' }, B: { layer: 3,   group: 'branch-eng' } } },
        { slot: 'S7',  variants: { A: { layer: 3.5, group: 'eng-internet' }, B: { layer: 3.5, group: 'public-web' } } },
        { slot: 'S8',  variants: { A: { layer: 3.5, group: 'guest-acl' }, B: { layer: 4,   group: 'sales-smb' } } },
        { slot: 'S9',  variants: { A: { layer: 7,   group: 'sales-new' },  B: { layer: 7,   group: 'sales-new' } } },
        { slot: 'S10', variants: { A: { layer: 7,   group: 'dns-intranet' }, B: { layer: 7, group: 'dns-wiki' } } },
        { slot: 'S11', variants: { A: { layer: 2,   group: 'wireless-guest' }, B: { layer: 1, group: 'wireless-floor2' } } },
        { slot: 'S12', variants: { A: { layer: 7,   group: 'noc-snmp' },   B: { layer: 7,   group: 'noc-ntp' } } }
    ];

    /* Verbatim from spec section 6. Written as data so the generator enforces them and a test can
     * assert that 1,000 seeds never produce one — rather than the constraint living only in prose,
     * which is how a rule gets quietly violated. */
    var CONFLICT_PAIRS = [
        ['S3A', 'S5B'], ['S3A', 'S7A'], ['S5B', 'S7A'],
        ['S3B', 'S9A'], ['S3B', 'S9B'],
        ['S2B', 'S9A'], ['S2B', 'S9B'],
        ['S5A', 'S11A'], ['S8A', 'S11A']
    ];

    /* The six NOC alerts one of which is drawn per lab (spec section 4: "NOC decoy alert | One drawn
     * from a pool of six | Triage answer differs"). Every one is NOISE — the student's job is to
     * triage it as such and not chase it, so none may describe a condition any fault slot creates.
     * Provisional wording, to be reviewed with the question bank in stage 6. */
    var NOC_DECOYS = [
        { id: 'noc-d1', text: 'MeridianSW-01 Fa0/23 link down', why: 'Fa0/23 is the documented spare port; nothing is connected to it.' },
        { id: 'noc-d2', text: 'MER-WEB01 disk usage 81%', why: 'A capacity note, not a network fault, and below the 90% action threshold.' },
        { id: 'noc-d3', text: 'MER-FW01 WAN latency 48 ms (threshold 45 ms)', why: 'Marginally over a tight threshold; no user-reported impact.' },
        { id: 'noc-d4', text: 'MeridianSW-02 Fa0/19 link down', why: 'Fa0/15-24 on SW-02 are administratively shut by design.' },
        { id: 'noc-d5', text: 'MER-NOC01 poller restarted', why: 'The monitoring system reporting on itself; polling resumed.' },
        { id: 'noc-d6', text: 'MeridianRTR-01 CPU 62% for 5 min', why: 'Within normal range for this platform; no interface drops accompany it.' }
    ];

    /* Every assignment of one variant per slot that violates none of the spec's conflict pairs.
     * 2^12 = 4,096 candidates filtered once and memoised, which is legitimate here precisely
     * because the inputs are frozen module constants: FAULT_SLOTS and CONFLICT_PAIRS are literals
     * in netfinal-topology.js and nothing at runtime writes them. A cache over mutable lab state
     * would be the hazard this repo has been bitten by; this is a cache over a constant.
     *
     * MEASURED, AND IT IS A FINDING RATHER THAN A DETAIL: 128 of the 4,096 pass, and five slots end
     * up with exactly ONE legal variant -- S2A, S3A, S5A, S7B, S11B. Spec section 4 advertises
     * "4,096 possible fault combinations"; its own conflict list permits 128, and every student
     * receives the same variant for those five slots. The cause is that two slots conflict with
     * BOTH variants of a third (S3B and S2B each conflict with S9A and S9B), which forces S3=A and
     * S2=A, which then forces S5=A, S7=B and S11=B by cascade. That is a content decision for the
     * exam author, not something this module should quietly adjust, so it is reported instead:
     * generate() puts the real numbers in state.meta.variantSpace. */
    var _cleanCombos = null;
    function conflictFreeCombinations() {
        if (_cleanCombos) return _cleanCombos;
        var slots = TOPO.FAULT_SLOTS.map(function (s) { return s.slot; });
        var out = [];
        for (var mask = 0; mask < Math.pow(2, slots.length); mask++) {
            var combo = slots.map(function (sl, i) {
                return sl + ((Math.floor(mask / Math.pow(2, i)) % 2) ? 'B' : 'A');
            });
            var set = {};
            combo.forEach(function (id) { set[id] = true; });
            var bad = TOPO.CONFLICT_PAIRS.some(function (pr) { return set[pr[0]] && set[pr[1]]; });
            if (!bad) out.push(combo);
        }
        _cleanCombos = out;
        return out;
    }

    /* Which slots the conflict list leaves a genuine choice on, and which it pins to one variant.
     * Exposed so a test asserts the number instead of a comment claiming it -- a count written in
     * prose is stale the moment the conflict list changes. */
    function variantSpace() {
        var clean = conflictFreeCombinations();
        var opts = {};
        TOPO.FAULT_SLOTS.forEach(function (sl) { opts[sl.slot] = {}; });
        clean.forEach(function (c) { c.forEach(function (id) { opts[id.slice(0, -1)][id.slice(-1)] = true; }); });
        var pinned = [], varying = [];
        Object.keys(opts).forEach(function (sl) {
            var ks = Object.keys(opts[sl]).sort();
            if (ks.length === 1) pinned.push(sl + ks[0]); else varying.push(sl);
        });
        return { total: Math.pow(2, TOPO.FAULT_SLOTS.length), legal: clean.length,
                 pinnedVariants: pinned.sort(), varyingSlots: varying.sort() };
    }

    /* The outdated diagram handed to students. Spec section 2: it shows DNS where the MIDTERM put
     * it and omits the guest VLAN, so questions 3 and 4 can only be answered from live evidence.
     * These values are deliberately WRONG and must never be used to generate state — they exist to
     * be contradicted. Kept beside the truth so the contradiction is auditable. */
    var DECOY_DIAGRAM = {
        dnsServer: '10.0.0.10',
        sw02Mgmt: '10.0.0.30',
        guestVlanShown: false,
        note: 'Intentionally stale. Never read by the generator; shown to the student only.'
    };

    var TOPOLOGY = {
        VLANS: VLANS,
        FIXED_NETS: FIXED_NETS,
        DEVICES: DEVICES,
        LINKS: LINKS,
        PORT_PLAN: PORT_PLAN,
        DEVICE_ATTACH: DEVICE_ATTACH,
        OUI: OUI,
        ENDPOINTS: ENDPOINTS,
        SSIDS: SSIDS,
        DNS_ZONE: DNS_ZONE,
        FAULT_SLOTS: FAULT_SLOTS,
        CONFLICT_PAIRS: CONFLICT_PAIRS,
        DECOY_DIAGRAM: DECOY_DIAGRAM,
        NOC_DECOYS: NOC_DECOYS
    };

    if (typeof module !== 'undefined' && module.exports) { module.exports = TOPOLOGY; }
    if (typeof window !== 'undefined') { window.NetFinalTopology = TOPOLOGY; }
})();
