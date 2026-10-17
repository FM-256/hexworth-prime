#!/usr/bin/env node
/**
 * netfinal-core.test.js — stages 1 and 2 of the Network+ Meridian Corp final exam.
 *
 * @catalog what    Drives the seeded generator, the derived tables and reach() for the Network+
 * @catalog what    final exam core: determinism, the spec's four generator constraints over 1,000
 * @catalog what    seeds, the healthy-path baseline, and a mutation per reach() layer.
 * @catalog run     node _tools/netfinal/netfinal-core.test.js
 * @catalog status  TOOL
 *
 * COVERS THE TWO ACCEPTANCE CRITERIA THE SPEC SETS FOR THESE STAGES (section 11):
 *   - "The same seed produces byte-identical initialState ... on repeated runs."
 *   - "1,000 random seeds generate with no conflict pair active, no duplicate address, and the
 *      management path intact."
 * The answerKey half of the first criterion belongs to stage 6 and is not asserted here.
 *
 * THE CONSTRAINT CHECKS ARE RE-DERIVED, NOT DELEGATED. Section 2 below does NOT call
 * core.validate() to decide whether a lab is legal — it recomputes conflicts, address uniqueness
 * and the management path from the generated state. A gate that asks the gated code whether it
 * passed proves only that the code agrees with itself; this repo has shipped exactly that bug
 * (see feedback_gate_must_rederive_not_trust_cache). validate() is tested separately, in section 7,
 * by feeding it states that are deliberately broken.
 *
 * SECTION 5 APPLIES FAULTS BY HAND, WHICH IS THE POINT. Stage 3 owns the fault library; nothing
 * here imports it. But reach() reporting a layer is worthless unless each layer demonstrably
 * fires, so each case mutates the one field a real fault variant would mutate and asserts the
 * layer and reason. If a layer cannot be made to fail, its check is decoration — that is the
 * lesson of feedback_measure_the_claim_not_a_proxy: could this check have failed?
 */
const path = require('path');
const CORE = path.resolve(__dirname, '../../_app/houses/web/network-plus/final/netfinal-core.js');
const core = require(CORE);
const TOPO = require(path.resolve(__dirname, '../../_app/houses/web/network-plus/final/netfinal-topology.js'));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + detail : '')); }
};
const section = (t) => console.log('\n' + t);
const clone = (s) => JSON.parse(JSON.stringify(s));
const why = (r) => r.failedAt ? ('L' + r.failedAt.layer + ' @' + r.failedAt.device + ': ' + r.failedAt.reason) : 'ok';

const EXAM = 'net-final-2026';
const S = core.generate('student-0001', EXAM);
const sub = (v) => S.subnets[v].cidr.split('/')[0].replace(/\.0$/, '');
const ep = (st, n) => st.endpoints.filter(e => e.name === n)[0];

/* Every fault variant this suite demonstrates is expressible against the state model. Recorded as
 * a ledger and cross-checked against TOPO at the end, so the claim "all 24 are representable"
 * cannot drift: add a thirteenth slot and the final assertion fails until it is covered. Nancy
 * found 5 of 24 unrepresentable when the only record of coverage was a sentence in a header. */
const covered = new Set();
const cover = (...ids) => { ids.forEach(i => covered.add(i)); return true; };

/* ─── 1. determinism ──────────────────────────────────────────────────────────────────────────── */
section('1. determinism and seed separation');
{
    const a = core.generate('student-0001', EXAM);
    const b = core.generate('student-0001', EXAM);
    chk('the same seed produces byte-identical state', JSON.stringify(a) === JSON.stringify(b));
    const c = core.generate('student-0002', EXAM);
    chk('a different studentId produces a different lab', JSON.stringify(a) !== JSON.stringify(c));
    const d = core.generate('student-0001', 'net-final-retake');
    chk('a different examId produces a different lab', JSON.stringify(a) !== JSON.stringify(d));
    /* The spec writes the seed as hash(studentId + examId). Bare concatenation collides: 'ab'+'c'
     * and 'a'+'bc' would be one lab, so two students could sit the identical exam.
     *
     * Compared on the LAB, with the identity fields stripped. Comparing whole-state JSON compares
     * meta.studentId and meta.examId too, which differ by construction -- so the check passed even
     * when every addressable thing in the two labs was identical. */
    const labOf = (st) => { const c = clone(st); delete c.meta; return JSON.stringify(c); };
    chk('concatenation-ambiguous ids do NOT produce the same lab',
        labOf(core.generate('ab', 'c')) !== labOf(core.generate('a', 'bc')));
    chk('the lab comparison itself is sound (same ids still match on it)',
        labOf(core.generate('ab', 'c')) === labOf(core.generate('ab', 'c')));
    /* Stage 7 serves the state from a server, so it has to survive a JSON round trip. */
    chk('state is JSON-serialisable with no loss', JSON.stringify(clone(a)) === JSON.stringify(a));
    chk('no Date or clock leaked into the state', !/\b20\d\d-\d\d-\d\dT/.test(JSON.stringify(a)));
}

/* ─── 2. the spec's four generator constraints, over 1,000 seeds ──────────────────────────────── */
section('2. 1,000 seeds against the four generator constraints (independently re-derived)');
{
    const N = 1000;
    let conflicted = 0, dupAddr = 0, dupMac = 0, mgmtBroken = 0, noLease = 0, threw = 0;
    let rogueBad = 0, decoyHit = 0, portMissing = 0, maxAttempts = 0, chanBad = 0;
    let linkCountBad = 0, portShapeBad = 0, portRosterBad = 0;
    const firstProblem = {};
    /* DERIVED from the spec's own device table, not listed by hand. The hand-written list here
     * reproduced validate()'s identical omission -- both covered 6 of the 8 managed devices and
     * both missed MER-FW01 and MER-WEB01 -- so not calling validate() made this check independent
     * in form but not in substance. Deriving from TOPO.DEVICES means a device added to the roster
     * is covered automatically, and the count is asserted so a shrinking roster is visible. */
    const MGMT = TOPO.DEVICES.map(d => d.id).filter(id => id !== 'ADMIN-WS01');
    chk('the management sweep covers every managed device in the spec\u2019s device table',
        MGMT.length === 8 && MGMT.indexOf('MER-FW01') >= 0 && MGMT.indexOf('MER-WEB01') >= 0,
        MGMT.length + ': ' + MGMT.join(','));

    for (let i = 0; i < N; i++) {
        let st;
        try { st = core.generate('seed-' + i, EXAM); }
        catch (e) { threw++; firstProblem.threw = firstProblem.threw || e.message; continue; }
        maxAttempts = Math.max(maxAttempts, st.meta.attempts);

        // constraint 1: no conflict pair active
        const on = {};
        st.faults.forEach(f => { if (f.active) on[f.id] = true; });
        const bad = TOPO.CONFLICT_PAIRS.filter(p => on[p[0]] && on[p[1]]);
        if (bad.length) { conflicted++; firstProblem.conflict = firstProblem.conflict || JSON.stringify(bad); }

        // constraint 4: unique addresses and MACs, no collision with the stale diagram
        const ips = {}, macs = {};
        const decoys = [TOPO.DECOY_DIAGRAM.dnsServer, TOPO.DECOY_DIAGRAM.sw02Mgmt];
        st.endpoints.forEach(e => {
            if (e.ip && !/^169\.254\./.test(e.ip)) {
                if (ips[e.ip]) { dupAddr++; firstProblem.dup = firstProblem.dup || (e.ip + ' ' + ips[e.ip] + '/' + e.name); }
                ips[e.ip] = e.name;
                if (decoys.indexOf(e.ip) >= 0) { decoyHit++; firstProblem.decoy = firstProblem.decoy || (e.name + ' at ' + e.ip); }
            }
            if (macs[e.mac]) { dupMac++; firstProblem.mac = firstProblem.mac || e.mac; }
            macs[e.mac] = e.name;
            if (e.switch && !e.port) { portMissing++; firstProblem.port = firstProblem.port || e.name; }
        });
        Object.keys(st.svis).forEach(v => {
            const ip = st.svis[v].ip;
            if (ips[ip]) { dupAddr++; firstProblem.dup = firstProblem.dup || (ip + ' svi/' + ips[ip]); }
            ips[ip] = st.svis[v].iface;
        });

        // constraint 2: the management path is intact from ADMIN-WS01 to every managed device
        for (const d of MGMT) {
            const ip = st.devices[d].mgmtIp;
            if (!ip) { mgmtBroken++; firstProblem.mgmt = firstProblem.mgmt || (d + ' has no mgmt address'); break; }
            const r = core.reach(st, 'ADMIN-WS01', ip, { proto: 'icmp' });
            if (!r.ok) { mgmtBroken++; firstProblem.mgmt = firstProblem.mgmt || (d + ' ' + why(r)); break; }
        }
        // constraint 2, continued: the fix for S4 is `shutdown` on the rogue's port, so that port
        // must never be a trunk or a VLAN-99 port or the correct answer ends the student's exam.
        const rp = st.ports[st.rogue.switch][st.rogue.port];
        if (!rp || rp.mode !== 'access' || rp.vlan === 99 || rp.shutdown) {
            rogueBad++; firstProblem.rogue = firstProblem.rogue || JSON.stringify(st.rogue);
        }
        // constraint 3: ADMIN-WS01 always holds a lease
        const ws = ep(st, 'ADMIN-WS01');
        if (!ws || !ws.lease || /^169\.254\./.test(ws.ip)) { noLease++; firstProblem.lease = firstProblem.lease || (ws ? ws.ip : 'absent'); }

        /* The duplicated-construction defect, checked on every seed rather than on one. */
        if (st.links.length !== TOPO.LINKS.length
            || new Set(st.links.map(l => Object.keys(l).sort().join(','))).size !== 1) {
            linkCountBad++;
            firstProblem.links = firstProblem.links || (st.links.length + ' links, shapes: '
                + [...new Set(st.links.map(l => Object.keys(l).sort().join(',')))].join(' | '));
        }
        /* THE ROSTER, before the shapes. Chris's residual: this loop audits the shape of ports that
         * EXIST, so a device that lost its entire port map is invisible to it -- that regression
         * (reverting the routed-device port creation) was caught only by a later crash. A crash is
         * a loud failure, but stage-3 debugging should start from a message, not a stack trace.
         * The expected roster is derived: every switch in PORT_PLAN, plus every device named by an
         * end of a declared link. */
        const needPorts = new Set(Object.keys(TOPO.PORT_PLAN));
        TOPO.LINKS.forEach(l => [l.a, l.b].forEach(([dev]) => needPorts.add(dev)));
        for (const d of needPorts) {
            if (!st.ports[d] || Object.keys(st.ports[d]).length === 0) {
                portRosterBad++; firstProblem.roster = firstProblem.roster || (d + ' has no ports at all');
            }
        }
        for (const d of Object.keys(st.ports)) {
            for (const pn of Object.keys(st.ports[d])) {
                const pt = st.ports[d][pn];
                if (typeof pt.up !== 'boolean' || typeof pt.errorRate !== 'number') {
                    portShapeBad++; firstProblem.portShape = firstProblem.portShape || (d + ':' + pn);
                }
            }
        }

        const ch = st.wireless.apChannels;
        const vals = Object.keys(ch).map(k => ch[k]);
        if (vals.some(v => [1, 6, 11].indexOf(v) < 0) || new Set(vals).size !== vals.length) {
            chanBad++; firstProblem.chan = firstProblem.chan || JSON.stringify(ch);
        }
    }

    chk(N + ' seeds all generated without throwing', threw === 0, firstProblem.threw);
    chk('no seed had a conflict pair active', conflicted === 0, firstProblem.conflict);
    chk('no seed had a duplicate address', dupAddr === 0, firstProblem.dup);
    chk('no seed had a duplicate MAC', dupMac === 0, firstProblem.mac);
    chk('no seeded address collided with the stale diagram', decoyHit === 0, firstProblem.decoy);
    chk('the management path was intact on every seed', mgmtBroken === 0, firstProblem.mgmt);
    chk('the rogue port is always a shuttable user-VLAN access port', rogueBad === 0, firstProblem.rogue);
    chk('ADMIN-WS01 held a lease on every seed', noLease === 0, firstProblem.lease);
    chk('every endpoint with a switch got a port', portMissing === 0, firstProblem.port);
    chk('2.4 GHz channels always start as a clean 1/6/11 permutation', chanBad === 0, firstProblem.chan);
    chk('every seed produced one link per adjacency, all the same shape', linkCountBad === 0, firstProblem.links);
    chk('every seed produced ports with a uniform physical shape', portShapeBad === 0, firstProblem.portShape);
    chk('every seed gave a port map to every switch and every link-named device',
        portRosterBad === 0, firstProblem.roster);
    /* Enumeration, not rejection: if this ever climbs the generator has quietly gone back to
     * redrawing, which at a 3.1% acceptance rate fails for about one student in eight. */
    chk('no seed needed more than one generation attempt', maxAttempts === 1, 'worst was ' + maxAttempts);
}

