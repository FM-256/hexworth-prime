#!/usr/bin/env node
/**
 * netfinal-gui.test.js — stage 5 of the Network+ Meridian Corp final exam.
 *
 * @catalog what    Drives the seven GUI windows: the six faults that cannot be fixed from a
 * @catalog what    terminal, the firewall's Test-from-WAN page, device restore, change requests
 * @catalog what    and the incident log, and that every window shows its fault.
 * @catalog run     node _tools/netfinal/netfinal-gui.test.js
 * @catalog status  TOOL
 *
 * WHAT STAGE 5 OWES, from spec section 10 extension 5: firewall, wireless controller, NOC, rack
 * view, question panel, change request form, incident log. Plus section 8's device restore and the
 * change-request timing rule, and the one page the chapter labs lack -- Diagnostics > Test from WAN.
 *
 * THE POINT OF THIS SUITE is the six variants stage 4 could not repair. MER-FW01 and MER-WLC01 are
 * web-access devices in section 3, and S1B's fix is physically replacing a cable, so S1B, S6B, S7A,
 * S7B, S11A and S11B have no terminal path. Stage 4's test named them; if this suite does not close
 * them, six of twenty-four faults are unfixable and the exam is unpassable.
 */
const path = require('path');
const NF = path.resolve(__dirname, '../../functions/netfinal');
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const GUI = require(path.join(NF, 'netfinal-gui.js'));
const TOPO = require(path.join(NF, 'netfinal-topology.js'));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + String(detail).slice(0, 280) : '')); }
};
const section = (t) => console.log('\n' + t);
const EXAM = 'net-final-2026';
const ALL = [];
TOPO.FAULT_SLOTS.forEach(s => Object.keys(s.variants).forEach(v => ALL.push(s.slot + v)));

function labWith(id, seed) {
    const st = CORE.generate(seed || ('g-' + id), EXAM);
    const slot = id.slice(0, -1), variant = id.slice(-1);
    const meta = TOPO.FAULT_SLOTS.filter(s => s.slot === slot)[0].variants[variant];
    const rng = CORE.makeRng((seed || ('g-' + id)) + '|force|' + id);
    st.faults = [{ slot, variant, id, active: true, applied: false, layer: meta.layer, group: meta.group,
                   target: CORE.pickFaultTarget(st, rng, slot, variant) }];
    if (slot === 'S4') { st.rogue.variant = variant; st.rogue.mode = variant === 'B' ? 'duplicate-address' : 'arp-spoof'; }
    FAULTS.applyAll(st);
    return st;
}

/* ─── 1. the windows exist and render ─────────────────────────────────────────────────────────── */
section('1. all seven windows render against a real lab');
{
    const st = labWith('S1A');
    chk('the spec’s seven windows are all present', GUI.WINDOWS.length === 7
        && ['firewall', 'wireless', 'noc', 'rack', 'questions', 'change-requests', 'incident-log']
            .every(w => GUI.WINDOWS.indexOf(w) >= 0), GUI.WINDOWS.join(','));
    GUI.WINDOWS.forEach(w => {
        const v = GUI.render(st, w);
        chk(w + ': renders with a title and no error', !!v && !v.error && !!v.title, JSON.stringify(v).slice(0, 120));
    });
    chk('an unknown window is refused, not rendered empty', !!GUI.render(st, 'nope').error);
    chk('an unknown action is refused', GUI.act(st, 'firewall', 'launch-missiles', {}).ok === false);
    chk('a refused action is still logged, because an attempt is evidence',
        (st.events || []).some(e => /launch-missiles/.test(e.detail) && /rejected/.test(e.detail)));
}

