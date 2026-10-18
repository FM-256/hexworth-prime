#!/usr/bin/env node
/**
 * netfinal-leak.test.js — the exam-integrity gate for the Network+ final.
 *
 * @catalog what    Scans EVERY client-facing surface of the exam engine for fault disclosure: the
 * @catalog what    initialState projection, all seven GUI window renders, every action return, and
 * @catalog what    the output of every command a student can type. Also checks the seed secret.
 * @catalog run     node _tools/netfinal/netfinal-leak.test.js
 * @catalog status  TOOL
 *
 * WHY THIS SUITE EXISTS. Spec section 9 is a security requirement, not a preference: "initialState
 * contains the broken config but no field naming the fault, slot, or variant", and "the browser
 * never holds expected values or grader functions". The spec also records that the CURRENT MIDTERM
 * BUILD FAILS that bar, because its config -- every task, every expected value, every verification
 * function -- loads without authentication.
 *
 * Mallory audited stages 1-5 and found `state` carries all twelve faults with slot, variant, id and
 * target, plus `meta.seedStr`, plus a full exam-start snapshot: 47KB of object, almost all of it
 * answer-key-adjacent, with nothing trimming it. She also regenerated a healthy lab from the same
 * seed and diffed it to locate every fault in about thirty lines, because the seed was the student's
 * own identity with no server secret in it.
 *
 * SO THIS SUITE TESTS THE PROPERTY, NOT THE PROJECTOR. A test that only checked toInitialState()
 * would pass forever while stage 7 shipped `state` down a different path. Every client-facing
 * function in the engine is scanned, so a new leak has to survive this file to ship.
 */
const path = require('path');
const NF = path.resolve(__dirname, '../../functions/netfinal');
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const SH = require(path.join(NF, 'netfinal-shell.js'));
const GUI = require(path.join(NF, 'netfinal-gui.js'));
const CL = require(path.join(NF, 'netfinal-client.js'));
const TOPO = require(path.join(NF, 'netfinal-topology.js'));
const EX = require(path.join(NF, 'netfinal-exam.js'));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + String(detail).slice(0, 300) : '')); }
};
const section = (t) => console.log('\n' + t);
const EXAM = 'net-final-2026';

const st = CORE.generate('leak-student', EXAM, { secret: 'a-real-server-secret' });
FAULTS.applyAll(st);

/* ─── 1. the raw state is radioactive, and the projection is not ──────────────────────────────── */
section('1. the projection, against the raw state it comes from');
{
    const raw = CL.findDisclosures(st);
    /* Asserting the RAW state is dirty is not pedantry: if this ever came back clean, the detector
     * would be broken rather than the state safe, and every other assertion here would be vacuous.
     * A clean "0 found" is the smell this repo has been taught to distrust. */
    chk('the raw state DOES disclose faults, so the detector demonstrably works',
        raw.length > 20, 'only ' + raw.length + ' disclosures found in raw state');
    chk('and it names the fault array specifically',
        raw.some(h => /\.faults/.test(h.path)), JSON.stringify(raw.slice(0, 3)));
    chk('and the seed', raw.some(h => /seedStr|seed32/.test(h.path)));
    chk('and the exam-start baseline', raw.some(h => /baseline/.test(h.path)));

    const init = CL.toInitialState(st);
    chk('the projection discloses nothing', CL.findDisclosures(init).length === 0,
        JSON.stringify(CL.findDisclosures(init)));
    chk('the projection is much smaller than the state it came from',
        JSON.stringify(init).length < JSON.stringify(st).length / 3,
        JSON.stringify(init).length + ' vs ' + JSON.stringify(st).length);
    /* It still has to be USEFUL, or a page cannot be drawn from it and stage 7 will reach for the
     * raw state instead -- which is how a projector gets bypassed rather than removed. */
    chk('the projection still carries what a page must draw',
        init.vlans.length === 5 && init.devices.length === 9
        && Object.keys(init.ports).length >= 2 && !!init.decoyDiagram,
        JSON.stringify(Object.keys(init)));
    chk('it carries the broken config, so the network looks misconfigured as the spec intends',
        JSON.stringify(init.ports).length > 1000);
    /* Tickets are legitimately client-facing -- the text IS the symptom, and reading it is the
     * first thing the exam asks for. What must not travel is the id-to-slot mapping. */
    chk('the ticket queue reaches the student', init.tickets.length === 12
        && init.tickets.every(t => /^TKT-\d+$/.test(t.id) && t.text && t.text.length > 20),
        JSON.stringify(init.tickets.slice(0, 2)));
    chk('but no ticket id is a slot name, so the id reveals no fault family',
        init.tickets.every(t => !/^S\d/.test(t.id) && !/\bS(?:[1-9]|1[0-2])[AB]\b/.test(t.id)));
    chk('and the id-to-slot mapping is NOT in the projection',
        JSON.stringify(init).indexOf('ticketId') < 0
        && CL.findDisclosures(init.tickets, 'tickets').length === 0);
    chk('while the mapping IS present server-side, where grading needs it',
        st.faults.every(f => /^TKT-\d+$/.test(f.ticketId))
        && FAULTS.faultForTicket(st, st.faults[0].ticketId).id === st.faults[0].id);
}