/* ─── 3. the variant space, as a number rather than a claim ───────────────────────────────────── */
section('3. the conflict list leaves far less variation than the spec advertises');
{
    const vs = core.variantSpace();
    chk('2^12 = 4,096 candidate combinations', vs.total === 4096);
    chk('only 128 of them satisfy the spec’s own conflict pairs', vs.legal === 128, 'got ' + vs.legal);
    chk('five slots are pinned to a single variant: S11B S2A S3A S5A S7B',
        vs.pinnedVariants.join(' ') === 'S11B S2A S3A S5A S7B', vs.pinnedVariants.join(' '));
    chk('seven slots genuinely vary', vs.varyingSlots.length === 7, vs.varyingSlots.join(' '));
    chk('every enumerated combination is conflict-free', core.conflictFreeCombinations().every(c => {
        const on = {}; c.forEach(id => on[id] = true);
        return !TOPO.CONFLICT_PAIRS.some(p => on[p[0]] && on[p[1]]);
    }));
    /* The enumerated set is memoised, and the file's own comment defends that on the grounds that
     * it is a cache over a CONSTANT. That only holds if nothing mutates it in place -- so the
     * snapshot is compared after generating labs, which is when a caller would have had the chance.
     * Mutation showed an in-place sort of a drawn combination went unnoticed. */
    const comboSnapshot = JSON.stringify(core.conflictFreeCombinations());
    core.generate('combo-guard-1', EXAM); core.generate('combo-guard-2', EXAM);
    chk('generating labs does not mutate the memoised conflict-free set',
        JSON.stringify(core.conflictFreeCombinations()) === comboSnapshot);
    chk('every enumerated combination lists its slots in declaration order',
        core.conflictFreeCombinations().every(c =>
            c.map(id => id.slice(0, -1)).join(',') === TOPO.FAULT_SLOTS.map(sl => sl.slot).join(',')),
        JSON.stringify(core.conflictFreeCombinations()[0]));
    chk('every enumerated combination names all 12 slots exactly once',
        core.conflictFreeCombinations().every(c => c.length === 12 && new Set(c.map(x => x.slice(0, -1))).size === 12));
}

/* ─── 4. address arithmetic above 2^31 ────────────────────────────────────────────────────────── */
section('4. address arithmetic (the signed-32-bit trap both WAN ranges sit in)');
{
    const ip = core.ip;
    chk('203.0.113.5 is inside 203.0.113.4/30', ip.inNet(ip.toInt('203.0.113.5'), ip.parseCidr('203.0.113.4/30')));
    chk('203.0.113.9 is NOT inside 203.0.113.4/30', !ip.inNet(ip.toInt('203.0.113.9'), ip.parseCidr('203.0.113.4/30')));
    chk('198.51.100.200 is inside 198.51.100.0/24', ip.inNet(ip.toInt('198.51.100.200'), ip.parseCidr('198.51.100.0/24')));
    chk('a round trip survives the high half of the space', ip.toStr(ip.toInt('255.255.255.254')) === '255.255.255.254');
    chk('/25 splits a /24 correctly', !ip.inNet(ip.toInt('10.50.40.150'), ip.parseCidr('10.50.40.0/25'))
        && ip.inNet(ip.toInt('10.50.40.100'), ip.parseCidr('10.50.40.0/25')));
    chk('maskToPrefix round-trips', ip.maskToPrefix(ip.prefixToMask(25)) === 25 && ip.maskToPrefix('255.255.255.252') === 30);
    chk('a malformed address is rejected, not coerced',
        ip.toInt('10.1.1.999') === null && ip.toInt('10.1.1') === null && ip.toInt('10.1.1.1.1') === null);
    chk('every WAN /30 the generator can draw is aligned', (() => {
        for (let i = 0; i < 200; i++) {
            const st = core.generate('align-' + i, EXAM);
            const p = ip.parseCidr(st.params.wan.cidr);
            if (ip.toInt(st.params.wan.cidr.split('/')[0]) !== p.net) return false;
            if (!ip.inNet(ip.toInt(st.params.wan.fwIp), p) || !ip.inNet(ip.toInt(st.params.wan.ispIp), p)) return false;
        }
        return true;
    })());
    chk('b is always 16-250 and never 200', (() => {
        for (let i = 0; i < 300; i++) {
            const b = core.generate('b-' + i, EXAM).params.b;
            if (b < 16 || b > 250 || b === 200) return false;
        }
        return true;
    })());
}

/* ─── 5. reach(): the healthy baseline ────────────────────────────────────────────────────────── */
section('5. reach() on a healthy lab: what must work, and what must correctly refuse');
{
    const ok = (name, src, dst, opts) => {
        const r = core.reach(S, src, dst, opts);
        chk(name, r.ok, why(r));
        return r;
    };
    const no = (name, src, dst, opts, layer) => {
        const r = core.reach(S, src, dst, opts);
        chk(name, !r.ok && (layer === undefined || r.failedAt.layer === layer), why(r));
        return r;
    };
    ok('ADMIN-WS01 reaches its default gateway', 'ADMIN-WS01', S.svis[10].ip);
    ok('ADMIN-WS01 reaches the file server on TCP 445', 'ADMIN-WS01', sub(30) + '.20', { proto: 'tcp', port: 445 });
    ok('ADMIN-WS01 reaches the Sales printer on TCP 9100', 'ADMIN-WS01', ep(S, 'PRN-SALES01').ip, { proto: 'tcp', port: 9100 });
    ok('ADMIN-WS01 reaches SW-02 management across the trunk', 'ADMIN-WS01', S.devices['MeridianSW-02'].mgmtIp);
    ok('ADMIN-WS01 reaches the DMZ web server on TCP 443', 'ADMIN-WS01', '172.16.50.10', { proto: 'tcp', port: 443 });
    ok('ADMIN-WS01 reaches the internet (outbound NAT)', 'ADMIN-WS01', '8.8.8.8');
    ok('ADMIN-WS01 reaches the branch NAS across the tunnel', 'ADMIN-WS01', '10.200.0.25', { proto: 'tcp', port: 445 });

    const byName = ok('a name resolves and the path follows it', 'ADMIN-WS01', 'fs01.meridian.local', { proto: 'tcp', port: 445 });
    chk('the DNS answer is recorded on the result', byName.dns && byName.dns.answer === sub(30) + '.20', JSON.stringify(byName.dns));
    const natted = core.reach(S, 'ADMIN-WS01', '8.8.8.8');
    chk('the outbound translation is reported', natted.nat && natted.nat.to === S.params.wan.fwIp, JSON.stringify(natted.nat));

    ok('an engineering host on floor 2 reaches the internet', 'ENG-PC05', '8.8.8.8');
    ok('a public name resolves through the internal forwarder', 'ADMIN-WS01', 'www.example.com', { proto: 'tcp', port: 443 });
    ok('a guest resolves a public name through the public resolver', 'WIFI-GUEST01', 'www.example.com', { proto: 'tcp', port: 443 });
    ok('an internal name for the DMZ site resolves and reaches it', 'ADMIN-WS01', 'www.meridian.local', { proto: 'tcp', port: 443 });
    ok('a wireless Sales client reaches the file server', 'WIFI-SALES01', sub(30) + '.20', { proto: 'tcp', port: 445 });
    ok('a guest reaches the internet', 'WIFI-GUEST01', '8.8.8.8');
    ok('an outside host reaches the public site over the port forward', core.constants.OUTSIDE,
        S.params.wan.fwIp, { proto: 'tcp', port: 443 });

    // Correct refusals: these are the HEALTHY policy working, not faults.
    no('a guest is denied the file server by GUEST-IN', 'WIFI-GUEST01', sub(30) + '.20', { proto: 'tcp', port: 445 }, 4);
    no('a guest cannot resolve an internal name (public resolver)', 'WIFI-GUEST01', 'fs01.meridian.local', { proto: 'tcp', port: 445 }, 7);
    no('an unknown name is NXDOMAIN', 'ADMIN-WS01', 'nope.meridian.local', {}, 7);
    no('a closed port is refused at layer 4', 'ADMIN-WS01', sub(30) + '.20', { proto: 'tcp', port: 23 }, 4);
    no('the WAN address offers no SSH from outside', core.constants.OUTSIDE, S.params.wan.fwIp, { proto: 'tcp', port: 22 }, 4);
    no('an address nothing answers at fails at layer 3', 'ADMIN-WS01', sub(30) + '.99', {}, 3);

    const t = core.reach(S, 'ADMIN-WS01', '10.200.0.25', { proto: 'tcp', port: 445 });
    chk('hops are numbered consecutively from 1', t.hops.every((h, i) => h.n === i + 1), JSON.stringify(t.hops.map(h => h.n)));
    chk('the hop list traverses router then firewall then the NAS',
        t.hops.map(h => h.device).join(' > ') === 'ADMIN-WS01 > MeridianRTR-01 > MER-FW01 > BR-NAS01',
        t.hops.map(h => h.device).join(' > '));
}

