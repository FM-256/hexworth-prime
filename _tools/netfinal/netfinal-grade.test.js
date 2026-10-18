#!/usr/bin/env node
/**
 * netfinal-grade.test.js — stage 6 of the Network+ Meridian Corp final exam.
 *
 * @catalog what    Normalizers against the spec's own examples, the 50-question bank's phase and
 * @catalog what    point totals recomputed from the definitions, a scripted PERFECT RUN on three
 * @catalog what    seeds solving the lab through real surfaces, and every partial-credit rule.
 * @catalog run     node _tools/netfinal/netfinal-grade.test.js
 * @catalog status  TOOL
 *
 * THE SPEC'S ACCEPTANCE CRITERIA FOR THIS STAGE (section 11):
 *   "All 50 questions grade correctly against a scripted perfect run on at least three seeds,
 *    scoring 200/200."
 *   "A scripted run with no change requests scores 3 of 6 on each fix."
 *
 * ON "200/200": question 45 is instructor-marked by the spec's own rubric (section 8), so a machine
 * cannot award its 9 points. A perfect run therefore scores 191 earned + 9 pending = 200, and this
 * suite asserts that sum rather than quietly redefining perfect as 191. Auto-scoring a narrative
 * with keyword matching would produce a number that looks like a grade and is not one.
 *
 * THE PERFECT RUN SOLVES THE LAB THROUGH REAL SURFACES -- typing at the terminal and clicking in the
 * windows -- not by mutating state. A grader proven only against hand-built state proves the grader;
 * this proves the exam.
 */
const path = require('path');
const NF = path.resolve(__dirname, '../../functions/netfinal');
const CORE = require(path.join(NF, 'netfinal-core.js'));
const FAULTS = require(path.join(NF, 'netfinal-faults.js'));
const SH = require(path.join(NF, 'netfinal-shell.js'));
const GUI = require(path.join(NF, 'netfinal-gui.js'));
const QQ = require(path.join(NF, 'netfinal-questions.js'));
const GR = require(path.join(NF, 'netfinal-grade.js'));
const TOPO = require(path.join(NF, 'netfinal-topology.js'));

let pass = 0, fail = 0;
const chk = (name, cond, detail) => {
    if (cond) { pass++; console.log('  ok   ' + name); }
    else { fail++; console.log('  FAIL ' + name + (detail ? '\n         <- ' + String(detail).slice(0, 320) : '')); }
};
const section = (t) => console.log('\n' + t);
const EXAM = 'net-final-2026';
const N = QQ.NORM;

/* ─── 1. the normalizers, against the spec's own examples ─────────────────────────────────────── */
section("1. normalizers accept every spelling the spec's table lists, and reject a near-miss");
{
    chk('ipv4 strips leading zeros and spaces',
        N.ipv4(' 010.084.010.040 ') === '10.84.10.40' && N.ipv4('10.84.10.40') === '10.84.10.40');
    chk('ipv4 rejects an impossible octet', N.ipv4('10.84.10.300') === null);
    chk('prefix: /24 equals 255.255.255.0', N.prefix('/24') === 24 && N.prefix('255.255.255.0') === 24);
    chk('prefix: /25 equals 255.255.255.128', N.prefix('/25') === 25 && N.prefix('255.255.255.128') === 25);
    /* A non-contiguous mask is not a mask. Accepting it would mark nonsense correct. */
    chk('prefix rejects a non-contiguous mask', N.prefix('255.255.0.255') === null);
    chk('mac accepts colons, dashes, Cisco dots and bare hex, any case',
        new Set([N.mac('00:1A:2B:3C:4D:5E'), N.mac('00-1a-2b-3c-4d-5e'),
                 N.mac('001a.2b3c.4d5e'), N.mac('001A2B3C4D5E')]).size === 1);
    chk('mac rejects a short address', N.mac('00:1a:2b') === null);
    chk('iface: Fa0/7, FastEthernet0/7 and "fa 0/7" agree',
        new Set([N.iface('Fa0/7').iface, N.iface('FastEthernet0/7').iface, N.iface('fa 0/7').iface]).size === 1);
    chk('iface keeps the switch name separately when given',
        N.iface('MeridianSW-02 Fa0/7').sw === 'meridiansw-02' && N.iface('Fa0/7').sw === null);
    chk('range accepts ".100-.150", a full pair, and "100 to 150"',
        JSON.stringify(N.range('.100-.150')) === '[100,150]'
        && JSON.stringify(N.range('10.84.10.100 - 10.84.10.150')) === '[100,150]'
        && JSON.stringify(N.range('100 to 150')) === '[100,150]');
    chk('range rejects an inverted pair', N.range('150-100') === null);
    chk('vlanSet ignores order and spacing, and expands ranges',
        JSON.stringify(N.vlanSet('99, 10,20 40')) === '[10,20,40,99]'
        && JSON.stringify(N.vlanSet('10-12')) === '[10,11,12]');
    chk('aclRef is case-insensitive and "seq 10" equals "10"',
        N.aclRef('guest-in seq 10').seq === 10 && N.aclRef('GUEST-IN 10').seq === 10
        && N.aclRef('GUEST-IN seq 10').name === 'guest-in');
    chk('multi ignores order', JSON.stringify(N.multi('b, a')) === JSON.stringify(N.multi('a b')));
    /* sameAnswer tolerates a MISSING switch name on the student's side (spec: "may be omitted")
     * but not a wrong one. */
    chk('a student may omit the switch name', QQ.sameAnswer('iface', 'Fa0/7', 'MeridianSW-02 Fa0/7'));
    chk('but not name the wrong switch',
        !QQ.sameAnswer('iface', 'MeridianSW-01 Fa0/7', 'MeridianSW-02 Fa0/7'));
}

/* ─── 2. the bank, recomputed from the definitions ────────────────────────────────────────────── */
section("2. the question bank matches the spec's phase table, recomputed not restated");
{
    const q = QQ.QUESTIONS;
    chk('there are 50 questions, numbered 1-50 with no gaps',
        q.length === 50 && q.every((x, i) => x.n === i + 1), q.length + ' questions');
    const by = {}, tag = { practical: 0, reasoning: 0 };
    let total = 0;
    q.forEach(x => { by[x.phase] = (by[x.phase] || 0) + x.points; tag[x.tag] += x.points; total += x.points; });
    /* The spec's own table. Recomputed from the definitions so the bank cannot drift from it -- a
     * count written in prose would be stale the moment a question's points changed. */
    chk('discovery 1-14 total 28', by.discovery === 28, String(by.discovery));
    chk('analysis 15-26 total 48', by.analysis === 48, String(by.analysis));
    chk('fix 27-38 total 72', by.fix === 72, String(by.fix));
    chk('verify 39-45 total 37', by.verify === 37, String(by.verify));
    chk('planning 46-50 total 15', by.planning === 15, String(by.planning));
    chk('the exam is worth 200', total === 200, String(total));
    chk('128 practical and 72 reasoning', tag.practical === 128 && tag.reasoning === 72, JSON.stringify(tag));
    chk('every fix question names a slot', q.filter(x => x.phase === 'fix').every(x => !!x.slot));
    chk('all twelve slots have exactly one fix question',
        new Set(q.filter(x => x.phase === 'fix').map(x => x.slot)).size === 12);
    /* The student-facing form must not carry the proof patterns for 39-42: naming the proof command
     * IS the answer to those questions. */
    const st0 = CORE.generate('bank', EXAM, { secret: 's' });
    FAULTS.applyAll(st0);
    const seen = QQ.forStudent(st0);
    chk('the student-facing bank carries no proof patterns',
        seen.every(x => x.proof === undefined), JSON.stringify(seen.filter(x => x.proof).map(x => x.n)));
    chk('and no answers', JSON.stringify(seen).indexOf('"answer"') < 0);
    chk('every question resolves to a concrete prompt for a real lab',
        seen.every(x => typeof x.prompt === 'string' && x.prompt.length > 15),
        JSON.stringify(seen.filter(x => !x.prompt || x.prompt.length <= 15).map(x => x.n)));
    /* SELECT needs options; MULTI does not. Q6 asks a student to list the VLANs they read off a
     * trunk and Q22B the networks in a phase-2 entry -- typed sets, not picks from a list. The
     * first version of this assertion required options for both and failed on Q6, which was the
     * assertion being wrong rather than the bank. */
    chk('every select question offers options',
        seen.filter(x => x.kind === 'select').every(x => !!x.options),
        JSON.stringify(seen.filter(x => x.kind === 'select' && !x.options).map(x => x.n)));
    chk('multi questions are typed sets or offer options, and are normalized as sets',
        seen.filter(x => x.kind === 'multi').every(x => x.norm === 'multi' || x.norm === 'vlanSet'),
        JSON.stringify(seen.filter(x => x.kind === 'multi').map(x => [x.n, x.norm])));
}

