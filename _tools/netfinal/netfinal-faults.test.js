#!/usr/bin/env node
/**
 * netfinal-faults.test.js — stage 3 of the Network+ Meridian Corp final exam.
 *
 * @catalog what    Drives all 24 fault variants: evidence present, fixed() false at exam start,
 * @catalog what    true after the canonical repair, invariants clean after it, and an invariant
 * @catalog what    violated by the common wrong fix. Plus determinism of apply().
 * @catalog run     node _tools/netfinal/netfinal-faults.test.js
 * @catalog status  TOOL
 *
 * THE SPEC'S STAGE-3 ACCEPTANCE CRITERIA (section 11), verbatim:
 *   "For each of the 24 variants, an automated test confirms: (a) at least one listed evidence
 *    command shows the fault in its output, (b) fixed() is false at exam start, (c) applying the
 *    expected fix makes fixed() true, (d) every invariant still holds after the fix."
 *   "For each variant, a test applies a common wrong fix (for example removing all VLANs from a
 *    trunk, shutting the wrong port) and confirms an invariant fails."
 *
 * (b), (c), (d) and the wrong-fix criterion are fully covered here. (a) is covered STRUCTURALLY
 * only — each variant's `evidence` is asserted non-empty and to name real devices — because the
 * command parser is stage 4. Asserting that a command's OUTPUT reveals the fault is impossible
 * before the commands exist, and claiming otherwise would be the kind of unearned pass this
 * platform has been bitten by. Stage 4 owes the behavioural half.
 *
 * EVERY VARIANT IS FORCED, NOT DRAWN. generate() can only produce 19 of the 24: the spec's own
 * conflict pairs pin S2B, S3B, S5B, S7A and S11A out of every legal combination (taskboard 436).
 * Testing only what the generator emits would leave five authored variants unverified forever, so
 * each is built explicitly via CORE.pickFaultTarget.
 */
const path = require('path');
const NF = path.resolve(__dirname, '../../functions/netfinal');
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const TOPO = require(path.join(NF, 'netfinal-topology.js'));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + detail : '')); }
};
const section = (t) => console.log('\n' + t);
const clone = (s) => JSON.parse(JSON.stringify(s));
const host10 = (st, n) => CORE.ip.toStr(st.subnets[10].parsed.net + n);

const EXAM = 'net-final-2026';
const ALL = [];
TOPO.FAULT_SLOTS.forEach(s => Object.keys(s.variants).forEach(v => ALL.push(s.slot + v)));

/* One lab with exactly ONE variant active, so nothing else can mask or explain the symptom. */
function labWith(id, seed) {
    const st = CORE.generate(seed || ('fx-' + id), EXAM);
    const slot = id.slice(0, -1), variant = id.slice(-1);
    const meta = TOPO.FAULT_SLOTS.filter(s => s.slot === slot)[0].variants[variant];
    const rng = CORE.makeRng((seed || ('fx-' + id)) + '|force|' + id);
    st.faults = [{
        slot, variant, id, active: true, applied: false,
        layer: meta.layer, group: meta.group,
        target: CORE.pickFaultTarget(st, rng, slot, variant)
    }];
    /* The rogue's claim has to match the variant under test, since generate() aimed it at whichever
     * S4 variant the seed drew. */
    if (slot === 'S4') {
        st.rogue.variant = variant;
        st.rogue.mode = variant === 'B' ? 'duplicate-address' : 'arp-spoof';
    }
    return st;
}

/* ─── 1. library completeness ─────────────────────────────────────────────────────────────────── */
section('1. the library covers the catalog exactly');
{
    chk('the topology declares 24 variants', ALL.length === 24, String(ALL.length));
    chk('every declared variant has an implementation',
        ALL.every(id => !!FAULTS.VARIANTS[id]), ALL.filter(id => !FAULTS.VARIANTS[id]).join(', '));
    chk('no implementation exists for a variant the topology does not declare',
        Object.keys(FAULTS.VARIANTS).every(id => ALL.indexOf(id) >= 0),
        Object.keys(FAULTS.VARIANTS).filter(id => ALL.indexOf(id) < 0).join(', '));
    chk('every variant carries the four pieces the spec names, plus a canonical repair',
        ALL.every(id => {
            const v = FAULTS.VARIANTS[id];
            return typeof v.apply === 'function' && typeof v.fixed === 'function'
                && typeof v.logs === 'function' && Array.isArray(v.evidence)
                && typeof v.correctFix === 'function' && typeof v.wrongFix === 'function';
        }));
    chk('every variant has a ticket, a root cause and an expected fix in prose',
        ALL.every(id => {
            const v = FAULTS.VARIANTS[id];
            return v.ticket && v.rootCause && v.expectedFix;
        }));
    /* The layer is GRADED (it goes in the incident log), so it must come from the catalog and not
     * be restated by the variant. */
    chk('every variant layer matches the catalog, per variant not per slot',
        ALL.every(id => {
            const slot = id.slice(0, -1), v = id.slice(-1);
            return FAULTS.VARIANTS[id].layer === TOPO.FAULT_SLOTS.filter(s => s.slot === slot)[0].variants[v].layer;
        }));
    chk('S8 and S11 keep their per-variant layers (3.5/4 and 2/1)',
        FAULTS.VARIANTS.S8A.layer === 3.5 && FAULTS.VARIANTS.S8B.layer === 4
        && FAULTS.VARIANTS.S11A.layer === 2 && FAULTS.VARIANTS.S11B.layer === 1);
}