/* ─── 1b. the scanner's coverage is DERIVED from the secret object, not remembered ─────────────── */
section('1b. every field on a fault is classified, so a new secret cannot be added unnoticed');
{
    /* Chris found `ticketId` missing from FORBIDDEN_KEYS: it was added to fault objects in the round
     * that introduced tickets and never classified here, so the generic scanner -- pointed at every
     * render, action and command -- would have missed a future window that destructured a fault and
     * returned a new object carrying it. `faults` being forbidden does not help once a field is
     * copied out of one.
     *
     * That is Mallory's original finding reappearing, caused by the very next change to this file.
     * The lesson is structural: the projector is a whitelist and fails closed, but the SCANNER is a
     * blacklist and fails open. So its coverage is derived from the real object rather than from
     * someone remembering. */
    /* SAMPLED ACROSS THE FAULT'S WHOLE LIFECYCLE, not at exam start. Chris's residual on the
     * previous round: a fault that has only had applyAll() run on it never carries fixedAtEvent,
     * undone or undoneCount, so the derivation could not reach those three names. They are correctly
     * forbidden today -- but only because someone remembered, which is precisely the gap ticketId
     * was. Removing one from the list would not have failed this test, because the field would not
     * have been present to flag.
     *
     * So the fault is driven through fix, undo and re-fix, and the keys are unioned. Every name the
     * object can ever carry is now exercised by the derivation rather than resting on memory. */
    const lifecycle = CORE.generate('leak-lifecycle', EXAM, { secret: 's' });
    FAULTS.applyAll(lifecycle);
    const lf = lifecycle.faults[0];
    const seenKeys = {};
    const sample = () => Object.keys(lf).forEach(k => { seenKeys[k] = true; });
    sample();                                                            // exam start
    FAULTS.VARIANTS[lf.id].correctFix(lifecycle, lf);
    FAULTS.recordProgress(lifecycle, 0); sample();                       // fixed -> fixedAtEvent
    FAULTS.VARIANTS[lf.id].apply(lifecycle, lf);
    FAULTS.recordProgress(lifecycle, 1); sample();                       // undone -> undone
    FAULTS.VARIANTS[lf.id].correctFix(lifecycle, lf);
    FAULTS.recordProgress(lifecycle, 2); sample();                       // re-fixed -> undoneCount
    const fault = st.faults[0];

    /* Four ways a field may be classified, and every field on a fault must use one of them:
     * forbidden by name, checked by value (id -> 'S3A' matches the pattern sweep), checked by shape
     * (target -> only when it carries fault-target fields), or named benign. */
    const classified = CL.FORBIDDEN_KEYS
        .concat(CL.VALUE_CHECKED_KEYS).concat(CL.SHAPE_CHECKED_KEYS).concat(CL.BENIGN_FAULT_FIELDS);
    const allLifecycleKeys = Object.keys(seenKeys);
    chk('the lifecycle sample reaches the fields exam start never shows',
        ['fixedAtEvent', 'undone', 'undoneCount'].every(k => allLifecycleKeys.indexOf(k) >= 0),
        JSON.stringify(allLifecycleKeys));
    const unclassifiedLife = allLifecycleKeys.filter(k => classified.indexOf(k) < 0);
    chk('every field a fault can EVER carry is classified, across its whole lifecycle',
        unclassifiedLife.length === 0,
        'unclassified: ' + unclassifiedLife.join(', ') + ' -- add each to FORBIDDEN_KEYS or BENIGN_FAULT_FIELDS');
    const unclassified = Object.keys(fault).filter(k => classified.indexOf(k) < 0);
    chk('every field on a fault object is either forbidden or named benign',
        unclassified.length === 0,
        'unclassified: ' + unclassified.join(', ') + ' -- add each to FORBIDDEN_KEYS or BENIGN_FAULT_FIELDS');
    chk('and the fault object really does carry secrets, so this is not vacuous',
        Object.keys(fault).some(k => CL.FORBIDDEN_KEYS.indexOf(k) >= 0),
        JSON.stringify(Object.keys(fault)));
    /* The specific miss, as a regression: a field COPIED out of a fault must still be caught. */
    chk('a ticketId copied into a fresh object is caught',
        CL.findDisclosures({ echo: [{ ticketId: 'TKT-104' }] }).length > 0);
    chk('a slot copied into a fresh object is caught',
        CL.findDisclosures({ echo: { slot: 'S3', variant: 'A' } }).length > 0);
    chk('a layer copied out is NOT caught, because a layer is benign on its own',
        CL.findDisclosures({ echo: { layer: 2 } }).length === 0);
    chk('a fault id copied out is caught by VALUE, since the key name is too common to ban',
        CL.findDisclosures({ echo: { id: 'S11B' } }).length > 0
        && CL.findDisclosures({ echo: { id: 'TKT-104' } }).length === 0);

    /* And the same discipline for the baseline, the other server-only structure. */
    const unclassifiedBase = Object.keys(st.baseline).filter(k =>
        CL.FORBIDDEN_KEYS.indexOf(k) < 0
        && ['trunks', 'shutPorts', 'aclSeqs', 'gateways', 'defaultNextHop', 'rogue', 'dnsSerial'].indexOf(k) < 0);
    chk('every field on the exam-start baseline is accounted for',
        unclassifiedBase.length === 0, 'unclassified: ' + unclassifiedBase.join(', '));
}

