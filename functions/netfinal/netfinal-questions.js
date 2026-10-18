/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-questions.js — stage 6: the 50 questions and the answer normalizers.
 *
 * Spec section 7 (the bank), section 8 (normalization, partial credit, the Q45 rubric).
 * SERVER-ONLY: every `answer()` here is the answer key.
 *
 * THE KEY IS COMPUTED AT EXAM START, which is a correctness requirement and not an optimisation.
 * Spec section 8: "Answers that depend on the starting state are graded against exam-start state.
 * Question 2 under S4A is the clearest case: the correct answer is the rogue MAC, because that is
 * what the cache held. The student reports what they found."
 *
 * At least nine questions describe the BROKEN network -- Q2's spoofed MAC, Q6's trunk list minus the
 * dropped VLAN, Q9's /25, Q10's shrunk pool, Q25's pool size. Those values change as the student
 * repairs the lab, so grading them against final state would mark the honest answer WRONG: a student
 * who correctly reported what they found and then correctly fixed it would lose both marks.
 *
 * EVERY `answer()` RETURNS FRESHLY BUILT VALUES, never a live reference into state. Chris caught
 * that one before it was written: a recorded `state.endpoints[i]` would be silently rewritten by a
 * later repair, restore or lease re-resolution, and the stored "correct" answer would change under
 * the grader. It is the same defect captureBaseline had to solve with an explicit deep clone, and
 * `buildAnswerKey` in netfinal-grade.js freezes the result for the same reason.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var TOPO = require('./netfinal-topology.js');
    var CORE = require('./netfinal-core.js');
    var FAULTS = require('./netfinal-faults.js');
    var ip = CORE.ip, tables = CORE.tables;

    /* ═══ NORMALIZERS ═════════════════════════════════════════════════════════════════════════════
     * Spec section 8's table, one function per answer kind. Each returns a CANONICAL FORM, so
     * grading is an equality test on canonical forms rather than a pile of special cases at the
     * comparison site. Every one has to accept the spec's own examples and reject a near-miss, or
     * it is lowercase-and-trim wearing a name. */
    var NORM = {};

    NORM.text = function (v) {
        return String(v === undefined || v === null ? '' : v).trim().replace(/\s+/g, ' ').toLowerCase();
    };

    /* "Leading zeros stripped; surrounding spaces ignored." */
    NORM.ipv4 = function (v) {
        var m = String(v || '').trim().match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/);
        if (!m) { return null; }
        var parts = [1, 2, 3, 4].map(function (i) { return Number(m[i]); });
        if (parts.some(function (n) { return !(n >= 0 && n <= 255); })) { return null; }
        return parts.join('.');
    };

    /* "/24 = 255.255.255.0". Canonical form is the prefix length, so either spelling compares. */
    NORM.prefix = function (v) {
        var s = String(v || '').trim();
        var slash = s.match(/\/\s*(\d{1,2})\b/);
        if (slash) {
            var n = Number(slash[1]);
            return (n >= 0 && n <= 32) ? n : null;
        }
        /* A BARE INTEGER is a prefix length. A student writing "24" is answering the question, and
         * the answer key stores prefixes as numbers -- so without this, comparing the key against
         * ITSELF failed and every two-part address question scored half. The perfect run found it,
         * which is the argument for a perfect run as an acceptance test rather than spot checks. */
        if (/^\d{1,2}$/.test(s)) {
            var bare = Number(s);
            return (bare >= 0 && bare <= 32) ? bare : null;
        }
        var dotted = NORM.ipv4(s);
        if (!dotted) { return null; }
        /* A dotted mask must be contiguous: 255.255.0.255 is not a mask, and accepting it would
         * mark a nonsense answer correct. */
        var num = ip.toInt(dotted);
        var len = ip.maskToPrefix(dotted);
        return num === ip.toInt(ip.prefixToMask(len)) ? len : null;
    };

    /* "Colons, dashes, Cisco dots, or none; any case." */
    NORM.mac = function (v) {
        var hex = String(v || '').toLowerCase().replace(/[^0-9a-f]/g, '');
        return hex.length === 12 ? hex : null;
    };

    /* "Fa0/7 = FastEthernet0/7 = fa 0/7; switch name may be omitted when only one switch has that
     * port active with that endpoint." The switch half is returned separately so a grader can
     * accept an answer that omits it. */
    NORM.iface = function (v) {
        var s = String(v || '').trim();
        var sw = null;
        var swm = s.match(/\b(Meridian(?:SW|RTR)-\d+|MER-[A-Z0-9]+)\b/i);
        if (swm) { sw = swm[1].toLowerCase(); s = s.replace(swm[0], ' '); }
        s = s.replace(/[,/]?\s*(on|interface|int|port)\s+/gi, ' ').trim();
        var norm = CORE.ip ? null : null;
        var iface = require('./netfinal-shell.js').normIface(s.replace(/\s+/g, ' ').trim());
        return { sw: sw, iface: iface ? iface.toLowerCase() : null };
    };

    /* "`.100-.150`, `10.x.10.100 - 10.x.10.150`, or `100 to 150`." Canonical form is the pair of
     * HOST octets, because that is the part every spelling agrees on. */
    NORM.range = function (v) {
        var s = String(v || '').trim();
        /* The leading-dot form ".100-.150" is the spec's FIRST listed spelling and the regex did
         * not accept it: the octet group required a digit where a bare dot appears. */
        var nums = s.match(/\.?(?:\d{1,3}\.){0,3}(\d{1,3})\s*(?:-|to|through|\u2013)\s*\.?(?:\d{1,3}\.){0,3}(\d{1,3})/i);
        if (!nums) { return null; }
        var lo = Number(nums[1]), hi = Number(nums[2]);
        if (!(lo >= 0 && lo <= 255 && hi >= 0 && hi <= 255) || hi < lo) { return null; }
        return [lo, hi];
    };

    /* "Order and spacing ignored; ranges (`10,20,40,99` = `10, 20, 40, 99`)." */
    NORM.vlanSet = function (v) {
        var s = String(v || '').trim();
        if (!s) { return null; }
        var out = {};
        s.split(/[,;\s]+/).forEach(function (part) {
            if (!part) { return; }
            var r = part.match(/^(\d+)\s*-\s*(\d+)$/);
            if (r) {
                for (var i = Number(r[1]); i <= Number(r[2]); i++) { out[i] = true; }
            } else if (/^\d+$/.test(part)) { out[Number(part)] = true; }
        });
        var keys = Object.keys(out).map(Number).sort(function (a, b) { return a - b; });
        return keys.length ? keys : null;
    };

    /* Words that appear AROUND an ACL name and are not one. Without this list the first plausible
     * token wins, and "ip access-list GUEST-IN seq 10" names the ACL "access-list". */
    var ACL_NOISE = {
        'ip': 1, 'acl': 1, 'access': 1, 'list': 1, 'access-list': 1, 'accesslist': 1,
        'seq': 1, 'sequence': 1, 'line': 1, 'rule': 1, 'entry': 1, 'statement': 1,
        'number': 1, 'num': 1, 'no': 1, 'name': 1, 'named': 1, 'called': 1,
        'the': 1, 'and': 1, 'is': 1, 'at': 1, 'on': 1, 'in': 1, 'out': 1, 'inbound': 1,
        'outbound': 1, 'permit': 1, 'deny': 1
    };

    /* "Name case-insensitive; `seq 10` = `10`."
     *
     * THE REGEX USED TO REQUIRE AN UPPERCASE FIRST LETTER -- /\b([A-Z][A-Z0-9_-]{2,})\b/ -- directly
     * contradicting the comment above it. A student who typed the ACL name in lowercase, which is the
     * natural thing to do, got name:null. That alone would have been a false negative; combined with
     * sameAnswer's tolerance for an omitted field it became a false POSITIVE, because a null name
     * read as "omitted" rather than "wrong". `sameAnswer('aclRef', 'wrong-acl 10', 'GUEST-IN 10')`
     * returned true: name the WRONG ACL in lowercase, state the right sequence number, score full
     * marks on Q24. Both halves are fixed -- the name is matched case-insensitively here, and
     * REQUIRED_FIELDS below stops a missing one from being waved through. */
    NORM.aclRef = function (v) {
        var s = String(v || '').trim();
        var tokens = s.match(/[A-Za-z][A-Za-z0-9_-]*/g) || [];
        var cands = tokens.filter(function (t) {
            return !ACL_NOISE[t.toLowerCase()] && t.length >= 3;
        });
        /* Prefer a hyphenated or underscored token: every ACL in this lab is GUEST-IN or SERVERS-OUT,
         * and the shape is the strongest available signal for "this is a name, not prose". */
        var hyphenated = cands.filter(function (t) { return /[-_]/.test(t); });
        var name = (hyphenated.length ? hyphenated[0] : cands[0]) || null;
        var seq = (s.match(/\b(?:seq(?:uence)?\s*)?(\d{1,5})\b/) || [])[1];
        return { name: name ? name.toLowerCase() : null, seq: seq === undefined ? null : Number(seq) };
    };

    NORM.integer = function (v) {
        var m = String(v || '').trim().match(/-?\d+/);
        return m ? Number(m[0]) : null;
    };

    /* A set of option ids, order ignored. */
    NORM.multi = function (v) {
        var arr = Array.isArray(v) ? v : String(v || '').split(/[,;\s]+/);
        var out = {};
        arr.forEach(function (x) { var k = NORM.text(x); if (k) { out[k] = true; } });
        var keys = Object.keys(out).sort();
        return keys.length ? keys : null;
    };

    NORM.select = function (v) { return NORM.text(v); };

    /* FIELDS A QUESTION ACTUALLY DEMANDS, which may not be waved through as "omitted".
     *
     * The tolerance below was written for ONE case -- iface's switch name, which spec section 8 says
     * "may be omitted" -- and then applied to every field of every object-valued answer. aclRef
     * inherited it, so Q24 ("Give the ACL name and sequence number") accepted an answer with no
     * usable name at all. The spec asks for both halves of an ACL reference, so both are required. */
    var REQUIRED_FIELDS = { aclRef: ['name', 'seq'] };

    /* Compare two normalized values of the same kind.
     *
     * `opts.require` names fields the CALLER knows are mandatory for this particular answer, on top
     * of the per-kind list above. It exists for iface: the switch name is omissible only "when only
     * one switch has that port active with that endpoint", which is a property of the lab and so
     * cannot be decided here. netfinal-grade.js computes it per question at key-build time. */
    function sameAnswer(kind, a, b, opts) {
        var na = NORM[kind] ? NORM[kind](a) : NORM.text(a);
        var nb = NORM[kind] ? NORM[kind](b) : NORM.text(b);
        if (na === null || nb === null) { return false; }
        if (Array.isArray(na) || Array.isArray(nb)) { return JSON.stringify(na) === JSON.stringify(nb); }
        if (typeof na === 'object' || typeof nb === 'object') {
            var required = {};
            (REQUIRED_FIELDS[kind] || []).forEach(function (f) { required[f] = true; });
            ((opts && opts.require) || []).forEach(function (f) { required[f] = true; });
            var keys = Object.keys(nb);
            return keys.every(function (k) {
                if (nb[k] === null) { return true; }            /* the key does not constrain it */
                if (na[k] === null) { return !required[k]; }     /* omitted: only if truly optional */
                return na[k] === nb[k];                          /* stated: must match */
            }) && keys.some(function (k) { return na[k] !== null && na[k] === nb[k]; });
        }
        return na === nb;
    }

    /* Which ports carry an endpoint on MORE THAN ONE switch, normalized the way NORM.iface spells
     * them. A port in this set makes the switch name mandatory, because omitting it would match
     * either switch and "which switch" is the graded dimension of Q5, Q8, Q17 and Q18.
     *
     * Measured rather than assumed: on a sampled lab, 2 of 16 occupied ports are ambiguous this way.
     * Both switches have Fa0/1-Fa0/24 physically, but physical presence is not what the spec's
     * condition says -- it says "active with that endpoint". */
    function ambiguousPorts(state) {
        var byPort = {};
        (state.endpoints || []).forEach(function (e) {
            if (!e.switch || !e.port) { return; }
            var n = NORM.iface(String(e.port));
            var k = n && n.iface;
            if (!k) { return; }
            byPort[k] = byPort[k] || {};
            byPort[k][e.switch] = true;
        });
        var out = {};
        Object.keys(byPort).forEach(function (k) {
            if (Object.keys(byPort[k]).length > 1) { out[k] = true; }
        });
        return out;
    }

    /* ═══ HELPERS the definitions read from ═══════════════════════════════════════════════════════ */
    function ep(st, n) { return st.endpoints.filter(function (e) { return e.name === n; })[0]; }
    function fault(st, slot) { return st.faults.filter(function (f) { return f.slot === slot && f.active; })[0]; }
    function variantOf(st, slot) { var f = fault(st, slot); return f ? f.variant : null; }
    function host(st, v, n) { return ip.toStr(st.subnets[v].parsed.net + n); }
    function b(st) { return st.params.b; }
    /* The floor-1 to floor-2 trunk, found from the links so a rename cannot make a question wrong. */
    function floorTrunk(st) {
        var l = st.links.filter(function (x) {
            return x.kind === 'trunk' && TOPO.PORT_PLAN[x.a[0]] && TOPO.PORT_PLAN[x.b[0]];
        })[0];
        return l ? { sw: l.a[0], port: l.a[1], farSw: l.b[0], farPort: l.b[1] } : null;
    }
    /* Which switch and port a MAC is reachable on, as a student would trace it. */
    function portOf(st, name) {
        var e = ep(st, name);
        return e && e.switch && e.port ? { sw: e.switch, port: e.port } : null;
    }

    var Q = [];
    var def = function (o) { Q.push(o); return o; };

    /* ═══ DISCOVERY (1-14) · 2 points each · practical ════════════════════════════════════════════
     * Read off the live network. Nothing here depends on a variant except 11 and 12, and both are
     * marked. Four of them (4, 5, 14, and 13's method) are the same for every student by design --
     * spec section 9 lists questions 4, 5 and 14 as fixed because the management topology is. */
    def({ n: 1, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'text',
        prompt: function () { return "What is ADMIN-WS01's IPv4 address and prefix length?"; },
        where: 'ADMIN-WS01: ipconfig',
        /* Address AND prefix, so it is graded as two parts -- the spec's partial-credit table gives
         * half for a two-part question with one part right. */
        parts: ['ipv4', 'prefix'],
        answer: function (st) {
            var e = ep(st, 'ADMIN-WS01');
            return { ipv4: String(e.ip), prefix: ip.maskToPrefix(e.mask) };
        } });

    def({ n: 2, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'mac',
        prompt: function () { return 'What MAC address does ADMIN-WS01 currently hold for its default gateway? (ping the gateway first if the cache is empty)'; },
        where: 'ADMIN-WS01: arp -a',
        /* THE EXAM-START ANSWER, which under S4A is the ROGUE's MAC and not the router's. This is
         * the question spec section 8 singles out: "the correct answer is the rogue MAC, because
         * that is what the cache held. The student reports what they found." */
        answer: function (st) {
            var rows = tables.arpTable(st, 'ADMIN-WS01')
                .filter(function (r) { return r.ip === st.subnets[10].gateway; });
            return rows.length ? String(rows[0].mac) : String(st.svis[10].mac);
        } });

    def({ n: 3, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'ipv4',
        prompt: function () { return 'Which DNS server is ADMIN-WS01 using?'; },
        where: 'ADMIN-WS01: ipconfig /all  (the handed-out diagram is wrong)',
        answer: function (st) { return String(ep(st, 'ADMIN-WS01').dns); } });

    def({ n: 4, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'ipv4',
        prompt: function () { return "What is MeridianSW-02's management IP address?"; },
        where: 'MeridianSW-01: show cdp neighbors detail  (the diagram is wrong)',
        answer: function (st) { return String(st.devices['MeridianSW-02'].mgmtIp); } });

    def({ n: 5, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'iface',
        prompt: function () { return 'Which MeridianSW-01 interface connects to MeridianSW-02?'; },
        where: 'MeridianSW-01: show cdp neighbors',
        answer: function (st) { var t = floorTrunk(st); return t ? t.sw + ' ' + t.port : null; } });

    def({ n: 6, phase: 'discovery', points: 2, tag: 'practical', kind: 'multi', norm: 'vlanSet',
        prompt: function () { return 'Which VLANs are currently allowed on the MeridianSW-01 to MeridianSW-02 trunk?'; },
        where: 'MeridianSW-01: show interfaces trunk',
        /* CURRENTLY, which under S3 is the list MINUS the dropped VLAN. Graded against exam start
         * for exactly the reason Q2 is. */
        answer: function (st) {
            var t = floorTrunk(st);
            return t ? st.ports[t.sw][t.port].allowed.slice() : null;
        } });

    def({ n: 7, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'mac',
        prompt: function () { return "What is PRN-SALES01's MAC address?"; },
        where: 'MER-SRV01: the Kea reservation, or the lease file',
        answer: function (st) { return String(ep(st, 'PRN-SALES01').mac); } });

    def({ n: 8, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'iface',
        prompt: function () { return 'Which switch and port is PRN-SALES01 connected to?'; },
        where: 'show mac address-table address <mac>, followed across the trunk',
        answer: function (st) { var p = portOf(st, 'PRN-SALES01'); return p ? p.sw + ' ' + p.port : null; } });

    def({ n: 9, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'text',
        prompt: function () { return "What IP address and prefix length are configured on the router's VLAN 40 sub-interface?"; },
        where: 'MeridianRTR-01: show running-config interface Gi0/0.40',
        parts: ['ipv4', 'prefix'],
        /* Under S5A this is a /25, which is the whole point of asking. */
        answer: function (st) {
            return { ipv4: String(st.svis[40].ip), prefix: ip.maskToPrefix(st.svis[40].mask) };
        } });

    def({ n: 10, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'range',
        prompt: function () { return 'What address range does the DHCP server offer to the Sales VLAN?'; },
        where: 'MER-SRV01: cat /etc/kea/kea-dhcp4.conf',
        answer: function (st) {
            var c = st.dhcp.subnets[10];
            return String(c.pool.start) + ' - ' + String(c.pool.end);
        } });

    def({ n: 11, phase: 'discovery', points: 2, tag: 'practical', slot: 'S10',
        kind: function (st) { return variantOf(st, 'S10') === 'B' ? 'select' : 'text'; },
        norm: function (st) { return variantOf(st, 'S10') === 'B' ? 'select' : 'ipv4'; },
        prompt: function (st) {
            return variantOf(st, 'S10') === 'B'
                ? 'What does ADMIN-WS01 receive when it looks up wiki.meridian.local?'
                : 'What address does intranet.meridian.local resolve to from ADMIN-WS01?';
        },
        where: 'ADMIN-WS01: nslookup',
        options: function (st) {
            if (variantOf(st, 'S10') !== 'B') { return null; }
            return [
                { id: 'nxdomain', text: 'NXDOMAIN (non-existent domain)' },
                { id: 'address', text: 'An address in the Servers VLAN' },
                { id: 'timeout', text: 'A timeout with no response' },
                { id: 'servfail', text: 'SERVFAIL' }
            ];
        },
        answer: function (st) {
            if (variantOf(st, 'S10') === 'B') { return 'nxdomain'; }
            var rec = st.dns.loaded.records.filter(function (r) { return r.name === 'intranet'; })[0];
            return rec ? String(rec.target) : null;
        } });

    def({ n: 12, phase: 'discovery', points: 2, tag: 'practical', slot: 'S11', kind: 'text', norm: 'integer',
        prompt: function (st) {
            return variantOf(st, 'S11') === 'B'
                ? 'Which 2.4 GHz channel are AP-2 and AP-3 using?'
                : 'Which VLAN is the Meridian-Guest SSID mapped to?';
        },
        where: 'MER-WLC01 (web)',
        answer: function (st) {
            if (variantOf(st, 'S11') === 'B') { return Number(st.wireless.apChannels['AP-2']); }
            var s = st.ssids.filter(function (x) { return x.name === 'Meridian-Guest'; })[0];
            return s ? Number(s.vlan) : null;
        } });

    def({ n: 13, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'ipv4',
        prompt: function () { return 'What public IP address does the firewall use for outbound NAT?'; },
        where: 'MER-FW01 (web): Outbound NAT, or the WAN interface',
        answer: function (st) { return String(st.params.wan.fwIp); } });

    def({ n: 14, phase: 'discovery', points: 2, tag: 'practical', kind: 'text', norm: 'ipv4',
        prompt: function () { return "What is the next hop of the router's default route?"; },
        where: 'MeridianRTR-01: show ip route',
        answer: function (st) {
            var d = (st.routes['MeridianRTR-01'] || []).filter(function (r) { return r.prefix === 0; })[0];
            return d ? String(d.nextHop) : null;
        } });

    /* ═══ ANALYSIS (15-26) · 4 points each · reasoning ════════════════════════════════════════════
     * One per slot, in slot order. Every one is variant-aware because the two variants of a slot
     * test the same layer by different evidence. */
    def({ n: 15, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S12', kind: 'select', norm: 'select',
        prompt: function (st) {
            return variantOf(st, 'S12') === 'B'
                ? "Why are MeridianSW-02's log timestamps years out of date?"
                : 'Which NOC alert is a false positive caused by monitoring configuration rather than a fault?';
        },
        options: function (st) {
            return variantOf(st, 'S12') === 'B'
                ? [{ id: 'ntp-dead', text: 'NTP points at a decommissioned server, so the clock never synchronised' },
                   { id: 'tz', text: 'The time zone is set incorrectly' },
                   { id: 'buffer', text: 'The log buffer wrapped and is replaying old entries' },
                   { id: 'clock-battery', text: 'The hardware clock battery has failed' }]
                : [{ id: 'snmp-community', text: 'MeridianSW-02 unreachable (SNMP) — the community string does not match the NOC' },
                   { id: 'spare-port', text: 'MeridianSW-01 Fa0/23 link down' },
                   { id: 'disk', text: 'MER-WEB01 disk usage 81%' },
                   { id: 'cpu', text: 'MeridianRTR-01 CPU 62% for 5 min' }];
        },
        answer: function (st) { return variantOf(st, 'S12') === 'B' ? 'ntp-dead' : 'snmp-community'; } });

    def({ n: 16, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S4',
        kind: function (st) { return variantOf(st, 'S4') === 'B' ? 'text' : 'select'; },
        norm: function (st) { return variantOf(st, 'S4') === 'B' ? 'text' : 'select'; },
        prompt: function (st) {
            return variantOf(st, 'S4') === 'B'
                ? 'Which IP address is claimed by two MAC addresses, and which of those MACs is NOT the file server’s?'
                : "ADMIN-WS01's ARP cache maps the gateway to a MAC that does not match the router's Gi0/0.10 interface. What is happening?";
        },
        options: function (st) {
            if (variantOf(st, 'S4') === 'B') { return null; }
            return [{ id: 'arp-spoof', text: 'A device is ARP-spoofing the gateway' },
                    { id: 'proxy-arp', text: 'The router is answering with proxy ARP' },
                    { id: 'fhrp', text: 'An FHRP virtual MAC address' },
                    { id: 'normal', text: 'Normal behaviour; the cache is stale' }];
        },
        parts: function (st) { return variantOf(st, 'S4') === 'B' ? ['ipv4', 'mac'] : null; },
        answer: function (st) {
            if (variantOf(st, 'S4') !== 'B') { return 'arp-spoof'; }
            return { ipv4: String(st.rogue.claimsIp), mac: String(st.rogue.mac) };
        } });

    def({ n: 17, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S4', kind: 'text', norm: 'iface',
        prompt: function () { return 'Which switch and port is the offending device connected to?'; },
        where: 'show mac address-table address <the rogue MAC>',
        answer: function (st) { return st.rogue.switch + ' ' + st.rogue.port; } });

    def({ n: 18, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S1', kind: 'text', norm: 'text',
        prompt: function () { return 'Which interface is behind the slow-transfer ticket, and what is the cause?'; },
        options: function () {
            return [{ id: 'duplex', text: 'Duplex mismatch' },
                    { id: 'cable', text: 'Damaged cable' },
                    { id: 'speed', text: 'Speed mismatch' },
                    { id: 'stp', text: 'STP is blocking the port' }];
        },
        parts: ['iface', 'select'],
        answer: function (st) {
            var f = fault(st, 'S1');
            return { iface: f.target.switch + ' ' + f.target.port,
                     select: f.variant === 'B' ? 'cable' : 'duplex' };
        } });

    def({ n: 19, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S2',
        kind: function (st) { return variantOf(st, 'S2') === 'B' ? 'text' : 'select'; },
        norm: function (st) { return variantOf(st, 'S2') === 'B' ? 'integer' : 'select'; },
        prompt: function (st) {
            return variantOf(st, 'S2') === 'B'
                ? "Which VLAN is the new hire's switchport in?"
                : 'Why does PRN-SALES01 receive a 10.' + b(st) + '.20.x address?';
        },
        options: function (st) {
            if (variantOf(st, 'S2') === 'B') { return null; }
            return [{ id: 'port-vlan', text: 'Its switchport has been moved to VLAN 20, so it leases from the Engineering scope' },
                    { id: 'reservation', text: 'Its DHCP reservation points at the wrong address' },
                    { id: 'relay', text: 'The DHCP relay is misconfigured' },
                    { id: 'printer-static', text: 'The printer is statically configured' }];
        },
        answer: function (st) {
            if (variantOf(st, 'S2') !== 'B') { return 'port-vlan'; }
            var f = fault(st, 'S2');
            return Number(st.ports[f.target.switch][f.target.port].vlan);
        } });

    def({ n: 20, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S3', kind: 'select', norm: 'select',
        prompt: function () { return 'At which OSI layer is the floor-2 169.254 problem, and on which device does the evidence live?'; },
        options: function () {
            return { layer: [{ id: '1', text: 'Layer 1' }, { id: '2', text: 'Layer 2' },
                             { id: '3', text: 'Layer 3' }, { id: '7', text: 'Layer 7' }],
                     device: [{ id: 'sw01', text: 'MeridianSW-01' }, { id: 'sw02', text: 'MeridianSW-02' },
                              { id: 'rtr', text: 'MeridianRTR-01' }, { id: 'srv01', text: 'MER-SRV01' }] };
        },
        parts: ['layer', 'device'],
        /* Either switch is a defensible answer: the allowed list is per-end and the spec's own
         * evidence column says "SW-01/SW-02 show interfaces trunk". Graded in the grader as a set. */
        answer: function () { return { layer: '2', device: ['sw01', 'sw02'] }; } });

    def({ n: 21, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S5',
        kind: function (st) { return variantOf(st, 'S5') === 'B' ? 'text' : 'select'; },
        norm: function (st) { return variantOf(st, 'S5') === 'B' ? 'text' : 'select'; },
        prompt: function (st) {
            return variantOf(st, 'S5') === 'B'
                ? 'What IP address does Gi0/0.20 have, and what should it be?'
                : 'Guests with addresses above .127 fail while the rest work. What is misconfigured?';
        },
        options: function (st) {
            if (variantOf(st, 'S5') === 'B') { return null; }
            return [{ id: 'mask', text: 'The sub-interface mask' }, { id: 'pool', text: 'The DHCP pool' },
                    { id: 'acl', text: 'An ACL' }, { id: 'nat', text: 'Outbound NAT' }];
        },
        parts: function (st) { return variantOf(st, 'S5') === 'B' ? ['actual', 'expected'] : null; },
        answer: function (st) {
            if (variantOf(st, 'S5') !== 'B') { return 'mask'; }
            return { actual: String(st.svis[20].ip), expected: String(st.subnets[20].gateway) };
        } });

    def({ n: 22, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S6',
        kind: function (st) { return variantOf(st, 'S6') === 'B' ? 'multi' : 'text'; },
        norm: function (st) { return variantOf(st, 'S6') === 'B' ? 'multi' : 'text'; },
        prompt: function (st) {
            return variantOf(st, 'S6') === 'B'
                ? 'Which local networks does the IPsec phase 2 currently include?'
                : 'At which hop does `tracert 10.200.0.25` stop, and which routing entry causes it?';
        },
        parts: function (st) { return variantOf(st, 'S6') === 'B' ? null : ['hop', 'route']; },
        answer: function (st) {
            if (variantOf(st, 'S6') === 'B') {
                return st.ipsec.phase2.map(function (p) { return String(p.local); });
            }
            var d = (st.routes['MeridianRTR-01'] || [])
                .filter(function (r) { return r.cidr === st.params.branch.cidr && r.kind === 'static'; })[0];
            return { hop: String(st.subnets[10].gateway),
                     route: st.params.branch.cidr + ' via ' + (d ? d.nextHop : '') };
        } });

    def({ n: 23, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S7',
        kind: function (st) { return variantOf(st, 'S7') === 'B' ? 'text' : 'select'; },
        norm: function (st) { return variantOf(st, 'S7') === 'B' ? 'text' : 'select'; },
        prompt: function (st) {
            return variantOf(st, 'S7') === 'B'
                ? 'Which internal IP does the port forward target, and which IP is the web server actually using?'
                : 'A router ping to the internet works with `source Gi0/0.10` and fails with `source Gi0/0.20`. Which table, on which device, explains the difference?';
        },
        options: function (st) {
            if (variantOf(st, 'S7') === 'B') { return null; }
            return [{ id: 'fw-nat', text: 'The outbound NAT list on MER-FW01' },
                    { id: 'rtr-route', text: 'The routing table on MeridianRTR-01' },
                    { id: 'rtr-acl', text: 'The access lists on MeridianRTR-01' },
                    { id: 'srv-dns', text: 'The DNS zone on MER-SRV01' }];
        },
        parts: function (st) { return variantOf(st, 'S7') === 'B' ? ['forward', 'actual'] : null; },
        answer: function (st) {
            if (variantOf(st, 'S7') !== 'B') { return 'fw-nat'; }
            var f = st.nat.portForwards.filter(function (x) { return x.wanPort === 443; })[0];
            return { forward: String(f ? f.toIp : ''), actual: String(st.devices['MER-WEB01'].mgmtIp) };
        } });

    def({ n: 24, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S8', kind: 'text', norm: 'aclRef',
        prompt: function () { return 'Give the ACL name and sequence number of the line that causes the problem.'; },
        where: 'MeridianRTR-01: show access-lists',
        answer: function (st) {
            var v = variantOf(st, 'S8');
            if (v === 'B') {
                var acl = st.acls['MeridianRTR-01']['SERVERS-OUT'];
                var line = acl.lines.filter(function (l) { return l.action === 'deny' && l.dstPort === 445; })[0];
                return 'SERVERS-OUT ' + (line ? line.seq : '');
            }
            /* S8A: the offending line is the PERMIT that sits above the deny and makes it dead. */
            var g = st.acls['MeridianRTR-01']['GUEST-IN'];
            var permit = g.lines.filter(function (l) { return l.action === 'permit'; })[0];
            return 'GUEST-IN ' + (permit ? permit.seq : '');
        } });

    def({ n: 25, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S9',
        kind: 'text', norm: function (st) { return variantOf(st, 'S9') === 'B' ? 'ipv4' : 'text'; },
        prompt: function (st) {
            return variantOf(st, 'S9') === 'B'
                ? 'What default gateway does the DHCP server give Sales clients?'
                : 'How many addresses are in the Sales pool, and how many Sales DHCP clients exist?';
        },
        parts: function (st) { return variantOf(st, 'S9') === 'B' ? null : ['poolSize', 'clients']; },
        answer: function (st) {
            if (variantOf(st, 'S9') === 'B') { return String(st.dhcp.subnets[10].routers); }
            var c = st.dhcp.subnets[10];
            var size = ip.toInt(c.pool.end) - ip.toInt(c.pool.start) + 1;
            /* Pool-CONSUMING clients, which excludes the reservation holders -- the same distinction
             * S9A's own apply() had to make, and the reason its shortfall is measured that way. */
            var reserved = st.dhcp.reservations.map(function (r) { return r.mac; });
            var clients = st.endpoints.filter(function (e) {
                return e.dhcp && (e.vlanEffective || e.vlan) === 10 && reserved.indexOf(e.mac) < 0;
            }).length;
            return { poolSize: size, clients: clients };
        } });

    def({ n: 26, phase: 'analysis', points: 4, tag: 'reasoning', slot: 'S10',
        kind: function (st) { return variantOf(st, 'S10') === 'B' ? 'select' : 'text'; },
        norm: function (st) { return variantOf(st, 'S10') === 'B' ? 'select' : 'text'; },
        prompt: function (st) {
            return variantOf(st, 'S10') === 'B'
                ? 'The record is present in the zone file. Why does it not resolve?'
                : 'Which DNS record is wrong, and what should its value be?';
        },
        options: function (st) {
            if (variantOf(st, 'S10') !== 'B') { return null; }
            return [{ id: 'no-reload', text: 'The zone was never reloaded, because the serial did not change' },
                    { id: 'syntax', text: 'The record has a syntax error' },
                    { id: 'forwarder', text: 'The forwarder is failing' },
                    { id: 'cache', text: 'The client is caching a negative answer' }];
        },
        parts: function (st) { return variantOf(st, 'S10') === 'B' ? null : ['record', 'expected']; },
        answer: function (st) {
            if (variantOf(st, 'S10') === 'B') { return 'no-reload'; }
            var fs = ep(st, 'MER-FS01');
            return { record: 'intranet.' + st.dns.origin, expected: String(fs.ip) };
        } });

    /* ═══ FIX (27-38) · 6 points each · practical ═════════════════════════════════════════════════
     * Graded on STATE, not on a typed answer: fixed() plus collateralDamage(), with the change-
     * request timing deciding 6 versus 3. No `answer()` -- there is nothing for the student to type,
     * which is why the kind is 'state' and the grader reads the lab instead of a field. */
    var FIX_TASKS = {
        S1: 'Resolve the Engineering slow-transfer ticket.',
        S2: { A: 'Restore printing to PRN-SALES01.', B: "Restore the new hire's access." },
        S3: 'Restore floor-2 addressing without removing any VLAN the trunk currently carries.',
        S4: 'Isolate the offending device. Change nothing else.',
        S5: 'Correct the router sub-interface.',
        S6: 'Restore reachability to BR-NAS01 for the affected users.',
        S7: { A: 'Restore internet access for Engineering.', B: 'Restore public access to the website.' },
        S8: { A: 'Block guest access to internal networks while keeping guest internet access.',
              B: 'Restore Sales access to the file share while keeping every other server protection.' },
        S9: 'Restore working DHCP for new Sales clients.',
        S10: 'Correct name resolution for the affected host.',
        S11: { A: 'Put guest wireless clients on the guest network.', B: 'Eliminate co-channel interference on 2.4 GHz.' },
        S12: { A: 'Clear the false NOC alert at its cause.', B: 'Restore correct time on MeridianSW-02.' }
    };
    ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12'].forEach(function (slot, i) {
        def({ n: 27 + i, phase: 'fix', points: 6, tag: 'practical', slot: slot, kind: 'state',
            prompt: function (st) {
                var t = FIX_TASKS[slot];
                var task = typeof t === 'string' ? t : t[variantOf(st, slot) || 'A'];
                var f = fault(st, slot);
                return task + (f && f.ticketId ? '  (' + f.ticketId + ')' : '');
            },
            /* The ticket this task belongs to, so the grader can find the change request that was
             * or was not filed for it. */
            ticket: function (st) { var f = fault(st, slot); return f ? f.ticketId : null; } });
    });

    /* ═══ VERIFY AND DOCUMENT (39-45) ═════════════════════════════════════════════════════════════
     * 39-42 are graded from the EVENT LOG: the proof command has to have been run AFTER the fix
     * landed, and the fix has to still pass. Spec section 8 scores a verify task run before the fix
     * at zero, which is why the comparison is against fixedAtEvent and not merely "was it ever run". */
    def({ n: 39, phase: 'verify', points: 3, tag: 'practical', slot: 'S3', kind: 'sequence',
        prompt: function () { return 'Show that the trunk now carries the restored VLAN.'; },
        proof: { match: /show\s+int(?:erfaces)?\s+trunk|sh\s+int\s+tr/i,
                 on: ['MeridianSW-01', 'MeridianSW-02'],
                 why: 'show interfaces trunk on either switch, after the fix' } });

    def({ n: 40, phase: 'verify', points: 3, tag: 'practical', slot: 'S7', kind: 'sequence',
        prompt: function (st) {
            return variantOf(st, 'S7') === 'B'
                ? 'Prove the website is reachable from outside.'
                : 'Prove Engineering reaches the internet.';
        },
        proof: function (st) {
            return variantOf(st, 'S7') === 'B'
                /* The firewall's Test from WAN page, which spec section 10 added for exactly this. */
                ? { match: /diag-test-from-wan/i, on: ['firewall'], kind: 'gui',
                    why: 'MER-FW01 Diagnostics > Test from WAN on 443, after the fix' }
                : { match: /ping\s+\S+\s+source\s+Gi0\/0\.20/i, on: ['MeridianRTR-01'],
                    why: 'router ping to an external address sourced from Gi0/0.20, after the fix' };
        } });

    def({ n: 41, phase: 'verify', points: 3, tag: 'practical', slot: 'S4', kind: 'sequence',
        prompt: function () { return 'Prove the offending device no longer affects ARP.'; },
        proof: function (st) {
            return variantOf(st, 'S4') === 'B'
                ? { match: /show\s+ip\s+arp|sh\s+ip\s+arp/i, on: ['MeridianRTR-01'],
                    why: 'show ip arp on the router, after the fix, showing one stable MAC for the file server' }
                : { match: /arp\s+-a/i, on: ['ADMIN-WS01'], requires: /arp\s+-d/i,
                    why: 'arp -d *, ping the gateway, then arp -a on ADMIN-WS01, after the fix' };
        } });

    def({ n: 42, phase: 'verify', points: 3, tag: 'practical', slot: 'S10', kind: 'sequence',
        prompt: function () { return 'Prove the DNS fix.'; },
        proof: { match: /nslookup|dig\s/i, on: ['ADMIN-WS01', 'MER-SRV01'],
                 why: 'nslookup or dig returning the corrected answer, after the reload' } });

    /* 43-45 read the INCIDENT LOG, correlated to a slot through the ticket id -- the correlation
     * Chris blocked stages 3-5 until it existed. All three are pro-rated across twelve entries. */
    def({ n: 43, phase: 'verify', points: 10, tag: 'practical', kind: 'state',
        prompt: function () { return 'Incident log: record the OSI layer for every resolved ticket, one entry per ticket.'; },
        /* Written in the STUDENT'S vocabulary, not the engine's. The first wording said "a slot the
         * catalog records as 2/3", which is internal language a student has no use for -- and the
         * word `slot` tripped the leak scanner on the session's start payload, correctly: it is one
         * of the three words spec section 9 says a student-facing payload must not carry. */
        rubric: 'One entry per ticket. Each layer is marked against the layer the fault actually sits at; a ticket that spans two layers accepts either. Marked proportionally across all twelve tickets.' });

    def({ n: 44, phase: 'verify', points: 6, tag: 'practical', kind: 'state',
        prompt: function () { return 'Incident log: in the evidence field, name a command or page that exposes the fault — one you actually used.'; },
        rubric: 'The named surface must appear in the event log for that incident. Pro-rated across 12 entries.' });

    def({ n: 45, phase: 'verify', points: 9, tag: 'reasoning', kind: 'state',
        prompt: function () { return 'Incident log: write a root-cause narrative for the three entries the engine selects.'; },
        rubric: 'Instructor-marked, 3 points each (spec section 8): 3 for symptom, the evidence that located it, why that evidence proves the cause, and how the fix was verified; 2 if the evidence-to-cause link is unstated; 1 for a fix with no cause, or a cause with no evidence; 0 if missing or wrong.',
        /* WHICH three, picked from the seed so a regrade selects the same ones. Spec: "The engine
         * picks three resolved incidents at random per student." */
        selection: function (st) {
            var rng = CORE.makeRng(st.meta.seedStr + '|q45');
            return rng.shuffle(st.faults.map(function (f) { return f.ticketId; })).slice(0, 3);
        } });

    /* ═══ PLANNING MEMO (46-50) · 3 points each · reasoning ═══════════════════════════════════════
     * Course content the tickets do not reach. Four are identical for every student by design (spec
     * section 9 lists 46-48 and 50 as fixed); 49 uses the student's own seeded {b}, so its correct
     * answer is about THEIR addressing. Options are stored correct-first and shuffled per student by
     * the panel, which is why the answer is an option id and never a position. */
    def({ n: 46, phase: 'planning', points: 3, tag: 'reasoning', kind: 'select', norm: 'select',
        prompt: function () { return 'The new building is 600 m away. The link needs 10 Gbps today and should not need re-cabling for higher speeds. Which medium?'; },
        options: function () {
            return [{ id: 'smf', text: '10GBASE-LR over single-mode fiber' },
                    { id: 'om4', text: '10GBASE-SR over OM4 multimode' },
                    { id: 'cat6a', text: '10GBASE-T over Cat6a' },
                    { id: 'cat6-poe', text: 'Cat6 with PoE+' }];
        },
        answer: function () { return 'smf'; } });

    def({ n: 47, phase: 'planning', points: 3, tag: 'reasoning', kind: 'select', norm: 'select',
        prompt: function () { return 'Meridian receives 2001:db8:4d2::/48 and wants the VLAN ID as the subnet ID. Which is a correct VLAN 20 subnet?'; },
        options: function () {
            return [{ id: 'correct', text: '2001:db8:4d2:20::/64' },
                    { id: 'hostbits', text: '2001:db8:4d2::20/64' },
                    { id: 'wrongpfx', text: '2001:db8:4d2:20::/48' },
                    { id: 'wrongprefix', text: '2001:db8:20::/64' }];
        },
        answer: function () { return 'correct'; } });

    def({ n: 48, phase: 'planning', points: 3, tag: 'reasoning', kind: 'select', norm: 'select',
        prompt: function () { return 'The new site has two broadband ISPs and no budget for a carrier private circuit. Which WAN approach gives encrypted transport and automatic path selection?'; },
        options: function () {
            return [{ id: 'sdwan', text: 'SD-WAN' }, { id: 'mpls', text: 'MPLS L3VPN' },
                    { id: 'leased', text: 'Leased line' }, { id: 'gre', text: 'GRE without IPsec' }];
        },
        answer: function () { return 'sdwan'; } });

    def({ n: 49, phase: 'planning', points: 3, tag: 'reasoning', kind: 'select', norm: 'select',
        /* SEEDED: the overlap is with the student's OWN addressing, so the prompt names their {b}. */
        prompt: function (st) {
            return 'Leadership wants MER-FS01 moved to a cloud VPC over a site-to-site VPN. The provider’s default VPC is 10.'
                + b(st) + '.0.0/16. What must change before the VPN is built?';
        },
        options: function () {
            return [{ id: 'readdress', text: 'Re-address the VPC to a range that does not overlap HQ' },
                    { id: 'nat64', text: 'Enable NAT64' },
                    { id: 'gre', text: 'Use a GRE tunnel instead' },
                    { id: 'nothing', text: 'Nothing; VPNs handle overlapping ranges' }];
        },
        answer: function () { return 'readdress'; } });

    def({ n: 50, phase: 'planning', points: 3, tag: 'reasoning', kind: 'select', norm: 'select',
        prompt: function () { return 'The new site will have two routers sharing one default gateway. Which vendor-neutral protocol provides this?'; },
        options: function () {
            return [{ id: 'vrrp', text: 'VRRP' }, { id: 'hsrp', text: 'HSRP' },
                    { id: 'glbp', text: 'GLBP' }, { id: 'ospf', text: 'OSPF' }];
        },
        answer: function () { return 'vrrp'; } });

    /* ═══ ASSEMBLY ════════════════════════════════════════════════════════════════════════════════ */
    Q.forEach(function (q) { q.id = 'q' + q.n; });

    /* Resolve the per-variant fields for one lab. Called once when the exam is built, so the panel
     * and the grader see one concrete question rather than a function they must remember to call. */
    function resolve(state, q) {
        var val = function (x) { return typeof x === 'function' ? x(state, q) : x; };
        return {
            id: q.id, n: q.n, phase: q.phase, points: q.points, tag: q.tag,
            slot: q.slot || null,
            kind: val(q.kind), norm: val(q.norm) || null,
            prompt: val(q.prompt),
            where: q.where || null,
            options: val(q.options) || null,
            parts: val(q.parts) || null,
            rubric: q.rubric || null,
            ticket: val(q.ticket) || null,
            proof: val(q.proof) || null,
            selection: val(q.selection) || null
        };
    }

    /* The questions as a student sees them: no answer, no rubric internals. */
    function forStudent(state) {
        return Q.map(function (q) {
            var r = resolve(state, q);
            delete r.proof;          // naming the proof command would be the answer to 39-42
            /* THE SLOT GOES TOO. Spec section 9: initialState carries "no field naming the fault,
             * slot, or variant". Telling a student that question 27 belongs to S1 and 31 to S5
             * hands them the exam's structure -- which faults exist, how many, and which questions
             * share one. The panel does not need it; questions are numbered. Caught by the leak
             * scanner on the session's start payload, which is where it would have shipped. */
            delete r.slot;
            return r;
        });
    }

    var PHASES = ['discovery', 'analysis', 'fix', 'verify', 'planning'];

    module.exports = {
        QUESTIONS: Q, NORM: NORM, sameAnswer: sameAnswer, resolve: resolve,
        forStudent: forStudent, PHASES: PHASES,
        REQUIRED_FIELDS: REQUIRED_FIELDS, ambiguousPorts: ambiguousPorts
    };
})();