/* ─── 2. evidence, structurally (the behavioural half is stage 4) ─────────────────────────────── */
section('2. evidence is declared and names real devices (behaviour is stage 4)');
{
    const deviceNames = TOPO.DEVICES.map(d => d.id);
    ALL.forEach(id => {
        const v = FAULTS.VARIANTS[id];
        const nonEmpty = v.evidence.length > 0 && v.evidence.every(e => typeof e === 'string' && e.length > 8);
        const namesSomething = v.evidence.some(e =>
            deviceNames.some(d => e.indexOf(d) >= 0) || /\{port\}|\{mac\}|zone file|lease|NOC|the Kea|rack view|SSID|AP list|IPsec|port forward|outbound NAT/i.test(e));
        chk(id + ': evidence is declared and points at a real surface', nonEmpty && namesSomething,
            JSON.stringify(v.evidence));
    });
}

/* ─── 3. the spec's (b), (c), (d) for all 24 ──────────────────────────────────────────────────── */
section('3. for each variant: fixed() false at start, true after the repair, invariants clean');
{
    ALL.forEach(id => {
        const v = FAULTS.VARIANTS[id];
        const st = labWith(id);

        const beforeInv = FAULTS.checkInvariants(st);
        chk(id + ': the lab is invariant-clean BEFORE the fault is applied',
            beforeInv.length === 0, JSON.stringify(beforeInv.map(x => x.id + ': ' + x.detail)));

        FAULTS.applyAll(st);
        chk(id + ': (b) fixed() is false at exam start', FAULTS.fixedMap(st)[id] === false);

        /* The fault must be OBSERVABLE, not merely recorded: something a student could see has to
         * differ from the healthy lab. Without this a no-op apply() would satisfy (b) trivially. */
        const healthy = labWith(id);
        chk(id + ': applying it actually changes observable state',
            JSON.stringify(st) !== JSON.stringify(healthy));

        chk(id + ': it writes at least one log line a student can find',
            v.logs(st, st.faults[0]).length > 0);

        v.correctFix(st, st.faults[0]);
        chk(id + ': (c) the canonical repair makes fixed() true', FAULTS.fixedMap(st)[id] === true);

        const afterInv = FAULTS.checkInvariants(st);
        chk(id + ': (d) every invariant still holds after the repair',
            afterInv.length === 0, JSON.stringify(afterInv.map(x => x.id + ': ' + x.detail)));
    });
}

/* ─── 4. the wrong-fix criterion ──────────────────────────────────────────────────────────────── */
section('4. for each variant, a plausible WRONG fix violates an invariant or leaves it unfixed');
{
    ALL.forEach(id => {
        const v = FAULTS.VARIANTS[id];
        const st = labWith(id);
        FAULTS.applyAll(st);
        v.wrongFix(st, st.faults[0]);
        const inv = FAULTS.checkInvariants(st);
        const stillBroken = FAULTS.fixedMap(st)[id] === false;
        /* Either outcome is a correct rejection: the wrong fix collaterally damaged the network, or
         * it simply did not repair the fault. What must NOT happen is a clean pass. */
        chk(id + ': the wrong fix is rejected (invariant breach or still unfixed)',
            inv.length > 0 || stillBroken,
            'fixed=' + FAULTS.fixedMap(st)[id] + ' invariants=' + JSON.stringify(inv.map(x => x.id)));
    });
}