/* ─── 2. every GUI window and every action return ─────────────────────────────────────────────── */
section('2. all seven windows, and every action result');
{
    GUI.WINDOWS.forEach(w => {
        const hits = CL.findDisclosures(GUI.render(st, w), w);
        chk(w + ': render discloses nothing', hits.length === 0, JSON.stringify(hits));
    });

    /* ONE LAB IS ONE SAMPLE, AND A SAMPLE DOES NOT RENDER EVERY BRANCH. The scan above runs on a
     * single seeded lab, and that lab's NOC window emitted exactly two alerts -- a poller alert and
     * a decoy. The two push sites that build an alert FROM A FAULT never executed, so the scan could
     * not have failed no matter what those lines contained. Proven by mutating them to emit the
     * fault id instead of the ticket id: sections 1-5 stayed green.
     *
     * So sweep every variant with the fault FORCED, the way the faults suite does, rather than hoping
     * a seed draws it. 24 variants x 7 windows, and a coverage guard below that fails if the sweep
     * stopped reaching the branches it exists to reach. Audit the partitions; never sample. */
    {
        const ALL_IDS = [];
        TOPO.FAULT_SLOTS.forEach(sl => Object.keys(sl.variants).forEach(v => ALL_IDS.push(sl.slot + v)));
        let faultAlerts = 0, windowsScanned = 0;
        const dirty = [];
        ALL_IDS.forEach(id => {
            const slot = id.slice(0, -1), variant = id.slice(-1);
            const meta = TOPO.FAULT_SLOTS.filter(x => x.slot === slot)[0].variants[variant];
            const lab = CORE.generate('leak-sweep-' + id, EXAM, { secret: 'a-real-server-secret' });
            const rng = CORE.makeRng('leak-sweep-' + id + '|force|' + id);
            lab.faults = [{
                slot, variant, id, active: true, applied: false,
                layer: meta.layer, group: meta.group,
                target: CORE.pickFaultTarget(lab, rng, slot, variant)
            }];
            if (slot === 'S4') {
                lab.rogue.variant = variant;
                lab.rogue.mode = variant === 'B' ? 'duplicate-address' : 'arp-spoof';
            }
            /* Tickets must be assigned, or the ids the renders quote are `undefined` and the sweep
             * would scan a shape production never serves. */
            FAULTS.assignTickets(lab, CORE.makeRng('leak-sweep-tkt-' + id));
            FAULTS.applyAll(lab);
            GUI.WINDOWS.forEach(w => {
                const view = GUI.render(lab, w);
                windowsScanned++;
                if (w === 'noc') {
                    faultAlerts += (view.alerts || []).filter(a => /^alert-/.test(String(a.id || ''))).length;
                }
                const hits = CL.findDisclosures(view, id + '/' + w);
                if (hits.length) { dirty.push(id + '/' + w + ': ' + JSON.stringify(hits.slice(0, 2))); }
            });
        });
        chk('all 24 variants were swept (' + windowsScanned + ' window renders)',
            ALL_IDS.length === 24 && windowsScanned === ALL_IDS.length * GUI.WINDOWS.length,
            ALL_IDS.length + ' variants, ' + windowsScanned + ' renders');
        chk('no window on any single-variant lab discloses anything',
            dirty.length === 0, dirty.slice(0, 3).join(' | '));
        /* THE GUARD THAT MAKES THE ASSERTION ABOVE MEAN SOMETHING. If a refactor stops routing fault
         * evidence into NOC alerts, this fails loudly instead of letting the sweep pass on empty
         * arrays -- the exact way the single-lab scan passed for weeks. */
        chk('the sweep actually rendered fault-derived NOC alerts (' + faultAlerts + ' seen)',
            faultAlerts > 0, 'the alert branches still never executed; the scan above proves nothing');
    }
    /* Action RETURNS go to the client too. A rejection message that quoted internal state would
     * leak just as effectively as a render. */
    const probes = [
        ['firewall', 'diag-ping', { target: '8.8.8.8' }],
        ['firewall', 'diag-test-from-wan', { port: 443 }],
        ['firewall', 'nat-add-outbound', { src: 'not-a-cidr' }],
        ['firewall', 'ipsec-add-phase2', { local: 'x', remote: 'y' }],
        ['firewall', 'portforward-set', { wanPort: 9999, toIp: '1.1.1.1' }],
        ['wireless', 'ssid-set-vlan', { ssid: 'Meridian-Guest', vlan: 99 }],
        ['wireless', 'ap-set-channel', { ap: 'AP-9', channel: 6 }],
        ['rack', 'replace-cable', { device: 'NOPE', port: 'Fa0/1' }],
        ['noc', 'ack-alert', { id: 'x' }],
        ['questions', 'answer', { id: 'q1', value: 'z' }],
        ['change-requests', 'submit', { ticket: 'S3' }],
        ['incident-log', 'submit', { ticket: 'S3', layer: 2 }]
    ];
    probes.forEach(([w, a, p]) => {
        const probe = CORE.generate('leak-act-' + a, EXAM, { secret: 's' });
        FAULTS.applyAll(probe);
        const res = GUI.act(probe, w, a, p);
        const hits = CL.findDisclosures(res, w + '/' + a);
        chk(w + '/' + a + ': result discloses nothing', hits.length === 0, JSON.stringify(hits));
    });
    /* DEFENCE IN DEPTH on a real surface, not a hand-built object. Simulates the future change Chris
     * described -- a window echoing the matched fault -- and asserts the generic scanner catches it
     * through GUI.render, which is what sections 2 and 3 actually rely on. */
    {
        const probe = CORE.generate('leak-echo', EXAM, { secret: 's' });
        FAULTS.applyAll(probe);
        const real = GUI.render(probe, 'incident-log');
        chk('the incident-log render is clean today', CL.findDisclosures(real, 'incident-log').length === 0);
        /* Now leak a copied ticketId the way a careless future render would. */
        const leaky = Object.assign({}, real, { matched: probe.faults.map(f => ({ ticketId: f.ticketId })) });
        chk('and a render that echoed a ticketId WOULD be caught by the generic scanner',
            CL.findDisclosures(leaky, 'incident-log').length > 0,
            JSON.stringify(CL.findDisclosures(leaky, 'incident-log').slice(0, 2)));
    }
    chk('a device restore result discloses nothing',
        CL.findDisclosures(GUI.restore(CORE.generate('leak-r', EXAM, { secret: 's' }), 'MeridianSW-01')).length === 0);
}

