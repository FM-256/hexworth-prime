#!/usr/bin/env node
/**
 * netfinal-repairs.js — the student-reachable repair for every fault variant, in ONE place.
 *
 * @catalog what    The exact commands a student types to fix each of the 18 terminal-fixable fault
 * @catalog what    variants, plus the 6 whose fix surface is a GUI. Shared by the shell suite and
 * @catalog what    the instructor walkthrough generator so the two cannot disagree.
 * @catalog run     require()d, not run directly. See netfinal-walkthrough.js.
 * @catalog status  TOOL
 *
 * WHY THIS IS A MODULE AND NOT A TABLE IN A TEST FILE
 * ---------------------------------------------------
 * These recipes were inside `netfinal-shell.test.js`, which was the right place while they had one
 * consumer. The instructor walkthrough is a second consumer, and a second copy of a repair recipe
 * is a copy that drifts: the suite would keep passing against its own copy while the walkthrough
 * handed a student commands that no longer fix anything. This exam has already produced that exact
 * failure twice in its display logic -- two copies of "what counts as answered" telling a student
 * two different things -- so the second consumer gets a shared module rather than a paste.
 *
 * WHY THESE ARE FUNCTIONS OF STATE
 * --------------------------------
 * The lab is seeded per student: `CORE.generate(studentId, examId, {secret})`. Two students get
 * different fault variants, different addresses, different VLAN numbers, and different DHCP pools.
 * There is therefore no fixed list of commands for this exam, and any document that prints one is
 * wrong for everybody except the student it was generated from. Each recipe takes the live state and
 * the fault, and reads the addresses out of them.
 *
 * WHAT THESE ARE NOT
 * ------------------
 * Not an oracle. `netfinal-faults.js`'s own `correctFix` mutates state directly and says what must
 * be TRUE after a repair; these say what a student TYPES to get there, through the same parser the
 * student uses. The difference is the whole point of the suite section that drives them: a fix that
 * is correct on paper but unreachable through the command set fails here, which is exactly how a
 * student would discover it -- in an exam, with no recourse.
 */
(function () {
    'use strict';

    /* The third octet of a VLAN's subnet, e.g. "10.34.10" for 10.34.10.0/24. The generator varies
       the second octet per student, so this cannot be hardcoded. */
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
           not re-read changes nothing, which is the spec's own rule about services and configs. */
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

    /* The six whose fix surface is a web UI or the rack view, not the terminal. A student reaches
       these through the Firewall, Wireless or Rack tab; the GUI suite drives them through GUI.act.
       Named here so both consumers inherit one list rather than each keeping its own. */
    const GUI_FIXED = ['S1B', 'S6B', 'S7A', 'S7B', 'S11A', 'S11B'];

    /* Where a student goes for each of those six, for the walkthrough's prose. The ACTION names and
       parameters are the engine's own, declared by GUI.actionSchema, so the walkthrough generator
       reads them from the engine rather than repeating them here: this is the surface, not the call. */
    /* GUI_SURFACE is DERIVED, below GUI_REPAIRS: it was a hand-written table, and four of its six
       lines were wrong -- S7A/S7B were labelled with S11's wireless cause and S11A/S11B with a
       firewall rule, so the instructor key printed "Wireless: the SSID is mapped to the wrong VLAN"
       beside a firewall portforward-set on the same line. Karl and Nancy both caught it; no suite
       did, because nothing compared the label to the fault. */
    let GUI_SURFACE = null;

    /* THE SIX GUI-ONLY REPAIRS, as [window, action, params] triples for GUI.act. These lived in
       netfinal-gui.test.js, whose own comment said "one definition, so the two cannot disagree" --
       about its own two sections. The walkthrough is a third consumer, so the definition moves here
       and all three read it. Each entry is a LIST because S11B needs three actions: fixing one
       access point's channel does not resolve an overlap across three. */
    const TOPO = require(require('path').resolve(__dirname, '../../functions/netfinal/netfinal-topology.js'));
    const GUI_REPAIRS = {
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

    /* THE VERIFY TASKS (Q39-Q42), as a student performs them AFTER the fix. Each is graded from the
       event log: the proof must run on the named device after the fault's fix landed, so running it
       early, on the wrong box, or out of order scores zero -- the spec's own rule. Keyed by question
       number; each returns where it runs and what is typed or clicked. Shared by the completability
       QC and the instructor key so the two cannot describe different proofs. `variant` is the slot's
       variant letter in this student's lab. */
    const VERIFY = {
        39: () => ({ device: 'MeridianSW-01', lines: ['show interfaces trunk'],
                     why: 'the restored VLAN is in the allowed list on the trunk' }),
        40: (st, variant) => variant === 'B'
            ? { window: 'firewall', action: 'diag-test-from-wan', params: { port: 443 },
                why: 'Firewall tab > Test a port from the WAN side, port 443: reachable' }
            : { device: 'MeridianRTR-01', lines: ['ping 8.8.8.8 source Gi0/0.20'],
                why: 'a ping sourced from the Engineering sub-interface now succeeds' },
        41: (st, variant) => variant === 'B'
            ? { device: 'MeridianRTR-01', lines: ['show ip arp'],
                why: 'one stable MAC for the file server' }
            : { device: 'ADMIN-WS01', lines: ['arp -d *', 'ping ' + st.subnets[10].gateway, 'arp -a'],
                why: 'clear the cache, ping the gateway, then read the cache: the router MAC, not the rogue' },
        42: (st) => ({ device: 'ADMIN-WS01', lines: ['nslookup intranet.' + st.dns.origin],
                     why: 'the corrected address comes back' })
    };
    /* Each GUI fix's description, built from the ENGINE: the tab is the window its repair action
       actually uses, and the words are the fault's own `expectedFix`. Neither half is typed here,
       so the label cannot disagree with the fault or with the action printed beside it. Built from
       one probe lab because the repair actions read subnets; the window does not vary by lab. */
    const CORE_ = require(require('path').resolve(__dirname, '../../functions/netfinal/netfinal-core.js'));
    const FAULTS_ = require(require('path').resolve(__dirname, '../../functions/netfinal/netfinal-faults.js'));
    const TAB = { rack: 'Rack', firewall: 'Firewall', wireless: 'Wireless', noc: 'NOC' };
    const probe = CORE_.generate('gui-surface-probe', 'net-final-2026', { secret: 'probe-not-a-real-lab' });
    GUI_SURFACE = {};
    GUI_FIXED.forEach((id) => {
        const v = FAULTS_.VARIANTS[id] || {};
        const win = GUI_REPAIRS[id] ? GUI_REPAIRS[id](probe, { target: {} })[0][0] : null;
        /* `{b}` (the student's second octet) is left in; the key substitutes the real one. */
        GUI_SURFACE[id] = (TAB[win] || win || '?') + ' tab: ' + String(v.expectedFix || v.rootCause || '');
    });

    module.exports = { REPAIRS, GUI_REPAIRS, GUI_FIXED, GUI_SURFACE, VERIFY, sub, mgmt };
})();