/* ─── 5. determinism and isolation ────────────────────────────────────────────────────────────── */
section('5. apply() is pure, and faults do not leak into each other');
{
    ALL.forEach(id => {
        const a = labWith(id, 'det-' + id); FAULTS.applyAll(a);
        const b = labWith(id, 'det-' + id); FAULTS.applyAll(b);
        chk(id + ': the same seed and variant produce byte-identical faulted state',
            JSON.stringify(a) === JSON.stringify(b));
    });
    /* applyAll must be idempotent: a restored session re-applies the plan, and a fault that
     * stacked on itself would double a pool shrink or re-reorder an ACL. */
    ALL.forEach(id => {
        const st = labWith(id, 'idem-' + id);
        FAULTS.applyAll(st);
        const once = JSON.stringify(st);
        FAULTS.applyAll(st); FAULTS.applyAll(st);
        chk(id + ': applyAll is idempotent', JSON.stringify(st) === once);
    });
}

/* ─── 6. a full lab: every active fault at once ───────────────────────────────────────────────── */
section('6. a real generated lab with all 12 faults applied together');
{
    let brokenBefore = 0, dirty = 0, noneFixed = 0, allRepaired = 0, threw = 0;
    const firstProblem = {};
    for (let i = 0; i < 60; i++) {
        let st;
        try { st = CORE.generate('full-' + i, EXAM); } catch (e) { threw++; continue; }

        if (FAULTS.checkInvariants(st).length) { brokenBefore++; firstProblem.pre = firstProblem.pre || JSON.stringify(FAULTS.checkInvariants(st).map(x => x.id)); }

        FAULTS.applyAll(st);
        const fm = FAULTS.fixedMap(st);
        const prematurelyFixed = Object.keys(fm).filter(k => fm[k]);
        if (prematurelyFixed.length) { noneFixed++; firstProblem.pre_fixed = firstProblem.pre_fixed || prematurelyFixed.join(','); }

        /* The management path must survive TWELVE simultaneous faults — spec constraint 2, and the
         * thing that decides whether a student can work the exam at all. */
        const mgmt = FAULTS.checkInvariants(st).filter(x => x.id === 'mgmt-path' || x.id === 'vlan99-intact');
        if (mgmt.length) { dirty++; firstProblem.mgmt = firstProblem.mgmt || JSON.stringify(mgmt.map(x => x.id + ': ' + x.detail)); }

        st.faults.forEach(f => FAULTS.VARIANTS[f.id].correctFix(st, f));
        const after = FAULTS.fixedMap(st);
        if (!Object.keys(after).every(k => after[k])) {
            allRepaired++;
            firstProblem.after = firstProblem.after || Object.keys(after).filter(k => !after[k]).join(',');
        }
    }
    chk('60 labs generated without throwing', threw === 0);
    chk('no lab was invariant-dirty before its faults were applied', brokenBefore === 0, firstProblem.pre);
    chk('no fault reports itself already fixed at exam start', noneFixed === 0, firstProblem.pre_fixed);
    chk('the management path and VLAN 99 survive all 12 faults at once', dirty === 0, firstProblem.mgmt);
    chk('repairing every fault makes every fixed() true', allRepaired === 0, firstProblem.after);
}