/* ─── 6. reach(): one mutation per layer, so no layer is decoration ───────────────────────────── */
section('6. each reach() layer demonstrably fires (hand-applied, in the shape of a real variant)');
{
    const expect = (name, mutate, src, dst, opts, layer, reasonRe) => {
        const st = clone(S);
        mutate(st);
        const r = core.reach(st, src, dst, opts || {});
        const okLayer = !r.ok && r.failedAt.layer === layer;
        const okReason = !reasonRe || (r.failedAt && reasonRe.test(r.failedAt.reason));
        chk(name, okLayer && okReason, why(r));
        return r;
    };
    const wsPort = ep(S, 'ADMIN-WS01').port;
    const G10 = S.svis[10].ip;

    // Layer 1 — a shut port.
    expect('L1: a shut access port stops the path', st => {
        st.ports['MeridianSW-01'][wsPort].shutdown = true;
    }, 'ADMIN-WS01', G10, {}, 1, /administratively down/);

    // Layer 1 - a dead inter-switch cable, set on the PORT, which is where the state lives now.
    expect('L1: a dead inter-switch cable stops a floor-2 host', st => {
        st.ports['MeridianSW-01']['Gi0/1'].up = false;
    }, 'SALES-PC04', G10, {}, 1, /no link \(cable down\)/);

    /* Layer 1 on the THREE ROUTED LINKS. Nancy proved reach() consulted no physical state for the
     * transit, WAN and DMZ links at all: each could be marked down and every path stayed healthy,
     * because l2Deliver short-circuits for endpoints with no switch attachment and nothing else
     * looked. 3 of the 5 physical links, unguarded, while the file's header claimed every field a
     * fault needs is already read by reach(). */
    expect('L1: the WAN cable down blocks the internet', st => {
        st.ports['MER-FW01']['WAN'].up = false;
    }, 'ADMIN-WS01', '8.8.8.8', {}, 1, /WAN has no link/);
    expect('L1: the DMZ cable down blocks the web server', st => {
        st.ports['MER-FW01']['DMZ'].up = false;
    }, 'ADMIN-WS01', '172.16.50.10', { proto: 'tcp', port: 443 }, 1, /DMZ has no link/);
    expect('L1: the transit cable down blocks everything past the router', st => {
        st.ports['MeridianRTR-01']['Gi0/1'].up = false;
    }, 'ADMIN-WS01', '8.8.8.8', {}, 1, /Gi0\/1 has no link/);
    expect('L1: a total error rate on a routed link drops traffic', st => {
        st.ports['MER-FW01']['WAN'].errorRate = 1;
    }, 'ADMIN-WS01', '8.8.8.8', {}, 1, /error rate is total/);
    /* The same threshold on a SWITCH port goes through portCarries rather than physOk. Mutation
     * showed deleting that branch left the suite green: routed ports were covered, switch ports
     * were not, and they are two different code paths. */
    expect('L1: a total error rate on an access port drops traffic', st => {
        st.ports['MeridianSW-01'][ep(st, 'ADMIN-WS01').port].errorRate = 1;
    }, 'ADMIN-WS01', G10, {}, 1, /error rate is total/);
    {   // ...and a partial rate still passes traffic, which is what S1A/S1B depend on.
        const st = clone(S);
        st.ports['MeridianSW-01'][ep(st, 'ADMIN-WS01').port].errorRate = 0.4;
        chk('L1: a PARTIAL error rate still carries traffic (S1A/S1B say slow, not dead)',
            core.reach(st, 'ADMIN-WS01', G10).ok);
    }

    /* A sub-interface rides on its physical parent, so Gi0/0 going down must take EVERY VLAN with
     * it rather than none -- the router's whole inter-VLAN function is on that one cable. */
    expect('L1: the router uplink down strands inter-VLAN routing', st => {
        st.ports['MeridianRTR-01']['Gi0/0'].up = false;
    }, 'ADMIN-WS01', sub(30) + '.20', { proto: 'tcp', port: 445 }, 1, /Gi0\/0\.10 has no link/);
    {   // ...while a same-subnet path is untouched by it, which is how a student tells them apart.
        const st = clone(S);
        st.ports['MeridianRTR-01']['Gi0/0'].up = false;
        chk('L1: ...but same-VLAN traffic still works with the router uplink down',
            core.reach(st, 'ADMIN-WS01', ep(st, 'PRN-SALES01').ip, { proto: 'tcp', port: 9100 }).ok);
    }

    // Layer 2 — S2B's shape: the access port moved to the wrong VLAN.
    expect('L2: an access port in the wrong VLAN strands the host', st => {
        st.ports['MeridianSW-01'][wsPort].vlan = 30;
    }, 'ADMIN-WS01', G10, {}, 2, /access port in VLAN 30/);

    // Layer 2 — S3B's shape: VLAN 10 dropped from the floor-2 trunk.
    expect('L2: a VLAN missing from a trunk strands floor-2 Sales', st => {
        ['MeridianSW-01', 'MeridianSW-02'].forEach(sw => {
            const p = st.ports[sw]['Gi0/1'];
            p.allowed = p.allowed.filter(v => v !== 10);
        });
    }, 'SALES-PC04', G10, {}, 2, /does not allow VLAN 10/);

    /* Layer 2 - a one-sided trunk list, in BOTH directions. The two cases are not redundant: with
     * the source on SW-02, breaking SW-02's end is caught by the near-end check and breaking
     * SW-01's end can only be caught by the far-end check. Mutation-proved -- with only the first
     * case present, deleting the far-end check from l2Path left all 139 assertions green. */
    expect('L2: a trunk list broken at the NEAR end is a break', st => {
        const p = st.ports['MeridianSW-02']['Gi0/1'];
        p.allowed = p.allowed.filter(v => v !== 10);
    }, 'SALES-PC04', G10, {}, 2, /does not allow VLAN 10/);
    expect('L2: a trunk list broken at the FAR end is equally a break', st => {
        const p = st.ports['MeridianSW-01']['Gi0/1'];
        p.allowed = p.allowed.filter(v => v !== 10);
    }, 'SALES-PC04', G10, {}, 2, /does not allow VLAN 10/);

    // Layer 3 — S5B's shape: the sub-interface answers on .254, clients are handed .1.
    expect('L3: no device answers for the handed-out gateway', st => {
        st.svis[10].ip = sub(10) + '.254';
    }, 'ADMIN-WS01', sub(30) + '.20', {}, 3, /no device answers for gateway/);

    // Layer 3 — S5A's shape: /25 on the sub-interface, a guest above .127.
    expect('L3: a /25 sub-interface breaks the return path for a high guest', st => {
        st.svis[40].mask = '255.255.255.128';
        st.routes['MeridianRTR-01'].forEach(r => { if (r.vlan === 40) r.prefix = 25; });
        const g = ep(st, 'WIFI-GUEST01');
        g.ip = sub(40) + '.150';
    }, 'WIFI-GUEST01', '8.8.8.8', {}, 3, /return path/);

    // Layer 3 — S6A's shape: a leftover static route with a next hop off-link.
    expect('L3: a dead next hop off the transit link stops the branch path', st => {
        st.routes['MeridianRTR-01'].filter(r => r.cidr === st.params.branch.cidr)[0].nextHop = '172.16.0.6';
    }, 'ADMIN-WS01', '10.200.0.25', { proto: 'tcp', port: 445 }, 3, /not on any connected subnet/);

    // Layer 3 — S6B's shape: phase 2 missing the Engineering network.
    expect('L3: a missing IPsec phase-2 entry stops only that network', st => {
        st.ipsec.phase2 = st.ipsec.phase2.filter(p => p.local !== st.subnets[20].cidr);
    }, 'ENG-PC01', '10.200.0.25', { proto: 'tcp', port: 445 }, 3, /phase-2/);
    {   // ...and Sales still reaches it, which is the ticket's own distinguishing detail.
        const st = clone(S);
        st.ipsec.phase2 = st.ipsec.phase2.filter(p => p.local !== st.subnets[20].cidr);
        chk('L3: Sales still reaches the branch with Engineering’s phase 2 removed',
            core.reach(st, 'ADMIN-WS01', '10.200.0.25', { proto: 'tcp', port: 445 }).ok);
    }

    // Layer 4 — S7A's shape: no outbound NAT rule for Engineering.
    expect('L4: a missing outbound NAT rule blocks the internet but not DNS', st => {
        st.nat.outbound = st.nat.outbound.filter(r => r.src !== st.subnets[20].cidr);
    }, 'ENG-PC01', '8.8.8.8', {}, 4, /no outbound NAT rule/);

    // The forwarder dependency, stated as a test: strip the Servers NAT rule and PUBLIC names stop
    // resolving for everyone, while meridian.local names keep working. Students are expected to
    // reason about this, so it must be real rather than incidental.
    expect('L7: with no NAT for the Servers VLAN, public names stop resolving', st => {
        st.nat.outbound = st.nat.outbound.filter(r => r.src !== st.subnets[30].cidr);
    }, 'ADMIN-WS01', 'www.example.com', { proto: 'tcp', port: 443 }, 7, /cannot reach the internet to forward/);
    {
        const st = clone(S);
        st.nat.outbound = st.nat.outbound.filter(r => r.src !== st.subnets[30].cidr);
        chk('L7: ...while internal names still resolve',
            core.reach(st, 'ADMIN-WS01', 'fs01.meridian.local', { proto: 'tcp', port: 445 }).ok);
    }

    // Layer 4 — S7B's shape: the port forward aimed one address past the web server.
    expect('L4: a port forward to an empty address fails at the firewall', st => {
        st.nat.portForwards.filter(f => f.wanPort === 443)[0].toIp = '172.16.50.11';
    }, core.constants.OUTSIDE, S.params.wan.fwIp, { proto: 'tcp', port: 443 }, 3, /no host answers/);

    // Layer 4 — S8B's shape: a wrong deny line inserted above the permit.
    expect('L4: a deny line above the permit blocks Sales SMB', st => {
        st.acls['MeridianRTR-01']['SERVERS-OUT'].lines.unshift({
            seq: 5, action: 'deny', proto: 'tcp', src: st.subnets[10].cidr, dst: 'any', dstPort: 445, hits: 0
        });
    }, 'ADMIN-WS01', sub(30) + '.20', { proto: 'tcp', port: 445 }, 4, /denied outbound by SERVERS-OUT/);
    {   // ...and ping still works, which is exactly what the S8B ticket reports.
        const st = clone(S);
        st.acls['MeridianRTR-01']['SERVERS-OUT'].lines.unshift({
            seq: 5, action: 'deny', proto: 'tcp', src: st.subnets[10].cidr, dst: 'any', dstPort: 445, hits: 0
        });
        chk('L4: "can ping the file server but can’t open the share" reproduces',
            core.reach(st, 'ADMIN-WS01', sub(30) + '.20', { proto: 'icmp' }).ok);
    }

    // S8A's shape: ACL order inverted, so the deny becomes dead code and a guest gets in.
    {
        const st = clone(S);
        const acl = st.acls['MeridianRTR-01']['GUEST-IN'];
        acl.lines = [
            { seq: 10, action: 'permit', proto: 'ip', src: 'any', dst: 'any', hits: 0 },
            { seq: 20, action: 'deny', proto: 'ip', src: st.subnets[40].cidr, dst: '10.' + st.params.b + '.0.0/16', hits: 0 }
        ];
        const r = core.reach(st, 'WIFI-GUEST01', sub(30) + '.20', { proto: 'tcp', port: 445 });
        chk('ACL order matters: a permit above the deny lets a guest reach SMB', r.ok, why(r));
    }

    // Layer 7 — S10A's shape: a stale A record, served from the loaded zone.
    {
        const st = clone(S);
        st.dns.loaded.records.filter(r => r.name === 'intranet')[0].target = sub(30) + '.21';
        const r = core.reach(st, 'ADMIN-WS01', 'intranet.meridian.local', { proto: 'tcp', port: 445 });
        chk('L7: a stale A record resolves, and the path to the wrong address then fails at L3',
            !r.ok && r.dns && r.dns.answer === sub(30) + '.21' && r.failedAt.layer === 3, why(r));
        chk('L7: nslookup still answers, with the wrong address',
            core.tables.dnsAnswers(st).records.filter(x => /^intranet\./.test(x.fqdn))[0].target === sub(30) + '.21');
    }

    // Layer 7 — S10B's shape: edited on disk, never reloaded.
    {
        const st = clone(S);
        st.dns.zoneFile.records = st.dns.zoneFile.records.filter(r => r.name !== 'wiki');
        st.dns.loaded.records = st.dns.loaded.records.filter(r => r.name !== 'wiki');
        st.dns.zoneFile.records.push({ name: 'wiki', type: 'A', target: sub(30) + '.20' });
        const r = core.reach(st, 'ADMIN-WS01', 'wiki.meridian.local', {});
        chk('L7: a record on disk but not reloaded is NXDOMAIN', !r.ok && r.failedAt.layer === 7 && /NXDOMAIN/.test(r.failedAt.reason), why(r));
        chk('L7: the zone FILE still shows the record the student edited',
            st.dns.zoneFile.records.some(x => x.name === 'wiki'));
    }

    // S9A's shape: the pool shrunk below the client count strands the LAST hosts in line, never
    // ADMIN-WS01 — which is spec constraint 3, and the reason the request order is seeded.
    {
        const st = clone(S);
        const reserved = st.dhcp.reservations.map(r => r.mac);
        const poolClients = st.endpoints.filter(e =>
            e.dhcp && (e.vlanEffective || e.vlan) === 10 && reserved.indexOf(e.mac) < 0).length;
        st.dhcp.subnets[10].pool.end = sub(10) + '.' + (100 + poolClients - 1 - st.params.s9aShortfall);
        st.endpoints.forEach(e => { if (e.dhcp) { e.ip = null; e.lease = null; } });
        core.resolveLeases(st);
        const stranded = st.endpoints.filter(e => e.dhcp && /^169\.254\./.test(e.ip));
        chk('S9A: shrinking the Sales pool strands exactly the shortfall', stranded.length === st.params.s9aShortfall,
            stranded.length + ' stranded, shortfall ' + st.params.s9aShortfall);
        chk('S9A: ADMIN-WS01 is never among the stranded', !stranded.some(e => e.name === 'ADMIN-WS01'),
            stranded.map(e => e.name).join(','));
        const r = core.reach(st, stranded[0].name, sub(30) + '.20', {});
        chk('S9A: a stranded host fails at layer 3 naming its link-local address',
            !r.ok && r.failedAt.layer === 3 && /169\.254/.test(r.failedAt.reason), why(r));
    }

    // S11A's shape: the guest SSID mapped to VLAN 10 puts guests on Sales addresses.
    {
        const st = clone(S);
        st.ssids.filter(s => s.name === 'Meridian-Guest')[0].vlan = 10;
        st.endpoints.forEach(e => { if (e.dhcp) { e.ip = null; e.lease = null; } });
        core.resolveLeases(st);
        const g = ep(st, 'WIFI-GUEST01');
        chk('S11A: a guest leases a Sales address when the SSID is mis-mapped',
            core.ip.inNet(core.ip.toInt(g.ip), st.subnets[10].parsed), g.ip);
        chk('S11A: and can then reach the Sales printer, which is the ticket',
            core.reach(st, 'WIFI-GUEST01', ep(st, 'PRN-SALES01').ip, { proto: 'tcp', port: 9100 }).ok);
    }
}

    /* The variants sections 5 and 6 above demonstrate, recorded in the ledger. */
    cover('S1A', 'S1B', 'S2B', 'S3A', 'S3B', 'S5A', 'S5B', 'S6A', 'S6B',
          'S7A', 'S7B', 'S8A', 'S8B', 'S9A', 'S10A', 'S10B', 'S11A');

    /* S2A - the PRINTER's port moved to VLAN 20, so it leases a 10.{b}.20.x address. The spec's
     * ticket is literally "its screen shows a 10.{b}.20.x address", so the lease is the symptom. */
    {
        const st = clone(S);
        const pr = ep(st, 'PRN-SALES01');
        st.ports[pr.switch][pr.port].vlan = 20;
        st.endpoints.forEach(e => { if (e.dhcp) { e.ip = null; e.lease = null; } });
        core.resolveLeases(st);
        chk('S2A: the printer leases in VLAN 20, not its reservation',
            core.ip.inNet(core.ip.toInt(ep(st, 'PRN-SALES01').ip), st.subnets[20].parsed),
            ep(st, 'PRN-SALES01').ip);
        /* The print queue targets the RESERVATION address, which is what the spec's graded state
         * names ("ADMIN-WS01 reaches it on TCP 9100"). Asserting against the printer's CURRENT
         * address was wrong and passed trivially: inter-VLAN routing does reach it at its new
         * 10.{b}.20.x address, which is realistic and is part of the diagnosis rather than the
         * fault. What breaks is the address everything is configured to use. */
        const resIp = st.dhcp.reservations[0].ip;
        const r2a = core.reach(st, 'ADMIN-WS01', resIp, { proto: 'tcp', port: 9100 });
        chk('S2A: nothing answers at the printer\u2019s reservation address any more',
            !r2a.ok && r2a.failedAt.layer === 3, why(r2a));
        chk('S2A: the healthy lab DOES reach it there (the check can fail)',
            core.reach(S, 'ADMIN-WS01', S.dhcp.reservations[0].ip, { proto: 'tcp', port: 9100 }).ok);
        chk('S2A: the printer is still pingable at its WRONG address, which is the diagnosis',
            core.reach(st, 'ADMIN-WS01', ep(st, 'PRN-SALES01').ip, { proto: 'icmp' }).ok);
        cover('S2A');
    }

    /* S9B - the Sales `routers` option set to .254. Clients lease fine but carry a gateway nothing
     * answers for, which is why the ticket says "get an address but can't reach anything outside". */
    {
        const st = clone(S);
        st.dhcp.subnets[10].routers = sub(10) + '.254';
        st.endpoints.forEach(e => { if (e.dhcp) { e.ip = null; e.lease = null; } });
        core.resolveLeases(st);
        const ws = ep(st, 'ADMIN-WS01');
        chk('S9B: the client still gets a valid pool address', !/^169\.254\./.test(ws.ip) && !!ws.lease);
        chk('S9B: but its gateway is .254', ws.gw === sub(10) + '.254');
        const r = core.reach(st, 'ADMIN-WS01', sub(30) + '.20', { proto: 'tcp', port: 445 });
        chk('S9B: and nothing outside the subnet is reachable',
            !r.ok && r.failedAt.layer === 3 && /no device answers for gateway/.test(r.failedAt.reason), why(r));
        chk('S9B: same-subnet traffic still works, as the ticket implies',
            core.reach(st, 'ADMIN-WS01', ep(st, 'PRN-SALES01').ip, { proto: 'tcp', port: 9100 }).ok);
        cover('S9B');
    }

    /* S11B - two adjacent APs on the same 2.4 GHz channel. Co-channel interference, expressed in
     * the channel plan rather than in reach(), which is why validate() guards the healthy state. */
    {
        const st = clone(S);
        st.wireless.apChannels['AP-3'] = st.wireless.apChannels['AP-2'];
        chk('S11B: two adjacent APs can be put on one channel', 
            st.wireless.apChannels['AP-2'] === st.wireless.apChannels['AP-3']);
        chk('S11B: and validate() refuses that as a healthy starting state',
            !core.validate(st).ok && core.validate(st).problems.some(p => /both start on channel/.test(p)));
        chk('S11B: the healthy plan is three distinct channels from {1,6,11}',
            new Set(Object.values(S.wireless.apChannels)).size === 3
            && Object.values(S.wireless.apChannels).every(c => [1, 6, 11].indexOf(c) >= 0));
        cover('S11B');
    }

