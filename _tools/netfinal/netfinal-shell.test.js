#!/usr/bin/env node
/**
 * netfinal-shell.test.js — stage 4 of the Network+ Meridian Corp final exam.
 *
 * @catalog what    Drives the terminal: prefix matching, context stack, privileged modes, the
 * @catalog what    editor and service-reload semantics, golden output before/after each fix, and
 * @catalog what    a full repair of every shell-fixable fault TYPED AS COMMANDS.
 * @catalog run     node _tools/netfinal/netfinal-shell.test.js
 * @catalog status  TOOL
 *
 * THE CRITERION THIS STAGE EXISTS TO SATISFY, from spec section 11:
 *   "Every command in the section 5 table returns output that changes when the relevant state
 *    changes (golden-output tests before and after each fix)."
 *   "tracert from ADMIN-WS01 stops at the hop named in reach().failedAt for every path-breaking
 *    variant."
 * And stage 3's criterion (a) -- "at least one listed evidence command shows the fault in its
 * output" -- which was structural until the parser existed and is now behavioural.
 *
 * THE LOAD-BEARING TEST IS SECTION 5: every fault is repaired by TYPING, through the same parser a
 * student uses, and then fixed() is consulted. A fix proven only by mutating state directly proves
 * the grader works, not the exam. Five variants are deliberately NOT repairable here: MER-FW01 and
 * MER-WLC01 are web-access devices in spec section 3, so S6B, S7A, S7B, S11A and S11B belong to
 * stage 5's GUI windows. That boundary is asserted rather than assumed, so stage 5 inherits a list.
 */
const path = require('path');
const NF = path.resolve(__dirname, '../../functions/netfinal');
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const SH = require(path.join(NF, 'netfinal-shell.js'));
const TOPO = require(path.join(NF, 'netfinal-topology.js'));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + String(detail).slice(0, 300) : '')); }
};
const section = (t) => console.log('\n' + t);
const EXAM = 'net-final-2026';
const ALL = [];
TOPO.FAULT_SLOTS.forEach(s => Object.keys(s.variants).forEach(v => ALL.push(s.slot + v)));

/* A lab with exactly one variant active, matching the stage-3 harness. */
function labWith(id, seed) {
    const st = CORE.generate(seed || ('sh-' + id), EXAM);
    const slot = id.slice(0, -1), variant = id.slice(-1);
    const meta = TOPO.FAULT_SLOTS.filter(s => s.slot === slot)[0].variants[variant];
    const rng = CORE.makeRng((seed || ('sh-' + id)) + '|force|' + id);
    st.faults = [{ slot, variant, id, active: true, applied: false, layer: meta.layer, group: meta.group,
                   target: CORE.pickFaultTarget(st, rng, slot, variant) }];
    if (slot === 'S4') { st.rogue.variant = variant; st.rogue.mode = variant === 'B' ? 'duplicate-address' : 'arp-spoof'; }
    return st;
}
/* Type a list of lines and return everything printed. */
function typeAll(st, lines, session) {
    let ses = session || SH.newSession();
    const out = [];
    lines.forEach(l => { const r = SH.exec(st, ses, l); ses = r.session; out.push(r.out); });
    return { out: out.join('\n'), session: ses };
}