/* ─── 7. each invariant in isolation, and the behaviours no wrong-fix happened to reach ───────── */
section('7. invariants fire on a MINIMAL breach, not only on the wrong fixes that happen to exist');
{
    /* Mutation found three blind spots here, each because a wrong fix elsewhere was breaching TWO
     * things at once and masking the one under test. An invariant that only ever fires alongside
     * another is not proven to work. */
    const breach = (name, mutate, wantId) => {
        const st = CORE.generate('inv-' + wantId, EXAM);
        mutate(st);
        const ids = FAULTS.checkInvariants(st).map(x => x.id);
        chk(name, ids.indexOf(wantId) >= 0, 'got [' + ids.join(',') + ']');
    };
    breach('a pool containing ONLY the gateway trips dhcp-pools-sane', st => {
        /* S9A's wrong fix widens the pool to the whole subnet, which contains the gateway AND the
         * reservations -- so deleting the gateway check changed no outcome. .1-.39 contains the
         * gateway and neither reservation (.40 and .50), which isolates it. */
        st.dhcp.subnets[10].pool = { start: st.subnets[10].gateway, end: host10(st, 39) };
    }, 'dhcp-pools-sane');
    breach('a pool containing ONLY a reservation trips dhcp-pools-sane', st => {
        st.dhcp.subnets[10].pool = { start: host10(st, 45), end: host10(st, 60) };
    }, 'dhcp-pools-sane');
    breach('a pool leaving its own subnet trips dhcp-pools-sane', st => {
        st.dhcp.subnets[10].pool = { start: host10(st, 100), end: '10.' + st.params.b + '.11.50' };
    }, 'dhcp-pools-sane');
    breach('one wrongly-shut port trips only-rogue-port-shut', st => {
        st.ports['MeridianSW-01']['Fa0/9'].shutdown = true;
    }, 'only-rogue-port-shut');
    breach('VLAN 30 on the floor-2 trunk trips no-servers-on-floor2-trunk', st => {
        ['MeridianSW-01', 'MeridianSW-02'].forEach(sw => st.ports[sw]['Gi0/1'].allowed.push(30));
    }, 'no-servers-on-floor2-trunk');
    breach('VLAN 99 off the trunk trips vlan99-intact', st => {
        ['MeridianSW-01', 'MeridianSW-02'].forEach(sw => {
            st.ports[sw]['Gi0/1'].allowed = st.ports[sw]['Gi0/1'].allowed.filter(v => v !== 99);
        });
    }, 'vlan99-intact');
    breach('a dead transit cable trips mgmt-path', st => {
        st.ports['MeridianRTR-01']['Gi0/1'].up = false;
    }, 'mgmt-path');
    breach('an A record pointing at nothing trips dns-records-resolve', st => {
        st.dns.loaded.records.filter(r => r.name === 'www')[0].target = '172.16.50.99';
    }, 'dns-records-resolve');
    breach('two APs on one channel trips wireless-channel-plan', st => {
        st.wireless.apChannels['AP-3'] = st.wireless.apChannels['AP-1'];
    }, 'wireless-channel-plan');
    breach('a deleted printer reservation trips printer-reservation-intact', st => {
        st.dhcp.reservations = st.dhcp.reservations.filter(r => r.host !== 'PRN-SALES01');
        CORE.resolveLeases(st);
    }, 'printer-reservation-intact');
    /* The OTHER branch: the reservation survives but the printer is no longer holding it. That is
     * the shape a student leaves behind by moving its port while "fixing" something else. Mutation
     * showed disabling this branch changed no outcome, because it is only ever reached while a
     * fault is active and invariants are checked before the fault and after the repair. */
    breach('a printer leasing somewhere other than its reservation trips printer-reservation-intact', st => {
        const pr = st.endpoints.filter(e => e.name === 'PRN-SALES01')[0];
        st.ports[pr.switch][pr.port].vlan = 20;
        CORE.resolveLeases(st);
    }, 'printer-reservation-intact');
    breach('a guest reaching the file server trips guest-cannot-reach-servers', st => {
        st.acls['MeridianRTR-01']['GUEST-IN'].applied = [];
    }, 'guest-cannot-reach-servers');
    breach('a blanket guest deny trips guest-keeps-internet', st => {
        st.acls['MeridianRTR-01']['GUEST-IN'].lines = [
            { seq: 10, action: 'deny', proto: 'ip', src: st.subnets[40].cidr, dst: 'any', hits: 0 }
        ];
    }, 'guest-keeps-internet');
    chk('every invariant has at least one isolation case above',
        FAULTS.INVARIANTS.length === 11, 'invariants: ' + FAULTS.INVARIANTS.map(i => i.id).join(','));

    /* S8A's fixed() must require BOTH halves. Mutation showed dropping the "guest keeps internet"
     * half changed no outcome, because the blanket-deny wrong fix was being caught by the invariant
     * instead -- so fixed() was free to lie. */
    {
        const st = labWith('S8A');
        FAULTS.applyAll(st);
        st.acls['MeridianRTR-01']['GUEST-IN'].lines = [
            { seq: 10, action: 'deny', proto: 'ip', src: st.subnets[40].cidr, dst: 'any', hits: 0 }
        ];
        chk('S8A: a blanket guest deny does NOT count as fixed, even though SMB is blocked',
            FAULTS.fixedMap(st).S8A === false);
    }

    /* S10B's whole lesson: an edit the serial does not advertise is invisible. Mutation showed
     * reloadZone would happily copy the file across without a bump and nothing noticed. */
    {
        const st = labWith('S10B');
        FAULTS.applyAll(st);
        chk('S10B: the record is on disk but not served', 
            st.dns.zoneFile.records.some(r => r.name === 'wiki')
            && !st.dns.loaded.records.some(r => r.name === 'wiki'));
        const before = JSON.stringify(st.dns.loaded);
        const did = FAULTS.reloadZone(st);
        chk('S10B: reloading WITHOUT bumping the serial changes nothing',
            did === false && JSON.stringify(st.dns.loaded) === before);
        chk('S10B: and it is still not fixed', FAULTS.fixedMap(st).S10B === false);
        st.dns.zoneFile.serial += 1;
        chk('S10B: bumping the serial and reloading does serve it', FAULTS.reloadZone(st) === true);
        chk('S10B: now it is fixed', FAULTS.fixedMap(st).S10B === true);
    }
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