/* --- 5b. the shape of the state itself ---------------------------------------------------------- */
section('5b. state structure: links, ports, and the one-entry-per-adjacency invariant');
{
    /* CHRIS BLOCKED ON EXACTLY THIS. The ports/links construction block existed TWICE -- an edit
     * meant to replace the pre-port-model version was appended after it -- so `state.links` came
     * out at DOUBLE length, carrying two different record shapes for the same five adjacencies,
     * while comments in the file asserted "five links" twice. It survived 218 assertions, a design
     * review and 59 mutation runs because NOTHING anywhere read `state.links.length` or the dead
     * physical fields. He found it by probing the generator directly.
     *
     * The lesson is the repo's own: a count in prose is stale on arrival, and the fix is not a
     * better comment but a check. Everything here derives from TOPO, so it measures the invariant
     * rather than restating a number that can drift. */
    chk('state.links has exactly one entry per declared adjacency',
        S.links.length === TOPO.LINKS.length, S.links.length + ' vs ' + TOPO.LINKS.length);
    chk('no adjacency appears twice', (() => {
        const seen = new Set();
        return S.links.every(l => {
            const k = [l.a.join('/'), l.b.join('/')].sort().join('<->');
            if (seen.has(k)) return false;
            seen.add(k); return true;
        });
    })(), JSON.stringify(S.links.map(l => l.a.join('/') + '<->' + l.b.join('/'))));
    chk('every link entry has the SAME key set', 
        new Set(S.links.map(l => Object.keys(l).sort().join(','))).size === 1,
        [...new Set(S.links.map(l => Object.keys(l).sort().join(',')))].join(' | '));
    /* A link is adjacency ONLY. Physical state on a link would be the second copy of the truth
     * that Nancy's S1B finding forced out of this model; a stage-3 author who found `errorRate` on
     * half the link entries would reasonably mutate it, and it is read by nothing. */
    chk('no link carries physical state (that lives on ports)',
        S.links.every(l => ['up', 'speed', 'duplex', 'errorRate', 'allowed'].every(k => l[k] === undefined)),
        JSON.stringify(S.links[0]));
    chk('every link endpoint resolves to a port that exists',
        S.links.every(l => [l.a, l.b].every(([dev, port]) => !!(S.ports[dev] && S.ports[dev][port]))),
        S.links.filter(l => [l.a, l.b].some(([d, p]) => !(S.ports[d] && S.ports[d][p])))
               .map(l => l.a.join('/') + '<->' + l.b.join('/')).join(', '));
    chk('every link names the same adjacency as its TOPO declaration, in order',
        S.links.every((l, i) => l.a.join('/') === TOPO.LINKS[i].a.join('/')
                             && l.b.join('/') === TOPO.LINKS[i].b.join('/')));

    /* Uniform port shape. A port missing `up` or `errorRate` passes portCarries only because
     * `undefined === false` and `undefined >= 1` are both false -- a silent special case. The
     * virtual Vlan99 interfaces were exactly that until this was asserted. */
    const allPorts = Object.keys(S.ports).flatMap(d => Object.keys(S.ports[d]).map(p => [d, p, S.ports[d][p]]));
    chk('every port carries up and errorRate',
        allPorts.every(([, , p]) => typeof p.up === 'boolean' && typeof p.errorRate === 'number'),
        allPorts.filter(([, , p]) => typeof p.up !== 'boolean' || typeof p.errorRate !== 'number')
                .map(([d, n]) => d + ':' + n).join(', '));
    chk('every port declares a mode reach() understands',
        allPorts.every(([, , p]) => ['access', 'trunk', 'routed'].indexOf(p.mode) >= 0),
        [...new Set(allPorts.map(([, , p]) => p.mode))].join(','));
    chk('every trunk port has an allowed list; no access port does',
        allPorts.every(([, , p]) => p.mode === 'trunk' ? Array.isArray(p.allowed) : p.allowed === undefined));
    chk('the routed devices got port maps (PORT_PLAN covers only the switches)',
        ['MeridianRTR-01', 'MER-FW01', 'MER-WEB01'].every(d => !!S.ports[d] && Object.keys(S.ports[d]).length > 0),
        Object.keys(S.ports).join(','));
}