/* ─── 1. prefix matching and interface normalisation ──────────────────────────────────────────── */
section('1. the IOS parser: shortest unambiguous prefix, and one interface spelling');
{
    const st = labWith('S1A');
    const go = (lines) => typeAll(st, lines).out;
    chk('a full command works', /Mac Address Table/.test(go(['ssh admin@' + st.devices['MeridianSW-01'].mgmtIp, 'enable', 'show mac address-table'])));
    chk('an abbreviated command works', /Mac Address Table/.test(go(['ssh admin@' + st.devices['MeridianSW-01'].mgmtIp, 'enable', 'sh mac add'])));
    chk('`sh ip int br` resolves to show ip interface brief',
        /IP-Address/.test(go(['ssh admin@' + st.devices['MeridianRTR-01'].mgmtIp, 'enable', 'sh ip int br'])));
    /* Ambiguity must be REPORTED, not guessed. `sh ip` has interface, route and arp under it. */
    chk('an ambiguous prefix is refused, not guessed',
        /Incomplete command|Ambiguous/.test(go(['ssh admin@' + st.devices['MeridianRTR-01'].mgmtIp, 'enable', 'sh ip'])));
    chk('a nonsense command is refused',
        /Invalid input/.test(go(['ssh admin@' + st.devices['MeridianSW-01'].mgmtIp, 'enable', 'show bananas'])));
    /* A TRULY ambiguous prefix. `sh ip` is merely incomplete -- "ip" matches one keyword. `sh i`
     * matches both `interfaces` and `ip`, which is the case that exercises the ambiguity branch.
     * Mutation proved the point: making the parser silently take the first match left the suite
     * green, because nothing had ever handed it two candidates. */
    const amb = go(['ssh admin@' + st.devices['MeridianRTR-01'].mgmtIp, 'enable', 'sh i']);
    chk('a genuinely ambiguous prefix is reported as ambiguous', /Ambiguous command/.test(amb), amb);
    chk('and the ambiguity names the candidates it could not choose between',
        /interfaces/.test(amb) && /ip/.test(amb), amb);
    ['Fa0/7', 'FastEthernet0/7', 'fa 0/7', 'fa0/7', 'FA 0/7'].forEach(f => {
        chk('interface spelling "' + f + '" normalises to Fa0/7', SH.normIface(f) === 'Fa0/7', SH.normIface(f));
    });
    chk('GigabitEthernet0/1 and gi0/1 agree', SH.normIface('GigabitEthernet0/1') === SH.normIface('gi0/1'));
    /* Through the PARSER, not just the helper. Normalisation that works in a unit call and not in
     * a command is normalisation that does not work -- and the helper's fallback branch survived
     * mutation precisely because no command had ever exercised an unusual spelling. */
    {
        const swIp = st.devices['MeridianSW-01'].mgmtIp;
        const a = go(['ssh admin@' + swIp, 'enable', 'show interfaces Fa0/9']);
        const b = go(['ssh admin@' + swIp, 'enable', 'show interfaces FastEthernet0/9']);
        const c = go(['ssh admin@' + swIp, 'enable', 'show interfaces fa 0/9']);
        chk('three spellings of the same interface give identical command output',
            a === b && b === c && /Fa0\/9 is/.test(a), [a, b, c].map(x => x.split('\n')[0]).join(' | '));
        chk('configuring by an odd spelling reaches the same port', (() => {
            const t = labWith('S1A', 'ifnorm');
            typeAll(t, ['ssh admin@' + t.devices['MeridianSW-01'].mgmtIp, 'enable', 'conf t',
                        'interface fastethernet 0/9', 'shutdown', 'end']);
            return t.ports['MeridianSW-01']['Fa0/9'].shutdown === true;
        })());
    }
}

/* ─── 2. the context stack ────────────────────────────────────────────────────────────────────── */
section('2. contexts: ssh pushes, exit pops, and modes gate what runs');
{
    const st = labWith('S1A');
    let ses = SH.newSession();
    chk('the session starts on the workstation', SH._i.top(ses).device === 'ADMIN-WS01');
    chk('the Windows prompt looks like Windows', /^C:\\/.test(SH.prompt(st, ses)));

    let r = SH.exec(st, ses, 'ssh admin@' + st.devices['MeridianSW-02'].mgmtIp); ses = r.session;
    chk('ssh pushed a device context', SH._i.top(ses).device === 'MeridianSW-02');
    chk('an IOS session starts in user exec', SH._i.top(ses).mode === 'user');
    chk('the prompt shows user exec', SH.prompt(st, ses) === 'MeridianSW-02> ');

    /* Privileged commands must be refused in user exec, or the mode model is decoration. */
    r = SH.exec(st, ses, 'show running-config'); ses = r.session;
    chk('a privileged command is refused in user exec', /Invalid input/.test(r.out), r.out);
    r = SH.exec(st, ses, 'enable'); ses = r.session;
    chk('enable reaches privileged exec', SH._i.top(ses).mode === 'enable' && SH.prompt(st, ses) === 'MeridianSW-02# ');
    r = SH.exec(st, ses, 'conf t'); ses = r.session;
    chk('conf t reaches global config', SH._i.top(ses).mode === 'config');
    r = SH.exec(st, ses, 'interface Fa0/1'); ses = r.session;
    chk('interface reaches interface config', SH._i.top(ses).mode === 'config-if' && SH._i.top(ses).iface === 'Fa0/1');
    r = SH.exec(st, ses, 'exit'); ses = r.session;
    chk('exit from interface config lands in global config, not a logout',
        SH._i.top(ses).mode === 'config' && ses.stack.length === 2);
    r = SH.exec(st, ses, 'end'); ses = r.session;
    chk('end returns to privileged exec', SH._i.top(ses).mode === 'enable');
    r = SH.exec(st, ses, 'exit'); ses = r.session;
    chk('exit from privileged exec pops the device', ses.stack.length === 1 && SH._i.top(ses).device === 'ADMIN-WS01');
    chk('an invalid interface is refused',
        /Invalid interface/.test(typeAll(st, ['ssh admin@' + st.devices['MeridianSW-02'].mgmtIp, 'enable', 'conf t', 'interface Fa9/99']).out));
    chk('write memory is accepted but not required',
        /OK/.test(typeAll(st, ['ssh admin@' + st.devices['MeridianSW-02'].mgmtIp, 'enable', 'write memory']).out));
}