/* ─── 3. every command a student can type ─────────────────────────────────────────────────────── */
section('3. the full command surface, on a lab with all twelve faults live');
{
    const cmds = SH.commands;
    chk('the command inventory is non-trivial',
        cmds.windows.length + cmds.ubuntu.length + cmds.iosShow.length + cmds.iosConf.length > 35,
        JSON.stringify(Object.keys(cmds).map(k => k + ':' + cmds[k].length)));

    /* Run every show/diagnostic command on every device that offers a shell, plus the Windows and
     * Linux sets, and scan the TEXT. A log line or a table that named a slot would be a disclosure
     * no object-key scan would catch. */
    const run = (device, lines) => {
        const lab = CORE.generate('leak-cmd', EXAM, { secret: 's' });
        FAULTS.applyAll(lab);
        let ses = SH.newSession();
        const out = [];
        const pre = [];
        if (device !== 'ADMIN-WS01') {
            pre.push('ssh admin@' + lab.devices[device].mgmtIp);
            if (/^ios/.test(lab.devices[device].platform)) { pre.push('enable'); }
        }
        pre.concat(lines).forEach(l => { const r = SH.exec(lab, ses, l); ses = r.session; out.push(r.out); });
        return out.join('\n');
    };

    const IOS = ['MeridianRTR-01', 'MeridianSW-01', 'MeridianSW-02'];
    IOS.forEach(d => {
        const text = run(d, cmds.iosShow.concat(['show logging', 'show running-config',
            'ping 8.8.8.8', 'traceroute 10.200.0.25']));
        const hits = CL.findDisclosures(text, d);
        chk(d + ': no command output names a fault', hits.length === 0, JSON.stringify(hits));
        chk(d + ': and the output is substantial, so the scan had something to read',
            text.length > 2000, text.length + ' chars');
    });
    const win = run('ADMIN-WS01', ['ipconfig /all', 'arp -a', 'route print',
        'ping fs01.meridian.local', 'tracert 10.200.0.25', 'nslookup intranet.meridian.local']);
    chk('ADMIN-WS01: no command output names a fault', CL.findDisclosures(win).length === 0,
        JSON.stringify(CL.findDisclosures(win)));
    const lin = run('MER-SRV01', ['ip addr', 'ip neigh', 'ss -tulpn', 'dig fs01.meridian.local',
        'cat /etc/kea/kea-dhcp4.conf', 'cat /etc/bind/db.meridian.local',
        'cat /var/lib/kea/kea-leases4.csv', 'journalctl -u kea-dhcp4-server',
        'journalctl -u named', 'systemctl status named', 'named-checkzone meridian.local',
        'kea-dhcp4 -t /etc/kea/kea-dhcp4.conf', 'tail -n 40 /var/log/syslog']);
    chk('MER-SRV01: no command output names a fault', CL.findDisclosures(lin).length === 0,
        JSON.stringify(CL.findDisclosures(lin)));
    chk('MER-SRV01: and the config files really were printed',
        /pools/.test(lin) && /serial/.test(lin), lin.length + ' chars');

    /* The log buffer is the likeliest place a slot id would slip out, since fault logs are authored
     * prose. Every variant's log lines are scanned directly, including the ones this seed did not
     * draw -- the drawn set is 19 of 24, so testing only the drawn ones would miss five. */
    const everyLog = [];
    Object.keys(FAULTS.VARIANTS).forEach(id => {
        const lab = CORE.generate('leak-log-' + id, EXAM, { secret: 's' });
        const slot = id.slice(0, -1), variant = id.slice(-1);
        const meta = TOPO.FAULT_SLOTS.filter(s => s.slot === slot)[0].variants[variant];
        lab.faults = [{ slot, variant, id, active: true, applied: false, layer: meta.layer,
            group: meta.group, target: CORE.pickFaultTarget(lab, CORE.makeRng('l|' + id), slot, variant) }];
        if (slot === 'S4') { lab.rogue.variant = variant; lab.rogue.mode = variant === 'B' ? 'duplicate-address' : 'arp-spoof'; }
        FAULTS.applyAll(lab);
        FAULTS.allLogs(lab).forEach(l => everyLog.push(l.text));
    });
    chk('all 24 variants’ log lines were collected', everyLog.length >= 24 * 2, everyLog.length + ' lines');
    chk('no log line names a slot or variant', CL.findDisclosures(everyLog, 'logs').length === 0,
        JSON.stringify(CL.findDisclosures(everyLog, 'logs')));
}