/* ─── 2. the six faults a terminal cannot reach ───────────────────────────────────────────────── */
section('2. the six GUI-only faults, repaired through act()');
{
    /* These are the exact six stage 4's test refused to claim. If any one of them cannot be fixed
     * here, that fault is unfixable anywhere and a student loses those marks with no recourse. */
    const REPAIRS = {
        S1B: (st, f) => [['rack', 'replace-cable', { device: f.target.switch, port: f.target.port }]],
        S6B: (st) => [['firewall', 'ipsec-add-phase2',
                       { local: st.subnets[20].cidr, remote: TOPO.FIXED_NETS.branch.cidr }]],
        S7A: (st) => [['firewall', 'nat-add-outbound', { src: st.subnets[20].cidr }]],
        S7B: (st) => [['firewall', 'portforward-set', { wanPort: 443, toIp: '172.16.50.10' }]],
        S11A: (st) => [['wireless', 'ssid-set-vlan', { ssid: 'Meridian-Guest', vlan: 40 }]],
        S11B: (st) => [['wireless', 'ap-set-channel', { ap: 'AP-1', channel: 1 }],
                       ['wireless', 'ap-set-channel', { ap: 'AP-2', channel: 6 }],
                       ['wireless', 'ap-set-channel', { ap: 'AP-3', channel: 11 }]]
    };
    chk('exactly the six stage-4 could not reach are covered here',
        Object.keys(REPAIRS).sort().join(',') === 'S11A,S11B,S1B,S6B,S7A,S7B',
        Object.keys(REPAIRS).sort().join(','));

    Object.keys(REPAIRS).forEach(id => {
        const st = labWith(id, 'fix-' + id);
        const f = st.faults[0];
        chk(id + ': broken at exam start', FAULTS.fixedMap(st)[id] === false);
        const results = REPAIRS[id](st, f).map(([w, a, p]) => GUI.act(st, w, a, p));
        chk(id + ': every GUI action was accepted',
            results.every(r => r.ok), JSON.stringify(results.filter(r => !r.ok)));
        chk(id + ': fixed() is true after the GUI repair', FAULTS.fixedMap(st)[id] === true);
        const cd = FAULTS.collateralDamage(st);
        chk(id + ': and it caused no collateral damage', cd.length === 0,
            JSON.stringify(cd.map(x => x.id + ': ' + x.detail)));
        chk(id + ': the repair is in the event log', (st.events || []).some(e => e.kind === 'gui'));
    });

    /* Together with stage 4's eighteen, that is all twenty-four. Asserted so neither suite can
     * quietly shrink and leave a fault with no fix path at all. */
    chk('18 typed + 6 GUI accounts for every variant', 18 + Object.keys(REPAIRS).length === ALL.length,
        ALL.length + ' variants');
}