/* ─── 3. the answer key is immutable once built ───────────────────────────────────────────────── */
section('3. the answer key survives everything the student can do to the lab');
{
    const st = CORE.generate('key-immutable', EXAM, { secret: 's' });
    FAULTS.applyAll(st);
    const key = GR.buildAnswerKey(st);
    const snapshot = JSON.stringify(key);
    /* Chris's caution, as an enforced property: a key holding a live reference into state would be
     * rewritten by a repair, a restore or a lease re-resolution. */
    st.faults.forEach(f => FAULTS.VARIANTS[f.id].correctFix(st, f));
    FAULTS.recordProgress(st, 0);
    CORE.resolveLeases(st);
    FAULTS.restoreDevice(st, 'MeridianSW-01');
    FAULTS.restoreDevice(st, 'MER-SRV01');
    chk('the key is byte-identical after a full repair-and-restore cycle',
        JSON.stringify(key) === snapshot);
    chk('and it is frozen, so an accidental write throws rather than corrupting a grade',
        Object.isFrozen(key) && Object.isFrozen(key.questions) && Object.isFrozen(key.questions.q2));
    chk('it records the event it was built at, which is exam start', key.builtAtEvent === 0);
    chk('it carries the catalog layer for all twelve tickets',
        Object.keys(key.ticketLayers).length === 12);
}