/* ─── 4. the seed carries a server secret ─────────────────────────────────────────────────────── */
section('4. the seed, which Mallory regenerated a healthy lab from');
{
    /* Her attack: same seed, generate once healthy and once faulted, diff the trees, read off every
     * fault site. It worked because the seed was studentId|examId -- both known to the student. */
    const sameIds = (secret) => {
        const a = CORE.generate('victim', EXAM, { secret });
        return JSON.stringify(a.subnets[10].cidr) + '|' + a.faults.map(f => f.id).join(',');
    };
    chk('a lab is reproducible given the same secret',
        sameIds('server-secret-1') === sameIds('server-secret-1'));
    chk('and NOT reproducible from the ids alone',
        sameIds('server-secret-1') !== sameIds('guessed-wrong'),
        sameIds('server-secret-1'));
    chk('a lab generated without a secret is flagged, so stage 7 can refuse to serve it',
        CORE.generate('v', EXAM).meta.devSeed === true);
    chk('and one generated with a secret is not flagged',
        CORE.generate('v', EXAM, { secret: 'x' }).meta.devSeed === false);
    chk('the secret never appears in the projection',
        JSON.stringify(CL.toInitialState(CORE.generate('v', EXAM, { secret: 'TOPSECRET' })))
            .indexOf('TOPSECRET') < 0);
    /* And the healthy-versus-faulted diff must stay possible SERVER-side, because a regrade needs
     * it. The protection is the secret, not the removal of the capability. */
    const healthy = CORE.generate('victim', EXAM, { secret: 'server-secret-1' });
    const faulted = CORE.generate('victim', EXAM, { secret: 'server-secret-1' });
    FAULTS.applyAll(faulted);
    chk('a server holding the secret CAN still reproduce the lab for a regrade',
        healthy.subnets[10].cidr === faulted.subnets[10].cidr
        && JSON.stringify(healthy.faults.map(f => f.id)) === JSON.stringify(faulted.faults.map(f => f.id)));
}