/* ─── 3. each window shows its own fault ──────────────────────────────────────────────────────── */
section('3. a window makes its fault visible, derived rather than narrated');
{
    {   // S7B: the forward points somewhere nothing answers.
        const st = labWith('S7B');
        const fw = GUI.render(st, 'firewall');
        chk('S7B: the firewall shows the forward aimed at .11',
            fw.portForwards.some(f => f.wanPort === 443 && /172\.16\.50\.11/.test(f.target)),
            JSON.stringify(fw.portForwards));
        chk('S7B: Test from WAN on 443 fails, and says why',
            (() => { const r = GUI.act(st, 'firewall', 'diag-test-from-wan', { port: 443 });
                     return r.reachOk === false && /L\d/.test(r.message); })());
        GUI.act(st, 'firewall', 'portforward-set', { wanPort: 443, toIp: '172.16.50.10' });
        chk('S7B: and it succeeds once repaired',
            GUI.act(st, 'firewall', 'diag-test-from-wan', { port: 443 }).reachOk === true);
    }
    {   // S6B: the tunnel reads healthy while one network cannot cross it. That is the deception.
        const st = labWith('S6B');
        const fw = GUI.render(st, 'firewall');
        chk('S6B: the tunnel reports UP', fw.ipsec.tunnelUp === true);
        chk('S6B: but no phase-2 entry covers Engineering',
            !fw.ipsec.phase2.some(p => p.local === st.subnets[20].cidr),
            JSON.stringify(fw.ipsec.phase2.map(p => p.local)));
        chk('S6B: while one DOES cover Sales, which is the ticket’s distinguishing detail',
            fw.ipsec.phase2.some(p => p.local === st.subnets[10].cidr));
    }
    {   // S7A: no translations for Engineering in the state table.
        const st = labWith('S7A');
        const fw = GUI.render(st, 'firewall');
        chk('S7A: no outbound rule lists the Engineering network',
            !fw.natOutbound.some(r => r.source === st.subnets[20].cidr));
        chk('S7A: and the state table has no Engineering translations',
            !fw.natState.some(r => CORE.ip.inNet(CORE.ip.toInt(r.inside.split(':')[0]), st.subnets[20].parsed)));
        chk('S7A: while Sales translations are present',
            fw.natState.some(r => CORE.ip.inNet(CORE.ip.toInt(r.inside.split(':')[0]), st.subnets[10].parsed)));
    }
    {   // S11A: guests on Sales addresses, in the controller's own client list.
        const st = labWith('S11A');
        const w = GUI.render(st, 'wireless');
        chk('S11A: the controller shows the guest SSID on VLAN 10',
            w.ssids.filter(s => s.name === 'Meridian-Guest')[0].vlan === 10);
        /* The DHCP guests only. The two kiosks are statically addressed in VLAN 40 and do not move
         * when the SSID mapping changes -- which is correct, and is itself a diagnostic detail: a
         * static host on a mis-mapped SSID ends up with an address its new VLAN cannot route. */
        chk('S11A: the DHCP guest clients hold Sales addresses',
            w.clients.filter(c => /^WIFI-GUEST/.test(c.name))
                .every(c => CORE.ip.inNet(CORE.ip.toInt(c.address), st.subnets[10].parsed)),
            JSON.stringify(w.clients.filter(c => /^WIFI-GUEST/.test(c.name)).map(c => [c.name, c.address])));
        chk('S11A: while the statically-addressed kiosks keep their VLAN 40 addresses',
            w.clients.filter(c => /^KIOSK-GUEST/.test(c.name))
                .every(c => CORE.ip.inNet(CORE.ip.toInt(c.address), st.subnets[40].parsed)));
    }
    {   // S11B: co-channel, with the retry rate that follows from it.
        const st = labWith('S11B');
        const w = GUI.render(st, 'wireless');
        const hot = w.accessPoints.filter(a => a.coChannelWith.length > 0);
        chk('S11B: two APs are flagged as co-channel', hot.length === 2, JSON.stringify(w.accessPoints.map(a => [a.name, a.band24Channel])));
        chk('S11B: and their retry rate is high, derived from the overlap',
            hot.every(a => a.retriesPct > 20) && w.accessPoints.filter(a => !a.coChannelWith.length).every(a => a.retriesPct < 10));
    }
    {   // S1B: the rack view calls it a degraded cable, which no counter does.
        const st = labWith('S1B');
        const f = st.faults[0];
        const r = GUI.render(st, 'rack');
        const row = r.ports.filter(p => p.device === f.target.switch && p.port === f.target.port)[0];
        chk('S1B: the rack view marks that cable degraded', row && row.cable === 'degraded', JSON.stringify(row));
        chk('S1B: and the link is still up, because the ticket says slow not dead', row && row.link === 'up');
        /* Reseating is the cheaper guess and must NOT fix damage -- that distinction is the lesson. */
        GUI.act(st, 'rack', 'reseat-cable', { device: f.target.switch, port: f.target.port });
        chk('S1B: reseating does not repair a damaged cable', FAULTS.fixedMap(st).S1B === false);
        GUI.act(st, 'rack', 'replace-cable', { device: f.target.switch, port: f.target.port });
        chk('S1B: replacing it does', FAULTS.fixedMap(st).S1B === true);
    }
    {   // S12A: the NOC alert is a false positive, and the window shows both halves.
        const st = labWith('S12A');
        const n = GUI.render(st, 'noc');
        chk('S12A: the NOC raises SW-02 unreachable', n.alerts.some(a => /MeridianSW-02 unreachable/.test(a.text)));
        chk('S12A: while the device answers ICMP, which makes it a false positive',
            n.devices.filter(d => d.name === 'MeridianSW-02')[0].icmp === true);
        chk('S12A: and the poll row blames the community, not reachability',
            n.pollStatus.filter(p => p.device === 'MeridianSW-02')[0].reason === 'SNMP community mismatch');
    }
    {   // The decoy is presented exactly like a real alert. Triaging it is the graded skill.
        const st = labWith('S1A');
        const n = GUI.render(st, 'noc');
        const decoy = n.alerts.filter(a => a.id === st.monitoring.decoyAlert)[0];
        chk('the seeded decoy alert appears', !!decoy, JSON.stringify(n.alerts.map(a => a.id)));
        chk('and nothing marks it as a decoy to the student',
            decoy && decoy.why === undefined && !/decoy|noise|ignore/i.test(decoy.text), JSON.stringify(decoy));
        chk('different seeds draw different decoys',
            new Set([0, 1, 2, 3, 4, 5, 6, 7].map(i => CORE.generate('dec-' + i, EXAM).monitoring.decoyAlert)).size > 1);
    }
}