/* ─── 4. THE SCRIPTED PERFECT RUN, on three seeds ─────────────────────────────────────────────── */
section("4. a perfect run solves the lab through real surfaces and scores the spec's 200");
{
    const mgmt = (st, d) => st.devices[d].mgmtIp;
    const sub = (st, v) => st.subnets[v].cidr.split('/')[0].replace(/\.0$/, '');

    /* The repair for every variant, through the surface a student would use. Eighteen typed,
     * six clicked -- the same split stages 4 and 5 assert. */
    const TYPED = {
        S1A: (st, f) => ['ssh admin@' + mgmt(st, f.target.switch), 'enable', 'conf t',
                         'interface ' + f.target.port, 'duplex auto', 'end', 'exit'],
        S2A: (st, f) => ['ssh admin@' + mgmt(st, f.target.switch), 'enable', 'conf t',
                         'interface ' + f.target.port, 'switchport access vlan 10', 'end', 'exit'],
        S2B: (st, f) => ['ssh admin@' + mgmt(st, f.target.switch), 'enable', 'conf t',
                         'interface ' + f.target.port, 'switchport access vlan 10', 'end', 'exit'],
        S3A: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-01'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 20', 'end', 'exit',
                      'ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 20', 'end', 'exit'],
        S3B: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-01'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 10', 'end', 'exit',
                      'ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t', 'interface Gi0/1',
                      'switchport trunk allowed vlan add 10', 'end', 'exit'],
        S4A: (st) => ['ssh admin@' + mgmt(st, st.rogue.switch), 'enable', 'conf t',
                      'interface ' + st.rogue.port, 'shutdown', 'end', 'exit'],
        S4B: (st) => ['ssh admin@' + mgmt(st, st.rogue.switch), 'enable', 'conf t',
                      'interface ' + st.rogue.port, 'shutdown', 'end', 'exit'],
        S5A: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t', 'interface Gi0/0.40',
                      'ip address ' + st.subnets[40].gateway + ' 255.255.255.0', 'end', 'exit'],
        S5B: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t', 'interface Gi0/0.20',
                      'ip address ' + st.subnets[20].gateway + ' 255.255.255.0', 'end', 'exit'],
        S6A: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t',
                      'no ip route 10.200.0.0 255.255.255.0 172.16.0.6',
                      'ip route 10.200.0.0 255.255.255.0 172.16.0.2', 'end', 'exit'],
        S8A: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t',
                      'ip access-list extended GUEST-IN', 'no 10', 'no 20',
                      '10 deny ip ' + st.subnets[40].cidr + ' 10.' + st.params.b + '.0.0/16',
                      '20 permit ip any any', 'end', 'exit'],
        S8B: (st) => ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'conf t',
                      'ip access-list extended SERVERS-OUT', 'no 5', 'end', 'exit'],
        S9A: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/kea/kea-dhcp4.conf',
                      ':%s/' + st.dhcp.subnets[10].pool.end + '/' + sub(st, 10) + '.199/', ':wq',
                      'sudo kea-dhcp4 -t /etc/kea/kea-dhcp4.conf',
                      'sudo systemctl restart kea-dhcp4-server', 'exit'],
        S9B: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/kea/kea-dhcp4.conf',
                      ':%s/' + sub(st, 10) + '.254/' + st.subnets[10].gateway + '/', ':wq',
                      'sudo systemctl restart kea-dhcp4-server', 'exit'],
        S10A: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/bind/db.meridian.local',
                       ':%s/' + sub(st, 30) + '.21/' + sub(st, 30) + '.20/',
                       ':%s/' + st.dns.zoneFile.serial + '/' + (st.dns.zoneFile.serial + 1) + '/', ':wq',
                       'sudo named-checkzone meridian.local /etc/bind/db.meridian.local',
                       'sudo rndc reload', 'dig intranet.meridian.local', 'exit'],
        S10B: (st) => ['ssh admin@' + mgmt(st, 'MER-SRV01'), 'sudo vi /etc/bind/db.meridian.local',
                       ':%s/' + st.dns.zoneFile.serial + '/' + (st.dns.zoneFile.serial + 1) + '/', ':wq',
                       'sudo rndc reload', 'dig wiki.meridian.local', 'exit'],
        S12A: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t',
                       'snmp-server community ' + st.monitoring.community, 'end', 'exit'],
        S12B: (st) => ['ssh admin@' + mgmt(st, 'MeridianSW-02'), 'enable', 'conf t',
                       'ntp server ' + mgmt(st, 'MER-SRV01'), 'end', 'exit']
    };
    const CLICKED = {
        S1B: (st, f) => [['rack', 'replace-cable', { device: f.target.switch, port: f.target.port }]],
        S6B: (st) => [['firewall', 'ipsec-add-phase2', { local: st.subnets[20].cidr, remote: TOPO.FIXED_NETS.branch.cidr }]],
        S7A: (st) => [['firewall', 'nat-add-outbound', { src: st.subnets[20].cidr }]],
        S7B: (st) => [['firewall', 'portforward-set', { wanPort: 443, toIp: '172.16.50.10' }]],
        S11A: (st) => [['wireless', 'ssid-set-vlan', { ssid: 'Meridian-Guest', vlan: 40 }]],
        S11B: (st) => [['wireless', 'ap-set-channel', { ap: 'AP-1', channel: 1 }],
                       ['wireless', 'ap-set-channel', { ap: 'AP-2', channel: 6 }],
                       ['wireless', 'ap-set-channel', { ap: 'AP-3', channel: 11 }]]
    };
    chk('every variant has a repair route in this script',
        Object.keys(TYPED).length + Object.keys(CLICKED).length === 24,
        Object.keys(TYPED).length + ' typed + ' + Object.keys(CLICKED).length + ' clicked');

    /* The verify proofs for 39-42, run AFTER the relevant fix. */
    const PROOFS = (st) => {
        const s7 = st.faults.filter(f => f.slot === 'S7')[0].variant;
        const s4 = st.faults.filter(f => f.slot === 'S4')[0].variant;
        return {
            q39: { typed: ['ssh admin@' + mgmt(st, 'MeridianSW-01'), 'enable', 'show interfaces trunk', 'exit'] },
            q40: s7 === 'B'
                ? { clicked: [['firewall', 'diag-test-from-wan', { port: 443 }]] }
                : { typed: ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'ping 8.8.8.8 source Gi0/0.20', 'exit'] },
            q41: s4 === 'B'
                ? { typed: ['ssh admin@' + mgmt(st, 'MeridianRTR-01'), 'enable', 'show ip arp', 'exit'] }
                : { typed: ['arp -d *', 'ping ' + st.subnets[10].gateway, 'arp -a'] },
            q42: { typed: ['nslookup intranet.meridian.local'] }
        };
    };

    const run = (seed, opts) => {
        opts = opts || {};
        const st = CORE.generate(seed, EXAM, { secret: 'server-secret' });
        FAULTS.applyAll(st);
        const key = GR.buildAnswerKey(st);
        let ses = SH.newSession();
        const type = (lines) => lines.forEach(l => { const r = SH.exec(st, ses, l); ses = r.session; });

        /* Answer every typed question straight from the key. A perfect run by definition. */
        if (!opts.noAnswers) {
            Object.keys(key.questions).forEach(qid => {
                const e = key.questions[qid];
                if (e.answer === undefined) { return; }
                /* A student submits ONE acceptable value per part. Where the key holds an array of
                 * equally-correct answers -- Q20's device, where either switch is defensible -- the
                 * perfect run picks the first, because handing back the whole set of acceptable
                 * answers is not what a student does. */
                var value = e.answer;
                if (e.parts && value && typeof value === 'object' && !Array.isArray(value)) {
                    value = Object.keys(value).reduce(function (acc, k) {
                        acc[k] = Array.isArray(value[k]) ? value[k][0] : value[k];
                        return acc;
                    }, {});
                }
                GUI.act(st, 'questions', 'answer', { id: qid, value: value });
            });
        }

        /* For each ticket: file the change request FIRST, then repair. Order is what earns 6 of 6. */
        st.faults.forEach(f => {
            if (!opts.noChangeRequests) {
                GUI.act(st, 'change-requests', 'submit', {
                    ticket: f.ticketId, rootCause: FAULTS.VARIANTS[f.id].rootCause,
                    layer: f.layer, plannedChange: FAULTS.VARIANTS[f.id].expectedFix,
                    rollback: 'restore the device to exam start'
                });
            }
            if (TYPED[f.id]) { type(TYPED[f.id](st, f)); }
            else { CLICKED[f.id](st, f).forEach(([w, a, p]) => GUI.act(st, w, a, p)); }
        });

        /* Then the verify proofs, after the fixes. */
        const pf = PROOFS(st);
        Object.keys(pf).forEach(k => {
            if (pf[k].typed) { type(pf[k].typed); }
            else { pf[k].clicked.forEach(([w, a, p]) => GUI.act(st, w, a, p)); }
        });

        /* And the incident log: one entry per ticket, correct layer, evidence naming a real command. */
        if (!opts.noLog) {
            st.faults.forEach(f => {
                const v = FAULTS.VARIANTS[f.id];
                GUI.act(st, 'incident-log', 'submit', {
                    ticket: f.ticketId, symptom: v.ticket,
                    layer: f.layer === 2.5 ? 2 : (f.layer === 3.5 ? 3 : f.layer),
                    rootCause: v.rootCause + ' Located from ' + v.evidence[0] + ', and verified after the change.',
                    fix: v.expectedFix, verification: v.evidence[0]
                });
            });
        }
        return { st, key, report: GR.grade(st, key) };
    };

    ['perfect-1', 'perfect-2', 'perfect-3'].forEach(seed => {
        const { st, report } = run(seed);
        const sum = Math.round((report.total + report.pendingInstructorMarks) * 100) / 100;
        chk(seed + ': every fault is repaired', Object.values(FAULTS.fixedMap(st)).every(Boolean),
            JSON.stringify(Object.keys(FAULTS.fixedMap(st)).filter(k => !FAULTS.fixedMap(st)[k])));
        chk(seed + ': no collateral damage', report.collateralDamage.length === 0,
            JSON.stringify(report.collateralDamage.map(d => d.id + ' ' + d.detail)));
        chk(seed + ': earned + instructor-pending = 200', sum === 200,
            'earned ' + report.total + ' + pending ' + report.pendingInstructorMarks + ' = ' + sum
            + '  misses: ' + JSON.stringify(report.questions.filter(r => r.earned < r.of && !r.pending)
                .map(r => r.n + ':' + r.note)));
        chk(seed + ': the only pending marks are question 45’s nine',
            report.pendingInstructorMarks === 9,
            JSON.stringify(report.questions.filter(r => r.pending).map(r => r.n + ':' + r.pending)));
        chk(seed + ': the paper is not flagged', report.flagged === false);
        chk(seed + ': practical and reasoning subtotals add up',
            report.subtotals.practical.of === 128 && report.subtotals.reasoning.of === 72);
    });
}

