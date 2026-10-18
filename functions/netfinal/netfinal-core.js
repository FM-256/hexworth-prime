/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-core.js — seeded generator, derived tables, and path evaluation for the Network+ final.
 *
 * Design spec: ~/hexworth-shared/etwork essential final/
 *              "Network+ Final Exam — Meridian Corp Operations Lab Design Spec.md" sections 4-6.
 * Stage 1 (state model + generator) and stage 2 (derived tables + reach()) of the 7-stage plan.
 *
 * THREE THINGS LIVE HERE AND NOTHING ELSE.
 *   1. generate(studentId, examId) -> a complete, healthy initial state, reproducible from the seed.
 *   2. tables.*(state, ...)        -> MAC / ARP / route / NAT / lease / DNS / counter tables,
 *                                     COMPUTED from config every call, never stored (spec section 5).
 *   3. reach(state, src, dst, opts) -> { ok, hops[], failedAt } walking layers 1 -> 2 -> 3 -> 4 -> 7.
 *
 * NO FAULTS ARE IMPLEMENTED HERE. That is stage 3. What stage 1 owes stage 3 is a state model whose
 * every field a fault needs to mutate already exists and is already read by reach() — so S3A becomes
 * "drop 20 from a trunk's allowed[]" rather than a new code path. The generator does CHOOSE the A/B
 * variant per slot, drawn from the enumerated conflict-free set, because the choice has to be seeded
 * to be reproducible. Writing apply()/fixed() now would be guessing at stage 3's grading contract.
 *
 * THAT CLAIM WAS FALSE WHEN FIRST WRITTEN, and the correction is the reason several things here look
 * the way they do. Nancy measured it against all 24 variants: five could not be expressed at all.
 * S1B (damaged patch cable on an ACCESS port) had no state object, because physical state lived on
 * `state.links` and that holds only the five backbone adjacencies. S4A and S4B need one address to
 * answer to two MACs, and the index mapped one IP to one node. S12A and S12B need an SNMP community
 * and per-device NTP/clock state, and the words community, ntp, snmp and clock appeared nowhere.
 * Physical state has since moved onto PORTS, the rogue carries a `claimsIp`, and devices carry
 * `snmp` and `ntp`. All 24 are now demonstrated expressible in netfinal-core.test.js section 6/6b —
 * asserted there rather than claimed here, because a claim in a header is not a check.
 *
 * SERVER-ONLY, AND THAT IS AN INTEGRITY DECISION, NOT A DEPLOYMENT DETAIL. This module lives under
 * functions/ and never ships to a browser. The exam page is a thin terminal: it posts a command and
 * renders the text that comes back, so grading and rendering share ONE code path.
 *
 * The alternative -- a client copy for rendering plus a server copy for grading -- means any drift
 * between the copies shows a student one network and grades them on a different one. That is the
 * worst defect an exam can have, and this repo already carries two GUILabEngine copies 237 lines
 * apart as evidence of how that ends. Keeping one copy also satisfies the spec's stage-7 criterion
 * ("the browser bundle contains no answerKey, no fixed() source, no slot or variant labels") by
 * construction rather than by auditing a bundle, and makes refresh-resume trivial because the
 * server already holds authoritative state.
 *
 * ★ WHAT STAGE 7 MUST NOT GET WRONG, from Mallory's audit of stages 1-5. Every function in this
 * engine -- exec, act, fixed, collateralDamage -- is a PURE function over whatever `state` it is
 * handed, and NOTHING here enforces where that state came from. That is the right shape for testing
 * and the wrong shape to expose:
 *
 *   STATE MUST LIVE SERVER-SIDE, keyed by session. The callable accepts {sessionId, command} or
 *   {sessionId, window, action, params} and NEVER a client-supplied state blob.
 *
 * If the wire protocol round-trips `state` through the browser -- the obvious way to keep these
 * functions stateless -- a student edits `services`, `rogue.placed`, `baseline.amnesty` or
 * `faults[i].fixedAtEvent` in the request body and bypasses the command interface entirely, or
 * fabricates a change request at an earlier event index than the fix it preceded. The engine would
 * do exactly as told, because being told is all it does. Mallory could not prove this as a live
 * exploit only because nothing is deployed.
 *
 * The client payload is `netfinal-client.js`'s toInitialState() and nothing else;
 * `_tools/netfinal/netfinal-leak.test.js` scans every client-facing surface and fails on disclosure.
 *
 * PURE AND DOM-FREE, ON PURPOSE. Nothing here reads the DOM, the network, or the clock — `generate`
 * takes no Date, and interface counters advance from an explicit `elapsedSec` argument. That is what
 * makes the spec's acceptance criterion ("the same seed produces byte-identical initialState and
 * answerKey on repeated runs") testable at all; a single `Date.now()` would make it unprovable.
 * The purity is also what lets a Cloud Function call it per request with no warm-up state.
 *
 * WHY NOT GUILabEngine: see the header of netfinal-topology.js. 23 lab pages, two copies of the
 * engine already 237 lines apart, and a connectivity model that is three booleans. Not touched.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var TOPO = (typeof require !== 'undefined')
        ? require('./netfinal-topology.js')
        : (typeof window !== 'undefined' ? window.NetFinalTopology : null);
    if (!TOPO) { throw new Error('netfinal-core: netfinal-topology.js must load first'); }

    /* ═══ 0. ADDRESS ARITHMETIC ═══════════════════════════════════════════════════════════════════
     * Deliberately arithmetic, not bitwise. `ipToInt('203.0.113.1')` exceeds 2^31, where JavaScript's
     * `<<` and `&` operate on SIGNED 32-bit values and silently return a negative number — so
     * `ip & mask` is wrong for every address above 127.x, which includes both WAN ranges this exam
     * uses. Division and Math.floor are correct across the whole 32-bit space. */
    function ipToInt(ip) {
        var p = String(ip).split('.');
        if (p.length !== 4) return null;
        var n = 0;
        for (var i = 0; i < 4; i++) {
            if (!/^\d{1,3}$/.test(p[i])) return null;
            var o = Number(p[i]);
            if (o > 255) return null;
            n = n * 256 + o;
        }
        return n;
    }
    function intToIp(n) {
        return [Math.floor(n / 16777216) % 256, Math.floor(n / 65536) % 256,
                Math.floor(n / 256) % 256, n % 256].join('.');
    }
    function blockSize(prefix) { return Math.pow(2, 32 - prefix); }
    function networkOf(ipInt, prefix) { var s = blockSize(prefix); return Math.floor(ipInt / s) * s; }
    function prefixToMask(prefix) { return intToIp(prefix === 0 ? 0 : 4294967296 - blockSize(prefix)); }
    function maskToPrefix(mask) {
        var n = ipToInt(mask), p = 0;
        for (var i = 31; i >= 0; i--) {
            if (Math.floor(n / Math.pow(2, i)) % 2 === 1) p++; else break;
        }
        return p;
    }
    function parseCidr(cidr) {
        var x = String(cidr).split('/');
        var prefix = Number(x[1]);
        var ipInt = ipToInt(x[0]);
        if (ipInt === null || !(prefix >= 0 && prefix <= 32)) return null;
        return { net: networkOf(ipInt, prefix), prefix: prefix, cidr: cidr };
    }
    /* `inNet` takes the net as parsed data rather than re-parsing a string every call: reach() asks
     * this question on the order of a hundred times per path and tables ask it per endpoint. */
    function inNet(ipInt, parsed) {
        return parsed !== null && networkOf(ipInt, parsed.prefix) === parsed.net;
    }

    /* ═══ 1. SEEDED RANDOMNESS ════════════════════════════════════════════════════════════════════
     * xmur3 to turn the seed string into 32 bits, mulberry32 to stream from it. Both are small,
     * well-known, and — the only property that matters here — identical in Node and the browser.
     *
     * NOT crypto.createHash, though the spec says `hash(studentId + examId)`: that is Node-only, and
     * a core that cannot run in a browser cannot be driven by the exam page later. A cryptographic
     * hash would buy unpredictability, which is not the threat — a student who can compute their own
     * seed still has to fix the faults. Reproducibility is the requirement, and that is met exactly.
     *
     * `studentId + examId` is concatenated with a '|' separator. Bare concatenation, as the spec
     * writes it, collides: student 'ab' + exam 'c' and student 'a' + exam 'bc' would be the same lab. */
    function xmur3(str) {
        var h = 1779033703 ^ str.length;
        for (var i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        return function () {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            h ^= h >>> 16;
            return h >>> 0;
        };
    }
    function mulberry32(a) {
        return function () {
            a = (a + 1831565813) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function makeRng(seedStr) {
        var seedFn = xmur3(String(seedStr));
        var seed32 = seedFn();
        var next = mulberry32(seed32);
        var api = {
            seed32: seed32,
            float: next,
            int: function (lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },
            pick: function (arr) { return arr[api.int(0, arr.length - 1)]; },
            /* Fisher-Yates on a COPY. Shuffling in place would mutate the shared topology arrays, so
             * the second call in a process would draw from an already-permuted roster and the "same
             * seed, same lab" guarantee would hold only for the first student generated. */
            shuffle: function (arr) {
                var a = arr.slice();
                for (var i = a.length - 1; i > 0; i--) {
                    var j = api.int(0, i);
                    var t = a[i]; a[i] = a[j]; a[j] = t;
                }
                return a;
            },
            /* A real vendor OUI with a seeded 24-bit host part, per spec section 4: MAC answers
             * differ per student while "which vendor is this" stays an answerable question. */
            mac: function (oui) {
                var hex = function (n) { var s = n.toString(16).toUpperCase(); return s.length < 2 ? '0' + s : s; };
                return oui + ':' + hex(api.int(0, 255)) + ':' + hex(api.int(0, 255)) + ':' + hex(api.int(0, 255));
            }
        };
        return api;
    }

    /* ═══ 2. GENERATOR ════════════════════════════════════════════════════════════════════════════ */

    var MAX_ATTEMPTS = 64;


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

    function hostIp(subnet, host) { return intToIp(subnet.parsed.net + host); }

    /* The seeded target for one fault variant. The spec writes `{p}` and `{mac}` as seeded values,
     * so "which port is half duplex" has to be part of the seed to survive a regrade. Pulled out of
     * the generator so a caller can construct any variant against an existing lab. */
    function pickFaultTarget(state, rng, slot, variant) {
        var byName = function (names) {
            var cands = state.endpoints.filter(function (e) { return names.indexOf(e.name) >= 0 && e.port; });
            return cands.length ? rng.pick(cands) : null;
        };
        var e;
        if (slot === 'S1') {
            e = byName(['ENG-PC04', 'ENG-PC05', 'ENG-PC06']);          // floor-2 Engineering
            return e ? { host: e.name, switch: e.switch, port: e.port } : null;
        }
        if (slot === 'S2' && variant === 'A') {
            e = state.endpoints.filter(function (x) { return x.reservation; })[0];   // the printer, pinned to SW-01
            return e ? { host: e.name, switch: e.switch, port: e.port } : null;
        }
        if (slot === 'S2' && variant === 'B') {
            e = byName(['SALES-PC01', 'SALES-PC02', 'SALES-PC03', 'SALES-PC04', 'SALES-PC05', 'SALES-PC06']);
            return e ? { host: e.name, switch: e.switch, port: e.port } : null;
        }
        if (slot === 'S5' && variant === 'A') {
            /* A static kiosk ABOVE .127. Not a leased guest: the pool stops at .127 so the leased
             * ones keep working and the ticket's "others are fine" half stays true. */
            return { host: rng.pick(['KIOSK-GUEST01', 'KIOSK-GUEST02']) };
        }
        if (slot === 'S11' && variant === 'B') {
            return { aps: ['AP-2', 'AP-3'], channel: rng.pick([1, 6, 11]) };
        }
        return null;
    }

    /* One attempt at a lab. Returns a draft; `validate` decides whether it stands. Split from
     * `generate` so the redraw loop has nothing to undo — a rejected draft is simply discarded,
     * rather than a half-mutated state needing repair. */
    function draftLab(studentId, examId, seedStr) {
        var rng = makeRng(seedStr);
        var state = {
            meta: {
                studentId: String(studentId), examId: String(examId),
                seedStr: seedStr, seed32: rng.seed32, generatorVersion: '1.0.0'
            },
            /* HOW LONG THE FAULTS HAVE BEEN RUNNING WHEN THE STUDENT ARRIVES. A fixed number, not a
             * clock read, so the lab stays byte-identical for a given seed. It is not zero because
             * interface counters derive from it: at zero, S1A's late collisions and S1B's CRC errors
             * are both 0 and the two faults are indistinguishable from a healthy port. Tickets reach
             * a help desk after users have noticed, so a fault that has been live for half an hour
             * is the realistic starting condition. Stage 7 advances this as the exam runs, which is
             * what makes "errors rising between two runs" true. */
            examElapsedSec: 1800,
            params: {}, subnets: {}, devices: {}, links: [], ports: {}, svis: {},
            routes: {}, acls: {}, nat: {}, ipsec: {}, dhcp: {}, dns: {},
            services: {}, endpoints: [], ssids: [], faults: [], events: []
        };

        /* ── seeded addressing ──────────────────────────────────────────────────────────────────── */
        var bChoices = [];
        for (var bv = 16; bv <= 250; bv++) { if (bv !== 200) bChoices.push(bv); }
        var b = rng.pick(bChoices);                      // spec: 16-250 excluding 200 (branch is 10.200/16's /24)
        var wanBase = rng.pick(['203.0.113', '198.51.100']);
        var wanThird = rng.int(0, 63) * 4;               // a /30 aligned inside the /24
        var wanNet = wanBase + '.' + wanThird;
        state.params = {
            b: b,
            wan: {
                cidr: wanNet + '/30', mask: prefixToMask(30),
                fwIp: wanBase + '.' + (wanThird + 1), ispIp: wanBase + '.' + (wanThird + 2)
            },
            /* S9A shrinks the Sales pool to 1-3 fewer than its active clients. Drawn now so the
             * number is part of the seed rather than invented when the fault is applied. */
            s9aShortfall: rng.int(1, 3),
            nocDecoy: rng.pick(TOPO.NOC_DECOYS).id
        };

        TOPO.VLANS.forEach(function (v) {
            var cidr = v.fixedSubnet || ('10.' + b + '.' + v.id + '.0/24');
            var parsed = parseCidr(cidr);
            state.subnets[v.id] = {
                vlan: v.id, name: v.name, cidr: cidr, parsed: parsed,
                mask: prefixToMask(parsed.prefix), gateway: intToIp(parsed.net + 1), dhcp: !!v.dhcp
            };
        });
        ['transit', 'dmz', 'branch'].forEach(function (k) {
            var n = TOPO.FIXED_NETS[k];
            state.params[k] = { cidr: n.cidr, parsed: parseCidr(n.cidr), mask: prefixToMask(parseCidr(n.cidr).prefix) };
        });
        state.params.wan.parsed = parseCidr(state.params.wan.cidr);

        /* ── devices and their management addresses ─────────────────────────────────────────────── */
        TOPO.DEVICES.forEach(function (d) {
            var mgmt = d.mgmt;
            if (typeof mgmt === 'string') {
                mgmt = mgmt.replace(/\{vlan(\d+)\}/g, function (_, v) {
                    var s = state.subnets[Number(v)];
                    return s ? s.cidr.split('/')[0].replace(/\.0$/, '') : _;
                });
            }
            state.devices[d.id] = {
                id: d.id, role: d.role, platform: d.platform, access: d.access,
                mgmtIp: mgmt === 'dhcp' ? null : mgmt, vlan: d.vlan || null, logs: [], files: {}
            };
        });

        /* ── ports ──────────────────────────────────────────────────────────────────────────────── */
        Object.keys(TOPO.PORT_PLAN).forEach(function (sw) {
            state.ports[sw] = {};
            TOPO.PORT_PLAN[sw].forEach(function (seg) {
                for (var n = seg.range[0]; n <= seg.range[1]; n++) {
                    var name = 'Fa0/' + n;
                    state.ports[sw][name] = seg.vlan === 'trunk'
                        /* An AP or router uplink. `allowed` is the enforced list reach() walks; S3
                         * removes a VLAN from exactly this array. */
                        ? { name: name, mode: 'trunk', allowed: [10, 20, 40, 99], native: 1, shutdown: false,
                            up: true, errorRate: 0, speed: 100, duplex: 'full', label: seg.label }
                        : { name: name, mode: 'access', vlan: seg.vlan, shutdown: !!seg.shutdown,
                            up: true, errorRate: 0, speed: 100, duplex: 'full', label: seg.label };
                }
            });
        });
        /* Each switch gets a virtual management interface so that "reach SW-02" is the same
         * question as "reach any host": a path to a switch's own management address is a path into
         * VLAN 99, and modelling it as a port lets l2Path answer both without a special case. */
        ['MeridianSW-01', 'MeridianSW-02'].forEach(function (sw) {
            /* `up`/`errorRate` are present for SHAPE UNIFORMITY even though an SVI has no cable:
             * portCarries reads both, and on a port lacking them the checks passed only because
             * `undefined === false` and `undefined >= 1` are both false. Relying on that is a
             * silent special case. A virtual interface is taken down with `shutdown`. */
            state.ports[sw]['Vlan99'] = { name: 'Vlan99', mode: 'access', vlan: 99, shutdown: false,
                up: true, errorRate: 0, speed: 1000, duplex: 'full',
                label: 'switch management interface', virtual: true };
        });

        /* ── links ──────────────────────────────────────────────────────────────────────────────── */
        /* THE PORT IS THE ONLY HOLDER OF PHYSICAL AND CONFIG STATE. A link is adjacency and
         * nothing else -- which end connects to which. `up`, `errorRate`, `speed`, `duplex`,
         * `shutdown` and the trunk `allowed` list all live on the two PORTS.
         *
         * This is not a style choice, and the first version of this file got it wrong in a way
         * worth recording. Physical state lived on the LINK, and `state.links` carries exactly one
         * entry per TOPO.LINKS entry -- the backbone adjacencies and nothing else -- so no host
         * access-port cable had a state object at all. Fault
         * S1B is "damaged patch cable on SW-02 Fa0/{p}", an ACCESS port, and it was therefore not
         * representable; worse, the test that claimed to cover it set `errorRate` on the
         * inter-switch trunk and read counters for Gi0/1, demonstrating the mechanism on a link no
         * fault targets while the link S1B needs had no mechanism. Nancy caught both.
         *
         * Everything the student inspects is per-interface: `show interfaces Fa0/8` prints that
         * port's duplex, CRC and collisions, and `show interfaces trunk` prints that switch's
         * allowed list. Putting the state where the command reads it means a fault mutates exactly
         * one field and the evidence follows for free. A link-level copy would be a second truth
         * and reach() would have to choose between them.
         *
         * Ports are materialised for EVERY interface a link names, on both ends, whatever the
         * device -- routers and the firewall included, which PORT_PLAN does not cover. Without
         * that, the transit, WAN and DMZ links had no port records and reach() consulted no
         * physical state for them at all: the transit, WAN and DMZ links could each be marked down
         * and every path stayed healthy.
         *
         * THIS BLOCK EXISTED TWICE. An edit meant to replace the pre-port-model version appended
         * after it instead, so both ran: `state.links` came out at double length, holding two
         * record shapes for the same adjacencies, while the comments here claimed "five". Nothing
         * read `state.links.length` or the dead physical fields, so 218 assertions, a design review
         * and 59 mutation runs all stayed green -- Chris found it by probing the generator. The
         * suite now asserts the link count and shape against TOPO.LINKS. */
        TOPO.LINKS.forEach(function (l) {
            state.links.push({ a: l.a.slice(), b: l.b.slice(), kind: l.kind, net: l.net || null });
            [l.a, l.b].forEach(function (end) {
                var dev = end[0], port = end[1];
                var far = (dev === l.a[0] && port === l.a[1]) ? l.b[0] : l.a[0];
                if (!state.ports[dev]) state.ports[dev] = {};
                if (state.ports[dev][port]) {
                    if (l.allowed && state.ports[dev][port].mode === 'trunk') {
                        state.ports[dev][port].allowed = l.allowed.slice();
                    }
                    return;
                }
                state.ports[dev][port] = l.allowed
                    ? { name: port, mode: 'trunk', allowed: l.allowed.slice(), native: 1, shutdown: false,
                        up: true, errorRate: 0, speed: 1000, duplex: 'full', label: 'link to ' + far }
                    : { name: port, mode: 'routed', vlan: null, shutdown: false,
                        up: true, errorRate: 0, speed: 1000, duplex: 'full', label: 'link to ' + far };
            });
        });

        /* ── router sub-interfaces ──────────────────────────────────────────────────────────────── */
        TOPO.VLANS.forEach(function (v) {
            var s = state.subnets[v.id];
            state.svis[v.id] = {
                device: 'MeridianRTR-01', iface: 'Gi0/0.' + v.id, vlan: v.id,
                ip: s.gateway, mask: s.mask, shutdown: false,
                mac: rng.mac(TOPO.OUI.cisco), attach: { sw: 'MeridianSW-01', port: 'Fa0/24' }
            };
        });

        /* ── endpoints ──────────────────────────────────────────────────────────────────────────── */
        var staticPool = {};   // vlan -> remaining .20-.99 choices, so no two statics collide
        var usedPorts = {};    // sw -> { port: true }
        TOPO.ENDPOINTS.forEach(function (e) {
            var vlan = e.vlan || null;
            var sub = vlan ? state.subnets[vlan] : null;
            var ep = {
                name: e.name, kind: e.kind, vlan: vlan,
                mac: rng.mac(TOPO.OUI[e.oui]),
                ip: null, mask: sub ? sub.mask : null, gw: null, dns: null,
                dhcp: !!e.dhcp, switch: e.switch || null, port: null,
                ap: e.ap || null, ssid: e.ssid || null,
                network: e.network || null, reservation: !!e.reservation
            };

            if (e.network === 'branch') {
                var bn = state.params.branch;
                ep.ip = intToIp(bn.parsed.net + e.host);
                ep.mask = bn.mask;
                ep.gw = intToIp(bn.parsed.net + 1);
            } else if (typeof e.host === 'number') {
                ep.ip = hostIp(sub, e.host);
                ep.gw = sub.gateway;
            } else if (e.hostRange) {
                /* A static address drawn from an explicit range, used for devices that must sit
                 * outside the DHCP pool -- the guest kiosks above the /25 boundary that give S5A
                 * its symptom. Keyed per endpoint so two kiosks cannot collide. */
                ep.ip = hostIp(sub, rng.int(e.hostRange[0], e.hostRange[1]));
                ep.gw = sub.gateway;
            } else if (!e.dhcp) {
                if (!staticPool[vlan]) {
                    var c = [];
                    for (var h = 20; h <= 99; h++) { c.push(h); }
                    staticPool[vlan] = rng.shuffle(c);
                }
                ep.ip = hostIp(sub, staticPool[vlan].pop());
                ep.gw = sub.gateway;
            }

            /* Port placement: a random FREE port inside the VLAN's documented range (spec section 4,
             * "which port" answers differ). Fixed for APs, whose positions the topology names. */
            if (e.port) {
                ep.port = 'Fa0/' + e.port;
            } else if (e.switch && e.portPool) {
                if (!usedPorts[e.switch]) usedPorts[e.switch] = {};
                var cands = [];
                Object.keys(state.ports[e.switch]).forEach(function (pn) {
                    var p = state.ports[e.switch][pn];
                    if (p.mode === 'access' && p.vlan === e.portPool && !p.shutdown && !usedPorts[e.switch][pn]) cands.push(pn);
                });
                if (!cands.length) return;   // validate() turns this into a rejected draft
                ep.port = rng.pick(rng.shuffle(cands));
                usedPorts[e.switch][ep.port] = true;
            }
            state.endpoints.push(ep);
        });

        /* ── SSIDs ──────────────────────────────────────────────────────────────────────────────── */
        state.ssids = TOPO.SSIDS.map(function (s) {
            return { name: s.name, vlan: s.vlan, aps: s.aps.slice(), dnsOverride: s.dnsOverride || null };
        });
        /* 2.4 GHz channels start healthy and non-overlapping: spec's S11B graded state is "all
         * channels in {1, 6, 11}" with no two ADJACENT APs sharing one. AP-1/2/3 are mutually
         * adjacent in a three-AP building, so the healthy assignment is a permutation of all three. */
        var chans = rng.shuffle([1, 6, 11]);
        state.wireless = { apChannels: { 'AP-1': chans[0], 'AP-2': chans[1], 'AP-3': chans[2] } };

        /* ── DHCP ───────────────────────────────────────────────────────────────────────────────── */
        var printer = state.endpoints.filter(function (e) { return e.reservation; })[0];
        state.dhcp = { subnets: {}, reservations: [], requestOrder: [] };
        TOPO.VLANS.forEach(function (v) {
            if (!v.dhcp) return;
            var s = state.subnets[v.id];
            state.dhcp.subnets[v.id] = {
                vlan: v.id, subnet: s.cidr,
                pool: { start: hostIp(s, (v.pool || [100, 199])[0]), end: hostIp(s, (v.pool || [100, 199])[1]) },
                routers: s.gateway,
                /* Guests get a public resolver so a CORRECT guest ACL (which denies guest->internal)
                 * never breaks guest name resolution — spec section 6's closing note. Without this,
                 * fixing S8A would present as breaking DNS for guests. */
                dns: v.id === 40 ? '1.1.1.1' : state.devices['MER-SRV01'].mgmtIp
            };
        });
        if (printer) {
            /* .50 is inside the static range .20-.99, so it is outside every pool by construction
             * and S9A can shrink the Sales pool without ever colliding with the reservation. */
            state.dhcp.reservations.push({ host: printer.name, mac: printer.mac, ip: hostIp(state.subnets[10], 50), vlan: 10 });
        }
        /* Lease order is seeded and FIXED here, so pool exhaustion strands the same hosts on every
         * regeneration of the same seed. ADMIN-WS01 is forced first: spec constraint 3 is that it
         * always holds a valid lease even under S9A, and "first in line" is the only way to make
         * that true by construction rather than by hoping the shrink lands elsewhere. */
        var clients = state.endpoints.filter(function (e) { return e.dhcp; }).map(function (e) { return e.name; });
        state.dhcp.requestOrder = ['ADMIN-WS01'].concat(rng.shuffle(clients));

        /* ADMIN-WS01 is a device, not an endpoint, but it is a DHCP client in VLAN 10 and reach()
         * needs it as a node. Registered as an endpoint too, with its own seeded MAC and port. */
        var wsPorts = [];
        Object.keys(state.ports['MeridianSW-01']).forEach(function (pn) {
            var p = state.ports['MeridianSW-01'][pn];
            if (p.mode === 'access' && p.vlan === 10 && !p.shutdown && !(usedPorts['MeridianSW-01'] || {})[pn]) wsPorts.push(pn);
        });
        state.endpoints.push({
            name: 'ADMIN-WS01', kind: 'workstation', vlan: 10, mac: rng.mac(TOPO.OUI.dell),
            ip: null, mask: state.subnets[10].mask, gw: null, dns: null, dhcp: true,
            switch: 'MeridianSW-01', port: wsPorts.length ? rng.pick(wsPorts) : null,
            ap: null, ssid: null, network: null, reservation: false
        });
        if (wsPorts.length) { (usedPorts['MeridianSW-01'] = usedPorts['MeridianSW-01'] || {})[state.endpoints[state.endpoints.length - 1].port] = true; }

        /* ADMIN-WS01 IS RESERVED, WITH ITS OWN GATEWAY OPTION, and that is a constraint-2 fix
         * rather than a convenience. It was a plain Sales DHCP client, so fault S9B -- which sets
         * the Sales `routers` option to .254 -- handed the STUDENT'S OWN workstation a gateway
         * nothing answers for and severed its path to every management address. Spec constraint 2
         * forbids any fault from touching that path, and constraint 3 requires this host to hold a
         * valid lease even under S9A.
         *
         * A host reservation carrying per-host options satisfies both BY CONSTRUCTION: the address
         * sits outside the pool so a shrink cannot strand it, and the host-level `routers` option
         * overrides the subnet-level one that S9B breaks. Per-host options are ordinary DHCP, so
         * nothing here is a special case for the exam -- and the S9B ticket stays accurate, because
         * it is about NEW Sales PCs, not the admin's own machine. */
        var adminWs = state.endpoints[state.endpoints.length - 1];
        state.dhcp.reservations.push({
            host: 'ADMIN-WS01', mac: adminWs.mac, ip: hostIp(state.subnets[10], 40), vlan: 10,
            options: { routers: state.subnets[10].gateway, dns: state.devices['MER-SRV01'].mgmtIp }
        });

        /* ── routes ─────────────────────────────────────────────────────────────────────────────── */
        var rtr = [];
        TOPO.VLANS.forEach(function (v) {
            var s = state.subnets[v.id];
            rtr.push({ dest: s.parsed.net, prefix: s.parsed.prefix, cidr: s.cidr, kind: 'connected', iface: 'Gi0/0.' + v.id, vlan: v.id });
        });
        rtr.push({ dest: state.params.transit.parsed.net, prefix: 30, cidr: state.params.transit.cidr, kind: 'connected', iface: 'Gi0/1' });
        rtr.push({ dest: 0, prefix: 0, cidr: '0.0.0.0/0', kind: 'static', nextHop: TOPO.FIXED_NETS.transit.fw, iface: 'Gi0/1' });
        rtr.push({ dest: state.params.branch.parsed.net, prefix: 24, cidr: state.params.branch.cidr, kind: 'static', nextHop: TOPO.FIXED_NETS.transit.fw, iface: 'Gi0/1' });
        state.routes['MeridianRTR-01'] = rtr;

        var fw = [
            { dest: state.params.transit.parsed.net, prefix: 30, cidr: state.params.transit.cidr, kind: 'connected', iface: 'LAN' },
            { dest: state.params.dmz.parsed.net, prefix: 24, cidr: state.params.dmz.cidr, kind: 'connected', iface: 'DMZ' },
            { dest: state.params.wan.parsed.net, prefix: 30, cidr: state.params.wan.cidr, kind: 'connected', iface: 'WAN' },
            /* Summary back to every user VLAN. A /16 rather than five /24s because the return route
             * must survive stage 3 reseating a subnet, and because spec S6B accepts the equivalent
             * summary ("or summarize 10.{b}.0.0/16") as a correct student answer. */
            { dest: parseCidr('10.' + b + '.0.0/16').net, prefix: 16, cidr: '10.' + b + '.0.0/16', kind: 'static', nextHop: TOPO.FIXED_NETS.transit.rtr, iface: 'LAN' },
            { dest: parseCidr('10.0.0.0/24').net, prefix: 24, cidr: '10.0.0.0/24', kind: 'static', nextHop: TOPO.FIXED_NETS.transit.rtr, iface: 'LAN' },
            { dest: state.params.branch.parsed.net, prefix: 24, cidr: state.params.branch.cidr, kind: 'static', nextHop: null, iface: 'ipsec0' },
            { dest: 0, prefix: 0, cidr: '0.0.0.0/0', kind: 'static', nextHop: state.params.wan.ispIp, iface: 'WAN' }
        ];
        state.routes['MER-FW01'] = fw;

        /* ── policy: ACLs, NAT, IPsec ───────────────────────────────────────────────────────────── */
        /* GUEST-IN is where guest->internal is denied, and it is the ONLY place. An equivalent deny
         * on SERVERS-OUT would mask S8A entirely: S8A's whole symptom is a guest reaching FS01 on
         * 445 because the deny sits after a permit, which cannot happen if a second ACL also blocks
         * it. So SERVERS-OUT starts as a bare permit, and S8B's job in stage 3 is to insert the
         * wrong deny line into it. The spec's S8B graded state, "guest-to-server deny still present
         * and working", is satisfied by GUEST-IN. */
        state.acls = {
            'MeridianRTR-01': {
                'GUEST-IN': {
                    name: 'GUEST-IN', applied: [{ iface: 'Gi0/0.40', dir: 'in' }],
                    lines: [
                        { seq: 10, action: 'deny', proto: 'ip', src: '10.' + b + '.40.0/24', dst: '10.' + b + '.0.0/16', hits: 0 },
                        { seq: 20, action: 'permit', proto: 'ip', src: 'any', dst: 'any', hits: 0 }
                    ]
                },
                'SERVERS-OUT': {
                    name: 'SERVERS-OUT', applied: [{ iface: 'Gi0/0.30', dir: 'out' }],
                    lines: [{ seq: 10, action: 'permit', proto: 'ip', src: 'any', dst: 'any', hits: 0 }]
                }
            }
        };
        state.nat = {
            outbound: [10, 20, 30, 40, 99].map(function (v) {
                return { src: state.subnets[v].cidr, translateTo: 'wan', iface: 'WAN' };
            }),
            portForwards: [
                { wanPort: 443, proto: 'tcp', toIp: '172.16.50.10', toPort: 443 },
                { wanPort: 80, proto: 'tcp', toIp: '172.16.50.10', toPort: 80 }
            ]
        };
        state.ipsec = {
            tunnelUp: true,
            phase2: [10, 20, 30].map(function (v) {
                return { local: state.subnets[v].cidr, remote: TOPO.FIXED_NETS.branch.cidr };
            })
        };

        /* ── DNS: two copies on purpose ─────────────────────────────────────────────────────────── */
        /* `zoneFile` is what is on disk; `loaded` is what named has in memory. Separating them is
         * what makes S10B ("edited but never reloaded") representable at all — with one copy, a
         * zone edit would take effect instantly and the fault could not exist. Every query reads
         * `loaded`; a reload copies zoneFile across only when its serial has advanced. */
        var resolveRec = function (t) {
            return t.replace(/\{vlan(\d+)\}/g, function (_, v) {
                return state.subnets[Number(v)].cidr.split('/')[0].replace(/\.0$/, '');
            });
        };
        var records = TOPO.DNS_ZONE.records.map(function (r) {
            return { name: r.name, type: r.type, target: resolveRec(r.target) };
        });
        state.dns = {
            origin: TOPO.DNS_ZONE.origin,
            zoneFile: { serial: TOPO.DNS_ZONE.serial, records: records },
            loaded: { serial: TOPO.DNS_ZONE.serial, records: records.map(function (r) { return { name: r.name, type: r.type, target: r.target }; }) },
            server: state.devices['MER-SRV01'].mgmtIp,
            externalResolvers: ['1.1.1.1', '8.8.8.8']
        };

        /* ── listening services ─────────────────────────────────────────────────────────────────── */
        state.services = {
            'MER-FS01': { tcp: [139, 445], udp: [] },
            'PRN-SALES01': { tcp: [9100], udp: [] },
            'MER-SRV01': { tcp: [22, 53], udp: [53, 67, 123] },   // 123: the NTP source S12B's fix points at
            'MER-NOC01': { tcp: [80, 443], udp: [162] },
            'MER-WEB01': { tcp: [22, 80, 443], udp: [] },
            'BR-NAS01': { tcp: [139, 445], udp: [] },
            'MeridianRTR-01': { tcp: [22], udp: [161] },
            'MeridianSW-01': { tcp: [22], udp: [161] },
            'MeridianSW-02': { tcp: [22], udp: [161] },
            'MER-FW01': { tcp: [443], udp: [161, 500, 4500] },
            'MER-WLC01': { tcp: [443], udp: [161] }
        };

        /* ── fault plan: variant chosen now, applied in stage 3 ─────────────────────────────────── */
        /* Drawn from the ENUMERATED conflict-free set, not by flipping a coin per slot and
         * redrawing on a conflict. Measured: only 128 of the 4,096 combinations satisfy the spec's
         * own nine conflict pairs, so per-slot flipping is accepted 3.1% of the time and even 64
         * redraws would still fail outright for roughly one student in eight. Enumeration is exact,
         * uniform over the legal set, and never fails. */
        state.faults = rng.pick(conflictFreeCombinations()).map(function (id) {
            var slot = id.slice(0, -1), variant = id.slice(-1);
            var v = TOPO.FAULT_SLOTS.filter(function (x) { return x.slot === slot; })[0].variants[variant];
            return { slot: slot, variant: variant, id: id, active: true, applied: false, layer: v.layer, group: v.group };
        });

        /* Targets are chosen by pickFaultTarget (below) rather than inline, so ANY variant can be
         * built on demand -- which the test suite and any instructor preview both need, because
         * generate() can only ever produce 19 of the 24: the conflict list pins S2B, S3B, S5B, S7A
         * and S11A out of every legal combination (taskboard 436). Authored content no student can
         * reach still has to be verifiable. */
        state.faults.forEach(function (f) {
            f.target = pickFaultTarget(state, rng, f.slot, f.variant);
        });

        /* The rogue is placed by placeRogue() AFTER attachDevices, not here: its candidate list
         * must exclude ports that managed devices occupy, and those attachments do not exist yet at
         * this point in draftLab. Picking it here consulted an empty device map and put the rogue on
         * MER-NOC01's port in 37 of 300 seeds, where the graded fix severed the management path. */

        /* S12 needs three things that did not exist: a community string ON each device, the
         * community the NOC POLLS WITH, and per-device clock/NTP state. `state.services` only ever
         * tracked open ports (udp/161 was listed) which says a device speaks SNMP, never whether it
         * would ACCEPT the poll -- and S12A is a false-positive alert caused precisely by a device
         * that answers ping and SSH while refusing the NOC's community. */
        var SNMP_RO = 'meridian-ro';
        /* TARGETS ARE DERIVED from who actually listens on udp/161, never written out by hand. The
         * hand-written list named MER-FW01 while its declared services had no 161, so the healthy
         * lab shipped a monitored device that could never be polled -- a permanent false alarm
         * sitting underneath S12A's deliberate one. Deriving it means the roster and the services
         * table cannot disagree. The NOC does not poll itself (it receives traps on udp/162). */
        state.monitoring = {
            community: SNMP_RO,
            targets: Object.keys(state.services).filter(function (id) {
                return id !== 'MER-NOC01' && state.devices[id]
                    && (state.services[id].udp || []).indexOf(161) >= 0;
            }).sort(),
            decoyAlert: state.params.nocDecoy
        };
        Object.keys(state.devices).forEach(function (id) {
            if (state.monitoring.targets.indexOf(id) < 0 && id !== 'MER-NOC01') return;
            state.devices[id].snmp = { community: SNMP_RO, authFailures: 0 };
            /* NTP points at the REAL server. S12B repoints it at 10.0.0.10 -- the address the stale
             * diagram still shows for DNS -- which is why that decoy value has to stay reachable as
             * a plausible wrong answer rather than being scrubbed from the topology. */
            state.devices[id].ntp = {
                server: state.devices['MER-SRV01'].mgmtIp, synchronized: true, offsetSec: 0
            };
        });

        state.decoyDiagram = TOPO.DECOY_DIAGRAM;
        resolveLeases(state);
        return state;
    }

    /* ── DHCP lease resolution ──────────────────────────────────────────────────────────────────── */
    /* Called once at generate time and again by stage 3 after a fault changes a pool, a VLAN, or a
     * trunk. It is NOT a derived table in the spec's sense even though leases appear in that list,
     * because an endpoint's IP is an input to reach() — a table that reach() consumed would be
     * circular. The circularity is broken by deciding leases on the LAYER-2 path only: a DHCP
     * client and its relay (the VLAN's sub-interface) share a broadcast domain, so whether the
     * discover arrives is a question about ports and trunks, never about addresses. */
    function resolveLeases(state) {
        var byName = {};
        /* RELEASE FIRST, so the function is idempotent. Without this it had to be preceded by a
         * manual loop clearing every dhcp endpoint's ip and lease -- every caller in the test suite
         * did exactly that, which is a footgun rather than an API. Stage 3 re-resolves leases after
         * any fault that moves a VLAN, changes an SSID mapping or resizes a pool, so calling it
         * twice must give the same answer as calling it once. */
        state.endpoints.forEach(function (e) {
            if (e.dhcp) { e.ip = null; e.lease = null; e.gw = null; e.dns = null; e.vlanEffective = undefined; }
        });
        state.endpoints.forEach(function (e) { byName[e.name] = e; });
        var issued = {};   // vlan -> next free host octet
        var taken = {};    // vlan -> { host: true }

        state.endpoints.forEach(function (e) {
            if (!e.dhcp && e.ip && e.vlan) {
                var n = ipToInt(e.ip) - state.subnets[e.vlan].parsed.net;
                (taken[e.vlan] = taken[e.vlan] || {})[n] = true;
            }
        });
        state.dhcp.reservations.forEach(function (r) {
            (taken[r.vlan] = taken[r.vlan] || {})[ipToInt(r.ip) - state.subnets[r.vlan].parsed.net] = true;
        });

        state.dhcp.requestOrder.forEach(function (name) {
            var e = byName[name];
            if (!e || !e.dhcp) return;
            /* An SSID's VLAN mapping decides a wireless client's VLAN, so S11A (guest SSID mapped to
             * VLAN 10) shows up here as guests holding Sales addresses — which is its symptom. */
            var vlan = e.vlan;
            if (e.ssid) {
                var ss = state.ssids.filter(function (s) { return s.name === e.ssid; })[0];
                if (ss) vlan = ss.vlan;
            } else if (e.switch && e.port && state.ports[e.switch] && state.ports[e.switch][e.port]) {
                /* The port's access VLAN, not the roster's intent — that difference IS S2. */
                var p = state.ports[e.switch][e.port];
                if (p.mode === 'access' && p.vlan) vlan = p.vlan;
            }

            var res = state.dhcp.reservations.filter(function (r) { return r.mac === e.mac; })[0];
            var conf = state.dhcp.subnets[vlan];
            var sub = state.subnets[vlan];
            var pathOk = l2ToRelay(state, e, vlan);

            if (!pathOk || !conf || !sub) {
                /* No server reachable, or the VLAN has no pool at all (VLAN 30 by design, which is
                 * why spec section 6 says S2B's stranded PC shows 169.254). A real client self-
                 * assigns link-local; so does this one, deterministically from its MAC so the
                 * address is stable across regenerations of the same seed. */
                var m = e.mac.split(':');
                e.ip = '169.254.' + parseInt(m[4], 16) + '.' + Math.max(1, parseInt(m[5], 16));
                e.mask = '255.255.0.0'; e.gw = null; e.dns = null;
                e.lease = null; e.vlanEffective = vlan;
                return;
            }
            if (res && res.vlan === vlan) {
                e.ip = res.ip;
                /* A reservation may carry its own options, which override the subnet's. This is how
                 * ADMIN-WS01 keeps a working gateway while S9B breaks the Sales option. */
                if (res.options) {
                    e.mask = sub.mask;
                    e.gw = res.options.routers || conf.routers;
                    e.dns = res.options.dns || conf.dns;
                    e.vlanEffective = vlan;
                    e.lease = { vlan: vlan, server: state.dns.server, pool: 'reservation ' + res.ip };
                    return;
                }
            } else {
                var lo = ipToInt(conf.pool.start) - sub.parsed.net;
                var hi = ipToInt(conf.pool.end) - sub.parsed.net;
                var n = issued[vlan] === undefined ? lo : issued[vlan];
                while (n <= hi && (taken[vlan] || {})[n]) n++;
                if (n > hi) {
                    /* Pool exhausted — S9A's entire mechanism. The clients that strand are the ones
                     * LAST in requestOrder, which is seeded, which is why the same seed always
                     * strands the same laptops and the answer key is stable. */
                    var mm = e.mac.split(':');
                    e.ip = '169.254.' + parseInt(mm[4], 16) + '.' + Math.max(1, parseInt(mm[5], 16));
                    e.mask = '255.255.0.0'; e.gw = null; e.dns = null; e.lease = null; e.vlanEffective = vlan;
                    return;
                }
                (taken[vlan] = taken[vlan] || {})[n] = true;
                issued[vlan] = n + 1;
                e.ip = intToIp(sub.parsed.net + n);
            }
            e.mask = sub.mask;
            e.gw = conf.routers;
            e.dns = conf.dns;
            e.vlanEffective = vlan;
            e.lease = { vlan: vlan, server: state.dns.server, pool: conf.pool.start + '-' + conf.pool.end };
        });
        return state;
    }

    /* Whether a DHCP discover from this client reaches its relay: layer 1 and 2 only. */
    function l2ToRelay(state, ep, vlan) {
        var pos = l2Position(state, ep, vlan);
        if (!pos) return false;
        var svi = state.svis[vlan];
        if (!svi || svi.shutdown) return false;
        return l2Path(state, pos, svi.attach, vlan).ok;
    }

    /* ═══ 3. LAYER 2 ══════════════════════════════════════════════════════════════════════════════ */

    /* An endpoint's layer-2 position. A wireless client has no port of its own — it is wherever its
     * AP is plugged in, which is why S11A (guest SSID on the wrong VLAN) and S3 (a trunk missing a
     * VLAN) can both strand wireless users: the AP's port is a trunk and must allow the VLAN. */
    function l2Position(state, ep, vlan) {
        if (ep.ap) {
            var ap = state.endpoints.filter(function (x) { return x.name === ep.ap; })[0];
            if (!ap || !ap.switch || !ap.port) return null;
            return { sw: ap.switch, port: ap.port, via: ep.ap };
        }
        if (ep.attach) return ep.attach;
        if (ep.switch && ep.port) return { sw: ep.switch, port: ep.port };
        return null;
    }

    /* Whether one port will carry one VLAN. Layer 1 answers (a shut or missing port) are reported as
     * layer 1 and layer 2 answers (wrong access VLAN, VLAN not in a trunk's allowed list) as layer
     * 2, because the student's next command differs: `show interfaces` versus `show vlan brief`. */
    function portCarries(state, pos, vlan) {
        var p = state.ports[pos.sw] && state.ports[pos.sw][pos.port];
        if (!p) return { ok: false, layer: 1, device: pos.sw, reason: 'no such port ' + pos.port };
        if (p.shutdown) return { ok: false, layer: 1, device: pos.sw, reason: pos.port + ' is administratively down' };
        if (p.up === false) return { ok: false, layer: 1, device: pos.sw, reason: pos.port + ' has no link (cable down)' };
        /* A damaged cable DEGRADES; it does not drop. S1A (half duplex, late collisions) and S1B
         * (CRC errors rising) both ship tickets that say "slow", not "dead", so anything below a
         * total failure must still carry traffic or those two faults become indistinguishable from
         * an unplugged cable and their whole diagnostic arc collapses. */
        if (p.errorRate >= 1) return { ok: false, layer: 1, device: pos.sw, reason: pos.port + ' error rate is total: no frames pass' };
        if (p.mode === 'access') {
            if (p.vlan !== vlan) {
                return { ok: false, layer: 2, device: pos.sw,
                    reason: pos.port + ' is an access port in VLAN ' + p.vlan + ', not VLAN ' + vlan };
            }
            return { ok: true };
        }
        if (p.mode === 'trunk') {
            if (p.allowed.indexOf(vlan) < 0) {
                return { ok: false, layer: 2, device: pos.sw,
                    reason: 'trunk ' + pos.port + ' does not allow VLAN ' + vlan };
            }
            return { ok: true };
        }
        return { ok: false, layer: 2, device: pos.sw, reason: pos.port + ' is a routed port, not in any VLAN' };
    }

    /* Trunk links between two switches, as an adjacency list. Rebuilt per call rather than cached:
     * stage 3's faults mutate ports and links, and a cache that the gated thing writes to is the
     * shape of bug this repo has been bitten by before, and the graph is small enough that
     * rebuilding costs nothing. */
    /* IS THIS DEVICE A SWITCH? Answered from PORT_PLAN, which is the authoritative list of devices
     * with access ports, and NOT from "does state.ports have an entry for it".
     *
     * That proxy was the original implementation and it broke silently the moment routed interfaces
     * gained port records: the router uplink SW-01 Fa0/24 started qualifying as an inter-switch
     * trunk, and the MAC table began reporting floor-2 hosts on Fa0/24 instead of Gi0/1 while every
     * other assertion stayed green. A proxy for identity is a defect waiting for an unrelated
     * change to fire it. */
    function isSwitch(dev) { return Object.prototype.hasOwnProperty.call(TOPO.PORT_PLAN, dev); }

    function switchAdjacency(state) {
        var adj = {};
        state.links.forEach(function (l) {
            if (l.kind !== 'trunk') return;
            if (!isSwitch(l.a[0]) || !isSwitch(l.b[0])) return;   // router uplink, not switch-to-switch
            (adj[l.a[0]] = adj[l.a[0]] || []).push({ to: l.b[0], link: l, near: l.a[1], far: l.b[1] });
            (adj[l.b[0]] = adj[l.b[0]] || []).push({ to: l.a[0], link: l, near: l.b[1], far: l.a[1] });
        });
        return adj;
    }

    /* A packet in `vlan` from one layer-2 position to another. Returns the switch-by-switch route so
     * the MAC-table builder can say which port a remote MAC is learned on. */
    function l2Path(state, from, to, vlan) {
        var c = portCarries(state, from, vlan);
        if (!c.ok) return { ok: false, layer: c.layer, device: c.device, reason: c.reason };
        c = portCarries(state, to, vlan);
        if (!c.ok) return { ok: false, layer: c.layer, device: c.device, reason: c.reason };
        if (from.sw === to.sw) return { ok: true, route: [{ sw: from.sw, inPort: from.port, outPort: to.port }] };

        var adj = switchAdjacency(state);
        var queue = [{ sw: from.sw, path: [] }], seen = {}, lastFail = null;
        seen[from.sw] = true;
        while (queue.length) {
            var cur = queue.shift();
            var edges = adj[cur.sw] || [];
            for (var i = 0; i < edges.length; i++) {
                var e = edges[i];
                if (seen[e.to]) continue;
                /* No link.up check here any more: `up` and `errorRate` live on the two PORTS, and
                 * portCarries below inspects both ends, so a dead cable is caught as a layer-1
                 * failure on whichever end is actually down.
                 *
                 * BOTH ENDS must allow the VLAN. A one-sided allowed list is a real misconfiguration
                 * and is exactly what S3's evidence shows, so checking only the near end would make
                 * half of S3's variants invisible. */
                var n = portCarries(state, { sw: cur.sw, port: e.near }, vlan);
                if (!n.ok) { lastFail = n; continue; }
                var f = portCarries(state, { sw: e.to, port: e.far }, vlan);
                if (!f.ok) { lastFail = f; continue; }
                seen[e.to] = true;
                var path = cur.path.concat([{ sw: cur.sw, outPort: e.near, nextSw: e.to, inPort: e.far }]);
                if (e.to === to.sw) {
                    return { ok: true, route: path.concat([{ sw: to.sw, inPort: e.far, outPort: to.port }]) };
                }
                queue.push({ sw: e.to, path: path });
            }
        }
        return lastFail
            ? { ok: false, layer: lastFail.layer, device: lastFail.device, reason: lastFail.reason }
            : { ok: false, layer: 2, device: from.sw, reason: 'no layer-2 path from ' + from.sw + ' to ' + to.sw + ' in VLAN ' + vlan };
    }

    /* Which port on `toSw` traffic from `fromSw` in `vlan` arrives on, or null if no path exists.
     * BFS over switch-to-switch trunks only, so the answer is the real ingress port. */
    function trunkIngress(state, fromSw, toSw, vlan) {
        if (fromSw === toSw) return null;
        var adj = switchAdjacency(state);
        var queue = [fromSw], seen = {}, arrivedOn = {};
        seen[fromSw] = true;
        while (queue.length) {
            var cur = queue.shift();
            var edges = adj[cur] || [];
            for (var i = 0; i < edges.length; i++) {
                var e = edges[i];
                if (seen[e.to]) continue;
                if (!portCarries(state, { sw: cur, port: e.near }, vlan).ok) continue;
                if (!portCarries(state, { sw: e.to, port: e.far }, vlan).ok) continue;
                seen[e.to] = true;
                arrivedOn[e.to] = e.far;
                if (e.to === toSw) return e.far;
                queue.push(e.to);
            }
        }
        return arrivedOn[toSw] || null;
    }

    /* ═══ 4. NODE INDEX ═══════════════════════════════════════════════════════════════════════════
     * Every addressable thing, by name and by IP. A device owns SEVERAL addresses (the router owns
     * one per sub-interface plus the transit link), so the IP index maps to {node, iface, vlan} and
     * not merely to a node — reach() needs the ingress interface to evaluate ACLs and the reverse
     * path, and "which interface received this" has no answer at node granularity. */
    var OUTSIDE = 'OUTSIDE';
    var PUBLIC_SITE = '93.184.216.34';

    /* ═══ SAFE ACCESS BY A KEY SOMEONE ELSE CHOSE ════════════════════════════════════════════════
     *
     * Lives HERE, in the module every other one already requires, because the first version lived in
     * netfinal-gui.js and that is exactly how the next instance happened: the dispatch-confusion
     * CRITICAL was fixed in gui.js and core.js, the commit said "fixed at the root, not the edge",
     * and `restoreDevice` in netfinal-faults.js -- same defect, same family, one file over -- was
     * never touched. A single `netfinalRestore` with `device:'__proto__'` then added three
     * enumerable properties to the SHARED `Object.prototype` for the life of the warm instance,
     * because `deviceConfigs['__proto__']` is truthy and the assignments two lines later resolved
     * `state.devices['__proto__']` the same way. `for (var k in {})` on a brand-new object yielded
     * ['snmp','ntp','files'], in whatever process was also serving other students.
     *
     * One definition, required by everything, is the only version of this fix that does not have a
     * next instance.
     *
     * `own` reads only an own property. `setOwn` refuses to WRITE a key that would reach the
     * prototype at all -- an assignment with `__proto__` replaces an object's prototype rather than
     * adding a key, which is a different failure from a read and needs its own guard. */
    var UNSAFE_WRITE_KEYS = ['__proto__', 'prototype', 'constructor'];

    function own(obj, key) {
        if (obj === null || obj === undefined) { return undefined; }
        if (typeof key !== 'string' && typeof key !== 'number') { return undefined; }
        return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
    }

    function setOwn(obj, key, value) {
        if (obj === null || obj === undefined || typeof obj !== 'object') { return false; }
        if (typeof key !== 'string' && typeof key !== 'number') { return false; }
        if (UNSAFE_WRITE_KEYS.indexOf(String(key)) >= 0) { return false; }
        /* An ARRAY target with key 'length' is not a prototype attack, but it truncates or extends
         * the array through ordinary JS semantics -- so a future call site pointing setOwn at an
         * array with a client-chosen key would get a silent data loss rather than a refusal. No
         * current call site targets an array; this is the audit's forward-looking note, taken now
         * because it is one line and the alternative is finding out. */
        if (Array.isArray(obj) && String(key) === 'length') { return false; }
        obj[key] = value;
        return true;
    }

    function buildIndex(state) {
        /* PROTOTYPE-LESS ON PURPOSE. These two maps are looked up with user-supplied strings in about
         * twenty places -- `ssh <name>`, `ping <addr>`, `nodeOf`, every hop in `reach()` -- and a
         * plain object answers `constructor`, `__proto__`, `toString` and `valueOf` from its
         * prototype chain. Fixing it here fixes every consumer at once, which is the right level:
         * the alternative was an own-property guard at each call site, and the one that got missed
         * would be the one someone found. The dispatch tables in netfinal-gui.js had exactly that
         * defect and it cost the whole answer key. */
        var byName = Object.create(null), byIp = Object.create(null);
        var reg = function (node) {
            byName[node.name.toUpperCase()] = node;
            (node.addresses || []).forEach(function (a) {
                if (a.ip) byIp[a.ip] = { node: node, iface: a.iface, vlan: a.vlan === undefined ? null : a.vlan };
            });
        };

        state.endpoints.forEach(function (e) {
            var vlan = e.vlanEffective || e.vlan;
            reg({
                name: e.name, kind: 'host', endpoint: e, vlan: vlan,
                ip: e.ip, mask: e.mask, gw: e.gw, dns: e.dns, mac: e.mac,
                attach: l2Position(state, e, vlan), network: e.network || null,
                addresses: [{ ip: e.ip, iface: 'nic', vlan: vlan }]
            });
        });

        var rtrAddrs = Object.keys(state.svis).map(function (v) {
            var s = state.svis[v];
            return { ip: s.ip, iface: s.iface, vlan: Number(v) };
        });
        rtrAddrs.push({ ip: TOPO.FIXED_NETS.transit.rtr, iface: 'Gi0/1', vlan: null });
        reg({
            name: 'MeridianRTR-01', kind: 'router', vlan: null, dns: state.dns.server,
            attach: { sw: 'MeridianSW-01', port: 'Fa0/24' }, addresses: rtrAddrs,
            ip: state.devices['MeridianRTR-01'].mgmtIp
        });
        reg({
            name: 'MER-FW01', kind: 'firewall', vlan: null, dns: state.dns.server, attach: null,
            ip: TOPO.FIXED_NETS.transit.fw,
            addresses: [
                { ip: TOPO.FIXED_NETS.transit.fw, iface: 'LAN', vlan: null },
                { ip: TOPO.FIXED_NETS.dmz.fw, iface: 'DMZ', vlan: null },
                { ip: state.params.wan.fwIp, iface: 'WAN', vlan: null }
            ]
        });
        ['MeridianSW-01', 'MeridianSW-02', 'MER-WLC01', 'MER-SRV01', 'MER-NOC01', 'MER-WEB01'].forEach(function (id) {
            var d = state.devices[id];
            if (!d) return;
            var at = TOPO.DEVICE_ATTACH[id];
            reg({
                name: id, kind: 'host', vlan: at.self ? 99 : (at.vlan || null), dns: state.dns.server,
                ip: d.mgmtIp, mask: d.mask || null, gw: d.gw || null, mac: d.mac || null,
                attach: d.attach || null, network: at.net || null,
                addresses: [{ ip: d.mgmtIp, iface: at.self ? 'Vlan99' : 'eth0', vlan: at.self ? 99 : (at.vlan || null) }]
            });
        });
        /* The ISP and a host on the public internet. Synthetic, with no layer-2 position: a path to
         * them exists or does not depending entirely on routing and NAT, which is the point. */
        reg({ name: 'ISP', kind: 'isp', vlan: null, attach: null, ip: state.params.wan.ispIp,
              addresses: [{ ip: state.params.wan.ispIp, iface: 'edge', vlan: null }] });
        reg({ name: OUTSIDE, kind: 'outside', vlan: null, attach: null, ip: '198.51.100.77', dns: '1.1.1.1',
              addresses: [{ ip: '198.51.100.77', iface: 'wan', vlan: null }] });
        reg({ name: 'PUBLIC-SITE', kind: 'outside', vlan: null, attach: null, ip: PUBLIC_SITE,
              addresses: [{ ip: PUBLIC_SITE, iface: 'wan', vlan: null }] });

        return { byName: byName, byIp: byIp };
    }

    /* Is this address inside the lab at all? Anything else is "the internet", which the firewall
     * must NAT toward and which answers nothing without a route. */
    function isInternal(state, ipInt) {
        var nets = [state.params.transit.parsed, state.params.dmz.parsed, state.params.branch.parsed];
        Object.keys(state.subnets).forEach(function (v) { nets.push(state.subnets[v].parsed); });
        for (var i = 0; i < nets.length; i++) { if (inNet(ipInt, nets[i])) return true; }
        return false;
    }

    function routeLookup(state, device, ipInt) {
        var rs = state.routes[device] || [], best = null;
        for (var i = 0; i < rs.length; i++) {
            if (networkOf(ipInt, rs[i].prefix) === rs[i].dest && (!best || rs[i].prefix > best.prefix)) best = rs[i];
        }
        return best;
    }

    function aclVerdict(state, device, iface, dir, srcIp, dstIp, proto, port) {
        var sets = state.acls[device] || {};
        var names = Object.keys(sets);
        for (var i = 0; i < names.length; i++) {
            var acl = sets[names[i]];
            var applies = acl.applied.some(function (a) { return a.iface === iface && a.dir === dir; });
            if (!applies) continue;
            for (var j = 0; j < acl.lines.length; j++) {
                var ln = acl.lines[j];
                if (ln.proto !== 'ip' && ln.proto !== proto) continue;
                if (ln.src !== 'any' && !inNet(ipToInt(srcIp), parseCidr(ln.src))) continue;
                if (ln.dst !== 'any' && !inNet(ipToInt(dstIp), parseCidr(ln.dst))) continue;
                if (ln.dstPort !== undefined && ln.dstPort !== null && ln.dstPort !== port) continue;
                /* First match wins, and that IS the lesson of S8A — an ACL is not a set of rules,
                 * it is an ordered list, and a permit above a deny makes the deny dead code. */
                return { permit: ln.action === 'permit', acl: acl.name, seq: ln.seq };
            }
            return { permit: false, acl: acl.name, seq: 'implicit', reason: 'implicit deny at end of ' + acl.name };
        }
        return { permit: true, acl: null };
    }

    /* ═══ 5. reach() ══════════════════════════════════════════════════════════════════════════════
     * The function every command and every grader reads from (spec section 5). Walks layer 1, then
     * 2, then 3, then policy, then the service — and reports the FIRST layer that stopped it, which
     * is what makes `tracert` honest evidence instead of a yes/no.
     *
     * `failedAt.layer` IS NOT the fault catalog's layer. This one is mechanical: where the packet
     * actually stopped. The catalog's per-variant layer (netfinal-topology.js FAULT_SLOTS) is the
     * GRADED answer a student types into the incident log. They usually agree and sometimes will
     * not — S8B blocks TCP 445 by ACL, so reach() stops at policy while the graded answer is 4.
     * Conflating them would make the grader read a diagnostic as an answer key. */
    var MAX_HOPS = 16;

    function fail(layer, device, reason, hops, extra) {
        var r = { ok: false, hops: hops || [], failedAt: { layer: layer, device: device, reason: reason } };
        if (extra) { Object.keys(extra).forEach(function (k) { r.failedAt[k] = extra[k]; }); }
        return r;
    }

    /* Whether the destination answers on this port. A node out on the internet always answers:
     * the exam never asks whether a remote website is up, and treating a public address as closed
     * would report a NAT or routing fault as a dead remote service -- misattributing the layer,
     * which is the one thing reach() exists to get right. Everything inside the lab is checked
     * against its declared listeners, so a closed internal port still fails at layer 4. */
    function serviceOpen(state, node, proto, port) {
        if (port === null || port === undefined || proto === 'icmp') return true;
        if (node.kind === 'outside' || node.kind === 'isp') return true;
        var s = state.services[node.name];
        if (!s) return false;
        return (s[proto] || []).indexOf(port) >= 0;
    }

    function resolveName(state, idx, srcNode, name) {
        var dnsIp = srcNode.dns || state.dns.server;
        if (!dnsIp) return { ok: false, reason: 'no resolver configured on ' + srcNode.name };
        var isLocal = new RegExp('\\.' + state.dns.origin.replace('.', '\\.') + '$', 'i').test(name);

        var r = reachIp(state, idx, srcNode, dnsIp, 'udp', 53, 1);
        if (!r.ok) return { ok: false, reason: 'resolver ' + dnsIp + ' unreachable', inner: r };

        if (state.dns.externalResolvers.indexOf(dnsIp) >= 0) {
            /* A public resolver has never heard of meridian.local. This is the correct, intended
             * behaviour for guests, not a fault: it is why a guest ACL that denies guest-to-internal
             * does not break guest browsing (spec section 6). */
            return isLocal
                ? { ok: false, reason: 'NXDOMAIN: ' + name + ' is not known to the public resolver ' + dnsIp }
                : { ok: true, ip: PUBLIC_SITE, via: dnsIp };
        }
        if (!isLocal) {
            /* The internal resolver forwards. Forwarding needs its OWN path to the internet, so a
             * NAT rule missing for the Servers VLAN would break public name resolution for everyone
             * — a dependency worth having, because students are expected to reason about it. */
            var srv = idx.byIp[dnsIp];
            if (!srv) return { ok: false, reason: 'no host answers at resolver address ' + dnsIp };
            var fwd = reachIp(state, idx, srv.node, PUBLIC_SITE, 'udp', 53, 1);
            return fwd.ok
                ? { ok: true, ip: PUBLIC_SITE, via: dnsIp + ' (forwarded)' }
                : { ok: false, reason: 'resolver ' + dnsIp + ' cannot reach the internet to forward', inner: fwd };
        }
        var short = name.replace(new RegExp('\\.' + state.dns.origin.replace('.', '\\.') + '$', 'i'), '');
        /* Queries read `loaded`, never `zoneFile`. A record edited on disk and not reloaded is
         * invisible — that is S10B, and it only exists because these are two separate copies. */
        var rec = state.dns.loaded.records.filter(function (x) {
            return x.name.toLowerCase() === short.toLowerCase() && x.type === 'A';
        })[0];
        return rec ? { ok: true, ip: rec.target, via: dnsIp, serial: state.dns.loaded.serial }
                   : { ok: false, reason: 'NXDOMAIN: no A record for ' + short + ' in the loaded zone' };
    }

    function reach(state, src, dst, opts) {
        opts = opts || {};
        var idx = buildIndex(state);
        var srcNode = idx.byName[String(src).toUpperCase()];
        if (!srcNode) return fail(0, null, 'unknown source "' + src + '"');

        var dstIp = dst, nameHop = null;
        if (ipToInt(dst) === null) {
            var res = resolveName(state, idx, srcNode, String(dst));
            if (!res.ok) return fail(7, srcNode.dns || state.dns.server, res.reason, [], { query: String(dst) });
            dstIp = res.ip;
            nameHop = { name: String(dst), answer: res.ip, via: res.via };
        }
        var out = reachIp(state, idx, srcNode, dstIp, opts.proto || 'icmp',
                          opts.port === undefined ? null : opts.port, 0);
        if (nameHop) out.dns = nameHop;
        return out;
    }

    /* `depth` is carried for call-site clarity -- 0 for a student's own path, 1 for a lookup made
     * on behalf of name resolution -- and NOT as a recursion guard. There is no recursion to guard:
     * reach() calls resolveName, resolveName calls reachIp, and reachIp never calls resolveName.
     * The earlier `if (depth > 3)` line could not fire and only looked load-bearing. Routing loops
     * are bounded by MAX_HOPS inside forwardFrom, which is where the real risk is. */
    function reachIp(state, idx, srcNode, dstIp, proto, port, depth) {
        var hops = [];
        var dstInt = ipToInt(dstIp);
        if (dstInt === null) return fail(3, srcNode.name, 'malformed destination address "' + dstIp + '"');

        var srcIp = srcNode.ip;
        if (!srcIp) return fail(3, srcNode.name, srcNode.name + ' has no IP address');
        if (/^169\.254\./.test(srcIp)) {
            return fail(3, srcNode.name, srcNode.name + ' holds a link-local 169.254 address: no DHCP lease');
        }
        hops.push({ n: 1, device: srcNode.name, iface: 'nic', ip: srcIp, action: 'origin' });

        /* ── same subnet: layer 1 and 2 only, no router involved ────────────────────────────────── */
        var srcPrefix = srcNode.mask ? maskToPrefix(srcNode.mask) : null;
        var ownNet = srcPrefix !== null ? { net: networkOf(ipToInt(srcIp), srcPrefix), prefix: srcPrefix } : null;
        var dstEntry = idx.byIp[dstIp];

        if (ownNet && inNet(dstInt, ownNet)) {
            if (!dstEntry) return fail(3, srcNode.name, 'no host answers at ' + dstIp + ' in the local subnet');
            var lp = l2Deliver(state, idx, srcNode, dstEntry, srcNode.vlan);
            if (!lp.ok) return fail(lp.layer, lp.device, lp.reason, hops);
            hops.push({ n: 2, device: dstEntry.node.name, iface: dstEntry.iface, ip: dstIp, action: 'deliver (same subnet)' });
            return finish(state, idx, dstEntry, dstIp, proto, port, hops);
        }

        /* ── off-subnet: the gateway must exist, be on-subnet, and answer ───────────────────────── */
        var gw = srcNode.gw;
        if (srcNode.kind === 'router' || srcNode.kind === 'firewall') {
            return forwardFrom(state, idx, srcNode.name, null, srcIp, dstIp, proto, port, hops);
        }
        if (srcNode.kind === 'outside') {
            return forwardFrom(state, idx, 'MER-FW01', 'WAN', srcIp, dstIp, proto, port, hops);
        }
        if (!gw) return fail(3, srcNode.name, srcNode.name + ' has no default gateway configured');
        if (ownNet && !inNet(ipToInt(gw), ownNet)) {
            return fail(3, srcNode.name, 'gateway ' + gw + ' is not inside ' + intToIp(ownNet.net) + '/' + ownNet.prefix, hops);
        }
        var gwEntry = idx.byIp[gw];
        if (!gwEntry) {
            /* The exact shape of S5B: clients are handed .1 as the gateway and the sub-interface
             * answers on .254, so an ARP for the gateway goes unanswered. */
            return fail(3, srcNode.name, 'no device answers for gateway ' + gw + ' (ARP unresolved)', hops);
        }
        var gl = l2Deliver(state, idx, srcNode, gwEntry, srcNode.vlan);
        if (!gl.ok) return fail(gl.layer, gl.device, gl.reason, hops);
        hops.push({ n: hops.length + 1, device: gwEntry.node.name, iface: gwEntry.iface, ip: gw, action: 'gateway' });
        return forwardFrom(state, idx, gwEntry.node.name, gwEntry.iface, srcIp, dstIp, proto, port, hops);
    }

    /* Deliver inside one VLAN, resolving the destination's layer-2 position. */
    function l2Deliver(state, idx, srcNode, dstEntry, vlan) {
        var from = srcNode.attach, to = dstEntry.node.attach;
        if (dstEntry.node.kind === 'router' && dstEntry.vlan) {
            to = state.svis[dstEntry.vlan] ? state.svis[dstEntry.vlan].attach : to;
            if (state.svis[dstEntry.vlan] && state.svis[dstEntry.vlan].shutdown) {
                return { ok: false, layer: 3, device: 'MeridianRTR-01', reason: state.svis[dstEntry.vlan].iface + ' is administratively down' };
            }
        }
        /* Nodes with no switch port (firewall, DMZ server, ISP) are on routed segments; there is no
         * layer-2 question to answer for them, so the path is decided entirely by routing. */
        if (!from || !to) return { ok: true, routed: true };
        return l2Path(state, from, to, vlan);
    }

    /* The physical state of a ROUTED interface, which has no VLAN and so never passes through
     * portCarries. A sub-interface resolves to its parent: Gi0/0.30 rides on Gi0/0, so the router's
     * physical uplink going down must take every VLAN with it rather than none.
     * An interface with no port record (ipsec0, a tunnel) has nothing physical to check. */
    function physOk(state, device, iface) {
        if (!iface) return { ok: true };
        var parent = String(iface).split('.')[0];
        var p = state.ports[device] && (state.ports[device][iface] || state.ports[device][parent]);
        if (!p) return { ok: true };
        if (p.shutdown) return { ok: false, reason: iface + ' is administratively down' };
        if (p.up === false) return { ok: false, reason: iface + ' has no link (cable down)' };
        if (p.errorRate >= 1) return { ok: false, reason: iface + ' error rate is total: no frames pass' };
        return { ok: true };
    }

    function forwardFrom(state, idx, device, ingressIface, srcIp, dstIp, proto, port, hops) {
        var dstInt = ipToInt(dstIp), srcInt = ipToInt(srcIp);
        var natApplied = null;

        for (var step = 0; step < MAX_HOPS; step++) {
            if (ingressIface) {
                var pIn = physOk(state, device, ingressIface);
                if (!pIn.ok) return fail(1, device, pIn.reason, hops);
                var vIn = aclVerdict(state, device, ingressIface, 'in', srcIp, dstIp, proto, port);
                if (!vIn.permit) {
                    return fail(4, device, 'denied inbound by ' + vIn.acl + ' seq ' + vIn.seq, hops,
                                { acl: vIn.acl, seq: vIn.seq });
                }
                /* THE REVERSE-PATH CHECK, and the reason it is here rather than as a nicety: spec
                 * section 5 step 3 requires "the return route exists", and S5A is unreachable
                 * without it. Under S5A the sub-interface mask is /25 while a guest at .150 has /24,
                 * so the packet arrives fine and the router has no way back — its connected route no
                 * longer covers the source. Checking only "is there A route" would match the default
                 * route and S5A would silently pass. The route back must leave by the interface the
                 * packet arrived on. */
                var back = routeLookup(state, device, srcInt);
                if (!back) return fail(3, device, 'no return route to ' + srcIp, hops);
                if (back.iface !== ingressIface) {
                    return fail(3, device, 'return path to ' + srcIp + ' is via ' + back.iface +
                        ', not the ingress interface ' + ingressIface + ' (source is outside that interface’s subnet)', hops);
                }
            }

            var route = routeLookup(state, device, dstInt);
            if (!route) return fail(3, device, 'no route to ' + dstIp, hops);

            var pOut = physOk(state, device, route.iface);
            if (!pOut.ok) return fail(1, device, pOut.reason, hops);
            var vOut = aclVerdict(state, device, route.iface, 'out', srcIp, dstIp, proto, port);
            if (!vOut.permit) {
                return fail(4, device, 'denied outbound by ' + vOut.acl + ' seq ' + vOut.seq, hops,
                            { acl: vOut.acl, seq: vOut.seq });
            }

            /* ── firewall policy: NAT outbound, IPsec, port forwards ────────────────────────────── */
            if (device === 'MER-FW01') {
                if (route.iface === 'ipsec0') {
                    if (!state.ipsec.tunnelUp) return fail(3, device, 'IPsec tunnel is down', hops);
                    var covered = state.ipsec.phase2.some(function (p) {
                        return inNet(srcInt, parseCidr(p.local)) && inNet(dstInt, parseCidr(p.remote));
                    });
                    if (!covered) {
                        return fail(3, device, 'no IPsec phase-2 entry covers ' + srcIp + ' to ' + dstIp, hops);
                    }
                } else if (route.iface === 'WAN' && !isInternal(state, dstInt)) {
                    var rule = state.nat.outbound.filter(function (r) { return inNet(srcInt, parseCidr(r.src)); })[0];
                    if (!rule && isInternal(state, srcInt)) {
                        return fail(4, device, 'no outbound NAT rule matches source ' + srcIp, hops);
                    }
                    if (rule) { natApplied = { from: srcIp, to: state.params.wan.fwIp }; }
                }
                if (ingressIface === 'WAN' && dstIp === state.params.wan.fwIp) {
                    /* Inbound from the internet to the public address: only a port forward lets it in. */
                    var pf = state.nat.portForwards.filter(function (f) { return f.wanPort === port && f.proto === proto; })[0];
                    if (!pf) return fail(4, device, 'no port forward for ' + proto + '/' + port + ' on the WAN address', hops);
                    hops.push({ n: hops.length + 1, device: device, iface: 'DMZ', ip: pf.toIp, action: 'port forward ' + proto + '/' + port });
                    var tgt = idx.byIp[pf.toIp];
                    if (!tgt) return fail(3, device, 'port forward targets ' + pf.toIp + ', where no host answers', hops);
                    return finish(state, idx, tgt, pf.toIp, proto, pf.toPort, hops);
                }
            }

            /* ── connected: deliver ─────────────────────────────────────────────────────────────── */
            if (route.kind === 'connected') {
                var entry = idx.byIp[dstIp];
                if (!entry) return fail(3, device, 'no host answers at ' + dstIp + ' on ' + route.iface, hops);
                if (route.vlan) {
                    var svi = state.svis[route.vlan];
                    if (svi.shutdown) return fail(3, device, svi.iface + ' is administratively down', hops);
                    var dl = l2Deliver(state, idx, { attach: svi.attach, vlan: route.vlan, name: device }, entry, route.vlan);
                    if (!dl.ok) return fail(dl.layer, dl.device, dl.reason, hops);
                }
                hops.push({ n: hops.length + 1, device: entry.node.name, iface: entry.iface, ip: dstIp, action: 'deliver' });
                var r = finish(state, idx, entry, dstIp, proto, port, hops);
                if (natApplied) r.nat = natApplied;
                return r;
            }

            /* ── the branch, across the tunnel ──────────────────────────────────────────────────── */
            if (route.iface === 'ipsec0') {
                var bEntry = idx.byIp[dstIp];
                if (!bEntry) return fail(3, device, 'no host answers at ' + dstIp + ' across the tunnel', hops);
                hops.push({ n: hops.length + 1, device: bEntry.node.name, iface: 'ipsec0', ip: dstIp, action: 'deliver (IPsec)' });
                return finish(state, idx, bEntry, dstIp, proto, port, hops);
            }

            /* ── static: follow the next hop ────────────────────────────────────────────────────── */
            var nh = route.nextHop;
            if (!nh) return fail(3, device, 'route to ' + dstIp + ' via ' + route.iface + ' has no next hop', hops);
            var connected = (state.routes[device] || []).filter(function (x) {
                return x.kind === 'connected' && networkOf(ipToInt(nh), x.prefix) === x.dest;
            })[0];
            if (!connected) {
                /* S6A exactly: a leftover static route whose next hop 172.16.0.6 is not even inside
                 * the 172.16.0.0/30 transit link, so nothing can be sent to it. */
                return fail(3, device, 'next hop ' + nh + ' is not on any connected subnet of ' + device, hops);
            }
            var nhEntry = idx.byIp[nh];
            if (!nhEntry) return fail(3, device, 'next hop ' + nh + ' does not answer (dead next hop)', hops);

            hops.push({ n: hops.length + 1, device: nhEntry.node.name, iface: nhEntry.iface, ip: nh, action: 'forward' });
            if (nhEntry.node.kind === 'isp') {
                if (!isInternal(state, dstInt)) {
                    var dEntry = idx.byIp[dstIp];
                    hops.push({ n: hops.length + 1, device: dEntry ? dEntry.node.name : 'internet', iface: 'wan', ip: dstIp, action: 'deliver (internet)' });
                    var ir = dEntry ? finish(state, idx, dEntry, dstIp, proto, port, hops)
                                    : { ok: true, hops: hops, failedAt: null };
                    if (natApplied) ir.nat = natApplied;
                    return ir;
                }
                return fail(3, 'ISP', 'the ISP has no route back into ' + dstIp, hops);
            }
            device = nhEntry.node.name;
            ingressIface = nhEntry.iface;
        }
        return fail(3, device, 'hop limit reached: routing loop', hops);
    }

    function finish(state, idx, dstEntry, dstIp, proto, port, hops) {
        if (!serviceOpen(state, dstEntry.node, proto, port)) {
            return fail(4, dstEntry.node.name, dstEntry.node.name + ' is not listening on ' + proto + '/' + port, hops);
        }
        return { ok: true, hops: hops, failedAt: null };
    }

    /* ═══ 6. DERIVED TABLES ═══════════════════════════════════════════════════════════════════════
     * Never stored (spec section 5: "Tables are never stored; they are computed from config and
     * endpoints each time a command runs"). That is not tidiness — a stored table is a second copy
     * of the truth, and a student who fixes a trunk and still sees the old MAC table has been told a
     * lie by the lab. Every function here reads config and recomputes. */
    var tables = {
        macTable: function (state, sw) {
            var rows = [], adj = switchAdjacency(state);
            var all = state.endpoints.concat(Object.keys(state.devices).map(function (id) {
                var d = state.devices[id];
                return d.attach ? { name: id, mac: d.mac, vlan: TOPO.DEVICE_ATTACH[id].vlan, attach: d.attach } : null;
            }).filter(Boolean));
            all.forEach(function (e) {
                var vlan = e.vlanEffective || e.vlan;
                if (!vlan) return;
                var pos = e.attach || l2Position(state, e, vlan);
                if (!pos) return;
                if (pos.sw === sw) {
                    var c = portCarries(state, pos, vlan);
                    if (c.ok) rows.push({ vlan: vlan, mac: e.mac, type: 'DYNAMIC', port: pos.port });
                    return;
                }
                /* Learned across a trunk: the MAC appears on the port the traffic ARRIVES on, so
                 * the port is taken from the actual switch-to-switch path rather than by trying
                 * each trunk port until one happens to carry the VLAN. The latter picks whichever
                 * edge is enumerated first, which put floor-2 hosts on the router uplink. */
                var hop = trunkIngress(state, pos.sw, sw, vlan);
                if (hop) rows.push({ vlan: vlan, mac: e.mac, type: 'DYNAMIC', port: hop });
            });
            /* A placed rogue appears like any other host. Both S4 variants end with the student
             * locating this MAC on a port and shutting it, so the MAC table is where the hunt
             * lands and the row has to be real rather than narrated. */
            if (state.rogue && state.rogue.placed
                && !((state.ports[state.rogue.switch] || {})[state.rogue.port] || {}).shutdown) {
                var rg = state.rogue;
                if (rg.switch === sw) {
                    rows.push({ vlan: rg.vlan, mac: rg.mac, type: 'DYNAMIC', port: rg.port, rogue: true });
                } else {
                    var rhop = trunkIngress(state, rg.switch, sw, rg.vlan);
                    if (rhop) rows.push({ vlan: rg.vlan, mac: rg.mac, type: 'DYNAMIC', port: rhop, rogue: true });
                }
            }
            return rows.sort(function (a, b) { return a.vlan - b.vlan || (a.mac < b.mac ? -1 : 1); });
        },

        arpTable: function (state, device) {
            var idx = buildIndex(state), rows = [];
            var node = idx.byName[device.toUpperCase()];
            if (!node) return rows;
            (node.addresses || []).forEach(function (a) {
                if (!a.ip || !a.vlan) return;
                var sub = state.subnets[a.vlan];
                if (!sub) return;
                state.endpoints.forEach(function (e) {
                    if (!e.ip || !inNet(ipToInt(e.ip), sub.parsed)) return;
                    var vlan = e.vlanEffective || e.vlan;
                    var pos = l2Position(state, e, vlan);
                    var svi = state.svis[a.vlan];
                    if (!pos || !svi) return;
                    if (l2Path(state, pos, svi.attach, vlan).ok) {
                        rows.push({ ip: e.ip, mac: e.mac, iface: a.iface, vlan: a.vlan, age: null });
                    }
                });
            });
            /* A HOST's cache must show its GATEWAY. Without this row `arp -a` on ADMIN-WS01 lists
             * only peers, and S4A's primary evidence -- the gateway address mapping to the rogue's
             * MAC -- has nowhere to appear. */
            if (node.gw && node.kind === 'host') {
                var gwVlan = node.vlan, gsvi = state.svis[gwVlan];
                if (gsvi && gsvi.ip === node.gw) {
                    rows.push({ ip: node.gw, mac: gsvi.mac, iface: 'nic', vlan: gwVlan, gateway: true });
                }
            }
            /* A placed rogue claims an address. S4A ('arp-spoof') REPLACES the legitimate mapping,
             * which is why connectivity survives but the victim talks to the rogue first. S4B
             * ('duplicate-address') leaves BOTH rows present, which is the entry the student sees
             * flipping between two MACs. */
            /* A placed rogue whose port is SHUT is unplugged, so it claims nothing. The graded fix
             * for both S4 variants is exactly that shutdown, so without this the repair could never
             * satisfy fixed() -- the spoofed row would outlive the device. */
            var rogueLive = state.rogue && state.rogue.placed
                && !((state.ports[state.rogue.switch] || {})[state.rogue.port] || {}).shutdown;
            if (rogueLive && state.rogue.claimsIp) {
                var claim = state.rogue.claimsIp;
                var mine = rows.some(function (r) { return r.ip === claim; });
                var reachesMe = (node.addresses || []).some(function (a) {
                    return a.vlan && state.subnets[a.vlan] && inNet(ipToInt(claim), state.subnets[a.vlan].parsed);
                }) || claim === node.gw;
                if (reachesMe) {
                    if (state.rogue.mode === 'arp-spoof') {
                        rows = rows.filter(function (r) { return r.ip !== claim; });
                        rows.push({ ip: claim, mac: state.rogue.mac, iface: 'nic', vlan: state.rogue.vlan, spoofed: true });
                    } else if (mine) {
                        rows.push({ ip: claim, mac: state.rogue.mac, iface: 'nic', vlan: state.rogue.vlan, duplicate: true });
                    }
                }
            }
            return rows.sort(function (x, y) { return ipToInt(x.ip) - ipToInt(y.ip); });
        },

        /* Which monitored devices the NOC can actually poll. Separates "answers ping and SSH" from
         * "accepts the NOC's community", which is the entire distinction S12A tests: the alert says
         * SW-02 is unreachable, and it is not -- the poll is being refused. */
        snmpPollStatus: function (state) {
            var idx = buildIndex(state);
            var noc = idx.byName['MER-NOC01'];
            return (state.monitoring.targets || []).map(function (id) {
                var d = state.devices[id] || {};
                var node = idx.byName[id.toUpperCase()];
                var path = (noc && node && node.ip) ? reachIp(state, idx, noc, node.ip, 'udp', 161, 0) : { ok: false };
                var communityOk = !!(d.snmp && d.snmp.community === state.monitoring.community);
                return {
                    device: id, ip: node ? node.ip : null,
                    reachable: path.ok,
                    communityMatches: communityOk,
                    polled: path.ok && communityOk,
                    reason: !path.ok ? ('unreachable: ' + (path.failedAt ? path.failedAt.reason : 'unknown'))
                          : (!communityOk ? 'SNMP community mismatch' : null)
                };
            });
        },

        /* Clock and NTP per device, for S12B, whose alert is log timestamps years out of date. */
        clockStatus: function (state, device) {
            var d = state.devices[device] || {};
            var n = d.ntp || null;
            return n ? {
                device: device, server: n.server, synchronized: n.synchronized,
                offsetSec: n.offsetSec,
                pointsAtDecommissioned: n.server === TOPO.DECOY_DIAGRAM.dnsServer
            } : null;
        },

        routeTable: function (state, device) {
            return (state.routes[device] || []).map(function (r) {
                return { dest: intToIp(r.dest), prefix: r.prefix, cidr: r.cidr, kind: r.kind,
                         nextHop: r.nextHop || null, iface: r.iface };
            }).sort(function (a, b) { return b.prefix - a.prefix || ipToInt(a.dest) - ipToInt(b.dest); });
        },

        /* Simulated sessions from endpoints whose source subnet matches an outbound rule AND whose
         * path actually reaches the firewall. A host with no NAT rule has no rows here, which is the
         * evidence S7A's ticket points the student at ("state table shows no Engineering
         * translations"), so the path check is the content, not a detail. */
        natTable: function (state) {
            var idx = buildIndex(state), rows = [];
            state.endpoints.forEach(function (e) {
                if (!e.ip || /^169\.254\./.test(e.ip)) return;
                var ei = ipToInt(e.ip);
                var rule = state.nat.outbound.filter(function (r) { return inNet(ei, parseCidr(r.src)); })[0];
                if (!rule) return;
                var node = idx.byName[e.name.toUpperCase()];
                if (!reachIp(state, idx, node, PUBLIC_SITE, 'tcp', 443, 0).ok) return;
                rows.push({ proto: 'tcp', inside: e.ip + ':49152', outside: state.params.wan.fwIp + ':49152',
                            dest: PUBLIC_SITE + ':443', host: e.name });
            });
            return rows;
        },

        dhcpLeases: function (state) {
            return state.endpoints.filter(function (e) { return e.dhcp && e.lease; }).map(function (e) {
                return { host: e.name, mac: e.mac, ip: e.ip, vlan: e.lease.vlan,
                         gateway: e.gw, dns: e.dns, pool: e.lease.pool };
            }).sort(function (a, b) { return a.vlan - b.vlan || ipToInt(a.ip) - ipToInt(b.ip); });
        },

        dnsAnswers: function (state) {
            return { serial: state.dns.loaded.serial, origin: state.dns.origin,
                     records: state.dns.loaded.records.map(function (r) {
                         return { fqdn: r.name + '.' + state.dns.origin, type: r.type, target: r.target };
                     }) };
        },

        /* `elapsedSec` is a PARAMETER, never a clock read. Spec section 5 wants counters that
         * "advance with exam time so errors visibly increase between two runs"; taking the time as
         * an argument gives exactly that while keeping the module pure and the same seed byte-
         * identical on repeated runs. The caller owns the clock. */
        interfaceCounters: function (state, device, iface, elapsedSec) {
            /* Reads the PORT, not the link. The link no longer holds physical state at all -- see
             * the construction comment in draftLab. This is what makes S1B representable on its
             * real target: a host's access-port cable on SW-02, which has a port record and never
             * had a link one. */
            var parent = String(iface).split('.')[0];
            var p = (state.ports[device] || {})[iface] || (state.ports[device] || {})[parent] || {};
            var t = Math.max(0, Math.floor(elapsedSec || 0));
            var rate = p.errorRate || 0;
            return {
                device: device, iface: iface,
                up: p.up !== false, speed: p.speed || null, duplex: p.duplex || null,
                inputErrors: Math.floor(rate * t * 7),
                crc: Math.floor(rate * t * 5),
                lateCollisions: p.duplex === 'half' ? Math.floor(t * 0.4) : 0,
                packets: 1000 + t * 120
            };
        }
    };

    /* ═══ 7. VALIDATION ═══════════════════════════════════════════════════════════════════════════
     * The four generator constraints of spec section 4, as executable checks. They are checks and
     * not comments because a constraint that lives only in prose is one nobody notices breaking:
     * this repo has shipped a top-N cap that deleted a whole course while every assertion stayed
     * green. Each returns a human-readable reason so a rejected draft says WHY it was rejected. */
    function validate(state) {
        var problems = [];
        var active = {};
        state.faults.forEach(function (f) { if (f.active) active[f.id] = true; });

        // 1. no conflict pair both active
        TOPO.CONFLICT_PAIRS.forEach(function (pair) {
            if (active[pair[0]] && active[pair[1]]) {
                problems.push('conflict pair both active: ' + pair[0] + ' and ' + pair[1]);
            }
        });

        // 2. nothing a fault touches may sever VLAN 99 or the management path
        var r = state.rogue, rp = r && state.ports[r.switch] && state.ports[r.switch][r.port];
        if (!rp) { problems.push('rogue device placed on a port that does not exist'); }
        else {
            if (rp.mode !== 'access') problems.push('rogue on ' + r.port + ', which is a ' + rp.mode + ' port: shutting it would sever a trunk');
            if (rp.vlan === 99) problems.push('rogue in VLAN 99: shutting its port would sever management');
            if (rp.shutdown) problems.push('rogue on an already-shut port ' + r.port + ': the fix would be a no-op');
        }
        /* EVERY managed device, DERIVED from the device table rather than listed by hand. The
         * hand-written list covered 6 of the 8 and silently omitted MER-FW01 and MER-WEB01, so
         * severing the router-to-firewall transit link -- which strands the firewall, the DMZ web
         * server, the internet and the branch -- left validate() reporting a clean lab. A list of
         * names is a copy of the roster that stops matching it; the roster itself cannot drift. */
        var idx = buildIndex(state);
        TOPO.DEVICES.filter(function (d) { return d.id !== 'ADMIN-WS01'; }).forEach(function (d) {
            var node = idx.byName[d.id.toUpperCase()];
            if (!node || !node.ip) { problems.push(d.id + ' has no management address'); return; }
            var res = reach(state, 'ADMIN-WS01', node.ip, { proto: 'icmp' });
            if (!res.ok) {
                problems.push('ADMIN-WS01 cannot reach ' + d.id + ' at ' + node.ip + ': ' +
                    (res.failedAt ? 'L' + res.failedAt.layer + ' ' + res.failedAt.reason : 'unknown'));
            }
        });

        // 3. ADMIN-WS01 always holds a lease, even once S9A shrinks the Sales pool
        var ws = state.endpoints.filter(function (e) { return e.name === 'ADMIN-WS01'; })[0];
        if (!ws) problems.push('ADMIN-WS01 is not in the endpoint roster');
        else {
            if (!ws.lease) problems.push('ADMIN-WS01 has no DHCP lease');
            if (ws.ip && /^169\.254\./.test(ws.ip)) problems.push('ADMIN-WS01 self-assigned a link-local address');
            if (state.dhcp.requestOrder[0] !== 'ADMIN-WS01') problems.push('ADMIN-WS01 is not first in the DHCP request order');
        }
        var salesClients = state.endpoints.filter(function (e) {
            return e.dhcp && (e.vlanEffective || e.vlan) === 10;
        }).length;
        if (salesClients - state.params.s9aShortfall < 1) {
            problems.push('S9A shortfall ' + state.params.s9aShortfall + ' would strand every Sales client including ADMIN-WS01');
        }

        // 4. every seeded address unique, and none collides with the stale diagram
        var seen = {}, decoys = {};
        decoys[TOPO.DECOY_DIAGRAM.dnsServer] = 'the diagram’s old DNS address';
        decoys[TOPO.DECOY_DIAGRAM.sw02Mgmt] = 'the diagram’s old SW-02 management address';
        var claim = function (ip, who) {
            if (!ip || /^169\.254\./.test(ip)) return;
            if (seen[ip]) problems.push('address ' + ip + ' claimed by both ' + seen[ip] + ' and ' + who);
            seen[ip] = who;
            if (decoys[ip]) problems.push('address ' + ip + ' (' + who + ') collides with ' + decoys[ip]);
        };
        state.endpoints.forEach(function (e) { claim(e.ip, e.name); });
        Object.keys(state.svis).forEach(function (v) { claim(state.svis[v].ip, state.svis[v].iface); });
        /* A device's management address is claimed only if no sub-interface already claimed it: the
         * router's management address IS its VLAN-99 sub-interface, and claiming both reported a
         * collision between one interface and itself. */
        Object.keys(state.devices).forEach(function (d) {
            var ip = state.devices[d].mgmtIp;
            if (ip && !seen[ip]) claim(ip, d);
        });
        var macs = {};
        state.endpoints.forEach(function (e) {
            if (macs[e.mac]) problems.push('MAC ' + e.mac + ' shared by ' + macs[e.mac] + ' and ' + e.name);
            macs[e.mac] = e.name;
        });

        // construction invariants the roster relies on
        state.endpoints.forEach(function (e) {
            if (e.switch && !e.port) problems.push(e.name + ' is on ' + e.switch + ' with no free port in its VLAN range');
        });
        /* Spec section 6: "Under S2A, the printer is always placed on SW-01." The printer's switch
         * is a topology constant, so the original form of this check -- gated on S2A being active
         * -- could never fire and was dead code. Ungated, it guards what actually could break:
         * someone moving the printer in the endpoint roster, which would silently invalidate S2A. */
        var printer = state.endpoints.filter(function (e) { return e.reservation; })[0];
        if (!printer) problems.push('no endpoint carries the DHCP reservation the printer needs');
        else if (printer.switch !== 'MeridianSW-01') {
            problems.push('the printer is on ' + printer.switch + ', but S2A requires it on SW-01');
        }
        var chans = state.wireless.apChannels;
        Object.keys(chans).forEach(function (ap) {
            if ([1, 6, 11].indexOf(chans[ap]) < 0) problems.push(ap + ' starts on channel ' + chans[ap] + ', outside {1,6,11}');
        });
        var used = {};
        Object.keys(chans).forEach(function (ap) {
            if (used[chans[ap]]) problems.push('APs ' + used[chans[ap]] + ' and ' + ap + ' both start on channel ' + chans[ap]);
            used[chans[ap]] = ap;
        });

        return { ok: problems.length === 0, problems: problems };
    }

    /* === 7b. THE ROGUE DEVICE (S4) =================================================================
     * Called after attachDevices, because the candidate list must exclude every port a real host or
     * managed device occupies. The fix for S4 is `shutdown` on this port, so a rogue sharing a port
     * with a legitimate device makes the CORRECT answer take that device offline -- which is how it
     * severed the path to MER-NOC01 and tripped spec constraint 2. A rogue plugs into a spare wall
     * port: realistic, and the only placement where the graded fix is harmless. */
    function placeRogue(state, rng) {
        var occupied = {};
        state.endpoints.forEach(function (e) { if (e.switch && e.port) occupied[e.switch + ' ' + e.port] = e.name; });
        Object.keys(state.devices).forEach(function (d) {
            var at = state.devices[d].attach;
            if (at) occupied[at.sw + ' ' + at.port] = d;
        });
        var cands = [];
        ['MeridianSW-01', 'MeridianSW-02'].forEach(function (sw) {
            Object.keys(state.ports[sw]).forEach(function (pn) {
                var p = state.ports[sw][pn];
                if (p.mode !== 'access' || p.shutdown) return;
                if ([10, 20, 30].indexOf(p.vlan) < 0) return;      // never VLAN 99: management
                if (occupied[sw + ' ' + pn]) return;                // never a port already in use
                cands.push({ sw: sw, port: pn, vlan: p.vlan });
            });
        });
        if (!cands.length) { state.rogue = null; return state; }    // validate() rejects the draft
        var rp = rng.pick(cands);
        var s4 = state.faults.filter(function (f) { return f.slot === 'S4'; })[0];
        var fs = state.endpoints.filter(function (e) { return e.name === 'MER-FS01'; })[0];
        state.rogue = {
            switch: rp.sw, port: rp.port, vlan: rp.vlan, mac: rng.mac(TOPO.OUI.dell),
            variant: s4 ? s4.variant : 'A',
            /* S4A claims the VLAN 10 GATEWAY (ARP spoofing). S4B claims the FILE SERVER's address
             * (a duplicate static IP, hence %IP-4-DUPADDR and an ARP entry that flips). */
            claimsIp: (s4 && s4.variant === 'B') ? (fs ? fs.ip : null) : state.subnets[10].gateway,
            mode: (s4 && s4.variant === 'B') ? 'duplicate-address' : 'arp-spoof',
            placed: false
        };
        return state;
    }

    /* ═══ 8. DEVICE ATTACHMENT ════════════════════════════════════════════════════════════════════ */
    function attachDevices(state, rng) {
        /* A managed device is also a HOST: MER-SRV01 forwards DNS, MER-NOC01 polls SNMP, the
         * switches send syslog. Each therefore needs a mask and a default gateway, and not only a
         * management address -- without them reach() cannot leave their subnet, which silently made
         * public name resolution impossible because the forwarder could not get out. Written onto
         * the state rather than inferred in buildIndex, because `ip addr` and `show ip int brief`
         * have to print the same values the path evaluator uses. */
        var staticHome = {
            'MER-SRV01': { vlan: 30 }, 'MER-NOC01': { vlan: 30 }, 'MER-WLC01': { vlan: 99 },
            'MeridianSW-01': { vlan: 99 }, 'MeridianSW-02': { vlan: 99 },
            'MER-WEB01': { net: 'dmz', gw: TOPO.FIXED_NETS.dmz.fw },
            'MER-FW01': { net: 'transit' }
        };
        Object.keys(staticHome).forEach(function (id) {
            var d = state.devices[id], h = staticHome[id];
            if (!d) return;
            if (h.vlan) { d.mask = state.subnets[h.vlan].mask; d.gw = state.subnets[h.vlan].gateway; d.vlan = h.vlan; }
            else { d.mask = state.params[h.net].mask; d.gw = h.gw || null; }
        });

        var usedPorts = {};
        state.endpoints.forEach(function (e) {
            if (e.switch && e.port) (usedPorts[e.switch] = usedPorts[e.switch] || {})[e.port] = true;
        });
        Object.keys(TOPO.DEVICE_ATTACH).forEach(function (id) {
            var at = TOPO.DEVICE_ATTACH[id], d = state.devices[id];
            if (!d) return;
            if (at.self) { d.attach = { sw: id, port: 'Vlan99' }; d.mac = rng.mac(TOPO.OUI.cisco); return; }
            if (at.routed || at.endpoint) { d.attach = null; d.mac = rng.mac(TOPO.OUI[at.oui || 'cisco']); return; }
            d.mac = rng.mac(TOPO.OUI[at.oui || 'cisco']);
            if (at.port) { d.attach = { sw: at.switch, port: 'Fa0/' + at.port }; return; }
            var cands = [];
            Object.keys(state.ports[at.switch]).forEach(function (pn) {
                var p = state.ports[at.switch][pn];
                if (p.mode === 'access' && p.vlan === at.portPool && !p.shutdown && !(usedPorts[at.switch] || {})[pn]) cands.push(pn);
            });
            if (!cands.length) { d.attach = null; return; }   // validate() rejects the draft
            d.attach = { sw: at.switch, port: rng.pick(rng.shuffle(cands)) };
            (usedPorts[at.switch] = usedPorts[at.switch] || {})[d.attach.port] = true;
        });
        return state;
    }

    /* ═══ 9. generate() ═══════════════════════════════════════════════════════════════════════════
     * The redraw loop. Each attempt uses a DIFFERENT seed string ('|r1', '|r2', ...) so attempts are
     * independent draws rather than correlated nudges, and the sequence is a pure function of
     * (studentId, examId) — so a rejected first attempt still leaves the student's lab reproducible.
     * A draft is discarded whole, never repaired, so there is no half-mutated state to reason about. */
    /* THE SEED MUST CARRY A SERVER SECRET, and this is the last moment it is free to add.
     *
     * Mallory's finding: the seed was `studentId|examId` over xmur3/mulberry32 -- no HMAC, no salt,
     * nothing a student does not already know. Their own id, and an examId shared by the class. She
     * proved the consequence by regenerating a HEALTHY lab from the same seed and diffing it against
     * the faulted one: 29 field-level differences, each one a fault site, in about thirty lines of
     * script. `ports.MeridianSW-02.Fa0/8.duplex: full -> half`, `nat.portForwards.0.toIp:
     * 172.16.50.10 -> 172.16.50.11`, and so on for every slot.
     *
     * Spec section 9 rests the whole integrity model on "seeding makes shared answers mostly
     * useless", and spec section 4 requires generate() to be re-runnable for regrading and appeal --
     * so the capability to regenerate WILL exist on some instructor surface. A zero-secret seed
     * means anyone who reaches it, or who can run this module, holds every answer.
     *
     * A secret mixed into the seed keeps reproducibility exactly where it is needed (the server has
     * the secret, so a regrade reproduces the lab byte for byte) and removes it where it is not.
     * Nothing is deployed yet, so changing the seed costs nothing today; after one student has sat
     * the exam it would invalidate their lab.
     *
     * FAIL-VISIBLE, NOT FAIL-OPEN. With no secret supplied the module still works -- tests and local
     * runs need that -- but it stamps `meta.devSeed: true`, so stage 7 can refuse to serve a lab
     * that was generated without a real secret rather than silently shipping a guessable one. */
    var DEV_SEED_SECRET = 'netfinal-dev-seed-not-for-exams';

    function seedSecret(opts) {
        if (opts && opts.secret) { return { secret: String(opts.secret), dev: false }; }
        var env = (typeof process !== 'undefined' && process.env && process.env.NETFINAL_SEED_SECRET) || null;
        if (env) { return { secret: String(env), dev: false }; }
        return { secret: DEV_SEED_SECRET, dev: true };
    }

    function generate(studentId, examId, opts) {
        var sec = seedSecret(opts);
        var attempts = [];
        for (var i = 0; i < MAX_ATTEMPTS; i++) {
            var seedStr = sec.secret + '|' + String(studentId) + '|' + String(examId) + (i ? '|r' + i : '');
            var state = draftLab(studentId, examId, seedStr);
            attachDevices(state, makeRng(seedStr + '|attach'));
            placeRogue(state, makeRng(seedStr + '|rogue'));
            resolveLeases(state);
            var v = validate(state);
            if (v.ok) {
                state.meta.attempts = i + 1;
                state.meta.rejected = attempts;
                state.meta.variantSpace = variantSpace();
                state.meta.devSeed = sec.dev;
                return state;
            }
            attempts.push({ attempt: i + 1, problems: v.problems });
        }
        var e = new Error('netfinal: no valid lab for ' + studentId + '/' + examId + ' in ' + MAX_ATTEMPTS + ' attempts');
        e.attempts = attempts;
        throw e;
    }

    var API = {
        own: own, setOwn: setOwn, UNSAFE_WRITE_KEYS: UNSAFE_WRITE_KEYS,
        generate: generate, validate: validate, reach: reach, tables: tables,
        conflictFreeCombinations: conflictFreeCombinations, variantSpace: variantSpace,
        pickFaultTarget: pickFaultTarget,
        switchAdjacency: switchAdjacency, trunkIngress: trunkIngress, physOk: physOk,
        resolveLeases: resolveLeases, attachDevices: attachDevices, placeRogue: placeRogue,
        l2Path: l2Path, l2Position: l2Position, portCarries: portCarries,
        routeLookup: routeLookup, aclVerdict: aclVerdict, buildIndex: buildIndex,
        makeRng: makeRng, ip: { toInt: ipToInt, toStr: intToIp, parseCidr: parseCidr, inNet: inNet,
                                prefixToMask: prefixToMask, maskToPrefix: maskToPrefix, networkOf: networkOf },
        constants: { MAX_ATTEMPTS: MAX_ATTEMPTS, MAX_HOPS: MAX_HOPS, OUTSIDE: OUTSIDE, PUBLIC_SITE: PUBLIC_SITE },
        topology: TOPO
    };

    if (typeof module !== 'undefined' && module.exports) { module.exports = API; }
    if (typeof window !== 'undefined') { window.NetFinalCore = API; }
})();
