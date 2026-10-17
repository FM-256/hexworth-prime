/* ═══════════════════════════════════════════════════════════════════════════════════════════════
 * netfinal-faults.js — stage 3: the 24 fault variants, and the invariants a fix must not break.
 *
 * Spec: ~/hexworth-shared/etwork essential final/
 *       "Network+ Final Exam — Meridian Corp Operations Lab Design Spec.md" section 6 (the catalog)
 *       and section 11 (what stage 3 owes: "each with apply, logs, evidence, and fixed").
 *
 * SERVER-ONLY. This file is the answer key in executable form: `fixed()` says whether a student has
 * repaired a fault, and `apply()` says what was broken. It must never reach a browser — see the
 * header of netfinal-core.js for why the whole core lives under functions/.
 *
 * EVERY apply() IS A PURE FUNCTION OF STATE. No randomness here: each variant's target was drawn at
 * generation time into `fault.target` (netfinal-core.js, the fault-plan block), because the spec
 * writes `{p}` and `{mac}` as seeded values and "which port is half duplex" has to survive a
 * regrade. That also means a fault can be re-applied to a restored state and produce the same lab.
 *
 * WHAT `fixed()` CHECKS, AND WHY IT IS NOT "DID THEY REVERT MY MUTATION". It checks the spec's
 * GRADED STATE column, which is an outcome, not an edit. S6A is "remove the route, or point it at
 * 172.16.0.2" — two different edits, both correct, so `fixed()` asks whether HQ reaches the branch
 * NAS. Grading the edit instead of the outcome would mark a correct answer wrong, which is the
 * failure mode this platform cares about most.
 *
 * INVARIANTS ARE THE OTHER HALF OF GRADING. A student can satisfy `fixed()` by breaking something
 * else: allow every VLAN on the trunk, widen a DHCP pool over the gateway, delete the ACL line that
 * was blocking them. The spec requires a test per variant that "applies a common wrong fix and
 * confirms an invariant fails" — so the invariants below are not decoration, they are what separates
 * a repair from a bulldozer. They are checked after every fix attempt, not only at the end.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var TOPO = require('./netfinal-topology.js');
    var CORE = require('./netfinal-core.js');
    var reach = CORE.reach, tables = CORE.tables, ip = CORE.ip;

    /* ── small readers, so a variant reads like the spec row it implements ─────────────────────── */
    var sub = function (st, v) { return st.subnets[v]; };
    var host = function (st, v, n) { return ip.toStr(st.subnets[v].parsed.net + n); };
    var ep = function (st, name) { return st.endpoints.filter(function (e) { return e.name === name; })[0]; };
    var port = function (st, sw, p) { return (st.ports[sw] || {})[p]; };
    var faultOf = function (st, id) { return st.faults.filter(function (f) { return f.id === id; })[0]; };
    var trunkEnds = function (st) {
        /* The floor-1 to floor-2 trunk, found from the links rather than named, so renaming a port
         * cannot silently make S3 a no-op. */
        var l = st.links.filter(function (x) {
            return x.kind === 'trunk' && TOPO.PORT_PLAN[x.a[0]] && TOPO.PORT_PLAN[x.b[0]];
        })[0];
        return l ? [{ sw: l.a[0], port: l.a[1] }, { sw: l.b[0], port: l.b[1] }] : [];
    };
    var leased = function (st, name) {
        var e = ep(st, name);
        return !!(e && e.ip && !/^169\.254\./.test(e.ip) && e.lease);
    };
    var INTERNET = '8.8.8.8';

    /* S8A is repaired by renumbering GUEST-IN and S8B by deleting SERVERS-OUT's one deny line, so
     * each legitimately changes the sequence set of the list it targets. Any OTHER list is held to
     * "no line removed". */
    function aclIsS8Target(st, aclName, s8) {
        if (!s8) { return false; }
        return s8.variant === 'A' ? aclName === 'GUEST-IN' : aclName === 'SERVERS-OUT';
    }

    /* `rndc reload` semantics, which is why the state keeps zoneFile and loaded separate: named
     * adopts the file only when its serial has ADVANCED. A student who edits the file and reloads
     * without bumping the serial changes nothing a client can see -- that is S10B's whole lesson,
     * so the reload path has to honour it rather than just copying across. */
    function reloadZone(st) {
        if (st.dns.zoneFile.serial <= st.dns.loaded.serial) return false;
        st.dns.loaded = {
            serial: st.dns.zoneFile.serial,
            records: st.dns.zoneFile.records.map(function (r) {
                return { name: r.name, type: r.type, target: r.target };
            })
        };
        return true;
    }

    /* ═══ THE EXAM-START BASELINE ════════════════════════════════════════════════════
     * Spec section 8's collateral-damage invariants are mostly RELATIVE: "no VLAN removed from any
     * trunk that carried it AT EXAM START", "every endpoint that reached its gateway AT EXAM START
     * still reaches it at submission". None of that is expressible against current state alone, so
     * exam start has to be recorded.
     *
     * Captured AFTER the faults are applied, because that is what exam start means for a student:
     * the broken network they are handed. A baseline taken before the faults would make every fault
     * look like collateral damage.
     *
     * It stores only what the invariants compare, not a whole second copy of the lab. A full
     * snapshot would double the state a server has to hold per student and would invite someone to
     * diff it against the live state -- which is the answer key by another route. */
    function captureBaseline(state) {
        var trunks = {}, shut = {}, acls = {}, gateways = {};
        Object.keys(state.ports).forEach(function (sw) {
            Object.keys(state.ports[sw]).forEach(function (pn) {
                var p = state.ports[sw][pn];
                if (p.mode === 'trunk') { trunks[sw + ' ' + pn] = p.allowed.slice(); }
                if (p.shutdown) { shut[sw + ' ' + pn] = true; }
            });
        });
        Object.keys(state.acls).forEach(function (d) {
            Object.keys(state.acls[d]).forEach(function (n) {
                acls[d + ' ' + n] = state.acls[d][n].lines.map(function (l) { return l.seq; });
            });
        });
        /* Which endpoints could reach their own gateway. Recording the ANSWER rather than the
         * inputs means a later check compares like with like however the lab changed. */
        state.endpoints.forEach(function (e) {
            if (!e.ip || /^169\.254\./.test(e.ip) || !e.gw) { gateways[e.name] = false; return; }
            gateways[e.name] = reach(state, e.name, e.gw, { proto: 'icmp' }).ok;
        });
        var def = (state.routes['MeridianRTR-01'] || []).filter(function (r) { return r.prefix === 0; })[0];
        state.baseline = {
            trunks: trunks, shutPorts: shut, aclSeqs: acls, gateways: gateways,
            defaultNextHop: def ? def.nextHop : null,
            rogue: state.rogue ? { switch: state.rogue.switch, port: state.rogue.port } : null,
            dnsSerial: state.dns.loaded.serial
        };
        /* PER-DEVICE CONFIG, for "Restore to exam start" (spec section 8: each device menu has it,
         * it resets that device's config including fixes already made on it, and costs no points).
         * A full copy, because a restore has to put back everything a student could have changed --
         * a partial snapshot would restore a device into a state it was never in.
         *
         * This lives SERVER-SIDE ONLY and is never sent to the browser. Diffing it against live
         * state would locate every fault instantly, so it is the answer key by another route. */
        state.baseline.deviceConfigs = {};
        var snap = function (o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); };
        Object.keys(state.devices).forEach(function (d) {
            var cfg = {
                ports: snap(state.ports[d]),
                routes: snap(state.routes[d]),
                acls: snap(state.acls[d]),
                snmp: snap(state.devices[d].snmp),
                ntp: snap(state.devices[d].ntp),
                files: snap(state.devices[d].files)
            };
            if (d === 'MeridianRTR-01') { cfg.svis = snap(state.svis); }
            if (d === 'MER-SRV01') { cfg.dhcp = snap(state.dhcp); cfg.dns = snap(state.dns); }
            if (d === 'MER-FW01') { cfg.nat = snap(state.nat); cfg.ipsec = snap(state.ipsec); }
            if (d === 'MER-WLC01') { cfg.ssids = snap(state.ssids); cfg.wireless = snap(state.wireless); }
            state.baseline.deviceConfigs[d] = cfg;
        });

        /* WHICH INVARIANTS THE FAULTS THEMSELVES VIOLATE. A fault legitimately breaks the invariant
         * that describes its own symptom: S11B puts two APs on one channel, which is exactly what
         * wireless-channel-plan forbids, and S2A moves the printer off its reservation, which is
         * exactly what printer-reservation-intact forbids. Without this, every lab would read as
         * "already damaged" before the student typed anything, and collateral damage would be
         * indistinguishable from the exam.
         *
         * Recorded LAST, after the rest of the baseline exists, because several invariants read it. */
        state.baseline.violatedAtStart = checkInvariants(state).map(function (v) { return v.id; });
        return state;
    }

    /* ═══ INVARIANTS ══    /* ═══ INVARIANTS ══════════════════════════════════════════════════════════════════════════════
     * Properties of a HEALTHY lab that must still hold after any repair. Each carries `why` so a
     * failure tells the student (and the grader's report) what the collateral damage was, rather
     * than just naming a rule. */
    var INVARIANTS = [
        {
            id: 'mgmt-path',
            why: 'Every managed device must stay reachable from ADMIN-WS01, or the student cannot finish the exam.',
            check: function (st) {
                var bad = [];
                TOPO.DEVICES.filter(function (d) { return d.id !== 'ADMIN-WS01'; }).forEach(function (d) {
                    var a = st.devices[d.id] && st.devices[d.id].mgmtIp;
                    if (!a) { bad.push(d.id + ' has no management address'); return; }
                    if (!reach(st, 'ADMIN-WS01', a, { proto: 'icmp' }).ok) bad.push(d.id + ' at ' + a);
                });
                return bad.length ? 'unreachable: ' + bad.join(', ') : null;
            }
        },
        {
            id: 'vlan99-intact',
            why: 'VLAN 99 is the management network. Spec constraint 2 forbids any fault or fix from touching it.',
            check: function (st) {
                if (st.subnets[99].cidr !== '10.0.0.0/24') return 'the management subnet moved to ' + st.subnets[99].cidr;
                var svi = st.svis[99];
                if (!svi || svi.shutdown) return 'Gi0/0.99 is down';
                if (svi.ip !== st.subnets[99].gateway) return 'Gi0/0.99 is ' + svi.ip + ', not the gateway';
                var missing = trunkEnds(st).filter(function (t) {
                    var p = port(st, t.sw, t.port);
                    return !p || p.allowed.indexOf(99) < 0;
                });
                return missing.length ? 'VLAN 99 dropped from the trunk on ' + missing.map(function (m) { return m.sw; }).join(' and ') : null;
            }
        },
        {
            /* SPEC SECTION 8, VERBATIM: "No VLAN removed from any trunk that carried it at exam
             * start." Baseline-relative, and strictly different from my first attempt, which only
             * forbade VLAN 30 on the floor-2 trunk. That version would have missed a student who
             * dropped VLAN 40 to "simplify" a trunk, and would have wrongly flagged a lab whose
             * authored trunk legitimately carried 30 -- the SW-01 uplink to the router does. */
            id: 'no-trunk-vlan-removed',
            why: 'Spec section 8: no VLAN may be removed from a trunk that carried it at exam start. Removing one is how a trunk "simplification" takes a floor offline.',
            check: function (st) {
                if (!st.baseline) { return null; }
                var bad = [];
                Object.keys(st.baseline.trunks).forEach(function (key) {
                    var parts = key.split(' ');
                    var p = port(st, parts[0], parts[1]);
                    if (!p || p.mode !== 'trunk') { bad.push(key + ' is no longer a trunk'); return; }
                    var gone = st.baseline.trunks[key].filter(function (v) { return p.allowed.indexOf(v) < 0; });
                    if (gone.length) { bad.push(key + ' no longer carries VLAN ' + gone.join(',')); }
                });
                return bad.length ? bad.join('; ') : null;
            }
        },
        {
            /* The OTHER direction, which the spec does not state but S3's wrong fix needs: adding
             * every VLAN to a trunk passes "nothing was removed" and still extends the server VLAN
             * across the building. Kept as a separate invariant so a failure says which mistake
             * was made rather than one message covering two. */
            id: 'no-trunk-vlan-added',
            why: 'A trunk carrying a VLAN it never carried extends a broadcast domain nobody asked for. `switchport trunk allowed vlan all` is the common wrong fix for S3.',
            check: function (st) {
                /* No baseline needed: this one compares against the AUTHORED topology, because a
                 * VLAN the fault removed is legitimately re-added and must not read as an addition.
                 * Guarding it on the baseline made it silently inert before exam start, which is
                 * where the isolation test for it runs. */
                var bad = [];
                var trunkKeys = {};
                Object.keys(st.ports).forEach(function (sw) {
                    Object.keys(st.ports[sw]).forEach(function (pn) {
                        if (st.ports[sw][pn].mode === 'trunk') { trunkKeys[sw + ' ' + pn] = true; }
                    });
                });
                Object.keys(trunkKeys).forEach(function (key) {
                    var parts = key.split(' ');
                    var p = port(st, parts[0], parts[1]);
                    if (!p || !p.allowed) { return; }
                    /* A VLAN the fault REMOVED is legitimately re-added, so the comparison is
                     * against the authored topology, not against the faulted baseline. */
                    var authored = null;
                    TOPO.LINKS.forEach(function (l) {
                        if ((l.a[0] === parts[0] && l.a[1] === parts[1]) || (l.b[0] === parts[0] && l.b[1] === parts[1])) {
                            authored = l.allowed || null;
                        }
                    });
                    if (!authored) { return; }
                    var extra = p.allowed.filter(function (v) { return authored.indexOf(v) < 0; });
                    if (extra.length) { bad.push(key + ' now also carries VLAN ' + extra.join(',')); }
                });
                return bad.length ? bad.join('; ') : null;
            }
        },
        {
            /* SPEC SECTION 8: "No ACL line removed other than the S8 target line." */
            id: 'no-acl-line-removed',
            why: 'Spec section 8: only S8\u2019s target line may be removed. Deleting a rule to unblock yourself removes a control that was there for a reason.',
            check: function (st) {
                if (!st.baseline) { return null; }
                var s8 = st.faults.filter(function (f) { return f.slot === 'S8' && f.active; })[0];
                var bad = [];
                Object.keys(st.baseline.aclSeqs).forEach(function (key) {
                    var parts = key.split(' ');
                    var acl = (st.acls[parts[0]] || {})[parts[1]];
                    if (!acl) { bad.push(key + ' was deleted entirely'); return; }
                    var have = acl.lines.map(function (l) { return l.seq; });
                    var gone = st.baseline.aclSeqs[key].filter(function (q) { return have.indexOf(q) < 0; });
                    /* S8A is repaired BY RENUMBERING, and S8B by removing its one deny line, so
                     * both legitimately change the sequence set of the list they target. Only
                     * untouched lists are held to "nothing removed". */
                    if (gone.length && !(s8 && aclIsS8Target(st, parts[1], s8))) {
                        bad.push(key + ' lost line ' + gone.join(','));
                    }
                });
                return bad.length ? bad.join('; ') : null;
            }
        },
        {
            /* SPEC SECTION 8: "The router's default route still points to 172.16.0.2." */
            id: 'default-route-intact',
            why: 'Spec section 8: the default route must still point at the firewall. Repointing it is how "I made the branch reachable" takes the internet away.',
            check: function (st) {
                var def = (st.routes['MeridianRTR-01'] || []).filter(function (r) { return r.prefix === 0; })[0];
                if (!def) { return 'the default route is gone'; }
                return def.nextHop === TOPO.FIXED_NETS.transit.fw
                    ? null : 'the default route points at ' + def.nextHop + ', not ' + TOPO.FIXED_NETS.transit.fw;
            }
        },
        {
            /* SPEC SECTION 8: "Every endpoint that reached its gateway at exam start still reaches
             * it at submission, except the S4 rogue device." */
            id: 'gateways-still-reachable',
            why: 'Spec section 8: an endpoint that could reach its gateway at exam start must still reach it. This is the catch-all for a fix that quietly strands somebody.',
            check: function (st) {
                if (!st.baseline) { return null; }
                var bad = [];
                st.endpoints.forEach(function (e) {
                    if (!st.baseline.gateways[e.name]) { return; }      // it could not before, so it owes nothing
                    if (!e.ip || /^169\.254\./.test(e.ip) || !e.gw) { bad.push(e.name + ' lost its address'); return; }
                    if (!reach(st, e.name, e.gw, { proto: 'icmp' }).ok) { bad.push(e.name + ' can no longer reach ' + e.gw); }
                });
                return bad.length ? bad.join('; ') : null;
            }
        },
        {
            id: 'dhcp-pools-sane',
            why: 'A pool must sit inside its own subnet and must not hand out the gateway or a reserved address. Widening a pool to the whole subnet is the common wrong fix for S9A.',
            check: function (st) {
                var bad = [];
                Object.keys(st.dhcp.subnets).forEach(function (v) {
                    var c = st.dhcp.subnets[v], s = sub(st, Number(v));
                    var lo = ip.toInt(c.pool.start), hi = ip.toInt(c.pool.end);
                    if (!ip.inNet(lo, s.parsed) || !ip.inNet(hi, s.parsed)) bad.push('VLAN ' + v + ' pool leaves its subnet');
                    if (hi < lo) bad.push('VLAN ' + v + ' pool is inverted');
                    var gw = ip.toInt(s.gateway);
                    if (gw >= lo && gw <= hi) bad.push('VLAN ' + v + ' pool contains the gateway ' + s.gateway);
                    st.dhcp.reservations.forEach(function (r) {
                        if (Number(v) !== r.vlan) return;
                        var ri = ip.toInt(r.ip);
                        if (ri >= lo && ri <= hi) bad.push('VLAN ' + v + ' pool contains the reservation ' + r.ip);
                    });
                });
                return bad.length ? bad.join('; ') : null;
            }
        },
        {
            id: 'guest-cannot-reach-servers',
            why: 'Guests must never reach the internal server VLAN. Deleting the permit line, or the deny, is the common wrong fix for S8.',
            check: function (st) {
                var g = ep(st, 'WIFI-GUEST01');
                if (!g || !g.ip || /^169\.254\./.test(g.ip)) return null;   // stranded guest proves nothing
                var fs = ep(st, 'MER-FS01');
                return (fs && reach(st, 'WIFI-GUEST01', fs.ip, { proto: 'tcp', port: 445 }).ok)
                    ? 'a guest reached the file server on TCP 445' : null;
            }
        },
        {
            id: 'guest-keeps-internet',
            why: 'A correct guest ACL blocks guest-to-internal and leaves browsing alone. Blanket-denying the guest VLAN is the other common wrong fix for S8A.',
            check: function (st) {
                var g = ep(st, 'WIFI-GUEST01');
                if (!g || !g.ip || /^169\.254\./.test(g.ip)) return null;
                return reach(st, 'WIFI-GUEST01', INTERNET, { proto: 'tcp', port: 443 }).ok
                    ? null : 'guests can no longer reach the internet';
            }
        },
        {
            id: 'only-rogue-port-shut',
            why: 'The fix for S4 is one shutdown. Shutting a range, or the wrong port, takes working hosts offline.',
            check: function (st) {
                /* Baseline-relative per spec section 8, rather than derived from PORT_PLAN: a port
                 * shut at exam start is allowed to stay shut whatever the reason, and the rogue's
                 * port is the single permitted addition. */
                var allowed = {};
                if (st.baseline) { Object.keys(st.baseline.shutPorts).forEach(function (k) { allowed[k] = true; }); }
                else {
                    Object.keys(TOPO.PORT_PLAN).forEach(function (sw) {
                        TOPO.PORT_PLAN[sw].forEach(function (seg) {
                            if (!seg.shutdown) { return; }
                            for (var n = seg.range[0]; n <= seg.range[1]; n++) { allowed[sw + ' Fa0/' + n] = true; }
                        });
                    });
                }
                if (st.rogue) { allowed[st.rogue.switch + ' ' + st.rogue.port] = true; }
                var extra = [];
                Object.keys(st.ports).forEach(function (sw) {
                    Object.keys(st.ports[sw]).forEach(function (pn) {
                        if (st.ports[sw][pn].shutdown && !allowed[sw + ' ' + pn]) { extra.push(sw + ' ' + pn); }
                    });
                });
                return extra.length ? 'ports shut that should not be: ' + extra.join(', ') : null;
            }
        },
        {
            id: 'wireless-channel-plan',
            why: 'The 2.4 GHz plan is 1/6/11 with no two adjacent APs sharing. Setting every AP to one channel satisfies "all in {1,6,11}" and is still wrong.',
            check: function (st) {
                var ch = st.wireless.apChannels, names = Object.keys(ch);
                var off = names.filter(function (a) { return [1, 6, 11].indexOf(ch[a]) < 0; });
                if (off.length) return off.map(function (a) { return a + ' on channel ' + ch[a]; }).join(', ');
                var seen = {}, dup = [];
                names.forEach(function (a) {
                    if (seen[ch[a]]) dup.push(seen[ch[a]] + ' and ' + a + ' share channel ' + ch[a]);
                    seen[ch[a]] = a;
                });
                return dup.length ? dup.join('; ') : null;
            }
        },
        {
            id: 'printer-reservation-intact',
            why: 'The printer is a DHCP client with a fixed address. Deleting its reservation makes it lease from the pool and moves the address everything prints to.',
            check: function (st) {
                /* Keyed on the HOST, not "the first VLAN 10 reservation". There are now two in that
                 * VLAN -- the printer's and ADMIN-WS01's -- so the positional lookup silently
                 * started comparing the printer against the workstation's address. The invariant
                 * still fired when the printer's reservation was deleted, but by the wrong branch
                 * and with a message naming the wrong address, which is how a grader report
                 * misleads the person reading it. Mutation found it: disabling the missing-
                 * reservation branch changed no outcome, because the second branch covered for it. */
                var r = st.dhcp.reservations.filter(function (x) { return x.host === 'PRN-SALES01'; })[0];
                if (!r) return 'the Sales printer reservation is gone';
                var p = ep(st, 'PRN-SALES01');
                if (p && p.ip && p.ip !== r.ip && !/^169\.254\./.test(p.ip)) {
                    return 'the printer holds ' + p.ip + ' instead of its reservation ' + r.ip;
                }
                return null;
            }
        },
        {
            id: 'dns-records-resolve',
            why: 'Every name the zone serves must point at a host that answers. Renumbering a server to dodge a fault is the common wrong fix for S7B and S10A, and it leaves the name pointing at nothing.',
            check: function (st) {
                var idx = CORE.buildIndex(st);
                var bad = st.dns.loaded.records.filter(function (r) {
                    return r.type === 'A' && !idx.byIp[r.target];
                });
                return bad.length
                    ? bad.map(function (r) { return r.name + '.' + st.dns.origin + ' -> ' + r.target + ' (nothing answers)'; }).join(', ')
                    : null;
            }
        },
        {
            id: 'admin-ws-has-lease',
            why: 'Spec constraint 3: ADMIN-WS01 always holds a valid lease, including under S9A.',
            check: function (st) {
                return leased(st, 'ADMIN-WS01') ? null : 'ADMIN-WS01 has no lease';
            }
        }
    ];

    /* COLLATERAL DAMAGE is what the spec actually grades: "A fix that passes its own check but
     * BREAKS an invariant gets zero." Breaks, not "is found violating" -- so an invariant the
     * faults already violated at exam start is not the student's doing and must not cost them.
     * This is the function graders call; checkInvariants() is the raw reading beneath it. */
    function collateralDamage(state) {
        var already = (state.baseline && state.baseline.violatedAtStart) || [];
        return checkInvariants(state).filter(function (v) { return already.indexOf(v.id) < 0; });
    }

    /* Every invariant that is currently violated. An empty array is a clean lab. */
    function checkInvariants(state) {
        var out = [];
        INVARIANTS.forEach(function (inv) {
            var detail;
            try { detail = inv.check(state); }
            catch (e) { detail = 'invariant threw: ' + e.message; }
            if (detail) out.push({ id: inv.id, why: inv.why, detail: detail });
        });
        return out;
    }

    /* ═══ THE 24 VARIANTS ═════════════════════════════════════════════════════════════════════════
     * One entry per row of spec section 6. `ticket` is what the student sees, `evidence` names the
     * commands that reveal it (stage 4 wires those to a parser; the strings here are the contract),
     * `apply` breaks it, `fixed` reads the GRADED STATE column, and `wrongFix` is the plausible
     * mistake the spec requires a test for. */
    var V = {};

    /* ── S1 · layer 1 · floor-2 Engineering is slow ─────────────────────────────────────────────── */
    V.S1A = {
        ticket: 'Floor-2 Engineering file copies crawl. Network works, just slow.',
        rootCause: 'The access port is hard-set to half duplex while the PC auto-negotiates full.',
        expectedFix: 'duplex auto (or full) on the affected port',
        evidence: ['show interfaces {port} on MeridianSW-02', 'show logging on MeridianSW-02'],
        apply: function (st, f) {
            var p = port(st, f.target.switch, f.target.port);
            if (p) { p.duplex = 'half'; p.duplexForced = true; }
        },
        /* Duplex, not reachability: the whole point of S1 is a fault that leaves connectivity
         * intact, so a student who only pings concludes nothing is wrong. */
        fixed: function (st, f) {
            var p = port(st, f.target.switch, f.target.port);
            return !!p && p.duplex === 'full';
        },
        correctFix: function (st, f) { port(st, f.target.switch, f.target.port).duplex = 'full'; },
        wrongFix: function (st, f) {
            /* Shutting the port "to reset it" is the reflex that trades slow for dead. */
            var p = port(st, f.target.switch, f.target.port);
            if (p) { p.shutdown = true; p.duplex = 'full'; }
        },
        logs: function (st, f) {
            return [{ device: 'MeridianSW-02', sev: 4, facility: 'CDP',
                text: '%CDP-4-DUPLEX_MISMATCH: duplex mismatch discovered on ' + f.target.port + ' (not half duplex), with ' + f.target.host }];
        }
    };
    V.S1B = {
        ticket: 'Floor-2 Engineering file copies crawl. Network works, just slow.',
        rootCause: 'A damaged patch cable on the access port is producing CRC and input errors.',
        expectedFix: 'Replace the patch cable from the rack view',
        evidence: ['show interfaces {port} counters errors on MeridianSW-02'],
        apply: function (st, f) {
            var p = port(st, f.target.switch, f.target.port);
            if (p) p.errorRate = 0.05;
        },
        fixed: function (st, f) {
            var p = port(st, f.target.switch, f.target.port);
            return !!p && p.errorRate === 0 && p.up !== false;
        },
        correctFix: function (st, f) { port(st, f.target.switch, f.target.port).errorRate = 0; },
        wrongFix: function (st, f) {
            /* "Replacing" it by disabling the port. Errors do stop. So does the user. */
            var p = port(st, f.target.switch, f.target.port);
            if (p) { p.errorRate = 0; p.shutdown = true; }
        },
        logs: function (st, f) {
            return [{ device: 'MeridianSW-02', sev: 3, facility: 'PM',
                text: '%PM-3-ERR_RECOVER: Attempting to recover from crc-errors err-disable state on ' + f.target.port }];
        }
    };

    /* ── S2 · layer 2 · a host on the wrong access VLAN ─────────────────────────────────────────── */
    V.S2A = {
        ticket: 'Sales printer stopped printing. Its screen shows a 10.{b}.20.x address.',
        rootCause: "The printer's switch port was moved to VLAN 20.",
        expectedFix: 'switchport access vlan 10 on that port',
        evidence: ['show vlan brief on MeridianSW-01', 'show mac address-table address {mac}', 'the Kea lease file on MER-SRV01'],
        apply: function (st, f) {
            var p = port(st, f.target.switch, f.target.port);
            if (p) p.vlan = 20;
            CORE.resolveLeases(st);
        },
        /* The graded state is the OUTCOME: the printer answers at its reservation address again.
         * Checking only "is the port VLAN 10" would pass a student who fixed the port but deleted
         * the reservation to make the address move. */
        fixed: function (st, f) {
            var r = st.dhcp.reservations.filter(function (x) { return x.vlan === 10; })[0];
            if (!r) return false;
            var p = ep(st, 'PRN-SALES01');
            return !!p && p.ip === r.ip && reach(st, 'ADMIN-WS01', r.ip, { proto: 'tcp', port: 9100 }).ok;
        },
        correctFix: function (st, f) {
            port(st, f.target.switch, f.target.port).vlan = 10;
            CORE.resolveLeases(st);
        },
        wrongFix: function (st, f) {
            /* Chasing the symptom: repoint the reservation at the VLAN 20 address the screen shows. */
            var r = st.dhcp.reservations.filter(function (x) { return x.vlan === 10; })[0];
            if (r) { r.vlan = 20; r.ip = host(st, 20, 50); }
            CORE.resolveLeases(st);
        },
        logs: function (st, f) {
            return [{ device: 'MER-SRV01', sev: 6, facility: 'kea-dhcp4',
                text: 'DHCP4_LEASE_ALLOC [hwtype=1 ' + (ep(st, 'PRN-SALES01') || {}).mac + '] lease ' + host(st, 20, 100) + ' has been allocated for 3600 seconds' }];
        }
    };
    V.S2B = {
        ticket: "New Sales hire's PC can't reach anything the rest of Sales can.",
        rootCause: 'The port is assigned VLAN 30, which has no DHCP pool, so the PC self-assigns.',
        expectedFix: 'switchport access vlan 10 on that port',
        evidence: ['show vlan brief', 'show mac address-table address {mac}', 'ipconfig /all on the PC'],
        apply: function (st, f) {
            var p = port(st, f.target.switch, f.target.port);
            if (p) p.vlan = 30;
            CORE.resolveLeases(st);
        },
        fixed: function (st, f) {
            var e = ep(st, f.target.host);
            if (!e || !leased(st, f.target.host)) return false;
            if ((e.vlanEffective || e.vlan) !== 10) return false;
            var fs = ep(st, 'MER-FS01');
            return !!fs && reach(st, f.target.host, fs.ip, { proto: 'tcp', port: 445 }).ok;
        },
        correctFix: function (st, f) {
            port(st, f.target.switch, f.target.port).vlan = 10;
            CORE.resolveLeases(st);
        },
        wrongFix: function (st, f) {
            /* "VLAN 30 has no pool, so give it one." The PC leases, and the server VLAN now hands
             * addresses to anything plugged into it. */
            st.dhcp.subnets[30] = {
                vlan: 30, subnet: st.subnets[30].cidr,
                pool: { start: host(st, 30, 1), end: host(st, 30, 254) },
                routers: st.subnets[30].gateway, dns: st.devices['MER-SRV01'].mgmtIp
            };
            CORE.resolveLeases(st);
        },
        logs: function (st, f) {
            return [{ device: 'MeridianSW-01', sev: 5, facility: 'LINK',
                text: '%LINK-3-UPDOWN: Interface ' + f.target.port + ', changed state to up' }];
        }
    };

    /* ── S3 · layer 2 · a VLAN missing from the floor-2 trunk ───────────────────────────────────── */
    function s3(vlanId, who) {
        return {
            ticket: 'All floor-2 ' + who + ' users have 169.254 addresses.',
            rootCause: "The floor-1 to floor-2 trunk's allowed list omits VLAN " + vlanId + '.',
            expectedFix: 'switchport trunk allowed vlan add ' + vlanId + ' on both ends',
            evidence: ['show interfaces trunk on MeridianSW-01 and MeridianSW-02',
                       'show mac address-table vlan ' + vlanId + ' on MeridianSW-01'],
            apply: function (st) {
                trunkEnds(st).forEach(function (t) {
                    var p = port(st, t.sw, t.port);
                    if (p) p.allowed = p.allowed.filter(function (v) { return v !== vlanId; });
                });
                CORE.resolveLeases(st);
            },
            /* Both ends, and the hosts actually leasing. A student who fixes one end sees the MAC
             * table change and may believe they are done. */
            fixed: function (st) {
                var bothAllow = trunkEnds(st).every(function (t) {
                    var p = port(st, t.sw, t.port);
                    return p && p.allowed.indexOf(vlanId) >= 0;
                });
                if (!bothAllow) return false;
                var floor2 = st.endpoints.filter(function (e) {
                    return e.switch === 'MeridianSW-02' && (e.vlanEffective || e.vlan) === vlanId && e.dhcp;
                });
                return floor2.length > 0 && floor2.every(function (e) { return leased(st, e.name); });
            },
            correctFix: function (st) {
                trunkEnds(st).forEach(function (t) {
                    var p = port(st, t.sw, t.port);
                    if (p && p.allowed.indexOf(vlanId) < 0) p.allowed = p.allowed.concat([vlanId]).sort(function (x, y) { return x - y; });
                });
                CORE.resolveLeases(st);
            },
            wrongFix: function (st) {
                /* `switchport trunk allowed vlan all` -- the fix that works and extends the server
                 * VLAN across the building. Caught by no-servers-on-floor2-trunk. */
                trunkEnds(st).forEach(function (t) {
                    var p = port(st, t.sw, t.port);
                    if (p) p.allowed = [10, 20, 30, 40, 99];
                });
                CORE.resolveLeases(st);
            },
            logs: function (st) {
                return [{ device: 'MER-SRV01', sev: 4, facility: 'kea-dhcp4',
                    text: 'DHCP4_PACKET_DROP_NO_SUBNET no suitable subnet for packet from relay, VLAN ' + vlanId }];
            }
        };
    }
    V.S3A = s3(20, 'Engineering');
    V.S3B = s3(10, 'Sales');

    /* ── S4 · layer 2/3 security · a rogue device ───────────────────────────────────────────────── */
    V.S4A = {
        ticket: 'Sales users get certificate warnings and slow browsing.',
        rootCause: 'A rogue device is ARP-spoofing the VLAN 10 gateway. It forwards traffic, so connectivity survives.',
        expectedFix: "shutdown on the rogue's switch port",
        evidence: ['arp -a on ADMIN-WS01', 'show interfaces Gi0/0.10 on MeridianRTR-01', 'show mac address-table address {mac}'],
        apply: function (st) {
            st.rogue.placed = true;
            st.rogue.mode = 'arp-spoof';
            st.rogue.claimsIp = st.subnets[10].gateway;
            st.rogue.vlan = 10;
        },
        /* The port is down AND the victim's cache points back at the real gateway. The second half
         * is what the spec's "after arp -d *, WS01 learns the real gateway MAC" means. */
        fixed: function (st) {
            var p = port(st, st.rogue.switch, st.rogue.port);
            if (!p || !p.shutdown) return false;
            var rows = tables.arpTable(st, 'ADMIN-WS01').filter(function (r) { return r.ip === st.subnets[10].gateway; });
            return rows.length === 1 && rows[0].mac === st.svis[10].mac;
        },
        correctFix: function (st) { port(st, st.rogue.switch, st.rogue.port).shutdown = true; st.rogue.placed = false; },
        wrongFix: function (st) {
            /* Shutting the whole Sales range to "contain" it. The rogue is gone and so is Sales. */
            Object.keys(st.ports['MeridianSW-01']).forEach(function (pn) {
                var p = st.ports['MeridianSW-01'][pn];
                if (p.mode === 'access' && p.vlan === 10) p.shutdown = true;
            });
            st.rogue.placed = false;
        },
        logs: function (st) {
            return [{ device: 'MeridianSW-01', sev: 4, facility: 'SW_MATM',
                text: '%SW_MATM-4-MACFLAP_NOTIF: Host ' + st.rogue.mac + ' in vlan 10 is flapping between port ' + st.rogue.port + ' and port Fa0/24' }];
        }
    };
    V.S4B = {
        ticket: 'The file share drops every few minutes.',
        rootCause: "A rogue device is statically using the file server's address.",
        expectedFix: "shutdown on the rogue's switch port",
        evidence: ['show logging on MeridianRTR-01', 'show ip arp on MeridianRTR-01', 'show mac address-table address {mac}'],
        apply: function (st) {
            st.rogue.placed = true;
            st.rogue.mode = 'duplicate-address';
            st.rogue.claimsIp = (ep(st, 'MER-FS01') || {}).ip;
            st.rogue.vlan = 30;
        },
        fixed: function (st) {
            var p = port(st, st.rogue.switch, st.rogue.port);
            if (!p || !p.shutdown) return false;
            var fs = ep(st, 'MER-FS01');
            return !!fs && tables.arpTable(st, 'MeridianRTR-01').filter(function (r) { return r.ip === fs.ip; }).length === 1;
        },
        correctFix: function (st) { port(st, st.rogue.switch, st.rogue.port).shutdown = true; st.rogue.placed = false; },
        wrongFix: function (st) {
            /* Renumbering the file server to dodge the conflict. The conflict goes away; every
             * client, DNS record and share mapping now points at nothing. */
            var fs = ep(st, 'MER-FS01');
            if (fs) fs.ip = host(st, 30, 21);
            st.rogue.placed = false;
        },
        logs: function (st) {
            var fs = ep(st, 'MER-FS01');
            return [{ device: 'MeridianRTR-01', sev: 4, facility: 'IP',
                text: '%IP-4-DUPADDR: Duplicate address ' + (fs ? fs.ip : '') + ' on Gi0/0.30, sourced by ' + st.rogue.mac }];
        }
    };

    /* ── S5 · layer 3 · a wrong sub-interface address or mask ───────────────────────────────────── */
    V.S5A = {
        ticket: "Guests with addresses above .127 can't browse. Others are fine.",
        rootCause: 'The guest sub-interface mask is /25, so the upper half of the subnet is off-net to the router.',
        expectedFix: 'ip address 10.{b}.40.1 255.255.255.0 on Gi0/0.40',
        evidence: ['show running-config interface Gi0/0.40', 'the Kea guest pool on MER-SRV01'],
        apply: function (st) {
            st.svis[40].mask = ip.prefixToMask(25);
            (st.routes['MeridianRTR-01'] || []).forEach(function (r) {
                if (r.vlan === 40) { r.prefix = 25; r.cidr = ip.toStr(r.dest) + '/25'; }
            });
        },
        /* The outcome: the stranded kiosk browses again. A student may reach it by fixing the mask
         * or by renumbering the kiosk into the lower half -- the first is right, and the invariant
         * set plus this check together reject the second, because a kiosk inside the pool range
         * trips dhcp-pools-sane. */
        fixed: function (st, f) {
            if (ip.maskToPrefix(st.svis[40].mask) !== 24) return false;
            return reach(st, f.target.host, INTERNET, { proto: 'tcp', port: 443 }).ok;
        },
        correctFix: function (st) {
            st.svis[40].mask = ip.prefixToMask(24);
            (st.routes['MeridianRTR-01'] || []).forEach(function (r) {
                if (r.vlan === 40) { r.prefix = 24; r.cidr = ip.toStr(r.dest) + '/24'; }
            });
        },
        wrongFix: function (st, f) {
            /* Widen the guest pool to cover the upper half instead of fixing the mask. The kiosks
             * are now inside the pool, so the server can hand their addresses to someone else. */
            st.dhcp.subnets[40].pool.end = host(st, 40, 199);
            CORE.resolveLeases(st);
        },
        logs: function (st, f) {
            var k = ep(st, f.target.host);
            return [{ device: 'MeridianRTR-01', sev: 6, facility: 'IP',
                text: '%IP-6-NOROUTE: Unroutable packet from ' + (k ? k.ip : '') + ' received on Gi0/0.40' }];
        }
    };
    V.S5B = {
        ticket: "Floor-1 Engineering users can't reach anything outside their subnet.",
        rootCause: 'The Engineering sub-interface answers on .254 while DHCP hands out .1 as the gateway.',
        expectedFix: 'ip address 10.{b}.20.1 255.255.255.0 on Gi0/0.20',
        evidence: ['show ip interface brief on MeridianRTR-01', 'the Kea routers option', 'show ip arp on MeridianRTR-01'],
        apply: function (st) { st.svis[20].ip = host(st, 20, 254); },
        fixed: function (st) {
            if (st.svis[20].ip !== st.subnets[20].gateway) return false;
            return reach(st, 'ENG-PC01', INTERNET, { proto: 'tcp', port: 443 }).ok;
        },
        correctFix: function (st) { st.svis[20].ip = st.subnets[20].gateway; },
        wrongFix: function (st) {
            /* Move the DHCP gateway option to .254 to match the router. Engineering browses again
             * and the whole addressing plan now disagrees with every other VLAN and the diagram. */
            st.dhcp.subnets[20].routers = host(st, 20, 254);
            CORE.resolveLeases(st);
        },
        logs: function (st) {
            return [{ device: 'MeridianRTR-01', sev: 5, facility: 'DUAL',
                text: '%OSPF-5-ADJCHG: no ARP entries learned on Gi0/0.20 since reload' }];
        }
    };

    /* ── S6 · layer 3 · the branch is unreachable ───────────────────────────────────────────────── */
    V.S6A = {
        ticket: 'Nobody at HQ can reach the branch NAS. Firewall says the tunnel is up.',
        rootCause: 'A leftover static route sends the branch prefix to a next hop that is not on the transit link.',
        expectedFix: 'Remove the static route, or point it at 172.16.0.2',
        evidence: ['tracert 10.200.0.25 from ADMIN-WS01', 'show ip route on MeridianRTR-01'],
        apply: function (st) {
            (st.routes['MeridianRTR-01'] || []).forEach(function (r) {
                if (r.cidr === st.params.branch.cidr && r.kind === 'static') r.nextHop = '172.16.0.6';
            });
        },
        /* Both accepted fixes are edits; only the outcome is common to them. Removing the route
         * leaves the default route to carry it, which is equally correct. */
        fixed: function (st) {
            return reach(st, 'ADMIN-WS01', TOPO.FIXED_NETS.branch.nas, { proto: 'tcp', port: 445 }).ok;
        },
        correctFix: function (st) {
            /* The "point it at the firewall" branch of the two accepted answers. */
            (st.routes['MeridianRTR-01'] || []).forEach(function (r) {
                if (r.cidr === st.params.branch.cidr && r.kind === 'static') r.nextHop = TOPO.FIXED_NETS.transit.fw;
            });
        },
        wrongFix: function (st) {
            /* Point the DEFAULT route at the branch gateway to "get there". The branch is reached
             * and the internet is not. */
            (st.routes['MeridianRTR-01'] || []).forEach(function (r) {
                if (r.prefix === 0) r.nextHop = '172.16.0.6';
                if (r.cidr === st.params.branch.cidr && r.kind === 'static') r.nextHop = TOPO.FIXED_NETS.transit.fw;
            });
        },
        logs: function (st) {
            return [{ device: 'MeridianRTR-01', sev: 3, facility: 'IP',
                text: '%IP-3-LOOPPAK: Looping packet detected, destination 10.200.0.25, next-hop 172.16.0.6 not on Gi0/1' }];
        }
    };
    V.S6B = {
        ticket: "Engineering can't reach the branch NAS. Sales can.",
        rootCause: "The IPsec phase-2 entries cover only the Sales network.",
        expectedFix: 'Add a phase-2 entry for 10.{b}.20.0/24, or summarise 10.{b}.0.0/16',
        evidence: ['IPsec status on MER-FW01'],
        apply: function (st) {
            st.ipsec.phase2 = st.ipsec.phase2.filter(function (p) { return p.local === st.subnets[10].cidr; });
        },
        /* Engineering reaches it AND Sales still does. The summary fix must not be penalised, so
         * this reads reachability rather than counting phase-2 entries. */
        fixed: function (st) {
            return reach(st, 'ENG-PC01', TOPO.FIXED_NETS.branch.nas, { proto: 'tcp', port: 445 }).ok
                && reach(st, 'ADMIN-WS01', TOPO.FIXED_NETS.branch.nas, { proto: 'tcp', port: 445 }).ok;
        },
        correctFix: function (st) {
            st.ipsec.phase2.push({ local: st.subnets[20].cidr, remote: TOPO.FIXED_NETS.branch.cidr });
        },
        wrongFix: function (st) {
            /* Replace the Sales entry with Engineering's instead of adding one. Engineering works,
             * Sales breaks, and the ticket's own distinguishing detail is now false. */
            st.ipsec.phase2 = [{ local: st.subnets[20].cidr, remote: TOPO.FIXED_NETS.branch.cidr }];
        },
        logs: function (st) {
            return [{ device: 'MER-FW01', sev: 5, facility: 'charon',
                text: 'no matching CHILD_SA config found for ' + st.subnets[20].cidr + ' === ' + TOPO.FIXED_NETS.branch.cidr }];
        }
    };

    /* ── S7 · layer 3/4 NAT ─────────────────────────────────────────────────────────────────────── */
    V.S7A = {
        ticket: "Engineering can resolve names but can't load any external site.",
        rootCause: 'The firewall has no outbound NAT rule for the Engineering network.',
        expectedFix: 'Add outbound NAT for 10.{b}.20.0/24 to the WAN address',
        evidence: ['outbound NAT list on MER-FW01', 'the NAT state table', 'ping 8.8.8.8 source Gi0/0.20 on MeridianRTR-01'],
        apply: function (st) {
            st.nat.outbound = st.nat.outbound.filter(function (r) { return r.src !== st.subnets[20].cidr; });
        },
        fixed: function (st) {
            return reach(st, 'ENG-PC01', INTERNET, { proto: 'tcp', port: 443 }).ok;
        },
        correctFix: function (st) {
            st.nat.outbound.push({ src: st.subnets[20].cidr, translateTo: 'wan', iface: 'WAN' });
        },
        wrongFix: function (st) {
            /* Add the missing rule -- for the wrong network. "Engineering can resolve names but
             * can't browse" sends a hurried student to the Servers VLAN, since that is where the
             * resolver lives. Engineering is still dark.
             *
             * The first version of this wrong fix used one 10.0.0.0/8 rule, and it was not actually
             * wrong: the healthy lab already NATs all five user VLANs including management, so the
             * summary changed nothing material and the test passed it. A wrong fix that is not
             * wrong proves nothing. */
            st.nat.outbound.push({ src: st.subnets[30].cidr, translateTo: 'wan', iface: 'WAN' });
        },
        logs: function (st) {
            return [{ device: 'MER-FW01', sev: 6, facility: 'filterlog',
                text: 'pass in on em1: ' + host(st, 20, 101) + ' > 8.8.8.8 (no matching outbound NAT, source unchanged)' }];
        }
    };
    V.S7B = {
        ticket: 'Customers report the public website is down.',
        rootCause: 'The HTTPS port forward targets an address in the DMZ where nothing answers.',
        expectedFix: 'Change the forward target to 172.16.50.10',
        evidence: ['port forward list on MER-FW01', 'ip addr on MER-WEB01', 'ss -tulpn on MER-WEB01'],
        apply: function (st) {
            st.nat.portForwards.forEach(function (f) { if (f.wanPort === 443) f.toIp = '172.16.50.11'; });
        },
        fixed: function (st) {
            return reach(st, CORE.constants.OUTSIDE, st.params.wan.fwIp, { proto: 'tcp', port: 443 }).ok;
        },
        correctFix: function (st) {
            st.nat.portForwards.forEach(function (f) { if (f.wanPort === 443) f.toIp = '172.16.50.10'; });
        },
        wrongFix: function (st) {
            /* Renumber the web server to match the forward. HTTPS works; the DNS A record, the
             * certificate and every other reference still point at .10. */
            var w = st.devices['MER-WEB01'];
            if (w) w.mgmtIp = '172.16.50.11';
            st.services['MER-WEB01'] = st.services['MER-WEB01'];
        },
        logs: function (st) {
            return [{ device: 'MER-FW01', sev: 6, facility: 'filterlog',
                text: 'block out on em2: 172.16.50.11:443 unreachable, 14 attempts in the last 5 minutes' }];
        }
    };

    /* ── S8 · layer 3/4 security · ACL order and a wrong line ───────────────────────────────────── */
    V.S8A = {
        ticket: 'NOC alert: Guest client opened an SMB session to MER-FS01.',
        rootCause: 'GUEST-IN permits everything before the deny, so the deny is dead code.',
        expectedFix: 'Place the deny before the permit',
        evidence: ['show access-lists GUEST-IN on MeridianRTR-01'],
        apply: function (st) {
            var acl = st.acls['MeridianRTR-01']['GUEST-IN'];
            acl.lines = [
                { seq: 10, action: 'permit', proto: 'ip', src: 'any', dst: 'any', hits: 20481 },
                { seq: 20, action: 'deny', proto: 'ip', src: st.subnets[40].cidr, dst: '10.' + st.params.b + '.0.0/16', hits: 0 }
            ];
        },
        /* Both halves of the spec's graded state, because either alone is reachable by a wrong fix:
         * a blanket deny blocks SMB and the internet; leaving it as-is allows both. */
        fixed: function (st) {
            var fs = ep(st, 'MER-FS01');
            if (!fs) return false;
            return !reach(st, 'WIFI-GUEST01', fs.ip, { proto: 'tcp', port: 445 }).ok
                && reach(st, 'WIFI-GUEST01', INTERNET, { proto: 'tcp', port: 443 }).ok;
        },
        correctFix: function (st) {
            var acl = st.acls['MeridianRTR-01']['GUEST-IN'];
            acl.lines = [
                { seq: 10, action: 'deny', proto: 'ip', src: st.subnets[40].cidr, dst: '10.' + st.params.b + '.0.0/16', hits: 0 },
                { seq: 20, action: 'permit', proto: 'ip', src: 'any', dst: 'any', hits: 0 }
            ];
        },
        wrongFix: function (st) {
            /* Delete the permit. SMB is blocked, and so is guest browsing. */
            var acl = st.acls['MeridianRTR-01']['GUEST-IN'];
            acl.lines = [{ seq: 10, action: 'deny', proto: 'ip', src: st.subnets[40].cidr, dst: 'any', hits: 0 }];
        },
        logs: function (st) {
            var fs = ep(st, 'MER-FS01');
            return [{ device: 'MER-NOC01', sev: 4, facility: 'alert',
                text: 'SMB session established: ' + host(st, 40, 100) + ' -> ' + (fs ? fs.ip : '') + ':445 (guest VLAN to server VLAN)' }];
        }
    };
    V.S8B = {
        ticket: "Sales can ping the file server but can't open the share.",
        rootCause: 'A deny line on SERVERS-OUT blocks TCP 445 from the Sales network.',
        expectedFix: 'Remove that one line',
        evidence: ['show access-lists SERVERS-OUT on MeridianRTR-01'],
        apply: function (st) {
            st.acls['MeridianRTR-01']['SERVERS-OUT'].lines.unshift({
                seq: 5, action: 'deny', proto: 'tcp', src: st.subnets[10].cidr, dst: 'any', dstPort: 445, hits: 3317
            });
        },
        fixed: function (st) {
            var fs = ep(st, 'MER-FS01');
            if (!fs) return false;
            return reach(st, 'ADMIN-WS01', fs.ip, { proto: 'tcp', port: 445 }).ok
                && !reach(st, 'WIFI-GUEST01', fs.ip, { proto: 'tcp', port: 445 }).ok;
        },
        correctFix: function (st) {
            var acl = st.acls['MeridianRTR-01']['SERVERS-OUT'];
            acl.lines = acl.lines.filter(function (l) { return !(l.action === 'deny' && l.dstPort === 445); });
        },
        wrongFix: function (st) {
            /* Remove the ACL from the interface entirely. Sales can open the share; so can guests. */
            st.acls['MeridianRTR-01']['SERVERS-OUT'].applied = [];
            st.acls['MeridianRTR-01']['GUEST-IN'].applied = [];
        },
        logs: function (st) {
            return [{ device: 'MeridianRTR-01', sev: 6, facility: 'SEC',
                text: '%SEC-6-IPACCESSLOGP: list SERVERS-OUT denied tcp ' + host(st, 10, 104) + '(49231) -> ' + host(st, 30, 20) + '(445), 41 packets' }];
        }
    };

    /* ── S9 · layer 7 DHCP ──────────────────────────────────────────────────────────────────────── */
    V.S9A = {
        ticket: 'New Sales laptops get 169.254 addresses. Existing PCs are fine.',
        rootCause: 'The Sales pool is smaller than the number of clients that need an address from it.',
        expectedFix: 'Widen the pool, validate the config, restart Kea',
        evidence: ['journalctl -u kea-dhcp4-server on MER-SRV01', 'the Kea subnet config', 'the lease file'],
        apply: function (st) {
            /* POOL-CONSUMING clients, not all DHCP clients: the printer holds a reservation outside
             * the pool, so counting it would shrink the pool one address too little and strand one
             * fewer host than the seeded shortfall promises. */
            var reserved = st.dhcp.reservations.map(function (r) { return r.mac; });
            var n = st.endpoints.filter(function (e) {
                return e.dhcp && (e.vlanEffective || e.vlan) === 10 && reserved.indexOf(e.mac) < 0;
            }).length;
            st.dhcp.subnets[10].pool.end = host(st, 10, 100 + Math.max(1, n - 1 - st.params.s9aShortfall));
            CORE.resolveLeases(st);
        },
        fixed: function (st) {
            var sales = st.endpoints.filter(function (e) { return e.dhcp && (e.vlanEffective || e.vlan) === 10; });
            return sales.length > 0 && sales.every(function (e) { return leased(st, e.name); });
        },
        correctFix: function (st) {
            /* Back to the authored pool, which sits inside the subnet and excludes .1 and the
             * reservation -- the three things the spec's graded state names. */
            st.dhcp.subnets[10].pool = { start: host(st, 10, 100), end: host(st, 10, 199) };
            CORE.resolveLeases(st);
        },
        wrongFix: function (st) {
            /* The whole subnet as a pool. Everyone leases, and the server will hand out the gateway
             * and the printer's reserved address. Caught by dhcp-pools-sane. */
            st.dhcp.subnets[10].pool = { start: host(st, 10, 1), end: host(st, 10, 254) };
            CORE.resolveLeases(st);
        },
        logs: function (st) {
            return [{ device: 'MER-SRV01', sev: 3, facility: 'kea-dhcp4',
                text: 'DHCP4_ALLOC_FAIL failed to allocate an address for subnet ' + st.subnets[10].cidr + ' after 1 attempts' }];
        }
    };
    V.S9B = {
        ticket: "New Sales PCs get an address but can't reach anything outside Sales.",
        rootCause: 'The Sales routers option hands out .254, where nothing answers.',
        expectedFix: 'Set the routers option to .1 and restart Kea',
        evidence: ['the Kea subnet config on MER-SRV01', 'ipconfig /all on a Sales PC'],
        apply: function (st) {
            st.dhcp.subnets[10].routers = host(st, 10, 254);
            CORE.resolveLeases(st);
        },
        fixed: function (st) {
            if (st.dhcp.subnets[10].routers !== st.subnets[10].gateway) return false;
            var e = ep(st, 'ADMIN-WS01');
            return !!e && e.gw === st.subnets[10].gateway
                && reach(st, 'ADMIN-WS01', INTERNET, { proto: 'tcp', port: 443 }).ok;
        },
        correctFix: function (st) {
            st.dhcp.subnets[10].routers = st.subnets[10].gateway;
            CORE.resolveLeases(st);
        },
        wrongFix: function (st) {
            /* Move the router to match the option, the mirror image of S5B's wrong fix. Sales
             * browses; the gateway no longer matches any other VLAN or the diagram, and the
             * management path to the router's VLAN 10 interface moves with it. */
            st.svis[10].ip = host(st, 10, 254);
        },
        logs: function (st) {
            return [{ device: 'MER-SRV01', sev: 6, facility: 'kea-dhcp4',
                text: 'DHCP4_LEASE_ALLOC lease ' + host(st, 10, 103) + ' allocated, option routers=' + host(st, 10, 254) }];
        }
    };

    /* ── S10 · layer 7 DNS ──────────────────────────────────────────────────────────────────────── */
    V.S10A = {
        ticket: 'intranet.meridian.local times out by name. The IP from the wiki works.',
        rootCause: 'The intranet A record points one address past the file server.',
        expectedFix: 'Correct the record, increment the serial, reload the zone',
        evidence: ['nslookup intranet.meridian.local on ADMIN-WS01', 'the zone file on MER-SRV01'],
        apply: function (st) {
            var wrong = host(st, 30, 21);
            st.dns.zoneFile.records.forEach(function (r) { if (r.name === 'intranet') r.target = wrong; });
            st.dns.loaded.records.forEach(function (r) { if (r.name === 'intranet') r.target = wrong; });
        },
        /* The SERVED answer must be right, and the serial must have moved -- a student who edits the
         * file without reloading has not fixed anything a client can see, which is S10B's lesson
         * arriving early. */
        fixed: function (st) {
            var fs = ep(st, 'MER-FS01');
            var rec = st.dns.loaded.records.filter(function (r) { return r.name === 'intranet'; })[0];
            return !!fs && !!rec && rec.target === fs.ip
                && st.dns.loaded.serial > TOPO.DNS_ZONE.serial;
        },
        correctFix: function (st) {
            var fs = ep(st, 'MER-FS01');
            st.dns.zoneFile.records.forEach(function (r) { if (r.name === 'intranet') r.target = fs.ip; });
            st.dns.zoneFile.serial = st.dns.zoneFile.serial + 1;
            reloadZone(st);
        },
        wrongFix: function (st) {
            /* Move the file server to the address the record claims. The name resolves and every
             * existing client, share mapping and the fs01 record now point at nothing. */
            var fs = ep(st, 'MER-FS01');
            if (fs) fs.ip = host(st, 30, 21);
        },
        logs: function (st) {
            return [{ device: 'MER-SRV01', sev: 6, facility: 'named',
                text: 'client ' + host(st, 10, 101) + '#51224 query: intranet.meridian.local IN A + (' + st.dns.server + ')' }];
        }
    };
    V.S10B = {
        ticket: "wiki.meridian.local doesn't resolve at all.",
        rootCause: 'The record was added to the zone file but the serial was never incremented, so named is still serving the old zone.',
        expectedFix: 'Increment the serial and reload',
        evidence: ['dig wiki.meridian.local on MER-SRV01', 'the zone file mtime versus systemctl status named'],
        apply: function (st) {
            /* On disk but not in memory -- the only representation of "edited, never reloaded",
             * and the reason the state model keeps zoneFile and loaded as two separate copies. */
            st.dns.loaded.records = st.dns.loaded.records.filter(function (r) { return r.name !== 'wiki'; });
        },
        fixed: function (st) {
            var rec = st.dns.loaded.records.filter(function (r) { return r.name === 'wiki'; })[0];
            return !!rec && st.dns.loaded.serial > TOPO.DNS_ZONE.serial;
        },
        correctFix: function (st) {
            st.dns.zoneFile.serial = st.dns.zoneFile.serial + 1;
            reloadZone(st);
        },
        wrongFix: function (st) {
            /* Hand-edit the served zone without touching the serial. It resolves right now and the
             * next legitimate reload silently reverts it, which is the trap the serial exists for. */
            st.dns.loaded.records.push({ name: 'wiki', type: 'A', target: host(st, 30, 20) });
        },
        logs: function (st) {
            return [{ device: 'MER-SRV01', sev: 6, facility: 'named',
                text: 'zone meridian.local/IN: loaded serial ' + TOPO.DNS_ZONE.serial + ' (zone file modified since last load)' }];
        }
    };

    /* ── S11 · wireless ─────────────────────────────────────────────────────────────────────────── */
    V.S11A = {
        ticket: 'Guest Wi-Fi users can print to the Sales printer.',
        rootCause: 'The guest SSID is mapped to VLAN 10.',
        expectedFix: 'Map Meridian-Guest to VLAN 40',
        evidence: ['the SSID list on MER-WLC01', 'the WLC client list', 'the Kea lease file'],
        apply: function (st) {
            st.ssids.filter(function (s) { return s.name === 'Meridian-Guest'; })[0].vlan = 10;
            CORE.resolveLeases(st);
        },
        fixed: function (st) {
            var ss = st.ssids.filter(function (s) { return s.name === 'Meridian-Guest'; })[0];
            if (!ss || ss.vlan !== 40) return false;
            var guests = st.endpoints.filter(function (e) { return e.ssid === 'Meridian-Guest' && e.dhcp; });
            var allOnGuest = guests.length > 0 && guests.every(function (e) {
                return leased(st, e.name) && ip.inNet(ip.toInt(e.ip), st.subnets[40].parsed);
            });
            var pr = ep(st, 'PRN-SALES01');
            return allOnGuest && !!pr && !reach(st, 'WIFI-GUEST01', pr.ip, { proto: 'tcp', port: 9100 }).ok;
        },
        correctFix: function (st) {
            st.ssids.filter(function (x) { return x.name === 'Meridian-Guest'; })[0].vlan = 40;
            CORE.resolveLeases(st);
        },
        wrongFix: function (st) {
            /* Block printing at the printer instead of fixing the VLAN. Guests stop printing and so
             * does Sales, and the guests are still sitting on the Sales network. */
            st.services['PRN-SALES01'] = { tcp: [], udp: [] };
        },
        logs: function (st) {
            return [{ device: 'MER-WLC01', sev: 6, facility: 'wlc',
                text: 'client associated: SSID Meridian-Guest, VLAN 10, address ' + host(st, 10, 105) }];
        }
    };
    V.S11B = {
        ticket: 'Wi-Fi on floor 2 drops and is slow.',
        rootCause: 'Two adjacent access points share a 2.4 GHz channel, so they interfere.',
        expectedFix: 'Set the 2.4 GHz channels to non-overlapping 1/6/11',
        evidence: ['the AP list on MER-WLC01, with retry counters'],
        apply: function (st, f) {
            f.target.aps.forEach(function (a) { st.wireless.apChannels[a] = f.target.channel; });
        },
        /* Distinct AND inside the plan. Spreading them to 2/7/12 is distinct and wrong; parking all
         * three on 6 is inside the plan and wrong. The invariant checks the same property, which is
         * deliberate: this one is graded and the invariant guards every OTHER fix from breaking it. */
        fixed: function (st) {
            var ch = st.wireless.apChannels, names = Object.keys(ch);
            var vals = names.map(function (a) { return ch[a]; });
            return vals.every(function (c) { return [1, 6, 11].indexOf(c) >= 0; })
                && new Set(vals).size === vals.length;
        },
        correctFix: function (st) {
            st.wireless.apChannels['AP-1'] = 1;
            st.wireless.apChannels['AP-2'] = 6;
            st.wireless.apChannels['AP-3'] = 11;
        },
        wrongFix: function (st, f) {
            /* Separate them onto adjacent channels, which overlap in 2.4 GHz even though the
             * numbers differ -- the textbook misunderstanding this fault exists to catch. */
            st.wireless.apChannels['AP-1'] = 1;
            st.wireless.apChannels['AP-2'] = 2;
            st.wireless.apChannels['AP-3'] = 3;
        },
        logs: function (st, f) {
            return [{ device: 'MER-WLC01', sev: 4, facility: 'wlc',
                text: 'RF: co-channel interference on 2.4GHz ch ' + f.target.channel + ' between ' + f.target.aps.join(' and ') + ', retries 34%' }];
        }
    };

    /* ── S12 · layer 7 operations · the NOC is wrong, or the clock is ───────────────────────────── */
    V.S12A = {
        ticket: 'NOC alert: MeridianSW-02 unreachable (SNMP).',
        rootCause: "SW-02's SNMP community no longer matches what the NOC polls with. The device is up; the alert is a false positive.",
        expectedFix: 'Match the community on SW-02, or on the NOC — either is accepted',
        evidence: ['show snmp community on MeridianSW-02', 'show logging on MeridianSW-02', 'the NOC device settings'],
        apply: function (st) {
            st.devices['MeridianSW-02'].snmp.community = 'meridian-ro-old';
            st.devices['MeridianSW-02'].snmp.authFailures = 142;
        },
        /* Either side may be edited, so this reads the poll result rather than the string. */
        fixed: function (st) {
            var row = tables.snmpPollStatus(st).filter(function (r) { return r.device === 'MeridianSW-02'; })[0];
            return !!row && row.polled === true;
        },
        correctFix: function (st) {
            st.devices['MeridianSW-02'].snmp.community = st.monitoring.community;
            st.devices['MeridianSW-02'].snmp.authFailures = 0;
        },
        wrongFix: function (st) {
            /* Treat the alert as real and reboot the switch into a shut management interface. The
             * alert clears because the NOC stops being told anything at all. */
            port(st, 'MeridianSW-02', 'Vlan99').shutdown = true;
            st.devices['MeridianSW-02'].snmp.community = st.monitoring.community;
        },
        logs: function (st) {
            return [{ device: 'MeridianSW-02', sev: 4, facility: 'SNMP',
                text: '%SNMP-4-AUTHFAIL: Authentication failure for SNMP req from host ' + st.devices['MER-NOC01'].mgmtIp }];
        }
    };
    V.S12B = {
        ticket: 'NOC alert: SW-02 interface flaps, with log timestamps years out of date.',
        rootCause: 'NTP points at a decommissioned server, so the clock never synchronised.',
        expectedFix: 'ntp server 10.{b}.30.10',
        evidence: ['show clock on MeridianSW-02', 'show ntp status on MeridianSW-02'],
        apply: function (st) {
            st.devices['MeridianSW-02'].ntp = {
                server: TOPO.DECOY_DIAGRAM.dnsServer, synchronized: false, offsetSec: 63113904
            };
        },
        fixed: function (st) {
            var n = st.devices['MeridianSW-02'].ntp;
            return !!n && n.server === st.devices['MER-SRV01'].mgmtIp
                && n.synchronized === true && Math.abs(n.offsetSec) <= 1;
        },
        correctFix: function (st) {
            st.devices['MeridianSW-02'].ntp = { server: st.devices['MER-SRV01'].mgmtIp, synchronized: true, offsetSec: 0 };
        },
        wrongFix: function (st) {
            /* Set the clock by hand. The timestamps look right until it drifts again, and
             * `show ntp status` still says unsynchronised. */
            st.devices['MeridianSW-02'].ntp.offsetSec = 0;
        },
        logs: function (st) {
            return [{ device: 'MeridianSW-02', sev: 4, facility: 'NTP',
                text: '%NTP-4-UNSYNC: NTP is not synchronised to server ' + TOPO.DECOY_DIAGRAM.dnsServer + ' (unreachable)' }];
        }
    };

    /* ═══ THE LIBRARY, ASSEMBLED ══════════════════════════════════════════════════════════════════
     * Each entry is merged with its slot/variant/layer/group from the topology, so a variant cannot
     * declare a layer that disagrees with the catalog the incident log is graded against. */
    var VARIANTS = {};
    TOPO.FAULT_SLOTS.forEach(function (slot) {
        Object.keys(slot.variants).forEach(function (vn) {
            var id = slot.slot + vn, def = V[id];
            if (!def) return;                       // completeness is asserted by the test, not here
            VARIANTS[id] = {
                id: id, slot: slot.slot, variant: vn,
                layer: slot.variants[vn].layer, group: slot.variants[vn].group,
                ticket: def.ticket, rootCause: def.rootCause, expectedFix: def.expectedFix,
                evidence: def.evidence.slice(),
                apply: def.apply, fixed: def.fixed, correctFix: def.correctFix,
                wrongFix: def.wrongFix, logs: def.logs
            };
        });
    });

    /* Apply every active fault. Leases are re-resolved once at the end as well as inside the
     * variants that need them, because resolveLeases is idempotent and the order faults run in
     * must not decide who holds which address. */
    function applyAll(state) {
        state.faults.forEach(function (f) {
            if (!f.active || f.applied) return;
            var def = VARIANTS[f.id];
            if (!def) return;
            def.apply(state, f);
            f.applied = true;
        });
        CORE.resolveLeases(state);
        /* Exam start is NOW: faults applied, nothing repaired. */
        if (!state.baseline) { captureBaseline(state); }
        return state;
    }

    /* Which faults are currently repaired. This is the answer key: never send it to a client. */
    function fixedMap(state) {
        var out = {};
        state.faults.forEach(function (f) {
            var def = VARIANTS[f.id];
            if (!def) return;
            try { out[f.id] = !!def.fixed(state, f); }
            catch (e) { out[f.id] = false; }
        });
        return out;
    }

    /* Log lines from the active faults, plus healthy background so the student has to filter.
     * Deterministic: the background is derived from the seed and the device list, never random. */
    function allLogs(state) {
        var lines = [];
        state.faults.forEach(function (f) {
            var def = VARIANTS[f.id];
            if (!def || !f.active || !f.applied) return;
            def.logs(state, f).forEach(function (l) { lines.push(l); });
        });
        var bg = [
            { device: 'MeridianSW-01', sev: 5, facility: 'LINK', text: '%LINK-3-UPDOWN: Interface Fa0/23, changed state to down' },
            { device: 'MeridianSW-02', sev: 5, facility: 'LINK', text: '%LINK-3-UPDOWN: Interface Fa0/19, changed state to down' },
            { device: 'MeridianRTR-01', sev: 5, facility: 'SYS', text: '%SYS-5-CONFIG_I: Configured from console by admin on vty0' },
            { device: 'MeridianSW-01', sev: 6, facility: 'NTP', text: '%NTP-6-SYNC: NTP synchronised to ' + state.devices['MER-SRV01'].mgmtIp },
            { device: 'MER-SRV01', sev: 6, facility: 'named', text: 'zone meridian.local/IN: sending notifies (serial ' + state.dns.loaded.serial + ')' },
            { device: 'MER-FW01', sev: 6, facility: 'filterlog', text: 'pass out on em0: outbound NAT translation table 41% utilised' }
        ];
        bg.forEach(function (l) { lines.push(l); });
        return lines;
    }

    /* Put one device back the way the student found it. Spec section 8: logged, and free. */
    function restoreDevice(state, device) {
        var cfg = state.baseline && state.baseline.deviceConfigs && state.baseline.deviceConfigs[device];
        if (!cfg) { return { ok: false, reason: 'no exam-start config recorded for ' + device }; }
        var put = function (o) { return o === undefined ? undefined : JSON.parse(JSON.stringify(o)); };
        if (cfg.ports) { state.ports[device] = put(cfg.ports); }
        if (cfg.routes) { state.routes[device] = put(cfg.routes); }
        if (cfg.acls) { state.acls[device] = put(cfg.acls); }
        state.devices[device].snmp = put(cfg.snmp);
        state.devices[device].ntp = put(cfg.ntp);
        state.devices[device].files = put(cfg.files);
        if (cfg.svis) { state.svis = put(cfg.svis); }
        if (cfg.dhcp) { state.dhcp = put(cfg.dhcp); }
        if (cfg.dns) { state.dns = put(cfg.dns); }
        if (cfg.nat) { state.nat = put(cfg.nat); }
        if (cfg.ipsec) { state.ipsec = put(cfg.ipsec); }
        if (cfg.ssids) { state.ssids = put(cfg.ssids); }
        if (cfg.wireless) { state.wireless = put(cfg.wireless); }
        CORE.resolveLeases(state);
        state.events = state.events || [];
        state.events.push({ t: state.events.length, actor: device, kind: 'restore', detail: 'restored to exam start' });
        /* A restore can UNDO a fix, and the spec scores that as zero ("the fix later undone"), so
         * the stamp has to be cleared rather than left as a claim that is no longer true.
         *
         * recordProgress ALREADY does exactly that, in exactly those terms, and this function used
         * to repeat the loop inline -- two copies of one rule, which mutation exposed by deleting
         * one and watching nothing fail. Calling the one implementation also means a restore is
         * stamped the same way a fix is, rather than nearly the same way. */
        recordProgress(state, state.events.length - 1);
        return { ok: true };
    }

    /* Stamp the event index at which each fault FIRST became fixed. The spec's credit rule needs
     * it: "full credit only when a change request for that ticket was submitted BEFORE the state
     * change that made the fix pass", so grading compares two positions in the event log and
     * neither can be reconstructed afterwards. Called after every mutating action. */
    function recordProgress(state, eventIndex) {
        var fm = fixedMap(state);
        state.events = state.events || [];
        /* THE INDEX OF THE EVENT THAT CAUSED IT, not the current length. Using the length made a
         * fix and a change request filed immediately after it land on the SAME number, so "was the
         * request filed before the change" had no answer -- and that comparison is the whole credit
         * rule in spec section 8. Every event has a unique index; both sides now use one. */
        var at = (eventIndex === undefined) ? Math.max(0, state.events.length - 1) : eventIndex;
        state.faults.forEach(function (f) {
            if (fm[f.id] && f.fixedAtEvent === undefined) { f.fixedAtEvent = at; }
            if (!fm[f.id] && f.fixedAtEvent !== undefined) { f.fixedAtEvent = undefined; f.undone = true; }
        });
        return state;
    }

    module.exports = {
        VARIANTS: VARIANTS, INVARIANTS: INVARIANTS, checkInvariants: checkInvariants,
        applyAll: applyAll, fixedMap: fixedMap, allLogs: allLogs, reloadZone: reloadZone,
        captureBaseline: captureBaseline, collateralDamage: collateralDamage,
        restoreDevice: restoreDevice, recordProgress: recordProgress
    };
})();