/* ─── 3. ssh timeouts come from reach() ───────────────────────────────────────────────────────── */
section('3. an ssh attempt to an unreachable address times out, computed by reach()');
{
    const st = labWith('S1A');
    const sub30 = st.subnets[30].cidr.split('/')[0].replace(/\.0$/, '');
    chk('ssh to an address nothing answers at fails',
        /No route to host|timed out/.test(typeAll(st, ['ssh admin@' + sub30 + '.99']).out));
    /* Sever the path and the shell goes with it, which is why an invariant protects it. */
    const broken = JSON.parse(JSON.stringify(st));
    broken.ports['MeridianSW-01']['Gi0/1'].up = false;
    const o = typeAll(broken, ['ssh admin@' + broken.devices['MeridianSW-02'].mgmtIp]).out;
    chk('ssh across a dead trunk times out and names the layer', /timed out/.test(o) && /L1/.test(o), o);
    chk('and the session did NOT push a context on failure',
        typeAll(broken, ['ssh admin@' + broken.devices['MeridianSW-02'].mgmtIp]).session.stack.length === 1);
}

/* ─── 4. golden output, and stage 3's criterion (a) ───────────────────────────────────────────── */
section('4. every variant visibly changes the output of a command a student would run');
{
    /* The evidence commands per variant, as a student would type them. Each pair is (device, line).
     * This is the behavioural half of criterion (a): the OUTPUT must differ between a healthy lab
     * and a faulted one, which is strictly stronger than "the evidence field is non-empty". */
    const EV = {
        S1A: ['MeridianSW-02', 'show interfaces {port} counters errors'],
        S1B: ['MeridianSW-02', 'show interfaces {port} counters errors'],
        S2A: ['MeridianSW-01', 'show vlan brief'],
        S2B: ['{sw}', 'show vlan brief'],
        S3A: ['MeridianSW-01', 'show interfaces trunk'],
        S3B: ['MeridianSW-01', 'show interfaces trunk'],
        S4A: ['ADMIN-WS01', 'arp -a'],
        S4B: ['MeridianRTR-01', 'show ip arp'],
        /* The MASK, which `show ip interface brief` does not print -- addresses only. The running
         * config is the only surface where a /25 is visible, which is what the spec names. */
        S5A: ['MeridianRTR-01', 'show running-config interface Gi0/0.40'],
        S5B: ['MeridianRTR-01', 'show ip interface brief'],
        S6A: ['MeridianRTR-01', 'show ip route'],
        /* Sourced from Engineering. A trace from ADMIN-WS01 is in SALES, and S6B's own ticket says
         * Sales still works -- so tracing from the workstation proves nothing about it. */
        S6B: ['MeridianRTR-01', 'ping 10.200.0.25 source Gi0/0.20'],
        S7A: ['MeridianRTR-01', 'ping 8.8.8.8 source Gi0/0.20'],
        S7B: null,          // the firewall's port-forward list is web-only: stage 5
        S8A: ['MeridianRTR-01', 'show access-lists'],
        S8B: ['MeridianRTR-01', 'show access-lists'],
        S9A: ['MER-SRV01', 'journalctl -u kea-dhcp4-server'],
        /* The Kea config, not `ipconfig` on the workstation: ADMIN-WS01 now holds a reservation
         * with its own routers option, so it is deliberately immune to this fault.
         *
         * WORTH RAISING WITH THE EXAM AUTHOR: the spec lists "ipconfig /all on a Sales PC" as S9B
         * evidence, but no Sales PC is an accessible device in section 3's access table -- only
         * ADMIN-WS01 is, and it is the one host the fault must not touch. The reachable evidence is
         * the server's own config. */
        S9B: ['MER-SRV01', 'grep routers /etc/kea/kea-dhcp4.conf'],
        S10A: ['ADMIN-WS01', 'nslookup intranet.meridian.local'],
        S10B: ['ADMIN-WS01', 'nslookup wiki.meridian.local'],
        S11A: ['MER-SRV01', 'cat /var/lib/kea/kea-leases4.csv'],
        S11B: null,         // the WLC's AP list is web-only: stage 5
        S12A: ['MeridianSW-02', 'show snmp community'],
        S12B: ['MeridianSW-02', 'show ntp status']
    };
    const runOn = (st, device, line) => {
        if (device === 'ADMIN-WS01') { return typeAll(st, [line]).out; }
        const ip = st.devices[device] ? st.devices[device].mgmtIp : null;
        if (!ip) { return '(no such device)'; }
        const pre = ['ssh admin@' + ip];
        if (/^ios/.test(st.devices[device].platform)) { pre.push('enable'); }
        return typeAll(st, pre.concat([line])).out;
    };
    /* The two variants whose evidence lives only behind a web UI. Named explicitly so stage 5
     * inherits a checklist rather than a surprise, and so "24 covered" never quietly means 22.
     * MER-FW01 and MER-WLC01 are web-access devices in spec section 3: there is no shell to type
     * into, and pretending otherwise would be the unearned kind of pass. */
    const GUI_ONLY = ALL.filter(id => EV[id] === null);
    chk('exactly two variants have no shell evidence, both on web-access devices',
        GUI_ONLY.length === 2 && GUI_ONLY.indexOf('S7B') >= 0 && GUI_ONLY.indexOf('S11B') >= 0,
        GUI_ONLY.join(','));
    chk('and every other variant has a shell command declared',
        ALL.filter(id => EV[id] === undefined).length === 0,
        ALL.filter(id => EV[id] === undefined).join(','));

    ALL.filter(id => EV[id]).forEach(id => {
        const spec = EV[id];
        const healthy = labWith(id);
        const faulted = labWith(id);
        FAULTS.applyAll(faulted);
        const f = faulted.faults[0];
        const resolve = (line, st) => line
            .replace('{port}', f.target && f.target.port ? f.target.port : 'Fa0/1')
            .replace('{sw}', f.target && f.target.switch ? f.target.switch : 'MeridianSW-01');
        const dev = spec[0] === '{sw}' ? (f.target && f.target.switch) || 'MeridianSW-01' : spec[0];
        const a = runOn(healthy, dev, resolve(spec[1], healthy));
        const b = runOn(faulted, dev, resolve(spec[1], faulted));
        chk(id + ': ' + spec[1].slice(0, 42) + ' output differs once the fault is applied',
            a !== b && b.length > 0, 'healthy and faulted output identical');
    });
}