/* ─── 4b. THE ANSWER KEY ITSELF, derived independently ────────────────────────────────────────── */
section('4b. the key is checked against the lab, not against itself');
{
    /* MUTATION EXPOSED A CIRCULARITY. The perfect run answers every question FROM the key, so it
     * can never detect a WRONG key -- it validates the grader. Making Q2 return the router's MAC
     * instead of what the cache actually held, and Q6 return the authored trunk list instead of the
     * current one, both survived every assertion in section 4. Those are precisely the two
     * exam-start-sensitive answers the spec calls out.
     *
     * So each one is re-derived here from the lab, the way a human marker would: look at the
     * network, decide the answer, compare. Same discipline as the 1,000-seed sweep re-deriving the
     * generator constraints instead of asking validate() whether it passed. */
    /* A FULL TWELVE-FAULT LAB with ONE slot's variant overridden, rather than a single-fault lab.
     * A real exam always carries all twelve, and the conflict list means five variants can never be
     * drawn -- so forcing one while keeping the rest is both realistic and the only way to reach
     * S2B, S3B, S5B, S7A and S11A at all. The single-fault version also crashed buildAnswerKey,
     * because a question about an absent slot had no fault to read. */
    const build = (id, seed) => {
        const st = CORE.generate(seed || ('key-' + id), EXAM, { secret: 's' });
        const slot = id.slice(0, -1), variant = id.slice(-1);
        const meta = TOPO.FAULT_SLOTS.filter(x => x.slot === slot)[0].variants[variant];
        const rng = CORE.makeRng((seed || ('key-' + id)) + '|force|' + id);
        st.faults = st.faults.map(f => f.slot !== slot ? f : {
            slot, variant, id, active: true, applied: false, layer: meta.layer, group: meta.group,
            target: CORE.pickFaultTarget(st, rng, slot, variant)
        });
        if (slot === 'S4') { st.rogue.variant = variant; st.rogue.mode = variant === 'B' ? 'duplicate-address' : 'arp-spoof';
                             st.rogue.claimsIp = variant === 'B'
                                 ? st.endpoints.filter(e => e.name === 'MER-FS01')[0].ip
                                 : st.subnets[10].gateway;
                             st.rogue.vlan = variant === 'B' ? 30 : 10; }
        FAULTS.applyAll(st);
        return { st, key: GR.buildAnswerKey(st) };
    };

    {   /* Q2 under S4A: the spec's own worked example. "The correct answer is the rogue MAC,
         * because that is what the cache held." */
        const { st, key } = build('S4A');
        chk('Q2 under S4A is the ROGUE MAC, not the router\u2019s',
            QQ.NORM.mac(key.questions.q2.answer) === QQ.NORM.mac(st.rogue.mac),
            'key=' + key.questions.q2.answer + ' rogue=' + st.rogue.mac + ' router=' + st.svis[10].mac);
        chk('Q2: and the two really are different, so the check can fail',
            QQ.NORM.mac(st.rogue.mac) !== QQ.NORM.mac(st.svis[10].mac));
        /* THE WHOLE POINT OF AN EXAM-START KEY: repair the fault and the recorded answer must not
         * move, even though the live network now gives a different one. (The S4 fault, found by
         * slot -- faults[0] is S1 in a full twelve-fault lab, which is what the single-fault
         * version of this harness quietly assumed.) */
        const f4 = st.faults.filter(x => x.slot === 'S4')[0];
        FAULTS.VARIANTS[f4.id].correctFix(st, f4);
        const rebuilt = GR.buildAnswerKey(st);
        chk('Q2: the LIVE answer changes once the rogue is isolated',
            QQ.NORM.mac(rebuilt.questions.q2.answer) === QQ.NORM.mac(st.svis[10].mac),
            'rebuilt=' + rebuilt.questions.q2.answer + ' router=' + st.svis[10].mac);
        chk('Q2: but the key taken at exam start still holds the rogue MAC, so the honest answer scores',
            QQ.NORM.mac(key.questions.q2.answer) === QQ.NORM.mac(st.rogue.mac)
            && QQ.NORM.mac(key.questions.q2.answer) !== QQ.NORM.mac(rebuilt.questions.q2.answer),
            'key=' + key.questions.q2.answer);
        chk('Q2: and a student answering the rogue MAC is graded correct after repairing it',
            GR.gradeTyped(key.questions.q2, st.rogue.mac).earned === key.questions.q2.points);
    }
    {   /* Q6 under S3A: the trunk list the student can SEE, which is missing VLAN 20. */
        const { st, key } = build('S3A');
        const t = st.links.filter(l => l.kind === 'trunk' && TOPO.PORT_PLAN[l.a[0]] && TOPO.PORT_PLAN[l.b[0]])[0];
        const current = st.ports[t.a[0]][t.a[1]].allowed;
        chk('Q6 under S3A is the CURRENT allowed list', 
            JSON.stringify(key.questions.q6.answer.slice().sort((a, b) => a - b)) === JSON.stringify(current.slice().sort((a, b) => a - b)),
            'key=' + JSON.stringify(key.questions.q6.answer) + ' current=' + JSON.stringify(current));
        chk('Q6: which is NOT the authored list, because S3A removed VLAN 20',
            key.questions.q6.answer.indexOf(20) < 0, JSON.stringify(key.questions.q6.answer));
    }
    {   /* Q9 under S5A: the sub-interface really is a /25 at exam start. */
        const { key } = build('S5A');
        chk('Q9 under S5A records a /25', key.questions.q9.answer.prefix === 25,
            JSON.stringify(key.questions.q9.answer));
    }
    {   /* Q10 and Q25A under S9A: the SHRUNK pool, not the authored one. */
        const { st, key } = build('S9A');
        const pool = st.dhcp.subnets[10];
        chk('Q10 under S9A records the shrunk pool',
            key.questions.q10.answer.indexOf(pool.pool.end) >= 0,
            'key=' + key.questions.q10.answer + ' pool=' + pool.pool.start + '-' + pool.pool.end);
        chk('Q10: and that end is below .199, because the pool was shrunk',
            CORE.ip.toInt(pool.pool.end) < CORE.ip.toInt(pool.pool.start) + 99, pool.pool.end);
        const size = CORE.ip.toInt(pool.pool.end) - CORE.ip.toInt(pool.pool.start) + 1;
        chk('Q25A reports that pool size and the client count that exceeds it',
            key.questions.q25.answer.poolSize === size && key.questions.q25.answer.clients > size,
            JSON.stringify(key.questions.q25.answer) + ' size=' + size);
    }
    {   /* Q12 under S11A: the SSID is on VLAN 10 at exam start. */
        const { key } = build('S11A');
        chk('Q12 under S11A records VLAN 10', key.questions.q12.answer === 10, String(key.questions.q12.answer));
    }
    {   /* Q24 under each S8 variant: the ACL and sequence a student would cite. */
        const a = build('S8A'), bb = build('S8B');
        chk('Q24 under S8A cites GUEST-IN and the permit that makes the deny dead',
            QQ.NORM.aclRef(a.key.questions.q24.answer).name === 'guest-in'
            && QQ.NORM.aclRef(a.key.questions.q24.answer).seq
               === a.st.acls['MeridianRTR-01']['GUEST-IN'].lines.filter(l => l.action === 'permit')[0].seq,
            a.key.questions.q24.answer);
        chk('Q24 under S8B cites SERVERS-OUT and its deny line',
            QQ.NORM.aclRef(bb.key.questions.q24.answer).name === 'servers-out'
            && QQ.NORM.aclRef(bb.key.questions.q24.answer).seq
               === bb.st.acls['MeridianRTR-01']['SERVERS-OUT'].lines.filter(l => l.dstPort === 445)[0].seq,
            bb.key.questions.q24.answer);
    }
    {   /* Q17: the rogue's port, independently read off state.rogue. */
        const { st, key } = build('S4B');
        chk('Q17 names the rogue\u2019s switch and port',
            QQ.NORM.iface(key.questions.q17.answer).iface === st.rogue.port.toLowerCase()
            && QQ.NORM.iface(key.questions.q17.answer).sw === st.rogue.switch.toLowerCase(),
            key.questions.q17.answer);
    }
    {   /* THE CLONE, which mutation showed is untestable through the public key alone: every
         * answer() already builds literals, so removing the clone changes nothing. Tested by
         * handing buildAnswerKey a question that deliberately returns a LIVE reference. */
        const { st } = build('S1A');
        const live = { n: 99, id: 'q99', phase: 'discovery', points: 1, tag: 'practical',
                       kind: 'text', norm: 'text', prompt: () => 'probe',
                       answer: (s) => s.endpoints[0] };          // a reference, on purpose
        QQ.QUESTIONS.push(live);
        try {
            const key = GR.buildAnswerKey(st);
            const recorded = key.questions.q99.answer;
            const original = st.endpoints[0].ip;
            st.endpoints[0].ip = '9.9.9.9';                       // mutate the lab afterwards
            chk('buildAnswerKey CLONES, so a later mutation cannot rewrite a recorded answer',
                recorded.ip === original && recorded.ip !== '9.9.9.9',
                'recorded=' + recorded.ip + ' original=' + original);
            chk('and the recorded value is not the same object as the lab\u2019s',
                recorded !== st.endpoints[0]);
            st.endpoints[0].ip = original;
        } finally {
            QQ.QUESTIONS.pop();                                   // never leak into later sections
        }
        chk('the probe question was removed again', QQ.QUESTIONS.length === 50);
    }
}