/* ─── 4. change requests and the credit-bearing timing ────────────────────────────────────────── */
section('4. change requests: five fields, never blocking, and the order is recorded');
{
    const st = labWith('S12A');
    const form = GUI.render(st, 'change-requests');
    chk('the form has the spec’s five fields',
        form.fields.join(',') === 'ticket,rootCause,layer,plannedChange,rollback', form.fields.join(','));
    chk('an incomplete request is refused with the missing fields named', (() => {
        const r = GUI.act(st, 'change-requests', 'submit', { ticket: 'S12', rootCause: 'community' });
        return r.ok === false && /layer/.test(r.reason) && /rollback/.test(r.reason);
    })());
    const before = (st.events || []).length;
    const sub = GUI.act(st, 'change-requests', 'submit', {
        ticket: 'S12', rootCause: 'SNMP community mismatch on SW-02', layer: 7,
        plannedChange: 'set the community to match the NOC', rollback: 'restore the previous community'
    });
    chk('a complete request is accepted and records its position in the log',
        sub.ok && sub.atEvent === before, JSON.stringify(sub));
    chk('and it appears in the submitted list', GUI.render(st, 'change-requests').submitted.length === 1);

    /* THE CREDIT RULE, spec section 8: full marks only when the request precedes the change that
     * made the fix pass. Both orders are exercised THROUGH A SURFACE a student can use -- an
     * earlier version of this mutated state directly, so no real event index existed and the two
     * positions collided at zero, which made "before" undecidable and hid the defect. */
    const order = (seed, filedFirst) => {
        const lab = labWith('S7B', seed);
        const file = () => GUI.act(lab, 'change-requests', 'submit', {
            ticket: 'S7', rootCause: 'port forward targets the wrong DMZ address', layer: 4,
            plannedChange: 'repoint WAN:443 at 172.16.50.10', rollback: 'restore the previous target'
        });
        const fix = () => GUI.act(lab, 'firewall', 'portforward-set', { wanPort: 443, toIp: '172.16.50.10' });
        if (filedFirst) { file(); fix(); } else { fix(); file(); }
        return { cr: lab.changeRequests[0].atEvent, fixAt: lab.faults[0].fixedAtEvent, lab: lab };
    };
    const early = order('cr-early', true);
    chk('a request filed BEFORE the change precedes it, which earns full credit',
        early.cr < early.fixAt, 'cr@' + early.cr + ' fix@' + early.fixAt);
    chk('and the fix still passed', FAULTS.fixedMap(early.lab).S7B === true);
    const late = order('cr-late', false);
    chk('a request filed AFTER the change follows it, which the spec scores 3 of 6',
        late.cr > late.fixAt, 'cr@' + late.cr + ' fix@' + late.fixAt);
    chk('the two positions are never equal, so the comparison always decides',
        early.cr !== early.fixAt && late.cr !== late.fixAt);

    /* Spec section 8: "The form never blocks the student from making a change." */
    const nofile = labWith('S7B', 'nocr');
    GUI.act(nofile, 'firewall', 'portforward-set', { wanPort: 443, toIp: '172.16.50.10' });
    chk('a fix with no change request at all still passes its own check',
        FAULTS.fixedMap(nofile).S7B === true && !(nofile.changeRequests || []).length);
}