/* ─── 5. tracert stops where reach() says ─────────────────────────────────────────────────────── */
section('5. tracert from ADMIN-WS01 stops at the hop reach() names');
{
    /* Every variant that actually breaks a path from the workstation. The others break something a
     * trace does not traverse (duplex, a community string, a lease option), and claiming a trace
     * would reveal them would be false. */
    const PATHS = {
        S2A: 'reservation', S2B: 'victim', S3A: 'floor2eng', S3B: 'floor2sales',
        S5A: 'kiosk', S5B: 'eng', S6A: 'branch', S6B: 'engbranch',
        S7A: 'enginternet', S8B: 'smb', S9A: 'stranded', S9B: 'victim', S10A: 'intranet'
    };
    Object.keys(PATHS).forEach(id => {
        const st = labWith(id);
        FAULTS.applyAll(st);
        const f = st.faults[0];
        let src = 'ADMIN-WS01', dst = null, opts = { proto: 'icmp' };
        const sub = (v) => st.subnets[v].cidr.split('/')[0].replace(/\.0$/, '');
        const epi = (n) => (st.endpoints.filter(e => e.name === n)[0] || {}).ip;
        if (id === 'S2A') { dst = st.dhcp.reservations.filter(r => r.host === 'PRN-SALES01')[0].ip; }
        else if (id === 'S2B' || id === 'S9B') { src = f.target && f.target.host ? f.target.host : 'SALES-PC01'; dst = sub(30) + '.20'; if (id === 'S9B') { src = 'SALES-PC01'; } }
        else if (id === 'S3A') { src = 'ENG-PC05'; dst = sub(30) + '.20'; }
        else if (id === 'S3B') { src = 'SALES-PC04'; dst = sub(30) + '.20'; }
        else if (id === 'S5A') { src = f.target.host; dst = '8.8.8.8'; }
        else if (id === 'S5B') { src = 'ENG-PC01'; dst = '8.8.8.8'; }
        else if (id === 'S6A') { dst = '10.200.0.25'; }
        else if (id === 'S6B') { src = 'ENG-PC01'; dst = '10.200.0.25'; }
        else if (id === 'S7A') { src = 'ENG-PC01'; dst = '8.8.8.8'; }
        else if (id === 'S8B') { dst = sub(30) + '.20'; opts = { proto: 'tcp', port: 445 }; }
        else if (id === 'S9A') {
            const stranded = st.endpoints.filter(e => e.dhcp && /^169\.254\./.test(e.ip))[0];
            if (!stranded) { chk(id + ': a host is stranded to trace from', false, 'none stranded'); return; }
            src = stranded.name; dst = sub(30) + '.20';
        }
        else if (id === 'S10A') { dst = 'intranet.meridian.local'; }

        const r = CORE.reach(st, src, dst, opts);
        const txt = SH._i.renderTrace(st, src, dst, opts);
        if (r.ok) {
            chk(id + ': path is open, so the trace completes', /Trace complete/.test(txt), txt.slice(0, 120));
            return;
        }
        chk(id + ': the trace stops at the device reach() blames (' + r.failedAt.device + ')',
            txt.indexOf('Trace stopped at ' + r.failedAt.device) >= 0, txt.slice(-200));
        chk(id + ': and it prints the layer and reason reach() gave',
            txt.indexOf('layer ' + r.failedAt.layer) >= 0 && txt.indexOf(r.failedAt.reason) >= 0, txt.slice(-200));
    });
}