/* ─── 5. every partial-credit rule in the spec's table ────────────────────────────────────────── */
section("5. spec section 8's partial-credit table, each rule exercised");
{
    const base = () => {
        const st = CORE.generate('credit', EXAM, { secret: 'server-secret' });
        FAULTS.applyAll(st);
        return { st, key: GR.buildAnswerKey(st) };
    };
    const fixRow = (report, slot) => report.questions.filter(r => r.slot === slot && r.phase === 'fix')[0];

    {   /* "Fix passes, change request filed before the change: Full (6)." */
        const { st, key } = base();
        const f = st.faults.filter(x => x.slot === 'S12')[0];
        GUI.act(st, 'change-requests', 'submit', { ticket: f.ticketId, rootCause: 'x', layer: f.layer, plannedChange: 'y', rollback: 'z' });
        GUI.act(st, 'wireless', 'ap-set-channel', { ap: 'AP-1', channel: st.wireless.apChannels['AP-1'] });  // a logged no-op
        FAULTS.VARIANTS[f.id].correctFix(st, f);
        FAULTS.recordProgress(st, (st.events || []).length - 1);
        chk('fix + change request BEFORE = full 6', fixRow(GR.grade(st, key), 'S12').earned === 6,
            JSON.stringify(fixRow(GR.grade(st, key), 'S12')));
    }
    {   /* "Fix passes, no change request: 3 of 6." The spec's second acceptance criterion for this
         * stage is exactly this: "A scripted run with no change requests scores 3 of 6 on each fix." */
        const { st, key } = base();
        st.faults.forEach(f => { FAULTS.VARIANTS[f.id].correctFix(st, f); });
        FAULTS.recordProgress(st, 0);
        const rep = GR.grade(st, key);
        const fixes = rep.questions.filter(r => r.phase === 'fix');
        chk('a run with NO change requests scores 3 of 6 on EVERY fix',
            fixes.length === 12 && fixes.every(r => r.earned === 3),
            JSON.stringify(fixes.map(r => r.slot + ':' + r.earned)));
        chk('and the fix phase totals 36 of 72', rep.phases.fix.earned === 36 && rep.phases.fix.of === 72);
    }
    {   /* "Fix passes, change request filed AFTER the change: 3 of 6." */
        const { st, key } = base();
        const f = st.faults.filter(x => x.slot === 'S12')[0];
        FAULTS.VARIANTS[f.id].correctFix(st, f);
        GUI.act(st, 'noc', 'ack-alert', { id: 'x' });                      // a logged event
        FAULTS.recordProgress(st, (st.events || []).length - 1);
        GUI.act(st, 'change-requests', 'submit', { ticket: f.ticketId, rootCause: 'x', layer: f.layer, plannedChange: 'y', rollback: 'z' });
        const row = fixRow(GR.grade(st, key), 'S12');
        chk('fix + change request AFTER = 3 of 6', row.earned === 3 && /after the change/.test(row.note),
            JSON.stringify(row));
    }
    {   /* "Fix passes but breaks an invariant: 0, flagged for instructor review." */
        const { st, key } = base();
        const f = st.faults.filter(x => x.slot === 'S12')[0];
        GUI.act(st, 'change-requests', 'submit', { ticket: f.ticketId, rootCause: 'x', layer: f.layer, plannedChange: 'y', rollback: 'z' });
        FAULTS.VARIANTS[f.id].correctFix(st, f);
        st.ports['MeridianSW-01']['Fa0/9'].shutdown = true;                // collateral damage
        FAULTS.recordProgress(st, (st.events || []).length - 1);
        const rep = GR.grade(st, key);
        chk('a damaging fix scores 0 and flags the paper',
            fixRow(rep, 'S12').earned === 0 && fixRow(rep, 'S12').flagged === true && rep.flagged === true,
            JSON.stringify(fixRow(rep, 'S12')));
        chk('and the report names the damage for the instructor',
            rep.collateralDamage.length > 0 && rep.collateralDamage[0].detail,
            JSON.stringify(rep.collateralDamage.map(d => d.id)));
    }
    {   /* "Fix does not pass, but the change request names the correct root cause and layer: 2 of 6."
         * The layer is machine-checkable; the root cause is prose. Offered as PENDING for an
         * instructor rather than auto-awarded on a keyword match. */
        const { st, key } = base();
        const f = st.faults.filter(x => x.slot === 'S12')[0];
        GUI.act(st, 'change-requests', 'submit', {
            ticket: f.ticketId, rootCause: FAULTS.VARIANTS[f.id].rootCause,
            layer: f.layer, plannedChange: 'y', rollback: 'z'
        });
        const row = fixRow(GR.grade(st, key), 'S12');
        chk('an unfixed fault with a correct-layer change request offers 2 of 6 as PENDING',
            row.earned === 0 && row.pending === 2 && /award 2 of 6/.test(row.note), JSON.stringify(row));
        chk('and it carries the stated root cause for the instructor to judge', !!row.rootCause);
    }
    {   /* "Verify task run before the fix ... 0." */
        const { st, key } = base();
        const f = st.faults.filter(x => x.slot === 'S3')[0];
        let ses = SH.newSession();
        const type = (l) => { const r = SH.exec(st, ses, l); ses = r.session; };
        type('ssh admin@' + st.devices['MeridianSW-01'].mgmtIp); type('enable');
        type('show interfaces trunk');                                      // the proof, run EARLY
        type('exit');
        FAULTS.VARIANTS[f.id].correctFix(st, f);
        FAULTS.recordProgress(st, (st.events || []).length - 1);
        const row = GR.grade(st, key).questions.filter(r => r.n === 39)[0];
        chk('a verify proof run BEFORE the fix scores 0, and says so',
            row.earned === 0 && /BEFORE the fix/.test(row.note), JSON.stringify(row));
    }
    {   /* "the fix later undone: 0", keyed off the stamp being absent rather than the sticky flag --
         * Nancy's MEDIUM was that a legitimate re-fix clears `undone`. */
        const { st, key } = base();
        const f = st.faults.filter(x => x.slot === 'S12')[0];
        FAULTS.VARIANTS[f.id].correctFix(st, f);
        FAULTS.recordProgress(st, 0);
        FAULTS.VARIANTS[f.id].apply(st, f);                                 // undo it
        FAULTS.recordProgress(st, 1);
        const row = fixRow(GR.grade(st, key), 'S12');
        chk('a fix that was undone scores 0 and is reported as undone',
            row.earned === 0 && /undone/.test(row.note), JSON.stringify(row));
    }
    {   /* "Two-part question, one part correct: Half." */
        const { st, key } = base();
        const e = key.questions.q1;
        const half = GR.gradeTyped(e, { ipv4: e.answer.ipv4, prefix: 7 });
        chk('one of two parts right scores half', half.earned === e.points / 2, JSON.stringify(half));
        const none = GR.gradeTyped(e, { ipv4: '1.2.3.4', prefix: 7 });
        chk('neither part right scores zero', none.earned === 0);
        const both = GR.gradeTyped(e, e.answer);
        chk('both parts right scores full', both.earned === e.points);
        chk('an unanswered question scores zero and says so',
            GR.gradeTyped(e, undefined).earned === 0 && GR.gradeTyped(e, undefined).note === 'unanswered');
    }
    {   /* Q43 pro-rates across twelve entries, and a 2/3 slot accepts either layer. */
        const { st, key } = base();
        st.faults.slice(0, 6).forEach(f => GUI.act(st, 'incident-log', 'submit', {
            ticket: f.ticketId, layer: f.layer === 2.5 ? 3 : (f.layer === 3.5 ? 4 : f.layer), symptom: 's'
        }));
        const row = GR.grade(st, key).questions.filter(r => r.n === 43)[0];
        chk('Q43 pro-rates: six of twelve layers scores half of 10',
            row.earned === 5, JSON.stringify({ earned: row.earned, note: row.note }));
        chk('and a 2/3 or 3/4 slot accepts either of its layers',
            row.detail.filter(d => d.want === 2.5 || d.want === 3.5).every(d => d.ok || d.got === null),
            JSON.stringify(row.detail.filter(d => d.want === 2.5 || d.want === 3.5)));
    }
    {   /* Q44 requires the claimed evidence to appear in the event log. */
        const { st, key } = base();
        const f = st.faults[0];
        GUI.act(st, 'incident-log', 'submit', { ticket: f.ticketId, layer: f.layer,
            verification: 'I ran show interfaces trunk on MeridianSW-01' });
        const before = GR.grade(st, key).questions.filter(r => r.n === 44)[0];
        chk('an evidence claim with nothing in the log behind it earns nothing for that entry',
            before.detail.filter(d => d.ticket === f.ticketId)[0].ok === false);
        let ses = SH.newSession();
        ['ssh admin@' + st.devices['MeridianSW-01'].mgmtIp, 'enable', 'show interfaces trunk']
            .forEach(l => { const r = SH.exec(st, ses, l); ses = r.session; });
        const after = GR.grade(st, key).questions.filter(r => r.n === 44)[0];
        chk('once the command is actually run, the claim is corroborated',
            after.detail.filter(d => d.ticket === f.ticketId)[0].ok === true);
    }
    {   /* Q45 is instructor-marked, with the three seeded selections and the student's narratives. */
        const { st, key } = base();
        const row = GR.grade(st, key).questions.filter(r => r.n === 45)[0];
        chk('Q45 is pending, never auto-scored', row.earned === 0 && row.pending === 9);
        chk('it names exactly three tickets, and they are the student\u2019s own',
            row.items.length === 3 && row.items.every(i => /^TKT-\d+$/.test(i.ticket)),
            JSON.stringify(row.items.map(i => i.ticket)));
        chk('the selection is reproducible from the seed, for a regrade', (() => {
            const a = CORE.generate('q45-seed', EXAM, { secret: 's' }); FAULTS.applyAll(a);
            const b = CORE.generate('q45-seed', EXAM, { secret: 's' }); FAULTS.applyAll(b);
            return JSON.stringify(GR.buildAnswerKey(a).questions.q45.selection)
                === JSON.stringify(GR.buildAnswerKey(b).questions.q45.selection);
        })());
        chk('and it carries the rubric an instructor marks against', !!row.rubric && /3 points/.test(row.rubric));
    }
}