/* ─── 5. the incident log ─────────────────────────────────────────────────────────────────────── */
section('5. the incident log records a layer from a closed list');
{
    const st = labWith('S3A');
    const log = GUI.render(st, 'incident-log');
    chk('the log offers the OSI layers as a closed list, because the layer is graded',
        log.layerOptions.join(',') === '1,2,3,4,7', log.layerOptions.join(','));
    chk('an entry without a ticket is refused', GUI.act(st, 'incident-log', 'submit', { symptom: 'x' }).ok === false);
    const r = GUI.act(st, 'incident-log', 'submit', {
        ticket: 'S3', symptom: 'floor-2 Engineering on 169.254', layer: 2,
        rootCause: 'VLAN 20 missing from the trunk allowed list',
        fix: 'switchport trunk allowed vlan add 20 on both ends',
        verification: 'hosts lease and reach the file server'
    });
    chk('a complete entry is accepted', r.ok);
    chk('and it is retrievable with its layer intact',
        GUI.render(st, 'incident-log').entries[0].layer === '2'
        || GUI.render(st, 'incident-log').entries[0].layer === 2,
        JSON.stringify(GUI.render(st, 'incident-log').entries[0]));
    /* The graded layer comes from the CATALOG, which is why S8 and S11 carry per-variant layers.
     * This asserts the two agree for the fault under test, so a correct student answer matches. */
    chk('the catalog layer for this variant is what a correct entry would say',
        FAULTS.VARIANTS.S3A.layer === 2);
}

/* ─── 6. device restore ───────────────────────────────────────────────────────────────────────── */
section('6. restore to exam start: free, logged, and it really restores');
{
    const st = labWith('S2A');
    const f = st.faults[0];
    chk('broken at exam start', FAULTS.fixedMap(st).S2A === false);
    /* Make a mess, then restore it. */
    st.ports[f.target.switch][f.target.port].vlan = 10;
    CORE.resolveLeases(st);
    FAULTS.recordProgress(st);
    chk('a fix lands', FAULTS.fixedMap(st).S2A === true && typeof f.fixedAtEvent === 'number');
    const res = GUI.restore(st, f.target.switch);
    chk('restore reports success', res.ok, JSON.stringify(res));
    chk('the device is back to its exam-start config', FAULTS.fixedMap(st).S2A === false);
    chk('the undone fix is un-stamped, which the spec scores as zero',
        f.fixedAtEvent === undefined && f.undone === true);
    chk('the restore is logged', (st.events || []).some(e => e.kind === 'restore'));
    chk('restoring an unknown device is refused', GUI.restore(st, 'NOPE-01').ok === false);
    /* A restore must not take anything else with it. */
    chk('restoring one switch leaves the other alone',
        FAULTS.collateralDamage(st).length === 0,
        JSON.stringify(FAULTS.collateralDamage(st).map(x => x.id)));
}

/* ─── 7. the question panel shell ─────────────────────────────────────────────────────────────── */
section('7. the question panel: free navigation, answers stored ungraded');
{
    const st = labWith('S1A');
    st.questions = [
        { id: 'q1', phase: 1, points: 2, prompt: 'Which VLAN is Sales?', kind: 'text' },
        { id: 'q2', phase: 1, points: 2, prompt: 'Which port is the printer on?', kind: 'text' }
    ];
    const p0 = GUI.render(st, 'questions');
    chk('navigation is free, not sequential', p0.sequential === false);
    chk('every question is listed with its answered state',
        p0.total === 2 && p0.answered === 0 && p0.items.every(i => i.answered === false));
    chk('an answer with no id is refused', GUI.act(st, 'questions', 'answer', { value: 'x' }).ok === false);
    GUI.act(st, 'questions', 'answer', { id: 'q1', value: '10' });
    const p1 = GUI.render(st, 'questions');
    chk('an answer is recorded and the panel reflects it',
        p1.answered === 1 && p1.items.filter(i => i.id === 'q1')[0].answered === true);
    /* Nothing may tell the student whether an answer is right: grading is server-side at
     * submission, per spec section 9. */
    chk('the panel does not reveal correctness',
        !/correct|right|wrong|score/i.test(JSON.stringify(p1)), JSON.stringify(p1).slice(0, 160));
    chk('a re-answer overwrites rather than appending', (() => {
        GUI.act(st, 'questions', 'answer', { id: 'q1', value: '20' });
        return st.answers.q1.value === '20' && GUI.render(st, 'questions').answered === 1;
    })());
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