/* ─── 6. every shell-fixable fault, REPAIRED BY TYPING ────────────────────────────────────────── */
section('6. each fault repaired through the parser a student uses, then fixed() consulted');
{
    /* THIS IS THE TEST THAT MATTERS. Stage 3 proved the graders work by mutating state directly;
     * that proves the answer key, not the exam. Here the repair is typed, so a fix that is correct
     * on paper but unreachable through the command set fails -- which is exactly how a student
     * would discover it, in an exam, with no recourse. */
    const sub = (st, v) => st.subnets[v].cidr.split('/')[0].replace(/\.0$/, '');
    const mgmt = (st, d) => st.devices[d].mgmtIp;

    const REPAIRS = {
        S1A: (st, f) => ['ssh admin@' + mgmt(st, f.target.switch), 'enable', 'conf t',
                         'interface ' + f.target.port, 'duplex auto', 'end'],
        S2A: (st, f) => ['ssh admin@' + mgmt(st, f.target.switch), 'enable', 'conf t',
                         'interface ' + f.target.port, 'switchport access vlan 10', 'end'],
        S2B: (st, f) => ['ssh admin@' + mgmt(st, f.target.switch), 'enable', 'conf t',
                         'interface ' + f.target.port, 'switchport access vlan 10', 'end'],
        /* BOTH ENDS of the trunk, because the fix is per-interface and one end is not enough. */
        S3A: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-01'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 20', 'end', 'exit',
                      'ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 20', 'end'],
        S3B: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-01'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 10', 'end', 'exit',
                      'ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 10', 'end'],
        S4A: (st) => ['ssh admin@' + mgmt(st, st.rogue.switch), 'enable', 'conf t',
                      'interface ' + st.rogue.port, 'shutdown', 'end'],
        S4B: (st) => ['ssh admin@' + mgmt(st, st.rogue.switch), 'enable', 'conf t',
                      'interface ' + st.rogue.port, 'shutdown', 'end'],
        S5A: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t', 'interface Gi0/0.40',
                      'ip address ' + st.subnets[40].gateway + ' 255.255.255.0', 'end'],
        S5B: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t', 'interface Gi0/0.20',
                      'ip address ' + st.subnets[20].gateway + ' 255.255.255.0', 'end'],
        S6A: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t',
                      'no ip route 10.200.0.0 255.255.255.0 172.16.0.6',
                      'ip route 10.200.0.0 255.255.255.0 172.16.0.2', 'end'],
        /* Reordering by renumbering, which is how it is done on real kit. */
        S8A: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t',
                      'ip access-list extended GUEST-IN', 'no 10', 'no 20',
                      '10 deny ip ' + st.subnets[40].cidr + ' 10.' + st.params.b + '.0.0/16',
                      '20 permit ip any any', 'end'],
        S8B: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t',
                      'ip access-list extended SERVERS-OUT', 'no 5', 'end'],
        /* Linux: edit, validate, restart. The restart is REQUIRED -- a saved file the service has
         * not re-read changes nothing, which is the spec's own rule about services and configs. */
        S9A: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/kea/kea-dhcp4.conf',
                      ':%s/' + st.dhcp.subnets[10].pool.end + '/' + sub(st, 10) + '.199/', ':wq',
                      'sudo kea-dhcp4 -t /etc/kea/kea-dhcp4.conf',
                      'sudo systemctl restart kea-dhcp4-server'],
        S9B: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/kea/kea-dhcp4.conf',
                      ':%s/' + sub(st, 10) + '.254/' + st.subnets[10].gateway + '/', ':wq',
                      'sudo systemctl restart kea-dhcp4-server'],
        S10A: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/bind/db.meridian.local',
                       ':%s/' + sub(st, 30) + '.21/' + sub(st, 30) + '.20/',
                       ':%s/' + st.dns.zoneFile.serial + '/' + (st.dns.zoneFile.serial + 1) + '/', ':wq',
                       'sudo named-checkzone meridian.local /etc/bind/db.meridian.local',
                       'sudo rndc reload'],
        S10B: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/bind/db.meridian.local',
                       ':%s/' + st.dns.zoneFile.serial + '/' + (st.dns.zoneFile.serial + 1) + '/', ':wq',
                       'sudo rndc reload'],
        S12A: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t',
                       'snmp-server community ' + st.monitoring.community, 'end'],
        S12B: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t',
                       'ntp server ' + mgmt(st, 'MER-SRV01'), 'end']
    };

    /* The six whose fix surface is a web UI or the rack view, named so stage 5 inherits the list. */
    const STAGE5 = ['S1B', 'S6B', 'S7A', 'S7B', 'S11A', 'S11B'];
    chk('exactly six variants are fixed outside the terminal (stage 5)',
        STAGE5.length === 6 && STAGE5.every(id => !REPAIRS[id]), STAGE5.join(','));
    chk('every other variant has a typed repair',
        ALL.filter(id => STAGE5.indexOf(id) < 0).every(id => !!REPAIRS[id]),
        ALL.filter(id => STAGE5.indexOf(id) < 0 && !REPAIRS[id]).join(','));
    chk('the two lists together account for all 24',
        Object.keys(REPAIRS).length + STAGE5.length === 24,
        Object.keys(REPAIRS).length + ' typed + ' + STAGE5.length + ' GUI');

    Object.keys(REPAIRS).forEach(id => {
        const st = labWith(id, 'fix-' + id);
        FAULTS.applyAll(st);
        const f = st.faults[0];
        chk(id + ': broken before the repair is typed', FAULTS.fixedMap(st)[id] === false);
        const lines = REPAIRS[id](st, f);
        const res = typeAll(st, lines);
        /* No command in a correct repair may be rejected. A silent rejection would let a variant
         * "pass" because the state happened to be fine for another reason. */
        chk(id + ': no command in the repair was rejected',
            !/Invalid input|Incomplete command|not recognized|command not found|rejected|Pattern not found/.test(res.out),
            res.out.split('\n').filter(l => /Invalid|Incomplete|rejected|not found|not recognized/.test(l)).join(' | '));
        chk(id + ': fixed() is true after typing the repair', FAULTS.fixedMap(st)[id] === true,
            res.out.slice(-200));
        const inv = FAULTS.collateralDamage(st);
        chk(id + ': and the typed repair caused no collateral damage', inv.length === 0,
            JSON.stringify(inv.map(x => x.id + ': ' + x.detail)));
    });
}