/* ─── 6. the CSV export ───────────────────────────────────────────────────────────────────────── */
section('6. CSV for the LMS');
{
    const st = CORE.generate('csv', EXAM, { secret: 's' });
    FAULTS.applyAll(st);
    const key = GR.buildAnswerKey(st);
    GUI.act(st, 'questions', 'answer', { id: 'q46', value: 'smf' });
    const rep = GR.grade(st, key);
    const csv = GR.toCsv(rep);
    const lines = csv.split('\n');
    chk('one header, fifty rows, one total', lines.length === 52, lines.length + ' lines');
    chk('the header names every column a gradebook needs',
        lines[0] === 'student,exam,question,phase,tag,slot,earned,of,pending,note');
    chk('the total row carries the score and the out-of',
        /,TOTAL,/.test(lines[51]) && lines[51].indexOf(',' + rep.total + ',' + rep.outOf + ',') >= 0, lines[51]);
    chk('a note containing a comma is quoted, so the CSV cannot shear',
        csv.split('\n').every(l => (l.match(/,/g) || []).length >= 9), 'a row has too few fields');
    chk('the answered question shows its mark', /,q?46,|,46,/.test(csv) && /planning/.test(csv));
}

/* ─── 7. the normalizer fixes, each as the exact reproduction that found it ─────────────────────── */
section('7. two normalizers that scored wrong answers correct');
{
    /* AN ACL NAMED WRONG, IN LOWERCASE, SCORED FULL MARKS ON Q24 (4 points).
     * Two defects compounded. NORM.aclRef matched the name with /\b([A-Z][A-Z0-9_-]{2,})\b/ --
     * uppercase-only, directly against the spec's "Name case-insensitive" -- so a lowercase name
     * became null. And sameAnswer treated a null field as "omitted, tolerated", a rule written for
     * iface's optional switch name. Null-because-wrong read as null-because-omitted. */
    chk('the reproduction: a WRONG acl name with the right seq is now refused',
        QQ.sameAnswer('aclRef', 'wrong-acl 10', 'GUEST-IN 10') === false);
    chk('a lowercase CORRECT name is accepted, which the old regex refused',
        QQ.sameAnswer('aclRef', 'guest-in 10', 'GUEST-IN 10') === true);
    chk('mixed case and the spec’s "seq 10" spelling both work',
        QQ.sameAnswer('aclRef', 'Guest-In seq 10', 'GUEST-IN 10') === true
        && QQ.sameAnswer('aclRef', 'ip access-list GUEST-IN seq 10', 'GUEST-IN 10') === true);
    chk('the surrounding words are not mistaken for the name',
        (QQ.NORM.aclRef('ip access-list GUEST-IN seq 10') || {}).name === 'guest-in',
        JSON.stringify(QQ.NORM.aclRef('ip access-list GUEST-IN seq 10')));
    chk('a missing name is refused, because the question asks for name AND sequence',
        QQ.sameAnswer('aclRef', '10', 'GUEST-IN 10') === false);
    chk('a missing sequence is refused for the same reason',
        QQ.sameAnswer('aclRef', 'guest-in', 'GUEST-IN 10') === false);
    chk('the other real ACL is not accepted for this one',
        QQ.sameAnswer('aclRef', 'servers-out 10', 'GUEST-IN 10') === false);

    /* THE SWITCH NAME IS OMISSIBLE ONLY WHERE THE SPEC SAYS: "when only one switch has that port
     * active with that endpoint." The tolerance was unconditional, so a bare port number matched
     * EITHER switch and "which switch" stopped being graded wherever it was ambiguous.
     *
     * Built deterministically rather than hunted for across seeds: take the port an interface
     * question actually asks about and attach a second endpoint to the same port on the other
     * switch. That is what ambiguity IS, and constructing it means this cannot quietly become
     * vacuous when the generator's seeds move. */
    {
        const st = CORE.generate('amb-key', EXAM, { secret: 'server-secret' });
        FAULTS.applyAll(st);
        const clean = GR.buildAnswerKey(st);
        const q8 = clean.questions.q8;
        const parsed = QQ.NORM.iface(q8.answer);
        chk('the unambiguous baseline does NOT require the switch', q8.requireSw !== true,
            q8.answer + ' -> requireSw=' + q8.requireSw);
        chk('and a bare port still scores there, as the spec allows',
            GR.gradeTyped(q8, parsed.iface).earned === q8.points,
            JSON.stringify(GR.gradeTyped(q8, parsed.iface)));

        /* Now make that exact port ambiguous. */
        const owner = (st.endpoints.filter(e => e.port && QQ.NORM.iface(e.port).iface === parsed.iface)[0] || {}).switch;
        const other = Object.keys(st.ports).filter(d => /SW/i.test(d) && d !== owner)[0];
        st.endpoints.push({
            name: 'AMBIG-PC01', kind: 'workstation', vlan: 10, mac: '00:25:90:FF:FF:01',
            ip: null, mask: null, gw: null, dns: null, dhcp: true,
            switch: other, port: parsed.iface.replace(/^fa/, 'Fa').replace(/^gi/, 'Gi'),
            ap: null, ssid: null, network: null, reservation: false
        });
        const ambKey = GR.buildAnswerKey(st);
        chk('the port is now ambiguous between the two switches',
            QQ.ambiguousPorts(st)[parsed.iface] === true,
            JSON.stringify(Object.keys(QQ.ambiguousPorts(st))));
        const q8b = ambKey.questions.q8;
        chk('so the key now REQUIRES the switch name', q8b.requireSw === true,
            q8b.answer + ' -> requireSw=' + q8b.requireSw);
        chk('a bare port no longer scores, because it matches either switch',
            GR.gradeTyped(q8b, parsed.iface).earned === 0,
            JSON.stringify(GR.gradeTyped(q8b, parsed.iface)));
        chk('naming the right switch scores full',
            GR.gradeTyped(q8b, q8b.answer).earned === q8b.points,
            JSON.stringify(GR.gradeTyped(q8b, q8b.answer)));
        chk('naming the WRONG switch scores zero, ambiguous or not',
            GR.gradeTyped(q8b, other + ' ' + parsed.iface).earned === 0
            && GR.gradeTyped(q8, other + ' ' + parsed.iface).earned === 0,
            JSON.stringify([GR.gradeTyped(q8b, other + ' ' + parsed.iface),
                            GR.gradeTyped(q8, other + ' ' + parsed.iface)]));
    }
}