/* --- 6b. the four variants that had NO representable state ------------------------------------ */
section('6b. S4A/S4B and S12A/S12B are now expressible (Nancy: 5 of 24 had no state fields)');
{
    /* These four, plus S1B which section 6 now covers on its real target, are the variants Nancy
     * found could not be built against the state model at all: the IP index was strictly one
     * address to one node, and the words community, ntp, snmp and clock appeared nowhere in state.
     * The faults themselves are stage 3. What is asserted here is that the FIELDS exist and the
     * derived tables actually surface the symptom the spec's evidence column promises. */

    chk('healthy: no rogue is placed at exam start', S.rogue.placed === false);
    chk('the rogue carries the address it will claim, matched to the drawn S4 variant',
        !!S.rogue.claimsIp && (S.faults.filter(f => f.slot === 'S4')[0].variant === 'B'
            ? S.rogue.claimsIp === sub(30) + '.20'
            : S.rogue.claimsIp === S.subnets[10].gateway),
        JSON.stringify({ variant: S.rogue.variant, claims: S.rogue.claimsIp }));

    {   // S4A: the gateway address resolves to the rogue's MAC in the victim's cache.
        const st = clone(S);
        st.rogue = { ...st.rogue, placed: true, mode: 'arp-spoof', claimsIp: st.subnets[10].gateway, vlan: 10 };
        const arp = core.tables.arpTable(st, 'ADMIN-WS01');
        const gwRow = arp.filter(r => r.ip === st.subnets[10].gateway);
        chk('S4A: the gateway maps to the ROGUE MAC, and only to it',
            gwRow.length === 1 && gwRow[0].mac === st.rogue.mac && gwRow[0].spoofed === true,
            JSON.stringify(gwRow));
        chk('S4A: the real sub-interface MAC is different, as the router would report',
            st.svis[10].mac !== st.rogue.mac);
        chk('S4A: connectivity SURVIVES, because the rogue forwards (that is the ticket)',
            core.reach(st, 'ADMIN-WS01', sub(30) + '.20', { proto: 'tcp', port: 445 }).ok);
        chk('S4A: the switch can locate the rogue MAC on a port',
            core.tables.macTable(st, st.rogue.switch).some(r => r.mac === st.rogue.mac && r.port === st.rogue.port));
        chk('S4A: a healthy lab shows NO spoofed row (the check can fail)',
            !core.tables.arpTable(S, 'ADMIN-WS01').some(r => r.spoofed));
        chk('S4A: the healthy cache does show the real gateway MAC',
            core.tables.arpTable(S, 'ADMIN-WS01').some(r => r.gateway && r.mac === S.svis[10].mac));
    }
    {   // S4B: the file server's address is claimed twice -- the entry a student sees flipping.
        const st = clone(S);
        st.rogue = { ...st.rogue, placed: true, mode: 'duplicate-address', claimsIp: sub(30) + '.20', vlan: 30 };
        const arp = core.tables.arpTable(st, 'MeridianRTR-01');
        const dup = arp.filter(r => r.ip === sub(30) + '.20');
        chk('S4B: the file server address appears TWICE, with two different MACs',
            dup.length === 2 && dup[0].mac !== dup[1].mac, JSON.stringify(dup));
        chk('S4B: one of them is flagged as the duplicate', dup.some(r => r.duplicate === true));
        chk('S4B: a healthy lab has exactly one row for that address',
            core.tables.arpTable(S, 'MeridianRTR-01').filter(r => r.ip === sub(30) + '.20').length === 1);
    }

    {   // S12A: SW-02 answers ping and SSH but refuses the NOC's community -- a false positive.
        const poll0 = core.tables.snmpPollStatus(S);
        chk('healthy: every monitored target is polled successfully',
            poll0.length > 0 && poll0.every(r => r.polled), JSON.stringify(poll0));
        /* The target list is DERIVED from who listens on udp/161, so this asserts the two agree.
         * The hand-written list named MER-FW01 while its services had no 161, which shipped a
         * permanent false alarm in the healthy lab underneath S12A's deliberate one. */
        chk('every monitored target actually listens on udp/161',
            S.monitoring.targets.every(id => (S.services[id].udp || []).indexOf(161) >= 0),
            JSON.stringify(S.monitoring.targets));
        chk('the NOC is not polling itself', S.monitoring.targets.indexOf('MER-NOC01') < 0);
        /* BOTH DIRECTIONS. Checking only targets-subset-of-listeners let a hand-written list
         * survive mutation, because today's hand-written list happens to be right. Equality is the
         * actual invariant: every listener is monitored and every monitored device listens. */
        const listeners = Object.keys(S.services)
            .filter(id => id !== 'MER-NOC01' && S.devices[id] && (S.services[id].udp || []).indexOf(161) >= 0)
            .sort();
        chk('the monitored set EQUALS the set of udp/161 listeners',
            JSON.stringify(S.monitoring.targets) === JSON.stringify(listeners),
            JSON.stringify(S.monitoring.targets) + ' vs ' + JSON.stringify(listeners));
        const st = clone(S);
        st.devices['MeridianSW-02'].snmp.community = 'meridian-ro-old';
        const rows = core.tables.snmpPollStatus(st);
        const sw2 = rows.filter(r => r.device === 'MeridianSW-02')[0];
        chk('S12A: SW-02 is NOT polled', sw2.polled === false, JSON.stringify(sw2));
        chk('S12A: and the reason is the community, NOT reachability',
            sw2.reachable === true && sw2.communityMatches === false && /community mismatch/.test(sw2.reason),
            JSON.stringify(sw2));
        chk('S12A: SW-02 still answers ping, which is what makes the alert a false positive',
            core.reach(st, 'ADMIN-WS01', st.devices['MeridianSW-02'].mgmtIp).ok);
        chk('S12A: SW-02 still answers SSH',
            core.reach(st, 'ADMIN-WS01', st.devices['MeridianSW-02'].mgmtIp, { proto: 'tcp', port: 22 }).ok);
        chk('S12A: no other target is affected', rows.filter(r => r.device !== 'MeridianSW-02').every(r => r.polled));
        /* The reachability arm needs its own FAILING case. Mutation showed hard-coding
         * `reachable: true` left the suite green, because every assertion here only ever looked at
         * a target that WAS reachable. A genuinely unreachable target must read differently from a
         * community mismatch, or the NOC panel cannot tell a real outage from S12A's false one. */
        const st2 = clone(S);
        st2.ports['MeridianSW-02']['Vlan99'].shutdown = true;
        const sw2b = core.tables.snmpPollStatus(st2).filter(r => r.device === 'MeridianSW-02')[0];
        chk('S12A contrast: a genuinely unreachable target reports unreachable, not a mismatch',
            sw2b.polled === false && sw2b.reachable === false
            && sw2b.communityMatches === true && /unreachable/.test(sw2b.reason), JSON.stringify(sw2b));
    }
    {   // S12B: NTP pointed at the decommissioned server from the stale diagram.
        chk('healthy: the clock is synchronised against the real server',
            core.tables.clockStatus(S, 'MeridianSW-02').synchronized === true
            && core.tables.clockStatus(S, 'MeridianSW-02').server === S.devices['MER-SRV01'].mgmtIp);
        const st = clone(S);
        st.devices['MeridianSW-02'].ntp = { server: TOPO.DECOY_DIAGRAM.dnsServer, synchronized: false, offsetSec: 63113904 };
        const cs = core.tables.clockStatus(st, 'MeridianSW-02');
        chk('S12B: the clock is unsynchronised and years out', cs.synchronized === false && cs.offsetSec > 31000000);
        chk('S12B: and it is recognised as the decommissioned address from the stale diagram',
            cs.pointsAtDecommissioned === true, JSON.stringify(cs));
        chk('S12B: a healthy lab is NOT flagged as pointing at it (the check can fail)',
            core.tables.clockStatus(S, 'MeridianSW-02').pointsAtDecommissioned === false);
        cover('S12B');
    }
    cover('S4A', 'S4B', 'S12A');

    /* THE LEDGER CHECK. Derived from TOPO, so a new slot or variant fails this until covered. */
    const allVariants = [];
    TOPO.FAULT_SLOTS.forEach(sl => Object.keys(sl.variants).forEach(v => allVariants.push(sl.slot + v)));
    const missing = allVariants.filter(id => !covered.has(id));
    chk('all ' + allVariants.length + ' fault variants are demonstrated expressible against the state model',
        allVariants.length === 24 && missing.length === 0, 'missing: ' + missing.join(', '));
    chk('the ledger contains no variant the topology does not declare',
        [...covered].every(id => allVariants.indexOf(id) >= 0),
        [...covered].filter(id => allVariants.indexOf(id) < 0).join(', '));
}