/* ─── 6b. a wrong fix typed at the terminal is still wrong ────────────────────────────────────── */
section('6b. the terminal does not launder a wrong answer');
{
    /* Typing the right COMMAND with the wrong ARGUMENT must not satisfy the grader. Mutation showed
     * `ntp server` reporting synchronised whatever address it was given, which no test caught
     * because every typed repair pointed at the server that actually answers. */
    const st = labWith('S12B', 'wrongtype');
    FAULTS.applyAll(st);
    const sw = st.devices['MeridianSW-02'].mgmtIp;
    typeAll(st, ['ssh admin@' + sw, 'enable', 'conf t',
                 'ntp server ' + TOPO.DECOY_DIAGRAM.dnsServer, 'end']);
    chk('S12B: pointing NTP at the decommissioned server does not synchronise',
        st.devices['MeridianSW-02'].ntp.synchronized === false,
        JSON.stringify(st.devices['MeridianSW-02'].ntp));
    chk('S12B: so it is not fixed', FAULTS.fixedMap(st).S12B === false);
    chk('S12B: and show ntp status says unsynchronized',
        /unsynchronized/.test(typeAll(st, ['ssh admin@' + sw, 'enable', 'show ntp status']).out));
    typeAll(st, ['ssh admin@' + sw, 'enable', 'conf t',
                 'ntp server ' + st.devices['MER-SRV01'].mgmtIp, 'end']);
    chk('S12B: pointing it at the real server does synchronise and fix it',
        FAULTS.fixedMap(st).S12B === true);

    /* The same shape for S9A: a pool widened past what the config may contain must be refused by
     * the validator the spec tells students to run, not discovered after a restart. */
    const k = labWith('S9A', 'wrongpool');
    FAULTS.applyAll(k);
    const srv = k.devices['MER-SRV01'].mgmtIp;
    const s10 = k.subnets[10].cidr.split('/')[0].replace(/\.0$/, '');
    const r = typeAll(k, ['ssh admin@' + srv, 'sudo vi /etc/kea/kea-dhcp4.conf',
                          ':%s/' + k.dhcp.subnets[10].pool.start + ' - ' + k.dhcp.subnets[10].pool.end
                            + '/' + s10 + '.1 - ' + s10 + '.254/', ':wq',
                          'sudo kea-dhcp4 -t /etc/kea/kea-dhcp4.conf']);
    chk('S9A: the validator refuses a pool that would hand out the gateway',
        /configuration error/.test(r.out) && /gateway/.test(r.out), r.out.slice(-220));
    chk('S9A: and the running config is untouched by a config that failed validation',
        k.dhcp.subnets[10].pool.start === s10 + '.100');
}