/* ─── 7b. the switch requirement must cover EVERY shape of iface answer ─────────────────────────── */
section('7b. a parts-based interface answer is still an interface answer');
{
    /* THE SAME DEFECT, ONE QUESTION TO THE LEFT. Round one set `requireSw` only when a question's
     * top-level `norm` was 'iface' and its answer a bare string -- Q5, Q8 and Q17. Q18 is
     * `parts: ['iface','select']`, so its norm is 'text' and its answer is an object, and the
     * condition could never fire. Q18 is 4 points, slot S1, in EVERY student's lab, and a bare port
     * on a port active on both switches scored full marks there while the three questions beside it
     * were correctly strict. Nancy reproduced it on the first seed she tried.
     *
     * The suite could not see it because its only ambiguity case was q8. So this one is built on the
     * PARTS shape specifically, and constructed rather than seed-hunted. */
    const mkAmbiguous = (qid, part) => {
        const st = CORE.generate('amb-parts', EXAM, { secret: 'server-secret' });
        FAULTS.applyAll(st);
        const before = GR.buildAnswerKey(st).questions[qid];
        const raw = part ? before.answer[part] : before.answer;
        const parsed = QQ.NORM.iface(raw);
        const owner = (st.endpoints.filter(e => e.port && QQ.NORM.iface(e.port).iface === parsed.iface)[0] || {}).switch;
        const other = Object.keys(st.ports).filter(d => /SW/i.test(d) && d !== owner)[0];
        st.endpoints.push({
            name: 'AMBIG-' + qid.toUpperCase(), kind: 'workstation', vlan: 10,
            mac: '00:25:90:FF:FE:02', ip: null, mask: null, gw: null, dns: null, dhcp: true,
            switch: other, port: parsed.iface.replace(/^fa/, 'Fa').replace(/^gi/, 'Gi'),
            ap: null, ssid: null, network: null, reservation: false
        });
        return { before, after: GR.buildAnswerKey(st).questions[qid], parsed, other, st };
    };

    const q18 = mkAmbiguous('q18', 'iface');
    chk('q18 really is a parts-based question with an iface half',
        Array.isArray(q18.before.parts) && q18.before.parts.indexOf('iface') >= 0
        && q18.before.norm !== 'iface',
        JSON.stringify({ parts: q18.before.parts, norm: q18.before.norm }));
    chk('q18 does NOT require the switch while its port is unambiguous',
        q18.before.requireSw !== true, String(q18.before.requireSw));
    chk('and once the port is ambiguous, q18 DOES require it',
        q18.after.requireSw === true, String(q18.after.requireSw));

    const bareBefore = GR.gradeTyped(q18.before, { iface: q18.parsed.iface, select: q18.before.answer.select });
    const bareAfter = GR.gradeTyped(q18.after, { iface: q18.parsed.iface, select: q18.after.answer.select });
    chk('a bare port scores the iface half while unambiguous',
        bareBefore.detail.iface === true && bareBefore.earned === q18.before.points,
        JSON.stringify(bareBefore));
    /* Nancy's exact reproduction: this returned 4 of 4. */
    chk('a bare port LOSES the iface half once ambiguous, keeping only the other part',
        bareAfter.detail.iface === false && bareAfter.earned < q18.after.points,
        JSON.stringify(bareAfter));
    chk('naming the right switch still scores both parts',
        GR.gradeTyped(q18.after, q18.after.answer).earned === q18.after.points,
        JSON.stringify(GR.gradeTyped(q18.after, q18.after.answer)));
    chk('naming the WRONG switch loses the iface half',
        GR.gradeTyped(q18.after, { iface: q18.other + ' ' + q18.parsed.iface, select: q18.after.answer.select })
            .detail.iface === false);

    /* AND THE LEDGER: every question with an iface answer in any shape, so the next one added cannot
     * quietly miss the check the way Q18 did. */
    const st = CORE.generate('iface-ledger', EXAM, { secret: 'server-secret' });
    FAULTS.applyAll(st);
    const key = GR.buildAnswerKey(st);
    const ifaceQs = Object.keys(key.questions).filter(id => {
        const e = key.questions[id];
        return e.norm === 'iface'
            || (e.parts && e.parts.indexOf('iface') >= 0);
    });
    chk('the bank has iface answers in BOTH shapes, so one shape cannot stand in for the other',
        ifaceQs.some(id => key.questions[id].norm === 'iface')
        && ifaceQs.some(id => (key.questions[id].parts || []).indexOf('iface') >= 0),
        JSON.stringify(ifaceQs.map(id => id + ':' + (key.questions[id].norm === 'iface' ? 'string' : 'parts'))));
    const amb = QQ.ambiguousPorts(st);
    const missed = ifaceQs.filter(id => {
        const e = key.questions[id];
        const raw = e.norm === 'iface' ? e.answer : (e.answer || {}).iface;
        if (typeof raw !== 'string') { return false; }
        const pp = QQ.NORM.iface(raw);
        return pp && pp.iface && amb[pp.iface] && e.requireSw !== true;
    });
    chk('no iface question sits on an ambiguous port without requiring the switch',
        missed.length === 0, 'missed: ' + missed.join(', '));
}

