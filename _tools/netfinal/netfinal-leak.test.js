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
}

/* ─── 2. every GUI window and every action return ─────────────────────────────────────────────── */
section('2. all seven windows, and every action result');
{
    GUI.WINDOWS.forEach(w => {
        const hits = CL.findDisclosures(GUI.render(st, w), w);
        chk(w + ': render discloses nothing', hits.length === 0, JSON.stringify(hits));
    });
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

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