/* ─── 7. a service does not use a changed file until it is reloaded ───────────────────────────── */
section('7. editing a config is not applying it');
{
    /* Spec section 5: "A service does not use a changed file until it is reloaded or restarted."
     * This is the same rule S10B teaches, and it has to hold for Kea too or the lesson is only
     * true in one place. */
    const st = labWith('S9B', 'reload-1');
    FAULTS.applyAll(st);
    const sub10 = st.subnets[10].cidr.split('/')[0].replace(/\.0$/, '');
    let ses = typeAll(st, ['ssh admin@' + st.devices['MER-SRV01'].mgmtIp]).session;
    const r1 = typeAll(st, ['sudo vi /etc/kea/kea-dhcp4.conf',
                            ':%s/' + sub10 + '.254/' + st.subnets[10].gateway + '/', ':wq'], ses);
    ses = r1.session;
    chk('saving reports what it understood', /applied:.*routers/.test(r1.out), r1.out.slice(0, 200));
    chk('and warns that the service has not re-read it', /until it is reloaded or restarted/.test(r1.out));
    /* BOTH halves: the file shows the new value and the RUNNING config still shows the old one.
     * Asserting only the first passed while saveFile was writing straight through to live state,
     * which is the bug this section exists to catch. */
    chk('the config ON DISK shows the corrected gateway',
        SH.renderFile(st, 'MER-SRV01', '/etc/kea/kea-dhcp4.conf')
            .indexOf('"data": "' + st.subnets[10].gateway + '"') >= 0,
        SH.renderFile(st, 'MER-SRV01', '/etc/kea/kea-dhcp4.conf').split('\n').filter(l => /routers/.test(l)).join(' | '));
    chk('while the RUNNING config still has the broken one',
        st.dhcp.subnets[10].routers === sub10 + '.254', st.dhcp.subnets[10].routers);
    chk('and a client still holds the broken gateway',
        (st.endpoints.filter(e => e.name === 'SALES-PC01')[0] || {}).gw === sub10 + '.254');
    chk('systemctl status says the disk config is newer than the running one',
        /NEWER/.test(typeAll(st, ['systemctl status kea-dhcp4-server'], ses).out));
    chk('but the fault is NOT yet fixed, because nothing was restarted',
        FAULTS.fixedMap(st).S9B === false);
    typeAll(st, ['sudo systemctl restart kea-dhcp4-server'], ses);
    chk('restarting applies it', FAULTS.fixedMap(st).S9B === true);

    /* And the DNS half: a zone edit with no serial bump is invisible however often you reload. */
    const z = labWith('S10B', 'reload-2');
    FAULTS.applyAll(z);
    let zs = typeAll(z, ['ssh admin@' + z.devices['MER-SRV01'].mgmtIp]).session;
    chk('the record is on disk', /wiki/.test(SH.renderFile(z, 'MER-SRV01', '/etc/bind/db.meridian.local')));
    chk('but dig cannot see it', /NXDOMAIN/.test(typeAll(z, ['dig wiki.meridian.local'], zs).out));
    typeAll(z, ['sudo rndc reload'], zs);
    chk('reloading WITHOUT a serial bump still cannot see it',
        /NXDOMAIN/.test(typeAll(z, ['dig wiki.meridian.local'], zs).out)
        && FAULTS.fixedMap(z).S10B === false);
    typeAll(z, ['sudo vi /etc/bind/db.meridian.local',
                ':%s/' + z.dns.zoneFile.serial + '/' + (z.dns.zoneFile.serial + 1) + '/', ':wq',
                'sudo rndc reload'], zs);
    chk('bumping the serial and reloading serves it',
        /NOERROR/.test(typeAll(z, ['dig wiki.meridian.local'], zs).out)
        && FAULTS.fixedMap(z).S10B === true);
}