/* ─── 5. the detector itself can fail ─────────────────────────────────────────────────────────── */
section('5. the detector is not decoration');
{
    chk('a planted fault id in a string is caught',
        CL.findDisclosures({ msg: 'the problem is S7B' }).length > 0);
    chk('a planted forbidden key is caught',
        CL.findDisclosures({ nested: { deep: { baseline: { x: 1 } } } }).length > 0);
    chk('a planted seed is caught', CL.findDisclosures({ meta: { seedStr: 'abc' } }).length > 0);
    chk('a planted fault target object is caught',
        CL.findDisclosures({ f: [{ target: { host: 'X', switch: 'SW', port: 'Fa0/1' } }] }).length > 0);
    /* But a field merely NAMED target is not, because the firewall window uses that word for a
     * port forward's destination -- pfSense's own wording, and something a student must read. A
     * detector that forced renaming correct UI fields would get routed around instead of fixed. */
    chk('a port forward\u2019s destination string named "target" is NOT flagged',
        CL.findDisclosures({ portForwards: [{ wanPort: 443, target: '172.16.50.10:443' }] }).length === 0);
    chk('and the shape check is what distinguishes them',
        CL.isFaultTarget({ host: 'X' }) === true && CL.isFaultTarget('172.16.50.10:443') === false);
    chk('innocent data is NOT flagged',
        CL.findDisclosures({ vlan: 10, name: 'Sales', ports: ['Fa0/1'] }).length === 0);
    /* The change-request echo is the false positive this list was deliberately narrowed for. */
    chk('a student’s own change request echoed back is not flagged',
        CL.findDisclosures({ submitted: [{ ticket: 'S3', rootCause: 'a trunk is missing VLAN 20', layer: 2 }] })
            .filter(h => /rootCause|ticket/.test(h.path)).length === 0,
        JSON.stringify(CL.findDisclosures({ submitted: [{ ticket: 'S3', rootCause: 'x', layer: 2 }] })));
}

/* ─── 6. THE RESPONSE ENVELOPES A STUDENT ACTUALLY RECEIVES ───────────────────────────────────────
 *
 * WHY THIS SECTION EXISTS, written the day it was added. Sections 1-5 scan the STATE, the GUI
 * renders, the shell output and the log lines. Stage 7 then put a THIRD surface between the engine
 * and the browser -- the callable response envelope -- and `startExam` puts the question bank in it:
 *
 *     return { sessionId: ..., state: CLIENT.toInitialState(state), questions: QUESTIONS.forStudent(state), ... }
 *
 * `forStudent` deletes `proof` and `slot` from every question. I made that deletion as a leak fix,
 * said the leak gate had caught it, and then checked: REMOVING `delete r.slot` STILL LEFT THIS SUITE
 * AT 69/69. Nothing here had ever looked at a response envelope, so the fix was asserted, not
 * verified. The mutation now fails, which is the only evidence that the line is load-bearing.
 *
 * This is the same shape as fixing a catalog and calling the content unreachable: a projector is a
 * claim about the projector, never about what the student receives. The envelope is the delivery
 * surface, so the envelope is what gets scanned.
 *
 * THE LEDGER IS DERIVED, NOT LISTED. Every export of netfinal-exam.js must be classified below, and
 * the assertion compares the ledger against Object.keys() -- so adding an entry point fails this
 * suite until someone decides whether a student can see its output. A hand-maintained list would
 * have gone stale exactly the way the surfaces above went stale. */