/* ─── 7. the validator refuses what it is supposed to refuse ──────────────────────────────────── */
section('7. validate() catches each constraint breach (fed deliberately broken states)');
{
    const breaks = (name, mutate, re) => {
        const st = clone(S);
        mutate(st);
        const v = core.validate(st);
        chk(name, !v.ok && v.problems.some(p => re.test(p)), JSON.stringify(v.problems));
    };
    chk('a healthy generated lab validates clean', core.validate(S).ok, JSON.stringify(core.validate(S).problems));
    breaks('a conflict pair is caught', st => {
        st.faults = st.faults.map(f => f.slot === 'S3' ? Object.assign({}, f, { variant: 'A', id: 'S3A' })
                                     : f.slot === 'S5' ? Object.assign({}, f, { variant: 'B', id: 'S5B' }) : f);
    }, /conflict pair both active: S3A and S5B/);
    breaks('a rogue on a trunk is caught', st => { st.rogue.port = 'Gi0/1'; }, /sever a trunk/);
    breaks('a severed management path is caught', st => {
        ['MeridianSW-01', 'MeridianSW-02'].forEach(sw => {
            st.ports[sw]['Gi0/1'].allowed = st.ports[sw]['Gi0/1'].allowed.filter(v => v !== 99);
        });
    }, /cannot reach MeridianSW-02/);
    /* The exact case Nancy proved slipped through: severing the router-to-firewall transit link
     * strands MER-FW01, MER-WEB01, the internet and the branch, and validate() returned ok:true
     * with zero problems because neither of those two devices was in its management list. */
    breaks('severing the transit link is caught (it strands the firewall and the DMZ)', st => {
        st.ports['MeridianRTR-01']['Gi0/1'].up = false;
    }, /cannot reach MER-FW01|cannot reach MER-WEB01/);
    breaks('a dead DMZ cable is caught', st => {
        st.ports['MER-FW01']['DMZ'].up = false;
    }, /cannot reach MER-WEB01/);
    breaks('the printer moved off SW-01 is caught (S2A depends on it)', st => {
        ep(st, 'PRN-SALES01').switch = 'MeridianSW-02';
    }, /printer is on MeridianSW-02/);
    breaks('a duplicate address is caught', st => {
        ep(st, 'SALES-PC02').ip = ep(st, 'SALES-PC01').ip;
    }, /claimed by both/);
    breaks('a collision with the stale diagram is caught', st => {
        ep(st, 'SALES-PC02').ip = TOPO.DECOY_DIAGRAM.dnsServer;
    }, /collides with/);
    breaks('a duplicate MAC is caught', st => {
        ep(st, 'SALES-PC02').mac = ep(st, 'SALES-PC01').mac;
    }, /shared by/);
    breaks('ADMIN-WS01 losing its lease is caught', st => {
        const ws = ep(st, 'ADMIN-WS01'); ws.lease = null; ws.ip = '169.254.3.4';
    }, /link-local|no DHCP lease/);
    breaks('ADMIN-WS01 demoted in the DHCP queue is caught', st => {
        st.dhcp.requestOrder = st.dhcp.requestOrder.filter(n => n !== 'ADMIN-WS01').concat(['ADMIN-WS01']);
    }, /not first in the DHCP request order/);
    breaks('two APs on one channel is caught', st => {
        st.wireless.apChannels['AP-2'] = st.wireless.apChannels['AP-1'];
    }, /both start on channel/);
    breaks('an off-plan channel is caught', st => {
        st.wireless.apChannels['AP-3'] = 4;
    }, /outside \{1,6,11\}/);
}