/* ─── A STUDENT-CHOSEN NAME IS STILL A KEY ──────────────────────────────────────────────────────── */
section('an ACL named __proto__, and a file path that is one');
{
    /* Two writes in this file use a key the STUDENT typed: `ip access-list extended <name>` and
     * `vi <path>`. The audit flagged the ACL one as the same shape as the dispatch bug with impact
     * unproven, and it was right to: writing `state.acls[dev]['__proto__'] = {...}` replaces that
     * container's prototype rather than adding a key, which the engine's global pollution sweep
     * cannot see because nothing shared changes.
     *
     * It needed its own test for a duller reason too: reaching the ACL write requires ssh, enable
     * and conf t, so the exam suite's single-line sweep never got near it. A sweep that cannot reach
     * the code it is sweeping is not covering it, and this is the second time in this build a sweep
     * has read clean for that reason. */
    const st = CORE.generate('proto-acl', EXAM, { secret: 's' });
    FAULTS.applyAll(st);
    const dev = 'MeridianRTR-01';
    const mgmtIp = st.devices[dev].mgmtIp;

    const drive = (lines) => {
        let ses = SH.newSession();
        let out = '';
        lines.forEach((l) => { const r = SH.exec(st, ses, l); ses = r.session; out += '\n' + r.out; });
        return out;
    };

    const protoBefore = Object.getPrototypeOf(st.acls[dev]);
    const namesBefore = Object.keys(st.acls[dev]).sort().join(',');

    ['__proto__', 'constructor', 'prototype'].forEach((name) => {
        drive(['ssh admin@' + mgmtIp, 'enable', 'conf t', 'ip access-list extended ' + name, 'end', 'exit']);
    });

    chk('naming an ACL __proto__ does not replace the ACL container’s prototype',
        Object.getPrototypeOf(st.acls[dev]) === protoBefore,
        'the prototype of state.acls[' + dev + '] was changed by a typed ACL name');
    chk('and no unsafe name became an ACL',
        ['__proto__', 'constructor', 'prototype'].every(n => !Object.prototype.hasOwnProperty.call(st.acls[dev], n)),
        JSON.stringify(Object.keys(st.acls[dev])));
    chk('the real ACLs are untouched',
        Object.keys(st.acls[dev]).sort().join(',') === namesBefore,
        namesBefore + ' -> ' + Object.keys(st.acls[dev]).sort().join(','));
    /* THE CONTROL: a legitimate ACL name must still be creatable, or the guard has eaten the feature. */
    drive(['ssh admin@' + mgmtIp, 'enable', 'conf t', 'ip access-list extended TEST-IN', 'end', 'exit']);
    chk('a legitimate ACL name still creates one',
        !!st.acls[dev]['TEST-IN'], JSON.stringify(Object.keys(st.acls[dev])));

    /* THE SAME SHAPE ON THE LINUX SIDE -- `vi <path>` writes a file keyed by the typed path -- but
     * with a difference I checked rather than assumed: a file's VALUE is a string, and
     * `obj['__proto__'] = 'a string'` is a NO-OP in JavaScript. Only an object or null replaces a
     * prototype. So that path was never exploitable, and an assertion about it could never fail --
     * I wrote one, mutated the guard away, and the suite stayed green, which is how I found out.
     *
     * The observable case is `constructor`: assigning to it DOES create an own key that shadows the
     * inherited one. Harmless in effect, but it is the half a test can actually settle, so it is the
     * half asserted. The guard covers all three names regardless, because the next value written
     * through that path might not be a string. */
    const srv = 'MER-SRV01';
    const srvIp = st.devices[srv].mgmtIp;
    const filesProtoBefore = Object.getPrototypeOf(st.devices[srv].files || {});
    /* BARE NAMES, not '/etc/' + name. A real path always contains a slash, so it can never equal a
     * prototype key -- which is why my first version of this assertion could not fail: it wrote
     * '/etc/constructor' and then checked for an own 'constructor' key. The form that reaches the
     * lookup is `vi __proto__` with no directory, and that one THREW: renderFile's `files[path]`
     * resolved to the prototype OBJECT rather than undefined, so the caller took it for file
     * contents and called .split('\n') on it, throwing a TypeError out of the callable. A typed
     * command must never be able to produce a 500. */
    /* Wrapped, so the unguarded-read crash is reported by the assertion below instead of killing the
       suite three lines earlier -- a crash is detection, but it reads as a broken test. */
    let viThrew = null;
    ['__proto__', 'constructor', 'prototype'].forEach((pth) => {
        try {
            drive(['ssh admin@' + srvIp, 'sudo vi ' + pth, ':wq', 'exit']);
            drive(['ssh admin@' + srvIp, 'sudo vi /etc/' + pth, ':wq', 'exit']);
        } catch (e) { viThrew = viThrew || (pth + ': ' + e.message); }
    });
    chk('no prototype-named path threw out of the shell', viThrew === null, String(viThrew));
    chk('opening a file named for a prototype key does not throw', (() => {
        try {
            const out = drive(['ssh admin@' + srvIp, 'sudo vi __proto__', ':wq', 'exit']);
            return typeof out === 'string';
        } catch (e) { return false; }
    })(), 'renderFile returned a non-string and the caller split it');
    chk('an unsafe file path creates no own key on the files container',
        ['__proto__', 'constructor', 'prototype'].every(
            n => !Object.prototype.hasOwnProperty.call(st.devices[srv].files || {}, n)),
        JSON.stringify(Object.keys(st.devices[srv].files || {})));
    chk('a file path of __proto__ does not replace the files container’s prototype',
        Object.getPrototypeOf(st.devices[srv].files || {}) === filesProtoBefore);
    chk('and a real file is still writable',
        (() => {
            drive(['ssh admin@' + srvIp, 'sudo vi /etc/kea/kea-dhcp4.conf', ':wq', 'exit']);
            return !!(st.devices[srv].files && st.devices[srv].files['/etc/kea/kea-dhcp4.conf']);
        })(), JSON.stringify(Object.keys(st.devices[srv].files || {})));
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