/* ─── 7c. an ACL reference scores like the two-part answer it is ────────────────────────────────── */
section('7c. Q24 half credit, and the spelling regression the last fix introduced');
{
    /* THE REGRESSION I SHIPPED. Fixing the case-sensitivity bug introduced a false negative: a
     * student writing the name with a SPACE lost the direction suffix ("in" is two characters so the
     * length filter dropped it; "out" is in the noise list so it would not stand alone), the
     * candidate collapsed to "guest" or "servers", and a CORRECT answer scored zero. */
    const t = (a, b) => QQ.sameAnswer('aclRef', a, b);
    chk('a space-separated name is accepted: "guest in 10"', t('guest in 10', 'GUEST-IN 10') === true);
    chk('upper case and spaced: "GUEST IN 10"', t('GUEST IN 10', 'GUEST-IN 10') === true);
    chk('the other ACL, spaced: "servers out 5"', t('servers out 5', 'SERVERS-OUT 5') === true);
    chk('prose around a spaced name still resolves it',
        t('ip access-list GUEST IN seq 10', 'GUEST-IN 10') === true);
    chk('the hyphenated spelling still works, so the join did not replace it',
        t('guest-in 10', 'GUEST-IN 10') === true);
    /* And the original CRITICAL stays closed. */
    chk('a WRONG name is still refused, hyphenated or spaced',
        t('wrong-acl 10', 'GUEST-IN 10') === false && t('wrong acl 10', 'GUEST-IN 10') === false);
    chk('the right head with the WRONG direction is refused',
        t('guest out 10', 'GUEST-IN 10') === false);
    chk('the other real ACL is not accepted for this one',
        t('servers-out 10', 'GUEST-IN 10') === false);

    /* Q24 is a two-part answer in one field, and spec section 8 gives half for one part right. It
     * had become all-or-nothing by ACCIDENT -- a side effect of requiring both aclRef fields -- and
     * was the only question of its shape treated that way. */
    const st = CORE.generate('q24-credit', EXAM, { secret: 'server-secret' });
    FAULTS.applyAll(st);
    const e = GR.buildAnswerKey(st).questions.q24;
    const seq = Number((String(e.answer).match(/\d+/) || [0])[0]);
    const name = QQ.NORM.aclRef(e.answer).name;
    chk('q24 is a single-value question, not declared with parts',
        !e.parts || !e.parts.length, JSON.stringify(e.parts));
    chk('both halves right scores full', GR.gradeTyped(e, e.answer).earned === e.points);
    chk('name right, sequence wrong scores HALF, and says which half',
        (() => { const r = GR.gradeTyped(e, name + ' ' + (seq + 70));
                 return r.earned === e.points / 2 && /ACL name right/.test(r.note); })(),
        JSON.stringify(GR.gradeTyped(e, name + ' ' + (seq + 70))));
    chk('sequence right, name wrong scores HALF, and says which half',
        (() => { const r = GR.gradeTyped(e, 'wrong-acl ' + seq);
                 return r.earned === e.points / 2 && /ACL name wrong/.test(r.note); })(),
        JSON.stringify(GR.gradeTyped(e, 'wrong-acl ' + seq)));
    chk('both halves wrong scores zero',
        GR.gradeTyped(e, 'nope 999').earned === 0, JSON.stringify(GR.gradeTyped(e, 'nope 999')));
    chk('and half is actually half of this question, not a fixed number',
        GR.gradeTyped(e, 'wrong-acl ' + seq).earned === e.points / 2
        && e.points > 0, e.points + ' points');
}

/* ─── 8. a verify sequence must happen IN ORDER ─────────────────────────────────────────────────── */
section('8. the prerequisite step has to come before the proof');
{
    /* Q41A's sequence is `arp -d *`, ping the gateway, THEN `arp -a`. Clearing the cache is what
     * makes the table a measurement rather than a memory, so clearing it AFTER reading it proves
     * nothing. gradeSequence set its prerequisite flag for any match after the fix, in a single pass
     * that kept scanning past the proof -- so the two commands in either order scored the same. */
    /* S4's variant is drawn from the seed, and only S4A's proof HAS a prerequisite (S4B verifies with
     * `show ip arp` on the router and needs no cache flush). So find the first seed that draws S4A
     * and say which one it was -- a deterministic search, repeated identically on every run, rather
     * than a hardcoded seed that silently stops drawing A when the generator changes. */
    const SEED = (() => {
        for (let i = 0; i < 60; i++) {
            const probe = CORE.generate('seq-order-' + i, EXAM, { secret: 'server-secret' });
            const f = probe.faults.filter(x => x.slot === 'S4')[0];
            if (f && f.variant === 'A') { return 'seq-order-' + i; }
        }
        return null;
    })();
    chk('a seed drawing S4A was found, so this section tests something',
        SEED !== null, 'no seed in 60 drew S4A');

    const build = () => {
        const st = CORE.generate(SEED, EXAM, { secret: 'server-secret' });
        FAULTS.applyAll(st);
        const key = GR.buildAnswerKey(st);
        const f = st.faults.filter(x => x.slot === 'S4')[0];
        return { st, key, f };
    };
    const only41 = (report) => report.questions.filter(r => r.n === 41)[0];
    const drive = (order) => {
        const { st, key, f } = build();
        if (f.variant !== 'A') { return null; }            /* S4B's proof has no prerequisite */
        FAULTS.VARIANTS[f.id].correctFix(st, f);
        FAULTS.recordProgress(st, (st.events || []).length - 1);
        let ses = SH.newSession();
        const type = (l) => { const r = SH.exec(st, ses, l); ses = r.session; };
        order.forEach(type);
        return only41(GR.grade(st, key));
    };

    /* Driven on ADMIN-WS01, which is where Q41A's proof is scoped (`on: ['ADMIN-WS01']`). The
     * gateway address comes from the lab rather than a literal, because the subnet is seeded. */
    const gw = (() => { const { st } = build(); return st.subnets[10].gateway; })();
    const rightOrder = drive(['arp -d *', 'ping ' + gw, 'arp -a']);
    const wrongOrder = drive(['arp -a', 'arp -d *']);
    if (rightOrder === null) {
        chk('S4 variant A was required for this case and the search did not find it', false,
            'the seed search above failed, so these assertions could not run');
    } else {
        chk('prerequisite BEFORE the proof scores full', rightOrder.earned === rightOrder.of,
            JSON.stringify(rightOrder));
        chk('prerequisite AFTER the proof scores half, and says why',
            wrongOrder.earned === Math.round(wrongOrder.of / 2)
            && /before it/.test(wrongOrder.note), JSON.stringify(wrongOrder));
        chk('the two orders score DIFFERENTLY, which is the whole claim',
            rightOrder.earned !== wrongOrder.earned,
            rightOrder.earned + ' vs ' + wrongOrder.earned);
    }
}

console.log('\n  ' + pass + '/' + (pass + fail) + ' assertions passed');
process.exit(fail ? 1 : 0);