/* ─── 8. derived tables, and that they are derived ────────────────────────────────────────────── */
section('8. derived tables recompute from config rather than reporting a stored copy');
{
    const ws = ep(S, 'ADMIN-WS01');
    const mac1 = core.tables.macTable(S, 'MeridianSW-01');
    chk('the MAC table puts a local host on its own access port',
        mac1.some(r => r.mac === ws.mac && r.port === ws.port && r.vlan === 10),
        JSON.stringify(mac1.filter(r => r.mac === ws.mac)));
    const remote = ep(S, 'SALES-PC04');
    chk('a floor-2 host is learned on SW-01’s uplink, not on an access port',
        mac1.some(r => r.mac === remote.mac && r.port === 'Gi0/1'),
        JSON.stringify(mac1.filter(r => r.mac === remote.mac)));
    chk('the same host is on its own access port in SW-02’s table',
        core.tables.macTable(S, 'MeridianSW-02').some(r => r.mac === remote.mac && r.port === remote.port));
    /* ASSERTED DIRECTLY because the topology cannot expose it. With only two switches, breaking
     * isSwitch() (so the router uplink counts as an inter-switch trunk) or making trunkIngress
     * return the first trunk port instead of the arrival port both produce the SAME answer, and
     * both mutations survived. They are latent defects a third switch would make real -- and the
     * router-uplink-as-trunk bug already fired once here, putting floor-2 hosts on Fa0/24. */
    chk('the switch adjacency contains ONLY devices that are switches',
        Object.keys(core.switchAdjacency(S)).every(d => Object.prototype.hasOwnProperty.call(TOPO.PORT_PLAN, d)),
        Object.keys(core.switchAdjacency(S)).join(','));
    chk('no inter-switch edge terminates on the router or firewall',
        Object.keys(core.switchAdjacency(S)).every(d =>
            core.switchAdjacency(S)[d].every(e => Object.prototype.hasOwnProperty.call(TOPO.PORT_PLAN, e.to))));
    chk('the arrival port from SW-02 into SW-01 is the inter-switch trunk, not the router uplink',
        core.trunkIngress(S, 'MeridianSW-02', 'MeridianSW-01', 10) === 'Gi0/1',
        String(core.trunkIngress(S, 'MeridianSW-02', 'MeridianSW-01', 10)));
    {
        /* MULTI-HOP, ON A SYNTHETIC TOPOLOGY, and DELIBERATELY ASYMMETRIC. The real Meridian
         * topology cannot distinguish several wrong implementations of trunkIngress:
         *   - its two switches are joined by one trunk whose ends are BOTH named Gi0/1, so "the
         *     arrival port" and "the first trunk port on the destination" are the same string;
         *   - every trunk allows the same VLANs on both ends, so removing EITHER the near-end or
         *     the far-end VLAN check leaves the other one catching everything.
         * A first attempt at this block was symmetric and all three mutations survived it. Three
         * switches in a line, with distinct port names and DIFFERENT allowed lists on the two ends
         * of the new trunk, separate all of them -- and walk the BFS past one hop, which the real
         * topology never does.
         *   SW-01 --Gi0/1==Gi0/1-- SW-02 --Gi0/8==Gi0/9-- SW-03
         *   Gi0/8 allows 10,20,40      Gi0/9 allows 10,20,30
         * so VLAN 30 is blocked only at the FAR end and VLAN 40 only at the NEAR end. */
        const st = clone(S);
        const trunk = (name, allowed) => ({ name: name, mode: 'trunk', allowed: allowed, shutdown: false,
                                            up: true, errorRate: 0, speed: 1000, duplex: 'full' });
        st.ports['MeridianSW-03'] = {
            'Gi0/9': trunk('Gi0/9', [10, 20, 30]),
            'Fa0/1': { name: 'Fa0/1', mode: 'access', vlan: 10, shutdown: false, up: true, errorRate: 0, speed: 100, duplex: 'full' }
        };
        st.ports['MeridianSW-02']['Gi0/8'] = trunk('Gi0/8', [10, 20, 40]);
        st.links.push({ a: ['MeridianSW-02', 'Gi0/8'], b: ['MeridianSW-03', 'Gi0/9'], kind: 'trunk', net: null });
        TOPO.PORT_PLAN['MeridianSW-03'] = [];          // declare it a switch for isSwitch()
        try {
            chk('trunkIngress: two hops away, the arrival port is the FAR end of the last link',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 10) === 'Gi0/1',
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 10)));
            /* SW-02 has TWO trunk edges and Gi0/1 is enumerated first, so an implementation that
             * returns "the destination's first trunk port" answers Gi0/1 here and is wrong. */
            chk('trunkIngress: arriving from SW-03 into SW-02 is Gi0/8, not its first trunk Gi0/1',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-02', 10) === 'Gi0/8',
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-02', 10)));
            chk('trunkIngress: and in the other direction it is Gi0/9',
                core.trunkIngress(st, 'MeridianSW-01', 'MeridianSW-03', 10) === 'Gi0/9',
                String(core.trunkIngress(st, 'MeridianSW-01', 'MeridianSW-03', 10)));
            /* ONE HOP, not two. Asking SW-03 -> SW-01 for VLAN 30 does return null with the
             * far-end check deleted -- but only because the SECOND hop's near-end check catches
             * it, so the mutation survived. The far-end check is only isolated on a single-hop
             * path, where nothing downstream can mask it. */
            chk('trunkIngress: one hop, a VLAN allowed near but blocked FAR yields no arrival port',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-02', 30) === null,
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-02', 30)));
            chk('trunkIngress: two hops, the same VLAN is still blocked',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 30) === null,
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 30)));
            chk('trunkIngress: a VLAN blocked NEAR but allowed far yields no arrival port',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 40) === null,
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 40)));
            chk('trunkIngress: a VLAN on neither end yields no arrival port',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 99) === null,
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 99)));
            /* And the MAC table, which is what consumes it, agrees for a host two hops out. */
            st.endpoints.push({ name: 'SYN-PC01', kind: 'pc', vlan: 10, mac: '00:14:22:AA:BB:CC',
                ip: sub(10) + '.77', mask: S.subnets[10].mask, gw: S.subnets[10].gateway, dhcp: false,
                switch: 'MeridianSW-03', port: 'Fa0/1', ap: null, ssid: null, network: null, reservation: false });
            /* A REDUNDANT LINK, closing the triangle. The BFS visited-set is what makes this
             * terminate; without it the queue grows without bound. A line topology cannot show
             * that, so deleting `seen` survived every other case here. Note the honest limit: the
             * mutation is caught as a HANG rather than a clean assertion failure, because a BFS
             * without a visited set on a cyclic graph does not return at all. Meridian itself has
             * no redundant link and no spanning-tree model, so this state is synthetic. */
            st.ports['MeridianSW-01']['Gi0/7'] = trunk('Gi0/7', [10, 20]);
            st.ports['MeridianSW-03']['Gi0/6'] = trunk('Gi0/6', [10, 20]);
            st.links.push({ a: ['MeridianSW-01', 'Gi0/7'], b: ['MeridianSW-03', 'Gi0/6'], kind: 'trunk', net: null });
            chk('trunkIngress terminates on a cyclic topology and answers from the direct link',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 10) === 'Gi0/7',
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 10)));
            chk('trunkIngress still refuses a VLAN no path carries, with a cycle present',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 99) === null,
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-01', 99)));
            /* THE CASE THAT MAKES THE VISITED SET LOAD-BEARING: a cycle whose VLAN is carried
             * everywhere, plus a target that is NOT on it. Reaching for an unreachable switch is
             * the only shape where the BFS has to exhaust the cycle rather than return early --
             * with `seen` deleted it walks the triangle forever. Every earlier case returned on
             * the first matching edge, which is why that mutation survived three rounds. */
            TOPO.PORT_PLAN['MeridianSW-09'] = [];
            st.ports['MeridianSW-09'] = { 'Gi0/1': trunk('Gi0/1', [10, 20]) };   // deliberately unlinked
            chk('trunkIngress terminates when the target is unreachable across a cycle',
                core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-09', 10) === null,
                String(core.trunkIngress(st, 'MeridianSW-03', 'MeridianSW-09', 10)));
            delete TOPO.PORT_PLAN['MeridianSW-09'];
            delete st.ports['MeridianSW-09'];
            st.links.pop();                            // back to the line for the MAC-table cases
            delete st.ports['MeridianSW-01']['Gi0/7'];
            delete st.ports['MeridianSW-03']['Gi0/6'];

            chk('the MAC table learns a two-hop host on SW-01\u2019s Gi0/1',
                core.tables.macTable(st, 'MeridianSW-01').some(r => r.mac === '00:14:22:AA:BB:CC' && r.port === 'Gi0/1'));
            chk('...and on SW-02\u2019s Gi0/8, the port actually facing it',
                core.tables.macTable(st, 'MeridianSW-02').some(r => r.mac === '00:14:22:AA:BB:CC' && r.port === 'Gi0/8'));
        } finally {
            delete TOPO.PORT_PLAN['MeridianSW-03'];    // never leak into later sections
        }
        chk('the synthetic switch was removed from the topology again',
            !Object.prototype.hasOwnProperty.call(TOPO.PORT_PLAN, 'MeridianSW-03'));
    }
    {   // THE DERIVATION TEST: break the trunk and the table must change by itself.
        const st = clone(S);
        ['MeridianSW-01', 'MeridianSW-02'].forEach(sw => {
            st.ports[sw]['Gi0/1'].allowed = st.ports[sw]['Gi0/1'].allowed.filter(v => v !== 10);
        });
        chk('removing VLAN 10 from the trunk removes floor-2 Sales MACs from SW-01',
            !core.tables.macTable(st, 'MeridianSW-01').some(r => r.mac === remote.mac));
        chk('...while floor-2 Engineering MACs remain',
            core.tables.macTable(st, 'MeridianSW-01').some(r => r.mac === ep(st, 'ENG-PC05').mac));
    }

    const arp = core.tables.arpTable(S, 'MeridianRTR-01');
    chk('the router ARP table holds VLAN 10 hosts', arp.some(r => r.ip === ws.ip && r.mac === ws.mac && r.vlan === 10));
    chk('the router ARP table holds VLAN 30 servers', arp.some(r => r.ip === sub(30) + '.20'));
    chk('ARP rows are ordered by address', arp.every((r, i) => i === 0 || core.ip.toInt(arp[i - 1].ip) <= core.ip.toInt(r.ip)));

    const rt = core.tables.routeTable(S, 'MeridianRTR-01');
    chk('the routing table is longest-prefix first', rt.every((r, i) => i === 0 || rt[i - 1].prefix >= r.prefix));
    chk('the default route is present and last', rt[rt.length - 1].cidr === '0.0.0.0/0');
    chk('a connected route exists for each of the five VLANs',
        [10, 20, 30, 40, 99].every(v => rt.some(r => r.kind === 'connected' && r.iface === 'Gi0/0.' + v)));
    chk('route lookup prefers the branch static over the default',
        core.routeLookup(S, 'MeridianRTR-01', core.ip.toInt('10.200.0.25')).prefix === 24);

    const leases = core.tables.dhcpLeases(S);
    const clients = S.endpoints.filter(e => e.dhcp);
    chk('every DHCP client holds a lease on a healthy lab', leases.length === clients.length,
        leases.length + ' leases for ' + clients.length + ' clients');
    chk('guest leases carry the public resolver', leases.filter(l => l.vlan === 40).every(l => l.dns === '1.1.1.1'));
    chk('internal leases carry MER-SRV01 as resolver',
        leases.filter(l => l.vlan !== 40).every(l => l.dns === S.devices['MER-SRV01'].mgmtIp));
    chk('every lease gateway is its subnet’s .1', leases.every(l => l.gateway === S.subnets[l.vlan].gateway));
    chk('the printer holds its reservation, not a pool address',
        leases.filter(l => l.host === 'PRN-SALES01')[0].ip === sub(10) + '.50');
    chk('no lease collides with a static address', (() => {
        const statics = S.endpoints.filter(e => !e.dhcp && e.ip).map(e => e.ip);
        return leases.every(l => statics.indexOf(l.ip) < 0);
    })());

    const dns = core.tables.dnsAnswers(S);
    chk('DNS answers come from the loaded zone', dns.serial === S.dns.loaded.serial);
    chk('every A record resolves to a real address', dns.records.every(r => core.ip.toInt(r.target) !== null));
    chk('intranet and fs01 agree on a healthy lab',
        dns.records.filter(r => /^intranet\./.test(r.fqdn))[0].target === dns.records.filter(r => /^fs01\./.test(r.fqdn))[0].target);

    const c0 = core.tables.interfaceCounters(S, 'MeridianSW-01', 'Gi0/1', 0);
    const c1 = core.tables.interfaceCounters(S, 'MeridianSW-01', 'Gi0/1', 600);
    chk('counters report a port that exists, with its real duplex and link state',
        c0.duplex === 'full' && c0.up === true && c0.speed === 1000, JSON.stringify(c0));
    chk('counters are zero on a clean link at t=0', c0.crc === 0 && c0.inputErrors === 0 && c0.lateCollisions === 0);
    chk('packets advance with elapsed time', c1.packets > c0.packets);
    chk('a clean link accrues no errors however long it runs', c1.crc === 0 && c1.inputErrors === 0);
    {   /* S1B's shape, ON ITS REAL TARGET. The spec says "damaged patch cable on SW-02 Fa0/{p}" --
         * a host ACCESS port. The earlier version of this case set errorRate on the inter-switch
         * TRUNK and read counters for Gi0/1, which demonstrated the mechanism on a link no fault
         * targets while the port S1B actually needs had no state object at all. Nancy caught it;
         * it is the same wrong-target-disguised-as-the-right-one class as the two defects mutation
         * testing already found in this file. */
        const st = clone(S);
        const target = ep(st, 'ENG-PC04');            // floor 2, Engineering, on SW-02
        chk('S1B: the target really is a floor-2 Engineering access port on SW-02',
            target.switch === 'MeridianSW-02' && st.ports['MeridianSW-02'][target.port].mode === 'access',
            target.switch + ' ' + target.port);
        st.ports['MeridianSW-02'][target.port].errorRate = 0.05;
        const a = core.tables.interfaceCounters(st, 'MeridianSW-02', target.port, 60);
        const b = core.tables.interfaceCounters(st, 'MeridianSW-02', target.port, 300);
        chk('S1B: CRC and input errors rise between two runs on that port',
            b.crc > a.crc && a.crc > 0 && b.inputErrors > a.inputErrors, a.crc + ' then ' + b.crc);
        chk('S1B: the host still has connectivity, because the ticket says slow, not dead',
            core.reach(st, target.name, S.svis[20].ip).ok);
        chk('S1B: a healthy sibling port on the same switch shows no errors',
            core.tables.interfaceCounters(st, 'MeridianSW-02', ep(st, 'ENG-PC05').port, 300).crc === 0);
    }
    {   // S1A's shape: half duplex, late collisions, link still up.
        const st = clone(S);
        const t1a = ep(st, 'ENG-PC04');
        st.ports['MeridianSW-02'][t1a.port].duplex = 'half';
        const cc = core.tables.interfaceCounters(st, 'MeridianSW-02', t1a.port, 300);
        chk('S1A: a half-duplex port accrues late collisions', cc.lateCollisions > 0 && cc.duplex === 'half');
        chk('S1A: and the host still has connectivity', core.reach(st, 'ENG-PC04', S.svis[20].ip).ok);
    }

    const nat = core.tables.natTable(S);
    chk('the NAT state table has a row per NATed reachable host', nat.length > 0);
    chk('every NAT row translates to the WAN address', nat.every(r => r.outside.indexOf(S.params.wan.fwIp + ':') === 0));
    {   // S7A's evidence: "state table shows no Engineering translations".
        const st = clone(S);
        st.nat.outbound = st.nat.outbound.filter(r => r.src !== st.subnets[20].cidr);
        const rows = core.tables.natTable(st);
        chk('S7A: no Engineering rows appear once the rule is gone',
            !rows.some(r => core.ip.inNet(core.ip.toInt(r.inside.split(':')[0]), st.subnets[20].parsed)));
        chk('S7A: Sales rows are untouched',
            rows.some(r => core.ip.inNet(core.ip.toInt(r.inside.split(':')[0]), st.subnets[10].parsed)));
    }
}