section('6. the response envelope, which is the surface the student is actually handed');

/* role 'student'    -> the value reaches the browser; its envelope MUST be clean.
 * role 'instructor' -> deliberately carries identifying data; graded by a human, never shipped.
 * role 'internal'   -> a scalar or a test harness, with no object to disclose. */
const EXAM_SURFACE = {
    startExam: 'student', runCommand: 'student', renderWindow: 'student', runAction: 'student',
    restoreDevice: 'student', saveAnswer: 'student', submitExam: 'student',
    studentReport: 'student', examModeFlags: 'student',
    telemetry: 'instructor',
    memoryStore: 'internal', remainingMs: 'internal', DEFAULT_MINUTES: 'internal'
};

(async function () {
    const EXAM_ID = 'netplus-final-leak';
    let t = 1750000000000;
    const opts = { secret: 'envelope-scan-secret', now: () => t };
    const store = EX.memoryStore();

    /* 6a. the ledger covers the module, by derivation */
    {
        const actual = Object.keys(EX).sort();
        const ledger = Object.keys(EXAM_SURFACE).sort();
        const unclassified = actual.filter(k => !(k in EXAM_SURFACE));
        const vanished = ledger.filter(k => actual.indexOf(k) < 0);
        chk('every netfinal-exam export is classified in the ledger',
            unclassified.length === 0, 'unclassified: ' + JSON.stringify(unclassified));
        chk('the ledger names nothing that no longer exists',
            vanished.length === 0, 'stale ledger entries: ' + JSON.stringify(vanished));
    }

    /* 6b. and the ledger covers what functions/index.js EXPOSES -- the routes that bypass the
     *     module's own idea of its surface. A callable returning an 'instructor' value would be a
     *     leak that scanning the module alone could never see. */
    {
        const idx = require('fs').readFileSync(path.join(NF, '..', 'index.js'), 'utf8');
        const callables = (idx.match(/exports\.netfinal[A-Za-z]+/g) || [])
            .map(x => x.replace('exports.', ''))
            .filter((v, i, a) => a.indexOf(v) === i);
        const invoked = (idx.match(/NETFINAL\.([A-Za-z]+)\(/g) || [])
            .map(x => x.replace('NETFINAL.', '').replace('(', ''))
            .filter((v, i, a) => a.indexOf(v) === i);
        chk('functions/index.js exposes at least the seven exam callables',
            callables.length >= 7, JSON.stringify(callables));
        chk('every EXAM method a callable invokes is ledger-classified',
            invoked.every(m => m in EXAM_SURFACE), JSON.stringify(invoked.filter(m => !(m in EXAM_SURFACE))));
        chk('NO callable returns an instructor-only value to a student',
            invoked.every(m => EXAM_SURFACE[m] !== 'instructor'),
            JSON.stringify(invoked.filter(m => EXAM_SURFACE[m] === 'instructor')));
        /* The submit callable is the one envelope that is NOT a pass-through: submitExam returns the
         * FULL grading report, and index.js must trim it through studentReport before it leaves. If
         * that wrapper is ever dropped, the raw report ships -- so assert the composition itself. */
        chk('the submit callable trims the report through studentReport',
            /report:\s*NETFINAL\.studentReport\(/.test(idx), 'the raw grading report would ship');
        chk('and it does not also ship the untrimmed report',
            !/report:\s*res\.report\b/.test(idx));
    }

    /* 6c. drive a real session and scan every envelope a student receives */
    const started = await EX.startExam(store, { studentId: 'leak-stu', examId: EXAM_ID, minutes: 100 }, opts);
    const sid = started.sessionId;

    chk('the startExam envelope discloses nothing', CL.findDisclosures(started, 'startExam').length === 0,
        JSON.stringify(CL.findDisclosures(started, 'startExam').slice(0, 3)));
    /* Named explicitly as well as swept, because THIS is the field the mutation exposed. */
    chk('no delivered question carries its slot or its proof',
        (started.questions || []).every(q => !('slot' in q) && !('proof' in q)),
        JSON.stringify((started.questions || []).filter(q => 'slot' in q || 'proof' in q).slice(0, 2)));
    chk('the question bank was actually delivered (so the check above could fail)',
        (started.questions || []).length >= 40, 'questions delivered: ' + (started.questions || []).length);
    chk('the examMode flags disclose nothing',
        CL.findDisclosures(EX.examModeFlags(), 'examModeFlags').length === 0);

    for (const w of GUI.WINDOWS || ['noc', 'firewall', 'wireless', 'dhcp', 'dns', 'incident-log', 'questions']) {
        const env = await EX.renderWindow(store, { sessionId: sid, window: w }, opts);
        chk('the renderWindow envelope for ' + w + ' discloses nothing',
            CL.findDisclosures(env, 'renderWindow/' + w).length === 0,
            JSON.stringify(CL.findDisclosures(env, 'renderWindow/' + w).slice(0, 2)));
    }

    for (const line of ['ipconfig', 'arp -a', 'ping 10.20.0.10', 'nslookup intranet.meridiancorp.local',
                        'show vlan brief', 'show interfaces trunk']) {
        const env = await EX.runCommand(store, { sessionId: sid, line }, opts);
        chk('the runCommand envelope for "' + line + '" discloses nothing',
            CL.findDisclosures(env, 'runCommand/' + line).length === 0,
            JSON.stringify(CL.findDisclosures(env, 'runCommand/' + line).slice(0, 2)));
    }

    const act = await EX.runAction(store, { sessionId: sid, window: 'noc', action: 'ack-alert',
        params: { id: 'no-such-alert' } }, opts);
    chk('the runAction envelope discloses nothing', CL.findDisclosures(act, 'runAction').length === 0,
        JSON.stringify(CL.findDisclosures(act, 'runAction').slice(0, 2)));

    const ans = await EX.saveAnswer(store, { sessionId: sid, questionId: 'q46', value: 'smf' }, opts);
    chk('the saveAnswer envelope discloses nothing', CL.findDisclosures(ans, 'saveAnswer').length === 0,
        JSON.stringify(CL.findDisclosures(ans, 'saveAnswer').slice(0, 2)));

    /* A restore is the one action that REVERTS state, so it is the one most likely to echo a
     * before/after pair -- and a diff against the pristine device is the answer key stated twice. */
    const someSwitch = Object.keys((started.state && started.state.devices) || {})
        .filter(d => /SW/i.test(d))[0] || 'MeridianSW-01';
    const rest = await EX.restoreDevice(store, { sessionId: sid, device: someSwitch }, opts);
    chk('the restoreDevice envelope discloses nothing (' + someSwitch + ')',
        CL.findDisclosures(rest, 'restoreDevice').length === 0,
        JSON.stringify(CL.findDisclosures(rest, 'restoreDevice').slice(0, 3)));

    const sub = await EX.submitExam(store, { sessionId: sid }, opts);
    const trimmed = EX.studentReport(sub.report);
    chk('the TRIMMED student report discloses nothing',
        CL.findDisclosures(trimmed, 'studentReport').length === 0,
        JSON.stringify(CL.findDisclosures(trimmed, 'studentReport').slice(0, 3)));
    chk('the trimmed report still reports a score (so the check above is not scanning an empty object)',
        typeof trimmed.total === 'number' && typeof trimmed.outOf === 'number'
        && Array.isArray(trimmed.questions) && trimmed.questions.length > 0,
        JSON.stringify(Object.keys(trimmed)));
    /* The CONTROL: the untrimmed report SHOULD disclose, which is why index.js must not ship it.
     * If this ever passes clean, either the report stopped carrying the key or the detector broke --
     * and both make every assertion above meaningless. */
    chk('and the UNTRIMMED report does disclose, which is why it is trimmed',
        CL.findDisclosures(sub.report, 'rawReport').length > 0,
        'the raw grading report scanned clean -- check the detector, not the report');

    console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
    process.exit(fail ? 1 : 0);
})().catch(e => {
    console.error('\n  leak suite could not run:', e && e.stack ? e.stack : e);
    process.exit(2);
});