/* ─── 9. what the spec fixes must stay fixed ──────────────────────────────────────────────────── */
section('9. the fixed/seeded split the integrity model depends on');
{
    const labs = [0, 1, 2, 3, 4].map(i => core.generate('split-' + i, EXAM));
    chk('VLAN ids are identical across students', labs.every(l =>
        Object.keys(l.subnets).sort().join(',') === '10,20,30,40,99'));
    chk('VLAN 99 is 10.0.0.0/24 for every student', labs.every(l => l.subnets[99].cidr === '10.0.0.0/24'));
    chk('device names are identical across students', labs.every(l =>
        Object.keys(l.devices).sort().join(',') === Object.keys(labs[0].devices).sort().join(',')));
    chk('user subnets differ between students', new Set(labs.map(l => l.subnets[10].cidr)).size > 1);
    chk('MACs differ between students', new Set(labs.map(l => ep(l, 'ADMIN-WS01').mac)).size > 1);
    chk('port positions differ between students', new Set(labs.map(l => ep(l, 'SALES-PC01').port)).size > 1);
    chk('every MAC carries a real vendor OUI', labs.every(l => l.endpoints.every(e =>
        Object.keys(TOPO.OUI).some(k => e.mac.indexOf(TOPO.OUI[k]) === 0))));
    chk('the printer keeps its HP OUI so the vendor stays answerable',
        labs.every(l => ep(l, 'PRN-SALES01').mac.indexOf(TOPO.OUI.hp) === 0));
    chk('APs keep the Ubiquiti OUI', labs.every(l => ['AP-1', 'AP-2', 'AP-3'].every(a => ep(l, a).mac.indexOf(TOPO.OUI.ubiquiti) === 0)));
    chk('the fixed server octets hold: .10 DNS, .20 file, .30 NOC', labs.every(l => {
        const t = l.subnets[30].cidr.split('/')[0].replace(/\.0$/, '');
        return l.devices['MER-SRV01'].mgmtIp === t + '.10'
            && ep(l, 'MER-FS01').ip === t + '.20'
            && l.devices['MER-NOC01'].mgmtIp === t + '.30';
    }));
    chk('the stale diagram is never used to generate state', labs.every(l =>
        l.devices['MER-SRV01'].mgmtIp !== TOPO.DECOY_DIAGRAM.dnsServer
        && l.devices['MeridianSW-02'].mgmtIp !== TOPO.DECOY_DIAGRAM.sw02Mgmt));
    chk('a NOC decoy is drawn for every lab, and they are not all the same',
        labs.every(l => !!l.params.nocDecoy) && new Set(labs.map(l => l.params.nocDecoy)).size > 1);
    chk('the S9A shortfall is always 1-3', labs.every(l => l.params.s9aShortfall >= 1 && l.params.s9aShortfall <= 3));
}

/* ─── 10. the browser load path ───────────────────────────────────────────────────────────────── */
section('10. the same files load and agree in a browser-shaped context');
{
    /* Stage 7 generates on the server and renders in the browser, so the two must agree exactly.
     * Run in a vm context with NO `require` and NO `module` -- a plain <script> tag -- which is the
     * only way to exercise the window half of the dual export. Asserted here rather than checked by
     * hand once, because the window branch has no other caller yet and would rot unnoticed. */
    const vm = require('vm'), fs = require('fs');
    const win = {};
    const ctx = vm.createContext({ window: win, console: { log: () => {} } });
    let loadErr = null;
    try {
        ['netfinal-topology.js', 'netfinal-core.js'].forEach(f => {
            vm.runInContext(fs.readFileSync(path.resolve(__dirname, '../../_app/houses/web/network-plus/final/', f), 'utf8'), ctx, { filename: f });
        });
    } catch (e) { loadErr = e.message; }
    chk('both files load with no require() and no module', loadErr === null, loadErr);
    chk('the topology publishes window.NetFinalTopology', win.NetFinalTopology && win.NetFinalTopology.VLANS.length === 5);
    chk('the core publishes window.NetFinalCore', win.NetFinalCore && typeof win.NetFinalCore.generate === 'function');
    if (win.NetFinalCore) {
        const b = win.NetFinalCore.generate('parity-student', EXAM);
        chk('the browser build generates byte-identical state to Node',
            JSON.stringify(b) === JSON.stringify(core.generate('parity-student', EXAM)));
        chk('reach() works on the browser build',
            win.NetFinalCore.reach(b, 'ADMIN-WS01', 'fs01.meridian.local', { proto: 'tcp', port: 445 }).ok);
        chk('the browser build agrees on the variant space',
            JSON.stringify(win.NetFinalCore.variantSpace()) === JSON.stringify(core.variantSpace()));
    }
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
